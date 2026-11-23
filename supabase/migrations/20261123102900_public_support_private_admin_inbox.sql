-- Public contact channel with private administrator inbox and abuse limits.
create table if not exists public.support_tickets(
 id uuid primary key default gen_random_uuid(),
 full_name text not null check (char_length(btrim(full_name)) between 2 and 100),
 email text not null check (char_length(email) between 5 and 254),
 topic text not null check (topic in ('support','account','privacy','report','other')),
 message text not null check (char_length(btrim(message)) between 20 and 3000),
 requester_id uuid references auth.users(id) on delete set null,
 status text not null default 'open' check (status in ('open','reviewing','resolved','closed')),
 admin_note text check (char_length(admin_note)<=1200),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 resolved_at timestamptz,
 resolved_by uuid references public.profiles(id) on delete set null
);
create index if not exists support_tickets_email_recent on public.support_tickets (email,created_at desc);
create index if not exists support_tickets_status_created on public.support_tickets (status,created_at desc);
alter table public.support_tickets enable row level security;
revoke all on public.support_tickets from public,anon,authenticated;
grant select on public.support_tickets to authenticated;
drop policy if exists support_tickets_admin_read on public.support_tickets;
create policy support_tickets_admin_read on public.support_tickets for select to authenticated
using ((select private.is_moderator()));
create or replace function public.submit_support_ticket(
 p_full_name text,p_email text,p_topic text,p_message text,p_website text default ''
) returns uuid language plpgsql security definer set search_path='' as $f$
declare
 v_email text:=lower(btrim(coalesce(p_email,'')));
 v_id uuid;
begin
 if btrim(coalesce(p_website,''))<>'' then raise exception 'Solicitação inválida.' using errcode='22023'; end if;
 if char_length(btrim(coalesce(p_full_name,''))) not between 2 and 100 then raise exception 'Informe seu nome.' using errcode='22023'; end if;
 if char_length(v_email) not between 5 and 254 or v_email !~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then
   raise exception 'Informe um e-mail de contato válido.' using errcode='22023';
 end if;
 if p_topic is null or p_topic not in ('support','account','privacy','report','other') then
   raise exception 'Escolha o assunto de seu contato.' using errcode='22023';
 end if;
 if char_length(btrim(coalesce(p_message,''))) not between 20 and 3000 then
   raise exception 'Descreva sua solicitação em 20 a 3000 caracteres.' using errcode='22023';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_email),20261123);
 if (select count(*) from public.support_tickets where email=v_email and created_at>now()-interval '24 hours')>=3 then
   raise exception 'Limite de três solicitações por e-mail em 24 horas. Tente novamente mais tarde.' using errcode='P0001';
 end if;
 insert into public.support_tickets(full_name,email,topic,message,requester_id)
 values(btrim(p_full_name),v_email,p_topic,btrim(p_message),(select auth.uid())) returning id into v_id;
 return v_id;
end $f$;
revoke all on function public.submit_support_ticket(text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_support_ticket(text,text,text,text,text) to anon,authenticated;
create or replace function public.admin_handle_support_ticket(p_ticket_id uuid,p_status text,p_note text default null)
returns boolean language plpgsql security definer set search_path='' as $f$
begin
 if not private.is_moderator() then raise exception 'Acesso administrativo restrito.' using errcode='42501'; end if;
 if p_status is null or p_status not in ('reviewing','resolved','closed') then
  raise exception 'Situação inválida.' using errcode='22023'; end if;
 if char_length(coalesce(p_note,''))>1200 then raise exception 'Observação muito longa.' using errcode='22023';end if;
 update public.support_tickets set status=p_status,admin_note=nullif(btrim(coalesce(p_note,'')),''),
 updated_at=now(),resolved_at=case when p_status in ('resolved','closed') then now() else null end,
 resolved_by=case when p_status in ('resolved','closed') then (select auth.uid()) else null end
 where id=p_ticket_id;
 if not found then raise exception 'Solicitação não encontrada.' using errcode='P0002';end if;
 return true;
end $f$;
revoke all on function public.admin_handle_support_ticket(uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_handle_support_ticket(uuid,text,text) to authenticated;
