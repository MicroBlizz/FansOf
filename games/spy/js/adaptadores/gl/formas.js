// Fans of Spy · ADAPTADORES · Las formas con las que se construyen los modelos: cajas (rectas o que se estrechan arriba), cilindros
// (y conos), esferas achatadas y rectángulos tumbados. Un constructor `b` va acumulando triángulos; con F.con(b, matriz, fn) todo
// lo que se añada dentro de fn queda movido, girado o escalado por esa matriz (así se inclina una oreja o se tumba un cilindro).
// Cada vértice guarda también hacia dónde se hincha su contorno: en las cajas, hacia la esquina, para que el borde negro cierre.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const M = S.gl.M, V = S.gl.V, F = S.formas = {};
  const colores = new Map();

  // Un color '#rrggbb' en tres números de 0 a 1.
  const color = F.color = function (hex) {
    if (!colores.has(hex)) { const n = parseInt(hex.slice(1), 16); colores.set(hex, [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]); }
    return colores.get(hex);
  };
  const resta = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

  F.nueva = () => ({ d: [], m: null });
  F.con = function (b, m, fn) {
    const antes = b.m;
    b.m = antes ? M.mul(antes, m) : m;
    fn();
    b.m = antes;
  };
  // Los números de la malla, listos para SPY.gl.malla.
  F.datos = (b) => new Float32Array(b.d);

  // Un vértice: se pasa por la matriz del constructor (la posición entera; la normal y el contorno, solo el giro).
  function vertice(b, p, n, c, e, k) {
    let q = p, nn = n, kk = k;
    if (b.m) {
      const o = M.punto(b.m, p[0], p[1], p[2]), z = M.punto(b.m, 0, 0, 0);
      const gira = (v) => V.norma(resta(M.punto(b.m, v[0], v[1], v[2]), z));
      q = o; nn = gira(n); kk = gira(k);
    }
    b.d.push(q[0], q[1], q[2], nn[0], nn[1], nn[2], c[0], c[1], c[2], e, kk[0], kk[1], kk[2]);
  }
  // Un triángulo con una normal por vértice. Si está al revés respecto a sus normales, se le da la vuelta (así nunca queda una cara hacia dentro).
  function triangulo(b, p, n, c, e, k) {
    const cara = V.cruz(resta(p[1], p[0]), resta(p[2], p[0])), media = [n[0][0] + n[1][0] + n[2][0], n[0][1] + n[1][1] + n[2][1], n[0][2] + n[1][2] + n[2][2]];
    const orden = V.punto3(cara, media) < 0 ? [0, 2, 1] : [0, 1, 2];
    for (const i of orden) vertice(b, p[i], n[i], c, e, k[i]);
  }
  // Una cara plana de cuatro esquinas que mira hacia `fuera`.
  function cara(b, p, fuera, c, e, k) {
    let n = V.norma(V.cruz(resta(p[1], p[0]), resta(p[2], p[0])));
    if (V.punto3(n, fuera) < 0) n = [-n[0], -n[1], -n[2]];
    triangulo(b, [p[0], p[1], p[2]], [n, n, n], c, e, [k[0], k[1], k[2]]);
    triangulo(b, [p[0], p[2], p[3]], [n, n, n], c, e, [k[0], k[2], k[3]]);
  }

  // Una caja apoyada en (x, y, z): sx de ancho, sy de alto y sz de fondo. `arriba` = [kx, kz] estrecha (o ensancha) la tapa.
  F.caja = function (b, o) {
    const c = color(o.color), e = o.emi || 0, hx = o.sx / 2, hz = o.sz / 2, ar = o.arriba || [1, 1];
    const esquina = (ix, iy, iz) => [o.x + ix * hx * (iy > 0 ? ar[0] : 1), o.y + (iy > 0 ? o.sy : 0), o.z + iz * hz * (iy > 0 ? ar[1] : 1)];
    const CARAS = [[[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]],
      [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], [[-1, -1, -1], [-1, 1, -1], [1, 1, -1], [1, -1, -1]]];
    const FUERA = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    CARAS.forEach((q, i) => { if (!(o.sinBase && i === 3)) cara(b, q.map((s) => esquina(s[0], s[1], s[2])), FUERA[i], c, e, q.map((s) => V.norma(s))); });
  };

  // Un cilindro de pie sobre (x, y, z): radio r abajo y r2 arriba (r2 = 0 es un cono), h de alto. Para tumbarlo, F.con con un giro.
  F.cilindro = function (b, o) {
    const c = color(o.color), e = o.emi || 0, n = o.lados || 12, r2 = o.r2 === undefined ? o.r : o.r2, pend = (o.r - r2) / o.h;
    const aro = (i, r, y) => { const a = i / n * Math.PI * 2; return [o.x + Math.cos(a) * r, o.y + y, o.z + Math.sin(a) * r]; };
    const lado = (i) => { const a = i / n * Math.PI * 2; return V.norma([Math.cos(a), pend, Math.sin(a)]); };
    const borde = (i, s) => { const a = i / n * Math.PI * 2; return V.norma([Math.cos(a), s, Math.sin(a)]); };
    for (let i = 0; i < n; i++) {
      const a0 = aro(i, o.r, 0), a1 = aro(i + 1, o.r, 0), b0 = aro(i, r2, o.h), b1 = aro(i + 1, r2, o.h);
      triangulo(b, [a0, a1, b1], [lado(i), lado(i + 1), lado(i + 1)], c, e, [borde(i, -1), borde(i + 1, -1), borde(i + 1, 1)]);
      if (r2 > 0) triangulo(b, [a0, b1, b0], [lado(i), lado(i + 1), lado(i)], c, e, [borde(i, -1), borde(i + 1, 1), borde(i, 1)]);
      triangulo(b, [[o.x, o.y, o.z], a0, a1], [[0, -1, 0], [0, -1, 0], [0, -1, 0]], c, e, [[0, -1, 0], borde(i, -1), borde(i + 1, -1)]);
      if (r2 > 0) triangulo(b, [[o.x, o.y + o.h, o.z], b0, b1], [[0, 1, 0], [0, 1, 0], [0, 1, 0]], c, e, [[0, 1, 0], borde(i, 1), borde(i + 1, 1)]);
    }
  };

  // Una esfera con centro en (x, y, z) y radios rx, ry y rz (achatada o alargada).
  F.esfera = function (b, o) {
    const c = color(o.color), e = o.emi || 0, lados = o.lados || 12, pisos = o.pisos || 7, rx = o.r || o.rx, ry = o.r || o.ry, rz = o.r || o.rz;
    const punto = (i, j) => {
      const a = i / lados * Math.PI * 2, f = j / pisos * Math.PI, s = Math.sin(f);
      const n = [Math.cos(a) * s, Math.cos(f), Math.sin(a) * s];
      return { p: [o.x + n[0] * rx, o.y + n[1] * ry, o.z + n[2] * rz], n: V.norma([n[0] / rx, n[1] / ry, n[2] / rz]) };
    };
    for (let j = 0; j < pisos; j++) {
      for (let i = 0; i < lados; i++) {
        const q = [punto(i, j), punto(i + 1, j), punto(i + 1, j + 1), punto(i, j + 1)];
        if (j > 0) triangulo(b, [q[0].p, q[1].p, q[2].p], [q[0].n, q[1].n, q[2].n], c, e, [q[0].n, q[1].n, q[2].n]);
        if (j < pisos - 1) triangulo(b, [q[0].p, q[2].p, q[3].p], [q[0].n, q[2].n, q[3].n], c, e, [q[0].n, q[2].n, q[3].n]);
      }
    }
  };

  // Un rectángulo tumbado (una marca pintada en el suelo): de (x0, z0) a (x1, z1), a la altura y. No lleva contorno.
  F.plano = function (b, o) {
    const c = color(o.color), e = o.emi || 0, n = [0, 1, 0], k = [0, 0, 0];
    const p = [[o.x0, o.y, o.z0], [o.x0, o.y, o.z1], [o.x1, o.y, o.z1], [o.x1, o.y, o.z0]];
    triangulo(b, [p[0], p[1], p[2]], [n, n, n], c, e, [k, k, k]);
    triangulo(b, [p[0], p[2], p[3]], [n, n, n], c, e, [k, k, k]);
  };
})(SPY);
