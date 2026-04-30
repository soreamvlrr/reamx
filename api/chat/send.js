import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ADMIN_IDS = ['515793773435813901', '1305867949449416755'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { ticketId, content, from, userId, username, avatar, adminId, adminUsername } = req.body;
  if (!ticketId || !content || !from) return res.status(400).json({ error: 'Paramètres manquants' });

  // Vérifie les droits
  if (from === 'admin') {
    const adminIdHeader = req.headers['x-admin-id'];
    if (!ADMIN_IDS.includes(adminIdHeader)) return res.status(403).json({ error: 'Accès refusé' });
  } else {
    const { data: ticket } = await supabase.from('tickets').select('user_id, status').eq('id', ticketId).single();
    if (!ticket || ticket.user_id !== userId) return res.status(403).json({ error: 'Accès refusé' });
    if (ticket.status === 'closed') return res.status(400).json({ error: 'Ticket fermé' });
  }

  const msgUsername = from === 'admin' ? (adminUsername || 'Admin') : username;

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ ticket_id: ticketId, from_role: from, username: msgUsername, content, ts: Date.now() })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Met à jour last_msg et last_ts sur le ticket
  await supabase.from('tickets').update({ last_msg: content, last_ts: Date.now() }).eq('id', ticketId);

  return res.json({ message });
}
