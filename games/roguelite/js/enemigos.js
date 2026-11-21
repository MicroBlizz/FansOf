// Fans of Roguelite (prototipo) · Los de Microblizz en pixel art: Becario (y su primo el abogado), StarBot, CajaBotín y el jefe
// SurvivalBot, más el puesto de café de Lola. Se dibujan mirando a la derecha y se guardan en espejo (miran al conejo).
// Colores y piezas sacados de sus dibujos del juego (core/js/serie/arte/microblizz.js).
'use strict';

const PAL_E = {
  gris:   pal('#aab4c4', '#6f7a99', '#dde4f0', '#3a4262'),
  grisF:  pal('#8d97ab', '#5c6684', '#b9c3d6', '#30374f'),
  pant:   pal('#1b4fc4', '#11358a', '#4a82ff', '#0a1f5c'),
  rojo:   pal('#ff4b5c', '#c4243c', '#ff9aa4', '#6a1020'),
  taza:   pal('#fff6ea', '#d6c8b4', '#ffffff', '#6a5a48'),
  pierna: pal('#5b6578', '#3a4256', '#7d8aa3', '#20263a'),
  traje:  pal('#3a3f5c', '#252a40', '#5f6690', '#121526'),
  papel:  pal('#fffaf0', '#d9d0c0', '#ffffff', '#6a6050'),
  nave:   pal('#34466e', '#202c4a', '#5b74a8', '#10182e'),
  ala:    pal('#4d6496', '#33456e', '#7d95cc', '#1a2444'),
  alaF:   pal('#3e5280', '#2a3a60', '#6378ac', '#141c36'),
  cian:   pal('#33e0ff', '#1a9cc4', '#c8f8ff', '#0b5a7a'),
  caja:   pal('#2e5bb8', '#1d3f8a', '#5b8fe6', '#0d2259'),
  tapa:   pal('#3a7de0', '#2456b0', '#7fb0ff', '#0f2c66'),
  robot:  pal('#9aa5ba', '#5f6a84', '#d4dbe8', '#2f3650'),
  robotF: pal('#7d889e', '#4e5872', '#a9b3c8', '#262c42'),
  oscuro: pal('#3a4258', '#232838', '#5b6680', '#10131f'),
  ojoR:   pal('#ff3348', '#c41a30', '#ffb0b8', '#6a0a14'),
  ojoB:   pal('#ffffff', '#ffe0a0', '#ffffff', '#c45a12'),
  parche: pal('#f1e3c6', '#c8b48e', '#fff8e8', '#6a5a3a'),
  madera: pal('#c8874a', '#8f5428', '#e8b07a', '#4a2a14'),
  carton: pal('#d9b27a', '#a8824a', '#f0d2a0', '#5a4020'),
  metal:  pal('#c3cbe0', '#7d889e', '#eef2fa', '#3a4262'),
  toldo:  pal('#ff7a1a', '#d9431e', '#ffb347', '#8f2410'),
};
const PAL_OJO = pal('#ffffff', '#d8d0f0', '#ffffff', '#3a2050');

// letrero que se lee bien aunque el dibujo esté en espejo (centrado en cx)
function letreroRecto(p, txt, cx, y, color) {
  const t = limpiaTexto(txt), W = anchoTexto(t);
  let u = 0;
  const pon = (c, r) => p.px(cx + p.esp * (u + c - W / 2 + 0.5), y + r + 0.5, color);
  for (const ch of t) {
    const g = LETRA[ch] || LETRA['?'];
    g.forEach((fila, r) => { for (let c = 0; c < fila.length; c++) if (fila[c] === '#') pon(c, r); });
    if (g.marca) for (const [r, c] of g.marca) pon(c, r);
    u += g[0].length + 1;
  }
}

/* ---------- Becario (y el abogado: mismo cuerpo, traje y contrato) ---------- */
function becario(p, o) {
  const P = PAL_E, ab = o.abogado, cuerpo = ab ? P.traje : P.gris, d = o.dy;
  const U = f => F.mueve(f, 0, d), Y = y => y + d;
  p.parte(F.tr(-3, -7, -3 + o.la, -1.6, 1.8), P.pierna, { sombra: 1 });
  p.parte(F.ov(-2.5 + o.la, -1.3, 2.6, 1.5), P.pierna, { sombra: 0 });
  p.parte(F.tr(3, -7, 3 + o.lb, -1.6, 1.8), P.pierna, { sombra: 1 });
  p.parte(F.ov(3.5 + o.lb, -1.3, 2.6, 1.5), P.pierna, { sombra: 0 });
  p.parte(F.tr(-8, Y(-18), o.bx, Y(o.byy), 2), ab ? P.traje : P.grisF, { sombra: 1 });
  p.parte(F.ov(o.bx, Y(o.byy), 2.2, 2.2), P.grisF, { sombra: 0 });
  p.parte(U(F.rr(-9, -27, 18, 21, 5)), cuerpo, { sombra: 3 });
  p.parte(U(F.rr(-5, -24, 14, 9, 2)), ab ? pal('#c4243c', '#8a1428', '#ff6a7a', '#4a0a14') : o.mes ? pal('#e0a020', '#a86a10', '#ffe08a', '#5a3a08') : P.pant, { sombra: 1 });
  p.px(-3.5, Y(-22.5), ab ? '#ff9aa4' : '#a8c8ff'); p.px(-2.5, Y(-22.5), ab ? '#ff9aa4' : '#a8c8ff');
  const ojo = ab ? '#ffe0e4' : '#e8f1ff';
  if (o.cara === 'x') { for (const cx of [-0.5, 5.5]) { for (let k = -1; k <= 1; k++) { p.px(cx + k, Y(-20 + k), ojo); p.px(cx + k, Y(-20 - k), ojo); } } }
  else if (o.cara === 'grito') { for (const cx of [-0.5, 5.5]) { p.plano(U(F.re(cx - 1, -21.5, 2, 2)), ojo); } p.plano(U(F.re(1.5, -18, 2, 1)), ojo); }
  else if (o.cara === 'malo') { for (const cx of [-0.5, 5.5]) { p.px(cx - 1, Y(-21), ojo); p.px(cx, Y(-20.5), ojo); p.px(cx + 1, Y(-20), ojo); } p.plano(U(F.re(1, -17.5, 3, 1)), ojo); }
  else { for (const cx of [-0.5, 5.5]) for (let k = -1; k <= 1; k++) p.px(cx + k, Y(-20), ojo); p.px(-1, Y(-18.5), '#4a82ff'); p.px(5, Y(-18.5), '#4a82ff'); }
  p.plano(U(F.pol(-1.5, -14.5, 2, -14.5, 0.3, -12.5)), '#ffffff'); p.plano(U(F.pol(2, -14.5, 5.5, -14.5, 3.8, -12.5)), '#ffffff');
  p.parte(U(F.pol(0.6, -14.2, 3, -14.2, 3.8, -9.5, 1.8, -7.2, -0.2, -9.5)), ab || o.mes ? PAL_H.oro : P.rojo, { sombra: 1 });
  if (o.mes) p.plano(U(estrella(-5, -10, 2.6, 1.2)), '#ffcb3d');
  else if (!ab) { p.plano(U(F.re(-7, -12, 4, 5)), '#fff6ea'); p.plano(U(F.re(-7, -12, 4, 1.5)), '#2e8bff'); p.px(-5.5, Y(-8.6), '#5b6578'); p.px(-4.5, Y(-8.6), '#5b6578'); }
  p.plano(F.tr(0, Y(-27), o.ant, Y(-32), 0.55), OL);
  p.parte(F.ov(o.ant, Y(-33.2), 2, 2), P.rojo, { sombra: 1 });
  // brazo de delante: taza de café (becario) o contrato (abogado)
  p.parte(F.tr(7, Y(-18), o.mx, Y(o.my), 2), ab ? P.traje : P.gris, { sombra: 1 });
  const mx = o.mx, my = Y(o.my);
  if (ab) {
    p.parte(F.rr(mx - 1, my - 11, 6, 13, 1), P.papel, { sombra: 1 });
    for (let k = 0; k < 4; k++) p.plano(F.re(mx + 0.5, my - 9 + k * 2.4, 3, 0.9), '#9a9080');
    p.px(mx + 3, my + 0.2, '#e63946'); p.px(mx + 2, my + 0.2, '#e63946');
  } else {
    p.parte(F.menos(F.ov(mx + 5.6, my - 2.5, 2.3, 2.3), F.ov(mx + 5.6, my - 2.5, 1, 1)), P.taza, { sombra: 0 });
    p.parte(F.rr(mx - 0.5, my - 5.5, 6, 6.5, 1), P.taza, { sombra: 1 });
    p.plano(F.re(mx + 0.5, my - 4.5, 4, 1), '#6b3a1c');
    p.px(mx + 2.5, my - 1.5, '#2e8bff');
    if (o.vapor !== undefined) for (let k = 0; k < 4; k++) p.px(mx + 2 + Math.round(Math.sin(k * 1.4 + o.vapor) * 1.2), my - 7 - k * 1.6, k % 2 ? '#ffffff' : '#e6eaf4');
  }
  p.parte(F.ov(o.mx, Y(o.my), 2.2, 2.2), ab ? P.traje : P.gris, { sombra: 0 });
}
const POSE_BECARIO = { dy: 0, la: 0, lb: 0, bx: -10, byy: -10, ant: 0, mx: 9, my: -12, cara: '', abogado: false };
const fotoBecario = (t, c) => { const p = new Pincel(48, 46, 24, 42, Object.assign({ espejo: true }, t)); becario(p, Object.assign({}, POSE_BECARIO, c)); return p.lienzo(); };
function creaBecario() {
  const B = SPR.becario = {};
  const L = [[-2, 2], [0, 0], [2, -2], [0, 0]];
  B.andar = L.map(([la, lb], f) => fotoBecario({}, { la, lb, dy: f % 2 ? -1 : 0, ant: f < 2 ? 1 : -1, bx: -10 - la * 0.5, my: -12 + (f % 2 ? 0 : 1) }));
  B.quieto = [0, 1].map(f => fotoBecario({ sy: f ? 1.03 : 1 }, { vapor: f * 2.2, ant: f ? 0.6 : -0.4 }));
  B.carga = fotoBecario({ sx: 1.08, sy: 0.93, inc: -0.25 }, { mx: 4, my: -27, bx: -12, byy: -16, ant: -2, cara: 'grito' });
  B.golpe = fotoBecario({ sx: 1.12, sy: 0.93, inc: 0.3 }, { mx: 15, my: -16, ant: -2.5, cara: 'grito', la: -2, lb: 2 });
  B.dano = fotoBecario({ sx: 0.95, sy: 1.04, inc: -0.3 }, { cara: 'x', ant: -3, mx: 6, my: -9, bx: -12, byy: -8 });
  const A = SPR.abogado = {};
  A.quieto = [0, 1].map(f => fotoBecario({ sy: f ? 1.03 : 1 }, { abogado: true, cara: 'malo', ant: f ? 0.6 : -0.4, mx: 10, my: -14 + f }));
  A.andar = L.map(([la, lb], f) => fotoBecario({}, { abogado: true, cara: 'malo', la, lb, dy: f % 2 ? -1 : 0, ant: f < 2 ? 1 : -1, mx: 10, my: -14 }));
}

/* ---------- StarBot: dron con estrella dorada, cañón y alas ---------- */
const estrella = (cx, cy, R, r) => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; pts.push(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } return F.pol(...pts); };
function starbot(p, o) {
  const P = PAL_E;
  p.parte(F.rr(-3, -7, 6, 4, 1), P.nave, { sombra: 1 });
  p.parte(F.ov(-8, -19, 6, 3.2, -0.5 - o.ala), P.alaF, { sombra: 1 });
  p.parte(F.ov(0, -14, 8, 7.5), P.nave, { sombra: 3 });
  p.plano(estrella(0, -13, 3.8, 1.7), '#ffcb3d'); p.px(0, -13, '#fff3a0');
  p.parte(F.rr(4, -14.5 + o.cy, 10, 4, 1.5), P.nave, { sombra: 1 });
  p.parte(F.ov(14, -12.5 + o.cy, 1.6, 2.2), P.cian, { sombra: 0, luz: false });
  if (o.fogonazo) p.plano(F.ov(16.5, -12.5 + o.cy, 2.6, 2.6), '#c8f8ff');
  p.parte(F.ov(-5, -21, 6.5, 3.4, -0.3 - o.ala), P.ala, { sombra: 1 });
  p.parte(F.ov(1, -24, 6.6, 6), P.ala, { sombra: 2 });
  p.parte(F.rr(-0.5, -27, 8.5, 4, 1.5), P.cian, { sombra: 0 });
  if (o.cara === 'x') { p.px(2, -25.5, OL); p.px(3, -24.5, OL); p.px(3, -25.5, OL); p.px(2, -24.5, OL); p.px(5.5, -25.5, OL); p.px(6.5, -24.5, OL); p.px(6.5, -25.5, OL); p.px(5.5, -24.5, OL); }
  else { p.px(3 + o.scan, -25.5, '#ff3348'); p.px(4 + o.scan, -25.5, '#ff3348'); p.px(0.5, -26.5, '#ffffff'); }
  p.plano(F.tr(3, -29.5, 5 + o.ant, -34, 0.55), OL);
  p.parte(F.ov(5.3 + o.ant, -35, 1.7, 1.7), PAL_H.oro, { sombra: 0 });
}
const POSE_STAR = { ala: 0, cy: 0, scan: 0, ant: 0, cara: '', fogonazo: false };
const fotoStar = (t, c) => { const p = new Pincel(44, 44, 22, 40, Object.assign({ espejo: true }, t)); starbot(p, Object.assign({}, POSE_STAR, c)); return p.lienzo(); };
function creaStarbot() {
  const S = SPR.starbot = {};
  S.vuela = [0, 1, 2, 3].map(f => fotoStar({}, { ala: Math.sin(f * Math.PI / 2) * 0.45, scan: [0, 1, 2, 1][f], ant: [0, 0.5, 0, -0.5][f] }));
  S.carga = fotoStar({ inc: -0.2 }, { ala: 0.4, cy: -1, scan: 2, ant: -1 });
  S.golpe = fotoStar({ inc: -0.3, sx: 0.94 }, { ala: -0.3, cy: 1, scan: 2, ant: -1.5, fogonazo: true });
  S.dano = fotoStar({ inc: -0.3, sy: 1.05 }, { ala: 0.6, cara: 'x', ant: 1.5 });
}

/* ---------- CajaBotín: caja de botín que muerde ---------- */
function cajaBotin(p, o) {
  const P = PAL_E, a = o.tapa, G = f => F.gira(f, a, -12, -16), R = (x, y) => giraP(x, y, a, -12, -16);
  p.parte(F.ov(-7, -1.6, 2.8, 1.8), PAL_H.oro, { sombra: 0 }); p.parte(F.ov(7, -1.6, 2.8, 1.8), PAL_H.oro, { sombra: 0 });
  p.parte(F.rr(-12, -16, 24, 15, 2), P.caja, { sombra: 3 });
  p.parte(F.y(F.re(-13, -11, 26, 2.6), F.rr(-12, -16, 24, 15, 2)), PAL_H.oro, { sombra: 0 });
  p.parte(F.rr(-3, -13, 6, 7, 1), PAL_H.oro, { sombra: 1 });
  for (const [x, y] of [[-1, -11.5], [0, -12], [1, -11.5], [1, -10.5], [0, -9.5], [0, -7.5]]) p.px(x + 0.5, y, '#1d3f8a');
  if (a < -0.05) {
    const [lx, ly] = R(12, -16);
    p.plano(F.pol(-12, -16, 12, -16, lx, ly), '#2a0d14');
    p.plano(F.ov(3, -16.5 + a * 2, 5, 2), '#ff5c8a');
    for (let x = -10; x < 10; x += 4) p.plano(F.pol(x, -15.8, x + 2, -18.6, x + 4, -15.8), '#ffffff');
  }
  const tapa = F.menos(F.ov(0, -16, 12.6, 8.4), F.re(-30, -16, 60, 20));
  p.parte(G(tapa), P.tapa, { sombra: 2 });
  p.parte(G(F.y(F.re(-14, -18.6, 28, 2.6), F.ov(0, -16, 12.6, 8.4))), PAL_H.oro, { sombra: 0 });
  for (let x = -10; x < 10; x += 4) p.plano(G(F.pol(x, -16.2, x + 2, -13.4, x + 4, -16.2)), '#ffffff');
  for (const ex of [-3.5, 4]) {
    p.parte(G(F.ov(ex, -21, 2.3, 2.5)), PAL_OJO, { sombra: 0, luz: false });
    const [px, py] = R(ex + 0.6, -20.6);
    if (o.cara === 'x') { p.px(px - 1, py - 1, OL); p.px(px + 1, py + 1, OL); p.px(px + 1, py - 1, OL); p.px(px - 1, py + 1, OL); p.px(px, py, OL); }
    else { p.px(px, py, '#ff3348'); p.px(px, py - 1, '#ff3348'); }
  }
  for (const [x1, y1, x2, y2] of [[-6.5, -24.6, -1.5, -23.2], [7, -24.6, 2, -23.2]]) { const [a1, b1] = R(x1, y1), [a2, b2] = R(x2, y2); p.plano(F.tr(a1, b1, a2, b2, 0.65), OL); }
}
const fotoCaja = (t, c) => { const p = new Pincel(46, 44, 23, 40, Object.assign({ espejo: true }, t)); cajaBotin(p, Object.assign({ tapa: 0, cara: '' }, c)); return p.lienzo(); };
function creaCaja() {
  const C = SPR.caja = {};
  C.salta = [[1.12, 0.88, 0], [0.92, 1.1, -0.2], [0.96, 1.05, -0.35], [1.04, 0.97, -0.1]].map(([sx, sy, tapa]) => fotoCaja({ sx, sy }, { tapa }));
  C.hop = [0, 4, 6, 3];
  C.quieto = [0, 1].map(f => fotoCaja({ sy: f ? 1.03 : 1 }, { tapa: f ? -0.18 : -0.05 }));
  C.carga = fotoCaja({ sx: 0.94, sy: 1.08, inc: -0.15 }, { tapa: -0.95 });
  C.golpe = fotoCaja({ sx: 1.18, sy: 0.85, inc: 0.2 }, { tapa: 0 });
  C.dano = fotoCaja({ sx: 0.95, sy: 1.05, inc: -0.25 }, { tapa: -0.45, cara: 'x' });
}

/* ---------- SurvivalBot: el jefe, una cabeza de robot sobre un edificio con corbata ---------- */
function brazoRobot(p, sx, sy, ang, codo, pl) {
  const ex = sx + Math.cos(ang) * 9, ey = sy + Math.sin(ang) * 9, af = ang + codo, hx = ex + Math.cos(af) * 9, hy = ey + Math.sin(af) * 9;
  p.parte(F.tr(sx, sy, ex, ey, 3.2, 2.8), pl, { sombra: 1 });
  p.parte(F.tr(ex, ey, hx, hy, 2.9, 2.4), pl, { sombra: 1 });
  p.parte(F.ov(ex, ey, 2.6, 2.6), PAL_E.oscuro, { sombra: 0 });
  const pinza = s => F.gira(F.mueve(F.pol(0, s * 1.2, 6.5, s * 4.2, 7.5, s * 1, 2, s * 0.2), hx, hy), af, hx, hy);
  p.parte(F.un(pinza(-1), pinza(1)), PAL_E.oscuro, { sombra: 1 });
  p.parte(F.ov(sx, sy, 5.4, 5.4), pl, { sombra: 2 });
}
function survival(p, o) {
  const P = PAL_E, hy = o.hy;
  p.parte(F.rr(-17, -10, 15, 10, 4), PAL_E.oscuro, { sombra: 2 });
  for (const x of [-13, -6]) p.plano(F.ov(x, -5, 1.8, 1.8), '#5b6680');
  brazoRobot(p, -14, -37, o.bA, o.cA, P.robotF);
  p.parte(F.rr(-15, -43, 30, 34, 3), P.caja, { sombra: 4, luz: 2 });
  for (let r = 0; r < 3; r++) for (const c of [-12, -8, 5, 9]) {
    const encendida = ((r * 7 + c * 3 + o.luz) % 5) > 1;
    p.plano(F.re(c, -40 + r * 5, 3, 3), encendida ? '#ffe08a' : '#16306b');
  }
  p.parte(F.rr(-3, -43.5, 6, 3, 1), P.rojo, { sombra: 0 });
  p.parte(F.pol(-2.5, -41, 2.5, -41, 3.6, -30, 0, -26, -3.6, -30), P.rojo, { sombra: 1 });
  p.plano(F.re(-13, -24, 26, 10), '#0f1d44');
  letreroRecto(p, 'MB', 0, -22.5, '#e8f1ff');
  p.parte(F.rr(-5, -47, 10, 5, 1), P.robotF, { sombra: 1 });
  p.parte(F.rr(-12, -65 + hy, 24, 19, 5), P.robot, { sombra: 3, luz: 2 });
  p.plano(F.ov(4.5, -57 + hy, 5, 5), '#2a0d14');
  p.parte(F.ov(4.5, -57 + hy, 3.6, 3.6), o.cara === 'furia' ? P.ojoB : P.ojoR, { sombra: 1, luz: false });
  if (o.cara === 'x') { for (let k = -2; k <= 2; k++) { p.px(4.5 + k, -57 + hy + k, OL); p.px(4.5 + k, -57 + hy - k, OL); } }
  else { p.px(3, -58.5 + hy, '#ffd0d4'); p.px(3, -59.5 + hy, '#ffd0d4'); p.px(4, -59.5 + hy, '#ffd0d4'); }
  p.parte(F.rr(-10, -61 + hy, 8, 7, 1), P.parche, { sombra: 1 });
  for (let k = 0; k < 5; k++) { p.px(-8.5 + k, -59.5 + hy + k, '#b89a6e'); p.px(-4.5 - k, -59.5 + hy + k, '#b89a6e'); }
  p.plano(F.tr(0, -60.8 + hy, 9.5, -63.4 + hy, 0.7), OL);
  const boca = o.boca ? 6 : 4;
  p.plano(F.rr(-7, -52 + hy, 14, boca, 1), '#1b2033');
  for (let x = -5; x <= 5; x += 2) p.plano(F.re(x, -52 + hy, 1, boca), '#9aa5ba');
  if (o.boca) p.plano(F.re(-6, -49 + hy, 12, 1), '#ff3348');
  p.plano(F.tr(-6, -65 + hy, -8 + o.ant, -71 + hy, 0.6), OL); p.parte(F.ov(-8.5 + o.ant, -72 + hy, 2.3, 2.3), P.rojo, { sombra: 1 });
  p.plano(F.tr(6, -65 + hy, 8 - o.ant * 0.5, -69 + hy, 0.6), OL); p.parte(F.ov(8.2 - o.ant * 0.5, -70 + hy, 1.8, 1.8), P.robot, { sombra: 0 });
  brazoRobot(p, 15, -37, o.bB, o.cB, P.robot);
  p.parte(F.rr(1, -10, 17, 10, 4), PAL_E.oscuro, { sombra: 2 });
  for (const x of [6, 13]) p.plano(F.ov(x, -5, 2, 2), '#7d889e');
}
const POSE_JEFE = { hy: 0, bA: 1.9, cA: 0.4, bB: 1.25, cB: -0.7, ant: 0, luz: 0, cara: '', boca: false };
const fotoJefe = (t, c) => { const p = new Pincel(86, 88, 43, 84, Object.assign({ espejo: true }, t)); survival(p, Object.assign({}, POSE_JEFE, c)); return p.lienzo(); };
function creaJefe() {
  const J = SPR.jefe = {};
  J.quieto = [0, 1, 2, 3].map(f => fotoJefe({ sy: [1, 1.01, 1.02, 1.01][f] }, { hy: f === 2 ? -1 : 0, ant: [0, 1, 0, -1][f], luz: f, bB: 1.25 + Math.sin(f * Math.PI / 2) * 0.08, bA: 1.9 - Math.sin(f * Math.PI / 2) * 0.06 }));
  J.carga = fotoJefe({ inc: -0.18, sx: 1.04, sy: 0.97 }, { bB: -2.3, cB: -0.6, bA: 2.3, ant: -2, cara: 'furia', boca: true });
  J.golpe = fotoJefe({ inc: 0.22, sx: 1.06, sy: 0.96 }, { bB: 0.15, cB: 0.3, bA: 2.2, ant: 2, boca: true, hy: 1 });
  J.especial = [0, 1].map(f => fotoJefe({ sy: f ? 1.04 : 1.01 }, { bA: -2.1 - f * 0.1, cA: 0.5, bB: -1.1 + f * 0.1, cB: -0.5, cara: 'furia', boca: true, ant: f ? 2 : -2, luz: f * 3, hy: -f }));
  J.dano = fotoJefe({ inc: -0.25, sy: 1.03 }, { cara: 'x', bB: 0.7, cB: 0.9, bA: 2.4, ant: 3, boca: true });
}

/* ---------- El puesto de café de Lola (despedida por Microblizz) ---------- */
function creaPuesto() {
  const P = PAL_E, p = new Pincel(48, 50, 24, 46);
  for (const x of [-15, 15]) p.plano(F.tr(x, -21, x, -40, 0.7), '#5a3a1c');
  p.parte(F.rr(-17, -21, 34, 15, 2), P.madera, { sombra: 2 });
  for (const y of [-16, -11]) p.plano(F.re(-16, y, 32, 1), '#8f5428');
  p.parte(F.re(-18, -23, 36, 3), pal('#a86c3a', '#7a4620', '#d49a62', '#3a200c'), { sombra: 0 });
  p.parte(F.rr(-13, -33, 9, 10, 1), P.metal, { sombra: 2 });
  p.plano(F.re(-11, -30, 5, 3), '#2a2a3a'); p.px(-8, -28.5, '#ff4b5c');
  p.parte(F.rr(6, -27, 4, 4, 1), P.taza, { sombra: 0 }); p.parte(F.rr(11, -27, 4, 4, 1), P.taza, { sombra: 0 });
  for (const x of [-10, 10]) { p.plano(F.ov(x, -4, 4.2, 4.2), OL); p.plano(F.ov(x, -4, 3, 3), '#7a5a3a'); p.px(x, -4, '#c8874a'); }
  p.parte(F.pol(-21, -40, 21, -40, 19, -34, -19, -34), P.toldo, { sombra: 1 });
  for (let x = -18; x < 19; x += 6) p.plano(F.y(F.pol(-21, -40, 21, -40, 19, -34, -19, -34), F.re(x, -41, 3, 8)), '#fff1dc');
  for (let x = -19; x < 20; x += 3) p.plano(F.ov(x + 1.5, -34, 1.6, 1.4), '#d9431e');
  const cartel = Math.max(18, anchoTexto(tr('CAFÉ')) + 6);
  p.parte(F.rr(-cartel / 2, -20, cartel, 11, 1), P.carton, { sombra: 1 });
  letreroRecto(p, tr('CAFÉ'), 0, -17.5, '#5a2a10');
  SPR.puesto = p.lienzo();
}

function creaEnemigos() { creaBecario(); creaStarbot(); creaCaja(); creaJefe(); creaPuesto(); }
