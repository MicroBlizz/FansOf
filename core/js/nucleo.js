// Fans Of · NÚCLEO: carga, en orden, lo común (core/) y el juego.
//
// Cada juego lo pone en la cabecera de su index.html, con su versión:
//     <script src="../../core/js/nucleo.js?v=0.9.6"></script>
//     <script>NUCLEO.estilos('css/mi-juego.css')</script>
// y, al final de la página, dice qué archivos suyos hay que cargar antes y después de lo común:
//     <script>NUCLEO.juego({ antes: ['js/ajustes.js'], despues: ['js/juego.js'] })</script>
//
// LA VERSIÓN SE ESCRIBE SOLO AHÍ (el ?v= de este archivo). De ella salen:
//   · VERSION, que es lo que enseña el juego en Opciones;
//   · el ?v= de cada estilo y cada archivo, para que el navegador no mezcle copias viejas con nuevas;
//   · el nombre de la copia para jugar sin conexión.
// Hay que cambiarla cada vez que se publica algo, aunque el jugador no vaya a notar nada. Si lo va a notar,
// además se añade el informe en js/novedades.js del juego.
'use strict';
const NUCLEO = (() => {
  const yo = document.currentScript, CORE = new URL('..', yo.src).href;      // la dirección de core/
  const version = new URL(yo.src).searchParams.get('v') || '0';
  const conV = u => u + (u.includes('?') ? '&' : '?') + 'v=' + version;
  const pedido = [];   // todo lo que carga la página: es lo que se guarda para jugar sin conexión

  // LO COMÚN, en el orden en que se carga. Un archivo nuevo de core se apunta aquí y lo reciben todos los juegos.
  const COMUN = [
    'js/sistema/utiles.js',        // utilidades: no dependen de nada
    'js/sistema/sonido.js',        // el altavoz, los efectos y el motor de música
    'js/serie/config.js',          // la serie: facciones, cartas y sus números
    'js/serie/arte/base.js',        //           las ayudas de dibujo y ART y BOX vacíos
    'js/serie/arte/animales.js', 'js/serie/arte/nomuertos.js', 'js/serie/arte/streamers.js', 'js/serie/arte/heroes.js', 'js/serie/arte/ciber.js', 'js/serie/arte/memes.js', 'js/serie/arte/gamer.js', 'js/serie/arte/olvidados.js', 'js/serie/arte/pop.js', 'js/serie/arte/microblizz.js', 'js/serie/arte/phony.js',
    'js/serie/arte/sprites.js',     //           las cajas, buildSprites y drawVector (después de todos los dibujos)
    'js/serie/arte/fondos.js',      //           el campo y los colores de cada facción
    'js/serie/canciones.js',       //           las canciones
    'js/serie/frases.js',          //           frases de humor comunes
    'js/serie/iconos.js',          //           iconos y colores
    'js/serie/catalogo.js',        //           qué habilidades y objetos existen
    'js/sistema/progreso.js',      // economía, catálogo de cada juego, calidades, tienda y partida guardada
    'js/sistema/pantallas.js',     // lo que usan todas las pantallas: cambiar de una a otra, cartera, niveles, avisos
    'js/sistema/coleccion.js',     // colección: las cartas y lo que llevan puesto
    'js/sistema/inventario.js',    // inventario: las copias de habilidades y objetos
    'js/sistema/gachapon.js',      // gashapón
    'js/sistema/tienda.js',        // tienda
    'js/sistema/horas-extra.js', 'js/sistema/horas-extra-escena.js',   // horas extra: el minijuego del menú
    'js/sistema/opciones.js',      // opciones comunes (música del menú, versión) e instalar como app
    'js/novedades.js',             // el informe de parches (la lista es de cada juego: su js/novedades.js)
  ];

  // Hojas de estilo, en el orden en que se dan. Se escriben en la cabecera, como si estuvieran en el HTML, para que la página no se pinte sin ellas.
  function estilos(...hojas) { for (const h of hojas) { pedido.push(conV(h)); document.write(`<link rel="stylesheet" href="${conV(h)}">`); } }

  // Un archivo de código. Con async = false se ejecutan en el orden en que se piden, aunque lleguen desordenados.
  function codigo(src) {
    const s = document.createElement('script'); s.src = conV(src); s.async = false;
    s.onerror = () => console.error('No se ha podido cargar ' + src);
    pedido.push(s.src); document.body.appendChild(s);
  }
  // antes: lo que el juego le dice a lo común (sus ajustes) · despues: el juego en sí
  function juego({ antes = [], despues = [] }) {
    antes.forEach(codigo); COMUN.forEach(f => codigo(CORE + f)); despues.forEach(codigo);
    sinConexion();
  }

  // Instalar como app y jugar sin conexión: solo en la web del juego. No en un archivo abierto a mano, ni dentro de otra página,
  // ni en la app de Android (que ya lleva el juego dentro).
  const nativa = !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
  function sinConexion() {
    let arriba = true; try { arriba = window.self === window.top; } catch (e) { arriba = false; }
    if (!arriba || nativa || !(location.protocol === 'https:' || location.hostname === 'localhost')) return;
    const l = document.createElement('link'); l.rel = 'manifest'; l.href = 'manifest.webmanifest'; document.head.appendChild(l);
    const guardar = ['./', yo.src, 'manifest.webmanifest', CORE + 'img/icon-192.png', CORE + 'img/icon-512.png', CORE + 'img/icon-maskable.png'].concat(pedido);
    try {
      if ('serviceWorker' in navigator) navigator.serviceWorker.register(conV('sw.js')).then(() => navigator.serviceWorker.ready)
        .then(reg => { if (reg.active) reg.active.postMessage({ guardar }); }).catch(() => { /* sin modo sin conexión */ });
    } catch (e) { /* el navegador no lo permite aquí */ }
  }

  return { version, nativa, estilos, juego };
})();
const VERSION = NUCLEO.version;
