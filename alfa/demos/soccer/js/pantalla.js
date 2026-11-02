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

  UI.mandos = function (g, e, joy, controlado, eq) {
    const conBalon = e.balon.dueno === controlado, lleno = S.lleno(e, eq);
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

  UI.final = function (g, e, t, eq) {
    g.fillStyle = 'rgba(10,12,30,.75)'; g.fillRect(0, 0, 1280, 720);
    const mio = e.marcador[eq], suyo = e.marcador[1 - eq], rival = tr(e.aj.equipos[1 - eq].nombre).toUpperCase();
    const gana = mio > suyo ? tr('¡HAS GANADO!') : mio < suyo ? tr('GANA {e}', { e: rival }) : tr('EMPATE');
    texto(g, gana, 640, 260, 36, '#ffe14a');
    texto(g, e.marcador[0] + ' - ' + e.marcador[1], 640, 340, 30, '#fff');
    if (Math.floor(t * 2) % 2) texto(g, tr('Toca para la revancha'), 640, 460, 16, '#fff');
  };

  // ---------- elegir equipo y campo ----------
  const CARTA_EQ = (i) => ({ x: 330 + i * 620 - 270, y: 150, w: 540, h: 200 });
  const CARTA_CAMPO = (i) => ({ x: 70 + i * 390, y: 420, w: 360, h: 130 });
  const JUGAR = { x: 640, y: 640, r: 0, w: 320, h: 70 };
  const dentroCaja = (p, c) => p.x > c.x && p.x < c.x + c.w && p.y > c.y && p.y < c.y + c.h;

  function caja(g, c, color, elegida) {
    g.fillStyle = elegida ? color : 'rgba(20,24,44,.85)'; g.strokeStyle = elegida ? '#ffe14a' : '#111'; g.lineWidth = elegida ? 6 : 4;
    g.beginPath(); g.roundRect(c.x, c.y, c.w, c.h, 16); g.fill(); g.stroke();
  }

  function cartaEquipo(g, eq, i, elegida, img) {
    const c = CARTA_EQ(i);
    caja(g, c, eq.color, elegida);
    const ims = eq.jugadores.slice().reverse().map((d) => img[d[0]]).filter(Boolean);
    const ancho = ims.reduce((s, im) => s + im.width, 0), k = Math.min(0.85, (c.w - 40) / Math.max(1, ancho));
    let x = c.x + (c.w - ancho * k) / 2;
    for (const im of ims) { g.drawImage(im, x, c.y + c.h - 10 - im.height * k, im.width * k, im.height * k); x += im.width * k; }
    texto(g, tr(eq.nombre).toUpperCase(), c.x + c.w / 2, c.y + 34, 16, '#fff');
  }

  function cartaCampo(g, campo, i, elegida) {
    const c = CARTA_CAMPO(i);
    caja(g, c, campo.franjas[1], elegida);
    texto(g, tr(campo.nombre).toUpperCase(), c.x + c.w / 2, c.y + 46, 12, '#fff');
    g.font = "16px sans-serif"; g.fillStyle = '#e8e8e8'; g.textAlign = 'center';
    const palabras = tr(campo.truco).split(' '), lineas = [''];
    for (const w of palabras) { if ((lineas[lineas.length - 1] + ' ' + w).length > 34) lineas.push(w); else lineas[lineas.length - 1] += (lineas[lineas.length - 1] ? ' ' : '') + w; }
    lineas.forEach((l, k) => g.fillText(l, c.x + c.w / 2, c.y + 80 + k * 22));
  }

  UI.menu = function (g, aj, sel, img, t) {
    g.fillStyle = 'rgba(10,12,30,.82)'; g.fillRect(0, 0, 1280, 720);
    texto(g, tr('Elige tu equipo'), 640, 120, 18, '#ffe14a');
    aj.equipos.forEach((eq, i) => cartaEquipo(g, eq, i, sel.equipo === i, img));
    texto(g, tr('Elige el campo'), 640, 400, 18, '#ffe14a');
    Object.keys(aj.campos).forEach((id, i) => cartaCampo(g, aj.campos[id], i, sel.campo === id));
    const pulso = 1 + Math.sin(t * 5) * 0.03;
    g.save(); g.translate(JUGAR.x, JUGAR.y); g.scale(pulso, pulso);
    caja(g, { x: -JUGAR.w / 2, y: -JUGAR.h / 2, w: JUGAR.w, h: JUGAR.h }, '#e0383b', true);
    g.restore();
    texto(g, tr('¡A JUGAR!'), JUGAR.x, JUGAR.y + 9, 20, '#fff');
  };

  // Qué se ha tocado en el menú: { equipo: n } | { campo: id } | { jugar: true } | null
  UI.tocarMenu = function (p, aj) {
    for (let i = 0; i < aj.equipos.length; i++) if (dentroCaja(p, CARTA_EQ(i))) return { equipo: i };
    const ids = Object.keys(aj.campos);
    for (let i = 0; i < ids.length; i++) if (dentroCaja(p, CARTA_CAMPO(i))) return { campo: ids[i] };
    if (dentroCaja(p, { x: JUGAR.x - JUGAR.w / 2, y: JUGAR.y - JUGAR.h / 2, w: JUGAR.w, h: JUGAR.h })) return { jugar: true };
    return null;
  };

  UI.girar = function (g) {
    g.fillStyle = '#0b1020'; g.fillRect(0, 0, 1280, 720);
    texto(g, tr('Gira el móvil para jugar'), 640, 360, 22, '#fff');
  };
})(SOCCER);
