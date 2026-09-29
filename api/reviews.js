import { sql } from './_lib/db.js';
import { exigir } from './_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.json(await sql`SELECT r.id, r.rating, r.comment,
        COALESCE(u.name, 'Leitor') AS "userName", to_char(r.created_at, 'DD/MM/YYYY') AS date
        FROM reviews r LEFT JOIN users u ON u.id = r.user_id ORDER BY r.id DESC LIMIT 50`);
    }
    if (req.method === 'POST') {
      const p = exigir(req, res, 'user'); if (!p) return;
      const { rating, comment } = req.body || {};
      const nota = parseInt(rating);
      if (!(nota >= 1 && nota <= 5) || !comment?.trim()) return res.status(400).json({ error: 'Nota e comentário são obrigatórios.' });
      await sql`INSERT INTO reviews (user_id, rating, comment) VALUES (${p.id}, ${nota}, ${comment.trim()})`;
      return res.status(201).json({ ok: true });
    }
    res.status(405).json({ error: 'Método não permitido.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno.' }); }
}
