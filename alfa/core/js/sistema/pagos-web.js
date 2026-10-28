// Fans Of · PAGOS_WEB: compras con euros en la WEB, con la ventana de pago de Paddle (docs/core/TIENDA.md §3, docs/decisiones/007-pasarela-web-paddle.md).
// Es la pareja de PAGOS (pagos.js, Google Play en la app de Android) y sigue sus mismas reglas: aquí NUNCA se da nada. El servidor (Edge Function `pagos`,
// servidor/funciones/pagos) crea el cobro con el precio de `productos`, lo comprueba con Paddle y entrega con las mismas funciones que la app.
// Solo funciona si: no es la app de Android, el flag `pago-web` está abierto (primero en la alfa) y la config del servidor `paddle` trae el token público
// (`{ "token": "test_…" }` en pruebas, `live_…` el de verdad; `minimo`: los packs por debajo de ese precio no se ofrecen en la web, que la comisión fija se los come).
'use strict';
const PAGOS_WEB = (() => {
  const tr = (t, d) => (typeof IDIOMA !== 'undefined' && IDIOMA.tr ? IDIOMA.tr(t, d) : t);
  const app = () => { const C = window.Capacitor; return !!(C && typeof C.isNativePlatform === 'function' && C.isNativePlatform()); };
  const conf = () => { const c = typeof NUCLEO !== 'undefined' && NUCLEO.configRemota && NUCLEO.configRemota('paddle'); return c && typeof c === 'object' && /^(test|live)_[A-Za-z0-9]+$/.test(c.token || '') ? c : null; };
  const abierto = () => typeof NUCLEO !== 'undefined' && NUCLEO.flag && NUCLEO.flag('pago-web', 'Compras con euros en la web, con Paddle (docs/core/TIENDA.md §3)', false);
  const disponible = () => !app() && abierto() && !!conf() && typeof CUENTA !== 'undefined' && CUENTA.activa && typeof AJUSTES !== 'undefined' && !!AJUSTES.id;
  const minimo = () => { const m = (conf() || {}).minimo; return typeof m === 'number' && m >= 0 ? m : 2; };   // en euros

  // Paddle.js se carga solo al ir a pagar (y una vez)
  let cargando = null, alAcabar = null;
  function carga() {
    if (window.Paddle && window.Paddle.Checkout) return Promise.resolve(window.Paddle);
    return cargando || (cargando = new Promise((bien, mal) => {
      const s = document.createElement('script'); s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'; s.async = true;
      s.onload = () => {
        try {
          const c = conf(); if (!c) throw new Error('sin_config');
          if (c.token.startsWith('test_')) window.Paddle.Environment.set('sandbox');
          window.Paddle.Initialize({ token: c.token, eventCallback: ev => { if (alAcabar && ev && ev.name) alAcabar(ev); } });
          bien(window.Paddle);
        } catch (e) { cargando = null; mal(e); }
      };
      s.onerror = () => { cargando = null; mal(new Error('sin_conexion')); };
      document.head.appendChild(s);
    }));
  }
  // abre la ventana con la transacción que creó el servidor y espera a que se pague o se cierre
  function ventana(P, transaccion) {
    return new Promise((bien, mal) => {
      let pagado = false;
      alAcabar = ev => {
        if (ev.name === 'checkout.completed') { pagado = true; try { P.Checkout.close(); } catch (e) { /* ya cerrada */ } bien(); alAcabar = null; }
        else if (ev.name === 'checkout.closed' && !pagado) { alAcabar = null; mal(new Error('cancelada')); }
      };
      const idioma = typeof NUCLEO !== 'undefined' && NUCLEO.idioma ? NUCLEO.idioma : 'es';
      P.Checkout.open({ transactionId: transaccion, settings: { displayMode: 'overlay', theme: 'dark', locale: idioma, allowLogout: false } });
    });
  }
  // Paddle puede tardar unos segundos en dar el pago por bueno: se pregunta varias veces; si no, lo entrega su aviso (o el jugador al volver)
  async function confirmar(transaccion) {
    for (let i = 0; i < 6; i++) {
      const r = await CUENTA.funcion('pagos', { accion: 'confirmar', transaccion });
      if (r && r.ok) return r;
      if (!r || r.error !== 'pendiente') throw new Error((r && r.error) || 'pago');
      await new Promise(f => setTimeout(f, 1500 + i * 1000));
    }
    throw new Error('pendiente');
  }
  async function comprar(producto) {
    if (!disponible()) throw new Error('sin_pasarela');
    if (typeof ECO_SOMBRA !== 'undefined') await ECO_SOMBRA.vaciar();   // que el servidor sepa todo lo ganado antes (sin red, falla aquí y no se cobra nada)
    const c = await CUENTA.funcion('pagos', { accion: 'crear', juego: AJUSTES.id, producto });
    if (!c || !c.ok) throw new Error((c && c.error) || 'pago');
    const P = await carga();
    await ventana(P, c.transaccion);
    const r = await confirmar(c.transaccion);
    if (r.objeto && r.objeto.u && typeof SAVE !== 'undefined' && Array.isArray(SAVE.inv) && !SAVE.inv.some(x => x.u === r.objeto.u)) SAVE.inv.push({ u: r.objeto.u, k: r.objeto.k, id: r.objeto.id, q: r.objeto.q });
    if (typeof fire === 'function') fire('compra', r);
    if (typeof PAGOS !== 'undefined') await PAGOS.refrescar().catch(() => { /* sin red justo ahora: llega en la próxima sincronización */ });
    return Object.assign({ real: true }, r);
  }
  const errorTexto = e => {
    const m = String((e && e.message) || e);
    return /cancelad/i.test(m) ? '' : /ya_comprado/.test(m) ? tr('Ya lo tienes') : /pendiente/.test(m) ? tr('El pago todavía no está confirmado: lo recibirás en cuanto lo esté')
      : /compras_cerradas|sin_pasarela|sin_config/.test(m) ? tr('Las compras con euros solo están en la app de Android') : /cuenta/.test(m) ? tr('Esa compra se hizo con otra cuenta')
      : /sin_sesion|sin_conexion|Failed to fetch|NetworkError|HTTP 401/i.test(m) ? tr('Necesitas conexión para comprar') : tr('No se ha podido completar la compra. Si te han cobrado, lo recibirás en unos minutos.');
  };
  return { disponible, comprar, errorTexto, minimo };
})();
