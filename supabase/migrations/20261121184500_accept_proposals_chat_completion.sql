-- ConectaServ: atomic acceptance/rejection, private chat and client-side completion.
-- Keep the user's session as the authorization source; never rely on editable metadata.
-- A direct status update is intentionally denied. Workflow transitions use checked RPC calls.
create unique index if not exists proposals_only_one_accepted_per_request
  on public.proposals (request_id) where status = 'accepted';

revoke update on public.proposals from anon, authenticated;
revoke update on public.service_requests from anon, authenticated;
grant update (category_id, title, description, city, state, neighborhood, budget_min, budget_max, updated_at)
  on public.service_requests to authenticated;

create or replace function public.respond_to_proposal(
  p_proposal_id uuid,
  p_decision text
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_request_id uuid;
  v_client_id uuid;
  v_request_status text;
  v_proposal_status text;
  v_provider_id uuid;
  v_conversation_id uuid;
begin
  if v_actor is null then
    raise exception 'É necessário entrar na sua conta.' using errcode = '42501';
  end if;
  if p_decision not in ('accept', 'reject') or p_decision is null then
    raise exception 'Decisão inválida.' using errcode = '22023';
  end if;

  select p.request_id into v_request_id from public.proposals p where p.id = p_proposal_id;
  if v_request_id is null then
    raise exception 'Proposta não encontrada.' using errcode = 'P0002';
  end if;

  -- Lock the request first so two concurrent accepts cannot succeed.
  select r.client_id, r.status into v_client_id, v_request_status
    from public.service_requests r where r.id = v_request_id for update;
  if v_client_id is distinct from v_actor then
    raise exception 'Somente o cliente proprietário pode decidir.' using errcode = '42501';
  end if;
  if v_request_status is distinct from 'published' then
    raise exception 'Esse pedido não está mais aberto para propostas.' using errcode = 'P0001';
  end if;
  select p.status, p.provider_id into v_proposal_status,v_provider_id
    from public.proposals p where p.id = p_proposal_id and p.request_id = v_request_id for update;
  if v_proposal_status is distinct from 'sent' then
    raise exception 'Essa proposta já foi decidida.' using errcode = 'P0001';
  end if;
  if v_provider_id = v_actor then
    raise exception 'Não é permitido contratar a própria conta.' using errcode = '42501';
  end if;

  if p_decision = 'reject' then
    update public.proposals set status = 'rejected', updated_at = now()
    where id = p_proposal_id and status = 'sent';
    return null;
  end if;

  if exists (
    select 1 from public.proposals p where p.request_id = v_request_id and p.status = 'accepted'
  ) then
    raise exception 'Já existe uma proposta aceita para esse pedido.' using errcode = '23505';
  end if;

  update public.proposals set status = 'accepted', updated_at = now()
    where id = p_proposal_id and status = 'sent';
  update public.proposals set status = 'rejected', updated_at = now()
    where request_id = v_request_id and id <> p_proposal_id and status = 'sent';
  update public.service_requests set status = 'in_progress', updated_at = now()
    where id = v_request_id and status = 'published';

  insert into public.conversations (request_id, client_id, provider_id)
    values (v_request_id, v_client_id, v_provider_id)
    on conflict (request_id, client_id, provider_id) do nothing;
  select c.id into v_conversation_id from public.conversations c
    where c.request_id = v_request_id and c.client_id = v_client_id and c.provider_id = v_provider_id;
  if v_conversation_id is null then
    raise exception 'Não foi possível criar a conversa.' using errcode = 'P0001';
  end if;
  return v_conversation_id;
end;
$$;
revoke all on function public.respond_to_proposal(uuid,text) from public, anon, authenticated;
grant execute on function public.respond_to_proposal(uuid,text) to authenticated;

create or replace function public.complete_service_request(p_request_id uuid)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_owner uuid;
  v_status text;
begin
  if v_actor is null then
    raise exception 'É necessário entrar na sua conta.' using errcode = '42501';
  end if;
  select r.client_id,r.status into v_owner,v_status
    from public.service_requests r where r.id = p_request_id for update;
  if v_owner is distinct from v_actor then
    raise exception 'Somente o cliente proprietário pode concluir o serviço.' using errcode = '42501';
  end if;
  if v_status is distinct from 'in_progress' then
    raise exception 'O pedido deve estar em andamento para ser concluído.' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.proposals p
    where p.request_id = p_request_id and p.status = 'accepted'
  ) then
    raise exception 'Não há contratação aceita para este pedido.' using errcode = 'P0001';
  end if;
  update public.service_requests set status='completed',updated_at=now() where id=p_request_id;
  return true;
end;
$$;
revoke all on function public.complete_service_request(uuid) from public, anon, authenticated;
grant execute on function public.complete_service_request(uuid) to authenticated;

-- Providers can still open hired/completed requests, but not other private requests.
drop policy if exists requests_read_owner_or_providers on public.service_requests;
create policy requests_read_owner_or_providers on public.service_requests for select to authenticated
using (
  client_id = (select auth.uid())
  or (status = 'published' and exists (
    select 1 from public.provider_profiles pp
    where pp.user_id = (select auth.uid()) and pp.is_active
  ))
  or (status in ('in_progress','completed') and exists (
    select 1 from public.conversations c
    where c.request_id = service_requests.id and c.provider_id = (select auth.uid())
  ))
);

-- Only an accepted hire in progress can start a conversation.
drop policy if exists conversations_insert_participants on public.conversations;
create policy conversations_insert_participants on public.conversations for insert to authenticated
with check (
  client_id <> provider_id
  and ((client_id = (select auth.uid())) or (provider_id = (select auth.uid())))
  and exists (
    select 1 from public.service_requests r
    join public.proposals p on p.request_id = r.id and p.provider_id = conversations.provider_id
    where r.id = conversations.request_id
      and r.client_id = conversations.client_id
      and r.status = 'in_progress'
      and p.status = 'accepted'
  )
);

alter table public.messages
  add constraint messages_nonempty_and_limited_body
  check (char_length(btrim(body)) between 1 and 2000);

drop policy if exists messages_insert_sender_participant on public.messages;
create policy messages_insert_sender_participant on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.conversations c
    join public.service_requests r on r.id = c.request_id
    join public.proposals p on p.request_id = c.request_id and p.provider_id = c.provider_id
    where c.id = messages.conversation_id
      and ((c.client_id = (select auth.uid())) or (c.provider_id = (select auth.uid())))
      and r.status = 'in_progress'
      and p.status = 'accepted'
  )
);
