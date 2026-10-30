// Fans of Karts · LOS EFECTOS QUE SE VEN DE LOS OBJETOS NUEVOS, en pixel art (se pintan con cada kart, encima de su dibujo):
//   · Reembolso: una burbuja transparente con el contorno pixelado; un brillo blanco le va dando la vuelta y revela el borde, con su
//     reflejo arriba a la izquierda. Al final del plazo parpadea.
//   · Lag: el kart se ve «a trozos»: dos copias desplazadas y franjas rojas y cian, como una imagen que no carga.
//   · Influencer: el móvil con el aro de luz flota encima del kart, con destellos rosas.
//   · Tren del hype: líneas de velocidad rosas y amarillas a los lados.
'use strict';

// ---------- la burbuja ----------
// los puntos de un círculo hecho a cuadraditos (el de toda la vida: punto medio), con su ángulo; se guarda por radio
const ANILLOS = new Map();
function anilloPx(r) {
  r = Math.max(3, Math.round(r));
  if (ANILLOS.has(r)) return ANILLOS.get(r);
  const vistos = new Set(), pts = [];
  let x = r, y = 0, err = 1 - r;
  while (x >= y) {
    for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) { const k = a + ',' + b; if (!vistos.has(k)) { vistos.add(k); pts.push([a, b, Math.atan2(b, a)]); } }
    y++;
    if (err < 0) err += 2 * y + 1; else { x--; err += 2 * (y - x) + 1; }
  }
  ANILLOS.set(r, pts);
  return pts;
}
const distAng = (a, b) => { const d = Math.abs(((a - b) % TAU + TAU) % TAU); return Math.min(d, TAU - d); };
function pintaBurbuja(cx, cy, R, t, final) {
  const b = Math.max(CAL, Math.round(R / 11)), r = Math.max(4, Math.round(R / b)), pts = anilloPx(r);      // cuadraditos que crecen con la cercanía: siempre de unos 11 de radio
  const px = (i, j) => lx.fillRect(Math.round(cx + i * b), Math.round(cy + j * b), b, b);
  // dentro, un velo muy suave (fila a fila, para que siga siendo de cuadraditos)
  lx.globalAlpha = final ? 0.1 : 0.18; lx.fillStyle = '#c8f2ff';
  for (let j = -r + 1; j < r; j++) { const w = Math.floor(Math.sqrt(r * r - j * j)); lx.fillRect(Math.round(cx - w * b), Math.round(cy + j * b), (2 * w + 1) * b, b); }
  // un segundo aro por dentro, más flojo: el borde gana grosor y se ve sobre cualquier suelo
  lx.globalAlpha = final ? 0.18 : 0.3; lx.fillStyle = '#9fe6f8';
  for (const [i, j] of anilloPx(r - 1)) px(i, j);
  // el contorno: tenue por todo, y donde pasa el brillo se enciende (con estela)
  const a = t * 3.2;
  for (const [i, j, ang] of pts) {
    const d = distAng(ang, a), luz = d < 1.3 ? 1 - d / 1.3 : 0, base = 0.5 + 0.15 * Math.sin(ang * 3 + t * 2);
    lx.globalAlpha = Math.min(1, base + luz * 0.75); lx.fillStyle = luz > 0.5 ? '#ffffff' : luz > 0.15 ? '#c8f8ff' : '#6fd0ec';
    px(i, j);
  }
  lx.globalAlpha = 0.22; lx.fillStyle = '#1c4a66';
  for (const [i, j, ang] of anilloPx(r + 1)) if (Math.sin(ang) > 0.2) px(i, j);      // una sombrita por debajo: el borde se lee sobre la arena
  // el reflejo: un arquito blanco arriba a la izquierda y un punto
  lx.globalAlpha = 0.75; lx.fillStyle = '#ffffff';
  const rr = Math.max(2, Math.round(r * 0.62));
  for (const [i, j, ang] of anilloPx(rr)) if (ang < -1.95 && ang > -2.85) px(i, j);
  px(Math.round(-r * 0.25), Math.round(-r * 0.62));
  lx.globalAlpha = 1;
}

// ---------- el lag: copias desplazadas y franjas ----------
function pintaLag(k, sx, sy, e) {
  const rel = k.angVis - Math.atan2(k.y - CAM.y, k.x - CAM.x), y = Math.round(sy - k.z * e), d = Math.max(2, Math.round(2.5 * e)), f = Math.floor(RELOJ * 18);
  lx.globalAlpha = 0.35;
  k.fig.pinta(lx, Math.round(sx) - d - (f % 3), y, e * k.tam, BASE_KART, -rel);
  k.fig.pinta(lx, Math.round(sx) + d + (f % 2), y, e * k.tam, BASE_KART, -rel);
  lx.globalAlpha = 0.8;
  const az = azarDe(f * 7 + (k.idx | 0)), alto = Math.max(1, Math.round(e));
  for (let i = 0; i < 4; i++) {
    lx.fillStyle = i & 1 ? '#22e3ff' : '#ff3348';
    lx.fillRect(Math.round(sx + (az() - 0.5) * 22 * e), Math.round(sy - (k.z + az() * 14) * e), Math.round((4 + az() * 10) * e), alto);
  }
  lx.globalAlpha = 1;
}

// ---------- el tren del hype: líneas de velocidad ----------
function pintaTren(k, sx, sy, e) {
  const f = RELOJ * 6;
  for (let i = 0; i < 6; i++) {
    const lado = i & 1 ? 1 : -1, fase = (f + i * 0.37) % 1, x = Math.round(sx + lado * (11 + (i >> 1) * 3) * e), y = Math.round(sy - (2 + fase * 14) * e);
    lx.globalAlpha = 0.8 * (1 - fase); lx.fillStyle = i % 3 === 0 ? '#ffe14d' : '#ff3df0';
    lx.fillRect(x, y, Math.max(1, Math.round(e * 0.3)), Math.max(2, Math.round(3 * e)));
  }
  lx.globalAlpha = 1;
}

const pintaKartSinEfectos = pintaKart;
pintaKart = (k, sx, sy, e) => {
  if (k.lag && k.estado !== 'cae') pintaLag(k, sx, sy, e);
  pintaKartSinEfectos(k, sx, sy, e);
  if (alzaPuente(k) === null) return;      // escondido bajo un puente
  if (k.tTren > 0) pintaTren(k, sx, sy, e);
  if (k.tIman > 0) {
    const bote = Math.sin(RELOJ * 5) * 1.5;
    figCosa('influencer').pinta(lx, Math.round(sx), Math.round(sy - (k.z + 21 + bote) * e), e * 0.32, BASE_COSA, RELOJ * 2);
    if ((RELOJ * 8) % 1 < 0.5) { lx.fillStyle = '#ff8fc8'; const s = Math.max(1, Math.round(e)); lx.fillRect(Math.round(sx + 7 * e), Math.round(sy - (k.z + 26 + bote) * e), s, s); lx.fillRect(Math.round(sx - 8 * e), Math.round(sy - (k.z + 20 + bote) * e), s, s); }
  }
  if (k.escudo > 0 && (k.escudo > 2 || (RELOJ * 8) % 1 < 0.6)) pintaBurbuja(sx, sy - (k.z + 7 * k.tam) * e, 10 * e * k.tam, RELOJ + k.idx * 0.1, k.escudo <= 2);
};
