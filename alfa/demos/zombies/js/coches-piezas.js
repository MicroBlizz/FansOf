// Fans of Zombies · LAS PIEZAS DE LOS COCHES (dominio, ADR 083): cada coche tiene motor, 4 ruedas, batería, frenos y cristales (de 0 a
// 100, o null si se ha quitado) en c.piezas. El motor manda en lo que corre y en si arranca; una rueda pinchada (a 0 o sin ella) hace
// que gire mal y corra menos; la batería se gasta al arrancar y con los faros y se carga conduciendo; los frenos, lo que frena; con los
// cristales rotos te muerden aunque vayas deprisa. Los choques y atropellos las gastan. Con una llave inglesa se quitan y se ponen
// (son objetos de la mochila, con su estado en «dur»), el motor se desmonta en piezas de motor y con ellas se repara. La habilidad
// de mecánica cuida las piezas al quitarlas y arregla más. Cifras en AJ.coches.piezas.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const P = (AJ) => AJ.coches.piezas;
  // el objeto de cada pieza (el motor no se lleva: se desmonta en piezas de motor)
  const OBJETO = { bateria: 'bateria', frenos: 'frenos', cristales: 'parabrisas', rueda: 'rueda' };
  Z.PIEZAS_COCHE = ['motor', 'rueda', 'bateria', 'frenos', 'cristales'];
  // piezas de un coche abandonado: gastadas al azar
  Z.nuevasPiezas = function (AJ, azar) {
    const K = P(AJ), v = () => Math.round(100 - azar() * K.desgasteInicial);
    return { motor: v(), ruedas: [v(), v(), v(), v()], bateria: Math.round(azar() * 100), frenos: v(), cristales: v() };
  };
  // las piezas de un coche (los de partidas de antes, que solo tenían «daño», se pasan aquí la primera vez)
  Z.piezas = function (AJ, c) {
    if (!c.piezas) { const v = Math.max(0, 100 - (c.dano || 0)); c.piezas = { motor: v, ruedas: [v, v, v, v], bateria: 60, frenos: v, cristales: v }; }
    return c.piezas;
  };
  const val = (x) => x || 0;
  const pinchada = (p) => p.ruedas.some((r) => val(r) <= 0);
  // lo que el estado de las piezas cambia al conducir
  Z.conduccion = function (AJ, c) {
    const p = Z.piezas(AJ, c), K = P(AJ), rueda = pinchada(p) ? K.pinchada : 1;
    return { maxima: (K.motorMin + (1 - K.motorMin) * val(p.motor) / 100) * rueda, giro: rueda, frena: K.frenosMin + (1 - K.frenosMin) * val(p.frenos) / 100 };
  };
  Z.cocheVivo = (AJ, c) => val(Z.piezas(AJ, c).motor) > 0;
  // arrancar al subir: sin batería o con el motor roto no arranca; con el motor muy gastado, a veces no
  Z.arranca = function (AJ, c, azar) {
    const p = Z.piezas(AJ, c), K = P(AJ);
    if (val(p.motor) <= 0) return Z.error('cocheRoto');
    if (val(p.bateria) < K.arranque) return Z.error('sinBateria');
    if (p.ruedas.some((r) => r == null)) return Z.error('sinRueda');
    p.bateria -= K.arranque;
    if (val(p.motor) < K.motorFalla && azar && azar() < K.fallaArranque) return Z.error('noArranca');
    return Z.ok(true);
  };
  // ¿llega el mordisco de un fan al volante? Con los cristales bien, solo si vas despacio
  Z.alcanzaVentanilla = function (AJ, e) {
    const c = e.jugador.conduce && Z.cocheDe(e, e.jugador.conduce);
    if (!c) return true;
    return val(Z.piezas(AJ, c).cristales) < P(AJ).cristalRoto || Math.abs(c.v) < P(AJ).despacio;
  };
  // lo que gasta un choque (motor, una rueda y los cristales) o un atropello (cristales y motor)
  Z.gastaPiezas = function (AJ, c, cuanto, azar) {
    const p = Z.piezas(AJ, c), baja = (x, f) => (x == null ? null : Math.max(0, x - cuanto * f));
    p.motor = baja(p.motor, 1); p.cristales = baja(p.cristales, 0.6);
    if (azar) { const i = Math.floor(azar() * 4); p.ruedas[i] = baja(p.ruedas[i], 0.8); }
  };
  // la batería: los faros la gastan y conducir la carga (por horas de juego)
  Z.pasoBateria = function (AJ, c, horas) {
    const p = Z.piezas(AJ, c), K = P(AJ);
    if (p.bateria == null) { c.faros = false; return; }
    p.bateria = Math.max(0, Math.min(100, p.bateria + (Math.abs(c.v) > 1 ? K.carga : 0) * horas - (c.faros ? K.farosGasta : 0) * horas));
    if (p.bateria <= 0) c.faros = false;
  };
  Z.cambiaFaros = function (AJ, e) {
    const c = e.jugador.conduce && Z.cocheDe(e, e.jugador.conduce);
    if (!c) return Z.error('nadaCerca');
    if (!c.faros && val(Z.piezas(AJ, c).bateria) <= 0) return Z.error('sinBateria');
    c.faros = !c.faros;
    e.eventos.push({ tipo: 'faros', on: c.faros });
    return Z.ok(c.faros);
  };

  /* ---------- quitar, poner y reparar (con llave inglesa, a pie y al lado del coche) ---------- */
  function junto(AJ, e, id) {
    const c = Z.cocheDe(e, id), J = e.jugador;
    if (!c || J.conduce || Z.dist(c.x, c.z, J.x, J.z) > AJ.coches.alcance + 1.5) return Z.error('nadaCerca');
    if (!Z.lleva(J, 'llaveInglesa')) return Z.error('sinLlaveInglesa');
    return Z.ok(c);
  }
  const ruedaMala = (pieza, i) => pieza === 'rueda' && !(Number.isInteger(i) && i >= 0 && i < 4);
  const hueco = (p, pieza, i) => (pieza === 'rueda' ? p.ruedas[i] : p[pieza]);
  const ponHueco = (p, pieza, i, v) => { if (pieza === 'rueda') p.ruedas[i] = v; else p[pieza] = v; };
  // quitar una pieza (i = qué rueda): va a tus bolsas (o al suelo) con su estado, algo gastado al quitarla
  Z.quitaPieza = function (AJ, e, id, pieza, i, azar) {
    const r = junto(AJ, e, id);
    if (!r.ok) return r;
    const p = Z.piezas(AJ, r.valor), v = hueco(p, pieza, i);
    if (!OBJETO[pieza] || ruedaMala(pieza, i) || v == null) return Z.error('noEsta', { pieza });
    const dur = Math.max(0, Math.round(v - azar() * P(AJ).gastaQuitar * Z.menos(AJ, e.jugador, 'mecanica', 'cuida')));
    ponHueco(p, pieza, i, null);
    if (Z.meterLleva(AJ, e.jugador, OBJETO[pieza], 1, dur)) Z.dejaEnSitio(e, { id: OBJETO[pieza], n: 1, dur }, AJ);
    Z.ganaXp(AJ, e, 'mecanica', 'pieza');
    e.eventos.push({ tipo: 'pieza', accion: 'quita', pieza });
    return Z.ok(dur);
  };
  // poner en un hueco vacío la mejor pieza de ese tipo que lleves
  Z.ponPieza = function (AJ, e, id, pieza, i) {
    const r = junto(AJ, e, id);
    if (!r.ok) return r;
    const p = Z.piezas(AJ, r.valor), J = e.jugador;
    if (!OBJETO[pieza] || ruedaMala(pieza, i)) return Z.error('noSePone', { pieza });   // el motor no se pone: se repara
    if (hueco(p, pieza, i) != null) return Z.error('yaPuesta', { pieza });
    const mejor = Z.bolsas(J).flatMap((m) => m.piezas.filter((q) => q.id === OBJETO[pieza]).map((q) => ({ m, q }))).sort((a, b) => b.q.dur - a.q.dur)[0];
    if (!mejor) return Z.error('faltan', { faltan: [[OBJETO[pieza], 1]] });
    Z.sacar(mejor.m, mejor.q.uid);
    ponHueco(p, pieza, i, mejor.q.dur);
    Z.ganaXp(AJ, e, 'mecanica', 'pieza');
    e.eventos.push({ tipo: 'pieza', accion: 'pon', pieza });
    return Z.ok(mejor.q.dur);
  };
  // desmontar el motor: da una pieza de motor por cada tramo de estado que le quedaba, y queda a 0
  Z.desmontaMotor = function (AJ, e, id) {
    const r = junto(AJ, e, id);
    if (!r.ok) return r;
    const p = Z.piezas(AJ, r.valor), n = Math.floor(val(p.motor) / P(AJ).porPieza);
    if (!n) return Z.error('motorRoto');
    p.motor = 0;
    const queda = Z.meterLleva(AJ, e.jugador, 'piezasMotor', n);
    if (queda) Z.dejaEnSitio(e, { id: 'piezasMotor', n: queda }, AJ);
    Z.ganaXp(AJ, e, 'mecanica', 'repara');
    e.eventos.push({ tipo: 'pieza', accion: 'desmonta', pieza: 'motor' });
    return Z.ok(n);
  };
  // reparar el motor con una pieza de motor (más con mecánica)
  Z.reparaMotor = function (AJ, e, id) {
    const r = junto(AJ, e, id);
    if (!r.ok) return r;
    const p = Z.piezas(AJ, r.valor);
    if (val(p.motor) >= 100) return Z.error('noHaceFalta');
    if (!Z.gastaLleva(e.jugador, 'piezasMotor', 1).ok) return Z.error('faltan', { faltan: [['piezasMotor', 1]] });
    p.motor = Math.min(100, val(p.motor) + P(AJ).repara * Z.mas(AJ, e.jugador, 'mecanica', 'arregla'));
    Z.ganaXp(AJ, e, 'mecanica', 'repara');
    e.eventos.push({ tipo: 'pieza', accion: 'repara', pieza: 'motor' });
    return Z.ok(p.motor);
  };

  /* ---------- el maletero ---------- */
  // las casillas que ocupa una lista de cosas (un montón ocupa la forma de su objeto)
  Z.casillasDe = (AJ, lista) => lista.reduce((s, c) => s + Z.formaDe(AJ, c.id).c.length * Math.ceil((c.n || 1) / ((AJ.objetos[c.id] && AJ.objetos[c.id].max) || 1)), 0);
  Z.esMaletero = (id) => typeof id === 'string' && id.startsWith('trunk:');
  Z.cabeEnMaletero = (AJ, lista, cosa) => Z.casillasDe(AJ, lista.concat([cosa])) <= AJ.coches.maletero;
})(ZOM);
