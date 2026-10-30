// Fans of Karts · EL MENÚ PRINCIPAL en HTML, con los botones de Fans of Rumble (core/css/menus.css): JUGAR grande y naranja en el
// centro, TUTORIAL y PVP a los lados (violetas, con su dibujo) y abajo la fila de baldosas: TIENDA, PASE, AYUDA y OPCIONES. El título en
// pixel art y el paseo de fondo siguen pintándose en el lienzo (pantallas.js). La capa se coloca y se escala sobre el lienzo.
'use strict';

const SVG_MENU = {
  tutorial: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.5l3 3L8 20.5a2.2 2.2 0 0 1-3-3z" fill="#ff8a1f" style="stroke: var(--outline)" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 14l1.6 1.6M12 11.4l1.4 1.4" stroke="#b3360a" stroke-width="1.4" stroke-linecap="round"/><path d="M15 6c-.5-2 .3-3.6 1.6-3.8.2 1.6-.4 2.6-1.6 3.8zM16 7c1.6-1.4 3.4-1.6 4.6-.6-1.2 1.2-2.8 1.4-4.6.6zM15.5 6.5c.6-1.8 2.2-2.8 3.6-2.4-.6 1.6-1.8 2.4-3.6 2.4z" fill="#5ef27a" style="stroke: var(--outline)" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  pvp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4" stroke="#20102c" stroke-width="2" stroke-linecap="round"/><path d="M5 4h8v7H5z" fill="#fff6ea" style="stroke: var(--outline)" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 4h2.7v2.3H5zM10.3 4H13v2.3h-2.7zM7.7 6.3h2.6v2.4H7.7zM5 8.7h2.7V11H5zM10.3 8.7H13V11h-2.7z" fill="#20102c"/><path d="M19 21V7" stroke="#20102c" stroke-width="2" stroke-linecap="round"/><path d="M19 7h-6.5l1.5 3-1.5 3H19z" fill="#ff5c8a" style="stroke: var(--outline)" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  tienda: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 8h15l-1.2 12.2a1.6 1.6 0 0 1-1.6 1.4H7.3a1.6 1.6 0 0 1-1.6-1.4z" fill="#ffcb3d" style="stroke: var(--outline)" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10" fill="none" stroke="#20102c" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="15" r="2.4" fill="#ff8a1f" style="stroke: var(--outline)" stroke-width="1.2"/></svg>',
  pase: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5z" fill="#d08cff" style="stroke: var(--outline)" stroke-width="1.8" stroke-linejoin="round"/><path d="M15 5v14" stroke="#20102c" stroke-width="1.4" stroke-dasharray="2 2"/><path d="M9 9.2l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="#ffe07a" style="stroke: var(--outline)" stroke-width="1"/></svg>',
  ayuda: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z" fill="#63cfe0" style="stroke: var(--outline)" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.6 7.8a2.4 2.4 0 1 1 3.3 2.2c-.6.3-.9.7-.9 1.3v.3" fill="none" stroke="#20102c" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="14" r="1" fill="#20102c"/></svg>',
  opciones: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6.5" fill="#cdb9ea" style="stroke: var(--outline)" stroke-width="1.8"/><circle cx="12" cy="12" r="2.4" fill="#20102c"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="#20102c" stroke-width="2.4" stroke-linecap="round"/></svg>',
};
const MENU = { caja: null, clave: '' };
// el botón con su dibujo y su texto
const botonMenu = (cl, svg, txt, accion, extra) => el('button.' + cl, { 'data-k': 1, on: accion, html: SVG_MENU[svg] + '<span>' + txt + '</span>' + (extra || '') });

function pintaMenuHtml() {
  if (!MENU.caja) { MENU.caja = el('div', { id: 'kt-menu' }); document.body.appendChild(MENU.caja); }
  const pasePendiente = nivelPase() < KPASE.length && SAVE.xp % KECO.xpNivel >= KECO.xpNivel * 0.8;
  const aviso = '<i class="kt-punto"></i>';
  MENU.caja.replaceChildren(el('div.kt-menu-in', {},
    el('div.kt-menu-fila', {},
      botonMenu('side-mode.ol' + (tutoHecho() ? '' : '.kt-brilla'), 'tutorial', tr('TUTORIAL'), empiezaTutorial),
      el('button.btn-big.ol', { 'data-k': 1, on: () => ve('piloto') }, tr('JUGAR')),
      botonMenu('side-mode.ol.kt-pvp', 'pvp', tr('PVP'), () => { KPVP.error = ''; KPVP.aviso = ''; ve('pvp'); })),
    el('div.kt-menu-baldosas', {},
      botonMenu('home-tile', 'tienda', tr('TIENDA'), () => abreTienda('destacado')),
      botonMenu('home-tile', 'pase', tr('PASE'), () => ve('pase'), pasePendiente ? aviso : ''),
      botonMenu('home-tile', 'ayuda', tr('AYUDA'), () => ve('ayuda')),
      botonMenu('home-tile', 'opciones', tr('OPCIONES'), () => { ve('opciones'); PANT.vuelve = 'titulo'; }))));
  NAV.raiz = MENU.caja; NAV.i = 1;      // Intro (o A en el mando) va directo a JUGAR
}
// encima del lienzo, en su mitad de abajo, del tamaño que toque
function colocaMenu() {
  const r = rectoJuego(), alto = r.h * 0.38, esc = Math.min(r.w / 600, alto / 215);
  Object.assign(MENU.caja.style, { left: r.x + r.w / 2 + 'px', top: r.y + r.h * 0.545 + 'px', transform: 'translateX(-50%) scale(' + esc.toFixed(3) + ')' });
}
// cada fotograma del título (pantallas.js)
function menuPrincipal() {
  calmaLienzo();
  const clave = [IDIOMA_K, tutoHecho(), nivelPase(), SAVE.xp].join('|');
  if (!MENU.caja || MENU.caja.hidden || clave !== MENU.clave) { MENU.clave = clave; pintaMenuHtml(); }
  MENU.caja.hidden = false; colocaMenu();
  if (KPREMIOS.length) return;
  navega(MENU.caja, () => { /* en el título, atrás no hace nada */ });
}
function menuVista() { if (MENU.caja && PANT.id !== 'titulo' && !MENU.caja.hidden) MENU.caja.hidden = true; }
