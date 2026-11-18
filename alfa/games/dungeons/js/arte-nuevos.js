// Fans of Dungeons · Los personajes nuevos de la 0.2.0, con el mismo pincel de 32 bits: SlyFox (el cuarto héroe, ladrón de los
// Animales Locos), MadSquirrel (la prisionera que rescatas), los enemigos nuevos (Reclutador, Impresora atascada, BetaBat y Troll
// del foro) y los tres mini-jefes (Directora de RR. HH., Lich de la Beta Cerrada y Moderador Supremo).
'use strict';

/* ---------- SlyFox: zorro naranja con antifaz morado de cintas largas, cola enorme y un abrecartas por puñal ---------- */
const PAL_FOX = {
  pelo: pal5('#e8702a', '#b0481a', '#ffa860', '#5a1e08', '#3a1204', '#ffe0b0', '#ff9a4a'),
  blanco: pal5('#fff4e6', '#d8c4b0', '#ffffff', '#6a5040', '#4a382c', '#ffffff', '#ffffff'),
  morado: pal5('#7b2cbf', '#4a1878', '#b070f0', '#200838', '#14041e', '#e0c0ff', '#c070ff'),
  negro: pal5('#3a2230', '#1e1018', '#5a3a4a', '#0a0408'),
};
function slyfox(p, o) {
  const hy = o.hy || 0, P = PAL_FOX, g = o.golpe || 0, [pi, pd] = pies(o), s = Math.sin((o.paso || 0) * TAU) * 2;
  // la cola, detrás de todo: grande, con la punta blanca; se mueve al andar
  p.parte(F.tr(-5, -10 - hy, -17 - s, -30 - hy, 6.5, 5), P.pelo, { sombra: 2 });
  p.parte(F.ov(-18 - s, -33 - hy, 5, 5.5), P.blanco, { sombra: 1 });
  // las cintas del antifaz, que vuelan detrás de la cabeza
  p.parte(F.tr(9, -35 - hy, 18 + s + g * 4, -39 - hy, 1.8, 1), P.morado, { sombra: 1 });
  p.parte(F.tr(9, -33 - hy, 17 + s + g * 4, -29 - hy, 1.8, 1), P.morado, { sombra: 1 });
  // pies
  p.parte(F.ov(-5, -2.5 - pi, 4.5, 2.8), P.negro, { sombra: 1 });
  p.parte(F.ov(5 + g * 3, -2.5 - pd, 4.5, 2.8), P.negro, { sombra: 1 });
  // cuerpo y pecho blanco
  p.parte(F.ov(0, -14 - hy, 9, 10), P.pelo, { sombra: 2 });
  p.parte(F.ov(0.5, -12.5 - hy, 5, 6.5), P.blanco, { sombra: 1, luz: false });
  // brazos: el izquierdo atrás; el derecho con el abrecartas, que se lanza hacia delante al apuñalar
  p.parte(F.tr(-8, -19 - hy, -11, -10 - hy, 2.6), P.pelo, { sombra: 1 });
  const mx = 11 + g * 9, my = -15 - hy - g * 2;
  p.parte(F.tr(8, -19 - hy, mx, my, 2.6), P.pelo, { sombra: 1 });
  p.parte(F.tr(mx + 1, my, mx + 9 + g * 2, my - 4, 1.6, 0.4), PAL_ROBOT.gris, { sombra: 1 });   // la hoja
  p.plano(F.re(mx - 1, my - 2, 3, 4), '#6a3a1c');   // el mango
  p.parte(F.ov(mx, my, 2.6, 2.4), P.negro, { sombra: 1 });
  if (g > 0.6) for (const [x, y] of [[mx + 12, my - 6], [mx + 14, my - 3], [mx + 11, my - 9]]) p.px(x, y, '#ffffff');
  // cabeza, hocico blanco, nariz y orejas de punta negra
  for (const sx of [-1, 1]) { p.parte(F.tr(sx * 6, -38 - hy, sx * 9, -50 - hy, 3.6, 1), P.pelo, { sombra: 1 }); p.parte(F.tr(sx * 8, -46 - hy, sx * 9, -50 - hy, 1.6, 0.6), P.negro, { sombra: 0, linea: false }); }
  p.parte(F.ov(0, -32 - hy, 11, 9.5), P.pelo, { sombra: 2 });
  p.parte(F.un(F.ov(-4, -27 - hy, 4.5, 3.5), F.ov(4, -27 - hy, 4.5, 3.5)), P.blanco, { sombra: 1, luz: false });
  p.plano(F.ov(0, -29 - hy, 1.8, 1.3), '#1e1018'); p.px(-0.5, -29.5 - hy, '#ffffff');
  if (o.cara === 'grito' || g > 0.5) boca(p, 0, -26 - hy, 'grito', 2); else p.plano(F.un(F.tr(-2.5, -26 - hy, 0, -25 - hy, 0.5), F.tr(0, -25 - hy, 3, -26.5 - hy, 0.5)), '#5a1530');
  // el antifaz morado con los agujeros de los ojos
  p.parte(F.rr(-10.5, -37 - hy, 21, 5.5, 2.5), P.morado, { sombra: 1 });
  if (o.cara === 'x') { ojo(p, -4.5, -34.5 - hy, 2, 'x'); ojo(p, 4.5, -34.5 - hy, 2, 'x'); return; }
  for (const x of [-4.5, 4.5]) { p.plano(F.ov(x, -34.5 - hy, 2.6, 1.6), '#ffffff'); p.px(x + 0.8, -34.5 - hy, PUPILA); p.px(x + 0.8, -35 - hy, PUPILA); }
  p.plano(F.tr(-7.5, -38 - hy, -2, -37 - hy, 0.6), OL); p.plano(F.tr(2, -37 - hy, 7.5, -38.5 - hy, 0.6), OL);   // cejas de pícaro
}
const fotoFox = (t, c) => { const p = new Pincel(64, 64, 30, 60, t); slyfox(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- MadSquirrel: ardilla rojiza de tripa crema, cola en espiral y una bellota (la prisionera que se une a ti) ---------- */
const PAL_ARDILLA = {
  pelo: pal5('#b14d1c', '#7a3414', '#e0804a', '#3a1406', '#260c04', '#ffd0a0', '#ff9a4a'),
  crema: pal5('#f6d7a7', '#c9a878', '#fff0d0', '#6a5030', '#4a3820', '#ffffff', '#ffffff'),
  bellota: pal5('#9a6a33', '#5b3a1c', '#c89a5a', '#2a1a0a'),
};
function ardilla(p, o) {
  const hy = o.hy || 0, P = PAL_ARDILLA, g = o.golpe || 0, [pi, pd] = pies(o), s = Math.sin((o.paso || 0) * TAU) * 1.5;
  p.parte(F.ov(-9 - s, -20 - hy, 6, 11), P.pelo, { sombra: 2 });   // la cola, detrás
  p.parte(F.ov(-11 - s, -29 - hy, 4.5, 4.5), P.pelo, { sombra: 1 });
  p.plano(F.ov(-9 - s, -20 - hy, 2.5, 6), P.pelo.s);
  for (const [x, l] of [[-3.5, pi], [3.5, pd]]) p.parte(F.ov(x, -2 - l, 3.2, 2), P.pelo, { sombra: 1 });
  p.parte(F.ov(0, -10 - hy, 7, 7.5), P.pelo, { sombra: 2 });
  p.parte(F.ov(0.5, -9 - hy, 4, 5), P.crema, { sombra: 1, luz: false });
  const bx = 6 + g * 6, by = -12 - hy - g * 3;   // la bellota, que lanza al atacar
  p.parte(F.ov(bx, by, 2.8, 3.2), P.bellota, { sombra: 1 }); p.parte(F.rr(bx - 3, by - 4, 6, 2.5, 1), pal5('#5b3a1c'), { sombra: 0 });
  p.parte(F.ov(0, -22 - hy, 7.5, 7), P.pelo, { sombra: 2 });
  for (const sx of [-1, 1]) p.parte(F.tr(sx * 4, -27 - hy, sx * 5.5, -33 - hy, 2.2, 0.8), P.pelo, { sombra: 1 });
  p.parte(F.ov(0, -19 - hy, 4, 3), P.crema, { sombra: 0, luz: false });
  p.plano(F.ov(0, -21 - hy, 1.3, 1), '#ff9bb0');
  if (o.cara === 'x') { ojo(p, -3, -24 - hy, 2, 'x'); ojo(p, 3, -24 - hy, 2, 'x'); return; }
  ojo(p, -3, -24 - hy, 2.2, o.cara === 'furia' || g > 0.3 ? 'furia' : ''); ojo(p, 3, -24 - hy, 2.2, o.cara === 'furia' || g > 0.3 ? 'furia' : '');
  p.plano(F.re(-1, -18 - hy, 2, 1.5), '#ffffff');   // los dientes
}
const fotoArdilla = (t, c) => { const p = new Pincel(44, 48, 22, 44, t); ardilla(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- Reclutador: robot de traje azul eléctrico, sonrisa de anuncio en la pantalla y un megáfono de «ofertas» ---------- */
function reclutador(p, o) {
  const hy = o.hy || 0, P = PAL_ROBOT, g = o.golpe || 0, [pi, pd] = pies(o);
  const traje = pal5('#2a7ad8', '#1a4e98', '#7ab8ff', '#0a2450', '#061638', '#d0e8ff', '#5ef2ff');
  for (const [x, l] of [[-4, pi], [4, pd]]) { p.parte(F.rr(x - 3.5, -4 - l, 7, 4, 1.5), P.oscuro, { sombra: 1 }); p.parte(F.rr(x - 2.5, -12 - hy - l * 0.5, 5, 9, 1), traje, { sombra: 1 }); }
  p.parte(F.pol(-12, -30 - hy, 12, -30 - hy, 9, -11 - hy, -9, -11 - hy), traje, { sombra: 2 });   // chaqueta
  p.parte(F.pol(-3.5, -30 - hy, 3.5, -30 - hy, 0, -18 - hy), P.blanco, { sombra: 0 });
  p.plano(F.tr(0, -28 - hy, 0, -20 - hy, 0.9), P.amarillo.b);   // corbata dorada
  p.parte(F.tr(-11, -27 - hy, -14, -16 - hy, 2.6), traje, { sombra: 1 });
  // el megáfono: apunta hacia delante y vibra al «disparar» ofertas
  const mx = 12 + g * 3, my = -23 - hy;
  p.parte(F.tr(10, -27 - hy, mx, my, 2.6), traje, { sombra: 1 });
  p.parte(F.pol(mx, my - 2, mx + 9, my - 5 - g, mx + 9, my + 5 + g, mx, my + 2), P.blanco, { sombra: 1 });
  p.parte(F.ov(mx + 9, my, 1.6, 5 + g), P.rojo, { sombra: 0 });
  if (g > 0.4) for (const [x, y] of [[14, -6], [16, 0], [14, 6]]) p.px(mx + x, my + y, '#ffd040');
  p.parte(F.ov(0, -40 - hy, 10, 9), traje, { sombra: 2 });   // cabeza redonda
  p.parte(F.rr(-7, -44 - hy, 14, 9, 3), P.pantalla, { sombra: 1, luz: false });
  if (o.cara === 'x') { p.plano(F.re(-5, -41 - hy, 3, 1), P.rojo.b); p.plano(F.re(2, -41 - hy, 3, 1), P.rojo.b); }
  else { p.plano(F.re(-5, -42 - hy, 3, 2), P.cian.b); p.plano(F.re(2, -42 - hy, 3, 2), P.cian.b); p.plano(F.un(F.re(-4, -38 - hy, 8, 1), F.re(-5, -39 - hy, 1, 1), F.re(4, -39 - hy, 1, 1)), P.cian.b); }
  p.parte(F.rr(-9, -50 - hy, 18, 3, 1.5), pal5('#e8e0d0'), { sombra: 0 });   // tupé de plástico
}
const fotoReclutador = (t, c) => { const p = new Pincel(68, 60, 30, 56, t); reclutador(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- Impresora atascada: una impresora con patitas, la luz de error en rojo y la hoja de papel por lengua ---------- */
function impresora(p, o) {
  const hy = o.hy || 0, P = PAL_ROBOT, g = o.golpe || 0, [pi, pd] = pies(o);
  for (const [x, l] of [[-8, pi], [8, pd]]) p.parte(F.rr(x - 2.5, -6 - l, 5, 6, 1), P.oscuro, { sombra: 1 });
  p.parte(F.rr(-15, -26 - hy, 30, 21, 3), P.blanco, { sombra: 2 });   // el cuerpo
  p.parte(F.rr(-13, -31 - hy, 26, 6, 2), P.gris, { sombra: 1 });   // la tapa del escáner
  p.parte(F.rr(-11, -14 - hy, 22, 4, 1), P.oscuro, { sombra: 0 });   // la boca (bandeja)
  const lg = 4 + g * 10;   // la hoja, que escupe al atacar
  p.parte(F.pol(-8, -12 - hy, 8, -12 - hy, 9, -12 - hy + lg, -7, -12 - hy + lg), PAL_OBJ.papel, { sombra: 1 });
  for (let y = 2; y < lg - 1; y += 2.5) p.plano(F.re(-5, -12 - hy + y, 10, 0.8), PAL_OBJ.papel.s);
  p.parte(F.rr(-12, -24 - hy, 12, 6, 1), P.pantalla, { sombra: 0, luz: false });   // pantallita
  if (o.cara === 'x') p.plano(F.re(-10, -22 - hy, 8, 1), P.rojo.b);
  else { p.plano(F.re(-10, -23 - hy, 3, 2), P.rojo.b); p.plano(F.re(-5, -23 - hy, 3, 2), P.rojo.b); }   // ojos de error
  const parp = (o.hy || 0) < -0.5 ? '#ffd040' : P.rojo.b;
  p.plano(F.ov(9, -21 - hy, 2, 2), parp); p.px(8.5, -21.5 - hy, '#ffffff');   // la luz de error
  p.plano(F.re(3, -22 - hy, 3, 1), P.oscuro.b);
}
const fotoImpresora = (t, c) => { const p = new Pincel(64, 56, 30, 52, t); impresora(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- BetaBat: murciélago morado con ojos de píxel roto; vuela, rápido y frágil ---------- */
function murcielago(p, o) {
  const hy = (o.hy || 0) - 10, g = o.golpe || 0, a = Math.sin(((o.paso || 0) + (o.hy || 0) * 0.15) * TAU) * 5;
  const piel = pal5('#6a3a9a', '#3e1e64', '#9a6ad0', '#1a0a30', '#10061e', '#e0c0ff', '#c070ff'), ala = pal5('#4a2a6e', '#2a1446', '#7a52a8', '#10061e');
  for (const sx of [-1, 1]) p.parte(F.pol(sx * 5, -22 - hy, sx * 22, -30 - hy - a, sx * 19, -20 - hy - a * 0.5, sx * 15, -23 - hy, sx * 12, -15 - hy + a * 0.3, sx * 7, -17 - hy), ala, { sombra: 1 });
  p.parte(F.ov(0, -20 - hy, 7, 7.5), piel, { sombra: 2 });
  for (const sx of [-1, 1]) p.parte(F.pol(sx * 2, -26 - hy, sx * 6, -33 - hy, sx * 6, -25 - hy), piel, { sombra: 0 });
  if (o.cara === 'x') { ojo(p, -2.5, -21 - hy, 1.6, 'x'); ojo(p, 2.5, -21 - hy, 1.6, 'x'); }
  else { p.plano(F.re(-4, -23 - hy, 2, 2), '#ff3f52'); p.plano(F.re(2, -23 - hy, 2, 2), '#5ef2ff'); p.px(-3, -21 - hy, '#ff3f52'); p.px(3, -21 - hy, '#5ef2ff'); }   // un ojo de cada color: píxel roto
  p.px(-1.5, -16 - hy, '#ffffff'); p.px(1.5, -16 - hy, '#ffffff');   // colmillos
  if (g > 0.4) p.plano(F.ov(0, -15 - hy, 2, 1.5), '#5a1530');
}
const fotoMurcielago = (t, c) => { const p = new Pincel(56, 60, 28, 56, t); murcielago(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- Troll del foro: verde, encorvado, nariz enorme, gorro de capitán y un teclado por garrote ---------- */
function troll(p, o) {
  const hy = o.hy || 0, g = o.golpe || 0, [pi, pd] = pies(o);
  const piel = pal5('#6aa848', '#3e7a2a', '#a0d878', '#16380e', '#0e260a', '#e0ffd0', '#9aff6a'), ropa = pal5('#5a4a6a', '#3a2e48', '#8a7a9a', '#16101e');
  for (const [x, l] of [[-6, pi], [6, pd]]) p.parte(F.ov(x, -3 - l, 5, 3), piel, { sombra: 1 });
  p.parte(F.ov(0, -16 - hy, 13, 12), ropa, { sombra: 2 });   // barriga con sudadera
  p.plano(F.re(-5, -18 - hy, 10, 1), ropa.s);
  p.parte(F.tr(-11, -22 - hy, -15, -9 - hy, 3.4), piel, { sombra: 1 });
  // el teclado-garrote: arriba en reposo, baja de golpe
  const kx = 13 + g * 6, ky = -24 - hy + g * 12, ang = -1.1 + g * 1.6;
  p.parte(F.tr(10, -22 - hy, kx, ky, 3.2), piel, { sombra: 1 });
  const ex = kx + Math.cos(ang) * 16, ey = ky + Math.sin(ang) * 16;
  p.parte(F.tr(kx, ky, ex, ey, 3.4), pal5('#2a2a3a', '#16161e', '#4a4a5e', '#08080c'), { sombra: 1 });
  for (let k = 0.2; k < 1; k += 0.18) p.px(kx + (ex - kx) * k, ky + (ey - ky) * k - 1, '#d9d2e0');
  p.parte(F.ov(kx, ky, 3.2, 3), piel, { sombra: 1 });
  p.parte(F.ov(0, -33 - hy, 10, 9), piel, { sombra: 2 });   // cabeza
  p.parte(F.ov(1, -30 - hy, 4, 3.5), piel, { sombra: 1, luz: 2 });   // la nariz
  p.parte(F.rr(-9, -43 - hy, 18, 5, 2), pal5('#2a3a6a', '#16224a', '#4a5a9a', '#080e20'), { sombra: 1 });   // gorro
  p.parte(F.rr(-11, -39 - hy, 14, 2, 1), pal5('#2a3a6a', '#16224a', '#4a5a9a', '#080e20'), { sombra: 0 });
  if (o.cara === 'x') { ojo(p, -4, -35 - hy, 1.8, 'x'); ojo(p, 4, -35 - hy, 1.8, 'x'); }
  else { ojo(p, -4, -35 - hy, 2, 'furia'); ojo(p, 4, -35 - hy, 2, 'furia'); }
  boca(p, 1, -26 - hy, o.cara === 'grito' || g > 0.4 ? 'grito' : 'risa', 3);
  p.px(-1, -25.5 - hy, '#ffffff'); p.px(3, -25.5 - hy, '#ffffff');
}
const fotoTroll = (t, c) => { const p = new Pincel(76, 64, 34, 60, t); troll(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- Mini-jefes ---------- */
// Directora de RR. HH.: robot alto de traje morado, cascos con micro y la carpeta de despidos
function rrhh(p, o) {
  const hy = o.hy || 0, P = PAL_ROBOT, g = o.golpe || 0, [pi, pd] = pies(o);
  const traje = pal5('#8a3ab0', '#5a1e78', '#c07ae0', '#26083a', '#160424', '#f0d0ff', '#ff8ad0');
  for (const [x, l] of [[-5, pi], [5, pd]]) { p.parte(F.rr(x - 3.5, -5 - l, 7, 5, 1.5), P.oscuro, { sombra: 1 }); p.parte(F.rr(x - 2.5, -16 - hy - l * 0.5, 5, 12, 1), P.oscuro, { sombra: 1 }); }
  p.parte(F.pol(-13, -40 - hy, 13, -40 - hy, 11, -15 - hy, -11, -15 - hy), traje, { sombra: 2 });
  p.parte(F.pol(-4, -40 - hy, 4, -40 - hy, 0, -28 - hy), P.blanco, { sombra: 0 });
  for (const y of [-34, -29, -24]) p.px(0, y - hy, P.amarillo.b);
  p.parte(F.tr(-12, -37 - hy, -16, -22 - hy, 3), traje, { sombra: 1 });
  // la carpeta de despidos, que abre de golpe al atacar
  const cx = 14 + g * 5, cy = -30 - hy - g * 4;
  p.parte(F.tr(12, -37 - hy, cx, cy, 3), traje, { sombra: 1 });
  p.parte(F.rr(cx - 2, cy - 9, 11 + g * 4, 13, 1), pal5('#ff4b5c', '#b01c30', '#ff9aa4', '#5a0a14'), { sombra: 1 });
  p.plano(F.re(cx + 1, cy - 6, 6, 1), '#fff6ea'); p.plano(F.re(cx + 1, cy - 3, 6, 1), '#fff6ea'); p.plano(F.re(cx + 1, cy, 4, 1), '#fff6ea');
  p.parte(F.rr(-11, -58 - hy, 22, 18, 4), traje, { sombra: 2 });   // cabeza
  p.parte(F.rr(-8, -55 - hy, 16, 11, 2), P.pantalla, { sombra: 1, luz: false });
  if (o.cara === 'x') { p.plano(F.re(-6, -50 - hy, 4, 1), P.rojo.b); p.plano(F.re(2, -50 - hy, 4, 1), P.rojo.b); }
  else { p.plano(F.re(-6, -52 - hy, 4, 2), '#ff8ad0'); p.plano(F.re(2, -52 - hy, 4, 2), '#ff8ad0'); p.plano(F.re(-3, -47 - hy, 6, 1), '#ff8ad0'); }
  for (const sx of [-1, 1]) p.parte(F.ov(sx * 12, -50 - hy, 3, 4), P.oscuro, { sombra: 1 });   // cascos
  p.plano(F.tr(12, -47 - hy, 6, -43 - hy, 0.7), OL); p.plano(F.ov(5.5, -43 - hy, 1.4, 1.4), P.rojo.b);   // micro
  p.plano(F.tr(-12, -54 - hy, 12, -54 - hy, 0.6), P.oscuro.o); p.plano(F.ov(0, -60 - hy, 12, 3), P.oscuro.b);
}
const fotoRrhh = (t, c) => { const p = new Pincel(72, 76, 34, 72, t); rrhh(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

// Lich de la Beta Cerrada: calavera con corona y túnica morada; levanta una tableta que brilla en verde con «BETA»
function lich(p, o) {
  const hy = (o.hy || 0) - 3, g = o.golpe || 0;
  const tunica = pal5('#4a2a6a', '#2a1446', '#7a52a8', '#10061e', '#08030e', '#d0b0ff', '#a070ff'), verde = pal5('#5cff8a', '#1e9a4a', '#c0ffd0', '#0a4a22');
  p.parte(F.pol(-12, -32 - hy, 12, -32 - hy, 16, -2, 10, -6, 5, -1, 0, -5, -5, -1, -10, -6, -16, -2), tunica, { sombra: 2 });   // túnica deshilachada
  p.parte(F.tr(-11, -30 - hy, -16, -18 - hy, 3), tunica, { sombra: 1 });
  const tx = 13 + g * 2, ty = -36 - hy - g * 6;
  p.parte(F.tr(10, -30 - hy, tx, ty + 6, 3), tunica, { sombra: 1 });
  p.parte(F.rr(tx - 4, ty - 8, 10, 13, 1.5), pal5('#2a2a3a', '#16161e', '#4a4a5e', '#08080c'), { sombra: 1 });   // la tableta
  p.parte(F.rr(tx - 3, ty - 7, 8, 11, 1), verde, { sombra: 0, luz: 2 });
  for (const [x, y] of [[-1, -4], [1, -4], [-1, -2], [1, -1], [3, -4], [3, -2]]) p.px(tx + x, ty + y, '#0a4a22');
  if (g > 0.4) for (let a = 0; a < TAU; a += TAU / 10) p.px(tx + 1 + Math.cos(a) * (9 + g * 3), ty - 1 + Math.sin(a) * (9 + g * 3), a % 2 < 1 ? '#5cff8a' : '#c0ffd0');
  p.parte(F.ov(0, -42 - hy, 9, 8.5), PAL_HUESO, { sombra: 2 });   // calavera
  p.parte(F.rr(-5, -36 - hy, 10, 4, 1.5), PAL_HUESO, { sombra: 1 });
  if (o.cara === 'x') { ojo(p, -3.5, -43 - hy, 2.4, 'x'); ojo(p, 3.5, -43 - hy, 2.4, 'x'); }
  else for (const x of [-3.5, 3.5]) { p.plano(F.ov(x, -43 - hy, 2.6, 2.4), '#10061e'); p.px(x, -43 - hy, '#5cff8a'); }
  for (const x of [-3, -1, 1, 3]) p.px(x, -35 - hy, '#55483c');
  p.parte(F.pol(-8, -49 - hy, 8, -49 - hy, 8, -55 - hy, 4, -52 - hy, 0, -57 - hy, -4, -52 - hy, -8, -55 - hy), PAL_BUNNY.oro, { sombra: 1 });   // corona
  p.px(0, -52 - hy, '#5cff8a');
}
const fotoLich = (t, c) => { const p = new Pincel(64, 72, 30, 68, t); lich(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

// Moderador Supremo: armadura gris con capa roja, visor de casco y un mazo gigante que pone «BAN»
function moderador(p, o) {
  const hy = o.hy || 0, P = PAL_ROBOT, g = o.golpe || 0, [pi, pd] = pies(o);
  const capa = pal5('#b01c30', '#6a0a18', '#ff4b5c', '#2a040a');
  p.parte(F.pol(-11, -40 - hy, 11, -40 - hy, 16, -3, -16, -3), capa, { sombra: 2 });
  for (const [x, l] of [[-6, pi], [6, pd]]) { p.parte(F.rr(x - 4, -6 - l, 8, 6, 2), P.oscuro, { sombra: 1 }); p.parte(F.rr(x - 3, -18 - hy - l * 0.5, 6, 13, 2), P.gris, { sombra: 1 }); }
  p.parte(F.rr(-12, -40 - hy, 24, 23, 5), P.gris, { sombra: 2 });
  p.parte(F.rr(-6, -36 - hy, 12, 9, 2), P.oscuro, { sombra: 1 }); p.plano(F.re(-4, -33 - hy, 8, 2), '#ff4b5c');   // insignia
  for (const x of [-14, 14]) p.parte(F.ov(x, -38 - hy, 6, 5), P.gris, { sombra: 2 });
  p.parte(F.tr(-14, -35 - hy, -17, -22 - hy, 3.2), P.gris, { sombra: 1 });
  // el mazo del BAN: arriba en guardia; cae de golpe
  const mx = 16 + g * 4, my = -30 - hy + g * 8, ang = -1.4 + g * 1.9;
  p.parte(F.tr(13, -35 - hy, mx, my, 3.2), P.gris, { sombra: 1 });
  const ex = mx + Math.cos(ang) * 18, ey = my + Math.sin(ang) * 18;
  p.parte(F.tr(mx, my, ex, ey, 1.6), pal5('#6a3a1c', '#3e2010', '#9a5a30', '#1e0c04'), { sombra: 1 });
  const hx = ex + Math.cos(ang) * 4, hyy = ey + Math.sin(ang) * 4;
  p.parte(F.ov(hx, hyy, 8, 6, ang + Math.PI / 2), P.gris, { sombra: 2 });
  p.parte(F.ov(hx, hyy, 8, 2.2, ang + Math.PI / 2), PAL_ROBOT.rojo, { sombra: 0, linea: false });   // la banda roja del BAN
  for (const k of [-2, 0, 2]) p.px(hx + Math.cos(ang + Math.PI / 2) * k, hyy + Math.sin(ang + Math.PI / 2) * k, '#ffffff');
  p.parte(F.ov(mx, my, 3.2, 3), P.oscuro, { sombra: 1 });
  p.parte(F.ov(0, -48 - hy, 10.5, 10), P.gris, { sombra: 2 });   // casco
  p.parte(F.rr(-8, -51 - hy, 16, 4, 1.5), P.pantalla, { sombra: 0, luz: false });
  if (o.cara === 'x') p.plano(F.re(-6, -50 - hy, 12, 1), P.oscuro.b);
  else { p.plano(F.re(-6, -50 - hy, 12, 2), '#ff4b5c'); p.px(-4, -50 - hy, '#ffffff'); }
  p.parte(F.pol(-2, -58 - hy, 2, -58 - hy, 1, -65 - hy, -1, -65 - hy), capa, { sombra: 0 });   // penacho
}
const fotoModerador = (t, c) => { const p = new Pincel(100, 88, 40, 84, t); moderador(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

function creaFigurasNuevas() {
  figura('slyfox', fotoFox, {});
  figura('ardilla', fotoArdilla, { esc: 1.1 });
  figura('reclutador', fotoReclutador, {});
  figura('impresora', fotoImpresora, {});
  figura('murcielago', fotoMurcielago, { flota: true });
  figura('troll', fotoTroll, {});
  figura('rrhh', fotoRrhh, { esc: 1.05 });
  figura('lich', fotoLich, { flota: true, esc: 1.05 });
  figura('moderador', fotoModerador, { esc: 1.0 });
  cuadros('slyfox', 'quieto', false);
  Object.assign(ESCOMBROS_COLOR, {
    slyfox: ['#e8702a', '#fff4e6', '#7b2cbf'], ardilla: ['#b14d1c', '#f6d7a7'], reclutador: ['#2a7ad8', '#fafaff', '#ffd848'],
    impresora: ['#fafaff', '#b4bcd4', '#f4e6c2'], murcielago: ['#6a3a9a', '#4a2a6e'], troll: ['#6aa848', '#5a4a6a', '#2a2a3a'],
    rrhh: ['#8a3ab0', '#ff4b5c', '#4a5070'], lich: ['#4a2a6a', '#f4eee4', '#5cff8a'], moderador: ['#b4bcd4', '#b01c30', '#2a2a3a'],
  });
}
