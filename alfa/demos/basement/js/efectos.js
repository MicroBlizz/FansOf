// Fans of Basement · Efectos (solo pantalla): chispas y confeti de partículas, números de daño que suben y se desvanecen, textos
// flotantes de botín, carteles grandes en el centro y el temblor de pantalla. Todo con listas fijas que se reutilizan (pooling):
// no se crean objetos nuevos en cada fotograma, para que el móvil no dé tirones.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const MAX_PART = 260, MAX_NUM = 50;
  const part = Array.from({ length: MAX_PART }, () => ({ vivo: false, x: 0, y: 0, vx: 0, vy: 0, t: 0, dura: 1, color: '#fff', tam: 2, grav: 0 }));
  const nums = Array.from({ length: MAX_NUM }, () => ({ vivo: false, x: 0, y: 0, t: 0, dura: 0.7, texto: '', color: '#fff', tam: 12 }));
  let iPart = 0, iNum = 0;
  const FX = B.efectos = { temblor: 0, carteles: [] };

  function libre(lista, i) { return lista[i % lista.length]; }

  FX.chispas = function (x, y, n, color, fuerza, grav) {
    for (let k = 0; k < n; k++) {
      const p = libre(part, iPart++), a = Math.random() * Math.PI * 2, v = (0.4 + Math.random()) * (fuerza || 90);
      Object.assign(p, { vivo: true, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, dura: 0.3 + Math.random() * 0.35, color, tam: 2 + Math.floor(Math.random() * 2), grav: grav || 0 });
    }
  };
  FX.confeti = (x, y) => { for (const c of ['#ffe14a', '#ff8a2a', '#5fe05f', '#4fc3ff', '#ffffff']) FX.chispas(x, y, 8, c, 160, 260); };

  FX.numero = function (x, y, texto, color, tam) {
    const n = libre(nums, iNum++);
    Object.assign(n, { vivo: true, x: x + (Math.random() - 0.5) * 10, y, t: 0, dura: 0.75, texto: String(texto), color: color || '#fff', tam: tam || 12 });
  };

  FX.cartel = function (texto, color, dura, sub) {
    FX.carteles = FX.carteles.filter((c) => c.t < c.dura - 0.2);
    FX.carteles.push({ texto, color, dura: dura || 1.6, sub: sub || '', t: 0 });
  };

  FX.limpiar = function () { for (const p of part) p.vivo = false; for (const n of nums) n.vivo = false; FX.carteles = []; FX.temblor = 0; };

  FX.paso = function (dt) {
    for (const p of part) {
      if (!p.vivo) continue;
      p.t += dt; if (p.t >= p.dura) { p.vivo = false; continue; }
      p.vx *= 0.92; p.vy = p.vy * 0.92 + p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    }
    for (const n of nums) { if (!n.vivo) continue; n.t += dt; n.y -= 34 * dt; if (n.t >= n.dura) n.vivo = false; }
    for (const c of FX.carteles) c.t += dt;
    FX.carteles = FX.carteles.filter((c) => c.t < c.dura);
    FX.temblor = Math.max(0, FX.temblor - dt * 40);
  };

  // Partículas y números van en el mundo (con la cámara puesta); los carteles, en la pantalla.
  FX.dibujarMundo = function (g, texto) {
    for (const p of part) {
      if (!p.vivo) continue;
      g.globalAlpha = 1 - p.t / p.dura; g.fillStyle = p.color;
      g.fillRect(Math.round(p.x), Math.round(p.y), p.tam, p.tam);
    }
    g.globalAlpha = 1;
    for (const n of nums) {
      if (!n.vivo) continue;
      g.globalAlpha = Math.min(1, 2.5 * (1 - n.t / n.dura));
      texto(g, n.texto, n.x, n.y, n.tam, n.color);
    }
    g.globalAlpha = 1;
  };

  FX.dibujarCarteles = function (g, texto, W, H) {
    const UI = B.ui;
    for (const c of FX.carteles) {
      const entra = Math.min(1, c.t / 0.15), sale = Math.min(1, (c.dura - c.t) / 0.3), k = 0.7 + 0.3 * entra;
      g.save(); g.globalAlpha = Math.max(0, sale); g.translate(W / 2, H * 0.3); g.scale(k, k);
      UI.textoCabe(g, c.texto, 0, 0, 46, W - 40, c.color, 'center', 7);
      if (c.sub) UI.franja(g, c.sub, 0, 54, 18, W - 40);
      g.restore();
    }
  };
})(BAS);
