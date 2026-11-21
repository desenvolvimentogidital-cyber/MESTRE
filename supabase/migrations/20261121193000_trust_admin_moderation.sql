-- ConectaServ: moderated reviews, professional verification, reports and role-based admin access.
-- A first moderator is never self-appointed: the owner must grant membership using a privileged SQL session.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.admin_members (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_members enable row level security;
revoke all on public.admin_members from public, anon, authenticated;
grant select on public.admin_members to authenticated;
drop policy if exists admin_members_read_self on public.admin_members;
create policy admin_members_read_self on public.admin_members
  for select to authenticated using (user_id=(select auth.uid()));

create or replace function private.is_moderator()
returns boolean language sql stable security definer set search_path=''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.admin_members where user_id=(select auth.uid())
  );
$$;
revoke all on function private.is_moderator() from public, anon, authenticated;
grant execute on function private.is_moderator() to authenticated;

create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null unique references public.provider_profiles(user_id) on delete cascade,
  note text not null check (length(btrim(note)) between 20 and 500),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  admin_note text
);
alter table public.verification_requests enable row level security;
revoke all on public.verification_requests from public, anon, authenticated;
grant select on public.verification_requests to authenticated;
create policy verification_requests_read on public.verification_requests
  for select to authenticated
  using (provider_id=(select auth.uid()) or (select private.is_moderator()));

alter table public.reports
  add column if not exists review_id uuid references public.reviews(id) on delete set null,
  add column if not exists resolution_note text,
  add column if not exists resolved_by uuid references public.profiles(id) on delete set null,
  add column if not exists resolved_at timestamptz;
alter table public.reports
  add constraint reports_has_valid_target check (
    reported_user_id is not null or request_id is not null or review_id is not null
  ),
  add constraint reports_reason_length check (
    length(btrim(reason)) between 3 and 80
    and (details is null or length(details) between 1 and 1500)
  );
revoke insert, update, delete on public.reports from authenticated;
grant insert (reporter_id,reported_user_id,request_id,review_id,reason,details)
  on public.reports to authenticated;
drop policy if exists reports_reporter_create on public.reports;
create policy reports_reporter_create on public.reports for insert to authenticated
with check (
  reporter_id=(select auth.uid()) and status='open'
  and (reported_user_id is null or reported_user_id <> (select auth.uid()))
  and (reported_user_id is not null or request_id is not null or review_id is not null)
);
drop policy if exists reports_moderator_read on public.reports;
create policy reports_moderator_read on public.reports
  for select to authenticated using ((select private.is_moderator()));

alter table public.reviews add column if not exists is_visible boolean not null default true;
alter table public.reviews add constraint reviews_comment_length check (
  comment is null or length(comment) <= 1000
);
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews for select to anon, authenticated
using (is_visible=true or client_id=(select auth.uid()) or (select private.is_moderator()));

-- Only privileged trigger code can recalculate ratings. The user cannot supply an average.
create or replace function private.recalculate_provider_rating()
returns trigger language plpgsql security definer set search_path=''
as $$
declare v_provider uuid;
begin
  v_provider := case when TG_OP='DELETE' then OLD.provider_id else NEW.provider_id end;
  perform 1 from public.provider_profiles where user_id=v_provider for update;
  update public.provider_profiles pp
  set review_count=coalesce((select count(*) from public.reviews r where r.provider_id=v_provider and r.is_visible),0),
      average_rating=coalesce((select round(avg(r.rating)::numeric,2) from public.reviews r where r.provider_id=v_provider and r.is_visible),0),
      updated_at=now()
  where pp.user_id=v_provider;
  return null;
end;
$$;
revoke all on function private.recalculate_provider_rating() from public, anon, authenticated;
drop trigger if exists trg_provider_rating_on_review on public.reviews;
create trigger trg_provider_rating_on_review
  after insert or delete or update of is_visible on public.reviews
  for each row execute function private.recalculate_provider_rating();

create or replace function public.request_provider_verification(p_note text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_actor uuid:=(select auth.uid()); v_status text;
begin
  if v_actor is null then raise exception 'Você precisa entrar na sua conta.' using errcode='42501'; end if;
  if p_note is null or length(btrim(p_note)) not between 20 and 500 then
    raise exception 'Descreva sua experiência em 20 a 500 caracteres.' using errcode='22023';
  end if;
  if not exists (
    select 1 from public.provider_profiles
    where user_id=v_actor and is_active=true and is_verified=false
  ) then raise exception 'Seu perfil precisa estar ativo e ainda não verificado.' using errcode='42501'; end if;
  select status into v_status from public.verification_requests where provider_id=v_actor for update;
  if v_status in ('pending','approved') then
    raise exception 'Já existe uma solicitação de verificação em análise ou aprovada.' using errcode='P0001';
  end if;
  insert into public.verification_requests(provider_id,note,status)
  values (v_actor,btrim(p_note),'pending')
  on conflict (provider_id) do update set
    note=excluded.note,status='pending',updated_at=now(),reviewed_at=null,reviewed_by=null,admin_note=null;
  return true;
end;
$$;
revoke all on function public.request_provider_verification(text) from public, anon, authenticated;
grant execute on function public.request_provider_verification(text) to authenticated;

create or replace function public.admin_review_verification(
  p_verification_id uuid,p_decision text,p_note text default null
) returns boolean language plpgsql security definer set search_path=''
as $$
declare v_provider uuid; v_status text;
begin
  if not private.is_moderator() then
    raise exception 'Acesso restrito à administração.' using errcode='42501';
  end if;
  if p_decision not in ('approved','rejected') or p_decision is null then
    raise exception 'Escolha aprovação ou recusa.' using errcode='22023';
  end if;
  if length(coalesce(p_note,''))>800 then
    raise exception 'Justificativa muito longa.' using errcode='22023';
  end if;
  select provider_id,status into v_provider,v_status from public.verification_requests
    where id=p_verification_id for update;
  if v_provider is null or v_status <> 'pending' then
    raise exception 'Solicitação não está pendente.' using errcode='P0001';
  end if;
  if v_provider=(select auth.uid()) then
    raise exception 'Um administrador não pode aprovar a própria verificação.' using errcode='42501';
  end if;
  update public.provider_profiles
  set is_verified=(p_decision='approved'),updated_at=now()
  where user_id=v_provider and is_active=true;
  if not found then raise exception 'Perfil inativo ou inexistente.' using errcode='P0001'; end if;
  update public.verification_requests
  set status=p_decision,updated_at=now(),reviewed_at=now(),
      reviewed_by=(select auth.uid()),admin_note=nullif(btrim(coalesce(p_note,'')),'')
  where id=p_verification_id;
  return true;
end;
$$;
revoke all on function public.admin_review_verification(uuid,text,text) from public, anon, authenticated;
grant execute on function public.admin_review_verification(uuid,text,text) to authenticated;

create or replace function public.admin_moderate_report(
  p_report_id uuid,p_action text,p_note text default null
) returns boolean language plpgsql security definer set search_path=''
as $$
declare v_report public.reports%rowtype;
begin
  if not private.is_moderator() then
    raise exception 'Acesso restrito à administração.' using errcode='42501';
  end if;
  if p_action not in ('resolve','dismiss','suspend_provider','restore_provider','cancel_request','hide_review') or p_action is null then
    raise exception 'Ação inválida.' using errcode='22023';
  end if;
  if length(coalesce(p_note,''))>800 then raise exception 'Justificativa muito longa.' using errcode='22023'; end if;
  select * into v_report from public.reports where id=p_report_id for update;
  if not found or v_report.status in ('resolved','dismissed') then
    raise exception 'A denúncia já foi analisada ou não existe.' using errcode='P0001';
  end if;

  if p_action in ('suspend_provider','restore_provider') then
    if v_report.reported_user_id is null then raise exception 'Denúncia sem profissional vinculado.' using errcode='22023'; end if;
    update public.provider_profiles
    set is_active=(p_action='restore_provider'),
        is_verified=case when p_action='suspend_provider' then false else is_verified end,
        updated_at=now()
    where user_id=v_report.reported_user_id;
    if not found then raise exception 'Profissional não encontrado.' using errcode='P0002'; end if;
  elsif p_action='cancel_request' then
    if v_report.request_id is null then raise exception 'Denúncia sem pedido vinculado.' using errcode='22023'; end if;
    update public.service_requests set status='cancelled',updated_at=now()
      where id=v_report.request_id and status in ('draft','published');
    if not found then
      raise exception 'Somente pedidos ainda não contratados podem ser cancelados.' using errcode='P0001';
    end if;
    update public.proposals set status='rejected',updated_at=now()
      where request_id=v_report.request_id and status='sent';
  elsif p_action='hide_review' then
    if v_report.review_id is null then raise exception 'Denúncia sem avaliação vinculada.' using errcode='22023'; end if;
    update public.reviews set is_visible=false where id=v_report.review_id and is_visible=true;
    if not found then raise exception 'Avaliação já oculta ou inexistente.' using errcode='P0001'; end if;
  end if;

  update public.reports set
    status=case when p_action='dismiss' then 'dismissed' else 'resolved' end,
    resolved_by=(select auth.uid()),resolved_at=now(),
    resolution_note=nullif(btrim(coalesce(p_note,'')),'')
  where id=p_report_id;
  return true;
end;
$$;
revoke all on function public.admin_moderate_report(uuid,text,text) from public, anon, authenticated;
grant execute on function public.admin_moderate_report(uuid,text,text) to authenticated;

-- Administrative membership is deliberately empty until a real user signs up.
-- Assign from a privileged SQL session ONLY after confirming the account identity:
-- insert into public.admin_members(user_id) values ('<confirmed auth.users.id>');
