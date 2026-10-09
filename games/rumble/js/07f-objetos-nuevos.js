// Fans of Rumble · Dibujo sobre el líder de los objetos nuevos del gashapón (octubre de 2026). Los llama drawEquip/drawWeapon de 07b-unidades.js
// cuando el objeto no es de los de antes. Cada uno: arma (c, hx, hdy: la mano), cabeza (c, hy: lo alto de la cabeza), accesorio (c, ax, ay: el costado).
'use strict';
const EQ_NUEVOS = {
  weapon: {
    palo_selfie: (c, hx, hdy) => { line(c, [hx, hdy, hx + 5, hdy - 20], OL, 3.2); line(c, [hx, hdy, hx + 5, hdy - 20], '#9ca3af', 1.6); shape(c, rr(hx + 1, hdy - 30, 8, 12, 1.6), '#1f2937', 1.3); dot(c, hx + 5, hdy - 26, 1.6, '#22e3ff'); },
    cable_hdmi: (c, hx, hdy) => {
      for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(hx + 2, hdy - 4 - i * 4, 5, 2.6, 0, 0, Math.PI * 2); c.strokeStyle = OL; c.lineWidth = 2.6; c.stroke(); c.strokeStyle = '#4b5563'; c.lineWidth = 1.4; c.stroke(); }
      shape(c, rr(hx + 5, hdy - 20, 5, 6, 1), '#9ca3af', 1.2); c.fillStyle = '#ffcb3d'; c.fillRect(hx + 6, hdy - 23, 3, 3);
    },
    pincho_kebab: (c, hx, hdy) => { line(c, [hx, hdy + 2, hx + 4, hdy - 22], OL, 2.6); line(c, [hx, hdy + 2, hx + 4, hdy - 22], '#c8a27a', 1.4); for (const [k, col] of [[-6, '#8b4513'], [-10, '#7be04a'], [-14, '#8b4513'], [-18, '#e63946']]) shape(c, el(hx + 0.6 - k * 0.17, hdy + k, 3.4, 2.4), col, 1.1); },
    micro_karaoke: (c, hx, hdy) => { line(c, [hx, hdy + 2, hx + 2, hdy - 10], OL, 3.6); line(c, [hx, hdy + 2, hx + 2, hdy - 10], '#ff5fa8', 2); shape(c, el(hx + 2.6, hdy - 14, 4.6, 4.6), '#e5e7eb', 1.4); line(c, [hx - 1, hdy - 14, hx + 6, hdy - 14], '#9ca3af', 0.8); line(c, [hx + 2.6, hdy - 18, hx + 2.6, hdy - 10], '#9ca3af', 0.8); },
    mazo_hotfix: (c, hx, hdy) => { line(c, [hx, hdy, hx + 3, hdy - 15], OL, 3.6); line(c, [hx, hdy, hx + 3, hdy - 15], '#8a5a33', 2); c.save(); c.translate(hx + 3, hdy - 17); c.rotate(0.25); shape(c, rr(-8, -4.5, 16, 9, 2), '#9ca3af', 1.4); shape(c, rr(-3, -3, 6, 6, 1), '#22c55e', 1); line(c, [-1.6, 0, 1.6, 0], '#fff', 1); line(c, [0, -1.6, 0, 1.6], '#fff', 1); c.restore(); },
    joystick: (c, hx, hdy) => { shape(c, rr(hx - 4, hdy - 4, 12, 6, 2), '#1f2937', 1.3); line(c, [hx + 2, hdy - 4, hx + 3, hdy - 12], OL, 2.2); line(c, [hx + 2, hdy - 4, hx + 3, hdy - 12], '#9ca3af', 1); shape(c, el(hx + 3, hdy - 13.5, 3, 3), '#ff3348', 1.2); dot(c, hx + 6, hdy - 1, 1, '#ffcb3d'); },
    katana_steam: (c, hx, hdy) => {
      c.save(); c.translate(hx + 1, hdy - 2); c.rotate(0.18);
      line(c, [0, 4, 0, -4], OL, 3.6); line(c, [0, 4, 0, -4], '#1b2838', 2.2); line(c, [-3.5, -4.5, 3.5, -4.5], OL, 2.4); line(c, [-3.5, -4.5, 3.5, -4.5], '#ffcb3d', 1.2);
      shape(c, c2 => { c2.moveTo(-1.6, -5); c2.lineTo(1.6, -5); c2.lineTo(1.2, -24); c2.lineTo(-0.4, -27); c2.lineTo(-1.6, -24); c2.closePath(); }, '#e5e7eb', 1.2);
      shape(c, rr(2.5, -2, 6, 3.6, 0.8), '#7be04a', 0.9); c.restore();
    },
  },
  head: {
    gorro_abuela: (c, hy) => { shape(c, c2 => { c2.arc(0, hy + 4, 9.5, Math.PI, 0); c2.closePath(); }, '#e63946', 1.5); line(c, [-9, hy + 1.5, 9, hy + 1.5], '#fff6ea', 1.6); line(c, [-7, hy - 2.5, 7, hy - 2.5], '#fff6ea', 1.2); shape(c, el(0, hy - 6.5, 3.2, 3.2), '#fff6ea', 1.2); },
    gorro_cumple: (c, hy) => { shape(c, poly(-7, hy + 2, 0, hy - 16, 7, hy + 2), '#a855f7', 1.5); for (const [x, y, col] of [[-2.5, hy - 2, '#ffcb3d'], [2.5, hy - 6, '#7df3ff'], [0, hy - 10, '#ff5fa8']]) dot(c, x, y, 1.3, col); shape(c, el(0, hy - 17, 2.4, 2.4), '#ffcb3d', 1.1); },
    casco_moto: (c, hy) => { shape(c, c2 => { c2.arc(0, hy + 7, 11, Math.PI * 1.02, Math.PI * 1.98); c2.lineTo(11, hy + 13); c2.lineTo(-11, hy + 13); c2.closePath(); }, '#2e8bff', 1.6); shape(c, rr(-8, hy + 6, 16, 5, 2), '#1f2937', 1.2); line(c, [-6, hy + 7.2, 1, hy + 7.2], '#7df3ff', 1); },
    mascara_luchador: (c, hy) => { shape(c, el(0, hy + 9, 10, 8.5), '#e63946', 1.5); for (const s of [-1, 1]) { shape(c, el(s * 4, hy + 9, 3, 2.2, s * 0.3), '#fff6ea', 1); line(c, [s * 7, hy + 6, s * 2, hy + 7], '#ffcb3d', 1.2); } line(c, [0, hy + 1, 0, hy + 5], '#ffcb3d', 1.4); },
    corona_troll: (c, hy) => { shape(c, poly(-9, hy + 2, -10, hy - 9, -5, hy - 3, 0, hy - 12, 5, hy - 3, 10, hy - 9, 9, hy + 2), '#ffcb3d', 1.5); dot(c, 0, hy - 2, 1.8, '#7be04a'); dot(c, -6, hy - 1, 1.2, '#a855f7'); dot(c, 6, hy - 1, 1.2, '#a855f7'); },
  },
  acc: {
    patinete: (c, ax, ay) => { line(c, [ax + 3, ay - 10, ax + 1, ay + 6], OL, 2.4); line(c, [ax + 3, ay - 10, ax + 1, ay + 6], '#9ca3af', 1.2); line(c, [ax, ay - 10, ax + 6, ay - 10], OL, 1.8); shape(c, rr(ax - 6, ay + 5, 9, 2.6, 1), '#22c55e', 1); dot(c, ax - 5, ay + 9, 1.8, OL); dot(c, ax + 2, ay + 9, 1.8, OL); },
    bolsa_pipas: (c, ax, ay) => { shape(c, rr(ax - 4.5, ay - 6, 9, 11, 2), '#ffcb3d', 1.3); c.fillStyle = '#e63946'; c.fillRect(ax - 4.5, ay - 6, 9, 2.4); for (const [x, y] of [[-2, 0], [1.5, 1.5], [0, -2.5]]) shape(c, el(ax + x, ay + y, 1.1, 0.7, 0.6), '#f5f0dc', 0.6); },
    llavero_suerte: (c, ax, ay) => { c.beginPath(); c.arc(ax, ay - 6, 2.4, 0, Math.PI * 2); c.strokeStyle = '#9ca3af'; c.lineWidth = 1.2; c.stroke(); line(c, [ax, ay - 3.6, ax, ay - 1], '#9ca3af', 1); for (const [x, y] of [[-2, 1], [2, 1], [-2, 4.6], [2, 4.6]]) shape(c, el(ax + x, ay + y, 2.1, 2.1), '#22c55e', 0.9); },
    mochila_ruedas: (c, ax, ay) => { shape(c, rr(ax - 6, ay - 8, 9, 13, 2.4), '#2e8bff', 1.3); line(c, [ax - 4.5, ay - 3, ax + 1.5, ay - 3], '#1d5fc9', 1.2); dot(c, ax - 4, ay + 6.5, 1.8, OL); dot(c, ax + 1, ay + 6.5, 1.8, OL); },
    powerbank: (c, ax, ay) => { shape(c, rr(ax - 3.8, ay - 7, 7.6, 12, 1.6), '#1f2937', 1.3); for (let i = 0; i < 3; i++) { c.fillStyle = '#7be04a'; c.fillRect(ax - 2.2, ay + 2 - i * 3, 4.4, 2); } c.fillStyle = OL; c.fillRect(ax - 1.4, ay - 8.6, 2.8, 1.8); },
    capa_heroe: (c, ax, ay, hy) => { for (const s of [-1, 1]) shape(c, poly(s * 7, hy + 15, s * 10, hy + 15, s * 15, hy + 34, s * 8, hy + 30), '#e63946', 1.3); dot(c, -7, hy + 15.5, 1.6, '#ffcb3d'); dot(c, 7, hy + 15.5, 1.6, '#ffcb3d'); },
  },
};
