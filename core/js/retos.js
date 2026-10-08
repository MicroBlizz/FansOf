// Fans Of · RETOS (1/2): misiones diarias y semanales, pase de batalla y premio diario. Los logros, el nombre, el perfil y los botones están en retos-pantallas.js
// Es el SISTEMA común: el código de js/09-menus.js, js/11-logros.js y js/20b-perfil.js de Fans of Rumble, con su mismo aspecto.
// Los DATOS son de cada juego. Antes de este archivo, el juego define en su js/retos.js:
//   RETOS.diarias y RETOS.semanales   las misiones que pueden salir: { id, txt, goal, ev }
//   RETOS.logros(fam, veces)          sus logros, llamando a fam(…) por cada familia
//   RETOS.perfil()                    lo que enseña el perfil: { sub: 'texto bajo el nombre', chip: 'el del botón del menú (si es otro)',
//                                     celdas: [[título, valor, nota], …] }  (celdaLogros() y celdaRacha() dan las dos casillas comunes)
// Opcionales, para lo que solo tiene un juego:
//   RETOS.categorias                  las pestañas de logros, si no son las de siempre
//   RETOS.noCuenta()                  true mientras lo que pasa no debe contar (una sala de pruebas)
//   RETOS.antesDeRevisar()            algo que hacer antes de repasar los logros (convertir una partida guardada antigua)
//   RETOS.trasMisiones(lista)         algo que añadir bajo las misiones diarias · RETOS.trasSemanales(lista): lo mismo bajo las semanales
//   RETOS.fijas / RETOS.fijasSemana   misiones que salen siempre las primeras (del día / de la semana); no entran en el sorteo
//   RETOS.diariasN / RETOS.semanalesN cuántas misiones hay en total (fijas incluidas); por defecto, 4 y 4
// Cada misión puede llevar además: tit (título, va encima de txt, que pasa a ser la descripción), r: [oro, gemas, pase] (premio propio)
// y alCobrar: 'evento' (al cobrarla, avisa de ese evento; así una semanal puede contar las veces que se cobra una diaria).
//   RETOS.avatares()                  qué líderes se pueden elegir de avatar · RETOS.nombre = { primera, cambio }: los textos de «¿cómo te llamas?»
//   RETOS.trasNombre()                qué hacer después de elegir nombre (por defecto, lo que toque enseñar en el menú)
// y avisa de lo que pasa en la partida con missionEvent('ganar', 1) o stat('lo-que-sea', 1).
'use strict';
/* =========================================================
   MISIONES (cuatro diarias y cuatro semanales, las mismas para todo el mundo cada día)
   ========================================================= */
const MISSIONS = RETOS.diarias, WEEKLY = RETOS.semanales, FIJAS = RETOS.fijas || [], FIJAS_W = RETOS.fijasSemana || [], DAILY_N = RETOS.diariasN || 4, WEEKLY_N = RETOS.semanalesN || 4;
const ECON_W = { gold: 300, gems: 40 };   // lo que da cada misión semanal
function weekStr() { const d = new Date(), back = (d.getDay() + 6) % 7, m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - back); return `${m.getFullYear()}-${m.getMonth() + 1}-${m.getDate()}`; }
const seedOf = str => { let h = 7; for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const mDef = (m, weekly) => (weekly ? [...FIJAS_W, ...WEEKLY] : [...FIJAS, ...MISSIONS]).find(x => x.id === m.id);
const mFija = (m, weekly) => (weekly ? FIJAS_W : FIJAS).some(f => f.id === m.id);   // las fijas no se cambian con anuncio
const mText = (m, M) => M.txt.replace('{F}', m.fac ? FACTIONS[m.fac].name : '');
function ensureDaily() {
  const day = todayStr(); if (SAVE.daily && SAVE.daily.day === day && SAVE.daily.list.length === DAILY_N && SAVE.daily.list.every(m => mDef(m))) return;
  const R = mulberry32(seedOf(day)), pool = MISSIONS.slice(), list = FIJAS.slice();
  while (list.length < DAILY_N) list.push(pool.splice(Math.floor(R() * pool.length), 1)[0]);
  const facs = FACTION_ORDER.filter(isUnlocked);
  SAVE.daily = { day, list: list.map(m => ({ id: m.id, prog: 0, claimed: false, fac: m.ev === 'facwin' ? facs[Math.floor(R() * facs.length)] : undefined })) }; saveGame();
}
function ensureWeekly() {
  const wk = weekStr();
  if (SAVE.weekly && SAVE.weekly.week === wk && SAVE.weekly.list.every(m => mDef(m, true))) {
    // una fija nueva a mitad de semana se añade delante sin volver a sortear (así no se pierde lo que llevas)
    const L = SAVE.weekly.list, falta = FIJAS_W.filter(f => !L.some(m => m.id === f.id));
    if (falta.length) L.unshift(...falta.map(f => ({ id: f.id, prog: 0, claimed: false })));
    // si ahora hay más semanales que cuando se sorteó la semana, se añaden las que faltan (las que ya tenías siguen igual)
    if (L.length < WEEKLY_N) { const R = mulberry32(seedOf('w+' + wk)), pool = WEEKLY.filter(x => !L.some(m => m.id === x.id)); while (L.length < WEEKLY_N && pool.length) L.push({ id: pool.splice(Math.floor(R() * pool.length), 1)[0].id, prog: 0, claimed: false }); }
    if (falta.length || L.length !== SAVE.weekly._n) { SAVE.weekly._n = L.length; saveGame(); }
    return;
  }
  const R = mulberry32(seedOf('w' + wk)), pool = WEEKLY.slice(), list = FIJAS_W.slice();
  while (list.length < WEEKLY_N) list.push(pool.splice(Math.floor(R() * pool.length), 1)[0]);
  SAVE.weekly = { week: wk, _n: list.length, list: list.map(m => ({ id: m.id, prog: 0, claimed: false })) }; saveGame();
}
// algo ha pasado: cuenta para las estadísticas (logros) y para las misiones de hoy y de esta semana
function missionEvent(ev, n, fac) {
  if (!n) return;
  stat(ev, n);
  ensureDaily(); ensureWeekly();
  for (const m of SAVE.daily.list) { const M = mDef(m); if (M && M.ev === ev && !m.claimed && (!m.fac || m.fac === fac)) m.prog = Math.min(M.goal, m.prog + n); }
  for (const m of SAVE.weekly.list) { const M = mDef(m, true); if (M && M.ev === ev && !m.claimed) m.prog = Math.min(M.goal, m.prog + n); }
}
let missionTab = 'd';
function untilStr(weekly) {
  const now = new Date(), d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (weekly ? 7 - (now.getDay() + 6) % 7 : 1));
  const h = Math.max(1, Math.ceil((d - now) / 3600000));
  return h >= 48 ? `${Math.floor(h / 24)} días` : h >= 24 ? '1 día y ' + (h - 24) + ' h' : h + ' h';
}
function buildMissions() {
  ensureDaily(); ensureWeekly();
  const W = missionTab === 'w', L = W ? SAVE.weekly.list : SAVE.daily.list;
  for (const b of document.querySelectorAll('[data-mt]')) b.setAttribute('aria-pressed', String(b.dataset.mt === missionTab));
  achScan(); const nA = achReady(); $('[data-mt="a"]').textContent = nA ? `Logros (${nA})` : 'Logros';
  $('#ach-bar').hidden = missionTab !== 'a';
  if (missionTab === 'a') { buildAchs(); return; }
  $('#mission-sub').textContent = W ? `${WEEKLY_N} misiones grandes cada semana. Cada una da ${ECON_W.gold} de oro, ${ECON_W.gems} gemas y ${PASS.xpWeekly} puntos de pase. Se renuevan en ${untilStr(true)}.` : `${DAILY_N} misiones nuevas cada día. Cada una da ${ECON.mission[0]} de oro, ${ECON.mission[1]} gemas y ${PASS.xpDaily} puntos de pase. Se renuevan en ${untilStr(false)}.`;
  const rw = W ? [ECON_W.gold, ECON_W.gems, PASS.xpWeekly] : [ECON.mission[0], ECON.mission[1], PASS.xpDaily];
  $('#mission-list').innerHTML = L.map((m, i) => {
    const M = mDef(m, W), done = m.prog >= M.goal, RR = M.r || rw;
    return `<div class="mission${m.claimed ? ' done' : ''}${mFija(m, W) ? ' fija' : ''}"><div>${M.tit ? `<b>${M.tit}</b><span class="ach-txt">${mText(m, M)}</span>` : `<b>${mText(m, M)}</b>`}<div class="xpbar"><i style="width:${(m.prog / M.goal) * 100}%"></i><span>${fmt(m.prog)} / ${fmt(M.goal)}</span></div></div><button class="btn-up" data-claim="${i}" ${done && !m.claimed ? '' : 'disabled'}>${m.claimed ? 'HECHA' : 'COBRAR'}<small>${COIN_SVG}${RR[0]} ${GEM_SVG}${RR[1]}</small><small>+${RR[2]} pase</small></button></div>`;
  }).join('');
  if (!W && RETOS.trasMisiones) RETOS.trasMisiones(L);
  if (W && RETOS.trasSemanales) RETOS.trasSemanales(L);
  for (const b of document.querySelectorAll('[data-claim]')) b.onclick = () => {
    const m = L[+b.dataset.claim], Mx = mDef(m, W); if (m.claimed || m.prog < Mx.goal) return;
    const RR = Mx.r || rw;
    m.claimed = true; ECO.ganar('mision', { gold: RR[0], gems: RR[1] }, { tipo: 'mision', periodo: W ? 'w' : 'd', id: m.id });
    const up = addPassXp(RR[2]); if (!W) missionEvent('dailydone', 1); else stat('weekdone', 1);
    if (Mx.alCobrar) missionEvent(Mx.alCobrar, 1);
    saveGame(); play('crown'); updateWallets(); buildMissions();
    toast(up ? `¡Pase de batalla: nivel ${passLevel()}!` : `+${RR[2]} puntos de pase`);
  };
}
function openMissions(tab) { if (tab) missionTab = tab; updateWallets(); show('scr-missions'); buildMissions(); $('#mission-list').scrollTop = 0; }

/* =========================================================
   PASE DE BATALLA: 30 niveles, pista gratis y pista Ejecutiva (de pago simulado)
   ========================================================= */
const PASS = { name: 'Temporada 1: La Gran Compra', sub: 'Dura hasta que Microblizz la cierre', levels: 30, xpPer: 400, eur: 4.99, xpWin: 100, xpLose: 40, xpDaily: 60, xpWeekly: 250 };
const PASS_Q = 0.9;   // los premios del pase salen siempre con calidad Excelente
function passReward(track, i) {
  if (track === 'free') {
    if (i === PASS.levels) return { item: 'diploma' };
    if (i % 10 === 0) return { tickets: 1 };
    if (i % 3 === 0) return { gems: 15 };
    return { gold: 150 };
  }
  if (i === PASS.levels) return { item: 'corbata_ceo' };
  if (i % 5 === 0) return { tickets: 2 };
  if (i % 2 === 0) return { gems: 30 };
  return { gold: 400 };
}
const passLevel = () => Math.min(PASS.levels, Math.floor(SAVE.pass.xp / PASS.xpPer));
function addPassXp(n) { const before = passLevel(); SAVE.pass.xp = Math.min(PASS.levels * PASS.xpPer, SAVE.pass.xp + n); return passLevel() - before; }
function rewardHtml(r) {
  if (r.gold) return `${COIN_SVG}${fmt(r.gold)}`;
  if (r.gems) return `${GEM_SVG}${fmt(r.gems)}`;
  if (r.tickets) return `${TICKET_SVG}${r.tickets} ${r.tickets > 1 ? 'tiradas' : 'tirada'}`;
  if (r.item) return `<span class="itm">${ITEMS[r.item].name}</span>`;
  return '';
}
const rewardTxt = r => r.gold ? `${fmt(r.gold)} de oro` : r.gems ? `${fmt(r.gems)} gemas` : r.tickets ? `${r.tickets} ${r.tickets > 1 ? 'tiradas gratis' : 'tirada gratis'} del gashapón` : r.item ? ITEMS[r.item].name : '';
function giveReward(r, evento) {
  const clave = ECO.ganar('premio', r, evento);
  if (r.item) { const it = addCopy('eq', r.item, Array.from({ length: Math.max(1, ITEMS[r.item].st.length) }, () => PASS_Q)); if (clave && evento && evento.tipo === 'pase') it.pend = clave; }   // el servidor crea la de verdad (copiasDelServidor)
}
const passReady = (track, i) => i <= passLevel() && !SAVE.pass[track === 'free' ? 'free' : 'paid'].includes(i) && (track === 'free' || SAVE.pass.prem);
function passClaimable() { let n = 0; for (let i = 1; i <= passLevel(); i++) { if (passReady('free', i)) n++; if (passReady('paid', i)) n++; } return n; }
function claimPass(track, i) {
  if (!passReady(track, i)) return false;
  const r = passReward(track, i); giveReward(r, { tipo: 'pase', pista: track === 'free' ? 'free' : 'paid', nivel: i }); SAVE.pass[track === 'free' ? 'free' : 'paid'].push(i); return r;
}
function buildPass() {
  const lv = passLevel(), into = SAVE.pass.xp - lv * PASS.xpPer, maxed = lv >= PASS.levels, P = SAVE.pass, nClaim = passClaimable();
  $('#pass-top').innerHTML = `<div class="pass-lvl">${lv}</div><div class="pass-name ol">${PASS.name}<small>${PASS.sub}. ${P.prem ? 'Tienes el Pase Ejecutivo.' : 'Pista gratis para todos; la Ejecutiva es de pago (de prueba).'}</small></div>
    <div><div class="xpbar"><i style="width:${maxed ? 100 : (into / PASS.xpPer) * 100}%"></i><span>${maxed ? '¡PASE COMPLETADO!' : `${into} / ${PASS.xpPer} puntos para el nivel ${lv + 1}`}</span></div></div>
    <div class="pass-actions"><button class="btn-vip ol" id="btn-buy-pass" ${P.prem ? 'disabled' : ''}>${P.prem ? 'EJECUTIVO ✓' : 'PASE EJECUTIVO · ' + eur(PASS.eur)}</button><button class="btn-up" id="btn-claim-all" ${nClaim ? '' : 'disabled'}>COBRAR TODO${nClaim ? ` (${nClaim})` : ''}</button></div>`;
  let rows = '';
  for (let i = 1; i <= PASS.levels; i++) {
    const cell = track => {
      const r = passReward(track, i), got = SAVE.pass[track === 'free' ? 'free' : 'paid'].includes(i), ready = passReady(track, i);
      const cls = 'pr-cell' + (track === 'paid' ? ' prem' : '') + (got ? ' done' : ready ? ' ready' : i > lv || (track === 'paid' && !P.prem) ? ' locked' : '');
      const lock = track === 'paid' && !P.prem ? '<span class="lk">🔒</span>' : '';
      return `<button class="${cls}" data-pc="${track}:${i}" ${ready ? '' : 'tabindex="-1"'}>${lock}${rewardHtml(r)}${got ? ' ✓' : ''}</button>`;
    };
    rows += `<div class="pass-row${i <= lv ? ' reached' : ''}" data-row="${i}"><div class="pr-n ol">${i}</div>${cell('free')}${cell('paid')}</div>`;
  }
  const list = $('#pass-list'); list.innerHTML = rows;
  list.querySelectorAll('[data-pc]').forEach(b => { b.onclick = () => {
    const [tr, i] = b.dataset.pc.split(':'); const r = claimPass(tr, +i);
    if (!r) { if (tr === 'paid' && !SAVE.pass.prem) buyPass(); return; }
    saveGame(); play('crown'); updateWallets(); buildPass(); toast('Has cobrado: ' + rewardTxt(r));
  }; });
  $('#btn-buy-pass').onclick = buyPass;
  $('#btn-claim-all').onclick = () => {
    let n = 0; for (let i = 1; i <= passLevel(); i++) { if (claimPass('free', i)) n++; if (claimPass('paid', i)) n++; }
    if (n) { saveGame(); play('win'); updateWallets(); buildPass(); toast(`¡${n} recompensas cobradas!`); }
  };
  const cur = list.querySelector(`[data-row="${Math.max(1, Math.min(PASS.levels, lv))}"]`); if (cur) list.scrollTop = Math.max(0, cur.offsetTop - list.offsetTop - 60);
}
function buyPass() {
  if (SAVE.pass.prem) return;
  confirmBox('PASE EJECUTIVO', `Desbloquea la pista Ejecutiva de la ${PASS.name}: más oro, gemas, tiradas gratis y la <b>Corbata del CEO</b>, exclusiva.<span class="big">${eur(PASS.eur)}</span><small>Versión de prueba: no se cobra nada.</small>`, 'COMPRAR', () => {
    SAVE.pass.prem = true; ECO.ganar('compra-pase', {}, { tipo: 'pase-premium' }); saveGame(); play('win'); updateWallets(); buildPass(); toast('¡Ya eres Ejecutivo! (sin cobrar nada)');
  });
}
function openPass() { updateWallets(); show('scr-pass'); buildPass(); }
// al acabar una partida: puntos de pase por jugar. Devuelve el trocito que se enseña en la pantalla del final
function passMatch(win) {
  const xp = win ? PASS.xpWin : PASS.xpLose, up = addPassXp(xp);
  return `<div class="rw-xp">Pase de batalla: +${xp} puntos${up ? ` · ¡NIVEL ${passLevel()}!` : ''}</div>`;
}

/* =========================================================
   LOGROS: familias por niveles (I, II, III…). Cada nivel es un logro y da gemas una sola vez.
   ========================================================= */
const ACH_CATS = RETOS.categorias || [['all', 'Todos'], ['b', 'Batallas'], ['f', 'Facciones'], ['c', 'Cartas'], ['k', 'Campaña'], ['e', 'Enemigos'], ['g', 'Gashapón'], ['d', 'Constancia'], ['s', 'Secretos']];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const ACHF = [];
// id, categoría, de dónde sale el progreso (una estadística o una función), metas, gemas de cada meta,
// nombre (o uno por nivel), texto de la meta, broma y pista (logros secretos)
function fam(id, cat, src, goals, gems, name, txt, joke, hint) {
  const f = { id, cat, goals, gems, txt, joke, hint };
  if (typeof src === 'function') f.prog = src; else f.ev = src;
  if (Array.isArray(name)) f.names = name; else f.name = name;
  ACHF.push(f); return f;
}
const veces = (g, uno, varias) => (g === 1 ? uno : varias.replace('{n}', fmt(g)));
RETOS.logros(fam, veces);   // los logros de este juego
const achName = (f, i) => (f.names ? f.names[i] : f.goals.length > 1 ? `${f.name} ${ROMAN[i]}` : f.name);
const achJoke = (f, i) => (typeof f.joke === 'function' ? f.joke(f.goals[i]) : Array.isArray(f.joke) ? f.joke[i] : f.joke || '');
const achProgF = f => (f.prog ? f.prog() : SAVE.stats[f.ev] || 0);
const popc = b => { let n = 0; while (b) { n += b & 1; b >>>= 1; } return n; };
let achNew = 0, achNewName = '', achT = 0, achScanT = 0;
// apunta una estadística (lo que cuentan los logros). Los logros se revisan un momento después, todos de una vez
function stat(ev, n) { if (!n || (RETOS.noCuenta && RETOS.noCuenta())) return; SAVE.stats[ev] = (SAVE.stats[ev] || 0) + n; achSoon(); }
function achSoon() { if (!achScanT) achScanT = setTimeout(() => { achScanT = 0; achScan(); }, 0); }
function achScan() {   // marca los niveles conseguidos (se quedan aunque luego bajes) y avisa con un solo mensaje
  if (RETOS.antesDeRevisar) RETOS.antesDeRevisar();
  for (const f of ACHF) {
    const p = achProgF(f), R0 = SAVE.achR[f.id] || 0; let R = R0;
    for (let i = 0; i < f.goals.length; i++) if (p >= f.goals[i]) R |= 1 << i;
    if (R === R0) continue;
    SAVE.achR[f.id] = R; const nw = R & ~R0 & ~(SAVE.achC[f.id] || 0);
    for (let i = 0; i < f.goals.length; i++) if (nw & (1 << i)) { achNew++; achNewName = achName(f, i); }
  }
  if (achNew && !achT) achT = setTimeout(achToast, 700);
}
function achToast() {
  achT = 0; if (!achNew) return;
  const n = achNew; achNew = 0;
  if (!$('#scr-missions').hidden && missionTab === 'a') { buildMissions(); return; }   // ya los estás viendo
  toast(n > 1 ? `¡${fmt(n)} logros nuevos! Cóbralos en Misiones` : `¡Logro: ${achNewName}! Cóbralo en Misiones`, true); play('crown');
  if (!$('#scr-title').hidden) updateBadges();
}
const achReady = () => { let r = 0; if (!SAVE.achR) return 0; for (const f of ACHF) r += popc((SAVE.achR[f.id] || 0) & ~(SAVE.achC[f.id] || 0)); return r; };
function achTotals() {
  const T = { n: 0, g: 0, N: 0, Gt: 0, ready: 0, rg: 0 };
  const AC0 = SAVE.achC || {}, AR0 = SAVE.achR || {};   // una partida guardada antigua puede no tenerlos todavía
  for (const f of ACHF) { const C = AC0[f.id] || 0, R = AR0[f.id] || 0; f.goals.forEach((x, i) => { T.N++; T.Gt += f.gems[i]; if (C & (1 << i)) { T.n++; T.g += f.gems[i]; } else if (R & (1 << i)) { T.ready++; T.rg += f.gems[i]; } }); }
  return T;
}
function achClaim(list) {   // cobra todos los niveles conseguidos de estas familias
  let n = 0, g = 0, last = ''; const claves = [];
  for (const f of list) {
    const C = SAVE.achC[f.id] || 0, R = SAVE.achR[f.id] || 0, nw = R & ~C; if (!nw) continue;
    f.goals.forEach((x, i) => { if (nw & (1 << i)) { n++; g += f.gems[i]; last = achName(f, i); claves.push(f.id + ':' + i); } }); SAVE.achC[f.id] = C | R;
  }
  if (!n) return 0;
  ECO.ganar('premio', { gems: g }, { tipo: 'logros', claves }); saveGame(); play('crown'); updateWallets(); updateBadges(); buildMissions();
  toast(n > 1 ? `+${fmt(g)} gemas por ${fmt(n)} logros` : `+${fmt(g)} gemas por «${last}»`, true);
  return g;
}
let achCat = 'all';
function achRowData(f) {
  const C = SAVE.achC[f.id] || 0, R = SAVE.achR[f.id] || 0, n = f.goals.length;
  let ready = 0, gems = 0, cur = -1, nc = 0;
  for (let i = 0; i < n; i++) { if (C & (1 << i)) nc++; else { if (cur < 0) cur = i; if (R & (1 << i)) { ready++; gems += f.gems[i]; } } }
  const i = cur < 0 ? n - 1 : cur, p = achProgF(f);
  return { f, p, i, ready, gems, nc, n, done: cur < 0, hidden: !!f.hint && !R, lk: !!f.fac && !isUnlocked(f.fac), fr: cur < 0 ? 2 : Math.min(1, p / f.goals[i]) };
}
