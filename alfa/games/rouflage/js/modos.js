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
  apagon: { nombre: 'Apagón total', texto: 'Casi a oscuras, linterna corta, sin ranking ni pistas en pantalla: solo el oído.' },
  galeria: { nombre: 'Galería de disfraces', texto: 'Al acabar, cada colado sale en su pedestal y todos votan el mejor y el peor camuflaje.' },
  halcon: { nombre: 'Ojo de halcón', texto: 'Quedarse quieto dentro de la luz de un becario da muchos puntos; más cuanto más cerca. Gana quien se esconde a la vista.' },
  bufon: { nombre: 'El bufón', texto: 'Un colado es el bufón en secreto: solo gana si lo despiden en el último minuto. Antes, pierde.' },
  silbato: { nombre: 'Silbato caliente', texto: 'Un colado lleva un silbato que suena solo: pásaselo a otro tocándole antes de que explote.' },
  chivato: { nombre: 'Fantasmas chivatos', texto: 'Un fantasma puede chivarle una pista a un becario: si este despide a alguien en 20 s, el fantasma resucita.' },
  bote: { nombre: 'Llena el bote', texto: 'Hay gotas de pintura por el suelo: los colados ganan si llevan cinco al cubo de la cafetería.' },
};
const MODO = { m: 'normal', x: {} };                 // la partida en curso
const REGLAS_BASE = { luzLargo: REGLAS.luzLargo, luzAngulo: REGLAS.luzAngulo };

// deja la partida en un modo (null: el normal). Viene del servidor ({ m, x: { apagon: 1 } }) o de la URL en solitario
function modoPon(d) {
  MODO.m = d && MODOS[d.m] ? d.m : 'normal'; MODO.x = {};
  for (const k in (d && d.x) || {}) if (EXTRAS[k] && d.x[k]) MODO.x[k] = 1;
  REGLAS.luzLargo = REGLAS_BASE.luzLargo * (MODO.x.apagon ? 0.75 : 1);
  REGLAS.luzAngulo = REGLAS_BASE.luzAngulo * (MODO.x.apagon ? 0.6 : 1);
}
const modoEs = m => MODO.m === m;
const extraOn = k => !!MODO.x[k];
const modoNormal = () => MODO.m === 'normal' && !Object.keys(MODO.x).length;
// el nombre de lo que se juega: «CONTAGIO · Apagón total» (vacío si es el normal sin extras)
function modoTexto(d) {
  d = d || MODO; const x = Object.keys(d.x || {}).filter(k => EXTRAS[k] && d.x[k]);
  const partes = (d.m && d.m !== 'normal' && MODOS[d.m] ? [tr(MODOS[d.m].nombre)] : []).concat(x.map(k => tr(EXTRAS[k].nombre)));
  return partes.join(' · ');
}
// en solitario (y para probar): ?modo=contagio&extras=apagon
function modoDesdeUrl() {
  const q = new URLSearchParams(location.search), m = q.get('modo'), x = {};
  for (const k of (q.get('extras') || '').split(',')) if (k) x[k] = 1;
  modoPon(m || Object.keys(x).length ? { m, x } : null);
}

// ---------- lo que el anfitrión elige en la sala de amigos (se recuerda para la próxima) ----------
const MODO_ELEGIDO = (() => { try { const d = JSON.parse(localStorage.getItem('rouflage-modo') || 'null'); return d && typeof d === 'object' ? { m: MODOS[d.m] ? d.m : 'normal', x: d.x || {} } : { m: 'normal', x: {} }; } catch (_) { return { m: 'normal', x: {} }; } })();
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
