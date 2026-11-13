// Fans Of · NÚCLEO · el entorno: dónde corre la página (la alfa, la app de Android) y si va en modo desarrollo. Una pieza de nucleo.js
// (tarea #28): solo calcula, con lo que le pasa nucleo.js (la dirección, el almacenamiento y Capacitor), así que se prueba en Node.
// EL MODO DESARROLLO: en localhost (o con ?dev=1, que se recuerda en este navegador; ?dev=0 lo apaga) se abre lo que está a medias: los juegos
// cerrados, los flags locales, las compras de prueba. Fuera de localhost y de la alfa (la release) y en la app de Android NUNCA vale: ni ?dev=1
// ni lo guardado en el navegador, con rol o sin él. El comparador lo apaga a propósito. proximamente.js copia esta regla (tarea #33): si cambia aquí,
// cambia allí y en su test.
// EL PANEL DEV (core/js/sistema/desarrollo.js, el botón «DEV») es otra cosa (ADR 096): sale en la alfa y en el modo desarrollo, y en la release y la
// app de Android solo para una cuenta con el rol «alfa». panelDev(rolRecordado) lo dice; el rol lo lleva CUENTA.roles (core/js/cuenta/, ADR 097) y panel-dev.js decide cuándo se carga. No abre ningún juego cerrado.
'use strict';
(() => {
  const LOCALES = ['localhost', '127.0.0.1', '[::1]'];
  // la app de Android (Capacitor) también es «localhost», pero allí no hay modo desarrollo
  const esNativa = capacitor => !!(capacitor && typeof capacitor.isNativePlatform === 'function' && capacitor.isNativePlatform());

  // ¿modo desarrollo? ?dev=1 o ?dev=0 se guardan (y mandan) solo donde vale: localhost o la alfa
  function enDesarrollo({ alfa, host, busqueda, almacen, nativa }) {
    if (nativa || (!alfa && !LOCALES.includes(host))) return false;   // la app de Android, nunca: ni con lo guardado
    try {
      const q = new URLSearchParams(busqueda).get('dev');
      if (q === '1' || q === '0') almacen.setItem('fansof-dev', q);
      const v = almacen.getItem('fansof-dev'); if (v) return v === '1';
    } catch (e) { /* sin guardar: se sigue con la regla por defecto */ }
    return LOCALES.includes(host);
  }

  // ubicacion: { pathname, hostname, search } · almacen: como localStorage · capacitor: window.Capacitor o nada
  function entorno({ ubicacion, almacen, capacitor }) {
    const alfa = /\/alfa\//.test(ubicacion.pathname);   // la copia de pruebas (carpeta alfa/ de la web): su versión es «<versión>-a<hash>»
    const nativa = esNativa(capacitor);
    const desarrollo = enDesarrollo({ alfa, host: ubicacion.hostname, busqueda: ubicacion.search, almacen, nativa });
    // ¿sale el panel DEV? rolRecordado: lo confirmado guardado del rol «alfa» de la cuenta que está dentro (CUENTA.roles, ADR 097)
    const panelDev = rolRecordado => desarrollo || alfa || !!rolRecordado;
    return Object.freeze({ alfa, nativa, desarrollo, panelDev });
  }

  if (typeof NUCLEO_PIEZAS !== 'undefined') NUCLEO_PIEZAS.entorno = entorno;
  if (typeof module !== 'undefined') module.exports = entorno;
})();
