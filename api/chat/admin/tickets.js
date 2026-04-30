import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ADMIN_IDS = ['515793773435813901', '1305867949449416755'];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const adminId = req.headers['x-admin-id'];
  if (!ADMIN_IDS.includes(adminId)) return res.status(403).json({ error: 'Accès refusé' });

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .order('last_ts', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ tickets });
}
