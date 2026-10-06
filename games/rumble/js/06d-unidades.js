// Fans of Rumble · Combate (4/5): el turno de cada unidad, edificio y jefe, y la separación entre unidades
'use strict';

function updateUnit(u, dt) {
  u.hitT = Math.max(0, u.hitT - dt); u.lungeT = Math.max(0, u.lungeT - dt); u.kbT = Math.max(0, (u.kbT || 0) - dt); u.labelT = Math.max(0, u.labelT - dt);
  if (u.deployT > 0) {
    u.deployT -= dt;
    if (u.deployT <= 0) {
      u.deployT = 0; u.rising = false; puff(u.x, u.y, 8, '#efe2c4', 50, 6, true); ring(u.x, u.y, 6, u.r * 2.6, 'rgba(255,255,255,.8)', 0.3, 3); play('land', u.team === 'p' ? 1 : 0.5);
      if (u.type === 'bunny' || u.mut === 'giant') shake(5);
      if (u.mutTxt) { addNum(u.x, u.y, topOf(u) + 18, u.mutTxt, u.mutCol, 14); play('roll'); }
      if (u.cofreTxt) addNum(u.x, u.y, topOf(u) + 32, 'COFRE: ' + u.cofreTxt, '#ffe06a', 13);
      onLand(u);
    }
    return;
  }
  tickExtras(u, dt);
  if (u.banT > 0) { u.banT -= dt; u.moving = false; return; }   // v0.9.15: baneado: ni se mueve ni hace nada
  if (u.d.life) { u.lifeT = (u.lifeT || 0) + dt; if (u.lifeT >= u.d.life) { expireUnit(u); return; } }   // v0.9.13: la licencia caduca
  if (u.olvT > 0) {   // v0.9.13: Nostalgia: las torres no se acuerdan de él durante 3 s
    u.olvOn = structs.some(s => s.alive && s.team !== u.team && edgeDist(s, u) <= s.range);
    if (u.olvOn) { u.olvT -= dt; if (!u.olvSaid) { u.olvSaid = true; const St = S[u.team]; if (G.t - (St.olvSaidT || -9) > 2.5) { St.olvSaidT = G.t; addNum(u.x, u.y, topOf(u) + 18, '¿Y ESTE QUIÉN ES?', '#ecc98f', 13); } } }
  }
  if (u.immuneCC) { u.stunT = 0; u.slowT = 0; }
  if (u.regen && u.hp < u.maxHp) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * u.regen * dt);
  if (u.shieldMax) {   // Escudos de plasma: se recargan tras unos segundos sin daño
    const P = CFG.passives.ciber; u.shT += dt;
    if (u.shT >= P.delay && u.shield < u.shieldMax) { if (u.shield === 0) { ring(u.x, u.y, 4, u.r * 2.2, 'rgba(34,227,255,.9)', 0.35, 3); play('shield'); } u.shield = Math.min(u.shieldMax, u.shield + u.shieldMax * P.regen * dt); }
  }
  if (u.slowT > 0) u.slowT -= dt;
  if (u.jump && u.d.leap) { leapTick(u, dt); return; }   // v0.9.15: el salto del mata-sanadores no se corta
  if (u.stunT > 0) { u.stunT -= dt; u.moving = false; return; }
  if (u.stealthT > 0) { u.stealthT -= dt; if (Math.random() < dt * 6) parts.push({ type: 'dust', x: u.x + rand(-10, 10), y: u.y, z: rand(4, 30), vx: 0, vy: 0, vz: 18, g: 0, life: 0.5, max: 0.5, size: 2, color: '#d9a8ff' }); }
  u.atkT -= dt;
  if (u.d.healer) { healAim(u, dt); if (!(u.disarmT > 0)) healPulse(u, dt); if (followAlly(u, dt)) return; }
  if (u.d.summon) summonTick(u, dt);
  if (u.d.pulse || u.abPulse) pulseTick(u, dt);
  if (u.d.viral) viralTick(u, dt);
  if (u.d.teamFight) teamFightTick(u, dt);
  if (u.d.hack) hackTick(u, dt);
  if (u.d.taunt) tauntTick(u, dt);
  if (u.d.shieldUp) shieldUpTick(u, dt);
  if (u.d.action) actionTick(u, dt);
  if (u.type === 'bunny' && bunnyJump(u, dt)) return;
  if (u.d.leap && !(u.confT > 0) && leapTick(u, dt)) return;   // v0.9.15: mata-sanadores
  u.retarget -= dt;
  if (!targetable(u.target) || u.retarget <= 0) { u.target = acquire(u); u.retarget = 0.3; }
  const t = u.target; if (!t) { u.moving = false; return; }
  if (u.d.blink) blinkTick(u, t, dt);
  if (edgeDist(u, t) <= rangeOf(u)) {
    u.moving = false; u.chaseT = 0; if (Math.abs(t.x - u.x) > 2) u.face = t.x > u.x ? 1 : -1;
    if (u.atkT <= 0 && !(u.disarmT > 0)) { attack(u, t); u.atkT = u.d.cd * cdMult(u); }   // v0.9.15: con pulgas no ataca
  } else {
    // v0.9.15: si persigue a una unidad más de 4 s sin alcanzarla, la deja estar 5 s y sigue con lo suyo (antes se iban muy lejos)
    if (t.kind === 'unit') { if (u.chaseOf !== t) { u.chaseOf = t; u.chaseT = 0; } u.chaseT += dt; if (u.chaseT > 4) { u.ign = t; u.ignT = 5; u.chaseT = 0; u.target = acquire(u); u.retarget = 0.3; return; } }
    moveToward(u, t.x, t.y, dt); if (u.atkT < 0.25) u.atkT = 0.25;
  }
}
// NecroLord levanta esqueletos; CyberMarine pide drones del cielo
function summonTick(u, dt) {
  u.sumT -= dt; if (u.sumT > 0) return; u.sumT = u.d.summonCd;
  const back = u.team === 'p' ? 16 : -16, drop = u.d.summonDrop;
  for (let i = 0; i < u.d.summonN; i++) {
    const s = spawnUnit(u.team, u.d.summon, clamp(u.x + (i ? 20 : -20), 24, W - 24), u.y + back);
    s.summon = true; s.labelT = 0;
    if (drop) s.deployT = s.deployMax = 0.6; else { s.rising = true; s.deployT = s.deployMax = 0.5; }
  }
  if (drop) { ring(u.x, u.y + back, 10, 50, 'rgba(34,227,255,.9)', 0.5, 5); addNum(u.x, u.y, topOf(u) + 18, '¡ORBITAL DROP!', '#7df3ff', 15); play('deploy', 0.7); }
  else { ring(u.x, u.y + back, 10, 50, 'rgba(94,242,160,.9)', 0.5, 5); puff(u.x, u.y + back, 10, '#7dffb8', 40, 6, true); addNum(u.x, u.y, topOf(u) + 18, '¡LEVANTAOS!', '#7dffb8', 15); play('summon'); }
}
// onda de área que aturde: Banshee (grito), Medusa (piedra), ChonkCat (se sienta)
function pulseTick(u, dt) {
  u.pulseT -= dt; if (u.pulseT > 0) return;
  const P = u.d.pulse || u.abPulse; const hit = units.filter(o => o.alive && o.team !== u.team && o.deployT <= 0 && !o.jump && !o.immuneCC && dist(o, u) - o.r <= P.r);
  if (!hit.length) { u.pulseT = 0.4; return; }
  for (const o of hit) { o.stunT = Math.max(o.stunT, P.stun); o.stunKind = P.kind; if (P.dmg) hurt(o, P.dmg * dmgMult(u), u, 'aoe'); }
  for (let i = 0; i < 3; i++) parts.push({ type: 'ring', x: u.x, y: u.y, z: 0, r0: 8 + i * 6, r1: P.r * (1 + i * 0.12), color: P.color, life: 0.45 + i * 0.1, max: 0.45 + i * 0.1, lw: 4, ground: true, circ: true });
  if (P.kind === 'stone') for (const o of hit) chips(o.x, o.y, topOf(o) * 0.5, 4, ['#9aa3a0', '#c9cfc6'], 'chip', 3);
  if (P.dmg) { puff(u.x, u.y, 14, '#efe2c4', 80, 8, true); shake(6); }
  addNum(u.x, u.y, topOf(u) + 18, P.text, P.tc, 15); play(P.sfx);
  u.pulseT = P.cd;
}
// MemeLord: cada pocos segundos juega una carta al azar
const VIRAL = { heal: ['¡CARTA: CURA!', '#8cf05a'], stun: ['¡CARTA: ATURDIR!', '#ffe14d'], fire: ['¡CARTA: FUEGO!', '#ff9a3c'], dogs: ['¡CARTA: PERRITOS!', '#ffcf8a'] };
function viralTick(u, dt) {
  u.viralT -= dt; if (u.viralT > 0) return;
  const foes = units.filter(o => o.team !== u.team && targetable(o) && dist(o, u) < 150);
  const fs = structs.find(s => s.alive && s.team !== u.team && edgeDist(u, s) < 120);
  if (!foes.length && !fs) { u.viralT = 0.5; return; }
  const hurtAllies = units.some(a => a.alive && a.team === u.team && a.deployT <= 0 && a.hp < a.maxHp * 0.7 && dist(a, u) < 130);
  let opts = foes.length ? ['stun', 'fire', 'dogs'] : ['fire', 'dogs']; if (hurtAllies) opts.push('heal', 'heal');
  const k = pick(opts);
  parts.push({ type: 'card', x: u.x, y: u.y, z: topOf(u) + 30, k, life: 1.1, max: 1.1 });
  if (k === 'heal') {
    for (const a of units) if (a.alive && a.team === u.team && a.deployT <= 0 && dist(a, u) < 130) { const amt = Math.min(60, a.maxHp - a.hp); a.hp += amt; if (amt >= 4) addNum(a.x + rand(-5, 5), a.y, topOf(a) * 0.75 + 4, '+' + Math.round(amt), '#8cf05a', 13); }
    ring(u.x, u.y, 10, 130, 'rgba(123,224,74,.85)', 0.5, 5, true); play('heal');
  } else if (k === 'stun') {
    for (const o of foes) if (dist(o, u) - o.r < 110) { o.stunT = Math.max(o.stunT, 1.2); o.stunKind = 'daze'; }
    ring(u.x, u.y, 10, 110, 'rgba(255,225,77,.9)', 0.5, 5, true); play('wail');
  } else if (k === 'fire') {
    const tg = targetable(u.target) && dist(u, u.target) < 170 ? u.target : foes[0] || fs;
    const pr = shoot(u, tg, 'fireball', 80 * dmgMult(u), 'aoe'); pr.splash = 55;
  } else {
    for (let i = 0; i < 2; i++) { const s = spawnUnit(u.team, 'suchdog', clamp(u.x + (i ? 18 : -18), 24, W - 24), u.y + (u.team === 'p' ? -14 : 14)); s.summon = true; s.labelT = 0; s.deployT = s.deployMax = 0.45; }
    play('deploy', 0.7);
  }
  addNum(u.x, u.y, topOf(u) + 16, VIRAL[k][0], VIRAL[k][1], 14);
  u.viralT = u.d.viral.cd;
}
// EpicChampion: ¡Team Fight! — los aliados cercanos golpean ya, con +50 %
function teamFightTick(u, dt) {
  u.tfT -= dt; if (u.tfT > 0) return;
  const R = u.d.teamFight.r;
  const engaged = units.some(o => o.team !== u.team && targetable(o) && dist(o, u) < R + 20) || (u.target && u.target.kind === 'struct' && edgeDist(u, u.target) <= u.d.range + 6);
  if (!engaged) { u.tfT = 0.5; return; }
  for (const a of units) if (a.alive && a.team === u.team && a.deployT <= 0 && !a.d.healer && dist(a, u) <= R) { a.atkT = Math.min(a.atkT, 0); a.tfBoost = true; ring(a.x, a.y, 4, a.r * 2, 'rgba(255,203,61,.9)', 0.35, 3); }
  ring(u.x, u.y, 10, R, 'rgba(255,203,61,.95)', 0.5, 6, true); addNum(u.x, u.y, topOf(u) + 20, '¡TEAM FIGHT!', '#ffcb3d', 17); play('horn');
  u.tfT = u.d.teamFight.cd;
}
// HackerKid: deja una torre sin disparar unos segundos
function hackTick(u, dt) {
  u.hackT -= dt; if (u.hackT > 0) return;
  let best = null, bd = u.d.hack.r;
  for (const s of structs) if (s.alive && s.team !== u.team && s.hackedT <= 0) { const d = edgeDist(u, s); if (d < bd) { bd = d; best = s; } }
  if (!best) { u.hackT = 0.5; return; }
  best.hackedT = u.d.hack.t; best.cur = null;
  parts.push({ type: 'beam', x0: u.x, y0: u.y, z0: topOf(u) * 0.6, x1: best.x, y1: best.y, z1: topOf(best) * 0.6, color: '#7be04a', life: 0.4, max: 0.4 });
  addNum(best.x, best.y, topOf(best) + 20, '¡HACKEADO!', '#7be04a', 15); play('hack');
  u.hackT = u.d.hack.cd;
}
// CyberNinja: se teletransporta hacia su objetivo
function blinkTick(u, t, dt) {
  u.blinkT -= dt; if (u.blinkT > 0) return;
  const gap = edgeDist(u, t) - u.d.range;
  if (gap < 25 || gap > u.d.sight + 40 || (u.y < RIVER.y) !== (t.y < RIVER.y)) return;
  const d = dist(u, t) || 1, step = Math.min(u.d.blink.dist, gap + 4);
  const BK = u.d.blink; puff(u.x, u.y, 8, BK.col || '#ff3df0', 40, 5, false, 12);
  u.x += (t.x - u.x) / d * step; u.y += (t.y - u.y) / d * step; u.face = t.x > u.x ? 1 : -1;
  ring(u.x, u.y, 4, 30, BK.ring || 'rgba(34,227,255,.9)', 0.3, 4); play('blink'); if (BK.txt && Math.random() < 0.5) addNum(u.x, u.y, topOf(u) + 16, BK.txt, BK.col, 13);
  u.blinkT = u.d.blink.cd; u.atkT = Math.min(u.atkT, 0.1);
}
// v0.9.13: VikingoPerdido levanta un muro de escudos: barrera dorada para él y sus aliados cercanos
function shieldUpTick(u, dt) {
  u.shUpT = (u.shUpT == null ? 2 : u.shUpT) - dt; if (u.shUpT > 0) return;
  const D = u.d.shieldUp, engaged = units.some(o => o.team !== u.team && targetable(o) && dist(o, u) < D.r + 40) || (u.target && u.target.kind === 'struct' && edgeDist(u, u.target) <= rangeOf(u) + 10);
  if (!engaged) { u.shUpT = 0.5; return; }
  const amt = Math.round(D.amt * (u.mLvl || 1));
  for (const a of units) if (a.alive && a.team === u.team && a.deployT <= 0 && !a.jump && dist(a, u) <= D.r) { a.bshield = Math.max(a.bshield || 0, amt); a.bshT = D.t; ring(a.x, a.y, 4, a.r * 2.2, 'rgba(255,203,61,.9)', 0.35, 3); }
  ring(u.x, u.y, 10, D.r, 'rgba(255,203,61,.95)', 0.5, 6, true); addNum(u.x, u.y, topOf(u) + 20, '¡MURO DE ESCUDOS!', '#ffcb3d', 15); play('shield'); play('horn');
  if (u.team === 'p') chatEv('shieldwall', null, null, 0.35, 15);
  u.shUpT = D.cd;
}
// v0.9.13: LaDirectora grita ¡ACCIÓN!: sus aliados cercanos atacan más rápido y corren más durante unos segundos
function actionTick(u, dt) {
  u.actCd = (u.actCd == null ? 2.5 : u.actCd) - dt; if (u.actCd > 0) return;
  const A = u.d.action, engaged = units.some(o => o.team !== u.team && targetable(o) && dist(o, u) < A.r + 60) || (u.target && u.target.kind === 'struct' && edgeDist(u, u.target) <= rangeOf(u) + 10);
  if (!engaged) { u.actCd = 0.5; return; }
  for (const a of units) if (a.alive && a.team === u.team && a.deployT <= 0 && dist(a, u) <= A.r) { a.actT = A.t; ring(a.x, a.y, 4, a.r * 2, 'rgba(255,154,184,.9)', 0.35, 3); }
  ring(u.x, u.y, 10, A.r, 'rgba(255,154,184,.95)', 0.5, 6, true); addNum(u.x, u.y, topOf(u) + 20, '¡ACCIÓN!', '#ff9ab8', 17);
  parts.push({ type: 'clapper', x: u.x, y: u.y, z: topOf(u) + 36, life: 0.9, max: 0.9 }); play('card');
  if (u.team === 'p') chatEv('action', null, null, 0.35, 15);
  u.actCd = A.cd;
}
// v0.9.13: LicenciaBot: su licencia caduca y desaparece (no cuenta como baja)
function expireUnit(u) {
  u.alive = false; u.hp = 0;
  parts.push({ type: 'stamp', x: u.x, y: u.y, z: topOf(u) + 12, txt: 'CADUCADA', color: '#ff3348', life: 1.1, max: 1.1 });
  puff(u.x, u.y, 10, '#c7d2fe', 50, 7, false, topOf(u) * 0.4); play('poof');
  if (u.team === 'e') chatEv('expire', null, null, 0.6, 12);
}
// TrollBot: se ríe de vez en cuando (la provocación está en acquire y en las torres)
function tauntTick(u, dt) {
  u.tauntT -= dt; if (u.tauntT > 0) return;
  if (!units.some(o => o.team !== u.team && targetable(o) && dist(o, u) < u.d.taunt.r)) { u.tauntT = 0.6; return; }
  addNum(u.x, u.y, topOf(u) + 16, '¡JAJAJA!', '#7be04a', 14); ring(u.x, u.y, 8, u.d.taunt.r, 'rgba(123,224,74,.6)', 0.5, 3, true); play('laugh');
  u.tauntT = 6;
}
const healFwd = u => (u.team === 'p' ? -Math.PI / 2 : Math.PI / 2);   // hacia el rival
function healAim(u, dt) {   // v0.9.14: el cono apunta a la unidad que sigue; si va sola, hacia delante
  const f = u.follow && u.follow.alive ? u.follow : null;
  const ta = f && dist(f, u) > 8 ? Math.atan2(f.y - u.y, f.x - u.x) : healFwd(u);
  if (u.healAng === undefined) { u.healAng = ta; return; }
  let d = ta - u.healAng; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
  u.healAng += d * Math.min(1, dt * 6);
}
// ¿está dentro del cono de curación? (delante, a menos de su alcance; ni ella misma ni lo que tiene al lado)
function inHealCone(u, a) {
  const dx = a.x - u.x, dy = a.y - u.y, d = Math.hypot(dx, dy); if (d < 4 || d > u.d.healR + a.r * 0.5) return false;
  const an = u.healAng === undefined ? healFwd(u) : u.healAng;
  return (dx * Math.cos(an) + dy * Math.sin(an)) / d >= HEAL_COS;
}
function healPulse(u, dt) {
  u.healT = (u.healT === undefined ? 0.6 : u.healT) - dt; if (u.healT > 0) return;
  u.healT = u.d.healCd; let any = false;
  for (const a of units) {
    if (a === u || !a.alive || a.team !== u.team || a.deployT > 0 || a.jump || a.hp >= a.maxHp || !inHealCone(u, a)) continue;
    const amt = Math.min(u.d.heal, a.maxHp - a.hp); a.hp += amt; any = true;
    // v0.9.9: que se vea a quién cura: rayo verde, círculo y «+N» más grande
    if (a !== u) parts.push({ type: 'beam', x0: u.x, y0: u.y, z0: topOf(u) * 0.6, x1: a.x, y1: a.y, z1: topOf(a) * 0.5, color: '#8cf05a', life: 0.5, max: 0.5 });
    ring(a.x, a.y, 4, a.r * 2.2, 'rgba(140,240,90,.9)', 0.4, 3);
    if (amt >= 1) addNum(a.x + rand(-5, 5), a.y, topOf(a) * 0.75 + 4, '+' + Math.round(amt), '#8cf05a', 16);
  }
  if (!any) return;
  u.healGlowT = G.t;   // v0.9.18: enciende el cono un momento
  if (u.team === 'p') chatEv('heal', null, null, 0.18, 15);
  parts.push({ type: 'cone', x: u.x, y: u.y, z: 0, a: u.healAng === undefined ? healFwd(u) : u.healAng, r0: 14, r1: u.d.healR, color: 'rgba(150,245,120,.4)', life: 0.6, max: 0.6, lw: 2, ground: true });
  for (let i = 0; i < 4; i++) parts.push({ type: 'plus', x: u.x + rand(-22, 22), y: u.y + rand(-6, 6), z: rand(10, 30), vx: 0, vy: 0, vz: 26, g: 0, life: 0.8, max: 0.8 });
  flashAt(u.x, u.y, 12, 40, '120,255,140', 0.3);
  play('heal');
}
// v0.9.9: la curandera va detrás de sus aliados (primero los heridos y los cercanos, nunca delante del grupo)
// v0.9.14: a más distancia (HEAL_BACK) y recordando a quién sigue, para apuntarle el cono
// y, si está sola, espera delante de su torre en vez de ir a por las del enemigo
function followAlly(u, dt) {
  const home = u.team === 'p' ? 1 : -1; let best = null, bs = -Infinity;
  for (const a of units) {
    if (a === u || !a.alive || a.team !== u.team || a.deployT > 0 || a.d.healer || a.d.kamikaze || a.jump || dist(a, u) > 230) continue;   // v0.9.15: solo aliados cercanos
    const sc = (1 - a.hp / a.maxHp) * 150 - dist(a, u) * 0.5 - Math.abs(a.x - u.x) * 0.3 + a.y * home * 0.2 - (a.d.buildings ? 40 : 0);
    if (sc > bs) { bs = sc; best = a; }
  }
  u.follow = best;
  if (best) {
    const tx = clamp(best.x, 24, W - 24), ty = clamp(best.y + home * HEAL_BACK, BOUNDS.y0, BOUNDS.y1);
    if (Math.hypot(tx - u.x, ty - u.y) > 10) moveToward(u, tx, ty, dt); else { u.moving = false; if (Math.abs(best.x - u.x) > 3) u.face = best.x > u.x ? 1 : -1; }
    return true;
  }
  if (units.some(o => o.alive && o.team !== u.team && targetable(o) && dist(o, u) < u.d.sight)) return false;   // la atacan: se defiende
  const wx = laneBridge(u.x < W / 2 ? 0 : 1), wy = u.team === 'p' ? ZONE.p.y0 + 75 : ZONE.e.y1 - 75;
  if (Math.hypot(wx - u.x, wy - u.y) > 12) moveToward(u, wx, wy, dt); else u.moving = false;
  return true;
}
function bunnyJump(u, dt) {
  if (u.jump) {
    const j = u.jump; j.t += dt; const k = Math.min(1, j.t / j.dur);
    u.x = lerp(j.x0, j.x1, k); u.y = lerp(j.y0, j.y1, k); u.z = Math.sin(Math.PI * k) * j.h; u.spin = k * Math.PI * 2 * u.face;
    if (k >= 1) {
      u.jump = null; u.z = 0; u.spin = 0; u.moving = false;
      const jd = u.d.jumpDmg * dmgMult(u);
      for (const o of units) if (o.alive && o.team !== u.team && Math.hypot(o.x - u.x, o.y - u.y) - o.r <= u.d.jumpR) { const d = Math.hypot(o.x - u.x, o.y - u.y) || 1; o.x += (o.x - u.x) / d * 16; o.y += (o.y - u.y) / d * 16; hurt(o, jd, u, 'aoe'); }
      for (const s of structs) if (s.alive && s.team !== u.team && Math.hypot(s.x - u.x, s.y - u.y) - s.r <= u.d.jumpR) hurt(s, jd, u, 'aoe');
      ring(u.x, u.y, 10, u.d.jumpR * 1.15, 'rgba(212,60,255,.95)', 0.45, 7); ring(u.x, u.y, 6, u.d.jumpR * 0.7, 'rgba(255,255,255,.9)', 0.3, 4);
      puff(u.x, u.y, 18, '#e9dcc0', 90, 9, true); chips(u.x, u.y, 4, 10, ['#6eb646', '#8b5530', '#d9b77e'], 'chip', 4);
      addNum(u.x, u.y, 90, '¡CHAOS JUMP!', '#f3a6ff', 20); flashAt(u.x, u.y, 10, 95, '212,60,255', 0.35); screenFlash(0.1);
      shake(9); play('slam');
    }
    return true;
  }
  u.jumpCd -= dt;
  if (u.jumpCd > 0) return false;
  let best = null, bestScore = 0;
  for (const o of units) {
    if (o.team === u.team || !targetable(o)) continue;
    const d = dist(u, o); if (d > u.d.jumpRange) continue;
    let sc = 0.001 * (u.d.jumpRange - d);
    for (const q of units) if (q.alive && q.team !== u.team && Math.hypot(q.x - o.x, q.y - o.y) < u.d.jumpR) sc += 1;
    if (sc > bestScore) { bestScore = sc; best = o; }
  }
  if (!best) for (const s of structs) if (s.alive && s.team !== u.team && edgeDist(u, s) < 90) best = s;
  if (!best) { u.jumpCd = 0.5; return false; }
  const ang = Math.atan2(u.y - best.y, u.x - best.x); const off = best.kind === 'struct' ? best.r + u.r - 4 : 0;
  u.jump = { x0: u.x, y0: u.y, x1: best.x + Math.cos(ang) * off, y1: best.y + Math.sin(ang) * off, t: 0, dur: 0.7, h: 95 };
  u.face = u.jump.x1 > u.x ? 1 : -1; u.jumpCd = u.d.jumpCd * (u.jumpCdM || 1); play('jump');
  return true;
}
function updateStruct(s, dt) {
  s.hitT = Math.max(0, s.hitT - dt); s.recoil = Math.max(0, s.recoil - dt); s.castT = Math.max(0, s.castT - dt);
  if (!s.alive) { if (s.hidden) return; s.smokeT -= dt; if (s.smokeT <= 0) { s.smokeT = rand(0.25, 0.5); parts.push({ type: 'smoke', x: s.x + rand(-12, 12), y: s.y, z: rand(6, 16), vx: rand(-4, 4), vy: 0, vz: rand(14, 24), g: 0, life: rand(1.2, 1.8), max: 1.8, size: rand(5, 10) }); } return; }
  if (s.hackedT > 0) { s.hackedT -= dt; return; }
  s.atkT -= dt; if (s.atkT > 0) return;
  const seen = u => targetable(u) && !(u.olvT > 0);   // v0.9.13: Nostalgia
  let best = seen(s.cur) && edgeDist(s, s.cur) <= s.range ? s.cur : null;
  if (!best) { let bd = Infinity; for (const u of units) if (u.team !== s.team && seen(u)) { const d = edgeDist(s, u); if (d <= s.range && d < bd) { bd = d; best = u; } } }
  for (const u of units) if (u.team !== s.team && u.d.taunt && seen(u) && edgeDist(s, u) <= s.range) { best = u; break; }
  if (!best) return;
  s.cur = best; s.atkT = s.cd; s.recoil = 0.15;
  shoot(s, best, SKINS[s.skin].shot[s.role === 'tower' ? 0 : 1], s.dmg);
}
function updateBoss(dt) {
  const b = bases.e; if (!b.alive || !G.bossOn) return;
  const D = G.diffCfg, nm = G.bossName;
  const ph = ownerOf() === 'phony', ia = ownerOf() === 'iahorro', own = ownerName();
  if (!S.e.phase2 && b.hp < b.maxHp * 0.5) { S.e.phase2 = true; S.e.bossT = Math.min(S.e.bossT, 3); banner(ia ? 'FASE 2: SUSTITUCIÓN TOTAL' : ph ? 'FASE 2: SUBIDA DE PRECIOS' : 'FASE 2: DESPIDOS MASIVOS', `${nm} está a media vida y se ha enfadado`, 'enemy'); play('womp'); chatBurst('phase2', 2); }
  if (b.hackedT > 0) return;   // hackeado: tampoco lanza habilidades
  S.e.bossT -= dt; if (S.e.bossT > 0) return;
  const near = units.filter(u => u.alive && u.team === 'p' && u.y < RIVER.y + 30 && !u.jump && u.deployT <= 0 && !u.immuneBoss);
  const all = units.filter(u => u.alive && u.team === 'p' && !u.jump && u.deployT <= 0 && !u.immuneBoss);
  let cast = null;
  if (S.e.phase2 && S.e.nextDespido && all.length) cast = 'despido';
  else if (near.length) cast = 'entierro';
  else if (S.e.phase2 && all.length) cast = 'despido';
  if (!cast) { S.e.bossT = 1; return; }
  b.castT = 0.9; ring(b.x, b.y, 20, 260, 'rgba(255,51,72,.8)', 0.7, 6); if (cast === 'entierro') chatEv('stun', null, null, 0.75, 6); else if (Math.random() < 0.6) chatSay('boss');
  if (cast === 'entierro') {
    for (const u of near) { u.stunT = D.stun; u.stunKind = ph || ia ? 'net' : 'ip'; puff(u.x, u.y, 6, '#9fb3d6', 30, 5); }
    if (ia) banner(G.efac === 'iahorro' ? 'ACTUALIZACIÓN OBLIGATORIA' : 'ORDEN DE IAHORRO', `${nm} ha dejado «actualizando» a tus unidades de su lado`, 'enemy');
    else if (ph) banner(G.efac === 'phony' ? '¡SERVIDORES EN MANTENIMIENTO!' : 'ORDEN DE PHONY', `${nm} ha dejado sin conexión a tus unidades de su lado`, 'enemy');
    else banner(G.efac === 'microblizz' ? '¡JUEGO CERRADO!' : 'ORDEN DE MICROBLIZZ', `${nm} ha congelado a tus unidades de su lado`, 'enemy');
    play('womp');
  } else {
    for (const u of all) parts.push({ type: 'env', k: ph ? 'lic' : 'env', tgt: u, x: u.x, y: u.y, z: 170, t: rand(-0.25, 0), dur: 0.6, dmg: D.despido, life: 2, max: 2, rot: rand(-0.4, 0.4) });
    if (ia) banner('SUSTITUIDOS POR IA', G.efac === 'iahorro' ? 'IAhorro quiere cambiar a todas tus unidades por bots' : 'IAhorro le obliga a sustituir a todas tus unidades', 'enemy');
    else if (ph) banner('LICENCIAS REVOCADAS', G.efac === 'phony' ? 'Phony borra la licencia de todas tus unidades' : 'Phony le obliga a revocar la licencia de todas tus unidades', 'enemy');
    else banner('DESPIDOS MASIVOS', G.efac === 'microblizz' ? 'Carta de despido para todas tus unidades' : `${own} le obliga a despedir a todas tus unidades`, 'enemy');
    play('despido');
  }
  S.e.nextDespido = S.e.phase2 ? cast !== 'despido' : true;
  S.e.bossT = S.e.phase2 ? D.bossCd * 0.8 : D.bossCd;
}
function separate() {
  const n = units.length;
  for (let i = 0; i < n; i++) {
    const a = units[i]; if (!a.alive || a.jump) continue;
    for (let j = i + 1; j < n; j++) {
      const b = units[j]; if (!b.alive || b.jump) continue;
      let dx = b.x - a.x, dy = b.y - a.y; const min = (a.r + b.r) * 0.9;
      if (dx > min || dx < -min || dy > min || dy < -min) continue;
      let d = Math.hypot(dx, dy); if (d >= min) continue;
      if (d < 0.01) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d = Math.hypot(dx, dy); }
      const push = (min - d) * 0.5; const ma = a.r * a.r, mb = b.r * b.r; const wa = mb / (ma + mb), wb = ma / (ma + mb);
      a.x -= (dx / d) * push * wa; a.y -= (dy / d) * push * wa; b.x += (dx / d) * push * wb; b.y += (dy / d) * push * wb;
    }
    for (const s of structs) { if (!s.alive) continue; const dx = a.x - s.x, dy = a.y - s.y; const d = Math.hypot(dx, dy) || 0.01; const min = a.r + s.r * 0.82; if (d < min) { a.x = s.x + (dx / d) * min; a.y = s.y + (dy / d) * min; } }
  }
}
function constrain(u) {
  u.x = clamp(u.x, BOUNDS.x0 + u.r * 0.5, BOUNDS.x1 - u.r * 0.5); u.y = clamp(u.y, BOUNDS.y0, BOUNDS.y1);
  const m = u.r * 0.3;
  if (!RIVER_OPEN && u.y > RIVER.top - m && u.y < RIVER.bottom + m) {
    const bx = nearestBridge(u.x); const lim = BRIDGE_HALF - u.r * 0.55;
    if (Math.abs(u.x - bx) <= BRIDGE_HALF + 3) u.x = clamp(u.x, bx - lim, bx + lim);
    else u.y = u.y < RIVER.y ? RIVER.top - m : RIVER.bottom + m;
  }
}
