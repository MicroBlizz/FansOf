// Fans of Rumble · Arena: las ligas (copas del PvP) y la pestaña ENTRENAMIENTO (rivales de la CPU, sin copas)
'use strict';
/* ---------- v0.9.20: arena ----------
   v0.9.109: la ARENA tiene una sola puerta y dos pestañas (boceto A, elegido por Daniel el 9-10-2026):
   · CONTRA JUGADORES: el PvP de verdad (19e-pvp-pantallas.js). Las copas son los puntos del PvP que guarda el servidor (empiezan en 1000)
     y de ellas sale la liga: Becario, Junior, Senior, Director y CEO.
   · ENTRENAMIENTO (este archivo): tu mazo contra 3 «jugadores» inventados que maneja la CPU. No mueve copas: da oro y cuenta para las misiones.
   Los rivales salen con el nivel medio de tu facción: un nivel menos, el tuyo y uno más.
   Facción y mazo van en una fila pequeña: FACCIÓN abre la lista compacta y MAZO el editor de la Colección (openDeck con vuelta a esta pantalla). */
const ARENA = {
  leagues: [['Becario', 0], ['Junior', 1050], ['Senior', 1150], ['Director', 1300], ['CEO', 1500]],   // copas del PvP (el servidor empieza en 1000)
  colors: ['#c08a5a', '#cdd3e0', '#ffcb3d', '#b98aff', '#ff7e8a'],   // el escudo de cada liga: bronce, plata, oro, violeta y coral
  oro: 60, oroPerder: 10,   // lo que da el entrenamiento
  names: ['xX_Noob_Xx', 'ElQuePagaTodo', 'BallenaDorada', 'SinSueño_Dev', 'MamáDelStreamer', 'PatataLag', 'ProDeLaTarde', 'CEO_Secreto', 'BecarioFurioso', 'RageQuitter',
    'ElDelParche', 'DiscoFísicoYa', 'TiradaX50', 'NerfConejo', 'ModoBallena', 'JugadorDeLunes', 'LagEnMiCasa', 'MeLoHeComprado', 'SoloÉpicas', 'GatoTeclista',
    'SuscriptorPlus', 'ElDeLasLoot', 'NoTengoPase', 'CrunchMaster', 'AbuelaGamer', 'TryHard3000', 'ElDeMicroblizz', 'PayStationFan', 'ReviewBomber', 'SinDiscos'],
};
const ARENA_TAG = [['FÁCIL', 'fa'], ['IGUALADO', 'ig'], ['DIFÍCIL', 'di']];   // los rivales salen ordenados: un nivel menos, el tuyo y uno más
const ARENA_ROBOT = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="13" rx="3" fill="#5fd0c5" stroke="#20102c" stroke-width="2"/><circle cx="9.5" cy="12.5" r="1.8" fill="#20102c"/><circle cx="14.5" cy="12.5" r="1.8" fill="#20102c"/><path d="M12 6V3" stroke="#20102c" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="2.5" r="1.5" fill="#ffcb3d" stroke="#20102c" stroke-width="1.5"/></svg>';
const arenaFacs = () => FACTION_ORDER.filter(f => FACTIONS[f].leader);
function arenaState() {
  const A = SAVE.arena || (SAVE.arena = { cups: 0, best: 0, w: 0, l: 0, rivals: null, sel: 0 });   // cups y best: lo que quedó de la arena antigua (ya no cambian)
  if (!A.rivals || A.rivals.length !== 3) { A.rivals = arenaRoll(); A.sel = 0; }
  if (A.streak == null) A.streak = 0;
  return A;
}
function arenaLeague(c) { let L = ARENA.leagues[0]; for (const l of ARENA.leagues) if (c >= l[1]) L = l; return L[0]; }
const arenaLeagueIdx = c => ARENA.leagues.findIndex(l => l[0] === arenaLeague(c));
function arenaRoll() {
  const base = clamp(avgLevel(G.faction), 1, 12), used = new Set();
  return [-1, 0, 1].map(d => {
    let n; do n = pick(ARENA.names); while (used.has(n)); used.add(n);
    const f = pick(arenaFacs()), F = FACTIONS[f], pool = F.units.concat(F.gacha || []);
    let sp = 0; const deck = pool.slice().sort(() => Math.random() - 0.5).filter(k => !isSpell(k) || ++sp <= DECK_SPELLS).slice(0, 6);
    return { name: n + (Math.random() < 0.5 ? Math.floor(rand(1, 99)) : ''), fac: f, lvl: clamp(base + d, 1, 12), deck };
  });
}
// el escudo de la liga: su color y su número (I a V)
function arenaShield(i) {
  const c = ARENA.colors[i] || ARENA.colors[0];
  return `<span class="ar-shield"><svg viewBox="0 0 100 116" aria-hidden="true"><path d="M50 4 L92 18 V58 C92 86 72 104 50 112 C28 104 8 86 8 58 V18 Z" fill="${c}" stroke="#20102c" stroke-width="6"/><path d="M50 14 L82 25 V58 C82 80 67 95 50 101 C33 95 18 80 18 58 V25 Z" fill="rgba(20,8,34,.35)"/><path d="M30 30 L38 22 L50 32 L62 22 L70 30 L66 42 H34 Z" fill="#ffcb3d" stroke="#20102c" stroke-width="3"/></svg><b class="ol">${['I', 'II', 'III', 'IV', 'V'][i] || ''}</b></span>`;
}
// la barra hasta la siguiente liga
function arenaBar(copas, li) {
  const L = ARENA.leagues[li], N = ARENA.leagues[li + 1];
  if (!N) return `<div class="ar-bar"><i style="width:100%"></i><span class="ol">LIGA MÁXIMA</span></div>`;
  const lo = li ? L[1] : Math.min(copas, 1000), hi = N[1], pct = clamp((copas - lo) / Math.max(1, hi - lo), 0, 1) * 100;   // en Becario la barra cuenta desde las 1000 con las que empiezas
  return `<div class="ar-bar"><i style="width:${pct}%"></i><span class="ol">${fmt(copas)} / ${fmt(hi)} → ${N[0].toUpperCase()}</span></div>`;
}
// la fila pequeña de tu facción y tu mazo (la usan las dos pestañas)
function arenaFacFila(f, deck, abierta, pre) {
  const F = FACTIONS[f];
  return `<div class="ar-fac"><canvas data-${pre}l="${F.leader}" data-mini="1"></canvas><span class="ar-fn"><b class="ol">${F.name}</b><small>${F.passive}</small></span>`
    + `<span class="ar-deck">${deck.map(k => `<i class="${isSpell(k) ? 'sp' : ''}"><canvas data-${pre}d="${k}"></canvas></i>`).join('')}</span>`
    + `<span class="ar-btns"><button class="chip-btn ol" data-ar-fac>${abierta ? 'LISTO' : 'FACCIÓN'}</button><button class="chip-btn ol" data-ar-mazo>MAZO</button></span></div>`;
}
function arenaFacArte(caja, pre) {
  for (const cv of caja.querySelectorAll(`canvas[data-${pre}l]`)) drawArt(cv, cv.dataset[pre + 'l'], 44, 38);
  for (const cv of caja.querySelectorAll(`canvas[data-${pre}d]`)) drawArt(cv, cv.dataset[pre + 'd'], 24, 22);
}

/* ---------- las dos pestañas ---------- */
function arenaTabs(cual) {
  const pvpOk = typeof pvpDisponible === 'function' && pvpDisponible();
  const html = `<div class="ar-tabs-in" role="tablist" aria-label="Tipo de rival">`
    + `<button class="ar-tab pvp" role="tab" data-at="pvp" aria-selected="${cual === 'pvp'}"${pvpOk ? '' : ' aria-disabled="true"'}><b class="ol">CONTRA JUGADORES</b><small><i class="ar-vivo"></i>PvP en directo · cuenta para tu liga</small></button>`
    + `<button class="ar-tab cpu" role="tab" data-at="cpu" aria-selected="${cual === 'cpu'}"><b class="ol">ENTRENAMIENTO</b><small>contra la CPU · sin cuenta</small></button></div>`;
  for (const c of document.querySelectorAll(cual === 'pvp' ? '#scr-pvp [data-ar-tabs]' : '#scr-prep [data-ar-tabs]')) {   // cada pantalla pinta las suyas
    c.innerHTML = html;
    for (const b of c.querySelectorAll('[data-at]')) b.onclick = () => arenaIr(b.dataset.at);
  }
}
// abrir la arena en una pestaña (sin decirla: la última que usaste; si el PvP está cerrado, el entrenamiento)
function arenaIr(cual) {
  const pvpOk = typeof pvpDisponible === 'function' && pvpDisponible();
  cual = cual || SAVE.arenaTab || (pvpOk ? 'pvp' : 'cpu');
  if (cual === 'pvp' && !pvpOk) {
    if ($('#scr-title').hidden) { const m = NUCLEO.flagMensaje('pvp-estandar'); toast(m || 'El PvP está cerrado ahora mismo', true); play('deny'); return; }
    cual = 'cpu';
  }
  const ya = cual === 'pvp' ? !$('#scr-pvp').hidden : !$('#scr-prep').hidden && G.prep && G.prep.mode === 'arena';
  if (ya) return;
  play('select'); SAVE.arenaTab = cual; saveGame();
  if (cual === 'pvp') pvpPantalla(); else { if (typeof pvpPara === 'function') pvpPara(); openPrep('arena'); }
}

/* ---------- ENTRENAMIENTO ---------- */
function buildArenaPrep() {
  const A = arenaState(), F = FACTIONS[G.faction], abierta = $('#scr-prep').classList.contains('fac-abierta');
  arenaTabs('cpu');
  const card = (r, i) => { const R = FACTIONS[r.fac], T = ARENA_TAG[i] || ARENA_TAG[1];
    return `<button class="ar-r${A.sel === i ? ' on' : ''}" data-ar="${i}" aria-pressed="${A.sel === i}"><span class="ar-tag ${T[1]}">${T[0]}</span><span class="ar-cpu">CPU</span><canvas data-arl="${R.leader}"></canvas><b class="ol">${r.name}</b><small>${R.name}</small><small>Nivel ${r.lvl}</small></button>`; };
  const pvpOk = typeof pvpDisponible === 'function' && pvpDisponible();
  $('#prep-info').innerHTML = `<div class="ar-train">${ARENA_ROBOT}<span><b class="ol">PRACTICA SIN PRESIÓN</b><small>Rivales de la CPU. Tus copas no cambian. Ganas oro y avanzas en las misiones. Sin internet y sin cuenta.</small></span></div>`
    + `<div class="ar-lbl ol">ELIGE RIVAL</div><div class="ar-list">${A.rivals.map(card).join('')}</div>`
    + `<div class="ar-mid"><button class="btn-link" id="btn-ar-roll">Otros rivales</button>${A.streak >= 2 ? `<span class="ar-streak">${FLAME_SVG}Racha ${A.streak}</span>` : ''}</div>`
    + `<div class="ar-prize"><span>Si ganas: <b>${ARENA.oro} de oro · cuenta para las misiones</b></span><span class="lose">Si pierdes: ${ARENA.oroPerder} de oro</span></div>`
    + arenaFacFila(G.faction, deckOf(G.faction), abierta, 'ar')
    + (pvpOk ? `<div class="ar-al-pvp">${CROWN_SVG}<span>¿Listo para subir de liga? Las copas solo se ganan en <button class="btn-link" data-at="pvp">Contra jugadores</button>.</span></div>` : '');
  for (const cv of document.querySelectorAll('#prep-info canvas[data-arl]:not([data-mini])')) drawArt(cv, cv.dataset.arl, 74, 64);
  arenaFacArte($('#prep-info'), 'ar');
  for (const b of document.querySelectorAll('[data-ar]')) b.onclick = () => { A.sel = +b.dataset.ar; saveGame(); play('select'); buildArenaPrep(); };
  for (const b of document.querySelectorAll('#prep-info [data-at]')) b.onclick = () => arenaIr(b.dataset.at);
  $('#btn-ar-roll').onclick = () => { A.rivals = arenaRoll(); A.sel = 0; saveGame(); play('select'); buildArenaPrep(); };
  $('#prep-info [data-ar-fac]').onclick = () => { play('select'); $('#scr-prep').classList.toggle('fac-abierta'); buildArenaPrep(); };
  $('#prep-info [data-ar-mazo]').onclick = () => { play('select'); openDeck(G.faction, 'scr-prep'); };   // v0.9.37: el editor de mazo de la Colección; al GUARDAR vuelve aquí
  const r = A.rivals[A.sel] || A.rivals[0];
  $('#btn-play').innerHTML = `ENTRENAR<small>contra ${esc(r.name)}</small>`;
}
function arenaSetup() {
  const A = arenaState(), r = A.rivals[A.sel] || A.rivals[0];
  G.arenaRival = r; G.efac = r.fac; G.elvl = r.lvl; G.bossOn = false; G.bossName = ''; G.ebaseName = r.name.toUpperCase();
  G.diffCfg = Object.assign({}, CFG.diff.normal, { aiIncome: 1, think: [0.6, 1.2] }); G.arenaDeck = r.deck.filter(k => !isSpell(k)); G.arenaSpells = r.deck.filter(isSpell);   // la CPU lanza los hechizos aparte, como en el resto de modos
}
function arenaReward(R, w) {
  const A = arenaState(), win = w === 'p';
  if (win) { A.w++; A.streak++; } else if (w === 'e') { A.l++; A.streak = 0; }
  R.gold = win ? ARENA.oro : ARENA.oroPerder;
  if (win) missionEvent('arenawin', 1); missionEvent('arena', 1);
  A.rivals = arenaRoll(); A.sel = 0;
}
$('#btn-arena').addEventListener('click', () => arenaIr());
hook('pantalla', id => { if (id === 'scr-prep' && G.prep && G.prep.mode === 'arena') buildArenaPrep(); });   // v0.9.37: al volver del mazo
