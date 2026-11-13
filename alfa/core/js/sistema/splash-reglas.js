// Fans Of · SPLASH · las reglas de la pantalla de carga, como funciones puras (sin DOM, sin reloj): cuándo sale, cuándo se va, adónde va
// la barra y qué aviso enseña. splash.js las usa para pintar; tests/core/splash.test.mjs las prueba. Guía: docs/guia/core/splash.md. ADR 091.
'use strict';
const SPLASH_REGLAS = (() => {
  const TRAMO_ARCHIVOS = 0.7, TRAMO_LOAD = 0.9;   // los archivos que pide nucleo.js llenan hasta el 70 %; el load lleva al 90 %; listo() al 100 %
  const TARDA_MS = 20000;                          // a partir de aquí sale «Está tardando más de lo normal» (la splash sigue)
  const SUAVE_S = 0.25, ARRASTRE_S = 0.35, HUECO = 0.03;   // lo dibujado alcanza lo real en ~0,25 s; entre señales se arrastra hacia el tope (la mitad del hueco cada ~2 s) sin llegar
  const entre = (x, a, b) => Math.min(b, Math.max(a, x));

  // ¿la página es un juego o una demo? (games/<id>/ o demos/<id>/, también dentro de la alfa). La portada y el resto de la web no llevan splash.
  function enJuego(pathname) { return /\/(?:games|demos)\/[^/]+/.test(String(pathname || '')); }

  // ¿sale? En los juegos, siempre; un navegador automatizado (comparador, pruebas) no la ve salvo forzada (?splash=1)
  function sale({ automatizado, forzada }) { return !!forzada || !automatizado; }

  // ¿se puede ir? Con el load de la página y, si el juego lo declaró (esperaListo), con su NUCLEO.listo(). Con un error, nunca: se queda avisando.
  function seVa({ cargada, listo, esperaListo, error }) { return !error && !!cargada && (!esperaListo || !!listo); }

  // lo que la carga lleva de verdad (0 a 1). Hasta que el juego no ha pedido todos sus archivos (todoPedido) no se sabe cuántos son: 0.
  function real({ pedidos, llegados, todoPedido, cargada, listo, esperaListo, error }) {
    if (seVa({ cargada, listo, esperaListo, error })) return 1;
    if (cargada) return TRAMO_LOAD;
    return todoPedido && pedidos > 0 ? TRAMO_ARCHIVOS * entre(llegados / pedidos, 0, 1) : 0;
  }

  // el siguiente tope: hasta dónde puede arrastrarse la barra mientras espera la próxima señal (nunca lo alcanza)
  function tope({ pedidos, llegados, todoPedido, cargada }) {
    if (cargada) return 1;
    return todoPedido && llegados >= pedidos ? TRAMO_LOAD : TRAMO_ARCHIVOS;
  }

  // lo que se dibuja tras dt segundos: alcanza lo real con suavidad y, si ya está, se arrastra despacio hacia el tope. Nunca retrocede.
  // Con «reducir movimiento», salta a lo real sin animar. Parado por un error, no se mueve.
  function avanza(dibujado, { real: r, tope: t, dt, quieto, parado }) {
    if (parado) return dibujado;
    if (quieto) return Math.max(dibujado, r);
    if (dibujado < r) return Math.min(r, dibujado + (r - dibujado) * entre(dt / SUAVE_S, 0, 1) + 0.002);
    const techo = r >= 1 ? 1 : t - HUECO;
    if (dibujado >= techo) return dibujado;
    return Math.max(dibujado, dibujado + (techo - dibujado) * entre(dt * ARRASTRE_S, 0, 1));
  }

  // el aviso bajo la barra: 'error' (falló un archivo), 'sin-red' (falló sin conexión), 'tarda' (pasados 20 s) o null
  function aviso({ ms, error, enLinea }) {
    if (error) return enLinea === false ? 'sin-red' : 'error';
    return ms >= TARDA_MS ? 'tarda' : null;
  }

  return Object.freeze({ enJuego, sale, seVa, real, tope, avanza, aviso, TRAMO_ARCHIVOS, TRAMO_LOAD, TARDA_MS });
})();
if (typeof module !== 'undefined') module.exports = SPLASH_REGLAS;
