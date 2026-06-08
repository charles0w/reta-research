-- Idempotency backstop: one on-chain payment (txHash) maps to exactly one order.
-- send-order.js now pre-checks for an existing payment_ref AND relies on this
-- UNIQUE constraint to win the race when two requests arrive concurrently
-- (it catches Postgres error 23505 and returns the existing order instead of
-- creating a duplicate / double-decrementing stock / double-burning an affiliate use).
--
-- Apply in the Supabase SQL editor (or via the Supabase CLI). If duplicate
-- payment_ref rows already exist, dedupe them before adding the constraint.

alter table orders
  add constraint orders_payment_ref_key unique (payment_ref);
