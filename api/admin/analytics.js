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
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  let totalRevenue = 0;
  let totalOrders = 0;
  let revenueThisMonth = 0;
  let revenueLastMonth = 0;

  const dailyRevenueMap = {};
  const productMap = {};
  const byPaymentMethod = { usdc: 0, eth: 0 };
  const byStatus = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };

  // Pre-populate dailyRevenue map for last 30 days
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    dailyRevenueMap[dateStr] = 0;
  }

  for (const order of orders) {
    const amount =
      typeof order.total_usd === "number"
        ? order.total_usd
        : parseFloat(order.total_usd) || 0;

    const createdAt = new Date(order.created_at);

    totalRevenue += amount;
    totalOrders += 1;

    // This month / last month
    if (createdAt >= thisMonthStart) {
      revenueThisMonth += amount;
    } else if (createdAt >= lastMonthStart && createdAt < lastMonthEnd) {
      revenueLastMonth += amount;
    }

    // Daily revenue (last 30 days)
    if (createdAt >= thirtyDaysAgo) {
      const dateStr = createdAt.toISOString().slice(0, 10);
      if (dateStr in dailyRevenueMap) {
        dailyRevenueMap[dateStr] += amount;
      }
    }

    // Payment method
    const method = (order.payment_method || "").toLowerCase();
    if (method === "usdc") byPaymentMethod.usdc += 1;
    else if (method === "eth") byPaymentMethod.eth += 1;

    // Status
    const status = (order.status || "pending").toLowerCase();
    if (status in byStatus) byStatus[status] += 1;

    // Product breakdown — items can be an array or JSON column
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const name = item.name || item.product_name || item.product_id || "Unknown";
      const units = typeof item.quantity === "number" ? item.quantity : parseInt(item.quantity) || 1;
      const price =
        typeof item.price === "number"
          ? item.price
          : parseFloat(item.price) || 0;
      const itemRevenue = units * price;

      if (!productMap[name]) {
        productMap[name] = { name, units: 0, revenue: 0 };
      }
      productMap[name].units += units;
      productMap[name].revenue += itemRevenue;
    }
  }

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const dailyRevenue = Object.entries(dailyRevenueMap)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const productBreakdown = Object.values(productMap).sort(
    (a, b) => b.revenue - a.revenue
  );

  res.json({
    totalRevenue,
    totalOrders,
    avgOrderValue,
    revenueThisMonth,
    revenueLastMonth,
    dailyRevenue,
    productBreakdown,
    byPaymentMethod,
    byStatus,
  });
}
