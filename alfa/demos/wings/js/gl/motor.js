// Fans of Wings · Motor de dibujo 3D (WebGL, sin librerías): vectores y matrices, el programa que pinta las mallas con niebla,
// las mallas de «lonchas apiladas» (una rejilla de cubitos donde cada piso es una loncha y solo se dibujan las caras que dan al
// aire) y un lote para lo que cambia en cada imagen (balas, humo, explosiones, estelas). Las coordenadas de dibujo son las del
// dominio con el norte hacia −Z: GL.R(p) convierte un punto {x, y, z} del dominio.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl = { gl: null, W: 0, H: 0 };
  let gl = null;

  const V = GL.V = {
    suma: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    resta: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    por: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
    cruz: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    largo: (a) => Math.hypot(a[0], a[1], a[2]),
    norma: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
    mezcla: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
    dist: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]),
  };
  GL.R = (p) => [p.x, p.y, -p.z];

  const M = GL.M = {
    mul(a, b) {
      const o = new Float32Array(16);
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      return o;
    },
    varias(...ms) { return ms.reduce((a, b) => M.mul(a, b)); },
    T: (x, y, z) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]),
    S: (x, y, z) => new Float32Array([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]),
    RY(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); },
    persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]); },
    // La cámara: desde `e` mirando a `t`. Devuelve la matriz y sus tres ejes (s derecha, u arriba, f al frente).
    mira(e, t, arriba) {
      const f = V.norma(V.resta(t, e)), s = V.norma(V.cruz(f, arriba)), u = V.cruz(s, f);
      const m = new Float32Array([s[0], u[0], -f[0], 0, s[1], u[1], -f[1], 0, s[2], u[2], -f[2], 0,
        -(s[0] * e[0] + s[1] * e[1] + s[2] * e[2]), -(u[0] * e[0] + u[1] * e[1] + u[2] * e[2]), f[0] * e[0] + f[1] * e[1] + f[2] * e[2], 1]);
      return { m, s, u, f };
    },
    // Un objeto colocado en `p` con sus ejes (derecha, arriba, frente), todo en coordenadas de dibujo; el morro del modelo mira a −Z.
    ejes(p, r, u, f, k) {
      const e = k || 1;
      return new Float32Array([r[0] * e, r[1] * e, r[2] * e, 0, u[0] * e, u[1] * e, u[2] * e, 0, -f[0] * e, -f[1] * e, -f[2] * e, 0, p[0], p[1], p[2], 1]);
    },
    punto: (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]],
  };

  GL.hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  GL.tono = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

  // Azar con semilla y ruido suave (para que el mundo salga siempre igual).
  GL.azar = function (sem) {
    let a = sem >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  const h2 = GL.h2 = function (i, j, s) { let h = (i * 73856093) ^ (j * 19349663) ^ (s * 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  GL.ruido = function (x, y, s) {
    const i = Math.floor(x), j = Math.floor(y); let fx = x - i, fy = y - j; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const a = h2(i, j, s), b = h2(i + 1, j, s), c = h2(i, j + 1, s), d = h2(i + 1, j + 1, s);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };

  // ---------- programas ----------
  GL.NIEBLA = 'float niebla(float d){ return floor(smoothstep(3000.0,9500.0,d)*12.0)/12.0; } const vec3 BRUMA=vec3(0.78,0.90,0.98);';
  GL.programa = function (vs, fs) {
    const p = gl.createProgram();
    for (const [tipo, codigo] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const sh = gl.createShader(tipo); gl.shaderSource(sh, codigo); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error('Wings: programa de dibujo: ' + gl.getShaderInfoLog(sh));
      gl.attachShader(p, sh);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Wings: programa de dibujo: ' + gl.getProgramInfoLog(p));
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const nombre = gl.getActiveUniform(p, i).name; u[nombre] = gl.getUniformLocation(p, nombre); }
    return { p, u };
  };

  let pMalla = null, aPos = 0, aCol = 0;
  GL.iniciar = function (lienzo) {
    gl = GL.gl = lienzo.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) return false;
    GL.alta = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0 ? 'highp' : 'mediump';
    pMalla = GL.programa(
      'attribute vec3 aPos; attribute vec3 aCol; uniform mat4 uM,uVP; uniform vec3 uOjo; varying vec3 vCol; varying float vD;' +
      'void main(){ vec4 w=uM*vec4(aPos,1.0); vD=distance(w.xyz,uOjo); vCol=aCol; gl_Position=uVP*w; }',
      'precision ' + GL.alta + ' float; varying vec3 vCol; varying float vD; uniform vec3 uTinte; uniform float uSombra,uNiebla;' + GL.NIEBLA +
      'void main(){ vec3 c = uSombra>0.5 ? vec3(0.07,0.31,0.64) : min(vCol*uTinte,vec3(1.0)); gl_FragColor=vec4(mix(c,BRUMA,niebla(vD)*uNiebla),1.0); }');
    aPos = gl.getAttribLocation(pMalla.p, 'aPos'); aCol = gl.getAttribLocation(pMalla.p, 'aCol');
    gl.disable(gl.CULL_FACE);
    return true;
  };
  GL.medida = function (w, h) { GL.W = w; GL.H = h; gl.canvas.width = w; gl.canvas.height = h; gl.viewport(0, 0, w, h); };

  // Empieza a pintar mallas con esta cámara. Después: GL.malla(...) las veces que haga falta.
  GL.empiezaMallas = function (VP, ojo) {
    gl.useProgram(pMalla.p); gl.enableVertexAttribArray(aPos); gl.enableVertexAttribArray(aCol);
    gl.uniformMatrix4fv(pMalla.u.uVP, false, VP); gl.uniform3fv(pMalla.u.uOjo, ojo);
    GL.tinte(1, 1, 1); gl.uniform1f(pMalla.u.uNiebla, 1);
  };
  GL.tinte = (r, g, b) => gl.uniform3f(pMalla.u.uTinte, r, g, b);
  GL.conNiebla = (si) => gl.uniform1f(pMalla.u.uNiebla, si ? 1 : 0);
  function atributos() { gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 24, 0); gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 24, 12); }
  GL.malla = function (m, matriz, sombra) {
    gl.bindBuffer(gl.ARRAY_BUFFER, m.buf); atributos();
    gl.uniformMatrix4fv(pMalla.u.uM, false, matriz); gl.uniform1f(pMalla.u.uSombra, sombra ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, m.n);
  };

  // ---------- mallas ----------
  // Una malla en construcción: caras de cuatro esquinas con un color y un brillo (k).
  class Malla {
    constructor() { this.d = []; }
    cara(a, b, c, d, col, k) {
      const r = col[0] * k, g = col[1] * k, bl = col[2] * k, D = this.d;
      D.push(a[0], a[1], a[2], r, g, bl, b[0], b[1], b[2], r, g, bl, c[0], c[1], c[2], r, g, bl, a[0], a[1], a[2], r, g, bl, c[0], c[1], c[2], r, g, bl, d[0], d[1], d[2], r, g, bl);
    }
    subir() {
      const buf = gl.createBuffer(), n = this.d.length / 6;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.d), gl.STATIC_DRAW);
      this.d = null;
      return { buf, n };
    }
  }
  GL.Malla = Malla;

  // El brillo de cada cara de un cubito: [arriba, abajo, este, oeste, sur, norte].
  const BRILLO = [1, 0.58, 0.86, 0.68, 0.76, 0.92];
  function carasDeCubito(m, hay, x, y, z, c, caja) {
    const [x0, x1, y0, y1, z0, z1] = caja, k = (y & 1) ? 0.965 : 1;   // las lonchas se alternan un pelín para que se note el apilado
    if (!hay(x, y + 1, z)) m.cara([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], c, BRILLO[0] * k);
    if (!hay(x, y - 1, z)) m.cara([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], c, BRILLO[1] * k);
    if (!hay(x + 1, y, z)) m.cara([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], c, BRILLO[2] * k);
    if (!hay(x - 1, y, z)) m.cara([x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1], c, BRILLO[3] * k);
    if (!hay(x, y, z + 1)) m.cara([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], c, BRILLO[4] * k);
    if (!hay(x, y, z - 1)) m.cara([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], c, BRILLO[5] * k);
  }
  // Rejilla de nx·ny·nz cubitos de tamaño `vox` [ancho, alto, largo], centrada en X y Z, con el piso 0 en la altura `dy`.
  // color(x, y, z) devuelve [r, g, b] o null si ahí no hay nada.
  GL.cubitos = function (nx, ny, nz, { vox = [1, 1, 1], dy = 0, color }) {
    const R = new Array(nx * ny * nz), id = (x, y, z) => x + nx * (y + ny * z);
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) R[id(x, y, z)] = color(x, y, z);
    const hay = (x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < nx && y < ny && z < nz && !!R[id(x, y, z)], m = new Malla();
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const c = R[id(x, y, z)];
      if (!c) continue;
      const x0 = (x - nx / 2) * vox[0], y0 = y * vox[1] + dy, z0 = (z - nz / 2) * vox[2];
      carasDeCubito(m, hay, x, y, z, c, [x0, x0 + vox[0], y0, y0 + vox[1], z0, z0 + vox[2]]);
    }
    return m.subir();
  };

  // ---------- lote: lo que cambia en cada imagen ----------
  const lote = { d: [], buf: null };
  const CUBO = [   // las seis caras de un cubo de lado 1 centrado, con su brillo
    [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1], 1], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], 0.58],
    [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1], 0.86], [[-1, -1, -1], [-1, 1, -1], [-1, 1, 1], [-1, -1, 1], 0.68],
    [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1], 0.76], [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], 0.92]];
  GL.cubo = function (c, lado, col) {
    const h = lado / 2, D = lote.d;
    for (const [a, b, e, f, k] of CUBO) for (const v of [a, b, e, a, e, f]) D.push(c[0] + v[0] * h, c[1] + v[1] * h, c[2] + v[2] * h, col[0] * k, col[1] * k, col[2] * k);
  };
  GL.cuadro = function (a, b, c, d, col) { for (const v of [a, b, c, a, c, d]) lote.d.push(v[0], v[1], v[2], col[0], col[1], col[2]); };
  GL.pintaLote = function () {
    if (!lote.d.length) return;
    lote.buf = lote.buf || gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lote.buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lote.d), gl.DYNAMIC_DRAW); atributos();
    gl.uniformMatrix4fv(pMalla.u.uM, false, M.T(0, 0, 0)); gl.uniform1f(pMalla.u.uSombra, 0);
    gl.drawArrays(gl.TRIANGLES, 0, lote.d.length / 6);
    lote.d = [];
  };
})(WINGS);
