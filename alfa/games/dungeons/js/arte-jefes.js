// Fans of Dungeons · Los Jefes de planta en pixel art nuevo, el doble de grandes que un enemigo: SurvivalBot (planta 4), el
// Becario del Mes (planta 8), Parche Día 1 (planta 12) y el CEO (planta 13). Misma pose que los demás: hy, paso, golpe y cara.
'use strict';

/* ---------- SurvivalBot: el robot de los despidos; enorme, gris, con corbata, pinzas y una carta de despido en cada mano ---------- */
function survivalbot(p, o) {
  const hy = o.hy || 0, P = PAL_ROBOT, g = o.golpe || 0, [pi, pd] = pies(o), carta = PAL_ROBOT.taza;
  for (const [x, l] of [[-12, pi], [12, pd]]) { p.parte(F.rr(x - 8, -7 - l, 16, 7, 2.5), P.oscuro, { sombra: 1 }); p.parte(F.rr(x - 6, -26 - hy - l * 0.5, 12, 20, 2.5), P.gris, { sombra: 2 }); p.plano(F.re(x - 4, -16 - hy, 8, 1), P.oscuro.b); }
  p.parte(F.rr(-22, -62 - hy, 44, 38, 6), P.gris, { sombra: 2 });   // el torso
  p.parte(F.rr(-16, -56 - hy, 32, 14, 3), P.oscuro, { sombra: 1 });   // la pantalla del pecho
  for (let i = 0; i < 6; i++) p.plano(F.re(-13 + i * 5, -52 - hy, 3, 6), i < (o.barra || 4) ? P.rojo.b : P.pantalla.b);   // barra de despidos
  p.plano(F.pol(-3, -62 - hy, 3, -62 - hy, 2, -40 - hy, -2, -40 - hy), P.corbata.b); p.plano(F.re(-2, -60 - hy, 4, 3), P.corbata.s);   // corbata
  p.plano(F.re(-20, -40 - hy, 40, 2), P.oscuro.b); for (let x = -18; x < 18; x += 6) p.px(x, -39 - hy, P.gris.l);   // remaches
  for (const s of [-1, 1]) {   // brazos con pinza y una carta de despido; el derecho se lanza al golpear
    const ex = s > 0 ? g * 12 : 0, ey = s > 0 ? g * 10 : 0;
    p.parte(F.ov(s * 24, -58 - hy, 8, 7), P.gris, { sombra: 2 });
    p.parte(F.tr(s * 26, -54 - hy, s * 32 + ex, -30 - hy - ey, 5), P.oscuro, { sombra: 1 });
    p.parte(F.tr(s * 32 + ex, -30 - hy - ey, s * 36 + ex, -24 - hy - ey, 3.2), P.gris, { sombra: 1 }); p.parte(F.tr(s * 32 + ex, -30 - hy - ey, s * 28 + ex, -22 - hy - ey, 3.2), P.gris, { sombra: 1 });
    p.parte(F.rr(s * 32 - 6 + ex, -24 - hy - ey, 12, 9, 1), carta, { sombra: 1 }); p.plano(F.re(s * 32 - 4 + ex, -21 - hy - ey, 8, 1), P.rojo.b); p.plano(F.re(s * 32 - 4 + ex, -18.5 - hy - ey, 6, 1), P.oscuro.b);
  }
  p.parte(F.rr(-15, -88 - hy, 30, 26, 5), P.gris, { sombra: 2 });   // la cabeza
  p.parte(F.rr(-12, -84 - hy, 24, 12, 3), P.pantalla, { sombra: 1, luz: false });   // el visor
  if (o.cara === 'x') { p.plano(F.re(-9, -79 - hy, 6, 1), P.rojo.b); p.plano(F.re(3, -79 - hy, 6, 1), P.rojo.b); }
  else { p.plano(F.pol(-10, -81 - hy, -3, -79 - hy, -3, -76 - hy, -10, -76 - hy), P.rojo.b); p.plano(F.pol(10, -81 - hy, 3, -79 - hy, 3, -76 - hy, 10, -76 - hy), P.rojo.b); p.px(-9, -80 - hy, '#ffd0d0'); p.px(9, -80 - hy, '#ffd0d0'); }
  p.plano(F.re(-6, -68 - hy, 12, 2), P.oscuro.b); for (let x = -5; x < 6; x += 2) p.px(x, -67 - hy, g > 0.5 ? P.cian.b : P.rojo.b);   // la rejilla de la boca
  for (const s of [-1, 1]) { p.parte(F.rr(s * 16 - 2, -82 - hy, 4, 10, 1), P.oscuro, { sombra: 0 }); p.plano(F.tr(s * 10, -88 - hy, s * 13, -96 - hy, 0.8), OL); p.plano(F.ov(s * 13.5, -97 - hy, 2, 2), P.rojo.b); }   // orejas y antenas
  p.plano(F.re(-10, -90 - hy, 20, 2), P.oscuro.b);
}
const fotoSurvival = (t, c) => { const p = new Pincel(104, 108, 50, 104, t); survivalbot(p, Object.assign({ hy: 0, cara: '', barra: 4, paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- El Becario del Mes: un Becario grande, placa de oro, corbata nueva y una torre de tazas que lanza ---------- */
function becariomes(p, o) {
  const hy = o.hy || 0, P = PAL_ROBOT, g = o.golpe || 0;
  p.sx *= 1.45; p.sy *= 1.45;
  becario(p, Object.assign({}, o, { vapor: 0, golpe: g * 0.5 }));
  p.parte(F.ov(-6, -24 - hy, 3.2, 3.2), P.amarillo, { sombra: 1, luz: 2 }); p.px(-7, -25 - hy, '#ffffff');   // la placa de oro
  p.plano(F.re(-7, -24 - hy, 3, 1), P.amarillo.s2);
  p.sx /= 1.45; p.sy /= 1.45;
  for (let i = 0; i < 4; i++) {   // la torre de tazas; al golpear, la de arriba sale volando
    const vuela = i === 3 ? g : 0, y = -34 - i * 9 - hy - vuela * 14, x = 22 + vuela * 16;
    p.parte(F.rr(x, y - 8, 10, 9, 2), P.taza, { sombra: 1 }); p.plano(F.ov(x + 11, y - 3.5, 2.5, 2.5), P.taza.o); p.plano(F.ov(x + 11, y - 3.5, 1.2, 1.2), P.taza.b);
    p.plano(F.re(x + 1, y - 7, 8, 1), '#6a3a1c');
  }
  for (const [x, y] of [[24, -74], [27, -77], [30, -74]]) p.px(x, y - hy - (o.vapor || 0), '#ffffff');
}
const fotoBecarioMes = (t, c) => { const p = new Pincel(96, 96, 44, 92, t); becariomes(p, Object.assign({ hy: 0, cara: '', vapor: 0, abogado: false, paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- Parche Día 1: robot remendado con vendas y tiritas, un «1» enorme en el pecho y una barra de descarga que nunca acaba ---------- */
function parche(p, o) {
  const hy = o.hy || 0, P = PAL_ROBOT, g = o.golpe || 0, [pi, pd] = pies(o);
  const venda = pal5('#f2e8d4', '#bda98a', '#fffaf0', '#5a4a34', '#3a2e20', '#ffffff', '#5ef2ff'), tirita = pal5('#f0c0a0', '#b8826a', '#ffdcc8', '#6a4030', '#4a2a20', '#fff0e8', '#ff9ad0');
  for (const [x, l] of [[-11, pi], [11, pd]]) { p.parte(F.rr(x - 7, -7 - l, 14, 7, 2.5), P.oscuro, { sombra: 1 }); p.parte(F.rr(x - 5.5, -26 - hy - l * 0.5, 11, 20, 2.5), P.gris, { sombra: 2 }); }
  p.plano(F.pol(-16, -20 - hy, -6, -24 - hy, -6, -14 - hy, -16, -10 - hy), venda.b);   // venda en la pierna
  p.parte(F.rr(-20, -60 - hy, 40, 36, 7), P.gris, { sombra: 2 });   // el torso
  p.parte(F.pol(-20, -50 - hy, 20, -42 - hy, 20, -36 - hy, -20, -44 - hy), venda, { sombra: 0 });   // la venda cruzada
  p.parte(F.pol(-20, -34 - hy, 20, -42 - hy, 20, -48 - hy, -20, -40 - hy), venda, { sombra: 0 });
  p.parte(F.rr(-6, -58 - hy, 12, 18, 2), P.pantalla, { sombra: 1, luz: false });   // el «1»
  p.plano(F.un(F.re(-1, -56 - hy, 3, 14), F.pol(-4, -53 - hy, 2, -56 - hy, 2, -53 - hy)), g > 0.5 ? P.cian.b : P.rojo.b);
  p.parte(F.rr(10, -34 - hy, 8, 4, 1), tirita, { sombra: 0 }); p.px(12, -32 - hy, tirita.s); p.px(15, -32 - hy, tirita.s);   // tiritas
  p.parte(F.rr(-17, -56 - hy, 5, 8, 1), tirita, { sombra: 0 });
  for (const s of [-1, 1]) {   // brazos: uno vendado, otro con un cable suelto (que se lanza al golpear)
    const ex = s > 0 ? g * 10 : 0, ey = s > 0 ? g * 12 : 0;
    p.parte(F.ov(s * 21, -56 - hy, 7, 6), P.gris, { sombra: 2 });
    p.parte(F.tr(s * 23, -52 - hy, s * 29 + ex, -30 - hy - ey, 4.5), s < 0 ? venda : P.oscuro, { sombra: 1 });
    p.parte(F.ov(s * 29.5 + ex, -27 - hy - ey, 4.5, 4), P.gris, { sombra: 1 });
  }
  const cx = 31 + g * 10, cy = -30 - hy - g * 12;
  p.plano(F.tr(cx, cy, cx + 5, cy + 8, 0.8), P.amarillo.b); p.px(cx + 5.5, cy + 9, '#ffffff'); p.px(cx + 4, cy + 11, P.cian.b);   // el cable con chispas
  if (g > 0.4) for (let a = 0; a < TAU; a += TAU / 6) p.px(cx + 5 + Math.cos(a) * (5 + g * 4), cy + 9 + Math.sin(a) * (5 + g * 4), a < 3 ? '#ffffff' : P.cian.b);
  p.parte(F.rr(-14, -84 - hy, 28, 24, 5), P.gris, { sombra: 2 });   // la cabeza
  p.parte(F.pol(-14, -70 - hy, 14, -76 - hy, 14, -72 - hy, -14, -66 - hy), venda, { sombra: 0 });   // venda en la cabeza
  p.parte(F.rr(-11, -82 - hy, 22, 9, 3), P.pantalla, { sombra: 1, luz: false });
  if (o.cara === 'x') { p.plano(F.re(-8, -78 - hy, 5, 1), P.rojo.b); p.plano(F.re(3, -78 - hy, 5, 1), P.rojo.b); }
  else {
    for (let i = 0; i < 8; i++) p.plano(F.re(-9 + i * 2.4, -80 - hy, 1.5, 4), i < (o.carga || 5) ? P.cian.b : P.pantalla.l);   // la barra de descarga en el visor
    p.plano(F.re(7, -79 - hy, 2, 2), P.rojo.b);
  }
  if (o.error || g > 0.6) { p.plano(F.rr(-9, -92 - hy, 18, 7, 1), '#ffffff'); p.plano(F.re(-7, -90 - hy, 14, 3), P.rojo.b); }
  p.plano(F.tr(8, -84 - hy, 12, -92 - hy, 0.8), OL); p.plano(F.ov(12.5, -93 - hy, 2, 2), P.rojo.b);
}
const fotoParche = (t, c) => { const p = new Pincel(104, 104, 50, 100, t); parche(p, Object.assign({ hy: 0, cara: '', carga: 5, error: false, paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- El CEO: traje negro, gafas de sol, cadenas de oro, saco de monedas y la diapositiva de los despidos ---------- */
const PAL_CEO = {
  traje: pal5('#2c2c44', '#17171f', '#484860', '#0a0a10', '#050508', '#707090', '#ff5ae0'),
  camisa: pal5('#fff8f0', '#d6c8b4', '#ffffff', '#6a5a48', '#4a3e30', '#ffffff', '#ffb0e0'),
  piel: pal5('#f4d0a8', '#c49470', '#ffe4c8', '#6a4020', '#4a2a14', '#fff4e8', '#ff9ad0'),
  oro: PAL_COFRE.oro,
  saco: pal5('#b07040', '#6e4220', '#dca068', '#3a200c', '#241204', '#f0c890', '#fffa80'),
};
function ceo(p, o) {
  const hy = o.hy || 0, P = PAL_CEO, g = o.golpe || 0, [pi, pd] = pies(o);
  for (const [x, l] of [[-8, pi], [8, pd]]) { p.parte(F.rr(x - 6, -5 - l, 12, 5, 2), pal5('#1a1210', '#0a0806', '#3a2a20', '#040202', '#020101', '#5a4a40', '#ff5ae0'), { sombra: 1 }); p.parte(F.rr(x - 5, -30 - hy - l * 0.5, 10, 26, 2), P.traje, { sombra: 1 }); }
  p.parte(F.rr(-18, -66 - hy, 36, 38, 6), P.traje, { sombra: 2 });   // la chaqueta
  p.parte(F.pol(-7, -66 - hy, 7, -66 - hy, 6, -36 - hy, -6, -36 - hy), P.camisa, { sombra: 1 });   // la camisa
  p.plano(F.pol(-2, -64 - hy, 2, -64 - hy, 1.5, -44 - hy, -1.5, -44 - hy), PAL_ROBOT.corbata.b);   // corbata roja
  p.plano(F.pol(-18, -66 - hy, -7, -66 - hy, -4, -50 - hy, -12, -50 - hy), P.traje.l); p.plano(F.pol(18, -66 - hy, 7, -66 - hy, 4, -50 - hy, 12, -50 - hy), P.traje.l);   // solapas
  for (let i = 0; i < 7; i++) p.px(-6 + i * 2, -60 - hy + Math.abs(i - 3), P.oro.b);   // la cadena de oro
  p.plano(F.ov(0, -55 - hy, 2, 2), P.oro.b); p.px(-0.5, -55.5 - hy, '#ffffff');
  p.parte(F.tr(-18, -60 - hy, -24, -36 - hy, 4.5), P.traje, { sombra: 1 }); p.parte(F.ov(-25, -33 - hy, 4, 3.6), P.piel, { sombra: 1 });   // brazo con el saco
  p.parte(F.ov(-28, -22 - hy, 9, 10), P.saco, { sombra: 2 }); p.plano(F.re(-30, -31 - hy, 5, 2), P.saco.s); p.plano(F.re(-30, -22 - hy, 4, 1), P.oro.b); p.px(-27, -20 - hy, P.oro.b); p.px(-26, -24 - hy, P.oro.l);
  const ex = g * 10, ey = g * 8;   // el brazo de la diapositiva se lanza al golpear
  p.parte(F.tr(18, -60 - hy, 24 + ex, -40 - hy - ey, 4.5), P.traje, { sombra: 1 }); p.parte(F.ov(25 + ex, -37 - hy - ey, 4, 3.6), P.piel, { sombra: 1 });
  p.parte(F.rr(20 + ex, -56 - hy - ey, 18, 13, 1.5), P.camisa, { sombra: 1 });
  p.plano(F.re(22 + ex, -54 - hy - ey, 8, 1), PAL_ROBOT.rojo.b); for (let i = 0; i < 4; i++) p.plano(F.re(22 + i * 4 + ex, -50 - hy - ey + (3 - i) * 1.5, 3, 5 - (3 - i) * 1.5), i === 3 ? PAL_ROBOT.verde.b : PAL_ROBOT.rojo.b);   // la gráfica que baja
  if (g > 0.4) for (let a = 0; a < TAU; a += TAU / 7) p.px(29 + ex + Math.cos(a) * (13 + g * 4), -50 - hy - ey + Math.sin(a) * (9 + g * 3), a < 3 ? '#ffffff' : '#ff5ae0');
  p.parte(F.ov(0, -82 - hy, 13, 13), P.piel, { sombra: 2 });   // la cabeza
  p.parte(F.y(F.ov(0, -86 - hy, 13.5, 11), F.rr(-14, -98 - hy, 28, 12, 4)), pal5('#d0d0d8', '#8a8a98', '#f0f0f6', '#44444e', '#2a2a32', '#ffffff', '#5ef2ff'), { sombra: 1 });   // el pelo canoso
  p.parte(F.rr(-11, -88 - hy, 22, 6, 2), pal5('#15151c', '#08080c', '#2a2a36', '#030305', '#010102', '#404050', '#ff5ae0'), { sombra: 0 });   // las gafas de sol
  p.px(-8, -87 - hy, '#6a6a80'); p.px(4, -87 - hy, '#6a6a80');
  if (o.cara === 'x') { p.plano(F.re(-8, -85 - hy, 5, 1), PAL_ROBOT.rojo.b); p.plano(F.re(3, -85 - hy, 5, 1), PAL_ROBOT.rojo.b); }
  p.plano(F.ov(-11, -82 - hy, 1.5, 2), P.piel.s); p.plano(F.ov(11, -82 - hy, 1.5, 2), P.piel.s);   // orejas
  if (o.cara === 'grito' || g > 0.5) boca(p, 0, -74 - hy, 'grito', 3.5); else { p.plano(F.tr(-4, -73 - hy, 4, -74 - hy, 0.7), '#5a1530'); p.plano(F.ov(0, -75.5 - hy, 1, 1), P.piel.s); }
  p.px(-6, -70 - hy, P.piel.s); p.px(6, -70 - hy, P.piel.s);   // la papada
}
const fotoCeo = (t, c) => { const p = new Pincel(100, 108, 48, 104, t); ceo(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

function creaFigurasJefes() {
  figura('survivalbot', fotoSurvival, { esc: 0.95 });
  figura('becariomes', fotoBecarioMes, { esc: 0.95, c: { vapor: 1 } });
  figura('parche', fotoParche, { esc: 0.95 });
  figura('ceo', fotoCeo, { esc: 0.95 });
}
