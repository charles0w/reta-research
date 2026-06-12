-- Follow-up to 0009. `affiliate_codes` and `product_stock` already had RLS
-- enabled (from dashboard setup) WITH a permissive "read for everyone" policy,
-- so 0009's `enable row level security` was a no-op and the anon (publishable)
-- key kept reading every row through the Data API. Enabling RLS never removes
-- existing policies — the permissive policy has to be dropped.
--
-- This drops EVERY policy on those two tables, leaving RLS on with no policy =
-- zero anon/authenticated access. All server code uses the service_role key
-- (bypasses RLS), so application behaviour is unchanged.
--
-- Safe to run before/after 0009 and safe to re-run (idempotent).

do $$
declare r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('affiliate_codes', 'product_stock')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table affiliate_codes enable row level security;
alter table product_stock   enable row level security;
