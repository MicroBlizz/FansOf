// Fans of Pop · las reglas de «hay más abajo» (tarea 436, boceto A de Pepins): si una ventana que se desliza aún tiene algo por debajo
// de lo que se ve, y dónde va la flechita de una lista de dentro. Solo números, sin DOM: el aviso que las usa está en js/hay-mas.js.
'use strict';
const PP_HAY_MAS = {
  // arriba: lo ya bajado (scrollTop); alto: lo que se ve; total: lo que mide todo; margen: los píxeles del final que no cuentan
  // (el navegador redondea y una ventana que «sobra» por 2 px no se desliza de verdad)
  queda(arriba, alto, total, margen = 6) {
    return total - alto - arriba > margen;
  },
  // la flechita de una lista: centrada en su fondo, en medidas del juego (escala = pantalla / juego; el escenario va escalado).
  // lista, zona y caja: { left, top, right, bottom } en pantalla. zona = lo visible de la ventana (bajo su franja de título);
  // caja = donde se cuelga la flecha. La flecha ocupa los `alto` px del juego de encima del fondo: si no caben enteros dentro de la
  // zona (la ventana está bajada y el fondo queda bajo el título, o subida y queda debajo), no se ve.
  flecha(lista, zona, caja, escala = 1, alto = 42) {
    const e = escala > 0 ? escala : 1;
    return {
      x: ((lista.left + lista.right) / 2 - caja.left) / e,
      y: (lista.bottom - caja.top) / e,
      ve: lista.bottom <= zona.bottom + 1 && lista.bottom - alto * e >= zona.top,
    };
  },
};
