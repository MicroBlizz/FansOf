// Fans Of Decks · REUNIÓN EN EQUIPO (en obras, solo con NUCLEO.desarrollo): de 2 a 4 líderes contra los mismos rivales. Las reglas; la pantalla está en equipo-ui.js.
// Cómo se mantiene igual en todos los móviles: cada uno simula la reunión entera (todos los líderes y los rivales) con la misma semilla, y lo único que viaja
// por el canal de la sala son las jugadas, numeradas por el anfitrión (pasos). Todos aplican los mismos pasos en el mismo orden y ven lo mismo.
// Quien entra tarde o vuelve pide la lista de pasos y la repite desde el principio. Si el anfitrión se va, el siguiente ya tiene la lista y sigue numerando.
// Cada líder es una partida (run) y un estado de combate (C) de los de siempre; dcEqCon cambia DCP.run (y, al simular, el azar) al del líder que actúa,
// así combate.js y las facciones funcionan igual. Los rivales son una sola lista compartida; cada uno anuncia a quién va (r.blanco) y le ataca a él.
// Turno: cada uno juega a su ritmo y pulsa LISTO; cuando están todos, los rivales actúan y empieza el turno siguiente para todos.
// Rivales: vida ×(1 + 0,6 por cada persona más). Tres reuniones seguidas (normal, normal más dura y élite); entre una y otra os curáis un 30 % y el que cayó vuelve con un tercio.
'use strict';
const DC_EQ_REUNIONES = [['normal', 1], ['normal', 2], ['elite', 1]], DC_EQ_VIDA = 0.6;
function dcEqEscala(r) { const T = DCP.equipo; if (T && T.n > 1) r.hp = r.hpMax = Math.round(r.hp * (1 + DC_EQ_VIDA * (T.n - 1))); return r; }
function dcEqAzar(semilla) { let a = semilla >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// Hace f con el líder j como «el de la partida». Con sim (las reglas), también con el azar compartido y una meta de usar y tirar (lo del equipo no toca tus logros).
function dcEqCon(j, f, sim) {
  const T = DCP.equipo, antes = { run: DCP.run, meta: DCP.meta, azar: Math.random, uid: DCP.uid };
  DCP.run = T.runs[j]; if (sim) { DCP.meta = T.metas[j]; Math.random = T.azar; DCP.uid = T.uid; }
  try { return f(); } finally { if (sim) T.uid = DCP.uid; DCP.run = antes.run; DCP.meta = antes.meta; Math.random = antes.azar; DCP.uid = antes.uid; }
}
const dcEqVivo = j => { const T = DCP.equipo; return T.runs[j].hp > 0; };
// ---------- empezar: las partidas de cada líder y la primera reunión, todo desde la semilla ----------
function dcEqPrepara(T) {
  T.azar = dcEqAzar(T.semilla); T.uid = 1; T.reunion = 0; T.fin = null; T.pasos = T.pasos || []; T.fuera = T.jug.map(() => false);
  T.metas = T.jug.map(() => ({ logros: new Proxy({}, { get: () => 1 }), ganadas: {}, partidas: 0, victorias: 0 }));
  const uid = DCP.uid; DCP.uid = 1;   // dcCarta numera las cartas: en el equipo, con la numeración compartida
  T.runs = T.jug.map(p => { const L = DC_LIDERES[p.lider]; return { lider: p.lider, ventaja: null, ventajas: [], hp: L.hp, hpMax: L.hp, nominas: 0, mazo: DC_MAZOS[p.lider].map(id => dcCarta(id)),
    objetos: [], meriendas: [], mapa: null, acto: 0, dia: 0, paro: T.paro, rango: 0, stats: { reuniones: 0, turnos: 0, nodos: 0, dias: 0 }, pendiente: null }; });
  T.uid = DCP.uid; DCP.uid = uid;
  dcEqReunion(T);
}
function dcEqReunion(T) {
  const [tipo, nivel] = DC_EQ_REUNIONES[T.reunion];
  const enc = dcEqCon(0, () => dcEncuentro(tipo, nivel, {}), true);
  T.Cs = T.jug.map((p, j) => dcEqCon(j, () => dcCombateNuevo(enc, tipo), true));
  for (const C of T.Cs) { C.rivales = T.Cs[0].rivales; C.eventos.length = 0; }
  T.Cs.forEach((C, j) => { if (!dcEqVivo(j)) { C.fase = 'fin'; C.resultado = 'derrota'; } });
  T.listos = T.jug.map(() => false); T.fuera = T.fuera || T.jug.map(() => false); T.tipo = tipo; dcEqBlancos(T);
}
// A quién va cada rival: se reparten entre los que siguen en pie (y en la sala), y cambia cada turno.
function dcEqBlancos(T) {
  const vivos = dcEqBlancosPosibles(T); if (!vivos.length) return;
  T.Cs[0].rivales.filter(r => r.hp > 0).forEach((r, i) => { r.blanco = vivos[(i + T.Cs[0].turno) % vivos.length]; });
}
// (a quien se ha ido de la sala no se le ataca mientras quede alguien dentro)
function dcEqBlancosPosibles(T) { const v = T.jug.map((p, j) => j).filter(dcEqVivo), d = v.filter(j => !T.fuera[j]); return d.length ? d : v; }
function dcEqBlancoDe(T, r) { const v = dcEqBlancosPosibles(T); return r.blanco !== undefined && v.includes(r.blanco) ? r.blanco : v.length ? v[0] : -1; }
// Lo que pasó en la reunión de otro (cifras, golpes) se pinta también en tu pantalla: los eventos de su líder llevan j para ir a su ficha.
function dcEqRecoge(T, j) {
  const C = T.Cs[j]; if (j === T.yo) return;
  for (const e of C.eventos.splice(0)) { if (e.r < 0) e.j = j; T.Cs[T.yo].eventos.push(e); }
}
// ---------- aplicar un paso (igual en todos) ----------
function dcEqAplica(T, a) {
  if (T.fin) return;
  const j = a.j, C = T.Cs[j]; if (!C || !dcEqVivo(j) && a.a !== 'listo' && a.a !== 'fuera') return;
  if (a.a === 'carta' && C.fase === 'jugador' && !T.listos[j]) dcEqCon(j, () => dcJugar(C, a.i, a.obj), true);
  else if (a.a === 'salto' && C.fase === 'jugador' && !T.listos[j]) dcEqCon(j, () => dcUsaSalto(C), true);
  else if (a.a === 'listo') T.listos[j] = !!a.si;
  else if (a.a === 'fuera') T.fuera[j] = !!a.si;   // se fue de la sala (o volvió): mientras está fuera no se le espera
  dcEqRecoge(T, j);
  if (!T.Cs[0].rivales.some(r => r.hp > 0)) return dcEqGanada(T);
  if (T.jug.every((p, k) => !dcEqVivo(k) || T.listos[k] || T.fuera[k])) dcEqTurnoRivales(T);
}
function dcEqTurnoRivales(T) {
  const todos = T.jug.map((p, j) => j), vivos = todos.filter(dcEqVivo);
  for (const j of vivos) { dcEqCon(j, () => dcCierraTurno(T.Cs[j]), true); dcEqRecoge(T, j); }
  if (!T.Cs[0].rivales.some(r => r.hp > 0)) return dcEqGanada(T);
  for (const r of T.Cs[0].rivales) {
    if (r.hp <= 0) continue;
    const t = dcEqBlancoDe(T, r); if (t < 0) break;
    dcEqCon(t, () => { dcActuaRival(T.Cs[t], r); dcCompruebaFin(T.Cs[t]); }, true);
    for (const e of T.Cs[t].eventos) if (e.t === 'accion' && t !== T.yo) e.blanco = t;
    dcEqRecoge(T, t);
  }
  if (!todos.some(dcEqVivo)) { T.fin = 'derrota'; return; }
  if (!T.Cs[0].rivales.some(r => r.hp > 0)) return dcEqGanada(T);
  for (const j of todos.filter(dcEqVivo)) { const C = T.Cs[j]; dcEqCon(j, () => { if (C.fase !== 'fin') dcEmpiezaTurno(C); }, true); dcEqRecoge(T, j); }
  T.listos = T.jug.map(() => false); dcEqBlancos(T);
}
function dcEqGanada(T) {
  T.reunion++;
  if (T.reunion >= DC_EQ_REUNIONES.length) { T.fin = 'victoria'; return; }
  T.runs.forEach(r => { r.hp = r.hp > 0 ? Math.min(r.hpMax, r.hp + Math.round(r.hpMax * 0.3)) : Math.ceil(r.hpMax / 3); });   // entre reuniones: un respiro, y el que cayó vuelve
  dcEqReunion(T); T.nueva = true;
}
// ---------- la red: el anfitrión numera los pasos; todos los aplican en orden ----------
function dcEqEmpieza(red, sala) {
  // el equipo es el que guardó el anfitrión al empezar (orden, nombre y líder): así, quien vuelve se encuentra en su sitio aunque la sala haya cambiado
  const yo = (sala.jugadores.find(p => p.yo) || {}).orden, base = sala.datos.equipo || sala.jugadores.filter(p => p.datos && DC_LIDERES[p.datos.lider]).map(p => ({ orden: p.orden, nombre: p.nombre, lider: p.datos.lider }));
  const jug = base.filter(p => DC_LIDERES[p.lider]).map(p => ({ orden: p.orden, nombre: p.nombre, lider: p.lider, yo: p.orden === yo }));
  const T = DCP.equipo = { solo: DCP.equipo ? DCP.equipo.solo : DCP.run, red, jug, n: jug.length, yo: jug.findIndex(p => p.yo), semilla: sala.datos.semilla | 0, paro: sala.datos.paro | 0,
    anfitrion: !!sala.anfitrion, pasos: [], espera: {} };
  if (T.yo < 0) { DCP.equipo = null; return false; }
  dcEqPrepara(T); DCP.run = T.runs[T.yo];
  T.canal = red.canal(m => dcEqMensaje(T, m), estado => { if (estado === 'unido' && !T.anfitrion) T.canal.enviar({ t: 'hola' }); });
  red.seguir(s => { if (!s || DCP.equipo !== T) return; T.anfitrion = !!s.anfitrion; if (T.anfitrion) dcEqPresencia(T, s); });
  if (!T.anfitrion) setTimeout(() => { if (DCP.equipo === T && !T.pasos.length) T.canal.enviar({ t: 'hola' }); }, 800);
  return true;
}
function dcEqMensaje(T, m) {
  if (DCP.equipo !== T || !m) return;
  if (m.t === 'quiero' && T.anfitrion) dcEqNumera(T, m.a);
  else if (m.t === 'paso') dcEqLlega(T, m.n, m.a);
  else if (m.t === 'hola' && T.anfitrion) T.canal.enviar({ t: 'lista', pasos: T.pasos });
  else if (m.t === 'lista' && m.pasos && m.pasos.length > T.pasos.length) dcEqRepite(T, m.pasos);
}
// El anfitrión avisa (con un paso, para que todos lo apliquen igual) de quién se ha ido de la sala y de quién ha vuelto.
function dcEqPresencia(T, s) {
  T.jug.forEach((p, j) => { const q = s.jugadores.find(x => x.orden === p.orden), fuera = !q || !q.vivo; if (!!T.fuera[j] !== fuera) dcEqNumera(T, { j, a: 'fuera', si: fuera }); });
}
function dcEqNumera(T, a) { const n = T.pasos.length; T.canal.enviar({ t: 'paso', n, a }); dcEqLlega(T, n, a); }
function dcEqLlega(T, n, a) {
  if (n < T.pasos.length) return;
  if (n > T.pasos.length) { T.espera[n] = a; T.canal.enviar({ t: 'hola' }); return; }
  T.pasos.push(a); dcEqAplica(T, a);
  while (T.espera[T.pasos.length]) { const b = T.espera[T.pasos.length]; delete T.espera[T.pasos.length]; T.pasos.push(b); dcEqAplica(T, b); }
  dcEqRefresca();
}
// Volver a una reunión empezada: se rehace desde la semilla con todos los pasos (lo que veías se pinta de cero).
function dcEqRepite(T, pasos) { T.pasos = []; T.espera = {}; dcEqPrepara(T); for (const a of pasos) { T.pasos.push(a); dcEqAplica(T, a); } T.Cs[T.yo].eventos.length = 0; T.nueva = true; DCP.run = T.runs[T.yo]; dcEqRefresca(); }
// Tu jugada: se manda (o, si eres el anfitrión, se numera ya).
function dcEqManda(a) {
  const T = DCP.equipo; if (!T || T.fin) return false;
  const C = T.Cs[T.yo]; a = Object.assign({ j: T.yo }, a);
  if (a.a === 'salto' && (C.fase !== 'jugador' || C.saltoCarga < C.salto.carga)) return false;
  if (a.a === 'carta' && !dcPuedeJugar(C, C.mano[a.i])) return false;
  if (a.a === 'fin') a = { j: T.yo, a: 'listo', si: !T.listos[T.yo] };
  if (T.anfitrion) dcEqNumera(T, a); else T.canal.enviar({ t: 'quiero', a });
  return true;
}
function dcEqSale() { const T = DCP.equipo; if (!T) return; if (T.canal) T.canal.cerrar(); DCP.run = T.solo; DCP.equipo = null; DCC.equipo = null; }
