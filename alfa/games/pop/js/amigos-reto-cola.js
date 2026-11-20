// Fans of Pop · COLA DE RETOS DE AMIGOS, lo puro (tarea #145, ADR 189): los retos que llegan en el latido y no se pueden enseñar todavía (estás
// jugando o con otra ventana abierta) esperan aquí. Un reto vale 5 minutos desde que LLEGA (el servidor ya descarta los suyos a los 5 minutos, así
// que de verdad caduca antes): pasado ese tiempo no se enseña. Sin reloj ni DOM: el reloj (ms) lo pasa quien llama. La cola es un array
// congelado de { ok, codigo, nombre, sala, llego } y nunca se modifica: cada función devuelve una nueva. La pantalla está en js/amigos-reto.js.
'use strict';
const PP_AMIGOS_RETO_COLA = (() => {
  const CADUCA_MS = 5 * 60 * 1000;
  const vacia = () => Object.freeze([]);
  const vivo = (r, ahora) => ahora - r.llego < CADUCA_MS;
  // quita los caducados
  const vigentes = (cola, ahora) => Object.freeze(cola.filter(r => vivo(r, ahora)));
  // suma los retos buenos ({ ok:true, codigo, nombre, sala }) con su hora de llegada; el mismo amigo y sala no se repite
  function anade(cola, retos, ahora) {
    const nueva = [...vigentes(cola, ahora)];
    for (const r of Array.isArray(retos) ? retos : []) {
      if (!r || !r.ok || nueva.some(x => x.codigo === r.codigo && x.sala === r.sala)) continue;
      nueva.push(Object.freeze({ ok: true, codigo: r.codigo, nombre: r.nombre, sala: r.sala, llego: ahora }));
    }
    return Object.freeze(nueva);
  }
  // el siguiente que se puede enseñar (el más antiguo vivo) y lo que queda; sin ninguno, reto null
  function siguiente(cola, ahora) {
    const v = vigentes(cola, ahora);
    return Object.freeze({ reto: v.length ? v[0] : null, resto: Object.freeze(v.slice(1)) });
  }
  return Object.freeze({ CADUCA_MS, vacia, vigentes, anade, siguiente });
})();
if (typeof module !== 'undefined') module.exports = PP_AMIGOS_RETO_COLA;
