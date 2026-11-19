// Fans of Spy · ADAPTADORES · Motor de dibujo 3D (WebGL, sin librerías; ADR 135): matrices, el programa que pinta las mallas con
// sombreado de cómic (la luz en tres escalones), el contorno negro (cada malla se pinta otra vez un poco hinchada y del revés),
// la penumbra del parking con los charcos de luz de sus focos y la niebla del fondo; y un lote para lo translúcido que cambia en
// cada imagen (conos de visión, casillas marcadas, ondas de ruido, sombras). Cada vértice de malla lleva 13 números: posición (3),
// normal (3), color (3), brillo propio (1) y la dirección hacia la que se hincha el contorno (3); las mallas con textura de los
// .glb (texturas.js) llevan además su UV (2) y se pintan con un segundo programa hecho de la misma plantilla.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const GL = S.gl = { gl: null, W: 1, H: 1, POR_VERTICE: 13 };
  let gl = null, PT = null, PX = null, PL = null, bufLote = null;   // PT: mallas de color; PX: mallas con textura; PL: el lote
  const LOTE = { v: new Float32Array(7 * 9000), n: 0 };

  // ---------- matrices 4x4, por columnas (como las quiere WebGL) ----------
  const M = GL.M = {
    ident: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    mul(a, b) {
      const o = new Float32Array(16);
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      return o;
    },
    une: (...ms) => ms.reduce((a, b) => M.mul(a, b)),
    traslada(x, y, z) { const o = M.ident(); o[12] = x; o[13] = y; o[14] = z; return o; },
    escala(x, y, z) { const o = M.ident(); o[0] = x; o[5] = y; o[10] = z; return o; },
    rotaX(a) { const o = M.ident(), c = Math.cos(a), s = Math.sin(a); o[5] = c; o[6] = s; o[9] = -s; o[10] = c; return o; },
    rotaY(a) { const o = M.ident(), c = Math.cos(a), s = Math.sin(a); o[0] = c; o[2] = -s; o[8] = s; o[10] = c; return o; },
    rotaZ(a) { const o = M.ident(), c = Math.cos(a), s = Math.sin(a); o[0] = c; o[1] = s; o[4] = -s; o[5] = c; return o; },
    perspectiva(fov, aspecto, cerca, lejos) {
      const f = 1 / Math.tan(fov / 2), o = new Float32Array(16);
      o[0] = f / aspecto; o[5] = f; o[10] = (lejos + cerca) / (cerca - lejos); o[11] = -1; o[14] = 2 * lejos * cerca / (cerca - lejos);
      return o;
    },
    mira(ojo, centro) {
      const z = norma([ojo[0] - centro[0], ojo[1] - centro[1], ojo[2] - centro[2]]), x = norma(cruz([0, 1, 0], z)), y = cruz(z, x);
      return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -punto3(x, ojo), -punto3(y, ojo), -punto3(z, ojo), 1]);
    },
    // El punto (x, y, z, 1) pasado por la matriz: [x, y, z, w].
    punto(m, x, y, z) { return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14], m[3] * x + m[7] * y + m[11] * z + m[15]]; },
    invierte,
  };
  const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const punto3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norma = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  GL.V = { cruz, punto3, norma };

  // La inversa de una matriz 4x4 (por cofactores). Sirve para pasar de un toque en la pantalla a un punto del suelo.
  function invierte(m) {
    const a = m, o = new Float32Array(16);
    const b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4], b03 = a[1] * a[6] - a[2] * a[5];
    const b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6], b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12];
    const b08 = a[8] * a[15] - a[11] * a[12], b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
    const det = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
    o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * det; o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * det;
    o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * det; o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * det;
    o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * det; o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * det;
    o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * det; o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * det;
    o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * det; o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * det;
    o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * det; o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * det;
    o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * det; o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * det;
    o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * det; o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * det;
    return o;
  }

  // ---------- los programas ----------
  // Las mallas con textura (los .glb de Yoshi, texturas.js) usan un segundo programa en vez de ampliar el de siempre: así las
  // mallas viejas siguen con el sombreador de antes, letra por letra, sin textura blanca ni atributo fijo; y el texto de los dos
  // sale de la misma plantilla (textoMalla), así que la luz de cómic, los focos, la niebla y el contorno no se copian.
  function textoMalla(conTextura) {
    const t = (trozo) => (conTextura ? trozo : '');
    const vs = `
    attribute vec3 aPos, aNor, aCol, aCon; attribute float aEmi;${t(' attribute vec2 aUV; varying vec2 vUV;')}
    uniform mat4 uVP, uM; uniform mediump float uGrosor;   // mediump: la misma precisión que en el otro sombreador, que también lo usa
    varying vec3 vNor, vCol, vPos; varying float vEmi;
    void main() {
      vec4 w = uM * vec4(aPos, 1.0);
      vec3 k = mat3(uM) * aCon;
      if (uGrosor > 0.0 && dot(k, k) > 0.0001) w.xyz += normalize(k) * uGrosor;
      vPos = w.xyz; vNor = mat3(uM) * aNor; vCol = aCol; vEmi = aEmi;${t(' vUV = aUV;')}
      gl_Position = uVP * w;
    }`;
    const fs = `
    precision mediump float;
    uniform vec3 uLuz, uAmbiente, uNiebla, uOjo; uniform vec2 uNieblaD; uniform vec4 uFocos[6], uTinte; uniform float uGrosor;   // uTinte.a = luz propia: lo que destaca un personaje en la penumbra
    varying vec3 vNor, vCol, vPos; varying float vEmi;${t(' varying vec2 vUV; uniform sampler2D uTex;')}
    void main() {
      float lejos = clamp((distance(vPos, uOjo) - uNieblaD.x) / (uNieblaD.y - uNieblaD.x), 0.0, 1.0);
      if (uGrosor > 0.0) { gl_FragColor = vec4(mix(vec3(0.02, 0.02, 0.05), uNiebla, lejos), 1.0); return; }
      float d = dot(normalize(vNor), uLuz);
      float escalon = d > 0.4 ? 1.0 : (d > -0.1 ? 0.76 : 0.55);
      float foco = 0.0;
      for (int i = 0; i < 6; i++) {
        float q = 1.0 - clamp(distance(vPos.xz, uFocos[i].xz) / max(uFocos[i].w, 0.001), 0.0, 1.0);
        foco = max(foco, q * q * (3.0 - 2.0 * q));
      }
      vec3 base = vCol * uTinte.rgb${t(' * texture2D(uTex, vUV).rgb')};
      vec3 c = base * escalon * mix(uAmbiente, vec3(1.0, 0.98, 0.92), max(foco, uTinte.a));
      c = mix(c, base, vEmi);
      gl_FragColor = vec4(mix(c, uNiebla, lejos * (1.0 - vEmi * 0.5)), 1.0);
    }`;
    return { vs, fs };
  }
  const VS_LOTE = `
    attribute vec3 aPos; attribute vec4 aCol; uniform mat4 uVP; varying vec4 vCol;
    void main() { vCol = aCol; gl_Position = uVP * vec4(aPos, 1.0); }`;
  const FS_LOTE = `
    precision mediump float; varying vec4 vCol;
    void main() { gl_FragColor = vCol; }`;

  function sombreador(tipo, texto) {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, texto); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Spy: sombreador: ' + gl.getShaderInfoLog(s));
    return s;
  }
  function programa(vs, fs, atributos, uniformes) {
    const p = gl.createProgram();
    gl.attachShader(p, sombreador(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sombreador(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Spy: programa: ' + gl.getProgramInfoLog(p));
    const a = {}, u = {};
    for (const n of atributos) a[n] = gl.getAttribLocation(p, n);
    for (const n of uniformes) u[n] = gl.getUniformLocation(p, n);
    return { p, a, u };
  }

  // Arranca WebGL en el lienzo. false si el navegador no tiene 3D.
  GL.iniciar = function (lienzo) {
    gl = lienzo.getContext('webgl', { antialias: true, alpha: false }) || lienzo.getContext('experimental-webgl');
    if (!gl) return false;
    GL.gl = gl; GL.lienzo = lienzo;
    const atributos = ['aPos', 'aNor', 'aCol', 'aEmi', 'aCon'], uniformes = ['uVP', 'uM', 'uGrosor', 'uLuz', 'uAmbiente', 'uNiebla', 'uOjo', 'uNieblaD', 'uFocos', 'uTinte'];
    const color = textoMalla(false), textura = textoMalla(true);
    PT = programa(color.vs, color.fs, atributos, uniformes);
    PX = programa(textura.vs, textura.fs, [...atributos, 'aUV'], [...uniformes, 'uTex']);
    gl.useProgram(PX.p); gl.uniform1i(PX.u.uTex, 0);   // la textura de la malla va siempre en la unidad 0
    PL = programa(VS_LOTE, FS_LOTE, ['aPos', 'aCol'], ['uVP']);
    bufLote = gl.createBuffer();
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE);
    return true;
  };

  GL.medida = function (ancho, alto) {
    GL.W = Math.max(1, Math.floor(ancho)); GL.H = Math.max(1, Math.floor(alto));
    GL.lienzo.width = GL.W; GL.lienzo.height = GL.H;
  };

  // Una malla fija a partir de sus números (13 por vértice).
  GL.malla = function (datos) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, datos instanceof Float32Array ? datos : new Float32Array(datos), gl.STATIC_DRAW);
    return { buf, n: datos.length / GL.POR_VERTICE };
  };

  // Empieza una imagen: borra y deja puestas la cámara y las luces. luz = { vp, ojo, dir, ambiente, niebla, nieblaD, focos (24 números) }.
  GL.empieza = function (luz) {
    gl.viewport(0, 0, GL.W, GL.H);
    gl.clearColor(luz.niebla[0], luz.niebla[1], luz.niebla[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (const P of [PX, PT]) {   // las luces en los dos programas de mallas; acaba con el de siempre puesto
      gl.useProgram(P.p);
      gl.uniformMatrix4fv(P.u.uVP, false, luz.vp);
      gl.uniform3fv(P.u.uLuz, luz.dir); gl.uniform3fv(P.u.uAmbiente, luz.ambiente); gl.uniform3fv(P.u.uNiebla, luz.niebla);
      gl.uniform3fv(P.u.uOjo, luz.ojo); gl.uniform2fv(P.u.uNieblaD, luz.nieblaD); gl.uniform4fv(P.u.uFocos, luz.focos);
    }
    GL.vp = luz.vp; GL.grosor = luz.grosor;
    LOTE.n = 0;
  };

  const BLANCO = new Float32Array([1, 1, 1, 0]);
  // Apunta los atributos del programa P al buffer de la malla (13 números por vértice; 15 con UV en las de textura).
  function apunta(m, P) {
    const B = (m.porVertice || GL.POR_VERTICE) * 4, a = P.a;
    gl.bindBuffer(gl.ARRAY_BUFFER, m.buf);
    gl.enableVertexAttribArray(a.aPos); gl.vertexAttribPointer(a.aPos, 3, gl.FLOAT, false, B, 0);
    gl.enableVertexAttribArray(a.aNor); gl.vertexAttribPointer(a.aNor, 3, gl.FLOAT, false, B, 12);
    gl.enableVertexAttribArray(a.aCol); gl.vertexAttribPointer(a.aCol, 3, gl.FLOAT, false, B, 24);
    gl.enableVertexAttribArray(a.aEmi); gl.vertexAttribPointer(a.aEmi, 1, gl.FLOAT, false, B, 36);
    gl.enableVertexAttribArray(a.aCon); gl.vertexAttribPointer(a.aCon, 3, gl.FLOAT, false, B, 40);
    if (!m.textura) return;
    gl.enableVertexAttribArray(a.aUV); gl.vertexAttribPointer(a.aUV, 2, gl.FLOAT, false, B, 52);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.bufIndices);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, m.textura);
  }
  // Los triángulos de la malla: por índices las de textura, seguidos las de siempre.
  function dibuja(m) {
    if (m.bufIndices) gl.drawElements(gl.TRIANGLES, m.n, m.tipoIndice, 0);
    else gl.drawArrays(gl.TRIANGLES, 0, m.n);
  }
  // Pinta una malla con su matriz: primero de color y luego su contorno. tinte = [r, g, b, luz propia]: los tres primeros
  // multiplican el color (los ojos de un guardia) y el cuarto, de 0 a 1, lo saca de la penumbra (los personajes).
  // Vale igual para las mallas de siempre y para las de textura (GL.mallaGlb): cada una con su programa.
  GL.pinta = function (m, modelo, tinte, sinContorno) {
    const P = m.textura ? PX : PT;
    gl.useProgram(P.p);
    apunta(m, P);
    gl.uniformMatrix4fv(P.u.uM, false, modelo);
    gl.uniform4fv(P.u.uTinte, tinte || BLANCO);
    gl.uniform1f(P.u.uGrosor, 0);
    gl.cullFace(gl.BACK);
    dibuja(m);
    if (!sinContorno) {
      gl.uniform1f(P.u.uGrosor, GL.grosor);
      gl.cullFace(gl.FRONT);
      dibuja(m);
      gl.cullFace(gl.BACK);
    }
    if (m.textura) gl.disableVertexAttribArray(P.a.aUV);   // que el atributo de la UV no se quede encendido para los otros programas
  };

  // ---------- el lote de lo translúcido ----------
  // Un triángulo de un color [r, g, b, a] (a, b y c son puntos [x, y, z]).
  GL.tri = function (a, b, c, color, colorB, colorC) {
    if (LOTE.n + 3 > LOTE.v.length / 7) return;
    const colores = [color, colorB || color, colorC || color];
    [a, b, c].forEach((p, i) => { LOTE.v.set(p, LOTE.n * 7); LOTE.v.set(colores[i], LOTE.n * 7 + 3); LOTE.n++; });
  };
  // Un haz de luz de pie sobre (x, z): dos láminas cruzadas que se desvanecen hacia arriba (la meta, la casilla que señala Lola).
  GL.haz = function (x, z, ancho, alto, color) {
    const fin = [color[0], color[1], color[2], 0];
    for (const [dx, dz] of [[ancho, 0], [0, ancho]]) {
      const a = [x - dx, 0.02, z - dz], b = [x + dx, 0.02, z + dz], c = [x + dx, alto, z + dz], d = [x - dx, alto, z - dz];
      GL.tri(a, b, c, color, color, fin); GL.tri(a, c, d, color, fin, fin);
    }
  };
  // Un rectángulo tumbado en el suelo, a la altura `y`.
  GL.suelo = function (x0, z0, x1, z1, y, color) {
    GL.tri([x0, y, z0], [x0, y, z1], [x1, y, z1], color); GL.tri([x0, y, z0], [x1, y, z1], [x1, y, z0], color);
  };
  // Un anillo en el suelo entre dos radios (con r0 = 0 es un disco).
  GL.anillo = function (cx, cz, r0, r1, y, color, lados = 28) {
    for (let i = 0; i < lados; i++) {
      const a = i / lados * Math.PI * 2, b = (i + 1) / lados * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      GL.tri([cx + ca * r0, y, cz + sa * r0], [cx + cb * r1, y, cz + sb * r1], [cx + ca * r1, y, cz + sa * r1], color);
      if (r0 > 0) GL.tri([cx + ca * r0, y, cz + sa * r0], [cx + cb * r0, y, cz + sb * r0], [cx + cb * r1, y, cz + sb * r1], color);
    }
  };
  // Pinta lo acumulado en el lote, mezclado encima de lo demás (no escribe profundidad: no se tapan entre ellos).
  GL.pintaLote = function () {
    if (!LOTE.n) return;
    gl.useProgram(PL.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufLote);
    gl.bufferData(gl.ARRAY_BUFFER, LOTE.v.subarray(0, LOTE.n * 7), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(PL.a.aPos); gl.vertexAttribPointer(PL.a.aPos, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(PL.a.aCol); gl.vertexAttribPointer(PL.a.aCol, 4, gl.FLOAT, false, 28, 12);
    gl.uniformMatrix4fv(PL.u.uVP, false, GL.vp);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false); gl.disable(gl.CULL_FACE);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -2);   // lo pintado en el suelo queda un pelo por delante, para que no parpadee
    gl.drawArrays(gl.TRIANGLES, 0, LOTE.n);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.depthMask(true); gl.enable(gl.CULL_FACE); gl.disable(gl.BLEND);
    LOTE.n = 0;
  };
})(SPY);
