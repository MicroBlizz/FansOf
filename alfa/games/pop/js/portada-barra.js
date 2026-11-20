// Fans of Pop · LA BARRA DE LA PORTADA (tarea #143, ADR 176; Pepins, 20-11-2026: «barra abajo con iconos»): cada botón de la barra
// lleva su dibujo (hecho con código, contorno grueso, sin emojis) y su nombre debajo. Los botones siguen siendo los de index.html
// (#pp-tienda, #pp-companeros, #pp-perfil, #pp-duelo, #pp-opciones); aquí solo se les pone el dibujo y el texto en su idioma.
'use strict';
// los dibujos, en un cuadro de 48: relleno blanco y contorno del color del botón (currentColor, que pone css/portada.css)
const PP_BARRA_ICONOS = Object.freeze({
  companeros: '<circle cx="17" cy="27" r="11"/><circle cx="32" cy="22" r="11"/><circle cx="29" cy="21" r="1.6" class="pp-ojo"/><circle cx="35" cy="21" r="1.6" class="pp-ojo"/><circle cx="14" cy="26" r="1.6" class="pp-ojo"/><circle cx="20" cy="26" r="1.6" class="pp-ojo"/>',
  inicio: '<path d="M24 6 4 23h6v19h11V31h6v11h11V23h6z"/>',   // la casa de INICIO, en la barra del camino (js/camino-barra.js)
  perfil: '<circle cx="24" cy="17" r="10"/><path d="M8 42c1-10 8-14 16-14s15 4 16 14z"/>',
  duelo: '<path d="M27 4 11 27h11l-4 17 19-25H26z"/>',
  opciones: '<circle cx="24" cy="24" r="14" fill="none" stroke-width="9" stroke-dasharray="5.5 5.5" class="pp-dientes"/><circle cx="24" cy="24" r="12"/><circle cx="24" cy="24" r="4.5" class="pp-ojo"/>',
});
// el dibujo de un botón: SVG para los de PP_BARRA_ICONOS; la tienda usa la imagen de perlas (aún no han cargado los dibujos del juego)
function ppBarraIcono(clave) {
  if (clave === 'tienda') return `<img class="pp-barra-ico" src="${PP_LISO ? 'img-liso' : 'img'}/i-perlas.png" alt=""${PP_LISO ? ' style="image-rendering:auto"' : ''}>`;
  return `<svg class="pp-barra-ico" viewBox="0 0 48 48" aria-hidden="true">${PP_BARRA_ICONOS[clave] || ''}</svg>`;
}
// pone dibujo y nombre a un botón de la barra (el candado de primeros pasos se añade después, en ppPrimerosPortada)
function ppBarraBoton(sel, clave, texto) {
  const b = $pp(sel); if (!b) return null;
  b.innerHTML = `${ppBarraIcono(clave)}<b>${texto}</b>`;
  return b;
}
// los nombres de la barra y de la fila de Memoria y Ranking, en el idioma de cada uno (lo llama ppIrA('titulo'))
function ppBarraRotulos() {
  ppBarraBoton('#pp-tienda', 'tienda', tr('TIENDA'));
  ppBarraBoton('#pp-duelo', 'duelo', tr('DUELOS'));
  ppBarraBoton('#pp-opciones', 'opciones', tr('OPCIONES'));
  $pp('#pp-memoria').textContent = tr('MEMORIA');
  $pp('#pp-ranking').textContent = tr('RANKING');
}
