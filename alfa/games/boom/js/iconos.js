// Fans of Boom · ICONOS de los tiros: una escena chiquita que cuenta qué hace cada tiro (la curva, el suelo y lo que pasa al final:
// se abre en trozos, rebota, sigue bajo tierra, cae un rayo…), con el proyectil de verdad. El SS lleva «SS» de marca de agua.
// Se usa en el Garaje y en los botones de la partida. Solo dibujo; cada icono se pinta una vez y se guarda.
'use strict';
const ICONOS = (() => {
  const T = 6.2832, S = 64, hechos = {};
  const suelo = (c, y) => { c.fillStyle = '#8a5a3c'; c.fillRect(0, y, S, S - y); c.fillStyle = '#6fd04a'; c.fillRect(0, y, S, 4); c.strokeStyle = OL; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, y); c.lineTo(S, y); c.stroke(); };
  const curva = (c, pts, raya) => { c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.setLineDash(raya ? [3, 4] : [5, 4]); c.beginPath(); c.moveTo(pts[0], pts[1]); c.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); c.stroke(); c.setLineDash([]); };
  function boom(c, x, y, r) {   // la estrella de la explosión
    c.fillStyle = '#ffcb3d'; c.strokeStyle = OL; c.lineWidth = 2.5; c.beginPath();
    for (let i = 0; i < 16; i++) { const a = i / 16 * T, k = i % 2 ? r * 0.5 : r; c.lineTo(x + Math.cos(a) * k, y + Math.sin(a) * k); }
    c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#ff7a1a'; c.beginPath(); c.arc(x, y, r * 0.32, 0, T); c.fill();
  }
  function bala(c, forma, x, y, a, k) {   // el proyectil del tiro, encogido
    const f = PROYECTIL_FORMAS[forma] || PROYECTIL_FORMAS.bola; c.save(); c.translate(x, y); c.scale(k || 0.8, k || 0.8); f(c, 0, 0, a, 0.3, { x: 0, y: 0, dir: 1 }); c.restore();
  }
  const flecha = (c, x0, y0, x1, y1, col) => {
    const a = Math.atan2(y1 - y0, x1 - x0); c.strokeStyle = col || '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.fillStyle = col || '#fff'; c.beginPath(); c.moveTo(x1 + Math.cos(a) * 4, y1 + Math.sin(a) * 4); c.lineTo(x1 + Math.cos(a + 2.4) * 7, y1 + Math.sin(a + 2.4) * 7); c.lineTo(x1 + Math.cos(a - 2.4) * 7, y1 + Math.sin(a - 2.4) * 7); c.fill();
  };
  const G = 48;   // la línea del suelo en el icono
  const ESCENAS = {
    nada(c, t) { curva(c, [6, 40, 26, -8, 44, 42]); boom(c, 46, G - 4, 9 + Math.min(5, t.radio / 12)); bala(c, t.forma, 34, 16, 0.6); },
    racimo(c, t, e) { curva(c, [4, 44, 20, 0, 30, 14]); bala(c, t.forma, 30, 14, 0, 0.6); for (let i = 0; i < Math.min(5, e.n); i++) { const x = 34 + i * 6; flecha(c, 32, 16, x, 34 + (i % 2) * 4, '#ffe9a8'); boom(c, x, G - 2, 4.5); } },
    rebota(c, t, e) { curva(c, [2, 36, 12, 4, 22, 46]); boom(c, 22, G - 3, 6); curva(c, [22, 46, 32, 22, 42, 46]); boom(c, 42, G - 3, 5); curva(c, [42, 46, 49, 32, 56, 46]); boom(c, 56, G - 3, 4); bala(c, t.forma, 32, 24, 0, 0.55); },
    fantasma(c, t) { curva(c, [2, 30, 12, 6, 22, 48]); c.strokeStyle = '#7cf0ff'; c.lineWidth = 3; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(22, 48); c.quadraticCurveTo(34, 66, 46, 48); c.stroke(); c.setLineDash([]); boom(c, 47, G - 4, 9); bala(c, t.forma, 32, 56, 0.4, 0.55); },
    taladro(c, t) { ESCENAS.fantasma(c, t); },
    combo(c, t, e) { flecha(c, 4, 30, 58, 30, '#fff'); for (let i = 0; i < Math.min(4, e.veces); i++) boom(c, 18 + i * 14, 30, 6); bala(c, t.forma, 8, 30, 0, 0.55); },
    parte(c, t, e) { curva(c, [4, 44, 18, 4, 30, 14]); c.strokeStyle = '#ffcb3d'; c.lineWidth = 2.5; c.beginPath(); c.arc(30, 14, 8, 0, T); c.stroke(); bala(c, t.forma, 30, 14, 0, 0.55); for (let i = 0; i < Math.min(5, e.n); i++) flecha(c, 30, 20, 20 + i * 6, 40, '#ffe9a8'); },
    glitch(c, t) { curva(c, [4, 44, 12, 8, 22, 16]); c.fillStyle = '#7cf0ff'; for (let i = 0; i < 5; i++) c.fillRect(24 + i * 4, 12 + (i * 7) % 9, 3, 3); curva(c, [42, 16, 52, 20, 56, 44]); boom(c, 56, G - 4, 7); bala(c, t.forma, 44, 16, 0, 0.55); },
    vuelve(c, t) { curva(c, [4, 40, 24, 0, 46, 44]); boom(c, 46, G - 4, 7); c.strokeStyle = '#ffcb3d'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(44, 44); c.quadraticCurveTo(32, 18, 22, 42); c.stroke(); flecha(c, 24, 36, 22, 42, '#ffcb3d'); boom(c, 22, G - 4, 6); bala(c, t.forma, 34, 20, 0, 0.55); },
    cielo(c, t, e) {
      curva(c, [2, 44, 10, 18, 18, 44]); bala(c, t.forma, 18, 42, 0, 0.5);
      const xs = e.x.length > 1 ? [24, 38, 52] : [38];
      for (const x of xs) {
        if (e.estilo === 'gato' || e.estilo === 'pie') { c.fillStyle = e.estilo === 'gato' ? '#f5c242' : '#6a8a5a'; c.strokeStyle = OL; c.lineWidth = 2.5; c.beginPath(); c.ellipse(x, 26, 11, 14, 0, 0, T); c.fill(); c.stroke(); c.fillStyle = OL; for (const d of [-6, 0, 6]) { c.beginPath(); c.arc(x + d, 38, 2.4, 0, T); c.fill(); } }
        else if (e.estilo === 'trueno') { c.fillStyle = '#ffe96b'; c.strokeStyle = OL; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 3, 0); c.lineTo(x - 6, 22); c.lineTo(x + 1, 22); c.lineTo(x - 4, 44); c.lineTo(x + 8, 18); c.lineTo(x + 1, 18); c.closePath(); c.fill(); c.stroke(); }
        else { c.fillStyle = 'rgba(124,240,255,.9)'; c.fillRect(x - 3, 0, 6, 44); c.strokeStyle = OL; c.lineWidth = 2; c.strokeRect(x - 3, -2, 6, 46); }
        boom(c, x, G - 3, 5);
      }
      if (e.porCarga) { c.fillStyle = '#c7c7d0'; c.strokeStyle = OL; c.lineWidth = 2; c.fillRect(46, 2, 10, 7); c.strokeRect(46, 2, 10, 7); c.fillStyle = '#7cb8ff'; c.fillRect(40, 4, 5, 3); c.fillRect(57, 4, 5, 3); }   // el satélite
    },
    tren(c, t) { flecha(c, 6, 36, 58, 36, '#ff7ad8'); bala(c, 'tren', 24, 40, 0, 0.55); boom(c, 56, G - 6, 6); },
    minas(c, t) { for (const x of [16, 38]) { bala(c, t.forma, x, G - 8, 0, 0.6); } flecha(c, 24, 26, 46, 26, '#ffe96b'); c.fillStyle = '#ff4b5c'; c.beginPath(); c.arc(16, G - 18, 2.5, 0, T); c.arc(38, G - 18, 2.5, 0, T); c.fill(); },
  };
  function pinta(t, ss) {
    const cv = document.createElement('canvas'); cv.width = cv.height = S * 2; const c = cv.getContext('2d'); c.scale(2, 2);
    c.fillStyle = ss ? '#5a1e6a' : '#2e1a4a'; c.beginPath(); rrPath(c, 1, 1, S - 2, S - 2, 12); c.fill();
    c.save(); c.beginPath(); rrPath(c, 1, 1, S - 2, S - 2, 12); c.clip();
    if (ss) { c.font = '400 44px "Luckiest Guy", "Arial Black", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(255,203,61,.22)'; c.fillText('SS', S / 2, S / 2 + 2); }   // la marca de agua del Tiro Especial
    suelo(c, G); c.lineJoin = 'round'; c.lineCap = 'round';
    if (t.multi) for (let i = -1; i <= 1; i += 2) curva(c, [6, 40, 26 + i * 6, -6 + i * 4, 44 + i * 8, 44], true);   // varios a la vez, en abanico
    const e = t.efecto || {}; (ESCENAS[e.tipo] || ESCENAS.nada)(c, t, e);
    if (t.carga && !e.tipo) { c.fillStyle = '#c7c7d0'; c.strokeStyle = OL; c.lineWidth = 2; c.fillRect(46, 4, 10, 7); c.strokeRect(46, 4, 10, 7); flecha(c, 40, 14, 47, 8, '#7cf0ff'); }   // carga el satélite
    if ((t.viento == null ? 1 : t.viento) >= 1.5) { c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2; for (const y of [8, 14]) { c.beginPath(); c.moveTo(4, y); c.quadraticCurveTo(12, y - 4, 18, y); c.stroke(); } }   // el viento le pega mucho
    c.restore();
    c.strokeStyle = ss ? '#ffcb3d' : OL; c.lineWidth = 3; c.beginPath(); rrPath(c, 1.5, 1.5, S - 3, S - 3, 12); c.stroke();
    return cv.toDataURL();
  }
  // el icono de un tiro (i = 0, 1 o 2 del móvil: el 2 es el SS)
  function tiro(def, i) { const k = def.id + ':' + i; return hechos[k] || (hechos[k] = pinta(def.tiros[i], i === 2)); }
  return { tiro };
})();
