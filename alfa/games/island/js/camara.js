// Fans of Island · CÁMARA: una sola para los dos, que mira al punto medio y nunca deja a nadie fuera. Si se separan más de lo que da
// la cuerda de hilo, el rezagado es arrastrado hacia el otro (el tirón). También recorta al borde del nivel.
'use strict';
const IS_CAM = { x: 0, y: 0 };
function isCamaraColoca(m, a, b, W) { IS_CAM.x = clamp((isCentro(a).x + isCentro(b).x) / 2 - W / 2, 0, Math.max(0, m.ancho - W)); IS_CAM.y = 0; }
function isCamaraSigue(m, a, b, W, dt) {
  const objetivo = clamp((isCentro(a).x + isCentro(b).x) / 2 - W / 2, 0, Math.max(0, m.ancho - W));
  IS_CAM.x = lerp(IS_CAM.x, objetivo, 1 - Math.exp(-7 * dt));
}
function isTironDeCuerda(a, b) {
  if (a.estado !== 'normal' || b.estado !== 'normal' || a.llevadoPor || b.llevadoPor) return;
  const d = isCentro(b).x - isCentro(a).x;
  if (Math.abs(d) <= IS_C.cuerda) return;
  const rezagado = a.x < b.x ? a : b, otro = rezagado === a ? b : a, sobra = Math.abs(d) - IS_C.cuerda;
  rezagado.x += Math.sign(otro.x - rezagado.x) * sobra; rezagado.suelo = false; rezagado.plataforma = null;
  if (rezagado.vy > 0) rezagado.vy = 0;
  // si el tirón lo mete dentro de un bloque, la cuerda lo trae en burbuja hasta el otro (si no, se quedaría clavado)
  if (IS_P.mundo.plataformas.some(pl => pl.solida && isSolapa(rezagado, pl))) isABurbuja(rezagado, otro);
}
