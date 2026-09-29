// auth.js - login/cadastro de clientes e acesso do administrador
const Auth = {
  async register(name, email, password) {
    if (password.length < 6) throw new Error('A senha precisa ter ao menos 6 caracteres.');
    const d = await Api.req('/auth/register', { method: 'POST', body: { name, email, password } });
    Api.setToken('user', d.token);
    return d.user;
  },
  async login(email, password) {
    const d = await Api.req('/auth/login', { method: 'POST', body: { email, password } });
    Api.setToken('user', d.token);
    return d.user;
  },
  // retorna o usuário logado ou null (use no initApp)
  async me() {
    if (!Api.getToken('user')) return null;
    try { return (await Api.req('/auth/me', { tipo: 'user' })).user; }
    catch { Api.setToken('user', null); return null; }
  },
  logout() { Api.setToken('user', null); },

  // Administrador: senha própria, token separado do cliente
  async adminLogin(password) {
    const d = await Api.req('/admin/login', { method: 'POST', body: { password } });
    Api.setToken('admin', d.token);
  },
  adminLogado() { return !!Api.getToken('admin'); },
  adminLogout() { Api.setToken('admin', null); }
};
