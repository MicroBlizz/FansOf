// Fans Of Pets · adaptador · SONIDO: los efectos del motor de sonido de core (play) y el interruptor de silencio, que se guarda con la partida.
// Las cuatro funciones sueltas de abajo son las que pide el motor de core (ganchos por nombre); Pets aún no tiene música.
'use strict';
PT.creaSonido = almacen => ({
  toca(nombre = 'select') { if (typeof play === 'function') play(nombre); },
  get apagado() { return !!almacen.leeExtra('muted'); },
  alterna() { almacen.escribeExtra('muted', !this.apagado); },
});
function sonidoApagado() { return PT.sonido ? PT.sonido.apagado : false; }
function volGeneral() { return sonidoApagado() ? 0 : 1; }
function volMusica() { return 0; }
function musicUpdate() { /* Pets aún no tiene música */ }
