// Fans of Rumble · Menús (1/3): el chat falso, la imagen para compartir, la campaña y el antes de jugar
// La cartera, la colección, el inventario, el gashapón y la tienda son comunes: core/js/sistema/.
'use strict';
/* =========================================================
   CHAT, COMPARTIR, CAMPAÑA, PREMIOS Y MARCADOR
   ========================================================= */
const RANK = r => (r > 1 ? ' ' + '★'.repeat(r) : '');
function avgLevel(f) { const F = FACTIONS[f]; const ks = [F.leader, ...F.units]; return Math.max(1, Math.round(ks.reduce((a, k) => a + uSave(k).lvl, 0) / ks.length)); }
/* ---------- sátira: chat falso en directo ---------- */
const chatSt = { t: 6 };
// PvP: el chat es solo de este cliente (no se sincroniza). Los avisos de la simulación hablan siempre desde el equipo 'p'; el que juega desde el asiento de arriba
// los recibe al revés: lo del rival llega como «suyo». Aquí se le dan la vuelta (y se descartan los que solo tienen sentido para el equipo propio).
const CHAT_ESPEJO = { deploy: 'enemyBig', leader: 'enemyBig', enemyBig: 'deploy', baseLowP: 'baseLowE', baseLowE: 'baseLowP', leaderDown: 'eLeaderDown', eLeaderDown: 'leaderDown', win: 'lose', lose: 'win', towerP: 'towerP', towerE: 'towerE', comeback: 'comeback', idle: 'idle', start: 'start', full: 'full', close: 'close' };
function chatSay(kind, extra, key) {
  if (SAVE.chatOff) return;
  if (PVP.on && PVP.seat === 'e' && !VISTA_SW) { kind = CHAT_ESPEJO[kind]; if (!kind) return; }
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
  const mi = PVP.on ? PVP.seat : 'p';
  if (S[mi].chaos >= CFG.chaosMax - 0.01) { chatSt.fullT = (chatSt.fullT || 0) + dt; if (chatSt.fullT > 6) { chatSt.fullT = 0; chatEv('full', null, null, 1, 25); } } else chatSt.fullT = 0;
  if (mi === 'p' && G.t - chatSt.lastDep > 18) chatEv('afk', null, null, 1, 30);
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
  const T = (str, x, y, size, col, font = FONT_D, align = 'center') => { c.font = `${size}px ${font}`; c.textAlign = align; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = Math.max(4, size * 0.22); c.strokeStyle = OL; c.strokeText(tr(str), x, y); c.fillStyle = col; c.fillText(tr(str), x, y); };
  T('FANS OF', Wd / 2, 58, 34, '#ffffff'); T('RUMBLE', Wd / 2, 108, 70, '#ff8a1f');
  // periódico
  c.save(); c.translate(Wd / 2, 300); c.rotate(-0.025);
  c.fillStyle = '#f5efe1'; c.strokeStyle = OL; c.lineWidth = 6; c.beginPath(); if (c.roundRect) c.roundRect(-300, -130, 600, 260, 14); else c.rect(-300, -130, 600, 260); c.fill(); c.stroke();
  c.fillStyle = '#20102c'; c.font = `26px ${FONT_D}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(tr('EL DIARIO DEL GAMER · ÚLTIMA HORA'), 0, -100);
  c.fillRect(-270, -80, 540, 3);
  c.font = `bold 30px "Trebuchet MS", system-ui, sans-serif`; const lines = wrapLines(c, tr(shareHeadline()), 520).slice(0, 4);
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
  c.font = `14px system-ui, sans-serif`; c.fillStyle = 'rgba(255,255,255,.55)'; c.textAlign = 'center'; c.fillText(tr('Juego de humor. Microblizz no existe (por suerte).'), Wd / 2, Hd - 16);
  return cv2;
}
async function shareResult() {
  play('select');
  const cv2 = makeShareImage(), url = cv2.toDataURL('image/png'), text = `${tr(shareHeadline())} · ${tr('Juega a Fans of Rumble:')} https://${GAME_URL}/`;
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
  for (const b of document.querySelectorAll('[data-cd]')) { b.setAttribute('aria-pressed', String(b.dataset.cd === d)); b.classList.toggle('dim', b.dataset.cd !== 'n' && b.dataset.cd !== 'f' && !WORLDS.some((w, wi) => worldOpenD(wi, b.dataset.cd))); }
  $('#camp-sub').textContent = CAMP_SUB[d];
  $('#camp-mod').innerHTML = (d === 'm' ? mitBoxHtml() : '') + (cdRoll(d) ? modBoxHtml(d) : '');   // la Mítica semanal: 10d-mitica-semanal.js
  const rb = $('#btn-rl-again'); if (rb) rb.onclick = () => { play('select'); openRoulette(d); };
  list.innerHTML = WORLDS.map((w, wi) => {
    const open = worldOpenD(wi, d), stars = w.levels.reduce((a, l) => a + starsVer(l.id, d), 0); if (open) cur = wi;
    const nodes = w.levels.map(l => { const st = starsVer(l.id, d), ok = levelOpenD(l, d); return `<button class="node${d !== 'n' ? ' cd-' + d : ''}${l.boss ? ' boss' : ''}${ok && !st ? ' next' : ''}" data-lv="${l.id}" ${ok ? '' : 'disabled'}><b class="ol">${l.boss ? 'JEFE' : wi + 1 + '-' + (l.li + 1)}</b><small>${l.name}</small><span class="st">${'★'.repeat(st)}<i>${'★'.repeat(3 - st)}</i></span></button>`; }).join('');
    const lv = d === 'n' ? '' : `Nivel ${CDIFF[d].lvl(w.levels[0])}${CDIFF[d].lvl(w.levels[0]) !== CDIFF[d].lvl(w.levels[3]) ? '-' + CDIFF[d].lvl(w.levels[3]) : ''} · `;
    const nextTxt = wi === CEO_WI ? 'Premio: abre el sótano y la Campaña 2' : wi === 11 ? 'Premio: abre la Campaña 3' : wi === WORLDS.length - 1 ? 'El final de la partida' : 'Premio: abre el mundo ' + (wi + 2);
    const reward = d === 'f' ? lv + 'premios a la mitad' : d === 'h' ? lv + 'premios dobles' : d === 'x' ? lv + 'premios x2,5' : d === 'm' ? lv + (SAVE.mythPrize[wi] ? 'legendario conseguido' : 'su jefe da un legendario') : w.unlock ? `Premio: se unen ${losOf(w.unlock)}` : nextTxt;
    const lockTxt = d === 'h' ? 'Pásate este mundo en Normal para jugarlo en Difícil.' : d === 'x' ? 'Pásate este mundo en Difícil para jugarlo en Heroica.' : d === 'm' ? 'Pásate este mundo en Heroica para jugarlo en Mítica.' : d === 'f' ? 'Bloqueado: gana al jefe del mundo anterior en Fácil (o ábrelo en Normal).' : w.openAfter ? (w.camp === 3 ? 'Bloqueado: gana al Presidente de Phony (mundo 12) para empezar la Campaña 3.' : 'Bloqueado: gana al CEO de Microblizz (mundo 7) para empezar la Campaña 2.') : 'Bloqueado: gana al jefe del mundo anterior.';
    const port = w.efac === 'microblizz' ? (wi ? 'parchebot' : 'becario') : w.efac === 'phony' ? (wi === 11 ? 'remasterbot' : 'descargabot') : w.efac === 'iahorro' ? (wi === IA_FINAL ? 'iahorro' : 'copiapega') : FACTIONS[w.efac].leader;
    const head = wi === 0 ? '<div class="camp-head ol">CAMPAÑA 1 · LA REBELIÓN DE LOS FANS<small>contra Microblizz</small></div>' : w.camp === 2 && WORLDS[wi - 1].camp !== 2 ? '<div class="camp-head c2 ol">CAMPAÑA 2 · LA ERA DIGITAL<small>contra Phony y su PayStation</small></div>' : w.camp === 3 && WORLDS[wi - 1].camp !== 3 ? '<div class="camp-head c3 ol">CAMPAÑA 3 · FIN DE LA PARTIDA<small>contra IAhorro, la IA del ahorro… de sueldos</small></div>' : '';
    return head + `<div class="world${open ? '' : ' locked'}${(d === 'm' || d === 'x') && open ? ' cd-' + d : ''}" data-wi="${wi}" style="--wc:${d === 'f' ? '#1f6e46' : d === 'h' ? '#8a2b3a' : d === 'x' ? '#8a4516' : d === 'm' ? '#5b2a8f' : w.efac === 'microblizz' ? '#1d3f8a' : w.efac === 'phony' ? '#8a6a12' : w.efac === 'iahorro' ? '#0e5a6e' : FAC_COLOR[w.efac] + '77'}"><div class="world-head"><canvas data-k="${port}"></canvas><div class="world-name ol">${wi + 1}. ${w.name}<small>${enemyLabel(w.efac)} · ${reward}</small></div><div class="world-stars ol">★ ${stars}/12</div></div><p class="world-story">${open ? w.story : lockTxt}</p>${w.unlock && !isUnlocked(w.unlock) ? unlockChip(w.unlock, d) : ''}<div class="nodes">${nodes}</div></div>`;
  }).join('');
  for (const cv of list.querySelectorAll('canvas[data-k]')) drawArt(cv, cv.dataset.k, 52, 46);
  for (const cv of list.querySelectorAll('canvas[data-kc]')) drawArt(cv, cv.dataset.kc, 34, 30);   // v0.9.71: el líder de la facción que se libera
  list.querySelectorAll('[data-lv]').forEach(b => { b.onclick = () => { play('select'); openPrep('camp', findLevel(b.dataset.lv)); }; });
  const el = list.querySelector(`[data-wi="${cur}"]`); if (el) list.scrollTop = Math.max(0, el.offsetTop - list.offsetTop - 8);
}
function openCamp() { updateWallets(); show('scr-camp'); buildCamp(); }
/* ---------- antes de jugar: elegir facción ---------- */
function openPrep(mode, lvl) {
  G.prep = { mode, lvl: lvl || null, cd: mode === 'camp' ? campDiff : 'n' };
  const info = $('#prep-info');
  if (mode === 'camp') {
    const cd = campDiff, C = CDIFF[cd], pay = C.pay || 1, Wd = WORLDS[lvl.wi], st = starsD(lvl.id, cd), sv = starsVer(lvl.id, cd), fr = lvl.boss ? ECON.camp.boss : ECON.camp.first;
    $('#prep-title').textContent = lvl.boss ? `JEFE DEL MUNDO ${lvl.wi + 1}` : `NIVEL ${lvl.wi + 1}-${lvl.li + 1}`;
    let extra = '';
    if (cdHard(cd)) {
      const who = Wd.efac === 'microblizz' ? 'Sus FallenHero y Parche Día 1 llevan' : Wd.efac === 'phony' ? 'Sus Servidor Caído y Remaster 70 € llevan' : Wd.efac === 'iahorro' ? 'Sus Granja de Servidores y Clonador 3000 llevan' : `${CFG.cards[FACTIONS[Wd.efac].leader].name} lleva`;
      extra += `<div class="gear-list"><span class="gear-who">${who}:</span>${ENEMY_GEAR[cd][lvl.wi].map(id => gearRow(id, C.q)).join('')}</div>`;
      if (cdRoll(cd)) extra += modRows(weekMods(cd));
    }
    const ffi = lvl.boss && cdHard(cd) && worldFac(lvl.wi) && !(SAVE.facItem || {})[worldFac(lvl.wi)] ? ` · Y su objeto de facción: ${ITEMS[FAC_ITEM[worldFac(lvl.wi)]].name}` : '';
    const prize = (cd === 'm' && lvl.boss && !SAVE.mythPrize[lvl.wi] ? ' · Al ganar por primera vez: ¡un objeto o habilidad legendario!' : '') + ffi;
    const ubox = lvl.boss && Wd.unlock && !isUnlocked(Wd.unlock) ? unlockBox(Wd.unlock, cd) : '';   // v0.9.71
    info.innerHTML = `${cd !== 'n' ? `<span class="cd-badge ${cd} ol">${C.name.toUpperCase()}</span>` : ''}<b class="ol">${lvl.name}</b><br>Mundo ${lvl.wi + 1}: ${Wd.name}. Rival: ${enemyLabel(Wd.efac)}, nivel ${cd === 'n' ? lvl.elvl : C.lvl(lvl)}${lvl.boss ? ', con jefe y sus habilidades' : ''}.${extra}<br><span class="stars">${'★'.repeat(sv)}<span style="color:#4a3866">${'★'.repeat(3 - sv)}</span></span> Estrellas: ganar · sin perder ninguna torre · tirando su base.<br><span class="rw">${sv ? `Recompensa: ${ECON.camp.replay * pay} de oro` : `${cd === 'm' ? 'Primera vez esta semana' : 'Primera vez'}: ${fr[0] * pay} de oro y ${fr[1] * pay} gemas`}${sv < 3 ? ` · 3 estrellas: +${ECON.camp.stars3[0] * pay} de oro y ${ECON.camp.stars3[1] * pay} gemas` : ''}${prize}</span>` + ubox;
    for (const cv of info.querySelectorAll('canvas[data-kc]')) drawArt(cv, cv.dataset.kc, 46, 42);
  } else if (mode === 'sandbox') {   // v0.9.20
    $('#prep-title').textContent = 'SALA DE PRUEBAS';
    info.innerHTML = 'Aquí no se gana ni se pierde nada: <b>CAOS infinito</b>, el tiempo no corre y tú decides qué enemigos salen y en qué campo. Prueba tu mazo, tus hechizos y tu equipo.<br><span class="rw">Sin premios ni experiencia.</span>';
  } else if (mode === 'arena') {   // v0.9.20
    $('#prep-title').textContent = 'ARENA';   // v0.9.35: la pantalla la pinta buildArenaPrep desde syncMenu, ya con la clase .arena puesta
  } else if (mode === 'boss') {
    $('#prep-title').textContent = 'MODO JEFE';
    buildBossPrep();   // v0.9.15
  } else {
    $('#prep-title').textContent = 'PARTIDA RÁPIDA';
    quickInfo();   // v0.9.71: el texto cambia con la dificultad (js/10c-rapida-ceo.js)
  }
  $('#diff-label').hidden = $('#diff-row').hidden = mode !== 'quick';
  $('#boss-pick').hidden = $('#bdiff-row').hidden = $('#boss-fac').hidden = mode !== 'boss';
  if (!isUnlocked(G.faction)) setFaction(SAVE.unlocked[0]);
  $('#scr-prep').classList.toggle('arena', mode === 'arena'); $('#scr-prep').classList.toggle('jefe', mode === 'boss'); $('#scr-prep').classList.remove('fac-abierta');   // v0.9.71: el Modo Jefe también   // v0.9.35: la arena tiene su propia distribución
  if (mode !== 'boss') $('#btn-play').disabled = false;   // el Modo Jefe lo apaga mientras miras un jefe bloqueado (lo decide buildBossPrep)
  if (mode !== 'arena' && mode !== 'boss') $('#btn-play').textContent = 'JUGAR';
  syncMenu(); updateWallets(); show('scr-prep'); fitText($('#prep-title'), 52, 26);
  for (const nb of document.querySelectorAll('#fac-grid .fac-opt b')) fitText(nb, 16, 10);   // v0.9.13: «Comunidad Gamer» también cabe
}
function setupMatch(mode, lvl, cd, pvp) {
  G.mode = mode; G.level = lvl || null; G.cdiff = mode === 'camp' ? cd || 'n' : 'n'; resetMods(); G.pvp = mode === 'pvp' ? pvp : null;   // pvp: { p: equipo, e: equipo } (ver 04b-simulacion.js)
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
  } else if (mode === 'pvp') {   // dos jugadores: cada lado sale de su equipo (mazo, niveles, estrellas, habilidades y objetos), sin IA, sin ruleta ni ajustes de dificultad
    G.faction = pvp.p.fac; G.efac = pvp.e.fac; G.elvl = 1; G.bossOn = false; G.bossName = ''; G.ebaseName = 'RIVAL';
    G.diffCfg = Object.assign({}, CFG.diff.normal, { aiIncome: 1, think: [1, 1], bossCd: 99, stun: 0, despido: 0 });
  } else if (mode === 'arena') {   // v0.9.20: arena contra «jugadores» inventados
    arenaSetup();
  } else {
    G.efac = 'microblizz'; G.elvl = avgLevel(G.faction); G.bossOn = true; G.bossName = 'SurvivalBot'; G.ebaseName = 'SURVIVALBOT'; G.diffCfg = CFG.diff[G.diff];
    if (G.diff === 'ceo') setupCeoQuick();   // v0.9.71
  }
  const deck = mode === 'arena' ? G.arenaDeck : mode === 'sandbox' ? null : mode === 'boss' ? WORLDS[G.bossWi].levels[3].deck || null : G.level && G.level.deck ? G.level.deck : G.efac === 'microblizz' && mode === 'quick' ? ['becario', 'starbot', 'fallen'] : null;
  G.classicAI = G.efac === 'microblizz' && !!deck && deck.every(k => ['becario', 'starbot', 'fallen'].includes(k));
  G.edeck = deck;
  G.eextra = mode === 'arena' ? (G.arenaSpells || []) : mode === 'sandbox' || mode === 'pvp' ? [] : enemyExtras(mode, lvl);   // v0.9.15: hechizos y mata-sanadores de la CPU
  if (mode === 'boss' && BDIFF[G.bossDiff].gear) { const BD = BDIFF[G.bossDiff]; G.egear = ENEMY_GEAR[BD.gear][G.bossWi]; G.egearQ = BD.q; if (isCorp(G.efac)) G.egearOn = G.efac === 'phony' ? PH_GEAR_ON : G.efac === 'iahorro' ? IA_GEAR_ON : MB_GEAR_ON; }
  if (G.cdiff !== 'n') setupHardMode(lvl);
  G.terrain = mode === 'sandbox' ? SB.terrain : terrainFor(mode, lvl);   // v0.9.18: campo especial de algunos jefes
}
// v0.9.15: la CPU también lanza hechizos (y en Difícil y Mítica saca a su mata-sanadores)
function enemyExtras(mode, lvl) {
  const F = FACTIONS[G.efac], g = F.gacha || [], dmg = g.find(k => CFG.cards[k].spell && CFG.cards[k].spell.kind === 'dmg'), crazy = g.find(k => CFG.cards[k].rarity === 'legendary'), killer = g.find(k => CFG.units[k]);
  const own = F.spells ? F.spells.slice() : dmg ? [dmg] : [];
  if (mode === 'quick') return G.diff === 'ceo' ? own.concat([killer]).filter(Boolean) : G.diff === 'normal' ? own : [];
  if (mode === 'boss') return own.concat(G.bossDiff === 'm' ? [killer, crazy] : G.bossDiff === 'h' ? [killer] : []).filter(Boolean);
  if (!lvl || lvl.elvl < 3) return [];   // el primer mundo, sin hechizos
  const cd = G.cdiff || 'n';
  if (cd === 'f') return [];   // v0.9.55: en Fácil la CPU no lanza hechizos
  return own.concat(cd === 'm' ? [killer, crazy] : cd === 'h' || cd === 'x' ? [killer] : []).filter(Boolean);
}
function startGame() {
  const P = G.prep || { mode: 'quick' };
  if (!isUnlocked(G.faction)) { toast('Esa facción todavía está bloqueada'); play('deny'); return; }
  if (P.mode === 'quick' && G.diff === 'ceo' && !ceoListo && !G.autoplay) { ceoRuleta(() => { ceoListo = true; startGame(); }); return; }   // v0.9.71: la ruleta gira antes de cada partida
  ceoListo = false;
  setupMatch(P.mode, P.lvl, P.cd); startMatch();
}
