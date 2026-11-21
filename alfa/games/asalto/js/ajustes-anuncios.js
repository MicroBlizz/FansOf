// Fans of Asalto · Los ajustes de los anuncios (los opcionales de la partida, las plumas de regalo y doblar las de la partida; aparte de ajustes.js, que ya va lleno). Nunca venden
// invocaciones. Solo datos: las reglas están en dominio/anuncios.js.
'use strict';
// oferta: cambiar la oferta de la tienda gratis, una vez por oferta (la de cada dos oleadas).
// esencia: cantidad = la esencia que da, una vez por oleada.
// cartas: otras 3 cartas de Despertar para el legendario (tarea #109), una vez por oferta de cartas.
// plumas: las plumas de regalo de la Tienda del menú (cantidad cada vez, diarias = el tope por día).
// doblar: al acabar la partida, repetir las plumas ganadas en ella (una vez por partida).
// vida: tras perder una oleada normal, devuelve la vida perdida antes de repetirla; veces = cuántas por partida.
ASALTO.anuncios = {
  oferta: {},
  esencia: { cantidad: 2 },
  plumas: { cantidad: 60, diarias: 3 },
  doblar: {},
  vida: { veces: 1 },
  cartas: {},
};
