// Fans Of · BIBLIOTECA: todas las habilidades y objetos que reparte el juego, con los que ya tienes y los que te faltan.
// Lee el catálogo de cada juego (ABILITIES e ITEMS, con su nombre, rareza e icono de la serie) y la partida (SAVE.inv).
// Solo enseña: equipar, despedir o volver a sortear se sigue haciendo en Colección e Inventario.
//
// Cada juego pone en su página la pantalla #scr-bib (con #bib-tabs, #bib-filtros, #bib-sub y #bib-list) y un botón que llama a openBib().
'use strict';
let bibTab = 'ab', bibFiltro = 'todo';   // qué se ve: habilidades u objetos · todo, lo que tienes o lo que te falta
const BIB_FILTROS = { todo: 'Todo', tengo: 'Lo tengo', falta: 'Me falta' };
function openBib() { show('scr-bib'); buildBib(); }
// cuántas copias tienes de cada uno y si alguna la lleva puesta una carta
function bibCopias(kind, id) { return SAVE.inv.filter(it => it.k === kind && it.id === id); }
// el texto de lo que hace, con su valor central (cada copia sale con más o menos según su calidad)
function bibDesc(D) {
  const S = statsOf({ k: D.k, id: D.id }); let t = D.desc;
  S.forEach((st, i) => { t = t.replace(i === 0 && t.includes('{v}') ? '{v}' : '{' + i + '}', `<b class="sv">${fmtV(st.c)}</b>`); });
  return t;
}
function bibLista() {
  const DB = bibTab === 'ab' ? ABILITIES : ITEMS;
  return Object.keys(DB).map(id => Object.assign({ k: bibTab, id }, DB[id], { copias: bibCopias(bibTab, id) }))
    .sort((a, b) => RAR_ORDER[a.rar] - RAR_ORDER[b.rar] || a.name.localeCompare(b.name));
}
function buildBib() {
  const todos = bibLista(), tengo = todos.filter(D => D.copias.length).length;
  $('#bib-tabs').innerHTML = `<button class="tab ol" data-bt="ab" aria-pressed="${bibTab === 'ab'}">Habilidades</button><button class="tab ol" data-bt="eq" aria-pressed="${bibTab === 'eq'}">Objetos</button>`;
  $('#bib-tabs').querySelectorAll('[data-bt]').forEach(b => { b.onclick = () => { bibTab = b.dataset.bt; play('select'); buildBib(); }; });
  $('#bib-filtros').innerHTML = Object.keys(BIB_FILTROS).map(f => `<button class="chip-btn" data-bf="${f}" aria-pressed="${bibFiltro === f}">${BIB_FILTROS[f]}</button>`).join('');
  $('#bib-filtros').querySelectorAll('[data-bf]').forEach(b => { b.onclick = () => { bibFiltro = b.dataset.bf; play('select'); buildBib(); }; });
  $('#bib-sub').textContent = bibTab === 'ab' ? `Tienes ${tengo} de ${todos.length} habilidades. Toca una para ver qué hace.` : `Tienes ${tengo} de ${todos.length} objetos. Toca uno para ver qué hace.`;
  const vista = todos.filter(D => bibFiltro === 'todo' || (bibFiltro === 'tengo') === !!D.copias.length);
  const list = $('#bib-list');
  list.innerHTML = vista.length ? `<div class="bib-grid">${vista.map(bibCarta).join('')}</div>` : `<p class="deck-sub">${bibFiltro === 'tengo' ? 'Aún no tienes ninguno: salen en el gashapón.' : '¡Lo tienes todo!'}</p>`;
  list.querySelectorAll('[data-bid]').forEach(b => { b.onclick = () => { play('select'); bibFicha(b.dataset.bid); }; });
  list.scrollTop = 0;
}
function bibIcono(D) { return D.k === 'ab' ? D.ic : SLOT_SVG[D.slot]; }
function bibCarta(D) {
  const R = RARITY[D.rar], n = D.copias.length;
  const etiqueta = D.pass ? 'Del pase' : D.fac && D.k === 'eq' ? 'Solo ' + CFG.cards[FACTIONS[D.fac].leader].name : D.k === 'eq' ? SLOTS[D.slot] : '';
  return `<button class="bib-card${n ? '' : ' falta'}" data-bid="${D.id}" style="--rc:${R[2]}" aria-label="${D.name}: ${n ? n + ' copias' : 'te falta'}">`
    + `<span class="bib-ic" style="background:${R[1]}">${bibIcono(D)}</span>`
    + `<b class="bib-name ol">${D.name}</b><span class="bib-rar">${R[0]}${etiqueta ? ' · ' + etiqueta : ''}</span>`
    + (n ? `<span class="bib-n ol">x${n}</span>` : '<span class="bib-lock">TE FALTA</span>') + '</button>';
}
function bibFicha(id) {
  const D = Object.assign({ k: bibTab, id }, (bibTab === 'ab' ? ABILITIES : ITEMS)[id]), R = RARITY[D.rar], copias = bibCopias(bibTab, id);
  const rango = statsOf({ k: D.k, id }).map(st => `${fmtV(rnd(st.c * 0.5, st.dec))}–${fmtV(rnd(st.c * 1.5, st.dec))}`).join(' · ');
  let html = `<div class="bib-ficha" style="--rc:${R[2]}"><span class="bib-ic big" style="background:${R[1]}">${bibIcono(D)}</span><div><b class="ol">${D.name}</b><span class="bib-rar">${R[0]}${D.k === 'eq' ? ' · ' + SLOTS[D.slot] : ''}</span></div></div>`;
  html += `<p class="bib-txt">${bibDesc(D)}${D.k === 'eq' && D.fac ? ` <i class="wn">Solo para ${CFG.cards[FACTIONS[D.fac].leader].name}.</i>` : ''}</p>`;
  html += `<p class="bib-rango">Según la calidad de la copia: <b>${rango}</b></p>`;
  if (copias.length) {
    html += `<p class="bib-txt"><b class="sv">Tienes ${copias.length} ${copias.length > 1 ? 'copias' : 'copia'}.</b></p>`;
    html += copias.sort((a, b) => avgQ(b) - avgQ(a)).map(it => { const w = wearer(it); return `<p class="bib-copia">${qBadge(it)}${w ? ` <i class="wn">Lo lleva ${w}.</i>` : ' <i>Sin usar</i>'}</p>`; }).join('');
  } else if (D.pass) html += '<p class="bib-txt">Te falta. Es un premio del <b>pase</b>: no sale en el gashapón.</p>';
  else html += `<p class="bib-txt">Te falta. Sale en el <b>gashapón</b>.</p><button class="btn-ghost ol" data-goto="${D.k}">IR AL GASHAPÓN</button>`;
  openList(D.k === 'ab' ? 'HABILIDAD' : 'OBJETO', html, () => {});
}
