// Fans of Island · adaptadores/dibujo-base: lo que comparten todas las piezas del dibujo (IS.Dibujo): pasar una altura y una profundidad
// del mundo a una fila de la pantalla (sy), saber si algo está cerca de la cámara, dar la vuelta a un valor para que los fondos se repitan,
// y pintar un bloque de lonchas (pieza) o un ente girado con su sombra (ente). Todas reciben la vista v (adaptadores/dibujo.js).
'use strict';
{
  const { K, girada } = IS.Lonchas;
  const sy = (v, y, z) => v.L.base + Math.round(y * K) - Math.round(z) + v.cz;
  const cerca = (v, x, margen) => Math.abs(x - v.cx - v.L.vw / 2) < v.L.vw / 2 + margen;
  const vuelta = (n, per, resta) => (((n % per) + per) % per) - resta;
  function pieza(v, q, x, y0, zb) { v.ctx.drawImage(q.c, Math.round(x) - q.m, sy(v, y0, zb) - (q.al - 1) - q.m); }   // un bloque de lonchas con su fondo y0 y su base zb
  function sombraPix(ctx, x, y, rx) {
    const ry = Math.max(1, Math.round(rx * K));
    ctx.fillStyle = 'rgba(42,24,48,0.30)';
    for (let r = -ry; r <= ry; r++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (r / (ry + 0.5)) ** 2)));
      if (w > 0) ctx.fillRect(x - w, y + r, 2 * w, 1);
    }
  }
  function ente(v, p, giro, x, y, z, sombra) {   // una pila girada en su sitio, con su sombra en el suelo si se pide
    const s = girada(p, giro), sx = Math.round(x - v.cx);
    if (sombra) {
      const g = v.fisica.sueloDe({ x, z: z + 0.5 }, 4);
      if (g > -Infinity && z - g < 160) sombraPix(v.ctx, sx, sy(v, y, g), Math.round(sombra * Math.max(0.45, 1 - (z - g) / 140)));
    }
    v.ctx.drawImage(s.c, sx - (s.c.width >> 1), sy(v, y, z) - s.suelo);
  }
  IS.Dibujo = { sy, cerca, vuelta, pieza, ente };
}
