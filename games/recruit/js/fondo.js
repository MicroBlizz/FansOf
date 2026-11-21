// Fans of Recruit · EL FONDO de las Oficinas de Microblizz (1): lo que se ve por las ventanas. El cielo en franjas con trama
// de puntos, nubes gordas, tres filas de edificios cada vez más claros (el aire los aclara con la distancia), la torre de
// Microblizz con su letrero y un edificio recién «COMPRADO». Se pinta una vez y se guarda; al andar se mueve más despacio
// que la oficina, y eso da la sensación de lejos.
'use strict';

const CIELO = ['#3f8fd0', '#5aa6dc', '#7cbde6', '#a2d4ee', '#c8e8f2', '#e6f4ea'];
// cada fila de edificios: cuerpo, lado al sol, lado en sombra y ventanas
const CIUDAD = [
  { c: '#a9cfe6', l: '#bcdcee', s: '#9cc4de', v: '#98c0dc' },
  { c: '#86b2d6', l: '#9ac2e0', s: '#78a4ca', v: '#74a0c8' },
  { c: '#6090c0', l: '#78a6d0', s: '#5080b0', v: '#8cbadc' },
];
const TORRE = { c: '#3d68a8', l: '#5a88c6', s: '#2c4e8a', v: '#7cb0e2', o: '#1c3466' };

function nube(p, x, y, e) {
  const f = F.y(F.fun(3 * e, F.ov(x, y, 17 * e, 6 * e), F.ov(x - 9 * e, y - 3 * e, 8 * e, 6 * e), F.ov(x + 2 * e, y - 6 * e, 10 * e, 8 * e), F.ov(x + 12 * e, y - 2.4 * e, 8 * e, 5.4 * e)),
    F.rr(x - 40 * e, y - 40 * e, 80 * e, 42.4 * e, 0));
  p.parte(f, MAT.nube, { r: 7 * e, linea: false, sombra: 0 });
}
function edificio(g, x, base, w, h, C, sem) {
  const y = base - h, tipo = Math.floor(hash(sem) * 4), azotea = Math.floor(hash(sem + 7) * 5);
  rect(g, x, y, w, h, C.c);
  rect(g, x, y, 1, h, C.l); rect(g, x + w - 1, y, 1, h, C.s);
  if (tipo === 0) for (let j = y + 3; j < base - 1; j += 3) rect(g, x + 2, j, w - 4, 1, C.v);                 // plantas
  else if (tipo === 1) for (let i = x + 2; i < x + w - 2; i += 3) rect(g, i, y + 3, 1, h - 3, C.v);           // franjas
  else if (tipo === 2) { for (let j = y + 3; j < base - 2; j += 4) for (let i = x + 2; i < x + w - 3; i += 3) if (hash2(i, j, sem) < 0.8) rect(g, i, j, 2, 2, C.v); }
  else {                                                                                                         // cristal
    const cl = rgba(C.l);
    pixeles(g, x + 1, y + 1, w - 2, h - 1, (i, j) => ((i - x + j - y) % 14 < 5 && bayer(i, j) < 0.5 ? cl : undefined));
    for (let j = y + 5; j < base; j += 6) rect(g, x + 1, j, w - 2, 1, C.s);
  }
  if (azotea === 0) rect(g, x + 2, y - 2, Math.max(2, w - 6), 2, C.s);
  else if (azotea === 1) { rect(g, x + (w >> 1), y - 7, 1, 7, C.s); rect(g, x + (w >> 1) - 1, y - 2, 3, 2, C.c); }
  else if (azotea === 2) { rect(g, x + 2, y - 4, w - 4, 4, C.c); rect(g, x + 2, y - 4, 1, 4, C.l); rect(g, x + 2, y - 4, w - 4, 1, C.l); }
  else if (azotea === 3) { rect(g, x + w - 6, y - 4, 4, 4, C.s); rect(g, x + w - 7, y - 5, 6, 1, C.c); }      // depósito de agua
  rect(g, x, y, w, 1, C.l);
}
function filaEdificios(g, W, base, capa, sem, alto0, alto1) {
  let x = -6 - Math.floor(hash(sem) * 8), k = 0;
  while (x < W) {
    const s = sem * 131 + k * 17, w = 9 + Math.floor(hash(s + 1) * 15), h = alto0 + Math.floor(hash(s + 2) * (alto1 - alto0));
    edificio(g, x, base, w, h, CIUDAD[capa], s + 3);
    x += w + (hash(s + 4) < 0.3 ? 1 + Math.floor(hash(s + 5) * 6) : 0); k++;
  }
}
// la torre de Microblizz: de cristal azul, con un letrero de arriba abajo y la antena con su luz roja
function torreMicroblizz(g, x, base, h) {
  const T = TORRE, y = base - h, w = 30;
  rect(g, x, y + 14, w, h - 14, T.c); rect(g, x + 4, y + 6, w - 8, 8, T.c); rect(g, x + 9, y, w - 18, 6, T.c);
  for (const [a, b, c, d] of [[x, y + 14, 1, h - 14], [x + 4, y + 6, 1, 8], [x + 9, y, 1, 6], [x, y + 14, 4, 1], [x + 4, y + 6, 5, 1], [x + 9, y, w - 18, 1]]) rect(g, a, b, c, d, T.l);
  for (const [a, b, c, d] of [[x + w - 1, y + 14, 1, h - 14], [x + w - 5, y + 6, 1, 8], [x + w - 10, y, 1, 6]]) rect(g, a, b, c, d, T.s);
  // el cristal: plantas y el reflejo del cielo en diagonal
  for (let j = y + 18; j < base; j += 4) rect(g, x + 2, j, w - 4, 1, T.s);
  const cv = rgba(T.v), cl = rgba(T.l);
  pixeles(g, x + 2, y + 15, w - 4, h - 15, (i, j, v) => { const d = (i - x) * 2 + (j - y); return v === rgba(T.c) && d % 46 < 12 ? (bayer(i, j) < 0.55 ? cv : cl) : undefined; });
  // el letrero de arriba abajo, con su marco
  const lx = x + 11, ly = y + 33, texto = 'MICROBLIZZ';
  rect(g, lx - 2, ly - 2, 9, texto.length * 6 + 3, T.o); rect(g, lx - 2, ly - 2, 9, 1, T.s);
  [...texto].forEach((ch, k) => { const gl = MINI[ch]; escribe(g, ch, lx + Math.floor((5 - gl[0].length) / 2), ly + k * 6, { fuente: 'mini', c: '#eaf4ff', borde: null, sombra: null }); });
  // la antena
  rect(g, x + 14, y - 12, 1, 12, T.s); rect(g, x + 13, y - 4, 3, 1, T.s); rect(g, x + 14, y - 13, 1, 1, '#ff5a5a');
}
// todo lo de lejos, en un lienzo de W × H (H = el alto de las ventanas)
function pintaLejos(W, H) {
  const c = lienzoNuevo(W, H), g = c.getContext('2d');
  franjas(g, 0, 0, W, H, CIELO, { curva: 0.85, zona: 0.55 });
  // nubes: se pintan aparte (con volumen) y se pegan. El mismo grupo se repite a lo ancho, cada vez un poco distinto
  const p = new Pincel(W, H, 0, 0);
  for (let x0 = 0, k = 0; x0 < W; x0 += 430, k++) for (const [x, y, e] of [[46, 40, 1.15], [150, 22, 0.8], [236, 52, 1.3], [330, 30, 1], [400, 58, 0.9], [96, 66, 0.6]]) nube(p, x0 + x + (k ? Math.round(hash(x + k) * 40 - 20) : 0), y + (k ? Math.round(hash(y + k * 7) * 12 - 6) : 0), e);
  g.drawImage(p.lienzo().c, 0, 0);
  filaEdificios(g, W, H, 0, 11, 16, 40);
  filaEdificios(g, W, H, 1, 23, 22, 54);
  // los edificios que Microblizz acaba de comprar (o de cerrar): con su pancarta roja
  const bw = 38, bh = 58;
  for (const [bx, txt, sem] of [[53, 'COMPRADO', 4242], [196, 'CERRADO', 4250], [478, 'COMPRADO', 4244], [652, 'CERRADO', 4247], [846, 'COMPRADO', 4249]]) {
    if (bx > W) continue;
    edificio(g, bx, H, bw, bh, CIUDAD[1], sem);
    rect(g, bx + 1, H - bh + 8, bw - 2, 9, '#b83a3c'); rect(g, bx + 1, H - bh + 8, bw - 2, 1, '#d86a5c'); rect(g, bx + 1, H - bh + 16, bw - 2, 1, '#8c2a34');
    escribe(g, tr(txt), bx + bw / 2, H - bh + 10, { fuente: 'mini', c: '#ffe9d6', borde: null, sombra: null, alin: 'centro' });
  }
  filaEdificios(g, W, H, 2, 37, 14, 40);
  torreMicroblizz(g, 280, H, 96);
  // delante de la torre, dos edificios bajos que la asientan
  edificio(g, 272, H, 13, 13, CIUDAD[2], 901); edificio(g, 302, H, 17, 18, CIUDAD[2], 902);
  // la calima: abajo del todo el aire lo aclara todo un poco
  trama(g, 0, H - 12, W, 12, '#c8e8f2', (i, j) => (j - (H - 12)) / 12 * 0.36);
  return c;
}
