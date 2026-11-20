// Fans of Pop · PESTAÑA AMIGOS, casos de uso con el servidor (aplicación; tarea #145, ADR 189): el latido (pop_amigos), el corazón a uno o a todos
// (pop_amigo_corazon), el gracias (pop_amigo_gracias), el enlace propio y, por delegación en la lista común de core (AMIGOS.crea), quien, anadir,
// quitar, conocido y retar. Las reglas (ordenar, a quién se manda, resumen, frase, reto) están en js/amigos-reglas.js; aquí solo se ordena.
// Todo va tras el flag de amigos: cerrado o sin cuenta no se llama al servidor. Sin globales ni DOM: todo entra por puertos:
// cuenta (como CUENTA, o null), core (AMIGOS.crea para 'pop'), activo() (el flag), enLinea() y reglas (PP_AMIGOS_REGLAS).
// Los fallos son resultados con nombre { ok:false, motivo }: cerrado, sin_sesion, sin_red, servidor, sin_amigos, frase y los del servidor.
// Recuerda en memoria el último latido bueno (ultimo()) y se olvida de todo al cambiar de usuario.
'use strict';
const PP_AMIGOS = {};
PP_AMIGOS.crea = ({ cuenta, core, activo, enLinea = () => true, reglas }) => {
  const MAX_CODIGOS = 100, MAX_NIVEL = 100000;
  const ok = v => Object.freeze({ ok: true, ...v });
  const no = motivo => Object.freeze({ ok: false, motivo });
  const definitivo = e => { const n = e && e.estado; return n >= 400 && n < 500 && n !== 401 && n !== 408 && n !== 429; };
  const entero = n => (Number.isFinite(n) ? Math.min(MAX_NIVEL, Math.max(0, Math.trunc(n))) : 0);
  const sesion = () => {
    if (!activo()) return no('cerrado');
    if (!cuenta || !cuenta.activa || !cuenta.usuario) return no('sin_sesion');
    return enLinea() ? null : no('sin_red');
  };
  let usuario = null, ultimo = null, posicion = { nivel: 0, mundo: 0 };
  // al cambiar de usuario no queda nada del anterior
  const alDia = () => {
    const u = cuenta ? cuenta.usuario || null : null;
    if (u !== usuario) { usuario = u; ultimo = null; posicion = { nivel: 0, mundo: 0 }; }
  };
  async function llama(nombre, cuerpo) {
    alDia();
    const cerrada = sesion();
    if (cerrada) return cerrada;
    try {
      const r = await cuenta.rpc(nombre, cuerpo);
      return r && typeof r === 'object' && typeof r.ok === 'boolean' ? r : no('servidor');
    } catch (e) { return no(definitivo(e) ? 'servidor' : 'sin_red'); }
  }
  async function latido(nivel, mundo) {
    posicion = { nivel: entero(nivel), mundo: entero(mundo) };
    const r = await llama('pop_amigos', { p_nivel: posicion.nivel, p_mundo: posicion.mundo });
    if (!r.ok) return r;
    const n = reglas.normaliza(r);
    ultimo = ok({ ...n, amigos: reglas.ordena(n.amigos) });
    return ultimo;
  }
  const ultimoLatido = () => { alDia(); return ultimo; };
  // los códigos válidos y sin repetir, hasta el tope
  const limpios = codigos => [...new Set((Array.isArray(codigos) ? codigos : [])
    .map(c => AMIGOS.limpiaCodigo(c)).filter(c => c.ok).map(c => c.codigo))].slice(0, MAX_CODIGOS);
  async function corazon(codigos) {
    const lista = limpios(codigos);
    if (!lista.length) return no('sin_amigos');
    const r = await llama('pop_amigo_corazon', { p_codigos: lista });
    if (!r.ok) return r;
    ultimo = null;   // quién está «enviado» ha cambiado: el siguiente latido lo refresca
    return ok({ enviados: r.enviados, ya: r.ya, llenos: r.llenos, no_amigo: r.no_amigo, resumen: reglas.resumenEnvio(r) });
  }
  async function corazonATodos() {
    let l = ultimoLatido();
    if (!l) l = await latido(posicion.nivel, posicion.mundo);
    return l.ok ? corazon(reglas.aTodos(l.amigos)) : l;
  }
  async function gracias(codigo, frase) {
    if (!reglas.fraseValida(frase)) return no('frase');
    const c = AMIGOS.limpiaCodigo(codigo);
    if (!c.ok) return no('codigo');
    const r = await llama('pop_amigo_gracias', { p_codigo: c.codigo, p_frase: frase });
    return r.ok ? ok({ corazon: r.corazon }) : r;
  }
  async function miEnlace(base) {
    alDia();
    const r = await core.miCodigo();
    if (!r.ok) return r;
    try { return ok({ codigo: r.codigo, url: AMIGOS.enlace(base, r.codigo) }); }
    catch (e) { return no('servidor'); }
  }
  // tras añadir o quitar, la lista recordada ya no vale
  const cambia = async pedido => { const r = await pedido; if (r.ok) ultimo = null; return r; };
  const retos = latidoNormalizado => (latidoNormalizado && Array.isArray(latidoNormalizado.avisos) ? latidoNormalizado.avisos : [])
    .map(a => reglas.reto(a)).filter(r => r.ok);
  return Object.freeze({
    latido, ultimo: ultimoLatido, corazon, corazonATodos, gracias, miEnlace, retos,
    quien: c => core.quien(c), conocido: sala => core.conocido(sala),
    anadir: c => cambia(core.anadir(c)), quitar: c => cambia(core.quitar(c)),
    retar: (codigo, sala) => core.avisar(codigo, 'reto', { sala }),
  });
};
if (typeof module !== 'undefined') module.exports = PP_AMIGOS;
