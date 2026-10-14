// Fans of Crush · EFECTOS: partículas, números y gritos que flotan, fichas que vuelan hasta el marcador, rayos del láser, ondas de las
// explosiones, cohetes que cruzan el tablero, destellos y el temblor de la pantalla. Todo en coordenadas lógicas (540 de ancho).
'use strict';
const CR_FX = { parts: [], textos: [], gritos: [], voladores: [], rayos: [], ondas: [], cohetes: [], fantasmas: [], temblor: 0, flash: null, tx: 0, ty: 0 };
const crAzar = (a, b) => a + Math.random() * (b - a);
function crFxLimpia() { for (const k of ['parts', 'textos', 'gritos', 'voladores', 'rayos', 'ondas', 'cohetes', 'fantasmas']) CR_FX[k].length = 0; CR_FX.temblor = 0; CR_FX.flash = null; }
const CR_MAX_PARTS = 320;
function crParte(o) { if (CR_FX.parts.length < CR_MAX_PARTS) CR_FX.parts.push(Object.assign({ vx: 0, vy: 0, g: 0, fr: 0.985, rot: 0, vr: 0, tam: 4, vida: 0.6, t: 0, tipo: 'bola', col: '#fff' }, o)); }
// un estallido de partículas del color de una ficha
function crEstallido(x, y, col, n = 10, fuerza = 1, luz = '#fff6ea') {
  for (let i = 0; i < n; i++) {
    const a = crAzar(0, CR_TAU), v = crAzar(70, 230) * fuerza;
    crParte({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, g: 420, tam: crAzar(3, 6.5) * Math.min(1.4, fuerza), vida: crAzar(0.35, 0.7), col: Math.random() < 0.3 ? luz : col, tipo: Math.random() < 0.35 ? 'estrella' : 'bola', vr: crAzar(-8, 8) });
  }
}
function crTrozos(x, y, cols, n = 8, fuerza = 1) {
  for (let i = 0; i < n; i++) { const a = crAzar(0, CR_TAU), v = crAzar(90, 260) * fuerza; crParte({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, g: 700, tam: crAzar(4, 8), vida: crAzar(0.5, 0.9), col: cols[i % cols.length], tipo: 'trozo', rot: crAzar(0, 3), vr: crAzar(-12, 12) }); }
}
function crHumo(x, y, n = 1, tam = 10) { for (let i = 0; i < n; i++) crParte({ x: x + crAzar(-4, 4), y: y + crAzar(-4, 4), vx: crAzar(-20, 20), vy: crAzar(-30, -5), tam: crAzar(tam * 0.6, tam), vida: crAzar(0.4, 0.7), col: 'rgba(255,255,255,.75)', tipo: 'humo', fr: 0.95 }); }
function crConfeti(n = 80) {
  const cols = ['#a98bff', '#5bbcff', '#4fd6a8', '#9ad65a', '#ffc94d', '#ff7a96', '#ffffff', '#ffd9e2'];
  for (let i = 0; i < n; i++) crParte({ x: crAzar(0, 540), y: crAzar(-60, -10), vx: crAzar(-40, 40), vy: crAzar(60, 180), g: 90, fr: 0.995, tam: crAzar(5, 9), vida: crAzar(2.2, 3.6), col: cols[i % cols.length], tipo: 'trozo', rot: crAzar(0, 3), vr: crAzar(-6, 6) });
}
// un número que sube y se desvanece (puntos)
function crFlota(txt, x, y, col = '#fff6ea', tam = 22, vida = 0.9) { CR_FX.textos.push({ txt, x, y, col, tam, vida, t: 0 }); }
// un grito grande en el centro del tablero («¡SINERGIA!»)
function crGrita(txt, col = '#ffc94d', tam = 46, vida = 1.15, sub = '') {
  if (CR_FX.gritos.length > 2) CR_FX.gritos.shift();
  CR_FX.gritos.push({ txt, sub, col, tam, vida, t: 0, y: CR_V.by + CR_V.cel * CR_T.h * 0.45 - CR_FX.gritos.length * 12 });
}
// algo que vuela hasta el marcador (una cara hacia su objetivo, una chispa hacia el jefe)
function crVuela(x, y, destino, dibuja, alLlegar, dur = 0.55) {
  const [dx, dy] = destino();
  CR_FX.voladores.push({ x0: x, y0: y, cx: x + (dx - x) * 0.2 + crAzar(-60, 60), cy: Math.min(y, dy) - crAzar(40, 120), destino, dibuja, alLlegar, t: 0, dur: dur + crAzar(0, 0.12) });
}
function crRayo(x1, y1, x2, y2, col = '#ffffff', vida = 0.35) { CR_FX.rayos.push({ x1, y1, x2, y2, col, vida, t: 0, s: Math.random() * 1000 }); }
function crOnda(x, y, r1, col = '#fff6ea', vida = 0.45, ancho = 8) { CR_FX.ondas.push({ x, y, r1, col, vida, t: 0, ancho }); }
function crCoheteFx(x, y, dx, dy) { for (const s of [-1, 1]) CR_FX.cohetes.push({ x, y, dx: dx * s, dy: dy * s, v: 900, t: 0, vida: 0.9 }); }
function crFantasma(spr, x0, y0, x1, y1, dur = 0.16) { CR_FX.fantasmas.push({ spr, x0, y0, x1, y1, t: 0, dur }); }
function crTiembla(n) { CR_FX.temblor = Math.max(CR_FX.temblor, REDUCED ? n * 0.3 : n); }
function crDestella(col = '#ffffff', a = 0.5) { CR_FX.flash = { col, a: REDUCED ? a * 0.4 : a }; }

function crFxAvanza(dt) {
  const F = CR_FX;
  for (let i = F.parts.length - 1; i >= 0; i--) {
    const p = F.parts[i]; p.t += dt; if (p.t >= p.vida) { F.parts.splice(i, 1); continue; }
    p.vy += p.g * dt; p.vx *= Math.pow(p.fr, dt * 60); p.vy *= Math.pow(p.fr, dt * 60); p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
  }
  for (const k of ['textos', 'gritos', 'rayos', 'ondas', 'fantasmas']) { const L = F[k]; for (let i = L.length - 1; i >= 0; i--) { L[i].t += dt; if (L[i].t >= (L[i].vida || L[i].dur)) L.splice(i, 1); } }
  for (let i = F.voladores.length - 1; i >= 0; i--) { const v = F.voladores[i]; v.t += dt; if (v.t >= v.dur) { F.voladores.splice(i, 1); if (v.alLlegar) v.alLlegar(); } }
  for (let i = F.cohetes.length - 1; i >= 0; i--) {
    const r = F.cohetes[i]; r.t += dt; r.x += r.dx * r.v * dt; r.y += r.dy * r.v * dt;
    if (Math.random() < 0.9) crHumo(r.x - r.dx * 14, r.y - r.dy * 14, 1, 9);
    if (r.t > r.vida || r.x < -60 || r.x > 600 || r.y < -60 || r.y > CR_V.H + 60) F.cohetes.splice(i, 1);
  }
  F.temblor *= Math.pow(0.0025, dt); if (F.temblor < 0.2) F.temblor = 0;
  F.tx = F.temblor ? crAzar(-1, 1) * F.temblor : 0; F.ty = F.temblor ? crAzar(-1, 1) * F.temblor : 0;
  if (F.flash) { F.flash.a -= dt * 2.2; if (F.flash.a <= 0) F.flash = null; }
}
const crBez = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
function crFxPinta(c, t) {
  const F = CR_FX;
  for (const o of F.ondas) {
    const k = o.t / o.vida, r = o.r1 * (0.2 + 0.8 * Math.pow(k, 0.5));
    c.save(); c.globalAlpha = 1 - k; c.beginPath(); c.arc(o.x, o.y, r, 0, CR_TAU); c.lineWidth = o.ancho * (1 - k) + 1; c.strokeStyle = o.col; c.stroke(); c.restore();
  }
  for (const r of F.rayos) {   // un rayo en zigzag que tiembla
    const k = r.t / r.vida, n = 7;
    c.save(); c.globalAlpha = 1 - k * k; c.lineJoin = 'round'; c.lineCap = 'round';
    for (const [w, col] of [[9, r.col], [3.5, '#ffffff']]) {
      c.beginPath(); c.moveTo(r.x1, r.y1);
      for (let i = 1; i < n; i++) { const q = i / n, nx = -(r.y2 - r.y1), ny = r.x2 - r.x1, l = Math.hypot(nx, ny) || 1, d = Math.sin(r.s + i * 2.3 + t * 40) * 9; c.lineTo(r.x1 + (r.x2 - r.x1) * q + (nx / l) * d, r.y1 + (r.y2 - r.y1) * q + (ny / l) * d); }
      c.lineTo(r.x2, r.y2); c.lineWidth = w; c.strokeStyle = col; c.globalAlpha = (1 - k * k) * (w > 5 ? 0.55 : 1); c.stroke();
    }
    c.restore();
  }
  for (const g of F.fantasmas) { const k = Math.min(1, g.t / g.dur); crPonSprite(c, g.spr, lerp(g.x0, g.x1, k), lerp(g.y0, g.y1, k), CR_V.k * (1 - k * 0.5), CR_V.k * (1 - k * 0.5), 1 - k * 0.6); }
  for (const p of F.parts) {   // sin save/restore por partícula: los giros se calculan a mano (va mucho más rápido)
    const k = p.t / p.vida, a = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1;
    c.globalAlpha = p.tipo === 'humo' ? a * 0.6 : a; c.fillStyle = p.col; c.beginPath();
    if (p.tipo === 'bola') c.arc(p.x, p.y, p.tam * (1 - k * 0.6), 0, CR_TAU);
    else if (p.tipo === 'humo') c.arc(p.x, p.y, p.tam * (0.6 + k), 0, CR_TAU);
    else if (p.tipo === 'estrella') { const r1 = p.tam * 1.3 * (1 - k * 0.5), r2 = r1 * 0.4; for (let i = 0; i < 10; i++) { const an = p.rot + (i * Math.PI) / 5, r = i % 2 ? r2 : r1, x = p.x + Math.cos(an) * r, y = p.y + Math.sin(an) * r; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); }
    else { const co = Math.cos(p.rot), si = Math.sin(p.rot), w = p.tam / 2, h = p.tam / 4; for (const [dx, dy] of [[-w, -h], [w, -h], [w, h], [-w, h]]) c.lineTo(p.x + dx * co - dy * si, p.y + dx * si + dy * co); c.closePath(); }
    c.fill();
  }
  c.globalAlpha = 1;
  for (const r of F.cohetes) {   // la zanahoria-cohete que cruza el tablero
    c.save(); c.translate(r.x, r.y); c.rotate(Math.atan2(r.dy, r.dx) + Math.PI / 2);
    crZanahoria(c, 0, 0, CR_V.cel * 0.32, Math.PI); c.restore();
  }
  for (const v of F.voladores) {
    const k = Math.min(1, v.t / v.dur), e = k * k * (3 - 2 * k), [dx, dy] = v.destino();
    const x = crBez(v.x0, v.cx, dx, e), y = crBez(v.y0, v.cy, dy, e);
    v.dibuja(c, x, y, 1 - 0.45 * e, k);
  }
  for (const o of F.textos) {
    const k = o.t / o.vida, y = o.y - 34 * Math.pow(k, 0.6), s = k < 0.15 ? 0.6 + k / 0.15 * 0.5 : 1.1 - Math.min(0.1, (k - 0.15));
    c.save(); c.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1; c.translate(o.x, y); c.scale(s, s);
    crLetras(c, o.txt, 0, 0, o.tam, o.col); c.restore();
  }
  for (const g of F.gritos) {
    const k = g.t / g.vida, s = k < 0.18 ? 0.3 + (k / 0.18) * 0.9 : k < 0.3 ? 1.2 - (k - 0.18) / 0.12 * 0.2 : 1, a = k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1;
    c.save(); c.globalAlpha = a; c.translate(270, g.y - (k > 0.75 ? (k - 0.75) * 60 : 0)); c.scale(s, s); c.rotate(-0.05);
    crLetras(c, g.txt, 0, 0, g.tam, g.col, 0.34, true);
    if (g.sub) crLetras(c, g.sub, 0, g.tam * 0.72, g.tam * 0.36, '#fff6ea', 0.3);
    c.restore();
  }
}
// texto con contorno grueso (como el resto de la serie); grande = con sombra de color debajo
function crLetras(c, txt, x, y, tam, col, grosor = 0.28, grande = false, fuente = FONT_D, alin = 'center', contorno = CR_COL.tinta) {
  const t = tr(String(txt));
  c.font = `${tam}px ${fuente}`; c.textAlign = alin; c.textBaseline = 'middle'; c.lineJoin = 'round';
  if (grande) { c.lineWidth = tam * grosor + 6; c.strokeStyle = 'rgba(74,45,107,.35)'; c.strokeText(t, x + 3, y + 5); }
  if (grosor) { c.lineWidth = Math.max(2, tam * grosor); c.strokeStyle = contorno; c.strokeText(t, x, y); }
  if (grande) { const g = c.createLinearGradient(0, y - tam / 2, 0, y + tam / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, col); g.addColorStop(1, col); c.fillStyle = g; } else c.fillStyle = col;
  c.fillText(t, x, y);
}
// texto sin contorno (en los paneles claros)
function crTexto(c, txt, x, y, tam, col = CR_COL.tinta, fuente = FONT_D, alin = 'center') {
  c.font = `${fuente.includes('Baloo') ? '800 ' : ''}${tam}px ${fuente}`; c.textAlign = alin; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(tr(String(txt)), x, y);
}
