// Fans Of Taxi · AJUSTES: el nombre del juego para core y TODAS las cifras del prototipo (coche, ciudad, tráfico, policía, pasajeros,
// eventos y propinas). Se carga antes de lo común. Cambiar el equilibrio del juego es tocar solo este archivo. Medidas en metros y segundos.
'use strict';
const AJUSTES = {
  id: 'taxi',                 // para core: la partida en la nube lleva este nombre
  guardado: 'for-taxi-v1',    // la clave de la partida en este navegador (dinero, récords, sonido)
};
const TAXI = {
  paso: 1 / 60,               // segundos de cada paso de la simulación (fijo y determinista: misma entrada, misma partida)
  coche: {
    acel: 14,                 // m/s² a fondo
    nitroAcel: 22,            // m/s² extra con el nitro
    freno: 26,                // m/s² frenando
    marchaAtras: 9,           // velocidad máxima hacia atrás
    vmax: 42,                 // m/s (unos 150 km/h en el velocímetro)
    vmaxNitro: 52,
    rozamiento: 0.35,         // frenado natural por segundo (parte de la velocidad)
    giro: 2.3,                // radianes por segundo a plena velocidad de giro
    giroVel: 12,              // velocidad a la que el giro ya es pleno (parado casi no gira)
    agarre: 7,                // cuánto se come el deslizamiento lateral por segundo (alto = de raíles)
    agarreDerrape: 1.6,       // con el derrape, el coche patina
    derrapeMin: 11,           // velocidad mínima para derrapar
    derrapeGiro: 1.45,        // cuánto más gira derrapando
    radio: 1.5,               // radio del coche para los choques (es una caja de 2 x 4, se simplifica a un círculo)
    choqueFrena: 0.45,        // parte de la velocidad que se pierde contra un muro
    choqueFuerte: 12,         // a partir de esta velocidad un golpe es «choque» (corta el combo)
    gravedad: 24,
    salto: 0.38,              // velocidad vertical = velocidad * esto al pasar una rampa
    nitroCarga: { derrape: 0.12, roce: 0.18, derribo: 0.6, salto: 0.25 },   // cuánto nitro da cada cosa (de 0 a 1)
    nitroGasto: 0.4,          // nitro que se gasta por segundo
  },
  ciudad: {
    nx: 7, nz: 7,             // manzanas
    manzana: 48,              // lado de una manzana (fachada a fachada)
    calle: 14,                // ancho de calle (acera a acera)
    acera: 3,                 // acera a cada lado, dentro de la manzana
    carril: 3.4,              // separación del carril respecto al centro de la calle
    semilla: 7,               // la ciudad se genera igual cada vez
    texturaPxPorMetro: 4,     // nitidez del suelo pintado
  },
  trafico: {
    coches: 34,
    vel: [11, 16],            // velocidad de crucero de cada coche, al azar entre estas
    frenaA: 16,               // metros a los que frena si tiene algo delante
    roce: 2.4,                // metros de margen para contar un «casi» (pasar rozando sin tocar)
    roceVel: 14,              // velocidad relativa mínima para que cuente el roce
    tumbado: 3,               // segundos que un coche del tráfico se queda parado tras un golpe
  },
  policia: {
    patrullas: 3,             // coches patrulla dando vueltas sin búsqueda
    porNivel: [0, 1, 3, 5],   // coches que persiguen según el nivel de búsqueda (0 a 3 en el prototipo)
    vel: [0, 24, 30, 35],     // su velocidad punta por nivel
    ver: 55,                  // distancia a la que te ven
    cono: 0.55,               // mitad del ángulo de visión (radianes)
    enfriar: [0, 10, 18, 28], // segundos sin que te vean para escapar, por nivel
    vida: 3,                  // golpes fuertes que aguanta un coche patrulla
    derriboVel: 13,           // si lo empujas contra algo a más de esto, cae
    empujon: 1.2,             // segundos tras tu golpe en los que su choque cuenta como derribo
    parar: 2.5,               // segundos casi parado con dos patrullas pegadas = te paran
    pegados: 9,               // metros
    calorChoque: 1,           // nivel que sube al chocar con una patrulla (desde 0)
  },
  pasajeros: {
    cuantos: 7,               // pasajeros esperando a la vez en el turno
    recoger: 5.5,             // metros para que suba (y casi parado)
    dejar: 6,                 // metros del destino
    paradoVel: 2.5,
    subir: 0.9,               // segundos que tarda en subir o bajar
    velPar: 15,               // m/s con los que se calcula el tiempo «par» del viaje
    paciencia: 2.2,           // su propio reloj = par * esto
    colores: [                // por distancia del viaje: hasta estos metros, color y tarifa base
      { hasta: 90, color: 0x7ee04a, nombre: 'verde', tarifa: 60 },
      { hasta: 170, color: 0xffcb3d, nombre: 'amarillo', tarifa: 120 },
      { hasta: 260, color: 0xff7a1a, nombre: 'naranja', tarifa: 200 },
      { hasta: 1e9, color: 0xff4b5c, nombre: 'rojo', tarifa: 320 },
    ],
    porMetro: 0.9,            // dinero extra por metro de viaje
    bonos: [[0.55, 12, 'RAPIDÍSIMO'], [0.85, 6, 'BIEN'], [1.2, 2, 'JUSTO']],   // parte del par en que llegas → segundos de reloj y etiqueta
  },
  turno: { inicio: 60, max: 99 },    // segundos del reloj del turno de taxi
  propinas: { roce: 15, salto: 25, derrape: 20, derrapeMin: 1.2, derribo: 80, comboMax: 4, comboSube: 3 },   // dinero y combo
  eventos: {
    sprint: { rivales: 3, vel: [21, 25], goma: 4, premio: [400, 200, 100] },   // velocidad de los rivales, goma elástica (m/s de más cuando van detrás), dinero por puesto
    huida: { dura: 60, nivel: 2, premio: 350 },                                 // sobrevive a la persecución
    radio: 6,                 // metros de la salida de un evento para arrancarlo
  },
  camara: { atras: 11, alto: 5.5, mira: 6, suave: 4, fov: [62, 78] },   // detrás del coche, altura, cuánto mira por delante, suavizado, campo de visión de parado a tope
  teclas: { izq: ['ArrowLeft', 'KeyA'], der: ['ArrowRight', 'KeyD'], gas: ['ArrowUp', 'KeyW'], freno: ['ArrowDown', 'KeyS', 'Space'], nitro: ['ShiftLeft', 'ShiftRight', 'KeyX'], accion: ['Enter', 'KeyE'] },
};
