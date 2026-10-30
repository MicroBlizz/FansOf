// Fans of Ratkov · INSTALAR como app en el móvil y jugar sin conexión (como los demás juegos de la serie). Opciones → «Instalar»: si el
// navegador deja, sale su ventana; si no (iPhone, o el navegador de dentro de otra app), se explica cómo hacerlo a mano. La ventana del
// navegador solo sale si se pide dentro de un toque: por eso instala() se llama desde el propio botón.
'use strict';
const INSTALAR = (() => {
  const web = (location.protocol === 'https:' || location.hostname === 'localhost') && window.self === window.top;
  const yaInstalada = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const dentroDeOtraApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|TikTok|musical_ly|Snapchat|Twitter|; wv\)/i.test(navigator.userAgent);
  let evento = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); evento = e; });
  window.addEventListener('appinstalled', () => { evento = null; });
  // devuelve el texto que hay que enseñar (o null si ha salido la ventana del navegador)
  function instala() {
    if (yaInstalada()) return 'Ya lo estás usando como app.';
    if (evento) { const e = evento; evento = null; e.prompt(); return null; }
    if (!web) return 'Ábrelo desde la web del juego para poder instalarlo.';
    if (dentroDeOtraApp) return 'Desde aquí no se puede instalar. Abre el enlace en Chrome o en Safari y vuelve a Opciones.';
    return ios ? 'En iPhone, con Safari: toca Compartir (el cuadrado con la flecha) y luego «Añadir a pantalla de inicio».'
      : 'En Android, con Chrome: toca el menú (los tres puntos, arriba a la derecha) y luego «Instalar aplicación». En el ordenador, el icono de instalar de la barra de direcciones.';
  }
  return { instala, yaInstalada };
})();
