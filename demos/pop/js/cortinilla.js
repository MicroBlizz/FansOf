// Fans of Pop · CORTINILLA (dominio): cuándo sale la cortinilla de entrada a un nivel jefe y cómo avanza en el tiempo. Todo son
// funciones puras (sin reloj, azar, SAVE ni dibujo): el dibujo está en pintar-cortinilla.js. ADR 098 (tarea #18, Arkioner, 11-11-2026; ampliada a los difíciles el mismo día).
'use strict';
const PP_CORTINILLA = Object.freeze((() => {
  const DURACION = 3.2;   // segundos, si no se salta con un toque
  const ENTRA = [0, 0.32], FIGURAS = [0.22, 0.64], ETIQUETA = [0.45, 0.7], SALE = [2.88, DURACION];
  const PASOS = [1.09, 1.5, 1.98], PASO_DUR = 0.26, VS = { desde: 0.7, pico: 0.93, asienta: 1.09, escala: 1.35 };
  const tramo = (t, [a, b]) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const lerp = (a, b, k) => a + (b - a) * k;
  // La cortinilla es de los niveles con duelo (los jefes y los difíciles): en Pesadilla siguen la regla del «Lights Out», sin duelo, y no sale
  const salePara = d => !!(d && d.nim);
  const tipoDe = d => (d.jefe ? 'jefe' : 'duelo');   // el rótulo: «¡NIVEL JEFE!» o «¡DUELO!»
  const rivalDe = d => d.nim.rival;   // 'ceo' o 'ceoespacial'
  const golpeVs = t => (t < VS.desde ? 0 : t < VS.pico ? lerp(0, VS.escala, (t - VS.desde) / (VS.pico - VS.desde)) : t < VS.asienta ? lerp(VS.escala, 1, (t - VS.pico) / (VS.asienta - VS.pico)) : 1);
  // todo lo que se ve en el segundo t: de 0 (fuera) a 1 (puesto); `vs` es la escala del VS (pasa de 1 al golpearlo)
  function fotograma(t) {
    const fuera = 1 - tramo(t, SALE);
    return {
      panel: tramo(t, ENTRA) * fuera, figuras: tramo(t, FIGURAS) * fuera, etiqueta: tramo(t, ETIQUETA) * fuera,
      vs: golpeVs(t) * fuera, pasos: PASOS.map(a => tramo(t, [a, a + PASO_DUR]) * fuera), golpe: t >= VS.pico,
    };
  }
  const terminada = t => t >= DURACION;
  return { DURACION, salePara, tipoDe, rivalDe, fotograma, terminada };
})());
