// Tiny Fans · AJUSTES · EXPEDICIÓN: el becario y su batería, la grapadora, los voltios y las mejoras, los bichos, el gigante, los trucos
// escondidos, el botín y la mochila (docs/tiny/PROTOTIPO.md). Distancias en unidades del mundo, tiempos en segundos, batería en puntos.
// Dueño: N3 (dominio de la expedición).
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
  grapadora: { dano: 5, cada: 0.5, alcance: 5 },   // (cuaderno) 5 de daño cada 0,5 s al bicho más cercano; (partida) alcance 5
});
AJUSTES.voltios = TN.congela({
  porBicho: { hormiga: 1, arana: 3, cucaracha: 5 },   // (cuaderno)
  iman: 3,                      // (partida) las bolitas vuelan solas al becario si está a menos de esto
  primera: 10, masPorMejora: 5, // (cuaderno) la primera mejora con 10 voltios y cada una pide 5 más: 10, 15, 20…
  ofrece: 3,                    // (cuaderno) se elige 1 de 3
});
AJUSTES.mejoras = TN.congela({
  niveles: 3,                   // (cuaderno) hasta 3 niveles cada una; solo duran esa expedición
  // (partida) efecto por nivel
  lista: {
    'grapa-doble': { grapas: 1 },         // una grapa más
    'punta-afilada': { dano: 0.3 },       // un 30 % más de daño
    'cafe-cargado': { velocidad: 0.12 },  // un 12 % más rápido
    'pila-repuesto': { gasto: -0.15 },    // la batería se gasta un 15 % más despacio
  },
});
AJUSTES.bichos = TN.congela({
  // (cuaderno) vida y batería que quitan por golpe; (partida) velocidad en unidades por segundo
  clases: {
    hormiga: { vida: 10, dano: 4, velocidad: 2.6, grupo: [4, 6], anillo: 0 },   // van en grupos de 4 a 6 y rodean
    arana: { vida: 30, dano: 8, velocidad: 1.6, grupo: [1, 1], anillo: 1, tela: { radio: 2.5, freno: 0.5, segundos: 2 } },   // espera en su tela, que frena a la mitad 2 s
    cucaracha: { vida: 60, dano: 10, velocidad: 1.4, grupo: [1, 1], anillo: 2 },
  },
  persigue: 8,                  // (partida) te persigue si estás a menos de 8 unidades
  muerdeCada: 1,                // (partida) segundos entre dos mordiscos del mismo bicho
  masPorMinuto: 0.25,           // (cuaderno) cada minuto fuera del nido sale un 25 % más de bichos
});
AJUSTES.gigante = TN.congela({
  veces: [1, 2], nuncaAntesDe: 30,   // (cuaderno) pasa 1 o 2 veces, nunca en los primeros 30 segundos y nunca pisa el nido
  aviso: 2.5, radio: 4,              // (partida) la sombra avisa 2,5 s antes y mide 4 unidades de radio
  dano: 40, lanza: 6,                // (cuaderno) quita 40 y lanza al becario; (partida) 6 unidades
  noTumbaConMasDe: 40,               // (cuaderno) nunca lo tumba de un golpe si tiene más de 40
  gracia: { borde: 0.2, segundos: 0.2 },   // (cuaderno) el borde de la sombra (una quinta parte) no hace daño y hay 2 décimas extra
});
AJUSTES.trucos = TN.congela({        // (cuaderno) solo en la expedición, nunca en el asalto
  primerMordiscoGratis: true,        // el primer mordisco de un bicho que no habías visto no te da
  calientan: { segundos: 30, velocidad: 0.7, esperaAtaque: 2 },   // los primeros 30 s van torpes; (partida) cuánto
  seAdapta: { caidasSeguidas: 2, menosBichos: 0.25 },             // tras 2 caídas seguidas, un 25 % menos de bichos
});
AJUSTES.botin = TN.congela({
  // (cuaderno) cinco materiales: blancos (comunes) y verdes
  materiales: { carton: 'blanco', grapas: 'blanco', migas: 'blanco', plastico: 'verde', pilas: 'verde' },
  expedicionBuena: [60, 100],        // (cuaderno) una expedición buena trae de 60 a 100 unidades
  recoge: 1.2,                       // (partida) se recoge solo al pasar a menos de esto
});
AJUSTES.mochila = TN.congela({
  huecos: 8, porHueco: 10,           // (cuaderno) 8 huecos de 10 unidades del mismo material
  caidaHoras: 4,                     // (cuaderno) la mochila caída se queda en el suelo 4 horas
});
AJUSTES.expedicion = TN.congela({
  fueraMinimo: 3,                    // (partida) termina al entrar en el nido tras haber estado fuera al menos 3 segundos
});
