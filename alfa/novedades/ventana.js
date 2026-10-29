// Fans Of · la ventana NOVEDADES de la librería (index.html de la raíz) y la carga de la versión y las novedades de cada juego.
// Usa lo que define index.html antes: text(), grab(), show() y fail(). Lo que guarda (ENTRADAS, NOV_BOLETIN) lo usa también biblioteca/tienda.js.
'use strict';
// ---------- la ventana NOVEDADES ----------
// Sale SOLA solo si hay algo nuevo desde la última visita en este navegador (un boletín nuevo o la versión nueva de algún juego);
// si no, no molesta (al volver de jugar, por ejemplo). Desde la pestaña Novedades del menú se abre siempre, con todo.
// JUEGOS NUEVOS sale de novedades/lista.js (escrito a mano) y ACTUALIZACIONES, del js/novedades.js de cada juego: la nota entera de su
// última versión. Si ya habías venido, solo los juegos que han cambiado (y un botón para ver los demás).
// tr() llega con el idioma, que se carga aparte: hasta entonces el texto va tal cual (y la página lo traduce sola al pintarlo)
const t = (s, datos) => (typeof tr === 'function' ? tr(s, datos) : s);
const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nov = { fondo: document.getElementById('novedades'), volver: null };
const ENTRADAS = {};   // id de tarjeta → { ver, entries }: los informes de cada juego, para su ficha (biblioteca/tienda.js)
// el botón de jugar sigue la misma lógica que los de la biblioteca (core/js/proximamente.js): cerrado en la release → PRÓXIMAMENTE; abierto solo por el rol beta → JUGAR BETA
function botonJugar(enlace) {
  const id = (String(enlace).match(/(?:games|demos)\/([^/]+)/) || [])[1];
  if (id && !PROXIMAMENTE.jugable(id)) return `<span class="ol" style="opacity:.6">${esc(t('PRÓXIMAMENTE'))}</span>`;
  return `<a class="ol" href="${esc(enlace)}">${esc(t(id && PROXIMAMENTE.enBeta(id) ? 'JUGAR BETA' : 'JUGAR'))}</a>`;
}
// JUEGOS NUEVOS: del boletín de novedades/lista.js (solo el primero), con el color de su tarjeta en la librería
function pintarNuevos(b) {
  const caja = document.getElementById('nov-nuevos');
  document.getElementById('nov-sub').textContent = b ? t(b.fecha) : '';
  caja.innerHTML = b && b.nuevos && b.nuevos.length ? `<h3 class="ol">${esc(t('JUEGOS NUEVOS'))}</h3>` + b.nuevos.map(j => {
    const tarjeta = document.getElementById(j.tarjeta), color = tarjeta ? tarjeta.style.getPropertyValue('--wc') : '';
    return `<div class="nov-nuevo"${color ? ` style="--wc: ${esc(color)}"` : ''}><div><b class="ol">${esc(t(j.nombre))}</b><span>${esc(t(j.texto))}</span></div>`
      + botonJugar(j.enlace) + '</div>';
  }).join('') : '';
  // las demos sin informe propio; las que ya tienen js/novedades.js salen solas en su línea
  for (const o of (b && b.otros) || []) if (!JUEGOS.some(j => j[0] === o.tarjeta)) fila(o.tarjeta, o.nombre, '', t(o.texto));
}
// ACTUALIZACIONES: una línea por juego, que se rellena cuando llega su informe; los juegos que salen como nuevos no se repiten
const nuevos = () => new Set(((NOV_BOLETIN && NOV_BOLETIN.nuevos) || []).map(j => j.tarjeta));
let NOV_BOLETIN = null, NOV_BOLETINES = [];   // el último boletín (la ventana) y todos (el DESTACADO de biblioteca/tienda.js)
function fila(id, nombre, ver, texto, html) {
  if (nuevos().has(id)) { const f = document.getElementById('act-' + id); if (f) f.remove(); return; }
  let f = document.getElementById('act-' + id);
  if (!f) { f = document.createElement('a'); f.className = 'nov-fila'; f.id = 'act-' + id; f.href = '#' + id; f.dataset.cierra = id; document.getElementById('nov-act').appendChild(f); }
  f.dataset.ver = ver || '';
  f.innerHTML = `<b class="ol">${esc(t(nombre))}</b>${ver ? `<small>${esc(t('versión ' + ver))}</small>` : ''}` + (html ? `<div class="nov-det">${html}</div>` : `<span>${esc(texto)}</span>`);
}
// de un informe, los títulos en negrita, en minúsculas para que no griten (sin tocar siglas como PvP o CEO)
const SIGLAS = { pvp: 'PvP', ceo: 'CEO', caos: 'CAOS', ia: 'IA', td: 'TD', '3d': '3D', ps1: 'PS1' };
const suave = x => { const s = x.toLowerCase().replace(/[\wáéíóúñü]+/g, w => SIGLAS[w] || w); return s.charAt(0).toUpperCase() + s.slice(1); };
const titulares = n => ((n && n.real) || []).map(r => (/<b>([^<]+)<\/b>/.exec(r) || [])[1]).filter(Boolean);
function resumen(entries) {
  // el último informe con algo que contar (los de «mejoras por dentro» se saltan si hay otro antes)
  const n = entries.find(e => titulares(e).some(h => !/MEJORAS POR DENTRO/i.test(h))) || entries[0];
  const hs = titulares(n).filter(h => !/MEJORAS POR DENTRO/i.test(h)).slice(0, 2).map(h => suave(t(h)));
  return hs.length ? hs.join(' · ') : t('Mejoras por dentro');
}
// la nota entera de la última versión (lo nuevo y la nota de Microblizz o Phony), con el mismo texto que enseña el juego
function parche(id, ver, entries, nombre) {
  const n = entries[0];
  if (!n) { fila(id, nombre, ver, t('No se han podido leer las novedades.')); return; }
  fila(id, nombre, ver, '', newsLista(n.real) + newsLista(n.joke, 'joke'));
}
function abrirNovedades(desde, soloCambios) {
  filtrar(soloCambios || null);
  nov.volver = desde || null; nov.fondo.hidden = false; document.body.style.overflow = 'hidden';
  document.getElementById('nov-cuerpo').scrollTop = 0; document.getElementById('nov-ok').focus({ preventScroll: true });
}
function cerrarNovedades() {
  if (nov.fondo.hidden) return;
  nov.fondo.hidden = true; document.body.style.overflow = '';
  if (location.hash === '#novedades') history.replaceState(null, '', location.pathname + location.search);
  if (nov.volver) nov.volver.focus({ preventScroll: true });
}
document.getElementById('abrir-novedades').onclick = e => { e.preventDefault(); abrirNovedades(e.currentTarget); };
document.getElementById('nov-todas').onclick = () => filtrar(null);
document.getElementById('nov-ok').onclick = cerrarNovedades;
document.getElementById('nov-x').onclick = cerrarNovedades;
nov.fondo.addEventListener('click', e => {
  const enlace = e.target.closest('[data-cierra]');
  if (e.target === nov.fondo || enlace) cerrarNovedades();
  if (enlace) { e.preventDefault(); abrirFicha(enlace.dataset.cierra); }   // una línea de ACTUALIZACIONES abre la ficha de ese juego
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarNovedades(); });

// Cada juego escribe su versión en un solo sitio, el ?v= de core/js/nucleo.js en su index.html, y sus informes en js/novedades.js
// (las demos sin nucleo.js, como Fans of Roguelite, toman la versión de su primer informe)
const JUEGOS = [['g-rumble', 'games/rumble/', 'FANS OF RUMBLE'], ['g-td', 'games/td/', 'FANS OF TD'], ['g-jump', 'games/jump/', 'FANS OF JUMP'], ['g-crush', 'games/crush/', 'FANS OF CRUSH'], ['g-survivors', 'games/survivors/', 'FANS OF SURVIVORS'],
  ['g-tacticas', 'games/tacticas/', 'FANS OF RUMBLE: TÁCTICAS'], ['g-skate', 'games/skate/', 'FANS OF SKATE'], ['g-dark', 'games/dark/', 'FANS OF DARK'], ['g-island', 'games/island/', 'FANS OF ISLAND'], ['g-rouflage', 'games/rouflage/', 'FANS OF ROUFLAGE'], ['g-roguelite', 'demos/roguelite/', 'FANS OF ROGUELITE'],
  ['g-rumble-3d', 'demos/rumble-3d/', 'FANS OF RUMBLE 3D'], ['g-tactics-advance', 'demos/tactics-advance/', 'FANS OF TACTICS ADVANCE'], 
  ['g-dungeons', 'demos/dungeons/', 'FANS OF DUNGEONS'], ['g-karts', 'games/karts/', 'FANS OF KARTS'], ['g-boom', 'games/boom/', 'FANS OF BOOM'], ['g-cooking', 'games/cooking/', 'FANS OF COOKING'], ['g-taxi', 'games/taxi/', 'FANS OF TAXI'], ['g-recruit', 'demos/recruit/', 'FANS OF RECRUIT'], ['g-terminal-shock', 'demos/terminal-shock/', 'TERMINAL SHOCK'], ['g-ratkov', 'games/ratkov/', 'FANS OF RATKOV'], ['g-nova', 'games/nova/', 'FANS OF NOVA'], ['g-beams', 'demos/beams/', 'FANS OF BEAMS'], ['g-snakes', 'demos/snakes/', 'FANS OF SNAKES'], ['g-merge', 'demos/merge/', 'FANS OF MERGE'], ['g-goose', 'demos/goose/', 'FANS OF GOOSE'], ['g-auto', 'demos/auto/', 'FANS OF AUTO'], ['g-decks', 'games/decks/', 'FANS OF DECKS']];
// se pinta con la página ya cargada: así el diccionario del idioma ya está y los textos salen traducidos
const cargada = new Promise(r => (document.readyState === 'complete' ? r() : window.addEventListener('load', r)));
for (const [id, , nombre] of JUEGOS) fila(id, nombre, '', t('Cargando…'));
for (const [id, dir, nombre] of JUEGOS) {
  Promise.all([text(dir + 'index.html'), text(dir + 'js/novedades.js'), cargada]).then(([page, news]) => {
    const entries = grab(news, 'NEWS', '];') || [];
    const ver = (/nucleo\.js\?v=([\d.]+)/.exec(page) || [])[1] || (entries[0] && entries[0].v);
    ENTRADAS[id] = { ver, entries };
    show(id, ver, entries); parche(id, ver, entries, nombre); tiendaAlDia(id);
  }).catch(fail(id));
}
// el boletín se pide sin caché, como los informes de los juegos, para que salga al día en cuanto se publica
Promise.all([text('novedades/lista.js'), cargada]).then(([src]) => { NOV_BOLETINES = grab(src, 'NOVEDADES_WEB', '];') || []; NOV_BOLETIN = NOV_BOLETINES[0] || null; for (const id of nuevos()) fila(id); pintarNuevos(NOV_BOLETIN); pintarDestacado(); })
  .catch(() => { pintarNuevos(null); pintarDestacado(); });

// ---------- ¿hay algo nuevo desde la última visita? ----------
// Se recuerda en este navegador qué boletín y qué versión de cada juego viste. La ventana sale sola si cambió algo (o si es la primera vez).
const VISTO = 'fansof-novedades-visto';
const leerVisto = () => { try { const v = JSON.parse(localStorage.getItem(VISTO) || 'null'); return v && typeof v === 'object' ? v : null; } catch (e) { return null; } };
// con `cambios` (lista de ids) se enseñan solo esos juegos y el botón VER TODAS; sin él, todo
function filtrar(cambios) {
  const solo = cambios ? new Set(cambios) : null;
  for (const f of document.querySelectorAll('#nov-act .nov-fila')) f.hidden = !!solo && !solo.has(f.id.slice(4));
  document.getElementById('nov-nuevos').hidden = !!solo && !solo.has('boletin');
  document.getElementById('nov-todas').hidden = !solo;
  document.getElementById('nov-desde').hidden = !solo;
}
Promise.allSettled([...JUEGOS.map(([id, dir]) => Promise.all([text(dir + 'index.html'), text(dir + 'js/novedades.js')])), text('novedades/lista.js'), cargada])
  .then(() => new Promise(r => setTimeout(r, 50)))   // que se pinten las filas
  .then(() => {
    const antes = leerVisto(), ahora = { b: NOV_BOLETIN ? NOV_BOLETIN.id : '', v: {} };
    for (const [id] of JUEGOS) if (ENTRADAS[id] && ENTRADAS[id].ver) ahora.v[id] = ENTRADAS[id].ver;
    try { localStorage.setItem(VISTO, JSON.stringify(ahora)); } catch (e) { /* sin almacenamiento: sale siempre, como antes */ }
    if (location.hash === '#novedades') { abrirNovedades(); return; }   // desde el menú de otra página (…/#novedades): todas
    if (!antes) { abrirNovedades(); return; }   // primera visita (o sin memoria): todo
    const cambios = Object.keys(ahora.v).filter(id => antes.v && antes.v[id] !== ahora.v[id]);
    if (ahora.b && ahora.b !== antes.b) cambios.push('boletin');
    if (cambios.length) abrirNovedades(null, cambios);
  });
