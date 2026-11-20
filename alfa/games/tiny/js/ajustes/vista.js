// Tiny Fans · AJUSTES · VISTA: el pintado pixelado del boceto 4, la cámara y el joystick (docs/tiny/PROTOTIPO.md, «Aspecto»).
// Ángulos en radianes. Dueño: N2 (motor gráfico).
'use strict';
AJUSTES.vista = TN.congela({
  anchoPixeles: 270,                 // (boceto 4) el mundo se pinta en unos 270 píxeles de ancho y se amplía con píxel entero
  cielo: 0xf3e2c2, lejos: 200,
  // los encuadres: alto = unidades del mundo que caben de arriba abajo; az y el, el giro y la inclinación de la cámara (no gira al jugar)
  encuadres: {
    juego: { alto: 19, az: -0.6, el: 0.7 },        // (boceto 4) «Como se juega»
    ras: { alto: 11, az: -0.6, el: 0.25 },         // (cuaderno) a ras de suelo cuando aparece el gigante; (partida) cuánto
    construir: { alto: 11, az: -0.25, el: 0.9 },   // (cuaderno) en el modo construir la cámara se acerca
  },
  rasSegundos: 2.5,                  // (cuaderno: «unos segundos»; partida)
  sigue: 6,                          // (boceto 4) lo deprisa que la cámara alcanza al becario
});
AJUSTES.entrada = TN.congela({
  radio: 56, zonaMuerta: 0.15,       // (partida) el joystick: píxeles de recorrido y lo que se ignora del centro
  tercioLibre: 1 / 3,                // (cuaderno) el tercio de abajo queda libre para el pulgar
});
