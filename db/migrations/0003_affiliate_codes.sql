-- Affiliate / promo codes redeemed at checkout.
--
-- The table already exists in production (created via the Supabase dashboard
-- when the feature shipped); this migration records the schema so a fresh
-- environment can be built from db/migrations alone. IF NOT EXISTS makes it
-- a no-op against the live database.
--
-- Lifecycle:
--   generate   : api/admin/affiliate-codes.js inserts with uses_remaining =
--                uses_total (default discount 10%).
--   validate   : api/validate-code.js checks is_active AND uses_remaining > 0.
--   consume    : api/send-order.js decrements uses_remaining with an
--                optimistic lock and flips is_active to false at zero.
--   deactivate : api/admin/affiliate-codes.js sets is_active = false.

create table if not exists affiliate_codes (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  label          text,
  discount_pct   integer not null default 10 check (discount_pct between 1 and 100),
  uses_total     integer not null default 1 check (uses_total >= 1),
  uses_remaining integer not null default 1 check (uses_remaining >= 0),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- validate-code.js and send-order.js look codes up by exact code value.
create index if not exists affiliate_codes_code_idx on affiliate_codes (code);
