// Fans of Spy · ADAPTADORES · Lector de archivos .glb (glTF 2.0 binario) en JavaScript puro, sin librerías. Recibe el ArrayBuffer
// y devuelve la primera primitiva del primer mesh: posiciones, normales (calculadas si faltan), uv, índices, la imagen de color
// (bytes y tipo, sin decodificar) y la caja que lo contiene. Sin DOM ni red: quien lo usa se encarga de descargar el archivo.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const MAGIA = 0x46546C67, TROZO_JSON = 0x4E4F534A, TROZO_BIN = 0x004E4942;
  const COMPONENTES = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
  // Por tipo de componente: bytes, lector del DataView y matriz tipada de salida.
  const TIPOS = {
    5126: { b: 4, leer: (d, o) => d.getFloat32(o, true), sal: Float32Array },
    5123: { b: 2, leer: (d, o) => d.getUint16(o, true), sal: Uint16Array },
    5125: { b: 4, leer: (d, o) => d.getUint32(o, true), sal: Uint32Array },
    5121: { b: 1, leer: (d, o) => d.getUint8(o), sal: Uint8Array },
  };
  const error = (motivo) => new Error('Spy: glb: ' + motivo);

  // Cabecera (12 bytes) y trozos: devuelve el JSON ya leído y los bytes del trozo BIN.
  function trozos(buf) {
    if (!(buf instanceof ArrayBuffer) && !(buf && typeof buf.byteLength === 'number' && typeof buf.slice === 'function')) throw error('no es un ArrayBuffer');
    if (buf.byteLength < 20) throw error('archivo demasiado corto');
    const d = new DataView(buf);
    if (d.getUint32(0, true) !== MAGIA) throw error('no empieza por glTF');
    if (d.getUint32(4, true) !== 2) throw error('versión ' + d.getUint32(4, true) + ' (solo vale la 2)');
    const fin = Math.min(d.getUint32(8, true), buf.byteLength);
    let json = null, bin = null, p = 12;
    while (p + 8 <= fin) {
      const largo = d.getUint32(p, true), tipo = d.getUint32(p + 4, true), ini = p + 8;
      if (ini + largo > buf.byteLength) throw error('un trozo se sale del archivo');
      if (tipo === TROZO_JSON && !json) json = leeJson(buf, ini, largo);
      else if (tipo === TROZO_BIN && !bin) bin = new Uint8Array(buf, ini, largo);
      p = ini + largo + ((4 - (largo % 4)) % 4);
    }
    if (!json) throw error('falta el trozo JSON');
    return { json, bin };
  }
  function leeJson(buf, ini, largo) {
    try { return JSON.parse(new TextDecoder('utf-8').decode(new Uint8Array(buf, ini, largo))); }
    catch (e) { throw error('el JSON no se puede leer (' + e.message + ')'); }
  }

  // Los bytes de un bufferView dentro del BIN.
  function vista(json, bin, i) {
    const v = (json.bufferViews || [])[i];
    if (!v) throw error('falta el bufferView ' + i);
    if (!bin) throw error('falta el trozo BIN');
    const ini = v.byteOffset || 0;
    if (ini + v.byteLength > bin.byteLength) throw error('el bufferView ' + i + ' se sale del BIN');
    return { v, bytes: bin.subarray(ini, ini + v.byteLength) };
  }

  // Un accessor entero como matriz plana (count × componentes), respetando byteStride y byteOffset.
  function accesor(json, bin, i) {
    const a = (json.accessors || [])[i];
    if (!a) throw error('falta el accessor ' + i);
    const t = TIPOS[a.componentType], n = COMPONENTES[a.type];
    if (!t || !n) throw error('accessor ' + i + ' con tipo no admitido');
    const { v, bytes } = vista(json, bin, a.bufferView);
    const paso = v.byteStride || t.b * n, ini = a.byteOffset || 0;
    if (a.count > 0 && ini + (a.count - 1) * paso + t.b * n > bytes.byteLength) throw error('el accessor ' + i + ' se sale de su bufferView');
    const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), sal = new t.sal(a.count * n);
    for (let k = 0; k < a.count; k++) for (let c = 0; c < n; c++) sal[k * n + c] = t.leer(d, ini + k * paso + c * t.b);
    return { a, datos: sal };
  }

  // Los índices: los del accessor (a 16 o 32 bits) o 0..n-1 si la primitiva no los trae.
  function indicesDe(json, bin, prim, nVert) {
    if (prim.indices === undefined) {
      const o = nVert > 65535 ? new Uint32Array(nVert) : new Uint16Array(nVert);
      for (let k = 0; k < nVert; k++) o[k] = k;
      return o;
    }
    const { datos } = accesor(json, bin, prim.indices);
    if (datos instanceof Uint8Array) return Uint16Array.from(datos);
    for (let k = 0; k < datos.length; k++) if (datos[k] >= nVert) throw error('un índice apunta fuera de los vértices');
    return datos;
  }

  // Normal de la cara (sin normalizar: pesa más la cara grande) sumada a sus tres vértices.
  function sumaCara(p, i, j, k, nor) {
    const ux = p[j * 3] - p[i * 3], uy = p[j * 3 + 1] - p[i * 3 + 1], uz = p[j * 3 + 2] - p[i * 3 + 2];
    const wx = p[k * 3] - p[i * 3], wy = p[k * 3 + 1] - p[i * 3 + 1], wz = p[k * 3 + 2] - p[i * 3 + 2];
    const x = uy * wz - uz * wy, y = uz * wx - ux * wz, z = ux * wy - uy * wx;
    for (const q of [i, j, k]) { nor[q * 3] += x; nor[q * 3 + 1] += y; nor[q * 3 + 2] += z; }
  }
  // Normales por cara sumadas por vértice y normalizadas (un vértice sin cara se queda mirando arriba).
  function calculaNormales(pos, ind) {
    const nor = new Float32Array(pos.length);
    for (let t = 0; t + 2 < ind.length; t += 3) sumaCara(pos, ind[t], ind[t + 1], ind[t + 2], nor);
    for (let k = 0; k < nor.length; k += 3) {
      const l = Math.hypot(nor[k], nor[k + 1], nor[k + 2]);
      if (l > 0) { nor[k] /= l; nor[k + 1] /= l; nor[k + 2] /= l; } else nor[k + 1] = 1;
    }
    return nor;
  }

  // Caja de las posiciones: la del accessor si la trae; si no, calculada.
  function caja(a, pos) {
    if (a.min && a.max && a.min.length === 3 && a.max.length === 3) return { minimo: a.min.slice(), maximo: a.max.slice() };
    const minimo = [Infinity, Infinity, Infinity], maximo = [-Infinity, -Infinity, -Infinity];
    for (let k = 0; k < pos.length; k++) {
      const c = k % 3;
      if (pos[k] < minimo[c]) minimo[c] = pos[k];
      if (pos[k] > maximo[c]) maximo[c] = pos[k];
    }
    return { minimo, maximo };
  }

  // La imagen del color base del material de la primitiva (bytes tal cual, sin decodificar) o null.
  function imagenDe(json, bin, prim) {
    const mat = (json.materials || [])[prim.material];
    const tex = mat && mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorTexture;
    const textura = tex && (json.textures || [])[tex.index];
    const img = textura && (json.images || [])[textura.source];
    if (!img || img.bufferView === undefined) return null;
    return { tipo: img.mimeType, datos: vista(json, bin, img.bufferView).bytes.slice() };
  }

  // La primera primitiva de triángulos del primer mesh.
  function primitiva(json) {
    const malla = (json.meshes || [])[0], prim = malla && (malla.primitives || [])[0];
    if (!prim) throw error('no hay ningún mesh con primitivas');
    if (prim.mode !== undefined && prim.mode !== 4) throw error('la primitiva no es de triángulos (mode ' + prim.mode + ')');
    if (!prim.attributes || prim.attributes.POSITION === undefined) throw error('la primitiva no tiene POSITION');
    return prim;
  }

  function lee(buf) {
    const { json, bin } = trozos(buf), prim = primitiva(json);
    const p = accesor(json, bin, prim.attributes.POSITION);
    const posiciones = p.datos, nVert = p.a.count;
    const indices = indicesDe(json, bin, prim, nVert);
    const normales = prim.attributes.NORMAL === undefined ? calculaNormales(posiciones, indices) : accesor(json, bin, prim.attributes.NORMAL).datos;
    const uv = prim.attributes.TEXCOORD_0 === undefined ? null : accesor(json, bin, prim.attributes.TEXCOORD_0).datos;
    const { minimo, maximo } = caja(p.a, posiciones);
    return { posiciones, normales, uv, indices, imagen: imagenDe(json, bin, prim), minimo, maximo };
  }

  S.glb = { lee };
})(SPY);
