// Fans of Soccer · Menús: título y pantalla de antes del partido (Copa o Amistoso, tu equipo, rival y campo, la estrategia y
// la escalera de la Copa). Solo dibuja y dice qué se ha tocado; lo que pasa después lo decide principal.js.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const UI = S.ui, texto = (...a) => UI.texto(...a);
  const dentro = (p, c) => p.x > c.x && p.x < c.x + c.w && p.y > c.y && p.y < c.y + c.h;

  UI.titulo = function (g, t) {
    g.fillStyle = 'rgba(10,12,30,.7)'; g.fillRect(0, 0, 1280, 720);
    texto(g, 'FANS OF SOCCER', 640, 230, 46, '#ffe14a');
    texto(g, tr('Fútbol sin faltas ni árbitro'), 640, 300, 16, '#fff');
    texto(g, tr('Animales Locos, Microblizz, No-Muertos, Ciberpunks y Phony'), 640, 345, 11, '#ff8a2a');
    if (Math.floor(t * 2) % 2) texto(g, tr('Toca para jugar'), 640, 450, 16, '#fff');
    texto(g, tr('Teclado: flechas · X pase/empujón · C tiro/barrida'), 640, 590, 10, '#ccc');
  };

  // ---------- zonas de la pantalla de antes del partido ----------
  const Z = {
    modo: (i) => ({ x: 430 + i * 220, y: 76, w: 200, h: 46 }),
    equipo: (i) => ({ x: 20 + i * 250, y: 138, w: 238, h: 180 }),
    rival: (i) => ({ x: 20 + i * 250, y: 358, w: 238, h: 44 }),
    campo: (i) => ({ x: 20 + i * 418, y: 418, w: 406, h: 80 }),
    escalon: (i) => ({ x: 20 + i * 313, y: 358, w: 301, h: 140 }),
    estrategia: (i) => ({ x: 20 + i * 313, y: 520, w: 301, h: 64 }),   // la 0 es la alineación; 1 a 3, la estrategia
    jugar: { x: 480, y: 610, w: 320, h: 76 },
  };
  const ESTRATEGIA = [['pasan', 'COMPAÑEROS', 'PASAN', 'REGATEAN'], ['presionan', 'DEFENSA', 'PRESIONAN', 'MARCAN'], ['porteroSube', 'PORTERO', 'SUBE', 'SE QUEDA']];

  function caja(g, c, color, elegida, apagada) {
    g.globalAlpha = apagada ? 0.35 : 1;
    g.fillStyle = elegida ? color : 'rgba(20,24,44,.88)'; g.strokeStyle = elegida ? '#ffe14a' : '#111'; g.lineWidth = elegida ? 6 : 4;
    g.beginPath(); g.roundRect(c.x, c.y, c.w, c.h, 14); g.fill(); g.stroke();
    g.globalAlpha = 1;
  }

  function cartaEquipo(g, eq, c, elegida, img) {
    caja(g, c, eq.color, elegida);
    const ims = eq.jugadores.slice().reverse().map((d) => img[d[0]]).filter(Boolean);
    const ancho = ims.reduce((s, im) => s + im.width, 0), k = Math.min(0.62, (c.w - 16) / Math.max(1, ancho));
    let x = c.x + (c.w - ancho * k) / 2;
    for (const im of ims) { g.drawImage(im, x, c.y + c.h - 8 - im.height * k, im.width * k, im.height * k); x += im.width * k; }
    texto(g, tr(eq.nombre).toUpperCase(), c.x + c.w / 2, c.y + 26, 11, '#fff');
  }

  function textoPequeno(g, t, x, y, color) { g.font = '15px sans-serif'; g.fillStyle = color || '#e8e8e8'; g.textAlign = 'center'; g.fillText(t, x, y); }

  function amistoso(g, aj, sel) {
    aj.equipos.forEach((eq, i) => { const c = Z.rival(i), propio = eq.id === sel.equipo; caja(g, c, eq.color, sel.rival === eq.id, propio); texto(g, tr(eq.nombre).toUpperCase(), c.x + c.w / 2, c.y + 28, 9, '#fff'); });
    texto(g, tr('RIVAL'), 20, 350, 10, '#ffe14a', 'left');
    Object.keys(aj.campos).forEach((id, i) => {
      const c = Z.campo(i), campo = aj.campos[id];
      caja(g, c, campo.franjas[1], sel.campo === id);
      texto(g, tr(campo.nombre).toUpperCase(), c.x + c.w / 2, c.y + 30, 11, '#fff');
      textoPequeno(g, tr(campo.truco), c.x + c.w / 2, c.y + 58);
    });
  }

  // La escalera de la Copa: los rivales por orden, los ya ganados con su marca y el siguiente resaltado.
  function copa(g, aj, sel, progreso) {
    const lista = S.copa.rivales(sel.equipo);
    texto(g, tr('LA COPA MICROBLIZZ'), 20, 350, 10, '#ffe14a', 'left');
    lista.forEach((r, i) => {
      const c = Z.escalon(i), eq = aj.equipos.find((q) => q.id === r.equipo), ganado = i < progreso, siguiente = i === progreso;
      caja(g, c, eq.color, siguiente, false);
      texto(g, (i + 1) + '. ' + tr(eq.nombre).toUpperCase(), c.x + c.w / 2, c.y + 36, 10, '#fff');
      textoPequeno(g, tr(aj.campos[r.campo].nombre), c.x + c.w / 2, c.y + 70, '#ddd');
      if (ganado) marca(g, c.x + c.w / 2, c.y + 104);
      else if (siguiente) texto(g, tr('SIGUIENTE'), c.x + c.w / 2, c.y + 112, 10, '#ffe14a');
    });
    if (progreso >= lista.length) texto(g, tr('¡Ya eres campeón! Juega otra vez la Copa.'), 640, 520, 10, '#ffe14a');
  }

  function marca(g, x, y) {
    g.strokeStyle = '#111'; g.lineWidth = 10; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - 16, y); g.lineTo(x - 4, y + 12); g.lineTo(x + 18, y - 14); g.stroke();
    g.strokeStyle = '#5fe05f'; g.lineWidth = 5; g.stroke();
  }

  const ALINEACION = { defensiva: 'DEFENSIVA', equilibrada: 'EQUILIBRADA', ofensiva: 'OFENSIVA' };
  function estrategia(g, sel) {
    const a = Z.estrategia(0);
    caja(g, a, '#4a2b55', true);
    texto(g, tr('ALINEACIÓN'), a.x + 16, a.y + 26, 9, '#aab', 'left');
    texto(g, tr(ALINEACION[sel.alineacion] || 'EQUILIBRADA'), a.x + 16, a.y + 52, 13, '#fff', 'left');
    texto(g, tr('cambiar'), a.x + a.w - 16, a.y + 44, 8, '#ffe14a', 'right');
    ESTRATEGIA.forEach(([clave, que, si, no], i) => {
      const c = Z.estrategia(i + 1), v = sel.estrategia[clave];
      caja(g, c, '#2b3555', true);
      texto(g, tr(que), c.x + 16, c.y + 26, 9, '#aab', 'left');
      texto(g, tr(v ? si : no), c.x + 16, c.y + 52, 13, '#fff', 'left');
      texto(g, tr('cambiar'), c.x + c.w - 16, c.y + 44, 8, '#ffe14a', 'right');
    });
  }

  UI.menu = function (g, aj, sel, img, t, progreso) {
    g.fillStyle = 'rgba(10,12,30,.86)'; g.fillRect(0, 0, 1280, 720);
    [['copa', 'COPA'], ['amistoso', 'AMISTOSO']].forEach(([id, n], i) => { const c = Z.modo(i); caja(g, c, '#e0383b', sel.modo === id); texto(g, tr(n), c.x + c.w / 2, c.y + 30, 12, '#fff'); });
    texto(g, tr('Tu equipo'), 20, 128, 10, '#ffe14a', 'left');
    aj.equipos.forEach((eq, i) => cartaEquipo(g, eq, Z.equipo(i), sel.equipo === eq.id, img));
    if (sel.modo === 'amistoso') amistoso(g, aj, sel); else copa(g, aj, sel, progreso);
    if (sel.modo === 'amistoso' || progreso < S.copa.rivales(sel.equipo).length) estrategia(g, sel);
    const pulso = 1 + Math.sin(t * 5) * 0.03, j = Z.jugar;
    g.save(); g.translate(j.x + j.w / 2, j.y + j.h / 2); g.scale(pulso, pulso);
    caja(g, { x: -j.w / 2, y: -j.h / 2, w: j.w, h: j.h }, '#e0383b', true); g.restore();
    texto(g, tr('¡A JUGAR!'), j.x + j.w / 2, j.y + 48, 20, '#fff');
  };

  // Qué se ha tocado: { modo } | { equipo } | { rival } | { campo } | { alineacion: true } | { estrategia: clave } | { jugar: true } | null
  UI.tocarMenu = function (p, aj, sel) {
    const ids = aj.equipos.map((q) => q.id), campos = Object.keys(aj.campos);
    for (let i = 0; i < 2; i++) if (dentro(p, Z.modo(i))) return { modo: i ? 'amistoso' : 'copa' };
    for (let i = 0; i < ids.length; i++) if (dentro(p, Z.equipo(i))) return { equipo: ids[i] };
    if (sel.modo === 'amistoso') {
      for (let i = 0; i < ids.length; i++) if (dentro(p, Z.rival(i)) && ids[i] !== sel.equipo) return { rival: ids[i] };
      for (let i = 0; i < campos.length; i++) if (dentro(p, Z.campo(i))) return { campo: campos[i] };
    }
    if (dentro(p, Z.estrategia(0))) return { alineacion: true };
    for (let i = 0; i < ESTRATEGIA.length; i++) if (dentro(p, Z.estrategia(i + 1))) return { estrategia: ESTRATEGIA[i][0] };
    if (dentro(p, Z.jugar)) return { jugar: true };
    return null;
  };
})(SOCCER);
