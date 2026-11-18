// Fans of Recruit · LAS ANIMACIONES de los demás: el Becario (toma café, anda, apunta, dispara, se asusta y huye), el Dron de
// KPIs, los fans (atados, celebrando y corriendo), la MechaVaca (parada, andando y en el aire), la vaca que sale cuando el
// mecha revienta y las cajas de premio. Todo se dibuja una vez al arrancar.
'use strict';

function creaBecario() {
  const B = SPR.becario = {}, L = [[-2, 2], [0, 0], [2, -2], [0, 0]];
  B.cafe = [0, 1, 2, 3].map(f => fotoBecario({ sy: f % 2 ? 1.03 : 1 }, { vapor: f * 1.2, ant: [0, 0.6, 0, -0.6][f], gx: 13, gy: -10, ga: 0.5 }));
  B.anda = L.map(([la, lb], f) => fotoBecario({}, { cara: 'malo', la, lb, dy: f % 2 ? -1 : 0, ant: f < 2 ? 1 : -1, gx: 16, gy: -17, vapor: f }));
  B.apunta = [0, 1].map(f => fotoBecario({ inc: -0.08 }, { cara: 'malo', gx: 15, gy: -24 - f, ga: -0.45, ant: -1, vapor: f }));
  B.dispara = fotoBecario({ sx: 1.05, sy: 0.96, inc: 0.1 }, { cara: 'malo', gx: 19, gy: -20, ga: -0.08, ant: 1.5, la: 1, lb: -1 });
  B.susto = fotoBecario({ sx: 0.94, sy: 1.08 }, { cara: 'susto', sudor: 2, gx: 14, gy: -30, ga: -1.1, tx: -16, ty: null, ant: -2 });
  B.huye = L.map(([la, lb], f) => fotoBecario({ inc: 0.22 }, { cara: 'susto', sudor: 3, gx: 15, gy: -31 + (f % 2), ga: -1.0, tx: -16, ty: null, la: la * 1.5, lb: lb * 1.5, dy: f % 2 ? -1 : 0, ant: 2 }));
  B.dano = fotoBecario({ sx: 0.95, sy: 1.04, inc: -0.25 }, { cara: 'x', ant: -3, gx: 12, gy: -12, ga: 0.6, tx: -15, ty: -9 });
}
function creaDron() {
  const D = SPR.dron = {};
  D.vuela = [0, 1, 2, 3].map(f => fotoDron({ inc: 0.12 }, { helice: f, scan: [0, 1, 2, 1][f], tablet: f % 2, llama: 1 + (f % 2) }));
  D.dano = fotoDron({ inc: -0.2 }, { helice: 1, cara: 'x', llama: 0 });
}

/* ---------- los fans ---------- */
// un fan de pie. o: brazos (0 = abajo, 1 = arriba del todo), la, lb = patas, cara, hy
function fanLibre(p, o) {
  const P = MAT;
  for (const [x, l] of [[2.6, o.la], [-2, o.lb]]) {
    p.parte(F.tr(x, -9.5, x + l, -2.8, 2.3, 2), P.telaAzul, { r: 2, sombra: 0 });
    p.parte(F.fun(1, F.ov(x + l + 1.6, -1.8, 3, 1.9), F.ov(x + l, -2.6, 1.8, 1.6)), P.rojo, { r: 1.8, sombra: 0 });
  }
  const mano = (sx, s) => [sx + s * (3 + o.brazos * 2), -17.5 + 4 - o.brazos * 12];
  const [ax, ay] = mano(4, 1);
  p.parte(F.tr(4, -17.5, ax, ay, 1.8, 1.6), P.capa, { r: 1.6, sombra: 0 }); p.parte(F.ov(ax, ay - 0.6, 1.8, 1.8), P.piel, { r: 1.6, sombra: 0 });
  p.parte(F.rr(-5.4, -20.5, 10.4, 12.6, 3.6), P.capa, { r: 3.5, sombra: 0 });
  const [bx, by] = mano(-4.4, -1);
  p.parte(F.tr(-4.4, -17.5, bx, by, 1.9, 1.7), P.capa, { r: 1.6, sombra: 1 }); p.parte(F.ov(bx, by - 0.6, 1.9, 1.9), P.piel, { r: 1.6, sombra: 0 });
  cabezaFan(p, 0.6, -26 + (o.hy || 0), o.cara || 'feliz');
}
const fotoFanLibre = (t, c) => { const p = new Pincel(42, 54, 20, 50, t); fanLibre(p, Object.assign({ brazos: 0, la: 0, lb: 0, hy: 0 }, c)); return p.lienzo(); };
function creaFans() {
  const N = SPR.fan = {};
  N.atado = [0, 1].map(f => fotoFan({}, { cara: 'pide', hy: f ? -1 : 0, temblor: f ? 0.6 : 0 }));
  N.celebra = [0, 1].map(f => fotoFanLibre({ sy: f ? 1.06 : 0.96 }, { brazos: f ? 1 : 0.7, hy: f ? -1 : 0, la: f ? 1 : 0, lb: f ? -1 : 0 }));
  N.corre = [[-3, 3], [0, 0], [3, -3], [0, 0]].map(([la, lb], f) => fotoFanLibre({ inc: 0.15 }, { brazos: 0.75 + (f % 2) * 0.25, la, lb, hy: f % 2 ? -1 : 0 }));
}

/* ---------- la MechaVaca ---------- */
const CANON_ARR = -0.75;   // el ángulo del cañón cuando apunta hacia arriba
// la pose de una postura al andar (f de 0 a n - 1)
function poseMecha(f, n) {
  const pata = (cx, des) => {
    const a = f / n * 6.283 + des, t = [cx + 1 - Math.cos(a) * 6, -6 - Math.max(0, Math.sin(a)) * 4.4];   // en el aire va hacia delante; apoyado, hacia atrás
    return { r: [(cx + t[0]) / 2 + 5, (-25 + t[1]) / 2 + 1], t };
  };
  return { pa: pata(9, Math.PI), pb: pata(-9, 0), by: Math.round(Math.abs(Math.sin(f / n * 6.283)) * 1.2), cola: Math.sin(f / n * 6.283) };
}
function creaMecha() {
  const V = SPR.mecha = {};
  V.quieta = [0, 1].map(f => fotoMecha({}, { by: f, cola: f ? 1 : -0.4 }));
  V.anda = [0, 1, 2, 3, 4, 5].map(f => fotoMecha({}, poseMecha(f, 6)));
  V.salta = fotoMecha({ sy: 1.04, sx: 0.97 }, { by: -1, cola: 2, pa: { r: [15.5, -17], t: [12, -9.5] }, pb: { r: [-3, -17], t: [-7, -9.5] } });
  V.dispara = fotoMecha({ inc: -0.05, sx: 0.98 }, { by: 1, cola: -1, cara: 'susto' });
  V.rota = fotoMecha({ inc: -0.1 }, { by: 2, cola: -2, cara: 'x' });
  // lo mismo con el cañón hacia arriba (para los drones)
  const ca = CANON_ARR;
  V.quietaArr = [0, 1].map(f => fotoMecha({}, { by: f, cola: f ? 1 : -0.4, ca }));
  V.andaArr = [0, 1, 2, 3, 4, 5].map(f => fotoMecha({}, Object.assign(poseMecha(f, 6), { ca })));
  V.saltaArr = fotoMecha({ sy: 1.04, sx: 0.97 }, { by: -1, cola: 2, ca, pa: { r: [15.5, -17], t: [12, -9.5] }, pb: { r: [-3, -17], t: [-7, -9.5] } });
  V.disparaArr = fotoMecha({ inc: -0.05, sx: 0.98 }, { by: 1, cola: -1, cara: 'susto', ca });
  // la vaca, cuando el mecha revienta: sale corriendo y embiste
  const C = SPR.vaca = {};
  C.corre = [[-3, 3], [0, 0], [3, -3], [0, 0]].map(([la, lb], f) => { const p = new Pincel(44, 40, 20, 36, { inc: 0.2 }); vacaFuriosa(p, { la, lb, dy: f % 2 ? -1 : 0 }); return p.lienzo(); });
}
// la vaca piloto fuera del mecha: a dos patas, con la cabeza por delante y muy enfadada
function vacaFuriosa(p, o) {
  const P = MAT, d = o.dy;
  for (const [x, l] of [[3, o.la], [-2.6, o.lb]]) { p.parte(F.tr(x, -8, x + l, -2.6, 2.2, 1.9), P.blanco, { r: 2, sombra: 0 }); p.parte(F.ov(x + l + 1, -1.6, 2.6, 1.8), P.negro, { r: 1.6, sombra: 0 }); }
  const cuerpo = F.ov(0, -12 + d, 7.4, 7.2);
  p.parte(cuerpo, P.blanco, { r: 6, sombra: 0 });
  for (const [x, y, rx, ry] of [[-3, -14, 3, 2.4], [3.4, -9, 2.4, 2]]) p.parte(F.y(F.ov(x, y + d, rx, ry), F.gordo(cuerpo, -1)), P.negro, { plano: 2, linea: false, sombra: 0 });
  p.parte(F.tr(4, -13 + d, 10, -11 + d, 1.9, 1.7), P.blanco, { r: 1.6, sombra: 0 });
  // la cabeza: cuernos, la mancha del ojo, el morro rosa y la cinta
  const hx = 6, hy = -22 + d;
  p.parte(F.pol(hx - 3, hy - 4, hx - 5, hy - 9.4, hx, hy - 5.4), P.carton, { r: 1.5, sombra: 0 });
  p.parte(F.ov(hx - 5.4, hy - 1.6, 2.8, 1.7, 0.5), P.blanco, { r: 1.5, sombra: 0 });
  p.parte(F.ov(hx, hy, 6.4, 5.8), P.blanco, { r: 5, sombra: 1 });
  p.parte(F.y(F.ov(hx - 2.6, hy - 2.4, 3, 2.4, 0.4), F.ov(hx, hy, 5.6, 5)), P.negro, { plano: 2, linea: false, sombra: 0 });
  p.parte(F.ov(hx + 5, hy + 2, 4, 3), P.rosa, { r: 2.5, sombra: 0 });
  p.px(hx + 5.4, hy + 1.6, P.rosa.c[0]); p.px(hx + 7, hy + 2.2, P.rosa.c[0]);
  p.raya(hx - 4, hy - 5.2, hx + 2.6, hy - 5.6, P.mecha.c[2]);
  p.raya(hx - 0.4, hy - 3.4, hx + 3.4, hy - 2, TINTA); p.px(hx + 1.4, hy - 1.2, TINTA); p.px(hx + 2.4, hy - 1.2, TINTA);
}

/* ---------- las cajas de premio: un marco dorado con su dibujo ---------- */
function creaPremios() {
  if (!ICONOS.cara) creaIconos();
  const caja = (w, h, pinta) => { const c = lienzoNuevo(w, h), g = c.getContext('2d'); rect(g, 1, 1, w - 2, h - 2, '#141c30'); rect(g, 1, 1, w - 2, 1, '#243252'); marcoFino(g, 1, 1, w - 2, h - 2); pinta(g); return { c, b: c, ox: w >> 1, oy: h, w, h }; };
  SPR.premio = {
    arma: caja(28, 15, g => pintaSpr(g, ICONOS.arma, 3, 3)),
    bombas: caja(16, 18, g => pintaSpr(g, ICONOS.bomba, 8, 16)),
    cafe: (() => { const p = new Pincel(14, 12, 6, 10); tazaMesa(p, 0, 0); p.px(0.5, -7.5, '#ffffff'); p.px(1.5, -9.5, '#c9d2e4'); return p.lienzo(); })(),
  };
  // la caja de cartón que se rompe a tiros
  { const p = new Pincel(34, 26, 17, 24), C = MAT.carton, id = p.parte(F.rr(-13, -17, 26, 17, 0.5), C, { plano: 3, canto: 1, sombra: 0 });
    p.tono(F.rr(-1.6, -16, 3.2, 15, 0), 1, id); p.tono(F.rr(-12, -4, 24, 3, 0), -1, id);
    p.parte(F.pol(-13, -17, -17, -20, -16, -21.4, -12, -18.4), C, { plano: 4, canto: [0, -1], sombra: 0 }); p.parte(F.pol(13, -17, 17, -20, 16, -21.4, 12, -18.4), C, { plano: 4, canto: [0, -1], sombra: 0 });
    p.px(-7.5, -11.5, C.c[1]); p.px(-5.5, -11.5, C.c[1]); p.px(-7.5, -8.5, C.c[1]); p.px(-6.5, -9.5, C.c[1]); p.px(-5.5, -8.5, C.c[1]);
    SPR.caja = p.lienzo(); }
  // la zanahoria bomba por los aires (4 giros)
  SPR.bomba = [0, 1, 2, 3].map(k => { const p = new Pincel(15, 15, 7, 7), a = k * 1.571 + 0.5, c = Math.cos(a), s = Math.sin(a);
    for (const q of [-0.6, 0.6]) p.parte(F.ov(-c * 5 + Math.cos(a + q + 3.14) * 1.6, -s * 5 + Math.sin(a + q + 3.14) * 1.6, 2.4, 1.2, a + q), MAT.hoja, { r: 1.2, sombra: 0 });
    p.parte(F.tr(-c * 3.4, -s * 3.4, c * 4.6, s * 4.6, 2.7, 1), MAT.capa, { r: 2.2, sombra: 0 }); return p.lienzo(); });
}
