// Fans Of Pets · MONIGOTE: la plantilla en blanco por piezas (ADR 032). Cada edad es un conjunto de piezas (cabeza, tronco, brazos,
// piernas) dibujadas por código como formas simples (elipses y cápsulas con el trazo grueso de siempre), con sus ANCLAS (los puntos de
// unión) y las SOLAPAS redondas bajo cada unión. El MAPA dice qué piezas hay, en qué orden se pintan y qué se une con qué; montar() es
// puro: devuelve dónde va cada pieza (y con qué giro) y falla con nombre si algo no está en el mapa. svg() dibuja una pieza o el montaje
// como texto SVG, que es lo que se le da a Yoshi para vestir (herramientas/pets/monigote.mjs lo pasa a PNG) y lo que pinta el taller.
// Todo en fracciones de un lienzo cuadrado (0..1); las formas se dan en el sitio que ocupan montadas en reposo (de pie, brazos caídos).
// Una pieza se une a otra por un ancla: si la otra ha girado, la pieza la sigue (su ancla va donde haya ido la de la otra). Los OBJETOS
// (bol, cuchara, esponja) son piezas más, con el ancla `agarre` pegada a la mano de un brazo; su giro lo dice la postura, no el brazo.
// Los APÉNDICES de cada especie (orejas, cola) y la RANURA de accesorio (corona) van RÍGIDOS: además de seguir a su pieza, giran con
// ella (la oreja se inclina con la cabeza). La cola va siempre en la primera capa: detrás de todo, asomando lo que deje el tronco.
'use strict';
PT.monigote = (() => {
  const TRAZO = 0.014, TINTA = '#2b1a12', PIEL = '#ffffff';
  // forma: elipse { cx, cy, rx, ry } o cápsula { a: [x, y], b: [x, y], r } (dos centros y el radio). Las anclas, en fracciones del lienzo.
  // unión: [ancla propia, otra pieza, ancla de la otra] y, si es 'rigida', la pieza gira además lo que gire la otra
  const CUERPO = { cabeza: ['cuello', 'tronco', 'cuello'], 'brazo-izq': ['hombro', 'tronco', 'hombro-izq'], 'brazo-der': ['hombro', 'tronco', 'hombro-der'],
    'pierna-izq': ['cadera', 'tronco', 'cadera-izq'], 'pierna-der': ['cadera', 'tronco', 'cadera-der'],
    'oreja-izq': ['base', 'cabeza', 'oreja-izq', 'rigida'], 'oreja-der': ['base', 'cabeza', 'oreja-der', 'rigida'],
    corona: ['base', 'cabeza', 'corona', 'rigida'], cola: ['base', 'tronco', 'cola', 'rigida'] };
  // capas comunes: la cola detrás de todo; las orejas tras la cabeza y la corona delante
  const DETRAS = ['cola', 'pierna-izq', 'pierna-der', 'tronco'], CABEZA = ['oreja-izq', 'oreja-der', 'cabeza', 'corona'];
  const EDADES = {
    nino: {
      piezas: {
        // la cabeza lleva el marco de la cara (los ojos y la boca del molde liso de niño, anclas.js) para las piezas de caras.js
        cabeza: { forma: { tipo: 'elipse', cx: 0.525, cy: 0.42, rx: 0.36, ry: 0.265 }, pivote: 'cuello',
          anclas: { cuello: [0.52, 0.66], 'ojo-izq': [0.367, 0.457], 'ojo-der': [0.686, 0.457], boca: [0.526, 0.596],
            'oreja-izq': [0.4, 0.19], 'oreja-der': [0.65, 0.19], corona: [0.525, 0.165] } },
        tronco: { forma: { tipo: 'elipse', cx: 0.52, cy: 0.78, rx: 0.235, ry: 0.13 }, pivote: 'centro',
          anclas: { centro: [0.52, 0.78], cuello: [0.52, 0.66], 'hombro-izq': [0.31, 0.71], 'hombro-der': [0.73, 0.71], 'cadera-izq': [0.43, 0.86], 'cadera-der': [0.61, 0.86], cola: [0.7, 0.86] } },
        'brazo-izq': { forma: { tipo: 'capsula', a: [0.31, 0.71], b: [0.265, 0.81], r: 0.042 }, pivote: 'hombro', anclas: { hombro: [0.31, 0.71], mano: [0.26, 0.83] } },
        'brazo-der': { forma: { tipo: 'capsula', a: [0.73, 0.71], b: [0.775, 0.81], r: 0.042 }, pivote: 'hombro', anclas: { hombro: [0.73, 0.71], mano: [0.78, 0.83] } },
        'pierna-izq': { forma: { tipo: 'capsula', a: [0.43, 0.86], b: [0.42, 0.915], r: 0.055 }, pivote: 'cadera', anclas: { cadera: [0.43, 0.86], pie: [0.42, 0.965] } },
        'pierna-der': { forma: { tipo: 'capsula', a: [0.61, 0.86], b: [0.62, 0.915], r: 0.055 }, pivote: 'cadera', anclas: { cadera: [0.61, 0.86], pie: [0.62, 0.965] } },
        // apéndices y ranura: la forma es solo el sitio (cada criatura dibuja su oreja, su cola o su accesorio desde la base)
        'oreja-izq': { forma: { tipo: 'capsula', a: [0.4, 0.19], b: [0.36, 0.05], r: 0.045 }, pivote: 'base', anclas: { base: [0.4, 0.19] } },
        'oreja-der': { forma: { tipo: 'capsula', a: [0.65, 0.19], b: [0.69, 0.05], r: 0.045 }, pivote: 'base', anclas: { base: [0.65, 0.19] } },
        corona: { forma: { tipo: 'elipse', cx: 0.525, cy: 0.135, rx: 0.07, ry: 0.04 }, pivote: 'base', anclas: { base: [0.525, 0.165] } },
        cola: { forma: { tipo: 'capsula', a: [0.7, 0.86], b: [0.8, 0.9], r: 0.045 }, pivote: 'base', anclas: { base: [0.7, 0.86] } },
        // objetos: dibujados con el agarre en la mano en reposo (bol y esponja en la izquierda y derecha; la cuchara sube desde la mano)
        bol: { forma: { tipo: 'elipse', cx: 0.38, cy: 0.83, rx: 0.12, ry: 0.065 }, pivote: 'agarre', anclas: { agarre: [0.26, 0.83] } },
        cuchara: { forma: { tipo: 'capsula', a: [0.78, 0.83], b: [0.78, 0.72], r: 0.016 }, pivote: 'agarre', anclas: { agarre: [0.78, 0.83], punta: [0.78, 0.705] } },
        esponja: { forma: { tipo: 'elipse', cx: 0.81, cy: 0.81, rx: 0.05, ry: 0.038 }, pivote: 'agarre', anclas: { agarre: [0.78, 0.83] } },
      },
      // de atrás adelante, qué ancla de cada pieza se pega a qué ancla de qué pieza (el tronco es la raíz) y los giros propios de la
      // postura (grados alrededor del ancla de unión; lo que se pida a montar() manda sobre ellos)
      posturas: {
        'de-pie': { capas: [...DETRAS, 'brazo-izq', 'brazo-der', ...CABEZA], uniones: CUERPO, giros: {} },
        // comer: la izquierda sujeta el bol delante de la barbilla y la derecha sube la cuchara a la boca (los brazos, delante de la cabeza)
        comer: { capas: [...DETRAS, ...CABEZA, 'brazo-izq', 'bol', 'brazo-der', 'cuchara'],
          uniones: { ...CUERPO, bol: ['agarre', 'brazo-izq', 'mano'], cuchara: ['agarre', 'brazo-der', 'mano'] },
          giros: { 'brazo-izq': -150, 'brazo-der': 150, cuchara: 40 } },
        // ducha: los dos brazos abiertos hacia los lados, la esponja en la derecha (la alcachofa y la mampara las pone el juego)
        ducha: { capas: [...DETRAS, ...CABEZA, 'brazo-izq', 'brazo-der', 'esponja'],
          uniones: { ...CUERPO, esponja: ['agarre', 'brazo-der', 'mano'] }, giros: { 'brazo-izq': 95, 'brazo-der': -95 } },
      },
    },
  };
  EDADES.adulto = EDADES.nino;   // misma proporción (el arte de adolescente y adulto son dos vestidos del mismo monigote)

  const edad = e => EDADES[e];
  const piezas = e => (EDADES[e] ? Object.keys(EDADES[e].piezas) : []);
  const posturas = e => (EDADES[e] ? Object.keys(EDADES[e].posturas) : []);

  // un punto girado alrededor de otro (grados; el eje y va hacia abajo, así que los grados positivos giran como el reloj en pantalla)
  function gira([x, y], [cx, cy], grados) {
    const a = grados * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy;
    return [cx + dx * c - dy * s, cy + dx * s + dy * c];
  }
  // dónde ha ido a parar un ancla de una pieza ya montada (su sitio dice desde dónde se ha movido y cuánto ha girado)
  function anclaMontada(E, s, ancla) {
    const [x, y] = E.piezas[s.pieza].anclas[ancla], [dx, dy] = [s.pivote[0] - s.origen[0], s.pivote[1] - s.origen[1]];
    return gira([x + dx, y + dy], s.pivote, s.giro);
  }
  // el sitio de una pieza: su ancla de unión en reposo (origen), dónde queda ahora (pivote: sobre el ancla ajena, ya montada) y su
  // giro. La pieza a la que se une se monta antes si hace falta (las capas van de atrás adelante, no por dependencias)
  function sitioDe(E, P, nombre, giros, montadas, visitando = []) {
    if (montadas[nombre]) return PT.ok(montadas[nombre]);
    const pieza = E.piezas[nombre], giro = giros[nombre] || 0;
    if (!pieza) return PT.error('pieza-desconocida', { pieza: nombre });
    if (visitando.includes(nombre)) return PT.error('union-circular', { pieza: nombre });
    const u = P.uniones[nombre];
    let sitio;
    if (!u) sitio = { pieza: nombre, origen: pieza.anclas[pieza.pivote].slice(), pivote: pieza.anclas[pieza.pivote].slice(), giro };
    else {
      const [propia, otra, ajena, modo] = u, origen = pieza.anclas[propia];
      if (!origen || !E.piezas[otra] || !E.piezas[otra].anclas[ajena]) return PT.error('ancla-desconocida', { pieza: nombre, union: u });
      const padre = sitioDe(E, P, otra, giros, montadas, [...visitando, nombre]);
      if (!padre.ok) return padre;
      const total = modo === 'rigida' ? giro + padre.valor.giro : giro;
      sitio = { pieza: nombre, origen: origen.slice(), pivote: anclaMontada(E, padre.valor, ajena), giro: total };
    }
    montadas[nombre] = sitio;
    return PT.ok(sitio);
  }
  // el montaje de una postura: para cada pieza, en orden de capas, desde dónde se mueve (origen, su ancla en reposo), dónde queda
  // (pivote) y su giro (grados). giros: { pieza: grados } manda sobre los de la postura; lo que no esté, 0.
  // Resultado PT.ok([{ pieza, origen, pivote, giro }]) o PT.error con nombre
  function montar(e, postura, giros = {}) {
    const E = EDADES[e];
    if (!E) return PT.error('edad-sin-monigote', { edad: e });
    const P = E.posturas[postura];
    if (!P) return PT.error('postura-desconocida', { postura });
    for (const p of Object.keys(giros)) if (!P.capas.includes(p)) return PT.error('pieza-fuera-de-postura', { pieza: p });
    const todos = { ...P.giros, ...giros }, montadas = {}, sitio = [];
    for (const nombre of P.capas) {
      const r = sitioDe(E, P, nombre, todos, montadas);
      if (!r.ok) return r;
      sitio.push(r.valor);
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
  // una pieza llevada de su origen a su pivote y girada alrededor de él: <g transform>
  function piezaSvg(E, s, L) {
    const p = E.piezas[s.pieza], [px, py] = s.pivote, dx = (px - s.origen[0]) * L, dy = (py - s.origen[1]) * L;
    return `<g transform="translate(${r1(dx)} ${r1(dy)}) rotate(${s.giro} ${r1(px * L)} ${r1(py * L)})">${formaSvg(p.forma, L)}</g>`;
  }
  const r1 = n => Math.round(n * 10) / 10;
  // el SVG completo: el montaje de una postura (con giros) o, con `sueltas`, la hoja despiezada (cada pieza en reposo, sin giros, y
  // separada del resto). L: lado en píxeles (la hoja es más ancha, ANCHO_HOJA·L, para que quepan los objetos). sin: piezas que no se
  // pintan (los apéndices o la ranura que una criatura no tiene: el hurón no lleva orejas largas ni corona). PT.ok(texto) o el error
  function svg(e, postura, giros = {}, L = 1024, sueltas = false, sin = []) {
    const m = montar(e, postura, sueltas ? SIN_GIROS(e, postura) : giros);
    if (!m.ok) return m;
    const E = EDADES[e], ancho = Math.round(sueltas ? ANCHO_HOJA * L : L), vistas = m.valor.filter(s => !sin.includes(s.pieza));
    const cuerpo = sueltas ? hojaSvg(E, vistas, L) : vistas.map(s => piezaSvg(E, s, L)).join('');
    return PT.ok(`<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${L}" viewBox="0 0 ${ancho} ${L}"><rect width="${ancho}" height="${L}" fill="#fff"/>${cuerpo}</svg>`);
  }
  const SIN_GIROS = (e, postura) => Object.fromEntries((EDADES[e]?.posturas[postura]?.capas || []).map(p => [p, 0]));
  // la hoja despiezada: la cabeza arriba, el tronco en el centro, brazos a los lados, piernas abajo y los objetos en una columna a la
  // derecha, cada pieza desplazada desde su sitio de reposo para que no se toquen (así Yoshi las ve separadas y a su tamaño real)
  const ANCHO_HOJA = 1.4;
  const DESPLAZA = { cabeza: [0, -0.12], tronco: [0, 0], 'brazo-izq': [-0.14, 0], 'brazo-der': [0.14, 0], 'pierna-izq': [-0.16, 0.04], 'pierna-der': [0.16, 0.04],
    bol: [0.8, -0.5], cuchara: [0.42, -0.12], esponja: [0.42, 0.1], 'oreja-izq': [0.58, 0], 'oreja-der': [0.45, 0], corona: [0.75, 0.05], cola: [0.25, -0.3] };
  function hojaSvg(E, sitio, L) {
    return sitio.map(s => {
      const [dx, dy] = DESPLAZA[s.pieza] || [0, 0];
      return `<g transform="translate(${dx * L} ${dy * L})">${piezaSvg(E, s, L)}</g>`;
    }).join('');
  }
  return { edad, piezas, posturas, montar, anclaMontada, svg, TRAZO, ANCHO_HOJA };
})();
