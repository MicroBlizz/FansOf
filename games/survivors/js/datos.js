// Fans of Survivors · Datos: todas las cifras del juego (jugador, armas, mejoras, enemigos, oleadas y jefe).
// Si Daniel quiere cambiar el equilibrio, casi todo está aquí: vida, daño, recargas, cuántos enemigos salen y cuándo.
'use strict';

/* ---------- la partida ---------- */
const SV = {
  duracion: 600,          // segundos hasta que llega el jefe final (10 minutos)
  maxArmas: 6,            // huecos de arma
  maxPasivas: 6,          // huecos de mejora
  nivelMax: 5,            // nivel máximo de cada arma y cada mejora
  maxEnemigos: 320,       // tope de enemigos a la vez (para que el móvil no sufra)
  // mini jefes y bichos shiny (los dos sueltan cofre): todo ajustable aquí
  apariciones: {
    miniJefeCada: 120,    // segundos entre mini jefes (el primero sale en este segundo)
    shinyProb: 0.02,      // probabilidad de que cada grupo que sale en las oleadas traiga un shiny (2 %)
    shinyMaxEspera: 180,  // si pasa tanto tiempo sin ningún shiny, el siguiente grupo trae uno seguro
    shinyVida: 2.5,       // un shiny aguanta tantas veces la vida normal
    shinyXp: 6,           // CAOS extra que suelta
  },
  maxGemas: 380,          // tope de cristales de CAOS en el suelo: los que sobran se juntan en uno grande
  jugador: { vida: 120, velocidad: 120, recoger: 80, invul: 0.6, r: 16 },
  // CAOS que hace falta para pasar de un nivel al siguiente
  xpNivel: n => Math.round(5 + (n - 1) * 7 + Math.max(0, n - 20) * 4),
  arma0: 'zanahoria',     // con la que empieza CrazyBunny
};

/* ---------- las armas: las cartas de Animales Locos ----------
   carta: el dibujo que sale en la tarjeta · desc: la frase de la tarjeta · nv: qué gana en cada nivel (del 2 al 5)
   v(n): las cifras al nivel n (1 a 5) */
const ARMAS = {
  zanahoria: { nombre: 'Zanahorias', carta: 'bunny', desc: 'CrazyBunny lanza zanahorias al enemigo más cercano.',
    nv: ['+1 zanahoria', '+30 % daño y atraviesa 1 más', '+1 zanahoria', '+30 % daño, más rápidas'],
    v: n => ({ dano: 16 * [1, 1, 1.3, 1.3, 1.69][n - 1], cd: [0.8, 0.8, 0.8, 0.8, 0.62][n - 1], n: [1, 2, 2, 3, 3][n - 1], atraviesa: [2, 2, 3, 3, 3][n - 1], vel: 460 }) },
  chaos: { nombre: 'Chaos Jump', carta: 'bunny', desc: 'Salta (sin recibir daño) y aplasta todo lo que hay alrededor al caer.',
    nv: ['Salta más a menudo', '+40 % daño', 'Área más grande', 'Salta más a menudo y +40 % daño'],
    v: n => ({ dano: 50 * [1, 1, 1.4, 1.4, 1.96][n - 1], cd: [7, 5.8, 5.8, 5.8, 4.6][n - 1], r: [95, 95, 95, 130, 130][n - 1] }) },
  ardillas: { nombre: 'MadSquirrel', carta: 'squirrel', desc: 'Salen ardillas corriendo en todas direcciones y atraviesan a todos.',
    nv: ['+1 ardilla', '+30 % daño', '+2 ardillas', 'Salen más a menudo'],
    v: n => ({ dano: 13 * [1, 1, 1.3, 1.3, 1.3][n - 1], cd: [2.4, 2.4, 2.4, 2.4, 1.6][n - 1], n: [2, 3, 3, 5, 5][n - 1], vel: 360, vida: 1.25 }) },
  castor: { nombre: 'BoomBeaver', carta: 'beaver', desc: 'Un castor con dinamita corre hacia un grupo de enemigos y explota.',
    nv: ['Explosión más grande', '+40 % daño', '+1 castor', 'Sale más a menudo y +30 % daño'],
    v: n => ({ dano: 55 * [1, 1, 1.4, 1.4, 1.82][n - 1], cd: [3.6, 3.6, 3.6, 3.6, 2.6][n - 1], n: [1, 1, 1, 2, 2][n - 1], r: [70, 92, 92, 92, 92][n - 1], vel: 280 }) },
  zorro: { nombre: 'SlyFox', carta: 'fox', desc: 'SlyFox aparece por sorpresa junto al enemigo con más vida y le pega x3.',
    nv: ['+1 objetivo', '+40 % daño', '+1 objetivo', 'Aparece más a menudo'],
    v: n => ({ dano: 32 * [1, 1, 1.4, 1.4, 1.4][n - 1], cd: [2.8, 2.8, 2.8, 2.8, 1.8][n - 1], n: [1, 2, 2, 3, 3][n - 1], mult: 3, alcance: 340 }) },
  suricata: { nombre: 'MeerCat', carta: 'meercat', desc: 'Un aura alrededor que daña a los enemigos y te cura poco a poco.',
    nv: ['Aura más grande', '+50 % daño', 'Cura el doble', 'Aura más grande y +50 % daño'],
    v: n => ({ dano: 6 * [1, 1, 1.5, 1.5, 2.25][n - 1], r: [70, 88, 88, 88, 110][n - 1], cura: [0.4, 0.4, 0.4, 0.8, 0.8][n - 1], tick: 0.5 }) },
  mapache: { nombre: 'JunkCoon', carta: 'junkcoon', desc: 'Lanza bolsas de basura que explotan donde caen.',
    nv: ['+1 bolsa', '+40 % daño', '+1 bolsa y explosión más grande', 'Lanza más a menudo'],
    v: n => ({ dano: 26 * [1, 1, 1.4, 1.4, 1.4][n - 1], cd: [2.5, 2.5, 2.5, 2.5, 1.7][n - 1], n: [1, 2, 2, 3, 3][n - 1], r: [52, 52, 52, 70, 70][n - 1], alcance: 360 }) },
  vacas: { nombre: 'MechaVaca', carta: 'mechavaca', desc: 'Vacas que giran a tu alrededor y empujan a los enemigos.',
    nv: ['+1 vaca', 'Duran más', '+1 vaca y +40 % daño', '+1 vaca'],
    v: n => ({ dano: 18 * [1, 1, 1, 1.4, 1.4][n - 1], cd: 7, dura: [3.5, 3.5, 5, 5, 5][n - 1], n: [1, 2, 2, 3, 4][n - 1], r: 88, giro: 3 }) },
};

/* ---------- las mejoras: habilidades del gashapón ---------- */
const PASIVAS = {
  cafeina:    { nombre: 'Cafeína', icono: '☕', desc: '+8 % de velocidad al andar.' },
  piel:       { nombre: 'Piel dura', icono: '🛡️', desc: '+20 de vida máxima (y te cura 20).' },
  punos:      { nombre: 'Puños de hierro', icono: '👊', desc: '+10 % de daño con todas las armas.' },
  reflejos:   { nombre: 'Reflejos', icono: '⚡', desc: 'Las armas se recargan un 7 % antes.' },
  iman:       { nombre: 'Imán de CAOS', icono: '🧲', desc: 'Recoges el CAOS desde un 25 % más lejos.' },
  vampirismo: { nombre: 'Vampirismo', icono: '🦇', desc: 'Cada enemigo que cae te cura un poco.' },
  hitbox:     { nombre: 'Hitbox dudosa', icono: '👻', desc: 'Un 6 % de los golpes no te dan. Nadie sabe por qué.' },
  diploma:    { nombre: 'Becario del Mes', icono: '📜', desc: '+10 % de CAOS de cada cristal.' },
};
// lo que hace cada mejora a su nivel n (0 = no la tienes)
const EFECTO = {
  velocidad: n => 1 + 0.08 * n,
  vidaMax: n => 20 * n,
  dano: n => 1 + 0.1 * n,
  recarga: n => 1 - 0.07 * n,
  recoger: n => 1 + 0.25 * n,
  vampiro: n => 0.35 * n,       // vida por enemigo que cae
  esquivar: n => 0.06 * n,
  xp: n => 1 + 0.1 * n,
};
// si ya lo tienes todo al máximo
const RELLENO = [
  { id: 'cafe', nombre: 'Café de máquina', icono: '🥤', desc: 'Te cura 40 de vida. Sabe a despacho.' },
  { id: 'bonus', nombre: 'Bonus del CEO', icono: '💰', desc: '+500 puntos. El CEO se ha llevado el resto.' },
];

/* ---------- los enemigos: los bots de Microblizz y de Phony ----------
   spr: su dibujo · vida · vel: velocidad · dano: lo que te quita al tocarte · xp: el cristal que suelta · r: su tamaño de choque */
const ENEMIGOS = {
  becario:     { nombre: 'Becario',       spr: 'becario',     vida: 10,  vel: 60, dano: 6,  xp: 1, r: 11 },
  descargabot: { nombre: 'Descarga99',    spr: 'descargabot', vida: 8,   vel: 86, dano: 5,  xp: 1, r: 10 },
  starbot:     { nombre: 'StarBot',       spr: 'starbot',     vida: 22,  vel: 54, dano: 8,  xp: 2, r: 13, tirador: { cd: 4.2, dist: 220, dano: 5, vel: 150 } },
  licenciabot: { nombre: 'LicenciaBot',   spr: 'licenciabot', vida: 34,  vel: 64, dano: 9,  xp: 2, r: 13, caduca: 22 },
  soportebot:  { nombre: 'SoporteBot',    spr: 'soportebot',  vida: 32,  vel: 50, dano: 6,  xp: 3, r: 13, cura: { cd: 2.2, r: 110, cant: 12 } },
  cobradlc:    { nombre: 'CobraDLC',      spr: 'cobradlc',    vida: 55,  vel: 72, dano: 10, xp: 3, r: 14 },
  cajabotin:   { nombre: 'CajaBotín',     spr: 'cajabotin',   vida: 70,  vel: 40, dano: 10, xp: 4, r: 15, alMorir: { tipo: 'becario', n: 3 } },
  parchebot:   { nombre: 'Parche Día 1',  spr: 'parchebot',   vida: 150, vel: 34, dano: 14, xp: 8, r: 19, armadura: 0.3 },
  fallen:      { nombre: 'FallenHero',    spr: 'fallen',      vida: 240, vel: 30, dano: 18, xp: 12, r: 21 },
  servidorbot: { nombre: 'Servidor Caído', spr: 'servidorbot', vida: 380, vel: 27, dano: 20, xp: 16, r: 23 },
};
// los enemigos tienen más vida cuanto más dura la partida
const vidaPorMinuto = min => 1 + 0.1 * min + 0.006 * min * min;

/* ---------- las oleadas: una por minuto ----------
   cada: cada cuántos segundos sale un grupo · grupo: cuántos salen · mezcla: qué sale (con su peso) */
const OLEADAS = [
  { cada: 1.6, grupo: 2, mezcla: { becario: 1 } },
  { cada: 1.3, grupo: 3, mezcla: { becario: 6, starbot: 1 } },
  { cada: 1.2, grupo: 3, mezcla: { becario: 5, starbot: 2, cajabotin: 1 } },
  { cada: 1.25, grupo: 4, mezcla: { becario: 4, descargabot: 3, starbot: 2, soportebot: 1, cajabotin: 1 } },
  { cada: 1.25, grupo: 5, mezcla: { descargabot: 4, becario: 3, licenciabot: 2, starbot: 2, parchebot: 1 } },
  { cada: 1.1, grupo: 5, mezcla: { descargabot: 4, licenciabot: 3, cobradlc: 2, soportebot: 1, parchebot: 1 } },
  { cada: 1.3, grupo: 5, mezcla: { becario: 4, cobradlc: 3, starbot: 2, parchebot: 2, fallen: 1 } },
  { cada: 1.25, grupo: 5, mezcla: { descargabot: 5, cobradlc: 3, licenciabot: 2, fallen: 1, soportebot: 1 } },
  { cada: 1.2, grupo: 5, mezcla: { becario: 4, cobradlc: 3, parchebot: 2, fallen: 2, servidorbot: 1 } },
  { cada: 1.1, grupo: 5, mezcla: { descargabot: 5, cobradlc: 3, fallen: 2, servidorbot: 2, soportebot: 1 } },
];
// los mini jefes salen uno cada SV.apariciones.miniJefeCada segundos, por este orden (los de después, más duros)
const MINIJEFES = [
  { enemigo: 'cajabotin', vida: 1100, escala: 2.2, aviso: '¡CAJABOTÍN GIGANTE!' },
  { enemigo: 'parchebot', vida: 3200, escala: 2.1, aviso: '¡EL PARCHE DE 80 GB!' },
  { enemigo: 'fallen', vida: 5200, escala: 2.0, aviso: '¡HÉROE DESCARTADO!' },
  { enemigo: 'servidorbot', vida: 6500, escala: 2.0, aviso: '¡SERVIDOR CAÍDO... SOBRE TI!' },
];
// otros momentos concretos (segundo de la partida)
const EVENTOS = [
  { t: 90,  tipo: 'cerco', enemigo: 'becario', n: 28, aviso: '¡RONDA DE CONTRATACIÓN!' },
  { t: 270, tipo: 'cerco', enemigo: 'descargabot', n: 32, aviso: '¡DESCARGA MASIVA AL 99 %!' },
  { t: 450, tipo: 'cerco', enemigo: 'licenciabot', n: 36, aviso: '¡RENOVACIÓN DE LICENCIAS!' },
];

/* ---------- el jefe final ---------- */
const JEFE = {
  nombre: 'SurvivalBot', spr: 'fallen', vida: 7000, vel: 58, dano: 26, r: 40, escala: 2.6,
  entierro: { cd: 6, r: 78, aviso: 1.2, congela: 1.4, dano: 18 },   // «Entierro de IP»: marca el suelo y congela
  despidos: { cd: 9, n: 10 },                                        // «Despidos masivos»: llama a becarios
  furia: 0.5,                                                        // con la mitad de vida va más rápido
};

/* ---------- lo que sueltan ---------- */
// las cajas de la mudanza que hay por el campo: se rompen a golpes y siempre dan oro (al acabar la partida, junto al resto del premio)
const CAJAS = {
  vida: 40,           // golpes que aguanta (daño de las armas)
  oro: [3, 8],        // oro que da cada caja: mínimo y máximo
  topeOro: 400,       // máximo de oro que se puede sacar de cajas en una partida
  objeto: 0.01,       // probabilidad de que una caja dé además un objeto del gashapón
  topeObjetos: 2,     // máximo de objetos por partida
};
const BOTIN = {
  cafe: 0.012,     // probabilidad de que un enemigo suelte una Taza del becario (cura)
  cafeCura: 25,
  iman: 0.003,     // probabilidad de un imán (atrae todo el CAOS)
};

/* ---------- los cofres ----------
   Aquí se ajusta cuántas mejoras da un cofre y cuánto dura la entrega. */
const COFRE = {
  // peso de que un cofre dé 1, 2 o 3 mejoras (solo importa la proporción: 1/1/1 = 33 % cada una; 4/4/1 = lo común es 1 o 2)
  pesos: { 1: 1, 2: 1, 3: 1 },
  cinco: 0.03,   // con un poco de suerte extra (3 %), el cofre da 5 mejoras en vez de lo que tocara
  susto: 0.08,   // probabilidad de que el cofre se atasque («¿nada?») y luego dé el doble de mejoras (máximo 5)
  // la entrega va por fases: cámara lenta, se abre, sale una mejora y la música se acelera con suspense; ¿saldrá otra?
  // tiempos en milisegundos. suspense, tempos y latidos: uno por fase (la primera, la segunda…); tempos = velocidad de la música; latidos = lo que tarda cada latido
  // falsoFinal: probabilidad de que parezca acabarse (silencio de «silencio» ms) y salga otra · intro: la cámara lenta · susto: lo que dura el atasco
  entrega: { intro: 900, epica: 1500, giro: 800, susto: 1100, silencio: 1000, falsoFinal: 0.3, suspense: [1700, 2000, 2300, 2600, 2800], tempos: [1.25, 1.5, 1.8, 2.2, 2.5], latidos: [520, 400, 300, 220, 160] },
};
