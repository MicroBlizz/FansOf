// Fans of Nova · Enemigos del prototipo: una facción (No-Muertos), tres tipos y un jefe, con su IA y sus oleadas.
// Cifras PROVISIONALES: se iteran con la partida (PLAN-NOVA.md, «Enemigos»).
'use strict';
const NV_ENEM = {
  rastrero:  { nombre: 'Rastrero',  hp: 40,  vel: 100, r: 17, contacto: 5,  chat: 6,  tragable: 1, color: '#9be26b' },
  fusilero:  { nombre: 'Fusilero',  hp: 90,  vel: 74, r: 21, contacto: 7,  chat: 8,  tragable: 3, color: '#d8e6c8' },
  sepulturero: { nombre: 'Sepulturero', hp: 320, vel: 50, r: 32, contacto: 16, chat: 22, tragable: 5, color: '#8a6bd1', esc: 150 },
  asteroide: { nombre: 'Asteroide', hp: 60, vel: 0, r: 30, contacto: 0, chat: 10, tragable: 1, color: '#8a8fa8', pasivo: 1 },
  nido:      { nombre: 'Nido', hp: 700, vel: 0, r: 62, contacto: 14, chat: 90, color: '#7ad06b', pasivo: 0, nido: 1 },
  capitan:   { nombre: 'Capitán', hp: 1100, vel: 78, r: 52, contacto: 22, chat: 140, color: '#b49cff', esc: 200, capitan: 1 },
  jefe:      { nombre: 'Rey de los huesos', hp: 7000, vel: 56, r: 80, contacto: 30, chat: 120, color: '#c8b6ff', esc: 700, resiste: 'cinetica', jefe: 1 }
};
// Oleadas: a partir de `desde` segundos aparece ese tipo cada `cada` segundos (por tandas de `lote`).
const NV_OLEADAS = [
  { tipo: 'rastrero', desde: 0, cada: 3.6, lote: 1 },
  { tipo: 'rastrero', desde: 60, cada: 4, lote: 3 },
  { tipo: 'fusilero', desde: 60, cada: 6, lote: 1 },
  { tipo: 'sepulturero', desde: 150, cada: 14, lote: 1 },
  { tipo: 'fusilero', desde: 200, cada: 6, lote: 2 }
];
const NV_TIEMPO_JEFE = 540;   // el Rey llega a los 11 min aunque no hayas matado a los capitanes (si matas a 3 antes, llega antes)

// Armas de las naves enemigas: cada tamaño cuesta puntos (S 1, M 2, L 4) y una nave de rango k tiene 1 + 0,7·(k-1) puntos.
// Se reparten entre sus anclajes predefinidos sin pasarse: muchas pequeñas, unas cuantas medianas, alguna grande o mezcla.
const NV_ARMA_E = { S: { c: 1, dano: 4, cada: 1.7, alc: 260, v: 240, r: 4 }, M: { c: 2, dano: 9, cada: 2.1, alc: 360, v: 250, r: 6 }, L: { c: 4, dano: 20, cada: 2.7, alc: 480, v: 260, r: 9 } };
const NV_ANCLAJES = {   // posiciones sobre la nave, en fracciones del radio
  rastrero: [[0, -0.9], [-0.75, -0.3], [0.75, -0.3], [-0.5, 0.6], [0.5, 0.6], [0, 0.2], [-0.95, 0.3], [0.95, 0.3], [0, 0.9], [-0.3, -0.6], [0.3, -0.6], [0, -0.3]],
  fusilero: [[0, -1.1], [-0.55, 0.1], [0.55, 0.1], [-0.9, 0.8], [0.9, 0.8], [0, 0.3], [-0.3, -0.4], [0.3, -0.4], [-0.7, 0.45], [0.7, 0.45], [0, 0.8], [0, -0.6]],
  sepulturero: [[0, -0.9], [-0.7, -0.6], [0.7, -0.6], [-0.95, 0], [0.95, 0], [-0.7, 0.6], [0.7, 0.6], [0, 0.9], [0, 0], [-0.4, -0.3], [0.4, -0.3], [-0.4, 0.4], [0.4, 0.4], [0, -0.5]]
};
function nvArmasEnemigo(tipo, rango) {
  const anc = NV_ANCLAJES[tipo];
  if (!anc) return null;
  let resto = Math.round(1 + 0.7 * (rango - 1));
  const modos = [[4, 0.6, 0], [2, 3, 0.4], [0.5, 2, 3], [3, 2, 1]], w = modos[Math.floor(Math.random() * modos.length)], lista = [];
  const libres = anc.slice().sort(() => Math.random() - 0.5);
  while (resto > 0 && lista.length < anc.length) {
    const op = ['S', 'M', 'L'].filter((t, i) => NV_ARMA_E[t].c <= resto && w[i] > 0), tot = op.reduce((a, t) => a + w[['S', 'M', 'L'].indexOf(t)], 0);
    let q = Math.random() * tot, t = op[0];
    for (const o of op) { q -= w[['S', 'M', 'L'].indexOf(o)]; if (q <= 0) { t = o; break; } }
    resto -= NV_ARMA_E[t].c;
    const a = libres[lista.length];
    lista.push({ tam: t, ax: a[0], ay: a[1], cd: 0.5 + Math.random() * 2 });
  }
  return lista;
}

// Naves de todos los tamaños: cada rango es ×1,07 de tamaño (igual que tú), ×1,2 de casco, ×1,12 de daño y ×1,3 de chatarra.
function nvEnemigo(S, tipo, x, y, rango) {
  rango = Math.max(1, Math.min(40, rango || 1));
  let d = NV_ENEM[tipo];
  if (rango > 1) {
    const q = Math.pow(1.12, rango - 1);
    d = Object.assign({}, d, { r: Math.round(d.r * nvFactor(rango)), hp: Math.round(d.hp * Math.pow(1.2, rango - 1)), contacto: Math.round(d.contacto * q), chat: d.chat * Math.pow(1.3, rango - 1) });
    if (d.esc) d.esc = Math.round(d.esc * Math.pow(1.2, rango - 1));
  }
  const e = { tipo, d, rango, x, y, vx: 0, vy: 0, r: d.r, hp: d.hp, hpMax: d.hp, esc: d.esc || 0, escMax: d.esc || 0, resiste: d.resiste || null, est: {}, calor: 0, dot: null, cd: 1 + Math.random(), flash: 0, golpe: 0, fase: Math.random() * 6.28, muerto: false };
  if (S.peligro > 1) { const kp = 1 + 0.25 * (S.peligro - 1); e.hp = e.hpMax = Math.round(e.hp * kp); }   // sectores peligrosos: enemigos más duros
  e.armas = nvArmasEnemigo(tipo, rango);
  e.kf = nvFactor(rango);   // el alcance y el tamaño de las balas crecen con la nave, igual que las tuyas
  if (e.armas) e.alcMax = Math.max(...e.armas.map(w => NV_ARMA_E[w.tam].alc)) * e.kf;
  S.enem.push(e);
  return e;
}
function nvSpawn(S, dt) {
  if (S.jefe) return;
  const n = S.nave;
  let carga = 0;   // con la zona llena (los grandes cuentan doble) no salen más: así se combinan tamaños sin taponar
  for (const e of S.enem) if (!e.muerto && !e.d.pasivo && !e.d.nido && Math.hypot(e.x - n.x, e.y - n.y) < 1200) carga += e.rango > n.rango + 1 ? 2 : 1;
  for (const o of NV_OLEADAS) {
    if (carga >= 12) break;
    if (S.t < o.desde) continue;
    o.tiempo = (S.o_t[o.tipo + o.desde] = (S.o_t[o.tipo + o.desde] || 0) + dt);
    if (o.tiempo < o.cada) continue;
    S.o_t[o.tipo + o.desde] = 0;
    for (let i = 0; i < o.lote; i++) { const a = Math.random() * 6.283, R = 560 + Math.random() * 120; nvEnemigo(S, o.tipo, n.x + Math.cos(a) * R, n.y + Math.sin(a) * R, nvRangoRelativo(n.rango)); }
  }
  if (S.capMuertos >= 3 || S.t >= NV_TIEMPO_JEFE) {
    const a = Math.random() * 6.283, x = n.x + Math.cos(a) * 750, y = n.y + Math.sin(a) * 750, d = Math.hypot(x, y), k = d > NV_ARENA - 100 ? (NV_ARENA - 100) / d : 1;
    S.jefe = nvEnemigo(S, 'jefe', x * k, y * k);
    S.jefe.cd = 3; S.jefe.cdInv = 7;
    S.aviso = { t: 3, txt: tr('¡Llega el Rey de los huesos!') };
  }
}

// Los que salen a tu paso son de tu tamaño o algo menores, y de vez en cuando uno mucho mayor del que hay que huir.
function nvRangoRelativo(r) {
  const q = Math.random();
  return Math.max(1, r + (q < 0.25 ? -4 : q < 0.5 ? -2 : q < 0.7 ? -1 : q < 0.85 ? 0 : q < 0.93 ? 1 : q < 0.97 ? 3 : q < 0.99 ? 5 : 8));
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
    if (e.d.nido) { if (dist < 520) { e.golpe -= dt; if (e.golpe <= 0) { e.golpe = 2.2; S.eproy.push({ x: e.x, y: e.y, vx: ux * 210, vy: uy * 210, dano: 9, vida: 3, r: 7 }); } } continue; }   // el nido no se mueve y escupe si te acercas
    if (e.d.pasivo) continue;   // las rocas solo estorban: se rompen a tiros
    if (dist > (e.errante ? 900 : 2600) && !e.d.jefe && !e.d.capitan) { if (e.errante) { e.fase += dt * 0.2; e.x += Math.cos(e.fase) * 25 * dt; e.y += Math.sin(e.fase) * 25 * dt; } continue; }   // lejos: dormido o a lo suyo
    const apagado = e.est.apagado > 0, lento = apagado ? 0.3 : 1;
    let vx = 0, vy = 0;
    if (e.armas) {   // la nave orbita a su alcance y cada arma dispara desde su anclaje
      const ideal = e.alcMax * 0.7, radial = dist > ideal ? 1 : -0.6;
      vx = ux * radial + -uy * 0.8; vy = uy * radial + ux * 0.8;
      if (!apagado) for (const w of e.armas) {
        const A = NV_ARMA_E[w.tam];
        if ((w.cd -= dt) > 0 || dist > A.alc * e.kf + e.r) continue;
        w.cd = A.cada;
        const px = e.x + w.ax * e.r, py = e.y + w.ay * e.r, d = Math.hypot(n.x - px, n.y - py) || 1;
        S.eproy.push({ x: px, y: py, vx: (n.x - px) / d * A.v, vy: (n.y - py) / d * A.v, dano: A.dano, vida: A.alc * e.kf / A.v + 0.4, r: A.r * e.kf });
      }
    } else if (e.d.capitan) { const q = nvCapitan(S, e, dt, ux, uy, dist, apagado); vx = q[0]; vy = q[1]; }
    else if (e.d.jefe) { nvJefe(S, e, dt, ux, uy, dist, apagado); vx = ux * (dist > 260 ? 1 : 0.2) - uy * 0.5; vy = uy * (dist > 260 ? 1 : 0.2) + ux * 0.5; }
    else { vx = ux; vy = uy; }
    const l = Math.hypot(vx, vy) || 1, v = e.d.vel * lento * (e.d.jefe && e.hp < e.hpMax / 2 ? 1.4 : 1);
    e.x += vx / l * v * dt; e.y += vy / l * v * dt;
    // sin daño por choque: solo hacen daño con sus armas
  }
}
// El capitán patrulla, se come las rocas que encuentra (cada dos sube de rango y crece) y persigue y dispara si te acercas.
function nvCapitan(S, e, dt, ux, uy, dist, apagado) {
  e.vida = (e.vida || 0) + dt;
  if (e.vida > 100 * e.rango && e.rango < 1 + Math.floor(S.t / 100)) nvCapitanSube(e);
  if (dist < 1000) {
    e.cd -= dt * (apagado ? 0 : 1);
    if (e.cd <= 0 && dist < 700) { e.cd = Math.max(1.6, 3.6 - 0.35 * e.rango); for (const da of [-0.18, 0, 0.18]) { const a = Math.atan2(uy, ux) + da; S.eproy.push({ x: e.x, y: e.y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, dano: 8 + 2 * e.rango, vida: 3, r: 6 }); } }
    return [ux * (dist > 260 ? 1 : 0.1) - uy * 0.35, uy * (dist > 260 ? 1 : 0.1) + ux * 0.35];
  }
  return [Math.cos(e.fase += dt * 0.3), Math.sin(e.fase)];   // patrulla; crece con el reloj
}
function nvCapitanSube(e) {
  e.rango++; e.r *= 1.1; e.hpMax *= 1.3; e.hp = Math.min(e.hpMax, e.hp + e.hpMax * 0.25); e.d = Object.assign({}, e.d, { contacto: e.d.contacto + 4 });
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
function nvMuere(S, e) {
  e.muerto = true; S.stats.muertos++; S.kills.push(S.t);
  if (e.d.capitan) S.capMuertos++;
  nvChatarra(S, e.x, e.y, e.d.pasivo || e.d.nido || e.d.jefe || e.d.capitan ? e.d.chat : nvValorKill(e.d.chat, e.rango, S.nave.rango));
  S.fx.push({ t: 0.4, x: e.x, y: e.y, r: e.r * 1.6, color: e.d.color, tipo: 'onda' });
  const z = nvZ(S);
  S.fx.push({ t: 0.25, x: e.x, y: e.y, r: e.r * 1.1, color: '#ffe9a8', tipo: 'flash' });
  for (let i = 0; i < 10 + Math.min(14, e.rango); i++) { const a = Math.random() * 6.283, v = (80 + Math.random() * 260) * Math.max(z, e.r / 24); S.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0.5 + Math.random() * 0.4, color: i % 3 ? e.d.color : '#ffd93d', s: Math.max(3 * z, e.r * 0.12) }); }
  if (e.d.jefe) S.estado = 'victoria';
}
// La chatarra queda flotando hasta que la nave se acerca (imán).
function nvChatarra(S, x, y, valor) {
  valor *= 1 + (S.chatExtra || 0);
  const k = Math.max(1, Math.min(6, Math.round(valor / 4)));
  for (let i = 0; i < k; i++) S.restos.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 30, v: valor / k, t: 0, ang: Math.random() * 6.28 });
}
function nvDanoNave(S, d) {
  const n = S.nave, rd = d * (1 - (S.mejoras.blindaje || 0)) * (1 + 0.15 * ((S.peligro || 1) - 1));
  let r = rd;
  if (n.esc && n.esc.hp > 0) { const a = Math.min(n.esc.hp, r); n.esc.hp -= a; r -= a; n.esc.sin = 3; }
  n.hp -= r; n.golpeado = 0.15; S.stats.recibido += rd;
  if (S.cap === 'twitchking') S.kills = [];   // el hype se pierde al recibir daño
  if (n.hp <= 0 && S.cap === 'necrolord' && !S.revivido) { S.revivido = true; n.hp = n.hpMax * 0.5; S.aviso = { t: 2.5, txt: tr('¡Renaces!') }; return; }
  if (n.hp <= 0 && S.estado === 'juego') S.estado = 'derrota';
}
