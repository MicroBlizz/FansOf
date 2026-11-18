// Fans of Pop · BANDEJA: la silicona de los tableros con forma (Daniel, 30-10-2026, con el pop-it de concha de su hija): en vez
// de la bandeja cuadrada de Yoshi, el borde sigue la forma del tablero (concha, corazón, cucurucho…) y cada fila lleva su franja
// de color pastel, como el juguete de verdad. Se dibuja por código una vez por tablero y se guarda en un lienzo aparte.
// Aquí va también lo que llevan encima las burbujas especiales de los mundos 3 a 6 (hielo, concha y cereza).
'use strict';
// LAS BANDEJAS BONITAS (Daniel, 30-10-2026, «cosas bonitas» con monedas): solo cambian el color de la silicona, no ayudan a ganar.
// `filas`: el color [tono, saturación, luz] de cada franja (se repiten). La arcoíris es la de siempre (gratis); la dorada solo
// la da el pase. Con una que no sea la arcoíris, también los tableros cuadrados usan esta bandeja dibujada.
const PP_BANDEJAS = [
  { id: 'arcoiris', nombre: 'Arcoíris', precio: 0, filas: null },
  { id: 'fresa', nombre: 'Fresa', precio: 300, filas: [[345, 85, 72], [330, 80, 80]] },
  { id: 'menta', nombre: 'Menta', precio: 300, filas: [[150, 60, 70], [170, 55, 78]] },
  { id: 'cielo', nombre: 'Cielo', precio: 400, filas: [[200, 85, 72], [215, 80, 80]] },
  { id: 'caramelo', nombre: 'Caramelo', precio: 500, filas: [[40, 95, 68], [25, 95, 72], [50, 95, 74]] },
  { id: 'lavanda', nombre: 'Lavanda', precio: 600, filas: [[270, 60, 76], [290, 55, 82]] },
  { id: 'chuche', nombre: 'Chuche', precio: 800, filas: [[345, 85, 72], [195, 85, 72], [52, 95, 70], [130, 65, 70]] },
  { id: 'dorada', nombre: 'Dorada', precio: null, filas: [[45, 95, 62], [40, 90, 72]] },   // solo con el pase
];
const ppBandejaDe = id => PP_BANDEJAS.find(b => b.id === id) || PP_BANDEJAS[0];
const ppBandejaActual = () => ppBandejaDe(SAVE.bandeja || 'arcoiris');
const ppTieneBandeja = id => id === 'arcoiris' || !!(SAVE.bandejas && SAVE.bandejas[id]);
// el color de la franja y de la fila de la bandeja que llevas puesta
function ppColorFranja(y) { const B = ppBandejaActual(); const [h, s, l] = B.filas ? B.filas[y % B.filas.length] : PP_FILAS[y % PP_FILAS.length]; return `hsl(${h} ${s}% ${Math.min(94, l + (B.filas ? 0 : 20))}%)`; }
// una muestra pequeña en HTML (las franjas de colores)
function ppBandejaMuestra(id, px = 30) {
  const B = ppBandejaDe(id), f = B.filas || PP_FILAS.map(([h, s, l]) => [h, s, Math.min(94, l + 20)]);
  return `<span class="pp-muestra" style="width:${px}px;height:${px}px;background:linear-gradient(${f.map(([h, s, l], k) => `hsl(${h} ${s}% ${l}%) ${k * 100 / f.length}% ${(k + 1) * 100 / f.length}%`).join(',')})"></span>`;
}
function ppBandeja(c, T, g) {
  const clave = T.n + ':' + Array.from(T.mask).join('') + ':' + (PP_LISO ? 1 : 0) + ':' + ppBandejaActual().id;
  if (!T._bandeja || T._bandeja.clave !== clave) T._bandeja = { clave, cv: ppHazBandeja(T, g) };
  const m = 40;
  c.imageSmoothingEnabled = true; c.drawImage(T._bandeja.cv, g.x - m, g.y - m, g.lado + m * 2, g.lado + m * 2);
}
function ppHazBandeja(T, g) {
  const m = 40, esc = 2, n = T.n, cs = g.celda, W = (g.lado + m * 2) * esc;
  const lienzo = () => { const cv = document.createElement('canvas'); cv.width = W; cv.height = W; const c = cv.getContext('2d'); c.scale(esc, esc); c.translate(m, m); return [cv, c]; };
  // la mancha de silicona: un círculo por burbuja y un puente entre vecinas (y el hueco entre cuatro), del radio r
  const mancha = (c, r, color) => {
    c.fillStyle = color;
    for (let i = 0; i < n * n; i++) {
      if (!T.mask[i]) continue;
      const x = (i % n) * cs + cs / 2, y = Math.floor(i / n) * cs + cs / 2, der = i % n < n - 1 && T.mask[i + 1], aba = i + n < n * n && T.mask[i + n];
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      if (der) c.fillRect(x, y - r, cs, r * 2);
      if (aba) c.fillRect(x - r, y, r * 2, cs);
      if (der && aba && T.mask[i + n + 1]) c.fillRect(x, y, cs, cs);
    }
  };
  const [cv, c] = lienzo();
  c.save(); c.translate(0, 7); mancha(c, cs * 0.68, 'rgba(122,58,122,0.35)'); c.restore();   // sombra
  mancha(c, cs * 0.68, '#7a4a8a');                                                             // borde
  // el relleno: la franja de cada fila (el tono de sus burbujas, más claro), recortado a la forma con una máscara
  const [mascara, mk] = lienzo(); mancha(mk, cs * 0.6, '#000');
  const [franjas, fr] = lienzo();
  for (let y = 0; y < n; y++) {
    const y0 = y ? y * cs : -m, y1 = y === n - 1 ? g.lado + m : (y + 1) * cs;
    fr.fillStyle = ppColorFranja(y); fr.fillRect(-m, y0, g.lado + m * 2, y1 - y0);
    if (y) { fr.fillStyle = 'rgba(122,74,138,0.25)'; fr.fillRect(-m, y * cs - 1, g.lado + m * 2, 2); }   // la rayita entre franjas, como el molde
  }
  const luz = fr.createLinearGradient(0, -m, 0, g.lado / 2); luz.addColorStop(0, 'rgba(255,255,255,0.35)'); luz.addColorStop(1, 'rgba(255,255,255,0)');
  fr.fillStyle = luz; fr.fillRect(-m, -m, g.lado + m * 2, g.lado / 2 + m);   // brillo de silicona arriba
  fr.setTransform(1, 0, 0, 1, 0, 0); fr.globalCompositeOperation = 'destination-in'; fr.drawImage(mascara, 0, 0);
  c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(franjas, 0, 0);
  return cv;
}
// lo que llevan encima las burbujas especiales de los mundos 3 a 6 (Yoshi: i-copo, i-concha, i-cereza; si aún no están, un
// repuesto dibujado): HIELO = escarcha azul con un copo; CONCHA = una concha; TRIPLE = una cereza sobre la nata
function ppEspecial(c, cx, cy, r, i, T, t) {
  const [, , h] = ppAnim(i, T.up[i]), y = cy - 4 * h, e = T.esp ? T.esp[i] : 0;
  c.save();
  if (e === 1) {
    c.globalAlpha = 0.5; c.fillStyle = '#d8f4ff'; c.beginPath(); c.arc(cx, y, r * 0.98, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1; c.lineWidth = 4; c.strokeStyle = '#8fd8ff'; c.stroke();
    for (let k = 0; k < 3; k++) { const a = t * 1.5 + k * 2.1; c.fillStyle = '#fff'; c.beginPath(); c.arc(cx + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, 3, 0, Math.PI * 2); c.fill(); }
    ppIconoEsp(c, 'i-copo', cx, y, r * 1.05, '#bfe9ff');
  } else if (e === 2) ppIconoEsp(c, 'i-concha', cx, y + r * 0.05, r * 1.25, '#ffc9a8');
  else if (e === 3) ppIconoEsp(c, 'i-cohete', cx, y, r * 1.15, '#ff9ccf');     // cohete: su fila
  else if (e === 4) ppIconoEsp(c, 'i-burbujas', cx, y, r * 1.15, '#bfe9ff');   // burbujeante: un 3x3
  else if (e === 5) ppIconoEsp(c, 'i-petalo', cx, y, r * 1.15, '#ffc4e6');     // pétalo: su columna
  if (T.up[i] === 3) ppIconoEsp(c, 'i-cereza', cx, y - r * 0.55, r * 0.75, '#ff4a6a');
  c.restore();
}
function ppIconoEsp(c, k, x, y, s, col) {
  if (PP_IMG[k]) { ppDibujaEn(c, k, x, y, s, true); return; }
  c.beginPath(); c.arc(x, y, s * 0.3, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a1030'; c.stroke();
}
