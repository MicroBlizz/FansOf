// Fans of Karts · TEXTOS: en el código y en los datos van en español; su inglés está en idioma/en*.js (lo carga NUCLEO.juego({ idioma }) de index.html).
// El idioma se elige como en los demás juegos: el de Opciones (`fansof-idioma`) o, si no hay, el del navegador (lo decide core y recarga). Para probar: ?idioma=en. tr('frase') traduce; trf('Adelantas a %1.', nombre) traduce y rellena los huecos.
'use strict';

// El idioma lo decide core (NUCLEO.idioma: el elegido en Opciones o el del navegador) y tr() es el de core (core/js/sistema/idioma.js),
// que traduce con los diccionarios de idioma/. Cambiarlo recarga la página, como en los demás juegos.
const IDIOMA_K = NUCLEO.idioma;
function trf(s, ...v) { let t = tr(s); v.forEach((x, i) => { t = t.replace('%' + (i + 1), x); }); return t; }
function ponIdioma(l) { NUCLEO.elegirIdioma(l); }
