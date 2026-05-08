import { createClient } from '@supabase/supabase-js';
import { sendConfirmation } from './send-confirmation.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { items, total, paymentMethod, paymentRef, status = 'pending', shippingInfo } = req.body;

  const { data, error } = await supabase
    .from('orders')
    .insert({ items, total_usd: total, payment_method: paymentMethod, payment_ref: paymentRef, status, shipping_info: shippingInfo })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  if (status === 'sent' && shippingInfo?.email) {
    sendConfirmation({
      to: shippingInfo.email,
      name: shippingInfo.name,
      items,
      total,
      paymentMethod: 'ETH',
      paymentRef,
    }).catch(() => {});
  }

  res.json({ id: data.id });
}
