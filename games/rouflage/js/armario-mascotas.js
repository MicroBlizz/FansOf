// Fans of Rouflage · MASCOTAS (dibujo): los bichitos del armario, inspirados en las unidades del Rumble. Cada uno es una función
// ARD.MASCOTAS[id](c, o) que dibuja con los pies en 0,0 mirando a la derecha (mide unos 20 de alto; la galleta mide unos 55):
// o = { t: segundos, mov: 0 quieto / 1 corriendo, susto: huyendo }. Casi todos salen de bicho(), un cuerpo redondo al que se le cambian
// color, orejas, cola y cara; los que vuelan o se arrastran van aparte. Cómo se mueven en la partida: mascotas.js.
'use strict';
Object.assign(ARD, (() => {
  const { OL, T, shape, el, rr, poly, line, dot } = ARD;
  const salto = o => (o.mov ? Math.abs(Math.sin(o.t * 14)) * 1.8 : Math.sin(o.t * 3) * 0.5);
  const patas = (c, o, col, y = -1.2, sep = 4) => { for (const k of [-1, 1]) { const p = o.mov ? Math.sin(o.t * 14 + k * 1.6) * 2.4 : 0; shape(c, el(k * sep + p, y, 2.6, 1.8), col, 1.5); } };
  // los ojos: dos puntos con brillo; con susto, grandes y blancos
  const ojos = (c, o, x = 3.4, y = -9.6, sep = 4.2) => { for (const k of [0, 1]) { const ex = x + k * sep; if (o.susto) { shape(c, el(ex, y, 2.5, 2.8), '#fff', 1.1); dot(c, ex + 0.6, y, 1.1, OL); } else { shape(c, el(ex, y, 1.5, 1.9), OL, 0); dot(c, ex + 0.5, y - 0.7, 0.55, '#fff'); } } };
  // s: { c cuerpo, p panza, rx, ry, orejas(c), atras(c,o), delante(c,o), cara(c,o), pata }
  function bicho(c, o, s) {
    const rx = s.rx || 8.6, ry = s.ry || 7.2, b = salto(o);
    c.save(); c.translate(0, -b);
    if (s.atras) s.atras(c, o);
    patas(c, o, s.pata || s.c, -1.2 + b, rx * 0.46);
    shape(c, el(0, -1 - ry, rx, ry), s.c, 1.9);
    if (s.p) shape(c, el(1.4, -ry * 0.55 - 1, rx * 0.58, ry * 0.5), s.p, 0);
    if (s.orejas) s.orejas(c, o, ry);
    if (s.sinOjos !== true) ojos(c, o, 3.4, -ry - 2.4);
    if (s.cara) s.cara(c, o, ry);
    if (s.delante) s.delante(c, o, ry);
    c.restore();
  }
  const nariz = (c, x, y, col = '#ff6fb5') => shape(c, el(x, y, 1.3, 1), col, 0.9);
  const tri = (c, x1, y1, x2, y2, x3, y3, col) => shape(c, poly(x1, y1, x2, y2, x3, y3), col, 1.5);
  const cola = (c, o, x, y, rx, ry, rot, col, mueve = 0.2) => shape(c, el(x, y, rx, ry, rot + Math.sin(o.t * (o.mov ? 12 : 3)) * mueve), col, 1.7);

  const MASCOTAS = {
    conejo: (c, o) => bicho(c, o, { c: '#f7f3ff', p: '#fff', atras: (g, q) => dot(g, -8.6, -6, 3, '#fff'), orejas: g => { shape(g, el(-1, -19.6, 2.6, 7.4, -0.1), '#f7f3ff', 1.6); shape(g, el(5.4, -19.2, 2.4, 7, 0.2), '#f7f3ff', 1.6); shape(g, el(-1, -19.4, 1.1, 5, -0.1), '#ffb3cf', 0); }, cara: g => nariz(g, 8.6, -8.4) }),
    ardilla: (c, o) => bicho(c, o, { c: '#c2641f', p: '#f0a065', atras: (g, q) => { cola(g, q, -9, -12, 4.4, 9, -0.5, '#b14d1c', 0.25); line(g, [-11, -8, -9, -17], '#f0a065', 1.4); }, orejas: g => { tri(g, -1, -14.4, -2.4, -19, 2.4, -15.4, '#c2641f'); tri(g, 5, -14.8, 6.6, -19.4, 8.4, -14, '#c2641f'); }, cara: g => { shape(g, rr(7, -6.6, 1.8, 2.4, 0.5), '#fff', 0.8); } }),
    zorro: (c, o) => bicho(c, o, { c: '#e8702a', p: '#fff4e6', atras: (g, q) => { cola(g, q, -10, -8, 6, 3.4, -0.5, '#e8702a', 0.25); shape(g, el(-14.4, -10, 2.4, 2, -0.5), '#fff4e6', 1.2); }, orejas: g => { tri(g, -2, -14, -3, -21, 3, -15, '#e8702a'); tri(g, 5, -14.6, 7.4, -21, 9, -13.6, '#e8702a'); tri(g, -2.6, -18, -3, -21, -0.2, -18.4, '#2b1622'); tri(g, 6.6, -18.4, 7.4, -21, 8.6, -17.6, '#2b1622'); }, cara: g => nariz(g, 8.8, -8.4, OL) }),
    castor: (c, o) => bicho(c, o, { c: '#8b5a2b', p: '#c99a62', atras: (g, q) => { cola(g, q, -10, -3, 5.6, 2.6, -0.2, '#4e3420', 0.12); }, orejas: g => { dot(g, -0.6, -15.2, 2.2, '#8b5a2b'); dot(g, 7.6, -14.8, 2.2, '#8b5a2b'); }, cara: g => { nariz(g, 8.8, -8.6, OL); shape(g, rr(7, -6.4, 2.2, 2.8, 0.5), '#fff', 0.9); } }),
    suricato: (c, o) => bicho(c, o, { c: '#d9b27c', p: '#f3e2c3', ry: 8.4, rx: 7.2, orejas: g => { dot(g, 0, -17.4, 1.8, '#a8794a'); dot(g, 7, -17.2, 1.8, '#a8794a'); }, cara: (g, q, ry) => { for (const x of [3.4, 7.6]) shape(g, el(x, -ry - 2.4, 2.4, 2.8, 0.3), 'rgba(60,35,15,.55)', 0); nariz(g, 9.2, -ry - 1.6, OL); }, delante: g => ojos(g, { susto: false, t: 0 }, 3.4, -10.4, 4.2) }),
    mapache: (c, o) => bicho(c, o, { c: '#8d8f99', p: '#d4d6dd', atras: (g, q) => { cola(g, q, -10, -7, 6, 3.2, -0.5, '#8d8f99', 0.25); for (const x of [-12, -9, -6]) line(g, [x, -10, x + 1, -5], '#3b3d47', 1.5); }, orejas: g => { dot(g, -0.4, -15, 2.4, '#8d8f99'); dot(g, 7.4, -14.6, 2.4, '#8d8f99'); }, cara: g => { shape(g, el(5.4, -9.6, 7, 2.4), '#2b2d35', 0); ojos(g, { susto: true, t: 0 }, 3.4, -9.6, 4.2); nariz(g, 9, -8, OL); } }),
    vaca: (c, o) => bicho(c, o, { c: '#fff', p: '#fbcfe8', atras: g => line(g, [-8.6, -8, -11, -3], OL, 1.5), orejas: g => { shape(g, el(-2, -14.6, 3.2, 1.8, 0.3), '#fbcfe8', 1.4); shape(g, el(9.4, -13.4, 3.2, 1.8, -0.3), '#fbcfe8', 1.4); tri(g, 0.4, -15.4, 0.8, -19.6, 3, -15.6, '#fff7ea'); tri(g, 5, -15.6, 6.4, -19.6, 7.8, -15, '#fff7ea'); }, cara: g => { shape(g, el(2, -12.4, 2.6, 2, 0), '#18181b', 0); shape(g, el(-4, -4, 3, 2.4, 0), '#18181b', 0); shape(g, el(8.6, -6.4, 3.4, 2.6), '#fbcfe8', 1.3); dot(g, 8, -6.4, 0.5, OL); dot(g, 9.4, -6.4, 0.5, OL); } }),
    huron: (c, o) => bicho(c, o, { c: '#b9ad9d', p: '#e7ddcc', rx: 11.4, ry: 5.8, atras: (g, q) => cola(g, q, -13, -6, 5, 2, -0.2, '#6b5d4d', 0.2), orejas: g => { dot(g, 3, -12.6, 1.8, '#b9ad9d'); dot(g, 9, -12.4, 1.8, '#b9ad9d'); }, cara: g => { shape(g, el(6.4, -7.6, 5.6, 2, 0), '#3b3329', 0); ojos(g, { susto: true, t: 0 }, 4.4, -7.6, 3.6); nariz(g, 11.2, -6.4, '#ff6fb5'); shape(g, rr(1.6, -12.8, 10, 2.4, 1), '#ef4444', 1.1); } }),
    perro: (c, o) => bicho(c, o, { c: '#e8a04a', p: '#fff7ea', atras: (g, q) => { const w = Math.sin(q.t * (q.mov ? 16 : 7)) * 3; line(g, [-8, -8, -12, -13 + w], OL, 3.4); line(g, [-8, -8, -12, -13 + w], '#e8a04a', 1.8); }, orejas: g => { shape(g, el(-1.6, -12.6, 2.6, 4.6, 0.5), '#9a5a1c', 1.5); shape(g, el(8.4, -12, 2.6, 4.6, -0.5), '#9a5a1c', 1.5); }, cara: g => { nariz(g, 9, -8.6, OL); shape(g, el(8.2, -5.2, 1.5, 2.2), '#ff6fb5', 1); } }),
    gato: (c, o) => bicho(c, o, { c: '#fb923c', p: '#fff0dc', rx: 9.8, ry: 8, atras: (g, q) => { g.save(); g.beginPath(); g.moveTo(-9, -6); g.bezierCurveTo(-18, -4 + Math.sin(q.t * 4) * 3, -17, -18, -12, -20); g.strokeStyle = OL; g.lineWidth = 5.2; g.lineCap = 'round'; g.stroke(); g.strokeStyle = '#fb923c'; g.lineWidth = 3; g.stroke(); g.restore(); }, orejas: g => { tri(g, -2.4, -15, -3.6, -22, 2.6, -16.4, '#fb923c'); tri(g, 5.4, -16.4, 8.4, -22, 9.6, -14.6, '#fb923c'); }, cara: (g, q, ry) => { for (const x of [-1, 2]) line(g, [x + 1, -ry - 8.6, x, -ry - 5], '#9a3412', 1.4); nariz(g, 9, -8.2); line(g, [9.4, -7.6, 13.6, -8.6], OL, 0.8); line(g, [9.4, -6.8, 13.6, -6.2], OL, 0.8); } }),
    nanobot: (c, o) => bicho(c, o, { c: '#cbd5e1', p: '#e2e8f0', sinOjos: true, pata: '#64748b', atras: g => { line(g, [-3, -15, -4, -19], OL, 3); line(g, [-3, -15, -4, -19], '#cbd5e1', 1.4); dot(g, -4, -20, 1.8, '#ef4444'); }, cara: (g, q) => { shape(g, rr(0.4, -13.4, 11, 6, 2.4), '#0f172a', 1.4); const e = q.susto ? 2.2 : 1.4; dot(g, 4, -10.4, e, '#22e3ff'); dot(g, 8.6, -10.4, e, '#22e3ff'); } }),
    calavera: (c, o) => bicho(c, o, { c: '#f5f5f4', p: null, rx: 8, ry: 7.6, sinOjos: true, pata: '#e7e5e4', cara: (g, q) => { for (const x of [2.4, 7.4]) { shape(g, el(x, -10.4, 2.4, 2.9), OL, 0); if (q.susto) dot(g, x, -10.4, 0.9, '#fff'); } shape(g, poly(5, -7.4, 4, -5.6, 6, -5.6), OL, 0); for (const x of [2, 4, 6.4, 8.6]) line(g, [x, -3.6, x, -1.2], OL, 1.1); } }),
    zombi: (c, o) => bicho(c, o, { c: '#84cc16', p: '#bef264', atras: g => { line(g, [-5, -9, -12, -11], OL, 4.6); line(g, [-5, -9, -12, -11], '#84cc16', 2.6); }, cara: (g, q) => { shape(g, el(3.6, -9.8, 2.4, 2.6), '#fff', 1.1); dot(g, 3.9, -9.8, 1, OL); line(g, [7, -10.6, 10, -8.8], OL, 1.4); line(g, [7, -8.8, 10, -10.6], OL, 1.4); line(g, [3, -5.6, 8, -4.8], OL, 1.2); for (const x of [4, 6, 8]) line(g, [x, -6, x, -4], OL, 0.8); line(g, [-1, -16.6, 2, -14.6], '#365314', 1.3); }, sinOjos: true }),
    fantasma: (c, o) => {
      const b = Math.sin(o.t * 4) * 1.6, w = Math.sin(o.t * 8) * 1.2;
      c.save(); c.translate(0, -5 - b); c.globalAlpha = 0.9;
      shape(c, g => { g.moveTo(-8, 0); g.bezierCurveTo(-9, -17, 9, -17, 8, 0); g.quadraticCurveTo(5.4, 3.4 + w, 2.6, 0); g.quadraticCurveTo(0, 3.4 - w, -2.6, 0); g.quadraticCurveTo(-5.4, 3.4 + w, -8, 0); g.closePath(); }, '#e0f2fe', 1.9);
      c.globalAlpha = 1; ojos(c, o, 0.4, -7.6, 4.8); for (const x of [-4, 8.4]) shape(c, el(x, -4.6, 1.8, 1.1), 'rgba(255,120,150,.5)', 0);
      c.restore();
    },
    kaiju: (c, o) => bicho(c, o, { c: '#34d399', p: '#bbf7d0', rx: 9.2, ry: 7.8, atras: (g, q) => { cola(g, q, -11, -5, 6.4, 3, -0.3, '#34d399', 0.25); }, orejas: (g, q, ry) => { for (const [x, h] of [[-5, 4.4], [-0.6, 5.4], [3.8, 4.4]]) tri(g, x - 2.2, -ry - 1.8, x, -ry - 1.8 - h, x + 2.2, -ry - 1.8, '#f472b6'); }, cara: (g, q, ry) => { line(g, [5.4, -5.4, 10, -6.2], OL, 1.4); shape(g, rr(7, -7.2, 1.6, 1.8, 0.4), '#fff', 0.7); nariz(g, 9.2, -ry - 3, OL); } }),
    bichito: (c, o) => {
      const b = salto(o) * 0.5; c.save(); c.translate(0, -b);
      for (const k of [-1, 0, 1]) { const p = o.mov ? Math.sin(o.t * 18 + k) * 1.6 : 0; line(c, [k * 3.6, -4, k * 3.6 + 2 + p, 0], OL, 1.4); line(c, [k * 3.6, -4, k * 3.6 - 3 + p, 0], OL, 1.4); }
      shape(c, el(-0.6, -6.4, 8.4, 6.2), '#ef4444', 1.9); line(c, [-0.6, -12.4, -0.6, -0.4], OL, 1.3); dot(c, -4, -7, 1.4, OL); dot(c, 3, -7, 1.4, OL); dot(c, -4, -3.4, 1, OL); dot(c, 3, -3.4, 1, OL);
      shape(c, el(8.2, -6.6, 3.6, 3.4), '#27272a', 1.6); line(c, [9.8, -9.2, 12, -13], OL, 1.2); line(c, [8, -9.4, 8, -13.6], OL, 1.2); dot(c, 9.4, -7.4, 0.9, '#fff');
      c.restore();
    },
    recreativa: (c, o) => {
      const b = salto(o) * 0.6; c.save(); c.translate(0, -b); patas(c, o, '#4c1d95', -1 + b, 3.4);
      shape(c, rr(-7, -19, 14, 18, 2), '#6d28d9', 1.9); shape(c, rr(-5, -17, 10, 7, 1.2), '#0f172a', 1); c.fillStyle = o.susto ? '#ef4444' : '#22e3ff'; c.fillRect(-2.8, -15.4, 2, 2); c.fillRect(1, -15.4, 2, 2); c.fillRect(-2.8, -12.6, 5.8, 1.2);
      shape(c, rr(-5.6, -8, 11.2, 3, 1), '#4c1d95', 1.1); dot(c, -2.6, -6.5, 1.1, '#ef4444'); dot(c, 2.4, -6.5, 1.1, '#fde047');
      c.restore();
    },
    cupido: (c, o) => {
      const b = Math.sin(o.t * 5) * 1.8, a = Math.sin(o.t * (o.mov ? 22 : 10)) * 0.5;
      c.save(); c.translate(0, -11 - b);
      for (const s of [-1, 1]) { c.save(); c.translate(s * 4.4, -2); c.rotate(s * (0.5 + a)); shape(c, el(s * 4.4, -3, 5.4, 2.6, 0), '#fff', 1.4); c.restore(); }
      shape(c, g => { g.moveTo(0, 8); g.bezierCurveTo(-13, 0, -6, -11, 0, -4); g.bezierCurveTo(6, -11, 13, 0, 0, 8); g.closePath(); }, '#ff6fb5', 1.9);
      ojos(c, o, -1.2, -0.8, 4.4);
      c.restore();
    },
    murcielago: (c, o) => {
      const b = Math.sin(o.t * 5) * 1.4, a = Math.sin(o.t * (o.mov ? 24 : 12));
      c.save(); c.translate(0, -10 - b);
      for (const s of [-1, 1]) shape(c, g => { g.moveTo(s * 3, -2); g.quadraticCurveTo(s * 14, -9 - a * 5, s * 16, -3 - a * 6); g.quadraticCurveTo(s * 11, -4, s * 9, 1); g.quadraticCurveTo(s * 7, -2, s * 4, 3); g.closePath(); }, '#4a3a6a', 1.7);
      shape(c, el(0, 0, 6.6, 6, 0), '#4a3a6a', 1.9); tri(c, -4.6, -4, -5.4, -10, -1.2, -5.4, '#4a3a6a'); tri(c, 4.6, -4, 5.4, -10, 1.2, -5.4, '#4a3a6a');
      ojos(c, o, -1.8, -1, 3.6); line(c, [-1.4, 3, -1.4, 5], '#fff', 1.2); line(c, [1.6, 3, 1.6, 5], '#fff', 1.2);
      c.restore();
    },
    pulpo: (c, o) => {
      const b = o.mov ? Math.abs(Math.sin(o.t * 12)) * 1.6 : Math.sin(o.t * 3) * 0.5; c.save(); c.translate(0, -b);
      for (let k = 0; k < 4; k++) { const x = -6 + k * 4, w = Math.sin(o.t * (o.mov ? 14 : 5) + k * 1.4) * 2; c.beginPath(); c.moveTo(x, -6); c.quadraticCurveTo(x + w, -3, x - w * 0.6, 0); c.strokeStyle = OL; c.lineWidth = 4.4; c.lineCap = 'round'; c.stroke(); c.strokeStyle = '#b45cff'; c.lineWidth = 2.4; c.stroke(); }
      shape(c, el(0, -12, 8.8, 8.2), '#b45cff', 1.9); ojos(c, o, -1.2, -11.6, 5); for (const x of [-5, 6.6]) shape(c, el(x, -8.8, 1.8, 1.1), 'rgba(255,120,200,.55)', 0);
      c.restore();
    },
    serpiente: (c, o) => {
      c.save(); const v = o.mov ? 11 : 4;
      for (let k = 7; k >= 0; k--) { const x = -12 + k * 3.4, y = -4.4 + Math.sin(o.t * v - k * 0.9) * 2.4; shape(c, el(x, y, 3.6 - k * 0.1, 3.4 - k * 0.1), k % 2 ? '#22c55e' : '#4ade80', 1.5); }
      const hy = -4.4 + Math.sin(o.t * v - 7 * 0.9) * 2.4; shape(c, el(15, hy - 1.4, 4.4, 3.8), '#4ade80', 1.7); ojos(c, o, 14, hy - 2.4, 3); if (!o.mov || Math.sin(o.t * 9) > 0) line(c, [19, hy - 1, 22, hy - 1, 23.4, hy - 2.4], '#ef4444', 1);
      c.restore();
    },
    dron: (c, o) => {
      const b = Math.sin(o.t * 4) * 1.6, g = o.susto ? 1.4 : 1; c.save(); c.translate(0, -12 - b);
      for (const s of [-1, 1]) { const a = o.t * 40 * s; line(c, [s * 9 - Math.cos(a) * 5, -5, s * 9 + Math.cos(a) * 5, -5], 'rgba(200,210,230,.85)', 1.6); line(c, [s * 5, -2, s * 9, -5], OL, 1.6); }
      shape(c, el(0, 0, 7.6 * g, 5.4), '#374151', 1.9); shape(c, el(3.6, -0.4, 3, 2.6), '#0f172a', 1.2); dot(c, 3.8, -0.4, 1.4, '#ef4444'); line(c, [-3, 4, -3, 7], OL, 1.4); line(c, [3, 4, 3, 7], OL, 1.4);
      c.restore();
    },
    pollo: (c, o) => bicho(c, o, { c: '#fde047', p: '#fef9c3', rx: 7.4, ry: 7.4, atras: g => tri(g, -7, -9, -13, -12, -9, -5, '#fbbf24'), orejas: g => { tri(g, 0, -15.4, 1.6, -19.6, 3.4, -15, '#ef4444'); tri(g, 2.6, -15, 4.6, -19, 6, -14.6, '#ef4444'); }, cara: g => tri(g, 9.2, -9.4, 13.4, -8.2, 9.2, -6.8, '#f97316'), pata: '#f97316' }),
  };
  // la pieza del armario: la mascota quieta, en un cuadrado de w×w (para el icono de la casilla y la vista)
  const mascotaIcono = id => (c, w) => { c.save(); c.translate(w * 0.47, w * 0.8); c.scale(w / 38, w / 38); if (MASCOTAS[id]) MASCOTAS[id](c, { t: 0.6, mov: 0, susto: false }); c.restore(); };
  return { MASCOTAS, mascotaIcono };
})());
