import { createClient } from "@supabase/supabase-js";

const VALID_STATUSES = ["pending", "shipped", "delivered", "cancelled"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { password, id, status } = req.body;
  if (!password || password !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!id || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid id or status" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ ok: true });
}
