// Fans of Crush · TUTORIAL: el primer nivel guiado (una mano enseña qué mover, Lola lo explica y solo vale esa jugada)
// y los consejos que salen una sola vez: los potenciadores, el martillo y la pista cuando te quedas quieto.
'use strict';
const CR_TUTO = { paso: 0, mov: null, t: 0, hecho: false };
const CR_TUTO_PASOS = [
  { a: [2, 6], b: [2, 7], txt: '¡Hola! Soy Lola. Arrastra a CrazyBunny hacia abajo para juntar 3 iguales.' },
  { a: [6, 4], b: [6, 5], txt: '¡Muy bien! Ahora junta 4 MeerCats en línea y mira lo que pasa.' },
];
function crTutoEmpieza() {
  CR_TUTO.paso = 0; CR_TUTO.hecho = false;
  if (CR_P.N.id === 1 && !SAVE.vistos.tuto) crTutoPaso(1);
}
function crTutoPaso(n) {
  CR_TUTO.paso = n; CR_TUTO.t = 0; CR_TUTO.hecho = false;
  const P = CR_TUTO_PASOS[n - 1];
  if (!P) {
    CR_TUTO.paso = 0; CR_TUTO.mov = null; SAVE.vistos.tuto = 1; crGuarda();
    CR_LOLA.prio = 0; crLola('¡Eso es! Ahora tú: junta 20 CrazyBunnies antes de que se acaben los movimientos.', 3, 7);
    return;
  }
  const igual = j => (j.a[0] === P.a[0] && j.a[1] === P.a[1] && j.b[0] === P.b[0] && j.b[1] === P.b[1]) || (j.a[0] === P.b[0] && j.a[1] === P.b[1] && j.b[0] === P.a[0] && j.b[1] === P.a[1]);
  if (!crJugadas().some(igual)) { crTutoPaso(n + 1); return; }   // si la cascada ha cambiado el tablero, ese paso se salta
  CR_TUTO.mov = P; CR_LOLA.prio = 0; crLola(P.txt, 4, 999);
}
// durante el tutorial solo vale la jugada que se enseña
function crTutoPermite(ax, ay, bx, by) {
  if (!CR_TUTO.paso || !CR_TUTO.mov) return true;
  const P = CR_TUTO.mov, ok = (ax === P.a[0] && ay === P.a[1] && bx === P.b[0] && by === P.b[1]) || (ax === P.b[0] && ay === P.b[1] && bx === P.a[0] && by === P.a[1]);
  if (!ok) { CR_LOLA.prio = 0; crLola(P.txt, 4, 999); CR_TUTO.t = 0; play('crNoVale'); return false; }
  CR_TUTO.hecho = true;
  return true;
}
function crTutoBucle(dt) {
  CR_TUTO.t += dt;
  if (CR_TUTO.paso && CR_TUTO.hecho && !crOcupado() && CR_P.estado === 'jugando') crTutoPaso(CR_TUTO.paso + 1);
  // consejos que salen una vez
  if (CR_P.estado === 'jugando' && !crOcupado() && CR_P.N.id >= 3 && !SAVE.vistos.potes && CR_LOLA.t > 7) {
    SAVE.vistos.potes = 1; crGuarda();
    crLola('Abajo tienes ayudas: el martillo despide una ficha, el café da 5 movimientos y reestructurar mezcla el tablero.', 2, 7);
  }
}
// la mano que enseña la jugada: aparece en la primera casilla, arrastra hasta la segunda y se va
function crTutoPinta(c, t) {
  if (!CR_TUTO.paso || !CR_TUTO.mov || crOcupado() || CR_TUTO.hecho) return;
  const P = CR_TUTO.mov, ax = crCx(P.a[0]), ay = crCy(P.a[1]), bx = crCx(P.b[0]), by = crCy(P.b[1]);
  const T = CR_T, V = CR_V, foco = (x, y) => (x === P.a[0] && y === P.a[1]) || (x === P.b[0] && y === P.b[1]);
  c.save(); c.fillStyle = 'rgba(74,45,107,.28)';
  for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) if (T.ok[y][x] && !foco(x, y)) c.fillRect(V.bx + x * V.cel, V.by + y * V.cel, V.cel, V.cel);
  c.restore();
  for (const [x, y] of [[ax, ay], [bx, by]]) { crRR(c, x - V.cel / 2 + 2, y - V.cel / 2 + 2, V.cel - 4, V.cel - 4, 12); c.lineWidth = 5; c.strokeStyle = `rgba(255,122,150,${0.65 + 0.35 * Math.sin(t * 6)})`; c.stroke(); }
  const ciclo = (CR_TUTO.t % 1.8) / 1.8, k = ciclo < 0.25 ? 0 : ciclo < 0.75 ? (ciclo - 0.25) / 0.5 : 1, e = k * k * (3 - 2 * k);
  const a = ciclo < 0.12 ? ciclo / 0.12 : ciclo > 0.85 ? 1 - (ciclo - 0.85) / 0.15 : 1;
  crMano(c, lerp(ax, bx, e), lerp(ay, by, e), ciclo > 0.2 && ciclo < 0.8 ? 0.92 : 1, a);
}
function crMano(c, x, y, s = 1, a = 1) {
  c.save(); c.globalAlpha = a; c.translate(x + 10, y + 14); c.scale(s, s); c.rotate(-0.35); c.lineJoin = 'round'; c.lineCap = 'round';
  const tinta = CR_COL.tinta, piel = '#ffffff';
  crRR(c, -6, -26, 12, 30, 6); c.fillStyle = piel; c.fill(); c.lineWidth = 3; c.strokeStyle = tinta; c.stroke();
  crRR(c, -14, -2, 32, 30, 11); c.fill(); c.stroke();
  for (const dx of [7, 13]) { c.beginPath(); c.moveTo(dx, 0); c.lineTo(dx, 9); c.lineWidth = 2; c.stroke(); }
  c.beginPath(); c.ellipse(-15, 10, 6, 9, -0.5, 0, CR_TAU); c.fillStyle = piel; c.fill(); c.lineWidth = 3; c.stroke();
  c.beginPath(); c.arc(0, -24, 3, 0, CR_TAU); c.fillStyle = '#ffd9e2'; c.fill();
  c.restore();
}
