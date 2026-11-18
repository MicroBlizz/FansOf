// Fans of Pop · LIBRO DE PERLAS (dominio; tarea #41, ADR 130): las reglas para llevar las perlas al servidor, donde son las gemas del
// monedero de 'pop'. Funciones puras: sin reloj, azar, SAVE, red ni dibujo.
// · Lo que se gana jugando (jefe, regalo, pase) y lo que se gasta (ayuda, seguir, vidas, hueco, infinitas; mundo, al saltar un jefe, tarea #95) viaja como un movimiento
//   { motivo, clave, gemas } para `anotar` (servidor/09): los motivos son los de la fila 'pop' de tablas_juego (herramientas/pop/pop_datos.js).
// · Las perlas DE PRUEBA (panel DEV y compras de prueba, solo en la alfa y en desarrollo) no existen en el servidor: se llevan aparte y
//   son las primeras que se gastan, así el servidor nunca recibe un gasto de perlas que no tiene.
// · El saldo que se pinta: lo que dice el servidor, más lo que aún no se le ha podido mandar, más las de prueba.
// Los errores son resultados con nombre: cantidad, motivo, clave.
'use strict';
const PP_LIBRO = Object.freeze((() => {
  const GANAR = Object.freeze(['jefe', 'regalo', 'pase']);
  const GASTAR = Object.freeze(['ayuda', 'seguir', 'vidas', 'hueco', 'infinitas', 'mundo']);
  const ok = v => Object.freeze({ ok: true, ...v });
  const error = e => Object.freeze({ ok: false, error: e });
  const entero = n => (Number.isInteger(n) && n > 0 ? n : 0);
  // un movimiento para el servidor: `perlas` positivo es ganar, negativo es gastar
  function mov(motivo, perlas, clave) {
    if (!Number.isInteger(perlas) || perlas === 0) return error('cantidad');
    if (!(perlas > 0 ? GANAR : GASTAR).includes(motivo)) return error('motivo');
    if (typeof clave !== 'string' || !clave || clave.length > 80) return error('clave');
    return ok({ mov: Object.freeze({ motivo, clave, gemas: perlas }) });
  }
  // un gasto: cuánto sale de las de prueba (primero) y cuánto del servidor
  function reparte(gasto, prueba) {
    const g = entero(gasto), dePrueba = Math.min(g, entero(prueba));
    return Object.freeze({ dePrueba, delServidor: g - dePrueba });
  }
  const pendiente = cola => (Array.isArray(cola) ? cola : []).reduce((a, m) => a + (m && Number.isInteger(m.gemas) ? m.gemas : 0), 0);
  // las que el servidor tendrá cuando reciba lo pendiente: con ellas se compra el perfil (las de prueba no cuentan)
  const deVerdad = (servidor, cola) => Math.max(0, (Number.isFinite(servidor) ? Math.floor(servidor) : 0) + pendiente(cola));
  // el saldo que se pinta en el juego
  const saldo = (servidor, cola, prueba) => deVerdad(servidor, cola) + entero(prueba);
  return { GANAR, GASTAR, mov, reparte, pendiente, deVerdad, saldo };
})());
if (typeof module !== 'undefined') module.exports = PP_LIBRO;
