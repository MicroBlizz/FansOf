// Fans Of Nova · NV.Frente: las reglas de Nova sobre la galaxia de la comunidad (lo tuyo: patrón, aportes, parte de guerra, premios y
// cambio de patrón). No mira el reloj ni la partida guardada: recibe la campaña `c`, la semana de hoy y el estado de la semana que calcula
// el sistema común (core/js/sistema/frente.js). Los datos (NV_FRENTE) y el mapa están en frente-nova.js, que es quien lo usa.
'use strict';
NV.Frente = (() => {
  // Lo tuyo dentro de la campaña (c.frente). Si empieza otra semana, la anterior queda pendiente para el parte de guerra.
  function deSemana(c, hoy) {
    if (!c.frente) c.frente = { semana: null, aportes: [], previa: null, patron: null, cosmeticos: [] };
    const f = c.frente;
    if (f.semana !== hoy) {
      if (f.semana && f.aportes.length) f.previa = { semana: f.semana, aportes: f.aportes, cobrada: false };
      f.semana = hoy; f.aportes = [];
    }
    return f;
  }
  const patron = c => (c.frente && c.frente.patron) || c.faccion;

  // Lo que suma una misión a tu patrón
  function puntosMision(P, gano, libero) { return P.mision + (gano ? P.victoria : 0) + (libero ? P.libera : 0); }
  const misPuntos = aportes => aportes.reduce((a, x) => a + x.puntos, 0);

  // El parte de guerra de la semana pasada, con `est` = cómo quedó (simulada con sus 7 días). null si no hay nada que cobrar.
  function parte(f, est, R, cosmeticos) {
    if (!f.previa || f.previa.cobrada) return null;
    const ganadora = est.ranking[0].faccion, mios = misPuntos(f.previa.aportes), conGanadora = f.previa.aportes.some(a => a.faccion === ganadora);
    const aleacion = Math.round(Math.min(R.tope, mios * R.porPunto) * (conGanadora ? R.ganadora : 1));
    const cosmetico = conGanadora ? cosmeticos.map(t => ganadora + '-' + t).find(id => !f.cosmeticos.includes(id)) || null : null;
    const extra = conGanadora && !cosmetico ? R.repetida || 0 : 0;   // ya tenías los tres de la ganadora: un extra de aleación y nada más
    return { est, ganadora, mios, aleacion, cosmetico, extra };
  }
  function cobra(c, f, p) {
    c.aleacion += p.aleacion + (p.extra || 0);
    if (p.cosmetico) { f.cosmeticos.push(p.cosmetico); NV.Cosmeticos.estrena(f, p.cosmetico); }
    f.previa.cobrada = true;
  }

  // Cambiar de patrón: carísimo a la primera del ranking, casi gratis a la última
  function precio(fac, ranking, C) {
    const i = ranking.findIndex(x => x.faccion === fac), n = ranking.length - 1;
    return Math.round(C.min + (C.max - C.min) * (n - i) / n);
  }
  // Devuelve true si se cambió (y cobra la aleación); false si ya es tu patrón o no te llega
  function cambia(c, f, fac, cuesta) {
    if (fac === patron(c) || c.aleacion < cuesta) return false;
    c.aleacion -= cuesta; f.patron = fac;
    return true;
  }

  return { deSemana, patron, puntosMision, misPuntos, parte, cobra, precio, cambia };
})();
