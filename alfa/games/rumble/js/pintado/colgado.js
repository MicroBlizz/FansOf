// Fans of Rumble · Arte pintado (ADR 084): el «colgado», la unidad mientras arrastras su carta al campo (idea de Daniel,
// 7-11-2026). Cuelga de unas pinzas invisibles un poco por encima del sitio donde caerá, de cara, pataleando o de brazos
// cruzados, en bucle de ida y vuelta (hojas de img/pintado/colgado/, datos en colgado-datos.js, de colgado_hoja.py).
// Sustituye a drawGhostUnit (07d-particulas.js) solo con PINTADO.activo() y si ese personaje tiene hoja; si no, como siempre.
'use strict';
(() => {
  const HOJA = {};      // clave -> Image de la hoja
  const FPS = 8;        // fotogramas por segundo del bucle
  const ALZA = 14;      // píxeles del juego que cuelga por encima del suelo

  // columna de la hoja a los t segundos: ida y vuelta (0..n-1..1), para que no salte al volver a empezar
  function columna(t, n) {
    const ciclo = Math.max(1, 2 * n - 2), i = Math.floor(t * FPS) % ciclo;
    return i < n ? i : ciclo - i;
  }

  const drawGhostUnitOriginal = drawGhostUnit;
  drawGhostUnit = function (key, x, y) {
    const D = V2_COLGADO[key], im = HOJA[key];
    if (!D || !im || !PINTADO.activo() || !BOX[key]) return drawGhostUnitOriginal(key, x, y);
    const sc = (BOX[key][3] + 3) / D.alto * (PINTADO.tamano[key] || 1);   // el mismo tamaño que en el campo (animar.js)
    const [cw, ch] = D.celda, [px, py] = D.pies;
    ctx.drawImage(im, columna(G.t, D.n) * cw, 0, cw, ch, x - px * sc, y - ALZA - py * sc, cw * sc, ch * sc);
  };

  // las hojas se bajan solo cuando el arte pintado está encendido (y una sola vez)
  let bajando = false;
  function bajaHojas() {
    if (bajando || !PINTADO.activo()) return;
    bajando = true;
    const ver = '?v=' + encodeURIComponent(NUCLEO.version || '0');
    for (const key in V2_COLGADO) {
      const im = new Image();
      im.onload = () => { HOJA[key] = im; };
      im.src = PINTADO.ruta() + 'colgado/' + key + '.webp' + ver;
    }
  }
  bajaHojas();
  NUCLEO.alCambiarFlags(bajaHojas);
})();
