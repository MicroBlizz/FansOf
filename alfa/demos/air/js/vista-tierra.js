// Fans of Air · Vista de la tierra: el mapa de la base de Microblizz que baja mientras avanzas (la imagen se repite espejada para
// que no se note el corte), los objetivos en el suelo con su sombra y su daño, tu caza visto desde arriba con su sombra, las balas,
// las bombas cayendo con su punto de mira y los tiros de las defensas. Lienzo lógico de 1280x720.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const V = A.vista = A.vista || { img: {}, W: 1280, H: 720 };
  const VT = V.tierra = { golpes: {} };
  const COLOR = { oficina: '#6a7280', servidor: '#9aa4c8', torreta: '#3a6cff', tanque: '#2d4a8a', torre: '#1b2a6e' };
  const ESCALA = { torre: 1.5 };   // ancho del dibujo respecto al radio (2.3 si no se dice): la Torre es alta y se dibuja más estrecha
  const Y = (e, y) => A.tierra.pantallaY(e.tierra, e.aj.tierra.alto, y);

  VT.evento = function (ev) { if (ev.tipo === 'impactoSuelo') VT.golpes[Math.round(ev.x) + ':' + Math.round(ev.y)] = performance.now(); };

  function mapa(g, e) {
    const img = V.img.mapa, av = e.tierra.avance;
    if (!img) {
      g.fillStyle = '#3f4a3a'; g.fillRect(0, 0, 1280, 720);
      g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2;
      for (let y = (av % 120) - 120; y < 720; y += 120) { g.beginPath(); g.moveTo(0, y); g.lineTo(1280, y); g.stroke(); }
      return;
    }
    const alto = 1280 * img.height / img.width, par = alto * 2, off = av % par;
    for (let k = -2; k <= 1; k++) {
      const y = off + k * alto, espejo = ((k % 2) + 2) % 2 === 1;
      if (y > 720 || y + alto < 0) continue;
      g.save();
      if (espejo) { g.translate(0, y + alto); g.scale(1, -1); g.drawImage(img, 0, 0, 1280, alto); }
      else g.drawImage(img, 0, y, 1280, alto);
      g.restore();
    }
  }

  function objetivo(g, e, ob, t) {
    const d = e.aj.tierra.objetivos[ob.tipo], y = Y(e, ob.y), img = V.img['suelo-' + ob.tipo];
    const tocado = performance.now() - (VT.golpes[Math.round(ob.x) + ':' + Math.round(y)] || 0) < 90;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(ob.x + 8, y + 10, d.radio, d.radio * 0.8, 0, 0, 7); g.fill();
    g.save(); g.translate(ob.x, y);
    if (ob.tipo === 'tanque') g.rotate(ob.dir > 0 ? 0.25 : -0.25);
    if (tocado) g.filter = 'brightness(3)';
    if (img) { const w = d.radio * (ESCALA[ob.tipo] || 2.3), h = w * img.height / img.width; g.drawImage(img, -w / 2, -h / 2, w, h); }
    else { g.fillStyle = COLOR[ob.tipo]; g.strokeStyle = '#111'; g.lineWidth = 4; g.fillRect(-d.radio, -d.radio, d.radio * 2, d.radio * 2); g.strokeRect(-d.radio, -d.radio, d.radio * 2, d.radio * 2); }
    g.restore();
    if (ob.vida < d.vida && !d.final) A.ui.barra(g, ob.x - 30, y - d.radio - 16, 60, 6, ob.vida / d.vida, '#ffe14a');   // la vida de la Torre va en el HUD
  }

  function caza(g, e, t) {
    const j = e.tierra.jugador, img = V.img['cenital-' + e.caza.id], V0 = e.aj.tierra.velBase * e.caza.vel, giro = j.vx / V0 * 0.35;
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(j.x + 26, j.y + 40, 34, 22, 0, 0, 7); g.fill();
    g.save(); g.translate(j.x, j.y); g.rotate(giro);
    g.fillStyle = 'rgba(255,170,60,' + (0.5 + 0.3 * Math.sin(t * 40)) + ')';
    g.beginPath(); g.ellipse(0, 46, 10, 18, 0, 0, 7); g.fill();
    if (img) { const w = 120, h = w * img.height / img.width; g.drawImage(img, -w / 2, -h / 2, w, h); }
    else { g.fillStyle = e.caza.color; g.strokeStyle = '#111'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -50); g.lineTo(44, 36); g.lineTo(0, 20); g.lineTo(-44, 36); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  }

  function mira(g, e, t) {
    const j = e.tierra.jugador, AJ = e.aj.tierra, y = j.y - AJ.bomba.delante, R = AJ.bomba.radio * e.caza.radioBomba;
    if (e.bombas <= 0 || e.tierra.fin) return;
    g.strokeStyle = 'rgba(255,225,74,' + (0.55 + 0.3 * Math.sin(t * 6)) + ')'; g.lineWidth = 3; g.setLineDash([10, 8]);
    g.beginPath(); g.arc(j.x, y, R * 0.55, 0, 7); g.stroke();
    g.setLineDash([]);
    g.beginPath(); g.moveTo(j.x - 12, y); g.lineTo(j.x + 12, y); g.moveTo(j.x, y - 12); g.lineTo(j.x, y + 12); g.stroke();
  }

  function bombas(g, e) {
    const AJ = e.aj.tierra;
    for (const b of e.tierra.bombas) {
      const y = Y(e, b.y), k = b.t / AJ.bomba.cae;   // k = 1 recién soltada, 0 a punto de estallar
      g.strokeStyle = 'rgba(255,90,58,.8)'; g.lineWidth = 3; g.beginPath(); g.arc(b.x, y, 14 + 30 * (1 - k), 0, 7); g.stroke();
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(b.x + 10 * k, y + 8 * k, 10, 6, 0, 0, 7); g.fill();
      g.fillStyle = '#2a2a2a'; g.strokeStyle = '#111'; g.lineWidth = 2;
      g.beginPath(); g.ellipse(b.x, y - 60 * k, 9 + 9 * k, 14 + 12 * k, 0, 0, 7); g.fill(); g.stroke();
    }
  }

  function disparos(g, e) {
    g.strokeStyle = '#ffe14a'; g.lineWidth = 6; g.lineCap = 'round';
    for (const b of e.tierra.balas) { g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x, b.y - 22); g.stroke(); }
    g.fillStyle = '#ff5a3a'; g.strokeStyle = '#111'; g.lineWidth = 2;
    for (const s of e.tierra.tiros) { g.beginPath(); g.arc(s.x, s.y, 10, 0, 7); g.fill(); g.stroke(); }
  }

  VT.dibujar = function (g, e, dt, t) {
    mapa(g, e);
    for (const ob of e.tierra.objetivos) if (A.tierra.enPantalla(e.tierra, e.aj.tierra.alto, ob)) objetivo(g, e, ob, t);
    bombas(g, e);
    mira(g, e, t);
    disparos(g, e);
    A.efectos.dibujar(g);
    caza(g, e, t);
  };
})(AIR);
