// Fans of Pop · LOS COMBOS, LAS REGLAS (dominio; tarea 396, ADR 234). Un COMBO xN es el N-ésimo toque seguido que revienta 3 burbujas o
// más (js/tablero.js). Desde x3 cada paso da puntos para el ranking de la semana (x3 = 1, x4 = 2, x5 = 3…; en Pesadilla, el doble) y las
// mismas monedas, con un tope al día (PP_CFG.combos.topeDia). Funciones puras sobre lo que se les pasa (el día 'AAAA-MM-DD' de España y lo
// guardado): sin reloj, azar, SAVE ni dibujo. Lo usa js/combos.js.
// Lo guardado: { dia, monedas (las dadas hoy por combos), lunes (el lunes de la semana del ranking), puntos (los de esa semana),
// subido (los que ya tiene el servidor), record (el mayor combo de siempre), previa ({ lunes, puntos } de la semana anterior que aún no
// tiene el servidor, o null: al cambiar de semana sin red no se pierden) }.
'use strict';
const PP_COMBOS_R = (() => {
  const DIA = /^\d{4}-\d{2}-\d{2}$/;
  const TOPE_SEMANA = 50000;   // los puntos de una semana, como mucho (el mismo tope que pop_combo_marca, servidor/200)
  const entero = v => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  const diaValido = d => typeof d === 'string' && DIA.test(d) && !Number.isNaN(Date.parse(d)) && new Date(d + 'T00:00:00Z').toISOString().startsWith(d);

  // los puntos (y monedas) de un paso de combo: nada hasta x3; en Pesadilla (`lo`), el doble
  const puntos = (n, lo) => (entero(n) >= 3 ? (entero(n) - 2) * (lo ? 2 : 1) : 0);
  // el combo tras el salto de un compañero (Pepins, 26-11-2026): si revienta 3 o más, sube uno, como un toque tuyo; si revienta menos,
  // no lo rompe
  const deAmigo = (combo, golpes) => entero(combo) + (entero(golpes) >= 3 ? 1 : 0);

  // el lunes de la semana de un día (la semana del ranking va de lunes a domingo); `atras` semanas antes
  function lunes(dia, atras = 0) {
    const d = new Date(dia + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) - 7 * atras);
    return d.toISOString().slice(0, 10);
  }

  // lo de la semana pasada que el servidor aún no tiene: solo vale la semana justo anterior (el servidor no admite más atrás)
  function previaDe(s, l) {
    const ant = lunes(l, 1);
    if (s.lunes === ant && entero(s.puntos) > entero(s.subido)) return Object.freeze({ lunes: ant, puntos: entero(s.puntos) });
    const p = s.previa;
    return p && p.lunes === ant && entero(p.puntos) > 0 ? Object.freeze({ lunes: ant, puntos: entero(p.puntos) }) : null;
  }
  // lo guardado, al día de hoy: otro día pone a cero las monedas de hoy; otra semana, los puntos (lo que quedó sin subir pasa a `previa`).
  // El récord no se pierde nunca
  function deHoy(g, dia) {
    const s = g && typeof g === 'object' ? g : {}, l = lunes(dia);
    const mismaSemana = s.lunes === l;
    return Object.freeze({
      dia, monedas: s.dia === dia ? entero(s.monedas) : 0, lunes: l,
      puntos: mismaSemana ? entero(s.puntos) : 0, subido: mismaSemana ? entero(s.subido) : 0, record: entero(s.record),
      previa: mismaSemana ? (s.previa && s.previa.lunes === lunes(l, 1) ? s.previa : null) : previaDe(s, l),
    });
  }

  // un paso de combo xN: { estado, puntos, monedas (las que caben bajo el tope de hoy), record (¿bate un récord que ya había?) }
  function paso(g, dia, n, lo, topeDia) {
    const e = deHoy(g, dia), p = puntos(n, lo), m = Math.min(p, Math.max(0, entero(topeDia) - e.monedas));
    const supera = entero(n) > e.record;
    const estado = Object.freeze({ ...e, monedas: e.monedas + m, puntos: Math.min(TOPE_SEMANA, e.puntos + p), record: supera ? entero(n) : e.record });
    return Object.freeze({ estado, puntos: p, monedas: m, record: supera && e.record > 0 });
  }

  // lo que falta subir, en orden: la semana anterior (si quedó algo) y la de ahora → [{ lunes, puntos }]
  function pendientes(e) {
    if (!e) return [];
    const r = [];
    if (e.previa) r.push(Object.freeze({ lunes: e.previa.lunes, puntos: e.previa.puntos }));
    if (e.puntos > e.subido) r.push(Object.freeze({ lunes: e.lunes, puntos: e.puntos }));
    return r;
  }
  // tras subir `p` puntos de la semana `l`: se apuntan como subidos (si mientras tanto llegaron más, siguen pendientes)
  function trasSubir(e, l, p) {
    if (l === e.lunes) return Object.freeze({ ...e, subido: Math.max(e.subido, entero(p)) });
    if (e.previa && l === e.previa.lunes && entero(p) >= e.previa.puntos) return Object.freeze({ ...e, previa: null });
    return e;
  }

  return Object.freeze({ TOPE_SEMANA, diaValido, puntos, deAmigo, lunes, deHoy, paso, pendientes, trasSubir });
})();
