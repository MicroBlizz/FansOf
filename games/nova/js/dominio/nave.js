// Fans Of Nova · NV.Nave: lo que le pasa a tu nave con el tiempo: el escudo se recarga si llevas un rato sin que te peguen, el parpadeo del
// golpe se apaga y la regeneración (mejora de sistema) cura poco a poco. Lo usa nvPaso (partida.js).
'use strict';
NV.Nave = (() => {
  function recupera(n, mejoras, dt) {
    if (n.esc) { if (n.esc.sin > 0) n.esc.sin -= dt; else n.esc.hp = Math.min(n.esc.cap, n.esc.hp + n.esc.reg * dt); }
    if (n.golpeado > 0) n.golpeado -= dt;
    if (mejoras.regen) n.hp = Math.min(n.hpMax, n.hp + mejoras.regen * dt);
  }
  return { recupera };
})();
