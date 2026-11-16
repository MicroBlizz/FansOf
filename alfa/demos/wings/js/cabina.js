// Fans of Wings · La cabina (cámara en primera persona), dibujada por código: el arco de la cúpula y el panel de instrumentos
// con el radar, el horizonte artificial, dos relojes y la pantalla de datos (altura, velocidad y combustible).
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const ALTO = 250, Y0 = 720 - ALTO;

  function cupula(g, W) {
    for (const [c, an, a0, a1] of [['#16213a', 40, Math.PI, 2 * Math.PI], ['#2a3b63', 12, Math.PI, 2 * Math.PI], ['#f2702a', 22, 1.22 * Math.PI, 1.34 * Math.PI], ['#f2702a', 22, 1.66 * Math.PI, 1.78 * Math.PI]]) {
      g.strokeStyle = c; g.lineWidth = an; g.beginPath(); g.ellipse(W / 2, Y0 + 70, W * 0.53, Y0 + 50, 0, a0, a1); g.stroke();
    }
  }
  function panel(g, W) {
    g.fillStyle = '#16213a'; g.fillRect(0, Y0, W, ALTO);
    g.fillStyle = '#1e2c4d'; g.beginPath(); g.moveTo(W * 0.3, Y0); g.lineTo(W * 0.34, Y0 - 24); g.lineTo(W * 0.66, Y0 - 24); g.lineTo(W * 0.7, Y0); g.fill();
    g.fillStyle = '#2a3b63'; g.fillRect(0, Y0, W, 7);
    g.fillStyle = '#f2702a'; for (let i = 0; i < 4; i++) g.fillRect(W / 2 - 54 + i * 29, Y0 - 15, 20, 7);
  }
  function pantalla(g, x, y, w, h) { g.fillStyle = '#080d1a'; g.fillRect(x - 7, y - 7, w + 14, h + 14); g.fillStyle = '#0c2a17'; g.fillRect(x, y, w, h); }

  function horizonte(g, j, cx, cy, r) {
    const alabeo = A.vuelo.alabeo(j), cabeceo = Math.asin(Math.max(-1, Math.min(1, j.f.y)));
    g.fillStyle = '#080d1a'; g.beginPath(); g.arc(cx, cy, r + 12, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip(); g.translate(cx, cy); g.rotate(-alabeo); g.translate(0, cabeceo * r * 1.4);
    g.fillStyle = '#5aa6e8'; g.fillRect(-r * 3, -r * 5, r * 6, r * 5); g.fillStyle = '#9a6a3a'; g.fillRect(-r * 3, 0, r * 6, r * 5); g.fillStyle = '#fff'; g.fillRect(-r * 3, -2, r * 6, 4);
    for (let i = -3; i <= 3; i++) if (i) g.fillRect(-r * 0.3, i * r * 0.35 - 1, r * 0.6, 2);
    g.restore();
    g.fillStyle = '#ffd23c'; g.fillRect(cx - r * 0.6, cy - 2, r * 0.36, 5); g.fillRect(cx + r * 0.24, cy - 2, r * 0.36, 5); g.fillRect(cx - 3, cy - 3, 6, 6);
  }
  function reloj(g, x, y, v) {
    g.fillStyle = '#080d1a'; g.beginPath(); g.arc(x, y, 28, 0, 7); g.fill(); g.strokeStyle = '#2a3b63'; g.lineWidth = 5; g.stroke();
    const an = -2.3 + Math.max(0, Math.min(1, v)) * 4.6;
    g.strokeStyle = '#f2702a'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(an) * 21, y - Math.cos(an) * 21); g.stroke();
  }
  function datos(g, e, x, y, w) {
    const j = e.aire.jugador, C = e.aj.combustible, T = A.ui.texto, P = e.aj.aire.vuelo;
    T(g, tr('ALT') + ' ' + Math.round(j.pos.y), x + 14, y + 34, 12, j.pos.y < P.altAviso ? '#ff5a3a' : '#6dff8a', 'left');
    T(g, tr('VEL') + ' ' + Math.round(j.vel * 3.6), x + 14, y + 66, 12, j.vel < P.velMin * 1.1 ? '#ff5a3a' : '#6dff8a', 'left');
    T(g, tr('COMB') + ' ' + Math.ceil(e.combustible), x + 14, y + 98, 12, e.combustible < C.aviso ? '#ff5a3a' : '#6dff8a', 'left');
    T(g, tr('MISILES') + ' ' + e.misiles, x + 14, y + 130, 12, '#9fe0ff', 'left');
    A.ui.barra(g, x + 14, y + 150, w - 28, 12, e.escudo / e.caza.escudo, '#5fe05f');
  }

  // peso = cuánto de la cabina se ve (0 a 1, mientras la cámara entra o sale).
  A.cabina = function (g, e, peso, W) {
    if (peso <= 0.01) return;
    g.save(); g.globalAlpha = peso;
    cupula(g, W); panel(g, W);
    const ancho = Math.min(230, W * 0.2), alto = ALTO - 64, y = Y0 + 34, izq = W * 0.5 - 150 - ancho - 96, der = W * 0.5 + 150 + 96;
    pantalla(g, izq, y, ancho, alto);
    g.save(); g.beginPath(); g.rect(izq, y, ancho, alto); g.clip(); A.ui.radar(g, e, izq + ancho / 2, y + alto / 2, alto / 2 - 6); g.restore();
    const j = e.aire.jugador, P = e.aj.aire.vuelo;
    horizonte(g, j, W / 2, Y0 + ALTO * 0.48, 84);
    reloj(g, W / 2 - 150, Y0 + 70, j.vel / P.velMax); reloj(g, W / 2 - 150, Y0 + 170, e.combustible / e.aj.combustible.max);
    reloj(g, W / 2 + 150, Y0 + 70, j.pos.y / P.altMax); reloj(g, W / 2 + 150, Y0 + 170, e.escudo / e.caza.escudo);
    pantalla(g, der, y, ancho, alto); datos(g, e, der, y, ancho);
    g.restore();
  };
})(WINGS);
