// Tiny Fans · AJUSTES · EXPEDICIÓN: el becario y su batería, la grapadora, los voltios y las mejoras, los bichos, el gigante, los trucos
// escondidos, el botín y la mochila (docs/tiny/PROTOTIPO.md, con las tablas del panel y las decisiones del integrador). Distancias en
// unidades del mundo, tiempos en segundos, batería en puntos. Dueño: N3 (dominio de la expedición).
'use strict';
AJUSTES.becario = TN.congela({
  velocidad: 3,                 // (cuaderno) unidades por segundo: cruzar el mapa son 40 segundos
  radio: 0.45,                  // (partida) lo que ocupa para chocar
  bateria: 100,                 // (cuaderno) la vida es la batería
  gastoPorSegundo: 100 / 180,   // (cuaderno) fuera del nido se gasta sola en unos 3 minutos
  bateriaRoja: { desde: 15, gasto: 0.5 },   // (cuaderno + partida) por debajo de 15, el gasto por tiempo cuenta la mitad, sin decirlo
  bateriaBaja: 25,              // (partida) desde aquí, aviso de batería baja (borde rojo, vibración y sonido)
  pila: { recarga: 25, solaDesde: 10 },     // (cuaderno) una pila recarga 25; (partida) por debajo de 10 la gasta solo
});
AJUSTES.arma = TN.congela({
  // (cuaderno) 5 de daño cada 0,5 s al bicho más cercano; (decisión) alcance 4, para no disparar fuera de pantalla
  grapadora: { dano: 5, cada: 0.5, alcance: 4 },
});
AJUSTES.voltios = TN.congela({
  porBicho: { hormiga: 1, arana: 3, cucaracha: 5 },   // (cuaderno)
  iman: 3,                      // (partida) las bolitas vuelan solas al becario si está a menos de esto
  vuela: 12,                    // (partida) a qué velocidad vuelan hacia él
  coge: 0.6,                    // (partida) a esta distancia ya son suyas
  primera: 10, masPorMejora: 5, // (cuaderno) la primera mejora con 10 voltios y cada una pide 5 más: 10, 15, 20…
  ofrece: 3,                    // (cuaderno) se elige 1 de 3
});
AJUSTES.mejoras = TN.congela({
  niveles: 3,                   // (cuaderno) hasta 3 niveles cada una; solo duran esa expedición
  // efecto por nivel: (partida) café; (decisión, P4) grapa a otro bicho, +2 de daño y la batería dura un 20 % más
  lista: {
    'grapa-doble': { grapas: 1 },         // una grapa más, a otro bicho (si solo hay uno, al mismo)
    'punta-afilada': { dano: 2 },         // +2 de daño por grapa: 7, 9 y 11
    'cafe-cargado': { velocidad: 0.12 },  // un 12 % más rápido
    'pila-repuesto': { dura: 0.2 },       // la batería dura un 20 % más (el gasto se divide entre 1,2, 1,4 y 1,6)
  },
});
AJUSTES.bichos = TN.congela({
  // (cuaderno) vida y batería que quitan por golpe; (partida) velocidad en unidades por segundo
  clases: {
    hormiga: { vida: 10, dano: 4, velocidad: 2.6 },   // van en grupos de 4 a 6 y rodean
    arana: { vida: 30, dano: 8, velocidad: 1.6, tela: { freno: 0.5, segundos: 2 } },   // espera en su tela, que frena a la mitad 2 s
    cucaracha: { vida: 60, dano: 10, velocidad: 1.4 },
  },
  radio: 0.4,                   // (partida) lo que ocupa un bicho para chocar con los muebles
  persigue: 8,                  // (partida) te persigue si estás a menos de 8 unidades
  rodea: { desde: 2.5, radio: 0.7 },   // (partida) a menos de 2,5 las hormigas buscan su hueco alrededor del becario
  muerde: { alcance: 0.95, cada: 1.3, primero: 0.4, entreMordiscos: 0.6 },   // (probadores) entreMordiscos: un enjambre muerde por turnos, no todos a la vez   // (partida) distancia de mordisco, segundos entre dos y espera al tocar
  despierta: { desde: 17, hasta: 22 },   // (decisión, P3) un punto dormido despierta con el becario a esta distancia: nacen fuera de pantalla
  tope: 28,                     // (probadores) bichos despiertos a la vez; si se pasa, la oleada espera
  // (cuaderno) cada minuto fuera sale un 25 % más de bichos: está ya dentro de la tabla de oleadas (P3, x1; 1,25; 1,56; 1,95; 2,44)
  masPorMinuto: 0.25,
  // (decisión, P3) oleada cazadora cada 20 s: nace a 18 del becario por el lado contrario al nido (desde los 2 min, por cualquier lado)
  oleadas: {
    cada: 20, distancia: 18, abanico: 1.05,
    tabla: [
      { desde: 30, hormigas: 5, cucarachas: 0, cualquierLado: false },
      { desde: 60, hormigas: 6, cucarachas: 0, cualquierLado: false },
      { desde: 120, hormigas: 8, cucarachas: 1, cualquierLado: true },
      { desde: 180, hormigas: 10, cucarachas: 1, cualquierLado: true },
      { desde: 240, hormigas: 12, cucarachas: 2, cualquierLado: true },
    ],
  },
  // (partida, P3) los bichos fijos de cada zona: grupos de hormigas, arañas (en las telas de esa zona) y cucarachas
  reparto: [
    { donde: 'cerca', grupos: [4, 4], aranas: 0, cucarachas: 0 },
    { donde: 'medio', grupos: [5, 5, 5], aranas: 4, cucarachas: 1 },
    { donde: 'lejos', grupos: [6, 6, 6], aranas: 3, cucarachas: 3 },
    { donde: 'papelera', grupos: [4], aranas: 0, cucarachas: 2 },
    { donde: 'taza', grupos: [6], aranas: 0, cucarachas: 1 },
    { donde: 'cajon', grupos: [], aranas: 1, cucarachas: 2 },
  ],
});
AJUSTES.gigante = TN.congela({
  veces: [1, 2], nuncaAntesDe: 30,   // (cuaderno) pasa 1 o 2 veces, nunca en los primeros 30 segundos y nunca pisa el nido
  aviso: 3, radio: 4,                // (decisión) la sombra avisa 3 s antes; (partida) mide 4 unidades de radio
  dano: 40, lanza: 6,                // (cuaderno) quita 40 y lanza al becario; (partida) 6 unidades
  noTumbaConMasDe: 40,               // (cuaderno) nunca lo tumba de un golpe si tiene más de 40
  gracia: { borde: 0.2, segundos: 0.2 },   // (cuaderno) el borde de la sombra (una quinta parte) no hace daño y hay 2 décimas extra
  pisadaCada: 15, lado: 3, paso: 1.2,      // (P3 + partida) una pisada cada 15 unidades, 3 a cada lado de la línea, cada 1,2 s
  // (P3) las pasadas: el empleado va a por café y vuelve. prob: cuántas salidas la tienen
  pasadas: [
    { desde: 40, hasta: 80, de: [-6, 58], a: [34, -34], prob: 1 },
    { desde: 110, hasta: 150, de: [38, -34], a: [-58, -20], prob: 0.5 },
  ],
});
AJUSTES.trucos = TN.congela({        // (cuaderno) solo en la expedición, nunca en el asalto
  primerMordiscoGratis: true,        // el primer mordisco de un bicho que no habías visto no te da
  vista: { ancho: 4.5, alto: 10, segundos: 1 },   // (partida) «visto»: 1 s dentro de lo que enseña la pantalla alrededor del becario
  calientan: { segundos: 30, velocidad: 0.6, esperaAtaque: 1.2 },   // los primeros 30 s van torpes; (P3) cuánto
  // (probadores) la primera salida de una partida: tres montones de cartón a la vista del nido y ningún bicho a menos de `sinBichosA`
  primeraSalida: { sinBichosA: 11, botin: [{ material: 'carton', cantidad: 5, x: 7.5, z: 2.5 }, { material: 'carton', cantidad: 5, x: 3, z: 9 }, { material: 'grapas', cantidad: 4, x: 10.5, z: 7.5 }] },
  seAdapta: { caidasSeguidas: 2, menosBichos: 0.25 },             // tras 2 caídas seguidas, un 25 % menos de bichos
});
AJUSTES.botin = TN.congela({
  // (cuaderno) cinco materiales: blancos (comunes) y verdes
  materiales: { carton: 'blanco', grapas: 'blanco', migas: 'blanco', plastico: 'verde', pilas: 'verde' },
  expedicionBuena: [60, 100],        // (cuaderno) una expedición buena trae de 60 a 100 unidades (con 8 huecos, de 60 a 80)
  recoge: 1.5,                       // (probadores) se coge estando a menos de esto
  coge: 0.8,                         // (probadores) segundos cerca de un montón para cogerlo: basta pasar por encima despacio
  // (P3 + P4) los montones de cada zona: cuántos, de cuánto y de qué (pesos o lista fija); las pilas van de una en una
  reparto: [
    { donde: 'cerca', montones: 8, cantidad: 3, pesos: { carton: 0.4, grapas: 0.45, migas: 0.15 }, pilas: 1 },
    { donde: 'medio', montones: 10, cantidad: 5, pesos: { plastico: 0.5, carton: 0.2, grapas: 0.2, migas: 0.1 }, pilas: 2 },
    { donde: 'lejos', montones: 8, cantidad: 8, pesos: { plastico: 0.5, carton: 0.2, grapas: 0.2, migas: 0.1 }, pilas: 2 },
    { donde: 'papelera', lista: ['carton', 'grapas', 'plastico'], cantidad: 10, pilas: 1 },
    { donde: 'taza', lista: ['migas', 'migas', 'plastico'], cantidad: 10, pilas: 1 },
    { donde: 'cajon', lista: ['grapas', 'grapas', 'plastico'], cantidad: 10, pilas: 1 },
  ],
});
AJUSTES.mochila = TN.congela({
  huecos: 8, porHueco: 10,           // (cuaderno) 8 huecos de 10 unidades del mismo material
  caidaHoras: 4,                     // (cuaderno) la mochila caída se queda en el suelo 4 horas
});
AJUSTES.expedicion = TN.congela({
  fueraMinimo: 3,                    // (partida) se vuelve al entrar en el nido tras haber estado fuera al menos 3 segundos
  felpudo: 0.7,                      // (decisión) segundos en el felpudo (dentro del nido) para volver
});
