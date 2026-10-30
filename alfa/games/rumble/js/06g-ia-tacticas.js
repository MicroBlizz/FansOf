// Fans of Rumble · IA rival: las tácticas según la dificultad (las usa aiGeneric, en 06e-ia-y-partida.js)
// Normal: te castiga cuando te quedas sin CAOS y lanza los hechizos con paciencia.
// Difícil, Heroica, Mítica, CEO y jefes duros: además, ataques combinados, no ataca contra un rival con el CAOS lleno y presiona los dos carriles.
'use strict';

// nivel de tácticas del rival: 0 = ninguna (Fácil), 1 = Normal, 2 = Difícil o más. Solo el rival de la máquina:
// el PvP (y con él la prueba de balance), el modo automático del jugador y la sala de pruebas juegan sin tácticas
function aiNivel(team) {
  if (team !== 'e' || G.pvp || G.mode === 'pvp' || G.mode === 'sandbox') return 0;
  if (G.mode === 'quick') return G.diff === 'ceo' ? 2 : G.diff === 'normal' ? 1 : 0;
  if (G.mode === 'camp') return G.cdiff === 'f' ? 0 : cdHard(G.cdiff) ? 2 : 1;
  if (G.mode === 'boss') return G.bossDiff && G.bossDiff !== 'n' ? 2 : 1;
  if (G.mode === 'arena') { const R = SAVE.arena && SAVE.arena.rivals, i = R ? R.indexOf(G.arenaRival) : -1; return i < 0 ? 1 : Math.min(i, 2); }   // el rival FÁCIL, IGUALADO o DIFÍCIL (ARENA_TAG)
  return 1;
}

const AI_PACIENCIA = [1, 1.8, 2.2];   // cuánto más valor pide para lanzar un hechizo de daño o de control (con 1 le basta pillar una unidad y media)
const AI_CASTIGO = 2.5;   // si cree que te queda esto o menos de CAOS, ataca ya (Normal o más)
const AI_ESPERA = 8.5;    // si cree que tienes esto o más, no empieza un ataque: que gastes tú primero (Difícil o más)
const AI_ABRE = ['tank', 'assassin', 'swarm'], AI_APOYA = ['support', 'ranged', 'control', 'buster', 'swarm', 'assassin'];

function aiTac(A) { return A.tac || (A.tac = { castigo: 0, combo: 0, doble: 0, espera: 0 }); }

// cuánto CAOS cree la IA que te queda, calculado como lo haría una persona: lo que se recarga (lo normal, el doble en el último minuto)
// menos lo que te ha visto gastar. No mira tu barra: si te roban CAOS o llevas algo que recarga más deprisa, se equivoca, como tú con el suyo
function aiEstima(team, dt) {
  const A = AI[team], F = S[other(team)];
  if (A.est === undefined) { A.est = CFG.chaosStart; A.visto = F.spent; }
  A.est += dt * (G.double ? 2 : 1) / CFG.chaosEvery;
  A.est -= F.spent - A.visto; A.visto = F.spent;
  A.est = clamp(A.est, 0, CFG.chaosMax);
  return A.est;
}

// el carril donde menos fuerza tienes (vida de tus unidades), contando también lo que acabas de soltar: lo que te ha dejado sin CAOS
function aiLaneCastigo(team) {
  const foe = other(team), n = [0, 1].map(l => units.filter(u => u.alive && u.team === foe && Math.abs(u.x - laneBridge(l)) < 90).reduce((a, u) => a + u.hp, 0));
  return n[0] === n[1] ? laneLess(team) : n[0] < n[1] ? 0 : 1;
}

// la primera carta de la mano con el primer papel de la lista (sin mirar el CAOS)
function aiPapel(avail, roles, sin) {
  for (const r of roles) { const c = avail.find(a => a !== sin && !isLeader(a.k) && ROLES[a.k] === r); if (c) return c; }
  return null;
}
// lo que hay que ahorrar para un ataque combinado: la carta que abre (un tanque, o lo que haya) más el apoyo que va detrás
function aiCombo(avail) {
  const a = aiPapel(avail, AI_ABRE), b = a && aiPapel(avail, AI_APOYA, a);
  return a && b ? Math.min(cardDef(a.k).cost + cardDef(b.k).cost, CFG.chaosMax - 0.5) : 0;
}

// presión en el otro carril: después del combo, en cuanto gastes para defenderte (o si tiene ventaja de CAOS), una carta barata al carril
// contrario para que tengas que repartirte. Tiene AI_DOBLE segundos para hacerlo; si no se da, lo deja
const AI_DOBLE = 8;
function aiDoblePrepara(A, lane) { A.doble = { lane, hasta: G.t + AI_DOBLE }; }
function aiDoble(team, avail, go) {
  const A = AI[team], me = S[team], D = A.doble;
  if (G.t > D.hasta) { A.doble = undefined; return false; }
  if (A.est > 4 && me.chaos - A.est < 2) return false;   // aún no: que gastes tú primero
  const c = avail.find(a => !isLeader(a.k) && cardDef(a.k).cost <= 3 && me.chaos >= cardDef(a.k).cost && ['swarm', 'assassin', 'buster', 'ranged'].includes(ROLES[a.k]));
  if (!c) return false;
  go(c, clamp(laneBridge(D.lane) + srand(-16, 16), 34, W - 34), team === 'p' ? 495 : 330);
  A.doble = undefined; aiTac(A).doble++; return true;
}
