// Fans of Rouflage · MI ESCENARIO, LA PINTURA COMPRIMIDA (27-10-2026): para que tus amigos vean tu pintura con todo su detalle (el píxel a píxel, los
// estampados, el espray) sin pasar de los 6000 caracteres que admite el servidor, el texto de la pintura (pinturaCodifica de escenario-pinta.js) se
// comprime con un LZ77 sencillo y síncrono: lo que se repite se cambia por «~ largo distancia» (cada número en las letras de ESC_A64, 5 bits por letra
// y la de 32 para seguir). Va en el campo `pz` de los datos (en vez de `p`) y también en la partida guardada. Va antes de escenario-pinta.js.
'use strict';

const ESC_Z = { MIN: 6, CADENA: 32, BITS: 16 };
function escZNum(n) { let s = ''; while (n >= 32) { s += ESC_A64[(n & 31) | 32]; n >>>= 5; } return s + ESC_A64[n]; }
// devuelve el texto comprimido, o null si no se puede (no debería pasar: la pintura nunca lleva «~»)
function escComprime(s) {
  s = String(s || ''); const n = s.length; if (!n || s.includes('~')) return null;
  const T = 1 << ESC_Z.BITS, cabeza = new Int32Array(T).fill(-1), previa = new Int32Array(n);
  const clave = i => ((s.charCodeAt(i) * 2654435761 ^ s.charCodeAt(i + 1) * 40503 ^ s.charCodeAt(i + 2) * 101 ^ s.charCodeAt(i + 3)) >>> 0) & (T - 1);
  const apunta = i => { if (i + 4 > n) return; const h = clave(i); previa[i] = cabeza[h]; cabeza[h] = i; };
  let out = '', lit = 0, i = 0;
  while (i < n) {
    let largo = 0, dist = 0;
    if (i + 4 <= n) {
      let p = cabeza[clave(i)], vueltas = ESC_Z.CADENA;
      while (p >= 0 && vueltas-- > 0) {
        if (s[p] === s[i] && s[p + largo] === s[i + largo]) { let l = 0; while (i + l < n && s[p + l] === s[i + l]) l++; if (l > largo) { largo = l; dist = i - p; } }
        p = previa[p];
      }
    }
    if (largo >= ESC_Z.MIN) { if (lit < i) out += s.slice(lit, i); out += '~' + escZNum(largo) + escZNum(dist); for (let k = 0; k < largo; k++) apunta(i + k); i += largo; lit = i; }
    else { apunta(i); i++; }
  }
  return out + s.slice(lit);
}
function escDescomprime(z) {
  z = String(z || ''); const out = []; let j = 0;
  const num = () => { let v = 0, sh = 0, d; do { d = ESC_A64.indexOf(z[j++]); if (d < 0) throw new Error('pz'); v += (d & 31) * 2 ** sh; sh += 5; } while (d & 32); return v; };
  while (j < z.length) {
    const c = z[j++];
    if (c !== '~') { out.push(c); continue; }
    const largo = num(), dist = num(); if (!dist || dist > out.length || largo > 4e6) throw new Error('pz');
    for (let k = 0, o = out.length - dist; k < largo; k++) out.push(out[o + k]);
  }
  return out.join('');
}
// la pintura de unos datos: comprimida (pz) o como antes (p)
function escPinturaTexto(d) { if (d && d.pz) { try { return escDescomprime(d.pz); } catch (_) { return null; } } return d ? d.p : null; }
