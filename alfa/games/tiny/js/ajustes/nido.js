// Tiny Fans · AJUSTES · NIDO: la rejilla, las piezas, sus recetas y el tope de trampas (docs/tiny/PROTOTIPO.md, «El nido»).
// Casillas: col 0..5 (x, de izquierda a derecha) y fila 0..5 (z, de lejos a cerca). Dueño: N5 (dominio del nido).
'use strict';
AJUSTES.nido = TN.congela({
  columnas: 6, filas: 6,             // (cuaderno) rejilla de 6x6, de una planta
  entrada: { col: 2, fila: 5 },      // (partida) por dónde se entra
  almacen: { col: 3, fila: 0 },      // (partida) el almacén viene gratis y no se quita
  topeTrampas: 3,                    // (cuaderno)
  // (cuaderno) precios: pared 5, puerta 10, chinchetas 15; (partida) recetas con los cinco materiales
  piezas: {
    'pared-carton': { clase: 'pared', aguante: 30, cuesta: { carton: 5 } },
    'pared-plastico': { clase: 'pared', aguante: 60, cuesta: { plastico: 5 } },
    puerta: { clase: 'puerta', aguante: 30, cuesta: { carton: 10 } },
    chinchetas: { clase: 'trampa', dano: 10, cuesta: { grapas: 15 } },
  },
  devuelve: 1,                       // (partida) quitar una pieza devuelve lo que costó
});
