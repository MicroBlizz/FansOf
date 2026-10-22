// Fans of Snakes · Cartas en pantalla: la elección de tres cartas (con sus dibujos), los toques sobre ellas y la fila de
// cartas conseguidas bajo el tablero. Lo que hace cada carta está en js/cartas.js.
'use strict';

const RECT_CARTAS = [];

// los dibujos de las cartas (contorno grueso, sin emojis), centrados en x, y, de tamaño s
function iconoCarta(k, x, y, s) {
  const c = CARTAS[k].col, o = '#06110a', lw = Math.max(1, s * 0.09);
  G.lineJoin = 'round'; G.lineCap = 'round';
  if (k === 'iman') {
    G.lineWidth = s * 0.28; G.strokeStyle = o; G.beginPath(); G.arc(x, y - s * 0.05, s * 0.3, Math.PI, 0, true); G.lineTo(x + s * 0.3, y - s * 0.4); G.moveTo(x - s * 0.3, y - s * 0.05); G.lineTo(x - s * 0.3, y - s * 0.4); G.stroke();
    G.lineWidth = s * 0.18; G.strokeStyle = c; G.beginPath(); G.arc(x, y - s * 0.05, s * 0.3, Math.PI, 0, true); G.lineTo(x + s * 0.3, y - s * 0.25); G.moveTo(x - s * 0.3, y - s * 0.05); G.lineTo(x - s * 0.3, y - s * 0.25); G.stroke();
    G.strokeStyle = '#e8e8e8'; G.beginPath(); G.moveTo(x - s * 0.3, y - s * 0.27); G.lineTo(x - s * 0.3, y - s * 0.38); G.moveTo(x + s * 0.3, y - s * 0.27); G.lineTo(x + s * 0.3, y - s * 0.38); G.stroke();
  } else if (k === 'fantasma') {
    G.beginPath(); G.arc(x, y - s * 0.1, s * 0.3, Math.PI, 0); G.lineTo(x + s * 0.3, y + s * 0.32);
    for (let i = 0; i < 3; i++) { const x1 = x + s * 0.3 - (i + 0.5) * s * 0.2; G.lineTo(x1, y + s * 0.2); G.lineTo(x1 - s * 0.1, y + s * 0.32); }
    G.closePath(); G.fillStyle = c; G.fill(); G.strokeStyle = o; G.lineWidth = lw; G.stroke();
    circulo(x - s * 0.11, y - s * 0.1, s * 0.06, o, null); circulo(x + s * 0.11, y - s * 0.1, s * 0.06, o, null);
  } else if (k === 'dash') {
    G.beginPath(); G.moveTo(x + s * 0.08, y - s * 0.42); G.lineTo(x - s * 0.22, y + s * 0.04); G.lineTo(x - s * 0.01, y + s * 0.04); G.lineTo(x - s * 0.1, y + s * 0.42); G.lineTo(x + s * 0.24, y - s * 0.08); G.lineTo(x + s * 0.03, y - s * 0.08); G.closePath();
    G.fillStyle = c; G.fill(); G.strokeStyle = o; G.lineWidth = lw; G.stroke();
  } else if (k === 'portal') {
    for (const [r, col] of [[0.36, c], [0.24, '#e0ccff'], [0.12, '#4a2a8a']]) { G.beginPath(); G.ellipse(x, y, s * r, s * r * 1.15, 0, 0, Math.PI * 2); G.fillStyle = col; G.fill(); G.strokeStyle = o; G.lineWidth = lw; G.stroke(); }
  } else if (k === 'doble') {
    for (const dx of [-0.15, 0.15]) { circulo(x + dx * s, y + s * 0.06, s * 0.2, c, o, lw); G.fillStyle = '#3ddc84'; G.fillRect(x + dx * s - s * 0.02, y - s * 0.24, s * 0.04, s * 0.1); }
  } else if (k === 'reloj') {
    circulo(x, y, s * 0.34, c, o, lw); circulo(x, y, s * 0.26, '#eaf8ff', null);
    G.strokeStyle = o; G.lineWidth = lw; G.beginPath(); G.moveTo(x, y); G.lineTo(x, y - s * 0.2); G.moveTo(x, y); G.lineTo(x + s * 0.14, y + s * 0.06); G.stroke();
  } else if (k === 'pila') {
    caja(x - s * 0.18, y - s * 0.32, s * 0.36, s * 0.66, s * 0.06, '#17331f', o, lw); G.fillStyle = o; G.fillRect(x - s * 0.08, y - s * 0.4, s * 0.16, s * 0.08);
    G.fillStyle = c; for (let i = 0; i < 3; i++) G.fillRect(x - s * 0.12, y + s * 0.18 - i * s * 0.18, s * 0.24, s * 0.12);
  } else if (k === 'escudo') {
    G.beginPath(); G.moveTo(x, y - s * 0.38); G.lineTo(x + s * 0.3, y - s * 0.26); G.quadraticCurveTo(x + s * 0.3, y + s * 0.2, x, y + s * 0.4); G.quadraticCurveTo(x - s * 0.3, y + s * 0.2, x - s * 0.3, y - s * 0.26); G.closePath();
    G.fillStyle = c; G.fill(); G.strokeStyle = o; G.lineWidth = lw; G.stroke();
    G.fillStyle = '#c9ffd9'; G.fillRect(x - s * 0.04, y - s * 0.22, s * 0.08, s * 0.4);
  }
}

// parte un texto en líneas que quepan en ancho w (con la letra ya puesta)
function lineas(txt, w) {
  const out = []; let l = '';
  for (const p of txt.split(' ')) { const t = l ? l + ' ' + p : p; if (G.measureText(t).width > w && l) { out.push(l); l = p; } else l = t; }
  if (l) out.push(l); return out;
}

function pintaCartas(W, H) {
  const J = JUEGO, k = Math.min(1, J.tCartas / 0.25);
  G.fillStyle = `rgba(6,17,10,${0.72 * k})`; G.fillRect(0, 0, W, H);
  const cw = 60, ch = 104, gap = 5, x0 = (W - (3 * cw + 2 * gap)) / 2, y0 = H / 2 - ch / 2 + 10;
  letra(tr('¡MANZANA {n}!', { n: J.comidas }), W / 2, y0 - 34, 11, '#ff6b6b', 'center', '#06110a', 3);
  letra(tr('Elige una carta'), W / 2, y0 - 18, 10, '#fff', 'center', '#06110a', 3);
  RECT_CARTAS.length = 0;
  J.oferta.forEach((key, i) => {
    const C = CARTAS[key], x = x0 + i * (cw + gap), y = y0 + (1 - k) * 40 + Math.sin(J.t * 3 + i) * 1.2, nv = nivel(key) + 1;
    caja(x, y + 3, cw, ch, 7, '#06110a', null);
    caja(x, y, cw, ch, 7, '#10251a', C.col, 2.5);
    caja(x + 4, y + 4, cw - 8, 34, 5, '#1b3a28', null);
    iconoCarta(key, x + cw / 2, y + 21, 28);
    letra(tr(C.nombre), x + cw / 2, y + 47, C.nombre.length > 8 ? 6.5 : 7.5, C.col, 'center', '#06110a', 2);
    if (C.max > 1) letra(key === 'fantasma' || key === 'escudo' ? tr('Cargas: {n}', { n: nv }) : tr('Nivel {n}', { n: nv }), x + cw / 2, y + 57, 5.5, '#cfe', 'center', null, 0, 700);
    G.font = `700 6px "Baloo 2", system-ui, sans-serif`;
    lineas(C.texto(nv), cw - 8).slice(0, 3).forEach((l, j) => letra(l, x + cw / 2, y + 67 + j * 7, 6, '#fff', 'center', null, 0, 700));
    caja(x + 8, y + ch - 14, cw - 16, 10, 4, C.col, '#06110a', 1);
    letra(tr('ELEGIR'), x + cw / 2, y + ch - 8.5, 6, '#06110a', 'center', null, 0);
    RECT_CARTAS.push({ x, y, w: cw, h: ch });
  });
  if (J.tCartas > 0.4) letra(tr('Toca una (o pulsa 1, 2, 3)'), W / 2, y0 + ch + 16, 7, '#9cff6b', 'center', '#06110a', 2);
}

// un toque mientras se elige
function toqueCartas(x, y) {
  if (JUEGO.tCartas < 0.4) return;   // que no se elija sin querer con el dedo que venía de la palanca
  RECT_CARTAS.forEach((r, i) => { if (dentro(r, x, y)) eligeCarta(i); });
}

// la fila de cartas conseguidas, abajo a la izquierda
function pintaMisCartas(retro) {
  const y = Math.min(PAN.H - 8, TAB.y0 + TAB.h + 11); let x = TAB.x0 + 6;
  for (const k in CARTAS) {
    const n = nivel(k); if (!n) continue;
    if (retro) { letraMono(CARTAS[k].nombre[0] + n, x + 2, y, 7, RETRO.tinta); x += 14; continue; }
    iconoCarta(k, x, y, 13);
    if (n > 1 || k === 'fantasma' || k === 'escudo') letra(String(n), x + 6, y + 4, 6, '#fff', 'center', '#06110a', 2);
    x += 15;
  }
}
