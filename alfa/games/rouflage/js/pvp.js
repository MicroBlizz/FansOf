// Fans of Rouflage (prototipo) · PvP: partidas por internet de hasta 10 jugadores. El servidor (rouflage_pvp_buscar) junta a los jugadores en una sala (entras en la que esté
// abierta o abres una; arranca con 10 o a los 10 s de ser dos, y solo corre la espera con 2 o más), reparte los PAPELES al azar (al menos un cazador y un camaleón de verdad, y
// como mucho 2 cazadores y 8 camaleones en total: un cazador por cada 4 camaleones o más) y cobra el caos primordial. Los huecos hasta 10 los llena la máquina (becarios y
// camaleones bot) y los mueve el ANFITRIÓN: el humano de menor número de sala que siga conectado; manda cómo van todos, lleva el reloj y las fases, decide los disparos y quién gana.
// Si se cae, el siguiente recoge a la máquina donde estaba. Cada uno lleva su personaje y manda dónde está hasta 8 veces por segundo si se mueve y 1 si está quieto (pvp-sync.js). Gana un BANDO: los camaleones si
// aguantan el tiempo o los becarios se quedan sin cartas; los cazadores si despiden a todos. El servidor apunta el resultado (rouflage_pvp_cerrar) y paga los puntos.
// Este archivo: el estado, el reparto de plazas, el comienzo de la partida, el anfitrión, el final y el abandono. Las pantallas están en pvp-pantallas.js.
// Abierto para todos (sin flags). ?pvp=local: pruebas entre pestañas del mismo navegador, sin servidor ni cuenta.
'use strict';

const RFP = { activo: false, red: null, canal: null, info: null, sala: null, buscando: null, slots: [], yo: -1, host: 0, soyHost: false, mandoListo: false,
  rx: {}, ido: {}, listos: new Set(), n: 0, tEnvio: 0, tIA: 0, cerrado: false, resultado: null, error: '', redEstado: '', mensajes: 0, ultimoFin: null, vuelta: false, sinPiel: false, tHv: 0, nHv: 0 };
const RFP_AJ = { envioHz: 8, quietoHz: 1, avisosSala: 24, iaHz: 10, iaQuietoHz: 2, sinRed: 8, sinAnfitrion: 3.5, gracia: 12, entreMensajes: 0 };      // desde el 23-10-2026 (red más ligera): moviéndote 8 avisos/s, quieto o congelado 1/s; el anfitrión manda los bots a 10/s si alguno se mueve y a 2/s si están todos quietos. Antes 15/s siempre y 10/s siempre: una sala llena gastaba ~50 mensajes/s y el plan de Supabase da 100 en total      // avisos por segundo de cada jugador como mucho (con muchos baja para que toda la sala sume unos 40) · segundos sin noticias de alguien antes de darlo por ido o de pasar el mando · segundos de gracia al empezar (todos están cargando)

// ---------- buscar partida ----------
// opc: nada (partida pública), { crear: true } (sala con amigos nueva) o { codigo } (entrar en la de un amigo). Las salas con amigos no gastan caos primordial
function pvpBuscar(opc) {
  REPORTE.suceso('pvp', { que: 'buscar', amigos: !!(opc && (opc.crear || opc.codigo)), bots: !!(opc && opc.soloBots) });
  const red = RFRED.red;
  RFP.error = ''; RFP.resultado = null; RFP.amigos = !!(opc && (opc.crear || opc.codigo)); RFP.soloBots = !!(opc && opc.soloBots);      // JUGAR CONTRA BOTS (b-pvp-bots): el menú, sin pasear por tu escenario
  if (opc && opc.crear) RFP.modoMandado = false;      // una sala nueva tuya: se le manda el modo (y el mapa) al abrirla
  if (!RFRED.esLocal() && !RFRED.conSesion()) { RFP.error = RFRED.errorTexto(new Error('cuenta_no_vinculada')); pvpMuestra('p-pvp'); return; }
  const guardada = rfpSalaGuardada();      // si estabas en una partida abierta, volver no gasta caos primordial
  if (!guardada && !RFP.amigos && !energiaPermite()) return;      // sin caos primordial: aviso con la oferta del ilimitado
  if (RFP.buscando) RFP.buscando.cancelar();
  if (typeof RFS !== 'undefined') RFS.ponerYa();      // lo que llevas puesto llega al servidor antes de entrar: de ahí sale la ropa que ven los demás
  RFP.info = null; pvpMuestra('p-busca');
  RFP.buscando = red.buscar((info, err) => {
    if (!info) { RFP.buscando = null; RFP.error = energiaError(err) ? '' : RFRED.errorTexto(err); pvpMuestra(RFP.amigos ? 'p-amigos' : 'p-pvp'); return; }
    RFP.info = info; pvpPintaBusca();
    if (guardada && guardada !== info.sala) rfpOlvidaSala();      // aquella partida ya se cerró: esta es otra
    if (info.estado !== 'espera') {
      RFP.buscando = null; pvpPintaBusca();
      if (guardada === info.sala) rfpEmpieza(info, red, true);      // vuelves a la tuya
      else setTimeout(() => { if (RFP.info === info) rfpEmpieza(info, red); }, 2200);      // un momento para ver con quién juegas
    }
  }, opc || talColaOpc());      // BUSCAR PARTIDA: con o sin talentos, lo que eligió (talentos-pantalla.js)
}
function pvpCancelar() { REPORTE.suceso('pvp', { que: 'cancelar' }); if (RFP.buscando) { RFP.buscando.cancelar(); RFP.buscando = null; } RFP.info = null; pvpMuestra(RFP.amigos ? 'p-amigos' : 'p-pvp'); }
// el anfitrión de una sala con amigos la arranca (el sondeo de la sala recoge el cambio)
function pvpEmpezar() {
  REPORTE.suceso('pvp', { que: 'empieza' });
  const b = E('b-busca-empezar'); b.disabled = true;
  Promise.resolve(RFRED.red.empezar()).catch(e => { RFP.error = RFRED.errorTexto(e); pvpPintaBusca(); }).finally(() => { b.disabled = false; });
}

// ---------- el reparto de plazas: igual en todos los navegadores (sale de la semilla de la sala) ----------
// mulberry32: azar repetible a partir de un número
const rfpAzar = semilla => { let a = (semilla | 0) + 91; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
// plazas: primero los humanos (por su número de sala), luego los becarios de la máquina y luego los camaleones de la máquina. Cada plaza: { s, humano, clase, tipo, nombre, mana, yo }
function rfpReparte(info) {
  const ida = !!(info.modo && info.modo.m === 'ida');      // Ida y vuelta (modos-ida.js): todos empiezan de colado
  const humanos = (info.jugadores || []).slice().sort((a, b) => a.orden - b.orden), azar = rfpAzar(info.semilla), total = info.max || 10, ncaz = ida ? 0 : info.ncaz || 2;
  const slots = humanos.map((j, i) => ({ s: i, humano: true, clase: j.rol === 'cazador' && !ida ? 'cazador' : 'camaleon', tipo: j.rol === 'cazador' && !ida ? 'becario' : (NOMBRES[j.animal] ? j.animal : 'bunny'), nombre: j.nombre || ('Fan#' + (i + 1)), mana: 0, yo: !!j.yo, ropaFiada: 'ropa' in j, ropaSrv: j.ropa || null }));   // ropaFiada: el servidor (SQL 54) dice qué lleva cada uno; si no, vale lo que se manden entre ellos
  const hc = slots.filter(x => x.clase === 'cazador').length, hm = slots.length - hc;
  const iaCaz = Math.max(0, ncaz - hc), iaCam = Math.max(0, total - ncaz - hm), numeros = [7, 12, 3, 9, 5];
  for (let i = 0; i < iaCaz; i++) slots.push({ s: slots.length, humano: false, clase: 'cazador', tipo: 'becario', nombre: tr('Becario {n}', { n: numeros[i % numeros.length] }), mana: 0, yo: false });
  const tipos = Object.keys(NOMBRES), ini = Math.floor(azar() * tipos.length);
  for (let i = 0; i < iaCam; i++) {
    const tipo = tipos[(ini + i) % tipos.length], vuelta = Math.floor((ini + i) / tipos.length);
    slots.push({ s: slots.length, humano: false, clase: 'camaleon', tipo, nombre: NOMBRES[tipo] + (vuelta ? ' ' + (vuelta + 1) : ''), mana: 0.15 + azar() * 0.8, yo: false });
  }
  return slots;
}
// dónde sale cada uno: los camaleones por la cafetería (en filas si son más que puntos) y los becarios por Recursos Humanos
function rfpSalida(sl, i) {
  const base = sl.clase === 'cazador' ? SALIDA_CAZADORES : SALIDA_CAMALEONES, p = base[i % base.length], v = Math.floor(i / base.length);
  return [p[0] + v * 20 * (i % 2 ? 1 : -1), p[1] + v * 18];
}

// ---------- empezar la partida ----------
function rfpEmpieza(info, red, vuelta) {
  limpiaPartida();                    // (si era otra partida por internet, cierra su canal)
  const slots = rfpReparte(info), mio = slots.find(x => x.yo);
  if (!mio) { RFP.error = RFRED.errorTexto(new Error('sala_no_valida')); pvpMuestra('p-pvp'); return; }
  Object.assign(RFP, { activo: true, red, info, sala: info.sala, slots, yo: mio.s, host: 0, soyHost: false, mandoListo: false, rx: {}, ido: {}, listos: new Set(), n: 0, tEnvio: 0, tIA: 0, cerrado: false, resultado: null, error: '', redEstado: '', ultimoFin: null, vuelta: false, sinPiel: false, tHv: 0, nHv: 0, modoMandado: false });
  rfpGuardaSala(info.sala);
  if (info.privada && info.modo && info.modo.mapa === MAPA_ESC.id) mapaDeEscenario(SALA_ESP.datos || SALA_ESP_VACIA);      // ESTE ESCENARIO: el del anfitrión, el que se veía en la sala (mapa-escenario.js)
  cargaMapa(mapaDeSala(info.modo) || mapaDeSemilla(info.semilla));      // el que eligió el anfitrión o, si no, el de la semilla: el mismo en todos los navegadores
  modoPon(info.privada ? info.modo : modoPublico(info.modo, info.semilla));      // el modo de la sala (modos.js): el del anfitrión con amigos; en BUSCAR PARTIDA, todo al azar
  eventosPrepara(info.semilla);                // y los eventos del mapa también
  J.pvp = true; J.modo = mio.clase; J.t = 0;
  let nc = 0, nh = 0;
  for (const sl of slots) {
    let [x, y] = rfpSalida(sl, sl.clase === 'cazador' ? nh++ : nc++);
    [x, y] = sitioLibreCerca(x, y);      // si la salida cae encima de un mueble (pasa con muchos jugadores, o en Mi escenario), al hueco libre más cercano: igual en todos los navegadores
    const e = nuevoEnte(sl.clase, sl.tipo, sl.nombre, x, y);
    e.slot = sl.s; e.humano = sl.humano; sl.ente = e;
    if (sl.yo) { e.jugador = true; J.yo = e; J.cuenta = e.pts; vistePartida(e, ropaPartida()); } else { e.remoto = true; if (sl.ropaFiada) { vistePartida(e, sl.ropaSrv || {}); sl.ropaOk = true; } }      // lo tuyo del armario (armario.js); lo de los demás, del servidor si lo da
    if (sl.clase === 'cazador') { e.dir = -Math.PI / 2 + (nh % 2 ? -0.5 : 0.5); e.mira = nh % 2 ? 1 : -1; }
    if (sl.humano) RFP.rx[sl.s] = RELOJ + RFP_AJ.gracia;      // los humanos están cargando: de margen
  }
  RFP.canal = red.canal(info.sala, rfpRecibe, est => { RFP.redEstado = est; });
  PIDE_ROPA.n = 0; PIDE_ROPA.t = 3;
  rfpMandaRopa(true);      // lo que llevas del armario, y que los demás te cuenten lo suyo
  if (vuelta) RFP.vuelta = true;
  rfpActualizaAnfitrion();
  pantalla(null); cambiaFase('prep'); avanzaCamara(0, true); refrescaHud(true);
  if (vuelta) rfpEmpiezaVuelta();
}
// la partida se acaba (o se sale de ella): se cierra el canal; el servidor ya tiene el resultado
function rfpTermina() {
  if (RFP.canal) { RFP.canal.cerrar(); RFP.canal = null; }
  if (RFP.lobby) salaVivaApaga();      // la sala viva (sala-viva.js)
  RFP.activo = false; RFP.soyHost = false; RFP.mandoListo = false;
}
// salir del final de una partida: el resultado ya está apuntado
function rfpSale() { rfpOlvidaSala(); rfpTermina(); }

// ---------- el anfitrión: el humano de menor plaza que siga conectado ----------
function rfpCalculaAnfitrion() {
  if (RFP.vuelta) { const o = RFP.slots.find(sl => sl.humano && sl.s !== RFP.yo); return o ? o.s : RFP.yo; }      // recién vuelto: manda otro, hasta que me pongan al día
  for (const sl of RFP.slots) {
    if (!sl.humano) continue;
    if (sl.s === RFP.yo) return sl.s;
    if (RFP.ido[sl.s] || RELOJ - (RFP.rx[sl.s] || 0) > RFP_AJ.sinAnfitrion) continue;
    return sl.s;
  }
  return RFP.yo;
}
const rfpSoyAnfitrion = () => RFP.soyHost;
// cada paso: si el anfitrión soy yo, la máquina la mueve mi juego; si no, son copias que siguen lo que manda el anfitrión. Al cambiar, el que la recoge sigue desde donde estaba.
function rfpActualizaAnfitrion() {
  const h = rfpCalculaAnfitrion(), soy = h === RFP.yo;
  RFP.host = h;
  if (RFP.mandoListo && soy === RFP.soyHost) return;
  RFP.soyHost = soy; RFP.mandoListo = true;
  const ocupados = [];
  for (const e of J.entes) {
    if (e.humano) continue;
    if (soy && e.remoto) rfpCogeIA(e, ocupados);
    else if (!soy && !e.remoto) rfpSueltaIA(e);
  }
}
// la máquina pasa a moverla este navegador: cerebro nuevo, desde donde estaba
function rfpCogeIA(e, ocupados) {
  const sl = RFP.slots[e.slot]; e.remoto = false; e.red = null;
  if (e.fuera || e.dueno) return;      // (un cuerpo de Ida y vuelta no se mueve)
  if (e.clase === 'cazador') {
    cerebroCazador(e);
    if (J.fase === 'caza') ronda(e);
  } else {
    if (J.fase === 'prep' && !e.pintado && !e.congelado && !e.postura_ya) { e.postura_ya = true; cambiaPostura(e, posturaBot()); }
    cerebroCamaleon(e, sl.mana);
    if (e.congelado) { e.bot.estado = 'quieto'; e.sitio = [e.x, e.y]; e.pintado = true; }
    else if (J.fase === 'caza') { e.sitio = eligeSitio(e, ocupados); ocupados.push(e.sitio); }
    else { e.sitio = eligeSitio(e, ocupados); ocupados.push(e.sitio); }
  }
}
// la máquina vuelve a ser una copia de lo que manda el anfitrión
function rfpSueltaIA(e) {
  e.bot = null; e.remoto = true; e.vx = e.vy = 0; e.red = { x: e.x, y: e.y, m: false, mi: e.mira, di: e.dir };
}

// ---------- los que se van ----------
// uno se ha ido (se rindió, cerró la pestaña o lleva mucho sin noticias): sale de la partida sin ruido
function rfpSeVa(s) {
  const sl = RFP.slots[s]; if (!sl || RFP.ido[s] || !sl.ente) return;
  RFP.ido[s] = true;
  const e = sl.ente; if (e.fuera && e.balas <= 0) return;
  avisa(tr('{a} ha dejado la partida', { a: e.nombre }), 'aviso');
  rfpApartar(e);
}
// sacar a alguien de la partida sin sello ni sonido (se fue, o el anfitrión dice que ya estaba fuera)
function rfpApartar(e) {
  if (e.fuera && e.balas <= 0) return;
  e.fuera = true; e.congelado = false; e.vx = e.vy = 0; e.tFuera = 9; e.balas = 0;
}
function rfpVigilaSilencios() {
  for (const sl of RFP.slots) {
    if (!sl.humano || sl.s === RFP.yo || RFP.ido[sl.s] || sl.ausente) continue;
    if (RELOJ - (RFP.rx[sl.s] || 0) > RFP_AJ.sinRed) rfpAusente(sl);      // sin noticias: desconectado, no ido (puede volver)
  }
}
// te vas tú (RENDIRSE en la pausa): los demás te dan por ido; no cobras ni pierdes puntos
function rfpRendirse(vivo) {
  if (!RFP.activo || RFP.cerrado) { rfpTermina(); return; }
  RFP.cerrado = true; rfpOlvidaSala();      // irse a propósito es definitivo: la siguiente búsqueda te mete en otra sala
  const sala = RFP.sala;
  rfpManda({ t: 'rd' });
  // el aviso se repite por si se pierde uno (la red no garantiza que llegue); luego se cierra el canal, si no ha empezado ya otra sala
  [200, 400].forEach(ms => setTimeout(() => { if (RFP.sala === sala) rfpManda({ t: 'rd' }); }, ms));
  if (RFP.red) Promise.resolve(RFP.red.rendir(vivo)).catch(() => { /* da igual */ });
  setTimeout(() => { if (RFP.sala === sala) rfpTermina(); }, 650);
}
// cerrar la pestaña o perder la conexión NO es rendirse: la plaza se guarda y puedes volver con BUSCAR PARTIDA mientras la sala siga abierta (pvp-vuelta.js)

// ---------- el final: el anfitrión decide el bando ganador y se lo cuenta a todos; cada uno apunta en el servidor si ganó su bando ----------
function rfpCierra(victoria) {
  if (RFP.cerrado || !RFP.activo) return;
  RFP.cerrado = true; rfpOlvidaSala();
  const sala = RFP.sala, red = RFP.red;
  setTimeout(() => {
    red.cerrar(sala, victoria).then(r => {
      RFP.resultado = r || {}; if (typeof ENERGIA !== 'undefined') ENERGIA.premioVictoria(Object.assign({ sala }, RFP.resultado)); pvpResultadoExtra();
    }).catch(e => { RFP.resultado = { error: RFRED.errorTexto(e) }; pvpResultadoExtra(); });
  }, 2500);      // pasados unos segundos: el servidor no acepta cierres de partidas que no han podido acabar
}
