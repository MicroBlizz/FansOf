// Fans of Asalto · DOMINIO · El Altar de invocación: 3 columnas de runas. De cada columna se ven 3 runas (las filas 0, 1 y 2) y se
// asoman la de arriba y la de abajo, que son las que entran con un empujón. Tres runas iguales en línea (3 filas, 3 columnas y 2
// diagonales: 8 líneas) invocan a un héroe de esa clase; el comodín vale por cualquiera. Aquí solo se tira, se empuja y se cuentan las
// líneas (y los «casi», el empujón que haría línea, la tirada con línea segura y el Altar de la partida guiada): qué héroe llega y
// cuánto cuesta lo decide la partida (partida.js). Todo puro: el azar se le pasa.
'use strict';
AS.altar = (() => {
  const COMODIN = 'comodin';
  // cada columna guarda 5 runas: [asoma arriba, fila 0, fila 1, fila 2, asoma abajo]
  const VISIBLE = 1, ALTO = 5;
  const LINEAS = [
    { id: 'f0', celdas: [[0, 0], [1, 0], [2, 0]] }, { id: 'f1', celdas: [[0, 1], [1, 1], [2, 1]] }, { id: 'f2', celdas: [[0, 2], [1, 2], [2, 2]] },
    { id: 'c0', celdas: [[0, 0], [0, 1], [0, 2]] }, { id: 'c1', celdas: [[1, 0], [1, 1], [1, 2]] }, { id: 'c2', celdas: [[2, 0], [2, 1], [2, 2]] },
    { id: 'd0', celdas: [[0, 0], [1, 1], [2, 2]] }, { id: 'd1', celdas: [[0, 2], [1, 1], [2, 0]] },
  ];
  const congela = columnas => Object.freeze(columnas.map(c => Object.freeze(c.slice())));
  const runa = (columnas, col, fila) => columnas[col][VISIBLE + fila];

  // una tirada entera: 3 columnas nuevas
  function tira(pesos, azar) {
    return congela([0, 1, 2].map(() => Array.from({ length: ALTO }, () => azar.pesos(pesos))));
  }
  // un empujón: la columna baja (dir 1: entra la runa que asomaba arriba) o sube (dir -1: entra la de abajo); por el otro lado asoma una nueva
  function empuja(columnas, col, dir, pesos, azar) {
    if (!columnas || col < 0 || col > 2 || (dir !== 1 && dir !== -1)) return AS.error('empujon-invalido');
    const c = columnas[col], nueva = azar.pesos(pesos);
    const movida = dir === 1 ? [nueva, c[0], c[1], c[2], c[3]] : [c[1], c[2], c[3], c[4], nueva];
    return AS.ok(congela(columnas.map((x, i) => (i === col ? movida : x))));
  }
  // la clase que forman 3 runas: la de las que no son comodín si coinciden, 'comodin' si las tres lo son, o null
  function claseDe(runas) {
    const fijas = runas.filter(r => r !== COMODIN);
    if (!fijas.length) return COMODIN;
    return fijas.every(r => r === fijas[0]) ? fijas[0] : null;
  }
  // las líneas hechas ahora mismo: [{ id, celdas, clase }]
  function lineas(columnas) {
    const hechas = [];
    for (const l of LINEAS) {
      const clase = claseDe(l.celdas.map(([c, f]) => runa(columnas, c, f)));
      if (clase) hechas.push({ id: l.id, celdas: l.celdas, clase });
    }
    return hechas;
  }
  // tras un empujón solo pagan las líneas que pasan por la columna empujada (las demás ya pagaron con la tirada)
  const lineasDeColumna = (columnas, col) => lineas(columnas).filter(l => l.celdas.some(([c]) => c === col));
  // el pleno: las 9 runas a la vista forman una sola clase (los comodines valen)
  function pleno(columnas) {
    const todas = [];
    for (let c = 0; c < 3; c++) for (let f = 0; f < 3; f++) todas.push(runa(columnas, c, f));
    return claseDe(todas);
  }
  // el empujón que haría línea con lo que ya se ve (la runa que entra por el otro lado no se sabe): { col, dir } o null
  function empujonConLinea(columnas) {
    for (let col = 0; col < 3; col++) for (const dir of [1, -1]) {
      const c = columnas[col], movida = dir === 1 ? ['?', c[0], c[1], c[2], c[3]] : [c[1], c[2], c[3], c[4], '?'];
      if (lineasDeColumna(columnas.map((x, j) => (j === col ? movida : x)), col).length) return { col, dir };
    }
    return null;
  }
  // los «casi»: líneas a las que solo les falla una runa. [{ id, celdas: las dos que casan, falta: la celda que falla, clase }]
  function casi(columnas) {
    const lista = [];
    for (const l of LINEAS) {
      const runas = l.celdas.map(([c, f]) => runa(columnas, c, f));
      if (claseDe(runas)) continue;
      const k = [0, 1, 2].find(i => claseDe(runas.filter((r, j) => j !== i)));
      if (k !== undefined) lista.push({ id: l.id, celdas: l.celdas.filter((x, j) => j !== k), falta: l.celdas[k], clase: claseDe(runas.filter((r, j) => j !== k)) });
    }
    return lista;
  }
  // una tirada con línea segura (la primera de cada partida): si no trae ninguna, una fila entera pasa a ser de una clase
  function conLinea(columnas, pesos, azar) {
    if (lineas(columnas).length) return columnas;
    const clases = { ...pesos };
    delete clases[COMODIN];
    const fila = azar.entero(3), clase = azar.pesos(clases);
    return congela(columnas.map(c => c.map((r, i) => (i === VISIBLE + fila ? clase : r))));
  }
  // el Altar de la primera partida guiada: la fila del medio ya es una línea de luchadores y empujar hacia abajo la columna 2
  // (entra el tanque que asoma arriba) completa la fila de arriba. Ninguna otra línea, para que la mano enseñe una cosa cada vez.
  const GUIA = [['mago', 'tanque', 'luchador', 'asesino', 'tirador'], ['brujo', 'tanque', 'luchador', 'tirador', 'mago'], ['tanque', 'asesino', 'luchador', 'mago', 'tirador']];
  const guia = () => congela(GUIA);
  // lo que cuesta la siguiente invocación de la oleada. mods: { rebaja, gratis } (reliquias)
  function coste(reglas, tiradas, mods) {
    const m = mods || {};
    if (m.gratis && tiradas === 0) return 0;
    return Math.max(1, reglas.coste + reglas.subida * tiradas - (m.rebaja || 0));
  }
  return { COMODIN, LINEAS, tira, empuja, claseDe, lineas, lineasDeColumna, empujonConLinea, casi, conLinea, guia, pleno, coste, runa };
})();
