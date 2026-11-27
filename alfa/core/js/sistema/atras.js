// Fans Of · ATRÁS: el botón atrás del móvil (o del navegador) le pregunta al juego qué hacer, en vez de sacarte de él (tarea 446, ADR 242).
// Solo hace algo si el juego se engancha con hook('atras', fn): fn decide (cerrar una ventana, abrir la pausa, volver una pantalla o
// preguntar si salir) y, si la persona quiere salir de verdad, el juego llama a ATRAS.sal(). Un juego que no se engancha sigue igual que antes.
// Con una ventana común de core abierta (la confirmación, la pregunta para adultos, los comentarios) atrás no hace nada: no se acepta nada por ti.
// En el navegador: tras un toque se pone una entrada de más en el historial (sin un toque, el navegador se la salta); atrás la gasta, se
// avisa al juego y se vuelve a poner. En la app de Android: se escucha el backButton de Capacitor desde que carga, y salir cierra la app.
// ATRAS.crear(d) es la lógica sin página (para los tests); el final de este archivo la conecta con la página.
'use strict';
const ATRAS = (() => {
  const MARCA = 'fansof-atras';
  // d: { hay() → ¿hay juego enganchado?, avisa() → se lo dice al juego, comun() → ¿ventana común de core abierta?, nativa() → ¿app de Android?,
  //      escuchaApp(fn) → backButton, ponEntrada(marca), largo() → entradas del historial, retrocede(n), cierraApp(), irA(url), raiz() → portada de la web }
  function crear(d) {
    let armado = false, saliendo = false;
    const pide = () => { if (!saliendo && !d.comun()) d.avisa(); };
    // armar: en la app, en cuanto carga; en el navegador, con un toque (sin él, el navegador se salta la entrada nueva al ir atrás)
    function arma() {
      if (armado || !d.hay()) return false;
      armado = true;
      if (d.nativa()) d.escuchaApp(pide);
      else d.ponEntrada(MARCA);
      return true;
    }
    // atrás en el navegador ya gastó nuestra entrada: se repone, para el siguiente atrás, y se le dice al juego
    function alVolver() {
      if (!armado || saliendo || d.nativa()) return false;
      d.ponEntrada(MARCA);
      pide();
      return true;
    }
    // salir del juego de verdad: la app se cierra; en el navegador, a la página de antes de entrar o, si no la hay, a la portada de la web
    function sal() {
      if (saliendo) return;
      saliendo = true;
      if (d.nativa()) { d.cierraApp(); return; }
      const pasos = armado ? 2 : 1;
      if (d.largo() > pasos) d.retrocede(pasos); else d.irA(d.raiz());
    }
    // la página vuelve de la caché del navegador (adelante tras salir): todo como al cargar, y el siguiente toque la arma de nuevo
    function vuelve() { saliendo = false; if (!d.nativa()) armado = false; }
    return { arma, alVolver, sal, vuelve, armado: () => armado };
  }
  // la portada de la web (o de la alfa) para una dirección de un juego: lo que va antes de /games/
  const raizDe = ruta => { const i = ruta.indexOf('/games/'); return i < 0 ? '/' : ruta.slice(0, i + 1); };
  return { crear, raizDe, MARCA };
})();

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  (() => {
    const app = () => { const C = window.Capacitor; return C && typeof C.isNativePlatform === 'function' && C.isNativePlatform() ? C.Plugins && C.Plugins.App : null; };
    const a = ATRAS.crear({
      hay: () => typeof HOOKS !== 'undefined' && !!(HOOKS.atras && HOOKS.atras.length),
      avisa: () => fire('atras'),
      comun: () => !!document.querySelector('.screen.modal:not([hidden]), #fb-fondo:not([hidden])'),
      nativa: () => !!app(),
      escuchaApp: fn => app().addListener('backButton', fn),
      ponEntrada: marca => history.pushState({ [marca]: true }, ''),
      largo: () => history.length,
      retrocede: n => history.go(-n),
      cierraApp: () => app().exitApp(),
      irA: url => location.assign(url),
      raiz: () => ATRAS.raizDe(location.pathname),
    });
    // pointerup y keydown cuentan como gesto también con el dedo (pointerdown solo con ratón)
    for (const ev of ['pointerup', 'keydown']) window.addEventListener(ev, a.arma, true);
    window.addEventListener('load', () => { if (app()) a.arma(); });
    window.addEventListener('popstate', a.alVolver);
    window.addEventListener('pageshow', e => { if (e.persisted) a.vuelve(); });
    ATRAS.sal = a.sal;
  })();
}
if (typeof module !== 'undefined') module.exports = ATRAS;
