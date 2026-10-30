// Fans of Skate · instalar como app en el móvil y jugar sin conexión (el modo sin conexión y el manifest los pone NUCLEO).
// El botón INSTALAR sale solo cuando el navegador deja instalarlo (Android/PC) o, en iPhone, con la explicación a mano.
(() => {
  'use strict';
  const web = (location.protocol === 'https:' || location.hostname === 'localhost') && window.self === window.top;
  const yaInstalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const btn = document.getElementById('sk-instalar');
  let evento = null;

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); evento = e; if (btn && !yaInstalada) btn.hidden = false; });
  window.addEventListener('appinstalled', () => { if (btn) btn.hidden = true; });

  if (btn) {
    if (ios && web && !yaInstalada) btn.hidden = false;   // iPhone no avisa: se explica a mano
    btn.addEventListener('click', async () => {
      if (evento) { evento.prompt(); try { await evento.userChoice; } catch (e) { /* cerrado */ } evento = null; btn.hidden = true; return; }
      const texto = btn.textContent;
      btn.textContent = 'iPhone: Compartir → Añadir a pantalla de inicio';
      setTimeout(() => { btn.textContent = texto; }, 6000);
    });
  }

})();
