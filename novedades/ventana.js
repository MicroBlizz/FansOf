// Fans Of · la ventana NOVEDADES de la librería (index.html de la raíz) y la carga de la versión y las novedades de cada juego.
// Usa lo que define index.html antes: text(), grab(), show() y fail(). Lo que guarda (ENTRADAS, NOV_BOLETIN) lo usa también biblioteca/tienda.js.
'use strict';
// ---------- la ventana NOVEDADES ----------
// Nunca se abre sola (ADR 101): si hay algo nuevo desde la última visita en este navegador (un boletín nuevo o la versión nueva de algún juego)
// sale una tira discreta («Novedades · N nuevas») que la abre al pulsar. Desde la pestaña Novedades del menú se abre siempre, con todo.
// JUEGOS NUEVOS sale de novedades/lista.js (escrito a mano) y ACTUALIZACIONES, del js/novedades.js de cada juego de la portada: la nota entera de su
// última versión. Si ya habías venido, solo los juegos que han cambiado (y un botón para ver los demás).
// tr() llega con el idioma, que se carga aparte: hasta entonces el texto va tal cual (y la página lo traduce sola al pintarlo)
const t = (s, datos) => (typeof tr === 'function' ? tr(s, datos) : s);
const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nov = { fondo: document.getElementById('novedades'), volver: null };
const ENTRADAS = {};   // id de tarjeta → { ver, entries }: los informes de cada juego, para su ficha (biblioteca/tienda.js)
// el botón de jugar: todo se puede jugar (ADR 106)
function botonJugar(enlace) { return `<a class="ol" href="${esc(enlace)}">${esc(t('JUGAR'))}</a>`; }
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
// (las demos sin nucleo.js, como Fans of Roguelite, toman la versión de su primer informe). Los juegos que se leen son las tarjetas de la
// portada que ya están en la página (ADR 198): ninguna lista escrita aquí y ninguna petición más. Un juego nuevo solo pone su tarjeta.
// Cada uno es [id de tarjeta, carpeta, nombre]; la carpeta sale del botón JUGAR (games/<juego>/) y el nombre, del título de la tarjeta.
// Las tarjetas data-alfa solo existen en la copia de pruebas: fuera de la alfa no cuentan (biblioteca/tienda.js las quita después).
function juegosDeLaPortada(raiz, alfa) {
  const juegos = [];
  for (const tarjeta of raiz.querySelectorAll('section.game')) {
    const jugar = tarjeta.querySelector('a.play'), titulo = tarjeta.querySelector('h2');
    if (!jugar || !titulo || tarjeta.hidden || (tarjeta.hasAttribute('data-alfa') && !alfa)) continue;   // hidden: /gestion → Juegos la quitó de la portada (ADR 203)
    juegos.push([tarjeta.id, jugar.getAttribute('href'), titulo.textContent.trim()]);
  }
  return juegos;
}
const JUEGOS = juegosDeLaPortada(document, NUCLEO.alfa);
// Los informes de un juego están en su js/novedades.js, salvo que su index.html cargue los de otro juego (Rumble V2 y Clásico usan los de Rumble):
// entonces su tarjeta enseña esos, los mismos que ve quien lo juega, pero no repite fila en ACTUALIZACIONES ni cuenta en el aviso (ya los cuenta
// el juego de donde salen). Se piden una vez por juego y los usan su tarjeta, ACTUALIZACIONES y el aviso.
const NOVEDADES_DE_OTRO = /['"]\.\.\/\.\.\/games\/([a-z0-9-]+)\/js\/novedades\.js(?:\?v=[\d.]+)?['"]/;
const fuenteNovedades = (dir, page) => { const otro = NOVEDADES_DE_OTRO.exec(page); return otro ? `games/${otro[1]}/js/novedades.js` : dir + 'js/novedades.js'; };
const informe = dir => text(dir + 'index.html').then(page => {
  const fuente = fuenteNovedades(dir, page);
  return text(fuente).then(news => ({ page, news, propias: fuente === dir + 'js/novedades.js' }));
});
const quitaFila = id => { const f = document.getElementById('act-' + id); if (f) f.remove(); };
const INFORMES = new Map(JUEGOS.map(([id, dir]) => [id, informe(dir)]));
// se pinta con la página ya cargada: así el diccionario del idioma ya está y los textos salen traducidos
const cargada = new Promise(r => (document.readyState === 'complete' ? r() : window.addEventListener('load', r)));
for (const [id, , nombre] of JUEGOS) fila(id, nombre, '', t('Cargando…'));
for (const [id, , nombre] of JUEGOS) {
  Promise.all([INFORMES.get(id), cargada]).then(([{ page, news, propias }]) => {
    const entries = grab(news, 'NEWS', '];') || [];
    const ver = (/nucleo\.js\?v=([\d.]+)/.exec(page) || [])[1] || (entries[0] && entries[0].v);
    ENTRADAS[id] = { ver, entries, propias };
    show(id, ver, entries); if (propias) parche(id, ver, entries, nombre); else quitaFila(id);
    tiendaAlDia(id);
  }).catch(fail(id));
}
// el boletín se pide sin caché, como los informes de los juegos, para que salga al día en cuanto se publica (una vez: lo usa también el aviso)
const BOLETIN = text('novedades/lista.js');
Promise.all([BOLETIN, cargada]).then(([src]) => { NOV_BOLETINES = grab(src, 'NOVEDADES_WEB', '];') || []; NOV_BOLETIN = NOV_BOLETINES[0] || null; for (const id of nuevos()) fila(id); pintarNuevos(NOV_BOLETIN); pintarDestacado(); })
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
// la tira: contar lo nuevo y abrir la ventana con solo eso; abrirla o cerrar la tira da lo nuevo por visto
function mostrarAviso(cambios, guardar) {
  const aviso = document.getElementById('nov-aviso'), boton = document.getElementById('nov-aviso-abrir');
  boton.textContent = cambios.length === 1 ? t('Novedades · 1 nueva') : t('Novedades · {n} nuevas', { n: cambios.length });
  const visto = () => { aviso.hidden = true; guardar(); };
  boton.onclick = () => { visto(); abrirNovedades(boton, cambios); };
  document.getElementById('nov-aviso-x').onclick = visto;
  aviso.hidden = false;
}
Promise.allSettled([...INFORMES.values(), BOLETIN, cargada])
  .then(() => new Promise(r => setTimeout(r, 50)))   // que se pinten las filas
  .then(() => {
    const antes = leerVisto(), ahora = { b: NOV_BOLETIN ? NOV_BOLETIN.id : '', v: {} };
    for (const [id] of JUEGOS) if (ENTRADAS[id] && ENTRADAS[id].propias && ENTRADAS[id].ver) ahora.v[id] = ENTRADAS[id].ver;
    const guardar = () => { try { localStorage.setItem(VISTO, JSON.stringify(ahora)); } catch (e) { /* sin almacenamiento: el aviso sale siempre */ } };
    const cambios = LO_NUEVO.cambios(antes, ahora);
    if (location.hash === '#novedades') { guardar(); abrirNovedades(); return; }   // desde el menú de otra página (…/#novedades): todas
    if (!cambios || !cambios.length) { guardar(); return; }   // primera visita (o sin memoria) o nada nuevo: la portada no se interrumpe (ADR 101)
    mostrarAviso(cambios, guardar);
  });
