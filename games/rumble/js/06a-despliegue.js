// Fans of Rumble · Combate (1/5): crear unidades, aplicar habilidades y objetos y desplegar cartas
'use strict';
/* =========================================================
   EFFECTS
   ========================================================= */
function shake(n) { if (!REDUCED && !SAVE.noShake) G.shake = Math.max(G.shake, n); }
function puff(x, y, n, color, spd = 40, size = 6, ground = false, z0 = 2) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = rand(spd * 0.4, spd); parts.push({ type: 'dust', x, y, z: z0 + rand(0, 6), vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.5, vz: rand(5, 28), g: 0, life: rand(0.35, 0.65), max: 0.65, size: rand(size * 0.6, size), color, ground }); } }
function ring(x, y, r0, r1, color, dur = 0.4, lw = 4, circ = false) { parts.push({ type: 'ring', x, y, z: 0, r0, r1, color, life: dur, max: dur, lw, ground: true, circ }); }   // circ: círculo exacto (áreas de efecto)
function sparks(x, y, z, n, color) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = rand(60, 160); parts.push({ type: 'spark', x, y, z, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.5, vz: rand(20, 140), g: 420, life: rand(0.2, 0.35), max: 0.35, color }); } }
function chips(x, y, z, n, colors, kind = 'chip', size = 4) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = rand(30, 110); parts.push({ type: kind, x, y, z, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.5, vz: rand(90, 220), g: 520, rot: rand(0, 6), vr: rand(-12, 12), life: rand(0.7, 1.1), max: 1.1, size: rand(size * 0.7, size * 1.3), color: pick(colors) }); } }
function addNum(x, y, z, txt, color, size = 15) {
  txt = String(txt);
  if (/^[+-]?[0-9]/.test(txt)) { if (SAVE.noNums) return;   // v0.9.19: Opciones → sin números de daño
    nums.push({ x, y, z, vz: 46, txt, color, size, life: 0.85, max: 0.85 }); return; }   // números (daño, curas, +CAOS): rápidos
  if (SAVE.feed && (G.state === 'play' || G.state === 'ending')) { feedAdd(txt, color, x, y); return; }   // v0.9.21: Opciones → avisos en la caja de abajo a la derecha
  // v0.9.9: los mensajes duran más, suben despacio, llevan fondo y no se pisan entre ellos
  for (let k = 0; k < 4; k++) { const o = nums.find(n => n.tx && Math.abs(n.x - x) < 90 && Math.abs((n.y - n.z) - (y - z)) < 20); if (!o) break; z = o.z + (y - o.y) + 22; }
  nums.push({ x, y, z, vz: 22, txt, color, size: Math.max(14, size), life: 2.1, max: 2.1, tx: true });
}
// v0.9.8: destello de golpe, tajo de los ataques cuerpo a cuerpo, resplandor y flash de pantalla
function impact(x, y, z, size, color) { parts.push({ type: 'impact', x, y, z, size, color, rot: Math.random() * Math.PI, life: 0.17, max: 0.17 }); }
function flashAt(x, y, z, size, rgb, dur = 0.3) { parts.push({ type: 'flash', x, y, z, size, rgb, life: dur, max: dur }); }
function slashFx(u, t, heavy) { const d = dist(u, t) || 1; parts.push({ type: 'slash', x: u.x, y: u.y, z: topOf(u) * 0.45, ang: Math.atan2((t.y - u.y) * 1.6, t.x - u.x), size: clamp(d * 1.08, 16, 54) * (heavy ? 1.2 : 1), color: u.team === 'p' ? '#ffd28a' : '#a9d8ff', life: 0.26, max: 0.26, w: heavy ? 1.6 : 1 }); }
// v0.9.24: golpes con más jugo. Parón del golpe (hit-stop): el juego casi se congela un instante en los golpes fuertes
function hitStop(s) { if (REDUCED || G.state !== 'play') return; if (G.t - (G.stopAt || -9) < 0.35) return; G.stopAt = G.t; G.hitstop = Math.max(G.hitstop || 0, s); }
// líneas de impacto tipo cómic que salen del golpe
function hitLines(x, y, z, n, color, big) { const a0 = Math.random() * Math.PI; for (let i = 0; i < n; i++) parts.push({ type: 'hitline', x, y, z, a: a0 + (i / n) * Math.PI * 2 + rand(-0.2, 0.2), r0: big ? 9 : 6, len: (big ? 20 : 13) * rand(0.75, 1.2), color, life: 0.17, max: 0.17 }); }
function screenFlash(a) { if (!REDUCED) G.flash = Math.max(G.flash || 0, a); }

/* =========================================================
   GAME LOGIC
   ========================================================= */
function canDeploy(team, key) {
  if (!isLeader(key)) return true;
  if (S[team].leaderCd > 0) return false;
  if (revives.some(r => r.team === team && r.type === key)) return false;
  return !units.some(u => u.alive && u.team === team && u.type === key);
}
function validSpot(team, x, y) { const z = ZONE[team]; return x >= 16 && x <= W - 16 && y >= z.y0 && y <= z.y1; }
// v0.9.9: si sueltas la carta en el río o en el lado enemigo, la tropa sale en el borde de tu zona (la línea límite)
function snapSpot(team, x, y) { const z = ZONE[team]; return { x: clamp(x, 26, W - 26), y: clamp(y, z.y0, z.y1) }; }
function spawnUnit(team, type, x, y) {
  const d = CFG.units[type];
  const u = { kind: 'unit', id: ++uid, team, type, d, x, y, z: 0, r: d.r, hp: d.hp, maxHp: d.hp, alive: true, atkT: 0.35, target: null, retarget: 0, deployT: 0.7, deployMax: 0.7, face: x < W / 2 ? 1 : -1, walk: Math.random() * 6, moving: false, lungeT: 0, lungeX: 0, lungeY: 0, hitT: 0, stunT: 0, stealthT: d.stealth || 0, jumpCd: d.jumpCd ? 2.5 : 0, jump: null, spin: 0, labelT: team === 'e' ? 2 : 0, slowT: 0,
    sumT: 3, pulseT: 2.5, viralT: 3, tfT: 3, hackT: 2, blinkT: 1.5, tauntT: 1, runDist: 0, stonk: 0, mHp: 1, mDmg: 1, mSpeed: 1, mCd: 1, mScale: 1, shield: 0, shieldMax: 0, shT: 0 };
  units.push(u);
  if (S) applySpawnMods(u);
  return u;
}
function unitLevel(team, type) {
  const k = SUMMON_PARENT[type] || type;
  if (G.pvp) return G.pvp[team].lvl[k] || 1;   // PvP: el nivel sale del equipo firmado de cada jugador, nunca del SAVE
  if (team === 'e') return G.elvl;
  return SAVE.units[k] ? SAVE.units[k].lvl : 1;
}
// al salir: nivel, pasivas de facción (RNG, Experiencia, Escudos), habilidad del gashapón y equipo del líder
function applySpawnMods(u) {
  const team = u.team, f = facOf(team), P = CFG.passives;
  u.lvl = unitLevel(team, u.type); u.mLvl = 1 + (u.lvl - 1) * ECON.lvlStep;
  u.corrupt = team === 'e' && !G.pvp && !isCorp(G.efac);
  if (f === 'olvidados') u.olvT = P.olvidados.t;   // v0.9.13: Nostalgia
  if (f === 'memes') { const m = spick(P.memes.muts); u.mut = m.id; u.mHp = m.hp; u.mDmg = m.dmg; u.mSpeed = m.speed; u.mCd = m.cd; u.mScale = m.scale; u.r = u.d.r * m.scale; u.mutTxt = m.txt; u.mutCol = m.color; }
  if (team === 'p' || G.pvp) { applyAbility(u); if (isLeader(u.type)) applyEquip(u); const st = starsOf(team, u.type); if (st) { u.mHp *= 1 + st * ECON.starStep; u.mDmg *= 1 + st * ECON.starStep; } }
  else if (G.egear && (isLeader(u.type) || G.egearOn.includes(u.type))) applyEnemyGear(u);
  const M = G.mod;   // v0.9.12: ruleta de la Mítica
  if (M && team === 'p') { if (M.deb.id === 'lag') u.mSpeed *= 0.8; if (M.deb.id === 'parche') u.mHp *= 0.8; if (M.deb.id === 'becarios') u.mDmg *= 0.8; }
  else if (M) { if (M.buf.id === 'horas') u.mCd *= 0.7; if (M.buf.id === 'robots') u.mHp *= 1.25; if (M.buf.id === 'bonus') u.mDmg *= 1.25; if (M.buf.id === 'turbo') u.mSpeed *= 1.25; }
  if (team === 'e' && G.mode === 'camp' && G.cdiff && G.cdiff !== 'n') { const el = CDIFF[G.cdiff].elite; u.mHp *= el; u.mDmg *= el; }   // tropas de élite en Difícil, Heroica y Mítica (y más flojas en Fácil)
  if (team === 'e' && G.mode === 'boss' && G.bossDiff && G.bossDiff !== 'n') { const el = BDIFF[G.bossDiff].elite; u.mHp *= el; u.mDmg *= el; }   // v0.9.15: y en el Modo Jefe
  const FB = FAC_BAL[f]; if (FB) { u.mHp *= FB.hp; u.mDmg *= FB.dmg; }   // v0.9.20: ajuste de equilibrio por facción (01-config.js)
  u.hpBase = u.d.hp * u.mHp * u.mLvl;
  u.maxHp = Math.round(u.hpBase * (f === 'heroes' ? 1 + S[team].xpLvl * P.heroes.step : 1)); u.hp = u.maxHp;
  if (f === 'ciber') u.shieldMax = u.shield = Math.round(u.maxHp * P.ciber.frac);
  if (u.abShield) u.shieldMax = u.shield = Math.max(u.shieldMax, Math.round(u.maxHp * u.abShield));
}
function applyAbility(u) {
  const k = SUMMON_PARENT[u.type] || u.type, it = G.pvp ? G.pvp[u.team].ab[k] : invGet(SAVE.abEquip[k]); if (!it || it.k !== 'ab' || !ABILITIES[it.id]) return;
  const id = it.id, v = valsOf(it)[0]; u.ab = id;
  switch (id) {
    case 'cafeina': u.mSpeed *= 1 + v / 100; break;
    case 'piel': u.mHp *= 1 + v / 100; break;
    case 'punos': u.mDmg *= 1 + v / 100; break;
    case 'reflejos': u.mCd *= 1 - v / 100; break;
    case 'plasma': u.abShield = v / 100; break;
    case 'sigilo': u.stealthT = Math.max(u.stealthT, v); u.abSurprise = 2; break;
    case 'escarcha': u.abSlow = { f: 0.5, t: v }; break;
    case 'vampiro': u.abVamp = v / 100; break;
    case 'cadena': u.abChain = v / 100; break;
    case 'provoca': u.abTaunt = v; break;
    case 'renacer': u.abRevive = v / 100; break;
    case 'grito': u.abPulse = { cd: 9, r: 70, stun: v, kind: 'daze', text: '¡GRITO!', color: 'rgba(230,220,255,.9)', tc: '#e6dcff', sfx: 'wail' }; break;
    case 'clon': if (!isLeader(u.type)) u.abClone = v / 100; break;
    case 'furia': u.abFury = 1 + v / 100; break;
    case 'speedrun': u.abRun = v; break;
    case 'hitbox': u.abDodge = v / 100; break;
    case 'microtrans': u.abSteal = v; break;
    case 'ragequit': u.abRage = v; break;
    case 'modofoto': u.abPhoto = v; break;
    case 'dlc': u.abDlc = v; break;
    case 'gigante': { const k = 1 + v / 100; u.mHp *= k; u.mDmg *= k; u.mSpeed *= 0.82; u.mScale *= 1.28; u.r *= 1.28; u.abGiant = true; break; }
    case 'iman': u.abMagnet = v; break;
  }
}
function applyEquip(u) {
  const E = G.pvp ? G.pvp[u.team].equip : SAVE.equip[facOf(u.team)] || {};
  for (const slot in SLOTS) { const it = G.pvp ? E[slot] : invGet(E[slot]); if (it && it.k === 'eq' && ITEMS[it.id] && fitsFac(it.id, facOf(u.team))) applyItem(u, it); }
}
// v0.9.12: efecto de un objeto. Sirve para tu líder y para el equipo del rival en Difícil y Mítica
function applyItem(u, it) {
  {
    const id = it.id, v = valsOf(it), pc = i => 1 + v[i] / 100;
    switch (id) {
      case 'espada_carton': u.mDmg *= pc(0); break;
      case 'raton_dpi': u.mRange = pc(0); u.mDmg *= pc(1); break;
      case 'teclado_rgb': u.mCd *= 1 - v[0] / 100; break;
      case 'banhammer_oro': u.mDmg *= pc(0); u.abKnock = 18; break;
      case 'cuernos': u.mHp *= pc(0); break;
      case 'corona_carton': u.mHp *= pc(0); u.mDmg *= pc(1); break;
      case 'gorro_aluminio': u.mHp *= pc(0); u.immuneBoss = true; break;
      case 'auriculares': u.mHp *= pc(0); u.immuneCC = true; u.immuneBoss = true; break;
      case 'taza': u.regen = (u.regen || 0) + v[0] / 100; break;
      case 'pase_caducado': u.mHp *= pc(0); u.mDmg *= pc(0); u.mSpeed *= pc(0); break;
      case 'almohada': u.respawnM = 1 - v[0] / 100; break;
      case 'silla_gamer': u.abArmor = v[0] / 100; break;
      case 'cofre': { const c = spick(COFRE), pw = v[0] / 100; c[1](u, pw); u.cofreTxt = c[0](pw); break; }
      case 'diploma': u.mHp *= pc(0); u.mDmg *= pc(1); break;
      case 'corbata_ceo': u.mHp *= pc(0); u.mDmg *= pc(1); u.mSpeed *= pc(2); break;
      case 'mando_cable': u.mRange = (u.mRange || 1) * pc(0); break;
      case 'baguette': u.abCrit = v[0] / 100; break;
      case 'lanzaconfeti': u.abSplash = v[0] / 100; break;
      case 'gorra_reves': u.mSpeed *= pc(0); break;
      case 'casco_vr': u.mDmg *= pc(0); u.mHp *= 0.9; break;
      case 'orejas_gato': u.abCute = v[0] / 100; break;
      case 'bebida_xxl': u.abDrink = v[0] / 100; break;
      case 'disco_fisico': u.mHp *= pc(0); break;
      case 'alfombrilla': u.abAura = v[0] / 100; break;
      case 'boton_pausa': u.abPause = v[0]; break;
      case 'zanahoria_oro': u.mDmg *= pc(0); u.jumpCdM = 1 - v[1] / 100; break;
      case 'corona_huesos': u.mHp *= pc(0); u.regen = (u.regen || 0) + v[1] / 100; break;
      case 'microfono_oro': u.mDmg *= pc(0); u.abAura = (u.abAura || 0) + v[1] / 100; break;
      case 'yelmo_olimpo': u.mHp *= pc(0); u.abArmor = Math.max(u.abArmor || 0, v[1] / 100); break;
      case 'nucleo_plasma': u.abShield = Math.max(u.abShield || 0, v[0] / 100); u.mDmg *= pc(1); break;
      case 'gafas_pixel': u.abCrit = Math.max(u.abCrit || 0, v[0] / 100); u.mSpeed *= pc(1); break;
      case 'raton_campeon': u.mCd *= 1 - v[0] / 100; u.mRange = (u.mRange || 1) * pc(1); break;
      case 'cartucho_dorado': u.mHp *= pc(0); u.mDmg *= pc(0); u.olvT = (u.olvT || 0) + v[1]; break;
      case 'taza_indie': u.mDmg *= pc(0); u.regen = (u.regen || 0) + v[1] / 100; break;   // v0.9.23
      case 'claqueta_oro': u.mDmg *= pc(0); u.abSplash = Math.max(u.abSplash || 0, v[1] / 100); break;
    }
    u.equip = u.equip || {}; u.equip[ITEMS[id].slot] = id;
  }
}
function applyEnemyGear(u) { for (const id of G.egear) applyItem(u, { k: 'eq', id, q: ITEMS[id].st.map(() => G.egearQ) }); u.geared = true; }
function doDeploy(team, key, x, y) {
  if (isSpell(key)) { castSpell(team, key, x, y); return; }   // v0.9.15
  const def = cardDef(key);
  S[team].chaos -= def.cost; S[team].spent += def.cost; S[team].deployed++;
  if (team === 'p') chatSt.lastDep = G.t;
  if (team === 'p' && isLeader(key) && Math.random() < 0.6) chatSay('leader');
  else if (team === 'p') chatEv('deploy', def.name, key, 0.35, 5);
  else if (def.cost >= 5 || isLeader(key)) chatEv('enemyBig', def.name, null, 0.6, 8);
  const n = def.count;
  for (let i = 0; i < n; i++) { const ox = n > 1 ? (i - (n - 1) / 2) * 22 : 0, oy = n > 1 ? (i % 2) * 6 : 0, v = spawnUnit(team, key, clamp(x + ox, 24, W - 24), y + oy); if (team === 'p' && G.pDeployAdd) { v.deployT += G.pDeployAdd; v.deployMax = v.deployT; } }
  play('deploy', team === 'p' ? 1 : 0.5);
}
function playerPlay(slot, key, x, y) { playCard('p', slot, key, x, y); }
// echar una carta de la mano de un jugador: gasta el CAOS, saca las tropas y rota la mano (en PvP los dos lados juegan así)
function playCard(team, slot, key, x, y) {
  doDeploy(team, key, x, y); S[team].plays[key] = (S[team].plays[key] || 0) + 1;
  if (team === 'p' && G.tutMatch && G.tutB === 0) { G.tutB = 1; G.tutAt = G.tutT; tipBattle('¡Muy bien! Cada carta gasta <b>CAOS</b>: la barra morada de abajo. Se recarga sola.', 7); }
  if (slot >= 0) { const H = S[team], used = H.hand[slot]; H.hand[slot] = H.queue.shift(); H.queue.push(used); }
}
function tryPlayerDeploy(slot, key, x, y) {
  if (G.state !== 'play' || !key) return false;
  const card = CFG.cards[key];
  if (card.spell) { x = clamp(x, BOUNDS.x0, BOUNDS.x1); y = clamp(y, BOUNDS.y0, BOUNDS.y1); }   // v0.9.15: los hechizos se lanzan en cualquier sitio
  else { const sp = snapSpot('p', x, y); x = sp.x; y = sp.y; }
  if (isLeader(key) && !canDeploy('p', key)) { const nm = CFG.cards[key].name; toast(S.p.leaderCd > 0 ? `${nm} vuelve en ${Math.ceil(S.p.leaderCd)} s` : `${nm} ya está en el campo`); play('deny'); return false; }
  if (S.p.chaos < card.cost) { toast(`Te falta CAOS: ${Math.ceil(card.cost - S.p.chaos)} más`); play('deny'); return false; }
  if (PVP.on) pvpJugar(slot, key, x, y); else simCmd({ team: 'p', slot, key, x, y });   // la jugada se aplica al empezar el siguiente tick (SIM.delay), igual que en PvP
  hideTut();
  return true;
}
function targetable(t) { return t && t.alive && !(t.kind === 'unit' && (t.stealthT > 0 || t.jump || t.deployT > 0.2 || t.banT > 0)); }
function laneStruct(u) {
  const foe = other(u.team); const li = u.x < W / 2 ? 0 : 1;
  const tw = towers[foe][li]; if (tw.alive) return tw;
  return bases[foe];
}
const tauntR = o => (o.d.taunt ? o.d.taunt.r : o.abTaunt || 0);
const rangeOf = u => u.d.range * (u.mRange || 1);
