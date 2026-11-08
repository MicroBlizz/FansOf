// Fans of Rumble · Arte pintado por Yoshi (ADR 084): el interruptor y sus ajustes. Lo usan arte.js y animar.js de esta carpeta.
// Mientras se prueba, solo en la alfa: flag 'rumble-arte-pintado' (cerrado en la web; la fila de la tabla flags lo abre en 'alfa').
// AJUSTES.artePintado = true lo deja siempre encendido (demo Fans of Rumble v2) y = false siempre apagado (demo Fans of Rumble Clásico).
// Apagado no se descarga ninguna imagen (arte.js y animar.js empiezan a bajarlas cuando se enciende).
'use strict';
const PINTADO = Object.freeze({
  // ¿se usa el arte pintado? Se pregunta cada vez (el flag puede cambiar sin recargar: ver arte.js, que lo rehace todo)
  activo: () => AJUSTES.artePintado === true
    || (AJUSTES.artePintado !== false && NUCLEO.flag('rumble-arte-pintado', 'Arte pintado por Yoshi: personajes animados, cartas de frente, edificios, fondos y puentes', false)),
  // carpeta de las imágenes, desde la página que carga el juego
  ruta: () => AJUSTES.rutaPintado || 'img/pintado/',
  // Tamaño en el campo de cada personaje animado respecto a su dibujo de siempre (1 = igual). Lo eligió Daniel con una fila
  // de todos de pie junto a la torre (6-11-2026): el bastón, la pistola o lo que sobresale hacía que algunos salieran pequeños.
  tamano: Object.freeze({ beaver: 1.1, meercat: 1.2, mechavaca: 1.15, vaca: 1.15, becario: 1.2 }),
  // Tamaño de torres, bases y sus escombros respecto a su caja de siempre (Daniel, 7-11-2026: «son ridículos»)
  edificios: Object.freeze({ tower: 1.5, base: 1.35, rubble: 1.5 }),
  // y alguno suelto, por su nombre (manda sobre el de su tipo): la madriguera, algo más pequeña (Daniel, 7-11-2026: «aún la veo grande»)
  edificioSuelto: Object.freeze({ p_base: 1.2 }),
  // y cuántos píxeles más abajo se dibujan, para que tapen las esquinas de los caminos (solo el dibujo, no dónde están)
  bajarEdificios: 28,
});
