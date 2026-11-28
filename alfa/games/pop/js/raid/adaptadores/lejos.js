// Fans of Pop · RAID, la imagen de puntos (adaptador de pantalla, tarea 448, nodo n4): el tablero entero como una imagen de 512x512, un píxel por
// burbuja. Burbuja viva = su color; reventada = el píxel del dibujo escondido; fuera de la zona de la raid = transparente. Se repinta solo lo que
// cambia (un trozo de 32x32 o una burbuja) y se vuelca al lienzo el rectángulo sucio, una vez por fotograma como mucho.
// · crea({ lienzo, dibujo, colores, zona }) → { lienzo, trozo(tablero, n), celda(tablero, x, y), todo(tablero), vuelca() }.
//   `dibujo` = Uint32Array de 512x512 (PP_RAID_DIBUJO); `colores` = lista de [r, g, b] de las burbujas. Depende de PP_RAID_TABLERO.
'use strict';
const PP_RAID_LEJOS = (() => {
  const LADO = 512, TROZO = 32;
  // el color de una burbuja según su sitio: bloques de 16x16 en diagonal, uno de cada color
  const indiceColor = (x, y, cuantos) => ((x >> 4) + (y >> 4)) % cuantos;
  // un [r, g, b] como entero de 32 bits tal y como lo guarda ImageData (alfa, azul, verde, rojo), aclarado u oscurecido
  const entero = ([r, g, b], k) => {
    const f = v => Math.max(0, Math.min(255, Math.round(v * k)));
    return (255 << 24 | f(b) << 16 | f(g) << 8 | f(r)) >>> 0;
  };

  // de [tono 0-360, saturación %, luz %] (como PP_FILAS, los colores de las burbujas de Pop) a [r, g, b]
  function hslARgb([h, s, l]) {
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    const f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
    return [f(0), f(8), f(4)];
  }

  function crea({ lienzo, dibujo, colores, zona }) {
    const T = PP_RAID_TABLERO;
    const c = lienzo.getContext('2d');
    const img = c.createImageData(LADO, LADO);
    const px = new Uint32Array(img.data.buffer);
    // dos tonos por color, en filas alternas de bloques: de lejos el mosaico tiene relieve sin hacer aguas
    const claros = colores.map(col => entero(col, 1)), oscuros = colores.map(col => entero(col, 0.94));
    let sucio = null;
    const enZona = (x, y) => x >= zona.x && y >= zona.y && x < zona.x + zona.lado && y < zona.y + zona.lado;
    const ensucia = (x0, y0, x1, y1) => {
      sucio = sucio ? { x0: Math.min(sucio.x0, x0), y0: Math.min(sucio.y0, y0), x1: Math.max(sucio.x1, x1), y1: Math.max(sucio.y1, y1) } : { x0, y0, x1, y1 };
    };
    function pon(tablero, x, y) {
      const i = y * LADO + x;
      if (!enZona(x, y)) { px[i] = 0; return; }
      if (!T.viva(tablero, x, y)) { px[i] = dibujo[i]; return; }
      const k = indiceColor(x, y, colores.length);
      px[i] = (y >> 4) & 1 ? oscuros[k] : claros[k];
    }
    function celda(tablero, x, y) { pon(tablero, x, y); ensucia(x, y, x + 1, y + 1); }
    function trozo(tablero, n) {
      const bx = (n % 16) * TROZO, by = (n >> 4) * TROZO;
      for (let y = by; y < by + TROZO; y++) for (let x = bx; x < bx + TROZO; x++) pon(tablero, x, y);
      ensucia(bx, by, bx + TROZO, by + TROZO);
    }
    function todo(tablero) { for (let n = 0; n < 256; n++) trozo(tablero, n); }
    // pasa al lienzo lo que haya cambiado desde la última vez
    function vuelca() {
      if (!sucio) return;
      c.putImageData(img, 0, 0, sucio.x0, sucio.y0, sucio.x1 - sucio.x0, sucio.y1 - sucio.y0);
      sucio = null;
    }
    return Object.freeze({ lienzo, celda, trozo, todo, vuelca });
  }
  return Object.freeze({ crea, indiceColor, hslARgb });
})();
