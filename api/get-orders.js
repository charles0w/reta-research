import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  if (!process.env.ADMIN_SECRET || req.headers.authorization !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const [ordersRes, subsRes] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(200),
  ]);

  if (ordersRes.error) return res.status(500).json({ error: ordersRes.error.message });

  res.json({ orders: ordersRes.data, subscriptions: subsRes.data || [] });
}
