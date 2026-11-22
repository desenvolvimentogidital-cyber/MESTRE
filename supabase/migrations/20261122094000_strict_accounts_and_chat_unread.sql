-- Strict account roles + service-specific unread message tracking.
-- Two existing accounts (client/provider) remain intact. Public discovery is unchanged.
create or replace function private.has_account_role(p_role text)
returns boolean language sql stable security definer set search_path=''
as $$
  select (select auth.uid()) is not null
    and exists (select 1 from public.profiles p
      where p.id=(select auth.uid()) and p.account_type=p_role);
$$;
revoke all on function private.has_account_role(text) from public, anon, authenticated;
grant execute on function private.has_account_role(text) to authenticated;

-- A user cannot change account type through editable profile fields.
revoke update on public.profiles from authenticated;
grant update(full_name,phone,updated_at) on public.profiles to authenticated;

alter table public.profiles drop constraint if exists profiles_account_type_check;
alter table public.profiles add constraint profiles_account_type_check
  check (account_type in ('client','provider'));

drop policy if exists requests_insert_client on public.service_requests;
create policy requests_insert_client on public.service_requests
for insert to authenticated with check (
  client_id=(select auth.uid()) and status in ('draft','published')
  and (select private.has_account_role('client'))
);
drop policy if exists requests_update_owner on public.service_requests;
create policy requests_update_owner on public.service_requests
for update to authenticated
using (client_id=(select auth.uid()) and status in ('draft','published')
       and (select private.has_account_role('client')))
with check (client_id=(select auth.uid()) and status in ('draft','published')
       and (select private.has_account_role('client')));
drop policy if exists requests_delete_owner on public.service_requests;
create policy requests_delete_owner on public.service_requests
for delete to authenticated using (
  client_id=(select auth.uid()) and status in ('draft','published','cancelled')
  and (select private.has_account_role('client'))
);
drop policy if exists requests_read_owner_or_providers on public.service_requests;
create policy requests_read_owner_or_providers on public.service_requests for select to authenticated
using (
  (client_id=(select auth.uid()) and (select private.has_account_role('client')))
  or (
    (select private.has_account_role('provider'))
    and status='published'
    and exists (select 1 from public.provider_profiles pp
      where pp.user_id=(select auth.uid()) and pp.is_active and not pp.is_suspended)
  )
  or (
    (select private.has_account_role('provider'))
    and status in ('in_progress','completed')
    and exists (select 1 from public.conversations c
      where c.request_id=service_requests.id and c.provider_id=(select auth.uid()))
  )
);

drop policy if exists proposals_insert_provider on public.proposals;
create policy proposals_insert_provider on public.proposals for insert to authenticated
with check (
  (select private.has_account_role('provider'))
  and provider_id=(select auth.uid()) and status='sent'
  and exists (
    select 1 from public.provider_profiles pp
    join public.service_requests r on r.id=proposals.request_id
    where pp.user_id=(select auth.uid()) and pp.is_active and not pp.is_suspended
      and r.status='published' and r.client_id<>(select auth.uid())
      and (
        not exists (select 1 from public.provider_categories pc where pc.provider_id=(select auth.uid()))
        or exists (select 1 from public.provider_categories pc
                   where pc.provider_id=(select auth.uid()) and pc.category_id=r.category_id)
      )
  )
);
drop policy if exists proposals_read_client_or_provider on public.proposals;
create policy proposals_read_client_or_provider on public.proposals for select to authenticated
using (
  ((select private.has_account_role('provider')) and provider_id=(select auth.uid()))
  or (
    (select private.has_account_role('client'))
    and exists (select 1 from public.service_requests r
      where r.id=proposals.request_id and r.client_id=(select auth.uid()))
  )
);

drop policy if exists provider_profiles_update_own on public.provider_profiles;
create policy provider_profiles_update_own on public.provider_profiles for update to authenticated
using (user_id=(select auth.uid()) and (select private.has_account_role('provider')))
with check (user_id=(select auth.uid()) and (select private.has_account_role('provider'))
  and (not is_suspended or is_active=false));

drop policy if exists provider_categories_insert_own on public.provider_categories;
create policy provider_categories_insert_own on public.provider_categories for insert to authenticated
with check (
  provider_id=(select auth.uid()) and (select private.has_account_role('provider'))
  and exists (select 1 from public.provider_profiles pp
    where pp.user_id=(select auth.uid()) and pp.is_active and not pp.is_suspended)
);

drop policy if exists conversations_read_participants on public.conversations;
create policy conversations_read_participants on public.conversations for select to authenticated
using (
  (client_id=(select auth.uid()) and (select private.has_account_role('client')))
  or (provider_id=(select auth.uid()) and (select private.has_account_role('provider')))
);

drop policy if exists messages_read_participants on public.messages;
create policy messages_read_participants on public.messages for select to authenticated
using (
  exists (select 1 from public.conversations c where c.id=messages.conversation_id and
    ((c.client_id=(select auth.uid()) and (select private.has_account_role('client')))
    or (c.provider_id=(select auth.uid()) and (select private.has_account_role('provider'))))
  )
);

-- Existing message.read_at represents whether the OTHER participant has read it.
create index if not exists idx_chat_messages_recent
  on public.messages(conversation_id,created_at desc);
create index if not exists idx_chat_messages_unread
  on public.messages(conversation_id,created_at desc)
  where read_at is null;

create or replace function public.my_chat_inbox()
returns table (
  conversation_id uuid, unread_count bigint, last_message_at timestamptz,
  last_message_excerpt text, last_sender_id uuid
)
language sql stable security definer set search_path=''
as $$
  select c.id,
    (select count(*) from public.messages m
      where m.conversation_id=c.id and m.sender_id<>(select auth.uid())
        and m.read_at is null) as unread_count,
    latest.created_at as last_message_at,
    left(latest.body,130) as last_message_excerpt,
    latest.sender_id as last_sender_id
  from public.conversations c
  left join lateral (
    select m.created_at,m.body,m.sender_id
    from public.messages m where m.conversation_id=c.id
    order by m.created_at desc,m.id desc limit 1
  ) latest on true
  where (
    (c.client_id=(select auth.uid()) and (select private.has_account_role('client')))
    or (c.provider_id=(select auth.uid()) and (select private.has_account_role('provider')))
  )
  order by coalesce(latest.created_at,c.created_at) desc
  limit 200;
$$;
revoke all on function public.my_chat_inbox() from public,anon,authenticated;
grant execute on function public.my_chat_inbox() to authenticated;

create or replace function public.my_unread_message_total()
returns integer language sql stable security definer set search_path=''
as $$
  select least(count(*),2147483647)::integer
  from public.messages m
  join public.conversations c on c.id=m.conversation_id
  where m.sender_id<>(select auth.uid()) and m.read_at is null
    and (
      (c.client_id=(select auth.uid()) and (select private.has_account_role('client')))
      or (c.provider_id=(select auth.uid()) and (select private.has_account_role('provider')))
    );
$$;
revoke all on function public.my_unread_message_total() from public,anon,authenticated;
grant execute on function public.my_unread_message_total() to authenticated;

create or replace function public.mark_my_chat_read(p_conversation_id uuid)
returns integer language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=(select auth.uid());v_count integer;
begin
  if v_user is null or p_conversation_id is null then
    raise exception 'Faça login antes de ler mensagens.' using errcode='42501';
  end if;
  if not exists (
    select 1 from public.conversations c where c.id=p_conversation_id
    and (
      (c.client_id=v_user and private.has_account_role('client'))
      or (c.provider_id=v_user and private.has_account_role('provider'))
    )
  ) then
    raise exception 'Conversa não encontrada ou sem permissão.' using errcode='42501';
  end if;
  update public.messages
  set read_at=now()
  where conversation_id=p_conversation_id and sender_id<>v_user and read_at is null;
  get diagnostics v_count=row_count;
  return v_count;
end;
$$;
revoke all on function public.mark_my_chat_read(uuid) from public,anon,authenticated;
grant execute on function public.mark_my_chat_read(uuid) to authenticated;

-- Message alerts belong to each conversation, not the top notification bell.
drop trigger if exists trg_notify_message on public.messages;

CREATE OR REPLACE FUNCTION public.start_direct_conversation(p_provider_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor uuid := (select auth.uid());
  v_role text;
  v_chat uuid;
begin
  if v_actor is null then
    raise exception 'Entre na sua conta para conversar.' using errcode='42501';
  end if;
  if p_provider_id is null or p_provider_id=v_actor then
    raise exception 'Selecione outro profissional.' using errcode='22023';
  end if;
  select account_type into v_role from public.profiles where id=v_actor;
  if v_role is null or v_role <> 'client' then
    raise exception 'Entre com uma conta de cliente para conversar.' using errcode='42501';
  end if;
  if not exists (
    select 1 from public.provider_profiles pp
      where pp.user_id=p_provider_id and pp.is_active and not pp.is_suspended
  ) then
    raise exception 'Este profissional não está disponível.' using errcode='P0001';
  end if;

  select c.id into v_chat from public.conversations c
  where c.client_id=v_actor and c.provider_id=p_provider_id and c.request_id is null;
  if v_chat is not null then return v_chat; end if;

  if (select count(*) from public.conversations c
        where c.client_id=v_actor and c.request_id is null
          and c.created_at>now()-interval '24 hours')>=15 then
    raise exception 'Limite diário de novos contatos atingido. Tente novamente mais tarde.' using errcode='P0001';
  end if;

  insert into public.conversations (request_id,client_id,provider_id)
    values (null,v_actor,p_provider_id)
    on conflict (client_id,provider_id) where request_id is null do nothing;
  select c.id into v_chat from public.conversations c
    where c.client_id=v_actor and c.provider_id=p_provider_id and c.request_id is null;
  return v_chat;
end;
$function$
;
