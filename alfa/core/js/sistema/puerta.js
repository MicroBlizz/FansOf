// Fans Of · PUERTA_CARGA, la puerta de carga (ADR 093): las hojas de estilo se piden sin bloquear el primer pintado, así que la splash sale
// al momento, y el código del juego espera detrás de la puerta a que hayan llegado todas las hojas y la letra (si no, sus dibujos de canvas
// se guardarían con la letra de repuesto). También dice cuándo ha CARGADO todo (la página y todo el código pedido): el load de la ventana
// ya puede llegar antes que el código del juego, así que lo que colgaba de él cuelga de alCargar. nucleo.js la escribe tras la splash y la
// usa en estilos(), fuentes() y codigo(); es tan imprescindible como nucleo.js (la splash, en cambio, es opcional).
// Sin splash (navegador automatizado), un velo tapa la página hasta que se abre. Guía: docs/guia/core/splash.md.
'use strict';
const PUERTA_CARGA = (() => {
  const LETRA_MAX_MS = 5000;   // la letra que no llega en 5 s no retiene más el juego: sale con la de repuesto (antes de esto nunca lo retenía)
  const VELO_MAX_MS = 10000;   // sin splash, el velo no tapa más de 10 s pase lo que pase (una hoja colgada no deja la página en blanco)

  // ¿se puede abrir? Cuando ya no se pedirán más hojas (cerrada: el juego ya dio su lista) y todas han llegado o fallado.
  const sePuedeAbrir = ({ pedidas, hechas, cerrada }) => !!cerrada && hechas >= pedidas;
  // ¿ha cargado todo? El load de la ventana, todo el código ya pedido (todoCodigo) y ninguno pendiente.
  const acabada = ({ ventana, todoCodigo, pendientes }) => !!ventana && !!todoCodigo && pendientes <= 0;
  // ¿hay que esperar a esta cara de letra? Solo a las que traen la letra latina básica (U+0-FF) o no dicen rango: las fuentes de Google
  // traen también cirílico, griego o devanagari, que no usamos y pesan.
  const caraLatina = rango => !rango || /(^|,)\s*U\+0+-(0*FF|10FFFF)\s*(,|$)/i.test(String(rango));
  // corre cada función de la lista, en orden; un fallo no para a las demás (sale a la consola y a errores.js)
  const corre = lista => { while (lista.length) { const fn = lista.shift(); try { fn(); } catch (e) { setTimeout(() => { throw e; }); } } };

  const estado = { pedidas: 0, hechas: 0, cerrada: false, abierta: false, letra: false };
  const fin = { ventana: false, todoCodigo: false, pendientes: 0, hecho: false };
  const esperan = [], alAcabar = [];
  let avisos = { llega() {}, falla() {}, cargada() {} }, velo = false;
  const hayDom = typeof document !== 'undefined';
  const conPreload = (() => { try { return hayDom && document.createElement('link').relList.supports('preload'); } catch (e) { return false; } })();
  const conSplash = () => typeof SPLASH !== 'undefined' && SPLASH.visible;
  const quitaVelo = () => { const v = hayDom && document.getElementById('puerta-velo'); if (v) v.remove(); };

  // una hoja, escrita en la cabecera (se llama mientras se lee la página). Con «preload» el navegador la baja sin esperarla para pintar;
  // al llegar pasa a hoja de verdad (en su sitio, así que el orden de la cascada no cambia) y avisa otra vez cuando ya se aplica.
  // Un navegador sin «preload» la recibe como siempre (bloqueando el pintado): va más lento, pero igual.
  // opcional: si no llega, el juego sigue sin ella y la splash no avisa (la fuente de Google sin red: sale la letra de repuesto)
  function hoja(href, opcional = false) {
    estado.pedidas++;
    if (!velo && !conSplash()) { document.write('<style id="puerta-velo">body{visibility:hidden!important}</style>'); velo = true; setTimeout(quitaVelo, VELO_MAX_MS); }
    const ev = 'onload="PUERTA_CARGA.carga(this)" onerror="PUERTA_CARGA.falla(this)"' + (opcional ? ' data-opcional="1"' : '');
    document.write(conPreload ? `<link rel="preload" as="style" href="${href}" ${ev}>` : `<link rel="stylesheet" href="${href}" ${ev}>`);
  }
  function carga(l) { if (l.rel === 'preload') { l.rel = 'stylesheet'; return; } hecha(); avisos.llega(); }
  function falla(l) {
    hecha();
    if (l.dataset && l.dataset.opcional) { console.error('No se ha podido cargar ' + l.href); avisos.llega(); } else avisos.falla(l.href);
  }
  function hecha() { estado.hechas++; intenta(); }

  function intenta() {
    if (estado.abierta || estado.letra || !sePuedeAbrir(estado)) return;
    estado.letra = true; letra().then(abre);
  }
  // la letra: cada cara latina declarada en las hojas ya aplicadas, con un tope. Una que falle no para el juego (sale con la de repuesto).
  // Si ninguna hoja pasó por la puerta (las páginas de la web), no hay nada que esperar.
  function letra() {
    if (!hayDom || !document.fonts || !estado.pedidas) return Promise.resolve();
    const caras = [...document.fonts].filter(c => caraLatina(c.unicodeRange)).map(c => c.load().catch(() => null));
    return Promise.race([Promise.all(caras), new Promise(r => setTimeout(r, LETRA_MAX_MS))]);
  }
  function abre() { estado.abierta = true; quitaVelo(); corre(esperan); }

  // el código: nucleo.js cuenta cada archivo que pide y que llega (o falla); con todo pedido, la puerta puede abrirse y la carga acabar
  function codigoPide() { fin.pendientes++; }
  function codigoHecho() { fin.pendientes--; mira(); }
  function todoPedido() { fin.todoCodigo = true; estado.cerrada = true; intenta(); mira(); }
  function mira() { if (fin.hecho || !acabada(fin)) return; fin.hecho = true; avisos.cargada(); corre(alAcabar); }
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('load', () => { fin.ventana = true; mira(); }, { once: true });

  return {
    hoja, carga, falla, codigoPide, codigoHecho, todoPedido,
    avisa(a) { avisos = Object.assign({ llega() {}, falla() {}, cargada() {} }, a); },   // nucleo.js: cómo avisar a la splash
    // fn corre cuando la puerta se abre (si ya está abierta, ahora mismo), en el orden en que se piden
    alAbrir(fn) { if (estado.abierta) fn(); else esperan.push(fn); },
    // fn corre cuando ha cargado todo (si ya cargó, en el siguiente turno)
    alCargar(fn) { if (fin.hecho) setTimeout(fn, 0); else alAcabar.push(fn); },
    get abierta() { return estado.abierta; },
    sePuedeAbrir, acabada, caraLatina, LETRA_MAX_MS,
  };
})();
if (typeof module !== 'undefined') module.exports = PUERTA_CARGA;
