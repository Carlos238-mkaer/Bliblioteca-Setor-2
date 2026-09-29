// Biblioteca do leitor: só devolve o arquivo (file_url) dos livros que ele comprou
import { sql } from './_lib/db.js';
import { exigir, metodo } from './_lib/auth.js';

export default async function handler(req, res) {
  if (!metodo(req, res, 'GET')) return;
  const p = exigir(req, res, 'user'); if (!p) return;
  try {
    res.json(await sql`SELECT b.id, b.title, b.author, b.category, b.synopsis,
      b.cover_url AS "coverUrl", b.file_url AS "fileUrl", ub.purchased_at
      FROM user_books ub JOIN books b ON b.id = ub.book_id
      WHERE ub.user_id = ${p.id} ORDER BY ub.purchased_at DESC`);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno.' }); }
}
