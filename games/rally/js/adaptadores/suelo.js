// Fans of Rally · adaptador · SUELO: pinta una vez el suelo de un tramo (lo de fuera, el arcén y la carretera con el color de cada
// suelo) ya aplastado por la cámara inclinada: cada píxel de este lienzo es un píxel de la pantalla, así que se ve nítido al moverse.
// Después pasa cada píxel al color más cercano de su paleta (sin bordes difuminados) y le echa grano. Las marcas de las ruedas
// se pintan encima durante la carrera con marca().
'use strict';
RA.Suelo = (() => {
  const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  function trazo(g, pista, desde, hasta) {
    g.beginPath();
    for (let k = desde; k <= hasta; k++) { const i = k % pista.n; if (k === desde) g.moveTo(pista.x[i], pista.y[i]); else g.lineTo(pista.x[i], pista.y[i]); }
  }
  // trozos seguidos con el mismo suelo: [desde, hasta, suelo]
  function trozos(pista) {
    const out = [];
    let desde = 0;
    for (let i = 1; i <= pista.n; i++) if (i === pista.n || pista.suelo[i] !== pista.suelo[desde]) { out.push([desde, i, pista.suelo[desde]]); desde = i; }
    return out;
  }
  function dibujaCarretera(g, pista, paisaje) {
    g.lineJoin = 'round'; g.lineCap = 'round';
    trazo(g, pista, 0, pista.n); g.closePath(); g.lineWidth = pista.ancho + 14; g.strokeStyle = paisaje.borde; g.stroke();
    for (const [a, b, suelo] of trozos(pista)) { trazo(g, pista, a, b + 1); g.lineWidth = pista.ancho; g.strokeStyle = RA.COLOR_SUELO[suelo][0]; g.stroke(); }
  }
  function lineaDeMeta(g, pista) {
    const a = pista.ang[0] + Math.PI / 2, mitad = pista.ancho / 2;
    for (let k = -mitad; k < mitad; k += 4) for (let f = 0; f < 2; f++) {
      g.fillStyle = (Math.floor((k + mitad) / 4) + f) % 2 ? '#10141c' : '#f2f5ff';
      const x = pista.x[0] + Math.cos(a) * k + Math.cos(pista.ang[0]) * f * 4, y = pista.y[0] + Math.sin(a) * k + Math.sin(pista.ang[0]) * f * 4;
      g.fillRect(x - 2, y - 2, 4, 4);
    }
  }
  // cada color base y sus dos variantes para el grano: [base, claro, oscuro]
  function paleta(paisaje) {
    const p = [[paisaje.fuera, paisaje.fuera3, paisaje.fuera2, 0.16], [paisaje.borde, paisaje.borde, paisaje.fuera2, 0.1], ['#10141c', '#10141c', '#10141c', 0], ['#f2f5ff', '#f2f5ff', '#f2f5ff', 0]];
    for (const s of Object.values(RA.COLOR_SUELO)) p.push([s[0], s[1], s[2], 0.09]);
    return p.map(([b, c, o, grano]) => ({ b: rgb(b), c: rgb(c), o: rgb(o), grano }));
  }
  function cercano(pal, r, g, b) {
    let mejor = pal[0], dm = Infinity;
    for (const c of pal) { const d = (r - c.b[0]) ** 2 + (g - c.b[1]) ** 2 + (b - c.b[2]) ** 2; if (d < dm) { dm = d; mejor = c; } }
    return mejor;
  }
  function limpia(g, an, al, paisaje) {
    const img = g.getImageData(0, 0, an, al), d = img.data, pal = paleta(paisaje), dado = RA.Paisaje.azar(99);
    for (let i = 0; i < d.length; i += 4) {
      const c = cercano(pal, d[i], d[i + 1], d[i + 2]), n = dado(), col = n < c.grano ? c.c : n < c.grano * 2 ? c.o : c.b;
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  // pista y tramo del dominio; limites [x0, y0, x1, y1]; K: lo que aplasta la cámara
  function crea(pista, tramo, limites, K) {
    const [x0, y0, x1, y1] = limites, an = Math.ceil(x1 - x0), al = Math.ceil((y1 - y0) * K);
    const cv = document.createElement('canvas'); cv.width = an; cv.height = al;
    const g = cv.getContext('2d');
    g.fillStyle = tramo.paisaje.fuera; g.fillRect(0, 0, an, al);
    g.setTransform(1, 0, 0, K, -x0, -y0 * K);
    dibujaCarretera(g, pista, tramo.paisaje);
    lineaDeMeta(g, pista);
    g.setTransform(1, 0, 0, 1, 0, 0);
    limpia(g, an, al, tramo.paisaje);
    return { cv, g, x0, y0, K };
  }
  // una marca de rueda (derrape) en el punto del mundo (x, y)
  function marca(s, x, y, color) { s.g.fillStyle = color; s.g.fillRect(Math.round(x - s.x0), Math.round((y - s.y0) * s.K), 1, 1); }
  return { crea, marca };
})();
