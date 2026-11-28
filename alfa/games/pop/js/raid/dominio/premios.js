// Fans of Pop · RAID, los premios (dominio puro, tarea 448): el escalón de un jugador según su CUENTA y su premio final, con un extra si la raid se
// vació. La CUENTA es lo que cobra el servidor: burbujas reventadas + golpes al jefe (cada golpe cuenta como una burbuja). cfg = { escalones:
// [{ desde, monedas, perlas, marco }, ...] de menor a mayor, extraVaciada: fracción de monedas extra }. El jefe CEO y su premio son de otro nodo.
// Cobrarlo (perlas por el monedero del servidor, idempotente) es del servidor.
'use strict';
const PP_RAID_PREMIOS = (() => {
  // el escalón más alto que alcanza con `cuenta`: { nivel (1 = el primero), desde, monedas, perlas, marco }, o null si la cuenta no llega al primero
  function escalon(cuenta, cfg) {
    let nivel = 0;
    cfg.escalones.forEach((e, i) => { if (cuenta >= e.desde) nivel = i + 1; });
    return nivel ? { nivel, ...cfg.escalones[nivel - 1] } : null;
  }
  // premio final: su escalón; si la raid se vació, además las monedas extra (monedas del escalón * extraVaciada, hacia abajo)
  function premioFinal(cuenta, vaciada, cfg) {
    const e = escalon(cuenta, cfg);
    if (!e) return { nivel: 0, monedasBase: 0, extra: 0, monedas: 0, perlas: 0, marco: false };
    const extra = vaciada ? Math.floor(e.monedas * cfg.extraVaciada) : 0;
    return { nivel: e.nivel, monedasBase: e.monedas, extra, monedas: e.monedas + extra, perlas: e.perlas, marco: !!e.marco };
  }
  return Object.freeze({ escalon, premioFinal });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_PREMIOS;
