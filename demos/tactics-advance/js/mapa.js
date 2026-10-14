// Fans of Tactics Advance (prototipo) · MAPA: casillas en diagonal con alturas. Cada casilla se pinta una vez, píxel a píxel (hierba con
// matas, tierra, losas, acantilados con vetas y piedras, muros), y el agua se anima en cada fotograma con su espuma.
'use strict';

const HU = 8, BASE = 14, BAJA_AGUA = 3;   // alto de cada escalón, lo que asoma por debajo del suelo y cuánto baja el agua

// colores de cada material, de más claro a más oscuro
const MAT = {
  hierba:  ['#c4e878', '#94d052', '#6ab63e', '#4c9636', '#33742e', '#225426'],
  tierra:  ['#f2d090', '#dcb070', '#c29254', '#a0723e', '#7a542c', '#56381e'],
  losa:    ['#dadae6', '#bcbccc', '#9e9eb2', '#808096', '#62627a', '#46465c'],
  roca:    ['#d8a46a', '#b8844e', '#96663a', '#764c2a', '#58361e', '#3c2414', '#24160c'],
  muro:    ['#cfcfdc', '#b0b0c2', '#9292a8', '#76768e', '#5c5c74', '#42425a', '#2a2a3e'],
  agua:    ['#f4fbff', '#a6d8fa', '#6cb0f0', '#4a8ade', '#3468bc', '#244a92'],
  moqueta: ['#b4bee6', '#96a2d4', '#7a86be', '#626ea4', '#4c5788', '#38406a'],
  baldosa: ['#fff6e2', '#ece0c6', '#d4c6a6', '#b6a684', '#928264', '#6c5e48'],
  marmol:  ['#ffffff', '#eceef4', '#d6dae6', '#b8becc', '#969cae', '#747a8e'],
  pared:   ['#d0d4de', '#b4b9c7', '#989eae', '#7c8296', '#62687c', '#4a4f62', '#30333f'],
  foso:    ['#4a5670', '#38425a', '#2a3246', '#1e2434', '#141824', '#0a0c14'],
};

// el mapa (10 × 10): alturas y suelo de cada casilla. g = hierba/moqueta, d = camino/baldosa, s = losa/mármol, w = agua/foso
const ALT = [
  [4, 4, 4, 3, 3, 2, 2, 1, 0, 0],
  [4, 4, 3, 3, 2, 2, 2, 1, 0, 0],
  [4, 3, 3, 2, 2, 2, 1, 1, 0, 0],
  [3, 3, 2, 2, 2, 1, 1, 1, 1, 0],
  [3, 2, 2, 2, 1, 1, 1, 1, 1, 1],
  [2, 2, 2, 1, 1, 1, 2, 2, 1, 1],
  [1, 1, 1, 1, 1, 2, 3, 3, 2, 1],
  [0, 0, 1, 1, 1, 2, 3, 3, 2, 1],
  [0, 0, 0, 1, 1, 1, 2, 2, 1, 1],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1]];
const TIPO = [
  'ggggggggww',
  'gssgggdgww',
  'gssgdddgww',
  'gggddggggw',
  'gggdgggggg',
  'ggdggggggg',
  'gddggsssgg',
  'wwdgggssgg',
  'wwwdgggggg',
  'wwwwdggggg'];
const N = 10;
const altura = (gx, gy) => (gx < 0 || gy < 0 || gx >= N || gy >= N) ? -9 : ALT[gy][gx];
const esAgua = (gx, gy) => gx >= 0 && gy >= 0 && gx < N && gy < N && TIPO[gy][gx] === 'w';

// posición en el mundo (sin cámara): esquina de arriba de la casilla
const wx = (gx, gy) => (gx - gy) * 16;
const wy = (gx, gy, h) => (gx + gy) * 8 - h * HU;
const alturaPx = (gx, gy) => esAgua(gx, gy) ? -BAJA_AGUA / HU : altura(gx, gy);

// ruido suave (para manchas grandes en la hierba)
function ruido(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/* ---------- cara de arriba ---------- */
function colorArriba(esc, tipo, gx, gy, x, r) {
  const nombre = esc.suelo[tipo], M = MAT[nombre];
  const ox = 16 + wx(gx, gy), oy = wy(gx, gy, 0);           // píxel del mundo (para que la textura siga entre casillas)
  const X = x + ox, Y = r + oy;
  const xx = x - 15.5, yy = r + 0.5;
  const a = (xx / 16 + yy / 8) / 2, b = (yy / 8 - xx / 16) / 2;  // posición dentro de la casilla (0..1 por cada eje)
  let i = 2, col = null;
  if (nombre === 'hierba') {
    const n = ruido(X / 11, Y / 6, 3);
    if (n > 0.62 + (bayer(X, Y) - 0.5) * 0.18) i = 3;
    else if (n < 0.3 + (bayer(X, Y) - 0.5) * 0.18) i = 1;
    const h1 = hash(X, Y, 11);
    if (h1 < 0.025) i = Math.max(0, i - 1); else if (h1 > 0.975) i = Math.min(5, i + 1);
    // matas en «v»
    const cx = Math.floor(X / 5), cy = Math.floor(Y / 4), ph = hash(cx, cy, 5);
    if (ph < 0.34) {
      const tx = cx * 5 + 1 + Math.floor(hash(cx, cy, 6) * 2), ty = cy * 4 + 1 + Math.floor(hash(cx, cy, 7) * 2);
      const dx = X - tx, dy = Y - ty;
      if ((dy === 1 && dx === 1) || (dy === 0 && (dx === 0 || dx === 2))) i = 4;
      else if (dy === -1 && (dx === 0 || dx === 2)) i = Math.max(0, i - 2);
    }
    if (esc.flores && hash(X, Y, 21) < 0.006) col = ['#ffffff', '#ffe066', '#ff9ec8'][Math.floor(hash(X, Y, 22) * 3)];
  } else if (nombre === 'tierra' || nombre === 'baldosa' && false) {
    const h1 = hash(X, Y, 13);
    i = h1 < 0.06 ? 1 : h1 > 0.93 ? 3 : 2;
    if (ruido(X / 7, Y / 4, 9) > 0.66) i = Math.min(4, i + 1);
    const cx = Math.floor(X / 6), cy = Math.floor(Y / 4);
    if (hash(cx, cy, 14) < 0.3) {
      const tx = cx * 6 + 2, ty = cy * 4 + 1;
      if (Y === ty && (X === tx || X === tx + 1)) i = 0; else if (Y === ty + 1 && (X === tx || X === tx + 1)) i = 4;
    }
  } else if (nombre === 'losa') {
    const A = a * 3, B = b * 3, fila = Math.floor(B), A2 = A + (fila % 2) * 0.5;
    const fa = A2 - Math.floor(A2), fb = B - fila, celda = hash(Math.floor(A2), fila, gx * 31 + gy);
    if (fa < 0.13 || fb < 0.16) { i = 4; if (esc.musgo && hash(X, Y, 3) < 0.35) col = '#5c8a3e'; }
    else if (fa < 0.3 || fb < 0.36) i = 1;
    else if (fa > 0.86 || fb > 0.84) i = 3;
    else i = celda < 0.3 ? 1 : 2;
    if (hash(X, Y, 19) < 0.04) i = Math.min(5, i + 1);
  } else if (nombre === 'moqueta') {
    i = ((X + Y) & 1) && hash(X, Y, 4) < 0.6 ? 3 : 2;
    const fb = b * 4 - Math.floor(b * 4);
    if (fb < 0.08) i = 3;
  } else if (nombre === 'baldosa') {
    const fa = a * 2 - Math.floor(a * 2), fb = b * 2 - Math.floor(b * 2);
    if (fa < 0.07 || fb < 0.09) i = 4;
    else if (fa < 0.2 || fb < 0.22) i = 1;
    else i = hash(X, Y, 2) < 0.08 ? 3 : 2;
  } else if (nombre === 'marmol') {
    const v = Math.sin(X * 0.35 + Math.sin(Y * 0.5) * 2.2 + gx) + Math.sin(Y * 0.22 - X * 0.1);
    i = v > 1.45 ? 3 : v > 1.1 ? 2 : 1;
    const fa = a * 2 - Math.floor(a * 2), fb = b * 2 - Math.floor(b * 2);
    if (fa < 0.06 || fb < 0.08) i = 3;
  }
  return { i, col, M, a, b };
}

/* ---------- caras de los lados ---------- */
// v = píxeles por debajo del borde de arriba; H = alto de la cara; der = cara derecha (en sombra)
function colorLado(esc, tipo, gx, gy, x, v, H, der) {
  const nombre = esc.lado[tipo], M = MAT[nombre];
  const X = x + 16 + wx(gx, gy);
  let i = der ? 2 : 1;
  if (nombre === 'roca') {
    const ond = Math.floor(ruido(X / 6, gy * 3 + gx, 4) * 3);
    const L = v + ond + Math.floor(hash(gx, gy, 9) * 4), banda = Math.floor(L / 5), f = L % 5;
    if (f === 0) i -= 1; else if (f === 4) i += 1;
    const piedra = hash(Math.floor((X + banda * 3) / 5), banda, 17);
    if (piedra < 0.22 && f >= 1 && f <= 3) { i -= 1; if (f === 3) i += 2; }
    if (hash(X, v + gy * 37, 23) < 0.06) i += 1;
  } else if (nombre === 'muro') {
    const fila = Math.floor(v / 4), f = v % 4, cx = X + (fila % 2) * 4;
    if (f === 3 || cx % 8 === 7) i += 2;
    else if (f === 0) i -= 1;
    else if (hash(Math.floor(cx / 8), fila, gx * 7 + gy) < 0.3) i += 1;
    if (esc.musgo && f === 3 && hash(X, fila, 5) < 0.25) return { col: '#4e7a36', M };
  } else if (nombre === 'pared') {
    if (v < 2) i = der ? 1 : 0;
    else if (v === 2) i += 2;
    else if (X % 12 === 0) i += 1;
    if (v > 2 && (v - 3) % HU === HU - 1) i += 1;
  }
  // se oscurece hacia abajo y la última fila hace de borde
  if (v >= 7) i += 1;
  if (v >= 18) i += 1;
  if (v >= H - 3) i += 1;
  if (v === H - 1) i = M.length - 1;
  return { i: Math.max(0, Math.min(M.length - 1, i)), M };
}

/* ---------- se pinta cada casilla una vez ---------- */
function hazCasilla(esc, gx, gy) {
  const agua = esAgua(gx, gy), h = agua ? 0 : altura(gx, gy);
  const tipo = TIPO[gy][gx];
  const H = agua ? BASE - BAJA_AGUA : h * HU + BASE;
  const W = 32, HT = 16 + H;
  const c = document.createElement('canvas'); c.width = W; c.height = HT;
  const g = c.getContext('2d'), img = g.createImageData(W, HT), d = new Uint32Array(img.data.buffer);
  const pon = (x, y, hex) => { if (x >= 0 && y >= 0 && x < W && y < HT) d[y * W + x] = rgba(hex); };
  // vecinos (para la sombra de las paredes de detrás)
  const hDetI = altura(gx - 1, gy), hDetD = altura(gx, gy - 1);
  const hierbaArriba = esc.suelo[tipo] === 'hierba';
  if (!agua) {
    for (let r = 0; r < 16; r++) {
      const hw = r < 8 ? (r + 1) * 2 : (16 - r) * 2;
      for (let x = 16 - hw; x < 16 + hw; x++) {
        const { i, col, M } = colorArriba(esc, tipo, gx, gy, x, r);
        let k = i;
        const izq = x < 16 - hw + 2, der = x >= 16 + hw - 2;
        if (r >= 8 && izq) k = Math.max(0, k - 1 - (x === 16 - hw ? 1 : 0));          // borde de delante a la izquierda: luz
        else if (r >= 8 && der) k = x === 16 + hw - 1 ? Math.min(5, k + 1) : k;       // borde de delante a la derecha
        else if (r < 8 && izq) k = hDetI > h ? 4 : Math.min(5, k + (x === 16 - hw ? 1 : 0));   // detrás: sombra si hay pared
        else if (r < 8 && der) k = hDetD > h ? 4 : Math.min(5, k + (x === 16 + hw - 1 ? 1 : 0));
        pon(x, r, col && k === i ? col : M[k]);
      }
    }
  }
  // lados
  for (let x = 0; x < 32; x++) {
    const der = x >= 16, xm = der ? 31 - x : x;
    const y0 = (agua ? BAJA_AGUA : 0) + 9 + Math.floor(xm / 2);
    const caida = hierbaArriba ? 1 + Math.floor(hash(x, gx * 13 + gy, 31) * 3) : 0;
    for (let v = 0; v < H; v++) {
      let hex;
      if (agua) {
        const M = MAT[esc.agua];
        hex = M[Math.min(5, (v < 1 ? 2 : 3) + (der ? 1 : 0) + (v > 5 ? 1 : 0))];
      } else if (v < caida) {
        const M = MAT.hierba;
        hex = M[Math.min(5, (v === 0 ? 3 : 4) + (der ? 1 : 0))];
      } else {
        const { i, col, M } = colorLado(esc, tipo, gx, gy, x, v, H, der);
        hex = col || M[i];
        if (!col && !der && x === 15 && v < H - 2) hex = M[Math.max(0, i - 1)];              // la esquina de delante brilla un poco
      }
      pon(x, y0 + v, hex);
    }
  }
  g.putImageData(img, 0, 0);
  return { c, h, agua };
}

/* ---------- el agua (o el foso) se anima ---------- */
function pintaAgua(ctx, esc, gx, gy, X, Y, t) {
  const M = MAT[esc.agua], top = Y + BAJA_AGUA;
  const vec = [!esAgua(gx - 1, gy) && gx > 0, !esAgua(gx, gy - 1) && gy > 0, !esAgua(gx + 1, gy) && gx < N - 1, !esAgua(gx, gy + 1) && gy < N - 1];
  for (let r = 0; r < 16; r++) {
    const hw = r < 8 ? (r + 1) * 2 : (16 - r) * 2;
    for (let x = 16 - hw; x < 16 + hw; x++) {
      const xx = x - 15.5, yy = r + 0.5, a = (xx / 16 + yy / 8) / 2, b = (yy / 8 - xx / 16) / 2;
      const PX = x + 16 + wx(gx, gy), PY = r + wy(gx, gy, 0);
      let i;
      if (esc.agua === 'agua') {
        const w = Math.sin(PX * 0.42 + PY * 0.9 + t * 2.2) + Math.sin(PX * 0.17 - PY * 0.6 - t * 1.4) * 0.8;
        i = w > 1.35 ? 1 : w > 0.8 ? 2 : w < -1.2 ? 4 : 3;
        if (hash(PX, PY, Math.floor(t * 3)) < 0.008) i = 0;
        const esp = 0.1 + 0.04 * Math.sin(t * 3 + PX * 0.5);
        const dist = Math.min(vec[0] ? a : 9, vec[1] ? b : 9, vec[2] ? 1 - a : 9, vec[3] ? 1 - b : 9);
        if (dist < esp) i = 0; else if (dist < esp + 0.07) i = 1;
      } else {
        const fa = a * 4 - Math.floor(a * 4);
        i = fa < 0.22 ? 1 : 4;
        if ((r === 7 || r === 8) && x % 6 === 3) i = 3;
        const led = hash(gx * 5 + Math.floor(x / 6), gy, Math.floor(t * 2 + x));
        if (fa >= 0.22 && led < 0.03) { ctx.fillStyle = led < 0.015 ? '#5cff9a' : '#ff5a6a'; ctx.fillRect(X + x, top + r, 1, 1); continue; }
      }
      ctx.fillStyle = M[i]; ctx.fillRect(X + x, top + r, 1, 1);
    }
  }
}

// rombo de una casilla (relleno o solo el borde) para casillas marcadas y el cursor
function rombo(ctx, X, Y, color, alfa = 1) {
  ctx.globalAlpha = alfa; ctx.fillStyle = color;
  for (let r = 0; r < 16; r++) { const hw = r < 8 ? (r + 1) * 2 : (16 - r) * 2; ctx.fillRect(X + 16 - hw, Y + r, hw * 2, 1); }
  ctx.globalAlpha = 1;
}
function romboBorde(ctx, X, Y, color, inset = 0) {
  ctx.fillStyle = color;
  for (let r = inset; r < 16 - inset; r++) {
    const hw = (r < 8 ? (r + 1) * 2 : (16 - r) * 2) - inset * 2;
    if (hw <= 0) continue;
    ctx.fillRect(X + 16 - hw, Y + r, 2, 1); ctx.fillRect(X + 16 + hw - 2, Y + r, 2, 1);
  }
}
// casilla marcada al estilo de los juegos de tácticas: color suave que late y un borde claro
function marca(ctx, X, Y, tono, t) {
  const C = { azul: ['#3a8cff', '#bfe0ff', 0.38], rojo: ['#ff3a4a', '#ffd0d0', 0.46], rosa: ['#ff6a7a', '#ffb8c0', 0.22] }[tono] || ['#ffd23a', '#fff4b0', 0.4];
  rombo(ctx, X, Y, C[0], C[2] + Math.sin(t * 5) * 0.08);
  romboBorde(ctx, X, Y, C[1], 1);
}
// el cursor: el borde de la casilla parpadea y cuatro flechitas apuntan hacia dentro
const PUNTA = ['kkkkkkk', 'kyyyyyk', '.kyyyk.', '..kyk..', '...k...'];
function cursor(ctx, X, Y, t) {
  romboBorde(ctx, X, Y, '#1c1028', 0);
  romboBorde(ctx, X, Y, Math.floor(t * 6) % 2 ? '#fff7b0' : '#ffd23a', 1);
  const e = Math.floor(t * 4) % 2;
  const pon = (x, y, giro) => {
    for (let j = 0; j < 5; j++) for (let i = 0; i < 7; i++) {
      const ch = PUNTA[j][i]; if (ch === '.') continue;
      ctx.fillStyle = ch === 'k' ? '#1c1028' : '#ffe86a';
      if (giro === 0) ctx.fillRect(x - 3 + i, y + j, 1, 1);          // arriba, apunta abajo
      if (giro === 2) ctx.fillRect(x - 3 + i, y - j, 1, 1);          // abajo, apunta arriba
      if (giro === 1) ctx.fillRect(x - j, y - 3 + i, 1, 1);          // derecha, apunta a la izquierda
      if (giro === 3) ctx.fillRect(x + j, y - 3 + i, 1, 1);          // izquierda, apunta a la derecha
    }
  };
  pon(X + 16, Y - 6 - e, 0); pon(X + 16, Y + 21 + e, 2); pon(X + 37 + e, Y + 7, 1); pon(X - 6 - e, Y + 7, 3);
}
