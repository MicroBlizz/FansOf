// Fans of Pop · TEMAS DE LA FRANJA de arriba de las ventanas (tarea 386, Pepins 26-11-2026): cada ventana lleva el dibujo de lo que
// enseña (la Tienda un toldo, el Ranking banderines, los Compañeros un cielo con su nube...). Aquí solo se dice qué temas hay, de
// qué color es su burbuja de cerrar y si el título va en blanco; el dibujo es de css/cabeceras.css. Dominio puro: sin DOM ni reloj.
'use strict';

const PP_CABECERA = (() => {
  // x: color de la burbuja de cerrar ('' = rosa, el de siempre); claro: el título en blanco con borde, porque el fondo es de color
  const tema = (x, claro) => Object.freeze({ x, claro });
  const temas = Object.freeze({
    tienda: tema('oro', false), ofertas: tema('oro', false), pase: tema('oro', true),
    regalo: tema('coral', true), feria: tema('coral', false),
    ranking: tema('naranja', true), duelos: tema('naranja', true),
    memoria: tema('menta', true), opciones: tema('menta', true),
    companeros: tema('', true), amigos: tema('', true), perfil: tema('', true),
  });
  // las clases de la franja y de su burbuja de cerrar para un tema; uno que no existe (o ninguno) da la franja lisa de siempre
  function clases(nombre) {
    const t = Object.hasOwn(temas, nombre) ? temas[nombre] : null;
    if (!t) return Object.freeze({ cab: 'pp-cab', cerrar: 'pp-cerrar' });
    return Object.freeze({
      cab: 'pp-cab pp-cab-' + nombre + (t.claro ? ' pp-cab-claro' : ''),
      cerrar: 'pp-cerrar' + (t.x ? ' pp-x-' + t.x : ''),
    });
  }
  return Object.freeze({ temas, clases });
})();
