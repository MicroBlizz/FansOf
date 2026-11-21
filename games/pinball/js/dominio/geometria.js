// Fans of Pinball · dominio · GEOMETRÍA: lo justo para que la bola (un círculo) choque con segmentos, círculos y palas (cápsulas que
// giran). Sin basura: el punto más cercano y la normal del último choque se guardan en objetos reutilizados (PB.geo.P y PB.geo.N), que
// valen hasta la siguiente llamada. Separar siempre saca la bola por la normal, desde el punto más cercano hacia el centro de la bola:
// como en cada subpaso nada se acerca más de medio radio, el centro nunca ha cruzado al otro lado y la bola sale por donde llegó.
'use strict';
PB.geo = (() => {
  const P = { t: 0, x: 0, y: 0 };
  const N = { x: 0, y: -1 };
  // el punto del segmento a-b más cercano a (px, py): deja en P su posición y el parámetro t (0 en a, 1 en b)
  function cercano(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
    t = Math.min(1, Math.max(0, t));
    P.t = t; P.x = ax + t * dx; P.y = ay + t * dy;
    return P;
  }
  // distancia al cuadrado de (px, py) al segmento a-b (deja el punto en P)
  function dist2Segmento(px, py, ax, ay, bx, by) {
    cercano(px, py, ax, ay, bx, by);
    const dx = px - P.x, dy = py - P.y;
    return dx * dx + dy * dy;
  }
  // ¿la bola se solapa con un círculo de centro (cx, cy) y radio `radio`? (radio 0: un punto)
  function toca(b, cx, cy, radio) {
    const dx = b.x - cx, dy = b.y - cy, lim = b.r + radio;
    return dx * dx + dy * dy < lim * lim;
  }
  // deja en N la normal de (cx, cy) hacia la bola
  function normal(b, cx, cy) {
    const dx = b.x - cx, dy = b.y - cy, d = Math.sqrt(dx * dx + dy * dy);
    if (d > 1e-9) { N.x = dx / d; N.y = dy / d; } else { N.x = 0; N.y = -1; }
    return d;
  }
  // velocidad con que la bola se acerca a (cx, cy), que se mueve a (vcx, vcy): positiva si se acercan
  function impacto(b, cx, cy, vcx, vcy) {
    normal(b, cx, cy);
    return -((b.vx - vcx) * N.x + (b.vy - vcy) * N.y);
  }
  // saca la bola del círculo (cx, cy, radio) por la normal y refleja su velocidad relativa con el rebote dado. Devuelve la velocidad
  // de acercamiento que traía (0 si ya se alejaba)
  function rebota(b, cx, cy, radio, vcx, vcy, rebote) {
    normal(b, cx, cy);
    const lim = b.r + radio;
    b.x = cx + N.x * lim; b.y = cy + N.y * lim;
    const vn = (b.vx - vcx) * N.x + (b.vy - vcy) * N.y;
    if (vn >= 0) return 0;
    b.vx -= (1 + rebote) * vn * N.x; b.vy -= (1 + rebote) * vn * N.y;
    return -vn;
  }
  const rapidez = b => Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  // recorta la velocidad de la bola al tope
  function limita(b, tope) {
    const v = rapidez(b);
    if (v > tope) { b.vx *= tope / v; b.vy *= tope / v; }
  }
  return { P, N, cercano, dist2Segmento, toca, normal, impacto, rebota, rapidez, limita };
})();
