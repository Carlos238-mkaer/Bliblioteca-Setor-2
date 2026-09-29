// Envia capas (imagem) e livros (PDF) para o Vercel Blob
import { put } from '@vercel/blob';
import { exigir, metodo } from './_lib/auth.js';
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (!metodo(req, res, 'POST')) return;
  if (!exigir(req, res, 'admin')) return;
  const tipo = req.headers['content-type'] || '';
  const ehImagem = tipo.startsWith('image/'), ehPdf = tipo === 'application/pdf';
  if (!ehImagem && !ehPdf) return res.status(400).json({ error: 'Envie uma imagem (capa) ou um PDF (livro).' });
  try {
    const nome = String(req.query.filename || 'arquivo').replace(/[^\w.-]/g, '_');
    const blob = await put((ehImagem ? 'capas/' : 'livros/') + nome, req,
      { access: 'public', addRandomSuffix: true, contentType: tipo });
    res.json({ url: blob.url });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Falha ao enviar o arquivo.' }); }
}
