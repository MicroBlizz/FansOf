// Fans Of · /gestion, pestaña RECURSOS: las MARCAS de cada salida de Yoshi (dominio, sin red, reloj ni almacenamiento). Se guardan en Supabase, una fila
// por salida (recurso_encargo, servidor/189-recursos-encargos.sql; ADR 209): estado pendiente («En el aire»), valido («Sirve»), invalido («Descartar») o
// relanzar, con una nota; sin fila es «Sin mirar». Lo que se marca queda pendiente en este navegador hasta que el servidor dice que lo tiene: así una
// marca hecha sin red no se pierde y se manda con las demás. La lectura (leer) y el envío (guardar) se inyectan: la página les pasa el rpc de /gestion
// y los tests, uno de mentira. Guía: docs/guia/herramientas/galeria.md
'use strict';
const RECURSOS_MARCAS = (() => {
  const ESTADOS = ['pendiente', 'valido', 'invalido', 'relanzar'];
  const TEXTOS = { 'sin-mirar': 'Sin mirar', pendiente: 'En el aire', valido: 'Sirve', invalido: 'Descartar', relanzar: 'Relanzar' };
  const ETAPAS = ['propuestas', 'modelo', 'lonchas', 'todo'];
  const NOTA_MAX = 1000, NOMBRE = /^[a-z0-9-]{1,80}$/, JUEGO = /^[a-z0-9-]{1,40}$/;

  /** null si se puede marcar así; si no, el nombre del error (las mismas reglas que la tabla) */
  function valida(m) {
    if (!m || !ESTADOS.includes(m.estado)) return 'estado-desconocido';
    if (typeof m.nota !== 'string' || m.nota.length > NOTA_MAX) return 'nota-no-valida';
    if (!JUEGO.test(m.juego || '') || !NOMBRE.test(m.nombre || '') || !ETAPAS.includes(m.etapa)) return 'encargo-no-valido';
    return null;
  }
  /** Un nombre como lo acepta la tabla: minúsculas, cifras y guiones, hasta 80 */
  const nombreValido = n => String(n || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'sin-nombre';
  /** Las pendientes con la de esa salida puesta (m: { estado, nota, juego, nombre, etapa }; cuando: ISO). Una marca mal hecha no entra y se dice */
  function pon(pendientes, salida, m, cuando) {
    const marca = { estado: m.estado, nota: String(m.nota || '').trim(), juego: m.juego, nombre: m.nombre, etapa: m.etapa, fecha: cuando };
    const error = valida(marca);
    return error ? { ok: false, error, pendientes } : { ok: true, pendientes: { ...pendientes, [salida]: marca } };
  }
  /** Las filas del servidor como { salida: { estado, nota, fecha, id } }; las que no traen salida o estado conocido no cuentan */
  function desdeFilas(filas) {
    const guardadas = {};
    for (const f of Array.isArray(filas) ? filas : []) {
      if (f && typeof f.salida === 'string' && ESTADOS.includes(f.estado)) guardadas[f.salida] = { estado: f.estado, nota: f.nota || '', fecha: f.actualizado || f.creado || '', id: f.id, quien: f.quien || '' };
    }
    return guardadas;
  }
  const ms = s => Date.parse(s) || 0;
  /** Las marcas que se ven: las guardadas y, encima, las pendientes más nuevas que la guardada (si otro la cambió después, manda la suya) */
  function mezcla(guardadas, pendientes) {
    const todas = {};
    for (const [salida, m] of Object.entries(guardadas || {})) todas[salida] = { ...m, origen: 'guardada' };
    for (const [salida, m] of Object.entries(pendientes || {})) {
      if (!todas[salida] || ms(m.fecha) >= ms(todas[salida].fecha)) todas[salida] = { estado: m.estado, nota: m.nota, fecha: m.fecha, origen: 'pendiente' };
    }
    return todas;
  }
  const estadoDe = (marcas, salida) => (marcas[salida] || {}).estado || 'sin-mirar';
  /** Cuántas hay de cada estado (y sin mirar) entre esas salidas */
  function cuentas(marcas, salidas) {
    const c = { 'sin-mirar': 0, ...Object.fromEntries(ESTADOS.map(e => [e, 0])) };
    for (const s of salidas) c[estadoDe(marcas, s)]++;
    return c;
  }
  /** Los argumentos de gestion_recurso_marcar para una salida. run: el del nombre de la salida (RECURSOS_DATOS.marcas), null si no lo lleva;
   *  el padre aún no se sabe desde aquí: va vacío. La tarea no se manda: la tabla la calcula del nombre de la salida */
  const argumentos = (token, salida, m, run = null) => ({ p_token: token, p_salida: salida, p_juego: m.juego, p_nombre: m.nombre, p_etapa: m.etapa, p_run: run, p_padre: null, p_estado: m.estado, p_nota: m.nota });
  // una marca: lo que conteste el servidor, o { ok: false, motivo } si no contesta bien o la llamada falla
  async function una(enviar, salida, m) {
    try { const r = await enviar(salida, m); return r && r.ok ? r : { ok: false, motivo: (r && r.motivo) || 'sin-respuesta' }; }
    catch (e) { return { ok: false, motivo: String((e && e.message) || e) }; }
  }
  /** Manda las pendientes, una a una, con enviar(salida, marca) (inyectado; contesta { ok, id } o { ok: false, motivo }). Devuelve
   *  { ok, enviadas: { salida: id }, fallidas: [{ salida, motivo }], pendientes } (las que quedan), o { ok: false, error: 'envio-sin-decidir' } si no hay envío */
  async function guardar(pendientes, enviar) {
    if (typeof enviar !== 'function') return { ok: false, error: 'envio-sin-decidir', pendientes };
    const enviadas = {}, fallidas = [], quedan = { ...pendientes };
    for (const [salida, m] of Object.entries(pendientes || {})) {
      const r = await una(enviar, salida, m);
      if (r.ok) { enviadas[salida] = r.id; delete quedan[salida]; } else fallidas.push({ salida, motivo: r.motivo });
    }
    return { ok: !fallidas.length, enviadas, fallidas, pendientes: quedan };
  }
  /** Las pendientes que quedan tras un envío: sin las que el servidor confirmó, salvo las que se volvieron a marcar mientras se mandaban */
  function confirmadas(actuales, mandadas, enviadas) {
    const quedan = { ...actuales };
    for (const salida of Object.keys(enviadas || {})) if (quedan[salida] === (mandadas || {})[salida]) delete quedan[salida];
    return quedan;
  }
  /** Las marcas guardadas del juego con lector(juego) (inyectado; da las filas): { guardadas } o { guardadas: {}, error: 'lectura-fallida', motivo } */
  async function leer(juego, lector) {
    if (typeof lector !== 'function') return { guardadas: {}, error: 'lectura-sin-decidir' };
    try { return { guardadas: desdeFilas(await lector(juego)) }; }
    catch (e) { return { guardadas: {}, error: 'lectura-fallida', motivo: String((e && e.message) || e) }; }
  }
  return { ESTADOS, TEXTOS, ETAPAS, valida, nombreValido, pon, desdeFilas, mezcla, estadoDe, cuentas, argumentos, guardar, confirmadas, leer };
})();
if (typeof module !== 'undefined') module.exports = RECURSOS_MARCAS;   // en node (tests/gestion/recursos-marcas.test.mjs) solo se carga
