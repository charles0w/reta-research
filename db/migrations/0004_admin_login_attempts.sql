-- Records failed admin auth attempts per IP so requireAdmin() (api/_adminAuth.js)
-- can throttle brute-force guessing across all /api/admin/* endpoints.
-- requireAdmin degrades gracefully (skips throttling) if this table is absent.
--
-- Apply in the Supabase SQL editor.

create table if not exists admin_login_attempts (
  id         bigserial primary key,
  ip         text,
  created_at timestamptz not null default now()
);

create index if not exists admin_login_attempts_ip_idx
  on admin_login_attempts (ip, created_at);
