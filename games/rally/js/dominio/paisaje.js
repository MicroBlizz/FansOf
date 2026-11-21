// Fans of Rally · dominio · PAISAJE: dónde va cada adorno de un tramo (árboles, rocas, cactus…) y los arcos de los controles. Los
// reparte a los dos lados de la carretera con un azar fijo (la misma semilla, el mismo bosque) y nunca encima del camino.
// Devuelve una lista ordenada de arriba abajo, que es el orden en que se pintan. Pura.
'use strict';
RA.Paisaje = (() => {
  function azar(semilla) {
    let s = semilla >>> 0 || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function libre(pista, x, y, margen) {
    const c = RA.Pista.cercana(pista, x, y);
    return c.distancia > pista.ancho / 2 + margen;
  }
  function junto(pista, tramo, dado, out) {
    for (let i = 0; i < pista.n; i += Math.round(26 / pista.paso)) {
      for (const lado of [-1, 1]) {
        if (dado() > tramo.densidad) continue;
        const a = pista.ang[i] + Math.PI / 2 * lado, d = pista.ancho / 2 + 18 + dado() * 120;
        const x = pista.x[i] + Math.cos(a) * d, y = pista.y[i] + Math.sin(a) * d;
        if (libre(pista, x, y, 14)) out.push({ tipo: tramo.adornos[Math.floor(dado() * tramo.adornos.length)], x, y, variante: Math.floor(dado() * 4) });
      }
    }
  }
  function lejos(pista, tramo, dado, limites, out) {
    const [x0, y0, x1, y1] = limites, cuantos = Math.round((x1 - x0) * (y1 - y0) / 9000 * tramo.densidad);
    for (let k = 0; k < cuantos; k++) {
      const x = x0 + dado() * (x1 - x0), y = y0 + dado() * (y1 - y0);
      if (libre(pista, x, y, 40)) out.push({ tipo: tramo.adornos[Math.floor(dado() * tramo.adornos.length)], x, y, variante: Math.floor(dado() * 4) });
    }
  }
  function arcos(pista, controles) {
    return [0, ...controles].map((f, k) => {
      const i = Math.round(f * pista.n) % pista.n;
      return { tipo: k === 0 ? 'meta' : 'control', x: pista.x[i], y: pista.y[i], ang: pista.ang[i] };
    });
  }
  // limites: [x0, y0, x1, y1] del mundo; controles: AJUSTES.carrera.controles
  function reparte(pista, tramo, limites, controles, semilla = 7) {
    const dado = azar(semilla), out = [];
    junto(pista, tramo, dado, out);
    lejos(pista, tramo, dado, limites, out);
    out.push(...arcos(pista, controles));
    return out.sort((a, b) => a.y - b.y);
  }
  // el rectángulo que ocupa la pista, con un margen alrededor
  function limites(pista, margen) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < pista.n; i++) { x0 = Math.min(x0, pista.x[i]); y0 = Math.min(y0, pista.y[i]); x1 = Math.max(x1, pista.x[i]); y1 = Math.max(y1, pista.y[i]); }
    return [x0 - margen, y0 - margen, x1 + margen, y1 + margen];
  }
  // lo que ocupa cada adorno al chocar (el tronco o la base, no la copa: se pasa por debajo de las ramas)
  const RADIOS = { arbol: 5, pino: 5, pinoNevado: 5, cactus: 5, palmera: 4, roca: 9, rocaNieve: 9, tronco: 8 };
  const obstaculos = cosas => cosas.filter(c => RADIOS[c.tipo]).map(c => ({ x: c.x, y: c.y, r: RADIOS[c.tipo] }));
  return { reparte, limites, azar, obstaculos, RADIOS };
})();
