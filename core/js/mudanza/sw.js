// Fans Of · MUDANZA de las demos (ADR 142): el service worker que deja la carpeta vieja (web/demos/<x>/sw.js lo carga junto a reglas.js).
// El navegador lo baja solo la próxima vez que se visita la dirección vieja, porque ya no es igual que el que tenía: entonces borra las copias
// sin conexión de esa carpeta (solo las suyas), se da de baja y recarga las pestañas, que van a parar a la página de reenvío.
'use strict';
(() => {
  const CARPETA = new URL(self.registration.scope).pathname;
  const mia = k => MUDANZA_REGLAS.esCopiaVieja(k, CARPETA, self.COPIAS_VIEJAS);
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', e => {
    e.waitUntil(caches.keys()
      .then(keys => Promise.all(keys.filter(mia).map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(cs => cs.forEach(c => c.navigate(c.url))));
  });
})();
