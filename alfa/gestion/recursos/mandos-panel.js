// Fans Of · RECURSOS · mandos de un panel (visores de la galería local y de la pestaña Recursos de /gestion): lo que comparten los visores de los paneles (visor-lonchas.html y
// visor-glb.html) para hablar con la galería por postMessage. La galería les manda los mandos comunes (girar, dar vueltas, vista inicial,
// contorno, postura, reproducir) y ellos le dicen que están listos, cuánto los gira quien los arrastra (para que giren los demás) y si piden
// la pantalla completa («ampliar», que en /gestion abre recursos-ampliar.js).
// Solo se aceptan mensajes del mismo origen, de la ventana de arriba y con el campo tipo propio. Guía: docs/guia/herramientas/galeria.md
'use strict';
const MANDOS_PANEL = (() => {
  const TIPO = 'fansof-galeria-mandos';
  const dentro = () => typeof window !== 'undefined' && window.parent !== window;
  function manda(orden, valor) { if (dentro()) window.parent.postMessage({ tipo: TIPO, orden, valor }, location.origin); }
  // puro: el manejador de un mensaje, o null si no viene del mismo origen y de la ventana de arriba con el tipo y una orden conocida
  function manejador(e, origen, arriba, manejadores) {
    if (e.origin !== origen || e.source !== arriba || !e.data || e.data.tipo !== TIPO) return null;
    return Object.prototype.hasOwnProperty.call(manejadores, e.data.orden) ? manejadores[e.data.orden] : null;
  }
  // manejadores: { girar(delta), vueltas(si), 'vista-inicial'(), contorno(si), postura('siguiente'), reproducir(si) }
  // Esc y las flechas se reenvían a la página de arriba: en la pantalla completa de /gestion cierran o pasan a la siguiente salida
  const TECLAS = ['Escape', 'ArrowLeft', 'ArrowRight'];
  function reenvia(ev) { if (TECLAS.includes(ev.key) && !/^(INPUT|SELECT|TEXTAREA)$/.test((ev.target && ev.target.tagName) || '')) manda('tecla', ev.key); }
  function escucha(manejadores) {
    addEventListener('message', e => {
      const h = manejador(e, location.origin, window.parent, manejadores);
      if (h) h(e.data.valor);
    });
    addEventListener('keydown', reenvia);
    manda('listo');
  }
  return { TIPO, TECLAS, manda, escucha, manejador };
})();
if (typeof module !== 'undefined') module.exports = MANDOS_PANEL;   // en node (tests/herramientas/galeria/ y tests/gestion/) solo se carga
