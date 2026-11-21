// Tiny Fans · dominio · COMBATE: la grapadora dispara sola al bicho más cercano dentro de su alcance; con la grapa doble, las grapas de
// más van a otros bichos (si no hay bastantes, se repiten sobre los que hay). Puro. Dueño: N3 (dominio de la expedición).
'use strict';
TN.combate = {
  // el bicho al que dispararía desde (x, z), o null: de una lista [{ id, x, z }]
  objetivo(reglas, x, z, bichos) { return TN.combate.objetivos(reglas, x, z, bichos, 1)[0] || null; },
  // los n blancos de una ráfaga, del más cercano al más lejano, dentro del alcance; con menos bichos que grapas, se repiten
  objetivos(reglas, x, z, bichos, n) {
    const alcance = reglas.arma.grapadora.alcance;
    const cerca = bichos.map(b => ({ b, d: Math.hypot(b.x - x, b.z - z) })).filter(o => o.d <= alcance).sort((a, c) => a.d - c.d || a.b.id - c.b.id);
    if (!cerca.length) return [];
    return Array.from({ length: n }, (_, i) => cerca[i % cerca.length].b);
  },
};
