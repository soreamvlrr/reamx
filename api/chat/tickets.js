import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId manquant' });

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('last_ts', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ tickets });
}
