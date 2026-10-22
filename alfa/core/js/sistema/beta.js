// Fans Of · BETA: comprueba de fondo si la cuenta tiene el rol «beta» (en la release abre los juegos que aún no lo están; ver core/js/proximamente.js).
// En la alfa y en desarrollo no hace nada. Si el veredicto cambia respecto a lo que pintó la página, la recarga.
'use strict';
(() => {
  if (typeof PROXIMAMENTE === 'undefined') return;
  const comprobar = () => PROXIMAMENTE.verificar();
  document.addEventListener('cuenta-cambio', comprobar);
  window.addEventListener('load', () => setTimeout(comprobar, 800));
})();
