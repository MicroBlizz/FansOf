// Fans of Boom · ESCENARIO: lo que da carácter a cada mapa. El cielo y el fondo por capas (con paralaje), la textura del suelo con lo que
// hay enterrado, los objetos de la superficie (se rompen con las explosiones y caen si se cava debajo) y el ambiente (papeles, hojas,
// lluvia… que se mueven con el viento). Cada mapa pinta lo suyo en escenarios-*.js (ESCENARIOS[id]). Solo dibujo: nada cambia la partida.
'use strict';
const ESCENARIOS = {};
const ESC = {   // ayudas de dibujo para los escenarios, con el contorno grueso de la serie
  T: 6.2832,
  caja(c, x, y, w, h, r, col) { c.fillStyle = col; c.beginPath(); rrPath(c, x, y, w, h, Math.min(r, w / 2, h / 2)); c.fill(); c.stroke(); },
  bola(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); c.stroke(); },
  poli(c, pts, col, sinBorde) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < pts.length; i += 2) (i ? c.lineTo(pts[i], pts[i + 1]) : c.moveTo(pts[i], pts[i + 1])); c.closePath(); c.fill(); if (!sinBorde) c.stroke(); },
  raya(c, pts, col, w) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let i = 0; i < pts.length; i += 2) (i ? c.lineTo(pts[i], pts[i + 1]) : c.moveTo(pts[i], pts[i + 1])); c.stroke(); },
  txt(c, s, x, y, tam, col) {   // un letrero pequeño: contorno fino para que se lea aunque sea chico
    c.font = `800 ${tam}px "Baloo 2", system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.lineWidth = Math.max(2, tam / 4); c.strokeStyle = OL; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y);
  },
  borde(c, w) { c.strokeStyle = OL; c.lineWidth = w || 3; c.lineJoin = 'round'; c.lineCap = 'round'; },
  // la superficie como camino (para las capas del suelo): de izquierda a derecha, desplazada dy hacia abajo
  traza(c, sup, dy) { const W = BOOM.mundo.ancho; c.beginPath(); for (let x = 0; x < W; x += 2) (x ? c.lineTo(x, sup[x] + dy) : c.moveTo(x, sup[x] + dy)); },
  // pone cosas enterradas al azar por todo el suelo: f(c, x, y, az) con (x, y) bajo la superficie, entre «de» y «a» píxeles de hondo
  entierra(c, az, sup, n, de, a, f) {
    const W = BOOM.mundo.ancho, H = BOOM.mundo.alto;
    for (let i = 0; i < n; i++) {
      const x = 20 + az() * (W - 40), s = sup[Math.floor(x)]; if (s >= H) continue;
      const y = s + de + az() * (a - de); if (y > H - 10) continue;
      c.save(); c.translate(x, y); c.rotate((az() - 0.5) * 1.6); f(c, az); c.restore();
    }
  },
  // un ladrillo o bloque repetido en filas que siguen la profundidad (sin contorno, para no saturar)
  filas(c, y0, alto, ancho, desfase, col, grosor) {
    const W = BOOM.mundo.ancho, H = BOOM.mundo.alto; c.strokeStyle = col; c.lineWidth = grosor || 2; c.beginPath();
    for (let y = y0, f = 0; y < H; y += alto, f++) { c.moveTo(0, y); c.lineTo(W, y); for (let x = (f % 2) * desfase; x < W; x += ancho) { c.moveTo(x, y); c.lineTo(x, y + alto); } }
    c.stroke();
  },
};
const ESCENARIO = (() => {
  const W = BOOM.mundo.ancho, H = BOOM.mundo.alto, T = ESC.T;
  let E = null, mapa = null, props = [], capas = [], amb = [], antes = { x: 0, y: 0 };

  function crea(m, semilla, salidas, sup) {   // lo llama TERRENO.crea con la superficie ya hecha (solo en el navegador)
    mapa = m; E = ESCENARIOS[m.id] || null; props = []; amb = []; capas = [];
    if (!E) return;
    const az = mulberry32((semilla ^ 0x5bd1e995) >>> 0);
    for (const L of E.capas || []) {   // las capas del fondo se pintan una vez, del ancho que recorre la cámara con su paralaje
      const w = Math.ceil(960 + (W - 960) * L.par) + 8, cv = document.createElement('canvas'); cv.width = w; cv.height = H;
      const c = cv.getContext('2d'); ESC.borde(c); L.pinta(c, w, az, m); capas.push({ cv, par: L.par });
    }
    const [a, b] = (E.hueco || [70, 160]).map(v => v * 0.7);   // cuánto hay entre objeto y objeto
    for (let x = 40 + az() * a; x < W - 40; x += a + az() * (b - a)) {
      const xi = Math.floor(x), i0 = Math.max(0, xi - 16), i1 = Math.min(W - 1, xi + 16);
      if (salidas.some(s => Math.abs(s - x) < 60) || sup[xi] >= H || sup[i0] >= H || sup[i1] >= H) continue;
      const pend = (sup[i1] - sup[i0]) / (i1 - i0); if (Math.abs(pend) > 0.9) continue;
      const tipo = E.reparto[Math.floor(az() * E.reparto.length)], d = E.props[tipo];
      props.push({ d, x, y: TERRENO.suelo(x, sup[xi] - 4), ang: Math.atan(pend) * 0.7, f: d.fijo || az() < 0.5 ? 1 : -1, v: az(), s: 0.85 + az() * 0.3, vy: 0, fase: az() * T });
    }
    props.sort((p, q) => (p.d.atras ? 0 : 1) - (q.d.atras ? 0 : 1));
  }
  // la textura del suelo y su capa de arriba, dentro del dibujo del terreno (ya en modo source-atop): devuelve false si el mapa no tiene
  function suelo(c, az, sup) { if (!E || !E.suelo) return false; c.save(); ESC.borde(c); E.suelo(c, az, sup, mapa); c.restore(); return true; }
  function capa(c, az, sup) { if (!E || !E.capa) return false; c.save(); ESC.borde(c); E.capa(c, az, sup, mapa); c.restore(); return true; }

  function rompe(x, y, r) {   // una explosión: lo que pilla salta en pedazos; lo demás cae luego si se queda sin suelo
    for (let i = props.length - 1; i >= 0; i--) {
      const p = props[i], R = (p.d.r || 18) * p.s;
      if (Math.hypot(p.x - x, p.y - R - y) > r + R) continue;
      props.splice(i, 1);
      const cols = p.d.trozos || ['#8a7a9a'];
      if (typeof EFECTOS !== 'undefined') for (let j = 0; j < (REDUCED ? 4 : 10); j++) {
        const a = -Math.PI * (0.1 + Math.random() * 0.8), v = 140 + Math.random() * 260;
        EFECTOS.FX.chispas.push({ x: p.x, y: p.y - R, vx: Math.cos(a) * v + (p.x - x) * 2, vy: Math.sin(a) * v, t: 0, dur: 0.6 + Math.random() * 0.6, c: cols[j % cols.length], s: 3 + Math.random() * 4, k: p.d.k || 'tecla', giro: Math.random() * 6, vg: (Math.random() - 0.5) * 14 });
      }
    }
  }
  function cae(p, dt) {   // si se ha cavado debajo, el objeto cae hasta el suelo nuevo (o al vacío)
    if (TERRENO.solido(p.x, p.y) || TERRENO.solido(p.x, p.y + 2)) return true;
    p.vy = Math.min(900, p.vy + 900 * dt); const ny = p.y + p.vy * dt, g = TERRENO.suelo(p.x, p.y);
    if (g <= ny) { p.y = g; p.vy = 0; p.ang *= 0.5; } else p.y = ny;
    return p.y < H + 80;
  }
  function objetos(c, CAM, t, dt, atras) {   // atras = los que van detrás del suelo (medio enterrados); el resto, delante
    const V = PINTAR.V;
    if (atras) for (let i = props.length - 1; i >= 0; i--) if (!cae(props[i], dt)) props.splice(i, 1);   // una vez por fotograma
    for (const p of props) {
      if (!!p.d.atras !== atras) continue;
      const x = p.x - CAM.x, y = p.y - CAM.y; if (x < -140 || x > V.w + 140 || y < -200 || y > V.h + 200) continue;
      c.save(); c.translate(x, y + (p.d.hunde || 2)); c.rotate(p.ang); c.scale(p.s * p.f, p.s); ESC.borde(c); p.d.pinta(c, p, t); c.restore();
    }
  }

  function fondo(c, V, CAM, t) {   // false si el mapa no tiene escenario (entonces pintar.js pone el cielo de siempre)
    if (!E) return false;
    const g = c.createLinearGradient(0, 0, 0, V.h); g.addColorStop(0, mapa.cielo[0]); g.addColorStop(1, mapa.cielo[1]);
    c.fillStyle = g; c.fillRect(0, 0, V.w, V.h);
    c.save(); ESC.borde(c); if (E.cielo) E.cielo(c, V, CAM, t); c.restore();
    for (const L of capas) c.drawImage(L.cv, Math.round(-CAM.x * L.par), Math.round(-CAM.y * L.par));
    if (E.vivo) { c.save(); ESC.borde(c); E.vivo(c, V, CAM, t); c.restore(); }
    return true;
  }
  function ambiente(c, V, CAM, t, dt, viento) {   // partículas en pantalla que se quedan en su sitio del mundo y se mueven con el viento
    if (!E || !E.amb || REDUCED) return;
    const A = E.amb, n = V.w < 700 ? Math.ceil(A.n * 0.6) : A.n;
    while (amb.length < n) { const p = { x: Math.random() * V.w, y: Math.random() * V.h, z: 0.6 + Math.random() * 0.8, v: Math.random(), f: Math.random() * T }; A.nace(p, V, true); amb.push(p); }
    amb.length = n;
    const dx = CAM.x - antes.x, dy = CAM.y - antes.y; antes = { x: CAM.x, y: CAM.y };
    c.save(); ESC.borde(c, 2);
    for (const p of amb) {
      p.x -= dx * p.z; p.y -= dy * p.z; A.mueve(p, dt, viento, t);
      if (p.x < -40) p.x += V.w + 80; else if (p.x > V.w + 40) p.x -= V.w + 80;
      if (p.y > V.h + 40 || p.y < -60) A.nace(p, V, false);
      A.pinta(c, p, t);
    }
    c.restore();
  }

  // la miniatura de un mapa para preparar la partida: su cielo, su fondo, un trozo de suelo con su textura y unos cuantos objetos
  const minis = {};
  function miniatura(m) {
    if (minis[m.id]) return minis[m.id];
    const e = ESCENARIOS[m.id], cv = document.createElement('canvas'); cv.width = 300; cv.height = 112;
    const c = cv.getContext('2d'), k = cv.height / 620, sup = new Float32Array(W), az = mulberry32(7);
    c.scale(k, k); c.translate(0, -280);
    const g = c.createLinearGradient(0, 280, 0, H); g.addColorStop(0, m.cielo[0]); g.addColorStop(1, m.cielo[1]); c.fillStyle = g; c.fillRect(0, 280, W, H);
    if (e) for (const L of e.capas || []) { c.save(); ESC.borde(c); L.pinta(c, W, az, m, true); c.restore(); }
    for (let x = 0; x < W; x++) { let h = H * m.base; m.olas.forEach(([amp, f], i) => { h += amp * 0.6 * Math.sin(T * f * x / W + i * 1.7); }); sup[x] = Math.max(320, Math.min(H - 90, h)); }
    const tv = document.createElement('canvas'); tv.width = W; tv.height = H; const tc = tv.getContext('2d');
    ESC.traza(tc, sup, 0); tc.lineTo(W, H); tc.lineTo(0, H); tc.closePath();
    const r = tc.createLinearGradient(0, 300, 0, H); r.addColorStop(0, m.roca[0]); r.addColorStop(1, m.roca[1]); tc.fillStyle = r; tc.fill();
    tc.globalCompositeOperation = 'source-atop';
    if (e && e.suelo) { tc.save(); ESC.borde(tc); e.suelo(tc, az, sup, m); tc.restore(); }
    if (e && e.capa) { tc.save(); ESC.borde(tc); e.capa(tc, az, sup, m); tc.restore(); } else { tc.strokeStyle = m.hierba; tc.lineWidth = 14; ESC.traza(tc, sup, 0); tc.stroke(); }
    c.drawImage(tv, 0, 0);
    if (e) for (let i = 0; i < 9; i++) {
      const x = 110 + i * 175 + az() * 40, d = e.props[e.reparto[Math.floor(az() * e.reparto.length)]];
      c.save(); c.translate(x, sup[Math.floor(x)] + 2); c.scale(1.5, 1.5); ESC.borde(c); d.pinta(c, { v: az(), fase: 0, s: 1 }, 0); c.restore();
    }
    return (minis[m.id] = cv.toDataURL());
  }
  return { crea, suelo, capa, rompe, objetos, fondo, ambiente, miniatura, cuantos: () => props.length };
})();
