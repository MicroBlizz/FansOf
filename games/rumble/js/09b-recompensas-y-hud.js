// Fans of Rumble · Menús (2/3): las recompensas al terminar, el marcador y la ficha de cada carta
'use strict';

/* ---------- recompensas al terminar ---------- */
function grantRewards() {
  if (G.mode === 'sandbox' || G.mode === 'pvp') return { gold: 0, gems: 0, xp: [], stars: 0, unlock: null, record: false, ready: [], passXp: 0 };   // v0.9.20: la sala de pruebas no da nada
  const R = { gold: 0, gems: 0, xp: [], stars: 0, unlock: null, record: false, ready: [] }, win = G.winner === 'p', w = G.winner;
  for (const [k, n] of Object.entries(S.p.plays)) {
    const us = uSave(k); if (us.lvl >= ECON.maxLvl) continue;
    const x = Math.round(n * ECON.xpPerPlay * (win ? ECON.winXpMult : 1)); us.xp += x; R.xp.push([k, x]); if (canLevel(k)) R.ready.push(k);
  }
  if (G.mode === 'quick') R.gold = win ? ECON.quick[G.diff] : ECON.quick.lose;
  if (G.mode === 'quick' && G.diff === 'ceo' && win) R.gems += ECON.quickCeoGems;   // v0.9.71
  else if (G.mode === 'arena') arenaReward(R, w);   // v0.9.20
  else if (G.mode === 'camp') {
    const L = G.level, cd = G.cdiff || 'n', pay = CDIFF[cd].pay || 1, prev = starsD(L.id, cd);
    if (win) {
      R.stars = 1 + (S.e.crowns === 0 ? 1 : 0) + (G.endReason === 'base' ? 1 : 0);
      if (!prev) { const fr = L.boss ? ECON.camp.boss : ECON.camp.first; R.gold += fr[0] * pay; R.gems += fr[1] * pay; } else R.gold += ECON.camp.replay * pay;
      if (R.stars === 3 && prev < 3) { R.gold += ECON.camp.stars3[0] * pay; R.gems += ECON.camp.stars3[1] * pay; }
      campOf(cd)[L.id] = Math.max(prev, R.stars);
      const Wd = WORLDS[L.wi];
      if (L.boss && cd !== 'f' && Wd.unlock && !isUnlocked(Wd.unlock)) {   // la facción liberada se une a ti (v0.9.55: en Fácil no se libera). v0.9.71: sus cartas empiezan a nivel 1, para subirlas tú
        SAVE.unlocked.push(Wd.unlock); R.unlock = Wd.unlock; stat('unlock', 1);
      }
      missionEvent('star', R.stars);
      if (L.boss && L.wi === CEO_WI && cd !== 'f') stat('ceo', 1);
      if (L.boss && WORLDS[L.wi].unlock === 'olvidados' && cd !== 'f') stat('olvido', 1);
      if (L.boss && L.wi === 11 && cd !== 'f') stat('phonyboss', 1);
      if (L.boss && L.wi === IA_FINAL && cd !== 'f') stat('iaboss', 1);   // v0.9.23
      if (L.boss && cdHard(cd)) stat(cd === 'h' ? 'hardboss' : cd === 'x' ? 'heroboss' : 'mythboss', 1);
      if (L.boss && cd === 'm' && !SAVE.mythPrize[L.wi]) { SAVE.mythPrize[L.wi] = 1; R.prize = legendaryPrize(); const clv = ECO.ganar('objeto', {}, { tipo: 'objeto', regalo: 'mito', mundo: L.wi + 1, id: R.prize.id, q: R.prize.q }); if (clv) R.prize.pend = clv; }
      const ff = worldFac(L.wi); if (L.boss && cdHard(cd) && ff && !(SAVE.facItem || {})[ff]) { SAVE.facItem = SAVE.facItem || {}; SAVE.facItem[ff] = 1; R.facItem = newCopy('eq', FAC_ITEM[ff], 2); const clv = ECO.ganar('objeto', {}, { tipo: 'objeto', regalo: 'facitem', fac: ff, id: R.facItem.id, q: R.facItem.q }); if (clv) R.facItem.pend = clv; }
    } else R.gold += ECON.camp.lose * pay;
  } else if (G.mode === 'boss') {   // v0.9.15: premios por jefe y dificultad, y un extra si lo derrotas
    const wi = G.bossWi == null ? CEO_WI : G.bossWi, d = G.bossDiff || 'n', BD = BDIFF[d], key = wi + d, hp = bases.e.maxHp, sc = Math.round(S.p.bossDmg), kill = !bases.e.alive && w !== 'e';
    R.score = sc; R.pct = Math.min(100, Math.floor(sc / hp * 100)); R.gold = Math.floor(sc / 40 * BD.pay); R.boss = { wi, d, key, tiers: [], kill, first: false };
    let bits = SAVE.bossPay[key] || 0;
    BOSS_TIERS.forEach((f, i) => { if (sc >= hp * f && !(bits & (1 << i))) { bits |= 1 << i; R.gems += BOSS_TGEMS[i] * BD.pay; R.boss.tiers.push(i); } });
    if (kill) { R.boss.bonus = BOSS_KGOLD * BD.pay + Math.round(Math.max(0, G.time)) * 2; R.gold += R.boss.bonus; if (!(bits & 8)) { bits |= 8; R.gems += BOSS_KGEMS * BD.pay; R.boss.first = true; } stat('bosskill', 1); if (d === 'm') stat('bosskillm', 1); }
    SAVE.bossPay[key] = bits;
    if (sc > (SAVE.bossRec[key] || 0)) { SAVE.bossRec[key] = sc; R.record = true; }
    if (sc > (SAVE.bestBoss || 0)) SAVE.bestBoss = sc;
    missionEvent('boss', 1);
  }
  if (win) missionEvent('win', 1);
  missionEvent('play', 1); if (G.mode === 'camp' || G.mode === 'quick') missionEvent(G.mode, 1);
  missionEvent('caos', Math.round(S.p.spent)); missionEvent('leader', S.p.plays[FACTIONS[G.faction].leader] || 0);
  if (win && S.e.crowns === 0) missionEvent('flawless', 1);
  if (win && G.endReason === 'base') missionEvent('base', 1);
  if (win) missionEvent('facwin', 1, G.faction);
  R.passXp = win ? PASS.xpWin : PASS.xpLose; R.passUp = addPassXp(R.passXp);
  missionEvent('card', S.p.deployed); missionEvent('kill', S.p.kills); missionEvent('tower', Math.min(S.p.crowns, 2 + (G.endReason === 'base' ? 1 : 0)));
  if (win && !SAVE.tut.done && SAVE.tut.step === 0) tutStep(1);   // partida guiada: primera victoria
  // v0.9.14: estadísticas de los logros (cartas jugadas, enemigos por tipo, rachas y secretos)
  for (const [k, n] of Object.entries(S.p.plays)) stat('play_' + k, n);
  for (const [k, n] of Object.entries(S.p.kb || {})) stat('ek_' + k, n);
  stat('ekf_' + G.efac, S.p.kills); stat('eleader', S.p.kl || 0);
  const ST = SAVE.stats, real = G.mode !== 'boss', rwin = win && real;
  if (rwin) { stat('fwin_' + G.faction, 1); ST.curStreak = (ST.curStreak || 0) + 1; ST.bestStreak = Math.max(ST.bestStreak || 0, ST.curStreak); }
  else if (G.winner === 'e') { ST.curStreak = 0; stat('lose', 1); }
  if (new Date().getHours() < 5) stat('night', 1);
  if (rwin && S.e.crowns >= 2) stat('comeback', 1);
  if (rwin && S.p.deployed > 0 && Object.keys(S.p.plays).every(isLeader)) stat('onlylead', 1);
  if (real && !S.p.deployed) stat('strike', 1);
  if (rwin && S.p.spent <= 30) stat('cheapwin', 1);
  if (S.p.spent >= 100) stat('bigspend', 1);
  if (S.p.kills >= 60) stat('massacre', 1);
  const myBase = structs.find(x => x.team === 'p' && x.role === 'base'); if (rwin && myBase && myBase.hp / myBase.maxHp < 0.15) stat('closecall', 1);
  if (rwin && G.endReason === 'base' && CFG.matchTime - G.time < 100) stat('fastwin', 1);
  if (rwin && G.endReason === 'hp') stat('hpwin', 1);
  if (rwin && G.mode === 'quick' && G.diff === 'easy') stat('easywin', 1);
  ECO.ganar('partida', R, G.mode === 'camp' ? { tipo: 'camp', nivel: G.level.id, dif: G.cdiff || 'n', estrellas: R.stars, victoria: win, jefe: !!G.level.boss } : { tipo: 'otro', victoria: win }); saveGame(); return R;
}

function fit() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight;
  const narrow = bw < 600, pad = narrow ? 0 : 24;
  // tall phones get extra room: HUD moves above the arena, cards get more thumb space
  const LH = narrow ? clamp(Math.round((W * bh) / Math.max(1, bw)), H, 1170) : H;
  let w = bw - pad * 2, h = (w * LH) / W;
  if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * W) / LH; }
  w = Math.max(200, Math.floor(w)); h = Math.floor((w * LH) / W);
  stage.style.width = w + 'px'; stage.style.height = h + 'px';
  const extra = LH - H; VIEW.LH = LH; VIEW.top = Math.round(extra * 0.45); VIEW.bot = extra - VIEW.top;
  ui.style.height = LH + 'px'; ui.style.setProperty('--top', VIEW.top + 'px'); ui.style.setProperty('--bot', VIEW.bot + 'px');
  ui.style.transform = `scale(${w / W})`; VIEW.sc = w / W;
  document.documentElement.classList.toggle('ahorro', !!SAVE.ahorro);   // v0.9.63: el modo ahorro también apaga los brillos de las cartas
  const dpr = Math.min(window.devicePixelRatio || 1, SAVE.ahorro ? 1.25 : 3);   // v0.9.39: en modo ahorro se dibuja con menos píxeles (lo que más pesa en un móvil sencillo)
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  VIEW.k = cv.width / W;
}
function toLogical(e) {   // v0.9.18: x, y = punto del campo (con el zoom); sy = altura en la pantalla (para saber si el dedo está sobre las cartas)
  const r = stage.getBoundingClientRect(), sx = ((e.clientX - r.left) / r.width) * W, sy = ((e.clientY - r.top) / r.height) * VIEW.LH;
  return { x: (sx - CAM.ox) / CAM.z, y: (sy - CAM.oy) / CAM.z - VIEW.top, sy: sy - VIEW.top };
}

let bannerTimer = null;
// v0.9.9: cada cartel se queda el tiempo justo para leerlo (más si es largo) y los siguientes esperan su turno
const bannerQ = []; let bannerOn = false;
function banner(title, sub, kind, now) {
  if (now) bannerClear();
  if (bannerQ.some(q => q.title === title && q.sub === sub)) return;
  bannerQ.push({ title, sub, kind }); if (bannerQ.length > 3) bannerQ.splice(0, bannerQ.length - 3);
  if (!bannerOn) nextBanner();
}
function nextBanner() {
  const B = bannerQ.shift(), b = $('#banner'); if (!B) { bannerOn = false; return; }
  bannerOn = true;
  b.querySelector('.b-title').textContent = B.title; const bs = b.querySelector('.b-sub'); bs.textContent = B.sub || ''; bs.hidden = !B.sub;
  b.className = B.kind || ''; void b.offsetWidth; b.className = 'show ' + (B.kind || '');
  const dur = clamp(1500 + (B.title.length + (B.sub || '').length) * 45, 2600, 4800);
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => { b.className = B.kind || ''; bannerTimer = setTimeout(nextBanner, 300); }, dur);
}
function bannerClear() { bannerQ.length = 0; clearTimeout(bannerTimer); bannerOn = false; const b = $('#banner'); if (b) b.className = ''; }
function showTut(force) { if ((G.tutSeen && !force) || G.autoplay) return; $('#tut').hidden = false; if (!G.tutMatch) setTimeout(hideTut, 14000); }
function hideTut() { $('#tut').hidden = true; G.tutSeen = true; }

const hud = {
  cache: {},
  reset() { this.cache = {}; $('#x2').hidden = true; $('#score').hidden = G.mode !== 'boss'; },
  update() {
    if (!S) return; const c = this.cache; const ch = S.p.chaos;
    const fw = ((ch / CFG.chaosMax) * 100).toFixed(1) + '%'; if (c.fw !== fw) { $('#chaos-fill').style.width = fw; c.fw = fw; }
    const cn = Math.floor(ch); if (c.cn !== cn) { $('#chaos-num').textContent = cn; c.cn = cn; }
    const ts = Math.ceil(G.time); if (c.ts !== ts) { $('#timer').textContent = Math.floor(ts / 60) + ':' + String(ts % 60).padStart(2, '0'); $('#timer').classList.toggle('low', ts <= 30); c.ts = ts; }
    if (c.cp !== S.p.crowns) { $('#crown-p').textContent = S.p.crowns; c.cp = S.p.crowns; }
    if (c.ce !== S.e.crowns) { $('#crown-e').textContent = S.e.crowns; c.ce = S.e.crowns; }
    if (G.mode === 'boss') { const sc = `DAÑO ${fmt(S.p.bossDmg)} · ${Math.floor(S.p.bossDmg / bases.e.maxHp * 100)} %`; if (c.sc !== sc) { $('#score').textContent = sc; c.sc = sc; } }
    let pn = '';
    if (G.faction === 'streamers') pn = S.p.hypeLvl ? '+' + S.p.hypeLvl * 5 + '%' : S.p.hype + '/' + CFG.passives.streamers.per;
    else if (G.faction === 'heroes') pn = String(S.p.xpLvl);
    else if (G.faction === 'gamer') pn = S.p.comm ? '+' + S.p.comm * 5 + '%' : '';
    if (c.pn !== pn) { const em = $('#pass-n'); if (em) { em.textContent = pn; em.hidden = !pn; } c.pn = pn; }
    const lk = FACTIONS[G.faction].leader;
    const leaderOut = units.some(u => u.alive && u.team === 'p' && u.type === lk), leaderRising = revives.some(r => r.team === 'p' && r.type === lk);
    const nk = S.p.queue[0];
    if (c.next !== nk) { drawArt($('#next-art canvas'), nk, 34, 34); $('#next-art').dataset.rarity = CFG.cards[nk].rarity; $('#next-art').title = 'Siguiente: ' + CFG.cards[nk].name; c.next = nk; }
    for (const el of elCards) {
      const k = slotKey(el._slot), kk = k + '|' + uSave(k).lvl;   // el nivel va en la clave: si subes la carta en la colección, se repinta
      if (el._key !== kk) { renderCard(el, k); if (el._key && G.state === 'play') { el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); } el._key = kk; el._poor = undefined; el._h = undefined; }
      const cost = CFG.cards[k].cost, poor = ch < cost;
      const hgt = poor ? ((1 - ch / cost) * 100).toFixed(1) + '%' : '0%'; if (el._h !== hgt) { el._charge.style.height = hgt; el._h = hgt; }
      if (el._poor !== poor) { el.classList.toggle('poor', poor); el._poor = poor; }
      if (el._wasPoor && !poor && G.state === 'play') { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
      el._wasPoor = poor;
      const sel = (input.selected !== null && input.selSlot === el._slot) || (input.dragging && input.slot === el._slot); if (el._sel !== sel) { el.classList.toggle('selected', sel); el._sel = sel; }
      if (k === lk) { const txt = leaderOut ? 'EN EL CAMPO' : leaderRising ? (G.faction === 'pop' ? 'SECUELA' : 'RENACIENDO') : S.p.leaderCd > 0 ? 'VUELVE EN ' + Math.ceil(S.p.leaderCd) : ''; if (el._lockTxt !== txt) { el._lock.textContent = txt; el._lock.hidden = !txt; el._lockTxt = txt; } }
    }
  },
};

// v0.9.10: ficha de la carta al mantenerla pulsada (dedo o ratón) sin arrastrarla
function roleOf(k) {
  const u = CFG.units[k], c = CFG.cards[k], r = [];
  if (c.spell) return ['Hechizo', { dmg: 'Daño', heal: 'Cura' }[c.spell.kind] || 'Efecto loco', c.spell.side === 'ally' ? 'Sobre los tuyos' : 'Sobre el rival'];   // v0.9.15
  if (u.leap) r.push('Mata-sanadores');
  if (isLeader(k)) r.push('Líder');
  if (u.healer) r.push('Curandera');
  else if (u.kamikaze) r.push('Kamikaze: va a por las torres');
  else if (u.buildings) r.push('Asedio: solo ataca edificios');
  else if (!isLeader(k) && u.hp * (c.count || 1) >= 700) r.push('Tanque');
  if (!u.healer && !u.kamikaze) r.push(u.ranged ? 'A distancia' : 'Cuerpo a cuerpo');
  if ((c.count || 1) > 1) r.push(`Salen ${c.count}`);
  return r;
}
function showCardTip(k) {
  G.tutTipSeen = true;
  if (isSpell(k)) { showSpellTip(k); return; }   // v0.9.15
  const c = CFG.cards[k], u = CFG.units[k], lv = uSave(k).lvl, m = 1 + (lv - 1) * ECON.lvlStep, tip = $('#card-tip');
  const es = effStats(k, G.faction), bst = es.boosts.length ? `<span class="boost">Con todo puesto: ${es.boosts.join(', ')}</span>` : '';
  const stats = (u.healer ? `Vida ${fmt(es.hp)} · Cura ${u.heal} cada ${fmtV(u.healCd)} s a los que tiene delante (en un cono)` : `Vida ${fmt(es.hp)}${c.count > 1 ? ' cada una' : ''} · Daño ${fmt(es.dmg)}${u.buildings ? ' a edificios' : ''}`) + bst;
  const ab = invGet(SAVE.abEquip[k]);
  let extra = ab ? `<div class="tip-ab">Habilidad del gashapón: <b>${ABILITIES[ab.id].name}</b> (${QTIERS[tierOf(avgQ(ab))].name}): ${descOf(ab)}</div>` : '';
  if (isLeader(k)) { const E = SAVE.equip[G.faction] || {}, its = Object.keys(SLOTS).map(sl => invGet(E[sl])).filter(Boolean); if (its.length) extra += `<div class="tip-ab">Equipo: ${its.map(it => `<b>${ITEMS[it.id].name}</b> (${QTIERS[tierOf(avgQ(it))].name})`).join(', ')}.</div>`; }
  tip.innerHTML = `<div class="tip-head"><canvas></canvas><div><b class="ol">${c.name} <small>Nv ${lv}</small></b><span class="tip-tags"><i class="tcost">${c.cost} de CAOS</i>${roleOf(k).map(t => `<i>${t}</i>`).join('')}${c.rarity === 'leader' ? '' : `<i>${c.rar}</i>`}</span></div></div><p>${c.desc}</p><div class="tip-stats">${stats}</div>${extra}`;
  drawArt(tip.querySelector('canvas'), k, 64, 52); tip.hidden = false;
}
function hideCardTip() { const t = document.getElementById('card-tip'); if (t) t.hidden = true; }
function selectCard(slot) {
  if (G.state !== 'play') return;
  if (input.selected !== null && input.selSlot === slot) { input.selected = null; input.selSlot = null; return; }
  input.selected = slotKey(slot); input.selSlot = slot; play('select');
  if (input.touch) toast('Ahora toca tu lado del campo');
}
for (const el of elCards) {
  el.addEventListener('pointerdown', e => {
    if (G.state !== 'play') return;
    e.preventDefault(); audioInit();
    input.card = slotKey(el._slot); input.slot = el._slot; input.pointerId = e.pointerId; input.dragging = false; input.startX = e.clientX; input.startY = e.clientY; input.touch = e.pointerType !== 'mouse';
    clearTimeout(input.tipT); input.tipShown = false; const pid = e.pointerId;
    input.tipT = setTimeout(() => { if (input.card && !input.dragging && input.pointerId === pid && G.state === 'play') { showCardTip(input.card); input.tipShown = true; } }, 420);
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  el.addEventListener('click', e => { if (e.detail === 0) selectCard(el._slot); });
  el.addEventListener('contextmenu', e => e.preventDefault());   // sin menú del sistema al mantener pulsado
}
window.addEventListener('pointermove', e => {
  if (input.card && e.pointerId === input.pointerId) {
    if (!input.dragging && Math.hypot(e.clientX - input.startX, e.clientY - input.startY) > 10) { input.dragging = true; input.selected = null; input.selSlot = null; clearTimeout(input.tipT); if (input.tipShown) { input.tipShown = false; hideCardTip(); } }
    if (input.dragging) { const p = toLogical(e); input.ghost = { x: p.x, y: p.y - (input.touch ? 40 / CAM.z : 0) - FIELD_DY, fy: p.sy }; }
  }
});
function endPointer(e, cancelled) {
  if (!input.card || e.pointerId !== input.pointerId) return;
  clearTimeout(input.tipT);
  if (input.tipShown) { input.tipShown = false; hideCardTip(); input.card = null; input.slot = null; input.dragging = false; input.pointerId = null; return; }   // solo quería leer la ficha
  const k = input.card;
  if (!cancelled) {
    if (!input.dragging && Math.hypot(e.clientX - input.startX, e.clientY - input.startY) > 10) input.dragging = true;
    if (input.dragging) { const p = toLogical(e); const y = p.y - (input.touch ? 40 / CAM.z : 0) - FIELD_DY; if (p.sy < TRAY_Y - 4) tryPlayerDeploy(input.slot, k, p.x, y); }
    else selectCard(input.slot);
  }
  input.card = null; input.slot = null; input.dragging = false; input.pointerId = null; if (input.selected === null) input.ghost = null;
}
window.addEventListener('pointerup', e => endPointer(e, false));
window.addEventListener('pointercancel', e => endPointer(e, true));
function fieldTap(e) {
  if (G.state !== 'play' || input.selected === null) return;
  audioInit(); const p = toLogical(e); if (p.sy >= TRAY_Y) return;
  if (tryPlayerDeploy(input.selSlot, slotKey(input.selSlot), p.x, p.y - FIELD_DY)) { input.selected = null; input.selSlot = null; input.ghost = null; }
}
cv.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') fieldTap(e); });   // con el dedo va en camTouchEnd (v0.9.18: por si es un pellizco)
cv.addEventListener('pointermove', e => { if (input.selected && !input.card && e.pointerType === 'mouse') { const p = toLogical(e); input.ghost = { x: p.x, y: p.y - FIELD_DY, fy: p.sy }; } });
cv.addEventListener('pointerleave', () => { if (!input.card) input.ghost = null; });
window.addEventListener('keydown', e => {
  if (G.state === 'play' && ['1', '2', '3', '4', '5'].includes(e.key)) { input.touch = false; selectCard(+e.key - 2); }
  if (e.key === 'Escape') { if (G.state === 'play') { if (input.selected !== null) { input.selected = null; input.selSlot = null; } else pauseGame(); } else if (G.state === 'paused') resumeGame(); }
});

