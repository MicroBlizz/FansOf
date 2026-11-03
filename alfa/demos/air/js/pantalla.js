// Fans of Air · Pantalla de juego: textos con la letra de píxeles, el HUD (retrato y escudo, objetivo de la fase, puntos, misiles o
// bombas y la vida del jefe), los mandos táctiles (palanca donde pones el dedo y dos botones) y el aviso de girar el móvil.
// Los menús (título, hangar y final) están en menu.js; las vistas del aire y de la tierra en vista-aire.js y vista-tierra.js.
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
    g.lineWidth = Math.max(4, tam / 3); g.strokeStyle = '#111'; g.strokeText(t, x, y);
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
    if (e.fase === 'aire' && e.aire.jefe) {
      texto(g, tr('¡SURVIVALBOT!'), 640, 32, 12, '#ff5a3a');
      barra(g, 470, 42, 340, 12, e.aire.jefe.vida / AJ.aire.jefe.vida, '#ff5a3a');
    } else if (e.fase === 'aire' || e.fase === 'transicion') {
      texto(g, tr('DESPEJA EL CIELO'), 640, 32, 11, '#ffe14a');
      texto(g, tr('Derribos') + ' ' + Math.min(e.derribos, AJ.aire.derribos) + '/' + AJ.aire.derribos, 640, 54, 10, '#fff');
    } else {
      const torre = e.tierra.objetivos.find((o) => o.tipo === 'torre');
      texto(g, tr('DESTRUYE LA TORRE DEL CEO'), 640, 32, 11, '#ffe14a');
      if (torre && e.tierra.parado) barra(g, 470, 42, 340, 12, torre.vida / AJ.tierra.objetivos.torre.vida, '#ff5a3a');
      else texto(g, tr('Objetivos') + ' ' + e.destruidos + '/' + AJ.tierra.mapa.length, 640, 54, 10, '#fff');
    }
  }

  // Misiles (en el aire) o bombas (en tierra) que quedan, debajo del escudo; y la RABIA si hay combo.
  function municion(g, e) {
    const enAire = e.fase !== 'tierra', n = enAire ? e.misiles : e.bombas, max = enAire ? e.caza.misiles : e.caza.bombas, y = 104;
    texto(g, tr(enAire ? 'MISILES' : 'BOMBAS'), 92, y, 9, '#ccc', 'left');
    for (let i = 0; i < max; i++) {
      const x = 190 + i * 18;
      g.fillStyle = i < n ? (enAire ? '#9fe0ff' : '#ffe14a') : '#333'; g.strokeStyle = '#111'; g.lineWidth = 2;
      g.beginPath();
      if (enAire) { g.moveTo(x, y - 14); g.lineTo(x + 6, y + 2); g.lineTo(x - 6, y + 2); g.closePath(); }
      else g.arc(x, y - 5, 7, 0, 7);
      g.fill(); g.stroke();
    }
    if (e.combo > 1) texto(g, tr('RABIA') + ' x' + e.combo, 92, y + 24, 9, '#ff8a2a', 'left');
  }

  UI.hud = function (g, e, img) {
    escudo(g, e, img);
    objetivo(g, e);
    texto(g, tr('PUNTOS'), 1264, 30, 10, '#ccc', 'right');
    texto(g, String(e.puntos).padStart(6, '0'), 1264, 56, 14, '#ffe14a', 'right');
    municion(g, e);
  };

  // Mandos táctiles: la palanca aparece donde apoyas el dedo (lado izquierdo); los botones, abajo a la derecha.
  UI.mandos = function (g, joy, e, tactil) {
    if (!tactil) { texto(g, tr('Flechas o WASD mover · ESPACIO ametralladora · M o X misil / bomba'), 640, 712, 8, '#9aa4c8'); return; }
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
