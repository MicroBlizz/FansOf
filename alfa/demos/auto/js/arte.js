// Fans of Auto · EL ARTE (1): los sprites vistos desde arriba, dibujados con código al cargar: coches de varios tipos y
// colores, peatones (vecinos, bandas, Moderadores), CrazyBunny, los objetos del suelo, las cabinas y los árboles. Todos miran
// hacia la derecha (ángulo 0) y se giran al pintar, con el píxel gordo y los bordes a escalones, como los coches de la primera
// PlayStation. Cada dibujo se guarda y se reutiliza.
'use strict';

const ARTE = { coches: new Map(), peatones: new Map(), conejo: [], objetos: {}, arbol: null, cabina: [], humo: [], fuego: [], chatarra: new Map() };

// los tipos de coche: largo, ancho, posición del capó (desde delante) y de la cola (desde atrás), ruedas, velocidad y vida
const COCHES = {
  sedan: { l: 20, a: 10, capo: 6, cola: 4, ruedas: [3, 14], vmax: 3.3, acel: 0.07, giro: 0.045, vida: 100 },
  compacto: { l: 16, a: 9, capo: 4, cola: 3, ruedas: [2, 11], vmax: 3.0, acel: 0.08, giro: 0.055, vida: 80 },
  deportivo: { l: 20, a: 9, capo: 7, cola: 4, ruedas: [3, 14], vmax: 4.2, acel: 0.1, giro: 0.05, vida: 80 },
  furgon: { l: 24, a: 11, capo: 5, cola: 2, ruedas: [4, 17], vmax: 2.8, acel: 0.05, giro: 0.035, vida: 150, caja: true },
  moderador: { l: 20, a: 10, capo: 6, cola: 4, ruedas: [3, 14], vmax: 3.9, acel: 0.09, giro: 0.05, vida: 120, policia: true },
  helados: { l: 24, a: 12, capo: 5, cola: 2, ruedas: [4, 17], vmax: 2.7, acel: 0.05, giro: 0.035, vida: 160, caja: true, helados: true },
  granizo: { l: 22, a: 10, capo: 7, cola: 4, ruedas: [3, 16], vmax: 3.8, acel: 0.08, giro: 0.045, vida: 110 },
  taxi: { l: 20, a: 10, capo: 6, cola: 4, ruedas: [3, 14], vmax: 3.4, acel: 0.07, giro: 0.045, vida: 100, taxi: true },
};
const COLORES_COCHE = ['#c43b32', '#2f6fc4', '#d9d4c7', '#3f8f3c', '#e0a030', '#6a6f78', '#8a4fb0', '#2d3c50', '#c87a3a', '#4fa9a0', '#b5b0a8', '#7a2c2c'];

// un coche: el cuerpo con esquinas recortadas, sombreado, parabrisas y luneta, ruedas, faros y pilotos
function fotoCoche(tipo, color) {
  const clave = tipo + '|' + color;
  if (ARTE.coches.has(clave)) return ARTE.coches.get(clave);
  const D = COCHES[tipo], L = D.l, A = D.a, [c, g] = lienzoNuevo(L, A);
  const borde = '#141418', luz = claro(color, 0.3), som = oscuro(color, 0.3), vid = '#263140', vidLuz = '#5a7090';
  rect(g, 1, 0, L - 2, A, borde); rect(g, 0, 1, L, A - 2, borde);
  rect(g, 2, 1, L - 4, A - 2, color); rect(g, 1, 2, L - 2, A - 4, color);
  rect(g, 2, 1, L - 4, 1, luz); rect(g, 2, A - 2, L - 4, 1, som);
  const xPar = L - D.capo - 2, xLun = D.cola + 1;
  if (D.caja) {
    // furgoneta: la caja de atrás más alta (más clara) y solo parabrisas
    rect(g, 2, 1, xPar - 3, A - 2, claro(color, 0.12)); rect(g, 2, 1, xPar - 3, 1, luz); rect(g, 2, A - 2, xPar - 3, 1, som);
    rect(g, xPar - 1, 1, 1, A - 2, som);
    rect(g, xPar, 2, 2, A - 4, vid); rect(g, xPar, 2, 2, 1, vidLuz);
  } else {
    rect(g, xPar, 2, 2, A - 4, vid); rect(g, xPar, 2, 2, 1, vidLuz);
    rect(g, xLun, 2, 2, A - 4, vid); rect(g, xLun, 2, 2, 1, vidLuz);
    rect(g, xLun + 2, 2, xPar - xLun - 2, A - 4, mezcla(color, '#ffffff', 0.08));   // el techo
    rect(g, xLun + 2, 2, xPar - xLun - 2, 1, luz);
  }
  for (const rx of D.ruedas) { rect(g, rx, 0, 3, 1, '#101014'); rect(g, rx, A - 1, 3, 1, '#101014'); }
  rect(g, L - 1, 2, 1, 2, '#fff4b8'); rect(g, L - 1, A - 4, 1, 2, '#fff4b8');
  rect(g, 0, 2, 1, 2, '#e0302c'); rect(g, 0, A - 4, 1, 2, '#e0302c');
  if (D.policia) {
    // los Moderadores: coche blanco con franja azul y luces en el techo
    rect(g, 3, 1, L - 6, 1, '#2a5fd0'); rect(g, 3, A - 2, L - 6, 1, '#2a5fd0');
    const m = (xLun + 2 + xPar) >> 1; rect(g, m - 2, (A >> 1) - 1, 2, 2, '#e0302c'); rect(g, m, (A >> 1) - 1, 2, 2, '#2a7fff');
  }
  if (D.taxi) { const m = (xLun + 2 + xPar) >> 1; rect(g, m - 1, (A >> 1) - 1, 3, 2, '#141418'); rect(g, m, A >> 1, 1, 1, '#fff4b8'); }
  if (D.helados) { rect(g, 3, 2, xPar - 5, A - 4, '#f7d9e3'); rect(g, 5, 4, 3, A - 8, '#f08aa8'); rect(g, 9, 3, 2, 2, '#f0c060'); rect(g, 9, 5, 2, A - 9, '#fff4b8'); }
  ARTE.coches.set(clave, c);
  return c;
}
// un coche quemado (el mismo molde, en gris oscuro y sin luces)
function fotoChatarra(tipo) {
  if (ARTE.chatarra.has(tipo)) return ARTE.chatarra.get(tipo);
  const base = fotoCoche(tipo, '#3a3a3e'), [c, g] = lienzoNuevo(base.width, base.height);
  g.drawImage(base, 0, 0);
  g.fillStyle = '#26262a'; g.fillRect(0, 2, 1, base.height - 4); g.fillRect(base.width - 1, 2, 1, base.height - 4);
  const az = Azar(7); motas(g, 2, 1, base.width - 4, base.height - 2, '#1a1a1e', 12, az);
  ARTE.chatarra.set(tipo, c);
  return c;
}

// los peatones: camisa (óvalo), cabeza (pelo) con la cara hacia delante, y dos cuadros para andar
const ROPA = ['#c43b32', '#2f6fc4', '#3f8f3c', '#e0a030', '#d9d4c7', '#8a4fb0', '#4fa9a0', '#6a6f78', '#f08aa8'];
const PELO = ['#2a1d12', '#6b4a2a', '#d9b34a', '#8c8c8c', '#b03a2a', '#111111'];
const PIEL = ['#f1c9a5', '#d9a677', '#9c6b43', '#6b4a2a'];
function fotoPeaton(estilo) {
  // estilo: { ropa, pelo, piel, banda } ; banda: null | 'animales' | 'granizo' | 'extractores' | 'moderador'
  const clave = JSON.stringify(estilo);
  if (ARTE.peatones.has(clave)) return ARTE.peatones.get(clave);
  const cuadros = [];
  for (let f = 0; f < 2; f++) {
    const [c, g] = lienzoNuevo(11, 9), cx = 5, cy = 4, bob = f ? 1 : 0;
    g.fillStyle = 'rgba(0,0,0,0)';
    if (estilo.banda === 'extractores') { rect(g, 0, 1, 4, 7, '#5a3f22'); rect(g, 1, 2, 2, 5, '#8a6a3a'); }   // la mochila gigante
    const ropa = estilo.banda === 'granizo' ? '#7fb8e6' : estilo.banda === 'moderador' ? '#f4f4f4' : estilo.ropa;
    rect(g, 3, 1 + bob, 6, 7 - 2 * bob, '#141418'); rect(g, 2, 2, 8, 5, '#141418');
    rect(g, 4, 2, 4, 5, ropa); rect(g, 3, 3, 6, 3, ropa);
    rect(g, 4, 2, 4, 1, claro(ropa, 0.3)); rect(g, 4, 6, 4, 1, oscuro(ropa, 0.3));
    if (estilo.banda === 'granizo') { rect(g, 3, 3, 1, 3, '#2a5fd0'); rect(g, 8, 3, 1, 3, '#2a5fd0'); }   // hombreras de plástico
    // brazos (se mueven al andar)
    rect(g, 5 + (f ? 1 : -1), 1, 1, 1, estilo.piel); rect(g, 5 - (f ? 1 : -1), 7, 1, 1, estilo.piel);
    // la cabeza: pelo, cara hacia delante (derecha)
    let pelo = estilo.pelo;
    if (estilo.banda === 'granizo') pelo = '#2a5fd0'; else if (estilo.banda === 'moderador') pelo = '#1d3f8f';
    rect(g, cx - 1, cy - 1, 3, 3, pelo); rect(g, cx + 1, cy, 1, 1, estilo.piel);
    if (estilo.banda === 'animales') { rect(g, cx - 2, cy - 2, 1, 1, pelo); rect(g, cx - 2, cy + 2, 1, 1, pelo); rect(g, cx + 2, cy, 1, 1, '#141418'); }   // orejas y hocico
    cuadros.push(c);
  }
  ARTE.peatones.set(clave, cuadros);
  return cuadros;
}
function estiloPeaton(az, banda = null) {
  return { ropa: az.elige(ROPA), pelo: az.elige(PELO), piel: az.elige(PIEL), banda };
}

// CrazyBunny desde arriba: capa naranja, cabeza blanca con corona y orejas largas hacia atrás, el ojo en espiral delante
function creaConejo() {
  for (let f = 0; f < 2; f++) {
    const [c, g] = lienzoNuevo(15, 11), bob = f ? 1 : 0;
    // capa
    rect(g, 3, 1, 8, 9, '#141418'); rect(g, 2, 2, 10, 7, '#141418');
    rect(g, 4, 2, 6, 7, '#f28c28'); rect(g, 3, 3, 8, 5, '#f28c28'); rect(g, 4, 2, 6, 1, '#ffb15c'); rect(g, 4, 8, 6, 1, '#b85f12');
    // orejas hacia atrás (izquierda)
    rect(g, 0, 3 + bob, 5, 2, '#141418'); rect(g, 0, 6 - bob, 5, 2, '#141418');
    rect(g, 1, 3 + bob, 4, 1, '#f4efe6'); rect(g, 1, 6 - bob, 4, 1, '#f4efe6'); rect(g, 2, 4 + bob, 2, 1, '#f0a0b0'); rect(g, 2, 6 - bob, 2, 1, '#f0a0b0');
    // cabeza
    rect(g, 6, 3, 5, 5, '#141418'); rect(g, 7, 4, 3, 3, '#f4efe6'); rect(g, 6, 5, 5, 1, '#f4efe6'); rect(g, 8, 3, 1, 5, '#f4efe6');
    // corona (anillo amarillo) y ojo en espiral
    rect(g, 7, 4, 1, 1, '#ffd23c'); rect(g, 9, 4, 1, 1, '#ffd23c'); rect(g, 7, 6, 1, 1, '#ffd23c'); rect(g, 9, 6, 1, 1, '#ffd23c');
    rect(g, 10, 5, 1, 1, '#f28c28');
    ARTE.conejo.push(c);
  }
}

// los objetos del suelo (8 × 8) y la cabina de teléfono
function creaObjetos() {
  const o = (filas, pal) => { const [c, g] = lienzoNuevo(filas[0].length, filas.length); pixeles(g, filas, pal); return c; };
  const K = { '#': '#141418', r: '#e0302c', R: '#ff7a70', w: '#ffffff', g: '#3f8f3c', G: '#7fd06a', y: '#ffd23c', Y: '#fff4b8', b: '#5a3f22', B: '#8a6a3a', a: '#2a5fd0', A: '#7fb8e6' };
  ARTE.objetos.vida = o(['.##..##.', '#RR##RR#', '#RRRRRR#', '#RRRRRR#', '.#RRRR#.', '..#RR#..', '...##...'], K);
  ARTE.objetos.dinero = o(['...##...', '..#GG#..', '.#GGGG#.', '#GGyGGG#', '#GyGyGG#', '#GGyGGG#', '.#GGGG#.', '..####..'], K);
  ARTE.objetos.soborno = o(['.######.', '#YYyyyY#', '#YyyyyY#', '.######.', '...#b#..', '...#b#..', '...#b#..', '...###..'], K);
  ARTE.objetos.mochila = o(['..####..', '.#bBBb#.', '#BBBBBB#', '#BByyBB#', '#BBBBBB#', '#bBBBBb#', '.######.'], K);
  ARTE.objetos.disco = o(['########', '#aaa##a#', '#aaa##a#', '#aaaaaa#', '#a####a#', '#a#YY#a#', '#a#YY#a#', '########'], K);
  // la cabina: azul, con el auricular; dos cuadros para cuando suena
  for (let f = 0; f < 2; f++) {
    const [c, g] = lienzoNuevo(14, 14);
    rect(g, 3, 3, 8, 8, '#141418'); rect(g, 4, 4, 6, 6, '#2a5fd0'); rect(g, 4, 4, 6, 1, '#7fb8e6'); rect(g, 5, 6, 4, 2, '#141418'); rect(g, 6, 6, 2, 2, '#f4f4f4');
    if (f) { g.fillStyle = '#ffd23c'; g.fillRect(1, 1, 2, 1); g.fillRect(11, 1, 2, 1); g.fillRect(1, 12, 2, 1); g.fillRect(11, 12, 2, 1); g.fillRect(0, 6, 1, 2); g.fillRect(13, 6, 1, 2); }
    ARTE.cabina.push(c);
  }
  // el árbol: copa verde con luces
  { const [c, g] = lienzoNuevo(16, 16); const az = Azar(3);
    g.fillStyle = '#141418'; g.beginPath(); g.arc(8, 8, 7.5, 0, 7); g.fill();
    g.fillStyle = '#3f7a33'; g.beginPath(); g.arc(8, 8, 6.5, 0, 7); g.fill();
    g.fillStyle = '#5a9a44'; g.beginPath(); g.arc(7, 7, 4.5, 0, 7); g.fill();
    motas(g, 3, 3, 10, 10, '#7fbf5a', 10, az); motas(g, 3, 3, 10, 10, '#2f5f28', 8, az);
    ARTE.arbol = c; }
  // humo y fuego (bolitas)
  for (const [lista, cols] of [[ARTE.humo, ['#8c8c8c', '#6a6a6a', '#4a4a4a']], [ARTE.fuego, ['#fff4b8', '#ffb030', '#e0302c']]]) {
    for (let i = 0; i < 3; i++) { const r = 2 + i, [c, g] = lienzoNuevo(r * 2 + 1, r * 2 + 1); g.fillStyle = cols[i]; g.beginPath(); g.arc(r + 0.5, r + 0.5, r, 0, 7); g.fill(); lista.push(c); }
  }
}
