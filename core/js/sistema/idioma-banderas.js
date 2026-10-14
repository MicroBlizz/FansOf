// Fans Of · BANDERAS: el selector de idioma de Opciones (automático, español, inglés): una bandera por idioma dentro de un <span id="idioma-banderas">.
// Lo usan la pantalla de Opciones de core (opciones.js) y los juegos ligeros (ligero.js). Cambiar de idioma recarga la página (lo guarda NUCLEO en este navegador).
'use strict';
const idiomaElegido = () => { try { return localStorage.getItem('fansof-idioma') || ''; } catch (e) { return ''; } };
// una bandera por idioma (y un globo para «el del navegador»): no pasa nada hasta que se toca una, y tocar la que ya está puesta no recarga
const BANDERAS = [
  ['', 'Automático (el idioma del navegador)', '<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#2b6cb0"/><circle cx="15" cy="10" r="7" fill="none" stroke="#fff" stroke-width="1.4"/><ellipse cx="15" cy="10" rx="3" ry="7" fill="none" stroke="#fff" stroke-width="1.2"/><path d="M8 10h14M9.2 6.6h11.6M9.2 13.4h11.6" stroke="#fff" stroke-width="1.2" fill="none"/></svg>'],
  ['es', 'Español', '<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/></svg>'],
  ['en', 'English', '<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#012169"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.6"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.4"/></svg>'],
];
// pinta las banderas dentro de `caja` y devuelve la función que marca la elegida (hay que llamarla al abrir Opciones)
function pintarBanderas(caja) {
  if (!caja) return () => {};
  caja.innerHTML = '';
  for (const [id, nombre, svg] of BANDERAS) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.idioma = id; b.title = nombre; b.setAttribute('aria-label', nombre); b.innerHTML = svg;
    b.addEventListener('click', () => { if (idiomaElegido() === id) return; play('select'); NUCLEO.elegirIdioma(id); });
    caja.appendChild(b);
  }
  return () => { for (const b of caja.children) b.setAttribute('aria-pressed', String(b.dataset.idioma === idiomaElegido())); };
}
