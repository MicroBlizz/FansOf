// Fans of Rouflage · MASCOTAS EN LA PARTIDA: el bichito que llevas puesto (armario: categoría Mascotas; su dibujo está en armario-mascotas.js).
// Te sigue mientras te preparas (y en la habitación). Cuando empieza la cuenta atrás sale corriendo por el mapa por su cuenta y, ya en la
// caza, huye de los becarios que se le acercan. Es solo adorno: no cuenta para la vista, los silbidos ni los puntos, y los becarios bot
// no le hacen caso. En el PvP solo viaja el aspecto (la ropa `mascota`, con el aviso `rp` de siempre): cada pantalla mueve las mascotas
// a su manera, así que no hay nada que sincronizar. Hay una por personaje con mascota puesta; se crea y se quita sola al cambiarse de ropa.
'use strict';
const MASC = { lista: [], sigue: 30, vel: 185, velPaseo: 112, velSalida: 165, velHuida: 232, miedo: 175, salida: 3.5, tele: 340, esc: 1.5 };

function nuevaMascota(e) { return { mascota: e.ropa.mascota, dueno: e, x: e.x - 20 * e.mira, y: e.y, ordenY: e.y, dir: e.mira || 1, t: Math.random() * 10, mov: false, susto: 0, ang: rand(0, TAU), tAng: 0, atasco: 0, suelta: 0, sem: Math.random() * 9, acc: '', tAcc: 0, espera: rand(2, 4), polvo: [], tPolvo: 0 }; }

function mascotasAvanza(dt) {
  const L = MASC.lista;
  for (let i = L.length - 1; i >= 0; i--) { const d = L[i].dueno; if (!J.entes.includes(d) || !(d.ropa && d.ropa.mascota)) L.splice(i, 1); }
  for (const e of J.entes) {
    if (e.dueno || !e.ropa || !e.ropa.mascota) continue;
    let m = L.find(k => k.dueno === e); if (!m) { m = nuevaMascota(e); L.push(m); }
    m.mascota = e.ropa.mascota;
  }
  for (const m of L) avanzaMascota(m, dt);
}

// intenta dar un paso hacia un ángulo; devuelve si se ha movido
function pasoMascota(m, ang, vel, dt) {
  const ax = m.x, ay = m.y; mueve(m, Math.cos(ang) * vel * dt, Math.sin(ang) * vel * dt);
  const hecho = lejos(ax, ay, m.x, m.y) > vel * dt * 0.3;
  if (hecho && Math.abs(m.x - ax) > 0.05) m.dir = m.x > ax ? 1 : -1;
  return hecho;
}
function avanzaMascota(m, dt) {
  const e = m.dueno; m.t += dt; m.susto = Math.max(0, m.susto - dt);
  const libre = J.fase === 'cuenta' || J.fase === 'caza' || J.fase === 'fin';
  let movio = false;
  if (!libre) {      // siguiendo a su dueño: se queda un poco detrás de él, del lado contrario al que mira
    m.suelta = 0;
    const gx = e.x - (e.mira || 1) * MASC.sigue, gy = e.y + 1, d = lejos(m.x, m.y, gx, gy), dDueno = lejos(m.x, m.y, e.x, e.y);
    if (dDueno > MASC.tele || m.atasco > 1.2) { m.atasco = 0; for (const [ox, oy] of [[-10, 0], [10, 0], [0, 8], [0, -8], [0, 0]]) if (cabe(e.x + ox, e.y + oy)) { m.x = e.x + ox; m.y = e.y + oy; break; } }
    else if (d > 7) {
      const vel = Math.min(MASC.vel, 60 + d * 4.5);
      movio = pasoMascota(m, Math.atan2(gy - m.y, gx - m.x), vel, dt) || pasoMascota(m, Math.atan2(gy - m.y, 0), vel, dt) || pasoMascota(m, Math.atan2(0, gx - m.x), vel, dt);
      m.atasco = movio ? 0 : m.atasco + dt;
    } else m.atasco = 0;
  } else {
    m.suelta += dt;
    // los becarios cerca (menos su dueño, si lo es): huir en dirección contraria
    let h = null, md = MASC.miedo; if (J.fase === 'caza') for (const k of J.cazadores) { if (k.fuera || k === e) continue; const d = lejos(m.x, m.y, k.x, k.y); if (d < md) { md = d; h = k; } }
    if (h) {
      m.susto = 0.5; const base = Math.atan2(m.y - h.y, m.x - h.x);
      for (const giro of [0, 0.6, -0.6, 1.2, -1.2, 1.9, -1.9, Math.PI]) if (cabe(m.x + Math.cos(base + giro) * 14, m.y + Math.sin(base + giro) * 14)) { m.ang = base + giro; break; }
      movio = pasoMascota(m, m.ang, MASC.velHuida, dt); m.tAng = 0.4;
    } else {      // a lo suyo por el mapa: un rumbo cada rato y otro si se topa con algo. Al soltarse, sale disparada lejos de su dueño
      if (m.suelta < dt * 1.5) { m.ang = Math.atan2(m.y - e.y, m.x - e.x) + rand(-0.9, 0.9); if (lejos(m.x, m.y, e.x, e.y) < 4) m.ang = rand(0, TAU); m.tAng = rand(1.5, 3); }
      m.tAng -= dt; if (m.tAng <= 0) { m.ang += rand(-1.6, 1.6); m.tAng = rand(1.2, 3.2); }
      movio = pasoMascota(m, m.ang, m.suelta < MASC.salida ? MASC.velSalida : MASC.velPaseo, dt);
      if (!movio) { m.ang = rand(0, TAU); m.tAng = rand(0.8, 2); }
    }
  }
  m.mov = movio; m.ordenY = m.y;
  // quieto un rato: hace algo por su cuenta (un saltito de alegría, mirar a los lados o menearse); corriendo, levanta polvo
  if (m.acc) { m.tAcc += dt; if (m.tAcc >= ACCIONES_MASC[m.acc]) { m.acc = ''; m.espera = rand(2.5, 5.5); } }
  else if (!movio && !m.susto) { m.espera -= dt; if (m.espera <= 0) { m.acc = ['salta', 'mira', 'menea'][Math.floor(Math.random() * 3)]; m.tAcc = 0; } }
  if (movio) { m.acc = ''; m.tPolvo -= dt; if (m.tPolvo <= 0) { m.tPolvo = m.susto ? 0.07 : 0.13; m.polvo.push({ x: m.x - m.dir * 6, y: m.y, t: 0 }); } }
  for (let i = m.polvo.length - 1; i >= 0; i--) if ((m.polvo[i].t += dt) > 0.45) m.polvo.splice(i, 1);
}
const ACCIONES_MASC = { salta: 0.55, mira: 1.4, menea: 0.9 };      // lo que dura cada cosa que hace estando quieta

// dibujada en el mundo con los pies en x,y (dibujo.js la mezcla con los personajes por su y), más grande que antes y con vida: se inclina
// al correr, tiembla y suda con el susto, levanta polvo y, quieta, hace sus cosas (ACCIONES_MASC)
function pintaMascota(c, m) {
  const f = ARD.MASCOTAS[m.mascota]; if (!f) return;
  const k = m.tAcc / (ACCIONES_MASC[m.acc] || 1);
  let alto = 0, giro = m.mov ? 0.12 : 0, dir = m.dir, sx = 1, sy = 1;
  if (m.acc === 'salta') { alto = Math.sin(Math.PI * k) * 9; const e = 1 + Math.sin(Math.PI * k) * 0.12; sy = k < 0.12 || k > 0.88 ? 0.86 : e; sx = 1 / Math.sqrt(sy); }
  else if (m.acc === 'mira') dir = k > 0.3 && k < 0.7 ? -m.dir : m.dir;
  else if (m.acc === 'menea') giro = Math.sin(k * Math.PI * 6) * 0.16 * (1 - k);
  const tiembla = m.susto > 0 ? (Math.random() - 0.5) * 1.2 : 0;
  c.save(); c.translate(m.x + tiembla, m.y);
  for (const p of m.polvo) { const q = p.t / 0.45; c.globalAlpha = 0.45 * (1 - q); ARD.shape(c, ARD.el(p.x - m.x - m.dir * q * 4, -2 - q * 5, 2.4 + q * 3.4, 1.8 + q * 2.4), '#e8e1d4', 0); }
  c.globalAlpha = 1;
  ARD.shape(c, ARD.el(0, 1, 11.5 * (1 - alto / 30), 3.4 * (1 - alto / 30)), 'rgba(20,10,40,.3)', 0);
  c.translate(0, -alto); c.rotate(giro * dir); c.scale(dir * MASC.esc * sx, MASC.esc * sy);
  try { f(c, { t: m.t, mov: m.mov ? 1 : 0, susto: m.susto > 0, sem: m.sem }); } catch (err) { console.warn('[mascota]', err); }
  c.restore();
  if (m.susto > 0) {      // gotas de sudor saltando de la cabeza
    for (let i = 0; i < 2; i++) { const q = ((m.t * 2.4 + i * 0.5) % 1); c.save(); c.globalAlpha = 1 - q; ARD.shape(c, ARD.el(m.x - m.dir * (8 + q * 8) + i * 14 * m.dir, m.y - 30 - q * 6 + q * q * 14, 1.6, 2.4), '#8fd3ff', 0.9); c.restore(); }
  }
}
