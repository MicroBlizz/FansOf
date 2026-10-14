// Fans of Karts (prototipo) · LA VISTA: el mapa de la pista «tumbado» como en las consolas portátiles de 2001. Cada fila de la pantalla,
// del horizonte hacia abajo, es una línea del mapa cada vez más cercana; se pinta punto a punto en una pantalla de 240 × 160.
// Encima van el cielo (dos capas que giran con la cámara a distinta velocidad) y las cosas de pie (karts, regalos, carteles), que son
// dibujos que crecen al acercarse. Aquí están también la cámara, las sombras y las chispas.
'use strict';

const HZ = 52;            // la fila del horizonte (la de siempre)
let HZV = HZ;             // la de este fotograma: sube y baja con las cuestas (escena.js), así la pista no se ve plana
const FOCO = 150;         // cuanto mayor, más «teleobjetivo» (campo de visión de unos 77°)
const CAM_ALTO = 26, CAM_ATRAS = 45;   // la cámara, por encima y por detrás del kart (en unidades de pista)
// CALIDAD de imagen: 1 = clásica (el mundo a 240 × 160) o 2 = HD (el mundo al doble: 480 × 320). Los menús y el marcador se pintan
// siempre en 240 × 160 y se amplían (modoUI); el mundo (cielo, suelo y cosas de pie) se pinta a la resolución de verdad (modoMundo).
let CAL = 1, VW = PW, VH = PH, lo, lx, IMG, FB;
function ponCalidad(k) {
  CAL = k === 2 ? 2 : 1; VW = PW * CAL; VH = PH * CAL;
  [lo, lx] = lienzo(VW, VH); IMG = lx.createImageData(VW, VH); FB = new Uint32Array(IMG.data.buffer);
  modoUI();
}
function modoMundo() { lx.setTransform(1, 0, 0, 1, 0, 0); }
function modoUI() { lx.setTransform(CAL, 0, 0, CAL, 0, 0); }
// un texto (u otra cosa de interfaz) en mitad del mundo: se pinta con la letra de siempre, ampliada
function enUI(f) { lx.save(); lx.setTransform(CAL, 0, 0, CAL, 0, 0); f(1 / CAL); lx.restore(); }
ponCalidad(AJUSTES.calidad === 'clasica' ? 1 : 2);
const CAM = { x: 512, y: 512, ang: 0, fx: 1, fy: 0, alto: CAM_ALTO };
function ponCamara(x, y, ang, alto = CAM_ALTO) { CAM.x = x; CAM.y = y; CAM.ang = ang; CAM.fx = Math.cos(ang); CAM.fy = Math.sin(ang); CAM.alto = alto; }

// ---------- el cielo: la capa de atrás (A) gira más despacio que la de delante (B, con huecos transparentes) ----------
const CIELO_W = 1024;
function pintaCielo(P, t) {
  const A = P.cieloA, B = P.cieloB, g = CAM.ang / TAU;
  const oB = Math.floor(g * CIELO_W) & 1023, oA = Math.floor(g * CIELO_W * 0.55 + t * (P.def.cielo.viento || 0)) & 1023;
  let o = 0;
  const K = CAL, sh = K === 2 ? 1 : 0;
  for (let y = 0; y < HZV * K; y++) {
    const f = limita((y >> sh) + HZ - HZV, 0, HZ - 1) * CIELO_W;
    for (let x = 0; x < VW; x++) { const xs = x >> sh, b = B[f + ((xs + oB) & 1023)]; FB[o++] = b || A[f + ((xs + oA) & 1023)]; }
  }
  const nb = P.niebla;
  for (let x = 0; x < VW; x++) FB[o++] = nb;
}
// ---------- el suelo ----------
function pintaSuelo(P) {
  const fx = CAM.fx, fy = CAM.fy, rx = -fy, ry = fx, alto = CAM.alto, mips = P.mips, nb = P.niebla, nf = P.nieblaFilas * CAL, lA = P.lejosA, lB = P.lejosB, hz = HZV * CAL, foco = FOCO * CAL;
  for (let y = hz + 1; y < VH; y++) {
    const h = y - hz, lam = alto / h, dist = foco * lam;
    // lo lejano se lee de una copia más pequeña del mapa (si no, parpadea)
    const k = lam > 3.4 ? 2 : lam > 1.7 ? 1 : 0, tex = mips[k], n = TM >> k, fuera = ~(n - 1), inv = 1 / (1 << k), cuadro = 64 >> k;
    let wx = (CAM.x + fx * dist - rx * lam * (VW / 2)) * inv, wy = (CAM.y + fy * dist - ry * lam * (VW / 2)) * inv;
    const sx = rx * lam * inv, sy = ry * lam * inv;
    let o = y * VW;
    if (h <= nf) {   // cerca del horizonte, niebla de puntitos (más tupida cuanto más lejos)
      const nivel = Math.ceil((nf - h + 1) * 14 / nf), by = (y & 3) << 2;
      for (let x = 0; x < VW; x++) {
        if (BAYER[by | (x & 3)] < nivel) FB[o++] = nb;
        else { const ix = wx | 0, iy = wy | 0; FB[o++] = ((ix | iy) & fuera) ? (((ix ^ iy) & cuadro) ? lA : lB) : tex[iy * n + ix]; }
        wx += sx; wy += sy;
      }
    } else {
      for (let x = 0; x < VW; x++) {
        const ix = wx | 0, iy = wy | 0;
        FB[o++] = ((ix | iy) & fuera) ? (((ix ^ iy) & cuadro) ? lA : lB) : tex[iy * n + ix];
        wx += sx; wy += sy;
      }
    }
  }
}

// ---------- dónde cae en la pantalla un punto del suelo ----------
let PRX = 0, PRY = 0, PRE = 0, PRD = 0;   // columna, fila del suelo, píxeles por unidad y distancia
function proyecta(x, y) {
  const dx = x - CAM.x, dy = y - CAM.y, d = dx * CAM.fx + dy * CAM.fy;
  if (d < 5) return false;
  PRD = d; PRE = FOCO * CAL / d; PRX = VW / 2 + (dy * CAM.fx - dx * CAM.fy) * PRE; PRY = HZV * CAL + CAM.alto * PRE;
  return true;
}

// ---------- sombras: una elipse oscura bajo cada cosa (sin suavizar, como todo lo demás) ----------
const SOMBRAS = [];
function sombraDe(w) {
  w = limita(w | 0, 2, 128);
  if (SOMBRAS[w]) return SOMBRAS[w];
  const h = Math.max(1, Math.round(w * 0.34)), [c, x] = lienzo(w, h);
  x.fillStyle = 'rgba(20,10,34,0.42)';
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const u = (i + 0.5) / w * 2 - 1, v = (j + 0.5) / h * 2 - 1; if (u * u + v * v <= 1) x.fillRect(i, j, 1, 1); }
  return (SOMBRAS[w] = { c, w, h });
}
function pintaSombra(sx, sy, ancho) { const s = sombraDe(ancho); lx.drawImage(s.c, Math.round(sx - s.w / 2), Math.round(sy - s.h / 2)); }

// ---------- las cosas de pie: se apuntan, se ordenan de lejos a cerca y se pintan ----------
// cada una: { d (distancia), x, y (pantalla), e (píxeles por unidad), f (función que la pinta), ref }
const VISTOS = [];
let N_VISTOS = 0;
function apunta(x, y, f, ref, margen = 40) {
  if (!proyecta(x, y) || PRD > 1500 || PRX < -margen * PRE - 8 || PRX > VW + margen * PRE + 8) return;
  let v = VISTOS[N_VISTOS];
  if (!v) v = VISTOS[N_VISTOS] = { d: 0, x: 0, y: 0, e: 0, f: null, ref: null };
  v.d = PRD; v.x = PRX; v.y = PRY; v.e = PRE; v.f = f; v.ref = ref;
  N_VISTOS++;
}
function pintaVistos() {
  // ordenar por inserción (casi siempre ya están casi en orden) sin crear listas nuevas
  for (let i = 1; i < N_VISTOS; i++) {
    const v = VISTOS[i]; let j = i - 1;
    while (j >= 0 && VISTOS[j].d < v.d) { VISTOS[j + 1] = VISTOS[j]; j--; }
    VISTOS[j + 1] = v;
  }
  for (let i = 0; i < N_VISTOS; i++) { const v = VISTOS[i]; v.f(v.ref, v.x, v.y, v.e, v.d); }
  N_VISTOS = 0;
}

// ---------- chispas, humo y polvo: puntitos de colores que viven un momento (en el mundo, no en la pantalla) ----------
const CHISPAS = [];
for (let i = 0; i < 160; i++) CHISPAS.push({ vida: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, col: '#fff', tam: 1, g: 0 });
let SIG_CHISPA = 0;
function chispa(x, y, z, vx, vy, vz, vida, col, tam = 1, g = 120) {
  const c = CHISPAS[SIG_CHISPA]; SIG_CHISPA = (SIG_CHISPA + 1) % CHISPAS.length;
  c.x = x; c.y = y; c.z = z; c.vx = vx; c.vy = vy; c.vz = vz; c.vida = vida; c.col = col; c.tam = tam; c.g = g;
}
function mueveChispas(dt) {
  for (const c of CHISPAS) {
    if (c.vida <= 0) continue;
    c.vida -= dt; c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt; c.vz -= c.g * dt;
    if (c.z < 0) { c.z = 0; c.vz *= -0.4; }
  }
}
function pintaChispas() {
  for (const c of CHISPAS) {
    if (c.vida <= 0 || !proyecta(c.x, c.y) || PRD > 420) continue;
    const t = Math.max(1, Math.round(c.tam * PRE * 0.5));
    lx.fillStyle = c.col;
    lx.fillRect(Math.round(PRX - t / 2), Math.round(PRY - c.z * PRE - t), t, t);
  }
}
function borraChispas() { for (const c of CHISPAS) c.vida = 0; }

// ---------- un fotograma del mundo: cielo, suelo y, encima, lo que se haya apuntado ----------
function pintaMundo(P, t) {
  modoMundo();
  pintaCielo(P, t);
  pintaSuelo(P);
  lx.putImageData(IMG, 0, 0);
}
