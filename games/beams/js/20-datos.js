// Fans of Beams · Utilidades de dibujo (texto cromado, luces), planetas y lunas, datos de los enemigos, dificultades y el estado de la partida.
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
// ---------- utilidades ----------
const rnd = (a, b) => a + Math.random() * (b - a), ang = (a, b) => Math.atan2(b.y - a.y, b.x - a.x), pick = l => l[Math.floor(Math.random() * l.length)];
function mezcla(col, t) {   // acerca un color hex a blanco (t>0) o a negro (t<0)
  let h = col.slice(1); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16), to = t > 0 ? 255 : 0, k = Math.abs(t);
  return 'rgb(' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (to - v) * k)).join(',') + ')';
}
// Estilo de letra: Orbitron (pesada y futurista) para casi todo, Audiowide para los títulos grandes, Michroma ancha para letra pequeña.
// Cada texto sale cromado: degradado con "horizonte", borde de color y borde oscuro, brillo y cursiva de velocidad.
function spriteTxt(s, tam, col, o) {
  const clave = s + '|' + tam + '|' + col + '|' + (o.f || '') + '|' + Rk;
  let e = TXTC.get(clave); if (e) return e;
  if (TXTC.size > 500) TXTC.clear();
  const grande = tam >= 44, fam = o.f === 'logo' || (grande && o.f !== 'hud') ? 'FoAudiowide' : o.f === 'mini' ? 'FoMichroma' : 'FoOrbitron';
  const peso = fam === 'FoOrbitron' ? (tam >= 20 ? 900 : 700) : 400, fs = tam * (fam === 'FoAudiowide' ? 0.92 : fam === 'FoMichroma' ? 0.68 : 0.8);
  const fuente = peso + ' ' + fs + 'px ' + fam + ', "Arial Black", sans-serif', ls = fs * (grande ? 0.05 : 0.07);
  const m0 = lienzo(2, 2).getContext('2d'); m0.font = fuente; const soporta = 'letterSpacing' in m0; if (soporta) m0.letterSpacing = ls + 'px';
  const tw = m0.measureText(s).width + (soporta ? 0 : 0), pad = Math.ceil(fs * 0.55 + 6), w2 = Math.ceil(tw + pad * 2 + fs * 0.3), h2 = Math.ceil(fs * 1.5 + pad);
  const cvT = lienzo(Math.ceil(w2 * Rk), Math.ceil(h2 * Rk)), g = cvT.getContext('2d'); g.scale(Rk, Rk);
  g.font = fuente; g.textBaseline = 'middle'; g.textAlign = 'left'; g.lineJoin = 'round'; if (soporta) g.letterSpacing = ls + 'px';
  g.translate(pad, h2 / 2); g.transform(1, 0, -0.17, 1, 0, 0);
  if (grande || o.glow) { g.shadowColor = col; g.shadowBlur = fs * 0.55; g.fillStyle = col; g.fillText(s, 0, 0); g.shadowBlur = 0; }
  g.strokeStyle = 'rgba(2,5,16,0.97)'; g.lineWidth = fs * 0.28; g.strokeText(s, 0, 0);
  g.strokeStyle = mezcla(col, -0.4); g.lineWidth = fs * 0.13; g.strokeText(s, 0, 0);
  const gr = g.createLinearGradient(0, -fs * 0.55, 0, fs * 0.55);
  gr.addColorStop(0, mezcla(col, 0.92)); gr.addColorStop(0.42, mezcla(col, 0.25)); gr.addColorStop(0.5, col); gr.addColorStop(0.52, mezcla(col, -0.3)); gr.addColorStop(1, mezcla(col, -0.55));
  g.fillStyle = gr; g.fillText(s, 0, 0);
  e = { cv: cvT, w: w2, h: h2, pad, tw }; TXTC.set(clave, e); return e;
}
function pintaTxt(g, s, x, y, tam, col, al, o) {
  const e = spriteTxt(s, tam, col, o || {}), dx = al === 'left' ? x - e.pad : al === 'right' ? x - e.pad - e.tw : x - e.pad - e.tw / 2;
  g.drawImage(e.cv, dx, y - e.h / 2, e.w, e.h);
}
function txt(s, x, y, tam, col = '#fff', al = 'center', o) {
  s = String(s);
  if (c === escC) { TQ.push([s, x, y, tam, col, al, o, c.globalAlpha]); return; }   // lo dibujado en la escena se pinta nítido encima, tras el brillo
  pintaTxt(c, s, x, y, tam, col, al, o);
}
// Calidad gráfica: en el móvil se baja sola si va lento (ver adaptaCal). Cada nivel recorta lo más caro sin cambiar el juego.
const CAL = [
  { n: 'BAJA', fx: 450, bloom: 0, humo: false, deb: false, estr: 50, rocas: 4, gig: false, luces: 5, plasma: false, rel: false },
  { n: 'MEDIA', fx: 1000, bloom: 1, humo: true, deb: true, estr: 100, rocas: 9, gig: true, luces: 12, plasma: true, rel: false },
  { n: 'ALTA', fx: 2200, bloom: 2, humo: true, deb: true, estr: 150, rocas: 14, gig: true, luces: 30, plasma: true, rel: true },
  { n: 'HD', fx: 3200, bloom: 2, humo: true, deb: true, estr: 150, rocas: 14, gig: true, luces: 40, plasma: true, rel: true, esc: 2 }   // la escena se dibuja al doble de resolución
];
for (const q of CAL) if (!q.esc) q.esc = 1;
let Q = CAL[2], calAuto = 2, calMax = 2;
const GL = {};   // puntos de luz ya pintados: se dibujan con 'lighter' y dan el brillo a todo
function glow(col) {
  if (GL[col]) return GL[col]; const o = lienzo(64, 64), g = o.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#fff'); r.addColorStop(0.22, col); r.addColorStop(0.6, col + '55'); r.addColorStop(1, col + '00'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return GL[col] = o;
}
const SU = {};   // luz suave, sin núcleo blanco: para iluminar el fondo sin quemarlo
function suave(col) {
  if (SU[col]) return SU[col]; const o = lienzo(64, 64), g = o.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, col + 'bb'); r.addColorStop(0.45, col + '44'); r.addColorStop(1, col + '00'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return SU[col] = o;
}
function brillo(x, y, r, col, a) { c.globalAlpha = a; c.drawImage(glow(col), x - r, y - r, r * 2, r * 2); }
const HUMO = (() => { const o = lienzo(64, 64), g = o.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(60,52,60,0.8)'); r.addColorStop(1, 'rgba(40,36,44,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return o; })();
const VIGNETA = (() => { const o = lienzo(W, H), g = o.getContext('2d'); const r = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.0); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(2,3,10,0.7)'); g.fillStyle = r; g.fillRect(0, 0, W, H); return o; })();

// ---------- planetas y lunas, pintados con código (Nova no trae planetas) ----------
// Nova no trae sprites de planetas: las lunas son sus asteroides redondos (hielo, lava, cristales, ámbar) y los planetas gigantes se pintan aquí
// en el mismo estilo: píxel grueso, contorno oscuro, sombreado con trama punteada y luz de borde.
const TRAMA = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const hex2rgb = h => { h = h.slice(1); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; const n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const mezc = (c, t) => c.map(v => Math.round(v + ((t > 0 ? 255 : 0) - v) * Math.abs(t)));
function mkRuido(seed, n = 12) {
  let st = seed; const r = () => (st = (st * 16807) % 2147483647) / 2147483647, g = Array.from({ length: (n + 1) * (n + 1) }, r);
  return (x, y) => { x = (((x % 1) + 1) % 1) * n; y = (((y % 1) + 1) % 1) * n; const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), a0 = g[yi * (n + 1) + xi], b0 = g[yi * (n + 1) + xi + 1], c0 = g[(yi + 1) * (n + 1) + xi], d0 = g[(yi + 1) * (n + 1) + xi + 1]; return a0 + (b0 - a0) * sx + (c0 - a0) * sy + (a0 - b0 - c0 + d0) * sx * sy; };
}
function pintaPlaneta(tipo, N, esc, pal, o = {}) {
  const w = o.anillos ? Math.round(N * 2.3) : N, cp = lienzo(w, N), g = cp.getContext('2d'), im = g.createImageData(w, N), d = im.data, cx = w / 2, cy = N / 2, R = N * 0.44;
  const rn = mkRuido(o.semilla || 3), rn2 = mkRuido((o.semilla || 3) + 9, 7), Lz = Math.hypot(0.55, 0.6, 0.58), L = [-0.55 / Lz, -0.6 / Lz, 0.58 / Lz];
  const col = pal.map(hex2rgb), sh = col.map(c => [mezc(c, 0.16), c, mezc(c, -0.3), mezc(c, -0.55)]);
  const put = (x, y, c) => { const i = (y * w + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; };
  const nivel = (nl, x, y) => { const v = nl + (TRAMA[y & 3][x & 3] / 16 - 0.5) * 0.2; return v > 0.8 ? 0 : v > 0.5 ? 1 : v > 0.26 ? 2 : 3; };
  const anillo = frente => {
    if (!o.anillos) return; const ra = N * 1.02, rb = N * 0.27, pr = ['#e8d9b0', '#c2a97c', '#917b57'].map(hex2rgb);
    for (let y = 0; y < N; y++) for (let x = 0; x < w; x++) {
      const ex = (x + 0.5 - cx) / ra, ey = (y + 0.5 - cy) / rb, rr = Math.sqrt(ex * ex + ey * ey); if (rr < 0.58 || rr > 1) continue; if ((ey > 0) !== frente) continue;
      const band = Math.floor((rr - 0.58) / 0.42 * 8); if (band === 3 || band === 6) continue;   // huecos entre los anillos
      const v = TRAMA[y & 3][x & 3] / 16, c = pr[band % 3]; put(x, y, v > 0.65 ? mezc(c, -0.3) : v < 0.15 ? mezc(c, 0.2) : c);
    }
  };
  anillo(false);
  for (let y = 0; y < N; y++) for (let x = 0; x < w; x++) {
    const dx = (x + 0.5 - cx) / R, dy = (y + 0.5 - cy) / R, r2 = dx * dx + dy * dy; if (r2 > 1) continue;
    const z = Math.sqrt(1 - r2), nl = Math.max(0, dx * L[0] + dy * L[1] + z * L[2]), u = (Math.atan2(dx, z) / Math.PI + 1) / 2, v = (dy + 1) / 2; let idx = 0, lv = nivel(nl, x, y);
    if (tipo === 'gas') { const lat = dy + (rn(u, v) - 0.5) * 0.3 + 0.05 * Math.sin(dx * 7 + dy * 3); const nb = pal.length - 1; idx = ((Math.floor((lat * 0.5 + 0.5) * 9) % nb) + nb) % nb; const t = ((dx - 0.32) / 0.24) ** 2 + ((dy - 0.3) / 0.1) ** 2; if (t < 1) idx = pal.length - 1; }
    else if (tipo === 'oceano') { const hh = rn(u, v) * 0.62 + rn2(u * 2, v * 2) * 0.38; idx = hh > 0.56 ? (hh > 0.66 ? 2 : 1) : 0; if (rn2(u * 3 + 0.3, v * 3) > 0.64 && TRAMA[y & 3][x & 3] / 16 < 0.7) { idx = 3; lv = Math.min(lv, 1); } }
    else { const hh = rn(u * 2, v * 2) * 0.6 + rn2(u * 4, v * 4) * 0.4; idx = hh > 0.62 ? 3 : hh > 0.48 ? 0 : hh > 0.34 ? 1 : 2; for (const c of o.crateres || []) { const q = Math.hypot(dx - c[0], dy - c[1]); if (q < c[2]) { idx = 2; lv = Math.min(3, lv + 1); } else if (q < c[2] + 0.04) lv = Math.max(0, lv - 1); } }
    put(x, y, sh[idx][lv]);
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < w; x++) {   // contorno oscuro y luz de borde
    const dx = (x + 0.5 - cx) / R, dy = (y + 0.5 - cy) / R, r2 = dx * dx + dy * dy; if (r2 > 1) continue;
    const fuera = q => { const ex = (q[0] + 0.5 - cx) / R, ey = (q[1] + 0.5 - cy) / R; return ex * ex + ey * ey > 1; };
    if (fuera([x - 1, y]) || fuera([x + 1, y]) || fuera([x, y - 1]) || fuera([x, y + 1])) put(x, y, [8, 10, 28]);
    else if (r2 > 0.8 && dx * L[0] + dy * L[1] > 0.15) put(x, y, mezc(col[0], 0.25));
  }
  anillo(true);
  g.putImageData(im, 0, 0);
  const out = lienzo(w * esc, N * esc), og = out.getContext('2d'); og.imageSmoothingEnabled = false; og.drawImage(cp, 0, 0, w * esc, N * esc); return out;
}
function sombreaLuna(im, tam, col) {   // una luna de Nova con su cara oscura y un halo de atmósfera
  const o = lienzo(tam, tam), g = o.getContext('2d'); g.drawImage(im, 0, 0, tam, tam); g.globalCompositeOperation = 'source-atop';
  const gr = g.createRadialGradient(tam * 0.3, tam * 0.28, tam * 0.1, tam * 0.58, tam * 0.58, tam * 0.78); gr.addColorStop(0, 'rgba(2,4,14,0)'); gr.addColorStop(0.55, 'rgba(2,4,14,0.25)'); gr.addColorStop(1, 'rgba(2,4,14,0.82)'); g.fillStyle = gr; g.fillRect(0, 0, tam, tam); return o;
}
const PLANETAS = [
  { cnv: pintaPlaneta('gas', 88, 3, ['#f0cf8a', '#d9a05a', '#b97a3a', '#8a5430', '#f7e6b8', '#c0502e'], { anillos: true, semilla: 5 }), x: 380, y: 170, z: 0.035, atm: '#ffc070' },
  { luna: 'enemigos/asteroide-2.png', tam: 300, x: 1000, y: 380, z: 0.05, atm: '#8fd0ff' },
  { cnv: pintaPlaneta('oceano', 80, 4, ['#2f6fd0', '#3da55a', '#a3c65a', '#f2f6ff'], { semilla: 11 }), x: 1600, y: 120, z: 0.03, atm: '#7fb8ff' },
  { luna: 'enemigos/asteroide-5.png', tam: 220, x: 2100, y: 420, z: 0.06, atm: '#ff8a3a' },
  { cnv: pintaPlaneta('desierto', 84, 4, ['#d9694a', '#b8482e', '#8a3220', '#e89a6a'], { semilla: 21, crateres: [[-0.1, 0.1, 0.16], [0.4, -0.3, 0.1], [0.15, 0.5, 0.12]] }), x: 2600, y: 140, z: 0.04, atm: '#ff9a6a' },
  { luna: 'enemigos/asteroide-3.png', tam: 260, x: 3100, y: 360, z: 0.045, atm: '#d08aff' },
  { luna: 'enemigos/asteroide-4.png', tam: 200, x: 3600, y: 150, z: 0.055, atm: '#ffc060' }
];
for (const p of PLANETAS) { p.anc = p.cnv ? p.cnv.width : p.tam; p.alt = p.cnv ? p.cnv.height : p.tam; if (p.luna) img(p.luna); }
// ---------- datos de los enemigos ----------
// cap: true se captura siempre; 'mitad' solo con la armadura rota (menos de la mitad de vida), como los minijefes de G-Darius; false no se captura
const TIPOS = {
  zip: { spr: 'rastrero', hp: 2, r: 17, tam: 62, vel: 190, pts: 100, cap: true, escudo: 3, rayo: 54, nombre: 'ZIP' },
  gun: { spr: 'fusilero', hp: 9, r: 27, tam: 100, vel: 90, pts: 300, cap: true, escudo: 6, rayo: 78, nombre: 'FUSILERO' },
  sep: { spr: 'sepulturero', hp: 30, r: 54, tam: 210, vel: 70, pts: 700, cap: 'mitad', escudo: 8, rayo: 96, hab: 'ONDA', nombre: 'SEPULTURERO', hb: [[-0.2, 0, 0.2], [0.16, 0, 0.2]] },
  cap: { spr: 'capitan', hp: 100, r: 90, tam: 340, vel: 55, pts: 1500, cap: 'mitad', escudo: 12, rayo: 120, hab: 'MISILES', nombre: 'CAPITÁN', hb: [[-0.3, 0, 0.17], [0, 0, 0.2], [0.3, 0, 0.17]] },
  acor: { spr: 'capitan', hp: 260, r: 150, tam: 600, vel: 45, pts: 2500, cap: 'mitad', escudo: 18, rayo: 170, hab: 'RAYO', nombre: 'ACORAZADO', hb: [[-0.33, 0, 0.14], [-0.11, 0, 0.17], [0.11, 0, 0.17], [0.33, 0, 0.14]] },
  nido: { spr: 'nido', hp: 60, r: 76, tam: 260, vel: 38, pts: 600, cap: false, escudo: 0, rayo: 0, nombre: 'NIDO', hb: [[-0.12, 0, 0.24], [0.14, 0, 0.2]] },
  rock: { spr: 'asteroide', hp: 6, r: 30, tam: 80, vel: 120, pts: 20, cap: false, escudo: 0, rayo: 0, nombre: 'ROCA' },
  boss: { spr: 'jefe', hp: 1500, r: 190, tam: 800, vel: 40, pts: 6000, cap: false, escudo: 0, rayo: 0, nombre: 'JEFE', hb: [[-0.36, 0, 0.13], [-0.18, 0, 0.16], [0, 0, 0.19], [0.18, 0, 0.16], [0.36, 0, 0.13]] }
};

// ---------- estado ----------
let S, P, EN, PB, EB, BOLAS, ALI, FX, TX, GIG = [], ITEMS = [], WRECKS = [], ELEG = { fac: 'animales', k: 0, dif: 'normal' };
try { const g = JSON.parse(localStorage.getItem('fobeams-nave') || 'null'); if (g && FACS[g.fac]) ELEG = { fac: g.fac, k: clamp(g.k | 0, 0, 5), dif: DIFS[g.dif] ? g.dif : 'normal' }; } catch (e) { /* sin almacenamiento */ }
function nuevaPartida() {
  const orden = ORDEN_FAC.filter(f => f !== ELEG.fac).sort(() => Math.random() - 0.5);
  const D = DIFS[ELEG.dif] || DIFS.normal;
  S = { estado: 'jugando', D, t: 0, puntos: 0, vidas: D.vidas, sp: 2.2, oleada: 0, jefe: null, fin: 0, shake: 0, flash: 0, slow: 0, freeze: 0, zoom: 0, rayo: null, bolas: MAX_BOLAS, bolaT: 0, msg: '', msgT: 0, rocaT: 4,
    score: 0, vida1: 40000, combo: 0, comboT: 0, comboMax: 0, kills: 0, capturas: 0, escudo: 0, golpesSector: 0, escT: 45, bonus: 0, sector: 0, orden, ini: 0, capitan: false, aviso: 0, banner: 3.4, luces: [], gigT: 0.5, lluvia: 0, lluviaT: 0, nave: ELEG.fac, k: ELEG.k, k0: ELEG.k, itemT: 75, navePrev: null, preT: 0 };
  S.fac = orden[0]; precarga(orden[0]); precarga(orden[1]);
  P = { x: 140, y: H / 2, r: 7, vel: 300, cool: 0, inv: 2, flash: 0, vx: 0, vy: 0 };
  EN = []; PB = []; EB = []; BOLAS = []; ALI = []; FX = []; TX = []; GIG = []; ITEMS = []; WRECKS = [];
  musicSet('nvMision');
}
const EST = Array.from({ length: 150 }, () => ({ x: rnd(0, W), y: rnd(0, H), z: rnd(0.2, 1), t: rnd(0, 6) }));
const NEBU = Array.from({ length: 7 }, (_, i) => ({ x: rnd(0, W * 1.6), y: rnd(0, H), r: rnd(220, 420), z: rnd(0.04, 0.12), h: i }));
const ROCAS_FONDO = Array.from({ length: 14 }, (_, i) => ({ x: rnd(0, W * 1.4), y: rnd(0, H), tam: rnd(36, 150), z: rnd(0.1, 0.55), n: 1 + (i % 7), rot: rnd(0, 6.28), vr: rnd(-0.3, 0.3), kx: 0, ky: 0, luz: 0 }));
S = { estado: 'titulo', t: 0, shake: 0, flash: 0, slow: 0, freeze: 0, zoom: 0, luces: [], fac: 'nomuertos', gigT: 99 }; EN = []; PB = []; EB = []; BOLAS = []; ALI = []; FX = []; TX = []; P = { x: 140, y: H / 2, r: 7, inv: 0 };
GIG.push({ fac: 'nomuertos', spr: 'jefe', tam: 1000, x: 700, y: 300, vx: -4, t: 0, fase: 1, fijo: true });

const sonido = n => {
  if (!AC) return;
  switch (n) {
    case 'disparo': tone(1700, 380, 0.07, 'square', 0.025); break;
    case 'disparoA': tone(1100, 500, 0.07, 'triangle', 0.03); break;
    case 'bola': tone(260, 980, 0.28, 'sine', 0.09); tone(520, 1960, 0.2, 'triangle', 0.04); break;
    case 'rebote': noise(0.1, 0.12, 3000, 'highpass'); tone(300, 180, 0.12, 'square', 0.05); break;
    case 'captura': [440, 587, 740, 988, 1318].forEach((f, i) => tone(f, f, 0.2, 'triangle', 0.09, i * 0.06)); noise(0.4, 0.08, 5000, 'highpass', 0.1); break;
    case 'estalla': noise(0.3, 0.2, 900); tone(130, 50, 0.22, 'sine', 0.2); noise(0.12, 0.1, 3000, 'bandpass'); break;
    case 'grande': noise(0.9, 0.5, 560); tone(90, 32, 0.7, 'sine', 0.45); noise(0.5, 0.25, 2200, 'bandpass', 0.18); break;
    case 'enorme': noise(1.6, 0.6, 420); tone(70, 24, 1.3, 'sine', 0.5); noise(0.9, 0.3, 2000, 'bandpass', 0.25); tone(200, 40, 0.8, 'sawtooth', 0.1); break;
    case 'escudo': noise(0.25, 0.18, 1800, 'bandpass'); tone(700, 120, 0.3, 'sawtooth', 0.09); break;
    case 'golpe': noise(0.2, 0.25, 700); tone(130, 55, 0.25, 'sawtooth', 0.14); break;
    case 'carga': tone(150, 900, 0.5, 'sawtooth', 0.07); tone(300, 1800, 0.5, 'sine', 0.05); break;
    case 'rayo': noise(2, 0.16, 700, 'lowpass'); tone(90, 70, 2, 'sawtooth', 0.1); tone(180, 140, 2, 'square', 0.04); tone(60, 60, 2, 'sine', 0.2); break;
    case 'aviso': tone(110, 110, 0.9, 'sawtooth', 0.12); tone(165, 150, 0.9, 'sawtooth', 0.09, 0.05); noise(0.9, 0.12, 400); break;
    case 'rayoJefe': noise(1.4, 0.32, 500); tone(60, 55, 1.4, 'sawtooth', 0.2); tone(120, 100, 1.4, 'square', 0.05); break;
    case 'sector': [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.22, 'triangle', 0.09, i * 0.08)); break;
    case 'evo': [262, 330, 392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f * 1.01, 0.28, 'triangle', 0.08, i * 0.07)); noise(0.8, 0.16, 5000, 'highpass', 0.1); tone(80, 700, 0.7, 'sawtooth', 0.06); break;
    case 'combo': [523, 659, 784].forEach((f, i) => tone(f, f * 1.02, 0.12, 'triangle', 0.07, i * 0.05)); break;
    case 'lejos': noise(0.7, 0.12, 380); tone(60, 36, 0.6, 'sine', 0.18); break;
  }
};
