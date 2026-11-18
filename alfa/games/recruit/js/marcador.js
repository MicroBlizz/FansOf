// Fans of Recruit · EL MARCADOR: arriba a la izquierda, la cara de CrazyBunny con sus vidas, los puntos, el arma con su
// munición, las zanahorias bomba y las 10 casillas de CAOS; en el centro, el tiempo; a la derecha, el directo con su chat
// falso. Letras doradas en franjas con contorno oscuro, como los rótulos de las recreativas.
'use strict';

const ICONOS = {};
// un icono dibujado píxel a píxel: cada letra de «filas» es un color de «col» (el punto es hueco)
function iconoMatriz(filas, col) {
  const h = filas.length, w = filas[0].length, c = lienzoNuevo(w, h), g = c.getContext('2d');
  filas.forEach((f, j) => [...f].forEach((ch, i) => { if (col[ch]) { g.fillStyle = col[ch]; g.fillRect(i, j, 1, 1); } }));
  return { c, b: c, ox: 0, oy: 0, w, h };
}
function creaIconos() {
  // la cara de CrazyBunny para el marcador: orejas, corona torcida, el ojo en espiral y los dientes
  ICONOS.cara = iconoMatriz([
    '.KK.........KK.',
    'KWPK..G.G.GKSSK',
    'KWPK..GGGGGKSSK',
    'KWPPK.GRGGgKSK.',
    '.KWPKKgggggKK..',
    '..KWWWWWWWWSK..',
    '.KWWWWWWWWWWSK.',
    '.KWKVVKWWKEWSK.',
    '.KWVKKVWWKEWSK.',
    '.KWKVVKWWWWWSK.',
    '.KWWWWWWPWWSSK.',
    '.KSWWWMTTMWSK..',
    '..KSSWWMMWSK...',
    '...KKKKKKKK....'],
    { K: '#2a2140', W: '#f4f2ff', S: '#b7b3da', P: '#f595be', G: '#f9c531', g: '#a8600e', V: '#8a2bff', E: '#1a1430', R: '#f04b53', T: '#ffffff', M: '#5a1530' });
  // la ametralladora, dibujada a mano para que se lea en pequeño
  ICONOS.arma = iconoMatriz([
    '........KK............',
    '..KKKKKKHSKKKKK.......',
    '.KwWKHHHHHLLLLSKKKKKKK',
    'KwWWKLLYYLSSSSDLLLLLHK',
    'KwwKKSSSSSSWWWWKKKKKK.',
    '.KK.KSKKOOKwwwK.......',
    '....KSK.KOOK..........',
    '....KK...KooK.........',
    '..........KK..........'],
    { K: '#10121b', S: '#5f687d', L: '#8d97ac', H: '#d5dceb', D: '#414859', W: '#e0b678', w: '#96652f', O: '#ffa63d', o: '#d2501a', Y: '#ffe56e' });
  // la zanahoria bomba: con su anilla
  { const p = new Pincel(12, 14, 6, 12), P = MAT;
    for (const s of [-0.7, 0.5]) p.parte(F.ov(Math.sin(s) * 2.6, -10.4, 1.5, 2.6, s), P.hoja, { r: 1.5, sombra: 0 });
    p.parte(F.tr(0, -7, 0.6, -1.4, 3, 1.1), P.capa, { r: 2.6, sombra: 0 });
    p.tonoPx(-1.5, -5.5, -1); p.tonoPx(1.5, -3.5, -1);
    p.parte(F.menos(F.ov(3.4, -9, 2, 2), F.ov(3.4, -9, 0.8, 0.8)), P.oro, { plano: 4, linea: false, sombra: 0 });
    ICONOS.bomba = p.lienzo(); }
  // la cabeza de un fan rescatado, con su diadema de orejas de conejo
  ICONOS.fan = iconoMatriz([
    '.KK....KK..',
    'KWSK..KWSK.',
    'KWSK..KWSK.',
    'KWSKKKKWSK.',
    '.KOOOOOOOK.',
    'KHHHHHHHHHK',
    'KHPPPPPPPHK',
    'KPPKPPPKPPK',
    'KPRPPPPPRPK',
    'KPPMTTTMPPK',
    '.KPPMMMPPK.',
    '..KKKKKKK..'],
    { K: '#2a160e', W: '#f4f2ff', S: '#b7b3da', O: '#f47c20', H: '#744424', P: '#f0b48e', R: '#ff9a8a', M: '#5a1530', T: '#ffffff' });
  // la espiral del CAOS
  { const p = new Pincel(9, 9, 4, 4); p.plano(F.ov(0.5, 0.5, 4, 4), '#2a1150'); for (let a = 0; a < 7.6; a += 0.4) { const r = 0.3 + a * 0.42; p.px(0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r, a > 5 ? '#b47aff' : '#e2c8ff'); } ICONOS.caos = p.lienzo(); }
}
// un marco fino dorado con su borde oscuro
function marcoFino(g, x, y, w, h, color = '#ffd23c', oscuro = TINTA) {
  rect(g, x - 1, y - 1, w + 2, 3, oscuro); rect(g, x - 1, y + h - 2, w + 2, 3, oscuro); rect(g, x - 1, y - 1, 3, h + 2, oscuro); rect(g, x + w - 2, y - 1, 3, h + 2, oscuro);
  rect(g, x, y, w, 1, color); rect(g, x, y + h - 1, w, 1, mezcla(color, '#a04a10', 0.5)); rect(g, x, y, 1, h, color); rect(g, x + w - 1, y, 1, h, mezcla(color, '#a04a10', 0.5));
}
/* E = lo que enseña: { vidas, puntos, municion ('∞' o un número), bombas, caos (0 a 10), tiempo, fans, espectadores, chat: [[quién, color, frase], …] } */
function pintaMarcador(g, W, E) {
  if (!ICONOS.cara) creaIconos();
  const mini = { fuente: 'mini' }, oro = { fuente: 'gorda', c: ORO_ROTULO };
  /* ---------- izquierda: vidas, puntos, arma, bombas y CAOS ---------- */
  rect(g, 3, 3, 19, 18, TINTA); rect(g, 5, 5, 15, 14, '#2c4a7a'); rect(g, 5, 5, 15, 1, '#4f78b0'); rect(g, 5, 18, 15, 1, '#1c2f52');
  pintaSpr(g, ICONOS.cara, 5, 5);
  marcoFino(g, 4, 4, 17, 16);
  escribe(g, 'x', 24, 7, oro); escribe(g, String(E.vidas), 30, 7, oro);
  escribe(g, String(E.puntos).padStart(7, '0'), 102, 7, Object.assign({ alin: 'der' }, oro));
  // la caja del arma (con su munición) y la de las zanahorias bomba
  const bx = 4, by = 25, wa = 56, wb = 35, wf = 29, bh = 16;
  rect(g, bx + 1, by + 1, wa + wb + wf - 4, bh - 2, '#141c30'); rect(g, bx + 1, by + 1, wa + wb + wf - 4, 1, '#243252');
  marcoFino(g, bx, by, wa, bh); marcoFino(g, bx + wa - 1, by, wb, bh); marcoFino(g, bx + wa + wb - 2, by, wf, bh);
  // los fans rescatados
  pintaSpr(g, ICONOS.fan, bx + wa + wb + 1, by + 2);
  escribe(g, String(E.fans || 0), bx + wa + wb + wf - 6, by + 4, Object.assign({ alin: 'der' }, oro));
  pintaSpr(g, ICONOS.arma, bx + 4, by + 4);
  escribe(g, String(E.municion), bx + wa - 4, by + 4, Object.assign({ alin: 'der' }, oro));
  pintaSpr(g, ICONOS.bomba, bx + wa + 7, by + 15);
  escribe(g, String(E.bombas), bx + wa + wb - 5, by + 4, Object.assign({ alin: 'der' }, oro));
  // el CAOS: 10 casillas, como en Fans of Rumble
  const cx = 110, cy = 4;
  pintaSpr(g, ICONOS.caos, cx + 4, cy + 4);
  escribe(g, tr('CAOS'), cx + 11, cy + 1, Object.assign({ c: ['#f3e6ff', '#c79bff', '#8a4be0'] }, mini));
  for (let k = 0; k < 10; k++) {
    const x = cx + k * 6, y = cy + 9, lleno = k < E.caos;
    rect(g, x - 1, y - 1, 7, 7, TINTA);
    rect(g, x, y, 5, 5, lleno ? '#9a4dff' : '#221a3a');
    if (lleno) { rect(g, x, y, 5, 1, '#d9b8ff'); rect(g, x, y, 1, 5, '#c79bff'); rect(g, x, y + 4, 5, 1, '#5c22b0'); rect(g, x + 4, y, 1, 5, '#6a2cc8'); }
    else rect(g, x, y, 5, 1, '#15102a');
  }
  /* ---------- centro: el tiempo ---------- */
  escribe(g, String(E.tiempo).padStart(2, '0'), Math.round(W / 2), 5, { fuente: 'gorda', esc: 2, c: ORO_ROTULO, alin: 'centro' });
  /* ---------- derecha: el directo y su chat ---------- */
  const dx = W - 4, eti = tr('EN DIRECTO'), ew = anchoTexto(eti, 1, 'mini') + 12;
  rect(g, dx - ew - 1, 3, ew + 2, 11, TINTA); rect(g, dx - ew, 4, ew, 9, '#d4283a'); rect(g, dx - ew, 4, ew, 1, '#ff6a6a'); rect(g, dx - ew, 12, ew, 1, '#8a1626');
  rect(g, dx - ew + 3, 7, 3, 3, '#ffffff'); rect(g, dx - ew + 3, 9, 3, 1, '#ffb8b8');
  escribe(g, eti, dx - ew + 8, 6, Object.assign({ c: '#ffffff', borde: null, sombra: null }, mini));
  escribe(g, E.espectadores, dx - ew - 5, 6, Object.assign({ c: BLANCO_ROTULO, alin: 'der' }, mini));
  (E.chat || []).forEach(([quien, color, frase], k) => {
    const y = 18 + k * 8, f = tr(frase), wf = anchoTexto(f, 1, 'mini'), wq = anchoTexto(quien + ':', 1, 'mini');
    escribe(g, quien + ':', dx - wf - 4 - wq, y, Object.assign({ c: color }, mini));
    escribe(g, f, dx - wf, y, Object.assign({ c: '#f4f6ff' }, mini));
  });
}
// el cartel de «¡ADELANTE!» con su flecha (t hace que parpadee y se mueva)
function pintaAdelante(g, x, y, t = 0) {
  const s = tr('¡ADELANTE!'), w = anchoTexto(s), dx = Math.round(Math.sin(t * 9) * 2);
  escribe(g, s, x + dx, y, { c: ROJO_ROTULO, alin: 'der', borde: '#3a0a10' });
  const fx = x + dx + 4;
  for (let k = 0; k < 6; k++) { rect(g, fx + k, y + 1 + k, 1, 9 - k * 2 > 0 ? 9 - k * 2 : 1, k < 2 ? '#ffd0a8' : '#ff6a3c'); }
  rect(g, fx - 1, y, 1, 11, '#3a0a10'); for (let k = 0; k < 6; k++) { rect(g, fx + k, y + k, 1, 1, '#3a0a10'); rect(g, fx + k, y + 10 - k, 1, 1, '#3a0a10'); }
  return w;
}
// un bocadillo: lo que dice un personaje. (x, y) = la punta del rabito, que cae sobre su cabeza
function pintaBocadillo(g, s, x, y) {
  const t = tr(s), w = anchoTexto(t) + 8, h = 13, x0 = Math.round(x - w / 2), y0 = y - h - 4;
  rect(g, x0 + 1, y0 - 1, w - 2, h + 2, TINTA); rect(g, x0 - 1, y0 + 1, w + 2, h - 2, TINTA); rect(g, x0, y0, w, h, TINTA);
  rect(g, x0 + 1, y0, w - 2, h, '#fffdf4'); rect(g, x0, y0 + 1, w, h - 2, '#fffdf4'); rect(g, x0 + 1, y0 + h - 1, w - 2, 1, '#d9d4c8');
  for (let k = 0; k < 4; k++) { rect(g, x - 2 + k, y0 + h + k, 5 - k * 2 > 0 ? 5 - k * 2 : 1, 1, '#fffdf4'); rect(g, x - 3 + k, y0 + h + k, 1, 1, TINTA); rect(g, x + 2 - k + (k > 1 ? 1 : 0), y0 + h + k, 1, 1, TINTA); }
  escribe(g, t, x0 + 4, y0 + 4, { c: '#2a2140', borde: null, sombra: null });
}
// una flechita que bota encima de algo, con su letrero («¡SUBE!»)
function pintaAviso(g, s, x, y, t = 0) {
  const b = Math.round(Math.abs(Math.sin(t * 6)) * 2);
  escribe(g, tr(s), x, y - b, { c: ORO_ROTULO, alin: 'centro' });
  for (let k = 0; k < 4; k++) { rect(g, x - 4 + k, y + 10 + k - b, 8 - k * 2, 1, '#ffd23c'); }
  for (let k = 0; k < 5; k++) { rect(g, x - 5 + k, y + 10 + k - b, 1, 1, TINTA); rect(g, x + 4 - k, y + 10 + k - b, 1, 1, TINTA); }
  rect(g, x - 5, y + 9 - b, 10, 1, TINTA);
}
