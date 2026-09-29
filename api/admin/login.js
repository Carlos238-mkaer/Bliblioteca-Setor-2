import { createHash, timingSafeEqual } from 'node:crypto';
import { assinar, metodo } from '../_lib/auth.js';
const h = s => createHash('sha256').update(String(s)).digest();

export default function handler(req, res) {
  if (!metodo(req, res, 'POST')) return;
  // Avisos claros de configuração (aparecem na tela do painel)
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD não está configurada na Vercel.' });
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET não está configurada na Vercel.' });
  try {
    const { password } = req.body || {};
    if (!password || !timingSafeEqual(h(password), h(process.env.ADMIN_PASSWORD)))
      return res.status(401).json({ error: 'Senha administrativa incorreta.' });
    res.json({ token: assinar({ tipo: 'admin' }, '2h') });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao gerar o acesso: ' + e.message });
  }
}
