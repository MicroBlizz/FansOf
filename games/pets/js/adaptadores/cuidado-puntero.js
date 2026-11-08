// Fans Of Pets · adaptador · PUNTERO DE LOS CUIDADOS: engancha al lienzo el ratón o el dedo mientras dura un minijuego de cuidado y traduce cada
// gesto a las coordenadas del juego (540 × 960). Da baja(x, y), mueve(x, y) y sube() a quien lo pide; devuelve la función que lo suelta.
'use strict';
PT.cuidadoPuntero = (lienzo, { baja, mueve, sube }, ancho = 540, alto = 960) => {
  const punto = e => { const r = lienzo.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * ancho, (e.clientY - r.top) / r.height * alto]; };
  const ABAJO = e => { lienzo.setPointerCapture(e.pointerId); baja(...punto(e)); };
  const MUEVE = e => mueve(...punto(e));
  const ARRIBA = () => sube();
  const previo = lienzo.style.touchAction;
  lienzo.style.touchAction = 'none';   // arrastrar sobre el lienzo no desplaza la página
  lienzo.addEventListener('pointerdown', ABAJO);
  lienzo.addEventListener('pointermove', MUEVE);
  lienzo.addEventListener('pointerup', ARRIBA);
  lienzo.addEventListener('pointercancel', ARRIBA);
  return () => {
    lienzo.removeEventListener('pointerdown', ABAJO);
    lienzo.removeEventListener('pointermove', MUEVE);
    lienzo.removeEventListener('pointerup', ARRIBA);
    lienzo.removeEventListener('pointercancel', ARRIBA);
    lienzo.style.touchAction = previo;
  };
};
