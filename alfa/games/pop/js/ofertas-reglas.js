// Fans of Pop · REGLAS DE LAS OFERTAS CON RELOJ (dominio puro; tarea #187). Sin SAVE, reloj, azar, DOM ni textos: entran la oferta
// de PP_CFG.ofertas (js/ajustes.js), la marca guardada de su primera aparición (`marca`, en ms), si ya se compró y la hora (`ahora`,
// en ms), y salen cifras y sí o no. Reglas:
// · Una oferta con `horas` dura eso desde la primera vez que sale y después ya no se ve nunca más. Sin `horas` no caduca.
// · Lo que ya se compró no se ve.
// · El segundo pack (con `mundo`, índice desde 0) sale cuando el camino llega a ese mundo.
// · El lote de hoy (tarea #266) va por turnos, uno cada día.
// Lo que guarda y pinta está en js/ofertas.js.
'use strict';
const PP_OFERTAS_R = (() => {
  const MS_HORA = 3600000;
  const hayMarca = marca => Number.isFinite(marca);
  // cuándo empieza a contar: la marca guardada o, si aún no ha salido nunca, ahora
  const desde = (marca, ahora) => (hayMarca(marca) ? marca : ahora);
  // lo que dura en ms (Infinity si no caduca)
  const duracion = oferta => (oferta && oferta.horas > 0 ? oferta.horas * MS_HORA : Infinity);
  // los ms que le quedan: Infinity si no caduca, toda su duración si aún no ha salido y nunca más que su duración (reloj atrasado)
  function queda(oferta, marca, ahora) {
    const d = duracion(oferta);
    if (d === Infinity || !hayMarca(marca)) return d;
    return Math.min(d, Math.max(0, marca + d - ahora));
  }
  // si se ve: sin comprar y con tiempo (una que aún no ha salido se ve, y al salir empieza a contar)
  const visible = ({ oferta, marca, comprada, ahora }) => !comprada && queda(oferta, marca, ahora) > 0;
  // si el camino (índice del mundo en que está, desde 0) ya ha llegado al mundo de la oferta
  const llegaMundo = (oferta, mundo) => Boolean(oferta) && Number.isInteger(oferta.mundo) && mundo >= oferta.mundo;
  // la oferta de un mundo: se ve si el camino ya llegó a él y además se ve por lo demás
  const visibleMundo = e => llegaMundo(e.oferta, e.mundo) && visible(e);
  // tarea #266 · el LOTE DE HOY: cada día (`dia`, número de días desde 1970) toca el siguiente de la lista, el mismo para todos ese
  // día y sin azar; null sin lotes. No es más barato: solo se enseña primero
  function loteDeHoy(lotes, dia) {
    const n = (lotes || []).length;
    if (!n || !Number.isInteger(dia)) return null;
    return lotes[((dia % n) + n) % n];
  }
  return Object.freeze({ desde, duracion, queda, visible, llegaMundo, visibleMundo, loteDeHoy });
})();
