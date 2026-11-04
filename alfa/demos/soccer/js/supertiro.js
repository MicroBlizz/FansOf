// Fans of Soccer · Súper tiros espectaculares (solo dibujo, no toca las reglas). Lo común: destello al salir el balón, balón más
// grande que brilla con el color del tiro, líneas de velocidad, chispas en el rastro y marca quemada en el suelo donde se chutó.
// Lo propio de cada equipo sale del rastro: zanahorias (Animales Locos), trozos de barra de carga (Microblizz), fantasmas
// (No-Muertos), copias del balón y píxeles (Ciberpunks) y facturas volando (Phony). vista.js llama a suelo, aire y pantalla.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const W = 1280, H = 720;
  const COLOR = { zanahoria: '#ff8a2a', carga: '#3a6cff', fantasma: '#9a5cff', teletransporte: '#1ee0f0', factura: '#f0be28' };
  const ST = S.supertiro = { marcas: [], bits: [], destello: 0, tiroVisto: -1, cada: 0 };

  const esSuper = (b) => !!(b.tiro && b.tiro.tipo !== 'normal');
  ST.color = (tipo) => COLOR[tipo] || '#fff';

  // Al chutar el súper: marca quemada donde estaba el que chuta.
  ST.chutar = function (e, ev) {
    const j = e.jugadores[ev.quien];
    ST.marcas.push({ x: j.x + j.mira * 0.8, y: j.y, color: ST.color(ev.clase), vida: 6 });
  };

  // Un trozo del rastro: dónde sale, hacia dónde va y cuánto dura (en metros y segundos del campo).
  function soltar(b, tipo) {
    const a = Math.random() * 6.3, v = 2 + Math.random() * 4;
    ST.bits.push({ tipo, x: b.x, y: b.y, z: b.z + 0.5, vx: Math.cos(a) * v - b.vx * 0.05, vy: Math.sin(a) * v * 0.5, vz: 3 + Math.random() * 4,
      vida: 1.1, giro: Math.random() * 6.3, gv: (Math.random() - 0.5) * 14 });
  }

  function mover(dt) {
    for (const p of ST.bits) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.z = Math.max(0, p.z + p.vz * dt); p.giro += p.gv * dt; p.vida -= dt;
      p.vz -= (p.tipo === 'fantasma' ? -2 : p.tipo === 'factura' ? 3 : 12) * dt;   // los fantasmas suben y las facturas planean
    }
    ST.bits = ST.bits.filter((p) => p.vida > 0);
    for (const m of ST.marcas) m.vida -= dt;
    ST.marcas = ST.marcas.filter((m) => m.vida > 0);
  }

  // ---------- dibujos de cada equipo (en la escena, con su tamaño `s`) ----------
  const FORMA = {
    zanahoria(g, s) {
      g.fillStyle = '#ff8a2a'; g.strokeStyle = '#111'; g.lineWidth = 2 * s;
      g.beginPath(); g.moveTo(-5 * s, -12 * s); g.lineTo(5 * s, -12 * s); g.lineTo(0, 14 * s); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#4fd14a'; g.beginPath(); g.ellipse(-3 * s, -16 * s, 2.5 * s, 6 * s, -0.4, 0, 7); g.ellipse(3 * s, -16 * s, 2.5 * s, 6 * s, 0.4, 0, 7); g.fill();
    },
    carga(g, s, t) {
      g.fillStyle = '#111'; g.fillRect(-14 * s, -5 * s, 28 * s, 10 * s);
      g.fillStyle = Math.floor(t * 20) % 2 ? '#3a6cff' : '#9fd0ff'; g.fillRect(-12 * s, -3 * s, (10 + Math.random() * 14) * s, 6 * s);
    },
    fantasma(g, s) {
      g.fillStyle = 'rgba(235,235,255,.85)'; g.strokeStyle = '#111'; g.lineWidth = 2 * s;
      g.beginPath(); g.arc(0, -4 * s, 9 * s, Math.PI, 0); g.lineTo(9 * s, 10 * s);
      for (let k = 0; k < 3; k++) { g.lineTo((6 - k * 6) * s, 6 * s); g.lineTo((3 - k * 6) * s, 10 * s); }
      g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#111'; g.fillRect(-5 * s, -6 * s, 3 * s, 4 * s); g.fillRect(2 * s, -6 * s, 3 * s, 4 * s);
    },
    teletransporte(g, s, t, p) {
      if (p.giro % 3 < 1) { g.strokeStyle = 'rgba(30,224,240,.7)'; g.lineWidth = 3 * s; g.beginPath(); g.arc(0, 0, 11 * s, 0, 7); g.stroke(); return; }   // copia fantasma del balón
      g.fillStyle = Math.floor(t * 30) % 2 ? '#1ee0f0' : '#ff3ad0';
      for (let k = 0; k < 3; k++) g.fillRect((k * 7 - 9) * s, ((k % 2) * 6 - 4) * s, 5 * s, 5 * s);
    },
    factura(g, s) {
      g.fillStyle = '#fffbe8'; g.strokeStyle = '#111'; g.lineWidth = 2 * s;
      g.fillRect(-9 * s, -12 * s, 18 * s, 24 * s); g.strokeRect(-9 * s, -12 * s, 18 * s, 24 * s);
      g.fillStyle = '#c33'; g.fillRect(-6 * s, 4 * s, 12 * s, 4 * s);
      g.fillStyle = '#888'; for (let k = 0; k < 3; k++) g.fillRect(-6 * s, (-8 + k * 4) * s, 12 * s, 1.5 * s);
    },
  };

  // ---------- lo que se dibuja (vista.js) ----------
  // En el suelo, antes que los jugadores: las marcas quemadas, con un brillo del color del tiro que se apaga.
  ST.suelo = function (g) {
    const P = S.vista.P;
    for (const m of ST.marcas) {
      const q = P(m.x, m.y, 0), a = Math.min(1, m.vida / 2), r = 34 * q.s;
      g.save(); g.globalAlpha = a;
      g.fillStyle = 'rgba(20,14,10,.55)'; g.beginPath(); g.ellipse(q.x, q.y, r, r * 0.34, 0, 0, 7); g.fill();
      g.globalAlpha = a * Math.min(1, m.vida / 6) * 0.8; g.strokeStyle = m.color; g.lineWidth = 3 * q.s;
      g.beginPath(); g.ellipse(q.x, q.y, r * 0.8, r * 0.26, 0, 0, 7); g.stroke();
      g.restore();
    }
  };

  // En el aire, encima de los jugadores: suelta trozos del rastro mientras vuela un súper y los dibuja.
  ST.aire = function (g, e, dt, t) {
    const b = e.balon;
    mover(dt);
    if (esSuper(b) && !S.efectos.enCorte()) {
      ST.cada -= dt;
      if (ST.cada <= 0) { ST.cada = 0.035; soltar(b, b.tiro.tipo); if (Math.random() < 0.5) S.efectos.estallido(b.x, b.y, b.z + 0.5, ST.color(b.tiro.tipo), 2); }
    }
    const P = S.vista.P;
    for (const p of ST.bits) {
      const q = P(p.x, p.y, p.z), forma = FORMA[p.tipo];
      if (!forma) continue;
      g.save(); g.translate(q.x, q.y); g.rotate(p.tipo === 'fantasma' ? Math.sin(p.giro) * 0.3 : p.giro);
      g.globalAlpha = Math.min(1, p.vida * 2); forma(g, q.s * 1.3, t, p); g.restore();
    }
  };

  // Encima de todo, en la pantalla: el destello al salir el balón (cuando acaba el corte) y las líneas de velocidad.
  ST.pantalla = function (g, e, dt) {
    const b = e.balon, vuela = esSuper(b) && !S.efectos.enCorte();
    if (vuela && ST.tiroVisto !== b.ultimoTiro) { ST.tiroVisto = b.ultimoTiro; ST.destello = 1; }
    if (vuela) velocidad(g, e);
    if (ST.destello > 0) {
      g.fillStyle = `rgba(255,255,255,${ST.destello * 0.75})`; g.fillRect(0, 0, W, H);
      ST.destello = Math.max(0, ST.destello - dt * 4);
    }
  };

  // Rayas que salen del balón hacia los bordes, del color del tiro.
  function velocidad(g, e) {
    const b = e.balon, V = S.vista, q = V.aPantalla(V.P(b.x, b.y, b.z)), color = ST.color(b.tiro.tipo);
    g.save(); g.strokeStyle = color; g.lineWidth = 3;
    for (let i = 0; i < 22; i++) {
      const a = i * 2.39 + V.ahora * 3, r0 = 90 + ((i * 47 + V.ahora * 900) % 260), r1 = r0 + 70 + (i % 4) * 30;
      g.globalAlpha = 0.45; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * r1, q.y + Math.sin(a) * r1); g.stroke();
    }
    g.restore();
  }

  // Al empezar un partido o una repetición, sin restos del anterior.
  ST.limpiar = function () { ST.marcas = []; ST.bits = []; ST.destello = 0; };
})(SOCCER);
