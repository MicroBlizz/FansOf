// Fans of Karts (prototipo) · CUENTA: la ventana en HTML (encima del lienzo) con la fila de cuenta de core (guardar con Google o email,
// entrar, cerrar sesión, borrar: core/js/sistema/cuenta-pantalla.js la deja en window.filaCuenta). Se abre desde Opciones (pantallas.js).
'use strict';
const CAJA_CUENTA = document.createElement('section'); CAJA_CUENTA.id = 'fok-cuenta'; CAJA_CUENTA.className = 'screen modal'; CAJA_CUENTA.hidden = true;
document.body.appendChild(CAJA_CUENTA);
function abreCuenta() {
  if (!window.filaCuenta) return;
  CAJA_CUENTA.innerHTML = '<div class="modal-card"><h3 class="ol">' + tr('CUENTA') + '</h3><div class="opt-list"></div><button class="btn-ghost ol" id="fok-cuenta-ok">' + tr('VOLVER') + '</button></div>';
  CAJA_CUENTA.querySelector('.opt-list').appendChild(window.filaCuenta);
  CAJA_CUENTA.hidden = false; UI.toque = null;
  document.getElementById('fok-cuenta-ok').onclick = () => { play('select'); CAJA_CUENTA.hidden = true; };
}
hook('cuenta', () => { if (!CAJA_CUENTA.hidden) abreCuenta(); });
