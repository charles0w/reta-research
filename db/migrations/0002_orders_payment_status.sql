-- Tracks on-chain verification state of an order's payment.
--   unverified : ETH_RPC_URL not configured, so the payment could not be checked
--                (legacy behaviour); side effects applied at creation.
--   pending    : tx not yet mined when the order was submitted; the cron
--                (api/cron/verify-orders.js) will reconcile it.
--   verified   : tx mined, sent to the recipient for at least the order total.
--   mismatch   : tx mined but wrong recipient / reverted / underpaid (do NOT ship).
--   expired    : still no on-chain record after the grace window (do NOT ship).
--
-- Apply in the Supabase SQL editor. Existing rows default to 'unverified'.

alter table orders
  add column if not exists payment_status text not null default 'unverified';

create index if not exists orders_payment_status_idx on orders (payment_status);
