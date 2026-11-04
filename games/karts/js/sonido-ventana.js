// Fans of Karts · VOLUMEN: la ventana en HTML (encima del lienzo) con las dos barras de core, Efectos y Música (OPCIONES.sonido, ADR 037).
// Se abre desde Opciones y desde la pausa del PvP (pantallas.js). Los números viven en AJUSTES (js/ajustes.js).
'use strict';
const CAJA_SONIDO = document.createElement('section'); CAJA_SONIDO.id = 'fok-sonido'; CAJA_SONIDO.className = 'screen modal'; CAJA_SONIDO.hidden = true;
document.body.appendChild(CAJA_SONIDO);
function abreSonido() {
  const barra = campo => [() => AJUSTES[campo], v => { AJUSTES[campo] = v; guardaAjustes(); applyVolume(); }];
  CAJA_SONIDO.innerHTML = '<div class="modal-card"><h3 class="ol">' + tr('SONIDO Y MÚSICA') + '</h3><div class="opt-list"></div><button class="btn-ghost ol" id="fok-sonido-ok">' + tr('VOLVER') + '</button></div>';
  CAJA_SONIDO.querySelector('.opt-list').appendChild(OPCIONES.sonido({ efectos: barra('vol'), musica: barra('mus') }));
  CAJA_SONIDO.hidden = false; UI.toque = null;
  document.getElementById('fok-sonido-ok').onclick = () => { play('select'); CAJA_SONIDO.hidden = true; };
}
