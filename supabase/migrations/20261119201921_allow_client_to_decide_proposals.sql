revoke update on public.proposals from anon, authenticated;
grant update (status) on public.proposals to authenticated;

drop policy if exists proposals_update_client_decision on public.proposals;
create policy proposals_update_client_decision
on public.proposals
for update
to authenticated
using (
  status = 'sent'
  and exists (
    select 1
    from public.service_requests r
    where r.id = proposals.request_id
      and r.client_id = (select auth.uid())
      and r.status = 'published'
  )
)
with check (
  status in ('accepted', 'rejected')
  and exists (
    select 1
    from public.service_requests r
    where r.id = proposals.request_id
      and r.client_id = (select auth.uid())
      and r.status = 'published'
  )
);
