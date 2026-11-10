// Fans Of · NÚCLEO: carga, en orden, lo común (core/) y el juego.
//
// Cada juego lo pone en la cabecera de su index.html, con su versión:
//     <script src="../../core/js/nucleo.js?v=0.9.6"></script>      (lo primero de la cabecera: pinta la splash)
//     <script>NUCLEO.fuentes('../../core/fuentes/baloo-2.css')</script> <script>NUCLEO.estilos('css/mi-juego.css')</script>
// y, al final de la página, dice qué archivos suyos hay que cargar antes y después de lo común:
//     <script>NUCLEO.juego({ antes: ['js/ajustes.js'], despues: ['js/juego.js'] })</script>
//
// LA VERSIÓN SE ESCRIBE SOLO AHÍ (el ?v= de este archivo). De ella salen:
//   · VERSION, que es lo que enseña el juego en Opciones;
//   · el ?v= de cada estilo y cada archivo, para que el navegador no mezcle copias viejas con nuevas;
//   · el nombre de la copia para jugar sin conexión.
// Hay que cambiarla cada vez que se publica algo, aunque el jugador no vaya a notar nada. Si lo va a notar,
// además se añade el informe en js/novedades.js del juego.
//
// nucleo.js solo ORQUESTA (tarea #28, ADR 095): pide lo primero (Próximamente, la splash y la puerta de carga) y sus piezas de core/js/nucleo/,
// y las monta cuando han llegado, antes de que la página siga. Cada pieza hace una cosa y se prueba sola (tests/core/nucleo-*.test.mjs):
//   listas.js           qué archivos de core carga cada tipo de juego (COMUN, LIGERO), los diccionarios y las hojas comunes
//   entorno.js          la alfa, la app de Android y el modo desarrollo
//   idioma-eleccion.js  qué idioma se usa, cambiarlo y el velo hasta traducir
//   cargador.js         pedir hojas, fuentes y código por la puerta de carga y contarlos para la splash
//   sin-conexion.js     instalar como app y jugar sin conexión
// Las piezas se apuntan en NUCLEO_PIEZAS (el único global que añaden) y nucleo.js les pasa lo que usan (la página, el almacenamiento…).
// El entorno y el idioma van antes que Próximamente (guarda el ?dev= que este lee); las demás, después de la splash y la puerta.
'use strict';
const NUCLEO_PIEZAS = {};
const NUCLEO = (() => {
  const yo = document.currentScript, CORE = new URL('..', yo.src).href;      // la dirección de core/
  const version = new URL(yo.src).searchParams.get('v') || '0';
  const conV = u => u + (u.includes('?') ? '&' : '?') + 'v=' + version;
  // LO PRIMERO, antes que proximamente.js: dónde corre la página y en qué idioma. Así el ?dev=1 o ?dev=0 queda guardado antes de que
  // Próximamente lo lea (allí decide si se juega un juego cerrado) y la página, aunque pase a ser la de Próximamente, ya lleva su idioma en <html lang>
  const ANTES = ['js/nucleo/entorno.js', 'js/nucleo/idioma-eleccion.js'].map(f => conV(CORE + f));
  for (const src of ANTES) document.write('<script src="' + src + '"><\/script>');
  document.write('<script>NUCLEO_PIEZAS.montarPrimero()<\/script>');
  // en la release solo se juegan los juegos abiertos (ver proximamente.js); si no lo está, la página pasa a ser la de «Próximamente» y se
  // para ahí (window.stop): no llega a correr nada más de la página, así que nada de aquí abajo tiene que mirarlo
  document.write('<script src="' + CORE + 'js/proximamente.js"><\/script>');
  // LA SPLASH, lo primero (ADR 091): es la pantalla de carga de los juegos. Se pide aquí, antes que cualquier hoja o script, para que tape la página
  // desde el primer pintado; splash.js decide si sale (solo en un juego o una demo, ver PROXIMAMENTE.juego). Lo que pide el juego se le cuenta.
  // Detrás, la puerta de carga (PUERTA_CARGA, ADR 093): las hojas no bloquean el pintado y el código del juego espera a que hayan llegado ellas y la letra.
  // Y luego las piezas, que corren antes de que la página siga: el montaje (el último script escrito) las junta.
  const PRIMEROS = ['js/sistema/splash-reglas.js', 'js/sistema/splash-logo.js', 'js/sistema/splash.js', 'js/sistema/puerta.js'];
  const PIEZAS = ['js/nucleo/listas.js', 'js/nucleo/cargador.js', 'js/nucleo/sin-conexion.js'];
  const escritos = PRIMEROS.concat(PIEZAS).map(f => conV(CORE + f));
  for (const src of escritos) document.write('<script src="' + src + '"><\/script>');
  document.write('<script>NUCLEO_PIEZAS.montar()<\/script>');
  // Si splash.js no hubiera llegado (bloqueado o sin red), el juego carga igual, sin splash: por eso todo pasa por aSplash.
  const aSplash = (orden, ...datos) => { if (typeof SPLASH !== 'undefined') SPLASH[orden](...datos); };

  const nucleo = {};   // lo que se devuelve (NUCLEO): se rellena al montar; el idioma puede cambiar al registrar el juego
  let p = null, en = null, idioma = null;   // las piezas ya montadas, el entorno y la elección del idioma
  // el almacenamiento puede estar bloqueado (leer localStorage ya falla): las piezas siguen sin él
  const almacen = () => { try { return localStorage; } catch (e) { return null; } };
  // una pieza que no llegó (sin red, bloqueada) para la carga con su nombre y la splash lo dice, en vez de quedarse esperando sin aviso
  function exige(...nombres) {
    const falta = nombres.filter(n => typeof NUCLEO_PIEZAS[n] === 'undefined');
    if (!falta.length) return;
    aSplash('falla', 'core/js/nucleo/ (' + falta.join(', ') + ')');
    throw new Error('Faltan piezas del núcleo: ' + falta.join(', '));
  }
  function montarPrimero() {
    if (en) return;
    exige('entorno', 'idiomaEleccion');
    const e = NUCLEO_PIEZAS.entorno({ ubicacion: location, almacen: almacen(), capacitor: window.Capacitor });
    idioma = NUCLEO_PIEZAS.idiomaEleccion({ almacen: almacen(), navegador: navigator, documento: document, recarga: () => location.reload() });
    en = e;   // solo con las dos hechas: si una falla, se vuelve a intentar entera
    Object.assign(nucleo, { nativa: en.nativa, alfa: en.alfa, desarrollo: en.desarrollo, idioma: idioma.idioma, idiomas: idioma.idiomas });
  }
  function montar() {
    if (p) return p;
    montarPrimero(); exige('listas', 'cargador', 'sinConexion');
    const P = NUCLEO_PIEZAS;
    p = {
      listas: P.listas, entorno: en,
      idioma,
      carga: P.cargador({ documento: document, puerta: PUERTA_CARGA, aSplash, conV, estilosComunes: P.listas.ESTILOS_COMUNES, consola: console }),
      sinConexion: P.sinConexion({ ventana: window, ubicacion: location, documento: document, navegador: navigator, nativa: en.nativa, alfa: en.alfa }),
    };
    p.carga.pedido.push(...ANTES, ...escritos);
    nucleo.carga = p.carga.carga;
    return p;
  }
  Object.assign(NUCLEO_PIEZAS, { montarPrimero, montar });
  const ajustaIdioma = dic => { p.idioma.ajusta(dic); Object.assign(nucleo, { idioma: p.idioma.idioma, idiomas: p.idioma.idiomas }); };
  // los diccionarios de lo común y los del juego (dic), si no se juega en español
  function diccionarios(dic) {
    const i = p.idioma.idioma; if (i === 'es') return;
    (p.listas.DICCIONARIOS[i] || []).forEach(f => p.carga.codigo(CORE + f)); (dic[i] || []).forEach(f => p.carga.codigo(f));
  }
  // la página espera tapada a que se traduzca (si la splash ya tapa, solo se traduce al cargar)
  const veloDeIdioma = () => p.idioma.velo({ tapada: typeof SPLASH !== 'undefined' && SPLASH.visible, alCargar, traduce: () => { if (typeof IDIOMA !== 'undefined') IDIOMA.pantalla(); }, espera: setTimeout });
  // lo que antes colgaba del load de la ventana cuelga de aquí: el load puede llegar antes que el código del juego (ADR 093)
  const alCargar = fn => PUERTA_CARGA.alCargar(fn);

  // antes: lo que el juego le dice a lo común (sus ajustes) · despues: el juego en sí
  // idioma: los diccionarios de cada idioma del juego, por ejemplo { en: ['idioma/en.js'] }
  // esperaListo: el juego llamará a NUCLEO.listo() cuando tenga su pantalla preparada, y la splash espera también a eso (no solo al load)
  function juego({ antes = [], despues = [], idioma: dic = {}, ligero = false, esperaListo = false }) {
    montar();
    const codigo = (src, opcional) => p.carga.codigo(src, opcional);
    if (esperaListo) aSplash('esperaListo');
    ajustaIdioma(dic);
    codigo(CORE + 'js/sistema/idioma.js');
    codigo(CORE + 'js/sistema/analitica.js', true);   // estadísticas de visitas, solo si el jugador acepta (opcional: un bloqueador no para el juego)
    diccionarios(dic);
    antes.forEach(f => codigo(f)); (ligero ? p.listas.LIGERO : p.listas.COMUN).forEach(f => codigo(CORE + f)); despues.forEach(f => codigo(f));
    if (p.entorno.desarrollo || p.entorno.alfa) codigo(CORE + 'js/sistema/desarrollo.js', true);   // el último: ya está todo cargado. El panel DEV existe en la alfa y en localhost, nunca en la release
    p.carga.todoPedido();
    if (p.idioma.idioma !== 'es') veloDeIdioma();
    p.sinConexion({ nucleoSrc: yo.src, core: CORE, pedido: p.carga.pedido, conV });
  }
  // Una página que no es un juego (la de la raíz) también se traduce: carga idioma.js y los diccionarios de lo común y los que se le den
  function idiomaSolo(dic = {}) {
    montar(); ajustaIdioma(dic);
    p.carga.codigo(CORE + 'js/sistema/idioma.js');
    diccionarios(dic);
    p.carga.todoPedido();
    if (p.idioma.idioma !== 'es') veloDeIdioma();
  }
  // El juego avisa de que su pantalla está preparada (solo cuenta si lo declaró con juego({ esperaListo: true })): la splash ya puede irse
  function listo() { aSplash('listo'); }

  // alEstilos(fn): lo que un juego hace en línea en su HTML y necesita sus estilos y su letra (medir, encajar un título) corre aquí
  Object.assign(nucleo, {
    version, nativa: false, alfa: false, idioma: 'es', idiomas: ['es', 'en'], desarrollo: false, carga: null,   // los pone el montaje
    elegirIdioma: i => montar().idioma.elegir(i),
    estilos: (...h) => montar().carga.estilos(...h), fuentes: (...h) => montar().carga.fuentes(...h),
    juego, idiomaSolo, listo, alCargar, alEstilos: fn => PUERTA_CARGA.alAbrir(fn),
  });
  return nucleo;
})();
const VERSION = NUCLEO.version;
// Aviso de derechos en la consola del navegador: el código del navegador se puede leer, pero no es libre; lo que vale es la licencia.
try { console.info('%cFans Of™%c © 2026 Arkioner y Pepins (MicroBlizz). Todos los derechos reservados: código, textos, personajes, dibujos y música. Licencia: ' + location.origin + location.pathname.replace(/(games|demos)\/[^/]*\/.*$/, '') + 'LICENSE · Permisos: fansofmicroblizz@gmail.com', 'font-weight:800;color:#ffb347', ''); } catch (e) { /* sin consola */ }
