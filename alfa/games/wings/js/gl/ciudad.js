// Fans of Wings · La ciudad de Barcelona en dibujo (boceto de la tarea #99): convierte el plano de barcelona.js en mallas del
// programa de fachadas.js. Lo construido se dibuja el DOBLE de alto que en la realidad (elegido por Daniel el 18-11-2026, para que
// la ciudad luzca desde el aire); el plano sigue a tamaño real. Cada edificio es un prisma con su azotea; la ciudad va en baldosas
// de 4 × 4 manzanas con tres tallas: el detalle (árboles, casetas, depósitos y antenas de las azoteas, solo cerca), los edificios
// con sus solares y un bloque por manzana para lo lejano; las baldosas de detrás de la cámara no se pintan. El suelo (calles,
// avenidas, plazas, playa, puerto y espigones) es una malla aparte. Monumentos en monumentos.js, lo lejano en afueras.js y los
// coches en trafico.js.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl, V = GL.V, hex = GL.hex, B = A.barcelona, FA = A.fachadas, T = FA.TIPO, LUZ = FA.LUZ;
  const CI = A.ciudad = { baldosas: [], suelo: null, sueloLejos: null, listo: false, triangulos: 0, pintados: 0, ms: 0 };
  const SUELO = 0.6, ALTO = 2, CERCA_DETALLE = 720, CERCA_EDIFICIOS = 2100, LADO_BALDOSA = 4;
  CI.SUELO = SUELO; CI.ALTO = ALTO;

  const pal = (l) => l.map(hex);
  const COL = CI.COL = {
    eixample: pal(['#e8d3a8', '#d9b98a', '#e6c7b0', '#cfa27a', '#f0e2c4', '#c98f6b', '#ddc49a', '#e2bf94', '#d99a7a', '#c7b6a0', '#e9d9b8', '#b98a6a']),
    vila: pal(['#f1ead8', '#e3cfae', '#d6b48c', '#efdcc0', '#e9c9a0', '#f4e6cf', '#dcc29c', '#e7d4b4', '#cfd6d8', '#e6b9a0', '#f0e0c8', '#d8c8b0']),
    poblenou: pal(['#b5654a', '#c97a55', '#e9dcc4', '#d8c3a0', '#a95a43', '#efe6d2', '#cf9f7a', '#d9a27c', '#9c6a58', '#c8b8a4', '#e0c9a6', '#b8785c']),
    torre: pal(['#7fa8c9', '#9cc0d8', '#6f97b8', '#a9c9dc', '#86b3c8', '#9fb9d6', '#7ab0c4', '#b3d0e0', '#6a8fb0', '#a3bfd2', '#8fb6cc', '#b8d2e2']),
    nave: pal(['#d8cdb5', '#c9b48e', '#c3d0d6', '#e2d6bc', '#cbbd9e', '#b9c8cf', '#d6c4a0', '#e4dcc8', '#b8a88c', '#cfd8dc', '#d0c0a0', '#e0d4bc']),
    techo: pal(['#cbb79a', '#c4a888', '#b9805e', '#d2c0a4', '#a8745a', '#c8b494']), techoNave: hex('#a9bcc4'), techoTorre: hex('#5f7f99'), patio: hex('#c9a27e'),
    calle: hex('#4a515c'), avenida: hex('#59626e'), mediana: hex('#5aa030'), acera: hex('#c2b6a0'), parque: pal(['#6ab030', '#5aa02c', '#74bb3c']),
    arbol: pal(['#2f7d32', '#276e2c', '#348a37', '#3d9440']), arena: hex('#ecd9a0'), paseo: hex('#e3d3b0'), ronda: hex('#444c57'), roca: pal(['#8e8a86', '#7a7672', '#9a9690']),
    muelle: hex('#d9cfba'), caseta: pal(['#e6dccb', '#d5c4a8', '#c9b9a4']), deposito: hex('#8fa0aa'), antena: hex('#3a3f48'),
  };

  // ---------- prismas ----------
  const xz = (p) => B.aDibujo(p[0], p[1]);
  const area = (P) => P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0);
  // Un prisma: el polígono convexo `pts` (plano) con sus paredes y su azotea. o = { y0 (de dónde sale), escala (1 para lo que no
  // se dobla, como los cerros), ventanas, semilla (para que cada edificio tenga sus ventanas), tipo de la tapa }.
  function prisma(m, pts, alto, col, techo, o) {
    const { y0 = SUELO, escala = ALTO, ventanas = false, semilla = 0, tipo = T.AZOTEA } = o || {};
    let P = pts.map(xz);
    if (area(P) < 0) P = P.reverse();   // siempre en el mismo sentido, para que la luz sepa hacia dónde mira cada pared
    const y1 = y0 + alto * escala, u0 = 30.4 * Math.floor(GL.h2(semilla, 7, 3) * 300), tapa = FA.por(techo, LUZ.techo);
    for (let i = 0; i < P.length; i++) m.pared(P[i], P[(i + 1) % P.length], y0, y1, col, ventanas ? alto : 0, u0 + i * 30.4);
    for (let i = 1; i + 1 < P.length; i++) m.tri([P[0][0], y1, P[0][1]], [P[i][0], y1, P[i][1]], [P[i + 1][0], y1, P[i + 1][1]], tapa, tipo);
  }
  CI.prisma = prisma;
  const rect = (a, b, w, d) => [[a - w / 2, b - d / 2], [a + w / 2, b - d / 2], [a + w / 2, b + d / 2], [a - w / 2, b + d / 2]];
  const semillaDe = (e) => Math.round(e.pts[0][0] * 3 + e.pts[0][1] * 7);

  function colorDe(e, zona) {
    if (e.tipo === 'torre') return [COL.torre[e.color], COL.techoTorre, true];
    if (e.tipo === 'nave') return [COL.nave[e.color], COL.techoNave, false];
    if (e.tipo === 'patio') return [COL.patio, COL.patio, false];
    const s = Math.abs(semillaDe(e));
    return [(COL[zona] || COL.eixample)[(e.color + (s & 1) * 8) % 12], COL.techo[s % 6], true];
  }
  function edificiosFinos(m, i, k) {
    const z = B.zona(i, k);
    for (const e of B.edificios(i, k)) { const [col, techo, ventanas] = colorDe(e, z); prisma(m, e.pts, e.alto, col, techo, { ventanas, semilla: semillaDe(e) }); }
  }
  // De lejos, la manzana es un bloque octogonal con la altura media de sus edificios.
  function manzanaBasta(m, i, k) {
    const es = B.edificios(i, k).filter((e) => e.tipo !== 'patio');
    if (!es.length) return;
    const c = B.centro(i, k), H = B.MANZANA / 2, L = B.CHAFLAN * Math.SQRT1_2, z = B.zona(i, k);
    const alto = es.reduce((s, e) => s + e.alto, 0) / es.length, [col, techo, ventanas] = colorDe(es[0], z);
    const oct = [[H - L, H], [-H + L, H], [-H, H - L], [-H, -H + L], [-H + L, -H], [H - L, -H], [H, -H + L], [H, H - L]].map(([a, b]) => [c.a + a, c.b + b]);
    prisma(m, oct, alto, col, techo, { ventanas, semilla: i * 131 + k });
  }
  CI.manzanaBasta = manzanaBasta;

  // ---------- el detalle de cerca: azoteas y árboles ----------
  // En la azotea de cada casa: la caseta de la escalera y, a veces, un depósito y una antena.
  function azotea(m, e, n) {
    if (e.tipo !== 'piso' && e.tipo !== 'torre') return;
    const [a, b] = B.media(e.pts), y0 = SUELO + e.alto * ALTO, r = (s) => GL.h2(n, s, 11), caja = { y0, escala: 1, tipo: T.LISA };
    prisma(m, rect(a + (r(1) - 0.5) * 4, b + (r(2) - 0.5) * 4, 4.5, 4), 4.5, COL.caseta[n % 3], COL.caseta[(n + 1) % 3], caja);
    if (r(3) > 0.55) prisma(m, rect(a + (r(4) - 0.5) * 7, b + (r(5) - 0.5) * 7, 2.4, 2.4), 3, COL.deposito, COL.deposito, caja);
    if (r(6) > 0.6) prisma(m, rect(a + (r(7) - 0.5) * 6, b + (r(8) - 0.5) * 6, 0.5, 0.5), 9 + r(9) * 5, COL.antena, COL.antena, caja);
  }
  function arbol(m, a, b, r) {
    const col = COL.arbol[Math.floor(r * 4)], lado = 6.5 + r * 3;
    prisma(m, rect(a, b, lado, lado), 9 + r * 5, col, col, { y0: SUELO + 4, escala: 1, tipo: T.LISA });
  }
  function arbolesDe(m, i, k) {
    const c = B.centro(i, k), H = B.MANZANA / 2 + 4, z = B.zona(i, k);
    let n = 0;
    const r = () => GL.h2(i * 31 + n, k * 17 + n++, 5);
    if (z === 'parque' || z === 'plaza') {
      for (let a = -H + 8; a < H - 4; a += 13) for (let b = -H + 8; b < H - 4; b += 13) if (r() > 0.35) arbol(m, c.a + a + r() * 5, c.b + b + r() * 5, r());
      return;
    }
    if (z === 'ronda' || z === 'templo') return;
    for (let t = -H + 10; t < H - 8; t += 14) for (const [a, b] of [[t, -H], [t, H], [-H, t], [H, t]]) if (!B.enAvenida(c.a + a, c.b + b)) arbol(m, c.a + a, c.b + b, r());
  }
  function detalleDe(m, i, k) {
    arbolesDe(m, i, k);
    B.edificios(i, k).forEach((e, n) => azotea(m, e, Math.abs(i * 977 + k * 131) + n));
  }

  // ---------- el suelo ----------
  // Un rectángulo del plano tumbado en el suelo (y metros por encima). tipo CALLE lleva marcas y farolas.
  function llano(m, a0, b0, a1, b1, col, y, tipo, luz) {
    const p = [[a0, b0], [a1, b0], [a1, b1], [a0, b1]].map(xz), h = SUELO + (y || 0);
    m.cuadro(...p.map((q) => [q[0], h, q[1]]), FA.por(col, luz || LUZ.suelo), tipo);
  }
  CI.llano = llano;
  function franjaAvenida(m, av, largo) {
    const { p, d } = av, n = [-d.b, d.a], w = av.ancho / 2;
    const pt = (t, s) => xz([p.a + d.a * t + n[0] * s, p.b + d.b * t + n[1] * s]);
    const q = (s0, s1, col, y) => { const a = pt(-largo, s0), b = pt(largo, s0), c = pt(largo, s1), e = pt(-largo, s1), h = SUELO + y; m.cuadro([a[0], h, a[1]], [b[0], h, b[1]], [c[0], h, c[1]], [e[0], h, e[1]], FA.por(col, LUZ.suelo)); };
    q(-w, w, COL.avenida, 0.05); q(-3.5, 3.5, COL.mediana, 0.1);
  }
  const bloque = (m, pts, alto, col, techo) => prisma(m, pts, alto, col, techo, { escala: 1, tipo: T.LISA });
  function costa(m, R) {
    const a0 = B.centro(R.i0, 0).a - 80, a1 = B.centro(R.i1, 0).a + 80, C = B.COSTA, pu = C.puerto, e = C.espigon;
    llano(m, a0, B.RONDA, a1, C.paseo, COL.ronda, 0.05);
    llano(m, a0, C.paseo, a1, C.playa, COL.paseo, 0.1, T.LISA, LUZ.lisa);   // la playa y el paseo, abiertos al sol bajo
    llano(m, a0, C.playa, a1, C.mar, COL.arena, 0, T.LISA, LUZ.lisa);
    for (let a = pu.a1 + 260; a < a1; a += e.cada) bloque(m, [[a, C.playa], [a + e.ancho, C.playa], [a + e.ancho, C.mar + e.largo], [a, C.mar + e.largo]], 2.2, COL.roca[0], COL.roca[2]);
    // El Port Olímpic: dique de fuera, los dos lados (con la bocana al este) y dos muelles dentro.
    bloque(m, [[pu.a0, pu.b1 - 22], [pu.a1, pu.b1 - 22], [pu.a1, pu.b1], [pu.a0, pu.b1]], 4, COL.roca[1], COL.roca[2]);
    bloque(m, [[pu.a0, C.mar - 10], [pu.a0 + 24, C.mar - 10], [pu.a0 + 24, pu.b1], [pu.a0, pu.b1]], 4, COL.roca[1], COL.roca[2]);
    bloque(m, [[pu.a1 - 24, C.mar - 10], [pu.a1, C.mar - 10], [pu.a1, pu.b1 - 110], [pu.a1 - 24, pu.b1 - 110]], 4, COL.roca[1], COL.roca[2]);
    for (const a of [pu.a0 + 130, pu.a0 + 260]) bloque(m, [[a, C.mar - 10], [a + 26, C.mar - 10], [a + 26, pu.b1 - 120], [a, pu.b1 - 120]], 1.6, COL.muelle, COL.muelle);
  }
  function suelo(R) {
    const m = new FA.Malla(), a0 = B.centro(R.i0, 0).a - 80, a1 = B.centro(R.i1, 0).a + 80, b0 = B.centro(0, R.k0).b - 80;
    llano(m, a0, b0, a1, B.RONDA, COL.calle, 0, T.CALLE);
    for (const av of B.AVENIDAS) franjaAvenida(m, av, 4200);
    for (let i = R.i0; i <= R.i1; i++) for (let k = R.k0; k <= R.k1; k++) {
      const z = B.zona(i, k), c = B.centro(i, k), H = B.MANZANA / 2;
      if (z === 'ronda') continue;
      llano(m, c.a - H, c.b - H, c.a + H, c.b + H, z === 'parque' || z === 'plaza' ? COL.parque[(i + k) & 1] : COL.acera, 0.15);
    }
    costa(m, R);
    return m.subir();
  }

  // ---------- crear ----------
  CI.crear = function () {
    if (CI.listo) return;
    const t0 = performance.now(), R = B.TRAMA;
    FA.crear(); FA.triangulos = 0;
    CI.suelo = suelo(R);
    for (let bi = R.i0; bi <= R.i1; bi += LADO_BALDOSA) for (let bk = R.k0; bk <= R.k1; bk += LADO_BALDOSA) CI.baldosas.push(baldosa(bi, bk, R));
    A.monumentos.crear();
    CI.sueloLejos = A.afueras.crear(CI.baldosas);
    CI.triangulos = FA.triangulos;
    CI.listo = true;
    CI.ms = Math.round(performance.now() - t0);
  };
  function baldosa(bi, bk, R) {
    const fina = new FA.Malla(), basta = new FA.Malla(), detalle = new FA.Malla();
    for (let i = bi; i < Math.min(bi + LADO_BALDOSA, R.i1 + 1); i++) for (let k = bk; k < Math.min(bk + LADO_BALDOSA, R.k1 + 1); k++) {
      edificiosFinos(fina, i, k); manzanaBasta(basta, i, k); detalleDe(detalle, i, k);
    }
    const c = B.centro(bi + (LADO_BALDOSA - 1) / 2, bk + (LADO_BALDOSA - 1) / 2), [x, z] = B.aDibujo(c.a, c.b);
    return { c: [x, 20, z], radio: B.PASO * LADO_BALDOSA * 0.75, fina: fina.subir(), basta: basta.subir(), detalle: detalle.subir() };
  }

  // ---------- dibujar ----------
  // Detrás de la cámara (con margen para el radio de la baldosa): no se pinta.
  const detras = (b, cam) => (b.c[0] - cam.ojo[0]) * cam.ejes.f[0] + (b.c[1] - cam.ojo[1]) * cam.ejes.f[1] + (b.c[2] - cam.ojo[2]) * cam.ejes.f[2] < -b.radio;
  // La ciudad entera con esta cámara (t = segundos, para el tráfico). Deja puesto el programa de las mallas, para lo que venga detrás.
  CI.dibujar = function (cam, t) {
    if (!CI.listo) return;
    FA.empieza(cam);
    FA.pinta(CI.sueloLejos); FA.pinta(CI.suelo);
    for (const b of CI.baldosas) {
      if (detras(b, cam)) continue;
      const d = V.dist(b.c, cam.ojo) - b.radio;
      FA.pinta(d < CERCA_EDIFICIOS ? b.fina : b.basta);
      if (d < CERCA_DETALLE) FA.pinta(b.detalle);
    }
    A.trafico.dibujar(cam, t);
    FA.acaba();
    GL.empiezaMallas(cam.VP, cam.ojo);
    CI.pintados = FA.pintados + A.monumentos.dibujar(cam);
  };
})(WINGS);
