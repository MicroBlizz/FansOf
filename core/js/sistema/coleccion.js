// Fans Of · COLECCIÓN: las cartas de cada facción, su nivel y lo que llevan puesto.
// Cualquier carta lleva una habilidad; el líder lleva además arma, cabeza y accesorio (SAVE.equip[facción]), y una misma copia
// la pueden llevar varios líderes a la vez.
//
// Cada juego dice:
//   effStats(k, fac)   los números de la carta con lo que lleva: { boosts: ['+10 % de daño', …], … }
//   cardStats(k, es)   la línea de números que se enseña · cardDesc(k) su descripción · passiveText(fac) qué hace la pasiva
// y puede enganchar: 'coleccion.arriba' (fac) y 'coleccion.abajo' (fac, bloqueada) para añadir filas · 'coleccion.nombre' (k) junto al nombre
//   'coleccion.lista' (lista) cuando ya está pintada · 'coleccion.abrir' al entrar desde el menú · 'equipar' (tipo) al ponerle algo a una carta.
'use strict';
const misFacciones = () => FACTION_ORDER.filter(isUnlocked);   // las facciones que ya tiene el jugador
let collFac = null;
function buildColl() {
  if (!collFac) collFac = facNow();
  const F = FACTIONS[collFac], lock = !isUnlocked(collFac);
  $('#coll-tabs').innerHTML = FACTION_ORDER.map(f => `<button class="fac-tab${isUnlocked(f) ? '' : ' locked'}" data-cf="${f}" aria-pressed="${f === collFac}" style="--fc:${FAC_COLOR[f]}" aria-label="${FACTIONS[f].name}"><canvas></canvas></button>`).join('');
  for (const b of $('#coll-tabs').children) { drawArt(b.querySelector('canvas'), FACTIONS[b.dataset.cf].leader, 48, 36); b.onclick = () => { collFac = b.dataset.cf; play('select'); buildColl(); }; }
  const box = $('#passive-box'); box.className = 'passive-box ' + F.kind;
  box.innerHTML = ICONS[F.icon] + `<div><b class="ol">${F.name.toUpperCase()} · ${F.passive}</b><span>${lock ? 'Bloqueada: libera su mundo en la campaña (o activa el modo pruebas en Opciones).' : passiveText(collFac)}</span></div>`;
  const list = $('#coll-list');
  const deckBar = lock ? '' : fire('coleccion.arriba', collFac);
  list.innerHTML = deckBar + (lock ? '' : '<p class="coll-hint">Toca las <b>ranuras</b> de cada carta para equipar: <b>habilidades</b> en todas y <b>objetos</b> (arma, cabeza y accesorio) solo en el líder. Salen en el <b>Gashapón</b>. El número rojo dice cuántas tienes sin usar.</p>') + [F.leader, ...F.units].map(k => collRow(k, lock)).join('') + fire('coleccion.abajo', collFac, lock);
  for (const cv of list.querySelectorAll('canvas[data-k]')) drawArt(cv, cv.dataset.k, 62, 54);
  list.querySelectorAll('[data-up]').forEach(b => { b.onclick = () => { levelUp(b.dataset.up, () => { updateWallets(); buildColl(); }); }; });
  // v0.9.19: si la ranura ya lleva algo, se abre su ficha (volver a tirar, bloquear, cambiar…); si está vacía, la lista para elegir
  list.querySelectorAll('[data-ab]').forEach(b => { b.onclick = () => { const k = b.dataset.ab, u = SAVE.abEquip[k]; if (invGet(u)) openItem(u, { kind: 'ab', key: k }); else openPick('ab', k); }; });
  list.querySelectorAll('[data-eq]').forEach(b => { b.onclick = () => { const k = b.dataset.eq, u = (SAVE.equip[collFac] || {})[k]; if (invGet(u)) openItem(u, { kind: 'eq', key: k }); else openPick('eq', k); }; });
  fire('coleccion.lista', list);
  const ea = list.querySelector('[data-eqall]'); if (ea) ea.onclick = () => { play('select'); equipAll(collFac); };
}
function collRow(k, lock) {
  const c = CFG.cards[k], us = uSave(k), max = us.lvl >= ECON.maxLvl, need = needXp(us.lvl);
  const ready = !max && us.xp >= need, cost = lvlCost(us.lvl), pct = max ? 100 : Math.min(100, (us.xp / need) * 100);
  const es = effStats(k, collFac), bst = es.boosts.length ? `<span class="boost">Con su habilidad${isLeader(k) ? ' y su equipo' : ''}: ${es.boosts.join(', ')}</span>` : '';
  const stats = cardStats(k, es) + bst;   // la línea de números de la carta la escribe cada juego
  const worn = wornSet();
  let slots = slotTile('ab', k, invGet(SAVE.abEquip[k]), lock, 'HABILIDAD', worn);
  if (isLeader(k)) { const E = SAVE.equip[collFac] || {}; for (const sl in SLOTS) slots += slotTile('eq', sl, invGet(E[sl]), lock, SLOTS[sl].toUpperCase(), worn); }
  const btn = max ? '<button class="btn-up max" disabled>NV MÁX</button>' : `<button class="btn-up" data-up="${k}" ${ready && !lock ? '' : 'disabled'}>SUBIR<small>${COIN_SVG}${fmt(cost)}</small></button>`;
  const allBtn = isLeader(k) && !lock && Object.keys(SAVE.equip[collFac] || {}).length && misFacciones().length > 1 ? '<button class="btn-eqall" data-eqall="1">PONER ESTE EQUIPO A TODOS LOS LÍDERES</button>' : '';
  return `<div class="coll-row" data-rarity="${c.rarity}"><canvas data-k="${k}"></canvas><div><div class="coll-name ol">${c.name}<em>Nv ${us.lvl}</em>${fire('coleccion.nombre', k)}</div><div class="deck-desc">${cardDesc(k)}</div><div class="xpbar"><i style="width:${pct}%"></i><span>${max ? 'NIVEL MÁXIMO' : `${fmt(us.xp)} / ${fmt(need)} XP`}</span></div><div class="deck-stats">${stats}</div></div>${btn}<div class="slots${isLeader(k) ? '' : ' one'}">${slots}</div>${allBtn}</div>`;
}
// v0.9.9: ranuras grandes. Vacías con borde punteado y un número rojo si tienes copias sin usar para esa ranura
function wornSet() { const w = new Set(Object.values(SAVE.abEquip)); for (const f in SAVE.equip) for (const sl in SAVE.equip[f]) w.add(SAVE.equip[f][sl]); return w; }
function slotTile(kind, key, it, lock, label, worn) {
  const D = it && defOf(it), attr = kind === 'ab' ? `data-ab="${key}"` : `data-eq="${key}"`, dis = lock ? 'disabled' : '';
  if (!D) {
    const n = kind === 'ab' ? SAVE.inv.filter(x => x.k === 'ab' && !worn.has(x.u)).length : SAVE.inv.filter(x => x.k === 'eq' && ITEMS[x.id] && ITEMS[x.id].slot === key && fitsFac(x.id, collFac)).length;
    const ic = kind === 'ab' ? '<span class="sl-plus">+</span>' : SLOT_SVG[key];
    return `<button class="slot" ${attr} ${dis} aria-label="${label}: vacía. Toca para equipar"><span class="sl-ic">${ic}</span><span class="sl-txt"><span class="sl-lbl ol">${label}</span><span class="sl-name">${n ? 'Toca para equipar' : 'Vacía · sale en el gashapón'}</span></span>${n && !lock ? `<span class="sl-n ol">${n}</span>` : ''}</button>`;
  }
  const R = RARITY[D.rar], T = QTIERS[tierOf(avgQ(it))];
  return `<button class="slot full" ${attr} ${dis} data-rar="${D.rar}" style="--qc:${R[1]};--rc2:${R[2]}" aria-label="${label}: ${D.name}, calidad ${T.name}. Toca para cambiar"><span class="sl-ic" style="background:${R[1]}">${kind === 'ab' ? D.ic : SLOT_SVG[key]}</span><span class="sl-txt"><span class="sl-lbl ol">${label}</span><span class="sl-name">${D.name}</span><span class="sl-q">${qStars(T)}</span></span></button>`;
}
function descOf(it) {
  const D = defOf(it), S = statsOf(it), V = valsOf(it); let t = D.desc + (it.k === 'eq' && D.fac ? ` <i class="wn">Solo para ${CFG.cards[FACTIONS[D.fac].leader].name}.</i>` : '');
  S.forEach((st, i) => { t = t.replace(i === 0 && t.includes('{v}') ? '{v}' : '{' + i + '}', `<b class="sv">${fmtV(V[i])}</b>`); });
  return t;
}
const rangeTxt = it => { const S = statsOf(it); return (S.length > 1 ? 'Rangos: ' : 'Rango: ') + S.map(st => `${fmtV(rnd(st.c * 0.5, st.dec))}–${fmtV(rnd(st.c * 1.5, st.dec))}`).join(' · '); };
const qBadge = (it, big) => { const q = avgQ(it), T = QTIERS[tierOf(q)]; return `<span class="qbadge" style="--qc:${T.col}"><span class="qst">${qStars(T)}</span> ${big ? 'CALIDAD ' + T.name.toUpperCase() : T.name} · ${Math.round(q * 100)} %</span>`; };
const sortInv = (a, b) => RAR_ORDER[defOf(a).rar] - RAR_ORDER[defOf(b).rar] || defOf(a).name.localeCompare(defOf(b).name) || avgQ(b) - avgQ(a);
function wearer(it) {   // nombre de la carta que lo lleva puesto (o null)
  if (it.k === 'ab') { for (const k in SAVE.abEquip) if (SAVE.abEquip[k] === it.u) return CFG.cards[k] ? CFG.cards[k].name : k; return null; }
  const ws = []; for (const f in SAVE.equip) for (const sl in SAVE.equip[f]) if (SAVE.equip[f][sl] === it.u && FACTIONS[f]) ws.push(CFG.cards[FACTIONS[f].leader].name);
  if (!ws.length) return null; if (ws.length > 2 && ws.length >= misFacciones().length) return 'todos tus líderes';   // v0.9.15: un objeto lo pueden llevar varios líderes
  return ws.length === 1 ? ws[0] : ws.length === 2 ? ws.join(' y ') : `${ws[0]} y ${ws.length - 1} más`;
}
function unequip(it) {
  if (it.k === 'ab') { for (const k in SAVE.abEquip) if (SAVE.abEquip[k] === it.u) delete SAVE.abEquip[k]; }
  else for (const f in SAVE.equip) for (const sl in SAVE.equip[f]) if (SAVE.equip[f][sl] === it.u) delete SAVE.equip[f][sl];
}
function pickRowHtml(it, sel) {
  const D = defOf(it), R = RARITY[D.rar], w = wearer(it);
  return `<button class="pick-opt" data-id="${it.u}" data-rar="${D.rar}" aria-pressed="${sel === it.u}" style="--rc:${R[2]}"><span class="ic" style="background:${R[1]}">${it.k === 'ab' ? D.ic : SLOT_SVG[D.slot]}</span><span><span class="inv-top"><b class="ol">${D.name}</b>${qBadge(it)}</span><span class="pk-desc">${descOf(it)}${w ? ` <i class="wn">Lo lleva ${w}.</i>` : ''}</span></span></button>`;
}
// ventana con una lista para elegir (sirve para Colección y para el Inventario)
function openList(title, html, onChoose) {
  $('#pick-title').textContent = title; const list = $('#pick-list'); list.innerHTML = html;
  list.querySelectorAll('.pick-opt').forEach(b => { b.onclick = () => { $('#scr-pick').hidden = true; onChoose(b.dataset.id); }; });
  const g = list.querySelector('[data-goto]'); if (g) g.onclick = () => { $('#scr-pick').hidden = true; gachaTab = g.dataset.goto; play('select'); updateWallets(); openGacha(); };
  for (const cv of list.querySelectorAll('canvas[data-art]')) drawArt(cv, cv.dataset.art, 44, 36);
  $('#scr-pick').hidden = false; list.scrollTop = 0;
}
let pickCtx = null;
function openPick(kind, key) {
  let html = '', owned, sel, title;
  if (kind === 'ab') {
    title = 'Habilidad para ' + CFG.cards[key].name; sel = SAVE.abEquip[key];
    owned = SAVE.inv.filter(it => it.k === 'ab' && ABILITIES[it.id]);
  } else {
    title = SLOTS[key] + ' para ' + CFG.cards[FACTIONS[collFac].leader].name; sel = (SAVE.equip[collFac] || {})[key];
    owned = SAVE.inv.filter(it => it.k === 'eq' && ITEMS[it.id] && ITEMS[it.id].slot === key && fitsFac(it.id, collFac));
  }
  if (sel) html += `<button class="pick-opt" data-id="" style="--rc:#3e2363"><span class="ic" style="background:#cdb9ea">✕</span><span><b class="ol">${kind === 'ab' ? 'Quitar habilidad' : 'Quitar objeto'}</b></span></button>`;
  if (!owned.length) html += `<p class="deck-sub">${kind === 'ab' ? 'Aún no tienes habilidades.' : 'Aún no tienes objetos de este tipo.'} Salen en el gashapón${kind === 'ab' ? '' : ' de equipo'}: cada tirada cuesta ${ECON.pull} gemas.</p><button class="btn-ghost ol" data-goto="${kind}">IR AL GASHAPÓN</button>`;
  html += owned.sort(sortInv).map(it => pickRowHtml(it, sel)).join('');
  pickCtx = { kind, key };
  openList(title, html, uid => chooseFor(kind, key, uid));
}
function chooseFor(kind, key, uid) {
  const it = invGet(uid);
  if (it && kind === 'ab') unequip(it);   // v0.9.15: el equipo se comparte entre líderes; las habilidades no
  if (kind === 'ab') { if (it) SAVE.abEquip[key] = uid; else delete SAVE.abEquip[key]; }
  else { SAVE.equip[collFac] = SAVE.equip[collFac] || {}; if (it) SAVE.equip[collFac][key] = uid; else delete SAVE.equip[collFac][key]; }
  if (it) fire('equipar', kind);
  saveGame(); play('select'); buildColl();
}
/* ---------- equipo compartido: lo que lleva un líder, para todos ---------- */
function equipAll(f) {
  const E = SAVE.equip[f] || {}, facs = misFacciones().filter(g => g !== f);
  const names = Object.keys(SLOTS).filter(sl => invGet(E[sl])).map(sl => ITEMS[invGet(E[sl]).id].name);
  confirmBox('EQUIPO PARA TODOS', `¿Poner <b>${names.join(', ')}</b> a tus otros ${facs.length} líderes?<small>El equipo se comparte: una copia la pueden llevar todos a la vez. Los objetos de facción solo se los pone su líder.</small>`, 'PONER A TODOS', () => {
    let n = 0;
    for (const g of facs) for (const sl in SLOTS) { const it = invGet(E[sl]); if (it && fitsFac(it.id, g)) { SAVE.equip[g] = SAVE.equip[g] || {}; SAVE.equip[g][sl] = it.u; n++; } }
    stat('eqall', 1); saveGame(); play('levelup'); buildColl(); toast(`Hecho: ${facs.length} líderes equipados`);
  });
}
