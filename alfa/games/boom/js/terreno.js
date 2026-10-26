// Fans of Boom · TERRENO: el suelo del mapa como un mapa de bits lógico (1 = suelo, 0 = aire) más su dibujo pintado.
// Se genera con una semilla (el mismo mapa siempre sale igual), se agujerea con círculos y todo lo demás pregunta aquí si un punto es suelo.
// Sin DOM salvo el dibujo: la lógica se puede probar sin navegador.
'use strict';
const TERRENO = (() => {
  const W = BOOM.mundo.ancho, H = BOOM.mundo.alto;
  const bits = new Uint8Array(W * H), sup = new Float32Array(W);   // sup[x] = fila de la superficie en esa columna (H = sin suelo)
  let mapa = BOOM.mapas[0], cv = null, cx = null;

  const solido = (x, y) => { x = Math.floor(x); y = Math.floor(y); return x >= 0 && x < W && y >= 0 && y < H && bits[y * W + x] === 1; };
  function suelo(x, desde) { x = Math.floor(x); if (x < 0 || x >= W) return H; for (let y = Math.max(0, Math.floor(desde)); y < H; y++) if (bits[y * W + x]) return y; return H; }

  function altura(az) {   // la superficie: ondas sumadas con fase al azar, siempre dentro de un margen del mapa
    const fases = mapa.olas.map(() => az() * 6.2832);
    for (let x = 0; x < W; x++) {
      let h = H * mapa.base;
      mapa.olas.forEach(([amp, f], i) => { h += amp * Math.sin(6.2832 * f * x / W + fases[i]); });
      sup[x] = Math.max(250, Math.min(H - 110, h));
    }
  }
  function allana(sx) {   // un pedazo llano donde sale cada móvil, enlazado con suavidad
    const x0 = Math.floor(sx), h0 = sup[x0];
    for (let x = Math.max(0, x0 - 80); x < Math.min(W, x0 + 80); x++) {
      const t = Math.max(0, Math.min(1, (Math.abs(x - x0) - 40) / 40)), w = t * t * (3 - 2 * t);
      sup[x] = h0 + (sup[x] - h0) * w;
    }
  }
  function huecos() { for (const [fr, ancho] of mapa.huecos) { const c = Math.floor(W * fr); for (let x = c - ancho / 2; x < c + ancho / 2; x++) sup[Math.floor(x)] = H; } }
  function rellena() { bits.fill(0); for (let x = 0; x < W; x++) for (let y = Math.ceil(sup[x]); y < H; y++) bits[y * W + x] = 1; }

  function pinta(az) {
    cx.clearRect(0, 0, W, H); cx.lineJoin = 'round'; cx.lineCap = 'round';
    const traza = () => { cx.beginPath(); for (let x = 0; x < W; x++) (x ? cx.lineTo(x, sup[x]) : cx.moveTo(x, sup[x])); };
    cx.strokeStyle = mapa.borde; cx.lineWidth = 8; traza(); cx.stroke();
    const g = cx.createLinearGradient(0, 250, 0, H); g.addColorStop(0, mapa.roca[0]); g.addColorStop(1, mapa.roca[1]);
    cx.fillStyle = g; traza(); cx.lineTo(W, H); cx.lineTo(0, H); cx.closePath(); cx.fill();
    cx.globalCompositeOperation = 'source-atop';
    if (!ESCENARIO.suelo(cx, az, sup)) for (let i = 0; i < 700; i++) {   // piedrecitas y manchas para que no sea un color plano
      const x = az() * W, y = 260 + az() * (H - 260), r = 3 + az() * 16;
      cx.fillStyle = az() < 0.5 ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.07)'; cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fill();
    }
    if (!ESCENARIO.capa(cx, az, sup)) {
      cx.strokeStyle = mapa.hierba; cx.lineWidth = 12; cx.lineCap = 'butt'; traza(); cx.stroke();
      cx.strokeStyle = 'rgba(255,255,255,.28)'; cx.lineWidth = 3; cx.save(); cx.translate(0, -3); traza(); cx.stroke(); cx.restore();
    }
    cx.globalCompositeOperation = 'source-over';
  }

  // Un agujero: borra los bits y, en el dibujo, deja un borde oscuro (solo sobre el suelo que queda) y vacía el círculo.
  function cava(x, y, r) {
    x = Math.round(x); y = Math.round(y);
    for (let dy = -r; dy <= r; dy++) {
      const yy = y + dy; if (yy < 0 || yy >= H) continue;
      const m = Math.floor(Math.sqrt(r * r - dy * dy));
      for (let xx = Math.max(0, x - m); xx <= Math.min(W - 1, x + m); xx++) bits[yy * W + xx] = 0;
    }
    if (!cx) return;
    cx.save(); cx.globalCompositeOperation = 'source-atop'; cx.fillStyle = mapa.borde; cx.beginPath(); cx.arc(x, y, r + 5, 0, 6.2832); cx.fill();
    cx.globalCompositeOperation = 'destination-out'; cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fill(); cx.restore();
    ESCENARIO.rompe(x, y, r);
  }

  // Un trozo nuevo de suelo con forma de elipse (el muro del Gato gordo). El dibujo lo pone TERRENO_DIBUJOS[dibujo] si hay pantalla.
  function pon(x, y, rx, ry, dibujo) {
    x = Math.round(x); y = Math.round(y);
    for (let dy = -ry; dy <= ry; dy++) {
      const yy = y + dy; if (yy < 0 || yy >= H) continue;
      const m = Math.floor(rx * Math.sqrt(1 - (dy / ry) * (dy / ry)));
      for (let xx = Math.max(0, x - m); xx <= Math.min(W - 1, x + m); xx++) { bits[yy * W + xx] = 1; if (yy < sup[xx]) sup[xx] = yy; }
    }
    if (cx && typeof TERRENO_DIBUJOS !== 'undefined' && TERRENO_DIBUJOS[dibujo]) { cx.save(); TERRENO_DIBUJOS[dibujo](cx, x, y, rx, ry); cx.restore(); }
  }

  function crea(id, semilla, salidas) {   // salidas: columnas (en píxeles) donde sale cada móvil
    mapa = BOOM.mapas.find(m => m.id === id) || BOOM.mapas[0];
    const az = mulberry32(semilla);
    if (typeof document !== 'undefined') { if (!cv) { cv = document.createElement('canvas'); cv.width = W; cv.height = H; cx = cv.getContext('2d'); } }
    altura(az); salidas.forEach(allana); huecos(); rellena();
    if (cx) { const deco = mulberry32((semilla * 31 + 7) >>> 0); ESCENARIO.crea(mapa, semilla, salidas, sup); pinta(deco); }   // el dibujo lleva su propio azar: así el mapa sale igual con o sin pantalla
    for (let i = 0; i < mapa.cuevas; i++) {
      const x = W * (0.12 + az() * 0.76), y = sup[Math.floor(x)] + 100 + az() * 150, r = 36 + az() * 40;
      if (salidas.some(s => Math.abs(s - x) < 140) || sup[Math.floor(x)] >= H) continue;
      cava(x, y, Math.floor(r));
    }
  }
  return { crea, solido, suelo, cava, pon, ancho: W, alto: H, canvas: () => cv, mapa: () => mapa, superficie: x => sup[Math.max(0, Math.min(W - 1, Math.floor(x)))] };
})();
