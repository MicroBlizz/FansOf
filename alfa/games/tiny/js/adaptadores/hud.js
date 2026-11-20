// Tiny Fans · adaptador · MARCADORES de la expedición y del asalto: batería y mochila arriba, la barra de voltios, el botón de la pila,
// la flecha naranja al nido, la roja a la mochila caída, el borde rojo de batería baja y la cuenta atrás del asalto. El tercio de abajo
// queda libre. Lee la foto; no toca el dominio. Dueño: N6 (interfaz).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.hud = {
  // lo monta en la capa. acciones: { usaPila() }
  monta(capa, acciones) {},
  // lo pone al día con la foto y la vista (para las flechas: vista.aPantalla)
  pinta(foto, vista) {},
  desmonta() {},
};
