// Fans of Boom · PROYECTILES: cómo se ve cada tiro (la forma la dice cada tiro en ajustes.js) y los golpes que caen del cielo
// (rayo del satélite, trueno, gato gigante, pie de kaiju). Solo dibujo: cada forma recibe (c, x, y, ángulo de vuelo, tiempo).
'use strict';
const PROYECTIL_FORMAS = (() => {
  const T = 6.2832;
  const borde = c => { c.lineWidth = 3; c.strokeStyle = OL; c.lineJoin = 'round'; };
  const gira = (c, x, y, r, f) => { c.save(); c.translate(x, y); c.rotate(r); borde(c); f(); c.restore(); };
  const caja = (c, x, y, w, h, r, col) => { c.fillStyle = col; c.beginPath(); rrPath(c, x, y, w, h, r); c.fill(); c.stroke(); };
  const bola = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, T); c.fill(); c.stroke(); };
  return {
    bola(c, x, y) { borde(c); bola(c, x, y, 7, '#ffcb3d'); },
    tapacubos(c, x, y, a, t) {   // tapacubos que gira plano: por eso el viento lo lleva
      c.save(); c.translate(x, y); c.rotate(t * 3); c.scale(1, 0.5 + 0.3 * Math.abs(Math.sin(t * 9))); borde(c);
      bola(c, 0, 0, 11, '#c8ccd4'); bola(c, 0, 0, 4.5, '#5b5f66');
      c.strokeStyle = '#7a7f88'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { const b = i / 5 * T; c.beginPath(); c.moveTo(Math.cos(b) * 5, Math.sin(b) * 5); c.lineTo(Math.cos(b) * 9, Math.sin(b) * 9); c.stroke(); }
      c.restore();
    },
    chatarra(c, x, y, a, t) { gira(c, x, y, t * 10, () => { c.fillStyle = '#9aa0a8'; c.beginPath(); c.moveTo(-7, -5); c.lineTo(6, -7); c.lineTo(8, 4); c.lineTo(-3, 7); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#6b4a2e'; c.fillRect(-2, -2, 4, 4); }); },
    calavera(c, x, y, a, t) {   // calavera con los ojos verdes
      gira(c, x, y, Math.sin(t * 6) * 0.4, () => {
        bola(c, 0, -1, 9, '#f4ecd8'); caja(c, -5, 5, 10, 6, 2, '#f4ecd8');
        c.fillStyle = '#7dff8a'; c.beginPath(); c.arc(-3.5, -1, 2.6, 0, T); c.arc(3.5, -1, 2.6, 0, T); c.fill();
      });
    },
    hueso(c, x, y, a, t) {
      gira(c, x, y, t * 12, () => {
        c.fillStyle = '#f4ecd8'; c.beginPath(); rrPath(c, -9, -3, 18, 6, 3); c.fill(); c.stroke();
        for (const s of [-1, 1]) for (const d of [-1, 1]) bola(c, s * 9, d * 3.5, 3.6, '#f4ecd8');
      });
    },
    fantasma(c, x, y, a, t) {   // calavera fantasma, medio transparente: atraviesa el suelo
      c.save(); c.globalAlpha = 0.85; c.translate(x, y); borde(c);
      c.fillStyle = '#c8ffd0'; c.beginPath(); c.arc(0, -2, 12, Math.PI, 0); for (let i = 0; i <= 4; i++) c.lineTo(12 - i * 6, 10 + (i % 2 ? -4 : 0) + Math.sin(t * 12 + i) * 2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = OL; c.beginPath(); c.arc(-4, -3, 3, 0, T); c.arc(4, -3, 3, 0, T); c.fill(); c.restore();
    },
    dardo(c, x, y, a) {   // dardo láser: fino y recto
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = 'rgba(124,240,255,.35)'; c.beginPath(); rrPath(c, -18, -6, 30, 12, 6); c.fill();
      borde(c); c.fillStyle = '#7cf0ff'; c.beginPath(); c.moveTo(-14, -3); c.lineTo(8, -3); c.lineTo(15, 0); c.lineTo(8, 3); c.lineTo(-14, 3); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#ff4bd8'; c.fillRect(-14, -5, 4, 10); c.fillStyle = '#fff'; c.fillRect(-8, -1, 12, 2); c.restore();
    },
    pelo(c, x, y, a, t) {   // bola de pelo despeinada
      gira(c, x, y, t * 5, () => {
        c.fillStyle = '#ffd24a'; c.beginPath(); for (let i = 0; i < 14; i++) { const r = i % 2 ? 6 : 10, b = i / 14 * T; c.lineTo(Math.cos(b) * r, Math.sin(b) * r); } c.closePath(); c.fill(); c.stroke();
      });
    },
    gatito(c, x, y, a, t) {   // un gatito hecho bola, con orejas
      gira(c, x, y, Math.sin(t * 8) * 0.5, () => {
        c.fillStyle = '#ff8fb8'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 2, -5); c.lineTo(s * 7, -11); c.lineTo(s * 8, -3); c.fill(); c.stroke(); }
        bola(c, 0, 0, 7, '#ff8fb8'); c.fillStyle = OL; c.fillRect(-3.5, -1.5, 2, 2); c.fillRect(1.5, -1.5, 2, 2);
      });
    },
    micro(c, x, y, a, t) {   // micro de oro
      gira(c, x, y, a + Math.PI / 2 + Math.sin(t * 10) * 0.3, () => { caja(c, -2.5, 0, 5, 13, 2, '#5b3d8a'); bola(c, 0, -3, 7, '#ffcb3d'); c.fillStyle = '#b8862a'; c.fillRect(-4, -5, 8, 1.6); c.fillRect(-4, -2, 8, 1.6); });
    },
    sub(c, x, y, a, t) {   // un corazón de suscripción
      gira(c, x, y, Math.sin(t * 7) * 0.4, () => {
        c.fillStyle = '#ff4bd8'; c.beginPath(); c.moveTo(0, 7); c.bezierCurveTo(-11, -1, -6, -10, 0, -4); c.bezierCurveTo(6, -10, 11, -1, 0, 7); c.fill(); c.stroke();
      });
    },
    martillo(c, x, y, a, t) { gira(c, x, y, t * 11, () => { caja(c, -2, -2, 4, 16, 2, '#6b4a2e'); caja(c, -9, -9, 18, 9, 2, '#c8ccd4'); c.fillStyle = '#3a6ad8'; c.fillRect(-3, -7, 6, 5); }); },
    runa(c, x, y, a, t) {   // piedra con una runa que brilla: marca dónde cae el rayo
      gira(c, x, y, t * 4, () => { caja(c, -7, -7, 14, 14, 3, '#8a8f9a'); c.strokeStyle = Math.sin(t * 20) > 0 ? '#fff3b0' : '#ffcb3d'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(1, -5); c.lineTo(-3, 0); c.lineTo(2, 0); c.lineTo(-1, 5); c.stroke(); });
    },
    tecla(c, x, y, a, t) {   // una tecla rota con su letra
      gira(c, x, y, t * 9, () => { caja(c, -8, -8, 16, 16, 3, '#e8e8f0'); c.fillStyle = '#c8c8d4'; c.fillRect(-5, 3, 10, 3); c.fillStyle = OL; c.font = '900 10px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Q', 0, -1); });
    },
    mando(c, x, y, a, t) {   // el mando que se tira al perder: se parte en teclas al volver a pulsar
      gira(c, x, y, t * 6, () => {
        c.fillStyle = '#2a2a3a'; c.beginPath(); rrPath(c, -13, -6, 26, 12, 6); c.fill(); c.stroke();
        c.fillStyle = '#ff3a5a'; c.beginPath(); c.arc(7, -1, 2.4, 0, T); c.fill(); c.fillStyle = '#3aff9a'; c.beginPath(); c.arc(4, 2, 2.4, 0, T); c.fill();
        c.fillStyle = '#c8c8d4'; c.fillRect(-9, -1, 7, 2.5); c.fillRect(-6.8, -3.4, 2.5, 7);
      });
    },
    hacha(c, x, y, a, t) {   // hacha pixelada que gira
      gira(c, x, y, t * 13, () => { c.fillStyle = '#6b4a2e'; c.fillRect(-2, -10, 4, 20); c.strokeRect(-2, -10, 4, 20); c.fillStyle = '#c8ccd4'; c.fillRect(2, -10, 8, 4); c.fillRect(2, -6, 10, 4); c.fillRect(2, -2, 8, 4); c.strokeRect(2, -10, 10, 12); });
    },
    taladro(c, x, y, a, t) {   // broca que gira mirando hacia donde va
      c.save(); c.translate(x, y); c.rotate(a); borde(c);
      caja(c, -14, -6, 10, 12, 3, '#d84a3a');
      c.fillStyle = '#c8ccd4'; c.beginPath(); c.moveTo(-4, -6); c.lineTo(14, 0); c.lineTo(-4, 6); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#7a7f88'; c.lineWidth = 2; const d = (t * 40) % 6; for (let i = 0; i < 3; i++) { const xx = -2 + i * 5 + d * 0.5; c.beginPath(); c.moveTo(xx, -4 + i); c.lineTo(xx + 3, 4 - i); c.stroke(); }
      c.restore();
    },
    extra(c, x, y, a, t) {   // un extra de cine con su casco: al caer se queda como mina
      gira(c, x, y, Math.sin(t * 9) * 0.6, () => { caja(c, -5, -2, 10, 10, 3, '#ffcb3d'); bola(c, 0, -6, 5, '#f4c9a0'); c.fillStyle = '#ff4b5c'; c.beginPath(); c.arc(0, -8, 5, Math.PI, 0); c.fill(); c.stroke(); });
    },
    claqueta(c, x, y, a, t) {   // claqueta de cine
      gira(c, x, y, t * 8, () => {
        caja(c, -9, -3, 18, 11, 2, '#2a2a2a');
        c.save(); c.translate(-9, -3); c.rotate(-0.35 - Math.abs(Math.sin(t * 12)) * 0.3); c.fillStyle = '#fff'; c.fillRect(0, -5, 18, 5); c.strokeRect(0, -5, 18, 5); c.fillStyle = OL; for (let i = 2; i < 18; i += 6) c.fillRect(i, -5, 3, 5); c.restore();
      });
    },
    tren(c, x, y, a, t, p) {   // el Hype Train: una locomotora morada que echa corazones
      c.save(); c.translate(x, y); c.scale(p && p.dir < 0 ? -1 : 1, 1); borde(c);
      caja(c, -20, -20, 30, 14, 3, '#7a3ad8'); caja(c, 2, -30, 10, 12, 2, '#ff4bd8'); caja(c, -18, -28, 8, 8, 2, '#3a3a44');
      c.fillStyle = '#ffcb3d'; c.beginPath(); c.moveTo(10, -6); c.lineTo(18, -6); c.lineTo(10, -16); c.closePath(); c.fill(); c.stroke();
      for (const xx of [-14, -2, 8]) bola(c, xx, -5, 4.5, '#2a2a3a');
      c.restore();
    },
  };
})();

// los golpes que caen del cielo: se dibujan cayendo durante su espera (k va de 0, recién lanzado, a 1, al tocar)
const GOLPE_FORMAS = (() => {
  const T = 6.2832;
  function rayo(c, x, top, y, k, col, brillo) {   // columna de luz que se va haciendo más gruesa
    const w = 4 + k * 22;
    c.globalAlpha = 0.25 + k * 0.6; c.fillStyle = col; c.fillRect(x - w, top, w * 2, y - top);
    c.globalAlpha = 1; c.fillStyle = brillo; c.fillRect(x - w * 0.35, top, w * 0.7, y - top); c.globalAlpha = 1;
  }
  function trueno(c, x, top, y, k) {   // zigzag amarillo que baja
    c.lineJoin = 'round'; const fin = top + (y - top) * k;
    for (const [lw, col] of [[9, OL], [5, '#ffe96b'], [2, '#fff']]) {
      c.lineWidth = lw; c.strokeStyle = col; c.beginPath(); c.moveTo(x, top);
      for (let yy = top + 30, i = 0; yy < fin; yy += 30, i++) c.lineTo(x + (i % 2 ? 12 : -12), yy);
      c.lineTo(x, fin); c.stroke();
    }
  }
  function gato(c, x, top, y, k) {   // un gato gigante que cae panza abajo
    const yy = top + (y - top) * k * k - 40; c.save(); c.translate(x, yy); c.lineWidth = 4; c.strokeStyle = OL;
    c.fillStyle = '#ffd24a'; c.beginPath(); c.ellipse(0, 0, 70, 44, 0, 0, T); c.fill(); c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 26, -36); c.lineTo(s * 44, -70); c.lineTo(s * 56, -26); c.fill(); c.stroke(); }
    c.fillStyle = '#fff'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 20, -8, 10, 0, T); c.fill(); c.stroke(); }
    c.fillStyle = OL; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 20, -4, 5, 0, T); c.fill(); }
    c.restore();
  }
  function pie(c, x, top, y, k) {   // el pie del kaiju: verde, con tres uñas
    const yy = top + (y - top) * k * k - 60; c.save(); c.translate(x, yy); c.lineWidth = 4; c.strokeStyle = OL;
    c.fillStyle = '#5e8a3a'; c.fillRect(-34, -260, 68, 230); c.strokeRect(-34, -260, 68, 230);
    c.beginPath(); c.ellipse(0, 0, 70, 34, 0, 0, T); c.fill(); c.stroke();
    c.fillStyle = '#f4ecd8'; for (const s of [-40, 0, 40]) { c.beginPath(); c.moveTo(s - 9, 22); c.lineTo(s, 42); c.lineTo(s + 9, 22); c.closePath(); c.fill(); c.stroke(); }
    c.restore();
  }
  return {
    rayo: (c, x, top, y, k) => rayo(c, x, top, y, k, '#7cf0ff', '#ffffff'),
    trueno, gato, pie,
  };
})();
