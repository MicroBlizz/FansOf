// Fans of Soccer · Pantalla: marcador, reloj, barras de energía, mandos táctiles, carteles (¡GOL!, súper tiro) y las pantallas de inicio y final.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const F = (n) => n + "px 'Press Start 2P', monospace";
  const UI = S.ui = { cartel: null, botones: { pase: { x: 1035, y: 625, r: 50 }, tiro: { x: 1175, y: 560, r: 66 } } };

  function texto(g, t, x, y, tam, color, alin) {
    g.font = F(tam); g.textAlign = alin || 'center'; g.lineJoin = 'round';
    g.lineWidth = Math.max(4, tam / 3); g.strokeStyle = '#111'; g.strokeText(t, x, y);
    g.fillStyle = color; g.fillText(t, x, y);
  }
  UI.texto = texto;

  function barra(g, x, y, w, v, color, derecha) {
    g.fillStyle = '#111'; g.fillRect(x - 3, y - 3, w + 6, 18);
    g.fillStyle = '#333'; g.fillRect(x, y, w, 12);
    const lleno = v >= 100, ancho = w * v / 100;
    g.fillStyle = lleno ? (Math.floor(performance.now() / 120) % 2 ? '#fff' : color) : color;
    g.fillRect(derecha ? x + w - ancho : x, y, ancho, 12);
  }

  UI.marcador = function (g, e) {
    const aj = e.aj, m = Math.ceil(e.t), reloj = Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
    g.fillStyle = 'rgba(10,12,30,.78)'; g.fillRect(390, 10, 500, 64);
    texto(g, tr(aj.equipos[0].nombre).toUpperCase(), 610, 38, 12, aj.equipos[0].color, 'right');
    texto(g, tr(aj.equipos[1].nombre).toUpperCase(), 670, 38, 12, aj.equipos[1].color, 'left');
    texto(g, e.marcador[0] + '-' + e.marcador[1], 640, 40, 16, '#fff');
    texto(g, reloj, 640, 66, 11, '#ffe14a');
    barra(g, 20, 20, 300, e.energia[0], aj.equipos[0].color, false);
    barra(g, 960, 20, 300, e.energia[1], aj.equipos[1].color, true);
    texto(g, tr('CRUNCH'), 20, 58, 9, '#ccc', 'left');
    texto(g, tr('CRUNCH'), 1260, 58, 9, '#ccc', 'right');
  };

  function boton(g, b, etiqueta, color, brillo) {
    g.save();
    if (brillo) { g.shadowColor = color; g.shadowBlur = 30; }
    g.globalAlpha = b.pulsado ? 0.95 : 0.7;
    g.fillStyle = color; g.strokeStyle = '#111'; g.lineWidth = 5;
    g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.fill(); g.stroke();
    g.restore();
    texto(g, etiqueta, b.x, b.y + 5, etiqueta.length > 6 ? 9 : 12, '#fff');
  }

  UI.mandos = function (g, e, joy, controlado) {
    const conBalon = e.balon.dueno === controlado, lleno = S.lleno(e, 0);
    boton(g, UI.botones.pase, conBalon ? tr('PASE') : tr('BARRIDA'), '#3a6cff', false);
    boton(g, UI.botones.tiro, conBalon && lleno ? tr('SÚPER') : tr('TIRO'), conBalon && lleno ? '#ff7a1a' : '#e0383b', conBalon && lleno);
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

  UI.titulo = function (g, t) {
    g.fillStyle = 'rgba(10,12,30,.7)'; g.fillRect(0, 0, 1280, 720);
    texto(g, 'FANS OF SOCCER', 640, 230, 46, '#ffe14a');
    texto(g, tr('Animales Locos contra Microblizz'), 640, 300, 16, '#fff');
    texto(g, tr('Sin faltas, sin árbitro'), 640, 345, 12, '#ff8a2a');
    if (Math.floor(t * 2) % 2) texto(g, tr('Toca para jugar'), 640, 450, 16, '#fff');
    texto(g, tr('Mueve: lado izquierdo · Pase/barrida y tiro: botones'), 640, 560, 10, '#ccc');
    texto(g, tr('Teclado: flechas · X pase/barrida · C tiro'), 640, 590, 10, '#ccc');
  };

  UI.final = function (g, e, t) {
    g.fillStyle = 'rgba(10,12,30,.75)'; g.fillRect(0, 0, 1280, 720);
    const gana = e.marcador[0] > e.marcador[1] ? tr('¡HAS GANADO!') : e.marcador[0] < e.marcador[1] ? tr('GANA MICROBLIZZ') : tr('EMPATE');
    texto(g, gana, 640, 260, 36, '#ffe14a');
    texto(g, e.marcador[0] + ' - ' + e.marcador[1], 640, 340, 30, '#fff');
    if (Math.floor(t * 2) % 2) texto(g, tr('Toca para la revancha'), 640, 460, 16, '#fff');
  };

  UI.girar = function (g) {
    g.fillStyle = '#0b1020'; g.fillRect(0, 0, 1280, 720);
    texto(g, tr('Gira el móvil para jugar'), 640, 360, 22, '#fff');
  };
})(SOCCER);
