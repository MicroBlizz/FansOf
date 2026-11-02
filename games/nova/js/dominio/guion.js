// Fans Of Nova · NV.Guion: la primera misión guiada como una lista de pasos. Cada suceso de la partida (moverse, una baja, comer restos,
// elegir carta…) avanza el paso que toca; los que dependen de la suerte se dan por hechos al pasar su espera. Sin pantalla ni reloj
// propio: el tiempo se le pasa. Datos en datos-guion.js; lo enseña guion.js. Probado en tests/nova/unitarios/guion-dominio.test.mjs.
'use strict';
NV.Guion = (() => {
  function nuevo() { return { i: 0, llevo: 0, tiempo: 0 }; }
  function actual(g, D) { return g && D.pasos[g.i] || null; }
  function hecho(g, D) { return !!g && g.i >= D.pasos.length; }
  function avanza(g) { g.i++; g.llevo = 0; g.tiempo = 0; return true; }

  // Un suceso de la partida: suma al paso actual si es el suyo y lo completa al llegar a `cuanto`. Devuelve true si avanzó.
  function suceso(g, D, nombre, cantidad) {
    const p = actual(g, D);
    if (!p || p.suceso !== nombre) return false;
    g.llevo += cantidad === undefined ? 1 : cantidad;
    return g.llevo >= (p.cuanto || 1) ? avanza(g) : false;
  }

  // Pasa el tiempo: un paso con `espera` se da por hecho al cumplirse. Devuelve true si avanzó.
  function paso(g, D, dt) {
    const p = actual(g, D);
    if (!p) return false;
    g.tiempo += dt;
    return p.espera !== undefined && g.tiempo >= p.espera ? avanza(g) : false;
  }

  // El jefe llega al empezar su paso o, como tarde, a los `jefeEn` segundos
  function llegaJefe(g, D, t) { const p = actual(g, D); return (!!p && p.suceso === 'victoria') || t >= D.jefeEn; }

  return { nuevo, actual, hecho, suceso, paso, llegaJefe };
})();
