import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, username, avatar, service, serviceLabel } = req.body;
  if (!userId || !service) return res.status(400).json({ error: 'Paramètres manquants' });

  // Vérifie si un ticket ouvert existe déjà pour ce service
  const { data: existing } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .eq('service', service)
    .eq('status', 'open')
    .single();

  if (existing) return res.json({ ticket: existing });

  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({ user_id: userId, username, avatar, service, service_label: serviceLabel, status: 'open', last_ts: Date.now() })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Message système de bienvenue
  await supabase.from('messages').insert({
    ticket_id: ticket.id,
    from_role: 'system',
    username: 'Système',
    content: `✅ Ticket ouvert pour ${serviceLabel}. L'équipe ReamX va te répondre rapidement !`,
    ts: Date.now()
  });

  return res.json({ ticket });
}
