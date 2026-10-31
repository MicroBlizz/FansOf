// Fans of Goose · AJUSTES: el nombre de la demo para core, la clave de su partida y TODAS las cifras del juego (para equilibrar
// sin tocar el código): tablero, jugador, enemigos, dado, casillas especiales y la tienda de mejoras. Se carga antes de lo común.
'use strict';
const AJUSTES = {
  id: 'goose',                  // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-goose',     // la clave de la partida en este navegador
};

const CFG = {
  W: 200,                        // ancho del mundo (el alto depende de la pantalla)
  // tablero: 63 casillas en fila hacia arriba, cada una una losa de madera algo desplazada (el camino serpentea sobre el vacío)
  casillas: 63, altoCasilla: 180, anchoCamino: 150, vaiven: 22,
  // el derrumbe: la línea de abajo que se come el tablero. Velocidad base + lo que crece con el tiempo; si no avanzas, corre más
  derrumbe: { base: 4.5, crece: 0.009, impaciencia: 2.6, sinAvanzar: 8, maxDetras: 0.78, ultima: 60 },
  // el jugador
  jugador: { vida: 100, velocidad: 64, radio: 6, invulnerable: 0.8, iman: 32, caida: 0.15 },
  maxEnemigos: 220, maxBalas: 160, maxPlumas: 140, maxParticulas: 320, maxTextos: 40,
  // enemigos: vida, velocidad, radio, daño al tocar, experiencia
  enemigos: {
    oca:      { vida: 9,   vel: 30, r: 7,  dano: 4,  xp: 1 },
    albatros: { vida: 13,  vel: 24, r: 8,  dano: 5,  xp: 2, distancia: 72, disparo: 2.6, bala: 5 },
    gorda:    { vida: 150, vel: 19, r: 12, dano: 12, xp: 10 },
    bandada:  { vida: 6,   vel: 95, r: 6,  dano: 7,  xp: 1 },
    jefe:     { vida: 4200, vel: 26, r: 21, dano: 22, xp: 0 },
    rana:     { vida: 12,  vel: 0,  r: 8,  dano: 4,  xp: 2 },
    cuervo:   { vida: 10,  vel: 60, r: 7,  dano: 3,  xp: 2 },
    antorcha: { vida: 16,  vel: 28, r: 8,  dano: 6,  xp: 2 },
    armadura: { vida: 40,  vel: 20, r: 9,  dano: 9,  xp: 4 },
    zombi:    { vida: 20,  vel: 20, r: 7,  dano: 6,  xp: 1 },
  },
  oleada: { base: 6, porCasilla: 3.1, porSegundo: 0.22, gordaCada: 55, bandadaCada: 38 },
  escala: { porCasilla: 0.085, porSegundo: 0.0022 },   // cuánto más vida tienen los enemigos con la casilla y el tiempo
  monedaProb: 0.025,
  // los jefes que obligan a esquivar (js/jefes2.js): al bajar de cada tramo de vida, escudo y gran ataque; y zonas rojas cada poco
  jefes: {
    tramos: [0.66, 0.33], tramosMadre: [0.75, 0.5, 0.25],   // fracciones de vida donde salta el escudo
    escudo: 3.2,                       // segundos intocable mientras lanza el gran ataque
    zonaPrimera: 1.8, zonaCada: 3.4,   // la primera zona y cada cuánto marca otra donde estás (en furia, un 30 % antes)
    zonaAviso: 1.1, zonaR: 16,         // segundos de aviso del círculo rojo y su radio
    zonaDano: 16, granDano: 22,        // daño de una zona suelta y de las del gran ataque (más con la noche)
  },
  // las plumas doradas llenan la barra; llena, el próximo dado sale bendito (solo pares y una casilla más)
  impulso: { lleno: 40 },
  // casillas especiales (la numeración del Juego de la Oca de siempre)
  ocaSalta: { 5: 9, 18: 23, 36: 41, 54: 59 },          // las ocas con trampolín: de oca a oca
  puente: { 6: 12 },                                  // de puente a puente y tiro porque me lleva la corriente
  ocasAdorno: [9, 14, 23, 27, 32, 41, 45, 50, 59],    // ocas pintadas, sin trampolín
  pozo: 19, posada: 31, dadoDado: [26, 53], laberinto: 42, carcel: 52, muerte: 58, jardin: 63,
  muerteAtras: 3,
  // tienda de mejoras permanentes: coste de cada nivel = base * (nivel + 1) ^ 1.45
  tienda: [
    { id: 'vida',    max: 10, base: 25 },   // las cinco de siempre llegan a 10 (cada nivel, más caro)
    { id: 'fuerza',  max: 10, base: 30 },
    { id: 'prisa',   max: 10, base: 25 },
    { id: 'iman',    max: 10, base: 20 },
    { id: 'codicia', max: 10, base: 35 },
    { id: 'retiro',  max: 3, base: 60 },
    { id: 'fenix',   max: 1, base: 220 },
    { id: 'arsenal', max: 1, base: 160 },
    { id: 'suerte',  max: 1, base: 90 },
    { id: 'regateo', max: 3, base: 45 },
    { id: 'coraza',  max: 5, base: 40 },    // -5 % de daño recibido por nivel
    { id: 'regen',   max: 5, base: 45 },    // +0,12 de vida por segundo por nivel
    { id: 'critico', max: 5, base: 40 },    // +3 % de golpe crítico por nivel
    { id: 'sabio',   max: 5, base: 35 },    // +6 % de experiencia por nivel
    { id: 'botin',   max: 5, base: 30 },    // +20 % de monedas en los cofres por nivel
    { id: 'redado',  max: 1, base: 140 },   // una vez por partida, volver a tirar el dado nada más tirarlo
    { id: 'maldicion', max: 5, base: 60 },  // como en Vampire Survivors: ocas más duras a cambio de monedas y experiencia (se puede bajar)
    { id: 'horda',   max: 5, base: 60 },    // más ocas y más seguido, a cambio de monedas y experiencia (se puede bajar)
    { id: 'destierro', max: 3, base: 150 }, // cargas por partida para quitar una carta para siempre
    { id: 'saltar',  max: 3, base: 100 },   // cargas por partida para saltarte una subida (+15 monedas)
    { id: 'auto',    max: 1, base: 2500 },  // la Elección automática: carísima
    { id: 'paciencia', max: 5, base: 45 },  // con el dado listo y quieto, cada 6 s: plumas doradas y monedas (js/armas4.js)
    { id: 'seguro',  max: 3, base: 70 },    // al perder, devuelve un 20 % por nivel de lo gastado en la Posada y el Mercader
    { id: 'talisman', max: 1, base: 400 },  // anula una regla de la noche al azar en cada partida
  ],
};
