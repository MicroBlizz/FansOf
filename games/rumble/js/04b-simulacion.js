// Fans of Rumble · Simulación determinista: azar con semilla, paso fijo y huella del estado (base del PvP por lockstep)
'use strict';
/* Todo lo que cambia el resultado de una partida (daño, esquivas, IA, dónde caen las zonas…) usa srnd/srand/spick/sshuffle.
   Lo puramente visual (partículas, números, humo) sigue con Math.random/rand/pick: no entra en la huella y puede ser distinto en cada máquina.
   Mismo SIM.seed + mismas jugadas en los mismos ticks = misma partida, tick a tick. */
const SIM_DT = 1 / 60;   // un tick de simulación; el dibujo va aparte, a lo que dé el navegador
const SIM_MAX = 12;      // máximo de ticks por fotograma (si el equipo no da, la partida va más lenta en vez de bloquearse)
const SIM = { seed: 0, s: 0, tick: 0, acc: 0, nueva: false };   // nueva: la próxima resetMatch es de una partida de verdad
// empieza una partida nueva con esta semilla (sin semilla, una al azar: la que hay que dar al otro jugador)
function simSeed(n) { SIM.seed = (n == null ? Math.floor(Math.random() * 4294967296) : n) >>> 0; SIM.s = SIM.seed; SIM.tick = 0; SIM.acc = 0; SIM.nueva = true; return SIM.seed; }
function srnd() { SIM.s = (SIM.s + 0x6d2b79f5) | 0; let t = Math.imul(SIM.s ^ (SIM.s >>> 15), 1 | SIM.s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const srand = (a, b) => a + srnd() * (b - a);
const spick = a => a[(srnd() * a.length) | 0];
function sshuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (srnd() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

// un tick de la partida: todo lo que corre mientras se juega, con el mismo paso en todas las máquinas
function simStep(dt) {
  if (G.state !== 'title') G.t += dt;   // v0.9.9: en los menús el fondo no se mueve
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 32);
  if (G.state === 'play' || G.state === 'ending') updateGame(dt);
  if (G.state === 'play') tutBattle(dt);
  updateParts(dt);
  SIM.tick++;
}

// huella del estado de la partida (solo lo que decide el resultado); dos máquinas que simulen igual dan el mismo número
function simHash() {
  let h = 0x811c9dc5;
  const num = v => { v = Math.round((v || 0) * 1000) | 0; for (let i = 0; i < 4; i++) { h ^= (v >>> (i * 8)) & 255; h = Math.imul(h, 16777619); } };
  const txt = s => { s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } num(s.length); };
  num(SIM.tick); num(SIM.s); num(G.time);
  for (const t of ['p', 'e']) { const o = S[t]; num(o.chaos); num(o.crowns); num(o.spent); num(o.deployed); num(o.kills); num(o.leaderCd); if (o.hand) txt(o.hand.join()); if (o.queue) txt(o.queue.join()); }
  num(units.length); for (const u of units) { txt(u.type); num(u.team === 'p' ? 1 : 2); num(u.x); num(u.y); num(u.hp); num(u.maxHp); num(u.alive ? 1 : 0); num(u.stunT); num(u.atkT); num(u.deployT); }
  num(structs.length); for (const s of structs) { txt(s.role + s.team); num(s.hp); num(s.alive ? 1 : 0); }
  num(projs.length); for (const p of projs) { num(p.x); num(p.y); }
  num(revives.length); num(spells.length);
  num(TR.zones.length); num(TR.falls.length); for (const z of TR.zones) { num(z.x); num(z.y); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
