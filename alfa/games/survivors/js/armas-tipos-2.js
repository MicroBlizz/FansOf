// Fans of Survivors · Los tipos de las armas INICIALES de los líderes de las 8 facciones, cada una con su propia manera de pelear:
//   tajo (espadazos cuerpo a cuerpo en abanico), eclosion (manos que salen del suelo), haz (un foco que gira), torreta, ruleta (efecto al azar),
//   combo (golpes rápidos y cada 4.º, triple) y boomerang (hacha que va y vuelve). La claqueta de Cultura Pop es una «onda» que atrae.
// Se enganchan a armas-tipos.js (TIPOS, CONT_EXTRA, MOVER_EXTRA…). Las cifras están en datos-facciones.js.
'use strict';

// hacia dónde mira el jugador: hacia donde se mueve (si está quieto, hacia donde miraba)
function anguloMira() {
  const j = P.jug;
  if (Math.hypot(MANDO.x, MANDO.y) > 0.1) j.ang = Math.atan2(MANDO.y, MANDO.x);
  else if (j.ang == null) j.ang = j.face > 0 ? 0 : Math.PI;
  return j.ang;
}
const difAng = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return Math.abs(d); };

Object.assign(SONIDO_TIPO, { tajo: 'clank', eclosion: 'summon', torreta: 'deploy', ruleta: 'card', combo: 'hit', boomerang: 'carrot' });
CONTINUAS.add('haz');

Object.assign(TIPOS, {
  // Campeón: espadazos en abanico hacia donde mira; con los niveles llegan más lejos y cubren hasta 270 grados
  tajo(v, A) {
    const j = P.jug, ang = anguloMira(), mitad = (v.arco * Math.PI / 180) / 2; let n = 0;
    cerca(j.x, j.y - 10, v.r, e => { if (difAng(Math.atan2(e.y - j.y, e.x - j.x), ang) <= mitad) { n++; const [nx, ny] = empujeA(e, j.x, j.y); herir(e, v.dano, nx, ny, 200); estadoArma(e, v); } });
    for (let i = 0; i <= 4; i++) { const a = ang - mitad + (i / 4) * mitad * 2; golpeCajas(j.x + Math.cos(a) * v.r * 0.7, j.y - 10 + Math.sin(a) * v.r * 0.7, 24, v.dano); }
    P.efectos.push({ gen: 'tajo', x: j.x, y: j.y - 10, ang, mitad, r: v.r, col: A.col, t: 0.28, max: 0.28 });
    return n > 0 || P.enemigos.length ? true : false;
  },
  // NecroLord: manos que salen del suelo bajo los enemigos tras un aviso
  eclosion(v, A) {
    const j = P.jug, cand = P.enemigos.filter(e => !e.muerto && Math.hypot(e.x - j.x, e.y - j.y) < v.alc);
    if (!cand.length) return false;
    for (let i = 0; i < v.n; i++) { const e = pick(cand); P.trampas.push({ x: e.x + rand(-10, 10), y: e.y + rand(-10, 10), r: v.r, t: v.demora, max: v.demora, dano: v.dano, col: A.col, emo: A.emo, v }); }
    return true;
  },
  // Cyberscout: deja torretas que disparan solas un rato
  torreta(v, A) {
    if (!P.enemigos.length) return false;
    const j = P.jug;
    for (let i = 0; i < v.n; i++) { const a = (i / v.n) * Math.PI * 2 + Math.random(); P.torretas.push({ x: j.x + Math.cos(a) * 34, y: j.y + Math.sin(a) * 20, t: v.dura, max: v.dura, tt: 0.2, v, A }); }
    return true;
  },
  // MemeLord: cada carta juega un efecto al azar: curar, aturdir, bola de fuego o perros
  ruleta(v, A) {
    if (!P.enemigos.length) return false;
    for (let i = 0; i < v.n; i++) {
      const q = Math.floor(Math.random() * 4), base = k => Object.assign({}, BASE_TIPO[k]);
      if (q === 0) { curar(5 + v.dano * 0.45); P.efectos.push({ gen: 'anillo', x: P.jug.x, y: P.jug.y, r: 50, emo: '💚', col: '#5fe05a', t: 0.5, max: 0.5 }); }
      else if (q === 1) TIPOS.onda(Object.assign(base('onda'), { dano: v.dano * 0.6, r: 105, aturde: 1.3 }), { emo: '😵', col: '#ffe14d' });
      else if (q === 2) TIPOS.bomba(Object.assign(base('bomba'), { dano: v.dano * 2.2, r: 75 }), { emo: '🔥', col: '#ff7a1a' });
      else TIPOS.corre(Object.assign(base('corre'), { dano: v.dano * 1.3, n: 2, r: 48, vel: 340, spr: 'suchdog' }), { carta: 'suchdog', col: '#ffcb3d' });
    }
    P.efectos.push({ gen: 'golpe', x: P.jug.x, y: P.jug.y - 70, emo: '🃏', col: A.col, t: 0.45, max: 0.45 });
    return true;
  },
  // ProGamer: golpes rapidísimos al más cercano; cada 4.º es un ¡COMBO! de daño triple en área
  combo(v, A) {
    const j = P.jug, e = masCercano(j.x, j.y - 10, v.r); if (!e) return false;
    P.combo = (P.combo || 0) + 1; const grande = P.combo % v.cadaN === 0, [nx, ny] = empujeA(e, j.x, j.y);
    if (grande) {
      cerca(e.x, e.y, 70, o => { const [mx, my] = empujeA(o, e.x, e.y); herir(o, v.dano * v.mult, mx, my, 260, true); });
      P.efectos.push({ gen: 'anillo', x: e.x, y: e.y, r: 80, emo: '💥', col: A.col, t: 0.4, max: 0.4 }); numero(e.x, e.y - 55, '¡COMBO!', '#ff4b5c', true); P.sacudida = Math.max(P.sacudida, 4);
    } else { herir(e, v.dano, nx, ny, 90); P.efectos.push({ gen: 'golpe', x: e.x, y: e.y - 10, emo: A.emo, col: A.col, t: 0.22, max: 0.22 }); }
    golpeCajas(e.x, e.y, 24, v.dano);
    return true;
  },
  // VikingoPerdido: hachas que salen hacia el enemigo más cercano (o hacia donde mira) y vuelven
  boomerang(v, A) {
    const j = P.jug, ya = new Set();
    for (let i = 0; i < v.n; i++) {
      const e = masCercano(j.x, j.y - 20, 420, ya); if (e) ya.add(e);
      const a = (e ? Math.atan2(e.y - (j.y - 20), e.x - j.x) : anguloMira()) + (i - (v.n - 1) / 2) * 0.35;
      P.proy.push({ gen: 'boomer', x: j.x, y: j.y - 24, a, fase: 0, alc: v.alc, vel: v.vel, dano: v.dano, t: 6, emo: A.emo, tam: v.tam, giro: 0, golpes: new Map() });
    }
    return true;
  },
});
registraTipos();

/* ---------- lo que se mueve ---------- */
MOVER_EXTRA.boomer = (p, dt) => {
  const j = P.jug; p.giro += dt * 16; let d0;
  if (p.fase === 0) { p.x += Math.cos(p.a) * p.vel * dt; p.y += Math.sin(p.a) * p.vel * dt; if (Math.hypot(p.x - j.x, p.y - (j.y - 24)) >= p.alc) p.fase = 1; }
  else {
    const dx = j.x - p.x, dy = j.y - 24 - p.y; d0 = Math.hypot(dx, dy) || 1;
    p.x += (dx / d0) * p.vel * 1.15 * dt; p.y += (dy / d0) * p.vel * 1.15 * dt;
    if (d0 < 16) { p.t = 0; return; }
  }
  p.t = Math.max(p.t, 0.1);
  cerca(p.x, p.y + 14, 16, e => { if (P.t - (p.golpes.get(e) || -9) < 0.5) return; p.golpes.set(e, P.t); herir(e, p.dano, Math.cos(p.a), Math.sin(p.a), 120); });
  golpeCajas(p.x, p.y + 14, 14, p.dano * 0.5);
};
// los que se hacen cada fotograma: manos del suelo y torretas
TICK_EXTRA.push(dt => {
  for (const m of P.trampas) {
    m.t -= dt; if (m.t > 0) continue;
    cerca(m.x, m.y, m.r, e => { const [nx, ny] = empujeA(e, m.x, m.y); herir(e, m.dano, nx, ny, 160); estadoArma(e, m.v); });
    golpeCajas(m.x, m.y, m.r, m.dano); particulas(m.x, m.y, 10, '#8a5cff', 160, 4);
    P.efectos.push({ gen: 'anillo', x: m.x, y: m.y, r: m.r, emo: m.emo, col: m.col, t: 0.4, max: 0.4 });
  }
  P.trampas = P.trampas.filter(m => m.t > 0);
  for (const q of P.torretas) {
    q.t -= dt; q.tt -= dt; if (q.tt > 0) continue;
    const e = masCercano(q.x, q.y, q.v.alc); if (!e) continue;
    q.tt = q.v.cadencia; const a = Math.atan2(e.y - 14 - (q.y - 20), e.x - q.x);
    P.proy.push(proyectilGen('bala', q.A, { dano: q.v.dano, tam: 12, lento: 0, aturde: 0, rebota: 0 }, q.x, q.y - 20, Math.cos(a) * q.v.vel, Math.sin(a) * q.v.vel, 0.9, 1)); play('gun');
  }
  P.torretas = P.torretas.filter(q => q.t > 0);
});
// el foco del directo: rayos que giran alrededor del jugador y golpean a todo lo que cruzan
CONT_EXTRA.haz = (k, A, v) => {
  const j = P.jug, T = P.t;
  for (let i = 0; i < v.n; i++) {
    const a = T * v.giro + (i / v.n) * Math.PI * 2;
    for (let d = 30; d <= v.r; d += 28) {
      const x = j.x + Math.cos(a) * d, y = j.y - 10 + Math.sin(a) * d;
      cerca(x, y, 16, e => { if (T - (e['h_' + k] || -9) < v.tick) return; e['h_' + k] = T; herir(e, v.dano, Math.cos(a), Math.sin(a), 100); estadoArma(e, v); });
      golpeCajas(x, y, 16, v.dano * 0.3);
    }
  }
};

/* ---------- dibujo ---------- */
DIBUJA_PROY.boomer = p => emoji(ctx, p.emo, p.x, p.y, p.tam, p.giro);
DIBUJA_EFECTO.tajo = (f, c, k) => {
  c.save(); c.translate(f.x, f.y); c.globalAlpha = 1 - k;
  const r = f.r * (0.55 + k * 0.45), a0 = f.ang - f.mitad, a1 = f.ang + f.mitad;
  c.fillStyle = f.col; c.globalAlpha = (1 - k) * 0.28; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r, a0, a1); c.closePath(); c.fill();
  c.globalAlpha = 1 - k; c.strokeStyle = '#fff'; c.lineWidth = 5 * (1 - k) + 1; c.beginPath(); c.arc(0, 0, r, a0, a1); c.stroke();
  const n = Math.max(1, Math.round(f.mitad * 2 / (Math.PI / 3)));   // una estocada por cada 60 grados
  c.strokeStyle = f.col; c.lineWidth = 3;
  for (let i = 0; i < n; i++) { const a = n === 1 ? f.ang : a0 + (i / (n - 1)) * (a1 - a0); c.beginPath(); c.moveTo(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); c.stroke(); }
  c.restore(); c.globalAlpha = 1;
};
SUELO_EXTRA.push(c => {
  for (const m of P.trampas) {   // el aviso: un círculo que se va llenando
    const k = 1 - m.t / m.max;
    c.globalAlpha = 0.25 + k * 0.3; c.fillStyle = m.col; c.beginPath(); c.ellipse(m.x, m.y, m.r * k, m.r * k * 0.75, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.7; c.strokeStyle = m.col; c.lineWidth = 2; c.beginPath(); c.ellipse(m.x, m.y, m.r, m.r * 0.75, 0, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
  }
  const j = P.jug;
  for (const k in P.armas) {
    const A = ARMAS[k]; if (A.tipo !== 'haz') continue;
    const v = vArma(k);
    for (let i = 0; i < v.n; i++) {
      const a = P.t * v.giro + (i / v.n) * Math.PI * 2, x = j.x + Math.cos(a) * v.r, y = j.y - 10 + Math.sin(a) * v.r;
      c.lineCap = 'round'; c.strokeStyle = A.col; c.globalAlpha = 0.28; c.lineWidth = 16; c.beginPath(); c.moveTo(j.x, j.y - 10); c.lineTo(x, y); c.stroke();
      c.globalAlpha = 0.9; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(j.x, j.y - 10); c.lineTo(x, y); c.stroke(); c.globalAlpha = 1;
      if (A.emo) emoji(c, A.emo, x, y, 22, a);
    }
  }
});
PIE_EXTRA.push(L => {
  for (const q of P.torretas) L.push({ y: q.y, f: () => { ctx.globalAlpha = Math.min(1, q.t / 0.5); emoji(ctx, q.A.emo, q.x, q.y - 12, 26); ctx.globalAlpha = 1; } });
});
