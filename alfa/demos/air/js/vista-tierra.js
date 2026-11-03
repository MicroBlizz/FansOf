// Fans of Air · Vista de la tierra, isométrica como el original: la cámara sigue al caza por el mapa grande (con un poco de
// adelanto hacia donde vuela); el suelo de la base con sus manchas, las zonas de asfalto inclinadas, los caminos, árboles y
// matorrales repartidos con una semilla fija, los objetivos con su sombra y su daño, las bombas cayendo con su punto de mira,
// las balas, los tiros de las defensas y tu caza (visto desde arriba, girado hacia donde vuela) con su sombra en el suelo.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const V = A.vista = A.vista || { img: {}, W: 1280, H: 720 };
  const VT = V.tierra = { golpes: {}, cam: null };
  const COLOR = { oficina: '#6a7280', servidor: '#9aa4c8', torreta: '#3a6cff', tanque: '#2d4a8a', torre: '#1b2a6e' };
  const ESCALA = { torre: 1.5 };   // ancho del dibujo respecto al radio (2.3 si no se dice): la Torre es alta y se dibuja más estrecha
  const CELDA = 150, SESGO = 0.35;  // rejilla de la decoración y lo que se inclinan las zonas de asfalto (aire isométrico)

  VT.evento = function (ev) { if (ev.tipo === 'impactoSuelo') VT.golpes[Math.round(ev.x) + ':' + Math.round(ev.y)] = performance.now(); };

  // Un azar fijo por celda del mapa, para que los árboles salgan siempre en el mismo sitio sin guardarlos.
  function semilla(i, k) { let h = (i * 73856093) ^ (k * 19349663); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

  // La cámara: el caza en el centro, un poco adelantada hacia donde vuela, sin salirse del mapa.
  function camara(e, dt) {
    const j = e.tierra.jugador, AJ = e.aj.tierra;
    const ox = A.util.limita(j.x + Math.cos(j.rumbo) * 110, 640, AJ.ancho - 640), oy = A.util.limita(j.y + Math.sin(j.rumbo) * 110, 360, AJ.alto - 360);
    if (!VT.cam) VT.cam = { x: ox, y: oy };
    VT.cam.x = A.util.acerca(VT.cam.x, ox, 4, dt); VT.cam.y = A.util.acerca(VT.cam.y, oy, 4, dt);
    return { x: VT.cam.x - 640, y: VT.cam.y - 360 };
  }

  function enBase(AJ, x, y) { return AJ.bases.some((b) => x >= b.x - 40 && x <= b.x + b.w + 40 && y >= b.y - 40 && y <= b.y + b.h + 40); }

  function suelo(g, cam, e) {
    const AJ = e.aj.tierra;
    g.fillStyle = '#c0661f'; g.fillRect(0, 0, 1280, 720);
    const i0 = Math.floor(cam.x / CELDA) - 1, k0 = Math.floor(cam.y / CELDA) - 1;
    for (let i = i0; i < i0 + 11; i++) for (let k = k0; k < k0 + 7; k++) {   // manchas de tierra más oscura
      const r = semilla(i, k);
      if (r < 0.45) continue;
      const x = i * CELDA + semilla(i, k + 7) * CELDA - cam.x, y = k * CELDA + semilla(i + 7, k) * CELDA - cam.y;
      g.fillStyle = r > 0.8 ? 'rgba(90,40,10,.18)' : 'rgba(255,200,120,.12)';
      g.beginPath(); g.ellipse(x, y, 40 + r * 60, 18 + r * 24, 0, 0, 7); g.fill();
    }
    caminos(g, cam, AJ);
    for (const b of AJ.bases) asfalto(g, b.x - cam.x, b.y - cam.y, b.w, b.h);
  }

  // Caminos grises entre el inicio y las bases, inclinados como el resto.
  function caminos(g, cam, AJ) {
    const centros = AJ.bases.map((b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 }));
    const tramos = [[{ x: AJ.inicio.x, y: AJ.inicio.y }, centros[2]], [centros[2], centros[0]], [centros[0], centros[1]], [centros[1], centros[3]], [centros[2], centros[3]]];
    g.strokeStyle = '#7a7f88'; g.lineWidth = 70; g.lineCap = 'round';
    for (const [a, b] of tramos) { g.beginPath(); g.moveTo(a.x - cam.x, a.y - cam.y); g.lineTo(b.x - cam.x, b.y - cam.y); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; g.setLineDash([24, 26]);
    for (const [a, b] of tramos) { g.beginPath(); g.moveTo(a.x - cam.x, a.y - cam.y); g.lineTo(b.x - cam.x, b.y - cam.y); g.stroke(); }
    g.setLineDash([]);
  }

  function asfalto(g, x, y, w, h) {
    const s = h * SESGO;
    g.fillStyle = '#6e7278'; g.strokeStyle = '#9aa0aa'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x + s, y); g.lineTo(x + w + s, y); g.lineTo(x + w - s, y + h); g.lineTo(x - s, y + h); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2;
    for (let k = 1; k < 4; k++) { const yy = y + h * k / 4, dx = s - 2 * s * k / 4; g.beginPath(); g.moveTo(x + dx + 20, yy); g.lineTo(x + w + dx - 20, yy); g.stroke(); }
  }

  function decoracion(g, cam, e) {
    const AJ = e.aj.tierra, arbol = V.img.arbol, mata = V.img.matorral;
    const i0 = Math.floor(cam.x / CELDA) - 1, k0 = Math.floor(cam.y / CELDA) - 1;
    for (let k = k0; k < k0 + 7; k++) for (let i = i0; i < i0 + 11; i++) {
      const r = semilla(i + 3, k + 5);
      if (r < 0.5) continue;
      const wx = i * CELDA + semilla(i, k + 9) * CELDA, wy = k * CELDA + semilla(i + 9, k) * CELDA;
      if (enBase(AJ, wx, wy)) continue;
      const x = wx - cam.x, y = wy - cam.y, grande = r > 0.75, img = grande ? arbol : mata;
      if (img) { const w = grande ? 64 : 42, h = w * img.height / img.width; g.drawImage(img, x - w / 2, y - h + 8, w, h); }
      else { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 6, y + 4, grande ? 22 : 14, grande ? 9 : 6, 0, 0, 7); g.fill(); g.fillStyle = grande ? '#2f6a2a' : '#3f7a34'; g.strokeStyle = '#111'; g.lineWidth = 3; g.beginPath(); g.arc(x, y - (grande ? 16 : 8), grande ? 22 : 13, 0, 7); g.fill(); g.stroke(); }
    }
  }

  function objetivo(g, cam, e, ob, t) {
    const d = e.aj.tierra.objetivos[ob.tipo], x = ob.x - cam.x, y = ob.y - cam.y, img = V.img['suelo-' + ob.tipo];
    if (x < -200 || x > 1480 || y < -260 || y > 920) return;
    const tocado = performance.now() - (VT.golpes[Math.round(ob.x) + ':' + Math.round(ob.y)] || 0) < 90;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 10, y + 12, d.radio, d.radio * 0.7, 0, 0, 7); g.fill();
    g.save(); g.translate(x, y);
    if (ob.tipo === 'tanque') g.rotate(ob.dir > 0 ? 0.25 : -0.25);
    if (tocado) g.filter = 'brightness(3)';
    if (img) { const w = d.radio * (ESCALA[ob.tipo] || 2.3), h = w * img.height / img.width; g.drawImage(img, -w / 2, -h / 2, w, h); }
    else { g.fillStyle = COLOR[ob.tipo]; g.strokeStyle = '#111'; g.lineWidth = 4; g.fillRect(-d.radio, -d.radio, d.radio * 2, d.radio * 2); g.strokeRect(-d.radio, -d.radio, d.radio * 2, d.radio * 2); }
    g.restore();
    if (ob.vida < d.vida) A.ui.barra(g, x - 30, y - d.radio - 16, 60, 6, ob.vida / d.vida, d.final ? '#ff5a3a' : '#ffe14a');
    if (d.primario && Math.floor(t * 2) % 2) { g.strokeStyle = 'rgba(255,225,74,.7)'; g.lineWidth = 2; g.setLineDash([8, 8]); g.beginPath(); g.arc(x, y, d.radio + 14, 0, 7); g.stroke(); g.setLineDash([]); }
  }

  function caza(g, cam, e, t) {
    const j = e.tierra.jugador, img = V.img['cenital-' + e.caza.id], x = j.x - cam.x, y = j.y - cam.y;
    g.fillStyle = 'rgba(0,0,0,.3)';
    g.save(); g.translate(x + 30, y + 44); g.rotate(j.rumbo + Math.PI / 2); g.beginPath(); g.ellipse(0, 0, 22, 40, 0, 0, 7); g.fill(); g.restore();
    g.save(); g.translate(x, y); g.rotate(j.rumbo + Math.PI / 2);
    g.fillStyle = 'rgba(255,170,60,' + (0.5 + 0.3 * Math.sin(t * 40)) + ')';
    g.beginPath(); g.ellipse(0, 40, 9, 16, 0, 0, 7); g.fill();
    if (img) { const w = 110, h = w * img.height / img.width; g.drawImage(img, -w / 2, -h / 2, w, h); }
    else { g.fillStyle = e.caza.color; g.strokeStyle = '#111'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -50); g.lineTo(44, 36); g.lineTo(0, 20); g.lineTo(-44, 36); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  }

  function mira(g, cam, e, t) {
    if (e.bombas <= 0 || e.tierra.fin) return;
    const p = A.tierra.puntoBomba(e.tierra, e.aj), x = p.x - cam.x, y = p.y - cam.y, R = e.aj.tierra.bomba.radio * e.caza.radioBomba;
    g.strokeStyle = 'rgba(255,225,74,' + (0.55 + 0.3 * Math.sin(t * 6)) + ')'; g.lineWidth = 3; g.setLineDash([10, 8]);
    g.beginPath(); g.arc(x, y, R * 0.55, 0, 7); g.stroke();
    g.setLineDash([]);
    g.beginPath(); g.moveTo(x - 12, y); g.lineTo(x + 12, y); g.moveTo(x, y - 12); g.lineTo(x, y + 12); g.stroke();
  }

  function bombas(g, cam, e) {
    const AJ = e.aj.tierra;
    for (const b of e.tierra.bombas) {
      const x = b.x - cam.x, y = b.y - cam.y, k = b.t / AJ.bomba.cae;   // k = 1 recién soltada, 0 a punto de estallar
      g.strokeStyle = 'rgba(255,90,58,.8)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 14 + 30 * (1 - k), 0, 7); g.stroke();
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + 10 * k, y + 8 * k, 10, 6, 0, 0, 7); g.fill();
      g.fillStyle = '#2a2a2a'; g.strokeStyle = '#111'; g.lineWidth = 2;
      g.beginPath(); g.ellipse(x, y - 60 * k, 9 + 9 * k, 14 + 12 * k, 0, 0, 7); g.fill(); g.stroke();
    }
  }

  function disparos(g, cam, e) {
    g.strokeStyle = '#ffe14a'; g.lineWidth = 6; g.lineCap = 'round';
    for (const b of e.tierra.balas) { const x = b.x - cam.x, y = b.y - cam.y, n = Math.hypot(b.vx, b.vy) || 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x - b.vx / n * 22, y - b.vy / n * 22); g.stroke(); }
    g.fillStyle = '#ff5a3a'; g.strokeStyle = '#111'; g.lineWidth = 2;
    for (const s of e.tierra.tiros) { g.beginPath(); g.arc(s.x - cam.x, s.y - cam.y, 10, 0, 7); g.fill(); g.stroke(); }
  }

  VT.dibujar = function (g, e, dt, t) {
    const cam = camara(e, dt);
    VT.ultimaCam = cam;
    suelo(g, cam, e);
    decoracion(g, cam, e);
    for (const ob of [...e.tierra.objetivos].sort((p, q) => p.y - q.y)) objetivo(g, cam, e, ob, t);
    bombas(g, cam, e);
    mira(g, cam, e, t);
    disparos(g, cam, e);
    A.efectos.dibujar(g);
    caza(g, cam, e, t);
  };

  // Dónde se ve un punto del mapa (para los efectos, que van en pantalla).
  VT.pantalla = (e, p) => { const cam = VT.ultimaCam || { x: 0, y: 0 }; return { x: p.x - cam.x, y: p.y - cam.y }; };
  VT.reiniciar = function () { VT.cam = null; VT.golpes = {}; };
})(AIR);
