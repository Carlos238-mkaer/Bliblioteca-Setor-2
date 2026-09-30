import { sql } from '../_lib/db.js';
import { exigir } from '../_lib/auth.js';
import { gerarPix } from '../_lib/pix.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') { // todos os pedidos (admin)
      if (!exigir(req, res, 'admin')) return;
      return res.json(await sql`SELECT o.id, o.total::float AS total, o.status, o.created_at,
        COALESCE(u.name, 'Cliente removido') AS "customerName"
        FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.id DESC`);
    }
    if (req.method === 'POST') { // novo pedido (cliente): fica PENDENTE até o admin confirmar o Pix
      const p = exigir(req, res, 'user'); if (!p) return;
      if (!process.env.PIX_KEY) return res.status(500).json({ error: 'Chave Pix não configurada (PIX_KEY).' });
      const ids = [...new Set((req.body?.bookIds || []).map(Number).filter(Number.isInteger))];
      if (!ids.length || ids.length > 50) return res.status(400).json({ error: 'Carrinho vazio ou inválido.' });

      const found = await sql`SELECT id FROM books WHERE id = ANY(${ids}::int[])`;
      if (found.length !== ids.length) return res.status(400).json({ error: 'Um dos livros não existe mais.' });
      const owned = await sql`SELECT book_id FROM user_books WHERE user_id = ${p.id} AND book_id = ANY(${ids}::int[])`;
      if (owned.length) return res.status(409).json({ error: 'Você já possui um dos livros do carrinho.' });

      const [o] = await sql`
        WITH o AS (
          INSERT INTO orders (user_id, total, status)
          SELECT ${p.id}::int, SUM(price), 'pendente' FROM books WHERE id = ANY(${ids}::int[]) RETURNING id, total),
        i AS (
          INSERT INTO order_items (order_id, book_id, title, unit_price)
          SELECT o.id, b.id, b.title, b.price FROM o, books b WHERE b.id = ANY(${ids}::int[]) RETURNING 1)
        SELECT id, total::float AS total FROM o`;
      return res.status(201).json({ ...o, status: 'pendente', pix: gerarPix(o.id, o.total) });
    }
    res.status(405).json({ error: 'Método não permitido.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno.' }); }
}
