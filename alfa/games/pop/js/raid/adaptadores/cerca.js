// Fans of Pop · RAID, pintar el tablero (adaptador de pantalla, tarea 448, nodo n4): lo que se ve por la ventana según el zoom.
// · LEJOS (menos de Z_BURBUJAS píxeles por burbuja): la imagen de puntos (PP_RAID_LEJOS) estirada.
// · CERCA: una bandeja de pop-it como las del juego (Pepins, 28-11-2026: «las bolitas no pueden estar en el aire» y «se tendrían que hundir e
//   ir formando el dibujo»). La burbuja viva es un botón del primer mundo de Pop, con su carita y su sombra (hay `caras` distintas, repartidas
//   por casilla). Al reventarla NO desaparece: se HUNDE y se queda del color que le toca del dibujo escondido, así que entre todas las hundidas
//   van formando el dibujo, como un mosaico. Solo se pintan las casillas que caben en la ventana; cada botón vivo se guarda ya reducido, con su
//   cara, en un lienzo pequeño, y el relieve de la hundida también (se repiten cientos de veces por fotograma).
// · crea({ creaLienzo, imagen, colores, caras, cara }) → { pinta(c, o), limpia() }; `imagen(k)` da el dibujo del botón de color k o null (entonces,
//   una burbuja por código); `cara(c, cx, cy, r, v)` pinta la carita número v (de 0 a caras - 1); `colores` = lista de [r, g, b].
//   Depende de PP_RAID_TABLERO, PP_RAID_CAMARA y PP_RAID_LEJOS.
'use strict';
const PP_RAID_CERCA = (() => {
  const Z_BURBUJAS = 18;   // desde aquí se pintan burbujas de verdad y se puede reventar
  const TOPE_CACHE = 160;
  const HUNDIDA = -1;      // la «burbuja» de la caché que es el relieve de una hundida
  const BANDEJA = '#ffe3f1';
  // qué carita le toca a una casilla (siempre la misma)
  const caraDe = (x, y, caras) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % caras;
  // un píxel del dibujo (entero de ImageData: alfa, azul, verde, rojo) como color de lienzo
  const colorCss = p => `rgb(${p & 255}, ${(p >> 8) & 255}, ${(p >> 16) & 255})`;

  // una burbuja por código (si el dibujo de Pop no está cargado): cuerpo, sombra abajo y brillo arriba a la izquierda
  function burbujaCodigo(c, tam, [r, g, b]) {
    const m = tam / 2, rad = tam * 0.42;
    c.fillStyle = `rgb(${Math.round(r * 0.72)}, ${Math.round(g * 0.72)}, ${Math.round(b * 0.72)})`;
    c.beginPath(); c.arc(m, m + tam * 0.03, rad, 0, Math.PI * 2); c.fill();
    c.fillStyle = `rgb(${r}, ${g}, ${b})`;
    c.beginPath(); c.arc(m, m - tam * 0.02, rad * 0.94, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255, 255, 255, 0.75)';
    c.beginPath(); c.ellipse(m - rad * 0.36, m - rad * 0.42, rad * 0.26, rad * 0.16, -0.6, 0, Math.PI * 2); c.fill();
  }
  // el relieve de una burbuja hundida (va encima de su disco de color): borde oscuro, sombra por dentro arriba y la luz al revés, abajo
  function hundida(c, tam) {
    const m = tam / 2, rad = tam * 0.43;
    const gr = c.createRadialGradient(m, m + rad * 0.35, rad * 0.35, m, m, rad);
    gr.addColorStop(0, 'rgba(90, 30, 70, 0)'); gr.addColorStop(1, 'rgba(90, 30, 70, 0.34)');
    c.fillStyle = gr; c.beginPath(); c.arc(m, m, rad, 0, Math.PI * 2); c.fill();
    c.lineWidth = Math.max(1, tam * 0.05);
    c.strokeStyle = 'rgba(90, 30, 70, 0.5)'; c.beginPath(); c.arc(m, m, rad, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(255, 255, 255, 0.45)';
    c.beginPath(); c.ellipse(m + rad * 0.3, m + rad * 0.48, rad * 0.26, rad * 0.12, -0.5, 0, Math.PI * 2); c.fill();
  }
  // la burbuja viva: su sombra en la bandeja, el botón y su carita
  function viva(c, tam, im, color, pintaCara) {
    const m = tam / 2;
    c.fillStyle = 'rgba(150, 60, 110, 0.3)';
    c.beginPath(); c.ellipse(m, m + tam * 0.36, tam * 0.36, tam * 0.11, 0, 0, Math.PI * 2); c.fill();
    if (im) c.drawImage(im, tam * 0.02, 0, tam * 0.96, tam * 0.96); else burbujaCodigo(c, tam, color);
    pintaCara(c, m, m * 0.98, tam * 0.3);
  }

  function crea({ creaLienzo, imagen, colores, caras = 1, cara = () => {} }) {
    const cache = new Map();
    // el lienzo pequeño de la burbuja de color k con la carita v (o del relieve de la hundida) a `tam` píxeles de pantalla
    function sprite(k, v, tam) {
      const clave = (k + 1) * 100000 + v * 1000 + tam;
      let s = cache.get(clave);
      if (s) return s;
      if (cache.size >= TOPE_CACHE) cache.clear();
      s = creaLienzo(tam, tam);
      const c = s.getContext('2d');
      if (k === HUNDIDA) hundida(c, tam); else viva(c, tam, imagen(k), colores[k], (cc, cx, cy, r) => cara(cc, cx, cy, r, v));
      cache.set(clave, s);
      return s;
    }
    // el trozo del lienzo de 512x512 `origen` que cae en la ventana, estirado a su sitio
    function estira(c, origen, cam, vista) {
      const [bx, by] = PP_RAID_CAMARA.aTablero(cam, vista, vista.x, vista.y);
      c.imageSmoothingEnabled = cam.z < 2;   // muy de lejos, suave; al acercar, cada burbuja un cuadradito
      c.drawImage(origen, bx, by, vista.w / cam.z, vista.h / cam.z, vista.x, vista.y, vista.w, vista.h);
    }
    function casillas(c, { cam, vista, zona, tablero, escala, dibujo }) {
      const T = PP_RAID_TABLERO, r = PP_RAID_CAMARA.visibles(cam, vista, zona);
      const tam = Math.max(4, Math.round(cam.z * escala / 2) * 2), paso = cam.z;   // de dos en dos píxeles: menos tamaños que guardar al pellizcar
      const [ox, oy] = PP_RAID_CAMARA.aPantalla(cam, vista, r.x0, r.y0), relieve = sprite(HUNDIDA, 0, tam);
      c.imageSmoothingEnabled = true;
      for (let y = r.y0; y < r.y1; y++) {
        for (let x = r.x0; x < r.x1; x++) {
          const px = ox + (x - r.x0) * paso, py = oy + (y - r.y0) * paso;
          if (T.viva(tablero, x, y)) { c.drawImage(sprite(PP_RAID_LEJOS.indiceColor(x, y, colores.length), caraDe(x, y, caras), tam), px, py, paso, paso); continue; }
          c.fillStyle = colorCss(dibujo.pixeles[y * 512 + x]);   // hundida: del color que le toca del dibujo
          c.beginPath(); c.arc(px + paso / 2, py + paso / 2, paso * 0.43, 0, Math.PI * 2); c.fill();
          c.drawImage(relieve, px, py, paso, paso);
        }
      }
    }
    // (quien llama ya ha recortado el lienzo a la bandeja) o = { cam, vista, zona, tablero, lejos (lienzo de puntos), dibujo (el dibujo escondido,
    // PP_RAID_DIBUJO: se usan sus `pixeles`), escala (píxeles reales por píxel de diseño) }
    function pinta(c, o) {
      c.save();
      c.fillStyle = BANDEJA; c.fillRect(o.vista.x, o.vista.y, o.vista.w, o.vista.h);
      if (o.cam.z < Z_BURBUJAS) estira(c, o.lejos, o.cam, o.vista); else casillas(c, o);
      c.restore();
    }
    return Object.freeze({ pinta, limpia: () => cache.clear() });
  }
  return Object.freeze({ Z_BURBUJAS, crea, caraDe });
})();
