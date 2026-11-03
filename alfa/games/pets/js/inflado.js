// Fans Of Pets · INFLADO (fase f15, docs/pets/FASES.md): cada pieza del despiece (img/criaturas/<criatura>/<edad>/, mapa.json) se
// convierte en un volumen de peluche que sale de su propia silueta: cuanto más lejos del borde, más gorda. Delante y detrás llevan la
// misma pieza como textura, así que al moverse cada pieza se lleva su dibujo entero (sin trozos fantasma de otras). Solo cuentas sobre la
// silueta (alfa por píxel) y el mapa del despiece, sin three.js ni dibujo: el adaptador (adaptadores/inflado3d.js) monta las mallas.
'use strict';
PT.inflado = (() => {
  const DENTRO = 40;   // un píxel es de la pieza si su alfa pasa de aquí

  // la silueta en una rejilla de paso px: 1 dentro, 0 fuera. alfa(x, y) da el alfa del píxel
  function rejilla(alfa, ancho, alto, paso) {
    const nx = Math.ceil(ancho / paso) + 1, ny = Math.ceil(alto / paso) + 1, m = new Uint8Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) m[j * nx + i] = alfa(Math.min(ancho - 1, i * paso), Math.min(alto - 1, j * paso)) > DENTRO ? 1 : 0;
    return { m, nx, ny };
  }
  // la distancia de cada punto de dentro al borde (en pasos de rejilla; chaflán 3-4, dos pasadas); fuera, 0
  function distancias(m, nx, ny) {
    const d = new Float32Array(nx * ny), en = (x, y) => (x < 0 || y < 0 || x >= nx || y >= ny ? 0 : d[y * nx + x]);
    for (let i = 0; i < d.length; i++) d[i] = m[i] ? 1e9 : 0;
    const pasa = (x, y, vecinos) => { const k = y * nx + x; if (d[k]) d[k] = Math.min(d[k], ...vecinos.map(([a, b, c]) => en(x + a, y + b) + c)); };
    const IDA = [[-1, 0, 3], [0, -1, 3], [-1, -1, 4], [1, -1, 4]], VUELTA = [[1, 0, 3], [0, 1, 3], [1, 1, 4], [-1, 1, 4]];
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) pasa(x, y, IDA);
    for (let y = ny - 1; y >= 0; y--) for (let x = nx - 1; x >= 0; x--) pasa(x, y, VUELTA);
    for (let i = 0; i < d.length; i++) d[i] /= 3;
    return d;
  }
  // el punto de dentro más cercano (a 2 pasos como mucho): el borde de fuera toma su color, el contorno dibujado
  function dentro(m, nx, ny, i, j) {
    if (m[j * nx + i]) return [i, j];
    let mejor = [i, j], md = 9;
    for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++) {
      const u = i + a, v = j + b;
      if (u >= 0 && v >= 0 && u < nx && v < ny && m[v * nx + u] && a * a + b * b < md) { md = a * a + b * b; mejor = [u, v]; }
    }
    return mejor;
  }
  // la malla de una pieza: posiciones (x a la derecha, y hacia abajo en negativo, z la gordura; en unidades del mundo = px / unidad),
  // uv sobre la imagen de la pieza e índices de triángulos de la cara de delante y la de detrás. grosor: cuánto se hincha (1 = media esfera)
  function malla({ alfa, ancho, alto, paso, grosor, unidad }) {
    const { m, nx, ny } = rejilla(alfa, ancho, alto, paso), d = distancias(m, nx, ny), dmax = d.reduce((a, v) => Math.max(a, v), 1e-6);
    const gordo = grosor * dmax * paso / unidad, z = k => gordo * Math.sqrt(1 - (1 - Math.min(1, d[k] / dmax)) ** 2);
    const posiciones = [], uvs = [], indices = [], n = nx * ny;
    for (const lado of [1, -1]) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const [ui, uj] = dentro(m, nx, ny, i, j);
      posiciones.push(i * paso / unidad, -j * paso / unidad, lado * z(j * nx + i));
      uvs.push(Math.min(1, (ui * paso + 1) / ancho), 1 - Math.min(1, (uj * paso + 1) / alto));
    }
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i, b = a + 1, c = a + nx, e = c + 1;
      if (!(m[a] || m[b] || m[c] || m[e])) continue;
      indices.push(a, c, b, b, c, e, n + a, n + b, n + c, n + b, n + e, n + c);
    }
    // la gordura en un punto de la pieza (fx, fy en fracciones de su caja): ahí se apoyan las piezas hijas
    const gordura = (fx, fy) => z(Math.round(Math.min(1, Math.max(0, fy)) * (ny - 1)) * nx + Math.round(Math.min(1, Math.max(0, fx)) * (nx - 1)));
    return { posiciones, uvs, indices, gordura };
  }
  // en qué orden se montan las piezas (cada una después de su madre) y a qué hueso del maniquí responde cada una en las poses
  function orden(mapa) {
    const hechas = [], quedan = [...mapa.capas];
    while (quedan.length) {
      const i = quedan.findIndex(n => !mapa.piezas[n].madre || hechas.includes(mapa.piezas[n].madre));
      if (i < 0) return PT.error('despiece-sin-madre', { piezas: quedan });
      hechas.push(quedan.splice(i, 1)[0]);
    }
    return PT.ok(hechas);
  }
  const HUESO = { tronco: 'cuerpo', cabeza: 'cabeza', 'brazo-izq': 'brazo-1', 'brazo-der': 'brazo1', 'pierna-izq': 'pierna-1', 'pierna-der': 'pierna1',
    cola: 'cola', 'oreja-izq': 'oreja-1', 'oreja-der': 'oreja1' };
  // dónde se apoya una pieza en su madre: delante (si va después en las capas) o detrás, según la gordura de la madre en el pivote
  function apoyo(mapa, nombre, gorduraMadre) {
    const p = mapa.piezas[nombre], delante = mapa.capas.indexOf(nombre) > mapa.capas.indexOf(p.madre);
    if (!delante) return -gorduraMadre * 0.45;
    return gorduraMadre * (nombre === 'cabeza' ? 0.55 : 0.75);
  }
  return { rejilla, distancias, malla, orden, apoyo, hueso: n => (Object.hasOwn(HUESO, n) ? HUESO[n] : null) };
})();
