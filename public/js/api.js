// api.js - base de comunicação com o backend (carregar ANTES dos outros js)
const API_URL = '/api'; // mesmo domínio da Vercel, sem CORS

const Api = {
  getToken(tipo = 'user') { return localStorage.getItem('token_' + tipo); },
  setToken(tipo, t) { t ? localStorage.setItem('token_' + tipo, t) : localStorage.removeItem('token_' + tipo); },

  // tipo: 'user' | 'admin' | null (rota pública)
  async req(path, { method = 'GET', body, tipo = null, form = false } = {}) {
    const headers = {};
    if (!form && body) headers['Content-Type'] = 'application/json';
    const token = tipo ? this.getToken(tipo) : null;
    if (token) headers.Authorization = 'Bearer ' + token;
    let res;
    try {
      res = await fetch(API_URL + path, { method, headers, body: form ? body : body ? JSON.stringify(body) : undefined });
    } catch { throw new Error('Não foi possível conectar ao servidor.'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Erro ' + res.status);
    return data;
  }
};
