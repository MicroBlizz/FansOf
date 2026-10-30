// Fans of Rouflage · ARMARIO (dibujo, 1 de 2): la galleta vestida y lo que se le pone en el cuerpo, dibujado con las mismas ayudas y
// colores que los personajes del Rumble (core/js/serie/arte/base.js: shape, el, rr, poly, line, dot…; aquí copiadas dentro de ARD para
// no chocar con las de util.js). Medidas de la galleta en «Firmes»: pies en 0,0; cabeza con el centro en 0,-41.5 y radio 11.5 (CABEZA).
// Cada pieza tiene `detras(c)` (bajo el cuerpo) o `delante(c)` (sobre él); los ojos y bocas dibujan sobre la cara (x,y = centro de los ojos).
'use strict';
// los móviles con navegador viejo no tienen roundRect (da «c.roundRect is not a function» al dibujar el armario y los iconos): la hacemos con arcos
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    const q = Math.max(0, Math.min(Array.isArray(r) ? +r[0] || 0 : +r || 0, Math.abs(w) / 2, Math.abs(h) / 2));
    this.moveTo(x + q, y); this.arcTo(x + w, y, x + w, y + h, q); this.arcTo(x + w, y + h, x, y + h, q); this.arcTo(x, y + h, x, y, q); this.arcTo(x, y, x + w, y, q); this.closePath();
  };
}
const ARD = (() => {
  const OL = '#20102c', T = Math.PI * 2;
  function shape(c, build, fill, lw = 2.2) { c.beginPath(); build(c); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke(); } }
  const el = (x, y, rx, ry, rot = 0) => c => c.ellipse(x, y, rx, ry, rot, 0, T);
  const rr = (x, y, w, h, r) => c => c.roundRect(x, y, w, h, r);
  const poly = (...p) => c => { c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); };
  function line(c, p, color, lw) { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round'; c.stroke(); }
  function dot(c, x, y, r, color) { c.beginPath(); c.arc(x, y, r, 0, T); c.fillStyle = color; c.fill(); }
  function starPath(c, x, y, r1, r2, n = 5) { c.moveTo(x, y - r1); for (let i = 1; i < n * 2; i++) { const a = -Math.PI / 2 + (i * Math.PI) / n; const r = i % 2 ? r2 : r1; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); }
  function otxt(c, t, x, y, size, color, max) { c.font = size + 'px "Luckiest Guy", "Arial Black", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = Math.max(2, size * 0.32); c.strokeStyle = OL; c.strokeText(t, x, y, max); c.fillStyle = color; c.fillText(t, x, y, max); }

  /* ---------- la galleta (misma silueta que alubia.js) ---------- */
  function capsula(c, x, y, largo, ang, r) { const x2 = x + Math.cos(ang) * largo, y2 = y + Math.sin(ang) * largo; c.moveTo(x2 + Math.cos(ang - Math.PI / 2) * r, y2 + Math.sin(ang - Math.PI / 2) * r); c.arc(x2, y2, r, ang - Math.PI / 2, ang + Math.PI / 2); c.arc(x, y, r, ang + Math.PI / 2, ang + Math.PI * 1.5); c.closePath(); }
  function traza(c) {
    capsula(c, -6, -12, 8, Math.PI / 2 + 0.02, 5.2); capsula(c, 6, -12, 8, Math.PI / 2 - 0.02, 5.2);
    capsula(c, -10, -27, 9, Math.PI / 2 + 0.12, 4.3); capsula(c, 10, -28, 9, Math.PI / 2 - 0.12, 4.3);
    c.moveTo(-9, -32); c.bezierCurveTo(-3, -34, 3, -34, 9, -32); c.bezierCurveTo(13, -24, 14, -15, 12.5, -10); c.bezierCurveTo(10, -6, -10, -6, -12.5, -10); c.bezierCurveTo(-14, -15, -13, -24, -9, -32); c.closePath();
    c.moveTo(11.5, -41.5); c.arc(0, -41.5, 11.5, 0, T); c.closePath();
  }
  const CX = 2, CY = -41.5;   // el centro de los ojos (pintaCara de alubia.js)
  // la cara de la campaña: ojos con brillo, coloretes y sonrisa. ojos/boca: funciones de las piezas puestas (o nada = la de siempre)
  function cara(c, ojos, boca, x = CX, y = CY) {
    if (ojos) ojos(c, x, y); else for (const s of [-1, 1]) { shape(c, el(x + s * 4.4, y - 0.5, 1.9, 2.5), OL, 0); dot(c, x + s * 4.4 + 0.7, y - 1.5, 0.7, '#fff'); }
    for (const s of [-1, 1]) shape(c, el(x + s * 7.2, y + 3.4, 2, 1.2), 'rgba(255,120,150,0.45)', 0);
    if (boca) boca(c, x, y); else { c.beginPath(); c.arc(x, y + 2.6, 2.5, 0.25, Math.PI - 0.25); c.lineWidth = 1.3; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke(); }
  }
  // o = { papel (id), espalda, cabeza (piezas), ojos, boca (funciones), sinCara, esc }
  function vestida(c, w, h, o = {}) {
    const e = o.esc || h / 78; c.save(); c.translate(w / 2 - (o.mascota ? 9 * e : 0), h * 0.95); c.scale(e, e);
    if (o.espalda && ESPALDAS[o.espalda]) ESPALDAS[o.espalda](c);
    shape(c, el(0, 1, 15, 3.6), 'rgba(20,10,40,.3)', 0);
    c.beginPath(); traza(c); c.lineWidth = 6; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke();
    shape(c, traza, COLOR_PAPEL[o.papel] || COLOR_PAPEL.blanco, 0);
    if (PAPEL[o.papel]) { c.save(); c.beginPath(); traza(c); c.clip(); PAPEL[o.papel](c); c.restore(); }
    if (!o.sinCara) cara(c, o.ojos, o.boca);
    if (o.cabeza && CABEZAS[o.cabeza]) CABEZAS[o.cabeza](c);
    if (o.mascota && ARD.MASCOTAS && ARD.MASCOTAS[o.mascota]) { c.save(); c.translate(27, 0); c.scale(1.05, 1.05); ARD.MASCOTAS[o.mascota](c, { t: 0.6, mov: 0, susto: false }); c.restore(); }      // su mascota, a un lado (armario-mascotas.js)
    c.restore();
  }
  /* ---------- iconos (gotas, acciones, candado, nada) ---------- */
  const ICONOS = {
    gotas(c, w) { const r = w * .36; shape(c, g => { g.arc(w / 2, w / 2, r, .5, T - .1); g.arc(w * .82, w * .38, r * .32, -1.1, 2.2, true); g.closePath(); }, '#d9a25b', w * .09); for (const [x, y] of [[.4, .45], [.55, .62], [.36, .66]]) dot(c, w * x, w * y, w * .05, '#6b3c1c'); },
    acciones(c, w) { shape(c, rr(w * .22, w * .32, w * .56, w * .56, w * .12), '#ff6fb5', w * .09); shape(c, rr(w * .28, w * .16, w * .44, w * .18, w * .05), '#ffcb3d', w * .09); for (const [x, y, r] of [[.4, .52, .06], [.6, .66, .05], [.45, .74, .04], [.62, .46, .04]]) dot(c, w * x, w * y, w * r, '#fff'); },
    candado(c, w) { c.beginPath(); c.arc(w / 2, w * .42, w * .22, Math.PI, 0); c.lineWidth = w * .13; c.strokeStyle = OL; c.stroke(); c.lineWidth = w * .07; c.strokeStyle = '#cdb9ea'; c.stroke(); shape(c, rr(w * .2, w * .42, w * .6, w * .46, w * .08), '#ffcb3d', w * .1); },
    xp(c, w) { shape(c, g => starPath(g, w / 2, w / 2, w * .44, w * .2), '#39d5e8', w * .08); },
    nada(c, w) { c.lineWidth = w * .08; c.strokeStyle = 'rgba(205,185,234,.7)'; c.lineCap = 'round'; c.beginPath(); c.arc(w / 2, w / 2, w * .3, 0, T); c.moveTo(w * .29, w * .71); c.lineTo(w * .71, w * .29); c.stroke(); },
  };
  /* ---------- ojos y bocas (sobre la cara; x,y = centro de los ojos) ---------- */
  const ojoNormal = (c, x, y, s) => { shape(c, el(x + s * 4.4, y - 0.5, 1.9, 2.5), OL, 0); dot(c, x + s * 4.4 + 0.7, y - 1.5, 0.7, '#fff'); };
  const OJOS = {
    campana: null,
    espiral(c, x, y) { c.beginPath(); for (let q = 0; q < 3.4 * Math.PI; q += 0.3) { const r = 0.24 * q; c.lineTo(x - 4.4 + Math.cos(q) * r, y - 0.5 + Math.sin(q) * r); } c.strokeStyle = '#8a2bff'; c.lineWidth = 1.3; c.stroke(); ojoNormal(c, x, y, 1); },
    grandes(c, x, y) { for (const s of [-1, 1]) { shape(c, el(x + s * 4.6, y - 0.6, 3.2, 3.6), '#fff', 1.4); dot(c, x + s * 4.2, y, 1.6, OL); dot(c, x + s * 4.6, y - 0.8, 0.6, '#fff'); } },
    dormido(c, x, y) { for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 4.4, y - 1.2, 2.3, 0.2, Math.PI - 0.2); c.lineWidth = 1.4; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke(); } },
    guino(c, x, y) { line(c, [x - 6.4, y - 0.5, x - 2.4, y - 0.5], OL, 1.4); ojoNormal(c, x, y, 1); },
    bizco(c, x, y) { for (const s of [-1, 1]) { shape(c, el(x + s * 4.6, y - 0.6, 2.8, 3), '#fff', 1.2); dot(c, x + s * 2.6, y - 0.2, 1.3, OL); } },
    gafas(c, x, y) { for (const s of [-1, 1]) { shape(c, el(x + s * 4.4, y - 0.5, 3.4, 3.4), 'rgba(57,213,232,.45)', 1.5); dot(c, x + s * 4.4, y - 0.3, 1.5, OL); } line(c, [x - 1, y - 0.5, x + 1, y - 0.5], OL, 1.5); },
    sol(c, x, y) { for (const s of [-1, 1]) shape(c, rr(x + s * 4.4 - 3.6, y - 2.6, 7.2, 4.4, 1.6), '#20102c', 1.2); line(c, [x - 0.8, y - 1, x + 0.8, y - 1], OL, 1.4); dot(c, x - 6, y - 1.8, 0.7, 'rgba(255,255,255,.7)'); },
    foxgafas(c, x, y) {   // las gafas moradas de SlyFox (ART.fox), con sus ojos
      shape(c, rr(x - 12.6, y - 3.8, 25.2, 6.6, 3.2), '#7b2cbf', 1.8); shape(c, el(x - 5, y - 0.5, 3, 1.7), '#fff', 0); shape(c, el(x + 5, y - 0.5, 3, 1.7), '#fff', 0); dot(c, x - 4, y - 0.3, 1.2, OL); dot(c, x + 6, y - 0.3, 1.2, OL);
      line(c, [x - 8, y - 1.7, x - 2, y - 1.9], OL, 1.3); line(c, [x + 2, y - 1.9, x + 8, y - 1.7], OL, 1.3);
      shape(c, poly(x + 10, y - 1.8, x + 18.5, y - 5.8, x + 17, y - 0.1), '#6a22a8', 1.4); shape(c, poly(x + 10, y + 0.1, x + 18, y + 2.7, x + 14.8, y + 4.9), '#6a22a8', 1.4);
    },
    estrellas(c, x, y) { for (const s of [-1, 1]) shape(c, g => starPath(g, x + s * 4.4, y - 0.5, 3, 1.3), '#ffcb3d', 1); },
    corazones(c, x, y) { for (const s of [-1, 1]) { const hx = x + s * 4.4, hy = y - 0.5; shape(c, g => { g.moveTo(hx, hy + 2.6); g.bezierCurveTo(hx - 4, hy - 0.4, hx - 2, hy - 3.6, hx, hy - 1.4); g.bezierCurveTo(hx + 2, hy - 3.6, hx + 4, hy - 0.4, hx, hy + 2.6); }, '#ff4b5c', 1); } },
    monoculo(c, x, y) { ojoNormal(c, x, y, -1); shape(c, el(x + 4.4, y - 0.5, 3.6, 3.6), 'rgba(255,255,255,.25)', 1.4); c.beginPath(); c.arc(x + 4.4, y - 0.5, 3.6, 0, T); c.lineWidth = 1; c.strokeStyle = '#ffcb3d'; c.stroke(); dot(c, x + 4.4, y - 0.3, 1.5, OL); line(c, [x + 6.8, y + 2, x + 8.6, y + 9], '#ffcb3d', 1); },
    laser(c, x, y) { for (const s of [-1, 1]) { shape(c, el(x + s * 4.4, y - 0.5, 2.2, 2.6), '#ff4b5c', 1.2); dot(c, x + s * 4.4, y - 0.5, 1, '#fff'); } c.save(); c.globalAlpha = 0.6; line(c, [x - 4.4, y - 0.5, x - 14, y - 10], '#ff4b5c', 1.6); line(c, [x + 4.4, y - 0.5, x + 14, y - 10], '#ff4b5c', 1.6); c.restore(); },
    necro(c, x, y) { for (const s of [-1, 1]) { shape(c, el(x + s * 4.4, y - 0.5, 2.6, 2.8), '#1a1022', 0); dot(c, x + s * 4.4, y - 0.5, 1.25, '#5ef2d0'); } },
    visor(c, x, y) { shape(c, rr(x - 2.5, y - 2.4, 12.4, 4.2, 1.9), '#22e3ff', 1.2); line(c, [x - 1, y - 1, x + 8, y - 1], '#fff', 0.8); shape(c, g => { g.moveTo(x - 11, y - 2); g.quadraticCurveTo(x - 19, y - 5, x - 22, y + 1); g.quadraticCurveTo(x - 17, y - 0.6, x - 11, y + 1.6); g.closePath(); }, '#ff3df0', 1.2); },
  };
  const BOCAS = {
    sonrisa: null,
    o(c, x, y) { shape(c, el(x, y + 3.6, 1.4, 1.8), OL, 0); },
    lengua(c, x, y) { c.beginPath(); c.arc(x, y + 2.6, 2.5, 0.25, Math.PI - 0.25); c.lineWidth = 1.3; c.strokeStyle = OL; c.stroke(); shape(c, el(x + 1, y + 5, 1.3, 1.5), '#ff6f8f', 0.8); },
    conejo(c, x, y) { c.beginPath(); c.arc(x, y + 2.6, 2.5, 0.25, Math.PI - 0.25); c.lineWidth = 1.3; c.strokeStyle = OL; c.stroke(); shape(c, rr(x - 2.2, y + 4.3, 1.6, 2, 0.5), '#fff', 0.8); shape(c, rr(x - 0.3, y + 4.3, 1.6, 2, 0.5), '#fff', 0.8); },
    ardilla(c, x, y) { shape(c, el(x, y + 2.2, 1.6, 1.1), '#3a1a12', 0); shape(c, rr(x - 1.9, y + 3.6, 3.8, 3.2, 0.9), '#fff', 1); line(c, [x, y + 3.6, x, y + 6.6], OL, 0.8); },
    bigote(c, x, y) { shape(c, g => { g.moveTo(x - 7, y + 4); g.quadraticCurveTo(x - 4, y + 0.5, x, y + 3); g.quadraticCurveTo(x + 4, y + 0.5, x + 7, y + 4); g.quadraticCurveTo(x + 3, y + 5.5, x, y + 4.2); g.quadraticCurveTo(x - 3, y + 5.5, x - 7, y + 4); }, '#3a1a12', 1); },
    sorpresa(c, x, y) { shape(c, el(x, y + 4, 2, 2.6), OL, 0); shape(c, el(x, y + 4.6, 1.2, 1.2), '#ff6f8f', 0); },
    vampiro(c, x, y) { c.beginPath(); c.arc(x, y + 2.6, 2.5, 0.25, Math.PI - 0.25); c.lineWidth = 1.3; c.strokeStyle = OL; c.stroke(); for (const s of [-1, 1]) shape(c, poly(x + s * 2.6, y + 3.2, x + s * 1.9, y + 6.2, x + s * 1.1, y + 3.4), '#fff', 0.7); },
    barba(c, x, y) { shape(c, g => { g.moveTo(x - 7.5, y + 1); g.quadraticCurveTo(x - 9, y + 12, x, y + 14); g.quadraticCurveTo(x + 9, y + 12, x + 7.5, y + 1); g.quadraticCurveTo(x, y + 6, x - 7.5, y + 1); }, '#d9a25b', 1.6); shape(c, el(x, y + 3.6, 1.6, 1.1), '#3a1a12', 0); },
    bufanda(c, x, y) { shape(c, rr(x - 10, y + 3, 20, 6.5, 3), '#ff4b5c', 1.6); for (let k = -8; k < 10; k += 4) line(c, [x + k, y + 4, x + k - 1.5, y + 8.5], '#c22a3a', 1); shape(c, rr(x + 4, y + 8, 5, 9, 2), '#ff4b5c', 1.4); },
    silbando(c, x, y) { shape(c, el(x + 1.6, y + 3.8, 1.3, 1.6), OL, 0); shape(c, el(x + 9, y + 1, 1.7, 1.2, -0.5), '#ffcb3d', 1); line(c, [x + 10.4, y + 0.6, x + 10.4, y - 4.8], OL, 1.4); line(c, [x + 10.4, y - 4.8, x + 13, y - 3.8], OL, 1.4); },
    dienton(c, x, y) { c.beginPath(); c.arc(x, y + 2.6, 2.5, 0.25, Math.PI - 0.25); c.lineWidth = 1.3; c.strokeStyle = OL; c.stroke(); shape(c, rr(x - 1.2, y + 4.2, 2.4, 2.6, 0.5), '#fff', 0.8); },
    colmillos(c, x, y) { shape(c, g => { g.moveTo(x - 5, y + 2.5); g.quadraticCurveTo(x, y + 6.5, x + 5.5, y + 1.7); g.quadraticCurveTo(x, y + 4.4, x - 5, y + 2.5); }, '#5a1530', 1.1); c.fillStyle = '#fff'; c.fillRect(x - 1.8, y + 2.9, 1.6, 1.4); c.fillRect(x + 1.2, y + 2.7, 1.6, 1.4); },
  };
  /* ---------- papeles ---------- */
  const COLOR_PAPEL = { blanco: '#f4f1fa', kraft: '#c99a62', cuadricula: '#ffffff', rayas: '#fffdf4', periodico: '#e8e2d2', purpurina: '#d9a6ff', carton: '#b98a4f', regalo: '#58b8ff', mapa: '#efe0b4', partitura: '#fbf6ea', arcoiris: '#ff4b5c', celofan: '#8fe3ff', tornasol: '#bfeefa', negro: '#1f2937', oro: '#facc15', morado: '#6b4a9a', verde: '#22c55e' };
  const PAPEL = {
    cuadricula: c => { c.strokeStyle = 'rgba(70,120,200,.4)'; c.lineWidth = .6; for (let k = -70; k < 20; k += 4) line(c, [-30, k, 30, k], 'rgba(70,120,200,.4)', .6); for (let k = -30; k < 30; k += 4) line(c, [k, -70, k, 10], 'rgba(70,120,200,.4)', .6); },
    rayas: c => { for (let k = -70; k < 20; k += 5) line(c, [-30, k, 30, k], 'rgba(70,120,200,.45)', .7); line(c, [-8, -70, -8, 10], 'rgba(255,75,92,.6)', .7); },
    periodico: c => { c.fillStyle = 'rgba(40,30,50,.35)'; for (let k = -62; k < 0; k += 3) for (let x = -14; x < 14; x += 9) if ((k + x * 7) % 5) c.fillRect(x, k, 7, 1.2); c.fillStyle = 'rgba(40,30,50,.6)'; c.fillRect(-12, -30, 24, 4); },
    purpurina: c => { for (let k = 0; k < 90; k++) { const x = Math.sin(k * 12.9898) * 15, y = -60 + ((k * 7.31) % 62); c.fillStyle = ['#fff', '#ffcb3d', '#ff6fb5', '#39d5e8'][k % 4]; c.fillRect(x, y, 1.1, 1.1); } },
    carton: c => { for (let k = -70; k < 20; k += 3) { c.beginPath(); c.moveTo(-30, k); c.quadraticCurveTo(0, k + 1.5, 30, k); c.strokeStyle = 'rgba(90,60,20,.35)'; c.lineWidth = 1.2; c.stroke(); } },
    regalo: c => { c.fillStyle = '#ff4b5c'; c.fillRect(-2.5, -70, 5, 80); c.fillRect(-30, -24, 60, 5); for (let k = 0; k < 30; k++) dot(c, Math.sin(k * 3.1) * 12, -55 + (k * 2.1) % 50, .9, '#ffcb3d'); },
    mapa: c => { c.beginPath(); c.moveTo(-12, -50); c.bezierCurveTo(0, -46, 4, -30, 10, -20); c.strokeStyle = 'rgba(40,110,80,.5)'; c.lineWidth = 1; c.stroke(); c.setLineDash([1.5, 1.5]); c.beginPath(); c.moveTo(-8, -15); c.quadraticCurveTo(6, -28, 2, -45); c.strokeStyle = 'rgba(255,75,92,.8)'; c.stroke(); c.setLineDash([]); line(c, [-2, -30, 2, -26], 'rgba(255,75,92,.9)', 1.4); line(c, [2, -30, -2, -26], 'rgba(255,75,92,.9)', 1.4); },
    partitura: c => { for (let g = -58; g < 0; g += 14) for (let k = 0; k < 5; k++) line(c, [-30, g + k * 1.6, 30, g + k * 1.6], 'rgba(40,30,50,.45)', .5); for (let k = 0; k < 8; k++) shape(c, el(-12 + k * 3.5, -55 + (k % 3) * 1.6 + Math.floor(k / 3) * 14, 1, .8, -.4), 'rgba(40,30,50,.7)', 0); },
    // el papel arcoíris: franjas de todos los colores de arriba abajo, con un brillo
    arcoiris: c => { ['#ff4b5c', '#ff7a1a', '#ffcb3d', '#7ee04a', '#39d5e8', '#3a7de0', '#b45cff'].forEach((col, k) => { c.fillStyle = col; c.fillRect(-30, -62 + k * 10.2, 60, 10.6); }); for (let k = 0; k < 7; k++) { c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(-30, -59 + k * 10.2, 60, 1.2); } },
    // el papel tornasol: plástico de envolver arrugado, transparente y tornasolado (arrugas brillantes en zigzag y destellos)
    tornasol: c => {
      const g = c.createLinearGradient(-30, -70, 30, 10); g.addColorStop(0, 'rgba(255,170,220,.35)'); g.addColorStop(0.35, 'rgba(255,255,255,0)'); g.addColorStop(0.6, 'rgba(170,255,200,.3)'); g.addColorStop(1, 'rgba(255,230,140,.35)');
      c.fillStyle = g; c.fillRect(-30, -70, 60, 80);
      const arrugas = [[-16, -62, 10], [-4, -50, -12], [8, -66, 8], [-20, -36, 14], [4, -28, -10], [14, -44, 9], [-10, -14, 12], [10, -8, -9]];
      for (const [x, y, d] of arrugas) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + d * 0.5, y + 4); c.lineTo(x + d * 0.2, y + 8); c.lineTo(x + d, y + 12); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.1; c.stroke(); c.strokeStyle = 'rgba(40,120,150,.25)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(x + 1, y + 1); c.lineTo(x + d * 0.5 + 1, y + 5); c.stroke(); }
      for (const [x, y] of [[-12, -56], [12, -30], [-6, -22], [16, -60]]) { line(c, [x - 2.5, y, x + 2.5, y], '#fff', 1); line(c, [x, y - 2.5, x, y + 2.5], '#fff', 1); }
    },
    // la cinta adhesiva: el papel azul claro con dos tiras de celo en diagonal
    celofan: c => { c.fillStyle = 'rgba(255,255,255,.35)'; shape(c, poly(-14, -60, -4, -60, -18, -10, -28, -10), 'rgba(255,255,255,.35)', 0); shape(c, poly(6, -60, 10, -60, -4, -10, -8, -10), 'rgba(255,255,255,.35)', 0); },
    oro: c => { line(c, [0, -32, 0, -12], '#ca8a04', 1.4); shape(c, g => starPath(g, 0, -22, 4.2, 1.9), '#fff7d6', 1); },
    negro: c => { line(c, [-9, -22, 9, -22], '#ff3df0', 1.6); line(c, [-1, -32, 4, -22], '#374151', 1.4); },
    morado: c => { shape(c, poly(-4, -32, 4, -32, 6, -8, -6, -8), '#2a1840', 1.2); shape(c, rr(-10, -22, 20, 3.6, 1.2), '#5c6d8a', 1.2); dot(c, 0, -20.2, 1.9, '#efeadf'); },
    verde: c => { shape(c, g => { g.moveTo(-14, -28); g.lineTo(14, -18); g.lineTo(14, -13); g.lineTo(-14, -23); g.closePath(); }, '#15803d', 0); shape(c, rr(-13, -12, 26, 4, 1.4), '#15803d', 1.3); c.fillStyle = '#fff'; c.font = '700 8px sans-serif'; c.textAlign = 'center'; c.fillText('1', 1, -22); },
  };
  /* ---------- en la cabeza (delante) ---------- */
  const CABEZAS = {
    orejas(c) { shape(c, el(-7, -57, 5, 13, -0.14), '#f7f3ff'); shape(c, el(-7, -56, 2.2, 9, -0.14), '#ffb3cf', 0); shape(c, el(6, -53, 4.8, 9, 0.22), '#f7f3ff'); shape(c, el(13.5, -60, 4.4, 8, 1.15), '#f7f3ff'); shape(c, el(13.5, -60, 1.9, 5.2, 1.15), '#ffb3cf', 0); },
    corona(c) { c.save(); c.translate(-1, -49); c.rotate(-0.16); shape(c, poly(-7, 2, -7, -5, -3.5, -1.5, 0, -7, 3.5, -1.5, 7, -5, 7, 2), '#ffcb3d', 2); dot(c, 0, -0.5, 1.3, '#ff4b5c'); c.restore(); },
    orejasFox(c) { shape(c, poly(-15, -42, -16, -60, -3, -49), '#e8702a'); shape(c, poly(15, -42, 16, -60, 3, -49), '#e8702a'); shape(c, poly(-15.4, -52, -16, -60, -10.5, -55.4), '#2b1622', 0); shape(c, poly(15.4, -52, 16, -60, 10.5, -55.4), '#2b1622', 0); },
    orejasArdilla(c) { shape(c, poly(-13, -44, -15, -57, -5, -49), '#b14d1c'); shape(c, poly(13, -44, 15, -57, 5, -49), '#b14d1c'); shape(c, poly(-12, -47, -13.4, -53, -8, -49), '#ff9bb0', 0); shape(c, poly(12, -47, 13.4, -53, 8, -49), '#ff9bb0', 0); },
    orejasCoon(c) { shape(c, poly(-12, -46, -11.5, -56, -5, -50), '#8d8f99', 1.8); shape(c, poly(12, -46, 11.5, -56, 5, -50), '#8d8f99', 1.8); shape(c, poly(-10.6, -48, -10.4, -53.4, -7.2, -50.4), '#ff9bb0', 0); shape(c, poly(10.6, -48, 10.4, -53.4, 7.2, -50.4), '#ff9bb0', 0); shape(c, g => { g.moveTo(-11, -44); g.quadraticCurveTo(-6, -48.5, 0, -44.6); g.quadraticCurveTo(6, -48.5, 11, -44); g.quadraticCurveTo(6, -39.6, 0, -42); g.quadraticCurveTo(-6, -39.6, -11, -44); g.closePath(); }, '#2b2d3a', 0); },
    orejasDog(c) { shape(c, poly(-12, -47, -13, -58, -5, -51), '#e8a04a', 1.8); shape(c, poly(12, -47, 13, -58, 5, -51), '#e8a04a', 1.8); shape(c, poly(-10.6, -49, -11.4, -54.8, -7.4, -50.6), '#fff7ea', 0); shape(c, poly(10.6, -49, 11.4, -54.8, 7.4, -50.6), '#fff7ea', 0); },
    cofia(c) { shape(c, rr(-5.6, -56.5, 11.2, 5, 1.4), '#ffffff', 1.4); c.fillStyle = '#ff4b5c'; c.fillRect(-0.8, -55.8, 1.6, 3.6); c.fillRect(-1.8, -54.8, 3.6, 1.6); },
    aureola(c) { c.beginPath(); c.ellipse(0, -60, 8, 2.4, 0, 0, T); c.lineWidth = 3.4; c.strokeStyle = OL; c.stroke(); c.lineWidth = 1.8; c.strokeStyle = '#ffcb3d'; c.stroke(); },
    cascoBeaver(c) { shape(c, g => { g.moveTo(-10.4, -47); g.quadraticCurveTo(-10.4, -57, 0, -57.4); g.quadraticCurveTo(10.4, -57, 10.4, -47); g.closePath(); }, '#ffcb3d', 1.8); line(c, [0, -56.6, 0, -48], '#f2a81f', 1.8); shape(c, rr(-12.6, -48.2, 25.2, 2.8, 1.2), '#f2a81f', 1.4); },
    gorra(c) { const x = 0, y = -41.5, r = 11.5; shape(c, g => { g.moveTo(x - r, y - 2); g.quadraticCurveTo(x - r, y - r - 2.5, x, y - r - 2.5); g.quadraticCurveTo(x + r, y - r - 2.5, x + r, y - 2); g.lineTo(x + r + 6, y - 1); g.lineTo(x - r, y - 1); g.closePath(); }, '#3a7de0', 2); },
    antena(c) { line(c, [-1, -51.5, -1, -58.5], OL, 4); line(c, [-1, -51.5, -1, -58.5], '#c3cbe0', 1.8); dot(c, -1, -59.5, 3.8, OL); dot(c, -1, -59.5, 2.3, '#7ee04a'); },
    cascoGamer(c) { c.beginPath(); c.arc(0, -42, 13, Math.PI * 1.05, Math.PI * 1.95); c.strokeStyle = OL; c.lineWidth = 4.6; c.stroke(); c.strokeStyle = '#22c55e'; c.lineWidth = 2.4; c.stroke(); shape(c, rr(-15.5, -47, 5.5, 10, 2), '#1f2937', 1.6); shape(c, rr(10, -47, 5.5, 10, 2), '#1f2937', 1.6); c.beginPath(); c.moveTo(12, -39); c.quadraticCurveTo(11, -33, 5, -33.6); c.strokeStyle = OL; c.lineWidth = 1.5; c.stroke(); dot(c, 5, -33.6, 1.4, '#22c55e'); },
    yelmo(c) { shape(c, g => { g.moveTo(-11.6, -43); g.quadraticCurveTo(-12, -58, 0, -58.2); g.quadraticCurveTo(12, -58, 11.6, -43); g.lineTo(9, -43); g.lineTo(9, -48.6); g.lineTo(-9, -48.6); g.lineTo(-9, -43); g.closePath(); }, '#facc15', 1.6); line(c, [-9, -52.6, 9, -52.6], '#ca8a04', 1.2); shape(c, g => { g.moveTo(-3, -57); g.quadraticCurveTo(-5, -68, 10, -69); g.quadraticCurveTo(3, -65, 5.6, -57.4); g.closePath(); }, '#ef4444', 1.5); },
    cuernosNecro(c) { shape(c, el(-11, -47, 7, 4.6, -0.2), '#5c6d8a'); shape(c, el(11, -47, 7, 4.6, 0.2), '#5c6d8a'); shape(c, poly(-14, -49.5, -20, -58, -10, -51.5), '#8d9cc0', 1.4); shape(c, poly(14, -49.5, 20, -58, 10, -51.5), '#8d9cc0', 1.4); },
    cuernos(c) { for (const s of [-1, 1]) shape(c, g => { g.moveTo(s * 5, -51); g.quadraticCurveTo(s * 12, -58, s * 9, -66); g.quadraticCurveTo(s * 9, -57, s * 1, -52); g.closePath(); }, '#ff4b5c', 1.8); },
    chistera(c) { shape(c, rr(-8, -68, 16, 14, 1), '#2b2240'); shape(c, el(0, -53.5, 13, 3), '#2b2240'); c.fillStyle = '#ff4b5c'; c.fillRect(-8, -58, 16, 3); },
    flor(c) { for (let k = 0; k < 5; k++) { const a = k / 5 * T; shape(c, el(7 + Math.cos(a) * 4, -54 + Math.sin(a) * 4, 3, 3), '#ff6fb5', 1.4); } shape(c, el(7, -54, 2.4, 2.4), '#ffcb3d', 1.4); },
    fiesta(c) { shape(c, poly(-6, -52, 2, -70, 8, -51), '#39d5e8', 1.8); dot(c, 2, -70, 2.4, OL); dot(c, 2, -70, 1.6, '#ff6fb5'); line(c, [-3, -58, 6, -60], '#fff', 1.2); },
    lazo(c) { for (const s of [-1, 1]) shape(c, poly(5, -52, 5 + s * 7, -57, 5 + s * 7, -47), '#ff4b5c', 1.6); dot(c, 5, -52, 2.6, OL); dot(c, 5, -52, 1.8, '#ff4b5c'); },
    hoja(c) { shape(c, g => { g.moveTo(0, -53); g.quadraticCurveTo(10, -64, 4, -70); g.quadraticCurveTo(-4, -62, 0, -53); g.closePath(); }, '#7ee04a', 1.8); line(c, [1, -55, 4, -66], '#3f9a2a', 1); },
    pulpo(c) { shape(c, g => { g.arc(0, -55, 8, Math.PI, 0); g.lineTo(8, -52); for (let k = 0; k < 4; k++) g.quadraticCurveTo(6 - k * 4, -48, 4 - k * 4, -52); g.closePath(); }, '#b45cff', 1.8); dot(c, -3, -56, 1.2, OL); dot(c, 3, -56, 1.2, OL); },
    medusa(c) { for (const [x, a] of [[-9, -0.5], [-4, -0.2], [2, 0.1], [7, 0.4], [10, 0.7]]) { c.save(); c.translate(x, -51); c.rotate(a); shape(c, g => { g.moveTo(-1.5, 0); g.quadraticCurveTo(-3, -6, 0, -10); g.quadraticCurveTo(3, -6, 1.5, 0); g.closePath(); }, '#4ade80', 1.3); dot(c, 0, -9, 0.8, '#ff4b5c'); c.restore(); } },
  };
  /* ---------- espalda (detrás) ---------- */
  const ESPALDAS = {};      // las piezas de la espalda: armario-espaldas.js (se rellena al cargarlo, justo después de este archivo)
  return { OL, T, shape, el, rr, poly, line, dot, starPath, otxt, traza, cara, vestida, ICONOS, OJOS, BOCAS, COLOR_PAPEL, PAPEL, CABEZAS, ESPALDAS };
})();
