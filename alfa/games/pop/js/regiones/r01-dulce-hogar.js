// Fans of Pop · REGIÓN 1, «Dulce Hogar»: los 10 mundos de siempre, tal cual estaban en js/niveles.js (Jardín a Espacio). Es la
// única región con datos de momento; se registra con ppRegistraRegion (js/regiones/regiones.js).
// Cada mundo: nombre (y su artículo, `art`: «la Pastelería», «el Jardín»), fondo, novedad y en qué niveles hay un amigo atrapado ·
// `lado`: tamaño del tablero al empezar y al acabar el mundo · `esp`: qué parte de las burbujas es de cada tipo especial, al
// empezar y al acabar el mundo (doble = con nata, 2 golpes; triple = con cereza, 3 golpes; hielo y concha, ver ppEfecto en niveles.js)
'use strict';
ppRegistraRegion(1, [
  // icono: el dibujo de LO NUEVO en la presentación del mundo (tarea #272, js/mundo-presenta-juego.js)
  { nombre: 'Jardín', art: 'el', fondo: 'fondo-jardin', niveles: 20, amigos: [3, 9, 15], lado: [3, 5], esp: {} },
  { nombre: 'Pastelería', art: 'la', fondo: 'fondo-pasteleria', niveles: 20, amigos: [4, 12], lado: [4, 6], icono: 'b-rosa-doble', esp: { doble: [0.15, 0.4] } },
  { nombre: 'Heladería', art: 'la', fondo: 'fondo-heladeria', niveles: 20, amigos: [7], lado: [5, 6], icono: 'i-copo', esp: { hielo: [0.12, 0.3], doble: [0.1, 0.15] }, nueva: 'hielo' },
  { nombre: 'Playa', art: 'la', fondo: 'fondo-playa', niveles: 20, amigos: [7], lado: [5, 6], icono: 'i-concha', esp: { concha: [0.12, 0.3], hielo: [0.05, 0.12], doble: [0.1, 0.15] }, nueva: 'concha' },
  { nombre: 'Feria', art: 'la', fondo: 'fondo-feria', niveles: 20, amigos: [7], lado: [5, 6], icono: 'i-cereza', esp: { triple: [0.08, 0.2], doble: [0.15, 0.2], hielo: [0.05, 0.1], concha: [0.05, 0.1] }, nueva: 'triple' },
  { nombre: 'Reino de las nubes', art: 'el', fondo: 'fondo-nubes', niveles: 20, amigos: [7], lado: [6, 6], icono: 'i-estrella', esp: { triple: [0.12, 0.2], doble: [0.15, 0.2], hielo: [0.1, 0.15], concha: [0.1, 0.15] } },
  // mundos 7 a 10 (31-10-2026): cada uno con su burbuja nueva de efecto grande (cohete = su fila, burbujeante = un 3x3, pétalo = su
  // columna) y algo de las de antes; el Espacio, todo mezclado y con el CEO espacial de jefe
  { nombre: 'Bosque de hadas', art: 'el', fondo: 'fondo-bosque', niveles: 20, amigos: [7], lado: [5, 6], icono: 'i-cohete', esp: { cohete: [0.06, 0.12], doble: [0.15, 0.25], hielo: [0.08, 0.14] }, nueva: 'cohete' },
  { nombre: 'Fondo del mar', art: 'el', fondo: 'fondo-mar', niveles: 20, amigos: [7], lado: [5, 6], icono: 'i-burbujas', esp: { burbujas: [0.06, 0.12], triple: [0.08, 0.15], concha: [0.1, 0.16] }, nueva: 'burbujas' },
  { nombre: 'Jardín de cerezos', art: 'el', fondo: 'fondo-sakura', niveles: 20, amigos: [7], lado: [6, 6], icono: 'i-petalo', esp: { petalo: [0.06, 0.12], cohete: [0.04, 0.08], doble: [0.15, 0.22], hielo: [0.1, 0.16] }, nueva: 'petalo' },
  { nombre: 'Espacio', art: 'el', fondo: 'fondo-espacio', niveles: 20, amigos: [7], lado: [6, 6], icono: 'i-estrella', esp: { cohete: [0.04, 0.07], burbujas: [0.04, 0.07], petalo: [0.04, 0.07], triple: [0.12, 0.2], hielo: [0.12, 0.18], concha: [0.1, 0.15] } },
]);
