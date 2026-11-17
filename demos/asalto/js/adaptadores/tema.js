// Fans of Asalto · ADAPTADORES · El tema de mazmorra y pergamino, pintado por código: los colores del juego y las piezas con las que se
// arma la pantalla (pergaminos, tablas de madera con remaches de oro, losas de piedra del Altar, botones gordos, cintas y barras).
// Cada pieza se dibuja una vez a su tamaño en un lienzo aparte y se guarda; después solo se copia. Todo a píxel entero, sin suavizar.
'use strict';
AS.tema = (() => {
  const C = { tinta: '#22140e', perg: '#ecd9a6', perg2: '#d8bf86', perg3: '#b3915a', madera: '#7c4b2a', madera2: '#55301a', madera3: '#a06a3c', oro: '#ffd23a', oro2: '#c8901c',
    piedra: '#dccfa8', piedra2: '#b9a77c', rojo: '#d8402f', naranja: '#f08a2a', verde: '#57b947', azul: '#3f8ae8', celeste: '#8fd0f8', noche: '#141026', crema: '#fff3d6', sangre: '#8a1f24' };
  const CACHE = new Map();
  const rgb = hex => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const hex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const tono = (col, k) => hex(rgb(col).map(v => (k < 0 ? v * (1 + k) : v + (255 - v) * k)));   // k < 0 oscurece, k > 0 aclara
  // un número de 0 a 1, siempre el mismo para el mismo punto (para manchas y muescas sin azar de verdad)
  const ruido = (x, y, s) => { const n = Math.sin(x * 127.1 + y * 311.7 + (s || 0) * 74.7) * 43758.5453; return n - Math.floor(n); };

  function pieza(clave, w, h, pinta) {
    let cv = CACHE.get(clave);
    if (cv) return cv;
    if (CACHE.size > 260) CACHE.clear();
    cv = document.createElement('canvas'); cv.width = Math.max(1, w); cv.height = Math.max(1, h);
    pinta(cv.getContext('2d'), w, h);
    CACHE.set(clave, cv);
    return cv;
  }
  // un rectángulo con las esquinas comidas (n píxeles), relleno
  function chafl(g, x, y, w, h, n, col) {
    g.fillStyle = col;
    g.fillRect(x + n, y, w - n * 2, h); g.fillRect(x, y + n, w, h - n * 2);
  }
  function pintaPergamino(g, w, h) {
    chafl(g, 0, 0, w, h, 4, C.tinta); chafl(g, 2, 2, w - 4, h - 4, 3, C.perg3); chafl(g, 4, 4, w - 8, h - 8, 2, C.perg2); chafl(g, 7, 7, w - 14, h - 14, 2, C.perg);
    for (let y = 8; y < h - 8; y += 2) for (let x = 8; x < w - 8; x += 2) {   // manchas y fibras del papel
      const r = ruido(x >> 3, y >> 3, 1), f = ruido(x, y, 2);
      if (r > 0.86) { g.fillStyle = C.perg2; g.fillRect(x, y, 2, 2); } else if (f > 0.975) { g.fillStyle = C.perg3; g.fillRect(x, y, 2, 1); } else if (f < 0.02) { g.fillStyle = C.crema; g.fillRect(x, y, 2, 1); }
    }
    for (let i = 14; i < w - 14; i += 18) {   // muescas de papel viejo en los bordes
      if (ruido(i, 0, 3) > 0.55) { g.clearRect(i, 0, 4, 2); g.fillStyle = C.tinta; g.fillRect(i, 2, 4, 2); }
      if (ruido(i, 9, 3) > 0.55) { g.clearRect(i, h - 2, 4, 2); g.fillStyle = C.tinta; g.fillRect(i, h - 4, 4, 2); }
    }
  }
  function pintaTabla(g, w, h) {
    chafl(g, 0, 0, w, h, 3, C.tinta); chafl(g, 2, 2, w - 4, h - 4, 2, C.madera);
    g.fillStyle = C.madera3; g.fillRect(4, 3, w - 8, 2);
    g.fillStyle = C.madera2; g.fillRect(4, h - 6, w - 8, 3);
    for (let y = 16; y < h - 8; y += 16) { g.fillStyle = C.madera2; g.fillRect(3, y, w - 6, 2); g.fillStyle = C.madera3; g.fillRect(3, y + 2, w - 6, 1); }
    for (let y = 6; y < h - 6; y += 4) for (let x = 6; x < w - 6; x += 6) if (ruido(x, y, 5) > 0.9) { g.fillStyle = C.madera2; g.fillRect(x, y, 5, 1); }
    for (const [x, y] of [[6, 6], [w - 12, 6], [6, h - 12], [w - 12, h - 12]]) { g.fillStyle = C.tinta; g.fillRect(x - 1, y - 1, 8, 8); g.fillStyle = C.oro; g.fillRect(x, y, 6, 6); g.fillStyle = C.crema; g.fillRect(x + 1, y + 1, 2, 2); g.fillStyle = C.oro2; g.fillRect(x + 3, y + 4, 3, 2); }
  }
  function pintaLosa(g, w, h, col) {
    chafl(g, 0, 0, w, h, 3, C.tinta); chafl(g, 2, 2, w - 4, h - 4, 2, col);
    g.fillStyle = tono(col, 0.45); g.fillRect(4, 3, w - 8, 3); g.fillRect(3, 4, 3, h - 8);
    g.fillStyle = tono(col, -0.25); g.fillRect(4, h - 6, w - 8, 3); g.fillRect(w - 6, 4, 3, h - 8);
    for (let y = 8; y < h - 8; y += 3) for (let x = 8; x < w - 8; x += 3) if (ruido(x, y, 7) > 0.93) { g.fillStyle = tono(col, -0.14); g.fillRect(x, y, 3, 2); }
  }
  function pintaBoton(g, w, h, col, hundido) {
    const y0 = hundido ? 3 : 0, a = h - 5;
    if (!hundido) chafl(g, 1, 5, w - 2, a, 4, 'rgba(10,6,4,0.55)');
    chafl(g, 0, y0, w, a, 4, C.tinta); chafl(g, 2, y0 + 2, w - 4, a - 4, 3, tono(col, -0.3)); chafl(g, 2, y0 + 2, w - 4, a - 9, 3, col);
    g.fillStyle = tono(col, 0.5); g.fillRect(6, y0 + 3, w - 12, 2);
    g.fillStyle = tono(col, 0.75); g.fillRect(7, y0 + 6, 5, 2); g.fillRect(7, y0 + 8, 2, 3);
  }
  function pintaCinta(g, w, h, col) {
    const p = 12;
    g.fillStyle = C.tinta; g.fillRect(0, 6, p + 4, h - 6); g.fillRect(w - p - 4, 6, p + 4, h - 6);
    g.fillStyle = tono(col, -0.4); g.fillRect(2, 8, p, h - 10); g.fillRect(w - p - 2, 8, p, h - 10);
    g.clearRect(0, 6 + Math.floor((h - 6) / 2) - 3, 5, 6); g.clearRect(w - 5, 6 + Math.floor((h - 6) / 2) - 3, 5, 6);
    chafl(g, p - 2, 0, w - p * 2 + 4, h - 6, 2, C.tinta); chafl(g, p, 2, w - p * 2, h - 10, 1, col);
    g.fillStyle = tono(col, 0.4); g.fillRect(p + 2, 3, w - p * 2 - 4, 2);
    g.fillStyle = tono(col, -0.25); g.fillRect(p + 2, h - 12, w - p * 2 - 4, 2);
  }
  // una elipse rellena, a píxel (las losas redondas de los huecos, las sombras)
  function elipse(g, cx, cy, rx, ry, col) {
    g.fillStyle = col;
    for (let dy = -ry; dy < ry; dy += 2) { const m = Math.round(rx * Math.sqrt(1 - ((dy + 1) * (dy + 1)) / (ry * ry))); g.fillRect(Math.round(cx) - m, Math.round(cy) + dy, m * 2, 2); }
  }
  const pon = (g, cv, x, y) => { g.drawImage(cv, Math.round(x), Math.round(y)); };
  const R = Math.round;
  return {
    C, tono, ruido, chafl, elipse,
    pergamino: (g, x, y, w, h) => pon(g, pieza(`p${R(w)}x${R(h)}`, R(w), R(h), pintaPergamino), x, y),
    tabla: (g, x, y, w, h) => pon(g, pieza(`t${R(w)}x${R(h)}`, R(w), R(h), pintaTabla), x, y),
    losa: (g, x, y, w, h, col) => pon(g, pieza(`l${R(w)}x${R(h)}${col || ''}`, R(w), R(h), (c, a, b) => pintaLosa(c, a, b, col || C.piedra)), x, y),
    boton: (g, x, y, w, h, col, hundido) => pon(g, pieza(`b${R(w)}x${R(h)}${col}${hundido ? 1 : 0}`, R(w), R(h), (c, a, b) => pintaBoton(c, a, b, col, hundido)), x, y),
    cinta: (g, x, y, w, h, col) => pon(g, pieza(`c${R(w)}x${R(h)}${col}`, R(w), R(h), (c, a, b) => pintaCinta(c, a, b, col)), x, y),
    // una barra (de vida, de progreso): p de 0 a 1
    barra(g, x, y, w, h, p, col, fondo) {
      g.fillStyle = C.tinta; g.fillRect(R(x), R(y), w, h);
      g.fillStyle = fondo || '#4a2a1e'; g.fillRect(R(x) + 2, R(y) + 2, w - 4, h - 4);
      const a = Math.max(0, Math.round((w - 4) * Math.min(1, p)));
      if (a > 0) { g.fillStyle = col; g.fillRect(R(x) + 2, R(y) + 2, a, h - 4); g.fillStyle = tono(col, 0.45); g.fillRect(R(x) + 2, R(y) + 2, a, Math.max(1, Math.floor((h - 4) / 3))); }
    },
    // el pergamino como imagen para las ventanas (CSS): una pieza de 96 x 96 que se estira por sus bordes
    cssPergamino: () => pieza('p96x96', 96, 96, pintaPergamino).toDataURL(),
    // y el papel solo (sin borde), para repetirlo de fondo
    cssPapel: () => pieza('papel', 128, 128, (g, w, h) => {
      g.fillStyle = C.perg; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) { const f = ruido(x, y, 2); if (f > 0.985) { g.fillStyle = C.perg2; g.fillRect(x, y, 4, 2); } else if (f < 0.008) { g.fillStyle = C.crema; g.fillRect(x, y, 2, 2); } }
      for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(179,145,90,0.16)'; g.fillRect(Math.round(ruido(i, 1, 9) * (w - 40)), Math.round(ruido(i, 2, 9) * (h - 12)), 28 + Math.round(ruido(i, 3, 9) * 20), 8); }
    }).toDataURL(),
    // y la tabla de madera, para los carteles de las zonas del menú
    cssTabla: () => pieza('t96x96', 96, 96, pintaTabla).toDataURL(),
    limpia: () => CACHE.clear(),
  };
})();
