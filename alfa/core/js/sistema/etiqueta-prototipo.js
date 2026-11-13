// Fans Of · la ETIQUETA «PROTOTIPO» dentro de cada juego (ADR 106): pequeña, fija en el borde izquierdo, encima de la pestaña de comentarios, y solo
// fuera de partida. No se cierra ni avisa de nada: dice lo que es y, al tocarla, abre la ficha del juego en la biblioteca, que es donde se vota.
// Es la misma en todos los juegos (core no sabe el tipo de cada uno ni lleva un `if` por juego). Tiene su propio estilo, como la pestaña de comentarios.
'use strict';
const ETIQUETA_PROTOTIPO = (() => {
  // la ficha vive en la biblioteca, dos carpetas por encima del juego (también en /alfa/); en la app de Android, en la web de verdad
  const enlace = (id, nativa) => (nativa ? 'https://fansof.games/' : '../../') + '#juego-' + encodeURIComponent(String(id || ''));
  if (typeof document === 'undefined') return { enlace };
  const css = document.createElement('style');
  css.textContent = `
  #fo-prototipo { position: fixed; left: 0; bottom: calc(30% + 54px); z-index: 39; width: 22px; padding: 7px 0; box-sizing: border-box; display: flex; justify-content: center; text-decoration: none;
    border: 2px solid #20102c; border-left: 0; border-radius: 0 9px 9px 0; background: rgba(255, 203, 61, .9); color: #20102c; opacity: .8; font: 800 10px/1 "Baloo 2", system-ui, sans-serif; letter-spacing: .08em; }
  #fo-prototipo:hover, #fo-prototipo:focus-visible { opacity: 1; }
  #fo-prototipo[hidden] { display: none; }
  #fo-prototipo span { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; }`;
  const a = document.createElement('a');
  a.id = 'fo-prototipo'; a.target = '_blank'; a.rel = 'noopener'; a.hidden = true; a.innerHTML = '<span></span>';
  const pinta = () => {
    a.hidden = !!(typeof enPartida === 'function' && enPartida());
    a.firstChild.textContent = tr('PROTOTIPO'); a.title = tr('Esto es un prototipo: toca para votarlo en su ficha'); a.setAttribute('aria-label', a.title);
    const st = document.getElementById('stage'); a.style.left = (st ? Math.max(0, st.getBoundingClientRect().left) : 0) + 'px';
  };
  const iniciar = () => {
    a.href = enlace(typeof AJUSTES !== 'undefined' ? AJUSTES.id : '', typeof NUCLEO !== 'undefined' && NUCLEO.nativa);
    document.head.appendChild(css); document.body.append(a); pinta();
    window.addEventListener('resize', pinta); setInterval(pinta, 1500);
  };
  if (document.body) iniciar(); else window.addEventListener('DOMContentLoaded', iniciar);
  return { enlace };
})();
if (typeof module !== 'undefined') module.exports = ETIQUETA_PROTOTIPO;
