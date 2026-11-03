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
    if (joy.activo) {
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3; g.beginPath(); g.arc(joy.ox, joy.oy, 70, 0, 7); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(joy.ox + joy.dx * 55, joy.oy + joy.dy * 55, 26, 0, 7); g.fill();
    }
    const B = UI.botones, enAire = e.fase !== 'tierra';
    boton(g, B.fuego, '#ff5a3a', tr('FUEGO'));
    boton(g, B.especial, '#3a8cff', tr(enAire ? 'MISIL' : 'BOMBA'));
  };

  function boton(g, b, color, etiqueta) {
    g.globalAlpha = b.pulsado != null ? 0.95 : 0.7;
    g.fillStyle = color; g.strokeStyle = '#111'; g.lineWidth = 5;
    g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.fill(); g.stroke();
    g.globalAlpha = 1;
    texto(g, etiqueta, b.x, b.y + 5, b.r > 60 ? 13 : 10, '#fff');
  }

  UI.girar = function (g) {
    g.fillStyle = '#0b1020'; g.fillRect(0, 0, 1280, 720);
    texto(g, tr('Gira el móvil para jugar'), 640, 360, 22, '#fff');
  };
})(AIR);
