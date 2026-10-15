// Fans of Karts · RELIEVE DE CADA PISTA: arcos que pasan por encima, un túnel (arcos muy seguidos), filas de adornos que hacen de pared
// a los lados y monumentos gigantes en el campo. Se añade a lo que ya pone cada pista (envuelve su `cosas`), así cada pista sigue en
// su archivo. Las posiciones de arcos y túneles van en fracción de vuelta (0–1) y se apartan solas de rampas y huecos.
'use strict';

const RELIEVE = {
  oficinas: { arco: 'arcoOficinas', arcos: [0.2, 0.5, 0.78], tunel: [0.6, 0.66], filas: [['archivador', 0.3, 0.38, 26, 12], ['fuente', 0.86, 0.94, 30, 12]], hitos: ['granPlanta', 'granPlanta'] },
  tutorial: { arco: 'arcoTutorial', arcos: [0.29, 0.72, 0.88], filas: [['zanahoria', 0.14, 0.19, 22, 14], ['zanahoria', 0.6, 0.65, 22, 14]], hitos: ['granZanahoria', 'granVaca', 'granZanahoria'] },
  playa: { arco: 'arcoPlaya', arcos: [0.18, 0.46, 0.8], filas: [['palmera', 0.24, 0.36, 30, 14], ['palmera', 0.62, 0.72, 30, 14]], hitos: ['granCastillo', 'granPalmera', 'granCastillo'] },
  parque: { arco: 'arcoParque', arcos: [0.12, 0.34, 0.56, 0.86], tunel: [0.68, 0.74], filas: [['globos', 0.4, 0.5, 26, 12]], hitos: ['granTiovivo', 'granTiovivo'] },
  centro: { arco: 'arcoCentro', arcos: [0.3, 0.62, 0.9], tunel: [0.4, 0.47], filas: [['maniqui', 0.7, 0.8, 18, 10], ['expositor', 0.12, 0.2, 22, 10]], hitos: ['granManiqui', 'granManiqui'] },
  desierto: { arco: 'arcoDesierto', arcos: [0.24, 0.52, 0.86], filas: [['cactus', 0.62, 0.74, 30, 16]], hitos: ['granCactus', 'granCraneo', 'granCactus'] },
  cementerio: { arco: 'arcoCementerio', arcos: [0.06, 0.42, 0.8], filas: [['lapida', 0.5, 0.58, 18, 10], ['cruz', 0.66, 0.72, 18, 10]], hitos: ['granLapida', 'granLapida'] },
  minas: { arco: 'arcoMinas', arcos: [0.62, 0.9], tunel: [0.3, 0.42], filas: [['gema', 0.72, 0.8, 22, 8]], hitos: ['granGema', 'granGema'] },
  estadio: { arco: 'arcoEstadio', arcos: [0.12, 0.5, 0.74, 0.9], filas: [['foco', 0.2, 0.32, 40, 14], ['altavoz', 0.56, 0.66, 26, 10]], hitos: ['granCopa'] },
  nieve: { arco: 'arcoNieve', arcos: [0.1, 0.72, 0.9], tunel: [0.3, 0.38], filas: [['pino', 0.76, 0.86, 22, 12], ['pino', 0.02, 0.08, 22, 12]], hitos: ['granMuneco', 'granPino', 'granMuneco'] },
  fosa: { arco: 'arcoFosa', arcos: [0.12, 0.56, 0.86], tunel: [0.66, 0.72], filas: [['alga', 0.2, 0.3, 18, 10], ['coral', 0.74, 0.82, 22, 10]], hitos: ['granAncla', 'granCofre'] },
  volcan: { arco: 'arcoVolcan', arcos: [0.06, 0.48, 0.88], tunel: [0.22, 0.28], hitos: ['granFumarola', 'granFumarola'] },
  nube: { arco: 'arcoNube', arcos: [0.12, 0.46, 0.92], hitos: ['granRack', 'granRack'] },
  selva: { arco: 'arcoSelva', arcos: [0.06, 0.4, 0.86], tunel: [0.56, 0.64], filas: [['ceiba', 0.12, 0.22, 34, 14], ['helecho', 0.44, 0.52, 18, 8]], hitos: ['granSeta', 'granSeta'] },
  hype: { arco: 'arcoHype', arcos: [0.06, 0.3, 0.8], tunel: [0.44, 0.5], filas: [['farolaneon', 0.12, 0.26, 24, 10], ['farolaneon', 0.84, 0.94, 24, 10]], hitos: ['granHolograma', 'granHolograma'] },
  castillo: { arco: 'arcoCastillo', arcos: [0.04, 0.5, 0.92], tunel: [0.25, 0.31], filas: [['estandarte', 0.36, 0.46, 24, 8]], hitos: ['granTorre', 'granTorre'] },
  torre: { arco: 'arcoTorre', arcos: [0.22, 0.52, 0.94], hitos: ['granEstatua'] },
};

// ¿se puede poner un arco en f? Ni sobre una rampa o un hueco, ni donde la pista es más ancha que el arco
function arcoCabe(P, f, fig) {
  for (let d = -40; d <= 40; d += 4) {
    const p = enVia(P, f + d / P.largo), s = supEn(P, p.x, p.y);
    if (s === S_RAMPA || s === S_VACIO) return false;
    if (p.ancho / 2 + 3 > fig.def.medio - 6) return false;
  }
  return true;
}
function arcoEn(P, l, id, f) {
  const fig = figCosa(id);
  for (const ff of [f, f + 0.02, f - 0.02, f + 0.04]) if (arcoCabe(P, ff, fig)) { const p = enVia(P, ff); l.push({ x: p.x, y: p.y, fig, r: 0, dmin: CAM_ATRAS + 9 }); return true; }
  return false;
}
// filas de adornos iguales a los dos lados, cada `paso` unidades, a `d` del borde: hacen de pared
function filaEn(P, l, id, f0, f1, paso, d) {
  for (let s = f0 * P.largo; s < f1 * P.largo; s += paso) for (const lado of [-1, 1]) {
    const f = s / P.largo, v = enVia(P, f), p = enVia(P, f, lado * (v.ancho / 2 + d));
    if (supEn(P, p.x, p.y) === S_PISTA || estorbaAtajo(P, p)) continue;
    l.push({ x: p.x, y: p.y, fig: figCosa(id), r: 3.4, flota: 0, fase: 0 });
  }
}
// monumentos: se buscan sitios lejos de la pista (en el campo de dentro o de fuera), separados entre sí
function hitosEn(P, l, ids) {
  const sitios = [], az = azarDe(P.N * 7 + 1);
  for (const id of ids) {
    const fig = figCosa(id), R = fig.def.medio;
    let mejor = null, nota = -1;
    for (let k = 0; k < 220; k++) {
      const x = 60 + az() * 904, y = 60 + az() * 904;
      let dmin = 1e9;
      for (const v of P.via) { const d = Math.hypot(v.x - x, v.y - y) - v.ancho / 2; if (d < dmin) dmin = d; }
      if (dmin < R + 26 || dmin > R + 90 || estorbaAtajo(P, { x, y })) continue;     // ni encima de la pista (o de un atajo) ni tan lejos que no se vea
      let lejos = 1e9; for (const s of sitios) lejos = Math.min(lejos, Math.hypot(s.x - x, s.y - y));
      const n = Math.min(lejos, 600) - dmin * 0.5;
      if (n > nota) { nota = n; mejor = { x, y }; }
    }
    if (mejor) { sitios.push(mejor); l.push({ x: mejor.x, y: mejor.y, fig, r: R * 0.55, flota: 0, fase: 0 }); }
  }
}
// las cuestas de cada pista (alto de las colinas en unidades y cuántas hay en una vuelta): solo cambian cómo se ve el horizonte
const COLINAS = { tutorial: [5, 2, 5], oficinas: [2, 3, 7], playa: [6, 2, 5], parque: [8, 3, 7], centro: [3, 4, 9], desierto: [11, 3, 5], cementerio: [6, 2, 6], minas: [5, 4, 7],
  estadio: [2, 2, 4], nieve: [11, 2, 6], fosa: [7, 3, 5], volcan: [9, 2, 7], nube: [6, 3, 8], selva: [8, 4, 6], hype: [6, 3, 7], castillo: [7, 2, 5], torre: [4, 3, 6] };
for (const def of PISTAS) {
  const C = COLINAS[def.id]; if (C) def.colinas = { a: C[0], n1: C[1], n2: C[2], p1: def.id.length, p2: def.id.charCodeAt(0) / 10 };
  const R = RELIEVE[def.id]; if (!R) continue;
  const original = def.cosas;
  def.cosas = P => {
    const l = original ? original(P) : [];
    for (const f of R.arcos || []) arcoEn(P, l, R.arco, f);
    if (R.tunel) for (let s = R.tunel[0] * P.largo; s < R.tunel[1] * P.largo; s += 26) arcoEn(P, l, R.arco, s / P.largo);
    for (const [id, f0, f1, paso, d] of R.filas || []) filaEn(P, l, id, f0, f1, paso, d);
    hitosEn(P, l, R.hitos || []);
    return l;
  };
}
