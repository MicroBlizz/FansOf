// Fans of Rumble · Brillos (v0.9.72): las zonas del campo se pintan con un degradado suave del color de cada cosa,
// como el cono de MeerCat: más fuerte en el centro, un borde que brilla un poco y se desvanece hacia fuera. Sin rayas ni puntitos.
// Lo usan los hechizos (al apuntar y al caer), el aura de algunas unidades, el aro del líder, la ralentización y los avisos de los campos.
'use strict';
const RGB_DE = {};
function rgbOf(col) {
  if (RGB_DE[col]) return RGB_DE[col];
  let h = String(col || '#ffffff').replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return (RGB_DE[col] = isNaN(n) ? [255, 255, 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
}
// c: el lienzo · (x, y) centro · r radio · col color · a fuerza (0-1) · sy aplastado (1 = círculo; menos de 1 = en el suelo)
function glowArea(c, x, y, r, col, a, sy) {
  if (!(a > 0) || !(r > 0)) return;
  const [R, Gr, B] = rgbOf(col), k = (f, v) => `rgba(${R},${Gr},${B},${Math.min(1, f * a).toFixed(3)})`;
  c.save(); c.translate(x, y); c.scale(1, sy || 1);
  const g = c.createRadialGradient(0, 0, r * 0.04, 0, 0, r);
  g.addColorStop(0, k(0.32)); g.addColorStop(0.7, k(0.17)); g.addColorStop(0.9, k(0.34)); g.addColorStop(1, k(0));
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); c.restore();
}
