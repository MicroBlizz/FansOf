// Fans of Island · adaptadores/lonchas: las piezas comunes de la técnica de lonchas apiladas (skill /lonchear, camino A: todo pintado
// por código). IS.Lonchas: pila() hace una imagen por altura; girada() las apila giradas (personajes) y quieta() sin girar (escenario).
// IS.TAREAS es la lista de piezas que se fabrican de una en una al cargar (cada tarea recibe el nivel), para no congelar el móvil.
'use strict';
{
const K = 0.34, ANG = 64, BORDE = '#2a1830';   // K = cuánto se ve el suelo desde arriba (bajo = cámara casi de lado); ANG = ángulos guardados
const dentro = (dx, dy, dz, rx, ry, rz) => (dx / rx) ** 2 + (dy / ry) ** 2 + (dz / rz) ** 2 <= 1;
const mezcla = (a, b, t) => a + (b - a) * t;
function dist2Seg(px, py, pz, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1], vz = b[2] - a[2];
  let t = ((px - a[0]) * vx + (py - a[1]) * vy + (pz - a[2]) * vz) / (vx * vx + vy * vy + vz * vz);
  t = Math.max(0, Math.min(1, t));
  const qx = a[0] + vx * t - px, qy = a[1] + vy * t - py, qz = a[2] + vz * t - pz;
  return qx * qx + qy * qy + qz * qz;
}
const RGB = new Map();
function rgb(h) {
  let v = RGB.get(h);
  if (!v) { v = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; RGB.set(h, v); }
  return v;
}
function pinta(w, h, fn) {   // un lienzo w x h pintado píxel a píxel: fn(x, y) da el color o null
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const col = fn(x, y); if (!col) continue;
    const v = rgb(col), i = (y * w + x) * 4;
    d[i] = v[0]; d[i + 1] = v[1]; d[i + 2] = v[2]; d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return c;
}
// Una pila de lonchas: una imagen por altura (z). fn(z, x, y) da el color o null.
function pila(an, fo, al, fn) {
  const hojas = [];
  for (let z = 0; z < al; z++) hojas.push(pinta(an, fo, (x, y) => fn(z, x, y)));
  return { hojas, an, fo, al, cache: new Map() };
}
function silueta(d, n) {   // 1 donde hay algo pintado (alfa > 0), 0 donde no
  const a = new Uint8Array(n);
  for (let i = 0; i < n; i++) a[i] = d[i * 4 + 3] > 0 ? 1 : 0;
  return a;
}
function tocaBorde(a, x, y, w, h) {   // un píxel vacío con un vecino (arriba, abajo, izquierda o derecha) pintado
  const i = y * w + x;
  return !a[i] && ((x > 0 && a[i - 1]) || (x < w - 1 && a[i + 1]) || (y > 0 && a[i - w]) || (y < h - 1 && a[i + w]));
}
function contorno(c) {   // raya oscura de un píxel alrededor de lo pintado
  const g = c.getContext('2d'), im = g.getImageData(0, 0, c.width, c.height), d = im.data, w = c.width, h = c.height;
  const a = silueta(d, w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!tocaBorde(a, x, y, w, h)) continue;
    const i = y * w + x;
    d[i * 4] = 0x2a; d[i * 4 + 1] = 0x18; d[i * 4 + 2] = 0x30; d[i * 4 + 3] = 255;
  }
  g.putImageData(im, 0, 0);
}
// Pila girada (personajes y objetos sueltos): una imagen por ángulo, con contorno, guardada para no repetirla
function girada(p, giro) {
  const paso = ((Math.round(giro / (Math.PI * 2) * ANG) % ANG) + ANG) % ANG;
  if (p.cache.has(paso)) return p.cache.get(paso);
  const R = Math.ceil(Math.hypot(p.an, p.fo) / 2) + 2;
  const c = document.createElement('canvas');
  c.width = 2 * R + 2; c.height = Math.ceil(2 * R * K) + p.al + 4;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const suelo = c.height - Math.ceil(R * K) - 2, ang = paso / ANG * Math.PI * 2;
  p.hojas.forEach((h, i) => {
    g.save(); g.translate(c.width / 2, suelo - i); g.scale(1, K); g.rotate(ang);
    g.drawImage(h, -p.an / 2, -p.fo / 2); g.restore();
  });
  contorno(c);
  const r = { c, suelo };
  p.cache.set(paso, r); return r;
}
// Pila quieta (el escenario): sin girar, cada loncha aplastada a K y subida 1 píxel
function quieta(p, borde) {
  const dk = Math.round(p.fo * K), m = borde ? 1 : 0;
  const c = document.createElement('canvas'); c.width = p.an + 2 * m; c.height = p.al + dk + 2 * m;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  p.hojas.forEach((h, i) => g.drawImage(h, 0, 0, p.an, p.fo, m, m + p.al - 1 - i, p.an, dk));
  if (borde) contorno(c);
  return { c, m, al: p.al, fo: p.fo };
}
IS.TAREAS = [];
IS.Lonchas = Object.freeze({ K, ANG, BORDE, dentro, mezcla, dist2Seg, plano: pinta, pila, girada, quieta });   // plano(w, h, fn): dibujo plano (fondos), fn(x, y)
}
