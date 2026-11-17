// Fans Of · IDIOMA de las páginas de la web que NO cargan core (privacidad, condiciones, borrar la cuenta, energía y android): una sola fuente.
// Estas páginas traen sus textos dos veces, en bloques lang="es" y lang="en"; core/css/legal.css solo enseña el bloque con la clase «on».
// Aquí se decide el idioma (?lang= de la dirección, luego el elegido en el menú y guardado en 'fansof-idioma', luego el del navegador) y se marca.
// El propio <html> lleva lang: se le pone el idioma elegido ANTES de marcar, para que también quede con «on» (sin ella legal.css escondería la página entera).
// Deja window.pagIdioma(v) para que el menú (menu.js) cambie de idioma sin recargar. Se carga al final del <body>: <script src="…/idioma-pagina.js"></script>
'use strict';
(() => {
  const guardado = () => { try { return localStorage.getItem('fansof-idioma'); } catch (e) { return null; /* sin almacén: decide el navegador */ } };
  const cual = x => (/^en/i.test(x || '') ? 'en' : 'es');
  const poner = x => {
    const idioma = cual(x);
    document.documentElement.lang = idioma;
    for (const e of document.querySelectorAll('[lang]')) e.classList.toggle('on', e.getAttribute('lang') === idioma);
  };
  window.pagIdioma = poner;
  poner(new URLSearchParams(location.search).get('lang') || guardado() || navigator.language);
})();
