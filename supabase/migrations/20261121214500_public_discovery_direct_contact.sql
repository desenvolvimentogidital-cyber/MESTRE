-- ConectaServ: visitors can search public job previews and public professional profiles.
-- Personal client identifiers, attachments, neighborhood and private chat are not exposed.
-- Contact requires a validated authenticated account through a checked RPC.

create or replace function private.public_excerpt(p_value text, p_length integer)
returns text language sql immutable set search_path=''
as $$
  select left(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          coalesce(p_value,''),
          '(https?://|www[.])[^[:space:]]+', '[link oculto]', 'gi'
        ),
        '[[:alnum:]._%+-]+@[[:alnum:].-]+[.][[:alpha:]]{2,}', '[contato oculto]', 'gi'
      ),
      '(\+?55[ .()-]*)?(\(?[0-9]{2}\)?[ .-]*)?[0-9]{4,5}[ .-]*[0-9]{4}',
      '[contato oculto]', 'g'
    ),
    least(greatest(p_length,1),500)
  );
$$;
revoke all on function private.public_excerpt(text,integer) from public, anon, authenticated;

create or replace function public.search_service_listings(
 p_query text default '',
 p_category_id uuid default null,
 p_city text default '',
 p_limit integer default 20,
 p_offset integer default 0,
 p_request_id uuid default null
) returns table (
 id uuid, category_id uuid, category_name text, title text, summary text,
 city text, state text, budget_max numeric, created_at timestamptz
)
language sql stable security definer set search_path=''
as $$
select r.id,r.category_id,sc.name,
       private.public_excerpt(r.title,110),
       private.public_excerpt(r.description,380),
       r.city,r.state,r.budget_max,r.created_at
from public.service_requests r
join public.service_categories sc on sc.id=r.category_id and sc.is_active=true
where r.status='published'
  and (p_request_id is null or r.id=p_request_id)
  and (p_category_id is null or r.category_id=p_category_id)
  and (coalesce(btrim(p_city),'')='' or r.city ilike '%'||left(btrim(p_city),80)||'%')
  and (coalesce(btrim(p_query),'')=''
    or r.title ilike '%'||left(btrim(p_query),80)||'%'
    or r.description ilike '%'||left(btrim(p_query),80)||'%'
    or sc.name ilike '%'||left(btrim(p_query),80)||'%'
    or r.city ilike '%'||left(btrim(p_query),80)||'%'
    or (lower(btrim(p_query)) ~ '^pedreir|^alvenari|^obras?$' and sc.slug='reformas-construcao')
  )
order by r.created_at desc,r.id desc
limit least(greatest(coalesce(p_limit,20),1),50)
offset least(greatest(coalesce(p_offset,0),0),100000);
$$;
revoke all on function public.search_service_listings(text,uuid,text,integer,integer,uuid) from public,anon,authenticated;
grant execute on function public.search_service_listings(text,uuid,text,integer,integer,uuid) to anon,authenticated;

create or replace function public.search_professional_profiles(
 p_query text default '',
 p_category_id uuid default null,
 p_city text default '',
 p_limit integer default 20,
 p_offset integer default 0
) returns table (
 user_id uuid, display_name text, bio text, city text, state text,
 years_experience integer, is_verified boolean, average_rating numeric, review_count integer,
 specialties text[]
)
language sql stable security definer set search_path=''
as $$
select pp.user_id,
       private.public_excerpt(pp.display_name,90),
       private.public_excerpt(pp.bio,220),
       pp.city,pp.state,pp.years_experience,pp.is_verified,pp.average_rating,pp.review_count,
       coalesce((
         select array_agg(sc.name order by sc.name)
         from public.provider_categories pc
         join public.service_categories sc on sc.id=pc.category_id and sc.is_active
         where pc.provider_id=pp.user_id
       ),array[]::text[])
from public.provider_profiles pp
where pp.is_active=true and pp.is_suspended=false
  and (
    p_category_id is null
    or exists (select 1 from public.provider_categories pc
        where pc.provider_id=pp.user_id and pc.category_id=p_category_id)
  )
  and (coalesce(btrim(p_city),'')='' or pp.city ilike '%'||left(btrim(p_city),80)||'%')
  and (coalesce(btrim(p_query),'')=''
    or pp.display_name ilike '%'||left(btrim(p_query),80)||'%'
    or coalesce(pp.bio,'') ilike '%'||left(btrim(p_query),80)||'%'
    or coalesce(pp.city,'') ilike '%'||left(btrim(p_query),80)||'%'
    or exists (
      select 1 from public.provider_categories pc
      join public.service_categories sc on sc.id=pc.category_id and sc.is_active
      where pc.provider_id=pp.user_id and
        (sc.name ilike '%'||left(btrim(p_query),80)||'%'
         or (lower(btrim(p_query)) ~ '^pedreir|^alvenari|^obras?$' and sc.slug='reformas-construcao'))
    )
  )
order by pp.is_verified desc,pp.review_count desc,pp.average_rating desc,pp.created_at desc,pp.user_id
limit least(greatest(coalesce(p_limit,20),1),50)
offset least(greatest(coalesce(p_offset,0),0),100000);
$$;
revoke all on function public.search_professional_profiles(text,uuid,text,integer,integer) from public,anon,authenticated;
grant execute on function public.search_professional_profiles(text,uuid,text,integer,integer) to anon,authenticated;

-- Direct chat is explicitly opt-in by the customer after authentication.
-- A single conversation per customer/provider pair and a conservative daily new-chat limit.
create unique index if not exists conversations_one_direct_pair
 on public.conversations (client_id,provider_id) where request_id is null;

create or replace function public.start_direct_conversation(p_provider_id uuid)
returns uuid language plpgsql security definer set search_path=''
as $$
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
  if v_role is null or v_role not in ('client','both') then
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
$$;
revoke all on function public.start_direct_conversation(uuid) from public,anon,authenticated;
grant execute on function public.start_direct_conversation(uuid) to authenticated;

drop policy if exists messages_insert_sender_participant on public.messages;
create policy messages_insert_sender_participant on public.messages
 for insert to authenticated
 with check (
   sender_id=(select auth.uid())
   and exists (
     select 1 from public.conversations c
     where c.id=messages.conversation_id
       and (c.client_id=(select auth.uid()) or c.provider_id=(select auth.uid()))
       and (
         (
           c.request_id is null
           and exists (
             select 1 from public.provider_profiles pp where pp.user_id=c.provider_id
               and pp.is_active=true and pp.is_suspended=false
           )
         )
         or (
           c.request_id is not null
           and exists (
             select 1 from public.service_requests r
             join public.proposals p on p.request_id=r.id and p.provider_id=c.provider_id
             where r.id=c.request_id and r.status='in_progress' and p.status='accepted'
           )
         )
       )
   )
 );

-- Expose only the public previews through the above functions, never direct
-- anonymous access to the full customer request table.
revoke select on public.service_requests from anon;
