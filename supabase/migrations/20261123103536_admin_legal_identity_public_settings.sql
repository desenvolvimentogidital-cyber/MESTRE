-- Public operator identification, editable only by a real admin from a phone.
create table if not exists public.site_legal_settings (
 id integer primary key default 1 check (id=1),
 operator_name text,
 contact_email text,
 cnpj text,
 updated_at timestamptz not null default now(),
 updated_by uuid references public.profiles(id) on delete set null
);
insert into public.site_legal_settings(id) values(1) on conflict(id) do nothing;
alter table public.site_legal_settings enable row level security;
revoke all on public.site_legal_settings from public,anon,authenticated;
grant select on public.site_legal_settings to anon,authenticated;
drop policy if exists site_legal_settings_public_read on public.site_legal_settings;
create policy site_legal_settings_public_read on public.site_legal_settings
for select to anon,authenticated using(true);
create or replace function public.admin_update_site_legal_settings(
 p_operator_name text,p_contact_email text,p_cnpj text default null
) returns boolean language plpgsql security definer set search_path='' as $f$
declare
 v_name text:=btrim(coalesce(p_operator_name,''));
 v_email text:=lower(btrim(coalesce(p_contact_email,'')));
 v_cnpj text:=regexp_replace(coalesce(p_cnpj,''),'[^0-9]','','g');
begin
 if not private.is_moderator() then
   raise exception 'Acesso administrativo restrito.' using errcode='42501';
 end if;
 if char_length(v_name) not between 3 and 160 then
   raise exception 'Informe o nome ou a razão social do responsável (3 a 160 caracteres).' using errcode='22023';
 end if;
 if char_length(v_email) not between 5 and 254 or v_email !~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then
   raise exception 'Informe um e-mail de contato válido.' using errcode='22023';
 end if;
 if v_cnpj<>'' and char_length(v_cnpj)<>14 then
   raise exception 'Se informado, o CNPJ deve ter 14 dígitos.' using errcode='22023';
 end if;
 insert into public.site_legal_settings(id,operator_name,contact_email,cnpj,updated_at,updated_by)
 values(1,v_name,v_email,nullif(v_cnpj,''),now(),(select auth.uid()))
 on conflict(id) do update set operator_name=excluded.operator_name,
  contact_email=excluded.contact_email,cnpj=excluded.cnpj,
  updated_at=now(),updated_by=excluded.updated_by;
 return true;
end $f$;
revoke all on function public.admin_update_site_legal_settings(text,text,text) from public,anon,authenticated;
grant execute on function public.admin_update_site_legal_settings(text,text,text) to authenticated;
