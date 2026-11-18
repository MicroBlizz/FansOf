// Fans of Roguelite · Los de la Torre de Microblizz en pixel art: el abogado (ya con sus golpes), FallenHero, SoporteBot, el
// mini jefe Parche Día 1 y el jefe, el CEO de Microblizz. También el Becario del Mes (mini jefe del mundo 1, más grande y con
// corbata de oro). Se dibujan mirando a la derecha y se guardan en espejo.
'use strict';

const PAL_T = {
  armadura: pal('#8d9cc0', '#5b6787', '#c8d2ea', '#2a3048'),
  armaduraF: pal('#727f9e', '#4a5570', '#a6b2d0', '#222840'),
  capa:     pal('#c94a4a', '#8a2a2a', '#ff7a7a', '#4a1010'),
  cuero:    pal('#7a4d1c', '#54320e', '#a8743a', '#2a1806'),
  traje:    pal('#5b6170', '#3e4250', '#8a90a0', '#1c1e28'),
  trajeF:   pal('#4a5060', '#323642', '#6e7484', '#16181f'),
  piel:     pal('#f2c7a5', '#c8957a', '#ffe2c8', '#6a3a28'),
  pelo:     pal('#5a3a1e', '#3b2410', '#7a5432', '#1e1006'),
  venda:    pal('#f1e3c6', '#c8b48e', '#fff8e8', '#6a5a3a'),
  verde:    pal('#7be04a', '#3f9a2a', '#c8ff9a', '#1d4a10'),
};

/* ---------- el abogado: golpes con el contrato ---------- */
function creaAbogadoCombate() {
  const A = SPR.abogado;
  A.carga = fotoBecario({ sx: 1.08, sy: 0.93, inc: -0.25 }, { abogado: true, cara: 'grito', mx: 4, my: -28, bx: -12, byy: -16, ant: -2 });
  A.golpe = fotoBecario({ sx: 1.12, sy: 0.93, inc: 0.3 }, { abogado: true, cara: 'grito', mx: 15, my: -17, ant: -2.5, la: -2, lb: 2 });
  A.dano = fotoBecario({ sx: 0.95, sy: 1.04, inc: -0.3 }, { abogado: true, cara: 'x', ant: -3, mx: 6, my: -9, bx: -12, byy: -8 });
}

/* ---------- el Becario del Mes (mini jefe del mundo 1): becario grande con corbata y visor de oro ---------- */
const fotoBecarioMes = (t, c) => {
  const p = new Pincel(74, 72, 37, 68, Object.assign({ espejo: true }, t, { sx: (t.sx || 1) * 1.5, sy: (t.sy || 1) * 1.5 }));
  becario(p, Object.assign({}, POSE_BECARIO, { mes: true }, c)); return p.lienzo();
};
function creaBecarioMes() {
  const B = SPR.becarioMes = {}, L = [[-2, 2], [0, 0], [2, -2], [0, 0]];
  B.andar = L.map(([la, lb], f) => fotoBecarioMes({}, { la, lb, dy: f % 2 ? -1 : 0, ant: f < 2 ? 1 : -1, my: -12 + (f % 2 ? 0 : 1) }));
  B.quieto = [0, 1].map(f => fotoBecarioMes({ sy: f ? 1.03 : 1 }, { vapor: f * 2.2, ant: f ? 0.6 : -0.4 }));
  B.carga = fotoBecarioMes({ sx: 1.08, sy: 0.93, inc: -0.25 }, { mx: 4, my: -27, bx: -12, byy: -16, ant: -2, cara: 'grito' });
  B.golpe = fotoBecarioMes({ sx: 1.12, sy: 0.93, inc: 0.3 }, { mx: 15, my: -16, ant: -2.5, cara: 'grito', la: -2, lb: 2 });
  B.dano = fotoBecarioMes({ sx: 0.95, sy: 1.04, inc: -0.3 }, { cara: 'x', ant: -3, mx: 6, my: -9, bx: -12, byy: -8 });
  B.especial = [0, 1].map(f => fotoBecarioMes({ sy: f ? 1.04 : 1 }, { mx: 6, my: -30 - f, bx: -10, byy: -28, cara: 'grito', ant: f ? 2 : -2, vapor: f * 2 }));
}

/* ---------- FallenHero: el héroe caído, armadura abollada, capa roja y espada ---------- */
function fallen(p, o) {
  const P = PAL_T, d = o.dy, Y = y => y + d, U = f => F.mueve(f, 0, d), w = o.capa;
  p.parte(F.pol(-4, Y(-27), 3, Y(-27), 1, -10, -4, -2, -10 + w, -1, -15 + w, -6, -11, Y(-18)), P.capa, { sombra: 2 });
  pierna(p, -2.5, Y(-12), -3 + o.la, -1.6, 2.2, P.armaduraF, P.cuero);
  pierna(p, 2.5, Y(-12), 3 + o.lb, -1.6, 2.2, P.armadura, P.cuero);
  p.parte(F.tr(-4, Y(-23), -7, Y(-15), 1.8), P.armaduraF, { sombra: 0 });
  p.parte(U(F.ov(0, -18, 7.4, 7.6)), P.armadura, { sombra: 3, luz: 2 });
  p.parte(U(F.rr(-7, -13.5, 14, 2.4, 1)), P.cuero, { sombra: 0 }); p.px(0.5, Y(-12.6), '#ffcb3d');
  p.plano(U(F.un(F.tr(-2, -22, 1, -18, 0.5), F.tr(1, -18, -1, -15, 0.5))), '#2a3048');
  p.parte(U(F.ov(1.5, -29.5, 6, 5.8)), P.armadura, { sombra: 2, luz: 2 });
  p.parte(U(F.pol(-1, -35, -5, -37, -9, -34, -10, -28, -6, -31, -3, -32)), P.capa, { sombra: 1 });
  p.plano(U(F.re(1, -30.5, 6.6, 1.6)), '#1a1022');
  if (o.cara !== 'x') { p.px(4.5, Y(-30), '#ff3348'); p.px(5.5, Y(-30), '#ff6a6a'); } else { p.px(3, Y(-30), '#ffffff'); p.px(5, Y(-30), '#ffffff'); }
  p.parte(U(F.ov(4.5, -23.5, 3.6, 2.8)), P.armadura, { sombra: 1 });
  const a = o.sa, hx = o.mx, hy = Y(o.my), dx = Math.cos(a), dy = Math.sin(a);
  p.parte(F.tr(4, Y(-22), hx, hy, 1.8), P.armadura, { sombra: 0 });
  p.parte(F.tr(hx + dx * 2, hy + dy * 2, hx + dx * 15, hy + dy * 15, 1.6, 0.5), PAL_E.metal, { sombra: 0 });
  p.plano(F.tr(hx + dx * 2, hy + dy * 2, hx + dx * 13, hy + dy * 13, 0.4), '#ffffff');
  p.parte(F.tr(hx - dy * 2.6, hy + dx * 2.6, hx + dy * 2.6, hy - dx * 2.6, 0.9), PAL_H.oro, { sombra: 0 });
  p.parte(F.ov(hx, hy, 1.8, 1.8), P.cuero, { sombra: 0 });
}
const fotoFallen = (t, c) => { const p = new Pincel(54, 50, 27, 46, Object.assign({ espejo: true }, t)); fallen(p, Object.assign({ dy: 0, la: 0, lb: 0, mx: 8, my: -16, sa: -1.1, capa: 0, cara: '' }, c)); return p.lienzo(); };
function creaFallen() {
  const S = SPR.fallen = {}, L = [[-2, 2], [0, 0], [2, -2], [0, 0]];
  S.andar = L.map(([la, lb], f) => fotoFallen({}, { la, lb, dy: f % 2 ? -1 : 0, capa: [0, 1, 2, 1][f], mx: 8 - la * 0.4 }));
  S.quieto = [0, 1].map(f => fotoFallen({ sy: f ? 1.02 : 1 }, { capa: f }));
  S.carga = fotoFallen({ inc: -0.25, sx: 1.06, sy: 0.94 }, { mx: 1, my: -32, sa: -2.5, capa: 2 });
  S.golpe = fotoFallen({ inc: 0.3, sx: 1.12, sy: 0.92 }, { mx: 11, my: -15, sa: 0.45, la: -2, lb: 2, capa: 3 });
  S.dano = fotoFallen({ inc: -0.3 }, { cara: 'x', mx: 5, my: -10, sa: 1.5, capa: 1 });
}

/* ---------- SoporteBot: bot de atención al cliente con cascos, llave inglesa y un cable pelado ---------- */
function soporte(p, o) {
  const P = PAL_E;
  p.parte(F.rr(-3, -7, 6, 4, 1), P.nave, { sombra: 1 });
  p.parte(F.tr(-7, -18, -12, -24 + o.brazo, 1.5), P.gris, { sombra: 0 });
  p.parte(F.un(F.rr(-15, -28 + o.brazo, 3, 6, 0.8), F.rr(-16, -29 + o.brazo, 5, 2.4, 0.8)), P.metal, { sombra: 0 });
  p.parte(F.ov(0, -15, 9, 8.5), P.ala, { sombra: 3 });
  p.parte(F.ov(0, -14.5, 5, 5), P.cian, { sombra: 0, luz: false });
  p.plano(F.menos(F.menos(F.ov(0, -14, 3.4, 3.4), F.ov(0, -14, 2.2, 2.2)), F.re(-1, -18, 2, 3)), '#1d3f8a'); p.plano(F.re(-0.5, -18, 1, 3.6), '#1d3f8a');
  p.parte(F.tr(7, -17, o.mx, o.my, 1.5), P.gris, { sombra: 0 });
  p.parte(F.rr(o.mx - 1, o.my - 2, 4, 4, 1), PAL_T.verde, { sombra: 0 });
  p.plano(F.un(F.re(o.mx + 3, o.my - 1.5, 2, 0.8), F.re(o.mx + 3, o.my + 0.7, 2, 0.8)), '#d6dceb');
  if (o.chispa) { p.px(o.mx + 6, o.my - 2, '#fff3a0'); p.px(o.mx + 7, o.my, '#ffcb3d'); p.px(o.mx + 6, o.my + 2, '#fff3a0'); }
  p.parte(F.ov(0, -29, 7.6, 6.8), P.gris, { sombra: 2 });
  p.parte(F.rr(-5.5, -32, 12, 5.4, 2), P.pant, { sombra: 0 });
  if (o.cara === 'x') { for (const cx of [-2, 3]) { p.px(cx - 0.5, -30, '#e8f1ff'); p.px(cx + 0.5, -29, '#e8f1ff'); p.px(cx + 0.5, -30, '#e8f1ff'); p.px(cx - 0.5, -29, '#e8f1ff'); } }
  else for (const cx of [-2, 3]) for (let k = -1; k <= 1; k++) p.px(cx + k, -29.6 + (k === 0 ? -0.6 : 0), '#e8f1ff');
  p.plano(F.y(F.menos(F.ov(0, -30, 9.4, 8.6), F.ov(0, -30, 8, 7.2)), F.re(-12, -42, 24, 11)), '#1f2937');
  p.parte(F.rr(-10, -32, 3.4, 6, 1.2), P.oscuro, { sombra: 0 }); p.parte(F.rr(7, -32, 3.4, 6, 1.2), P.oscuro, { sombra: 0 });
  p.plano(F.tr(9, -26, 5, -24.5, 0.5), '#1f2937'); p.px(4.5, -24.5, '#ff3348');
}
const fotoSoporte = (t, c) => { const p = new Pincel(44, 44, 22, 40, Object.assign({ espejo: true }, t)); soporte(p, Object.assign({ brazo: 0, mx: 13, my: -16, chispa: false, cara: '' }, c)); return p.lienzo(); };
function creaSoporte() {
  const S = SPR.soporte = {};
  S.vuela = [0, 1, 2, 3].map(f => fotoSoporte({}, { brazo: [0, -1, 0, 1][f], my: -16 + [0, 1, 0, -1][f], chispa: f === 2 }));
  S.carga = fotoSoporte({ inc: -0.2 }, { mx: 10, my: -24, chispa: true, brazo: -2 });
  S.golpe = fotoSoporte({ inc: 0.25 }, { mx: 16, my: -15, chispa: true, brazo: 2 });
  S.dano = fotoSoporte({ inc: -0.3, sy: 1.05 }, { cara: 'x', mx: 9, my: -10, brazo: 3 });
}

/* ---------- Parche Día 1 (mini jefe): robot de 80 GB lleno de tiritas, siempre al 1 % ---------- */
function parche(p, o) {
  const P = PAL_E, Q = PAL_T, d = o.dy, Y = y => y + d, U = f => F.mueve(f, 0, d);
  p.parte(F.rr(-14, -9, 28, 9, 4), P.oscuro, { sombra: 2 });
  for (const x of [-9, -3, 3, 9]) p.plano(F.ov(x + o.rueda, -4.5, 1.8, 1.8), '#7d889e');
  p.parte(F.tr(-11, Y(-34), -17, Y(-20), 3.2), P.robotF, { sombra: 1 });
  p.parte(F.ov(-17.5, Y(-18), 4, 3.6), P.robotF, { sombra: 1 });
  const cuerpo = F.rr(-12, -41, 24, 33, 4);
  p.parte(U(cuerpo), P.robot, { sombra: 4, luz: 2 });
  p.parte(U(F.y(F.un(F.tr(-12, -38, 12, -14, 2.2), F.tr(-12, -16, 12, -40, 2.2)), cuerpo)), Q.venda, { sombra: 0 });
  p.parte(U(F.rr(-8, -35, 16, 11, 1)), pal('#1b2033', '#10131f', '#2a3048', '#0a0c14'), { sombra: 0, luz: false });
  letreroRecto(p, o.error ? 'ERR' : '1%', 0, Y(-34), o.error ? '#ff3348' : '#7be04a');
  p.plano(U(F.re(-6.5, -26.6, 13, 1.6)), '#3a4258'); p.plano(U(F.re(-6.5, -26.6, 1, 1.6)), '#7be04a');
  p.parte(U(F.rr(-8, -54, 16, 12, 2)), P.robot, { sombra: 2 });
  p.plano(U(F.rr(-6, -52, 12, 8, 1)), '#1b2033');
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, on = ((i - o.giro) % 8 + 8) % 8 < 3; p.px(Math.cos(a) * 2.6 + 0.5, Y(-48 + Math.sin(a) * 2.6), o.cara === 'x' ? '#ff3348' : on ? '#33e0ff' : '#2a3a5a'); }
  p.parte(U(F.y(F.tr(-8, -46, 0, -56, 1.8), F.rr(-8, -54, 16, 12, 2))), Q.venda, { sombra: 0 });
  p.plano(F.tr(0, Y(-54), 0, Y(-59), 0.6), OL); p.plano(F.pol(-2.4, Y(-58), 2.4, Y(-58), 0, Y(-55)), '#7be04a');
  p.parte(F.tr(11, Y(-34), o.mx, Y(o.my), 3.4), P.robot, { sombra: 1 });
  p.parte(F.ov(o.mx + 1, Y(o.my), 5, 4.6), P.robot, { sombra: 2 });
  p.parte(F.y(F.re(o.mx - 3, Y(o.my) - 1, 9, 2.2), F.ov(o.mx + 1, Y(o.my), 5, 4.6)), Q.venda, { sombra: 0 });
}
const fotoParche = (t, c) => { const p = new Pincel(70, 72, 34, 68, Object.assign({ espejo: true }, t)); parche(p, Object.assign({ dy: 0, rueda: 0, giro: 0, mx: 18, my: -20, cara: '', error: false }, c)); return p.lienzo(); };
function creaParche() {
  const S = SPR.parche = {};
  S.andar = [0, 1, 2, 3].map(f => fotoParche({}, { dy: f % 2 ? -1 : 0, rueda: f % 2 ? 1 : -1, giro: f * 2, my: -20 + (f % 2) }));
  S.quieto = [0, 1, 2, 3].map(f => fotoParche({}, { giro: f * 2 }));
  S.carga = fotoParche({ inc: -0.12, sx: 1.04, sy: 0.96 }, { mx: 10, my: -52, giro: 1 });
  S.golpe = fotoParche({ inc: 0.18, sx: 1.06, sy: 0.95 }, { mx: 24, my: -12, giro: 3 });
  S.dano = fotoParche({ inc: -0.2 }, { cara: 'x', mx: 14, my: -16, error: true });
  S.especial = [0, 1].map(f => fotoParche({ sy: f ? 1.04 : 1 }, { mx: 8, my: -56 + f, error: true, giro: f * 4 }));
}

/* ---------- El CEO de Microblizz (jefe): traje gris, corbata roja, gafas de sol y maletín de dinero ---------- */
function ceo(p, o) {
  const P = PAL_T, hy = o.hy, S = f => F.mueve(f, 0, hy);
  p.parte(F.rr(-9, -21, 7, 19, 2.4), P.trajeF, { sombra: 1 }); p.parte(F.rr(2, -21, 7, 19, 2.4), P.traje, { sombra: 1 });
  p.parte(F.ov(-5, -1.6, 5.6, 2.4), PAL_E.oscuro, { sombra: 0 }); p.parte(F.ov(6, -1.6, 5.6, 2.4), PAL_E.oscuro, { sombra: 0 });
  p.parte(F.tr(-11, -38 + hy, o.bx, o.by + hy, 3), P.trajeF, { sombra: 1 });
  p.parte(F.ov(o.bx, o.by + hy, 3, 3), P.piel, { sombra: 0 });
  p.parte(S(F.ov(0, -31, 15, 14.5)), P.traje, { sombra: 4, luz: 2 });
  p.plano(S(F.pol(-6, -44, 6, -44, 0, -31)), '#fff6ea');
  p.parte(S(F.pol(-1.8, -42, 1.8, -42, 3, -29, 0, -24, -3, -29)), PAL_E.rojo, { sombra: 1 });
  p.plano(S(F.re(7, -37, 4, 1.2)), '#fff6ea');
  p.parte(S(F.ov(0, -52, 10.5, 10.5)), P.piel, { sombra: 3, luz: 2 });
  p.parte(S(F.pol(-10.5, -53, -9, -63, 2, -63.5, 10, -61, 10.5, -55, 5, -59, -2, -58, -8, -56)), P.pelo, { sombra: 1 });
  if (o.cara === 'x') { p.parte(S(F.gira(F.un(F.rr(-8.6, -55.5, 7.4, 4.6, 1.6), F.rr(1.2, -55.5, 7.4, 4.6, 1.6)), 0.25, 0, -53)), PAL_E.oscuro, { sombra: 0 }); for (const cx of [-5, 5]) { p.px(cx - 0.5, -50.5 + hy, OL); p.px(cx + 0.5, -49.5 + hy, OL); } }
  else { p.parte(S(F.un(F.rr(-8.6, -55.5, 7.4, 4.6, 1.6), F.rr(1.2, -55.5, 7.4, 4.6, 1.6))), pal('#1b2033', '#10131f', '#3a4258', '#05060a'), { sombra: 0 }); p.plano(S(F.re(-1.2, -54, 2.4, 1)), '#111827'); p.px(-7, -54.6 + hy, '#ffffff'); p.px(3, -54.6 + hy, '#ffffff'); }
  if (o.boca) p.plano(S(F.ov(0, -46.5, 3, 2)), '#5a1530');
  else p.plano(S(F.un(F.tr(-4.4, -47, 0, -45.4, 0.6), F.tr(0, -45.4, 4.4, -47, 0.6))), '#5a1530');
  p.px(-7, -47.5 + hy, '#ff9ec4'); p.px(7, -47.5 + hy, '#ff9ec4');
  p.parte(F.tr(11, -37 + hy, o.mx, o.my + hy, 3), P.traje, { sombra: 1 });
  p.parte(F.rr(o.mx - 2, o.my + hy - 1, 15, 11, 2), P.cuero, { sombra: 2 });
  p.plano(F.un(F.re(o.mx + 2, o.my + hy - 3, 1, 2), F.re(o.mx + 8, o.my + hy - 3, 1, 2), F.re(o.mx + 2, o.my + hy - 3, 7, 1)), OL);
  letreroRecto(p, '$', o.mx + 5.5, o.my + hy + 1.5, '#9ef07a');
  p.parte(F.ov(o.mx, o.my + hy, 3, 3), P.piel, { sombra: 0 });
}
const fotoCeo = (t, c) => { const p = new Pincel(70, 82, 34, 78, Object.assign({ espejo: true }, t)); ceo(p, Object.assign({ hy: 0, mx: 14, my: -26, bx: -15, by: -24, cara: '', boca: false }, c)); return p.lienzo(); };
function creaCeo() {
  const S = SPR.ceo = {};
  S.quieto = [0, 1, 2, 3].map(f => fotoCeo({ sy: [1, 1.01, 1.02, 1.01][f] }, { hy: f === 2 ? -1 : 0, my: -26 + (f === 2 ? -1 : 0), boca: f === 3 }));
  S.carga = fotoCeo({ inc: -0.18, sx: 1.04, sy: 0.97 }, { mx: 2, my: -64, boca: true, bx: -16, by: -34 });
  S.golpe = fotoCeo({ inc: 0.2, sx: 1.06, sy: 0.96 }, { mx: 20, my: -20, boca: true });
  S.especial = [0, 1].map(f => fotoCeo({ sy: f ? 1.04 : 1 }, { mx: 8, my: -64 - f, bx: -14, by: -62 - f, boca: true, hy: -f }));
  S.dano = fotoCeo({ inc: -0.25 }, { cara: 'x', mx: 14, my: -20, boca: true });
}

function creaEnemigos3() { creaAbogadoCombate(); creaBecarioMes(); creaFallen(); creaSoporte(); creaParche(); creaCeo(); }
