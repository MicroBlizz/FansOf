// Fans of Wings · Los monumentos de Barcelona en cubitos (boceto de la tarea #99), con sus medidas reales aproximadas: la Sagrada
// Família (torre de Jesús de 172,5 m, la de María, las cuatro de los evangelistas, las fachadas del Nacimiento y de la Pasión con
// sus campanarios y las puntas de colores), la Torre Glòries (144 m, cilindro con cúpula y fachada de colores), el Hotel Arts y la
// Torre Mapfre (154 m, a cada lado de la calle de la Marina) y el Peix dorado de Gehry a sus pies. Cada uno es una rejilla de
// cubitos de motor.js (GL.cubitos) colocada en su sitio del plano; la Sagrada Família tiene además una talla basta para lo lejano.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl, M = GL.M, V = GL.V, hex = GL.hex, B = A.barcelona;
  const MO = A.monumentos = { lista: [] };
  const SUELO = 0.6;
  const C = {
    nacimiento: hex('#b89a74'), pasion: hex('#d6c4a0'), nueva: hex('#ebe3cf'), hueco: hex('#6e5d4c'), nave: hex('#cdb995'), vidriera: hex('#5d7fa0'),
    punta: ['#f2c230', '#d8452e', '#5fae3a', '#ffffff'].map(hex), blanco: hex('#ffffff'), azul: hex('#3f78c8'),
    glories: ['#c9362b', '#e2652f', '#f0a23a', '#3b6fb6', '#5b9bd5', '#8fc4e6', '#d9eef7', '#2f4f8f'].map(hex),
    vidrio: hex('#3c5670'), marco: hex('#f4f2ec'), mapfre: hex('#4f7fa6'), banda: hex('#e8eef2'), helipuerto: hex('#d8452e'), oro: hex('#e0b64a'), oroOscuro: hex('#b88a2a'),
  };
  const h = (x, y, z) => GL.h2(x * 7 + z * 131, y, 3);

  // ---------- la Sagrada Família (x a lo largo de la costa, z hacia el mar; la fachada de la Gloria mira al mar) ----------
  const TORRES = [
    { x: 0, z: -13, base: 40, alto: 172.5, r0: 10, r1: 3.2, col: C.nueva, punta: 3 },   // Jesús, con su cruz blanca
    { x: 0, z: -35, base: 40, alto: 138, r0: 7.5, r1: 2.6, col: C.nueva, punta: 3 },     // María, con su estrella
    { x: 15, z: -28, base: 40, alto: 135, r0: 6.5, r1: 2.2, col: C.nueva, punta: 0 }, { x: -15, z: -28, base: 40, alto: 135, r0: 6.5, r1: 2.2, col: C.nueva, punta: 1 },
    { x: 15, z: 2, base: 40, alto: 135, r0: 6.5, r1: 2.2, col: C.nueva, punta: 2 }, { x: -15, z: 2, base: 40, alto: 135, r0: 6.5, r1: 2.2, col: C.nueva, punta: 0 },
  ];
  // Los campanarios: cuatro en la fachada del Nacimiento (lado del Besòs, x > 0) y cuatro en la de la Pasión.
  [[-25.5, 98], [-16.5, 107], [-7.5, 107], [1.5, 98]].forEach(([z, alto], i) => TORRES.push({ x: 36, z, base: 0, alto, r0: 4.4, r1: 1.2, col: C.nacimiento, punta: i % 3 }));
  [[-25.5, 98], [-16.5, 112], [-7.5, 112], [1.5, 98]].forEach(([z, alto], i) => TORRES.push({ x: -36, z, base: 0, alto, r0: 4.4, r1: 1.2, col: C.pasion, punta: (i + 1) % 3 }));

  function enTorre(t, X, Y, Z) {
    if (Y < t.base || Y > t.alto) return null;
    const k = (Y - t.base) / (t.alto - t.base), r = t.r0 + (t.r1 - t.r0) * Math.pow(k, 1.25), d = Math.hypot(X - t.x, Z - t.z);
    if (k > 0.86) return d < Math.max(1.1, r * (1 - (k - 0.86) * 4)) ? C.punta[t.punta] : null;   // la punta de mosaico
    if (d > r) return null;
    return d > r - 2.2 && Math.floor(Y / 6) % 3 === 1 && Math.floor(Math.atan2(Z - t.z, X - t.x) * 2.5) % 2 === 0 ? C.hueco : t.col;   // las celosías
  }
  // El cuerpo: nave, crucero, ábside y la fachada de la Gloria (más baja), con tejado a dos aguas y vidrieras.
  function enCuerpo(X, Y, Z) {
    const nave = Math.abs(X) < 22 && Z > -15 && Z < 46, crucero = Math.abs(X) < 33 && Z > -29 && Z < 4, abside = Z <= -29 && Math.hypot(X, Z + 29) < 22;
    if (!nave && !crucero && !abside) return null;
    const techo = 45 + Math.max(0, 22 - Math.abs(X)) * 0.6;
    if (Y > techo) return null;
    if (Y > 10 && Y < 38 && Math.floor(Y / 4) % 2 === 0 && Math.floor((X + Z) / 3) % 2 === 0) return C.vidriera;   // solo se ven las de fuera
    return Y > 43 ? C.nueva : C.nave;
  }
  function colorSagrada(X, Y, Z) {
    if (Math.abs(X) < 1.5 && Y > 166 && Y < 176 && (Math.abs(Z + 13) < 1.5 || (Y > 170 && Y < 173 && Math.abs(Z + 13) < 4))) return C.blanco;   // la cruz
    for (const t of TORRES) { const c = enTorre(t, X, Y, Z); if (c) return c; }
    return enCuerpo(X, Y, Z);
  }
  function sagrada(vox) {
    const nx = Math.ceil(82 / vox), ny = Math.ceil(178 / vox), nz = Math.ceil(104 / vox);
    return GL.cubitos(nx, ny, nz, { vox: [vox, vox, vox], color: (x, y, z) => colorSagrada((x - nx / 2 + 0.5) * vox, (y + 0.5) * vox, (z - nz / 2 + 0.5) * vox) });
  }

  // ---------- la Torre Glòries: cilindro de 39 m que se cierra en cúpula a partir de 100 m; colores de abajo (rojos) a arriba (azules) ----------
  function torreGlories(vox) {
    const R = 19.5, n = Math.ceil(42 / vox), ny = Math.ceil(146 / vox);
    return GL.cubitos(n, ny, n, { vox: [vox, vox, vox], color(x, y, z) {
      const X = (x - n / 2 + 0.5) * vox, Y = (y + 0.5) * vox, Z = (z - n / 2 + 0.5) * vox, d = Math.hypot(X, Z);
      const r = Y < 100 ? R : R * Math.sqrt(Math.max(0, 1 - ((Y - 100) / 44) ** 2));
      if (d > r) return null;
      const k = Math.min(7, Math.max(0, Math.floor(Y / 144 * 6 + h(x, y, z) * 2.5)));
      return C.glories[k];
    } });
  }
  // ---------- las torres del Port Olímpic: 34 m de lado y 154 m ----------
  function torreCuadrada(vox, color) {
    const n = Math.ceil(34 / vox), ny = Math.ceil(154 / vox);
    return GL.cubitos(n, ny, n, { vox: [vox, vox, vox], color: (x, y, z) => color(x, y, z, n, ny) });
  }
  // El Hotel Arts: el esqueleto blanco por fuera (pilares, forjados cada 6 pisos y cruces) y cristal detrás.
  function colorArts(x, y, z, n, ny) {
    const fuera = x === 0 || z === 0 || x === n - 1 || z === n - 1;
    if (!fuera || y >= ny - 1) return y >= ny - 1 ? C.marco : C.vidrio;
    const u = x === 0 || x === n - 1 ? z : x, f = y % 10;
    return u % 4 === 0 || f === 0 || Math.abs((u % 10) - f) < 1 || Math.abs((u % 10) - (10 - f)) < 1 ? C.marco : C.vidrio;
  }
  // La Torre Mapfre: cristal con bandas blancas y el helipuerto rojo arriba.
  function colorMapfre(x, y, z, n, ny) {
    if (y >= ny - 1) return Math.abs(x - n / 2) < 3 && Math.abs(z - n / 2) < 3 ? C.helipuerto : C.banda;
    return y % 3 === 0 ? C.banda : C.mapfre;
  }
  // El Peix de Gehry: un pez dorado de 56 m de largo y 35 de alto, con su cola.
  function peix(vox) {
    const nx = Math.ceil(60 / vox), ny = Math.ceil(36 / vox), nz = Math.ceil(16 / vox);
    return GL.cubitos(nx, ny, nz, { vox: [vox, vox, vox], color(x, y, z) {
      const X = (x - nx / 2 + 0.5) * vox, Y = (y + 0.5) * vox, Z = (z - nz / 2 + 0.5) * vox;
      const cuerpo = ((X + 4) / 24) ** 2 + ((Y - 20) / 10) ** 2 + (Z / 7) ** 2 < 1, cola = X > 18 && Math.abs(Y - 20) < (X - 18) * 1.4 && Math.abs(Z) < 2;
      if (!cuerpo && !cola) return Y < 8 && Math.abs(X) < 4 && Math.abs(Z) < 3 ? C.oroOscuro : null;   // el pie
      return (x + y) % 3 === 0 ? C.oroOscuro : C.oro;
    } });
  }

  // ---------- crear y dibujar ----------
  const enPlano = (a, b) => { const [x, z] = B.aDibujo(a, b); return [x, SUELO, z]; };
  MO.crear = function () {
    const P = B.P, sf = B.centro(0, 0);
    MO.lista = [
      { nombre: 'sagrada', p: enPlano(sf.a, sf.b), fina: sagrada(2), basta: sagrada(4), lejos: 2600 },
      { nombre: 'torreGlories', p: enPlano(P.torreGlories.a, P.torreGlories.b), fina: torreGlories(2) },
      { nombre: 'arts', p: enPlano(P.arts.a, P.arts.b), fina: torreCuadrada(2, colorArts) },
      { nombre: 'mapfre', p: enPlano(P.mapfre.a, P.mapfre.b), fina: torreCuadrada(2, colorMapfre) },
      { nombre: 'peix', p: enPlano(P.arts.a + 30, P.arts.b + 36), fina: peix(2) },
    ];
  };
  // Pinta los monumentos (con el programa de las mallas ya puesto) y dice cuántos triángulos han salido.
  MO.dibujar = function (cam) {
    let n = 0;
    for (const m of MO.lista) {
      const malla = m.basta && V.dist(m.p, cam.ojo) > m.lejos ? m.basta : m.fina;
      GL.malla(malla, M.T(m.p[0], m.p[1], m.p[2]));
      n += malla.n / 3;
    }
    return n;
  };
  MO.triangulos = () => MO.lista.reduce((s, m) => s + m.fina.n / 3 + (m.basta ? m.basta.n / 3 : 0), 0);
})(WINGS);
