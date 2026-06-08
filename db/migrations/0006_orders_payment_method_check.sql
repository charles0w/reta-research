-- Enforce that payment_method is one of the supported values at the DB level.
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('eth', 'usdc'));
