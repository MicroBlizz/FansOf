// Fans of Zombies · BASE (dominio): los resultados con nombre (ZOM.ok / ZOM.error), sortear con pesos usando el azar que te pasan,
// las distancias y la rejilla espacial (los zombis se buscan por casillas, no comparándolos todos con todos).
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.ok = (valor) => Object.freeze({ ok: true, valor });
  Z.error = (codigo, datos) => Object.freeze({ ok: false, codigo, datos: datos || {} });
  Z.dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
  Z.limita = (v, a, b) => Math.max(a, Math.min(b, v));
  // elige una clave de { clave: peso } con el azar (una función que da un número de 0 a 1)
  Z.sortea = function (pesos, azar) {
    const claves = Object.keys(pesos), total = claves.reduce((s, k) => s + pesos[k], 0);
    let r = azar() * total;
    for (const k of claves) { r -= pesos[k]; if (r < 0) return k; }
    return claves[claves.length - 1];
  };
  // la rejilla: casillas de tamaño celda con lo que hay en cada una
  Z.rejilla = function (cosas, celda) {
    const m = new Map();
    for (const c of cosas) { const k = Math.floor(c.x / celda) + ',' + Math.floor(c.z / celda); if (!m.has(k)) m.set(k, []); m.get(k).push(c); }
    return { m, celda };
  };
  // lo que hay en la casilla de (x, z) y en las ocho de alrededor
  Z.vecinos = function (rej, x, z) {
    const i0 = Math.floor(x / rej.celda), j0 = Math.floor(z / rej.celda), out = [];
    for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) { const l = rej.m.get(i + ',' + j); if (l) out.push(...l); }
    return out;
  };
})(ZOM);
