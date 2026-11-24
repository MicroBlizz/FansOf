// Fans Of · la página 404 de la web (404.html, ADR 212): GitHub Pages la enseña en CUALQUIER dirección que no existe, así que no sabe en qué
// carpeta está y todo lo pide desde la raíz. Hace dos cosas: si la dirección es una vieja de las demos (/demos/<x>/, que vivieron ahí hasta
// el ADR 142), manda a /games/<x>/ con lo que llevaba; si no, enseña el aviso en español o inglés con un botón a la biblioteca.
// Las reglas son funciones puras (tests/web/pagina-404.test.mjs). Se carga lo primero de la página, para reenviar sin que se vea el aviso.
'use strict';
const PAGINA_404 = (() => {
  const VIEJA = /\/demos\/([^/]+)(?:\/.*)?$/;   // /…/demos/<x>/ y lo que cuelgue de ella
  const TEXTOS = Object.freeze({
    es: Object.freeze({ titulo: 'Página no encontrada · Fans Of', t: 'AQUÍ NO HAY NADA', p: 'Esta página no existe o se ha mudado. Phony jura que él no ha tocado nada.', b: 'IR A LA BIBLIOTECA' }),
    en: Object.freeze({ titulo: 'Page not found · Fans Of', t: 'NOTHING TO SEE HERE', p: 'This page does not exist or has moved. Phony swears he did not touch anything.', b: 'GO TO THE LIBRARY' }),
  });

  // La dirección nueva de una vieja, con lo que llevaba (?idioma, #…): '/demos/pop/index.html' → '/games/pop/'. También dentro de la alfa
  // ('/alfa/demos/pop/' → '/alfa/games/pop/'). Fuera de demos/<x>/ no hay destino: null (y /games/<x>/ nunca lo tiene: no hay bucle).
  function destino(pathname, search, hash) {
    const p = String(pathname || '');
    if (!VIEJA.test(p)) return null;
    return p.replace(VIEJA, '/games/$1/') + (search || '') + (hash || '');
  }
  // Adónde lleva el botón: a la portada de la alfa si la dirección perdida era de la alfa; si no, a la de la web
  const inicio = pathname => (/^\/alfa(\/|$)/.test(String(pathname || '')) ? '/alfa/' : '/');
  // Los textos de la página en un idioma ('es' o 'en'; cualquier otro, inglés, como en el resto de la web)
  const textos = idioma => TEXTOS[idioma === 'es' ? 'es' : 'en'];

  // En el navegador: reenvía ya si toca; si no, pinta el aviso cuando la página esté lista. elegido: la función que dice el idioma de la
  // web (IDIOMA_WEB.elegido, que se carga después: por eso se pregunta al pintar)
  function arranca(win, elegido) {
    const lugar = win.location, doc = win.document;
    const nueva = destino(lugar.pathname, lugar.search, lugar.hash);
    if (nueva) { lugar.replace(nueva); return; }
    doc.addEventListener('DOMContentLoaded', () => {
      const idioma = elegido(), x = textos(idioma);
      doc.documentElement.lang = idioma;
      doc.title = x.titulo;
      doc.getElementById('t').textContent = x.t;
      doc.getElementById('p').textContent = x.p;
      const boton = doc.getElementById('b');
      boton.textContent = x.b;
      boton.href = inicio(lugar.pathname);
    });
  }

  return Object.freeze({ destino, inicio, textos, arranca });
})();
if (typeof module !== 'undefined') module.exports = PAGINA_404;
else PAGINA_404.arranca(window, () => IDIOMA_WEB.elegido());
