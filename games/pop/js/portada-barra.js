// Fans of Pop · LA BARRA DE LA PORTADA (tarea #143, ADR 176; Pepins, 20-11-2026: «barra abajo con iconos»): cada botón de la barra
// lleva su dibujo (hecho con código, contorno grueso, sin emojis; o, tras el flag iconos-barra, el que pintó Yoshi) y su nombre debajo. Los botones siguen siendo los de index.html
// (#pp-tienda, #pp-amigos, #pp-companeros, #pp-perfil, #pp-duelo, #pp-opciones); aquí solo se les pone el dibujo y el texto en su idioma.
'use strict';
// los dibujos, en un cuadro de 48: relleno blanco y contorno del color del botón (currentColor, que pone css/portada.css)
const PP_BARRA_ICONOS = Object.freeze({
  // AMIGOS (tarea #145): dos caritas sonrientes y un corazón rosa encima
  amigos: '<circle cx="14" cy="31" r="11"/><circle cx="34" cy="31" r="11"/><circle cx="10.5" cy="29" r="1.7" class="pp-ojo"/><circle cx="17.5" cy="29" r="1.7" class="pp-ojo"/><circle cx="30.5" cy="29" r="1.7" class="pp-ojo"/><circle cx="37.5" cy="29" r="1.7" class="pp-ojo"/><path d="M10 34q4 4 8 0M30 34q4 4 8 0" fill="none" stroke-width="2.6" stroke-linecap="round"/><path d="M24 22 16.5 14.5a4.6 4.6 0 0 1 7.5-5.3 4.6 4.6 0 0 1 7.5 5.3z" class="pp-cor"/>',
  companeros: '<circle cx="17" cy="27" r="11"/><circle cx="32" cy="22" r="11"/><circle cx="29" cy="21" r="1.6" class="pp-ojo"/><circle cx="35" cy="21" r="1.6" class="pp-ojo"/><circle cx="14" cy="26" r="1.6" class="pp-ojo"/><circle cx="20" cy="26" r="1.6" class="pp-ojo"/>',
  inicio: '<path d="M24 6 4 23h6v19h11V31h6v11h11V23h6z"/>',   // la casa de INICIO, en la barra del camino (js/camino-barra.js)
  perfil: '<circle cx="24" cy="17" r="10"/><path d="M8 42c1-10 8-14 16-14s15 4 16 14z"/>',
  duelo: '<path d="M27 4 11 27h11l-4 17 19-25H26z"/>',
  opciones: '<circle cx="24" cy="24" r="14" fill="none" stroke-width="9" stroke-dasharray="5.5 5.5" class="pp-dientes"/><circle cx="24" cy="24" r="12"/><circle cx="24" cy="24" r="4.5" class="pp-ojo"/>',
});
// los dibujos pintados por Yoshi (tarea #357, Pepins 25-11-2026): img-liso/bi-<clave>.png, tras el flag (preguntado en el momento)
const PP_BARRA_PINTADOS = Object.freeze(['amigos', 'companeros', 'duelo', 'inicio', 'opciones', 'perfil', 'tienda']);
const ppBarraPintada = () => NUCLEO.flag('iconos-barra', 'Pop: iconos de la barra pintados por Yoshi (tarea #357)', false);
// el dibujo de código de un botón (el de siempre, y el respaldo del pintado): SVG o, la tienda, la imagen de perlas
function ppBarraRespaldo(clave) {
  if (clave === 'tienda') return `<img class="pp-barra-ico" src="${PP_LISO ? 'img-liso' : 'img'}/i-perlas.png" alt=""${PP_LISO ? ' style="image-rendering:auto"' : ''}>`;
  return `<svg class="pp-barra-ico" viewBox="0 0 48 48" aria-hidden="true">${PP_BARRA_ICONOS[clave] || ''}</svg>`;
}
// el dibujo de un botón: con el flag, el pintado (marcado con data-respaldo para volver al de código si no carga)
function ppBarraIcono(clave) {
  if (!ppBarraPintada() || !PP_BARRA_PINTADOS.includes(clave)) return ppBarraRespaldo(clave);
  return `<img class="pp-barra-ico" src="img-liso/bi-${clave}.png" alt="" data-respaldo="${clave}" style="image-rendering:auto">`;
}
// pone dibujo y nombre a un botón de la barra (el candado de primeros pasos se añade después, en ppPrimerosPortada); si el dibujo
// pintado no carga, en su sitio va el de código
function ppBarraBoton(sel, clave, texto) {
  const b = $pp(sel); if (!b) return null;
  b.innerHTML = `${ppBarraIcono(clave)}<b>${texto}</b>`;
  const img = b.querySelector('img[data-respaldo]');
  if (img) img.onerror = () => { img.outerHTML = ppBarraRespaldo(clave); };
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
