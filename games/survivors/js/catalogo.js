// Fans of Survivors · El catálogo de este juego: qué hace aquí cada habilidad y objeto de la serie (AJUSTES.fx, en js/ajustes.js),
// lo que suma una carta con lo que lleva (cardMods), lo que el progreso común le pregunta al juego y la partida guardada.
// Lo común (economía, calidades, guardar) está en core/js/sistema/progreso.js.
'use strict';
const STATS = AJUSTES.stats;
const ABILITIES = catalogo('ab', Object.fromEntries(Object.keys(CATALOGO.ab).map(id => [id, {}])));
const ITEMS = catalogo('eq', Object.fromEntries(Object.keys(CATALOGO.eq).map(id => [id, {}])));
// de cada «fx» salen st (los valores centrales que cambian con la calidad) y desc (el texto con {0}, {1}…)
for (const DB of [ABILITIES, ITEMS]) for (const id in DB) {
  const D = DB[id], partes = []; D.fx = AJUSTES.fx[id] || []; D.st = []; D.fi = [];
  D.fx.forEach(([st, c]) => {
    const [txt, , signed] = STATS[st], fijo = c <= 0;
    if (!fijo) { D.fi.push(D.st.length); D.st.push(c); } else D.fi.push(-1);
    partes.push((signed ? (c < 0 ? '−' : '+') : '') + txt.replace('{v}', fijo ? String(Math.abs(c)) : '{' + (D.st.length - 1) + '}'));
  });
  const todo = partes.length > 2 ? partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1] : partes.join(' y ');
  D.desc = partes.length ? todo.charAt(0).toUpperCase() + todo.slice(1) + '.' : 'No hace nada en este juego.';
}

/* ---------- las facciones de este juego ---------- */
// Animales Locos siempre está abierta; las demás se abren con los minutos aguantados en total (DESBLOQUEO, en datos-facciones.js)
const FAC_JUGABLES = ['animales', ...Object.keys(DESBLOQUEO)];
const minutosTotales = () => (SAVE.stats && SAVE.stats.minuto) || 0;
const isUnlocked = f => f === 'animales' || (f in DESBLOQUEO && minutosTotales() >= DESBLOQUEO[f]) || !!SAVE.testAll;
// la facción con la que juegas: la que elegiste, si sigue abierta
const facNow = () => (SAVE.fac && FAC_JUGABLES.includes(SAVE.fac) && isUnlocked(SAVE.fac) ? SAVE.fac : 'animales');
const armaDeFac = k => ARMAS[k].fac || 'animales';
const facOfCard = k => FACTION_ORDER.find(f => FACTIONS[f].leader === k || FACTIONS[f].units.includes(k));
// qué arma es cada carta (el líder dispara las Zanahorias y hace el Chaos Jump)
const ARMA_DE = {};
for (const k in ARMAS) if (!ARMA_DE[ARMAS[k].carta]) ARMA_DE[ARMAS[k].carta] = k;

/* ---------- lo que lleva una carta, sumado ---------- */
function cardMods(k) {
  const lvl = (SAVE.units[k] && SAVE.units[k].lvl) || 1, M = { lvl, lvlMul: 1 + ECON.lvlStep * (lvl - 1), n: 0, J: {} };
  const E = (isLeader(k) && SAVE.equip[facOfCard(k)]) || {};
  for (const it of [invGet(SAVE.abEquip[k]), ...Object.keys(SLOTS).map(sl => invGet(E[sl]))]) {
    if (!it) continue; const D = defOf(it), V = valsOf(it); M.n++;
    D.fx.forEach(([st, c], i) => { const v = D.fi[i] < 0 ? c : V[D.fi[i]]; M.J[st] = (M.J[st] || 0) + (STATS[st][1] ? v / 100 : v); });
  }
  return M;
}
// lo que llevas al empezar una partida: el líder mejora a todo; cada carta-arma, solo a su arma
function modsPartida() {
  const F = FACTIONS[facNow()], L = cardMods(F.leader), arma = {};
  for (const k of F.units) { const m = cardMods(k); arma[k] = { mul: m.lvlMul * (1 + (m.J.dmg || 0)), cd: m.J.cd || 0, area: m.J.area || 0, crit: m.J.crit || 0 }; }
  return { L, arma };
}

/* ---------- lo que la colección y las horas extra le preguntan al juego ---------- */
const pc = v => (v > 0 ? '+' : '−') + Math.abs(Math.round(v * 100)) + ' %';
function effStats(k) {
  const M = cardMods(k), b = [];
  if (M.J.dmg) b.push(pc(M.J.dmg) + ' de daño'); if (M.J.hp) b.push(pc(M.J.hp) + ' de vida'); if (M.J.speed) b.push(pc(M.J.speed) + ' de velocidad');
  if (M.J.cd) b.push(pc(M.J.cd) + ' de recarga'); if (M.J.area) b.push(pc(M.J.area) + ' de área');
  const extra = Object.keys(M.J).filter(s => !['dmg', 'hp', 'speed', 'cd', 'area'].includes(s)).length; if (extra) b.push(extra > 1 ? `${extra} efectos más` : '1 efecto más');
  return { M, boosts: b };
}
function cardStats(k, es) {
  const M = es.M;
  if (isLeader(k)) return `Vida ${Math.round(SV.jugador.vida * M.lvlMul * (1 + (M.J.hp || 0)))} · Daño de todas las armas ×${(M.lvlMul * (1 + (M.J.dmg || 0))).toFixed(2).replace('.', ',')}`;
  const a = ARMA_DE[k]; return a ? `Arma: ${ARMAS[a].nombre} · Daño ×${(M.lvlMul * (1 + (M.J.dmg || 0))).toFixed(2).replace('.', ',')}` : 'Todavía no es un arma en este juego';
}
function cardDesc(k) {
  if (isLeader(k)) return k === 'bunny' ? 'Tu personaje. Lanza zanahorias y salta con Chaos Jump. Su nivel, su habilidad y sus objetos mejoran a todas tus armas.' : 'Tu personaje cuando juegas con esta facción. Su nivel, su habilidad y sus objetos mejoran a todas tus armas.';
  const a = ARMA_DE[k]; return a ? ARMAS[a].desc : CFG.cards[k].desc;
}
const passiveText = fac => (FAC_JUGABLES.includes(fac) ? 'En este juego, tus 6 cartas son tus armas: cuanto más nivel tenga cada una, más daño hace su arma.' : 'Todavía no se puede jugar con esta facción en Fans of Survivors.');
// qué le falta a una facción cerrada (lo enseña la colección)
const bloqueadaTexto = fac => `Bloqueada: aguanta ${DESBLOQUEO[fac]} minutos en total en Fans of Survivors (llevas ${Math.min(minutosTotales(), DESBLOQUEO[fac])}) o activa el modo pruebas en Opciones.`;
// poder del líder en horas extra: 100 = nivel 1 sin nada
function idlePower(fac) {
  const M = cardMods(FACTIONS[fac].leader), J = M.J;
  const aguante = (1 + (J.hp || 0)) / (1 - Math.min(0.6, (J.armor || 0) + (J.dodge || 0))) * (1 + (J.revive || 0)) * (1 + 0.2 * (J.regen || 0));
  const pegada = (1 + (J.dmg || 0)) * (1 + (J.cd || 0)) * (1 + (J.area || 0) * 0.5) * (1 + (J.crit || 0)) * (1 + (J.speed || 0) * 0.3);
  return Math.max(1, M.lvlMul * Math.sqrt(Math.max(0.2, aguante) * Math.max(0.2, pegada)) + 0.05 * M.n);
}

/* ---------- premios de una partida (lo que se da lo decide js/interfaz.js) ---------- */
function give(gold, gems, xp, evento) { ECO.ganar('recompensa', { gold, gems }, evento); saveGame(); return `<span class="rw-chip ol">${COIN_SVG}+${fmt(gold)}</span>${gems ? `<span class="rw-chip ol">${GEM_SVG}+${fmt(gems)}</span>` : ''}${xp ? `<div class="rw-xp">Experiencia: +${fmt(xp)} para las cartas que has usado</div>` : ''}`; }

/* ---------- la partida guardada (la misma forma que la de los otros juegos) ---------- */
function metaDefaults(s) {
  const d = { gold: ECON.start.gold, gems: ECON.start.gems, units: {}, inv: [], invSeq: 0, abEquip: {}, equip: {}, pity: {}, giftDay: '', idle: null, seenVer: '', tickets: 0,
    stats: {}, achC: {}, achR: {}, pass: { xp: 0, prem: false, free: [], paid: [] }, login: { last: '', day: 0, best: 0 }, record: null, fac: 'animales' };
  for (const k in d) if (s[k] == null) s[k] = d[k];
  s.inv = s.inv.filter(it => (it.k === 'ab' ? ABILITIES : ITEMS)[it.id]);
  return s;
}
function newSave() { return metaDefaults({ v: 1, muted: false }); }
const migrateSave = s => metaDefaults(s);
SAVE = loadSave();
