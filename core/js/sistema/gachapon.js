// Fans Of · GASHAPÓN: la máquina de cápsulas. Dos máquinas comunes (habilidades y equipo), tiradas x1, x10 y x50,
// rarezas con garantía y una calidad distinta para cada copia. Los números están en ECON (odds, pity…).
//
// Un juego puede añadir máquinas propias en MAQUINAS (y su pestaña en el HTML, con data-gt="su-nombre"):
//   MAQUINAS.cd = { nombre: 'CARTAS', maquina: [tres colores], colores: {rareza: [nombre, claro, oscuro]},
//                   tirar(seguro) -> { rar, … }, ensenar(lista), textos(), verEn() }
// y enganchar: 'gacha.abierto' al entrar · 'gacha.textos' al escribir los textos · 'gacha.tirada' (n) después de tirar.
'use strict';
const MAQUINAS = {};
const rarOfPull = r => (r.it ? defOf(r.it).rar : r.rar);   // la rareza de lo que ha salido, sea una copia o lo que dé otra máquina
let gachaTab = 'ab', gachaAnim = null, gachaRAF = 0;
function rollRarity(kind, force) {
  const P = SAVE.pity, pk = kind, pl = kind + 'L'; P[pk] = (P[pk] || 0) + 1; P[pl] = (P[pl] || 0) + 1;
  let r = 'common';
  if (P[pl] >= ECON.pityLeg) r = 'legendary';
  else if (force || P[pk] >= ECON.pityEpic) r = Math.random() < ECON.odds.legendary / (ECON.odds.legendary + ECON.odds.epic) ? 'legendary' : 'epic';
  else { let x = Math.random() * 100; for (const k of ['legendary', 'epic', 'rare']) { if (x < ECON.odds[k]) { r = k; break; } x -= ECON.odds[k]; } }
  if (r === 'epic' || r === 'legendary') P[pk] = 0;
  if (r === 'legendary') P[pl] = 0;
  return r;
}
// v0.9.10: tiradas x1, x10 y x50. Primero se gastan las tiradas gratis; cada tirada cuenta para las garantías
function onePull(kind, force) {
  const rar = rollRarity(kind, force), DB = kind === 'ab' ? ABILITIES : ITEMS, fp = kind === 'eq' ? Object.keys(DB).filter(k => DB[k].rar === rar && !DB[k].pass && DB[k].fac && isUnlocked(DB[k].fac)) : [];
  const pool = fp.length && Math.random() < 0.5 ? fp : Object.keys(DB).filter(k => DB[k].rar === rar && !DB[k].pass && (kind === 'ab' || !DB[k].fac));   // v0.9.15: objetos de facción
  const id = pick(pool), prev = bestCopy(kind, id), nPrev = SAVE.inv.filter(x => x.k === kind && x.id === id).length;
  const P = SAVE.pity, qk = 'q' + kind; P[qk] = (P[qk] || 0) + 1;
  const it = newCopy(kind, id, P[qk] >= ECON.pityQ ? 3 : 0), tq = tierOf(avgQ(it)); if (tq >= 3) P[qk] = 0;
  const pn = prev && QTIERS[tierOf(avgQ(prev))].name, better = !!prev && avgQ(it) > avgQ(prev);
  const tag = tq === 4 ? '¡CALIDAD PERFECTA!' : !prev ? (kind === 'ab' ? '¡NUEVA!' : '¡NUEVO!') : better ? `¡TU MEJOR COPIA! (la anterior era ${pn})` : `Copia n.º ${nPrev + 1} · tu mejor copia sigue siendo ${pn}`;
  return { it, tag, isNew: !prev, better };
}
function pullCost(n) { const free = Math.min(SAVE.tickets || 0, n); return { free, gems: (n - free) * ECON.pull }; }
function pull(n) {
  n = n || 1; if (gachaAnim) return;
  const c = pullCost(n);
  if (SAVE.gems < c.gems) { play('deny'); confirmBox('FALTAN GEMAS', `Para girar x${n} te faltan <b>${fmt(c.gems - SAVE.gems)} gemas</b>.<small>Las consigues con misiones, la campaña, el pase de batalla o en la tienda.</small>`, 'IR A LA TIENDA', () => openShop('gems')); return; }
  ECO.gastar('gachapon', { tickets: c.free, gems: c.gems });
  audioInit();
  // v0.9.11: cada bloque de 10 tiradas trae al menos una épica (o legendaria)
  const kind = gachaTab, X = MAQUINAS[kind], res = []; let gotEpic = false;
  for (let i = 0; i < n; i++) {
    if (i % 10 === 0) gotEpic = false;
    const seguro = n >= 10 && i % 10 === 9 && !gotEpic, r = X ? X.tirar(seguro) : onePull(kind, seguro), rr = rarOfPull(r);
    if (rr === 'epic' || rr === 'legendary') gotEpic = true;
    res.push(r);
  }
  missionEvent('pull', n); if (n >= 50) stat('x50', 1); if (n === 10) stat('x10', 1);
  for (const r of res) { const rr = rarOfPull(r); if (rr === 'legendary') stat('leg', 1); else if (rr === 'epic') stat('epic', 1); }
  if (c.gems > 0 && SAVE.gems === 0) stat('broke', 1);
  saveGame(); updateWallets(); buildGachaText();
  fire('gacha.tirada', n);
  const cv = $('#gacha-cv'); cv.classList.remove('shake'); void cv.offsetWidth; cv.classList.add('shake'); play('roll');
  const top = res.reduce((a, r) => (RAR_ORDER[rarOfPull(r)] < RAR_ORDER[rarOfPull(a)] ? r : a));
  gachaAnim = { t: 0, col: (X ? X.colores : RARITY)[rarOfPull(top)][1] };
  setTimeout(() => { gachaAnim = null; if (X) X.ensenar(res); else if (n === 1) showPull(res[0].it, res[0].tag); else showMulti(res); }, 1100);
}
const RAR_PL = { common: ['común', 'comunes'], rare: ['rara', 'raras'], epic: ['épica', 'épicas'], legendary: ['legendaria', 'legendarias'] };
function showMulti(res) {
  const card = $('#gr-card'), top = res.reduce((a, r) => (RAR_ORDER[defOf(r.it).rar] < RAR_ORDER[defOf(a.it).rar] ? r : a)), R = RARITY[defOf(top.it).rar];
  card.classList.add('multi'); card.style.setProperty('--rc1', R[1]); card.style.setProperty('--rc2', R[2]);
  const cnt = r => res.filter(x => defOf(x.it).rar === r).length, good = res.filter(x => tierOf(avgQ(x.it)) >= 3).length, news = res.filter(x => x.isNew).length;
  const sum = ['legendary', 'epic', 'rare', 'common'].filter(r => cnt(r)).map(r => `${cnt(r)} ${RAR_PL[r][cnt(r) > 1 ? 1 : 0]}`).join(' · ');
  const order = res.slice().sort((a, b) => RAR_ORDER[defOf(a.it).rar] - RAR_ORDER[defOf(b.it).rar] || avgQ(b.it) - avgQ(a.it));
  card.innerHTML = `<div class="gr-rar ol">TIRADA x${res.length}</div><div class="gr-sum">${sum}${good ? ` · <b>${good} Director (excelente) o mejor</b>` : ''}${news ? ` · ${news} ${news > 1 ? 'nuevas' : 'nueva'}` : ''}</div><div class="gr-grid">${order.map(r => {
    const D = defOf(r.it), RR = RARITY[D.rar], T = QTIERS[tierOf(avgQ(r.it))], nw = r.it.k === 'ab' ? 'NUEVA' : 'NUEVO';
    return `<button class="gt" data-gu="${r.it.u}" style="--rc:${RR[1]};--rc2:${RR[2]};--qc:${T.col}" aria-label="${D.name}, ${RR[0]}, calidad ${T.name}"><span class="gt-ic">${r.it.k === 'ab' ? D.ic : SLOT_SVG[D.slot]}</span><span class="gt-name">${D.name}</span><span class="gt-q ol">${T.name}</span>${r.isNew ? `<span class="gt-new ol">${nw}</span>` : r.better ? '<span class="gt-new best ol">MEJOR</span>' : ''}</button>`;
  }).join('')}</div><small class="gr-hint">Toca una para ver sus números. Las que no quieras, despídelas en el inventario.</small>`;
  for (const b of card.querySelectorAll('[data-gu]')) b.onclick = () => { play('select'); openItem(b.dataset.gu); };
  $('#gacha-result').hidden = false;
  play(res.some(x => tierOf(avgQ(x.it)) >= 3 || defOf(x.it).rar === 'legendary' || defOf(x.it).rar === 'epic') ? 'win' : 'levelup');
}
function addCopy(k, id, q) { const it = { u: 'i' + (++SAVE.invSeq), k, id, q }; SAVE.inv.push(it); return it; }
function newCopy(k, id, minTier) { const n = Math.max(1, statsOf({ k, id }).length), it = addCopy(k, id, Array.from({ length: n }, () => rollQ(minTier))); if (tierOf(avgQ(it)) === 4) stat('perfect', 1); return it; }
function bestCopy(k, id) { let b = null; for (const it of SAVE.inv) if (it.k === k && it.id === id && (!b || avgQ(it) > avgQ(b))) b = it; return b; }
function showPull(it, tag) {
  const D = defOf(it), kind = it.k, R = RARITY[D.rar], T = QTIERS[tierOf(avgQ(it))], card = $('#gr-card');
  card.classList.remove('multi'); card.style.setProperty('--rc1', R[1]); card.style.setProperty('--rc2', R[2]);
  card.innerHTML = `<div class="gr-rar ol">${R[0].toUpperCase()}${kind === 'eq' ? ' · ' + SLOTS[D.slot].toUpperCase() : ''}</div><div class="gr-ic">${kind === 'ab' ? D.ic : SLOT_SVG[D.slot]}</div><div class="gr-name ol">${D.name}</div><div class="gr-q ol" style="--qc:${T.col}">CALIDAD ${T.name.toUpperCase()} · ${Math.round(avgQ(it) * 100)} %</div><div class="gr-desc">${descOf(it)}<br><small class="rg">${rangeTxt(it)}</small>${kind === 'ab' && D.fac ? '<br><small>Viene de los ' + FACTIONS[D.fac].name + '</small>' : ''}</div><span class="gr-tag">${tag}</span>`;
  $('#gacha-result').hidden = false; play(tierOf(avgQ(it)) >= 3 || D.rar === 'legendary' || D.rar === 'epic' ? 'win' : 'levelup');
}
function buildGachaText() {
  for (const b of document.querySelectorAll('[data-gt]')) b.setAttribute('aria-pressed', String(b.dataset.gt === gachaTab));
  $('#btn-gr-inv').textContent = 'Ver en el inventario';
  $('#gacha-sub').textContent = gachaTab === 'ab' ? 'Habilidades de cualquier facción para tus cartas. Cada copia sale con su propia calidad, de Becario (básica) a CEO (perfecta): búscale la mejor.' : 'Equipo freak solo para los líderes: arma, cabeza y accesorio. Cada objeto sale con su propia calidad y se ve puesto en la partida.';
  const lab = n => { const c = pullCost(n); return c.gems ? `${fmt(c.gems)} ${GEM_SVG}${c.free ? `<i class="fr">+${c.free} gratis</i>` : ''}` : `${TICKET_SVG} gratis`; };
  for (const b of document.querySelectorAll('[data-pull]')) { const n = +b.dataset.pull; b.innerHTML = `${n === 10 ? '<span class="tag">FAVORITA DEL CEO</span>' : n === 50 ? '<span class="tag">MODO BALLENA</span>' : ''}x${n}<small>${lab(n)}</small>${n >= 10 ? `<span class="sure">${n === 10 ? '1 épica segura' : n / 10 + ' épicas seguras'}</span>` : ''}`; }
  const P = SAVE.pity, O = ECON.odds;
  $('#gacha-odds').textContent = `Probabilidades: común ${O.common} %, rara ${O.rare} %, épica ${O.epic} %, legendaria ${O.legendary} %. Calidad de cada efecto (del 50 % al 150 % de su valor): ${QTIERS.map(t => t.name + ' ' + t.p + ' %').join(', ')}. Garantías: épica o mejor como mucho cada ${ECON.pityEpic} tiradas (llevas ${P[gachaTab] || 0}), legendaria a las ${ECON.pityLeg} (llevas ${P[gachaTab + 'L'] || 0}) y calidad Director (excelente) o mejor cada ${ECON.pityQ} (llevas ${P['q' + gachaTab] || 0}). Las tiradas x10 y x50 traen al menos una épica o legendaria por cada 10. Cada tirada cuesta ${ECON.pull} gemas (unos 0,50 € si compras el pack pequeño de gemas). Microblizz no se hace responsable de tu afición a las cápsulas.`;
  if (MAQUINAS[gachaTab]) MAQUINAS[gachaTab].textos();
  fire('gacha.textos');
}
function drawGacha() {
  const cv = $('#gacha-cv'); if (!cv || $('#scr-gacha').hidden) { gachaRAF = 0; return; }
  const LW = 270, LH = 300, R2 = 2; if (cv.width !== LW * R2) { cv.width = LW * R2; cv.height = LH * R2; }
  const c = cv.getContext('2d'); c.setTransform(R2, 0, 0, R2, 0, 0); c.clearRect(0, 0, LW, LH); c.lineJoin = 'round'; c.lineCap = 'round';
  const t = performance.now() / 1000, an = gachaAnim; if (an) an.t += 1 / 60;
  const X = MAQUINAS[gachaTab], MC = X ? X.maquina : ['#2e6fd8', '#1d3f8a', '#173d8f'];
  shape(c, el(135, 288, 100, 9), 'rgba(0,0,0,.3)', 0);
  shape(c, rr(48, 176, 174, 108, 14), MC[0], 2.6);
  shape(c, rr(56, 184, 158, 26, 8), MC[1], 2);
  txt(c, X ? X.nombre : gachaTab === 'ab' ? 'HABILIDADES' : 'EQUIPO', 135, 198, 15, '#e8f1ff');
  shape(c, rr(74, 222, 44, 44, 8), MC[2], 2.2); shape(c, rr(84, 236, 24, 22, 4), '#0b1a3f', 1.6);
  const rot = an ? an.t * 9 : 0; c.save(); c.translate(172, 244); c.rotate(rot);
  shape(c, el(0, 0, 19, 19), '#ffcb3d', 2.4); shape(c, rr(-15, -4, 30, 8, 3), '#e0a92a', 1.8); c.restore();
  shape(c, rr(150, 214, 44, 10, 3), '#0b1a3f', 1.4);
  txt(c, 'MICROBLIZZ', 135, 276, 10, '#bfe0ff');
  if (an) { const k = Math.min(1, an.t / 0.8), y = 160 + k * 88; shape(c, el(96, y, 10, 10), an.col, 2); shape(c, c2 => c2.arc(96, y, 10, Math.PI, 0), '#fff', 1.6); }
  shape(c, rr(108, 160, 54, 20, 6), MC[0], 2.2);
  c.save(); c.beginPath(); c.arc(135, 92, 82, 0, Math.PI * 2); c.clip();
  c.fillStyle = 'rgba(190,230,255,.35)'; c.fillRect(40, 0, 200, 200);
  const cols = ['#ff5fa8', '#ffe14d', '#7be04a', '#63cfe0', '#d08cff', '#ffb04f'];
  for (let i = 0; i < 22; i++) { const a = i * 2.39, rr2 = 18 + (i % 6) * 10, x = 135 + Math.cos(a) * rr2 + (an ? Math.sin(t * 30 + i) * 3 : 0), y = 120 + Math.sin(a) * rr2 * 0.55 + (i % 3) * 10 - 10 + (an ? Math.cos(t * 28 + i) * 3 : 0);
    shape(c, el(x, y, 12, 12), cols[i % 6], 1.8); shape(c, c2 => c2.arc(x, y, 12, Math.PI, 0), 'rgba(255,255,255,.85)', 1.6); }
  c.restore();
  c.beginPath(); c.arc(135, 92, 82, 0, Math.PI * 2); c.lineWidth = 4; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.arc(112, 62, 30, Math.PI * 1.1, Math.PI * 1.45); c.lineWidth = 6; c.strokeStyle = 'rgba(255,255,255,.6)'; c.stroke();
  shape(c, rr(100, 2, 70, 18, 7), MC[0], 2.4);
  gachaRAF = requestAnimationFrame(drawGacha);
}
function openGacha() { buildGachaText(); show('scr-gacha'); fire('gacha.abierto'); $('#gacha-result').hidden = true; if (!gachaRAF) gachaRAF = requestAnimationFrame(drawGacha); }
for (const b of document.querySelectorAll('[data-gt]')) b.addEventListener('click', () => { gachaTab = b.dataset.gt; play('select'); buildGachaText(); });
for (const b of document.querySelectorAll('[data-pull]')) b.addEventListener('click', () => pull(+b.dataset.pull));
$('#btn-gacha').addEventListener('click', () => { play('select'); updateWallets(); openGacha(); });
$('#btn-gr-ok').addEventListener('click', () => { $('#gacha-result').hidden = true; });
$('#btn-gr-inv').addEventListener('click', () => { $('#gacha-result').hidden = true; play('select'); const X = MAQUINAS[gachaTab]; if (X) X.verEn(); else openInv(gachaTab); });
