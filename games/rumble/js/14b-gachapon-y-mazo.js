// Fans of Rumble · Cartas y jefes (2/3): gashapón de cartas, estrellas y mazo personalizable
'use strict';

/* ---------- v0.9.15: gashapón de cartas (hechizos y mata-sanadores), estrellas y mazo personalizado ---------- */
const DECK_SPELLS = 2;   // como mucho 2 hechizos por mazo
const ownsCard = k => !!(SAVE.cards && SAVE.cards[k]) || !!SAVE.testAll;
const starsHtml = k => { const n = cardStars(k); return `<span class="stars" aria-label="${n} estrellas">${'★'.repeat(n)}<i>${'★'.repeat(ECON.maxStars - n)}</i></span>`; };
function deckPool(f) { const F = FACTIONS[f]; return F.units.concat((F.gacha || []).filter(ownsCard)); }
function deckOf(f) {   // líder aparte + 6 cartas: las elegidas (si siguen siendo válidas) y, si faltan, las básicas
  const F = FACTIONS[f]; if (!F || !F.units) return [];
  const pool = deckPool(f); let d = (((SAVE.decks || {})[f]) || []).filter((k, i, a) => pool.includes(k) && a.indexOf(k) === i);
  let sp = 0; d = d.filter(k => !isSpell(k) || ++sp <= DECK_SPELLS);
  for (const k of F.units) if (d.length < 6 && !d.includes(k)) d.push(k);
  return d.slice(0, 6);
}
const deckCost = d => d.reduce((a, k) => a + CFG.cards[k].cost, 0) / Math.max(1, d.length);
function deckBarHtml(f) {
  if (deckEdit && deckEdit.f !== f) deckEdit = null;   // al cambiar de facción se cierra el editor (el mazo ya está guardado)
  if (deckEdit) return deckEditorHtml(f);
  const d = deckOf(f), L = FACTIONS[f].leader, nsp = d.filter(isSpell).length;
  return `<div class="deck-bar"><div><b class="ol">TU MAZO</b><small>Líder + 6 cartas · ${nsp} ${nsp === 1 ? 'hechizo' : 'hechizos'} · coste medio ${fmtV(rnd(deckCost(d), 1))}</small><div class="deck-mini"><span><canvas data-dk="${L}"></canvas></span>${d.map(k => `<span class="${isSpell(k) ? 'sp' : ''}"><canvas data-dk="${k}"></canvas></span>`).join('')}</div></div><button class="btn-up" id="btn-deck">EDITAR<small>MAZO</small></button></div>`;
}
// cartas del gashapón de la facción en la Colección (las que no tienes salen en gris)
function gachaRows(f, lock) {
  const G2 = FACTIONS[f].gacha || []; if (!G2.length) return '';
  const own = G2.filter(ownsCard).length;
  return `<p class="gacha-sec ol">CARTAS DEL GASHAPÓN · ${own}/${G2.length}<small>Salen en la máquina de cartas. Las repetidas le dan estrellas: +5 % cada una, hasta 5.</small></p>` + G2.map(k => (!ownsCard(k) ? lockedRow(k) : isSpell(k) ? spellRow(k, lock) : collRow(k, lock))).join('');
}
function lockedRow(k) {
  const c = CFG.cards[k];
  return `<div class="coll-row locked" data-rarity="${c.rarity}"><canvas data-k="${k}"></canvas><div><div class="coll-name ol">${c.name}<em>${c.rar}</em></div><div class="deck-desc">${c.desc}</div><div class="deck-stats">${c.cost} de CAOS · ${c.tag}</div></div><button class="btn-up" data-goc="1">GASHAPÓN<small>DE CARTAS</small></button></div>`;
}
function spellNums(k, team) {   // números del hechizo con su nivel y estrellas
  const D = CFG.cards[k].spell, P = spellPow(team || 'p', k), t = [];
  if (D.amt) t.push(`${D.kind === 'heal' ? 'Cura' : 'Daño'} ${fmt(D.amt * P)}`);
  if (D.t) t.push(`${fmtV(D.t)} s`);
  t.push(`área de ${D.r}`);
  return t.join(' · ');
}
function spellRow(k, lock) {
  const c = CFG.cards[k], us = uSave(k), max = us.lvl >= ECON.maxLvl, need = needXp(us.lvl), ready = !max && us.xp >= need, cost = lvlCost(us.lvl), pct = max ? 100 : Math.min(100, (us.xp / need) * 100);
  const btn = max ? '<button class="btn-up max" disabled>NV MÁX</button>' : `<button class="btn-up" data-up="${k}" ${ready && !lock ? '' : 'disabled'}>SUBIR<small>${COIN_SVG}${fmt(cost)}</small></button>`;
  return `<div class="coll-row" data-rarity="${c.rarity}"><canvas data-k="${k}"></canvas><div><div class="coll-name ol">${c.name}<em>Nv ${us.lvl}</em>${starsHtml(k)}</div><div class="deck-desc">${c.desc}</div><div class="xpbar"><i style="width:${pct}%"></i><span>${max ? 'NIVEL MÁXIMO' : `${fmt(us.xp)} / ${fmt(need)} XP`}</span></div><div class="deck-stats">${c.cost} de CAOS · ${spellNums(k)}</div></div>${btn}</div>`;
}
function showSpellTip(k) {
  const c = CFG.cards[k], tip = $('#card-tip'), lv = uSave(k).lvl;
  tip.innerHTML = `<div class="tip-head"><canvas></canvas><div><b class="ol">${c.name} <small>Nv ${lv}</small></b><span class="tip-tags"><i class="tcost">${c.cost} de CAOS</i>${roleOf(k).map(t => `<i>${t}</i>`).join('')}<i>${c.rar}</i></span></div></div><div class="tip-spell">${c.desc}</div><div class="tip-stats">${spellNums(k)}${cardStars(k) ? ' · ' + cardStars(k) + ' ★' : ''}</div>`;
  drawArt(tip.querySelector('canvas'), k, 64, 52); tip.hidden = false;
}
// ---- la máquina de cartas
function cardPool(rar) { return FACTION_ORDER.filter(isUnlocked).flatMap(f => FACTIONS[f].gacha || []).filter(k => !rar || CFG.cards[k].rarity === rar); }
function rollCardRarity(force) {
  const P = SAVE.pity; P.cd = (P.cd || 0) + 1; P.cdL = (P.cdL || 0) + 1;
  let r = 'rare'; const O = ECON.cardOdds;
  if (P.cdL >= ECON.pityLeg) r = 'legendary';
  else if (force || P.cd >= ECON.pityEpic) r = Math.random() < O.legendary / (O.legendary + O.epic) ? 'legendary' : 'epic';
  else { const x = Math.random() * 100; r = x < O.legendary ? 'legendary' : x < O.legendary + O.epic ? 'epic' : 'rare'; }
  if (r !== 'rare') P.cd = 0;
  if (r === 'legendary') P.cdL = 0;
  return r;
}
function cardStartLevel(k) {   // la carta nueva llega cerca del nivel de su facción, para que sirva desde el principio
  const F = FACTIONS[CFG.cards[k].fac], avg = Math.round(F.units.reduce((a, u) => a + uSave(u).lvl, 0) / F.units.length), us = uSave(k);
  us.lvl = Math.max(us.lvl, avg - 1, 1);
}
function cardPull(force) {
  let pool = cardPool(rollCardRarity(force)); if (!pool.length) pool = cardPool();
  const k = pick(pool), rar = CFG.cards[k].rarity; SAVE.cards = SAVE.cards || {}; const C = SAVE.cards[k];
  if (!C) { SAVE.cards[k] = { n: 1, st: 0 }; cardStartLevel(k); stat('cardnew', 1); return { k, rar, isNew: true, tag: '¡NUEVA!' }; }
  C.n++;
  if (C.st < ECON.maxStars) { C.st++; stat('cardstar', 1); return { k, rar, up: true, tag: `¡SUBE A ${C.st} ★!` }; }
  ECO.ganar('carta-repetida', { gems: ECON.dupGems }); return { k, rar, gems: true, tag: `Ya tenía 5 ★: +${ECON.dupGems} gemas` };
}
// lo que sale de tirar_cartas (servidor): se guarda lo que dice, sin bajar nunca lo que ya había aquí
function cardDeServidor(r) {
  SAVE.cards = SAVE.cards || {}; const rar = r.rar, k = r.k; let C = SAVE.cards[k];
  if (!C) { C = SAVE.cards[k] = { n: 0, st: 0 }; const us = uSave(k); us.lvl = Math.max(us.lvl, r.nivel || 1); if (r.isNew) { C.n = r.n; C.st = r.st; stat('cardnew', 1); return { k, rar, isNew: true, tag: '¡NUEVA!' }; } }
  C.n = Math.max(C.n, r.n); C.st = Math.max(C.st, r.st);
  if (r.gems) return { k, rar, gems: true, tag: `Ya tenía 5 ★: +${ECON.dupGems} gemas` };
  stat('cardstar', 1); return { k, rar, up: true, tag: `¡SUBE A ${C.st} ★!` };
}
let cardsGoFac = null;
function showCardPulls(res) {
  const card = $('#gr-card'), top = res.reduce((a, r) => (RAR_ORDER[r.rar] < RAR_ORDER[a.rar] ? r : a)), R = CARD_RAR[top.rar];
  card.style.setProperty('--rc1', R[1]); card.style.setProperty('--rc2', R[2]); cardsGoFac = CFG.cards[top.k].fac;
  if (res.length === 1) {
    const r = res[0], c = CFG.cards[r.k];
    card.classList.remove('multi');
    card.innerHTML = `<div class="gr-rar ol">${R[0].toUpperCase()} · ${FACTIONS[c.fac].name.toUpperCase()}</div><canvas class="gr-art"></canvas><div class="gr-name ol">${c.name}</div><div class="gr-desc">${c.desc}</div><div class="gr-tag">${r.tag}${!r.gems ? ' ' + starsHtml(r.k) : ''}</div>`;
    drawArt(card.querySelector('canvas'), r.k, 120, 104);
  } else {
    card.classList.add('multi');
    const news = res.filter(r => r.isNew).length, ups = res.filter(r => r.up).length, order = res.slice().sort((a, b) => RAR_ORDER[a.rar] - RAR_ORDER[b.rar]);
    card.innerHTML = `<div class="gr-rar ol">TIRADA x${res.length}</div><div class="gr-sum">${news ? `<b>${news} ${news > 1 ? 'nuevas' : 'nueva'}</b> · ` : ''}${ups} ${ups === 1 ? 'estrella' : 'estrellas'} más${res.length - news - ups ? ` · ${(res.length - news - ups) * ECON.dupGems} gemas` : ''}</div><div class="gr-grid">${order.map(r => { const c = CFG.cards[r.k], RR = CARD_RAR[r.rar]; return `<div class="gt" style="--rc:${RR[1]};--rc2:${RR[2]}"><canvas data-gk="${r.k}"></canvas><span class="gt-name">${c.name}</span><span class="gt-st">${r.gems ? '+' + ECON.dupGems + ' 💎' : '★'.repeat(cardStars(r.k))}</span>${r.isNew ? '<span class="gt-new">NUEVA</span>' : ''}</div>`; }).join('')}</div><small class="gr-hint">Ponlas en tu mazo desde la Colección.</small>`;
    for (const cv of card.querySelectorAll('canvas[data-gk]')) drawArt(cv, cv.dataset.gk, 40, 34);
  }
  $('#btn-gr-inv').textContent = 'Ver en la Colección';
  $('#gacha-result').hidden = false; play(res.some(r => r.isNew || r.rar !== 'rare') ? 'win' : 'levelup');
}
function buildCardGachaText() {
  const n = cardPool().length, own = cardPool().filter(k => SAVE.cards && SAVE.cards[k]).length, O = ECON.cardOdds;
  $('#gacha-sub').textContent = `Hechizos y mata-sanadores de las facciones que ya tienes (${own} de ${n}). La primera copia desbloquea la carta; las repetidas le dan estrellas: +5 % cada una, hasta 5.`;
  $('#btn-gr-inv').textContent = 'Ver en la Colección';
  $('#gacha-odds').innerHTML = oddsHead('Probabilidades') + [['Rara', O.rare], ['Épica', O.epic], ['Legendaria', O.legendary]].map(([n, v]) => oddsLine(n, v + ' %')).join('')
    + oddsHead('Garantías')
    + oddsNote(`Épica o mejor como mucho cada ${ECON.pityEpic} tiradas (llevas ${SAVE.pity.cd || 0})`)
    + oddsNote(`Legendaria a las ${ECON.pityLeg} tiradas (llevas ${SAVE.pity.cdL || 0})`)
    + oddsNote(`Con 5 estrellas, una repetida da ${ECON.dupGems} gemas.`, true);
}
// ---- editar el mazo (v0.9.31: se despliega dentro de la Colección; cada cambio se guarda al momento y GUARDAR lo pliega)
let deckEdit = null;   // { f, sel, pick, back } mientras el editor está desplegado
function openDeck(f, back) { deckEdit = { f, sel: deckOf(f).slice(), pick: null, back: back || null }; collFac = f; updateWallets(); show('scr-coll'); buildColl(); const e = $('#deck-ed'); if (e) e.scrollIntoView({ block: 'start' }); }
function deckRefresh() { const sc = $('#scr-coll'), y = sc.scrollTop; buildColl(); sc.scrollTop = y; }
function deckTile(k, o) {   // o: { lead, slot, inDeck, pick, target }
  const c = CFG.cards[k], sp = isSpell(k), st = cardStars(k), lv = uSave(k).lvl;
  const cls = ['dk2c', sp ? 'sp' : '', o.inDeck ? 'in' : '', o.pick ? 'pick' : '', o.target ? 'target' : ''].filter(Boolean).join(' ');
  const data = o.lead ? 'disabled' : o.slot != null ? `data-dks="${o.slot}"` : `data-dkp="${k}"`;
  const tag = o.lead ? c.tag : sp ? 'Hechizo' : c.tag || c.rar;
  return `<button class="${cls}" data-rarity="${c.rarity}" ${data} aria-label="${c.name}, nivel ${lv}, cuesta ${c.cost} de CAOS${o.inDeck ? ', en tu mazo' : ''}">`
    + `<span class="dk2c-art"><canvas data-dka="${k}" data-big="${o.lead ? 1 : 0}"></canvas></span>`
    + `<i class="dk2c-lvl">${lv}</i><i class="dk2c-cost">${c.cost}</i>`
    + (st ? `<span class="dk2c-stars">${'★'.repeat(st)}</span>` : '')
    + (o.lead ? '<span class="dk2c-lead">LÍDER</span>' : '')
    + `<span class="dk2c-name">${c.name}</span><span class="dk2c-tag">${tag}</span>`
    + (o.inDeck ? '<span class="dk2c-in">EN EL MAZO</span>' : '') + '</button>';
}
function deckEditorHtml(f) {
  const D = deckEdit, { sel } = D, F = FACTIONS[f], pool = deckPool(f), nsp = sel.filter(isSpell).length, all = F.units.length + (F.gacha || []).length;
  const pickSp = D.pick && isSpell(D.pick), spFull = pickSp && nsp >= DECK_SPELLS;
  let board = deckTile(F.leader, { lead: true });
  for (let i = 0; i < 6; i++) {
    const k = sel[i];
    if (!k) { board += `<button class="dk2c empty${D.pick ? ' target' : ''}" data-dks="${i}" aria-label="Hueco vacío"><b>+</b>VACÍO</button>`; continue; }
    board += deckTile(k, { slot: i, target: !!D.pick && (!spFull || isSpell(k)) });
  }
  const used = [F.leader].concat(sel), avg = used.reduce((a, k) => a + uSave(k).lvl, 0) / used.length;
  const note = (D.pick ? '' : '<b>Mantén pulsada</b> una carta para ver qué hace. ') + (D.pick ? `Toca la carta de tu mazo que quieres cambiar por <b>${CFG.cards[D.pick].name}</b>${spFull ? ' (tiene que ser un hechizo: como mucho ' + DECK_SPELLS + ')' : ''}. Toca otra vez para cancelar.`
    : sel.length < 6 ? `Te faltan <b>${6 - sel.length}</b> ${6 - sel.length === 1 ? 'carta' : 'cartas'}: toca una de tus tropas para ponerla.`
    : 'Toca una de tus tropas y luego la carta del mazo que quieres cambiar.');
  return `<div class="deck-ed" id="deck-ed"><div class="deck-bar"><div><b class="ol">TU MAZO</b><small>Líder + 6 cartas</small></div><div class="deck-bb"><button class="btn-up" id="btn-deck-reset">POR DEFECTO</button><button class="btn-up save" id="btn-deck-ok">GUARDAR</button></div></div>`
    + `<div class="dk2-frame"><div class="dk2-board" id="deck-board">${board}</div></div>`
    + `<div class="dk2-stats"><span class="dk2-chip">Nivel medio ${fmtV(rnd(avg, 1))}</span><span class="dk2-chip${nsp >= DECK_SPELLS ? ' full' : ''}">Hechizos ${nsp}/${DECK_SPELLS}</span><span class="dk2-chip">Coste medio ${fmtV(rnd(deckCost(sel), 1))}</span></div>`
    + `<p class="dk2-hint">${note}</p>`
    + `<div class="dk2-pool"><div class="dk2-pool-h"><b class="ol">TUS TROPAS</b><small>Tienes ${pool.length} de ${all}</small></div><div class="dk2-grid" id="deck-grid">${pool.map(k => deckTile(k, { inDeck: sel.includes(k), pick: D.pick === k })).join('')}</div></div></div>`;
}
function deckBind(list) {   // con la colección pintada: dibuja las cartas del editor y le da vida
  if (!deckEdit || !$('#deck-ed')) return;
  const { sel, f } = deckEdit;
  for (const cv of list.querySelectorAll('#deck-ed canvas[data-dka]')) { const big = cv.dataset.big === '1'; drawArt(cv, cv.dataset.dka, big ? 104 : 96, big ? 150 : 88); }
  for (const b of list.querySelectorAll('#deck-grid [data-dkp]')) { deckHold(b, b.dataset.dkp); b.onclick = () => { if (!deckHeld()) deckPoolTap(b.dataset.dkp); }; }
  for (const b of list.querySelectorAll('#deck-board [data-dks]')) { const k = sel[+b.dataset.dks]; if (k) deckHold(b, k); b.onclick = () => { if (!deckHeld()) deckSlotTap(+b.dataset.dks); }; }
  for (const b of list.querySelectorAll('#deck-board .dk2c[data-rarity="leader"]')) { b.disabled = false; deckHold(b, FACTIONS[f].leader); }
  $('#btn-deck-ok').onclick = deckDone;
  $('#btn-deck-reset').onclick = () => { deckEdit.sel = FACTIONS[f].units.slice(); deckEdit.pick = null; play('select'); deckSave(); };
}
// v0.9.18: mantener pulsada una carta enseña su ficha (qué hace); al soltar se cierra y no se pone ni se quita
let deckHoldT = null, deckHoldOn = false, deckHoldAt = 0;
const deckHeld = () => { const h = deckHoldOn || performance.now() - deckHoldAt < 350; deckHoldOn = false; return h; };
function deckHold(b, k) {
  b.addEventListener('contextmenu', e => e.preventDefault());
  b.addEventListener('pointerdown', e => {
    clearTimeout(deckHoldT); const x0 = e.clientX, y0 = e.clientY;
    deckHoldT = setTimeout(() => { const keep = G.faction; G.faction = deckEdit.f; showCardTip(k); G.faction = keep; $('#card-tip').classList.add('deck'); deckHoldOn = true; play('select'); }, 420);
    const mv = ev => { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) clearTimeout(deckHoldT); };
    const up = () => { clearTimeout(deckHoldT); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); if (deckHoldOn) { deckHoldAt = performance.now(); hideCardTip(); $('#card-tip').classList.remove('deck'); } };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  });
}
function deckSave() { SAVE.decks[deckEdit.f] = deckEdit.sel.slice(); saveGame(); deckRefresh(); }
function deckPoolTap(k) {
  const D = deckEdit, sel = D.sel, i = sel.indexOf(k);
  if (i >= 0) { sel.splice(i, 1); D.pick = null; play('select'); deckSave(); return; }   // ya estaba: se quita
  if (D.pick === k) { D.pick = null; play('select'); deckRefresh(); return; }
  const spOk = !isSpell(k) || sel.filter(isSpell).length < DECK_SPELLS;
  if (sel.length < 6 && spOk) { sel.push(k); D.pick = null; play('select'); deckSave(); return; }
  D.pick = k; play('select'); deckRefresh();   // mazo lleno (o ya hay 2 hechizos): elige qué carta cambiar
}
function deckSlotTap(i) {
  const D = deckEdit, sel = D.sel, k = sel[i];
  if (D.pick) {
    const others = sel.filter((x, j) => j !== i && isSpell(x)).length;
    if (isSpell(D.pick) && others >= DECK_SPELLS) { toast(`Como mucho ${DECK_SPELLS} hechizos: cambia uno de tus hechizos`); play('deny'); return; }
    if (k) sel[i] = D.pick; else sel.push(D.pick);
    D.pick = null; play('levelup'); deckSave(); return;
  }
  if (!k) { toast('Toca una de tus tropas de abajo para ponerla aquí'); return; }
  sel.splice(i, 1); play('select'); deckSave();
}
function deckDone() {   // GUARDAR: completa con las básicas si faltan y pliega el editor
  const { f, sel, back } = deckEdit; if (sel.length < 6) toast('Faltaban cartas: se completa con las básicas');
  SAVE.decks[f] = deckOf(f); saveGame(); deckEdit = null; play('select'); buildPrepDeck(); if (G.state !== 'play') resetMatch();
  if (back) show(back); else deckRefresh();
}

