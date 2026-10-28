// Fans of Goose · Efectos: partículas (plumas que vuelan, astillas del tablero, chispas), números de daño, temblor de pantalla,
// destellos y la «pausa de golpe» (el juego se congela unas centésimas en los golpes gordos: da sensación de impacto).
'use strict';

const FX = { temblor: 0, destello: 0, colorDestello: '#fff', pausa: 0, lento: 0, anillos: [] };

function particula(x, y, vx, vy, vida, tam, color, g = 0, tipo = 0) {
  const p = PART.saca(); if (!p) return null;
  p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.vida = p.max = vida; p.tam = tam; p.color = color; p.g = g; p.tipo = tipo; p.rot = Math.random() * 6; p.vr = (Math.random() - 0.5) * 12;
  return p;
}
// tipo 0: cuadrado · 1: pluma (gira) · 2: chispa alargada · 3: astilla que cae al vacío (encoge)
function estallido(x, y, n, color, fuerza = 60, vida = 0.5, tam = 2, tipo = 0, g = 0) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, v = fuerza * (0.35 + Math.random() * 0.8);
    particula(x, y, Math.cos(a) * v, Math.sin(a) * v, vida * (0.6 + Math.random() * 0.7), tam * (0.6 + Math.random() * 0.8), color, g, tipo);
  }
}
function texto(x, y, txt, color = '#fff', tam = 7, vida = 0.7, vy = -28) {
  const t = TXT.saca(); if (!t) return;
  t.x = x + (Math.random() - 0.5) * 6; t.y = y; t.vy = vy; t.vida = t.max = vida; t.txt = txt; t.color = color; t.tam = tam;
}
function tiembla(f) { FX.temblor = Math.min(9, Math.max(FX.temblor, f)); }
function destella(color, f = 0.35) { FX.colorDestello = color; FX.destello = Math.max(FX.destello, f); }
function congela(s) { FX.pausa = Math.max(FX.pausa, s); }
function anillo(x, y, r1, color, dur = 0.4, grosor = 3) { if (FX.anillos.length < 14) FX.anillos.push({ x, y, r0: 2, r1, t: 0, dur, color, grosor }); }
function vibra(ms) { if (SAVE.vibrar && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { /* sin vibración */ } }

function avanzaEfectos(dt) {
  const l = PART.lista;
  for (let i = PART.n - 1; i >= 0; i--) {
    const p = l[i]; p.vida -= dt; if (p.vida <= 0) { PART.quita(i); continue; }
    p.vx *= 1 - 2.2 * dt; p.vy = p.vy * (1 - 2.2 * dt) + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
  }
  const t = TXT.lista;
  for (let i = TXT.n - 1; i >= 0; i--) { const o = t[i]; o.vida -= dt; if (o.vida <= 0) { TXT.quita(i); continue; } o.y += o.vy * dt; o.vy *= 1 - 3 * dt; }
  for (let i = FX.anillos.length - 1; i >= 0; i--) { const a = FX.anillos[i]; a.t += dt; if (a.t >= a.dur) FX.anillos.splice(i, 1); }
  FX.temblor = Math.max(0, FX.temblor - dt * 22);
  FX.destello = Math.max(0, FX.destello - dt * 2.2);
}

function pintaParticulas() {
  const l = PART.lista;
  for (let i = 0; i < PART.n; i++) {
    const p = l[i], k = p.vida / p.max;
    G.globalAlpha = k < 0.3 ? k / 0.3 : 1; G.fillStyle = p.color;
    if (p.tipo === 1) { G.save(); G.translate(p.x, p.y); G.rotate(p.rot); G.fillRect(-p.tam * 0.35, -p.tam, p.tam * 0.7, p.tam * 2); G.restore(); }
    else if (p.tipo === 2) { const v = Math.hypot(p.vx, p.vy) * 0.03 + 1; G.save(); G.translate(p.x, p.y); G.rotate(Math.atan2(p.vy, p.vx)); G.fillRect(-v * p.tam, -p.tam * 0.35, v * p.tam * 2, p.tam * 0.7); G.restore(); }
    else if (p.tipo === 3) { const s = p.tam * k; G.fillRect(p.x - s / 2, p.y - s / 2, s, s); }
    else G.fillRect(p.x - p.tam / 2, p.y - p.tam / 2, p.tam, p.tam);
  }
  G.globalAlpha = 1;
  for (const a of FX.anillos) {
    const k = a.t / a.dur, r = a.r0 + (a.r1 - a.r0) * (1 - (1 - k) * (1 - k));
    G.globalAlpha = 1 - k; G.strokeStyle = a.color; G.lineWidth = a.grosor * (1 - k * 0.6);
    G.beginPath(); G.arc(a.x, a.y, r, 0, 6.283); G.stroke();
  }
  G.globalAlpha = 1;
}

function pintaTextos() {
  const l = TXT.lista; G.textAlign = 'center'; G.textBaseline = 'middle'; G.lineJoin = 'round';
  for (let i = 0; i < TXT.n; i++) {
    const o = l[i], k = o.vida / o.max, pop = k > 0.8 ? 1 + (k - 0.8) * 2.5 : 1;
    G.globalAlpha = k < 0.35 ? k / 0.35 : 1;
    G.font = `800 ${Math.round(o.tam * pop * 10) / 10}px "Pixelify Sans", system-ui, sans-serif`;
    G.lineWidth = o.tam * 0.32; G.strokeStyle = '#120808'; G.strokeText(o.txt, o.x, o.y); G.fillStyle = o.color; G.fillText(o.txt, o.x, o.y);
  }
  G.globalAlpha = 1;
}
