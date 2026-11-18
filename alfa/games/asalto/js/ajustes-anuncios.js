// Fans of Asalto · Los ajustes de los anuncios opcionales de la partida (aparte de ajustes.js, que ya va lleno). Nunca venden
// invocaciones. Solo datos: las reglas están en dominio/anuncios.js.
'use strict';
// oferta: cambiar la oferta de la tienda gratis, una vez por oferta (la de cada dos oleadas).
// esencia: cantidad = la esencia que da, una vez por oleada.
// vida: tras perder una oleada normal, devuelve la vida perdida antes de repetirla; veces = cuántas por partida.
ASALTO.anuncios = {
  oferta: {},
  esencia: { cantidad: 1 },
  vida: { veces: 1 },
};
