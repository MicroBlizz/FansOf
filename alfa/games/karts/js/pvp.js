// Fans of Karts (prototipo) · PvP: carreras por internet de hasta 8 jugadores. El servidor junta a los jugadores en una sala (karts_pvp8_buscar: entras en la
// que esté abierta o abres una; arranca con 8 o al minuto de crearse, aunque sea con uno solo), elige la pista y paga los puntos; la carrera va entre los
// navegadores por el canal de la sala (pvp-red.js): cada uno conduce su kart y manda 12 veces por segundo dónde va; los karts rivales que ves son
// copias que siguen esos avisos (se adelantan con su velocidad y se corrigen suave). Lo que te lanzan te lo aplica tu propio juego (quien recibe
// decide si le han dado) y se lo cuenta al autor para que vea el aviso. El puesto es el orden de llegada; quien se queda sin red más de 8 segundos
// o se rinde deja de contar. Los huecos hasta 8 los ocupan karts de la máquina (los mueve un humano, el «anfitrión»: el de menor número de sala que siga conectado; manda su estado a todos y, si se cae, otro los recoge donde estaban; solo cuentan los puestos entre humanos) y la
// salida es al azar (la semilla de la sala baraja las 8 casillas, igual para todos). Pantallas: pvp-pantallas.js (lienzo) y pvp-sala.js (la sala de espera y la de amigos, en HTML); la copa online, pvp-copa.js.
// Abierto para todos (el juego es una beta: sin flags). ?pvp=local: pruebas entre pestañas del mismo navegador, sin servidor.
'use strict';

const KPVP = { activo: false, sala: null, orden: -1, jugadores: [], cas: [], ias: [], pista: '', red: null, canal: null, remotos: {}, listoYo: false, listos: {}, salida: false,
  tEnvio: 0, tEspera: 0, n: 0, cerrado: false, resultado: null, busca: null, tBusca: 0, info: null, error: '', aviso: '', clasif: null, tClasif: 0, rendido: false, redEstado: '',
  looks: {}, charla: [], salidos: {}, carrera: 0, copa: null, privada: false, canalSala: null };
const KPVP_AJ = { envioHz: 12, avisosSala: 40, enCuenta: 4, sinRed: 8, esperaSalida: 25, sinAnfitrion: 3 };    // avisos por segundo de cada jugador como mucho (en carrera / en la cuenta atrás; con muchos jugadores baja para que toda la sala sume unos 40 avisos por segundo) · segundos sin noticias de un rival antes de darlo por ido · máximo esperando a que todos carguen · segundos sin noticias del anfitrión antes de pasar la máquina a otro

// el PvP está abierto para todos (el juego es una beta y no hace falta abrirlo por fases)
function pvpAbierto() { return true; }

// ---------- buscar carrera ----------
// opc: {} la búsqueda de siempre · { crear: true } sala con amigos nueva · { codigo } entrar en la de un amigo (pvp-sala.js)
function pvpBuscar(opc = {}) {
  const red = KRED.red, piloto = JUGABLES[PANT.piloto].id;
  KPVP.error = ''; KPVP.aviso = ''; KPVP.tBusca = 0; KPVP.resultado = null; KPVP.rendido = false; KPVP.info = null; KPVP.copa = null; KPVP.carrera = 0; KPVP.looks = {}; KPVP.charla = [];
  pvpCierraCanal();
  if (!KRED.esLocal() && !KRED.vinculada()) { KPVP.error = KRED.errorTexto(new Error('cuenta_no_vinculada')); ve(opc.crear || opc.codigo ? 'pvp-amigos' : 'pvp'); return; }
  if (!opc.crear && !opc.codigo && !energiaPermite()) return;      // sin caos primordial: aviso con la oferta del ilimitado (las salas con amigos no gastan)
  ve('pvp-busca');
  KPVP.busca = red.buscar(piloto, (info, err) => {
    if (!info) { KPVP.busca = null; KPVP.error = energiaError(err) ? '' : KRED.errorTexto(err); pvpCierraCanal(); ve(opc.crear || opc.codigo ? 'pvp-amigos' : 'pvp'); return; }
    KPVP.info = info;
    pvpCanalSala(info.sala, red);      // el canal se abre ya en la sala de espera (votos, mensajes y lo que lleva cada uno)
    if (info.estado !== 'espera') { KPVP.busca = null; pvpEmpezar(info, red); }
  }, opc);
}
function pvpCancelar() { if (KPVP.busca) { KPVP.busca.cancelar(); KPVP.busca = null; } if (KPVP.activo) pvpTermina(); pvpCierraCanal(); ve('pvp'); }
// el canal de la sala: uno por sala (si ya está abierto para esa sala, se reutiliza). Todo lo que se manda lleva el número de carrera de la copa.
function pvpCanalSala(sala, red) {
  if (KPVP.canal && KPVP.canalSala === sala) return KPVP.canal;
  pvpCierraCanal();
  const c = red.canal(sala, m => pvpRecibir(m), est => { KPVP.redEstado = est; if (est === 'unido') pvpMandaLook(); });
  const enviar = c.enviar;
  c.enviar = d => enviar(Object.assign({ cr: KPVP.carrera || 0 }, d));
  KPVP.canal = c; KPVP.canalSala = sala;
  return c;
}
function pvpCierraCanal() { if (KPVP.canal) { KPVP.canal.cerrar(); KPVP.canal = null; KPVP.canalSala = null; } }
// la sala arranca: se abre el canal y se carga la carrera en la pista que dijo el servidor
function pvpEmpezar(info, red) {
  Object.assign(KPVP, { activo: true, sala: info.sala, orden: info.orden, jugadores: (info.jugadores || []).slice(), pista: info.pista, red, remotos: {}, listoYo: false, listos: {}, salida: false, tEnvio: 0, tEspera: 0, n: 0, cerrado: false, resultado: null, redEstado: '' });
  if (info.copa && !KPVP.copa) KPVP.copa = { pistas: pvpPistasCopa(info.pista), puntos: {}, ultimos: {}, i: 0 };
  pvpReparte(info);
  pvpCanalSala(info.sala, red);
  const ip = PISTAS.findIndex(p => p.id === info.pista);
  PANT.pista = ip >= 0 ? ip : 0;
  PANT.encontrado = 2.2;     // la pantalla de buscar enseña a los rivales un momento y luego carga
}
// la carrera ha terminado (o se ha salido): se cierra el canal; el servidor ya tiene el resultado
// (en una copa online el canal sigue abierto hasta la última carrera, y en los resultados para los mensajes rápidos: lo cierra pvpCierraCanal al salir)
function pvpTermina() {
  KPVP.pendChecked = false;
  KPVP.activo = false; KPVP.remotos = {};
  if (!CARRERA || !CARRERA.pvp || KPVP.rendido) pvpCierraCanal();
}
// la parrilla: los rivales por su orden en la sala y tú el último de la lista (cada uno sale de la casilla de su orden)
function pvpParrilla(idPiloto) {
  const rivales = KPVP.jugadores.filter(j => j.orden !== KPVP.orden).map(j => PILOTO[j.piloto] || PILOTO.ceo);
  return rivales.concat(KPVP.ias.map(a => a.piloto), PILOTO[idPiloto]);
}
const pvpNRivales = () => KPVP.jugadores.filter(j => j.orden !== KPVP.orden).length;
// ¿el kart i de la parrilla lo conduce la máquina? (los humanos van primero, luego la máquina, y tú el último)
const pvpEsIA = i => i >= pvpNRivales() && i < pvpNRivales() + KPVP.ias.length;
function pvpCasilla(i) {
  const riv = KPVP.jugadores.filter(j => j.orden !== KPVP.orden), n = riv.length;
  return KPVP.cas[i < n ? riv[i].orden : i < n + KPVP.ias.length ? KPVP.ias[i - n].plaza : KPVP.orden];
}
// el reparto de la sala, igual en todos los navegadores (sale de la semilla): la salida al azar (qué casilla de la parrilla toca a cada plaza)
// y los karts de la máquina que rellenan las plazas libres hasta 8 (pilotos que no estén ya en la sala, si hay)
function pvpReparte(info) {
  const azar = azarDe((info.semilla | 0) + 12345), baraja = l => { const a = l.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(azar() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  KPVP.cas = baraja([0, 1, 2, 3, 4, 5, 6, 7]);
  const usados = new Set(KPVP.jugadores.map(j => j.piloto)), libres = baraja(PILOTOS.filter(p => !usados.has(p.id))), otros = baraja(PILOTOS);
  KPVP.ias = [];
  for (let plaza = KPVP.jugadores.length; plaza < 8; plaza++) KPVP.ias.push({ plaza, piloto: libres.length ? libres.pop() : otros[plaza % otros.length] });
}
// al construir la carrera: los karts que no son el tuyo los mueve la red
function pvpPreparaKarts(C) {
  const riv = KPVP.jugadores.filter(j => j.orden !== KPVP.orden);
  KPVP.remotos = {};
  riv.forEach((j, i) => {
    const k = C.karts[i];
    k.remoto = { orden: j.orden, x: k.x, y: k.y, ang: k.ang, dir: k.ang, v: 0, z: 0, t: 0, estado: 'normal', tam: 1, derrape: 0, nivel: 0, turbo: false, angVis: k.ang, ultimoRx: RELOJ, visto: false };
    k.nombre = j.nombre; k.ido = false;
    KPVP.remotos[j.orden] = k;
  });
  // los karts de la máquina van después de los humanos; quién los mueve se decide cada paso (pvpActualizaAnfitrion)
  KPVP.ias.forEach((a, j) => { const i = riv.length + j, k = C.karts[i]; k.plaza = a.plaza; a.kart = k; a.indice = i; a.nivel = k.ia ? k.ia.nivel : 0.92; });
}
// el anfitrión: el humano de menor número de sala que siga conectado (antes de salir basta con que no se haya ido; en carrera, que haya dado noticias hace poco)
function pvpAnfitrion(C) {
  let h = KPVP.orden;
  for (const k of pvpRivales()) {
    if (k.ido || (C.estado !== 'cuenta' && RELOJ - k.remoto.ultimoRx > KPVP_AJ.sinAnfitrion)) continue;
    if (k.remoto.orden < h) h = k.remoto.orden;
  }
  return h;
}
const pvpSoyAnfitrion = C => pvpAnfitrion(C) === KPVP.orden;
// cada paso: si el anfitrión soy yo, la máquina la mueve mi juego; si no, es una copia que sigue lo que manda el anfitrión. Al cambiar, el que la recoge sigue desde donde estaba.
function pvpActualizaAnfitrion(C) {
  const soy = pvpSoyAnfitrion(C);
  for (const a of KPVP.ias) {
    const k = a.kart;
    if (!k) continue;
    if (soy && k.remoto) { delete KPVP.remotos[a.plaza]; k.remoto = null; creaIA(k, a.nivel, a.indice); k.ia.tSalida = 0; }
    else if (!soy && !k.remoto) {
      if (k.ia) a.nivel = k.ia.nivel;
      k.ia = null; k.v = k.v || 0;
      k.remoto = { orden: a.plaza, x: k.x, y: k.y, ang: k.ang, dir: k.dir, v: k.v, z: k.z, t: 0, estado: k.estado, tam: k.tam, derrape: k.derrape, nivel: k.nivel, turbo: false, angVis: k.angVis, ultimoRx: RELOJ, visto: true, n: 0, host: -1 };
      KPVP.remotos[a.plaza] = k;
    }
  }
}
const pvpRivales = () => Object.values(KPVP.remotos).filter(k => k.plaza == null);      // los rivales humanos (los karts de la máquina también están en remotos si los mueve otro)
const pvpIdos = () => pvpRivales().filter(k => k.ido).length;
// la cuenta atrás no empieza hasta que todos han cargado (o pasan 25 s: quien no haya llegado se queda fuera). El de orden 0 da la salida ('ya').
function pvpEsperaSalida(C, dt) {
  if (KPVP.salida) return true;
  KPVP.tEspera += dt;
  KPVP.listoYo = true;
  C.tCuenta = 4.5;      // el marcador enseña «Conectando con los servidores…» (esta vez es verdad)
  const todos = pvpRivales().every(k => KPVP.listos[k.remoto.orden]);
  if ((todos || KPVP.tEspera > KPVP_AJ.esperaSalida) && (KPVP.orden === 0 || KPVP.tEspera > KPVP_AJ.esperaSalida)) pvpArranca(C);
  pvpEnvia(C, dt, true);
  return KPVP.salida;
}
function pvpArranca(C) {
  if (KPVP.salida) return;
  KPVP.salida = true; C.tCuenta = 3.7;
  for (const k of pvpRivales()) if (!KPVP.listos[k.remoto.orden]) pvpSeVa(k, '%1 no ha llegado a la salida.');
}

// ---------- lo que se manda ----------
function pvpEnvia(C, dt, cuenta) {
  if ((KPVP.tLatido = (KPVP.tLatido || 0) - dt) <= 0 && KPVP.red && !KPVP.cerrado) { KPVP.tLatido = 30; KPVP.red.latido(); }      // sigo aquí: si desaparezco más de 3 min cuenta como abandono
  KPVP.tEnvio -= dt;
  if (KPVP.tEnvio > 0) return;
  const hz = Math.min(KPVP_AJ.envioHz, Math.max(5, KPVP_AJ.avisosSala / Math.max(1, KPVP.jugadores.length)));
  KPVP.tEnvio = 1 / (cuenta ? Math.min(KPVP_AJ.enCuenta, hz) : hz);
  const k = C.jugador, r = n => Math.round(n * 100) / 100;
  const estado = q => { const e = { x: r(q.x), y: r(q.y), a: r(q.ang), d: r(q.dir), av: r(q.angVis), v: r(q.v), z: r(q.z), e: q.estado, tm: r(q.tam), dr: q.derrape, nv: q.nivel, tb: q.tTurbo > 0 ? 1 : 0,
    mo: q.monedas, ob: q.objeto || '', vu: q.vuelta, ib: q.tInmune > 0 ? 1 : 0, dn: q.tDron > 0 ? 1 : 0, co: q.tCola > 0 ? 1 : 0 }; if (q.fin) { e.fin = r(q.fin); e.pf = q.puestoFinal; } return e; };
  const m = Object.assign({ de: KPVP.orden, t: 'e', n: ++KPVP.n, l: KPVP.listoYo ? 1 : 0, ya: KPVP.salida ? 1 : 0 }, estado(k));
  if (KPVP.canal) {
    KPVP.canal.enviar(m);
    // el anfitrión manda también dónde van los karts de la máquina (todos en un solo aviso)
    if (!cuenta) { const ks = KPVP.ias.filter(a => a.kart && !a.kart.remoto).map(a => Object.assign({ p: a.plaza }, estado(a.kart))); if (ks.length) KPVP.canal.enviar({ de: KPVP.orden, t: 'ia', n: KPVP.n, ks }); }
  }
}
const pvpManda = m => { if (KPVP.canal) KPVP.canal.enviar(Object.assign({ de: KPVP.orden }, m)); };

// ---------- lo que llega ----------
function pvpRecibir(m) {
  if (!m || m.de === KPVP.orden || m.de == null || !KPVP.activo) return;
  const C = CARRERA, k = KPVP.remotos[m.de];
  if (k && k.rendido) return;      // quien se ha rendido ya no vuelve: un aviso suyo que llegue tarde no lo resucita
  if (m.t === 'e') {
    if (m.l) KPVP.listos[m.de] = true;
    if (m.ya && !KPVP.salida && m.de === 0 && C.estado === 'cuenta') pvpArranca(C);
    if (!k || (m.n || 0) < (k.remoto.n || 0)) return;        // uno viejo que llegó tarde (o de alguien que no está en la parrilla)
    pvpAplica(k, m, m.de);
  } else if (m.t === 'ia') {
    // la máquina que mueve el anfitrión (si el anfitrión soy yo, la mía manda)
    if (pvpSoyAnfitrion(C)) return;
    for (const e of m.ks || []) { const kk = KPVP.remotos[e.p]; if (kk && kk.plaza != null) pvpAplica(kk, Object.assign({ n: m.n }, e), m.de); }
  } else if (m.t === 'obj') {
    // un rival lanza algo: aparece aquí también, con él de autor
    if (!k) return;
    if (m.tipo === 'nerf') { C.sueltos.push({ tipo: 'nerf', x: m.x, y: m.y, idx: m.idx, lat: m.lat, vel: m.vel, autor: k, vida: 4.5, alto: 3, fase: 0 }); comenta(trf('%1 ha lanzado un Nerf.', k.nombre)); }
    else if (m.tipo === 'parche') C.sueltos.push({ tipo: 'parche', x: m.x, y: m.y, idx: m.idx, lat: m.lat, autor: k, vida: 45, armado: 0.35, alto: 0, fase: Math.random() * 6 });
  } else if (m.t === 'golpe') {
    // un rival te aplica el Mantenimiento o la Cola (si no estás inmune); 'a' dice a quién va
    // si el golpe va a un kart de la máquina que muevo yo, lo decide mi juego y avisa al autor
    const ai = k && C.karts.find(x => x.plaza === m.a && !x.remoto && x.ia);
    if (ai) { if (golpea(ai, m.tipo, k)) pvpManda({ t: 'dado', tipo: m.tipo, a: m.de, p: ai.piloto.id }); return; }
    if (!k || m.a !== KPVP.orden) return;
    const yo = C.jugador, quien = m.q && PILOTO[m.q] ? tr(PILOTO[m.q].nombre) : k.nombre;
    if (m.tipo === 'parado' && golpea(yo, 'parado', k)) { aviso('MANTENIMIENTO', 'Volvemos enseguida™', '#ff8a1f'); comenta(trf('%1 ha puesto los servidores en mantenimiento.', quien)); pvpManda({ t: 'dado', tipo: 'parado', a: m.de }); }
    else if (m.tipo === 'cola' && golpea(yo, 'cola', k)) { aviso('EN COLA', 'Posición en la cola: 9.999', '#22e3ff'); comenta(trf('%1 te ha metido en la cola de inicio de sesión.', quien)); pvpManda({ t: 'dado', tipo: 'cola', a: m.de }); }
  } else if (m.t === 'dado') {
    // le has dado tú a alguien: el aviso de siempre
    if (!k || m.a !== KPVP.orden) return;
    const nom = m.p && PILOTO[m.p] ? tr(PILOTO[m.p].nombre) : k.nombre;
    if (m.tipo === 'nerf') { aviso('¡NERF!', trf('%1 corre un 26 % menos.', nom), '#5ef27a'); play('laugh'); }
    else if (m.tipo === 'parche') { aviso('¡PARCHE!', trf('%1 se ha roto.', nom), '#5ef27a'); play('laugh'); }
    else if (m.tipo === 'cola') { aviso('¡A LA COLA!', trf('%1: posición 9.999', nom), '#22e3ff'); play('hack'); }
  } else if (m.t === 'rendir') {
    if (k) { k.rendido = true; pvpSeVa(k, '%1 se ha rendido.'); }
  }
}
// un aviso del estado de un kart que no es mío (un humano, o uno de la máquina que mueve el anfitrión)
function pvpAplica(k, m, de) {
  const C = CARRERA, r = k.remoto, ia = k.plaza != null;
  if (ia && r.host !== de) { r.host = de; r.n = 0; }       // otro anfitrión: su cuenta de avisos empieza de cero
  if ((m.n || 0) < (r.n || 0)) return;                    // uno viejo que llegó tarde
  // la máquina no puede dar saltos imposibles (un anfitrión que haga cosas raras solo estropea la carrera de la máquina, no da puntos)
  if (ia && r.visto && RELOJ - r.ultimoRx < 1 && Math.hypot(m.x - r.x, m.y - r.y) > 150) return;
  r.ultimoRx = RELOJ;
  if (k.ido && !k.fin) { k.ido = false; comenta(trf('%1 ha vuelto.', k.nombre)); }
  Object.assign(r, { n: m.n, x: m.x, y: m.y, ang: m.a, dir: m.d, angVis: m.av, v: m.v, z: m.z, t: 0, estado: m.e, tam: m.tm, derrape: m.dr, nivel: m.nv, turbo: !!m.tb, inmune: !!m.ib, dron: !!m.dn, cola: !!m.co });
  k.monedas = m.mo; k.objeto = m.ob || null; k.vuelta = Math.max(k.vuelta, m.vu || 0);
  if (!r.visto) { r.visto = true; k.x = m.x; k.y = m.y; k.ang = k.dir = k.angVis = m.a; }
  if (m.fin && !k.fin) {
    k.fin = m.fin; k.puestoFinal = ++C.llegados;
    if (!C.jugador.fin) { aviso(trf('%1 HA LLEGADO', k.nombre || tr(k.piloto.nombre)), trf('Ha quedado %1', puestoTxt(k.puestoFinal)), '#ff5c8a'); }
  }
}
// te han dado con algo de un rival (lo decide tu juego): se le cuenta para que vea el aviso
function pvpMeHanDado(tipo, autor) { if (KPVP.activo && autor && autor.remoto) pvpManda({ t: 'dado', tipo, a: autor.remoto.orden }); }
// usas Mantenimiento o Cola contra un rival: se le manda el golpe (él decide si le da, según su inmunidad)
function pvpGolpeaRemoto(k, tipo, autor) { if (k && k.remoto) pvpManda({ t: 'golpe', tipo, a: k.remoto.orden, q: autor && autor.plaza != null ? autor.piloto.id : undefined }); }
// un kart de la máquina que muevo yo ha recibido un Nerf o un Parche de un humano: se lo cuento para que vea el aviso (true si había a quién)
function pvpAvisaAutor(tipo, autor, victima) {
  if (!KPVP.activo || !autor || !autor.remoto || autor.plaza != null || victima.plaza == null) return false;
  pvpManda({ t: 'dado', tipo, a: autor.remoto.orden, p: victima.piloto.id }); return true;
}
// lanzas un Nerf o sueltas un Parche: los rivales lo ven aparecer
function pvpLanza(o, k) { if (KPVP.activo) pvpManda({ t: 'obj', de: k && k.plaza != null ? k.plaza : KPVP.orden, tipo: o.tipo, x: Math.round(o.x * 10) / 10, y: Math.round(o.y * 10) / 10, idx: Math.round(o.idx * 100) / 100, lat: Math.round(o.lat * 10) / 10, vel: o.vel || 0 }); }

// ---------- un kart rival, cada paso: se adelanta con su velocidad desde el último aviso y se acerca suave a donde dice ----------
function pvpPasoRemoto(k, dt, C) {
  const r = k.remoto;
  if (k.ido || k.fin) { if (k.fin && !k.ido) { k.v = acerca(k.v, 0, 60 * dt); k.x += Math.cos(k.dir) * k.v * dt; k.y += Math.sin(k.dir) * k.v * dt; sigueVia(k); } return; }
  r.t += dt;
  const adel = Math.min(r.t, 0.35), px = r.x + Math.cos(r.dir) * r.v * adel, py = r.y + Math.sin(r.dir) * r.v * adel;
  const f = Math.min(1, dt * 9), lejos = Math.hypot(px - k.x, py - k.y) > 40;
  if (lejos) { k.x = px; k.y = py; } else { k.x += (px - k.x) * f; k.y += (py - k.y) * f; }
  k.ang += difAng(k.ang, r.ang) * f; k.dir = r.dir; k.v = r.v; k.z += (r.z - k.z) * Math.min(1, dt * 12);
  k.angVis = k.ang + difAng(r.ang, r.angVis);
  k.estado = r.estado; k.tam = r.tam; k.derrape = r.derrape; k.nivel = r.nivel; k.tTurbo = r.turbo ? 0.1 : 0; k.tInmune = r.inmune ? 0.1 : 0; k.tDron = r.dron ? 0.1 : 0; k.tCola = r.cola ? 0.1 : 0;
  sigueVia(k);
  if (k.z <= 0) humos(k, supEn(PISTA, k.x, k.y), r.turbo);
  // sin noticias: se ha ido (o se ha quedado sin red)
  if (k.plaza == null && C.estado !== 'resultado' && RELOJ - r.ultimoRx > KPVP_AJ.sinRed) pvpSeVa(k, '%1 se ha quedado sin conexión.');      // la máquina no se va: si cae su anfitrión, la recoge otro
}
// un rival deja de contar (sin red, rendido o sin llegar a la salida); si no queda nadie, la carrera es tuya
function pvpSeVa(k, porque) {
  if (k.ido || k.fin) return;
  k.ido = true; k.v = 0; k.estado = 'normal'; k.derrape = 0; k.tTurbo = 0;
  comenta(trf(porque, k.nombre));
  const C = CARRERA;
  if (!C.jugador.fin && !KPVP.ias.length && pvpRivales().every(x => x.ido)) pvpAbandono('Se han ido todos los rivales.');      // con karts de la máquina la carrera sigue
}

// ---------- el final: el puesto es el orden de llegada; el servidor lo apunta y paga al momento ----------
function pvpLlegada(C) {
  if (KPVP.cerrado || !KPVP.activo) return;
  KPVP.cerrado = true;
  // el puesto que apunta el servidor es entre humanos (los karts de la máquina no cuentan): 1 + los humanos que llegaron antes que tú. Se espera un momento
  // por si el aviso de meta de alguien que llegó casi a la vez todavía viene de camino, para que todos cuenten lo mismo.
  const yo = C.jugador, sala = KPVP.sala;
  setTimeout(() => {
    if (KPVP.sala !== sala) return;
    const delante = pvpRivales().filter(k => k.fin && (k.fin < yo.fin || (k.fin === yo.fin && k.remoto.orden < KPVP.orden))).length;
    pvpCierra(1 + delante, yo.fin);
  }, 1500);
}
function pvpAbandono(porque) {
  const C = CARRERA, yo = C.jugador;
  if (KPVP.cerrado || yo.fin) return;
  KPVP.aviso = porque;
  aviso('RIVALES DESCONECTADOS', porque, '#ff5c8a');
  yo.fin = Math.max(0.01, C.reloj); yo.puestoFinal = ++C.llegados; llegaJugador();     // llegaJugador llama a pvpLlegada
}
// te vas tú (RENDIRSE en la pausa): los demás te dan por ido y pierdes puntos como en un último puesto (se apunta un abandono)
function pvpRendirse() {
  if (!KPVP.activo || KPVP.cerrado) { pvpTermina(); return; }
  KPVP.cerrado = true; KPVP.rendido = true;
  if (KPVP.red && KPVP.red.retirar) KPVP.red.retirar();      // irse en plena carrera resta puntos como un último puesto
  const sala = KPVP.sala;
  pvpManda({ t: 'rendir' });
  // el aviso se repite por si se pierde uno (la red no garantiza que llegue); luego se cierra el canal, si no ha empezado ya otra sala
  [200, 400].forEach(ms => setTimeout(() => { if (KPVP.sala === sala) pvpManda({ t: 'rendir' }); }, ms));
  setTimeout(() => { if (KPVP.sala === sala) { pvpTermina(); pvpCierraCanal(); } }, 650);
}
// cerrar la pestaña en plena carrera cuenta como rendirse: los demás no esperan a que pase el silencio
window.addEventListener('pagehide', () => { if (KPVP.activo && !KPVP.cerrado) { pvpManda({ t: 'rendir' }); pvpManda({ t: 'rendir' }); } });
function pvpCierra(puesto, tiempo) {
  const sala = KPVP.sala, red = KPVP.red;
  if (KPVP.carrera > 0) { KPVP.resultado = { puesto, copa: true }; return Promise.resolve(); }      // en la copa online solo la primera carrera va al servidor
  return red.cerrar(sala, puesto, tiempo).then(r => { KPVP.resultado = Object.assign({ puesto }, r || {}); ligaTrasCarrera(KPVP.resultado, KPVP.jugadores.length); if (typeof ENERGIA !== 'undefined') ENERGIA.premioVictoria(Object.assign({ sala }, KPVP.resultado)); }).catch(e => { KPVP.resultado = { puesto, error: KRED.errorTexto(e) }; });
}

