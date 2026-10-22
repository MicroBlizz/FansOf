// Fans of Auto · EL ARTE (2): el suelo y los tejados. El suelo del barrio se pinta una vez en trozos de 8 × 8 casillas
// (asfalto con la raya de los carriles, aceras con su bordillo, hierba, explanadas) y luego solo se pegan los trozos que
// se ven. Cada tejado se pinta una vez también: color, aparatos de aire, y el rótulo de los sitios con nombre y de las bromas.
// Los iconos del marcador (martillo de baneo, emblemas de las bandas, pistola) están aquí también.
'use strict';

const TROZO = 8;   // casillas por trozo de suelo
const SUELO = { trozos: [], tejados: new Map(), iconos: {} };

// pinta una casilla de suelo en (px, py) del lienzo g según su tipo y sus vecinos
function pintaCasilla(g, tx, ty, px, py, az) {
  const t = tipoEn(tx, ty);
  if (t === TIPO.CALLE || t === TIPO.SOLAR) {
    rect(g, px, py, T, T, t === TIPO.CALLE ? '#4f5258' : '#5c5e64');
    motas(g, px, py, T, T, '#56595f', 10, az); motas(g, px, py, T, T, '#45484e', 6, az);
    if (t === TIPO.CALLE) {
      const i = (ty * MAPA.W + tx) * 2, dx = MAPA.carril[i], dy = MAPA.carril[i + 1];
      // la raya discontinua entre los dos sentidos: en el borde este del carril que baja, en el borde sur del que va al oeste
      if (dy === 1 && tipoEn(tx + 1, ty) === TIPO.CALLE) { rect(g, px + 15, py + 2, 1, 5, '#d9c46a'); rect(g, px + 15, py + 10, 1, 5, '#d9c46a'); }
      if (dx === -1 && tipoEn(tx, ty + 1) === TIPO.CALLE) { rect(g, px + 2, py + 15, 5, 1, '#d9c46a'); rect(g, px + 10, py + 15, 5, 1, '#d9c46a'); }
      // paso de cebra al llegar a un cruce
      const cruce = (dx || dy) && MAPA.carril[((ty + dy) * MAPA.W + tx + dx) * 2] === 0 && MAPA.carril[((ty + dy) * MAPA.W + tx + dx) * 2 + 1] === 0 && tipoEn(tx + dx, ty + dy) === TIPO.CALLE;
      if (cruce) { for (let k = 1; k < T; k += 4) { if (dy) rect(g, px + k, py + (dy > 0 ? 11 : 2), 2, 3, '#c9c7c0'); else rect(g, px + (dx > 0 ? 11 : 2), py + k, 3, 2, '#c9c7c0'); } }
    } else {
      // explanada: plazas de aparcamiento pintadas
      if (tx % 2 === 0 && ty % 3 !== 0) rect(g, px, py + 2, 1, 12, '#8a8c92');
    }
  } else if (t === TIPO.ACERA) {
    rect(g, px, py, T, T, '#8e8a82');
    rect(g, px, py, T, 1, '#827e76'); rect(g, px, py, 1, T, '#827e76'); rect(g, px + 8, py, 1, T, '#878379'); rect(g, px, py + 8, T, 1, '#878379');
    motas(g, px, py, T, T, '#97938b', 5, az);
    // bordillo hacia la calle
    if (calleEn(tx, ty - 1)) rect(g, px, py, T, 1, '#aaa69e');
    if (calleEn(tx, ty + 1)) rect(g, px, py + 15, T, 1, '#6f6b64');
    if (calleEn(tx - 1, ty)) rect(g, px, py, 1, T, '#aaa69e');
    if (calleEn(tx + 1, ty)) rect(g, px + 15, py, 1, T, '#6f6b64');
  } else if (t === TIPO.HIERBA || t === TIPO.ARBOL) {
    rect(g, px, py, T, T, '#5f8f3f'); motas(g, px, py, T, T, '#6fa34a', 12, az); motas(g, px, py, T, T, '#4f7a33', 8, az);
    if (az() < 0.08) rect(g, px + az.entero(2, 12), py + az.entero(2, 12), 1, 1, '#f0c060');
    if (t === TIPO.ARBOL) { rect(g, px + 6, py + 6, 4, 4, '#4a3520'); }
  } else {
    // debajo de un edificio nadie mira, pero por si asoma: una base oscura
    const e = MAPA.edificios[MAPA.edif[ty * MAPA.W + tx]];
    rect(g, px, py, T, T, e ? oscuro(ESTILOS[e.estilo].pared, 0.5) : '#333');
  }
}

function creaSuelo() {
  const az = Azar(99), nx = Math.ceil(MAPA.W / TROZO), ny = Math.ceil(MAPA.H / TROZO);
  SUELO.nx = nx; SUELO.ny = ny;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const [c, g] = lienzoNuevo(TROZO * T, TROZO * T);
    for (let y = 0; y < TROZO; y++) for (let x = 0; x < TROZO; x++) { const tx = i * TROZO + x, ty = j * TROZO + y; if (enMapa(tx, ty)) pintaCasilla(g, tx, ty, x * T, y * T, az); }
    SUELO.trozos.push(c);
  }
}

// el dibujo de un tejado: borde, aparatos y rótulo
function fotoTejado(e) {
  if (SUELO.tejados.has(e.id)) return SUELO.tejados.get(e.id);
  const W = e.w * T, H = e.h * T, [c, g] = lienzoNuevo(W, H), az = Azar(100 + e.id), E = ESTILOS[e.estilo];
  let base = E.tejado;
  if (e.tejado === 'comisaria') base = '#c9c7c0'; else if (e.tejado === 'helados') base = '#e8a0b8'; else if (e.tejado === 'templo') base = '#b89a6a';
  rect(g, 0, 0, W, H, base);
  motas(g, 0, 0, W, H, claro(base, 0.08), W * H / 24, az); motas(g, 0, 0, W, H, oscuro(base, 0.12), W * H / 32, az);
  rect(g, 0, 0, W, 1, claro(base, 0.35)); rect(g, 0, 0, 1, H, claro(base, 0.35)); rect(g, 0, H - 1, W, 1, oscuro(base, 0.4)); rect(g, W - 1, 0, 1, H, oscuro(base, 0.4));
  rect(g, 3, 3, W - 6, 1, oscuro(base, 0.18)); rect(g, 3, 3, 1, H - 6, oscuro(base, 0.18));
  // aparatos de aire y depósitos
  const n = az.entero(1, 2 + e.w);
  for (let i = 0; i < n; i++) {
    const x = az.entero(5, W - 11), y = az.entero(5, H - 9);
    rect(g, x + 1, y + 1, 6, 4, oscuro(base, 0.5)); rect(g, x, y, 6, 4, '#9a9a9e'); rect(g, x, y, 6, 1, '#c0c0c4'); rect(g, x + 1, y + 1, 2, 2, '#5a5a60');
  }
  if (e.tejado === 'granizo') {
    // el logo de Granizo Corp.: un copo de nieve de tres rayas
    const cx = W >> 1, cy = (H >> 1) - 6; g.strokeStyle = '#bfe6ff'; g.lineWidth = 3;
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; g.beginPath(); g.moveTo(cx - Math.cos(a) * 14, cy - Math.sin(a) * 14); g.lineTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); g.stroke(); }
  } else if (e.tejado === 'templo') {
    // el icono de guardar (el disquete) en el tejado del templo
    rect(g, W / 2 - 9, 6, 18, 18, '#141418'); rect(g, W / 2 - 8, 7, 16, 16, '#2a5fd0'); rect(g, W / 2 - 5, 7, 10, 6, '#141418'); rect(g, W / 2 - 4, 8, 6, 4, '#c9c7c0'); rect(g, W / 2 - 5, 16, 10, 6, '#f4f4f4');
  } else if (e.tejado === 'comisaria') {
    rect(g, 4, (H >> 1) - 1, W - 8, 3, '#2a5fd0');
  } else if (e.tejado === 'taller') {
    for (let i = 0; i < 6; i++) { g.fillStyle = az.elige(COLORES_COCHE); g.beginPath(); g.arc(az.entero(6, W - 6), az.entero(4, H - 4), az.entero(2, 4), 0, 7); g.fill(); }
  } else if (e.tejado === 'cajas') {
    rect(g, W / 2 - 8, 6, 16, 12, '#141418'); rect(g, W / 2 - 7, 7, 14, 10, '#8a5a2a'); rect(g, W / 2 - 7, 7, 14, 3, '#b07a3a'); rect(g, W / 2 - 1, 11, 2, 3, '#ffd23c');
  } else if (e.tejado === 'helados') {
    rect(g, W / 2 - 3, 6, 6, 8, '#f4f4f4'); rect(g, W / 2 - 2, 14, 4, 6, '#d9a060'); rect(g, W / 2 - 1, 20, 2, 2, '#d9a060');
  }
  if (e.rotulo) {
    // el rótulo, en una banda oscura (como los logos en los tejados de los juegos de entonces)
    const esc = 1, w = anchoTexto(e.rotulo, esc, 'mini') + 6;
    if (w <= W - 4) { rect(g, (W - w) / 2, H - 13, w, 10, '#141418'); escribe(g, e.rotulo, W / 2, H - 11, { fuente: 'mini', esc, c: e.nombre ? '#ffd23c' : '#d9d4c7', borde: null, sombra: null, alin: 'centro' }); }
  }
  SUELO.tejados.set(e.id, c);
  return c;
}

// los iconos del marcador
function creaIconos() {
  const o = (filas, pal) => { const [c, g] = lienzoNuevo(filas[0].length, filas.length); pixeles(g, filas, pal); return c; };
  const K = { '#': '#141418', r: '#e0302c', R: '#ff7a70', w: '#f4f4f4', b: '#8a6a3a', B: '#5a3f22', g: '#5cbf4a', G: '#2d5a26', a: '#4aa3df', A: '#1f4e73', y: '#e9c46a', Y: '#5c4f2a', o: '#f28c28', x: '#55585f', X: '#3a3c42', s: '#8c8c90' };
  // el martillo de baneo (encendido y apagado)
  SUELO.iconos.martillo = o(['.#########.', '#rRRRRRRRr#', '#rRRRRRRRr#', '#rrrrrrrrr#', '.#########.', '....#b#....', '....#b#....', '....#b#....', '....#b#....', '....#B#....', '....###....'], K);
  SUELO.iconos.martilloApagado = o(['.#########.', '#xxxxxxxxx#', '#xxxxxxxxx#', '#XXXXXXXXX#', '.#########.', '....#x#....', '....#x#....', '....#x#....', '....#x#....', '....#X#....', '....###....'], K);
  // los emblemas de las bandas (9 × 9)
  SUELO.iconos.animales = o(['.#.....#.', '#g#...#g#', '#g#####g#', '#ggggggg#', '#g#gggg##', '#ggg#ggg#', '#ggggggg#', '.#ggggg#.', '..#####..'], K);
  SUELO.iconos.granizo = o(['....#....', '#...a...#', '.#.aaa.#.', '..#aaa#..', '#aaaaaaa#', '..#aaa#..', '.#.aaa.#.', '#...a...#', '....#....'], K);
  SUELO.iconos.extractores = o(['..#####..', '.#yyyyy#.', '#yyyyyyy#', '#yy###yy#', '#yy#Y#yy#', '#yy###yy#', '#yyyyyyy#', '.#yyyyy#.', '..#####..'], K);
  // la pistola del marcador
  SUELO.iconos.pistola = o(['..............', '.############.', '#xxxxxxxxxxxx#', '#xxxxxxxxxxxx#', '.####xxx######', '....#xx#......', '....#xx#......', '....#xx#......', '....####......'], K);
  // la cara de CrazyBunny para las vidas
  SUELO.iconos.vida = o(['.#....#.', '#w#..#w#', '#w#..#w#', '.######.', '#wwwwww#', '#wowwow#', '#wwwwww#', '.######.'], K);
}
