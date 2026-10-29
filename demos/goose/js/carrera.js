// Fans of Goose · LA CARRERA DE LA OCA (de 2 a 4, en línea): todos salen a la vez por el mismo tablero, cada uno con sus ocas, y
// gana quien llegue antes a la casilla 63. Los rivales se ven como fantasmas de su color y en el mapa de la derecha; tus combos
// grandes les mandan bandadas. Usa las salas de core (core/js/sistema/salas.js: código de 4 letras, enlace y canal en directo).
// Por el canal va muy poco (cuidado con el cupo de mensajes del servidor): dónde vas una vez por segundo y los sucesos sueltos.
'use strict';

const COLORES = ['#e8742a', '#3fbf4a', '#3f8ee8', '#ff4d6b'];
const AMIGOS = { red: null, sala: null, error: '', cargando: false, empezada: false };

function redAmigos() { if (!AMIGOS.red) AMIGOS.red = SALAS.red('goose'); return AMIGOS.red; }
function misDatosSala() { return { v: 1, p: SAVE.personaje }; }

function abreAmigos() {
  JUEGO.modo = 'amigos'; AMIGOS.error = '';
  if (!SALAS.puede()) AMIGOS.error = tr('Para jugar con amigos entra con tu cuenta.');
}
function siguiendoSala(s, err) {
  AMIGOS.sala = s;
  if (err) { AMIGOS.error = tr(SALAS.errorTexto(err)); AMIGOS.red = null; if (JUEGO.modo === 'sala') JUEGO.modo = 'amigos'; return; }
  if (s && s.estado === 'jugando' && !AMIGOS.empezada && s.datos && s.datos.t0) empiezaCarrera(s);
}
async function creaSala() {
  if (AMIGOS.cargando) return; AMIGOS.cargando = true; AMIGOS.error = '';
  try { const r = redAmigos(); await r.crear(4, misDatosSala()); r.seguir(siguiendoSala); JUEGO.modo = 'sala'; }
  catch (e) { AMIGOS.error = tr(SALAS.errorTexto(e)); AMIGOS.red = null; }
  AMIGOS.cargando = false;
}
async function uneteSala(codigo) {
  codigo = String(codigo || '').trim().toUpperCase();
  if (!/^[A-Z]{4}$/.test(codigo)) { AMIGOS.error = tr('El código son 4 letras.'); return; }
  if (AMIGOS.cargando) return; AMIGOS.cargando = true; AMIGOS.error = '';
  try { const r = redAmigos(); await r.unirse(codigo, misDatosSala()); r.seguir(siguiendoSala); JUEGO.modo = 'sala'; SALAS.quitaCodigoUrl(); }
  catch (e) { AMIGOS.error = tr(SALAS.errorTexto(e)); AMIGOS.red = null; }
  AMIGOS.cargando = false;
}
function pideCodigo() {
  const c = window.prompt(tr('Escribe el código de la sala (4 letras)'));
  if (c) uneteSala(c);
}
function saleSala() {
  const C = JUEGO.carrera;
  if (C && C.canal) try { C.canal.cerrar(); } catch (e) { /* ya cerrado */ }
  if (AMIGOS.red) try { AMIGOS.red.salir(); } catch (e) { /* da igual */ }
  AMIGOS.red = null; AMIGOS.sala = null; AMIGOS.empezada = false; JUEGO.carrera = null;
}
async function empiezaSala(modo) {
  const s = AMIGOS.sala; if (!s || !s.anfitrion || AMIGOS.cargando) return;
  if (s.jugadores.length < 2) { AMIGOS.error = tr('Hacen falta al menos dos personas para empezar.'); return; }
  AMIGOS.cargando = true;
  try { await AMIGOS.red.poner({ modo, t0: Date.now() + 3500 }, true); }
  catch (e) { AMIGOS.error = tr(SALAS.errorTexto(e)); }
  AMIGOS.cargando = false;
}
function compartirSala() {
  const s = AMIGOS.sala; if (!s) return;
  const url = SALAS.enlace(s.codigo), txt = tr('¡Échame una carrera en Fans of Goose! Sala {c}', { c: s.codigo });
  if (navigator.share) navigator.share({ title: 'Fans of Goose', text: txt, url }).catch(() => { /* cancelado */ });
  else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast(tr('Enlace copiado'), true), () => toast(url));
  else toast(url);
}

// --- la carrera ---
function empiezaCarrera(s) {
  AMIGOS.empezada = true;
  const lista = s.jugadores.slice().sort((a, b) => a.orden - b.orden);
  const yo = lista.find(j => j.yo) || lista[0];
  nuevaPartida();
  const J = JUEGO;
  J.avisos = [];
  J.carrera = { modo: s.datos.modo === 'coop' ? 'coop' : 'carrera', anfitrion: !!s.anfitrion, danoJefe: 0, yo: yo.orden, color: COLORES[lista.indexOf(yo) % 4], rivales: new Map(), cuenta: Math.max(0.5, (s.datos.t0 - Date.now()) / 1000), tEnvio: 0, llegada: null, fin: false, tFin: 0, puesto: 0 };
  for (const j of lista) if (!j.yo) J.carrera.rivales.set(j.orden, { nombre: j.nombre || tr('Rival'), color: COLORES[lista.indexOf(j) % 4], x: CFG.W / 2, y: -40, tx: CFG.W / 2, ty: -40, c: 1, n: 1, v: 1, capa: (PERSONAJES.find(p => p.id === (j.datos && j.datos.p)) || PERSONAJES[0]).capa, muerto: false, llega: null, tumba: null, abismo: false, revT: 0, visto: performance.now() });
  J.carrera.canal = AMIGOS.red.canal(mensajeCarrera, () => { /* los cortes se reintentan solos */ });
  SONIDO.dadoRueda();
}
const enCarrera = () => !!(JUEGO.carrera && !JUEGO.carrera.fin);
function mandaCarrera(d) { const C = JUEGO.carrera; if (C && C.canal) try { C.canal.enviar(Object.assign({ i: C.yo }, d)); } catch (e) { /* sin red */ } }

function mensajeCarrera(m) {
  const J = JUEGO, C = J.carrera; if (!C || !m || m.i === C.yo) return;
  const r = C.rivales.get(m.i); if (!r) return;
  r.visto = performance.now();
  if (m.t === 'p') { r.tx = m.x; r.ty = m.y; r.c = m.c; r.n = m.n; r.v = m.v; }
  else if (esCoop()) mensajeCoop(m, r);
  else if (m.t === 'e') anillo(r.x, r.y, 60, '#ffd34d', 0.5, 4);
  else if (m.t === 'a') {   // un ataque: te manda una bandada
    if (J.modo === 'juego' && !J.muerto && C.llegada === null) { lanzaBandada(true); aviso(tr('¡{n} te manda una bandada!', { n: r.nombre }), r.color, 1.6); }
  } else if (m.t === 'm') { r.muerto = true; r.c = m.c; texto(J.yo.x, J.yo.y - 24, tr('{n} ha caído', { n: r.nombre }), r.color, 7, 1.4); }
  else if (m.t === 'f') { r.llega = m.s; r.c = CFG.jardin; aviso(tr('¡{n} ha llegado a la 63!', { n: r.nombre }), r.color, 1.8); SONIDO.casilla(); }
}

// lo que la partida hace en cada fotograma cuando hay carrera
function avanzaCarrera(dt) {
  const J = JUEGO, C = J.carrera; if (!C) return;
  for (const r of C.rivales.values()) { r.x += (r.tx - r.x) * Math.min(1, dt * 3); r.y += (r.ty - r.y) * Math.min(1, dt * 3); }
  C.tEnvio -= dt;
  if (C.tEnvio <= 0 && C.llegada === null && !J.muerto) { C.tEnvio = 1; mandaCarrera({ t: 'p', x: Math.round(J.yo.x), y: Math.round(J.yo.y), c: J.casilla, n: J.nivel, v: Math.round(J.vida / J.st.vidaMax * 100) / 100 }); }
  if (C.modo === 'coop') { avanzaCoop(dt); return; }
  // has llegado: en la carrera no hay jefe, gana quien pisa el jardín
  if (C.llegada === null && J.casilla >= CFG.jardin) {
    C.llegada = J.t; mandaCarrera({ t: 'f', s: Math.round(J.t * 10) / 10 });
    const antes = [...C.rivales.values()].filter(r => r.llega !== null).length;
    C.puesto = antes + 1;
    aviso(C.puesto === 1 ? tr('¡PRIMERO EN LLEGAR!') : tr('¡HAS LLEGADO {n}º!', { n: C.puesto }), '#ffd34d', 2.5);
    destella('#ffd34d', 0.7); tiembla(5); SONIDO.victoria(); vibra([80, 40, 160]);
    for (let i = ENE.n - 1; i >= 0; i--) ENE.lista[i].hp = 0; BALAS.vacia();
  }
  // se acaba cuando todos han llegado o caído (o 30 s después de que llegue el primero)
  const rivales = [...C.rivales.values()], yoFuera = C.llegada !== null || J.muerto > 0 || J.vida <= 0;
  const todos = yoFuera && rivales.every(r => r.muerto || r.llega !== null || performance.now() - r.visto > 15000);
  const primero = [C.llegada, ...rivales.map(r => r.llega)].filter(x => x !== null);
  if (primero.length) C.tFin += dt;
  if (yoFuera && (todos || C.tFin > 30)) terminaCarrera();
}
function terminaCarrera() {
  const J = JUEGO, C = J.carrera; if (!C || C.fin) return;
  C.fin = true;
  // la clasificación: primero los que llegaron (por tiempo), después por casilla
  const filas = [{ nombre: tr('Tú'), color: C.color, llega: C.llegada, c: C.llegada !== null ? CFG.jardin : J.mejorCasilla, yo: true }];
  for (const r of C.rivales.values()) filas.push({ nombre: r.nombre, color: r.color, llega: r.llega, c: r.c, yo: false });
  filas.sort((a, b) => (a.llega === null) - (b.llega === null) || (a.llega !== null ? a.llega - b.llega : b.c - a.c));
  C.clasificacion = filas;
  C.puesto = filas.findIndex(f => f.yo) + 1;
  J.monedasPartida += [60, 35, 20, 10][C.puesto - 1] || 0;
  terminaPartida(C.puesto === 1 && C.llegada !== null);
  try { C.canal.cerrar(); } catch (e) { /* ya cerrado */ }
  if (AMIGOS.red) try { AMIGOS.red.salir(); } catch (e) { /* da igual */ }
  AMIGOS.red = null; AMIGOS.sala = null; AMIGOS.empezada = false;
}

// los rivales en tu mundo: fantasmas de su color con su nombre
function pintaRivales() {
  const C = JUEGO.carrera; if (!C) return;
  pintaTumbas();
  for (const r of C.rivales.values()) {
    if (r.muerto || r.llega !== null) continue;
    G.globalAlpha = 0.35; G.fillStyle = r.color; G.beginPath(); G.ellipse(r.x, r.y + 8, 9, 3.5, 0, 0, 6.283); G.fill();
    G.globalAlpha = 0.6; pintaHeroeQuieto(r.x, r.y, r.capa || '', 1); G.globalAlpha = 1;
    G.globalAlpha = 1; etiqueta(r.nombre, r.x, r.y - 15, r.color);
  }
}
// en el mapa de la derecha, un punto de cada color
function pintaRivalesMapa(yDe) {
  const C = JUEGO.carrera; if (!C) return;
  for (const r of C.rivales.values()) { G.fillStyle = r.muerto ? '#555' : r.color; G.fillRect(PAN.W - 9, yDe(Math.min(CFG.jardin, r.c)) - 1.5, 4, 3); }
}
function puestoActual() {
  const J = JUEGO, C = J.carrera; let p = 1;
  for (const r of C.rivales.values()) if (r.llega !== null || (!r.muerto && r.c > J.casilla)) p++;
  return p;
}
