// Fans of Rumble · PvP (cliente): equipo del jugador, lockstep por turnos, hash de sincronía y espera/abandono. No sabe nada de la red: habla con un `red` ({enviar, al recibir})
'use strict';
/* Cada jugador simula la partida entera (04b-simulacion.js) con la misma semilla y los mismos equipos; solo viajan las jugadas.
   El tiempo se parte en turnos de PVP_TURNO ticks. Lo que haces durante el turno k se ejecuta en el turno k+PVP_RETARDO en las dos máquinas.
   Al empezar cada turno se manda UN mensaje {t:'t', turno, cmds, tick, h}: tus jugadas para el turno k+PVP_RETARDO-1 (puede ir vacío: es el latido) y la huella de tu estado.
   Un turno no empieza hasta que ha llegado el mensaje del rival para él: así las dos máquinas ejecutan exactamente las mismas jugadas en los mismos ticks.
   El asiento 'p' (abajo) lo ocupa quien creó la sala y el 'e' el otro: la simulación es la misma en las dos máquinas, solo cambia el lado desde el que se juega. */
const PVP = { on: false, seat: 'p', peer: 'e', T: 12, D: 2, red: null, propias: new Map(), ajenas: new Map(), mias: new Map(), huellas: new Map(), estado: 'fuera', espera: 0, avisoMs: 3000, abandonoMs: 18000, alEstado: null, error: '', log: [], hashes: [] };

/* ---------- el equipo de este jugador (lo que se manda al servidor para que lo firme) ---------- */
// modo 'estandar': mazo, niveles y estrellas · modo 'salvaje': además la habilidad del líder y su equipo
function pvpEquipo(modo) {
  const fac = G.faction, F = FACTIONS[fac], deck = deckOf(fac), lvl = {}, stars = {}, ab = {}, equip = {};
  for (const k of deck.concat(F.leader ? [F.leader] : [])) {
    lvl[k] = SAVE.units[k] ? SAVE.units[k].lvl : 1;
    const st = cardStars(k); if (st) stars[k] = st;
    if (modo === 'salvaje') { const it = invGet(SAVE.abEquip[k]); if (it && it.k === 'ab' && ABILITIES[it.id]) ab[k] = { k: 'ab', id: it.id, q: it.q.slice() }; }
  }
  if (modo === 'salvaje') { const E = SAVE.equip[fac] || {}; for (const slot in SLOTS) { const it = invGet(E[slot]); if (it && it.k === 'eq' && ITEMS[it.id] && fitsFac(it.id, fac)) equip[slot] = { k: 'eq', id: it.id, q: it.q.slice() }; } }
  return { fac, deck, lvl, stars, ab, equip, modo: modo || 'estandar' };
}
// ¿Es un equipo posible? (el rival, o el servidor, no se fían de lo que cuente el otro cliente); devuelve el motivo o ''
function pvpEquipoMal(eq) {
  if (!eq || !FACTIONS[eq.fac] || !FACTIONS[eq.fac].units) return 'facción';
  const F = FACTIONS[eq.fac], pool = F.units.concat(F.gacha || []);
  if (!Array.isArray(eq.deck) || eq.deck.length !== 6 || new Set(eq.deck).size !== 6 || !eq.deck.every(k => pool.includes(k))) return 'mazo';
  if (eq.deck.filter(isSpell).length > DECK_SPELLS) return 'hechizos';
  for (const k in eq.lvl) if (!(eq.lvl[k] >= 1 && eq.lvl[k] <= ECON.maxLvl && Number.isInteger(eq.lvl[k]))) return 'nivel';
  for (const k in eq.stars) if (!(eq.stars[k] >= 0 && eq.stars[k] <= ECON.maxStars && Number.isInteger(eq.stars[k]))) return 'estrellas';
  const q01 = it => Array.isArray(it.q) && it.q.every(x => x >= 0 && x <= 1);
  for (const k in eq.ab) { const it = eq.ab[k]; if (!it || it.k !== 'ab' || !ABILITIES[it.id] || !q01(it)) return 'habilidad'; }
  for (const s in eq.equip) { const it = eq.equip[s]; if (!SLOTS[s] || !it || it.k !== 'eq' || !ITEMS[it.id] || ITEMS[it.id].slot !== s || !fitsFac(it.id, eq.fac) || !q01(it)) return 'objeto'; }
  return '';
}

/* ---------- empezar y acabar ---------- */
// o: { seat: 'p'|'e', seed, equipos: { p, e }, red, turno, retardo, tiempo, avisoMs, abandonoMs, alEstado }
function pvpInicio(o) {
  PVP.on = true; PVP.seat = o.seat; PVP.peer = o.seat === 'p' ? 'e' : 'p'; PVP.red = o.red; PVP.T = o.turno || 12; PVP.D = o.retardo || 2;
  PVP.terreno = o.terreno; PVP.avisoMs = o.avisoMs || 3000; PVP.abandonoMs = o.abandonoMs || 18000; PVP.alEstado = o.alEstado || null;
  PVP.propias = new Map(); PVP.stats = { n: 0, ms: 0 }; PVP.rtt = 0; PVP.rttMax = 0; PVP.llamadas = 0; PVP.fps = 60; PVP._en = false; PVP.pasados = new Set(); PVP.fin = null; PVP.mias = new Map(); PVP.huellas = new Map(); PVP.hashes = []; PVP.espera = 0; PVP.error = ''; PVP.log = [];
  if (!PVP.ajenas || !o.conservar) PVP.ajenas = new Map();   // los mensajes del rival pueden llegar antes de empezar: no se borran si `conservar`
  for (const t of ['p', 'e']) { const m = pvpEquipoMal(o.equipos[t]); if (m) { PVP.error = `equipo ${t}: ${m}`; pvpEstado('error'); return false; } }
  PVP.estado = 'jugando'; G.seedNext = o.seed; G.autoplay = false;
  setupMatch('pvp', null, null, o.equipos); startMatch(); if (o.tiempo) G.time = o.tiempo;
  SIM.delay = 0;
  for (let k = 0; k < PVP.D - 1; k++) pvpMandar(k, []);   // los primeros turnos van vacíos: nadie ha podido jugar aún
  return true;
}
function pvpFin() { if (PVP.net && PVP.net.parar) PVP.net.parar(); PVP.net = null; const dbg = document.getElementById('pvp-dbg'); if (dbg) dbg.remove(); PVP.on = false; PVP.red = null; PVP.estado = 'fuera'; }
function pvpEstado(e) { if (PVP.estado === e) return; PVP.estado = e; if (PVP.alEstado) PVP.alEstado(e, PVP); }

/* ---------- jugadas ---------- */
// el jugador echa una carta: sale en el turno actual + PVP_RETARDO, en las dos máquinas
function pvpJugar(slot, key, x, y) {
  const turno = Math.floor(SIM.tick / PVP.T) + PVP.D;
  const lista = PVP.mias.get(turno) || []; if (lista.length >= 4) return -1;   // como mucho 4 jugadas por turno (0,2 s): el mensaje al servidor es corto
  lista.push({ team: PVP.seat, slot, key, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }); PVP.mias.set(turno, lista);
  return turno;
}
function pvpMandar(turno, cmds, tick, h, partes) {
  PVP.propias.set(turno, cmds);
  if (PVP.red) PVP.red.enviar({ t: 't', turno, cmds, tick, h, partes });
}
// llega un mensaje del rival (el transporte lo llama)
function pvpRecibir(m) {
  if (m && m.t === 'rendir') { PVP.rendido = true; pvpEstado('abandono'); return; }   // el rival se rinde: ganas
  if (!m || m.t !== 't' || !Number.isInteger(m.turno) || !Array.isArray(m.cmds)) return;
  if (PVP.ajenas.has(m.turno)) return;   // repetido
  const cmds = [];
  for (const c of m.cmds.slice(0, 8)) {   // pocas por turno y con los datos justos: lo demás se descarta igual en las dos máquinas
    if (c && typeof c.key === 'string' && Number.isFinite(c.x) && Number.isFinite(c.y) && c.team === PVP.peer && Number.isInteger(c.slot) && c.slot >= -1 && c.slot < 8)
      cmds.push({ team: c.team, slot: c.slot, key: c.key, x: clamp(c.x, 0, W), y: clamp(c.y, 0, H) });
  }
  PVP.ajenas.set(m.turno, cmds);
  if (Number.isInteger(m.tick) && typeof m.h === 'string') { const e = PVP.huellas.get(m.tick) || {}; e.ajena = m.h; PVP.huellas.set(m.tick, e); pvpComparar(m.tick); }
}
function pvpComparar(tick) {
  const e = PVP.huellas.get(tick); if (!e || e.mia == null || e.ajena == null || e.visto) return; e.visto = true;
  if (e.mia !== e.ajena) { PVP.error = `huellas distintas en el tick ${tick}`; pvpEstado('desync'); }
}

/* ---------- el paso: simStep pregunta aquí antes de cada tick ---------- */
// true = puede ejecutarse el tick; false = hay que esperar al rival (o la partida ya no sigue)
function pvpAvanza() {
  if (PVP.estado === 'desync' || PVP.estado === 'abandono' || PVP.estado === 'error') return false;
  if (SIM.tick % PVP.T !== 0) return true;
  const turno = SIM.tick / PVP.T;
  if (!PVP.pasados) PVP.pasados = new Set();
  if (PVP.pasados.has(turno)) return true;   // ya se hizo el cambio de turno (se vuelve aquí si un tick anterior se quedó esperando)
  if (!PVP.ajenas.has(turno)) { pvpEspera(); return false; }
  PVP.espera = 0; if (PVP.estado === 'esperando') pvpEstado('jugando');
  PVP.pasados.add(turno);
  // huella de este instante (antes de instalar las jugadas del turno) y las jugadas de este turno, de los dos
  const h = simHash(), partes = simHash.partes; PVP.hashes.push([SIM.tick, h]); const e = PVP.huellas.get(SIM.tick) || {}; e.mia = h; PVP.huellas.set(SIM.tick, e); pvpComparar(SIM.tick);
  for (const c of (PVP.propias.get(turno) || [])) simCmd(Object.assign({ t: SIM.tick }, c));
  for (const c of PVP.ajenas.get(turno)) simCmd(Object.assign({ t: SIM.tick }, c));
  PVP.propias.delete(turno); PVP.ajenas.delete(turno);
  // las jugadas que se han hecho durante el turno anterior salen hacia el turno turno+PVP_RETARDO-1 (siempre se manda algo, aunque sea vacío)
  const destino = turno + PVP.D - 1, mias = PVP.mias.get(destino) || []; PVP.mias.delete(destino);
  pvpMandar(destino, mias, SIM.tick, h, partes);
  return true;
}
function pvpEspera() { /* el reloj de espera lo cuenta pvpTic (por fotograma) */ }
// por fotograma, con el tiempo real: avisa de la espera y, pasado el límite, de que el rival se ha ido
function pvpTic(real) {
  if (!PVP.on || G.state !== 'play') return;
  PVP.fps = PVP.fps * 0.95 + (1 / Math.max(0.001, real)) * 0.05; pvpDebug(real);
  if (PVP.estado !== 'jugando' && PVP.estado !== 'esperando') return;
  const faltaMensaje = SIM.tick % PVP.T === 0 && !(PVP.pasados && PVP.pasados.has(SIM.tick / PVP.T)) && !PVP.ajenas.has(SIM.tick / PVP.T);
  if (!faltaMensaje) { PVP.espera = 0; PVP._en = false; return; }
  if (!PVP._en) { PVP._en = true; PVP.stats.n++; }   // cuántas veces y cuánto rato se ha parado la partida esperando al rival
  PVP.stats.ms += real * 1000; PVP.espera += real * 1000;
  if (PVP.espera >= PVP.abandonoMs) pvpEstado('abandono'); else if (PVP.espera >= PVP.avisoMs) pvpEstado('esperando');
}
// resultado que se manda al servidor al acabar: los dos clientes deben dar lo mismo
function pvpResultado() { return { ganador: G.winner, motivo: G.endReason, tick: SIM.tick, huella: simHash(), seat: PVP.seat, coronas: [S.p.crowns, S.e.crowns] }; }
