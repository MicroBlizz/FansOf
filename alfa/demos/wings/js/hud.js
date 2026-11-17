// Fans of Wings · El HUD (se pinta sobre el mundo 3D, en una pantalla lógica de 720 de alto y el ancho que dé el aparato), con el
// estilo militar de estilo.js: panel de estado del caza (escudo, combustible, misiles y turbo), objetivos, panel del radar con los
// puntos, cintas de velocidad y altura, rumbo, la retícula, las marcas y flechas de los enemigos y la barra de abajo. En el móvil,
// los mandos táctiles (palanca donde apoyas el dedo y botones ochavados CAÑÓN, MISIL, TURBO, FRENO y CÁMARA); en el PC, las teclas
// en la barra de ayuda. La cabina está en cabina.js.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const F = (n) => n + "px 'Press Start 2P', monospace", E = A.estilo, C = E.C;
  const UI = A.ui = { W: 1280, botones: { fuego: { r: 76 }, especial: { r: 56 }, turbo: { r: 50 }, freno: { r: 44 }, camara: { r: 44 }, pausa: { r: 26 } } };
  const COLOR = { becario: '#6f95ff', caja: '#ffd23c', jefe: '#ff5a3a' };

  // Los botones van pegados al borde derecho, mida lo que mida la pantalla; la pausa, arriba, al lado del panel de estado.
  UI.medida = function (ancho) {
    const B = UI.botones;
    UI.W = ancho;
    Object.assign(B.fuego, { x: ancho - 122, y: 562 }); Object.assign(B.especial, { x: ancho - 278, y: 598 });
    Object.assign(B.turbo, { x: ancho - 407, y: 598 }); Object.assign(B.freno, { x: ancho - 400, y: 494 });
    Object.assign(B.camara, { x: ancho - 110, y: 416 }); Object.assign(B.pausa, { x: 462, y: 50 });
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
    const c = e.caza, K = e.aj.combustible, j = e.aire.jugador, bajo = e.escudo / c.escudo < 0.3, poco = e.combustible < K.aviso, x = 28, y = 22;
    E.panel(g, x, y, 390, 166, e.aj.codigos[c.id] + ' ' + E.may(tr(c.nombre)), bajo ? E.may(tr('DAÑADO')) : 'OK');
    const fila = (n, k, pinta) => { E.t(g, E.may(tr(n)), x + 18, y + 62 + k * 30, 12, C.claro); pinta(x + 124, y + 48 + k * 30); };
    fila('ESCUDO', 0, (px, py) => E.segs(g, px, py, 12, e.escudo / c.escudo, bajo ? (parpadea(160) ? '#fff' : C.rojo) : C.verde));
    fila('COMB', 1, (px, py) => E.segs(g, px, py, 12, e.combustible / K.max, poco && parpadea(250) ? C.rojo : C.amb));
    fila('MISIL', 2, (px, py) => { for (let i = 0; i < c.misiles; i++) { g.fillStyle = i < e.misiles ? '#fff' : C.borde; g.fillRect(px + i * 16, py - 2, 9, 18); } });
    fila('TURBO', 3, (px, py) => E.segs(g, px, py, 12, j.turbo, j.conTurbo ? (parpadea(90) ? '#fff' : C.nar) : j.turbo < 1 ? C.borde : C.cian));
    if (e.combo > 1) texto(g, tr('RABIA') + ' x' + e.combo, x, y + 196, 12, C.nar, 'left');
  }

  // Los objetivos van centrados si caben; si no, en el hueco entre el botón de pausa y el radar.
  function progreso(g, e) {
    const a = e.aire, x0 = 505, x1 = UI.W - 268, w = Math.min(470, x1 - x0), x = Math.max(x0, Math.min(x1 - w, UI.W / 2 - w / 2)), total = e.aj.aire.derribos;
    if (w < 300) return;   // pantalla muy estrecha: no cabe
    g.fillStyle = C.panel; g.fillRect(x, 26, w, 40); g.strokeStyle = C.cian; g.lineWidth = 3; g.strokeRect(x, 26, w, 40);
    if (a.jefe) { E.t(g, 'SURVIVALBOT', x + 16, 53, 11, C.rojo); E.segs(g, x + 160, 39, Math.floor((w - 180) / 18), a.jefe.vida / e.aj.aire.jefe.vida, C.rojo); return; }
    E.t(g, E.may(tr('OBJETIVOS')), x + 16, 53, 12, C.claro);
    E.segs(g, x + w - 76 - total * 18, 39, total, Math.min(1, e.derribos / total), C.rojo);
    E.t(g, Math.min(e.derribos, total) + '/' + total, x + w - 16, 53, 12, C.amb, 'right');
  }

  // Radar redondo de 360 grados (el de la cabina): tú en el centro mirando hacia arriba; enemigos, premios e islas alrededor.
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

  // El panel del radar: tú en el centro mirando hacia arriba; enemigos, premios e islas alrededor, sobre una rejilla. Debajo, los puntos.
  UI.radarPanel = function (g, e, x, y, w) {
    const a = e.aire, j = a.jugador, R = (w - 28) / 2, cx = x + w / 2, cy = E.panel(g, x, y, w, w + 62, E.may(tr('RADAR')), '2,8 KM') + 10 + R, k = R / 2800, VU = A.vuelo;
    g.save(); g.beginPath(); g.rect(cx - R, cy - R, R * 2, R * 2); g.clip();
    g.fillStyle = C.fondo; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    g.fillStyle = 'rgba(42,92,150,.6)';
    for (let i = -R; i <= R; i += R / 3) { g.fillRect(cx + i, cy - R, 1.5, R * 2); g.fillRect(cx - R, cy + i, R * 2, 1.5); }
    const rumbo = VU.rumbo(j), co = Math.cos(rumbo), se = Math.sin(rumbo);
    g.fillStyle = C.isla;
    for (const i of A.mundo.islas) {   // las islas están en coordenadas de dibujo (su z es el sur)
      const dx = A.mundo.cerca(i.x, j.pos.x) - j.pos.x, dz = -(A.mundo.cerca(i.z, -j.pos.z) + j.pos.z), r = Math.max(3, 520 * i.e * k);
      g.fillRect(cx + (dx * co - dz * se) * k - r, cy - (dx * se + dz * co) * k - r * 0.7, r * 2, r * 1.4);
    }
    const punto = (pos, color, tam) => {
      const c = VU.camara(j, pos), d = Math.hypot(c.x, c.z) || 1, m = Math.min(d * k, R - 5);
      g.fillStyle = color; g.fillRect(cx + c.x / d * m - tam / 2, cy - c.z / d * m - tam / 2, tam, tam);
    };
    for (const p of a.premios) punto(p.pos, C.verde, 6);
    for (const en of a.enemigos) punto(en.pos, COLOR[en.tipo], 8);
    if (a.jefe) punto(a.jefe.pos, COLOR.jefe, parpadea(200) ? 13 : 9);
    g.restore();
    g.fillStyle = C.cian; g.beginPath(); g.moveTo(cx, cy - 9); g.lineTo(cx - 7, cy + 7); g.lineTo(cx + 7, cy + 7); g.fill();
    E.t(g, E.may(tr('PUNTOS')), x + 14, y + w + 48, 11, C.claro);
    E.t(g, String(e.puntos).padStart(6, '0'), x + w - 14, y + w + 48, 12, C.amb, 'right');
  };

  // Las cintas de velocidad y altura a los lados de la retícula, y el rumbo debajo.
  function cintas(g, e) {
    const j = e.aire.jugador, cx = UI.W / 2, d = Math.min(200, UI.W * 0.13), rumbo = ((A.vuelo.rumbo(j) * 180 / Math.PI) % 360 + 360) % 360;
    g.fillStyle = C.verde; g.fillRect(cx - d, 262, 2, 210); g.fillRect(cx + d, 262, 2, 210);
    texto(g, tr('VEL'), cx - d - 12, 356, 11, C.verde, 'right'); texto(g, Math.round(j.vel * 3.6), cx - d - 12, 380, 16, C.verde, 'right');
    texto(g, tr('ALT'), cx + d + 12, 356, 11, C.verde, 'left'); texto(g, Math.round(j.pos.y), cx + d + 12, 380, 16, C.verde, 'left');
    texto(g, tr('RBO') + ' ' + String(Math.round(rumbo) % 360).padStart(3, '0'), cx, 512, 11, C.verde);
    if (j.conTurbo && parpadea(110)) texto(g, tr('TURBO'), cx, 236, 14, C.nar);
    else if (j.conFreno) texto(g, tr('FRENO'), cx, 236, 14, '#ffd23c');
  }

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
    if (enCabina > 0.5) { E.t(g, String(e.puntos).padStart(6, '0'), UI.W - 28, 50, 16, C.amb, 'right', C.fondo); return; }
    UI.radarPanel(g, e, UI.W - 250, 22, 222);
    cintas(g, e);
  };

  // ---------- mandos y barra de abajo ----------
  const TECLAS = [['WASD', 'VOLAR'], ['ESPACIO', 'CAÑÓN'], ['M', 'MISIL'], ['MAYÚS', 'TURBO'], ['Q', 'FRENO'], ['C', 'CÁMARA'], ['ESC', 'PAUSA']];
  UI.teclas = (lista) => lista.map(([k, t]) => [E.may(tr(k)), E.may(tr(t))]);
  UI.mandos = function (g, joy, tactil, e) {
    const B = UI.botones, mision = E.may(tr('MISIÓN')) + ' 01';
    E.pie(g, UI.W, tactil ? [[mision, E.may(tr('DESPEJA EL CIELO'))]] : [[mision, '']].concat(UI.teclas(TECLAS)), E.reloj(e.t));
    E.ocho(g, B.pausa, C.azul, '', 0);
    g.fillStyle = C.cian; g.fillRect(B.pausa.x - 8, B.pausa.y - 9, 6, 18); g.fillRect(B.pausa.x + 2, B.pausa.y - 9, 6, 18);
    if (!tactil) return;
    if (joy.activo) palanca(g, joy);
    E.ocho(g, B.fuego, C.rojo, E.may(tr('CAÑÓN')), 17); E.ocho(g, B.especial, C.cian, E.may(tr('MISIL')), 12);
    E.ocho(g, B.turbo, C.verde, E.may(tr('TURBO')), 11); E.ocho(g, B.freno, '#ffd23c', E.may(tr('FRENO')), 10); E.ocho(g, B.camara, C.amb, E.may(tr('CÁMARA')), 9);
  };
  function palanca(g, joy) {
    const x = joy.ox + joy.dx * 50, y = joy.oy + joy.dy * 50;
    g.strokeStyle = C.cian; g.lineWidth = 3; g.setLineDash([12, 9]); g.globalAlpha = 0.8; g.beginPath(); g.arc(joy.ox, joy.oy, 76, 0, 7); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
    g.fillStyle = C.azul; g.strokeStyle = C.cian; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill(); g.stroke();
  }

  // El aviso con la pantalla de pie: las dos frases de HORIZONTAL.lineas() (core), la primera grande y la segunda debajo, más pequeña.
  UI.girar = function (g, lineas) {
    g.fillStyle = C.fondo; g.fillRect(0, 0, UI.W, 720);
    texto(g, lineas[0], UI.W / 2, 345, Math.min(22, UI.W / 30), '#fff');
    texto(g, lineas[1], UI.W / 2, 385, Math.min(14, UI.W / 46), C.amb);
  };
})(WINGS);
