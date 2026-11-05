// Fans Of · SPLASH · el dibujo del logo FOG: el icono elegido por Pepins (5-11-2026, core/img/logo-fog.webp) y «FANS OF GAMES» debajo.
// Es una pieza aparte para poder cambiar el logo sin tocar la lógica de splash.js. Devuelve el SVG como texto.
// Las clases fog-* las anima splash.js. Guía: docs/guia/core/splash.md. ADR 051.
'use strict';
const SPLASH_LOGO = (() => {
  // la imagen va en core/img/: se busca a partir de donde se cargó este archivo (core/js/sistema/), sirva para cualquier juego
  const yo = typeof document !== 'undefined' && document.currentScript;
  const icono = yo && yo.src ? new URL('../../img/logo-fog.webp', yo.src).href : 'core/img/logo-fog.webp';
  return () => `<svg class="fog-logo" viewBox="0 0 300 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fans Of Games">
<image class="fog-icono" href="${icono}" x="20" y="10" width="260" height="260"/>
<text class="fog-nombre" x="150" y="335" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="22" letter-spacing="7" fill="#ffd21f" stroke="#20102c" stroke-width="5" paint-order="stroke" stroke-linejoin="round">FANS OF GAMES</text>
</svg>`;
})();
if (typeof module !== 'undefined') module.exports = SPLASH_LOGO;
