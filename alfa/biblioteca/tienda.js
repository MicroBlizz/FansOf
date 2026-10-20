// Fans Of · LA TIENDA de la librería (index.html de la raíz), con el aire de Steam pero con nuestro estilo:
//   · cada <section class="game"> de index.html se convierte en una tarjeta con su captura, su tipo, sus etiquetas y su versión;
//   · DESTACADO, arriba: los juegos nuevos del boletín (novedades/lista.js), uno tras otro;
//   · al tocar una tarjeta se abre su FICHA: capturas grandes, JUGAR, versión, de qué va, lo último y todas sus novedades.
// Lo que cada tarjeta necesita se escribe en su <section> de index.html:
//   data-tipo="Prototipo"  data-etiquetas="Acción · Hordas"  data-capturas="survivors-1.jpg survivors-2.jpg"  (y data-horizontal si las capturas son apaisadas; data-alfa si la tarjeta solo va en la alfa)
//   Un prototipo parado va en <section id="en-pausa"> con data-tipo="En pausa" y data-pausa="por qué está parado" (su inglés en biblioteca/en.js).
// Las capturas van en biblioteca/capturas/ (partidas de verdad: sin regalo diario, ni novedades, ni menús de opciones).
// Usa lo que ya tiene la página: esc(), t(), newsLista(), newsHtml(), nuevos(), cerrarNovedades() y la lista ENTRADAS que llena la carga de novedades.
'use strict';
const CAPTURAS = 'biblioteca/capturas/';
document.querySelectorAll('section.game[data-alfa]').forEach(s => { if (!NUCLEO.alfa) s.remove(); });   // data-alfa: tarjeta que solo existe en la copia de pruebas
const TARJETAS = [...document.querySelectorAll('section.game')];
function datosDe(s) {
  return {
    id: s.id, nombre: s.querySelector('h2').textContent, texto: s.querySelector('p').textContent, jugar: s.querySelector('a.play').getAttribute('href'), apk: s.dataset.apk || '',
    color: s.style.getPropertyValue('--wc'), tipo: s.dataset.tipo || '', horizontal: 'horizontal' in s.dataset, pausa: s.dataset.pausa || '',
    etiquetas: (s.dataset.etiquetas || '').split('·').map(x => x.trim()).filter(Boolean),
    capturas: (s.dataset.capturas || '').split(/\s+/).filter(Boolean).map(f => CAPTURAS + f),
  };
}
const etiquetasHtml = l => `<div class="etiq">${l.map(x => `<span>${esc(t(x))}</span>`).join('')}</div>`;
const fondo = url => (url ? `background-image:url('${url}')` : '');

// ---------- las tarjetas ----------
for (const s of TARJETAS) {
  const d = datosDe(s);
  s.insertAdjacentHTML('afterbegin', `<div class="cap-img" style="${fondo(d.capturas[0])}"></div>${d.tipo ? `<span class="tipo">${esc(d.tipo)}</span>` : ''}`);
  s.querySelector('h2').insertAdjacentHTML('afterend', etiquetasHtml(d.etiquetas));
  s.tabIndex = 0; s.setAttribute('role', 'button'); s.setAttribute('aria-label', d.nombre);
  s.addEventListener('click', e => { if (!e.target.closest('a, details')) abrirFicha(s.id); });
  s.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === s) { e.preventDefault(); abrirFicha(s.id); } });
}

// deslizar con el dedo a izquierda o derecha: llama a alPasar(+1) o alPasar(-1). Devuelve una función que dice si
// lo último fue un deslizamiento, para que ese toque no cuente también como pulsar
function deslizar(el, alPasar) {
  let x0 = null, y0 = 0, hubo = false;
  el.addEventListener('touchstart', e => { const p = e.touches[0]; x0 = p.clientX; y0 = p.clientY; }, { passive: true });
  el.addEventListener('touchend', e => {
    if (x0 === null) return;
    const p = e.changedTouches[0], dx = p.clientX - x0, dy = p.clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { hubo = true; alPasar(dx < 0 ? 1 : -1); setTimeout(() => { hubo = false; }, 250); }
  }, { passive: true });
  return () => hubo;
}

// ---------- DESTACADO y las marcas NUEVO: salen del boletín cuando llega ----------
const dest = { lista: [], i: 0, reloj: 0, deslizado: null };
// los juegos nuevos de los boletines de los últimos 14 días (el `id` de cada boletín empieza por su fecha), sin repetir y el más
// reciente primero, hasta 8. Así el DESTACADO no se queda con uno solo si el último boletín anuncia un único juego.
const DIAS_NUEVO = 14, MAX_DESTACADO = 8;
function juegosRecientes() {
  const lista = typeof NOV_BOLETINES !== 'undefined' && NOV_BOLETINES.length ? NOV_BOLETINES : (NOV_BOLETIN ? [NOV_BOLETIN] : []);
  const dia = b => Date.parse(String(b.id || '').slice(0, 10)) || 0, hoy = lista.length ? dia(lista[0]) : 0;
  const vistos = new Set(), out = [];
  for (const b of lista) {
    if (hoy && dia(b) && hoy - dia(b) > DIAS_NUEVO * 864e5) break;
    for (const j of b.nuevos || []) {
      if (vistos.has(j.tarjeta) || !document.getElementById(j.tarjeta)) continue;
      vistos.add(j.tarjeta); out.push(j);
    }
  }
  return out.slice(0, MAX_DESTACADO);
}
// el orden del DESTACADO: de más a menos reciente por la fecha de la última versión de cada juego (novedades/fechas.json, que mantiene publicar.py al publicar);
// a igual fecha, primero los anunciados en un boletín y luego por el orden de la librería. Sin ese archivo, solo salen los de los boletines.
async function fechasJuegos() {
  try { const r = await fetch('novedades/fechas.json', { cache: 'no-cache' }); return r.ok ? await r.json() : {}; } catch (_) { return {}; }
}
async function pintarDestacado() {
  const caja = document.getElementById('dest');
  const nuevosB = juegosRecientes(), fechas = await fechasJuegos();
  const pos = id => [...document.querySelectorAll('section.game')].findIndex(x => x.id === id), anunciado = new Map(nuevosB.map(j => [j.tarjeta, j]));
  const porFecha = Object.keys(fechas).map(j => 'g-' + j).filter(id => document.getElementById(id))
    .sort((a, b) => String(fechas[b.slice(2)]).localeCompare(String(fechas[a.slice(2)])) || (anunciado.has(b) - anunciado.has(a)) || pos(a) - pos(b))
    .slice(0, MAX_DESTACADO).map(id => anunciado.get(id) || { tarjeta: id });
  for (const j of nuevosB) {
    const s = document.getElementById(j.tarjeta);
    if (!s.querySelector('.marca-nuevo')) s.insertAdjacentHTML('beforeend', `<span class="marca-nuevo ol">${esc(t('NUEVO'))}</span>`);
  }
  dest.lista = porFecha.length ? porFecha : nuevosB.length ? nuevosB : [{ tarjeta: 'g-rumble' }];
  const puntos = document.getElementById('dest-puntos');
  puntos.innerHTML = dest.lista.length > 1
    ? `<button type="button" class="flecha" data-paso="-1" aria-label="${esc(t('Anterior'))}">‹</button>`
      + dest.lista.map((j, i) => `<button type="button" class="punto" data-i="${i}" aria-label="${esc(datosDe(document.getElementById(j.tarjeta)).nombre)}"></button>`).join('')
      + `<button type="button" class="flecha" data-paso="1" aria-label="${esc(t('Siguiente'))}">›</button>` : '';
  puntos.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    verDestacado(b.dataset.paso ? dest.i + Number(b.dataset.paso) : Number(b.dataset.i), true);
  };
  if (!dest.deslizado) dest.deslizado = deslizar(caja, paso => { if (dest.lista.length > 1) verDestacado(dest.i + paso, true); });
  caja.onclick = e => { if (!dest.deslizado() && !e.target.closest('a')) abrirFicha(dest.lista[dest.i].tarjeta); };
  verDestacado(0);
}
function verDestacado(i, aMano) {
  dest.i = (i + dest.lista.length) % dest.lista.length;
  const j = dest.lista[dest.i], d = datosDe(document.getElementById(j.tarjeta));
  const caja = document.getElementById('dest');
  caja.style.setProperty('--wc', d.color);
  caja.classList.toggle('horiz', d.horizontal);
  caja.innerHTML = `<div class="fondo" style="${fondo(d.capturas[0])}"></div><div class="cap${d.horizontal ? ' h' : ''}" style="${fondo(d.capturas[0])}"></div>
    <div class="info">${j.texto ? `<span class="dicho ol">${esc(t('¡NUEVO!'))}</span>` : ''}<h3 class="ol">${esc(d.nombre)}</h3><p>${esc(j.texto ? t(j.texto) : d.texto)}</p>${etiquetasHtml(d.etiquetas)}
    <div class="botones"><a class="boton ol" href="${esc(d.jugar)}">${esc(t('JUGAR'))}</a><button type="button" class="boton sec">${esc(t('VER FICHA'))}</button></div></div>`;
  document.querySelectorAll('#dest-puntos .punto').forEach((p, k) => p.classList.toggle('on', k === dest.i));
  clearTimeout(dest.reloj);
  const quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (dest.lista.length > 1 && !quieto && !aMano) dest.reloj = setTimeout(() => verDestacado(dest.i + 1), 7000);
}

// ---------- LA FICHA ----------
const ficha = { caja: document.getElementById('ficha'), id: '', volver: null, capturas: [] };
function abrirFicha(id, desdeHash) {
  const s = document.getElementById(id); if (!s) return;
  const d = datosDe(s), e = ENTRADAS[id];
  ficha.id = id; ficha.volver = document.activeElement;
  ficha.caja.style.setProperty('--wc', d.color);
  ficha.caja.classList.toggle('horiz', d.horizontal);
  document.getElementById('fi-fondo').style.cssText = fondo(d.capturas[0]);
  const caps = document.getElementById('fi-caps');
  caps.className = 'fi-caps' + (d.horizontal ? ' h' : '');
  caps.innerHTML = d.capturas.slice(0, 2).map((c, i) => `<i style="${fondo(c)}" data-zoom="${i}"></i>`).join('');
  ficha.capturas = d.capturas;
  document.getElementById('fi-nombre').textContent = d.nombre;
  document.getElementById('fi-etiq').innerHTML = etiquetasHtml(d.etiquetas);
  document.getElementById('fi-jugar').href = d.jugar;
  const apk = document.getElementById('fi-apk');   // DESCARGAR APK: solo en la alfa y en los juegos que tienen APK de prueba (release apk-latest del repo público)
  apk.hidden = !(NUCLEO.alfa && d.apk);
  if (d.apk) apk.href = 'https://github.com/MicroBlizz/FansOf/releases/download/apk-latest/fansof-' + d.apk + '.apk';
  document.getElementById('fi-ver').textContent = (e && e.ver) || '—';
  document.getElementById('fi-tipo').textContent = d.tipo || '—';
  document.getElementById('fi-texto').textContent = d.texto;
  document.getElementById('fi-pausa').hidden = !d.pausa;   // EN PAUSA: por qué está parado (y el voto pasa a ser «¿quieres que vuelva?», en votos.js)
  document.getElementById('fi-pausa-t').textContent = d.pausa ? t(d.pausa) : '';
  const n = e && e.entries[0];
  document.getElementById('fi-ultimo-t').textContent = n ? t('LO ÚLTIMO') + ' · ' + n.v : t('LO ÚLTIMO');
  document.getElementById('fi-ultimo').innerHTML = n ? newsLista(n.real) + newsLista(n.joke, 'joke') : esc(t('Cargando…'));
  document.getElementById('fi-novedades').innerHTML = e && e.entries.length ? newsHtml(e.entries) : '';
  document.getElementById('fi-todas').hidden = !(e && e.entries.length > 1);
  document.getElementById('fi-todas').open = false;
  const tira = document.getElementById('fi-tira');
  tira.className = 'fi-tira' + (d.horizontal ? ' h' : '');
  tira.innerHTML = d.capturas.map((c, i) => `<button type="button" style="${fondo(c)}" data-zoom="${i}" aria-label="${esc(t('Captura %1').replace('%1', i + 1))}"></button>`).join('');
  document.getElementById('fi-capturas').hidden = !d.capturas.length;
  ficha.caja.hidden = false; ficha.caja.scrollTop = 0; document.body.style.overflow = 'hidden';
  document.getElementById('fi-volver').focus({ preventScroll: true });
  if (!desdeHash && location.hash !== '#juego-' + id.slice(2)) history.pushState({ ficha: id }, '', '#juego-' + id.slice(2));
  document.dispatchEvent(new CustomEvent('ficha-abierta', { detail: { id } }));   // biblioteca/votos.js pone en la ficha el GUARDAR y el voto
}
function cerrarFicha(desdeHash) {
  if (ficha.caja.hidden) return;
  ficha.caja.hidden = true; document.body.style.overflow = '';
  cerrarZoom(); document.dispatchEvent(new CustomEvent('ficha-cerrada'));
  if (!desdeHash && location.hash.startsWith('#juego-')) history.back();
  const s = document.getElementById(ficha.id); if (s) s.focus({ preventScroll: true });
}
// cuando llega el informe de un juego con su ficha abierta, se rellena
function tiendaAlDia(id) { if (!ficha.caja.hidden && ficha.id === id) abrirFicha(id, true); }
// la ficha tiene su dirección (#juego-rumble): el botón «atrás» del navegador o del móvil la cierra, y se puede compartir
function segunHash() {
  const m = /^#juego-(.+)$/.exec(location.hash);
  if (m && document.getElementById('g-' + m[1])) abrirFicha('g-' + m[1], true); else cerrarFicha(true);
}
window.addEventListener('popstate', segunHash);
document.getElementById('fi-volver').onclick = () => cerrarFicha();
// capturas a pantalla completa: ✕ para cerrar (o tocar fuera), flechas o deslizar para pasar, y la cuenta «1 / 2»
const zoom = document.getElementById('fi-zoom');
const visor = { i: 0 };
function verCaptura(i) {
  const l = ficha.capturas || []; if (!l.length) return;
  visor.i = (i + l.length) % l.length;
  zoom.innerHTML = `<button type="button" class="z-x ol" data-z="x" aria-label="${esc(t('Cerrar'))}">✕</button>`
    + (l.length > 1 ? `<button type="button" class="z-flecha z-ant ol" data-z="-1" aria-label="${esc(t('Anterior'))}">‹</button><button type="button" class="z-flecha z-sig ol" data-z="1" aria-label="${esc(t('Siguiente'))}">›</button>` : '')
    + `<img src="${esc(l[visor.i])}" alt="${esc(t('Captura %1').replace('%1', visor.i + 1))}">`
    + (l.length > 1 ? `<div class="z-cuenta">${visor.i + 1} / ${l.length}</div>` : '');
  zoom.hidden = false; zoom.querySelector('.z-x').focus({ preventScroll: true });
}
function cerrarZoom() { zoom.hidden = true; zoom.innerHTML = ''; }
for (const id of ['fi-tira', 'fi-caps']) document.getElementById(id).addEventListener('click', e => {
  const b = e.target.closest('[data-zoom]'); if (b) verCaptura(Number(b.dataset.zoom));
});
const visorDeslizado = deslizar(zoom, paso => verCaptura(visor.i + paso));
zoom.onclick = e => {
  if (visorDeslizado()) return;
  const b = e.target.closest('[data-z]');
  if (b && b.dataset.z !== 'x') verCaptura(visor.i + Number(b.dataset.z));
  else cerrarZoom();   // la ✕, la captura o tocar fuera: solo las flechas no cierran
};
document.addEventListener('keydown', e => {   // va antes que el de NOVEDADES: con las dos abiertas, Esc cierra solo la de arriba
  if (!zoom.hidden && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { verCaptura(visor.i + (e.key === 'ArrowRight' ? 1 : -1)); return; }
  if (e.key !== 'Escape') return;
  if (!zoom.hidden) cerrarZoom(); else if (!ficha.caja.hidden && document.getElementById('novedades').hidden && !document.querySelector('.cuenta-fondo:not([hidden])')) cerrarFicha();
}, true);
if (/^#juego-/.test(location.hash)) segunHash();
