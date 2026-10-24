// Fans of Rouflage · LAS MISIONES DIARIAS, LAS SEMANALES Y LOS LOGROS: lo que se cuenta y cómo se cobra (datos en misiones-datos.js y logros-datos.js;
// la pantalla en misiones-pantalla.js). El juego avisa con misionEvento('despide' | 'silba' | 'granada' | 'poder' | 'comparte' | 'congela' | 'habilidad' |
// 'pegatina' | 'diario' | 'ayuda' | 'coche' | 'caza' | 'fin', ...) y aquí se decide qué cuenta. El progreso lo lleva esta partida: SAVE.misiones (el día),
// SAVE.semana (la semana, desde el lunes) y SAVE.logros (para siempre).
// Cobrar: sin cuenta (invitado, sin conexión o ?nube=0) suma las Gotas aquí; con cuenta (RFS) lo pide al servidor (rf_mision, servidor/58 y 88), que solo
// deja cobrar una vez cada misión de hoy, cada semanal de esta semana ('sem:id') y cada logro en la vida ('logro:id'). Lo cobrado en el servidor llega con
// su estado (estado.misiones = { dia, cobradas }, estado.semana = { sem, cobradas, empleado, diarias } y estado.logros = [ids]) por misionesDelServidor.
'use strict';

const MIS = { srv: null, srvSem: null, srvLogros: [], cobrando: false, taller: 0 };

function misionEstado() {
  const hoy = misionDia();
  if (!SAVE.misiones || SAVE.misiones.dia !== hoy) SAVE.misiones = { dia: hoy, prog: {}, roles: {}, cobradas: [] };
  const s = SAVE.misiones; if (!s.posturas) s.posturas = []; if (!s.mapas) s.mapas = []; if (!s.prog) s.prog = {}; if (!Array.isArray(s.cobradas)) s.cobradas = [];
  return s;
}
function semanaEstado() {
  const lunes = misionLunes();
  if (!SAVE.semana || SAVE.semana.sem !== lunes) SAVE.semana = { sem: lunes, prog: {}, mapas: [], modos: [], empleado: [], cobradas: [] };
  return SAVE.semana;
}
function logroEstado() {
  if (!SAVE.logros) SAVE.logros = { c: {}, cobrados: [] };
  const l = SAVE.logros; if (!l.c) l.c = {}; if (!Array.isArray(l.cobrados)) l.cobrados = [];
  for (const k of ['mapas', 'posturas', 'mapas90']) if (!Array.isArray(l.c[k])) l.c[k] = [];
  if (typeof l.c.seguidas !== 'number') l.c.seguidas = 0;
  return l;
}
// lo que dice el servidor (lo llama RFS.aplica con el estado de la cuenta)
function misionesDelServidor(e) {
  MIS.srv = e && e.misiones && typeof e.misiones === 'object' ? e.misiones : null;
  MIS.srvSem = e && e.semana && typeof e.semana === 'object' ? e.semana : null;
  MIS.srvLogros = e && Array.isArray(e.logros) ? e.logros : [];
}
const srvHoy = () => (MIS.srv && MIS.srv.dia === misionDia() && Array.isArray(MIS.srv.cobradas) ? MIS.srv.cobradas : []);
const srvSem = () => (MIS.srvSem && MIS.srvSem.sem === misionLunes() ? MIS.srvSem : null);
const unidos = (a, b) => [...new Set([...(a || []), ...(b || [])])];

/* ---------- progreso ---------- */
// las cobradas de hoy (aquí o en el servidor) sin contar la fija: es lo que cuenta la fija
const cobradasHoy = () => unidos(misionEstado().cobradas, srvHoy()).filter(id => id !== MISION_FIJA.id);
function misionProgreso(m) {
  if (m.id === MISION_FIJA.id) return Math.min(m.n, cobradasHoy().length);
  if (m.id === 'diario') return typeof diarioPuede === 'function' && !diarioPuede() ? 1 : Math.min(m.n, misionEstado().prog[m.id] || 0);
  return Math.min(m.n, misionEstado().prog[m.id] || 0);
}
const misionHecha = m => misionProgreso(m) >= m.n;
// cobrada aquí o en el servidor (las dos cuentan: así lo cobrado como invitado no se cobra otra vez al entrar con cuenta el mismo día)
const misionCobrada = m => misionEstado().cobradas.includes(m.id) || srvHoy().includes(m.id);
function semanalProgreso(m) {
  const s = semanaEstado(), v = srvSem();
  if (m.id === SEMANA_FIJA.id) return Math.min(m.n, unidos(s.empleado, v && v.empleado).length);
  if (m.id === 'wdiarias') return Math.min(m.n, Math.max(s.prog.wdiarias || 0, (v && v.diarias) || 0));
  if (m.id === 'wmapas') return Math.min(m.n, s.mapas.length);
  if (m.id === 'wmodos') return Math.min(m.n, s.modos.length);
  return Math.min(m.n, s.prog[m.id] || 0);
}
const semanalHecha = m => semanalProgreso(m) >= m.n;
const semanalCobrada = m => semanaEstado().cobradas.includes(m.id) || !!(srvSem() && Array.isArray(srvSem().cobradas) && srvSem().cobradas.includes(m.id));
function logroValor(l) {
  const c = logroEstado().c;
  if (l.v) { let v = 0; try { v = +l.v() || 0; } catch (e) { v = 0; } const k = 'v:' + l.id; if (v > (c[k] || 0)) c[k] = v; return c[k] || 0; }      // la mejor cifra vista (no baja nunca)
  const v = c[l.c]; return Array.isArray(v) ? v.length : v || 0;
}
const logroHecho = l => logroValor(l) >= l.n;
const logroCobrado = l => logroEstado().cobrados.includes(l.id) || MIS.srvLogros.includes(l.id);
const misionesPorCobrar = () => misionesDeHoy().filter(m => misionHecha(m) && !misionCobrada(m)).length + semanalesDeEsta().filter(m => semanalHecha(m) && !semanalCobrada(m)).length
  + LOGROS.filter(l => logroHecho(l) && !logroCobrado(l)).length;

/* ---------- contar ---------- */
function misionSuma(id, n) {
  const m = misionesDeHoy().find(x => x.id === id); if (!m || m.fija) return;
  const s = misionEstado(), antes = s.prog[id] || 0; if (antes >= m.n) return;
  s.prog[id] = Math.min(m.n, antes + n);
  if (s.prog[id] >= m.n) { avisa(tr('Misión completada: {m}', { m: tr(m.t) }), 'bueno'); play('pop'); }
}
function misionPon(id, n) { const s = misionEstado(), antes = s.prog[id] || 0; if (n > antes) misionSuma(id, n - antes); }
function semanaSuma(id, n) {
  const m = semanalesDeEsta().find(x => x.id === id); if (!m || m.fija) return;
  const s = semanaEstado(), antes = semanalProgreso(m); if (antes >= m.n) return;
  s.prog[id] = Math.min(m.n, (s.prog[id] || 0) + n);
  if (semanalProgreso(m) >= m.n) { avisa(tr('Misión semanal completada: {m}', { m: tr(m.t) }), 'bueno'); play('pop'); }
}
// las listas de la semana (mapas, modos): se apunta lo nuevo y se avisa al completarla
function semanaApunta(lista, id, valor) {
  const m = semanalesDeEsta().find(x => x.id === id), s = semanaEstado(); if (!m || s[lista].includes(valor)) return;
  const antes = semanalProgreso(m); s[lista].push(valor);
  if (antes < m.n && semanalProgreso(m) >= m.n) { avisa(tr('Misión semanal completada: {m}', { m: tr(m.t) }), 'bueno'); play('pop'); }
}
function logroSuma(c, n) {
  const l = logroEstado(), antes = logroValor({ c });
  if (Array.isArray(l.c[c])) { if (!l.c[c].includes(n)) l.c[c].push(n); } else l.c[c] = (l.c[c] || 0) + n;
  const ahora = logroValor({ c });
  for (const x of LOGROS) if (x.c === c && antes < x.n && ahora >= x.n) avisa(x.secreto ? tr('¡Logro secreto descubierto: {t}!', { t: tr(x.t) }) : tr('¡Logro conseguido: {t}!', { t: tr(x.t) }), 'bueno');
}
function misionEvento(tipo, a, b) {
  try {
    const yo = J.yo;
    if (tipo === 'despide') {      // a: el despedido, b: quien despide
      if (a && a === yo && (+a.camo || 0) >= 100) logroSuma('sMalaSuerte', 1);
      if (!b || !b.jugador) return;
      misionSuma('despide1', 1); misionSuma('despide3', 1); semanaSuma('wdespide', 1); logroSuma('despidos', 1);
      if (J.fase === 'caza' && J.reloj <= 30) misionSuma('ultimos30', 1);
    } else if (tipo === 'silba') { if (!a || !a.jugador || b) return; misionSuma('silbar3', 1); logroSuma('silbidos', 1); }      // b: forzado (no cuenta)
    else if (tipo === 'granada') { if (!a || !a.jugador) return; misionSuma('granada', 1); logroSuma('granadas', 1); }
    else if (tipo === 'poder') {
      misionSuma('poder', 1); semanaSuma('wpoder', 1); logroSuma('poderes', 1);
      if (J.fase === 'caza' && J.reloj <= 10 && yo) yo.venganza = true;      // «Fantasma pesado»: se mira al acabar si ganó tu bando
    }
    else if (tipo === 'comparte') { misionSuma('compartir', 1); logroSuma('compartidas', 1); }
    else if (tipo === 'congela') {      // a: quien se congela (solo tú)
      if (!a || !a.jugador) return;
      const p = a.postura || 'firmes', s = misionEstado();
      if (!s.posturas.includes(p)) { s.posturas.push(p); misionPon('posturas2', s.posturas.length); }
      logroSuma('posturas', p);
    }
    else if (tipo === 'habilidad') { if (!a || !a.jugador) return; misionSuma('talento', 1); }
    else if (tipo === 'pegatina') { semanaSuma('wpegatinas', 1); logroSuma('pegatinas', 1); }
    else if (tipo === 'diario') misionPon('diario', 1);
    else if (tipo === 'ayuda') logroSuma('sAyuda', 1);
    else if (tipo === 'coche') logroSuma('sCoche', 1);
    else if (tipo === 'caza') { if (yo) { yo.semovio = !yo.congelado; yo.venganza = false; } return; }      // empieza la caza: desde aquí cuenta «Estatua de sal»
    else if (tipo === 'fin') misionFin(a || {}, yo);
    else return;
    guardaPartida(); misionBoton();
  } catch (e) { console.warn('[misiones]', e); }      // las misiones nunca rompen una partida
}
// al moverte durante la caza ya no eres una estatua (lo llama descongela, entes.js)
function misionDescongela(e) { if (e && e.jugador && J.fase === 'caza') e.semovio = true; }
// el modo de la partida (para Contagio, Ida y vuelta y Retrato robot)
const modoDePartida = () => (typeof modoEs === 'function' ? ['contagio', 'ida', 'retrato'].find(m => modoEs(m)) || 'normal' : 'normal');
// al acabar una partida (a: J.resultado)
function misionFin(r, yo) {
  if (!yo) return;
  const gana = !!r.victoria, colado = yo.clase === 'camaleon' || J.modo === 'camaleon', k = J.cuenta || {}, s = misionEstado(), modo = modoDePartida();
  const publica = J.pvp && !(typeof RFP !== 'undefined' && RFP.info && RFP.info.privada);
  const conAmigos = J.pvp && typeof RFP !== 'undefined' && RFP.info && RFP.info.privada && RFP.slots.filter(x => x.humano).length >= 2;
  misionSuma('jugar3', 1); semanaSuma('wjugar', 1); logroSuma('partidas', 1);
  misionSuma(colado ? 'colado2' : 'becario2', 1);
  s.roles[colado ? 'colado' : 'becario'] = 1; misionPon('papeles', Object.keys(s.roles).length);
  if (gana) { misionSuma('ganar2', 1); semanaSuma('wganar', 1); logroSuma('victorias', 1); logroSuma(colado ? 'ganaColado' : 'ganaBecario', 1); }
  if (J.pvp) {
    misionSuma('linea', 1); semanaSuma('wlinea', 1); logroSuma('linea', 1);
    if (gana) misionSuma('linea2', 1);
    if (modo !== 'normal') misionSuma(modo, 1);
    if (gana) { semanaApunta('modos', 'wmodos', modo); if (modo !== 'normal') logroSuma({ contagio: 'ganaContagio', ida: 'ganaIda', retrato: 'ganaRetrato' }[modo], 1); }
    const rk = r.ranking || []; if (rk.length > 1 && rk[0] && rk[0].jugador) { misionSuma('primero', 1); logroSuma('primeros', 1); }
  } else if (gana) semanaApunta('modos', 'wmodos', 'normal');
  if (conAmigos) semanaSuma('wamigos', 1);
  const mapa = MAPA_ACT && MAPA_ACT.id;
  if (mapa) {
    logroSuma('mapas', mapa); semanaApunta('mapas', 'wmapas', mapa);
    if (!s.mapas.includes(mapa)) { s.mapas.push(mapa); misionPon('mapas3', s.mapas.length); }
    if (mapa === 'backrooms') misionSuma('backrooms', 1);
  }
  { const h = new Date().getHours(); if (h < 5) logroSuma('sNoche', 1); }
  const l = logroEstado();
  if (colado) {
    const camo = +yo.camo || 0;
    if (!yo.fuera) {
      misionSuma('intacto', 1); semanaSuma('wintacto', 1); logroSuma('intactas', 1);
      l.c.seguidas++; misionPon('seguidas2', l.c.seguidas);
      if (yo.semovio === false) logroSuma('sEstatua', 1);      // (solo si llegó a empezar la caza)
      if (k.silbidos >= 10) logroSuma('sSilbato', 1);
      if (gana && !yo.pintado) logroSuma('sSinPintar', 1);
      if (gana && (J.cazadores || []).some(h => !h.fuera && Math.hypot(h.x - yo.x, h.y - yo.y) < 120)) logroSuma('sTopo', 1);
      if (modo === 'contagio' && J.camaleones.filter(e => e !== yo && !e.fuera && e.clase === 'camaleon').length === 0 && J.camaleones.length > 1) logroSuma('sUltimo', 1);
    } else l.c.seguidas = 0;
    if (camo > 80) { misionSuma('camo80', 1); semanaSuma('wcamo', 1); }
    if (camo >= 95) misionSuma('camo95', 1);
    if (camo >= 90) { logroSuma('camo90', 1); if (mapa) logroSuma('mapas90', mapa); }
    if (camo >= 100) logroSuma('camo100', 1);
    if (k.narices > 0) misionSuma('narices', Math.floor(k.narices));
  } else {
    if (gana && !k.fallos) misionSuma('limpio', 1);
    if ((k.fallos || 0) >= 3) logroSuma('sImprocedente', 1);
    if (!(k.aciertos > 0)) logroSuma('sVago', 1);
  }
  if (yo.venganza && (gana || r.bando)) logroSuma('sVenganza', 1);
  yo.venganza = false;
}
// «Al taller»: 5 minutos seguidos en Mi escenario (se mira cada 5 s; al salir vuelve a cero)
setInterval(() => {
  try {
    const p = typeof E === 'function' && E('p-escenario');
    if (!p || p.hidden || document.hidden) { MIS.taller = 0; return; }
    MIS.taller += 5; if (MIS.taller >= 300 && !logroHecho(logroPorId('sTaller'))) { logroSuma('sTaller', 1); guardaPartida(); misionBoton(); }
  } catch (e) { /* nunca molesta */ }
}, 5000);

/* ---------- cobrar ---------- */
// id: 'xxx' (de hoy), 'sem:xxx' (de la semana) o 'logro:xxx'
async function misionCobra(id) {
  if (MIS.cobrando) return;
  const logro = id.startsWith('logro:'), sem = id.startsWith('sem:'), clave = logro ? id.slice(6) : sem ? id.slice(4) : id;
  const x = logro ? logroPorId(clave) : sem ? semanalesDeEsta().find(m => m.id === clave) : misionesDeHoy().find(m => m.id === clave);
  if (!x) return;
  if (logro ? !logroHecho(x) || logroCobrado(x) : sem ? !semanalHecha(x) || semanalCobrada(x) : !misionHecha(x) || misionCobrada(x)) return;
  const trasCobrar = () => {      // lo que cuenta haber cobrado: la fija del día, las semanales de misiones y el logro de misiones
    if (logro || sem) return;
    const s = semanaEstado();
    if (x.id === MISION_FIJA.id) { if (!s.empleado.includes(misionDia())) s.empleado.push(misionDia()); }
    else { semanaSuma('wdiarias', 1); logroSuma('misionesHechas', 1); }
  };
  if (RFS.activo()) {
    MIS.cobrando = true;
    try { await RFS.llama('rf_mision', { p_id: id }); trasCobrar(); guardaPartida(); play('select'); play('go'); avisa(tr('+{n} Gotas', { n: x.g }), 'bueno'); MIS.celebra = x.g; }
    catch (e) { RFS.error(e); }
    MIS.cobrando = false;
  } else {
    SAVE.gotas = (SAVE.gotas || 0) + x.g;
    if (logro) logroEstado().cobrados.push(x.id); else if (sem) semanaEstado().cobradas.push(x.id); else misionEstado().cobradas.push(x.id);
    trasCobrar(); guardaPartida(); play('select'); play('go'); avisa(tr('+{n} Gotas', { n: x.g }), 'bueno'); MIS.celebra = x.g;
  }
  misionBoton(); if (typeof misionesPinta === 'function' && !E('p-misiones').hidden) misionesPinta();
  if (MIS.celebra && typeof misionCelebra === 'function') misionCelebra(MIS.celebra); MIS.celebra = 0;      // las gotas volando (misiones-pantalla.js)
}
// el botón del título, con su punto cuando hay algo por cobrar
function misionBoton() { const b = E('b-misiones'); if (b) b.classList.toggle('aviso', misionesPorCobrar() > 0); }
