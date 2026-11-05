// Fans Of · SPLASH: la pantalla de inicio común con el logo FOG (Fans Of Games). Sale al abrir la app o la web, dura lo que tarde la carga
// (con un mínimo para que se vea el logo) y un toque la salta. Va tras el flag «splash-fog». Las reglas (cuándo sale, cuánto espera) son
// funciones puras en SPLASH.reglas; el resto solo pinta. El dibujo está en splash-logo.js. Guía: docs/guia/core/splash.md. ADR 051.
// Pruebas: tests/core/splash.test.mjs.
'use strict';
const SPLASH = (() => {
  const MIN_MS = 800, CLAVE = 'fansof-splash-vista';
  const reglas = {
    MIN_MS,
    // ¿sale la splash? `forzada` (?splash=1) la saca siempre; un navegador automatizado (el comparador, las pruebas) no la ve salvo forzada
    sale({ flag, vista, automatizado, forzada }) { return !!forzada || (!!flag && !vista && !automatizado); },
    // los ms que faltan para poder quitarla: el mínimo menos lo que ya lleva puesta
    espera(inicio, ahora) { return Math.max(0, MIN_MS - (ahora - inicio)); },
  };
  const CSS = `#fog-splash{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:radial-gradient(120% 80% at 50% 40%,#3e2363 0%,#150b21 70%);transition:opacity .25s;touch-action:manipulation}
#fog-splash.fog-fuera{opacity:0;pointer-events:none}
#fog-splash .fog-logo{width:min(70vw,60vh,340px);height:auto}
#fog-splash .fog-icono{opacity:0;transform-box:fill-box;transform-origin:center;animation:fog-rebote .5s ease-out forwards}
#fog-splash .fog-nombre{opacity:0;animation:fog-entra .3s .4s ease-out forwards}
@keyframes fog-entra{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes fog-rebote{0%{opacity:0;transform:scale(.3) rotate(-12deg)}60%{opacity:1;transform:scale(1.08) rotate(3deg)}100%{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){#fog-splash *{animation:none!important;opacity:1!important}}`;
  function lee() { try { return sessionStorage.getItem(CLAVE); } catch (e) { return null; } }
  function apunta() { try { sessionStorage.setItem(CLAVE, '1'); } catch (e) { /* sin guardar: saldrá otra vez */ } }
  function muestra() {
    const estilo = document.createElement('style'); estilo.textContent = CSS;
    const caja = document.createElement('div'); caja.id = 'fog-splash'; caja.innerHTML = SPLASH_LOGO();
    const raiz = document.documentElement; raiz.append(estilo, caja);
    const inicio = Date.now(); let cerrada = false;
    const quita = () => { if (cerrada) return; cerrada = true; caja.classList.add('fog-fuera'); setTimeout(() => { caja.remove(); estilo.remove(); }, 300); };
    const cuandoCargue = () => setTimeout(quita, reglas.espera(inicio, Date.now()));
    caja.addEventListener('click', quita);
    if (document.readyState === 'complete') cuandoCargue(); else window.addEventListener('load', cuandoCargue, { once: true });
    setTimeout(quita, 8000);   // por si la carga no termina: nunca deja al jugador tapado
    apunta();
  }
  function inicia() {
    const forzada = /[?&]splash=1\b/.test(location.search);
    const flag = typeof NUCLEO !== 'undefined' && typeof NUCLEO.flag === 'function' && NUCLEO.flag('splash-fog', 'Splash FOG (pantalla de inicio con el logo de la empresa) al abrir la app o la web', false);
    if (reglas.sale({ flag, vista: lee(), automatizado: !!navigator.webdriver, forzada })) muestra();
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined') inicia();
  return { reglas };
})();
if (typeof module !== 'undefined') module.exports = SPLASH;
