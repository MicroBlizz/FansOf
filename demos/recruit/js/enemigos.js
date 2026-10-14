// Fans of Recruit · LOS DE MICROBLIZZ: el Becario (un robot de oficina con su café y su grapadora) y el Dron de KPIs (el
// StarBot de la serie, que vigila con una gráfica que siempre sube). Se dibujan mirando a la derecha; el juego los pinta en
// espejo cuando miran al conejo. Colores y piezas de sus dibujos de la serie (core/js/serie/arte/microblizz.js).
'use strict';

/* ---------- Becario ----------
   Mira a la derecha y un poco hacia ti: se le ve la pantalla. El brazo de delante lleva la grapadora y el de este lado, el café.
   o: la pose. dy sube o baja el cuerpo; la, lb son las patas; cara: '' cansado, 'susto', 'malo', 'x'; grapadora (gx, gy, ga =
   ángulo); taza (tx, ty; null = se le ha caído); ant mueve la antena; vapor, el humo del café; sudor = cuántas gotas */
function tazaCafe(p, tx, ty, vapor) {
  const P = MAT;
  p.parte(F.menos(F.ov(tx - 5.4, ty - 2.2, 2.4, 2.4), F.ov(tx - 5.4, ty - 2.2, 1, 1)), P.blanco, { r: 1, sombra: 0 });
  p.parte(F.rr(tx - 5.6, ty - 5.4, 6.6, 6.8, 1.2), P.blanco, { r: 2, sombra: 1 });
  p.raya(tx - 4.4, ty - 4.8, tx - 0.4, ty - 4.8, '#6b3a1c'); p.px(tx - 2.6, ty - 1.4, P.pantalla.c[3]); p.px(tx - 1.6, ty - 1.4, P.pantalla.c[3]);
  if (vapor !== undefined) for (let k = 0; k < 4; k++) p.px(tx - 2.6 + Math.round(Math.sin(k * 1.4 + vapor) * 1.2), ty - 7.4 - k * 1.7, k % 2 ? '#ffffff' : '#c9d2e4');
}
function becario(p, o) {
  const P = MAT, d = o.dy, U = f => F.mueve(f, 0, d);
  // patas de tubo con su zapato redondo
  for (const [x, l] of [[4, o.la], [-3.4, o.lb]]) {
    p.parte(F.tr(x, -8 + d, x + l, -2.4, 1.7), P.robotO, { r: 1.5, sombra: 0 });
    p.parte(F.fun(1, F.ov(x + l + 1.2, -1.9, 3.3, 2.1), F.ov(x + l - 0.6, -2.6, 2, 1.6)), P.robot, { r: 2, sombra: 1 });
  }
  // el brazo de delante con la grapadora roja: sale por detrás de la caja
  const gx = o.gx, gy = o.gy + d, a = o.ga, G = f => F.gira(F.mueve(f, gx, gy), a, gx, gy);
  p.parte(F.tr(9.5, -18.6 + d, gx - 1, gy + 0.6, 1.8), P.robotO, { r: 1.5, sombra: 0 });
  p.parte(G(F.rr(-2.6, 0.4, 13, 2.2, 0.8)), P.acero, { r: 1, sombra: 0 });
  p.parte(G(F.pol(-2.4, -4.4, 6, -4.2, 10.4, -2.4, 10.8, -0.2, -2.4, 0.2)), P.rojo, { r: 2, sombra: 1 });
  p.parte(F.ov(gx - 0.4, gy + 0.4, 2.5, 2.5), P.robot, { r: 2, sombra: 1 });
  // la caja: el lado (más oscuro) y el frente
  p.parte(U(F.rr(-12, -31, 20, 24, 4.5)), P.robotO, { r: 3, sombra: 0 });
  const idF = p.parte(U(F.rr(-8.5, -31, 20, 24, 4.5)), P.robot, { r: 3.5, sombra: 2 });
  // rejilla del lado, la franja clara de arriba y la junta de la cintura
  for (let k = 0; k < 3; k++) p.raya(-11, -25 + k * 2.6 + d, -10, -25 + k * 2.6 + d, null, 2);
  p.tono(U(F.rr(-6.5, -29.4, 16, 1.6, 0.6)), 1, idF);
  p.raya(-7.4, -15.6 + d, 10.4, -15.6 + d, null, -1);
  // la pantalla con la cara
  p.parte(U(F.rr(-5.6, -27, 14.4, 10, 2.4)), P.pantalla, { r: 2.5, sombra: 0 });
  const E = '#e8f1ff', ey = -22.4 + d, ojos = [-2.2, 5];
  if (o.cara === 'x') for (const cx of ojos) for (let k = -1; k <= 1; k++) { p.px(cx + k, ey + k, E); p.px(cx + k, ey - k, E); }
  else if (o.cara === 'susto') { for (const cx of ojos) { p.plano(U(F.ov(cx + 0.5, -22, 1.7, 2.1)), E); p.px(cx + 0.5, ey + 0.2, P.pantalla.c[1]); } p.plano(U(F.rr(0.4, -19.6, 3, 1.8, 0.6)), E); }
  else if (o.cara === 'malo') { for (const [cx, s] of [[-2.2, 1], [5, -1]]) { p.px(cx - s, ey - 1, E); p.px(cx, ey - 0.4, E); p.px(cx + s, ey + 0.2, E); p.px(cx, ey + 0.8, E); p.px(cx + s, ey + 0.8, E); } p.raya(0.5, -19 + d, 3.5, -19 + d, E); }
  else { for (const cx of ojos) { p.raya(cx - 1, ey, cx + 1.5, ey, E); p.px(cx + 0.5, ey + 1.2, P.pantalla.c[4]); } p.px(1.4, -19 + d, E); p.px(2.4, -19 + d, E); }
  p.tonoPx(-4.4, -26 + d, 2); p.tonoPx(-3.4, -26 + d, 2); p.tonoPx(-4.4, -25 + d, 1);
  // el cordón rojo con su tarjeta
  p.raya(-4.5, -14.6 + d, 0.8, -10.6 + d, P.rojo.c[3]); p.raya(7.6, -14.6 + d, 2.4, -10.6 + d, P.rojo.c[2]);
  p.parte(U(F.rr(-1.4, -11.4, 6, 5.6, 0.8)), P.blanco, { r: 1, sombra: 1 });
  p.raya(-0.4, -10.2 + d, 3.2, -10.2 + d, P.pantalla.c[3]); p.px(0.6, -8 + d, P.robot.c[1]); p.px(1.6, -8 + d, P.robot.c[1]); p.px(2.6, -8 + d, P.robot.c[1]);
  // remaches y un desconchón
  p.remache(-6.6, -9.2 + d); p.remache(9, -9.2 + d); p.remache(-6.6, -17.6 + d); p.remache(9, -17.6 + d);
  p.tonoPx(6.4, -12.4 + d, -1); p.tonoPx(7.4, -11.4 + d, -1); p.tonoPx(7.4, -12.4 + d, -1);
  // la antena con su bola roja
  p.raya(1, -31 + d, 1 + o.ant, -36 + d, P.robotO.c[0]);
  p.parte(F.ov(1.4 + o.ant, -37.6 + d, 2.3, 2.3), P.rojo, { r: 2.3, sombra: 0 });
  // el brazo de este lado con la taza de café y su vapor
  const tx = o.tx, ty = o.ty === null ? -11 + d : o.ty + d;
  p.parte(F.tr(-10.6, -19 + d, tx, ty - 0.4, 1.8), P.robotO, { r: 1.5, sombra: 1 });
  if (o.ty !== null) tazaCafe(p, tx, ty, o.vapor);
  p.parte(F.ov(tx - 0.4, ty - 0.6, 2.4, 2.4), P.robot, { r: 2, sombra: 1 });
  if (o.sudor) for (let k = 0; k < o.sudor; k++) { const sx = 13.5 + k * 3.2, sy = -30 - k * 2.6 + d; p.px(sx, sy, P.cian.c[4]); p.px(sx, sy + 1, P.cian.c[3]); p.px(sx + 1, sy + 1, P.cian.c[2]); }
  return giraP(gx + 11.5, gy - 0.8, a, gx, gy);   // por donde salen las grapas
}
const POSE_BECARIO = { dy: 0, la: 0, lb: 0, cara: '', gx: 15, gy: -15, ga: 0, tx: -13.5, ty: -12, ant: 0 };
const fotoBecario = (t, c) => { const p = new Pincel(72, 58, 31, 54, t); const boca = becario(p, Object.assign({}, POSE_BECARIO, c)); const s = p.lienzo(); s.boca = bocaDeformada(boca, t); return s; };

/* ---------- Dron de KPIs ----------
   o: helice (0 a 3, el giro), scan (el punto rojo del visor), ant, cara 'x', tablet (cuánto baila la gráfica) */
const estrella = (cx, cy, R, r) => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; pts.push(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } return F.pol(...pts); };
function dronKpi(p, o) {
  const P = MAT;
  // los brazos con sus hélices (un borrón que gira)
  for (const [x, lejos] of [[-12, true], [13, false]]) {
    p.parte(F.tr(x * 0.4, -21, x, -25.5, 1.4), lejos ? P.nave : P.robotO, { r: 1.2, sombra: 0 });
    const an = [7.5, 5, 2.2, 5][(o.helice + (lejos ? 2 : 0)) % 4];
    p.plano(F.ov(x, -27.4, an, 1.1), '#c9d6ee'); p.plano(F.ov(x, -27.4, Math.max(1, an - 2.5), 0.6), '#ffffff');
    p.parte(F.rr(x - 1.2, -26.6, 2.4, 2.6, 0.8), P.robotO, { r: 1, sombra: 0 });
  }
  // el cañón de detrás, la panza con su estrella y la cabeza con el visor
  p.parte(F.rr(-3.4, -8.6, 6.8, 4, 1.4), P.robotO, { r: 1.5, sombra: 0 });
  p.parte(F.ov(0, -15.4, 9, 8), P.nave, { r: 7, sombra: 0 });
  p.plano(estrella(-1.6, -14.4, 3.9, 1.7), '#cdbb6e', { sobre: true }); p.px(-1.6, -14.8, '#efe6b4'); p.px(-0.6, -12.6, '#8f7f3e'); p.px(-2.6, -12.6, '#8f7f3e');
  p.parte(F.ov(1.4, -24, 7, 5.8), P.ala, { r: 5, sombra: 2 });
  p.parte(F.rr(0.4, -26.4, 8.6, 3.8, 1.6), P.cian, { r: 1.6, sombra: 0 });
  if (o.cara === 'x') { for (const cx of [3, 6.6]) { p.px(cx, -25.2, TINTA); p.px(cx + 1, -24.2, TINTA); p.px(cx + 1, -25.2, TINTA); p.px(cx, -24.2, TINTA); } }
  else { p.px(3.4 + o.scan, -24.6, P.rojo.c[3]); p.px(4.4 + o.scan, -24.6, P.rojo.c[4]); }
  p.raya(-2, -29.4, -3.4 + o.ant, -33.4, P.robotO.c[0]); p.parte(F.ov(-3.6 + o.ant, -34.6, 1.8, 1.8), P.oro, { r: 1.8, sombra: 0 });
  // la pinza con la tableta: la gráfica que siempre sube
  p.parte(F.tr(6.5, -12, 10.5, -8.5, 1.3), P.robotO, { r: 1.2, sombra: 1 });
  p.parte(F.rr(7.4, -9.6, 12.6, 9.6, 1.2), P.robotO, { r: 1.2, sombra: 1 });
  p.plano(F.rr(8.6, -8.4, 10.2, 7.2, 0.4), '#0f2a1c');
  const pts = [[9.2, -2.4], [11.4, -4 - o.tablet], [13.2, -3.2], [15.2, -5.6 - o.tablet], [17.6, -7.2]];
  for (let k = 0; k < pts.length - 1; k++) p.raya(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], '#7be04a');
  p.px(17.6, -6.2, '#7be04a'); p.px(16.6, -7.2, '#7be04a'); p.px(9.2, -7.4, P.rojo.c[3]);
  // el propulsor de abajo
  if (o.llama) { p.plano(F.ov(0, -3.6, 2.2, 1.6 + o.llama), P.cian.c[4]); p.px(0, -3.4, '#ffffff'); }
}
const POSE_DRON = { helice: 0, scan: 0, ant: 0, cara: '', tablet: 0, llama: 1 };
const fotoDron = (t, c) => { const p = new Pincel(56, 46, 26, 42, t); dronKpi(p, Object.assign({}, POSE_DRON, c)); return p.lienzo(); };
// la taza del becario asustado, por los aires, derramando el café
function fotoTazaVolando() {
  const p = new Pincel(24, 22, 10, 12), P = MAT, a = 0.95, G = f => F.gira(f, a, 0, 0);
  p.parte(G(F.menos(F.ov(-5, 0.4, 2.4, 2.4), F.ov(-5, 0.4, 1, 1))), P.blanco, { r: 1, sombra: 0 });
  p.parte(G(F.rr(-3.4, -3.4, 6.6, 6.8, 1.2)), P.blanco, { r: 2, sombra: 0 });
  { const [x, y] = giraP(0, -2.6, a, 0, 0), [x2, y2] = giraP(1, -2.6, a, 0, 0); p.px(x, y, '#6b3a1c'); p.px(x2, y2, '#6b3a1c'); }
  for (const [x, y, c] of [[5, -5, '#8a4e26'], [7, -3, '#6b3a1c'], [8, -7, '#6b3a1c'], [10, -4, '#8a4e26'], [6, -9, '#8a4e26'], [11, -8, '#6b3a1c'], [9, 0, '#6b3a1c']]) { p.px(x, y, c); if ((x + y) % 2) p.px(x + 1, y, c); }
  return p.lienzo();
}
