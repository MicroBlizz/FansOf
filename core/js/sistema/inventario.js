// Fans Of · INVENTARIO: todas tus copias de habilidades y objetos, cada una con su calidad.
// Filtros y orden, la ficha de una copia (equipar, bloquear, despedir por oro, volver a sortear sus números) y el despido masivo.
'use strict';
let invTab = 'ab', invFilter = 'all', invSort = 'q', itemCur = null;
const INV_FILTERS = { ab: [['all', 'Todas'], ['basic', 'Comunes'], ['common', 'Poco comunes'], ['rare', 'Raras'], ['epic', 'Épicas'], ['legendary', 'Legendarias']], eq: [['all', 'Todo'], ['weapon', 'Armas'], ['head', 'Cabeza'], ['acc', 'Accesorios']] };
const INV_SORTS = { q: 'calidad', rar: 'rareza', name: 'nombre' };
const scrapValue = it => Math.round(ECON.scrap[defOf(it).rar] * [1, 1.5, 2, 3, 5][tierOf(avgQ(it))]);
const canScrap = it => !it.lock && !wearer(it) && !defOf(it).pass;
// despido masivo: copias Becario y Junior que nadie lleva, sin bloquear, y nunca tu mejor copia de cada una
const massList = () => SAVE.inv.filter(it => it.k === invTab && canScrap(it) && tierOf(avgQ(it)) <= 1 && bestCopy(it.k, it.id) !== it);
function openInv(tab) { if (tab) invTab = tab; invFilter = 'all'; updateWallets(); show('scr-inv'); buildInv(); $('#inv-list').scrollTop = 0; }
function buildInv() {
  for (const b of document.querySelectorAll('[data-it]')) b.setAttribute('aria-pressed', String(b.dataset.it === invTab));
  $('#inv-filters').innerHTML = INV_FILTERS[invTab].map(([v, l]) => `<button class="chip-btn" data-if="${v}" aria-pressed="${invFilter === v}">${l}</button>`).join('');
  for (const b of document.querySelectorAll('[data-if]')) b.onclick = () => { invFilter = b.dataset.if; play('select'); buildInv(); };
  $('#btn-inv-sort').textContent = 'Orden: ' + INV_SORTS[invSort];
  const all = SAVE.inv.filter(it => it.k === invTab && defOf(it));
  const L = all.filter(it => invFilter === 'all' || (invTab === 'ab' ? defOf(it).rar : defOf(it).slot) === invFilter);
  L.sort(invSort === 'q' ? (a, b) => avgQ(b) - avgQ(a) || sortInv(a, b) : invSort === 'name' ? (a, b) => defOf(a).name.localeCompare(defOf(b).name) || avgQ(b) - avgQ(a) : sortInv);
  $('#inv-sub').textContent = all.length ? `${all.length} ${all.length === 1 ? 'copia' : 'copias'}${invFilter !== 'all' ? ` (${L.length} con este filtro)` : ''}. Toca una para ver sus números, equiparla, evaluarla o despedirla.` : '';
  $('#inv-list').innerHTML = L.length ? L.map(invRow).join('') : `<p class="deck-sub">${all.length ? 'Nada con este filtro.' : invTab === 'ab' ? 'Aún no tienes habilidades: salen en el gashapón.' : 'Aún no tienes equipo: sale en el gashapón de equipo y en el pase de batalla.'}</p>${all.length ? '' : '<button class="btn-ghost ol" id="btn-inv-gacha">IR AL GASHAPÓN</button>'}`;
  const g = $('#btn-inv-gacha'); if (g) g.onclick = () => { play('select'); gachaTab = invTab; openGacha(); };
  for (const b of document.querySelectorAll('[data-u]')) b.onclick = () => { play('select'); openItem(b.dataset.u); };
  const n = massList().length, mb = $('#btn-mass'); mb.textContent = n ? `DESPIDO MASIVO (${n})` : 'DESPIDO MASIVO'; mb.disabled = !n;
}
function invRow(it) {
  const D = defOf(it), R = RARITY[D.rar], w = wearer(it);
  const meta = w || it.lock ? `<span class="inv-meta">${it.lock ? LOCK_SVG + 'Contrato indefinido' : ''}${w && it.lock ? ' · ' : ''}${w ? 'Lo lleva ' + w : ''}</span>` : '';
  return `<button class="inv-row" data-u="${it.u}" data-rar="${D.rar}" style="--rc:${R[2]}"><span class="ic"${miniFondo(D.rar)}>${miniIcono(it.k, it.id)}</span><span class="inv-main"><span class="inv-top"><b class="ol">${D.name}</b>${qBadge(it)}</span><span class="inv-desc">${descOf(it)}</span>${meta}</span></button>`;
}
let itemSlot = null;   // v0.9.19: la ranura de la Colección desde la que se abrió la ficha
function openItem(uid, slot) {
  itemSlot = slot === 'keep' ? itemSlot : slot || null;
  const it = invGet(uid); if (!it) { $('#scr-item').hidden = true; itemCur = null; return; } itemCur = uid;
  const D = defOf(it), R = RARITY[D.rar], S = statsOf(it), V = valsOf(it), w = wearer(it), pass = !!D.pass;
  const bars = S.map((st, i) => { const qi = it.q[i], Ti = QTIERS[tierOf(qi)]; return `<div class="qstat">${S.length > 1 ? `Efecto ${i + 1}: ` : 'Valor: '}<b>${fmtV(V[i])}</b> <small>(de ${fmtV(rnd(st.c * 0.5, st.dec))} a ${fmtV(rnd(st.c * 1.5, st.dec))}) · ${Ti.name}</small><div class="qbar" style="--qc:${Ti.col}"><i style="width:${Math.max(2, qi * 100)}%"></i></div></div>`; }).join('');
  const others = SAVE.inv.filter(x => x !== it && x.k === it.k && x.id === it.id).sort((a, b) => avgQ(b) - avgQ(a));
  const oth = others.length ? `Tus otras copias: ${others.slice(0, 5).map(x => `${QTIERS[tierOf(avgQ(x))].name} ${Math.round(avgQ(x) * 100)} %`).join(' · ')}${others.length > 5 ? ` y ${others.length - 5} más` : ''}.` : 'Es tu única copia.';
  $('#item-body').innerHTML = `<div class="item-head"><span class="ic"${miniFondo(D.rar)}>${miniIcono(it.k, it.id)}</span><div><b class="ol">${D.name}</b><div class="item-note">${R[0]}${it.k === 'eq' ? ' · ' + SLOTS[D.slot] + ' (solo líderes)' : ''}${it.k === 'ab' && D.fac ? ' · de los ' + FACTIONS[D.fac].name : ''}</div></div></div>
    <div>${qBadge(it, true)}</div><div class="inv-desc">${descOf(it)}</div>${bars}
    <div class="item-note">${w ? 'Lo lleva ' + w + '.' : 'No lo lleva nadie.'}${pass ? ' Premio del pase: no se puede despedir ni volver a tirar.' : it.lock ? ' Contrato indefinido: no se puede despedir.' : ''}</div><div class="item-note">${oth}</div>`;
  const rc = ECON.reroll[D.rar], sv = scrapValue(it);
  $('#item-actions').innerHTML = `<button class="btn-ghost ol btn-ok" id="ia-equip">${w ? 'CAMBIAR' : 'EQUIPAR'}</button><button class="btn-ghost ol" id="ia-unequip" ${w ? '' : 'disabled'}>QUITAR</button>
    <button class="btn-ghost ol" id="ia-lock" ${pass ? 'disabled' : ''}>${it.lock ? 'RESCINDIR CONTRATO<small>se puede despedir</small>' : 'CONTRATO INDEFINIDO<small>bloquear: no se despide</small>'}</button><button class="btn-ghost ol danger" id="ia-scrap" ${canScrap(it) ? '' : 'disabled'}>DESPEDIR · +${fmt(sv)} ORO<small>indemnización: desaparece</small></button>
    <button class="btn-ghost ol wide" id="ia-reroll" ${pass ? 'disabled' : ''}>EVALUACIÓN DE DESEMPEÑO · ${fmt(rc)} ORO<small>vuelve a sortear sus números</small></button>`;
  $('#ia-equip').onclick = () => { if (itemSlot && w) { $('#scr-item').hidden = true; openPick(itemSlot.kind, itemSlot.key); } else equipFromInv(it); };
  $('#ia-unequip').onclick = () => { unequip(it); saveGame(); play('select'); refreshInv(); };
  $('#ia-lock').onclick = () => { it.lock = !it.lock; saveGame(); play('select'); refreshInv(); toast(it.lock ? 'Contrato indefinido: ya no se puede despedir' : 'Contrato rescindido: ya se puede despedir'); };
  $('#ia-scrap').onclick = () => scrapOne(it);
  $('#ia-reroll').onclick = () => rerollOne(it);
  $('#scr-item').hidden = false;
}
function refreshInv() { if (!$('#scr-inv').hidden) buildInv(); if (!$('#scr-coll').hidden) buildColl(); if (itemCur && !$('#scr-item').hidden) openItem(itemCur, 'keep'); }
function equipFromInv(it) {
  const D = defOf(it), facs = FACTION_ORDER.filter(isUnlocked); let html = '';
  if (it.k === 'ab') {
    for (const f of facs) {
      const F = FACTIONS[f];
      html += `<p class="pick-head ol">${F.name}</p>` + [F.leader, ...F.units].map(k => { const cur = invGet(SAVE.abEquip[k]); return `<button class="pick-opt unit" data-id="${k}" aria-pressed="${SAVE.abEquip[k] === it.u}"><canvas data-art="${k}"></canvas><span><b class="ol">${CFG.cards[k].name}</b><span>${cur ? 'Lleva ' + ABILITIES[cur.id].name + ' (' + QTIERS[tierOf(avgQ(cur))].name + ')' : 'Sin habilidad'}</span></span></button>`; }).join('');
    }
    openList(`¿Quién lleva ${D.name}?`, html, k => { unequip(it); SAVE.abEquip[k] = it.u; fire('equipar', 'ab'); saveGame(); play('select'); toast(`${CFG.cards[k].name} lleva ahora ${D.name}`); refreshInv(); });
  } else {
    const fs = facs.filter(f => fitsFac(it.id, f));
    html = (fs.length > 1 ? `<button class="pick-opt unit" data-id="*"><span class="ic" style="background:#ffcb3d">★</span><span><b class="ol">Todos tus líderes</b><span>Lo llevan los ${fs.length} a la vez (el equipo se comparte)</span></span></button>` : '') + fs.map(f => { const L = FACTIONS[f].leader, cur = invGet((SAVE.equip[f] || {})[D.slot]); return `<button class="pick-opt unit" data-id="${f}" aria-pressed="${cur === it}"><canvas data-art="${L}"></canvas><span><b class="ol">${CFG.cards[L].name}</b><span>${FACTIONS[f].name} · ${cur ? 'lleva ' + ITEMS[cur.id].name + ' (' + QTIERS[tierOf(avgQ(cur))].name + ')' : SLOTS[D.slot] + ' libre'}</span></span></button>`; }).join('');
    openList(`¿Qué líder lleva ${D.name}?`, html, f => { for (const g of f === '*' ? fs : [f]) { SAVE.equip[g] = SAVE.equip[g] || {}; SAVE.equip[g][D.slot] = it.u; } saveGame(); play('select'); toast(f === '*' ? `Todos tus líderes llevan ahora ${D.name}` : `${CFG.cards[FACTIONS[f].leader].name} lleva ahora ${D.name}`); refreshInv(); });
  }
}
// despedir copias: con cuenta lo hace el servidor (y dice cuánto oro da); si no, aquí. alAcabar(oro) se llama cuando ya está hecho
function despedirCopias(L, oroLocal, alAcabar) {
  if (!ECO.servidor('economia')) { SAVE.inv = SAVE.inv.filter(x => !L.includes(x)); ECO.ganar('despedir', { gold: oroLocal }); alAcabar(oroLocal); return; }
  ECO.despedir(L.map(x => x.u)).then(r => { const del = new Set(L); SAVE.inv = SAVE.inv.filter(x => !del.has(x)); alAcabar(r.oro_ganado); }).catch(e => { play('deny'); toast(ECO.errorTexto(e)); });
}
function scrapOne(it) {
  if (!canScrap(it)) return;
  const D = defOf(it), sv = scrapValue(it);
  confirmBox('DESPEDIR', `¿Despedir esta copia de <b>${D.name}</b> (${QTIERS[tierOf(avgQ(it))].name})?<span class="big">+${fmt(sv)} ${COIN_SVG}</span><small>La copia desaparece y te da oro. Cuanto mejor es su calidad, más oro.</small>`, 'DESPEDIR', () => {
    despedirCopias([it], sv, oro => { stat('scrap', 1); if (tierOf(avgQ(it)) === 4) stat('scrapperf', 1); saveGame(); play('despido'); updateWallets();
      $('#scr-item').hidden = true; itemCur = null; refreshInv(); toast(`Despedida: +${fmt(oro)} de oro`); });
  });
}
function rerollOne(it) {
  const D = defOf(it); if (D.pass) return;
  const cost = ECON.reroll[D.rar];
  if (SAVE.gold < cost) { toast(`Te falta oro: ${fmt(cost - SAVE.gold)} más`); play('deny'); return; }
  confirmBox('EVALUACIÓN DE DESEMPEÑO', `Se vuelven a sortear todos los números de tu <b>${D.name}</b>.<span class="big">${fmt(cost)} ${COIN_SVG}</span><small>Puede salir mejor… o peor. Ahora es ${QTIERS[tierOf(avgQ(it))].name} (${Math.round(avgQ(it) * 100)} %). Mismas probabilidades que el gashapón, sin garantía.</small>`, 'TIRAR', () => {
    const before = avgQ(it), listo = () => {
      stat('reroll', 1); if (tierOf(avgQ(it)) === 4) stat('perfect', 1); saveGame(); updateWallets();
      const after = avgQ(it), T = QTIERS[tierOf(after)];
      play(after > before ? 'levelup' : 'sad'); toast(after > before ? `¡Ha salido mejor! Ahora es ${T.name} (${Math.round(after * 100)} %)` : `Ha salido peor: ahora es ${T.name} (${Math.round(after * 100)} %). Mala suerte`);
      refreshInv();
    };
    if (!ECO.servidor('economia')) { ECO.gastar('retirar-numeros', { gold: cost }); it.q = it.q.map(() => rollQ(0)); listo(); return; }
    ECO.retirarNumeros(it.u).then(r => { it.q = r.q; listo(); }).catch(e => { play('deny'); toast(ECO.errorTexto(e)); });
  });
}
function massScrap() {
  const L = massList(); if (!L.length) return;
  const gold = L.reduce((a, it) => a + scrapValue(it), 0);
  confirmBox('DESPIDO MASIVO', `Vas a despedir <b>${L.length} ${L.length === 1 ? 'copia' : 'copias'}</b> de ${invTab === 'ab' ? 'habilidades' : 'equipo'} de calidad Becario y Junior que nadie lleva puestas.<span class="big">+${fmt(gold)} ${COIN_SVG}</span><small>Se salvan las bloqueadas y tu mejor copia de cada una. Microblizz estaría orgullosa.</small>`, 'DESPEDIR A TODAS', () => {
    const perfectas = L.filter(x => tierOf(avgQ(x)) === 4).length;
    despedirCopias(L, gold, oro => { stat('scrap', L.length); stat('scrapperf', perfectas); saveGame(); updateWallets(); play('despido'); buildInv(); toast(`${L.length} despedidas: +${fmt(oro)} de oro`); });
  });
}
$('#btn-inv').addEventListener('click', () => { play('select'); openInv(); });
for (const b of document.querySelectorAll('[data-it]')) b.addEventListener('click', () => { invTab = b.dataset.it; invFilter = 'all'; play('select'); buildInv(); $('#inv-list').scrollTop = 0; });
$('#btn-inv-sort').addEventListener('click', () => { invSort = invSort === 'q' ? 'rar' : invSort === 'rar' ? 'name' : 'q'; play('select'); buildInv(); });
$('#btn-mass').addEventListener('click', massScrap);
$('#btn-item-close').addEventListener('click', () => { $('#scr-item').hidden = true; itemCur = null; });
$('#btn-pick-close').addEventListener('click', () => { $('#scr-pick').hidden = true; });
$('#btn-coll').addEventListener('click', () => { play('select'); fire('coleccion.abrir'); collFac = facNow(); updateWallets(); show('scr-coll'); buildColl(); });
