import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../_adminAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const auth = await requireAdmin(req, supabase);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ subscribers: data });
}
