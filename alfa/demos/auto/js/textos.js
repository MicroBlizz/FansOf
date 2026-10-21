// Fans of Auto · TEXTOS: de momento la demo va solo en español (como las otras demos de la serie). Todo lo que se escribe pasa
// por tr(), así que el día que se quiera el inglés basta con rellenar EN y elegir el idioma como en los demás juegos.
'use strict';

const VERSION_AUTO = '0.1.0';   // la misma que el ?v= de index.html y la de js/novedades.js
const EN = {};
const IDIOMA_AUTO = 'es';
function tr(s) { return IDIOMA_AUTO === 'es' ? s : (EN[s] ?? s); }
const TINTA = '#0e1016';   // lo más oscuro del juego: el contorno de las letras y los iconos
