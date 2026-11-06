// Fans of Zombies · LA MOCHILA TETRIS (dominio): como la de Ratkov, cada cosa ocupa las casillas de su forma (AJ.objetos[id].forma,
// X = casilla llena) y se puede girar. Una mochila es { w, h, piezas: [{ uid, id, n, gx, gy, gr }] }. Lo que se apila (cartuchos,
// clavos…) se junta hasta su máximo. Aquí: formas giradas, ¿cabe?, meter colocando solo, mover, sacar, contar y gastar.
// Los sitios que registras guardan su contenido como lista sin rejilla: e.contenidos[sitio] = [{ id, n }].
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const CACHE = {};
  // las casillas de la forma de id girada gr veces (90° cada vez), con su ancho y alto
  Z.formaDe = function (AJ, id, gr) {
    const k = id + '|' + ((gr || 0) % 4);
    if (CACHE[k]) return CACHE[k];
    const f = (AJ.objetos[id] && AJ.objetos[id].forma) || ['X'];
    let c = [], w = f[0].length, h = f.length;
    f.forEach((fila, y) => [...fila].forEach((ch, x) => { if (ch === 'X') c.push([x, y]); }));
    for (let i = 0; i < (gr || 0) % 4; i++) { c = c.map(([x, y]) => [h - 1 - y, x]); [w, h] = [h, w]; }
    return (CACHE[k] = { c, w, h });
  };
  Z.nuevaMochila = (w, h) => ({ w, h, piezas: [], uid: 0 });
  // ¿cabe id girada gr con su esquina en (x, y)? sin = la pieza que se está moviendo (no choca consigo misma)
  Z.cabeEn = function (AJ, m, id, gr, x, y, sin) {
    const f = Z.formaDe(AJ, id, gr);
    if (x < 0 || y < 0 || x + f.w > m.w || y + f.h > m.h) return false;
    const ocupadas = new Set();
    for (const p of m.piezas) if (p !== sin) for (const [cx, cy] of Z.formaDe(AJ, p.id, p.gr).c) ocupadas.add((p.gx + cx) + ',' + (p.gy + cy));
    return f.c.every(([cx, cy]) => !ocupadas.has((x + cx) + ',' + (y + cy)));
  };
  // el primer hueco donde cabe (probando los cuatro giros)
  Z.huecoPara = function (AJ, m, id, sin) {
    for (let gr = 0; gr < 4; gr++) for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (Z.cabeEn(AJ, m, id, gr, x, y, sin)) return { gx: x, gy: y, gr };
    return null;
  };
  // mete n de id: primero llena los montones que ya hay y luego busca hueco. Devuelve lo que no ha cabido (0 = todo dentro).
  // dur = lo que le queda a un arma usada (si no se dice, nueva: AJ.armas[id].dur)
  Z.meter = function (AJ, m, id, n, dur) {
    const O = AJ.objetos[id];
    if (!O) return n;
    const max = O.max || 1;
    for (const p of m.piezas) if (p.id === id && p.n < max && n > 0) { const k = Math.min(n, max - p.n); p.n += k; n -= k; }
    while (n > 0) {
      const h = Z.huecoPara(AJ, m, id);
      if (!h) return n;
      const k = Math.min(n, max), p = { uid: ++m.uid, id, n: k, ...h };
      if (AJ.armas[id] && AJ.armas[id].dur) p.dur = dur != null ? dur : AJ.armas[id].dur;
      m.piezas.push(p); n -= k;
    }
    return 0;
  };
  // el arma que se usa: de las de ese tipo, la más gastada (para no ir dejando muchas a medias)
  Z.armaPieza = (m, id) => m.piezas.filter((p) => p.id === id).sort((a, b) => (a.dur ?? 1e9) - (b.dur ?? 1e9))[0] || null;
  Z.cuantos = (m, id) => m.piezas.reduce((s, p) => s + (p.id === id ? p.n : 0), 0);
  Z.tiene = (m, id) => Z.cuantos(m, id) > 0;
  // gasta n de id (de los montones más pequeños primero, para ir vaciando)
  Z.gasta = function (m, id, n) {
    if (Z.cuantos(m, id) < n) return Z.error('noTienes', { cosa: id });
    for (const p of m.piezas.filter((q) => q.id === id).sort((a, b) => a.n - b.n)) { const k = Math.min(n, p.n); p.n -= k; n -= k; if (!n) break; }
    m.piezas = m.piezas.filter((p) => p.n > 0);
    return Z.ok(true);
  };
  Z.pieza = (m, uid) => m.piezas.find((p) => p.uid === uid) || null;
  // mover (o girar) una pieza dentro de la misma mochila
  Z.mover = function (AJ, m, uid, gx, gy, gr) {
    const p = Z.pieza(m, uid);
    if (!p) return Z.error('noEsta', { uid });
    if (!Z.cabeEn(AJ, m, p.id, gr, gx, gy, p)) return Z.error('noCabe', { id: p.id });
    Object.assign(p, { gx, gy, gr: gr % 4 });
    return Z.ok(p);
  };
  // sacar una pieza entera (para dejarla en otro sitio)
  Z.sacar = function (m, uid) {
    const p = Z.pieza(m, uid);
    if (!p) return Z.error('noEsta', { uid });
    m.piezas = m.piezas.filter((q) => q !== p);
    return Z.ok(p.dur != null ? { id: p.id, n: p.n, dur: p.dur } : { id: p.id, n: p.n });
  };
  // poner una cosa en un sitio concreto (desde un contenedor); si es apilable y cae sobre su montón, se junta
  Z.ponerEn = function (AJ, m, cosa, gx, gy, gr) {
    if (!Z.cabeEn(AJ, m, cosa.id, gr, gx, gy)) return Z.error('noCabe', { id: cosa.id });
    m.piezas.push(Object.assign({ uid: ++m.uid, id: cosa.id, n: cosa.n, gx, gy, gr: gr % 4 }, cosa.dur != null ? { dur: cosa.dur } : AJ.armas[cosa.id] && AJ.armas[cosa.id].dur ? { dur: AJ.armas[cosa.id].dur } : {}));
    return Z.ok(true);
  };
  // ordenar: vuelve a colocarlo todo, de lo más grande a lo más pequeño
  Z.ordenar = function (AJ, m) {
    const cosas = m.piezas.map((p) => ({ id: p.id, n: p.n, dur: p.dur })).sort((a, b) => Z.formaDe(AJ, b.id).c.length - Z.formaDe(AJ, a.id).c.length);
    const nueva = Z.nuevaMochila(m.w, m.h); nueva.uid = m.uid;
    for (const c of cosas) if (Z.meter(AJ, nueva, c.id, c.n, c.dur)) return Z.error('noCabe');
    m.piezas = nueva.piezas; m.uid = Math.max(m.uid, nueva.uid);
    return Z.ok(true);
  };
})(ZOM);
