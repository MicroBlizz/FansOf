// Fans of TD · El catálogo de este juego: qué habilidades y objetos de la serie reparte, qué hacen aquí (AJUSTES.fx, en js/ajustes.js),
// lo que suma una carta con lo que lleva (cardMods) y cómo es su partida guardada. Lo común está en core/js/sistema/progreso.js.
'use strict';
const STATS = AJUSTES.stats;   // qué puede mejorar cada faceta de una carta en este juego
// Gashapón de habilidades: una por carta
const ABILITIES = catalogo('ab', Object.fromEntries(['cafeina', 'piel', 'punos', 'reflejos', 'speedrun', 'plasma', 'sigilo', 'escarcha', 'vampiro', 'hitbox', 'microtrans', 'cadena', 'renacer', 'grito', 'iman', 'clon', 'furia', 'gigante'].map(id => [id, id === 'iman' ? { rar: 'epic' } : {}])));   // aquí el Imán de CAOS es épico
// Gashapón de equipamiento: arma, cabeza y accesorio.
const ITEMS = catalogo('eq', Object.fromEntries(['espada_carton', 'mando_cable', 'raton_dpi', 'baguette', 'teclado_rgb', 'lanzaconfeti', 'banhammer_oro', 'cuernos', 'gorra_reves', 'corona_carton', 'casco_vr', 'gorro_aluminio', 'orejas_gato', 'auriculares', 'taza', 'pase_caducado', 'almohada', 'disco_fisico', 'silla_gamer', 'alfombrilla', 'boton_pausa', 'zanahoria_oro', 'corona_huesos', 'microfono_oro', 'yelmo_olimpo', 'nucleo_plasma', 'gafas_pixel', 'raton_campeon', 'cartucho_dorado', 'claqueta_oro', 'diploma', 'corbata_ceo'].map(id => [id, {}])));
// Los efectos vienen de los ajustes del juego. fx: [faceta, qué mejora, valor central]; un valor negativo es una pega y no cambia con la calidad.
// De cada «fx» salen lo que el original guardaba a mano: st (los valores centrales que cambian con la calidad) y desc (el texto con {0}, {1}…)
const SIDES = Object.keys(AJUSTES.facetas);
for (const DB of [ABILITIES, ITEMS]) for (const id in DB) {
  const D = DB[id], by = {}; D.fx = AJUSTES.fx[id] || []; D.st = []; D.fi = [];
  D.fx.forEach(([side, st, c]) => {
    const [txt, , signed] = STATS[side][st], fixed = c <= 0;
    if (!fixed) { D.fi.push(D.st.length); D.st.push(c); } else D.fi.push(-1);
    (by[side] = by[side] || []).push((signed ? (c < 0 ? '−' : '+') : '') + txt.replace('{v}', fixed ? String(Math.abs(c)) : '{' + (D.st.length - 1) + '}'));
  });
  D.side = SIDES.filter(s => by[s]).join('');   // qué facetas mejora
  // el texto: todo seguido, como en el Rumble; o, si el juego quiere enseñar sus facetas (AJUSTES.verFacetas), cada una con su etiqueta
  const junta = l => (l.length > 2 ? l.slice(0, -1).join(', ') + ' y ' + l[l.length - 1] : l.join(' y ')), todo = junta([].concat(...SIDES.filter(s => by[s]).map(s => by[s])));
  D.desc = !D.side ? 'No hace nada en este juego.' : !AJUSTES.verFacetas ? todo.charAt(0).toUpperCase() + todo.slice(1) + '.'
    : SIDES.filter(s => by[s]).map(s => `<i class="${AJUSTES.facetas[s].cls}">${AJUSTES.facetas[s].nombre}</i> ${by[s].join(' y ')}.`).join(' ');
}
// para los textos de los menús: «· TORRE», «mejora la TORRE»…
const sideTag = D => (!AJUSTES.verFacetas ? '' : D.side.length === 1 ? '· ' + AJUSTES.facetas[D.side].nombre : D.side ? '· LAS DOS' : '');
const sideText = D => (!AJUSTES.verFacetas ? '' : D.side.length === 1 ? 'mejora ' + AJUSTES.facetas[D.side].con : D.side ? 'mejora las dos facetas' : 'no hace nada en este juego');

/* ---------- guardado (misma forma que el del original) ---------- */
function metaDefaults(s) {
  const d = { gold: ECON.start.gold, gems: ECON.start.gems, units: {}, inv: [], invSeq: 0, abEquip: {}, equip: {}, pity: {}, giftDay: '', idle: null, seenVer: '', tickets: 0,
    stats: {}, achC: {}, achR: {}, pass: { xp: 0, prem: false, free: [], paid: [] }, login: { last: '', day: 0, best: 0 } };   // retos (core/js/retos.js)
  for (const k in d) if (s[k] == null) s[k] = d[k];
  // partidas guardadas con la primera versión del progreso: nivel por carta, un solo número de calidad y todo el equipo junto
  if (s.cards) { for (const k in s.cards) s.units[k] = { lvl: s.cards[k].lvl || 1, xp: 0 }; delete s.cards; }
  for (const it of s.inv) { if (!it.u) { it.u = 'i' + it.n; delete it.n; } if (!Array.isArray(it.q)) it.q = defOfSafe(it) ? defOfSafe(it).st.map(() => it.q) : [it.q]; }
  if (s.gear) { for (const k in s.gear) for (const sl in s.gear[k]) { const u = 'i' + s.gear[k][sl]; if (sl === 'ab') s.abEquip[k] = u; else (s.equip[k] = s.equip[k] || {})[sl] = u; } delete s.gear; }
  if (s.seq) { s.invSeq = Math.max(s.invSeq, s.seq); delete s.seq; }
  s.inv = s.inv.filter(it => defOfSafe(it));
  // los objetos (arma, cabeza y accesorio) solo los lleva el líder: lo que tuviera puesto otra carta vuelve al inventario
  // y se guardan por facción, como en el Rumble (antes, por la carta del líder)
  for (const k of Object.keys(s.equip)) { if (FACTIONS[k]) continue; const f = isLeader(k) && FACTION_ORDER.find(x => FACTIONS[x].leader === k); if (f && !s.equip[f]) s.equip[f] = s.equip[k]; delete s.equip[k]; }
  return s;
}
const defOfSafe = it => (it.k === 'ab' ? ABILITIES : ITEMS)[it.id];
const facOfCard = k => FACTION_ORDER.find(f => FACTIONS[f].leader === k || FACTIONS[f].units.includes(k));

/* ---------- lo que lleva una carta, sumado y listo para el motor ---------- */
const noSides = () => Object.fromEntries(SIDES.map(s => [s, {}]));
const NOMODS = Object.assign({ lvl: 1, lvlMul: 1, n: 0 }, noSides());
function cardMods(k) {
  const lvl = (SAVE.units[k] && SAVE.units[k].lvl) || 1, M = Object.assign({ lvl, lvlMul: 1 + ECON.lvlStep * (lvl - 1), n: 0 }, noSides()), E = (isLeader(k) && SAVE.equip[facOfCard(k)]) || {};
  for (const it of [invGet(SAVE.abEquip[k]), ...Object.keys(SLOTS).map(sl => invGet(E[sl]))]) {
    if (!it) continue; const D = defOf(it), V = valsOf(it); M.n++;
    D.fx.forEach(([side, st, c], i) => { const v = D.fi[i] < 0 ? c : V[D.fi[i]]; M[side][st] = (M[side][st] || 0) + (st === 'cc' ? 1 : STATS[side][st][1] ? v / 100 : v); });
  }
  return M;
}
/* ---------- experiencia y recompensas de las partidas (cuánto se da lo decide cada juego) ---------- */
function xpGrant(win) { const X = G.xpPlay || {}; let n = 0; for (const k in X) { const g = Math.round(X[k] * (win ? ECON.winXpMult : 1)); uSave(k).xp += g; n += g; } G.xpPlay = {}; return n; }
function give(gold, gems, xp) { SAVE.gold += gold; SAVE.gems += gems; saveGame(); return `<span class="rw-chip ol">${COIN_SVG}+${fmt(gold)}</span>${gems ? `<span class="rw-chip ol">${GEM_SVG}+${fmt(gems)}</span>` : ''}${xp ? `<div class="rw-xp">Experiencia: +${fmt(xp)} para las cartas que has usado</div>` : ''}`; }

/* ---------- la partida guardada de este juego ---------- */
function newSave() { return metaDefaults({ v: 1, stars: {}, muted: false }); }
const migrateSave = s => metaDefaults(s);
SAVE = loadSave();
