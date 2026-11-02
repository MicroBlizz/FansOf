// Fans of Soccer · Ajustes: medidas del campo, velocidades, tiempos, vida, súper tiros, los cinco equipos y los tres campos.
'use strict';
const AJUSTES = {
  id: 'soccer',                  // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-soccer',     // la clave de la partida en este navegador
};
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
SOCCER.AJ = Object.freeze({
  largo: 100,                       // campo en metros de portería a portería (el ancho lo pone cada campo)
  porteria: { alto: 4, medio: 6 },  // medio: media boca de la portería
  parte: 90, partes: 2, oro: 30,    // segundos por parte, número de partes y gol de oro si hay empate
  vel: { jugador: 9, portero: 12, conBalon: 8, barrida: 22, empujon: 14, tiro: 40, pase: 27, superTiro: 58 },
  barrida: { dura: 0.38, alcance: 3.1, mareo: 2.4, mareoSinBalon: 1.4, espera: 0.55, dano: 6 },
  empujon: { dura: 0.2, alcance: 2.6, mareo: 1.0, espera: 0.45, dano: 10, margen: 8 },   // margen: vida de ventaja que se le da al que empuja
  ko: 20,                           // segundos fuera al quedarse sin vida
  golpeSuper: 6,                    // vida que quita un súper tiro al que se cruza
  coger: 2.0,                       // distancia para hacerse con el balón
  remate: { alcance: 2.4, zMin: 1.1, zMax: 3.6 },   // chilena o volea: balón en el aire cerca
  gravedad: 30, roce: 0.985,
  energia: { porSegundo: 0.5, barrida: 4, empujon: 3, pase: 2, max: 100 },
  supersPorParte: 2,
  ia: { distTiro: 22, presion: 4.5, alcanceBarrida: 2.6, intentos: [1.2, 3] },   // intentos de barrida por segundo de la máquina (nivel 0 y 1)
  // los cinco equipos: pasos = metros de carrerilla con el balón sin que te toquen para cargar el súper tiro;
  // parada = probabilidad de que su portero pare un súper tiro; nivel = lo bien que juega la máquina con él (0 a 1)
  equipos: [
    { id: 'animales', nombre: 'Animales Locos', color: '#ff8a2a', super: 'zanahoria', nombreSuper: '¡ZANAHORIAZO!', vida: 40, pasos: 14, parada: 0.5, nivel: 0.5,
      jugadores: [['vaca', 'MechaVaca', 'portero'], ['ardilla', 'MadSquirrel', 'defensa'], ['zorro', 'SlyFox', 'medio'], ['bunny', 'CrazyBunny', 'delantero']] },
    { id: 'microblizz', nombre: 'Microblizz', color: '#3a6cff', super: 'carga', nombreSuper: '¡PANTALLAZO DE CARGA!', vida: 44, pasos: 18, parada: 0.55, nivel: 0.7,
      jugadores: [['survival', 'SurvivalBot', 'portero'], ['becario', 'Becario', 'defensa'], ['becario', 'Becario', 'medio'], ['ceo', 'El CEO', 'delantero']] },
    { id: 'nomuertos', nombre: 'No-Muertos', color: '#8a3ccf', super: 'fantasma', nombreSuper: '¡TIRO DE ULTRATUMBA!', vida: 50, pasos: 16, parada: 0.4, nivel: 0.35,
      jugadores: [['brute', 'StitchBrute', 'portero'], ['esqueleto', 'SkeletonCrew', 'defensa'], ['zombi', 'CrunchZombie', 'medio'], ['necro', 'NecroLord', 'delantero']] },
    { id: 'ciber', nombre: 'Ciberpunks', color: '#18d2e6', super: 'teletransporte', nombreSuper: '¡TIRO CUÁNTICO!', vida: 36, pasos: 12, parada: 0.6, nivel: 0.6,
      jugadores: [['mech', 'SiegeMech', 'portero'], ['hacker', 'HackerKid', 'defensa'], ['ninja', 'CyberNinja', 'medio'], ['marine', 'CyberMarine', 'delantero']] },
    { id: 'phony', nombre: 'Phony', color: '#e2b324', super: 'factura', nombreSuper: '¡FACTURA TRIPLE!', vida: 48, pasos: 16, parada: 0.65, nivel: 0.9,
      jugadores: [['caido', 'Servidor Caído', 'portero'], ['payplus', 'PayPlus', 'defensa'], ['licencia', 'LicenciaBot', 'medio'], ['presidente', 'El Presidente', 'delantero']] },
  ],
  // los tres campos: ancho, rebote en las vallas, bote del balón y su truco; clima = lo que pasa de vez en cuando
  campos: {
    atico:      { nombre: 'El Ático', fondo: 'fondo', ancho: 60, rebote: 0.55, bote: 0.45, deslizar: 0.93, barridaLarga: 1, viento: 7, charcos: [],
                  clima: 'racha', suelo: '#5d6470', franjas: ['#3fa34d', '#47b356'], lineas: 'rgba(255,255,255,.85)', truco: 'Viento: los balones altos se desvían' },
    parking:    { nombre: 'El Parking VIP', fondo: 'fondo-parking', ancho: 56, rebote: 0.6, bote: 0.4, deslizar: 0.975, barridaLarga: 1.6, viento: 0,
                  charcos: [[30, 18, 5], [68, 40, 5.5], [50, 50, 4], [22, 44, 4], [78, 14, 4]],
                  clima: 'aceite', suelo: '#2a2d33', franjas: ['#3b3f47', '#41454e'], lineas: 'rgba(255,214,60,.9)', truco: 'Asfalto mojado: barridas larguísimas y charcos de aceite' },
    servidores: { nombre: 'La Sala de Servidores', fondo: 'fondo-servidores', ancho: 40, rebote: 1.05, bote: 0.72, deslizar: 0.93, barridaLarga: 1, viento: 0, charcos: [],
                  clima: 'apagon', suelo: '#151a24', franjas: ['#4a5563', '#525e6d'], lineas: 'rgba(90,200,255,.9)', truco: 'Suelo duro y estrecho: botes altos y rebotes que aceleran' },
  },
  clima: { cada: 35, dura: 7 },     // cada cuánto llega el cambio de tiempo (de media) y cuánto dura
  // la Copa: los rivales por orden, cada uno en su campo (se salta el equipo que elijas)
  copa: [['nomuertos', 'atico'], ['ciber', 'servidores'], ['animales', 'atico'], ['microblizz', 'parking'], ['phony', 'servidores']],
  // sitio de cada puesto en su mitad (fracción del largo desde su portería, fracción del ancho)
  puestos: { portero: [0.02, 0.5], defensa: [0.22, 0.35], medio: [0.38, 0.65], delantero: [0.47, 0.5] },
});
