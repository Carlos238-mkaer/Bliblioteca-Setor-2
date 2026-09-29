// Envia a capa para o Vercel Blob (o disco da Vercel não guarda arquivos)
import { put } from '@vercel/blob';
import { exigir, metodo } from './_lib/auth.js';
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (!metodo(req, res, 'POST')) return;
  if (!exigir(req, res, 'admin')) return;
  const tipo = req.headers['content-type'] || '';
  if (!tipo.startsWith('image/')) return res.status(400).json({ error: 'Envie um arquivo de imagem.' });
  try {
    const nome = String(req.query.filename || 'capa').replace(/[^\w.-]/g, '_');
    const blob = await put('capas/' + nome, req, { access: 'public', addRandomSuffix: true, contentType: tipo });
    res.json({ url: blob.url });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Falha ao enviar a imagem.' }); }
}
