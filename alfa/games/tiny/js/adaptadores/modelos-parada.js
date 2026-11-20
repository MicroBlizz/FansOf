// Tiny Fans · adaptador · MODELOS · PARADA: el suelo de la parada de la máquina de café con sus bordes (pared y rodapié), los muebles de
// reglas.mapa.muebles y los 3 sitios señalados. Un mueble de un tipo sin modelo se pinta como una caja de su tamaño. Dueño: N4 (modelos 3D).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
// toda la parada montada con los datos del mapa (reglas.mapa)
TN.modelos.parada = mapa => null;
// un mueble suelto: { tipo, forma, ancho, fondo, radio, giro }
TN.modelos.mueble = datos => null;
