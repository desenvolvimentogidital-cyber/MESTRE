
-- Allow multi-skilled professionals to describe their concrete activities,
-- independently of the broad service categories used for public discovery.
alter table public.provider_profiles
  add column if not exists services text[] not null default '{}'::text[];

alter table public.provider_profiles
  add constraint provider_services_count_and_size
  check (
    cardinality(services) <= 30
    and char_length(array_to_string(services,'|')) <= 1800
    and array_position(services, null) is null
  );

-- Existing RLS still requires owner and provider role for updates.
grant update (services) on public.provider_profiles to authenticated;

-- Retain the same RPC signature/output. It now displays both
-- broad categories and the specific services that the professional chose.
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
as $function$
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
       ||
       coalesce((
         select array_agg(private.public_excerpt(s.service,60) order by s.idx)
         from unnest(pp.services) with ordinality as s(service,idx)
         where length(btrim(s.service)) > 0
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
      select 1 from unnest(pp.services) as s(service)
      where s.service ilike '%'||left(btrim(p_query),80)||'%'
    )
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
$function$;

revoke all on function public.search_professional_profiles(text,uuid,text,integer,integer) from public,anon,authenticated;
grant execute on function public.search_professional_profiles(text,uuid,text,integer,integer) to anon,authenticated;
