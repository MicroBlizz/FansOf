// Fans of Soccer · Suelo del campo: se pinta una vez, visto desde arriba, en un lienzo aparte (baldosas Wang de Yoshi, franjas de
// cortacésped, borde de fuera y líneas) y cada fotograma se pone en perspectiva por tiras horizontales, como el «Mode 7».
// Así el campo sale siempre entero y no se ve el vacío detrás de las porterías. Las baldosas: img/wang-<campo>.jpg (atlas 4x4
// de herramientas/comfyui/soccer/wang.py: baldosa i = arriba bit 0, derecha bit 1, abajo bit 2, izquierda bit 3).
// Sin el atlas, el suelo sale liso con las franjas de colores de ajustes.js.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const PPM = 16;              // píxeles del lienzo por metro
  const BALDOSA = 6;           // metros que mide cada baldosa en el campo
  const LADO_ATLAS = 128;      // píxeles de cada baldosa en el atlas
  const MX = 70, MY = 6;       // metros de suelo de fuera: a los lados (detrás de las porterías) y arriba/abajo
  const TIRA = 0.12;           // metros de campo por tira al ponerlo en perspectiva
  const SU = S.suelo = { plano: null, clave: '' };

  // Azar fijo por campo: el mismo campo siempre tiene las mismas baldosas.
  function azar(semilla) { let s = semilla; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
  const semillaDe = (id) => [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 2147483646 + 1;

  // Los límites del lienzo en metros del campo.
  SU.marco = (aj) => ({ x0: -MX, x1: aj.largo + MX, y0: -MY, y1: aj.ancho + MY });

  // Las baldosas Wang: cada borde, al azar 0 o 1; la baldosa sale de sus cuatro bordes (así las vecinas encajan).
  SU.rejilla = function (cols, filas, rnd) {
    const h = Array.from({ length: filas + 1 }, () => Array.from({ length: cols }, () => (rnd() < 0.5 ? 0 : 1)));
    const v = Array.from({ length: filas }, () => Array.from({ length: cols + 1 }, () => (rnd() < 0.5 ? 0 : 1)));
    return Array.from({ length: filas }, (_, f) => Array.from({ length: cols }, (_, c) => h[f][c] | (v[f][c + 1] << 1) | (h[f + 1][c] << 2) | (v[f][c] << 3)));
  };

  function baldosas(g, atlas, m, id) {
    const cols = Math.ceil((m.x1 - m.x0) / BALDOSA), filas = Math.ceil((m.y1 - m.y0) / BALDOSA), lado = BALDOSA * PPM;
    const r = SU.rejilla(cols, filas, azar(semillaDe(id)));
    r.forEach((fila, f) => fila.forEach((i, c) => g.drawImage(atlas, (i % 4) * LADO_ATLAS, (i >> 2) * LADO_ATLAS, LADO_ATLAS, LADO_ATLAS, c * lado, f * lado, lado + 1, lado + 1)));
  }

  function franjas(g, aj, c, X, Y, conTextura) {
    for (let k = 0; k * 10 < aj.largo; k++) {
      g.fillStyle = c.franjas[k % 2]; g.globalAlpha = conTextura ? 0.3 : 1;
      g.fillRect(X(k * 10), Y(0), Math.min(10, aj.largo - k * 10) * PPM, aj.ancho * PPM);
    }
    g.globalAlpha = 1;
  }

  function lineas(g, aj, c, X, Y) {
    const m = aj.ancho / 2, A = aj.area, ag = Math.min(A.medio, m - 2), r = Math.min(9, aj.ancho / 4);
    g.strokeStyle = c.lineas; g.lineWidth = 0.22 * PPM;
    g.strokeRect(X(0), Y(0), aj.largo * PPM, aj.ancho * PPM);
    g.beginPath(); g.moveTo(X(aj.largo / 2), Y(0)); g.lineTo(X(aj.largo / 2), Y(aj.ancho)); g.stroke();
    g.beginPath(); g.arc(X(aj.largo / 2), Y(m), r * PPM, 0, 7); g.stroke();
    for (const x0 of [0, aj.largo]) {
      const d = x0 ? -1 : 1;
      g.strokeRect(Math.min(X(x0), X(x0 + d * A.largo)), Y(m - ag), A.largo * PPM, ag * 2 * PPM);
      g.strokeRect(Math.min(X(x0), X(x0 + d * 6)), Y(m - 11), 6 * PPM, 22 * PPM);
    }
  }

  // El lienzo de arriba: todo el suelo, con lo de fuera del color de suelo del campo.
  SU.pintar = function (aj, atlas) {
    const c = aj.campo, m = SU.marco(aj), lienzo = document.createElement('canvas');
    lienzo.width = Math.ceil((m.x1 - m.x0) * PPM); lienzo.height = Math.ceil((m.y1 - m.y0) * PPM);
    const g = lienzo.getContext('2d'), X = (x) => (x - m.x0) * PPM, Y = (y) => (y - m.y0) * PPM;
    if (atlas) baldosas(g, atlas, m, c.id);
    // de fuera: el color de suelo del campo (encima de las baldosas, casi tapándolas); el césped sigue 2 m pasadas las líneas
    g.fillStyle = c.suelo; g.globalAlpha = atlas ? 0.78 : 1;
    g.beginPath(); g.rect(0, 0, lienzo.width, lienzo.height); g.rect(X(-2), Y(-2), (aj.largo + 4) * PPM, (aj.ancho + 4) * PPM); g.fill('evenodd');
    g.globalAlpha = 1;
    if (!atlas) { g.fillStyle = c.franjas[0]; g.fillRect(X(-2), Y(-2), (aj.largo + 4) * PPM, (aj.ancho + 4) * PPM); }
    franjas(g, aj, c, X, Y, !!atlas);
    lineas(g, aj, c, X, Y);
    return lienzo;
  };

  // Cada fotograma: el lienzo en perspectiva, tira a tira, solo lo que cabe en pantalla (`vis`: arriba y abajo en la escena).
  SU.dibujar = function (g, e, vis) {
    const aj = e.aj, V = S.vista, atlas = V.img['wang-' + aj.campo.id], clave = aj.campo.id + ':' + aj.ancho + ':' + !!atlas;
    if (SU.clave !== clave) { SU.plano = SU.pintar(aj, atlas); SU.clave = clave; }
    const m = SU.marco(aj), P = V.P, alto = SU.plano.height;
    for (let y = m.y0; y < m.y1; y += TIRA) {
      const a = P(m.x0, y), b = P(m.x1, y + TIRA);
      if (b.y < vis.arriba || a.y > vis.abajo) continue;
      const ancho = P(m.x1, y).x - a.x, sy = (y - m.y0) * PPM;
      g.drawImage(SU.plano, 0, sy, SU.plano.width, Math.min(TIRA * PPM, alto - sy), a.x, a.y, ancho, b.y - a.y + 0.7);
    }
  };
})(SOCCER);
