// Fans of Roguelite · Cosas del camino y de los eventos en pixel art: el castor BoomBeaver, la bolsa de JunkCoon, la máquina
// de café, el gashapón de Microblizz, la ruleta, la hoguera de la huelga, las lápidas, el cofre, La Madriguera (el menú) y lo
// que llueve en los ataques especiales (sobres, lápidas, billetes, tazas y disquetes).
'use strict';

const PAL_P = {
  castor: pal('#8a5a33', '#5e3a1e', '#b07a50', '#2a1608'),
  cola:   pal('#6b4a2e', '#4a3020', '#8f6a46', '#2a1a10'),
  piedra: pal('#8a8aa0', '#5a5a70', '#b8b8d0', '#2a2a3a'),
  piedraF: pal('#6e6e86', '#4a4a5e', '#9a9ab4', '#22222e'),
  hierba: pal('#4cb04a', '#2e7a3a', '#8fe060', '#1d4a26'),
  tierra: pal('#8a5a3a', '#6e4430', '#a8724a', '#3a2010'),
  puerta: pal('#ff7a1a', '#d9431e', '#ffb347', '#8f2410'),
  cristal: pal('#c8f0ff', '#8ad0f0', '#ffffff', '#3a6a8a'),
  rojo:   pal('#e63946', '#a8202e', '#ff7a84', '#4a0a14'),
};

function hazProp(w, h, ox, oy, dibuja, espejo) { const p = new Pincel(w, h, ox, oy, espejo ? { espejo: true } : {}); dibuja(p); return p.lienzo(); }

function creaProps() {
  const P = PAL_P, E = PAL_E;
  // BoomBeaver: castor con casco y dinamita (corre hacia el enemigo)
  const castor = (pata, mecha) => hazProp(28, 24, 12, 22, p => {
    p.parte(F.ov(-8, -5, 6, 3, -0.3), P.cola, { sombra: 1 });
    p.parte(F.ov(-2 + pata, -1.5, 2.4, 1.4), P.castor, { sombra: 0 }); p.parte(F.ov(3 - pata, -1.5, 2.4, 1.4), P.castor, { sombra: 0 });
    p.parte(F.ov(0, -7, 6, 5.4), P.castor, { sombra: 2 });
    for (const dx of [-2.4, 0, 2.4]) p.parte(F.rr(dx - 1, -10, 2, 6.6, 0.6), E.rojo, { sombra: 0 });
    p.parte(F.ov(4.5, -13, 4.6, 4.2), P.castor, { sombra: 2 });
    p.parte(F.menos(F.ov(4.5, -15, 5.2, 3.6), F.re(-5, -14.4, 20, 10)), PAL_H.oro, { sombra: 0 });
    p.px(6.5, -13.5, OL); p.plano(F.re(8, -11, 2, 2.4), '#fff7d6'); p.px(9.4, -12.6, '#3a1a12');
    if (mecha) { p.px(0, -11, '#ffcb3d'); p.px(0, -12, '#fff3a0'); p.px(1, -12, '#ff8a1f'); }
  });
  SPR.castor = [castor(0, true), castor(1.5, false)];
  SPR.bolsa = hazProp(14, 14, 7, 7, p => {
    p.parte(F.ov(0, 1, 5, 4.6), pal('#2a2a3a', '#16161f', '#4a4a60', '#05050a'), { sombra: 1 });
    p.parte(F.pol(-2, -3, 2, -3, 3, -6, -3, -6), pal('#2a2a3a', '#16161f', '#4a4a60', '#05050a'), { sombra: 0 });
    p.px(-2, -0.5, '#6a6a80'); p.px(2, 3, '#7be04a');
  });
  // la máquina de café de la oficina
  SPR.maquina = hazProp(28, 46, 14, 44, p => {
    p.parte(F.rr(-10, -41, 20, 41, 2), E.caja, { sombra: 3, luz: 2 });
    p.plano(F.re(-8, -39.5, 16, 8.5), '#0f1d44');
    p.parte(F.rr(-8, -31, 11, 13, 1), pal('#1b2033', '#10131f', '#2a3048', '#0a0c14'), { sombra: 0, luz: false });
    for (let i = 0; i < 6; i++) p.px(-6.5 + (i % 3) * 3.5, -28 + Math.floor(i / 3) * 5, ['#ff7a1a', '#7be04a', '#ffcb3d', '#ff4b5c', '#5aaeff', '#fff6ea'][i]);
    for (let i = 0; i < 4; i++) p.plano(F.re(5, -30 + i * 3, 2.4, 1.6), ['#ff4b5c', '#7be04a', '#ffcb3d', '#fff6ea'][i]);
    p.plano(F.rr(-5, -12, 10, 7, 1), '#0a0c14'); p.parte(F.rr(-2, -9, 4, 4, 0.8), E.taza, { sombra: 0 });
    letreroRecto(p, 'MB', 0, -38.5, '#fff6ea');
  });
  // el gashapón de Microblizz
  const gash = sacude => hazProp(30, 42, 15, 40, p => {
    p.parte(F.rr(-9, -17, 18, 17, 2), P.rojo, { sombra: 3 });
    p.plano(F.rr(-4, -8, 8, 5, 1), '#2a0d14'); p.parte(F.ov(5, -12, 2.4, 2.4), PAL_E.taza, { sombra: 0 });
    p.plano(F.re(-6, -14.5, 3, 1), '#2a0d14');
    const cupula = F.ov(sacude, -27, 10, 10);
    p.parte(cupula, P.cristal, { sombra: 2, luz: 2 });
    for (const [x, y, c] of [[-4, -22, '#ff7aa8'], [1, -21, '#ffcb3d'], [5, -23, '#5aaeff'], [-2, -27, '#7be04a'], [3, -28, '#d08cff'], [-5, -31, '#ff8a1f']]) p.plano(F.y(F.ov(x + sacude, y, 2.2, 2.2), cupula), c);
    p.plano(F.y(F.ov(-4 + sacude, -32, 2, 3), cupula), '#ffffff');
    p.parte(F.rr(-5 + sacude, -38, 10, 3, 1), P.rojo, { sombra: 0 });
    letreroRecto(p, 'MB', 0, -16, '#fff6ea');
  });
  SPR.gashapon = [gash(0), gash(1), gash(-1)];
  SPR.capsulas = ['#ff7aa8', '#ffcb3d', '#5aaeff', '#7be04a', '#d08cff'].map(c => hazProp(12, 12, 6, 6, p => {
    p.parte(F.y(F.ov(0, 0, 4.4, 4.4), F.re(-6, -6, 12, 6)), pal(c, mezcla(c, '#000000', 0.3), mezcla(c, '#ffffff', 0.5), mezcla(c, '#000000', 0.6)), { sombra: 0 });
    p.parte(F.y(F.ov(0, 0, 4.4, 4.4), F.re(-6, 0, 12, 6)), pal('#fff6ea', '#d6c8b4', '#ffffff', '#6a5a48'), { sombra: 1 });
  }));
  // la ruleta: el poste (la rueda se pinta girando, en pintaRuleta)
  SPR.ruletaPie = hazProp(32, 22, 16, 20, p => {
    p.parte(F.rr(-2, -18, 4, 18, 1), PAL_E.oscuro, { sombra: 0 });
    p.parte(F.rr(-12, -4, 24, 4, 1.5), PAL_E.caja, { sombra: 1 });
  });
  // la hoguera de la huelga: troncos, piedras y dos pancartas
  SPR.hoguera = hazProp(84, 34, 42, 32, p => {
    for (const [x, c] of [[-17, tr('HUELGA')], [18, '!!!']]) {
      p.parte(F.re(x - 0.8, -22, 1.6, 22), PAL_E.madera, { sombra: 0 });
      const w = Math.max(14, anchoTexto(c) + 4);
      p.parte(F.rr(x - w / 2, -31, w, 10, 1), PAL_E.carton, { sombra: 1 });
      letreroRecto(p, c, x, -29.5, '#e63946');
    }
    for (let i = 0; i < 7; i++) { const a = Math.PI * (0.05 + i * 0.15); p.parte(F.ov(Math.cos(a) * 8, -2 + Math.sin(a) * 0.5 - (i % 2), 2.4, 1.8), P.piedra, { sombra: 0 }); }
    p.parte(F.tr(-6, -1.5, 6, -4, 1.6), PAL_E.madera, { sombra: 0 }); p.parte(F.tr(-6, -4, 6, -1.5, 1.6), PAL_E.madera, { sombra: 0 });
  });
  // lápida grande (encuentros del cementerio)
  SPR.tumba = hazProp(28, 30, 14, 28, p => {
    p.parte(F.un(F.rr(-8, -20, 16, 20, 1), F.ov(0, -20, 8, 6)), P.piedra, { sombra: 3, luz: 2 });
    letreroRecto(p, 'RIP', 0, -20, '#2a2a3a');
    p.plano(F.un(F.tr(-5, -9, -2, -6, 0.5), F.tr(-2, -6, -3, -3, 0.5)), '#5a5a70');
    for (const x of [-9, -4, 6, 9]) p.plano(F.tr(x, 0, x + 1, -3, 0.6), '#4cb04a');
  });
  // el cofre (cerrado y abierto)
  const cofre = abierto => hazProp(32, 30, 16, 28, p => {
    p.parte(F.rr(-11, -12, 22, 12, 1), PAL_E.madera, { sombra: 2 });
    for (const x of [-8, 6]) p.parte(F.re(x, -12, 2.4, 12), PAL_H.oro, { sombra: 0 });
    const tapa = F.gira(F.menos(F.ov(0, -12, 11, 6), F.re(-20, -12, 40, 10)), abierto ? -0.9 : 0, -11, -12);
    if (abierto) { p.plano(F.re(-10, -14, 20, 2.5), '#fff3a0'); p.plano(F.ov(0, -14, 8, 2), '#ffcb3d'); }
    p.parte(tapa, PAL_E.madera, { sombra: 1 });
    p.parte(F.y(F.gira(F.re(-12, -13.6, 24, 2), abierto ? -0.9 : 0, -11, -12), F.gira(F.ov(0, -12, 11.4, 6.4), abierto ? -0.9 : 0, -11, -12)), PAL_H.oro, { sombra: 0 });
    if (!abierto) { p.parte(F.rr(-2, -13, 4, 5, 1), PAL_H.oro, { sombra: 0 }); p.px(0, -11, OL); }
  });
  SPR.cofre = [cofre(false), cofre(true)];
  // lo que llueve en los ataques especiales
  SPR.lluvia = {
    sobre: SPR.sobre,
    lapida: hazProp(12, 14, 6, 12, p => { p.parte(F.un(F.rr(-4, -9, 8, 9, 1), F.ov(0, -9, 4, 3)), P.piedra, { sombra: 1 }); p.plano(F.un(F.re(-0.5, -10, 1, 6), F.re(-2, -8.5, 4, 1)), '#4a4a5e'); }),
    billete: hazProp(14, 10, 7, 5, p => { p.parte(F.re(-6, -3, 12, 6), pal('#7be04a', '#3f9a2a', '#c8ff9a', '#1d4a10'), { sombra: 0 }); letreroRecto(p, '$', 0, -3, '#1d4a10'); }),
    taza: hazProp(10, 10, 5, 5, p => { p.parte(F.rr(-3, -3, 6, 6, 1), PAL_E.taza, { sombra: 1 }); p.plano(F.re(-2, -3, 4, 1), '#6b3a1c'); p.parte(F.menos(F.ov(3.6, 0, 1.8, 1.8), F.ov(3.6, 0, 0.8, 0.8)), PAL_E.taza, { sombra: 0 }); }),
    disquete: hazProp(12, 12, 6, 6, p => { p.parte(F.re(-4.5, -4.5, 9, 9), pal('#2e5bb8', '#1d3f8a', '#5b8fe6', '#0d2259'), { sombra: 1 }); p.plano(F.re(-2.5, -4.5, 5, 3), '#c3cbe0'); p.plano(F.re(-3, 0.5, 6, 3.5), '#fff6ea'); }),
    toxico: hazProp(10, 10, 5, 5, p => { p.parte(F.ov(0, 0, 3.6, 3.6), pal('#7be04a', '#3f9a2a', '#c8ff9a', '#1d4a10'), { sombra: 1 }); }),
  };
  creaMadriguera();
}

// La Madriguera: la casa de CrazyBunny (montículo con puerta naranja, ventanas, chimenea y huerto)
function creaMadriguera() {
  const P = PAL_P;
  SPR.madriguera = hazProp(130, 70, 65, 66, p => {
    p.parte(F.y(F.ov(0, 0, 60, 46), F.re(-70, -60, 140, 60)), P.hierba, { sombra: 4, luz: 2 });
    for (let i = 0; i < 14; i++) { const x = -50 + i * 7.5 + (i % 3), y = -6 - Math.sqrt(Math.max(0, 1 - (x / 58) ** 2)) * 38 + (i % 2) * 6 + 6; p.px(x, y, i % 2 ? '#ff7aa8' : '#ffcb3d'); p.px(x + 1, y, '#fff6ea'); }
    p.parte(F.rr(28, -48, 9, 14, 1), P.piedraF, { sombra: 1 }); p.parte(F.rr(27, -50, 11, 3, 1), P.piedra, { sombra: 0 });
    p.parte(F.un(F.ov(0, -14, 11, 13), F.re(-11, -14, 22, 14)), pal('#8a5a33', '#5e3a1e', '#b07a50', '#2a1608'), { sombra: 0 });
    p.parte(F.un(F.ov(0, -14, 9, 11), F.re(-9, -14, 18, 14)), P.puerta, { sombra: 2, luz: 2 });
    p.plano(F.re(-0.5, -24, 1, 24), '#d9431e');
    p.parte(F.ov(5, -10, 1.6, 1.6), PAL_H.oro, { sombra: 0 });
    for (const x of [-30, 22]) { p.parte(F.ov(x, -22, 6, 6), pal('#8a5a33', '#5e3a1e', '#b07a50', '#2a1608'), { sombra: 0 }); p.plano(F.ov(x, -22, 4.4, 4.4), '#ffe08a'); p.plano(F.un(F.re(x - 0.5, -26.4, 1, 8.8), F.re(x - 4.4, -22.5, 8.8, 1)), '#8a5a33'); p.plano(F.ov(x - 1.5, -24, 1.2, 1.2), '#fff8d0'); }
    p.parte(F.rr(-55, -4, 18, 4, 1), P.tierra, { sombra: 0 });
    for (let x = -53; x < -38; x += 4) { p.plano(F.pol(x, -4, x + 1.5, -10, x + 3, -4), '#4cb04a'); p.px(x + 1.5, -3.5, '#ff8a1f'); }
    p.parte(F.re(42, -16, 1.6, 16), PAL_E.madera, { sombra: 0 }); p.parte(F.rr(38, -22, 11, 7, 2), P.rojo, { sombra: 1 }); p.px(48, -21, '#ffcb3d');
  });
}

// la rueda de la ruleta, girada «ang» radianes (se pinta píxel a píxel cada fotograma)
const SEGMENTOS_RULETA = ['#ffcb3d', '#5aaeff', '#7be04a', '#d08cff', '#ff8a1f', '#ff4b5c', '#fff6ea', '#3a4258'];
function pintaRuleta(ctx, cx, cy, r, ang) {
  cx = Math.round(cx); cy = Math.round(cy);
  for (let y = -r - 1; y <= r + 1; y++) for (let x = -r - 1; x <= r + 1; x++) {
    const d = Math.sqrt(x * x + y * y);
    if (d > r + 0.6) continue;
    let col;
    if (d > r - 0.6) col = OL;
    else if (d < 2.2) col = d < 1.2 ? '#fff6ea' : OL;
    else {
      const a = ((Math.atan2(y, x) - ang) % (Math.PI * 2) + Math.PI * 4) % (Math.PI * 2), s = Math.floor(a / (Math.PI / 4));
      const borde = Math.abs((a % (Math.PI / 4)) - 0) < 0.06 || Math.abs((a % (Math.PI / 4)) - Math.PI / 4) < 0.06;
      col = borde ? OL : SEGMENTOS_RULETA[s];
      if (!borde && d > r - 2) col = mezcla(col, '#000000', 0.25);
    }
    ctx.fillStyle = col; ctx.fillRect(cx + x, cy + y, 1, 1);
  }
  ctx.fillStyle = OL; ctx.fillRect(cx - 2, cy - r - 4, 5, 4); ctx.fillStyle = '#ff4b5c'; ctx.fillRect(cx - 1, cy - r - 3, 3, 2); ctx.fillRect(cx, cy - r - 1, 1, 2);
}
// llamas de la hoguera (cambian cada fotograma)
function pintaLlamas(ctx, x, y, t) {
  for (let k = 0; k < 12; k++) {
    const ph = (t * 3 + k * 0.37) % 1, fx = x + Math.round(Math.sin(k * 2.1 + t * 6) * 5 * (1 - ph)), fy = y - Math.round(ph * 16);
    const c = ph < 0.3 ? '#fff3a0' : ph < 0.6 ? '#ffcb3d' : ph < 0.85 ? '#ff8a1f' : '#e63946', s = ph < 0.5 ? 2 : 1;
    ctx.fillStyle = c; ctx.fillRect(fx, fy, s, s);
  }
  circuloPx(ctx, x, y - 3, 3, '#ff8a1f'); circuloPx(ctx, x, y - 4, 2, '#ffcb3d'); ctx.fillStyle = '#fff3a0'; ctx.fillRect(x, y - 5, 1, 2);
}
