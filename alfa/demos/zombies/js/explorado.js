// Fans of Zombies · LO EXPLORADO (dominio): las casillas del distrito (AJ.explorado) que ya has visto, para pintar el mapa (M). Se
// guarda con la partida como una lista de 0 y 1. Solo se recalcula al cambiar de casilla.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.marcaExplorado = function (AJ, e, x, z) {
    const X = AJ.explorado, i = Math.floor((x - X.x0) / X.celda), j = Math.floor((z - X.z0) / X.celda), k = j * X.w + i;
    if (!e.explorado || e.explorado.length !== X.w * X.h) e.explorado = new Array(X.w * X.h).fill(0);
    if (k === e.ultimaCasilla) return;
    e.ultimaCasilla = k;
    const r = Math.ceil(X.vista / X.celda);
    for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
      const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= X.w || nj >= X.h || Math.hypot(di, dj) * X.celda > X.vista + X.celda / 2) continue;
      e.explorado[nj * X.w + ni] = 1;
    }
  };
  Z.visto = (AJ, e, x, z) => { const X = AJ.explorado, i = Math.floor((x - X.x0) / X.celda), j = Math.floor((z - X.z0) / X.celda); return !!(e.explorado && e.explorado[j * X.w + i]); };
})(ZOM);
