// Fans Of · SPLASH · el dibujo del logo FOG (monograma: G en anillo, F dentro y un botón de consola con una O).
// Es una pieza aparte para poder cambiar el logo sin tocar la lógica de splash.js. Devuelve el SVG como texto.
// Las clases fog-* las anima splash.js. Guía: docs/guia/core/splash.md. ADR 051.
'use strict';
const SPLASH_LOGO = () => `<svg class="fog-logo" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fans Of Games">
<path class="fog-g" pathLength="1" d="M234.26 79.29A110 110 0 1 0 260 150H172" fill="none" stroke="#ffcb3d" stroke-width="34"/>
<path class="fog-f" d="M116 202V98H176M116 144.8H161" fill="none" stroke="#ff7a1a" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
<g class="fog-boton">
<circle cx="210" cy="206" r="23" fill="#173d8f"/>
<circle cx="210" cy="203" r="23" fill="#2e8bff" stroke="#20102c" stroke-width="4"/>
<circle cx="210" cy="203" r="10" fill="none" stroke="#fff6ea" stroke-width="5"/>
</g>
<text class="fog-nombre" x="150" y="330" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="30" letter-spacing="12" fill="#fff6ea">FOG</text>
<text class="fog-nombre" x="150" y="370" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="17" letter-spacing="9" fill="#cdb9ea">FANS OF GAMES</text>
</svg>`;
if (typeof module !== 'undefined') module.exports = SPLASH_LOGO;
