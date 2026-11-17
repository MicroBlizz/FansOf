// Fans of Asalto · ADAPTADORES · Las letras: la fuente de píxeles Jersey 10 a su tamaño natural (32, 48, 64 o 96), sin suavizar y con
// un contorno oscuro, para que se lean sobre cualquier fondo. Cada texto se dibuja una vez en un lienzo aparte y se guarda: pintarlo
// después es copiar una imagen. Un texto largo se parte en líneas (parrafo). Los textos pasan por tr() antes de llegar aquí (los
// traduce quien los pide).
'use strict';
AS.texto = (() => {
  const CACHE = new Map(), PARTIDOS = new Map(), TINTA = [34, 20, 14];
  let medidor = null;
  const rgb = hex => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const fuente = t => `${t}px "Jersey 10", monospace`;

  function mascara(g, W, h) {
    const a = g.getImageData(0, 0, W, h).data, m = new Uint8Array(W * h);
    for (let i = 0; i < W * h; i++) m[i] = a[i * 4 + 3] >= 100 ? 1 : 0;
    return m;
  }
  const cerca = (m, W, h, x, y, b) => {
    for (let dy = -b; dy <= b; dy++) for (let dx = -b; dx <= b; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < h && m[yy * W + xx]) return true; }
    return false;
  };
  // la imagen de un texto: sus letras en `col` y, si lleva borde, un contorno de 2 píxeles en tinta
  function imagen(txt, t, col, borde) {
    const clave = txt + '|' + t + '|' + col + '|' + borde;
    let cv = CACHE.get(clave);
    if (cv) return cv;
    if (CACHE.size > 900) CACHE.clear();
    const b = borde ? 2 : 0, pad = b + 1;
    cv = document.createElement('canvas');
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.font = fuente(t);
    const W = Math.max(1, Math.ceil(g.measureText(txt).width) + pad * 2), h = Math.ceil(t * 1.25) + pad * 2;
    cv.width = W; cv.height = h;
    g.font = fuente(t); g.textBaseline = 'middle'; g.fillStyle = '#000'; g.fillText(txt, pad, Math.round(h / 2));
    const m = mascara(g, W, h), d = g.createImageData(W, h), a = d.data, c1 = rgb(col);
    for (let y = 0; y < h; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, c = m[i] ? c1 : (b && cerca(m, W, h, x, y, b) ? TINTA : null);
      if (c) { a[i * 4] = c[0]; a[i * 4 + 1] = c[1]; a[i * 4 + 2] = c[2]; a[i * 4 + 3] = 255; }
    }
    g.putImageData(d, 0, 0);
    CACHE.set(clave, cv);
    return cv;
  }
  // pinta un texto. o: { t: tamaño (32), col: '#ffffff', borde: true, ancla: 'i' | 'c' | 'd' (izquierda, centro, derecha), max: ancho máximo }
  function pinta(g, txt, x, y, o) {
    const op = o || {};
    let t = op.t || 32, im = imagen(String(txt), t, op.col || '#ffffff', op.borde !== false);
    // si no cabe, baja un tamaño (las letras de píxel no se pueden estrechar sin emborronarse)
    while (op.max && im.width > op.max && t > 16) { t = t > 32 ? t - 16 : 16; im = imagen(String(txt), t, op.col || '#ffffff', op.borde !== false); }
    const dx = op.ancla === 'c' ? -im.width / 2 : op.ancla === 'd' ? -im.width : 0;
    g.drawImage(im, Math.round(x + dx), Math.round(y - im.height / 2));
    return im.width;
  }
  const ancho = (txt, t) => imagen(String(txt), t || 32, '#ffffff', true).width;
  function mide(txt, t) {
    if (!medidor) medidor = document.createElement('canvas').getContext('2d');
    medidor.font = fuente(t);
    return Math.ceil(medidor.measureText(txt).width) + 6;
  }
  // parte un texto en las líneas que hagan falta para que quepa en `max` píxeles al tamaño t
  function parte(txt, t, max) {
    const clave = txt + '|' + t + '|' + max;
    let lineas = PARTIDOS.get(clave);
    if (lineas) return lineas;
    if (PARTIDOS.size > 300) PARTIDOS.clear();
    lineas = [];
    let linea = '';
    for (const palabra of String(txt).split(' ')) {
      const prueba = linea ? linea + ' ' + palabra : palabra;
      if (linea && mide(prueba, t) > max) { lineas.push(linea); linea = palabra; } else linea = prueba;
    }
    if (linea) lineas.push(linea);
    PARTIDOS.set(clave, lineas);
    return lineas;
  }
  // pinta un párrafo centrado en (x, y), en las líneas que hagan falta para caber en o.max. Devuelve cuántas líneas ha pintado
  function parrafo(g, txt, x, y, o) {
    const t = o.t || 32, lineas = parte(txt, t, o.max), salto = Math.round(t * 0.82);
    lineas.forEach((l, i) => pinta(g, l, x, y + Math.round((i - (lineas.length - 1) / 2) * salto), { ...o, ancla: 'c', max: 0 }));
    return lineas.length;
  }
  return { pinta, parrafo, parte, ancho, limpia: () => { CACHE.clear(); PARTIDOS.clear(); } };
})();
