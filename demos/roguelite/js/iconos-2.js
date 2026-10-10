// Fans of Roguelite · Más iconos en pixel art: las habilidades nuevas (Cafeína, Piel dura, Reflejos, Pelo de erizo, Hucha
// rota, Escudo de cartón, JunkCoon, Zanahoria vampira, BoomBeaver, MeerCat, SlyFox, MechaVaca, Corona torcida), los 15
// objetos, las mejoras de La Madriguera, los huecos vacíos, la casa y el candado.
'use strict';

// una zanahoria de icono (la misma forma que la habilidad) con su paleta
function zanaIcono(p, cuerpo, hojas = true) {
  if (hojas) for (const s of [-0.7, 0.3]) p.parte(F.ov(-4 + Math.cos(2.36 + s) * 3, 4 + Math.sin(2.36 + s) * 3, 3.2, 1.6, 2.36 + s), PAL_H.hoja, { sombra: 1 });
  p.parte(F.tr(-4, 4, 6, -6, 3.4, 0.9), cuerpo, { sombra: 1 });
  p.px(-1, 0, cuerpo.s); p.px(2, -3, cuerpo.s); p.px(6, -7, '#ffffff');
}
const PAL_I = {
  madera: pal('#c8874a', '#8f5428', '#e8b07a', '#4a2a14'), hierro: pal('#aab4c4', '#6f7a99', '#e8eef8', '#3a4262'),
  laser: pal('#33e0ff', '#1a9cc4', '#e8fdff', '#0b5a7a'), verde: pal('#5cc23a', '#2f8a3a', '#a8ec5c', '#1d5a26'),
  rosa: pal('#ff9ac4', '#e0608e', '#ffd0e4', '#8a2a50'), lila: pal('#d08cff', '#9a50e0', '#f0d0ff', '#4a1a7a'),
  vamp: pal('#b0204a', '#7a1030', '#ff6a8a', '#3a0a18'), azul: pal('#5aaeff', '#1d5fc9', '#c8e4ff', '#0d2a6a'),
  naranja: pal('#ff8a1f', '#d9531a', '#ffc266', '#8a3010'), crema: pal('#fff6ea', '#d6c8b4', '#ffffff', '#6a5a48'),
  plata: pal('#c3cbe0', '#7d889e', '#eef2fa', '#3a4262'), pardo: pal('#8b5530', '#5a3418', '#b07a50', '#2a1408'),
};

function creaIconos2() {
  const I = SPR.icono, P = PAL_I, E = PAL_E;
  /* ---------- habilidades ---------- */
  I.cafeina = icono(p => {
    p.parte(F.menos(F.ov(5, 1, 3, 3), F.ov(5, 1, 1.4, 1.4)), E.taza, { sombra: 0 });
    p.parte(F.rr(-6, -3, 10, 10, 2), E.taza, { sombra: 2 });
    p.plano(F.re(-5, -2, 8, 1.6), '#6b3a1c');
    for (const x of [-3, 0]) { p.px(x, -5, '#ffffff'); p.px(x + 1, -7, '#ffffff'); p.px(x, -8, '#e8e0f0'); }
  });
  I.piel = icono(p => {
    p.parte(F.pol(-6, -6, 6, -6, 6, 1, 0, 7.5, -6, 1), P.plata, { sombra: 2, luz: 2 });
    p.plano(F.pol(-3.5, -3.5, 3.5, -3.5, 3.5, 0.5, 0, 4.5, -3.5, 0.5), '#7d889e');
    p.plano(F.un(F.re(-0.6, -3, 1.4, 7), F.re(-3, -1.4, 6, 1.4)), '#eef2fa');
  });
  I.reflejos = icono(p => {
    p.plano(F.un(F.re(-8, -4, 4, 1), F.re(-8, 0, 3, 1), F.re(-7, 4, 3, 1)), '#c8e4ff');
    p.parte(F.ov(1, 0, 3.4, 7.5, 0.6), P.azul, { sombra: 1, luz: 2 });
    p.plano(F.tr(-3, 5, 5, -5, 0.5), '#0d2a6a');
  });
  I.espinas = icono(p => {
    const pts = []; for (let i = 0; i < 20; i++) { const a = i * Math.PI / 10, q = i % 2 ? 4.2 : 7.6; pts.push(Math.cos(a) * q, Math.sin(a) * q + 0.5); }
    p.parte(F.pol(...pts), P.pardo, { sombra: 2 });
    p.parte(F.ov(0, 1, 3.6, 3.2), pal('#e8c8a0', '#c8a070', '#fff0d8', '#5a3418'), { sombra: 0 });
    p.px(-1, 0, OL); p.px(1.5, 0, OL); p.px(0, 2, '#5a1530');
  });
  I.hucha = icono(p => {
    p.parte(F.un(F.re(-5, 4, 2, 3), F.re(2, 4, 2, 3)), P.rosa, { sombra: 0 });
    p.parte(F.ov(-0.5, 1, 7, 5.2), P.rosa, { sombra: 2 });
    p.parte(F.ov(6, 1, 2, 2.2), P.rosa, { sombra: 0 }); p.px(6, 0.5, '#8a2a50'); p.px(6, 2, '#8a2a50');
    p.parte(F.pol(-4, -3, -2, -6, 0, -3.5), P.rosa, { sombra: 0 });
    p.px(3, -1, OL); p.plano(F.re(-2, -4, 3, 1), '#8a2a50');
    p.plano(F.un(F.tr(-5, -1, -3, 1, 0.5), F.tr(-3, 1, -4, 3, 0.5)), OL);
    p.parte(F.ov(0, -7, 2.4, 2.4), PAL_H.oro, { sombra: 0 });
  });
  I.carton = icono(p => {
    p.parte(F.rr(-6, -7, 12, 14, 1.5), E.carton, { sombra: 2 });
    p.plano(F.un(F.tr(-5, -6, 5, 6, 0.9), F.tr(5, -6, -5, 6, 0.9)), '#c8c0a8');
    p.plano(F.re(-4, 3, 3, 1), '#a8824a');
  });
  I.basura = icono(p => {
    const bolsa = pal('#2a2a3a', '#16161f', '#4a4a60', '#05050a');
    p.parte(F.ov(0, 2, 6.5, 5.6), bolsa, { sombra: 1 });
    p.parte(F.pol(-2.5, -3, 2.5, -3, 4, -7, -4, -7), bolsa, { sombra: 0 });
    p.plano(F.re(-5, 0, 10, 2.4), '#5a5a70'); p.px(-2.5, 1, '#fff6ea'); p.px(2.5, 1, '#fff6ea');
    p.px(3, 5, '#7be04a'); p.px(-4, 4, '#7be04a');
  });
  I.vampira = icono(p => { zanaIcono(p, P.vamp, false); p.plano(F.un(F.tr(-3, 5, -6, 8, 0.6), F.tr(-5, 3, -8, 4, 0.6)), '#2e7a3a'); p.px(1, -1, '#ffffff'); p.px(-1, 1, '#ffffff'); p.px(-6, 6, '#ff3348'); });
  I.castor = icono(p => {
    for (const [dy, a] of [[2, 0.2], [-2, -0.15]]) p.parte(F.gira(F.rr(-6, dy - 2, 11, 4.4, 1), a, 0, dy), E.rojo, { sombra: 1 });
    p.plano(F.tr(5, -3, 7, -6, 0.5), OL);
    const s = []; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, q = i % 2 ? 1.2 : 3; s.push(7 + Math.cos(a) * q, -7 + Math.sin(a) * q); }
    p.parte(F.pol(...s), PAL_H.oro, { sombra: 0 }); p.px(7, -7, '#ffffff');
  });
  I.meercat = icono(p => {
    p.parte(F.pol(-7, 4, 7, 4, 5.5, -4, -5.5, -4), P.crema, { sombra: 2 });
    p.plano(F.re(-7, 2, 14, 2), '#d6c8b4');
    p.plano(F.un(F.re(-1.2, -3, 2.4, 6), F.re(-3, -1.2, 6, 2.4)), '#e63946');
  });
  I.zorro = icono(p => {
    const naranja = P.naranja;
    p.parte(F.pol(-7, -3, -6, -9, -2, -4), naranja, { sombra: 0 }); p.parte(F.pol(7, -3, 6, -9, 2, -4), naranja, { sombra: 0 });
    p.parte(F.pol(-7.5, -4, 7.5, -4, 0, 7), naranja, { sombra: 2 });
    p.plano(F.pol(-6, -1, -1, 2, 0, 6.5, 1, 2, 6, -1, 0, 5), '#fff6ea');
    p.px(-3, -1.5, OL); p.px(3, -1.5, OL); p.px(0, 5.5, OL); p.px(-3, -2.5, '#ffcb3d');
  });
  I.mechavaca = icono(p => {
    p.parte(F.un(F.tr(-5, -4, -8, -7, 1.2, 0.6), F.tr(5, -4, 8, -7, 1.2, 0.6)), P.crema, { sombra: 0 });
    p.parte(F.rr(-6, -5, 12, 11, 3), P.plata, { sombra: 2 });
    p.plano(F.re(-5, -3, 10, 2.4), '#ff3348'); p.px(-3, -2.5, '#ffd0d4'); p.px(2, -2.5, '#ffd0d4');
    p.parte(F.ov(0, 3.5, 4.4, 2.5), P.rosa, { sombra: 0 }); p.px(-1.5, 3.5, '#8a2a50'); p.px(1.5, 3.5, '#8a2a50');
  });
  I.corona = icono(p => {
    const c = F.gira(F.pol(-7, 5, 7, 5, 7, -3, 3.5, 1, 0, -6, -3.5, 1, -7, -3), 0.22, 0, 0);
    p.parte(c, PAL_H.oro, { sombra: 2, luz: 2 });
    p.plano(F.gira(F.re(-6, 2, 12, 1.4), 0.22, 0, 0), '#e0821f');
    for (const [x, y, col] of [[-3, 3, '#ff4b5c'], [1, 3.6, '#5aaeff'], [4, 4.2, '#7be04a']]) p.px(x, y, col);
  });
  /* ---------- objetos ---------- */
  I.z_madera = icono(p => zanaIcono(p, P.madera));
  I.z_hierro = icono(p => zanaIcono(p, P.hierro));
  I.z_laser = icono(p => { zanaIcono(p, P.laser); p.plano(F.tr(-3, 3, 4, -4, 0.5), '#ffffff'); });
  I.z_dorada = icono(p => { zanaIcono(p, PAL_H.oro); p.px(-6, -6, '#fff3a0'); p.px(-7, -5, '#fff3a0'); });
  I.z_excal = icono(p => {
    for (const s of [-0.7, 0.3]) p.parte(F.ov(-6 + Math.cos(2.36 + s) * 2.6, 6 + Math.sin(2.36 + s) * 2.6, 2.6, 1.3, 2.36 + s), PAL_H.hoja, { sombra: 1 });
    p.parte(F.tr(-1, 1, 7, -7, 1.6, 0.6), P.plata, { sombra: 0 });
    p.parte(F.tr(-4, -1, 1, 4, 1), PAL_H.oro, { sombra: 0 });
    p.parte(F.tr(-5, 5, -2, 2, 1.2), PAL_H.zana, { sombra: 0 });
    p.plano(F.tr(0, 0, 6, -6, 0.4), '#ffffff');
  });
  const gorro = (a, b) => icono(p => { p.parte(F.y(F.ov(0, 3, 7, 8), F.re(-8, -6, 16, 9)), a, { sombra: 2 }); p.plano(F.un(F.re(-7, -1, 14, 1), F.re(-6, -4, 12, 1)), '#fff6ea'); p.parte(F.rr(-7.5, 2, 15, 3, 1), b, { sombra: 0 }); p.parte(F.ov(0, -6, 2.2, 2.2), P.crema, { sombra: 0 }); });
  I.g_lana = gorro(E.rojo, P.crema);
  I.g_obra = icono(p => { p.parte(F.y(F.ov(0, 3, 6.5, 8), F.re(-8, -6, 16, 8)), PAL_H.oro, { sombra: 2, luz: 2 }); p.plano(F.re(-1, -5, 2, 6), '#e0821f'); p.parte(F.rr(-8, 1, 16, 3, 1), PAL_H.oro, { sombra: 0 }); });
  I.g_cascos = icono(p => {
    p.parte(F.y(F.menos(F.ov(0, 2, 7, 8), F.ov(0, 2, 5, 6)), F.re(-8, -7, 16, 8)), P.oscuro || E.oscuro, { sombra: 0 });
    for (const x of [-7.5, 4.5]) p.parte(F.rr(x, -1, 3.4, 7, 1.4), P.lila, { sombra: 1 });
    p.px(-6, 1, '#ffffff'); p.px(6, 1, '#ffffff');
  });
  I.g_corona = icono(p => { p.parte(F.pol(-7, 5, 7, 5, 7, -4, 3.5, 0, 0, -6, -3.5, 0, -7, -4), P.plata, { sombra: 2, luz: 2 }); p.parte(F.ov(0, 2, 1.8, 1.8), P.azul, { sombra: 0 }); p.px(-4.5, 2.5, '#ff4b5c'); p.px(4.5, 2.5, '#ff4b5c'); });
  I.g_mecha = icono(p => {
    p.parte(F.un(F.tr(-5, -2, -8, -6, 1.2, 0.5), F.tr(5, -2, 8, -6, 1.2, 0.5)), P.crema, { sombra: 0 });
    p.parte(F.y(F.ov(0, 3, 7, 8), F.re(-8, -6, 16, 10)), P.plata, { sombra: 2, luz: 2 });
    p.plano(F.re(-6, 0, 12, 2.4), '#ff3348'); p.plano(F.re(-6, 0, 12, 0.8), '#ffd0d4');
  });
  I.a_trebol = icono(p => {
    p.plano(F.tr(0, 1, 3, 7, 0.7), '#2f8a3a');
    p.parte(F.menos(F.un(F.ov(-3, -3, 3.2, 3.2), F.ov(3, -3, 3.2, 3.2), F.ov(-3, 3, 3.2, 3.2), F.ov(3, 3, 3.2, 3.2)), F.ov(7, -6, 3, 3)), P.verde, { sombra: 1 });
    p.px(0, 0, '#a8ec5c');
  });
  I.a_ficha = icono(p => {
    p.parte(F.rr(-5, -7, 10, 14, 1), E.papel, { sombra: 1 });
    p.plano(F.re(-5, -7, 10, 3), '#e63946');
    for (const y of [-2, 1, 4]) p.plano(F.re(-3, y, 6, 1), '#9a9080');
    p.plano(F.re(1, 1, 2, 1), '#2e5bb8');
  });
  I.a_llave = icono(p => {
    p.parte(F.menos(F.ov(-4, -3, 3.6, 3.6), F.ov(-4, -3, 1.6, 1.6)), PAL_H.oro, { sombra: 1 });
    p.parte(F.un(F.tr(-1.5, -0.5, 6, 6, 1.1), F.re(2, 3, 2.4, 3.4), F.re(4.5, 5, 2, 3)), PAL_H.oro, { sombra: 0 });
  });
  I.a_pata = icono(p => {
    p.parte(F.menos(F.ov(0, -6, 2.4, 2.4), F.ov(0, -6, 1, 1)), PAL_H.oro, { sombra: 0 });
    p.parte(F.un(F.ov(0, 2, 4.4, 5.4), F.ov(-2.5, 6, 2, 1.6), F.ov(0, 6.6, 2, 1.6), F.ov(2.5, 6, 2, 1.6)), PAL_H.pelo, { sombra: 2 });
    p.plano(F.ov(0, 4, 1.6, 1.4), '#ffc2dc');
  });
  I.a_medalla = icono(p => {
    p.parte(F.pol(-5, -8, -1, -8, 1, -1, -2, -1), E.rojo, { sombra: 0 }); p.parte(F.pol(5, -8, 1, -8, -1, -1, 2, -1), P.verde, { sombra: 0 });
    p.parte(F.ov(0, 3, 5, 5), PAL_H.oro, { sombra: 2, luz: 2 });
    const s = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 1.3 : 3; s.push(Math.cos(a) * q, 3 + Math.sin(a) * q); }
    p.plano(F.pol(...s), '#fff3a0');
  });
  /* ---------- mejoras de La Madriguera ---------- */
  I.m_vida = icono(p => {
    for (const x of [-2, 1]) { p.px(x, -6, '#ffffff'); p.px(x + 1, -8, '#e8e0f0'); }
    p.parte(F.y(F.ov(0, -1, 7.5, 7), F.re(-8, -1, 16, 9)), P.azul, { sombra: 2 });
    p.plano(F.ov(0, -1, 7, 1.8), '#ff8a1f'); p.px(-3, -1, '#5cc23a'); p.px(2, -1, '#ffc266');
  });
  I.m_siesta = icono(p => {
    p.parte(F.rr(-7, -1, 14, 8, 3), P.crema, { sombra: 2 });
    p.plano(F.un(F.re(-7, 2, 14, 1)), '#d6c8b4');
    p.letrero('Z', 0, -9, '#5aaeff'); p.letrero('Z', 4, -7, '#c8e4ff');
  });
  I.m_contrato = icono(p => {
    p.parte(F.rr(-5, -7, 10, 14, 1), E.papel, { sombra: 1 });
    for (const y of [-5, -3, -1]) p.plano(F.re(-3, y, 6, 0.9), '#9a9080');
    p.plano(F.tr(-3, 3, 2, 2, 0.5), '#2e5bb8');
    p.parte(F.ov(3, 5, 2.4, 2.4), E.rojo, { sombra: 0 });
  });
  I.m_atq = I.zanahoria; I.m_crit = I.espiral; I.m_suerte = I.a_trebol; I.m_botin = I.hucha;
  /* ---------- huecos vacíos, casa y candado ---------- */
  const fantasma = s => { const c = silueta(s, '#4a3070'); return { c, b: c, ox: s.ox, oy: s.oy, w: s.w, h: s.h }; };
  I.h_arma = fantasma(I.z_madera); I.h_cabeza = fantasma(I.g_lana); I.h_amuleto = fantasma(I.a_trebol);
  I.casa = icono(p => { p.parte(F.pol(-6, -1, 0, -6, 6, -1), E.rojo, { sombra: 0 }); p.parte(F.re(-4.5, -1, 9, 6), P.crema, { sombra: 0 }); p.plano(F.re(-1, 1, 2, 4), '#8f5428'); });
  I.candado = icono(p => { p.parte(F.menos(F.ov(0, -3, 4, 4.5), F.ov(0, -3, 2.2, 2.6)), P.plata, { sombra: 0 }); p.parte(F.rr(-5, -2, 10, 8, 1), PAL_H.oro, { sombra: 1 }); p.plano(F.re(-0.5, 1, 1.4, 3), '#8a4a10'); });
}
