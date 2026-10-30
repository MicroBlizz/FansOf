// Fans of Ratkov · ICONOS de los objetos: cada uno se dibuja píxel a píxel en un lienzo de 16 x 16 con formas sencillas; luego se le pone
// un contorno oscuro de un píxel por fuera y se guarda como imagen. En pantalla se amplía sin suavizar. Nada de emojis.
'use strict';
const ICONO_CACHE = {};
const CONTORNO = '#120e18';
function iconoDe(id) {
  if (ICONO_CACHE[id]) return ICONO_CACHE[id];
  const c = document.createElement('canvas'); c.width = c.height = 18;
  const g = c.getContext('2d');
  g.translate(1, 1);
  const f = DIBUJOS[id] || DIBUJOS._;
  f(g);
  // contorno: cada píxel vacío que toca uno pintado
  const d = g.getImageData(0, 0, 18, 18), a = i => d.data[i * 4 + 3] > 0, borde = [];
  for (let y = 0; y < 18; y++) for (let x = 0; x < 18; x++) {
    const i = y * 18 + x; if (a(i)) continue;
    if ((x > 0 && a(i - 1)) || (x < 17 && a(i + 1)) || (y > 0 && a(i - 18)) || (y < 17 && a(i + 18))) borde.push([x, y]);
  }
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = CONTORNO; for (const [x, y] of borde) g.fillRect(x, y, 1, 1);
  ICONO_LIENZO[id] = c;
  return (ICONO_CACHE[id] = c.toDataURL());
}
// el mismo icono como lienzo (18 x 18, con su contorno), para dibujarlo dentro de otra cosa
const ICONO_LIENZO = {};
function iconoLienzo(id) { iconoDe(id); return ICONO_LIENZO[id]; }
// trocitos para dibujar
const px = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function circulo(g, cx, cy, r, c) { g.fillStyle = c; for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) g.fillRect(cx + x, cy + y, 1, 1); }
function linea(g, x0, y0, x1, y1, c, w = 1) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); g.fillStyle = c; for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w, w); }
// un arma vista de lado: cañón, cuerpo, empuñadura, culata y cargador
function armaIcono(g, o) {
  const m = o.metal || '#4a4f58', l = o.luz || '#7a828e', mad = o.madera || '#8a5a32';
  px(g, o.x0, 6, o.largo, 2, m); px(g, o.x0, 6, o.largo, 1, l);
  px(g, o.cx, 5, o.cw, 4, m); px(g, o.cx, 5, o.cw, 1, l);
  px(g, o.cx + 1, 9, 2, 4, '#2a2d33');
  if (o.culata) { px(g, 0, 6, o.cx, 3, mad); px(g, 0, 7, 2, 3, mad); }
  if (o.carg) { px(g, o.cx + o.cw - 3, 9, 2, o.carg, o.cargC || '#2a2d33'); if (o.curvo) px(g, o.cx + o.cw - 2, 9 + o.carg, 2, 1, '#2a2d33'); }
  if (o.mira) { px(g, o.cx + 1, 3, 5, 2, '#22252b'); px(g, o.cx + 1, 3, 1, 2, '#6ad8ff'); }
}
function anomIcono(g, base, acento) {
  px(g, 6, 2, 9, 9, '#39d5e8'); px(g, 1, 5, 9, 9, '#ff4b5c');
  px(g, 3, 3, 10, 10, base); px(g, 4, 4, 8, 3, '#e2c8ff'); px(g, 6, 5, 2, 2, CONTORNO); px(g, 9, 5, 2, 2, CONTORNO);
  acento(g); px(g, 0, 14, 5, 1, '#39d5e8'); px(g, 11, 1, 5, 1, '#ff4b5c');
}
function chalecoIcono(g, c, c2) { px(g, 3, 2, 3, 3, c); px(g, 10, 2, 3, 3, c); px(g, 2, 4, 12, 10, c); px(g, 6, 2, 4, 3, '#00000000'); px(g, 3, 8, 3, 3, c2); px(g, 7, 8, 3, 3, c2); px(g, 11, 8, 2, 3, c2); px(g, 2, 4, 12, 1, '#ffffff33'); }
function mochilaIcono(g, h) { const y = 15 - h; px(g, 3, y, 10, h, '#7a5a34'); px(g, 4, y - 2, 8, 3, '#5a4024'); px(g, 3, y + 3, 10, 1, '#5a4024'); px(g, 5, y + 5, 6, h - 7, '#8e6c40'); px(g, 7, y + 6, 2, 1, '#ffcb3d'); }

const DIBUJOS = {
  _: g => { px(g, 3, 3, 10, 10, '#8a8f99'); },
  tornillos: g => { for (const [x, y] of [[2, 3], [8, 2], [5, 9]]) { px(g, x, y, 5, 2, '#b8c0cc'); px(g, x + 2, y + 2, 1, 4, '#8a9099'); } },
  tuberia: g => { linea(g, 1, 13, 13, 1, '#7a828e', 3); linea(g, 1, 12, 12, 1, '#b8c0cc'); px(g, 12, 0, 3, 3, '#5a6068'); px(g, 0, 12, 3, 3, '#5a6068'); },
  cables: g => { linea(g, 1, 4, 14, 6, '#e0484f', 2); linea(g, 1, 9, 14, 11, '#3a7de0', 2); px(g, 13, 5, 2, 2, '#c8a030'); px(g, 13, 10, 2, 2, '#c8a030'); },
  tela: g => { px(g, 2, 4, 12, 9, '#a89070'); px(g, 2, 7, 12, 1, '#8a7458'); px(g, 2, 10, 12, 1, '#8a7458'); px(g, 3, 4, 10, 1, '#c8b090'); },
  cinta: g => { circulo(g, 8, 8, 6, '#9aa2ac'); circulo(g, 8, 8, 3, '#00000000'); g.clearRect(6, 6, 5, 5); px(g, 4, 3, 4, 2, '#c8d0d8'); },
  polvora: g => { px(g, 4, 5, 8, 9, '#3a3430'); px(g, 5, 3, 6, 3, '#4a4440'); px(g, 6, 2, 4, 1, '#c8a030'); px(g, 6, 8, 4, 3, '#ff8a3a'); },
  lente: g => { circulo(g, 8, 8, 6, '#3a4048'); circulo(g, 8, 8, 4, '#4aa8e0'); px(g, 6, 5, 2, 2, '#c8f0ff'); },
  alcohol: g => { px(g, 6, 1, 4, 3, '#c8d0d8'); px(g, 4, 4, 8, 11, '#9ad8e8'); px(g, 4, 8, 8, 4, '#f0f4f8'); px(g, 7, 9, 2, 2, '#e0484f'); },
  hierbas: g => { linea(g, 8, 15, 8, 4, '#2c6a34'); for (const [x, y, d] of [[4, 5, 1], [10, 3, -1], [3, 10, 1], [11, 8, -1]]) { px(g, x, y, 4, 2, '#52b846'); px(g, x + d, y + 1, 3, 2, '#3c9a3a'); } },
  lata: g => { px(g, 4, 3, 8, 11, '#9aa2ac'); px(g, 4, 6, 8, 5, '#c84a3a'); px(g, 4, 3, 8, 1, '#c8d0d8'); px(g, 6, 7, 4, 2, '#f9c531'); },
  placa: g => { px(g, 2, 2, 12, 12, '#4a5058'); px(g, 3, 3, 10, 1, '#6a727c'); for (const [x, y] of [[3, 3], [12, 3], [3, 12], [12, 12]]) px(g, x, y, 1, 1, '#b8c0cc'); },
  chip: g => { px(g, 3, 3, 10, 10, '#2c7a44'); px(g, 5, 5, 6, 6, '#1a1c22'); for (let i = 0; i < 4; i++) { px(g, 1, 4 + i * 2, 2, 1, '#e0b030'); px(g, 13, 4 + i * 2, 2, 1, '#e0b030'); } px(g, 6, 6, 2, 2, '#58c8ff'); },
  taza: g => { px(g, 3, 4, 8, 10, '#f0ece4'); px(g, 11, 6, 3, 5, '#f0ece4'); px(g, 12, 7, 1, 3, '#00000000'); g.clearRect(12, 7, 1, 3); px(g, 4, 8, 6, 1, '#c9a032'); px(g, 3, 4, 8, 1, '#5a3a20'); },
  disco: g => { px(g, 2, 3, 12, 10, '#2a2e36'); circulo(g, 8, 8, 3, '#b8c0cc'); px(g, 8, 8, 1, 1, '#2a2e36'); px(g, 3, 4, 3, 1, '#58c8ff'); },
  documentos: g => { px(g, 4, 2, 9, 12, '#d8d4c8'); px(g, 2, 4, 9, 11, '#f0ece0'); for (let i = 0; i < 4; i++) px(g, 4, 6 + i * 2, 5, 1, '#8a8a8a'); circulo(g, 9, 12, 2, '#c8202c'); },
  figura: g => { px(g, 5, 7, 6, 7, '#f4f2ff'); px(g, 5, 3, 6, 5, '#f4f2ff'); px(g, 5, 0, 2, 4, '#f4f2ff'); px(g, 9, 0, 2, 4, '#f4f2ff'); px(g, 6, 1, 1, 2, '#f595be'); px(g, 5, 2, 6, 1, '#f9c531'); px(g, 9, 5, 2, 2, '#8a2bff'); px(g, 4, 14, 8, 2, '#3a3e48'); px(g, 3, 8, 3, 4, '#ff7a1a'); },
  mando: g => { px(g, 2, 5, 12, 6, '#f9c531'); px(g, 1, 7, 3, 6, '#f9c531'); px(g, 12, 7, 3, 6, '#f9c531'); px(g, 3, 5, 10, 1, '#fff2a0'); px(g, 4, 7, 3, 1, '#a8600e'); px(g, 5, 6, 1, 3, '#a8600e'); px(g, 10, 6, 1, 1, '#c8202c'); px(g, 12, 8, 1, 1, '#3a7de0'); },
  grafica: g => { px(g, 1, 4, 14, 8, '#2a2e36'); circulo(g, 5, 8, 3, '#4a505a'); circulo(g, 11, 8, 3, '#4a505a'); px(g, 5, 8, 1, 1, '#1a1c22'); px(g, 11, 8, 1, 1, '#1a1c22'); px(g, 1, 12, 10, 2, '#2c7a44'); px(g, 2, 13, 8, 1, '#e0b030'); px(g, 1, 4, 14, 1, '#7ee04a'); },
  blizzcoin: g => { circulo(g, 8, 8, 6, '#e0a820'); circulo(g, 8, 8, 4, '#f9c531'); px(g, 6, 5, 4, 6, '#3a7de0'); px(g, 7, 6, 2, 4, '#f9c531'); },
  muestra: g => { px(g, 6, 1, 4, 2, '#8a9099'); px(g, 5, 3, 6, 11, '#c8e0f0'); px(g, 5, 7, 6, 7, '#8a2bff'); px(g, 6, 8, 2, 2, '#e2c8ff'); px(g, 8, 11, 1, 1, '#39d5e8'); },
  cafe: g => { px(g, 4, 3, 8, 11, '#f0ece4'); px(g, 3, 2, 10, 2, '#5a3a20'); px(g, 4, 7, 8, 3, '#a87a4e'); },
  m9: g => { for (const x of [3, 7, 11]) { px(g, x, 5, 3, 8, '#c8a030'); px(g, x, 3, 3, 3, '#b8763a'); px(g, x, 12, 3, 1, '#8a6a20'); } },
  cart: g => { for (const x of [3, 9]) { px(g, x, 3, 5, 8, '#c8202c'); px(g, x, 11, 5, 3, '#c8a030'); px(g, x + 1, 4, 1, 6, '#e85050'); } },
  m762: g => { for (const x of [4, 9]) { px(g, x, 4, 3, 10, '#c8a030'); px(g, x + 1, 1, 1, 3, '#b8763a'); px(g, x, 3, 3, 1, '#b8763a'); } },
  venda: g => { circulo(g, 8, 8, 6, '#f4f2ec'); circulo(g, 8, 8, 2, '#c8c4bc'); px(g, 3, 13, 10, 2, '#f4f2ec'); px(g, 11, 4, 3, 1, '#e0484f'); px(g, 12, 3, 1, 3, '#e0484f'); },
  botiquin: g => { px(g, 2, 4, 12, 10, '#d8303a'); px(g, 6, 2, 4, 3, '#a02028'); px(g, 7, 6, 2, 6, '#ffffff'); px(g, 5, 8, 6, 2, '#ffffff'); },
  te: g => { px(g, 5, 1, 6, 3, '#3a3e48'); px(g, 4, 4, 8, 11, '#3a8a5a'); px(g, 4, 8, 8, 2, '#c8d0d8'); px(g, 5, 4, 2, 10, '#5ab07a'); },
  inyector: g => { linea(g, 2, 13, 11, 4, '#f9c531', 3); linea(g, 11, 4, 14, 1, '#c8d0d8'); px(g, 1, 12, 3, 3, '#5a6068'); px(g, 5, 9, 2, 2, '#ff6a1a'); },
  granada: g => { for (let i = 0; i < 6; i++) px(g, 3 + i, 4 + i, 6 - Math.floor(i / 2), 3, '#ff7a1a'); px(g, 10, 12, 2, 2, '#ff7a1a'); px(g, 2, 1, 2, 4, '#52b846'); px(g, 4, 1, 2, 3, '#3c9a3a'); px(g, 0, 3, 3, 2, '#52b846'); circulo(g, 6, 6, 1, '#c8a030'); },
  pistola: g => armaIcono(g, { x0: 8, largo: 7, cx: 4, cw: 6 }),
  metralleta: g => armaIcono(g, { x0: 9, largo: 6, cx: 3, cw: 8, carg: 5, culata: false }),
  escopeta: g => armaIcono(g, { x0: 6, largo: 10, cx: 3, cw: 6, culata: true, metal: '#3a3a3a' }),
  fusil: g => armaIcono(g, { x0: 9, largo: 7, cx: 3, cw: 8, carg: 5, curvo: true, culata: true, cargC: '#4a3a2a' }),
  franco: g => armaIcono(g, { x0: 8, largo: 8, cx: 3, cw: 7, carg: 3, culata: true, mira: true, metal: '#3a4a3a' }),
  silenciador: g => { px(g, 1, 6, 14, 5, '#3a3e44'); px(g, 1, 6, 14, 1, '#7a828e'); px(g, 13, 7, 2, 3, '#1a1c22'); },
  canon: g => { px(g, 0, 7, 16, 3, '#4a4f58'); px(g, 0, 7, 16, 1, '#8a929e'); px(g, 13, 6, 3, 5, '#3a3e44'); },
  mira: g => { px(g, 2, 5, 12, 5, '#22252b'); circulo(g, 3, 7, 3, '#3a3e44'); px(g, 1, 6, 2, 3, '#6ad8ff'); px(g, 6, 10, 4, 3, '#3a3e44'); },
  cargador: g => { px(g, 5, 1, 6, 6, '#3a3e44'); px(g, 6, 6, 6, 5, '#3a3e44'); px(g, 7, 10, 6, 5, '#3a3e44'); px(g, 6, 2, 4, 1, '#c8a030'); },
  culata: g => { px(g, 2, 5, 12, 4, '#8a5a32'); px(g, 1, 7, 4, 7, '#8a5a32'); px(g, 2, 5, 12, 1, '#b07a4a'); },
  'an-lag': g => anomIcono(g, '#8a2bff', g => { px(g, 13, 8, 3, 2, '#ffffff'); px(g, 1, 8, 2, 2, '#ffffff'); }),
  'an-crack': g => anomIcono(g, '#6a20c0', g => { linea(g, 4, 12, 12, 4, '#ffcb3d'); }),
  'an-rebote': g => anomIcono(g, '#8a2bff', g => { linea(g, 2, 2, 7, 7, '#7ee04a'); linea(g, 7, 7, 13, 2, '#7ee04a'); }),
  'an-hitbox': g => anomIcono(g, '#a03af0', g => { px(g, 2, 2, 12, 1, '#ffffff'); px(g, 2, 13, 12, 1, '#ffffff'); px(g, 2, 2, 1, 12, '#ffffff'); px(g, 13, 2, 1, 12, '#ffffff'); }),
  'an-hielo': g => anomIcono(g, '#5a3ae0', g => { px(g, 7, 9, 2, 6, '#c8f0ff'); px(g, 5, 11, 6, 2, '#c8f0ff'); }),
  'an-desync': g => anomIcono(g, '#8a2bff', g => { px(g, 0, 10, 16, 1, '#39d5e8'); px(g, 2, 12, 12, 1, '#ff4b5c'); }),
  'chaleco-l': g => chalecoIcono(g, '#5a6244', '#3a4028'),
  'chaleco-p': g => { chalecoIcono(g, '#2a3448', '#3a4660'); px(g, 7, 5, 2, 3, '#58c8ff'); },
  casco: g => { px(g, 3, 4, 10, 6, '#5a6244'); px(g, 2, 9, 12, 2, '#4a5236'); px(g, 4, 3, 8, 2, '#6a7454'); px(g, 2, 10, 3, 5, '#6a5040'); px(g, 11, 10, 3, 5, '#6a5040'); },
  'mochila-p': g => mochilaIcono(g, 9),
  'mochila-m': g => mochilaIcono(g, 11),
  'mochila-g': g => { mochilaIcono(g, 13); px(g, 1, 6, 2, 8, '#5a4024'); px(g, 13, 6, 2, 8, '#5a4024'); },
  palanca: g => { linea(g, 3, 14, 12, 3, '#c8202c', 2); px(g, 11, 1, 4, 2, '#c8202c'); px(g, 1, 13, 3, 2, '#c8202c'); },
  'llave-despacho': g => { circulo(g, 4, 5, 3, '#f9c531'); g.clearRect(3, 4, 2, 2); px(g, 7, 5, 8, 2, '#f9c531'); px(g, 11, 7, 1, 3, '#f9c531'); px(g, 13, 7, 1, 2, '#f9c531'); px(g, 7, 5, 8, 1, '#ffe59a'); },
  abrecartas: g => { linea(g, 3, 13, 11, 5, '#c8d0d8', 2); linea(g, 4, 13, 11, 6, '#ffffff', 1); px(g, 11, 2, 3, 3, '#c8d0d8'); px(g, 1, 12, 4, 3, '#c99a3a'); px(g, 2, 11, 2, 1, '#f9c531'); px(g, 0, 14, 2, 2, '#c99a3a'); },
  tarjeta: g => { px(g, 1, 4, 14, 9, '#c8202c'); px(g, 2, 6, 4, 3, '#f9c531'); px(g, 8, 6, 6, 1, '#ffd0d0'); px(g, 8, 9, 4, 1, '#ffd0d0'); px(g, 1, 4, 14, 1, '#e85050'); },
};
// una imagen de icono para HTML (con su clase de rareza)
function imgObj(id, clase = '') { return '<img class="ic ' + clase + '" alt="" src="' + iconoDe(id) + '">'; }
// la chapa (la moneda)
function iconoChapa() { return iconoDe('_chapa'); }
DIBUJOS._chapa = g => { circulo(g, 8, 8, 6, '#c8ccd2'); circulo(g, 8, 8, 4, '#e0484f'); px(g, 6, 6, 4, 4, '#f0f0f0'); px(g, 7, 7, 2, 2, '#e0484f'); };
