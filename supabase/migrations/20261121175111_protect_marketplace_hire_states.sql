-- Prevent forged hire/completion statuses and keep agreed work immutable.
drop policy if exists proposals_insert_provider on public.proposals;
create policy proposals_insert_provider on public.proposals for insert to authenticated
with check (
  provider_id = (select auth.uid()) and status = 'sent'
  and exists (
    select 1 from public.provider_profiles pp
    join public.service_requests r on r.id = proposals.request_id
    where pp.user_id = (select auth.uid()) and pp.is_active = true
      and r.status = 'published'
      and r.client_id <> (select auth.uid())
      and (
        not exists (
          select 1 from public.provider_categories pc
          where pc.provider_id = (select auth.uid())
        )
        or exists (
          select 1 from public.provider_categories pc
          where pc.provider_id = (select auth.uid()) and pc.category_id = r.category_id
        )
      )
  )
);

drop policy if exists requests_insert_client on public.service_requests;
create policy requests_insert_client on public.service_requests for insert to authenticated
with check (
  client_id = (select auth.uid())
  and status in ('draft','published')
);

drop policy if exists requests_update_owner on public.service_requests;
create policy requests_update_owner on public.service_requests for update to authenticated
using (
  client_id = (select auth.uid())
  and status in ('draft','published')
)
with check (
  client_id = (select auth.uid())
  and status in ('draft','published')
);

drop policy if exists requests_delete_owner on public.service_requests;
create policy requests_delete_owner on public.service_requests for delete to authenticated
using (
  client_id = (select auth.uid())
  and status in ('draft','published','cancelled')
);
