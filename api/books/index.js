import { sql } from '../_lib/db.js';
import { exigir } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT id, title, author, category, price::float AS price, stock,
        synopsis, cover_url AS "coverUrl" FROM books ORDER BY id DESC`;
      return res.json(rows);
    }
    if (req.method === 'POST') {
      if (!exigir(req, res, 'admin')) return;
      const { title, author, category, price, stock, synopsis, cover_url } = req.body || {};
      if (!title || !author || !category || !(Number(price) > 0) || !(Number(stock) >= 0))
        return res.status(400).json({ error: 'Dados do livro inválidos.' });
      const [b] = await sql`INSERT INTO books (title, author, category, price, stock, synopsis, cover_url)
        VALUES (${title}, ${author}, ${category}, ${Number(price)}, ${parseInt(stock)}, ${synopsis || ''}, ${cover_url || null})
        RETURNING id`;
      return res.status(201).json(b);
    }
    res.status(405).json({ error: 'Método não permitido.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno.' }); }
}
