// Tiny Fans · aplicación · CASOS DE USO DEL ASALTO: entrar (si está abierto), dar un paso y terminar (con botín al almacén, o sin nada).
// Puertos: { reglas, sesion, reloj, eventos }. Dueño: N12 (pantalla del asalto).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.creaCasosAsalto = ({ reglas, sesion, reloj, eventos }) => ({
  get abierto() { return sesion.partida.asaltoAbierto; },
  get enCurso() { return false; },
  entra() { return TN.error('asalto-cerrado'); },
  paso(entrada) { return []; },
  foto() { return null; },
});
