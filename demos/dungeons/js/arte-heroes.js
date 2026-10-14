// Fans of Dungeons · Los héroes en pixel art nuevo, estilo arcade de 32 bits (cabezones, de frente en tres cuartos, cinco tonos,
// tramado y luz de neón en los bordes): CrazyBunny, CyberMarine y NecroLord; también Lola (tienda y tutorial) y el bug que
// invoca NecroLord. Cada dibujo acepta una pose: hy (bote), paso (0-1, ciclo de andar), golpe (0-1, el ataque) y cara.
// El origen está en los pies; la y crece hacia abajo (lo de arriba es negativo).
'use strict';

const PAL_OJO = pal('#ffffff', '#dcd4f4', '#ffffff', '#3a2050');
const PUPILA = '#241838';
// cuánto se levanta cada pie en el ciclo de andar (0-1): primero el izquierdo, luego el derecho
function pies(o) { const s = Math.sin((o.paso || 0) * TAU); return [Math.max(0, s) * 3, Math.max(0, -s) * 3]; }
// un ojo con su pupila y su brillo. cara: '' normal, 'x' (muerto), 'furia' (ceja), 'feliz' (cerrado)
function ojo(p, x, y, r, cara = '', dir = 0) {
  if (cara === 'x') { for (let d = -1; d <= 1; d++) { p.px(x + d, y + d, OL); p.px(x + d, y - d, OL); } return; }
  if (cara === 'feliz') { p.px(x - 1.5, y + 0.5, OL); p.px(x - 0.5, y - 0.5, OL); p.px(x + 0.5, y - 0.5, OL); p.px(x + 1.5, y + 0.5, OL); return; }
  p.parte(F.ov(x, y, r, r * 1.2), PAL_OJO, { sombra: 1, luz: false });
  p.plano(F.ov(x + dir * 0.6, y + 0.3, r * 0.45, r * 0.6), PUPILA);
  p.px(x - r * 0.3, y - r * 0.5, '#ffffff');
  if (cara === 'furia') p.plano(F.tr(x - r, y - r - 1.2, x + r, y - r - 0.4, 0.6), OL);
}
// una boca pequeña: 'risa' (sonrisa), 'grito' (abierta), 'seria' (raya)
function boca(p, x, y, tipo, w = 3) {
  if (tipo === 'grito') { p.plano(F.ov(x, y + 0.5, w * 0.8, w * 0.9), '#5a1530'); p.plano(F.ov(x, y + 1.6, w * 0.5, w * 0.45), '#ff7aa8'); return; }
  if (tipo === 'seria') { p.plano(F.tr(x - w, y, x + w, y, 0.5), '#5a1530'); return; }
  p.plano(F.un(F.tr(x - w, y - 1, x - w * 0.4, y + 0.6, 0.55), F.tr(x - w * 0.4, y + 0.6, x + w * 0.4, y + 0.6, 0.55), F.tr(x + w * 0.4, y + 0.6, x + w, y - 1, 0.55)), '#5a1530');
}

/* ---------- CrazyBunny: conejo blanco de tripa rosa, ojo en espiral, cejas de loco y zanahoria; ataca con una patada voladora ---------- */
const PAL_BUNNY = {
  pelo: pal5('#fbf6ff', '#c9b2f0', '#ffffff', '#6a4aa8', '#8c6ad0', '#ffffff', '#ff8ae0'),
  rosa: pal5('#ffb0dc', '#ea6cb8', '#ffe0f2', '#a0306c', '#7a2050', '#fff0fa', '#ff5ad0'),
  zana: pal5('#ff9830', '#e05218', '#ffd070', '#7a2a0e', '#5a1a06', '#fff0c0', '#ffe14a'),
  hoja: pal5('#6ad83f', '#2f9a3a', '#c0ff6c', '#1a5222', '#0f3a16', '#f0ffd0', '#8aff60'),
  capa: pal5('#ff7a1a', '#d9431e', '#ffb347', '#8f2410', '#5a1408', '#ffd890', '#ff5ae0'),
  oro: pal5('#ffd040', '#c08a1a', '#fff0a0', '#6a4408', '#4a2e04', '#ffffff', '#fffa80'),
};
function bunny(p, o) {
  const hy = o.hy || 0, P = PAL_BUNNY, g = o.golpe || 0, [pi, pd] = pies(o);
  // la capa naranja, detrás de todo: ondea al andar y vuela hacia atrás en la patada
  const s = Math.sin((o.paso || 0) * TAU) * 2 + g * 5;
  p.parte(F.pol(-9, -25 - hy, 9, -25 - hy, 14 + s, -9 - hy * 0.5, 16 + s, -1, 10, -4, 4, -1, 0, -5, -4, -1, -10, -4, -16 - s, -1, -14 - s, -9 - hy * 0.5), P.capa, { sombra: 2 });
  for (const x of [-3, 3]) p.parte(F.ov(x, -26 - hy, 2.6, 2.2), P.capa, { sombra: 1 });   // el nudo del cuello
  // orejas: la izquierda recta, la derecha con la punta doblada (se inclinan con el bote)
  const ob = hy * 0.4;
  p.parte(F.tr(-6, -44 - hy, -8 - ob, -64 - hy, 4.2, 3.2), P.pelo, { sombra: 1 });
  p.parte(F.tr(-6, -47 - hy, -7.5 - ob, -60 - hy, 1.9, 1.3), P.rosa, { sombra: 0, linea: false, neon: false });
  p.parte(F.un(F.tr(6, -44 - hy, 8, -58 - hy, 4.2, 3.4), F.tr(8, -58 - hy, 15 + ob, -62 - hy, 3.4, 2.6)), P.pelo, { sombra: 1 });
  p.parte(F.un(F.tr(6, -47 - hy, 8, -57 - hy, 1.9, 1.4), F.tr(8, -57 - hy, 13.5 + ob, -60.5 - hy, 1.5, 1)), P.rosa, { sombra: 0, linea: false, neon: false });
  // pies: al andar se levantan por turnos; al golpear, patada voladora con el derecho
  p.parte(F.ov(-6, -2.5 - pi - g * 6, 5.5, 3.2), P.pelo, { sombra: 1 });
  if (g > 0.3) { p.parte(F.tr(4, -10 - hy, 14 + g * 8, -14 - hy, 4.2, 3.4), P.pelo, { sombra: 1 }); p.parte(F.ov(15 + g * 8, -14.5 - hy, 5.8, 3.6), P.pelo, { sombra: 1 }); }
  else p.parte(F.ov(6, -2.5 - pd, 5.5, 3.2), P.pelo, { sombra: 1 });
  // cuerpo con la tripa rosa
  p.parte(F.ov(0, -15 - hy, 11.5, 11), P.pelo, { sombra: 2 });
  p.parte(F.ov(0, -13.5 - hy, 6.5, 7), P.rosa, { sombra: 1, luz: false });
  // brazos: el izquierdo caído, el derecho sujeta la zanahoria (que baja al golpear)
  p.parte(F.tr(-10, -20 - hy, -14 + g * 3, -9 - hy - g * 8, 3), P.pelo, { sombra: 1 });
  p.parte(F.tr(10, -20 - hy, 15, -14 - hy - g * 6, 3), P.pelo, { sombra: 1 });
  const zx = 16 + g * 6, zy = -8 - hy - g * 10, tx = 18 + g * 10, ty = -36 - hy + g * 12;
  p.parte(F.tr(zx, zy, tx, ty, 3.6, 1.4), P.zana, { sombra: 1 });
  for (let k = 0.25; k < 1; k += 0.25) { p.px(zx + (tx - zx) * k, zy + (ty - zy) * k, P.zana.s); p.px(zx + (tx - zx) * k + 1, zy + (ty - zy) * k, P.zana.s); }
  for (const [dx, a] of [[-3, -0.7], [0, -1.5], [3, -0.3]]) p.parte(F.ov(tx + dx, ty - 4, 3.4, 1.6, a + g * 0.8), P.hoja, { sombra: 1 });
  p.parte(F.ov(zx - 0.5, zy - 5, 3.2, 3), P.pelo, { sombra: 1 });   // la mano, encima
  // cabeza, hocico, nariz, dientes y mejillas
  p.parte(F.ov(0, -34 - hy, 13.5, 12.5), P.pelo, { sombra: 2 });
  p.parte(F.ov(0, -28.5 - hy, 6.5, 4.5), P.pelo, { sombra: 1, luz: 2, neon: false });
  p.plano(F.ov(0, -31 - hy, 2.2, 1.5), P.rosa.s);
  p.plano(F.tr(0, -30 - hy, 0, -27.5 - hy, 0.5), '#6a2a48');
  if (o.cara === 'grito' || g > 0.5) boca(p, 0, -27 - hy, 'grito', 2.5);
  else { p.plano(F.un(F.tr(0, -27.5 - hy, -2.5, -26 - hy, 0.5), F.tr(0, -27.5 - hy, 2.5, -26 - hy, 0.5)), '#6a2a48'); p.plano(F.re(-1.5, -26.5 - hy, 3, 2), '#ffffff'); }
  for (const s of [-1, 1]) { p.px(s * 9, -29 - hy, P.rosa.b); p.px(s * 10, -28 - hy, P.rosa.b); p.px(s * 9, -28 - hy, P.rosa.l); }
  // ojos: el izquierdo normal, el derecho en espiral (la marca de la casa), y cejas de loco
  if (o.cara === 'x') { ojo(p, -5.5, -36 - hy, 3, 'x'); ojo(p, 5.5, -36 - hy, 3, 'x'); return; }
  ojo(p, -5.5, -36 - hy, 3, o.cara === 'furia' || g > 0.3 ? 'furia' : '', 0.5);
  p.parte(F.ov(5.5, -36 - hy, 4.2, 4.6), PAL_OJO, { sombra: 1, luz: false });
  for (let a = 0; a < 2.8 * Math.PI; a += 0.42) { const r = 0.3 + a * 0.4; p.px(5.5 + Math.cos(a + (o.esp || 0)) * r, -36 - hy + Math.sin(a + (o.esp || 0)) * r * 0.9, '#9a30ff'); }
  p.plano(F.tr(2, -42.5 - hy, 9.5, -41.5 - hy, 0.6), OL);
  if (o.cara !== 'furia' && g < 0.3) p.plano(F.tr(-8.5, -40.5 - hy, -3, -41 - hy, 0.6), OL);
  // la corona, entre las orejas, con su gema roja
  p.parte(F.pol(-4.5, -45 - hy, 4.5, -45 - hy, 4.5, -51 - hy, 2.3, -48 - hy, 0, -53 - hy, -2.3, -48 - hy, -4.5, -51 - hy), P.oro, { sombra: 1 });
  p.px(0, -47 - hy, '#ff4b5c'); p.px(-3, -49.5 - hy, '#ffffff');
}
const fotoBunny = (t, c) => { const p = new Pincel(60, 72, 28, 68, t); bunny(p, Object.assign({ hy: 0, cara: '', esp: 0, paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- CyberMarine: armadura azul con el pecho encendido, casco con visor cian, hombreras y fusil de plasma ---------- */
const PAL_CYBER = {
  armadura: pal5('#3f78e6', '#2446a8', '#8ab8ff', '#10246a', '#0c1a50', '#d0e4ff', '#5ef2ff'),
  oscuro: pal5('#26407a', '#152548', '#4466a8', '#0b1228', '#060a1a', '#7a9ad8', '#3a8cff'),
  visor: pal5('#5ef2ff', '#1fa8c0', '#c8fdff', '#0f5a68', '#083a44', '#ffffff', '#ffffff'),
  metal: pal5('#c8d0e8', '#7d889e', '#f0f4ff', '#3a4262', '#262c44', '#ffffff', '#5ef2ff'),
};
function cybermarine(p, o) {
  const hy = o.hy || 0, P = PAL_CYBER, g = o.golpe || 0, [pi, pd] = pies(o);
  for (const [x, l] of [[-7, pi], [7, pd]]) { p.parte(F.rr(x - 4.5, -6 - l, 9, 6, 2), P.oscuro, { sombra: 1 }); p.parte(F.rr(x - 3.5, -20 - hy - l * 0.5, 7, 15, 2), P.armadura, { sombra: 1 }); }
  p.parte(F.rr(-12, -40 - hy, 24, 22, 5), P.armadura, { sombra: 2 });   // torso
  p.parte(F.re(-12, -21 - hy, 24, 3), P.oscuro, { sombra: 0 });   // cinturón
  p.px(0, -19.5 - hy, P.metal.l); p.px(-1, -19.5 - hy, P.metal.l);
  p.parte(F.rr(-8, -37 - hy, 16, 11, 3), P.oscuro, { sombra: 1 });   // peto
  p.parte(F.ov(0, -32 - hy, 3.2 + g, 3.2 + g), P.visor, { sombra: 0, luz: 2 });   // el núcleo encendido
  p.px(-0.5, -33 - hy, '#ffffff');
  for (const x of [-14, 14]) p.parte(F.ov(x, -38 - hy, 6.2, 5), P.armadura, { sombra: 2 });   // hombreras
  p.parte(F.tr(-14, -35 - hy, -17, -22 - hy, 3.2), P.armadura, { sombra: 1 });   // brazo izquierdo
  p.parte(F.ov(-17.5, -20 - hy, 3, 2.6), P.oscuro, { sombra: 1 });
  p.parte(F.tr(14, -35 - hy, 15, -25 - hy, 3.2), P.armadura, { sombra: 1 });   // brazo derecho
  const r = g * 3;   // el retroceso del fusil al disparar
  p.parte(F.tr(-7 - r, -22 - hy, 19 - r, -29 - hy, 2.7), P.metal, { sombra: 1 });   // el fusil, cruzado
  p.parte(F.rr(2 - r, -25 - hy, 5, 5, 1), P.oscuro, { sombra: 0 });   // cargador
  p.parte(F.tr(19 - r, -29 - hy, 26 - r, -31 - hy, 1.7), P.metal, { sombra: 1 });
  p.parte(F.ov(26.5 - r, -31.3 - hy, 2.2, 1.8), P.visor, { sombra: 0 });   // boca de plasma
  if (o.disparo || g > 0.4) { p.plano(F.ov(30 - r, -32 - hy, 4 + g * 2, 3 + g), '#c8fdff'); p.plano(F.ov(30 - r, -32 - hy, 2 + g, 1.5), '#ffffff'); }
  p.parte(F.ov(15 - r, -26 - hy, 3.2, 2.8), P.oscuro, { sombra: 1 });   // la mano en el fusil
  p.parte(F.ov(0, -52 - hy, 11, 10.5), P.armadura, { sombra: 2 });   // casco
  p.parte(F.rr(-6, -47 - hy, 12, 4, 2), P.oscuro, { sombra: 0 });   // mentonera
  p.parte(F.y(F.ov(0, -52 - hy, 11, 10.5), F.rr(-9, -56 - hy, 18, 6.5, 2.5)), P.visor, { sombra: 1 });   // visor
  if (o.cara === 'x') { p.plano(F.re(-6, -54 - hy, 5, 1), PUPILA); p.plano(F.re(1, -54 - hy, 5, 1), PUPILA); }
  else { p.px(-5, -54 - hy, '#ffffff'); p.px(-4, -54 - hy, '#ffffff'); p.px(5, -54.5 - hy, '#ffffff'); }
  p.plano(F.tr(-8, -60 - hy, -11, -66 - hy, 0.7), OL); p.px(-11, -66.5 - hy, '#ff4b5c');   // antena
}
const fotoCyber = (t, c) => { const p = new Pincel(72, 72, 34, 68, t); cybermarine(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- NecroLord: túnica morada hecha jirones, capucha con calavera de ojos verdes y báculo con un bug encima ---------- */
const PAL_NECRO = {
  tunica: pal5('#8a44e8', '#5024a8', '#b880ff', '#2a1058', '#1a0840', '#e0c8ff', '#ff4ae0'),
  hueso: pal5('#f6f0e8', '#bfb2a4', '#ffffff', '#5a4a40', '#3a2e28', '#ffffff', '#8affb0'),
  verde: pal5('#5cff8a', '#1f9a4e', '#c8ffd8', '#0f4a22', '#083018', '#ffffff', '#ffffff'),
  palo: pal5('#5a3a28', '#3a2214', '#8a5a3a', '#1e1008', '#120a04', '#b08060', '#8affb0'),
};
function necrolord(p, o) {
  const hy = o.hy || 0, P = PAL_NECRO, g = o.golpe || 0, s = Math.sin((o.paso || 0) * TAU) * 2;
  // la túnica, con el bajo en picos (ondea al andar)
  p.parte(F.pol(-15 - s, 0, -11, -5, -7 + s, 0, -3, -6, 1, 0, 5 - s, -5, 9, 0, 13, -4, 15 + s, 0, 14, -40 - hy, -14, -40 - hy), P.tunica, { sombra: 2 });
  p.parte(F.tr(-13, -34 - hy, -21, -20 - hy, 4.2), P.tunica, { sombra: 1 });   // mangas
  p.parte(F.tr(13, -34 - hy, 20 + g * 4, -22 - hy - g * 10, 4.2), P.tunica, { sombra: 1 });
  p.parte(F.ov(-21.5, -18.5 - hy, 3, 2.6), P.hueso, { sombra: 1 }); p.px(-22.5, -17 - hy, P.hueso.s); p.px(-20.5, -17 - hy, P.hueso.s);
  const bx = 24 + g * 4, by = -62 - hy - g * 6;
  p.parte(F.tr(bx, -4, bx, by, 1.7), P.palo, { sombra: 1 });   // el báculo (se alza al lanzar)
  p.parte(F.ov(bx, by - 3, 5 + g * 2, 5 + g * 2), P.verde, { sombra: 1, luz: 2 });   // el bug (orbe verde) que lo corona
  p.px(bx - 1.5, by - 4.5, '#ffffff'); p.plano(F.re(bx - 1, by - 3, 1, 1), PUPILA); p.plano(F.re(bx + 1, by - 3, 1, 1), PUPILA);
  p.plano(F.tr(bx - 3, by - 7, bx - 5, by - 10, 0.5), OL); p.plano(F.tr(bx + 3, by - 7, bx + 5, by - 10, 0.5), OL);
  if (g > 0.4) for (let a = 0; a < TAU; a += TAU / 6) p.px(bx + Math.cos(a) * (8 + g * 3), by - 3 + Math.sin(a) * (8 + g * 3), '#8affb0');
  p.parte(F.ov(bx - 1, -20 - hy - g * 6, 3, 2.6), P.hueso, { sombra: 1 });   // la mano en el báculo
  // hombros con pinchos de hueso
  for (const sg of [-1, 1]) { p.parte(F.ov(sg * 13, -39 - hy, 5.5, 4), P.tunica, { sombra: 2 }); p.plano(F.pol(sg * 13 - 2, -41 - hy, sg * 13 + 2, -41 - hy, sg * 15, -47 - hy), P.hueso.b); }
  // calavera en el pecho
  p.plano(F.ov(0, -31 - hy, 3, 3), P.hueso.b); p.px(-1, -31.5 - hy, P.tunica.s2); p.px(1, -31.5 - hy, P.tunica.s2); p.plano(F.re(-1.5, -29 - hy, 3, 1), P.tunica.s2);
  // capucha y cara de calavera
  p.parte(F.ov(0, -53 - hy, 13.5, 13.5), P.tunica, { sombra: 2 });
  p.parte(F.ov(0, -51 - hy, 9.5, 10), pal5('#1a0c30', '#0d0618', '#2a1448', '#060310'), { sombra: 0 });
  p.parte(F.ov(0, -50.5 - hy, 7.5, 7.5), P.hueso, { sombra: 1 });
  p.plano(F.ov(0, -47 - hy, 1.1, 1.4), '#1a0c30');   // el hueco de la nariz
  for (let x = -3; x <= 3; x += 2) p.px(x, -44 - hy, '#1a0c30');   // los dientes
  if (o.cara === 'x') { ojo(p, -3, -52 - hy, 2, 'x'); ojo(p, 3, -52 - hy, 2, 'x'); return; }
  for (const x of [-3.2, 3.2]) { p.parte(F.ov(x, -52 - hy, 2.3 + g * 0.6, 2.5 + g * 0.6), P.verde, { sombra: 0, luz: 2 }); p.px(x - 0.5, -52.5 - hy, '#ffffff'); }
  p.plano(F.tr(-6, -56 - hy, -1, -55 - hy, 0.6), '#0d0618'); p.plano(F.tr(1, -55 - hy, 6, -56 - hy, 0.6), '#0d0618');
}
const fotoNecro = (t, c) => { const p = new Pincel(72, 84, 34, 80, t); necrolord(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- Lola: coleta, auriculares de moderar el chat, delantal sobre la camiseta roja y su taza de café ---------- */
const PAL_LOLA = {
  piel: pal5('#f8d0a8', '#cf9a6c', '#ffe8d0', '#7a4a2a', '#5a3018', '#fff4e8', '#ff9ad0'),
  pelo: pal5('#7a4826', '#48281a', '#a8703e', '#24120a', '#140a04', '#d09a60', '#ff8ac0'),
  camiseta: pal5('#ff4a48', '#a82a30', '#ff9a8a', '#5a1414', '#3a0a0a', '#ffd0c0', '#ff80d0'),
  delantal: pal5('#fff6e4', '#d4c2a4', '#ffffff', '#6a5a44', '#4a3e2c', '#ffffff', '#ffb0e0'),
  vaquero: pal5('#4a78d0', '#2c4a8a', '#80a8f0', '#16244a', '#0c1630', '#b0d0ff', '#5ef2ff'),
  taza: pal5('#fff6ea', '#d6c8b4', '#ffffff', '#6a5a48'),
};
function lola(p, o) {
  const hy = o.hy || 0, P = PAL_LOLA, [pi, pd] = pies(o);
  for (const [x, l] of [[-5, pi], [5, pd]]) { p.parte(F.rr(x - 3.5, -5 - l, 7, 5, 1.5), P.pelo, { sombra: 1 }); p.parte(F.rr(x - 3.5, -20 - hy - l * 0.5, 7, 16, 2), P.vaquero, { sombra: 1 }); }
  p.parte(F.rr(-11, -42 - hy, 22, 24, 4), P.camiseta, { sombra: 2 });   // camiseta
  p.parte(F.pol(-9, -38 - hy, 9, -38 - hy, 11, -16 - hy, -11, -16 - hy), P.delantal, { sombra: 2 });   // delantal
  p.parte(F.rr(-5, -27 - hy, 10, 6, 1), P.delantal, { sombra: 1, luz: false });   // el bolsillo
  p.plano(F.tr(-6, -42 - hy, -6, -38 - hy, 0.6), P.delantal.s); p.plano(F.tr(6, -42 - hy, 6, -38 - hy, 0.6), P.delantal.s);   // tirantes
  p.parte(F.tr(-11, -38 - hy, -15, -24 - hy, 3), P.piel, { sombra: 1 });   // brazos
  p.parte(F.tr(11, -38 - hy, 15, -26 - hy, 3), P.piel, { sombra: 1 });
  p.parte(F.rr(12, -31 - hy, 8, 8, 1.5), P.taza, { sombra: 1 });   // la taza
  p.plano(F.ov(20.5, -27 - hy, 2.2, 2.2), P.taza.o); p.plano(F.ov(20.5, -27 - hy, 1, 1), P.taza.b);
  p.plano(F.re(13, -30 - hy, 6, 1), '#6a3a1c');
  for (const [x, y] of [[14, -34], [16, -36], [18, -34]]) p.px(x, y - hy - (o.vapor || 0), '#ffffff');   // el vapor
  p.parte(F.ov(0, -52 - hy, 10.5, 10.5), P.piel, { sombra: 2 });   // cabeza
  p.parte(F.y(F.ov(0, -54 - hy, 11.5, 10), F.rr(-12, -66 - hy, 24, 12, 4)), P.pelo, { sombra: 2 });   // el pelo
  p.parte(F.tr(9, -58 - hy, 17, -46 - hy + hy, 3.5, 2.5), P.pelo, { sombra: 1 });   // la coleta
  p.parte(F.ov(-10.5, -52 - hy, 2.5, 3), pal5('#3a3a4a', '#1e1e2a', '#6a6a7a', '#0a0a12', '#050508', '#9a9aaa', '#5ef2ff'), { sombra: 1 });   // auricular
  p.plano(F.tr(-10, -50 - hy, -5, -46 - hy, 0.7), '#1e1e2a'); p.px(-4.5, -45.5 - hy, '#ff4b5c');   // el micro
  p.plano(F.tr(-10, -58 - hy, 0, -63 - hy, 0.7), '#1e1e2a');   // la diadema
  if (o.cara === 'x') { ojo(p, -4, -53 - hy, 2, 'x'); ojo(p, 4, -53 - hy, 2, 'x'); return; }
  ojo(p, -4, -53 - hy, 2.2, '', -0.3); ojo(p, 4, -53 - hy, 2.2, '', -0.3);
  boca(p, 0, -47 - hy, o.cara === 'grito' ? 'grito' : 'risa', 2.5);
  p.px(-8, -49 - hy, '#ff9ad0'); p.px(8, -49 - hy, '#ff9ad0');
}
const fotoLola = (t, c) => { const p = new Pincel(56, 72, 26, 68, t); lola(p, Object.assign({ hy: 0, cara: '', vapor: 0, paso: 0 }, c)); return p.lienzo(); };

/* ---------- el bug de NecroLord: una mancha verde con ojos saltones, antenas y seis patas ---------- */
const PAL_BUG = pal5('#58f070', '#1f9a3e', '#c0ffa0', '#0f4a22', '#083018', '#ffffff', '#8affb0');
function bug(p, o) {
  const hy = o.hy || 0, g = o.golpe || 0, s = Math.sin((o.paso || 0) * TAU) * 1.5;
  for (const a of [-1, 1]) for (const [x, y] of [[6, -4], [8, -7], [7, -10]]) p.plano(F.tr(a * x, y - hy, a * (x + 4), y + 2 - hy + s * a, 0.7), OL);
  p.plano(F.tr(-3, -13 - hy, -6, -19 - hy, 0.6), OL); p.plano(F.tr(3, -13 - hy, 7, -19 - hy, 0.6), OL);
  p.parte(F.ov(g * 4, -8 - hy, 9, 6.5), PAL_BUG, { sombra: 2 });
  p.plano(F.ov(g * 4, -7 - hy, 5, 3), PAL_BUG.s);
  if (g > 0.4) { p.plano(F.pol(8, -9 - hy, 13, -11 - hy, 10, -7 - hy), '#ffffff'); p.plano(F.pol(8, -5 - hy, 13, -3 - hy, 10, -7 - hy), '#ffffff'); }   // las mandíbulas
  ojo(p, -3.5 + g * 4, -10 - hy, 2.2, o.cara, 0.3); ojo(p, 3.5 + g * 4, -10 - hy, 2.2, o.cara, 0.3);
  p.px(-6.5, -19.5 - hy, '#c0ffa0'); p.px(7.5, -19.5 - hy, '#c0ffa0');
}
const fotoBug = (t, c) => { const p = new Pincel(36, 30, 18, 28, t); bug(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };
