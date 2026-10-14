// Fans of Recruit · TEXTOS: de momento el juego va solo en español (decisión de Daniel). Todo lo que se escribe pasa por tr(),
// así que el día que se quiera el inglés basta con rellenar EN y elegir el idioma como en los demás juegos (`fansof-idioma`).
'use strict';

const VERSION_RC = '0.1.3';   // la misma que el ?v= de index.html y la de js/novedades.js
const EN = {};
const IDIOMA_RC = 'es';
function tr(s) { return IDIOMA_RC === 'es' ? s : (EN[s] ?? s); }
