// Fans of Rumble · Vista del PvP: el jugador del asiento 'e' (arriba en la simulación) ve la partida como si fuera de abajo
'use strict';
/* La simulación es la misma en las dos máquinas (el asiento 'p' está abajo y el 'e' arriba). El que juega arriba ve el campo reflejado respecto al río (y' = 840 - y) y con
   los equipos cambiados, de modo que SU lado queda abajo, igual que siempre. Solo es la vista: la simulación nunca ve nada reflejado.
   Para dibujar no se tocan las funciones de dibujo: se les da una copia reflejada de lo que hay en el campo (espejo) y, mientras se pinta o se lee la interfaz, se cambian
   S.p/S.e y G.faction/G.efac (vistaOn). */
const VISTA_YC = 840;
let VISTA_SW = false;   // dentro de vistaOn: S.p y G.faction ya son los míos
const verAbajo = () => PVP.on && PVP.seat === 'e';   // ¿este jugador está en el asiento de arriba?
const verEquipo = () => (PVP.on && !VISTA_SW ? PVP.seat : 'p');   // mi equipo (en la simulación; dentro de vistaOn, ya cambiado: 'p')
const verFac = () => (verAbajo() && !VISTA_SW ? G.efac : G.faction);   // mi facción
const MIR_Y = ['y', 'sy', 'ty'], MIR_NEG = ['lungeY', 'vy'], MIR_REF = ['tgt', 'target', 'cur', 'owner'], MIR_SUB = ['pts', 'bits', 'jump'];
const otroEq = t => (t === 'p' ? 'e' : t === 'e' ? 'p' : t);
function espejo(o, memo) {
  if (o === null || typeof o !== 'object') return o;
  if (memo.has(o)) return memo.get(o);
  if (Array.isArray(o)) { const a = []; memo.set(o, a); for (const v of o) a.push(espejo(v, memo)); return a; }
  const c = Object.assign({}, o); memo.set(o, c);
  for (const k of MIR_Y) if (typeof c[k] === 'number') c[k] = VISTA_YC - c[k];
  for (const k of MIR_NEG) if (typeof c[k] === 'number') c[k] = -c[k];
  if (c.type === 'hitline' && typeof c.a === 'number') c.a = -c.a;
  if (c.type === 'slash' && typeof c.ang === 'number') c.ang = -c.ang;
  if (c.team) c.team = otroEq(c.team);
  for (const k of MIR_REF) if (c[k] && typeof c[k] === 'object') c[k] = espejo(c[k], memo);
  for (const k of MIR_SUB) {
    const v = c[k]; if (!v || typeof v !== 'object') continue;
    if (k === 'pts') c[k] = v.map(p => (Array.isArray(p) ? [p[0], VISTA_YC - p[1], p[2]] : p));
    else if (Array.isArray(v)) c[k] = v.map(b => (b && typeof b === 'object' ? espejo(b, memo) : b));
    else c[k] = espejo(v, memo);
  }
  return c;
}
// cambia el lado de dos cosas dentro de un objeto
const cambia = (o, a, b) => { const t = o[a]; o[a] = o[b]; o[b] = t; };
// ejecuta fn con la interfaz vista desde mi lado (en el asiento de abajo no hace nada)
function vistaOn(fn) {
  if (!verAbajo()) return fn();
  cambia(S, 'p', 'e'); cambia(G, 'faction', 'efac'); VISTA_SW = true;
  try { return fn(); } finally { cambia(S, 'p', 'e'); cambia(G, 'faction', 'efac'); VISTA_SW = false; }
}
// dibuja el campo reflejado: copias de todo lo que se ve, con los lados cambiados
function vistaRender(fn) {
  if (!verAbajo()) return fn();
  const memo = new Map(), real = { units, structs, projs, parts, nums, spells, revives, tp: towers.p, te: towers.e, bp: bases.p, be: bases.e };
  units = espejo(units, memo); structs = espejo(structs, memo); projs = espejo(projs, memo); parts = espejo(parts, memo); nums = espejo(nums, memo); spells = espejo(spells, memo); revives = espejo(revives, memo);
  const n0 = parts.length, tp = espejo(real.tp, memo), te = espejo(real.te, memo), bp = espejo(real.bp, memo), be = espejo(real.be, memo);
  towers.p = te; towers.e = tp; bases.p = be; bases.e = bp;   // mi lado es 'p' en la copia
  try { return vistaOn(() => fn()); } finally {
    const nuevas = parts.slice(n0);   // partículas que ha creado el propio dibujo (polvo, humo…): vuelven al campo de verdad, sin reflejar
    units = real.units; structs = real.structs; projs = real.projs; parts = real.parts; nums = real.nums; spells = real.spells; revives = real.revives;
    towers.p = real.tp; towers.e = real.te; bases.p = real.bp; bases.e = real.be;
    for (const p of nuevas) parts.push(espejo(p, new Map()));
  }
}
