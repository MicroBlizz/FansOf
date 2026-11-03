// Fans of Air · Vista del aire: el cielo con el horizonte que se inclina al girar, la cuadrícula del suelo que corre hacia ti,
// nubes que pasan, los enemigos y disparos en falso 3D (ordenados de lejos a cerca y escalados con proyectar() del dominio),
// tu caza con su inclinación, la retícula de fijar y el marcador del blanco fijado. Lienzo lógico de 1280x720.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const V = A.vista = A.vista || { img: {}, W: 1280, H: 720 };
  const VA = V.aire = { nubes: [], golpes: {} };
  const FUGA = { x: 640, y: 435 };   // origen de proyectar() en pantalla (el punto de fuga de verdad queda 105 px más arriba)
  const SPRITE = { becario: 'dron-becario', caja: 'bombardero-caja', jefe: 'jefe-survivalbot' };
  const ANCHO = { becario: 220, caja: 420, jefe: 520 };   // ancho en pantalla a escala 1 (pegado a ti)
  const COLOR = { becario: '#3a6cff', caja: '#e2b324', jefe: '#8a8a9a' };
  const TIRO = { cafe: '#6b3a1e', caja: '#e2b324', carta: '#ff7ac8', suelo: '#ff5a3a' };

  const P = (j, p) => { const q = A.aire.proyectar(j, p); return { x: FUGA.x + q.sx, y: FUGA.y + q.sy, s: q.s }; };
  const horizonte = (j, picado) => ({ x: 640 - j.x * 0.35, y: 330 - j.y * 0.3 - picado * 220, roll: j.roll * 0.7 });

  for (let i = 0; i < 9; i++) VA.nubes.push({ x: (Math.random() - 0.5) * 1600, y: -200 + Math.random() * 230, z: Math.random() * 1300, r: 30 + Math.random() * 50 });

  VA.evento = function (ev) { if (ev.tipo === 'impacto' && ev.id !== undefined) VA.golpes[ev.id] = performance.now(); };

  function fondo(g, j, t, picado) {
    const h = horizonte(j, picado), img = V.img.cielo;
    g.save(); g.translate(h.x, h.y); g.rotate(h.roll);
    const suelo = g.createLinearGradient(0, 0, 0, 500); suelo.addColorStop(0, '#7d8a74'); suelo.addColorStop(1, '#2f4a2a');
    g.fillStyle = suelo; g.fillRect(-1700, 0, 3400, 1000);
    const cielo = g.createLinearGradient(0, -700, 0, 0); cielo.addColorStop(0, '#2a62c8'); cielo.addColorStop(1, '#ff9a5a');
    g.fillStyle = cielo; g.fillRect(-1700, -1000, 3400, 1000);
    if (img) {   // la ciudad, apoyada en el horizonte y repetida en espejo a los lados (al girar y moverse se ve más allá del borde)
      const k = 0.75, w = img.width * k, hh = img.height * k;
      g.drawImage(img, -w / 2, -hh, w, hh);
      g.save(); g.scale(-1, 1); g.drawImage(img, w / 2, -hh, w, hh); g.drawImage(img, -w * 1.5, -hh, w, hh); g.restore();
    }
    g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1.5;
    for (let k = -8; k <= 8; k++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(k * 300, 900); g.stroke(); }
    const off = (t * 1.6) % 1;
    for (let i = 0; i < 9; i++) { const z = (i + off) / 9, y = 900 * z * z; g.beginPath(); g.moveTo(-1600, y); g.lineTo(1600, y); g.stroke(); }
    g.restore();
  }

  function nubes(g, j, dt) {
    for (const n of VA.nubes) {
      n.z -= 420 * dt;
      if (n.z < -50) { n.z = 1300; n.x = (Math.random() - 0.5) * 1600; n.y = -200 + Math.random() * 230; }
      const p = P(j, n);
      g.fillStyle = 'rgba(255,255,255,' + (0.28 * Math.min(1, p.s * 2)) + ')';
      g.beginPath(); g.ellipse(p.x, p.y, n.r * p.s * 2.2, n.r * p.s * 0.8, 0, 0, 7); g.fill();
    }
  }

  function enemigo(g, j, en, t) {
    const p = P(j, en), img = V.img[SPRITE[en.tipo]], w = ANCHO[en.tipo] * p.s, tocado = performance.now() - (VA.golpes[en.id] || 0) < 90;
    if (img) {
      const h = w * img.height / img.width;
      g.save(); g.translate(p.x, p.y);
      if (tocado) g.filter = 'brightness(3)';
      g.drawImage(img, -w / 2, -h / 2, w, h);
      g.restore();
    } else {
      g.fillStyle = tocado ? '#fff' : COLOR[en.tipo]; g.strokeStyle = '#111'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(p.x, p.y - w * 0.25); g.lineTo(p.x + w / 2, p.y + w * 0.2); g.lineTo(p.x - w / 2, p.y + w * 0.2); g.closePath(); g.fill(); g.stroke();
    }
    if (en.tipo === 'jefe') { g.fillStyle = 'rgba(255,90,58,' + (0.5 + 0.5 * Math.sin(t * 12)) + ')'; g.beginPath(); g.arc(p.x, p.y - w * 0.1, 6 + w * 0.02, 0, 7); g.fill(); }
  }

  function tiro(g, j, s, t) {
    const p = P(j, s), r = 16 * p.s + 3;
    g.fillStyle = TIRO[s.clase] || '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2;
    g.save(); g.translate(p.x, p.y);
    if (s.clase === 'caja') { g.rotate(t * 6); g.fillRect(-r, -r, 2 * r, 2 * r); g.strokeRect(-r, -r, 2 * r, 2 * r); }
    else if (s.clase === 'carta') { g.fillRect(-r * 1.3, -r * 0.9, 2.6 * r, 1.8 * r); g.strokeRect(-r * 1.3, -r * 0.9, 2.6 * r, 1.8 * r); }
    else { g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke(); }
    g.restore();
  }

  function bala(g, j, b) {
    const p = P(j, b), q = P(j, { x: b.x, y: b.y, z: b.z + 60 });
    g.strokeStyle = '#ffe14a'; g.lineWidth = Math.max(2, 7 * p.s); g.lineCap = 'round';
    g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
  }

  function misil(g, j, m) {
    const p = P(j, m);
    if (Math.random() < 0.7) A.efectos.humo(p.x, p.y + 4, p.s + 0.3);
    g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2;
    g.beginPath(); g.arc(p.x, p.y, 8 * p.s + 3, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#ff8a2a'; g.beginPath(); g.arc(p.x, p.y + 10 * p.s + 4, 5 * p.s + 2, 0, 7); g.fill();
  }

  function caza(g, e, t) {
    const j = e.aire.jugador, img = V.img['caza-' + e.caza.id], x = 640 + j.x * 0.3, y = 575 + j.y * 0.3;
    g.save(); g.translate(x, y); g.rotate(j.roll);
    g.fillStyle = 'rgba(255,170,60,' + (0.5 + 0.3 * Math.sin(t * 40)) + ')';
    for (const dx of [-28, 28]) { g.beginPath(); g.ellipse(dx, 42, 12, 22, 0, 0, 7); g.fill(); }
    if (img) { const w = 320, h = w * img.height / img.width; g.drawImage(img, -w / 2, -h / 2, w, h); }
    else { g.fillStyle = e.caza.color; g.strokeStyle = '#111'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -50); g.lineTo(150, 40); g.lineTo(0, 15); g.lineTo(-150, 40); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  }

  function reticula(g, e, t) {
    const a = e.aire, j = a.jugador, r = A.aire.reticula(j), x = FUGA.x + r.x, y = FUGA.y + r.y, f = a.fijando;
    const color = f.fijado ? (Math.floor(t * 10) % 2 ? '#ff5a3a' : '#fff') : f.id !== null ? '#ffe14a' : 'rgba(255,255,255,.75)';
    g.strokeStyle = color; g.lineWidth = 3;
    g.beginPath(); g.arc(x, y, 44, 0, 7); g.stroke();
    g.beginPath();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { g.moveTo(x + dx * 54, y + dy * 54); g.lineTo(x + dx * 32, y + dy * 32); }
    g.stroke();
    if (f.id !== null && !f.fijado) { g.strokeStyle = '#ffe14a'; g.lineWidth = 5; g.beginPath(); g.arc(x, y, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, f.t / e.caza.fijar)); g.stroke(); }
    if (!f.fijado) return;
    const en = (a.jefe && a.jefe.id === f.id) ? a.jefe : a.enemigos.find((q) => q.id === f.id);
    if (!en) return;
    const p = P(j, en), w = Math.max(40, ANCHO[en.tipo] * p.s * 0.6);
    g.strokeStyle = '#ff5a3a'; g.lineWidth = 3; g.strokeRect(p.x - w / 2, p.y - w / 2, w, w);
    A.ui.texto(g, tr('FIJADO'), p.x, p.y - w / 2 - 10, 10, '#ff5a3a');
  }

  // Todo lo del mundo se pinta de lejos a cerca para que lo cercano tape a lo lejano.
  function mundo(g, e, t) {
    const a = e.aire, j = a.jugador, cola = [];
    for (const en of a.enemigos) cola.push({ z: en.z, pinta: () => enemigo(g, j, en, t) });
    if (a.jefe) cola.push({ z: a.jefe.z, pinta: () => enemigo(g, j, a.jefe, t) });
    for (const s of a.tiros) cola.push({ z: s.z, pinta: () => tiro(g, j, s, t) });
    for (const b of a.balas) cola.push({ z: b.z, pinta: () => bala(g, j, b) });
    for (const m of a.misiles) cola.push({ z: m.z, pinta: () => misil(g, j, m) });
    cola.sort((p, q) => q.z - p.z);
    for (const c of cola) c.pinta();
  }

  VA.dibujar = function (g, e, dt, t) {
    const picado = e.fase === 'transicion' ? 1 - e.transicionT / 2.6 : 0;
    fondo(g, e.aire.jugador, t, picado);
    nubes(g, e.aire.jugador, dt);
    if (e.fase === 'aire') mundo(g, e, t);
    A.efectos.dibujar(g);
    caza(g, e, t);
    if (e.fase === 'aire' && !e.fin) reticula(g, e, t);
  };

  // Dónde se ve un punto del mundo del aire (para los efectos, que van en pantalla).
  VA.pantalla = (e, p) => P(e.aire.jugador, p);
})(AIR);
