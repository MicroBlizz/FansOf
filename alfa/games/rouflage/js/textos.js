// Fans of Rouflage · TEXTOS: en el código y en la página van en español; su inglés está en idioma/en.js (lo carga NUCLEO.juego).
// El idioma se elige como en los demás juegos: el guardado (`fansof-idioma`) o, si no hay, el del navegador. Para probar: el botón de idioma de Opciones (cambiaIdioma), el panel DEV o localStorage 'fansof-idioma' = 'en' (no hay ?idioma=).
'use strict';


// El idioma lo decide core (NUCLEO.idioma: el elegido o el del navegador; cambiarlo recarga la página) y tr() es el de core
// (core/js/sistema/idioma.js), que traduce con idioma/en.js.
const IDIOMA_RF = NUCLEO.idioma;
const LOCALE_RF = { es: 'es-ES', en: 'en-GB', pt: 'pt-BR' }[IDIOMA_RF] || IDIOMA_RF;      // para números y fechas (toLocaleString): fr, de e it valen tal cual

// la página: data-tr traduce el texto de un elemento; data-tr-html, su contenido con negritas; data-tr-aria y data-tr-title, sus descripciones.
// Cada elemento se guarda su español la primera vez, así que se puede llamar otra vez al cambiar de idioma.
function traducePagina() {
  const es = (el, clave, lee) => { if (el[clave] === undefined) el[clave] = lee(); return el[clave]; };
  for (const el of document.querySelectorAll('[data-tr]')) el.textContent = tr(es(el, '_es', () => el.textContent.trim()));
  for (const el of document.querySelectorAll('[data-tr-html]')) el.innerHTML = tr(es(el, '_esHtml', () => el.innerHTML.trim()));
  for (const el of document.querySelectorAll('[data-tr-aria]')) el.setAttribute('aria-label', tr(es(el, '_esAria', () => el.getAttribute('aria-label'))));
  for (const el of document.querySelectorAll('[data-tr-title]')) el.setAttribute('title', tr(es(el, '_esTitulo', () => el.getAttribute('title'))));
}
