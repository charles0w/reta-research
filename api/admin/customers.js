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

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: "Internal server error" });

  // Aggregate orders by email
  const customerMap = {};

  for (const order of orders) {
    const info = order.shipping_info || {};
    const email = info.email || "unknown";

    if (!customerMap[email]) {
      customerMap[email] = {
        email,
        name: info.name || info.full_name || "",
        address: info.address || info.street || "",
        totalSpent: 0,
        orderCount: 0,
        lastOrder: null,
        orders: [],
      };
    }

    const customer = customerMap[email];
    const amount = typeof order.total_usd === "number" ? order.total_usd : parseFloat(order.total_usd) || 0;
    customer.totalSpent += amount;
    customer.orderCount += 1;

    if (!customer.lastOrder || order.created_at > customer.lastOrder) {
      customer.lastOrder = order.created_at;
      // Update name/address from the most recent order
      customer.name = info.name || info.full_name || customer.name;
      customer.address = info.address || info.street || customer.address;
    }

    customer.orders.push(order);
  }

  const customers = Object.values(customerMap).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  res.json({ customers });
}
