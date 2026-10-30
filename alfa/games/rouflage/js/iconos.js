// Fans of Rouflage · LOS ICONOS de la interfaz (dibujados, sin emojis): trazos SVG de 24 × 24 que pinta ponIcono() de js/interfaz.js. Estaban en
// interfaz.js (que pasaba de 25 KB); otros archivos añaden los suyos con Object.assign(ICONOS, {…}). Va justo antes de interfaz.js.
'use strict';

const ICONOS = {
  // los del título nuevo (titulo.js): percha del ARMARIO, entrada del PASE, bolsa de la TIENDA y dos galletas de AMIGOS
  casa: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10v9h11v-9"/><path d="M10.5 19v-4.5h3V19"/>',
  engranaje: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  flecha: '<path d="M9 5l7 7-7 7" stroke-width="3"/>',
  percha: '<path d="M12 7.2a2.2 2.2 0 1 1 2.2-2.2c0 1.1-.9 1.5-2.2 2.4L3.4 13.6c-1 .8-.5 2.4.8 2.4h15.6c1.3 0 1.8-1.6.8-2.4L12 7.6"/>',
  pase: '<path d="M3.5 7.5h17v3a1.8 1.8 0 0 0 0 3.6v3.4h-17v-3.4a1.8 1.8 0 0 0 0-3.6z"/><path d="M9 8v8.5" stroke-dasharray="1.6 1.8"/><path d="M14.6 9.6l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="currentColor" stroke-width="1"/>',
  bolsa: '<path d="M5 8.5h14l-1.2 11.5H6.2z"/><path d="M8.8 8.5V7a3.2 3.2 0 0 1 6.4 0v1.5"/>',
  amigos: '<circle cx="8.5" cy="7.5" r="3"/><path d="M3 19.5c0-3.4 2.4-5.6 5.5-5.6s5.5 2.2 5.5 5.6"/><circle cx="16.6" cy="8.6" r="2.5"/><path d="M15.4 13.9c3.2-.5 5.6 1.6 5.6 5"/>',
  pincel: '<path d="M20 4l-7.6 7.6"/><path d="M12.7 11.3l2 2c-1 3.4-3.7 6.1-9.7 6.6 1.6-1.9 1.4-3 1.8-4.6.5-2 2.5-3.6 5.9-4z" fill="currentColor"/>',
  gota: '<path d="M13.4 6.6l4 4"/><path d="M15 8.2 6.2 17l-1.6 3.4L8 18.8l8.8-8.8"/><path d="M16.2 4.2a2.5 2.5 0 0 1 3.6 3.6l-2 2-3.6-3.6z" fill="currentColor"/>',
  cubo: '<path d="M5 11.6 12 4.6l7 7-6.4 6.4a1.5 1.5 0 0 1-2.1 0L5 12.6z"/><path d="M8.6 8 5.2 4.6"/><path d="M19.6 15.4c1 1.4 1.6 2.3 1.6 3.1a1.6 1.6 0 0 1-3.2 0c0-.8.6-1.7 1.6-3.1z" fill="currentColor"/>',
  deshacer: '<path d="M8 5 3.5 9.5 8 14"/><path d="M3.5 9.5H14a5.5 5.5 0 0 1 0 11h-3"/>',
  ojo: '<path d="M2 12c2.6-4.4 6-6.5 10-6.5s7.4 2.1 10 6.5c-2.6 4.4-6 6.5-10 6.5S4.6 16.4 2 12z"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  hielo: '<path d="M12 2v20M3.4 7l17.2 10M3.4 17 20.6 7"/><path d="M9.5 3.6 12 6l2.5-2.4M9.5 20.4 12 18l2.5 2.4"/>',
  andar: '<path d="M12 3v18M3 12h18"/><path d="M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
  cabezaRedonda: '<circle cx="12" cy="12" r="6.5" fill="currentColor"/>',
  cabezaCuadrada: '<rect x="5.5" y="5.5" width="13" height="13" fill="currentColor"/>',
  rapida: '<path d="M13 3 6 13h5l-1 8 7-10h-5z" fill="currentColor" stroke-linejoin="round"/><path d="M3 8h2M2.5 12h2M3 16h2"/>',
  senuelo: '<path d="M3 15c3-7 5 3 8-4s4 4 7-3"/><circle cx="19.5" cy="17.5" r="2.2"/>',
  podio: '<path d="M2.5 20.5h19M9 20.5V11.5h6v9M3.5 20.5V15H9M15 13.5h5.5v7M12 2.8l1 2.1 2.3.3-1.65 1.6.4 2.3L12 8l-2.05 1.1.4-2.3L8.7 5.2l2.3-.3z"/>',
  apagon: '<path d="M4 7.5h7l5-3v12l-5-3H4zM16 9.5v2M3 3l18 18"/>',
  baliza: '<path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10zM12 7.5v4M12 13.6v.4"/>',
  mano: '<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7.5a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.3-2.4L3.6 14.2a1.4 1.4 0 0 1 2.3-1.6L8 15V12"/>',
  granada: '<circle cx="11" cy="14.5" r="6.2"/><path d="M9 8.4V5.2h4v3.2M13 5.2l4.2-1.8M3.2 4.6l2 1.4M2.4 9.6h2.4M20 10.6l1.6-1.6M20.6 14.6h1.8"/>',
  silbato: '<path d="M3 9.5h11.5M3 9.5V13h6.2"/><circle cx="14.5" cy="14" r="5.6"/><circle cx="14.5" cy="14" r="1.5" fill="currentColor"/><path d="M14.5 2.4v2.4M19 3.8l-1.3 2.1M10 3.8l1.3 2.1"/>',
  pausa: '<path d="M8.2 5v14M15.8 5v14" stroke-width="3.6"/>',
  sonido: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/><path d="M15.5 9.5c1.3 1.4 1.3 3.6 0 5M18 7c2.6 2.8 2.6 7.2 0 10"/>',
  musica: '<path d="M9 18V6l10-2v12"/><circle cx="6.8" cy="18" r="2.4" fill="currentColor"/><circle cx="16.8" cy="16" r="2.4" fill="currentColor"/>',
  linea: '<path d="M5 19 19 5" stroke-width="3"/><circle cx="5" cy="19" r="1.8" fill="currentColor"/><circle cx="19" cy="5" r="1.8" fill="currentColor"/>',
  cuadro: '<rect x="4.5" y="5.5" width="15" height="13" rx="2" fill="currentColor" fill-opacity=".35"/>',
  circulo: '<circle cx="12" cy="12" r="7.5" fill="currentColor" fill-opacity=".35"/>',
  lupa: '<circle cx="10" cy="10" r="6.6"/><path d="M15 15l6 6M10 7v6M7 10h6"/>',
  diana: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><path d="M12 1.4v3M12 19.6v3M1.4 12h3M19.6 12h3"/>',
};
