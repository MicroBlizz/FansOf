// Fans of Dungeons · Los objetos en pixel art nuevo: cafés (las pociones), pergaminos de despido, parches, llaves, monedas,
// armas, armaduras y accesorios, más los muebles con vida propia: el puesto de Lola, la máquina de Phony y la cafetera.
// Se dibujan con el pincel sobre un lienzo pequeño y quedan en ICO[nombre] (con los pies en ox, oy, como las figuras).
'use strict';

const ICO = {};
function icono(nombre, w, h, dibuja) { const p = new Pincel(w, h, Math.floor(w / 2), h - 2); dibuja(p); ICO[nombre] = p.lienzo(); }

const PAL_OBJ = {
  taza: pal5('#fff6ea', '#d6c8b4', '#ffffff', '#6a5a48'),
  cafe: pal5('#6a3a1c', '#3e2010', '#9a5a30', '#1e0c04'),
  papel: pal5('#f4e6c2', '#c9b58a', '#fffaea', '#6a5a34'),
  oro: pal5('#f2c53d', '#b8841a', '#ffe88a', '#6a4408', '#7a4e0a', '#fff8d0'),
  acero: pal5('#c3cbe0', '#7d889e', '#eef2fa', '#3a4262'),
  madera: pal5('#a86c3a', '#6e4220', '#d49a62', '#3a200c'),
  cuero: pal5('#8a5a3a', '#5a3620', '#b8845a', '#2e180a'),
  tela: pal5('#4a6fb8', '#2c457a', '#7a9ae0', '#16244a'),
  verde: pal5('#3fcf6a', '#1e8a46', '#a0f0b8', '#0f4a22'),
  rojo: pal5('#ff4b5c', '#b01c30', '#ff9aa4', '#5a0a14'),
  azul: pal5('#4aa3ff', '#2456b8', '#a8d4ff', '#102a60'),
  morado: pal5('#b06cff', '#6a30c0', '#e0c0ff', '#3a1070'),
  plastico: pal5('#eef0f8', '#b4b8cc', '#ffffff', '#5a5e78'),
};

// una taza de café: el color del contenido cambia (solo, con hielo, doble, quemado)
function taza(p, contenido, extra) {
  const P = PAL_OBJ;
  p.parte(F.rr(-7, -14, 14, 13, 2), P.taza, { sombra: 2 });
  p.plano(F.ov(9, -8, 3, 3), P.taza.o); p.plano(F.ov(9, -8, 1.4, 1.4), P.taza.b);
  p.parte(F.ov(0, -13, 6, 2), contenido, { sombra: 1, luz: false });
  if (extra === 'hielo') { p.px(-2, -13.5, '#ffffff'); p.px(2, -13, '#dff6ff'); }
  if (extra === 'vapor') for (const [x, y] of [[-3, -18], [0, -20], [3, -18]]) p.px(x, y, '#ffffff');
  if (extra === 'humo') for (const [x, y] of [[-3, -18], [-1, -21], [2, -19], [4, -23]]) p.px(x, y, '#8a8a9a');
  if (extra === 'rayo') { p.plano(F.pol(-1, -22, 2, -22, 0, -18, 2, -18, -2, -13, -1, -17, -3, -17), '#ffe066'); }
}
// un pergamino enrollado con su lazo de color
function pergamino(p, lazo) {
  const P = PAL_OBJ;
  p.parte(F.rr(-8, -13, 16, 11, 2), P.papel, { sombra: 2 });
  p.parte(F.ov(-8, -8, 2.5, 6), P.papel, { sombra: 1 }); p.parte(F.ov(8, -8, 2.5, 6), P.papel, { sombra: 1 });
  for (let y = -10; y <= -5; y += 2.5) p.plano(F.re(-4, y, 8, 1), P.papel.s);
  p.parte(F.re(-2, -14, 4, 13), lazo, { sombra: 0 });
}

function creaObjetos() {
  const P = PAL_OBJ;
  icono('cafe_solo', 26, 26, p => taza(p, P.cafe, 'vapor'));
  icono('cafe_hielo', 26, 26, p => taza(p, pal5('#8a6a4a', '#5a4030', '#b89a7a', '#2e1a0a'), 'hielo'));
  icono('cafe_doble', 26, 26, p => taza(p, pal5('#3a1a0c', '#1e0c04', '#5a3018', '#0a0402'), 'rayo'));
  icono('cafe_quemado', 26, 26, p => taza(p, pal5('#1a1210', '#0a0806', '#3a2a20', '#040202'), 'humo'));
  icono('perg_despido', 26, 26, p => pergamino(p, P.rojo));
  icono('perg_reestructuracion', 26, 26, p => pergamino(p, P.azul));
  icono('perg_auditoria', 26, 26, p => pergamino(p, P.verde));
  icono('perg_ascenso', 26, 26, p => pergamino(p, P.oro));
  icono('parche', 26, 26, p => {   // una caja de tiritas con una tirita encima
    p.parte(F.rr(-9, -12, 18, 11, 2), P.plastico, { sombra: 2 });
    p.parte(F.un(F.re(-1.5, -10, 3, 7), F.re(-3.5, -8, 7, 3)), P.verde, { sombra: 0, luz: false });
    p.parte(F.rr(-9, -16, 10, 4, 1.5), pal5('#e8b89a', '#b8826a', '#ffd8c0', '#6a4030'), { sombra: 0 }); p.px(-6, -14, '#b8826a'); p.px(-3, -14, '#b8826a');
  });
  icono('llave', 26, 26, p => {
    p.parte(F.ov(-5, -11, 5, 5), P.oro, { sombra: 1 }); p.plano(F.ov(-5, -11, 2, 2), OL);
    p.parte(F.tr(0, -11, 10, -11, 1.6), P.oro, { sombra: 1 }); p.plano(F.re(6, -10, 1.5, 3), P.oro.b); p.plano(F.re(9, -10, 1.5, 3), P.oro.b);
  });
  icono('monedas', 26, 26, p => {
    for (const [x, y] of [[-5, -4], [4, -4], [-1, -8]]) { p.parte(F.ov(x, y, 5.5, 3), P.oro, { sombra: 1 }); p.plano(F.ov(x, y, 2.2, 1.2), P.oro.s2); p.px(x - 2, y - 1, '#ffffff'); }
  });
  // armas
  icono('zanahoria', 26, 28, p => {
    for (const [dx, a] of [[-3, -0.7], [0, -1.5], [3, -0.3]]) p.parte(F.ov(dx, -22, 3.2, 1.6, a), pal5('#62c93f', '#2f8a3a', '#b0ef6c', '#1a5222'), { sombra: 1 });
    p.parte(F.tr(0, -20, 0, -2, 3.8, 1.2), pal5('#ff8f2a', '#d4521c', '#ffc46a', '#7a2a0e'), { sombra: 1 });
    p.px(-1, -14, '#d4521c'); p.px(0, -9, '#d4521c'); p.px(-1, -5, '#d4521c');
  });
  icono('fusil', 28, 26, p => {
    p.parte(F.tr(-11, -6, 10, -14, 2.6), P.acero, { sombra: 1 }); p.parte(F.tr(10, -14, 13, -15, 1.5), P.acero, { sombra: 0 });
    p.plano(F.ov(13.5, -15.2, 1.8, 1.4), '#5ef2e0'); p.parte(F.rr(-4, -8, 4, 5, 1), pal5('#26406e', '#162544', '#42609c', '#0b1228'), { sombra: 0 });
  });
  icono('baculo', 26, 30, p => {
    p.parte(F.tr(0, -2, 0, -22, 1.5), pal5('#5a3a28', '#3a2214', '#8a5a3a', '#1e1008'), { sombra: 1 });
    p.parte(F.ov(0, -24, 4.5, 4.5), pal5('#5cff8a', '#1f9a4e', '#c8ffd8', '#0f4a22'), { sombra: 1, luz: 2 }); p.px(-1.5, -25.5, '#ffffff');
  });
  icono('grapadora', 26, 26, p => {
    p.parte(F.rr(-9, -8, 18, 6, 2), pal5('#4a5068', '#2e3346', '#6a7290', '#171a28'), { sombra: 1 });
    p.parte(F.pol(-9, -9, 9, -13, 9, -9), P.rojo, { sombra: 1 }); p.px(7, -12, '#ffffff');
  });
  icono('teclado', 26, 26, p => {
    p.parte(F.rr(-11, -9, 22, 8, 1.5), pal5('#4a5068', '#2e3346', '#6a7290', '#171a28'), { sombra: 1 });
    for (let x = -9; x < 9; x += 2.5) for (let y = -8; y < -3; y += 2.5) p.px(x + 0.5, y + 0.5, '#dde3f0');
  });
  icono('espada', 26, 30, p => {
    p.parte(F.tr(0, -8, 0, -26, 2.2, 1), P.acero, { sombra: 1 }); p.parte(F.re(-5, -9, 10, 2.5), P.oro, { sombra: 0 });
    p.parte(F.tr(0, -6, 0, -2, 1.5), P.cuero, { sombra: 0 }); p.px(-0.5, -18, '#ffffff');
  });
  // armaduras
  icono('chaleco', 26, 26, p => {
    p.parte(F.pol(-9, -14, -4, -14, 0, -11, 4, -14, 9, -14, 9, -2, -9, -2), P.tela, { sombra: 2 });
    p.plano(F.re(-6, -8, 4, 4), P.tela.s); p.plano(F.re(2, -8, 4, 4), P.tela.s); p.px(0, -6, P.oro.b); p.px(0, -3.5, P.oro.b);
  });
  icono('armadura', 26, 26, p => {
    p.parte(F.pol(-10, -14, -4, -14, 0, -11, 4, -14, 10, -14, 10, -2, -10, -2), P.acero, { sombra: 2 });
    p.plano(F.tr(0, -11, 0, -3, 0.7), P.acero.s); p.px(-5, -8, '#ffffff');
  });
  icono('bata', 26, 26, p => {
    p.parte(F.pol(-9, -14, -3, -14, 0, -10, 3, -14, 9, -14, 9, -2, -9, -2), P.plastico, { sombra: 2 });
    p.plano(F.re(-6, -8, 4, 3), P.plastico.s); p.plano(F.tr(0, -10, 0, -3, 0.6), P.plastico.s); p.px(-4, -7, P.rojo.b);
  });
  // accesorios
  icono('gafas', 26, 26, p => {
    for (const x of [-5, 5]) { p.parte(F.ov(x, -8, 4.5, 3.8), pal5('#1e2436', '#10131e', '#2e3652', '#080a12'), { sombra: 1 }); p.px(x - 2, -9.5, '#ffffff'); }
    p.plano(F.re(-1, -9, 2, 1), OL); p.plano(F.tr(-9, -9, -12, -11, 0.6), OL); p.plano(F.tr(9, -9, 12, -11, 0.6), OL);
  });
  icono('anillo', 26, 26, p => {
    p.parte(F.ov(0, -7, 6, 6), P.oro, { sombra: 1 }); p.plano(F.ov(0, -7, 3, 3), OL);
    p.parte(F.ov(0, -14, 3, 3), P.morado, { sombra: 1 }); p.px(-1, -15, '#ffffff');
  });
  icono('termo', 26, 28, p => {
    p.parte(F.rr(-5, -20, 10, 18, 2.5), P.acero, { sombra: 2 }); p.parte(F.rr(-5, -23, 10, 4, 1.5), pal5('#1e2436', '#10131e', '#2e3652', '#080a12'), { sombra: 0 });
    p.plano(F.re(-3, -14, 6, 5), P.rojo.b); p.px(-2, -13, '#ffffff');
  });
  // trampas y restos
  icono('trampa', 32, 32, p => {   // una placa con muelles, de las que te lanzan chispas
    p.parte(F.rr(-12, -8, 24, 7, 1.5), pal5('#4a5068', '#2e3346', '#6a7290', '#171a28'), { sombra: 1 });
    for (const x of [-8, -3, 2, 7]) p.plano(F.pol(x, -9, x + 2, -9, x + 1, -13), '#f7d34a');
  });
  icono('restos', 32, 32, p => {   // tornillos, un hueso y una taza rota
    p.parte(F.tr(-9, -4, -2, -7, 1.4), pal5('#f1ebe0', '#b8ac9c', '#ffffff', '#55483c'), { sombra: 0 });
    p.px(-10, -5, '#8c879a'); p.px(3, -3, '#8c879a'); p.px(6, -6, '#8c879a');
    p.parte(F.pol(3, -4, 9, -4, 8, -9, 5, -8), P.taza, { sombra: 0 });
  });
  // el puesto de café de Lola: mesa plegable, toldo a rayas, cafetera y el cartel CAFÉ
  icono('puesto', 54, 54, p => {
    const madera = P.madera;
    for (const x of [-18, 18]) p.plano(F.tr(x, -18, x, -40, 0.8), '#5a3a1c');
    p.parte(F.rr(-21, -20, 42, 16, 2), madera, { sombra: 2 });
    for (const y of [-15, -10]) p.plano(F.re(-20, y, 40, 1), '#8f5428');
    p.parte(F.re(-22, -22, 44, 3), pal5('#c89a62', '#8a5a2a', '#e8c090', '#3a200c'), { sombra: 0 });
    p.parte(F.rr(-15, -32, 10, 10, 1.5), P.acero, { sombra: 2 }); p.plano(F.re(-13, -29, 6, 3), '#1e2436'); p.px(-10, -27.5, '#ff4b5c');   // la cafetera
    for (const x of [2, 9]) { p.parte(F.rr(x, -28, 5, 5, 1), P.taza, { sombra: 0 }); p.plano(F.re(x + 1, -27, 3, 1), '#6a3a1c'); }
    p.parte(F.pol(-25, -41, 25, -41, 23, -34, -23, -34), pal5('#ff7a1a', '#d9431e', '#ffb347', '#8f2410'), { sombra: 1 });   // el toldo
    for (let x = -22; x < 23; x += 7) p.plano(F.y(F.pol(-25, -41, 25, -41, 23, -34, -23, -34), F.re(x, -42, 3.5, 9)), '#fff1dc');
    for (let x = -23; x < 24; x += 3.5) p.plano(F.ov(x + 1.5, -34, 1.6, 1.4), '#d9431e');
    const cartel = Math.max(20, anchoTexto(tr('CAFÉ')) + 6);
    p.parte(F.rr(-cartel / 2, -13, cartel, 11, 1), pal5('#d9b27a', '#a8824a', '#f0d2a0', '#5a4020'), { sombra: 1 });
    p.letrero(tr('CAFÉ'), -anchoTexto(tr('CAFÉ')) / 2, -11, '#5a2a10');
  });
  // la máquina expendedora de Phony (PayPlus): azul y blanca, cristal con latas, ranura y un cartel de PAY+
  icono('maquina', 40, 60, p => {
    const azul = pal5('#2456b8', '#142e6a', '#4a8ae8', '#0a1838', '#0e2050', '#8ab8ff');
    p.parte(F.rr(-14, -52, 28, 50, 3), azul, { sombra: 2 });
    p.parte(F.rr(-11, -46, 15, 26, 2), pal5('#9ad4ff', '#4a8ac0', '#dff4ff', '#1e3a60'), { sombra: 1, luz: false });   // el cristal
    for (let f = 0; f < 3; f++) for (let c = 0; c < 3; c++) { const lata = [P.rojo, P.verde, P.oro][(f + c) % 3]; p.parte(F.rr(-10 + c * 5, -44 + f * 8, 4, 6, 1), lata, { sombra: 0 }); }
    p.parte(F.rr(6, -46, 6, 26, 1), pal5('#eef0f8', '#b4b8cc', '#ffffff', '#5a5e78'), { sombra: 1 });   // el panel
    p.plano(F.re(7, -44, 4, 3), '#1e2436'); for (let y = -39; y < -24; y += 3) p.px(8.5, y, '#8c879a');
    p.plano(F.re(7, -22, 4, 1.5), OL);   // la ranura
    p.parte(F.rr(-11, -16, 22, 8, 1.5), pal5('#1e2436', '#10131e', '#2e3652', '#080a12'), { sombra: 1, luz: false });   // la boca de salida
    p.parte(F.rr(-12, -51, 24, 4, 1), pal5('#eef0f8', '#b4b8cc', '#ffffff', '#5a5e78'), { sombra: 0 });
    p.letrero('PAY+', -anchoTexto('PAY+') / 2 - 1, -50.5, '#2456b8');
  });
  // la cafetera de la sala de descanso: recupera una vez
  icono('cafetera', 32, 40, p => {
    p.parte(F.rr(-9, -30, 18, 28, 3), P.acero, { sombra: 2 });
    p.parte(F.rr(-7, -27, 14, 7, 1.5), pal5('#1e2436', '#10131e', '#2e3652', '#080a12'), { sombra: 0 }); p.px(-5, -25, P.verde.b); p.px(-2, -25, P.rojo.b);
    p.parte(F.rr(-6, -17, 12, 10, 1.5), pal5('#1e2436', '#10131e', '#2e3652', '#080a12'), { sombra: 1, luz: false });
    p.parte(F.rr(-3, -12, 6, 5, 1), P.taza, { sombra: 0 }); p.plano(F.re(-2, -11, 4, 1), '#6a3a1c');
    for (const [x, y] of [[-2, -15], [1, -16]]) p.px(x, y, '#ffffff');
  });
}
// pinta un objeto con los pies en (x, y)
function pintaIcono(ctx, nombre, x, y, blanco) { const s = ICO[nombre] || ICO.restos; if (s) pintaSpr(ctx, s, x, y, blanco); }
