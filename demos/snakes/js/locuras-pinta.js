// Fans of Snakes · Cómo se ven las locuras nuevas (las reglas y la lista están en js/locuras.js):
//   · Gigante: la cámara se acerca a la cabeza y la sigue; ves solo un trozo del tablero.
//   · Anuncio: un anuncio de Microblizz tapa un buen trozo del tablero y no se puede cerrar.
//   · Modo texto: el tablero es una terminal; la serpiente son letras y las manzanas, arrobas.
'use strict';

const ZOOM_GIGANTE = 2;
const CAM = { x: 100, y: 200 };      // a dónde mira la cámara del Gigante (va detrás de la cabeza, suave)
const ANUNCIO = { x: 0, y: 0, w: 0, h: 0, frase: 0 };
const FRASES_ANUNCIO = [
  ['MICROBLIZZ PREMIUM', 'Manzanas ilimitadas por 9,99 € a la semana'],
  ['MICROBLIZZ PASS', 'Desbloquea la cola dorada. Solo hoy, solo 49,99 €'],
  ['¡OFERTA!', 'Compra 3 manzanas y paga 4. Es un chollo.'],
];

// la cámara del Gigante: devuelve true si ha cambiado el pincel (hay que restaurarlo después con G.restore())
function camaraGigante(dt) {
  if (!locuraActiva('gigante')) return false;
  const h = JUEGO.serp[0], k = Math.min(1, dt * 8);
  CAM.x += (cx(h[0]) - CAM.x) * k; CAM.y += (cy(h[1]) - CAM.y) * k;
  // entra y sale con suavidad al principio y al final
  const z = 1 + (ZOOM_GIGANTE - 1) * Math.min(1, (LOCURA.dur - LOCURA.t) * 3, LOCURA.t * 3);
  G.save();
  G.beginPath(); G.rect(TAB.x0 - 3, TAB.y0 - 3, TAB.w + 6, TAB.h + 6); G.clip();
  const bx = TAB.x0 + TAB.w / 2, by = TAB.y0 + TAB.h / 2;
  const f = (z - 1) / (ZOOM_GIGANTE - 1);   // 0 = mira al centro del tablero, 1 = mira a la cabeza
  G.translate(bx, by); G.scale(z, z); G.translate(-(bx + (CAM.x - bx) * f), -(by + (CAM.y - by) * f));
  return true;
}
function preparaGigante() { const h = JUEGO.serp[0]; CAM.x = cx(h[0]); CAM.y = cy(h[1]); }

// el anuncio sale en una mitad del tablero que no sea la de la cabeza... casi siempre
function preparaAnuncio() {
  const h = JUEGO.serp[0], arriba = cy(h[1]) > TAB.y0 + TAB.h / 2 ? Math.random() < 0.8 : Math.random() < 0.2;
  ANUNCIO.w = TAB.w * 0.86; ANUNCIO.h = TAB.h * 0.34;
  ANUNCIO.x = TAB.x0 + (TAB.w - ANUNCIO.w) / 2;
  ANUNCIO.y = arriba ? TAB.y0 + TAB.h * 0.08 : TAB.y0 + TAB.h * 0.58;
  ANUNCIO.frase = Math.floor(Math.random() * FRASES_ANUNCIO.length);
}

function pintaAnuncio() {
  if (!locuraActiva('anuncio')) return;
  const { x, y, w, h } = ANUNCIO, [t1, t2] = FRASES_ANUNCIO[ANUNCIO.frase], t = JUEGO.t;
  const entra = Math.min(1, (LOCURA.dur - LOCURA.t) * 5), dy = (1 - entra) * -20;
  G.save(); G.globalAlpha = entra; G.translate(0, dy);
  caja(x, y + 3, w, h, 8, '#06110a', null);
  caja(x, y, w, h, 8, '#3b1466', '#d36bff', 2.5);
  caja(x + 4, y + 4, w - 8, 16, 5, '#5a2299', null);
  letra(tr(t1), x + w / 2, y + 12.5, 10, '#ffd54a', 'center', '#06110a', 2.5);
  G.font = `800 9px "Baloo 2", system-ui, sans-serif`;
  lineas(tr(t2), w - 20).slice(0, 3).forEach((l, i) => letra(l, x + w / 2, y + 32 + i * 11, 9, '#fff', 'center', '#06110a', 2.5));
  const bw = 70, bx = x + (w - bw) / 2, by = y + h - 24, late = 1 + Math.sin(t * 8) * 0.05;
  G.save(); G.translate(bx + bw / 2, by + 8); G.scale(late, late);
  caja(-bw / 2, -8, bw, 16, 6, '#ffd54a', '#06110a', 2); letra(tr('¡COMPRAR!'), 0, 0.5, 9, '#06110a', 'center', null, 0);
  G.restore();
  // la «X» de cerrar, que no cierra nada, y la cuenta atrás
  circulo(x + w - 9, y + 9, 6, '#06110a', '#d36bff', 1.2); letra('x', x + w - 9, y + 8.5, 8, '#d36bff', 'center', null, 0);
  letra(tr('Anuncio · {n} s', { n: Math.ceil(LOCURA.t) }), x + 8, y + h - 7, 6, '#d9b8ff', 'left', null, 0, 700);
  G.restore();
}

// el modo texto: sustituye a todo el dibujo del tablero
const LETRAS_SERPIENTE = 'SERPIENTEFANSOF';
function pintaTableroTexto() {
  const { x0, y0, w, h, c } = TAB, verde = '#33ff66', t = JUEGO.t;
  G.fillStyle = '#000'; G.fillRect(x0 - 3, y0 - 3, w + 6, h + 6);
  G.strokeStyle = verde; G.lineWidth = 1; G.strokeRect(x0 - 2.5, y0 - 2.5, w + 5, h + 5);
  G.globalAlpha = 0.07; G.fillStyle = verde; for (let y = y0; y < y0 + h; y += 3) G.fillRect(x0, y, w, 1); G.globalAlpha = 1;   // las rayas del monitor
  for (const m of JUEGO.manzanas) letraMono('@', cx(m[0]), cy(m[1]) + 0.5, c * 0.95, '#ff5a5a', 'center', 800);
  for (const it of JUEGO.items) letraMono('?', cx(it.c), cy(it.r) + 0.5, c * 0.95, '#ffd54a', 'center', 800);
  JUEGO.serp.forEach((s, i) => letraMono(i === 0 ? '>' : LETRAS_SERPIENTE[(i - 1) % LETRAS_SERPIENTE.length], cx(s[0]), cy(s[1]) + 0.5, c * 0.95, i === 0 ? '#ffffff' : verde, 'center', 800));
  if (Math.sin(t * 6) > 0) { const hd = JUEGO.serp[0]; G.fillStyle = verde; G.fillRect(cx(hd[0]) + c * 0.35, cy(hd[1]) + c * 0.3, c * 0.4, 1.5); }   // el cursor
}
