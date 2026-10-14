// Fans of Crush · MARCADOR: lo de arriba (nivel, movimientos, objetivos, barra de puntos con estrellas y el jefe de RRHH) y lo de abajo
// (Lola comentando y los tres potenciadores). También dice dónde está cada cosa para que las fichas vuelen hasta ella y para los toques.
'use strict';
const CR_HUD = { puntos: 0, pulso: 0, vida: 0, golpe: 0, estrellas: 0 };
const CR_LOLA = { txt: '', t: 0, dur: 0, prio: 0, lineas: null, quien: '' };
const CR_POTES = [
  { k: 'martillo', n: 'MARTILLO', col: '#ff7a96' },
  { k: 'cafe', n: 'CAFÉ +5', col: '#c98a5a' },
  { k: 'mezcla', n: 'REESTRUCTURAR', col: '#5bbcff' },
];
// un panel claro con contorno ciruela y un brillo dentro
function crPanel(c, x, y, w, h, r, fondo = CR_COL.crema, borde = CR_COL.tinta) {
  crRR(c, x, y + 4, w, h, r); c.fillStyle = 'rgba(74,45,107,.18)'; c.fill();
  crRR(c, x, y, w, h, r); c.fillStyle = fondo; c.fill(); c.lineWidth = 4; c.strokeStyle = borde; c.stroke();
  crRR(c, x + 5, y + 5, w - 10, h - 10, Math.max(2, r - 4)); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke();
}
// Lola: lo que dice se queda unos segundos; algo más importante la interrumpe. quien: otra cabecera (cuando habla el jefe)
function crLola(txt, prio = 1, dur = 4.5, quien = '') {
  if (!txt) return;
  if (CR_LOLA.txt && CR_LOLA.t < CR_LOLA.dur && prio < CR_LOLA.prio) return;
  Object.assign(CR_LOLA, { txt, t: 0, dur, prio, lineas: null, quien });
}
function crEnvuelve(c, txt, ancho) {
  const palabras = tr(txt).split(' '), lineas = []; let l = '';
  for (const p of palabras) { const prueba = l ? l + ' ' + p : p; if (c.measureText(prueba).width > ancho && l) { lineas.push(l); l = p; } else l = prueba; }
  if (l) lineas.push(l);
  return lineas;
}
// dónde está cada cosa (las fichas vuelan hasta allí y los toques se miran aquí)
function crPosObjetivo(i) { const n = CR_P.obj.length; return [460 + (i - (n - 1) / 2) * (n > 2 ? 40 : 46), CR_V.hudY + 52]; }
const crPosJefe = () => [50, CR_V.hudY + 181];
const crPosMovs = () => [270, CR_V.hudY + 50];
const crPosPote = i => [112 + i * 158, CR_V.H - 92 - Math.round((CR_V.H - 960) * 0.05)];
const crEnPausa = (lx, ly) => lx < 150 && ly > CR_V.hudY - 6 && ly < CR_V.hudY + 96;
function crPoteEn(lx, ly) { for (let i = 0; i < 3; i++) { const [x, y] = crPosPote(i); if (Math.hypot(lx - x, ly - y) < 44) return i; } return -1; }
const fmtCorto = n => (n >= 10000 ? Math.round(n / 1000) + 'k' : fmt(n));

function crPintaMarcador(c, t, dt) {
  const V = CR_V, P = CR_P, y0 = V.hudY;
  CR_HUD.pulso = Math.max(0, CR_HUD.pulso - dt * 3);
  CR_HUD.puntos += (P.puntos - CR_HUD.puntos) * Math.min(1, dt * 7); if (Math.abs(P.puntos - CR_HUD.puntos) < 1) CR_HUD.puntos = P.puntos;
  // nivel (y botón de pausa)
  crPanel(c, 12, y0, 136, 92, 20);
  crTexto(c, CR_PLANTAS[0].n, 64, y0 + 27, 18, '#9a86c9');
  crTexto(c, `NIVEL ${P.N.id}`, 74, y0 + 62, 28, CR_COL.tinta);
  c.fillStyle = CR_COL.violeta; for (const dx of [0, 8]) { crRR(c, 125 + dx, y0 + 13, 5, 15, 2.5); c.fill(); }
  // movimientos
  const pocos = P.movs <= 5 && P.estado === 'jugando', ps = 1 + CR_HUD.pulso * 0.18 + (pocos ? 0.04 * Math.sin(t * 9) : 0);
  c.save(); c.translate(270, y0 + 50); c.scale(ps, ps);
  c.beginPath(); c.arc(0, 6, 52, 0, CR_TAU); c.fillStyle = 'rgba(74,45,107,.2)'; c.fill();
  c.beginPath(); c.arc(0, 0, 52, 0, CR_TAU);
  const g = c.createRadialGradient(-14, -22, 6, 0, 0, 58);
  if (pocos) { g.addColorStop(0, '#ffe0e8'); g.addColorStop(0.45, '#ff8fa8'); g.addColorStop(1, '#e0507a'); } else { g.addColorStop(0, '#f1ebff'); g.addColorStop(0.45, '#b79cff'); g.addColorStop(1, '#7d5ce6'); }
  c.fillStyle = g; c.fill(); c.lineWidth = 5; c.strokeStyle = CR_COL.tinta; c.stroke();
  c.beginPath(); c.ellipse(-18, -26, 16, 7, -0.5, 0, CR_TAU); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
  crLetras(c, String(Math.max(0, P.movs)), 0, -9, 50, '#ffffff');
  crLetras(c, 'MOVIMIENTOS', 0, 27, 14, '#ffffff', 0.32, false, '"Baloo 2", sans-serif');
  c.restore();
  // objetivos
  crPanel(c, 392, y0, 136, 92, 20);
  crTexto(c, 'OBJETIVO', 460, y0 + 17, 16, CR_COL.violeta);
  P.obj.forEach((o, i) => {
    const [x, y] = crPosObjetivo(i), r = P.obj.length > 2 ? 15 : 18;
    const vivo = o.visto === undefined ? o.hecho : o.visto, s = 1 + (o.pulso || 0) * 0.3; o.pulso = Math.max(0, (o.pulso || 0) - dt * 4);
    c.save(); c.translate(x, y); c.scale(s, s);
    if (o.t === 'puntos') crIcono(c, 'puntos', 0, 0, 0, r); else crIcono(c, o.t, o.c, 0, 0, r);
    c.restore();
    if (crObjListo(o)) {
      const cx = x + r * 0.85, cy = y + r * 0.85;
      c.beginPath(); c.arc(cx, cy, 10, 0, CR_TAU); c.fillStyle = '#4fd6a8'; c.fill(); c.lineWidth = 3; c.strokeStyle = CR_COL.tinta; c.stroke();
      c.beginPath(); c.moveTo(cx - 5, cy); c.lineTo(cx - 1, cy + 4); c.lineTo(cx + 5, cy - 4); c.lineWidth = 2.6; c.strokeStyle = '#fff'; c.lineCap = 'round'; c.stroke();
    } else {
      const queda = o.t === 'puntos' ? fmtCorto(Math.max(0, o.n - Math.round(CR_HUD.puntos))) : o.t === 'jefe' ? Math.ceil(P.jefe.vida) : Math.max(0, o.total - vivo);
      crTexto(c, String(queda), x, y + r + 12, 20, CR_COL.tinta);
    }
  });
  // puntos y estrellas
  crPanel(c, 12, y0 + 102, 516, 42, 18);
  const est = P.N.est, max = est[2] * 1.08, k = Math.min(1, CR_HUD.puntos / max), bx = 28, bw = 358;
  crRR(c, bx, y0 + 115, bw, 16, 8); c.fillStyle = '#ece4ff'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(74,45,107,.3)'; c.stroke();
  if (k > 0.01) { crRR(c, bx, y0 + 115, Math.max(16, bw * k), 16, 8); const b = c.createLinearGradient(bx, 0, bx + bw, 0); b.addColorStop(0, '#6fe0b9'); b.addColorStop(1, '#7cc8ff'); c.fillStyle = b; c.fill(); crRR(c, bx + 4, y0 + 117, Math.max(8, bw * k - 8), 4, 2); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); }
  let n = 0;
  est.forEach((e, i) => {
    const sx = bx + bw * (e / max), on = CR_HUD.puntos >= e; if (on) n++;
    c.save(); c.translate(sx, y0 + 123);
    c.beginPath(); starPath(c, 0, 0, 14, 6.5); c.fillStyle = on ? '#ffd36b' : '#ddd2fb'; c.fill(); c.lineWidth = 3; c.strokeStyle = CR_COL.tinta; c.lineJoin = 'round'; c.stroke(); c.restore();
  });
  if (n > CR_HUD.estrellas) { CR_HUD.estrellas = n; play('crEstrella', n - 1); crEstallido(bx + bw * (est[n - 1] / max), y0 + 123, '#ffd36b', 12, 0.8); }
  crTexto(c, fmt(CR_HUD.puntos), 458, y0 + 124, 25, CR_COL.tinta);
  if (P.jefe) crPintaJefe(c, t, dt);
  crPintaAbajo(c, t, dt);
}
// el jefe de RRHH: su cara, su vida y cuánto falta para su próximo ataque
function crPintaJefe(c, t, dt) {
  const V = CR_V, J = CR_P.jefe, y = V.hudY + 152;
  CR_HUD.vida += (J.vida - CR_HUD.vida) * Math.min(1, dt * 6);
  crPanel(c, 12, y, 516, 58, 20, '#ffe6ec', '#c94a6e');
  const [fx, fy] = crPosJefe(), sac = J.golpe ? Math.sin(t * 60) * 3 * J.golpe : 0; J.golpe = Math.max(0, J.golpe - dt * 3);
  c.save(); c.translate(fx + sac, fy); crCaraJefe(c, 24); c.restore();
  crTexto(c, 'SURVIVALBOT · JEFE DE RRHH', 92, y + 16, 17, '#c94a6e', FONT_D, 'left');
  const bw = 330, k = Math.max(0, CR_HUD.vida / J.max);
  crRR(c, 92, y + 30, bw, 16, 8); c.fillStyle = '#ffd0dc'; c.fill();
  if (k > 0.005) { crRR(c, 92, y + 30, Math.max(14, bw * k), 16, 8); const g = c.createLinearGradient(0, y + 30, 0, y + 46); g.addColorStop(0, '#ffb3c4'); g.addColorStop(1, '#ff5f86'); c.fillStyle = g; c.fill(); }
  crLetras(c, `${Math.ceil(J.vida)}/${J.max}`, 92 + bw / 2, y + 38, 15, '#ffffff', 0.32);
  const rojo = J.cuenta <= 1 && J.vida > 0;
  c.save(); c.translate(478, y + 29); if (rojo) c.scale(1 + 0.08 * Math.sin(t * 10), 1 + 0.08 * Math.sin(t * 10));
  crRR(c, -38, -21, 76, 42, 12); c.fillStyle = rojo ? '#ff7a96' : '#b79cff'; c.fill(); c.lineWidth = 3; c.strokeStyle = CR_COL.tinta; c.stroke();
  crLetras(c, 'ATAQUE EN', 0, -9, 12.5, '#ffffff', 0.3); crLetras(c, String(Math.max(0, J.cuenta)), 0, 9, 21, '#ffffff', 0.3);
  c.restore();
}
function crPintaAbajo(c, t, dt) {
  const V = CR_V, y = V.abajoY;
  // Lola (o el jefe, cuando habla él)
  CR_LOLA.t += dt;
  const jefe = CR_LOLA.quien && CR_LOLA.t < CR_LOLA.dur;
  crPanel(c, 14, y - 8, 512, 104, 20, jefe ? '#ffe6ec' : CR_COL.crema, jefe ? '#c94a6e' : CR_COL.tinta);
  crTexto(c, jefe ? CR_LOLA.quien : 'LOLA · DESPEDIDA POR MICROBLIZZ', 30, y + 13, 15, jefe ? '#c94a6e' : CR_COL.violeta, '"Baloo 2", sans-serif', 'left');
  if (CR_LOLA.txt) {
    c.font = '800 20px "Baloo 2", sans-serif';
    if (!CR_LOLA.lineas) CR_LOLA.lineas = crEnvuelve(c, CR_LOLA.txt, 476).slice(0, 3);
    const a = Math.min(1, CR_LOLA.t * 5), L = CR_LOLA.lineas, alto = L.length > 2 ? 22 : 25;
    c.save(); c.globalAlpha = a; c.fillStyle = CR_COL.tinta; c.textAlign = 'left'; c.textBaseline = 'middle';
    L.forEach((l, i) => c.fillText(l, 30, y + 40 + i * alto - (L.length > 2 ? 2 : 0))); c.restore();
  }
  // potenciadores
  CR_POTES.forEach((P, i) => {
    const [x, py] = crPosPote(i), n = SAVE.potes[P.k] || 0, activo = P.k === 'martillo' && CR_IN.martillo;
    c.save(); c.translate(x, py); if (activo) { const s = 1.08 + 0.04 * Math.sin(t * 8); c.scale(s, s); }
    c.beginPath(); c.arc(0, 5, 36, 0, CR_TAU); c.fillStyle = 'rgba(74,45,107,.2)'; c.fill();
    c.beginPath(); c.arc(0, 0, 36, 0, CR_TAU);
    const g = c.createRadialGradient(-10, -14, 4, 0, 0, 40); g.addColorStop(0, '#ffffff'); g.addColorStop(1, activo ? '#ffc2cf' : '#e4d9ff');
    c.fillStyle = g; c.fill(); c.lineWidth = 4; c.strokeStyle = activo ? '#e0507a' : CR_COL.tinta; c.stroke();
    c.globalAlpha = n ? 1 : 0.45; crIconoPote(c, P.k, P.col); c.globalAlpha = 1;
    c.beginPath(); c.arc(27, -26, 13, 0, CR_TAU); c.fillStyle = n ? '#ff7a96' : '#4fd6a8'; c.fill(); c.lineWidth = 3; c.strokeStyle = CR_COL.tinta; c.stroke();
    crLetras(c, n ? String(n) : '+', 27, -25, 18, '#ffffff', 0.25);
    c.restore();
    crTexto(c, P.n, x, py + 54, 17, CR_COL.tinta);
  });
}
function crIconoPote(c, k, col) {
  c.lineJoin = 'round'; c.lineCap = 'round';
  const tinta = CR_COL.tinta;
  if (k === 'martillo') { c.save(); c.rotate(-0.6); crRR(c, -4, -6, 8, 34, 3); c.fillStyle = '#e8b27a'; c.fill(); c.lineWidth = 3; c.strokeStyle = tinta; c.stroke(); crRR(c, -18, -20, 36, 16, 5); c.fillStyle = col; c.fill(); c.stroke(); c.restore(); }
  else if (k === 'cafe') {
    crRR(c, -14, -10, 24, 26, 6); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 3; c.strokeStyle = tinta; c.stroke();
    c.beginPath(); c.arc(12, 2, 7, -1.4, 1.4); c.stroke(); c.fillStyle = col; c.fillRect(-11, -7, 18, 6);
    c.beginPath(); heartPath(c, -2, 6, 3.4); c.fillStyle = '#ff7a96'; c.fill();
    for (const dx of [-6, 2]) { c.beginPath(); c.moveTo(dx, -14); c.quadraticCurveTo(dx + 4, -19, dx, -24); c.lineWidth = 2.5; c.strokeStyle = '#b79cff'; c.stroke(); }
  } else {
    c.lineWidth = 5; c.strokeStyle = col; c.beginPath(); c.arc(0, 0, 15, 0.3, 2.8); c.stroke(); c.beginPath(); c.arc(0, 0, 15, 3.4, 5.9); c.stroke();
    for (const a of [2.8, 5.9]) { const px = Math.cos(a) * 15, py = Math.sin(a) * 15; c.beginPath(); c.moveTo(px - 6, py - 2); c.lineTo(px + 4, py - 6); c.lineTo(px + 2, py + 5); c.closePath(); c.fillStyle = col; c.fill(); }
  }
}
