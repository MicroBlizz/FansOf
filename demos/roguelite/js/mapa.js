// Fans of Roguelite · El mapa del camino, arriba del todo de la pantalla: cada día con su dibujito (combate, tienda, cofre…)
// y el conejo encima del día en el que estás: los 10 días del capítulo de ahora, con su número y los capítulos en puntitos.
'use strict';

const MAPA = { h: 0 }, ALTO_MAPA = 25;
// los dibujitos de cada día (11 × 11) y la cabeza del conejo que marca dónde estás
function creaIconosMapa() {
  const D = SPR.dia = {}, c = f => F.mueve(f, 0.5, 0.5);
  const ic = dibuja => { const p = new Pincel(11, 11, 5, 5); dibuja(p); return p.lienzo(); };
  const ORO = pal('#ffcb3d', '#e08a1a', '#fff3a0', '#8a4a10'), PLATA = pal('#dfe6f0', '#9aa6b8', '#ffffff', '#5a6478');
  const HUESO = pal('#fff6ea', '#c8b8d8', '#ffffff', '#6a5a7a'), MADERA = pal('#b06a2a', '#7a4418', '#d89a50', '#4a2408');
  const craneo = (p, col) => {
    p.parte(c(F.un(F.ov(0, -1, 4.6, 4), F.rr(-3, 1, 6, 3.5, 1))), col, { sombra: 1 });
    p.plano(c(F.un(F.ov(-1.8, -0.8, 1.2, 1.3), F.ov(1.8, -0.8, 1.2, 1.3))), OL);
    p.plano(c(F.un(F.re(-1.5, 3, 1, 1.5), F.re(0.5, 3, 1, 1.5))), col.s);
  };
  D.combate = ic(p => {
    for (const s of [1, -1]) {
      p.parte(c(F.tr(-3.5 * s, 3.5, 4 * s, -4, 0.9)), PLATA, { sombra: 0 });
      p.parte(c(F.tr(-4.6 * s, 1.6, -1.6 * s, 4.6, 0.7)), ORO, { sombra: 0, linea: false });
    }
  });
  D.elite = ic(p => {
    const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 2.3 : 5.4; pts.push(Math.cos(a) * r, Math.sin(a) * r + 0.4); }
    p.parte(c(F.pol(...pts)), ORO, { sombra: 1 });
  });
  D.mini = ic(p => craneo(p, pal('#ffd2a0', '#ff8a1f', '#fff3e0', '#8a3a08')));
  D.jefe = ic(p => {
    for (const s of [1, -1]) p.parte(c(F.tr(2.6 * s, -3, 4.6 * s, -5.4, 1.1, 0.4)), pal('#ff3348', '#a01828', '#ff8a94', '#4a0a14'), { sombra: 0 });
    craneo(p, HUESO);
    p.plano(c(F.un(F.ov(-1.8, -0.8, 0.6, 0.6), F.ov(1.8, -0.8, 0.6, 0.6))), '#ff3348');
  });
  D.encuentro = ic(p => {
    p.parte(c(F.un(F.rr(-5, -5, 10, 7.5, 2), F.pol(-3, 2, 0, 2, -4, 5))), pal('#5aaeff', '#2a6ad0', '#c8e4ff', '#1d3a7a'), { sombra: 1 });
    p.plano(c(F.un(F.re(-0.5, -3.5, 1, 3), F.re(-0.5, 0.5, 1, 1))), '#ffffff');
  });
  D.monedas = ic(p => {
    p.parte(c(F.ov(-1.6, 1.6, 3.4, 3.4)), ORO, { sombra: 1 });
    p.parte(c(F.ov(1.8, -1.6, 3.4, 3.4)), ORO, { sombra: 1 });
    p.plano(c(F.re(1.3, -3, 1, 3)), '#fff3a0');
  });
  D.ruleta = ic(p => {
    p.parte(c(F.ov(0, 0, 5, 5)), pal('#fff6ea', '#c8b8d8', '#ffffff', '#4a2408'), { sombra: 0, luz: false });
    p.plano(c(F.y(F.ov(0, 0, 4, 4), (x, y) => Math.floor((Math.atan2(y, x) + Math.PI) / (Math.PI / 3)) % 2 === 0)), '#e63946');
    p.plano(c(F.ov(0, 0, 1.2, 1.2)), '#ffcb3d');
  });
  D.gashapon = ic(p => {
    p.parte(c(F.ov(0, 0, 4.6, 4.8)), pal('#fff6ea', '#c8b8d8', '#ffffff', '#6a5a7a'), { sombra: 1 });
    p.plano(c(F.y(F.ov(0, 0, 3.8, 4), (x, y) => y < -0.3)), '#ff7aa8');
    p.plano(c(F.re(-4, -0.5, 8, 1)), '#a0306a');
    p.px(-1.5, -2.5, '#ffd0e4');
  });
  D.cofre = ic(p => {
    p.parte(c(F.rr(-5, -3.5, 10, 8, 1.5)), MADERA, { sombra: 1 });
    p.plano(c(F.re(-4, -0.5, 8, 1)), '#4a2408');
    p.parte(c(F.re(-1.5, -1.5, 3, 3)), ORO, { sombra: 0 });
  });
  D.tienda = ic(p => {
    p.parte(c(F.re(-4, -1, 8, 5.5)), MADERA, { sombra: 1 });
    p.parte(c(F.rr(-5, -5, 10, 4.5, 1)), pal('#fff6ea', '#c8b8d8', '#ffffff', '#6a1020'), { sombra: 0, luz: false });
    p.plano(c(F.y(F.re(-4, -4, 8, 2.5), (x) => Math.floor((x + 4) / 2) % 2 === 0)), '#e63946');
    p.plano(c(F.ov(0, 2, 1.3, 1.3)), '#ffcb3d');
  });
  D.hoguera = ic(p => {
    p.parte(c(F.un(F.tr(-4, 4.2, 4, 2.8, 0.9), F.tr(4, 4.2, -4, 2.8, 0.9))), MADERA, { sombra: 0 });
    p.parte(c(F.pol(0, -5.5, 3.2, -1, 3.6, 1.5, 1.5, 3, -1.5, 3, -3.6, 1.5, -3.2, -1)), pal('#ff8a1f', '#e0401a', '#ffe14d', '#8a2008'), { sombra: 1 });
    p.plano(c(F.ov(0, 1, 1.4, 1.8)), '#fff3a0');
  });
  D.pase = ic(p => {
    p.parte(c(F.menos(F.rr(-5, -3.5, 10, 7, 1), F.un(F.ov(-5, 0, 1.5, 1.5), F.ov(5, 0, 1.5, 1.5)))), pal('#d08cff', '#8a4ad6', '#f0d8ff', '#4a1a7a'), { sombra: 1 });
    p.plano(c(F.pol(0, -2, 0.7, -0.5, 2, -0.3, 1, 0.7, 1.3, 2, 0, 1.3, -1.3, 2, -1, 0.7, -2, -0.3, -0.7, -0.5)), '#ffe14d');
  });
  D.raid = ic(p => {
    p.parte(c(F.ov(0, 0, 5, 5)), pal('#e91e3c', '#a01028', '#ff7a8a', '#4a0a14'), { sombra: 1 });
    p.plano(c(F.pol(-1.5, -2.6, 2.8, 0, -1.5, 2.6)), '#ffffff');
  });
  D.misterioso = ic(p => {
    p.parte(c(F.un(F.ov(0, -1, 4.4, 4.4), F.re(-4.4, -1, 8.8, 5.5))), pal('#5a3a8a', '#3a2060', '#8a6ac0', '#1a0c30'), { sombra: 1 });
    p.plano(c(F.ov(0, 0, 2.6, 2.4)), '#1a0c30');
    p.px(-0.6, 0, '#ffe14d'); p.px(1.6, 0, '#ffe14d');
  });
  D.bug = ic(p => {
    p.plano(c(F.un(F.tr(-4.5, -1, 4.5, -1, 0.5), F.tr(-4.5, 2.5, 4.5, 2.5, 0.5), F.tr(-1.5, -4, -3, -5.5, 0.5), F.tr(1.5, -4, 3, -5.5, 0.5))), OL);
    p.parte(c(F.ov(0, 1, 3, 3.8)), pal('#7be04a', '#2f9e3a', '#c8ff9a', '#123a16'), { sombra: 1 });
    p.parte(c(F.ov(0, -3, 2, 1.6)), pal('#2f9e3a', '#1d6a26', '#7be04a', '#123a16'), { sombra: 0 });
    p.plano(c(F.re(-0.5, -1.5, 1, 6)), '#123a16');
  });
  // la cabeza del conejo (de frente) para marcar el día de hoy
  const p = new Pincel(11, 11, 5, 10), PH = PAL_H;
  for (const s of [-1, 1]) p.parte(c(F.tr(1.6 * s, -4, 2.2 * s, -8.6, 1.2, 0.9)), PH.pelo, { sombra: 0 });
  p.parte(c(F.ov(0, -2.5, 3.8, 3)), PH.pelo, { sombra: 1 });
  for (const s of [-1, 1]) p.plano(c(F.re(1.6 * s - 0.5, -7.5, 1, 3)), '#ffc2dc');
  p.plano(c(F.un(F.re(-2, -3.5, 1, 1.5), F.re(1, -3.5, 1, 1.5))), '#8a2bff');
  p.px(0.5, -1.2, '#ff7aa8');
  D.conejo = p.lienzo();
}

function pintaMapa(ctx) {
  const W = PAN.W, h = MAPA.h;
  ctx.fillStyle = '#1c0f2e'; ctx.fillRect(0, 0, W, h);
  ctx.fillStyle = OL; ctx.fillRect(0, h - 1, W, 1);
  mapaCapitulo(ctx, W);
}
const sube_ = () => (Math.sin(RELOJ.t * 5) > 0 ? 1 : 0);

// el capítulo entero: sus 10 días en un caminito, con el número de capítulo a la izquierda
function mapaCapitulo(ctx, W) {
  const n = VIAJE.plan.length, d = Math.min(VIAJE.dia, n), cap = Math.floor((d - 1) / DIAS_CAPITULO), d0 = cap * DIAS_CAPITULO + 1;
  const caps = Math.ceil(n / DIAS_CAPITULO), y = 15;
  // a la izquierda: CAP y su número; debajo, los capítulos como puntitos (dorados los hechos)
  escribeMini(ctx, tr('CAP'), 4, 4, '#a98ae0');
  escribe(ctx, String(cap + 1), 18, 2, { c: COL.oro });
  for (let k = 0; k < caps; k++) { ctx.fillStyle = OL; ctx.fillRect(4 + k * 6, 16, 5, 5); ctx.fillStyle = k < cap ? COL.oro : k === cap ? '#fff6ea' : '#3e2363'; ctx.fillRect(5 + k * 6, 17, 3, 3); }
  const xa = 35, xb = W - 8, paso = (xb - xa) / (DIAS_CAPITULO - 1), xd = i => Math.round(xa + i * paso), xh = xd(d - d0);
  // el camino, por detrás de los días: dorado por donde ya has pasado
  ctx.fillStyle = OL; ctx.fillRect(xd(0), y - 2, xd(DIAS_CAPITULO - 1) - xd(0), 5);
  ctx.fillStyle = '#3e2363'; ctx.fillRect(xd(0), y - 1, xd(DIAS_CAPITULO - 1) - xd(0), 3);
  ctx.fillStyle = '#c88a2a'; ctx.fillRect(xd(0), y - 1, xh - xd(0), 3);
  ctx.fillStyle = COL.oro; ctx.fillRect(xd(0), y - 1, xh - xd(0), 1);
  for (let i = 0; i < DIAS_CAPITULO && d0 + i <= n; i++) {
    const dia = d0 + i, tipo = VIAJE.plan[dia - 1], x = xd(i), hoy = dia === d, pasado = dia < d;
    // la piedra del día (la de hoy, con marco que brilla)
    if (hoy) {
      ctx.fillStyle = OL; ctx.fillRect(x - 7, y - 7, 15, 15);
      ctx.fillStyle = Math.floor(RELOJ.t * 3) % 2 ? '#fff6ea' : COL.oro; ctx.fillRect(x - 6, y - 6, 13, 13);
    } else { ctx.fillStyle = OL; ctx.fillRect(x - 6, y - 6, 13, 13); }
    ctx.fillStyle = hoy ? '#2a1648' : pasado ? '#1c0f2e' : '#2e1a4a'; ctx.fillRect(x - 5, y - 5, 11, 11);
    ctx.save(); if (pasado) ctx.globalAlpha = 0.35;
    pintaSpr(ctx, SPR.dia[tipo] || SPR.dia.combate, x, y);
    ctx.restore();
    if (pasado) { ctx.fillStyle = '#7be04a'; ctx.fillRect(x + 1, y + 3, 1, 1); ctx.fillRect(x + 2, y + 4, 1, 1); ctx.fillRect(x + 3, y + 3, 1, 1); ctx.fillRect(x + 4, y + 2, 1, 1); }
  }
  // el conejo, asomado encima de hoy
  pintaSpr(ctx, SPR.dia.conejo, xh, y - 7 - sube_());
}
