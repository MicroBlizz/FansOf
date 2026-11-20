// Tiny Fans · adaptador · SONIDO: los sonidos de oficina hechos por código (grapadora, clips, cartón, timbre; los gigantes, graves y
// lentos) y la vibración, que se puede apagar. Se apunta solo a los eventos (TN.eventos.oye) y guarda el silencio en el extra 'sonido'
// de la partida. Sin música. Las cuatro funciones sueltas del final son las que pide por su nombre el motor de sonido de core.
// Dueño: N7 (sonido).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.sonido = {
  // toca un sonido por su nombre (el de un evento, o uno de interfaz: 'boton', 'abre', 'cierra', 'sello')
  toca(nombre, datos) {},
  vibra(nombre) {},
  get apagado() { return false; },
  get sinVibrar() { return false; },
  alterna() {},
  alternaVibrar() {},
};
function sonidoApagado() { return TN.sonido.apagado; }
function volGeneral() { return sonidoApagado() ? 0 : AJUSTES.sonido.volumen; }
function volMusica() { return 0; }
function musicUpdate() { /* el prototipo no tiene música */ }
