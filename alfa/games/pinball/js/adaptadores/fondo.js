// Fans of Pinball · adaptador · FONDO DE LA MESA: se pinta UNA vez en un lienzo aparte (MOVIL.md, «Capas») con los dos niveles: el suelo
// de oficinas con su decoración en los márgenes (mesa-oficinas-alta arriba y mesa-oficinas-baja abajo, de 206x320 cada una), la rampa
// (su tramo repetido desde la boca hasta la fotocopiadora) y las paredes fijas, que se pintan estampando la baldosa pared.png a lo largo
// de cada segmento, píxel a píxel (un raíl con su contorno). El decorado grande que cambia (ascensor, tienda, máquinas…) lo pinta el
// pintor encima. Cada cuadro copia solo el trozo que ve la cámara. Coordenadas del fondo: x = x del mundo + margen, y = y del mundo.
'use strict';
// estampa una baldosa a lo largo de un segmento (en píxeles del lienzo), cada píxel: una pared gruesa con su borde oscuro
PB.estampaPared = (ctx, baldosa, ax, ay, bx, by) => {
  const w = baldosa.width, h = baldosa.height, n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    ctx.drawImage(baldosa, Math.round(ax + (bx - ax) * t - w / 2), Math.round(ay + (by - ay) * t - h / 2));
  }
};

PB.creaFondo = (sp, arte, mesa) => {
  const K = arte.pxPorUnidad, M = arte.margen, img = sp.img;
  const c = PB.lienzoNuevo((mesa.ancho + 2 * M) * K, mesa.alto * K), ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const lx = x => Math.round((x + M) * K), ly = y => Math.round(y * K);
  // un nivel: su dibujo desde arriba (si mide menos que el nivel, se repite hacia abajo)
  function suelo(dibujo, nivel) {
    for (let y = nivel.y0; y < nivel.y1; y += dibujo.height) ctx.drawImage(dibujo, 0, ly(y));
  }
  // la rampa: de la boca (abajo, bajo el embudo) a la fotocopiadora (arriba), su tramo repetido
  function rampa() {
    const r = mesa.rampa, [x, y1] = r.camino[0], y0 = mesa.fotocopiadora.y + mesa.fotocopiadora.alto, t = img.rampaTramo;
    for (let y = ly(y0); y < ly(y1); y += t.height) ctx.drawImage(t, lx(x) - Math.floor(t.width / 2), y);
  }
  suelo(img.mesaAlta, mesa.niveles[0]);
  suelo(img.mesaBaja, mesa.niveles[1]);
  for (const p of mesa.paredes) PB.estampaPared(ctx, img.pared, lx(p[0]), ly(p[1]), lx(p[2]), ly(p[3]));
  rampa();
  return { lienzo: c, lx, ly };
};
