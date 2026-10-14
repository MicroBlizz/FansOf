// Fans of Recruit · CRAZYBUNNY, EL RECLUTA: de perfil y girado un poquito hacia ti (se ve el ojo normal junto al hocico).
// Corona torcida, capa naranja, ojo en espiral, chaleco de recluta, canana de zanahorias y su ametralladora. Se dibuja pieza
// a pieza en cada pose: las patas por un lado y el cuerpo por otro, para que pueda correr, saltar o agacharse apuntando a
// donde quiera. Colores de su dibujo de la serie (core/js/serie/arte/animales.js).
'use strict';

const SPR = {};   // todos los fotogramas del juego, por personaje y animación
const BOCA = '#5a1530', LENGUA = '#ff7aa8', ESPIRAL = '#8a2bff', NARIZ = '#ff6f9f';
const ESPIRAL_PX = ['.####..', '#....#.', '#.##.#.', '#.#..#.', '#.####.', '#......', '.#####.'];
const mix2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/* ---------- las patas ----------
   c = la cadera, r = la rodilla, t = el talón, a = el ángulo del pie (0 = plano hacia delante) */
function pataConejo(p, M, c, r, t, a) {
  const dx = Math.cos(a), dy = Math.sin(a);
  // la caña, el pie largo de conejo y el muslo redondo
  p.parte(F.tr(r[0], r[1], t[0] + dx * 0.6, t[1] + dy * 0.6 - 1.2, 2.3, 2), M, { r: 2.2, sombra: 1 });
  p.parte(F.fun(1.5, F.tr(t[0], t[1], t[0] + dx * 8, t[1] + dy * 8, 2.5, 2.3), F.ov(t[0] + dx * 7.6, t[1] + dy * 7.6 - 0.5, 2.7, 2.4)), M, { r: 2.6, sombra: 1 });
  p.parte(F.fun(2.5, F.ov(c[0] + (r[0] - c[0]) * 0.3, c[1] + (r[1] - c[1]) * 0.3, 4.4, 4.7), F.ov(r[0], r[1], 2.7, 2.7)), M, { r: 4.4, sombra: 2 });
  // los dedos: dos rayitas en la punta
  const px = t[0] + dx * 9.8, py = t[1] + dy * 9.8;
  p.tonoPx(px - dx * 1.6, py - dy * 1.6 + 0.4, -1); p.tonoPx(px - dx * 3.4, py - dy * 3.4 + 0.8, -1);
}

/* ---------- la ametralladora ----------
   (gx, gy) es la empuñadura y a el ángulo (0 = hacia delante, negativo = hacia arriba). Devuelve la boca del cañón */
function ametralladora(p, gx, gy, a) {
  const G = f => F.gira(F.mueve(f, gx, gy), a, gx, gy), P = (x, y) => giraP(gx + x, gy + y, a, gx, gy), A = MAT.acero;
  // culata de madera
  p.parte(G(F.pol(-11, -3.4, -4, -3.6, -4, 0.6, -9, 3.4, -12, 2.2)), MAT.madera, { r: 2, sombra: 1 });
  // cañón, con su bocacha, y el guardamanos de madera debajo
  p.parte(G(F.tr(12, -1.6, 22, -1.6, 1.25)), A, { r: 1.2, sombra: 1 });
  p.parte(G(F.rr(21, -3.4, 4, 3.8, 1)), A, { r: 1.4, sombra: 1 });
  p.parte(G(F.rr(11.5, -1, 7, 3.2, 1.2)), MAT.madera, { r: 1.5, sombra: 1 });
  // cargador de zanahoria (la munición de la casa)
  p.parte(G(F.tr(5.6, 1.6, 8.6, 9, 2.3, 1)), MAT.capa, { r: 2.2, sombra: 1 });
  // el cuerpo del arma y la empuñadura
  p.parte(G(F.rr(-0.8, 0.8, 3.2, 5, 1)), A, { r: 1.2, sombra: 0 });
  p.parte(G(F.pol(-4.5, -4.6, 12.5, -4.6, 13.5, -3, 13.5, 1.4, -4.5, 1.4)), A, { r: 2.2, sombra: 1 });
  // mira, ventana del cerrojo dorada, tornillo y rayas del cargador
  { const [x, y] = P(8.5, -5.2); p.pxm(x, y, A, 0); p.pxm(x + Math.cos(a), y + Math.sin(a), A, 0); }
  { const [x, y] = P(2.2, -1.8); p.pxm(x, y, MAT.oro, 4); const [x2, y2] = P(3.2, -1.8); p.pxm(x2, y2, MAT.oro, 3); const [x3, y3] = P(4.2, -1.8); p.pxm(x3, y3, MAT.oro, 2); }
  { const [x, y] = P(6.4, 4.5); p.tonoPx(x, y, -1); const [x2, y2] = P(7.2, 6.6); p.tonoPx(x2, y2, -1); }
  { const [x, y] = P(-7, -1); p.tonoPx(x, y, -1); }
  return P(25.5, -1.6);
}

/* ---------- el cuerpo ---------- */
function ojoEspiral(p, ex, ey, giro, o) {
  const T = MAT.pelo.c[0];
  if (o.ojo === 'x') { for (let d = -1.5; d <= 1.5; d++) { p.px(ex + d, ey + d, T); p.px(ex + d, ey - d, T); } return; }
  p.plano(F.ov(ex, ey, 4.2, 4.5), T);
  p.plano(F.ov(ex, ey, 3.3, 3.6), '#ffffff');
  p.px(ex + 2.4, ey + 2.3, MAT.pelo.c[2]); p.px(ex + 1.4, ey + 3.1, MAT.pelo.c[2]); p.px(ex + 2.9, ey + 1.2, MAT.pelo.c[2]);
  const g4 = ((Math.round(giro / 1.5708) % 4) + 4) % 4;
  ESPIRAL_PX.forEach((fila, j) => { for (let i = 0; i < 7; i++) if (fila[i] === '#') { const [u, v] = [[i - 3, j - 3], [3 - j, i - 3], [3 - i, 3 - j], [j - 3, 3 - i]][g4]; p.px(ex + u, ey + v + 0.2, ESPIRAL); } });
  if (o.ojo === 'furia') p.raya(ex - 3.6, ey - 5, ex + 3.4, ey - 3.4, T);
}
// la capa: una cinta que sale del cuello. vuelo 0 = cae por la espalda, 1 = vuela hacia atrás; fase la hace ondear
function capaConejo(p, o, cuello) {
  const v = o.vuelo, f = o.fase, w = k => Math.sin(f + k * 1.7) * o.capa * (0.5 + k * 0.5);
  const cae = [[0, 0], [-3.8, 4], [-5.8, 10], [-6.4, 16.6]], vuela = [[0, 0], [-7, -0.6], [-14.5, 1], [-22.5, -0.4]];
  const pts = cae.map((c, k) => { const q = mix2(c, vuela[k], v); return [cuello[0] + q[0] + (1 - v) * w(k) * 0.6, cuello[1] + q[1] + v * w(k) * 1.5]; });
  const an = [2, 4 - v * 0.4, 5.2 - v * 0.8, 5.8 - v * 1.4];
  const id = p.parte(F.cinta(pts, an, 3, 2.4), MAT.capa, { r: 2.4, sombra: 0 });
  // los pliegues a lo largo: dos en sombra y uno con luz
  const lado = (k, s) => { const a = pts[Math.max(0, k - 1)], b = pts[Math.min(3, k + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [pts[k][0] - (b[1] - a[1]) / l * s, pts[k][1] + (b[0] - a[0]) / l * s]; };
  p.tono(F.cinta([lado(1, 1.2), lado(2, 1.9), lado(3, 2.4)], [0.5, 0.8, 0.9]), -1, id);
  p.tono(F.cinta([lado(1, -1.6), lado(2, -2.4), lado(3, -2.6)], [0.4, 0.7, 0.8]), -1, id);
  p.tono(F.cinta([lado(1, -0.2), lado(2, -0.2), lado(3, 0)], [0.4, 0.7, 0.7]), 1, id);
  return id;
}
// o: la pose. hx, hy mueven la cabeza; by sube o baja el cuerpo; oa, ob, od son las orejas; capa, fase y vuelo, la capa;
// ap, a dónde apunta; boca y ojo, la cara. Devuelve lo que necesita brazoConejo
function torsoConejo(p, o) {
  const P = MAT, hx = o.hx, hy = o.hy, by = o.by;
  // la oreja del otro lado (la doblada), detrás de todo
  const rf = [8 + hx, -37 + hy], kf = [rf[0] + Math.sin(o.ob) * 10, rf[1] - Math.cos(o.ob) * 10], tf = [kf[0] + Math.cos(o.od) * 6.5, kf[1] + Math.sin(o.od) * 6.5];
  p.parte(F.fun(1.5, F.tr(rf[0], rf[1], kf[0], kf[1], 3, 2.7), F.tr(kf[0], kf[1], tf[0], tf[1], 2.7, 1.9)), P.peloF, { r: 2.6, sombra: 0 });
  capaConejo(p, o, [-2.4 + hx * 0.5, -23.2 + by]);
  // el brazo del otro lado sujeta el arma por delante
  const A = o.ap, sh = [-0.6 + hx * 0.4, -21.4 + by], g = giraP(sh[0] + 7.2, sh[1] + 5.8, A, sh[0] + 1, sh[1] + 1);   // g: la empuñadura
  const mano2 = giraP(g[0] + 14, g[1] + 0.8, A, g[0], g[1]);
  p.parte(F.tr(sh[0] + 6, sh[1] + 1.5, mano2[0], mano2[1], 2.3, 2.1), P.peloF, { r: 2.2, sombra: 0 });
  // la cola de algodón
  p.parte(F.un(F.ov(-7.6, -11.6 + by, 3.2, 3), F.ov(-8.8, -13.2 + by, 2.1, 2.1)), P.pelo, { r: 3, sombra: 1 });
  // el cuerpo con su chaleco de recluta: asoma el pecho blanco por el cuello y la barriga por debajo
  const cuerpo = F.ov(0.4, -16.6 + by, 6.7, 7.9, 0.12);
  p.parte(cuerpo, P.pelo, { r: 6 });
  const chaleco = F.y(F.gordo(cuerpo, 0.6), F.rr(-9, -24 + by, 20, 12.4, 2));
  const idCh = p.parte(chaleco, P.caqui, { r: 5, sombra: 1 });
  // bolsillo con su solapa y la costura de la espalda
  p.tono(F.rr(1.6, -18.6 + by, 4.6, 4, 0.6), 1, idCh); p.raya(1.6, -18.2 + by, 5.8, -18.2 + by, null, -2); p.tonoPx(3.8, -16.6 + by, -2);
  p.raya(-3.4, -22.6 + by, -2.6, -12.6 + by, null, -1);
  // la canana con sus zanahorias y el cinturón con la hebilla
  p.parte(F.y(F.tr(-5.2, -23 + by, 6.4, -12.4 + by, 1.5), F.gordo(cuerpo, 0.7)), P.cuero, { r: 1.5, sombra: 1 });
  for (const t of [0.2, 0.46, 0.72]) { const x = -5.2 + 11.6 * t, y = -23 + 10.6 * t + by; p.pxm(x, y, P.capa, 4); p.pxm(x + 0.9, y + 0.9, P.capa, 2); p.pxm(x - 0.8, y - 0.9, P.hoja, 4); }
  p.parte(F.y(F.rr(-7, -12 + by, 15, 2.8, 0.6), F.gordo(cuerpo, 0.7)), P.cuero, { r: 1.2, sombra: 1 });
  p.pxm(5.2, -11 + by, P.oro, 5); p.pxm(6.2, -11 + by, P.oro, 3); p.pxm(5.2, -10.1 + by, P.oro, 3); p.pxm(6.2, -10.1 + by, P.oro, 1);
  // el nudo de la capa al cuello
  p.parte(F.ov(0.6 + hx * 0.5, -23.6 + by, 4.8, 1.9, 0.1), P.capa, { r: 2, sombra: 1 });
  return { A, sh, g };
}
function cabezaConejo(p, o) {
  const P = MAT, hx = o.hx, hy = o.hy;
  const craneo = F.ov(3 + hx, -31.4 + hy, 9.6, 8.7), cabeza = F.fun(3, craneo, F.ov(10.8 + hx, -28 + hy, 4.5, 3.8));
  p.parte(cabeza, P.pelo, { r: 8, sombra: 3 });
  // el ojo normal, el del otro lado: asoma junto al hocico
  const ex2 = 9.5 + hx, ey2 = -33.4 + hy, dentro = F.gordo(craneo, -0.8);
  if (o.ojo !== 'x') {
    p.plano(F.y(F.ov(ex2, ey2, 3, 3.9), dentro), P.pelo.c[0]);
    p.plano(F.y(F.ov(ex2, ey2, 2.1, 3), F.gordo(craneo, -1.6)), '#ffffff');
    p.plano(F.y(F.rr(ex2 + 0.4, ey2 - 1.5, 1.2, 2.8, 0), F.gordo(craneo, -1.6)), P.pelo.c[0]);
  }
  // el mechón de la mejilla, por detrás
  p.parte(F.pol(-6 + hx, -28.5 + hy, -9.6 + hx, -25 + hy, -5.4 + hx, -26 + hy, -7.2 + hx, -22.4 + hy, -2 + hx, -24.6 + hy), P.pelo, { r: 2, sombra: 0 });
  // la oreja larga de este lado, con el rosa de dentro
  const ra = [-1 + hx, -37.2 + hy], ca = [ra[0] + Math.sin(o.oa) * 10, ra[1] - Math.cos(o.oa) * 10];
  p.parte(F.ov(ca[0], ca[1], 3.6, 11, o.oa), P.pelo, { r: 3.6, sombra: 2 });
  p.parte(F.ov(ca[0] + Math.cos(o.oa) * 0.7, ca[1] + Math.sin(o.oa) * 0.7 + 0.8, 1.6, 7.8, o.oa), P.rosa, { r: 1.6, linea: false, sombra: 0 });
  // la corona torcida: tres puntas, su banda y la piedra roja
  const cx = 4 + hx, cy = -39 + hy, ac = -0.2 + o.corona, K = f => F.gira(F.mueve(f, cx, cy), ac, cx, cy), kp = (x, y) => giraP(cx + x, cy + y, ac, cx, cy);
  p.parte(K(F.pol(-6, 1, 6, 1, 6.6, -6.4, 3, -2.8, 0, -8, -3, -2.8, -6.6, -6.4)), P.oro, { r: 2.4, sombra: 2 });
  p.tono(K(F.rr(-6, -1.2, 12, 1.2, 0)), -1);
  for (const [x, y] of [[-6, -5.4], [0, -6.8], [6, -5.4]]) { const [u, v] = kp(x, y); p.pxm(u, v, P.oro, 5); }
  { const [x, y] = kp(-0.5, -2.6); p.pxm(x, y, P.rojo, 4); p.pxm(x + 1, y, P.rojo, 3); p.pxm(x, y + 1, P.rojo, 2); p.pxm(x + 1, y + 1, P.rojo, 1); }
  // la cara: el ojo en espiral, la nariz, la boca con sus dos dientes y el colorete
  ojoEspiral(p, 3 + hx, -32.4 + hy, o.esp, o);
  p.px(14.4 + hx, -29.8 + hy, NARIZ); p.px(14.4 + hx, -28.8 + hy, NARIZ); p.px(13.4 + hx, -29.8 + hy, '#ffa9c6');
  const mx = 10.8 + hx, my = -25.5 + hy;
  if (o.boca === 'grito') {
    p.plano(F.ov(mx, my + 0.9, 3.1, 3.3), BOCA);
    p.px(mx + 0.4, my - 1.4, '#ffffff'); p.px(mx + 1.4, my - 1.4, '#ffffff'); p.px(mx + 0.4, my - 0.4, '#e6e4f6'); p.px(mx + 1.4, my - 0.4, '#e6e4f6');
    p.plano(F.ov(mx - 0.4, my + 2.8, 1.6, 1), LENGUA);
  } else if (o.boca === 'ay') { for (let i = 0; i < 5; i++) p.px(mx - 2 + i, my + (i % 2 ? -0.5 : 0.5), BOCA); }
  else {
    p.plano(F.menos(F.ov(mx, my, 3.3, 2.7), F.rr(-60, -90, 120, 90 + my, 0)), BOCA);
    p.px(mx + 0.4, my + 0.4, '#ffffff'); p.px(mx + 1.4, my + 0.4, '#ffffff');
    p.px(mx - 1, my + 1.7, LENGUA); p.px(mx, my + 1.7, LENGUA);
  }
  p.px(1.6 + hx, -26.4 + hy, '#ffb3cf'); p.px(2.6 + hx, -26.4 + hy, '#ffb3cf'); p.px(0.6 + hx, -26.4 + hy, '#ffd3e2'); p.px(3.6 + hx, -26.4 + hy, '#ffd3e2');
}
// el brazo de este lado y el arma. T: lo que devuelve torsoConejo. Devuelve la boca del cañón
function brazoConejo(p, o, T) {
  const P = MAT, { A, sh, g } = T;
  const boca = ametralladora(p, g[0], g[1], A);
  const codo = [sh[0] - 0.8 - Math.sin(A) * 1.5, sh[1] + 5.4];
  p.parte(F.fun(1.5, F.tr(sh[0], sh[1], codo[0], codo[1], 2.7, 2.5), F.tr(codo[0], codo[1], g[0] - 1.6, g[1] + 0.6, 2.5, 2.2)), P.pelo, { r: 2.6, sombra: 2 });
  // el hombro del chaleco, la muñequera de cuero y la mano
  p.parte(F.ov(sh[0] - 0.2, sh[1] - 0.4, 3.2, 2.7), P.caqui, { r: 2.6, sombra: 1 });
  p.parte(F.tr(g[0] - 2.6, g[1] - 0.6, g[0] - 2.2, g[1] + 2.4, 1.5), P.cuero, { r: 1.2, sombra: 0 });
  p.parte(F.ov(g[0] + 0.4, g[1] + 1, 2.6, 2.6), P.pelo, { r: 2.6, sombra: 1 });
  return boca;
}

const POSE_CONEJO = { hx: 0, hy: 0, by: 0, fase: 0, capa: 0.5, vuelo: 0, oa: -0.5, ob: 0.25, od: 0.35, corona: 0, ojo: 'loco', boca: 'risa', esp: 0, ap: 0,
  cad: [-0.6, -9.6], pa: { r: [3.4, -6.2], t: [0.6, -2.4], a: 0 }, pb: { r: [1.2, -5.8], t: [-5.4, -2.4], a: 0 } };
// un fotograma entero (patas y cuerpo juntos); el juego los pide por separado
function conejoEntero(p, o) {
  const c = o.cad;
  pataConejo(p, MAT.peloF, [c[0] + 2.8, c[1] - 0.4], [o.pa.r[0] + 2.8, o.pa.r[1] - 0.4], [o.pa.t[0] + 3.4, o.pa.t[1] - 0.6], o.pa.a);
  const T = torsoConejo(p, o);
  pataConejo(p, MAT.pelo, c, o.pb.r, o.pb.t, o.pb.a);
  cabezaConejo(p, o);
  return brazoConejo(p, o, T);
}
const fotoConejo = (t, cambios) => { const p = new Pincel(92, 82, 38, 76, t); const boca = conejoEntero(p, Object.assign({}, POSE_CONEJO, cambios)); const s = p.lienzo(); s.boca = boca; return s; };
