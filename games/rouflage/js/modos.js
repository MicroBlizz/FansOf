// Fans of Rouflage · LOS MODOS DE JUEGO: un modo principal (Normal o Contagio) y unos extras que se encienden aparte (Apagón total), para las salas
// con amigos del PvP (el anfitrión los elige en la sala y el servidor se los cuenta a todos) y, para probar, en solitario con ?modo=contagio&extras=apagon.
// CONTAGIO: un colado despedido no se hace fantasma: le dan la camisa de becario, una linterna y dos cartas, y sale de Recursos Humanos a cazar a
// sus antiguos compañeros. APAGÓN TOTAL: la oficina mucho más oscura, la linterna más corta y estrecha, sin ranking en vivo, sin flechas ni ondas que
// delaten a nadie: solo el oído. Los fantasmas no pueden apagar linternas (ya está todo apagado) y su silbido falso se oye el doble.
'use strict';

const MODOS = {
  normal: { nombre: 'NORMAL', texto: 'Los colados se esconden, los becarios los buscan. Lo de siempre.' },
  contagio: { nombre: 'CONTAGIO', texto: 'Al despedirte te dan la camisa de becario: sales de Recursos Humanos a cazar a los tuyos.' },
  ida: { nombre: 'IDA Y VUELTA', texto: 'Todos se pintan y se esconden; luego todos salen de becario a cazar. Si encuentran tu cuerpo, fuera. Gana quien más puntos sume.' },
  retrato: { nombre: 'RETRATO ROBOT', texto: 'Los becarios ven la ficha de cada colado antes de salir. No hay bandos: gana quien más puntos sume.' },
};
const EXTRAS = {
  dia: { nombre: 'Jugar de día', texto: 'Con las luces encendidas: se ve toda la oficina, no solo lo que alumbra la linterna.', luz: true },
  apagon: { nombre: 'Apagón total', texto: 'Casi a oscuras, linterna corta, sin ranking ni pistas en pantalla: solo el oído.', luz: true },
  galeria: { nombre: 'Galería de disfraces', texto: 'Al acabar, cada colado sale en su pedestal y todos votan el mejor y el peor camuflaje.' },
  halcon: { nombre: 'Ojo de halcón', texto: 'Quedarse quieto dentro de la luz de un becario da muchos puntos; más cuanto más cerca. Gana quien se esconde a la vista.' },
  bufon: { nombre: 'El bufón', texto: 'Un colado es el bufón en secreto: solo gana si lo despiden en el último minuto. Antes, pierde.' },
  silbato: { nombre: 'Silbato caliente', texto: 'Un colado lleva un silbato que suena solo: pásaselo a otro tocándole antes de que explote.' },
  chivato: { nombre: 'Fantasmas chivatos', texto: 'Un fantasma puede chivarle una pista a un becario: si este despide a alguien en 20 s, el fantasma resucita.' },
  bote: { nombre: 'Llena el bote', texto: 'Hay gotas de pintura por el suelo: los colados ganan si llevan cinco al cubo de la cafetería.' },
  aguante: { nombre: 'Aguante infinito', texto: 'Los colados corren sin cansarse: sin barra de aguante: más pilla-pilla que escondite.' },
};
// LA LUZ de la partida: uno de tres, siempre uno marcado (se guarda como los extras: dia, apagon o ninguno)
const LUCES_SALA = [
  { k: 'dia', nombre: 'DÍA', texto: 'Luces encendidas: se ve toda la oficina, no solo lo que alumbra la linterna.' },
  { k: '', nombre: 'NORMAL', texto: 'De noche, como siempre: se ve lo que alumbran las linternas.' },
  { k: 'apagon', nombre: 'APAGÓN', texto: 'Casi a oscuras, linterna corta, sin ranking ni pistas en pantalla: solo el oído.' },
];
const luzDe = d => (d && d.x && d.x.dia) ? 'dia' : (d && d.x && d.x.apagon) ? 'apagon' : '';
// LAS REGLAS DE LA SALA: lo que el anfitrión ajusta además del modo y los extras. Van en el JSON de la sala
// (a = { s, c, b }: no hace falta tocar el servidor) y las versiones anteriores del juego las ignoran. La primera opción con `def` es la de siempre
const AJUSTES_SALA = {
  s: { nombre: 'SILBIDO', texto: 'Cada cuánto silban los colados a la fuerza. Silbar por gusto vuelve a empezar la cuenta.',
    opciones: [{ v: 28, nombre: 'CADA 28 s', def: true }, { v: 45, nombre: 'CADA 45 s' }, { v: 0, nombre: 'SIN SILBIDO', solo: true }] },
  c: { nombre: 'CAZA', texto: 'Lo que dura la caza.',
    opciones: [{ v: 120, nombre: '2:00' }, { v: 150, nombre: '2:30', def: true }, { v: 180, nombre: '3:00' }, { v: 240, nombre: '4:00' }] },
  b: { nombre: 'CARTAS', texto: 'Cartas de despido de cada becario como máximo: fallar gasta una y acertar la devuelve.',
    opciones: [{ v: 3, nombre: '3' }, { v: 5, nombre: '5', def: true }, { v: 8, nombre: '8' }] },
  // solo con amigos (amigos: true; BUSCAR PARTIDA va siempre con lo de siempre): cuántos becarios y colados hay (los que no son amigos, bots;
  // el servidor los cuenta igual, _rf_arranca en servidor/57-rouflage-sala-cuantos.sql) y cuándo gana el becario
  h: { nombre: 'BECARIOS', texto: 'Cuántos buscan. Si sois menos amigos, el resto son bots.', amigos: true,
    opciones: [{ v: 1, nombre: '1' }, { v: 2, nombre: '2', def: true }, { v: 3, nombre: '3' }] },
  k: { nombre: 'COLADOS', texto: 'Cuántos se esconden, con bots si faltan amigos. Como mucho sois 10: con 3 becarios, 7 colados.', amigos: true,
    opciones: [{ v: 3, nombre: '3' }, { v: 5, nombre: '5' }, { v: 8, nombre: '8', def: true }] },
  g: { nombre: 'GANAN LOS BECARIOS', texto: 'Al despedir a más de la mitad de los colados, o solo si los despiden a todos.', amigos: true,
    opciones: [{ v: 1, nombre: 'MÁS DE LA MITAD', def: true }, { v: 0, nombre: 'DESPEDIR A TODOS', solo: true }] },
  // los TALENTOS (talentos-partida.js): con ellos cada uno lleva su habilidad; sin ellos, nadie (la granada, como siempre). En BUSCAR PARTIDA lo elige
  // cada jugador y son colas separadas (servidor/64-rouflage-pvp-talentos.sql); el servidor lo pone en el modo de la sala como a.t
  t: { nombre: 'TALENTOS', texto: 'Con talentos, cada uno lleva la habilidad que eligió (y los bots, una al azar). En el clásico, nadie lleva habilidades.', amigos: true,
    opciones: [{ v: 0, nombre: 'CLÁSICO', def: true, solo: true }, { v: 1, nombre: 'CON TALENTOS', solo: true }] },
};
const ajusteSala = (a, k) => { const A = AJUSTES_SALA[k], v = a && a[k]; return A.opciones.some(o => o.v === v) ? v : A.opciones.find(o => o.def).v; };
// cuántos becarios y cuántos en total tiene una sala con amigos (lo mismo que el servidor): los amigos caben siempre, aunque pasen de la cuenta
const salaCuantos = (d, n) => { const h = ajusteSala(d && d.a, 'h'); return { ncaz: h, total: Math.max(n, Math.min(10, h + ajusteSala(d && d.a, 'k'))) }; };
// ¿han ganado los becarios? Si no queda ningún colado o, en el PvP, si han despedido a más de la mitad de los que había al empezar la caza
const cazaHecha = () => { const q = escondidos().length; return !q || (J.pvp && ajusteSala(MODO.a, 'g') === 1 && q < (J.coladosIni || 0) / 2); };
const MODO = { m: 'normal', x: {}, a: {} };          // la partida en curso
const REGLAS_BASE = { luzLargo: REGLAS.luzLargo, luzAngulo: REGLAS.luzAngulo, silbido: REGLAS.silbido, primerSilbido: REGLAS.primerSilbido, balasIni: REGLAS.balasIni };

// deja la partida en un modo (null: el normal). Viene del servidor ({ m, x: { apagon: 1 } }) o de la URL en solitario
// un modo al azar, como el que pone el servidor a las salas públicas (_rf_modo_azar en servidor/42-rouflage-publica.sql): lo usa la red de pruebas
function modoAzar() {
  const ms = ['normal', 'contagio', 'ida', 'retrato'], ex = ['galeria', 'halcon', 'bufon', 'silbato', 'chivato', 'bote'], x = {}, r = Math.random();
  if (Math.random() < 0.5) x[ex[Math.floor(Math.random() * ex.length)]] = 1;
  if (r < 0.2) x.apagon = 1; else if (r < 0.4) x.dia = 1;
  return { m: ms[Math.floor(Math.random() * ms.length)], x };
}
function modoPon(d) {
  MODO.m = d && MODOS[d.m] ? d.m : 'normal'; MODO.x = {};
  for (const k in (d && d.x) || {}) if (EXTRAS[k] && d.x[k]) MODO.x[k] = 1;
  if (MODO.x.dia) delete MODO.x.apagon;      // de día no hay apagón (si llegan los dos, gana el día)
  // la vista de los becarios: corta y estrecha en el apagón; de día ven más lejos y más abierto (con todo encendido)
  REGLAS.luzLargo = REGLAS_BASE.luzLargo * (MODO.x.apagon ? 0.75 : MODO.x.dia ? 1.35 : 1);
  REGLAS.luzAngulo = REGLAS_BASE.luzAngulo * (MODO.x.apagon ? 0.6 : MODO.x.dia ? 1.6 : 1);
  // las reglas de la sala (solo las que no son las de siempre quedan en MODO.a)
  MODO.a = {}; for (const k in AJUSTES_SALA) { const v = ajusteSala(d && d.a, k); if (v !== ajusteSala(null, k)) MODO.a[k] = v; }
  const s = ajusteSala(MODO.a, 's'), b = ajusteSala(MODO.a, 'b');
  REGLAS.silbido = s || 1e9; REGLAS.primerSilbido = s ? Math.round(REGLAS_BASE.primerSilbido * s / REGLAS_BASE.silbido) : 1e9;      // sin silbido: el reloj no llega nunca
  REGLAS.cazaPvp = ajusteSala(MODO.a, 'c');
  REGLAS.balas = b; REGLAS.balasIni = Math.min(REGLAS_BASE.balasIni, b); REGLAS.balasExtra = b - REGLAS.balasIni;
}
const modoEs = m => MODO.m === m;
const extraOn = k => !!MODO.x[k];
const modoNormal = () => MODO.m === 'normal' && !Object.keys(MODO.x).length && !Object.keys(MODO.a).length;
// el nombre de lo que se juega: «CONTAGIO · Apagón total» (vacío si es el normal sin extras)
function modoTexto(d) {
  d = d || MODO; const x = Object.keys(d.x || {}).filter(k => EXTRAS[k] && d.x[k]);
  const partes = (d.m && d.m !== 'normal' && MODOS[d.m] ? [tr(MODOS[d.m].nombre)] : []).concat(x.map(k => tr(EXTRAS[k].nombre)));
  for (const k in AJUSTES_SALA) { const v = ajusteSala(d.a, k); if (v === ajusteSala(null, k)) continue; const o = AJUSTES_SALA[k].opciones.find(o => o.v === v); partes.push(o.solo ? tr(o.nombre) : tr(AJUSTES_SALA[k].nombre) + ' ' + tr(o.nombre)); }      // «SIN SILBIDO» ya se entiende solo
  return partes.join(' · ');
}
// BUSCAR PARTIDA: todo al azar. El servidor elige el modo, la luz y a veces un extra (_rf_modo_azar); lo que falte (el modo y la luz, si
// no vienen, otro extra más y las reglas de la sala) sale de la semilla de la sala: lo mismo en todos los navegadores, sin tocar el servidor
function modoPublico(d, semilla) {
  const az = k => hash2(semilla | 0, k, 913), m = { m: d && MODOS[d.m] ? d.m : '', x: Object.assign({}, d && d.x), a: {} };
  if (!m.m) { const ms = Object.keys(MODOS); m.m = ms[Math.floor(az(1) * ms.length)]; const l = az(2); if (l < 0.2) m.x.apagon = 1; else if (l < 0.4) m.x.dia = 1; }
  const otros = Object.keys(EXTRAS).filter(k => !EXTRAS[k].luz && !m.x[k]);
  if (az(3) < 0.5 && otros.length) m.x[otros[Math.floor(az(4) * otros.length)]] = 1;
  Object.keys(AJUSTES_SALA).forEach((k, i) => { if (AJUSTES_SALA[k].amigos) return; const o = AJUSTES_SALA[k].opciones; m.a[k] = o[Math.floor(az(10 + i) * o.length)].v; });
  if (d && d.a && d.a.t === 1) m.a.t = 1;      // la cola CON TALENTOS (la elige cada jugador, no el azar)
  return m;
}
// en solitario (y para probar): ?modo=contagio&extras=apagon
function modoDesdeUrl() {
  const q = new URLSearchParams(location.search), m = q.get('modo'), x = {};
  for (const k of (q.get('extras') || '').split(',')) if (k) x[k] = 1;
  modoPon(m || Object.keys(x).length ? { m, x } : null);
}

// ---------- lo que el anfitrión elige en la sala de amigos (se recuerda para la próxima) ----------
const MODO_ELEGIDO = (() => { try { const d = JSON.parse(localStorage.getItem('rouflage-modo') || 'null'); return d && typeof d === 'object' ? { m: MODOS[d.m] ? d.m : 'normal', x: d.x || {}, a: d.a && typeof d.a === 'object' ? d.a : {}, mapa: typeof d.mapa === 'string' ? d.mapa : '' } : { m: 'normal', x: {}, a: {}, mapa: '' }; } catch (_) { return { m: 'normal', x: {}, a: {}, mapa: '' }; } })();
function modoElegidoGuarda() { try { localStorage.setItem('rouflage-modo', JSON.stringify(MODO_ELEGIDO)); } catch (_) { /* sin guardar */ } }

// ---------- CONTAGIO ----------
// un colado despedido (lo llama despide): se queda su sello un momento y luego se hace becario
function contagioDespedido(k) { if (modoEs('contagio')) k.contagio = 1.2; }
function modoAvanza(dt) {
  silbatoAvanza(dt); retratoAvanza(dt); chivatoAvanza(dt); boteAvanza(dt);
  if (!modoEs('contagio') || J.fase !== 'caza') return;
  for (const k of J.camaleones) if (k.fuera && k.contagio > 0 && (k.contagio -= dt) <= 0) contagia(k);
}
// de colado a becario: cambia de bando, piel gris de becario, linterna y dos cartas, y sale por Recursos Humanos (cada uno por un sitio distinto)
function contagia(k) {
  const i = J.camaleones.indexOf(k); if (i < 0) return;
  J.camaleones.splice(i, 1); J.cazadores.push(k);
  k.clase = 'cazador'; k.contagiado = true; k.contagio = 0; k.fuera = false; k.tFuera = 0;
  k.congelado = false; k.hielo = 0; k.vx = k.vy = 0; k.invis = 0; k.granada = 0; k.sitio = null;
  [k.piel, k.pctx] = nuevaPiel('#aab4c4'); k.pintado = false; k.vis = 1; k.tapada = 0;
  k.balas = REGLAS.balasIni; k.enfria = 1; k.ciego = 0; k.alerta = 0; k.marca = ''; k.dir = -Math.PI / 2; k.mira = 1;
  const n = Math.max(0, k.slot >= 0 ? k.slot : J.cazadores.length), p = SALIDA_CAZADORES[n % SALIDA_CAZADORES.length];
  k.x = p[0] + (n % 4) * 14 - 21; k.y = p[1];
  if (k.red) { k.red = { x: k.x, y: k.y, m: false, mi: 1, di: k.dir }; }
  if (k.bot) { k.bot = null; cerebroCazador(k); ronda(k); }      // la máquina: cerebro de becario desde Recursos Humanos
  fxSalpica(k.x, k.y - 30, '#aab4c4', 10); fxTexto(k.x, k.y - 70, tr('¡Ya es becario!'), '#cfe9ff');
  if (k.jugador) {
    J.modo = 'cazador'; J.fantasma = null; J.peligro = 0;
    if (TALLER.abierto) cierraTaller();
    cartel(tr('¡CONTAGIADO!'), tr('Te dan la camisa de becario: a cazar a tus antiguos compañeros'), true); play('recta');
    refrescaHud(true);
  } else avisa(tr('{a} ahora es becario', { a: k.nombre }), J.yo && J.yo.clase === 'camaleon' ? 'malo' : 'aviso');
}
// PvP: los contagiados que lleva el anfitrión (por si a alguien se le perdió el disparo)
const contagiados = () => J.cazadores.filter(e => e.contagiado).map(e => e.slot);
function contagiaSlots(lista) { for (const s of lista || []) { const e = RFP.slots[s] && RFP.slots[s].ente; if (e && e.clase === 'camaleon') contagia(e); } }
