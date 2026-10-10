// Fans of Roguelite · Los No-Muertos del Cementerio de juegos en pixel art: SkeletonCrew, CrunchZombie, GhostMage, el mini
// jefe StitchBrute y el jefe NecroLord corrupto. Colores y piezas de sus dibujos del juego (core/js/serie/arte/nomuertos.js).
// Se dibujan mirando a la derecha y se guardan en espejo.
'use strict';

const PAL_N = {
  hueso:   pal('#efeadf', '#b8ad96', '#ffffff', '#5a5040'),
  huesoF:  pal('#cfc6b2', '#9a907a', '#e8e2d2', '#4a4030'),
  panuelo: pal('#e63946', '#a8202e', '#ff7a84', '#4a0a14'),
  piel:    pal('#8fbf6a', '#5f8a46', '#c4e89a', '#2f4a20'),
  pielF:   pal('#75a356', '#4c7238', '#a8d07e', '#24381a'),
  camisa:  pal('#bcd3e8', '#8aa2c0', '#e6f0fa', '#3a4a62'),
  pantalon: pal('#4a5578', '#323a56', '#6a76a0', '#1a2036'),
  tunica:  pal('#6a3fb0', '#4a2880', '#9a6ae0', '#24104a'),
  cara:    pal('#cdf6f0', '#8fd0c8', '#ffffff', '#2a6a64'),
  cosido:  pal('#8aa07a', '#5f7454', '#b8cca8', '#2a3a24'),
  cosido2: pal('#b89a8a', '#8a6a5e', '#dcc0b0', '#4a3028'),
  necro:   pal('#3b2457', '#2a1840', '#5a3a80', '#140a20'),
  necroO:  pal('#4a5677', '#323a56', '#7a88b0', '#1a2036'),
  madera:  pal('#6b4a2e', '#4a3020', '#8f6a46', '#2a1a10'),
};
const CIAN = '#5ef2d0';
const pierna = (p, x0, y0, x1, y1, r, pl, pie) => { p.parte(F.tr(x0, y0, x1, y1, r), pl, { sombra: 1 }); if (pie) p.parte(F.ov(x1 + 0.6, y1 + 0.2, r + 0.8, 1.5), pie, { sombra: 0 }); };

/* ---------- SkeletonCrew: esqueleto pirata con pañuelo y sable ---------- */
function esqueleto(p, o) {
  const P = PAL_N, d = o.dy, Y = y => y + d, U = f => F.mueve(f, 0, d);
  pierna(p, -2, Y(-9), -3 + o.la, -1.4, 1, P.huesoF, P.huesoF);
  pierna(p, 2, Y(-9), 3 + o.lb, -1.4, 1, P.hueso, P.hueso);
  p.parte(F.tr(-3, Y(-17), -6, Y(-11), 1), P.huesoF, { sombra: 0 });
  p.parte(U(F.ov(0, -9, 3.6, 2)), P.hueso, { sombra: 0 });
  p.parte(U(F.ov(0, -14, 4.6, 4.8)), P.hueso, { sombra: 1 });
  for (const y of [-15.5, -13.5, -11.5]) p.plano(U(F.re(-3, y, 6, 0.9)), '#5a5040');
  p.plano(U(F.re(-0.4, -18, 1, 9)), '#5a5040');
  p.parte(U(F.ov(1, -22, 5.6, 5.2)), P.hueso, { sombra: 2 });
  p.parte(U(F.rr(-0.5, -19, 6, 3.4, 1)), P.hueso, { sombra: 1 });
  for (const x of [1, 3]) p.px(x, Y(-17.6 - (o.boca ? 1 : 0)), '#5a5040');
  if (o.cara === 'x') { for (const cx of [2, 5]) { p.px(cx - 0.5, Y(-23), OL); p.px(cx + 0.5, Y(-22), OL); p.px(cx + 0.5, Y(-23), OL); p.px(cx - 0.5, Y(-22), OL); } }
  else for (const cx of [2.2, 5.2]) { p.plano(U(F.ov(cx, -22.4, 1.3, 1.6)), '#1a1022'); p.px(cx, Y(-22.6), CIAN); }
  p.px(3.8, Y(-20.2), '#1a1022');
  p.parte(U(F.un(F.y(F.ov(1, -22, 6, 5.6), F.re(-10, -30, 20, 6.4)), F.pol(-4.6, -24.4, -8.5, -22.6, -6.6, -21))), P.panuelo, { sombra: 1 });
  p.px(3, Y(-25.4), '#ffffff');
  const a = o.sa, hx = o.mx, hy = Y(o.my);
  p.parte(F.tr(3, Y(-16), hx, hy, 1), P.hueso, { sombra: 0 });
  p.parte(F.tr(hx + Math.cos(a) * 1.5, hy + Math.sin(a) * 1.5, hx + Math.cos(a) * 10, hy + Math.sin(a) * 10 - Math.cos(a) * 1, 1.5, 0.6), PAL_E.metal, { sombra: 0 });
  p.px(hx, hy, '#ffcb3d'); p.px(hx + Math.cos(a + 1.57), hy + Math.sin(a + 1.57), '#ffcb3d');
  p.parte(F.ov(hx, hy, 1.4, 1.4), P.hueso, { sombra: 0 });
}
const fotoEsq = (t, c) => { const p = new Pincel(40, 38, 20, 34, Object.assign({ espejo: true }, t)); esqueleto(p, Object.assign({ dy: 0, la: 0, lb: 0, mx: 7, my: -13, sa: -0.9, cara: '', boca: false }, c)); return p.lienzo(); };
function creaEsqueleto() {
  const S = SPR.esqueleto = {}, L = [[-2, 2], [0, 0], [2, -2], [0, 0]];
  S.andar = L.map(([la, lb], f) => fotoEsq({}, { la, lb, dy: f % 2 ? -1 : 0, mx: 7 - la * 0.5, my: -13 + (f % 2) }));
  S.quieto = [0, 1].map(f => fotoEsq({ sy: f ? 1.03 : 1 }, { boca: !!f }));
  S.carga = fotoEsq({ inc: -0.25, sx: 1.06, sy: 0.94 }, { mx: 0, my: -24, sa: -2.4, boca: true });
  S.golpe = fotoEsq({ inc: 0.3, sx: 1.12, sy: 0.92 }, { mx: 9, my: -14, sa: 0.3, la: -2, lb: 2, boca: true });
  S.dano = fotoEsq({ inc: -0.3 }, { cara: 'x', mx: 4, my: -10, sa: 1.4 });
}

/* ---------- CrunchZombie: programador zombi con corbata y tarjeta ---------- */
function zombi(p, o) {
  const P = PAL_N, d = o.dy, Y = y => y + d, U = f => F.mueve(f, 0, d);
  pierna(p, -2.5, Y(-11), -3 + o.la, -1.6, 2.1, P.pantalon, pal('#3a2a20', '#2a1a10', '#5a4030', '#140a06'));
  pierna(p, 2.5, Y(-11), 3 + o.lb, -1.6, 2.1, P.pantalon, pal('#3a2a20', '#2a1a10', '#5a4030', '#140a06'));
  p.parte(F.tr(-2, Y(-22), o.bx, Y(o.by), 1.8), P.pielF, { sombra: 1 });
  p.parte(U(F.pol(-6.5, -25, 6.5, -25, 7, -11, 5, -9.5, 3, -11, 0.5, -9.2, -2, -11, -4.5, -9.4, -7, -11)), P.camisa, { sombra: 2 });
  p.parte(U(F.pol(0, -24.6, 2.2, -24.6, 3, -15.5, 1.1, -13.4, -0.8, -15.5)), PAL_E.rojo, { sombra: 1 });
  p.plano(U(F.re(-5, -20, 3.6, 4)), '#ffffff'); p.plano(U(F.re(-5, -20, 3.6, 1.2)), '#2e8bff');
  p.plano(U(F.un(F.re(-6, -12, 1, 2), F.re(4, -11.5, 1, 2))), '#8aa2c0');
  p.parte(U(F.ov(1.5, -30.5, 6, 5.6)), P.piel, { sombra: 2 });
  p.plano(U(F.un(F.pol(-4.5, -33, -2, -37, 0, -34), F.pol(-1, -34.5, 2, -38, 3, -34.8), F.pol(2.5, -34.6, 6, -36.6, 5.5, -33))), '#3a2a20');
  if (o.cara === 'x') { for (const cx of [2, 5.5]) { p.px(cx - 0.5, Y(-31.5), OL); p.px(cx + 0.5, Y(-30.5), OL); p.px(cx + 0.5, Y(-31.5), OL); p.px(cx - 0.5, Y(-30.5), OL); } }
  else { p.parte(U(F.ov(4.2, -31.2, 1.9, 2.1)), PAL_OJO, { sombra: 0, luz: false }); p.px(4.8, Y(-31), OL); p.px(1, Y(-31), OL); p.px(4.2, Y(-28.8), '#7a5aa0'); }
  p.plano(U(F.ov(4.5, -27.2, o.boca ? 2 : 1.6, o.boca ? 1.6 : 0.8)), '#2a1018');
  if (o.boca) p.px(5, Y(-25.6), '#c4e89a');
  p.parte(F.tr(3, Y(-21), o.mx, Y(o.my), 1.9), P.piel, { sombra: 1 });
  p.parte(F.ov(o.mx + 0.5, Y(o.my), 2, 1.8), P.piel, { sombra: 0 });
}
const fotoZombi = (t, c) => { const p = new Pincel(44, 46, 22, 42, Object.assign({ espejo: true }, t)); zombi(p, Object.assign({ dy: 0, la: 0, lb: 0, mx: 11, my: -20, bx: 9, by: -22, cara: '', boca: false }, c)); return p.lienzo(); };
function creaZombi() {
  const S = SPR.zombi = {}, L = [[-2, 2], [0, 0], [2, -2], [0, 0]];
  S.andar = L.map(([la, lb], f) => fotoZombi({ inc: 0.1 }, { la, lb, dy: f % 2 ? -1 : 0, my: -20 + (f % 2 ? 1 : -1), by: -22 + (f % 2 ? -1 : 1) }));
  S.quieto = [0, 1].map(f => fotoZombi({ sy: f ? 1.03 : 1, inc: 0.06 }, { boca: !!f, my: -20 + f }));
  S.carga = fotoZombi({ inc: -0.15, sx: 1.06, sy: 0.95 }, { mx: 6, my: -32, bx: 3, by: -33, boca: true });
  S.golpe = fotoZombi({ inc: 0.3, sx: 1.12, sy: 0.92 }, { mx: 14, my: -21, bx: 12, by: -23, boca: true, la: -2, lb: 2 });
  S.dano = fotoZombi({ inc: -0.3 }, { cara: 'x', mx: 6, my: -15, bx: 4, by: -17 });
}

/* ---------- GhostMage: mago fantasma con sombrero, libro y orbe de hielo ---------- */
function fantasma(p, o) {
  const P = PAL_N, w = o.ola;
  p.parte(F.rr(-12, -18, 6, 7.5, 1), P.tunica, { sombra: 1 }); p.plano(F.re(-9.4, -18, 1, 7.5), '#ffcb3d');
  p.parte(F.pol(-7, -24, 7, -24, 8, -9, 6, -2 + w, 3, -6, 0, -1 - w, -3, -6, -6, -2 + w, -8, -9), P.tunica, { sombra: 2 });
  p.plano(F.pol(-1, -24, 2, -24, 3, -6, 0, -4, -2, -6), '#4a2880');
  p.parte(F.rr(-7.5, -16, 15, 2.6, 1), P.necroO, { sombra: 0 }); p.px(0.5, -15, '#ffcb3d');
  p.parte(F.ov(1, -28, 6.2, 5.8), P.cara, { sombra: 2 });
  p.parte(F.menos(F.ov(0.5, -28.4, 8, 7.4), F.ov(2, -27.4, 5.6, 5.2)), P.tunica, { sombra: 1 });
  p.parte(F.pol(-7, -33, 8.5, -33, 4, -40, 1, -46, -1, -44, 0, -40), P.tunica, { sombra: 1 });
  p.parte(F.rr(-8, -34.5, 17, 3, 1), P.tunica, { sombra: 0 });
  p.plano(estrella(2.5, -38.5, 2, 0.9), '#ffcb3d');
  if (o.cara === 'x') { for (const cx of [1.5, 4.8]) { p.px(cx - 0.5, -29, '#1a1022'); p.px(cx + 0.5, -28, '#1a1022'); p.px(cx + 0.5, -29, '#1a1022'); p.px(cx - 0.5, -28, '#1a1022'); } }
  else for (const cx of [1.6, 4.8]) { p.plano(F.ov(cx, -28.5, 1.2, 1.9), '#1a1022'); p.px(cx, -29.2, CIAN); }
  p.plano(F.ov(3.4, -25.2, 1, o.boca ? 1.2 : 0.6), '#1a1022');
  p.parte(F.tr(4, -20, o.mx, o.my, 1.6), P.tunica, { sombra: 0 });
  p.parte(F.ov(o.mx + 1.5, o.my, o.orbe, o.orbe), PAL_E.cian, { sombra: 0, luz: false });
  p.px(o.mx + 1, o.my - 1, '#ffffff');
}
const fotoFant = (t, c) => { const p = new Pincel(44, 52, 22, 48, Object.assign({ espejo: true }, t)); fantasma(p, Object.assign({ ola: 0, mx: 9, my: -19, orbe: 2.2, cara: '', boca: false }, c)); return p.lienzo(); };
function creaFantasma() {
  const S = SPR.fantasma = {};
  S.vuela = [0, 1, 2, 3].map(f => fotoFant({}, { ola: [0, 1, 0, -1][f], my: -19 + [0, -1, 0, 1][f], orbe: f % 2 ? 2.6 : 2.2 }));
  S.carga = fotoFant({ inc: -0.2 }, { mx: 7, my: -30, orbe: 3.4, boca: true, ola: 1 });
  S.golpe = fotoFant({ inc: 0.25 }, { mx: 12, my: -20, orbe: 1.6, boca: true, ola: -1 });
  S.dano = fotoFant({ inc: -0.3, sy: 1.05 }, { cara: 'x', mx: 5, my: -14, orbe: 1.4 });
}

/* ---------- StitchBrute (mini jefe): mole cosida con un brazo enorme ---------- */
function cosido(p, o) {
  const P = PAL_N, d = o.dy, Y = y => y + d, U = f => F.mueve(f, 0, d);
  p.parte(F.rr(-11 + o.la, -13, 9, 13, 3), P.cosido, { sombra: 2 });
  p.parte(F.rr(2 + o.lb, -13, 9, 13, 3), P.cosido, { sombra: 2 });
  p.parte(F.tr(-9, Y(-36), -16, Y(-22), 3), P.cosido2, { sombra: 1 });
  const cuerpo = F.ov(0, -29, 15, 15.5);
  p.parte(U(cuerpo), P.cosido, { sombra: 4, luz: 2 });
  p.parte(U(F.y(F.ov(-6, -32, 8, 7), cuerpo)), P.cosido2, { sombra: 1, luz: false });
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; p.px(-6 + Math.cos(a) * 8, Y(-32 + Math.sin(a) * 7), OL); }
  for (let y = -40; y < -18; y += 2) { p.px(3, Y(y), OL); p.px(2, Y(y + 1), OL); p.px(4, Y(y + 1), OL); }
  p.parte(U(F.ov(3, -46, 7, 6.4)), P.cosido2, { sombra: 2 });
  for (const x of [-5, 11]) p.parte(U(F.rr(x, -44, 3, 2.4, 0.8)), PAL_E.metal, { sombra: 0 });
  for (let x = -2; x < 8; x += 2) p.px(x, Y(-50), OL);
  if (o.cara === 'x') { for (const [cx, cy] of [[1, -47], [6, -46.5]]) { p.px(cx - 0.5, Y(cy - 0.5), OL); p.px(cx + 0.5, Y(cy + 0.5), OL); p.px(cx + 0.5, Y(cy - 0.5), OL); p.px(cx - 0.5, Y(cy + 0.5), OL); } }
  else { p.parte(U(F.ov(1, -47, 2.2, 2.4)), PAL_OJO, { sombra: 0, luz: false }); p.px(1.6, Y(-47), OL); p.parte(U(F.ov(6.5, -46.6, 1.4, 1.6)), PAL_OJO, { sombra: 0, luz: false }); p.px(6.8, Y(-46.6), '#e63946'); }
  p.plano(U(F.rr(0, -43.4, 7.5, o.boca ? 3 : 2, 0.6)), '#2a1018');
  for (let x = 0.5; x < 7; x += 2) p.px(x, Y(-43.2), '#ffffff');
  p.parte(F.tr(10, Y(-36), o.mx, Y(o.my), 4.6, 4), P.cosido, { sombra: 2 });
  p.parte(F.ov(o.mx + 1, Y(o.my), 6, 5.4), P.cosido2, { sombra: 2 });
  for (let k = 0; k < 3; k++) p.px(o.mx - 2 + k * 2, Y(o.my - 3.6), OL);
  p.plano(F.ov(-2, Y(-17), 1, 1.6), '#7be04a'); p.plano(F.ov(9, Y(-21), 1, 1.4), '#7be04a');
}
const fotoCosido = (t, c) => { const p = new Pincel(70, 66, 33, 62, Object.assign({ espejo: true }, t)); cosido(p, Object.assign({ dy: 0, la: 0, lb: 0, mx: 18, my: -20, cara: '', boca: false }, c)); return p.lienzo(); };
function creaCosido() {
  const S = SPR.cosido = {};
  S.andar = [[-2, 1], [0, 0], [1, -2], [0, 0]].map(([la, lb], f) => fotoCosido({ sx: f % 2 ? 1 : 1.04, sy: f % 2 ? 1 : 0.96 }, { la, lb, dy: f % 2 ? 0 : 1, my: -20 + f % 2 }));
  S.quieto = [0, 1].map(f => fotoCosido({ sy: f ? 1.02 : 1 }, { boca: !!f, my: -20 + f }));
  S.carga = fotoCosido({ inc: -0.15, sx: 1.05, sy: 0.95 }, { mx: 8, my: -56, boca: true });
  S.golpe = fotoCosido({ inc: 0.22, sx: 1.08, sy: 0.93 }, { mx: 24, my: -10, boca: true, la: -3, lb: 2 });
  S.dano = fotoCosido({ inc: -0.25 }, { cara: 'x', mx: 14, my: -14 });
  S.especial = [0, 1].map(f => fotoCosido({ sy: f ? 1.05 : 1 }, { mx: 6, my: -58 + f, boca: true }));
}

/* ---------- NecroLord corrupto (jefe): túnica, corona de pinchos y bastón de calavera ---------- */
function necrolord(p, o) {
  const P = PAL_N, hy = o.hy, S = f => F.mueve(f, 0, hy);
  const sx = o.bx, sy = o.by;
  p.parte(F.tr(sx - 3, -1, sx, sy, 1.4), P.madera, { sombra: 0 });
  p.parte(F.ov(sx + 0.5, sy - 3, 4, 3.6), P.hueso, { sombra: 1 });
  p.px(sx - 1, sy - 3.4, o.brillo ? '#ffffff' : CIAN); p.px(sx + 1.6, sy - 3.4, o.brillo ? '#ffffff' : CIAN);
  p.parte(F.un(F.pol(sx - 3, sy - 5, sx - 4.5, sy - 9, sx - 1.5, sy - 6), F.pol(sx + 4, sy - 5, sx + 5.5, sy - 9, sx + 2.5, sy - 6)), P.necroO, { sombra: 0 });
  p.parte(S(F.pol(-10, -36, 10, -36, 16, -2, 0, 1, -16, -2)), P.necro, { sombra: 4, luz: 2 });
  p.plano(S(F.pol(-4, -34, 4, -34, 6, -1, -6, -1)), '#2a1840');
  p.plano(F.y(F.re(-17, -4.5 + hy, 34, 1.2), S(F.pol(-10, -36, 10, -36, 16, -2, 0, 1, -16, -2))), CIAN);
  p.parte(S(F.rr(-10, -22, 20, 3.6, 1.2)), P.necroO, { sombra: 0 }); p.parte(S(F.ov(0, -20.2, 2, 2)), P.hueso, { sombra: 0 });
  for (const s of [-1, 1]) {
    p.parte(S(F.ov(11 * s, -36, 7, 4.6, 0.2 * s)), P.necroO, { sombra: 1 });
    p.parte(S(F.pol(14 * s, -38.5, 19 * s, -46, 10 * s, -40.5)), P.necroO, { sombra: 0 });
  }
  p.parte(S(F.ov(0, -44, 8.6, 8.4)), P.hueso, { sombra: 2, luz: 2 });
  p.parte(S(F.rr(-5, -38.5, 10, 5, 1.5)), P.hueso, { sombra: 1 });
  for (const x of [-2.5, 0, 2.5]) p.plano(S(F.re(x - 0.4, -38.5, 0.9, 4.5)), '#5a5040');
  if (o.cara === 'x') { for (const cx of [-3.4, 3.4]) for (let k = -1.5; k <= 1.5; k++) { p.px(cx + k, -44.6 + hy + k, OL); p.px(cx + k, -44.6 + hy - k, OL); } }
  else for (const cx of [-3.4, 3.4]) { p.plano(S(F.ov(cx, -44.6, 2.6, 2.8)), '#1a1022'); p.plano(S(F.ov(cx, -44.6, o.brillo ? 1.6 : 1.1, o.brillo ? 1.6 : 1.1)), o.brillo ? '#ffffff' : CIAN); }
  p.plano(S(F.pol(-0.9, -41, 0.9, -41, 0, -39.6)), '#1a1022');
  p.parte(S(F.pol(-8, -49, -9, -58, -5, -53, -3, -62, 0, -54, 3, -62, 5, -53, 9, -58, 8, -49)), P.necroO, { sombra: 1 });
  p.px(0, -51 + hy, CIAN); p.px(0, -52 + hy, CIAN);
  p.parte(F.ov(o.mx, o.my + hy, 2.8, 2.8), P.hueso, { sombra: 0 });
  p.parte(F.ov(-13, -24 + hy, 2.8, 3), P.hueso, { sombra: 0 });
  if (o.brillo) p.plano(F.ov(o.mx + 3, o.my + hy - 1, 2.4, 2.4), CIAN);
}
const fotoNecro = (t, c) => { const p = new Pincel(64, 82, 30, 78, Object.assign({ espejo: true }, t)); necrolord(p, Object.assign({ hy: 0, bx: 17, by: -58, mx: 14.5, my: -26, brillo: false, cara: '' }, c)); return p.lienzo(); };
function creaNecro() {
  const S = SPR.necrolord = {};
  S.quieto = [0, 1, 2, 3].map(f => fotoNecro({}, { hy: [0, -1, -2, -1][f], by: -58 + [0, -1, -2, -1][f], brillo: f === 2 }));
  S.carga = fotoNecro({ inc: -0.15 }, { bx: 10, by: -66, mx: 11, my: -40, brillo: true });
  S.golpe = fotoNecro({ inc: 0.18 }, { bx: 22, by: -52, mx: 19, my: -24, brillo: true });
  S.especial = [0, 1].map(f => fotoNecro({ sy: f ? 1.03 : 1 }, { bx: 6 + f, by: -68 - f, mx: 8, my: -44, brillo: true, hy: -f }));
  S.dano = fotoNecro({ inc: -0.25 }, { cara: 'x', bx: 20, by: -50, mx: 15, my: -20 });
}

function creaEnemigos2() { creaEsqueleto(); creaZombi(); creaFantasma(); creaCosido(); creaNecro(); }
