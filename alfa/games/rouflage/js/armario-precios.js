// Fans of Rouflage · ARMARIO (precios): lo que cuesta en Acciones todo lo de la tienda del armario, un solo sitio para tocarlo. El precio lo
// fija la RAREZA; un conjunto entero (cabeza, espalda, papel y cara) cuesta más que una pieza suelta porque ya trae todas sus piezas. Las
// Acciones se ganan jugando (unas 30 al día como mucho, 5 Gotas = 1 Acción) o se compran, así que con el catálogo grande se puede bajar:
// una pieza común sale en un día, una épica en una semana y una legendaria en unas dos. Se aplica a lo que tiene `de: 'tienda'` y número.
// El pase premium cuesta ECO.premium (economia.js). Se carga después de armario-datos.js y armario-datos-rumble.js.
// Todo lo que se vende se puede pagar también con Gotas, al cambio de la tienda (5 Gotas = 1 Acción: arPrecio, economia.js).
// LO DEL GACHAPÓN (comunes y raras de la tienda, que antes solo salían allí) se vende con un recargo, PRECIO_GACHA: elegir la pieza exacta
// tiene que costar más que dejarlo al azar. Una cápsula cuesta 150 Gotas y vale de media unas 70 Acciones a precio de tienda (60 % común,
// 28 % rara, 10 % épica y 2 % legendaria), así que con ×1,5 una común suelta cuesta lo mismo que una cápsula (30 Acciones = 150 Gotas) y una
// rara, 150 Acciones (750 Gotas: más que las ~540 Gotas que cuesta de media sacar una rara cualquiera), sin pasar nunca a la épica (220).
'use strict';
const PRECIO_AR = { comun: 20, rara: 100, epica: 220, legend: 400 };
const PRECIO_CONJUNTO = { comun: 60, rara: 160, epica: 320, legend: 560 };
const PRECIO_GACHA = 1.5;
(() => {
  for (const cat of CATALOGO_AR) for (const it of cat.items) {
    if (it.de === 'tienda' && typeof it.txt === 'number') it.txt = (cat.conjuntos ? PRECIO_CONJUNTO : PRECIO_AR)[it.r] || it.txt;
  }
})();
