// Fans Of · LIGERO: lo mínimo de core para un juego que lleva su propia partida y sus propias pantallas (Tácticas, Skate) pero quiere
// lo común de cuenta: login/guardado en la nube (cuenta.js, cuenta-pantalla.js) e idioma (idioma.js + banderas). Se pide con NUCLEO.juego({ ligero: true, ... }).
// El juego pone ANTES de esto su AJUSTES (con `id` y `guardado`, la clave de su partida en localStorage) y lo que ya tenga de SAVE;
// y después llama a CUENTA.cambio() cada vez que guarda. Si no define las suyas, aquí van una ventana de confirmación y un aviso sencillos
// (los mismos que usa core/css/menus.css: #scr-confirm y #toast). Un juego con sus propias ventanas define confirmBox, cerrarConfirmBox
// (los botones llevan los id cf-ok y cf-no, que cuenta.js retoca) y toast.
'use strict';
const SAVE_KEY = AJUSTES.guardado;
if (typeof enPartida === 'undefined') window.enPartida = () => false;   // cuenta-pantalla y toast preguntan si se está jugando
if (typeof confirmBox === 'undefined') {
  const html = '<section id="scr-confirm" class="screen modal" hidden><div class="modal-card"><h3 class="ol" id="cf-title"></h3><div class="cf-body" id="cf-body"></div><div class="row" id="cf-btns"></div></div></section><div id="toast" role="status" aria-live="polite"></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  window.cerrarConfirmBox = () => { $('#scr-confirm').hidden = true; };
  window.confirmBox = function (title, html, okTxt, onOk, noTxt) {
    $('#cf-title').textContent = title; $('#cf-body').innerHTML = html;
    $('#cf-btns').innerHTML = okTxt ? `<button class="btn-ghost ol btn-ok" id="cf-ok">${okTxt}</button><button class="btn-ghost ol" id="cf-no">${tr('MEJOR NO')}</button>` : `<button class="btn-ghost ol" id="cf-no">${noTxt || tr('VAYA')}</button>`;
    $('#scr-confirm').hidden = false;
    const cierra = cerrarConfirmBox;
    $('#cf-no').onclick = () => { play('select'); cierra(); };
    if (okTxt) $('#cf-ok').onclick = () => { cierra(); onOk(); };
  };
  let temporizador = null;
  window.toast = function (msg, bien) { const t = $('#toast'); t.textContent = msg; t.classList.toggle('good', !!bien); t.classList.add('show'); clearTimeout(temporizador); temporizador = setTimeout(() => t.classList.remove('show'), 2400); };
}
