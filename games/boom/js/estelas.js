// Fans of Boom · ESTELAS: el aspecto propio de cada facción en el aire y al explotar: la estela que deja su tiro, los colores y trozos
// de su explosión (tornillos, huesos, píxeles, pelo, confeti, teclas…) y la palabra que suelta a veces. Solo adorno: la partida no lo mira.
'use strict';
const ESTELAS = (() => {
  const T = 6.2832;
  const E = {   // estela, colores de la bola de fuego (fuera, dentro), trozos que saltan y su forma, y la palabra de la explosión grande
    tapacubos: { tiro: 'clank', estela: 'espiral', col: '#ff9a2a', bola: ['#ffe0b0', '#ff9a2a'], trozos: ['#9aa0a8', '#ff9a2a', '#6b4a2e'], k: 'tornillo' },
    ataud: { tiro: 'wail', estela: 'humo', col: '#7dff8a', bola: ['#e8ffe8', '#7dff8a'], trozos: ['#f4ecd8', '#7dff8a'], k: 'hueso' },
    antena: { tiro: 'laser', estela: 'luz', col: '#7cf0ff', bola: ['#ffffff', '#7cf0ff'], trozos: ['#7cf0ff', '#ff4bd8', '#ffffff'], k: 'pixel' },
    gatotanque: { tiro: 'pop', estela: 'pelos', col: '#ffd24a', bola: ['#fff3b0', '#ffd24a'], trozos: ['#ffd24a', '#ff8fb8'], k: 'pelo', palabra: '¡Miau!' },
    carroza: { tiro: 'hype', estela: 'corazones', col: '#ff4bd8', bola: ['#ffd0f4', '#b86bff'], trozos: ['#ff4bd8', '#7a3ad8', '#ffcb3d', '#7cf0ff'], k: 'confeti', palabra: '+1.000 espectadores' },
    carro: { tiro: 'zap', estela: 'chispa', col: '#ffe96b', bola: ['#ffffff', '#ffcb3d'], trozos: ['#ffe96b', '#fff3b0', '#c9a43a'], k: 'estrella' },
    silla: { tiro: 'blip', estela: 'combo', col: '#3aff9a', bola: ['#e0fff0', '#ff3a5a'], trozos: ['#e8e8f0', '#ff3a5a', '#3aff9a'], k: 'tecla', palabra: 'GG' },
    drakkar: { tiro: 'roll', estela: 'glitch', col: '#d84a3a', bola: ['#ffe0d0', '#d84a3a'], trozos: ['#d84a3a', '#e8e0c8', '#8a5a3c'], k: 'bloque' },
    grua: { tiro: 'horn', estela: 'flash', col: '#fff3b0', bola: ['#ffffff', '#ffcb3d'], trozos: ['#ffcb3d', '#ffffff', '#ff4b5c'], k: 'confeti', palabra: '¡Corten!' },
  };
  const BASE = { estela: 'puntos', col: '#ffffff', bola: ['#fff3b0', '#ff9a2a'], trozos: ['#ffcb3d', '#ff7a1a'], k: 'pixel' };
  const de = id => E[id] || BASE;
  const ruido = i => { const s = Math.sin(i * 127.1) * 43758.5; return s - Math.floor(s); };   // fijo por punto: la estela no tiembla de un fotograma a otro

  function estela(c, p, cx, cy, t) {
    const e = de(p.movil), l = p.traza, n = l.length; if (!n) return;
    const pt = i => [l[i][0] - cx, l[i][1] - cy];
    c.save();
    if (e.estela === 'luz') {   // línea recta de luz que parpadea
      c.globalAlpha = 0.55 + 0.35 * Math.sin(t * 30); c.strokeStyle = e.col; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath();
      for (let i = Math.max(0, n - 40); i < n; i++) { const [x, y] = pt(i); i === Math.max(0, n - 40) ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke();
    } else for (let i = 0; i < n; i++) {
      const [x, y] = pt(i), k = i / n, viejo = 1 - k;   // k: 0 el más antiguo, 1 el último
      if (x < -20 || x > PINTAR.V.w + 20) continue;
      c.globalAlpha = 0.25 + 0.6 * k;
      if (e.estela === 'espiral') { const o = Math.sin(i * 1.3) * 6; c.fillStyle = i % 2 ? e.col : '#ffe0b0'; c.fillRect(x - 2 + o, y - 2 - o, 4, 4); }
      else if (e.estela === 'humo') { c.fillStyle = e.col; c.globalAlpha = 0.12 + 0.3 * k; c.beginPath(); c.arc(x, y - viejo * 10, 3 + viejo * 8, 0, T); c.fill(); }
      else if (e.estela === 'pelos') { c.strokeStyle = e.col; c.lineWidth = 2; const b = ruido(i) * T; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(b) * 6, y + Math.sin(b) * 6); c.stroke(); }
      else if (e.estela === 'corazones') { if (i % 3) continue; c.fillStyle = i % 2 ? e.col : '#b86bff'; c.beginPath(); c.moveTo(x, y + 3); c.bezierCurveTo(x - 5, y - 1, x - 3, y - 5, x, y - 2); c.bezierCurveTo(x + 3, y - 5, x + 5, y - 1, x, y + 3); c.fill(); }
      else if (e.estela === 'chispa') { c.strokeStyle = e.col; c.lineWidth = 2; const o = ruido(i) * 10 - 5; c.beginPath(); c.moveTo(x - 3, y + o); c.lineTo(x + 3, y - o); c.stroke(); }
      else if (e.estela === 'combo') { if (i % 8 || !k) continue; c.fillStyle = e.col; c.font = '900 11px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('x' + (2 + (i / 8 | 0) % 3), x, y); }
      else if (e.estela === 'glitch') { c.fillStyle = ruido(i) < 0.5 ? e.col : '#7cf0ff'; const o = (ruido(i + 9) - 0.5) * 12; c.fillRect(x + o - 3, y - 2, 6, 4); }
      else if (e.estela === 'flash') { if (i % 4) continue; c.fillStyle = e.col; const r = 2 + ruido(i) * 4; c.beginPath(); for (let j = 0; j < 8; j++) { const b = j / 8 * T, rr = j % 2 ? r * 0.35 : r; c.lineTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr); } c.fill(); }
      else { c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(x, y, 2.5, 0, T); c.fill(); }
    }
    c.restore();
  }
  // un trozo de explosión (la forma la dice la facción)
  function trozo(c, k, x, y, s, col, giro) {
    c.fillStyle = col;
    if (k === 'tornillo') { c.save(); c.translate(x, y); c.rotate(giro); c.fillRect(-s, -s * 0.3, s * 2, s * 0.6); c.fillRect(-s * 0.4, -s * 0.7, s * 0.8, s * 1.4); c.restore(); }
    else if (k === 'hueso') { c.save(); c.translate(x, y); c.rotate(giro); c.fillRect(-s, -s * 0.25, s * 2, s * 0.5); c.beginPath(); c.arc(-s, 0, s * 0.45, 0, T); c.arc(s, 0, s * 0.45, 0, T); c.fill(); c.restore(); }
    else if (k === 'pelo') { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(giro) * s * 2, y + Math.sin(giro) * s * 2); c.stroke(); }
    else if (k === 'confeti') { c.save(); c.translate(x, y); c.rotate(giro); c.fillRect(-s, -s * 0.4, s * 2, s * 0.8); c.restore(); }
    else if (k === 'estrella') { c.beginPath(); for (let j = 0; j < 8; j++) { const b = j / 8 * T + giro, r = j % 2 ? s * 0.4 : s * 1.2; c.lineTo(x + Math.cos(b) * r, y + Math.sin(b) * r); } c.fill(); }
    else if (k === 'tecla') { c.save(); c.translate(x, y); c.rotate(giro); c.fillRect(-s, -s, s * 2, s * 2); c.strokeStyle = OL; c.lineWidth = 1.5; c.strokeRect(-s, -s, s * 2, s * 2); c.restore(); }
    else if (k === 'bloque') c.fillRect(Math.round(x / 4) * 4 - s, Math.round(y / 4) * 4 - s, s * 2, s * 2);
    else c.fillRect(x - s / 2, y - s / 2, s, s);
  }
  return { de, estela, trozo };
})();
