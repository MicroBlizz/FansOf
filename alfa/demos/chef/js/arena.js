// Fans of Chef · ARENA (prototipo «último intento», 04-11-2026): caza y cocina A LA VEZ en una sola pantalla isométrica pintada por Yoshi
// (img/arena.png, el boceto 3 vacío). Por las dos puertas de la izquierda salen bichos sin parar (más de los que piden las comandas); lo que
// sueltan va a la despensa (las cajas de la encimera); se corta en la tabla de la isla, se cocina en las ollas o la sartén de la encimera de
// delante y se sirve en la barra del fondo. Ronda de 2:30; los puntos son el oro. Reutiliza el cocinero (jugador.js), los bichos (enemigos.js)
// y la cocina (las piezas de cantina.js). El botón A usa la estación que tengas delante y, si no hay ninguna, ataca.
'use strict';

const ARENA_ESCENA = {
  img: 'arena', w: 688, h: 376, alcance: 46,
  suelo: [[15, 212], [160, 140], [400, 140], [595, 222], [420, 312], [300, 325]],
  bloqueos: [[200, 100, 345, 175], [215, 175, 300, 205], [360, 190, 485, 280]],   // la isla (en dos trozos) y la encimera del centro
  salidas: {},
  antorchas: [[52, 128], [160, 62], [245, 22], [460, 30], [645, 132]],
  puertas: [[90, 200], [192, 178]],                                                 // por donde salen los bichos
  estaciones: [
    { id: 'tabla_1',    tipo: 'tabla',      r: [188, 108, 256, 150] },
    { id: 'platos',     tipo: 'platos',     r: [295, 110, 345, 150] },
    { id: 'encimera_1', tipo: 'encimera',   r: [360, 232, 388, 258] },
    { id: 'caja_tomate',   tipo: 'caja', que: 'tomate',   r: [380, 205, 410, 228] },
    { id: 'caja_cebolla',  tipo: 'caja', que: 'cebolla',  r: [410, 194, 440, 216] },
    { id: 'caja_gelatina', tipo: 'caja', que: 'gelatina', r: [440, 182, 470, 205] },
    { id: 'sarten',     tipo: 'fuego', clase: 'sarten', r: [474, 268, 500, 292] },
    { id: 'olla_1',     tipo: 'fuego', clase: 'olla',   r: [506, 250, 532, 274] },
    { id: 'olla_2',     tipo: 'fuego', clase: 'olla',   r: [540, 234, 566, 258] },
    { id: 'tabla_2',    tipo: 'tabla',      r: [580, 218, 606, 240] },
    { id: 'ventanilla', tipo: 'ventanilla', r: [450, 120, 580, 170] },
    { id: 'basura',     tipo: 'basura',     r: [425, 285, 460, 312] },
  ],
};
// las estaciones tampoco se pisan: se suman a los bloqueos de la escena (como en la cantina)
ARENA_ESCENA.bloqueos = ARENA_ESCENA.bloqueos.concat(ARENA_ESCENA.estaciones.map(e => e.r));
const ARENA = { t: 0, proximo: 0 };
const ARENA_SEG = 150, BICHOS_MAX = 5, BICHO_CADA = 3.2;

function empiezaArena() {
  JORNADA.fase = 'arena'; JORNADA.dia = SAVE.dia; JORNADA.despensa = {}; JORNADA.bajas = 0; JORNADA.caida = false; JORNADA.oroDia = 0; JORNADA.objetivos = {};
  ENEMIGOS.length = 0; BOTIN.length = 0; FX.part.length = 0; FX.nums.length = 0;
  MAPA.sala = ARENA_ESCENA; MAPA.antorchas = ARENA_ESCENA.antorchas.map(([x, y]) => ({ x, y })); MAPA.montacargas = null; MAPA.cofre = null;
  Object.assign(CANTINA, { objetivo: null, t: 0, comandas: [], proxima: CIFRAS.comandaCada, puntos: 0, combo: 1, servidos: 0, caducadas: 0, cerca: null, cortando: 0, aviso: null, fin: 0, enJuego: 0 });
  CANTINA.estaciones = ARENA_ESCENA.estaciones.map(e => Object.assign({ item: null, contenido: [], estado: 'vacia', tt: 0, receta: null }, e));
  jugadorNuevo(300, 260); J.dir = 'izq'; J.mx = -1; J.my = 0;
  ARENA.t = 0; ARENA.proximo = 1;
  for (let i = 0; i < CIFRAS.comandasInicio; i++) nuevaComanda(true);
  CAM.x = J.x - PAN.W / 2; CAM.y = J.y - PAN.H / 2;
  cierraVentanas(); SONIDO.campana(); aviso(tr('¡Caza y cocina a la vez!'), 2.2);
}
// qué bicho sale: casi siempre uno que suelta algo que piden las comandas abiertas y aún no tienes
function bichoQueHaceFalta() {
  const falta = {};
  for (const c of CANTINA.comandas) for (const k in RECETAS[c.receta].lleva) falta[k] = (falta[k] || 0) + RECETAS[c.receta].lleva[k];
  for (const k in falta) falta[k] -= (JORNADA.despensa[k] || 0);
  const utiles = Object.keys(BICHOS).filter(t => (falta[BICHOS[t].suelta] || 0) > 0);
  return utiles.length && Math.random() < 0.75 ? pick(utiles) : pick(Object.keys(BICHOS));
}
function saleBicho() {
  const [x, y] = pick(ARENA_ESCENA.puertas), tipo = bichoQueHaceFalta(), def = BICHOS[tipo];
  ENEMIGOS.push({ tipo, def, x: x + rand(-6, 6), y: y + rand(-4, 4), vida: def.vida, muerto: false, despierto: true, t: rand(0, 6), aturdido: 0.6, herido: 0, mecha: -1, embiste: null, salto: null, espera: rand(0.6, 1.2), vx: 0, vy: 0 });
  chispas(x, y - 20, PALETA.G, 10, 50); SONIDO.puerta();
}

function avanzaArena(dt) {
  ARENA.t += dt; CANTINA.t = ARENA.t;
  // los bichos salen por las puertas, más deprisa según avanza la ronda
  ARENA.proximo -= dt;
  if (ARENA.proximo <= 0) { if (ENEMIGOS.filter(e => !e.muerto).length < BICHOS_MAX) saleBicho(); ARENA.proximo = BICHO_CADA * (1 - 0.35 * ARENA.t / ARENA_SEG); }
  // tocar una estación es ir a usarla (si no, el jugador decide: bicho o suelo); A usa la estación de delante y, si no hay, ataca
  toqueEstacion();
  if (ENTRADA.ataquePulsa) { const e = estacionCerca(), a = e && accionDe(e); if (a) { usaEstaciones(dt); ENTRADA.ataquePulsa = 0; } }
  else usaEstaciones(dt);
  avanzaJugador(dt);
  avanzaEnemigos(dt);
  avanzaFuegos(dt);
  avanzaComandas(dt, true);
  const r = ARENA_SEG - ARENA.t;
  avisaReloj(r, dt);
  if (r <= 0) { JORNADA.oroDia = CANTINA.puntos; cierraJornada(); }
}
// caer en la arena: no se acaba la ronda, pero pierdes la mitad de la despensa y vuelves a tener los corazones
function caidaArena() {
  for (const k in JORNADA.despensa) JORNADA.despensa[k] = Math.floor(JORNADA.despensa[k] / 2);
  J.vida = CIFRAS.vida; J.invul = 2; JORNADA.caida = true;
  aviso(tr('¡Te han cocinado! Pierdes la mitad de la despensa'), 2.2, PALETA.R); SONIDO.pierde(); tiembla(1.4);
}

function pintaArena(ctx, W, H) {
  enfoca();
  const cam = { x: Math.round(CAM.x + (FX.temblor ? rand(-2, 2) * FX.temblor : 0)), y: Math.round(CAM.y + (FX.temblor ? rand(-2, 2) * FX.temblor : 0)), w: W, h: H };
  pintaSala(ctx, cam);
  // las puertas laten en verde cuando va a salir algo
  for (const [x, y] of ARENA_ESCENA.puertas) { const a = ARENA.proximo < 0.6 ? 0.5 : 0.15; ctx.globalAlpha = a + Math.sin(PAN.t * 6) * 0.08; circulo(ctx, x - cam.x, y - 22 - cam.y, 16, PALETA.G); ctx.globalAlpha = 1; }
  pintaBotin(ctx, cam);
  const lista = [{ y: J.y + 1, pinta: c => pintaJugador(c, cam) }];
  for (const e of ENEMIGOS) lista.push({ y: e.y, pinta: c => pintaEnemigo(c, cam, e) });
  lista.sort((a, b) => a.y - b.y); for (const o of lista) o.pinta(ctx);
  pintaEstaciones(ctx, cam);
  pintaParticulas(ctx, cam); pintaNumeros(ctx, cam);
  pintaLuz(ctx, cam, W, H);
  pintaGuia(ctx, cam, W, H);
  const a = accionDe(CANTINA.cerca);
  if (a) { marcoMadera(ctx, W / 2 - 64, H - 36, 128, 13); letraCabe(ctx, (modoControl() === 'tocar' ? '' : ENTRADA.tactil ? 'A: ' : 'J: ') + a.txt, W / 2, H - 26, 120, a.no ? PALETA.r : PALETA.Y, 'center', 7); }
  pintaMarcadorCantina(ctx, W, H, ARENA_SEG - ARENA.t);
  // corazones
  for (let k = 0; k < CIFRAS.vida; k++) pintaSpr(ctx, 'ico_corazon', W - 50 + k * 12, 50, { vacio: k >= J.vida });
  pintaMandos(ctx, W, H);
}
