// Fans Of Nova · NV.Jefe: cómo se mueve y apunta el jefe, en cuentas puras (sin azar, sin pantalla). El piloto entero, con sus ataques,
// está en jefe.js; aquí solo lo que se puede probar con números.
'use strict';
NV.Jefe = (() => {
  // Velocidad que quiere llevar: se acerca si estás lejos, se aleja si estás cerca y, a su distancia, gira de lado. Más rápido herido (f2),
  // muy lento apuntando el cañón (tele) y a medias justo después de disparar (quieto): ese es su punto débil.
  function velocidad(p, e, ideal, f2, J) {
    const dx = p.ve.x - e.x, dy = p.ve.y - e.y, d = Math.hypot(dx, dy) || 1, ax = dx / d, ay = dy / d;
    const rad = d > ideal * 1.15 ? 1 : d < ideal * 0.75 ? -1 : 0;
    const k = p.tele ? 0.2 : p.quieto > 0 ? 0.5 : 1, lado = rad ? 0.6 : 1, f = f2 ? 1.25 : 1;
    return [(ax * rad + -ay * p.lado * lado) * J.vel * f * k, (ay * rad + ax * p.lado * lado) * J.vel * f * k];
  }
  // Gira el ángulo `a` hacia `meta` como mucho `max` radianes, por el lado corto
  function giraCanon(a, meta, max) {
    let da = meta - a; da = Math.atan2(Math.sin(da), Math.cos(da));
    return a + Math.max(-max, Math.min(max, da));
  }
  return { velocidad, giraCanon };
})();
