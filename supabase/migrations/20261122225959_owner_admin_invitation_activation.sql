-- Owner activation: one-use capability, no public admin registration.
-- Supabase Auth continues to create ordinary client accounts; only a valid
-- single-use invite can promote an EMPTY account to an isolated admin role.
alter table public.profiles drop constraint if exists profiles_account_type_check;
alter table public.profiles add constraint profiles_account_type_check
  check (account_type in ('client','provider','admin'));

create table if not exists private.admin_activation_codes (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique check (length(token_hash)=64),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  claimed_at timestamptz,
  claimed_by uuid references public.profiles(id) on delete set null,
  check ((claimed_at is null and claimed_by is null) or (claimed_at is not null and claimed_by is not null))
);
alter table private.admin_activation_codes enable row level security;
revoke all on private.admin_activation_codes from public, anon, authenticated;

create or replace function public.activate_admin_with_invite(p_invite_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_actor uuid := (select auth.uid());
  v_profile_type text;
  v_code_id uuid;
  v_token_hash text;
begin
  if v_actor is null then
    raise exception 'Entre com uma conta nova para ativar a administração.' using errcode='42501';
  end if;
  if p_invite_code is null or p_invite_code !~ '^[0-9a-f]{64}$' then
    raise exception 'Convite inválido ou expirado.' using errcode='22023';
  end if;
  -- Serialize competing invitations so only ONE owner can ever be promoted.
  perform pg_catalog.pg_advisory_xact_lock(20261122, 1439);

  select p.account_type into v_profile_type
    from public.profiles p where p.id=v_actor for update;
  if v_profile_type is distinct from 'client' then
    raise exception 'Use uma conta nova, sem vínculo profissional, para ativar o administrador.'
      using errcode='42501';
  end if;
  if exists(select 1 from public.service_requests r where r.client_id=v_actor)
     or exists(select 1 from public.conversations c where c.client_id=v_actor or c.provider_id=v_actor)
     or exists(select 1 from public.proposals p where p.provider_id=v_actor)
     or exists(select 1 from public.reviews r where r.client_id=v_actor or r.provider_id=v_actor)
     or exists(select 1 from public.favorites f where f.client_id=v_actor or f.provider_id=v_actor) then
    raise exception 'A administração deve usar uma conta nova, separada de clientes e profissionais.'
      using errcode='42501';
  end if;
  if exists(select 1 from public.admin_members) then
    raise exception 'O administrador já foi ativado. Não é possível ativar outra conta.'
      using errcode='42501';
  end if;

  v_token_hash:=pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_invite_code,'UTF8')),'hex');
  select code.id into v_code_id
    from private.admin_activation_codes code
    where code.token_hash=v_token_hash
      and code.claimed_at is null and code.expires_at>now()
    for update;
  if v_code_id is null then
    raise exception 'Convite inválido ou expirado.' using errcode='42501';
  end if;

  update public.profiles set account_type='admin', updated_at=now()
    where id=v_actor;
  insert into public.admin_members(user_id) values(v_actor);
  update private.admin_activation_codes set claimed_at=now(),claimed_by=v_actor
    where id=v_code_id;
  return true;
end;
$fn$;

revoke execute on function public.activate_admin_with_invite(text) from public,anon;
grant execute on function public.activate_admin_with_invite(text) to authenticated;
