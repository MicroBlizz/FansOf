// Fans of Karts · LAS PANTALLAS EN GRANDE (HTML encima del juego): lo común a la tienda, el pase y las ventanas de premio. Cómo se
// crean, el monedero, los iconos de candado y hecho, moverse con teclado o mando (flechas, Intro y Esc/B) y la ventana de premios.
'use strict';

// crear un trozo de HTML: el('div.clase', { atributos }, hijos…). Los textos van tal cual (sin traducir: se traduce antes).
function el(tag, at = {}, ...hijos) {
  const [t, ...cl] = tag.split('.'), e = document.createElement(t);
  if (cl.length) e.className = cl.join(' ');
  for (const [k, v] of Object.entries(at)) { if (v == null || v === false) continue; if (k === 'on') e.onclick = ev => { ev.stopPropagation(); play('select'); v(ev); }; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v === true ? '' : v); }
  for (const h of hijos.flat()) if (h != null && h !== false) e.append(h instanceof Node ? h : document.createTextNode(String(h)));
  return e;
}
const img = (src, cl = 'kt-px') => el('img.' + cl, { src, alt: '', draggable: 'false' });
// candado y marca de hecho, dibujados (contorno grueso, como el resto de la serie)
const SVG_CANDADO = '<svg viewBox="0 0 24 24"><path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="#20102c" stroke-width="5"/><path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="#ffcb3d" stroke-width="2.5"/><rect x="4" y="10" width="16" height="12" rx="3" fill="#ffcb3d" stroke="#20102c" stroke-width="2.5"/><rect x="11" y="14" width="2.4" height="4" fill="#20102c"/></svg>';
const SVG_HECHO = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#5ef27a" stroke="#20102c" stroke-width="2.5"/><path d="M6.5 12.5l3.6 3.6 7.4-7.6" fill="none" stroke="#20102c" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const marca = svg => el('span.kt-marca', { html: svg });

// el monedero: oro y gemas (tocarlo lleva a las gemas de la tienda)
function chipsMonedero() {
  return el('div.kt-wallet', {},
    el('button.kt-chip.oro', { 'data-k': 1, 'aria-label': tr('ORO'), on: () => abreTienda('destacado') }, img(fotoIcono('oro')), String(SAVE.oro)),
    el('button.kt-chip.gema', { 'data-k': 1, 'aria-label': tr('GEMAS'), on: () => abreTienda('gemas') }, img(fotoIcono('gema')), String(SAVE.gemas)));
}
// una pantalla entera (tienda o pase): cabecera con VOLVER, el título y el monedero
function cabecera(titulo, volver) {
  return el('header.kt-head', {}, el('button.kt-back', { 'data-k': 1, on: volver }, tr('VOLVER')), el('h2.kt-d.ol', {}, tr(titulo)), chipsMonedero());
}

// ---------- moverse con teclado o mando por lo que haya en pantalla (lo que lleve data-k) ----------
const NAV = { i: 0, raiz: null };
function navega(raiz, atras) {
  if (NAV.raiz !== raiz) { NAV.raiz = raiz; NAV.i = -1; }
  const t = UI.tecla; UI.tecla = null; UI.toque = null;
  if (!t) return;
  const todos = [...raiz.querySelectorAll('[data-k]')].filter(e => e.offsetParent !== null);
  if (t === 'atras') { play('tick'); atras(); return; }
  if (!todos.length) return;
  if (t === 'ok') { const e = todos[NAV.i]; if (e) e.click(); else { NAV.i = 0; marcaFoco(todos); } return; }
  const d = t === 'izq' || t === 'arr' ? -1 : 1;
  NAV.i = NAV.i < 0 ? 0 : (NAV.i + d + todos.length) % todos.length; play('tick');
  marcaFoco(todos);
}
function marcaFoco(todos) {
  todos.forEach((e, i) => e.classList.toggle('kt-foco', i === NAV.i));
  const e = todos[NAV.i]; if (e) e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
// mientras haya una pantalla en grande abierta, el lienzo de debajo no hace nada
function calmaLienzo() { PANT.acciones.length = 0; PANT.rects.length = 0; PANT.directas.length = 0; UI.toque = null; }

// ---------- la ventana de premios: ¡DESBLOQUEADO!, nivel del pase, el obsequio del CEO… (una detrás de otra) ----------
let CAJA_PREMIO = null, PREMIO_VISTO = null;
function pintaPremios() {
  const p = KPREMIOS[0];
  if (!p) { if (CAJA_PREMIO) { CAJA_PREMIO.remove(); CAJA_PREMIO = null; PREMIO_VISTO = null; } return false; }
  if (PREMIO_VISTO !== p) {
    PREMIO_VISTO = p; if (CAJA_PREMIO) CAJA_PREMIO.remove();
    const cierra = () => { KPREMIOS.shift(); };
    const anchos = p.lineas.length > 3 || p.lineas.some(l => !fotoPremio(l, 'bunny'));
    CAJA_PREMIO = el('section.kt-modal', { role: 'dialog' }, el('div.kt-premio', {},
      el('h3.kt-d.ol', { style: 'color:' + p.color }, tr(p.titulo)),
      p.caja ? el('div.kt-sub', {}, tr('Siempre trae lo mismo: cero sorpresas.')) : null,
      el('div.kt-premios', {}, p.lineas.map(l => el('div.kt-pr' + (anchos ? '.ancho' : ''), {}, fotoPremio(l, JUGABLES[PANT.piloto].id) ? img(fotoPremio(l, JUGABLES[PANT.piloto].id)) : null, el('span', {}, l.txt)))),
      el('button.kt-btn.ancho' + (p.color === '#5ef27a' ? '.verde' : p.color === '#ff5cf0' ? '.gema' : '.oro'), { 'data-k': 1, on: cierra }, tr('¡VALE!'))));
    document.body.appendChild(CAJA_PREMIO); play('levelup');
  }
  calmaLienzo();
  navega(CAJA_PREMIO, () => KPREMIOS.shift());
  return true;
}

// ---------- el monedero del menú principal (en HTML, para que se lea bien) ----------
const MONEDERO = el('div', { id: 'kt-monedero', hidden: true }); document.body.appendChild(MONEDERO);
let MONEDERO_VISTO = '';
function monederoVista() {
  const ver = ['titulo', 'piloto', 'mundo', 'pista'].includes(PANT.id) && !KPREMIOS.length;
  MONEDERO.hidden = !ver; if (!ver) return;
  const k = SAVE.oro + '|' + SAVE.gemas;
  if (k !== MONEDERO_VISTO) { MONEDERO_VISTO = k; MONEDERO.replaceChildren(...chipsMonedero().children); }
}
