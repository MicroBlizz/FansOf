// Fans of Basement · El aspecto del becario (solo pantalla): junta en un lienzo el dibujo del becario (img/becario.png) con las capas
// de lo que llevas (aspecto-capas.js): detrás, la silla, la mochila y el teclado; delante, el traje del cargo, el arma en la mano,
// el termo o la cafetera en lugar del vaso, los auriculares, las gafas, los pósits y la corona. Qué capas tocan lo dice
// BAS.aspectoDe (progreso.js). Cada combinación se pinta una vez y se guarda; luego se escala sin suavizar.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, CAPA = B.capasAspecto, CONTORNO = '#161616';
  const L = { w: 80, h: 80, ox: 22, oy: 12 };   // el lienzo y dónde va la esquina del becario
  const MEDIO = { x: L.ox + 28, y: L.oy + 32 };   // el centro del becario dentro del lienzo
  const VASO = [44, 24, 12, 18];                    // lo que se borra del dibujo cuando el vaso se cambia por otra cosa

  // Los iconos de las armas que no tienen dibujo propio: el mismo dibujo que llevan en la mano.
  for (const id of Object.keys(B.manoArma)) B.registraDibujo('arma-' + id, { pal: B.manoArma[id].pal, filas: B.manoArma[id].filas });

  // Una pieza, píxel a píxel, con el contorno oscuro de la serie alrededor.
  function pieza(g, c) {
    const lleno = new Map();
    c.filas.forEach((f, j) => { for (let i = 0; i < f.length; i++) if (c.pal[f[i]]) lleno.set((L.ox + c.x + i) + ',' + (L.oy + c.y + j), c.pal[f[i]]); });
    g.fillStyle = CONTORNO;
    for (const k of lleno.keys()) {
      const [x, y] = k.split(',').map(Number);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!lleno.has((x + dx) + ',' + (y + dy))) g.fillRect(x + dx, y + dy, 1, 1);
    }
    for (const [k, color] of lleno) { const [x, y] = k.split(',').map(Number); g.fillStyle = color; g.fillRect(x, y, 1, 1); }
  }

  // Las capas que tocan, en el orden en que se pintan.
  function piezas(AJ, a) {
    const eq = a.equipo, f = a.formacion, color = (h) => AJ.colorRareza[eq[h]], lista = [];
    if (eq.silla) lista.push(CAPA.silla(color('silla'), eq.silla === 'legendario'));
    if (f.logistica) lista.push(CAPA.mochila(f.logistica > 1));
    if (eq.teclado) lista.push(CAPA.teclado(color('teclado')));
    lista.push(...(B.cargoAspecto[a.rango] || B.cargoAspecto[0])());
    if (f.productividad > 1) lista.push(CAPA.medallas());
    lista.push(B.manoArma[a.arma] || B.manoArma.grapadora);
    if (f.bienestar) lista.push(f.bienestar > 1 ? CAPA.cafetera() : CAPA.termo());
    if (eq.auriculares) lista.push(CAPA.auriculares(color('auriculares')));
    if (f.productividad) lista.push(CAPA.postits());
    return lista;
  }

  function becario(sinVaso) {
    const im = UI.IMG.becario, c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    const g = c.getContext('2d');
    g.drawImage(im, 0, 0);
    if (sinVaso) g.clearRect(...VASO);
    return c;
  }

  const HECHOS = new Map();
  function lienzo(AJ, a) {
    const k = JSON.stringify(a);
    if (HECHOS.has(k)) return HECHOS.get(k);
    const c = document.createElement('canvas'), g = c.getContext('2d'), lista = piezas(AJ, a);
    c.width = L.w; c.height = L.h;
    lista.filter((p) => p.detras).forEach((p) => pieza(g, p));
    g.drawImage(becario(lista.some((p) => p.borra)), L.ox, L.oy);
    lista.filter((p) => !p.detras).forEach((p) => pieza(g, p));
    HECHOS.set(k, c);
    return c;
  }

  // Pinta el becario con su aspecto `a` centrado en (x, y), con cada píxel de `esc` (como UI.dibuja('becario', ...)).
  UI.becario = function (g, AJ, a, x, y, esc, opc) {
    if (!UI.IMG.becario) return;
    const o = opc || {}, c = lienzo(AJ, a);
    g.save(); g.imageSmoothingEnabled = false;
    if (o.alfa != null) g.globalAlpha = o.alfa;
    g.drawImage(c, Math.round(x - MEDIO.x * esc), Math.round(y - MEDIO.y * esc), L.w * esc, L.h * esc);
    g.restore();
  };
})(BAS);
