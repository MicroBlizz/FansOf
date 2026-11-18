// Fans of Pop · CHISPAS (tarea #110, «vida al hacer pop»): las cuentas de las chispas de cada pop, del botecito de la bandeja y
// del confeti de fin de nivel. Dominio puro: sin pantalla, sin reloj y sin azar suelto (el azar entra por parámetro, una función
// que da un número de 0 a 1). Devuelve partículas con la misma forma que las de PP_FX.parts (js/efectos.js), que las mueve y pinta.
'use strict';
const PP_CHISPAS = (() => {
  // pastel: blanco, amarillo, rosa, azul cielo y verde menta (nada de gris ni lila)
  const COLORES = Object.freeze(['#ffffff', '#fff3a0', '#ffb3d9', '#9fdcff', '#a8f0c6']);
  const VIDA = 0.45, TOPE = 400, BOTE_DUR = 0.18, BOTE_PX = 5, VUELTA = Math.PI * 2;
  const entre = (azar, a, b) => a + azar() * (b - a);

  // las chispas de UN pop: de 6 a 8, repartidas en círculo desde el centro de la burbuja, sin gravedad
  function chispas(cx, cy, azar) {
    const n = 6 + Math.min(2, Math.floor(azar() * 3)), giro = azar() * VUELTA, res = [];
    for (let k = 0; k < n; k++) {
      const a = giro + k * VUELTA / n, v = entre(azar, 150, 230);
      res.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: entre(azar, 2.5, 4.5), t: 0, vida: VIDA, g: 0, col: COLORES[k % COLORES.length] });
    }
    return res;
  }

  // el confeti de fin de nivel: de 60 a 80 papelitos que caen despacio desde encima de la pantalla, a lo ancho
  function confeti(ancho, azar) {
    const n = 60 + Math.min(20, Math.floor(azar() * 21)), res = [];
    for (let k = 0; k < n; k++) {
      res.push({ x: entre(azar, 0, ancho), y: entre(azar, -160, -10), vx: entre(azar, -60, 60), vy: entre(azar, 120, 320), r: entre(azar, 4, 8), t: 0, vida: entre(azar, 1.6, 2.6), g: 260, col: COLORES[k % COLORES.length] });
    }
    return res;
  }

  // el botecito de la bandeja: cuántos píxeles de diseño baja el tablero a los t segundos del toque (baja y vuelve; fuera de tiempo, 0)
  function bote(t) {
    if (!(t >= 0) || t >= BOTE_DUR) return 0;
    return BOTE_PX * Math.sin(t / BOTE_DUR * Math.PI);
  }

  // el tope de partículas vivas: si hay más, se quedan las más nuevas (las últimas de la lista)
  function recorta(parts, tope = TOPE) {
    return parts.length > tope ? parts.slice(parts.length - tope) : parts;
  }

  return Object.freeze({ COLORES, VIDA, TOPE, BOTE_DUR, BOTE_PX, chispas, confeti, bote, recorta });
})();
