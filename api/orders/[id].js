// Admin: confirma o Pix recebido (libera os livros) ou cancela o pedido
import { sql } from '../_lib/db.js';
import { exigir, metodo } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (!metodo(req, res, 'PATCH')) return;
  if (!exigir(req, res, 'admin')) return;
  const id = parseInt(req.query.id), action = req.body?.action;
  if (!id || !['confirmar', 'cancelar'].includes(action)) return res.status(400).json({ error: 'Requisição inválida.' });
  try {
    let r;
    if (action === 'confirmar') {
      r = await sql`
        WITH o AS (UPDATE orders SET status = 'pago', paid_at = now()
                   WHERE id = ${id} AND status = 'pendente' RETURNING id, user_id),
        u AS (INSERT INTO user_books (user_id, book_id, order_id)
              SELECT o.user_id, oi.book_id, o.id FROM o JOIN order_items oi ON oi.order_id = o.id
              WHERE oi.book_id IS NOT NULL AND o.user_id IS NOT NULL
              ON CONFLICT DO NOTHING RETURNING 1)
        SELECT id FROM o`;
    } else {
      r = await sql`UPDATE orders SET status = 'cancelado' WHERE id = ${id} AND status = 'pendente' RETURNING id`;
    }
    if (!r.length) return res.status(409).json({ error: 'Este pedido não está mais pendente.' });
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno.' }); }
}
