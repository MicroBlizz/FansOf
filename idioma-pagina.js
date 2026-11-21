// Fans Of · IDIOMA de las páginas de TEXTO de la web (privacidad, condiciones, borrar la cuenta, energía y android): una sola fuente.
// Estas páginas traen sus textos dos veces, en bloques lang="es" y lang="en"; estilo/texto.css solo enseña el bloque con la clase «on».
// Aquí se marca el idioma que decide IDIOMA_WEB (idioma-web.js, cargado antes).
// El propio <html> lleva lang: se le pone el idioma elegido ANTES de marcar, para que también quede con «on» (sin ella texto.css escondería la página entera).
// Deja window.pagIdioma(v) para que el menú (menu.js) cambie de idioma sin recargar. Se carga al final del <body>: <script src="…/idioma-pagina.js"></script>
'use strict';
(() => {
  const poner = x => {
    const idioma = IDIOMA_WEB.cual(x);
    document.documentElement.lang = idioma;
    for (const e of document.querySelectorAll('[lang]')) e.classList.toggle('on', e.getAttribute('lang') === idioma);
  };
  window.pagIdioma = poner;
  poner(IDIOMA_WEB.elegido());
})();
