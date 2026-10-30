// Fans Of Taxi · CONTROLES: teclado (flechas o WASD: arriba acelera; espacio o abajo frena y derrapa; mayúsculas nitro; intro acción) y
// los botones en pantalla del móvil (izquierda: girar; derecha: gas, freno y nitro). Se lee cada paso con CONTROLES.leer().
'use strict';
const CONTROLES = (() => {
  const T = TAXI.teclas, teclas = new Set(), botones = { izq: false, der: false, gas: false, freno: false, nitro: false };
  let accion = false, tactil = false;
  const tecla = lista => lista.some(k => teclas.has(k));
  window.addEventListener('keydown', e => {
    if (e.repeat || (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))) return;   // escribiendo en una caja de texto (un reporte) el juego no escucha
    teclas.add(e.code);
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
    for (const [id, n] of [['b-izq', 'izq'], ['b-der', 'der'], ['b-gas', 'gas'], ['b-freno', 'freno'], ['b-nitro', 'nitro']]) { const el = document.getElementById(id); if (el) boton(el, n); }
  }
  function leer() {
    const giro = (tecla(T.izq) || botones.izq ? 1 : 0) - (tecla(T.der) || botones.der ? 1 : 0);   // en el mundo, girar a la derecha de la pantalla es bajar el ángulo
    const freno = tecla(T.freno) || botones.freno ? 1 : 0;
    const gas = tecla(T.gas) || botones.gas ? 1 : 0;
    const r = { giro, gas, freno, nitro: tecla(T.nitro) || botones.nitro, accion };
    accion = false; return r;
  }
  const pulsaAccion = () => { accion = true; };
  return { montar, leer, pulsaAccion, get tactil() { return tactil; } };
})();
