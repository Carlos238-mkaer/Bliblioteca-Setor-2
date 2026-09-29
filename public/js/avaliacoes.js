// avaliacoes.js - avaliações e dúvidas dos leitores
const Avaliacoes = {
  listar() { return Api.req('/reviews'); },
  async enviar(rating, comment) {
    if (!comment.trim()) throw new Error('Escreva um comentário.');
    if (rating < 1 || rating > 5) throw new Error('A nota deve ser de 1 a 5.');
    return Api.req('/reviews', { method: 'POST', tipo: 'user', body: { rating, comment } });
  },
  listarDuvidas() { return Api.req('/questions'); },
  enviarDuvida(question) {
    if (!question.trim()) throw new Error('Escreva sua dúvida.');
    return Api.req('/questions', { method: 'POST', tipo: 'user', body: { question } });
  }
};
