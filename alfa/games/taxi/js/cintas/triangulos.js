// Fans Of Taxi · CINTAS / triángulos: una lista de triángulos con color por vértice.
//
// Es lo que produce el dominio de las cintas: datos simples (números), sin three.js. El adaptador de pantalla (trozos.js) los
// convierte en mallas; una herramienta podría exportarlos a .glb tal cual.
'use strict';
const CINTAS = {};

CINTAS.ListaTriangulos = class {
  constructor() {
    this.posiciones = [];   // x, y, z de cada vértice, de tres en tres vértices
    this.colores = [];      // r, g, b (0..1) de cada vértice
  }

  get vacia() { return this.posiciones.length === 0; }

  // un triángulo p-q-r de un color (0xRRGGBB)
  triangulo(p, q, r, color) {
    this.posiciones.push(...p, ...q, ...r);
    const rojo = ((color >> 16) & 255) / 255, verde = ((color >> 8) & 255) / 255, azul = (color & 255) / 255;
    for (let i = 0; i < 3; i++) this.colores.push(rojo, verde, azul);
  }

  // un cuadrilátero p-q-r-s (en orden alrededor) como dos triángulos
  cuadrilatero(p, q, r, s, color) {
    this.triangulo(p, q, r, color);
    this.triangulo(p, r, s, color);
  }
};
