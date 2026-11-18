// Fans of Dungeons · Instalar como app en el móvil y jugar sin conexión (igual que los demás juegos de la serie, sin cargar el
// núcleo). Menú → «Instalar en el móvil»: si el navegador deja, sale su ventana; si no (iPhone, o el navegador de dentro de otra
// app), se explica cómo hacerlo a mano. Va el último en index.html: así la copia sin conexión guarda todos los archivos del juego.
'use strict';
const INSTALAR = (() => {
  const web = (location.protocol === 'https:' || location.hostname === 'localhost') && window.self === window.top;
  const yaInstalada = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const version = new URL(document.currentScript.src).searchParams.get('v') || '0';
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const dentroDeOtraApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|TikTok|musical_ly|Snapchat|Twitter|; wv\)/i.test(navigator.userAgent);
  let evento = null;
  if (web && !yaInstalada()) { const l = document.createElement('link'); l.rel = 'manifest'; l.href = 'manifest.webmanifest'; document.head.appendChild(l); }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); evento = e; });
  window.addEventListener('appinstalled', () => { evento = null; });
  // jugar sin conexión: se guarda la página y todo lo que carga la primera vez
  if (web && 'serviceWorker' in navigator) {
    const archivos = [...document.querySelectorAll('script[src]')].map(n => n.src);
    const guardar = ['./', location.href, new URL('manifest.webmanifest', location.href).href, new URL('img/icon-192.png', location.href).href,
      new URL('img/icon-512.png', location.href).href, new URL('img/icon-maskable.png', location.href).href, ...archivos];
    navigator.serviceWorker.register('sw.js?v=' + version).then(() => navigator.serviceWorker.ready)
      .then(reg => { if (reg.active) reg.active.postMessage({ guardar }); }).catch(() => { /* sin modo sin conexión */ });
  }
  // devuelve el texto que hay que enseñar (o null si ha salido la ventana del navegador)
  function instala() {
    if (yaInstalada()) return tr('Ya lo estás usando como app.');
    if (evento) { const e = evento; evento = null; e.prompt(); return null; }
    if (!web) return tr('Ábrelo desde la web del juego para poder instalarlo.');
    if (dentroDeOtraApp) return tr('Desde aquí no se puede instalar. Abre el enlace en Chrome o en Safari y vuelve al Menú.');
    return ios ? tr('En iPhone, con Safari: toca Compartir (el cuadrado con la flecha) y luego «Añadir a pantalla de inicio».')
      : tr('En Android, con Chrome: toca el menú (los tres puntos, arriba a la derecha) y luego «Instalar aplicación». En el ordenador, el icono de instalar de la barra de direcciones.');
  }
  return { instala, yaInstalada };
})();
