// Fans of Dungeons · Textos: se escriben en español en el código y aquí está su inglés. tr('texto') devuelve el idioma elegido
// (?idioma=en o el guardado en opciones). Los textos con huecos se rellenan con fmt(): tr('Planta {n}') → fmt(..., { n }).
'use strict';

const EN = {};   // se rellena al final del archivo (y desde otros archivos con trAdd)
function trAdd(dic) { Object.assign(EN, dic); }

const IDIOMA_FD = { es: 'es' };
(() => {
  try {
    const q = new URLSearchParams(location.search).get('idioma');
    const g = localStorage.getItem('fansof-dungeons-idioma');
    IDIOMA_FD.es = q === 'en' || (q !== 'es' && g === 'en') ? 'en' : 'es';
  } catch (e) { IDIOMA_FD.es = 'es'; }
  document.documentElement.lang = IDIOMA_FD.es;
})();
function tr(s) { return IDIOMA_FD.es === 'es' ? s : (EN[s] ?? s); }
function cambiaIdioma(l) { IDIOMA_FD.es = l; document.documentElement.lang = l; try { localStorage.setItem('fansof-dungeons-idioma', l); } catch (e) { /* sin guardar */ } }
