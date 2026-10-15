// Fans of Nova · Piezas de nave: medidas y anclajes estándar de las naves modulares (casco, alas, motor, escudo, armas).
// PROVISIONAL (fase 0). JSON estricto a propósito. Los anclajes de cada casco cuadran con las ranuras de datos-cascos.js (cara + número).
'use strict';
const NOVA_PIEZAS = {
 "version": "provisional-0.1",
 "nota": "Medidas y anclajes ESTÁNDAR de las naves modulares de Nova (idea de Arkioner, 15-10-2026): casco, alas, motor, escudo y armas son piezas separadas que se encajan en anclajes. Unidades de nave: 1 unidad = 2 px en los PNG exportados. Origen de la nave = centro del casco, eje y hacia abajo, proa en y negativa. JSON estricto: lo leen los bocetos y herramientas.",
 "pxPorUnidad": 2,
 "radioRanura": { "S": 8, "M": 11, "L": 14 },
 "radioTobera": { "S": 7, "M": 9, "L": 12 },
 "margenPlaca": 3,
 "largoMotor": 3,
 "motores": {
  "simple": { "toberas": 1, "nota": "Un motor central" },
  "doble": { "toberas": 2, "nota": "Dos motores, separados por el ancho de una tobera" },
  "triple": { "toberas": 3, "nota": "Tres motores: central y dos a los lados" }
 },
 "piezas": ["casco", "alas", "motor", "escudo", "arma"],
 "ordenDeCapas": ["llama", "alas", "motor", "casco", "escudo", "arma"],
 "convenio": "Cada anclaje de un casco es { x, y } en unidades de nave. Una pieza se coloca haciendo coincidir su pivote con el anclaje. Ranuras: id = cara + número (proa1, babor1, estribor1, dorsal1, dorsal2, popa1) y tamMax = el mayor tamaño que llegará a tener esa ranura (decide el tamaño de la placa de montaje). El motor se ancla por su borde superior; las alas, por la línea central a la altura de su raíz; el escudo, por su centro: una pompa que envuelve toda la nave (alas y toberas incluidas).",
 "cascos": {
  "caza": {
   "nombre": "Caza",
   "faccion": "animales",
   "motor": { "x": 0, "y": 84, "tamMax": "M" },
   "alas": { "x": 0, "y": -26 },
   "escudo": null,
   "ranuras": [
    { "id": "proa1", "cara": "proa", "x": 0, "y": -100, "tamMax": "L" },
    { "id": "babor1", "cara": "babor", "x": -58, "y": 50, "tamMax": "M" },
    { "id": "estribor1", "cara": "estribor", "x": 58, "y": 50, "tamMax": "M" },
    { "id": "dorsal1", "cara": "dorsal", "x": 0, "y": 4, "tamMax": "M" },
    { "id": "popa1", "cara": "popa", "x": 0, "y": 66, "tamMax": "S" }
   ]
  },
  "crucero": {
   "nombre": "Crucero",
   "faccion": "ciber",
   "motor": { "x": 0, "y": 88, "tamMax": "M" },
   "alas": { "x": 0, "y": -50 },
   "escudo": { "x": 0, "y": -6, "rx": 134, "ry": 136 },
   "ranuras": [
    { "id": "proa1", "cara": "proa", "x": 0, "y": -96, "tamMax": "S" },
    { "id": "babor1", "cara": "babor", "x": -70, "y": 14, "tamMax": "S" },
    { "id": "estribor1", "cara": "estribor", "x": 70, "y": 14, "tamMax": "S" },
    { "id": "dorsal1", "cara": "dorsal", "x": 0, "y": 36, "tamMax": "S" },
    { "id": "popa1", "cara": "popa", "x": 0, "y": 70, "tamMax": "L" }
   ]
  },
  "fragata": {
   "nombre": "Fragata",
   "faccion": "olvidados",
   "motor": { "x": 0, "y": 94, "tamMax": "L" },
   "alas": { "x": 0, "y": -30 },
   "escudo": null,
   "ranuras": [
    { "id": "proa1", "cara": "proa", "x": 0, "y": -84, "tamMax": "L" },
    { "id": "babor1", "cara": "babor", "x": -66, "y": 20, "tamMax": "L" },
    { "id": "estribor1", "cara": "estribor", "x": 66, "y": 20, "tamMax": "L" },
    { "id": "dorsal1", "cara": "dorsal", "x": 0, "y": 26, "tamMax": "L" },
    { "id": "dorsal2", "cara": "dorsal", "x": 0, "y": 58, "tamMax": "L" },
    { "id": "popa1", "cara": "popa", "x": 0, "y": 84, "tamMax": "L" }
   ]
  }
 }
};
