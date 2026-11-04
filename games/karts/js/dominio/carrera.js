// Fans Of Karts · dominio · CARRERA: el orden de los puestos, los puntos de una copa y qué objeto toca en la ruleta. Puro: sin azar (se le da el número),
// sin reloj ni pantalla. js/carrera.js, js/objetos.js y js/copa.js lo usan.
'use strict';
KD.carrera = Object.freeze({
  // el orden de los puestos: antes los que ya han llegado (por orden de llegada) y luego los demás, por lo que han avanzado
  comparaPuestos(a, b) { return (a.puestoFinal || 99) - (b.puestoFinal || 99) || b.avance - a.avance; },
  // el orden final: como arriba, pero los que se han ido van detrás de los que siguen
  comparaFinal(a, b) { return (a.puestoFinal || 99) - (b.puestoFinal || 99) || (a.ido ? 1 : 0) - (b.ido ? 1 : 0) || b.avance - a.avance; },
  // los puntos de una copa para el puesto dado (1 = primero)
  puntosDeCopa(puesto, tabla) { return tabla[puesto - 1] || 0; },
  // la columna de la ruleta que toca según el puesto: 0 = 1.º y 2.º, 1 = 3.º a 5.º, 2 = 6.º a 8.º
  columnaDeRuleta(puesto) { return puesto <= 2 ? 0 : puesto <= 5 ? 1 : 2; },
  // el objeto que sale con `r` entre 0 y 1: más peso a los mejores objetos cuanto más atrás vas
  sorteaObjeto(puesto, ids, reparto, r) {
    const col = KD.carrera.columnaDeRuleta(puesto);
    let resto = r * ids.reduce((t, id) => t + reparto[id][col], 0);
    for (const id of ids) { resto -= reparto[id][col]; if (resto < 0) return id; }
    return 'hotfix';
  },
});
