// Tiny Fans · AJUSTES · MAPA: la parada de la máquina de café. Lo grande es fijo (muebles y sitios señalados) y se describe aquí como
// DATOS que leen a la vez el dominio (choques) y la vista 3D (modelos): docs/guia/juegos/tiny/README.md, «El mapa». Unidades del mundo;
// x a la derecha, z hacia el jugador, nido en (0, 0). Dueño: N3 (dominio de la expedición), con las tablas del panel de niveles.
'use strict';
AJUSTES.mapa = TN.congela({
  lado: 120,                    // (partida) el mapa es un cuadrado de 120 unidades con el nido en el centro
  nido: { x: 0, z: 0, radio: 5.2 },   // (partida, boceto 4) el robot aspirador; quien está dentro del radio está en el nido
  anillos: [20, 40],            // (partida) radios: cerca hasta 20, en medio hasta 40 y lejos el resto
  // (cuaderno) los 3 sitios señalados, con más botín y bichos vigilando. Posiciones provisionales (N1): las fija N3 con el panel de niveles
  sitios: [
    { id: 'papelera', x: -34, z: -22, radio: 6 },
    { id: 'taza', x: 30, z: 26, radio: 5 },
    { id: 'cajon', x: 38, z: -36, radio: 6 },
  ],
  // los muebles fijos: { id, tipo, x, z, forma: 'caja' | 'circulo', ancho, fondo (caja) o radio (circulo), giro, pisable }.
  // Provisional (N1): solo la máquina de café del boceto 4; la lista de verdad la pone N3
  muebles: [
    { id: 'maquina', tipo: 'maquina-cafe', x: 44, z: -48, forma: 'caja', ancho: 9, fondo: 6.4, giro: 0, pisable: false },
  ],
});
