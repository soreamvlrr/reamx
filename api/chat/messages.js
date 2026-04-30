import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ADMIN_IDS = ['515793773435813901', '1305867949449416755'];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { ticketId, after = 0, userId } = req.query;
  if (!ticketId) return res.status(400).json({ error: 'ticketId manquant' });

  // Vérifie que le ticket appartient à l'user (sauf admin)
  if (userId && !ADMIN_IDS.includes(userId)) {
    const { data: ticket } = await supabase
      .from('tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single();
    if (!ticket || ticket.user_id !== userId) return res.status(403).json({ error: 'Accès refusé' });
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .gt('id', after)
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ messages });
}
