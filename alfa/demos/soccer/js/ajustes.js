// Fans of Soccer · Ajustes: medidas del campo, velocidades, tiempos y los dos equipos (Animales Locos contra Microblizz).
'use strict';
const AJUSTES = {
  id: 'soccer',                  // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-soccer',     // la clave de la partida en este navegador
};
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
SOCCER.AJ = Object.freeze({
  largo: 100, ancho: 60,            // campo en metros: x de portería a portería, y de fondo (0) a cerca (60)
  porteria: { y1: 24, y2: 36, alto: 4 },
  duracion: 180,                    // segundos de partido
  vel: { jugador: 9, portero: 12, conBalon: 8, barrida: 22, tiro: 40, pase: 27, superTiro: 58 },
  barrida: { dura: 0.38, alcance: 2.6, mareo: 2.4, mareoSinBalon: 1.4, espera: 0.9 },
  coger: 2.0,                       // distancia para hacerse con el balón
  gravedad: 30, roce: 0.985, rebote: 0.55,
  energia: { porSegundo: 0.5, barrida: 4, pase: 2, max: 100 },
  ia: { distTiro: 22, presion: 4.5, pensar: 0.25 },
  equipos: [
    { nombre: 'Animales Locos', color: '#ff8a2a', super: 'zanahoria',
      jugadores: [['vaca', 'MechaVaca', 'portero'], ['ardilla', 'MadSquirrel', 'defensa'], ['zorro', 'SlyFox', 'medio'], ['bunny', 'CrazyBunny', 'delantero']] },
    { nombre: 'Microblizz', color: '#3a6cff', super: 'chilena',
      jugadores: [['survival', 'SurvivalBot', 'portero'], ['becario', 'Becario', 'defensa'], ['becario', 'Becario', 'medio'], ['ceo', 'El CEO', 'delantero']] },
  ],
  // los tres campos del diseño: ancho del campo, rebote en las vallas y su truco
  campos: {
    atico:      { nombre: 'El Ático', fondo: 'fondo', ancho: 60, rebote: 0.55, deslizar: 0.93, barridaLarga: 1, viento: 7, charcos: [],
                  suelo: '#5d6470', franjas: ['#3fa34d', '#47b356'], lineas: 'rgba(255,255,255,.85)', truco: 'Viento: los balones altos se desvían' },
    parking:    { nombre: 'El Parking VIP', fondo: 'fondo-parking', ancho: 56, rebote: 0.6, deslizar: 0.975, barridaLarga: 1.6, viento: 0,
                  charcos: [[30, 18, 5], [68, 40, 5.5], [50, 50, 4], [22, 44, 4], [78, 14, 4]],
                  suelo: '#2a2d33', franjas: ['#3b3f47', '#41454e'], lineas: 'rgba(255,214,60,.9)', truco: 'Asfalto mojado: barridas larguísimas y charcos de aceite' },
    servidores: { nombre: 'La Sala de Servidores', fondo: 'fondo-servidores', ancho: 40, rebote: 1.05, deslizar: 0.93, barridaLarga: 1, viento: 0, charcos: [],
                  suelo: '#151a24', franjas: ['#4a5563', '#525e6d'], lineas: 'rgba(90,200,255,.9)', truco: 'Campo estrecho: el balón sale disparado de las paredes' },
  },
  // sitio de cada puesto en su mitad (fracción del largo desde su portería, fracción del ancho)
  puestos: { portero: [0.02, 0.5], defensa: [0.22, 0.35], medio: [0.38, 0.65], delantero: [0.47, 0.5] },
});
