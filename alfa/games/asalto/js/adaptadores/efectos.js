// Fans of Asalto · ADAPTADORES · Los efectos: lo que hace que cada golpe, cada línea y cada premio se note. Chispas, números que saltan,
// ondas, rayos, columnas de luz al invocar, monedas que vuelan al contador, destellos de pantalla y temblores. Lo que es dibujo de
// píxeles se pinta en el lienzo pequeño (pinta); lo que es luz se le pasa a la capa de luces (luces). No decide nada del juego.
// Los hechizos de las clases (hechizos.js) usan además cortes, nubes, burbujas de escudo, cruces de cura y estelas, y los efectos de los
// objetos en la batalla, confeti de colores y estrellitas que dan vueltas (atontado). Para el móvil hay
// topes (TOPE): pasado el de partículas se va la más vieja, y la capa de luces nunca recibe más de TOPE.luces.
'use strict';
AS.fx = (() => {
  const P = [], N = [], O = [], R = [], M = [], L = [], C = [], K = [], U = [], S = [];
  const TOPE = Object.freeze({ particulas: 240, luces: 56, cortes: 24, nubes: 40, burbujas: 16 });
  let sacudida = 0, destello = { a: 0, col: '#ffffff' }, lento = 0;
  const azar = (a, b) => a + Math.random() * (b - a);   // solo adorno: no cambia la partida
  // mete algo en una lista con tope: si está llena se va lo más viejo
  const pon = (lista, x, tope) => { if (lista.length >= tope) lista.shift(); lista.push(x); };
  const parti = p => pon(P, p, TOPE.particulas);

  function chispas(x, y, n, col, fuerza, luz) {
    const f = fuerza || 120;
    for (let i = 0; i < n; i++) { const a = azar(0, Math.PI * 2), v = azar(f * 0.3, f); parti({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - f * 0.4, g: 420, t: 0, vida: azar(0.3, 0.7), col, tam: Math.random() < 0.3 ? 4 : 2, luz }); }
  }
  // hacia arriba, lentas: brasas, bolas de luz, purpurina
  function brasas(x, y, n, col, ancho) {
    for (let i = 0; i < n; i++) parti({ x: x + azar(-ancho, ancho), y: y + azar(-6, 6), vx: azar(-14, 14), vy: azar(-90, -30), g: -30, t: 0, vida: azar(0.5, 1.1), col, tam: Math.random() < 0.4 ? 4 : 2, luz: true });
  }
  const numero = (x, y, txt, col, tam) => { N.push({ x: x + azar(-8, 8), y, txt: String(txt), col: col || '#ffffff', tam: tam || 32, t: 0, vida: 0.8 }); if (N.length > 70) N.shift(); };
  const onda = (x, y, r, col) => { O.push({ x, y, r, col: col || '#ffd23a', t: 0, vida: 0.4 }); };
  // un rayo quebrado de (x1, y1) a (x2, y2); grueso: el ancho del trazo (4 de normal, 2 en las ramas)
  function rayo(x1, y1, x2, y2, col, grueso) {
    const pts = [[x1, y1]], n = 5;
    for (let i = 1; i < n; i++) pts.push([x1 + (x2 - x1) * i / n + azar(-12, 12), y1 + (y2 - y1) * i / n + azar(-12, 12)]);
    pts.push([x2, y2]);
    R.push({ pts, t: 0, vida: 0.22, col: col || '#bff4ff', grueso: grueso || 4 });
    if (R.length > 30) R.shift();
    luz(x2, y2, 90, [150, 230, 255], 0.25);
  }
  /* ---------- lo de los hechizos de las clases ---------- */
  // un corte rápido (asesino): una raya que se estira de golpe en el ángulo `ang` y se apaga
  const corte = (x, y, ang, largo, col) => pon(K, { x, y, ang, largo, col: col || '#ffffff', t: 0, vida: 0.22 }, TOPE.cortes);
  // una nube de maldición (brujo): bocanadas que crecen y suben despacio
  function nube(x, y, n, col) {
    for (let i = 0; i < n; i++) pon(U, { x: x + azar(-18, 18), y: y + azar(-10, 10), vx: azar(-10, 10), vy: azar(-22, -8), r: azar(5, 9), col, t: -i * 0.05, vida: azar(0.7, 1.1) }, TOPE.nubes);
  }
  // la burbuja de escudo (tanque): un anillo de cuadritos que brilla y se apaga
  const burbuja = (x, y, r, col) => pon(S, { x, y, r, col: col || '#8fd0f8', t: 0, vida: 0.45 }, TOPE.burbujas);
  // cruces de cura (sanador): suben flotando
  function cruces(x, y, n, col) {
    for (let i = 0; i < n; i++) parti({ x: x + azar(-16, 16), y: y + azar(-8, 8), vx: azar(-8, 8), vy: azar(-70, -40), g: 0, t: -i * 0.06, vida: azar(0.6, 0.9), col, tam: 2, forma: 'cruz', luz: false });
  }
  // confeti de colores (Bomba de confeti): papelitos que saltan y caen despacio
  const COLORES_CONFETI = ['#ff5a5a', '#ffd23a', '#57b947', '#3f8ae8', '#ff7ad9', '#2fd6c6', '#ff8c1a'];
  function confeti(x, y, n, fuerza) {
    for (let i = 0; i < n; i++) {
      const a = azar(-Math.PI, 0), v = azar(fuerza * 0.4, fuerza);
      parti({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 260, t: 0, vida: azar(0.8, 1.3), col: COLORES_CONFETI[i % COLORES_CONFETI.length], tam: 3, forma: 'confeti', luz: false });
    }
  }
  // estrellitas que dan vueltas sobre un punto (atontado): n en corro, durante `dura` segundos
  function estrellas(x, y, n, col, dura) {
    for (let i = 0; i < n; i++) parti({ x, y, vx: 0, vy: 0, g: 0, t: 0, vida: dura || 1, col, tam: 3, forma: 'estrella', orbita: { cx: x, cy: y, r: 26, a: i * Math.PI * 2 / n, w: 5 } });
  }
  // la estela de un proyectil: un punto quieto que se apaga enseguida
  const estela = (x, y, col, tam) => parti({ x: x + azar(-1, 1), y: y + azar(-1, 1), vx: 0, vy: 0, g: 0, t: 0, vida: 0.22, col, tam: tam || 2 });
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

  // una partícula avanza: en corro si da vueltas (estrellas), y si no, con su velocidad y su gravedad
  function mueve(p, dt) {
    const o = p.orbita;
    if (o) { o.a += o.w * dt; p.x = o.cx + Math.cos(o.a) * o.r; p.y = o.cy + Math.sin(o.a) * o.r * 0.35; return; }
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
  }
  const vive = (lista, dt) => { for (let i = lista.length - 1; i >= 0; i--) { lista[i].t += dt; if (lista[i].t >= lista[i].vida) lista.splice(i, 1); } };
  function avanza(dt) {
    for (const p of P) if (p.t >= 0) mueve(p, dt);
    for (const n of N) n.y -= 46 * dt;
    for (const m of M) if (m.t + dt >= m.vida && m.llega) { m.llega(); m.llega = null; }
    for (const u of U) if (u.t >= 0) { u.x += u.vx * dt; u.y += u.vy * dt; }
    for (const l of [P, N, O, R, M, L, C, K, U, S]) vive(l, dt);
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
    pintaNubes(g); pintaBurbujas(g); pintaCortes(g);
    for (const r of R) { g.strokeStyle = r.col; g.lineWidth = r.grueso; g.beginPath(); r.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = r.grueso / 2; g.stroke(); }
    for (const p of P) { if (p.t < 0) continue; g.globalAlpha = Math.min(1, (p.vida - p.t) * 4); g.fillStyle = p.col; cuadro(g, p); }
    g.globalAlpha = 1;
    for (const m of M) {
      if (m.t < 0) continue;
      const k = m.t / m.vida, e = k * k * (3 - 2 * k), x = m.x0 + (m.tx - m.x0) * e, y = m.y0 + (m.ty - m.y0) * e - Math.sin(k * Math.PI) * m.arco;
      g.fillStyle = '#22140e'; g.fillRect(Math.round(x) - 5, Math.round(y) - 5, 10, 10); g.fillStyle = '#ffd23a'; g.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6); g.fillStyle = '#fff3d6'; g.fillRect(Math.round(x) - 3, Math.round(y) - 3, 2, 2);
    }
    for (const n of N) { const k = n.t / n.vida; g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1; AS.texto.pinta(g, n.txt, n.x, n.y, { t: n.tam, col: n.col, ancla: 'c' }); }
    g.globalAlpha = 1;
  }
  // cómo se pinta cada forma de partícula (sin forma: un cuadrado). x, y en píxeles enteros; t, su tamaño
  const FORMAS = {
    cruz: (g, x, y, t) => { g.fillRect(x - t, y - t * 3, t * 2, t * 6); g.fillRect(x - t * 3, y - t, t * 6, t * 2); },
    // una estrellita de 5 puntas en píxeles, con el centro blanco
    estrella: (g, x, y, t) => { g.fillRect(x - t, y - t * 3, t * 2, t * 6); g.fillRect(x - t * 3, y - t, t * 6, t * 2); g.fillRect(x - t * 2, y + t, t, t * 2); g.fillRect(x + t, y + t, t, t * 2); g.fillStyle = '#ffffff'; g.fillRect(x - t / 2, y - t / 2, t, t); },
    // un papelito que gira: a ratos ancho, a ratos estrecho
    confeti: (g, x, y, t, p) => { const ancho = Math.sin(p.t * 14 + p.x) > 0; g.fillRect(x, y, ancho ? t * 2 : t, ancho ? t : t * 2); },
  };
  // una partícula: un cuadrado o la forma que lleve
  function cuadro(g, p) {
    const x = Math.round(p.x), y = Math.round(p.y);
    if (FORMAS[p.forma]) FORMAS[p.forma](g, x, y, p.tam, p); else g.fillRect(x, y, p.tam, p.tam);
  }
  // un disco hecho de tres rectángulos (redondo pero en píxeles)
  function disco(g, x, y, r) {
    const a = Math.round(r), b = Math.round(r * 0.7), c = Math.round(r * 0.4);
    g.fillRect(x - a, y - c, a * 2, c * 2); g.fillRect(x - b, y - b, b * 2, b * 2); g.fillRect(x - c, y - a, c * 2, a * 2);
  }
  function pintaNubes(g) {
    for (const u of U) {
      if (u.t < 0) continue;
      const k = u.t / u.vida, x = Math.round(u.x), y = Math.round(u.y), r = u.r * (1 + k * 0.8);
      g.globalAlpha = 0.75 * (1 - k); g.fillStyle = '#22140e'; disco(g, x, y + 2, r + 2);
      g.fillStyle = u.col; disco(g, x, y, r);
      g.globalAlpha = 0.6 * (1 - k); g.fillStyle = '#e8ffd0'; g.fillRect(x - Math.round(r / 2), y - Math.round(r / 2), 2, 2);
    }
    g.globalAlpha = 1;
  }
  function pintaBurbujas(g) {
    for (const b of S) {
      const k = b.t / b.vida, r = b.r * (0.85 + k * 0.25), n = 16, gira = k * 1.2;
      g.globalAlpha = 0.18 * (1 - k); g.fillStyle = b.col; disco(g, Math.round(b.x), Math.round(b.y), r);
      g.globalAlpha = 1 - k;
      for (let i = 0; i < n; i++) {
        const a = gira + i * Math.PI * 2 / n, x = Math.round(b.x + Math.cos(a) * r), y = Math.round(b.y + Math.sin(a) * r * 0.9);
        g.fillStyle = i % 4 === 0 ? '#ffffff' : b.col; g.fillRect(x - 2, y - 2, 4, 4);
      }
    }
    g.globalAlpha = 1;
  }
  function pintaCortes(g) {
    for (const c of K) {
      const k = c.t / c.vida, largo = c.largo * Math.min(1, k * 4), dx = Math.cos(c.ang), dy = Math.sin(c.ang), pasos = Math.max(2, Math.round(largo / 3));
      g.globalAlpha = k < 0.4 ? 1 : (1 - k) / 0.6;
      for (let i = 0; i <= pasos; i++) {
        const f = i / pasos - 0.5, x = Math.round(c.x + dx * largo * f), y = Math.round(c.y + dy * largo * f), w = Math.abs(f) < 0.3 ? 4 : 2;
        g.fillStyle = c.col; g.fillRect(x - w / 2 - 1, y - w / 2 - 1, w + 2, w + 2); g.fillStyle = '#ffffff'; g.fillRect(x - w / 4, y - w / 4, Math.max(1, w / 2), Math.max(1, w / 2));
      }
    }
    g.globalAlpha = 1;
  }
  // el destello de pantalla entera, encima de todo
  function pintaFogonazo(g, w, h) { if (destello.a > 0.01) { g.globalAlpha = Math.min(0.85, destello.a); g.fillStyle = destello.col; g.fillRect(0, 0, w, h); g.globalAlpha = 1; } }
  // las luces de este fotograma para la capa de luces (nunca más de TOPE.luces: cada una es un degradado y el móvil lo nota)
  function luces() {
    const l = [];
    for (const x of L) l.push({ x: x.x, y: x.y, r: x.r, col: x.col, a: 1 - x.t / x.vida });
    for (const b of S) l.push({ x: b.x, y: b.y, r: b.r * 2.2, col: [120, 200, 255], a: (1 - b.t / b.vida) * 0.8 });
    for (const p of P) if (p.luz && p.t >= 0) l.push({ x: p.x, y: p.y, r: 26, col: [255, 210, 120], a: Math.min(1, (p.vida - p.t) * 3) * 0.7 });
    for (const c of C) { const k = c.t / c.vida, a = Math.sin(Math.min(1, k * 1.2) * Math.PI); for (let i = 0; i < 5; i++) l.push({ x: c.x, y: c.y - i * c.alto / 5, r: 70 - i * 6, col: c.col, a: a * (1 - i * 0.12) }); }
    for (const m of M) if (m.t >= 0) { const k = m.t / m.vida, e = k * k * (3 - 2 * k); l.push({ x: m.x0 + (m.tx - m.x0) * e, y: m.y0 + (m.ty - m.y0) * e - Math.sin(k * Math.PI) * m.arco, r: 22, col: [255, 215, 90], a: 0.8 }); }
    return l.length > TOPE.luces ? l.slice(0, TOPE.luces) : l;
  }
  const limpia = () => { for (const l of [P, N, O, R, M, L, C, K, U, S]) l.length = 0; sacudida = 0; destello.a = 0; lento = 0; };
  // cuántas cosas hay vivas de cada tipo (para los tests y para medir)
  const cuenta = () => ({ particulas: P.length, cortes: K.length, nubes: U.length, burbujas: S.length, luces: luces().length, sacudida });
  return { TOPE, chispas, brasas, numero, onda, rayo, columna, monedas, luz, corte, nube, burbuja, cruces, confeti, estrellas, estela, sacude, fogonazo, frena, avanza, temblor, velocidad, pinta, pintaFogonazo, luces, limpia, cuenta };
})();
