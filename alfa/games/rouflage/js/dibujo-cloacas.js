// Fans of Rouflage · EL DIBUJO DE LAS CLOACAS: pasarelas de hormigón (fácil), el agua verde de los canales (muy difícil), las cámaras de
// ladrillo (media), la sala de bombas, las tuberías gordas, las ratas de Ratkov de guiño y el EVENTO «niebla»: cada poco sube una niebla
// que lo tapa todo un momento y acorta las linternas a la mitad: el momento de moverse.
'use strict';

Object.assign(SUELOS, {
  // pasarela: losas de hormigón de 60 con alguna rejilla de desagüe (FÁCIL)
  pasarela(c, z, R) {
    c.fillStyle = '#6a6d78'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 60);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 601); if (h < 0.15) { c.fillStyle = '#646772'; c.fillRect(i * 60, j * 60, 60, 60); } else if (h > 0.92) { c.fillStyle = '#71747f'; c.fillRect(i * 60, j * 60, 60, 60); }
      if (h > 0.5 && h < 0.56) { forma(c, caja(i * 60 + 16, j * 60 + 20, 28, 20, 2), '#2a2d36', 2); c.strokeStyle = '#8e929d'; c.lineWidth = 2; c.beginPath(); for (let k = 0; k < 3; k++) { c.moveTo(i * 60 + 20, j * 60 + 25 + k * 5); c.lineTo(i * 60 + 40, j * 60 + 25 + k * 5); } c.stroke(); }
    }
    c.strokeStyle = 'rgba(32,16,44,0.3)'; c.lineWidth = 2; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 60, j0 * 60); c.lineTo(i * 60, j1 * 60); } for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 60, j * 60); c.lineTo(i1 * 60, j * 60); }
    c.stroke();
  },
  // el agua del canal: verde oscuro con ondas, espuma y cosas flotando (MUY DIFÍCIL)
  aguaVerde(c, z, R) {
    c.fillStyle = '#2f5f4a'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 20);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 611), x = i * 20 + 10, y = j * 20 + 10;
      if (h < 0.2) { c.fillStyle = '#2a553f'; c.fillRect(i * 20, j * 20, 20, 20); }
      if (h > 0.45) { c.strokeStyle = h > 0.85 ? 'rgba(200,240,200,0.5)' : 'rgba(120,190,150,0.45)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 8, y + 2); c.quadraticCurveTo(x - 3, y - 4, x, y + 1); c.quadraticCurveTo(x + 4, y + 5, x + 8, y - 1); c.stroke(); }
      if (h > 0.4 && h < 0.43) punto(c, x, y, 3, '#5c8a3a');       // una hoja o algo peor
      if (h > 0.3 && h < 0.32) forma(c, caja(x - 5, y - 3, 10, 6, 1), '#f1e6cc', 1.5);   // un papel flotando
    }
    c.fillStyle = 'rgba(32,16,44,0.3)'; c.fillRect(z.px, z.py, z.pw, 5); c.fillRect(z.px, z.py, 5, z.ph); c.fillRect(z.px + z.pw - 5, z.py, 5, z.ph); c.fillRect(z.px, z.py + z.ph - 5, z.pw, 5);
  },
  // las cámaras: suelo de ladrillo rojizo con juntas de cemento y musgo (MEDIO)
  ladrilloSuelo(c, z, R) {
    c.fillStyle = '#9a8f82'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 20);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 621), ox = (j & 1) ? 10 : 0; c.fillStyle = h < 0.2 ? '#7d4e3c' : h > 0.9 ? '#a0665a' : '#8e5a47';
      c.fillRect(i * 20 + ox + 1, j * 20 + 1, 18, 8); c.fillRect(i * 20 + ox - 9, j * 20 + 11, 18, 8);
      if (h > 0.5 && h < 0.56) mancha(c, i * 20 + 10, j * 20 + 10, 8, 'rgba(70,110,50,0.5)', i + j);
    }
  },
  // la sala de bombas: rejilla metálica (donde esperan los becarios)
  rejilla(c, z, R) {
    c.fillStyle = '#3f434d'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 20);
    c.strokeStyle = '#5c606b'; c.lineWidth = 3; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 20, j0 * 20); c.lineTo(i * 20, j1 * 20); } for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 20, j * 20); c.lineTo(i1 * 20, j * 20); }
    c.stroke();
    c.strokeStyle = '#6d7380'; c.lineWidth = 1.5; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 20 + 10, j0 * 20); c.lineTo(i * 20 + 10, j1 * 20); } for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 20, j * 20 + 10); c.lineTo(i1 * 20, j * 20 + 10); }
    c.stroke();
  },
});

Object.assign(PAPELES, {
  // ladrillo viejo con humedad y musgo, y un número de colector pintado
  ladrillo(c, t) {
    c.fillStyle = '#5a3a30'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    for (let y = Math.floor(t.y0 / 12) * 12; y < t.y1; y += 12) for (let x = Math.floor(t.x0 / 30) * 30 - 30; x < t.x1; x += 30) {
      const ox = ((y / 12) & 1) ? 15 : 0, h = hash2(x, y, 631); c.fillStyle = h < 0.15 ? '#6e463a' : h > 0.9 ? '#4d3028' : '#633f33'; c.fillRect(x + ox + 1, y + 1, 28, 10);
    }
    const g = c.createLinearGradient(0, t.y1 - 30, 0, t.y1); g.addColorStop(0, 'rgba(60,90,50,0)'); g.addColorStop(1, 'rgba(60,90,50,0.55)'); c.fillStyle = g; c.fillRect(t.x0, t.y1 - 30, t.x1 - t.x0, 30);
    for (let x = Math.floor(t.x0 / 300) * 300 + 150; x < t.x1; x += 300) if (x > t.x0 + 40) rotulo(c, 'C-' + ((x / 300) | 0), x, t.y0 + 26, 15, 'rgba(255,246,234,0.5)');
    c.fillStyle = '#3a2520'; c.fillRect(t.x0, t.y1 - 6, t.x1 - t.x0, 6);
  },
});

Object.assign(TIPOS_MUEBLE, {
  // un tubo gordo pegado a la pared, con brida y una fuga
  tubo: { w: 90, d: 20, h: 30, pared: true, pinta(c) {
    forma(c, caja(-45, -34, 90, 24, 12), '#6c7280', 3); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(-40, -30, 80, 5);
    for (const dx of [-24, 24]) forma(c, caja(dx - 5, -37, 10, 30, 3), '#4a4f5c', 2.5);
    raya(c, [8, -10, 10, -2], '#9fd6e8', 3); punto(c, 10, -1, 2.5, '#9fd6e8');
  } },
  // la bomba de la sala de bombas: un motor con manómetro
  bomba: { w: 50, d: 26, h: 40, pared: true, pinta(c) {
    cajon(c, 50, 26, 30, '#5c606b', '#4a4f5c', 4); forma(c, ovalo(0, -45, 16, 16), '#8e929d', 3); forma(c, ovalo(0, -45, 10, 10), '#f1e6cc', 2);
    raya(c, [0, -45, 5, -51], '#ff4b5c', 2); forma(c, caja(-22, -22, 12, 10, 2), '#ff4b5c', 2); punto(c, 14, -18, 3, '#7ee04a');
  } },
});

Object.assign(PEGATINAS_EXTRA, {
  // una rata de Ratkov (de guiño): pequeña, gris, con su cola
  rata(c, x, y, s) {
    c.save(); c.translate(x, y); c.rotate(hash2(s, 2, 641) * TAU);
    forma(c, ovalo(0, 0, 9, 5), '#8e929d', 2); forma(c, ovalo(9, -1, 4.5, 3.5), '#8e929d', 2); punto(c, 11, -2, 1, OL); punto(c, 8, -5, 2, '#c8a0a8');
    raya(c, [-9, 0, -18, 3, -24, -2], OL, 1.8); c.restore();
  },
  grieta(c, x, y, s) { raya(c, [x - 20, y, x - 8, y + 4, x + 2, y - 3, x + 16, y + 2, x + 24, y - 4], 'rgba(20,16,30,0.5)', 1.8 + hash2(s, 1, 642)); },
});

/* ---------- el evento: la niebla ---------- */
EVENTOS.niebla = {
  primero: 12, cada: 20, dura: 6,
  nuevo(cfg, azar) { return { nubes: [...Array(14).keys()].map(k => ({ x: azar(), y: azar(), r: 160 + azar() * 160, v: 0.3 + azar() * 0.7 })) }; },
  empieza() { play('luces'); if (J.yo) avisa(tr('Sube la niebla'), 'aviso'); },
  avanza() {},
  // lo lejos que llegan las linternas mientras dura: baja a la mitad y vuelve al final
  visibilidad(est, t) { const k = t < 1 ? t : t > this.dura - 1 ? this.dura - t : 1; return 1 - 0.55 * k; },
  pintaVelo(c, est, t, reloj) {
    if (t < 0) return;
    const k = t < 1 ? t : t > this.dura - 1 ? this.dura - t : 1;
    c.save(); c.globalAlpha = 0.5 * k;
    const g = c.createLinearGradient(0, 0, ANCHO, 0); g.addColorStop(0, '#9aa5a0'); g.addColorStop(1, '#8a9a92'); c.fillStyle = g; c.fillRect(-100, -100, ANCHO + 200, ALTO + 200);
    c.globalAlpha = 0.5 * k;
    for (const n of est.nubes) {      // nubes blandas: un degradado que se deshace por los bordes
      const x = ((n.x * ANCHO + reloj * 30 * n.v) % (ANCHO + 400)) - 200, y = n.y * ALTO + Math.sin(reloj * 0.7 + n.r) * 30;
      c.save(); c.translate(x, y); c.scale(1, 0.55);
      const g = c.createRadialGradient(0, 0, n.r * 0.2, 0, 0, n.r); g.addColorStop(0, 'rgba(210,222,214,0.8)'); g.addColorStop(1, 'rgba(210,222,214,0)');
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, n.r, 0, TAU); c.fill(); c.restore();
    }
    c.restore();
  },
};
