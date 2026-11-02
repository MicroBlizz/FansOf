// Fans of Soccer · Vista: dibuja el campo en falso 3D (perspectiva: lo del fondo más pequeño), los jugadores, el balón y sus estelas.
// Lienzo lógico de 1280x720; la cámara sigue al balón de lado a lado.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const W = 1280, H = 720, ESC = 14;
  const V = S.vista = { cam: 50, off: 0, estela: [], chispas: [], temblor: 0, img: {}, W, H };

  V.cargar = function (nombres) {
    for (const n of nombres) {
      const im = new Image();
      im.onload = () => { V.img[n] = im; };
      im.src = 'img/' + n + (n.startsWith('fondo') ? '.jpg' : '.png');
    }
  };

  // mundo -> pantalla
  function P(x, y, z) {
    const t = (y + V.off) / 60, s = 0.6 + 0.4 * t, sy = 250 + 440 * t * (0.8 + 0.2 * t);
    return { x: W / 2 + (x - V.cam) * ESC * s, y: sy - (z || 0) * ESC * s, s };
  }
  V.P = P;

  function poli(g, pts, color) {
    g.beginPath();
    pts.forEach((p, i) => { const q = P(p[0], p[1], p[2]); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); });
    g.closePath(); g.fillStyle = color; g.fill();
  }
  function linea(g, pts, cerrar) {
    g.beginPath();
    pts.forEach((p, i) => { const q = P(p[0], p[1], p[2]); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); });
    if (cerrar) g.closePath();
    g.stroke();
  }

  function cielo(g, aj) {
    const f = V.img[aj.campo.fondo];
    if (f) { const ox = -(V.cam - 50) * 3 - (f.width - W) / 2; g.drawImage(f, ox, 255 - f.height); }
    else { const gr = g.createLinearGradient(0, 0, 0, 260); gr.addColorStop(0, '#3a2a6e'); gr.addColorStop(1, '#ff9a5a'); g.fillStyle = gr; g.fillRect(0, 0, W, 260); }
  }

  function cesped(g, aj) {
    const c = aj.campo, m = aj.ancho / 2;
    poli(g, [[-14, -6 - V.off], [aj.largo + 14, -6 - V.off], [aj.largo + 14, 72 - V.off], [-14, 72 - V.off]], c.suelo);
    for (let k = 0; k < 10; k++) poli(g, [[k * 10, 0], [k * 10 + 10, 0], [k * 10 + 10, aj.ancho], [k * 10, aj.ancho]], c.franjas[k % 2]);
    for (const ch of c.charcos) charco(g, ch);
    g.strokeStyle = c.lineas; g.lineWidth = 3;
    linea(g, [[0, 0], [aj.largo, 0], [aj.largo, aj.ancho], [0, aj.ancho]], true);
    linea(g, [[aj.largo / 2, 0], [aj.largo / 2, aj.ancho]]);
    const r = Math.min(9, aj.ancho / 4), circ = [];
    for (let a = 0; a <= 32; a++) circ.push([aj.largo / 2 + Math.cos(a / 16 * Math.PI) * r, m + Math.sin(a / 16 * Math.PI) * r]);
    linea(g, circ);
    const ag = Math.min(16, m - 2);
    for (const x0 of [0, aj.largo]) { const d = x0 ? -1 : 1; linea(g, [[x0, m - ag], [x0 + d * 16, m - ag], [x0 + d * 16, m + ag], [x0, m + ag]]); linea(g, [[x0, m - 9], [x0 + d * 6, m - 9], [x0 + d * 6, m + 9], [x0, m + 9]]); }
  }

  // Charco de aceite: mancha oscura con un brillo de colores.
  function charco(g, ch) {
    const pts = [], brillo = [];
    for (let a = 0; a < 20; a++) { const k = a / 20 * Math.PI * 2, r = ch[2] * (0.85 + 0.15 * Math.sin(a * 2.7)); pts.push([ch[0] + Math.cos(k) * r, ch[1] + Math.sin(k) * r * 0.8]); brillo.push([ch[0] + Math.cos(k) * r * 0.5 - 0.8, ch[1] + Math.sin(k) * r * 0.3 - 0.6]); }
    poli(g, pts, 'rgba(10,10,18,.85)');
    poli(g, brillo, 'rgba(140,90,255,.25)');
  }

  function porteria(g, aj, x0, parte) {
    const p = aj.porteria, d = x0 ? 2.5 : -2.5, alto = p.alto;
    g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.55)';
    if (parte === 'fondo') {
      for (let k = 0; k <= 6; k++) { const y = p.y1 + (p.y2 - p.y1) * k / 6; linea(g, [[x0, y, alto], [x0 + d, y, alto * 0.6], [x0 + d, y, 0]]); }
      for (let k = 0; k <= 4; k++) linea(g, [[x0 + d, p.y1, alto * 0.6 * k / 4], [x0 + d, p.y2, alto * 0.6 * k / 4]]);
      g.lineWidth = 6; g.strokeStyle = '#f4f4f4'; linea(g, [[x0, p.y1, 0], [x0, p.y1, alto], [x0, p.y2, alto]]);
    } else { g.lineWidth = 6; g.strokeStyle = '#ffffff'; linea(g, [[x0, p.y2, alto], [x0, p.y2, 0]]); }
  }

  function estrellas(g, q, t) {
    for (let k = 0; k < 3; k++) {
      const a = t * 5 + k * 2.1, x = q.x + Math.cos(a) * 22 * q.s, y = q.y - 70 * q.s + Math.sin(a) * 7 * q.s;
      g.fillStyle = '#ffe14a'; g.strokeStyle = '#3a2a00'; g.lineWidth = 2;
      g.beginPath(); for (let i = 0; i < 10; i++) { const r = (i % 2 ? 3 : 8) * q.s, b = i * Math.PI / 5 + a; g.lineTo(x + Math.cos(b) * r, y + Math.sin(b) * r); }
      g.closePath(); g.fill(); g.stroke();
    }
  }

  function cuerpoProvisional(g, j, color, h) {
    g.fillStyle = color; g.strokeStyle = '#111'; g.lineWidth = 3;
    g.beginPath(); g.roundRect(-h * 0.22, -h * 0.75, h * 0.44, h * 0.6, 10); g.fill(); g.stroke();
    g.fillStyle = '#f2d2b0'; g.beginPath(); g.arc(0, -h * 0.85, h * 0.17, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#111'; g.font = 'bold ' + Math.round(h * 0.2) + 'px sans-serif'; g.textAlign = 'center'; g.fillText(j.nombre[0], 0, -h * 0.38);
  }

  function jugador(g, e, j, t, controlado) {
    const q = P(j.x, j.y, 0), color = e.aj.equipos[j.eq].color, im = V.img[j.sprite];
    const h = (im ? im.height * 0.62 : 100) * q.s;
    g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(q.x, q.y, 22 * q.s, 7 * q.s, 0, 0, 7); g.fill();
    g.strokeStyle = controlado ? '#ffe14a' : color; g.lineWidth = controlado ? 4 : 3;
    g.beginPath(); g.ellipse(q.x, q.y, 20 * q.s, 6 * q.s, 0, 0, 7); g.stroke();
    g.save(); g.translate(q.x, q.y - Math.abs(Math.sin(j.corre * 0.9)) * 6 * q.s);
    if (j.mareo > 0) g.rotate(j.mira * 1.45); else if (j.barrida > 0) g.rotate(j.mira * 1.1); else g.rotate(Math.sin(j.corre * 0.9) * 0.05);
    g.scale(j.mira, 1);
    if (im) g.drawImage(im, -im.width * 0.62 * q.s / 2, -h, im.width * 0.62 * q.s, h); else cuerpoProvisional(g, j, color, h);
    g.restore();
    if (j.mareo > 0) estrellas(g, q, t);
    if (controlado) { const y = q.y - h - 14; g.fillStyle = '#ffe14a'; g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.moveTo(q.x - 9, y - 12); g.lineTo(q.x + 9, y - 12); g.lineTo(q.x, y); g.closePath(); g.fill(); g.stroke(); }
  }

  const COLOR_TIRO = { normal: ['rgba(255,255,255,', 6], zanahoria: ['rgba(255,140,30,', 16], chilena: ['rgba(255,40,40,', 18] };

  function balon(g, e) {
    const b = e.balon, q = P(b.x, b.y, b.z), q0 = P(b.x, b.y, 0), r = 0.55 * ESC * q.s;
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(q0.x, q0.y, r * 1.1, r * 0.4, 0, 0, 7); g.fill();
    const c = b.tiro ? COLOR_TIRO[b.tiro.tipo] || COLOR_TIRO.normal : null;
    V.estela.unshift(c ? { x: q.x, y: q.y, c } : null); V.estela.length = Math.min(V.estela.length, 16);
    for (let i = 1; i < V.estela.length; i++) {
      const a = V.estela[i - 1], p = V.estela[i];
      if (!a || !p) continue;
      g.strokeStyle = p.c[0] + (1 - i / 16) * 0.8 + ')'; g.lineWidth = p.c[1] * (1 - i / 16) + 2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(p.x, p.y); g.stroke();
    }
    g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2;
    g.beginPath(); g.arc(q.x, q.y - r, r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#222'; g.beginPath(); g.arc(q.x + r * 0.2, q.y - r * 1.1, r * 0.35, 0, 7); g.fill();
  }

  function chispas(g, dt) {
    for (const c of V.chispas) { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 400 * dt; c.v -= dt; }
    V.chispas = V.chispas.filter((c) => c.v > 0);
    for (const c of V.chispas) { g.globalAlpha = Math.min(1, c.v * 2); g.fillStyle = c.color; g.fillRect(c.x - c.t / 2, c.y - c.t / 2, c.t, c.t); }
    g.globalAlpha = 1;
  }

  V.estallido = function (x, y, z, color, n) {
    const q = P(x, y, z);
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.3, v = 120 + Math.random() * 380; V.chispas.push({ x: q.x, y: q.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 150, v: 0.5 + Math.random() * 0.5, t: 3 + Math.random() * 5, color }); }
  };

  V.dibujar = function (g, e, dt, t, controlado) {
    V.cam += (S.util.lim(e.balon.x, 40, 60) - V.cam) * Math.min(1, dt * 4);
    V.off = (60 - e.aj.ancho) / 2;
    V.temblor = Math.max(0, V.temblor - dt * 30);
    g.save(); g.translate((Math.random() - 0.5) * V.temblor, (Math.random() - 0.5) * V.temblor);
    cielo(g, e.aj); cesped(g, e.aj);
    porteria(g, e.aj, 0, 'fondo'); porteria(g, e.aj, e.aj.largo, 'fondo');
    const cosas = e.jugadores.map((j) => ({ y: j.y, f: () => jugador(g, e, j, t, j.id === controlado) }));
    cosas.push({ y: e.balon.y + 0.1, f: () => balon(g, e) });
    cosas.sort((a, b) => a.y - b.y).forEach((c) => c.f());
    porteria(g, e.aj, 0, 'frente'); porteria(g, e.aj, e.aj.largo, 'frente');
    chispas(g, dt);
    g.restore();
  };
})(SOCCER);
