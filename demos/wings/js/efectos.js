// Fans of Wings · Efectos: explosiones, chispas y humo hechos de cubitos que viven en el mundo 3D (los pinta la vista con el
// lote del motor), el temblor de pantalla y los carteles grandes (¡SURVIVALBOT!, ¡LOS TENEMOS!…), que se pintan sobre el HUD.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const FX = A.efectos = { cubos: [], temblor: 0, carteles: [] };
  const hex = (h) => A.gl.hex(h);
  const FUEGO = ['#fff2a0', '#ffd23c', '#ff8a1c', '#f2541b', '#ffffff'], HUMO = ['#3a3d45', '#55585f', '#2a2d33'];
  const alAzar = (lista) => lista[Math.floor(Math.random() * lista.length)];
  const esfera = (v) => { const a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1); return [Math.sin(b) * Math.cos(a) * v, Math.cos(b) * v, Math.sin(b) * Math.sin(a) * v]; };

  // p = punto del mundo en coordenadas de dibujo [x, y, z]; escala = tamaño (1 un becario, 3 el jefe).
  FX.explosion = function (p, escala, n) {
    for (let i = 0; i < (n || 22); i++) FX.cubos.push({ p: p.slice(), v: esfera((20 + Math.random() * 70) * escala), t: 0, vida: 0.45 + Math.random() * 0.6, tam: (1.4 + Math.random() * 2.6) * escala, col: hex(alAzar(FUEGO)), cae: 0 });
    for (let i = 0; i < 7; i++) FX.cubos.push({ p: p.slice(), v: esfera(14 * escala), t: 0, vida: 0.8 + Math.random() * 0.7, tam: (2 + Math.random() * 2.2) * escala, col: hex(alAzar(HUMO)), cae: -6 });
  };
  FX.chispas = function (p, escala, color) {
    for (let i = 0; i < 7; i++) FX.cubos.push({ p: p.slice(), v: esfera((30 + Math.random() * 60) * escala), t: 0, vida: 0.22 + Math.random() * 0.15, tam: 1.6 * escala, col: hex(color || '#ffd23c'), cae: 0 });
  };
  FX.humo = function (p, tam, color) { FX.cubos.push({ p: p.slice(), v: esfera(3), t: 0, vida: 0.7, tam, col: hex(color || '#e8ecf2'), cae: 0 }); };

  FX.cartel = function (texto, color, dura, sub) { FX.carteles = [{ texto, color, dura, t: 0, sub: sub || null }]; };   // uno cada vez
  FX.limpiar = function () { FX.cubos = []; FX.carteles = []; FX.temblor = 0; };

  FX.paso = function (dt) {
    for (const c of FX.cubos) { c.t += dt; c.p[0] += c.v[0] * dt; c.p[1] += (c.v[1] - c.cae * c.t) * dt; c.p[2] += c.v[2] * dt; }
    FX.cubos = FX.cubos.filter((c) => c.t < c.vida);
    for (const c of FX.carteles) c.t += dt;
    FX.carteles = FX.carteles.filter((c) => c.t < c.dura);
    FX.temblor = Math.max(0, FX.temblor - dt * 40);
  };

  // Los cubitos, al lote del motor: encogen al final de su vida.
  FX.alLote = function () {
    for (const c of FX.cubos) { const k = c.t / c.vida; A.gl.cubo(c.p, c.tam * (1 - k * k), c.col); }
  };

  // Carteles: entran de golpe, se quedan y se van encogiendo. cx = centro de la pantalla.
  FX.dibujarCarteles = function (g, texto, cx) {
    for (const c of FX.carteles) {
      const queda = c.dura - c.t, k = c.t < 0.15 ? c.t / 0.15 : queda < 0.3 ? queda / 0.3 : 1;
      g.save(); g.translate(cx, 150); g.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); g.globalAlpha = k;
      texto(g, c.texto, 0, 0, 34, c.color);
      if (c.sub) texto(g, c.sub, 0, 44, 13, '#fff');
      g.restore();
    }
    g.globalAlpha = 1;
  };
})(WINGS);
