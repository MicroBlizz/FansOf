// Fans of Pop · LOS COHETES (mundos 7, 9 y 10; Pepins, tarea 349, reporte 48, 25-11-2026: «ayudaban demasiado»). El cohete se toca
// como una burbuja normal (su cruz), pero cuando revienta, por un toque tuyo o de rebote por la cruz de al lado, vuelve a LEVANTAR las
// burbujas de su fila que ya estaban hundidas antes de ese toque (a un golpe). Los otros cohetes hundidos no se levantan: cada cohete
// salta una sola vez. Conviene quitarlo pronto. Los toques gratis de los compañeros (el Hada «lo apaga») y las ayudas no levantan nada.
// Dominio puro (sin reloj, azar, SAVE ni DOM): `falta` es cuántos golpes le faltan a cada burbuja y lo cambia quien llama.
// Lo usan el tablero (ppToca, js/tablero.js), el mínimo de toques y las jugadoras del generador (js/niveles.js) y el robot de dificultad.
// El tipo de burbuja es PP_ESP.cohete (js/niveles.js, que se carga después: solo se lee al llamar).
'use strict';
const PP_COHETES = (() => {
  const esCohete = (esp, j) => esp[j] === PP_ESP.cohete;
  const hay = esp => !!esp && esp.some((e, j) => esCohete(esp, j));
  // levanta la fila del cohete c: las hundidas que no han reventado en este mismo toque (`pops`) y que no son cohetes
  function levantaFila(n, mask, esp, falta, c, pops, subes) {
    const y0 = (c - (c % n)) / n;
    for (let j = y0 * n; j < y0 * n + n; j++) {
      if (mask[j] && falta[j] === 0 && !esCohete(esp, j) && !pops.includes(j) && !subes.includes(j)) { falta[j] = 1; subes.push(j); }
    }
  }
  // aplica a `falta` un toque que alcanza a `ef` (ppEfecto). `apaga`: un toque gratis de un compañero o una ayuda, que no levanta nada.
  // Devuelve { pops, grietas, subes }: las que revientan, las dobles que se resquebrajan y las que vuelven a subir
  function aplica(n, mask, esp, falta, ef, apaga = false) {
    const pops = [], grietas = [], subes = [];
    for (const j of ef) if (falta[j] > 0) { falta[j]--; (falta[j] ? grietas : pops).push(j); }
    if (esp && !apaga) for (const c of pops) if (esCohete(esp, c)) levantaFila(n, mask, esp, falta, c, pops, subes);
    return { pops, grietas, subes };
  }
  // ¿este toque revienta ahora algún cohete?
  const quitaCohete = (esp, falta, ef) => !!esp && ef.some(j => esCohete(esp, j) && falta[j] === 1);
  // cuántas burbujas de `ef` siguen arriba
  const golpes = (falta, ef) => { let v = 0; for (const j of ef) if (falta[j] > 0) v++; return v; };
  // cuánto vale un toque para quien piensa: lo que revienta o resquebraja menos lo que levanta (sin tocar `falta`)
  function valor(n, mask, esp, falta, ef) {
    const g = golpes(falta, ef);
    return quitaCohete(esp, falta, ef) ? g - aplica(n, mask, esp, falta.slice(), ef).subes.length : g;
  }
  // ¿hunde alguna burbuja de una fila con un cohete aún arriba? (luego, al reventar ese cohete, la levantaría)
  function hundeFilaConCohete(n, esp, falta, ef) {
    return ef.some(j => {
      if (falta[j] !== 1 || esCohete(esp, j)) return false;
      const y0 = (j - (j % n)) / n;
      for (let c = y0 * n; c < y0 * n + n; c++) if (esCohete(esp, c) && falta[c] > 0 && !ef.includes(c)) return true;
      return false;
    });
  }
  // de los toques que quedan, el que va ahora: que no levante nada y, por este orden, que quite un cohete, que no hunda nada de la fila
  // de un cohete aún arriba o cualquiera. -1 si todos levantan algo
  function siguiente(n, mask, esp, falta, quedan) {
    let mejor = -1, rango = 3;
    quedan.forEach((q, i) => {
      if (valor(n, mask, esp, falta, q.ef) !== golpes(falta, q.ef)) return;
      const r = quitaCohete(esp, falta, q.ef) ? 0 : hundeFilaConCohete(n, esp, falta, q.ef) ? 2 : 1;
      if (r < rango) { rango = r; mejor = i; }
    });
    return mejor;
  }
  // el mínimo de toques sin cohetes (ppOptimo) es una cota: los cohetes solo suman. Si esos mismos toques se pueden ordenar para que
  // ningún cohete levante nada, ese orden es el mínimo de verdad. Se busca de una pasada, sin probar órdenes (es barato: se llama en
  // cada toque para la pista): en cada paso, el toque que dice `siguiente`. Devuelve la lista o null
  function ordenSinSubir(n, mask, need, esp, lista) {
    const quedan = lista.map(t => ({ t, ef: ppEfecto(n, mask, esp, t) })), falta = need.slice(), orden = [];
    while (quedan.length) {
      const k = siguiente(n, mask, esp, falta, quedan);
      if (k < 0) return null;
      aplica(n, mask, esp, falta, quedan[k].ef); orden.push(quedan[k].t); quedan.splice(k, 1);
    }
    return orden;
  }
  // lo que da ppOptimo cuando hay cohetes: su lista en un orden que no levante nada; si no lo hay, la partida más corta de las dos
  // jugadoras (ya con los cohetes), que se puede jugar de verdad aunque quizá no sea la mínima
  function conCohetes(n, mask, need, esp, lista) {
    if (!hay(esp)) return lista;
    const orden = ordenSinSubir(n, mask, need, esp, lista);
    if (orden) return orden;
    const a = ppVorazLista(n, mask, need, () => 0, esp).toques, b = ppVoraz(n, mask, need, () => 0, 0, esp).toques;
    return a.length <= b.length ? a : b;
  }
  return Object.freeze({ hay, aplica, valor, quitaCohete, ordenSinSubir, conCohetes });
})();
