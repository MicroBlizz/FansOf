// Fans of Rumble · Menús de este juego: chat, compartir, campaña, antes de jugar, premios, marcador y final de la partida.
// La cartera, la colección, el inventario, el gashapón y la tienda son comunes: core/js/sistema/.
'use strict';
/* =========================================================
   CHAT, COMPARTIR, CAMPAÑA, PREMIOS Y MARCADOR
   ========================================================= */
const RANK = r => (r > 1 ? ' ' + '★'.repeat(r) : '');
function avgLevel(f) { const F = FACTIONS[f]; const ks = [F.leader, ...F.units]; return Math.max(1, Math.round(ks.reduce((a, k) => a + uSave(k).lvl, 0) / ks.length)); }
/* ---------- sátira: chat falso en directo ---------- */
const chatSt = { t: 6 };
function chatSay(kind, extra, key) {
  if (SAVE.chatOff) return;
  const box = $('#chat'); if (!box) return;
  const lines = (ownerOf() === 'phony' && CHAT_PH[kind]) || (ownerOf() === 'iahorro' && CHAT_IA[kind]) || CHAT[kind]; if (!lines) return;
  const own = (CHAT_FAC[G.faction] || {})[kind];
  const vs = kind === 'idle' ? CHAT_VS[G.efac] : null;
  const bossI = G.mode === 'boss' ? (G.bossWi == null ? CEO_WI : G.bossWi) : G.level && G.level.boss ? G.level.wi : -1, bl = bossI >= 0 && (kind === 'idle' || kind === 'boss' || kind === 'start') ? CHAT_BOSS[bossI] : null;
  const choose = () => { const r = Math.random(); let t = bl && r < 0.3 ? pick(bl) : own && r < 0.62 ? pick(own) : vs && r < 0.8 ? pick(vs) : pick(lines); if (key && CHAT_UNIT[key] && Math.random() < 0.65) t = pick(CHAT_UNIT[key]); return t; };
  const recent = chatSt.recent || (chatSt.recent = []); let txt = choose();
  for (let i = 0; i < 8 && recent.includes(txt); i++) txt = choose();   // v0.9.13: sin repetir lo que acaba de salir
  recent.push(txt); if (recent.length > 10) recent.shift();
  if (extra) txt = txt.replace('{X}', extra);
  txt = txt.replace(/\{yo\}/g, esc(pname()));   // v0.9.26: el chat te llama por tu nombre
  const fu = CHAT_USERS_FAC[G.faction], [nm, col] = fu && Math.random() < 0.3 ? pick(fu) : pick(CHAT_USERS);
  const d = document.createElement('div'); d.className = 'cl';
  d.innerHTML = `<b style="color:${col}">${nm}</b>: ${txt}`;
  box.appendChild(d);
  while (box.children.length > 4) box.removeChild(box.firstChild);
  setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 650); }, 6500);
}
function chatBurst(kind, n) { chatSay(kind); for (let i = 1; i < n; i++) setTimeout(() => { if (G.state === 'play' || G.state === 'ending') chatSay(kind); }, 500 + i * 650 + Math.random() * 400); }
function chatTick(dt) { chatSt.t -= dt; if (chatSt.t <= 0) { chatSay('idle'); chatSt.t = rand(5, 10); } }
function chatClear() { const b = $('#chat'); if (b) b.innerHTML = ''; chatSt.t = 6; chatSt.lastDep = null; chatSt.fullT = 0; chatSt.kq = []; chatSt.closeSaid = false; for (const k in chatCd) delete chatCd[k]; }
// v0.9.12: comentarios de lo que pasa. Cada tipo tiene su probabilidad y su pausa, y nunca dos seguidos en menos de 1,2 s
const chatCd = {};
function chatEv(kind, extra, key, prob = 1, cd = 5) {
  if (SAVE.chatOff || G.state !== 'play' || Math.random() > prob) return;
  if (chatCd[kind] != null && G.t - chatCd[kind] < cd) return;
  if (chatCd._any != null && G.t - chatCd._any < 1.2) return;
  chatCd[kind] = chatCd._any = G.t; chatSt.t = Math.max(chatSt.t, 3.5); chatSay(kind, extra, key);
}
function chatWatch(dt) {   // CAOS a tope sin gastar, nadie juega cartas, final igualado
  if (chatSt.lastDep == null) chatSt.lastDep = G.t;
  if (S.p.chaos >= CFG.chaosMax - 0.01) { chatSt.fullT = (chatSt.fullT || 0) + dt; if (chatSt.fullT > 6) { chatSt.fullT = 0; chatEv('full', null, null, 1, 25); } } else chatSt.fullT = 0;
  if (G.t - chatSt.lastDep > 18) chatEv('afk', null, null, 1, 30);
  if (!chatSt.closeSaid && G.mode !== 'boss' && G.time < 20 && S.p.crowns === S.e.crowns) { chatSt.closeSaid = true; chatEv('close', null, null, 1, 0); }
}
/* ---------- sátira: imagen para compartir ---------- */
function shareHeadline() {
  const R = G.rewards || {}, w = G.winner;
  let key = G.mode === 'boss' ? 'boss' : R.unlock ? 'unlock' : w === 'p' ? 'win' : 'lose';
  const HL = key !== 'boss' && ownerOf() === 'phony' ? HEADLINES_PH : key !== 'boss' && ownerOf() === 'iahorro' ? HEADLINES_IA : HEADLINES;
  return pick(HL[key]).replace('{c}', S.p.crowns).replace('{L}', CFG.cards[FACTIONS[G.faction].leader].name).replace('{F}', FACTIONS[G.faction].name).replace('{U}', R.unlock ? capFirst(losOf(R.unlock)) : '').replace('{S}', fmt(R.score || 0)).replace('{B}', G.bossName || 'El jefe');
}
function wrapLines(c, str, maxW) {
  const words = str.split(' '), out = []; let cur = '';
  for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = wd; } else cur = t; }
  if (cur) out.push(cur); return out;
}
function makeShareImage() {
  const Wd = 720, Hd = 900, cv2 = document.createElement('canvas'); cv2.width = Wd; cv2.height = Hd;
  const c = cv2.getContext('2d'), w = G.winner, R = G.rewards || {};
  const g = c.createLinearGradient(0, 0, 0, Hd); g.addColorStop(0, '#3b1d63'); g.addColorStop(1, '#140a20'); c.fillStyle = g; c.fillRect(0, 0, Wd, Hd);
  c.globalAlpha = 0.07; c.fillStyle = '#ffffff'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc((i * 137) % Wd, (i * 251) % Hd, 18 + (i % 5) * 9, 0, Math.PI * 2); c.fill(); } c.globalAlpha = 1;
  const T = (str, x, y, size, col, font = FONT_D, align = 'center') => { c.font = `${size}px ${font}`; c.textAlign = align; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = Math.max(4, size * 0.22); c.strokeStyle = OL; c.strokeText(str, x, y); c.fillStyle = col; c.fillText(str, x, y); };
  T('FANS OF', Wd / 2, 58, 34, '#ffffff'); T('RUMBLE', Wd / 2, 108, 70, '#ff8a1f');
  // periódico
  c.save(); c.translate(Wd / 2, 300); c.rotate(-0.025);
  c.fillStyle = '#f5efe1'; c.strokeStyle = OL; c.lineWidth = 6; c.beginPath(); if (c.roundRect) c.roundRect(-300, -130, 600, 260, 14); else c.rect(-300, -130, 600, 260); c.fill(); c.stroke();
  c.fillStyle = '#20102c'; c.font = `26px ${FONT_D}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EL DIARIO DEL GAMER · ÚLTIMA HORA', 0, -100);
  c.fillRect(-270, -80, 540, 3);
  c.font = `bold 30px "Trebuchet MS", system-ui, sans-serif`; const lines = wrapLines(c, shareHeadline(), 520).slice(0, 4);
  lines.forEach((ln, i) => c.fillText(ln, 0, -40 + i * 38 - (lines.length - 3) * 14));
  c.restore();
  // líder
  const lk = FACTIONS[G.faction].leader, sp = SPR[lk];
  if (sp) { const hh = 290, ww = sp.wd * hh / sp.ht; c.save(); c.globalAlpha = 0.35; c.fillStyle = '#000'; c.beginPath(); c.ellipse(175, 745, 95, 22, 0, 0, Math.PI * 2); c.fill(); c.restore(); c.drawImage(sp.c, 175 - ww / 2, 745 - hh * 0.97, ww, hh); }
  const title = G.mode === 'boss' ? (w === 'e' ? 'DERROTA' : !bases.e.alive ? 'JEFE DERROTADO' : G.bossWi === CEO_WI ? 'DAÑO AL CEO' : 'DAÑO AL JEFE') : w === 'p' ? '¡VICTORIA!' : w === 'e' ? 'DERROTA' : 'EMPATE';
  T(title, Wd / 2 + 120, 520, title.length > 10 ? 52 : 62, w === 'e' ? '#ff6b7a' : '#ffe14d');
  const sub = G.mode === 'boss' ? fmt(R.score || 0) + ' de daño' : G.mode === 'camp' && w === 'p' ? '★'.repeat(R.stars || 0) + ' · ' + G.level.name : `${S.p.crowns} - ${S.e.crowns} coronas`;
  T(sub, Wd / 2 + 120, 590, 32, '#ffffff');
  T(`${FACTIONS[G.faction].name} contra ${enemyLabel(G.efac)}`, Wd / 2 + 120, 640, 22, '#cdb9ea', `"Trebuchet MS", system-ui, sans-serif`);
  T(`${S.p.kills} enemigos despedidos · ${S.p.deployed} cartas`, Wd / 2 + 120, 680, 22, '#cdb9ea', `"Trebuchet MS", system-ui, sans-serif`);
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, Hd - 120, Wd, 120);
  T('¿Te atreves con Microblizz?', Wd / 2, Hd - 84, 30, '#ffffff');
  T(GAME_URL, Wd / 2, Hd - 46, 22, '#9ef07a', `"Trebuchet MS", system-ui, sans-serif`);
  c.font = `14px system-ui, sans-serif`; c.fillStyle = 'rgba(255,255,255,.55)'; c.textAlign = 'center'; c.fillText('Juego de humor. Microblizz no existe (por suerte).', Wd / 2, Hd - 16);
  return cv2;
}
async function shareResult() {
  play('select');
  const cv2 = makeShareImage(), url = cv2.toDataURL('image/png'), text = `${shareHeadline()} · Juega a Fans of Rumble: https://${GAME_URL}/`;
  try {
    const blob = await new Promise(r => cv2.toBlob(r, 'image/png'));
    const file = new File([blob], 'fans-of-rumble.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text, title: 'Fans of Rumble' }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  let framed = true; try { framed = window.self !== window.top; } catch (e) { /* iframe de otro dominio */ }
  $('#share-img').src = url; $('#share-dl').href = url; $('#share-dl').hidden = framed;   // dentro de un marco la descarga no funciona: se guarda la imagen a mano
  $('#scr-share').hidden = false;
}
/* ---------- campaña ---------- */
const lvlStars = id => SAVE.camp[id] || 0;
const worldOpen = wi => worldOpenD(wi, 'n');
const levelOpen = l => SAVE.testAll || (worldOpen(l.wi) && (l.li === 0 || lvlStars(`${l.wi + 1}-${l.li}`) > 0));
const findLevel = id => { const [w, l] = id.split('-').map(Number); return WORLDS[w - 1].levels[l - 1]; };
function nextLevel(L) { const Wd = WORLDS[L.wi]; if (L.li < Wd.levels.length - 1) return Wd.levels[L.li + 1]; return WORLDS[L.wi + 1] ? WORLDS[L.wi + 1].levels[0] : null; }
const enemyLabel = f => (isCorp(f) ? CORP[f] : FACTIONS[f].corr || FACTIONS[f].name + ' corrompidos');
function buildCamp() {
  const d = campDiff, list = $('#world-list'); let cur = 0;
  for (const b of document.querySelectorAll('[data-cd]')) { b.setAttribute('aria-pressed', String(b.dataset.cd === d)); b.classList.toggle('dim', b.dataset.cd !== 'n' && !WORLDS.some((w, wi) => worldOpenD(wi, b.dataset.cd))); }
  $('#camp-sub').textContent = CAMP_SUB[d];
  $('#camp-mod').innerHTML = d === 'm' ? modBoxHtml() : '';
  const rb = $('#btn-rl-again'); if (rb) rb.onclick = () => { play('select'); openRoulette(); };
  list.innerHTML = WORLDS.map((w, wi) => {
    const open = worldOpenD(wi, d), stars = w.levels.reduce((a, l) => a + starsD(l.id, d), 0); if (open) cur = wi;
    const nodes = w.levels.map(l => { const st = starsD(l.id, d), ok = levelOpenD(l, d); return `<button class="node${d !== 'n' ? ' cd-' + d : ''}${l.boss ? ' boss' : ''}${ok && !st ? ' next' : ''}" data-lv="${l.id}" ${ok ? '' : 'disabled'}><b class="ol">${l.boss ? 'JEFE' : wi + 1 + '-' + (l.li + 1)}</b><small>${l.name}</small><span class="st">${'★'.repeat(st)}<i>${'★'.repeat(3 - st)}</i></span></button>`; }).join('');
    const lv = d === 'n' ? '' : `Nivel ${CDIFF[d].lvl(w.levels[0])}${CDIFF[d].lvl(w.levels[0]) !== CDIFF[d].lvl(w.levels[3]) ? '-' + CDIFF[d].lvl(w.levels[3]) : ''} · `;
    const nextTxt = wi === CEO_WI ? 'Premio: abre el sótano y la Campaña 2' : wi === 11 ? 'Premio: abre la Campaña 3' : wi === WORLDS.length - 1 ? 'El final de la partida' : 'Premio: abre el mundo ' + (wi + 2);
    const reward = d === 'h' ? lv + 'premios dobles' : d === 'm' ? lv + (SAVE.mythPrize[wi] ? 'legendario conseguido' : 'su jefe da un legendario') : w.unlock ? `Premio: se unen ${losOf(w.unlock)}` : nextTxt;
    const lockTxt = d === 'h' ? 'Pásate este mundo en Normal para jugarlo en Difícil.' : d === 'm' ? 'Pásate este mundo en Difícil para jugarlo en Mítica.' : w.openAfter ? (w.camp === 3 ? 'Bloqueado: gana al Presidente de Phony (mundo 12) para empezar la Campaña 3.' : 'Bloqueado: gana al CEO de Microblizz (mundo 7) para empezar la Campaña 2.') : 'Bloqueado: gana al jefe del mundo anterior.';
    const port = w.efac === 'microblizz' ? (wi ? 'parchebot' : 'becario') : w.efac === 'phony' ? (wi === 11 ? 'remasterbot' : 'descargabot') : w.efac === 'iahorro' ? (wi === IA_FINAL ? 'iahorro' : 'copiapega') : FACTIONS[w.efac].leader;
    const head = wi === 0 ? '<div class="camp-head ol">CAMPAÑA 1 · LA REBELIÓN DE LOS FANS<small>contra Microblizz</small></div>' : w.camp === 2 && WORLDS[wi - 1].camp !== 2 ? '<div class="camp-head c2 ol">CAMPAÑA 2 · LA ERA DIGITAL<small>contra Phony y su PayStation</small></div>' : w.camp === 3 && WORLDS[wi - 1].camp !== 3 ? '<div class="camp-head c3 ol">CAMPAÑA 3 · FIN DE LA PARTIDA<small>contra IAhorro, la IA del ahorro… de sueldos</small></div>' : '';
    return head + `<div class="world${open ? '' : ' locked'}${d === 'm' && open ? ' cd-m' : ''}" data-wi="${wi}" style="--wc:${d === 'h' ? '#8a2b3a' : d === 'm' ? '#5b2a8f' : w.efac === 'microblizz' ? '#1d3f8a' : w.efac === 'phony' ? '#8a6a12' : w.efac === 'iahorro' ? '#0e5a6e' : FAC_COLOR[w.efac] + '77'}"><div class="world-head"><canvas data-k="${port}"></canvas><div class="world-name ol">${wi + 1}. ${w.name}<small>${enemyLabel(w.efac)} · ${reward}</small></div><div class="world-stars ol">★ ${stars}/12</div></div><p class="world-story">${open ? w.story : lockTxt}</p><div class="nodes">${nodes}</div></div>`;
  }).join('');
  for (const cv of list.querySelectorAll('canvas[data-k]')) drawArt(cv, cv.dataset.k, 52, 46);
  list.querySelectorAll('[data-lv]').forEach(b => { b.onclick = () => { play('select'); openPrep('camp', findLevel(b.dataset.lv)); }; });
  const el = list.querySelector(`[data-wi="${cur}"]`); if (el) list.scrollTop = Math.max(0, el.offsetTop - list.offsetTop - 8);
}
function openCamp() { updateWallets(); show('scr-camp'); buildCamp(); }
/* ---------- antes de jugar: elegir facción ---------- */
function openPrep(mode, lvl) {
  G.prep = { mode, lvl: lvl || null, cd: mode === 'camp' ? campDiff : 'n' };
  const info = $('#prep-info');
  if (mode === 'camp') {
    const cd = campDiff, C = CDIFF[cd], pay = C.pay || 1, Wd = WORLDS[lvl.wi], st = starsD(lvl.id, cd), fr = lvl.boss ? ECON.camp.boss : ECON.camp.first;
    $('#prep-title').textContent = lvl.boss ? `JEFE DEL MUNDO ${lvl.wi + 1}` : `NIVEL ${lvl.wi + 1}-${lvl.li + 1}`;
    let extra = '';
    if (cd !== 'n') {
      const who = Wd.efac === 'microblizz' ? 'Sus FallenHero y Parche Día 1 llevan' : Wd.efac === 'phony' ? 'Sus Servidor Caído y Remaster 70 € llevan' : Wd.efac === 'iahorro' ? 'Sus Granja de Servidores y Clonador 3000 llevan' : `${CFG.cards[FACTIONS[Wd.efac].leader].name} lleva`;
      extra += `<div class="gear-list"><span class="gear-who">${who}:</span>${ENEMY_GEAR[cd][lvl.wi].map(id => gearRow(id, C.q)).join('')}</div>`;
      if (cd === 'm') { const M = mythicWeek(); extra += `<div class="mod-row bad"><b>TU CASTIGO</b>${M.deb.name}: ${M.deb.desc}</div><div class="mod-row good"><b>VENTAJA DE LA CPU</b>${M.buf.name}: ${M.buf.desc}</div>`; }
    }
    const ffi = lvl.boss && cd !== 'n' && worldFac(lvl.wi) && !(SAVE.facItem || {})[worldFac(lvl.wi)] ? ` · Y su objeto de facción: ${ITEMS[FAC_ITEM[worldFac(lvl.wi)]].name}` : '';
    const prize = (cd === 'm' && lvl.boss && !SAVE.mythPrize[lvl.wi] ? ' · Al ganar por primera vez: ¡un objeto o habilidad legendario!' : '') + ffi;
    info.innerHTML = `${cd !== 'n' ? `<span class="cd-badge ${cd} ol">${C.name.toUpperCase()}</span>` : ''}<b class="ol">${lvl.name}</b><br>Mundo ${lvl.wi + 1}: ${Wd.name}. Rival: ${enemyLabel(Wd.efac)}, nivel ${cd === 'n' ? lvl.elvl : C.lvl(lvl)}${lvl.boss ? ', con jefe y sus habilidades' : ''}.${extra}<br><span class="stars">${'★'.repeat(st)}<span style="color:#4a3866">${'★'.repeat(3 - st)}</span></span> Estrellas: ganar · sin perder ninguna torre · tirando su base.<br><span class="rw">${st ? `Recompensa: ${ECON.camp.replay * pay} de oro` : `Primera vez: ${fr[0] * pay} de oro y ${fr[1] * pay} gemas`}${st < 3 ? ` · 3 estrellas: +${ECON.camp.stars3[0] * pay} de oro y ${ECON.camp.stars3[1] * pay} gemas` : ''}${prize}</span>`;
  } else if (mode === 'sandbox') {   // v0.9.20
    $('#prep-title').textContent = 'SALA DE PRUEBAS';
    info.innerHTML = 'Aquí no se gana ni se pierde nada: <b>CAOS infinito</b>, el tiempo no corre y tú decides qué enemigos salen y en qué campo. Prueba tu mazo, tus hechizos y tu equipo.<br><span class="rw">Sin premios ni experiencia.</span>';
  } else if (mode === 'arena') {   // v0.9.20
    $('#prep-title').textContent = 'ARENA'; buildArenaPrep();
  } else if (mode === 'boss') {
    $('#prep-title').textContent = 'MODO JEFE';
    buildBossPrep();   // v0.9.15
  } else {
    $('#prep-title').textContent = 'PARTIDA RÁPIDA';
    info.innerHTML = `Contra Microblizz. Tus cartas juegan con su nivel y Microblizz se pone a tu nivel medio.<br><span class="rw">Recompensa: ${ECON.quick.easy} de oro en Becario o ${ECON.quick.normal} en Ejecutivo si ganas (${ECON.quick.lose} si pierdes), y experiencia para tus cartas.</span>`;
  }
  $('#diff-label').hidden = $('#diff-row').hidden = mode !== 'quick';
  $('#boss-pick').hidden = $('#bdiff-row').hidden = mode !== 'boss';
  if (!isUnlocked(G.faction)) setFaction(SAVE.unlocked[0]);
  syncMenu(); updateWallets(); show('scr-prep'); fitText($('#prep-title'), 52, 26);
  for (const nb of document.querySelectorAll('#fac-grid .fac-opt b')) fitText(nb, 16, 10);   // v0.9.13: «Comunidad Gamer» también cabe
}
function setupMatch(mode, lvl, cd) {
  G.mode = mode; G.level = lvl || null; G.cdiff = mode === 'camp' ? cd || 'n' : 'n'; resetMods();
  if (mode === 'camp') {
    const Wd = WORLDS[lvl.wi]; G.efac = Wd.efac; G.elvl = lvl.elvl; G.bossOn = !!lvl.boss; G.bossName = lvl.boss || 'SurvivalBot';
    G.diffCfg = Object.assign({}, CFG.diff.normal, { aiIncome: lvl.income, think: [0.6, 1.2], bossCd: 18, stun: 2, despido: 20 + lvl.elvl * 2 });
    G.ebaseName = lvl.boss ? lvl.boss.toUpperCase() : Wd.efac === 'microblizz' ? 'SEDE DE MICROBLIZZ' : Wd.efac === 'phony' ? 'SEDE DE PHONY' : Wd.efac === 'iahorro' ? 'IAHORRO' : FACTIONS[Wd.efac].base;
  } else if (mode === 'boss') {   // v0.9.15: el jefe y la dificultad que elegiste
    const sel = SAVE.bossSel || { wi: CEO_WI, d: 'n' }, wi = bossOpen(sel.wi) ? sel.wi : CEO_WI, d = BDIFF[sel.d] ? sel.d : 'n', B = bossOf(wi), BD = BDIFF[d];
    G.bossWi = wi; G.bossDiff = d;
    G.efac = B.efac; G.elvl = Math.min(12, avgLevel(G.faction) + BD.lvl); G.bossOn = true; G.bossName = B.name; G.ebaseName = wi === CEO_WI ? 'EL CEO' : B.name.toUpperCase();
    G.diffCfg = Object.assign({}, CFG.diff.normal, { aiIncome: B.inc * BD.inc, think: BD.think.slice(), bossCd: BD.cd, stun: BD.stun, despido: 20 + G.elvl * 2 });
  } else if (mode === 'sandbox') {   // v0.9.20: sala de pruebas
    G.efac = SB.fac; G.elvl = avgLevel(G.faction); G.bossOn = false; G.bossName = ''; G.ebaseName = 'MUÑECO DE PRUEBAS'; G.diffCfg = Object.assign({}, CFG.diff.normal);
  } else if (mode === 'arena') {   // v0.9.20: arena contra «jugadores» inventados
    arenaSetup();
  } else {
    G.efac = 'microblizz'; G.elvl = avgLevel(G.faction); G.bossOn = true; G.bossName = 'SurvivalBot'; G.ebaseName = 'SURVIVALBOT'; G.diffCfg = CFG.diff[G.diff];
  }
  const deck = mode === 'arena' ? G.arenaDeck : mode === 'sandbox' ? null : mode === 'boss' ? WORLDS[G.bossWi].levels[3].deck || null : G.level && G.level.deck ? G.level.deck : G.efac === 'microblizz' && mode === 'quick' ? ['becario', 'starbot', 'fallen'] : null;
  G.classicAI = G.efac === 'microblizz' && !!deck && deck.every(k => ['becario', 'starbot', 'fallen'].includes(k));
  G.edeck = deck;
  G.eextra = mode === 'arena' ? (G.arenaSpells || []) : mode === 'sandbox' ? [] : enemyExtras(mode, lvl);   // v0.9.15: hechizos y mata-sanadores de la CPU
  if (mode === 'boss' && BDIFF[G.bossDiff].gear) { const BD = BDIFF[G.bossDiff]; G.egear = ENEMY_GEAR[BD.gear][G.bossWi]; G.egearQ = BD.q; if (isCorp(G.efac)) G.egearOn = G.efac === 'phony' ? PH_GEAR_ON : G.efac === 'iahorro' ? IA_GEAR_ON : MB_GEAR_ON; }
  if (G.cdiff !== 'n') setupHardMode(lvl);
  G.terrain = mode === 'sandbox' ? SB.terrain : terrainFor(mode, lvl);   // v0.9.18: campo especial de algunos jefes
}
// v0.9.15: la CPU también lanza hechizos (y en Difícil y Mítica saca a su mata-sanadores)
function enemyExtras(mode, lvl) {
  const F = FACTIONS[G.efac], g = F.gacha || [], dmg = g.find(k => CFG.cards[k].spell && CFG.cards[k].spell.kind === 'dmg'), crazy = g.find(k => CFG.cards[k].rarity === 'legendary'), killer = g.find(k => CFG.units[k]);
  const own = F.spells ? F.spells.slice() : dmg ? [dmg] : [];
  if (mode === 'quick') return G.diff === 'normal' ? own : [];
  if (mode === 'boss') return own.concat(G.bossDiff === 'm' ? [killer, crazy] : G.bossDiff === 'h' ? [killer] : []).filter(Boolean);
  if (!lvl || lvl.elvl < 3) return [];   // el primer mundo, sin hechizos
  const cd = G.cdiff || 'n';
  return own.concat(cd === 'm' ? [killer, crazy] : cd === 'h' ? [killer] : []).filter(Boolean);
}
function startGame() {
  const P = G.prep || { mode: 'quick' };
  if (!isUnlocked(G.faction)) { toast('Esa facción todavía está bloqueada'); play('deny'); return; }
  setupMatch(P.mode, P.lvl, P.cd); startMatch();
}
/* ---------- recompensas al terminar ---------- */
function grantRewards() {
  if (G.mode === 'sandbox') return { gold: 0, gems: 0, xp: [], stars: 0, unlock: null, record: false, ready: [], passXp: 0 };   // v0.9.20: la sala de pruebas no da nada
  const R = { gold: 0, gems: 0, xp: [], stars: 0, unlock: null, record: false, ready: [] }, win = G.winner === 'p', w = G.winner;
  for (const [k, n] of Object.entries(S.p.plays)) {
    const us = uSave(k); if (us.lvl >= ECON.maxLvl) continue;
    const x = Math.round(n * ECON.xpPerPlay * (win ? ECON.winXpMult : 1)); us.xp += x; R.xp.push([k, x]); if (canLevel(k)) R.ready.push(k);
  }
  if (G.mode === 'quick') R.gold = win ? ECON.quick[G.diff] : ECON.quick.lose;
  else if (G.mode === 'arena') arenaReward(R, w);   // v0.9.20
  else if (G.mode === 'camp') {
    const L = G.level, cd = G.cdiff || 'n', pay = CDIFF[cd].pay || 1, prev = starsD(L.id, cd);
    if (win) {
      R.stars = 1 + (S.e.crowns === 0 ? 1 : 0) + (G.endReason === 'base' ? 1 : 0);
      if (!prev) { const fr = L.boss ? ECON.camp.boss : ECON.camp.first; R.gold += fr[0] * pay; R.gems += fr[1] * pay; } else R.gold += ECON.camp.replay * pay;
      if (R.stars === 3 && prev < 3) { R.gold += ECON.camp.stars3[0] * pay; R.gems += ECON.camp.stars3[1] * pay; }
      campOf(cd)[L.id] = Math.max(prev, R.stars);
      const Wd = WORLDS[L.wi];
      if (L.boss && Wd.unlock && !isUnlocked(Wd.unlock)) {   // la facción liberada llega con algo de nivel para no empezar de cero
        SAVE.unlocked.push(Wd.unlock); R.unlock = Wd.unlock; stat('unlock', 1);
        const UF = FACTIONS[Wd.unlock]; for (const k of [UF.leader, ...UF.units]) { const us = uSave(k); us.lvl = Math.max(us.lvl, L.elvl - 1); }
      }
      missionEvent('star', R.stars);
      if (L.boss && L.wi === CEO_WI) stat('ceo', 1);
      if (L.boss && WORLDS[L.wi].unlock === 'olvidados') stat('olvido', 1);
      if (L.boss && L.wi === 11) stat('phonyboss', 1);
      if (L.boss && L.wi === IA_FINAL) stat('iaboss', 1);   // v0.9.23
      if (L.boss && cd !== 'n') stat(cd === 'h' ? 'hardboss' : 'mythboss', 1);
      if (L.boss && cd === 'm' && !SAVE.mythPrize[L.wi]) { SAVE.mythPrize[L.wi] = 1; R.prize = legendaryPrize(); }
      const ff = worldFac(L.wi); if (L.boss && cd !== 'n' && ff && !(SAVE.facItem || {})[ff]) { SAVE.facItem = SAVE.facItem || {}; SAVE.facItem[ff] = 1; R.facItem = newCopy('eq', FAC_ITEM[ff], 2); }
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
  SAVE.gold += R.gold; SAVE.gems += R.gems; saveGame(); return R;
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
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
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
      const k = slotKey(el._slot);
      if (el._key !== k) { renderCard(el, k); if (el._key && G.state === 'play') { el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); } el._key = k; el._poor = undefined; el._h = undefined; }
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

/* ---------- screens ---------- */
// v0.9.13: el campo cambia según tu facción y la empresa rival (se pinta de nuevo solo si hace falta)
let BG_KEY = '';
function ensureBG(plaza) { const key = G.faction + '|' + plaza; if (BG_KEY !== key) { BG = buildBG(G.faction, plaza); BG_KEY = key; } }
function startMatch() {
  ensureBG({ phony: 'ph', iahorro: 'ia' }[ownerOf()] || 'mb');
  audioInit(); hideScreens(); resetMatch(); chatClear(); G.state = 'countdown'; camReset(); terrainStart();
  G.tutMatch = !G.autoplay && !SAVE.tut.done && SAVE.tut.step === 0; tutBattleStart(); applySpeed(); applyMatchMods(); hudMods();
  const F = FACTIONS[G.faction];
  banner('PASIVA: ' + F.passive, F.banner, F.kind);
  const L = G.level;
  const intro = G.mode === 'boss' ? [G.bossName, BOSS_QUOTE[G.bossWi] || (G.bossWi === CEO_WI ? '«Os he comprado. Ahora os cierro.»' : isCorp(G.efac) ? '«Hemos comprado vuestro juego… y lo vamos a cerrar.»' : '«Microblizz me ha ascendido. Ahora despido yo.»')]
    : L && L.boss ? [L.boss, BOSS_QUOTE[L.wi] || (G.efac === 'microblizz' ? (L.wi ? '«Os he comprado. Ahora os cierro.»' : '«Hemos comprado vuestro juego… y lo vamos a cerrar.»') : '«Microblizz me ha ascendido. Ahora despido yo.»')]
    : L ? [L.name, isCorp(G.efac) ? `Mundo ${L.wi + 1}: ${WORLDS[L.wi].name}` : `${enemyLabel(G.efac)} por ${ownerName()}`]
    : ['SurvivalBot', '«Hemos comprado vuestro juego… y lo vamos a cerrar.»'];
  setTimeout(() => { if (G.state === 'countdown' || G.state === 'play') { banner(intro[0], intro[1], 'enemy'); if (G.cdiff !== 'n') hardBanner(); else if (G.mode === 'boss' && G.bossDiff !== 'n') banner(BDIFF[G.bossDiff].name.toUpperCase(), `Rival de nivel ${G.elvl}, tropas de élite${G.egear ? ' y equipo' : ''}. Su sede: ${fmt(bases.e.maxHp)} de vida`, 'enemy'); } }, 2400);
  const seq = ['3', '2', '1', '¡CAOS!']; let i = 0; const el = $('#count');
  const tick = () => {
    if (G.state !== 'countdown') return;
    el.textContent = seq[i]; el.className = 'ol-big' + (i === 3 ? ' go' : ''); void el.offsetWidth; el.classList.add('pop');
    play(i < 3 ? 'tick' : 'go'); i++;
    if (i < seq.length) setTimeout(tick, 800); else setTimeout(() => { if (G.state === 'countdown') { G.state = 'play'; if (G.tutMatch) showTut(true); else if (!(SAVE.stats.card > 0)) showTut(); chatBurst('start', 2); if (G.cdiff !== 'n') setTimeout(() => { if (G.state === 'play') chatSay(G.cdiff === 'h' ? 'hard' : 'mythic'); }, 2600); } }, 500);
  };
  setTimeout(tick, 900);
}
function pauseGame() { if (G.state !== 'play') return; G.state = 'paused'; input.card = null; input.dragging = false; show('scr-pause'); }
function resumeGame() { if (G.state !== 'paused') return; hideScreens(); G.state = 'play'; }
function goHome() { if (G.terrain) { G.terrain = null; terrainStart(); }   // v0.9.19: el menú vuelve al campo de siempre
  ensureBG('mb'); setTagline(); $('#hud-mods').hidden = true; G.state = 'title'; chatClear(); resetMatch(); hud.update(); drawTitleArt(); updateWallets(); show('scr-title'); profileChip(); idleSc.tick = 0; achDay(); titlePopups(); }
function toMenu() { chatClear(); if (G.mode === 'camp') { G.state = 'title'; resetMatch(); hud.update(); openCamp(); } else goHome(); }
// v0.9.13: lo que dice cada jefe nuevo al empezar
const BOSS_QUOTE = { 7: '«Microblizz me encerró aquí abajo. Ahora no sale nadie.»', 8: '«¿Discos? Eso es del siglo pasado. Ahora pagas cada mes.»', 9: '«Phony me paga por ganar. Tú pagas por jugar.»', 10: '«Phony quiere otra secuela. Y la vas a protagonizar tú.»', 11: '«Todo lo que compraste es mío. Lo borro cuando quiera.»' };
function showEnd() {
  chatClear(); bannerClear();   // v0.9.11: sin carteles de la partida encima de la pantalla final
  const w = G.winner, R = G.rewards = grantRewards(), t = $('#end-title');
  if (G.mode === 'boss') { t.textContent = w === 'e' ? 'DERROTA' : bases.e.alive ? '¡FIN DEL TURNO!' : G.bossWi === CEO_WI ? '¡CEO DESPEDIDO!' : '¡JEFE DERROTADO!'; t.className = 'end-title ol-big ' + (w === 'e' ? 'lose' : 'win'); }
  else { t.textContent = w === 'p' ? '¡VICTORIA!' : w === 'e' ? 'DERROTA' : 'EMPATE'; t.className = 'end-title ol-big ' + (w === 'p' ? 'win' : w === 'e' ? 'lose' : ''); }
  $('#end-crowns').innerHTML = G.mode === 'camp' && w === 'p' ? [0, 1, 2].map(i => `<span class="${i < R.stars ? 'on' : 'off'}">${STAR_SVG}</span>`).join('') : G.mode === 'boss' ? '' : [0, 1, 2].map(i => `<span class="${i < S.p.crowns ? 'on' : 'off'}">${CROWN_SVG}</span>`).join('');
  let sub;
  if (G.mode === 'boss') sub = `${G.bossName}${G.bossDiff !== 'n' ? ' (' + BDIFF[G.bossDiff].name + ')' : ''}: ${fmt(R.score)} de daño, el ${R.pct} % de su vida${R.record ? ' · ¡NUEVO RÉCORD!' : ' · Récord: ' + fmt(SAVE.bossRec[R.boss.key] || 0)}`;
  else if (G.mode === 'camp' && w === 'p') sub = `${G.level.name}${G.cdiff && G.cdiff !== 'n' ? ' (' + CDIFF[G.cdiff].name + ')' : ''}: ${R.stars === 3 ? '¡3 estrellas!' : R.stars + (R.stars === 1 ? ' estrella' : ' estrellas') + (S.e.crowns ? ' (perdiste una torre)' : ' (te faltó tirar su base)')}`;
  else sub = { base: w === 'p' ? `Has tirado ${isCorp(G.efac) ? FACTIONS[G.efac].end : 'su base'}.` : `Han tirado ${FACTIONS[G.faction].end}.`, crowns: `Tiempo: ${S.p.crowns} coronas contra ${S.e.crowns}.`, hp: 'Empate a coronas: gana quien conserva más vida en sus torres.', draw: 'Mismas coronas y misma vida.' }[G.endReason] || '';
  $('#end-sub').textContent = sub;
  let rw = '';
  if (R.unlock) rw += `<span class="rw-chip big ol">¡NUEVA FACCIÓN: ${FACTIONS[R.unlock].name.toUpperCase()}!</span>`;
  if (R.prize) rw += `<span class="rw-chip big ol">¡LEGENDARIO: ${defOf(R.prize).name.toUpperCase()}!</span>`;
  if (R.facItem) rw += `<span class="rw-chip big ol">¡OBJETO DE FACCIÓN: ${defOf(R.facItem).name.toUpperCase()}!</span>`;
  if (R.boss && R.boss.kill) rw += `<span class="rw-chip big ol">¡DERROTADO CON ${Math.round(Math.max(0, G.time))} S DE SOBRA! +${fmt(R.boss.bonus)} DE ORO${R.boss.first ? ' Y GEMAS' : ''}</span>`;
  if (R.boss && R.boss.tiers.length) rw += `<div class="rw-xp" style="color:#ffe06a">Premio por llegar al ${R.boss.tiers.map(i => Math.round(BOSS_TIERS[i] * 100) + ' %').join(', ')} de su vida.</div>`;
  if (R.gold) rw += `<span class="rw-chip ol">${COIN_SVG}+${fmt(R.gold)}</span>`;
  if (R.gems) rw += `<span class="rw-chip ol">${GEM_SVG}+${fmt(R.gems)}</span>`;
  if (R.xp.length) rw += `<div class="rw-xp">Experiencia: ${R.xp.map(([k, x]) => `${CFG.cards[k].name} +${x}`).join(' · ')}</div>`;
  if (R.ready.length) rw += `<div class="rw-xp" style="color:#9ef07a">¡Listas para subir de nivel en la Colección: ${R.ready.map(k => CFG.cards[k].name).join(', ')}!</div>`;
  if (R.arena) rw += `<span class="rw-chip big ol">${R.arena.d >= 0 ? '+' : ''}${R.arena.d} COPAS · ${fmt(R.arena.cups)} · LIGA ${R.arena.league.toUpperCase()}</span>`;   // v0.9.20
  $('#end-rewards').innerHTML = rw; adEndOffer(R);   // v0.9.16: premio x2 con anuncio
  $('#end-pass').innerHTML = passLevel() >= PASS.levels && !R.passUp ? 'Pase de batalla completado' : `Pase de batalla: +${R.passXp} puntos${R.passUp ? ` · <b style="color:#ffe14d">¡NIVEL ${passLevel()}!</b>` : ` · ${SAVE.pass.xp - passLevel() * PASS.xpPer}/${PASS.xpPer} para el nivel ${passLevel() + 1}`}`;
  $('#end-quote').textContent = R.unlock ? `${capFirst(losOf(R.unlock))} se libran de ${ownerName()} y se unen a la rebelión.` : pick((ownerOf() === 'phony' ? QUOTES_PH : ownerOf() === 'iahorro' ? QUOTES_IA : QUOTES)[w || 'd']);
  $('#st-cards').textContent = S.p.deployed; $('#st-kills').textContent = S.p.kills; $('#st-chaos').textContent = Math.round(S.p.spent);
  let nx = G.mode === 'camp' && w === 'p' ? nextLevel(G.level) : null; if (nx && !levelOpenD(nx, G.cdiff || 'n')) nx = null;
  $('#btn-next').hidden = !nx; $('#btn-next').textContent = nx && nx.wi !== G.level.wi ? 'MUNDO ' + (nx.wi + 1) : 'SIGUIENTE';
  $('#btn-again').textContent = G.mode === 'quick' ? 'REVANCHA' : 'REPETIR';
  $('#btn-again').className = nx ? 'btn-ghost ol' : 'btn-big ol';
  updateWallets(); show('scr-end');
}
