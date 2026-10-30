// Fans Of Taxi · CENTROS COMERCIALES: las dos piezas con aparcamiento, como nudos y tramos del grafo más el edificio.
//   · Con azotea: una rampa elevada (tramo «viaducto», con pretiles y sin terreno debajo) sube por un lado hasta la azotea, que es
//     un tramo de viaducto tan ancho como el edificio y cerrado por pretiles. El edificio es una caja maciza justo debajo.
//   · Con sótano: una trinchera baja desde la calle hasta un portal junto al edificio, y dentro hay una planta de túneles en anillo
//     (sus cruces son salas: las paredes entre pasillos hacen de pilares). Encima, el edificio.
// Dominio puro (sin DOM ni three): la fuente del mapa lo llama al construir. Las cifras viven aquí para que todos sean iguales.
'use strict';
const CENTROS = (() => {
  const ALTO_AZOTEA = 8;      // metros de la calle a la azotea
  const LARGO_RAMPA = 100;    // con 8 m de subida, un 8 % de media (algo más en el centro: los extremos son llanos)
  const ANCHO_RAMPA = 10;
  const LLANO = 6;            // la rampa sale de la calle y llega a la azotea en horizontal
  const ALTO_CON_SOTANO = 12;
  const MARGEN_PLANTA = 10;   // de la fachada al eje de los pasillos del sótano
  const COLORES = { azotea: 0x7a5aa8, sotano: 0x3f7fa8 };

  // h: { nudo(nombre, x, z, extra), une(a, b, tipo, extra), cadena(lista, tipo), trinchera(prefijo, arriba, boca) }
  // La rampa entra por el oeste, en el eje del edificio; devuelve el nudo de abajo (para unirlo a una calle) y el edificio
  function conAzotea(h, nombre, { x, z, ancho, fondo, base }) {
    const oeste = x - ancho / 2, y = base + ALTO_AZOTEA;
    const pie = h.nudo(nombre + 'R0', oeste - LARGO_RAMPA, z, { llano: LLANO });
    const arriba = h.nudo(nombre + 'R1', oeste, z, { tipo: 'viaducto', y, llano: LLANO });
    const fondoAzotea = h.nudo(nombre + 'R2', x + ancho / 2, z, { tipo: 'viaducto', y });
    h.une(pie, arriba, 'viaducto', { ancho: ANCHO_RAMPA });
    h.une(arriba, fondoAzotea, 'viaducto', { ancho: fondo, azotea: true });
    return { pie, azotea: { x, z, y }, edificio: { x, z, w: ancho, d: fondo, h: ALTO_AZOTEA - 0.05, color: COLORES.azotea } };
  }

  // la trinchera baja desde `arriba` (un nudo de calle) hacia el sur hasta un portal junto a la fachada norte
  function conSotano(h, nombre, { x, z, ancho, fondo, base, profundo, arriba }) {
    const norte = z - fondo / 2;
    const inicio = h.nudo(nombre + 'T0', arriba.x, arriba.z + 40, { tipo: 'rampa', y: base });
    h.une(arriba, inicio, 'calle');
    const boca = h.trinchera(nombre + 'B', inicio, [x, norte - 10]);
    const sala = (n, px, pz) => h.nudo(nombre + n, px, pz, { tipo: 'tunel', y: profundo });
    const x0 = x - ancho / 2 + MARGEN_PLANTA, x1 = x + ancho / 2 - MARGEN_PLANTA, z0 = norte + MARGEN_PLANTA, z1 = z + fondo / 2 - MARGEN_PLANTA;
    const entrada = sala('S0', x, z0);
    h.une(boca, entrada, 'tunel');
    h.cadena([entrada, sala('S1', x1, z0), sala('S2', x1, z1), sala('S3', x0, z1), sala('S4', x0, z0), entrada], 'tunel');
    return { entrada, edificio: { x, z, w: ancho, d: fondo, h: ALTO_CON_SOTANO, color: COLORES.sotano } };
  }

  return { ALTO_AZOTEA, conAzotea, conSotano };
})();
