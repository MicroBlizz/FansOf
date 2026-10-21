// Fans Of Decks · OPCIONES y NOVEDADES de la portada: música, efectos, silencio, idioma, la cuenta de core y lo nuevo de cada versión.
'use strict';
const DC_NEWS_CLAVE = 'decks-novedades-vistas';
function dcNovedadSinVer() { try { return localStorage.getItem(DC_NEWS_CLAVE) !== NEWS[0].v; } catch (e) { return false; } }
function dcOpciones() {
  play('select');
  const v = dcVentana(tr('OPCIONES')), l = dcEl('div', 'opt-list');   // las filas de Opciones de core, las mismas que en Rumble
  const fila = (titulo, texto, ctrl) => { const f = dcEl('div', 'opt-row'), s = dcEl('span'); s.append(dcEl('b', '', titulo)); if (texto) s.append(document.createElement('br'), document.createTextNode(texto)); f.append(s); if (ctrl) f.append(ctrl); l.append(f); return f; };
  const barra = clave => { const r = document.createElement('input'); r.type = 'range'; r.min = 0; r.max = 100; r.value = Math.round(DC_SON[clave] * 100); r.oninput = () => { DC_SON[clave] = r.value / 100; dcSonGuarda(); }; r.onchange = () => play('select'); return r; };
  fila(tr('Música'), '', barra('mus'));
  fila(tr('Efectos'), '', barra('vol'));
  const mudo = dcEl('button', 'btn-ghost ol'), pintaMudo = () => { mudo.textContent = DC_SON.mudo ? tr('APAGADO') : tr('ENCENDIDO'); };
  mudo.onclick = () => { DC_SON.mudo = !DC_SON.mudo; dcSonGuarda(); pintaMudo(); play('select'); }; pintaMudo();
  fila(tr('Sonido'), '', mudo);
  const banderas = dcEl('span', 'idioma-fl'); banderas.id = 'idioma-banderas';
  fila(tr('Idioma / Language'), tr('Automático: el del navegador. Al cambiarlo se recarga la página.'), banderas);
  if (window.filaCuenta) l.append(window.filaCuenta);
  const news = dcEl('button', 'btn-ghost ol', tr('VER')); news.onclick = dcNovedades;
  fila(tr('Novedades'), tr('Lo nuevo de cada versión.'), news);
  v.append(l, dcEl('p', 'dc-version', tr('Fans Of Decks · versión') + ' ' + NEWS[0].v + ' · © 2026 MicroBlizz'));
  try { pintarBanderas(banderas)(); } catch (e) { /* sin banderas */ }
  const b = dcEl('button', 'btn-big ol', tr('CERRAR')); b.onclick = () => { play('select'); dcCierraVentana(); }; v.append(b);
}
function dcNovedades() {
  play('select');
  try { localStorage.setItem(DC_NEWS_CLAVE, NEWS[0].v); } catch (e) { /* sin almacenamiento */ }
  const punto = document.getElementById('dc-news-punto'); if (punto) punto.hidden = true;
  const v = dcVentana(tr('NOVEDADES')), caja = dcEl('div', 'dc-news');
  for (const n of NEWS) {
    caja.append(dcEl('h4', 'ol', tr('Versión {v}', { v: n.v })));
    const ul = dcEl('ul');
    for (const t of n.real) { const li = dcEl('li'); li.innerHTML = tr(t); ul.append(li); }
    for (const t of n.joke || []) { const li = dcEl('li', 'joke'); li.innerHTML = tr(t); ul.append(li); }
    caja.append(ul);
  }
  const b = dcEl('button', 'btn-big ol', tr('CERRAR')); b.onclick = () => { play('select'); dcCierraVentana(); }; v.append(caja, b);
}
