// Lonchas · pieza común (vive en web/gestion/recursos/ porque la usan los visores de /gestion y de la galería local; pasarla a core va con su ADR, tarea #275) · La técnica de las lonchas apiladas, para cualquier juego: una cosa es un montón de hojas
// transparentes (cada una con la cosa entera pintada a su altura). Esta pieza hace tres cosas: puede dar LUZ a cada hoja (APAGADA: ensucia la imagen,
// mejor pintarla en los dibujos), PRECOCINA la pila ya girada y aplastada en una sola imagen por ángulo (así dibujarla
// cuesta 1 llamada en vez de una por hoja) y la PINTA en un lienzo pequeño. No sabe nada de ningún juego: recibe hojas, ángulo y cámara.
'use strict';
const LONCHAS = (() => {
  const PASOS = 96;                                  // ángulos distintos que se precocinan por pila (3,75 grados cada uno)
  const MARGEN = 4;                                  // sitio de sobra para la sombra y el filo
  const cache = new WeakMap();                       // pila -> Map(clave -> sprite)
  const cuenta = { sprites: 0, llamadas: 0 };

  const lienzo = (an, la) => { const c = document.createElement('canvas'); c.width = an; c.height = la; return c; };
  const num = (n, d) => Math.round(n * d) / d;

  // ---- 1. luz por altura: un velo oscuro abajo y uno claro arriba, a escalones (se ve a pixel art, no a degradado)
  function ilumina(pila, { abajo = 0.3, arriba = 0.1, niveles = 4 } = {}) {
    const n = pila.hojas.length;
    const hojas = pila.hojas.map((h, z) => {
      const t = n > 1 ? z / (n - 1) : 1, q = Math.round(t * (niveles - 1)) / (niveles - 1);
      const c = lienzo(h.width, h.height), g = c.getContext('2d');
      g.drawImage(h, 0, 0);
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = `rgba(10,14,40,${num(abajo * (1 - q), 100)})`; g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = `rgba(255,244,200,${num(arriba * q, 100)})`; g.fillRect(0, 0, c.width, c.height);
      return c;
    });
    return { ...pila, hojas };
  }

  // ---- 2. luz de filo: la luz viene de arriba a la izquierda y NO gira con la cosa. Aclara el contorno que mira a la luz y oscurece el otro.
  function filoDeLuz(cv) {
    const w = cv.width, h = cv.height, g = cv.getContext('2d'), img = g.getImageData(0, 0, w, h), d = img.data;
    const copia = new Uint8ClampedArray(d), lleno = (x, y) => x >= 0 && y >= 0 && x < w && y < h && copia[(y * w + x) * 4 + 3] > 200;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!lleno(x, y)) continue;
      const i = (y * w + x) * 4, luz = !lleno(x - 1, y) || !lleno(x, y - 1), sombra = !lleno(x + 1, y) || !lleno(x, y + 1);
      if (luz === sombra) continue;
      for (let k = 0; k < 3; k++) d[i + k] = luz ? d[i + k] + (255 - d[i + k]) * 0.2 : d[i + k] * 0.76;
    }
    g.putImageData(img, 0, 0);
  }

  // ---- 3. el sprite: la pila entera, girada y aplastada, en una imagen. Pixel por pixel igual que dibujar hoja a hoja.
  function cocina(pila, paso, K, alto, borde, alfaSombra) {
    const giro = paso * 2 * Math.PI / PASOS, n = pila.hojas.length;
    const diag = Math.ceil(Math.hypot(pila.an, pila.la)) + MARGEN, mitad = Math.ceil(diag * K / 2) + 1;
    const W = diag + MARGEN, H = mitad * 2 + n * alto + MARGEN, cx = W >> 1, cy = H - mitad - 1;
    const pilaCv = lienzo(W, H), g = pilaCv.getContext('2d');
    g.imageSmoothingEnabled = false;
    pila.hojas.forEach((h, z) => { g.save(); g.translate(cx, cy - z * alto); g.scale(1, K); g.rotate(giro); g.drawImage(h, -pila.an / 2, -pila.la / 2); g.restore(); });
    if (borde) filoDeLuz(pilaCv);
    const cv = lienzo(W, H), s = cv.getContext('2d');
    s.imageSmoothingEnabled = false;
    if (alfaSombra > 0) { s.save(); s.globalAlpha = alfaSombra; s.translate(cx + 2, cy + 1); s.scale(1, K); s.rotate(giro); s.drawImage(pila.sombra, -pila.an / 2, -pila.la / 2); s.restore(); }
    s.drawImage(pilaCv, 0, 0);
    cuenta.sprites++;
    return { cv, cx, cy };
  }
  const pasoDe = giro => ((Math.round(giro / (2 * Math.PI) * PASOS) % PASOS) + PASOS) % PASOS;
  function sprite(pila, giro, op) {
    if (!cache.has(pila)) cache.set(pila, new Map());
    const m = cache.get(pila), paso = pasoDe(giro), clave = `${paso}|${op.K}|${op.alto}|${op.borde ? 1 : 0}|${op.sombra}`;
    if (!m.has(clave)) m.set(clave, cocina(pila, paso, op.K, op.alto, op.borde, op.sombra));
    return m.get(clave);
  }

  // ---- 4. pintar. op = { K (lo que aplasta la cámara), alto (lo que sube cada hoja), borde (luz de filo: apagada si no se pide), sombra (opacidad) }
  // La luz (ilumina y borde) viene APAGADA: cada juego la enciende solo si la quiere (Pepins, 21-11-2026: con luz se veía con ruido).
  function pinta(b, pila, x, y, giro, op, alfa = 1) {
    const s = sprite(pila, giro, op);
    if (alfa !== 1) b.globalAlpha = alfa;
    b.drawImage(s.cv, Math.round(x) - s.cx, Math.round(y) - s.cy);
    if (alfa !== 1) b.globalAlpha = 1;
    cuenta.llamadas++;
  }
  // la manera de siempre (una llamada por hoja), solo para comparar: tiene que salir igual que pinta() cuando no hay filo de luz
  function pintaHojaAHoja(b, pila, x, y, giro, op, alfa = 1) {
    const g = pasoDe(giro) * 2 * Math.PI / PASOS;
    if (op.sombra > 0) { b.save(); b.globalAlpha = op.sombra * alfa; b.translate(x + 2, y + 1); b.scale(1, op.K); b.rotate(g); b.drawImage(pila.sombra, -pila.an / 2, -pila.la / 2); b.restore(); cuenta.llamadas++; }
    pila.hojas.forEach((h, z) => { b.save(); b.globalAlpha = alfa; b.translate(x, y - z * op.alto); b.scale(1, op.K); b.rotate(g); b.drawImage(h, -pila.an / 2, -pila.la / 2); b.restore(); cuenta.llamadas++; });
  }
  // las hojas separadas, para "ver lonchas": cada una con su marco, cada vez más arriba
  function pintaAbierta(b, pila, x, y, giro, op, sep, fuerza) {
    if (op.sombra > 0) { b.save(); b.globalAlpha = op.sombra * (1 - fuerza); b.translate(x + 2, y + 1); b.scale(1, op.K); b.rotate(giro); b.drawImage(pila.sombra, -pila.an / 2, -pila.la / 2); b.restore(); }
    pila.hojas.forEach((h, z) => {
      const yz = Math.round(y - z * op.alto * sep);
      b.save(); b.translate(x, yz); b.scale(1, op.K); b.rotate(giro);
      if (fuerza > 0.02) { b.fillStyle = `rgba(255,240,220,${0.035 * fuerza})`; b.fillRect(-pila.an / 2 - 5, -pila.la / 2 - 5, pila.an + 10, pila.la + 10); b.strokeStyle = `rgba(255,170,90,${0.75 * fuerza})`; b.lineWidth = 0.8; b.strokeRect(-pila.an / 2 - 5, -pila.la / 2 - 5, pila.an + 10, pila.la + 10); }
      b.drawImage(h, -pila.an / 2, -pila.la / 2); b.restore();
    });
  }
  // precocina todos los ángulos de una pila (para hacerlo al cargar y no en mitad de la partida)
  function precalienta(pila, op) { for (let p = 0; p < PASOS; p++) sprite(pila, p * 2 * Math.PI / PASOS, op); }
  const reiniciaCuenta = () => { cuenta.llamadas = 0; };
  return { PASOS, ilumina, pinta, pintaHojaAHoja, pintaAbierta, precalienta, cuenta, reiniciaCuenta, sprite };
})();
