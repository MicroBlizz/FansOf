// Fans of Pop · PRUEBA DE RENDIMIENTO, las reglas (dominio puro, tarea 404): qué escenarios juega sola la prueba, qué variantes mide
// en cada uno (todo, con ahorro y quitando una parte del dibujo cada vez), el plan de pasos, el resumen de fps de un paso y cómo se leen
// dos tandas: qué parte cuesta más en cada escenario y qué ha empeorado de una tanda a otra. Sin reloj, azar, DOM ni partida:
// lo mueve js/banco-juego.js y lo usa también el guion de Chrome (herramientas/pruebas/pop/banco.mjs).
'use strict';
const PP_BANCO_REGLAS = (() => {
  // las partes del medidor (js/medidor-partes.js) que tiene sentido quitar en cada tipo de escenario; 'desenfoque' es el del panel de victoria
  const PARTES = Object.freeze({
    nivel: Object.freeze(['fondo', 'bandeja', 'burbujas', 'marcador', 'efectos']),
    victoria: Object.freeze(['desenfoque', 'fondo', 'efectos']),
    derrota: Object.freeze(['fondo']),
    duelo: Object.freeze(['fondo', 'marcador', 'efectos']),
    memoria: Object.freeze(['fondo', 'marcador', 'efectos']),
  });
  // qué se juega: tres tableros de nivel (por lado), las dos pantallas del final, el duelo y la memoria. `toca`: el bot va tocando mientras se mide
  const ESCENARIOS = Object.freeze([
    Object.freeze({ id: 'lado4', tipo: 'nivel', lado: 4, toca: true }),
    Object.freeze({ id: 'lado5', tipo: 'nivel', lado: 5, toca: true }),
    Object.freeze({ id: 'lado6', tipo: 'nivel', lado: 6, toca: true }),
    Object.freeze({ id: 'victoria', tipo: 'victoria', lado: 5, toca: false }),
    Object.freeze({ id: 'derrota', tipo: 'derrota', lado: 5, toca: false }),
    Object.freeze({ id: 'duelo', tipo: 'duelo', lado: 0, toca: true }),
    Object.freeze({ id: 'memoria', tipo: 'memoria', lado: 0, toca: false }),
  ]);
  const TIEMPOS = Object.freeze({ calienta: 800, mide: 3000 });   // ms de cada paso: se deja asentar y luego se mide
  const UMBRAL = Object.freeze({ fps: 50, p1: 30, peor: 0.1 });   // «va bien» desde 50 fps de media y 30 en el 1 % peor; «empeora» si baja más de un 10 %

  // las variantes de un escenario: todo pintado, con ahorro, y sin cada una de sus partes (la corta, solo todo y ahorro)
  function variantes(esc, corta = false) {
    const base = [{ id: 'todo', quita: [], ahorro: false }, { id: 'ahorro', quita: [], ahorro: true }];
    return corta ? base : base.concat(PARTES[esc.tipo].map(p => ({ id: 'sin-' + p, quita: [p], ahorro: false })));
  }
  // el plan: un paso por escenario y variante, en orden, cada uno con sus tiempos
  function plan({ corta = false, solo = null } = {}) {
    const pasos = [];
    for (const esc of ESCENARIOS) {
      if (solo && !solo.includes(esc.id)) continue;
      for (const v of variantes(esc, corta)) pasos.push({ escenario: esc.id, tipo: esc.tipo, lado: esc.lado, toca: esc.toca, variante: v.id, quita: v.quita, ahorro: v.ahorro, calienta: TIEMPOS.calienta, mide: TIEMPOS.mide });
    }
    return pasos;
  }
  const duracion = pasos => pasos.reduce((s, p) => s + p.calienta + p.mide, 0);
  const r1 = x => Math.round(x * 10) / 10;
  // el resumen de un paso, de los ms de cada fotograma medido: fps medio, fps del 1 % peor y el peor fotograma. Sin fotogramas, null
  function resumen(ms) {
    const validos = ms.filter(x => x > 0 && isFinite(x));
    if (!validos.length) return null;
    const orden = [...validos].sort((a, b) => a - b), suma = validos.reduce((s, x) => s + x, 0);
    const p99 = orden[Math.min(orden.length - 1, Math.floor(orden.length * 0.99))];
    return { fps: r1(validos.length * 1000 / suma), p1: r1(1000 / p99), peor: r1(1000 / orden[orden.length - 1]), fotogramas: validos.length };
  }
  // la tanda: el plan con el resumen de cada paso (los que no se pudieron medir llevan `fallo` con su motivo)
  function tanda(pasos, medidas) {
    return { v: 1, pasos: pasos.map((p, i) => Object.assign({ escenario: p.escenario, variante: p.variante }, medidas[i] && medidas[i].fps ? medidas[i] : { fallo: (medidas[i] && medidas[i].fallo) || 'sin-medida' })) };
  }
  const medidos = t => t.pasos.filter(p => !p.fallo);
  const de = (t, escenario, variante) => medidos(t).find(p => p.escenario === escenario && p.variante === variante) || null;
  const vaBien = p => p.fps >= UMBRAL.fps && p.p1 >= UMBRAL.p1;
  // cómo se lee una tanda: por escenario, cómo va con todo pintado y cuántos fps se ganan con cada variante, de más a menos
  function lectura(t) {
    const ids = [...new Set(t.pasos.map(p => p.escenario))];
    return ids.map(id => {
      const todo = de(t, id, 'todo');
      const ganan = !todo ? [] : medidos(t).filter(p => p.escenario === id && p.variante !== 'todo')
        .map(p => ({ variante: p.variante, fps: p.fps, gana: r1(p.fps - todo.fps) })).sort((a, b) => b.gana - a.gana);
      return { escenario: id, todo, bien: !!todo && vaBien(todo), ganan };
    });
  }
  // qué ha empeorado de la tanda `antes` a `ahora`: los pasos medidos en las dos cuyo fps medio baja más que el umbral
  function empeora(antes, ahora, umbral = UMBRAL.peor) {
    const peores = [];
    for (const p of medidos(ahora)) {
      const a = de(antes, p.escenario, p.variante);
      if (a && p.fps < a.fps * (1 - umbral)) peores.push({ escenario: p.escenario, variante: p.variante, antes: a.fps, ahora: p.fps, baja: r1((1 - p.fps / a.fps) * 100) });
    }
    return peores.sort((x, y) => y.baja - x.baja);
  }
  return Object.freeze({ PARTES, ESCENARIOS, TIEMPOS, UMBRAL, variantes, plan, duracion, resumen, tanda, lectura, empeora });
})();
if (typeof module !== 'undefined') module.exports = PP_BANCO_REGLAS;
