// Fans Of · /gestion, RENDIMIENTO: las reglas de las «tandas» de la prueba automática (dominio, sin red, reloj ni DOM). De lo que devuelve
// gestion_rendimiento_tandas (servidor/203-rendimiento-tandas.sql): cómo se nombra el aparato de una tanda, cuál es la anterior comparable
// (mismo origen, plataforma y CPU frenada) y cómo se lee (lectura y empeora vienen de PP_BANCO_REGLAS, games/pop/js/banco-reglas.js: no se copian).
'use strict';
const RENDIMIENTO_TANDAS = (() => {
  const R = typeof PP_BANCO_REGLAS !== 'undefined' ? PP_BANCO_REGLAS : require('../games/pop/js/banco-reglas.js');
  const num = x => String(x).replace('.', ',');
  // «PC 1920×1080@1 · 8 núcleos · 16 GB · CPU frenada ×4»; lo que no se sepa no sale
  function aparato(t) {
    const trozos = [(t.plataforma === 'pc' ? 'PC' : 'móvil') + (t.ancho && t.alto ? ` ${t.ancho}×${t.alto}` : '') + (t.dpr ? `@${num(t.dpr)}` : '')];
    if (t.nucleos) trozos.push(`${t.nucleos} núcleos`);
    if (t.memoria) trozos.push(`${num(t.memoria)} GB`);
    if (t.cpu_frenada && t.cpu_frenada > 1) trozos.push(`CPU frenada ×${num(t.cpu_frenada)}`);
    return trozos.join(' · ');
  }
  const comparables = (a, b) => a.origen === b.origen && a.plataforma === b.plataforma && (a.cpu_frenada || 1) === (b.cpu_frenada || 1);
  // la tanda anterior comparable a `t` dentro de `lista` (de la más nueva a la más vieja): la primera más vieja que ella y comparable, o null
  function anterior(lista, t) {
    const i = lista.indexOf(t);
    return i < 0 ? null : lista.slice(i + 1).find(o => comparables(o, t)) || null;
  }
  const tanda = t => ({ v: 1, pasos: Array.isArray(t.pasos) ? t.pasos : [] });
  // lo que se enseña de una tanda: { lectura (por escenario), empeora (frente a la anterior comparable, o []), anterior }
  function leer(lista, t) {
    const ant = anterior(lista, t);
    return { lectura: R.lectura(tanda(t)), empeora: ant ? R.empeora(tanda(ant), tanda(t)) : [], anterior: ant };
  }
  const fallos = t => tanda(t).pasos.filter(p => p.fallo).length;
  return Object.freeze({ aparato, comparables, anterior, leer, fallos });
})();
if (typeof module !== 'undefined') module.exports = RENDIMIENTO_TANDAS;
