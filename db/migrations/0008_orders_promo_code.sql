-- Records which affiliate/promo code (if any) was redeemed on each order, so the
-- admin can attribute orders to a code and see which customer used it.
--
-- api/send-order.js writes promo_code on insert and falls back to inserting
-- without it if this column is absent (error 42703), so tracking is additive:
-- orders keep working before this runs, and attribution turns on once it does.
--
-- Apply in the Supabase SQL editor.

alter table orders add column if not exists promo_code text;

-- Attribution lookups ("show every order that used STRATOS10").
create index if not exists orders_promo_code_idx on orders (promo_code);
