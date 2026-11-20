// Fans of Pop · BANDEJA: la silicona de los tableros con forma (Daniel, 30-10-2026, con el pop-it de concha de su hija): en vez
// de la bandeja cuadrada de Yoshi, el borde sigue la forma del tablero (concha, corazón, cucurucho…) y cada fila lleva su franja
// de color pastel, como el juguete de verdad. Se dibuja por código una vez por tablero y se guarda en un lienzo aparte.
// Con el estilo de un mundo que trae material (tarea #110: la Pastelería), la bandeja de siempre pasa a ser una galleta de mantequilla.
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
  // las de temporada: solo con el Pase dorado de su mes (js/pase-temas.js, tarea #165); en la tienda salen solo si la tienes
  { id: 'escarcha', nombre: 'Escarcha', precio: null, temporada: true, filas: [[200, 90, 82], [190, 70, 88]] },
  { id: 'corazones', nombre: 'Corazones', precio: null, temporada: true, filas: [[340, 90, 78], [350, 85, 84]] },
  { id: 'brote', nombre: 'Brote', precio: null, temporada: true, filas: [[120, 60, 74], [95, 70, 78]] },
  { id: 'charco', nombre: 'Charco', precio: null, temporada: true, filas: [[205, 85, 70], [185, 75, 78]] },
  { id: 'petalo', nombre: 'Pétalo', precio: null, temporada: true, filas: [[325, 90, 82], [55, 95, 80]] },
  { id: 'helado', nombre: 'Helado', precio: null, temporada: true, filas: [[48, 95, 80], [340, 85, 84], [160, 60, 80]] },
  { id: 'ola', nombre: 'Ola', precio: null, temporada: true, filas: [[175, 70, 68], [190, 80, 78]] },
  { id: 'farolillo', nombre: 'Farolillo', precio: null, temporada: true, filas: [[30, 95, 66], [5, 85, 72]] },
  { id: 'pupitre', nombre: 'Pupitre', precio: null, temporada: true, filas: [[45, 90, 72], [30, 60, 66]] },
  { id: 'hojas', nombre: 'Hojas', precio: null, temporada: true, filas: [[25, 85, 64], [40, 90, 70], [10, 75, 66]] },
  { id: 'calabaza', nombre: 'Calabaza', precio: null, temporada: true, filas: [[28, 95, 62], [100, 45, 60]] },
  { id: 'nieve', nombre: 'Nieve', precio: null, temporada: true, filas: [[0, 80, 66], [140, 55, 62], [200, 30, 92]] },
  // las DE LUJO (tarea #187): con euros, a precio fijo y sin azar; solo estética. `euros` es lo que se enseña y `producto`, el
  // producto de la tienda (PROVISIONALES, como los packs: aún no existen en Play ni en el servidor). `lujo`: el reflejo nacarado.
  { id: 'nacar', nombre: 'Nácar', precio: null, euros: '1,99 €', producto: 'pop_bandeja_nacar', lujo: true, filas: [[20, 85, 90], [180, 60, 88], [340, 75, 90]] },
  { id: 'galaxia', nombre: 'Galaxia', precio: null, euros: '1,99 €', producto: 'pop_bandeja_galaxia', lujo: true, filas: [[220, 75, 42], [195, 85, 50], [230, 65, 34]] },
  { id: 'aurora', nombre: 'Aurora', precio: null, euros: '1,99 €', producto: 'pop_bandeja_aurora', lujo: true, filas: [[150, 70, 60], [175, 75, 62], [335, 80, 72]] },
];
const ppBandejaDe = id => PP_BANDEJAS.find(b => b.id === id) || PP_BANDEJAS[0];
const ppBandejaActual = () => ppBandejaDe(SAVE.bandeja || 'arcoiris');
const ppTieneBandeja = id => id === 'arcoiris' || !!(SAVE.bandejas && SAVE.bandejas[id]);
// el color de la franja y de la fila de la bandeja que llevas puesta
function ppColorFranja(y) { const B = ppBandejaActual(); const [h, s, l] = B.filas ? B.filas[y % B.filas.length] : PP_FILAS[y % PP_FILAS.length]; return `hsl(${h} ${s}% ${Math.min(94, l + (B.filas ? 0 : 20))}%)`; }
// una muestra pequeña en HTML (las franjas de colores)
function ppBandejaMuestra(id, px = 30) {
  const B = ppBandejaDe(id), f = B.filas || PP_FILAS.map(([h, s, l]) => [h, s, Math.min(94, l + 20)]);
  const reflejo = B.lujo ? `${PP_REFLEJO_CSS},` : '';
  return `<span class="pp-muestra" style="width:${px}px;height:${px}px;background:${reflejo}linear-gradient(${f.map(([h, s, l], k) => `hsl(${h} ${s}% ${l}%) ${k * 100 / f.length}% ${(k + 1) * 100 / f.length}%`).join(',')})"></span>`;
}
// el reflejo nacarado de las bandejas de lujo: unas franjas de luz en diagonal (en la muestra y sobre la silicona)
const PP_REFLEJO_CSS = 'linear-gradient(135deg,rgba(255,255,255,0) 30%,rgba(255,255,255,0.55) 45%,rgba(255,255,255,0) 60%)';
function ppBandejaReflejo(rl, g, m) {
  const W = g.lado + m * 2, luz = rl.createLinearGradient(-m, -m, g.lado + m, g.lado + m);
  for (const [k, a] of [[0, 0], [0.3, 0], [0.42, 0.45], [0.5, 0.15], [0.62, 0.4], [0.75, 0], [1, 0]]) luz.addColorStop(k, `rgba(255,255,255,${a})`);
  rl.fillStyle = luz; rl.fillRect(-m, -m, W, W);
}
// `material` (opcional, el del estilo del mundo: la galleta de la Pastelería) cambia la silicona de franjas por una pieza de galleta
// `relieve` (opcional, del estilo del mundo: el botón del Jardín) le da volumen de molde de silicona (js/bandeja-relieve.js)
function ppBandeja(c, T, g, material, relieve = false) {
  const clave = T.n + ':' + Array.from(T.mask).join('') + ':' + (PP_LISO ? 1 : 0) + ':' + (material ? 'material:' + material.relleno : ppBandejaActual().id) + (relieve ? ':relieve' : '');
  if (!T._bandeja || T._bandeja.clave !== clave) T._bandeja = { clave, cv: ppHazBandeja(T, g, material, relieve) };
  const m = 40;
  c.imageSmoothingEnabled = true; c.drawImage(T._bandeja.cv, g.x - m, g.y - m, g.lado + m * 2, g.lado + m * 2);
}
// un lienzo aparte del tamaño de la bandeja (con su margen m), a escala esc y con el origen en la esquina del tablero
function ppBandejaLienzo(g, m, esc) {
  const W = (g.lado + m * 2) * esc, cv = document.createElement('canvas'); cv.width = W; cv.height = W;
  const c = cv.getContext('2d'); c.scale(esc, esc); c.translate(m, m); return [cv, c];
}
// la mancha que sigue la forma: un círculo por burbuja y un puente entre vecinas (y el hueco entre cuatro), del radio r
function ppBandejaMancha(c, T, cs, r, color) {
  const n = T.n; c.fillStyle = color;
  for (let i = 0; i < n * n; i++) {
    if (!T.mask[i]) continue;
    const x = (i % n) * cs + cs / 2, y = Math.floor(i / n) * cs + cs / 2, der = i % n < n - 1 && T.mask[i + 1], aba = i + n < n * n && T.mask[i + n];
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    if (der) c.fillRect(x, y - r, cs, r * 2);
    if (aba) c.fillRect(x - r, y, r * 2, cs);
    if (der && aba && T.mask[i + n + 1]) c.fillRect(x, y, cs, cs);
  }
}
function ppHazBandeja(T, g, material, relieve = false) {
  const m = 40, esc = 2, cs = g.celda;
  const [cv, c] = ppBandejaLienzo(g, m, esc);
  c.save(); c.translate(0, 7);   // sombra (semitransparente)
  if (material) { c.globalAlpha = 0.4; ppBandejaMancha(c, T, cs, cs * 0.68, material.sombra); } else ppBandejaMancha(c, T, cs, cs * 0.68, 'rgba(122,58,122,0.35)');
  c.restore();
  ppBandejaMancha(c, T, cs, cs * 0.68, material ? material.borde : '#7a4a8a');   // borde
  if (relieve) ppBandejaCanto(c, T, cs);   // el canto del molde: grueso por abajo y con luz por arriba
  // el relleno, recortado a la forma con una máscara: la franja de cada fila o la pieza de galleta
  const [mascara, mk] = ppBandejaLienzo(g, m, esc); ppBandejaMancha(mk, T, cs, cs * 0.6, '#000');
  const [relleno, rl] = ppBandejaLienzo(g, m, esc);
  if (material) ppBandejaGalleta(rl, T, g, m, material); else ppBandejaFranjas(rl, T, g, m);
  if (!material && ppBandejaActual().lujo) ppBandejaReflejo(rl, g, m);   // el nacarado de las de lujo
  const luz = rl.createLinearGradient(0, -m, 0, g.lado / 2); luz.addColorStop(0, 'rgba(255,255,255,0.35)'); luz.addColorStop(1, 'rgba(255,255,255,0)');
  rl.fillStyle = luz; rl.fillRect(-m, -m, g.lado + m * 2, g.lado / 2 + m);   // brillo arriba
  rl.setTransform(1, 0, 0, 1, 0, 0); rl.globalCompositeOperation = 'destination-in'; rl.drawImage(mascara, 0, 0);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(relleno, 0, 0); c.restore();
  if (relieve) ppBandejaAsientos(c, T, cs);   // el asiento hundido de cada botón
  return cv;
}
// la silicona de siempre: la franja de cada fila (el tono de sus burbujas, más claro) con una rayita entre franjas, como el molde
function ppBandejaFranjas(fr, T, g, m) {
  const n = T.n, cs = g.celda;
  for (let y = 0; y < n; y++) {
    const y0 = y ? y * cs : -m, y1 = y === n - 1 ? g.lado + m : (y + 1) * cs;
    fr.fillStyle = ppColorFranja(y); fr.fillRect(-m, y0, g.lado + m * 2, y1 - y0);
    if (y) { fr.fillStyle = 'rgba(122,74,138,0.25)'; fr.fillRect(-m, y * cs - 1, g.lado + m * 2, 2); }
  }
}
// la galleta de mantequilla: una sola pieza del color del material, un poco más tostada hacia el borde, y una fila de puntitos
// horneados siguiendo el borde por dentro (en cada lado de una burbuja que no tiene vecina)
function ppBandejaGalleta(gl, T, g, m, material) {
  const cs = g.celda;
  gl.fillStyle = material.relleno; gl.fillRect(-m, -m, g.lado + m * 2, g.lado + m * 2);
  gl.save(); gl.globalAlpha = 0.18; ppBandejaMancha(gl, T, cs, cs * 0.6, material.borde); gl.globalAlpha = 1;
  ppBandejaMancha(gl, T, cs, cs * 0.5, material.relleno); gl.restore();   // el tostado: el borde de la pieza, algo más oscuro
  for (let i = 0; i < T.n * T.n; i++) if (T.mask[i]) ppBandejaPuntitos(gl, T, i, cs, material);
}
// los puntitos de un lado de la burbuja i sin vecina (o en el borde del tablero): tres por lado, hundidos (oscuro con un brillo debajo)
function ppBandejaPuntitos(gl, T, i, cs, material) {
  const n = T.n, x = (i % n), y = Math.floor(i / n), cx = x * cs + cs / 2, cy = y * cs + cs / 2, d = cs * 0.5, rp = Math.max(1.5, cs * 0.035);
  const lados = [[0, -1, y > 0], [0, 1, y < n - 1], [-1, 0, x > 0], [1, 0, x < n - 1]];
  for (const [dx, dy, dentro] of lados) {
    if (dentro && T.mask[i + dx + dy * n]) continue;   // tiene vecina: ese lado no es borde
    for (const k of [-1, 0, 1]) {
      const px = cx + dx * d + (dy ? k * cs / 3 : 0), py = cy + dy * d + (dx ? k * cs / 3 : 0);
      gl.fillStyle = material.adorno; gl.beginPath(); gl.arc(px, py + rp * 0.6, rp, 0, Math.PI * 2); gl.fill();
      gl.fillStyle = material.borde; gl.globalAlpha = 0.6; gl.beginPath(); gl.arc(px, py, rp, 0, Math.PI * 2); gl.fill(); gl.globalAlpha = 1;
    }
  }
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
