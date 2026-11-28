// Fans of Pop · RAID, el depósito de toques que se recarga (dominio puro, tarea 448). Estado { toques, desde }: `toques` son los que había
// en el instante `desde` (ms); cada `cadaMs` gana uno más hasta `capacidad`. Todas las funciones reciben `ahora` en ms: nada lee el reloj.
// cfg = { capacidad, cadaMs } (las cifras viven en PP_CFG.raid.deposito y entran por parámetro).
'use strict';
const PP_RAID_DEPOSITO = (() => {
  const nuevo = (cfg, ahora) => ({ toques: cfg.capacidad, desde: ahora });   // un jugador nuevo empieza con el depósito lleno
  const ganados = (e, ahora, cfg) => Math.floor(Math.max(0, ahora - e.desde) / cfg.cadaMs);

  // cuántos toques tiene en `ahora` (con tope en la capacidad)
  function toquesAhora(e, ahora, cfg) {
    if (e.toques >= cfg.capacidad) return cfg.capacidad;
    return Math.min(cfg.capacidad, e.toques + ganados(e, ahora, cfg));
  }
  // gasta n toques: { ok:true, estado } o { ok:false, motivo, toques }. Si estaba lleno, el reloj de recarga arranca ahora;
  // si no, se conserva el trozo de espera que ya llevaba.
  function gastar(e, n, ahora, cfg) {
    if (!Number.isInteger(n) || n < 1) return { ok: false, motivo: 'cantidad_invalida', toques: toquesAhora(e, ahora, cfg) };
    const hay = toquesAhora(e, ahora, cfg);
    if (n > hay) return { ok: false, motivo: 'sin_toques', toques: hay };
    const desde = hay >= cfg.capacidad ? ahora : e.desde + (hay - e.toques) * cfg.cadaMs;
    return { ok: true, estado: { toques: hay - n, desde } };
  }
  // ms que faltan para el siguiente toque; 0 si está lleno
  function faltaMs(e, ahora, cfg) {
    if (toquesAhora(e, ahora, cfg) >= cfg.capacidad) return 0;
    const espera = Math.max(0, ahora - e.desde) % cfg.cadaMs;
    return cfg.cadaMs - espera;
  }
  return Object.freeze({ nuevo, toquesAhora, gastar, faltaMs });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_DEPOSITO;
