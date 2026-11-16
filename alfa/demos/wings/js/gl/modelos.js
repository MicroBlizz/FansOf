// Fans of Wings · Modelos en lonchas apiladas. Los aviones que se ven en el juego son los chibi de aviones.js, cortados con
// maquetas.js. Aquí quedan además GUARDADOS los seis diseños de la primera versión (las fichas «clásicas»: fuselaje, cabina, alas,
// derivas, motores y colores) para reusarlos en otro sitio con MOD.clasico(id), y la llama de los motores. El morro mira a −Z.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl, hex = GL.hex, MOD = A.modelos = { caza: {}, enemigo: {}, llama: null, ficha: {} };

  // Cada ficha está en «unidades» (de f.vox metros) y se corta en f.k cubitos por unidad: cuanto mayor k, más lonchas y más finas.
  // Las formas se miden en el centro de cada cubito (X, Y, Z en unidades), así que el fuselaje sale redondo y las alas, afiladas.

  // La cabina: una burbuja de cristal que sobresale del lomo, con su marco.
  function parteCabina(f, ax, dy, t) {
    if (!f.cabina) return null;
    const medio = (f.cabina[0] + f.cabina[1]) / 2, [rx, ry] = f.fus(medio), tb = (t - medio) / ((f.cabina[1] - f.cabina[0]) / 2);
    const a = ax / (rx * 0.62), b = (dy - ry * 0.35) / (ry * 0.95), d = a * a + b * b + tb * tb;
    if (d > 1 || dy < ry * 0.3) return null;
    if (d > 0.8 || Math.abs(tb) < 0.07) return 'marco';
    return tb < -0.35 && a < 0.5 ? 'brillo' : 'cristal';
  }
  // El fuselaje: en cada corte a lo largo es una elipse de radios fus(t). Devuelve qué parte toca o null.
  function parteFuselaje(f, ax, dy, t) {
    const [rx, ry] = f.fus(t);
    if (rx <= 0 || (ax * ax) / (rx * rx) + (dy * dy) / (ry * ry) > 1) return null;
    if (t > 1 - 0.7 / f.nz) return 'tobera';
    if (t < 0.07) return 'morro';
    if (f.franja && t >= f.franja[0] && t <= f.franja[1]) return 'franja';
    return dy < -ry * 0.35 ? 'panza' : (ax < 0.45 && dy > 0 ? 'lomo' : 'cuerpo');
  }
  // Un ala (o un timón): una lámina a la altura a.y, de t0 a t1, con media envergadura env(u) (u = 0 delante, 1 detrás); es más
  // gruesa en la raíz y en el centro de la cuerda, y se afila hacia la punta y los bordes.
  function parteAla(a, ax, Y, t, k) {
    if (t < a.t0 || t > a.t1) return null;
    const u = (t - a.t0) / (a.t1 - a.t0), media = a.env(u);
    if (ax > media) return null;
    const grueso = (a.g || 0.8) * (1 - 0.6 * ax / a.max) * (0.5 + 0.5 * Math.sin(Math.PI * u)), dy = Y - a.y - 0.5;
    if (Math.abs(dy) > Math.max(grueso / 2, 0.51 / k)) return null;
    if (a.punta && ax > media - a.punta && ax > a.max * 0.75) return 'punta';
    if (u < 0.07 || ax > media - 0.4) return 'borde';
    if (a.franja && ax > a.max * a.franja[0] && ax < a.max * a.franja[1]) return 'franja';
    return dy < 0 ? 'panza' : 'ala';
  }
  // Una deriva: una pared fina en |x| = d.x, de t0 a t1, que sube alto(u) desde d.y.
  function parteDeriva(d, ax, Y, t) {
    if (Math.abs(ax - d.x) > 0.32 || t < d.t0 || t > d.t1 || Y < d.y) return null;
    const u = (t - d.t0) / (d.t1 - d.t0), alto = d.alto(u);
    if (Y > d.y + alto) return null;
    return Y > d.y + alto - 1 ? 'punta' : (u < 0.1 ? 'borde' : 'deriva');
  }
  // Un motor colgado: un tubo a lo largo en |x| = m.x, con la boca oscura delante y la tobera detrás.
  function parteMotor(m, ax, Y, t) {
    const d = Math.hypot(ax - m.x, Y - m.y - 0.5);
    if (t < m.t0 || t > m.t1 || d > m.r) return null;
    if (t > m.t1 - 0.03 || (t < m.t0 + 0.02 && d < m.r * 0.7)) return 'tobera';
    return t < m.t0 + 0.06 ? 'borde' : 'motor';
  }

  function parte(f, X, Y, Z) {
    const ax = Math.abs(X - f.nx / 2), t = Z / f.nz, dy = Y - f.yc - 0.5;
    let p = parteCabina(f, ax, dy, t) || parteFuselaje(f, ax, dy, t);
    for (const m of f.motores || []) p = p || parteMotor(m, ax, Y, t);
    for (const d of f.derivas || []) p = p || parteDeriva(d, ax, Y, t);
    for (const a of f.alas) p = p || parteAla(a, ax, Y, t, f.k);
    return p;
  }

  function cortar(f, sem) {
    const rnd = GL.azar(sem), pal = {}, k = f.k, ny = f.ny * k;
    for (const n of Object.keys(f.pal)) pal[n] = hex(f.pal[n]);
    for (const a of f.alas) a.max = Math.max(a.env(0), a.env(0.5), a.env(1));
    return GL.cubitos(f.nx * k, ny, f.nz * k, { vox: f.vox.map((v) => v / k), dy: -(f.yc + 0.5) * f.vox[1], color(x, y, z) {
      const p = parte(f, (x + 0.5) / k, (y + 0.5) / k, (z + 0.5) / k);
      if (!p) return null;
      // la chapa: una junta cada siete unidades a lo largo, más clara por arriba y con un grano muy fino
      return GL.tono(pal[p] || pal.cuerpo, (z % (7 * k) === 0 ? 0.86 : 1) * (0.88 + 0.12 * y / ny) * (0.975 + rnd() * 0.05));
    } });
  }

  const huso = (rx, ry, morro, cola) => (t) => { const k = t < morro ? Math.sqrt(t / morro) : t > 0.9 ? cola + (1 - cola) * (1 - t) / 0.1 : 1; return [rx * k, ry * k]; };
  const delta = (max, raiz) => (u) => raiz + (max - raiz) * u;

  // Las fichas clásicas. toberas = dónde salen las llamas del fuselaje (en cubitos desde el centro); si hay motores colgados, salen de ellos.
  const FICHAS = MOD.ficha = {
    bunny: { k: 3, nx: 29, ny: 12, nz: 45, vox: [0.7, 0.55, 0.7], yc: 4, franja: [0.5, 0.56], fus: huso(2.7, 2.6, 0.28, 0.8), cabina: [0.2, 0.36], toberas: [-1.4, 1.4],
      alas: [{ y: 3, t0: 0.36, t1: 0.86, env: delta(13.5, 2), punta: 1.6, franja: [0.5, 0.6] }, { y: 4, t0: 0.2, t1: 0.3, env: delta(5.5, 2.5) }, { y: 3, t0: 0.88, t1: 0.99, env: delta(6.5, 4) }],
      derivas: [{ x: 3, y: 5, t0: 0.7, t1: 0.97, alto: (u) => 1 + 4.5 * u }],
      pal: { cuerpo: '#f08a1c', panza: '#c9660f', lomo: '#ffa63d', morro: '#fff3d6', ala: '#f6a23a', borde: '#fff3d6', punta: '#3fae3a', deriva: '#3fae3a', cristal: '#12233f', brillo: '#9fd8ff', marco: '#7a3f08', franja: '#fff3d6', tobera: '#2a2d33' } },
    zorro: { k: 3, nx: 27, ny: 12, nz: 51, vox: [0.7, 0.55, 0.7], yc: 4, fus: huso(2.1, 2.2, 0.36, 0.7), cabina: [0.26, 0.4], toberas: [0],
      alas: [{ y: 3, t0: 0.42, t1: 0.8, env: (u) => 2 + 10.5 * Math.pow(u, 0.8), punta: 1.6, franja: [0.42, 0.5] }, { y: 3, t0: 0.86, t1: 0.99, env: delta(5.5, 3) }],
      derivas: [{ x: 0, y: 5, t0: 0.68, t1: 0.97, alto: (u) => 1.5 + 5 * u }],
      pal: { cuerpo: '#d9451c', panza: '#f4e7d3', lomo: '#ef6a3a', morro: '#1a1a1f', ala: '#c23a16', borde: '#f4e7d3', punta: '#1a1a1f', deriva: '#f4e7d3', cristal: '#10203a', brillo: '#ffd98a', marco: '#1a1a1f', franja: '#f4e7d3', tobera: '#2a2d33' } },
    castor: { k: 3, nx: 39, ny: 13, nz: 41, vox: [0.7, 0.55, 0.7], yc: 5, fus: huso(3.6, 3.4, 0.22, 0.85), cabina: [0.14, 0.3], toberas: [-9, 9],
      alas: [{ y: 5, t0: 0.3, t1: 0.56, env: (u) => 18.5 - 2 * u, punta: 1.8, g: 1.1, franja: [0.7, 0.78] }, { y: 6, t0: 0.84, t1: 0.99, env: delta(8.5, 7) }],
      derivas: [{ x: 7, y: 6, t0: 0.82, t1: 0.99, alto: (u) => 2 + 3 * u }],
      motores: [{ x: 9, y: 3, r: 1.9, t0: 0.22, t1: 0.62 }],
      pal: { cuerpo: '#a86a32', panza: '#7a4a20', lomo: '#c58648', morro: '#f2d9a6', ala: '#96592a', borde: '#f2d9a6', punta: '#e63a2a', deriva: '#7a4a20', motor: '#5a3a1c', cristal: '#152238', brillo: '#bfe6ff', marco: '#4a2c10', franja: '#f2d9a6', tobera: '#2a2d33' } },
    becario: { k: 2, nx: 23, ny: 9, nz: 27, vox: [1.25, 1, 1.25], yc: 3, fus: huso(2.0, 1.9, 0.3, 0.8), cabina: [0.22, 0.38], toberas: [0],
      alas: [{ y: 3, t0: 0.38, t1: 0.88, env: delta(10.5, 1.5), punta: 2 }],
      derivas: [{ x: 0, y: 4, t0: 0.66, t1: 0.97, alto: (u) => 1 + 3 * u }],
      pal: { cuerpo: '#3a6cff', panza: '#2748b8', lomo: '#6f95ff', morro: '#ffd23c', ala: '#5a86ff', borde: '#dfe8ff', punta: '#ffd23c', deriva: '#ffd23c', cristal: '#101a33', brillo: '#ff5a4a', marco: '#1b2f7a', tobera: '#1c2030' } },
    caja: { k: 2, franja: [0.44, 0.52], nx: 37, ny: 13, nz: 35, vox: [1.3, 1.1, 1.3], yc: 5, fus: (t) => (t < 0.1 ? [4 * t / 0.1, 4 * t / 0.1] : [4.2, 4.2]), cabina: [0.08, 0.2], toberas: [-10, 10],
      alas: [{ y: 7, t0: 0.34, t1: 0.6, env: (u) => 17.5 - u, punta: 2 }, { y: 8, t0: 0.84, t1: 0.99, env: delta(8, 7) }],
      derivas: [{ x: 0, y: 8, t0: 0.78, t1: 0.99, alto: (u) => 1 + 3.5 * u }],
      motores: [{ x: 10, y: 5, r: 1.8, t0: 0.28, t1: 0.66 }],
      pal: { cuerpo: '#e2b324', panza: '#b98a12', lomo: '#8a5a1c', morro: '#8a5a1c', ala: '#c99a1a', borde: '#fff0b0', punta: '#e63a2a', deriva: '#e63a2a', motor: '#8a5a1c', cristal: '#152238', brillo: '#bfe6ff', marco: '#8a5a1c', franja: '#e63a2a', tobera: '#2a2d33' } },
    jefe: { k: 2, nx: 49, ny: 15, nz: 41, vox: [1.5, 1.2, 1.5], yc: 6, fus: huso(5, 4.6, 0.3, 0.75), cabina: [0.12, 0.34], toberas: [-3, 3],
      alas: [{ y: 6, t0: 0.3, t1: 0.92, env: (u) => 4 + 19.5 * Math.sin(u * Math.PI * 0.62), punta: 2.4, g: 1.3 }],
      derivas: [{ x: 6, y: 7, t0: 0.62, t1: 0.95, alto: (u) => 2 + 5 * u }, { x: 15, y: 7, t0: 0.6, t1: 0.8, alto: () => 2 }],
      pal: { cuerpo: '#4d5564', panza: '#2f3540', lomo: '#e63a2a', morro: '#2f3540', ala: '#5d6676', borde: '#e63a2a', punta: '#ffd23c', deriva: '#2f3540', cristal: '#e63a2a', brillo: '#ffe9a0', marco: '#15171c', tobera: '#15171c' } },
  };
  // Un modelo clásico, cortado al pedirlo (no se usa en el juego: está guardado para reusarlo).
  MOD.clasico = (id, sem) => cortar(FICHAS[id], sem || 11);
  // Dónde está cada cosa en metros, para la vista: las toberas (por detrás) y las puntas de las alas.
  const MEDIDAS = {};
  MOD.medidas = (id) => MEDIDAS[id] || (MEDIDAS[id] = A.maquetas.medidas(A.aviones.dame(id)));

  function llama() {
    const A1 = hex('#fff2a0'), B = hex('#ffb02e'), C = hex('#f2541b');
    return GL.cubitos(9, 9, 28, { vox: [0.28, 0.28, 0.3], dy: -1.26, color(x, y, z) {
      const r = Math.hypot(x - 4, y - 4), max = 4.4 * (1 - z / 28);
      if (r > max) return null;
      return r < max * 0.4 ? A1 : (z < 15 ? B : C);
    } });
  }

  // Corta todos los modelos (una vez, al arrancar). La llama tiene su origen en la tobera y crece hacia atrás (+Z).
  MOD.crear = function () {
    let sem = 11;
    for (const c of A.AJ.cazas) MOD.caza[c.id] = A.maquetas.cortar(A.aviones.dame(c.id), sem++);
    for (const id of ['becario', 'caja', 'jefe']) MOD.enemigo[id] = A.maquetas.cortar(A.aviones.dame(id), sem++);
    MOD.llama = llama();
  };
})(WINGS);
