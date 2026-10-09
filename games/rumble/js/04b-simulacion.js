// Fans of Rumble · Simulación determinista: azar con semilla, paso fijo y huella del estado (base del PvP por lockstep)
'use strict';
/* Todo lo que cambia el resultado de una partida (daño, esquivas, IA, dónde caen las zonas…) usa srnd/srand/spick/sshuffle.
   Lo puramente visual (partículas, números, humo) sigue con Math.random/rand/pick: no entra en la huella y puede ser distinto en cada máquina.
   Mismo SIM.seed + mismas jugadas en los mismos ticks = misma partida, tick a tick. */
const SIM_DT = 1 / 60;   // un tick de simulación; el dibujo va aparte, a lo que dé el navegador
const SIM_MAX = 12;      // máximo de ticks por fotograma (si el equipo no da, la partida va más lenta en vez de bloquearse)
const SIM = { seed: 0, s: 0, tick: 0, acc: 0, nueva: false, cmds: [], log: [], delay: 0 };   // nueva: la próxima resetMatch es de una partida de verdad
// empieza una partida nueva con esta semilla (sin semilla, una al azar: la que hay que dar al otro jugador)
function simSeed(n) { SIM.seed = (n == null ? Math.floor(Math.random() * 4294967296) : n) >>> 0; SIM.s = SIM.seed; SIM.tick = 0; SIM.acc = 0; SIM.nueva = true; SIM.cmds = []; SIM.log = []; return SIM.seed; }
function srnd() { SIM.s = (SIM.s + 0x6d2b79f5) | 0; let t = Math.imul(SIM.s ^ (SIM.s >>> 15), 1 | SIM.s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const srand = (a, b) => a + srnd() * (b - a);
const spick = a => a[(srnd() * a.length) | 0];
function sshuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (srnd() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- matemáticas iguales en todos los navegadores ----------
   Math.hypot, sin, cos y atan2 no dan el mismo último bit en todos los motores (Chrome, Safari, Firefox): en un lockstep eso separa las dos partidas poco a poco.
   Para la simulación se usan estas, hechas solo con + - * / y raíz cuadrada (que sí son idénticas en todas partes). Lo que se dibuja puede seguir con Math. */
const hyp = (a, b) => Math.sqrt(a * a + b * b);
const dst = (a, b) => { const dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); };   // como dist() de core, pero igual en todos los navegadores
const D_PI = 3.141592653589793, D_2PI = 6.283185307179586, D_HPI = 1.5707963267948966;
function dsin(x) {
  x -= D_2PI * Math.floor((x + D_PI) / D_2PI);   // a [-pi, pi)
  if (x > D_HPI) x = D_PI - x; else if (x < -D_HPI) x = -D_PI - x;   // a [-pi/2, pi/2]
  const x2 = x * x;
  return x * (1 + x2 * (-1 / 6 + x2 * (1 / 120 + x2 * (-1 / 5040 + x2 * (1 / 362880 + x2 * (-1 / 39916800 + x2 / 6227020800))))));
}
const dcos = x => dsin(x + D_HPI);
function datanPos(z) {   // atan de z >= 0
  let off = 0, inv = false;
  if (z > 1) { z = 1 / z; inv = true; }
  if (z > 0.4142135623730951) { z = (z - 1) / (z + 1); off = D_PI / 4; }
  const z2 = z * z, r = z * (1 + z2 * (-1 / 3 + z2 * (1 / 5 + z2 * (-1 / 7 + z2 * (1 / 9 + z2 * (-1 / 11 + z2 * (1 / 13 + z2 * (-1 / 15 + z2 / 17))))))));
  const a = off + r;
  return inv ? D_HPI - a : a;
}
function datan2(y, x) {
  if (x === 0 && y === 0) return 0;
  const a = datanPos(Math.abs(y) / Math.abs(x === 0 ? 1e-300 : x));
  const r = x === 0 ? D_HPI : x > 0 ? a : D_PI - a;
  return y < 0 ? -r : r;
}

/* ---------- jugadas ----------
   Lo que hace un jugador (echar una carta) no se ejecuta al momento: entra como jugada {t, team, key, slot, x, y} y se aplica al empezar el tick t.
   En una partida contra la IA t = el tick actual (+SIM.delay, 0); en PvP las dos máquinas se mandan las jugadas con t = tick actual + SIM.delay (~3) y las aplican en el mismo tick.
   SIM.log guarda lo aplicado (con su tick real): con la semilla y ese registro se reproduce la partida entera. */
function simCmd(c) { if (c.t == null) c.t = SIM.tick + SIM.delay; SIM.cmds.push(c); return c; }
const cmpCmd = (a, b) => a.t - b.t || (a.team < b.team ? -1 : a.team > b.team ? 1 : 0) || (a.slot || 0) - (b.slot || 0) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0) || a.x - b.x || a.y - b.y;
// v0.9.105: carta a la espera de CAOS. Si falta hasta 1 de CAOS, la jugada queda reservada (S[team].pend) y sale sola en cuanto se puede pagar; mientras tanto no entra otra jugada de ese equipo. Es parte de la simulación: sale igual en las dos máquinas
const PEND_FALTA = 1;
function simPend() {
  for (const t of ['p', 'e']) {
    const o = S[t], c = o && o.pend; if (!c || o.chaos < cardDef(c.key).cost) continue;
    o.pend = null; simApply({ t: SIM.tick, team: t, slot: c.slot, key: c.key, x: c.x, y: c.y });
  }
}
function simApply(c) {
  const me = S[c.team], def = c.key && cardDef(c.key);
  if (me && c.cancel) { me.pend = null; return false; }
  if (me && me.pend) return false;   // el CAOS está reservado para la carta que espera
  if (me && def && me.chaos < def.cost && me.chaos >= def.cost - PEND_FALTA && !isSpell(c.key) && !isLeader(c.key)) { me.pend = { slot: c.slot, key: c.key, x: c.x, y: c.y }; return false; }
  if (!me || !def || me.chaos < def.cost || (isLeader(c.key) && !canDeploy(c.team, c.key))) return false;   // mismas condiciones en las dos máquinas: si ya no vale, se descarta igual en las dos
  if (c.team === 'p' || G.pvp) playCard(c.team, me.hand && me.hand[c.slot] === c.key ? c.slot : me.hand ? me.hand.indexOf(c.key) : -1, c.key, c.x, c.y); else doDeploy(c.team, c.key, c.x, c.y);
  SIM.log.push({ t: SIM.tick, team: c.team, key: c.key, slot: c.slot, x: c.x, y: c.y });
  return true;
}
function simRunCmds() {
  simPend();
  if (!SIM.cmds.length) return;
  const due = SIM.cmds.filter(c => c.t <= SIM.tick); if (!due.length) return;
  SIM.cmds = SIM.cmds.filter(c => c.t > SIM.tick); due.sort(cmpCmd);
  for (const c of due) simApply(c);
}

// un tick de la partida: todo lo que corre mientras se juega, con el mismo paso en todas las máquinas
function simStep(dt) {
  if (PVP.on && G.state === 'play' && !pvpAvanza()) return false;   // PvP: un turno no empieza hasta tener las jugadas del rival
  if (G.state !== 'title') G.t += dt;   // v0.9.9: en los menús el fondo no se mueve
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 32);
  if (G.state === 'play') simRunCmds();
  if (G.state === 'play' || G.state === 'ending') { updateGame(dt); SIM.tick++; }   // SIM.tick cuenta solo los ticks de partida
  if (G.state === 'play') tutBattle(dt);
  updateParts(dt);
  return true;
}

// huella del estado de la partida (solo lo que decide el resultado); dos máquinas que simulen igual dan el mismo número
function simHash() {
  let h = 0x811c9dc5;
  const num = v => { v = Math.round((v || 0) * 1000) | 0; for (let i = 0; i < 4; i++) { h ^= (v >>> (i * 8)) & 255; h = Math.imul(h, 16777619); } };
  const txt = s => { s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } num(s.length); };
  const parts = []; num(SIM.tick); num(SIM.s); num(G.time);
  for (const t of ['p', 'e']) { const o = S[t]; num(o.chaos); num(o.crowns); num(o.spent); num(o.deployed); num(o.kills); num(o.leaderCd); txt(o.pend ? o.pend.key : ''); if (o.hand) txt(o.hand.join()); if (o.queue) txt(o.queue.join()); }
  parts.push(h >>> 0);   // trozos de la huella (reloj, azar y los dos jugadores · tropas · edificios y disparos): si dos máquinas se separan, se ve en cuál
  num(units.length); for (const u of units) { txt(u.type); num(u.team === 'p' ? 1 : 2); num(u.x); num(u.y); num(u.hp); num(u.maxHp); num(u.alive ? 1 : 0); num(u.stunT); num(u.atkT); num(u.deployT); }
  parts.push(h >>> 0);
  num(structs.length); for (const s of structs) { txt(s.role + s.team); num(s.hp); num(s.alive ? 1 : 0); }
  num(projs.length); for (const p of projs) { num(p.x); num(p.y); }
  num(revives.length); num(spells.length);
  num(TR.zones.length); num(TR.falls.length); for (const z of TR.zones) { num(z.x); num(z.y); }
  parts.push(h >>> 0); simHash.partes = parts;
  return (h >>> 0).toString(16).padStart(8, '0');
}
