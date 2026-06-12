-- Records the on-chain sender wallet of each order's payment.
--
-- Observed server-side from the verified transaction (never trusted from the
-- client): tx.from for ETH, the Transfer event's indexed `from` for USDC. It is
-- written when the payment verifies — at submit time if the tx is already mined,
-- otherwise by api/cron/verify-orders.js when the tx confirms. Surfaced in the
-- operator order email and the /admin order detail so a human can confirm the
-- payment came from the buyer before shipping, mitigating an order that claims
-- someone else's transaction.
--
-- Additive and nullable: safe to run before or after deploying the code that
-- writes it. Pre-existing orders simply have a null buyer_address.

alter table orders
  add column if not exists buyer_address text;
