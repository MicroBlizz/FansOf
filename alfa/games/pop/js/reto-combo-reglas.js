// Fans of Pop · las reglas del COMBO y las FASES del reto del día (dominio; tarea 395, ADR 231). El combo empieza en x1 y sube uno (hasta
// `max`) por cada ronda que repites sin quedarte parado más de `duda` segundos entre nota y nota (también antes de la primera); si te
// paras, vuelve a x1 al momento. Cada ronda paga `porRonda` monedas por su combo. Las fases son bloques de `fase` rondas, solo un aviso.
// Funciones puras sobre lo que se les pasa (el combo, los segundos parado, PP_CFG.reto): sin reloj, azar, SAVE ni dibujo. Lo usa js/reto-dia.js.
'use strict';
const PP_COMBO_R = (() => {
  const entero = v => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  // un combo válido: de 1 a max
  const normal = (combo, cfg) => Math.min(cfg.combo.max, Math.max(1, entero(combo)));
  // ¿te has parado demasiado? (`espera`: segundos desde tu último toque o desde que te toca)
  const dudo = (espera, cfg) => Number.isFinite(espera) && espera > cfg.combo.duda;
  // la barrita: lo que queda de 1 (llena, acabas de tocar) a 0 (te has parado demasiado)
  const barra = (espera, cfg) => (Number.isFinite(espera) ? Math.min(1, Math.max(0, 1 - espera / cfg.combo.duda)) : 1);
  // las monedas de una ronda con ese combo
  const paga = (combo, cfg) => cfg.porRonda * normal(combo, cfg);
  // el combo de la ronda siguiente: si dudaste, x1; si no, uno más (hasta max)
  const sigue = (combo, cfg, dudaste) => (dudaste ? 1 : Math.min(cfg.combo.max, normal(combo, cfg) + 1));
  // la fase en la que estás tras `rondas` superadas (la 1 hasta que pasas las primeras `fase`), y si con esa ronda empieza una nueva
  const fase = (rondas, cfg) => Math.floor(entero(rondas) / cfg.fase) + 1;
  const empiezaFase = (rondas, cfg) => entero(rondas) > 0 && entero(rondas) % cfg.fase === 0;

  return Object.freeze({ normal, dudo, barra, paga, sigue, fase, empiezaFase });
})();
