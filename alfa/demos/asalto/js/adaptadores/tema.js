// Fans of Asalto · ADAPTADORES · El tema medieval, pintado por código y en un solo sitio: los colores del juego y las piezas con las que
// se arma la pantalla. Cada material tiene su trabajo: PIEDRA Y HIERRO en los marcos y en las casillas (el Altar, el marcador, los
// carteles de las zonas), PERGAMINO con su sello de lacre en las ventanas, y CINTAS y ESCUDOS en los títulos y en las clases. Los
// botones son gordos, de color y con remaches. Cada pieza se dibuja una vez a su tamaño en un lienzo aparte y se guarda; después solo se
// copia. Todo a píxel entero, sin suavizar. Las ventanas (CSS) reciben las mismas piezas como imágenes: css().
'use strict';
AS.tema = (() => {
  const C = { tinta: '#22140e', perg: '#ecd9a6', perg2: '#d8bf86', perg3: '#b3915a', madera: '#7c4b2a', madera2: '#55301a', madera3: '#a06a3c', oro: '#ffd23a', oro2: '#c8901c',
    piedra: '#dccfa8', piedra2: '#b9a77c', rojo: '#d8402f', naranja: '#f08a2a', verde: '#57b947', azul: '#3f8ae8', celeste: '#8fd0f8', noche: '#141026', crema: '#fff3d6', sangre: '#8a1f24',
    muro: '#786b5a', muro2: '#4c4338', muro3: '#9a8c76', hierro: '#39404f', hierro2: '#1e222c', hierro3: '#7a869e', lacre: '#c22a2a' };
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
  // un remache: de oro en los marcos, de hierro en los botones
  function remache(g, x, y, col) {
    g.fillStyle = C.tinta; g.fillRect(x - 1, y - 1, 8, 8);
    g.fillStyle = col; g.fillRect(x, y, 6, 6);
    g.fillStyle = tono(col, 0.6); g.fillRect(x + 1, y + 1, 2, 2);
    g.fillStyle = tono(col, -0.35); g.fillRect(x + 3, y + 4, 3, 2);
  }
  // los sillares de un muro: hiladas de 16 con las juntas al tresbolillo (cada 36) y la piedra picada; casa consigo mismo cada 72 x 32
  function sillares(g, x0, y0, w, h) {
    for (let y = 0, f = 0; y < h; y += 16, f++) {
      g.fillStyle = C.muro3; g.fillRect(x0, y0 + y, w, 1);
      g.fillStyle = C.muro2; g.fillRect(x0, y0 + y + 14, w, Math.min(2, h - y - 14));
      for (let x = (f % 2 ? 22 : 4); x < w - 2; x += 36) g.fillRect(x0 + x, y0 + y, 2, Math.min(14, h - y));
    }
    for (let y = 2; y < h - 2; y += 3) for (let x = 6; x < w - 6; x += 3) { const r = ruido(x % 72, y % 32, 5); if (r > 0.95) { g.fillStyle = C.muro2; g.fillRect(x0 + x, y0 + y, 3, 1); } else if (r < 0.03) { g.fillStyle = C.muro3; g.fillRect(x0 + x, y0 + y, 2, 1); } }
  }
  // el marco de piedra y hierro: sillares con sus juntas, una pletina de hierro arriba y abajo y una escuadra remachada en cada esquina
  function pintaMarco(g, w, h) {
    chafl(g, 0, 0, w, h, 3, C.tinta); chafl(g, 2, 2, w - 4, h - 4, 2, C.muro);
    sillares(g, 3, 6, w - 6, h - 12);
    for (const y of [2, h - 7]) { g.fillStyle = C.hierro; g.fillRect(3, y, w - 6, 5); g.fillStyle = C.hierro3; g.fillRect(3, y, w - 6, 1); g.fillStyle = C.hierro2; g.fillRect(3, y + 4, w - 6, 1); }
    for (const [x, y, dx, dy] of [[2, 2, 1, 1], [w - 2, 2, -1, 1], [2, h - 2, 1, -1], [w - 2, h - 2, -1, -1]]) {   // las escuadras
      g.fillStyle = C.hierro; g.fillRect(Math.min(x, x + dx * 18), Math.min(y, y + dy * 12), 18, 12); g.fillRect(Math.min(x, x + dx * 12), Math.min(y, y + dy * 18), 12, 18);
      g.fillStyle = C.hierro3; g.fillRect(Math.min(x, x + dx * 18), dy > 0 ? y : y - 12, 18, 1);
      remache(g, dx > 0 ? x + 3 : x - 9, dy > 0 ? y + 3 : y - 9, C.oro);
    }
  }
  function pintaLosa(g, w, h, col) {
    chafl(g, 0, 0, w, h, 3, C.tinta); chafl(g, 2, 2, w - 4, h - 4, 2, col);
    g.fillStyle = tono(col, 0.45); g.fillRect(4, 3, w - 8, 3); g.fillRect(3, 4, 3, h - 8);
    g.fillStyle = tono(col, -0.25); g.fillRect(4, h - 6, w - 8, 3); g.fillRect(w - 6, 4, 3, h - 8);
    for (let y = 8; y < h - 8; y += 3) for (let x = 8; x < w - 8; x += 3) if (ruido(x, y, 7) > 0.93) { g.fillStyle = tono(col, -0.14); g.fillRect(x, y, 3, 2); }
    if (w >= 56 && h >= 56) labra(g, w, h, col);
  }
  // una casilla (las losas grandes): un filete labrado por dentro y un clavo de hierro en cada esquina
  function labra(g, w, h, col) {
    g.fillStyle = tono(col, -0.3); g.fillRect(8, 8, w - 16, 2); g.fillRect(8, 8, 2, h - 16);
    g.fillStyle = tono(col, 0.5); g.fillRect(8, h - 10, w - 16, 2); g.fillRect(w - 10, 8, 2, h - 16);
    for (const [x, y] of [[5, 5], [w - 9, 5], [5, h - 9], [w - 9, h - 9]]) { g.fillStyle = C.hierro2; g.fillRect(x, y, 4, 4); g.fillStyle = C.hierro3; g.fillRect(x, y, 2, 2); }
  }
  // un barrote de hierro (de pie o tumbado, según sus medidas) con un remache cada tanto: la reja del Altar
  function pintaBarrote(g, w, h) {
    const largo = Math.max(w, h), grueso = Math.min(w, h);
    if (h > w) g.transform(0, 1, 1, 0, 0, 0);   // de pie: se pinta tumbado, con los ejes cambiados
    g.fillStyle = C.hierro2; g.fillRect(0, 0, largo, grueso);
    g.fillStyle = C.hierro; g.fillRect(0, 1, largo, grueso - 2);
    g.fillStyle = C.hierro3; g.fillRect(0, 1, largo, 1);
    for (let i = 10; i < largo - 6; i += 30) { g.fillStyle = C.oro2; g.fillRect(i, 1, 4, grueso - 2); g.fillStyle = C.oro; g.fillRect(i, 1, 2, 2); }
  }
  // un escudo de armas: recto arriba y en punta abajo, con la mitad derecha en sombra
  function pintaEscudo(g, w, h, col) {
    const medio = w / 2, recto = Math.round(h * 0.45);
    const ancho = (y, m) => Math.max(0, Math.round((y < recto ? medio : medio * Math.sqrt(Math.max(0, 1 - ((y - recto) / (h - recto)) ** 2))) - m));
    for (let y = 0; y < h; y++) { const a = ancho(y, 0); g.fillStyle = C.tinta; g.fillRect(Math.round(medio) - a, y, a * 2, 1); }
    for (let y = 2; y < h - 3; y++) {
      const a = ancho(y + 2, 3);
      g.fillStyle = col; g.fillRect(Math.round(medio) - a, y, a, 1);
      g.fillStyle = tono(col, -0.25); g.fillRect(Math.round(medio), y, a, 1);
    }
    g.fillStyle = tono(col, 0.5); g.fillRect(4, 3, w - 8, 2);
  }
  // el sello de lacre de las ventanas: una gota de cera roja con su borde, su aro y una espada grabada
  function pintaSello(g, w) {
    const c = w / 2, r = c - 2;
    elipse(g, c, c + 2, r, r, 'rgba(10,6,4,0.45)'); elipse(g, c, c, r, r, C.tinta); elipse(g, c, c, r - 2, r - 2, tono(C.lacre, -0.3)); elipse(g, c, c - 1, r - 4, r - 4, C.lacre);
    for (let i = 0; i < 9; i++) { const a = i * 0.7, x = Math.round(c + Math.cos(a) * (r - 1)) - 3, y = Math.round(c + Math.sin(a) * (r - 1)) - 3; if (ruido(i, 4, 6) > 0.4) { g.fillStyle = C.tinta; g.fillRect(x - 1, y - 1, 8, 8); g.fillStyle = tono(C.lacre, -0.3); g.fillRect(x, y, 6, 6); } }
    elipse(g, c, c - 1, r - 8, r - 8, tono(C.lacre, -0.3)); elipse(g, c, c - 1, r - 10, r - 10, C.lacre);
    g.fillStyle = tono(C.lacre, 0.55); g.fillRect(c - 1, c - 10, 2, 16); g.fillRect(c - 5, c + 1, 10, 2); g.fillRect(c - 2, c + 6, 4, 2);
    g.fillStyle = tono(C.lacre, 0.4); g.fillRect(c - 9, c - 9, 4, 2); g.fillRect(c - 11, c - 7, 2, 3);
  }
  function pintaBoton(g, w, h, col, hundido) {
    const y0 = hundido ? 3 : 0, a = h - 5;
    if (!hundido) chafl(g, 1, 5, w - 2, a, 4, 'rgba(10,6,4,0.55)');
    chafl(g, 0, y0, w, a, 4, C.tinta); chafl(g, 2, y0 + 2, w - 4, a - 4, 3, tono(col, -0.3)); chafl(g, 2, y0 + 2, w - 4, a - 9, 3, col);
    g.fillStyle = tono(col, 0.5); g.fillRect(6, y0 + 3, w - 12, 2);
    g.fillStyle = tono(col, 0.75); g.fillRect(7, y0 + 6, 5, 2); g.fillRect(7, y0 + 8, 2, 3);
    if (w >= 90 && h >= 44) for (const [x, y] of [[w - 12, y0 + 6], [6, y0 + a - 14], [w - 12, y0 + a - 14]]) { g.fillStyle = tono(col, -0.55); g.fillRect(x, y, 5, 5); g.fillStyle = tono(col, 0.6); g.fillRect(x, y, 2, 2); }
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
  function pintaPapel(g, w, h) {
    g.fillStyle = C.perg; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) { const f = ruido(x, y, 2); if (f > 0.985) { g.fillStyle = C.perg2; g.fillRect(x, y, 4, 2); } else if (f < 0.008) { g.fillStyle = C.crema; g.fillRect(x, y, 2, 2); } }
    for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(179,145,90,0.16)'; g.fillRect(Math.round(ruido(i, 1, 9) * (w - 40)), Math.round(ruido(i, 2, 9) * (h - 12)), 28 + Math.round(ruido(i, 3, 9) * 20), 8); }
  }
  const pon = (g, cv, x, y) => { g.drawImage(cv, Math.round(x), Math.round(y)); };
  const R = Math.round;
  return {
    C, tono, ruido, chafl, elipse,
    pergamino: (g, x, y, w, h) => pon(g, pieza(`p${R(w)}x${R(h)}`, R(w), R(h), pintaPergamino), x, y),
    marco: (g, x, y, w, h) => pon(g, pieza(`m${R(w)}x${R(h)}`, R(w), R(h), pintaMarco), x, y),
    barrote: (g, x, y, w, h) => pon(g, pieza(`r${R(w)}x${R(h)}`, R(w), R(h), pintaBarrote), x, y),
    escudo: (g, x, y, w, h, col) => pon(g, pieza(`e${R(w)}x${R(h)}${col}`, R(w), R(h), (c, a, b) => pintaEscudo(c, a, b, col)), x, y),
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
    // las piezas como imágenes para las ventanas y el menú (CSS): { '--as-perg': 'url(…)'… }. El pergamino y el marco se estiran por sus
    // bordes; el papel y el muro se repiten de fondo; las cintas son los títulos y las fichas de dificultad; el sello va colgado del título
    css() {
      const url = cv => `url(${cv.toDataURL()})`, cinta = col => url(pieza('c96x46' + col, 96, 46, (g, w, h) => pintaCinta(g, w, h, col)));
      return { '--as-perg': url(pieza('p96x96', 96, 96, pintaPergamino)), '--as-papel': url(pieza('papel', 128, 128, pintaPapel)), '--as-marco': url(pieza('m96x96', 96, 96, pintaMarco)), '--as-muro': url(pieza('muro', 72, 32, (g, w, h) => { g.fillStyle = C.muro; g.fillRect(0, 0, w, h); sillares(g, 0, 0, w, h); })),
        '--as-sello': url(pieza('sello', 44, 46, g => pintaSello(g, 44))), '--as-cinta': cinta(C.sangre), '--as-cinta-d0': cinta(C.verde), '--as-cinta-d1': cinta(C.naranja), '--as-cinta-d2': cinta(C.rojo), '--as-cinta-no': cinta(C.madera) };
    },
    limpia: () => CACHE.clear(),
  };
})();
