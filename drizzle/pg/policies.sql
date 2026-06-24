-- Row-Level Security policies for InvoiceFlow (Supabase Postgres).
--
-- The API connects as the `postgres` role, which BYPASSES RLS, and enforces
-- tenant scoping in the application layer. These policies are defense-in-depth:
-- they protect the anon/authenticated (PostgREST) access path so that even a
-- leaked anon key can only ever read/write rows for organizations the signed-in
-- user belongs to.
--
-- Apply AFTER the generated schema migration (0000_*.sql).

-- Is the current Supabase user a member of the given organization?
create or replace function public.is_org_member(org uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = org
      and m.user_id = auth.uid()
  );
$$;

alter table public.users          enable row level security;
alter table public.organizations  enable row level security;
alter table public.memberships    enable row level security;
alter table public.clients        enable row level security;
alter table public.invoices       enable row level security;
alter table public.line_items     enable row level security;
alter table public.api_keys       enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.payments       enable row level security;

-- A user can see/update only their own profile row.
create policy users_self on public.users
  for all using (id = auth.uid()) with check (id = auth.uid());

-- Members can read their organizations and memberships.
create policy orgs_member_read on public.organizations
  for select using (public.is_org_member(id));

create policy memberships_read on public.memberships
  for select using (public.is_org_member(organization_id));

-- Org-scoped resources: full access limited to members of the owning org.
create policy clients_org on public.clients
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy invoices_org on public.invoices
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy api_keys_org on public.api_keys
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy subscriptions_org on public.subscriptions
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy payments_org on public.payments
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Line items inherit their parent invoice's organization.
create policy line_items_org on public.line_items
  for all using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and public.is_org_member(i.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and public.is_org_member(i.organization_id)
    )
  );
