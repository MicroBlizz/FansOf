// Tiny Fans · AJUSTES · MAPA: la parada de la máquina de café. Lo grande es fijo (muebles, río, puentes, telas y sitios señalados) y se
// describe aquí como DATOS que leen a la vez el dominio (choques) y la vista 3D (modelos): docs/guia/juegos/tiny/README.md, «El mapa».
// Unidades del mundo; x a la derecha, z hacia el jugador, nido en (0, 0). Tablas del panel de niveles (P3) y decisiones del integrador.
// Dueño: N3 (dominio de la expedición).
'use strict';
AJUSTES.mapa = TN.congela({
  lado: 120,                    // (partida) el mapa es un cuadrado de 120 unidades con el nido en el centro
  limite: 58,                   // (partida, P3) se pisa de -58 a 58; en ±60 hay pared y rodapié (bordes cerrados, cuaderno)
  nido: { x: 0, z: 0, radio: 5.2 },   // (partida, boceto 4) el robot aspirador; dentro de su radio está el felpudo, zona sin daño
  anillos: [20, 40],            // (partida) radios: cerca hasta 20, en medio hasta 40 y lejos el resto
  cercaDesde: 8,                // (partida) lo de cerca se sortea a partir de aquí, para no llenar la puerta del nido
  // (cuaderno) los 3 sitios señalados, con más botín y bichos vigilando (P3)
  sitios: [
    { id: 'papelera', x: -41, z: -6, radio: 6 },
    { id: 'taza', x: 16, z: 43, radio: 6 },
    { id: 'cajon', x: -20, z: -46, radio: 6 },
  ],
  // los muebles fijos (P3): { id, tipo, x, z, forma: 'caja' | 'circulo', ancho, fondo (caja) o radio (circulo), giro (radianes), alto, pisable }
  muebles: [
    { id: 'maquina', tipo: 'maquina-cafe', x: 36, z: -51, forma: 'caja', ancho: 18, fondo: 13, giro: 0, alto: 34, pisable: false },
    { id: 'bandeja', tipo: 'bandeja-goteo', x: 36, z: -42, forma: 'caja', ancho: 15, fondo: 5, giro: 0, alto: 0.5, pisable: false },
    { id: 'cajonera', tipo: 'cajonera', x: -20, z: -55, forma: 'caja', ancho: 24, fondo: 6, giro: 0, alto: 30, pisable: false },
    { id: 'cajon-izq', tipo: 'lateral-cajon', x: -26.5, z: -46, forma: 'caja', ancho: 1, fondo: 12, giro: 0, alto: 3, pisable: false },
    { id: 'cajon-der', tipo: 'lateral-cajon', x: -13.5, z: -46, forma: 'caja', ancho: 1, fondo: 12, giro: 0, alto: 3, pisable: false },
    { id: 'papelera', tipo: 'papelera', x: -52, z: -6, forma: 'caja', ancho: 12, fondo: 12, giro: 0, alto: 12, pisable: false },
    { id: 'taza', tipo: 'taza', x: 22, z: 50, forma: 'circulo', radio: 5, giro: 0, alto: 8, pisable: false },
    { id: 'planta', tipo: 'maceta', x: 40, z: 40, forma: 'circulo', radio: 8, giro: 0, alto: 12, pisable: false },
    { id: 'pata', tipo: 'pata-mesa', x: -38, z: 42, forma: 'circulo', radio: 2.5, giro: 0, alto: 200, pisable: false },
    { id: 'lapiz', tipo: 'lapiz', x: -30, z: -10, forma: 'caja', ancho: 1.5, fondo: 26, giro: 0, alto: 1, pisable: false },
    { id: 'notas', tipo: 'taco-notas', x: -22, z: -26, forma: 'caja', ancho: 7, fondo: 7, giro: 0, alto: 0.6, pisable: false },
    { id: 'azucar', tipo: 'terrones', x: 30, z: -14, forma: 'caja', ancho: 5, fondo: 5, giro: 0, alto: 2.5, pisable: false },
    { id: 'pila-gigante', tipo: 'pila-gigante', x: -8, z: 36, forma: 'caja', ancho: 10, fondo: 3, giro: 0, alto: 1.5, pisable: false },
    { id: 'chincheta-1', tipo: 'chincheta-guirnalda', x: 6, z: -4, forma: 'circulo', radio: 0.5, giro: 0, alto: 2.7, pisable: false },
    { id: 'chincheta-2', tipo: 'chincheta-guirnalda', x: 6, z: 5, forma: 'circulo', radio: 0.5, giro: 0, alto: 2.7, pisable: false },
  ],
  // (P3) el río de café: se pisa, pero frena a la mitad a becario y bichos mientras están dentro. Línea de puntos y su ancho
  rio: {
    ancho: 3, freno: 0.5,
    puntos: [[36, -42], [36, -36], [28, -22], [20, -10], [14, 4], [4, 14], [-10, 18], [-26, 22], [-44, 30], [-58, 34]],
  },
  // (P3) los puentes: zonas del río sin freno (la regla y el palito de remover)
  puentes: [
    { id: 'regla', x: 9, z: 9, radio: 2.5 },
    { id: 'palito', x: -18, z: 20, radio: 2.5 },
  ],
  // (P3) las telas fijas, cada una con su araña: donde = la zona del reparto de bichos que las usa
  telas: [
    { x: 22, z: 10, radio: 3, donde: 'medio' }, { x: -12, z: -22, radio: 3, donde: 'medio' },
    { x: -24, z: 12, radio: 3, donde: 'medio' }, { x: 10, z: 30, radio: 3, donde: 'medio' },
    { x: 34, z: -26, radio: 3, donde: 'lejos' }, { x: -44, z: -34, radio: 3, donde: 'lejos' },
    { x: 44, z: 18, radio: 3, donde: 'lejos' }, { x: -20, z: -38, radio: 3, donde: 'cajon' },
  ],
});
