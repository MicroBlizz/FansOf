// Fans Of · LA PORTADA · JUGADOS ÚLTIMAMENTE: la regla de qué juegos has abierto hace poco desde la web (Arkioner, 23-11-2026). Regla pura: sin pantalla,
// reloj ni almacenamiento; la pantalla (biblioteca/portada-catalogo.js) le pasa la lista guardada, la hora y los juegos que se ven en la portada.
// Una entrada es { id: 'karts', cuando: <ms> }; la lista va de la más reciente a la más vieja, sin repetir juego.
'use strict';
const JUGADOS = (() => {
  const GUARDA = 8;   // se guardan algunos más de los que se enseñan: si uno sale de la portada, el siguiente ocupa su sitio
  const valida = e => e && typeof e.id === 'string' && /^[a-z0-9-]+$/.test(e.id) && Number.isFinite(e.cuando);
  // lo leído del almacenamiento puede ser cualquier cosa: solo pasan las entradas bien formadas
  const limpia = lista => (Array.isArray(lista) ? lista.filter(valida) : []);
  // el juego al que lleva un enlace de la portada ('games/karts/', '/alfa/games/karts/?x=1'…), o '' si no lleva a un juego
  const idDeEnlace = href => (String(href || '').match(/(?:^|\/)games\/([a-z0-9-]+)\/?(?:[?#]|$)/) || [])[1] || '';
  // apunta que se ha abierto el juego id: sube el primero (sin repetirse) y la lista no pasa de GUARDA
  const anotar = (lista, id, cuando) => [{ id, cuando }, ...limpia(lista).filter(e => e.id !== id)].slice(0, GUARDA);
  // los n más recientes (6 si no se dice) de los que se ven en la portada (vivos: los ids que hay)
  const ultimos = (lista, vivos, n = 6) => limpia(lista).map(e => e.id).filter(id => vivos.includes(id)).slice(0, n);
  return Object.freeze({ GUARDA, idDeEnlace, anotar, ultimos });
})();
