import { sql } from '../_lib/db.js';
import { exigir } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') { // público: nunca devolve o file_url
      return res.json(await sql`SELECT id, title, author, category, price::float AS price, synopsis,
        cover_url AS "coverUrl", (file_url IS NOT NULL) AS "hasFile" FROM books ORDER BY id DESC`);
    }
    if (req.method === 'POST') {
      if (!exigir(req, res, 'admin')) return;
      const { title, author, category, price, synopsis, cover_url, file_url } = req.body || {};
      if (!title || !author || !category || !(Number(price) > 0))
        return res.status(400).json({ error: 'Dados do livro inválidos.' });
      const [b] = await sql`INSERT INTO books (title, author, category, price, synopsis, cover_url, file_url)
        VALUES (${title}, ${author}, ${category}, ${Number(price)}, ${synopsis || ''}, ${cover_url || null}, ${file_url || null})
        RETURNING id`;
      return res.status(201).json(b);
    }
    res.status(405).json({ error: 'Método não permitido.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno.' }); }
}
