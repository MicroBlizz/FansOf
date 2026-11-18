// Fans of Spy · DOMINIO · La rejilla de casillas: los resultados con nombre (SPY.ok y SPY.error), las 8 direcciones, distancias,
// la línea de visión entre dos casillas y los caminos (búsqueda en anchura, andando en recto: nunca en diagonal).
// No sabe nada de plantas ni de guardias: quien llama le pasa una función que dice si una casilla tapa la vista o se puede pisar.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  S.ok = (valor) => ({ ok: true, valor });
  S.error = (codigo) => ({ ok: false, codigo });

  // Las 8 direcciones, en el sentido del reloj desde el norte (arriba en el mapa). Las pares son rectas; las impares, diagonales.
  const DIRS = S.congela([{ x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 }]);
  const NOMBRES = S.congela({ N: 0, NE: 1, E: 2, SE: 3, S: 4, SO: 5, O: 6, NO: 7 });
  const RECTAS = S.congela([0, 2, 4, 6]);
  const clave = (x, y) => x + ',' + y;
  const signo = (n) => (n > 0 ? 1 : n < 0 ? -1 : 0);

  // La dirección (0 a 7) que mejor apunta de `a` hacia `b`; si son la misma casilla, la que se pase de repuesto.
  function dirHacia(a, b, repuesto = 0) {
    const sx = signo(b.x - a.x), sy = signo(b.y - a.y);
    const i = DIRS.findIndex((d) => d.x === sx && d.y === sy);
    return i < 0 ? repuesto : i;
  }

  // ¿Hay línea de visión del centro de `a` al centro de `b`? Recorre las casillas que cruza el segmento; las de en medio no pueden
  // tapar la vista (`opaca(x, y)`). Si el segmento pasa justo por una esquina, solo se corta cuando las dos casillas de los lados tapan.
  function lineaLibre(a, b, opaca) {
    const ax = Math.abs(b.x - a.x), ay = Math.abs(b.y - a.y), sx = signo(b.x - a.x), sy = signo(b.y - a.y);
    const pasoX = ax ? 1 / ax : Infinity, pasoY = ay ? 1 / ay : Infinity;
    let x = a.x, y = a.y, tx = pasoX / 2, ty = pasoY / 2;
    while (x !== b.x || y !== b.y) {
      if (Math.abs(tx - ty) < 1e-9) {
        if (opaca(x + sx, y) && opaca(x, y + sy)) return false;
        x += sx; y += sy; tx += pasoX; ty += pasoY;
      } else if (tx < ty) { x += sx; tx += pasoX; } else { y += sy; ty += pasoY; }
      if ((x !== b.x || y !== b.y) && opaca(x, y)) return false;
    }
    return true;
  }

  // Todas las casillas a las que se llega andando desde `desde` en `pasos` pasos o menos (sin límite si no se pasa).
  // Devuelve un mapa: clave de la casilla -> { x, y, d (pasos), de (clave de la casilla anterior) }. Incluye la de salida, con d = 0.
  function alcance(pisable, desde, pasos = Infinity) {
    const visto = new Map([[clave(desde.x, desde.y), { x: desde.x, y: desde.y, d: 0, de: null }]]);
    const cola = [visto.get(clave(desde.x, desde.y))];
    for (let i = 0; i < cola.length; i++) {
      const c = cola[i];
      if (c.d >= pasos) continue;
      for (const r of RECTAS) {
        const x = c.x + DIRS[r].x, y = c.y + DIRS[r].y, k = clave(x, y);
        if (visto.has(k) || !pisable(x, y)) continue;
        const n = { x, y, d: c.d + 1, de: clave(c.x, c.y) };
        visto.set(k, n); cola.push(n);
      }
    }
    return visto;
  }

  // El camino hasta `hasta` dentro de un mapa de alcance: la lista de casillas, sin la de salida y con la de llegada. null si no llega.
  function camino(mapa, hasta) {
    let c = mapa.get(clave(hasta.x, hasta.y));
    if (!c) return null;
    const lista = [];
    while (c.de !== null) { lista.push({ x: c.x, y: c.y }); c = mapa.get(c.de); }
    return lista.reverse();
  }

  // El camino más corto de `desde` hacia `hasta`. Si no se puede llegar, el camino a la casilla alcanzable que queda más cerca.
  function ruta(pisable, desde, hasta) {
    const mapa = alcance(pisable, desde);
    if (mapa.has(clave(hasta.x, hasta.y))) return camino(mapa, hasta);
    let mejor = null;
    for (const c of mapa.values()) {
      const lejos = Math.abs(c.x - hasta.x) + Math.abs(c.y - hasta.y);
      if (!mejor || lejos < mejor.lejos || (lejos === mejor.lejos && c.d < mejor.c.d)) mejor = { c, lejos };
    }
    return camino(mapa, mejor.c);
  }

  S.rejilla = Object.freeze({
    DIRS, NOMBRES, RECTAS, clave, dirHacia, lineaLibre, alcance, camino, ruta,
    igual: (a, b) => a.x === b.x && a.y === b.y,
    cheb: (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)),
    manh: (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y),
    recta: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
    gira: (dir, pasos) => (((dir + pasos) % 8) + 8) % 8,
  });
})(SPY);
