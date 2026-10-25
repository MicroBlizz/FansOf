// Fans Of · PAGOS: compras con dinero real dentro de la app de Android (Google Play Billing). docs/core/TIENDA.md.
// El plugin nativo `Pagos` (android-app/android/app/src/main/java/com/microblizz/fansof/Pagos.java) abre la hoja de pago de Google; el token que
// devuelve se manda a la Edge Function `pagos-play` (servidor/funciones/pagos-play), que lo comprueba con Google, entrega (servidor/90) y lo confirma.
// Aquí NUNCA se da nada: el saldo y lo entregado llegan del servidor. En la web y en desarrollo no hay plugin: MONEDAS.compraReal sigue como antes.
// Un juego engancha 'compra' (lo que acaba de llegar: {gemas, entradas, derecho, objeto}) y 'derechos' (las claves de reclamos del servidor, al restaurar)
// para aplicar lo que es suyo (Rumble: «Sin anuncios»).
'use strict';
const PAGOS = (() => {
  const tr = (t, d) => (typeof IDIOMA !== 'undefined' && IDIOMA.tr ? IDIOMA.tr(t, d) : t);
  let P = null;
  const plugin = () => {   // el plugin nativo, solo dentro de la app
    if (P !== null) return P;
    const C = window.Capacitor;
    P = (C && typeof C.isNativePlatform === 'function' && C.isNativePlatform() && typeof C.isPluginAvailable === 'function' && C.isPluginAvailable('Pagos') && (typeof C.registerPlugin === 'function' ? C.registerPlugin('Pagos') : C.Plugins && C.Plugins.Pagos)) || false;
    return P;
  };
  const disponible = () => !!plugin() && typeof CUENTA !== 'undefined' && CUENTA.activa && typeof AJUSTES !== 'undefined' && !!AJUSTES.id;
  // tras una compra o al restaurar: el saldo del servidor manda (todo lo pendiente ya se mandó antes de comprar)
  async function refrescar() {
    if (typeof ECO_SOMBRA === 'undefined' || typeof SAVE === 'undefined') return null;
    const r = await CUENTA.rpc('estado', { p_juego: AJUSTES.id }); if (!r) return null;
    SAVE.gold = r.oro; SAVE.gems = r.gemas; SAVE.tickets = r.entradas; ECO_SOMBRA.apuntaLocal(r);
    if (Array.isArray(r.reclamos) && typeof fire === 'function') fire('derechos', r.reclamos);
    if (typeof saveGame === 'function') saveGame();
    if (typeof updateWallets === 'function') { try { updateWallets(); } catch (e) { /* la pantalla no está lista */ } }
    return r;
  }
  // el servidor comprueba el token con Google y entrega; aquí se apunta lo que llegó. Devuelve { real: true, gemas, entradas, derecho, objeto, repetida }
  async function verificar(producto, token) {
    const r = await CUENTA.funcion('pagos-play', { juego: AJUSTES.id, producto, token });
    if (!r || !r.ok) throw new Error((r && r.error) || 'pago');
    if (r.objeto && r.objeto.u && typeof SAVE !== 'undefined' && Array.isArray(SAVE.inv) && !SAVE.inv.some(x => x.u === r.objeto.u)) SAVE.inv.push({ u: r.objeto.u, k: r.objeto.k, id: r.objeto.id, q: r.objeto.q });
    if (typeof fire === 'function') fire('compra', r);
    await refrescar().catch(() => { /* sin red justo ahora: el saldo llega en la próxima sincronización */ });
    return Object.assign({ real: true }, r);
  }
  // comprar un producto (su id en Play Console = el id de servidor/90): abre la hoja de Google y, al pagar, verifica y entrega
  async function comprar(producto) {
    const p = plugin(); if (!p) throw new Error('sin_plugin');
    if (typeof ECO_SOMBRA !== 'undefined') await ECO_SOMBRA.vaciar();   // que el servidor sepa todo lo ganado antes (si no hay red, falla aquí y no se cobra nada)
    const c = await p.comprar({ id: producto, usuario: CUENTA.usuario });
    return verificar(producto, c.token);
  }
  // al abrir la app: lo comprado que aún no se entregó (la app se cerró a medias, pago pendiente…) se entrega ahora; también deja el saldo al día
  let restaurando = null;
  function restaurar() {
    const p = plugin(); if (!p || !disponible()) return Promise.resolve();
    return restaurando || (restaurando = (async () => {
      try {
        const r = await p.pendientes();
        for (const c of (r && r.compras) || []) { try { await verificar(c.id, c.token); } catch (e) { /* ya entregada, pendiente o rechazada: nada que hacer aquí */ } }
        await refrescar();
      } catch (e) { /* sin Play o sin red: se vuelve a intentar al abrir la próxima vez */ }
    })().finally(() => { restaurando = null; }));
  }
  // precios de Google en la moneda del jugador: { id: 'texto' }; si falla (sin Play, sin red), vacío y se enseñan los euros del juego
  async function precios(ids) {
    const p = plugin(); if (!p || !ids || !ids.length) return {};
    try { const r = await p.productos({ ids }); const o = {}; for (const x of (r && r.productos) || []) o[x.id] = x.precio; return o; } catch (e) { return {}; }
  }
  const errorTexto = e => {
    const m = String((e && e.message) || e);
    return /cancelad/i.test(m) ? '' : /ya_comprado|ALREADY_OWNED/i.test(m) ? tr('Ya lo tienes') : /pendiente/.test(m) ? tr('Google todavía no ha confirmado el pago: lo recibirás en cuanto lo haga')
      : /pais/.test(m) ? tr('No se vende en tu país') : /cuenta/.test(m) ? tr('Esa compra se hizo con otra cuenta') : /sin_sesion|sin_conexion|Failed to fetch|NetworkError/i.test(m) ? tr('Necesitas conexión para comprar')
      : /NOT_SUPPORTED|UNAVAILABLE|sin_plugin/i.test(m) ? tr('Google Play no está disponible en este aparato') : tr('No se ha podido completar la compra. Si Google te ha cobrado, lo recibirás en unos minutos.');
  };
  if (typeof hook === 'function') hook('cuenta', () => setTimeout(restaurar, 3000));
  return { disponible, comprar, verificar, restaurar, refrescar, precios, errorTexto };
})();
