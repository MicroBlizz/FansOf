// Fans of TD · Reglas: casillas y camino, torres (colocar, atacar, pasivas, habilidad del líder) y enemigos (aparecer, moverse, morir)
'use strict';
/* =========================================================
   ESTADO
   ========================================================= */
function sfxSilent() { return !!G.vs && G.screen === 'play' && G.vsCur !== G.vs.view; }   // en VS solo suena el campo que estás mirando
const starsOf = id => SAVE.stars[id] || 0;
const levelOpen = L => SAVE.testAll ? true : L.li === 0 ? L.wi === 0 || worldDone(L.wi - 1) : starsOf(WORLDS_TD[L.wi].levels[L.li - 1].id) > 0;
const worldDone = wi => { const w = WORLDS_TD[wi]; return !!w.levels && w.levels.every(l => starsOf(l.id) > 0); };

const G = { screen: 'title', t: 0, speed: 1, paused: false, level: null, gold: 0, lives: 0, wave: 0, waves: 0, inWave: false, nextT: 0, spawnQ: [], spawnT: 0,
  foes: [], towers: [], projs: [], parts: [], nums: [], place: null, ghost: null, sel: null, leaderOut: false, over: false, fac: 'animales', boss: null };
let uid = 0;

/* ---------- campo en casillas y camino más corto ---------- */
const COLS = GRID.cols, ROWS = GRID.rows, CELL = GRID.cell, GX = GRID.x0, GY = GRID.y0, GY1 = GY + ROWS * CELL, NCELL = COLS * ROWS;
const HQ = { x: 270, y: 150 }, DEN = { x: 270, y: GY1 + 44 };
const idx = (c, r) => r * COLS + c;
const ccx = i => GX + ((i % COLS) + 0.5) * CELL, ccy = i => GY + (((i / COLS) | 0) + 0.5) * CELL;
const cellAt = (x, y) => ({ c: clamp(Math.floor((x - GX) / CELL), 0, COLS - 1), r: clamp(Math.floor((y - GY) / CELL), 0, ROWS - 1) });
const cellOf = (x, y) => { const p = cellAt(x, y); return idx(p.c, p.r); };
const isGate = (c, r) => (r === 0 || r === ROWS - 1) && Math.abs(c - (COLS - 1) / 2) <= GRID.gate;   // entrada arriba, salida abajo
const ENTRY = [], EXIT = new Set();
for (let c = 0; c < COLS; c++) if (isGate(c, 0)) { ENTRY.push(idx(c, 0)); EXIT.add(idx(c, ROWS - 1)); }
const BLOCK = new Uint8Array(NCELL);   // 1 = hay una torre
let DIST = null;                       // distancia (en casillas) de cada casilla hasta La Madriguera
const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [-1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, -1, Math.SQRT2]];
// vecinos por los que se puede andar (en diagonal solo si no se roza la esquina de una torre)
function eachNb(i, block, fn) {
  const c = i % COLS, r = (i / COLS) | 0;
  for (const [dc, dr, w] of NB) {
    const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
    const j = idx(nc, nr); if (block[j]) continue;
    if (dc && dr && (block[idx(c + dc, r)] || block[idx(c, r + dr)])) continue;
    fn(j, w);
  }
}
// Dijkstra desde La Madriguera: con 225 casillas basta con buscar el mínimo a mano
function flow(block) {
  const D = new Float32Array(NCELL).fill(Infinity), done = new Uint8Array(NCELL);
  for (const i of EXIT) if (!block[i]) D[i] = 0;
  for (;;) {
    let b = -1, bd = Infinity; for (let i = 0; i < NCELL; i++) if (!done[i] && D[i] < bd) { bd = D[i]; b = i; }
    if (b < 0) break; done[b] = 1;
    eachNb(b, block, (j, w) => { if (bd + w < D[j]) D[j] = bd + w; });
  }
  return D;
}
// la casilla siguiente en el camino más corto
function nextCell(i, D = DIST, block = BLOCK) { let b = -1, bd = D[i]; eachNb(i, block, (j, w) => { if (D[j] + w * 0.001 < bd) { bd = D[j] + w * 0.001; b = j; } }); return b; }
function routeFrom(i, D = DIST, block = BLOCK) { const out = [i]; while (!EXIT.has(i) && out.length < NCELL) { i = nextCell(i, D, block); if (i < 0) break; out.push(i); } return out; }
const MID_ENTRY = ENTRY[(ENTRY.length / 2) | 0];
function reflow() {
  DIST = flow(BLOCK); G.route = routeFrom(MID_ENTRY);
  // los que ya andan por el campo recalculan su camino desde la casilla en la que están
  for (const f of G.foes) if (!f.atBase) f.goal = cellOf(f.x - f.ox, f.y - f.oy);
}
// '' si se puede construir; si no, el motivo
function whyNot(c, r) {
  if (!(c >= 0 && r >= 0 && c < COLS && r < ROWS)) return 'fuera';
  const i = idx(c, r);
  if (BLOCK[i]) return 'ocupada';
  if (isGate(c, r)) return 'puerta';
  if (ccx(i) > 420 && ccy(i) > 668) return 'boton';   // debajo del botón de la oleada
  for (const f of G.foes) if (!f.atBase && (cellOf(f.x - f.ox, f.y - f.oy) === i || f.goal === i)) return 'enemigo';
  BLOCK[i] = 1; const D = flow(BLOCK); BLOCK[i] = 0;
  if (D[MID_ENTRY] === Infinity) return 'cierra';
  for (const f of G.foes) if (!f.atBase && D[cellOf(f.x - f.ox, f.y - f.oy)] === Infinity) return 'cierra';
  return '';
}
const canPlace = (c, r) => !whyNot(c, r);
// lo que le queda a un enemigo hasta La Madriguera (para que las torres disparen al más adelantado)
const remOf = f => f.atBase ? -1 : DIST[f.goal] * CELL + Math.hypot(ccx(f.goal) + f.ox - f.x, ccy(f.goal) + f.oy - f.y);

/* ---------- torres ---------- */
const tdef = t => TOWERS[t.fac][t.k];
function rageOf(t) { if (t.fac !== 'animales') return 0; let n = 0; for (const o of G.towers) if (o !== t && o.fac === 'animales' && Math.hypot(o.x - t.x, o.y - t.y) <= TD.rage.radius) n++; return Math.min(n, TD.rage.max); }
function auraOf(t) { let b = 0; for (const o of G.towers) { const D = tdef(o); if (o !== t && D.aura && D.aura.speed && o.stunT <= 0 && Math.hypot(o.x - t.x, o.y - t.y) <= rangeOf(o)) b = Math.max(b, D.aura.speed + 0.1 * (o.lvl - 1)); } return b; }
const rangeOf = t => tdef(t).range * (1 + TD.upRange * (t.lvl - 1)) * (t.mut.range || 1) * (1 + (t.M.T.range || 0));
const dmgOf = t => { const D = tdef(t); return D.dmg * lvlMul(t) * t.M.lvlMul * (1 + (t.M.T.dmg || 0)) * (t.M.T.furia && G.lives < TD.baseHp / 2 ? 1 + t.M.T.furia : 1) * (1 + TD.rage.perAlly * t.rage) * (t.mut.dmg || 1) * (1 + dmgAura(t)) * (D.fury && G.lives < TD.baseHp * D.fury.f ? D.fury.mult : 1) * (D.ramp ? 1 + D.ramp.step * (t.ramp || 0) : 1); };
const upCost = t => Math.round(tdef(t).cost * TD.upCost[t.lvl] / 5) * 5;
const sellOf = t => (t.fac === 'nomuertos' ? t.spent : Math.round(t.spent * TD.sellBack / 5) * 5);   // RENACER: los No-Muertos devuelven todo el oro
function build(k, c, r) {
  const D = TOWERS[G.fac][k];
  if (G.gold < D.cost || !canPlace(c, r) || (D.leader && G.towers.some(t => tdef(t).leader))) return false;
  G.gold -= D.cost;
  const i = idx(c, r), x = ccx(i), y = ccy(i) + 6;
  BLOCK[i] = 1; reflow();
  const t = { id: ++uid, k, fac: G.fac, x, y, cell: i, lvl: 1, spent: D.cost, cdT: 0.3, rage: 0, face: 1, atkT: 0, stunT: 0, critN: 0, jumpT: D.jump ? D.jump.cd * 0.6 : 0, jump: null, dropT: 0.35, abT: D.ab ? D.ab.cd * 0.5 : 0, mut: {}, ramp: 0, hasteT: 0, hasteF: 0, sequel: false };
  t.M = G.vs && G.vsCur === 'ai' ? NOMODS : cardMods(k); t.gritoT = 4;   // lo que lleva equipado la carta (el rival no lleva nada)
  // RNG (Memes): cada torre sale con una mutación al azar
  if (G.fac === 'memes') { const M = pick(CFG.passives.memes.muts); t.mut = Object.assign({ id: M.id, txt: M.txt }, PASSIVES.memes.muts[M.id]); pop(x, y - 56, M.txt, M.color, 15); }
  G.towers.push(t); xpPlay(k); cuenta('torre'); cuenta('play_' + k); cuenta('caos', D.cost); if (D.leader) cuenta('leader'); sfx('place'); puff(x, y, '#d9b77e', 10);
  return true;
}
function upgrade(t) { const c = upCost(t); if (t.lvl >= TD.maxLevel || G.gold < c) return; G.gold -= c; t.spent += c; t.lvl++; cuenta('mejora'); cuenta('caos', c); sfx('up'); pop(t.x, t.y - 50, '¡NIVEL ' + t.lvl + '!', '#ffcb3d', 16); ring(t.x, t.y, 40, 'rgba(255,203,61,.9)'); }
function sell(t) { G.gold += sellOf(t); G.towers = G.towers.filter(o => o !== t); BLOCK[t.cell] = 0; reflow(); if (G.sel === t) G.sel = null; sfx('coin'); puff(t.x, t.y, '#d9b77e', 12); }

/* ---------- ataques, pasivas y habilidades ---------- */
// cada torre tiene como mucho una habilidad con reloj: se deja preparada en D.ab
for (const f in TOWERS) for (const k in TOWERS[f]) { const D = TOWERS[f][k]; for (const type of ['pulse', 'volley', 'teamFight', 'action', 'hack', 'viral']) if (D[type]) D.ab = Object.assign({ type }, D[type]); }
const killLevel = () => { const P = PASSIVES[G.fac]; return P.per ? Math.min(P.max, Math.floor((G.kills || 0) / P.per)) : 0; };
// EXPERIENCIA (Héroes) y COMUNIDAD (Gamers): más daño para todas las torres
function teamDmg() {
  const P = PASSIVES[G.fac];
  if (G.fac === 'heroes') return 1 + P.step * killLevel();
  if (G.fac === 'gamer') return 1 + P.step * Math.min(P.max, new Set(G.towers.map(t => t.k)).size);
  return 1;
}
// HYPE (Streamers): más velocidad de ataque para todas las torres
const teamSpeed = () => (G.fac === 'streamers' ? PASSIVES.streamers.step * killLevel() : 0);
const lvlMul = t => (1 + TD.upDmg * (t.lvl - 1)) * (G.teamDmg || 1);
function dmgAura(t) { let b = 0; for (const o of G.towers) { const A = tdef(o).aura; if (o !== t && A && A.dmg && o.stunT <= 0 && Math.hypot(o.x - t.x, o.y - t.y) <= A.r) b = Math.max(b, A.dmg); } return b; }
function targetOf(t, R = rangeOf(t)) { let tgt = null, tr = Infinity; for (const f of G.foes) if (!f.dead && f.fog <= 0 && Math.hypot(f.x - t.x, f.y - t.y) <= R + f.r) { const rm = remOf(f); if (rm < tr) { tr = rm; tgt = f; } } return tgt; }
const stunFoe = (f, s) => { if (s > 0 && !f.cc) f.stunT = Math.max(f.stunT, FOES[f.k].boss ? s * 0.3 : s); };   // a los jefes les dura mucho menos
const bolt = (x, y, x2, y2, col = '#bfe6ff') => G.parts.push({ kind: 'bolt', x, y, x2, y2, col, t: 0, life: 0.2 });
// el golpe de una torre a un enemigo, con todo lo que lleva encima (frenar, aturdir, marcar, primer golpe…)
function strike(t, f, dmg, crit) {
  if (f.dead || f.hp <= 0) return;
  if (f.markT > 0) dmg *= 1 + f.markF;
  if (t) {
    const D = tdef(t), X = t.M.T; f.lastT = t;
    if (X.crit && Math.random() < X.crit) { dmg *= 3; crit = true; }
    if (X.slowT && !f.cc) { f.slowF = Math.min(f.slowF, 0.6); f.slowT = Math.max(f.slowT, X.slowT); }
    if (!f.seen.has(t.id)) {
      f.seen.add(t.id);
      if (t.fac === 'olvidados') { dmg *= PASSIVES.olvidados.mult; crit = true; }   // NOSTALGIA
      if (D.first) { dmg *= D.first.mult; stunFoe(f, D.first.stun); crit = true; }
    }
    if (D.slow && !f.cc) { f.slowF = D.slow.f; f.slowT = D.slow.t; }
    if (D.stun) stunFoe(f, D.stun);
    if (D.mark) { f.markT = D.mark.t; f.markF = D.mark.f; }
  }
  hurt(f, dmg, crit);
}
function chainFrom(t, f, dmg, C) {
  const hit = [f]; let cur = f;
  for (let i = 0; i < C.n; i++) {
    let best = null, bd = C.r;
    for (const o of G.foes) { if (o.dead || hit.includes(o)) continue; const d = Math.hypot(o.x - cur.x, o.y - cur.y); if (d <= bd) { bd = d; best = o; } }
    if (!best) break;
    bolt(cur.x, cur.y - topOf(cur) * 0.5, best.x, best.y - topOf(best) * 0.5); strike(t, best, dmg * C.f); hit.push(best); cur = best;
  }
}
// lo que añade el equipo al golpe principal de una torre: salpicar y saltar a otro enemigo
function gearHit(t, f, dmg) {
  const X = t.M.T; if (!X.splash && !X.chain) return;
  if (X.splash) for (const o of G.foes) if (o !== f && !o.dead && Math.hypot(o.x - f.x, o.y - f.y) <= 40 + o.r * 0.5) hurt(o, dmg * X.splash);
  if (X.chain) { let best = null, bd = 80; for (const o of G.foes) { if (o === f || o.dead) continue; const d = Math.hypot(o.x - f.x, o.y - f.y); if (d <= bd) { bd = d; best = o; } } if (best) { bolt(f.x, f.y - topOf(f) * 0.5, best.x, best.y - topOf(best) * 0.5, '#ffe14d'); hurt(best, dmg * X.chain); } }
}
function projHit(p, f) {
  strike(p.src, f, p.dmg); if (p.src) gearHit(p.src, f, p.dmg);
  if (p.splash) { ring(f.x, f.y, p.splash, 'rgba(230,220,255,.8)'); for (const o of G.foes) if (o !== f && !o.dead && Math.hypot(o.x - f.x, o.y - f.y) <= p.splash + o.r * 0.5) strike(p.src, o, p.dmg); }
  if (p.chain) chainFrom(p.src, f, p.dmg, p.chain);
}
function attack(t, tgt, mult = 1) {
  const D = tdef(t), R = rangeOf(t); let dmg = dmgOf(t) * mult;
  t.face = tgt.x >= t.x ? 1 : -1; t.atkT = 0.22;
  if (D.kind === 'hit') {
    let crit = false; const ty = tgt.y - topOf(tgt) * 0.5;
    if (D.crit && ++t.critN >= D.crit.every) { t.critN = 0; dmg *= D.crit.mult; crit = true; stunFoe(tgt, D.crit.stun || 0); if (D.crit.text) pop(tgt.x, ty - 26, D.crit.text, '#ffcb3d', 17); }
    if (D.bolt) bolt(t.x, t.y - 40, tgt.x, ty); else slash(tgt.x, ty, crit && !D.crit.text);
    strike(t, tgt, dmg, crit); if (D.chain) chainFrom(t, tgt, dmg, D.chain); gearHit(t, tgt, dmg);
    if (D.ramp) t.ramp = Math.min(D.ramp.max, (t.ramp || 0) + 1);
    sfx(crit ? 'crit' : D.bolt ? 'zap' : 'hit');
  } else if (D.kind === 'shot') {
    G.projs.push({ kind: D.shot, x: t.x + t.face * 8, y: t.y - 26, target: tgt, dmg, speed: D.pspeed || 520, t: 0, src: t, splash: D.splash, chain: D.chain }); sfx('shot');
  } else if (D.kind === 'lob') {
    const lead = Math.min(0.9, Math.hypot(tgt.x - t.x, tgt.y - t.y) / 260), mv = tgt.stunT > 0 ? 0 : lead, p = { x: tgt.x + tgt.vx * mv, y: tgt.y + tgt.vy * mv };
    G.projs.push({ kind: D.shot, x: t.x, y: t.y - 30, sx: t.x, sy: t.y - 30, tx: p.x, ty: p.y, t: 0, dur: lead, dmg, splash: D.splash, src: t, arc: 70 }); sfx('lob');
  } else if (D.kind === 'stomp') {
    for (const f of G.foes) if (Math.hypot(f.x - t.x, f.y - t.y) <= R + f.r) strike(t, f, dmg);
    ring(t.x, t.y, R, 'rgba(255,170,220,.9)'); shake(2); sfx('stomp');
  }
}
// habilidades con reloj. Devuelven false si no había a quién usarla (se reintenta enseguida)
function ability(t, D) {
  const A = D.ab, m = lvlMul(t), near = r => G.foes.filter(f => !f.dead && Math.hypot(f.x - t.x, f.y - t.y) <= r + f.r);
  const shout = (s, col = '#fff6ea') => pop(t.x, t.y - 64, s, col, 16);
  const launch = (fs, n, dmg, shot) => { for (let i = 0; i < n; i++) G.projs.push({ kind: shot, x: t.x + (i - (n - 1) / 2) * 16, y: t.y - 34, target: fs[i % fs.length], dmg, speed: 300, t: 0, src: t }); };
  if (A.type === 'pulse') {
    const fs = near(A.r); if (!fs.length) return false;
    for (const f of fs) { stunFoe(f, A.stun); if (A.dmg) strike(t, f, A.dmg * m); }
    ring(t.x, t.y, A.r, `rgba(${A.col},.95)`); shout(A.text, `rgb(${A.col})`); shake(3); sfx('boom'); return true;
  }
  if (A.type === 'volley') {
    const fs = near(rangeOf(t) * 1.3).sort((a, b) => remOf(a) - remOf(b)); if (!fs.length) return false;
    launch(fs, A.n, A.dmg * m, A.shot); shout(A.text); sfx('jump'); return true;
  }
  if (A.type === 'teamFight') {
    let any = false;
    for (const o of G.towers) { if (o.stunT > 0 || o.jump || tdef(o).kind === 'aura' || Math.hypot(o.x - t.x, o.y - t.y) > A.r) continue; const tg = targetOf(o); if (tg) { attack(o, tg, A.mult); any = true; } }
    if (any) { shout('¡TEAM FIGHT!', '#ffcb3d'); ring(t.x, t.y, A.r, 'rgba(255,203,61,.9)'); sfx('horn'); }
    return any;
  }
  if (A.type === 'action') {
    if (!G.foes.length) return false;
    for (const o of G.towers) if (Math.hypot(o.x - t.x, o.y - t.y) <= A.r) { o.hasteT = A.t; o.hasteF = A.speed; }
    shout('¡ACCIÓN!', '#ffcb3d'); ring(t.x, t.y, A.r, 'rgba(255,203,61,.9)'); sfx('horn'); return true;
  }
  if (A.type === 'hack') {
    let best = null; for (const f of near(A.r)) if (!best || f.hp > best.hp) best = f; if (!best) return false;
    stunFoe(best, A.t); bolt(t.x, t.y - 40, best.x, best.y - topOf(best) * 0.5, '#7dffb0'); pop(best.x, best.y - topOf(best) - 12, '¡HACKEADO!', '#7dffb0', 15); sfx('womp'); return true;
  }
  if (A.type === 'viral') {
    const fs = near(rangeOf(t) * 1.2).sort((a, b) => remOf(a) - remOf(b)); if (!fs.length) return false;
    const c = pick(['fuego', 'aturdir', 'oro', 'perros']);
    if (c === 'fuego') { const g = fs[0]; boom(g.x, g.y, 60, 'dyn'); for (const f of G.foes) if (Math.hypot(f.x - g.x, f.y - g.y) <= 60 + f.r * 0.5) strike(t, f, 70 * m); shout('¡BOLA DE FUEGO!', '#ff7a1a'); }
    else if (c === 'aturdir') { for (const f of fs) stunFoe(f, 1.2); ring(t.x, t.y, rangeOf(t) * 1.2, 'rgba(255,225,77,.95)'); shout('¡ATURDIDOS!', '#ffe14d'); sfx('boom'); }
    else if (c === 'oro') { G.gold += 15; shout('+15 DE CAOS', '#ffcb3d'); sfx('coin'); }
    else { launch(fs, 3, 40 * m, 'dog'); shout('¡MUCH WOW!', '#f0b35a'); sfx('jump'); }
    return true;
  }
  return false;
}
// el daño a la base: primero se come el escudo de plasma de los Ciberpunks
function hitBase(d, f) {
  if (G.vs) {
    G.vs.stolen += d * (f && f.U ? 1 + (f.U.steal || 0) : 1);
    if (f && f.U && f.U.caos && !f.caosDone) { f.caosDone = true; const c = Math.min(G.gold, Math.round(f.U.caos)); G.gold -= c; G.vs.me.gold += c; }   // Microtransacción
  }
  G.shieldT = PASSIVES.ciber.delay;
  if (G.shield > 0) { const a = Math.min(G.shield, d); G.shield -= a; d -= a; }
  G.lives = Math.max(0, G.lives - d);
}

/* ---------- enemigos ---------- */
// la pasiva de la raza enemiga, vuelta contra ti (los jefes no la llevan)
function enemyTrait(f, F) {
  const e = G.efac, E = ETRAITS[e]; if (F.boss) return;
  if (e === 'streamers') f.speed *= E.speed;
  else if (e === 'ciber') f.sh = f.shMax = Math.round(f.maxHp * E.frac);
  else if (e === 'olvidados') f.fog = E.fog;
  else if (e === 'memes') { const M = pick(CFG.passives.memes.muts); f.hp = f.maxHp = Math.round(f.maxHp * M.hp); f.speed *= M.speed; f.sc *= M.scale; f.mutCol = M.id === 'normal' ? null : M.color; }
}
function spawnFoe(k, at = null, hpMul = G.hpMul) {
  const F = FOES[k], U = CFG.units[F.art || k] || {};
  const hp = Math.round(foeHp(k) * hpMul);
  const f = { id: ++uid, k, art: F.art || k, hp, maxHp: hp, speed: foeSpeed(k) * rand(0.95, 1.05), r: F.r || U.r || 12, sc: F.scale || 1, armor: F.armor != null ? F.armor : U.armor || 0, slowT: 0, slowF: 1, stunT: 0, hitT: 0, walk: Math.random() * 6, face: 1, healT: 1.5, despT: F.despido ? F.despido.cd * 0.5 : 0, ox: rand(-6, 6), oy: rand(-6, 6), vx: 0, vy: 0, atkT: 0, atBase: false, seen: new Set(), markT: 0, markF: 0, sumT: F.summon ? F.summon.cd * 0.6 : 0, sh: 0, shMax: 0, shT: 0, fog: 0 };
  enemyTrait(f, F);
  if (G.vs && G.vsCur === 'ai' && !F.boss) unitGear(f);   // tus unidades enviadas llevan el nivel, la habilidad y el equipo de su carta
  // salen de la puerta de Microblizz (o de donde cayó la caja de botín)
  if (at) { f.x = at.x + rand(-8, 8); f.y = at.y + rand(-8, 8); f.atBase = at.atBase; if (at.atBase) { f.bx = f.x; f.by = f.y; } }
  else { f.x = HQ.x + rand(-CELL * (GRID.gate + 0.3), CELL * (GRID.gate + 0.3)); f.y = GY - rand(14, 26); }
  f.goal = cellOf(f.x - f.ox, Math.max(GY + 1, f.y - f.oy));
  G.foes.push(f); if (F.boss) { G.boss = f; sfx('boss'); pop(270, 300, '¡' + foeName(k).toUpperCase() + '!', '#ff4b5c', 34); }
  return f;
}
function hurt(f, dmg, crit) {
  if (f.hp <= 0 || f.invT > 0) return;
  if (f.U && f.U.dodge && Math.random() < f.U.dodge) { num(f.x, f.y - topOf(f) - 6, 'ESQUIVA', '#9fe8ff', 11); return; }
  dmg = dmg * (1 - f.armor); f.hitT = 0.12; f.shT = ETRAITS.ciber.delay;
  if (f.sh > 0) { const a = Math.min(f.sh, dmg); f.sh -= a; dmg -= a; if (dmg <= 0) return; }
  if (f.U && f.U.pause && !f.paused && f.hp - dmg <= 0) { f.paused = true; f.invT = f.U.pause; pop(f.x, f.y - topOf(f) - 8, '¡PAUSA!', '#9fe8ff', 14); return; }
  f.hp -= dmg;
  if (SAVE.blood) for (let i = 0; i < 3; i++) G.parts.push({ kind: 'dot', x: f.x + rand(-4, 4), y: f.y - topOf(f) * 0.5, vx: rand(-45, 45), vy: rand(-60, -10), g: 220, col: 'rgba(196,24,44,.85)', r: rand(1.8, 3), t: 0, life: rand(0.25, 0.45) });
  if ((crit || dmg >= 20) && SAVE.nums !== false) num(f.x + rand(-6, 6), f.y - topOf(f) - 6, Math.round(dmg), crit ? '#ffcb3d' : '#fff6ea', crit ? 18 : 13);
  if (f.hp <= 0) kill(f);
}
function kill(f) {
  const F = FOES[f.k], e = G.efac, E = ETRAITS[e];
  // RENACER: los No-Muertos se levantan una vez (los invocados por el jefe no)
  if (e === 'nomuertos' && !F.boss && !f.revived && !f.minion) { f.revived = true; f.hp = Math.round(f.maxHp * E.hpFrac); f.stunT = Math.max(f.stunT, E.delay); f.seen.clear(); pop(f.x, f.y - topOf(f) - 8, '¡RENACE!', '#b98cff', 14); burst(f.x, f.y - 10, ['#b98cff', '#e6dcff'], f.r); sfx('pop'); return; }
  if (f.U && f.U.revive && !f.revU) { f.revU = true; f.hp = Math.round(f.maxHp * f.U.revive); f.stunT = Math.max(f.stunT, 0.8); pop(f.x, f.y - topOf(f) - 8, '¡RENACE!', '#b98cff', 14); return; }
  const gold = G.vs ? Math.ceil(F.gold * VS.bounty) : F.gold;
  f.dead = true; G.gold += gold; G.kills++; cuenta('kill'); cuenta('ekf_' + e);
  if (f.lastT && f.lastT.M.T.iman) G.gold += Math.round(f.lastT.M.T.iman);
  if (f.U && f.U.clon && !f.isClone) for (let i = 0; i < 2; i++) { const g = spawnFoe(f.k, f, 1); g.hp = g.maxHp = Math.max(1, Math.round(f.maxHp * f.U.clon)); g.sh = g.shMax = 0; g.sc *= 0.8; g.isClone = true; g.U = Object.assign({}, g.U, { clon: 0, revive: 0, pause: 0 }); }
  // SECUELA: algunos de Cultura Pop vuelven en versión «2»
  if (e === 'pop' && !F.boss && !f.sequel && !f.minion && Math.random() < E.chance) { const g = spawnFoe(f.k, f, 1); g.hp = g.maxHp = Math.max(1, Math.round(f.maxHp * E.hp)); g.sc *= E.scale; g.sequel = true; pop(f.x, f.y - topOf(f) - 8, '¡LA SECUELA!', '#ffcb3d', 14); }
  num(f.x, f.y - topOf(f) - 4, '+' + gold, '#ffcb3d', 13); burst(f.x, f.y - 10, ['#8fc2ff', '#2e8bff', '#fff6ea'], f.r);
  if (F.eject) { for (let i = 0; i < F.ejectN; i++) spawnFoe(F.eject, f); pop(f.x, f.y - 40, '¡BOTÍN!', '#ffcb3d', 18); }
  if (F.boss) { G.boss = null; sfx('win'); shake(10); }
  sfx('pop');
}
const topOf = f => (FOES[f.k].top || (TYPES[f.art] && TYPES[f.art].top) || TOPS[f.art] || 40) * f.sc;

const healerOf = f => (CFG.units[f.art] && CFG.units[f.art].healer ? 1 : 0);

