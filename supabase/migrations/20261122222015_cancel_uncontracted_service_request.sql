-- Cancel an uncontracted service request atomically and safely.
create or replace function public.cancel_my_service_request(p_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_actor uuid := (select auth.uid());
  v_client uuid;
  v_status text;
begin
  if v_actor is null or not private.has_account_role('client') then
    raise exception 'Entre com a conta de cliente para cancelar seu pedido.' using errcode='42501';
  end if;
  if p_request_id is null then
    raise exception 'Selecione um pedido válido.' using errcode='22023';
  end if;
  select client_id,status into v_client,v_status
    from public.service_requests where id=p_request_id for update;
  if v_client is distinct from v_actor then
    raise exception 'Somente o cliente proprietário pode cancelar este pedido.' using errcode='42501';
  end if;
  if v_status not in ('draft','published') then
    raise exception 'Somente pedidos ainda não contratados podem ser cancelados.' using errcode='P0001';
  end if;
  update public.service_requests set status='cancelled',updated_at=now()
    where id=p_request_id;
  update public.proposals set status='rejected',updated_at=now()
    where request_id=p_request_id and status='sent';
  return true;
end;
$fn$;
revoke execute on function public.cancel_my_service_request(uuid) from public,anon;
grant execute on function public.cancel_my_service_request(uuid) to authenticated;