import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ADMIN_IDS = ['515793773435813901', '1305867949449416755'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const adminId = req.headers['x-admin-id'];
  if (!ADMIN_IDS.includes(adminId)) return res.status(403).json({ error: 'Accès refusé' });

  const { ticketId } = req.body;
  if (!ticketId) return res.status(400).json({ error: 'ticketId manquant' });

  const { error } = await supabase
    .from('tickets')
    .update({ status: 'closed' })
    .eq('id', ticketId);

  if (error) return res.status(500).json({ error: error.message });

  // Message système de fermeture
  await supabase.from('messages').insert({
    ticket_id: ticketId,
    from_role: 'system',
    username: 'Système',
    content: '🔒 Ce ticket a été fermé par l\'équipe ReamX.',
    ts: Date.now()
  });

  return res.json({ success: true });
}
