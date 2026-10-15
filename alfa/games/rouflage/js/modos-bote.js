// Fans of Rouflage · LLENA EL BOTE (extra «bote», modos.js): por la oficina hay gotas de pintura tiradas por el suelo y, en la cafetería (donde salen
// los colados), un cubo vacío. Un colado que pasa por encima de una gota se la lleva (solo una, y mientras la lleva no puede congelarse: se ve de lejos)
// y la suelta en el cubo al acercarse. Con BOTE.meta gotas el cubo se llena y ganan los colados, aunque los becarios hayan despedido a casi todos.
// Los bots pasan del bote (de momento). En el PvP lo lleva el anfitrión: quién coge qué y cuántas van en el cubo viajan en su «a» (`bt`).
'use strict';

const BOTE = { meta: 5, gotas: [], n: 0, cubo: null, radio: 34, radioCubo: 46, lleno: false };
const COLORES_GOTA = ['#ff4b5c', '#2e8bff', '#ffcb3d', '#7ee04a', '#ff7a1a', '#39d5e8', '#c96bff'];

// al empezar la partida (en la caza): el cubo donde salen los colados y las gotas repartidas por salas distintas (del azar de la sala en el PvP)
function botePrepara() {
  BOTE.gotas = []; BOTE.n = 0; BOTE.lleno = false; BOTE.cubo = null;
  if (!extraOn('bote')) return;
  const azar = J.pvp ? rfpAzar(RFP.info.semilla + 31) : Math.random, p0 = SALIDA_CAMALEONES[0];
  BOTE.cubo = { x: p0[0] + 60, y: p0[1] + 10 };
  const salas = SALAS.filter(z => z !== salaEspera()), usadas = [], n = BOTE.meta + 2;
  for (let i = 0; i < n * 6 && BOTE.gotas.length < n; i++) {
    const sala = salas[Math.floor(azar() * salas.length)];
    const p = sitioLibre({ sala, lejosDe: usadas.concat([[BOTE.cubo.x, BOTE.cubo.y]]), min: 160, intentos: 30 }); if (!p) continue;
    usadas.push(p); BOTE.gotas.push({ id: BOTE.gotas.length, x: p[0], y: p[1], color: COLORES_GOTA[BOTE.gotas.length % COLORES_GOTA.length], quien: null, hecha: false });
  }
}
// cada fotograma (quien manda): coger, llevar y soltar
function boteAvanza(dt) {
  if (!extraOn('bote') || J.fase !== 'caza' || BOTE.lleno || !BOTE.cubo) return;
  if (J.pvp && !RFP.soyHost) return;
  for (const k of J.camaleones) {
    if (k.fuera || k.bot) continue;
    const llevo = BOTE.gotas.find(g => g.quien === k);
    if (!llevo) { if (!k.congelado) for (const g of BOTE.gotas) if (!g.quien && !g.hecha && lejos(g.x, g.y, k.x, k.y) < BOTE.radio) { boteCoge(g, k); break; } }
    else if (lejos(BOTE.cubo.x, BOTE.cubo.y, k.x, k.y) < BOTE.radioCubo) boteSuelta(llevo, k);
  }
}
function boteCoge(g, k) {
  g.quien = k; if (k.congelado) descongela(k);
  fxSalpica(k.x, k.y - 30, g.color, 8); play('pop');
  if (k.jugador) avisa(tr('Llevas una gota: al cubo de la cafetería (no puedes congelarte)'), 'aviso');
  refrescaHud(true);
}
function boteSuelta(g, k) {
  g.quien = null; g.hecha = true; BOTE.n++;
  fxSalpica(BOTE.cubo.x, BOTE.cubo.y - 20, g.color, 14); play('crown');
  avisa(tr('{a} ha echado una gota al cubo: {n} / {m}', { a: k.jugador ? tr('Tú') : k.nombre, n: BOTE.n, m: BOTE.meta }), J.yo && J.yo.clase === 'camaleon' ? 'bueno' : 'malo');
  if (BOTE.n >= BOTE.meta) { BOTE.lleno = true; cartel(tr('¡CUBO LLENO!'), tr('Los colados han terminado el trabajo'), true); }
  refrescaHud(true);
}
// ¿han ganado ya los colados? (lo mira la partida; en el PvP, rfpComprueba del anfitrión)
const boteLleno = () => extraOn('bote') && BOTE.lleno;
const boteLleva = k => extraOn('bote') && !!BOTE.gotas.find(g => g.quien === k);
// PvP: lo que manda el anfitrión en su «a» y lo que aplican los demás
function boteEstado() { return extraOn('bote') && BOTE.cubo ? [BOTE.n, BOTE.gotas.map(g => g.hecha ? -2 : g.quien ? g.quien.slot : -1)] : undefined; }
function boteRecibido(bt) {
  if (!bt || !extraOn('bote') || !BOTE.cubo) return;
  const [n, lista] = bt, antes = BOTE.n; BOTE.n = n;
  lista.forEach((v, i) => { const g = BOTE.gotas[i]; if (!g) return; const quien = v >= 0 ? RFP.slots[v] && RFP.slots[v].ente : null; const hecha = v === -2;
    if (g.quien !== quien && quien && quien.jugador) avisa(tr('Llevas una gota: al cubo de la cafetería (no puedes congelarte)'), 'aviso');
    g.quien = quien || null; g.hecha = hecha; });
  if (BOTE.n !== antes) { avisa(tr('Cubo: {n} / {m}', { n: BOTE.n, m: BOTE.meta }), J.yo && J.yo.clase === 'camaleon' ? 'bueno' : 'malo'); refrescaHud(true); }
  if (BOTE.n >= BOTE.meta && !BOTE.lleno) { BOTE.lleno = true; cartel(tr('¡CUBO LLENO!'), tr('Los colados han terminado el trabajo'), true); }
}

// ---------- dibujo: las gotas por el suelo, la que lleva cada uno y el cubo ----------
function botePinta(c, t) {
  if (!extraOn('bote') || !BOTE.cubo || J.fase === 'prep') return;
  const b = BOTE.cubo, lleno = BOTE.n / BOTE.meta;
  c.save(); c.translate(b.x, b.y);
  c.fillStyle = '#20102c'; c.beginPath(); c.ellipse(0, 2, 24, 8, 0, 0, TAU); c.fill();
  c.fillStyle = '#5a3b7e'; c.strokeStyle = '#20102c'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-20, -2); c.lineTo(-16, -38); c.lineTo(16, -38); c.lineTo(20, -2); c.closePath(); c.fill(); c.stroke();
  if (lleno > 0) { c.fillStyle = COLORES_GOTA[1]; c.beginPath(); c.moveTo(-19, -3); c.lineTo(-18 + lleno * 0, -3 - 34 * lleno); c.lineTo(18, -3 - 34 * lleno); c.lineTo(19, -3); c.closePath(); c.fill(); }
  c.fillStyle = '#3e2363'; c.beginPath(); c.ellipse(0, -38, 16, 5, 0, 0, TAU); c.fill(); c.stroke();
  rotulo(c, BOTE.n + ' / ' + BOTE.meta, 0, -52, 14, '#fff6ea', '#20102c', LETRA_GORDA);
  c.restore();
  for (const g of BOTE.gotas) {
    if (g.hecha) continue;
    const q = g.quien, x = q ? q.x : g.x, y = q ? q.y - 62 + Math.sin(t * 5) * 3 : g.y - 6 + Math.sin(t * 3 + g.id) * 2;
    c.save(); c.translate(x, y);
    if (!q) { c.fillStyle = 'rgba(32,16,44,0.35)'; c.beginPath(); c.ellipse(0, 8, 9, 3.5, 0, 0, TAU); c.fill(); }
    c.fillStyle = g.color; c.strokeStyle = '#20102c'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(0, -12); c.bezierCurveTo(7, -2, 8, 3, 8, 6); c.arc(0, 6, 8, 0, Math.PI); c.bezierCurveTo(-8, 3, -7, -2, 0, -12); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.arc(-3, 4, 2.2, 0, TAU); c.fill();
    c.restore();
  }
}
