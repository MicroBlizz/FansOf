// Fans of Boom · PROYECTILES: cómo se ve el tiro de cada móvil (la forma la dice cada tiro en ajustes.js). Solo dibujo.
'use strict';
const PROYECTIL_FORMAS = (() => {
  const borde = c => { c.lineWidth = 3; c.strokeStyle = OL; c.lineJoin = 'round'; };
  return {
    bola(c, x, y) { c.fillStyle = OL; c.beginPath(); c.arc(x, y, 7.5, 0, 6.2832); c.fill(); c.fillStyle = '#ffcb3d'; c.beginPath(); c.arc(x - 1, y - 1, 5, 0, 6.2832); c.fill(); },
    hueso(c, x, y, a, t) {   // un hueso que da vueltas
      c.save(); c.translate(x, y); c.rotate(t * 12); borde(c); c.fillStyle = '#f4ecd8';
      c.beginPath(); rrPath(c, -9, -3, 18, 6, 3); c.fill(); c.stroke();
      for (const s of [-1, 1]) for (const d of [-1, 1]) { c.beginPath(); c.arc(s * 9, d * 3.5, 3.6, 0, 6.2832); c.fill(); c.stroke(); }
      c.restore();
    },
    laser(c, x, y, a) {   // un rayo alargado en la dirección del vuelo, con brillo
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = 'rgba(124,240,255,.35)'; c.beginPath(); rrPath(c, -18, -7, 30, 14, 7); c.fill();
      borde(c); c.fillStyle = '#7cf0ff'; c.beginPath(); rrPath(c, -14, -3.5, 22, 7, 3.5); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.fillRect(-8, -1, 12, 2); c.restore();
    },
    pelo(c, x, y, a, t) {   // una bola de pelo amarilla, despeinada
      c.save(); c.translate(x, y); c.rotate(t * 5); borde(c); c.fillStyle = '#ffd24a';
      c.beginPath(); for (let i = 0; i < 14; i++) { const r = i % 2 ? 6 : 9, b = i / 14 * 6.2832; c.lineTo(Math.cos(b) * r, Math.sin(b) * r); } c.closePath(); c.fill(); c.stroke(); c.restore();
    },
    disco(c, x, y, a, t) {   // un disco de chatarra que gira plano (de ahí que el viento lo lleve)
      c.save(); c.translate(x, y); c.scale(1, 0.45 + 0.25 * Math.abs(Math.sin(t * 9))); borde(c);
      c.fillStyle = '#9aa0a8'; c.beginPath(); c.arc(0, 0, 11, 0, 6.2832); c.fill(); c.stroke();
      c.fillStyle = '#5b5f66'; c.beginPath(); c.arc(0, 0, 4, 0, 6.2832); c.fill(); c.restore();
    },
    racimo(c, x, y, a, t) {   // una granadita redonda con espoleta, para los tiros que se abren en racimo
      c.save(); c.translate(x, y); c.rotate(t * 7); borde(c); c.fillStyle = '#7a4a9a'; c.beginPath(); c.arc(0, 0, 7, 0, 6.2832); c.fill(); c.stroke();
      c.fillStyle = '#ffcb3d'; c.fillRect(-1.5, -11, 3, 5); c.fillStyle = '#fff'; c.beginPath(); c.arc(-2.5, -2.5, 2, 0, 6.2832); c.fill(); c.restore();
    },
    dardo(c, x, y, a, t) {   // un dardo láser verde, fino y con la punta marcada
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = 'rgba(88,224,160,.35)'; c.beginPath(); rrPath(c, -20, -5, 34, 10, 5); c.fill();
      borde(c); c.fillStyle = '#58e0a0'; c.beginPath(); c.moveTo(-14, -3); c.lineTo(6, -3); c.lineTo(14, 0); c.lineTo(6, 3); c.lineTo(-14, 3); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.fillRect(-8, -1, 10, 2); c.restore();
    },
    satelite(c, x, y, a, t) {   // el rayo del satélite: una columna de luz que baja del cielo sobre el blanco
      const k = clamp(t / BOOM.satelite.demora, 0, 1), top = y - 900 + k * 900, w = 6 + k * 14;
      c.fillStyle = `rgba(88,224,160,${0.15 + 0.35 * k})`; c.fillRect(x - w, y - 1100, w * 2, 1100);
      c.fillStyle = `rgba(232,255,244,${0.4 + 0.6 * k})`; c.fillRect(x - w / 3, top - 120, w / 1.5, 120 + (y - top));
      c.strokeStyle = '#58e0a0'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 30 - 18 * k, 0, 6.2832); c.stroke();
    },
    misil(c, x, y, a, t) {   // un misil con aletas y llama
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = Math.sin(t * 40) > 0 ? '#ffcb3d' : '#ff7a1a'; c.beginPath(); c.moveTo(-10, -3); c.lineTo(-19 - Math.random() * 4, 0); c.lineTo(-10, 3); c.fill();
      borde(c); c.fillStyle = '#c87a3a'; c.beginPath(); c.moveTo(-10, -4); c.lineTo(6, -4); c.lineTo(12, 0); c.lineTo(6, 4); c.lineTo(-10, 4); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#5b3d8a'; c.beginPath(); c.moveTo(-10, -4); c.lineTo(-14, -9); c.lineTo(-6, -4); c.closePath(); c.moveTo(-10, 4); c.lineTo(-14, 9); c.lineTo(-6, 4); c.closePath(); c.fill(); c.stroke();
      c.restore();
    },
    // la estela de cada forma (p.traza = últimos puntos del vuelo): cada móvil deja la suya
    estela(c, p, cx, cy) {
      const f = p.def.forma, n = p.traza.length;
      p.traza.forEach(([x, y], i) => {
        const k = (i + 1) / n, X = x - cx, Y = y - cy;
        if (f === 'laser' || f === 'dardo') { c.fillStyle = `rgba(${f === 'dardo' ? '88,224,160' : '124,240,255'},${0.15 + 0.4 * k})`; c.fillRect(X - 3, Y - 3, 6, 6); }
        else if (f === 'misil') { c.fillStyle = k > 0.6 ? 'rgba(255,200,60,.8)' : `rgba(190,190,200,${0.15 + 0.35 * k})`; c.beginPath(); c.arc(X, Y + (1 - k) * 4, 2 + (1 - k) * 4, 0, 6.2832); c.fill(); }
        else if (f === 'pelo') { c.fillStyle = `rgba(255,210,74,${0.2 + 0.5 * k})`; c.beginPath(); c.arc(X + Math.sin(i * 2.3) * 4, Y + Math.cos(i * 1.7) * 4, 2.2, 0, 6.2832); c.fill(); }
        else if (f === 'hueso') { c.fillStyle = `rgba(244,236,216,${0.2 + 0.5 * k})`; c.fillRect(X - 1.5 + Math.sin(i * 3) * 4, Y - 1.5, 3, 3); }
        else if (f === 'disco') { c.strokeStyle = `rgba(200,205,215,${0.15 + 0.5 * k})`; c.lineWidth = 2; c.beginPath(); c.ellipse(X, Y, 7 * k, 3 * k, 0, 0, 6.2832); c.stroke(); }
        else if (f === 'racimo') { c.fillStyle = `rgba(184,107,255,${0.2 + 0.5 * k})`; c.beginPath(); c.arc(X, Y, 2 + 2 * k, 0, 6.2832); c.fill(); }
        else { c.fillStyle = `rgba(255,255,255,${0.2 + 0.4 * k})`; c.beginPath(); c.arc(X, Y, 2.5, 0, 6.2832); c.fill(); }
      });
    },
    // cómo explota cada forma: colores del fogonazo y de las chispas (efectos.js)
    explosion: {
      bola: ['#fff3b0', '#ff9a2a', ['#ffcb3d', '#ff7a1a']], hueso: ['#f8f2e0', '#d8cfae', ['#f4ecd8', '#cdbf94']], laser: ['#e6fdff', '#7cf0ff', ['#7cf0ff', '#ffffff']],
      pelo: ['#fff3b0', '#ffd24a', ['#ffd24a', '#ffb347']], disco: ['#f0f2f6', '#9aa0a8', ['#c0c4cc', '#ffcb3d']], misil: ['#fff3b0', '#ff5a1a', ['#ff5a1a', '#ffcb3d']],
      racimo: ['#f4e0ff', '#b86bff', ['#b86bff', '#ffcb3d']], dardo: ['#e8fff4', '#58e0a0', ['#58e0a0', '#ffffff']], satelite: ['#ffffff', '#58e0a0', ['#58e0a0', '#e8fff4']],
    },
  };
})();
