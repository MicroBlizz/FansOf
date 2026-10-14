// Fans of Recruit · LOS FANS PRISIONEROS: Microblizz los tiene atados con cinta de «EN CONSTRUCCIÓN». Llevan su diadema de
// orejas de conejo y la camiseta naranja de la rebelión. Al soltarlos te dan un premio. Se dibujan mirando a la derecha.
'use strict';

// la cabeza del fan. (x, y) = centro; cara: 'pide' (te llama), 'feliz', 'llora'
function cabezaFan(p, x, y, cara) {
  const P = MAT;
  // las orejas de conejo de la diadema (una doblada), el pelo de detrás y la cabeza
  p.parte(F.fun(1, F.tr(x - 3.4, y - 5, x - 5.6, y - 13, 1.9, 1.6), F.tr(x - 5.6, y - 13, x - 8.6, y - 13.6, 1.6, 1.3)), P.pelo, { r: 1.8, sombra: 0 });
  p.parte(F.tr(x + 1.4, y - 5.4, x + 2.6, y - 14.4, 2, 1.6), P.pelo, { r: 1.8, sombra: 0 });
  p.tonoPx(x + 2.2, y - 11, -2); p.tonoPx(x + 2.2, y - 10, -2); p.tonoPx(x + 2, y - 9, -2);
  p.parte(F.ov(x - 1.4, y - 0.6, 7, 6.6), P.cuero, { r: 5, sombra: 0 });
  p.parte(F.ov(x, y, 6.6, 6.2), P.piel, { r: 5, sombra: 0 });
  // el flequillo y la diadema
  p.parte(F.y(F.ov(x, y, 7, 6.6), F.pol(x - 8, y - 8, x + 8, y - 8, x + 7, y - 2.6, x + 3, y - 4.4, x - 1, y - 2.4, x - 5, y - 4, x - 8, y - 1)), P.cuero, { r: 3, sombra: 1 });
  p.raya(x - 5, y - 5.6, x + 4.6, y - 5.8, P.capa.c[3]);
  // la cara
  const E = P.cuero.c[0];
  if (cara === 'feliz') { p.px(x + 0.4, y, E); p.px(x + 1.4, y - 1, E); p.px(x + 2.4, y, E); p.px(x + 4.4, y, E); p.px(x + 5.2, y - 1, E); p.plano(F.ov(x + 3, y + 3.2, 2.2, 1.6), BOCA); p.px(x + 3, y + 2.4, '#ffffff'); }
  else {
    p.plano(F.ov(x + 1.2, y - 0.2, 1.7, 2.1), '#ffffff'); p.px(x + 1.6, y, E); p.px(x + 1.6, y + 1, E);
    p.plano(F.ov(x + 5, y - 0.2, 1.3, 1.9), '#ffffff'); p.px(x + 5.2, y, E); p.px(x + 5.2, y + 1, E);
    p.plano(F.ov(x + 3.4, y + 3.8, 1.9, 1.7), BOCA); p.px(x + 3.4, y + 4.6, LENGUA);
    if (cara === 'llora') { p.px(x, y + 2, P.cian.c[3]); p.px(x, y + 3, P.cian.c[4]); p.px(x + 6, y + 2, P.cian.c[3]); }
  }
  p.px(x - 1, y + 2, '#ff9a8a'); p.px(x, y + 2.2, '#ff9a8a');
}
// el fan sentado en el suelo y atado. o: cara, hy (cabeza), temblor
function fanAtado(p, o) {
  const P = MAT;
  // piernas estiradas, con vaqueros y zapatillas
  p.parte(F.fun(1.5, F.tr(-1, -3.4, 6, -4.6, 2.6, 2.3), F.tr(6, -4.6, 11, -2.6, 2.3, 2)), P.telaAzul, { r: 2.4, sombra: 0 });
  p.parte(F.fun(1, F.ov(13, -2.4, 2.8, 2.4), F.ov(11.4, -3.2, 2, 2)), P.rojo, { r: 2, sombra: 0 });
  p.raya(11.4, -0.6, 15, -0.6, '#ffffff');
  // el cuerpo con la camiseta naranja
  const cuerpo = F.rr(-5.4, -15, 10.4, 12.6, 3.6);
  p.parte(cuerpo, P.capa, { r: 3.5, sombra: 0 });
  // la cinta de «EN CONSTRUCCIÓN»: amarilla con rayas negras, dándole dos vueltas
  for (const y of [-12.6, -7.4]) {
    const id = p.parte(F.y(F.rr(-7, y, 14, 3.4, 0.4), F.gordo(cuerpo, 1.4)), P.cinta, { r: 1.2, sombra: 1 });
    for (let x = -6; x < 7; x += 3.4) p.tono(F.pol(x, y + 3.4, x + 1.6, y + 3.4, x + 3, y, x + 1.4, y), -3, id);
  }
  cabezaFan(p, 0.6 + (o.temblor || 0), -20.6 + (o.hy || 0), o.cara || 'pide');
}
const fotoFan = (t, c) => { const p = new Pincel(44, 48, 16, 44, t); fanAtado(p, Object.assign({}, c)); return p.lienzo(); };
