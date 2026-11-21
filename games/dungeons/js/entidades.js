// Fans of Dungeons · Las entidades: el héroe, los enemigos y los aliados (el bug). Sus cifras, su equipo, sus efectos de estado
// (veneno, quemado, bug, despedido, cafeinado) y la animación que llevan puesta. Lo que hacen está en combate.js,
// jugador.js y enemigos-ia.js.
'use strict';

function nuevoHeroe(clase) {
  const C = CLASES[clase];
  const h = {
    bando: 'heroe', clase, nombre: C.nombre, fig: clase, x: 0, y: 0, izq: false,
    vidaBase: C.vida, atqBase: C.atq, defBase: C.def, cafeBase: C.cafe, visionBase: C.vision, vel: C.vel, alcance: C.alcance,
    vida: C.vida, vidaMax: C.vida, atq: C.atq, def: C.def, cafe: C.cafe, cafeMax: C.cafe, vision: C.vision,
    nivel: 1, xp: 0, monedas: 0, llaves: 0, equipo: { arma: null, armadura: null, accesorio: null }, mochila: [],
    estados: {}, enfria: 0, escudo: 0, escudoMax: clase === 'cybermarine' ? 8 : 0, sinGolpes: 0, renacer: clase === 'necrolord',
    anim: { nombre: 'quieto', t: 0, f: 0 }, dx: 0, dy: 0,   // dx, dy: desplazamiento visual (en píxeles) que se va a cero
    camino: [], explorando: false, muertes: 0, jefes: 0,
  };
  h.mochila.push({ id: 'cafe_solo', rar: 0 }, { id: 'cafe_solo', rar: 0 });
  recalcula(h);
  return h;
}
// las cifras finales del héroe con su equipo y su nivel
function recalcula(h) {
  const n = h.nivel - 1;
  let vidaMax = h.vidaBase + n * 8, atq = h.atqBase + n, def = h.defBase + Math.floor(n / 2), vision = h.visionBase, cafeMax = h.cafeBase + n * 5;
  for (const k of HUECOS) {
    const o = h.equipo[k]; if (!o) continue;
    const c = cifraObj(o); if (!c) continue;
    if (c.k === 'atq') atq += c.v; else if (c.k === 'def') def += c.v; else if (c.k === 'vision') vision += c.v; else if (c.k === 'vidaMax') vidaMax += c.v; else if (c.k === 'cafeMax') cafeMax += c.v;
  }
  if (tieneEstado(h, 'cafeinado')) h.vel = 125; else h.vel = CLASES[h.clase].vel; if (tieneEf(h, 'rapido')) h.vel += 15;
  h.vidaMax = vidaMax; h.atq = atq; h.def = def; h.vision = Math.max(3, vision - (hayMod('oscuro') ? 2 : 0)); h.cafeMax = cafeMax;
  h.vida = Math.min(h.vida, h.vidaMax); h.cafe = Math.min(h.cafe, h.cafeMax);
}

function nuevoEnemigo(tipo, x, y, planta, elite, extra = {}) {
  const E = ENEMIGOS[tipo], Z = ZONAS[zonaDe(planta)];
  const sube = 1 + SUBIDA_POR_PLANTA * (planta - Z.desde) + (planta >= 5 ? 0.3 : 0) + (planta >= 9 ? 0.4 : 0);   // la zona ya trae su salto
  const k = elite ? 1.8 : 1;
  const e = {
    bando: 'enemigo', tipo, nombre: E.nombre, fig: E.fig, x, y, izq: true,
    vida: Math.round(E.vida * sube * k), vidaMax: Math.round(E.vida * sube * k), atq: Math.round(E.atq * sube * (elite ? 1.3 : 1)), def: E.def + (elite ? 1 : 0),
    vel: Math.round(E.vel * (hayMod('rapidos') ? 1.2 : 1)), vision: E.vision, alcance: E.alcance || 1, comp: E.comp, xp: Math.round(E.xp * (elite ? 2.5 : 1)), elite: !!elite, jefe: !!E.jefe, mini: !!E.mini,
    energia: 0, estados: {}, despierto: false, ultimo: null, ruta: null, mimico: E.comp === 'mimico', vuela: !!E.vuela,
    anim: { nombre: 'quieto', t: D.f() * 2, f: 0 }, dx: 0, dy: 0, contador: 0, llave: !!extra.llave,
  };
  if (elite) e.nombre = E.nombre + ' ' + tr('Empleado del Año');
  return e;
}
function nuevoAliado(tipo, x, y, turnos, duenyo) {
  return {
    bando: 'aliado', tipo, nombre: 'Bug', fig: 'bug', x, y, izq: false, vida: 22 + duenyo.nivel * 5, vidaMax: 22 + duenyo.nivel * 5, atq: 5 + duenyo.nivel, def: 1,
    vel: 110, vision: 6, alcance: 1, energia: 0, estados: {}, turnos, anim: { nombre: 'quieto', t: 0, f: 0 }, dx: 0, dy: 0,
  };
}

// efectos de estado: { nombre: turnos que quedan }
function ponEstado(ent, nombre, turnos) { ent.estados[nombre] = Math.max(ent.estados[nombre] || 0, turnos); if (ent.bando === 'heroe') recalcula(ent); }
const tieneEstado = (ent, nombre) => (ent.estados[nombre] || 0) > 0;
// un turno de estados: daño por turno y cuenta atrás. Devuelve true si la entidad ha muerto
function ticEstados(ent) {
  const s = ent.estados;
  if (s.veneno > 0) { dana(ent, 2, 'veneno'); }
  if (s.quemado > 0) { dana(ent, 3, 'quemado'); }
  for (const k in s) if (s[k] > 0) { s[k]--; if (s[k] === 0 && ent.bando === 'heroe') { recalcula(ent); if (k === 'bug') log(tr('Te despejas: el bug ha pasado.'), '#d9d2e0'); } }
  return ent.vida <= 0;
}
const ESTADO_TXT = { veneno: 'Veneno', quemado: 'Quemado', bug: 'Bug', despedido: 'Despedido', cafeinado: 'Cafeinado', escudo: 'Escudo', invisible: 'Invisible' };
const ESTADO_COLOR = { veneno: '#5fd36a', quemado: '#ff8a5c', bug: '#6aa878', despedido: '#ff9aa4', cafeinado: '#ffd040', invisible: '#b070f0' };

// quién hay en una casilla (héroe, enemigo o aliado)
function quienHay(x, y) {
  const h = J.heroe;
  if (h && h.x === x && h.y === y && h.vida > 0) return h;
  for (const e of J.enemigos) if (e.x === x && e.y === y) return e;
  for (const a of J.aliados) if (a.x === x && a.y === y) return a;
  return null;
}
// el enemigo visible más cercano al héroe (o a la entidad dada). conJefes: si los jefes cuentan
function enemigoMasCercanoVisible(desde, conJefes = true) {
  let mejor = null, md = 999;
  for (const e of J.enemigos) {
    if (!conJefes && e.jefe) continue;
    if (visM(J.mapa, e.x, e.y) !== 2) continue;
    const k = pasos(desde.x, desde.y, e.x, e.y);
    if (k < md) { md = k; mejor = e; }
  }
  return mejor;
}
// pone una animación (golpe, dano…) que vuelve sola a quieto
function anima(ent, nombre, dur = 0.3) { ent.anim = { nombre, t: 0, f: 0, dur }; }
// avanza las animaciones y el desplazamiento visual de todas las entidades
function avanzaEntidades(dt) {
  const todos = [J.heroe, ...J.enemigos, ...J.aliados];
  for (const e of todos) {
    if (!e) continue;
    const a = e.anim;
    a.t += dt;
    if (a.nombre === 'quieto') a.f = Math.floor(a.t * 4) % 4;
    else if (a.nombre === 'anda') { a.f = Math.floor(a.t * 12) % 4; if (a.t > (a.dur || 0.3)) { a.nombre = 'quieto'; a.t = 0; } }
    else if (a.nombre === 'golpe') { a.f = Math.min(2, Math.floor(a.t * 10)); if (a.t > (a.dur || 0.3)) { a.nombre = 'quieto'; a.t = 0; } }
    else if (a.nombre === 'dano') { a.f = 0; if (a.t > (a.dur || 0.25)) { a.nombre = 'quieto'; a.t = 0; } }
    // el desplazamiento visual vuelve a cero (así los pasos se ven suaves)
    const k = Math.min(1, dt * 14);
    e.dx += (0 - e.dx) * k; e.dy += (0 - e.dy) * k;
    if (Math.abs(e.dx) < 0.5) e.dx = 0; if (Math.abs(e.dy) < 0.5) e.dy = 0;
    if (e.blanco > 0) e.blanco -= dt;
  }
}
// mueve una entidad a una casilla con su animación de paso
function mueveA(e, x, y) {
  if (x !== e.x) e.izq = x < e.x;
  e.dx += (e.x - x) * TS; e.dy += (e.y - y) * TS;
  e.x = x; e.y = y;
  if (e.anim.nombre !== 'golpe') anima(e, 'anda', 0.25);
}
