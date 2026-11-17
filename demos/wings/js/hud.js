// Fans of Wings · El HUD (se pinta sobre el mundo 3D, en una pantalla lógica de 720 de alto y el ancho que dé el móvil): textos con
// la letra de píxeles, escudo, combustible, misiles, derribos, puntos, radar de 360 grados, la retícula, las marcas y flechas de
// los enemigos, y los mandos táctiles (palanca donde apoyas el dedo y botones FUEGO, MISIL y CÁMARA). La cabina está en cabina.js.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const F = (n) => n + "px 'Press Start 2P', monospace";
  const UI = A.ui = { W: 1280, botones: { fuego: { r: 68 }, especial: { r: 50 }, camara: { r: 40 } } };
  const COLOR = { becario: '#6f95ff', caja: '#ffd23c', jefe: '#ff5a3a' };

  // Los botones van pegados al borde derecho, mida lo que mida la pantalla.
  UI.medida = function (ancho) {
    UI.W = ancho;
    Object.assign(UI.botones.fuego, { x: ancho - 110, y: 590 }); Object.assign(UI.botones.especial, { x: ancho - 250, y: 640 }); Object.assign(UI.botones.camara, { x: ancho - 76, y: 420 });
  };

  // La letra de píxeles dibuja las mayúsculas con tilde como minúsculas: en pantalla van sin tilde (como en las recreativas).
  const SIN_TILDE = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U' };
  function texto(g, t, x, y, tam, color, alin) {
    t = String(t).replace(/[ÁÉÍÓÚ]/g, (c) => SIN_TILDE[c]);
    g.font = F(tam); g.textAlign = alin || 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
    g.lineWidth = Math.max(4, tam / 4.5); g.strokeStyle = '#0b1a3a'; g.strokeText(t, x, y);
    g.fillStyle = color; g.fillText(t, x, y);
  }
  UI.texto = texto;

  function barra(g, x, y, w, h, v, color) {
    g.fillStyle = '#0b1a3a'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
    g.fillStyle = '#16305e'; g.fillRect(x, y, w, h);
    g.fillStyle = color; g.fillRect(x, y, w * Math.max(0, Math.min(1, v)), h);
  }
  UI.barra = barra;
  const parpadea = (ms) => Math.floor(performance.now() / ms) % 2 === 1;

  function estado(g, e) {
    const c = e.caza, C = e.aj.combustible, bajo = e.escudo / c.escudo < 0.3, poco = e.combustible < C.aviso;
    texto(g, tr(c.nombre).toUpperCase(), 18, 30, 10, c.color, 'left');
    texto(g, tr('ESCUDO'), 18, 56, 9, '#fff', 'left');
    barra(g, 110, 44, 230, 14, e.escudo / c.escudo, bajo ? (parpadea(160) ? '#fff' : '#ff5a3a') : '#5fe05f');
    texto(g, tr('COMB'), 18, 82, 9, '#fff', 'left');
    barra(g, 110, 70, 230, 14, e.combustible / C.max, poco && parpadea(250) ? '#ff5a3a' : '#ff8a2a');
    texto(g, tr('MISILES'), 18, 108, 9, '#fff', 'left');
    for (let i = 0; i < c.misiles; i++) { g.fillStyle = i < e.misiles ? '#9fe0ff' : '#16305e'; g.strokeStyle = '#0b1a3a'; g.lineWidth = 2; g.fillRect(110 + i * 16, 96, 10, 14); g.strokeRect(110 + i * 16, 96, 10, 14); }
    if (e.combo > 1) texto(g, tr('RABIA') + ' x' + e.combo, 18, 136, 10, '#ff8a2a', 'left');
  }

  function progreso(g, e) {
    const a = e.aire, cx = UI.W / 2;
    if (a.jefe) { texto(g, 'SURVIVALBOT', cx, 30, 11, '#ff5a3a'); barra(g, cx - 160, 40, 320, 12, a.jefe.vida / e.aj.aire.jefe.vida, '#ff5a3a'); return; }
    texto(g, tr('DERRIBOS') + ' ' + Math.min(e.derribos, e.aj.aire.derribos) + '/' + e.aj.aire.derribos, cx, 30, 11, '#ffe14a');
  }

  // Radar de 360 grados: tú en el centro mirando hacia arriba; enemigos, premios e islas alrededor.
  UI.radar = function (g, e, cx, cy, R) {
    const a = e.aire, j = a.jugador, k = R / 2800, VU = A.vuelo;
    g.fillStyle = '#0b1a3a'; g.beginPath(); g.arc(cx, cy, R + 4, 0, 7); g.fill();
    g.fillStyle = '#0c2a17'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
    const rumbo = VU.rumbo(j), co = Math.cos(rumbo), se = Math.sin(rumbo);
    g.fillStyle = '#1f8a45';
    for (const i of A.mundo.islas) {   // las islas están en coordenadas de dibujo (su z es el sur)
      const dx = A.mundo.cerca(i.x, j.pos.x) - j.pos.x, dz = -(A.mundo.cerca(i.z, -j.pos.z) + j.pos.z), r = Math.max(3, 520 * i.e * k);
      g.beginPath(); g.arc(cx + (dx * co - dz * se) * k, cy - (dx * se + dz * co) * k, r, 0, 7); g.fill();
    }
    const punto = (pos, color, tam) => {
      const c = VU.camara(j, pos), d = Math.hypot(c.x, c.z) || 1, m = Math.min(d * k, R - 4);
      g.fillStyle = color; g.fillRect(cx + c.x / d * m - tam / 2, cy - c.z / d * m - tam / 2, tam, tam);
    };
    for (const p of a.premios) punto(p.pos, '#5fe05f', 5);
    for (const en of a.enemigos) punto(en.pos, COLOR[en.tipo], 7);
    if (a.jefe) punto(a.jefe.pos, COLOR.jefe, parpadea(200) ? 11 : 8);
    g.restore();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx, cy - 7); g.lineTo(cx - 5, cy + 5); g.lineTo(cx + 5, cy + 5); g.fill();
  };

  // ---------- retícula, marcas y flechas ----------
  function esquinas(g, x, y, r, color, ancho) {
    g.strokeStyle = '#0b1a3a'; g.lineWidth = ancho + 3; trazo(); g.strokeStyle = color; g.lineWidth = ancho; trazo();
    function trazo() {
      const l = r * 0.45;
      g.beginPath();
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.moveTo(x + sx * r, y + sy * (r - l)); g.lineTo(x + sx * r, y + sy * r); g.lineTo(x + sx * (r - l), y + sy * r); }
      g.stroke();
    }
  }
  function flecha(g, c, color) {
    const cx = UI.W / 2, cy = 360, ang = Math.atan2(-c.y, c.x), rx = cx - 70, ry = 290;
    const x = cx + Math.cos(ang) * rx, y = cy + Math.sin(ang) * ry;
    g.save(); g.translate(x, y); g.rotate(ang);
    g.fillStyle = color; g.strokeStyle = '#0b1a3a'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(22, 0); g.lineTo(-12, -15); g.lineTo(-4, 0); g.lineTo(-12, 15); g.closePath(); g.stroke(); g.fill();
    g.restore();
  }
  const enPantalla = (p) => p.delante && p.x > 30 && p.x < UI.W - 30 && p.y > 30 && p.y < 690;

  function marcas(g, e) {
    const a = e.aire, VI = A.vista, f = a.fijando;
    for (const en of (a.jefe ? a.enemigos.concat([a.jefe]) : a.enemigos)) {
      const q = A.gl.R(en.pos), p = VI.proyecta(q, UI.W), color = COLOR[en.tipo];
      if (!enPantalla(p)) { flecha(g, VI.enCamara(q), color); continue; }
      const r = Math.max(18, Math.min(120, en.radio * 1.3 * 720 / (2 * Math.tan(VI.cam.fov / 2) * p.lejos)));
      const mio = f.id === en.id, fijado = mio && f.fijado;
      esquinas(g, p.x, p.y, mio && !fijado ? r * (1.8 - 0.8 * Math.min(1, f.t / e.caza.fijar)) : r, fijado ? '#ff5a3a' : color, fijado ? 5 : 3);
      if (fijado && parpadea(120)) texto(g, tr('FIJADO'), p.x, p.y - r - 10, 10, '#ff5a3a');
      texto(g, Math.round(p.lejos) + ' m', p.x, p.y + r + 20, 8, '#fff');
    }
  }
  function reticula(g, e) {
    const j = e.aire.jugador, VI = A.vista, p = VI.proyecta(A.gl.R(A.v3.suma(j.pos, A.v3.escala(j.f, 900))), UI.W);
    if (!enPantalla(p)) return;
    g.strokeStyle = '#0b1a3a'; g.lineWidth = 6; cruz(); g.strokeStyle = e.aire.fijando.fijado ? '#ff5a3a' : '#6dff8a'; g.lineWidth = 3; cruz();
    function cruz() { g.beginPath(); g.arc(p.x, p.y, 16, 0, 7); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { g.moveTo(p.x + dx * 9, p.y + dy * 9); g.lineTo(p.x + dx * 26, p.y + dy * 26); } g.stroke(); }
  }

  // El HUD de la misión. enCabina = cuánto de la cabina se ve (0 a 1): con ella puesta, el radar y los datos van en su panel.
  UI.hud = function (g, e, enCabina) {
    if (e.fase === 'aire' && !e.fin) { marcas(g, e); reticula(g, e); }
    estado(g, e); progreso(g, e);
    texto(g, tr('PUNTOS'), UI.W - 18, 30, 10, '#fff', 'right');
    texto(g, String(e.puntos).padStart(6, '0'), UI.W - 18, 56, 14, '#ffe14a', 'right');
    if (enCabina > 0.5) return;
    UI.radar(g, e, UI.W - 76, 140, 58);
    const j = e.aire.jugador;
    texto(g, tr('ALT') + ' ' + Math.round(j.pos.y) + '   ' + tr('VEL') + ' ' + Math.round(j.vel * 3.6), UI.W / 2, 706, 9, '#fff');
  };

  // ---------- mandos ----------
  UI.mandos = function (g, joy, tactil) {
    if (!tactil) { texto(g, tr('FLECHAS / WASD · ESPACIO: FUEGO · M: MISIL · C: CÁMARA'), UI.W / 2, 684, 8, '#fff'); return; }
    if (joy.activo) palanca(g, joy);
    const B = UI.botones;
    boton(g, B.fuego, '#ff5a3a', tr('FUEGO'), 13); boton(g, B.especial, '#3a8cff', tr('MISIL'), 10); boton(g, B.camara, '#ffd23c', tr('CÁMARA'), 7);
  };
  function palanca(g, joy) {
    const x = joy.ox + joy.dx * 50, y = joy.oy + joy.dy * 50;
    g.globalAlpha = 0.5; g.fillStyle = '#0b1a3a'; g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(joy.ox, joy.oy, 72, 0, 7); g.fill(); g.stroke(); g.globalAlpha = 1;
    g.fillStyle = '#ffd23c'; g.strokeStyle = '#0b1a3a'; g.lineWidth = 5; g.beginPath(); g.arc(x, y, 28, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#ff5a3a'; g.beginPath(); g.arc(x, y - 6, 7, 0, 7); g.fill();
  }
  // Un botón de recreativa que se hunde al pulsarlo.
  function boton(g, b, color, etiqueta, tam) {
    const pulsado = b.pulsado != null, baja = pulsado ? 5 : 0;
    g.fillStyle = '#0b1a3a'; g.beginPath(); g.arc(b.x, b.y + 8, b.r + 5, 0, 7); g.fill();
    g.fillStyle = color; g.strokeStyle = '#0b1a3a'; g.lineWidth = 5; g.beginPath(); g.arc(b.x, b.y + baja, b.r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(b.x - b.r * 0.25, b.y + baja - b.r * 0.4, b.r * 0.45, b.r * 0.22, -0.5, 0, 7); g.fill();
    texto(g, etiqueta, b.x, b.y + baja + tam / 2, tam, '#fff');
  }

  UI.girar = function (g) {
    g.fillStyle = '#0b2a55'; g.fillRect(0, 0, UI.W, 720);
    texto(g, tr('Gira el móvil para jugar'), UI.W / 2, 360, Math.min(22, UI.W / 30), '#fff');
  };
})(WINGS);
