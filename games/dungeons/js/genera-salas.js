// Fans of Dungeons · Receta A del generador: salas y pasillos por partición binaria (BSP). Se parte la planta en dos una y
// otra vez, en cada trozo final se dibuja una sala y las salas hermanas se unen con pasillos en L. Sale todo conectado.
// Receta B (cuevas) en genera-cuevas.js; lo que se coloca después, en genera-reparto.js.
'use strict';

function generaSalas(m, d) {
  const hojas = [];
  // parte un rectángulo en dos hasta que es pequeño; devuelve el árbol { a, b } o la hoja { x, y, w, h }
  function parte(x, y, w, h, nivel) {
    const puede = w >= 18 || h >= 14;
    if (nivel >= 5 || !puede || (nivel >= 3 && d.prob(0.25))) { const hoja = { x, y, w, h }; hojas.push(hoja); return hoja; }
    const vertical = w > h * 1.25 ? true : h > w * 1.25 ? false : d.prob(0.5);
    if (vertical) {
      const corte = d.entre(Math.floor(w * 0.35), Math.floor(w * 0.65));
      return { a: parte(x, y, corte, h, nivel + 1), b: parte(x + corte, y, w - corte, h, nivel + 1) };
    }
    const corte = d.entre(Math.floor(h * 0.35), Math.floor(h * 0.65));
    return { a: parte(x, y, w, corte, nivel + 1), b: parte(x, y + corte, w, h - corte, nivel + 1) };
  }
  const arbol = parte(1, 1, m.w - 2, m.h - 2, 0);
  // una sala dentro de cada hoja
  for (const hoja of hojas) {
    const w = d.entre(Math.max(4, Math.floor(hoja.w * 0.45)), Math.max(4, hoja.w - 3));
    const h = d.entre(Math.max(4, Math.floor(hoja.h * 0.45)), Math.max(4, hoja.h - 3));
    const x = hoja.x + d.entre(1, Math.max(1, hoja.w - w - 1)), y = hoja.y + d.entre(1, Math.max(1, hoja.h - h - 1));
    const sala = { x, y, w: Math.min(w, m.w - 2 - x), h: Math.min(h, m.h - 2 - y), tipo: 'normal' };
    sala.cx = x + Math.floor(sala.w / 2); sala.cy = y + Math.floor(sala.h / 2);
    rellenaM(m, sala.x, sala.y, sala.w, sala.h, T.SUELO);
    hoja.sala = sala; m.salas.push(sala);
  }
  // pasillos: cada nodo une una sala de su rama «a» con una de su rama «b»
  function salaDe(n) { return n.sala || salaDe(d.prob(0.5) ? n.a : n.b); }
  function une(n) {
    if (n.sala) return;
    une(n.a); une(n.b);
    const s1 = salaDe(n.a), s2 = salaDe(n.b);
    pasillo(m, s1.cx, s1.cy, s2.cx, s2.cy, d);
  }
  une(arbol);
  // algún pasillo extra para que haya vueltas (y no todo sea un árbol)
  for (let i = 0; i < 2 && m.salas.length > 3; i++) { const a = d.elige(m.salas), b = d.elige(m.salas); if (a !== b) pasillo(m, a.cx, a.cy, b.cx, b.cy, d); }
}
// un pasillo en L de (x0, y0) a (x1, y1), de una casilla de ancho; no toca los bordes
function pasillo(m, x0, y0, x1, y1, d) {
  const horizontalPrimero = d.prob(0.5);
  const traza = (xa, ya, xb, yb) => {
    const dx = Math.sign(xb - xa), dy = Math.sign(yb - ya);
    let x = xa, y = ya;
    while (x !== xb) { x += dx; if (x > 0 && x < m.w - 1 && y > 0 && y < m.h - 1 && enM(m, x, y) === T.MURO) ponM(m, x, y, T.SUELO); }
    while (y !== yb) { y += dy; if (x > 0 && x < m.w - 1 && y > 0 && y < m.h - 1 && enM(m, x, y) === T.MURO) ponM(m, x, y, T.SUELO); }
  };
  if (horizontalPrimero) traza(x0, y0, x1, y1);
  else { // vertical primero: se hace en dos tramos
    const dy = Math.sign(y1 - y0); let y = y0;
    while (y !== y1) { y += dy; if (x0 > 0 && x0 < m.w - 1 && y > 0 && y < m.h - 1 && enM(m, x0, y) === T.MURO) ponM(m, x0, y, T.SUELO); }
    traza(x0, y1, x1, y1);
  }
}
