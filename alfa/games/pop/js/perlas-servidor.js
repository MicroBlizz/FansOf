// Fans of Pop · PERLAS Y PERFIL EN EL SERVIDOR (aplicación; tarea #41, ADR 130): los casos de uso que juntan la partida del móvil con el
// monedero de 'pop' del servidor. Las reglas están en js/perlas-libro.js y js/perfil.js; aquí solo se ordena quién habla con quién.
// · arranca(): con cuenta y red, abre el monedero la primera vez (pop_monedero trae las perlas del móvil, hasta 300) y después pide el saldo.
// · mueve(perlas, motivo, clave): TODA perla que entra o sale del juego pasa por aquí (ppPerlas). Cambia la copia del móvil al momento y, si
//   el monedero está abierto, apunta el movimiento en una cola (core/js/sistema/cola.js) que se manda a `anotar` cuando hay red.
// · compra(artículo, precio): una cosa del perfil con comprar_fijo. Sin cuenta no se compra (salvo las compras de prueba del panel DEV).
// · pon(perfil): guarda lo puesto en el móvil y, con cuenta, en el servidor (pop_poner), que comprueba que se tiene.
// · regala(n): las perlas del panel DEV. Con cuenta de probador (rol alfa, tarea #120, ADR 146) y el monedero abierto las suma el servidor
//   (PROBADOR.regalo) y son de verdad; si no, son de prueba, como siempre. alRegalo(estado) aplica lo que devuelve (gancho 'probador-regalo').
// · olvida(): tras resetear los recursos de la cuenta en el servidor (gancho 'probador-reseteo'), vacía la copia de este móvil.
// Todo va tras el flag 'tienda-gemas' de Pop: con él cerrado nada de esto habla con el servidor y el juego va como antes.
// Sin globales ni DOM: todo entra por puertos. cuenta (como CUENTA, o null), save() (la partida), guarda(), cola (como COLA), activo()
// (el flag), enLinea(), pruebas() (¿compras de prueba encendidas?), alCambiar() (repintar), sello() (un texto distinto cada vez) y
// probador (como PROBADOR de core, o null: puede() y regalo(n)).
// Lo guarda en save().srv: { usuario, abierto, gemas, cola, prueba, n, reclamos, reclamosPrueba, puesto }.
// Los errores son resultados con nombre: sin_cuenta, sin_red, faltan_perlas, tienda_cerrada, no_existe, no_lo_tienes, servidor; los de
// regala(), los de PROBADOR (sin_monedero, sin_funcion…) y `datos`.
'use strict';
const PP_PERLAS = {};
PP_PERLAS.crea = ({ cuenta, save, guarda, cola, activo, enLinea = () => true, pruebas = () => false, alCambiar = () => {}, sello = () => Date.now().toString(36), probador = null }) => {
  const NUEVO = () => ({ usuario: '', abierto: false, gemas: 0, cola: [], prueba: 0, n: 0, reclamos: [], reclamosPrueba: [], puesto: '' });
  const ok = v => Object.freeze({ ok: true, ...v });
  const error = e => Object.freeze({ ok: false, error: e });
  function S() {
    const s = save();
    if (!s.srv || typeof s.srv !== 'object' || !Array.isArray(s.srv.cola)) s.srv = NUEVO();
    return s.srv;
  }
  const conectado = () => !!(activo() && cuenta && cuenta.activa && cuenta.usuario);
  const listo = () => conectado() && S().abierto && S().usuario === cuenta.usuario;
  const esPerfil = c => typeof c === 'string' && c.startsWith('fijo:perfil:');
  const avisa = e => console.warn('Pop: el servidor de perlas no responde', e);
  // un fallo que no se arregla reintentando (lo rechaza el servidor); sin red o con el servidor caído se reintenta
  const definitivo = e => { const n = e && e.estado; return n >= 400 && n < 500 && n !== 401 && n !== 408 && n !== 429; };
  const CONOCIDOS = ['faltan_gemas', 'ya_lo_tienes', 'tienda_cerrada', 'no_existe', 'no_lo_tienes', 'sin_monedero', 'sin_sesion'];
  function nombreError(e) {
    const m = String((e && e.message) || e), k = CONOCIDOS.find(x => m.includes(x));
    if (k) return k === 'faltan_gemas' ? 'faltan_perlas' : k;
    return definitivo(e) ? 'servidor' : 'sin_red';
  }
  // el saldo que dice el servidor (y lo comprado del perfil) pasa a la copia del móvil
  function aplica(e) {
    if (!e || typeof e.gemas !== 'number') return;
    const s = S();
    s.gemas = e.gemas;
    if (Array.isArray(e.reclamos)) s.reclamos = e.reclamos.filter(esPerfil);
    save().perlas = PP_LIBRO.saldo(s.gemas, s.cola, s.prueba);
    guarda(); alCambiar();
  }
  let ultimo = null;   // lo último que ha contestado `anotar`: se aplica cuando la cola deja de mandar
  const C = cola.crea({
    lista: () => S().cola, guarda, definitivo,
    envia: async m => { ultimo = await cuenta.rpc('anotar', { p_juego: 'pop', p_movs: [m] }); },
  });
  // manda lo pendiente; true si no queda nada por mandar
  async function manda() {
    if (!listo() || !enLinea()) return false;
    const vacia = await C.envia();
    if (ultimo) { aplica(ultimo); ultimo = null; }
    return vacia;
  }
  async function abre() {
    const u = cuenta.usuario, s = S();
    if (s.usuario !== u) Object.assign(s, NUEVO(), { usuario: u, reclamosPrueba: s.reclamosPrueba || [] });   // otra cuenta: su libro empieza limpio
    const e = await cuenta.rpc('pop_monedero', { p_perlas: Math.max(0, Math.floor(save().perlas || 0)) });
    if (cuenta.usuario !== u) return;
    s.abierto = true; s.prueba = 0; s.cola.length = 0;   // desde aquí manda el servidor: lo del móvil ya se ha traído (hasta el tope)
    aplica(e);
  }
  async function refresca() {
    if (!await manda()) return;
    aplica(await cuenta.rpc('estado', { p_juego: 'pop' }));
  }
  // lo puesto: si este móvil no tiene nada, se trae lo del servidor; si tiene algo sin subir, se sube
  async function igualaPuesto() {
    const sv = save(), s = S();
    if (!sv.perfil) { const p = await cuenta.rpc('pop_perfil_de', { p_usuario: cuenta.usuario }); if (p) { sv.perfil = p; s.puesto = JSON.stringify(p); guarda(); alCambiar(); } return; }
    if (s.puesto !== JSON.stringify(sv.perfil)) await pon(sv.perfil);
  }
  let arrancando = null;
  function arranca() {
    if (!conectado() || !enLinea()) return Promise.resolve(false);
    if (!arrancando) arrancando = (async () => { if (listo()) await refresca(); else await abre(); await igualaPuesto(); return true; })()
      .catch(e => { avisa(e); return false; }).finally(() => { arrancando = null; });
    return arrancando;
  }
  // apunta en el libro un movimiento ya hecho en la copia del móvil
  function apunta(delta, motivo, clave) {
    const s = S();
    let alServidor = delta;
    if (delta < 0) { const r = PP_LIBRO.reparte(-delta, s.prueba); s.prueba -= r.dePrueba; alServidor = -r.delServidor; }
    if (!alServidor) return;
    const m = PP_LIBRO.mov(motivo, alServidor, clave || `${motivo}:${sello()}:${++s.n}`);
    if (m.ok) { s.cola.push(m.mov); manda().catch(avisa); return; }
    if (delta > 0) s.prueba += delta;   // lo que no gana jugando (panel DEV, compras de prueba) no existe en el servidor
    else console.warn('Pop: gasto de perlas sin motivo del servidor', motivo, delta);
  }
  // sumar (perlas > 0) o gastar (perlas < 0); false si no llegan para gastar
  function mueve(perlas, motivo, clave) {
    const sv = save(), antes = Math.max(0, Math.floor(sv.perlas || 0));
    if (!Number.isInteger(perlas) || perlas === 0 || (perlas < 0 && antes < -perlas)) return false;
    sv.perlas = antes + perlas;
    if (listo()) apunta(perlas, motivo, clave);
    guarda(); alCambiar();
    return true;
  }
  const comprados = () => { const s = S(); return [...s.reclamos, ...(pruebas() ? s.reclamosPrueba || [] : [])]; };
  // las perlas con las que se puede comprar el perfil: las del servidor (las de prueba solo valen en las compras de prueba)
  const paraPerfil = () => { const s = S(); return listo() ? PP_LIBRO.deVerdad(s.gemas, s.cola) : pruebas() ? Math.max(0, save().perlas || 0) : 0; };
  const puedeComprar = () => (listo() && enLinea()) || (!listo() && pruebas());
  function compraDePrueba(articulo, precio) {
    if (!pruebas()) return error('sin_cuenta');
    if (!mueve(-precio, null)) return error('faltan_perlas');
    const s = S(); s.reclamosPrueba = [...new Set([...(s.reclamosPrueba || []), 'fijo:' + articulo])];
    guarda(); alCambiar();
    return ok({ prueba: true });
  }
  async function compra(articulo, precio) {
    if (!listo()) return compraDePrueba(articulo, precio);
    if (!enLinea()) return error('sin_red');
    const s = S(), tuyo = () => { if (!s.reclamos.includes('fijo:' + articulo)) s.reclamos.push('fijo:' + articulo); };
    try {
      await manda();
      const r = await cuenta.rpc('comprar_fijo', { p_juego: 'pop', p_articulo: articulo, p_clave: ('c:' + articulo).slice(0, 80) });   // la misma clave al reintentar: no se cobra dos veces
      tuyo(); aplica({ gemas: r.gemas });
      return ok({});
    } catch (e) {
      const n = nombreError(e);
      if (n !== 'ya_lo_tienes') return error(n);
      tuyo(); guarda(); alCambiar();   // ya era tuyo (comprado en otro móvil): no es un fallo
      return ok({});
    }
  }
  async function pon(perfil) {
    const sv = save(), s = S();
    sv.perfil = perfil; guarda(); alCambiar();
    if (!listo() || !enLinea()) return ok({ local: true });
    try { await cuenta.rpc('pop_poner', { p_perfil: perfil }); s.puesto = JSON.stringify(perfil); guarda(); return ok({}); }
    catch (e) { return error(nombreError(e)); }
  }
  // ---------- cuenta de probador (rol alfa, ADR 146) ----------
  // ¿las perlas del panel DEV las suma el servidor? Con cuenta de probador y el monedero abierto; si no, son de prueba
  const deVerdad = () => !!(probador && probador.puede() && listo());
  // lo que devuelve el servidor tras un regalo pasa a la copia del móvil; false si aquí no manda el servidor (flag cerrado o monedero sin abrir)
  function alRegalo(e) {
    if (!listo() || !e || typeof e.gemas !== 'number') return false;
    ultimo = null; aplica(e);   // una respuesta de `anotar` que estuviera esperando es anterior al regalo: no puede pisarlo
    if (S().cola.length) refresca().catch(avisa);   // y si algo sigue saliendo, al acabar se vuelve a pedir el saldo
    return true;
  }
  // las perlas del panel DEV. Si el servidor falla no se suma nada, tampoco de prueba
  async function regala(n) {
    if (!Number.isInteger(n) || n < 1) return error('datos');
    if (!deVerdad()) { mueve(n, null); return ok({ prueba: true }); }
    await manda();   // lo pendiente, antes: la respuesta de `anotar` no puede llegar después y pisar el saldo del regalo
    const r = await probador.regalo(n);   // el estado lo aplica el gancho 'probador-regalo' (alRegalo)
    return r.ok ? ok({ prueba: false }) : error(r.error);
  }
  // los recursos de la cuenta se han reseteado en el servidor: fuera las perlas de aquí (las de prueba también), lo pendiente de mandar, lo
  // comprado y lo puesto. El monedero sigue abierto: al recargar se pide el saldo y manda el servidor
  function olvida() {
    const s = S(), sv = save();
    C.olvida(); ultimo = null;
    Object.assign(s, NUEVO(), { usuario: s.usuario, abierto: s.abierto });
    sv.perlas = 0; delete sv.perfil;
    guarda();
  }
  return { arranca, mueve, compra, pon, comprados, paraPerfil, puedeComprar, listo, conectado, deVerdad, regala, alRegalo, olvida };
};
if (typeof module !== 'undefined') module.exports = PP_PERLAS;
