// Fans Of Taxi · FUENTES DEL MAPA: de dónde sale el mundo. CIUDAD (ciudad.js) monta encima los índices, alturas, obstáculos y
// trozos, sin saber de qué fuente viene: hoy, la ciudad generada (aquí) o el circuito de pruebas (mapas/pruebas.js); mañana, un
// fichero publicado con el mapa ya hecho.
//
// Una fuente da: ancho y largo (m), su terreno { natural, tierra, ciudadEn, ciudades }, construir(g, azar) → { ciudades, rio,
// enlaces, monte } (los nudos y tramos los crea con g.nodo y g.une), campo(azar, distCarretera, enRio) (árboles y rocas) y
// salida(ciudad) → { x, z, ang } (dónde empieza el coche y hacia dónde mira).
'use strict';
const FUENTES = {};

FUENTES.ciudad = {
  nombre: 'ciudad',
  ancho: TAXI.mundo.ancho,
  largo: TAXI.mundo.largo,
  terreno: TERRENO,
  construir(g, azar) {
    const ciudades = TERRENO.ciudades.map((c, indice) => {
      const r = MANZANAS.generar({ ...c, indice }, azar, g);
      const anillo = g.nodos.filter(n => n.ciudad === indice && n.tipo === 'anillo');
      return { ...c, indice, ...r, anillo, nodo: (i, j) => r.nodos[i] && r.nodos[i][j] };
    });
    const rio = CARRETERAS.rio();
    const enlaces = CARRETERAS.enlaces(ciudades, g);
    const monte = CARRETERAS.montaña(ciudades, g);
    return { ciudades, rio, enlaces, monte };
  },
  campo: (azar, distCarretera, enRio) => CARRETERAS.campo(azar, distCarretera, enRio),
  salida(ciudad) {   // en Bahía Microblizz, a 22 m de un cruce del centro, por su carril
    const c = ciudad.ciudades[0], n = c.nodo(4, 4) || c.anillo[0], v = ciudad.nodos[n.vecinos[0]];
    const ang = Math.atan2(v.x - n.x, v.z - n.z), carril = ciudad.carril(n, v);
    return { x: n.x + Math.sin(ang) * 22 + carril.ox, z: n.z + Math.cos(ang) * 22 + carril.oz, ang };
  },
};

// ?mapa=pruebas abre el circuito de pruebas (solo en desarrollo o en la alfa)
FUENTES.elegida = () => {
  const pide = typeof location !== 'undefined' && new URLSearchParams(location.search).get('mapa');
  const probador = typeof NUCLEO !== 'undefined' && (NUCLEO.desarrollo || NUCLEO.alfa);
  if (pide === 'pruebas' && FUENTES.pruebas && (probador || typeof FUENTES.forzada !== 'undefined')) return FUENTES.pruebas;
  return FUENTES[FUENTES.forzada] || FUENTES.ciudad;
};
