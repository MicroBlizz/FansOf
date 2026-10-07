// Fans of TD · Cómo usa este juego el progreso común (core/js/meta.js): qué hace con lo que lleva una carta cuando es torre y cuando es unidad,
// cuánta experiencia y qué recompensas da, y cuánto vale un líder haciendo horas extra.
'use strict';
const isUnlocked = () => true;   // aquí todas las razas están disponibles desde el principio
// lo que lleva la carta se aplica a cada unidad tuya que sale en el campo rival. El daño (que también sube a la torre) aquí es daño a la base
function unitGear(f) {
  const M = cardMods(f.k), U = Object.assign({}, M.U, { leak: (M.U.leak || 0) + (M.T.dmg || 0) }); f.U = U;
  f.hp = f.maxHp = Math.max(1, Math.round(f.maxHp * M.lvlMul * Math.max(0.2, 1 + (U.hp || 0))));
  f.speed *= Math.max(0.3, 1 + (U.speed || 0)); f.armor = 1 - (1 - f.armor) * (1 - (U.armor || 0));
  if (U.shield) { f.shMax += Math.round(f.maxHp * U.shield); f.sh = f.shMax; }
  f.fog += U.fog || 0; f.rushT = U.rush || 0; f.cc = !!U.cc; if (U.leak > 0.2) f.sc *= 1.2;
}
// los números que enseña la colección (como effStats del original): vida de la unidad, daño de la torre y qué le suma lo que lleva
function effStats(k) {
  const M = cardMods(k), fac = facOfCard(k), D = TOWERS[fac][k], U = CFG.units[k], b = [], pc = v => (v > 0 ? '+' : '−') + Math.abs(Math.round(v * 100)) + ' %';
  if (M.T.dmg) b.push(pc(M.T.dmg) + ' de daño'); if (M.T.range) b.push(pc(M.T.range) + ' de alcance'); if (M.T.spd) b.push(pc(M.T.spd) + ' de velocidad de ataque');
  if (M.U.hp) b.push(pc(M.U.hp) + ' de vida'); if (M.U.speed) b.push(pc(M.U.speed) + ' de velocidad');
  const extra = Object.keys(M.T).filter(s => !['dmg', 'range', 'spd'].includes(s)).length + Object.keys(M.U).filter(s => !['hp', 'speed'].includes(s)).length; if (extra) b.push(extra > 1 ? `${extra} efectos más` : '1 efecto más');
  return { M, hp: U.hp * M.lvlMul * Math.max(0.2, 1 + (M.U.hp || 0)), dmg: D.dmg * M.lvlMul * (1 + (M.T.dmg || 0)), range: D.range * (1 + (M.T.range || 0)), aura: D.kind === 'aura', boosts: b };
}
// la línea de números de una carta en la colección
const cardStats = (k, es) => `Vida ${Math.round(es.hp)} · ${es.aura ? 'Apoyo' : 'Daño ' + Math.round(es.dmg)} · Alcance ${Math.round(es.range)}`;

const cardDesc = k => TOWERS[facOfCard(k)][k].desc;
const passiveText = fac => PASSIVES[fac].txt;

/* ---------- experiencia y recompensas ---------- */
// cada torre que pones y cada unidad que envías da experiencia a su carta; se cobra al acabar la partida
function xpPlay(k) { if (G.vs && G.vsCur === 'ai') return; const X = G.xpPlay || (G.xpPlay = {}); X[k] = Math.min(ECON.xpCap, (X[k] || 0) + ECON.xpPerPlay); }
function campReward(L, win, st, first, first3) {   // el servidor vuelve a calcularlo con el evento (tipo 'camp')
  const C = ECON.camp; let gold = 0, gems = 0;
  if (!win) gold = C.lose; else if (first) { const r = L.boss ? C.boss : C.first; gold = r[0]; gems = r[1]; } else gold = C.replay;
  if (win && first3) { gold += C.stars3[0]; gems += C.stars3[1]; }
  return give(gold, gems, xpGrant(win), { tipo: 'camp', nivel: L.id, dif: 'n', estrellas: st, victoria: win, jefe: !!L.boss });
}
const vsReward = (win, diff) => give(win ? ECON.vs[diff] : ECON.vs.lose, 0, xpGrant(win), { tipo: 'otro', victoria: win });

/* ---------- horas extra ---------- */
// poder del líder: 100 = nivel 1 sin nada. Sube con el nivel y con lo que lleve que le sirva como unidad (el daño cuenta).
function idlePower(fac) {
  const M = cardMods(FACTIONS[fac].leader), U = Object.assign({}, M.U, { leak: (M.U.leak || 0) + (M.T.dmg || 0) });
  const tough = (1 + (U.hp || 0)) * (1 + (U.shield || 0)) / (1 - Math.min(0.6, (U.armor || 0) + (U.dodge || 0))) * (1 + (U.revive || 0) + 2 * (U.clon || 0)) * (1 + 5 * (U.regen || 0));
  const punch = (1 + (U.leak || 0)) * (1 + (U.speed || 0) + 0.1 * (U.rush || 0)) * (1 + (U.steal || 0) * 0.5) * (1 + 0.04 * (U.fog || 0) + 0.04 * (U.pause || 0) + 0.01 * (U.caos || 0) + (U.cc ? 0.1 : 0));
  return Math.max(1, M.lvlMul * Math.sqrt(Math.max(0.2, tough) * Math.max(0.2, punch)) + 0.05 * M.n);
}
