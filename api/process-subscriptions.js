// Vercel cron: runs daily at 10:00 UTC
// Requires CRON_SECRET env var set in Vercel project settings

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { sendConfirmation } from './send-confirmation.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function advanceDate(dateStr, cadence) {
  const d = new Date(dateStr);
  if (cadence === 'monthly')        d.setMonth(d.getMonth() + 1);
  else if (cadence === 'bimonthly') d.setMonth(d.getMonth() + 2);
  else                              d.setMonth(d.getMonth() + 3);
  return d.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: subs, error: fetchErr } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .lte('next_charge_date', today);

  if (fetchErr) return res.status(500).json({ error: fetchErr.message });

  const results = [];

  for (const sub of subs) {
    try {
      const payRes = await fetch('https://connect.squareup.com/v2/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Square-Version': '2024-01-18',
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          source_id: sub.square_card_id,
          customer_id: sub.square_customer_id,
          amount_money: { amount: Math.round(sub.price_per_shipment * 100), currency: 'USD' },
          idempotency_key: randomUUID(),
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.errors?.[0]?.detail || 'Payment failed');

      const paymentId = payData.payment.id;
      const items = [{ name: sub.product_name, price: sub.price_per_shipment / sub.qty, qty: sub.qty }];
      const nextDate = advanceDate(sub.next_charge_date, sub.cadence);

      await supabase.from('orders').insert({
        items,
        total_usd: sub.price_per_shipment,
        payment_method: 'card_subscription',
        payment_ref: paymentId,
        status: 'confirmed',
        shipping_info: sub.shipping_info,
      });

      await supabase
        .from('subscriptions')
        .update({ next_charge_date: nextDate, status: 'active' })
        .eq('id', sub.id);

      sendConfirmation({
        to: sub.shipping_info.email,
        name: sub.shipping_info.name,
        items,
        total: sub.price_per_shipment,
        paymentMethod: `${sub.tier} Subscription`,
        paymentRef: paymentId,
        isSubscription: true,
      }).catch(() => {});

      results.push({ id: sub.id, status: 'charged', paymentId, nextDate });
    } catch (err) {
      await supabase.from('subscriptions').update({ status: 'payment_failed' }).eq('id', sub.id);
      results.push({ id: sub.id, status: 'failed', error: err.message });
    }
  }

  res.json({ processed: results.length, results });
}
