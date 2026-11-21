// Fans of Air · Vista del aire desde la cabina, con el vuelo de verdad de vuelo.js: el cielo y el mar se parten por el horizonte
// donde toque según cómo vaya el caza (inclinado, cabeceando o boca abajo), a juego como en el original; la espuma de las olas y
// las nubes están en el mundo (se ven la altura y la velocidad), y enemigos, disparos, balas,
// misiles y premios se dibujan en perspectiva de lejos a cerca. Flechas en el borde para lo que queda fuera de la vista, y la
// retícula fija en el centro. El panel de instrumentos de abajo lo dibuja cabina.js.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const V = A.vista = A.vista || { img: {}, W: 1280, H: 720 };
  const VA = V.aire = { nubes: [], golpes: {} };
  const C = { x: 640, y: 245 }, ALTO_VISTA = 490, F = 700;   // centro de la vista (adonde apunta el morro) y distancia focal en píxeles
  const SPRITE = { becario: 'dron-becario', caja: 'bombardero-caja', jefe: 'jefe-survivalbot' };
  const ANCHO = { becario: 30, caja: 50, jefe: 80 };   // ancho en metros de cada enemigo (algo exagerado, para que se vean)
  const COLOR = { becario: '#3a6cff', caja: '#e2b324', jefe: '#8a8a9a' };
  const TIRO = { cafe: '#6b3a1e', caja: '#e2b324', carta: '#ff7ac8' };
  const PREMIO = { misiles: '#9fe0ff', bombas: '#ffe14a', reparacion: '#5fe05f', combustible: '#ff8a2a' };
  const OLA = 160, ALCANCE = 3600;   // tamaño del trozo de mar con su ola y hasta dónde se dibujan

  // Un punto del mundo en la pantalla (o null si queda detrás del piloto).
  function P(j, p) {
    const c = A.vuelo.camara(j, p);
    if (c.z < 2) return null;
    const s = F / c.z;
    return { x: C.x + c.x * s, y: C.y - c.y * s, s, c };
  }
  VA.pantalla = (e, p) => P(e.aire.jugador, p) || { x: -9999, y: -9999, s: 0 };

  VA.evento = function (ev) { if (ev.tipo === 'impacto' && ev.id !== undefined) VA.golpes[ev.id] = performance.now(); };

  // ---------- cielo, suelo y horizonte ----------
  // El horizonte en pantalla: el punto más cercano al centro y el giro (0 = derecho, π = boca abajo).
  function horizonte(j) {
    const a = j.r.y, b = j.u.y, n = a * a + b * b;
    if (n < 1e-4) return null;   // mirando recto arriba o abajo: no se ve el horizonte
    return { x: C.x - j.f.y * a / n * F, y: C.y + j.f.y * b / n * F, giro: Math.atan2(a, b) };
  }

  // El cielo y el mar, a juego como en el original: el cielo azul se aclara hacia el horizonte, donde una franja de calima lo
  // junta con el mar, que se oscurece al acercarse. Todo gira con el caza (boca abajo, el mar queda arriba).
  function fondo(g, j) {
    const h = horizonte(j);
    g.save(); g.beginPath(); g.rect(0, 0, 1280, ALTO_VISTA); g.clip();
    if (!h) { g.fillStyle = j.f.y > 0 ? '#3a7be0' : '#082a5c'; g.fillRect(0, 0, 1280, ALTO_VISTA); g.restore(); return; }
    g.translate(h.x, h.y); g.rotate(h.giro);
    const cielo = g.createLinearGradient(0, -900, 0, 0);
    cielo.addColorStop(0, '#3a7be0'); cielo.addColorStop(0.6, '#6aa8ee'); cielo.addColorStop(0.92, '#a9d6f7'); cielo.addColorStop(1, '#e4f4ff');
    g.fillStyle = cielo; g.fillRect(-3000, -3000, 6000, 3000);
    const mar = g.createLinearGradient(0, 0, 0, 800);
    mar.addColorStop(0, '#bfe3f5'); mar.addColorStop(0.04, '#3b8fc8'); mar.addColorStop(0.35, '#165a9e'); mar.addColorStop(1, '#082a5c');
    g.fillStyle = mar; g.fillRect(-3000, 0, 6000, 3000);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-3000, -3, 6000, 5);   // la línea del horizonte, con brillo
    g.restore();
  }

  // Las olas: espuma repartida por el mar (siempre en el mismo sitio de cada trozo, con una semilla), que pasa por debajo del
  // caza: así se ven la velocidad y la altura (más cerca del agua, más grandes y más rápidas).
  function semilla(i, k) { let h = (i * 73856093) ^ (k * 19349663); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function olas(g, j, t) {
    const n = Math.ceil(ALCANCE / OLA), i0 = Math.floor(j.pos.x / OLA), k0 = Math.floor(j.pos.z / OLA), h = horizonte(j), giro = h ? h.giro : 0;
    g.save(); g.beginPath(); g.rect(0, 0, 1280, ALTO_VISTA); g.clip();
    for (let i = i0 - n; i <= i0 + n; i++) for (let k = k0 - n; k <= k0 + n; k++) {
      const r = semilla(i, k);
      if (r > 0.55) continue;
      const vaiven = Math.sin(t * 1.5 + r * 20) * 6;
      const c = A.vuelo.camara(j, { x: i * OLA + semilla(k, i) * OLA, y: 0, z: k * OLA + r * OLA + vaiven });
      if (c.z < 8 || c.z > ALCANCE) continue;
      const s = F / c.z, x = C.x + c.x * s, y = C.y - c.y * s, w = (10 + r * 18) * s;
      if (x < -60 || x > 1340 || y < -40 || y > ALTO_VISTA + 40 || w < 0.8) continue;
      g.fillStyle = 'rgba(255,255,255,' + Math.min(0.75, 0.25 + s * 0.4) + ')';
      g.beginPath(); g.ellipse(x, y, w, Math.max(0.6, w * 0.18), giro, 0, 7); g.fill();
    }
    g.restore();
  }

  // ---------- nubes de verdad: bolas blancas agrupadas, en el mundo, alrededor del caza ----------
  function nubes(j) {
    if (!VA.nubes.length) for (let i = 0; i < 14; i++) VA.nubes.push(nuevaNube(j, 1000 + Math.random() * 2300));
    for (let i = 0; i < VA.nubes.length; i++) if (A.v3.dist(VA.nubes[i], j.pos) > 3400) VA.nubes[i] = nuevaNube(j, 2800);
  }
  function nuevaNube(j, d) {
    const ang = A.vuelo.rumbo(j) + (Math.random() - 0.5) * 2.4, r = 40 + Math.random() * 60, bolas = [];
    for (let b = 0; b < 6; b++) bolas.push({ dx: (b - 2.5) * r * 0.55 + (Math.random() - 0.5) * r * 0.3, dy: Math.random() * r * 0.35 + (b === 2 || b === 3 ? r * 0.3 : 0), r: r * (0.45 + Math.random() * 0.35) });
    return { x: j.pos.x + Math.sin(ang) * d, y: 450 + Math.random() * 1500, z: j.pos.z + Math.cos(ang) * d, bolas };
  }
  function nube(g, j, n, p) {
    const h = horizonte(j), giro = h ? h.giro : 0, c = Math.cos(giro), s = Math.sin(giro), k = p.s;
    g.save(); g.globalAlpha = Math.min(0.95, 0.35 + k * 2);
    for (const capa of [['#c9dbee', 0.12], ['#ffffff', 0]]) {   // sombra azulada debajo y blanco encima
      g.fillStyle = capa[0];
      for (const b of n.bolas) {
        const dx = b.dx * k, dy = (-b.dy + capa[1] * b.r * 2) * k;
        g.beginPath(); g.arc(p.x + dx * c - dy * s, p.y + dx * s + dy * c, b.r * k, 0, 7); g.fill();
      }
    }
    g.restore();
  }

  // ---------- lo que vuela ----------
  function enemigo(g, en, p, t) {
    const img = V.img[SPRITE[en.tipo]], w = Math.max(6, ANCHO[en.tipo] * p.s), tocado = performance.now() - (VA.golpes[en.id] || 0) < 90;
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
    if (en.tipo === 'jefe') { g.fillStyle = 'rgba(255,90,58,' + (0.5 + 0.5 * Math.sin(t * 12)) + ')'; g.beginPath(); g.arc(p.x, p.y - w * 0.1, 4 + w * 0.03, 0, 7); g.fill(); }
  }

  function tiro(g, s, p, t) {
    const r = Math.max(3, 2.5 * p.s);
    g.fillStyle = TIRO[s.clase] || '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2;
    g.save(); g.translate(p.x, p.y);
    if (s.clase === 'caja') { g.rotate(t * 6); g.fillRect(-r, -r, 2 * r, 2 * r); g.strokeRect(-r, -r, 2 * r, 2 * r); }
    else if (s.clase === 'carta') { g.fillStyle = '#fff'; g.fillRect(-r * 1.3, -r * 0.9, 2.6 * r, 1.8 * r); g.strokeRect(-r * 1.3, -r * 0.9, 2.6 * r, 1.8 * r); g.fillStyle = '#ff7ac8'; g.fillRect(-r * 0.8, -r * 0.4, 1.6 * r, 0.3 * r); }
    else { g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke(); }
    g.restore();
  }

  function bala(g, j, b) {
    const p = P(j, b.pos), q = P(j, A.v3.resta(b.pos, A.v3.escala(b.v, 0.025)));
    if (!p || !q) return;
    g.strokeStyle = '#ffe14a'; g.lineWidth = Math.max(2, Math.min(8, 0.6 * p.s)); g.lineCap = 'round';
    g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
  }

  function misil(g, m, p) {
    if (Math.random() < 0.7) A.efectos.humo(p.x, p.y, Math.min(2, p.s * 0.4 + 0.3));
    const r = Math.max(3, Math.min(10, p.s * 0.8));
    g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2;
    g.beginPath(); g.arc(p.x, p.y, r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#ff8a2a'; g.beginPath(); g.arc(p.x, p.y + r, r * 0.6, 0, 7); g.fill();
  }

  // Un premio: caja de su color colgando de un paracaídas.
  function premio(g, pr, p, t) {
    const w = Math.max(10, Math.min(70, 6 * p.s)), y = p.y + Math.sin(t * 3 + pr.id) * 2;
    g.strokeStyle = '#111'; g.lineWidth = 2;
    g.fillStyle = '#fff'; g.beginPath(); g.arc(p.x, y - w * 1.1, w * 0.9, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#ff5a3a'; g.beginPath(); g.arc(p.x, y - w * 1.1, w * 0.9, Math.PI * 1.33, Math.PI * 1.66); g.lineTo(p.x, y - w * 1.1); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(p.x - w * 0.9, y - w * 1.1); g.lineTo(p.x - w * 0.4, y - w * 0.4); g.moveTo(p.x + w * 0.9, y - w * 1.1); g.lineTo(p.x + w * 0.4, y - w * 0.4); g.stroke();
    g.fillStyle = PREMIO[pr.tipo]; g.fillRect(p.x - w / 2, y - w / 2, w, w); g.strokeRect(p.x - w / 2, y - w / 2, w, w);
    if (w > 22) A.ui.texto(g, tr(ETIQUETA[pr.tipo]), p.x, y + w / 2 + 14, 8, PREMIO[pr.tipo]);
  }
  const ETIQUETA = { misiles: 'MISILES', bombas: 'BOMBAS', reparacion: 'REPARAR', combustible: 'COMBUSTIBLE' };

  // Lo que queda fuera de la vista se señala con una flecha en el borde (rojo los enemigos, de su color los premios).
  function flecha(g, c, color) {
    const ang = Math.atan2(-c.y, c.x), rx = 590, ry = 205, x = C.x + Math.cos(ang) * rx, y = C.y + Math.sin(ang) * ry;
    g.save(); g.translate(x, y); g.rotate(ang);
    g.fillStyle = color; g.strokeStyle = '#111'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(18, 0); g.lineTo(-10, -13); g.lineTo(-4, 0); g.lineTo(-10, 13); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  const fuera = (p) => !p || p.x < 30 || p.x > 1250 || p.y < 20 || p.y > ALTO_VISTA - 20;

  // Todo lo del mundo se pinta de lejos a cerca para que lo cercano tape a lo lejano.
  function mundo(g, e, t) {
    const a = e.aire, j = a.jugador, cola = [], flechas = [];
    const mete = (obj, pinta, colorFlecha) => {
      const p = P(j, obj.pos || obj);
      if (colorFlecha && fuera(p)) flechas.push([A.vuelo.camara(j, obj.pos || obj), colorFlecha]);
      if (p) cola.push({ z: p.c.z, pinta: () => pinta(p) });
    };
    for (const n of VA.nubes) mete(n, (p) => nube(g, j, n, p));
    for (const en of a.enemigos) mete(en, (p) => enemigo(g, en, p, t), '#ff5a3a');
    if (a.jefe) mete(a.jefe, (p) => enemigo(g, a.jefe, p, t), '#ff3a8a');
    for (const s of a.tiros) mete(s, (p) => tiro(g, s, p, t));
    for (const pr of a.premios) mete(pr, (p) => premio(g, pr, p, t), PREMIO[pr.tipo]);
    for (const m of a.misiles) mete(m, (p) => misil(g, m, p));
    cola.sort((p, q) => q.z - p.z);
    g.save(); g.beginPath(); g.rect(0, 0, 1280, ALTO_VISTA); g.clip();
    for (const c of cola) c.pinta();
    for (const b of a.balas) bala(g, j, b);
    for (const [c, color] of flechas) flecha(g, c, color);
    g.restore();
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
    const en = (a.jefe && a.jefe.id === f.id) ? a.jefe : a.enemigos.find((q) => q.id === f.id), p = en && P(a.jugador, en.pos);
    if (!p) return;
    const w = Math.max(40, ANCHO[en.tipo] * p.s * 0.8);
    g.strokeStyle = '#ff5a3a'; g.lineWidth = 3; g.strokeRect(p.x - w / 2, p.y - w / 2, w, w);
    A.ui.texto(g, tr('FIJADO'), p.x, p.y - w / 2 - 10, 10, '#ff5a3a');
  }

  VA.dibujar = function (g, e, dt, t) {
    const j = e.aire.jugador;
    nubes(j);
    fondo(g, j);
    olas(g, j, t);
    mundo(g, e, t);
    A.efectos.dibujar(g);
    if (e.fase === 'aire' && !e.fin) reticula(g, e, t);
    A.cabina.dibujar(g, e, t);
  };

  VA.reiniciar = function () { VA.nubes = []; VA.golpes = {}; };
})(AIR);
