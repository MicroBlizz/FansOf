// Fans of Rumble · Combate (2/5): buscar objetivo, moverse, atacar, cadenas de rayos y pasivas
'use strict';

function acquire(u) {
  if (u.confT > 0) {   // v0.9.15: Confusión: se pelea con el aliado más cercano
    let b = null, bd2 = Infinity; for (const o of units) if (o !== u && o.alive && o.team === u.team && o.deployT <= 0 && !o.jump) { const d = edgeDist(u, o); if (d < bd2) { bd2 = d; b = o; } }
    if (b) return b;
  }
  const foe = other(u.team); let best = null, bd = Infinity;
  const ign = o => u.ignT > 0 && o === u.ign;   // v0.9.15: el que ha dejado de perseguir
  if (!u.d.buildings) {
    for (const o of units) if (o.team === foe && tauntR(o) && targetable(o) && edgeDist(u, o) <= tauntR(o)) return o;   // TrollBot y Provocación
    for (const o of units) if (o.team === foe && targetable(o) && !ign(o)) { const d = edgeDist(u, o); if (d < u.d.sight && d < bd) { bd = d; best = o; } }
  }
  for (const s of structs) if (s.team === foe && s.alive) { const d = edgeDist(u, s); if (d < u.d.sight * 0.55 && d < bd) { bd = d; best = s; } }
  return best || laneStruct(u);
}
function moveToward(u, tx, ty, dt) {
  let gx = tx, gy = ty;
  const inBand = u.y > RIVER.top - 2 && u.y < RIVER.bottom + 2;
  const uN = u.y < RIVER.y, tN = ty < RIVER.y;
  // puentes: cada unidad cruza por su sitio dentro del ancho del puente (antes todas iban al centro exacto
  // y, si llegaban dos juntas, se empujaban y se quedaban atascadas en la entrada)
  const bx = nearestBridge(u.x), lim = Math.max(4, BRIDGE_HALF - u.r * 0.6), ex = clamp(u.x, bx - lim, bx + lim);
  if (RIVER_OPEN) { /* río helado: se cruza por donde sea */ }
  else if (inBand) { gx = ex; gy = tN ? RIVER.top - 18 : RIVER.bottom + 18; }
  else if (uN !== tN) {
    const ey = uN ? RIVER.top - 8 : RIVER.bottom + 8;
    const atMouth = Math.abs(u.y - ey) <= 30 && Math.abs(u.x - bx) <= BRIDGE_HALF + u.r;   // ya está en la entrada: a cruzar
    gx = ex; gy = atMouth ? (uN ? RIVER.bottom + 18 : RIVER.top - 18) : ey;
  }
  const dx = gx - u.x, dy = gy - u.y, dl = hyp(dx, dy) || 1;
  const step = Math.min(dl, u.d.speed * (u.slowT > 0 ? 0.5 : 1) * u.mSpeed * (u.tSpd || 1) * (u.abFury && u.hp < u.maxHp * 0.5 ? u.abFury : 1) * (u.runT > 0 ? 3 : 1) * (u.drinkT > 0 ? 1 + u.abDrink : 1) * (u.actT > 0 ? 1.2 : 1) * (u.d.fury && u.hp < u.maxHp * u.d.fury.f ? u.d.fury.spd : 1) * dt);
  u.x += (dx / dl) * step; u.y += (dy / dl) * step; u.runDist += step;
  if (Math.abs(dx) > 3) u.face = dx > 0 ? 1 : -1;
  u.moving = true; u.walk += dt * u.d.speed * u.mSpeed * 0.2;
  if (u.mut === 'turbo' && Math.random() < dt * 14) parts.push({ type: 'dust', x: u.x - u.face * u.r, y: u.y, z: rand(2, 10), vx: -u.face * 20, vy: 0, vz: 4, g: 0, life: 0.35, max: 0.35, size: 2.4, color: '#ffe14d' });
}
function explodeBeaver(u, t) {
  const m = dmgMult(u);
  u.alive = false; u.hp = 0;
  hurt(t, u.d.dmg * m, u, 'aoe');
  for (const o of units) if (o.alive && o.team !== u.team && hyp(o.x - u.x, o.y - u.y) - o.r <= u.d.splash) hurt(o, u.d.splashDmg * m, u, 'aoe');
  ring(u.x, u.y, 8, u.d.splash * 1.6, 'rgba(255,170,60,.95)', 0.5, 7);
  puff(u.x, u.y, 14, '#ffb347', 90, 10, false, 10); puff(u.x, u.y, 8, '#8a8f9c', 60, 9, false, 16);
  chips(u.x, u.y, 12, 10, ['#e2463b', '#8a5a33', '#ffcb3d'], 'chip', 4); sparks(u.x, u.y, 14, 10, '#ffd34d'); flashAt(u.x, u.y, 14, 80, '255,160,60', 0.35); screenFlash(0.12);
  addNum(u.x, u.y, 62, '¡BUM!', '#ffb347', 22); if (u.team === 'p') chatEv('kamikaze', null, null, 0.5, 8);
  parts.push({ type: 'ghost', x: u.x, y: u.y, z: 26, vz: 30, life: 1.4, max: 1.4 });
  shake(8); play('boom');
}
function attack(u, t) {
  if (u.d.kamikaze) { explodeBeaver(u, t); return; }
  const surpriseM = u.stealthT > 0 ? u.d.surprise || u.abSurprise || 0 : 0, surprise = surpriseM > 0;
  u.stealthT = 0;
  let mult = dmgMult(u); const st = u.rage > 0 ? 'rage' : 'hit';
  const critHit = !!u.abCrit && srnd() < u.abCrit; if (critHit) { mult *= 3; addNum(t.x, t.y, topOf(t) + 30, '¡CRÍTICO!', '#ffd23f', 14); }
  const tf = u.tfBoost; if (tf) { mult *= 1.5; u.tfBoost = false; }
  if (u.d.leap && t.kind === 'unit' && (t.d.healer || t.d.ranged || ROLES[t.type] === 'support')) mult *= u.d.leap.mult;   // v0.9.15: mata-sanadores
  if (surprise && u.d.ranged) { mult *= surpriseM; addNum(t.x, t.y, topOf(t) + 22, '¡SORPRESA!', '#e6a8ff', 15); if (u.team === 'p') chatEv('stealth', null, null, 0.5, 12); }   // v0.9.13: GhostAgent
  if (u.d.chain) { zapChain(u, t, u.d.dmg * mult); u.lungeT = u.lungeMax = 0.16; const d = dst(u, t) || 1; u.lungeX = -(t.x - u.x) / d * 0.5; u.lungeY = -(t.y - u.y) / d * 0.5; return; }
  if (u.d.ranged) { shoot(u, t, u.d.ranged, u.d.dmg * mult, tf || critHit || surprise ? 'crit' : st); u.lungeT = u.lungeMax = 0.16; const d = dst(u, t) || 1; u.lungeX = -(t.x - u.x) / d * 0.85; u.lungeY = -(t.y - u.y) / d * 0.85; flashAt(u.x + (t.x - u.x) / d * 13, u.y + (t.y - u.y) / d * 4, topOf(u) * 0.6, 20, u.team === 'p' ? '255,220,140' : '170,215,255', 0.12); puff(u.x - (t.x - u.x) / d * 5, u.y, 2, '#e9dcc0', 22, 3.5, true); return; }
  u.lungeT = u.lungeMax = 0.24; const d = dst(u, t) || 1; u.lungeX = (t.x - u.x) / d; u.lungeY = (t.y - u.y) / d;
  puff(u.x - u.lungeX * 4, u.y, 3, '#e9dcc0', 34, 4.5, true);   // v0.9.24: levanta polvo al lanzarse
  let dmg = u.d.dmg * mult, crit = surprise || tf || critHit;
  if (surprise) { dmg *= surpriseM; addNum(t.x, t.y, topOf(t) + 22, '¡SORPRESA!', '#e6a8ff', 15); if (u.team === 'p') chatEv('stealth', null, null, 0.5, 12); }
  if (u.d.charge && u.runDist >= u.d.charge.dist) {   // Minotaur: embestida si llega corriendo
    const C = u.d.charge; dmg *= C.mult; crit = true;
    if (t.kind === 'unit') { t.stunT = Math.max(t.stunT, C.stun); t.stunKind = 'daze'; }
    addNum(t.x, t.y, topOf(t) + 24, '¡EMBESTIDA!', '#ffb347', 15); puff(u.x, u.y, 8, '#e9dcc0', 60, 7, true); shake(4); play('slam');
  }
  u.runDist = 0;
  if (u.d.combo) {   // v0.9.13: ProGamer, cada 4.º golpe es un combo
    const C = u.d.combo; u.comboN = (u.comboN || 0) + 1;
    if (u.comboN >= C.n) { u.comboN = 0; dmg *= C.mult; crit = true; if (t.kind === 'unit' && !t.immuneCC) { t.stunT = Math.max(t.stunT, C.stun); t.stunKind = 'daze'; } addNum(t.x, t.y, topOf(t) + 26, '¡COMBO x' + C.n + '!', '#7be04a', 16); flashAt(t.x, t.y, topOf(t) * 0.5, 40, '123,224,74', 0.25); play('hype'); }
  }
  if (u.d.steal && t.kind === 'struct' && S) {   // v0.9.13: CobraDLC te cobra CAOS en cada golpe a un edificio
    const foe = other(u.team), n = Math.min(S[foe].chaos, u.d.steal);
    if (n > 0.05) { S[foe].chaos -= n; S[u.team].chaos = Math.min(CFG.chaosMax, S[u.team].chaos + n); addNum(t.x, t.y, topOf(t) + 30, `¡COBRADO! -${fmtV(rnd(n, 1))} CAOS`, '#ffcb3d', 13); play('card'); }
  }
  if (u.d.stonks && t.kind === 'struct') {   // Stonks: cada golpe a un edificio pega más
    const K = u.d.stonks; dmg *= 1 + u.stonk * K.step; if (u.stonk < K.max) u.stonk++;
    if (u.stonk % 3 === 0) addNum(u.x, u.y, topOf(u) + 16, 'STONKS ↑', '#4ade80', 13);
  }
  const sl = u.d.slow || u.abSlow;
  if (sl && t.kind === 'unit' && t.alive && !t.immuneCC) { t.slowT = sl.t; chips(t.x, t.y, topOf(t) * 0.5, 3, ['#9fe3ff', '#ffffff'], 'chip', 2.5); }
  const heavy = isLeader(u.type) || u.r >= 18 || dmg >= 40;   // v0.9.24: golpe pesado (líderes, gigantes y golpes de 40+)
  slashFx(u, t, heavy || crit);
  hurt(t, dmg, u, crit ? 'crit' : st);
  if (crit) { hitStop(0.09); shake(3.5); } else if (heavy) { hitStop(0.05); shake(2); }
  if (u.abSplash) confetti(u, t, dmg * u.abSplash);
  if (u.abChain) chainOne(u, t, dmg * u.abChain);
  if (u.d.cleave) {   // BanHammer: el martillazo también da a los de alrededor
    for (const o of units) if (o !== t && o.alive && o.team !== u.team && targetable(o) && dst(o, t) - o.r <= u.d.cleave.r) { hurt(o, dmg * u.d.cleave.f, u, 'aoe'); knockBack(u, o); }
    ring(t.x, t.y, 6, u.d.cleave.r, 'rgba(255,255,255,.85)', 0.3, 4);
  }
  if ((u.d.knock || u.abKnock) && t.kind === 'unit') knockBack(u, t);
}
// habilidad Rayo en cadena: el golpe salta a otro enemigo cercano
function chainOne(u, t, dmg) {
  let best = null, bd = 75;
  for (const o of units) if (o !== t && o.team !== u.team && targetable(o)) { const dd = dst(o, t); if (dd < bd) { bd = dd; best = o; } }
  if (!best) return;
  parts.push({ type: 'zap', pts: [[t.x, t.y, topOf(t) * 0.5], [best.x, best.y, topOf(best) * 0.5]], life: 0.22, max: 0.22, seed: Math.random() * 1000 });
  hurt(best, dmg, u, 'aoe');
}
function knockBack(u, t) {
  if (!t.alive || t.jump || t.immuneCC) return;
  const kn = u.d.knock || u.abKnock || 0, dd = dst(u, t) || 1; t.x += (t.x - u.x) / dd * kn; t.y += (t.y - u.y) / dd * kn * 0.7;
  puff(t.x, t.y, 4, '#e9dcc0', 30, 5, true);
}
// ThunderGod: rayo que salta entre enemigos
function zapChain(u, t, dmg) {
  const C = u.d.chain; const pts = [[u.x + u.face * 14, u.y, topOf(u) * 1.05], [t.x, t.y, topOf(t) * 0.5]];
  const hit = [t]; let cur = t, d = dmg;
  hurt(t, dmg, u, 'hit');
  for (let i = 0; i < C.n; i++) {
    d *= C.f; let best = null, bd = C.r;
    for (const o of units) if (o.team !== u.team && targetable(o) && !hit.includes(o)) { const dd = dst(o, cur); if (dd < bd) { bd = dd; best = o; } }
    if (!best) break;
    pts.push([best.x, best.y, topOf(best) * 0.5]); hurt(best, d, u, 'aoe'); hit.push(best); cur = best;
  }
  parts.push({ type: 'zap', pts, life: 0.3, max: 0.3, seed: Math.random() * 1000 });
  sparks(t.x, t.y, topOf(t) * 0.5, 5, '#ffe14d'); play('zap');
}
// cada frame: aura de StreamKing y Rabia de los Animales Locos
function updatePassives() {
  const R = CFG.passives.animales;
  if (S) for (const tm of ['p', 'e']) if (facOf(tm) === 'gamer') {   // v0.9.13: Comunidad
    const set = new Set(); for (const u of units) if (u.alive && u.team === tm && u.deployT <= 0) set.add(u.type);
    const n = Math.min(CFG.passives.gamer.max, set.size), St = S[tm];
    if (n === CFG.passives.gamer.max && (St.comm || 0) < n && tm === 'p' && !St.commMax) { St.commMax = true; banner('¡COMUNIDAD AL MÁXIMO!', '6 tipos de unidad en el campo: +30 % de daño para todos', 'gamer'); play('hype'); }
    St.comm = n;
  }
  const auras = units.filter(a => a.alive && a.d.aura && a.deployT <= 0);
  for (const u of units) {
    u.aura = 0;
    if (auras.length && u.alive && u.deployT <= 0) for (const a of auras) if (a.team === u.team && dst(a, u) <= a.d.aura.r) { u.aura = a.d.aura.mult; break; }
    if (facOf(u.team) !== 'animales') { u.rage = 0; continue; }
    let n = 0;
    if (u.alive && u.deployT <= 0) for (const o of units) { if (o !== u && o.alive && o.team === u.team && o.deployT <= 0 && Math.abs(o.x - u.x) < R.radius && Math.abs(o.y - u.y) < R.radius && dst(o, u) <= R.radius) n++; }
    n = Math.min(R.maxStacks, n);
    if (n === R.maxStacks && !u.rageShown) { u.rageShown = true; addNum(u.x, u.y, TYPES[u.type].top + 20, '¡RABIA MÁXIMA!', '#ff8a3d', 13); }
    u.rage = n;
  }
}
function dmgMult(u) {
  let m = (u.mDmg || 1) * (u.mLvl || 1);
  if (S) {
    const f = facOf(u.team);
    if (f === 'animales') m *= 1 + (u.rage || 0) * CFG.passives.animales.perAlly;
    else if (f === 'heroes') m *= 1 + S[u.team].xpLvl * CFG.passives.heroes.step;
    else if (f === 'gamer') m *= 1 + (S[u.team].comm || 0) * CFG.passives.gamer.step;
  }
  if (u.d.fury && u.hp < u.maxHp * u.d.fury.f) m *= u.d.fury.mult;
  if (u.aura) m *= u.aura;
  if (u.abFury && u.hp < u.maxHp * 0.5) m *= u.abFury;
  if (u.drinkT > 0) m *= 1 + u.abDrink;
  if (u.shrinkT > 0) m *= u.shrinkF || 0.6;   // v0.9.15: Nerfeo divino y Remake
  return m;
}
// Hype (Streamers), Turbo (Memes) y equipo/habilidades aceleran los ataques
const cdMult = u => (u.mCd || 1) * (u.actT > 0 ? 0.7 : 1) * (u.zombT > 0 ? 2 : 1) * (u.hasteT > 0 ? 0.7 : 1) * (u.crunchT > 0 ? 0.5 : 1) / (S && facOf(u.team) === 'streamers' ? 1 + S[u.team].hypeLvl * CFG.passives.streamers.step : 1);
function topOf(e) { return e.kind === 'unit' ? TYPES[e.type].top * (e.mScale || 1) * (e.shrinkT > 0 ? e.shrinkF || 0.6 : 1) : TOPS[e.skin + '_' + e.role]; }
