// Tiny Fans · adaptador · EFECTOS 3D: lo que se ve un instante (la grapa que vuela, el golpe, lo que salta al recoger, la sombra del
// gigante que crece, el polvo del pisotón, las motas de luz). Se apunta solo a los eventos; la pantalla solo le dice en qué escena pinta.
// Dueño: N8 (efectos visuales).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.efectos = {
  // empieza a pintar en esa escena (THREE.Scene) y a atender a los eventos
  monta(escena) {},
  // mueve lo que esté vivo. dt: segundos desde el pintado anterior
  pinta(dt) {},
  // quita todo y deja de atender (al salir de la pantalla)
  desmonta() {},
};
