// Fans of Pinball · AJUSTES · TIENDA DE LOLA: el quiosco de arriba a la izquierda (su sitio está en AJUSTES.mesa.tienda). Meter la bola
// por su puerta, si se tienen fichas de la partida para lo más barato, pausa la mesa y Lola ofrece 3 mejoras de las 14 a cambio de esas
// fichas; comprar aplica la mejora como en la elección normal. Una vez por planta: después baja la persiana hasta la planta siguiente.
'use strict';
AJUSTES.tienda = PB.congela({
  precios: { comun: 15, rara: 30, epica: 60 },   // (partida) fichas de la partida por rareza (una planta entera da unas 20 a 35)
  ofrece: 3,                    // (encargo) mejoras que enseña Lola
  avisoCada: 1.5,               // (partida) segundos entre dos avisos de «sin fichas» si la bola sigue dando en la persiana
});
