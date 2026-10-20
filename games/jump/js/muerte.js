// Fans of Jump · Cuando CrazyBunny cae al agua (o lo pilla la ola): una escena corta y divertida, para todos los públicos.
// Nadie se hunde: un instante a cámara lenta, un salpicón de verdad (corona de gotas del color del agua, columna, espuma y
// ondas), «¡Plaf!», y CrazyBunny asoma enseguida dentro de un flotador rosa, meciéndose tan contento. Se le escurre la capa,
// que queda flotando a su lado, y su corona (la de verdad, en 3D) sale disparada y le cae encima a la capa: ¡CLONK!
// Los amigos que llevaba a cuestas salen despedidos y flotan cada uno en su flotador pequeño, con corazones.
// Si lo pilla la ola, todo es de barro y caen manchas de barro en la pantalla que resbalan. También en la segunda oportunidad.
'use strict';

const MUERTE = { activa: false, t: 0, x: 0, wy: 0, barro: false, corona: null, burbujas: [], manchas: [], amigos: [], aplasta: 0, plaf: false, lado: 1 };
const LENTO_SEG = 0.4;    // lo que dura la cámara lenta del principio
const CAPA_DX = 16;       // la capa queda flotando a este lado del conejo
const FLOTADOR_T = 0.45;  // cuándo sale el flotador
// cuánto está metido en el agua (0 = fuera): se zambulle un momento y asoma con el flotador, con el agua por la cintura
const HUNDE = [[0, 0], [0.12, 0.45], [0.34, 0.52], [0.55, 0.16], [0.7, 0.24], [0.9, 0.2], [99, 0.2]];
function hundido(t) {
  let i = 0; while (i < HUNDE.length - 2 && HUNDE[i + 1][0] < t) i++;
  const [a, va] = HUNDE[i], [b, vb] = HUNDE[i + 1], k = Math.max(0, Math.min(1, (t - a) / (b - a))), e = k * k * (3 - 2 * k);
  return va + (vb - va) * e;
}

function empiezaMuerte(motivo) {
  const c = JUEGO.conejo, M = MUERTE;
  if (M.activa) return;
  const barro = motivo === 'ola', lado = c.x > PAN.W / 2 ? -1 : 1;
  Object.assign(M, { activa: true, t: 0, x: c.x, wy: c.wy, barro, lado, burbujas: [], manchas: [], aplasta: 0, plaf: false });
  // los amigos de la espalda salen despedidos, cada uno hacia un lado
  M.amigos = JUEGO.cuestas.slice(-3).map((id, i, a) => ({ id, x: c.x, wy: c.wy, z: 26 + i * 8, vx: (i - (a.length - 1) / 2) * 30 + azar(-6, 6) || azar(-20, 20), vwy: azar(-8, 14), vz: azar(45, 65), giro: 0, vgiro: azar(-8, 8), flota: false, fase: Math.random() * 6 }));
  // las gotas, del color del agua donde cae (más turbia cerca de la ola)
  const agua = barro ? '#9a6a40' : colorAgua(c.wy), brillo = barro ? '#d8a878' : colorAgua(c.wy, 0.85, 1);
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2 + Math.random() * 0.2, s = azar(16, 42);
    FX.push({ t: 'gotaG', x: c.x, wy: c.wy, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.55, z: azar(2, 6), vz: azar(55, 105), r: azar(0.9, 1.9), color: agua, luz: brillo, v: 2 });
  }
  FX.push({ t: 'columna', x: c.x, wy: c.wy, color: agua, v: 0.7, v0: 0.7 });
  FX.push({ t: 'espuma', x: c.x, wy: c.wy, color: barro ? 'rgba(160,110,70,0.9)' : colorAgua(c.wy, 0.8, 0.95), v: 1.1, v0: 1.1 });
  onda(c.x, c.wy, 10, barro ? 'rgba(255,230,200,0.7)' : 'rgba(255,255,255,0.85)');
  for (let i = 0; i < 6; i++) M.burbujas.push({ x: c.x + azar(-7, 7), r: azar(1, 2.2), t: -i * 0.05, sube: azar(0.25, 0.45) });
  // la corona sale disparada de la cabeza y cae, justo, encima de la capa
  M.corona = { x: c.x, wy: c.wy, z: 26, vx: lado * CAPA_DX / 1.58, vz: 118, giro: 0, vgiro: azar(-9, 9), flota: false, fase: 0 };
  if (barro) for (let i = 0; i < 7; i++) M.manchas.push({ x: azar(10, PAN.W - 10), y: azar(30, PAN.H * 0.6), r: azar(6, 14), t: -i * 0.06, forma: Array.from({ length: 9 }, () => azar(0.75, 1.15)) });
  JUEGO.lento = LENTO_SEG;
}
function acabaMuerte() { Object.assign(MUERTE, { activa: false, corona: null, burbujas: [], manchas: [], amigos: [] }); }

function avanzaMuerte(dt) {
  const M = MUERTE; if (!M.activa) return;
  M.t += dt;
  for (const k of [0.25, 0.5]) if (M.t - dt < k && M.t >= k) onda(M.x, M.wy, 12, M.barro ? 'rgba(255,230,200,0.6)' : 'rgba(255,255,255,0.75)');
  // asoma con el flotador
  if (!M.plaf && M.t >= FLOTADOR_T) { M.plaf = true; aviso(tr('¡Plaf!'), M.x, M.wy + 18, '#ffffff', 11); onda(M.x, M.wy, 9); SONIDO.boing(); }
  const C = M.corona;
  if (C && !C.flota) {
    C.x += C.vx * dt; C.z += C.vz * dt; C.vz -= 170 * dt; C.giro += C.vgiro * dt;
    if (C.z <= 0) {
      C.z = 0; C.flota = true; C.giro = 0.2;
      M.aplasta = 1; aviso(tr('¡CLONK!'), C.x, M.wy + 8, '#ffd86a', 12); estrellas(C.x, M.wy, 5); SONIDO.clonk(); vibra(40);
    }
  } else if (C) C.fase += dt;
  for (const b of M.burbujas) b.t += dt;
  M.burbujas = M.burbujas.filter(b => b.t < b.sube + 0.2);
  for (const m of M.manchas) m.t += dt;
  M.aplasta = Math.max(0, M.aplasta - dt * 2.2);
  for (const a of M.amigos) {
    if (!a.flota) {
      a.x += a.vx * dt; a.wy += a.vwy * dt; a.z += a.vz * dt; a.vz -= 160 * dt; a.giro += a.vgiro * dt;
      if (a.z <= 0) {
        a.z = 0; a.flota = true; a.tronco = RIO.troncos.find(t => dentroTronco(t, a.x, a.wy) <= 1);
        if (a.tronco) { a.giro = 0; continue; }
        onda(a.x, a.wy, 6, M.barro ? 'rgba(255,230,200,0.6)' : 'rgba(255,255,255,0.8)'); salpica(a.x, a.wy, 7, M.barro ? '#9a6a40' : colorAgua(a.wy, 0.5)); corazones(a.x, a.wy + 6, 2); SONIDO.cae();
      }
    } else if (!a.tronco) { a.fase += dt; a.giro += (Math.sin(a.fase * 2.4) * 0.18 - a.giro) * Math.min(1, dt * 4); }
  }
}
// el conejo en el agua: cuánto bajarlo y cómo se mece
function hundeConejo() {
  const M = MUERTE;
  if (!M.activa) return { baja: JUEGO.conejo.hunde, giro: 0 };
  return { baja: hundido(M.t) + Math.sin(M.t * 3) * 0.02, giro: Math.sin(M.t * (M.t < 0.6 ? 17 : 2.4)) * (M.t < 0.6 ? 0.13 : 0.09) };
}
// el flotador de plástico (dibujo 3D, en dos mitades: la de atrás va detrás del que flota y la de delante lo tapa);
// r: el radio por fuera, en medidas del mundo
function flotador(x, y, r, delante, k = 1) {
  if (!delante) elipse(x + 1, y + 2, r * 1.05 * k, r * 0.4 * k, 'rgba(30,70,80,0.22)', null);   // su sombra en el agua
  sprite(delante ? 'flotador_delante' : 'flotador_atras', x, y, r / 1.02 * k);
}
// la parte de atrás del flotador (antes del conejo) y la de delante (después)
function flotadorConejo(delante) {
  const M = MUERTE; if (!M.activa || M.t < FLOTADOR_T) return;
  const k = Math.min(1, (M.t - FLOTADOR_T) / 0.15), s = k < 1 ? 0.6 + k * 0.5 : 1 + Math.sin((M.t - FLOTADOR_T) * 3) * 0.02;
  flotador(JUEGO.conejo.x, pantY(M.wy) + 1 + Math.sin(M.t * 3) * 0.6, 15, delante, s);
}

// en el agua, debajo de todo: un brillo claro donde ha caído
function pintaMuerteAgua() {
  const M = MUERTE; if (!M.activa) return;
  G.globalAlpha = 0.25 * Math.max(0, 1 - M.t / 2);
  elipse(M.x, pantY(M.wy) + 2, 18, 7, M.barro ? '#c99060' : '#ffffff', null);
  G.globalAlpha = 1;
}
// encima: unas burbujitas al zambullirse, la capa flotando, los amigos en sus flotadores y la corona
function pintaMuerteAire(t) {
  const M = MUERTE; if (!M.activa) return;
  const y0 = pantY(M.wy);
  for (const b of M.burbujas) {
    if (b.t < 0) continue;
    const k = Math.min(1, b.t / b.sube), y = y0 + 3 - k * 4;
    if (b.t > b.sube) { G.globalAlpha = Math.max(0, 1 - (b.t - b.sube) / 0.2); elipse(b.x, y, b.r * 1.6, b.r * 0.8, null, '#ffffff', 0.6); G.globalAlpha = 1; continue; }
    elipse(b.x, y, b.r, b.r, 'rgba(220,250,255,0.35)', '#ffffff', 0.6); elipse(b.x - b.r * 0.35, y - b.r * 0.35, b.r * 0.3, b.r * 0.3, '#ffffff', null);
  }
  // la capa, que se le escurre y queda flotando a su lado
  const tc = M.t - 0.5, cx = M.x + M.lado * CAPA_DX;
  if (tc > 0) {
    const e = Math.min(1, tc / 0.5), s = 0.7 + 0.3 * e * e * (3 - 2 * e), f = Math.floor(M.t * 1.6) % 2, y = y0 + 3 + Math.sin(M.t * 1.8) * 0.8;
    const antes = G.globalAlpha; G.globalAlpha = antes * e;
    elipse(cx, y + 1, 13 * s, 4 * s, 'rgba(30,70,80,0.2)', null);
    const ang = Math.sin(M.t * 0.9) * 0.08, sq = 1 - M.aplasta * 0.3 * Math.cos(M.aplasta * 14);   // el golpe de la corona la aplasta y rebota
    spriteTeñido('capaflota' + f, GUARDA.capa || '#ff7a1a', cx, y, 9 * s, ang, 1 + (1 - sq) * 0.5, sq);
    sprite('capaflota' + f + 'oro', cx, y, 9 * s, ang, 1 + (1 - sq) * 0.5, sq);
    G.globalAlpha = antes;
  }
  for (const a of M.amigos) {
    const ya = pantY(a.wy), f = Math.floor(t * 3 + a.fase) % 2;
    if (a.tronco) { sprite(a.id + '_susto' + f, a.tronco.x + (a.x - a.tronco.x) * 0.5, pantY(a.tronco.wy) + 1, 9); continue; }   // sentado en un tronco
    if (!a.flota) { sprite(a.id + '_susto' + f, a.x, ya - a.z, 9, a.giro); continue; }
    const bob = Math.sin(a.fase * 3) * 0.7;
    flotador(a.x, ya + 1 + bob, 7.5, false);
    sprite(a.id + '_susto' + f, a.x, ya + 2 + bob, 9, a.giro);
    flotador(a.x, ya + 1 + bob, 7.5, true);
  }
  const C = M.corona;
  if (C) {
    const y = C.flota ? y0 + 3 + Math.sin(M.t * 1.8) * 0.8 - 1 + M.aplasta * 2 : y0 - C.z;
    sprite('corona_suelta', C.flota ? cx : C.x, y, TAM_CONEJO, C.giro);
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
