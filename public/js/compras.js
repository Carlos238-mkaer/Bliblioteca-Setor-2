// compras.js - catálogo, carrinho (1 unidade por livro) e biblioteca do leitor
const Compras = {
  listarLivros() { return Api.req('/books'); },

  // Carrinho: lista de livros (livro digital não tem quantidade)
  carrinho() { try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; } },
  salvar(cart) { localStorage.setItem('cart', JSON.stringify(cart)); },
  limpar() { localStorage.removeItem('cart'); },
  adicionar(cart, book) { return cart.some(b => b.id === book.id) ? cart : [...cart, book]; },
  total(cart) { return cart.reduce((s, b) => s + b.price, 0); },

  // Envia só os ids; o servidor busca os preços no banco
  async finalizar(cart) {
    if (!Api.getToken('user')) throw new Error('Entre na sua conta para finalizar a compra.');
    if (!cart.length) throw new Error('O carrinho está vazio.');
    const pedido = await Api.req('/orders', { method: 'POST', tipo: 'user', body: { bookIds: cart.map(b => b.id) } });
    this.limpar();
    return pedido;
  },

  // Livros comprados (com o link do arquivo para leitura)
  minhaBiblioteca() { return Api.req('/library', { tipo: 'user' }); },
  meusPedidos() { return Api.req('/orders/mine', { tipo: 'user' }); },

  // Somente administrador
  todosPedidos() { return Api.req('/orders', { tipo: 'admin' }); }
};
