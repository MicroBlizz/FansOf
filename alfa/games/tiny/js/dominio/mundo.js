// Tiny Fans · dominio · MUNDO: sortea lo pequeño de una salida (bichos, materiales, pilas y pasadas del gigante) y lo deja como un
// ESCENARIO de datos. Lo grande (muebles y sitios) no se sortea: está en reglas.mapa. Con la misma semilla sale el mismo escenario; un
// test escribe el suyo a mano. Puro. Dueño: N3 (dominio de la expedición).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.mundo = {
  // datos: { caidasSeguidas }. Devuelve un escenario: { bichos: [{ clase, x, z }], botin: [{ material, cantidad, x, z }], gigante: [{ t, x, z }], oleadas: true }
  genera(reglas, semilla, datos) { return { bichos: [], botin: [], gigante: [], oleadas: true }; },
};
