// Fans of Rumble · Lo que sale al volver al menú, velocidad x2, pack de bienvenida y partida guiada (los logros y el premio diario son comunes: core/js/retos.js)
'use strict';
/* =========================================================
   v0.9.11: logros, premio diario, novedades, velocidad x2, partida guiada e instalar como app
   ========================================================= */
// ---- logros: el sistema es común (core/js/retos.js) y los de este juego están en js/retos.js. Aquí queda solo lo de las partidas guardadas antiguas
const ACH_OLD = {};   // ids de la 0.9.13 → [familia, nivel]
for (const f of ACHF) for (const g in f.al) ACH_OLD[f.al[g]] = [f, f.goals.indexOf(+g)];
function achInit() {   // los logros de la 0.9.13 (una lista de ids) pasan al formato nuevo sin perder lo cobrado
  SAVE.achC = SAVE.achC || {}; SAVE.achR = SAVE.achR || {}; if (SAVE.achV === 2) return;
  for (const id of SAVE.achDone || []) { const r = ACH_OLD[id]; if (r && r[1] >= 0) { SAVE.achC[r[0].id] = (SAVE.achC[r[0].id] || 0) | (1 << r[1]); SAVE.achR[r[0].id] = (SAVE.achR[r[0].id] || 0) | (1 << r[1]); } }
  for (const id of SAVE.achSeen || []) { const r = ACH_OLD[id]; if (r && r[1] >= 0) SAVE.achR[r[0].id] = (SAVE.achR[r[0].id] || 0) | (1 << r[1]); }
  SAVE.achV = 2;
}
// ---- novedades: la ventana y el aviso de versión nueva son comunes (core/js/novedades.js); la lista de este juego está en js/novedades.js
// al volver al menú principal: primero las novedades y luego el premio diario (nunca durante la partida guiada)
function titlePopups() {
  if (!SAVE.tut.done || G.autoplay || $('#scr-title').hidden || !$('#scr-news').hidden || !$('#scr-login').hidden || !$('#scr-name').hidden) return;
  if (!SAVE.name) { if ($('#scr-name').hidden) openName(true); return; }   // v0.9.26: los que ya jugaban también eligen nombre
  if (novedadesPendientes()) { openNews(); return; }
  if (loginState().ready) openLogin();
}
// ---- velocidad x2 (se guarda; en la partida guiada siempre va a x1)
function applySpeed() {
  const on = !!SAVE.speed2 && !G.tutMatch, b = $('#btn-speed'); G.timeScale = on ? 2 : 1;
  b.hidden = !!G.tutMatch; b.setAttribute('aria-pressed', String(on)); $('#speed-txt').textContent = on ? 'x2' : 'x1';
  b.setAttribute('aria-label', on ? 'Velocidad x2. Pulsa para volver a la normal' : 'Velocidad normal. Pulsa para ir el doble de rápido');
}
$('#btn-speed').addEventListener('click', () => { if (G.tutMatch) return; SAVE.speed2 = !SAVE.speed2; if (SAVE.speed2) stat('speed2', 1); saveGame(); applySpeed(); play('select'); toast(SAVE.speed2 ? 'Velocidad x2: todo va el doble de rápido' : 'Velocidad normal', true); });
// ---- pack de bienvenida
function buyStarter() {
  if (SAVE.starter) return;
  const P = SHOP.starter, pool = Object.keys(ITEMS).filter(k => ITEMS[k].rar === 'epic' && !ITEMS[k].pass);
  SAVE.starter = true; ECO.ganar('bienvenida', P);
  const it = newCopy('eq', pick(pool), 3);
  saveGame(); play('win'); updateWallets(); buildShop(); toast('¡Pack de bienvenida! Microblizz te da las gracias', true);
  setTimeout(() => openItem(it.u), 450);
}
// ---- partida guiada. Pasos: 0 = ganar una partida · 1 = ponerle una habilidad a una carta · 2 = girar el gashapón
const COACH_WHO = 'LOLA · DESPEDIDA POR MICROBLIZZ';
function curScreen() { let top = null; for (const sc of document.querySelectorAll('.screen')) if (!sc.hidden && (!top || sc.classList.contains('modal'))) top = sc; return top ? top.id : ''; }
function tutStep(n) {
  const T = SAVE.tut; if (T.done || T.step >= n) return;
  T.step = n;
  if (n === 1) {
    if (!SAVE.tutGift.cafe) { SAVE.tutGift.cafe = 1; T.cafeU = addCopy('ab', 'cafeina', [0.75]).u; G.tutJust = true; }
    if (!SAVE.inv.some(x => x.k === 'ab')) { tutStep(2); return; }
  }
  if (n === 2 && !SAVE.tutGift.tix) { SAVE.tutGift.tix = 1; ECO.ganar('tutorial', { tickets: 3 }); G.tutJust2 = true; updateWallets(); }
  saveGame();
}
function tutFinish() {
  const T = SAVE.tut; if (T.done) return;
  T.done = true; T.step = 3; delete T.sawG; if (SAVE.seenVer !== NEWS_VER) SAVE.seenVer = NEWS_VER;
  G.tutMatch = false; saveGame(); tutTick(); setTimeout(titlePopups, 60);
}
function tutSkip() { play('select'); tutFinish(); $('#tut').hidden = true; $('#tut-tip').hidden = true; toast('Tutorial saltado. Puedes repetirlo en Opciones', true); }
function tutWant() {
  const T = SAVE.tut; if (!T || T.done || G.autoplay) return null;
  const sc = curScreen();
  if (T.step === 0) {
    if (sc === 'scr-title') return { sel: '#btn-camp', text: `¡Encantada, <b>${esc(pname())}</b>! Microblizz, una empresa millonaria, compró el estudio donde yo trabajaba, nos despidió a todos y ahora quiere cerrar tus juegos favoritos. ¡Vamos a impedirlo! Toca <b>CAMPAÑA</b>.` };
    if (sc === 'scr-camp') return { sel: '[data-lv="1-1"]', text: 'Empieza por el primer nivel: <b>La compra</b>.' };
    if (sc === 'scr-prep') return { sel: '#btn-play', text: 'Aquí eliges con qué facción juegas. Por ahora tienes a los <b>Animales Locos</b>. Toca <b>JUGAR</b>.' };
    if (sc === 'scr-end') return { sel: '#btn-again', text: `¡Casi! Esta vez ha ganado Microblizz. Toca <b>${$('#btn-again').textContent}</b> y vuelve a intentarlo.` };
    return null;
  }
  if (T.step === 1) {
    if (sc === 'scr-end') return { sel: '#btn-menu', text: G.tutJust ? `¡Victoria, ${esc(pname())}!` + ' Te regalo una habilidad: <b>Cafeína</b>, que hace que una carta corra más. Toca <b>MENÚ</b> y vamos a ponérsela.' : 'Toca <b>MENÚ</b> y vamos a ponerle una habilidad a una carta.' };
    if (sc === 'scr-camp') return { sel: '#scr-camp .back', text: 'Vuelve al menú principal con la flecha.' };
    if (sc === 'scr-title') return { sel: '#btn-coll', text: 'Toca <b>COLECCIÓN</b>: ahí están tus cartas y lo que llevan puesto.' };
    if (sc === 'scr-coll') return { sel: '#coll-list [data-ab]', text: 'Cada carta tiene una <b>ranura de HABILIDAD</b>. Toca la de tu líder.' };
    if (sc === 'scr-pick') { const cafe = T.cafeU && invGet(T.cafeU); return { sel: cafe ? `#pick-list .pick-opt[data-id="${T.cafeU}"]` : '#pick-list .pick-opt[data-id]:not([data-id=""])', text: cafe ? 'Elige <b>Cafeína</b>.' : 'Elige una habilidad.' }; }
    return null;
  }
  if (T.step === 2) {
    const done = G.tutJust2 ? '¡Hecho! Tu carta ya lleva su habilidad. Y te regalo <b>3 tiradas gratis</b> del gashapón. ' : '¡Hecho! ';
    if (sc === 'scr-coll') return { sel: '#scr-coll .back', text: done + 'Vuelve al menú con la flecha.' };
    if (sc === 'scr-inv') return { sel: '#scr-inv .back', text: done + 'Vuelve al menú con la flecha.' };
    if (sc === 'scr-title') return { sel: '#btn-gacha', text: 'Toca <b>GASHAPÓN</b>: ahí salen habilidades y equipo para tus cartas.' };
    if (sc === 'scr-gacha') return { sel: '#btn-pull', text: 'Gira <b>x1</b>: es gratis. Lo que te toque, póntelo en Colección como antes.' };
    return null;
  }
  return null;
}
let coachKey = '';
function coachPlace(t) {
  const co = $('#coach'), sr = stage.getBoundingClientRect(), k = W / sr.width, r = t.getBoundingClientRect();
  const cx = (r.left + r.width / 2 - sr.left) * k, top = (r.top - sr.top) * k, bot = (r.bottom - sr.top) * k, h = co.offsetHeight;
  let up = bot + 20 + h > VIEW.LH - 6, y = up ? top - h - 20 : bot + 20;
  if (up && y < 6) { up = false; y = bot + 20; }
  co.style.top = Math.round(y) + 'px'; co.classList.toggle('up', up); co.classList.toggle('down', !up);
  co.style.setProperty('--ax', Math.round(clamp(cx - 24 - 12, 18, 492 - 46)) + 'px');
}
function tutTick() {
  const T = SAVE.tut;
  if (!T.done && !SAVE.name && !G.autoplay && curScreen() === 'scr-title' && $('#scr-name').hidden) { $('#coach').hidden = true; coachKey = ''; openName(true); return; }   // v0.9.26: Lola te pregunta el nombre
  if (!T.done && T.step === 2 && T.sawG && curScreen() !== 'scr-gacha') { tutFinish(); return; }   // vio el gashapón y se fue: listo
  const want = tutWant(), key = want ? want.sel + '|' + want.text : '', co = $('#coach');
  if (key !== coachKey) {
    coachKey = key;
    for (const e of document.querySelectorAll('.coach-glow')) e.classList.remove('coach-glow');
    if (!want) { co.hidden = true; return; }
    co.innerHTML = `<span class="coach-who">${COACH_WHO}</span>${want.text}<button class="coach-skip" id="coach-skip">Saltar tutorial</button>`;
    co.hidden = false; $('#coach-skip').onclick = tutSkip;
  }
  if (!want) return;
  const t = document.querySelector(want.sel);
  if (!t || !t.getClientRects().length) { co.style.visibility = 'hidden'; return; }
  co.style.visibility = '';
  if (!t.classList.contains('coach-glow')) { t.classList.add('coach-glow'); try { t.scrollIntoView({ block: 'nearest' }); } catch (e) { /* sin scroll */ } }
  coachPlace(t);
}
// pistas durante la primera partida (no paran el juego)
function tutBattleStart() { G.tutB = 0; G.tutT = 0; G.tutAt = 0; G.tutTipSeen = false; G.tutJust = false; G.tutJust2 = false; $('#tut-tip').hidden = true; }
function tipBattle(html, secs) { const t = $('#tut-tip'); t.innerHTML = html; t.hidden = false; clearTimeout(tipBattle.tm); tipBattle.tm = setTimeout(() => { t.hidden = true; }, secs * 1000); }
function tutBattle(dt) {
  if (!G.tutMatch) return;
  G.tutT += dt;
  if (G.tutB === 1 && G.tutT > G.tutAt + 9) { G.tutB = 2; G.tutAt = G.tutT; if (!G.tutTipSeen) tipBattle('Truco: <b>mantén pulsada</b> una carta para ver qué hace.', 7); }
  else if (G.tutB === 2 && G.tutT > G.tutAt + (G.tutTipSeen ? 1 : 10)) { G.tutB = 3; tipBattle('Tu objetivo: tira sus <b>torres</b> y la <b>sede de Microblizz</b>. ¡Tú puedes!', 7); }
}

/* ---------- lo que este juego añade a las pantallas comunes (core/js/sistema/) ---------- */
// la partida guiada sigue lo que haces en la colección y en el gashapón
hook('equipar', kind => { if (kind === 'ab') tutStep(2); });
hook('gacha.abierto', () => { if (!SAVE.tut.done && SAVE.tut.step === 2) SAVE.tut.sawG = true; });
hook('gacha.tirada', () => { if (!SAVE.tut.done && SAVE.tut.step === 2) setTimeout(() => { tutFinish(); toast('¡Tutorial completado! Ya sabes lo básico. ¡A por Microblizz!', true); }, 1500); });
// el pack de bienvenida, en la tienda y en el botón del menú
hook('tienda', () => {
    if (!SAVE.starter) {
  const P = SHOP.starter;
  $('#gift-row').insertAdjacentHTML('beforeend', `<div class="pack starter"><span class="joke-flag">1 VEZ</span><div class="pk-ic">${PILE(5, true)}</div><div><div class="pk-name ol">Pack de bienvenida</div><div class="pk-amt ol">${GEM_SVG}${fmt(P.gems)} <span class="pk-plus">+</span> ${COIN_SVG}${fmt(P.gold)}</div><div class="pk-note">Y un objeto épico de equipo con calidad Director (excelente) o mejor. Vale casi el doble que comprarlo por separado. Microblizz lo llama «regalo».</div></div><button class="btn-price ol" id="btn-starter">${eur(P.eur)}</button></div>`);
  $('#btn-starter').onclick = () => { play('select'); confirmBox('¿COMPRAR?', `Pack de bienvenida<span class="big">${GEM_SVG} ${fmt(P.gems)} · ${COIN_SVG} ${fmt(P.gold)}</span>y un objeto épico de calidad Director (excelente) o mejor, por <b>${eur(P.eur)}</b><small>Versión de prueba: no se cobra nada y te lo llevas gratis. Solo se puede comprar una vez.</small>`, 'COMPRAR', buyStarter); };
}
});
hook('insignias', () => { if (!giftReady() && !SAVE.starter) $('#feat-shop').textContent = '¡Pack de bienvenida!'; });
