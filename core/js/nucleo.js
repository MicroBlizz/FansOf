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

  // EL IDIOMA: el que el jugador elija en Opciones (se guarda en este navegador) o, si no ha elegido, el del navegador: español → 'es' y
  // cualquier otro → 'en'. Cambiarlo recarga la página. Los diccionarios solo se cargan si no es español (ver core/js/sistema/idioma.js).
  const IDIOMAS = ['es', 'en'];
  const idiomaElegido = () => { try { return localStorage.getItem('fansof-idioma') || ''; } catch (e) { return ''; } };
  const idiomaDelNavegador = () => { for (const l of (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'es'])) { const c = String(l).slice(0, 2).toLowerCase(); if (IDIOMAS.includes(c)) return c; } return 'en'; };
  const idioma = IDIOMAS.includes(idiomaElegido()) ? idiomaElegido() : idiomaDelNavegador();
  document.documentElement.lang = idioma;
  function elegirIdioma(i) { try { if (i) localStorage.setItem('fansof-idioma', i); else localStorage.removeItem('fansof-idioma'); } catch (e) { /* sin guardar */ } location.reload(); }
  // EL MODO DESARROLLO: en localhost (o con ?dev=1, que se recuerda en este navegador; ?dev=0 lo apaga) se carga core/js/sistema/desarrollo.js,
  // un botón «DEV» con utilidades para quien trabaja en el juego. En la web publicada no se carga ni se ve. El comparador lo apaga a propósito.
  const desarrollo = (() => {
    try {
      const q = new URLSearchParams(location.search).get('dev');
      if (q === '1' || q === '0') localStorage.setItem('fansof-dev', q);
      const v = localStorage.getItem('fansof-dev'); if (v) return v === '1';
    } catch (e) { /* sin guardar */ }
    return ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  })();
  const DICCIONARIOS = { en: ['idioma/en-serie-1.js', 'idioma/en-serie-2.js', 'idioma/en-serie-3.js', 'idioma/en-pantallas-1.js', 'idioma/en-pantallas-2.js', 'idioma/en-pantallas-3.js', 'idioma/en-pantallas-4.js', 'idioma/en-pantallas-5.js', 'idioma/en-plantillas.js', 'idioma/en-plantillas-2.js', 'idioma/en-extra.js', 'idioma/en-pases.js', 'idioma/en-salon.js'] };   // los de lo común, por idioma; cada juego añade los suyos en juego({ idioma: { en: [...] } })

  // LO COMÚN, en el orden en que se carga. Un archivo nuevo de core se apunta aquí y lo reciben todos los juegos.
  const COMUN = [
    'js/sistema/utiles.js',        // utilidades: no dependen de nada
    'js/sistema/sonido.js',        // el altavoz, los efectos y el motor de música
    'js/serie/config.js',          // la serie: constantes y CFG (las cartas, unidades, tipos y roles los añade cada facción)
    'js/serie/facciones/animales.js', 'js/serie/facciones/nomuertos.js', 'js/serie/facciones/streamers.js', 'js/serie/facciones/heroes.js', 'js/serie/facciones/ciber.js', 'js/serie/facciones/memes.js', 'js/serie/facciones/gamer.js', 'js/serie/facciones/olvidados.js', 'js/serie/facciones/pop.js', 'js/serie/facciones/microblizz.js', 'js/serie/facciones/phony.js',
    'js/serie/facciones/cierre.js', // lo que se calcula con todas las cartas ya puestas
    'js/serie/arte/base.js',        //           las ayudas de dibujo y ART y BOX vacíos
    'js/serie/arte/animales.js', 'js/serie/arte/nomuertos.js', 'js/serie/arte/streamers.js', 'js/serie/arte/heroes.js', 'js/serie/arte/ciber.js', 'js/serie/arte/memes.js', 'js/serie/arte/gamer.js', 'js/serie/arte/olvidados.js', 'js/serie/arte/pop.js', 'js/serie/arte/microblizz.js', 'js/serie/arte/phony.js',
    'js/serie/arte/sprites.js',     //           las cajas, buildSprites y drawVector (después de todos los dibujos)
    'js/serie/arte/fondos.js',      //           el campo y los colores de cada facción
    'js/serie/canciones.js',       //           las canciones
    'js/serie/frases.js',          //           frases de humor comunes
    'js/serie/iconos.js',          //           iconos y colores
    'js/serie/catalogo.js',        //           qué habilidades y objetos existen
    'js/sistema/progreso.js',      // economía, catálogo de cada juego, calidades, tienda y partida guardada
    'js/sistema/economia.js',      // el oro, las gemas y las entradas pasan siempre por ECO
    'js/sistema/cuenta.js',       // la partida también en la nube: cuenta de invitado, subir y bajar
    'js/sistema/economia-sombra.js', // modo sombra: el servidor apunta lo que se gana y se gasta, para compararlo (PLAN-CUENTAS, fase 1)
    'js/sistema/pantallas.js',     // lo que usan todas las pantallas: cambiar de una a otra, cartera, niveles, avisos
    'js/sistema/coleccion.js',     // colección: las cartas y lo que llevan puesto
    'js/sistema/biblioteca.js',    // biblioteca: galería de habilidades y objetos
    'js/sistema/inventario.js',    // inventario: las copias de habilidades y objetos
    'js/sistema/gachapon.js',      // gashapón
    'js/sistema/probabilidades.js', // tablas de probabilidades del gashapón (las enseña la tienda)
    'js/sistema/tienda.js',        // tienda
    'js/sistema/horas-extra.js', 'js/sistema/horas-extra-escena.js',   // horas extra: el minijuego del menú
    'js/sistema/opciones.js',      // opciones comunes (música del menú, versión) e instalar como app
    'js/sistema/cuenta-pantalla.js', // la fila «Cuenta» de Opciones (guardar con email, entrar, cerrar sesión, borrar)
    'js/sistema/pruebas.js',       // el modo pruebas de Opciones: todo al máximo, con copia para volver a tu partida
    'js/novedades.js',             // el informe de parches (la lista es de cada juego: su js/novedades.js)
  ];

  // Hojas de estilo, en el orden en que se dan. Se escriben en la cabecera, como si estuvieran en el HTML, para que la página no se pinte sin ellas.
  const ESTILOS_COMUNES = ['../../core/css/menus.css', '../../core/css/menus-tienda.css', '../../core/css/menus-extra.css', '../../core/css/menus-pases.css'];   // las pantallas comunes: un juego pide la primera y se cargan las cuatro, en este orden
  function estilos(...hojas) { for (const h of hojas.flatMap(x => (x === ESTILOS_COMUNES[0] ? ESTILOS_COMUNES : [x]))) { pedido.push(conV(h)); document.write(`<link rel="stylesheet" href="${conV(h)}">`); } }

  // Un archivo de código. Con async = false se ejecutan en el orden en que se piden, aunque lleguen desordenados.
  function codigo(src) {
    const s = document.createElement('script'); s.src = conV(src); s.async = false;
    s.onerror = () => console.error('No se ha podido cargar ' + src);
    pedido.push(s.src); document.body.appendChild(s);
  }
  // antes: lo que el juego le dice a lo común (sus ajustes) · despues: el juego en sí
  // idioma: los diccionarios de cada idioma del juego, por ejemplo { en: ['idioma/en.js'] }
  function juego({ antes = [], despues = [], idioma: dic = {} }) {
    codigo(CORE + 'js/sistema/idioma.js');
    if (idioma !== 'es') { (DICCIONARIOS[idioma] || []).forEach(f => codigo(CORE + f)); (dic[idioma] || []).forEach(codigo); }
    antes.forEach(codigo); COMUN.forEach(f => codigo(CORE + f)); despues.forEach(codigo);
    if (desarrollo) codigo(CORE + 'js/sistema/desarrollo.js');   // el último: ya está todo cargado
    if (idioma !== 'es') {   // la página espera, tapada, a que se traduzca lo que ya hay; después se traduce también lo que el juego escriba
      const velo = document.createElement('style'); velo.textContent = 'body { visibility: hidden !important; }'; document.head.appendChild(velo);
      const listo = () => { IDIOMA.pantalla(); velo.remove(); };
      window.addEventListener('load', listo); setTimeout(() => { if (velo.isConnected) listo(); }, 8000);
    }
    sinConexion();
  }

  // Una página que no es un juego (la de la raíz) también se traduce: carga idioma.js y los diccionarios de lo común y los que se le den
  function idiomaSolo(dic = {}) {
    codigo(CORE + 'js/sistema/idioma.js');
    if (idioma !== 'es') {
      (DICCIONARIOS[idioma] || []).forEach(f => codigo(CORE + f)); (dic[idioma] || []).forEach(codigo);
      const velo = document.createElement('style'); velo.textContent = 'body { visibility: hidden !important; }'; document.head.appendChild(velo);
      const listo = () => { IDIOMA.pantalla(); velo.remove(); };
      window.addEventListener('load', listo); setTimeout(() => { if (velo.isConnected) listo(); }, 8000);
    }
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

  // FLAGS DE DESARROLLO: lo nuevo o a medias se esconde tras NUCLEO.desarrollo (sin más) o, si hace falta un flag propio, tras NUCLEO.flag('nombre', 'qué hace').
  // Solo vale true en modo desarrollo (y si no se ha apagado en el panel DEV); en la web publicada siempre es false. Cada flag queda registrado en el panel DEV.
  // Al terminar la tarea, el flag se quita y el código queda como funcionalidad normal (ver CLAUDE.md).
  const flagsDev = {};
  const flag = (nombre, descripcion = '') => {
    if (!desarrollo) return false;
    flagsDev[nombre] = descripcion;
    try { return localStorage.getItem('fansof-flag-' + nombre) !== '0'; } catch (e) { return true; }
  };
  return { version, nativa, idioma, elegirIdioma, desarrollo, flag, flagsDev, estilos, juego, idiomaSolo };
})();
const VERSION = NUCLEO.version;
