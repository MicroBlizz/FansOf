// Fans of Pop · MI PERFIL (composición; tarea #41, ADR 130): junta las reglas del perfil (js/perfil.js), el libro de perlas con el servidor
// (js/perlas-servidor.js) y la partida de este móvil. De aquí cuelgan:
// · ppPerfilActivo(): el flag 'tienda-gemas' de Pop. Cerrado, no hay botón PERFIL ni se habla con el servidor: el juego va como antes.
// · PP_SRV: el libro de perlas ya montado con la cuenta, la partida y la cola de core.
// · ppPerlas(n, motivo, clave): TODA perla que entra (n > 0) o sale (n < 0) del juego pasa por aquí; false si no llegan para gastar.
//   `motivo` es el del servidor (jefe, regalo, pase; ayuda, seguir, vidas, hueco, infinitas, mundo). Sin motivo son perlas de prueba (panel DEV).
// · La cuenta de probador (rol alfa, tarea #120, ADR 146): los ganchos 'probador-regalo' (las perlas que suma el servidor) y
//   'probador-reseteo' (vaciar lo de este móvil tras resetear la cuenta; las reglas, en js/reseteo.js).
// · PP_MI: el catálogo entero (con los personajes), lo que tengo, lo que llevo puesto y los casos de uso de la pantalla: poner y comprar.
'use strict';
const ppPerfilActivo = () => NUCLEO.flag('tienda-gemas', 'Pop: perfil de jugador, monedero de perlas en el servidor y su tienda (comprar_fijo); el mismo nombre que la tienda de gemas de Rumble, pero con su propia fila por juego (tarea #41, ADR 130)', false);
const PP_SRV = PP_PERLAS.crea({
  cuenta: typeof CUENTA !== 'undefined' ? CUENTA : null, save: () => SAVE, guarda: ppGuarda, cola: COLA, activo: ppPerfilActivo,
  enLinea: () => navigator.onLine !== false, pruebas: () => ppCompraDePrueba(),
  alCambiar: () => { if (typeof ppColeIgualaCompras === 'function') ppColeIgualaCompras(); if (typeof ppPerfilRepinta === 'function') ppPerfilRepinta(); },   // los compañeros comprados, a la colección (tarea #142)
  probador: typeof PROBADOR !== 'undefined' ? PROBADOR : null,
});
function ppPerlas(n, motivo = null, clave = null) { return PP_SRV.mueve(n, motivo, clave); }
window.addEventListener('online', () => setTimeout(() => PP_SRV.arranca(), 1500));
// tras un regalo de probador (lo pida el botón de Pop o el bloque «Probador» del panel DEV): el saldo del servidor, a la vista
// Si aquí no manda el servidor, devuelve el motivo: core lo enseña en el panel DEV en vez de dar el regalo por visto
hook('probador-regalo', estado => {
  if (!PP_SRV.alRegalo(estado)) return 'las perlas del servidor están apagadas en Pop (flag «tienda-gemas» cerrado) o tu monedero de Pop aún no está abierto';
  if (typeof ppRefrescaTodo === 'function') ppRefrescaTodo();
});
// la cuenta ya está reseteada en el servidor y la página va a recargarse: se vacía lo de este móvil (con «todo», core borra además la partida)
hook('probador-reseteo', que => {
  const c = PP_RESETEO.cambios(que, PP_NUEVA(), SAVE);
  if (!c.ok) return;
  if (c.recursos) PP_SRV.olvida();
  Object.assign(SAVE, c.pon);
  for (const k of c.quita) delete SAVE[k];
  ppGuarda();
});

const PP_MI = (() => {
  // los personajes: Lola de serie y los amigos rescatables (gratis si ya lo rescataste). Los Animales del álbum (tarea #142) van marcados
  // `coleccion`: no se venden en el perfil; se ponen solo si los tienes (están en SAVE.vistos) y así el VS sabe pintar el del rival
  const nuevos = typeof PP_COMP === 'undefined' ? [] : Object.keys(PP_COMP.NUEVOS).map(id => ({ id, coleccion: true }));
  const cat = Object.freeze({ ...PP_PERFIL_CAT, personaje: Object.freeze([{ id: 'lola', serie: true }, ...PP_SLIME_IDS.filter(id => id !== 'lola').map(id => ({ id })), ...nuevos]) });
  const yo = () => ({ comprados: PP_SRV.comprados(), rescatados: SAVE.vistos || {}, perlas: PP_SRV.paraPerfil() });
  const perfil = () => PP_PERFIL.limpia(SAVE.perfil, cat, yo());
  const dato = (tipo, id) => (cat[tipo] || []).find(x => x.id === id) || null;
  const puesto = (tipo, id) => { const p = perfil(); return tipo === 'pegatina' ? p.pegatinas.includes(id) : p[tipo] === id; };
  const loTengo = (tipo, id) => PP_PERFIL.loTiene(cat, tipo, id, yo());
  const precio = (tipo, id) => { const r = PP_PERFIL.precio(cat, PP_CFG.perfil, tipo, id, yo()); return r.ok ? r.perlas : 0; };
  // ponerse algo que ya se tiene (una pegatina entra o sale de la fila)
  function pon(tipo, id) {
    const r = PP_PERFIL.poner(perfil(), cat, tipo, id, yo());
    return r.ok ? PP_SRV.pon(r.perfil) : Promise.resolve(r);
  }
  // comprar y, si se puede, ponérselo ya
  async function compra(tipo, id) {
    const r = PP_PERFIL.comprar(cat, PP_CFG.perfil, tipo, id, yo());
    if (!r.ok) return r;
    const c = await PP_SRV.compra(r.articulo, r.perlas);
    if (!c.ok) return c;
    await pon(tipo, id);   // si no cabe (pegatinas llenas) o el servidor no contesta, queda comprado igual
    return c;
  }
  // el nombre de la cuenta (nunca la foto, ADR 098); mientras llega o sin cuenta, «Tú»
  let nombre = '';
  function pideNombre() {
    if (nombre || typeof CUENTA === 'undefined' || !CUENTA.activa) return;
    CUENTA.perfil().then(p => { if (p && typeof p.nombre === 'string' && p.nombre) { nombre = p.nombre; if (typeof ppPerfilRepinta === 'function') ppPerfilRepinta(); } });
  }
  return { cat, yo, perfil, dato, puesto, loTengo, precio, pon, compra, pideNombre, get nombre() { return nombre || tr('Tú'); } };
})();
