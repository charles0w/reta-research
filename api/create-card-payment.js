import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { sendConfirmation } from './send-confirmation.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, items, total, shippingInfo } = req.body;

  const r = await fetch('https://connect.squareup.com/v2/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2024-01-18',
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      source_id: token,
      amount_money: { amount: Math.round(total * 100), currency: 'USD' },
      idempotency_key: randomUUID(),
    }),
  });

  const data = await r.json();
  if (!r.ok) return res.status(500).json({ error: data.errors?.[0]?.detail || 'Payment failed' });

  const paymentId = data.payment.id;

  const { data: order, error } = await supabase
    .from('orders')
    .insert({ items, total_usd: total, payment_method: 'card', payment_ref: paymentId, status: 'confirmed', shipping_info: shippingInfo })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  sendConfirmation({
    to: shippingInfo.email,
    name: shippingInfo.name,
    items,
    total,
    paymentMethod: 'Card',
    paymentRef: paymentId,
  }).catch(() => {});

  res.json({ id: order.id, paymentId });
}
