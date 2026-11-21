// Fans of Pop · CORAZONES ENTRE AMIGOS EN EL SERVIDOR (aplicación; tarea #96, ADR 150): los casos de uso que hablan con las funciones
// pop_corazon_* del servidor. Las reglas (cuánto cabe, el código, el enlace, el caso) están en js/corazones-buzon.js; aquí solo se ordena.
// · miEnlace(base): pide el código de quien pide una sola vez y lo recuerda en memoria; devuelve { ok, codigo, url, hoy, tope }.
// · quien(codigo) y regalar(codigo): ver a quien pide y regalarle un corazón (propio, ya_hoy, tope y no_existe vuelven como motivo).
// · buzon(): lo regalado y sin recoger. recoger(vidas, max, infinitas, pendientes): recoge solo lo que cabe; NO suma vidas, eso lo hace quien
//   llama. Con `pendientes` (los regalos que la ventana ya sabe que hay) no vuelve a pedir el buzón: un solo viaje entre leer las vidas y recoger.
// Todo va tras el flag 'corazones-amigos': cerrado o sin cuenta no se llama al servidor. Sin globales ni DOM: todo entra por puertos:
// cuenta (como CUENTA, o null), activo() (el flag), enLinea() y reglas (PP_CORAZONES_REGLAS).
// Los fallos son resultados con nombre { ok:false, motivo }: cerrado, sin_sesion, sin_red, servidor y los del servidor (no_existe, propio…).
'use strict';
const PP_CORAZONES = {};
PP_CORAZONES.crea = ({ cuenta, activo, enLinea = () => true, reglas }) => {
  const ok = v => Object.freeze({ ok: true, ...v });
  const no = motivo => Object.freeze({ ok: false, motivo });
  // un fallo que no se arregla reintentando es del servidor; sin red o con el servidor caído, sin_red
  const definitivo = e => { const n = e && e.estado; return n >= 400 && n < 500 && n !== 401 && n !== 408 && n !== 429; };
  const fallo = e => no(definitivo(e) ? 'servidor' : 'sin_red');
  const sesion = () => {
    if (!activo()) return no('cerrado');
    if (!cuenta || !cuenta.activa || !cuenta.usuario) return no('sin_sesion');
    return enLinea() ? null : no('sin_red');
  };
  // llama a una función del servidor: o el resultado { ok, … } que contesta, o el fallo con nombre
  async function llama(nombre, cuerpo) {
    const cerrada = sesion();
    if (cerrada) return cerrada;
    try {
      const r = await cuenta.rpc(nombre, cuerpo);
      return r && typeof r === 'object' && typeof r.ok === 'boolean' ? r : no('servidor');
    } catch (e) { return fallo(e); }
  }
  let mio = null;   // { usuario, codigo, hoy, tope }: el código no cambia, se pide una vez por cuenta
  async function miEnlace(base) {
    if (!mio || (cuenta && mio.usuario !== cuenta.usuario)) {
      const r = await llama('pop_corazon_mi_enlace', {});
      if (!r.ok) return r;
      const c = reglas.codigo(r.codigo);
      if (!c.ok) return no('servidor');
      mio = { usuario: cuenta.usuario, codigo: c.codigo, hoy: r.hoy, tope: r.tope };
    }
    return ok({ codigo: mio.codigo, url: reglas.enlace(base, mio.codigo), hoy: mio.hoy, tope: mio.tope });
  }
  const conCodigo = async (nombre, texto) => {
    const c = reglas.codigo(texto);
    return c.ok ? llama(nombre, { p_codigo: c.codigo }) : no('no_existe');
  };
  const quien = texto => conCodigo('pop_corazon_quien', texto);
  const regalar = texto => conCodigo('pop_corazon_regalar', texto);
  async function buzon() {
    const r = await llama('pop_corazon_buzon', {});
    return r.ok ? ok(reglas.buzon(r)) : r;
  }
  // cuántos regalos esperan: los que ya sabe quien llama o, si no lo sabe, los que diga el buzón
  async function cuantos(pendientes) {
    if (Number.isInteger(pendientes) && pendientes >= 0) return sesion() || ok({ n: pendientes });
    const b = await buzon();
    return b.ok ? ok({ n: b.regalos.length }) : b;
  }
  // recoge solo lo que cabe: si no cabe nada o el buzón está vacío, no se llama a recoger
  async function recoger(vidas, max, infinitas, pendientes) {
    if (!reglas.caben(vidas, max, infinitas)) return sesion() || ok({ recogidos: 0, quedan: null });
    const b = await cuantos(pendientes);
    if (!b.ok) return b;
    const n = reglas.aRecoger(b.n, vidas, max, infinitas);
    if (!n) return ok({ recogidos: 0, quedan: b.n });
    const r = await llama('pop_corazon_recoger', { p_max: n });
    return r.ok ? ok({ recogidos: r.recogidos, quedan: r.quedan }) : r;
  }
  return Object.freeze({ miEnlace, quien, regalar, buzon, recoger });
};
if (typeof module !== 'undefined') module.exports = PP_CORAZONES;
