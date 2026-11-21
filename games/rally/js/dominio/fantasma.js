// Fans of Rally · dominio · FANTASMA: la grabación de una vuelta (posición y morro cada `cada` segundos) y dónde estaba el coche en un
// momento dado, mezclando las dos marcas más cercanas. En la contrarreloj el fantasma de tu mejor vuelta corre contigo. Pura: el
// tiempo lo pone quien la usa.
'use strict';
RA.Fantasma = (() => {
  const nuevo = cada => ({ cada, marcas: [] });
  // apunta la marca del momento t (en segundos desde que empezó la vuelta) si ya toca
  function apunta(g, t, c) {
    if (t >= g.marcas.length * g.cada) g.marcas.push([Math.round(c.x * 10) / 10, Math.round(c.y * 10) / 10, Math.round(c.ang * 1000) / 1000]);
    return g;
  }
  function posicion(g, t) {
    if (!g || !g.marcas || g.marcas.length < 2) return null;
    const f = t / g.cada, i = Math.floor(f);
    if (i >= g.marcas.length - 1) return null;   // el fantasma ya ha llegado
    const a = g.marcas[i], b = g.marcas[i + 1], k = f - i;
    return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, ang: a[2] + RA.difAngulo(a[2], b[2]) * k };
  }
  const valido = g => !!(g && typeof g.cada === 'number' && g.cada > 0 && Array.isArray(g.marcas) && g.marcas.length > 1);
  return { nuevo, apunta, posicion, valido };
})();
