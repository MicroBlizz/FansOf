// Fans of Pop · REGLAS DE «LO QUE COMPRAS VUELA» (tarea #270, Pepins 21-11-2026, boceto B): qué tenías al pulsar una tarjeta de la
// tienda (la foto), qué has ganado al volver a pintarla y cuántos iconos vuelan de cada cosa. Sin pantalla, reloj ni partida: quien
// llama pasa la partida y la hora. La pantalla está en js/tienda-vuelo.js.
'use strict';
const PP_VUELO_R = (() => {
  const VALE_MS = 3 * 60 * 1000;   // una foto más vieja ya no vale: lo ganado después no viene de esa compra
  const TOPE = Object.freeze({ perlas: 8, monedas: 8, ayuda: 6, infinitas: 4 });
  // lo que se cuenta: perlas, monedas, cada ayuda y hasta cuándo duran los corazones infinitos (hora de fin, en ms)
  function foto(save, ahora, ayudas) {
    const a = {};
    for (const k of ayudas) a[k] = (save.ayudas && save.ayudas[k]) || 0;
    return Object.freeze({ t: ahora, perlas: save.perlas || 0, monedas: save.monedas || 0, infinitas: Math.max(ahora, save.infinitas || 0), ayudas: Object.freeze(a) });
  }
  // solo lo que ha SUBIDO (lo gastado no vuela), en este orden: perlas, monedas, ayudas, corazones. Con la foto caducada, nada
  function ganado(antes, despues) {
    if (!antes || !despues || despues.t - antes.t > VALE_MS || despues.t < antes.t) return [];
    const res = [];
    for (const k of ['perlas', 'monedas']) if (despues[k] > antes[k]) res.push({ k, tipo: k, antes: antes[k], despues: despues[k] });
    for (const k in despues.ayudas) {
      const a = antes.ayudas[k] || 0, d = despues.ayudas[k];
      if (d > a) res.push({ k, tipo: 'ayuda', antes: a, despues: d });
    }
    // sin corazones infinitos, su «fin» es la hora de la foto: se compara con la hora de ahora para que el tiempo que pasa no cuente como ganado
    const min = Math.round((despues.infinitas - Math.max(antes.infinitas, despues.t)) / 60000);
    if (min > 0) res.push({ k: 'infinitas', tipo: 'infinitas', antes: 0, despues: min });
    return res;
  }
  // cuántos iconos vuelan: una ayuda, uno por unidad (hasta 6); perlas y monedas, uno por cada 15 (de 3 a 8); los corazones, 4
  function iconos(g) {
    const n = g.despues - g.antes;
    if (g.tipo === 'ayuda') return Math.min(TOPE.ayuda, n);
    if (g.tipo === 'infinitas') return TOPE.infinitas;
    return Math.min(TOPE[g.tipo], Math.max(3, Math.ceil(n / 15)));
  }
  // lo que marca el contador cuando han llegado `llegados` de `total` iconos: sube a trozos y el último deja la cifra exacta
  const cuenta = (g, llegados, total) => (llegados >= total ? g.despues : g.antes + Math.floor((g.despues - g.antes) * llegados / total));
  return Object.freeze({ foto, ganado, iconos, cuenta, VALE_MS });
})();
