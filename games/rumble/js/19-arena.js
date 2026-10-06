// Fans of Rumble · Arena sin internet: «jugadores» inventados, copas y ligas
'use strict';
/* ---------- v0.9.20: arena ----------
   Hasta que haya servidor, la arena enfrenta tu mazo a mazos de «jugadores» inventados (los maneja la CPU).
   · Eliges uno de 3 rivales. Cuantas más copas tienes, más nivel tienen.
   · Ganar: +copas, oro y gemas. Perder: -copas.
   · Ligas: Becario, Junior, Senior, Director y CEO. Se guarda tu récord.
   v0.9.35: pantalla nueva (boceto A, elegido por Daniel). Lo principal arriba: la liga en grande, con su escudo, tus copas y
   la barra hasta la siguiente liga; debajo, los 3 rivales en tarjetas; luego lo que ganas o pierdes, y la facción en pequeño.
   · Racha: victorias seguidas (se ve a partir de 2).
   · Regalos del camino: cada vez que tu récord pasa por primera vez un múltiplo de ARENA.regaloCada copas, una tirada gratis. */
const ARENA = {
  leagues: [['Becario', 0], ['Junior', 200], ['Senior', 500], ['Director', 900], ['CEO', 1400]],
  colors: ['#c08a5a', '#cdd3e0', '#ffcb3d', '#b98aff', '#ff7e8a'],   // el escudo de cada liga: bronce, plata, oro, violeta y coral
  win: 25, lose: 12, gold: [60, 15], gems: 5, lvlEvery: 120,
  regaloCada: 100, regalo: 1,   // v0.9.35: tiradas gratis del gashapón por cada hito del camino
  names: ['xX_Noob_Xx', 'ElQuePagaTodo', 'BallenaDorada', 'SinSueño_Dev', 'MamáDelStreamer', 'PatataLag', 'ProDeLaTarde', 'CEO_Secreto', 'BecarioFurioso', 'RageQuitter',
    'ElDelParche', 'DiscoFísicoYa', 'TiradaX50', 'NerfConejo', 'ModoBallena', 'JugadorDeLunes', 'LagEnMiCasa', 'MeLoHeComprado', 'SoloÉpicas', 'GatoTeclista',
    'SuscriptorPlus', 'ElDeLasLoot', 'NoTengoPase', 'CrunchMaster', 'AbuelaGamer', 'TryHard3000', 'ElDeMicroblizz', 'PayStationFan', 'ReviewBomber', 'SinDiscos'],
};
const ARENA_TAG = [['FÁCIL', 'fa'], ['IGUALADO', 'ig'], ['DIFÍCIL', 'di']];   // los rivales salen ordenados: un nivel menos, el tuyo y uno más
const arenaFacs = () => FACTION_ORDER.filter(f => FACTIONS[f].leader);
function arenaState() {
  const A = SAVE.arena || (SAVE.arena = { cups: 0, best: 0, w: 0, l: 0, rivals: null, sel: 0 });
  if (!A.rivals || A.rivals.length !== 3) { A.rivals = arenaRoll(A.cups); A.sel = 0; }
  if (A.streak == null) A.streak = 0;
  if (A.hito == null) A.hito = Math.floor(A.best / ARENA.regaloCada) * ARENA.regaloCada;   // v0.9.35: los hitos que ya pasaste antes no se regalan otra vez
  return A;
}
function arenaLeague(c) { let L = ARENA.leagues[0]; for (const l of ARENA.leagues) if (c >= l[1]) L = l; return L[0]; }
function arenaRoll(cups) {
  const base = clamp(1 + Math.floor(cups / ARENA.lvlEvery), 1, 12), used = new Set();
  return [-1, 0, 1].map(d => {
    let n; do n = pick(ARENA.names); while (used.has(n)); used.add(n);
    const f = pick(arenaFacs()), F = FACTIONS[f], pool = F.units.concat(F.gacha || []);
    let sp = 0; const deck = pool.slice().sort(() => Math.random() - 0.5).filter(k => !isSpell(k) || ++sp <= DECK_SPELLS).slice(0, 6);
    return { name: n + (Math.random() < 0.5 ? Math.floor(rand(1, 99)) : ''), fac: f, lvl: clamp(base + d, 1, 12), deck, cups: Math.max(0, cups + d * 40 + Math.floor(rand(-30, 30))) };
  });
}
function arenaGold(lgName) { return ARENA.gold[0] + ARENA.gold[1] * ARENA.leagues.findIndex(l => l[0] === lgName); }
// el escudo de la liga: su color y su número (I a V)
function arenaShield(i) {
  const c = ARENA.colors[i] || ARENA.colors[0];
  return `<span class="ar-shield"><svg viewBox="0 0 100 116" aria-hidden="true"><path d="M50 4 L92 18 V58 C92 86 72 104 50 112 C28 104 8 86 8 58 V18 Z" fill="${c}" stroke="#20102c" stroke-width="6"/><path d="M50 14 L82 25 V58 C82 80 67 95 50 101 C33 95 18 80 18 58 V25 Z" fill="rgba(20,8,34,.35)"/><path d="M30 30 L38 22 L50 32 L62 22 L70 30 L66 42 H34 Z" fill="#ffcb3d" stroke="#20102c" stroke-width="3"/></svg><b class="ol">${['I', 'II', 'III', 'IV', 'V'][i] || ''}</b></span>`;
}
// la barra hasta la siguiente liga, con los regalos del camino que quedan dentro
function arenaBar(A, li) {
  const L = ARENA.leagues[li], N = ARENA.leagues[li + 1];
  if (!N) return `<div class="ar-bar"><i style="width:100%"></i><span class="ol">LIGA MÁXIMA</span></div>`;
  const lo = L[1], hi = N[1], pct = clamp((A.cups - lo) / (hi - lo), 0, 1) * 100;
  let marcas = '';
  for (let m = Math.ceil((lo + 1) / ARENA.regaloCada) * ARENA.regaloCada; m < hi; m += ARENA.regaloCada) {
    const hecho = A.hito >= m;
    marcas += `<span class="ar-gift${hecho ? ' ok' : ''}" style="left:${((m - lo) / (hi - lo)) * 100}%">${TICKET_SVG}<small>${fmt(m)}</small></span>`;
  }
  return `<div class="ar-bar"><i style="width:${pct}%"></i><span class="ol">${fmt(A.cups)} / ${fmt(hi)} → ${N[0].toUpperCase()}</span></div><div class="ar-road">${marcas}</div>`;
}
function buildArenaPrep() {
  const A = arenaState(), L = arenaLeague(A.cups), li = ARENA.leagues.findIndex(l => l[0] === L), F = FACTIONS[G.faction];
  const racha = A.streak >= 2 ? ` · <span class="ar-streak">${FLAME_SVG}Racha ${A.streak}</span>` : '';
  const card = (r, i) => { const R = FACTIONS[r.fac], T = ARENA_TAG[i] || ARENA_TAG[1];
    return `<button class="ar-r${A.sel === i ? ' on' : ''}" data-ar="${i}" aria-pressed="${A.sel === i}"><span class="ar-tag ${T[1]}">${T[0]}</span><canvas data-arl="${R.leader}"></canvas><b class="ol">${r.name}</b><small>${R.name}</small><small>Nivel ${r.lvl} · ${fmt(r.cups)} copas</small></button>`; };
  $('#prep-info').innerHTML = `<div class="ar-liga">${arenaShield(li)}<div class="ar-ld"><b class="ar-ln ol">LIGA ${L.toUpperCase()}</b><span class="ar-cups ol">${CROWN_SVG}${fmt(A.cups)} copas</span>`
    + `<span class="ar-meta">${esc(pname())} · Récord ${fmt(A.best)} · ${A.w} ganadas · ${A.l} perdidas${racha}</span>${arenaBar(A, li)}</div></div>`
    + `<div class="ar-lbl ol">ELIGE RIVAL</div><div class="ar-list">${A.rivals.map(card).join('')}</div>`
    + `<div class="ar-mid"><button class="btn-link" id="btn-ar-roll">Otros rivales</button><span class="ar-note">De momento son «jugadores» inventados: los maneja la CPU.</span></div>`
    + `<div class="ar-prize"><span>Si ganas: <b>+${ARENA.win} copas · ${arenaGold(L)} de oro · ${ARENA.gems} gemas</b></span><span class="lose">Si pierdes: −${ARENA.lose} copas</span></div>`
    + `<div class="ar-fac"><canvas data-arl="${F.leader}" data-mini="1"></canvas><span><b class="ol">${F.name}</b><small>${F.passive} · tu facción para esta partida</small></span><button class="chip-btn ol" id="btn-ar-fac">${$('#scr-prep').classList.contains('fac-abierta') ? 'LISTO' : 'CAMBIAR'}</button></div>`;
  for (const cv of document.querySelectorAll('#prep-info canvas[data-arl]')) { if (cv.dataset.mini) drawArt(cv, cv.dataset.arl, 44, 38); else drawArt(cv, cv.dataset.arl, 74, 64); }
  for (const b of document.querySelectorAll('[data-ar]')) b.onclick = () => { A.sel = +b.dataset.ar; saveGame(); play('select'); buildArenaPrep(); };
  $('#btn-ar-roll').onclick = () => { A.rivals = arenaRoll(A.cups); A.sel = 0; saveGame(); play('select'); buildArenaPrep(); };
  $('#btn-ar-fac').onclick = () => { play('select'); $('#scr-prep').classList.toggle('fac-abierta'); buildArenaPrep(); };
  const r = A.rivals[A.sel] || A.rivals[0];
  $('#btn-play').innerHTML = `BATALLA<small>contra ${esc(r.name)}</small>`;
}
function arenaSetup() {
  const A = arenaState(), r = A.rivals[A.sel] || A.rivals[0];
  G.arenaRival = r; G.efac = r.fac; G.elvl = r.lvl; G.bossOn = false; G.bossName = ''; G.ebaseName = r.name.toUpperCase();
  G.diffCfg = Object.assign({}, CFG.diff.normal, { aiIncome: 1, think: [0.6, 1.2] }); G.arenaDeck = r.deck.filter(k => !isSpell(k)); G.arenaSpells = r.deck.filter(isSpell);   // la CPU lanza los hechizos aparte, como en el resto de modos
}
function arenaReward(R, w) {
  const A = arenaState(), lg = arenaLeague(A.cups), win = w === 'p';
  const d = win ? ARENA.win + Math.max(0, (G.elvl - avgLevel(G.faction)) * 3) : w === 'e' ? -ARENA.lose : 0;
  A.cups = Math.max(0, A.cups + d); A.best = Math.max(A.best, A.cups); if (win) A.w++; else if (w === 'e') A.l++;
  if (win) A.streak++; else if (w === 'e') A.streak = 0;   // v0.9.35: racha de victorias
  R.gold = win ? arenaGold(lg) : 10; if (win) R.gems = ARENA.gems;
  R.arena = { d, cups: A.cups, league: arenaLeague(A.cups) };
  // v0.9.35: regalos del camino, una vez por hito de tu récord
  const hito = Math.floor(A.best / ARENA.regaloCada) * ARENA.regaloCada;
  if (hito > A.hito) { const n = ((hito - A.hito) / ARENA.regaloCada) * ARENA.regalo; A.hito = hito; SAVE.tickets = (SAVE.tickets || 0) + n; R.arena.regalo = n; }
  if (win) stat('arenawin', 1); stat('arena', 1);
  A.rivals = arenaRoll(A.cups); A.sel = 0;
}
$('#btn-arena').addEventListener('click', () => { play('select'); openPrep('arena'); });
