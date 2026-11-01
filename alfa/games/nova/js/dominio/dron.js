// Fans Of Nova · NV.Dron: la batería de un dron. Trabajando (cazando o reparando) dura 8 s; orbitando sin hacer nada, 30 s; vacía, el dron se
// guarda en su hueco y tarda 3 s en recargarse del todo. Lo usa nvDrones (armas.js).
'use strict';
NV.Dron = (() => {
  const TRABAJO = 8, ORBITA = 30, RECARGA = 3;
  // Gasta batería; devuelve false si se ha vaciado (y lo deja guardándose)
  function gasta(d, dt, trabaja) {
    d.bat -= dt / (trabaja ? TRABAJO : ORBITA);
    if (d.bat > 0) return true;
    d.bat = 0; d.dock = true;
    return false;
  }
  // Recarga en el hueco; llena, vuelve a salir
  function recarga(d, dt) {
    d.bat += dt / RECARGA;
    if (d.bat >= 1) { d.bat = 1; d.dock = false; }
  }
  return { gasta, recarga, TRABAJO, ORBITA, RECARGA };
})();
