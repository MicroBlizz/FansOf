// Fans of Panic · Efectos: partículas (confeti del color del mundo al destapar), textos que suben (+puntos, COMBO x3),
// temblor de cámara, parón de un instante (hit-stop), cámara lenta en los cortes grandes y vibración del móvil.
'use strict';

const FX = { parts: [], textos: [], temblor: 0, paron: 0, lento: 0 };

function confeti(x, y, n, col) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 160;
    FX.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, t: 0.6 + Math.random() * 0.6, col, r: 2 + Math.random() * 3 });
  }
}

function textoSube(txt, x, y, col = COL.oro, tam = 18, spr = '') { FX.textos.push({ txt, x, y, col, tam, t: 1, spr }); }

function temblor(f) { FX.temblor = Math.max(FX.temblor, f); }
function paron(s) { FX.paron = Math.max(FX.paron, s); }
function camaraLenta(s) { FX.lento = Math.max(FX.lento, s); }
function vibra(ms) { if (SAVE.vibra && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* sin vibración */ } } }

function avanzaEfectos(dt) {
  for (const p of FX.parts) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.vx *= 0.98; }
  FX.parts = FX.parts.filter(p => p.t > 0);
  for (const s of FX.textos) { s.t -= dt * 0.9; s.y -= 30 * dt; }
  FX.textos = FX.textos.filter(s => s.t > 0);
  FX.temblor = Math.max(0, FX.temblor - dt * 12);
}

function aplicaTemblor() { if (FX.temblor > 0) G.translate((Math.random() - 0.5) * FX.temblor * 6, (Math.random() - 0.5) * FX.temblor * 6); }

function pintaEfectos() {
  const vir = sprite('viruta');
  for (const p of FX.parts) { G.globalAlpha = Math.min(1, p.t * 2); if (vir) pintaSprite('viruta', p.x, p.y, p.r * 3, p.t * 6 + p.x); else { G.fillStyle = p.col; G.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r); } }
  G.globalAlpha = 1;
  for (const s of FX.textos) { G.globalAlpha = Math.min(1, s.t * 2); if (s.spr) palabra(s.spr, s.txt, s.x, s.y, s.tam * 1.3, s.col); else letra(s.txt, s.x, s.y, s.tam, s.col); }
  G.globalAlpha = 1;
}

// barrido de luz sobre lo recién destapado: un destello que se apaga
const BARRIDOS = [];
function barrido(x, y, w, h) { BARRIDOS.push({ x, y, w, h, t: 0.35 }); }
function pintaBarridos(dt) {
  for (const b of BARRIDOS) { b.t -= dt; G.globalAlpha = Math.max(0, b.t * 2.5); G.fillStyle = '#fff'; G.fillRect(b.x, b.y, b.w, b.h); }
  G.globalAlpha = 1;
  for (let i = BARRIDOS.length - 1; i >= 0; i--) if (BARRIDOS[i].t <= 0) BARRIDOS.splice(i, 1);
}
