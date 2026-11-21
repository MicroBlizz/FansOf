// Fans of Asalto · ADAPTADORES · Las medidas del lienzo según la pantalla. El juego se pinta en un lienzo pequeño, en vertical (de 480 a
// 600 de ancho y de 900 a 1300 de alto), que se amplía hasta llenar la pantalla. Si se puede, un número ENTERO de veces: cada píxel
// del dibujo es un cuadrado exacto de píxeles de la pantalla, lo más nítido. Si así no la llena (ventanas bajas de ordenador, móviles
// pequeños con la barra del navegador), se elige el lienzo con la forma de la pantalla y se amplía con decimales. Puro: solo números.
'use strict';
AS.medidas = (() => {
  const MIN = { w: 480, h: 900 }, MAX = { w: 600, h: 1300 }, COMODO = 960, LLENA = 0.86;
  const entre = (v, a, b) => Math.max(a, Math.min(b, v));
  // con zoom entero: el mayor con el que cabe el lienzo mínimo, y solo si además llena la pantalla a lo ancho o a lo alto
  function entero(pw, ph) {
    for (let k = 8; k >= 1; k--) {
      const W = Math.floor(pw / k), H = Math.floor(ph / k);
      if (W < MIN.w || H < MIN.h) continue;
      const w = Math.min(W, MAX.w), h = Math.min(H, MAX.h);
      return w * k >= pw * LLENA || h * k >= ph * LLENA ? { k, W: w, H: h, entero: true } : null;
    }
    return null;
  }
  // con decimales: el lienzo con la forma de la pantalla (dentro de sus límites y con un alto cómodo), ampliado hasta tocar un borde
  function ajustado(pw, ph) {
    const forma = ph / pw;
    let W = 540, H = Math.round(W * forma);
    if (H < COMODO) { H = COMODO; W = entre(Math.round(H / forma), MIN.w, MAX.w); }
    H = Math.min(H, MAX.h);
    return { k: Math.min(pw / W, ph / H), W, H, entero: false };
  }
  // en el móvil en vertical (tarea #133): lienzo de 600 de ancho, con la forma de la pantalla, ampliado con decimales hasta llenarla de
  // lado a lado. Con el zoom entero salía un lienzo de 480 (x3) y todo se veía muy junto; así se ve igual en la app y en Chrome
  const VERTICAL = 1.4;
  function movil(pw, ph) {
    const W = MAX.w, H = entre(Math.round(W * ph / pw), MIN.h, MAX.h);
    return { k: Math.min(pw / W, ph / H), W, H, entero: false };
  }
  // pw, ph: los píxeles reales de la pantalla. Devuelve { k: el zoom, W, H: el lienzo pequeño, entero: si el zoom es entero }
  return (pw, ph) => (ph / pw >= VERTICAL ? movil(pw, ph) : entero(pw, ph) || ajustado(pw, ph));
})();
