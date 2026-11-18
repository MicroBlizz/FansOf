// Fans Of · MUDANZA de las demos a games/ (ADR 142): las reglas, como funciones puras (sin DOM ni reloj). Las usan la página de reenvío
// (mudanza/pagina.js), que deja cada web/demos/<x>/index.html, y el service worker que limpia la copia vieja (mudanza/sw.js), que deja
// cada web/demos/<x>/sw.js. Se prueban en tests/core/mudanza.test.mjs. Guía: docs/guia/web/mudanza-de-las-demos.md.
'use strict';
const MUDANZA_REGLAS = (() => {
  const VIEJA = /\/demos\/([^/]+)(?:\/.*)?$/;   // /…/demos/<x>/ y lo que cuelgue de ella

  // La dirección nueva de una vieja, con lo que llevaba (?idioma, #…): '/FansOf/demos/pop/index.html' → '/FansOf/games/pop/'.
  // También dentro de la alfa ('/FansOf/alfa/demos/pop/' → '/FansOf/alfa/games/pop/'). Fuera de demos/<x>/ no hay destino: null.
  function destino(pathname, search, hash) {
    const p = String(pathname || '');
    if (!VIEJA.test(p)) return null;
    return p.replace(VIEJA, '/games/$1/') + (search || '') + (hash || '');
  }

  // ¿Se abrió como app instalada (la de la dirección vieja)? Entonces saltar fuera la deja con la barra del navegador.
  // mira: como window.matchMedia (o nada); nav: como navigator.
  function esApp(mira, nav) {
    const modo = m => !!(mira && mira('(display-mode: ' + m + ')').matches);
    return modo('standalone') || modo('fullscreen') || !!(nav && nav.standalone === true);
  }

  // ¿Es una copia guardada por el juego que vivía en esta carpeta? Las de core/js/sw.js se llaman 'fansof' + carpeta + '#' + versión;
  // viejas: la expresión de las copias de versiones anteriores que ya borraba ese juego (COPIAS_VIEJAS), o nada. Las de los demás, no.
  function esCopiaVieja(clave, carpeta, viejas) {
    const k = String(clave || '');
    return k.startsWith('fansof' + carpeta + '#') || (!!viejas && viejas.test(k));
  }

  return Object.freeze({ destino, esApp, esCopiaVieja });
})();
if (typeof module !== 'undefined') module.exports = MUDANZA_REGLAS;
