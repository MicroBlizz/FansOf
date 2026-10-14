// Fans of Dungeons · Lo que se guarda en el navegador: lo de siempre (hitos, registro de despidos, récord, opciones) y la
// partida a medias, para continuar donde se dejó (se borra al morir: la muerte es permanente). Partida propia de este juego:
// nada se comparte con los otros juegos de la serie.
'use strict';

const CLAVE_META = 'fansof-dungeons', CLAVE_PARTIDA = 'fansof-dungeons-partida';
const GUARDA = { hitos: {}, registro: [], record: 0, partidas: 0, victorias: 0, sonido: true, tutorial: false, tuto: {}, vel: 1, diario: null, meta: { bonus: 0, n: {} }, mano: 'diestro' };
function cargaMeta() { try { const d = JSON.parse(localStorage.getItem(CLAVE_META) || 'null'); if (d) Object.assign(GUARDA, d); } catch (e) { /* de cero */ } }
function guardaMeta() { try { localStorage.setItem(CLAVE_META, JSON.stringify(GUARDA)); } catch (e) { /* sin guardar */ } }
// ¿está liberada una clase? (en localhost o con ?todo=1 están todas, para probar)
function claseLibre(c) {
  if (c === 'bunny') return true;
  try { if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || new URLSearchParams(location.search).get('todo') === '1') return true; } catch (e) { /* nada */ }
  for (const k in HITOS) if (HITOS[k].libera === c && GUARDA.hitos[k]) return true;
  return false;
}

const b64 = a => btoa(String.fromCharCode.apply(null, a));
const deb64 = s => Uint8Array.from(atob(s), ch => ch.charCodeAt(0));
const CAMPOS_ENT = ['x', 'y', 'izq', 'vida', 'vidaMax', 'atq', 'def', 'vel', 'vision', 'alcance', 'energia', 'estados', 'despierto', 'ultimo', 'mimico', 'contador', 'llave', 'elite', 'nombre', 'modo', 'turnos', 'carga', 'avisoCarga', 'maldito'];
function guardaPartida() {
  if (!J.heroe || J.heroe.vida <= 0 || (J.modo !== 'juego' && J.modo !== 'panel')) return;
  const m = J.mapa, h = J.heroe;
  const datos = {
    v: 1, semilla: J.semilla, planta: J.planta, turno: J.turno, turnosPlanta: J.turnosPlanta, refuerzos: J.refuerzos, monedasVistas: J.monedasVistas, limpia: J.limpia, jefeMuerto: J.jefeMuerto,
    heroe: { clase: h.clase, x: h.x, y: h.y, izq: h.izq, vida: h.vida, cafe: h.cafe, nivel: h.nivel, xp: h.xp, monedas: h.monedas, llaves: h.llaves, equipo: h.equipo, mochila: h.mochila, estados: h.estados, enfria: h.enfria, escudo: h.escudo, sinGolpes: h.sinGolpes, renacer: h.renacer, muertes: h.muertes, jefes: h.jefes, vidaBase: h.vidaBase, atqBase: h.atqBase, defBase: h.defBase, cafeBase: h.cafeBase, visionBase: h.visionBase, ahorro: h.ahorro || 0, mochilaMax: capacidad(h) },
    diario: J.diario, mods: J.mods, aspecto: J.aspecto, ident: J.ident, stats: J.stats,
    enemigos: J.enemigos.map(e => { const o = { tipo: e.tipo }; for (const k of CAMPOS_ENT) if (e[k] !== undefined) o[k] = e[k]; return o; }),
    aliados: J.aliados.map(a => ({ x: a.x, y: a.y, vida: a.vida, vidaMax: a.vidaMax, atq: a.atq, turnos: a.turnos, fiel: a.fiel, nombre: a.nombre, fig: a.fig, vel: a.vel })), maldita: J.maldita,
    objetos: J.objetos, restos: J.restos, tienda: J.tienda, log: J.log.slice(-10),
    mapa: { w: m.w, h: m.h, zona: m.zona, planta: m.planta, t: b64(m.t), v: b64(m.v), vis: b64(m.vis), salas: m.salas, trampas: [...m.trampas], llegada: m.llegada, salida: m.salida, usado: m.usado },
  };
  try { localStorage.setItem(CLAVE_PARTIDA, JSON.stringify(datos)); } catch (e) { /* sin guardar */ }
}
function hayPartida() { try { return !!localStorage.getItem(CLAVE_PARTIDA); } catch (e) { return false; } }
function borraPartida() { try { localStorage.removeItem(CLAVE_PARTIDA); } catch (e) { /* nada */ } }
function cargaPartida() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CLAVE_PARTIDA) || 'null'); } catch (e) { d = null; }
  if (!d || d.v !== 1 || !CLASES[d.heroe.clase]) return false;
  try {
    const M = d.mapa, m = nuevoMapa(M.w, M.h, M.zona, M.planta);
    m.t = deb64(M.t); m.v = deb64(M.v); m.vis = deb64(M.vis); m.salas = M.salas; m.trampas = new Map(M.trampas); m.llegada = M.llegada; m.salida = M.salida; m.usado = M.usado || {};
    const h = nuevoHeroe(d.heroe.clase);
    h.mochila = [];
    Object.assign(h, d.heroe); recalcula(h);
    J.mapa = m; J.heroe = h; J.semilla = d.semilla; J.planta = d.planta; J.turno = d.turno; J.turnosPlanta = d.turnosPlanta || 0; J.refuerzos = d.refuerzos || 0; J.monedasVistas = d.monedasVistas || 0; J.limpia = d.limpia; J.jefeMuerto = d.jefeMuerto;
    J.diario = !!d.diario; J.mods = d.mods || []; J.aspecto = d.aspecto || repartirAspectos(d.semilla); J.ident = d.ident || []; J.maldita = d.maldita || null; J.stats = d.stats || nuevasCuentas();
    J.enemigos = d.enemigos.map(o => { const e = nuevoEnemigo(o.tipo, o.x, o.y, d.planta, o.elite); for (const k of CAMPOS_ENT) if (o[k] !== undefined) e[k] = o[k]; return e; });
    J.aliados = (d.aliados || []).map(a => Object.assign(nuevoAliado('bug', a.x, a.y, a.turnos, h), a));
    J.objetos = d.objetos || []; J.restos = d.restos || []; J.tienda = d.tienda || null; J.log = d.log || []; J.fin = null;
    J.modo = 'juego'; J.panel = null; h.camino = []; J.cam.listo = false;
    rescataDeMuros();
    calculaVision(m, h.x, h.y, h.vision);
    log(tr('Partida continuada. La torre no se ha movido.'), '#ffd040');
    return true;
  } catch (e) { borraPartida(); return false; }
}
