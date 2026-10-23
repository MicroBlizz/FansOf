// Fans of Snakes · Cartas en pantalla: la elección de tres cartas (con sus dibujos), los toques sobre ellas y la fila de
// cartas conseguidas bajo el tablero. Lo que hace cada carta está en js/cartas.js.
'use strict';

const RECT_CARTAS = [];

// los dibujos de las cartas (contorno grueso, sin emojis), centrados en x, y, de tamaño s
function iconoCarta(k, x, y, s) {
  if (CARTAS[k].fusion) {   // una fusión: sus dos cartas juntas dentro de un aro brillante
    G.save(); G.globalAlpha = 0.5 + Math.sin(JUEGO.t * 6) * 0.2; circulo(x, y, s * 0.46, null, CARTAS[k].col, Math.max(1, s * 0.08)); G.restore();
    const [a, b] = CARTAS[k].fusion; iconoCarta(a, x - s * 0.18, y - s * 0.08, s * 0.62); iconoCarta(b, x + s * 0.18, y + s * 0.1, s * 0.62);
    return;
  }
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
  } else if (k === 'nitro') {   // una llama
    G.beginPath(); G.moveTo(x, y - s * 0.42); G.quadraticCurveTo(x + s * 0.34, y - s * 0.05, x + s * 0.22, y + s * 0.26); G.quadraticCurveTo(x, y + s * 0.44, x - s * 0.22, y + s * 0.26); G.quadraticCurveTo(x - s * 0.34, y - s * 0.05, x, y - s * 0.42); G.closePath();
    G.fillStyle = c; G.fill(); G.strokeStyle = o; G.lineWidth = lw; G.stroke();
    G.beginPath(); G.moveTo(x, y - s * 0.12); G.quadraticCurveTo(x + s * 0.14, y + s * 0.1, x, y + s * 0.28); G.quadraticCurveTo(x - s * 0.14, y + s * 0.1, x, y - s * 0.12); G.fillStyle = '#ffd54a'; G.fill();
  } else if (k === 'salto') {   // un arco con su flecha, por encima de un cuadradito (tu cola)
    caja(x - s * 0.1, y + s * 0.12, s * 0.2, s * 0.2, s * 0.04, '#3ddc84', o, lw * 0.8);
    G.strokeStyle = o; G.lineWidth = lw * 2.6; G.beginPath(); G.arc(x, y + s * 0.2, s * 0.32, Math.PI, 0); G.stroke();
    G.strokeStyle = c; G.lineWidth = lw * 1.4; G.beginPath(); G.arc(x, y + s * 0.2, s * 0.32, Math.PI, 0); G.stroke();
    G.fillStyle = c; G.beginPath(); G.moveTo(x + s * 0.32, y + s * 0.36); G.lineTo(x + s * 0.2, y + s * 0.18); G.lineTo(x + s * 0.44, y + s * 0.18); G.closePath(); G.fill(); G.strokeStyle = o; G.lineWidth = lw * 0.7; G.stroke();
  } else if (k === 'bala') {   // un reloj de arena
    G.beginPath(); G.moveTo(x - s * 0.24, y - s * 0.36); G.lineTo(x + s * 0.24, y - s * 0.36); G.lineTo(x + s * 0.03, y); G.lineTo(x + s * 0.24, y + s * 0.36); G.lineTo(x - s * 0.24, y + s * 0.36); G.lineTo(x - s * 0.03, y); G.closePath();
    G.fillStyle = '#eaf8ff'; G.fill(); G.strokeStyle = o; G.lineWidth = lw; G.stroke();
    G.fillStyle = c; G.beginPath(); G.moveTo(x - s * 0.15, y + s * 0.32); G.lineTo(x + s * 0.15, y + s * 0.32); G.lineTo(x, y + s * 0.12); G.closePath(); G.fill();
    G.fillStyle = o; G.fillRect(x - s * 0.3, y - s * 0.42, s * 0.6, s * 0.07); G.fillRect(x - s * 0.3, y + s * 0.35, s * 0.6, s * 0.07);
  } else if (k === 'dieta') {   // tres trozos de cola y unas tijeras de raya
    for (let i = 0; i < 3; i++) caja(x - s * 0.36 + i * s * 0.25, y - s * 0.08, s * 0.2, s * 0.2, s * 0.04, i < 2 ? '#3ddc84' : c, o, lw * 0.8);
    G.strokeStyle = '#ff6b6b'; G.lineWidth = lw * 1.3; G.setLineDash([s * 0.07, s * 0.05]); G.beginPath(); G.moveTo(x + s * 0.1, y - s * 0.3); G.lineTo(x + s * 0.1, y + s * 0.3); G.stroke(); G.setLineDash([]);
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
  letra(J.comidas ? tr('¡MANZANA {n}!', { n: J.comidas }) : tr('¡CARTA DE SALIDA!'), W / 2, y0 - 34, 11, '#ff6b6b', 'center', '#06110a', 3);
  letra(tr('Elige una carta'), W / 2, y0 - 18, 10, '#fff', 'center', '#06110a', 3);
  RECT_CARTAS.length = 0;
  J.oferta.forEach((key, i) => {
    const C = CARTAS[key], x = x0 + i * (cw + gap), y = y0 + (1 - k) * 40 + Math.sin(J.t * 3 + i) * 1.2, nv = nivel(key) + 1;
    caja(x, y + 3, cw, ch, 7, '#06110a', null);
    caja(x, y, cw, ch, 7, '#10251a', C.col, 2.5);
    caja(x + 4, y + 4, cw - 8, 34, 5, '#1b3a28', null);
    iconoCarta(key, x + cw / 2, y + 21, 28);
    letra(tr(C.nombre), x + cw / 2, y + 47, C.nombre.length > 14 ? 5.2 : C.nombre.length > 8 ? 6.5 : 7.5, C.col, 'center', '#06110a', 2);
    if (C.fusion) letra(tr(CARTAS[C.fusion[0]].nombre) + ' + ' + tr(CARTAS[C.fusion[1]].nombre), x + cw / 2, y + 57, 4.8, '#ffd54a', 'center', null, 0, 700);
    else if (C.cargas) letra(tr('Usos: {n}', { n: nivel(key) + C.cargas }), x + cw / 2, y + 57, 5.5, '#cfe', 'center', null, 0, 700);
    else if (C.max > 1) letra(tr('Nivel {n}', { n: nv }), x + cw / 2, y + 57, 5.5, '#cfe', 'center', null, 0, 700);
    if (C.fusion) { caja(x + cw / 2 - 17, y - 6, 34, 10, 4, '#ffd54a', '#06110a', 1); letra(tr('FUSIÓN'), x + cw / 2, y - 0.5, 6, '#06110a', 'center', null, 0); }
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
// la fila de cartas conseguidas, en el marcador (entre la barra de Frenesí y los puntos); en dos filas si no caben
function pintaMisCartas(retro) {
  const tengo = Object.keys(CARTAS).filter(k => nivel(k) > 0 && !(k === 'portal' && nivel('gusano')));
  if (!tengo.length) return;
  const x0 = TAB.x0 + 86, ancho = 60, porFila = tengo.length > 5 ? Math.ceil(tengo.length / 2) : tengo.length;
  const paso = Math.min(13.5, ancho / porFila), s = tengo.length > 5 ? 9 : 12;
  tengo.forEach((k, i) => {
    const fila = Math.floor(i / porFila), x = x0 + (i % porFila) * paso + paso / 2, y = tengo.length > 5 ? 10 + fila * 12 : 16, n = nivel(k);
    if (retro) { letraMono(CARTAS[k].nombre[0] + (CARTAS[k].cargas || n > 1 ? n : ''), x, y, 6, RETRO.tinta); return; }
    iconoCarta(k, x, y, s);
    if (CARTAS[k].cargas || n > 1) letra(String(n), x + s * 0.4, y + s * 0.35, 5.5, '#fff', 'center', '#06110a', 2);
  });
}
