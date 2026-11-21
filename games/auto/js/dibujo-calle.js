// Fans of Auto · LO QUE SE DIBUJA EN LA CALLE además del barrio: los semáforos de los cruces (un poste en cada esquina con la
// luz del eje que le toca, que de noche brilla), las luces giratorias de los Moderadores, la ambulancia y los bomberos, y el
// agua de la manguera. Se llama desde pintaMundo (dibujo.js).
'use strict';

const COLOR_LUZ = { verde: '#3fdc5a', ambar: '#ffb020', rojo: '#ff3b30' };
// las cuatro esquinas de un cruce y el eje de los coches que llegan por ese lado
const ESQUINAS = [[-1, -1, 'v'], [2, 2, 'v'], [2, -1, 'h'], [-1, 2, 'h']];
function pintaSemaforos(g) {
  const z = J.cam.z, noche = oscuridad() > 0.3, s = Math.max(2, Math.round(2.5 * z));
  for (const q of MAPA.cruces) {
    if (!q.semaforo || !enVista(q.x * T, q.y * T, 60)) continue;
    for (const [dx, dy, eje] of ESQUINAS) {
      const x = sx((q.x + dx) * T + T / 2 + (dx < 0 ? 4 : -4)), y = sy((q.y + dy) * T + T / 2 + (dy < 0 ? 4 : -4));
      const color = COLOR_LUZ[luz(q, eje, S.tick)];
      g.fillStyle = TINTA; g.fillRect(Math.round(x - s / 2) - 1, Math.round(y - s / 2) - 1, s + 2, s + 2);
      g.fillStyle = color; g.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
      if (noche && AJUSTES.detalle !== 'bajo') { g.globalAlpha = 0.25; g.beginPath(); g.arc(x, y, 6 * z, 0, 7); g.fill(); g.globalAlpha = 1; }
    }
  }
}
// las luces que giran: roja y azul los Moderadores y la ambulancia, ámbar los bomberos
function pintaSirenas(g) {
  const z = J.cam.z, par = (S.tick >> 3) & 1;
  for (const c of S.coches) {
    if (!c.sirena || c.chatarra || !enVista(c.x, c.y)) continue;
    g.globalAlpha = 0.5;
    g.fillStyle = c.tipo === 'bomberos' ? (par ? '#ffd23c' : '#ff8a00') : par ? '#ff4040' : '#4080ff';
    g.beginPath(); g.arc(sx(c.x), sy(c.y), 7 * z, 0, 7); g.fill();
    g.globalAlpha = 1;
  }
}
function pintaManguera(g) {
  const z = Math.max(1, Math.round(J.cam.z * 1.5));
  g.fillStyle = '#8fd0ff';
  for (const f of S.fx) if (f.tipo === 'agua') g.fillRect(Math.round(sx(f.x)), Math.round(sy(f.y)), z, z);
}
