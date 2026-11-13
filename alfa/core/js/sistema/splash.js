// Fans Of · SPLASH: la pantalla de carga de los juegos, con el logo FOG (Fans Of Games) y una barra de progreso real. nucleo.js la pide lo
// primero, así que tapa la página desde el primer pintado; se va cuando ha cargado todo (lo dice nucleo.js) y, si el juego lo declaró, su NUCLEO.listo(). No se
// salta. Si algo falla al cargar lo dice ella, con un botón para reintentar. La intro de cada juego arranca en SPLASH.alIrse(fn).
// Reglas (puras): splash-reglas.js. Dibujo del logo: splash-logo.js. Guía: docs/guia/core/splash.md. ADR 091 (antes 051).
'use strict';
const SPLASH = (() => {
  const R = SPLASH_REGLAS;
  const estado = { pedidos: 0, llegados: 0, todoPedido: false, cargada: false, listo: false, esperaListo: false, error: false, archivo: '' };
  const alIrseFns = [];
  let caja = null, estilo = null, relleno = null, avisoEl = null, ido = false, dibujado = 0, porciento = -1;
  const T = s => (typeof tr === 'function' ? tr(s) : s);   // el idioma puede no haber llegado todavía (o ser lo que ha fallado): entonces, en español
  const AVISOS = { error: 'No se ha podido cargar', 'sin-red': 'Sin conexión. Comprueba la red y reintenta', tarda: 'Está tardando más de lo normal' };
  const CSS = `#fog-splash{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px;box-sizing:border-box;background:radial-gradient(120% 80% at 50% 40%,#3e2363 0%,#150b21 70%);transition:opacity .25s;font:800 15px/1.3 'Arial Black',Arial,sans-serif;color:#fff;text-align:center}
#fog-splash.fog-fuera{opacity:0;pointer-events:none}
#fog-splash .fog-logo{width:min(70vw,52vh,320px);height:auto}
#fog-splash .fog-icono{opacity:0;transform-box:fill-box;transform-origin:center;animation:fog-rebote .5s ease-out forwards}
#fog-splash .fog-nombre{opacity:0;animation:fog-entra .3s .4s ease-out forwards}
#fog-splash .fog-barra{width:min(62vw,280px);height:16px;border:4px solid #20102c;border-radius:12px;background:#2a1640;box-shadow:0 0 0 2px #ffd21f55;overflow:hidden}
#fog-splash .fog-relleno{height:100%;background:linear-gradient(#ffe36b,#ffd21f 55%,#e8a800);transform-origin:left center;transform:scaleX(0)}
#fog-splash.fog-parada .fog-relleno{background:#9a8aa8}
#fog-splash .fog-aviso{min-height:1.3em;margin:0;max-width:320px}
#fog-splash .fog-archivo{margin:0;font:600 11px/1.3 ui-monospace,Menlo,Consolas,monospace;opacity:.6;max-width:320px;word-break:break-all}
#fog-splash .fog-reintentar{font:900 16px/1 'Arial Black',Arial,sans-serif;color:#20102c;background:#ffd21f;border:4px solid #20102c;border-radius:12px;padding:10px 18px;box-shadow:0 4px 0 #20102c;cursor:pointer}
#fog-splash .fog-reintentar:active{transform:translateY(3px);box-shadow:0 1px 0 #20102c}
@keyframes fog-entra{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes fog-rebote{0%{opacity:0;transform:scale(.3) rotate(-12deg)}60%{opacity:1;transform:scale(1.08) rotate(3deg)}100%{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){#fog-splash *{animation:none!important;opacity:1!important}#fog-splash{transition:none}}`;

  const movimiento = typeof window !== 'undefined' && window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  const quieto = () => !!(movimiento && movimiento.matches);
  // los errores que no son del juego no paran la carga: los de otro origen llegan sin datos («Script error.») y el de ResizeObserver es un aviso del navegador
  const AJENOS = /^(Script error\.?|ResizeObserver loop)/;

  function monta() {
    estilo = document.createElement('style'); estilo.textContent = CSS;
    caja = document.createElement('div'); caja.id = 'fog-splash'; caja.setAttribute('role', 'progressbar'); caja.setAttribute('aria-label', 'Fans Of Games');
    caja.setAttribute('aria-valuemin', '0'); caja.setAttribute('aria-valuemax', '100');
    caja.innerHTML = SPLASH_LOGO() + '<div class="fog-barra"><div class="fog-relleno"></div></div><p class="fog-aviso" aria-live="polite"></p><p class="fog-archivo"></p>';
    document.documentElement.append(estilo, caja);
    relleno = caja.querySelector('.fog-relleno'); avisoEl = caja.querySelector('.fog-aviso');
  }

  // el aviso bajo la barra y, si hace falta, el botón de reintentar (recarga la página)
  function pintaAviso(clave) {
    const texto = clave ? T(AVISOS[clave]) : '';   // se compara el texto ya traducido: si el idioma llega después, se vuelve a pintar
    if (avisoEl.textContent === texto && avisoEl.dataset.clave === (clave || '')) return;
    avisoEl.dataset.clave = clave || ''; avisoEl.textContent = texto;
    caja.querySelector('.fog-archivo').textContent = clave === 'error' || clave === 'sin-red' ? estado.archivo : '';
    let b = caja.querySelector('.fog-reintentar');
    if (clave && !b) { b = document.createElement('button'); b.type = 'button'; b.className = 'fog-reintentar'; b.addEventListener('click', () => location.reload()); caja.appendChild(b); }
    if (b) { b.textContent = T('Reintentar'); b.hidden = !clave; }
    caja.classList.toggle('fog-parada', !!estado.error);
  }

  function vete() {
    ido = true; caja.classList.add('fog-fuera');
    setTimeout(() => { caja.remove(); estilo.remove(); }, quieto() ? 0 : 300);
    corre();
  }
  // otra pantalla ocupa la página en lugar del juego (la puerta «Solo probadores» de la alfa): la splash se quita sin arrancar el juego,
  // y lo que falle después en el código del juego ya no es un fallo de carga que avisar
  let retirada = false;
  function retira() {
    if (ido) return;
    ido = true; retirada = true; alIrseFns.length = 0;
    window.removeEventListener('error', alFallarCodigo);
    caja.remove(); estilo.remove();
  }
  function corre() { while (alIrseFns.length) { const fn = alIrseFns.shift(); try { fn(); } catch (e) { setTimeout(() => { throw e; }); } } }   // un fallo del juego no para a los demás: sale a la consola y a errores.js

  // cada cuadro: la barra persigue lo real (y entre señales se arrastra), el aviso según el tiempo o el error, y se va cuando toca
  function cuadro(t0, antes) {
    return ahora => {
      if (ido) return;
      const real = R.real(estado), dt = Math.min(0.1, (ahora - antes) / 1000);
      dibujado = R.avanza(dibujado, { real, tope: R.tope(estado), dt, quieto: quieto(), parado: estado.error });
      pintaBarra();
      pintaAviso(R.aviso({ ms: ahora - t0, error: estado.error, enLinea: navigator.onLine }));
      if (R.seVa(estado) && dibujado >= 1) vete(); else requestAnimationFrame(cuadro(t0, ahora));
    };
  }

  function pintaBarra() {
    relleno.style.transform = 'scaleX(' + dibujado.toFixed(4) + ')';
    const p = Math.round(dibujado * 100); if (p !== porciento) { porciento = p; caja.setAttribute('aria-valuenow', String(p)); }
  }

  // un error al ejecutar el código del juego mientras carga también para la carga (un archivo que no llega lo avisa nucleo.js con falla)
  function alFallarCodigo(ev) {
    if (ido || !ev || !ev.message || AJENOS.test(ev.message)) return;
    falla(((ev.filename || '').split('/').pop() || '?') + ':' + (ev.lineno || 0) + ' · ' + ev.message);
  }
  function falla(archivo) { if (ido) return; estado.error = true; if (!estado.archivo) estado.archivo = String(archivo || '').split('?')[0].split('/').slice(-2).join('/'); }

  function inicia() {
    const enJuego = R.enJuego(location.pathname);
    const forzada = /[?&]splash=1\b/.test(location.search);
    if (!enJuego || !R.sale({ automatizado: !!navigator.webdriver, forzada })) { ido = true; return; }
    monta();
    window.addEventListener('error', alFallarCodigo);
    const t0 = performance.now(); requestAnimationFrame(cuadro(t0, t0));
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') inicia();
  return {
    get visible() { return !ido; },
    pide() { estado.pedidos++; }, llega() { estado.llegados++; }, falla, todoPedido() { estado.todoPedido = true; },
    esperaListo() { estado.esperaListo = true; }, listo() { estado.listo = true; },
    cargada() { estado.cargada = true; },   // nucleo.js: la página y todo su código han cargado (el load solo ya no basta, ADR 093)
    // fn corre cuando la splash se va (si ya se fue o no salió, ahora mismo): aquí arranca la intro de cada juego
    alIrse(fn) { if (retirada) return; if (ido) fn(); else alIrseFns.push(fn); },   // retirada: el juego ya no arranca
    retira,
  };
})();
if (typeof module !== 'undefined') module.exports = SPLASH;
