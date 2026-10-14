// Fans of Dungeons · Los enemigos en pixel art nuevo, estilo arcade de 32 bits (de frente en tres cuartos, cinco tonos, tramado
// y luz de neón): la plantilla de Microblizz de las Oficinas (Becario, StarBot, CajaBotín), los No-Muertos del Cementerio de
// juegos (SkeletonCrew, CrunchZombie, GhostMage, StitchBrute) y los del Foro Infinito (SoporteBot, FallenHero, Abogado).
// Cada dibujo acepta la misma pose que los héroes: hy, paso (andar), golpe (atacar) y cara.
'use strict';

const PAL_ROBOT = {
  gris: pal5('#b4bcd4', '#6f7898', '#e4e8f8', '#343a52', '#20243a', '#ffffff', '#5ef2ff'),
  oscuro: pal5('#4a5070', '#2e3348', '#6e78a0', '#171a28', '#0c0e18', '#9aa4c8', '#3a8cff'),
  pantalla: pal5('#1e2436', '#10131e', '#2e3652', '#080a12'),
  corbata: pal5('#ff3f52', '#9b2233', '#ff8a9a', '#4a0c14', '#2a060c', '#ffd0d8', '#ff8ad0'),
  taza: pal5('#fff6ea', '#d6c8b4', '#ffffff', '#6a5a48', '#4a3e30', '#ffffff', '#ffb0e0'),
  amarillo: pal5('#ffd848', '#c0901c', '#fff4a8', '#6a4a08', '#4a3004', '#ffffff', '#ffffa0'),
  rojo: pal5('#ff4b5c', '#b01c30', '#ff9aa4', '#5a0a14', '#3a0408', '#ffd0d4', '#ff9ad0'),
  cian: pal5('#5ef2ff', '#1fa8c0', '#c8fdff', '#0f5a68', '#083a44', '#ffffff', '#ffffff'),
  blanco: pal5('#fafaff', '#c4c8dc', '#ffffff', '#5a5e78', '#3a3e50', '#ffffff', '#5ef2ff'),
  verde: pal5('#4ae070', '#1e8a46', '#b0ffc8', '#0f4a22', '#083018', '#ffffff', '#c0ffa0'),
};

/* ---------- Becario: robot pequeño y cuadrado, antena, pantalla con dos ojos, corbata y su taza (el Abogado es su variante) ---------- */
function becario(p, o) {
  const hy = o.hy || 0, P = PAL_ROBOT, g = o.golpe || 0, [pi, pd] = pies(o);
  const traje = o.abogado ? pal5('#5e6280', '#363a4c', '#9094b4', '#1c1e2a', '#0e1018', '#c0c4dc', '#ff5ad0') : P.gris;
  for (const [x, l] of [[-5, pi], [5, pd]]) { p.parte(F.rr(x - 3.5, -4 - l, 7, 4, 1.5), P.oscuro, { sombra: 1 }); p.parte(F.rr(x - 2.5, -11 - hy - l * 0.5, 5, 8, 1), P.oscuro, { sombra: 1 }); }
  p.parte(F.rr(-11, -30 - hy, 22, 20, 3), traje, { sombra: 2 });   // cuerpo
  if (o.abogado) { p.parte(F.pol(-4, -30 - hy, 4, -30 - hy, 0, -16 - hy), P.blanco, { sombra: 0 }); p.plano(F.tr(0, -28 - hy, 0, -20 - hy, 1), P.corbata.b); }
  else { p.plano(F.pol(-2, -29 - hy, 2, -29 - hy, 1.5, -15 - hy, -1.5, -15 - hy), P.corbata.b); p.plano(F.re(-1, -27 - hy, 2, 2), P.corbata.s); }
  p.px(-8, -26 - hy, P.oscuro.b); p.px(-8, -23 - hy, P.oscuro.b); p.px(8, -26 - hy, P.rojo.b);   // botones y una lucecita
  p.parte(F.tr(-11, -27 - hy, -15, -17 - hy, 2.6), traje, { sombra: 1 });   // brazos (el derecho se estira al atacar)
  p.parte(F.tr(11, -27 - hy, 15 + g * 8, -19 - hy - g * 6, 2.6), traje, { sombra: 1 });
  const mx = 13 + g * 8, my = -23 - hy - g * 6;
  if (o.abogado) { p.parte(F.rr(mx - 1, my + 3, 9, 8, 1), pal5('#5a3a1c', '#3a2210', '#8a5a3a', '#1a0c06'), { sombra: 1 }); p.px(mx + 3, my + 2, P.amarillo.b); }
  else { p.parte(F.rr(mx, my, 7, 7, 1.5), P.taza, { sombra: 1 }); p.plano(F.ov(mx + 7.5, my + 3.5, 2, 2), P.taza.o); p.plano(F.ov(mx + 7.5, my + 3.5, 0.9, 0.9), P.taza.b); p.plano(F.re(mx + 1, my + 1, 5, 1), '#6a3a1c'); for (const [x, y] of [[2, -3], [4, -5], [6, -3]]) p.px(mx + x, my + y - (o.vapor || 0), '#ffffff'); }
  p.parte(F.rr(-10, -46 - hy, 20, 16, 3), traje, { sombra: 2 });   // cabeza
  p.parte(F.rr(-7, -43 - hy, 14, 10, 2), P.pantalla, { sombra: 1, luz: false });   // pantalla
  const luz = o.abogado ? P.rojo.b : P.cian.b;
  if (o.cara === 'x') { p.plano(F.re(-5, -39 - hy, 3, 1), P.rojo.b); p.plano(F.re(2, -39 - hy, 3, 1), P.rojo.b); }
  else if (o.cara === 'grito' || o.cara === 'dolor' || g > 0.5) { p.plano(F.re(-5, -40 - hy, 3, 2), luz); p.plano(F.re(2, -40 - hy, 3, 2), luz); p.plano(F.re(-3, -36 - hy, 6, 2), luz); }
  else { p.plano(F.re(-5, -40 - hy, 3, 3), luz); p.plano(F.re(2, -40 - hy, 3, 3), luz); p.plano(F.re(-2, -36 - hy, 4, 1), luz); }
  if (o.abogado) { p.plano(F.re(-6, -41 - hy, 5, 1), P.blanco.b); p.plano(F.re(1, -41 - hy, 5, 1), P.blanco.b); p.plano(F.re(-1, -41 - hy, 2, 1), P.blanco.b); }   // gafas
  p.plano(F.tr(0, -46 - hy, 0, -52 - hy, 0.7), OL); p.plano(F.ov(0, -53 - hy, 1.6, 1.6), P.rojo.b); p.px(-0.5, -53.5 - hy, '#ffffff');   // antena
  for (const s of [-1, 1]) p.parte(F.rr(s * 11 - 1.5, -42 - hy, 3, 6, 1), P.oscuro, { sombra: 0 });   // orejas de robot
}
const fotoBecario = (t, c) => { const p = new Pincel(64, 64, 28, 60, t); becario(p, Object.assign({ hy: 0, cara: '', vapor: 0, abogado: false, paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- StarBot: dron amarillo con forma de estrella, un gran ojo rojo de cámara y chorros cian; flota ---------- */
const estrella = (cx, cy, R, r) => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r : R; pts.push(cx + Math.cos(a) * d, cy + Math.sin(a) * d); } return F.pol(...pts); };
function starbot(p, o) {
  const hy = (o.hy || 0) - 6, P = PAL_ROBOT, g = o.golpe || 0;
  for (const x of [-7, 7]) { p.plano(F.tr(x, -8 - hy, x, -2 - hy + (o.chorro || 0), 1.6), P.cian.b); p.px(x, -3 - hy, '#ffffff'); }   // chorros
  p.parte(estrella(0, -24 - hy, 20, 9.5), P.amarillo, { sombra: 2 });
  p.parte(F.ov(0, -24 - hy, 8, 8), P.oscuro, { sombra: 1 });   // la cámara
  p.parte(F.ov(0, -24 - hy, 5.5 + g, 5.5 + g), P.rojo, { sombra: 1, luz: false });
  p.plano(F.ov(0.5, -23.5 - hy, 2.6, 2.6), '#5a0a14'); p.px(-1.5, -26 - hy, '#ffffff'); p.px(-0.5, -26 - hy, '#ffffff');
  if (o.cara === 'x') { p.plano(F.tr(-3, -27 - hy, 3, -21 - hy, 0.7), OL); p.plano(F.tr(-3, -21 - hy, 3, -27 - hy, 0.7), OL); }
  p.plano(F.re(-2, -39 - hy, 4, 2), P.rojo.b); p.px(0, -40 - hy, '#ffffff');   // la luz de grabar
  if (o.fogonazo || g > 0.4) { p.plano(F.ov(0, -24 - hy, 5 + g * 3, 5 + g * 3), '#ffffff'); for (let a = 0; a < TAU; a += TAU / 8) p.px(Math.cos(a) * (12 + g * 4), -24 - hy + Math.sin(a) * (12 + g * 4), '#ff9ad0'); }
}
const fotoStar = (t, c) => { const p = new Pincel(56, 60, 28, 56, t); starbot(p, Object.assign({ hy: 0, cara: '', chorro: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- CajaBotín: cofre dorado con gemas moradas; abierto enseña los dientes, la lengua y los ojos (tapa: 0 cerrado, 1 abierto) ---------- */
const PAL_COFRE = {
  oro: pal5('#ffd040', '#b8841a', '#fff0a0', '#6a4408', '#4a2e04', '#ffffff', '#fffa80'),
  madera: pal5('#b07040', '#6e4220', '#dca068', '#3a200c', '#241204', '#f0c890', '#ff8ad0'),
  gema: pal5('#b870ff', '#6a30c0', '#e4c8ff', '#3a1070', '#240848', '#ffffff', '#ff5ae0'),
  boca: pal5('#8a1038', '#4a0818', '#b0304a', '#2a040c'),
};
function cajabotin(p, o) {
  const P = PAL_COFRE, ab = o.tapa ? 1 : 0, g = o.golpe || 0, hy = o.hy || 0;
  p.parte(F.rr(-15, -16 - hy, 30, 16, 3), P.madera, { sombra: 2 });   // el cuerpo del cofre
  for (const x of [-11, 0, 11]) p.parte(F.re(x - 1.5, -16 - hy, 3, 16), P.oro, { sombra: 1 });   // los refuerzos
  p.parte(F.rr(-3.5, -12 - hy, 7, 6, 1.5), P.oro, { sombra: 1 }); p.plano(F.re(-1, -10 - hy, 2, 3), P.oro.s2);   // la cerradura
  if (ab) {
    const alt = 16 - g * 10;   // al morder, la tapa baja
    p.parte(F.ov(0, -16 - hy, 14, 4), P.boca, { sombra: 1, luz: false });   // la boca abierta
    p.plano(F.ov(2, -14 - hy, 5, 2.5), '#ff7aa8');
    for (let x = -11; x <= 11; x += 4) p.plano(F.pol(x - 1.5, -19 - hy, x + 1.5, -19 - hy, x, -15 - hy), '#ffffff');   // dientes
    p.parte(F.rr(-15, -18 - alt - hy, 30, alt, 5), P.madera, { sombra: 2 });   // la tapa, abierta hacia arriba
    for (const x of [-11, 0, 11]) p.parte(F.re(x - 1.5, -18 - alt - hy, 3, alt), P.oro, { sombra: 1 });
    for (let x = -11; x <= 11; x += 4) p.plano(F.pol(x - 1.5, -21 - hy, x + 1.5, -21 - hy, x, -17 - hy), '#ffffff');
    ojo(p, -6, -28 - hy + g * 6, 2.8, o.cara === 'x' ? 'x' : 'furia', 0.4); ojo(p, 6, -28 - hy + g * 6, 2.8, o.cara === 'x' ? 'x' : 'furia', -0.4);
  } else {
    p.parte(F.rr(-15, -26 - hy, 30, 11, 5), P.madera, { sombra: 2 });   // la tapa cerrada
    for (const x of [-11, 0, 11]) p.parte(F.re(x - 1.5, -26 - hy, 3, 11), P.oro, { sombra: 1 });
    for (const x of [-6, 6]) { p.parte(F.ov(x, -21 - hy, 2.5, 2.5), P.gema, { sombra: 1 }); p.px(x - 1, -22 - hy, '#ffffff'); }
  }
  if (o.brillo) { p.px(-12, -30 - hy, '#ffffff'); p.px(13, -8, '#ffffff'); p.px(14, -28 - hy, '#fffa80'); }
}
const fotoCaja = (t, c) => { const p = new Pincel(44, 48, 22, 44, t); cajabotin(p, Object.assign({ tapa: 0, cara: '', brillo: false, golpe: 0, hy: 0 }, c)); return p.lienzo(); };

/* ---------- SkeletonCrew: esqueleto con auriculares y corbata, haciendo horas extra desde la cripta; pega con el teclado ---------- */
const PAL_HUESO = pal5('#f4eee4', '#b8ac9c', '#ffffff', '#55483c', '#36302a', '#ffffff', '#5ef2d0');
function esqueleto(p, o) {
  const hy = o.hy || 0, P = PAL_ROBOT, g = o.golpe || 0, [pi, pd] = pies(o);
  for (const [x, l] of [[-5, pi], [5, pd]]) { p.parte(F.tr(x, -4 - l, x, -16 - hy, 2.2), PAL_HUESO, { sombra: 1 }); p.parte(F.ov(x, -2.5 - l, 4, 2.5), PAL_HUESO, { sombra: 1 }); }
  p.parte(F.tr(0, -18 - hy, 0, -36 - hy, 2.4), PAL_HUESO, { sombra: 1 });   // la columna
  for (let y = -22; y >= -34; y -= 4) p.parte(F.ov(0, y - hy, 10 - (y + 34) * 0.15, 1.8), PAL_HUESO, { sombra: 1 });   // costillas
  p.parte(F.ov(0, -37 - hy, 9, 3), PAL_HUESO, { sombra: 1 });   // clavículas
  p.plano(F.pol(-2, -36 - hy, 2, -36 - hy, 1.5, -24 - hy, -1.5, -24 - hy), P.corbata.b);   // la corbata
  p.parte(F.tr(-9, -35 - hy, -14, -22 - hy, 2.2), PAL_HUESO, { sombra: 1 });   // brazos
  p.parte(F.tr(9, -35 - hy, 15 + g * 6, -24 - hy - g * 10, 2.2), PAL_HUESO, { sombra: 1 });
  p.parte(F.ov(-14.5, -21 - hy, 3, 2.6), PAL_HUESO, { sombra: 1 }); p.parte(F.ov(15.5 + g * 6, -23 - hy - g * 10, 3, 2.6), PAL_HUESO, { sombra: 1 });
  const kx = 10 + g * 8, ky = -30 - hy - g * 10;
  p.parte(F.rr(kx, ky, 12, 7, 1.5), P.oscuro, { sombra: 1 });   // el teclado, que vuela al golpear
  for (let x = 1; x < 11; x += 2) for (let y = 1; y < 6; y += 2) p.px(kx + x, ky + y, P.gris.l);
  p.parte(F.ov(0, -49 - hy, 10.5, 10), PAL_HUESO, { sombra: 2 });   // la calavera
  p.parte(F.rr(-6, -43 - hy, 12, 5, 2), PAL_HUESO, { sombra: 1 });   // la mandíbula
  for (let x = -4; x <= 4; x += 2) p.px(x, -41 - hy, '#3a2a20');
  p.plano(F.ov(0, -46 - hy, 1.2, 1.5), '#2a1a10');
  for (const x of [-3.8, 3.8]) { p.plano(F.ov(x, -50 - hy, 2.8, 3), '#1a1020'); if (o.cara !== 'x') p.plano(F.ov(x, -50 - hy, 1.2 + g * 0.5, 1.2 + g * 0.5), '#5ef2d0'); }
  if (o.cara === 'x') for (const x of [-3.8, 3.8]) { p.px(x - 1, -51 - hy, '#5ef2d0'); p.px(x + 1, -49 - hy, '#5ef2d0'); p.px(x + 1, -51 - hy, '#5ef2d0'); p.px(x - 1, -49 - hy, '#5ef2d0'); }
  for (const x of [-10.5, 10.5]) p.parte(F.ov(x, -50 - hy, 2.5, 3), P.oscuro, { sombra: 1 });   // auriculares
  p.plano(F.tr(-9, -56 - hy, 9, -56 - hy, 0.7), P.oscuro.b); p.plano(F.tr(-10, -48 - hy, -5, -43 - hy, 0.6), P.oscuro.b); p.px(-4.5, -42.5 - hy, P.rojo.b);
}
const fotoEsq = (t, c) => { const p = new Pincel(64, 64, 28, 60, t); esqueleto(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- CrunchZombie: programador zombi verde, sudadera, ojeras, un brazo colgando y la taza de siempre ---------- */
const PAL_ZOMBI = {
  piel: pal5('#96dc8c', '#4f8a50', '#d0f8c0', '#244a28', '#163018', '#f0ffe0', '#8affb0'),
  sudadera: pal5('#5e6498', '#363a5c', '#9098d0', '#1a1c30', '#0e1020', '#c0c8f0', '#ff5ad0'),
  vaquero: pal5('#3e5078', '#222c44', '#607aa8', '#101624', '#080c16', '#90a8d0', '#5ef2ff'),
  pelo: pal5('#2c2c40', '#161620', '#505068', '#08080e', '#040408', '#808098', '#5ef2ff'),
};
function zombi(p, o) {
  const hy = o.hy || 0, P = PAL_ZOMBI, g = o.golpe || 0, [pi, pd] = pies(o);
  for (const [x, l] of [[-6, pi], [5, pd]]) { p.parte(F.rr(x - 4, -4 - l, 8, 4, 1.5), PAL_ROBOT.oscuro, { sombra: 1 }); p.parte(F.rr(x - 3.5, -18 - hy - l * 0.5, 7, 15, 2), P.vaquero, { sombra: 1 }); }
  p.parte(F.rr(-12, -38 - hy, 24, 21, 4), P.sudadera, { sombra: 2 });   // sudadera
  p.parte(F.ov(0, -40 - hy, 9, 4), P.sudadera, { sombra: 1 });   // la capucha caída
  p.plano(F.re(-5, -28 - hy, 10, 4), P.sudadera.s); for (let x = -4; x < 5; x += 2) p.px(x, -26 - hy, P.sudadera.l);   // bolsillo
  p.parte(F.tr(-12, -34 - hy, -15, -14 - hy, 3), P.sudadera, { sombra: 1 });   // el brazo que cuelga
  p.parte(F.ov(-15.5, -12 - hy, 3, 3), P.piel, { sombra: 1 });
  p.parte(F.tr(12, -34 - hy, 16 + g * 9, -26 - hy - g * 4, 3), P.sudadera, { sombra: 1 });   // el otro, con la taza (se lanza hacia delante)
  const mx = 13 + g * 9, my = -30 - hy - g * 4;
  p.parte(F.rr(mx, my, 7, 7, 1.5), PAL_ROBOT.taza, { sombra: 1 }); p.plano(F.ov(mx + 7.5, my + 3.5, 2, 2), PAL_ROBOT.taza.o); p.plano(F.ov(mx + 7.5, my + 3.5, 0.9, 0.9), PAL_ROBOT.taza.b);
  p.parte(F.ov(0, -50 - hy, 11, 10.5), P.piel, { sombra: 2 });   // cabeza
  p.parte(F.y(F.ov(0, -52 - hy, 11.5, 10), F.rr(-12, -64 - hy, 24, 11, 3)), P.pelo, { sombra: 1 });   // pelo despeinado
  for (const x of [-9, -4, 2, 7]) p.plano(F.tr(x, -60 - hy, x + 2, -64 - hy, 0.7), P.pelo.b);
  for (const x of [-4, 4]) p.plano(F.ov(x, -49 - hy, 3.2, 2.2), '#3a5a40');   // ojeras
  if (o.cara === 'x') { ojo(p, -4, -51 - hy, 2.2, 'x'); ojo(p, 4, -51 - hy, 2.2, 'x'); }
  else { ojo(p, -4, -51 - hy, 2.4, g > 0.5 ? 'furia' : '', 0.4); ojo(p, 4.5, -50 - hy, 1.9, '', 0.4); }
  if (g > 0.5 || o.cara === 'dolor') boca(p, 0, -44 - hy, 'grito', 2.5); else { p.plano(F.tr(-4, -44 - hy, 4, -44.5 - hy, 0.6), '#2a3a2a'); p.px(2, -43 - hy, '#ffffff'); }   // la boca torcida y un diente
  p.px(-9, -55 - hy, P.piel.s2); p.px(8, -46 - hy, P.piel.s2);   // remiendos de la piel
}
const fotoZombi = (t, c) => { const p = new Pincel(64, 68, 28, 64, t); zombi(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- GhostMage: fantasma azul pálido con sombrero de mago, flota y lanza rayos ---------- */
const PAL_FANT = {
  cuerpo: pal5('#e0f0ff', '#9bb8e8', '#ffffff', '#4a6a9a', '#2e4870', '#ffffff', '#5ef2ff'),
  sombrero: pal5('#3e4498', '#232660', '#6068c8', '#121438', '#0a0c24', '#9098e0', '#ff5ae0'),
};
function fantasma(p, o) {
  const hy = (o.hy || 0) - 8, P = PAL_FANT, g = o.golpe || 0;
  p.parte(F.un(F.ov(0, -30 - hy, 12, 16), F.pol(-12, -28 - hy, 12, -28 - hy, 11, -10 - hy, 7, -4 - hy, 3, -9 - hy, 0, -3 - hy, -3, -9 - hy, -7, -4 - hy, -11, -10 - hy)), P.cuerpo, { sombra: 2 });
  for (const s of [-1, 1]) p.parte(F.tr(s * 11, -30 - hy, s * (16 + g * 4), -22 - hy - g * 6, 3), P.cuerpo, { sombra: 1 });   // bracitos
  const ry = -23 - hy - g * 6, rw = 8 + g * 6;
  p.plano(F.tr(-rw, ry + 1, rw, ry - 1, 1.3 + g), '#ffe066'); p.plano(F.tr(-3, ry - 3, 3, ry + 3, 1.1), '#ffe066'); p.px(0, ry, '#ffffff');   // el rayo
  if (g > 0.4) for (let a = 0; a < TAU; a += TAU / 6) p.px(Math.cos(a) * (rw + 3), ry + Math.sin(a) * 5, '#ffffff');
  p.parte(F.pol(-13, -43 - hy, 13, -43 - hy, 9, -46 - hy, 4, -66 - hy, -5, -46 - hy, -9, -46 - hy), P.sombrero, { sombra: 2 });   // sombrero
  p.plano(F.re(-8, -46 - hy, 16, 2), '#f0c040'); p.plano(F.ov(2, -56 - hy, 1.5, 1.5), '#f0c040'); p.plano(F.ov(-2, -52 - hy, 1, 1), '#ffffff');
  if (o.cara === 'x') { ojo(p, -4, -36 - hy, 2.2, 'x'); ojo(p, 4, -36 - hy, 2.2, 'x'); }
  else for (const x of [-4, 4]) { p.plano(F.ov(x, -36 - hy, 2.6, 3), '#1a2a5a'); p.px(x - 0.5, -37 - hy, '#8ac0ff'); }
  p.plano(F.ov(0, -29 - hy, 2.2 + g, 2.8 + g), '#1a2a5a');   // la boca de «uuuh»
}
const fotoFant = (t, c) => { const p = new Pincel(64, 76, 30, 72, t); fantasma(p, Object.assign({ hy: 0, cara: '', golpe: 0 }, c)); return p.lienzo(); };

/* ---------- StitchBrute (el cosido): bruto enorme hecho de trozos cosidos, con parches y remaches (elite del Cementerio) ---------- */
function cosido(p, o) {
  const hy = o.hy || 0, g = o.golpe || 0, [pi, pd] = pies(o);
  const A = pal5('#96dc8c', '#4f8a50', '#d0f8c0', '#244a28', '#163018', '#f0ffe0', '#8affb0'), B = pal5('#d0a874', '#8a6238', '#f4d8a8', '#4a2e14', '#2e1c0a', '#fff0d8', '#ff8ad0'), G = PAL_ROBOT.oscuro;
  for (const [x, l] of [[-9, pi], [9, pd]]) { p.parte(F.rr(x - 6, -6 - l, 12, 6, 2), G, { sombra: 1 }); p.parte(F.rr(x - 5, -22 - hy - l * 0.5, 10, 18, 2), B, { sombra: 1 }); }
  p.parte(F.rr(-18, -48 - hy, 36, 30, 6), A, { sombra: 2 });   // el torso
  p.parte(F.pol(-18, -40 - hy, 0, -48 - hy, 6, -30 - hy, -18, -24 - hy), B, { sombra: 1 });   // un trozo de otra piel
  for (const [x, y] of [[-6, -44], [-2, -42], [2, -40], [6, -38]]) { p.px(x, y - hy, '#2a1a10'); p.px(x + 1, y - 1 - hy, '#2a1a10'); }   // la costura
  for (const [x, y] of [[-14, -30], [12, -44], [10, -26]]) p.px(x, y - hy, PAL_ROBOT.gris.l);   // remaches
  p.parte(F.tr(-19, -42 - hy, -26, -18 - hy, 5), A, { sombra: 1 }); p.parte(F.ov(-27, -15 - hy, 5, 4.5), B, { sombra: 1 });   // brazos enormes
  p.parte(F.tr(19, -42 - hy, 26 + g * 10, -20 - hy - g * 14, 5), B, { sombra: 1 }); p.parte(F.ov(27 + g * 10, -17 - hy - g * 14, 5 + g, 4.5 + g), A, { sombra: 1 });
  p.parte(F.ov(0, -56 - hy, 11, 9), A, { sombra: 2 });   // la cabeza, hundida entre los hombros
  p.plano(F.tr(-6, -60 - hy, 6, -60 - hy, 0.7), '#2a1a10'); for (let x = -5; x <= 5; x += 2.5) p.px(x, -61.5 - hy, '#2a1a10');
  ojo(p, -4, -56 - hy, 2.2, o.cara === 'x' ? 'x' : 'furia', 0.4); p.plano(F.ov(4.5, -56 - hy, 3, 2.2), '#1a1a10'); p.px(4, -56.5 - hy, '#ff4b5c');
  if (g > 0.5) boca(p, 0, -50 - hy, 'grito', 3); else { p.plano(F.tr(-4, -50 - hy, 4, -50 - hy, 0.6), '#2a1a10'); p.px(-2, -49 - hy, '#ffffff'); p.px(3, -49 - hy, '#ffffff'); }
  for (const s of [-1, 1]) { p.plano(F.tr(s * 11, -58 - hy, s * 14, -58 - hy, 1.2), PAL_ROBOT.gris.b); p.px(s * 15, -58 - hy, PAL_ROBOT.gris.l); }   // tornillos
}
const fotoCosido = (t, c) => { const p = new Pincel(84, 76, 40, 72, t); cosido(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- SoporteBot: robot blanco y redondo, cruz verde en el pecho, auriculares y una luz de aviso; va sobre una rueda ---------- */
function soporte(p, o) {
  const hy = o.hy || 0, P = PAL_ROBOT, g = o.golpe || 0, r = (o.paso || 0) * TAU;
  p.parte(F.ov(0, -5, 7, 5), P.oscuro, { sombra: 1 }); p.plano(F.ov(Math.cos(r) * 2, -5 + Math.sin(r), 2.5, 1.8), P.gris.b);   // la rueda (gira al andar)
  p.parte(F.ov(0, -24 - hy, 13, 13), P.blanco, { sombra: 2 });   // el cuerpo
  p.parte(F.un(F.re(-2, -31 - hy, 4, 12), F.re(-6, -27 - hy, 12, 4)), P.verde, { sombra: 0, luz: false });   // la cruz
  for (const s of [-1, 1]) { p.parte(F.tr(s * 12, -28 - hy, s * (18 + (s > 0 ? g * 6 : 0)), -20 - hy - (s > 0 ? g * 8 : 0), 2.8), P.blanco, { sombra: 1 }); p.parte(F.ov(s * (18.5 + (s > 0 ? g * 6 : 0)), -18 - hy - (s > 0 ? g * 8 : 0), 3, 2.8), P.gris, { sombra: 1 }); }
  if (o.chispa || g > 0.3) { const cx = 19 + g * 6, cy = -22 - hy - g * 8; p.plano(F.ov(cx, cy, 3 + g * 2, 3 + g * 2), '#a0f0b8'); p.px(cx, cy, '#ffffff'); for (let a = 0; a < TAU; a += TAU / 5) p.px(cx + Math.cos(a) * (5 + g * 3), cy + Math.sin(a) * (5 + g * 3), '#c0ffa0'); }
  p.parte(F.ov(0, -44 - hy, 10, 9), P.blanco, { sombra: 2 });   // la cabeza
  p.parte(F.rr(-7, -47 - hy, 14, 7, 2.5), P.pantalla, { sombra: 1, luz: false });
  if (o.cara === 'x') { p.plano(F.re(-5, -44 - hy, 3, 1), P.rojo.b); p.plano(F.re(2, -44 - hy, 3, 1), P.rojo.b); }
  else for (const x of [-4, 3]) { p.plano(F.re(x, -45 - hy, 2, 2), P.verde.b); p.px(x, -45 - hy, '#ffffff'); }
  for (const s of [-1, 1]) p.parte(F.ov(s * 10, -44 - hy, 2.4, 3), P.oscuro, { sombra: 1 });   // auriculares
  p.plano(F.tr(-9, -50 - hy, 9, -50 - hy, 0.7), P.oscuro.b); p.plano(F.tr(-10, -42 - hy, -6, -38 - hy, 0.6), P.oscuro.b); p.px(-5.5, -37.5 - hy, P.rojo.b);
  p.plano(F.tr(0, -53 - hy, 0, -57 - hy, 0.7), OL); p.plano(F.ov(0, -58.5 - hy, 2, 2), o.cara === 'x' ? P.oscuro.b : P.verde.b);
}
const fotoSoporte = (t, c) => { const p = new Pincel(60, 66, 28, 62, t); soporte(p, Object.assign({ hy: 0, cara: '', chispa: false, paso: 0, golpe: 0 }, c)); return p.lienzo(); };

/* ---------- FallenHero: el héroe comprado, armadura oscura con grietas de oro, capa morada, corona y espada ---------- */
const PAL_FALLEN = {
  armadura: pal5('#4e4a68', '#2c2a3c', '#746e94', '#15131e', '#0c0a14', '#a09cc0', '#ff5ae0'),
  capa: pal5('#7a2ab0', '#3e1460', '#aa58e8', '#1e0830', '#120420', '#d8a0ff', '#ff5ae0'),
  oro: PAL_COFRE.oro,
  piel: pal5('#a090b0', '#6a5a7a', '#d0c0e0', '#3a2a48', '#241a30', '#f0e8ff', '#5ef2ff'),
};
function fallen(p, o) {
  const hy = o.hy || 0, P = PAL_FALLEN, g = o.golpe || 0, [pi, pd] = pies(o), s = Math.sin((o.paso || 0) * TAU) * 2;
  p.parte(F.pol(-13, -42 - hy, 13, -42 - hy, 16 + s, -4 - hy, 8, -8 - hy, 0, -3 - hy, -8, -8 - hy, -16 - s, -4 - hy), P.capa, { sombra: 2 });   // la capa
  for (const [x, l] of [[-6, pi], [6, pd]]) { p.parte(F.rr(x - 4, -5 - l, 8, 5, 2), P.armadura, { sombra: 1 }); p.parte(F.rr(x - 3.5, -20 - hy - l * 0.5, 7, 15, 2), P.armadura, { sombra: 1 }); }
  p.parte(F.rr(-12, -42 - hy, 24, 23, 5), P.armadura, { sombra: 2 });   // el peto
  p.plano(F.tr(-4, -38 - hy, 2, -26 - hy, 0.7), P.oro.b); p.plano(F.tr(2, -26 - hy, -2, -20 - hy, 0.6), P.oro.b);   // grieta de oro
  p.parte(F.re(-12, -22 - hy, 24, 3), P.oro, { sombra: 0 });   // el cinturón
  for (const sg of [-1, 1]) p.parte(F.pol(sg * 9, -44 - hy, sg * 18, -40 - hy, sg * 16, -34 - hy, sg * 10, -36 - hy), P.armadura, { sombra: 2 });   // hombreras en punta
  p.parte(F.tr(-14, -36 - hy, -17, -22 - hy, 3.2), P.armadura, { sombra: 1 }); p.parte(F.ov(-17.5, -20 - hy, 3, 2.6), P.piel, { sombra: 1 });
  // el brazo de la espada: la espada gira de vertical a horizontal al golpear
  const a = -Math.PI / 2 + g * 1.3, bx = 17 + g * 3, by = -24 - hy - g * 4;
  p.parte(F.tr(14, -36 - hy, bx, by, 3.2), P.armadura, { sombra: 1 }); p.parte(F.ov(bx + 0.5, by + 1, 3, 2.6), P.piel, { sombra: 1 });
  const ex = bx + Math.cos(a) * 34, ey = by + Math.sin(a) * 34;
  p.parte(F.tr(bx + Math.cos(a) * 4, by + Math.sin(a) * 4, ex, ey, 2.2, 1), neon(PAL_ROBOT.gris, g > 0.4 ? '#ffffff' : '#5ef2ff'), { sombra: 1 });   // la espada
  p.parte(F.ov(bx + Math.cos(a) * 3, by + Math.sin(a) * 3, 4.5, 1.8, a + Math.PI / 2), P.oro, { sombra: 0 }); p.px(bx + Math.cos(a) * 10, by + Math.sin(a) * 10 - 1, '#ffffff');
  p.parte(F.ov(0, -53 - hy, 10.5, 10), P.armadura, { sombra: 2 });   // el yelmo
  p.parte(F.rr(-7, -55 - hy, 14, 5, 2), pal5('#1a1020', '#0d0814', '#2a1a30', '#060308'), { sombra: 0 });   // la ranura
  if (o.cara === 'x') { p.plano(F.re(-5, -53 - hy, 3, 1), '#ff4b5c'); p.plano(F.re(2, -53 - hy, 3, 1), '#ff4b5c'); }
  else { p.plano(F.re(-5, -54 - hy, 3, 2), '#ff4b5c'); p.plano(F.re(2, -54 - hy, 3, 2), '#ff4b5c'); p.px(-5, -54 - hy, '#ffd0d0'); }
  p.plano(F.tr(0, -46 - hy, 0, -43 - hy, 0.6), P.armadura.l);
  p.parte(F.pol(-8, -61 - hy, 8, -61 - hy, 8, -66 - hy, 5, -63 - hy, 2, -68 - hy, 0, -64 - hy, -2, -68 - hy, -5, -63 - hy, -8, -66 - hy), P.oro, { sombra: 1 });   // la corona
  p.px(0, -62 - hy, '#ff4b5c'); p.px(-5, -62 - hy, '#5ef2e0'); p.px(5, -62 - hy, '#5ef2e0');
}
const fotoFallen = (t, c) => { const p = new Pincel(76, 76, 32, 72, t); fallen(p, Object.assign({ hy: 0, cara: '', paso: 0, golpe: 0 }, c)); return p.lienzo(); };

function creaFigurasEnemigos() {
  figura('becario', fotoBecario, { c: { vapor: 1 } });
  figura('abogado', fotoBecario, { c: { abogado: true } });
  figura('starbot', fotoStar, { flota: true, c: { chorro: 1 } });
  figura('cajabotin', fotoCaja, { c: { tapa: 1 }, flota: true });
  figura('cofre', fotoCaja, { c: { tapa: 0 }, flota: true });
  figura('esqueleto', fotoEsq, {});
  figura('zombi', fotoZombi, {});
  figura('fantasma', fotoFant, { flota: true });
  figura('cosido', fotoCosido, { esc: 1.05 });
  figura('soporte', fotoSoporte, { c: { chispa: false } });
  figura('fallen', fotoFallen, {});
}
