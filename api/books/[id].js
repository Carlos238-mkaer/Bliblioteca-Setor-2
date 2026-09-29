import { sql } from '../_lib/db.js';
import { exigir, metodo } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (!metodo(req, res, 'DELETE')) return;
  if (!exigir(req, res, 'admin')) return;
  try {
    await sql`DELETE FROM books WHERE id = ${parseInt(req.query.id)}`;
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno.' }); }
}
