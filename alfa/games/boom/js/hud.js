// Fans of Boom · HUD: lo que se dibuja encima del mundo en el lienzo. La rosa del viento, el tiempo, la barra de quién va después,
// el minimapa y el cartel de «tiro alto». Los botones y barras de control son HTML (controles.js).
'use strict';
const HUD = (() => {
  const WW = BOOM.mundo.ancho, WH = BOOM.mundo.alto, V = PINTAR.V, MM = { w: 216, h: 68, x: 12, y: 64 };   // el minimapa: 1/13,3 del mundo

  function viento(c, P) {   // la rosa del viento: flecha hacia donde sopla, más larga cuanto más fuerte. Oculta mientras se pasa el aparato.
    const x = V.w - 56, y = 56, oculto = P.fase === 'cartel';
    c.fillStyle = 'rgba(32,16,44,.78)'; c.strokeStyle = OL; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 38, 0, 6.2832); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 34, y); c.lineTo(x + 34, y); c.moveTo(x, y - 34); c.lineTo(x, y + 34); c.stroke();
    if (oculto) { PINTAR_TXT(c, '?', x, y, 36, '#cdb9ea', 'center', FONT_D); return; }
    const w = P.viento, n = Math.abs(w), d = w < 0 ? -1 : 1, l = 6 + n * 1.1;
    if (n) {
      c.fillStyle = n > 16 ? '#ff7a8a' : n > 8 ? '#ffcb3d' : '#9be58a'; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath();
      c.moveTo(x + d * l, y); c.lineTo(x + d * (l - 12), y - 11); c.lineTo(x + d * (l - 12), y - 4); c.lineTo(x - d * l, y - 4); c.lineTo(x - d * l, y + 4); c.lineTo(x + d * (l - 12), y + 4); c.lineTo(x + d * (l - 12), y + 11); c.closePath(); c.fill(); c.stroke();
    }
    PINTAR_TXT(c, String(n), x, y + 50, 22, '#fff');
  }
  function tiempo(c, P) {
    if (P.fase !== 'apunta') return;
    const s = Math.max(0, Math.ceil(P.t)), x = V.w - 120, y = 56, poco = s <= 5;
    c.fillStyle = poco ? '#ff4b5c' : 'rgba(32,16,44,.78)'; c.strokeStyle = OL; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 26, 0, 6.2832); c.fill(); c.stroke();
    PINTAR_TXT(c, String(s), x, y + 1, 28, '#fff', 'center', FONT_D);
  }
  function orden(c, P) {   // los que van a tirar, de izquierda a derecha; el primero es el de ahora
    const l = PARTIDA.orden(), w = 44, x0 = V.w / 2 - (l.length * w) / 2 - 20;
    l.forEach((m, i) => {
      const E = BOOM.equipos[m.equipo], x = x0 + i * w + w / 2, y = 30, r = i === 0 ? 20 : 15;
      c.fillStyle = E.color; c.strokeStyle = OL; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); c.stroke();
      PINTAR_TXT(c, String(m.plaza + 1), x, y + 1, i === 0 ? 20 : 15, '#fff', 'center', FONT_D);
    });
    if (l.length) PINTAR_TXT(c, tr('Va después'), x0 + l.length * w + 6, 30, 12, '#cdb9ea', 'left');
  }
  function minimapa(c, P) {
    const { x, y, w, h } = MM, k = w / WW;
    c.fillStyle = 'rgba(32,16,44,.72)'; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); rrPath(c, x, y, w, h, 6); c.fill(); c.stroke();
    const cv = TERRENO.canvas(); if (cv) { c.save(); c.beginPath(); rrPath(c, x + 1, y + 1, w - 2, h - 2, 5); c.clip(); c.globalAlpha = 0.9; c.drawImage(cv, x, y + 1, w, WH * k); c.restore(); }
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.5; c.strokeRect(x + PINTAR.CAM.x * k, y + PINTAR.CAM.y * k, V.w * k, Math.min(V.h, WH) * k);
    for (const m of P.moviles) if (m.vivo) {
      c.fillStyle = BOOM.equipos[m.equipo].color; c.strokeStyle = OL; c.lineWidth = 1.5; c.beginPath(); c.arc(x + m.x * k, y + (m.y - 14) * k, m === P.actual ? 4.5 : 3.2, 0, 6.2832); c.fill(); c.stroke();
    }
  }
  function toca(px, py) {   // un toque sobre el minimapa lleva la cámara a ese sitio unos segundos
    const { x, y, w, h } = MM; if (px < x || px > x + w || py < y || py > y + h) return false;
    const k = w / WW; PINTAR.enfoca((px - x) / k, (py - y) / k + 100); PINTAR.CAM.libre = 3.5; return true;
  }
  function bono(c) {
    const b = EFECTOS.FX.cartel; if (!b) return;
    const k = b.t / b.dur, esc = k < 0.15 ? 0.6 + k / 0.15 * 0.5 : 1.1 - Math.min(0.1, (k - 0.15) * 0.3);
    c.save(); c.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1; c.translate(V.w / 2, V.h * 0.3); c.scale(esc, esc); c.rotate(-0.05);
    PINTAR_TXT(c, b.s + '!', 0, 0, 56, '#ffcb3d', 'center', FONT_D); PINTAR_TXT(c, b.frase, 0, 42, 18, '#fff'); c.restore();
  }
  function frame(c, P) { viento(c, P); tiempo(c, P); orden(c, P); minimapa(c, P); bono(c); }
  return { frame, toca, MM };
})();
