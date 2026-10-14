// Fans of Crush · MAPA: la Escalera Corporativa. Una torre de oficinas en tonos pastel que se sube nivel a nivel (cubículos, sala de
// reuniones y Recursos Humanos, con SurvivalBot arriba) y la Planta 2 en obras. Se arrastra para subir y bajar; tocar un nivel lo abre.
'use strict';
const CR_MAPA = { s: 0, v: 0, abajo: false, y0: 0, s0: 0, movido: 0, ultY: 0, ultT: 0, toque: null };
const CR_ZONAS = [
  { desde: 1, hasta: 5, n: 'CUBÍCULOS', pared: ['#f1ebff', '#e2d6ff'] },
  { desde: 6, hasta: 10, n: 'SALA DE REUNIONES', pared: ['#e6faf2', '#d2f2e5'] },
  { desde: 11, hasta: 15, n: 'RECURSOS HUMANOS', pared: ['#ffeef3', '#ffdbe5'] },
];
const crMy = i => 230 + (i - 1) * 118;                         // altura de cada nivel en el mapa (desde abajo)
const crMx = i => (i === 15 ? 270 : 270 + Math.sin(i * 1.2 + 0.3) * 128);
const CR_MAPA_LARGO = () => crMy(15) + 560;
const crSy = my => CR_V.H - (my - CR_MAPA.s);                  // de altura del mapa a pantalla
function crMapaCentra(id) { CR_MAPA.s = clamp(crMy(id) - CR_V.H * 0.42, 0, CR_MAPA_LARGO() - CR_V.H); CR_MAPA.v = 0; }

function crMapaPinta(c, t, dt) {
  const M = CR_MAPA, V = CR_V, L = CR_MAPA_LARGO();
  if (!M.abajo && M.v) { M.s = clamp(M.s + M.v * dt, 0, L - V.H); M.v *= Math.pow(0.04, dt); if (Math.abs(M.v) < 5) M.v = 0; }
  // las paredes de cada zona (con su color) y la planta 2 arriba
  const g0 = c.createLinearGradient(0, 0, 0, V.H); g0.addColorStop(0, '#d9ccff'); g0.addColorStop(1, '#efe8ff'); c.fillStyle = g0; c.fillRect(0, 0, 540, V.H);
  CR_ZONAS.forEach((Z, zi) => {
    const yA = crSy(crMy(Z.hasta) + 70), yB = crSy(crMy(Z.desde) - (zi ? 48 : 230));
    if (yB < 0 || yA > V.H) return;
    const g = c.createLinearGradient(0, yA, 0, yB); g.addColorStop(0, Z.pared[0]); g.addColorStop(1, Z.pared[1]); c.fillStyle = g; c.fillRect(0, yA, 540, yB - yA);
    c.fillStyle = 'rgba(255,255,255,.4)'; for (let x = 10; x < 540; x += 46) c.fillRect(x, yA, 14, yB - yA);
    crMapaVentanas(c, yA, yB, zi);
    crMapaAdornos(c, zi, t);
    // el suelo que separa las zonas, con su cartel
    crRR(c, -10, yA - 12, 560, 24, 0); c.fillStyle = '#fff8f0'; c.fill(); c.fillStyle = 'rgba(74,45,107,.25)'; c.fillRect(0, yA + 10, 540, 3);
    c.fillStyle = CR_COL.tinta; c.fillRect(0, yA - 13, 540, 3);
    crRR(c, 18, yA + 20, 170, 30, 12); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 3; c.strokeStyle = CR_COL.tinta; c.stroke();
    crTexto(c, Z.n, 103, yA + 36, 17, CR_COL.violeta);
  });
  crMapaPlanta2(c, t);
  crMapaRecepcion(c, t);
  // el camino de puntos entre niveles
  for (let i = 1; i < 15; i++) {
    const hecho = crEstrellasDe(i) > 0;
    for (let k = 1; k < 7; k++) {
      const q = k / 7, x = lerp(crMx(i), crMx(i + 1), q) + Math.sin(q * Math.PI) * 30 * (i % 2 ? 1 : -1), y = crSy(lerp(crMy(i), crMy(i + 1), q));
      if (y < -10 || y > V.H + 10) continue;
      c.beginPath(); c.arc(x, y, 6, 0, CR_TAU); c.fillStyle = hecho ? '#ffd36b' : '#ffffff'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = CR_COL.tinta; c.stroke();
    }
  }
  // los niveles
  const actual = crSiguienteNivel();
  for (const N of CR_NIVELES) crMapaNodo(c, N, t, N.id === actual);
  // CrazyBunny salta encima del nivel que toca
  const bx = crMx(actual), by = crSy(crMy(actual)) - (crNivel(actual).jefe ? 104 : 74) - Math.abs(Math.sin(t * 3.2)) * 14;
  if (by > -60 && by < V.H + 60) { const sp = crSprite('n', 0, Math.round(76 * V.sc * V.dpr)); crPonSprite(c, sp, bx, by, V.k); }
}
function crMapaVentanas(c, yA, yB, zi) {
  for (let y = yA + 70; y < yB - 60; y += 236) for (const x of [16, 470]) {
    crRR(c, x, y, 54, 78, 12); const g = c.createLinearGradient(0, y, 0, y + 78); g.addColorStop(0, '#bfe6ff'); g.addColorStop(1, '#ffdbe8'); c.fillStyle = g; c.fill();
    c.lineWidth = 4; c.strokeStyle = '#ffffff'; c.stroke(); c.lineWidth = 2; c.strokeStyle = CR_COL.tinta; c.stroke();
    c.beginPath(); c.arc(x + 18, y + 26, 7, 0, CR_TAU); c.arc(x + 27, y + 22, 9, 0, CR_TAU); c.arc(x + 36, y + 27, 7, 0, CR_TAU); c.fillStyle = '#ffffff'; c.fill();
    c.fillStyle = '#ffffff'; c.fillRect(x + 25, y + 2, 4, 74);
  }
}
// los adornos de cada zona, a los lados del camino: plantas, la fuente de agua, carteles de empresa…
function crMapaAdornos(c, zi, t) {
  const pon = (i, lado, fn) => { const y = crSy(crMy(i)), x = lado < 0 ? 62 : 478; if (y > -120 && y < CR_V.H + 120) { c.save(); c.translate(x, y); fn(c); c.restore(); } };
  const cartel = (txt, col) => c2 => { crRR(c2, -50, -34, 100, 50, 10); c2.fillStyle = '#ffffff'; c2.fill(); c2.lineWidth = 3; c2.strokeStyle = CR_COL.tinta; c2.stroke(); crRR(c2, -44, -28, 88, 38, 7); c2.fillStyle = col; c2.fill(); c2.font = `800 11px "Baloo 2", sans-serif`; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillStyle = CR_COL.tinta; txt.split('\n').forEach((l, k, a) => c2.fillText(tr(l), 0, -9 + (k - (a.length - 1) / 2) * 13)); };
  const planta = c2 => { for (let i = 0; i < 5; i++) { c2.save(); c2.translate(0, -18); c2.rotate(-0.8 + i * 0.4); c2.beginPath(); c2.ellipse(0, -18, 7, 18, 0, 0, CR_TAU); c2.fillStyle = i % 2 ? '#7ad9b0' : '#5cc89c'; c2.fill(); c2.lineWidth = 2.5; c2.strokeStyle = '#2f8a6a'; c2.stroke(); c2.restore(); } crRR(c2, -14, -22, 28, 26, 7); c2.fillStyle = '#ffb3c4'; c2.fill(); c2.lineWidth = 3; c2.strokeStyle = CR_COL.tinta; c2.stroke(); };
  const fuente = c2 => { crRR(c2, -16, -10, 32, 34, 6); c2.fillStyle = '#ffffff'; c2.fill(); c2.lineWidth = 3; c2.strokeStyle = CR_COL.tinta; c2.stroke(); c2.beginPath(); c2.ellipse(0, -26, 15, 18, 0, 0, CR_TAU); c2.fillStyle = 'rgba(124,200,255,.8)'; c2.fill(); c2.stroke(); c2.beginPath(); c2.arc(-4 + Math.sin(t * 2) * 2, -30, 3, 0, CR_TAU); c2.fillStyle = '#ffffff'; c2.fill(); };
  if (zi === 0) { pon(2, 1, planta); pon(3, -1, cartel('SINERGIA\nOBLIGATORIA', '#ffd9e2')); pon(5, 1, fuente); }
  else if (zi === 1) { pon(7, -1, cartel('AQUÍ SOMOS\nUNA FAMILIA', '#d4f8ea')); pon(8, 1, planta); pon(10, -1, planta); }
  else { pon(12, 1, cartel('TU OPINIÓN\nNOS IMPORTA', '#e9e0ff')); pon(13, -1, fuente); pon(14, 1, planta); }
}
function crMapaNodo(c, N, t, actual) {
  const x = crMx(N.id), y = crSy(crMy(N.id)), jefe = !!N.jefe, r = jefe ? 38 : 30;
  if (y < -70 || y > CR_V.H + 70) return;
  const est = crEstrellasDe(N.id), abierto = crAbierto(N.id), pulso = actual ? 1 + 0.06 * Math.sin(t * 5) : 1;
  c.save(); c.translate(x, y); c.scale(pulso, pulso);
  c.beginPath(); c.arc(0, 6, r, 0, CR_TAU); c.fillStyle = 'rgba(74,45,107,.22)'; c.fill();
  if (actual) { c.beginPath(); c.arc(0, 0, r + 9 + 3 * Math.sin(t * 5), 0, CR_TAU); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); }
  c.beginPath(); c.arc(0, 0, r, 0, CR_TAU);
  const g = c.createRadialGradient(-r * 0.3, -r * 0.4, 2, 0, 0, r * 1.1);
  if (!abierto) { g.addColorStop(0, '#f4efff'); g.addColorStop(1, '#cbbcf2'); }
  else if (jefe) { g.addColorStop(0, '#ffe3ea'); g.addColorStop(1, '#ff7a96'); }
  else if (est) { g.addColorStop(0, '#fff5d6'); g.addColorStop(1, '#ffc94d'); }
  else { g.addColorStop(0, '#ffe3ea'); g.addColorStop(1, '#ff8fa8'); }
  c.fillStyle = g; c.fill(); c.lineWidth = 4; c.strokeStyle = CR_COL.tinta; c.stroke();
  c.beginPath(); c.ellipse(-r * 0.35, -r * 0.45, r * 0.3, r * 0.14, -0.6, 0, CR_TAU); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
  if (jefe && abierto) crCaraJefe(c, r * 0.78);
  else if (!abierto) { crRR(c, -9, -3, 18, 15, 4); c.fillStyle = '#9a86c9'; c.fill(); c.beginPath(); c.arc(0, -4, 6.5, Math.PI, 0); c.lineWidth = 3.5; c.strokeStyle = '#9a86c9'; c.stroke(); }
  else crLetras(c, String(N.id), 0, 2, 24, '#ffffff', 0.3);
  c.restore();
  if (est) for (let k = 0; k < 3; k++) { c.save(); c.translate(x + (k - 1) * 20, y + r + 6 - (k === 1 ? 4 : 0)); c.beginPath(); starPath(c, 0, 0, 10, 4.5); c.fillStyle = k < est ? '#ffd36b' : '#e2d6ff'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = CR_COL.tinta; c.lineJoin = 'round'; c.stroke(); c.restore(); }
  if (jefe) { crRR(c, x - 34, y - r - 30, 68, 22, 9); c.fillStyle = '#ff7a96'; c.fill(); c.lineWidth = 3; c.strokeStyle = CR_COL.tinta; c.stroke(); crLetras(c, 'JEFE', x, y - r - 18, 18, '#ffffff', 0.28); }
}
// arriba del todo: la planta 2 está en obras
function crMapaPlanta2(c, t) {
  const yA = crSy(CR_MAPA_LARGO()), yB = crSy(crMy(15) + 70);
  if (yB < 0) return;
  const g = c.createLinearGradient(0, yA, 0, yB); g.addColorStop(0, '#e9e0ff'); g.addColorStop(1, '#d9ccff'); c.fillStyle = g; c.fillRect(0, yA, 540, yB - yA);
  const ym = (yA + yB) / 2 + 20;
  for (const [dy, rot] of [[-40, -0.12], [40, 0.1]]) { c.save(); c.translate(270, ym + dy); c.rotate(rot); c.beginPath(); c.rect(-330, -16, 660, 32); c.clip(); c.fillStyle = '#ffd36b'; c.fillRect(-330, -16, 660, 32); c.fillStyle = '#6a4a9a'; for (let x = -340; x < 340; x += 40) { c.beginPath(); c.moveTo(x, -16); c.lineTo(x + 20, -16); c.lineTo(x + 4, 16); c.lineTo(x - 16, 16); c.closePath(); c.fill(); } c.restore(); }
  crRR(c, 110, ym - 70, 320, 140, 22); c.fillStyle = '#fff8f0'; c.fill(); c.lineWidth = 4; c.strokeStyle = CR_COL.tinta; c.stroke();
  crTexto(c, CR_PLANTAS[1].n, 270, ym - 42, 19, '#9a86c9');
  crTexto(c, CR_PLANTAS[1].nombre, 270, ym - 14, 26, CR_COL.tinta);
  crLetras(c, 'EN OBRAS', 270, ym + 20, 30, '#ffc94d', 0.3);
  crTexto(c, 'Están contando los becarios con los dedos.', 270, ym + 52, 17, CR_COL.violeta, '"Baloo 2", sans-serif');
}
// abajo del todo: la recepción de Microblizz, con el logo del juego
function crMapaRecepcion(c, t) {
  const y = crSy(120); if (y > CR_V.H + 140) return;
  crRR(c, 120, y - 10, 300, 70, 18); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 4; c.strokeStyle = CR_COL.tinta; c.stroke();
  crLetras(c, 'FANS OF CRUSH', 270, y + 18, 30, '#ff7a96', 0.3, true);
  crTexto(c, 'RECEPCIÓN', 270, y + 47, 16, CR_COL.violeta);
}
// tocar y arrastrar
function crMapaAbajo(lx, ly) { Object.assign(CR_MAPA, { abajo: true, y0: ly, s0: CR_MAPA.s, movido: 0, ultY: ly, ultT: performance.now(), v: 0 }); }
function crMapaMueve(lx, ly) {
  const M = CR_MAPA; if (!M.abajo) return;
  M.movido = Math.max(M.movido, Math.abs(ly - M.y0));
  M.s = clamp(M.s0 + (ly - M.y0), 0, CR_MAPA_LARGO() - CR_V.H);
  const ahora = performance.now(), dtm = Math.max(1, ahora - M.ultT); M.v = ((ly - M.ultY) / dtm) * 1000 * 0.9; M.ultY = ly; M.ultT = ahora;
}
function crMapaArriba(lx, ly) {
  const M = CR_MAPA; if (!M.abajo) return; M.abajo = false;
  if (M.movido > 10) return;
  M.v = 0;
  for (const N of CR_NIVELES) {
    const x = crMx(N.id), y = crSy(crMy(N.id));
    if (Math.hypot(lx - x, ly - y) < (N.jefe ? 46 : 40)) {
      if (crAbierto(N.id)) { play('select'); crAbreIntro(N.id); }
      else { play('crNoVale'); toast(tr('Primero supera el nivel anterior')); }
      return;
    }
  }
}
