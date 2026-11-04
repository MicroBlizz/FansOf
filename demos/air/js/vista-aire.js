// Fans of Air · Vista del aire desde la cabina, como el original: no se ve tu caza; el horizonte se inclina al alabear y sube o
// baja al cabecear, la cuadrícula del suelo corre hacia ti, nubes que pasan, y los enemigos, sus disparos, tus balas (trazadoras
// desde los cañones) y tus misiles en falso 3D (ordenados de lejos a cerca y escalados con proyectar() del dominio). La retícula
// fija en el centro de la vista marca adonde apunta el morro. El panel de instrumentos de abajo lo dibuja cabina.js.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const V = A.vista = A.vista || { img: {}, W: 1280, H: 720 };
  const VA = V.aire = { nubes: [], golpes: {} };
  const C = { x: 640, y: 245 }, ALTO_VISTA = 490;   // centro de la vista (adonde apunta el morro); debajo va el panel de la cabina
  const SPRITE = { becario: 'dron-becario', caja: 'bombardero-caja', jefe: 'jefe-survivalbot' };
  const ANCHO = { becario: 220, caja: 420, jefe: 520 };   // ancho en pantalla a escala 1 (pegado a ti)
  const COLOR = { becario: '#3a6cff', caja: '#e2b324', jefe: '#8a8a9a' };
  const TIRO = { cafe: '#6b3a1e', caja: '#e2b324', carta: '#ff7ac8', suelo: '#ff5a3a' };
  const CANON = [[-250, 300], [250, 300]], ALAS = [[-170, 250], [170, 250]];   // de dónde salen balas y misiles (respecto al centro)

  const giro = (j) => j.roll * 1.2;                                          // alabeo del horizonte (radianes)
  const horizonte = (j, picado) => C.y - j.y * 0.8 - picado * 230;          // al subir el horizonte baja; al picar, sube

  // Mundo -> pantalla: lo que proyecta el dominio, girado con el alabeo alrededor del centro de la vista.
  function P(j, p) {
    const q = A.aire.proyectar(j, p), r = giro(j), c = Math.cos(r), s = Math.sin(r);
    return { x: C.x + q.sx * c - q.sy * s, y: C.y + q.sx * s + q.sy * c, s: q.s };
  }

  for (let i = 0; i < 9; i++) VA.nubes.push({ x: (Math.random() - 0.5) * 1600, y: -160 + Math.random() * 220, z: Math.random() * 1300, r: 30 + Math.random() * 50 });

  VA.evento = function (ev) { if (ev.tipo === 'impacto' && ev.id !== undefined) VA.golpes[ev.id] = performance.now(); };

  function fondo(g, j, t, picado) {
    const img = V.img.cielo;
    g.save(); g.beginPath(); g.rect(0, 0, 1280, ALTO_VISTA); g.clip();
    g.translate(C.x, C.y); g.rotate(giro(j)); g.translate(0, horizonte(j, picado) - C.y);   // (0,0) = el punto del horizonte
    const suelo = g.createLinearGradient(0, 0, 0, 420); suelo.addColorStop(0, '#7d8a74'); suelo.addColorStop(1, '#2f4a2a');
    g.fillStyle = suelo; g.fillRect(-2000, 0, 4000, 1600);
    const cielo = g.createLinearGradient(0, -700, 0, 0); cielo.addColorStop(0, '#2a62c8'); cielo.addColorStop(1, '#ff9a5a');
    g.fillStyle = cielo; g.fillRect(-2000, -1600, 4000, 1600);
    if (img) {   // la ciudad de Microblizz, apoyada en el horizonte y repetida en espejo a los lados
      const k = 0.75, w = img.width * k, hh = img.height * k;
      g.drawImage(img, -w / 2, -hh, w, hh);
      g.save(); g.scale(-1, 1); g.drawImage(img, w / 2, -hh, w, hh); g.drawImage(img, -w * 1.5, -hh, w, hh); g.restore();
    }
    rejilla(g, t);
    g.restore();
  }

  // Cuadrícula del suelo en perspectiva que corre hacia ti: la referencia de velocidad y altura que al original le faltaba.
  function rejilla(g, t) {
    g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1.5;
    for (let k = -8; k <= 8; k++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(k * 320, 1000); g.stroke(); }
    const off = (t * 1.6) % 1;
    for (let i = 0; i < 9; i++) { const z = (i + off) / 9, y = 1000 * z * z; g.beginPath(); g.moveTo(-2000, y); g.lineTo(2000, y); g.stroke(); }
  }

  function nubes(g, j, dt) {
    for (const n of VA.nubes) {
      n.z -= 420 * dt;
      if (n.z < -50) { n.z = 1300; n.x = (Math.random() - 0.5) * 1600; n.y = -160 + Math.random() * 220; }
      const p = P(j, n);
      if (p.y > ALTO_VISTA + 60) continue;
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

  // Trazadora: sale del cañón (abajo, a un lado) y va cerrándose hacia el centro según se aleja.
  function bala(g, b) {
    const c = CANON[b.lado > 0 ? 1 : 0], s1 = A.aire.proyectar({ x: 0, y: 0 }, { x: 0, y: 0, z: b.z }).s, s2 = A.aire.proyectar({ x: 0, y: 0 }, { x: 0, y: 0, z: b.z + 70 }).s;
    g.strokeStyle = '#ffe14a'; g.lineWidth = Math.max(2, 7 * s1); g.lineCap = 'round';
    g.beginPath(); g.moveTo(C.x + c[0] * s1, C.y + c[1] * s1); g.lineTo(C.x + c[0] * s2, C.y + c[1] * s2); g.stroke();
  }

  function misil(g, j, m) {
    const p = P(j, m), a = ALAS[m.lado > 0 ? 1 : 0], x = p.x + a[0] * p.s, y = p.y + a[1] * p.s;
    if (Math.random() < 0.7) A.efectos.humo(x, y + 4, p.s + 0.3);
    g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2;
    g.beginPath(); g.arc(x, y, 8 * p.s + 3, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#ff8a2a'; g.beginPath(); g.arc(x, y + 10 * p.s + 4, 5 * p.s + 2, 0, 7); g.fill();
  }

  // La retícula: cuatro esquinas fijas en el centro, el progreso del fijado y el recuadro sobre el blanco fijado.
  function reticula(g, e, t) {
    const a = e.aire, f = a.fijando, x = C.x, y = C.y, L = 46;
    const color = f.fijado ? (Math.floor(t * 10) % 2 ? '#ff5a3a' : '#fff') : f.id !== null ? '#ffe14a' : 'rgba(255,255,255,.8)';
    g.strokeStyle = color; g.lineWidth = 3; g.lineCap = 'butt';
    g.beginPath();
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.moveTo(x + dx * L, y + dy * (L - 16)); g.lineTo(x + dx * L, y + dy * L); g.lineTo(x + dx * (L - 16), y + dy * L); }
    g.moveTo(x - 6, y); g.lineTo(x + 6, y); g.moveTo(x, y - 6); g.lineTo(x, y + 6);
    g.stroke();
    if (f.id !== null && !f.fijado) { g.strokeStyle = '#ffe14a'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, f.t / e.caza.fijar)); g.stroke(); }
    A.ui.texto(g, tr('MISIL') + ' x' + e.misiles, x, y + L + 22, 8, f.fijado ? '#ff5a3a' : '#ccc');
    if (!f.fijado) return;
    const en = (a.jefe && a.jefe.id === f.id) ? a.jefe : a.enemigos.find((q) => q.id === f.id);
    if (!en) return;
    const p = P(a.jugador, en), w = Math.max(40, ANCHO[en.tipo] * p.s * 0.6);
    g.strokeStyle = '#ff5a3a'; g.lineWidth = 3; g.strokeRect(p.x - w / 2, p.y - w / 2, w, w);
    A.ui.texto(g, tr('FIJADO'), p.x, p.y - w / 2 - 10, 10, '#ff5a3a');
  }

  // Todo lo del mundo se pinta de lejos a cerca para que lo cercano tape a lo lejano.
  function mundo(g, e, t) {
    const a = e.aire, j = a.jugador, cola = [];
    for (const en of a.enemigos) cola.push({ z: en.z, pinta: () => enemigo(g, j, en, t) });
    if (a.jefe) cola.push({ z: a.jefe.z, pinta: () => enemigo(g, j, a.jefe, t) });
    for (const s of a.tiros) cola.push({ z: s.z, pinta: () => tiro(g, j, s, t) });
    for (const b of a.balas) cola.push({ z: b.z, pinta: () => bala(g, b) });
    for (const m of a.misiles) cola.push({ z: m.z, pinta: () => misil(g, j, m) });
    cola.sort((p, q) => q.z - p.z);
    g.save(); g.beginPath(); g.rect(0, 0, 1280, ALTO_VISTA); g.clip();
    for (const c of cola) c.pinta();
    g.restore();
  }

  VA.dibujar = function (g, e, dt, t) {
    const picado = e.fase === 'transicion' ? 1 - e.transicionT / 2.6 : 0;
    fondo(g, e.aire.jugador, t, picado);
    nubes(g, e.aire.jugador, dt);
    if (e.fase === 'aire') mundo(g, e, t);
    A.efectos.dibujar(g);
    if (e.fase === 'aire' && !e.fin) reticula(g, e, t);
    A.cabina.dibujar(g, e, t);
  };

  // Dónde se ve un punto del mundo del aire (para los efectos, que van en pantalla).
  VA.pantalla = (e, p) => P(e.aire.jugador, p);
})(AIR);
