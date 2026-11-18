// Fans of Zombies · CAMINOS (dominio): un campo de flujo para que los fans rodeen casas y vallas en vez de ir en línea recta. Sobre una
// rejilla de casillas (0 = no se pasa, 1 = libre, 2 = puerta o ventana: se puede llegar, pero cuesta más porque hay que romperla) se
// calcula con Dijkstra la distancia de cada casilla hasta ti, solo en una ventana alrededor (los lejanos no lo necesitan). Cada fan
// mira sus 8 vecinas y va hacia la más cercana a ti. Un solo cálculo sirve para todos los fans (no uno por fan).
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const VEC = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
  // rejilla = { w, h, x0, z0, celda, tipo: Uint8Array }; devuelve { dist: Float32Array, i0, j0, i1, j1 } (ventana calculada)
  Z.campoFlujo = function (rej, tx, tz, radio, costeHueco) {
    const { w, h, celda, tipo } = rej, ci = Math.floor((tx - rej.x0) / celda), cj = Math.floor((tz - rej.z0) / celda), r = Math.ceil(radio / celda);
    const i0 = Math.max(1, ci - r), j0 = Math.max(1, cj - r), i1 = Math.min(w - 2, ci + r), j1 = Math.min(h - 2, cj + r);
    const campo = rej.campo && rej.campo.length === w * h ? rej.campo : (rej.campo = new Float32Array(w * h));
    for (let j = j0; j <= j1; j++) campo.fill(Infinity, j * w + i0, j * w + i1 + 1);
    const res = { dist: campo, i0, j0, i1, j1 };
    if (ci < i0 || ci > i1 || cj < j0 || cj > j1) return res;
    const cola = rej.cola || (rej.cola = new Monton()), off = [1, -1, w, -w, w + 1, w - 1, -w + 1, -w - 1];
    cola.n = 0; campo[cj * w + ci] = 0; cola.mete(cj * w + ci, 0);
    while (cola.n) {
      const d = cola.d[0], k = cola.saca();
      if (d > campo[k]) continue;
      const i = k % w, j = (k - i) / w;
      for (let v = 0; v < 8; v++) {
        const nk = k + off[v], ni = i + VEC[v][0], nj = j + VEC[v][1];
        if (ni < i0 || ni > i1 || nj < j0 || nj > j1) continue;
        const t = tipo[nk];
        if (!t || (v > 3 && (!tipo[k + VEC[v][0]] || !tipo[k + VEC[v][1] * w]))) continue;   // sin cortar esquinas
        const nd = d + VEC[v][2] * (t === 2 ? costeHueco : 1);
        if (nd < campo[nk]) { campo[nk] = nd; cola.mete(nk, nd); }
      }
    }
    return res;
  };
  // hacia dónde ir desde (x, z): la vecina más cercana al objetivo, como vector unitario (o null si no hay camino)
  Z.direccionFlujo = function (rej, flujo, x, z) {
    const { w, celda } = rej, i = Math.floor((x - rej.x0) / celda), j = Math.floor((z - rej.z0) / celda);
    if (i < flujo.i0 || i > flujo.i1 || j < flujo.j0 || j > flujo.j1) return null;
    let mejor = flujo.dist[j * w + i], bi = 0, bj = 0;
    for (const [di, dj] of VEC) {
      const ni = i + di, nj = j + dj;
      if (ni < flujo.i0 || ni > flujo.i1 || nj < flujo.j0 || nj > flujo.j1) continue;
      const d = flujo.dist[nj * w + ni];
      if (d < mejor) { mejor = d; bi = di; bj = dj; }
    }
    if (!bi && !bj) return null;
    const m = Math.hypot(bi, bj);
    return { x: bi / m, z: bj / m };
  };
  // un montón binario mínimo (para Dijkstra), con arrays que se reutilizan; saca() devuelve la clave (la distancia está en d[0] antes)
  class Monton {
    constructor() { this.k = new Int32Array(1 << 16); this.d = new Float32Array(1 << 16); this.n = 0; }
    crece() { const k = new Int32Array(this.k.length * 2), d = new Float32Array(this.d.length * 2); k.set(this.k); d.set(this.d); this.k = k; this.d = d; }
    mete(k, d) {
      if (this.n >= this.k.length) this.crece();
      let i = this.n++;
      while (i) { const p = (i - 1) >> 1; if (this.d[p] <= d) break; this.k[i] = this.k[p]; this.d[i] = this.d[p]; i = p; }
      this.k[i] = k; this.d[i] = d;
    }
    saca() {
      const k = this.k[0], ek = this.k[--this.n], ed = this.d[this.n];
      let i = 0;
      for (;;) { let c = 2 * i + 1; if (c >= this.n) break; if (c + 1 < this.n && this.d[c + 1] < this.d[c]) c++; if (this.d[c] >= ed) break; this.k[i] = this.k[c]; this.d[i] = this.d[c]; i = c; }
      if (this.n) { this.k[i] = ek; this.d[i] = ed; }
      return k;
    }
  }
})(ZOM);
