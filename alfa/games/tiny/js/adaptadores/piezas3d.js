// Tiny Fans · adaptador · PIEZAS 3D: las ayudas para montar muñecos con cajas, bolas, cilindros, conos y palos, con el material de dibujo
// plano de 4 tonos del boceto 4 (materiales y geometrías compartidos). Aquí nace TN.modelos, donde cada archivo modelos-*.js cuelga los
// suyos. Dueño: N4 (modelos 3D).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.piezas3d = {
  grupo() { return null; },
  // material de dibujo plano de ese color (compartido): opciones como { emissive, transparent, opacity }
  material(color, opciones) { return null; },
  // todas añaden la pieza al grupo y la devuelven; giro: [rx, ry, rz]
  caja(grupo, color, ancho, alto, fondo, x, y, z, giro, opciones) { return null; },
  bola(grupo, color, rx, ry, rz, x, y, z, giro, opciones) { return null; },
  cilindro(grupo, color, radioArriba, radioAbajo, alto, x, y, z, giro, lados, opciones) { return null; },
  cono(grupo, color, radio, alto, x, y, z, giro, lados, opciones) { return null; },
  palo(grupo, color, grosor, ax, ay, az, bx, by, bz, opciones) { return null; },
  // un aro plano en el suelo (lo que se recoge, amarillo; los peligros, rojo; el becario, naranja)
  aro(grupo, color, radio, x, z) { return null; },
};
// Cada modelo es una función que devuelve un THREE.Group nuevo, con el suelo en y = 0 y mirando a +z. Si se mueve, lleva
// grupo.userData.anima(t, datos): t en segundos; datos, lo que diga su tabla en la ficha (andando, golpeado…)
TN.modelos = {};
