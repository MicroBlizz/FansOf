// Fans Of Taxi · CONTROLES: teclado (flechas o WASD, espacio o abajo frena y derrapa, mayúsculas nitro, intro acción) y los botones en
// pantalla del móvil (izquierda: girar; derecha: freno y nitro; el acelerador va solo). Se lee cada paso con CONTROLES.leer().
'use strict';
const CONTROLES = (() => {
  const T = TAXI.teclas, teclas = new Set(), botones = { izq: false, der: false, freno: false, nitro: false };
  let accion = false, tactil = false;
  const tecla = lista => lista.some(k => teclas.has(k));
  window.addEventListener('keydown', e => {
    if (e.repeat) return; teclas.add(e.code);
    if (T.accion.includes(e.code)) accion = true;
    if ([...T.izq, ...T.der, ...T.gas, ...T.freno, 'Space'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', e => teclas.delete(e.code));
  window.addEventListener('blur', () => { teclas.clear(); for (const k in botones) botones[k] = false; });
  // los botones del móvil: varios dedos a la vez, se mantienen pulsados
  function boton(el, nombre) {
    const on = e => { e.preventDefault(); botones[nombre] = true; tactil = true; el.classList.add('on'); };
    const off = e => { e.preventDefault(); botones[nombre] = false; el.classList.remove('on'); };
    el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
    el.addEventListener('contextmenu', e => e.preventDefault());
  }
  function montar() {
    for (const [id, n] of [['b-izq', 'izq'], ['b-der', 'der'], ['b-freno', 'freno'], ['b-nitro', 'nitro']]) { const el = document.getElementById(id); if (el) boton(el, n); }
  }
  function leer() {
    const giro = (tecla(T.izq) || botones.izq ? 1 : 0) - (tecla(T.der) || botones.der ? 1 : 0);   // en el mundo, girar a la derecha de la pantalla es bajar el ángulo
    const freno = tecla(T.freno) || botones.freno ? 1 : 0;
    // en el móvil el gas va solo (salvo frenando); con teclado, flecha arriba, y también solo hasta que se toque el gas por primera vez
    const gas = tecla(T.gas) ? 1 : (tactil || autoGas) && !freno ? 1 : 0;
    const r = { giro, gas, freno, nitro: tecla(T.nitro) || botones.nitro, accion };
    accion = false; return r;
  }
  let autoGas = true;   // hasta que el jugador toque el gas del teclado, el coche acelera solo (así el móvil y el PC se juegan igual al principio)
  window.addEventListener('keydown', e => { if (T.gas.includes(e.code)) autoGas = false; }, { once: true });
  const pulsaAccion = () => { accion = true; };
  return { montar, leer, pulsaAccion, get tactil() { return tactil; } };
})();
