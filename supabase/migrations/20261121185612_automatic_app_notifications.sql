-- ConectaServ: in-app notifications generated automatically by database events.
-- This does not require a third-party push provider; notifications appear in the signed-in app.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in (
    'new_request','new_proposal','proposal_accepted','proposal_rejected',
    'new_message','service_completed','new_review','verification_update','report_update'
  )),
  title text not null check (length(title) between 2 and 140),
  body text not null check (length(body) <= 300),
  request_id uuid references public.service_requests(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_recipient_time on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_unread on public.notifications (recipient_id, created_at desc) where read_at is null;
alter table public.notifications enable row level security;
revoke all on public.notifications from public, anon, authenticated;
grant select on public.notifications to authenticated;
grant update(read_at) on public.notifications to authenticated;
create policy notifications_read_own on public.notifications for select to authenticated
  using (recipient_id=(select auth.uid()));
create policy notifications_mark_read_own on public.notifications for update to authenticated
  using (recipient_id=(select auth.uid()))
  with check (recipient_id=(select auth.uid()));

create or replace function private.notify_new_request()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if NEW.status='published' and (TG_OP='INSERT' or OLD.status is distinct from 'published') then
    insert into public.notifications(recipient_id,kind,title,body,request_id)
    select p.user_id,'new_request','Novo pedido na sua área',
      left('Um cliente publicou: '||NEW.title,300),NEW.id
    from public.provider_profiles p
    where p.is_active and p.user_id<>NEW.client_id
      and (p.state is null or upper(p.state)=upper(NEW.state))
      and (
        not exists (select 1 from public.provider_categories c where c.provider_id=p.user_id)
        or exists (select 1 from public.provider_categories c where c.provider_id=p.user_id and c.category_id=NEW.category_id)
      )
    order by p.updated_at desc limit 250;
  end if;
  return NEW;
end;
$$;
revoke all on function private.notify_new_request() from public,anon,authenticated;
drop trigger if exists trg_notify_request_created on public.service_requests;
create trigger trg_notify_request_created
after insert or update of status on public.service_requests
for each row execute function private.notify_new_request();

create or replace function private.notify_new_proposal()
returns trigger language plpgsql security definer set search_path=''
as $$
declare v_client uuid;v_title text;
begin
  select client_id,title into v_client,v_title from public.service_requests where id=NEW.request_id;
  if v_client is not null then
    insert into public.notifications(recipient_id,kind,title,body,request_id)
    values(v_client,'new_proposal','Você recebeu um orçamento',left('Um profissional enviou uma proposta para: '||v_title,300),NEW.request_id);
  end if;
  return NEW;
end;
$$;
revoke all on function private.notify_new_proposal() from public,anon,authenticated;
drop trigger if exists trg_notify_new_proposal on public.proposals;
create trigger trg_notify_new_proposal after insert on public.proposals
for each row execute function private.notify_new_proposal();

create or replace function private.notify_proposal_outcome()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if NEW.status is distinct from OLD.status and NEW.status in ('accepted','rejected') then
    insert into public.notifications(recipient_id,kind,title,body,request_id)
    values(
      NEW.provider_id,
      case when NEW.status='accepted' then 'proposal_accepted' else 'proposal_rejected' end,
      case when NEW.status='accepted' then 'Sua proposta foi aceita!' else 'Atualização da proposta' end,
      case when NEW.status='accepted' then 'O cliente contratou você. Abra a conversa para combinar o serviço.'
           else 'O cliente escolheu outra proposta ou recusou seu orçamento.' end,
      NEW.request_id
    );
  end if;
  return NEW;
end;
$$;
revoke all on function private.notify_proposal_outcome() from public,anon,authenticated;
drop trigger if exists trg_notify_proposal_outcome on public.proposals;
create trigger trg_notify_proposal_outcome after update of status on public.proposals
for each row execute function private.notify_proposal_outcome();

create or replace function private.notify_message()
returns trigger language plpgsql security definer set search_path=''
as $$
declare v_client uuid;v_provider uuid;v_request uuid;v_recipient uuid;
begin
  select client_id,provider_id,request_id into v_client,v_provider,v_request
    from public.conversations where id=NEW.conversation_id;
  v_recipient:=case when NEW.sender_id=v_client then v_provider else v_client end;
  if v_recipient is not null and v_recipient<>NEW.sender_id then
    insert into public.notifications(recipient_id,kind,title,body,request_id,conversation_id)
    values(v_recipient,'new_message','Nova mensagem','Você recebeu uma mensagem privada sobre o serviço.',v_request,NEW.conversation_id);
  end if;
  return NEW;
end;
$$;
revoke all on function private.notify_message() from public,anon,authenticated;
drop trigger if exists trg_notify_message on public.messages;
create trigger trg_notify_message after insert on public.messages
for each row execute function private.notify_message();

create or replace function private.notify_service_completed()
returns trigger language plpgsql security definer set search_path=''
as $$
declare v_provider uuid;
begin
  if NEW.status='completed' and OLD.status is distinct from NEW.status then
    select provider_id into v_provider from public.proposals
      where request_id=NEW.id and status='accepted' limit 1;
    if v_provider is not null then
      insert into public.notifications(recipient_id,kind,title,body,request_id)
      values(v_provider,'service_completed','Serviço concluído','O cliente confirmou a conclusão do serviço.',NEW.id);
    end if;
  end if;
  return NEW;
end;
$$;
revoke all on function private.notify_service_completed() from public,anon,authenticated;
drop trigger if exists trg_notify_service_completed on public.service_requests;
create trigger trg_notify_service_completed after update of status on public.service_requests
for each row execute function private.notify_service_completed();

create or replace function private.notify_review()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  insert into public.notifications(recipient_id,kind,title,body,request_id)
  values(NEW.provider_id,'new_review','Você recebeu uma avaliação','O cliente avaliou seu serviço concluído.',NEW.request_id);
  return NEW;
end;
$$;
revoke all on function private.notify_review() from public,anon,authenticated;
drop trigger if exists trg_notify_review on public.reviews;
create trigger trg_notify_review after insert on public.reviews
for each row execute function private.notify_review();

create or replace function private.notify_verification()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if NEW.status is distinct from OLD.status and NEW.status in ('approved','rejected') then
    insert into public.notifications(recipient_id,kind,title,body)
    values(NEW.provider_id,'verification_update','Resultado da verificação',
      case when NEW.status='approved' then 'Seu perfil profissional foi aprovado pela equipe de moderação.'
           else 'Sua solicitação de verificação não foi aprovada. Veja a justificativa no perfil.' end);
  end if;
  return NEW;
end;
$$;
revoke all on function private.notify_verification() from public,anon,authenticated;
drop trigger if exists trg_notify_verification on public.verification_requests;
create trigger trg_notify_verification after update of status on public.verification_requests
for each row execute function private.notify_verification();

create or replace function private.notify_report()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if NEW.status is distinct from OLD.status and NEW.status in ('resolved','dismissed') then
    insert into public.notifications(recipient_id,kind,title,body,request_id)
    values(NEW.reporter_id,'report_update','Sua denúncia foi analisada',
      'A equipe de moderação analisou o relato enviado.',NEW.request_id);
  end if;
  return NEW;
end;
$$;
revoke all on function private.notify_report() from public,anon,authenticated;
drop trigger if exists trg_notify_report on public.reports;
create trigger trg_notify_report after update of status on public.reports
for each row execute function private.notify_report();
