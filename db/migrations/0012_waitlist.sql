-- Waitlist signups collected while checkout is paused (PAYMENTS_FROZEN).
--
-- api/waitlist.js inserts here via the service_role key; the /admin Waitlist
-- tab reads it via api/admin/waitlist.js. Visitors give an email and the
-- product they're waiting on so demand can be gauged per SKU.
--
-- RLS is enabled with NO policies (same posture as migration 0009): the anon
-- key can neither read nor write, and all access runs through the service_role
-- key server-side, which bypasses RLS.
--
-- Apply in the Supabase SQL editor.

create table if not exists waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  product    text,
  created_at timestamptz not null default now()
);

-- One row per (email, product) pair so a re-submit is idempotent (the endpoint
-- treats the conflict as success); the same person may still wait on more than
-- one product. `product` may be null ("Any / not sure yet"); two null products
-- collapse under the unique index via coalesce so re-submits stay idempotent.
create unique index if not exists waitlist_email_product_uniq
  on waitlist (email, coalesce(product, ''));

-- Newest-first listing in the admin panel.
create index if not exists waitlist_created_at_idx on waitlist (created_at desc);

alter table waitlist enable row level security;
