// Fans of Wings · La ciudad de Barcelona en dibujo (boceto de la tarea #99): convierte el plano de barcelona.js en mallas. Cada
// edificio es un prisma con sus lonchas (una por planta, alternando el tono) y las ventanas las pinta el propio programa de dibujo
// según la altura y el largo de la pared, así que cuestan cero triángulos. La ciudad va en baldosas de 4 × 4 manzanas con tres
// tallas: árboles (solo cerca), edificios con solares y un bloque por manzana para lo lejano; las baldosas detrás de la cámara no
// se pintan. El suelo (calles, avenidas, plazas, playa, puerto y espigones) es una malla aparte. Los monumentos, en monumentos.js.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl, V = GL.V, hex = GL.hex, B = A.barcelona;
  const CI = A.ciudad = { baldosas: [], suelo: null, sueloLejos: null, listo: false, triangulos: 0, pintados: 0, ms: 0 };
  let gl = null, prog = null, at = null;
  const SUELO = 0.6, CERCA_ARBOLES = 950, CERCA_EDIFICIOS = 2100, LADO_BALDOSA = 4;

  const pal = (l) => l.map(hex);
  const COL = {
    eixample: pal(['#e8d3a8', '#d9b98a', '#e6c7b0', '#cfa27a', '#f0e2c4', '#c98f6b', '#ddc49a', '#e2bf94']),
    vila: pal(['#f1ead8', '#e3cfae', '#d6b48c', '#efdcc0', '#e9c9a0', '#f4e6cf', '#dcc29c', '#e7d4b4']),
    poblenou: pal(['#b5654a', '#c97a55', '#e9dcc4', '#d8c3a0', '#a95a43', '#efe6d2', '#cf9f7a', '#d9a27c']),
    torre: pal(['#7fa8c9', '#9cc0d8', '#6f97b8', '#a9c9dc', '#86b3c8', '#9fb9d6', '#7ab0c4', '#b3d0e0']),
    nave: pal(['#d8cdb5', '#c9b48e', '#c3d0d6', '#e2d6bc', '#cbbd9e', '#b9c8cf', '#d6c4a0', '#e4dcc8']),
    techo: hex('#cbb79a'), techoNave: hex('#a9bcc4'), techoTorre: hex('#5f7f99'), patio: hex('#c9a27e'),
    calle: hex('#5b6470'), avenida: hex('#646e7b'), mediana: hex('#6dbb34'), acera: hex('#cfc3ad'), parque: pal(['#7cc63a', '#6dbb34', '#86cf45']),
    arbol: pal(['#2f7d32', '#276e2c', '#348a37', '#3d9440']), arena: hex('#ecd9a0'), paseo: hex('#e3d3b0'), ronda: hex('#4f5864'), roca: pal(['#8e8a86', '#7a7672', '#9a9690']),
    muelle: hex('#d9cfba'),
  };
  // El brillo de cada pared según hacia dónde mira (como las caras de los cubitos de motor.js).
  const brillo = (nx, nz) => 0.77 + nx * 0.09 + nz * 0.05;

  // ---------- el programa: como el de las mallas, más las lonchas y las ventanas ----------
  function programa() {
    return GL.programa(
      'attribute vec3 aPos; attribute vec3 aCol; attribute vec2 aUV; uniform mat4 uVP; uniform vec3 uOjo; varying vec3 vCol; varying vec2 vUV; varying float vD;' +
      'void main(){ vD=distance(aPos,uOjo); vCol=aCol; vUV=aUV; gl_Position=uVP*vec4(aPos,1.0); }',
      'precision ' + GL.alta + ' float; varying vec3 vCol; varying vec2 vUV; varying float vD; uniform float uNiebla;' + GL.NIEBLA +
      'float h1(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }' +
      'void main(){ vec3 c=vCol;' +
      ' if(vUV.y>=0.0){ float piso=floor(vUV.y/3.4), fy=fract(vUV.y/3.4), col=floor(vUV.x/3.8), fx=fract(vUV.x/3.8), lejos=smoothstep(450.0,1500.0,vD);' +
      '  if(mod(piso,2.0)>0.5) c*=0.95;' +                                                            // las lonchas, una por planta
      '  if(piso<0.5 && fy<0.8) c*=0.66;' +                                                           // los bajos (tiendas)
      '  else if(fy>0.3 && fy<0.8 && fx>0.22 && fx<0.78){ float r=h1(vec2(col,piso)+floor(vUV.x/97.0));' +
      '   vec3 v = r>0.86 ? vec3(0.66,0.83,0.96) : (r>0.7 ? vec3(0.95,0.86,0.62) : vec3(0.17,0.28,0.43));' +   // cielo, persiana o cristal
      '   c=mix(v*min(1.0,vCol.r*1.4+0.3),c*0.86,lejos); } }' +
      ' gl_FragColor=vec4(mix(c,BRUMA,niebla(vD)*uNiebla),1.0); }');
  }

  // ---------- construir mallas ----------
  class Malla {
    constructor() { this.d = []; }
    v(p, c, u, w) { this.d.push(p[0], p[1], p[2], c[0], c[1], c[2], u, w); }
    tri(a, b, c, col, k, uv) { const q = GL.tono(col, k); for (const p of [a, b, c]) this.v(p, q, uv ? uv[0] : -1, uv ? uv[1] : -1); }
    cuadro(a, b, c, d, col, k) { this.tri(a, b, c, col, k); this.tri(a, c, d, col, k); }
    // Una pared de p a q (en x, z) entre y0 e y1, con las ventanas medidas desde y0.
    pared(p, q, y0, y1, col, conVentanas) {
      const nx = q[1] - p[1], nz = -(q[0] - p[0]), l = Math.hypot(nx, nz) || 1, cc = GL.tono(col, brillo(nx / l, nz / l)), h = y1 - y0;
      const A0 = [p[0], y0, p[1]], A1 = [q[0], y0, q[1]], B1 = [q[0], y1, q[1]], B0 = [p[0], y1, p[1]];
      const u = (x, uv) => this.v(x, cc, conVentanas ? uv[0] : -1, conVentanas ? uv[1] : -1);
      u(A0, [0, 0]); u(A1, [l, 0]); u(B1, [l, h]); u(A0, [0, 0]); u(B1, [l, h]); u(B0, [0, h]);
    }
    subir() {
      if (!this.d.length) return null;
      const buf = gl.createBuffer(), n = this.d.length / 8;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.d), gl.STATIC_DRAW);
      this.d = null;
      CI.triangulos += n / 3;
      return { buf, n };
    }
  }
  CI.Malla = Malla;
  CI.SUELO = SUELO;

  const xz = (p) => B.aDibujo(p[0], p[1]);
  CI.COL = COL;
  // Un prisma: el polígono convexo `pts` (plano) de SUELO a SUELO + alto, con sus paredes y su techo.
  function prisma(m, pts, alto, col, techo, conVentanas) {
    const P = pts.map(xz), y1 = SUELO + alto;
    for (let i = 0; i < P.length; i++) m.pared(P[i], P[(i + 1) % P.length], SUELO, y1, col, conVentanas);
    for (let i = 1; i + 1 < P.length; i++) m.tri([P[0][0], y1, P[0][1]], [P[i][0], y1, P[i][1]], [P[i + 1][0], y1, P[i + 1][1]], techo, 1);
  }
  function colorDe(e, zona) {
    if (e.tipo === 'torre') return [COL.torre[e.color], COL.techoTorre, true];
    if (e.tipo === 'nave') return [COL.nave[e.color], COL.techoNave, false];
    if (e.tipo === 'patio') return [COL.patio, COL.patio, false];
    return [(COL[zona] || COL.eixample)[e.color], COL.techo, true];
  }
  function edificiosFinos(m, i, k) {
    const z = B.zona(i, k);
    for (const e of B.edificios(i, k)) { const [col, techo, ven] = colorDe(e, z); prisma(m, e.pts, e.alto, col, techo, ven); }
  }
  // De lejos, la manzana es un bloque octogonal con la altura media de sus edificios.
  function manzanaBasta(m, i, k) {
    const es = B.edificios(i, k).filter((e) => e.tipo !== 'patio');
    if (!es.length) return;
    const c = B.centro(i, k), H = B.MANZANA / 2, L = B.CHAFLAN * Math.SQRT1_2, z = B.zona(i, k);
    const alto = es.reduce((s, e) => s + e.alto, 0) / es.length, [col, techo] = colorDe(es[0], z);
    const oct = [[H - L, H], [-H + L, H], [-H, H - L], [-H, -H + L], [-H + L, -H], [H - L, -H], [H, -H + L], [H, H - L]].map(([a, b]) => [c.a + a, c.b + b]);
    prisma(m, oct, alto, col, techo, true);
  }
  CI.prisma = prisma; CI.manzanaBasta = manzanaBasta;
  // Árboles en las aceras (cada 11 m, a 4 m del bordillo) y, en los parques, por todo el suelo.
  function arbol(m, a, b, r) {
    const [x, z] = xz([a, b]), s = 2.6 + r * 1.2, y0 = SUELO + 3, y1 = y0 + 4 + r * 2, col = COL.arbol[Math.floor(r * 4)];
    const c = [[x - s, z - s], [x + s, z - s], [x + s, z + s], [x - s, z + s]];
    for (let q = 0; q < 4; q++) m.pared(c[q], c[(q + 1) % 4], y0, y1, col, false);
    m.cuadro([c[0][0], y1, c[0][1]], [c[1][0], y1, c[1][1]], [c[2][0], y1, c[2][1]], [c[3][0], y1, c[3][1]], col, 1.05);
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
    for (let t = -H + 10; t < H - 8; t += 11) for (const [a, b] of [[t, -H], [t, H], [-H, t], [H, t]]) if (!B.enAvenida(c.a + a, c.b + b)) arbol(m, c.a + a, c.b + b, r());
  }

  // ---------- el suelo ----------
  const llano = (m, a0, b0, a1, b1, col, y) => { const p = [[a0, b0], [a1, b0], [a1, b1], [a0, b1]].map(xz), h = SUELO + (y || 0); m.cuadro(...p.map((q) => [q[0], h, q[1]]), col, 1); };
  function franjaAvenida(m, av, largo) {
    const { p, d } = av, n = [-d.b, d.a], w = av.ancho / 2;
    const pt = (t, s) => xz([p.a + d.a * t + n[0] * s, p.b + d.b * t + n[1] * s]);
    const q = (s0, s1, col, y) => { const a = pt(-largo, s0), b = pt(largo, s0), c = pt(largo, s1), e = pt(-largo, s1), h = SUELO + y; m.cuadro([a[0], h, a[1]], [b[0], h, b[1]], [c[0], h, c[1]], [e[0], h, e[1]], col, 1); };
    q(-w, w, COL.avenida, 0.05); q(-3, 3, COL.mediana, 0.1);
  }
  function costa(m, T) {
    const a0 = B.centro(T.i0, 0).a - 80, a1 = B.centro(T.i1, 0).a + 80, C = B.COSTA, pu = C.puerto, e = C.espigon;
    llano(m, a0, B.RONDA, a1, C.paseo, COL.ronda, 0.05);
    llano(m, a0, C.paseo, a1, C.playa, COL.paseo, 0.1);
    llano(m, a0, C.playa, a1, C.mar, COL.arena, 0);
    for (let a = pu.a1 + 260; a < a1; a += e.cada) prisma(m, [[a, C.playa], [a + e.ancho, C.playa], [a + e.ancho, C.mar + e.largo], [a, C.mar + e.largo]], 2.2, COL.roca[0], COL.roca[2], false);
    // El Port Olímpic: dique de fuera, los dos lados (con la bocana al este) y dos muelles dentro.
    prisma(m, [[pu.a0, pu.b1 - 22], [pu.a1, pu.b1 - 22], [pu.a1, pu.b1], [pu.a0, pu.b1]], 4, COL.roca[1], COL.roca[2], false);
    prisma(m, [[pu.a0, C.mar - 10], [pu.a0 + 24, C.mar - 10], [pu.a0 + 24, pu.b1], [pu.a0, pu.b1]], 4, COL.roca[1], COL.roca[2], false);
    prisma(m, [[pu.a1 - 24, C.mar - 10], [pu.a1, C.mar - 10], [pu.a1, pu.b1 - 110], [pu.a1 - 24, pu.b1 - 110]], 4, COL.roca[1], COL.roca[2], false);
    for (const a of [pu.a0 + 130, pu.a0 + 260]) prisma(m, [[a, C.mar - 10], [a + 26, C.mar - 10], [a + 26, pu.b1 - 120], [a, pu.b1 - 120]], 1.6, COL.muelle, COL.muelle, false);
  }
  function suelo(T) {
    const m = new Malla(), a0 = B.centro(T.i0, 0).a - 80, a1 = B.centro(T.i1, 0).a + 80, b0 = B.centro(0, T.k0).b - 80;
    llano(m, a0, b0, a1, B.RONDA, COL.calle, 0);
    for (const av of B.AVENIDAS) franjaAvenida(m, av, 4200);
    for (let i = T.i0; i <= T.i1; i++) for (let k = T.k0; k <= T.k1; k++) {
      const z = B.zona(i, k), c = B.centro(i, k), H = B.MANZANA / 2;
      if (z === 'ronda') continue;
      llano(m, c.a - H, c.b - H, c.a + H, c.b + H, z === 'parque' || z === 'plaza' ? COL.parque[(i + k) & 1] : COL.acera, 0.15);
    }
    costa(m, T);
    return m.subir();
  }

  // ---------- crear ----------
  CI.crear = function () {
    if (CI.listo) return;
    const t0 = performance.now(), T = B.TRAMA;
    gl = GL.gl; prog = programa();
    at = { pos: gl.getAttribLocation(prog.p, 'aPos'), col: gl.getAttribLocation(prog.p, 'aCol'), uv: gl.getAttribLocation(prog.p, 'aUV') };
    CI.triangulos = 0;
    CI.suelo = suelo(T);
    for (let bi = T.i0; bi <= T.i1; bi += LADO_BALDOSA) for (let bk = T.k0; bk <= T.k1; bk += LADO_BALDOSA) CI.baldosas.push(baldosa(bi, bk, T));
    A.monumentos.crear();
    CI.sueloLejos = A.afueras.crear(CI.baldosas);
    CI.listo = true;
    CI.ms = Math.round(performance.now() - t0);
  };
  function baldosa(bi, bk, T) {
    const fina = new Malla(), basta = new Malla(), arboles = new Malla();
    for (let i = bi; i < Math.min(bi + LADO_BALDOSA, T.i1 + 1); i++) for (let k = bk; k < Math.min(bk + LADO_BALDOSA, T.k1 + 1); k++) {
      edificiosFinos(fina, i, k); manzanaBasta(basta, i, k); arbolesDe(arboles, i, k);
    }
    const c = B.centro(bi + (LADO_BALDOSA - 1) / 2, bk + (LADO_BALDOSA - 1) / 2), [x, z] = B.aDibujo(c.a, c.b);
    return { c: [x, 20, z], radio: B.PASO * LADO_BALDOSA * 0.75, fina: fina.subir(), basta: basta.subir(), arboles: arboles.subir() };
  }

  // ---------- dibujar ----------
  function pinta(m) {
    if (!m) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, m.buf);
    gl.vertexAttribPointer(at.pos, 3, gl.FLOAT, false, 32, 0); gl.vertexAttribPointer(at.col, 3, gl.FLOAT, false, 32, 12); gl.vertexAttribPointer(at.uv, 2, gl.FLOAT, false, 32, 24);
    gl.drawArrays(gl.TRIANGLES, 0, m.n);
    CI.pintados += m.n / 3;
  }
  // Detrás de la cámara (con margen para el radio de la baldosa): no se pinta.
  const detras = (b, cam) => (b.c[0] - cam.ojo[0]) * cam.ejes.f[0] + (b.c[1] - cam.ojo[1]) * cam.ejes.f[1] + (b.c[2] - cam.ojo[2]) * cam.ejes.f[2] < -b.radio;
  // La ciudad entera con esta cámara. Deja puesto el programa de las mallas (para los monumentos y lo que venga detrás).
  CI.dibujar = function (cam) {
    if (!CI.listo) return;
    CI.pintados = 0;
    gl.useProgram(prog.p); gl.enableVertexAttribArray(at.pos); gl.enableVertexAttribArray(at.col); gl.enableVertexAttribArray(at.uv);
    gl.uniformMatrix4fv(prog.u.uVP, false, cam.VP); gl.uniform3fv(prog.u.uOjo, cam.ojo); gl.uniform1f(prog.u.uNiebla, 1);
    pinta(CI.sueloLejos); pinta(CI.suelo);
    for (const b of CI.baldosas) {
      if (detras(b, cam)) continue;
      const d = V.dist(b.c, cam.ojo) - b.radio;
      pinta(d < CERCA_EDIFICIOS ? b.fina : b.basta);
      if (d < CERCA_ARBOLES) pinta(b.arboles);
    }
    gl.disableVertexAttribArray(at.uv);
    GL.empiezaMallas(cam.VP, cam.ojo);
    CI.pintados += A.monumentos.dibujar(cam);
  };
})(WINGS);
