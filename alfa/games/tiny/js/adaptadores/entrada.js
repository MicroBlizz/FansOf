// Tiny Fans · adaptador · ENTRADA: el joystick de un dedo, que nace donde se apoya el pulgar. Solo da un vector de pantalla; quien lo
// pasa a los ejes del mundo es la vista (aSuelo) y lo hace principal.js. Dueño: N2 (motor gráfico).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.creaEntrada = (capa, reglas) => ({
  // el vector del joystick: x a la derecha, y hacia ARRIBA de la pantalla, largo de 0 a 1 (ya sin la zona muerta)
  vector() { return { x: 0, y: 0 }; },
  // lo enciende o lo apaga (lo llama principal.js al cambiar de pantalla, según su `joystick`); apagado da siempre 0, 0
  activa(si) {},
});
