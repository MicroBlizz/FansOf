// Fans of Soccer · Pantalla de juego: marcador (parte, gol de oro), reloj, barras CRUNCH, súper tiros que quedan, carrerilla,
// mandos táctiles con su texto según la jugada, carteles (¡GOL!, clima…), descanso y final. Los menús están en menu.js.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const F = (n) => n + "px 'Press Start 2P', monospace";
  const UI = S.ui = { cartel: null, botones: { pase: { x: 1035, y: 625, r: 50 }, tiro: { x: 1175, y: 560, r: 66 } } };

  // La letra de píxeles dibuja las mayúsculas con tilde como minúsculas: en pantalla van sin tilde (como en los carteles de recreativa).
  const SIN_TILDE = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U' };
  function texto(g, t, x, y, tam, color, alin) {
    t = String(t).replace(/[ÁÉÍÓÚ]/g, (c) => SIN_TILDE[c]);
    g.font = F(tam); g.textAlign = alin || 'center'; g.lineJoin = 'round';
    g.lineWidth = Math.max(4, tam / 3); g.strokeStyle = '#111'; g.strokeText(t, x, y);
    g.fillStyle = color; g.fillText(t, x, y);
  }
  UI.texto = texto;

  function barra(g, x, y, w, v, color, derecha) {
    g.fillStyle = '#111'; g.fillRect(x - 3, y - 3, w + 6, 18);
    g.fillStyle = '#333'; g.fillRect(x, y, w, 12);
    const lleno = v >= 100, ancho = w * Math.min(100, v) / 100;
    g.fillStyle = lleno ? (Math.floor(performance.now() / 120) % 2 ? '#fff' : color) : color;
    g.fillRect(derecha ? x + w - ancho : x, y, ancho, 12);
  }

  // Bolitas: los súper tiros que le quedan a cada equipo en esta parte.
  function supers(g, x, n, max, color, derecha) {
    for (let i = 0; i < max; i++) {
      const cx = derecha ? x - i * 22 : x + i * 22;
      g.fillStyle = i < n ? color : '#333'; g.strokeStyle = '#111'; g.lineWidth = 3;
      g.beginPath(); g.arc(cx, 52, 8, 0, 7); g.fill(); g.stroke();
    }
  }

  UI.marcador = function (g, e) {
    const aj = e.aj, m = Math.ceil(e.t), reloj = Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
    g.fillStyle = 'rgba(10,12,30,.78)'; g.fillRect(390, 10, 500, 64);
    texto(g, tr(aj.equipos[0].nombre).toUpperCase(), 610, 38, 12, aj.equipos[0].color, 'right');
    texto(g, tr(aj.equipos[1].nombre).toUpperCase(), 670, 38, 12, aj.equipos[1].color, 'left');
    texto(g, e.marcador[0] + '-' + e.marcador[1], 640, 40, 16, '#fff');
    const parte = e.oro ? tr('GOL DE ORO') : tr('{n}ª PARTE', { n: e.parte });
    texto(g, parte + '  ' + reloj, 640, 66, 10, e.oro ? '#ffcf3a' : '#ffe14a');
    barra(g, 20, 20, 300, e.energia[0], aj.equipos[0].color, false);
    barra(g, 960, 20, 300, e.energia[1], aj.equipos[1].color, true);
    supers(g, 30, e.supers[0], aj.supersPorParte, aj.equipos[0].color, false);
    supers(g, 1250, e.supers[1], aj.supersPorParte, aj.equipos[1].color, true);
    texto(g, tr('CRUNCH'), 30 + aj.supersPorParte * 22, 57, 9, '#ccc', 'left');
    texto(g, tr('CRUNCH'), 1250 - aj.supersPorParte * 22, 57, 9, '#ccc', 'right');
  };

  // Carrerilla del jugador de la persona: cuánto le falta para cargar el súper tiro.
  UI.carrerilla = function (g, e, j) {
    if (!j || e.balon.dueno !== j.id || e.supers[j.eq] <= 0) return;
    const f = j.cargado ? 1 : Math.min(1, j.carrera / e.aj.equipos[j.eq].pasos);
    g.fillStyle = 'rgba(10,12,30,.7)'; g.fillRect(470, 86, 340, 30);
    g.fillStyle = '#333'; g.fillRect(560, 95, 240, 12);
    g.fillStyle = j.cargado ? (Math.floor(performance.now() / 100) % 2 ? '#fff' : '#ffe14a') : '#ffe14a'; g.fillRect(560, 95, 240 * f, 12);
    texto(g, j.cargado ? tr('¡SÚPER!') : tr('CARRERILLA'), 552, 108, 9, '#fff', 'right');
  };

  // Minimapa: con la cámara cerca, enseña dónde está cada uno (puntos de color, el tuyo con anillo amarillo, el balón en blanco).
  UI.minimapa = function (g, e, controlado) {
    const aj = e.aj, w = 200, h = 104, x0 = 540, y0 = 606, k = w / aj.largo, alto = aj.ancho * k, yo = y0 + (h - alto) / 2;
    g.fillStyle = 'rgba(10,12,30,.6)'; g.fillRect(x0 - 6, y0 - 6, w + 12, h + 12);
    g.fillStyle = 'rgba(70,170,80,.55)'; g.fillRect(x0, yo, w, alto);
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.5; g.strokeRect(x0, yo, w, alto);
    g.beginPath(); g.moveTo(x0 + w / 2, yo); g.lineTo(x0 + w / 2, yo + alto); g.stroke();
    for (const j of e.jugadores) {
      g.globalAlpha = j.mareo > 0 ? 0.4 : 1; g.fillStyle = aj.equipos[j.eq].color;
      g.beginPath(); g.arc(x0 + j.x * k, yo + j.y * k, 4, 0, 7); g.fill();
      if (j.id === controlado) { g.strokeStyle = '#ffe14a'; g.lineWidth = 2; g.beginPath(); g.arc(x0 + j.x * k, yo + j.y * k, 7, 0, 7); g.stroke(); }
    }
    g.globalAlpha = 1; g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 1.5;
    g.beginPath(); g.arc(x0 + S.util.lim(e.balon.x, 0, aj.largo) * k, yo + S.util.lim(e.balon.y, 0, aj.ancho) * k, 3.5, 0, 7); g.fill(); g.stroke();
  };

  function boton(g, b, etiqueta, color, brillo) {
    g.save();
    if (brillo) { g.shadowColor = color; g.shadowBlur = 30; }
    g.globalAlpha = b.pulsado ? 0.95 : 0.7;
    g.fillStyle = color; g.strokeStyle = '#111'; g.lineWidth = 5;
    g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.fill(); g.stroke();
    g.restore();
    texto(g, etiqueta, b.x, b.y + 5, etiqueta.length > 9 ? 8 : etiqueta.length > 6 ? 9 : 12, '#fff');
  }

  // Textos de los botones según la jugada: con balón, con un compañero con balón o sin balón.
  const ETIQUETAS = {
    conBalon: ['PASE', 'TIRO'], companero: ['¡PÁSAMELA!', '¡TIRA!'], sinBalon: ['EMPUJÓN', 'BARRIDA'], aire: ['EMPUJÓN', 'CHILENA'],
  };
  // Cara del compañero que lleva el balón encima de los botones: así se ve que las órdenes van para él.
  function cara(g, b, im) {
    const x = b.x, y = b.y - b.r - 22;
    g.save(); g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 3;
    g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); g.stroke(); g.clip();
    g.drawImage(im, x - im.width * 0.3, y - 16, im.width * 0.6, im.height * 0.6); g.restore();
  }

  UI.mandos = function (g, joy, contexto, superListo, caraCompanero) {
    const [a, b] = ETIQUETAS[contexto] || ETIQUETAS.sinBalon, superYa = contexto === 'conBalon' && superListo;
    boton(g, UI.botones.pase, tr(a), '#3a6cff', false);
    boton(g, UI.botones.tiro, superYa ? tr('SÚPER') : tr(b), superYa ? '#ff7a1a' : '#e0383b', superYa || contexto === 'aire');
    if (caraCompanero) { cara(g, UI.botones.pase, caraCompanero); cara(g, UI.botones.tiro, caraCompanero); }
    if (!joy.activo) return;
    g.globalAlpha = 0.5; g.fillStyle = '#111'; g.beginPath(); g.arc(joy.ox, joy.oy, 70, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(joy.ox + joy.dx * 70, joy.oy + joy.dy * 70, 30, 0, 7); g.fill(); g.globalAlpha = 1;
  };

  UI.avisar = function (t, color, dura) { UI.cartel = { t, color, dura, total: dura }; };

  UI.carteles = function (g, dt) {
    const c = UI.cartel;
    if (!c) return;
    c.dura -= dt;
    if (c.dura <= 0) { UI.cartel = null; return; }
    const k = Math.min(1, (c.total - c.dura) * 6);
    texto(g, c.t, 640, 330, Math.round(44 * k + 8), c.color);
  };

  UI.repeticion = function (g, t) {
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, 1280, 50); g.fillRect(0, 670, 1280, 50);
    if (Math.floor(t * 2) % 2) { g.fillStyle = '#e0383b'; g.beginPath(); g.arc(40, 25, 10, 0, 7); g.fill(); }
    texto(g, tr('REPETICIÓN'), 60, 34, 14, '#fff', 'left');
  };

  // Descanso: la escena de chiste del rival a pantalla completa y el marcador.
  UI.descanso = function (g, e, img, t) {
    g.fillStyle = '#0b1020'; g.fillRect(0, 0, 1280, 720);
    const im = img['d-' + e.aj.equipos[1].id];
    if (im) g.drawImage(im, 0, 0, 1280, 720);
    g.fillStyle = 'rgba(10,12,30,.55)'; g.fillRect(0, 0, 1280, 130); g.fillRect(0, 600, 1280, 120);
    texto(g, tr('DESCANSO'), 640, 70, 30, '#ffe14a');
    texto(g, e.marcador[0] + ' - ' + e.marcador[1], 640, 112, 18, '#fff');
    if (Math.floor(t * 2) % 2) texto(g, tr('Toca para la 2ª parte'), 640, 670, 16, '#fff');
  };

  // Final del partido; `copa` (opcional): { gana, campeon, siguiente } para el texto de seguir.
  UI.final = function (g, e, t, copa) {
    g.fillStyle = 'rgba(10,12,30,.75)'; g.fillRect(0, 0, 1280, 720);
    const mio = e.marcador[0], suyo = e.marcador[1], rival = tr(e.aj.equipos[1].nombre).toUpperCase();
    let titulo = mio > suyo ? tr('¡HAS GANADO!') : mio < suyo ? tr('GANA {e}', { e: rival }) : tr('EMPATE');
    if (copa && copa.campeon) titulo = tr('¡CAMPEONES DE LA COPA!');
    texto(g, titulo, 640, 250, 34, '#ffe14a');
    texto(g, mio + ' - ' + suyo, 640, 330, 30, '#fff');
    if (copa && copa.siguiente) texto(g, tr('Siguiente rival: {e}', { e: tr(copa.siguiente).toUpperCase() }), 640, 400, 14, '#ff8a2a');
    if (copa && !copa.gana) texto(g, tr('Hay que ganar para pasar de ronda'), 640, 400, 12, '#ff8a2a');
    if (Math.floor(t * 2) % 2) texto(g, tr('Toca para seguir'), 640, 480, 16, '#fff');
  };

  // El altavoz: junto al marcador durante el partido y arriba a la derecha en las demás pantallas.
  const ALTAVOZ = { partido: { x: 925, y: 42, r: 24 }, fuera: { x: 1236, y: 44, r: 24 } };
  UI.zonaAltavoz = (conMarcador) => (conMarcador ? ALTAVOZ.partido : ALTAVOZ.fuera);

  // Dibujo de altavoz con el contorno grueso de la serie: tantas ondas como volumen (3 alto, 2 medio, 1 bajo) y una X roja en silencio.
  UI.altavoz = function (g, nivel, c) {
    const { x, y } = c, ondas = 3 - nivel;
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    g.fillStyle = 'rgba(10,12,30,.7)'; g.beginPath(); g.arc(x, y, c.r + 4, 0, 7); g.fill();
    g.beginPath(); g.moveTo(x - 15, y - 6); g.lineTo(x - 7, y - 6); g.lineTo(x + 2, y - 14); g.lineTo(x + 2, y + 14); g.lineTo(x - 7, y + 6); g.lineTo(x - 15, y + 6); g.closePath();
    g.lineWidth = 6; g.strokeStyle = '#111'; g.stroke(); g.fillStyle = '#ffe14a'; g.fill();
    for (let i = 0; i < ondas; i++) {
      g.beginPath(); g.arc(x + 2, y, 7 + i * 6, -0.8, 0.8);
      g.lineWidth = 6; g.strokeStyle = '#111'; g.stroke(); g.lineWidth = 3; g.strokeStyle = '#ffe14a'; g.stroke();
    }
    if (ondas <= 0) {
      g.beginPath(); g.moveTo(x + 7, y - 7); g.lineTo(x + 19, y + 7); g.moveTo(x + 19, y - 7); g.lineTo(x + 7, y + 7);
      g.lineWidth = 7; g.strokeStyle = '#111'; g.stroke(); g.lineWidth = 4; g.strokeStyle = '#ff5a5a'; g.stroke();
    }
    g.restore();
  };

  UI.girar = function (g) {
    g.fillStyle = '#0b1020'; g.fillRect(0, 0, 1280, 720);
    texto(g, tr('Gira el móvil para jugar'), 640, 360, 22, '#fff');
  };
})(SOCCER);
