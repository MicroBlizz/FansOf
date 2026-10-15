// Fans of Rouflage · ARMARIO (dibujo, 1 de 2): la galleta vestida y las piezas que se le ponen (ojos, bocas, papeles, cabeza y espalda),
// y los iconos de las monedas y el candado. Todo dentro de ARD para no chocar con los nombres del juego (forma, humo, PAPELES…).
// Medidas de la galleta en postura «Firmes»: los pies en 0,0 y la cabeza con el centro en 0,-41.5 y radio 11.5 (como CABEZA de alubia.js).
'use strict';
const ARD = (() => {
  const OL = '#20102c', T = Math.PI * 2;
  let FONDO = true;   // las caras de los iconos llevan su cabeza de papel detrás; al ponerlas sobre la galleta, no
  function forma(c, traza, relleno, lw = 2) { c.beginPath(); traza(c); if (relleno) { c.fillStyle = relleno; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke(); } }
  function capsula(c, x, y, largo, ang, r) {
    const x2 = x + Math.cos(ang) * largo, y2 = y + Math.sin(ang) * largo;
    c.moveTo(x2 + Math.cos(ang - Math.PI / 2) * r, y2 + Math.sin(ang - Math.PI / 2) * r);
    c.arc(x2, y2, r, ang - Math.PI / 2, ang + Math.PI / 2); c.arc(x, y, r, ang + Math.PI / 2, ang + Math.PI * 1.5); c.closePath();
  }
  function traza(c) {
    capsula(c, -6, -12, 8, Math.PI / 2 + 0.02, 5.2); capsula(c, 6, -12, 8, Math.PI / 2 - 0.02, 5.2);
    capsula(c, -10, -27, 9, Math.PI / 2 + 0.12, 4.3); capsula(c, 10, -28, 9, Math.PI / 2 - 0.12, 4.3);
    c.moveTo(-9, -32); c.bezierCurveTo(-3, -34, 3, -34, 9, -32); c.bezierCurveTo(13, -24, 14, -15, 12.5, -10); c.bezierCurveTo(10, -6, -10, -6, -12.5, -10); c.bezierCurveTo(-14, -15, -13, -24, -9, -32); c.closePath();
    c.moveTo(11.5, -41.5); c.arc(0, -41.5, 11.5, 0, T); c.closePath();
  }
  function caraBase(c) {   // la cara de siempre (para los dibujos de catálogo que no son de cara)
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(2 + s * 4.4, -42, 1.9, 2.5, 0, 0, T); c.fillStyle = OL; c.fill(); c.beginPath(); c.arc(2.7 + s * 4.4, -43, .7, 0, T); c.fillStyle = '#fff'; c.fill(); c.beginPath(); c.ellipse(2 + s * 7.2, -38, 2, 1.2, 0, 0, T); c.fillStyle = 'rgba(255,120,150,.45)'; c.fill(); }
    c.beginPath(); c.arc(2, -38.9, 2.5, .25, Math.PI - .25); c.lineWidth = 1.3; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke();
  }
  function adornos(c, o) {
    if (o.orejas) for (const [dx, rot] of [[-4.6, -.3], [4.6, .3]]) { c.save(); c.translate(dx, -51.5); c.rotate(rot); c.beginPath(); c.ellipse(0, -8, 3.7, 9, 0, 0, T); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); c.beginPath(); c.ellipse(0, -8, 1.7, 6.2, 0, 0, T); c.fillStyle = '#ffb7c9'; c.fill(); c.restore(); }
    if (o.corona) { c.beginPath(); c.moveTo(-5, -51); c.lineTo(-6, -56.5); c.lineTo(-2.5, -53.5); c.lineTo(0, -58); c.lineTo(2.5, -53.5); c.lineTo(6, -56.5); c.lineTo(5, -51); c.closePath(); c.fillStyle = '#ffcb3d'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke(); }
    if (o.gorra) { c.beginPath(); c.moveTo(-11.5, -43.5); c.quadraticCurveTo(-11.5, -55.5, 0, -55.5); c.quadraticCurveTo(11.5, -55.5, 11.5, -43.5); c.lineTo(17.5, -42.5); c.lineTo(-11.5, -42.5); c.closePath(); c.fillStyle = '#3a7de0'; c.fill(); c.lineWidth = 1.8; c.strokeStyle = OL; c.stroke(); }
  }
  // la galleta: sombra, contorno, papel y (si se pide) la cara de siempre
  function galleta(c, x, y, e, o = {}) {
    c.save(); c.translate(x, y); c.scale(e, e);
    if (!o.sinCuerpo) {
      c.fillStyle = 'rgba(20,10,40,.3)'; c.beginPath(); c.ellipse(0, 1, 15, 3.6, 0, 0, T); c.fill();
      c.beginPath(); traza(c); c.lineWidth = 6; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke();
      c.beginPath(); traza(c); c.fillStyle = o.papel || '#f7f2ea'; c.fill();
      if (o.cara) caraBase(c);
    }
    adornos(c, o);
    c.restore();
  }
  const ICONOS = {
    migas(c, w) {   // una galletita mordida
      const r = w * .36; c.beginPath(); c.arc(w / 2, w / 2, r, .5, T - .1); c.arc(w * .82, w * .38, r * .32, -1.1, 2.2, true); c.closePath();
      c.fillStyle = '#d9a25b'; c.fill(); c.lineWidth = w * .09; c.strokeStyle = OL; c.stroke();
      for (const [x, y] of [[.4, .45], [.55, .62], [.36, .66]]) { c.beginPath(); c.arc(w * x, w * y, w * .05, 0, T); c.fillStyle = '#6b3c1c'; c.fill(); }
    },
    purpurina(c, w) {   // un tarrito de purpurina con brillos
      c.beginPath(); c.roundRect(w * .22, w * .32, w * .56, w * .56, w * .12); c.fillStyle = '#ff6fb5'; c.fill(); c.lineWidth = w * .09; c.strokeStyle = OL; c.stroke();
      c.beginPath(); c.roundRect(w * .28, w * .16, w * .44, w * .18, w * .05); c.fillStyle = '#ffcb3d'; c.fill(); c.stroke();
      for (const [x, y, r] of [[.4, .52, .06], [.6, .66, .05], [.45, .74, .04], [.62, .46, .04]]) { c.beginPath(); c.arc(w * x, w * y, w * r, 0, T); c.fillStyle = '#fff'; c.fill(); }
    },
    candado(c, w) {
      c.beginPath(); c.arc(w / 2, w * .42, w * .22, Math.PI, 0); c.lineWidth = w * .13; c.strokeStyle = OL; c.stroke(); c.lineWidth = w * .07; c.strokeStyle = '#cdb9ea'; c.stroke();
      c.beginPath(); c.roundRect(w * .2, w * .42, w * .6, w * .46, w * .08); c.fillStyle = '#ffcb3d'; c.fill(); c.lineWidth = w * .1; c.strokeStyle = OL; c.stroke();
    },
    xp(c, w) {   // una estrella
      c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? w * .2 : w * .44, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(w / 2 + Math.cos(a) * r, w / 2 + Math.sin(a) * r); } c.closePath();
      c.fillStyle = '#39d5e8'; c.fill(); c.lineWidth = w * .08; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke();
    },
    nada(c, w) {   // «sin nada»: un círculo tachado
      c.lineWidth = w * .08; c.strokeStyle = 'rgba(205,185,234,.7)'; c.beginPath(); c.arc(w / 2, w / 2, w * .3, 0, T); c.moveTo(w * .29, w * .71); c.lineTo(w * .71, w * .29); c.stroke();
    },
  };
  function cabezaPapel(c, w) { if (!FONDO) return; c.beginPath(); c.arc(w / 2, w / 2, w * .42, 0, T); c.fillStyle = '#f7f2ea'; c.fill(); c.lineWidth = w * .05; c.strokeStyle = OL; c.stroke(); }
  function ojos(c, w, tipo) {
    cabezaPapel(c, w); const y = w / 2;
    if (tipo === 'puntos') for (const s of [-1, 1]) { c.beginPath(); c.arc(w / 2 + s * w * .16, y, w * .07, 0, T); c.fillStyle = OL; c.fill(); }
    else if (tipo === 'grandes') for (const s of [-1, 1]) { c.beginPath(); c.ellipse(w / 2 + s * w * .16, y, w * .12, w * .15, 0, 0, T); c.fillStyle = '#fff'; c.fill(); c.lineWidth = w * .04; c.strokeStyle = OL; c.stroke(); c.beginPath(); c.arc(w / 2 + s * w * .14, y + w * .02, w * .06, 0, T); c.fillStyle = OL; c.fill(); }
    else if (tipo === 'dormido') for (const s of [-1, 1]) { c.beginPath(); c.arc(w / 2 + s * w * .16, y - w * .02, w * .09, .2, Math.PI - .2); c.lineWidth = w * .05; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke(); }
    else if (tipo === 'estrella') for (const s of [-1, 1]) { c.save(); c.translate(w / 2 + s * w * .16 - w * .12, y - w * .12); ICONOS.xp(c, w * .24); c.restore(); }
    else if (tipo === 'gafas') { for (const s of [-1, 1]) { c.beginPath(); c.arc(w / 2 + s * w * .16, y, w * .11, 0, T); c.fillStyle = 'rgba(57,213,232,.5)'; c.fill(); c.lineWidth = w * .05; c.strokeStyle = OL; c.stroke(); } c.beginPath(); c.moveTo(w * .45, y); c.lineTo(w * .55, y); c.stroke(); }
  }
  function boca(c, w, tipo) {
    cabezaPapel(c, w); const y = w * .7; c.lineWidth = w * .06; c.strokeStyle = OL; c.lineCap = 'round';
    if (tipo === 'sonrisa') { c.beginPath(); c.arc(w / 2, y - w * .08, w * .14, .3, Math.PI - .3); c.stroke(); }
    else if (tipo === 'o') { c.beginPath(); c.ellipse(w / 2, y, w * .06, w * .08, 0, 0, T); c.fillStyle = OL; c.fill(); }
    else if (tipo === 'lengua') { c.beginPath(); c.arc(w / 2, y - w * .08, w * .14, .3, Math.PI - .3); c.stroke(); c.beginPath(); c.ellipse(w / 2 + w * .04, y + w * .05, w * .05, w * .06, 0, 0, T); c.fillStyle = '#ff6f8f'; c.fill(); }
    else if (tipo === 'bigote') { c.beginPath(); c.moveTo(w * .3, y); c.quadraticCurveTo(w * .4, y - w * .1, w / 2, y - w * .02); c.quadraticCurveTo(w * .6, y - w * .1, w * .7, y); c.lineWidth = w * .09; c.stroke(); }
  }
  // los dibujos de papel (en las medidas de la galleta, recortados a su silueta)
  const PAPEL = {
    cuadricula: c => { c.strokeStyle = 'rgba(70,120,200,.4)'; c.lineWidth = .6; for (let k = -70; k < 20; k += 4) { c.beginPath(); c.moveTo(-30, k); c.lineTo(30, k); c.stroke(); } for (let k = -30; k < 30; k += 4) { c.beginPath(); c.moveTo(k, -70); c.lineTo(k, 10); c.stroke(); } },
    rayas: c => { c.strokeStyle = 'rgba(70,120,200,.45)'; c.lineWidth = .7; for (let k = -70; k < 20; k += 5) { c.beginPath(); c.moveTo(-30, k); c.lineTo(30, k); c.stroke(); } c.strokeStyle = 'rgba(255,75,92,.6)'; c.beginPath(); c.moveTo(-8, -70); c.lineTo(-8, 10); c.stroke(); },
    periodico: c => { c.fillStyle = 'rgba(40,30,50,.35)'; for (let k = -62; k < 0; k += 3) for (let x = -14; x < 14; x += 9) if ((k + x * 7) % 5) c.fillRect(x, k, 7, 1.2); c.fillStyle = 'rgba(40,30,50,.6)'; c.fillRect(-12, -30, 24, 4); },
    purpurina: c => { for (let k = 0; k < 90; k++) { const x = Math.sin(k * 12.9898) * 15, y = -60 + ((k * 7.31) % 62); c.fillStyle = ['#fff', '#ffcb3d', '#ff6fb5', '#39d5e8'][k % 4]; c.fillRect(x, y, 1.1, 1.1); } },
    carton: c => { c.strokeStyle = 'rgba(90,60,20,.35)'; c.lineWidth = 1.2; for (let k = -70; k < 20; k += 3) { c.beginPath(); c.moveTo(-30, k); c.quadraticCurveTo(0, k + 1.5, 30, k); c.stroke(); } },
    regalo: c => { c.fillStyle = '#ff4b5c'; c.fillRect(-2.5, -70, 5, 80); c.fillRect(-30, -24, 60, 5); for (let k = 0; k < 30; k++) { c.fillStyle = '#ffcb3d'; c.beginPath(); c.arc(Math.sin(k * 3.1) * 12, -55 + (k * 2.1) % 50, .9, 0, T); c.fill(); } },
    mapa: c => { c.strokeStyle = 'rgba(40,110,80,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-12, -50); c.bezierCurveTo(0, -46, 4, -30, 10, -20); c.stroke(); c.strokeStyle = 'rgba(255,75,92,.8)'; c.setLineDash([1.5, 1.5]); c.beginPath(); c.moveTo(-8, -15); c.quadraticCurveTo(6, -28, 2, -45); c.stroke(); c.setLineDash([]); c.lineWidth = 1.4; c.beginPath(); c.moveTo(-2, -30); c.lineTo(2, -26); c.moveTo(2, -30); c.lineTo(-2, -26); c.stroke(); },
    partitura: c => { c.strokeStyle = 'rgba(40,30,50,.45)'; c.lineWidth = .5; for (let g = -58; g < 0; g += 14) for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(-30, g + k * 1.6); c.lineTo(30, g + k * 1.6); c.stroke(); } c.fillStyle = 'rgba(40,30,50,.7)'; for (let k = 0; k < 8; k++) { c.beginPath(); c.ellipse(-12 + k * 3.5, -55 + (k % 3) * 1.6 + Math.floor(k / 3) * 14, 1, .8, -.4, 0, T); c.fill(); } },
    billete: c => { c.strokeStyle = 'rgba(30,100,60,.45)'; c.lineWidth = .6; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(0, -22, 4 + k * 2.2, 3 + k * 1.6, 0, 0, T); c.stroke(); } c.fillStyle = 'rgba(30,100,60,.6)'; c.font = '700 6px sans-serif'; c.textAlign = 'center'; c.fillText('M', 0, -20); },
    celofan: c => { c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-14, -60); c.lineTo(-4, -60); c.lineTo(-18, -10); c.lineTo(-28, -10); c.fill(); c.beginPath(); c.moveTo(6, -60); c.lineTo(10, -60); c.lineTo(-4, -10); c.lineTo(-8, -10); c.fill(); },
  };
  const COLOR_PAPEL = { blanco: '#f7f2ea', kraft: '#c99a62', cuadricula: '#ffffff', rayas: '#fffdf4', periodico: '#e8e2d2', purpurina: '#d9a6ff', carton: '#b98a4f', regalo: '#58b8ff', mapa: '#efe0b4', partitura: '#fbf6ea', billete: '#cfe8c8', celofan: '#8fe3ff' };
  const CABEZAS = {
    aureola: c => { c.lineWidth = 4.5; c.strokeStyle = OL; c.beginPath(); c.ellipse(0, -58, 9, 2.8, 0, 0, T); c.stroke(); c.lineWidth = 2.2; c.strokeStyle = '#ffcb3d'; c.stroke(); },
    chistera: c => { forma(c, k => k.rect(-8, -68, 16, 14), '#2b2240'); forma(c, k => k.ellipse(0, -53.5, 13, 3, 0, 0, T), '#2b2240'); c.fillStyle = '#ff4b5c'; c.fillRect(-8, -58, 16, 3); },
    cuernos: c => { for (const s of [-1, 1]) forma(c, k => { k.moveTo(s * 5, -51); k.quadraticCurveTo(s * 12, -58, s * 9, -66); k.quadraticCurveTo(s * 9, -57, s * 1, -52); k.closePath(); }, '#ff4b5c'); },
    flor: c => { for (let k = 0; k < 5; k++) { const a = k / 5 * T; forma(c, g => g.ellipse(7 + Math.cos(a) * 4, -54 + Math.sin(a) * 4, 3, 3, 0, 0, T), '#ff6fb5', 1.4); } forma(c, g => g.arc(7, -54, 2.4, 0, T), '#ffcb3d', 1.4); },
    antena: c => { c.lineWidth = 3.5; c.strokeStyle = OL; c.beginPath(); c.moveTo(0, -52); c.lineTo(0, -63); c.stroke(); c.lineWidth = 1.6; c.strokeStyle = '#c3cbe0'; c.stroke(); forma(c, g => g.arc(0, -65, 3, 0, T), '#7ee04a', 1.6); },
    auriculares: c => { c.lineWidth = 4.5; c.strokeStyle = OL; c.beginPath(); c.arc(0, -42, 14, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); c.lineWidth = 2.4; c.strokeStyle = '#ff7a1a'; c.stroke(); for (const s of [-1, 1]) forma(c, g => g.ellipse(s * 13, -41, 3.4, 5, 0, 0, T), '#ff7a1a', 1.8); },
    casco: c => { forma(c, g => { g.moveTo(-13, -45); g.quadraticCurveTo(-12, -58, 0, -58); g.quadraticCurveTo(12, -58, 13, -45); g.closePath(); }, '#ffcb3d'); forma(c, g => g.rect(-15, -46, 30, 3), '#ffcb3d', 1.6); },
    fiesta: c => { forma(c, g => { g.moveTo(-6, -52); g.lineTo(2, -70); g.lineTo(8, -51); g.closePath(); }, '#39d5e8'); c.fillStyle = '#ff6fb5'; c.beginPath(); c.arc(2, -70, 2.2, 0, T); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-3, -58); c.lineTo(6, -60); c.stroke(); },
    lazo: c => { for (const s of [-1, 1]) forma(c, g => { g.moveTo(5, -52); g.lineTo(5 + s * 7, -57); g.lineTo(5 + s * 7, -47); g.closePath(); }, '#ff4b5c', 1.6); forma(c, g => g.arc(5, -52, 2, 0, T), '#ff4b5c', 1.4); },
    hoja: c => forma(c, g => { g.moveTo(0, -53); g.quadraticCurveTo(10, -64, 4, -70); g.quadraticCurveTo(-4, -62, 0, -53); g.closePath(); }, '#7ee04a'),
    pulpo: c => forma(c, g => { g.arc(0, -55, 8, Math.PI, 0); g.lineTo(8, -52); for (let k = 0; k < 4; k++) g.quadraticCurveTo(6 - k * 4, -48, 4 - k * 4, -52); g.closePath(); }, '#b45cff'),
    gorra: c => adornos(c, { gorra: true }), orejas: c => adornos(c, { orejas: true }), corona: c => adornos(c, { corona: true }),
  };
  const ESPALDAS = {
    zorro: c => { forma(c, g => { g.moveTo(-9, -8); g.bezierCurveTo(-26, -2, -36, -12, -34, -26); g.bezierCurveTo(-27, -20, -18, -22, -9, -20); g.closePath(); }, '#e8702a'); forma(c, g => { g.moveTo(-34, -26); g.bezierCurveTo(-35, -18, -31, -12, -26, -9); g.bezierCurveTo(-28, -15, -29, -20, -27, -22); g.closePath(); }, '#fff4e6', 2); },
    ardilla: c => forma(c, g => { g.moveTo(-9, -6); g.bezierCurveTo(-32, -2, -36, -30, -26, -42); g.bezierCurveTo(-18, -50, -7, -45, -10, -37); g.bezierCurveTo(-13, -31, -18, -32, -18, -26); g.bezierCurveTo(-18, -18, -11, -14, -9, -6); g.closePath(); }, '#b14d1c'),
    angel: c => { for (const s of [-1, 1]) forma(c, g => { g.moveTo(s * 10, -30); g.quadraticCurveTo(s * 32, -46, s * 34, -22); g.quadraticCurveTo(s * 26, -24, s * 24, -15); g.quadraticCurveTo(s * 18, -20, s * 10, -18); g.closePath(); }, '#eef2fa'); },
    murcielago: c => { for (const s of [-1, 1]) forma(c, g => { g.moveTo(s * 10, -30); g.lineTo(s * 33, -38); g.quadraticCurveTo(s * 30, -28, s * 34, -20); g.quadraticCurveTo(s * 26, -24, s * 24, -16); g.quadraticCurveTo(s * 18, -22, s * 10, -18); g.closePath(); }, '#4a3a6a'); },
    mariposa: c => { for (const s of [-1, 1]) { forma(c, g => g.ellipse(s * 20, -34, 10, 8, s * .5, 0, T), '#ff6fb5'); forma(c, g => g.ellipse(s * 17, -20, 6, 5, -s * .4, 0, T), '#39d5e8'); } },
    capa: c => forma(c, g => { g.moveTo(-10, -33); g.lineTo(10, -33); g.lineTo(18, -2); g.quadraticCurveTo(0, 3, -18, -2); g.closePath(); }, '#ff4b5c'),
    mochila: c => { forma(c, g => g.roundRect(8, -31, 12, 18, 4), '#7ee04a'); forma(c, g => g.rect(10, -24, 8, 4), '#5cbf2c', 1.4); },
    gato: c => { c.lineWidth = 7; c.strokeStyle = OL; c.lineCap = 'round'; c.beginPath(); c.moveTo(-9, -10); c.bezierCurveTo(-22, -8, -26, -24, -18, -32); c.stroke(); c.lineWidth = 3.6; c.strokeStyle = '#444058'; c.stroke(); },
    propulsor: c => { forma(c, g => g.roundRect(-20, -32, 9, 20, 3), '#c3cbe0'); forma(c, g => { g.moveTo(-19, -12); g.lineTo(-15.5, -2); g.lineTo(-12, -12); g.closePath(); }, '#ff7a1a', 1.4); },
  };
  // una cara de icono (ojos o boca) puesta en la cabeza de la galleta, sin su papel de fondo
  function enLaCara(c, dibuja) { const w = 11.5 / .42 * 1.0; c.save(); c.translate(-w / 2 + 1.2, -41.5 - w / 2); FONDO = false; try { dibuja(c, w); } finally { FONDO = true; c.restore(); } }
  // la galleta con todo. o = { papel, espalda, cabeza, ojos: fn, boca: fn, cara (la de siempre), esc }
  function vestida(c, w, h, o = {}) {
    const e = o.esc || h / 74, x = w / 2, y = h * .96;
    c.save(); c.translate(x, y); c.scale(e, e); if (o.espalda && ESPALDAS[o.espalda]) ESPALDAS[o.espalda](c); c.restore();
    galleta(c, x, y, e, { papel: COLOR_PAPEL[o.papel || 'blanco'] });
    c.save(); c.translate(x, y); c.scale(e, e);
    if (o.papel && PAPEL[o.papel]) { c.save(); c.beginPath(); traza(c); c.clip(); PAPEL[o.papel](c); c.restore(); }
    if (o.cara) caraBase(c);
    if (o.ojos) enLaCara(c, o.ojos);
    if (o.boca) enLaCara(c, o.boca);
    if (o.cabeza && CABEZAS[o.cabeza]) CABEZAS[o.cabeza](c);
    c.restore();
  }
  return { OL, T, forma, galleta, vestida, ICONOS, cabezaPapel, ojos, boca, COLOR_PAPEL };
})();
