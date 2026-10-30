// Fans of Rouflage · EL DIBUJO DE LAS BACKROOMS: los suelos (moqueta húmeda amarilla, la piscina, el cumpleaños, el sótano de cables,
// la oficina vacía), los papeles de pared, los muebles nuevos (pilares, fluorescentes caídos, globos, tarta…) y las manchas del suelo.
// Mismas reglas que suelos.js, paredes.js y muebles.js: azar repetible (hash2), alineado a la cuadrícula, contorno grueso de la serie.
// Hay zonas FÁCILES (pasillos de moqueta casi lisa) y DIFÍCILES (piscina, confeti, cables): elegir dónde esconderse ya es parte del juego.
'use strict';

const BK = { amarillo: '#c9a94a', oscuro: '#a3862c', claro: '#e2c86a', zocalo: '#7d5f1e', agua: '#4fc1d8', moradoF: '#5b3f91' };
const CONFETI = ['#ff4b5c', '#f2c230', '#59e07a', '#39d5e8', '#ff7ad8', '#fff6ea'];

// la moqueta amarilla de los pasillos: fibras, costuras cada 120, el reflejo de los fluorescentes del techo y alguna mancha de humedad
function moquetaAmarilla(c, z, R, base, s) {
  c.fillStyle = base; c.fillRect(z.px, z.py, z.pw, z.ph);
  const [i0, i1, j0, j1] = rango(z, R, 20);
  for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
    const h = hash2(i, j, s);
    if (h < 0.12) { c.fillStyle = tono(base, -0.03); c.fillRect(i * 20, j * 20, 20, 20); } else if (h > 0.94) { c.fillStyle = tono(base, 0.04); c.fillRect(i * 20, j * 20, 20, 20); }
    // las fibras: una rayita corta, muy suave (la moqueta tiene que ser fácil de copiar con un dedo)
    c.strokeStyle = 'rgba(32,16,44,0.06)'; c.lineWidth = 1; c.beginPath();
    const x = i * 20 + hash2(i, j, s + 1) * 16, y = j * 20 + hash2(i, j, s + 2) * 16; c.moveTo(x, y); c.lineTo(x + 3, y + 3);
    c.stroke();
  }
  // las costuras de la moqueta
  c.strokeStyle = 'rgba(32,16,44,0.14)'; c.lineWidth = 1.5; c.beginPath();
  for (let x = Math.ceil(z.px / 120) * 120; x < z.px + z.pw; x += 120) { c.moveTo(x, z.py); c.lineTo(x, z.py + z.ph); }
  c.stroke();
  // el reflejo de cada fluorescente del techo: un redondel claro y suave, uno cada 240 (solo en tramos de pasillo)
  if (z.ph <= 160 && z.pw >= 160) for (let x = z.px + 120; x < z.px + z.pw - 40; x += 240) {
    const g = c.createRadialGradient(x, z.py + z.ph / 2, 6, x, z.py + z.ph / 2, 50);
    g.addColorStop(0, 'rgba(255,250,200,0.22)'); g.addColorStop(1, 'rgba(255,250,200,0)');
    c.fillStyle = g; c.fillRect(x - 60, z.py, 120, z.ph);
  }
  // la humedad: algún manchón oscuro (pocos: la moqueta es la zona fácil)
  for (let k = 0; k < Math.round(z.pw * z.ph / 160000); k++) mancha(c, z.px + 40 + hash2(k, 1, s + 3) * (z.pw - 80), z.py + 30 + hash2(k, 2, s + 4) * (z.ph - 60), 22 + hash2(k, 3, s + 5) * 26, 'rgba(100,70,10,0.22)', s + k);
}

Object.assign(SUELOS, {
  // Pasillos: moqueta amarilla gastada (FÁCIL: un solo color ya camufla bastante, pero los becarios lo saben)
  moquetaBk(c, z, R) { moquetaAmarilla(c, z, R, BK.amarillo, 301); },
  // El vestíbulo (sala de espera de los becarios): linóleo a cuadros grandes, pálido y rozado
  linoleo(c, z, R) {
    const [i0, i1, j0, j1] = rango(z, R, 40);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 321); c.fillStyle = (i + j) & 1 ? '#e6d38e' : '#d3bd6a'; if (h < 0.1) c.fillStyle = '#c8b05a';
      c.fillRect(i * 40, j * 40, 40, 40);
      if (h > 0.86) raya(c, [i * 40 + 6, j * 40 + 30, i * 40 + 30, j * 40 + 10], 'rgba(32,16,44,0.14)', 2);   // un rozón
    }
    c.strokeStyle = 'rgba(32,16,44,0.16)'; c.lineWidth = 1.5; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 40, j0 * 40); c.lineTo(i * 40, j1 * 40); }
    for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 40, j * 40); c.lineTo(i1 * 40, j * 40); }
    c.stroke();
  },
  // La piscina: azulejo blanco de 20 y, en medio, el agua (DIFÍCIL: las ondas no se copian con un pincel gordo)
  piscina(c, z, R) {
    const [i0, i1, j0, j1] = rango(z, R, 20);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 331); c.fillStyle = h < 0.08 ? '#d9e4e2' : h > 0.94 ? '#fbfefd' : '#eef4f3'; c.fillRect(i * 20, j * 20, 20, 20);
    }
    c.strokeStyle = '#bcd0d0'; c.lineWidth = 1.5; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 20, j0 * 20); c.lineTo(i * 20, j1 * 20); }
    for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 20, j * 20); c.lineTo(i1 * 20, j * 20); }
    c.stroke();
    // el vaso: 60 de borde alrededor
    const x0 = z.px + 40, y0 = z.py + 40, w = z.pw - 80, h = z.ph - 80;
    forma(c, caja(x0 - 6, y0 - 6, w + 12, h + 12, 10), '#2f89a8', 3);
    c.save(); c.beginPath(); rrPathRF(c, x0, y0, w, h, 6); c.clip();
    c.fillStyle = BK.agua; c.fillRect(x0, y0, w, h);
    const g = c.createLinearGradient(x0, y0, x0 + w, y0 + h); g.addColorStop(0, 'rgba(255,255,255,0.1)'); g.addColorStop(1, 'rgba(20,60,110,0.22)'); c.fillStyle = g; c.fillRect(x0, y0, w, h);
    // las ondas: trocitos de curva clara, cada uno en su casilla, con orientación al azar; y el fondo de baldosas azules que se adivina
    c.strokeStyle = 'rgba(190,235,245,0.35)'; c.lineWidth = 1.2; c.beginPath();
    for (let x = x0; x < x0 + w; x += 40) { c.moveTo(x, y0); c.lineTo(x, y0 + h); } for (let y = y0; y < y0 + h; y += 40) { c.moveTo(x0, y); c.lineTo(x0 + w, y); }
    c.stroke();
    for (let j = Math.floor(y0 / 20); j < Math.ceil((y0 + h) / 20); j++) for (let i = Math.floor(x0 / 20); i < Math.ceil((x0 + w) / 20); i++) {
      const h1 = hash2(i, j, 332); if (h1 < 0.35) continue;
      const cx = i * 20 + 10, cy = j * 20 + 10, r = 7 + h1 * 8, a0 = hash2(i, j, 333) * TAU;
      c.strokeStyle = h1 > 0.82 ? 'rgba(255,246,234,0.9)' : 'rgba(170,235,245,0.75)'; c.lineWidth = h1 > 0.82 ? 1.8 : 1.3; c.beginPath(); c.arc(cx, cy, r, a0, a0 + 0.9 + h1 * 1.1); c.stroke();
    }
    c.restore();
    forma(c, caja(x0, y0, w, h, 6), null, 2.5, '#1d5d78');
  },
  // El cumpleaños: moqueta morada llena de confeti y serpentinas (MUY DIFÍCIL)
  confeti(c, z, R) {
    c.fillStyle = BK.moradoF; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 20);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 341); if (h < 0.15) { c.fillStyle = '#4e3580'; c.fillRect(i * 20, j * 20, 20, 20); }
      const n = h > 0.8 ? 2 : h > 0.3 ? 1 : 0;
      for (let k = 0; k < n; k++) {
        const x = i * 20 + hash2(i, j + k, 342) * 18, y = j * 20 + hash2(i + k, j, 343) * 18, col = CONFETI[Math.floor(hash2(i, j, 344 + k) * CONFETI.length)];
        c.save(); c.translate(x, y); c.rotate(hash2(i, j, 345 + k) * TAU); c.fillStyle = col;
        if (hash2(i, j, 346 + k) > 0.5) c.fillRect(-4, -1.5, 8, 3); else { c.beginPath(); c.arc(0, 0, 2.6, 0, TAU); c.fill(); }
        c.restore();
      }
    }
    // serpentinas: tiras onduladas largas, una por cada tramo de 120 de ancho
    for (let s = 0; s < Math.round(z.pw / 120); s++) {
      const x = z.px + 40 + hash2(s, 1, 347) * (z.pw - 80), y = z.py + 30 + hash2(s, 2, 348) * (z.ph - 60), col = CONFETI[s % CONFETI.length], a = hash2(s, 3, 349) * TAU;
      c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y);
      for (let k = 1; k <= 8; k++) c.lineTo(x + Math.cos(a) * k * 12 + Math.cos(k * 1.7) * 6, y + Math.sin(a) * k * 12 + Math.sin(k * 1.7) * 6);
      c.stroke();
    }
  },
  // El sótano de cables: hormigón oscuro con losas, cables negros y de colores serpenteando y rejillas de desagüe (DIFÍCIL)
  cables(c, z, R) {
    c.fillStyle = '#50545f'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 40);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 351); if (h < 0.18) { c.fillStyle = '#464a55'; c.fillRect(i * 40, j * 40, 40, 40); } else if (h > 0.92) { c.fillStyle = '#5a5f6b'; c.fillRect(i * 40, j * 40, 40, 40); }
      if (h > 0.4 && h < 0.45) { forma(c, caja(i * 40 + 8, j * 40 + 10, 24, 20, 2), '#2a2d36', 2); c.strokeStyle = '#6a6e7a'; c.lineWidth = 2; c.beginPath(); for (let k = 0; k < 3; k++) { c.moveTo(i * 40 + 12, j * 40 + 15 + k * 5); c.lineTo(i * 40 + 28, j * 40 + 15 + k * 5); } c.stroke(); }
    }
    c.strokeStyle = '#3c3f48'; c.lineWidth = 2; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 40, j0 * 40); c.lineTo(i * 40, j1 * 40); } for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 40, j * 40); c.lineTo(i1 * 40, j * 40); }
    c.stroke();
    // los cables: curvas largas de lado a lado, cada una con su brillo
    const colores = ['#1b1c22', '#1b1c22', '#f2c230', '#1b1c22', '#ff4b5c', '#1b1c22', '#39d5e8'];
    for (let s = 0; s < 7; s++) {
      const y = z.py + 20 + hash2(s, 1, 352) * (z.ph - 40), col = colores[s];
      c.beginPath(); c.moveTo(z.px, y);
      for (let x = z.px; x < z.px + z.pw; x += 80) c.quadraticCurveTo(x + 40, y + (hash2(s, x, 353) - 0.5) * 70, x + 80, y + (hash2(s, x + 80, 354) - 0.5) * 50);
      c.strokeStyle = OL; c.lineWidth = 7; c.stroke(); c.strokeStyle = col; c.lineWidth = 4; c.stroke(); c.strokeStyle = 'rgba(255,255,255,0.28)'; c.lineWidth = 1.2; c.stroke();
    }
  },
  // La oficina vacía: losetas de moqueta gris con rayitas, café derramado y papeles (media)
  moquetaGris(c, z, R) {
    const [i0, i1, j0, j1] = rango(z, R, 40);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 361); c.fillStyle = (i + j) & 1 ? '#8a8f9c' : '#7d8290'; if (h < 0.1) c.fillStyle = '#737886'; c.fillRect(i * 40, j * 40, 40, 40);
      c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1.5; c.beginPath();
      for (let k = 0; k < 4; k++) { const d = ((i + j) & 1) ? 1 : -1; c.moveTo(i * 40 + 6, j * 40 + 8 + k * 8); c.lineTo(i * 40 + 34, j * 40 + 8 + k * 8 + d * 4); }
      c.stroke();
    }
    c.strokeStyle = 'rgba(32,16,44,0.2)'; c.lineWidth = 1.5; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 40, j0 * 40); c.lineTo(i * 40, j1 * 40); } for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 40, j * 40); c.lineTo(i1 * 40, j * 40); }
    c.stroke();
  },
});

Object.assign(PAPELES, {
  // el papel amarillo de las Backrooms: motivo de rombitos, cercos de humedad por abajo y zócalo
  amarillo(c, t) {
    c.fillStyle = '#d6b54c'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    c.fillStyle = '#c9a640';
    for (let y = Math.floor(t.y0 / 20) * 20; y < t.y1; y += 20) for (let x = Math.floor(t.x0 / 20) * 20; x < t.x1; x += 20) {
      const ox = ((y / 20) & 1) ? 10 : 0; c.beginPath(); c.moveTo(x + ox + 10, y + 5); c.lineTo(x + ox + 14, y + 10); c.lineTo(x + ox + 10, y + 15); c.lineTo(x + ox + 6, y + 10); c.closePath(); c.fill();
    }
    const g = c.createLinearGradient(0, t.y1 - 26, 0, t.y1 - 9); g.addColorStop(0, 'rgba(110,80,10,0)'); g.addColorStop(1, 'rgba(110,80,10,0.4)'); c.fillStyle = g; c.fillRect(t.x0, t.y1 - 26, t.x1 - t.x0, 17);
    for (let x = Math.floor(t.x0 / 60) * 60; x < t.x1; x += 60) if (hash2(x, t.y0, 371) > 0.55) mancha(c, x + 30, t.y1 - 16, 9, 'rgba(90,70,20,0.3)', x);
    c.fillStyle = BK.zocalo; c.fillRect(t.x0, t.y1 - 9, t.x1 - t.x0, 9); c.fillStyle = '#9a7a2e'; c.fillRect(t.x0, t.y1 - 9, t.x1 - t.x0, 3);
  },
  // la piscina: azulejo blanco con la cenefa azul doble
  azulejoBlanco(c, t) {
    c.fillStyle = '#eef4f3'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    c.strokeStyle = '#bcd0d0'; c.lineWidth = 1.5; c.beginPath();
    for (let x = Math.floor(t.x0 / 20) * 20; x <= t.x1; x += 20) { c.moveTo(x, t.y0); c.lineTo(x, t.y1); } for (let y = Math.floor(t.y0 / 20) * 20; y <= t.y1; y += 20) { c.moveTo(t.x0, y); c.lineTo(t.x1, y); }
    c.stroke();
    c.fillStyle = '#2f89a8'; c.fillRect(t.x0, t.y0 + 20, t.x1 - t.x0, 8); c.fillStyle = BK.agua; c.fillRect(t.x0, t.y0 + 31, t.x1 - t.x0, 4);
    c.fillStyle = '#c4d8da'; c.fillRect(t.x0, t.y1 - 6, t.x1 - t.x0, 6);
  },
  // el cumpleaños: pared morada con banderines de colores colgando y algún globo pegado
  banderines(c, t) {
    c.fillStyle = '#7a56b6'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    c.fillStyle = '#6a49a4'; for (let x = Math.floor(t.x0 / 40) * 40; x < t.x1; x += 40) c.fillRect(x, t.y0, 20, t.y1 - t.y0);
    c.strokeStyle = OL; c.lineWidth = 2; c.beginPath(); c.moveTo(t.x0, t.y0 + 10); for (let x = t.x0; x < t.x1; x += 120) c.quadraticCurveTo(x + 60, t.y0 + 26, x + 120, t.y0 + 10); c.stroke();
    for (let x = Math.floor(t.x0 / 20) * 20; x < t.x1; x += 20) {
      const u = ((x - t.x0) % 120) / 120, y = t.y0 + 10 + 16 * 4 * u * (1 - u);
      forma(c, poli(x + 2, y, x + 18, y, x + 10, y + 16), CONFETI[(x / 20) % CONFETI.length], 1.8);
    }
    for (let x = Math.floor(t.x0 / 80) * 80; x < t.x1; x += 80) if (hash2(x, t.y0, 381) > 0.5) { forma(c, ovalo(x + 40, t.y1 - 22, 8, 10), CONFETI[(x / 80) % 5], 2); punto(c, x + 37, t.y1 - 26, 2, 'rgba(255,255,255,0.6)'); }
    c.fillStyle = '#3f2a6a'; c.fillRect(t.x0, t.y1 - 7, t.x1 - t.x0, 7);
  },
  // el sótano: hormigón con dos tuberías, abrazaderas y una válvula roja
  tuberias(c, t) {
    c.fillStyle = '#3b3f49'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    c.strokeStyle = 'rgba(255,255,255,0.05)'; c.lineWidth = 2; c.beginPath(); for (let x = Math.floor(t.x0 / 60) * 60; x < t.x1; x += 60) { c.moveTo(x, t.y0); c.lineTo(x, t.y1); } c.stroke();
    for (const [y, col, r] of [[t.y0 + 14, '#6c7280', 5], [t.y0 + 30, '#8d7146', 4]]) {
      raya(c, [t.x0, y, t.x1, y], OL, r * 2 + 3); raya(c, [t.x0, y, t.x1, y], col, r * 2); raya(c, [t.x0, y - r / 2, t.x1, y - r / 2], 'rgba(255,255,255,0.3)', 1.5);
      for (let x = Math.floor(t.x0 / 80) * 80 + 20; x < t.x1; x += 80) forma(c, caja(x - 4, y - r - 3, 8, r * 2 + 6, 2), '#4a4f5c', 2);
    }
    for (let x = Math.floor(t.x0 / 240) * 240 + 120; x < t.x1; x += 240) { forma(c, ovalo(x, t.y0 + 30, 9, 9), '#ff4b5c', 2.5); raya(c, [x - 6, t.y0 + 30, x + 6, t.y0 + 30], OL, 2); raya(c, [x, t.y0 + 24, x, t.y0 + 36], OL, 2); }
    c.fillStyle = '#2a2d36'; c.fillRect(t.x0, t.y1 - 6, t.x1 - t.x0, 6);
  },
  // la oficina vacía: paneles de tela gris con juntas de aluminio, papeles clavados y un pósit
  tabique(c, t) {
    c.fillStyle = '#9aa0ad'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    for (let x = Math.floor(t.x0 / 80) * 80; x < t.x1; x += 80) {
      c.fillStyle = ((x / 80) & 1) ? '#9096a3' : '#9aa0ad'; c.fillRect(x, t.y0, 80, t.y1 - t.y0);
      raya(c, [x, t.y0, x, t.y1], '#c8ccd6', 3);
      const h = hash2(x, t.y0, 391);
      if (h > 0.6) { forma(c, caja(x + 22, t.y0 + 14, 22, 28, 1), '#f4f1e6', 1.5); c.strokeStyle = 'rgba(32,16,44,0.3)'; c.lineWidth = 1.2; c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(x + 26, t.y0 + 20 + k * 5); c.lineTo(x + 40, t.y0 + 20 + k * 5); } c.stroke(); punto(c, x + 33, t.y0 + 14, 2.2, '#ff4b5c'); }
      else if (h < 0.2) forma(c, caja(x + 48, t.y0 + 22, 18, 18, 1), '#f2dc5a', 1.5);
    }
    c.fillStyle = '#6d7380'; c.fillRect(t.x0, t.y1 - 7, t.x1 - t.x0, 7);
  },
});

/* ---------- muebles nuevos ---------- */
Object.assign(TIPOS_MUEBLE, {
  // un pilar: alto y estrecho (una alubia asoma por los lados)
  pilar: { w: 24, d: 16, h: 70, pinta(c) {
    forma(c, caja(-12, -78, 24, 78, 2), '#e0c766'); c.fillStyle = '#b89a3c'; c.fillRect(4, -76, 7, 74);
    forma(c, caja(-15, -86, 30, 10, 2), '#c9a94a', 2.5); forma(c, caja(-14, -8, 28, 8, 2), BK.zocalo, 2.5);
    c.fillStyle = 'rgba(100,70,10,0.3)'; c.fillRect(-11, -22, 22, 14);
  } },
  // un fluorescente caído del techo: el tubo, los dos casquillos y el cable
  fluorescente: { w: 60, d: 10, h: 6, senuelo: true, pinta(c) {
    raya(c, [-30, -2, -36, -14], OL, 2.5);
    forma(c, caja(-30, -10, 60, 8, 4), '#f4f7ff', 2.5); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(-26, -8, 52, 2);
    forma(c, caja(-33, -11, 6, 10, 1), '#8e93a6', 2); forma(c, caja(27, -11, 6, 10, 1), '#8e93a6', 2);
  } },
  // un ramillete de tres globos atado a un peso
  globos: { w: 20, d: 12, h: 52, senuelo: true, pinta(c, m) {
    const v = m.v || 0;
    forma(c, caja(-7, -8, 14, 8, 2), '#8e93a6', 2);
    for (const [dx, dy, col] of [[-10, -40, CONFETI[v % 6]], [10, -44, CONFETI[(v + 2) % 6]], [0, -54, CONFETI[(v + 4) % 6]]]) {
      raya(c, [0, -8, dx, dy + 10], OL, 1.5);
      forma(c, ovalo(dx, dy, 9, 11), col, 2.5); punto(c, dx - 3, dy - 4, 2.2, 'rgba(255,255,255,0.65)');
      forma(c, poli(dx - 2, dy + 10, dx + 2, dy + 10, dx, dy + 13), col, 1.5);
    }
  } },
  // la mesa de la tarta: mantel rosa, tarta de dos pisos y velas
  tarta: { w: 56, d: 30, h: 30, pinta(c) {
    cajon(c, 56, 30, 20, '#ff9bd0', '#e06aa8', 4);
    forma(c, ovalo(0, -40, 17, 7), '#f1e6cc', 2.5); forma(c, caja(-17, -50, 34, 10), '#8f5a2e', 2.5); forma(c, ovalo(0, -50, 17, 7), '#ffd5e8', 2.5);
    forma(c, caja(-10, -60, 20, 10), '#8f5a2e', 2.5); forma(c, ovalo(0, -60, 10, 4.5), '#ffd5e8', 2.5);
    for (const dx of [-5, 0, 5]) { raya(c, [dx, -62, dx, -70], '#fff6ea', 2.2); punto(c, dx, -72, 2.2, '#f2c230'); }
  } },
  // la escalera de la piscina, pegada al borde
  escalera: { w: 24, d: 12, h: 40, pared: true, pinta(c) {
    for (const dx of [-8, 8]) { raya(c, [dx, -2, dx, -40], OL, 6); raya(c, [dx, -2, dx, -40], '#c8ccd6', 3.5); punto(c, dx, -40, 3.5, '#c8ccd6'); }
    for (let y = -10; y > -36; y -= 8) raya(c, [-8, y, 8, y], '#8e93a6', 3);
  } },
  // un flotador olvidado
  flotador: { w: 40, d: 30, h: 10, senuelo: true, pinta(c, m) {
    forma(c, ovalo(0, -15, 20, 13), (m.v || 0) ? '#39d5e8' : '#ff4b5c', 3);
    forma(c, ovalo(0, -17, 20, 13), (m.v || 0) ? '#5fe3f2' : '#ff7a85', 2.5);
    c.fillStyle = '#fff6ea'; for (const a of [0.3, 1.9, 3.4, 5]) { c.beginPath(); c.ellipse(Math.cos(a) * 15, -17 + Math.sin(a) * 9.5, 4, 3.5, a, 0, TAU); c.fill(); }
    forma(c, ovalo(0, -17, 9, 5), '#f1e6cc', 2.5);
  } },
  // una bobina de cable de madera
  bobina: { w: 46, d: 36, h: 28, pinta(c) {
    forma(c, ovalo(0, -8, 23, 10), '#8f5a2e', 2.5); forma(c, caja(-23, -38, 46, 30), '#a87a4e'); forma(c, ovalo(0, -38, 23, 10), '#c89a64', 2.5);
    c.strokeStyle = OL; c.lineWidth = 2; c.beginPath(); for (let y = -32; y < -12; y += 5) { c.moveTo(-21, y); c.lineTo(21, y); } c.stroke();
    forma(c, ovalo(0, -38, 5, 2.2), '#6b4320', 2); raya(c, [21, -22, 36, -6], OL, 5); raya(c, [21, -22, 36, -6], '#1b1c22', 3);
  } },
  // un tabique de oficina suelto, con una nota pinchada
  separador: { w: 84, d: 14, h: 38, pinta(c) {
    forma(c, caja(-42, -46, 84, 44, 2), '#9aa0ad', 3); c.fillStyle = '#c8ccd6'; c.fillRect(-42, -46, 84, 4); c.fillRect(-42, -6, 84, 4);
    forma(c, caja(-14, -38, 20, 24, 1), '#f4f1e6', 1.5); c.strokeStyle = 'rgba(32,16,44,0.3)'; c.lineWidth = 1.2; c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(-10, -32 + k * 5); c.lineTo(2, -32 + k * 5); } c.stroke();
    forma(c, caja(14, -34, 16, 16, 1), '#f2dc5a', 1.5); punto(c, -4, -38, 2.2, '#ff4b5c');
    forma(c, caja(-44, -4, 10, 4, 1), '#6d7380', 2); forma(c, caja(34, -4, 10, 4, 1), '#6d7380', 2);
  } },
});

/* ---------- manchas del suelo propias ---------- */
Object.assign(PEGATINAS_EXTRA, {
  charco(c, x, y, s) { mancha(c, x, y, 18, 'rgba(120,200,230,0.42)', s); c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x - 6, y - 4, 6, Math.PI * 1.1, Math.PI * 1.7); c.stroke(); },
  moho(c, x, y, s) { mancha(c, x, y, 16, 'rgba(70,90,50,0.45)', s); mancha(c, x + 6, y + 4, 8, 'rgba(50,70,40,0.5)', s + 7); for (let k = 0; k < 5; k++) punto(c, x + (hash2(k, s, 401) - 0.5) * 30, y + (hash2(k, s, 402) - 0.5) * 24, 1.6, 'rgba(120,140,90,0.7)'); },
  huellas(c, x, y, s) { const a = hash2(s, 1, 411) * TAU; c.fillStyle = 'rgba(70,120,150,0.4)'; for (let k = 0; k < 4; k++) { const d = k * 16, lado = (k & 1 ? 6 : -6); c.beginPath(); c.ellipse(x + Math.cos(a) * d - Math.sin(a) * lado, y + Math.sin(a) * d + Math.cos(a) * lado, 4, 7, a + Math.PI / 2, 0, TAU); c.fill(); } },
  vela(c, x, y) { raya(c, [x, y, x, y - 8], '#fff6ea', 2.2); punto(c, x, y - 10, 2.2, '#f2c230'); },
});
