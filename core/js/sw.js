// Fans Of · Jugar sin conexión: el mismo para todos los juegos.
// Cada juego lo usa desde un sw.js de dos líneas en su carpeta (tiene que estar ahí para valer solo para ese juego).
//
// El juego (páginas, estilos y código) se pide primero a internet, para tener siempre la última versión;
// si no hay conexión, se usa la copia guardada. Iconos y letras se guardan la primera vez y ya no se vuelven a pedir.
// Qué archivos forman el juego se lo dice la página al cargar (core/js/nucleo.js), así que aquí no hay ninguna lista que mantener.
const AQUI = new URL(self.registration.scope).pathname;                                   // la carpeta del juego
const CACHE = 'fansof' + AQUI + '#' + (new URL(self.location).searchParams.get('v') || '0');   // una copia por juego y versión
// las copias de este juego (las de otras versiones y las que guardaban los sw.js antiguos); las de los demás juegos no se tocan
const mia = k => k.startsWith('fansof' + AQUI + '#') || (!!self.COPIAS_VIEJAS && self.COPIAS_VIEJAS.test(k));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('./').catch(() => null)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && mia(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// la página manda la lista de lo que ha cargado: se guarda todo, para poder jugar sin conexión desde la primera visita
self.addEventListener('message', e => {
  const lista = e.data && e.data.guardar;
  if (Array.isArray(lista)) e.waitUntil(caches.open(CACHE).then(c => Promise.all(lista.map(u => c.add(u).catch(() => null)))));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const page = req.mode === 'navigate' || (url.origin === location.origin && (url.pathname.endsWith('/') || /\.(html|js|css)$/.test(url.pathname)));
  if (page) {
    // estilos y código llevan ?v=versión: sin conexión vale la copia guardada aunque el número no coincida
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(m => m || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(m => m || fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
