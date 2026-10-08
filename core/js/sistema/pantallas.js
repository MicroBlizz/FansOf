// Fans Of · PANTALLAS: lo que usan todas las pantallas de fuera de la partida.
// Cambiar de pantalla, la cartera (oro y gemas), subir cartas de nivel, el retrato de una carta, la ventana de confirmación,
// el aviso de abajo y los puntos rojos del menú.
//
// Cada juego dice:
//   enPartida()        true mientras se está jugando (el aviso sale entonces en otro sitio)
//   goHome()           volver al menú principal (lo llaman las flechas de volver)
//   isUnlocked(fac)    si el jugador tiene ya esa facción
// y puede enganchar: 'pantalla' (id) al abrir una · 'insignias' al repasar los puntos rojos del menú.
'use strict';
/* ---------- cambiar de pantalla ---------- */
function show(id) { for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id; fire('pantalla', id); const h = document.querySelector('#' + id + ' .scr-head .h2'); if (h) fitText(h, 38, 20); }
function hideScreens() { for (const s of document.querySelectorAll('.screen')) s.hidden = true; }
for (const b of document.querySelectorAll('[data-back]')) b.addEventListener('click', () => { play('select'); goHome(); });
/* ---------- el retrato de una carta: cuántas figuras salen y cómo se encuadra cada personaje ---------- */
// encuadre de cada personaje: [desplazamiento a los lados (fracción del ancho), altura]
const ART_FIT = { fox: [0.04, 0.92], junkcoon: [-0.04, 0.92], necrolord: [-0.06, 1], skullknight: [-0.05, 1], stitchbrute: [-0.05, 1], mechavaca: [0, 1], bunny: [0, 1],
  twitchking: [-0.06, 1], hypetrain: [-0.04, 0.86], banhammer: [-0.1, 0.98], viralbot: [-0.03, 0.92], snackmom: [-0.06, 0.94], hypebeast: [-0.03, 0.92],
  epicchampion: [-0.04, 1], minotaur: [-0.06, 1], thundergod: [-0.04, 0.98], shieldmaiden: [-0.05, 0.96], cupidarcher: [-0.04, 0.92], medusa: [0, 0.96],
  cybermarine: [-0.1, 1], siegemech: [-0.08, 1], neonsniper: [-0.12, 0.9], cyberninja: [-0.06, 0.92], techdroid: [0, 0.9], hackerkid: [-0.06, 0.92],
  memelord: [-0.06, 1], chonkcat: [0, 1], trollbot: [-0.06, 0.96], stonks: [-0.08, 0.96], synthcat: [-0.04, 0.92], gifblaster: [-0.06, 0.92],
  progamer: [-0.06, 1], recreativa: [0, 1], ragequitter: [0.03, 0.96], coleccionista: [0.02, 0.94], modder: [-0.04, 0.94], speedrunner: [0.02, 0.92],
  vikingo: [-0.02, 1], titanbeta: [0, 1], rockracer: [0, 0.78], ghostagent: [-0.12, 0.92], retromarine: [-0.07, 0.94],
  directora: [-0.05, 1], kaiju: [0.08, 1], heroe: [0, 0.94], detective: [-0.07, 0.94], spoiler: [-0.06, 0.94], doble: [0, 0.92] };
function drawArt(cv, key, LW, LH) {
  const R2 = 3; cv.width = LW * R2; cv.height = LH * R2; const x = cv.getContext('2d'); x.setTransform(R2, 0, 0, R2, 0, 0); x.clearRect(0, 0, LW, LH);
  x.fillStyle = 'rgba(20,10,30,.25)'; x.beginPath(); x.ellipse(LW / 2, LH - 4, LW * 0.32, Math.max(2, LH * 0.08), 0, 0, Math.PI * 2); x.fill();
  const h = LH - 8, n = Math.min(3, (CFG.cards[key] && CFG.cards[key].count) || 1);
  if (n === 2) { drawVector(x, key, LW / 2 - LW * 0.15, LH - 4, h * 0.74, 1); drawVector(x, key, LW / 2 + LW * 0.15, LH - 2, h * 0.8, -1); }
  else if (n === 3) { const hs = key === 'skeleton' ? 0.82 : 0.66; drawVector(x, key, LW / 2 - LW * 0.24, LH - 5, h * hs, 1); drawVector(x, key, LW / 2 + LW * 0.24, LH - 5, h * hs, -1); drawVector(x, key, LW / 2, LH - 2, h * (hs + 0.1), 1); }
  else { const f = ART_FIT[key] || [0, 0.92]; drawVector(x, key, LW / 2 + f[0] * LW, LH - 3, h * f[1], 1); }
}
/* ---------- cartera ---------- */
const RAR_ORDER = { mythic: -1, legendary: 0, epic: 1, rare: 2, common: 3, basic: 4 };
function updateWallets() {
  for (const w of document.querySelectorAll('[data-wallet]')) w.innerHTML = `<button class="wal" data-wal="gold" aria-label="Oro: ${fmt(SAVE.gold)}. Comprar más">${COIN_SVG}${fmt(SAVE.gold)}<i class="wal-plus ol">+</i></button><button class="wal" data-wal="gems" aria-label="Gemas: ${fmt(SAVE.gems)}. Comprar más">${GEM_SVG}${fmt(SAVE.gems)}<i class="wal-plus ol">+</i></button>`;
  updateBadges();
}
document.addEventListener('click', e => { const w = e.target.closest && e.target.closest('[data-wal]'); if (!w) return; play('select'); openShop(w.dataset.wal); });
/* ---------- niveles: cada carta sube con la experiencia que gana jugando y oro ---------- */
const needXp = l => ECON.xpNeed[l] || 0, lvlCost = l => ECON.goldCost[l] || 0;
const canLevel = k => { const us = uSave(k); return us.lvl < ECON.maxLvl && us.xp >= needXp(us.lvl); };
function levelUp(k, alAcabar) {   // alAcabar: se llama cuando ya ha subido (con servidor tarda un momento)
  if (!canLevel(k)) return false;
  const us = uSave(k), cost = lvlCost(us.lvl);
  if (SAVE.gold < cost) { toast(`Te falta oro: ${fmt(cost - SAVE.gold)} más`); play('deny'); return false; }
  const hecho = () => { missionEvent('lvlup', 1); saveGame(); play('levelup'); toast(`¡${CFG.cards[k].name} sube a nivel ${us.lvl}!`); if (alAcabar) alAcabar(); };
  if (!ECO.servidor('economia')) { ECO.gastar('mejorar-carta', { gold: cost }); us.xp -= needXp(us.lvl); us.lvl++; hecho(); return true; }
  ECO.mejorar(k, us.xp).then(r => { us.xp -= r.xp_gastada; us.lvl = r.nivel; hecho(); }).catch(e => { play('deny'); toast(ECO.errorTexto(e)); });
  return true;
}
/* ---------- ventana de confirmación ---------- */
function confirmBox(title, html, okTxt, onOk, noTxt) {
  $('#cf-title').textContent = title; $('#cf-body').innerHTML = html;
  $('#cf-btns').innerHTML = okTxt ? `<button class="btn-ghost ol btn-ok" id="cf-ok">${okTxt}</button><button class="btn-ghost ol" id="cf-no">MEJOR NO</button>` : `<button class="btn-ghost ol" id="cf-no">${noTxt || 'VAYA'}</button>`;
  $('#scr-confirm').hidden = false;
  const close = () => { $('#scr-confirm').hidden = true; };
  $('#cf-no').onclick = () => { play('select'); close(); };
  if (okTxt) $('#cf-ok').onclick = () => { close(); onOk(); };
}
/* ---------- el aviso de abajo ---------- */
let toastTimer = null;
function toast(msg, good) { const t = $('#toast'); t.textContent = msg; t.classList.toggle('good', !!good); t.classList.toggle('menu', !enPartida()); t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400); }
/* ---------- los puntos rojos del menú: hay algo que hacer en esa pantalla ---------- */
function updateBadges() {
  $('#coll-badge').hidden = !FACTION_ORDER.some(f => isUnlocked(f) && [FACTIONS[f].leader, ...FACTIONS[f].units].some(k => canLevel(k) && SAVE.gold >= lvlCost(uSave(k).lvl)));
  $('#shop-badge').hidden = !giftReady();
  const t = SAVE.tickets || 0; $('#gacha-badge').hidden = !t;
  $('#feat-gacha').textContent = t ? `¡${t} ${t > 1 ? 'tiradas gratis' : 'tirada gratis'}!` : 'Tira x1, x10 o x50';
  $('#feat-shop').textContent = giftReady() ? '¡Regalo diario gratis!' : 'Oro, gemas y ofertas';
  retosBadges();   // misiones, logros, pase y el botón del perfil
  fire('insignias');
}
