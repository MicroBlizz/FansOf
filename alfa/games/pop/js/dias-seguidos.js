// Fans of Pop · DÍAS SEGUIDOS, reglas (dominio; tarea #383, ADR 221): el Regalo diario como un camino de 7 días que avanza cada día que
// entras, con UN DÍA DE PERDÓN (faltar un día no corta la cuenta; faltar dos, o faltar otra vez sin perdón, vuelve al día 1). El perdón
// vuelve al completar un camino de 7 y al volver al día 1. Ojo: en Pop «racha» es otra cosa (niveles seguidos sin perder corazón, js/pase.js).
// Funciones puras: sin reloj, azar, SAVE ni dibujo; el día llega de fuera como 'AAAA-MM-DD'. Los fallos de reglas son resultados con nombre.
'use strict';
const PP_DIAS_SEGUIDOS = Object.freeze((() => {
  const LARGO = 7;
  const DIA = /^\d{4}-\d{2}-\d{2}$/;
  const MS = 86400000;
  const ok = v => Object.freeze({ ok: true, ...v });
  const error = e => Object.freeze({ ok: false, error: e });
  const entero = (n, min, max) => (Number.isInteger(n) ? Math.min(max, Math.max(min, n)) : min);
  const diaValido = d => typeof d === 'string' && DIA.test(d) && !Number.isNaN(Date.parse(d));
  const NUEVO = Object.freeze({ ultimo: '', paso: -1, total: 0, perdon: true });
  // lo guardado, limpio: `ultimo` el día del último regalo abierto, `paso` el día del camino que se abrió (0 a 6; -1 sin empezar),
  // `total` los días seguidos que llevas y `perdon` si te queda el día de perdón
  function estado(x) {
    if (!x || typeof x !== 'object' || !diaValido(x.ultimo)) return NUEVO;
    return Object.freeze({ ultimo: x.ultimo, paso: entero(x.paso, 0, LARGO - 1), total: entero(x.total, 1, 99999), perdon: x.perdon !== false });
  }
  const diasEntre = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / MS);
  // qué pasaría si se abre hoy: 'primero', 'sigue', 'perdon' (faltó un día y lo cubre el perdón), 'reinicia' o 'abierto' (ya está cogido;
  // también si el día va hacia atrás, para que cambiar la fecha no dé otro regalo)
  function caso(e, hoy) {
    if (!e.ultimo) return 'primero';
    const d = diasEntre(e.ultimo, hoy);
    if (d <= 0) return 'abierto';
    if (d === 1) return 'sigue';
    return d === 2 && e.perdon ? 'perdon' : 'reinicia';
  }
  const avanza = c => c === 'sigue' || c === 'perdon';
  // lo que enseña la ventana hoy: `paso` es el día del camino de hoy (0 a 6), abierto o por abrir
  function mira(guardado, hoy) {
    if (!diaValido(hoy)) return error('dia');
    const e = estado(guardado), c = caso(e, hoy), abierto = c === 'abierto';
    const paso = abierto ? e.paso : avanza(c) ? (e.paso + 1) % LARGO : 0;
    const total = abierto ? e.total : avanza(c) ? e.total + 1 : 1;
    return ok({ caso: c, abierto, paso, total, perdon: abierto ? e.perdon : c === 'sigue' ? e.perdon : c !== 'perdon' });
  }
  // abrir el regalo de hoy: da el estado nuevo para guardar y el día del camino que toca
  function abre(guardado, hoy) {
    const m = mira(guardado, hoy);
    if (!m.ok) return m;
    if (m.abierto) return error('abierto');
    const completo = m.paso === LARGO - 1;
    const nuevo = Object.freeze({ ultimo: hoy, paso: m.paso, total: m.total, perdon: completo ? true : m.perdon });
    return ok({ estado: nuevo, paso: m.paso, total: m.total, caso: m.caso, completo });
  }
  return { LARGO, estado, mira, abre };
})());
