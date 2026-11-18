// Fans of Air · La cabina: el panel de instrumentos de la fase aérea, como el del original. De izquierda a derecha: la pantalla
// de DAÑOS (la silueta del caza, que se enciende al recibir, y el escudo; ahí salen también los avisos, como en el original:
// «ALTURA MÁXIMA», «¡SUBE!», «+2 MISILES»…), el RADAR (visto desde arriba con el morro hacia arriba: enemigos, jefe, premios y
// disparos a tu alrededor), la pantalla de MISIÓN (objetivo, altura, velocidad, combustible, puntos y el piloto) y los MISILES.
// A la derecha queda sitio para los botones táctiles (pantalla.js). Ocupa de y = 490 a 720 del lienzo de 1280x720.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const CAB = A.cabina = { golpeT: -9, aviso: null };
  const Y0 = 490, ALTO = 230;
  // las pantallas, justo en los huecos del panel pintado por Yoshi (panel-cabina.jpg, repintado desde un boceto con estas medidas)
  const DANOS = { x: 23, y: 505, w: 261, h: 202 }, RADAR = { x: 303, y: 505, w: 222, h: 202 }, MISION = { x: 544, y: 505, w: 329, h: 202 }, ARMAS = { x: 892, y: 505, w: 97, h: 202 };
  const texto = (g, ...a) => A.ui.texto(g, ...a);

  // Los avisos de la pantalla izquierda: [texto, color, segundos].
  const PREMIO = { misiles: ['+2 MISILES', '#9fe0ff'], bombas: ['+3 BOMBAS', '#ffe14a'], reparacion: ['REPARACIÓN', '#5fe05f'], combustible: ['COMBUSTIBLE', '#ff8a2a'] };
  const AVISOS = {
    alturaMax: () => ['ALTURA MÁXIMA', '#ff7ac8', 2], alturaBaja: () => ['¡ALTURA! ¡SUBE!', '#ff5a3a', 1.6], perdida: () => ['¡PÉRDIDA!', '#ff5a3a', 1.6],
    combustibleBajo: () => ['¡POCO COMBUSTIBLE!', '#ff8a2a', 3], premio: (ev) => [PREMIO[ev.premio][0], PREMIO[ev.premio][1], 2],
    jefe: () => ['¡SURVIVALBOT!', '#ff5a3a', 2.5], sinMisiles: () => ['SIN MISILES', '#ff5a3a', 1.2],
  };
  CAB.evento = function (ev) {
    if (ev.tipo === 'dano') CAB.golpeT = performance.now();
    const a = AVISOS[ev.tipo] && AVISOS[ev.tipo](ev);
    if (a) CAB.aviso = { texto: a[0], color: a[1], hasta: performance.now() + a[2] * 1000 };
  };
  CAB.reiniciar = function () { CAB.aviso = null; CAB.golpeT = -9; };

  // Parte un texto en dos líneas si no cabe (para los avisos grandes de la pantalla izquierda).
  function partir(t) { const p = t.split(' '); return t.length > 11 && p.length > 1 ? [p.slice(0, Math.ceil(p.length / 2)).join(' '), p.slice(Math.ceil(p.length / 2)).join(' ')] : [t]; }
  function aviso(g, t) {
    const z = DANOS, a = CAB.aviso;
    g.fillStyle = a.color; g.fillRect(z.x + 8, z.y + 28, z.w - 16, 124);
    if (Math.floor(t * 4) % 2) { g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(z.x + 8, z.y + 28, z.w - 16, 124); }
    const l = partir(tr(a.texto));
    l.forEach((s, i) => texto(g, s, z.x + z.w / 2, z.y + 98 + (i - (l.length - 1) / 2) * 30, 14, '#fff'));
  }

  // Una pantalla del panel: marco de metal biselado con cuatro tornillos, cristal oscuro con líneas de barrido y un reflejo.
  function pantalla(g, z, titulo, color) {
    if (A.vista.img['panel-cabina']) { cristal(g, z, titulo, color); return; }   // el panel de Yoshi ya trae los marcos
    const m = 8, bisel = g.createLinearGradient(0, z.y - m, 0, z.y + z.h + m);
    bisel.addColorStop(0, '#8a92a6'); bisel.addColorStop(0.5, '#4a5263'); bisel.addColorStop(1, '#20242d');
    g.fillStyle = '#0d0f14'; g.fillRect(z.x - m - 2, z.y - m - 2, z.w + 2 * m + 4, z.h + 2 * m + 4);
    g.fillStyle = bisel; g.fillRect(z.x - m, z.y - m, z.w + 2 * m, z.h + 2 * m);
    g.fillStyle = '#111'; g.fillRect(z.x - 2, z.y - 2, z.w + 4, z.h + 4);
    g.fillStyle = color || '#081018'; g.fillRect(z.x, z.y, z.w, z.h);
    g.fillStyle = 'rgba(255,255,255,.035)'; for (let y = z.y + 2; y < z.y + z.h; y += 4) g.fillRect(z.x, y, z.w, 1);   // líneas de barrido
    for (const [x, y] of [[z.x - m / 2, z.y - m / 2], [z.x + z.w + m / 2, z.y - m / 2], [z.x - m / 2, z.y + z.h + m / 2], [z.x + z.w + m / 2, z.y + z.h + m / 2]]) tornillo(g, x, y, 3.2);
    if (titulo) rotulo(g, z, titulo);
  }
  function cristal(g, z, titulo, color) {
    g.fillStyle = color || '#081018'; g.fillRect(z.x, z.y, z.w, z.h);
    g.fillStyle = 'rgba(255,255,255,.035)'; for (let y = z.y + 2; y < z.y + z.h; y += 4) g.fillRect(z.x, y, z.w, 1);
    if (titulo) rotulo(g, z, titulo);
  }
  function rotulo(g, z, titulo) {
    g.fillStyle = '#1b2230'; g.fillRect(z.x + 6, z.y + 6, Math.min(z.w - 12, titulo.length * 9 + 14), 16);
    texto(g, titulo, z.x + 13, z.y + 19, 8, '#9fe0ff', 'left');
  }
  // El reflejo del cristal, encima de todo lo de la pantalla.
  function brillo(g, z) {
    const r = g.createLinearGradient(z.x, z.y, z.x + z.w * 0.6, z.y + z.h);
    r.addColorStop(0, 'rgba(255,255,255,.09)'); r.addColorStop(0.35, 'rgba(255,255,255,.02)'); r.addColorStop(0.36, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(z.x, z.y, z.w, z.h);
  }
  function tornillo(g, x, y, r) {
    g.fillStyle = '#c9ced8'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.strokeStyle = '#3a3f4a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - r * 0.7, y - r * 0.7); g.lineTo(x + r * 0.7, y + r * 0.7); g.stroke();
  }

  function base(g, t) {
    const img = A.vista.img['panel-cabina'];
    if (img) g.drawImage(img, 0, Y0, 1280, ALTO);
    else {
      const metal = g.createLinearGradient(0, Y0, 0, 720); metal.addColorStop(0, '#5a6070'); metal.addColorStop(0.08, '#3a3f4a'); metal.addColorStop(1, '#262a33');
      g.fillStyle = metal; g.fillRect(0, Y0, 1280, ALTO);
      for (let x = 12; x < 1280; x += 42) tornillo(g, x, Y0 + 9, 2.5);
    }
    g.fillStyle = '#0d0f14'; g.fillRect(0, Y0 - 6, 1280, 7);
    // lucecitas del panel: verdes fijas y una ámbar que parpadea
    for (let k = 0; k < 4; k++) { g.fillStyle = k === 3 && Math.floor(t * 2) % 2 ? '#ffb02a' : '#3adf6a'; g.beginPath(); g.arc(1010 + k * 16, Y0 + 20, 4, 0, 7); g.fill(); }
  }

  // La pantalla de DAÑOS: la silueta del caza visto desde arriba; se enciende al recibir y se va poniendo roja al perder escudo.
  function danos(g, e, t) {
    const c = e.caza, img = A.vista.img['cenital-' + c.id], f = e.escudo / c.escudo, golpe = performance.now() - CAB.golpeT < 140;
    pantalla(g, DANOS, tr('DAÑOS'), golpe ? '#5a1a1a' : f < 0.3 ? '#2a0b10' : '#0b1020');
    const cx = DANOS.x + DANOS.w / 2, cy = DANOS.y + 92, h = 120;
    if (CAB.aviso && performance.now() < CAB.aviso.hasta) aviso(g, t);
    else if (img) {
      const w = h * img.width / img.height;
      g.save(); g.translate(cx, cy);
      if (golpe) g.filter = 'brightness(4)'; else if (f < 0.6) g.filter = 'sepia(1) saturate(4) hue-rotate(-40deg)';   // tocado: se va poniendo rojo
      g.drawImage(img, -w / 2, -h / 2, w, h);
      g.restore();
    } else { g.fillStyle = c.color; g.beginPath(); g.moveTo(cx, cy - 50); g.lineTo(cx + 44, cy + 36); g.lineTo(cx, cy + 20); g.lineTo(cx - 44, cy + 36); g.closePath(); g.fill(); }
    if (f < 0.3 && Math.floor(t * 4) % 2) texto(g, tr('¡ESCUDO BAJO!'), cx, cy - 56, 9, '#ff5a3a');
    texto(g, tr('ESCUDO'), DANOS.x + 10, DANOS.y + 178, 8, '#ccc', 'left');
    A.ui.barra(g, DANOS.x + 80, DANOS.y + 167, 140, 12, f, f < 0.3 ? '#ff5a3a' : '#5fe05f');
    texto(g, Math.ceil(e.escudo), DANOS.x + DANOS.w - 6, DANOS.y + 178, 8, '#fff', 'right');
  }

  // El radar: tú en el centro con el morro hacia arriba; alrededor, a escala, lo que hay hasta `ALCANCE_RADAR` metros.
  const ALCANCE_RADAR = 2600;
  function radar(g, e, t) {
    pantalla(g, RADAR, tr('RADAR'));
    const a = e.aire, j = a.jugador, cx = RADAR.x + RADAR.w / 2, cy = RADAR.y + 104, R = 78, rumbo = A.vuelo.rumbo(j), c = Math.cos(rumbo), s = Math.sin(rumbo);
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
    g.fillStyle = '#06200f'; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    g.strokeStyle = 'rgba(95,224,95,.35)'; g.lineWidth = 1;
    for (const r of [R * 0.33, R * 0.66]) { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); }
    g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
    const ang = (t * 2.2) % (Math.PI * 2);   // barrido que gira
    g.fillStyle = 'rgba(95,224,95,.16)'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, ang, ang + 0.5); g.closePath(); g.fill();
    const punto = (p, r, color) => {
      const dx = p.x - j.pos.x, dz = p.z - j.pos.z, lado = dx * c - dz * s, frente = dx * s + dz * c, k = R / ALCANCE_RADAR;
      const d = Math.hypot(lado, frente) * k, f = d > R - 4 ? (R - 4) / d : 1;
      g.fillStyle = color; g.beginPath(); g.arc(cx + lado * k * f, cy - frente * k * f, r, 0, 7); g.fill();
    };
    for (const pr of a.premios) punto(pr.pos, 3, '#ffe14a');
    for (const s2 of a.tiros) punto(s2.pos, 2, '#ff7ac8');
    for (const en of a.enemigos) punto(en.pos, 4, '#5fe05f');
    if (a.jefe) punto(a.jefe.pos, 7, Math.floor(t * 6) % 2 ? '#ff5a3a' : '#fff');
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx, cy - 8); g.lineTo(cx + 6, cy + 5); g.lineTo(cx - 6, cy + 5); g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = '#4a5468'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
  }

  // Objetivo arriba; abajo, los instrumentos: altura (ALT), velocidad (VEL) y combustible (COMB).
  function mision(g, e, t) {
    const AJ = e.aj, z = MISION, img = A.vista.img['r-' + e.caza.id], j = e.aire.jugador;
    pantalla(g, z, tr('MISIÓN'));
    if (img) { const h = 64, w = img.width * h / img.height; g.save(); g.beginPath(); g.rect(z.x + z.w - 76, z.y + 8, 68, 64); g.clip(); g.drawImage(img, z.x + z.w - 76 + (68 - w) / 2, z.y + 8, w, h); g.restore(); g.strokeStyle = '#4a5468'; g.lineWidth = 2; g.strokeRect(z.x + z.w - 76, z.y + 8, 68, 64); }
    objetivo(g, e, z);
    const alt = Math.round(j.pos.y), bajo = j.pos.y < AJ.aire.vuelo.altAviso, poco = e.combustible < AJ.combustible.aviso, parpadeo = Math.floor(t * 4) % 2;
    instrumento(g, z, 0, 'ALT', alt + ' m', j.pos.y / AJ.aire.vuelo.altMax, bajo && parpadeo ? '#ff5a3a' : '#9fe0ff');
    instrumento(g, z, 1, 'VEL', Math.round(j.vel * 3.6) + ' km/h', j.vel / (AJ.aire.vuelo.velMax * e.caza.vel), '#5fe05f');
    instrumento(g, z, 2, 'COMB', Math.ceil(e.combustible) + ' s', e.combustible / AJ.combustible.max, poco && parpadeo ? '#ff5a3a' : '#ff8a2a');
    texto(g, tr('PUNTOS'), z.x + 10, z.y + 180, 8, '#ccc', 'left');
    texto(g, String(e.puntos).padStart(6, '0'), z.x + 90, z.y + 180, 10, '#ffe14a', 'left');
  }

  function objetivo(g, e, z) {
    const AJ = e.aj;
    if (e.fase === 'transicion') { texto(g, tr('¡LOS TENEMOS!'), z.x + 10, z.y + 42, 10, '#5fe05f', 'left'); texto(g, tr('PILOTO AUTOMÁTICO'), z.x + 10, z.y + 64, 8, '#ffe14a', 'left'); }
    else if (e.aire.jefe) { texto(g, tr('¡SURVIVALBOT!'), z.x + 10, z.y + 42, 10, '#ff5a3a', 'left'); A.ui.barra(g, z.x + 10, z.y + 54, 220, 8, e.aire.jefe.vida / AJ.aire.jefe.vida, '#ff5a3a'); }
    else { texto(g, tr('DESPEJA EL CIELO'), z.x + 10, z.y + 42, 10, '#ffe14a', 'left'); texto(g, tr('Derribos') + ' ' + Math.min(e.derribos, AJ.aire.derribos) + '/' + AJ.aire.derribos + (e.combo > 1 ? '  ' + tr('RABIA') + ' x' + e.combo : ''), z.x + 10, z.y + 64, 8, e.combo > 1 ? '#ff8a2a' : '#fff', 'left'); }
  }

  function instrumento(g, z, i, nombre, valor, f, color) {
    const y = z.y + 90 + i * 24;
    texto(g, tr(nombre), z.x + 10, y + 9, 8, '#9aa4c8', 'left');
    A.ui.barra(g, z.x + 66, y, 150, 10, f, color);
    texto(g, valor, z.x + z.w - 10, y + 9, 8, '#fff', 'right');
  }

  function armas(g, e, t) {
    const z = ARMAS;
    pantalla(g, z, tr('MISILES'));
    for (let i = 0; i < e.caza.misiles; i++) {
      const x = z.x + 24 + (i % 2) * 40, y = z.y + 46 + Math.floor(i / 2) * 36, hay = i < e.misiles;
      g.fillStyle = hay ? (e.aire.fijando.fijado && i === e.misiles - 1 && Math.floor(t * 8) % 2 ? '#ff5a3a' : '#9fe0ff') : '#2a3040'; g.strokeStyle = '#111'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + 7, y + 4); g.lineTo(x + 3, y + 4); g.lineTo(x + 3, y + 12); g.lineTo(x - 3, y + 12); g.lineTo(x - 3, y + 4); g.lineTo(x - 7, y + 4); g.closePath(); g.fill(); g.stroke();
    }
    if (e.aire.fijando.fijado) texto(g, tr('FIJADO'), z.x + z.w / 2, z.y + 180, 8, '#ff5a3a');
  }

  CAB.dibujar = function (g, e, t) {
    base(g, t);
    danos(g, e, t);
    radar(g, e, t);
    mision(g, e, t);
    armas(g, e, t);
    for (const z of [DANOS, RADAR, MISION, ARMAS]) brillo(g, z);
  };
})(AIR);
