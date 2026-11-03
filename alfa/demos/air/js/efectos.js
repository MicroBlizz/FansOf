// Fans of Air · Efectos: chispas, explosiones (anillo y partículas), humo de los misiles, temblor de pantalla y carteles grandes
// (¡FIJADO!, ¡DERRIBADO!, ¡CIELO DESPEJADO!…). Todo en coordenadas de pantalla (1280x720): las vistas convierten lo del mundo.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const FX = A.efectos = { particulas: [], anillos: [], temblor: 0, carteles: [] };
  const COLORES = ['#ffe14a', '#ff8a2a', '#ff5a3a', '#fff'];

  // Una explosión: partículas que salen en todas direcciones y un anillo que crece. escala = tamaño (1 normal, 3 enorme).
  FX.explosion = function (x, y, escala, n) {
    for (let i = 0; i < (n || 14); i++) {
      const ang = Math.random() * Math.PI * 2, v = (60 + Math.random() * 220) * escala;
      FX.particulas.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vida: 0.4 + Math.random() * 0.5, t: 0,
        r: (3 + Math.random() * 5) * escala, color: COLORES[Math.floor(Math.random() * COLORES.length)], gravedad: 0 });
    }
    FX.anillos.push({ x, y, r: 6 * escala, vr: 260 * escala, t: 0, vida: 0.45, color: '#ffe14a' });
    FX.anillos.push({ x, y, r: 2 * escala, vr: 140 * escala, t: 0, vida: 0.35, color: '#fff' });
  };

  // Chispas de un impacto que no destruye (balas en un bombardero, en la Torre…).
  FX.chispas = function (x, y, escala, color) {
    for (let i = 0; i < 6; i++) {
      const ang = Math.random() * Math.PI * 2, v = (40 + Math.random() * 120) * escala;
      FX.particulas.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vida: 0.25, t: 0, r: 2.5 * escala, color: color || '#ffe14a', gravedad: 0 });
    }
  };

  // Humo que deja un misil o un caza tocado.
  FX.humo = function (x, y, escala, color) {
    FX.particulas.push({ x, y, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30 + 20, vida: 0.6, t: 0, r: 4 * escala, color: color || 'rgba(220,220,230,.6)', gravedad: 0, crece: 1 });
  };

  FX.cartel = function (texto, color, dura, sub) { FX.carteles.push({ texto, color, dura, t: 0, sub: sub || null }); };

  FX.limpiar = function () { FX.particulas = []; FX.anillos = []; FX.carteles = []; FX.temblor = 0; };

  FX.paso = function (dt) {
    for (const p of FX.particulas) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.crece) p.r += 18 * dt; }
    FX.particulas = FX.particulas.filter((p) => p.t < p.vida);
    for (const a of FX.anillos) { a.t += dt; a.r += a.vr * dt; }
    FX.anillos = FX.anillos.filter((a) => a.t < a.vida);
    for (const c of FX.carteles) c.t += dt;
    FX.carteles = FX.carteles.filter((c) => c.t < c.dura);
    FX.temblor = Math.max(0, FX.temblor - dt * 40);
  };

  FX.dibujar = function (g) {
    for (const p of FX.particulas) {
      g.globalAlpha = Math.max(0, 1 - p.t / p.vida); g.fillStyle = p.color;
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
    for (const a of FX.anillos) {
      g.globalAlpha = Math.max(0, 1 - a.t / a.vida); g.strokeStyle = a.color; g.lineWidth = 4;
      g.beginPath(); g.arc(a.x, a.y, a.r, 0, 7); g.stroke();
    }
    g.globalAlpha = 1;
  };

  // Carteles: entran de golpe, se quedan y se van encogiendo al final.
  FX.dibujarCarteles = function (g, texto) {
    for (const c of FX.carteles) {
      const queda = c.dura - c.t, k = c.t < 0.15 ? c.t / 0.15 : queda < 0.3 ? queda / 0.3 : 1;
      g.save(); g.translate(640, 250); g.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); g.globalAlpha = k;
      texto(g, c.texto, 0, 0, 34, c.color);
      if (c.sub) texto(g, c.sub, 0, 44, 13, '#fff');
      g.restore();
    }
    g.globalAlpha = 1;
  };
})(AIR);
