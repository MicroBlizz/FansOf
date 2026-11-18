// Fans of Spy · ADAPTADORES · Los toques sobre la vista 3D y el teclado. Un toque corto avisa con el punto tocado (de 0 a 1 desde
// la esquina de arriba a la izquierda); arrastrar mueve la vista libre; con dos dedos, o con la rueda del ratón, se acerca y se
// aleja. Las teclas van en una tabla { tecla: función } que pone principal.js. No sabe nada de las reglas ni de las cartas.
// Se monta con SPY.creaToques({ lienzo, cam, activo(), alTocar(px, py), alMover(), teclas }).
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
SPY.creaToques = function ({ lienzo, cam, activo, alTocar, alMover, teclas }) {
  const C = SPY.camara, dedos = new Map(), UMBRAL = 9;   // píxeles que hay que mover el dedo para que cuente como arrastrar
  let arrastra = false, pellizco = 0;
  const separa = () => { const [a, b] = [...dedos.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };

  lienzo.addEventListener('pointerdown', (e) => {
    if (!activo()) return;
    lienzo.setPointerCapture(e.pointerId);
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    if (dedos.size === 1) arrastra = false;
    if (dedos.size === 2) { arrastra = true; pellizco = separa(); }
  });
  function pellizca(d, e) {
    d.x = e.clientX; d.y = e.clientY;
    const s = separa();
    if (pellizco > 0 && s > 0) C.acerca(cam, pellizco / s);
    pellizco = s;
  }
  lienzo.addEventListener('pointermove', (e) => {
    const d = dedos.get(e.pointerId);
    if (!d) return;
    if (dedos.size >= 2) { pellizca(d, e); return; }
    if (!arrastra && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < UMBRAL) return;
    const r = lienzo.getBoundingClientRect(), dx = e.clientX - d.x, dy = e.clientY - d.y;
    arrastra = true; d.x = e.clientX; d.y = e.clientY;
    C.arrastra(cam, dx / r.width, dy / r.height);
    alMover();
  });
  function suelta(e, cuenta) {
    const d = dedos.get(e.pointerId);
    dedos.delete(e.pointerId);
    if (!d || arrastra || dedos.size || !cuenta) return;
    const r = lienzo.getBoundingClientRect();
    alTocar((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  }
  lienzo.addEventListener('pointerup', (e) => suelta(e, true));
  lienzo.addEventListener('pointercancel', (e) => suelta(e, false));
  lienzo.addEventListener('wheel', (e) => {
    if (!activo()) return;
    e.preventDefault();
    C.acerca(cam, e.deltaY > 0 ? 1.1 : 0.9);
  }, { passive: false });
  window.addEventListener('keydown', (e) => {
    const hace = teclas[e.key];
    if (!hace || e.repeat || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;   // escribiendo en un formulario (los comentarios, la cuenta) las teclas no son del juego
    e.preventDefault();
    hace();
  });
};
