import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, source = 'website' } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const { error } = await supabase
    .from('subscribers')
    .upsert({ email, source }, { onConflict: 'email' });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ ok: true });
}
