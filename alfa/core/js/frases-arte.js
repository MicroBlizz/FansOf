// Fans Of · FRASES Y EMOTICONOS (2/2): los dibujos de los emoticonos. Cada uno es su personaje y un adorno hecho a mano,
// con el contorno grueso y los colores planos del resto del juego (nada de emojis del móvil).
// EMO_FX[id] = { tras(c, t), delante(c, t) }: se dibujan en un lienzo de 100 x 100 (el personaje tiene los pies en y = 97 y el centro en x = 44).
// t: segundos desde que sale (0 en los menús); los que tienen anim: true en sus datos se mueven en la partida.
'use strict';
const EMO_OL = 2.6;
function emoGota(c, x, y, s, col = '#7fd3ff') { shape(c, k => { k.moveTo(x, y - s * 1.5); k.bezierCurveTo(x + s, y - s * 0.3, x + s, y + s, x, y + s); k.bezierCurveTo(x - s, y + s, x - s, y - s * 0.3, x, y - s * 1.5); }, col, EMO_OL * 0.8); dot(c, x - s * 0.3, y, s * 0.28, 'rgba(255,255,255,.75)'); }
function emoChispa(c, x, y, s, col = '#fff6c8') { shape(c, k => { k.moveTo(x, y - s); k.quadraticCurveTo(x, y, x + s, y); k.quadraticCurveTo(x, y, x, y + s); k.quadraticCurveTo(x, y, x - s, y); k.quadraticCurveTo(x, y, x, y - s); }, col, EMO_OL * 0.7); }
function emoTexto(c, t, x, y, size, col, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); otxt(c, t, 0, 0, size, col); c.restore(); }
function emoBillete(c, x, y, rot) {
  c.save(); c.translate(x, y); c.rotate(rot);
  shape(c, rr(-11, -6, 22, 12, 2.5), '#7be04a', EMO_OL * 0.8); shape(c, rr(-7.5, -3.5, 15, 7, 1.5), '#4fae2f', 0);
  otxt(c, '$', 0, 0.6, 8, '#d6ffc2'); c.restore();
}
const EMO_FX = {
  risa: { delante(c) { emoTexto(c, 'JA', 80, 20, 22, '#ffe14d', -0.22); emoTexto(c, 'JA', 88, 44, 15, '#ffcb3d', 0.15); emoGota(c, 16, 30, 4); emoGota(c, 71, 62, 3.4); } },
  llanto: {
    tras(c) { shape(c, el(44, 95, 38, 6), '#7fd3ff', EMO_OL * 0.8); dot(c, 30, 94, 3, 'rgba(255,255,255,.6)'); },
    delante(c) { emoGota(c, 14, 36, 5); emoGota(c, 78, 32, 5.5); emoGota(c, 9, 62, 3.6); emoGota(c, 86, 58, 3.8); emoTexto(c, 'BUAA', 74, 11, 13, '#bfe6ff', 0.1); },
  },
  guino: { delante(c) { shape(c, k => heartPath(k, 80, 20, 11), '#ff5fa8', EMO_OL); dot(c, 75, 14, 2.6, 'rgba(255,255,255,.7)'); emoChispa(c, 64, 8, 5); emoChispa(c, 93, 40, 4.5); } },
  rezo: {
    tras(c) { c.save(); c.globalAlpha = 0.5; for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.32; shape(c, poly(44, 40, 44 + Math.cos(a - 0.08) * 70, 40 + Math.sin(a - 0.08) * 70, 44 + Math.cos(a + 0.08) * 70, 40 + Math.sin(a + 0.08) * 70), '#fff1a8', 0); } c.restore(); },
    delante(c) { c.beginPath(); c.ellipse(44, 7, 17, 4.6, 0, 0, Math.PI * 2); c.lineWidth = 7.5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3.8; c.strokeStyle = '#ffcb3d'; c.stroke(); emoChispa(c, 14, 18, 4.5); emoChispa(c, 80, 26, 5); },
  },
  boom: {
    tras(c) { shape(c, k => starPath(k, 46, 52, 48, 32, 11), '#ff7a1a', EMO_OL); shape(c, k => starPath(k, 46, 52, 32, 21, 11), '#ffd23d', 0); },
    delante(c) { emoTexto(c, '¡BUM!', 74, 14, 19, '#ff5a4f', -0.15); },
  },
  muu: { delante(c) { shape(c, k => { rrPath(k, 50, 2, 48, 26, 9); k.moveTo(60, 27); k.lineTo(54, 38); k.lineTo(70, 27); }, '#fff6ea', EMO_OL); otxt(c, 'MUUU', 74, 15.5, 14, '#ff8fc7'); } },
  basura: {
    delante(c) {
      shape(c, poly(66, 64, 94, 64, 91, 96, 69, 96), '#9aa3ad', EMO_OL); for (const x of [74, 80, 86]) line(c, [x, 69, x - 0.4, 91], 'rgba(32,16,44,.45)', 1.6);
      c.save(); c.translate(81, 52); c.rotate(-0.45); shape(c, rr(-16, -3, 32, 6, 2), '#c3cad1', EMO_OL); shape(c, rr(-4, -7, 8, 4, 1.5), '#c3cad1', EMO_OL * 0.8); c.restore();
      for (const [x, y] of [[70, 34], [90, 30], [62, 46]]) { dot(c, x, y, 2.4, OL); c.beginPath(); c.ellipse(x - 2, y - 3, 2.6, 1.6, -0.5, 0, Math.PI * 2); c.ellipse(x + 2, y - 3, 2.6, 1.6, 0.5, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); }
    },
  },
  directo: {
    delante(c, t) {
      shape(c, rr(48, 3, 50, 18, 9), '#ff3b4f', EMO_OL);
      dot(c, 58, 12, 4, Math.floor(t * 2) % 2 ? '#ff9aa5' : '#fff'); otxt(c, 'EN VIVO', 79, 12.6, 10.5, '#fff');
    },
  },
  calavera: {
    tras(c) { for (const r of [0.75, -0.75]) { c.save(); c.translate(80, 26); c.rotate(r); shape(c, rr(-17, -3, 34, 6, 3), '#fff6ea', EMO_OL * 0.8); for (const x of [-17, 17]) { shape(c, el(x, -3, 3.4, 3.4), '#fff6ea', EMO_OL * 0.8); shape(c, el(x, 3, 3.4, 3.4), '#fff6ea', EMO_OL * 0.8); } c.restore(); } },
    delante(c) {
      shape(c, k => { k.arc(80, 22, 13, Math.PI * 0.85, Math.PI * 2.15); k.lineTo(88, 38); k.lineTo(72, 38); k.closePath(); }, '#fff6ea', EMO_OL);
      shape(c, el(74.5, 23, 4, 4.6), OL, 0); shape(c, el(85.5, 23, 4, 4.6), OL, 0); shape(c, poly(80, 28, 78, 32, 82, 32), OL, 0);
      for (const x of [76, 80, 84]) line(c, [x, 34, x, 38], OL, 1.6);
    },
  },
  heroe: {
    tras(c) { for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; shape(c, poly(44, 50, 44 + Math.cos(a - 0.12) * 60, 50 + Math.sin(a - 0.12) * 60, 44 + Math.cos(a + 0.12) * 60, 50 + Math.sin(a + 0.12) * 60), i % 2 ? '#ffe680' : '#ffcb3d', 0); } shape(c, el(44, 50, 26, 26), 'rgba(255,246,200,.85)', 0); },
    delante(c) { emoChispa(c, 12, 16, 5.5); emoChispa(c, 84, 22, 6); emoChispa(c, 90, 70, 4); },
  },
  billetes: {
    tras(c) { shape(c, el(44, 94, 30, 5), '#4fae2f', EMO_OL * 0.8); },
    delante(c, t) {
      const B = [[10, 0, 0.4], [30, 30, -0.5], [58, 12, 0.7], [80, 44, -0.3], [92, 4, 0.9], [20, 62, 0.2], [70, 74, -0.8]];
      for (const [x, y0, r] of B) { const y = ((y0 + t * 38) % 110) - 6; emoBillete(c, x + Math.sin(t * 3 + x) * 4, y, r + Math.sin(t * 4 + y0) * 0.4); }
    },
  },
  sofa: {
    tras(c) {
      shape(c, rr(4, 44, 92, 34, 12), '#c2410c', EMO_OL); shape(c, rr(0, 58, 20, 36, 8), '#ea580c', EMO_OL); shape(c, rr(80, 58, 20, 36, 8), '#ea580c', EMO_OL);
      shape(c, rr(14, 72, 72, 20, 6), '#f97316', EMO_OL); line(c, [50, 74, 50, 90], 'rgba(32,16,44,.35)', 1.8);
    },
    delante(c) { emoTexto(c, 'Z', 80, 18, 14, '#bfe6ff', -0.2); emoTexto(c, 'Z', 90, 6, 10, '#bfe6ff', -0.2); },
  },
  trofeo: {
    delante(c) {
      for (const s of [-1, 1]) { c.beginPath(); c.arc(80 + s * 12, 58, 6, s < 0 ? Math.PI * 0.5 : -Math.PI * 0.5, s < 0 ? Math.PI * 1.5 : Math.PI * 0.5, s > 0); c.lineWidth = 6.5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3; c.strokeStyle = '#ffcb3d'; c.stroke(); }
      shape(c, k => { k.moveTo(68, 48); k.lineTo(92, 48); k.quadraticCurveTo(92, 72, 80, 74); k.quadraticCurveTo(68, 72, 68, 48); k.closePath(); }, '#ffcb3d', EMO_OL);
      shape(c, rr(77, 73, 6, 10, 1), '#e09a12', EMO_OL * 0.8); shape(c, rr(70, 82, 20, 8, 2), '#8b5a2b', EMO_OL);
      shape(c, k => starPath(k, 80, 58, 6, 2.8), '#fff6c8', 0);
      for (const [x, y, col] of [[64, 30, '#ff5fa8'], [94, 34, '#63cfe0'], [70, 18, '#7be04a']]) shape(c, rr(x, y, 4, 7, 1), col, 1.2);
    },
  },
  robot: {
    tras(c) { for (const [x1, y1, x2, y2] of [[8, 30, 22, 30], [22, 30, 22, 50], [72, 60, 92, 60], [92, 60, 92, 80]]) { line(c, [x1, y1, x2, y2], OL, 4.2); line(c, [x1, y1, x2, y2], '#3fe0d0', 2); } dot(c, 22, 50, 3, '#3fe0d0'); dot(c, 92, 80, 3, '#3fe0d0'); },
    delante(c) { emoTexto(c, 'BIP', 80, 13, 16, '#3fe0d0', -0.12); emoTexto(c, 'BUP', 88, 34, 12, '#ff5fa8', 0.12); },
  },
  hacha: {
    tras(c) { for (const [y, l] of [[30, 26], [46, 34], [62, 24], [78, 30]]) line(c, [2, y, 2 + l, y], 'rgba(255,255,255,.7)', 3.2); },
    delante(c) { emoTexto(c, '¡AAAH!', 72, 14, 15, '#ff5a4f', -0.12); },
  },
  estrella: {
    tras(c, t) { c.save(); c.globalAlpha = 0.42 + Math.sin(t * 5) * 0.1; shape(c, poly(36, -4, 52, -4, 92, 100, -4, 100), '#fff1a8', 0); c.restore(); shape(c, el(44, 95, 36, 5), 'rgba(255,241,168,.85)', 0); },
    delante(c, t) {
      emoTexto(c, '¡ACCIÓN!', 74, 12, 14, '#ffcb3d', -0.1);
      for (const [x, y, s] of [[10, 30, 6], [86, 42, 7], [16, 70, 4.5], [90, 78, 5]]) { const k = 1 + Math.sin(t * 6 + x) * 0.25; shape(c, p => starPath(p, x, y, s * k, s * 0.45 * k), '#ffe14d', EMO_OL * 0.7); }
    },
  },
};
// el dibujo entero en un lienzo de LW x LW (t: para los que se mueven)
function pintaEmote(cv, id, LW, t = 0) {
  const D = FRD('emote')[id]; if (!D) return;
  const R2 = 3; if (cv.width !== LW * R2) { cv.width = LW * R2; cv.height = LW * R2; }
  const c = cv.getContext('2d'); c.setTransform(R2, 0, 0, R2, 0, 0); c.clearRect(0, 0, LW, LW); c.scale(LW / 100, LW / 100); c.lineJoin = 'round'; c.lineCap = 'round';
  const FX = EMO_FX[id] || {};
  if (FX.tras) { c.save(); c.beginPath(); c.arc(50, 50, 50, 0, Math.PI * 2); c.clip(); FX.tras(c, t); c.restore(); }   // lo de detrás, dentro de un círculo: sin esquinas
  const f = (typeof ART_FIT !== 'undefined' && ART_FIT[D.k]) || [0, 0.92];
  c.fillStyle = 'rgba(20,10,30,.22)'; c.beginPath(); c.ellipse(44, 96, 26, 4.5, 0, 0, Math.PI * 2); c.fill();
  try { drawVector(c, D.k, 44 + f[0] * 100, 97, 84 * f[1], 1); } catch (e) { /* sin dibujo */ }
  if (FX.delante) { c.save(); c.lineJoin = 'round'; FX.delante(c, t); c.restore(); }
}
