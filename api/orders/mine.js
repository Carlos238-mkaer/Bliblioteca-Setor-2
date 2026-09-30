import { sql } from '../_lib/db.js';
import { exigir, metodo } from '../_lib/auth.js';
import { gerarPix } from '../_lib/pix.js';

export default async function handler(req, res) {
  if (!metodo(req, res, 'GET')) return;
  const p = exigir(req, res, 'user'); if (!p) return;
  try {
    const rows = await sql`SELECT id, total::float AS total, status, created_at FROM orders
      WHERE user_id = ${p.id} ORDER BY id DESC`;
    res.json(rows.map(o => ({ ...o, pix: o.status === 'pendente' ? gerarPix(o.id, o.total) : null })));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno.' }); }
}
