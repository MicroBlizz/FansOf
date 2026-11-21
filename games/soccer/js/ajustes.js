// Fans of Soccer · Ajustes: medidas del campo, velocidades, tiempos, vida, peso de los golpes, súper tiros, los cinco equipos y los tres campos.
'use strict';
const AJUSTES = {
  id: 'soccer',                  // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-soccer',     // la clave de la partida en este navegador
};
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
SOCCER.AJ = Object.freeze({
  largo: 150,                       // campo en metros de portería a portería (el ancho lo pone cada campo)
  porteria: { alto: 4, medio: 7 },  // medio: media boca de la portería
  area: { largo: 18, medio: 20 },   // área del portero: dentro usa las manos y no se le puede derribar
  parte: 90, partes: 2, oro: 30,    // segundos por parte, número de partes y gol de oro si hay empate
  vel: { jugador: 10.5, portero: 13, conBalon: 9.5, barrida: 24, empujon: 15, tiro: 46, pase: 32, superTiro: 66 },
  barrida: { dura: 0.38, alcance: 3.1, mareo: 2.4, mareoSinBalon: 1.4, espera: 0.55, dano: 6 },
  empujon: { dura: 0.2, alcance: 2.6, mareo: 1.0, espera: 0.45, dano: 10, margen: 8 },   // margen: vida de ventaja que se le da al que empuja
  ko: 20,                           // segundos fuera al quedarse sin vida
  golpeSuper: 6,                    // vida que quita un súper tiro al que se cruza
  coger: 2.0,                       // distancia para hacerse con el balón
  remate: { alcance: 2.4, zMin: 1.1, zMax: 3.6 },   // chilena o volea: balón en el aire cerca
  gravedad: 30, roce: 0.985,
  // Peso de cada golpe en pantalla (B1 de la hoja de ruta): parón en segundos, sacudida de la cámara y vibración del móvil en ms.
  // De menos a más: empujón < barrida < atropello < derribo < súper tiro < portero KO < KO < gol (lo comprueba tests/soccer/golpes.test.mjs).
  // soloMio: solo vibra si lo hace tu equipo (para que el móvil no tiemble con cada barrida de la máquina). El súper tiro no lleva
  // parón porque ya tiene su corte a cámara lenta.
  golpes: {
    tiro:         { paron: 0,    temblor: 5,  vibra: 12, soloMio: true },
    empujon:      { paron: 0,    temblor: 3,  vibra: 8,  soloMio: true },
    barrida:      { paron: 0,    temblor: 4,  vibra: 10, soloMio: true },
    atropello:    { paron: 0.04, temblor: 7,  vibra: 18 },
    derribo:      { paron: 0.06, temblor: 10, vibra: 25 },
    super:        { paron: 0,    temblor: 13, vibra: 60 },
    'portero-ko': { paron: 0.12, temblor: 20, vibra: 70 },
    ko:           { paron: 0.14, temblor: 24, vibra: 85 },
    gol:          { paron: 0.16, temblor: 28, vibra: 120 },
  },
  energia: { porSegundo: 0.5, barrida: 4, empujon: 3, pase: 2, max: 100 },
  supersPorParte: 2,
  ia: { distTiro: 26, presion: 4.5, alcanceBarrida: 2.6, intentos: [1.2, 3] },   // intentos de barrida por segundo de la máquina (nivel 0 y 1)
  // los cinco equipos: pasos = metros de carrerilla con el balón sin que te toquen para cargar el súper tiro;
  // parada = probabilidad de que su portero pare un súper tiro; nivel = lo bien que juega la máquina con él (0 a 1)
  equipos: [
    { id: 'animales', nombre: 'Animales Locos', color: '#ff8a2a', super: 'zanahoria', nombreSuper: '¡ZANAHORIAZO!', vida: 40, pasos: 14, parada: 0.5, nivel: 0.5,
      jugadores: [['vaca', 'MechaVaca', 'portero'], ['ardilla', 'MadSquirrel', 'defensa'], ['castor', 'BoomBeaver', 'defensa2'], ['zorro', 'SlyFox', 'medio'], ['bunny', 'CrazyBunny', 'delantero'], ['mapache', 'JunkCoon', 'delantero2']] },
    { id: 'microblizz', nombre: 'Microblizz', color: '#3a6cff', super: 'carga', nombreSuper: '¡PANTALLAZO DE CARGA!', vida: 44, pasos: 18, parada: 0.55, nivel: 0.7,
      jugadores: [['survival', 'SurvivalBot', 'portero'], ['becario', 'Becario', 'defensa'], ['parche', 'Parche Día 1', 'defensa2'], ['becario', 'Becario', 'medio'], ['ceo', 'El CEO', 'delantero'], ['starbot', 'StarBot', 'delantero2']] },
    { id: 'nomuertos', nombre: 'No-Muertos', color: '#8a3ccf', super: 'fantasma', nombreSuper: '¡TIRO DE ULTRATUMBA!', vida: 50, pasos: 16, parada: 0.4, nivel: 0.35,
      jugadores: [['brute', 'StitchBrute', 'portero'], ['esqueleto', 'SkeletonCrew', 'defensa'], ['caballero', 'SkullKnight', 'defensa2'], ['zombi', 'CrunchZombie', 'medio'], ['necro', 'NecroLord', 'delantero'], ['banshee', 'Banshee', 'delantero2']] },
    { id: 'ciber', nombre: 'Ciberpunks', color: '#18d2e6', super: 'teletransporte', nombreSuper: '¡TIRO CUÁNTICO!', vida: 36, pasos: 12, parada: 0.6, nivel: 0.6,
      jugadores: [['mech', 'SiegeMech', 'portero'], ['hacker', 'HackerKid', 'defensa'], ['droide', 'TechDroid', 'defensa2'], ['ninja', 'CyberNinja', 'medio'], ['marine', 'CyberMarine', 'delantero'], ['francotiradora', 'NeonSniper', 'delantero2']] },
    { id: 'phony', nombre: 'Phony', color: '#e2b324', super: 'factura', nombreSuper: '¡FACTURA TRIPLE!', vida: 48, pasos: 16, parada: 0.65, nivel: 0.9,
      jugadores: [['caido', 'Servidor Caído', 'portero'], ['payplus', 'PayPlus', 'defensa'], ['cobra', 'CobraDLC', 'defensa2'], ['licencia', 'LicenciaBot', 'medio'], ['presidente', 'El Presidente', 'delantero'], ['descarga', 'Descarga99', 'delantero2']] },
  ],
  // los tres campos: ancho, rebote en las vallas, bote del balón y su truco; clima = lo que pasa de vez en cuando
  campos: {
    atico:      { nombre: 'El Ático', fondo: 'fondo', ancho: 84, rebote: 0.55, bote: 0.45, deslizar: 0.93, barridaLarga: 1, viento: 7, charcos: [],
                  clima: 'racha', suelo: '#5d6470', franjas: ['#3fa34d', '#47b356'], lineas: 'rgba(255,255,255,.85)', truco: 'Viento: los balones altos se desvían' },
    parking:    { nombre: 'El Parking VIP', fondo: 'fondo-parking', ancho: 78, rebote: 0.6, bote: 0.4, deslizar: 0.975, barridaLarga: 1.6, viento: 0,
                  charcos: [[45, 25, 6], [102, 56, 7], [75, 70, 5], [33, 62, 5], [117, 20, 5], [75, 12, 4.5]],
                  clima: 'aceite', suelo: '#2a2d33', franjas: ['#3b3f47', '#41454e'], lineas: 'rgba(255,214,60,.9)', truco: 'Asfalto mojado: barridas larguísimas y charcos de aceite' },
    servidores: { nombre: 'La Sala de Servidores', fondo: 'fondo-servidores', ancho: 58, rebote: 1.05, bote: 0.72, deslizar: 0.93, barridaLarga: 1, viento: 0, charcos: [],
                  clima: 'apagon', suelo: '#151a24', franjas: ['#4a5563', '#525e6d'], lineas: 'rgba(90,200,255,.9)', truco: 'Suelo duro y estrecho: botes altos y rebotes que aceleran' },
  },
  clima: { cada: 35, dura: 7 },     // cada cuánto llega el cambio de tiempo (de media) y cuánto dura
  // la Copa: los rivales por orden, cada uno en su campo (se salta el equipo que elijas)
  copa: [['nomuertos', 'atico'], ['ciber', 'servidores'], ['animales', 'atico'], ['microblizz', 'parking'], ['phony', 'servidores']],
  // alineaciones: sitio de cada puesto (fracción del largo desde su portería, fracción del ancho); el portero siempre en su línea.
  // Los jugadores se mueven alrededor de su sitio siguiendo la jugada (ia.js, colocarse).
  alineaciones: {
    defensiva:  { portero: [0.015, 0.5], defensa: [0.13, 0.32], defensa2: [0.13, 0.68], medio: [0.26, 0.5], delantero: [0.4, 0.38], delantero2: [0.4, 0.62] },
    equilibrada: { portero: [0.015, 0.5], defensa: [0.18, 0.3], defensa2: [0.18, 0.7], medio: [0.32, 0.5], delantero: [0.46, 0.4], delantero2: [0.46, 0.6] },
    ofensiva:   { portero: [0.015, 0.5], defensa: [0.24, 0.35], defensa2: [0.24, 0.65], medio: [0.38, 0.5], delantero: [0.47, 0.3], delantero2: [0.47, 0.7] },
  },
});
