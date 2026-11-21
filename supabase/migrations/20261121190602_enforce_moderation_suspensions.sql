-- Make administrative suspensions durable: providers cannot reactivate themselves.
alter table public.provider_profiles add column if not exists is_suspended boolean not null default false;
revoke update (is_suspended) on public.provider_profiles from authenticated;

drop policy if exists provider_profiles_update_own on public.provider_profiles;
create policy provider_profiles_update_own on public.provider_profiles
for update to authenticated
using (user_id=(select auth.uid()))
with check (
  user_id=(select auth.uid()) and (not is_suspended or is_active=false)
);

drop policy if exists provider_profiles_public_read on public.provider_profiles;
create policy provider_profiles_public_read on public.provider_profiles
for select to anon, authenticated
using ((is_active=true and is_suspended=false) or user_id=(select auth.uid()));

create policy provider_profiles_admin_read on public.provider_profiles
for select to authenticated using ((select private.is_moderator()));

drop policy if exists proposals_insert_provider on public.proposals;
create policy proposals_insert_provider on public.proposals for insert to authenticated
with check (
  provider_id = (select auth.uid()) and status='sent'
  and exists (
    select 1 from public.provider_profiles pp
    join public.service_requests r on r.id=proposals.request_id
    where pp.user_id=(select auth.uid())
      and pp.is_active=true and pp.is_suspended=false
      and r.status='published' and r.client_id<>(select auth.uid())
      and (
        not exists (select 1 from public.provider_categories pc where pc.provider_id=(select auth.uid()))
        or exists (select 1 from public.provider_categories pc
          where pc.provider_id=(select auth.uid()) and pc.category_id=r.category_id)
      )
  )
);

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
        is_suspended=(p_action='suspend_provider'),
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

