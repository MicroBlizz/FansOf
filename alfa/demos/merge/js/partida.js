// Fans of Merge · PARTIDA: el estado de una partida y cada turno. Poner la pieza (o usar el topo), juntar, mover los bichos,
// la reserva, las cartas de habilidad, el Rayo zanahoria (se carga con fusiones), los eventos (lluvia, siesta, regalo) y el final.
// Las reglas puras están en js/tablero.js; aquí solo se encadenan y se avisa a los efectos (js/efectos.js) y al sonido.
'use strict';
const MG_P = { estado: 'nada' };

// carta: la elegida (o null) · nivelId: el nivel de la Aventura (o null para el Modo libre)
function mgEmpieza(carta, nivelId) {
  const N = nivelId ? mgNivel(nivelId) : null;
  MG_CFG.lado = N ? N.lado : 6; mgMide();
  const huecos = carta === 'bolsillo' ? 2 : 1;
  Object.assign(MG_P, {
    estado: 'jugando', B: mgTableroNuevo(), cartas: carta ? [carta] : [], reserva: Array(huecos).fill(null),
    actual: null, cola: null, turno: 0, pts: 0, fusiones: 0, carga: 0, cargas: 0, tirachinas: carta === 'tirachinas' ? 1 : 0,
    modo: null, evento: null, regalo: false, mejor: 0, record: false, sel: null, objetivoHecho: 0, reservaEspera: 0, racha: 0,
    nivel: N, movs: N ? N.movs : 0, guion: N && N.guion ? N.guion : null, paso: 0, creadas: {}, dormidos: 0, pesos: (N && N.pesos) || MG_CFG.pesos,
  });
  // el tablero empieza con unas pocas piezas sueltas, sin grupos ya hechos
  if (N) for (const [x, y, t] of N.inicio || []) MG_P.B[y][x] = mgPieza(t);
  const iniciales = N ? [] : ['brote', 'brote', 'brote', 'brote', 'zanahoria', 'zanahoria', 'brote', 'piedra'];
  for (const t of iniciales) {
    for (let i = 0; i < 30; i++) {
      const [x, y] = pick(mgVacias(MG_P.B));
      if (mgGrupo(MG_P.B, x, y, t).length >= MG_CFG.minimo - 1 && t !== 'piedra') continue;
      MG_P.B[y][x] = mgPieza(t); break;
    }
  }
  MG_P.cola = mgSorteo(MG_P.cartas, MG_P.pesos);
  mgSiguiente();
  MG_P.camino = mgCaminoNuevo(); MG_P.semillaCamino = 1 + ((Math.random() * 1e6) | 0);   // la semilla del borde ondulado
  mgConejosNuevos();
  SAVE.partidas = (SAVE.partidas || 0) + 1; mgGuarda();
  mgMusica('animales');
}
// el camino de tierra del tablero: un par de senderos que se cruzan, distinto en cada partida (solo de adorno)
function mgCaminoNuevo() {
  const n = MG_CFG.lado, s = new Set(), fila = 1 + ((Math.random() * (n - 2)) | 0), col = 1 + ((Math.random() * (n - 2)) | 0);
  for (let i = 0; i < n; i++) { s.add(fila * 8 + i); s.add(i * 8 + col); }
  let x = (Math.random() * n) | 0, y = 0;   // y un sendero que baja serpenteando
  while (y < n) { s.add(y * 8 + x); if (Math.random() < 0.45) { x = clamp(x + (Math.random() < 0.5 ? -1 : 1), 0, n - 1); s.add(y * 8 + x); } y++; }
  return s;
}
const mgTiene = id => MG_P.cartas && MG_P.cartas.includes(id);
function mgSiguiente() {
  const G = mgPaso(); if (G) { MG_P.actual = G.p; return; }   // el tutorial manda
  if (MG_P.regalo) { MG_P.regalo = false; MG_P.actual = 'semilla'; return; }
  if (mgTiene('abono') && MG_P.turno > 0 && MG_P.turno % 12 === 0) { MG_P.actual = 'semilla'; return; }
  MG_P.actual = MG_P.cola; MG_P.cola = mgSorteo(MG_P.cartas, MG_P.pesos);
}
// multiplicador de puntos de una casilla
// la racha: turnos seguidos juntando algo; cada uno suma un 25 % (hasta x2)
const mgMultRacha = () => 1 + 0.25 * Math.min(MG_P.racha || 0, 4);
function mgMult(x, y) {
  let m = (mgTiene('cosecha') ? 1.25 : 1) * mgMultRacha();
  const E = MG_P.evento; if (E && E.casillas.has(y * 8 + x)) m *= 2;
  if (MG_P.camino && MG_P.camino.has(y * 8 + x)) m *= MG_CFG.camino;   // lo que se construye junto al camino lo ve más gente: vale más
  return m;
}
function mgSuma(pts, x, y) {
  if (!pts) return;
  MG_P.pts += pts; if (pts >= 10) mgFxTexto(x, y, '+' + fmt(pts)); mgCompruebaObjetivo();
  if (MG_P.pts > SAVE.record && !MG_P.record && SAVE.record > 0) { MG_P.record = true; mgFxAviso(tr('¡Nuevo récord!')); play('mgRecord'); }
}
// apunta los pasos de una fusión: puntos, carga del rayo, efectos y piezas nuevas en la colección
function mgTrasJuntar(r) {
  r.pasos.forEach((p, i) => {
    MG_P.fusiones++; MG_P.carga++; MG_P.creadas[p.nuevo] = (MG_P.creadas[p.nuevo] || 0) + 1;
    if (MG_P.carga >= MG_CFG.cargaHabilidad) { MG_P.carga = 0; if (MG_P.cargas < MG_CFG.cargasMax) { MG_P.cargas++; mgFxAviso(tr('¡Rayo zanahoria listo!')); play('mgCarga'); } }
    mgFxJunta(p, i);
    setTimeout(() => play('mgJunta', i), i * 180);
    mgDescubre(p.nuevo);
    mgSuma(p.pts, p.x, p.y);
    if (mgDescubreGrande(p.nuevo)) setTimeout(() => mgFxEstreno(p.nuevo), 380 + i * 180);
  });
  if (r.pasos.length >= 2) {   // cadena: varias fusiones de golpe, premio extra y mucho ruido
    const n = r.pasos.length, ult = r.pasos[n - 1], extra = Math.round(r.pts * 0.15 * (n - 1));
    setTimeout(() => { mgFxAviso(tr('¡CADENA x{n}!', { n })); MG_FX.temblor = Math.max(MG_FX.temblor, 0.2 + n * 0.05); mgSuma(extra, ult.x, ult.y); play('mgCadena', n); }, 200 + n * 180);
  }
  if (navigator.vibrate) try { navigator.vibrate(r.pasos.length >= 2 ? [20, 40, 30] : 15); } catch (e) { /* sin vibración */ }
}
// la primera vez que se crea una pieza importante, se celebra a lo grande (una vez por jugador, guardado en la colección)
function mgDescubreGrande(tipo) {
  if (tipo === 'brote' || tipo === 'dormido' || tipo === 'piedra') return false;
  const k = 'estreno-' + tipo; if (SAVE.coleccion[k]) return false;
  SAVE.coleccion[k] = 1; mgGuarda(); return true;
}
// los zorros que se acaban de dormir se juntan (en la casilla del último que se durmió)
function mgJuntaDormidos(dormidos) {
  for (let i = dormidos.length - 1; i >= 0; i--) {
    const [x, y] = dormidos[i], c = MG_P.B[y][x];
    if (!c || c.t !== 'dormido') continue;
    const r = mgResuelve(MG_P.B, x, y, mgMult); if (r.pasos.length) mgTrasJuntar(r);
  }
}

// ¿Se puede hacer algo con la pieza actual en (x, y)?
function mgPuedePoner(x, y) {
  const c = MG_P.B[y][x], T = mgTipoDe(MG_P.actual), G = mgPaso();
  if (G && (G.reserva || (G.c && (G.c[0] !== x || G.c[1] !== y)))) return false;   // el tutorial dice dónde
  if (T === 'topo') return !!c;
  return !c;
}
// Pone la pieza actual en (x, y). Devuelve false si ahí no vale.
function mgPon(x, y) {
  if (MG_P.estado !== 'jugando' || !mgPuedePoner(x, y)) return false;
  const tipo = MG_P.actual, T = mgTipoDe(tipo);
  if (T === 'topo') { mgQuita(x, y, 'topo'); mgFinTurno(); return true; }
  const real = T === 'semilla' ? mgSemillaEn(MG_P.B, x, y) : tipo;
  if (T === 'semilla') { mgFxBrillo(x, y); play('mgSemilla'); }
  MG_P.B[y][x] = mgPieza(real); mgFxNace(x, y);
  play(real === 'zorro' ? 'mgZorro' : real === 'cuervo' ? 'mgCuervo' : 'mgPon');
  mgDescubre(real);
  const r = mgResuelve(MG_P.B, x, y, mgMult);
  const antes = MG_P.racha;
  if (r.pasos.length) mgTrasJuntar(r); else mgSuma(Math.round(MG_PIEZAS[real].pts * mgMult(x, y)), x, y);
  if (r.pasos.length) { MG_P.racha++; if (MG_P.racha >= 2) mgFxRacha(); }
  else if (!mgTipoDe(real)) { MG_P.racha = 0; if (antes >= 2) mgFxAviso(tr('Racha perdida')); }
  mgFinTurno();
  return true;
}
// quita la pieza de (x, y): con el topo, el tirachinas o el rayo. Un bicho se duerme; una roca se vuelve cofre.
function mgQuita(x, y, con) {
  const c = MG_P.B[y][x]; if (!c) return false;
  mgFxQuita(x, y, con); play(con === 'topo' ? 'mgTopo' : 'mgRayo');
  if (c.t === 'zorro' || c.t === 'cuervo') { MG_P.dormidos++; MG_P.B[y][x] = mgPieza('dormido'); mgFxNace(x, y); mgJuntaDormidos([[x, y]]); }
  else if (c.t === 'roca') { MG_P.B[y][x] = mgPieza('cofre'); mgFxNace(x, y); }
  else { MG_P.B[y][x] = null; mgFxRompe(x, y, c.t); }
  return true;
}
// el Rayo zanahoria o el tirachinas, ya elegido el modo: se aplica a la casilla tocada (no cuenta como turno)
function mgUsaModo(x, y) {
  const modo = MG_P.modo; MG_P.modo = null;
  if (!MG_P.B[y][x]) { play('mgNoVale'); return; }
  if (modo === 'rayo' && MG_P.cargas > 0) { MG_P.cargas--; mgQuita(x, y, 'rayo'); }
  else if (modo === 'tirachinas' && MG_P.tirachinas > 0) { MG_P.tirachinas--; mgQuita(x, y, 'tirachinas'); }
  mgCompruebaFin();
}
function mgAbreCofre(x, y) {
  const c = MG_P.B[y][x]; if (!c || c.t !== 'cofre') return false;
  MG_P.B[y][x] = null; play('mgCofre'); mgFxCofre(x, y);
  const [a, b] = MG_CFG.cofre; mgSuma(Math.round((a + Math.random() * (b - a)) * (c.s ? 2 : 1) * mgMult(x, y)), x, y);
  mgCompruebaFin();
  return true;
}
// La reserva: guarda la pieza actual; si el hueco tenía otra, se cambian
function mgReserva(i) {
  if (MG_P.estado !== 'jugando' || i >= MG_P.reserva.length) return;
  const G = mgPaso();
  if (G && !G.reserva) { play('mgNoVale'); return; }
  if (G) MG_P.paso++;   // el paso del tutorial que pedía usar la reserva
  else if (MG_P.reservaEspera > 0) { play('mgNoVale'); mgFxAviso(tr('La reserva estará lista en {n} turnos', { n: MG_P.reservaEspera })); return; }
  MG_P.reservaEspera = mgTiene('mercader') || G ? 0 : MG_CFG.reservaEspera;
  const guardada = MG_P.reserva[i];
  MG_P.reserva[i] = MG_P.actual;
  if (guardada) MG_P.actual = guardada; else if (G && G.despues) MG_P.actual = G.despues; else mgSiguiente();
  MG_P.sel = null; play('mgReserva');
}

function mgFinTurno() {
  MG_P.turno++; MG_P.sel = null;
  if (mgPaso()) MG_P.paso++;
  if (MG_P.nivel) MG_P.movs--;
  if (MG_P.reservaEspera > 0) MG_P.reservaEspera--;
  const E = MG_P.evento;
  if (E && E.id === 'tormenta') mgRelampago();
  const quietos = (E && E.id === 'siesta') || (mgTiene('encantador') && MG_P.turno % 2 === 1);
  const m = mgMueveBichos(MG_P.B, quietos, MG_P.camino);
  if (m.movidos.length) mgFxMueve(m.movidos);
  MG_P.dormidos += m.dormidos.length;
  if (m.dormidos.length) { setTimeout(() => play('mgDuerme'), 260); m.dormidos.forEach(([x, y]) => mgFxNace(x, y, 0.28)); mgJuntaDormidos(m.dormidos); }
  // los eventos
  if (E) { E.quedan--; if (E.quedan <= 0) MG_P.evento = null; }
  if (!MG_P.evento && MG_P.turno % MG_CFG.eventoCada === 0 && (!MG_P.nivel || MG_P.nivel.eventos)) mgEvento();
  mgSiguiente();
  mgCompruebaFin();
}
// la tormenta: un relámpago cae sobre una pieza pequeña o un bicho al azar (los bichos se duermen; lo demás se quita)
function mgRelampago() {
  const blancos = []; MG_P.B.forEach((f, y) => f.forEach((c, x) => { if (c && ['brote', 'zanahoria', 'piedra', 'zorro', 'cuervo'].includes(c.t)) blancos.push([x, y]); }));
  if (!blancos.length) return;
  const [x, y] = pick(blancos); MG_FX.relampago = { x, y, t0: mgAhora() }; mgQuita(x, y, 'rayo');
}
function mgEvento() {
  const E = { ...pick(MG_EVENTOS), quedan: MG_CFG.eventoDura, casillas: new Set() };
  if (E.id === 'lluvia' || E.id === 'tormenta') { const todas = []; for (let y = 0; y < MG_CFG.lado; y++) for (let x = 0; x < MG_CFG.lado; x++) todas.push(y * 8 + x); shuffle(todas).slice(0, MG_CFG.lluviaCasillas).forEach(k => E.casillas.add(k)); }
  if (E.id === 'regalo') { MG_P.regalo = true; E.quedan = 1; }
  MG_P.evento = E;
  mgFxEvento(E); play('mgEvento');
}
// La partida acaba cuando no queda ninguna casilla libre y no hay nada con lo que hacer sitio
function mgCompruebaFin() {
  if (MG_P.estado !== 'jugando' || mgNivelComprueba()) return;
  if (mgVacias(MG_P.B).length) return;
  const hayCofre = MG_P.B.some(f => f.some(c => c && c.t === 'cofre'));
  if (hayCofre || mgTipoDe(MG_P.actual) === 'topo' || MG_P.cargas > 0 || MG_P.tirachinas > 0 || MG_P.reserva.some(t => mgTipoDe(t) === 'topo')) { mgFxAviso(tr('¡Tablero lleno! Haz sitio como puedas.')); return; }
  mgTermina();
}
function mgTermina() {
  if (MG_P.nivel) { mgNivelFin(false); return; }
  MG_P.estado = 'fin';
  let mejor = 'brote'; for (const f of MG_P.B) for (const c of f) if (c && MG_CADENA.indexOf(c.t) > MG_CADENA.indexOf(mejor)) mejor = c.t;
  MG_P.mejor = mejor;
  const record = MG_P.pts > SAVE.record; if (record) SAVE.record = MG_P.pts;
  mgGuarda();
  play('mgFin'); mgSintonia(record ? 'win' : 'lose');
  setTimeout(() => mgPantallaFin(record), 900);
}
