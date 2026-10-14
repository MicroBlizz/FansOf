// Fans of Crush · FICHAS: las 6 chapas (un líder por facción, con la cabeza asomando por arriba), los especiales, las trabas de Microblizz
// y los iconos del marcador. Todo se dibuja con el arte de core (core/js/serie/arte) y se guarda ya pintado en lienzos pequeños.
'use strict';
const CR_TAU = Math.PI * 2;
// la paleta del juego: tonos suaves y alegres (lavanda, celeste, menta, miel, coral y pistacho) sobre crema; nada de negro ni de gris
const CR_COL = { tinta: '#4a2d6b', crema: '#fff8f0', lavanda: '#b79cff', violeta: '#8f6cf0', lavandaClara: '#ece4ff', celeste: '#7cc8ff', menta: '#6fe0b9', coral: '#ff7a96', miel: '#ffd36b', rosa: '#ffd9e2' };
// las 6 fichas: la familia de los Animales Locos. k: dibujo de core · cara: dónde está la cabeza en ese dibujo [x, y, tamaño]
// forma: su silueta (se distinguen por forma y por color) · col/luz/osc: el color del borde de la ficha
const CR_FICHAS = [
  { k: 'bunny', n: 'CrazyBunny', np: 'CrazyBunnies', forma: 'circulo', col: '#a98bff', luz: '#e9e0ff', osc: '#6b4fd1', cara: [0, -40, 40] },
  { k: 'meercat', n: 'MeerCat', np: 'MeerCats', forma: 'corazon', col: '#ff7a96', luz: '#ffd9e2', osc: '#cc3f63', cara: [0, -32, 38] },
  { k: 'fox', n: 'SlyFox', np: 'SlyFoxes', forma: 'rombo', col: '#5bbcff', luz: '#d6efff', osc: '#2a7fcf', cara: [0, -29, 34] },
  { k: 'squirrel', n: 'MadSquirrel', np: 'MadSquirrels', forma: 'bellota', col: '#ffc94d', luz: '#fff2c4', osc: '#d1931a', cara: [0, -27, 32] },
  { k: 'junkcoon', n: 'JunkCoon', np: 'JunkCoons', forma: 'cojin', col: '#4fd6a8', luz: '#d4f8ea', osc: '#1f9a73', cara: [0, -30, 32] },
  { k: 'vaca', n: 'MechaVaca', np: 'MechaVacas', forma: 'nube', col: '#9ad65a', luz: '#e6f7cf', osc: '#5c9a22', cara: [0, -23, 31] },
];
const CR_CASTOR = { k: 'beaver', cara: [0, -26, 32] };   // la cara que lleva la dinamita
const CR_ARCOIRIS = ['#a98bff', '#5bbcff', '#4fd6a8', '#9ad65a', '#ffc94d', '#ff7a96', '#a98bff'];

function crRR(c, x, y, w, h, r) { c.beginPath(); rrPath(c, x, y, w, h, r); }
// la cabeza de un personaje de core, centrada en 0,0 y escalada para ocupar «mult» radios
function crCara(c, cara, k, r, mult) {
  const [hx, hy, hs] = cara, sc = (r * mult) / hs;
  c.save(); c.translate(-hx * sc, -hy * sc + r * 0.06); c.scale(sc, sc); c.lineJoin = 'round'; c.lineCap = 'round';
  if (ART[k]) ART[k](c); c.restore();
}
// la silueta de cada ficha: círculo, corazón, rombo, bellota, cojín y nube
function crForma(c, forma, r) {
  c.beginPath();
  if (forma === 'circulo') c.arc(0, 0, r * 0.93, 0, CR_TAU);
  else if (forma === 'corazon') {
    c.moveTo(0, r * 0.96); c.bezierCurveTo(-r * 0.55, r * 0.62, -r * 1.06, r * 0.18, -r * 1.0, -r * 0.3);
    c.bezierCurveTo(-r * 0.95, -r * 0.88, -r * 0.24, -r * 1.02, 0, -r * 0.56); c.bezierCurveTo(r * 0.24, -r * 1.02, r * 0.95, -r * 0.88, r * 1.0, -r * 0.3);
    c.bezierCurveTo(r * 1.06, r * 0.18, r * 0.55, r * 0.62, 0, r * 0.96); c.closePath();
  } else if (forma === 'rombo') {
    const q = r * 1.04, k = r * 0.2; c.moveTo(0, -q); c.arcTo(q, 0, 0, q, k); c.arcTo(0, q, -q, 0, k); c.arcTo(-q, 0, 0, -q, k); c.arcTo(0, -q, q, 0, k); c.closePath();
  } else if (forma === 'bellota') {
    c.moveTo(-r * 0.94, -r * 0.26); c.bezierCurveTo(-r * 0.98, -r * 1.0, r * 0.98, -r * 1.0, r * 0.94, -r * 0.26);
    c.bezierCurveTo(r * 0.92, r * 0.46, r * 0.34, r * 0.86, 0, r * 1.0); c.bezierCurveTo(-r * 0.34, r * 0.86, -r * 0.92, r * 0.46, -r * 0.94, -r * 0.26); c.closePath();
  } else if (forma === 'cojin') rrPath(c, -r * 0.9, -r * 0.9, r * 1.8, r * 1.8, r * 0.46);
  else {   // nube: varios círculos y una base redondeada (se pinta con el truco de contorno doble para que no se vean las uniones)
    for (const [x, y, rr] of [[-0.5, 0.14, 0.46], [-0.12, -0.36, 0.56], [0.46, -0.2, 0.5], [0.6, 0.24, 0.4]]) { c.moveTo(x * r + rr * r, y * r); c.arc(x * r, y * r, rr * r, 0, CR_TAU); }
    rrPath(c, -r * 0.94, r * 0.02, r * 1.88, r * 0.8, r * 0.38);
  }
}
// rellena una silueta con su contorno (la nube primero pinta el contorno doble y luego el relleno encima)
function crFormaPinta(c, forma, r, relleno, grosor, contorno = OL) {
  crForma(c, forma, r);
  if (forma === 'nube') { if (grosor) { c.lineWidth = grosor * 2; c.strokeStyle = contorno; c.stroke(); } c.fillStyle = relleno; c.fill(); return; }
  c.fillStyle = relleno; c.fill(); if (grosor) { c.lineWidth = grosor; c.strokeStyle = contorno; c.stroke(); }
}
// la ficha: borde del color del animal, panel claro dentro y la cabeza asomando por arriba. otra: otra cara (BoomBeaver en la dinamita)
function crChapa(c, f, r, otra) {
  const F = CR_FICHAS[f], k = F.forma === 'rombo' ? 0.72 : F.forma === 'corazon' ? 0.74 : 0.78;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  c.save(); c.translate(0, r * 0.12); crFormaPinta(c, F.forma, r, 'rgba(74,45,107,.28)', 0); c.restore();
  const g = c.createLinearGradient(-r, -r, r, r); g.addColorStop(0, F.luz); g.addColorStop(0.45, F.col); g.addColorStop(1, F.osc);
  crFormaPinta(c, F.forma, r, g, r * 0.12);
  if (F.forma === 'bellota') { c.save(); crForma(c, 'bellota', r); c.clip(); c.beginPath(); c.rect(-r, -r, r * 2, r * 0.74); c.fillStyle = 'rgba(160,90,20,.28)'; c.fill(); for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * r * 0.3 - r * 0.2, -r); c.lineTo(i * r * 0.3 + r * 0.2, -r * 0.26); c.lineWidth = r * 0.05; c.strokeStyle = 'rgba(255,255,255,.35)'; c.stroke(); } c.restore(); }
  const panel = () => { c.save(); c.scale(k, k); if (F.forma === 'bellota') c.translate(0, r * 0.1); crForma(c, F.forma, r); c.restore(); };
  const g2 = c.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.05, 0, 0, r * 0.85); g2.addColorStop(0, '#fffdf8'); g2.addColorStop(1, F.luz);
  panel(); c.fillStyle = g2; c.fill(); c.lineWidth = r * 0.06; c.strokeStyle = F.osc; if (F.forma !== 'nube') c.stroke();
  // la cabeza: dentro del panel y, por encima del centro, también fuera (asoma por arriba)
  c.save(); panel(); c.rect(-r * 0.7, -r * 1.34, r * 1.4, r * 1.34); c.clip();
  if (otra) crCara(c, otra.cara, otra.k, r, 1.82); else crCara(c, F.cara, F.k, r, 1.9);
  c.restore();
  c.save(); crForma(c, F.forma, r); c.clip(); c.beginPath(); c.ellipse(-r * 0.48, -r * 0.48, r * 0.2, r * 0.085, -0.75, 0, CR_TAU); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); c.restore();
  c.restore();
}
// el cohete Chaos Jump: rayas blancas en la dirección en que barre, flechas a los lados y una zanahoria-cohete en la esquina
function crRayas(c, f, r, vertical) {
  c.save(); crForma(c, CR_FICHAS[f].forma, r); c.clip(); if (vertical) c.rotate(Math.PI / 2);
  for (const y of [-0.46, 0.46]) { c.beginPath(); c.rect(-r * 1.2, (y - 0.1) * r, r * 2.4, r * 0.2); c.fillStyle = 'rgba(255,255,255,.82)'; c.fill(); c.lineWidth = r * 0.05; c.strokeStyle = 'rgba(32,16,44,.55)'; c.stroke(); }
  c.restore();
  c.save(); if (vertical) c.rotate(Math.PI / 2);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * r * 1.2, 0); c.lineTo(s * r * 0.88, -r * 0.26); c.lineTo(s * r * 0.88, r * 0.26); c.closePath(); c.fillStyle = '#fff6ea'; c.fill(); c.lineWidth = r * 0.08; c.strokeStyle = OL; c.stroke(); }
  c.restore();
  crZanahoria(c, r * 0.58, r * 0.58, r * 0.36, -0.8);
}
function crZanahoria(c, x, y, z, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.lineJoin = 'round';
  c.beginPath(); c.moveTo(0, -z); c.quadraticCurveTo(z * 0.55, -z * 0.1, z * 0.32, z * 0.7); c.lineTo(-z * 0.32, z * 0.7); c.quadraticCurveTo(-z * 0.55, -z * 0.1, 0, -z);
  c.fillStyle = '#ff7a1a'; c.fill(); c.lineWidth = Math.max(1, z * 0.17); c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.moveTo(-z * 0.25, z * 0.72); c.lineTo(0, z * 1.25); c.lineTo(z * 0.25, z * 0.72); c.closePath(); c.fillStyle = '#ffd02e'; c.fill(); c.stroke();
  c.restore();
}
// la dinamita de BoomBeaver: la chapa sigue siendo de su color (cuenta para juntar), con la cara de BoomBeaver y la mecha encendida
function crDinamita(c, f, r) {
  c.save(); c.beginPath(); c.arc(0, 0, r * 1.1, 0, CR_TAU);
  const g = c.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.12); g.addColorStop(0, 'rgba(255,110,140,.55)'); g.addColorStop(1, 'rgba(255,110,140,0)'); c.fillStyle = g; c.fill(); c.restore();
  crChapa(c, f, r, CR_CASTOR);
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(r * 0.5, -r * 0.62); c.quadraticCurveTo(r * 0.9, -r * 0.9, r * 0.82, -r * 1.1); c.lineWidth = r * 0.1; c.strokeStyle = OL; c.stroke(); c.lineWidth = r * 0.05; c.strokeStyle = '#d9b27a'; c.stroke();
  c.restore();
}
function crChispa(c, x, y, r, t) {   // la chispa de la mecha (se pinta en cada fotograma, parpadea)
  const s = r * (0.22 + 0.06 * Math.sin(t * 31));
  c.save(); c.beginPath(); starPath(c, x, y, s, s * 0.4, 7); c.fillStyle = '#fff3a0'; c.fill(); c.lineWidth = r * 0.05; c.strokeStyle = '#ff7a1a'; c.stroke(); c.restore();
}
// el láser IP Burial: una lápida con el arcoíris de todas las facciones (no tiene color: se combina con cualquiera)
function crLapida(c, r, t) {
  c.save(); c.lineJoin = 'round';
  const forma = (k) => { const w = r * 0.82 * k, top = -r * 0.12 * k; c.beginPath(); c.moveTo(-w, r * 0.9 * k); c.lineTo(-w, top); c.arc(0, top, w, Math.PI, 0); c.lineTo(w, r * 0.9 * k); c.closePath(); };
  c.save(); c.translate(0, r * 0.12); forma(1); c.fillStyle = 'rgba(8,3,16,.45)'; c.fill(); c.restore();
  forma(1);
  const g = c.createConicGradient ? c.createConicGradient(t || 0, 0, 0) : c.createLinearGradient(-r, 0, r, 0);
  CR_ARCOIRIS.forEach((col, i, a) => g.addColorStop(i / (a.length - 1), col));
  c.fillStyle = g; c.fill(); c.lineWidth = r * 0.13; c.strokeStyle = OL; c.stroke();
  forma(0.72);
  const p = c.createLinearGradient(0, -r, 0, r); p.addColorStop(0, '#9c8fc4'); p.addColorStop(1, '#5a4a8a'); c.fillStyle = p; c.fill(); c.lineWidth = r * 0.06; c.strokeStyle = OL; c.stroke();
  c.font = `${Math.round(r * 0.44)}px ${FONT_D}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#f4efff'; c.fillText(tr('IP'), 0, r * 0.2);
  c.beginPath(); c.arc(0, -r * 0.3, r * 0.15, 0, CR_TAU); c.fillStyle = '#ff7a96'; c.fill(); c.lineWidth = r * 0.05; c.stroke();
  c.beginPath(); c.arc(-r * 0.04, -r * 0.34, r * 0.05, 0, CR_TAU); c.fillStyle = '#fff'; c.fill();
  c.restore();
}
// el becario: no se junta con nada; hay que bajarlo hasta la SALIDA
function crBecario(c, r) {
  c.save(); c.beginPath(); c.arc(0, 0, r * 0.98, 0, CR_TAU);
  const g = c.createRadialGradient(0, 0, r * 0.2, 0, 0, r); g.addColorStop(0, 'rgba(255,246,234,.6)'); g.addColorStop(1, 'rgba(255,246,234,0)'); c.fillStyle = g; c.fill();
  const sc = (r * 2.05) / 34; c.translate(0, r * 0.98); c.scale(sc, sc); c.lineJoin = 'round'; c.lineCap = 'round'; if (ART.becario) ART.becario(c); c.restore();
}
// StarBot congelado: ocupa la casilla; con una sola capa sale agrietado
function crHielo(c, r, vida) {
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  crRR(c, -r, -r, r * 2, r * 2, r * 0.24); c.fillStyle = '#9fd3ff'; c.fill();
  c.save(); crRR(c, -r, -r, r * 2, r * 2, r * 0.24); c.clip(); const sc = (r * 1.9) / 40; c.translate(0, r * 0.08); c.scale(sc, sc); c.translate(0, 28); if (ART.starbot) ART.starbot(c); c.restore();
  crRR(c, -r, -r, r * 2, r * 2, r * 0.24);
  const g = c.createLinearGradient(-r, -r, r, r); g.addColorStop(0, 'rgba(240,252,255,.62)'); g.addColorStop(0.45, 'rgba(170,225,255,.22)'); g.addColorStop(1, 'rgba(120,190,250,.5)');
  c.fillStyle = g; c.fill(); c.lineWidth = r * 0.12; c.strokeStyle = '#1d4f86'; c.stroke();
  c.beginPath(); c.moveTo(-r * 0.72, -r * 0.5); c.lineTo(-r * 0.36, -r * 0.8); c.lineWidth = r * 0.11; c.strokeStyle = 'rgba(255,255,255,.95)'; c.stroke();
  c.beginPath(); c.moveTo(-r * 0.78, -r * 0.18); c.lineTo(-r * 0.66, -r * 0.3); c.lineWidth = r * 0.08; c.stroke();
  if (vida > 1) { crRR(c, -r * 0.82, -r * 0.82, r * 1.64, r * 1.64, r * 0.16); c.lineWidth = r * 0.07; c.strokeStyle = 'rgba(255,255,255,.75)'; c.stroke(); }
  else { c.beginPath(); c.moveTo(r * 0.25, -r * 0.98); c.lineTo(r * 0.05, -r * 0.4); c.lineTo(r * 0.4, -r * 0.08); c.lineTo(r * 0.12, r * 0.4); c.moveTo(r * 0.05, -r * 0.4); c.lineTo(-r * 0.3, -r * 0.2); c.lineWidth = r * 0.07; c.strokeStyle = 'rgba(255,255,255,.95)'; c.stroke(); }
  c.restore();
}
// CajaBotín: la caja de despidos, aguanta 3 golpes (el número dice cuántos le quedan)
function crCaja(c, r, vida) {
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  crRR(c, -r, -r, r * 2, r * 2, r * 0.22); c.fillStyle = '#5a4a8a'; c.fill();
  c.save(); crRR(c, -r, -r, r * 2, r * 2, r * 0.22); c.clip(); const sc = (r * 2.0) / 40; c.translate(0, r * 0.95); c.scale(sc, sc); if (ART.cajabotin) ART.cajabotin(c); c.restore();
  crRR(c, -r, -r, r * 2, r * 2, r * 0.22); c.lineWidth = r * 0.12; c.strokeStyle = OL; c.stroke();
  for (let i = 0; i < 3 - vida; i++) { c.beginPath(); const x0 = -r * 0.5 + i * r * 0.5; c.moveTo(x0, -r); c.lineTo(x0 + r * 0.15, -r * 0.5); c.lineTo(x0 - r * 0.05, -r * 0.1); c.lineWidth = r * 0.07; c.strokeStyle = '#fff6ea'; c.stroke(); }
  c.beginPath(); c.arc(r * 0.66, -r * 0.66, r * 0.34, 0, CR_TAU); c.fillStyle = '#ff7a96'; c.fill(); c.lineWidth = r * 0.08; c.strokeStyle = OL; c.stroke();
  c.font = `${Math.round(r * 0.46)}px ${FONT_D}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff6ea'; c.fillText(String(vida), r * 0.66, -r * 0.62);
  c.restore();
}
// la cinta de «CANCELADO»: franjas amarillas y negras en toda la casilla, debajo de la ficha
function crCinta(c, x, y, s, a = 1) {
  c.save(); c.globalAlpha = a; crRR(c, x, y, s, s, s * 0.15); c.clip();
  c.fillStyle = '#ffd36b'; c.fillRect(x, y, s, s);
  c.fillStyle = '#6a4a9a'; const p = s / 4;
  for (let i = -4; i < 8; i++) { c.beginPath(); c.moveTo(x + i * p, y); c.lineTo(x + i * p + p / 2, y); c.lineTo(x + i * p + p / 2 - s, y + s); c.lineTo(x + i * p - s, y + s); c.closePath(); c.fill(); }
  c.restore();
  c.save(); c.globalAlpha = a; crRR(c, x, y, s, s, s * 0.15); c.lineWidth = Math.max(2, s * 0.05); c.strokeStyle = CR_COL.tinta; c.stroke(); c.restore();
}

/* ---------- los lienzos ya pintados: uno por tipo de ficha y tamaño ---------- */
const CR_SPR = {};
// tipo: 'n' normal, 'h'/'v' cohete, 'b' dinamita, 'e' becario, 'hielo1/2', 'caja1/2/3' · px: lado de la casilla en píxeles de pantalla
function crSprite(tipo, f, px) {
  const clave = tipo + ':' + f + ':' + px;
  let s = CR_SPR[clave]; if (s) return s;
  const lado = Math.ceil(px * 1.5), cv = document.createElement('canvas'); cv.width = lado; cv.height = lado;
  const c = cv.getContext('2d'), r = px * 0.43; c.translate(lado / 2, lado / 2);
  if (tipo === 'n') crChapa(c, f, r);
  else if (tipo === 'h' || tipo === 'v') { crChapa(c, f, r); crRayas(c, f, r, tipo === 'v'); }
  else if (tipo === 'b') crDinamita(c, f, r);
  else if (tipo === 'e') crBecario(c, r);
  else if (tipo.startsWith('hielo')) crHielo(c, px * 0.47, +tipo.slice(5));
  else if (tipo.startsWith('caja')) crCaja(c, px * 0.47, +tipo.slice(4));
  else if (tipo === 'cinta') crCinta(c, -px / 2 + 2, -px / 2 + 2, px - 4);
  s = CR_SPR[clave] = { cv, lado };
  return s;
}
// pinta un lienzo ya hecho centrado en x,y con escala sx,sy (el tamaño de casilla es el del lienzo)
function crPonSprite(c, s, x, y, sx = 1, sy = sx, a = 1, rot = 0) {
  c.save(); c.globalAlpha *= a; c.translate(x, y); if (rot) c.rotate(rot); c.scale(sx, sy); c.drawImage(s.cv, -s.lado / 2, -s.lado / 2); c.restore();
}
function crOlvidaSprites() { for (const k in CR_SPR) delete CR_SPR[k]; }

/* ---------- iconos del marcador y de los objetivos ---------- */
// tipo: 'color' (f), 'hielo', 'caja', 'cinta', 'becario', 'puntos', 'jefe'
function crIcono(c, tipo, f, x, y, r) {
  c.save(); c.translate(x, y);
  if (tipo === 'color') crChapa(c, f, r);
  else if (tipo === 'hielo') crHielo(c, r * 0.95, 2);
  else if (tipo === 'caja') crCaja(c, r * 0.95, 3);
  else if (tipo === 'cinta') crCinta(c, -r * 0.95, -r * 0.95, r * 1.9);
  else if (tipo === 'becario') crBecario(c, r);
  else if (tipo === 'jefe') crCaraJefe(c, r);
  else { c.beginPath(); starPath(c, 0, 0, r * 0.95, r * 0.42); c.fillStyle = '#ffd36b'; c.fill(); c.lineWidth = r * 0.14; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke(); }
  c.restore();
}
// la cara del jefe de RRHH: la cabeza robot de SurvivalBot (la sede de Microblizz), con el sobre de despido en el ojo
function crCaraJefe(c, r) {
  c.save(); c.beginPath(); c.arc(0, 0, r, 0, CR_TAU); c.fillStyle = '#ffd9e2'; c.fill(); c.lineWidth = r * 0.12; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.arc(0, 0, r * 0.92, 0, CR_TAU); c.clip();
  const sc = (r * 2.5) / 40; c.translate(0, r * 0.15); c.scale(sc, sc); c.translate(0, 118); c.lineJoin = 'round'; c.lineCap = 'round'; if (ART.e_base) ART.e_base(c);
  c.restore();
}
