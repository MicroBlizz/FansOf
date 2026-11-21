// Fans of Pinball · AJUSTES · MESA: la mesa de dos niveles como DATOS que leen el dominio (choques) y la pantalla (dibujo). Una sola mesa
// alta en coordenadas de mundo: x de 0 a 180 hacia la derecha, y de 0 (arriba) a 640 (abajo); 1 unidad = 1 píxel del lienzo. Nivel de
// arriba y de 0 a 320, nivel de abajo de 320 a 640. Paredes = segmentos [x1, y1, x2, y2]. Ángulo de pala: 0 apunta a la derecha y crece
// en el sentido de las agujas del reloj (porque y crece hacia abajo). Decorado grande FIJO (opción B de Pepins, 20-11-2026): ascensor
// arriba en el centro (la salida), tienda de Lola arriba a la izquierda, tres máquinas de café en triángulo, fotocopiadora a la derecha
// (la rampa sube por dentro), rebotadores sobre las palas de abajo y carriles de salida a los lados. El centro de cada nivel queda libre
// para lo que cambia en cada planta (zonas). Ninguna esquina deja encajar la bola (tests/pinball/integracion/rincones.test.mjs).
'use strict';
AJUSTES.mesa = PB.congela({
  ancho: 180,                   // (encargo) ancho lógico de la mesa
  alto: 640,                    // (espec.: dos pantallas de alto)
  niveles: [{ id: 'arriba', y0: 0, y1: 320 }, { id: 'abajo', y0: 320, y1: 640 }],
  paredes: [
    // nivel de arriba: techo, tejados que llevan a la boca del ascensor, arco curvo con un carril y la pared derecha
    [0, 0, 180, 0],
    [0, 64, 16, 64], [48, 64, 62, 64], [62, 64, 68, 46],          // fachada de la tienda (con su puerta entre 16 y 48) y tejado izquierdo
    [112, 46, 128, 60],                                           // tejado derecho del ascensor
    [128, 0, 150, 6], [150, 6, 166, 18], [166, 18, 176, 36], [176, 36, 180, 60],   // arco curvo arriba a la derecha
    [146, 16, 146, 34],                                           // el separador de los dos carriles del arco
    [180, 0, 180, 100],
    // la fotocopiadora (bloque a la derecha): tejado inclinado, cara izquierda y bajos inclinados (nada horizontal: la bola no se para)
    [140, 118, 180, 100], [140, 118, 140, 206], [140, 206, 180, 236],
    [0, 64, 0, 640], [180, 236, 180, 640],                        // laterales
    [0, 240, 41, 287], [180, 236, 139, 287],                      // embudo del nivel de arriba (guía a sus palas; por debajo, techo del de abajo)
    // nivel de abajo: separadores de los carriles de salida, guías de los carriles de vuelta hasta las palas y el suelo
    [27, 480, 27, 640], [153, 480, 153, 640],
    [27, 548, 37, 578], [153, 548, 143, 578],
    [0, 640, 180, 640],
  ],
  // rebotadores triangulares sobre las palas de abajo: la cara de dentro (a → c) da patada; las otras dos son pared
  rebotadores: [
    { lado: 'izquierdo', a: [54, 470], b: [54, 506], c: [70, 516] },
    { lado: 'derecho', a: [126, 470], b: [126, 506], c: [110, 516] },
  ],
  // las palas: pivote (x, y), largo, grosor (radio de la cápsula) y ángulos en reposo y arriba
  palas: [
    { id: 'abajo-izq', nivel: 'abajo', lado: 'izquierda', x: 40, y: 582, largo: 36, grosor: 4.5, reposo: 0.5, arriba: -0.42 },
    { id: 'abajo-der', nivel: 'abajo', lado: 'derecha', x: 140, y: 582, largo: 36, grosor: 4.5, reposo: Math.PI - 0.5, arriba: Math.PI + 0.42 },
    { id: 'arriba-izq', nivel: 'arriba', lado: 'izquierda', x: 44, y: 290, largo: 30, grosor: 4.5, reposo: 0.45, arriba: -0.42 },
    { id: 'arriba-der', nivel: 'arriba', lado: 'derecha', x: 136, y: 290, largo: 30, grosor: 4.5, reposo: Math.PI - 0.45, arriba: Math.PI + 0.42 },
  ],
  velocidadSube: 24,            // (partida) radianes/s de la pala al subir (punta de la pala grande a unas 860 u/s, con el tope de la bola en 700)
  velocidadBaja: 14,            // (partida) radianes/s al bajar
  // el ASCENSOR (la salida; antes, la escalera), arriba en el centro: marcos laterales siempre; las puertas solo mientras está cerrado
  escalera: { x0: 68, x1: 112, fondo: 46, entra: 54 },   // entra: la bola entra cuando su centro sube por encima de esta y entre los marcos (al rozar la puerta)
  // la TIENDA DE LOLA, arriba a la izquierda: su puerta está en la fachada (y = fondo) entre x0 y x1; dentro, un hueco hasta `techo`
  tienda: { x0: 16, x1: 48, fondo: 64, techo: 44, entra: 60, sale: { x: 32, y: 80, vx: 70, vy: 120 } },
  // las tres MÁQUINAS DE CAFÉ (parachoques fijos, en triángulo en el centro del nivel de arriba)
  maquinas: [[44, 112], [100, 112], [72, 154]],
  radioMaquina: 14,             // (partida) el dibujo mide 32: el radio de choque deja el contorno fuera
  // la FOTOCOPIADORA (decorado, para el dibujo): la rampa sube por dentro y escupe la bola por su bandeja (salida de la rampa)
  fotocopiadora: { x: 140, y: 104, ancho: 40, alto: 96 },
  // la rampa: la bola que sube por la derecha del nivel de abajo (bajo el embudo) entra y viaja hasta la fotocopiadora
  rampa: { x0: 142, y0: 300, y1: 340, camino: [[160, 330], [158, 168]], segundos: 0.55, premio: 'fotocopia',
    salida: { x: 127, y: 156, vx: -190, vy: -60 } },
  lanzador: { camino: [[168, 630], [156, 66]], segundos: 0.9, salida: { x: 156, y: 66, vx: -40, vy: 0 } },   // (espec.) la bola sale sola hasta arriba
  desague: 624,                 // la bola cuyo centro pasa de esta se pierde (cayó entre las palas de abajo o por un carril de salida)
  salvavidas: { x: 90, y: 610, vy: -520 },        // desde dónde rebota la bola con la mejora Salvavidas
  // dónde puede generar cosas el generador de salas (rectángulos de centros): el centro de cada nivel, lejos del decorado fijo
  zonas: { arriba: { x0: 14, x1: 128, y0: 70, y1: 262 }, abajo: { x0: 16, x1: 164, y0: 330, y1: 476 } },
  // círculos que el generador deja libres: la boca del ascensor, la puerta de la tienda, las salidas de la rampa y del lanzador
  prohibidas: [{ x: 90, y: 64, r: 20 }, { x: 32, y: 80, r: 18 }, { x: 127, y: 156, r: 16 }, { x: 156, y: 70, r: 18 }, { x: 160, y: 318, r: 24 }],
  margen: 26,                   // (partida) hueco mínimo entre dos cosas o entre una cosa y una pared: que quepa la bola más gorda (13,4 de radio)
  primerasVasijas: [[90, 445], [46, 420], [134, 420]],   // (espec., primer minuto) 3 vasijas justo encima de las palas en la planta 1
});
