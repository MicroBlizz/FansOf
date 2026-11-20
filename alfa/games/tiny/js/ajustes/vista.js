// Tiny Fans · AJUSTES · VISTA: el pintado pixelado del boceto 4, la cámara y el joystick (docs/tiny/PROTOTIPO.md, «Aspecto»).
// Ángulos en radianes. Dueño: N2 (motor gráfico).
'use strict';
AJUSTES.vista = TN.congela({
  anchoPixeles: 270,                 // (boceto 4) el mundo se pinta en unos 270 píxeles de ancho y se amplía con píxel entero
  cielo: 0xf3e2c2, lejos: 200,
  // los encuadres: alto = unidades del mundo que caben de arriba abajo; az y el, el giro y la inclinación de la cámara (no gira al jugar)
  encuadres: {
    juego: { alto: 20, az: -0.6, el: 0.7 },        // (panel) 20 unidades de alto: el becario ocupa cerca del 10 %
    ras: { alto: 20, az: -0.6, el: 0.45 },          // (cuaderno + panel) al aparecer el gigante solo baja la inclinación: no acerca ni quita el control
    construir: { alto: 16.5, az: -0.12, el: 0.95 },  // el nido entero cabe a lo ancho
    nido: { alto: 17.5, az: -0.2, el: 0.8 },        // el nido en vivo, algo más lejos
    asalto: { alto: 18, az: -0.6, el: 0.75 },      // el nido rival, de 8x8 casillas de 1,5   // (cuaderno) en el modo construir la cámara se acerca
  },
  rasSegundos: 2.5,                  // (cuaderno: «unos segundos»; partida)
  sigue: 6,                          // (boceto 4) lo deprisa que la cámara alcanza al becario
});
AJUSTES.entrada = TN.congela({
  radio: 56, zonaMuerta: 0.18,       // (partida) el joystick: píxeles de recorrido y lo que se ignora del centro
  tercioLibre: 1 / 3,                // (cuaderno) el tercio de abajo queda libre para el pulgar
});
