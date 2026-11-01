// Fans of Chef · SALAS: cada sala del sótano es una ESCENA ENTERA pintada por Yoshi (img/sala_N.png, la referencia gris que eligió
// Daniel y sus variantes), a media escala (688 × 376). Por dónde se anda lo dice un polígono (`suelo`, en píxeles de la imagen) menos los
// `bloqueos` (cajas); `salidas` son los tramos del borde izquierdo y derecho por los que se pasa a la sala de al lado; `antorchas` dan luz.
// Las coordenadas se sacan a mano mirando la imagen con una rejilla; en el juego, con el modo dev y J+K a la vez se ve el suelo pisable.
'use strict';

const SALAS = [
  { img: 'sala_1', w: 688, h: 376,
    suelo: [[0, 235], [180, 142], [505, 142], [688, 255], [688, 376], [390, 376], [390, 335], [300, 335], [300, 376], [0, 376]],
    bloqueos: [[500, 105, 655, 200]],                       // los cofres del rincón
    salidas: { izq: [238, 376], der: [256, 376] },
    antorchas: [[80, 128], [235, 72], [555, 88]],
    arco: [330, 142],                                       // el arco del fondo: ahí va el montacargas en la primera sala
    cofre: [585, 218] },
];
// mientras no haya más escenas, las jornadas repiten la misma sala (cada una con otros bichos); al llegar sala_2..6 se añaden aquí.

// ¿se puede pisar el punto (x, y) de la sala `s`? Dentro del polígono del suelo y fuera de los bloqueos.
function pisableEn(s, x, y) {
  if (x < 0 || y < 0 || x > s.w || y > s.h) return false;
  for (const b of s.bloqueos) if (x >= b[0] && y >= b[1] && x <= b[2] && y <= b[3]) return false;
  const p = s.suelo; let dentro = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
// un punto al azar del suelo de la sala (para colocar bichos), lejos de `lejosDe` si se da
function puntoSuelo(s, rng, lejosDe, dist = 120) {
  for (let i = 0; i < 200; i++) {
    const x = rng() * s.w, y = rng() * s.h;
    if (!pisableEn(s, x, y) || !pisableEn(s, x - 14, y) || !pisableEn(s, x + 14, y) || !pisableEn(s, x, y - 8)) continue;
    if (lejosDe && Math.hypot(x - lejosDe.x, y - lejosDe.y) < dist) continue;
    return { x, y };
  }
  return { x: s.w / 2, y: s.h * 0.8 };
}
