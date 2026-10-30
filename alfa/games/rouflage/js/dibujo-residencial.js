// Fans of Rouflage · EL DIBUJO DE LA ZONA RESIDENCIAL: la calle de los adosados de los jefes de Microblizz, de noche. Aceras y asfalto
// (fáciles), pasos de cebra (medio), jardincitos con valla, la terraza del bar con sus baldosas (difícil), fachadas de colores con puertas de
// garaje lisas (lo más fácil del mapa: una pared de un solo color), buzones, cubos de basura y el EVENTO «vecino»: cada poco se enciende
// una ventana y el vecino se asoma: a quien pilla la luz de la ventana se le ve.
'use strict';

const CASAS = ['#e8c9a0', '#cfe0f0', '#f3d6e2', '#d9e6c4', '#f1e6cc', '#e7d4f2'];
const GARAJES = ['#3a7de0', '#59e07a', '#ff7a1a', '#8b3dff', '#39d5e8', '#ff4b5c'];
const colorCasa = x => CASAS[Math.floor(hash2(Math.floor(x / 120), 7, 801) * CASAS.length)];

Object.assign(SUELOS, {
  // la acera: losas grises de 40 con bordillo (FÁCIL)
  acera(c, z, R) {
    const [i0, i1, j0, j1] = rango(z, R, 40);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 811); c.fillStyle = h < 0.12 ? '#8e929d' : h > 0.94 ? '#a0a4ae' : '#979ba6'; c.fillRect(i * 40, j * 40, 40, 40);
      if (h > 0.5 && h < 0.54) raya(c, [i * 40 + 8, j * 40 + 30, i * 40 + 18, j * 40 + 14, i * 40 + 30, j * 40 + 8], 'rgba(32,16,44,0.3)', 1.5);
    }
    c.strokeStyle = 'rgba(32,16,44,0.25)'; c.lineWidth = 2; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 40, j0 * 40); c.lineTo(i * 40, j1 * 40); } for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 40, j * 40); c.lineTo(i1 * 40, j * 40); }
    c.stroke();
    c.fillStyle = '#b4b8c2'; c.fillRect(z.px, z.py + z.ph - 6, z.pw, 6); c.fillRect(z.px, z.py, z.pw, 6);
  },
  // la calle: asfalto con la raya discontinua del medio (FÁCIL)
  calle(c, z, R) {
    SUELOS.asfalto(c, z, R);
    if (z.ph >= 100) { c.fillStyle = '#f1e6cc'; for (let x = z.px + 10; x < z.px + z.pw; x += 60) c.fillRect(x, z.py + z.ph / 2 - 2, 30, 4); }
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(z.px, z.py, z.pw, 4); c.fillRect(z.px, z.py + z.ph - 4, z.pw, 4);
  },
  // el paso de cebra: rayas blancas gastadas (MEDIO)
  cebra(c, z, R) {
    SUELOS.asfalto(c, z, R);
    for (let y = z.py + 8; y < z.py + z.ph - 6; y += 24) { c.fillStyle = 'rgba(241,230,204,0.85)'; c.fillRect(z.px + 4, y, z.pw - 8, 14); c.fillStyle = 'rgba(71,74,85,0.5)'; for (let x = z.px + 10; x < z.px + z.pw - 10; x += 26) if (hash2(x, y, 821) > 0.6) c.fillRect(x, y + 3, 9, 8); }
  },
  // la terraza del bar: baldosas hidráulicas de colores (DIFÍCIL)
  terraza(c, z, R) {
    const [i0, i1, j0, j1] = rango(z, R, 40);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const x = i * 40, y = j * 40, h = hash2(i, j, 831);
      c.fillStyle = '#f1e6cc'; c.fillRect(x, y, 40, 40);
      c.fillStyle = (i + j) & 1 ? '#2c5f8a' : '#c8403a'; c.beginPath(); c.moveTo(x + 20, y + 2); c.lineTo(x + 38, y + 20); c.lineTo(x + 20, y + 38); c.lineTo(x + 2, y + 20); c.closePath(); c.fill();
      c.fillStyle = '#f2c230'; c.beginPath(); c.arc(x + 20, y + 20, 7, 0, TAU); c.fill(); punto(c, x + 20, y + 20, 3, (i + j) & 1 ? '#c8403a' : '#2c5f8a');
      for (const [dx, dy] of [[0, 0], [40, 0], [0, 40], [40, 40]]) punto(c, x + dx, y + dy, 5, h > 0.5 ? '#2c5f8a' : '#c8403a');
    }
    c.strokeStyle = 'rgba(32,16,44,0.3)'; c.lineWidth = 1.5; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 40, j0 * 40); c.lineTo(i * 40, j1 * 40); } for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 40, j * 40); c.lineTo(i1 * 40, j * 40); }
    c.stroke();
  },
});

Object.assign(PAPELES, {
  // la fachada de una casa: estuco de color (cada casa el suyo), zócalo de piedra y canalón; las puertas y ventanas son carteles
  fachada(c, t) {
    for (let x = Math.floor(t.x0 / 120) * 120; x < t.x1; x += 120) {
      const col = colorCasa(x); c.fillStyle = col; c.fillRect(Math.max(x, t.x0), t.y0, Math.min(x + 120, t.x1) - Math.max(x, t.x0), t.y1 - t.y0);
      c.fillStyle = tono(col, -0.06); for (let y = t.y0 + 8; y < t.y1 - 14; y += 16) for (let k = 0; k < 3; k++) { const px = x + 10 + hash2(k, y, 841) * 100; if (px > t.x0 && px < t.x1 - 10) c.fillRect(px, y, 10, 3); }
    }
    raya(c, [t.x0, t.y0 + 5, t.x1, t.y0 + 5], OL, 6); raya(c, [t.x0, t.y0 + 5, t.x1, t.y0 + 5], '#7a7f8c', 3.5);      // el canalón
    c.fillStyle = '#8a7d6a'; c.fillRect(t.x0, t.y1 - 12, t.x1 - t.x0, 12); c.strokeStyle = 'rgba(32,16,44,0.35)'; c.lineWidth = 1.5; c.beginPath();
    for (let x = Math.floor(t.x0 / 24) * 24; x < t.x1; x += 24) { c.moveTo(x, t.y1 - 12); c.lineTo(x, t.y1); } c.stroke();
  },
  // el garaje de los becarios: bloque gris
  bloque(c, t) {
    c.fillStyle = '#767a85'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    for (let y = Math.floor(t.y0 / 14) * 14; y < t.y1; y += 14) for (let x = Math.floor(t.x0 / 36) * 36 - 36; x < t.x1; x += 36) { c.fillStyle = hash2(x, y, 851) > 0.8 ? '#6d7380' : '#80848f'; c.fillRect(x + ((y / 14) & 1) * 18 + 1, y + 1, 34, 12); }
    c.fillStyle = '#5c606b'; c.fillRect(t.x0, t.y1 - 6, t.x1 - t.x0, 6);
  },
});

Object.assign(CARTELES_EXTRA, {
  // una ventana de casa: marco, cortinas y (si está encendida, `luz`) el vecino asomado
  ventanaCasa(c, k) {
    const { x, y } = k, luz = k.luz || 0;
    forma(c, caja(x - 20, y - 16, 40, 32, 2), luz > 0 ? '#ffe9a8' : '#3a4a70', 3);
    if (luz > 0) { c.fillStyle = '#20102c'; forma(c, ovalo(x, y + 6, 9, 9), '#20102c', 0); forma(c, ovalo(x, y - 2, 6, 6), '#20102c', 0); forma(c, ovalo(x, y + 14, 14, 8), '#20102c', 0); }
    else { c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x - 17, y - 13, 10, 14); }
    c.fillStyle = k.cortina || '#ff7ad8'; c.fillRect(x - 20, y - 16, 7, 32); c.fillRect(x + 13, y - 16, 7, 32);
    raya(c, [x, y - 16, x, y + 16], OL, 2); raya(c, [x - 20, y, x + 20, y], OL, 2);
    forma(c, caja(x - 24, y + 14, 48, 5, 1), '#8a7d6a', 2);
  },
  // la puerta de la casa, con su número
  puertaCasa(c, k) {
    const { x, y } = k; forma(c, caja(x - 14, y - 18, 28, 42, 3), k.color || '#8f6a3a', 3);
    forma(c, caja(x - 9, y - 13, 18, 14, 1), tono(k.color || '#8f6a3a', 0.15), 1.5); punto(c, x + 8, y + 6, 2.2, '#f2c230');
    forma(c, caja(x - 8, y - 29, 16, 9, 1), '#f1e6cc', 1.5); rotulo(c, String(k.n || 7), x, y - 24, 8, OL);
  },
  // la puerta del garaje: una pared lisa de un color, con sus lamas: lo más fácil de copiar del mapa
  garaje(c, k) {
    const { x, y } = k, col = GARAJES[(k.v || 0) % GARAJES.length];
    forma(c, caja(x - 44, y - 24, 88, 52, 3), col, 3);
    c.strokeStyle = 'rgba(32,16,44,0.25)'; c.lineWidth = 1.5; c.beginPath(); for (let yy = y - 14; yy < y + 26; yy += 10) { c.moveTo(x - 42, yy); c.lineTo(x + 42, yy); } c.stroke();
    forma(c, caja(x - 6, y + 14, 12, 5, 1), tono(col, -0.3), 1.5);
  },
});

Object.assign(TIPOS_MUEBLE, {
  buzon: { w: 14, d: 10, h: 34, senuelo: true, pinta(c) {
    raya(c, [0, -2, 0, -18], OL, 6); raya(c, [0, -2, 0, -18], '#6d7380', 3);
    forma(c, caja(-10, -36, 20, 18, 5), '#f2c230', 2.5); forma(c, caja(-7, -31, 10, 4, 1), '#20102c', 0); raya(c, [-10, -24, 10, -24], OL, 1.5);
  } },
  cubo: { w: 22, d: 16, h: 26, senuelo: true, pinta(c, m) {
    const col = (m.v || 0) ? '#59e07a' : '#5c606b';
    forma(c, caja(-10, -26, 20, 26, 3), col, 2.5); forma(c, caja(-12, -30, 24, 6, 2), tono(col, 0.12), 2.5);
    c.strokeStyle = 'rgba(32,16,44,0.3)'; c.lineWidth = 1.5; c.beginPath(); for (const dx of [-5, 0, 5]) { c.moveTo(dx, -22); c.lineTo(dx, -4); } c.stroke();
    forma(c, caja(-4, -33, 8, 4, 1), tono(col, -0.25), 1.5);
  } },
  // la mesa de la terraza, con dos sillas
  mesaBar: { w: 50, d: 30, h: 26, pinta(c) {
    forma(c, caja(-25, -16, 10, 14, 2), '#8f6a3a', 2); forma(c, caja(15, -16, 10, 14, 2), '#8f6a3a', 2);
    forma(c, caja(-3, -30, 6, 28, 1), '#5c606b', 2); forma(c, ovalo(0, -30, 18, 8), '#f1e6cc', 2.5); forma(c, ovalo(0, -33, 18, 8), '#ff4b5c', 2.5);
    forma(c, ovalo(6, -36, 3.5, 2.6), '#f2c230', 1.5); forma(c, caja(-9, -42, 6, 8, 1), '#9fd6e8', 1.5);
  } },
});

/* ---------- el evento: el vecino se asoma ---------- */
EVENTOS.vecino = {
  primero: 10, cada: 16, dura: 5,
  nuevo() { return { ventanas: CARTELES.filter(k => k.t === 'ventanaCasa'), en: null, ultimo: null }; },
  empieza(est, azar) {
    const lista = est.ventanas.filter(v => v !== est.ultimo); est.en = lista[Math.floor(azar() * lista.length)] || est.ventanas[0]; est.ultimo = est.en;
    play('luces'); if (J.yo && J.yo.clase === 'camaleon') avisa(tr('Un vecino se asoma a la ventana'), 'aviso');
  },
  avanza() {},
  termina(est) { est.en = null; },
  focos(est, t) { const v = est.en; return v && t > 0.4 ? [{ x: v.x, y: v.y - 6, dir: Math.PI / 2, ang: 0.62, largo: 280 }] : []; },
  pintaEncima(c, est, t) {
    if (t < 0 || !est.en) return;
    const v = est.en, k = Math.min(1, t / 0.4);
    CARTELES_EXTRA.ventanaCasa(c, { ...v, luz: k });      // la ventana, encendida, con el vecino
    if (t > 0.4) for (const f of this.focos(est, t)) { const pts = abanicoFoco(f, []); c.fillStyle = 'rgba(255,240,180,0.2)'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); }
  },
};
