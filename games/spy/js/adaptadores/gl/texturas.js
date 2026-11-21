// Fans of Spy · ADAPTADORES · Mallas con textura para el motor 3D: los modelos .glb de Yoshi (leídos con S.glb.lee) pasan a una
// malla que GL.pinta dibuja con su textura, la luz de cómic y el contorno negro. empaquetaGlb es pura (se prueba con node, sin
// WebGL): 15 números por vértice (posición 3, normal 3, color 3, brillo propio 1, contorno 3, UV 2). mallaGlb sube eso a WebGL.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const GL = S.gl;
  const POR_VERTICE = GL.POR_VERTICE_TEX = 15;
  const REDONDEO = 1e4;   // las posiciones que coinciden hasta ~1e-4 cuentan como el mismo punto

  const clave = (p, i) => Math.round(p[i] * REDONDEO) + ',' + Math.round(p[i + 1] * REDONDEO) + ',' + Math.round(p[i + 2] * REDONDEO);

  // La dirección del contorno de cada vértice: la suma normalizada de las normales de todos los vértices en la misma posición.
  // Así los vértices repetidos en las costuras de la textura se hinchan igual y el borde negro no se abre. Si la suma se anula
  // (caras opuestas), se queda con su propia normal.
  function contornos(pos, nor) {
    const n = pos.length / 3, sumas = new Map(), claves = new Array(n), out = new Float32Array(n * 3);
    for (let v = 0; v < n; v++) {
      const k = claves[v] = clave(pos, v * 3), s = sumas.get(k) || [0, 0, 0];
      s[0] += nor[v * 3]; s[1] += nor[v * 3 + 1]; s[2] += nor[v * 3 + 2];
      sumas.set(k, s);
    }
    for (let v = 0; v < n; v++) {
      const s = sumas.get(claves[v]), l = Math.hypot(s[0], s[1], s[2]);
      const d = l > 1e-6 ? [s[0] / l, s[1] / l, s[2] / l] : [nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]];
      out.set(d, v * 3);
    }
    return out;
  }

  // Del resultado de S.glb.lee a { datos (Float32Array, 15 por vértice), indices }. Color blanco (lo pone la textura), brillo 0,
  // UV tal cual viene en glTF (origen arriba a la izquierda; 0,0 si el modelo no trae).
  GL.empaquetaGlb = function (glb) {
    const pos = glb.posiciones, nor = glb.normales, uv = glb.uv, n = pos.length / 3;
    const con = contornos(pos, nor), datos = new Float32Array(n * POR_VERTICE);
    for (let v = 0; v < n; v++) {
      const o = v * POR_VERTICE;
      datos.set(pos.subarray(v * 3, v * 3 + 3), o);
      datos.set(nor.subarray(v * 3, v * 3 + 3), o + 3);
      datos[o + 6] = 1; datos[o + 7] = 1; datos[o + 8] = 1;
      datos.set(con.subarray(v * 3, v * 3 + 3), o + 10);
      if (uv) { datos[o + 13] = uv[v * 2]; datos[o + 14] = uv[v * 2 + 1]; }
    }
    return { datos, indices: glb.indices };
  };

  // El tipo de índice de WebGL: los de 32 bits piden la extensión OES_element_index_uint.
  function tipoIndice(gl, indices) {
    if (indices.BYTES_PER_ELEMENT !== 4) return gl.UNSIGNED_SHORT;
    if (!gl.getExtension('OES_element_index_uint')) throw new Error('Spy: mallaGlb: el modelo tiene más de 65535 vértices y este navegador no admite índices de 32 bits (OES_element_index_uint)');
    return gl.UNSIGNED_INT;
  }

  // La textura de la imagen ya decodificada (ImageBitmap o HTMLImageElement). Sin mipmaps ni repetición, para que valga
  // cualquier medida (no solo potencias de dos), y sin voltear la Y: la UV de glTF ya tiene el origen arriba.
  function textura(gl, imagen, repite) {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagen);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const borde = repite ? gl.REPEAT : gl.CLAMP_TO_EDGE;   // repetir solo vale con medidas potencia de 2 (las texturas del escenario son de 512)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, borde); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, borde);
    if (repite) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }   // el suelo se ve lejos y de lado: sin mipmaps centellea
    return t;
  }

  // Una malla con textura lista para GL.pinta, a partir de empaquetaGlb y de la imagen del modelo ya decodificada.
  GL.mallaGlb = function (empaquetado, imagen, repite) {
    const gl = GL.gl;
    if (!gl) throw new Error('Spy: mallaGlb: el motor 3D no está arrancado');
    const tipo = tipoIndice(gl, empaquetado.indices);
    const buf = gl.createBuffer(), bufIndices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, empaquetado.datos, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIndices); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, empaquetado.indices, gl.STATIC_DRAW);
    return { buf, bufIndices, n: empaquetado.indices.length, tipoIndice: tipo, textura: textura(gl, imagen, repite), porVertice: POR_VERTICE };
  };
})(SPY);
