import { sql } from '../_lib/db.js';
import { exigir } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') { // lista de todos os pedidos (admin)
      if (!exigir(req, res, 'admin')) return;
      const rows = await sql`SELECT o.id, o.total::float AS total, o.created_at,
        COALESCE(u.name, 'Cliente removido') AS "customerName"
        FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.id DESC`;
      return res.json(rows);
    }
    if (req.method === 'POST') { // nova compra (cliente)
      const p = exigir(req, res, 'user'); if (!p) return;
      const items = req.body?.items;
      if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Carrinho vazio.' });

      const baixados = [], linhas = []; let total = 0;
      for (const it of items) {
        const id = parseInt(it.bookId), q = parseInt(it.quantity);
        if (!id || !(q > 0) || q > 99) return await desfazer(res, baixados, 400, 'Item inválido no carrinho.');
        // baixa atômica: só funciona se houver estoque suficiente
        const r = await sql`UPDATE books SET stock = stock - ${q}
          WHERE id = ${id} AND stock >= ${q} RETURNING title, price::float AS price`;
        if (!r.length) return await desfazer(res, baixados, 409, 'Estoque insuficiente para um dos livros.');
        baixados.push({ id, q });
        linhas.push({ id, q, title: r[0].title, price: r[0].price });
        total += r[0].price * q;
      }
      const [o] = await sql`INSERT INTO orders (user_id, total) VALUES (${p.id}, ${total.toFixed(2)}) RETURNING id`;
      for (const l of linhas)
        await sql`INSERT INTO order_items (order_id, book_id, title, unit_price, quantity)
          VALUES (${o.id}, ${l.id}, ${l.title}, ${l.price}, ${l.q})`;
      return res.status(201).json({ id: o.id, total });
    }
    res.status(405).json({ error: 'Método não permitido.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno.' }); }
}

async function desfazer(res, baixados, status, error) { // devolve o estoque já baixado
  for (const b of baixados) await sql`UPDATE books SET stock = stock + ${b.q} WHERE id = ${b.id}`;
  return res.status(status).json({ error });
}
