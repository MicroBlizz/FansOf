// Fans of Jump · Cuando CrazyBunny cae: una escena corta en vez de hundirse de golpe. Un instante a cámara lenta, un
// salpicón de verdad (corona de gotas brillantes, columna de agua, espuma y ondas), el conejo chapotea un par de veces y
// se hunde con burbujas («glu glu»), y su corona sale volando y se queda flotando meciéndose. Si lo pilla la ola, todo es
// de barro y además caen manchas de barro en la pantalla que resbalan. También vale para la segunda oportunidad.
'use strict';

const MUERTE = { activa: false, t: 0, x: 0, wy: 0, barro: false, corona: null, burbujas: [], manchas: [], tBurbuja: 0 };
const LENTO_SEG = 0.4;   // lo que dura la cámara lenta del principio
// cuánto se ha hundido (0 = fuera, 1 = del todo): chapotea dos veces y luego se va al fondo
const HUNDE = [[0, 0], [0.12, 0.38], [0.32, 0.16], [0.52, 0.42], [0.72, 0.24], [0.98, 0.5], [1.6, 1]];
function hundido(t, tope = 1) {
  let i = 0; while (i < HUNDE.length - 2 && HUNDE[i + 1][0] < t) i++;
  const [a, va] = HUNDE[i], [b, vb] = HUNDE[i + 1], k = Math.max(0, Math.min(1, (t - a) / (b - a))), e = k * k * (3 - 2 * k);
  return Math.min(tope, va + (vb - va) * e);
}

function empiezaMuerte(motivo) {
  const c = JUEGO.conejo, M = MUERTE;
  if (M.activa) return;
  const barro = motivo === 'ola';
  Object.assign(M, { activa: true, t: 0, x: c.x, wy: c.wy, barro, burbujas: [], manchas: [], tBurbuja: 0.9 });
  // las gotas, del color del agua donde cae (más turbia cerca de la ola)
  const agua = barro ? '#9a6a40' : colorAgua(c.wy), brillo = barro ? '#d8a878' : colorAgua(c.wy, 0.85, 1);
  // la corona de gotas: muchas, hacia fuera y hacia arriba
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2 + Math.random() * 0.2, s = azar(16, 42);
    FX.push({ t: 'gotaG', x: c.x, wy: c.wy, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.55, z: azar(2, 6), vz: azar(55, 105), r: azar(0.9, 1.9), color: agua, luz: brillo, v: 2 });
  }
  FX.push({ t: 'columna', x: c.x, wy: c.wy, color: agua, v: 0.7, v0: 0.7 });
  FX.push({ t: 'espuma', x: c.x, wy: c.wy, color: barro ? 'rgba(160,110,70,0.9)' : colorAgua(c.wy, 0.8, 0.95), v: 1.1, v0: 1.1 });
  const ondaC = barro ? 'rgba(255,230,200,0.7)' : 'rgba(255,255,255,0.85)';
  onda(c.x, c.wy, 10, ondaC);
  // la corona sale disparada de la cabeza
  M.corona = { x: c.x, wy: c.wy, z: 26, vx: azar(-18, 18) || 12, vz: 70, giro: 0, vgiro: azar(-9, 9), flota: false, fase: 0 };
  if (barro) for (let i = 0; i < 7; i++) M.manchas.push({ x: azar(10, PAN.W - 10), y: azar(30, PAN.H * 0.6), r: azar(6, 14), t: -i * 0.06, forma: Array.from({ length: 9 }, () => azar(0.75, 1.15)) });
  JUEGO.lento = LENTO_SEG;
}
function acabaMuerte() { MUERTE.activa = false; MUERTE.corona = null; MUERTE.burbujas = []; MUERTE.manchas = []; }

function avanzaMuerte(dt) {
  const M = MUERTE; if (!M.activa) return;
  M.t += dt;
  // las ondas, una detrás de otra
  for (const k of [0.25, 0.5]) if (M.t - dt < k && M.t >= k) onda(M.x, M.wy, 12, M.barro ? 'rgba(255,230,200,0.6)' : 'rgba(255,255,255,0.75)');
  const C = M.corona;
  if (C && !C.flota) {
    C.x += C.vx * dt; C.z += C.vz * dt; C.vz -= 170 * dt; C.giro += C.vgiro * dt;
    if (C.z <= 0) { C.z = 0; C.flota = true; onda(C.x, M.wy, 5); salpica(C.x, M.wy, 5, M.barro ? '#9a6a40' : colorAgua(M.wy, 0.6)); }
  } else if (C) { C.fase += dt; C.giro += (Math.sin(C.fase * 2) * 0.25 - C.giro) * Math.min(1, dt * 3); if (Math.random() < dt * 0.8) onda(C.x, M.wy, 4, 'rgba(255,255,255,0.5)'); }
  // las burbujas, cuando ya se ha hundido
  if (M.t > M.tBurbuja) {
    M.tBurbuja = M.t + azar(0.12, 0.3);
    if (M.t < 3.2) M.burbujas.push({ x: M.x + azar(-6, 6), r: azar(1, 2.6), t: 0, sube: azar(0.35, 0.6) });
  }
  for (const b of M.burbujas) { b.t += dt; if (!b.pop && b.t > b.sube) { b.pop = true; onda(b.x, M.wy, b.r * 1.5, 'rgba(255,255,255,0.7)'); if (Math.random() < 0.5) SONIDO.glu(); } }
  M.burbujas = M.burbujas.filter(b => b.t < b.sube + 0.2);
  for (const m of M.manchas) m.t += dt;
}
// el conejo, hundiéndose: cuánto bajarlo y cómo se mueve al chapotear
function hundeConejo() {
  const M = MUERTE, casi = JUEGO.modo === 'casi';
  if (!M.activa) return { baja: JUEGO.conejo.hunde, giro: 0 };
  return { baja: hundido(M.t, casi ? 0.55 : 1), giro: Math.sin(M.t * 17) * 0.13 * Math.max(0, 1 - M.t / 1.2) };
}

// en el agua, debajo de todo: la sombra oscura donde se hunde
function pintaMuerteAgua() {
  const M = MUERTE; if (!M.activa) return;
  const y = pantY(M.wy), k = Math.min(1, M.t / 0.8);
  G.globalAlpha = 0.35 * k * Math.max(0.3, 1 - M.t / 6);
  elipse(M.x, y + 2, 14, 6, M.barro ? '#4a2a14' : '#2a6a78', null);
  G.globalAlpha = 1;
}
// encima: la corona y las burbujas
function pintaMuerteAire(t) {
  const M = MUERTE; if (!M.activa) return;
  const y0 = pantY(M.wy);
  for (const b of M.burbujas) {
    const k = Math.min(1, b.t / b.sube), y = y0 + 3 - k * 4;
    if (b.pop) { G.globalAlpha = Math.max(0, 1 - (b.t - b.sube) / 0.2); elipse(b.x, y, b.r * 1.6, b.r * 0.8, null, '#ffffff', 0.6); G.globalAlpha = 1; continue; }
    elipse(b.x, y, b.r, b.r, 'rgba(220,250,255,0.35)', '#ffffff', 0.6); elipse(b.x - b.r * 0.35, y - b.r * 0.35, b.r * 0.3, b.r * 0.3, '#ffffff', null);
  }
  const C = M.corona;
  if (C) {
    const y = y0 - C.z + (C.flota ? Math.sin(C.fase * 3) * 0.8 : 0);
    if (C.flota) elipse(C.x, y0 + 2.5, 7, 2.2, 'rgba(40,110,120,0.3)', null);
    aqui(C.x, y - 1, C.giro, 0.9, 0.9, () => iconoCorona(0, 0));
  }
}
// las manchas de barro en la pantalla: salen de golpe, resbalan despacio y se van
function pintaManchas() {
  const M = MUERTE; if (!M.activa || !M.manchas.length) return;
  for (const m of M.manchas) {
    if (m.t < 0) continue;
    const s = Math.min(1, m.t / 0.08), baja = m.t * 7, alfa = Math.max(0, Math.min(0.9, 2.4 - m.t));
    if (alfa <= 0) continue;
    G.globalAlpha = alfa;
    const p = [];
    m.forma.forEach((f, i) => { const a = i / m.forma.length * Math.PI * 2; p.push(m.x + Math.cos(a) * m.r * f * s, m.y + baja + Math.sin(a) * m.r * f * s * 0.85); });
    blanda(p, COL_RIO.barro, COL_RIO.barroO, 0.8);
    elipse(m.x + m.r * 0.3, m.y + baja + m.r * 0.9 + baja * 0.6, m.r * 0.2, m.r * 0.3 + baja * 0.3, COL_RIO.barro, null);   // la gota que chorrea
    elipse(m.x - m.r * 0.3, m.y + baja - m.r * 0.35, m.r * 0.25, m.r * 0.13, 'rgba(255,255,255,0.35)', null);
    G.globalAlpha = 1;
  }
}
