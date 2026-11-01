// Fans Of Nova · NV: el objeto global donde cuelgan las piezas con capas del juego (NV.Golpe…), en vez de soltar funciones globales.
// Capas (docs/calidad/ARQUITECTURA.md): dominio/ (las reglas, sin pantalla, sonido ni azar propio), los casos de uso y los adaptadores
// (dibujo, DOM, sonido). El resto de Nova sigue en el estilo de siempre (nv...) y se va moviendo aquí por la ficha docs/nova/MIGRACION.md.
'use strict';
const NV = {};
