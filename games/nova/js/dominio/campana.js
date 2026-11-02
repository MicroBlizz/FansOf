// Fans Of Nova · NV.Campana: las reglas de la campaña personal (una campaña nueva, lo que paga una misión y cómo se cierra) sobre el objeto
// de la campaña guardada (SAVE). Sin localStorage, reloj, retos ni pantalla: el azar se le pasa y los avisos (retos, galaxia de la comunidad,
// guardar) los hace quien llama (campana.js). Probado en tests/nova/unitarios/campana-dominio.test.mjs.
'use strict';
NV.Campana = (() => {
  // Una campaña vacía; de la versión 1 (`prev`) se conservan la aleación, las mejoras y las cuentas. `azar` da un número en [0, 1).
  function nueva(prev, azar) {
    const p = prev || {};
    return { v: 2, faccion: null, semilla: 1 + Math.floor(azar() * 1e9), aleacion: p.aleacion || 0, mejoras: p.mejoras || {}, libres: [], misiones: p.misiones || 0, victorias: p.victorias || 0, fac: p.fac || {}, combos: p.combos || {} };
  }

  // Lo que paga una misión: 5 por rango y medio por enemigo, +30 % por cada nivel de peligro por encima de 1; perder paga la mitad
  function aleacionMision(rango, muertos, peligro, gano) {
    const base = 5 * rango + 0.5 * muertos, p = 1 + 0.3 * ((peligro || 1) - 1);
    return Math.round(base * p * (gano ? 1 : 0.5));
  }

  // Cierra una misión en la campaña `c`: suma la aleación, cuenta la misión y, si se ganó, la victoria y el sector liberado.
  // Devuelve { aleacion, libero } para que quien llama avise a los retos y a la galaxia de la comunidad.
  function cierraMision(c, { rango, muertos, peligro, gano, sector }) {
    const aleacion = aleacionMision(rango, muertos, peligro, gano);
    c.aleacion += aleacion; c.misiones++;
    let libero = false;
    if (gano) {
      c.victorias++;
      if (sector && !c.libres.includes(sector)) { c.libres.push(sector); libero = true; }
    }
    return { aleacion, libero };
  }

  // Lo que enseña la ventana de «¿qué partida quieres?» de la nube al comparar dos campañas
  function resumen(s) {
    const n = v => (typeof v === 'number' && isFinite(v) ? v : 0), suma = o => Object.keys(o || {}).reduce((a, k) => a + n(o[k]), 0);
    return [['Aleación', n(s.aleacion)], ['Sectores liberados', (s.libres || []).length], ['Misiones jugadas', n(s.misiones)],
      ['Misiones ganadas', n(s.victorias)], ['Mejoras de la nave capital', suma(s.mejoras)]];
  }

  return { nueva, aleacionMision, cierraMision, resumen };
})();
