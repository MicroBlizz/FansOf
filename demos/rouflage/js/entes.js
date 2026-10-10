// Fans of Rouflage (prototipo) · QUIÉN HAY EN LA PARTIDA: el estado del juego (J), los ajustes de prueba y lo que puede hacer
// cualquier personaje, lo lleve el jugador o un bot: andar, congelarse, silbar y ser despedido.
'use strict';

// Las cifras del prototipo, juntas para poder tocarlas: tiempos en segundos, distancias en píxeles del mundo.
const AJUSTES = {
  prep: 45,              // lo que dura pintarse (de camaleón)
  caza: 90,              // lo que dura la caza siendo camaleón
  cazaCazador: 120,      // lo que dura la caza siendo cazador
  cuenta: 3.4,           // la cuenta atrás antes de que salgan los becarios
  silbido: 28,           // cada cuánto silban todos los escondidos, a la fuerza
  primerSilbido: 16,
  rectaFinal: 20,        // los últimos segundos: pistas extra para los cazadores
  velCamaleon: 168, velCazador: 150,
  balas: 5,              // cartas de despido: fallar gasta una, acertar la devuelve
  enfria: 1.5,           // espera entre disparos
  enfriaFallo: 2.6,      // …y tras un despido improcedente
  ciego: 2.4,            // tras fallar, la linterna alumbra la mitad durante este rato
  alcance: 250,          // hasta dónde llega un disparo
  luzLargo: 250, luzAngulo: 0.62, luzCerca: 58,   // el abanico de la linterna (medio ángulo, en radianes) y el círculo de alrededor
  vistaCerca: 0.32, vistaLejos: 0.7,   // lo que tienes que «cantar» (de 0 a 1) para que un becario bot te distinga pegado a ti y al final de su luz
  oido: 520,             // desde dónde oye un becario bot un silbido
};

const J = {
  modo: 'camaleon', fase: 'titulo', t: 0, reloj: 0, tFase: 0, pausa: false,
  entes: [], camaleones: [], cazadores: [], yo: null,
  silbido: 0, avisado: false, oscuro: 0, pings: 0,
  cuenta: { narices: 0, silbidos: 0, aciertos: 0, fallos: 0, senuelos: 0 },
  resultado: null,
};
const NOMBRES = { bunny: 'CrazyBunny', squirrel: 'MadSquirrel', fox: 'SlyFox', meercat: 'MeerCat', coon: 'JunkCoon' };

let _semilla = 1;
function nuevoEnte(clase, tipo, nombre, x, y) {
  const [piel, pctx] = nuevaPiel(clase === 'cazador' ? '#aab4c4' : BLANCO_PIEL);
  const e = {
    clase, tipo, nombre, x, y, vx: 0, vy: 0, mira: 1, dir: clase === 'cazador' ? 0 : Math.PI / 2, anda: 0, moviendo: false, movido: 0, prisa: 1,
    piel, pctx, pasos: [], congelado: false, hielo: 0, camo: 0, vis: 1, tapada: 0, pintado: false,
    fuera: false, tFuera: 0, bot: null, jugador: false, semilla: _semilla++ * 1.37, ojoX: 0, ojoY: 0, susto: false, tiembla: 0,
    balas: AJUSTES.balas, enfria: 0, ciego: 0, alerta: 0, marca: '', tMarca: 0, tSilbo: 0, sitio: null,
  };
  J.entes.push(e); (clase === 'cazador' ? J.cazadores : J.camaleones).push(e);
  return e;
}
const escondidos = () => J.camaleones.filter(k => !k.fuera);
const cazadoresVivos = () => J.cazadores.filter(h => !h.fuera && h.balas > 0);

// cada fotograma: anda hacia donde quiere (vx, vy entre -1 y 1), y el contorno se desvanece o vuelve según esté congelado
function avanzaEnte(e, dt) {
  e.hielo = limita(e.hielo + (e.congelado ? dt : -dt) / 0.5, 0, 1);
  e.enfria = Math.max(0, e.enfria - dt); e.ciego = Math.max(0, e.ciego - dt); e.tiembla = Math.max(0, e.tiembla - dt);
  e.movido = Math.max(0, e.movido - dt); e.tMarca = Math.max(0, e.tMarca - dt); e.tSilbo = Math.max(0, e.tSilbo - dt);
  if (e.fuera) { e.tFuera += dt; e.moviendo = false; return; }
  const v = Math.hypot(e.vx, e.vy);
  if (e.congelado || v < 0.05) { e.moviendo = false; return; }
  const vel = (e.clase === 'cazador' ? AJUSTES.velCazador : AJUSTES.velCamaleon) * e.prisa * dt, ax = e.x, ay = e.y;
  mueve(e, e.vx * vel, e.vy * vel);
  e.moviendo = lejos(ax, ay, e.x, e.y) > vel * 0.2;
  if (Math.abs(e.vx) > 0.2) e.mira = e.vx > 0 ? 1 : -1;
  if (e.moviendo) { e.anda += dt * Math.min(1, v) * e.prisa; e.movido = 0.5; }
}

// congelarse: uno se queda clavado en un punto entero del mundo (así la pintura casa con el suelo) y se mide su camuflaje
function congela(e) {
  if (e.fuera || e.congelado) return;
  e.congelado = true; e.vx = e.vy = 0; e.x = Math.round(e.x); e.y = Math.round(e.y);
  mideCamuflaje(e);
}
function descongela(e) { e.congelado = false; }
// lo que «canta» un camaleón ahora mismo, de 0 (no se distingue) a 1 (se le ve entero): sin congelar se le ve el contorno
const loQueCanta = k => (k.hielo < 0.85 ? (k.moviendo || k.movido > 0 ? 1 : 0.85) : k.vis);

// silbar: una onda que se ve y se oye. A los cazadores no les dice el punto exacto, solo la zona.
function silba(e, forzado) {
  if (e.fuera || e.tSilbo > 0) return false;
  e.tSilbo = 2.5;
  const a = Math.random() * TAU, d = rand(18, 56), x = e.x + Math.cos(a) * d, y = e.y - 22 + Math.sin(a) * d;
  // quien silba ve su propia onda en su sitio; los demás, descolocada
  ondaSilbido(e.jugador ? e.x : x, e.jugador ? e.y - 24 : y, e);
  for (const h of J.cazadores) if (h.bot && !h.fuera) oyeSilbido(h, x, y);
  if (e.jugador && !forzado) { J.cuenta.silbidos++; fxTexto(e.x, e.y - 70, '+25', '#ffcb3d'); }
  return true;
}

// despedir a un camaleón: reaparece su contorno, se le planta el sello y sale de la partida
function despide(k, por) {
  if (k.fuera) return;
  k.fuera = true; k.congelado = false; k.vx = k.vy = 0; k.tFuera = 0;
  fxSello(k.x, k.y - 26); fxSalpica(k.x, k.y - 26, '#ff4b5c', 14); CAM.tiembla = 0.35;
  play('despido'); play('slam');
  if (por && por.jugador) { J.cuenta.aciertos++; avisa(tr('Has despedido a {b}').replace('{b}', k.nombre), 'bueno'); }
  else if (k.jugador) avisa(tr('{a} te ha despedido').replace('{a}', por ? por.nombre : '?'), 'malo');
  else avisa(tr('{a} ha despedido a {b}').replace('{a}', por ? por.nombre : '?').replace('{b}', k.nombre), J.modo === 'camaleon' ? 'malo' : 'aviso');
}
