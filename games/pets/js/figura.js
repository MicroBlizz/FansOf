// Fans Of Pets · FIGURA: una criatura POR PIEZAS sacada de su dibujo entero (herramientas/pets/despiece.py, docs/pets/arte.md «camino A»).
// Su mapa.json dice el orden de las capas y, de cada pieza, su caja y su punto de giro (fracciones del lienzo) y su pieza madre. Aquí,
// sin dibujar nada: se valida el mapa y se monta con unos giros (grados por pieza): cada pieza gira sobre su punto de giro y arrastra a
// las que cuelgan de ella (la cabeza a las orejas; el tronco a todo). El resultado es la matriz de cada pieza para pintarla.
'use strict';
PT.figura = (() => {
  // matriz afín [a, b, c, d, e, f] (como setTransform del lienzo): x' = a·x + c·y + e, y' = b·x + d·y + f
  const IDENTIDAD = [1, 0, 0, 1, 0, 0];
  const por = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  function giroEn(grados, [px, py]) {
    const r = grados * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    return [c, s, -s, c, px - c * px + s * py, py - s * px - c * py];
  }
  const aplica = (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

  // un mapa sirve si trae capas, cada capa tiene su pieza con caja y punto de giro, y cada madre existe sin dar la vuelta.
  // PT.ok(mapa) o PT.error('mapa-sin-capas' | 'pieza-sin-ficha' | 'madre-desconocida' | 'madres-circulares', datos)
  function valida(mapa) {
    if (!mapa || !Array.isArray(mapa.capas) || !mapa.capas.length || !mapa.piezas) return PT.error('mapa-sin-capas', {});
    for (const p of mapa.capas) {
      const f = mapa.piezas[p];
      if (!f || !Array.isArray(f.caja) || f.caja.length !== 4 || !Array.isArray(f.pivote)) return PT.error('pieza-sin-ficha', { pieza: p });
      if (f.madre && !mapa.piezas[f.madre]) return PT.error('madre-desconocida', { pieza: p, madre: f.madre });
    }
    for (const p of mapa.capas) {
      const vistas = [];
      for (let q = p; q; q = mapa.piezas[q].madre) {
        if (vistas.includes(q)) return PT.error('madres-circulares', { pieza: p });
        vistas.push(q);
      }
    }
    return PT.ok(mapa);
  }
  // la matriz de una pieza: la de su madre por su propio giro sobre su punto de giro (se calcula una vez por pieza)
  function matrizDe(mapa, p, giros, hechas) {
    if (hechas[p]) return hechas[p];
    const f = mapa.piezas[p], madre = f.madre ? matrizDe(mapa, f.madre, giros, hechas) : IDENTIDAD;
    hechas[p] = por(madre, giroEn(giros[p] || 0, f.pivote));
    return hechas[p];
  }
  // el montaje: en orden de capas (de atrás a delante), cada pieza con su archivo, su caja y su matriz.
  // PT.ok([{ pieza, archivo, caja, matriz }]) o el error de valida
  function montar(mapa, giros = {}) {
    const v = valida(mapa);
    if (!v.ok) return v;
    const hechas = {};
    return PT.ok(mapa.capas.map(p => ({ pieza: p, archivo: mapa.piezas[p].archivo, caja: mapa.piezas[p].caja, matriz: matrizDe(mapa, p, giros, hechas) })));
  }
  // dónde va la cara: el marco medido en el dibujo (mx, my, d) y la matriz de la pieza que la lleva (la cabeza); null si el mapa no trae cara
  function cara(mapa, montaje) {
    const c = mapa.cara, de = c && montaje.find(m => m.pieza === c.pieza);
    return de ? { marco: c.marco, matriz: de.matriz } : null;
  }
  // lo que ocupa la figura en reposo (fracciones del lienzo): de lo más alto de una caja a lo más bajo, para apoyarla y darle su alto
  function alto(mapa) {
    const cajas = mapa.capas.map(p => mapa.piezas[p].caja);
    return { arriba: Math.min(...cajas.map(c => c[1])), pies: Math.max(...cajas.map(c => c[1] + c[3])) };
  }
  return { valida, montar, cara, alto, aplica };
})();
