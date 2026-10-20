// Fans of Rouflage (prototipo) · QUIÉN HAY EN LA PARTIDA: el estado del juego (J), los ajustes de prueba y lo que puede hacer
// cualquier personaje, lo lleve el jugador o un bot: andar, congelarse, silbar y ser despedido.
'use strict';

// Las cifras del prototipo, juntas para poder tocarlas: tiempos en segundos, distancias en píxeles del mundo.
const REGLAS = {
  prep: 90,              // lo que dura pintarse (de camaleón)
  caza: 120,             // lo que dura la caza siendo camaleón
  cazaCazador: 150,      // lo que dura la caza siendo cazador
  cuenta: 3.4,           // la cuenta atrás antes de que salgan los becarios
  silbido: 28,           // cada cuánto silban todos los escondidos, a la fuerza
  primerSilbido: 16,
  rectaFinal: 30,        // los últimos segundos: pistas extra para los cazadores
  velCamaleon: 168, velCazador: 150,
  balas: 5,              // cartas de despido (el máximo): fallar gasta una, acertar la devuelve
  balasIni: 2, balasExtra: 3,   // el cazador sale con balasIni y gana hasta balasExtra más en las prácticas de la sala de espera
  prepCazador: 30,       // la partida en solitario como cazador: lo que duran las prácticas antes de la cuenta atrás
  enfria: 1.5,           // espera entre disparos
  enfriaFallo: 2.6,      // …y tras un despido improcedente
  ciego: 2.4,            // tras fallar, la linterna alumbra la mitad durante este rato
  alcance: 250,          // hasta dónde llega un disparo
  aguante: 7, descanso: 2.5, cansado: 0.62,   // el AGUANTE de los colados: segundos de carrera seguida, segundos parado para recuperarlo entero, y a qué parte de su velocidad van agotados (por debajo del becario)
  pintaRapida: 45,       // la pintura rápida (te pinta como un bot): cada cuánto se puede usar
  rapidaMeta: 65,        // …y el camuflaje más alto que deja (si sale mejor, se repinta con la mano más suelta: pintaRapida en pintura-bot.js). Pintar a mano debe salir mejor
  humoMeta: 68,          // tras la granada, al pararte te camuflas solo hasta este camuflaje (autoCamuflaje en granada.js)
  botPintaMin: 55, botPintaMax: 90, botPintaMana: 1,   // entre qué camuflajes se pintan los colados bot, y cuánto cuenta su maña (0: al azar; 1: solo la maña): los torpes se encuentran, los mañosos cuestan
  luzPaso: 0.35,         // la parte de la luz que atraviesa los muebles (lo que no es pared): sombras suaves
  luzLargo: 250, luzAngulo: 0.62, luzCerca: 58,   // el abanico de la linterna (medio ángulo, en radianes) y el círculo de alrededor
  cazaPvp: 150,          // lo que dura la caza en el PvP (ahí los dos bandos juegan a la vez)
  vistaCerca: 0.42, vistaLejos: 0.85,   // lo que tienes que «cantar» (de 0 a 1) para que un becario bot te distinga pegado a ti y al final de su luz
  oido: 520,             // desde dónde oye un becario bot un silbido
};

const J = {
  modo: 'camaleon', fase: 'titulo', t: 0, reloj: 0, tFase: 0, pausa: false,
  entes: [], camaleones: [], cazadores: [], yo: null,
  pvp: false,   // true en una partida por internet (pvp.js: RFP lleva los detalles)
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
    fuera: false, tFuera: 0, bot: null, jugador: false, slot: -1, humano: false, remoto: false, red: null,   // PvP: su plaza en la sala, si lo lleva una persona y si lo mueve la red
    semilla: _semilla++ * 1.37, ojoX: 0, ojoY: 0, susto: false, tiembla: 0,
    balas: clase === 'cazador' ? REGLAS.balasIni : REGLAS.balas, enfria: 0, ciego: 0, apagada: 0, manoFria: 0,      // el poder de un fantasma: linterna apagada o temblona (segundos)
    alerta: 0, marca: '', tMarca: 0, tSilbo: 0, sitio: null,
    granada: clase === 'camaleon' ? 1 : 0, invis: 0, tinta: 100, rapida: 0, aguante: 1, cansado: false,      // tinta para los señuelos
       // la granada cegadora (una por partida) y los segundos que le quedan de invisible
    silbido: REGLAS.primerSilbido, avisado: false,   // su reloj del silbido obligatorio (cada uno el suyo)
    pts: { narices: 0, silbidos: 0, aguante: 0, aciertos: 0, fallos: 0, senuelos: 0 },   // lo que cuenta para la clasificación
  };
  J.entes.push(e); (clase === 'cazador' ? J.cazadores : J.camaleones).push(e);
  return e;
}
const escondidos = () => J.camaleones.filter(k => !k.fuera);
const cazadoresVivos = () => J.cazadores.filter(h => !h.fuera && h.balas > 0);

// cada fotograma: anda hacia donde quiere (vx, vy entre -1 y 1), y el contorno se desvanece o vuelve según esté congelado
function avanzaEnte(e, dt) {
  e.hielo = limita(e.hielo + (e.congelado ? dt : -dt) / 0.5, 0, 1);
  e.enfria = Math.max(0, e.enfria - dt); e.rapida = Math.max(0, e.rapida - dt); e.ciego = Math.max(0, e.ciego - dt); e.apagada = Math.max(0, e.apagada - dt); e.manoFria = Math.max(0, e.manoFria - dt); e.tiembla = Math.max(0, e.tiembla - dt);
  e.movido = Math.max(0, e.movido - dt); e.tMarca = Math.max(0, e.tMarca - dt); e.tSilbo = Math.max(0, e.tSilbo - dt); e.invis = Math.max(0, e.invis - dt);
  if (e.fuera) { e.tFuera += dt; e.moviendo = false; return; }
  if (e.remoto) { avanzaRemoto(e, dt); suenaEnte(e, dt); return; }      // PvP: lo mueve la red (pvp-sync.js)
  const v = Math.hypot(e.vx, e.vy), corre = !e.congelado && v >= 0.05;
  if (e.clase === 'camaleon') aguanta(e, dt, corre);
  if (!corre) { e.moviendo = false; return; }
  const vel = (e.clase === 'cazador' ? REGLAS.velCazador : REGLAS.velCamaleon) * e.prisa * (e.cansado ? REGLAS.cansado : 1) * dt, ax = e.x, ay = e.y;
  mueve(e, e.vx * vel, e.vy * vel);
  e.moviendo = lejos(ax, ay, e.x, e.y) > vel * 0.2;
  if (Math.abs(e.vx) > 0.2) e.mira = e.vx > 0 ? 1 : -1;
  if (e.moviendo) { e.anda += dt * Math.min(1, v) * e.prisa; e.movido = 0.5; }
  suenaEnte(e, dt);
}
// lo que se oye de un becario: sus pasos y el barrido de la linterna, desde donde está (más flojo cuanto más lejos)
function suenaEnte(e, dt) {
  if (e.clase !== 'cazador' || J.fase !== 'caza') return;
  if (e.moviendo) { e.tPaso = (e.tPaso || 0) - dt * (e.prisa || 1); if (e.tPaso <= 0) { e.tPaso = 0.34; suenaEn('paso', e.x, e.y, e.jugador ? 0.5 : 1); } } else e.tPaso = 0.12;
  const d = e.dir || 0, giro = Math.abs(Math.atan2(Math.sin(d - (e.dirSon == null ? d : e.dirSon)), Math.cos(d - (e.dirSon == null ? d : e.dirSon))));
  e.dirSon = d; e.giroSon = (e.giroSon || 0) * Math.max(0, 1 - dt * 2) + giro;
  if (e.giroSon > 1.1 && e.apagada <= 0) { e.giroSon = 0; suenaEn('linterna', e.x, e.y, e.jugador ? 0.6 : 1); }
}

// congelarse: uno se queda clavado en un punto entero del mundo (así la pintura casa con el suelo) y se mide su camuflaje
function congela(e) {
  if (e.fuera || e.congelado) return;
  e.congelado = true; e.vx = e.vy = 0; e.x = Math.round(e.x); e.y = Math.round(e.y);
  if (e.ropa && J.fase !== 'paseo') { lienzoBlanco(e); fxCongelar(e); }      // el papel del armario se va: a pintarse en blanco (armario.js)      // el efecto del armario (armario-partida.js)
  if (e.trasHumo && e.jugador) autoCamuflaje(e);      // el humo ya se acabó para él: se pintó de cero y no puede
  mideCamuflaje(e);
  if (J.pvp) rfpCongela(e);      // PvP: los demás reciben tu piel
}
function descongela(e) { e.congelado = false; }
// el aguante de un colado: corriendo se gasta (REGLAS.aguante segundos seguidos); parado o congelado se recupera (REGLAS.descanso segundos para entero).
// Agotado va a paso de tortuga hasta recuperar la mitad: así una carrera saca de un apuro, pero no se puede cruzar el mapa sin que te pillen
function aguanta(e, dt, corre) {
  if (extraOn('aguante')) { e.aguante = 1; e.cansado = false; return; }      // el extra de la sala: sin cansancio
  if (e.invis > 0 || J.fase !== 'caza') corre = false;      // sin coste con la granada puesta ni antes de soltar a los cazadores (preparar y cuenta atrás)
  e.aguante = limita(e.aguante + (corre ? -dt / REGLAS.aguante : dt / REGLAS.descanso), 0, 1);
  if (!e.cansado && e.aguante <= 0) { e.cansado = true; if (e.jugador) play('deny'); }
  else if (e.cansado && e.aguante >= 0.5) e.cansado = false;
  if (e.cansado && corre && e.invis <= 0 && Math.random() < dt * 2) fxSudor(e);
}
// lo que «canta» un camaleón ahora mismo, de 0 (no se distingue) a 1 (se le ve entero): sin congelar se le ve el contorno
const loQueCanta = k => (k.hielo < 0.85 ? (k.moviendo || k.movido > 0 ? 1 : 0.85) : k.vis);

// silbar: una onda que se ve y se oye. A los cazadores no les dice el punto exacto, solo la zona.
function silba(e, forzado) {
  if (e.fuera || e.tSilbo > 0 || e.invis > 0) return false;      // invisible no silba: sería decir dónde está
  e.tSilbo = 2.5;
  e.silbido = e.silbato ? SILBATO.cada : REGLAS.silbido; e.avisado = false;   // al silbar (por gusto o por obligación) su reloj vuelve a empezar (con el silbato caliente, cada poco)
  const a = Math.random() * TAU, d = rand(46, 110), x = e.x + Math.cos(a) * d, y = e.y - 22 + Math.sin(a) * d;
  // quien silba ve su propia onda en su sitio; los demás, descolocada
  ondaSilbido(e.jugador ? e.x : x, e.jugador ? e.y - 24 : y, e);
  const oido = REGLAS.oido; if (e.silbato) REGLAS.oido = oido * 2;      // el silbato caliente se oye el doble
  for (const h of J.cazadores) if (h.bot && !h.fuera) oyeSilbido(h, x, y);
  REGLAS.oido = oido;
  if (!forzado) { e.pts.silbidos++; if (e.jugador) fxTexto(e.x, e.y - 70, '+25', '#ffcb3d'); }
  if (J.pvp) rfpSilbo(e, forzado);      // PvP: los demás también lo ven y lo oyen
  return true;
}

// despedir a un camaleón: reaparece su contorno, se le planta el sello y sale de la partida
function despide(k, por) {
  if (k.fuera) return;
  if (k.jugador && TALLER.abierto) cierraTaller();      // despedido mientras pintas: se acaba el modo pintar
  k.fuera = true; k.congelado = false; k.vx = k.vy = 0; k.tFuera = 0; k.tDespido = J.reloj;      // (el bufón mira en qué segundo cayó)
  fxSello(k.x, k.y - 26, por && por.ropa && por.ropa.sello); fxSalpica(k.x, k.y - 26, '#ff4b5c', 14); CAM.tiembla = 0.35;
  suenaEn('sello', k.x, k.y, k.jugador || (por && por.jugador) ? 1.3 : 1);
  if (por) por.pts.aciertos++;
  contagioDespedido(k); chivatoDespido(k, por); idaDespido(k);      // en el modo Contagio pasará al bando de los becarios (modos.js); los fantasmas chivatos miran su apuesta (modos-fantasma.js)
  if (por && por.jugador) { avisa(tr('Has despedido a {b}').replace('{b}', k.nombre), 'bueno'); }
  else if (k.jugador) { if (por) avisa(tr('{a} te ha despedido').replace('{a}', por.nombre), 'malo'); }      // sin culpable (el silbato) ya lo ha contado su propio aviso
  else if (por) avisa(tr('{a} ha despedido a {b}').replace('{a}', por.nombre).replace('{b}', k.nombre), J.modo === 'camaleon' ? 'malo' : 'aviso');
}
