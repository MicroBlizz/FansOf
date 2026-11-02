// Fans of Soccer · Vista: dibuja el campo en falso 3D (perspectiva: lo del fondo más pequeño), los jugadores (vida, KO, carrerilla,
// globos de órdenes), el balón con el recorrido de cada súper tiro, la flecha de pase y el clima. Lienzo lógico de 1280x720;
// la cámara sigue al balón de lado a lado y se acerca en los súper tiros. Los efectos sueltos (chispas, corte, repetición) en efectos.js.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const W = 1280, H = 720, ESC = 14;
  const ZOOM = 1.7, CENTRO = [640, 430];   // cámara cercana, como el clásico: lo que se sigue queda en CENTRO
  const V = S.vista = { cam: 50, off: 0, zoom: 1, zoomObj: 1, foco: { x: 50, y: 30 }, tf: { fx: 640, fy: 430, z: 1 }, estela: [], temblor: 0, img: {}, W, H, vidaVista: {}, globos: {}, ahora: 0 };

  V.cargar = function (nombres) {
    for (const n of nombres) {
      const im = new Image();
      im.onload = () => { V.img[n] = im; };
      im.src = 'img/' + n + (/^(fondo|d-)/.test(n) ? '.jpg' : '.png');
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
    if (f) { const ox = -(V.cam - 50) * 3 - (f.width - W) / 2; for (const k of [-1, 0, 1]) g.drawImage(f, ox + k * f.width, 255 - f.height); }   // repetido a los lados: con la cámara cerca se ve más allá
    else { const gr = g.createLinearGradient(0, 0, 0, 260); gr.addColorStop(0, '#3a2a6e'); gr.addColorStop(1, '#ff9a5a'); g.fillStyle = gr; g.fillRect(0, 0, W, 260); }
  }

  // Charco de aceite: mancha oscura con un brillo de colores.
  function charco(g, ch) {
    const pts = [], brillo = [];
    for (let a = 0; a < 20; a++) { const k = a / 20 * Math.PI * 2, r = ch[2] * (0.85 + 0.15 * Math.sin(a * 2.7)); pts.push([ch[0] + Math.cos(k) * r, ch[1] + Math.sin(k) * r * 0.8]); brillo.push([ch[0] + Math.cos(k) * r * 0.5 - 0.8, ch[1] + Math.sin(k) * r * 0.3 - 0.6]); }
    poli(g, pts, 'rgba(10,10,18,.85)');
    poli(g, brillo, 'rgba(140,90,255,.25)');
  }

  function cesped(g, e) {
    const aj = e.aj, c = aj.campo, m = aj.ancho / 2;
    poli(g, [[-14, -6 - V.off], [aj.largo + 14, -6 - V.off], [aj.largo + 14, 72 - V.off], [-14, 72 - V.off]], c.suelo);
    for (let k = 0; k < 10; k++) poli(g, [[k * 10, 0], [k * 10 + 10, 0], [k * 10 + 10, aj.ancho], [k * 10, aj.ancho]], c.franjas[k % 2]);
    for (const ch of S._.charcos(e)) charco(g, ch);
    g.strokeStyle = c.lineas; g.lineWidth = 3;
    linea(g, [[0, 0], [aj.largo, 0], [aj.largo, aj.ancho], [0, aj.ancho]], true);
    linea(g, [[aj.largo / 2, 0], [aj.largo / 2, aj.ancho]]);
    const r = Math.min(9, aj.ancho / 4), circ = [];
    for (let a = 0; a <= 32; a++) circ.push([aj.largo / 2 + Math.cos(a / 16 * Math.PI) * r, m + Math.sin(a / 16 * Math.PI) * r]);
    linea(g, circ);
    const ag = Math.min(16, m - 2);
    for (const x0 of [0, aj.largo]) { const d = x0 ? -1 : 1; linea(g, [[x0, m - ag], [x0 + d * 16, m - ag], [x0 + d * 16, m + ag], [x0, m + ag]]); linea(g, [[x0, m - 9], [x0 + d * 6, m - 9], [x0 + d * 6, m + 9], [x0, m + 9]]); }
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

  function estrella(g, x, y, r, color) {
    g.fillStyle = color; g.strokeStyle = '#3a2a00'; g.lineWidth = 2;
    g.beginPath(); for (let i = 0; i < 10; i++) { const rr = (i % 2 ? r * 0.4 : r), b = i * Math.PI / 5 - Math.PI / 2; g.lineTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr); }
    g.closePath(); g.fill(); g.stroke();
  }
  V.estrella = estrella;

  function mareo(g, j, q, t) {
    for (let k = 0; k < 3; k++) {
      const a = t * 5 + k * 2.1;
      estrella(g, q.x + Math.cos(a) * 22 * q.s, q.y - 60 * q.s + Math.sin(a) * 7 * q.s, 8 * q.s, '#ffe14a');
    }
    if (j.ko > 0) S.ui.texto(g, 'KO ' + Math.ceil(j.ko), q.x, q.y - 82 * q.s, Math.round(12 * q.s + 4), '#ff5a5a');
  }

  function cuerpoProvisional(g, j, color, h) {
    g.fillStyle = color; g.strokeStyle = '#111'; g.lineWidth = 3;
    g.beginPath(); g.roundRect(-h * 0.22, -h * 0.75, h * 0.44, h * 0.6, 10); g.fill(); g.stroke();
    g.fillStyle = '#f2d2b0'; g.beginPath(); g.arc(0, -h * 0.85, h * 0.17, 0, 7); g.fill(); g.stroke();
  }

  // Barra de vida: solo un momento después de un golpe (la vida va escondida, como en el clásico).
  function barraVida(g, j, q, h) {
    const desde = V.vidaVista[j.id];
    if (!desde || V.ahora - desde > 1.4 || j.puesto === 'portero') return;
    const w = 46 * q.s, y = q.y - h - 10, f = j.vida / j.vidaMax;
    g.fillStyle = '#111'; g.fillRect(q.x - w / 2 - 2, y - 2, w + 4, 9);
    g.fillStyle = f > 0.5 ? '#5fe05f' : f > 0.25 ? '#ffc23a' : '#ff4a4a'; g.fillRect(q.x - w / 2, y, w * f, 5);
  }

  function aura(g, j, q, color, t) {
    g.save(); g.globalAlpha = 0.45 + Math.sin(t * 12) * 0.25; g.strokeStyle = color; g.lineWidth = 5;
    g.shadowColor = color; g.shadowBlur = 18;
    g.beginPath(); g.ellipse(q.x, q.y - 40 * q.s, 30 * q.s, 52 * q.s, 0, 0, 7); g.stroke(); g.restore();
  }

  function pose(g, j, q) {
    const salto = j.vuelo > 0 ? Math.sin((0.7 - j.vuelo) / 0.7 * Math.PI) * 40 * q.s : 0;
    g.translate(q.x, q.y - salto - Math.abs(Math.sin(j.corre * 0.9)) * 6 * q.s);
    if (j.vuelo > 0) g.rotate(j.mira * (0.7 - j.vuelo) * 9);
    else if (j.mareo > 0) g.rotate(j.mira * 1.45);
    else if (j.barrida > 0) g.rotate(j.mira * 1.1);
    else if (j.empujon > 0) g.rotate(j.mira * 0.35);
    else g.rotate(Math.sin(j.corre * 0.9) * 0.05);
    g.scale(j.mira, 1);
  }

  function jugador(g, e, j, t, controlado) {
    const q = P(j.x, j.y, 0), color = e.aj.equipos[j.eq].color, im = V.img[j.sprite];
    const h = (im ? im.height * 0.62 : 100) * q.s;
    g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(q.x, q.y, 22 * q.s, 7 * q.s, 0, 0, 7); g.fill();
    g.strokeStyle = controlado ? '#ffe14a' : color; g.lineWidth = controlado ? 4 : 3;
    g.beginPath(); g.ellipse(q.x, q.y, 20 * q.s, 6 * q.s, 0, 0, 7); g.stroke();
    if (j.cargado) aura(g, j, q, color, t);
    g.save(); pose(g, j, q);
    if (im) g.drawImage(im, -im.width * 0.62 * q.s / 2, -h, im.width * 0.62 * q.s, h); else cuerpoProvisional(g, j, color, h);
    g.restore();
    if (j.mareo > 0) mareo(g, j, q, t);
    barraVida(g, j, q, h);
    if (controlado) { const y = q.y - h - 16; g.fillStyle = '#ffe14a'; g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.moveTo(q.x - 9, y - 12); g.lineTo(q.x + 9, y - 12); g.lineTo(q.x, y); g.closePath(); g.fill(); g.stroke(); }
    globo(g, e, j, q, h);
  }

  // Globo de cómic con la cara del compañero que contesta a una orden.
  function globo(g, e, j, q, h) {
    const gl = V.globos[j.id];
    if (!gl || V.ahora - gl.desde > 1.3) return;
    const x = q.x + 30, y = q.y - h - 46, im = V.img[j.sprite];
    g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 3;
    g.beginPath(); g.roundRect(x, y - 26, 190, 44, 12); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x + 10, y + 18); g.lineTo(x - 2, y + 30); g.lineTo(x + 26, y + 18); g.fill();
    if (im) { g.save(); g.beginPath(); g.arc(x + 22, y - 4, 17, 0, 7); g.clip(); g.drawImage(im, x + 22 - im.width * 0.22, y - 10, im.width * 0.44, im.height * 0.44); g.restore(); }
    g.font = "10px 'Press Start 2P', monospace"; g.textAlign = 'left'; g.fillStyle = gl.ok ? '#1a7a2a' : '#c0262b';
    g.fillText(gl.texto, x + 46, y);
  }

  // ---------- balón y súper tiros ----------
  const COLOR_TIRO = { normal: ['rgba(255,255,255,', 6], zanahoria: ['rgba(255,140,30,', 16], carga: ['rgba(60,120,255,', 16],
    fantasma: ['rgba(150,80,230,', 18], teletransporte: ['rgba(30,220,240,', 12], factura: ['rgba(240,190,40,', 16] };

  function pelota(g, x, y, r, alfa) {
    g.globalAlpha = alfa; g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2;
    g.beginPath(); g.arc(x, y - r, r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#222'; g.beginPath(); g.arc(x + r * 0.2, y - r * 1.1, r * 0.35, 0, 7); g.fill(); g.globalAlpha = 1;
  }

  function estela(g, q, c) {
    V.estela.unshift(c ? { x: q.x, y: q.y, c } : null); V.estela.length = Math.min(V.estela.length, 16);
    g.lineCap = 'round';
    for (let i = 1; i < V.estela.length; i++) {
      const a = V.estela[i - 1], p = V.estela[i];
      if (!a || !p) continue;
      g.strokeStyle = p.c[0] + (1 - i / 16) * 0.8 + ')'; g.lineWidth = p.c[1] * (1 - i / 16) + 2;
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(p.x, p.y); g.stroke();
    }
  }

  function balon(g, e, t) {
    const b = e.balon, q = P(b.x, b.y, b.z), q0 = P(b.x, b.y, 0), r = 0.55 * ESC * q.s, tr = b.tiro;
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(q0.x, q0.y, r * 1.1, r * 0.4, 0, 0, 7); g.fill();
    estela(g, q, tr ? COLOR_TIRO[tr.tipo] || COLOR_TIRO.normal : null);
    if (tr && tr.tipo === 'factura') for (const k of [-1, 1]) { const f = P(b.x, b.y + k * (1.6 + Math.sin(t * 18) * 0.8), b.z); pelota(g, f.x, f.y, r, 0.75); }
    if (tr && tr.tipo === 'fantasma') { g.save(); g.shadowColor = '#7dff6a'; g.shadowBlur = 25; pelota(g, q.x, q.y, r * 1.2, 0.6); g.restore(); }
    else pelota(g, q.x, q.y, r, 1);
    if (tr && tr.cargo > 0) cargando(g, q, tr.cargo / 0.55);
  }

  // El «pantallazo de carga» del CEO: barra de progreso encima del balón congelado.
  function cargando(g, q, falta) {
    g.fillStyle = '#111'; g.fillRect(q.x - 52, q.y - 58, 104, 18);
    g.fillStyle = '#3a6cff'; g.fillRect(q.x - 49, q.y - 55, 98 * (1 - falta), 12);
    S.ui.texto(g, Math.round((1 - falta) * 99) + '%', q.x, q.y - 66, 10, '#fff');
  }

  // Flecha en el suelo hacia el compañero que recibiría el pase.
  V.flechaPase = function (g, e, controlado, mx, my) {
    const j = e.jugadores[controlado];
    if (!j || e.balon.dueno !== controlado) return;
    const o = S.mejorCompanero(e, j, mx, my);
    if (!o) return;
    const a = P(j.x, j.y, 0), b = P(o.x, o.y, 0), ang = Math.atan2(b.y - a.y, b.x - a.x);
    g.save(); g.globalAlpha = 0.55; g.strokeStyle = '#ffe14a'; g.lineWidth = 4; g.setLineDash([12, 10]);
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x - Math.cos(ang) * 22, b.y - Math.sin(ang) * 22); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#ffe14a'; g.beginPath(); g.moveTo(b.x - Math.cos(ang) * 8, b.y - Math.sin(ang) * 8);
    g.lineTo(b.x - Math.cos(ang - 0.5) * 28, b.y - Math.sin(ang - 0.5) * 28); g.lineTo(b.x - Math.cos(ang + 0.5) * 28, b.y - Math.sin(ang + 0.5) * 28); g.fill();
    g.restore();
  };

  // La cámara sigue al balón en las dos direcciones; en los súper tiros va con retraso y se queda atrás, como en el clásico.
  function seguir(e, dt) {
    const b = e.balon, rapido = b.tiro && b.tiro.tipo !== 'normal', k = Math.min(1, dt * (rapido ? 1.3 : 5));
    V.foco.x += (S.util.lim(b.x, 12, e.aj.largo - 12) - V.foco.x) * k;
    V.foco.y += (S.util.lim(b.y, 4, e.aj.ancho - 4) - V.foco.y) * k;
    V.cam = V.foco.x;
  }
  // De coordenadas de la escena (ya proyectadas con P) a la pantalla, con la cámara cercana aplicada.
  V.aPantalla = (q) => ({ x: CENTRO[0] + (q.x - V.tf.fx) * V.tf.z, y: CENTRO[1] + (q.y - V.tf.fy) * V.tf.z });

  // Escena entera; `foto` (opcional) sustituye posiciones para la repetición del gol.
  V.dibujar = function (g, e, dt, t, controlado, extra) {
    V.ahora = t;
    seguir(e, dt);
    V.off = (60 - e.aj.ancho) / 2;
    V.zoom += (V.zoomObj - V.zoom) * Math.min(1, dt * 8);
    V.temblor = Math.max(0, V.temblor - dt * 30);
    const f = P(V.foco.x, V.foco.y, 0), z = (extra && extra.lejos ? 1 : ZOOM) * V.zoom;
    V.tf = { fx: f.x, fy: f.y, z };
    g.save();
    g.translate(CENTRO[0], CENTRO[1]); g.scale(z, z); g.translate(-f.x, -f.y);
    g.translate((Math.random() - 0.5) * V.temblor, (Math.random() - 0.5) * V.temblor);
    cielo(g, e.aj); cesped(g, e);
    if (extra && extra.flecha) V.flechaPase(g, e, controlado, extra.flecha[0], extra.flecha[1]);
    porteria(g, e.aj, 0, 'fondo'); porteria(g, e.aj, e.aj.largo, 'fondo');
    const cosas = e.jugadores.map((j) => ({ y: j.y, f: () => jugador(g, e, j, t, j.id === controlado) }));
    cosas.push({ y: e.balon.y + 0.1, f: () => balon(g, e, t) });
    cosas.sort((a, b) => a.y - b.y).forEach((c) => c.f());
    porteria(g, e.aj, 0, 'frente'); porteria(g, e.aj, e.aj.largo, 'frente');
    S.efectos.chispas(g, dt);
    g.restore();
    S.efectos.clima(g, e, t);
  };
})(SOCCER);
