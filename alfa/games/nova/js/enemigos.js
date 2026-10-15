// Fans of Nova · Enemigos del prototipo: una facción (No-Muertos), tres tipos y un jefe, con su IA y sus oleadas.
// Cifras PROVISIONALES: se iteran con la partida (PLAN-NOVA.md, «Enemigos»).
'use strict';
const NV_ENEM = {
  rastrero:  { nombre: 'Rastrero',  hp: 40,  vel: 100, r: 12, contacto: 10,  chat: 4,  tragable: 1, color: '#9be26b' },
  fusilero:  { nombre: 'Fusilero',  hp: 90,  vel: 74, r: 15, contacto: 7,  chat: 8,  tragable: 3, color: '#d8e6c8', tira: { cada: 1.7, dano: 9, alcance: 330, v: 250 } },
  sepulturero: { nombre: 'Sepulturero', hp: 320, vel: 50, r: 24, contacto: 22, chat: 18, tragable: 5, color: '#8a6bd1', esc: 150 },
  jefe:      { nombre: 'Rey de los huesos', hp: 9000, vel: 56, r: 58, contacto: 30, chat: 120, color: '#c8b6ff', esc: 700, resiste: 'cinetica', jefe: 1 }
};
// Oleadas: a partir de `desde` segundos aparece ese tipo cada `cada` segundos (por tandas de `lote`).
const NV_OLEADAS = [
  { tipo: 'rastrero', desde: 0, cada: 0.9, lote: 1 },
  { tipo: 'rastrero', desde: 30, cada: 2.2, lote: 3 },
  { tipo: 'fusilero', desde: 30, cada: 3.5, lote: 1 },
  { tipo: 'sepulturero', desde: 80, cada: 9, lote: 1 },
  { tipo: 'fusilero', desde: 110, cada: 3, lote: 2 }
];
const NV_TIEMPO_JEFE = 210;   // el jefe llega a los 210 s

function nvEnemigo(S, tipo, x, y) {
  const d = NV_ENEM[tipo], e = { tipo, d, x, y, vx: 0, vy: 0, r: d.r, hp: d.hp, hpMax: d.hp, esc: d.esc || 0, escMax: d.esc || 0, resiste: d.resiste || null, est: {}, calor: 0, dot: null, cd: 1 + Math.random(), flash: 0, golpe: 0, fase: Math.random() * 6.28, muerto: false };
  S.enem.push(e);
  return e;
}
function nvSpawn(S, dt) {
  if (S.jefe) return;
  const n = S.nave;
  for (const o of NV_OLEADAS) {
    if (S.t < o.desde) continue;
    o.tiempo = (S.o_t[o.tipo + o.desde] = (S.o_t[o.tipo + o.desde] || 0) + dt);
    if (o.tiempo < o.cada) continue;
    S.o_t[o.tipo + o.desde] = 0;
    for (let i = 0; i < o.lote; i++) { const a = Math.random() * 6.283, R = 560 + Math.random() * 120; nvEnemigo(S, o.tipo, n.x + Math.cos(a) * R, n.y + Math.sin(a) * R); }
  }
  if (S.t >= NV_TIEMPO_JEFE) {
    S.jefe = nvEnemigo(S, 'jefe', n.x + 520, n.y - 400);
    S.jefe.cd = 3; S.jefe.cdInv = 7;
    S.aviso = { t: 3, txt: tr('¡Llega el Rey de los huesos!') };
  }
}

// ---------- IA ----------
function nvEnemigos(S, dt) {
  const n = S.nave;
  for (let i = S.enem.length - 1; i >= 0; i--) {
    const e = S.enem[i];
    if (e.muerto) { S.enem.splice(i, 1); continue; }
    for (const k in e.est) if ((e.est[k] -= dt) <= 0) delete e.est[k];
    if (e.flash > 0) e.flash -= dt;
    if (e.dot) { e.hp -= e.dot.dps * dt; S.stats.dano += e.dot.dps * dt; if ((e.dot.t -= dt) <= 0) e.dot = null; if (e.hp <= 0) { nvMuere(S, e); continue; } }
    if (e.d.esc && e.esc < e.escMax && !(e.est.escudoCaido > 0)) e.esc = Math.min(e.escMax, e.esc + dt * 6);
    const dx = n.x - e.x, dy = n.y - e.y, dist = Math.hypot(dx, dy) || 1, ux = dx / dist, uy = dy / dist;
    const apagado = e.est.apagado > 0, lento = apagado ? 0.3 : 1;
    let vx = 0, vy = 0;
    if (e.d.tira) {   // el fusilero orbita a su alcance y dispara
      const ideal = e.d.tira.alcance * 0.7, radial = dist > ideal ? 1 : -0.6;
      vx = ux * radial + -uy * 0.8; vy = uy * radial + ux * 0.8;
      e.cd -= dt * (apagado ? 0 : 1);
      if (e.cd <= 0 && dist < e.d.tira.alcance) { e.cd = e.d.tira.cada; S.eproy.push({ x: e.x, y: e.y, vx: ux * e.d.tira.v, vy: uy * e.d.tira.v, dano: e.d.tira.dano, vida: 2.5, r: 5 }); }
    } else if (e.d.jefe) { nvJefe(S, e, dt, ux, uy, dist, apagado); vx = ux * (dist > 260 ? 1 : 0.2) - uy * 0.5; vy = uy * (dist > 260 ? 1 : 0.2) + ux * 0.5; }
    else { vx = ux; vy = uy; }
    const l = Math.hypot(vx, vy) || 1, v = e.d.vel * lento * (e.d.jefe && e.hp < e.hpMax / 2 ? 1.4 : 1);
    e.x += vx / l * v * dt; e.y += vy / l * v * dt;
    // se apartan entre sí un poco
    for (let j = i - 1; j >= Math.max(0, i - 12); j--) { const o = S.enem[j]; if (o.muerto) continue; const ax = e.x - o.x, ay = e.y - o.y, m = e.r + o.r, q = Math.hypot(ax, ay); if (q < m && q > 0.1) { const p = (m - q) * 0.4; e.x += ax / q * p; e.y += ay / q * p; o.x -= ax / q * p * 0.5; o.y -= ay / q * p * 0.5; } }
    // contacto con la nave: se traga (rango suficiente) o hace daño
    if (dist < e.r + n.r) {
      if (e.d.tragable && n.rango >= e.d.tragable && !e.d.jefe) { nvTraga(S, e); continue; }
      e.golpe -= dt;
      if (e.golpe <= 0 && !apagado) { e.golpe = 0.7; nvDanoNave(S, e.d.contacto); }
    }
  }
}
function nvJefe(S, e, dt, ux, uy, dist, apagado) {
  if (apagado) return;
  const f2 = e.hp < e.hpMax / 2;
  e.cd -= dt; e.cdInv -= dt;
  if (e.cd <= 0) {   // salva radial
    e.cd = f2 ? 2.4 : 3.4;
    const k = f2 ? 18 : 12, a0 = Math.random() * 6.28;
    for (let i = 0; i < k; i++) { const a = a0 + i * 6.283 / k; S.eproy.push({ x: e.x, y: e.y, vx: Math.cos(a) * 210, vy: Math.sin(a) * 210, dano: 9, vida: 3.2, r: 6 }); }
  }
  if (e.cdInv <= 0) { e.cdInv = f2 ? 5 : 8; for (let i = 0; i < 4; i++) nvEnemigo(S, 'rastrero', e.x + (Math.random() - 0.5) * 80, e.y + (Math.random() - 0.5) * 80); }
}
function nvTraga(S, e) {
  const n = S.nave;
  e.muerto = true; n.hp = Math.min(n.hpMax, n.hp + n.hpMax * 0.06 * Math.max(1, e.d.tragable * 0.6));
  nvChatarra(S, e.x, e.y, Math.round(e.d.chat * 1.5));
  S.fx.push({ t: 0.35, x: e.x, y: e.y, r: e.r * 1.3, color: '#9bffb0', tipo: 'onda' });
  S.nums.push({ x: e.x, y: e.y - 18, t: 0.9, txt: tr('¡Tragado!'), color: '#9bffb0', g: 1 }); S.stats.tragados++;
}
function nvMuere(S, e) {
  e.muerto = true; S.stats.muertos++;
  nvChatarra(S, e.x, e.y, e.d.chat);
  S.fx.push({ t: 0.4, x: e.x, y: e.y, r: e.r * 1.6, color: e.d.color, tipo: 'onda' });
  for (let i = 0; i < 6; i++) S.parts.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.5) * 220, t: 0.5, color: e.d.color });
  if (e.d.jefe) S.estado = 'victoria';
}
// La chatarra queda flotando hasta que la nave se acerca (imán).
function nvChatarra(S, x, y, valor) {
  const k = Math.max(1, Math.min(6, Math.round(valor / 4)));
  for (let i = 0; i < k; i++) S.restos.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 30, v: valor / k, t: 0, ang: Math.random() * 6.28 });
}
function nvDanoNave(S, d) {
  const n = S.nave, rd = d * (1 - (S.mejoras.blindaje || 0));
  let r = rd;
  if (n.esc && n.esc.hp > 0) { const a = Math.min(n.esc.hp, r); n.esc.hp -= a; r -= a; n.esc.sin = 3; }
  n.hp -= r; n.golpeado = 0.15; S.stats.recibido += rd;
  if (n.hp <= 0 && S.estado === 'juego') S.estado = 'derrota';
}
