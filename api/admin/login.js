import { createClient } from "@supabase/supabase-js";
import { requireAdmin, issueToken } from "../_adminAuth.js";

// Exchanges the admin password for a short-lived session token. Clients can then
// send `Authorization: Bearer <token>` instead of replaying the password.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const supabase =
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
      ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
          auth: { persistSession: false },
        })
      : null;

  const auth = await requireAdmin(req, supabase);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  return res.json({ ok: true, token: issueToken() });
}
