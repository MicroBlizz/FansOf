// Fans of Asalto · ADAPTADORES · La mazmorra donde se pelea, pintada por código: el suelo de losas con sus grietas y sus huesos, el muro
// del fondo con antorchas, estandartes de Microblizz, cadenas y telarañas, la empalizada de estacas de la izquierda (lo que defienden
// los héroes) y la oscuridad de la derecha, por donde entran los enemigos. Cada zona tiene su tema: 'sotano' (piedra y musgo),
// 'oficina' (parqué, alfombra roja y retratos del CEO) y 'nube' (metal, circuitos encendidos y armarios de servidores).
// El fondo se pinta una vez por tamaño y se guarda; las llamas, los ojos de la oscuridad y las luces se mueven en cada fotograma.
'use strict';
AS.mazmorra = (() => {
  const T = AS.tema, C = T.C, MURO = 96, CACHE = new Map();
  const TEMAS = {
    sotano:  { suelo: '#5d6382', junta: '#3b3f58', muro: '#4a4f6e', muro2: '#2a2d44', brillo: '#7c84a8', detalle: '#4f9a52', tela: '#2a62c8', luz: [255, 170, 70], llama: ['#ffd23a', '#ff8a2a', '#e8402a'] },
    oficina: { suelo: '#8a5a36', junta: '#4d2f1c', muro: '#3d5a4a', muro2: '#24382e', brillo: '#c8901c', detalle: '#c8901c', tela: '#a8242a', luz: [255, 190, 110], llama: ['#fff3a0', '#ffd23a', '#f08a2a'] },
    nube:    { suelo: '#2c4a56', junta: '#18303a', muro: '#243a4a', muro2: '#142530', brillo: '#3f6a78', detalle: '#3fe0d8', tela: '#1c8a9a', luz: [90, 230, 255], llama: ['#e0ffff', '#6ff0ff', '#2aa8e0'] },
  };
  // dónde van las antorchas del muro (parte del ancho): a la izquierda, del lado de los héroes; la derecha se queda a oscuras
  const ANTORCHAS = [0.13, 0.4, 0.67], ESTANDARTES = [0.265, 0.535];
  const px = (g, col, x, y, w, h) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  // el suelo de la arena dentro de su rectángulo: dónde empieza (bajo el muro) y cuánto mide de alto
  const suelo = h => ({ y0: MURO + 30, alto: h - MURO - 30 - 14 });

  /* ---------- el suelo ---------- */
  function losas(g, w, h, t) {
    const L = 44;
    px(g, t.junta, 0, MURO, w, h - MURO);
    for (let fy = 0, y = MURO; y < h; y += L, fy++) for (let x = (fy % 2 ? -L / 2 : 0); x < w; x += L) {
      const r = T.ruido(x, y, 11), col = T.tono(t.suelo, (r - 0.5) * 0.26);
      px(g, col, x + 2, y + 2, L - 2, L - 2);
      px(g, T.tono(col, 0.2), x + 2, y + 2, L - 2, 2); px(g, T.tono(col, 0.1), x + 2, y + 2, 2, L - 2);
      px(g, T.tono(col, -0.18), x + 2, y + L - 2, L - 2, 2); px(g, T.tono(col, -0.12), x + L - 2, y + 2, 2, L - 2);
      if (r > 0.8) { px(g, t.junta, x + 10 + r * 14, y + 12, 2, 12); px(g, t.junta, x + 12 + r * 14, y + 22, 8, 2); px(g, t.junta, x + 18 + r * 14, y + 24, 2, 6); }   // una grieta
      if (r < 0.14) { px(g, t.detalle, x + 6, y + L - 8, 8, 4); px(g, t.detalle, x + 10, y + L - 12, 4, 4); px(g, T.tono(t.detalle, 0.3), x + 8, y + L - 8, 2, 2); }   // musgo, oro o un circuito
    }
  }
  // manchas de humedad: unas elipses de sombra, siempre en el mismo sitio
  function manchas(g, w, h) {
    const S = suelo(h);
    for (let i = 0; i < 7; i++) {
      const cx = T.ruido(i, 3, 31) * w, cy = S.y0 + T.ruido(i, 7, 32) * S.alto, rx = 26 + T.ruido(i, 1, 33) * 40, ry = rx * 0.4;
      for (let dy = -ry; dy <= ry; dy += 2) { const m = rx * Math.sqrt(1 - (dy / ry) * (dy / ry)); px(g, 'rgba(10,8,24,0.13)', cx - m, cy + dy, Math.round(m * 2), 2); }
    }
  }
  const HUESOS = [[0.66, 0.06], [0.93, 0.5], [0.5, 0.97]], PIEDRAS = [[0.57, 0.3], [0.84, 0.8], [0.4, 0.62], [0.74, 0.03]];
  function calavera(g, x, y) {
    px(g, C.tinta, x - 2, y - 2, 16, 14); px(g, '#d8cfb4', x, y, 12, 8); px(g, '#d8cfb4', x + 2, y + 8, 8, 2); px(g, '#fff3d6', x + 2, y, 6, 2);
    px(g, C.tinta, x + 2, y + 3, 3, 3); px(g, C.tinta, x + 7, y + 3, 3, 3); px(g, C.tinta, x + 5, y + 8, 2, 2);
    px(g, C.tinta, x + 14, y + 6, 14, 6); px(g, '#d8cfb4', x + 16, y + 8, 10, 2); px(g, '#d8cfb4', x + 24, y + 6, 2, 6);   // un hueso al lado
  }
  function piedra(g, x, y, t) { px(g, C.tinta, x - 2, y - 2, 14, 10); px(g, T.tono(t.suelo, -0.35), x, y, 10, 6); px(g, T.tono(t.suelo, 0.25), x, y, 6, 2); }
  function trastos(g, w, h, t, tema) {
    const S = suelo(h);
    for (const [a, b] of PIEDRAS) piedra(g, w * a, S.y0 + S.alto * b, t);
    if (tema === 'sotano') for (const [a, b] of HUESOS) calavera(g, w * a, S.y0 + S.alto * b);
    if (tema === 'oficina') alfombra(g, w, h);
    if (tema === 'nube') for (let y = MURO + 22; y < h; y += 88) { px(g, t.detalle, 0, y, w, 2); for (let x = 30; x < w; x += 120) { px(g, t.detalle, x, y - 20, 2, 20); px(g, '#e0ffff', x - 2, y - 24, 6, 6); } }
  }
  function alfombra(g, w, h) {
    const S = suelo(h), a = Math.round(S.alto * 0.4), y = S.y0 + Math.round((S.alto - a) / 2);
    px(g, '#5a1418', 0, y, w, a); px(g, '#8a1f24', 0, y + 4, w, a - 8); px(g, '#c8901c', 0, y + 8, w, 2); px(g, '#c8901c', 0, y + a - 10, w, 2);
    for (let x = 12; x < w; x += 36) { px(g, '#a8242a', x, y + 16, 12, 2); px(g, '#a8242a', x + 18, y + a - 18, 12, 2); }
  }

  /* ---------- el muro ---------- */
  function ladrillos(g, w, t) {
    px(g, t.muro2, 0, 0, w, MURO);
    for (let fy = 0, y = 6; y < MURO - 14; y += 20, fy++) for (let x = (fy % 2 ? -22 : 0); x < w; x += 44) {
      const r = T.ruido(x, y, 13), col = r < 0.1 ? T.tono(t.detalle, -0.45) : T.tono(t.muro, (r - 0.5) * 0.26);
      px(g, col, x + 2, y, 40, 18); px(g, T.tono(col, 0.24), x + 2, y, 40, 2); px(g, T.tono(col, -0.25), x + 2, y + 16, 40, 2);
      if (r > 0.86) { px(g, t.muro2, x + 12, y + 4, 2, 8); px(g, t.muro2, x + 14, y + 10, 6, 2); }
    }
    for (let i = 0; i < 4; i++) px(g, `rgba(6,4,14,${0.55 - i * 0.13})`, 0, i * 4, w, 4);              // el techo, en sombra
    px(g, C.tinta, 0, MURO - 12, w, 12); px(g, t.brillo, 0, MURO - 12, w, 2); px(g, T.tono(t.muro, -0.2), 0, MURO - 10, w, 4);   // el zócalo
    for (let i = 0; i < 6; i++) px(g, `rgba(6,4,14,${0.34 - i * 0.055})`, 0, MURO + i * 4, w, 4);     // la sombra del muro en el suelo
  }
  const EME = ['X...X', 'XX.XX', 'X.X.X', 'X...X', 'X...X'];
  // un estandarte de Microblizz colgado del muro, con su M
  function estandarte(g, x, col) {
    const a = 34, y = 12;
    px(g, C.tinta, x - a / 2 - 6, y - 4, a + 12, 8); px(g, C.oro2, x - a / 2 - 4, y - 2, a + 8, 4); px(g, C.oro, x - a / 2 - 4, y - 2, a + 8, 1);
    px(g, C.tinta, x - a / 2 - 2, y + 4, a + 4, 44); px(g, col, x - a / 2, y + 4, a, 42);
    for (let i = 0; i < 6; i++) { px(g, C.tinta, x - a / 2 - 2 + i * 3, y + 48 + i * 3, a + 4 - i * 6, 3); px(g, col, x - a / 2 + i * 3, y + 46 + i * 3, a - i * 6, 3); }   // acaba en punta
    px(g, T.tono(col, 0.3), x - a / 2, y + 4, 4, 42); px(g, T.tono(col, -0.3), x + a / 2 - 6, y + 4, 6, 42);
    px(g, C.oro, x - a / 2, y + 6, a, 2);
    EME.forEach((fila, j) => [...fila].forEach((c, i) => { if (c === 'X') { px(g, C.tinta, x - 9 + i * 4, y + 17 + j * 4, 4, 5); px(g, C.oro, x - 10 + i * 4, y + 16 + j * 4, 4, 4); } }));
  }
  function cadena(g, x, largo) {
    for (let y = 0, i = 0; y < largo; y += 6, i++) { if (i % 2) { px(g, C.tinta, x - 2, y, 4, 7); px(g, '#8f96b4', x - 1, y + 1, 2, 5); } else { px(g, C.tinta, x - 4, y + 1, 8, 5); px(g, '#6b7190', x - 3, y + 2, 6, 3); px(g, C.tinta, x - 1, y + 3, 2, 1); } }
    px(g, C.tinta, x - 6, largo, 12, 12); px(g, '#8f96b4', x - 4, largo + 2, 8, 8); px(g, C.tinta, x - 2, largo + 4, 4, 4);   // el grillete
  }
  function telarana(g, x, y, d) {
    g.fillStyle = 'rgba(255,243,214,0.32)';
    for (let i = 0; i < 9; i++) { g.fillRect(x + d * i * 4, y + i * 4, 3, 3); g.fillRect(x + d * i * 5, y + i, 3, 2); g.fillRect(x + d * i, y + i * 5, 2, 3); }
    for (const r of [16, 30]) for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI / 2; g.fillRect(Math.round(x + d * Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 3, 2); }
  }
  function antorcha(g, x) {
    px(g, C.tinta, x - 9, 40, 18, 8); px(g, '#6b7190', x - 7, 42, 14, 4); px(g, '#8f96b4', x - 7, 42, 14, 1);          // el aro de hierro
    px(g, C.tinta, x - 5, 46, 10, 24); px(g, '#8a5a2a', x - 3, 46, 6, 22); px(g, '#b0783a', x - 3, 46, 2, 22);        // el mango
    px(g, C.tinta, x - 7, 36, 14, 6); px(g, C.oro2, x - 5, 38, 10, 2);                                              // el cuenco
  }
  function cuadro(g, x) {   // el retrato del CEO, con su marco de oro
    px(g, C.tinta, x - 22, 12, 44, 52); px(g, C.oro, x - 20, 14, 40, 48); px(g, C.oro2, x - 20, 58, 40, 4); px(g, '#2a4a6a', x - 16, 18, 32, 40);
    px(g, '#f0c8a0', x - 6, 26, 12, 12); px(g, '#22140e', x - 6, 24, 12, 4); px(g, '#22140e', x - 10, 40, 20, 18); px(g, '#fff3d6', x - 2, 40, 4, 8); px(g, '#d8402f', x - 1, 42, 2, 10);
  }
  function armario(g, x) {  // un armario de servidores
    px(g, C.tinta, x, 10, 36, 68); px(g, '#1c2c38', x + 2, 12, 32, 64);
    for (let y = 16; y < 72; y += 8) { px(g, '#0e1820', x + 4, y, 28, 5); px(g, '#2a4656', x + 4, y, 28, 1); }
  }
  function muro(g, w, t, tema) {
    ladrillos(g, w, t);
    if (tema === 'oficina') { px(g, T.tono(t.muro, -0.35), 0, MURO - 34, w, 22); px(g, C.oro2, 0, MURO - 36, w, 2); for (let x = 8; x < w; x += 52) px(g, T.tono(t.muro, -0.5), x, MURO - 30, 40, 14); for (const p of ESTANDARTES) cuadro(g, Math.round(w * p)); }
    else if (tema === 'nube') for (const p of [0.235, 0.3, 0.505, 0.57, 0.78, 0.86]) armario(g, Math.round(w * p) - 18);
    else { for (const p of ESTANDARTES) estandarte(g, Math.round(w * p), t.tela); cadena(g, Math.round(w * 0.8), 34); cadena(g, Math.round(w * 0.9), 20); }
    telarana(g, 22, 2, 1); telarana(g, w - 4, 2, -1);
    for (const p of ANTORCHAS) antorcha(g, Math.round(w * p));
  }

  /* ---------- los bordes ---------- */
  function bordes(g, w, h) {
    // la empalizada de la izquierda: estacas afiladas que apuntan al enemigo, atadas con una cuerda. Es lo que no deben cruzar
    for (let y = MURO - 16, i = 0; y < h; y += 22, i++) {
      const a = 16 + (i % 2) * 4;
      px(g, C.tinta, 0, y, a + 2, 24); px(g, C.madera, 0, y + 2, a, 20); px(g, C.madera3, 0, y + 2, a, 4); px(g, C.madera2, 0, y + 16, a, 6);
      px(g, C.tinta, a + 2, y + 4, 4, 16); px(g, C.madera, a, y + 6, 4, 12); px(g, C.tinta, a + 6, y + 8, 3, 8); px(g, C.madera3, a + 4, y + 10, 3, 4);
      px(g, C.madera2, 4 + (i % 3) * 3, y + 9, 6, 2);
    }
    px(g, C.tinta, 6, MURO - 16, 7, h); px(g, '#c9a66b', 7, MURO - 16, 4, h);
    for (let y = MURO - 8; y < h; y += 22) { px(g, C.tinta, 4, y, 11, 7); px(g, '#e0c48a', 6, y + 2, 7, 3); }
    // la oscuridad de la derecha: de ahí salen
    for (let i = 0; i < 12; i++) px(g, `rgba(4,2,10,${0.7 - i * 0.058})`, w - 8 - i * 8, MURO - 12, 8, h - MURO + 12);
    for (let i = 0; i < 4; i++) px(g, `rgba(4,2,10,${0.4 - i * 0.1})`, 0, h - 4 - i * 4, w, 4);
  }
  function fondo(tema, w, h) {
    const clave = tema + w + 'x' + h;
    let cv = CACHE.get(clave);
    if (cv) return cv;
    if (CACHE.size > 6) CACHE.clear();
    cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d'), t = TEMAS[tema] || TEMAS.sotano;
    losas(g, w, h, t); manchas(g, w, h); trastos(g, w, h, t, tema); muro(g, w, t, tema); bordes(g, w, h);
    CACHE.set(clave, cv);
    return cv;
  }
  function llamas(g, tema, x, y, w, t) {
    const c = (TEMAS[tema] || TEMAS.sotano).llama;
    for (let i = 0; i < ANTORCHAS.length; i++) {
      const fx = x + Math.round(w * ANTORCHAS[i]), fy = y + 38, k = Math.floor(t * 9 + i * 3) % 3, d = (Math.floor(t * 6 + i) % 3) - 1;
      px(g, c[2], fx - 7, fy - 12 - k, 14, 12 + k); px(g, c[2], fx - 5 + d * 2, fy - 18 - k * 2, 8, 8);
      px(g, c[1], fx - 5, fy - 14 - k, 10, 12 + k); px(g, c[1], fx - 3 + d, fy - 20 - k, 4, 6);
      px(g, c[0], fx - 3, fy - 10 - k, 6, 8); px(g, '#fff3d6', fx - 1, fy - 6, 2, 4);
      if ((Math.floor(t * 5 + i * 2) % 4) === 0) px(g, c[0], fx - 8 + ((i * 7 + Math.floor(t * 5)) % 16), fy - 26 - (Math.floor(t * 20) % 10), 2, 2);   // una chispa que sube
    }
  }
  // en la oscuridad de la derecha, ojos rojos que parpadean mientras esperan (n: cuántos pares, según los que vienen)
  function ojos(g, x, y, w, h, t, n) {
    const S = suelo(h);
    for (let i = 0; i < Math.min(7, n); i++) {
      if (Math.floor(t * 1.3 + T.ruido(i, 2, 41) * 9) % 5 === 0) continue;   // parpadea
      const ex = x + w - 12 - T.ruido(i, 4, 42) * 34, ey = y + S.y0 + T.ruido(i, 9, 43) * (S.alto - 20);
      px(g, '#ff5a3a', ex, ey, 3, 3); px(g, '#ff5a3a', ex + 7, ey, 3, 3); px(g, '#ffd0a0', ex + 1, ey, 1, 1); px(g, '#ffd0a0', ex + 8, ey, 1, 1);
    }
  }
  // pinta la mazmorra en el rectángulo de la arena. t: el reloj (para las llamas); acechan: cuántos esperan en la oscuridad
  function pinta(g, tema, x, y, w, h, t, acechan) {
    g.drawImage(fondo(tema, w, h), x, y);
    llamas(g, tema, x, y, w, t);
    if (acechan) ojos(g, x, y, w, h, t, acechan);
    if (tema === 'nube') for (let i = 0; i < 9; i++) if (Math.floor(t * 4 + i * 1.7) % 3) px(g, i % 2 ? '#6ff0ff' : '#7ad84a', x + Math.round(w * [0.235, 0.3, 0.505, 0.57, 0.78, 0.86][i % 6]) - 12 + (i % 3) * 8, y + 18 + (i % 5) * 8, 3, 2);
  }
  // las luces para la capa de luces: las antorchas (con su parpadeo) y el resplandor rojo de la oscuridad de la derecha
  function luces(tema, x, y, w, h, t) {
    const col = (TEMAS[tema] || TEMAS.sotano).luz, S = suelo(h);
    const lista = ANTORCHAS.map((p, i) => ({ x: x + w * p, y: y + 30, r: 210 + Math.sin(t * 9 + i * 2.1) * 12 + Math.sin(t * 23 + i) * 6, col, a: 0.85 + Math.sin(t * 13 + i * 4) * 0.08 }));
    lista.push({ x: x + w + 30, y: y + S.y0 + S.alto / 2, r: 230 + Math.sin(t * 1.7) * 20, col: [255, 60, 40], a: 0.3 + Math.sin(t * 1.7) * 0.06 });
    return lista;
  }
  return { MURO, suelo, pinta, luces };
})();
