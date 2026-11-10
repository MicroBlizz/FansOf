// Fans Of · NÚCLEO · instalar como app y jugar sin conexión: el manifest y el service worker (sw.js), que guarda todo lo que pidió la página.
// Solo en la web del juego: no en un archivo abierto a mano, ni dentro de otra página, ni en la alfa, ni en la app de Android (que ya lleva el juego dentro).
// Una pieza de nucleo.js (tarea #28): recibe la ventana, el documento y el navegador, así que se prueba en Node.
'use strict';
(() => {
  const ICONOS = ['img/icon-192.png', 'img/icon-512.png', 'img/icon-maskable.png'];

  function arriba(ventana) { try { return ventana.self === ventana.top; } catch (e) { return false; } }   // dentro de otra página (iframe) no
  const seguro = ubicacion => ubicacion.protocol === 'https:' || ubicacion.hostname === 'localhost';

  // ¿se puede ofrecer aquí? ventana: window · ubicacion: location · nativa, alfa: del entorno
  const puede = ({ ventana, ubicacion, nativa, alfa }) => arriba(ventana) && !nativa && !alfa && seguro(ubicacion);
  // lo que se guarda: la página, nucleo.js, el manifest, los iconos de core y todo lo pedido
  const aGuardar = ({ nucleoSrc, core, pedido }) => ['./', nucleoSrc, 'manifest.webmanifest'].concat(ICONOS.map(i => core + i), pedido);

  // registra({ nucleoSrc, core, pedido, conV }): pone el manifest y le pasa al service worker la lista que guardar
  function sinConexion({ ventana, ubicacion, documento, navegador, nativa, alfa }) {
    return function registra({ nucleoSrc, core, pedido, conV }) {
      if (!puede({ ventana, ubicacion, nativa, alfa })) return false;
      const l = documento.createElement('link'); l.rel = 'manifest'; l.href = 'manifest.webmanifest'; documento.head.appendChild(l);
      const guardar = aGuardar({ nucleoSrc, core, pedido });
      try {
        if ('serviceWorker' in navegador) navegador.serviceWorker.register(conV('sw.js')).then(() => navegador.serviceWorker.ready)
          .then(reg => { if (reg.active) reg.active.postMessage({ guardar }); }).catch(() => { /* sin modo sin conexión */ });
      } catch (e) { /* el navegador no lo permite aquí */ }
      return true;
    };
  }
  sinConexion.puede = puede; sinConexion.aGuardar = aGuardar;

  if (typeof NUCLEO_PIEZAS !== 'undefined') NUCLEO_PIEZAS.sinConexion = sinConexion;
  if (typeof module !== 'undefined') module.exports = sinConexion;
})();
