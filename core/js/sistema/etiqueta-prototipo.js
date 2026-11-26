// Fans Of · la ETIQUETA «PROTOTIPO» dentro de cada juego (ADR 106): pequeña, de serie en el borde izquierdo, encima de la pestaña de comentarios, y solo
// fuera de partida. En la alfa y en local se arrastra a cualquier borde (FLOTANTES, ADR 217). No se cierra ni avisa de nada: dice lo que es y, al tocarla, abre la ficha del juego en la biblioteca, que es donde se vota.
// Es la misma en todos los juegos (core no sabe el tipo de cada uno ni lleva un `if` por juego). Tiene su propio estilo, como la pestaña de comentarios.
'use strict';
const ETIQUETA_PROTOTIPO = (() => {
  // la ficha vive en la biblioteca, dos carpetas por encima del juego (también en /alfa/); en la app de Android, en la web de verdad
  const enlace = (id, nativa) => (nativa ? 'https://fansof.games/' : '../../') + '#juego-' + encodeURIComponent(String(id || ''));
  // dónde va (en px desde la izquierda) junto al escenario que empieza en `x`: si a su izquierda hay sitio, fuera, pegada a su marco
  // (los juegos lo dibujan con hasta 16 px de borde), para no tapar nada del juego; si no (en el móvil), en el borde de la pantalla.
  // La usa también la pestaña de comentarios (feedback.js), para ir las dos juntas (tarea #185)
  const FUERA = 30 + 20;   // el ancho de la pestaña de comentarios, la más ancha, y el marco con un poco de aire
  const borde = x => (x >= FUERA ? Math.round(x - FUERA) : 0);
  if (typeof document === 'undefined') return { enlace, borde };
  // lo de más hacia dentro en cada borde (lo que pide FLOTANTES): en los lados, fuera del marco del juego si hay sitio; arriba y abajo, nada
  const fuera = b => {
    const st = document.getElementById('stage'); if (!st || (b !== 'izq' && b !== 'der')) return 0;
    const r = st.getBoundingClientRect();
    return borde(b === 'izq' ? r.left : document.documentElement.clientWidth - r.right);
  };
  const css = document.createElement('style');
  css.textContent = `
  #fo-prototipo { position: fixed; left: 0; bottom: calc(30% + 54px); z-index: 39; width: 22px; padding: 7px 0; box-sizing: border-box; display: flex; justify-content: center; text-decoration: none;
    border: 2px solid #20102c; border-left: 0; border-radius: 0 9px 9px 0; background: rgba(255, 203, 61, .9); color: #20102c; opacity: .8; font: 800 10px/1 "Baloo 2", system-ui, sans-serif; letter-spacing: .08em; }
  #fo-prototipo:hover, #fo-prototipo:focus-visible { opacity: 1; }
  #fo-prototipo[hidden] { display: none; }
  #fo-prototipo span { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; }
  #fo-prototipo[data-borde=der] { border-left: 2px solid #20102c; border-right: 0; border-radius: 9px 0 0 9px; }
  #fo-prototipo[data-borde=arriba], #fo-prototipo[data-borde=abajo] { width: auto; padding: 0 7px; height: 22px; align-items: center; border: 2px solid #20102c; }
  #fo-prototipo[data-borde=arriba] { border-top: 0; border-radius: 0 0 9px 9px; } #fo-prototipo[data-borde=abajo] { border-bottom: 0; border-radius: 9px 9px 0 0; }
  #fo-prototipo[data-borde=arriba] span, #fo-prototipo[data-borde=abajo] span { writing-mode: horizontal-tb; transform: none; }`;
  const a = document.createElement('a');
  a.id = 'fo-prototipo'; a.target = '_blank'; a.rel = 'noopener'; a.hidden = true; a.innerHTML = '<span></span>';
  let sitio = null;   // lo que devuelve FLOTANTES.movible (null fuera de la alfa y de local: va como siempre)
  const pinta = () => {
    a.hidden = !!(typeof enPartida === 'function' && enPartida());
    a.firstChild.textContent = tr('PROTOTIPO'); a.title = tr('Esto es un prototipo: toca para votarlo en su ficha'); a.setAttribute('aria-label', a.title);
    if (sitio) { sitio.coloca(); return; }   // el marco del juego puede haberse movido
    const st = document.getElementById('stage'); a.style.left = borde(st ? st.getBoundingClientRect().left : 0) + 'px';
  };
  const iniciar = () => {
    a.href = enlace(typeof AJUSTES !== 'undefined' ? AJUSTES.id : '', typeof NUCLEO !== 'undefined' && NUCLEO.nativa);
    document.head.appendChild(css); document.body.append(a);
    sitio = FLOTANTES.movible(a, { id: 'prototipo', borde: 'izq', a: 0.7, d: -97, hueco: 0, fuera }); pinta();   // de serie, justo encima de la pestaña de comentarios
    window.addEventListener('resize', pinta); setInterval(pinta, 1500);
  };
  if (document.body) iniciar(); else window.addEventListener('DOMContentLoaded', iniciar);
  return { enlace, borde, fuera };
})();
if (typeof module !== 'undefined') module.exports = ETIQUETA_PROTOTIPO;
