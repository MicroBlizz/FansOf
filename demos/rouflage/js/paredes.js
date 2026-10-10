// Fans of Rouflage (prototipo) · LAS PAREDES: el muro visto desde arriba, las paredes que se ven de frente (cada sala con su papel
// pintado: delante de ellas también se puede uno camuflar) y los carteles. Igual que los suelos, todo sale idéntico cada vez.
'use strict';

const COLOR_MURO = '#191430', COLOR_CANTO = '#3d3668';

// el muro: base oscura con chapas y, alrededor de todo lo que no es muro, el canto claro con su contorno
function pintaMuro(c, R) {
  c.fillStyle = COLOR_MURO; c.fillRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
  c.strokeStyle = 'rgba(255,255,255,0.035)'; c.lineWidth = 2; c.beginPath();
  for (let x = Math.floor(R.x0 / 60) * 60; x <= R.x1; x += 60) { c.moveTo(x, R.y0); c.lineTo(x, R.y1); }
  for (let y = Math.floor(R.y0 / 60) * 60; y <= R.y1; y += 60) { c.moveTo(R.x0, y); c.lineTo(R.x1, y); }
  c.stroke();
  const i0 = Math.max(0, Math.floor(R.x0 / CEL) - 1), i1 = Math.min(MW - 1, Math.ceil(R.x1 / CEL)), j0 = Math.max(0, Math.floor(R.y0 / CEL) - 1), j1 = Math.min(MH - 1, Math.ceil(R.y1 / CEL));
  for (const [crece, color] of [[10, OL], [7, COLOR_CANTO]]) {
    c.fillStyle = color;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (GRID[j * MW + i] !== VACIO) c.fillRect(i * CEL - crece, j * CEL - crece, CEL + crece * 2, CEL + crece * 2);
  }
}

// las rayas oscuras donde el suelo toca el muro, y la sombra que la pared de frente echa sobre el suelo
function pintaBordes(c, R) {
  const i0 = Math.max(0, Math.floor(R.x0 / CEL) - 1), i1 = Math.min(MW - 1, Math.ceil(R.x1 / CEL)), j0 = Math.max(0, Math.floor(R.y0 / CEL) - 1), j1 = Math.min(MH - 1, Math.ceil(R.y1 / CEL));
  const en = (i, j) => (i < 0 || j < 0 || i >= MW || j >= MH ? VACIO : GRID[j * MW + i]);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    if (en(i, j) !== SUELO) continue;
    const x = i * CEL, y = j * CEL;
    if (en(i, j - 1) === CARA) { const g = c.createLinearGradient(0, y, 0, y + 12); g.addColorStop(0, 'rgba(24,12,40,0.34)'); g.addColorStop(1, 'rgba(24,12,40,0)'); c.fillStyle = g; c.fillRect(x, y, CEL, 12); }
    c.fillStyle = 'rgba(24,12,40,0.16)';
    if (en(i - 1, j) !== SUELO) c.fillRect(x, y, 5, CEL);
    if (en(i + 1, j) !== SUELO) c.fillRect(x + CEL - 5, y, 5, CEL);
  }
  c.strokeStyle = OL; c.lineWidth = 3; c.lineCap = 'square'; c.beginPath();
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const t = en(i, j); if (t === VACIO) continue;
    const x = i * CEL, y = j * CEL;
    if (en(i - 1, j) === VACIO) { c.moveTo(x, y); c.lineTo(x, y + CEL); }
    if (en(i + 1, j) === VACIO) { c.moveTo(x + CEL, y); c.lineTo(x + CEL, y + CEL); }
    if (en(i, j + 1) === VACIO) { c.moveTo(x, y + CEL); c.lineTo(x + CEL, y + CEL); }
    if (en(i, j - 1) === VACIO) { c.moveTo(x, y); c.lineTo(x + CEL, y); }
    // el costado de una pared de frente que da a un suelo (el marco de una puerta)
    if (t === CARA && en(i - 1, j) === SUELO) { c.moveTo(x, y); c.lineTo(x, y + CEL); }
    if (t === CARA && en(i + 1, j) === SUELO) { c.moveTo(x + CEL, y); c.lineTo(x + CEL, y + CEL); }
  }
  c.stroke(); c.lineCap = 'butt';
}

// el papel de cada pared: recibe el tramo { x0, x1, y0, y1 } ya recortado
const PAPELES = {
  // Oficinas: rayas verticales crema y salmón, con zócalo
  rayas(c, t) {
    for (let x = Math.floor(t.x0 / 20) * 20; x < t.x1; x += 20) { c.fillStyle = (x / 20) & 1 ? '#d9937c' : '#eadfc8'; c.fillRect(x, t.y0, 20, t.y1 - t.y0); }
    c.fillStyle = '#fff6ea'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, 4);
    c.fillStyle = '#7a4b3e'; c.fillRect(t.x0, t.y1 - 9, t.x1 - t.x0, 9); c.fillStyle = '#9a6453'; c.fillRect(t.x0, t.y1 - 9, t.x1 - t.x0, 3);
  },
  // Cafetería: azulejo blanco con una cenefa verde
  azulejo(c, t) {
    c.fillStyle = '#e3f3ec'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    c.strokeStyle = '#b4d6c9'; c.lineWidth = 1.5; c.beginPath();
    for (let x = Math.floor(t.x0 / 20) * 20; x <= t.x1; x += 20) { c.moveTo(x, t.y0); c.lineTo(x, t.y1); }
    for (let y = t.y1; y >= t.y0; y -= 20) { c.moveTo(t.x0, y); c.lineTo(t.x1, y); }
    c.stroke();
    c.fillStyle = '#5fb7a6'; c.fillRect(t.x0, t.y1 - 31, t.x1 - t.x0, 11);
    c.fillStyle = '#f1e6cc'; for (let x = Math.floor(t.x0 / 20) * 20; x < t.x1; x += 20) { c.beginPath(); c.moveTo(x + 10, t.y1 - 30); c.lineTo(x + 15, t.y1 - 25.5); c.lineTo(x + 10, t.y1 - 21); c.lineTo(x + 5, t.y1 - 25.5); c.closePath(); c.fill(); }
    c.fillStyle = '#3f8d7f'; c.fillRect(t.x0, t.y1 - 7, t.x1 - t.x0, 7);
  },
  // La Nube: panel oscuro lleno de lucecitas
  racks(c, t) {
    c.fillStyle = '#20264a'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    for (let x = Math.floor(t.x0 / 10) * 10; x < t.x1; x += 10) for (let y = t.y0 + 9; y < t.y1 - 12; y += 8) {
      const h = hash2(x, y, 81);
      c.fillStyle = h < 0.16 ? '#59e07a' : h < 0.3 ? '#39d5e8' : h < 0.35 ? '#ff4b5c' : '#2f3766'; c.fillRect(x + 3, y, 4, 3);
    }
    c.fillStyle = '#12162b'; for (let x = Math.ceil(t.x0 / 60) * 60; x < t.x1; x += 60) c.fillRect(x - 1.5, t.y0, 3, t.y1 - t.y0);
    c.fillStyle = '#39d5e8'; c.fillRect(t.x0, t.y1 - 6, t.x1 - t.x0, 3); c.fillStyle = '#12162b'; c.fillRect(t.x0, t.y1 - 3, t.x1 - t.x0, 3);
  },
  // Pasillo: chapa con remaches (las ventanas al espacio se cuelgan como carteles)
  ventanas(c, t) {
    c.fillStyle = '#5b5f84'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    c.fillStyle = '#6d7199'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, 6);
    c.fillStyle = '#4c5075'; for (let x = Math.ceil(t.x0 / 80) * 80; x < t.x1; x += 80) c.fillRect(x - 1.5, t.y0, 3, t.y1 - t.y0);
    c.fillStyle = '#8e93bd'; for (let x = Math.floor(t.x0 / 20) * 20 + 10; x < t.x1; x += 20) { c.fillRect(x - 1.5, t.y0 + 10, 3, 3); c.fillRect(x - 1.5, t.y1 - 16, 3, 3); }
    c.fillStyle = '#3d4063'; c.fillRect(t.x0, t.y1 - 8, t.x1 - t.x0, 8);
  },
  // Recursos Humanos: madera a listones, con sus diplomas
  madera(c, t) {
    for (let x = Math.floor(t.x0 / 20) * 20; x < t.x1; x += 20) { c.fillStyle = hash2(x, 1, 101) > 0.5 ? '#8e5d3c' : '#7f5234'; c.fillRect(x, t.y0, 20, t.y1 - t.y0); c.fillStyle = '#5e3b24'; c.fillRect(x, t.y0, 1.5, t.y1 - t.y0); }
    c.fillStyle = '#5e3b24'; c.fillRect(t.x0, t.y1 - 8, t.x1 - t.x0, 8); c.fillStyle = '#a8744d'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, 5);
  },
  // Almacén: chapa ondulada con una franja de peligro abajo
  chapa(c, t) {
    for (let x = Math.floor(t.x0 / 10) * 10; x < t.x1; x += 10) { c.fillStyle = (x / 10) & 1 ? '#77818f' : '#8a94a3'; c.fillRect(x, t.y0, 10, t.y1 - t.y0); }
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, 4);
    peligro(c, t.x0, t.y1 - 11, t.x1 - t.x0, 11, 12);
  },
  // Juegos cerrados: sillares de piedra con musgo abajo
  piedra(c, t) {
    c.fillStyle = '#434a57'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    for (let j = 0, y = t.y1 - 20; y > t.y0 - 20; y -= 20, j++) for (let x = Math.floor(t.x0 / 40) * 40 - (j & 1 ? 20 : 0); x < t.x1; x += 40) {
      const h = hash2(x, y, 111); c.fillStyle = h < 0.33 ? '#666e7c' : h < 0.66 ? '#5b6370' : '#727a88'; c.fillRect(x + 1.5, y + 1.5, 37, 17);
    }
    c.fillStyle = '#4b8572'; for (let x = Math.floor(t.x0 / 12) * 12; x < t.x1; x += 12) if (hash2(x, 3, 112) > 0.45) c.fillRect(x, t.y1 - 3 - hash2(x, 4, 113) * 5, 9, 9);
  },
  // el dintel de un paso entre salas: chapa oscura con una luz
  marco(c, t) {
    c.fillStyle = '#40446a'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    c.fillStyle = '#2c2f4f'; c.fillRect(t.x0, t.y1 - 12, t.x1 - t.x0, 12);
    peligro(c, t.x0, t.y1 - 22, t.x1 - t.x0, 10, 12);
    const mx = (t.x0 + t.x1) / 2, my = (t.y0 + t.y1) / 2 - 8;
    forma(c, caja(mx - 13, my - 7, 26, 14, 4), '#12162b', 2.5); punto(c, mx, my, 4, '#7ee04a');
  },
};
function pintaCaras(c, R) {
  for (const t of CARAS) {
    if (t.x1 < R.x0 || t.x0 > R.x1 || t.y1 < R.y0 || t.y0 > R.y1) continue;
    c.save(); c.beginPath(); c.rect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0); c.clip();
    PAPELES[t.zona.pared](c, t);
    c.restore();
  }
}

// un texto que se encoge hasta caber en un ancho
function rotuloJusto(c, s, x, y, tam, ancho, color, borde) {
  c.font = tam + 'px ' + LETRA_GORDA; const w = c.measureText(s).width;
  rotulo(c, s, x, y + 1, w > ancho ? tam * ancho / w : tam, color, borde);
}
function pintaCartel(c, k) {
  const { x, y } = k;
  if (k.t === 'poster') {       // un cartel pequeño de dos líneas, con sus trocitos de celo
    forma(c, caja(x - 33, y - 21, 66, 42, 2), '#191430', 2.5);
    c.fillStyle = k.color; c.fillRect(x - 30, y - 18, 60, 4);
    rotuloJusto(c, tr(k.l1), x, y - 5, 10, 56, '#fff6ea'); rotuloJusto(c, tr(k.l2), x, y + 9, 12, 56, k.color);
    c.fillStyle = 'rgba(255,246,234,0.75)'; c.fillRect(x - 37, y - 24, 11, 5); c.fillRect(x + 26, y - 24, 11, 5);
  } else if (k.t === 'rotulo') {   // un letrero ancho con luz
    const w = k.w;
    forma(c, caja(x - w / 2, y - 15, w, 30, 7), '#191430', 3);
    c.strokeStyle = k.color; c.lineWidth = 2; c.beginPath(); rrPath(c, x - w / 2 + 4, y - 11, w - 8, 22, 4); c.stroke();
    if (k.nube) {
      for (const [dx, r] of [[-w / 2 + 20, 6], [-w / 2 + 27, 8], [-w / 2 + 35, 6]]) punto(c, x + dx, y - 1 - (r - 6), r, k.color);
      c.fillStyle = k.color; c.fillRect(x - w / 2 + 16, y, 24, 5);
      rotuloJusto(c, tr(k.l1), x + 16, y, 16, w - 58, k.color);
    } else rotuloJusto(c, tr(k.l1), x, y, 16, w - 20, k.color);
  } else if (k.t === 'flecha') {   // una señal con flecha
    const w = 96, d = k.izq ? -1 : 1;
    forma(c, caja(x - w / 2, y - 12, w, 24, 4), '#fff6ea', 2.5);
    forma(c, poli(x + d * (w / 2 - 6), y, x + d * (w / 2 - 20), y - 8, x + d * (w / 2 - 20), y + 8), k.color, 2);
    rotuloJusto(c, tr(k.l1), x - d * 8, y, 12, w - 36, OL);
  } else if (k.t === 'placa') {    // una placa de bronce
    forma(c, caja(x - k.w / 2, y - 13, k.w, 26, 3), '#b58a4c', 3);
    c.strokeStyle = '#8a6532'; c.lineWidth = 1.5; c.strokeRect(x - k.w / 2 + 4, y - 9, k.w - 8, 18);
    rotuloJusto(c, tr(k.l1), x, y, 11, k.w - 22, '#3a2a14');
    for (const dx of [-k.w / 2 + 8, k.w / 2 - 8]) punto(c, x + dx, y, 1.8, '#3a2a14');
  } else if (k.t === 'ventana') {  // una ventana al espacio: estrellas y, a veces, un planeta
    const x0 = x - 48, y0 = y - 17, v = k.v || 0;
    c.save(); c.beginPath(); rrPath(c, x0, y0, 96, 34, 10); c.clip();
    c.fillStyle = '#0b0a1f'; c.fillRect(x0, y0, 96, 34);
    for (let s = 0; s < 18; s++) { const r = 0.7 + hash2(s, v, 92) * 1.1; punto(c, x0 + hash2(s, v, 93) * 96, y0 + hash2(s, v, 94) * 34, r, hash2(s, v, 91) > 0.7 ? '#ffe9a8' : '#dfe6ff'); }
    if (v === 1) { punto(c, x0 + 70, y0 + 40, 22, '#3a7de0'); punto(c, x0 + 62, y0 + 34, 8, '#5fb7a6'); }
    if (v === 2) { punto(c, x0 + 24, y0 + 14, 6, '#e9c46a'); c.strokeStyle = '#f1e6cc'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x0 + 24, y0 + 14, 11, 3, -0.4, 0, TAU); c.stroke(); }
    c.restore();
    forma(c, caja(x0, y0, 96, 34, 10), null, 3); c.strokeStyle = '#8e93bd'; c.lineWidth = 2; c.beginPath(); rrPath(c, x0 - 3, y0 - 3, 102, 40, 12); c.stroke();
  } else if (k.t === 'reloj') {
    forma(c, ovalo(x, y, 14, 14), '#fff6ea', 3);
    raya(c, [x, y, x, y - 9], OL, 2.2); raya(c, [x, y, x + 6, y + 3], OL, 2.2); punto(c, x, y, 1.8, '#ff4b5c');
  }
}
