// Fans of Air · Ajustes: los tres cazas de los Animales Locos, los enemigos de Microblizz (aire y tierra), armas, tiempos y la misión.
'use strict';
const AJUSTES = {
  id: 'air',                  // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-air',     // la clave de la partida en este navegador
};
var AIR = globalThis.AIR || (globalThis.AIR = {});
AIR.AJ = Object.freeze({
  // Los cazas: vel = lo rápido que se mueve por la pantalla; escudo = vida; fijar = segundos con la retícula encima para fijar un
  // misil; sigilo = cuánto les cuesta apuntarte a los enemigos (menos = disparan menos); radioBomba = tamaño de sus explosiones;
  // rabia = cuánto acelera la ametralladora cada derribo seguido (solo CrazyBunny)
  cazas: [
    { id: 'bunny', nombre: 'Zanahoria Uno', piloto: 'CrazyBunny', color: '#ff8a2a', vel: 1.0, escudo: 100, misiles: 6, bombas: 8,
      fijar: 0.6, sigilo: 1, radioBomba: 1, rabia: 0.18, texto: 'Equilibrado. RABIA: cada derribo seguido dispara más rápido.' },
    { id: 'zorro', nombre: 'Zorra Invisible', piloto: 'SlyFox', color: '#e0521a', vel: 1.3, escudo: 70, misiles: 8, bombas: 6,
      fijar: 0.5, sigilo: 0.5, radioBomba: 1, rabia: 0, texto: 'Rápida y sigilosa: a los becarios les cuesta el doble apuntarte.' },
    { id: 'castor', nombre: 'Castor Bombardero', piloto: 'BoomBeaver', color: '#a86a32', vel: 0.8, escudo: 150, misiles: 4, bombas: 12,
      fijar: 0.4, sigilo: 1.2, radioBomba: 1.5, rabia: 0, texto: 'Blindado y lento, con más bombas y explosiones más grandes.' },
  ],
  // Fase 1, el aire (falso 3D): el jugador se mueve en x (-300..300) e y (-180..180); los enemigos vienen desde z lejano hasta 0
  aire: {
    limites: { x: 300, y: 180 }, velBase: 420, zLejos: 1300, zCerca: 0,
    bala: { vel: 1100, cada: 0.11, alcance: 1400, dano: 1, radio: 48, radioZ: 50 },
    misil: { vel: 650, dano: 5, radio: 60, radioZ: 50, giro: 900 },
    tiro: { vel: 700, radio: 46, dano: 10 },           // disparos enemigos (gotas de café, cajas, cartas de despido)
    choque: { radio: 60, dano: 20 },                   // un enemigo que pasa pegado al jugador
    derribos: 12,                                      // derribos para que salga el jefe
    oleada: { maximo: 5, cada: 1.1 },                  // enemigos a la vez y segundos entre apariciones
    enemigos: {
      becario: { vida: 1, vel: 260, radio: 34, puntos: 100, dispara: 2.6, zMinTiro: 350, balanceo: 90, tiro: 'cafe' },
      caja:    { vida: 3, vel: 170, radio: 60, puntos: 300, dispara: 2.0, zMinTiro: 400, balanceo: 40, tiro: 'caja' },
    },
    jefe: { vida: 40, vel: 220, radio: 90, puntos: 2000, dispara: 0.9, rafaga: 3, z: 520, puntosGolpe: 20, tiro: 'carta' },
  },
  // Fase 2, la tierra (vista isométrica como el original): un mapa grande por el que el caza vuela libre sin pararse (es un
  // reactor), virando hacia donde empujas la palanca; la flecha del HUD señala el objetivo primario más cercano
  tierra: {
    ancho: 3200, alto: 2400, vel: 240, giro: 3.0, radioJugador: 26, margen: 60,
    bala: { vel: 900, cada: 0.12, dano: 1, radio: 14, alcance: 650 },
    bomba: { cae: 0.6, radio: 95, dano: 4, delante: 150 },    // tarda `cae` segundos en estallar, cae `delante` px por delante del caza
    tiro: { vel: 300, radio: 12, dano: 8, alcance: 620, recorrido: 900 },   // las defensas disparan si estás a menos de `alcance`
    objetivos: {
      oficina:  { vida: 3, radio: 70, puntos: 300, dispara: 0, mueve: 0, primario: true },
      servidor: { vida: 2, radio: 60, puntos: 400, dispara: 0, mueve: 0, primario: true },
      torreta:  { vida: 2, radio: 36, puntos: 200, dispara: 1.8, mueve: 0, primario: false },
      tanque:   { vida: 2, radio: 40, puntos: 250, dispara: 2.4, mueve: 70, primario: false },
      torre:    { vida: 12, radio: 110, puntos: 5000, dispara: 1.1, mueve: 0, primario: true, final: true },
    },
    // las zonas de asfalto de la base (la vista las pinta grises) y dónde está cada cosa; los tanques patrullan por su zona
    bases: [{ x: 300, y: 300, w: 700, h: 500 }, { x: 1900, y: 200, w: 900, h: 600 }, { x: 400, y: 1500, w: 800, h: 600 }, { x: 1800, y: 1400, w: 1100, h: 800 }],
    mapa: [
      { tipo: 'oficina', x: 520, y: 620 }, { tipo: 'torreta', x: 380, y: 760 }, { tipo: 'tanque', x: 820, y: 400 },
      { tipo: 'servidor', x: 2200, y: 420 }, { tipo: 'torreta', x: 2650, y: 300 }, { tipo: 'oficina', x: 2500, y: 650 }, { tipo: 'tanque', x: 2000, y: 700 },
      { tipo: 'oficina', x: 700, y: 1750 }, { tipo: 'torreta', x: 1050, y: 1600 }, { tipo: 'servidor', x: 520, y: 1950 },
      { tipo: 'torre', x: 2350, y: 1800 }, { tipo: 'torreta', x: 1950, y: 1550 }, { tipo: 'torreta', x: 2750, y: 2050 }, { tipo: 'tanque', x: 2300, y: 2150 }, { tipo: 'servidor', x: 2700, y: 1500 },
    ],
    inicio: { x: 1100, y: 2250, rumbo: -Math.PI / 2 },   // donde empieza el caza (abajo, mirando arriba, con la base de la izquierda cerca)
  },
  puntos: { escudoRestante: 10, precision: 1500 },   // bonus final: por punto de escudo y por acertar
});
