// Fans of Air · Ajustes: los tres cazas de los Animales Locos, los enemigos de Microblizz (aire y tierra), armas, tiempos y la misión.
'use strict';
const AJUSTES = {
  id: 'air',                  // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-air',     // la clave de la partida en este navegador
};
var AIR = globalThis.AIR || (globalThis.AIR = {});
AIR.AJ = Object.freeze({
  // Los cazas: vel = velocidad de crucero y lo rápido que maniobra (1 = normal); escudo = vida; fijar = segundos con la retícula
  // encima para fijar un misil; sigilo = cuánto les cuesta apuntarte a los enemigos (menos = disparan menos); radioBomba = tamaño
  // de sus explosiones; rabia = cuánto acelera la ametralladora cada derribo seguido (solo CrazyBunny)
  cazas: [
    { id: 'bunny', nombre: 'Zanahoria Uno', piloto: 'CrazyBunny', color: '#ff8a2a', vel: 1.0, escudo: 100, misiles: 6, bombas: 8,
      fijar: 0.6, sigilo: 1, radioBomba: 1, rabia: 0.18, texto: 'Equilibrado. RABIA: cada derribo seguido dispara más rápido.' },
    { id: 'zorro', nombre: 'Zorra Invisible', piloto: 'SlyFox', color: '#e0521a', vel: 1.3, escudo: 70, misiles: 8, bombas: 6,
      fijar: 0.5, sigilo: 0.5, radioBomba: 1, rabia: 0, texto: 'Rápida y sigilosa: a los becarios les cuesta el doble apuntarte.' },
    { id: 'castor', nombre: 'Castor Bombardero', piloto: 'BoomBeaver', color: '#a86a32', vel: 0.8, escudo: 150, misiles: 4, bombas: 12,
      fijar: 0.4, sigilo: 1.2, radioBomba: 1.5, rabia: 0, texto: 'Blindado y lento, con más bombas y explosiones más grandes.' },
  ],
  // Combustible de toda la misión, en segundos de vuelo; si se acaba, misión fallida. Los bidones de los enemigos lo recargan
  combustible: { max: 210, aviso: 35 },
  // Fase 1, el aire: vuelo de verdad en 3D (metros). x este, y altura, z norte. El caza va siempre hacia delante; la palanca a los
  // lados lo alabea (inclinado, vira solo) y arriba o abajo lo cabecea; puede dar la vuelta entera y volar boca abajo
  aire: {
    vuelo: { vel: 120, velMin: 65, velMax: 210, alabeo: 2.4, cabeceo: 1.15, viraje: 0.95, nivelar: 1.4, gravedad: 28,
      altInicio: 700, altMax: 2400, altAviso: 220, perdida: 0.9, aviso: 1.6 },   // perdida: lo que cae el morro (rad/s) arriba del todo o lento
    bala: { vel: 700, cada: 0.1, vida: 1.3, dano: 1, radio: 4 },
    misil: { vel: 360, giro: 2.6, vida: 5, dano: 5, radio: 8, cono: 0.13, alcance: 1800 },   // cono: lo centrado que tiene que estar para fijarlo
    tiro: { vel: 300, radio: 16, dano: 10, vida: 6 },   // disparos enemigos (gotas de café, cajas, cartas de despido), apuntan adonde vas a estar
    choque: { radio: 22, dano: 20 },                     // un enemigo que te pasa pegado
    derribos: 6,                                         // derribos de la misión para que salga el jefe (en el original, de 3 a 9)
    oleada: { maximo: 2, cada: 3.5, cerca: 1300, lejos: 2200 },   // enemigos a la vez, segundos entre apariciones y a qué distancia salen
    enemigos: {
      becario: { vida: 1, vel: 95, giro: 0.9, radio: 14, puntos: 100, dispara: 2.6, cono: 0.35, alcanceTiro: 1100, tiro: 'cafe', premio: 0.6 },
      caja:    { vida: 3, vel: 75, giro: 0.6, radio: 22, puntos: 300, dispara: 2.0, cono: 0.45, alcanceTiro: 1200, tiro: 'caja', premio: 1 },
    },
    jefe: { vida: 30, vel: 85, giro: 0.75, radio: 34, puntos: 2000, dispara: 1.1, rafaga: 3, puntosGolpe: 20, tiro: 'carta', cono: 0.5, alcanceTiro: 1300, premio: 0 },
    // los premios que sueltan los enemigos derribados: caen en paracaídas y, si pasas cerca, vienen solos hacia ti
    premios: { tipos: [['misiles', 3], ['bombas', 3], ['reparacion', 2], ['combustible', 2]], cae: 12, iman: 380, coger: 40, vida: 25,
      misiles: 2, bombas: 3, bombasExtra: 6, reparacion: 25, combustible: 45 },
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
