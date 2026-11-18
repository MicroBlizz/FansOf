// Fans Of · core · la REGLA del idioma, pura (ADR 143 y 144): con lo pedido en la dirección, lo guardado, los idiomas del navegador y los que
// ofrece la página, qué idioma toca. Sin página ni almacén: quien la usa le pasa los datos. La usan el núcleo (nucleo/idioma-eleccion.js) y
// la web (idioma-web.js); tras la tarea #45, también los prototipos sin núcleo. Se prueba en tests/core/idioma-regla.test.mjs.
// LA REGLA: lo pedido en la dirección, si es un idioma de la serie; si no, lo guardado (lo elegido en un menú u Opciones); si no, el primer
// idioma de la serie que tenga el navegador; si no tiene ninguno, inglés. Y si la página no ofrece el que salga, inglés.
'use strict';
const IDIOMA_REGLA = (() => {
  const IDIOMAS = Object.freeze(['es', 'en', 'pt', 'fr', 'de', 'it']);   // los de la serie
  const CLAVE = 'fansof-idioma';   // donde se guarda lo elegido (lo comparten todos los juegos y la web)

  // 'pt-BR' → 'pt'; lo que no es un idioma de la serie → ''
  const deLaSerie = x => { const c = String(x || '').slice(0, 2).toLowerCase(); return IDIOMAS.includes(c) ? c : ''; };
  // navegador: como navigator ({ languages, language }) → el primero de la serie; ninguno → 'en'
  function delNavegador(navegador) {
    const n = navegador || {};
    const lista = n.languages && n.languages.length ? n.languages : [n.language || 'es'];
    for (const l of lista) { const c = deLaSerie(l); if (c) return c; }
    return 'en';
  }
  // pedido: el de la dirección · guardado: el de CLAVE · navegador · ofrecidos: los que tiene la página (español e inglés siempre)
  function elige({ pedido = '', guardado = '', navegador = {}, ofrecidos = IDIOMAS } = {}) {
    const elegido = IDIOMAS.includes(guardado) ? guardado : '';   // lo guardado es siempre un código ('pt'); otra cosa no cuenta
    const idioma = deLaSerie(pedido) || elegido || delNavegador(navegador);
    return ofrecidos.includes(idioma) ? idioma : 'en';
  }
  // Lo pedido en la dirección (location.search): ?idioma=; ?lang= vale igual, para los enlaces de antes (ADR 144)
  function pedido(busqueda) {
    const q = new URLSearchParams(busqueda || '');
    return q.get('idioma') || q.get('lang') || '';
  }

  return Object.freeze({ IDIOMAS, CLAVE, elige, pedido });
})();
if (typeof NUCLEO_PIEZAS !== 'undefined') NUCLEO_PIEZAS.idiomaRegla = IDIOMA_REGLA;
if (typeof module !== 'undefined') module.exports = IDIOMA_REGLA;
