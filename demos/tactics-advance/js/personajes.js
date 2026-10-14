// Fans of Tactics Advance (prototipo) · PERSONAJES en pixel art: CrazyBunny, EpicChampion, el esqueleto, el becario y el StarBot.
// Cada uno es una función que dibuja con el pincel; las poses salen de los parámetros (o). Mismos colores que su dibujo del juego.
'use strict';

/* ---------- CrazyBunny (mirando a la derecha, de tres cuartos) ---------- */
const PB = {
  pelo:  pal('#f7f3ff', '#c3b0e6', '#ffffff', '#7a5cb0'),
  peloF: pal('#ddd3f2', '#a893d4', '#efeafc', '#6a4f9e'),
  rosa:  pal('#ffc2dc', '#f08cb8', '#ffe4f0', '#b8507e'),
  tripa: pal('#ffe6f2', '#f4bcd8', '#fff6fb', '#c27aa2'),
  capa:  pal('#ff7a1a', '#d9431e', '#ffb347', '#8f2410'),
  capaF: pal('#e2561a', '#b0331a', '#ff8a2a', '#7a1e0e'),
  zana:  pal('#ff8a1f', '#d9531a', '#ffc266', '#8a3010'),
  hoja:  pal('#5cc23a', '#2f8a3a', '#a8ec5c', '#1d5a26'),
  oro:   pal('#ffcb3d', '#e0821f', '#fff3a0', '#8a4a10'),
  ojo:   pal('#ffffff', '#ddd6f2', '#ffffff', '#3a2050'),
};
const OJO_ESPIRAL = ['..ooo..', '.owwwo.', 'owppppo', 'owpwwpo', 'owpwpwo', 'owpppwo', '.owwwo.', '..ooo..'];
const OJO_ESPIRAL_B = ['..ooo..', '.owwwo.', 'owpppwo', 'owpwpwo', 'owpwwpo', 'owppppo', '.owwwo.', '..ooo..'];
const OJO_COL = { o: '#3a2050', w: '#ffffff', p: '#8a2bff', k: '#1c1028', l: '#ddd6f2' };
const BOCA = '#5a1530', LENGUA = '#ff7aa8', ESPIRAL = '#8a2bff', GEMA = '#ff4b5c';

function conejo(p, o = {}) {
  const P = PB, ea = o.oreja || 0, cr = o.corona || 0;
  const hx = o.hx || 0, hy = o.hy || 0;               // la cabeza se mueve con la pose
  // oreja del fondo (la doblada), detrás de todo
  p.parte(F.un(F.tr(4 + hx, -26 + hy, 6.2 + hx, -32.5 + hy, 2.5, 2.2), F.tr(6.2 + hx, -32.5 + hy, 11 + hx + ea, -30.6 + hy, 2.2, 1.7)), P.peloF, { sombra: 1 });
  p.plano(F.tr(7 + hx, -32 + hy, 10.2 + hx + ea, -30.8 + hy, 0.7), P.rosa.s);
  // la capa, detrás del cuerpo (ondea)
  const w = o.ondea || 0;
  p.parte(F.pol(-6, -14.5, 6.5, -14.5, 11.5 + w * 0.5, -1.2, 5, -0.2, -3, 0, -12.5 + w, -1.2), P.capa, { sombra: 2 });
  // pie del fondo y brazo con la zanahoria (el del fondo)
  p.parte(F.ov(4.3, -1.5, 3.2, 1.7), P.peloF, { sombra: 1 });
  // cuerpo, tripa y pie de delante
  p.parte(F.ov(0.5, -8, 7, 7.3), P.pelo, { sombra: 2 });
  p.parte(F.y(F.ov(2, -7, 4.4, 5), F.ov(0.5, -8, 6.2, 6.6)), P.tripa, { sombra: 1, linea: false, luz: 0 });
  p.parte(F.ov(-3.2, -1.3, 3.7, 1.8), P.pelo, { sombra: 1 });
  p.parte(F.ov(-6.6, -9.4, 2.1, 3, 0.45), P.pelo, { sombra: 1 });
  p.parte(F.ov(1, -11.3, 5.8, 2.1), P.capa, { sombra: 0, luz: 0 });
  p.px(-2.2, -10.2, PB.oro.b);
  // la zanahoria, cogida por la punta como un garrote
  const za = o.za === undefined ? -1.15 : o.za, zx = o.zx === undefined ? 7.6 : o.zx, zy = o.zy === undefined ? -8.6 : o.zy;
  const dx = Math.cos(za), dy = Math.sin(za);
  const tipX = zx - dx * 2.6, tipY = zy - dy * 2.6, topX = zx + dx * 12, topY = zy + dy * 12;
  if (o.zana !== false) {
    for (const s of [-0.55, 0.5]) { const al = za + s; p.parte(F.ov(topX + Math.cos(al) * 2.8, topY + Math.sin(al) * 2.8, 2.7, 1.3, al), P.hoja, { sombra: 1, luz: 0 }); }
    p.parte(F.tr(tipX, tipY, topX, topY, 0.9, 3.1), P.zana, { sombra: 1 });
    for (const t of [0.45, 0.7]) { const cx = tipX + (topX - tipX) * t, cy = tipY + (topY - tipY) * t; p.px(cx - dy * 1.2, cy + dx * 1.2, P.zana.s); p.px(cx - dy * 0.2, cy + dx * 0.2, P.zana.s); }
  }
  p.parte(F.ov(zx, zy, 2.3, 2.3), P.pelo, { sombra: 1 });
  // cabeza
  p.parte(F.ov(1 + hx, -20 + hy, 8.6, 8), P.pelo, { sombra: 2, luz: 1 });
  // oreja de delante (la tiesa) con su rosa
  p.parte(F.ov(-4.3 + hx, -32 + hy, 2.8, 6.9, -0.12 + ea * 0.04), P.pelo, { sombra: 1 });
  p.plano(F.ov(-4.1 + hx, -31.6 + hy, 1.05, 4.6, -0.12 + ea * 0.04), P.rosa.b);
  p.plano(F.ov(-3.8 + hx, -30.2 + hy, 0.6, 2.4, -0.12), P.rosa.s);
  // corona torcida con su gema
  const cx = 0.4 + hx, cy = -28.4 + hy + cr;
  p.parte(F.gira(F.pol(cx - 4.4, cy + 0.6, cx + 4.4, cy + 0.6, cx + 5, cy - 5.4, cx + 2.2, cy - 2.6, cx, cy - 6.2, cx - 2.2, cy - 2.6, cx - 5, cy - 5.4), -0.22, cx, cy), P.oro, { sombra: 1, luz: 1 });
  const [gx, gy] = giraP(cx, cy - 1.6, -0.22, cx, cy);
  p.px(gx, gy, GEMA); p.px(gx + 1, gy, '#c81e3a');
  // ojos: el de delante en espiral, el del fondo con su pupila (hechos a mano, píxel a píxel)
  const ojo = o.ojo || 'normal', ex = -4.8 + hx, ey = -24.6 + hy;
  if (ojo === 'cerrado') {
    p.sello(ex, ey + 3, ['.ooooo.', 'o.....o'], { o: '#3a2050' });
    p.sello(ex + 8, ey + 3, ['.ooo.', 'o...o'], { o: '#3a2050' });
  } else {
    const giro = (o.espiral || 0) % 2;
    p.sello(ex, ey, giro ? OJO_ESPIRAL_B : OJO_ESPIRAL, OJO_COL);
    p.sello(ex + 8, ey + 1, ['.oooo.', 'owwwwo', 'owwkwo', 'owwkwo', 'owwwwo', '.oooo.'], OJO_COL);
  }
  // hocico: nariz, boca con los dos dientes y coloretes
  p.px(3.4 + hx, -17.8 + hy, LENGUA); p.px(4.4 + hx, -17.8 + hy, LENGUA);
  const bx = 3.9 + hx, by = -15.2 + hy;
  if (o.boca === 'grito') {
    p.plano(F.ov(bx, by + 0.3, 2.4, 2.2), BOCA); p.px(bx - 0.6, by - 1.5, '#ffffff'); p.px(bx + 0.4, by - 1.5, '#ffffff'); p.px(bx, by + 1.2, LENGUA);
  } else {
    for (let i = -2; i <= 2; i++) p.px(bx + i, by - (Math.abs(i) === 2 ? 1 : 0), BOCA);
    p.px(bx - 1, by - 1, BOCA); p.px(bx + 1, by - 1, BOCA); p.px(bx, by - 1, BOCA);
    p.px(bx - 0.6, by - 1, '#ffffff'); p.px(bx + 0.4, by - 1, '#ffffff');
  }
  p.px(-5.6 + hx, -16.8 + hy, '#ffb3cf'); p.px(-4.6 + hx, -16.8 + hy, '#ffb3cf'); p.px(8.6 + hx, -17.4 + hy, '#ffb3cf');
}

/* ---------- EpicChampion (Héroes) ---------- */
const PC = {
  oro:   pal('#f5c518', '#c98a12', '#fff09a', '#7a4a08'),
  oroF:  pal('#d9a514', '#a8700e', '#f5d45a', '#6a3e06'),
  piel:  pal('#f6c9a0', '#d8956a', '#ffe6cc', '#8a4a2a'),
  pluma: pal('#ef3b4a', '#b01c34', '#ff8a8a', '#5a0a1c'),
  azul:  pal('#2f6ad8', '#1d3f96', '#6a9cff', '#0e1e5a'),
  hoja:  pal('#e8ecf6', '#a8b0c4', '#ffffff', '#4a5068'),
  cuero: pal('#8a4a22', '#5e3014', '#b06a34', '#341a0a'),
};
function campeon(p, o = {}) {
  const P = PC, hy = o.hy || 0, w = o.ondea || 0;
  // capa azul detrás
  p.parte(F.pol(-6, -15, 7, -15, 10.5 + w * 0.5, -1, 2, 0, -6, 0, -11.5 + w, -1), P.azul, { sombra: 2 });
  // botas
  p.parte(F.rr(-5.5, -4, 4.6, 4, 1.4), P.cuero, { sombra: 1 });
  p.parte(F.rr(1.6, -4, 4.6, 4, 1.4), P.cuero, { sombra: 1 });
  // cuerpo de armadura, cinturón y estrella
  p.parte(F.rr(-6, -15.5, 13, 12.5, 4), P.oro, { sombra: 2 });
  p.parte(F.re(-5.5, -7, 12, 2), P.cuero, { sombra: 0, luz: 0 });
  p.px(1.5, -6.2, P.oro.l); p.px(0.5, -6.2, P.oro.b);
  p.sello(-0.5, -13.5, ['..w..', '.www.', 'wwwww', '.w.w.'], { w: '#ffffff' });
  // hombreras
  p.parte(F.ov(7.2, -14, 3.2, 2.5), P.oro, { sombra: 1 });
  // la espada (mano del fondo)
  const sa = o.sa === undefined ? -1.25 : o.sa, hx0 = o.ex === undefined ? 8.4 : o.ex, hy0 = o.ey === undefined ? -9.4 : o.ey;
  const dx = Math.cos(sa), dy = Math.sin(sa);
  p.parte(F.tr(hx0 + dx * 2, hy0 + dy * 2, hx0 + dx * 15, hy0 + dy * 15, 1.9, 1.1), P.hoja, { sombra: 1, luz: 0 });
  p.parte(F.tr(hx0 + dx * 1.6 - dy * 3, hy0 + dy * 1.6 + dx * 3, hx0 + dx * 1.6 + dy * 3, hy0 + dy * 1.6 - dx * 3, 0.9), P.oro, { sombra: 0, luz: 0 });
  p.parte(F.ov(8.4, -9.4, 2, 2), P.piel, { sombra: 1 });
  // casco con la cara
  p.parte(F.ov(1, -21.5 + hy, 7.6, 7.2), P.oro, { sombra: 2 });
  p.parte(F.ov(2.8, -19.4 + hy, 4.6, 4.3), P.piel, { sombra: 1, luz: 0 });
  p.parte(F.re(-5.5, -24.4 + hy, 14, 1.6), P.oroF, { sombra: 0, luz: 0, linea: false });
  p.px(1.6, -20.2 + hy, OL); p.px(1.6, -19.2 + hy, OL); p.px(5, -20.2 + hy, OL); p.px(5, -19.2 + hy, OL);
  p.px(2.6, -16.8 + hy, '#8a3a2a'); p.px(3.6, -16.6 + hy, '#8a3a2a'); p.px(4.6, -16.8 + hy, '#8a3a2a');
  p.px(0.4, -17.8 + hy, '#f59a8a');
  // penacho rojo hacia atrás
  p.parte(F.pol(3, -27.2 + hy, 0, -31.2 + hy, -4.5, -32.4 + hy, -8.4, -29.4 + hy, -7.4, -26.6 + hy, -4.6, -28.2 + hy, -1.2, -27.8 + hy, 1.6, -26.4 + hy), P.pluma, { sombra: 1 });
  // escudo redondo delante
  p.parte(F.ov(-6.4, -9.6, 5.2, 5.6), P.azul, { sombra: 1 });
  p.parte(F.menos(F.ov(-6.4, -9.6, 5.2, 5.6), F.ov(-6.4, -9.6, 4.2, 4.6)), P.oro, { sombra: 0, luz: 0, linea: false });
  p.sello(-8.9, -12.1, ['..y..', '..y..', 'yyyyy', '.yyy.', '.y.y.'], { y: '#ffe04a' });
}

/* ---------- Esqueleto pirata (No-Muertos, corrompido por Microblizz) ---------- */
const PE = {
  hueso:  pal('#efeadf', '#bfb39a', '#ffffff', '#6e5e4c'),
  huesoF: pal('#d4ccb8', '#a8987e', '#ece4d4', '#5e4e3c'),
  panue:  pal('#e0303c', '#a01c2c', '#ff6a6a', '#5a0c18'),
};
function esqueleto(p, o = {}) {
  const P = PE, hy = o.hy || 0, ba = o.ba === undefined ? -1.1 : o.ba;
  // brazo del fondo con el hueso-garrote
  const hx0 = 6.4, hy0 = -11.6, dx = Math.cos(ba), dy = Math.sin(ba);
  p.parte(F.tr(3.8, -11.6, hx0, hy0, 0.9), P.huesoF, { sombra: 0, luz: 0 });
  p.parte(F.un(F.tr(hx0 - dx * 1, hy0 - dy * 1, hx0 + dx * 9, hy0 + dy * 9, 1.1), F.ov(hx0 + dx * 9.6 - dy * 1.1, hy0 + dy * 9.6 + dx * 1.1, 1.5, 1.5), F.ov(hx0 + dx * 9.6 + dy * 1.1, hy0 + dy * 9.6 - dx * 1.1, 1.5, 1.5)), P.hueso, { sombra: 1, luz: 0 });
  // piernas
  p.parte(F.tr(-1.4, -5.4, -2, -1.2, 1), P.huesoF, { sombra: 0, luz: 0 });
  p.parte(F.tr(2.4, -5.4, 3, -1.2, 1), P.hueso, { sombra: 0, luz: 0 });
  p.parte(F.ov(-2.6, -0.9, 2, 1.1), P.huesoF, { sombra: 0, luz: 0 });
  p.parte(F.ov(3.6, -0.9, 2, 1.1), P.hueso, { sombra: 0, luz: 0 });
  // pelvis, costillas y columna
  p.parte(F.ov(0.6, -5.4, 3.4, 1.6), P.hueso, { sombra: 1, luz: 0 });
  p.parte(F.ov(0.6, -9.8, 4.6, 3.8), P.hueso, { sombra: 1 });
  for (const y of [-11, -9.2, -7.4]) for (let x = -2.6; x <= 3.8; x++) if (Math.abs(x - 0.6) > 0.8) p.px(x, y, P.hueso.o);
  // brazo de delante
  p.parte(F.tr(-3.4, -11.4, -5, -6.6, 0.9), P.hueso, { sombra: 0, luz: 0 });
  p.parte(F.ov(-5.2, -6, 1.3, 1.3), P.hueso, { sombra: 0, luz: 0 });
  // cráneo y mandíbula
  p.parte(F.ov(1.6, -14.4 + hy, 3.6, 2), P.hueso, { sombra: 1, luz: 0 });
  p.parte(F.ov(1, -19.6 + hy, 6.2, 5.6), P.hueso, { sombra: 2 });
  p.px(0, -14.6 + hy, P.hueso.o); p.px(1.4, -14.6 + hy, P.hueso.o); p.px(2.8, -14.6 + hy, P.hueso.o);
  // pañuelo pirata con el nudo atrás
  p.parte(F.y(F.ov(1, -19.6 + hy, 6.6, 6), F.re(-8, -40, 20, 18.6 + hy)), P.panue, { sombra: 1 });
  p.parte(F.un(F.ov(-6.2, -21 + hy, 1.6, 1.4), F.tr(-6.2, -21 + hy, -8.4, -17.6 + hy, 0.9, 0.6), F.tr(-6, -20.6 + hy, -6.4, -17 + hy, 0.8, 0.6)), P.panue, { sombra: 0, luz: 0 });
  p.px(-1.6, -23.6 + hy, '#ffffff'); p.px(2.4, -24 + hy, '#ffffff'); p.px(4.8, -22.6 + hy, '#ffffff');
  // cuencas con el brillo morado de Microblizz y la nariz
  const ojo = o.corrupto === false ? '#4ad8a0' : '#c050ff';
  p.sello(-1.8, -20 + hy, ['oo.', 'ooo', '.o.'], { o: '#2a1c2c' });
  p.sello(2.6, -20 + hy, ['.oo', 'ooo', '.o.'], { o: '#2a1c2c' });
  p.px(-0.6, -19 + hy, ojo); p.px(3.8, -19 + hy, ojo);
  p.px(1.6, -17 + hy, '#2a1c2c');
}

/* ---------- Becario (Microblizz) ---------- */
const PM = {
  metal:  pal('#b8c0cc', '#7c8696', '#e4e8f0', '#3c4454'),
  metalF: pal('#9aa4b4', '#6a7486', '#c4ccd8', '#2e3646'),
  pant:   pal('#3c6cd8', '#2a4ca8', '#6c9cf0', '#1c2a60'),
  taza:   pal('#f4f0e8', '#c8c0b0', '#ffffff', '#5a5040'),
};
function becario(p, o = {}) {
  const P = PM, hy = o.hy || 0;
  // piernas y pies
  p.parte(F.rr(-3.4, -4.4, 2.6, 4.4, 1), P.metalF, { sombra: 0, luz: 0 });
  p.parte(F.rr(1.8, -4.4, 2.6, 4.4, 1), P.metalF, { sombra: 0, luz: 0 });
  // cuerpo con la tarjeta de identificación
  p.parte(F.rr(-5, -12.6, 10.8, 9, 2), P.metal, { sombra: 2 });
  p.sello(-2.6, -10.6, ['bbb', 'www', 'wkw', 'www'], { b: '#3c6cd8', w: '#ffffff', k: '#5a6478' });
  p.px(-1.4, -12.2, '#d83a3a');
  // brazos: el de delante cuelga, el del fondo lleva el café
  p.parte(F.rr(-7, -11.6, 2.4, 5, 1.1), P.metal, { sombra: 0, luz: 0 });
  p.parte(F.rr(5.2, -11, 2.6, 4, 1.1), P.metalF, { sombra: 0, luz: 0 });
  p.parte(F.un(F.rr(6.4, -11.6, 4.4, 4.6, 1), F.menos(F.ov(11, -9.2, 1.8, 1.8), F.ov(11, -9.2, 0.8, 0.8))), P.taza, { sombra: 1, luz: 0 });
  p.px(7.4, -11.4, '#6a3a1a'); p.px(8.4, -11.4, '#6a3a1a'); p.px(9.4, -11.4, '#6a3a1a');
  if (o.vapor) { p.px(8.4, -13.6 - o.vapor, '#ffffff'); p.px(9.2, -15 - o.vapor, '#e8eef8'); }
  // antena
  p.parte(F.tr(0.6, -24.4 + hy, 0.6, -27.6 + hy, 0.5), P.metalF, { sombra: 0, luz: 0, linea: false });
  p.parte(F.ov(0.6, -28.6 + hy, 1.6, 1.6), pal('#ff4b5c', '#c81e3a', '#ffb0b8', '#6a0c1a'), { sombra: 0, luz: 1 });
  // cabeza-monitor con la cara en la pantalla
  p.parte(F.rr(-6, -24.8 + hy, 13.4, 12.6, 3), P.metal, { sombra: 2 });
  p.parte(F.rr(-4, -22.6 + hy, 9.6, 8.4, 1.6), P.pant, { sombra: 0, luz: 0 });
  p.px(-3.2, -21.8 + hy, '#a8c8ff'); p.px(-2.2, -21.8 + hy, '#a8c8ff');
  const ojos = o.ojos || 'sueno';
  if (ojos === 'sueno') { p.sello(-2.2, -19.4 + hy, ['www.www', '.......', '.......'], { w: '#e8f4ff' }); p.sello(-2.2, -18.4 + hy, ['.ww..ww'], { w: '#9cc4ff' }); }
  else p.sello(-2.2, -20.4 + hy, ['www.www', 'w.w.w.w', 'www.www'], { w: '#e8f4ff' });
  p.sello(-0.2, -16.2 + hy, ['www'], { w: '#e8f4ff' });
}

/* ---------- StarBot (Microblizz) ---------- */
const PS = {
  cuerpo: pal('#3e4c80', '#27305c', '#6474b0', '#121838'),
  visor:  pal('#5ee0f0', '#28a8c8', '#d8fcff', '#0e4a68'),
  canon:  pal('#4a5470', '#2c3248', '#7684a4', '#141828'),
};
function starbot(p, o = {}) {
  const P = PS, hy = o.hy || 0;
  p.parte(F.ov(-2.6, -1.4, 2.6, 1.6), P.canon, { sombra: 0, luz: 0 });
  p.parte(F.ov(3.4, -1.4, 2.6, 1.6), P.canon, { sombra: 0, luz: 0 });
  p.parte(F.ov(-6.2, -11 + hy * 0.5, 2.4, 4.6), P.cuerpo, { sombra: 1 });
  p.parte(F.ov(0.6, -11.4 + hy * 0.5, 7, 9.6), P.cuerpo, { sombra: 2, luz: 1 });
  p.parte(F.ov(3, -15.6 + hy, 4.8, 3.1), P.visor, { sombra: 1, luz: 1 });
  p.px(1.2, -16.6 + hy, '#ffffff'); p.px(2.2, -17.2 + hy, '#ffffff');
  p.parte(F.tr(-0.4, -20.4 + hy, 0.6, -23.6 + hy, 0.5), P.canon, { sombra: 0, luz: 0, linea: false });
  p.parte(F.ov(0.8, -24.4 + hy, 1.5, 1.5), pal('#ffd23a', '#e0961a', '#fff6b0', '#7a4a08'), { sombra: 0, luz: 1 });
  p.sello(-0.8, -9.4, ['..y..', '.yyy.', 'yyyyy', '.y.y.'], { y: '#ffd23a' });
  // cañón en el brazo del fondo
  p.parte(F.rr(5.4, -10.4, 7.4, 4.2, 1.6), P.canon, { sombra: 1, luz: 1 });
  p.parte(F.ov(12.6, -8.3, 1.2, 1.7), P.visor, { sombra: 0, luz: 0, linea: false });
  if (o.disparo) p.parte(F.ov(14.4, -8.3, 1.8, 1.8), pal('#c8fbff', '#5ee0f0', '#ffffff', '#28a8c8'), { sombra: 0, luz: 0 });
}

/* ---------- retrato grande de CrazyBunny (ventana de estado), 44 × 40 con el origen abajo en el centro ---------- */
function retratoConejo(p, o = {}) {
  const P = PB;
  p.parte(F.pol(-22, 0, 22, 0, 16, -10, -16, -10), P.capa, { sombra: 2 });
  p.parte(F.ov(0, 0, 13, 9), P.pelo, { sombra: 2 });
  p.parte(F.y(F.ov(2, 1, 8, 7), F.ov(0, 0, 12, 8)), P.tripa, { sombra: 1, linea: false, luz: 0 });
  p.parte(F.ov(0.5, -8.6, 11, 3), P.capa, { sombra: 1, luz: 1 });
  p.parte(F.ov(-6, -8.2, 1.6, 1.6), P.oro, { sombra: 0, luz: 0 });
  // oreja del fondo, doblada
  p.parte(F.un(F.tr(8, -30, 11, -38, 4.2, 3.8), F.tr(11, -38, 20, -36, 3.8, 3)), P.peloF, { sombra: 1 });
  p.plano(F.tr(12.5, -37.4, 18.6, -36.2, 1.3), P.rosa.s);
  // cabeza
  p.parte(F.ov(1, -20, 15, 13.4), P.pelo, { sombra: 3, luz: 2 });
  // oreja de delante
  p.parte(F.ov(-8, -38, 4.8, 11, -0.14), P.pelo, { sombra: 2 });
  p.plano(F.ov(-7.7, -37.4, 2, 8, -0.14), P.rosa.b);
  p.plano(F.ov(-7.2, -34.8, 1.2, 4.6, -0.14), P.rosa.s);
  // corona
  const cx = 0, cy = -31.6;
  p.parte(F.gira(F.pol(cx - 7.6, cy + 1.2, cx + 7.6, cy + 1.2, cx + 8.6, cy - 8.2, cx + 3.8, cy - 3.8, cx, cy - 9.6, cx - 3.8, cy - 3.8, cx - 8.6, cy - 8.2), -0.2, cx, cy), P.oro, { sombra: 2, luz: 1 });
  const [gx, gy] = giraP(cx, cy - 2.4, -0.2, cx, cy);
  p.parte(F.ov(gx, gy, 1.7, 1.7), pal('#ff4b5c', '#c81e3a', '#ffb0b8', '#6a0c1a'), { sombra: 1, luz: 0 });
  // ojo en espiral
  p.parte(F.ov(-4.2, -21, 6, 6.6), P.ojo, { sombra: 1, luz: 0 });
  const giro = o.espiral || 0;
  for (let a = 0.2; a < 3.2 * Math.PI; a += 0.12) { const r = 0.3 + a * 0.46; p.px(-4.2 + Math.cos(a + giro) * r, -21 + Math.sin(a + giro) * r * 1.08, ESPIRAL); }
  // ojo del fondo
  p.parte(F.ov(8.6, -21.6, 4.2, 5.6), P.ojo, { sombra: 1, luz: 0 });
  p.plano(F.ov(9.8, -21.2, 1.8, 2.8), OL);
  p.px(9.2, -22.8, '#ffffff');
  // nariz, boca con los dientes y coloretes
  p.plano(F.pol(3.6, -15.6, 6.6, -15.6, 5.1, -13.8), LENGUA);
  p.plano(F.y(F.ov(5.2, -12.2, 5.8, 4.4), F.re(-10, -12.2, 30, 10)), BOCA);
  p.plano(F.re(3, -12.2, 2, 2.6), '#ffffff'); p.plano(F.re(5.6, -12.2, 2, 2.6), '#ffffff');
  p.plano(F.ov(5.2, -8.8, 2.6, 1.2), LENGUA);
  p.plano(F.ov(-10.4, -13.4, 2.6, 1.3), '#ffb3cf'); p.plano(F.ov(13.4, -14, 1.6, 1.1), '#ffb3cf');
}
