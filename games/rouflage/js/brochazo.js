// Fans of Rouflage · EL BROCHAZO DE LA PINTURA RÁPIDA (idea de Daniel, 5-11-2026): al pulsar PINTURA RÁPIDA entra una brocha gigante cargada
// de pintura arcoíris y te pinta en dos pasadas, ida y vuelta (el «frus, fras» de su sonido, Daniel 6-11-2026), como quien pinta una pared deprisa: se inclina hacia donde va, las cerdas se doblan
// al arrastrar, salpica al cambiar de sentido y sale volando. La pintura mojada queda en franjas arcoíris recortadas a tu silueta, gotea y se
// escurre, y debajo aparece tu camuflaje nuevo. Solo lo ves tú, en tu taller (no delata a nadie). No frena: la piel ya está pintada desde
// el primer momento; esto solo se dibuja encima (pintaYoEnTaller, dibujo.js). Coordenadas: las de la galleta (pies en 0, 0; mide 48 x 60).
'use strict';

const BROCHAZO_DURA = 1.5;                       // segundos que dura todo
const BROCHAZO_ARCO = ['#ff4b5c', '#ff9a3d', '#ffd23d', '#7ee04a', '#39d5e8', '#4a7dff'];
// el camino de la brocha: entra, pasa de ida (arriba) y de vuelta (en diagonal hasta abajo) y sale; cada tramo con su parte del tiempo
// (0..1). Los tiempos van con el sonido (snd/brochazo.mp3): el «frus» suena de 0,06 a 0,36 s y el «fras» hasta 0,7 s.
const BROCHAZO_CAMINO = [
  { de: [-80, -96], a: [-34, -52], t: [0, 0.04] },       // entra
  { de: [-34, -52], a: [34, -38], t: [0.04, 0.24] },     // ida: frus (arriba)
  { de: [34, -38], a: [-34, -4], t: [0.24, 0.47] },      // vuelta: fras (en diagonal hasta los pies)
  { de: [-34, -4], a: [-96, -70], t: [0.47, 0.63] },     // sale volando por donde acaba la vuelta (sin volver a cruzarte)
];
const BROCHAZO_SALE = BROCHAZO_CAMINO[BROCHAZO_CAMINO.length - 1].t[0];      // cuándo deja de pintar y empieza a escurrir
const BROCHAZO_FIN = BROCHAZO_CAMINO[BROCHAZO_CAMINO.length - 1].t[1];       // cuándo se ha ido
const brochazoPintaTramo = tramo => tramo >= 1 && tramo < BROCHAZO_CAMINO.length - 1;      // las pasadas (ni la entrada ni la salida)
const BROCHAZO = { activo: false, inicio: null, ultima: null, gotas: [], lienzo: null, ang: 0, doblez: 0 };

function brochazoEmpieza() {
  if (!BROCHAZO.lienzo) { BROCHAZO.lienzo = document.createElement('canvas'); BROCHAZO.lienzo.width = 160; BROCHAZO.lienzo.height = 160; }
  BROCHAZO.lienzo.getContext('2d').clearRect(0, 0, 160, 160);
  Object.assign(BROCHAZO, { activo: true, inicio: null, ultima: null, gotas: [], ang: -0.6, doblez: 0 });
}

const brochazoSuave = x => x * x * (3 - 2 * x);
// dónde va la brocha en el momento f (0..1) y en qué tramo
function brochazoSitio(f) {
  const tr = BROCHAZO_CAMINO.find(p => f < p.t[1]) || BROCHAZO_CAMINO[BROCHAZO_CAMINO.length - 1];
  const u = brochazoSuave(Math.min(1, Math.max(0, (f - tr.t[0]) / (tr.t[1] - tr.t[0]))));
  const comba = Math.sin(u * Math.PI) * 6;      // las pasadas hacen un poco de arco, como un brazo
  return { x: tr.de[0] + (tr.a[0] - tr.de[0]) * u, y: tr.de[1] + (tr.a[1] - tr.de[1]) * u + comba, tramo: BROCHAZO_CAMINO.indexOf(tr), u };
}

function brochazoPinta(c, yo, t) {
  if (!BROCHAZO.activo) return;
  if (BROCHAZO.inicio === null) BROCHAZO.inicio = t;
  const f = (t - BROCHAZO.inicio) / BROCHAZO_DURA;
  if (f >= 1) { BROCHAZO.activo = false; return; }
  const p = brochazoSitio(Math.min(f, BROCHAZO_FIN));
  brochazoMueve(p, f);
  c.save(); c.translate(yo.x, yo.y);
  brochazoMojado(c, yo, Math.max(0, (f - BROCHAZO_SALE) / (1 - BROCHAZO_SALE)));
  brochazoGotas(c, t);
  if (f < BROCHAZO_FIN) brochazoBrocha(c, p.x, p.y);
  c.restore();
}

// al moverse: pinta en el lienzo de la pintura mojada (franjas arcoíris, como las cerdas), se inclina, dobla las cerdas y salpica al girar
function brochazoMueve(p, f) {
  const u = BROCHAZO.ultima; BROCHAZO.ultima = { x: p.x, y: p.y, tramo: p.tramo };
  if (!u) return;
  const dx = p.x - u.x, dy = p.y - u.y, v = Math.hypot(dx, dy);
  if (v > 0.01) {
    const objetivo = Math.atan2(dy, dx);
    BROCHAZO.ang += Math.atan2(Math.sin(objetivo - BROCHAZO.ang), Math.cos(objetivo - BROCHAZO.ang)) * 0.35;      // gira con suavidad hacia donde va
  }
  BROCHAZO.doblez += (Math.min(1, v / 7) - BROCHAZO.doblez) * 0.4;
  if (brochazoPintaTramo(p.tramo) && u.tramo >= 1) brochazoRaya(u, p);
  if (u.tramo !== p.tramo && f < BROCHAZO_FIN) brochazoSalpica(u.x, u.y, 9);      // al cambiar de sentido, salpica
  else if (v > 3 && Math.random() < 0.35) brochazoSalpica(p.x, p.y, 1);
}
// una raya de pintura entre dos puntos: seis franjas paralelas, una por color, con el borde que tiembla; tan ancha como las cerdas (48 px),
// para que con dos pasadas quede pintada toda la galleta
function brochazoRaya(a, b) {
  const g = BROCHAZO.lienzo.getContext('2d'), n = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
  g.save(); g.translate(80, 130); g.lineCap = 'round';
  BROCHAZO_ARCO.forEach((col, i) => {
    const o = (i - 2.5) * 8 + Math.sin((a.x + i) * 0.7) * 0.8, ox = Math.cos(n) * o, oy = Math.sin(n) * o;
    g.strokeStyle = col; g.lineWidth = 9;
    g.beginPath(); g.moveTo(a.x + ox, a.y + oy); g.lineTo(b.x + ox, b.y + oy); g.stroke();
  });
  g.restore();
}

// la pintura mojada, recortada a tu silueta; al final se escurre de arriba abajo con goterones y deja ver el camuflaje
function brochazoMojado(c, yo, escurre) {
  c.save(); c.beginPath(); trazaAlubia(c, null, yo.postura); c.clip();
  const e = brochazoSuave(escurre), baja = e * 70;
  c.globalAlpha = 1 - e * 0.95;
  c.drawImage(BROCHAZO.lienzo, -80, -130 + baja * 0.35);
  if (escurre > 0) {
    for (let i = 0; i < 7; i++) {
      const gx = -21 + i * 7, largo = 6 + ((i * 37) % 11) + baja * (0.4 + ((i * 13) % 5) / 8), gy = -50 + baja * 0.6;
      c.fillStyle = BROCHAZO_ARCO[i % 6];
      c.beginPath(); c.moveTo(gx - 2.4, gy); c.lineTo(gx + 2.4, gy); c.lineTo(gx + 2.4, gy + largo); c.arc(gx, gy + largo, 2.4, 0, Math.PI); c.closePath(); c.fill();
    }
  }
  c.restore();
}

// salpicaduras: gotas que salen despedidas, caen con peso y se desvanecen
function brochazoSalpica(x, y, n) {
  for (let i = 0; i < n && BROCHAZO.gotas.length < 60; i++) {
    const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 90;
    BROCHAZO.gotas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, r: 1.4 + Math.random() * 2.6, col: BROCHAZO_ARCO[(Math.random() * 6) | 0], t0: null });
  }
}
function brochazoGotas(c, t) {
  for (const g of BROCHAZO.gotas) {
    if (g.t0 === null) g.t0 = t;
    const d = t - g.t0, vida = Math.max(0, 1 - d / 0.7); if (!vida) continue;
    const vy = g.vy + 260 * d, ang = Math.atan2(vy, g.vx), estira = 1 + Math.min(1.5, Math.hypot(g.vx, vy) / 120);
    c.save(); c.globalAlpha = vida; c.fillStyle = g.col;
    c.translate(g.x + g.vx * d, g.y + g.vy * d + 130 * d * d); c.rotate(ang);
    c.beginPath(); c.ellipse(0, 0, g.r * estira, g.r / Math.sqrt(estira), 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
}

// la brocha gigante: mango de madera, virola de metal y cerdas arcoíris empapadas, inclinada hacia donde va y con las cerdas dobladas por el
// arrastre (se curvan hacia atrás cuanto más deprisa va)
function brochazoBrocha(c, x, y) {
  const d = BROCHAZO.doblez * 9;
  c.save(); c.translate(x, y); c.rotate(BROCHAZO.ang + Math.PI / 2 + 0.5);
  c.lineWidth = 1.6; c.strokeStyle = '#0b0f1c'; c.lineJoin = 'round';
  c.fillStyle = 'rgba(11,15,28,.18)'; c.beginPath(); c.ellipse(4, 6, 24, 7, 0, 0, Math.PI * 2); c.fill();      // su sombra
  // cerdas: abajo, con la punta deshilachada y doblada hacia atrás
  c.save();
  c.beginPath(); c.moveTo(-25, -14); c.lineTo(25, -14);
  c.quadraticCurveTo(26 + d * 0.3, -2, 26 + d, 6);
  for (let i = 0; i <= 10; i++) c.lineTo(26 + d - i * 5.2, 6 + (i % 2 ? 5 : 0) + Math.sin(i * 1.7) * 1.2);
  c.quadraticCurveTo(-26 + d * 0.3, -2, -25, -14); c.closePath();
  c.save(); c.clip();
  BROCHAZO_ARCO.forEach((col, i) => { c.fillStyle = col; c.fillRect(-27 + i * 9.4 + d * 0.5, -16, 9.6, 34); });
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 9; i++) c.fillRect(-22 + i * 5.6 + d * 0.6, -12, 1.2, 16);
  c.restore();
  c.stroke(); c.restore();
  // virola y mango
  c.fillStyle = '#dfe6ef'; c.beginPath(); c.roundRect(-27, -26, 54, 13, 3); c.fill(); c.stroke();
  c.strokeStyle = '#8d97a8'; c.beginPath(); c.moveTo(-25, -20); c.lineTo(25, -20); c.stroke(); c.strokeStyle = '#0b0f1c';
  c.fillStyle = '#c98b4a'; c.beginPath(); c.moveTo(-6, -26); c.lineTo(-4.5, -64); c.quadraticCurveTo(0, -70, 4.5, -64); c.lineTo(6, -26); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-3, -60, 2, 30);
  c.restore();
}
