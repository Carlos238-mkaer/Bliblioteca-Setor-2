import { createHash, timingSafeEqual } from 'node:crypto';
import { assinar, metodo } from '../_lib/auth.js';
const h = s => createHash('sha256').update(String(s)).digest();

export default function handler(req, res) {
  if (!metodo(req, res, 'POST')) return;
  const { password } = req.body || {};
  if (!process.env.ADMIN_PASSWORD || !password || !timingSafeEqual(h(password), h(process.env.ADMIN_PASSWORD)))
    return res.status(401).json({ error: 'Senha administrativa incorreta.' });
  res.json({ token: assinar({ tipo: 'admin' }, '2h') });
}
