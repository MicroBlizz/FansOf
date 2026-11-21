// Fans of Toys · adaptador · FONDO: el tapete que se mueve detrás de las pantallas. Una pintura que gira despacio, calculada en un
// lienzo muy pequeño (se estira con los píxeles gordos) para que no gaste batería en el móvil. Colores propios: verde tapete y naranja.
'use strict';
TY.creaFondo = lienzo => {
  const ANCHO = 54, ALTO = 96, ctx = lienzo.getContext('2d');
  lienzo.width = ANCHO; lienzo.height = ALTO;
  const imagen = ctx.createImageData(ANCHO, ALTO);
  const TONOS = [[18, 74, 68], [24, 104, 88], [38, 138, 104], [226, 122, 40], [246, 178, 62]];
  let tono = 0;   // 0 normal; sube al cerrar un trimestre y vuelve solo
  const color = v => {
    const t = Math.max(0, Math.min(.999, v)) * (TONOS.length - 1), i = Math.floor(t), f = t - i, a = TONOS[i], b = TONOS[i + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  };
  const pinta = segundos => {
    const d = imagen.data, t = segundos * .25;
    for (let y = 0; y < ALTO; y++) for (let x = 0; x < ANCHO; x++) {
      const u = (x / ANCHO - .5) * 2, v = (y / ALTO - .5) * 3.4, r = Math.hypot(u, v), giro = Math.atan2(v, u) + r * 1.6 - t;
      const onda = Math.sin(giro * 3 + Math.sin(r * 4 - t * 1.3) * 1.5) * .5 + .5;
      const c = color(onda * .62 + Math.sin(r * 5 + t) * .08 + tono * .3), i = (y * ANCHO + x) * 4;
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
    ctx.putImageData(imagen, 0, 0);
    tono *= .97;
  };
  return { pinta, celebra() { tono = 1; } };
};
