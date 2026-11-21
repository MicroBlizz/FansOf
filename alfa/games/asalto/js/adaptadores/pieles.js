// Fans of Asalto · ADAPTADORES · Los aspectos de héroe de la tienda (ADR 200), con dibujo PROVISIONAL por código hasta que Yoshi dibuje los de
// verdad (tarea #315): el dibujo del héroe recoloreado (giro de matiz, saturación y luz de ASALTO.aspectos[id].tinte) y un adorno de píxeles encima
// de la cabeza (contorno grueso oscuro, como el resto del juego). Solo se pinta: ninguna cifra del combate depende de esto.
// El recoloreado de cada tira se hace una vez y se guarda. AS.pieles.de(tipo) dice qué aspecto lleva un tipo de héroe (lo pone principal.js con los casos).
'use strict';
AS.pieles = (() => {
  const CACHE = {};
  let quien = () => null;
  const contorno = '#2a1a14';
  // los adornos: rectángulos [x, y, ancho, alto, color] en unidades de píxel, con (0, 0) en el centro de lo alto de la cabeza y la y hacia abajo
  const ORO = '#ffd23a', BLANCO = '#fff6ea';
  const ADORNOS = {
    corona: [[-3, -2, 6, 2, ORO], [-3, -4, 1, 2, ORO], [-1, -5, 2, 3, ORO], [2, -4, 1, 2, ORO], [-1, -2, 2, 1, '#e8392c']],
    gorro: [[-3, -2, 6, 2, '#3aa0e8'], [-2, -4, 4, 2, '#3aa0e8'], [-1, -5, 2, 1, '#3aa0e8'], [-3, -1, 6, 1, BLANCO], [-1, -7, 2, 2, BLANCO]],
    lazo: [[-1, -2, 2, 2, '#f06aa0'], [-4, -3, 3, 3, '#f06aa0'], [1, -3, 3, 3, '#f06aa0'], [-1, -2, 2, 1, '#a8243e']],
    casco: [[-3, -3, 6, 3, '#9aa3b2'], [-4, -6, 1, 3, BLANCO], [3, -6, 1, 3, BLANCO], [-1, -4, 2, 1, '#cfd6e2']],
    antifaz: [[-4, 3, 8, 2, '#1c1630'], [-3, 3, 2, 1, BLANCO], [1, 3, 2, 1, BLANCO]],
  };
  const clave = (tipo, piel) => tipo + '|' + piel.id;

  function aHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (!d) return [0, 0, l];
    const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  function canal(p, q, t) {
    t = (t + 1) % 1;
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
  }
  function deHsl(h, s, l) {
    if (!s) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, k = h / 360;
    return [canal(p, q, k + 1 / 3) * 255, canal(p, q, k) * 255, canal(p, q, k - 1 / 3) * 255];
  }
  // la imagen recoloreada (una copia en un lienzo, del mismo tamaño); si el navegador no deja leer los píxeles, la original
  function imagen(tipo, img, piel) {
    const k = clave(tipo, piel);
    if (CACHE[k]) return CACHE[k];
    const cv = document.createElement('canvas'), c = cv.getContext('2d', { willReadFrequently: true }), t = piel.tinte;
    cv.width = img.width; cv.height = img.height;
    c.drawImage(img, 0, 0);
    try {
      const im = c.getImageData(0, 0, cv.width, cv.height), a = im.data;
      for (let i = 0; i < a.length; i += 4) {
        if (!a[i + 3]) continue;
        const [h, s, l] = aHsl(a[i], a[i + 1], a[i + 2]), v = deHsl((h + t.giro + 360) % 360, Math.min(1, s * t.sat), Math.min(1, l * t.luz));
        a[i] = v[0]; a[i + 1] = v[1]; a[i + 2] = v[2];
      }
      c.putImageData(im, 0, 0);
    } catch (e) { console.warn('aspecto: no se puede recolorear', e); return img; }
    return (CACHE[k] = cv);
  }
  // el adorno, encima de la cabeza. caja: dónde está el dibujo en su primer fotograma ({ x, y, w, h }), d: la tira ({ w, h }), esc: su escala,
  // dy: dónde empieza el fotograma (ya con la escala). Dibuja con el origen en los pies del muñeco
  function adorno(g, piel, caja, d, esc, dy) {
    const hoja = ADORNOS[piel.adorno];
    if (!hoja) return;
    const s = Math.max(2, Math.round(caja.w * esc / 14)), cx = Math.round((caja.x + caja.w / 2 - d.w / 2) * esc), cy = Math.round(dy + caja.y * esc);
    g.save(); g.imageSmoothingEnabled = false;
    for (const [x, y, w, h] of hoja) { g.fillStyle = contorno; g.fillRect(cx + x * s - 2, cy + y * s - 2, w * s + 4, h * s + 4); }
    for (const [x, y, w, h, col] of hoja) { g.fillStyle = col; g.fillRect(cx + x * s, cy + y * s, w * s, h * s); }
    g.restore();
  }
  // para las fichas en HTML: el filtro de CSS que se acerca al recoloreado
  const filtro = piel => `filter:hue-rotate(${piel.tinte.giro}deg) saturate(${piel.tinte.sat}) brightness(${piel.tinte.luz})`;
  return { imagen, adorno, filtro, de: tipo => quien(tipo), pon: f => { quien = f; } };
})();
