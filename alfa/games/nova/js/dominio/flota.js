// Fans Of Nova · NV.Flota: las reglas de la flota que trabaja mientras no juegas (cuánto produce cada nave, el tope de la bodega,
// recoger y cambiar de trabajo), sin pantalla ni reloj propio: la hora la pasa quien llama (`ahora`, en ms). Si el reloj va hacia
// atrás no se produce nada, y adelantarlo da como mucho una bodega llena. Datos: datos-flota.js. Diseño: docs/nova/idle-flota.md.
// Probado en tests/nova/unitarios/flota-dominio.test.mjs.
'use strict';
NV.Flota = (() => {
  const HORA = 3600000;
  const nueva = () => ({ naves: {}, mejoras: {} });
  const nivel = (fl, m) => (fl.mejoras && fl.mejoras[m]) || 0;

  // Horas que caben en la bodega y cuántas naves pueden trabajar a la vez
  const topeHoras = (fl, F) => F.topeHoras + nivel(fl, 'bodega') * F.mejoras.bodega.horas;
  const maxNaves = (fl, F) => F.naves[Math.min(nivel(fl, 'naves'), F.naves.length - 1)];
  const trabajando = fl => Object.keys(fl.naves).filter(id => fl.naves[id].trabajo);

  // Lo que produce una nave por hora: el ritmo de su trabajo, por su sector, su nivel (+10 % cada uno) y la mejora de velocidad
  function ritmo(n, fl, F) {
    const T = F.trabajos[n.trabajo];
    if (!T || T.bloqueado) return 0;
    const sector = (T.sectores && T.sectores[n.tipo]) || 1;
    return T.ritmo * sector * (1 + 0.1 * ((n.nivel || 1) - 1)) * (1 + nivel(fl, 'velocidad') * F.mejoras.velocidad.parte);
  }
  // Horas de trabajo que lleva una nave hasta `ahora`, con el tope de la bodega
  function horas(n, ahora, tope) {
    if (!n.trabajo || !(ahora > n.desde)) return 0;
    return Math.min(tope, (ahora - n.desde) / HORA);
  }

  // Lo que hay para recoger: el total por recurso, por nave, y si alguna ya tiene la bodega llena
  function pendiente(fl, ahora, F) {
    const tope = topeHoras(fl, F), out = { total: {}, naves: {}, llena: false };
    for (const id of trabajando(fl)) {
      const n = fl.naves[id], T = F.trabajos[n.trabajo], h = horas(n, ahora, tope), x = Math.floor(h * ritmo(n, fl, F));
      out.naves[id] = { horas: h, cantidad: x };
      if (T && T.produce && x > 0) out.total[T.produce] = (out.total[T.produce] || 0) + x;
      if (h >= tope && ritmo(n, fl, F) > 0) out.llena = true;
    }
    return out;
  }
  // Recoger: devuelve lo producido y vuelve a empezar a contar desde `ahora` (también si el reloj fue hacia atrás)
  function recoge(fl, ahora, F) {
    const p = pendiente(fl, ahora, F);
    for (const id of trabajando(fl)) fl.naves[id].desde = ahora;
    return p.total;
  }

  // Poner una nave a trabajar (o quitarla con trabajo = null) en un sector de tipo `tipo`. Lo que llevaba se recoge antes:
  // devuelve lo recogido, o null si no se puede (trabajo bloqueado o ya trabajan todas las que caben).
  function asigna(fl, id, trabajo, sector, tipo, ahora, F) {
    if (trabajo && (!F.trabajos[trabajo] || F.trabajos[trabajo].bloqueado)) return null;
    const n = fl.naves[id] || (fl.naves[id] = { nivel: 1 });
    if (trabajo && !n.trabajo && trabajando(fl).length >= maxNaves(fl, F)) return null;
    const antes = n.trabajo ? recogeNave(fl, n, ahora, F) : {};
    Object.assign(n, { trabajo: trabajo || null, sector: trabajo ? sector : null, tipo: trabajo ? tipo : null, desde: ahora });
    return antes;
  }
  function recogeNave(fl, n, ahora, F) {
    const T = F.trabajos[n.trabajo], x = Math.floor(horas(n, ahora, topeHoras(fl, F)) * ritmo(n, fl, F));
    return T && T.produce && x > 0 ? { [T.produce]: x } : {};
  }

  // Mejoras de la flota: lo que cuesta la siguiente (null si ya está al máximo) y comprarla con la aleación de la campaña `c`
  function coste(fl, m, F) { const k = nivel(fl, m); return k < F.mejoras[m].max ? F.mejoras[m].coste[k] : null; }
  function mejora(c, fl, m, F) {
    const p = coste(fl, m, F);
    if (p === null || c.aleacion < p) return false;
    c.aleacion -= p; fl.mejoras[m] = nivel(fl, m) + 1;
    return true;
  }

  return { nueva, nivel, topeHoras, maxNaves, trabajando, ritmo, horas, pendiente, recoge, asigna, coste, mejora };
})();
