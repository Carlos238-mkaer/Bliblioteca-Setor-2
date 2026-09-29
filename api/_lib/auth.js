import jwt from 'jsonwebtoken';
export const assinar = (payload, exp = '7d') => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: exp });
// tipo: 'user' | 'admin'. Retorna o payload ou responde 401 e retorna null.
export function exigir(req, res, tipo) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET);
    if (p.tipo !== tipo) throw new Error('tipo');
    return p;
  } catch {
    res.status(401).json({ error: 'Acesso não autorizado.' });
    return null;
  }
}
export const metodo = (req, res, m) => {
  if (req.method === m) return true;
  res.status(405).json({ error: 'Método não permitido.' });
  return false;
};
