import { sql } from './_lib/db.js';
import { exigir } from './_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.json(await sql`SELECT id, question, answer FROM questions ORDER BY id DESC LIMIT 50`);
    }
    if (req.method === 'POST') {
      const p = exigir(req, res, 'user'); if (!p) return;
      const q = req.body?.question?.trim();
      if (!q) return res.status(400).json({ error: 'Escreva sua dúvida.' });
      await sql`INSERT INTO questions (user_id, question) VALUES (${p.id}, ${q})`;
      return res.status(201).json({ ok: true });
    }
    res.status(405).json({ error: 'Método não permitido.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno.' }); }
}
