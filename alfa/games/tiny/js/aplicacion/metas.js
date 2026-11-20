// Tiny Fans · aplicación · METAS: la meta del nido que toca (una sola, siempre a medias), su avance y las medidas de «otra más»
// (contadores que se guardan en los extras de la partida: 'metas' y 'medidas'). Escucha los eventos. Puertos: { reglas, sesion, reloj, eventos }.
// Dueño: N13 (primer minuto y metas).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.creaMetas = ({ reglas, sesion, reloj, eventos }) => ({
  // la meta que toca: { id, tiene, pide } o null
  actual() { return null; },
  medidas() { return {}; },
});
