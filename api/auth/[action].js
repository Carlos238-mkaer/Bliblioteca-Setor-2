import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { assinar, exigir, metodo } from '../_lib/auth.js';

export default async function handler(req, res) {
  const { action } = req.query;
  try {
    if (action === 'register') {
      if (!metodo(req, res, 'POST')) return;
      const { name, email, password } = req.body || {};
      if (!name || !email || !password || password.length < 6)
        return res.status(400).json({ error: 'Preencha nome, e-mail e senha (mín. 6 caracteres).' });
      const hash = await bcrypt.hash(password, 10);
      const [u] = await sql`INSERT INTO users (name, email, password_hash)
        VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${hash}) RETURNING id, name, email`;
      return res.status(201).json({ token: assinar({ tipo: 'user', id: u.id }), user: { ...u, role: 'Cliente' } });
    }
    if (action === 'login') {
      if (!metodo(req, res, 'POST')) return;
      const { email, password } = req.body || {};
      const [u] = await sql`SELECT * FROM users WHERE email = ${(email || '').toLowerCase().trim()}`;
      if (!u || !(await bcrypt.compare(password || '', u.password_hash)))
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      return res.json({ token: assinar({ tipo: 'user', id: u.id }), user: { id: u.id, name: u.name, email: u.email, role: 'Cliente' } });
    }
    if (action === 'me') {
      const p = exigir(req, res, 'user'); if (!p) return;
      const [u] = await sql`SELECT id, name, email FROM users WHERE id = ${p.id}`;
      if (!u) return res.status(401).json({ error: 'Usuário não encontrado.' });
      return res.json({ user: { ...u, role: 'Cliente' } });
    }
    res.status(404).json({ error: 'Rota não encontrada.' });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    console.error(e); res.status(500).json({ error: 'Erro interno.' });
  }
}
