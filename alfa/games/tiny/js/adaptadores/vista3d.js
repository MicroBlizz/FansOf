// Tiny Fans · adaptador · VISTA 3D: el motor gráfico del boceto 4 con Three.js r128 (global THREE). Pinta una escena en una textura pequeña
// y la amplía con píxel entero; la cámara es ortográfica, no gira, va anclada a la rejilla de píxeles y sigue un punto. Un solo lienzo
// y un solo motor para todas las pantallas: cada pantalla trae su escena. Dueño: N2 (motor gráfico).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.creaVista = (lienzo, reglas) => ({
  lista: false,                       // true cuando hay WebGL y el motor está montado
  // ajusta el lienzo y la textura al tamaño de la pantalla
  tamano() {},
  // una escena nueva (THREE.Scene) con el cielo, la niebla y las luces del boceto 4; null sin WebGL
  escena() { return null; },
  // pinta esa escena con la cámara actual. dt: segundos desde el pintado anterior
  pinta(escena, dt) {},
  // el punto del suelo que sigue la cámara (salto: true para ir de golpe)
  sigue(x, z, salto) {},
  // cambia de encuadre ('juego', 'ras' o 'construir', de reglas.vista.encuadres); con segundos, vuelve solo al anterior
  encuadre(nombre, segundos) {},
  // un punto del mundo en píxeles de CSS dentro de #tn-escenario: { x, y, visible }
  aPantalla(x, y, z) { return { x: 0, y: 0, visible: false }; },
  // un toque (píxeles de CSS dentro de #tn-escenario) en el punto del suelo que señala: { x, z }
  deToque(px, py) { return { x: 0, z: 0 }; },
  // un vector de pantalla (x a la derecha, y hacia ARRIBA) en dirección del suelo, en ejes del mundo y del mismo largo: { x, z }
  aSuelo(vx, vy) { return { x: vx, z: -vy }; },
});
