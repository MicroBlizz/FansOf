// Fans of Skate · instalar como app en el móvil y jugar sin conexión (igual que Fans of Rumble, sin cargar todo el núcleo).
// El botón INSTALAR sale solo cuando el navegador deja instalarlo (Android/PC) o, en iPhone, con la explicación a mano.
(() => {
  'use strict';
  const web = (location.protocol === 'https:' || location.hostname === 'localhost') && window.self === window.top;
  const yaInstalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const version = new URL(document.currentScript.src).searchParams.get('v') || '0';
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const btn = document.getElementById('sk-instalar');
  let evento = null;

  if (web && !yaInstalada) {
    const l = document.createElement('link'); l.rel = 'manifest'; l.href = 'manifest.webmanifest'; document.head.appendChild(l);
  }
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

  // jugar sin conexión: se guarda la página y todo lo que carga (scripts, estilos e iconos) la primera vez
  if (web && 'serviceWorker' in navigator) {
    const archivos = [...document.querySelectorAll('script[src], link[rel="stylesheet"][href]')].map(n => n.src || n.href);
    const guardar = ['./', location.href, new URL('manifest.webmanifest', location.href).href,
      new URL('../../core/img/icon-192.png', location.href).href, new URL('../../core/img/icon-512.png', location.href).href,
      new URL('../../core/img/icon-maskable.png', location.href).href, ...archivos];
    navigator.serviceWorker.register('sw.js?v=' + version)
      .then(() => navigator.serviceWorker.ready)
      .then(reg => { if (reg.active) reg.active.postMessage({ guardar }); })
      .catch(() => { /* sin modo sin conexión */ });
  }
})();
