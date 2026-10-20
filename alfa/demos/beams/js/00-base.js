// Fans of Beams · Base: constantes, el lienzo, el sonido de core, las 9 facciones, las imágenes de Nova y la nave del jugador montada con sus piezas.
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
/* =====================================================================================================================================
   FANS OF BEAMS · matamarcianos horizontal con captura de enemigos al estilo de G-Darius (PlayStation).
   Copia de G-Darius: la bola de captura convierte en aliado a un enemigo común (los fuertes hay que debilitarlos antes); el aliado se queda
   a tu lado, dispara a su manera y hace de escudo; y con el botón de rayo se sacrifica y sale un rayo gigante. Como en la serie Darius,
   el fondo está lleno de cosas enormes: planetas, lunas, meteoritos y naves gigantes que cruzan despacio.
   ===================================================================================================================================== */
const H = 540, W = Math.round(Math.max(960, Math.min(1280, H * Math.max(innerWidth, innerHeight) / Math.max(1, Math.min(innerWidth, innerHeight))))), A = '../../games/nova/arte/';
const CAPITAN_PROG = 2200, MAX_BOLAS = 3, SECTORES = 3;
const maxAli = () => 2 + (S.k >= 3 ? 1 : 0);   // la tercera plaza de escolta se abre con la clase Crucero pesado
const cv = document.getElementById('c');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let Rk = 1, RkMax = 2;   // resolución del lienzo final respecto a 960x540: la escena se dibuja pequeña (rápido) y el texto y los menús, nítidos
const TXTC = new Map(), TQ = [];
function ajusta() {
  const k = Math.min(innerWidth / W, innerHeight / H); cv.style.width = W * k + 'px'; cv.style.height = H * k + 'px';
  const q = Math.round(clamp(k * (window.devicePixelRatio || 1), 1, RkMax) * 4) / 4;
  if (q !== Rk || cv.width !== Math.round(W * q)) { Rk = q; cv.width = Math.round(W * Rk); cv.height = Math.round(H * Rk); TXTC.clear(); }
}
// la escena se dibuja en un lienzo aparte para poder darle brillo (bloom) antes de ponerla en pantalla
const esc = document.createElement('canvas'); esc.width = W; esc.height = H;
const b1 = document.createElement('canvas'); b1.width = Math.round(W / 4); b1.height = 135;
const b2 = document.createElement('canvas'); b2.width = Math.round(W / 10); b2.height = 54;
const escC = esc.getContext('2d');
let c = escC;
const lienzo = (w, h) => { const o = document.createElement('canvas'); o.width = w; o.height = h; return o; };

// ---------- sonido: lo que pide el motor de core ----------
let mudo = false;
function sonidoApagado() { return mudo; }
function volGeneral() { return mudo ? 0 : 0.55 * OPC.pant.vol; }
function volMusica() { return 0.7 * OPC.pant.mus; }
function musicUpdate() { /* la canción se elige desde la partida */ }

// ---------- las 9 facciones de la serie: su nave, sus enemigos y su color ----------
const FACS = {
  animales: { nom: 'Animales', casco: 'caza', base: 'caza', col: '#ffa94a', pil: 'cap-bunny' },
  nomuertos: { nom: 'No-Muertos', casco: 'nomuertos', base: 'fragata', col: '#9be36a', pil: 'cap-necrolord' },
  streamers: { nom: 'Streamers', casco: 'streamers', base: 'caza', col: '#b46bff', pil: 'cap-twitchking' },
  heroes: { nom: 'Héroes', casco: 'heroes', base: 'crucero', col: '#ffd23c', pil: 'cap-epicchampion' },
  ciber: { nom: 'Ciber', casco: 'crucero', base: 'crucero', col: '#46d2ff', pil: 'cap-cybermarine' },
  memes: { nom: 'Memes', casco: 'memes', base: 'caza', col: '#ff8ad8', pil: 'cap-memelord' },
  gamer: { nom: 'Gamers', casco: 'gamer', base: 'fragata', col: '#5cff9a', pil: 'cap-progamer' },
  olvidados: { nom: 'Olvidados', casco: 'fragata', base: 'fragata', col: '#d9c7a6', pil: 'cap-vikingo' },
  pop: { nom: 'Pop', casco: 'pop', base: 'crucero', col: '#ff5ad8', pil: 'cap-directora' }
};
const ORDEN_FAC = Object.keys(FACS);
const RAYOCOL = { animales: '#ff8a1a', nomuertos: '#4cff2a', streamers: '#a040ff', heroes: '#ffb000', ciber: '#1aa8ff', memes: '#ff30c0', gamer: '#20ff80', olvidados: '#ff5a3a', pop: '#ff2a9a' };   // color intenso del rayo de cada facción
const BASEH = { caza: { al: -26, mo: 84, L: false }, crucero: { al: -50, mo: 88, L: false }, fragata: { al: -30, mo: 94, L: true } };   // anclajes de datos-piezas.js
// Dificultad que elige el jugador: vidas, velocidad de las balas enemigas, ritmo de las oleadas (más alto = más espacio entre ellas), vida de los jefes, bolas de captura y núcleos
const DIFS = {
  facil: { nom: 'FÁCIL', vidas: 5, balaV: 0.82, esp: 1.3, jefe: 0.65, regen: 9, nucleo: 0.9 },
  normal: { nom: 'NORMAL', vidas: 3, balaV: 1.05, esp: 0.92, jefe: 1.1, regen: 17, nucleo: 0.75 },
  dificil: { nom: 'DIFÍCIL', vidas: 2, balaV: 1.2, esp: 0.72, jefe: 1.45, regen: 25, nucleo: 0.6 }
};
const ORDEN_DIF = ['facil', 'normal', 'dificil'];
const NOMBRE_CLASE = ['Caza', 'Corbeta', 'Fragata', 'Crucero pesado', 'Acorazado', 'Nave jefe'];

// ---------- imágenes (se cargan al pedirlas) ----------
const IMGS = {};
function img(ruta) { let i = IMGS[ruta]; if (!i) { i = IMGS[ruta] = new Image(); i.src = A + ruta; } return i; }
const listo = i => i && i.complete && i.naturalWidth > 0;
const spriteE = (fac, t) => img('enemigos/' + (fac === 'nomuertos' ? '' : fac + '-') + t + '.png');
const precarga = f => { for (const t of ['rastrero', 'fusilero', 'sepulturero', 'capitan', 'nido', 'jefe']) spriteE(f, t); };
precarga('nomuertos');
for (let i = 1; i <= 7; i++) img('enemigos/asteroide' + (i > 1 ? '-' + i : '') + '.png');
for (const f of ORDEN_FAC) img('iconos/' + FACS[f].pil + '.png');
for (const n of ['arma-laser', 'arma-rayoSolar', 'carga-energia', 'sis-casco', 'mod-escudo']) img('iconos/' + n + '.png');
let PZ = null;
fetch(A + 'piezas.json').then(r => r.json()).then(d => { PZ = {}; for (const p of d.piezas) PZ[p.id] = p; }).catch(() => { PZ = {}; });
// copia oscurecida de un sprite (para las naves gigantes del fondo: se ven lejos, entre la niebla)
const OSCUROS = {};
function oscuro(im, a) {
  if (!listo(im)) return null; const k = im.src + a; if (OSCUROS[k]) return OSCUROS[k];
  const o = lienzo(im.naturalWidth, im.naturalHeight), g = o.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(8,12,34,' + a + ')'; g.fillRect(0, 0, o.width, o.height); return OSCUROS[k] = o;
}

// La nave del jugador: casco, alas y motor de Nova, colocados como en el juego (anclajes de la clase), girados para mirar a la derecha.
const NAVES = {};
function nave(fac, k) {
  const SS = Q.esc >= 2 ? 2 : 1, clave = fac + k + '|' + SS; if (NAVES[clave]) return NAVES[clave];
  if (!PZ) return null;
  const F = FACS[fac], B = BASEH[F.base], idC = n => F.casco + '-casco' + (n ? '-c' + (n + 1) : ''), idA = n => F.casco + '-alas' + (n ? '-c' + (n + 1) : '');
  let kk = k; if (!PZ[idC(kk)] || !PZ[idA(kk)]) kk = 0;
  const ids = [idC(0), idC(kk), idA(0), idA(kk)]; if (!PZ[ids[0]] || !PZ[ids[2]]) return null;
  const tam = 'motor-' + (kk >= 4 ? 'triple' : kk >= 2 ? 'doble' : 'simple') + '-' + (B.L ? (kk >= 2 ? 'L' : 'M') : (kk >= 2 ? 'M' : 'S'));
  for (const id of ids.concat([tam])) if (!PZ[id] || !listo(img(PZ[id].archivo))) return null;   // aún sin cargar: se reintenta
  const h1 = PZ[idC(0)], hk = PZ[idC(kk)], top1 = -h1.pivote[1] / 2, lon1 = h1.alto / 2, topk = -hk.pivote[1] / 2, lonk = hk.alto / 2;
  const alasY = kk ? topk + (B.al - top1) / lon1 * lonk : B.al, motorY = kk ? B.mo + (hk.alto - hk.pivote[1]) / 2 - (h1.alto - h1.pivote[1]) / 2 : B.mo;
  const g0 = lienzo(1000, 1300), g = g0.getContext('2d'), ox = 500, oy = 700;
  const pz = (id, ax, ay) => { const m = PZ[id]; g.drawImage(img(m.archivo), ox + ax - m.pivote[0] / 2, oy + ay - m.pivote[1] / 2, m.ancho / 2, m.alto / 2); };
  pz(idA(kk), 0, alasY); pz(tam, 0, motorY); pz(idC(kk), 0, 0);
  // recorta lo dibujado, gira y reduce
  const d = g.getImageData(0, 0, 1000, 1300).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < 1300; y += 2) for (let x = 0; x < 1000; x += 2) if (d[(y * 1000 + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const bw = x1 - x0 + 2, bh = y1 - y0 + 2, r = lienzo(bh, bw), rg = r.getContext('2d');
  rg.translate(bh, 0); rg.rotate(Math.PI / 2); rg.drawImage(g0, x0, y0, bw, bh, 0, 0, bw, bh);
  const largo = (74 + k * 9) * SS, sc = largo / bh, tw = Math.round(bh * sc), th = Math.round(bw * sc);
  const out = lienzo(tw, th), og = out.getContext('2d'); og.imageSmoothingQuality = 'high'; og.drawImage(r, 0, 0, tw, th);
  out.lw = tw / SS; out.lh = th / SS;   // tamaño en la escena (el lienzo puede ser el doble)
  return NAVES[clave] = out;
}
