// Fans of Tactics Advance (prototipo) · DECORADOS en pixel art: tumbas, cruces, árboles, faroles y la cripta del Cementerio; mesas, plantas,
// fuente de agua, cajas de despido y archivadores de las Oficinas. El origen de cada uno es el centro de su casilla.
'use strict';

/* ---------- decorados (el origen es el centro de la casilla) ---------- */
// caja en diagonal: ea y eb = medio ancho en casillas por cada eje, alto en píxeles; pt/pl/pr = paletas de arriba, izquierda y derecha
function cajaIso(p, ea, eb, alto, pt, pl, pr, dy = 0) {
  const c = (sa, sb, h) => [16 * sa * ea - 16 * sb * eb, 8 * sa * ea + 8 * sb * eb - h + dy];
  const L0 = c(-1, 1, 0), B0 = c(1, 1, 0), R0 = c(1, -1, 0), L1 = c(-1, 1, alto), B1 = c(1, 1, alto), R1 = c(1, -1, alto), T1 = c(-1, -1, alto);
  p.parte(F.pol(...L0, ...B0, ...B1, ...L1), pl, { sombra: 0, luz: 0 });
  p.parte(F.pol(...B0, ...R0, ...R1, ...B1), pr, { sombra: 0, luz: 0 });
  p.parte(F.pol(...T1, ...R1, ...B1, ...L1), pt, { sombra: 0, luz: 0 });
  return { L0, B0, R0, L1, B1, R1, T1 };
}
const PIEDRA = pal('#b4b4c6', '#86869c', '#dadae8', '#46465c');
const PIEDRA_F = pal('#8e8ea4', '#6a6a80', '#a8a8bc', '#38384c');
const MUSGO = '#5c8a3e', MUSGO_L = '#86b456';
function tumba(p, o = {}) {
  p.parte(F.ov(0.5, -0.6, 6.4, 2.2), pal('#a0723e', '#7a542c', '#c29254', '#4a3018'), { sombra: 1, luz: 0 });
  p.parte(F.rr(-2.6, -12.6, 8.6, 12.4, 3.6), PIEDRA_F, { sombra: 0, luz: 0 });
  p.parte(F.rr(-4.6, -13, 8.6, 12.6, 3.8), PIEDRA, { sombra: 1, luz: 1 });
  p.sello(-1.6, -10.6, ['.k.', 'kkk', '.k.', '.k.'], { k: '#46465c' });
  p.sello(-4, -3, ['m..m..mm', 'mmmmmmmm'], { m: MUSGO });
  p.px(-3.4, -3.8, MUSGO_L); p.px(2.2, -3.8, MUSGO_L);
}
function cruz(p) {
  p.parte(F.ov(0, -0.6, 5, 1.8), pal('#a0723e', '#7a542c', '#c29254', '#4a3018'), { sombra: 1, luz: 0 });
  p.parte(F.un(F.rr(-1.6, -17, 3.4, 17, 1), F.rr(-5, -13.6, 10.2, 3.4, 1)), PIEDRA, { sombra: 1, luz: 1 });
  p.px(-1, -1.6, MUSGO); p.px(0, -2.6, MUSGO); p.px(1, -1.6, MUSGO_L);
}
const CORTEZA = pal('#7c5c4c', '#4e3628', '#a08068', '#2a1810');
function arbolMuerto(p) {
  p.parte(F.un(F.tr(-1, 0, -0.6, -15, 2.8, 1.7), F.tr(-1, -1, -5, 0.6, 1.2, 0.6), F.tr(0, -1, 4, 0.8, 1.1, 0.5)), CORTEZA, { sombra: 1 });
  p.parte(F.un(
    F.tr(-0.6, -12, -7.4, -20, 1.3, 0.6), F.tr(-7.4, -20, -9, -25, 0.6, 0.4), F.tr(-5, -17, -4, -22, 0.6, 0.4),
    F.tr(-0.6, -14.6, 3.6, -23, 1.4, 0.7), F.tr(3.6, -23, 7.8, -26, 0.7, 0.4), F.tr(2, -20, 0, -27, 0.6, 0.4),
    F.tr(-0.4, -8, 6.6, -13, 1.1, 0.5), F.tr(6.6, -13, 9, -12, 0.5, 0.4)), CORTEZA, { sombra: 0, luz: 0 });
  p.px(-1.6, -9, '#2a1810'); p.px(-1.6, -8, '#2a1810');
}
const HOJAS = pal('#3e8a3a', '#28642e', '#6cb44a', '#163a1c');
function arbol(p) {
  p.parte(F.un(F.tr(0, 0, 0, -12, 2.4, 1.8), F.tr(0, -1, -4, 0.4, 1, 0.5), F.tr(0, -1, 4, 0.6, 1, 0.5)), CORTEZA, { sombra: 1 });
  for (const [x, y, rx, ry] of [[-5, -15, 6, 5.4], [5, -16, 6.2, 5.6], [0, -21, 7.6, 6.4], [-2, -26, 5.6, 4.6], [3.6, -25, 5, 4.4]])
    p.parte(F.ov(x, y, rx, ry), HOJAS, { sombra: 2, luz: 1 });
  for (let k = 0; k < 9; k++) p.px(-8 + hash(k, 1) * 16, -28 + hash(k, 2) * 18, '#8ad060');
}
function arbusto(p) {
  for (const [x, y, rx, ry] of [[-4, -3.6, 4.6, 3.8], [3.6, -3.4, 4.4, 3.6], [0, -6.4, 5, 4.2]]) p.parte(F.ov(x, y, rx, ry), HOJAS, { sombra: 1, luz: 1 });
  p.px(-2, -7, '#ff7a9a'); p.px(3, -5, '#ffe066'); p.px(-5, -3, '#ffffff');
}
const HIERRO = pal('#4a4a5c', '#2c2c3a', '#6e6e84', '#14141c');
function farol(p) {
  p.parte(F.ov(0, -0.8, 3, 1.4), PIEDRA, { sombra: 0, luz: 0 });
  p.parte(F.tr(0, -1, 0, -17, 0.8), HIERRO, { sombra: 0, luz: 0 });
  p.parte(F.pol(-3.4, -18, 3.4, -18, 2.2, -24, -2.2, -24), HIERRO, { sombra: 0, luz: 0 });
  p.plano(F.re(-1.8, -23.2, 3.6, 4.6), '#ffd86a'); p.plano(F.re(-0.6, -22.4, 1.2, 2.8), '#fff8d0');
  p.parte(F.pol(-4, -24, 4, -24, 0, -27.6), HIERRO, { sombra: 0, luz: 0 });
}
function cripta(p) {
  const piedra = pal('#c0c0d0', '#9a9aae', '#e0e0ec', '#4c4c62'), lado = pal('#9a9aae', '#7c7c92', '#b0b0c2', '#3e3e52'), sombra = pal('#7c7c92', '#626278', '#8e8ea4', '#30304a');
  cajaIso(p, 0.36, 0.36, 15, piedra, lado, sombra);
  // tejado a dos aguas (de izquierda a derecha)
  const k = 16 * 0.36, j = 8 * 0.36;
  const tejado = pal('#6a5a86', '#4c3e66', '#8a7aa8', '#241a38'), tejadoS = pal('#4c3e66', '#3a2e50', '#5e5080', '#1c142c');
  p.parte(F.pol(-k * 2 - 1, -15 + 0, 0, -15 + j * 2 + 1, 0, -26 + j * 2, -k * 2 + k, -26 - j + j), tejado, { sombra: 0, luz: 0 });
  p.parte(F.pol(0, -15 + j * 2 + 1, k * 2 + 1, -15, k * 2 - k, -26, 0, -26 + j * 2), tejadoS, { sombra: 0, luz: 0 });
  // puerta y cruz
  p.parte(F.pol(-7, -1.2, -2.4, 1.2, -2.4, -9, -7, -11.4), pal('#2a1c34', '#1c1226', '#3a2a48', '#0e0814'), { sombra: 0, luz: 0, linea: false });
  p.parte(F.un(F.re(-0.8, -34, 1.8, 8), F.re(-2.6, -31.6, 5.4, 1.8)), PIEDRA, { sombra: 0, luz: 0 });
  p.sello(-6, -12, ['m...mm', 'mm.mmmm'], { m: MUSGO });
}
// oficinas
const MADERA = pal('#c89060', '#a06e44', '#e4b07c', '#5a3820');
function mesa(p) {
  const tapa = pal('#d6a070', '#b88454', '#f0c08c', '#6a4426'), patas = pal('#6e6e84', '#4c4c60', '#8e8ea4', '#24242e');
  p.parte(F.tr(-7, 3, -7, -6, 0.7), patas, { sombra: 0, luz: 0 }); p.parte(F.tr(7, 3, 7, -6, 0.7), patas, { sombra: 0, luz: 0 });
  p.parte(F.tr(0, 6, 0, -3, 0.7), patas, { sombra: 0, luz: 0 });
  cajaIso(p, 0.44, 0.3, 2.4, tapa, MADERA, pal('#8a5a34', '#6e4628', '#a06e44', '#3e2410'), -6);
  const gris = pal('#3c4054', '#2a2c3c', '#5a5e78', '#12131c');
  cajaIso(p, 0.04, 0.2, 9, gris, gris, pal('#2a2c3c', '#1e2030', '#3c4054', '#0c0d14'), -8.6);
  p.parte(F.pol(-4, -11.6, 2, -8.6, 2, -15.6, -4, -18.6), pal('#4cc4f0', '#2a8ac8', '#b8f0ff', '#0e3a5a'), { sombra: 0, luz: 0, linea: false });
  p.px(-2, -15, '#ffffff'); p.px(-1, -14, '#ffffff'); p.px(0, -12.6, '#ff5a6a');
  p.parte(F.tr(-1, -9.6, 0.6, -9.2, 0.8), gris, { sombra: 0, luz: 0 });
}
function planta(p) {
  const maceta = pal('#d8784a', '#a8522e', '#f4a070', '#5a2410');
  p.parte(F.pol(-4, -8, 4, -8, 3, 0, -3, 0), maceta, { sombra: 1, luz: 1 });
  p.parte(F.re(-4.6, -9.4, 9.2, 2), maceta, { sombra: 0, luz: 0 });
  for (const [x, y, a] of [[-3.6, -13, -0.6], [3.6, -13.4, 0.6], [0, -16, 0], [-1.8, -18.6, -0.3], [2, -19, 0.35]]) p.parte(F.ov(x, y, 1.9, 4.6, a), HOJAS, { sombra: 1, luz: 1 });
}
function fuente(p) {
  const cuerpo = pal('#eef0f6', '#c4c8d6', '#ffffff', '#5a5e72');
  p.parte(F.rr(-3.8, -14, 7.6, 14, 1.4), cuerpo, { sombra: 1, luz: 1 });
  p.px(-1.6, -9, '#3a8cff'); p.px(1.4, -9, '#ff5a6a');
  p.parte(F.ov(0, -18.4, 3.6, 4.6), pal('#7cc4ff', '#4a94e8', '#d8f0ff', '#1e4a8a'), { sombra: 1, luz: 1 });
  p.px(-1.4, -20, '#ffffff'); p.px(-1.4, -19, '#ffffff');
}
function cajas(p) {
  const carton = pal('#d8a868', '#b88a4c', '#ecc488', '#6a4a22'), cL = pal('#c49450', '#a47a3c', '#d8a868', '#5e3e1a'), cR = pal('#a47a3c', '#86622e', '#b88a4c', '#4e3214');
  cajaIso(p, 0.3, 0.26, 9, carton, cL, cR);
  cajaIso(p, 0.22, 0.2, 7, carton, cL, cR, -9);
  p.sello(-6, -6, ['r...r', '.r.r.', '..r..', '.r.r.', 'r...r'], { r: '#d83a3a' });
  p.px(-1, -18.6, '#7a5a2a'); p.px(0, -18.2, '#7a5a2a'); p.px(1, -17.8, '#7a5a2a');
}
function archivador(p) {
  const g = pal('#a8b0c0', '#8a92a4', '#c8d0de', '#3c4254'), gL = pal('#949cae', '#7a8296', '#aab2c2', '#363c4e'), gR = pal('#767e92', '#5e6678', '#8a92a4', '#2a2e3c');
  const k = cajaIso(p, 0.22, 0.28, 18, g, gL, gR);
  for (const yy of [-5, -10, -15]) { p.px(-4, yy + 1.4, '#3c4254'); p.px(-3, yy + 1.9, '#3c4254'); p.px(-5, yy + 0.9, '#3c4254'); }
}
