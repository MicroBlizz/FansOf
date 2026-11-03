// Fans of Air · La cabina: el panel de instrumentos de la fase aérea, como el del original. De izquierda a derecha: la pantalla
// de DAÑOS (la silueta del caza, que se enciende al recibir, y el escudo), el RADAR (los enemigos como puntos: a los lados según
// dónde estén y más arriba cuanto más lejos), la pantalla de MISIÓN (objetivo, puntos y el piloto) y las ARMAS (misiles que quedan).
// A la derecha queda sitio para los botones táctiles (pantalla.js). Ocupa de y = 490 a 720 del lienzo de 1280x720.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const CAB = A.cabina = { golpeT: -9 };
  const Y0 = 490, ALTO = 230;
  const DANOS = { x: 16, y: 504, w: 268, h: 200 }, RADAR = { x: 300, y: 504, w: 228, h: 200 }, MISION = { x: 544, y: 504, w: 330, h: 200 }, ARMAS = { x: 890, y: 504, w: 96, h: 200 };
  const texto = (g, ...a) => A.ui.texto(g, ...a);

  CAB.evento = function (ev) { if (ev.tipo === 'dano') CAB.golpeT = performance.now(); };

  function pantalla(g, z, titulo, color) {
    g.fillStyle = '#1c2029'; g.fillRect(z.x - 4, z.y - 4, z.w + 8, z.h + 8);
    g.fillStyle = color || '#0b1020'; g.fillRect(z.x, z.y, z.w, z.h);
    g.strokeStyle = '#4a5468'; g.lineWidth = 2; g.strokeRect(z.x, z.y, z.w, z.h);
    if (titulo) texto(g, titulo, z.x + 10, z.y + 18, 8, '#9aa4c8', 'left');
  }

  function base(g) {
    const metal = g.createLinearGradient(0, Y0, 0, 720); metal.addColorStop(0, '#5a6070'); metal.addColorStop(0.08, '#3a3f4a'); metal.addColorStop(1, '#262a33');
    g.fillStyle = metal; g.fillRect(0, Y0, 1280, ALTO);
    g.fillStyle = '#111'; g.fillRect(0, Y0 - 6, 1280, 6);
    g.fillStyle = '#7a8296'; g.fillRect(0, Y0, 1280, 3);
    for (let x = 40; x < 1280; x += 1200) for (let y = Y0 + 20; y < 710; y += 40) { g.fillStyle = '#1c2029'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }   // remaches a los lados
  }

  // La pantalla de DAÑOS: la silueta del caza visto desde arriba; se enciende al recibir y se va poniendo roja al perder escudo.
  function danos(g, e, t) {
    const c = e.caza, img = A.vista.img['cenital-' + c.id], f = e.escudo / c.escudo, golpe = performance.now() - CAB.golpeT < 140;
    pantalla(g, DANOS, tr('DAÑOS'), golpe ? '#5a1a1a' : f < 0.3 ? '#2a0b10' : '#0b1020');
    const cx = DANOS.x + DANOS.w / 2, cy = DANOS.y + 92, h = 120;
    if (img) {
      const w = h * img.width / img.height;
      g.save(); g.translate(cx, cy);
      if (golpe) g.filter = 'brightness(4)'; else if (f < 0.6) g.filter = 'sepia(1) saturate(4) hue-rotate(-40deg)';   // tocado: se va poniendo rojo
      g.drawImage(img, -w / 2, -h / 2, w, h);
      g.restore();
    } else { g.fillStyle = c.color; g.beginPath(); g.moveTo(cx, cy - 50); g.lineTo(cx + 44, cy + 36); g.lineTo(cx, cy + 20); g.lineTo(cx - 44, cy + 36); g.closePath(); g.fill(); }
    if (f < 0.3 && Math.floor(t * 4) % 2) texto(g, tr('¡ESCUDO BAJO!'), cx, cy - 56, 9, '#ff5a3a');
    texto(g, tr('ESCUDO'), DANOS.x + 10, DANOS.y + 186, 8, '#ccc', 'left');
    A.ui.barra(g, DANOS.x + 80, DANOS.y + 174, 150, 12, f, f < 0.3 ? '#ff5a3a' : '#5fe05f');
    texto(g, Math.ceil(e.escudo), DANOS.x + 258, DANOS.y + 186, 8, '#fff', 'right');
  }

  // El radar: tú abajo en el centro, los enemigos como puntos (a los lados según dónde estén, más arriba cuanto más lejos).
  function radar(g, e, t) {
    pantalla(g, RADAR, tr('RADAR'));
    const a = e.aire, j = a.jugador, cx = RADAR.x + RADAR.w / 2, cy = RADAR.y + 118, R = 82, L = e.aj.aire.limites.x, Z = e.aj.aire.zLejos;
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
    g.fillStyle = '#06200f'; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    g.strokeStyle = 'rgba(95,224,95,.35)'; g.lineWidth = 1;
    for (const r of [R * 0.33, R * 0.66]) { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); }
    g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
    const bar = (t * 1.4) % 1;   // barrido que sube
    g.fillStyle = 'rgba(95,224,95,.18)'; g.fillRect(cx - R, cy + R - bar * 2 * R - 10, 2 * R, 10);
    const punto = (en, r, color) => { const x = cx + A.util.limita((en.x - j.x) / (2 * L), -0.5, 0.5) * R * 1.8, y = cy + R * 0.9 - A.util.limita(en.z / Z, 0, 1) * R * 1.75; g.fillStyle = color; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    for (const en of a.enemigos) punto(en, 4, '#5fe05f');
    if (a.jefe) punto(a.jefe, 7, Math.floor(t * 6) % 2 ? '#ff5a3a' : '#fff');
    for (const s of a.tiros) punto(s, 2, '#ffe14a');
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx, cy + R * 0.9 - 8); g.lineTo(cx + 6, cy + R * 0.9 + 4); g.lineTo(cx - 6, cy + R * 0.9 + 4); g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = '#4a5468'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
  }

  function mision(g, e, t) {
    const AJ = e.aj, z = MISION, img = A.vista.img['r-' + e.caza.id];
    pantalla(g, z, tr('MISIÓN'));
    if (img) { const h = 86, w = img.width * h / img.height; g.save(); g.beginPath(); g.rect(z.x + z.w - 100, z.y + 28, 90, 86); g.clip(); g.drawImage(img, z.x + z.w - 100 + (90 - w) / 2, z.y + 28, w, h); g.restore(); g.strokeStyle = '#4a5468'; g.lineWidth = 2; g.strokeRect(z.x + z.w - 100, z.y + 28, 90, 86); }
    if (e.fase === 'transicion') { texto(g, tr('¡LOS TENEMOS!'), z.x + 10, z.y + 54, 11, '#5fe05f', 'left'); texto(g, tr('PILOTO AUTOMÁTICO'), z.x + 10, z.y + 80, 9, '#ffe14a', 'left'); texto(g, tr('Rumbo a la base de Microblizz'), z.x + 10, z.y + 104, 8, '#ccc', 'left'); }
    else if (e.aire.jefe) { texto(g, tr('¡SURVIVALBOT!'), z.x + 10, z.y + 54, 11, '#ff5a3a', 'left'); A.ui.barra(g, z.x + 10, z.y + 66, 200, 10, e.aire.jefe.vida / AJ.aire.jefe.vida, '#ff5a3a'); texto(g, tr('El robot de los despidos'), z.x + 10, z.y + 104, 8, '#ccc', 'left'); }
    else { texto(g, tr('DESPEJA EL CIELO'), z.x + 10, z.y + 54, 11, '#ffe14a', 'left'); texto(g, tr('Derribos') + ' ' + Math.min(e.derribos, AJ.aire.derribos) + '/' + AJ.aire.derribos, z.x + 10, z.y + 80, 9, '#fff', 'left'); if (e.combo > 1) texto(g, tr('RABIA') + ' x' + e.combo, z.x + 10, z.y + 104, 9, '#ff8a2a', 'left'); }
    texto(g, tr('PUNTOS'), z.x + 10, z.y + 186, 8, '#ccc', 'left');
    texto(g, String(e.puntos).padStart(6, '0'), z.x + 90, z.y + 186, 11, '#ffe14a', 'left');
  }

  function armas(g, e, t) {
    const z = ARMAS;
    pantalla(g, z, tr('MISILES'));
    for (let i = 0; i < e.caza.misiles; i++) {
      const x = z.x + 24 + (i % 2) * 40, y = z.y + 46 + Math.floor(i / 2) * 36, hay = i < e.misiles;
      g.fillStyle = hay ? (e.aire.fijando.fijado && i === e.misiles - 1 && Math.floor(t * 8) % 2 ? '#ff5a3a' : '#9fe0ff') : '#2a3040'; g.strokeStyle = '#111'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + 7, y + 4); g.lineTo(x + 3, y + 4); g.lineTo(x + 3, y + 12); g.lineTo(x - 3, y + 12); g.lineTo(x - 3, y + 4); g.lineTo(x - 7, y + 4); g.closePath(); g.fill(); g.stroke();
    }
    if (e.aire.fijando.fijado) texto(g, tr('FIJADO'), z.x + z.w / 2, z.y + 186, 8, '#ff5a3a');
  }

  CAB.dibujar = function (g, e, t) {
    base(g);
    danos(g, e, t);
    radar(g, e, t);
    mision(g, e, t);
    armas(g, e, t);
  };
})(AIR);
