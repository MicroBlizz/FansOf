// Tiny Fans · adaptador · ENTRADA: el joystick de un dedo, que nace donde se apoya el pulgar (y las flechas o WASD en un ordenador).
// Solo da un vector de pantalla; quien lo pasa a los ejes del mundo es la vista (aSuelo) y lo hace principal.js. Un toque sobre un botón
// de la interfaz no mueve al becario.
'use strict';
TN.creaEntrada = (capa, reglas) => {
  const R = reglas.entrada, caja = capa.parentElement, teclas = new Set();
  const base = TN.crea('div', { className: 'tn-joy' }), pomo = TN.crea('div', { className: 'tn-joy-pomo' });
  base.append(pomo); base.hidden = true; caja.append(base);
  let activo = false, dedo = null, ox = 0, oy = 0, vx = 0, vy = 0;
  const suelta = () => { dedo = null; vx = vy = 0; base.hidden = true; };
  function mueve(e) {
    const dx = e.clientX - ox, dy = e.clientY - oy, d = Math.hypot(dx, dy) || 1, largo = Math.min(1, d / R.radio);
    pomo.style.transform = `translate(${dx / d * largo * R.radio}px, ${dy / d * largo * R.radio}px)`;
    const util = largo <= R.zonaMuerta ? 0 : (largo - R.zonaMuerta) / (1 - R.zonaMuerta);
    vx = dx / d * util; vy = -dy / d * util;
  }
  caja.addEventListener('pointerdown', e => {
    if (!activo || dedo !== null || e.target.closest('button, .tn-ventana, .tn-toca')) return;
    const r = caja.getBoundingClientRect();
    dedo = e.pointerId; ox = e.clientX; oy = e.clientY;
    base.style.left = (ox - r.left) + 'px'; base.style.top = (oy - r.top) + 'px'; pomo.style.transform = ''; base.hidden = false;
  });
  window.addEventListener('pointermove', e => { if (e.pointerId === dedo) mueve(e); });
  for (const fin of ['pointerup', 'pointercancel']) window.addEventListener(fin, e => { if (e.pointerId === dedo) suelta(); });
  window.addEventListener('blur', () => { suelta(); teclas.clear(); });
  const TECLAS = { ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0], ArrowUp: [0, 1], w: [0, 1], ArrowDown: [0, -1], s: [0, -1] };
  window.addEventListener('keydown', e => { if (TECLAS[e.key]) teclas.add(e.key); });
  window.addEventListener('keyup', e => teclas.delete(e.key));
  function teclado() {
    let x = 0, y = 0;
    for (const k of teclas) { x += TECLAS[k][0]; y += TECLAS[k][1]; }
    const d = Math.hypot(x, y);
    return d ? { x: x / d, y: y / d } : null;
  }
  return {
    vector() { return activo ? (dedo !== null ? { x: vx, y: vy } : teclado() || { x: 0, y: 0 }) : { x: 0, y: 0 }; },
    activa(si) { activo = !!si; if (!activo) suelta(); },
    // para las pruebas: suelta el dedo que hubiera
    suelta,
  };
};
