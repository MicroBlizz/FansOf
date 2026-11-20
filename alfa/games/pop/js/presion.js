// Fans of Pop · MENOS PRESIÓN AL PERDER (dominio; tarea #186, Pepins 20-11-2026): las dos reglas que quitan presión al fallar. Funciones puras:
// sin SAVE, reloj, azar ni dibujo. Las usan js/ofertas.js (el regalo de Lola tras varios fallos) y js/monedero.js (la racha).
'use strict';
const PP_PRESION = Object.freeze((() => {
  // Lola regala una ayuda tras `minimo` fallos seguidos en el mismo nivel, una vez al día como mucho (`ultimoDia`: el día del último regalo)
  const regalaAtasco = (fallos, minimo, ultimoDia, hoy) => fallos >= minimo && ultimoDia !== hoy;
  // perder un corazón baja la racha un escalón en vez de borrarla (nunca por debajo de 0)
  const bajaRacha = racha => Math.max(0, (Number(racha) || 0) - 1);
  return { regalaAtasco, bajaRacha };
})());
