// Fans of Wings · Los monumentos de Barcelona en cubitos (boceto de la tarea #99), con sus medidas reales aproximadas: la Sagrada
// Família (torre de Jesús de 172,5 m, la de María, las cuatro de los evangelistas, las fachadas del Nacimiento y de la Pasión con
// sus campanarios, los portales, los pináculos de la nave y las puntas de colores), la Torre Glòries (144 m, cilindro con cúpula
// y fachada de colores encendida), el Hotel Arts y la Torre Mapfre (154 m, a cada lado de la calle de la Marina) y el Peix dorado
// de Gehry a sus pies. Cada uno es una rejilla de cubitos de motor.js (GL.cubitos) en varias tallas: cubitos de 1 m de cerca, de
// 2 m a media distancia y de 4 m de lejos. Como el resto de lo construido, se dibujan al doble de alto (y un cuarto más anchos,
// para que no queden como agujas).
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl, M = GL.M, V = GL.V, hex = GL.hex, B = A.barcelona;
  const MO = A.monumentos = { lista: [] };
  const SUELO = 0.6, ESCALA = [1.25, 2, 1.25];
  const C = {
    nacimiento: hex('#b89a74'), pasion: hex('#d6c4a0'), nueva: hex('#ebe3cf'), hueco: hex('#5a4a3c'), nave: hex('#cdb995'), vidriera: hex('#ffcf6a'),
    punta: ['#f2c230', '#d8452e', '#5fae3a', '#ffffff'].map(hex), blanco: hex('#ffffff'), portal: hex('#3c2f26'),
    glories: ['#c9362b', '#e2652f', '#f0a23a', '#3b6fb6', '#5b9bd5', '#8fc4e6', '#d9eef7', '#2f4f8f'].map(hex),
    vidrio: hex('#2c4058'), marco: hex('#f4f2ec'), mapfre: hex('#3f6f96'), banda: hex('#e8eef2'), helipuerto: hex('#d8452e'), oro: hex('#e0b64a'), oroOscuro: hex('#b88a2a'),
    luz: hex('#ffd98a'), luzFria: hex('#cfe6ff'),
  };
  const osc = (c) => GL.tono(c, 0.88), claro = (c) => [Math.min(1, c[0] * 1.5 + 0.1), Math.min(1, c[1] * 1.5 + 0.1), Math.min(1, c[2] * 1.5 + 0.1)];
  const GLORIES_LUZ = C.glories.map(claro);
  const h = (X, Y, Z) => GL.h2(Math.floor(X) * 7 + Math.floor(Z) * 131, Math.floor(Y), 3);   // azar por metro (igual en todas las tallas)

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
  for (const t of TORRES) t.col2 = osc(t.col);

  function enTorre(t, X, Y, Z) {
    if (Y < t.base || Y > t.alto) return null;
    const k = (Y - t.base) / (t.alto - t.base), r = t.r0 + (t.r1 - t.r0) * Math.pow(k, 1.25), d = Math.hypot(X - t.x, Z - t.z);
    if (k > 0.86) return d < Math.max(1.1, r * (1 - (k - 0.86) * 4)) ? C.punta[t.punta] : null;   // la punta de mosaico
    if (d > r) return null;
    const ang = Math.atan2(Z - t.z, X - t.x);
    if (d > r - 2.2 && Math.floor(Y / 6) % 3 === 1 && Math.floor(ang * 2.5) % 2 === 0) return Math.floor(Y / 6) % 2 ? C.luz : C.hueco;   // las celosías (alguna, con luz dentro)
    return Math.floor(ang * 5 + 40) % 2 ? t.col : t.col2;                                          // las nervaduras
  }
  // Los portales: tres arcos en cada fachada lateral (Nacimiento y Pasión) y el grande de la Gloria, hacia el mar.
  const arco = (d, Y, ancho, alto) => Math.abs(d) < ancho * Math.sqrt(Math.max(0, 1 - Y / alto));
  function portal(X, Y, Z) {
    if (Math.abs(X) > 29 && Y < 24) return arco(Z + 21, Y, 3.4, 20) || arco(Z + 12, Y, 4.2, 24) || arco(Z + 3, Y, 3.4, 20);
    return Z > 42 && arco(X, Y, 9, 32);
  }
  // El cuerpo: nave, crucero, ábside y la fachada de la Gloria, con tejado a dos aguas, vidrieras encendidas y pináculos.
  function enCuerpo(X, Y, Z) {
    const nave = Math.abs(X) < 22 && Z > -15 && Z < 46, crucero = Math.abs(X) < 33 && Z > -29 && Z < 4, abside = Z <= -29 && Math.hypot(X, Z + 29) < 22;
    if (!nave && !crucero && !abside) return null;
    const techo = 45 + Math.max(0, 22 - Math.abs(X)) * 0.6;
    if (nave && Math.abs(X) > 19.5 && Y > techo && Y < 60 && ((Z + 15) % 9 + 9) % 9 < 2) return Y > 55 ? C.punta[Math.floor((Z + 15) / 9) % 3] : C.nueva;   // los pináculos, con su fruta
    if (Y > techo) return null;
    if (portal(X, Y, Z)) return C.portal;
    if (Y > 10 && Y < 38 && Math.floor(Y / 4) % 2 === 0 && Math.floor((X + Z) / 3) % 2 === 0) return C.vidriera;   // solo se ven las de fuera
    return Y > 43 ? C.nueva : C.nave;
  }
  function colorSagrada(X, Y, Z) {
    if (Math.abs(X) < 1.5 && Y > 166 && Y < 176 && (Math.abs(Z + 13) < 1.5 || (Y > 170 && Y < 173 && Math.abs(Z + 13) < 4))) return C.blanco;   // la cruz
    for (const t of TORRES) { const c = enTorre(t, X, Y, Z); if (c) return c; }
    return enCuerpo(X, Y, Z);
  }
  // Una rejilla de `ancho` × `alto` × `fondo` metros en cubitos de `vox` metros; color(X, Y, Z) en metros desde el centro de la base.
  function rejilla(ancho, alto, fondo, vox, color) {
    const nx = Math.ceil(ancho / vox), ny = Math.ceil(alto / vox), nz = Math.ceil(fondo / vox);
    return GL.cubitos(nx, ny, nz, { vox: [vox, vox, vox], color: (x, y, z) => color((x - nx / 2 + 0.5) * vox, (y + 0.5) * vox, (z - nz / 2 + 0.5) * vox) });
  }

  // ---------- la Torre Glòries: cilindro de 39 m que se cierra en cúpula a partir de 100 m; de rojos (abajo) a azules (arriba) ----------
  function colorGlories(X, Y, Z) {
    const d = Math.hypot(X, Z), r = Y < 100 ? 19.5 : 19.5 * Math.sqrt(Math.max(0, 1 - ((Y - 100) / 44) ** 2));
    if (d > r) return null;
    const a = h(X / 2, Y / 2, Z / 2), k = Math.min(7, Math.max(0, Math.floor(Y / 144 * 6 + a * 2.5)));
    return h(X, Y, Z) > 0.72 ? GLORIES_LUZ[k] : C.glories[k];   // los paneles encendidos
  }
  // ---------- las torres del Port Olímpic: 34 m de lado y 154 m ----------
  const fuera = (X, Z) => Math.max(Math.abs(X), Math.abs(Z)) > 16, aLoLargo = (X, Z) => (Math.abs(X) > Math.abs(Z) ? Z : X) + 17;
  const oficina = (X, Y, Z, cristal) => (h(X / 2, Y / 3, Z / 2) > 0.62 ? (h(X, Y, Z) > 0.5 ? C.luz : C.luzFria) : cristal);
  // El Hotel Arts: el esqueleto blanco por fuera (pilares, forjados cada 20 m y cruces) y cristal detrás.
  function colorArts(X, Y, Z) {
    if (Math.abs(X) > 17 || Math.abs(Z) > 17 || Y > 154) return null;
    if (Y > 152) return C.marco;
    if (!fuera(X, Z)) return C.vidrio;
    const u = aLoLargo(X, Z), f = Y % 20, c = u % 20;
    return u % 8 < 1.2 || f < 1.2 || Math.abs(c - f) < 1.3 || Math.abs(c - (20 - f)) < 1.3 ? C.marco : oficina(X, Y, Z, C.vidrio);
  }
  // La Torre Mapfre: cristal con bandas blancas y el helipuerto rojo arriba.
  function colorMapfre(X, Y, Z) {
    if (Math.abs(X) > 17 || Math.abs(Z) > 17 || Y > 154) return null;
    if (Y > 152) return Math.abs(X) < 6 && Math.abs(Z) < 6 ? C.helipuerto : C.banda;
    if (!fuera(X, Z)) return C.mapfre;
    return Y % 6 < 2 ? C.banda : oficina(X, Y, Z, C.mapfre);
  }
  // El Peix de Gehry: un pez dorado de 56 m de largo y 35 de alto, con su cola.
  function colorPeix(X, Y, Z) {
    const cuerpo = ((X + 4) / 24) ** 2 + ((Y - 20) / 10) ** 2 + (Z / 7) ** 2 < 1, cola = X > 18 && Math.abs(Y - 20) < (X - 18) * 1.4 && Math.abs(Z) < 2;
    if (!cuerpo && !cola) return Y < 8 && Math.abs(X) < 4 && Math.abs(Z) < 3 ? C.oroOscuro : null;   // el pie
    return Math.floor((X + Y) / 2) % 3 === 0 ? C.oroOscuro : C.oro;
  }

  // ---------- crear y dibujar ----------
  const enPlano = (a, b) => { const [x, z] = B.aDibujo(a, b); return [x, SUELO, z]; };
  // Las tallas de un monumento: [cubito en metros, hasta qué distancia se usa].
  const tallas = (medidas, color, lista) => lista.map(([vox, hasta]) => ({ malla: rejilla(...medidas, vox, color), hasta }));
  MO.crear = function () {
    const P = B.P, sf = B.centro(0, 0), CERCA = [[1, 900], [2, 1e9]];
    MO.lista = [
      { nombre: 'sagrada', p: enPlano(sf.a, sf.b), tallas: tallas([82, 178, 104], colorSagrada, [[1, 800], [2, 3000], [4, 1e9]]) },
      { nombre: 'torreGlories', p: enPlano(P.torreGlories.a, P.torreGlories.b), tallas: tallas([42, 146, 42], colorGlories, CERCA) },
      { nombre: 'arts', p: enPlano(P.arts.a, P.arts.b), tallas: tallas([36, 156, 36], colorArts, CERCA) },
      { nombre: 'mapfre', p: enPlano(P.mapfre.a, P.mapfre.b), tallas: tallas([36, 156, 36], colorMapfre, CERCA) },
      { nombre: 'peix', p: enPlano(P.arts.a + 36, P.arts.b + 44), tallas: tallas([60, 36, 16], colorPeix, CERCA) },
    ];
  };
  // Pinta los monumentos (con el programa de las mallas ya puesto) y dice cuántos triángulos han salido.
  MO.dibujar = function (cam) {
    let n = 0;
    for (const m of MO.lista) {
      const d = V.dist(m.p, cam.ojo), malla = m.tallas.find((t) => d < t.hasta).malla;
      GL.malla(malla, M.mul(M.T(m.p[0], m.p[1], m.p[2]), M.S(...ESCALA)));
      n += malla.n / 3;
    }
    return n;
  };
  MO.triangulos = () => MO.lista.reduce((s, m) => s + m.tallas.reduce((q, t) => q + t.malla.n / 3, 0), 0);
})(WINGS);
