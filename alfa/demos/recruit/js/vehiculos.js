// Fans of Recruit · LA MECHAVACA: el «tanque» del juego. Una vaca pilota un mecha rosa con manchas de vaca, pezuñas, cuernos,
// un bidón de leche a la espalda y un cañón. Mira a la derecha. Colores de su dibujo de la serie (core/js/serie/arte/animales.js).
'use strict';

// una pata del mecha: cadera (c), rodilla (r), tobillo (t). lejos = la del otro lado, más apagada
function pataMecha(p, c, r, t, lejos) {
  const P = MAT, M = lejos ? P.mechaO : P.mecha;
  p.parte(F.tr(r[0], r[1], t[0], t[1], 3.6, 3), M, { r: 3, sombra: 1 });
  // la pezuña, con su brillo y la raja
  const s = t[1] + 6;   // cuánto levanta la pezuña del suelo (0 = apoyada)
  p.parte(F.pol(t[0] - 6.5, s, t[0] - 5.4, s - 4.6, t[0] - 2, s - 6.4, t[0] + 4.6, s - 6, t[0] + 7.4, s - 2.6, t[0] + 7.4, s), lejos ? P.negro : P.robotO, { r: 2.5, sombra: 1 });
  if (!lejos) { p.raya(t[0] + 2.4, s - 5, t[0] + 3.4, s - 1, null, -2); p.tonoPx(t[0] - 2.6, s - 4.4, 1); p.tonoPx(t[0] - 1.6, s - 4.4, 1); }
  p.parte(F.tr(c[0], c[1], r[0], r[1], 5.2, 4.2), M, { r: 4, sombra: 2 });
  p.parte(F.ov(r[0], r[1], 3.3, 3.3), P.robotO, { r: 3, sombra: 1 });
  p.remache(r[0] - 0.5, r[1] - 0.5);
  if (!lejos) { p.parte(F.ov(c[0], c[1], 5, 5), P.robotO, { r: 4.5, sombra: 2 }); p.parte(F.ov(c[0], c[1], 2.4, 2.4), P.acero, { r: 2, sombra: 0 }); }
}
// la vaca que se ve por la cúpula. (x, y) = centro de la cabeza; cara: '' tranquila, 'susto', 'x'; dentro = hasta dónde se pinta
function vacaPiloto(p, x, y, cara, dentro) {
  const P = MAT, V = f => F.y(f, dentro);
  p.parte(V(F.pol(x - 4.6, y - 4, x - 6.6, y - 9.4, x - 1.6, y - 5.6)), P.carton, { r: 1.5, sombra: 0 });      // cuerno
  p.parte(V(F.ov(x - 5.6, y - 1.6, 3, 1.8, 0.5)), P.blanco, { r: 1.5, sombra: 0 });                              // oreja
  p.parte(V(F.ov(x, y, 6.4, 5.8)), P.blanco, { r: 5, sombra: 0 });
  p.parte(V(F.ov(x - 2.8, y - 2.6, 3, 2.4, 0.4)), P.negro, { r: 2, sombra: 0, linea: false });                   // la mancha del ojo
  p.parte(V(F.ov(x + 5, y + 2, 4, 3)), P.rosa, { r: 2.5, sombra: 0 });                                           // el morro
  p.px(x + 5.4, y + 1.6, P.rosa.c[0]); p.px(x + 7, y + 2.2, P.rosa.c[0]);
  // la cinta rosa del pelo y el ojo
  p.raya(x - 4, y - 5.2, x + 2.6, y - 5.6, P.mecha.c[2]);
  const E = TINTA;
  if (cara === 'x') { p.px(x + 0.6, y - 2, E); p.px(x + 2.6, y - 2, E); p.px(x + 1.6, y - 1, E); p.px(x + 0.6, y, E); p.px(x + 2.6, y, E); }
  else if (cara === 'susto') { p.plano(V(F.ov(x + 1.8, y - 1.2, 1.8, 2)), '#ffffff'); p.px(x + 2.2, y - 1.2, E); }
  else { p.px(x + 1.4, y - 1.6, E); p.px(x + 2.4, y - 1.6, E); p.px(x + 1.4, y - 0.6, E); p.px(x + 2.4, y - 0.6, '#ffffff'); }
}
/* o: la pose. by sube o baja el casco; pa, pb = patas ({ r: rodilla, t: tobillo }); ca = ángulo del cañón; cola = cuánto se
   mueve la cola; humo = fotograma del tubo de escape; cara = la de la vaca. Devuelve la boca del cañón */
function mechaVaca(p, o) {
  const P = MAT, b = o.by, U = f => F.mueve(f, 0, b);
  pataMecha(p, [9, -25 + b], [o.pa.r[0], o.pa.r[1]], o.pa.t, true);
  // la cola: un cable con su mechón
  const cola = [[-23, -40 + b], [-29, -41 + b + o.cola * 0.5], [-33, -46 + b + o.cola], [-34.5, -52 + b + o.cola * 1.4]];
  p.parte(F.cinta(cola, [1.2, 1.1, 1, 0.9]), P.robotO, { r: 1, sombra: 0 });
  p.parte(F.ov(cola[3][0] - 0.4, cola[3][1] - 1.6, 2.4, 3), P.blanco, { r: 2, sombra: 0 });
  // los tubos de escape
  for (const [x, lejos] of [[-12, true], [-17, false]]) {
    p.parte(F.tr(x, -50 + b, x - 4.6, -60 + b, 2.2), lejos ? P.robotO : P.acero, { r: 2, sombra: 0 });
    p.plano(F.ov(x - 5, -61 + b, 1.5, 1), TINTA);
  }
  // el bidón de leche a la espalda, con sus aros y su gota azul
  const bidon = U(F.rr(-33, -44, 13, 17, 5));
  const idB = p.parte(bidon, P.blanco, { r: 5, sombra: 1 });
  p.tono(U(F.rr(-33, -41, 13, 1.4, 0)), -2, idB); p.tono(U(F.rr(-33, -31.6, 13, 1.4, 0)), -2, idB);
  p.px(-27.4, -37.4 + b, P.pantalla.c[4]); p.px(-27.4, -36.4 + b, P.pantalla.c[3]); p.px(-28.4, -35.4 + b, P.pantalla.c[3]); p.px(-27.4, -35.4 + b, P.pantalla.c[3]); p.px(-26.4, -35.4 + b, P.pantalla.c[2]);
  p.parte(U(F.rr(-29.6, -46.6, 6, 3.4, 1)), P.acero, { r: 1.5, sombra: 0 });
  // el cañón: sale de su rótula bajo la cúpula
  const cx = 19, cy = -36 + b, a = o.ca, G = f => F.gira(f, a, cx, cy);
  p.parte(G(F.tr(cx, cy, cx + 17, cy, 3.3)), P.acero, { r: 3, sombra: 0 });
  p.parte(G(F.rr(cx + 14.6, cy - 4.6, 5.4, 9.2, 1.6)), P.acero, { r: 2, sombra: 0 });
  p.parte(G(F.rr(cx + 7, cy - 3.6, 3, 7.2, 0.8)), P.cinta, { r: 1.5, sombra: 0 });
  p.plano(G(F.ov(cx + 20, cy, 0.9, 2.6)), TINTA);
  // el casco: rosa, con la panza más oscura
  const casco = U(F.rr(-25, -54, 48, 31, 13.5));
  p.parte(U(F.rr(-21, -31, 40, 9, 4.5)), P.mechaO, { r: 4, sombra: 0 });
  const idC = p.parte(casco, P.mecha, { r: 13, sombra: 0 });
  // el brillo de arriba (una franja y su reflejo) y la mugre de abajo
  p.tono(F.y(F.gordo(casco, -2.4), U(F.rr(-17, -51.6, 12, 2.2, 1))), 1, idC); p.tono(F.y(F.gordo(casco, -2.4), U(F.rr(-3, -51.6, 4, 2.2, 1))), 1, idC);
  p.tono(F.menos(F.gordo(casco, -1.4), U(F.ov(-6, -47, 27, 15.5, 0.12))), -1, idC);
  // las manchas de vaca y la franja blanca
  for (const [x, y, rx, ry, g] of [[-13, -47, 6.6, 4.4, 0.4], [-2, -39.6, 4.2, 3, -0.3], [-19.6, -36, 3.6, 4.4, 0.2], [3.4, -51.4, 3.4, 2.2, 0]])
    p.parte(F.y(U(F.ov(x, y, rx, ry, g)), F.gordo(casco, -1.2)), P.negro, { plano: 2, sombra: 0, linea: false });
  p.parte(F.y(U(F.rr(-26, -31.4, 50, 3.6, 0)), F.gordo(casco, -0.6)), P.blanco, { r: 2, sombra: 0, linea: false });
  // juntas de chapa, remaches y arañazos
  p.raya(-6.4, -53 + b, -6.4, -32.4 + b, null, -1); p.raya(-24, -42.4 + b, -6.4, -42.4 + b, null, -1);
  for (const [x, y] of [[-21.6, -40.4], [-9.4, -40.4], [-21.6, -33.6], [-9.4, -33.6], [-3.4, -49.6], [-3.4, -34.6], [16.6, -30.4]]) p.remache(x, y + b);
  p.raya(-16, -29 + b, -12.6, -25.6 + b, null, 1); p.raya(-13.6, -29 + b, -11.6, -27 + b, null, 1);
  // la ubre: dos toberas rosas bajo la panza
  p.parte(U(F.fun(2, F.ov(1, -23, 6, 3.6), F.ov(-1.6, -20.4, 1.8, 2.2), F.ov(3.6, -20.4, 1.8, 2.2))), P.rosa, { r: 3, sombra: 0 });
  // la rótula del cañón y el faro
  p.parte(F.ov(cx, cy, 5.4, 5.4), P.robotO, { r: 5, sombra: 1 });
  p.parte(F.ov(cx, cy, 2.2, 2.2), P.acero, { r: 2, sombra: 0 });
  p.parte(U(F.rr(18.4, -30.6, 4.6, 3.6, 1.2)), P.oro, { r: 1.5, sombra: 0 });
  // la cúpula de cristal con la vaca dentro
  const cupula = U(F.ov(9.6, -53.6, 12.6, 10.6)), cristal = F.y(cupula, U(F.rr(-10, -70, 40, 21.6, 0)));
  p.parte(F.gordo(cristal, 1.4), P.acero, { r: 2, sombra: 2 });
  p.parte(cristal, P.cian, { plano: 2, sombra: 0 });
  vacaPiloto(p, 9.4, -55.4 + b, o.cara, F.gordo(cristal, -1.2));
  // los reflejos del cristal
  p.tono(F.y(F.gordo(cristal, -1), U(F.tr(1.6, -57, 7.6, -62.6, 0.9))), 3);
  p.tono(F.y(F.gordo(cristal, -1), U(F.tr(4.6, -56, 8.6, -60, 0.5))), 2);
  p.tonoPx(19.4, -53 + b, 2); p.tonoPx(19.4, -52 + b, 2);
  // el cuerno del mecha y la hombrera de este lado, con su número
  p.parte(U(F.pol(-4, -53.6, -7.6, -62.4, 0.6, -54.6)), P.carton, { r: 2, sombra: 1 });
  const hombrera = U(F.rr(-21.6, -50.4, 14, 13.6, 4.5));
  p.parte(hombrera, P.mechaO, { r: 4, sombra: 2 });
  p.letrero('01', -14.4, -47 + b, P.mecha.c[5]);
  p.remache(-19.4, -40.4 + b); p.remache(-10.4, -40.4 + b);
  pataMecha(p, [-9, -25 + b], o.pb.r, o.pb.t, false);
  return giraP(cx + 21, cy, a, cx, cy);
}
const POSE_MECHA = { by: 0, ca: 0, cola: 0, cara: '', pa: { r: [15, -15], t: [11, -6] }, pb: { r: [-3.6, -14.6], t: [-8, -6] } };
const fotoMecha = (t, c) => { const p = new Pincel(104, 84, 48, 78, t); const boca = mechaVaca(p, Object.assign({}, POSE_MECHA, c)); const s = p.lienzo(); s.boca = bocaDeformada(boca, t); return s; };
