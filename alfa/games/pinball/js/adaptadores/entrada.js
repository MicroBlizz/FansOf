// Fans of Pinball · adaptador · ENTRADA: los pulgares (MOVIL.md, apartado 1). Pointer Events con un mapa pointerId → lado, decidido en el
// pointerdown por la mitad de la pantalla (no cambia aunque el dedo cruce el centro). Una pala está subida mientras le quede un dedo.
// Todo suelta: pointerup, pointercancel, lostpointercapture, blur, visibilitychange y pagehide. Un toque cortísimo (pulsar y soltar en el
// mismo cuadro) da igualmente un paso «arriba»: ningún toque se pierde. La franja de arriba (marcador y pausa) no acciona palas.
// En el ordenador, flechas o Z y M por la misma puerta. El oyente solo apunta; la física lo lee en el siguiente paso con lee().
'use strict';
PB.creaEntrada = (caja, opciones) => {
  const dedos = new Map(), teclas = { izquierda: 0, derecha: 0 }, pendiente = { izquierda: false, derecha: false };
  const salida = { izquierda: false, derecha: false };
  const TECLAS = { ArrowLeft: 'izquierda', z: 'izquierda', Z: 'izquierda', ArrowRight: 'derecha', m: 'derecha', M: 'derecha' };
  let activa = false, ultimoToque = 0;
  const cuenta = lado => { let n = teclas[lado]; for (const l of dedos.values()) if (l === lado) n++; return n; };
  function baja(lado, ms) { pendiente[lado] = true; ultimoToque = ms; if (opciones.alTocar) opciones.alTocar(lado); }
  function abajo(e) {
    if (!activa || e.target.closest('button, .pb-ventana, .pb-toca')) return;
    if (e.clientY < opciones.franja()) return;
    const lado = e.clientX < window.innerWidth / 2 ? 'izquierda' : 'derecha';
    dedos.set(e.pointerId, lado);
    try { caja.setPointerCapture(e.pointerId); } catch (err) { /* el puntero ya se fue: no hay nada que capturar */ }
    e.preventDefault();
    baja(lado, e.timeStamp);
  }
  const suelta = e => { dedos.delete(e.pointerId); };
  function sueltaTodo() { dedos.clear(); teclas.izquierda = 0; teclas.derecha = 0; }
  caja.addEventListener('pointerdown', abajo);
  for (const fin of ['pointerup', 'pointercancel', 'lostpointercapture']) caja.addEventListener(fin, suelta);
  caja.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('blur', sueltaTodo);
  window.addEventListener('pagehide', sueltaTodo);
  document.addEventListener('visibilitychange', () => { if (document.hidden) sueltaTodo(); });
  window.addEventListener('keydown', e => {
    const lado = TECLAS[e.key];
    if (!lado || !activa || e.repeat) return;
    teclas[lado] = 1; baja(lado, e.timeStamp);
  });
  window.addEventListener('keyup', e => { const lado = TECLAS[e.key]; if (lado) teclas[lado] = 0; });
  return {
    // lo que pide la física en cada paso (el mismo objeto, rellenado: sin basura)
    lee() {
      salida.izquierda = activa && (cuenta('izquierda') > 0 || pendiente.izquierda);
      salida.derecha = activa && (cuenta('derecha') > 0 || pendiente.derecha);
      pendiente.izquierda = false; pendiente.derecha = false;
      return salida;
    },
    activa(si) { activa = Boolean(si); if (!activa) sueltaTodo(); },
    sueltaTodo,
    get ultimoToque() { return ultimoToque; },   // timeStamp del último toque (latencia en el panel DEV)
  };
};
