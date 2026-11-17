// Fans of Asalto · ADAPTADORES · Los efectos: lo que hace que cada golpe, cada línea y cada premio se note. Chispas, números que saltan,
// ondas, rayos, columnas de luz al invocar, monedas que vuelan al contador, destellos de pantalla y temblores. Lo que es dibujo de
// píxeles se pinta en el lienzo pequeño (pinta); lo que es luz se le pasa a la capa de luces (luces). No decide nada del juego.
'use strict';
AS.fx = (() => {
  const P = [], N = [], O = [], R = [], M = [], L = [], C = [];
  let sacudida = 0, destello = { a: 0, col: '#ffffff' }, lento = 0;
  const azar = (a, b) => a + Math.random() * (b - a);   // solo adorno: no cambia la partida

  function chispas(x, y, n, col, fuerza, luz) {
    const f = fuerza || 120;
    for (let i = 0; i < n; i++) { const a = azar(0, Math.PI * 2), v = azar(f * 0.3, f); P.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - f * 0.4, g: 420, t: 0, vida: azar(0.3, 0.7), col, tam: Math.random() < 0.3 ? 4 : 2, luz }); }
  }
  // hacia arriba, lentas: brasas, bolas de luz, purpurina
  function brasas(x, y, n, col, ancho) {
    for (let i = 0; i < n; i++) P.push({ x: x + azar(-ancho, ancho), y: y + azar(-6, 6), vx: azar(-14, 14), vy: azar(-90, -30), g: -30, t: 0, vida: azar(0.5, 1.1), col, tam: Math.random() < 0.4 ? 4 : 2, luz: true });
  }
  const numero = (x, y, txt, col, tam) => { N.push({ x: x + azar(-8, 8), y, txt: String(txt), col: col || '#ffffff', tam: tam || 32, t: 0, vida: 0.8 }); if (N.length > 70) N.shift(); };
  const onda = (x, y, r, col) => { O.push({ x, y, r, col: col || '#ffd23a', t: 0, vida: 0.4 }); };
  function rayo(x1, y1, x2, y2, col) {
    const pts = [[x1, y1]], n = 5;
    for (let i = 1; i < n; i++) pts.push([x1 + (x2 - x1) * i / n + azar(-12, 12), y1 + (y2 - y1) * i / n + azar(-12, 12)]);
    pts.push([x2, y2]);
    R.push({ pts, t: 0, vida: 0.22, col: col || '#bff4ff' });
    luz(x2, y2, 90, [150, 230, 255], 0.25);
  }
  // una columna de luz (al invocar, al ascender): sube desde (x, y)
  const columna = (x, y, col, alto) => { C.push({ x, y, col: col || [255, 220, 120], alto: alto || 260, t: 0, vida: 0.7 }); };
  // monedas que vuelan desde (x, y) hasta (tx, ty); al llegar llaman a `llega`
  function monedas(x, y, n, tx, ty, llega) {
    for (let i = 0; i < Math.min(n, 14); i++) M.push({ x0: x + azar(-14, 14), y0: y + azar(-14, 14), tx, ty, t: -i * 0.04, vida: azar(0.45, 0.7), arco: azar(30, 90), llega: i === 0 ? llega : null });
  }
  // una luz que se apaga sola. col: [r, g, b]
  function luz(x, y, r, col, vida) { L.push({ x, y, r, col, t: 0, vida: vida || 0.4 }); if (L.length > 40) L.shift(); }
  const sacude = m => { sacudida = Math.max(sacudida, m); };
  const fogonazo = (a, col) => { destello = { a: Math.max(destello.a, a), col: col || '#ffffff' }; };
  const frena = s => { lento = Math.max(lento, s); };   // un instante a cámara lenta (el golpe final)

  const vive = (lista, dt) => { for (let i = lista.length - 1; i >= 0; i--) { lista[i].t += dt; if (lista[i].t >= lista[i].vida) lista.splice(i, 1); } };
  function avanza(dt) {
    for (const p of P) { if (p.t >= 0) { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; } }
    for (const n of N) n.y -= 46 * dt;
    for (const m of M) if (m.t + dt >= m.vida && m.llega) { m.llega(); m.llega = null; }
    for (const l of [P, N, O, R, M, L, C]) vive(l, dt);
    sacudida = Math.max(0, sacudida - dt * 40); destello.a = Math.max(0, destello.a - dt * 2.4); lento = Math.max(0, lento - dt);
  }
  // el desplazamiento del temblor de este fotograma (en píxeles enteros)
  const temblor = () => (sacudida > 0.5 ? { x: Math.round(azar(-sacudida, sacudida)), y: Math.round(azar(-sacudida, sacudida)) } : { x: 0, y: 0 });
  const velocidad = () => (lento > 0 ? 0.25 : 1);

  function pinta(g) {
    // las columnas de luz: un haz de píxeles que se estrecha y se apaga
    for (const c of C) {
      const k = c.t / c.vida, a = Math.sin(Math.min(1, k * 1.2) * Math.PI), w = Math.max(2, Math.round(24 * (1 - k * 0.6)));
      g.globalAlpha = a * 0.45; g.fillStyle = `rgb(${c.col[0]},${c.col[1]},${c.col[2]})`; g.fillRect(Math.round(c.x) - w, Math.round(c.y - c.alto), w * 2, c.alto);
      g.globalAlpha = a * 0.75; g.fillStyle = '#fffbe8'; g.fillRect(Math.round(c.x) - Math.round(w / 3), Math.round(c.y - c.alto), Math.round(w / 3) * 2, c.alto);
    }
    g.globalAlpha = 1;
    for (const o of O) { const k = o.t / o.vida, r = o.r * (0.3 + k * 0.7); g.globalAlpha = 1 - k; g.strokeStyle = o.col; g.lineWidth = 4; g.beginPath(); g.arc(Math.round(o.x), Math.round(o.y), r, 0, Math.PI * 2); g.stroke(); }
    g.globalAlpha = 1;
    for (const r of R) { g.strokeStyle = r.col; g.lineWidth = 4; g.beginPath(); r.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.stroke(); }
    for (const p of P) { if (p.t < 0) continue; g.globalAlpha = Math.min(1, (p.vida - p.t) * 4); g.fillStyle = p.col; g.fillRect(Math.round(p.x), Math.round(p.y), p.tam, p.tam); }
    g.globalAlpha = 1;
    for (const m of M) {
      if (m.t < 0) continue;
      const k = m.t / m.vida, e = k * k * (3 - 2 * k), x = m.x0 + (m.tx - m.x0) * e, y = m.y0 + (m.ty - m.y0) * e - Math.sin(k * Math.PI) * m.arco;
      g.fillStyle = '#22140e'; g.fillRect(Math.round(x) - 5, Math.round(y) - 5, 10, 10); g.fillStyle = '#ffd23a'; g.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6); g.fillStyle = '#fff3d6'; g.fillRect(Math.round(x) - 3, Math.round(y) - 3, 2, 2);
    }
    for (const n of N) { const k = n.t / n.vida; g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1; AS.texto.pinta(g, n.txt, n.x, n.y, { t: n.tam, col: n.col, ancla: 'c' }); }
    g.globalAlpha = 1;
  }
  // el destello de pantalla entera, encima de todo
  function pintaFogonazo(g, w, h) { if (destello.a > 0.01) { g.globalAlpha = Math.min(0.85, destello.a); g.fillStyle = destello.col; g.fillRect(0, 0, w, h); g.globalAlpha = 1; } }
  // las luces de este fotograma para la capa de luces
  function luces() {
    const l = [];
    for (const x of L) l.push({ x: x.x, y: x.y, r: x.r, col: x.col, a: 1 - x.t / x.vida });
    for (const p of P) if (p.luz && p.t >= 0) l.push({ x: p.x, y: p.y, r: 26, col: [255, 210, 120], a: Math.min(1, (p.vida - p.t) * 3) * 0.7 });
    for (const c of C) { const k = c.t / c.vida, a = Math.sin(Math.min(1, k * 1.2) * Math.PI); for (let i = 0; i < 5; i++) l.push({ x: c.x, y: c.y - i * c.alto / 5, r: 70 - i * 6, col: c.col, a: a * (1 - i * 0.12) }); }
    for (const m of M) if (m.t >= 0) { const k = m.t / m.vida, e = k * k * (3 - 2 * k); l.push({ x: m.x0 + (m.tx - m.x0) * e, y: m.y0 + (m.ty - m.y0) * e - Math.sin(k * Math.PI) * m.arco, r: 22, col: [255, 215, 90], a: 0.8 }); }
    return l;
  }
  const limpia = () => { for (const l of [P, N, O, R, M, L, C]) l.length = 0; sacudida = 0; destello.a = 0; lento = 0; };
  return { chispas, brasas, numero, onda, rayo, columna, monedas, luz, sacude, fogonazo, frena, avanza, temblor, velocidad, pinta, pintaFogonazo, luces, limpia };
})();
