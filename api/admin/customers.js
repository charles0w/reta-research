import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { password } = req.body || {};

  if (!password || password !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

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
    const amount = typeof order.total === "number" ? order.total : parseFloat(order.total) || 0;
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
