import { sql } from '../_lib/db.js';
import { exigir, metodo } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (!metodo(req, res, 'GET')) return;
  const p = exigir(req, res, 'user'); if (!p) return;
  try {
    res.json(await sql`SELECT id, total::float AS total, created_at FROM orders
      WHERE user_id = ${p.id} ORDER BY id DESC`);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno.' }); }
}
