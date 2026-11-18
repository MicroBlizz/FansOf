// Fans of Chef · LA ESCENA DE LA CANTINA: la oficina-comedor de Microblizz pintada por Yoshi (img/cantina.png, 642 × 350, la versión 1 de
// `pedidos.py --cantina` recortada sin el marco): los programadores a la izquierda y la cocina a la derecha. El cocinero anda por el pasillo
// de la cocina (`suelo`, polígono): detrás de la isla y entre la isla y los fogones. Cada ESTACIÓN es una caja (r: x0 y0 x1 y1) que se usa
// acercándose: caja de la despensa (que = ingrediente), tabla, fuego (olla o sartén), platos, ventanilla (hacia la oficina), basura y
// encimera. Las coordenadas se sacan a mano con una rejilla sobre la imagen; con el modo dev y J+K a la vez se ve el suelo pisable.
'use strict';

const CANTINA_ESCENA = {
  img: 'cantina', w: 642, h: 350,
  suelo: [[325, 128], [446, 128], [446, 157], [480, 167], [592, 202], [560, 222], [470, 262], [462, 262], [462, 192], [325, 192]],
  bloqueos: [],
  salidas: {},
  antorchas: [],
  estaciones: [
    { id: 'caja_tomate',   tipo: 'caja', que: 'tomate',   r: [484, 146, 512, 166] },
    { id: 'caja_cebolla',  tipo: 'caja', que: 'cebolla',  r: [518, 157, 546, 177] },
    { id: 'caja_gelatina', tipo: 'caja', que: 'gelatina', r: [552, 168, 580, 188] },
    { id: 'tabla_1',    tipo: 'tabla',      r: [372, 192, 416, 214] },
    { id: 'tabla_2',    tipo: 'tabla',      r: [540, 220, 580, 238] },
    { id: 'encimera_1', tipo: 'encimera',   r: [330, 192, 366, 214] },
    { id: 'encimera_2', tipo: 'encimera',   r: [418, 192, 456, 212] },
    { id: 'olla_1',     tipo: 'fuego', clase: 'olla',   r: [450, 258, 482, 282] },
    { id: 'olla_2',     tipo: 'fuego', clase: 'olla',   r: [482, 244, 514, 268] },
    { id: 'sarten',     tipo: 'fuego', clase: 'sarten', r: [512, 230, 544, 252] },
    { id: 'platos',     tipo: 'platos',     r: [378, 106, 412, 126] },
    { id: 'ventanilla', tipo: 'ventanilla', r: [308, 136, 326, 188] },
    { id: 'basura',     tipo: 'basura',     r: [592, 188, 614, 214] },
  ],
};
// las estaciones no se pisan: cuentan como bloqueos de la escena
CANTINA_ESCENA.bloqueos = CANTINA_ESCENA.estaciones.map(e => e.r);
