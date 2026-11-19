create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type text;
  v_name text;
begin
  v_type := case lower(coalesce(new.raw_user_meta_data ->> 'account_type', 'client'))
    when 'prestador' then 'provider'
    when 'provider' then 'provider'
    when 'both' then 'both'
    else 'client'
  end;
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Novo usuário'
  );

  insert into public.profiles (id, account_type, full_name)
  values (new.id, v_type, v_name)
  on conflict (id) do update
    set account_type = excluded.account_type,
        full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
        updated_at = now();

  if v_type in ('provider', 'both') then
    insert into public.provider_profiles (user_id, display_name)
    values (new.id, v_name)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_mestre on auth.users;
create trigger on_auth_user_created_mestre after insert on auth.users
for each row execute function private.handle_new_user();

drop policy if exists profiles_insert_own on public.profiles;
revoke insert, update on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, updated_at) on public.profiles to authenticated;

drop policy if exists provider_profiles_insert_own on public.provider_profiles;
revoke insert, update on public.provider_profiles from anon, authenticated;
grant select on public.provider_profiles to anon, authenticated;
grant update (display_name, bio, city, state, avatar_path, portfolio_paths, years_experience, is_active, updated_at)
on public.provider_profiles to authenticated;

drop policy if exists requests_read_owner_or_providers on public.service_requests;
create policy requests_read_owner_or_providers on public.service_requests for select to authenticated
using (
  client_id = (select auth.uid())
  or (status = 'published' and exists (
    select 1 from public.provider_profiles pp
    where pp.user_id = (select auth.uid()) and pp.is_active = true
  ))
);

drop policy if exists provider_categories_insert_own on public.provider_categories;
create policy provider_categories_insert_own on public.provider_categories for insert to authenticated
with check (
  provider_id = (select auth.uid())
  and exists (select 1 from public.provider_profiles pp
    where pp.user_id = (select auth.uid()) and pp.is_active = true)
);
drop policy if exists provider_categories_update_own on public.provider_categories;
create policy provider_categories_update_own on public.provider_categories for update to authenticated
using (provider_id = (select auth.uid()))
with check (
  provider_id = (select auth.uid())
  and exists (select 1 from public.provider_profiles pp
    where pp.user_id = (select auth.uid()) and pp.is_active = true)
);

drop policy if exists proposals_insert_provider on public.proposals;
create policy proposals_insert_provider on public.proposals for insert to authenticated
with check (
  provider_id = (select auth.uid())
  and exists (
    select 1 from public.provider_profiles pp
    join public.service_requests r on r.id = proposals.request_id
    where pp.user_id = (select auth.uid()) and pp.is_active = true
      and r.status = 'published' and r.client_id <> (select auth.uid())
  )
);
drop policy if exists proposals_update_parties on public.proposals;

drop policy if exists conversations_insert_participants on public.conversations;
create policy conversations_insert_participants on public.conversations for insert to authenticated
with check (
  client_id <> provider_id
  and exists (
    select 1
    from public.service_requests r
    join public.provider_profiles pp on pp.user_id = conversations.provider_id
    join public.proposals p on p.request_id = r.id and p.provider_id = conversations.provider_id
    where r.id = conversations.request_id
      and r.client_id = conversations.client_id
      and r.status in ('published', 'in_progress', 'completed')
      and pp.is_active = true
  )
  and ((client_id = (select auth.uid())) or (provider_id = (select auth.uid())))
);

drop policy if exists messages_update_recipient_read on public.messages;
revoke update on public.messages from anon, authenticated;
grant update (read_at) on public.messages to authenticated;
create policy messages_update_recipient_read on public.messages for update to authenticated
using (
  sender_id <> (select auth.uid())
  and exists (select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.client_id = (select auth.uid()) or c.provider_id = (select auth.uid())))
)
with check (
  sender_id <> (select auth.uid())
  and exists (select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.client_id = (select auth.uid()) or c.provider_id = (select auth.uid())))
);

drop policy if exists reviews_client_create_completed on public.reviews;
create policy reviews_client_create_completed on public.reviews for insert to authenticated
with check (
  client_id = (select auth.uid())
  and exists (
    select 1 from public.service_requests r
    join public.proposals p on p.request_id = r.id
    where r.id = reviews.request_id and r.client_id = (select auth.uid())
      and r.status = 'completed' and p.provider_id = reviews.provider_id
      and p.status = 'accepted'
  )
);

drop policy if exists attachments_read_request_access on public.request_attachments;
create policy attachments_read_request_access on public.request_attachments for select to authenticated
using (
  exists (
    select 1 from public.service_requests r
    where r.id = request_attachments.request_id
      and (r.client_id = (select auth.uid()) or (
        r.status = 'published' and exists (
          select 1 from public.provider_profiles pp
          where pp.user_id = (select auth.uid()) and pp.is_active = true
        )
      ))
  )
);

drop policy if exists request_files_participant_read on storage.objects;
create policy request_files_participant_read on storage.objects for select to authenticated
using (
  bucket_id = 'request-files'
  and exists (
    select 1 from public.request_attachments a
    join public.service_requests r on r.id = a.request_id
    where a.storage_path = objects.name
      and (r.client_id = (select auth.uid()) or (
        r.status = 'published' and exists (
          select 1 from public.provider_profiles pp
          where pp.user_id = (select auth.uid()) and pp.is_active = true
        )
      ))
  )
);
