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
  function ruedas(z, x, y) {
    for (const [x0, y0, x1, y1] of RUEDAS) {
      if (z > 5 || x < x0 || x > x1 || y < y0 || y > y1) continue;
      const exterior = (x === x0 && x0 === 0) || (x === x1 && x1 === 23), mitad = y >= y0 + 2 && y <= y1 - 2;
      if (exterior && z >= 1 && z <= 4 && mitad) return (z === 2 || z === 3) && y >= y0 + 3 && y <= y1 - 3 ? FIJOS.buje : FIJOS.llanta;
      return z === 5 ? FIJOS.ruedaT : FIJOS.rueda;
    }
    return null;
  }
  function luces(z, x, y, s) {
    const [x0, y0, x1, y1] = s, frente = y <= y0 + 1, cola = y >= y1 - 1;
    if (frente && z >= 5 && z <= 7 && (x <= x0 + 5 || x >= x1 - 5)) return x === x0 + 2 || x === x1 - 2 ? FIJOS.faroO : FIJOS.faro;
    if (frente && z <= 5 && x >= 8 && x <= 15) return FIJOS.rejilla;
    if (cola && z >= 6 && z <= 7 && (x <= x0 + 5 || x >= x1 - 5)) return FIJOS.piloto;
    return null;
  }
  function carro(z, x, y, C) {
    const s = CARRO[z];
    if (!s || !enRedondo(x, y, ...s)) return null;
    if (z <= 4 && RUEDAS.some(([a, b, c, d]) => x >= a - 1 && x <= c + 1 && y >= b - 1 && y <= d + 1)) return null;   // pasos de rueda
    const luz = luces(z, x, y, s);
    if (luz) return luz;
    const [x0, , x1] = s, rim = filo(x, y, s);
    if ((x === x0 || x === x1) && z >= 6 && z <= 7 && y >= 19 && y <= 25) return FIJOS.toma;
    if (z === 9 && y >= 8 && y <= 10 && (x === 6 || x === 7 || x === 16 || x === 17)) return FIJOS.toma;   // tomas del capó
    if (z === 9 && y >= 6 && y <= 7 && x >= 4 && x <= 19 && !RAYA(x)) return FIJOS.barra;               // barra de faros de rally
    if (RAYA(x)) return rim ? C.rayaS : C.raya;
    if (rim) return C.borde;
    return x === x0 + 1 || x === x1 - 1 ? C.medio : C.base;
  }
  function cabina(z, x, y, C) {
    const s = CABINA[z];
    if (!s || !enRedondo(x, y, ...s)) return null;
    const [x0, y0, x1, y1] = s, rim = filo(x, y, s);
    if (z === 13) return RAYA(x) ? (rim ? C.rayaS : C.raya) : rim ? C.borde : C.techo;
    if (!(x <= x0 + 1 || x >= x1 - 1 || y <= y0 + 1 || y >= y1 - 1)) return RAYA(x) ? C.raya : C.base;
    if (((y <= y0 + 1 || y >= y1 - 1) && (x <= x0 + 1 || x >= x1 - 1)) || (y >= y0 + 8 && y <= y0 + 9)) return C.medio;   // montantes
    return (y <= y0 + 1 && x >= x0 + 3 && x <= x0 + 6) || (x <= x0 + 1 && y >= y0 + 3 && y <= y0 + 5) ? FIJOS.reflejo : FIJOS.cristal;
  }
  function extras(z, x, y, C) {
    if (z >= 1 && z <= 3 && enRedondo(x, y, 3, 2, 20, 43, 3)) return FIJOS.bajos;
    if (z === 10 && y >= 14 && y <= 15 && (x <= 2 || x >= 21)) return C.medio;                              // retrovisores
    if (z >= 10 && z <= 11 && y >= 41 && y <= 42 && (x === 5 || x === 6 || x === 17 || x === 18)) return C.borde; // patas del alerón
    if (z >= 12 && z <= 13 && enRedondo(x, y, 1, 39, 22, 43, 1)) {
      const rim = y === 39 || y === 43 || x === 1 || x === 22;
      return RAYA(x) ? (rim ? C.rayaS : C.raya) : rim ? C.borde : C.base;
    }
    return null;
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
    return pila(22, 9, 26, (z, x, y) => {
      const tronco = disco(x - 7, y, 4, 3);
      if (z < 24 && tronco) return tronco.filo ? verde[0] : (x === 11 ? verde[2] : verde[1]);
      for (const [bx, z0, z1] of brazos) {
        if (z === z0 && y >= 3 && y <= 5 && ((bx < 11 && x >= bx && x <= 11) || (bx > 11 && x >= 11 && x <= bx))) return verde[1];
        const d = disco(x - bx + 4, y, 4, 2);
        if (z > z0 && z <= z1 && d) return d.filo ? verde[0] : verde[2];
      }
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
