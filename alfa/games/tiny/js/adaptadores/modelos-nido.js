// Tiny Fans · adaptador · MODELOS · NIDO: el robot aspirador con el nido encima (para la expedición), el suelo de 6x6 del nido por dentro
// y sus piezas (paredes, puerta, chinchetas, almacén y las trampas del asalto). Dueño: N4 (modelos 3D).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.modelos.aspirador = () => null;
// el suelo del nido por dentro: una casilla mide 1 unidad y la (0, 0) queda con su centro en x = 0.5, z = 0.5
TN.modelos.sueloNido = (columnas, filas) => null;
// una pieza por su nombre: las de reglas.nido.piezas, 'almacen', y las trampas de reglas.asalto.trampas. Centrada en su casilla
TN.modelos.pieza = nombre => null;
