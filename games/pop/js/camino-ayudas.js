// Fans of Pop · LAS AYUDAS DEL CAMINO (dominio puro; tarea #267, boceto B + C de Pepins, 20-11-2026): qué ayudas se enseñan en la
// columna de la izquierda del camino y qué lleva cada una en su insignia (cuántas tienes o, si no te queda ninguna, su precio en perlas).
// Sin DOM, sin SAVE y sin reloj: lo pinta js/camino-barra.js.
'use strict';
const PP_CAMINO = Object.freeze((() => {
  // el orden del boceto: primero las de los niveles, luego las de los duelos (la lupa de Lola antes que deshacer)
  const DE_NIVELES = Object.freeze(['martillo', 'bomba', 'toques3']), DE_DUELOS = Object.freeze(['pista', 'deshacer']);
  // las que se ven: las de los niveles desde que sale su barra; las de los duelos desde que se abren los duelos
  const ayudas = (verNiveles, verDuelos) => Object.freeze([...(verNiveles ? DE_NIVELES : []), ...(verDuelos ? DE_DUELOS : [])]);
  const cuenta = n => (Number.isInteger(n) && n > 0 ? n : 0);
  // la insignia: { tipo: 'cuantas', n } si te queda alguna; si no, { tipo: 'precio', n: perlas }
  const insignia = (tengo, precio) => Object.freeze(cuenta(tengo) ? { tipo: 'cuantas', n: cuenta(tengo) } : { tipo: 'precio', n: cuenta(precio) });
  return { ayudas, insignia };
})());
if (typeof module !== 'undefined') module.exports = PP_CAMINO;
