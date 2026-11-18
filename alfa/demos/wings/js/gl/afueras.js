// Fans of Wings · Lo lejano de Barcelona (boceto de la tarea #99): alrededor del trozo con detalle, la trama sigue hasta el pie de
// la sierra con un bloque por manzana (baldosas de 6 × 6 manzanas, sin solares ni árboles), el suelo y la costa se alargan, y
// detrás quedan los cerros en terrazas: Collserola con el Tibidabo y la Torre de Collserola (288 m sobre el turó de Vilana), y
// Montjuïc con su castillo. Todo va en el mismo programa de la ciudad (ciudad.js) y sale una sola vez, al crear la ciudad.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl, hex = GL.hex, B = A.barcelona;
  const AF = A.afueras = {};
  const LADO = 6, VERDES = ['#3f7f34', '#4f8f3a', '#5c9e3f', '#6aa84a', '#77b352', '#86bf5c', '#94c867'].map(hex);
  const C = { blanco: hex('#f4f2ec'), rojo: hex('#d8452e'), castillo: hex('#c9a27e'), techoCastillo: hex('#b38c66') };

  const octogono = (a, b, r) => Array.from({ length: 8 }, (_, i) => { const t = (i + 0.5) * Math.PI / 4; return [a + Math.cos(t) * r, b + Math.sin(t) * r]; });
  // Una columna octogonal de y0 a y1 (para la Torre de Collserola, que no sale del suelo de la ciudad sino de lo alto del cerro).
  function columna(m, a, b, r, y0, y1, col) {
    const P = octogono(a, b, r).map(([p, q]) => B.aDibujo(p, q));
    for (let i = 0; i < 8; i++) m.pared(P[i], P[(i + 1) % 8], y0, y1, col, false);
    for (let i = 1; i < 7; i++) m.tri([P[0][0], y1, P[0][1]], [P[i][0], y1, P[i][1]], [P[i + 1][0], y1, P[i + 1][1]], col, 1.05);
  }

  // Un cerro: siete terrazas octogonales, cada una más pequeña y más oscura que la de debajo.
  function cerro(m, q) {
    const n = 7;
    for (let s = 0; s < n; s++) {
      const r = q.radio * Math.pow(1 - s / n, 0.75), col = VERDES[n - 1 - s];
      A.ciudad.prisma(m, octogono(q.a, q.b, r), q.alto * (s + 1) / n, col, col, false);
    }
  }
  function torreCollserola(m) {
    const t = B.P.torreCollserola, S = B.SITIOS.torreCollserola, y0 = A.ciudad.SUELO + S.base;
    columna(m, t.a, t.b, 3, y0, y0 + 230, C.blanco);              // el fuste
    columna(m, t.a, t.b, 13, y0 + 84, y0 + 136, C.blanco);        // la cápsula de las plataformas (de 84 m al mirador de 135 m)
    columna(m, t.a, t.b, 1.2, y0 + 230, y0 + S.alto, C.rojo);     // la antena
  }
  function castillo(m) {
    const p = B.P.montjuic, h = B.SITIOS.montjuic.alto, y0 = A.ciudad.SUELO + h;
    const P = [[-60, -60], [60, -60], [60, 60], [-60, 60]].map(([x, z]) => B.aDibujo(p.a + x, p.b + z));
    for (let i = 0; i < 4; i++) m.pared(P[i], P[(i + 1) % 4], y0 - 4, y0 + 12, C.castillo, false);
    m.cuadro(...P.map(([x, z]) => [x, y0 + 12, z]), C.techoCastillo, 1);
  }
  const llano = (m, a0, b0, a1, b1, col, y) => m.cuadro(...[[a0, b0], [a1, b0], [a1, b1], [a0, b1]].map(([a, b]) => { const [x, z] = B.aDibujo(a, b); return [x, A.ciudad.SUELO + y, z]; }), col, 1);

  // Crea las baldosas lejanas (las añade a `baldosas`, con la misma malla para cerca y lejos) y devuelve la malla del suelo lejano.
  AF.crear = function (baldosas) {
    const T = B.TRAMA_LEJOS, CI = A.ciudad;
    for (let bi = T.i0; bi <= T.i1; bi += LADO) for (let bk = T.k0; bk <= T.k1; bk += LADO) {
      const m = new CI.Malla();
      for (let i = bi; i < Math.min(bi + LADO, T.i1 + 1); i++) for (let k = bk; k < Math.min(bk + LADO, T.k1 + 1); k++) if (B.hayLejos(i, k)) CI.manzanaBasta(m, i, k);
      const malla = m.subir();
      if (!malla) continue;
      const c = B.centro(bi + (LADO - 1) / 2, bk + (LADO - 1) / 2), [x, z] = B.aDibujo(c.a, c.b);
      baldosas.push({ c: [x, 20, z], radio: B.PASO * LADO * 0.75, fina: malla, basta: malla, arboles: null });
    }
    const m = new CI.Malla(), a0 = -9500, a1 = 6500, C2 = B.COSTA;
    llano(m, a0, B.P.tibidabo.b - 2500, a1, B.RONDA, CI.COL.calle, -0.4);
    llano(m, a0, B.RONDA, a1, C2.paseo, CI.COL.ronda, -0.3);
    llano(m, a0, C2.paseo, a1, C2.playa, CI.COL.paseo, -0.3);
    llano(m, a0, C2.playa, a1, C2.mar, CI.COL.arena, -0.3);
    for (const q of B.CERROS) cerro(m, q);
    torreCollserola(m); castillo(m);
    return m.subir();
  };
})(WINGS);
