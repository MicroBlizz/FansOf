// Fans of Asalto · ADAPTADORES · El lienzo: el juego se pinta en un lienzo pequeño (sus medidas las da medidas.js) que se amplía en
// los píxeles reales de la pantalla; si el zoom es entero, sin suavizar nada, para que ningún píxel del dibujo salga borroso.
// Encima va la capa de LUCES, que sí es suave: una penumbra con huecos donde hay luz y destellos de color (antorchas, runas, rayos).
// También convierte un toque de la pantalla en coordenadas del lienzo pequeño.
'use strict';
AS.lienzo = (() => {
  const L = { cv: null, g: null, buf: null, b: null, sombra: null, s: null, medio: null, m: null, W: 540, H: 1170, k: 2, entero: true, cambio: 0 };
  function ajusta() {
    const dpr = window.devicePixelRatio || 1, st = L.cv.parentElement;
    const m = AS.medidas(Math.round(window.innerWidth * dpr), Math.round(window.innerHeight * dpr));
    Object.assign(L, m);
    L.buf.width = m.W; L.buf.height = m.H;
    // con zoom de decimales hace falta un lienzo intermedio, al entero de arriba (ver copia)
    const e = m.entero ? 1 : Math.ceil(m.k);
    L.medio.width = e > 1 ? m.W * e : 1; L.medio.height = e > 1 ? m.H * e : 1;
    L.sombra.width = Math.ceil(m.W / 2); L.sombra.height = Math.ceil(m.H / 2);
    L.cv.width = Math.round(m.W * m.k); L.cv.height = Math.round(m.H * m.k);
    const cssW = L.cv.width / dpr, cssH = L.cv.height / dpr;
    st.style.width = cssW + 'px'; st.style.height = cssH + 'px';
    st.style.setProperty('--as-u', (m.k / dpr) + 'px');   // un píxel del lienzo pequeño, en píxeles de la página: la medida de las ventanas
    st.classList.toggle('as-corto', m.H < 1000);           // pantalla baja: el menú aprieta el título
    L.cambio++;
  }
  function monta(cv) {
    L.cv = cv; L.g = cv.getContext('2d');
    L.buf = document.createElement('canvas'); L.b = L.buf.getContext('2d');
    L.sombra = document.createElement('canvas'); L.s = L.sombra.getContext('2d');
    L.medio = document.createElement('canvas'); L.m = L.medio.getContext('2d');
    ajusta();
    window.addEventListener('resize', ajusta);
    return L;
  }
  // luces: [{ x, y, r, col: [r, g, b], a }] en medidas del lienzo pequeño. penumbra: { y0, y1, a } (la franja de la arena)
  // copia el lienzo pequeño a la pantalla. Con zoom entero, tal cual. Con decimales, primero se amplía sin suavizar al entero de arriba y
  // luego se encoge suavizando: sale nítido y con todos los píxeles del mismo tamaño (ampliar directamente los dejaría desiguales)
  function copia(g) {
    if (L.entero) { g.imageSmoothingEnabled = false; g.drawImage(L.buf, 0, 0, L.cv.width, L.cv.height); return; }
    let origen = L.buf;
    if (L.medio.width > 1) { L.m.imageSmoothingEnabled = false; L.m.drawImage(L.buf, 0, 0, L.medio.width, L.medio.height); origen = L.medio; }
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(origen, 0, 0, L.cv.width, L.cv.height);
  }
  function presenta(luces, penumbra) {
    const g = L.g, k = L.k;
    g.globalCompositeOperation = 'source-over';
    copia(g);
    if (penumbra && penumbra.a > 0) {
      const s = L.s;
      s.globalCompositeOperation = 'source-over'; s.clearRect(0, 0, L.sombra.width, L.sombra.height);
      s.fillStyle = `rgba(10,8,26,${penumbra.a})`; s.fillRect(0, penumbra.y0 / 2, L.sombra.width, (penumbra.y1 - penumbra.y0) / 2);
      s.globalCompositeOperation = 'destination-out';
      for (const l of luces) {
        const gr = s.createRadialGradient(l.x / 2, l.y / 2, 0, l.x / 2, l.y / 2, l.r / 2);
        gr.addColorStop(0, `rgba(0,0,0,${Math.min(1, l.a * 1.2)})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
        s.fillStyle = gr; s.fillRect((l.x - l.r) / 2, (l.y - l.r) / 2, l.r, l.r);
      }
      g.imageSmoothingEnabled = true;
      g.drawImage(L.sombra, 0, 0, L.cv.width, L.cv.height);
    }
    g.globalCompositeOperation = 'lighter';
    for (const l of luces) {
      if (!l.col) continue;
      const x = l.x * k, y = l.y * k, r = l.r * k * 0.8, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${l.col[0]},${l.col[1]},${l.col[2]},${l.a * 0.55})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.globalCompositeOperation = 'source-over';
  }
  // de un toque (clientX, clientY) a un punto del lienzo pequeño
  function punto(ev) {
    const r = L.cv.getBoundingClientRect();
    return { x: (ev.clientX - r.left) / r.width * L.W, y: (ev.clientY - r.top) / r.height * L.H };
  }
  return { L, monta, ajusta, presenta, punto };
})();
