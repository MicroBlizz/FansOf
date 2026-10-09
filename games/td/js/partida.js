// Fans of TD · Partida: oleadas, el bucle de juego, el final del nivel, el modo contra la IA y la fusión de torres
'use strict';

/* ---------- oleadas ---------- */
function buildWave(L, w) {
  const R = mulberry32(L.wi * 1000 + L.li * 100 + w * 7 + 3);
  const avail = L.deck.filter((k, i) => w >= 1 + i * 2 - (i ? 1 : 0));
  let budget = (5 + w * 3.4 + Math.pow(w, 1.5) * 0.6) * L.bud;
  const q = [];
  // los fuertes nunca abren la oleada
  q.push(L.deck[0]);
  // pocos sanadores por oleada: un montón curándose entre ellos no hay quien lo tumbe
  let heals = 0; const maxHeals = 1 + ((w / 4) | 0);
  while (budget > 0) { let k = avail[(R() * avail.length) | 0]; if (CFG.units[k].healer && ++heals > maxHeals) k = avail[0]; q.push(k); budget -= FOES[k].cost; }
  if (L.boss && w === L.waves) q.push(L.boss);
  return q.map((k, i) => ({ k, gap: i === 0 ? 0 : FOES[k].cost >= 5 ? 1.7 : FOES[q[i - 1]].cost >= 5 ? 1.2 : 0.75 + R() * 0.35 }));
}
function startWave() {
  if (G.inWave || G.wave >= G.waves || G.over) return;
  if (G.wave > 0 && G.nextT > 0) { const b = Math.round(G.nextT * TD.earlyBonus); if (b > 0) { G.gold += b; num(470, 700, '+' + b, '#ffcb3d', 16); } }
  G.wave++; G.inWave = true; G.spawnQ = buildWave(G.level, G.wave); G.spawnT = 0;
  G.hpMul = G.level.hp * (1 + G.level.growth * (G.wave - 1));
  banner('OLEADA ' + G.wave + (G.wave === G.waves ? ' · ¡LA ÚLTIMA!' : '')); sfx('horn');
}
function waveDone() {
  G.inWave = false; cuenta('wave'); const b = TD.waveBonus(G.wave); G.gold += b; num(270, 420, '+' + b + ' de CAOS', '#ffcb3d', 20);
  if (G.wave >= G.waves) return finish(true);
  G.nextT = 12;
}

/* =========================================================
   BUCLE
   ========================================================= */
function update(dt) {
  G.t += dt;
  if (G.inWave) {
    G.spawnT -= dt; if (G.vs && !G.spawnQ.length) G.spawnT = 0;
    while (G.spawnQ.length && G.spawnT <= 0) { const s = G.spawnQ.shift(), nf = spawnFoe(s.k, null, FOES[s.k].boss ? G.level.hp : G.hpMul); if (s.lvl > 1) unitLevel(nf, s.lvl); G.spawnT += G.spawnQ.length ? G.spawnQ[0].gap : 0; }
    if (!G.vs && !G.spawnQ.length && !G.foes.length) waveDone();
  } else if (G.wave > 0 && G.wave < G.waves && !G.over) { G.nextT -= dt; if (G.nextT <= 0) { G.nextT = 0; startWave(); } }
  // enemigos
  for (const f of G.foes) {
    f.hitT = Math.max(0, f.hitT - dt); f.slowT -= dt; if (f.slowT <= 0) f.slowF = 1;
    if (f.stunT > 0) { f.stunT -= dt; continue; }
    const x0 = f.x, y0 = f.y; walkFoe(f, f.speed * f.slowF * (f.rushT > 0 ? 3 : 1) * dt);
    f.vx = (f.x - x0) / dt; f.vy = (f.y - y0) / dt; f.walk += Math.hypot(f.x - x0, f.y - y0) * 0.22;
    if (f.x - x0 > 0.05) f.face = 1; else if (f.x - x0 < -0.05) f.face = -1;
    const U = CFG.units[f.art];
    if (U && U.healer) { f.healT -= dt; if (f.healT <= 0) { f.healT = U.healCd; let best = null; for (const o of G.foes) if (o !== f && !o.dead && !healerOf(o) && o.hp < o.maxHp && Math.hypot(o.x - f.x, o.y - f.y) < U.healR && (!best || o.hp / o.maxHp < best.hp / best.maxHp)) best = o; if (best) { const h = U.heal * TD.foeHeal * G.hpMul; best.hp = Math.min(best.maxHp, best.hp + h); num(best.x, best.y - topOf(best), '+' + Math.round(h), '#9ef07a', 12); ring(best.x, best.y - 10, 18, 'rgba(158,240,122,.9)'); } } }
    const F = FOES[f.k];
    if (F.despido) { f.despT -= dt; if (f.despT <= 0) { f.despT = F.despido.cd; let best = null, bd = 1e9; for (const t of G.towers) { const dd = Math.hypot(t.x - f.x, t.y - f.y); if (dd < F.despido.range && dd < bd && t.stunT <= 0) { bd = dd; best = t; } } if (best) { best.stunT = F.despido.t * (1 - Math.min(1, best.M.T.desp || 0)); best.stunTxt = F.despido.text; pop(best.x, best.y - 56, F.despido.text, '#fff6ea', 18); G.projs.push({ kind: 'letter', x: f.x, y: f.y - 60, tx: best.x, ty: best.y - 20, t: 0, dur: 0.5 }); sfx('womp'); } } }
    if (F.summon && !f.atBase) { f.sumT -= dt; if (f.sumT <= 0) { f.sumT = F.summon.cd; for (let i = 0; i < F.summon.n; i++) spawnFoe(F.summon.k, f).minion = true; pop(f.x, f.y - topOf(f) - 10, F.summon.text, '#ff4b5c', 17); ring(f.x, f.y, 40, 'rgba(255,75,92,.9)'); sfx('womp'); } }
    if (f.shMax && f.sh < f.shMax) { f.shT -= dt; if (f.shT <= 0) f.sh = Math.min(f.shMax, f.sh + f.shMax * ETRAITS.ciber.regen * dt); }
    if (f.fog > 0) { for (const t of G.towers) if (Math.hypot(t.x - f.x, t.y - f.y) <= rangeOf(t) + f.r) { f.fog -= dt; break; } }
    // en La Madriguera: la atacan una vez por segundo hasta que los tumbes
    if (f.atBase && Math.hypot(f.bx - f.x, f.by - f.y) < 2) {
      f.face = DEN.x >= f.x ? 1 : -1; f.atkT -= dt;
      if (f.atkT <= 0) { f.atkT = TD.baseAtkCd; f.lunge = 0.25; hitBase(F.leak * (f.U ? 1 + (f.U.leak || 0) : 1) * (f.leakM || 1), f); if (ETRAITS[G.efac].steal && G.gold > 0) { const st = Math.min(G.gold, ETRAITS[G.efac].steal); G.gold -= st; num(DEN.x + rand(-30, 30), DEN.y - 60, '-' + st + ' CAOS', '#ffcb3d', 13); } G.denHitT = 0.2; shake(1 + F.leak * 0.5); sfx('leak'); num(f.x, f.y - topOf(f) - 4, '-' + F.leak, '#ff4b5c', 15); spark(lerp(f.x, DEN.x, 0.3), f.y - 12, '#ff4b5c'); if (G.lives <= 0) finish(false); }
    }
    if (f.lunge > 0) f.lunge -= dt;
    if (f.markT > 0) f.markT -= dt;
    if (f.invT > 0) f.invT -= dt; if (f.rushT > 0) f.rushT -= dt;
    if (f.U && f.U.regen && f.hp < f.maxHp) f.hp = Math.min(f.maxHp, f.hp + f.maxHp * f.U.regen * dt);
  }
  // la base se defiende sola: dispara a los que la están golpeando (primero a los que curan, luego al más tocado)
  G.denT -= dt;
  if (G.denT <= 0) { let tg = null; for (const f of G.foes) if (f.atBase && !f.dead && (!tg || (healerOf(f) - healerOf(tg) || tg.hp - f.hp) > 0)) tg = f; if (tg) { G.denT = TD.baseCd; bolt(DEN.x, DEN.y - 46, tg.x, tg.y - topOf(tg) * 0.5, '#ffe9a8'); hurt(tg, TD.baseDmg); sfx('shot'); } else G.denT = 0.1; }
  G.foes = G.foes.filter(f => !f.dead);
  // torres
  G.teamDmg = teamDmg(); G.teamSpd = teamSpeed();
  if (G.fac === 'ciber') { G.shieldT -= dt; if (G.shieldT <= 0) G.shield = Math.min(PASSIVES.ciber.amt, G.shield + PASSIVES.ciber.regen * dt); }
  for (const t of G.towers) {
    const D = tdef(t); t.rage = rageOf(t); t.atkT = Math.max(0, t.atkT - dt); t.dropT = Math.max(0, t.dropT - dt); if (t.hasteT > 0) t.hasteT -= dt;
    if (t.stunT > 0) { t.stunT -= dt; continue; }
    if (t.jump) { jumpStep(t, dt); continue; }
    if (D.jump) { t.jumpT -= dt; if (t.jumpT <= 0 && tryJump(t)) continue; }
    if (D.ab) { t.abT -= dt; if (t.abT <= 0) t.abT = ability(t, D) ? D.ab.cd : 0.5; }
    if (t.M.T.grito) { t.gritoT -= dt; if (t.gritoT <= 0) { const fs = G.foes.filter(f => !f.dead && Math.hypot(f.x - t.x, f.y - t.y) <= 75 + f.r); if (fs.length) { t.gritoT = 9; for (const f of fs) stunFoe(f, t.M.T.grito); ring(t.x, t.y, 75, 'rgba(230,220,255,.95)'); pop(t.x, t.y - 64, '¡GRITO!', '#e6dcff', 14); } else t.gritoT = 0.5; } }
    if (D.kind === 'aura') continue;
    t.cdT -= dt * (1 + auraOf(t) + G.teamSpd + (t.hasteT > 0 ? t.hasteF : 0) + (t.M.T.spd || 0));
    if (t.cdT > 0) continue;
    const tgt = targetOf(t);
    if (!tgt) { t.ramp = 0; continue; }
    // SECUELA (Cultura Pop): algunos ataques se repiten enseguida con menos daño
    const seq = t.sequel; t.sequel = false;
    attack(t, tgt, seq ? PASSIVES.pop.mult : 1);
    t.cdT = D.cd * (t.mut.cd || 1);
    if (!seq && t.fac === 'pop' && Math.random() < PASSIVES.pop.chance) { t.sequel = true; t.cdT = 0.22; }
  }
  // proyectiles
  for (const p of G.projs) {
    p.t += dt;
    if (p.target) {
      const f = p.target, ty = f.y - topOf(f) * 0.5, dx = f.x - p.x, dy = ty - p.y, L = Math.hypot(dx, dy), st = p.speed * dt;
      if (f.dead && L > st) { p.target = null; p.tx = f.x; p.ty = ty; p.dur = p.t + L / p.speed; p.sx = p.x; p.sy = p.y; p.t0 = p.t; continue; }
      if (L <= st || f.dead) { p.done = true; if (!f.dead) projHit(p, f); spark(p.x, p.y, '#ffd34d'); continue; }
      p.x += (dx / L) * st; p.y += (dy / L) * st; p.rot = (p.rot || 0) + dt * 14; p.ang = Math.atan2(dy, dx);
    } else if (p.kind === 'letter') { if (p.t >= p.dur) p.done = true; }
    else if (p.sx != null && p.arc) {
      const k = Math.min(1, p.t / p.dur); p.x = lerp(p.sx, p.tx, k); p.y = lerp(p.sy, p.ty, k) - Math.sin(k * Math.PI) * p.arc; p.rot = (p.rot || 0) + dt * 9;
      if (k >= 1) { p.done = true; boom(p.tx, p.ty, p.splash, p.kind); for (const f of G.foes) if (Math.hypot(f.x - p.tx, f.y - p.ty) <= p.splash + f.r * 0.5) strike(p.src, f, p.dmg); }
    } else if (p.t >= (p.dur || 0.3)) p.done = true;
  }
  G.projs = G.projs.filter(p => !p.done);
  for (const q of G.parts) { q.t += dt; q.x += (q.vx || 0) * dt; q.y += (q.vy || 0) * dt; if (q.g) q.vy += q.g * dt; }
  G.parts = G.parts.filter(q => q.t < q.life);
  for (const n of G.nums) { n.t += dt; n.y -= dt * 28; }
  G.nums = G.nums.filter(n => n.t < n.life);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 30);
  if (G.denHitT > 0) G.denHitT -= dt;
}
// anda hacia la casilla siguiente del camino más corto; al llegar a la salida va a pegarle a La Madriguera
function walkFoe(f, step) {
  for (let n = 0; step > 0 && n < 4; n++) {
    let tx, ty;
    if (f.atBase) { tx = f.bx; ty = f.by; }
    else { tx = ccx(f.goal) + f.ox; ty = ccy(f.goal) + f.oy; }
    const dx = tx - f.x, dy = ty - f.y, L = Math.hypot(dx, dy);
    if (L > step) { f.x += (dx / L) * step; f.y += (dy / L) * step; return; }
    f.x = tx; f.y = ty; step -= L;
    if (f.atBase) return;
    if (EXIT.has(f.goal)) { f.atBase = true; f.bx = DEN.x + rand(-48, 48); f.by = GY1 - rand(4, 14); f.atkT = 0.3; continue; }
    const nx = nextCell(f.goal); if (nx < 0) return; f.goal = nx;
  }
}
// CrazyBunny: Chaos Jump sobre el grupo más grande
function tryJump(t) {
  const J = tdef(t).jump; let best = null, bn = 0;
  for (const f of G.foes) { if (Math.hypot(f.x - t.x, f.y - t.y) > J.range) continue; let n = 0; for (const o of G.foes) if (Math.hypot(o.x - f.x, o.y - f.y) <= J.r) n++; if (n > bn) { bn = n; best = f; } }
  if (!best) { t.jumpT = 0.5; return false; }
  t.jump = { t: 0, x0: t.x, y0: t.y, x1: best.x, y1: best.y, hit: false }; t.face = best.x >= t.x ? 1 : -1; sfx('jump'); return true;
}
function jumpStep(t, dt) {
  const J = t.jump, D = tdef(t).jump; J.t += dt;
  if (!J.hit && J.t >= 0.45) {
    J.hit = true; const dmg = D.dmg * lvlMul(t) * (1 + TD.rage.perAlly * t.rage);
    for (const f of G.foes) if (Math.hypot(f.x - J.x1, f.y - J.y1) <= D.r + f.r) { strike(t, f, dmg); stunFoe(f, D.stun); }
    ring(J.x1, J.y1, D.r, 'rgba(255,203,61,.95)'); burst(J.x1, J.y1, ['#ffcb3d', '#fff6ea', '#ff7a1a'], 22); pop(J.x1, J.y1 - 70, '¡CHAOS JUMP!', '#ffcb3d', 20); shake(6); sfx('boom');
  }
  if (J.t >= 1.15) { t.jump = null; t.jumpT = D.cd; t.dropT = 0.25; }
}
function finish(win) {
  if (G.over) return; G.over = true; G.place = null; G.sel = null;
  if (G.vs) { const w = G.vsCur === 'ai'; setTimeout(() => showVsResult(w), 800); return; }   // en VS gana quien tumba la base del otro
  const L = G.level, st = win ? (G.lives >= TD.baseHp * 0.9 ? 3 : G.lives >= TD.baseHp / 2 ? 2 : 1) : 0;
  const first = win && !starsOf(L.id), first3 = win && st === 3 && starsOf(L.id) < 3;
  cierraRetos(win, { jefe: !!L.boss, estrellas: Math.max(0, st - starsOf(L.id)), vida: G.lives, camino: G.route.length });   // misiones y logros
  G.rw = campReward(L, win, st, first, first3) + passMatch(win);
  if (win && st > starsOf(L.id)) { SAVE.stars[L.id] = st; saveGame(); }
  setTimeout(() => showResult(win, st, first), win ? 900 : 600);
}

/* =========================================================
   MODO VS: tú contra un rival que lleva el juego. Cada uno defiende su campo y manda unidades al del otro.
   Los dos campos usan el mismo motor: el estado de un campo se guarda y se carga en G para simularlo o dibujarlo.
   ========================================================= */
const BOARD_F = ['gold', 'lives', 'foes', 'towers', 'projs', 'parts', 'nums', 'spawnQ', 'spawnT', 'route', 'kills', 'fac', 'efac', 'shield', 'shieldT', 'denHitT', 'denT', 'boss', 'teamDmg', 'teamSpd', 'shake', 'hpMul'];
function saveBoard(B) { for (const k of BOARD_F) B[k] = G[k]; B.block.set(BLOCK); B.dist = DIST; }
function loadBoard(B, who) { for (const k of BOARD_F) G[k] = B[k]; BLOCK.set(B.block); DIST = B.dist; G.vsCur = who; }
// fac: la raza que defiende ese campo · efac: la raza de las unidades que le llegan (la del otro jugador)
const newBoard = (fac, efac) => ({ gold: VS.gold, lives: TD.baseHp, foes: [], towers: [], projs: [], parts: [], nums: [], spawnQ: [], spawnT: 0, route: [], kills: 0, fac, efac, shield: fac === 'ciber' ? PASSIVES.ciber.amt : 0, shieldT: 0, denHitT: 0, denT: 0,
  boss: null, teamDmg: 1, teamSpd: 0, shake: 0, hpMul: 1, block: new Uint8Array(NCELL), dist: null, income: VS.income, sent: 0 });
const VS_LEVEL = { id: 'VS', name: 'Modo VS', hp: 1, growth: 0, bud: 1 };
const sendCost = k => Math.max(10, Math.round(FOES[k].cost * VS.sendCost / 5) * 5);
const sendIncome = k => Math.max(1, Math.round(sendCost(k) * VS.incomeRate));
function startVS(diff) {
  G.rt = {};
  const fac = facNow(), rival = pick(FACTION_ORDER.filter(f => f !== fac && TOWERS[f]));
  const me = newBoard(fac, rival), ai = newBoard(rival, fac);
  // el rival empieza con una línea vertical en el centro (los enemigos la recorren entera y todas las torres les pegan)
  // y luego la convierte en un laberinto en serpentina
  const plan = [], mid = (COLS - 1) / 2;
  for (const r of [6, 7, 5, 4, 3, 8, 9, 10, 2, 11, 12]) plan.push([mid, r]);   // la 6.ª (su líder) cae en una fila de muro, que nunca se vende
  // después, muro a muro: antes de cerrar cada fila horizontal vende las torres del centro que taparían el pasillo de encima,
  // para que el camino pase de bajar recto a hacer giros de lado a lado
  [2, 5, 8, 11].forEach((r, ri) => {
    if (ri) for (const sr of [r - 2, r - 1]) plan.push(['vender', mid, sr]);
    const cols = []; for (let c = 0; c < COLS; c++) if (ri % 2 ? c !== 0 : c !== COLS - 1) cols.push(c); cols.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid)); cols.forEach(c => plan.push([c, r]));
  });
  plan.push(['vender', mid, 12]);
  Object.assign(G, { screen: 'play', level: VS_LEVEL, wave: 1, waves: 1, inWave: true, nextT: 0, place: null, ghost: null, sel: null, over: false, paused: false, trayMode: 'build' });
  G.vs = { me, ai, view: 'me', t: 0, tickT: VS.tick, stolen: 0, diff, aiT: 1.5, plan, pi: 0, n: 0, def: 0, snd: 0, defDone: false };
  me.ulvl = {}; ai.ulvl = {};   // nivel de cada unidad dentro de esta partida
  loadBoard(ai, 'ai'); reflow(); saveBoard(ai); loadBoard(me, 'me'); reflow();
  BG = bgOf(fac); hidePanel(); showScreen(null); buildTray(); hud();
  banner('VS ' + FACTIONS[rival].name.toUpperCase());
}
// un paso de la partida: tu campo, luego el del rival
function vsUpdate(dt) {
  const V = G.vs; V.t += dt; const hp = Math.pow(2, V.t / VS.hpDouble);
  V.tickT -= dt;
  if (V.tickT <= 0) { V.tickT += VS.tick; G.gold += V.me.income; V.ai.gold += Math.round(V.ai.income * VS.ai[V.diff]); num(70, 96, '+' + V.me.income + ' de ingresos', '#ffcb3d', 15); if (V.view === 'me') sfx('coin'); }
  G.hpMul = hp; update(dt); vsSteal(V.ai);
  if (G.over) return;
  saveBoard(V.me); loadBoard(V.ai, 'ai');
  G.hpMul = hp; V.aiT -= dt; if (V.aiT <= 0) { V.aiT = 0.8; aiThink(); }
  update(dt); G.t -= dt; vsSteal(V.me);
  saveBoard(V.ai); loadBoard(V.me, 'me');
}
// lo que tus unidades le quitan a la base rival se lo queda la tuya (y al revés)
function vsSteal(to) { const V = G.vs; if (V.stolen > 0) { to.lives = Math.min(VS.maxHp, to.lives + V.stolen * VS.steal); V.stolen = 0; } }
function vsSend(k) {
  const V = G.vs, c = sendCost(k); if (G.over || G.gold < c) return false;
  if (V.ai.spawnQ.length >= VS.queue) { num(270, 720, 'COLA LLENA', '#ff4b5c', 14); return false; }
  G.gold -= c; xpPlay(k); cuenta('envio'); cuenta('caos', c); V.me.income += sendIncome(k); V.me.sent++; V.ai.spawnQ.push({ k, gap: VS.gap, lvl: V.me.ulvl[k] || 1 });
  num(270, 720, '+' + sendIncome(k) + ' ingresos', '#ffcb3d', 14); sfx('horn'); return true;
}
// mejorar una unidad dentro de la partida: las que envíes a partir de ahora salen más duras y pegan más a la base
const unitUpCost = (k, lvl) => Math.round(sendCost(k) * VS.upCost[lvl] / 5) * 5;
function vsUpgrade(k) {
  const V = G.vs, l = V.me.ulvl[k] || 1, c = unitUpCost(k, l); if (G.over || l >= TD.maxLevel) return false;
  if (G.gold < c) { num(270, 720, 'FALTA CAOS', '#ffcb3d', 14); return false; }
  G.gold -= c; V.me.ulvl[k] = l + 1; num(270, 720, CFG.cards[k].name + ' · NIVEL ' + (l + 1), '#c58cff', 15); sfx('up'); return true;
}
function unitLevel(f, lvl) {
  const m = 1 + VS.upHp * (lvl - 1);
  f.hp = f.maxHp = Math.round(f.maxHp * m); f.shMax = Math.round(f.shMax * m); f.sh = f.shMax; f.leakM = 1 + VS.upLeak * (lvl - 1); f.ulvl = lvl; f.sc *= 1 + 0.07 * (lvl - 1);
}
// el rival: reparte su oro entre defenderse y mandarte unidades
function aiThink() {
  const V = G.vs, fac = G.fac, ks = Object.keys(TOWERS[fac]), lead = ks[0], rest = ks.slice(1), cheap = rest[0];
  for (let guard = 0; guard < 6; guard++) {
    const threat = G.foes.length > 8 || G.lives < TD.baseHp * 0.7;
    const early = V.t < VS.aiGrace || V.n < 5;   // al principio solo se defiende, para que te dé tiempo a montar algo
    if (!V.defDone && (early || threat || V.def <= V.snd * VS.aiDef)) {
      if (V.pi < V.plan.length && V.plan[V.pi][0] === 'vender') {
        const [, sc, sr] = V.plan[V.pi], t = G.towers.find(o => o.cell === idx(sc, sr)); V.pi++;
        if (t && !tdef(t).leader) sell(t);
      } else if (V.pi < V.plan.length) {
        let k = V.n === 5 ? lead : V.n < 4 ? cheap : rest[(V.n * 7 + 3) % rest.length];
        if (G.gold < TOWERS[fac][k].cost) { if (G.gold >= TOWERS[fac][cheap].cost) k = cheap; else return; }
        const [c, r] = V.plan[V.pi], why = whyNot(c, r);
        if (!why && build(k, c, r)) { V.pi++; V.n++; V.def += TOWERS[fac][k].cost; } else if (why && why !== 'enemigo') V.pi++; else return;
      } else {
        const t = G.towers.filter(o => o.lvl < TD.maxLevel).sort((a, b) => a.lvl - b.lvl)[0]; if (!t) { V.defDone = true; continue; }
        const c = upCost(t); if (G.gold < c) return; upgrade(t); V.def += c;
      }
    } else {
      const opts = FACTIONS[fac].units.filter(k => sendCost(k) <= G.gold).sort((a, b) => sendCost(b) - sendCost(a)); if (!opts.length) return;
      if (early || V.me.spawnQ.length >= VS.queue) return;
      const k = opts[(Math.random() * Math.min(3, opts.length)) | 0], c = sendCost(k);
      // de vez en cuando, en vez de enviar, mejora la unidad que iba a mandar
      const ul = V.ai.ulvl[k] || 1, uc = unitUpCost(k, ul);
      if (ul < TD.maxLevel && G.gold >= uc && Math.random() < VS.aiUp) { G.gold -= uc; V.ai.ulvl[k] = ul + 1; V.snd += uc; continue; }
      G.gold -= c; V.ai.income += sendIncome(k); V.ai.sent++; V.snd += c; V.me.spawnQ.push({ k, gap: VS.gap, lvl: ul });
    }
  }
}
function vsView(v) {
  const V = G.vs; V.view = v; G.place = null; G.ghost = null; G.sel = null; hidePanel(); hud();
}
/* ---------- fusión de torres en contacto ---------- */
// dos torres iguales, del mismo nivel y pegadas (arriba, abajo o a los lados) se pueden fusionar en una de un nivel más
function fuseMate(t) {
  if (t.lvl >= TD.fuseMax || tdef(t).leader) return null;
  const c = t.cell % COLS, r = (t.cell / COLS) | 0;
  for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue; const o = G.towers.find(o => o.cell === idx(nc, nr)); if (o && o.k === t.k && o.lvl === t.lvl && o.fac === t.fac) return o; }
  return null;
}
function fuse(t) {
  const o = fuseMate(t); if (!o) return;
  G.towers = G.towers.filter(x => x !== o); BLOCK[o.cell] = 0; reflow();
  t.lvl++; t.spent += o.spent; t.dropT = 0.2; cuenta('fusion'); if (t.lvl >= TD.fuseMax) cuenta('nivel5');
  puff(o.x, o.y, '#d9b77e', 12); ring(t.x, t.y, 46, 'rgba(197,140,255,.95)'); burst(t.x, t.y - 20, ['#c58cff', '#ffcb3d', '#fff6ea'], 18); pop(t.x, t.y - 54, '¡FUSIÓN! NIVEL ' + t.lvl, '#c58cff', 16); sfx('up');
}

/* =========================================================
   EFECTOS
   ========================================================= */
const num = (x, y, s, col, size = 14) => G.nums.push({ x, y, s: String(s), col, size, t: 0, life: 0.9 });
// los avisos («¡CHAOS JUMP!», «¡DESPEDIDO!»…) salen encima o, si lo eliges en Opciones, en la caja de abajo a la derecha
const pop = (x, y, s, col, size = 18) => { if (SAVE.feed && G.screen === 'play' && (!G.vs || G.vsCur === G.vs.view)) feedAdd(s, col); else G.nums.push({ x, y, s, col, size, t: 0, life: 1.3, big: true }); };
const ring = (x, y, r, col) => G.parts.push({ kind: 'ring', x, y, r, col, t: 0, life: 0.35 });
const spark = (x, y, col) => G.parts.push({ kind: 'dot', x, y, col, r: 4, t: 0, life: 0.18 });
const shake = n => { if (!REDUCED && SAVE.shake !== false) G.shake = Math.max(G.shake || 0, n); };
function puff(x, y, col, n) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = rand(20, 70); G.parts.push({ kind: 'dot', x, y: y - 4, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.5 - 20, col, r: rand(2, 4.5), t: 0, life: rand(0.3, 0.55) }); } }
function burst(x, y, cols, r) { for (let i = 0; i < 8 + r * 0.4; i++) { const a = Math.random() * Math.PI * 2, s = rand(40, 130); G.parts.push({ kind: 'dot', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, g: 260, col: pick(cols), r: rand(2, 4), t: 0, life: rand(0.35, 0.6) }); } }
function slash(x, y, crit) { G.parts.push({ kind: 'slash', x, y, col: crit ? '#ffcb3d' : '#fff6ea', r: crit ? 20 : 13, a: rand(-0.6, 0.6), t: 0, life: 0.18 }); if (crit) pop(x, y - 22, '¡ZAS!', '#ffcb3d', 17); }
function boom(x, y, r, kind) { ring(x, y, r, kind === 'trash' ? 'rgba(160,220,90,.95)' : 'rgba(255,150,60,.95)'); burst(x, y, kind === 'trash' ? ['#7a8b5a', '#a3c464', '#5a4a3a'] : ['#ff7a1a', '#ffd34d', '#5a3a20'], r * 0.5); sfx('boom'); }
function banner(s) { const b = $('#banner'); b.textContent = s; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); }

/* =========================================================
   DIBUJO
   ========================================================= */
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
let SCALE = 1, DPR = 1, BG = null;
function fit() {
  SCALE = Math.min(innerWidth / W, innerHeight / H); DPR = Math.min(2.5, window.devicePixelRatio || 1);
  const st = $('#stage'); st.style.width = W * SCALE + 'px'; st.style.height = H * SCALE + 'px';
  cv.width = Math.round(W * SCALE * DPR); cv.height = Math.round(H * SCALE * DPR);
  $('#ui').style.transform = `scale(${SCALE})`;
}
