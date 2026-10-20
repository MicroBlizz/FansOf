// Fans of Rouflage · LAS MISIONES DIARIAS Y LOS LOGROS: lo que se cuenta y cómo se cobra (los datos en misiones-datos.js; la pantalla en misiones-pantalla.js).
// El juego avisa con misionEvento('despide' | 'silba' | 'granada' | 'poder' | 'comparte' | 'fin', ...) desde despide(), silba(), lanzaGranada(), accionPoder(),
// fotoComparte() y termina(); aquí se decide qué cuenta. El progreso lo lleva siempre esta partida (SAVE.misiones del día y SAVE.logros para siempre).
// Cobrar: sin cuenta (invitado, sin conexión o ?nube=0) suma las Gotas aquí, como el premio diario; con cuenta (RFS) lo pide al servidor (rf_mision,
// servidor/58-rouflage-misiones.sql), que solo deja cobrar una vez cada misión de hoy y cada logro en la vida. Lo cobrado en el servidor llega con su estado
// (estado.misiones = { dia, cobradas } y estado.logros = [ids]) por misionesDelServidor, que llama RFS.aplica.
'use strict';

const MIS = { srv: null, srvLogros: [], cobrando: false };

function misionEstado() {
  const hoy = misionDia();
  if (!SAVE.misiones || SAVE.misiones.dia !== hoy) SAVE.misiones = { dia: hoy, prog: {}, roles: {}, cobradas: [] };
  return SAVE.misiones;
}
function logroEstado() {
  if (!SAVE.logros) SAVE.logros = { c: {}, cobrados: [] };
  const l = SAVE.logros; if (!l.c) l.c = {}; if (!Array.isArray(l.cobrados)) l.cobrados = []; if (!Array.isArray(l.c.mapas)) l.c.mapas = [];
  return l;
}
// lo que dice el servidor (lo llama RFS.aplica con el estado de la cuenta)
function misionesDelServidor(e) {
  MIS.srv = e && e.misiones && typeof e.misiones === 'object' ? e.misiones : null;
  MIS.srvLogros = e && Array.isArray(e.logros) ? e.logros : [];
}
const misionProgreso = m => Math.min(m.n, misionEstado().prog[m.id] || 0);
const misionHecha = m => misionProgreso(m) >= m.n;
// cobrada aquí o en el servidor (las dos cuentan: así lo cobrado como invitado no se cobra otra vez al entrar con cuenta el mismo día)
function misionCobrada(m) {
  if (misionEstado().cobradas.includes(m.id)) return true;
  return !!(MIS.srv && MIS.srv.dia === misionDia() && Array.isArray(MIS.srv.cobradas) && MIS.srv.cobradas.includes(m.id));
}
function logroValor(l) { const v = logroEstado().c[l.c]; return Array.isArray(v) ? v.length : v || 0; }
const logroHecho = l => logroValor(l) >= l.n;
const logroCobrado = l => logroEstado().cobrados.includes(l.id) || MIS.srvLogros.includes(l.id);
const misionesPorCobrar = () => misionesDeHoy().filter(m => misionHecha(m) && !misionCobrada(m)).length + LOGROS.filter(l => logroHecho(l) && !logroCobrado(l)).length;

/* ---------- contar ---------- */
function misionSuma(id, n) {
  const m = misionesDeHoy().find(x => x.id === id); if (!m) return;
  const s = misionEstado(), antes = s.prog[id] || 0; if (antes >= m.n) return;
  s.prog[id] = Math.min(m.n, antes + n);
  if (s.prog[id] >= m.n) { avisa(tr('Misión completada: {m}', { m: tr(m.t) }), 'bueno'); play('pop'); }
}
function misionPon(id, n) { const s = misionEstado(), antes = s.prog[id] || 0; if (n > antes) misionSuma(id, n - antes); }
function logroSuma(c, n) {
  const l = logroEstado(), antes = logroValor({ c });
  if (c === 'mapas') { if (!l.c.mapas.includes(n)) l.c.mapas.push(n); } else l.c[c] = (l.c[c] || 0) + n;
  const ahora = logroValor({ c });
  for (const x of LOGROS) if (x.c === c && antes < x.n && ahora >= x.n) avisa(tr('¡Logro conseguido: {t}!', { t: tr(x.t) }), 'bueno');
}
function misionEvento(tipo, a, b) {
  try {
    const yo = J.yo;
    if (tipo === 'despide') {      // a: el despedido, b: quien despide
      if (!b || !b.jugador) return;
      misionSuma('despide1', 1); misionSuma('despide3', 1); logroSuma('despidos', 1);
      if (J.fase === 'caza' && J.reloj <= 30) misionSuma('ultimos30', 1);
    } else if (tipo === 'silba') { if (!a || !a.jugador || b) return; misionSuma('silbar3', 1); logroSuma('silbidos', 1); }      // b: forzado (no cuenta)
    else if (tipo === 'granada') { if (!a || !a.jugador) return; misionSuma('granada', 1); logroSuma('granadas', 1); }
    else if (tipo === 'poder') { misionSuma('poder', 1); logroSuma('poderes', 1); }
    else if (tipo === 'comparte') { misionSuma('compartir', 1); logroSuma('compartidas', 1); }
    else if (tipo === 'fin') misionFin(a || {}, yo);
    else return;
    guardaPartida(); misionBoton();
  } catch (e) { console.warn('[misiones]', e); }      // las misiones nunca rompen una partida
}
// al acabar una partida (a: J.resultado)
function misionFin(r, yo) {
  if (!yo) return;
  const gana = !!r.victoria, colado = J.modo === 'camaleon', k = J.cuenta || {}, s = misionEstado();
  misionSuma('jugar3', 1); logroSuma('partidas', 1);
  s.roles[colado ? 'colado' : 'becario'] = 1; misionPon('papeles', Object.keys(s.roles).length);
  if (gana) { misionSuma('ganar2', 1); logroSuma('victorias', 1); logroSuma(colado ? 'ganaColado' : 'ganaBecario', 1); }
  if (J.pvp) { misionSuma('linea', 1); logroSuma('linea', 1); }
  const mapa = MAPA_ACT && MAPA_ACT.id;
  if (mapa) { logroSuma('mapas', mapa); if (mapa === 'backrooms') misionSuma('backrooms', 1); }
  if (colado) {
    const camo = +yo.camo || 0;
    if (!yo.fuera) { misionSuma('intacto', 1); logroSuma('intactas', 1); }
    if (camo > 80) misionSuma('camo80', 1);
    if (camo >= 90) logroSuma('camo90', 1);
    if (k.narices > 0) misionSuma('narices', Math.floor(k.narices));
  } else if (gana && !k.fallos) misionSuma('limpio', 1);
}

/* ---------- cobrar ---------- */
async function misionCobra(id) {
  if (MIS.cobrando) return;
  const logro = id.startsWith('logro:'), x = logro ? logroPorId(id.slice(6)) : misionesDeHoy().find(m => m.id === id);
  if (!x || (logro ? !logroHecho(x) || logroCobrado(x) : !misionHecha(x) || misionCobrada(x))) return;
  if (RFS.activo()) {
    MIS.cobrando = true;
    try { await RFS.llama('rf_mision', { p_id: id }); play('select'); play('go'); avisa(tr('+{n} Gotas', { n: x.g }), 'bueno'); }
    catch (e) { RFS.error(e); }
    MIS.cobrando = false;
  } else {
    SAVE.gotas = (SAVE.gotas || 0) + x.g;
    if (logro) logroEstado().cobrados.push(x.id); else misionEstado().cobradas.push(x.id);
    guardaPartida(); play('select'); play('go'); avisa(tr('+{n} Gotas', { n: x.g }), 'bueno');
  }
  misionBoton(); if (typeof misionesPinta === 'function' && !E('p-misiones').hidden) misionesPinta();
}
// el botón del título, con su punto cuando hay algo por cobrar
function misionBoton() { const b = E('b-misiones'); if (b) b.classList.toggle('aviso', misionesPorCobrar() > 0); }
