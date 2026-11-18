// Fans of Air · Pantalla de juego: textos con la letra de píxeles, el HUD de la fase de tierra (retrato y escudo, objetivos, puntos,
// bombas y la brújula hacia el objetivo), los mandos táctiles (palanca donde pones el dedo y dos botones) y el aviso de girar el
// móvil. En el aire el HUD es el panel de la cabina (cabina.js). Los menús están en menu.js; las vistas en vista-aire.js y vista-tierra.js.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const F = (n) => n + "px 'Press Start 2P', monospace";
  const UI = A.ui = { botones: { fuego: { x: 1170, y: 590, r: 68 }, especial: { x: 1030, y: 640, r: 50 } } };

  // La letra de píxeles dibuja las mayúsculas con tilde como minúsculas: en pantalla van sin tilde (como en los carteles de recreativa).
  const SIN_TILDE = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U' };
  function texto(g, t, x, y, tam, color, alin) {
    t = String(t).replace(/[ÁÉÍÓÚ]/g, (c) => SIN_TILDE[c]);
    g.font = F(tam); g.textAlign = alin || 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
    g.lineWidth = Math.max(4, tam / 4.5); g.strokeStyle = '#111'; g.strokeText(t, x, y);
    g.fillStyle = color; g.fillText(t, x, y);
  }
  UI.texto = texto;

  function barra(g, x, y, w, h, v, color) {
    g.fillStyle = '#111'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
    g.fillStyle = '#333'; g.fillRect(x, y, w, h);
    g.fillStyle = color; g.fillRect(x, y, w * Math.max(0, Math.min(1, v)), h);
  }
  UI.barra = barra;

  function retrato(g, img, x, y, alto) {
    g.fillStyle = '#111'; g.fillRect(x - 3, y - 3, alto + 6, alto + 6);
    g.fillStyle = '#2a3250'; g.fillRect(x, y, alto, alto);
    if (!img) return;
    const k = alto / img.height, w = img.width * k;
    g.save(); g.beginPath(); g.rect(x, y, alto, alto); g.clip();
    g.drawImage(img, x + (alto - w) / 2, y, w, alto);
    g.restore();
  }

  function escudo(g, e, img) {
    const c = e.caza, bajo = e.escudo / c.escudo < 0.3, parpadea = bajo && Math.floor(performance.now() / 160) % 2;
    retrato(g, img, 16, 14, 64);
    texto(g, tr('ESCUDO'), 92, 32, 10, '#ccc', 'left');
    barra(g, 92, 42, 260, 16, e.escudo / c.escudo, parpadea ? '#fff' : bajo ? '#ff5a3a' : '#5fe05f');
    texto(g, Math.ceil(e.escudo), 360, 56, 10, '#fff', 'left');
    texto(g, tr(c.nombre).toUpperCase(), 92, 78, 9, c.color, 'left');
  }

  function objetivo(g, e) {
    const AJ = e.aj;
    g.fillStyle = 'rgba(10,12,30,.7)'; g.fillRect(440, 10, 400, 54);
    texto(g, tr('ARRASA LA BASE DE MICROBLIZZ'), 640, 32, 11, '#ffe14a');
    texto(g, tr('Objetivos') + ' ' + e.destruidos + '/' + AJ.tierra.mapa.length, 640, 54, 10, '#fff');
  }

  // La brújula: una flecha hacia el objetivo primario más cercano, con su nombre y a cuánto está (como la del original).
  const NOMBRE = { oficina: 'OFICINA', servidor: 'SERVIDOR', torre: 'TORRE DEL CEO' };
  function brujula(g, e) {
    const t = e.tierra, j = t.jugador, ob = A.tierra.objetivo(t, e.aj), cx = 52, cy = 176, R = 34;
    g.fillStyle = '#111'; g.beginPath(); g.arc(cx, cy, R + 4, 0, 7); g.fill();
    g.fillStyle = '#06200f'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    g.strokeStyle = 'rgba(95,224,95,.4)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, R * 0.6, 0, 7); g.stroke();
    if (!ob) { texto(g, tr('¡BASE ARRASADA!'), 96, 182, 9, '#5fe05f', 'left'); return; }
    const ang = Math.atan2(ob.y - j.y, ob.x - j.x), d = Math.round(Math.hypot(ob.x - j.x, ob.y - j.y) / 10);
    g.save(); g.translate(cx, cy); g.rotate(ang);
    g.fillStyle = '#ffe14a'; g.strokeStyle = '#111'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(R - 6, 0); g.lineTo(-12, -14); g.lineTo(-4, 0); g.lineTo(-12, 14); g.closePath(); g.fill(); g.stroke();
    g.restore();
    texto(g, tr('OBJETIVO') + ': ' + tr(NOMBRE[ob.tipo] || ob.tipo), 96, 170, 9, '#ffe14a', 'left');
    texto(g, d + ' m', 96, 192, 9, '#fff', 'left');
  }

  function municion(g, e) {
    const n = e.bombas, max = e.caza.bombas, y = 104;
    texto(g, tr('BOMBAS'), 92, y, 9, '#ccc', 'left');
    for (let i = 0; i < max; i++) {
      const x = 190 + i * 18;
      g.fillStyle = i < n ? '#ffe14a' : '#333'; g.strokeStyle = '#111'; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y - 5, 7, 0, 7); g.fill(); g.stroke();
    }
    if (e.combo > 1) texto(g, tr('RABIA') + ' x' + e.combo, 92, y + 24, 9, '#ff8a2a', 'left');
  }

  // El HUD de la fase de tierra; en el aire lo dibuja todo la cabina (cabina.js).
  UI.hud = function (g, e, img) {
    if (e.fase !== 'tierra') return;
    escudo(g, e, img);
    objetivo(g, e);
    texto(g, tr('PUNTOS'), 1264, 30, 10, '#ccc', 'right');
    texto(g, String(e.puntos).padStart(6, '0'), 1264, 56, 14, '#ffe14a', 'right');
    const C = e.aj.combustible, poco = e.combustible < C.aviso && Math.floor(performance.now() / 250) % 2;
    texto(g, tr('COMB'), 1056, 92, 9, '#ccc', 'right');
    barra(g, 1064, 82, 200, 12, e.combustible / C.max, poco ? '#ff5a3a' : '#ff8a2a');
    municion(g, e);
    brujula(g, e);
  };

  // Mandos táctiles: la palanca aparece donde apoyas el dedo (lado izquierdo); los botones, abajo a la derecha.
  UI.mandos = function (g, joy, e, tactil) {
    if (!tactil) {   // con teclado, las teclas en el hueco de los botones
      const enAire = e.fase !== 'tierra', x = 1140, y0 = enAire ? 560 : 600;
      texto(g, tr('FLECHAS / WASD'), x, y0, 8, '#9aa4c8'); texto(g, tr('ESPACIO: FUEGO'), x, y0 + 26, 8, '#9aa4c8');
      texto(g, tr(enAire ? 'M: MISIL' : 'M: BOMBA'), x, y0 + 52, 8, '#9aa4c8');
      return;
    }
    if (joy.activo) palanca(g, joy);
    const B = UI.botones, enAire = e.fase !== 'tierra';
    boton(g, B.fuego, '#ff5a3a', tr('FUEGO'), A.vista.img['boton-fuego']);
    boton(g, B.especial, '#3a8cff', tr(enAire ? 'MISIL' : 'BOMBA'), A.vista.img['boton-misil']);
  };

  // La palanca: una base metálica donde pusiste el dedo y el pomo que sigue al dedo, con su sombra y el gatillo.
  function palanca(g, joy) {
    const x = joy.ox + joy.dx * 50, y = joy.oy + joy.dy * 50;
    g.globalAlpha = 0.55;   // la base, medio transparente para no tapar la cabina
    g.fillStyle = '#1c1f27'; g.strokeStyle = '#8a92a6'; g.lineWidth = 4; g.beginPath(); g.arc(joy.ox, joy.oy, 72, 0, 7); g.fill(); g.stroke();
    g.strokeStyle = '#4a5263'; g.lineWidth = 2; g.beginPath(); g.arc(joy.ox, joy.oy, 46, 0, 7); g.stroke();
    g.fillStyle = '#c9ced8'; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; g.beginPath(); g.arc(joy.ox + Math.cos(a) * 60, joy.oy + Math.sin(a) * 60, 4, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + 6, y + 8, 28, 22, 0, 0, 7); g.fill();
    const pomo = g.createRadialGradient(x - 8, y - 10, 4, x, y, 30); pomo.addColorStop(0, '#6a7080'); pomo.addColorStop(1, '#1c1f27');
    g.fillStyle = pomo; g.strokeStyle = '#0d0f14'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 28, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#ff5a3a'; g.beginPath(); g.arc(x, y - 6, 7, 0, 7); g.fill();   // el gatillo
  }

  // Un botón de recreativa (dibujo de Yoshi) que se hunde al pulsarlo; si no ha cargado, uno redondo por código.
  function boton(g, b, color, etiqueta, img) {
    const pulsado = b.pulsado != null, k = pulsado ? 0.92 : 1, r = b.r * k;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(b.x + 5, b.y + 7, b.r, 0, 7); g.fill();
    if (img) { g.globalAlpha = pulsado ? 1 : 0.9; g.drawImage(img, b.x - r * 1.18, b.y - r * 1.18, r * 2.36, r * 2.36); g.globalAlpha = 1; }
    else {
      const cara = g.createRadialGradient(b.x - r * 0.3, b.y - r * 0.35, r * 0.1, b.x, b.y, r);
      cara.addColorStop(0, '#fff'); cara.addColorStop(0.25, color); cara.addColorStop(1, '#111');
      g.fillStyle = '#2a2e38'; g.beginPath(); g.arc(b.x, b.y, r + 8, 0, 7); g.fill();
      g.fillStyle = cara; g.strokeStyle = '#111'; g.lineWidth = 4; g.beginPath(); g.arc(b.x, b.y, r, 0, 7); g.fill(); g.stroke();
    }
    texto(g, etiqueta, b.x, b.y + 5, b.r > 60 ? 13 : 10, '#fff');
  }

  UI.girar = function (g) {
    g.fillStyle = '#0b1020'; g.fillRect(0, 0, 1280, 720);
    texto(g, tr('Gira el móvil para jugar'), 640, 360, 22, '#fff');
  };
})(AIR);
