// Fans of Rumble · Progresión (5/5): la partida guardada (nueva y migración de las antiguas) y utilidades del combate
'use strict';

/* ---------- la partida guardada de este juego: cómo es una nueva y cómo se ponen al día las antiguas ---------- */
function newSave() { return { v: 1, gold: ECON.start.gold, gems: ECON.start.gems, units: {}, unlocked: ['animales'], camp: {}, inv: [], invSeq: 0, abEquip: {}, equip: {}, pity: { ab: 0, abL: 0, eq: 0, eqL: 0, qab: 0, qeq: 0, cd: 0, cdL: 0 }, cards: {}, decks: {}, bossRec: {}, bossPay: {}, bossSel: { wi: 6, d: 'n' }, daily: null, weekly: null, tickets: 0, pass: { xp: 0, prem: false, free: [], paid: [] }, giftDay: '', chatOff: false, bestBoss: 0, lastFac: 'animales', tut: { done: false, step: 0 }, tutGift: {}, login: { last: '', day: 0, best: 0 }, stats: {}, achDone: [], achSeen: [], starter: false, speed2: false, seenVer: '', campH: {}, campM: {}, rlWeek: '', mythPrize: {}, facItem: {} }; }
// v0.9.9: antes se guardaba «tengo esta habilidad (rango 1-3)» y «tengo este objeto»; ahora cada copia tiene su calidad.
// Las partidas antiguas se convierten sin perder nada: la habilidad conserva su valor exacto y los objetos quedan como estaban.
function migrateSave(s, raw) {
  if (!Array.isArray(s.inv)) s.inv = [];
  s.invSeq = s.invSeq || s.inv.length;
  const add = (k, id, q) => { const it = { u: 'i' + (++s.invSeq), k, id, q }; s.inv.push(it); return it.u; };
  const has = uid => s.inv.some(it => it.u === uid);
  if (s.abil) {
    const map = {};
    for (const id in s.abil) if (ABILITIES[id]) { const v = ABILITIES[id].vals, r = Math.max(1, Math.min(3, s.abil[id] || 1)); map[id] = add('ab', id, [Math.max(0, Math.min(1, Math.floor((v[r - 1] / v[1] - 0.5) * 1000) / 1000))]); }
    for (const k in s.abEquip || {}) { const v = s.abEquip[k]; if (map[v]) s.abEquip[k] = map[v]; else if (!has(v)) delete s.abEquip[k]; }
    delete s.abil;
  }
  if (s.items) {
    const map = {};
    for (const id in s.items) if (ITEMS[id]) map[id] = add('eq', id, ITEMS[id].st.map(() => (ITEMS[id].pass ? PASS_Q : 0.5)));
    for (const f in s.equip || {}) for (const sl in s.equip[f]) { const v = s.equip[f][sl]; if (map[v]) s.equip[f][sl] = map[v]; else if (!has(v)) delete s.equip[f][sl]; }
    delete s.items;
  }
  s.abEquip = s.abEquip || {}; s.equip = s.equip || {};
  s.pity = Object.assign({ ab: 0, abL: 0, eq: 0, eqL: 0, qab: 0, qeq: 0, cd: 0, cdL: 0 }, s.pity || {});
  s.cards = s.cards || {}; s.decks = s.decks || {};   // v0.9.15: cartas del gashapón (copias y estrellas) y mazos
  s.bossRec = s.bossRec || {}; s.bossPay = s.bossPay || {}; s.bossSel = s.bossSel || { wi: 6, d: 'n' };   // v0.9.15: Modo Jefe por jefe y dificultad
  if (s.bestBoss && !s.bossRec['6n']) s.bossRec['6n'] = s.bestBoss;
  if (s.bossTier && !s.bossPay['6n']) s.bossPay['6n'] = (1 << Math.min(3, s.bossTier)) - 1;
  // v0.9.11: logros, premio diario y partida guiada. Quien ya jugaba antes no repite el tutorial.
  s.stats = s.stats || {}; s.achDone = s.achDone || []; s.achSeen = s.achSeen || []; s.tutGift = s.tutGift || {};
  s.login = Object.assign({ last: '', day: 0, best: 0 }, s.login || {});
  if (raw && !raw.tut) {
    const played = Object.keys(s.camp || {}).length > 0 || (s.inv || []).length > 0 || (s.pass && s.pass.xp > 0) || (s.unlocked || []).length > 1 || Object.values(s.units || {}).some(u => u && (u.lvl > 1 || u.xp > 0));
    s.tut = { done: played, step: played ? 3 : 0 };
    if (played) {   // lo que ya se puede contar para los logros
      s.stats.unlock = Math.max(s.stats.unlock || 0, (s.unlocked || []).length - 1);
      s.stats.lvlup = Math.max(s.stats.lvlup || 0, Object.values(s.units || {}).reduce((a, u) => a + Math.max(0, ((u && u.lvl) || 1) - 1), 0));
      if ((s.camp || {})['7-4']) s.stats.ceo = Math.max(s.stats.ceo || 0, 1);
    }
  }
  s.tut = Object.assign({ done: false, step: 0 }, s.tut || {});
  s.campH = s.campH || {}; s.campM = s.campM || {}; s.campF = s.campF || {}; s.campX = s.campX || {}; s.mythPrize = s.mythPrize || {};   // v0.9.12: Difícil y Mítica
  return s;
}
SAVE = loadSave();   // lo carga y lo guarda core/js/sistema/progreso.js, con newSave y migrateSave de aquí
const isUnlocked = f => SAVE.unlocked.includes(f);

/* ---------- utilidades del combate (las generales están en core/js/sistema/utiles.js) ---------- */
const other = t => (t === 'p' ? 'e' : 'p');
// v0.9.14: los sanadores curan en un cono de 90° hacia delante y se quedan a esta distancia detrás de la unidad que siguen
const HEAL_CONE = Math.PI / 2, HEAL_COS = Math.cos(HEAL_CONE / 2), HEAL_BACK = 58;
const edgeDist = (a, b) => dist(a, b) - a.r - b.r;
const nearestBridge = x => BRIDGES.reduce((b, c) => (Math.abs(x - c) < Math.abs(x - b) ? c : b), BRIDGES[0]);
const laneBridge = i => (i === 0 ? BRIDGES[0] : BRIDGES[BRIDGES.length - 1]);   // v0.9.19: el puente del carril izquierdo (0) o derecho (1)

