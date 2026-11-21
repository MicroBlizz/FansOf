// Fans of Pinball · adaptador · LIENZO: los dos lienzos de MOVIL.md (apartado 3). Uno interno pequeño (la vista de la cámara, unos 206
// píxeles de ancho: 1 por unidad del mundo) donde se pinta todo a x1, y el de pantalla, en píxeles físicos, donde se copia con UN drawImage
// a escala entera. Escala = redondeo de (ancho físico ÷ 206) y el ancho interno se ajusta para llenar la pantalla (si el redondeo deja la
// vista más estrecha que la mesa, se usa la parte entera). Una pantalla alta ve más mesa, nunca se estira.
// Sin suavizado en los dos (se repite tras cada cambio de tamaño). aCss() pasa un punto lógico de la vista a píxeles CSS (para el HTML).
'use strict';
PB.creaLienzo = (lienzo, arte, mesa) => {
  const vista = PB.lienzoNuevo(1, 1);
  const pantalla = lienzo.getContext('2d', { alpha: false });
  let ctx = vista.getContext('2d'), escala = 1, dpr = 1, offX = 0;
  const yo = {
    vista, get ctx() { return ctx; }, get escala() { return escala; }, ancho: 1, alto: 1,
    // recalcula los tamaños (al arrancar y en cada resize)
    tamano() {
      dpr = window.devicePixelRatio || 1;
      const fw = Math.round(window.innerWidth * dpr), fh = Math.round(window.innerHeight * dpr);
      escala = Math.max(1, Math.round(fw / arte.anchoLienzo));
      if (fw / escala < mesa.ancho * arte.pxPorUnidad + 8) escala = Math.max(1, Math.floor(fw / arte.anchoLienzo));
      yo.ancho = Math.ceil(fw / escala); yo.alto = Math.ceil(fh / escala);
      offX = Math.floor((fw - yo.ancho * escala) / 2);
      lienzo.width = fw; lienzo.height = fh;
      vista.width = yo.ancho; vista.height = yo.alto;
      ctx = vista.getContext('2d');
      ctx.imageSmoothingEnabled = false; pantalla.imageSmoothingEnabled = false;
    },
    // copia la vista a la pantalla, a escala entera
    presenta() {
      pantalla.fillStyle = arte.colorFondo;
      pantalla.fillRect(0, 0, lienzo.width, lienzo.height);
      pantalla.drawImage(vista, 0, 0, yo.ancho, yo.alto, offX, 0, yo.ancho * escala, yo.alto * escala);
    },
    aCss: (lx, ly) => ({ x: (offX + lx * escala) / dpr, y: (ly * escala) / dpr }),
    // de píxeles CSS a lógicos de la vista (la franja de arriba, los toques…)
    deCss: (x, y) => ({ x: (x * dpr - offX) / escala, y: (y * dpr) / escala }),
    captura: q => { try { return lienzo.toDataURL('image/jpeg', q || 0.6); } catch (e) { return null; } },   // lienzo manchado (no pasa con imágenes propias): sin captura
  };
  return yo;
};
