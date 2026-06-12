-- Enable Row Level Security on every public-schema table so the anon
-- (publishable) key cannot read or write rows through the Supabase Data API.
--
-- WHY: a security scan found that `affiliate_codes` and `product_stock` were
-- readable by the anon role over PostgREST. With the publishable key, anyone
-- could dump every promo/affiliate code (full code values + remaining uses) and
-- exact inventory quantities directly — bypassing api/validate-code.js and
-- api/stock.js and their per-IP rate limits. `orders` already had RLS enabled
-- (anon reads returned nothing and an anon insert was rejected with 42501);
-- `subscribers` and `admin_login_attempts` returned no rows but their RLS state
-- was unconfirmed. Enabling RLS here makes the intended state explicit for all.
--
-- HOW IT STAYS WORKING: every server-side caller (api/*.js) uses the
-- service_role key, which has bypassrls — so enabling RLS with NO policies
-- blocks the anon/authenticated roles entirely while server code is unaffected.
-- `enable row level security` is a no-op on a table that already has it on, so
-- this migration is safe to run even where RLS was already enabled.
--
-- ORDER OF OPERATIONS — IMPORTANT:
--   1. Deploy the api/stock.js and api/validate-code.js change first
--      (anon key -> service key). Until that is live, those two public
--      endpoints read via the anon key and this migration would make them
--      return empty.
--   2. THEN run this migration in the Supabase SQL editor.

alter table affiliate_codes      enable row level security;
alter table product_stock        enable row level security;
alter table subscribers          enable row level security;
alter table admin_login_attempts enable row level security;
alter table orders               enable row level security;

-- No policies are created on purpose: with RLS on and no policy, the anon and
-- authenticated roles can see/modify zero rows. All application access runs
-- through the service_role key (server-side only), which bypasses RLS. If a
-- table ever needs genuine public read access again, add a narrow
-- `create policy ... for select to anon using (true)` rather than disabling RLS.
