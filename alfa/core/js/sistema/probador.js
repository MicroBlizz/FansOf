// Fans Of · PROBADOR: lo que hace una cuenta de probador (rol «alfa», ADR 146) sin dinero real. Comprar lo que se vende con euros sin que se
// cobre (en la alfa y en localhost; lo entrega el servidor como una compra de verdad), sumarse moneda comprada y resetear su cuenta en un juego.
// El rol lo comprueba siempre el servidor (servidor/161 y 162): aquí solo se decide qué se enseña y se llama.
// Un solo objeto global. Sin globales ni DOM dentro: todo entra por puertos (abajo, en PROBADOR.crea), así que se prueba en Node
// (tests/core/probador.test.mjs). Al final del archivo, la composición con lo de este navegador, que solo corre en una página.
// Los casos de uso devuelven un resultado con nombre, nunca lanzan por un fallo previsto: { ok: true, valor } o { ok: false, error }, con error:
//   sin_cuenta (sin cuenta activa o sin juego) · sin_rol · solo_alfa (comprar fuera de la alfa y de localhost) · sin_red · datos ·
//   ya_comprado · producto (no existe en el servidor) · sin_monedero · sin_funcion (el servidor aún no tiene el SQL) · servidor ·
//   entrega (el servidor ya lo ha dado, pero este juego ha fallado al aplicarlo) · ocupado (la partida no acaba de subir: no se resetea)
// Ganchos para lo que es de cada juego (hook de utiles.js; guía: docs/guia/core/monedas-y-tienda.md, «Cuentas de probador»):
//   hook('probador-regalo', (estado, cantidad) => …)   tras un regalo: `estado` es lo que devolvió el servidor. Si el juego no puede
//                                                      enseñarlo todavía, devuelve un texto con el motivo (sale en el panel DEV)
//   hook('probador-reseteo', (que, lugar) => …)        tras resetear en el servidor y antes de recargar: el juego limpia su copia local.
//                                                      También salta, con que = 'todo' y lugar.cuenta = true, cuando el servidor ha
//                                                      reseteado la cuenta entera (al quitarle el rol): cuentaReseteada, abajo
'use strict';
const PROBADOR = {};
PROBADOR.ROL = 'alfa';
PROBADOR.QUE = Object.freeze(['recursos', 'progreso', 'todo']);
PROBADOR.TOPE_REGALO = 100000;   // el del servidor (regalo_probador)
PROBADOR.MARCA = 'fansof-probador-borra';   // en sessionStorage: las claves que hay que volver a borrar al arrancar tras un reseteo
PROBADOR.MARCA_CUENTA = 'fansof-cuenta-reseteada';   // en localStorage, por juego y cuenta: el último reseteo de la cuenta entera ya limpiado aquí

// Qué fallo es, por lo que dice el servidor (CUENTA.rpc lanza con su mensaje y su estado HTTP). Los que tienen nombre van antes que el estado:
// una función que no existe llega como 404 (PGRST202); sin estado HTTP no hubo respuesta
PROBADOR.FALLOS = Object.freeze([
  [/sin_sesion/, 'sin_cuenta'], [/sin_rol_alfa/, 'sin_rol'], [/producto_no_existe/, 'producto'], [/sin_monedero/, 'sin_monedero'],
  [/que_no_valido|juego_no_valido|\bdatos\b/, 'datos'], [/PGRST202|Could not find the function|HTTP 404/i, 'sin_funcion'],
  [/sin_conexion|Failed to fetch|NetworkError|Load failed/i, 'sin_red'],
]);
PROBADOR.nombraError = e => {
  const m = String((e && e.message) || e), f = PROBADOR.FALLOS.find(([re]) => re.test(m));
  if (f) return f[1];
  if (e && e.estado === 404) return 'sin_funcion';
  return e && e.estado >= 400 ? 'servidor' : 'sin_red';
};

// Puertos (los que son función se preguntan en el momento: la cuenta y el rol llegan de fondo):
//   cuenta()            como CUENTA, o null: { activa, usuario, roles: { tiene, refrescar }, rpc(nombre, cuerpo) }
//   entorno()           { alfa, desarrollo } (NUCLEO)
//   juego()             AJUSTES.id, o ''
//   antes()             promesa: manda al servidor lo pendiente antes de pedirle algo (ECO_SOMBRA.vaciar); lanza sin red
//   entrega(r)          promesa: aplica al juego lo que el servidor acaba de entregar y devuelve lo que recibe la tienda (PAGOS.entrega)
//   aplica(estado)      promesa: el estado del monedero que devuelve el servidor pasa a ser el de aquí (PAGOS.refrescar)
//   dispara(nombre, …)  fire de utiles.js
//   pausa(si)           promesa: para (y reanuda) todo lo que este juego manda solo al servidor, la partida (CUENTA.pausa) y lo pendiente
//                       de la economía (ECO_SOMBRA.pausa). Al parar espera a lo que ya esté saliendo: true si ha quedado todo quieto
//   olvidaPendiente()   tira lo pendiente de mandar de core (ECO_SOMBRA.olvidaCola)
//   clavesPartida()     las claves del navegador de la partida de core y de su copia en la nube
//   clavesCuenta()      las demás claves de core que son de la cuenta en este juego (el estado de ECO_SOMBRA)
//   sincronizada()      ¿la partida de este navegador ya estuvo en la nube de esta cuenta? (CUENTA.version > 0)
//   almacen(), sesion() como localStorage y sessionStorage · recarga() · enLinea() · tr(texto) · consola
PROBADOR.crea = ({ cuenta, entorno, juego, antes, entrega, aplica, dispara, pausa, olvidaPendiente, clavesPartida, clavesCuenta = () => [],
  sincronizada = () => false, almacen, sesion, recarga, enLinea = () => true, tr = t => t, consola = console }) => {
  const { ROL, QUE, TOPE_REGALO, MARCA, MARCA_CUENTA, nombraError } = PROBADOR;
  const ok = valor => ({ ok: true, valor }), error = nombre => ({ ok: false, error: nombre });

  // ¿hay dentro una cuenta de probador? El rol es el último confirmado por el servidor (CUENTA.roles, ADR 097)
  const puede = () => { const c = cuenta(); return !!(c && c.activa && c.roles && c.roles.tiene(ROL) && juego()); };
  // ¿es un sitio de pruebas? La copia alfa, o localhost en modo desarrollo. En la release y en la app, nunca
  const enPruebas = () => { const e = entorno(); return !!(e && (e.alfa || e.desarrollo)); };
  // pregunta el rol al servidor si no consta, una vez por carga y por cuenta (en localhost nadie más lo hace). No vale mirar si hay roles
  // vigentes: otro pudo preguntar antes por otro rol (el de admin de los reportes) y entonces «alfa» no se ha preguntado nunca.
  // Devuelve una promesa con puede()
  let preguntado = null;
  async function confirma() {
    const c = cuenta(), quien = (c && c.usuario) || '';
    if (c && c.activa && c.roles && !c.roles.tiene(ROL) && preguntado !== quien) {
      const r = await c.roles.refrescar([ROL]);
      if (r && r.ok && quien) preguntado = quien;   // sin respuesta, o sin nadie dentro todavía, se vuelve a preguntar la próxima vez
    }
    return puede();
  }
  // por qué no se puede pedir nada ahora, o '' si se puede
  function falta() {
    const c = cuenta();
    if (!c || !c.activa || !juego()) return 'sin_cuenta';
    if (!c.roles || !c.roles.tiene(ROL)) return 'sin_rol';
    return enLinea() ? '' : 'sin_red';
  }
  async function pide(nombre, cuerpo, mandaAntes) {
    try { if (mandaAntes) await antes(); return ok(await cuenta().rpc(nombre, cuerpo)); }
    catch (e) { return error(nombraError(e)); }   // el fallo ya queda apuntado por CUENTA.rpc (errores.js); aquí se le pone nombre
  }

  // Compra un producto de `productos` sin cobrar. valor: lo mismo que recibe el juego en una compra real ({ real: true, gemas, entradas,
  // derecho, objeto… }) y además probador: true
  async function compra(producto) {
    const f = falta(); if (f) return error(f);
    if (!enPruebas()) return error('solo_alfa');
    if (typeof producto !== 'string' || !producto) return error('datos');
    const r = await pide('compra_probador', { p_producto: producto }, true);
    if (!r.ok) return r;
    if (!r.valor || !r.valor.ok) return error(r.valor && r.valor.error === 'ya_comprado' ? 'ya_comprado' : 'servidor');
    return aplicado(async () => ok(Object.assign(await entrega(r.valor), { probador: true })));
  }
  // el servidor ya ha hecho su parte: si lo de aquí falla (un gancho del juego, guardar la partida), es un fallo de programación, pero quien
  // llama recibe su resultado con nombre para poder avisar, y el fallo queda en la consola (y en la caja negra)
  async function aplicado(hazlo) {
    try { return await hazlo(); }
    catch (e) { consola.error('Probador: el servidor lo ha dado, pero aquí ha fallado al aplicarlo', e); return error('entrega'); }
  }

  // Suma moneda comprada desde el servidor. valor: el estado que devuelve (el de `estado`, o el propio de un juego con su economía).
  // sinMostrar: si el servidor lo ha sumado pero este juego no puede enseñarlo todavía, el motivo que da su gancho
  async function regalo(cantidad) {
    const f = falta(); if (f) return error(f);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > TOPE_REGALO) return error('datos');
    const r = await pide('regalo_probador', { p_juego: juego(), p_cantidad: cantidad }, true);
    if (!r.ok) return r;
    return aplicado(async () => {
      await aplica(r.valor);
      const motivo = dispara('probador-regalo', r.valor, cantidad);   // un gancho que no puede enseñarlo devuelve por qué
      return typeof motivo === 'string' && motivo ? Object.assign(r, { sinMostrar: motivo }) : r;
    });
  }

  function borra(claves) {
    for (const k of claves) { try { almacen().removeItem(k); } catch (e) { consola.warn('Probador: no se puede borrar ' + k, e); } }
  }
  // Lo de este navegador tras un reseteo. Core ya ha tirado lo pendiente de mandar y, con «recursos», ha puesto el saldo que deja el servidor
  // (resetea); con «todo» borra la partida; lo demás lo dice cada juego en su gancho, que recibe `lugar`: { respuesta, cuenta, olvida(clave),
  // olvidaPartida() }. Las claves que el juego da a olvida() se borran del navegador ahora y otra vez al arrancar (alArrancar).
  // extra: { cuenta: true, claves: [...] } cuando lo reseteado es la cuenta entera (cuentaReseteada)
  function limpia(que, respuesta, extra = {}) {
    const claves = [...(extra.claves || [])], olvidaPartida = () => { claves.push(...clavesPartida()); };
    if (que === 'todo') olvidaPartida();
    try { dispara('probador-reseteo', que, { respuesta, cuenta: !!extra.cuenta, olvida: k => { claves.push(k); }, olvidaPartida }); }
    catch (e) { consola.error('Probador: un gancho de reseteo ha fallado', e); }   // el servidor ya está reseteado: se acaba de limpiar y se recarga
    borra(claves);
    try { if (claves.length) sesion().setItem(MARCA, JSON.stringify(claves)); } catch (e) { consola.warn('Probador: no se apunta el borrado', e); }
  }
  // Al arrancar la página: lo que el juego haya vuelto a guardar mientras se recargaba (al ocultarse la página) se borra otra vez
  function alArrancar() {
    let claves;
    try { const s = sesion(); claves = JSON.parse(s.getItem(MARCA)); s.removeItem(MARCA); }
    catch (e) { consola.warn('Probador: no se lee el borrado pendiente', e); return; }
    if (Array.isArray(claves)) borra(claves.filter(k => typeof k === 'string'));
  }

  // Resetea la cuenta en este juego (servidor/162): que = 'recursos' | 'progreso' | 'todo'. valor: lo que devuelve el servidor (lo borrado, en cifras).
  // 1) Se para todo lo que sale solo hacia el servidor (la partida y lo pendiente de la economía) y se espera a lo que ya estuviera saliendo:
  //    así nada de antes llega al servidor después del reseteo. Si no acaba, no se resetea ('ocupado') y todo sigue como estaba.
  // 2) Si el servidor falla, se reanuda y no se ha perdido nada, tampoco lo pendiente.
  // 3) Si acepta, ya no hay vuelta: se tira lo pendiente, se limpia lo de aquí y se recarga SIEMPRE, aunque algo de aquí falle por el
  //    camino (queda en la consola). Nada vuelve a mandarse hasta la recarga: la pausa no se quita.
  async function resetea(que) {
    const f = falta(); if (f) return error(f);
    if (!QUE.includes(que)) return error('datos');
    if (!await pausa(true)) { await pausa(false); return error('ocupado'); }
    const r = await pide('resetear_cuenta', { p_juego: juego(), p_que: que }, false);
    if (!r.ok) { await pausa(false); return r; }
    try {
      olvidaPendiente();
      const queda = r.valor && r.valor.recursos && r.valor.recursos.queda;   // con qué se queda el monedero (lo de una cuenta nueva)
      if (que === 'recursos' && queda) await aplica(queda);
    } catch (e) { consola.error('Probador: el servidor ya está reseteado, pero aquí ha fallado algo al limpiar', e); }
    finally { limpiaYRecarga(que, r.valor); }
    return r;
  }
  // limpia lo local y recarga pase lo que pase; solo si ni recargar se puede se quita la pausa, para que la página no se quede muda
  function limpiaYRecarga(que, respuesta, extra) {
    try { limpia(que, respuesta, extra); } catch (e) { consola.error('Probador: no se ha podido limpiar este navegador', e); }
    try { recarga(); } catch (e) { consola.error('Probador: no se ha podido recargar', e); pausa(false); }
  }

  // EL RESETEO DE LA CUENTA ENTERA (al quitarle el rol alfa, servidor/162 y cuenta_reseteada): el servidor lo ha borrado todo, de todos los
  // juegos, y este navegador puede seguir con la partida de antes. Se mira al entrar la cuenta, antes de sincronizar (lo llama cuenta.js).
  // Aquí solo se puede limpiar el juego que está abierto, así que la marca de «ya limpiado» va por juego y cuenta: cada juego se limpia la
  // primera vez que se abre tras el reseteo. Se limpia igual que un reseteo «todo» (mismo gancho, con lugar.cuenta = true) y además el estado
  // de la economía (clavesCuenta). No se tocan las preferencias del aparato ni la sesión. Devuelve una promesa: true si va a recargar.
  //   · sin marca local: solo se limpia si la partida de aquí ya estuvo en la nube de esta cuenta (es de antes del reseteo); una partida de
  //     invitado recién traída a la cuenta, o un navegador sin nada, no se toca y solo se apunta la marca.
  //   · la marca se guarda ANTES de limpiar: si el navegador no deja guardarla, no se limpia (se recargaría una y otra vez).
  //   · si el servidor no contesta o aún no tiene la función, no pasa nada: se mirará la próxima vez.
  // cuándo dice el servidor que se reseteó la cuenta entera: su fecha (texto ISO), o null si nunca, si no contesta o si aún no tiene la función
  async function fechaReseteo(c) {
    let fecha;
    try { fecha = await c.rpc('cuenta_reseteada', {}); }
    catch (e) { if (nombraError(e) === 'servidor') consola.warn('Probador: no se sabe si la cuenta se ha reseteado', e); return null; }
    return typeof fecha === 'string' && Number.isFinite(Date.parse(fecha)) ? fecha : null;
  }
  // apunta ese reseteo como visto en este juego y dice si falta limpiarlo aquí. Si la marca no se puede guardar, no falta (no se limpia)
  function faltaLimpiar(clave, fecha) {
    let vista;
    try { vista = almacen().getItem(clave); almacen().setItem(clave, fecha); if (almacen().getItem(clave) !== fecha) return false; }
    catch (e) { consola.warn('Probador: no se puede apuntar el reseteo de la cuenta', e); return false; }
    return vista ? !(Date.parse(vista) >= Date.parse(fecha)) : sincronizada();
  }
  async function cuentaReseteada() {
    const c = cuenta(), quien = (c && c.usuario) || '';
    if (!c || !c.activa || !quien || c.invitadoDeVerdad || !juego() || !enLinea()) return false;
    const fecha = await fechaReseteo(c);
    if (!fecha || !faltaLimpiar(MARCA_CUENTA + ':' + juego() + ':' + quien, fecha)) return false;
    await pausa(true);   // lo que aún esté saliendo acaba antes; ya no sale nada más hasta la recarga
    try { olvidaPendiente(); } catch (e) { consola.error('Probador: no se ha podido tirar lo pendiente', e); }
    limpiaYRecarga('todo', { cuenta_reseteada: fecha }, { cuenta: true, claves: clavesCuenta() });
    return true;
  }

  const TEXTOS = {
    sin_cuenta: () => tr('Entra con tu cuenta de probador'),
    sin_rol: () => tr('Esta cuenta no es de probador'),
    solo_alfa: () => tr('Las cuentas de probador no pueden pagar con dinero real; prueba la compra en la alfa.'),
    sin_red: () => tr('Necesitas conexión para esto'),
    datos: () => tr('El servidor no acepta esos datos'),
    ya_comprado: () => tr('Ya lo tienes'),
    producto: () => tr('Ese producto no está en el servidor'),
    sin_monedero: () => tr('Todavía no tienes cartera en este juego: juega un poco y prueba otra vez'),
    sin_funcion: () => tr('El servidor todavía no tiene las funciones de probador'),
    servidor: () => tr('El servidor ha dado un error y ya queda apuntado'),
    entrega: () => tr('El servidor ya lo ha dado, pero el juego ha fallado al aplicarlo. Recarga la página para verlo.'),
    ocupado: () => tr('La partida todavía se está guardando en la nube. Espera un momento y prueba otra vez.'),
  };
  const texto = nombre => (TEXTOS[nombre] || TEXTOS.servidor)();
  const RESETEOS = {
    recursos: () => tr('Se borran tus recursos de este juego, en tu cuenta y en este navegador: monedas, objetos, cartas y lo comprado. El progreso se queda. No se puede deshacer.'),
    progreso: () => tr('Se borra tu progreso en este juego, en tu cuenta y en este navegador: la partida guardada, las misiones, los logros y el pase. Los recursos se quedan. No se puede deshacer.'),
    todo: () => tr('Se borra todo lo tuyo de este juego, en tu cuenta y en este navegador: recursos, progreso y lo pendiente de mandar. No se puede deshacer.'),
  };
  // lo que dice la ventana de confirmación de cada reseteo: { titulo, texto, boton }, o null si `que` no vale
  const avisoReseteo = que => (RESETEOS[que] ? { titulo: tr('RESETEAR LA CUENTA'), texto: RESETEOS[que](), boton: tr('RESETEAR') } : null);

  return { puede, enPruebas, confirma, compra, regalo, resetea, cuentaReseteada, alArrancar, texto, avisoReseteo };
};

if (typeof module !== 'undefined') module.exports = PROBADOR;
// La composición con este navegador: PROBADOR.puede(), .compra(), .regalo(), .resetea()… Se carga antes que cuenta.js para que el borrado
// pendiente de un reseteo (alArrancar) ocurra antes de que nadie lea la partida
if (typeof window !== 'undefined' && typeof NUCLEO !== 'undefined' && typeof fire === 'function') {
  Object.assign(PROBADOR, PROBADOR.crea({
    cuenta: () => (typeof CUENTA !== 'undefined' ? CUENTA : null),
    entorno: () => NUCLEO,
    juego: () => (typeof AJUSTES !== 'undefined' && AJUSTES.id) || '',
    antes: () => (typeof ECO_SOMBRA !== 'undefined' ? ECO_SOMBRA.vaciar() : Promise.resolve()),
    entrega: r => PAGOS.entrega(r),
    aplica: estado => (estado && typeof estado.gemas === 'number' ? PAGOS.refrescar(estado) : Promise.resolve(null)),   // el estado propio de un juego lo aplica su gancho
    dispara: (...a) => fire(...a),
    pausa: async si => (await Promise.all([CUENTA.pausa(si), typeof ECO_SOMBRA !== 'undefined' ? ECO_SOMBRA.pausa(si) : true])).every(Boolean),
    olvidaPendiente: () => { if (typeof ECO_SOMBRA !== 'undefined') ECO_SOMBRA.olvidaCola(); },
    clavesPartida: () => [SAVE_KEY, SAVE_KEY + '-nube'],
    clavesCuenta: () => [SAVE_KEY + '-sombra'],
    sincronizada: () => CUENTA.version > 0,
    almacen: () => localStorage, sesion: () => sessionStorage,
    recarga: () => location.reload(),
    enLinea: () => navigator.onLine !== false,
    tr: t => (typeof IDIOMA !== 'undefined' && IDIOMA.tr ? IDIOMA.tr(t) : t),
  }));
  PROBADOR.alArrancar();
  // en la alfa el rol lo pregunta alfa.js y en la release panel-dev.js; en localhost, nadie más: se pregunta cuando la cuenta ya ha entrado
  if (NUCLEO.desarrollo && !NUCLEO.alfa) hook('cuenta', () => { PROBADOR.confirma().catch(e => console.error('Probador: ' + e.message)); });
}
