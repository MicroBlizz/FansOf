// Fans of Pop · REGLAS DEL PASE (dominio puro, tarea #166): qué premios del pase están listos para recoger, para el botón
// RECOGER TODO y el punto rojo del lateral. Sin SAVE, reloj, azar ni DOM: el pase y el escalón entran como datos.
// El pase es { premium, gratis: { k: true }, prem: { k: true } } (js/pase.js, ppPaseAlDia).
'use strict';
const PP_PASE_R = Object.freeze({
  // los premios listos hasta el escalón `escalon`, en orden: [{ k, premium }] (de cada escalón, el gratis antes que el dorado).
  // El dorado solo con el pase comprado; lo ya cogido no sale
  listos(pase, escalon) {
    const r = [];
    for (let k = 1; k <= escalon; k++) {
      if (!pase.gratis[k]) r.push(Object.freeze({ k, premium: false }));
      if (pase.premium && !pase.prem[k]) r.push(Object.freeze({ k, premium: true }));
    }
    return Object.freeze(r);
  },
  // la clave con que se apunta cada premio (el servidor no cobra dos veces la misma: js/perlas-libro.js)
  clave: (temporada, premium, k) => `pase:${temporada}:${premium ? 'p' : 'g'}:${k}`
});
