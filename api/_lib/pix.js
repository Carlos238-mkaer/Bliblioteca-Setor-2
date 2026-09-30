// Gera o "Pix copia e cola" (BR Code estático) com valor e identificador do pedido
const f = (id, v) => id + String(v.length).padStart(2, '0') + v;
const limpar = (s, n) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^A-Za-z0-9 ]/g, '').toUpperCase().slice(0, n);

function crc16(s) {
  let c = 0xFFFF;
  for (let i = 0; i < s.length; i++) {
    c ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF;
  }
  return c.toString(16).toUpperCase().padStart(4, '0');
}

export function gerarPix(pedidoId, valor) {
  const chave = (process.env.PIX_KEY || '').trim();
  if (!chave) return null;
  const nome = limpar(process.env.PIX_NAME || 'LUMINA LIVROS', 25);
  const cidade = limpar(process.env.PIX_CITY || 'SAO PAULO', 15);
  const p = f('00', '01') + f('01', '11') +
    f('26', f('00', 'br.gov.bcb.pix') + f('01', chave)) +
    f('52', '0000') + f('53', '986') + f('54', Number(valor).toFixed(2)) + f('58', 'BR') +
    f('59', nome) + f('60', cidade) + f('62', f('05', 'LUMINA' + pedidoId)) + '6304';
  return p + crc16(p);
}
