// Fans of Skate · OPCIONES: una ventana encima del juego con el sonido, el idioma (banderas de core), la cuenta (core) y la versión.
'use strict';
const skOpc = document.createElement('div'); skOpc.id = 'sk-opc'; skOpc.hidden = true; document.getElementById('stage').appendChild(skOpc);
function skAbreOpciones() {
  skOpc.hidden = false;
  skOpc.innerHTML = `<div class="sk-opc-caja">
    <h2 class="sk-niv-t">OPCIONES</h2>
    <div class="opt-list">
      <div class="opt-row"><span><b>Sonido</b></span><button class="btn-ghost ol" id="sk-opc-sonido"></button></div>
      <div class="opt-row"><span><b>Idioma / Language</b><br>Automático: el del navegador. Al cambiarlo se recarga la página.</span><span class="idioma-fl" id="idioma-banderas"></span></div>
    </div>
    <p class="sk-opc-ver">Fans of Skate · versión ${VERSION}</p>
    <button class="btn-big ol" id="sk-opc-ok">LISTO</button></div>`;
  if (window.filaCuenta) skOpc.querySelector('.opt-list').appendChild(window.filaCuenta);
  pintarBanderas(document.getElementById('idioma-banderas'))();
  const pintaSonido = () => { document.getElementById('sk-opc-sonido').textContent = SK_SAVE.muted ? tr('APAGADO') : tr('ENCENDIDO'); };
  pintaSonido();
  document.getElementById('sk-opc-sonido').onclick = () => { SK_SAVE.muted = !SK_SAVE.muted; applyVolume(); skGuarda(); play('select'); pintaSonido(); };
  document.getElementById('sk-opc-ok').onclick = () => { play('select'); skOpc.hidden = true; };
}
