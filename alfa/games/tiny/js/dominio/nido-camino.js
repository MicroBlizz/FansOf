// Tiny Fans · dominio · NIDO · CAMINO: la regla de que siempre hay un camino de la entrada al almacén (las trampas y las puertas se
// pisan; las paredes no). Búsqueda en anchura por casillas vecinas (sin diagonales). Puro. Dueño: N3 (reglas).
'use strict';
TN.camino = {
  // ¿se llega de una casilla a otra? ocupadas: lista de { col, fila } que no se pueden pisar
  hay(columnas, filas, desde, hasta, ocupadas) {
    const cerrada = new Set(ocupadas.map(c => c.col + ',' + c.fila)), vista = new Set([desde.col + ',' + desde.fila]);
    const cola = [desde];
    while (cola.length) {
      const c = cola.shift();
      if (c.col === hasta.col && c.fila === hasta.fila) return true;
      for (const v of TN.camino.vecinas(columnas, filas, c)) {
        const k = v.col + ',' + v.fila;
        if (vista.has(k) || cerrada.has(k)) continue;
        vista.add(k);
        cola.push(v);
      }
    }
    return false;
  },
  vecinas(columnas, filas, c) {
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dc, df]) => ({ col: c.col + dc, fila: c.fila + df }))
      .filter(v => v.col >= 0 && v.fila >= 0 && v.col < columnas && v.fila < filas);
  },
};
