// Fans of Nova · MENÚ PRINCIPAL: la portada como la del resto de la serie (logo, CAMPAÑA, nave capital, novedades, opciones y
// «Cómo se juega»), con la ventana de OPCIONES (sonido, idioma, cuenta, empezar de cero) y la de NOVEDADES, que sale sola
// la primera vez que se abre una versión nueva. Usa los estilos comunes de core/css/menus.css (btn-big, btn-ghost, opt-row…).
'use strict';
const NV_NEWS_CLAVE = 'nova-novedades-vista';

// Una ventana encima de todo (la misma tarjeta que las de core). Devuelve la tarjeta para rellenarla.
function nvVentana(titulo) {
  nvCierraVentana();
  const v = nvEl('screen modal'); v.id = 'nv-ventana';
  const c = nvEl('modal-card nv-ventana');
  const x = nvEl('nv-cerrar', '', 'button'); x.setAttribute('aria-label', tr('Cerrar')); x.textContent = '×'; x.onclick = nvCierraVentana;
  c.appendChild(x); c.appendChild(nvEl('ol', titulo, 'h3'));
  v.appendChild(c); v.onclick = e => { if (e.target === v) nvCierraVentana(); };
  document.getElementById('stage').appendChild(v);
  return c;
}
function nvCierraVentana() { const v = document.getElementById('nv-ventana'); if (v) v.remove(); }

// ---------- NOVEDADES ----------
function nvNovedades() {
  const c = nvVentana(tr('NOVEDADES') + ' · ' + NEWS[0].v), caja = nvEl('nv-news');
  const lista = (items, cls) => { const ul = nvEl(cls || '', undefined, 'ul'); for (const t of items || []) { const li = document.createElement('li'); li.innerHTML = tr(t); ul.appendChild(li); } return ul; };
  NEWS.forEach((n, i) => {
    if (i === 0) { caja.appendChild(nvEl('', tr('LO NUEVO'), 'h4')); caja.appendChild(lista(n.real)); caja.appendChild(nvEl('', tr('NOTAS DE MICROBLIZZ Y PHONY'), 'h4')); caja.appendChild(lista(n.joke, 'joke')); }
    else { caja.appendChild(nvEl('', tr('VERSIÓN') + ' ' + n.v, 'h4')); caja.appendChild(lista(n.real)); caja.appendChild(lista(n.joke, 'joke')); }
  });
  c.appendChild(caja);
  const ok = nvEl('btn-big ol nv-ok', tr('¡GENIAL!'), 'button'); ok.onclick = nvCierraVentana; c.appendChild(ok);
  try { localStorage.setItem(NV_NEWS_CLAVE, NEWS[0].v); } catch (e) { /* sin almacenamiento */ }
}
function nvNovedadesPendientes() { try { return NEWS.length && localStorage.getItem(NV_NEWS_CLAVE) !== NEWS[0].v; } catch (e) { return false; } }

// ---------- OPCIONES ----------
function nvOpciones() {
  const c = nvVentana(tr('OPCIONES')), l = nvEl('opt-list');
  const fila = (titulo, texto, ctrl) => { const f = nvEl('opt-row'), s = nvEl('', undefined, 'span'); s.appendChild(nvEl('', titulo, 'b')); if (texto) { s.appendChild(document.createElement('br')); s.appendChild(document.createTextNode(texto)); } f.appendChild(s); if (ctrl) f.appendChild(ctrl); l.appendChild(f); return f; };
  const barra = clave => { const r = document.createElement('input'); r.type = 'range'; r.min = 0; r.max = 100; r.value = Math.round(NV_SON[clave] * 100); r.oninput = () => { NV_SON[clave] = r.value / 100; nvSonGuarda(); }; return r; };
  fila(tr('Música'), '', barra('mus'));
  fila(tr('Efectos'), '', barra('vol'));
  const mudo = nvEl('btn-ghost ol', '', 'button'), pintaMudo = () => { mudo.textContent = NV_SON.mudo ? tr('APAGADO') : tr('ENCENDIDO'); };
  mudo.onclick = () => { NV_SON.mudo = !NV_SON.mudo; nvSonGuarda(); pintaMudo(); }; pintaMudo();
  fila(tr('Sonido'), '', mudo);
  const banderas = nvEl('idioma-fl', undefined, 'span'); banderas.id = 'idioma-banderas';
  fila(tr('Idioma / Language'), tr('Automático: el del navegador. Al cambiarlo se recarga la página.'), banderas);
  if (window.filaCuenta) l.appendChild(window.filaCuenta);
  const news = nvEl('btn-ghost ol', tr('VER'), 'button'); news.onclick = nvNovedades;
  fila(tr('Novedades'), tr('Lo nuevo de cada versión.'), news);
  const borra = nvEl('btn-ghost ol nv-peligro', tr('BORRAR'), 'button');
  borra.onclick = () => confirmBox(tr('¿EMPEZAR DE CERO?'), tr('Se borra tu campaña: la galaxia liberada, la aleación y las mejoras de la nave capital. No se puede deshacer.'), tr('BORRAR'), () => {
    try { localStorage.removeItem(NV_CAMP_CLAVE); localStorage.removeItem('nova-campana-1'); } catch (e) { /* nada que borrar */ }
    NVP.camp = null; NVP.gal = null; nvCierraVentana(); nvPintaMenu(); toast(tr('Campaña nueva.'), true);
  });
  fila(tr('Empezar de cero'), tr('Borra tu campaña de Nova.'), borra);
  c.appendChild(l);
  c.appendChild(nvEl('nv-ver', tr('Fans of Nova · versión') + ' ' + NEWS[0].v, 'p'));
  try { pintarBanderas(banderas)(); } catch (e) { /* sin banderas */ }
}

// ---------- la portada ----------
function nvPintaMenu() {
  const camp = nvCamp();
  document.getElementById('nv-b-capital').hidden = !camp.faccion;   // la nave capital llega al elegir facción
}
function nvMontaMenu() {
  const $id = id => document.getElementById(id);
  $id('nv-estado').innerHTML = tr('<b>La rebelión</b> contra <i>Microblizz</i>');
  $id('nv-jugar').textContent = tr('CAMPAÑA');
  $id('nv-b-capital').textContent = tr('NAVE CAPITAL');
  $id('nv-b-novedades').textContent = tr('NOVEDADES');
  $id('nv-b-opciones').textContent = tr('OPCIONES');
  $id('nv-b-ayuda').textContent = tr('Cómo se juega');
  $id('nv-jugar').onclick = nvJugarCampana;
  $id('nv-b-capital').onclick = () => { nvJugarCampana(); nvNaveCapital(); };
  $id('nv-b-novedades').onclick = nvNovedades;
  $id('nv-b-opciones').onclick = nvOpciones;
  $id('nv-b-ayuda').onclick = () => { if (!NVP.tuto) nvTutoTodo(); };
  nvPintaMenu();
}
