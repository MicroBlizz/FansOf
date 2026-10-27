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
    acel: 16,                 // m/s² a fondo
    nitroAcel: 22,            // m/s² extra con el nitro
    freno: 28,                // m/s² frenando
    retencion: 3,             // m/s² que frena el motor al soltar el gas
    marchaAtras: 9,           // velocidad máxima hacia atrás
    vmax: 44,                 // m/s (unos 160 km/h en el velocímetro)
    vmaxNitro: 54,
    rozamiento: 0.45,         // frenado natural por segundo (parte de la velocidad)
    giro: 2.4,                // radianes por segundo a plena velocidad de giro
    giroVel: 10,              // velocidad a la que el giro ya es pleno (parado casi no gira)
    giroRapido: 0.9,          // a tope de velocidad el giro se reduce a 1/(1+esto): el coche no «pivota»
    agarre: 13,               // cuánto se come el deslizamiento lateral por segundo (alto = de raíles)
    agarreDerrape: 2.4,       // con el derrape, el coche patina
    desliza: 0.35,            // parte del giro que se convierte en deslizamiento lateral (derrapando, deslizaDerrape)
    deslizaDerrape: 1.1,
    derrapeMin: 12,           // velocidad mínima para derrapar
    derrapeGiro: 1.5,         // cuánto más gira derrapando
    pendiente: 0.85,          // cuánto tira la gravedad por la pendiente (parte de g · pendiente)
    suelos: { asfalto: [1, 0, 1], acera: [0.95, 0.2, 0.9], hierba: [0.85, 0.5, 0.42], tierra: [0.85, 0.4, 0.5], nieve: [0.75, 0.6, 0.3] },   // [velocidad máxima, freno extra, agarre]: fuera del asfalto se corre casi igual pero se va de lado,   // por suelo: parte de la velocidad máxima y frenado extra por segundo
    radio: 1.5,               // radio del coche para los choques (es una caja de 2 x 4, se simplifica a un círculo)
    choqueFrena: 0.45,        // parte de la velocidad que se pierde contra un muro
    choqueFuerte: 12,         // a partir de esta velocidad un golpe es «choque» (corta el combo)
    escalon: 1.1,             // si el suelo sube más que esto de un paso a otro es un muro (taludes, trincheras): no se sube
    gravedad: 24,
    salto: 0.38,              // velocidad vertical = velocidad * esto al pasar una rampa
    rampaSube: 0.55,          // qué parte del largo de una rampa es la cuña (se salta al pasar por ella hacia arriba)
    nitroCarga: { derrape: 0.12, roce: 0.18, derribo: 0.6, salto: 0.25 },   // cuánto nitro da cada cosa (de 0 a 1)
    nitroGasto: 0.2,          // nitro que se gasta por segundo (lleno dura 5 s; Arkioner pidió el doble, 27-10-2026)
    nitroVelocidad: { desde: 0.75, carga: 0.04 },   // a más del 75 % de la velocidad máxima se recarga solo, despacio (por segundo)
  },
  // la física de verdad del coche (Rapier: carrocería con cuatro ruedas y suspensión). Las cifras de arriba (aceleración, velocidad
  // máxima, nitro, suelos) siguen mandando; estas son las del chasis y las ruedas
  fisica: {
    masa: 1200,               // kg
    caja: [0.9, 0.45, 2.0],   // medio ancho, medio alto y medio largo de la carrocería
    cajaAlto: 0.25,           // la carrocería va un poco por encima del centro de masas (así vuelca menos)
    centroMasas: -0.5,        // el centro de masas, bajo (casi a ras de suelo): al acelerar y frenar apenas cabecea, y la carrocería no roza el suelo
    ruedas: [0.82, 1.3],      // a qué distancia del centro van las ruedas: a lo ancho y a lo largo
    ruedaY: -0.2,             // altura del anclaje de las ruedas respecto al centro
    radioRueda: 0.36,
    suspension: 0.32,         // largo de la suspensión en reposo
    recorrido: 0.25,          // lo que puede comprimirse
    dureza: 50,               // dureza del muelle (sube = más seca)
    amortigua: [2.8, 3.6],    // amortiguación al comprimir y al estirarse
    agarre: 2.6,              // agarre de las ruedas (cuánto aguantan de lado antes de deslizar)
    agarreDerrape: 1.1,       // el agarre de las traseras con el derrape
    agarreLado: 1.0,          // rigidez del agarre lateral
    giroMax: 0.55,            // radianes de giro de las ruedas parado
    giroCae: 16,              // a esta velocidad el giro ya es la mitad
    frenoFuerza: 70,          // fuerza de freno por rueda (unidades de Rapier)
    frenoDerrape: 0,          // derrapando, las ruedas frenan solo esto (el freno sirve para cruzar el coche)
    derrapeConserva: 0.9,     // derrapando, parte de la velocidad perdida en cada paso que se devuelve
    apoyo: 0.6,               // carga aerodinámica: empuja hacia el suelo según la velocidad (kg por (m/s)²)
    giroTope: 2.2,            // radianes por segundo que puede girar el coche sobre sí mismo (sin esto, los trompos)
    giroDerrape: 1.9,         // derrapando, a cuánto gira el coche sobre sí mismo con el volante a tope
    derrapeMando: 10,         // lo rápido que el volante manda en el derrape
    estabiliza: 6,            // cuánto se frena el balanceo (vuelco) con las ruedas en el suelo
    nivela: 3,                // en el aire, cuánto se endereza solo
    volcado: 2,               // segundos volcado y parado antes de ponerse de pie solo
    golpe: 4,                 // m/s que se pierden de golpe en un paso para contar como choque
    radioCarga: 200,          // metros a los que se cargan los trozos sólidos
  },
  mundo: {
    ancho: 3100, largo: 2500, // metros del mundo entero (fuera, mar)
    nivelMar: -4,
    semilla: 7,               // el mundo se genera igual cada vez
    manzana: 48,              // lado de una manzana (fachada a fachada)
    calle: 14,                // ancho de calle (acera a acera)
    acera: 3,                 // acera a cada lado, dentro de la manzana
    carril: 3.4,              // separación del carril respecto al centro de la calle
    anchoMontaña: 11,         // ancho de las carreteras de montaña y de los enlaces
    anchoEnlace: 14,
    margen: 8,                // metros de tierra a cada lado de una carretera de montaña (se puede ir, pero mal)
    fundido: 30,              // metros en los que el terreno se funde con la altura de la carretera (taludes)
    ondas: 7,                 // metros de ondulación del suelo dentro de las ciudades (cuestas)
    colinas: 6,               // metros de las colinas fuera de las ciudades
    roca: 110, nieve: 170,    // alturas a partir de las que el suelo es roca y nieve
    distancia: 1000,          // del centro de la montaña al centro de cada ciudad
    montaña: { x: 1550, z: 1450, radio: 620, alto: 220, cima: 130, cimaAlto: 195, zigzag: 0.45, legs: 3, paso: 35, mirador: 26 },   // radio del pie, altura, radio y altura de la vuelta de la cima, amplitud (radianes) y vaivenes del zigzag, metros entre cruces, tamaño del mirador
    ciudades: [               // tres capítulos: cada una en una dirección desde la montaña (dx, dz), con su altura base y su falda (metros en los que baja al terreno)
      { id: 'bahia', nombre: 'Bahía Microblizz', dir: [-0.866, 0.5], nx: 10, nz: 10, base: 13, falda: 120 },
      { id: 'puerto', nombre: 'Puerto de Phony', dir: [0.866, 0.5], nx: 10, nz: 10, base: 11, falda: 120 },
      { id: 'iahorro', nombre: 'Ciudad IAhorro', dir: [0, -1], nx: 10, nz: 10, base: 26, falda: 160 },
    ],
    objetos: { celda: 64, porCelda: 3, lejosDeCarretera: 16 },   // árboles y rocas fuera de las ciudades: por celda de terreno
    trozo: 256,               // lado de un trozo del mundo (se cargan los cercanos)
    radioCarga: 330,          // metros a los que se cargan los trozos con detalle
    resSuelo: 48,             // divisiones del suelo de un trozo (alturas)
    resSueloTrinchera: 96,    // lo mismo en los trozos con bocas de túnel (celda de 2,7 m: el hueco no pasa de la franja de 4 m)
    resLejos: 16,             // metros entre vértices del suelo lejano (todo el mundo, sin detalle)
    texturaPxPorMetro: 3,     // nitidez del suelo pintado de un trozo
  },
  trafico: {
    coches: 40,
    lejos: 380,               // a esta distancia del jugador un coche se recicla y aparece cerca (entre `cercaMin` y `cercaMax`)
    cercaMin: 140, cercaMax: 320,
    vel: [11, 16],            // velocidad de crucero de cada coche, al azar entre estas
    frenaA: 16,               // metros a los que frena si tiene algo delante
    roce: 2.4,                // metros de margen para contar un «casi» (pasar rozando sin tocar)
    roceVel: 14,              // velocidad relativa mínima para que cuente el roce
    tumbado: 3,               // segundos que un coche del tráfico se queda parado tras un golpe
  },
  policia: {
    patrullas: 4,             // coches patrulla dando vueltas sin búsqueda
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
    cerca: 320,               // metros del jugador a los que aparecen
    viaje: [90, 520],         // metros mínimos y máximos de un viaje
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
  camara: { atras: 11, alto: 5, mira: 7, suave: 4, fov: [62, 78] },   // detrás del coche, altura, cuánto mira por delante, suavizado, campo de visión de parado a tope
  teclas: { izq: ['ArrowLeft', 'KeyA'], der: ['ArrowRight', 'KeyD'], gas: ['ArrowUp', 'KeyW'], freno: ['ArrowDown', 'KeyS', 'Space'], nitro: ['ShiftLeft', 'ShiftRight', 'KeyX'], accion: ['Enter', 'KeyE'] },
};
