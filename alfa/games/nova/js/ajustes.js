// Fans of Nova · AJUSTES: el nombre del juego para core y la clave de su partida en este navegador. Se carga antes de lo común.
'use strict';
// LA ALFA GUARDA APARTE (como Rouflage): /FansOf/alfa/ y /FansOf/ comparten navegador, así que la alfa usa otra clave y otra partida en la nube
// (AJUSTES.nube, core/js/sistema/cuenta.js). Probar en la alfa no toca la campaña de verdad. La primera vez, la alfa empieza con una copia de la de siempre.
const ALFA_NV = typeof NUCLEO !== 'undefined' && !!NUCLEO.alfa;
const AJUSTES = {
  id: 'nova',                                          // para core: el nombre del juego
  guardado: ALFA_NV ? 'fonova-save-alfa' : 'fonova-save',   // la clave de la partida en este navegador
  nube: ALFA_NV ? 'nova-alfa' : 'nova',                // el nombre de la partida en la nube
};
if (ALFA_NV) try { if (localStorage.getItem(AJUSTES.guardado) === null && localStorage.getItem('fonova-save') !== null) localStorage.setItem(AJUSTES.guardado, localStorage.getItem('fonova-save')); } catch (_) { /* sin almacenamiento */ }
