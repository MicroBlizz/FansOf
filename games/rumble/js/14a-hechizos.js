// Fans of Rumble · Cartas y jefes (1/3): hechizos del gashapón de cartas, mata-sanadores y equipo compartido
'use strict';
/* ---------- v0.9.15: hechizos (gashapón de cartas) y mata-sanadores ---------- */
const isSpell = k => !!(cardDef(k) && cardDef(k).spell);
const cardStars = k => (SAVE.cards && SAVE.cards[k] && SAVE.cards[k].st) || 0;
const starsOf = (team, k) => (G.pvp ? G.pvp[team].stars[k] || 0 : team === 'p' ? cardStars(k) : 0);   // estrellas de una carta para quien la juega
let spells = [];   // hechizos lanzados que aún no han caído (y su efecto al caer)
function spellPow(team, k) {   // nivel (+6 % por nivel) y estrellas (+5 % cada una). La CPU usa el nivel del rival
  const lv = G.pvp ? G.pvp[team].lvl[k] || 1 : team === 'p' ? uSave(k).lvl : G.elvl || 1, st = starsOf(team, k);
  return (1 + (lv - 1) * ECON.lvlStep) * (1 + 0.05 * st);
}
function castSpell(team, k, x, y) {
  const C = cardDef(k), D = C.spell, me = S[team];
  me.chaos -= C.cost; me.spent += C.cost; me.deployed++;
  x = clamp(x, BOUNDS.x0, BOUNDS.x1); y = clamp(y, BOUNDS.y0, BOUNDS.y1);
  spells.push({ team, k, D, x, y, t: 0, delay: D.delay || 0.7, pow: spellPow(team, k), done: false, bits: [], sp: 0 });
  if (team === 'p') { chatSt.lastDep = G.t; chatEv('deploy', C.name, k, 0.3, 5); } else chatEv('enemyBig', C.name, null, 0.6, 8);
  addNum(x, y, 74, C.name.toUpperCase(), team === 'p' ? '#ffe06a' : '#8fc2ff', 14); play('card');
}
function updateSpells(dt) {
  if (!spells.length) return;
  for (const sp of spells) {
    sp.t += dt;
    if (!sp.done) {
      const fx = sp.D.fx;
      if (FX_GORDO.includes(fx)) {   // v0.9.72: uno grande que cae justo cuando hace efecto
        if (!sp.gordo) { sp.gordo = true; const z = 300; sp.bits.push({ x: sp.x, y: sp.y, z, vz: -z / sp.delay, rot: 0, vr: 0, s: 3.4, gordo: true }); }
      } else if (!FX_SOLO.includes(fx) && (sp.sp -= dt) <= 0) {   // lluvia de lo suyo (bellotas, lápidas, monedas, pociones, relojes…)
        sp.sp = 0.04; const a = rand(0, Math.PI * 2), rr = Math.sqrt(Math.random()) * sp.D.r * 0.9;
        sp.bits.push({ x: sp.x + dcos(a) * rr, y: sp.y + dsin(a) * rr, z: rand(200, 260), vz: -rand(420, 520), rot: rand(0, 6), vr: rand(-9, 9), s: rand(1.4, 1.9) });
      }
      for (const b of sp.bits) { b.z = Math.max(0, b.z + b.vz * dt); b.rot += b.vr * dt; if (b.z <= 0 && !b.hit) { b.hit = true; b.t = b.gordo ? 0.35 : 0.25; puff(b.x, b.y, b.gordo ? 14 : 2, '#efe2c4', b.gordo ? 70 : 20, b.gordo ? 8 : 3, true); if (b.gordo) shake(4); } if (b.hit) b.t -= dt; }
      sp.bits = sp.bits.filter(b => !b.hit || b.t > 0);
      if (sp.t >= sp.delay) { applySpell(sp); sp.done = true; sp.tEnd = sp.t + 0.45; }
    } else { for (const b of sp.bits) { b.z = Math.max(0, b.z + b.vz * dt); if (b.z <= 0) b.hit = true; } sp.bits = sp.bits.filter(b => !b.hit); }
  }
  spells = spells.filter(sp => !sp.done || sp.t < sp.tEnd);
}
function applySpell(sp) {
  const D = sp.D, team = sp.team, foe = other(team), P = sp.pow, inR = o => hyp(o.x - sp.x, o.y - sp.y) - o.r * 0.5 <= D.r;
  const foes = units.filter(o => o.alive && o.team === foe && o.deployT <= 0 && !o.jump && !(o.banT > 0) && inR(o));
  const allies = units.filter(o => o.alive && o.team === team && o.deployT <= 0 && !o.jump && inR(o));
  const cc = foes.filter(o => !o.immuneCC), C = D.col || '#ffffff';
  ring(sp.x, sp.y, 8, D.r, C, 0.5, 5, true);
  switch (D.kind) {
    case 'dmg': {
      let hits = 0;
      for (const o of foes) {
        let d = D.amt * P * (o.d.healer ? HEALER_SPELL : 1); if (D.crit && srnd() < D.crit) { d *= 2; addNum(o.x, o.y, topOf(o) + 28, '¡UNO GORDO!', '#ffb04f', 13); }
        hurt(o, d, null, 'aoe'); hits++;
        if (D.stun && o.alive && !o.immuneCC) { o.stunT = Math.max(o.stunT, D.stun); o.stunKind = 'daze'; }
      }
      for (const st of structs) if (st.alive && st.team === foe && !st.hidden && hyp(st.x - sp.x, st.y - sp.y) - st.r <= D.r) hurt(st, D.amt * P * (D.bld || 0.3), null, 'aoe');
      if (D.gain && hits) { const g = Math.min(1.5, D.gain * hits); S[team].chaos = Math.min(CFG.chaosMax, S[team].chaos + g); addNum(sp.x, sp.y, 96, `+${fmtV(rnd(g, 1))} DE CAOS`, '#d9a8ff', 13); }
      if (D.steal) { const n = Math.min(S[foe].chaos, D.steal); S[foe].chaos -= n; S[team].chaos = Math.min(CFG.chaosMax, S[team].chaos + n); }
      if (D.fx === 'bolt') parts.push({ type: 'zap', pts: [[sp.x + 10, sp.y, 320], [sp.x - 6, sp.y, 160], [sp.x, sp.y, 2]], life: 0.3, max: 0.3, seed: Math.random() * 1000 });
      if (D.fx === 'boom' || D.fx === 'sword' || D.fx === 'laser') { puff(sp.x, sp.y, 18, D.fx === 'laser' ? '#7df3ff' : '#ffb04f', 120, 10, false, 10); flashAt(sp.x, sp.y, 20, D.r, D.fx === 'laser' ? '125,243,255' : '255,180,80', 0.45); }
      shake(D.amt >= 200 ? 8 : 5); play(D.fx === 'bolt' ? 'zap' : D.fx === 'laser' ? 'laser' : D.fx === 'letter' ? 'despido' : D.fx === 'acorn' ? 'acorn' : D.fx === 'coin' || D.fx === 'card9' ? 'card' : 'boom');
      break;
    }
    case 'heal': {
      for (const o of allies) {
        const amt = Math.min(D.amt * P, o.maxHp - o.hp); o.hp += amt;
        if (amt >= 1) addNum(o.x + rand(-5, 5), o.y, topOf(o) * 0.75 + 4, '+' + Math.round(amt), '#8cf05a', 16);
        if (D.shield) { o.shield = (o.shield || 0) + D.shield * P; o.shieldMax = Math.max(o.shieldMax || 0, o.shield); }
        if (D.haste) o.hasteT = D.haste;
      }
      for (let i = 0; i < 12; i++) parts.push({ type: 'plus', x: sp.x + rand(-D.r, D.r) * 0.8, y: sp.y + rand(-D.r, D.r) * 0.5, z: rand(4, 30), vx: 0, vy: 0, vz: 30, g: 0, life: 0.9, max: 0.9 });
      play('heal');
      break;
    }
    case 'disarm': for (const o of cc) o.disarmT = D.t; play('pop'); break;
    case 'slow': for (const o of cc) { o.slowT = Math.max(o.slowT || 0, D.t); o.zombT = D.t; } play('wail'); break;
    case 'stun': for (const o of cc) { o.stunT = Math.max(o.stunT, D.t); o.stunKind = D.sk || 'daze'; } play(D.sk === 'stone' ? 'womp' : 'blip'); break;
    case 'shrink': for (const o of cc) { o.shrinkT = D.t; o.shrinkF = D.f; } play('womp'); break;
    case 'confuse': for (const o of cc) { o.confT = D.t; o.target = null; o.retarget = 0; } play('laugh'); break;
    case 'knock': for (const o of cc) { const dir = o.team === 'e' ? -1 : 1; o.y = clamp(o.y + dir * D.d, BOUNDS.y0, BOUNDS.y1); o.x = clamp(o.x + srand(-14, 14), BOUNDS.x0, BOUNDS.x1); o.stunT = Math.max(o.stunT, D.t); o.stunKind = 'lag'; o.target = null; puff(o.x, o.y, 6, '#ff9aa6', 40, 5, true); } play('blink'); break;
    case 'ban': for (const o of cc) { o.banT = D.t; o.target = null; } play('slam'); break;
    case 'crunch': for (const o of allies) { o.crunchT = D.t; o.crunchDrain = D.drain; } play('go'); break;   // v0.9.20
    case 'review': {   // v0.9.20: las torres y la sede del rival en la zona reciben más daño un rato
      let n = 0; for (const st of structs) if (st.alive && st.team === foe && !st.hidden && hyp(st.x - sp.x, st.y - sp.y) - st.r <= D.r) { st.reviewUntil = G.t + D.t; st.reviewAmp = D.amp * P; n++; addNum(st.x, st.y, 90, '★☆☆☆☆', '#ffcb3d', 16); }
      if (!n) addNum(sp.x, sp.y, 80, 'Aquí no hay nada que reseñar', '#cdb9ea', 12);
      play('despido'); break;
    }
    case 'remake': {
      const o = cc.slice().sort((a, b) => b.maxHp - a.maxHp)[0];
      if (o) { o.shrinkT = D.t; o.shrinkF = D.f; const cut = o.hp * D.cut; o.hp = Math.max(1, o.hp - cut); addNum(o.x, o.y, topOf(o) + 30, 'VERSIÓN REMAKE · 70 €', '#ff9ab8', 13); }
      play('card'); break;
    }
  }
  if (D.label) addNum(sp.x, sp.y, 58, D.label, C, 15);
  if (team === 'p' && (D.kind === 'dmg' || D.side === 'foe') && foes.some(o => o.d.healer)) chatEv('heal', null, null, 0.2, 20);
}
// dónde lanzar un hechizo (la CPU y el modo automático): busca el mejor sitio y, con los de daño, sobre todo a los sanadores
function spellAim(team, k) {
  const D = cardDef(k).spell, foe = other(team), P = spellPow(team, k), R = D.r;
  const pool = units.filter(o => o.alive && o.deployT <= 0 && !o.jump && !(o.banT > 0) && !o.summon && o.team === (D.side === 'ally' ? team : foe));
  if (!pool.length) return null;
  let best = null, bv = 0;
  for (const c of pool) {
    let v = 0;
    for (const o of pool) {
      if (hyp(o.x - c.x, o.y - c.y) > R) continue;
      if (D.kind === 'dmg') { const dm = D.amt * P * (o.d.healer ? HEALER_SPELL : 1); v += Math.min(o.hp, dm) * (o.d.healer ? 2.4 : 1) + (o.hp <= dm ? (o.d.healer ? 160 : 60) : 0); }
      else if (D.kind === 'heal') v += Math.min(o.maxHp - o.hp, D.amt * P);
      else if (!o.immuneCC) v += o.maxHp * (o.d.healer ? 1.6 : 1);
    }
    if (v > bv) { bv = v; best = { x: c.x, y: c.y, v }; }
  }
  const need = D.kind === 'dmg' ? D.amt * P * 1.4 : D.kind === 'heal' ? D.amt * P * 1.3 : 900;
  return best && best.v >= need ? best : null;
}
// v0.9.72: la CPU tiene todas sus cartas siempre a mano (tú, una mano de 4 que rota), así que entre un hechizo y el siguiente espera
// AI_SPELL_GAP segundos de partida: lo que tardarías tú en volver a tener la carta. Así ya no lanza dos seguidos para rematar a tu sanador.
const AI_SPELL_GAP = 12;
function aiSpell(team, avail, go) {   // devuelve true si ha lanzado uno
  const me = S[team];
  if (me.aiSpellT !== undefined && G.t - me.aiSpellT < AI_SPELL_GAP) return false;
  for (const c of avail) if (isSpell(c.k) && me.chaos >= cardDef(c.k).cost) { const p = spellAim(team, c.k); if (p) { go(c, p.x, p.y); me.aiSpellT = G.t; return true; } }
  return false;
}
// mata-sanadores: salto por encima de la primera línea hasta el sanador (o un tirador o un apoyo) que tenga a tiro
function leapPrey(u) {
  const L = u.d.leap; let best = null, bs = -Infinity;
  for (const o of units) {
    if (o.team === u.team || !targetable(o)) continue;
    const d = dst(o, u); if (d > L.range || d < 50) continue;
    const w = o.d.healer ? 3 : o.d.ranged || ROLES[o.type] === 'support' ? 2 : 0; if (!w) continue;
    const sc = w * 1000 - d; if (sc > bs) { bs = sc; best = o; }
  }
  return best;
}
function leapTick(u, dt) {
  if (u.jump) {
    const j = u.jump; j.t += dt; const k = Math.min(1, j.t / j.dur);
    u.x = lerp(j.x0, j.x1, k); u.y = lerp(j.y0, j.y1, k); u.z = dsin(Math.PI * k) * j.h; u.spin = k * Math.PI * 2 * u.face;
    if (k >= 1) {
      u.jump = null; u.z = 0; u.spin = 0; u.moving = false; puff(u.x, u.y, 8, '#efe2c4', 50, 6, true); play('land', u.team === 'p' ? 1 : 0.5);
      const t = j.prey;
      if (t && t.alive && targetable(t)) {
        u.target = t; u.retarget = 1.2; u.chaseOf = t; u.chaseT = 0; u.atkT = 0;
        if (u.d.flash && !t.immuneCC) { t.stunT = Math.max(t.stunT, u.d.flash); t.stunKind = 'daze'; flashAt(t.x, t.y, topOf(t) * 0.6, 50, '255,250,220', 0.5); addNum(t.x, t.y, topOf(t) + 22, '¡FLASH!', '#ffe14d', 14); }
      }
    }
    return true;
  }
  u.leapT = (u.leapT === undefined ? 0.4 : u.leapT) - dt; if (u.leapT > 0) return false;
  const prey = leapPrey(u); if (!prey) { u.leapT = 0.4; return false; }
  const d = dst(prey, u) || 1, ox = (u.x - prey.x) / d, oy = (u.y - prey.y) / d, gap = prey.r + u.r + 2;
  let x1 = clamp(prey.x + ox * gap, 24, W - 24), y1 = clamp(prey.y + oy * gap, BOUNDS.y0, BOUNDS.y1);
  if (y1 > RIVER.top - 14 && y1 < RIVER.bottom + 14 && Math.abs(x1 - nearestBridge(x1)) > BRIDGE_HALF) { y1 = prey.y; x1 = clamp(prey.x + (u.x < prey.x ? -gap : gap), 24, W - 24); }   // nada de caer al río
  u.jump = { x0: u.x, y0: u.y, x1, y1, t: 0, dur: 0.6, h: 70, prey };
  u.face = prey.x > u.x ? 1 : -1; u.leapT = u.d.leap.cd; u.stealthT = 0;
  addNum(u.x, u.y, topOf(u) + 18, prey.d.healer ? '¡A POR EL SANADOR!' : '¡A POR ÉL!', '#ffcb3d', 13); play('jump');
  return true;
}
function drawSpellsGround() {   // v0.9.72: la zona brilla con su color (como el cono de MeerCat) y crece hasta que el hechizo hace efecto; los de la CPU, con un toque rojo
  for (const sp of spells) {
    const D = sp.D, k = sp.done ? Math.max(0, 1 - (sp.t - sp.delay) / 0.45) : 1, f = Math.min(1, sp.t / sp.delay), col = D.col || '#ffffff';
    const r = D.r * (sp.done ? 1 : 0.45 + 0.55 * f), a = (sp.done ? 1.3 : 0.75 + 0.35 * f) * k;
    glowArea(ctx, sp.x, sp.y, r, col, a, 1);
    if (sp.team !== 'p') glowArea(ctx, sp.x, sp.y, r, '#ff4b5c', 0.45 * k, 1);
  }
}
// drawSpellBit (lo que cae de cada hechizo) está en 14d-hechizos-dibujos.js (v0.9.72)
function drawSpellsAir() {
  for (const sp of spells) {
    for (const b of sp.bits) { if (b.hit) continue; const s = b.s || 1; ctx.globalAlpha = 0.25; ctx.fillStyle = '#140a1e'; ctx.beginPath(); ctx.ellipse(b.x, b.y, 4 * s, 1.8 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; drawSpellBit(ctx, sp.D.fx, b.x, b.y - b.z, b.rot, sp.D.col, s); }
    if (!sp.done) {   // v0.9.72: ya no baja la carta del hechizo; el láser sigue con su rayo
      const f = Math.min(1, sp.t / sp.delay);
      if (sp.D.fx === 'laser') { ctx.save(); ctx.globalAlpha = 0.25 + 0.5 * f; ctx.strokeStyle = '#7df3ff'; ctx.lineWidth = 2 + f * 8; ctx.beginPath(); ctx.moveTo(sp.x, sp.y - 400); ctx.lineTo(sp.x, sp.y); ctx.stroke(); ctx.restore(); }
    }
  }
}

