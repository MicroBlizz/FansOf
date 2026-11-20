// Fans of Rally · RA: el único objeto global del juego. Cada archivo cuelga de él sus piezas (RA.creaPista, RA.paso, RA.vista…) en vez
// de soltar variables globales; principal.js las compone al arrancar. Capas (docs/calidad/ARQUITECTURA.md): datos/ (pilotos, tramos y
// textos), dominio/ (la pista, la física, la carrera, la IA, el fantasma y el copiloto: puras, sin reloj ni pantalla), aplicacion/
// (la sesión: campeonato, contrarreloj y récords) y adaptadores/ (hojas pintadas, suelo, cámara, mandos, sonido y pantallas).
// Se carga el primero de todos, antes que los ajustes. Contrato: docs/guia/juegos/rally/README.md.
'use strict';
const RA = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
RA.ok = valor => ({ ok: true, valor });
RA.error = (error, datos) => ({ ok: false, error, datos });
// congela un dato y todo lo que lleva dentro: quien lo quiera distinto se hace una copia
RA.congela = dato => {
  if (dato && typeof dato === 'object' && !ArrayBuffer.isView(dato) && !Object.isFrozen(dato)) {   // las tablas de números (Float32Array) no se pueden congelar
    Object.freeze(dato);
    for (const k of Object.keys(dato)) RA.congela(dato[k]);
  }
  return dato;
};
RA.limita = (v, min, max) => (v < min ? min : v > max ? max : v);
// la diferencia más corta entre dos ángulos, de -PI a PI
RA.difAngulo = (a, b) => {
  let d = (b - a) % (2 * Math.PI);
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return d;
};
