// Fans of Roguelite (prototipo) · Los iconos en pixel art: uno por habilidad (16×16) y los del marcador (corazón, moneda,
// altavoz). Dibujados con el mismo pincel que los personajes.
'use strict';

function icono(dibuja) { const p = new Pincel(18, 18, 9, 9); dibuja(p); return p.lienzo(); }
function creaIconos() {
  const P = PAL_H, I = SPR.icono = {};
  I.zanahoria = icono(p => {
    for (const s of [-0.7, 0.3]) p.parte(F.ov(-4 + Math.cos(2.36 + s) * 3, 4 + Math.sin(2.36 + s) * 3, 3.2, 1.6, 2.36 + s), P.hoja, { sombra: 1 });
    p.parte(F.tr(-4, 4, 6, -6, 3.4, 0.9), P.zana, { sombra: 1 });
    p.px(-1, 0, P.zana.s); p.px(2, -3, P.zana.s); p.px(6, -7, '#ffffff');
  });
  I.pelusa = icono(p => {
    p.parte(F.un(F.ov(0, 0, 6, 5.5), F.ov(-4, 2, 4, 3.5), F.ov(4, 2, 4, 3.5), F.ov(0, -3, 4.5, 4)), P.pelo, { sombra: 2 });
    p.parte(F.un(F.ov(-1.5, 0, 1.8, 1.8), F.ov(1.5, 0, 1.8, 1.8), F.pol(-3.2, 0.6, 3.2, 0.6, 0, 3.8)), PAL_E.rojo, { sombra: 0, linea: false });
  });
  I.rabia = icono(p => {
    p.parte(F.pol(0, -8, 3, -3, 6, -5, 6, 2, 3, 7, -3, 7, -6, 2, -5, -4, -2, -1), pal('#ff4b2b', '#c4243c', '#ff8a5c', '#6a1020'), { sombra: 2 });
    p.parte(F.pol(0, -3, 3, 1, 2, 6, -2, 6, -3, 1), PAL_H.oro, { sombra: 0, linea: false });
    p.px(0, 4, '#ffffff');
  });
  I.botiquin = icono(p => {
    p.plano(F.un(F.tr(-3, -4, -3, -6.5, 0.6), F.tr(3, -4, 3, -6.5, 0.6), F.tr(-3, -6.5, 3, -6.5, 0.6)), OL);
    p.parte(F.rr(-7, -4, 14, 11, 2), pal('#fff6ea', '#d6c8b4', '#ffffff', '#6a5a48'), { sombra: 2 });
    p.parte(F.un(F.re(-1.5, -2, 3, 8), F.re(-4.5, 0.5, 9, 3)), pal('#2f9e3a', '#1d6a26', '#7be04a', '#123a16'), { sombra: 0, linea: false });
  });
  I.espiral = icono(p => {
    p.parte(F.ov(0, 0, 7, 6), PAL_H.ojo, { sombra: 2, luz: false });
    for (let a = 0; a < 3.2 * Math.PI; a += 0.38) { const r = 0.3 + a * 0.55; p.px(Math.cos(a) * r, Math.sin(a) * r * 0.85, ESPIRAL); }
  });
  I.bellotas = icono(p => {
    for (const [x, y] of [[-3, 2], [3, -1]]) {
      p.parte(F.ov(x, y + 1.5, 3.4, 3.8), pal('#c8874a', '#8f5428', '#e8b07a', '#4a2a14'), { sombra: 1 });
      p.parte(F.ov(x, y - 1.8, 4, 2.2), pal('#6b4423', '#4a2a14', '#9a6a3a', '#2a1408'), { sombra: 0 });
      p.plano(F.tr(x, y - 3.6, x + 1, y - 5.6, 0.5), OL);
    }
  });
  I.pulgas = icono(p => {
    for (const a of [-1, 0, 1]) p.plano(F.tr(a * 3, 3, a * 5 - 1, 7, 0.6), OL);
    p.parte(F.ov(1, 0, 6, 4.5), pal('#8b5530', '#5a3418', '#b07a50', '#2a1408'), { sombra: 2 });
    p.parte(F.ov(-5, -3, 3.4, 3), pal('#a86b3c', '#6e4424', '#d09a68', '#2a1408'), { sombra: 1 });
    p.px(-6, -4, '#ffffff'); p.px(-6, -3, OL);
    p.plano(F.tr(-7, -5, -9, -8, 0.5), OL); p.plano(F.tr(-5, -6, -5, -8.5, 0.5), OL);
  });
  I.ardilla = icono(p => {
    p.parte(F.pol(-6, -2, -5, -8, -1, -4), PAL_A.pelo, { sombra: 0 }); p.parte(F.pol(6, -2, 5, -8, 1, -4), PAL_A.pelo, { sombra: 0 });
    p.parte(F.ov(0, 1, 6.5, 5.6), PAL_A.pelo, { sombra: 2 });
    p.parte(F.ov(0, 3.5, 3.6, 2.6), PAL_A.crema, { sombra: 0, linea: false });
    p.px(-3, -0.5, OL); p.px(3, -0.5, OL); p.px(-3, -1.5, '#ffffff'); p.px(3, -1.5, '#ffffff');
    p.px(0, 2, OL); p.px(0, 4, '#ffffff');
  });
  I.huelga = icono(p => {
    p.parte(F.re(-1, -1, 2, 9), PAL_E.madera, { sombra: 0 });
    p.parte(F.rr(-7, -8, 14, 9, 1), PAL_E.carton, { sombra: 1 });
    p.plano(F.re(-0.5, -6.5, 1.4, 4), '#e63946'); p.px(0.2, -1.6, '#e63946');
  });
  I.chaos = icono(p => {
    p.parte(F.ov(-3.5, -4, 2.2, 5.5, -0.25), P.pelo, { sombra: 1 }); p.parte(F.ov(3.5, -4, 2.2, 5.5, 0.25), P.pelo, { sombra: 1 });
    p.parte(F.pol(-7, 6, 7, 6, 7, -1, 3.5, 2.5, 0, -3, -3.5, 2.5, -7, -1), P.oro, { sombra: 1 });
    p.px(0, 3, '#ff4b5c'); p.px(-4, 4, '#5aaeff'); p.px(4, 4, '#7be04a');
  });
  // del marcador
  I.corazon = icono(p => { p.parte(F.un(F.ov(-2.6, -1.5, 3, 3), F.ov(2.6, -1.5, 3, 3), F.pol(-5.4, -0.6, 5.4, -0.6, 0, 5)), PAL_E.rojo, { sombra: 1 }); p.px(-3, -2.5, '#ffffff'); });
  I.moneda = SPR.moneda[0];
  I.sonido = icono(p => { p.parte(F.pol(-6, -2, -3, -2, 1, -6, 1, 6, -3, 2, -6, 2), pal('#fff6ea', '#cdb9ea', '#ffffff', '#6a5a88'), { sombra: 0 }); p.plano(F.y(F.menos(F.ov(2, 0, 6, 6), F.ov(2, 0, 4.6, 4.6)), F.re(3, -10, 10, 20)), '#fff6ea'); });
  I.mudo = icono(p => { p.parte(F.pol(-6, -2, -3, -2, 1, -6, 1, 6, -3, 2, -6, 2), pal('#cdb9ea', '#9a88c0', '#fff6ea', '#6a5a88'), { sombra: 0 }); p.plano(F.un(F.tr(3, -3, 7, 3, 0.6), F.tr(3, 3, 7, -3, 0.6)), '#ff4b5c'); });
}
