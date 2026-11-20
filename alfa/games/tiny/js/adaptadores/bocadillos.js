// Tiny Fans · adaptador · BOCADILLOS de cómic para lo que dice el becario: salen pegados a un punto de la pantalla y se van solos.
// Dueño: N6 (interfaz).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.bocadillos = {
  // punto: { x, y } en píxeles de CSS dentro de #tn-escenario (vista.aPantalla); segundos: lo que dura
  dice(texto, punto, segundos) {},
  limpia() {},
};
