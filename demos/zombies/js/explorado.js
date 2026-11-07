// Fans of Zombies · LO EXPLORADO (dominio): las casillas de 8 m que ya has visto, para pintar el mapa (M). Como el mundo no tiene borde
// (ADR 073), se apuntan sueltas por su clave «i,j» en e.vistos (solo las vistas), y viajan con la partida guardada. Solo se recalcula al
// cambiar de casilla. Las partidas de antes (una lista de 0 y 1 del distrito, e.explorado) se pasan a claves al cargar (Z.pasaExplorado).
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const casilla = (X, v) => Math.floor(v / X.celda);
  Z.marcaExplorado = function (AJ, e, x, z) {
    const X = AJ.explorado, i = casilla(X, x), j = casilla(X, z), k = i + ',' + j;
    e.vistos = e.vistos || {};
    if (k === e.ultimaCasilla) return;
    e.ultimaCasilla = k;
    const r = Math.ceil(X.vista / X.celda);
    for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) if (Math.hypot(di, dj) * X.celda <= X.vista + X.celda / 2) e.vistos[(i + di) + ',' + (j + dj)] = 1;
  };
  Z.visto = (AJ, e, x, z) => !!(e.vistos && e.vistos[casilla(AJ.explorado, x) + ',' + casilla(AJ.explorado, z)]);
  // la lista vieja (x0 -214, z0 -66, 39 x 33 casillas) a claves sueltas
  Z.pasaExplorado = function (e) {
    if (!Array.isArray(e.explorado)) return;
    e.vistos = e.vistos || {};
    e.explorado.forEach((v, n) => { if (v) e.vistos[Math.floor((-214 + (n % 39) * 8 + 4) / 8) + ',' + Math.floor((-66 + Math.floor(n / 39) * 8 + 4) / 8)] = 1; });   // por el centro de cada casilla vieja
    delete e.explorado; e.ultimaCasilla = null;
  };
})(ZOM);
