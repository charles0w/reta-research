import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { sendConfirmation } from './send-confirmation.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function advanceDate(dateStr, cadence) {
  const d = new Date(dateStr);
  if (cadence === 'monthly')   d.setMonth(d.getMonth() + 1);
  else if (cadence === 'bimonthly') d.setMonth(d.getMonth() + 2);
  else                          d.setMonth(d.getMonth() + 3); // quarterly
  return d.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, productName, pricePerUnit, qty, tier, cadence, shippingInfo, startDate } = req.body;
  const total = pricePerUnit * qty;

  // 1. Create Square customer
  const custRes = await fetch('https://connect.squareup.com/v2/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2024-01-18',
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      given_name: shippingInfo.name.split(' ')[0],
      family_name: shippingInfo.name.split(' ').slice(1).join(' ') || '',
      email_address: shippingInfo.email,
      idempotency_key: randomUUID(),
    }),
  });
  const custData = await custRes.json();
  if (!custRes.ok) return res.status(500).json({ error: custData.errors?.[0]?.detail || 'Failed to create customer' });
  const customerId = custData.customer.id;

  // 2. Store card on file (reusable token)
  const cardRes = await fetch('https://connect.squareup.com/v2/cards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2024-01-18',
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      idempotency_key: randomUUID(),
      source_id: token,
      card: { customer_id: customerId },
    }),
  });
  const cardData = await cardRes.json();
  if (!cardRes.ok) return res.status(500).json({ error: cardData.errors?.[0]?.detail || 'Failed to save card' });
  const cardId = cardData.card.id;

  // 3. Charge first payment
  const payRes = await fetch('https://connect.squareup.com/v2/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2024-01-18',
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      source_id: cardId,
      customer_id: customerId,
      amount_money: { amount: Math.round(total * 100), currency: 'USD' },
      idempotency_key: randomUUID(),
    }),
  });
  const payData = await payRes.json();
  if (!payRes.ok) return res.status(500).json({ error: payData.errors?.[0]?.detail || 'Payment failed' });
  const paymentId = payData.payment.id;

  const items = [{ name: productName, price: pricePerUnit, qty }];
  const nextChargeDate = advanceDate(startDate || new Date().toISOString().slice(0, 10), cadence);

  // 4. Save subscription record
  const { data: sub, error: subErr } = await supabase
    .from('subscriptions')
    .insert({
      square_customer_id: customerId,
      square_card_id: cardId,
      product_name: productName,
      price_per_shipment: total,
      qty,
      tier,
      cadence,
      shipping_info: shippingInfo,
      next_charge_date: nextChargeDate,
      status: 'active',
    })
    .select()
    .single();

  if (subErr) return res.status(500).json({ error: subErr.message });

  // 5. Save first order
  await supabase.from('orders').insert({
    items,
    total_usd: total,
    payment_method: 'card_subscription',
    payment_ref: paymentId,
    status: 'confirmed',
    shipping_info: shippingInfo,
  });

  sendConfirmation({
    to: shippingInfo.email,
    name: shippingInfo.name,
    items,
    total,
    paymentMethod: `${tier} Subscription`,
    paymentRef: paymentId,
    isSubscription: true,
  }).catch(() => {});

  res.json({ id: sub.id, paymentId, nextChargeDate });
}
