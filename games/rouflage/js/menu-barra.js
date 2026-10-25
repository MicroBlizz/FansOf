// Fans of Rouflage · LA BARRA DE ARRIBA DE LOS MENÚS y EL BOTÓN DE ATRÁS (decidido por Daniel el 24-10-2026: «tengo que tirar para abajo y para arriba
// y buscar dónde volver»). Cada menú que tiene un botón de volver recibe arriba una barra fija con una flecha naranja a la izquierda y su título en medio;
// la flecha pulsa el botón de volver de siempre (así hace lo mismo que hacía), y ese botón de abajo se esconde. Solo se desplaza lo de dentro del menú.
// Además el botón de atrás del móvil (la app de Android o el gesto del navegador) vuelve al menú anterior; en partida abre la pausa.
// Lo que no lleva flecha: el título, MI ESCENARIO (tiene su barra), la pausa, el final y los avisos pequeños (cada botón hace una cosa distinta).
'use strict';
// pantalla → botón que hace de «volver». En «Cómo se juega» ENTENDIDO se queda también abajo: la primera vez es el que te lleva a jugar.
const BARRA_MENU = {
  volver: {
    'p-bots': 'b-bots-volver', 'p-ayuda': 'b-ayuda-ok', 'p-opciones': 'b-opciones-ok', 'p-pvp': 'b-pvp-volver', 'p-amigos': 'b-amigos-volver',
    'p-clasif': 'b-clasif-volver', 'p-pvp-info': 'b-info-ok', 'p-armario': 'b-ar-volver', 'p-tienda': 'b-tienda-volver', 'p-gacha': 'b-gacha-volver',
    'p-pase': 'b-pase-volver', 'p-misiones': 'b-mis-volver', 'p-talentos': 'b-tal-volver', 'p-diario': 'b-diario-volver',
    'p-amigoslista': 'b-amg-volver', 'p-temporada': 'b-tem-volver', 'p-invita': 'b-inv-volver', 'p-perfil': 'b-pf-volver',
  },
  seQueda: ['b-ayuda-ok'],
  // donde el título va dentro de una cabecera propia, se sube la cabecera entera
  cabecera: { 'p-armario': '.ar-cabeza', 'p-gacha': '.gacha-cab' },
};
const FLECHA_ATRAS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function preparaBarrasMenu() {
  for (const [id, idVolver] of Object.entries(BARRA_MENU.volver)) {
    const p = E(id), vol = E(idVolver); if (!p || !vol) continue;
    const caja = p.querySelector(':scope > .caja'); if (!caja || caja.querySelector(':scope > .mb-barra')) continue;
    p.classList.add('con-barra');
    const barra = document.createElement('div'); barra.className = 'mb-barra';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'mb-atras'; b.id = 'mb-atras-' + id.slice(2);
    b.setAttribute('data-tr-aria', ''); b.setAttribute('aria-label', typeof tr === 'function' ? tr('Volver') : 'Volver'); b.innerHTML = FLECHA_ATRAS;
    b.onclick = () => { if (!vol.disabled) vol.click(); };
    const titulo = (BARRA_MENU.cabecera[id] && caja.querySelector(BARRA_MENU.cabecera[id])) || caja.querySelector(':scope > h2');
    const medio = titulo || document.createElement('span'); medio.classList.add('mb-titulo');
    // una cabecera propia (con su contador o su botón de info) ocupa también el hueco de la derecha
    if (titulo && titulo.tagName !== 'H2') { medio.classList.add('mb-ancho'); barra.append(b, medio); } else barra.append(b, medio, document.createElement('span'));
    caja.prepend(barra);
    if (!BARRA_MENU.seQueda.includes(idVolver)) vol.classList.add('mb-escondido');
    const viejo = caja.querySelector('.gacha-atras'); if (viejo && viejo !== vol) viejo.classList.add('mb-escondido');
    // al abrir el menú, su contenido empieza arriba
    new MutationObserver(() => { if (!p.hidden) caja.scrollTop = 0; }).observe(p, { attributes: true, attributeFilter: ['hidden'] });
  }
}

/* ---------- el botón de atrás del móvil ---------- */
function pantallaVisible() { return [...document.querySelectorAll('.pantalla')].find(p => !p.hidden) || null; }
// devuelve true si ha hecho algo (y entonces no hay que salir del juego)
function atrasMovil() {
  const avisoCompra = document.querySelector('.ar-compra:not([hidden])');
  if (avisoCompra && typeof arCompraCierra === 'function') { arCompraCierra(); return true; }
  const p = pantallaVisible();
  if (p) {
    if (p.id === 'p-titulo') return false;
    const f = p.querySelector('.mb-atras'); if (f) { f.click(); return true; }
    if (p.id === 'p-pausa') { E('b-seguir').click(); return true; }
    if (p.id === 'p-escenario') { E('b-esc-volver').click(); return true; }
    return true;      // la pausa, el final y los avisos: se responden con sus botones, atrás no hace nada
  }
  if (typeof TALLER !== 'undefined' && TALLER.abierto && typeof cierraTaller === 'function') { cierraTaller(); return true; }
  if (typeof VISITA !== 'undefined' && VISITA.activa) { visitaSale(); return true; }      // de visita en un escenario: se vuelve (visita.js)
  if (typeof accionPausa === 'function' && J && (J.fase === 'prep' || J.fase === 'caza' || J.fase === 'cuenta')) { accionPausa(); return true; }
  return true;
}
function preparaAtrasMovil() {
  const nativa = window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform();
  const App = nativa && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (App && App.addListener) {
    App.addListener('backButton', e => { if (atrasMovil()) return; if (e && e.canGoBack) history.back(); else if (App.exitApp) App.exitApp(); });
    return;
  }
  if (nativa) return;
  // en el navegador: una entrada de historial de más; si el atrás se usa dentro del juego, se vuelve a poner
  try { history.pushState({ rouflage: 1 }, ''); } catch (_) { return; }
  addEventListener('popstate', () => {
    if (atrasMovil()) { try { history.pushState({ rouflage: 1 }, ''); } catch (_) { /* nada */ } }
    else history.back();
  });
}

/* ---------- el título cabe siempre entero (sin desplazarse arriba y abajo) ---------- */
// Si la pantalla es bajita, el título se reduce entero en la misma proporción hasta caber (--escala-titulo, estilo-barra.css).
function encajaTitulo() {
  const p = E('p-titulo'), c = p && p.querySelector('.titulo-caja'); if (!c || p.hidden) return;
  const r = document.documentElement.style;
  const actual = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--escala-titulo')) || 1;
  const cs = getComputedStyle(p);
  const hueco = p.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const natural = c.getBoundingClientRect().height / actual;
  const z = Math.max(0.5, Math.min(1, (hueco - 2) / natural));
  if (Math.abs(z - actual) > 0.005) r.setProperty('--escala-titulo', String(Math.round(z * 1000) / 1000));
}
function preparaTituloFijo() {
  const p = E('p-titulo'), c = p && p.querySelector('.titulo-caja'); if (!c) return;
  const otra = () => requestAnimationFrame(encajaTitulo);
  addEventListener('resize', otra);
  addEventListener('orientationchange', () => setTimeout(otra, 250));
  new MutationObserver(otra).observe(p, { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(otra).observe(c, { attributes: true, subtree: true, attributeFilter: ['hidden'] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(otra);
  otra();
}

preparaBarrasMenu();
preparaAtrasMovil();
preparaTituloFijo();
