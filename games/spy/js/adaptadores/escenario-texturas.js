// Fans of Spy · ADAPTADORES · Las texturas del parking (img/texturas/, de Yoshi): el suelo, las plazas con su raya y la pared de
// hormigón con su banda de peligro. `geometria(pl)` (pura, se prueba con node) saca de una planta los rectángulos con su UV
// (los 15 números por vértice de gl/texturas.js); `carga()` baja las tres imágenes y `construye(pl)` hace sus mallas. Se pintan
// encima de lo que ya hace escenario.js (el suelo de color, las paredes), que se ve si una textura no llega: nunca queda feo.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const NOMBRES = ['suelo', 'plaza', 'pared'];
  const ALTO_PARED = 1.7, REPITE_SUELO = 2, REPITE_PARED = 3;   // casillas que cubre una vez la imagen del suelo y de la pared
  const Y_SUELO = 0.006, X_PARED = 0.02;                          // un pelo por encima del suelo de color y por dentro del zócalo

  // Un rectángulo en un lienzo de datos: 4 vértices (posición, normal, color blanco, sin brillo, sin contorno, UV) y 2 triángulos.
  // `puntos`: cuatro [x, y, z, u, v] en orden antihorario visto desde la normal.
  function rectangulo(acum, puntos, normal) {
    const base = acum.datos.length / 15;
    for (const [x, y, z, u, v] of puntos) acum.datos.push(x, y, z, normal[0], normal[1], normal[2], 1, 1, 1, 0, 0, 0, 0, u, v);
    acum.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const vacio = () => ({ datos: [], indices: [] });
  const sello = (a) => ({ datos: new Float32Array(a.datos), indices: new Uint16Array(a.indices) });

  function casilla(acum, x, y, repite) {
    const u = (px) => px / repite, v = (pz) => pz / repite;
    rectangulo(acum, [[x, Y_SUELO, y, u(x), v(y)], [x, Y_SUELO, y + 1, u(x), v(y + 1)], [x + 1, Y_SUELO, y + 1, u(x + 1), v(y + 1)], [x + 1, Y_SUELO, y, u(x + 1), v(y)]], [0, 1, 0]);
  }
  function plaza(acum, x, y) {
    rectangulo(acum, [[x, Y_SUELO, y, 0, 0], [x, Y_SUELO, y + 1, 0, 1], [x + 1, Y_SUELO, y + 1, 1, 1], [x + 1, Y_SUELO, y, 1, 0]], [0, 1, 0]);
  }
  // La pared de un lado, entera de arriba abajo del mapa: la imagen se repite a lo largo, con el zócalo amarillo abajo (v = 1).
  function lado(acum, x, largo, haciaDentro) {
    const u1 = largo / REPITE_PARED, a = [x, 0, 0, 0, 1], b = [x, ALTO_PARED, 0, 0, 0], c = [x, ALTO_PARED, largo, u1, 0], d = [x, 0, largo, u1, 1];
    if (haciaDentro > 0) rectangulo(acum, [a, b, c, d], [1, 0, 0]);
    else rectangulo(acum, [a, d, c, b], [-1, 0, 0]);
  }

  // De una planta: { suelo, plaza, pared } con { datos: Float32Array, indices: Uint16Array } (o null si no hay nada de ese tipo).
  function geometria(pl) {
    const suelo = vacio(), plazas = vacio(), pared = vacio();
    for (let y = 0; y < pl.alto; y++) {
      for (let x = 0; x < pl.ancho; x++) {
        const t = pl.tipo(x, y);
        if (t === '#' || t === 'M' || t === 'G') continue;   // la meta y la garita conservan su color
        if (t === 'C' || t === 'X') plaza(plazas, x, y); else casilla(suelo, x, y, REPITE_SUELO);
      }
    }
    lado(pared, X_PARED, pl.alto, 1);
    lado(pared, pl.ancho - X_PARED, pl.alto, -1);
    const f = (a) => (a.indices.length ? sello(a) : null);
    return { suelo: f(suelo), plaza: f(plazas), pared: f(pared) };
  }

  const imagenes = {};
  // Baja las tres imágenes. Nunca falla: la que no llegue se queda sin poner y esa parte sigue con el color de siempre.
  async function carga() {
    await Promise.all(NOMBRES.map(async (n) => {
      try {
        const r = await fetch('img/texturas/' + n + '.jpg?v=' + S.AJ.version, { signal: AbortSignal.timeout(15000) });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        imagenes[n] = await createImageBitmap(await r.blob());
      } catch (e) {
        console.warn('Spy: no se pudo cargar la textura «' + n + '»; el suelo y las paredes siguen de color.', e);
      }
    }));
    return Object.keys(imagenes).length;
  }
  // Las mallas de una planta: una por textura que haya llegado. Se pintan sin contorno (son planas).
  function construye(pl) {
    const g = geometria(pl), mallas = [];
    for (const n of NOMBRES) if (g[n] && imagenes[n]) mallas.push(S.gl.mallaGlb(g[n], imagenes[n], n !== 'plaza'));
    return mallas;
  }
  S.texturasEscenario = Object.freeze({ geometria, carga, construye });
})(SPY);
