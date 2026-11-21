// Fans of Rally · adaptador · HOJAS: la técnica de las lonchas apiladas (tarea #275). Cada cosa del mundo (coches, árboles, rocas,
// cactus, arcos de control) es un montón de hojas transparentes; en cada hoja está la cosa entera pintada a esa altura, como la ve
// alguien desde arriba. Apiladas muy juntas forman el volumen. Aquí se pintan una vez al arrancar, píxel a píxel y sin bordes de
// cubito (lo eligió Pepins sobre el primer boceto): luego vista.js solo las coloca. Devuelve { hojas: [canvas], an, la } por cosa.
'use strict';
RA.Hojas = (() => {
  // un número de 0 a 1 que depende solo de (x, y, z, s): grano fijo, igual en cada partida
  const ruido = (x, y, z, s = 0) => { const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 19.3) * 43758.5453; return n - Math.floor(n); };
  function pintaHoja(an, la, color) {
    const cv = document.createElement('canvas'); cv.width = an; cv.height = la;
    const g = cv.getContext('2d');
    for (let y = 0; y < la; y++) for (let x = 0; x < an; x++) { const c = color(x, y); if (c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); } }
    return cv;
  }
  function pila(an, la, alto, pinta) {
    const hojas = [];
    for (let z = 0; z < alto; z++) hojas.push(pintaHoja(an, la, (x, y) => pinta(z, x, y)));
    const sombra = document.createElement('canvas'); sombra.width = an; sombra.height = la;
    const gs = sombra.getContext('2d');
    hojas.forEach(h => gs.drawImage(h, 0, 0));
    gs.globalCompositeOperation = 'source-in'; gs.fillStyle = '#000'; gs.fillRect(0, 0, an, la);
    return { hojas, sombra, an, la };
  }
  const enRedondo = (x, y, x0, y0, x1, y1, r) => {
    if (x < x0 || x > x1 || y < y0 || y > y1) return false;
    const cx = x < x0 + r ? x0 + r : x > x1 - r ? x1 - r : x, cy = y < y0 + r ? y0 + r : y > y1 - r ? y1 - r : y;
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r + 0.5;
  };
  const filo = (x, y, s) => !enRedondo(x - 1, y, ...s) || !enRedondo(x + 1, y, ...s) || !enRedondo(x, y - 1, ...s) || !enRedondo(x, y + 1, ...s);

  // ---------------- el coche de rally (24 x 46, 14 hojas), con los colores de su piloto
  const AN = 24, LA = 46, ALTO = 14;
  const FIJOS = { rueda: '#16161c', ruedaT: '#26262e', llanta: '#8c96a4', buje: '#d0d6e0', bajos: '#0d1532', cristal: '#1e2438', reflejo: '#5f80b4',
    faro: '#fff6c0', faroO: '#ffcf3a', piloto: '#ff3242', rejilla: '#0a0d15', toma: '#0b0f1e', barra: '#ffd23f' };
  const RAYA = x => (x >= 9 && x <= 10) || (x >= 13 && x <= 14);
  const RUEDAS = [[0, 7, 3, 14], [20, 7, 23, 14], [0, 32, 3, 39], [20, 32, 23, 39]];
  const CARRO = { 3: [1, 1, 22, 44, 4], 4: [1, 1, 22, 44, 4], 5: [1, 1, 22, 44, 4], 6: [1, 1, 22, 44, 5], 7: [1, 2, 22, 44, 5], 8: [1, 3, 22, 44, 5], 9: [2, 5, 21, 43, 5] };
  const CABINA = { 10: [3, 13, 20, 33, 3], 11: [4, 14, 19, 32, 3], 12: [4, 15, 19, 31, 3], 13: [5, 16, 18, 30, 3] };
  // ayudas para leer las formas sin ristras de comparaciones
  const entre = (v, a, b) => v >= a && v <= b;
  const caja = (x, y, x0, y0, x1, y1) => entre(x, x0, x1) && entre(y, y0, y1);
  const uno = (v, ...lista) => lista.includes(v);
  const conRaya = (x, rim, C, resto) => (RAYA(x) ? (rim ? C.rayaS : C.raya) : rim ? C.borde : resto);
  // la cara de fuera de una rueda: llanta, y en su centro el buje
  function llanta(z, y, y0, y1) {
    if (!entre(z, 1, 4) || !entre(y, y0 + 2, y1 - 2)) return null;
    return entre(z, 2, 3) && entre(y, y0 + 3, y1 - 3) ? FIJOS.buje : FIJOS.llanta;
  }
  function ruedas(z, x, y) {
    if (z > 5) return null;
    for (const [x0, y0, x1, y1] of RUEDAS) {
      if (!caja(x, y, x0, y0, x1, y1)) continue;
      const cara = uno(x, 0, 23) ? llanta(z, y, y0, y1) : null;
      return cara || (z === 5 ? FIJOS.ruedaT : FIJOS.rueda);
    }
    return null;
  }
  function luces(z, x, y, s) {
    const [x0, y0, x1, y1] = s, frente = y <= y0 + 1, cola = y >= y1 - 1, esquina = x <= x0 + 5 || x >= x1 - 5;
    if (frente && esquina && entre(z, 5, 7)) return uno(x, x0 + 2, x1 - 2) ? FIJOS.faroO : FIJOS.faro;
    if (frente && z <= 5 && entre(x, 8, 15)) return FIJOS.rejilla;
    return cola && esquina && entre(z, 6, 7) ? FIJOS.piloto : null;
  }
  const enPasoDeRueda = (x, y) => RUEDAS.some(([a, b, c, d]) => caja(x, y, a - 1, b - 1, c + 1, d + 1));
  // tomas de aire de los lados y del capó, y la barra de faros de rally
  function detalles(z, x, y, x0, x1) {
    if (uno(x, x0, x1) && entre(z, 6, 7) && entre(y, 19, 25)) return FIJOS.toma;
    if (z !== 9) return null;
    if (entre(y, 8, 10) && uno(x, 6, 7, 16, 17)) return FIJOS.toma;
    return entre(y, 6, 7) && entre(x, 4, 19) && !RAYA(x) ? FIJOS.barra : null;
  }
  function carro(z, x, y, C) {
    const s = CARRO[z];
    if (!s || !enRedondo(x, y, ...s)) return null;
    if (z <= 4 && enPasoDeRueda(x, y)) return null;
    const [x0, , x1] = s;
    return luces(z, x, y, s) || detalles(z, x, y, x0, x1) || conRaya(x, filo(x, y, s), C, uno(x, x0 + 1, x1 - 1) ? C.medio : C.base);
  }
  // el aro de cristales de la cabina: montantes, reflejos y cristal
  function cristales(x, y, x0, y0, x1, y1, C) {
    const alLado = x <= x0 + 1 || x >= x1 - 1, alFrente = y <= y0 + 1 || y >= y1 - 1;
    if ((alLado && alFrente) || entre(y, y0 + 8, y0 + 9)) return C.medio;   // montantes
    const reflejo = (y <= y0 + 1 && entre(x, x0 + 3, x0 + 6)) || (x <= x0 + 1 && entre(y, y0 + 3, y0 + 5));
    return reflejo ? FIJOS.reflejo : FIJOS.cristal;
  }
  function cabina(z, x, y, C) {
    const s = CABINA[z];
    if (!s || !enRedondo(x, y, ...s)) return null;
    const [x0, y0, x1, y1] = s;
    if (z === 13) return conRaya(x, filo(x, y, s), C, C.techo);
    if (caja(x, y, x0 + 2, y0 + 2, x1 - 2, y1 - 2)) return RAYA(x) ? C.raya : C.base;
    return cristales(x, y, x0, y0, x1, y1, C);
  }
  function aleron(z, x, y, C) {
    if (entre(z, 10, 11) && entre(y, 41, 42) && uno(x, 5, 6, 17, 18)) return C.borde;   // patas del alerón
    if (!entre(z, 12, 13) || !enRedondo(x, y, 1, 39, 22, 43, 1)) return null;
    return conRaya(x, uno(y, 39, 43) || uno(x, 1, 22), C, C.base);
  }
  function extras(z, x, y, C) {
    if (entre(z, 1, 3) && enRedondo(x, y, 3, 2, 20, 43, 3)) return FIJOS.bajos;
    if (z === 10 && entre(y, 14, 15) && !entre(x, 3, 20)) return C.medio;   // retrovisores
    return aleron(z, x, y, C);
  }
  const coche = C => pila(AN, LA, ALTO, (z, x, y) => ruedas(z, x, y) || carro(z, x, y, C) || cabina(z, x, y, C) || extras(z, x, y, C));

  // ---------------- los adornos del paisaje: troncos y copas redondas, hechos por perfiles de radio según la altura
  // disco(x, y, centro, radio): dentro, en el filo o fuera; con la luz arriba a la izquierda
  function disco(x, y, c, r) {
    const d = Math.hypot(x - c, y - c);
    if (d > r + 0.35) return null;
    return { filo: d > r - 1.1, luz: (x - c) + (y - c) < -r * 0.45, sombra: (x - c) + (y - c) > r * 0.5 };
  }
  function copa(z, x, y, c, r, pal, s) {
    const d = disco(x, y, c, r);
    if (!d) return null;
    const n = ruido(x, y, z, s);
    if (d.luz && n > 0.35) return pal[2];
    if (d.sombra || (d.filo && n > 0.5)) return pal[0];
    return n > 0.82 ? pal[2] : pal[1];
  }
  function arbol(s) {
    const T = 26, c = 13, hojas = ['#1f5a24', '#2f7d32', '#58a844'], tronco = ['#4a3018', '#6c4628'];
    return pila(27, 27, 26, (z, x, y) => {
      if (z >= 8) { const r = 12 * Math.sin(Math.PI * (z - 6) / (T - 5)) + 1; return copa(z, x, y, c, Math.min(12.5, r), hojas, s); }
      const d = disco(x, y, c, z < 2 ? 3 : 2);
      return d ? (d.luz ? tronco[1] : tronco[0]) : null;
    });
  }
  function pino(s, nevado) {
    const c = 10, verdes = ['#123d2a', '#1d5c3c', '#2f7d50'], nieve = '#f4f8ff';
    return pila(21, 21, 30, (z, x, y) => {
      if (z < 4) { const d = disco(x, y, c, 2); return d ? '#4a3018' : null; }
      const piso = (z - 4) % 9, r = (10 - Math.floor((z - 4) / 9) * 2.6) * (1 - piso / 11);
      const col = copa(z, x, y, c, r, verdes, s);
      if (col && nevado && piso >= 5 && ruido(x, y, z, s + 3) > 0.35) return nieve;
      return col;
    });
  }
  function roca(s, pal) {
    return pila(22, 18, 9, (z, x, y) => {
      const r = 9.5 * Math.sqrt(1 - z / 9.5), d = Math.hypot((x - 11) * 0.85, y - 9) + ruido(Math.round(x / 3), Math.round(y / 3), 0, s) * 2.2;
      if (d > r) return null;
      const n = ruido(x, y, z, s);
      if (z >= 7 && pal[3]) return n > 0.25 ? pal[3] : pal[2];
      if (d > r - 1.2) return pal[0];
      return (x + y < 18 && n > 0.3) ? pal[2] : pal[1];
    });
  }
  function cactus(s) {
    const verde = ['#1f6b34', '#2f9045', '#5cc36a'];
    const brazos = [[4, 9, 13, 18], [17, 12, 15, 21]];   // [x, desde z, hasta z, ...]
    // el brazo: un codo a la altura z0 que une con el tronco, y de ahí sube hasta z1
    function brazo(z, x, y, [bx, z0, z1]) {
      const codo = bx < 11 ? entre(x, bx, 11) : entre(x, 11, bx);
      if (z === z0 && entre(y, 3, 5) && codo && bx !== 11) return verde[1];
      const d = z > z0 && z <= z1 ? disco(x - bx + 4, y, 4, 2) : null;
      return d ? (d.filo ? verde[0] : verde[2]) : null;
    }
    return pila(22, 9, 26, (z, x, y) => {
      const tronco = disco(x - 7, y, 4, 3);
      if (z < 24 && tronco) return tronco.filo ? verde[0] : (x === 11 ? verde[2] : verde[1]);
      for (const b of brazos) { const c = brazo(z, x, y, b); if (c) return c; }
      return z === 24 && disco(x - 7, y, 4, 2) ? '#ff6fb1' : null;   // una flor arriba
    });
  }
  function palmera(s) {
    const tronco = ['#7a5230', '#9a6a3e'], hojas = ['#1f6b34', '#3a9a4a', '#6cc85a'];
    return pila(33, 33, 30, (z, x, y) => {
      const cx = 16 + Math.round(z * 0.12), cy = 16;
      if (z < 26) { const d = disco(x - cx + 2, y - cy + 2, 2, 2); return d ? (z % 3 === 0 ? tronco[0] : tronco[1]) : null; }
      const dx = x - cx, dy = y - cy, ang = Math.atan2(dy, dx), dist = Math.hypot(dx, dy), caida = (z - 26) * 2.6;
      const brazo = Math.abs(((ang * 7 / (2 * Math.PI)) % 1 + 1) % 1 - 0.5) < 0.16 + 0.04 * Math.sin(dist);
      if (!brazo || dist > 15 || dist < caida) return dist < 2.5 && z === 26 ? '#5a3a1e' : null;
      return hojas[dist > 11 ? 0 : ruido(x, y, z, s) > 0.6 ? 2 : 1];
    });
  }
  function tronco(s) {
    return pila(26, 10, 7, (z, x, y) => {
      const r = 3.6 * Math.sqrt(Math.max(0, 1 - ((z - 3) / 3.6) ** 2));
      if (Math.abs(y - 5) > r || x < 1 || x > 24) return null;
      if (x === 1 || x === 24) return '#c9a26a';
      return ruido(x, y, z, s) > 0.7 ? '#4a3018' : '#6c4628';
    });
  }
  // el arco de un control de tiempo (o la meta, a cuadros)
  function arco(meta, ancho) {
    const an = Math.round(ancho + 16), mitad = an / 2;
    return pila(an, 6, 26, (z, x, y) => {
      const poste = x <= 3 || x >= an - 4;
      if (z < 20) return poste && y >= 1 && y <= 4 ? (z % 4 < 2 ? '#ff8a1f' : '#f2f5ff') : null;
      if (y < 1 || y > 4 || z > 24) return null;
      if (meta) return (Math.floor(x / 3) + Math.floor(z / 2)) % 2 ? '#10141c' : '#f2f5ff';
      return Math.abs(x - mitad) < 10 && z >= 21 && z <= 23 ? '#ffd23f' : '#ff8a1f';
    });
  }
  const ROCAS = { roca: ['#8a5a2b', '#b9783e', '#d9a066'], rocaNieve: ['#4d5566', '#6c7688', '#8e98aa', '#f4f8ff'] };
  // los adornos de un tramo, cuatro de cada clase (con grano distinto) para que no se repitan
  function adornos(nombres) {
    const fabrica = { arbol, pino: s => pino(s, false), pinoNevado: s => pino(s, true), cactus, palmera, tronco,
      roca: s => roca(s, ROCAS.roca), rocaNieve: s => roca(s, ROCAS.rocaNieve) };
    const out = {};
    for (const n of new Set(nombres)) out[n] = [1, 2, 3, 4].map(s => fabrica[n](s));
    return out;
  }
  return { coche, adornos, arco, ALTO_COCHE: ALTO, AN_COCHE: AN, LA_COCHE: LA };
})();
