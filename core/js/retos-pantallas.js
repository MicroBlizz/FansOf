// Fans Of · RETOS (2/2): los logros, el nombre, el perfil, los avisos y los botones

function buildAchs() {
  achScan();
  const T = achTotals(), inCat = f => achCat === 'all' || f.cat === achCat;
  $('#mission-sub').textContent = `Retos para siempre: cada logro da gemas una sola vez. Llevas ${fmt(T.n)} de ${fmt(T.N)} logros y ${fmt(T.g)} de ${fmt(T.Gt)} gemas.`;
  $('#ach-cats').innerHTML = ACH_CATS.map(([c, nm]) => { const r = ACHF.filter(f => c === 'all' || f.cat === c).reduce((a, f) => a + popc((SAVE.achR[f.id] || 0) & ~(SAVE.achC[f.id] || 0)), 0); return `<button class="ach-cat" data-ac="${c}" aria-pressed="${c === achCat}">${nm}${r ? `<i>${r > 99 ? '99+' : r}</i>` : ''}</button>`; }).join('');
  for (const b of $('#ach-cats').querySelectorAll('[data-ac]')) b.onclick = () => { achCat = b.dataset.ac; play('select'); buildAchs(); $('#mission-list').scrollTop = 0; };
  const all = $('#btn-ach-all'); all.disabled = !T.ready;
  all.innerHTML = T.ready ? `COBRAR TODO<small>${fmt(T.ready)} ${T.ready > 1 ? 'logros' : 'logro'} · ${GEM_SVG}${fmt(T.rg)}</small>` : 'NADA QUE COBRAR (DE MOMENTO)';
  const L = ACHF.filter(inCat).map(achRowData).sort((x, y) => (y.ready > 0) - (x.ready > 0) || (x.done - y.done) || (x.lk - y.lk) || y.fr - x.fr);
  $('#mission-list').innerHTML = L.map(d => {
    const f = d.f, goal = f.goals[d.i], name = d.hidden ? '???' : achName(f, d.i), txt = d.hidden ? f.hint : f.txt(goal), jk = d.hidden ? '' : achJoke(f, d.i);
    const pr = d.done ? 1 : Math.min(1, d.p / goal), gm = d.ready ? d.gems : f.gems[d.i], lkTxt = d.lk && !d.ready ? ' <i>Primero libera a esta facción en la campaña.</i>' : '';
    return `<div class="mission ach${d.done ? ' done' : ''}${d.ready ? ' ready' : ''}"><div><b>${name}</b>${d.n > 1 ? `<span class="ach-lv">${d.nc}/${d.n}</span>` : ''}<span class="ach-txt">${txt}${lkTxt || (jk ? ` <i>${jk}</i>` : '')}</span><div class="xpbar"><i style="width:${pr * 100}%"></i><span>${d.done ? '¡COMPLETO!' : `${fmt(Math.min(d.p, goal))} / ${fmt(goal)}`}</span></div></div><button class="btn-up" data-af="${f.id}" ${d.ready ? '' : 'disabled'}>${d.done ? 'HECHO' : d.ready > 1 ? `COBRAR x${d.ready}` : 'COBRAR'}<small>${GEM_SVG}${fmt(gm)}</small></button></div>`;
  }).join('');
  for (const b of document.querySelectorAll('[data-af]')) b.onclick = () => { const f = ACHF.find(x => x.id === b.dataset.af); if (f) achClaim([f]); };
}
function achDay() { const td = todayStr(); if (SAVE.dayMark !== td) { SAVE.dayMark = td; stat('days', 1); saveGame(); } }   // días distintos que juegas

/* =========================================================
   PREMIO DIARIO por entrar días seguidos (si fallas un día, vuelves al día 1)
   ========================================================= */
const LOGIN = [{ gold: 150 }, { gems: 20 }, { gold: 300 }, { tickets: 1 }, { gold: 500 }, { gems: 40 }, { tickets: 10 }];
function dayDiff(a, b) { const d = t => { const [y, m, dd] = t.split('-').map(Number); return new Date(y, m - 1, dd); }; return Math.round((d(b) - d(a)) / 86400000); }
function loginState() {
  const L = SAVE.login, today = todayStr();
  if (L.last === today) return { ready: false, day: L.day, lost: false };
  const gap = L.last ? dayDiff(L.last, today) : 0, cont = gap === 1 && L.day < 7;
  return { ready: true, day: cont ? L.day + 1 : 1, lost: !!L.last && gap > 1 && L.day > 0 && L.day < 7 };
}
const loginRw = (r, big) => (r.gold ? `${COIN_SVG}${fmt(r.gold)}` : r.gems ? `${GEM_SVG}${r.gems}` : `${TICKET_SVG}${big ? '¡x10 GRATIS!' : r.tickets + (r.tickets > 1 ? ' tiradas' : ' tirada')}`);
function openLogin() {
  const st = loginState(); if (!st.ready) return;
  $('#login-sub').innerHTML = (st.lost ? '<b>Un día sin entrar y vuelves al día 1.</b> Microblizz no perdona. ' : '') + 'Microblizz te premia por entrar cada día (así no te vas a otro juego). Si un día no entras, vuelves a empezar. El día 7: ¡10 tiradas gratis!';
  $('#login-grid').innerHTML = LOGIN.map((r, i) => `<div class="lg-day${i === 6 ? ' big' : ''}${i < st.day - 1 ? ' done' : ''}${i === st.day - 1 ? ' today' : ''}"><span class="lg-n">DÍA ${i + 1}</span><span class="lg-r">${loginRw(r, i === 6)}</span></div>`).join('');
  $('#btn-login').textContent = `¡COBRAR DÍA ${st.day}!`;
  $('#scr-login').hidden = false; fitText($('#btn-login'), 36, 20);
}
function claimLogin() {
  const st = loginState(); $('#scr-login').hidden = true; if (!st.ready) return;
  const r = LOGIN[st.day - 1]; giveReward(r, { tipo: 'login' });
  SAVE.login = { last: todayStr(), day: st.day, best: Math.max(SAVE.login.best || 0, st.day) };
  stat('login', 1); saveGame(); updateWallets(); play('win'); toast(`Día ${st.day}: ${rewardTxt(r)}`, true);
}

/* =========================================================
   PERFIL: tu nombre, tu avatar y tus números
   ========================================================= */
const NAME_MIN = 3, NAME_MAX = 14;
const NAME_IDEAS = ['ConejoRebelde', 'AntiMicroblizz', 'BecarioLibre', 'SinPaseDeBatalla', 'DespedidoPro', 'ArdillaFuriosa', 'ElQueNoPaga', 'ZorroSigiloso', 'HotfixHumano', 'CEOdeNada',
  'JefaDelCaos', 'CaosConPatas', 'NoAlCrunch', 'ReyDelParche', 'TiradaGratis', 'SinMicropagos', 'LolaFan', 'ConejoLoco', 'DiscoFísico', 'MapacheJefe'];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pname = () => SAVE.name || 'Jugador';
// deja letras (con acentos y ñ), números, espacios y _ - .  · quita espacios repetidos
function cleanName(s) { return String(s || '').replace(/[^\p{L}\p{N} _.\-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX); }
function randomName() { let n; do n = pick(NAME_IDEAS) + (Math.random() < 0.6 ? Math.floor(rand(1, 99)) : ''); while (n.length > NAME_MAX || n === SAVE.name); return n; }
function avatarList() { return RETOS.avatares ? RETOS.avatares() : FACTION_ORDER.filter(f => FACTIONS[f].leader && isUnlocked(f)).map(f => FACTIONS[f].leader); }
function avatarOf() { const a = SAVE.avatar; if (a && avatarList().includes(a)) return a; return (FACTIONS[SAVE.lastFac || SAVE.fac] || FACTIONS.animales).leader || 'bunny'; }
/* ---------- ¿cómo te llamas? ---------- */
function openName(first) {
  $('#name-title').textContent = first ? '¿CÓMO TE LLAMAS?' : 'CAMBIAR NOMBRE';
  const N = RETOS.nombre || { primera: '<b>¡Hola! Soy Lola</b>, me despidió Microblizz. Antes de empezar, ¿cómo quieres que te llame? Será tu nombre en tu perfil y en el chat de las partidas.', cambio: 'Así te verán en tu perfil y en el chat de las partidas.' };
  $('#name-text').innerHTML = first ? N.primera : N.cambio;
  $('#name-cancel').hidden = first;
  const inp = $('#name-in'); inp.value = SAVE.name || ''; $('#name-err').textContent = '';
  $('#scr-name').hidden = false;
  setTimeout(() => { try { inp.focus(); } catch (e) { /* sin foco */ } }, 60);
}
function nameOk() {
  const n = cleanName($('#name-in').value);
  if (n.length < NAME_MIN) { $('#name-err').textContent = `Tiene que tener al menos ${NAME_MIN} letras o números.`; play('deny'); return; }
  const first = !SAVE.name;
  SAVE.name = n; if (!SAVE.since) { const d = new Date(); SAVE.since = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  saveGame(); $('#scr-name').hidden = true; play('select');
  toast(first ? `¡Encantada, ${n}!` : `Ahora te llamas ${n}`, true);
  profileChip(); if (!$('#scr-profile').hidden) buildProfile();
  (RETOS.trasNombre || titlePopups)();
}
/* ---------- botón del menú ---------- */
function profileChip() {
  const b = $('#btn-profile'); if (!b) return;
  b.querySelector('.pc-name').textContent = SAVE.name || 'TU PERFIL';
  const P = RETOS.perfil(); b.querySelector('.pc-sub').textContent = P.chip || P.sub;
  pintaPerfil(b.querySelector('canvas'), 34);
}
/* ---------- pantalla de perfil ---------- */
// las dos casillas que valen para cualquier juego
const celdaLogros = () => { const T = achTotals(); return ['LOGROS', `${T.n} / ${T.N}`, 'niveles conseguidos']; };
const celdaRacha = () => ['MEJOR RACHA', `${(SAVE.login && SAVE.login.best) || 0} días`, `jugando desde ${SAVE.since ? SAVE.since.split('-').reverse().join('/') : '—'}`];
function buildProfile() {
  const P = RETOS.perfil();
  const cell = (k, v, s) => `<div class="pf-cell"><small>${k}</small><b class="ol">${v}</b>${s ? `<i>${s}</i>` : ''}</div>`;
  $('#profile-who').textContent = pname();
  $('#profile-league').textContent = P.sub;
  $('#profile-stats').innerHTML = P.celdas.map(c => cell(...c)).join('');
  const cur = avatarOf();
  $('#profile-avs').innerHTML = avatarList().map(k => `<button class="pf-av${k === cur ? ' on' : ''}" data-av="${k}" aria-label="Avatar: ${esc(CFG.cards[k] ? CFG.cards[k].name : k)}"><canvas></canvas></button>`).join('');
  for (const b of document.querySelectorAll('#profile-avs .pf-av')) {
    drawArt(b.querySelector('canvas'), b.dataset.av, 46, 46);
    b.addEventListener('click', () => { SAVE.avatar = b.dataset.av; saveGame(); play('select'); buildProfile(); profileChip(); });
  }
  pintaPerfil($('#profile-av'), 96);
  const tt = $('#profile-tt'); if (tt) tt.innerHTML = typeof tituloHtml === 'function' ? tituloHtml(lookDe().titulo) : '';
  const ba = $('#arm-badge'); if (ba) ba.hidden = !(typeof lookNuevos === 'function' && lookNuevos());
}
// el avatar: con su marco si el juego tiene armario (core/js/armario.js)
function pintaPerfil(cv, LW) { if (typeof pintaAvatar === 'function' && ARM()) pintaAvatar(cv, LW, lookDe().marco, avatarOf()); else drawArt(cv, avatarOf(), LW, LW); }

/* ---------- avisos del menú y ventanas que salen solas al volver a él ---------- */
function retosBadges() {
  ensureDaily(); ensureWeekly();
  const ready = (L, W) => L.some(m => !m.claimed && m.prog >= mDef(m, W).goal);
  $('#mission-badge').hidden = !(ready(SAVE.daily.list, false) || ready(SAVE.weekly.list, true) || achReady() > 0);
  $('#pass-badge').hidden = !passClaimable();
  profileChip();
}
// primero el nombre, luego las novedades y después el premio diario (nunca con la partida guiada sin hacer: eso lo dice el juego)
function retosPopups() {
  if (!$('#scr-name').hidden || !$('#scr-login').hidden) return true;
  achDay();
  if (!SAVE.name) { openName(true); return true; }
  return false;
}
function retosLogin() { if (loginState().ready) openLogin(); }

/* ---------- botones ---------- */
$('#btn-missions').onclick = () => { play('select'); updateWallets(); buildMissions(); show('scr-missions'); };
$('#btn-pass').onclick = () => { play('select'); updateWallets(); show('scr-pass'); buildPass(); };
for (const b of document.querySelectorAll('[data-mt]')) b.onclick = () => { missionTab = b.dataset.mt; play('select'); buildMissions(); };
$('#btn-ach-all').onclick = () => achClaim(ACHF);
$('#btn-login').onclick = claimLogin;
$('#name-ok').onclick = nameOk;
$('#name-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); nameOk(); } e.stopPropagation(); });
$('#name-in').addEventListener('input', () => { $('#name-err').textContent = ''; });
$('#name-dice').onclick = () => { $('#name-in').value = randomName(); $('#name-err').textContent = ''; play('roll'); };
$('#name-cancel').onclick = () => { $('#scr-name').hidden = true; play('select'); };
$('#btn-profile').onclick = () => { play('select'); if (!SAVE.name) { openName(true); return; } buildProfile(); $('#scr-profile').hidden = false; };
$('#profile-close').onclick = () => { $('#scr-profile').hidden = true; play('select'); profileChip(); };
$('#profile-name').onclick = () => { play('select'); openName(false); };
{ const b = $('#profile-arm'); if (b) b.onclick = () => { play('select'); $('#scr-profile').hidden = true; openArmario(); }; }
try { profileChip(); } catch (e) { /* se pinta al volver al menú */ }
