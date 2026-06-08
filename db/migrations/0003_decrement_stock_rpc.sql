-- Atomic, oversell-safe stock decrement. Replaces the read-modify-write in
-- api/_fulfill.js (which could lose updates under concurrent orders). Clamps at
-- 0 and flips stock_status to out_of_stock when depleted — same semantics as
-- before, but as a single atomic statement.
--
-- Apply in the Supabase SQL editor. Until applied, _fulfill.js falls back to
-- the non-atomic path automatically.

create or replace function decrement_stock(p_product_id int, p_qty int)
returns void
language sql
as $$
  update product_stock
     set quantity = greatest(0, coalesce(quantity, 0) - p_qty),
         stock_status = case
           when greatest(0, coalesce(quantity, 0) - p_qty) = 0 then 'out_of_stock'
           else stock_status
         end
   where product_id = p_product_id;
$$;
