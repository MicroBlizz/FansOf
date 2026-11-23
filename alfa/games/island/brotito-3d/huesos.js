// Fans of Island · prototipo Brotito 3D, huesos: pasa cada postura del Brotito en lonchas (las de BROTO en adaptadores/arte-personajes.js:
// estirar y aplastar sx/sz y levantar los brazos a) a la colocación de los seis huesos del modelo de Yoshi, con las mismas cuentas que el
// dibujo: el cuerpo se escala desde su base, los brazos van del hombro a la mano y los pies se separan con el ancho. Unidades del dibujo,
// centradas (x = y = 0 en el medio, z = 0 en el suelo, la cara hacia +y). Puro: sin pantalla ni three.js.
'use strict';
{
  const SUELO_CUERPO = 4;
  const mezcla = (a, b, t) => a + (b - a) * t;
  function brazo(p, lado) {
    const rx = 15.5 * p.sx, rz = 11 * p.sz, zc = SUELO_CUERPO + rz;
    return { hombro: [lado * (rx - 3), 3, zc + 1], mano: [lado * mezcla(rx + 1.5, rx + 0.5, p.a), mezcla(3, 4, p.a), mezcla(zc - 5, zc + rz + 2, p.a)] };
  }
  // la colocación de los huesos para una postura { sx, sz, a }
  const huesos = p => Object.freeze({
    cuerpo: { base: [0, 0, SUELO_CUERPO], escala: [p.sx, p.sx, p.sz] },
    brazo_I: brazo(p, -1), brazo_D: brazo(p, 1),
    pie_I: [-6.5 * p.sx, 5, 2], pie_D: [6.5 * p.sx, 5, 2],
  });
  // una postura a medio camino entre dos (t = 0, la primera; t = 1, la segunda)
  const entre = (p, q, t) => ({ sx: mezcla(p.sx, q.sx, t), sz: mezcla(p.sz, q.sz, t), a: mezcla(p.a, q.a, t) });
  // acerca la postura actual a la que toca, más deprisa cuanto mayor es `rapidez` (por segundo); con rapidez 0 salta de golpe, como las lonchas
  const sigue = (actual, objetivo, dt, rapidez) => (rapidez ? entre(actual, objetivo, 1 - Math.exp(-rapidez * dt)) : { ...objetivo });
  IS.Brotito3D = Object.freeze({ huesos, entre, sigue, SUELO_CUERPO });
}
