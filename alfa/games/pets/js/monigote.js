// Fans Of Pets · MONIGOTE: la plantilla en blanco por piezas (ADR 032). Cada edad es un conjunto de piezas (cabeza, tronco, brazos,
// piernas) dibujadas por código como formas simples (elipses y cápsulas con el trazo grueso de siempre), con sus ANCLAS (los puntos de
// unión) y las SOLAPAS redondas bajo cada unión. El MAPA dice qué piezas hay, en qué orden se pintan y qué se une con qué; montar() es
// puro: devuelve dónde va cada pieza (y con qué giro) y falla con nombre si algo no está en el mapa. svg() dibuja una pieza o el montaje
// como texto SVG, que es lo que se le da a Yoshi para vestir (herramientas/pets/monigote.mjs lo pasa a PNG) y lo que pinta el taller.
// Todo en fracciones de un lienzo cuadrado (0..1); las formas se dan en el sitio que ocupan montadas en reposo.
'use strict';
PT.monigote = (() => {
  const TRAZO = 0.014, TINTA = '#2b1a12', PIEL = '#ffffff';
  // forma: elipse { cx, cy, rx, ry } o cápsula { a: [x, y], b: [x, y], r } (dos centros y el radio). Las anclas, en fracciones del lienzo.
  const EDADES = {
    nino: {
      piezas: {
        // la cabeza lleva el marco de la cara (los ojos y la boca del molde liso de niño, anclas.js) para las piezas de caras.js
        cabeza: { forma: { tipo: 'elipse', cx: 0.525, cy: 0.42, rx: 0.36, ry: 0.265 }, pivote: 'cuello',
          anclas: { cuello: [0.52, 0.66], 'ojo-izq': [0.367, 0.457], 'ojo-der': [0.686, 0.457], boca: [0.526, 0.596] } },
        tronco: { forma: { tipo: 'elipse', cx: 0.52, cy: 0.78, rx: 0.235, ry: 0.13 }, pivote: 'centro',
          anclas: { centro: [0.52, 0.78], cuello: [0.52, 0.66], 'hombro-izq': [0.31, 0.71], 'hombro-der': [0.73, 0.71], 'cadera-izq': [0.43, 0.86], 'cadera-der': [0.61, 0.86] } },
        'brazo-izq': { forma: { tipo: 'capsula', a: [0.31, 0.71], b: [0.275, 0.78], r: 0.042 }, pivote: 'hombro', anclas: { hombro: [0.31, 0.71], mano: [0.27, 0.8] } },
        'brazo-der': { forma: { tipo: 'capsula', a: [0.73, 0.71], b: [0.765, 0.78], r: 0.042 }, pivote: 'hombro', anclas: { hombro: [0.73, 0.71], mano: [0.77, 0.8] } },
        'pierna-izq': { forma: { tipo: 'capsula', a: [0.43, 0.86], b: [0.42, 0.915], r: 0.055 }, pivote: 'cadera', anclas: { cadera: [0.43, 0.86], pie: [0.42, 0.965] } },
        'pierna-der': { forma: { tipo: 'capsula', a: [0.61, 0.86], b: [0.62, 0.915], r: 0.055 }, pivote: 'cadera', anclas: { cadera: [0.61, 0.86], pie: [0.62, 0.965] } },
      },
      // de atrás adelante, y qué ancla de cada pieza se pega a qué ancla de qué pieza (el tronco es la raíz)
      posturas: {
        'de-pie': {
          capas: ['pierna-izq', 'pierna-der', 'tronco', 'brazo-izq', 'brazo-der', 'cabeza'],
          uniones: { cabeza: ['cuello', 'tronco', 'cuello'], 'brazo-izq': ['hombro', 'tronco', 'hombro-izq'], 'brazo-der': ['hombro', 'tronco', 'hombro-der'],
            'pierna-izq': ['cadera', 'tronco', 'cadera-izq'], 'pierna-der': ['cadera', 'tronco', 'cadera-der'] },
        },
      },
    },
  };
  EDADES.adulto = EDADES.nino;   // misma proporción (el arte de adolescente y adulto son dos vestidos del mismo monigote)

  const edad = e => EDADES[e];
  const piezas = e => (EDADES[e] ? Object.keys(EDADES[e].piezas) : []);
  const posturas = e => (EDADES[e] ? Object.keys(EDADES[e].posturas) : []);

  // el montaje de una postura: para cada pieza, en orden de capas, su giro (grados, desde el pivote) y dónde queda su pivote.
  // giros: { pieza: grados } (lo que no esté, 0). Resultado PT.ok([{ pieza, pivote: [x, y], giro }]) o PT.error con nombre
  function montar(e, postura, giros = {}) {
    const E = EDADES[e];
    if (!E) return PT.error('edad-sin-monigote', { edad: e });
    const P = E.posturas[postura];
    if (!P) return PT.error('postura-desconocida', { postura });
    for (const p of Object.keys(giros)) if (!P.capas.includes(p)) return PT.error('pieza-fuera-de-postura', { pieza: p });
    const sitio = [];
    for (const nombre of P.capas) {
      const pieza = E.piezas[nombre];
      if (!pieza) return PT.error('pieza-desconocida', { pieza: nombre });
      const u = P.uniones[nombre];
      const pivote = u ? E.piezas[u[1]].anclas[u[2]] : pieza.anclas[pieza.pivote];
      if (!pivote) return PT.error('ancla-desconocida', { pieza: nombre, union: u });
      sitio.push({ pieza: nombre, pivote: pivote.slice(), giro: giros[nombre] || 0 });
    }
    return PT.ok(sitio);
  }

  // el SVG de una forma (en unidades del lienzo L), con la solapa ya incluida en la forma (los extremos redondos de la cápsula)
  function formaSvg(f, L) {
    const w = TRAZO * L, estilo = `fill="${PIEL}" stroke="${TINTA}" stroke-width="${w.toFixed(1)}" stroke-linejoin="round"`;
    if (f.tipo === 'elipse') return `<ellipse cx="${f.cx * L}" cy="${f.cy * L}" rx="${f.rx * L}" ry="${f.ry * L}" ${estilo}/>`;
    return `<line x1="${f.a[0] * L}" y1="${f.a[1] * L}" x2="${f.b[0] * L}" y2="${f.b[1] * L}" stroke="${TINTA}" stroke-width="${(f.r * 2 * L).toFixed(1)}" stroke-linecap="round"/>`
      + `<line x1="${f.a[0] * L}" y1="${f.a[1] * L}" x2="${f.b[0] * L}" y2="${f.b[1] * L}" stroke="${PIEL}" stroke-width="${(f.r * 2 * L - 2 * w).toFixed(1)}" stroke-linecap="round"/>`;
  }
  // una pieza girada alrededor de su pivote: <g transform>
  function piezaSvg(E, s, L) {
    const p = E.piezas[s.pieza], [px, py] = s.pivote;
    return `<g transform="rotate(${s.giro} ${px * L} ${py * L})">${formaSvg(p.forma, L)}</g>`;
  }
  // el SVG completo: el montaje de una postura (con giros) o, con `sueltas`, la hoja despiezada (cada pieza en su sitio de reposo pero
  // separadas del resto, en una cuadrícula). L: lado en píxeles. Devuelve PT.ok(texto) o el error de montar()
  function svg(e, postura, giros = {}, L = 1024, sueltas = false) {
    const m = montar(e, postura, giros);
    if (!m.ok) return m;
    const E = EDADES[e];
    const cuerpo = sueltas ? hojaSvg(E, m.valor, L) : m.valor.map(s => piezaSvg(E, s, L)).join('');
    return PT.ok(`<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${L}" viewBox="0 0 ${L} ${L}"><rect width="${L}" height="${L}" fill="#fff"/>${cuerpo}</svg>`);
  }
  // la hoja despiezada: la cabeza arriba, el tronco en el centro, brazos a los lados y piernas abajo, cada pieza desplazada desde su
  // sitio de reposo para que no se toquen (así Yoshi las ve separadas y a su tamaño real)
  const DESPLAZA = { cabeza: [0, -0.12], tronco: [0, 0], 'brazo-izq': [-0.14, 0], 'brazo-der': [0.14, 0], 'pierna-izq': [-0.16, 0.04], 'pierna-der': [0.16, 0.04] };
  function hojaSvg(E, sitio, L) {
    return sitio.map(s => {
      const [dx, dy] = DESPLAZA[s.pieza] || [0, 0];
      return `<g transform="translate(${dx * L} ${dy * L})">${piezaSvg(E, s, L)}</g>`;
    }).join('');
  }
  return { edad, piezas, posturas, montar, svg, TRAZO };
})();
