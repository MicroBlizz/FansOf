// Fans of Pop · RAID, el tablero compartido (dominio puro, tarea 448): 512x512 burbujas guardadas en bits (1 = viva), partidas en 256 trozos
// de 32x32. Aquí solo las reglas: crear lleno, ¿viva?, reventar, el toque en cruz (la burbuja y sus 4 vecinas), trozos para la red,
// conteos, aplicar una lista de cambios del servidor y la fase final. Sin reloj, azar, SAVE, DOM ni lectura de PP_CFG (las cifras entran por parámetro).
//
// FORMATO (el servidor lo copia tal cual): el tablero es un Uint8Array de 32768 bytes. Los bits van ORDENADOS POR TROZO, para que cada trozo
// sea una tira de 128 bytes seguidos: trozo = (y>>5)*16 + (x>>5); bit = trozo*1024 + (y&31)*32 + (x&31); byte = bit>>3, máscara = 1<<(bit&7)
// (el bit 0 de cada byte es el de menor índice). Un trozo = bytes [trozo*128, trozo*128+128). Por la red un trozo viaja como base64 estándar
// con relleno «=» (172 caracteres) o como Uint8Array de 128 bytes. Un cambio es un par [x, y] de burbuja reventada.
'use strict';
const PP_RAID_TABLERO = (() => {
  const LADO = 512;
  const TROZO = 32;                          // lado de un trozo
  const TROZOS_LADO = LADO / TROZO;          // 16
  const TROZOS = TROZOS_LADO * TROZOS_LADO;  // 256
  const BITS_TROZO = TROZO * TROZO;          // 1024
  const BYTES_TROZO = BITS_TROZO / 8;        // 128
  const BYTES = TROZOS * BYTES_TROZO;        // 32768
  const TOTAL = LADO * LADO;                 // 262144
  const CRUZ = Object.freeze([[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]]);   // el toque: la casilla, arriba, abajo, izquierda y derecha
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const BITS_A_1 = (() => { const t = new Uint8Array(256); for (let i = 1; i < 256; i++) t[i] = t[i >> 1] + (i & 1); return t; })();

  const dentro = (x, y) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < LADO && y < LADO;
  const trozoDe = (x, y) => (y >> 5) * TROZOS_LADO + (x >> 5);
  const bitDe = (x, y) => trozoDe(x, y) * BITS_TROZO + (y & 31) * TROZO + (x & 31);
  const trozoValido = n => Number.isInteger(n) && n >= 0 && n < TROZOS;

  function crear() { return new Uint8Array(BYTES).fill(0xFF); }
  function viva(t, x, y) {
    if (!dentro(x, y)) return false;
    const b = bitDe(x, y);
    return (t[b >> 3] & (1 << (b & 7))) !== 0;
  }
  // revienta una casilla; true si estaba viva (y ya no), false si estaba vacía o fuera
  function reventar(t, x, y) {
    if (!viva(t, x, y)) return false;
    const b = bitDe(x, y);
    t[b >> 3] &= ~(1 << (b & 7));
    return true;
  }
  // el toque en (x,y): revienta la casilla y sus 4 vecinas que sigan vivas y dentro; devuelve las que reventó de verdad (0 a 5)
  function toque(t, x, y) {
    const reventadas = [];
    if (!dentro(x, y)) return { reventadas, valor: 0 };
    for (const [dx, dy] of CRUZ) if (reventar(t, x + dx, y + dy)) reventadas.push([x + dx, y + dy]);
    return { reventadas, valor: reventadas.length };
  }
  // los cambios que llegan del servidor: [[x, y], ...] reventadas; devuelve cuántas cambiaron aquí de verdad
  function aplicar(t, cambios) {
    let n = 0;
    for (const c of cambios) if (Array.isArray(c) && reventar(t, c[0], c[1])) n++;
    return n;
  }

  function contarBytes(t, desde, hasta) {
    let n = 0;
    for (let i = desde; i < hasta; i++) n += BITS_A_1[t[i]];
    return n;
  }
  function contarTrozo(t, n) { return trozoValido(n) ? contarBytes(t, n * BYTES_TROZO, (n + 1) * BYTES_TROZO) : 0; }
  function contarVivas(t) { return contarBytes(t, 0, BYTES); }
  function vivasPorTrozo(t) { return Array.from({ length: TROZOS }, (_, n) => contarTrozo(t, n)); }

  // «quedan pocas»: vivas <= umbral del total (quien llama pasa PP_CFG.raid.faseFinal); ahí sale el jefe CEO
  function faseFinal(vivas, total, umbral) { return total > 0 && vivas <= total * umbral; }

  // ---- trozos para la red ----
  function bytesTrozo(t, n) { return trozoValido(n) ? t.slice(n * BYTES_TROZO, (n + 1) * BYTES_TROZO) : null; }
  function ponerTrozo(t, n, bytes) {
    if (!trozoValido(n)) return { ok: false, motivo: 'trozo_invalido' };
    if (!bytes || bytes.length !== BYTES_TROZO) return { ok: false, motivo: 'bytes_invalidos' };
    t.set(bytes, n * BYTES_TROZO);
    return { ok: true };
  }
  function aBase64(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 3) {
      const v = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0);
      const quedan = bytes.length - i;
      s += ABC[v >> 18] + ABC[(v >> 12) & 63] + (quedan > 1 ? ABC[(v >> 6) & 63] : '=') + (quedan > 2 ? ABC[v & 63] : '=');
    }
    return s;
  }
  // base64 a bytes; null si no es base64 válido con relleno
  function deBase64(txt) {
    if (typeof txt !== 'string' || txt.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(txt)) return null;
    const relleno = txt.endsWith('==') ? 2 : txt.endsWith('=') ? 1 : 0;
    const out = new Uint8Array(txt.length / 4 * 3 - relleno);
    let k = 0;
    for (let i = 0; i < txt.length; i += 4) {
      const v = [0, 1, 2, 3].reduce((a, j) => (a << 6) | Math.max(0, ABC.indexOf(txt[i + j])), 0);
      for (let j = 0; j < 3 && k < out.length; j++) out[k++] = (v >> (16 - 8 * j)) & 255;
    }
    return out;
  }
  function trozoABase64(t, n) { const b = bytesTrozo(t, n); return b ? aBase64(b) : null; }
  function ponerTrozoBase64(t, n, txt) {
    const b = deBase64(txt);
    return b ? ponerTrozo(t, n, b) : { ok: false, motivo: 'base64_invalido' };
  }

  return Object.freeze({
    LADO, TROZO, TROZOS_LADO, TROZOS, BYTES_TROZO, BYTES, TOTAL,
    crear, dentro, viva, reventar, toque, aplicar, trozoDe,
    contarVivas, contarTrozo, vivasPorTrozo, faseFinal,
    bytesTrozo, ponerTrozo, aBase64, deBase64, trozoABase64, ponerTrozoBase64,
  });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_TABLERO;
