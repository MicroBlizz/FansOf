// Fans Of · NÚCLEO · el entorno: dónde corre la página (la alfa, la app de Android) y si va en modo desarrollo. Una pieza de nucleo.js
// (tarea #28): solo calcula, con lo que le pasa nucleo.js (la dirección, el almacenamiento y Capacitor), así que se prueba en Node.
// EL MODO DESARROLLO: en localhost (o con ?dev=1, que se recuerda en este navegador; ?dev=0 lo apaga) se carga core/js/sistema/desarrollo.js,
// un botón «DEV» con utilidades para quien trabaja en el juego. El panel DEV sale también en la alfa; en la release no se carga ni se ve, ni con ?dev=1.
// Fuera de localhost y de la alfa (la release) NUNCA vale: ni ?dev=1 ni lo guardado en el navegador, con rol o sin él. El comparador lo apaga a propósito.
'use strict';
(() => {
  const LOCALES = ['localhost', '127.0.0.1', '[::1]'];
  // la app de Android (Capacitor) también es «localhost», pero allí no hay modo desarrollo
  const esNativa = capacitor => !!(capacitor && typeof capacitor.isNativePlatform === 'function' && capacitor.isNativePlatform());

  // ¿modo desarrollo? ?dev=1 o ?dev=0 se guardan (y mandan) solo donde vale: localhost o la alfa
  function enDesarrollo({ alfa, host, busqueda, almacen, nativa }) {
    if (!alfa && !LOCALES.includes(host)) return false;
    try {
      const q = new URLSearchParams(busqueda).get('dev');
      if (q === '1' || q === '0') almacen.setItem('fansof-dev', q);
      const v = almacen.getItem('fansof-dev'); if (v) return v === '1';
    } catch (e) { /* sin guardar: se sigue con la regla por defecto */ }
    if (nativa) return false;
    return LOCALES.includes(host);
  }

  // ubicacion: { pathname, hostname, search } · almacen: como localStorage · capacitor: window.Capacitor o nada
  function entorno({ ubicacion, almacen, capacitor }) {
    const alfa = /\/alfa\//.test(ubicacion.pathname);   // la copia de pruebas (carpeta alfa/ de la web): su versión es «<versión>-a<hash>»
    const nativa = esNativa(capacitor);
    const desarrollo = enDesarrollo({ alfa, host: ubicacion.hostname, busqueda: ubicacion.search, almacen, nativa });
    return Object.freeze({ alfa, nativa, desarrollo });
  }

  if (typeof NUCLEO_PIEZAS !== 'undefined') NUCLEO_PIEZAS.entorno = entorno;
  if (typeof module !== 'undefined') module.exports = entorno;
})();
