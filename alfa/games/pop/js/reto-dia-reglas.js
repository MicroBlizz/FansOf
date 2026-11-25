// Fans of Pop · EL RETO DEL DÍA, LAS REGLAS (dominio; tarea 367, ADR 226): cada día, la misma melodía de Memoria para todos (la semilla
// sale del día), en el mundo del día, en Normal y sin ayudas. 3 intentos al día (PP_CFG.reto): el primero gratis y los otros pagando
// (perlas o un anuncio); cuenta tu mejor ronda de hoy, que sube al ranking del día. Monedas por jugar: solo lo que mejora tu mejor de
// hoy, hasta un tope. Funciones puras sobre lo que se les pasa (el día 'AAAA-MM-DD', lo guardado, PP_CFG.reto): sin reloj, azar, SAVE
// ni dibujo. Lo usan js/reto-dia.js y js/memoria.js.
// El estado de hoy: { dia, jugados (intentos empezados), mejor (la mejor ronda de hoy), subido (la mejor que ya tiene el servidor) }.
'use strict';
const PP_RETO_R = (() => {
  const DIA = /^\d{4}-\d{2}-\d{2}$/;
  const MS_DIA = 86400000;
  const ok = x => Object.freeze({ ok: true, ...x });
  const error = motivo => Object.freeze({ ok: false, error: motivo });
  const entero = v => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  const diaValido = d => typeof d === 'string' && DIA.test(d) && !Number.isNaN(Date.parse(d));

  // la semilla del día: un número de 32 bits sacado del texto del día (FNV-1a), el mismo en todos los móviles
  function semilla(dia) {
    let h = 0x811c9dc5;
    for (const ch of 'pop-reto:' + dia) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  }
  // el mundo del día (de 0 a n-1): un día tras otro se pasa por todos, también por los que aún no has abierto
  const mundo = (dia, n) => {
    const d = Math.round(Date.parse(dia) / MS_DIA);
    return ((d % n) + n) % n;
  };

  // el estado de hoy: lo guardado si es de hoy; si es de otro día o no vale, uno nuevo
  function deHoy(guardado, dia) {
    const g = guardado && typeof guardado === 'object' && guardado.dia === dia ? guardado : {};
    const mejor = entero(g.mejor);
    return Object.freeze({ dia, jugados: entero(g.jugados), mejor, subido: Math.min(mejor, entero(g.subido)) });
  }
  const quedan = (e, cfg) => Math.max(0, cfg.intentos - e.jugados);
  // cómo es el siguiente intento: 'gratis' o 'pago' (con sus perlas); sin ninguno, el fallo 'agotado'
  function siguiente(e, cfg) {
    if (e.jugados < cfg.gratis) return ok({ como: 'gratis' });
    if (e.jugados < cfg.intentos) return ok({ como: 'pago', perlas: cfg.perlas });
    return error('agotado');
  }
  // empezar un intento pagado con `pago` ('perlas' o 'anuncio'; el gratis no lo mira). Fallos: dia, agotado, pago
  function empieza(e, cfg, pago) {
    if (!diaValido(e.dia)) return error('dia');
    const s = siguiente(e, cfg);
    if (!s.ok) return s;
    if (s.como === 'pago' && pago !== 'perlas' && pago !== 'anuncio') return error('pago');
    return ok({ como: s.como, estado: Object.freeze({ ...e, jugados: e.jugados + 1 }) });
  }
  // acabar un intento con `rondas`: la mejor de hoy y las monedas (solo lo que mejora tu mejor de hoy, hasta el tope)
  function acaba(e, cfg, rondas) {
    const r = entero(rondas), cobra = n => Math.min(cfg.tope, n * cfg.porRonda), mejor = Math.max(e.mejor, r);
    return ok({ estado: Object.freeze({ ...e, mejor }), nuevo: r > e.mejor, monedas: Math.max(0, cobra(r) - cobra(e.mejor)), lleno: cobra(mejor) >= cfg.tope });
  }
  // ¿falta subir la mejor de hoy al servidor? Y el estado cuando ya la tiene (o cuando no la quiere: no se vuelve a intentar)
  const pendiente = e => e.mejor > e.subido;
  const trasSubir = (e, rondas) => Object.freeze({ ...e, subido: Math.max(e.subido, Math.min(e.mejor, entero(rondas))) });

  return Object.freeze({ semilla, mundo, diaValido, deHoy, quedan, siguiente, empieza, acaba, pendiente, trasSubir });
})();
