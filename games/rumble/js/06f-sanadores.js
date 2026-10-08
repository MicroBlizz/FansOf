// Fans of Rumble · Sanadores (MeerCat, SnackMom, TechDroid, Modder, SoporteBot, PayPlus…): su cono, a quién curan y qué hacen cuando van solos.
// Venían de 06d-unidades.js. v0.9.72:
// · también curan las torres y la sede de su equipo (igual que a una unidad: si están dentro del cono y les falta vida);
// · a quién siguen: primero los que pelean cuerpo a cuerpo; a los de distancia (que ya van atrás) solo si no hay otro;
// · si no hay a quién seguir, ya no van solos al puente: se ponen detrás de su torre más tocada y la curan (o esperan a salvo detrás de una torre).
'use strict';
const healFwd = u => (u.team === 'p' ? -Math.PI / 2 : Math.PI / 2);   // hacia el rival
const HEAL_RANGED_PEN = 70;   // cuánto menos apetece seguir a una unidad de distancia
const HEAL_TOWER_BACK = 40;   // a qué distancia se pone detrás de la torre que cura
// a quién apunta el cono: la unidad que sigue o el edificio que cura; si no, hacia delante
function healAim(u, dt) {
  const f = u.follow && u.follow.alive ? u.follow : u.healTgt && u.healTgt.alive ? u.healTgt : null;
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
function healOne(u, a) {
  const amt = Math.min(u.d.heal, a.maxHp - a.hp); a.hp += amt;
  // v0.9.9: que se vea a quién cura: rayo verde, círculo y «+N» más grande
  parts.push({ type: 'beam', x0: u.x, y0: u.y, z0: topOf(u) * 0.6, x1: a.x, y1: a.y, z1: topOf(a) * 0.5, color: '#8cf05a', life: 0.5, max: 0.5 });
  ring(a.x, a.y, 4, a.r * 2.2, 'rgba(140,240,90,.9)', 0.4, 3);
  if (amt >= 1) addNum(a.x + rand(-5, 5), a.y, topOf(a) * 0.75 + 4, '+' + Math.round(amt), '#8cf05a', 16);
}
function healPulse(u, dt) {
  u.healT = (u.healT === undefined ? 0.6 : u.healT) - dt; if (u.healT > 0) return;
  u.healT = u.d.healCd; let any = false;
  for (const a of units) {
    if (a === u || !a.alive || a.team !== u.team || a.deployT > 0 || a.jump || a.hp >= a.maxHp || !inHealCone(u, a)) continue;
    healOne(u, a); any = true;
  }
  for (const s of structs) {   // v0.9.72: las torres y la sede de su equipo también
    if (!s.alive || s.team !== u.team || s.hp <= 0 || s.hp >= s.maxHp || !inHealCone(u, s)) continue;
    healOne(u, s); any = true;
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
// v0.9.72: prefiere a los de cuerpo a cuerpo y, si está sola, cura las torres desde detrás (nunca va sola al puente)
function followAlly(u, dt) {
  const home = u.team === 'p' ? 1 : -1; let best = null, bs = -Infinity;
  for (const a of units) {
    if (a === u || !a.alive || a.team !== u.team || a.deployT > 0 || a.d.healer || a.d.kamikaze || a.jump || dist(a, u) > 230) continue;   // v0.9.15: solo aliados cercanos
    const sc = (1 - a.hp / a.maxHp) * 150 - dist(a, u) * 0.5 - Math.abs(a.x - u.x) * 0.3 + a.y * home * 0.2 - (a.d.buildings ? 40 : 0) - (a.d.ranged ? HEAL_RANGED_PEN : 0);
    if (sc > bs) { bs = sc; best = a; }
  }
  u.follow = best;
  if (best) {
    u.healTgt = null;
    const tx = clamp(best.x, 24, W - 24), ty = clamp(best.y + home * HEAL_BACK, BOUNDS.y0, BOUNDS.y1);
    if (Math.hypot(tx - u.x, ty - u.y) > 10) moveToward(u, tx, ty, dt); else { u.moving = false; if (Math.abs(best.x - u.x) > 3) u.face = best.x > u.x ? 1 : -1; }
    return true;
  }
  if (units.some(o => o.alive && o.team !== u.team && targetable(o) && dist(o, u) < u.d.sight)) { u.healTgt = null; return false; }   // la atacan: se defiende
  // sola: la torre (o la sede) de su equipo a la que más vida le falta; si ninguna está tocada, la torre más cercana, para esperar a salvo
  const mine = structs.filter(s => s.alive && s.team === u.team && s.hp > 0);
  let tgt = null, falta = 0;
  for (const s of mine) { const f = s.maxHp - s.hp; if (f > falta) { falta = f; tgt = s; } }
  const hurt = !!tgt;
  if (!tgt) for (const s of mine) if (s.role === 'tower' && (!tgt || dist(s, u) < dist(tgt, u))) tgt = s;
  u.healTgt = hurt ? tgt : null;
  if (!tgt) { u.moving = false; return true; }
  const tx = clamp(tgt.x, 24, W - 24), ty = clamp(tgt.y + home * (tgt.r + HEAL_TOWER_BACK), BOUNDS.y0, BOUNDS.y1);
  if (Math.hypot(tx - u.x, ty - u.y) > 10) moveToward(u, tx, ty, dt); else u.moving = false;
  return true;
}
