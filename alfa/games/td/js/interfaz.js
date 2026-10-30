// Fans of TD · Interfaz: la bandeja de cartas, el marcador, el panel de colocación, los botones y el arranque
'use strict';

function buildTray() {
  const tray = $('#cards'); tray.innerHTML = '';
  if (G.vs && G.trayMode === 'send') {
    // modo VS: las 6 unidades de tu raza, para mandárselas al rival
    for (const k of FACTIONS[G.fac].units) {
      const C = CFG.cards[k], b = document.createElement('button'), l = G.vs.me.ulvl[k] || 1, max = l >= TD.maxLevel; b.className = 'card send r-' + C.rarity; b.dataset.k = k; b.dataset.send = '1';
      b.setAttribute('aria-label', `Enviar ${C.name} de nivel ${l}: ${sendCost(k)} de CAOS, +${sendIncome(k)} de ingresos`);
      b.innerHTML = `<canvas></canvas><span class="nm">${l > 1 ? '★'.repeat(l - 1) + ' ' : ''}+${sendIncome(k)} ingresos</span><span class="cost ol">${sendCost(k)}</span><span class="upg ol${max ? ' max' : ''}" role="button" aria-label="Mejorar ${C.name}">${max ? 'MÁX' : '▲ ' + unitUpCost(k, l)}</span>`;
      tray.appendChild(b); requestAnimationFrame(() => portrait(b.querySelector('canvas'), k, C.rarity === 'epic' ? 40 : 34));
      b.addEventListener('pointerdown', e => { e.preventDefault(); if (e.target.closest('.upg')) { if (vsUpgrade(k)) buildTray(); hud(); return; } vsSend(k); hud(); });
    }
    return;
  }
  for (const k in TOWERS[G.fac]) {
    const D = TOWERS[G.fac][k], C = CFG.cards[k];
    const b = document.createElement('button'); b.className = 'card r-' + C.rarity; b.dataset.k = k; b.setAttribute('aria-label', `${C.name}, ${D.cost} de CAOS`);
    b.innerHTML = `<canvas></canvas><span class="nm">${C.name}</span><span class="cost ol">${D.cost}</span>`;
    tray.appendChild(b);
    requestAnimationFrame(() => portrait(b.querySelector('canvas'), k, C.rarity === 'leader' || C.rarity === 'epic' ? 40 : 34));
    b.addEventListener('pointerdown', e => { e.preventDefault(); if (G.vs && G.vs.view !== 'me') vsView('me'); G.sel = null; hidePanel(); if (G.over) return; if (D.leader && G.towers.some(t => t.k === k)) { showInfo(k); return; } G.placeT = 0; if (G.place === k) { G.place = null; G.ghost = null; } else { G.place = k; G.ghost = null; G.dragging = true; showInfo(k); } refreshTray(); });
  }
}
function showInfo(k) { const C = CFG.cards[k], D = TOWERS[G.fac][k]; $('#info').innerHTML = `<b>${C.name}</b> · ${D.desc}`; $('#info').hidden = false; }
function refreshTray() {
  // ojo: classList.toggle con «undefined» alterna la clase en cada llamada (así parpadeaban las cartas): el segundo valor tiene que ser siempre true o false
  for (const b of document.querySelectorAll('#cards .card')) { const k = b.dataset.k; if (b.dataset.send) { const l = G.vs.me.ulvl[k] || 1; b.classList.toggle('off', G.gold < sendCost(k)); b.querySelector('.upg').classList.toggle('no', l < TD.maxLevel && G.gold < unitUpCost(k, l)); continue; } const D = TOWERS[G.fac][k]; const used = !!D.leader && G.towers.some(t => t.k === k); b.classList.toggle('off', G.gold < D.cost || used); b.classList.toggle('sel', G.place === k); b.classList.toggle('used', !!used); }
  if (!G.place) $('#info').hidden = true;
}
function hud() {
  const V = G.vs, wb = $('#btn-wave');
  setText($('#gold'), G.gold); setText($('#lives'), Math.ceil(G.lives)); $('#ui').classList.toggle('vs', !!V); if ($('#btn-mode').hidden !== !V) $('#btn-mode').hidden = !V;
  if (V) {
    // modo VS: la vida del rival, tu income y el botón para mirar su campo
    setText($('#wave-l'), 'RIVAL ♥'); setText($('#wave'), Math.ceil(V.ai.lives));
    if (wb.hidden !== G.over) wb.hidden = G.over; wb.classList.remove('beat'); setText($('#wave-main'), V.view === 'me' ? 'RIVAL' : 'VOLVER'); setText($('#wave-sub'), V.view === 'me' ? 'ver su campo' : 'a tu campo');
    setText($('#btn-mode'), G.trayMode === 'send' ? 'TORRES' : 'ENVIAR UNIDADES');
    setText($('#btn-speed'), 'x' + G.speed); $('#btn-speed').setAttribute('aria-pressed', String(G.speed > 1));
    setText($('#lvl-name'), (V.view === 'me' ? 'TU CAMPO' : 'CAMPO DE ' + FAC_NAME(V.ai.fac).toUpperCase()) + ` · ingresos +${V.me.income} en ${Math.ceil(V.tickT)} s`);
    refreshTray(); if (G.sel) placePanel(); return;
  }
  setText($('#wave-l'), 'OLEADA'); setText($('#wave-main'), '¡OLEADA!'); setText($('#wave'), `${Math.min(G.wave, G.waves)}/${G.waves}`);
  const can = !G.inWave && G.wave < G.waves && !G.over; if (wb.hidden !== !can) wb.hidden = !can; wb.classList.add('beat');
  if (can) setText($('#wave-sub'), G.wave === 0 ? '¡EMPEZAR!' : Math.ceil(G.nextT) + ' s · +' + Math.round(G.nextT * TD.earlyBonus));
  setText($('#btn-speed'), 'x' + G.speed); $('#btn-speed').setAttribute('aria-pressed', String(G.speed > 1));
  setText($('#lvl-name'), `${G.level.id} · ${G.level.name}` + passiveChip());
  refreshTray(); if (G.sel) placePanel();
}
// lo que lleva ganado la pasiva de la raza, junto al nombre del nivel
function passiveChip() {
  const f = G.fac, pc = v => ' · ' + FACTIONS[f].passive + ' +' + Math.round(v * 100) + ' %';
  if (f === 'streamers') return pc(G.teamSpd);
  if (f === 'heroes') return pc(G.teamDmg - 1);
  if (f === 'gamer') return pc(G.teamDmg - 1);
  if (f === 'ciber') return ' · ESCUDO ' + Math.ceil(G.shield);
  return ' · ' + FACTIONS[f].passive;
}
function placePanel() {
  const t = G.sel, p = $('#panel'), C = CFG.cards[t.k], D = tdef(t), max = t.lvl >= TD.maxLevel, c = max ? 0 : upCost(t), mate = fuseMate(t), canFuse = t.lvl < TD.fuseMax && !D.leader;
  p.hidden = false;
  // los botones solo se vuelven a crear cuando cambia la torre, su nivel o si se puede fusionar; el resto se actualiza sin tocarlos (si no, parpadean)
  const key = [t.id, t.lvl, mate ? mate.id : 0, canFuse].join('|');
  if (p.dataset.h !== key) {
    p.dataset.h = key;
    p.innerHTML = `<div class="pn-t ol">${C.name} <small>NV ${t.lvl}</small></div><div class="pn-s" id="pn-st"></div>${canFuse && !mate ? '<div class="pn-h">Pega al lado otra igual y del mismo nivel para fusionarlas.</div>' : ''}
    <div class="pn-b"><button class="btn-up" id="pn-up">${max ? 'MÁXIMO' : 'MEJORAR<small>' + c + ' CAOS</small>'}</button>${mate ? `<button class="btn-fuse" id="pn-fuse">FUSIONAR<small>nivel ${t.lvl + 1}</small></button>` : ''}<button class="btn-sell" id="pn-sell">VENDER<small>+${sellOf(t)}</small></button></div>`;
    $('#pn-up').onclick = () => { upgrade(t); hud(); }; $('#pn-sell').onclick = () => { sell(t); hidePanel(); hud(); }; const pf = $('#pn-fuse'); if (pf) pf.onclick = () => { fuse(t); hud(); };
  }
  const R = Math.round(rangeOf(t)), dmg = D.kind === 'aura' ? `+${Math.round((D.aura.speed + 0.1 * (t.lvl - 1)) * 100)} % velocidad` : `${Math.round(dmgOf(t) / (D.ramp ? 1 + D.ramp.step * (t.ramp || 0) : 1))} de daño`;
  setHtml($('#pn-st'), `${dmg} · alcance ${R}${t.rage ? ` · <span class="rage">RABIA +${t.rage * 10} %</span>` : ''}${t.mut.id && t.mut.id !== 'normal' ? ` · <span class="rage">${t.mut.txt}</span>` : ''}`);
  const up = $('#pn-up'), off = max || G.gold < c; if (up.disabled !== off) up.disabled = off;
  const x = clamp(t.x, 120, W - 120), y = t.y > 520 ? t.y - 160 : t.y + 40; p.style.left = x - 110 + 'px'; p.style.top = y + 'px';
}
// escribir en la página solo cuando el texto cambia de verdad
function setText(el, v) { v = String(v); if (el.textContent !== v) el.textContent = v; }
function setHtml(el, v) { if (el.dataset.v !== v) { el.dataset.v = v; el.innerHTML = v; } }
function hidePanel() { $('#panel').hidden = true; $('#panel').dataset.h = ''; }

// controles: arrastra una carta al campo o tócala y luego toca el campo
function toField(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / SCALE, y: (e.clientY - r.top) / SCALE }; }
const GHOST_MSG = { cierra: '¡NO CIERRES EL CAMINO!', enemigo: 'HAY ENEMIGOS', puerta: 'ES LA ENTRADA', ocupada: 'YA HAY UNA TORRE', boton: 'AQUÍ NO', fuera: 'AQUÍ NO' };
// la casilla bajo el dedo, si se puede construir y cómo quedaría el camino
function ghostAt(p) {
  if (p.y < GY - 6 || p.y > GY1 + 4 || p.x < GX || p.x > GX + COLS * CELL) return null;
  const { c, r } = cellAt(p.x, p.y), i = idx(c, r), why = whyNot(c, r);
  const g = { c, r, x: ccx(i), y: ccy(i) + 6, why, ok: !why && G.gold >= TOWERS[G.fac][G.place].cost, route: null };
  if (!why) { BLOCK[i] = 1; const D = flow(BLOCK); g.route = routeFrom(MID_ENTRY, D, BLOCK); BLOCK[i] = 0; }
  return g;
}
function tryBuild(g) {
  if (!g) return false;
  const k = G.place;
  if (build(k, g.c, g.r)) {
    // la carta se queda elegida unos segundos por si quieres poner varias seguidas (si es el líder o no te llega el CAOS, se suelta)
    const D = TOWERS[G.fac][k]; G.ghost = null;
    if (D.leader || G.gold < D.cost) { G.place = null; G.placeT = 0; } else G.placeT = TD.keepSel;
    return true;
  }
  pop(g.x, g.y - 30, g.why ? GHOST_MSG[g.why] : 'FALTA CAOS', g.why ? '#ff4b5c' : '#ffcb3d', 14); return false;
}
addEventListener('pointermove', e => {
  if (G.screen !== 'play' || !G.place || !(G.dragging || e.pointerType === 'mouse')) return;
  const g = ghostAt(toField(e)); if (!g) { G.ghost = null; return; }
  if (!G.ghost || G.ghost.c !== g.c || G.ghost.r !== g.r) { G.ghost = g; if (G.placeT > 0) G.placeT = TD.keepSel; }
});
addEventListener('pointerup', e => {
  if (G.screen !== 'play' || !G.dragging) return; G.dragging = false;
  const p = toField(e); if (G.place && p.y < 792 && p.y > 0 && G.ghost) { tryBuild(ghostAt(p)); hud(); }
});
cv.addEventListener('pointerdown', e => {
  if (G.screen !== 'play' || G.over || (G.vs && G.vs.view !== 'me')) return; const p = toField(e);
  if (G.place) {
    const g = ghostAt(p);
    // con la carta aún elegida tras construir, tocar una torre ya puesta la selecciona en vez de dar error
    if (g && g.why === 'ocupada' && G.placeT > 0) { G.place = null; G.ghost = null; G.placeT = 0; refreshTray(); }
    else { if (g) { G.ghost = g; tryBuild(g); hud(); } return; }
  }
  const pc = p.y >= GY && p.y < GY1 ? cellOf(p.x, p.y) : -1;
  const t = G.towers.find(o => o.cell === pc) || G.towers.find(o => Math.hypot(o.x - p.x, o.y - 20 - p.y) < 22);
  G.sel = t && t !== G.sel ? t : null; if (G.sel) placePanel(); else hidePanel();
});
addEventListener('keydown', e => { if (e.key === 'Escape') { G.place = null; G.ghost = null; G.sel = null; hidePanel(); refreshTray(); } if (e.key === ' ' && G.screen === 'play') { e.preventDefault(); startWave(); } });

function startLevel(L) {
  G.vs = null; G.rt = {};
  Object.assign(G, { screen: 'play', level: L, gold: L.gold, lives: TD.baseHp, route: [], wave: 0, waves: L.waves, inWave: false, nextT: 0, spawnQ: [], foes: [], towers: [], projs: [], parts: [], nums: [], place: null, ghost: null, sel: null, over: false, paused: false, boss: null, kills: 0, hpMul: L.hp, fac: facNow(), efac: L.efac, teamDmg: 1, teamSpd: 0, shieldT: 0, denHitT: 0, denT: 0 });
  G.shield = G.fac === 'ciber' ? PASSIVES.ciber.amt : 0; BG = bgOf(G.fac);
  BLOCK.fill(0); reflow();
  hidePanel(); showScreen(null); buildTray(); hud(); $('#lvl-name').textContent = `${L.id} · ${L.name}`;
  banner(`${L.id} · ${L.name.toUpperCase()}`);
}
const FAC_NAME = f => (f && FACTIONS[f] ? (FACTIONS[f].los || 'los ' + FACTIONS[f].name) : '');
// elegir raza: todas están disponibles desde el principio
const facNow = () => (TOWERS[SAVE.fac] ? SAVE.fac : 'animales');
const BGS = {}, bgOf = f => BGS[f] || (BGS[f] = buildTDBackground(f));
/* ---------- botones ---------- */
$('#btn-wave').onclick = () => { if (G.vs) vsView(G.vs.view === 'me' ? 'ai' : 'me'); else { startWave(); hud(); } };
$('#btn-mode').onclick = () => { if (G.vs.view !== 'me') vsView('me'); G.trayMode = G.trayMode === 'send' ? 'build' : 'send'; G.place = null; G.ghost = null; buildTray(); hud(); };
$('#btn-speed').onclick = () => { G.speed = G.speed === 1 ? 2 : 1; if (G.speed === 2) stat('speed2', 1); hud(); };
const soundBtns = () => { for (const b of document.querySelectorAll('.btn-sound')) { b.textContent = SAVE.muted ? '🔇' : '🔊'; b.setAttribute('aria-label', SAVE.muted ? 'Activar sonido' : 'Silenciar sonido'); } };
for (const b of document.querySelectorAll('.btn-sound')) b.onclick = () => { SAVE.muted = !SAVE.muted; if (SAVE.muted) stat('mute', 1); audioInit(); applyVolume(); saveGame(); soundBtns(); };

/* ---------- arranque ---------- */
let last = performance.now(), hudT = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (G.screen === 'play' && !G.paused && !G.over) { const steps = G.speed; for (let i = 0; i < steps && !G.over; i++) (G.vs ? vsUpdate : update)(dt); }
  else if (G.screen === 'play' && G.over) { const d2 = dt; for (const q of G.parts) { q.t += d2; } G.parts = G.parts.filter(q => q.t < q.life); for (const n of G.nums) { n.t += d2; n.y -= d2 * 28; } G.nums = G.nums.filter(n => n.t < n.life); }
  draw(); idleFrame(dt);   // horas extra: su escena solo se mueve mientras se ve el menú
  if (G.placeT > 0) { G.placeT -= dt; if (G.placeT <= 0 && G.place) { G.place = null; G.ghost = null; if (G.screen === 'play') refreshTray(); } }
  hudT -= dt; if (G.screen === 'play' && hudT <= 0) { hudT = 0.1; hud(); }
  requestAnimationFrame(frame);
}
async function boot() {
  try { await Promise.race([document.fonts.load('20px "Luckiest Guy"'), new Promise(r => setTimeout(r, 2500))]); } catch (e) { /* fuente por defecto */ }
  buildSprites(); BG = bgOf('animales');
  for (const b of document.querySelectorAll('[data-fac]')) drawArt(b.querySelector('canvas'), FACTIONS[b.dataset.fac].leader, 56, 44);   // los retratos, otra vez: ahora con las letras ya cargadas
  fit(); addEventListener('resize', fit); soundBtns();
  showMenu();
  window.__TD = { G, TOWERS, vsUpgrade, cardMods, startVS, vsUpdate, vsSend, vsView, fuse, fuseMate, startLevel, startWave, build, sell, upgrade, update, canPlace, whyNot, flow, BLOCK, ENTRY, WORLDS_TD, SAVE, get DIST() { return DIST; } };   // para las pruebas automáticas
  requestAnimationFrame(frame);
}
// boot() se llama al final de js/extras.js, el último archivo del juego
