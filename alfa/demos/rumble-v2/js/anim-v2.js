// Fans of Rumble v2 · Las hojas de animación de los personajes (img/anim/<clave>.webp). Lo escribe
// herramientas/comfyui/rumble_v2/fotogramas.py: no editar a mano. celda = tamaño de cada fotograma en píxeles,
// n = fotogramas por animación, alto = píxeles que mide el personaje quieto, pies = [x, y] del apoyo en la celda
// para cada lado, filas = qué animación es cada fila. arte-v2.js pinta el fotograma que toca.
'use strict';
const V2_ANIM = {"bunny":{"celda":[252,241],"n":8,"alto":220,"pies":{"der":[123,233],"izq":[147,228]},"filas":["der-quieto","der-andar","der-atacar","der-golpe","der-morir","izq-quieto","izq-andar","izq-atacar","izq-golpe","izq-morir"]},"squirrel":{"celda":[268,259],"n":8,"alto":220,"pies":{"der":[119,248],"izq":[156,246]},"filas":["der-quieto","der-andar","der-atacar","der-golpe","der-morir","izq-quieto","izq-andar","izq-atacar","izq-golpe","izq-morir"]}};
