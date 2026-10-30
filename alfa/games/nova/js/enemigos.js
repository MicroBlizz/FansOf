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
  jefe:      { nombre: 'Rey de los huesos', hp: 7000, vel: 0, r: 80, contacto: 30, chat: 120, color: '#c8b6ff', esc: 700, resiste: 'cinetica', jefe: 1 }
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

// Anclajes de las armas enemigas (sus armas y alcances, en armas-enemigas.js).
const NV_ANCLAJES = {   // posiciones sobre la nave, en fracciones del radio
  rastrero: [[0, -0.9], [-0.75, -0.3], [0.75, -0.3], [-0.5, 0.6], [0.5, 0.6], [0, 0.2], [-0.95, 0.3], [0.95, 0.3], [0, 0.9], [-0.3, -0.6], [0.3, -0.6], [0, -0.3]],
  fusilero: [[0, -1.1], [-0.55, 0.1], [0.55, 0.1], [-0.9, 0.8], [0.9, 0.8], [0, 0.3], [-0.3, -0.4], [0.3, -0.4], [-0.7, 0.45], [0.7, 0.45], [0, 0.8], [0, -0.6]],
  sepulturero: [[0, -0.9], [-0.7, -0.6], [0.7, -0.6], [-0.95, 0], [0.95, 0], [-0.7, 0.6], [0.7, 0.6], [0, 0.9], [0, 0], [-0.4, -0.3], [0.4, -0.3], [-0.4, 0.4], [0.4, 0.4], [0, -0.5]]
};
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
  nvEnemigoFaccion(S, e);   // enemigos-faccion.js: en un sector de otra facción, sus naves y sus armas
  e.kf = nvFactor(rango);   // el alcance y el tamaño de las balas crecen con la nave, igual que las tuyas
    S.enem.push(e);
  return e;
}
function nvSpawn(S, dt) {
  if (S.jefe || S.jefeSalto) return;
  const n = S.nave;
  let carga = 0;   // con la zona llena (los grandes cuentan doble) no salen más: así se combinan tamaños sin taponar
  for (const e of S.enem) if (!e.muerto && !e.d.pasivo && !e.d.nido && Math.hypot(e.x - n.x, e.y - n.y) < 1200) carga += e.rango > n.rango + 1 ? 2 : 1;
  for (const o of NV_OLEADAS) {
    if (carga >= 12) break;
    if (S.t < o.desde) continue;
    o.tiempo = (S.o_t[o.tipo + o.desde] = (S.o_t[o.tipo + o.desde] || 0) + dt);
    if (o.tiempo < o.cada) continue;
    S.o_t[o.tipo + o.desde] = 0;
    for (let i = 0; i < o.lote; i++) nvSaltoEntra(S, o.tipo, nvRangoRelativo(n.rango), 0.8 + Math.random() * 0.2);
  }
  if (S.capMuertos >= 3 || S.t >= NV_TIEMPO_JEFE) {
    S.jefeSalto = true;
    nvSaltoEntra(S, 'jefe', 1, 0.75, j => { S.jefe = j; S.jefeSalto = false; nvJefeNuevo(j); });
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
    if (e.sinEsc > 0) e.sinEsc -= dt;
    if (e.sis > 0 && !(e.est.interferido > 0)) e.sis = Math.max(0, e.sis - 20 * dt);   // los sistemas se reponen cuando cesa la interferencia
    if (e.d.esc && e.esc < e.escMax && !(e.est.escudoCaido > 0) && !(e.est.interferido > 0) && !(e.sinEsc > 0)) e.esc = Math.min(e.escMax, e.esc + dt * 6);
    const dx = n.x - e.x, dy = n.y - e.y, dist = Math.hypot(dx, dy) || 1, ux = dx / dist, uy = dy / dist;
    e.vis = nvEnPantalla(S, e.x, e.y);   // fuera de la pantalla no dispara
    if (e.d.nido) { if (dist < 520 && e.vis) { e.golpe -= dt; if (e.golpe <= 0) { e.golpe = 2.2; nvBalaE(S, e.x, e.y, ux * 210, uy * 210, 9, 7, 3, 'termica'); } } continue; }   // el nido no se mueve y escupe si te acercas
    if (e.d.pasivo) continue;   // las rocas solo estorban: se rompen a tiros
    if (dist > (e.errante ? 900 : 2600) && !e.d.jefe && !e.d.capitan) { if (e.errante) { e.fase += dt * 0.2; e.x += Math.cos(e.fase) * 25 * dt; e.y += Math.sin(e.fase) * 25 * dt; } continue; }   // lejos: dormido o a lo suyo
    const apagado = e.est.apagon > 0, lento = apagado ? 0.3 : 1;
    let vx = 0, vy = 0;
    if (e.armas) {   // la nave orbita a su alcance y cada arma dispara desde su anclaje
      nvNavegaE(S, e, dt, Math.atan2(uy, ux), dist, lento);
      if (!apagado) for (const w of e.armas) {
        if ((w.cd -= dt) > 0 || dist > nvAlcE(S, w) + e.r || !e.vis) continue;
        nvDisparaE(S, e, w);
      }
    } else if (e.d.capitan) { const q = nvCapitan(S, e, dt, ux, uy, dist, apagado); vx = q[0]; vy = q[1]; }
    else if (e.d.jefe) nvJefe(S, e, dt, ux, uy, dist, apagado);   // pilota solo (jefe.js)
    else { vx = ux; vy = uy; }
    if (e.armas) continue;   // las armadas ya se han movido solas (navegacion-enemiga.js)
    const l = Math.hypot(vx, vy) || 1, v = e.d.vel * lento * (e.d.jefe && e.hp < e.hpMax / 2 ? 1.4 : 1);
    e.x += vx / l * v * dt; e.y += vy / l * v * dt;
    // sin daño por choque: solo hacen daño con sus armas
  }
}
// Salto hiperespacial: la nave entra a toda velocidad desde fuera de la pantalla y frena a una fracción `f` del borde,
// con un destello. Mientras viaja no existe para nadie (ni dispara ni se le puede dar); al llegar, nace de verdad.
const NV_SALTO_T = 0.45;
function nvSaltoEntra(S, tipo, rango, f, alLlegar) {
  nvSnd(tipo === 'jefe' ? 'nvJefeLlega' : 'nvSalto', S);
  const n = S.nave, [hw, hh] = nvMediaPantalla(S), a = Math.random() * 6.283, ca = Math.cos(a), sa = Math.sin(a);
  const borde = Math.min(hw / Math.abs(ca || 1e-6), hh / Math.abs(sa || 1e-6));   // distancia al borde de la pantalla en esa dirección
  const x = n.x + ca * borde * f, y = n.y + sa * borde * f;
  const lejos = Math.hypot(hw, hh) * 1.6;
  S.saltos.push({ tipo, rango, x0: x + ca * lejos, y0: y + sa * lejos, x, y, ang: a + Math.PI, t: 0, alLlegar });
}
function nvSaltos(S, dt) {
  for (let i = S.saltos.length - 1; i >= 0; i--) {
    const s = S.saltos[i]; s.t += dt;
    if (s.t < NV_SALTO_T) continue;
    S.saltos.splice(i, 1);
    const e = nvEnemigo(S, s.tipo, s.x, s.y, s.rango); e.rumbo = s.ang;
    S.fx.push({ t: 0.25, x: s.x, y: s.y, r: e.r * 2.2, color: '#bff4ff', tipo: 'flash' }, { t: 0.45, x: s.x, y: s.y, r: e.r * 2.4, color: '#6fe3ff', tipo: 'onda' });
    if (s.alLlegar) s.alLlegar(e);
  }
}
// Posición de una nave en pleno salto: frena de golpe al final (curva de salida).
function nvSaltoPos(s) { const k = 1 - Math.pow(1 - Math.min(1, s.t / NV_SALTO_T), 3); return [s.x0 + (s.x - s.x0) * k, s.y0 + (s.y - s.y0) * k]; }
// El capitán patrulla, se come las rocas que encuentra (cada dos sube de rango y crece) y persigue y dispara si te acercas.
function nvCapitan(S, e, dt, ux, uy, dist, apagado) {
  e.vida = (e.vida || 0) + dt;
  if (e.vida > 100 * e.rango && e.rango < 1 + Math.floor(S.t / 100)) nvCapitanSube(e);
  if (dist < 1000) {
    e.cd -= dt * (apagado ? 0 : 1);
    if (e.cd <= 0 && dist < 700 && e.vis) { e.cd = Math.max(1.6, 3.6 - 0.35 * e.rango); for (const da of [-0.18, 0, 0.18]) { const a = Math.atan2(uy, ux) + da; nvBalaE(S, e.x, e.y, Math.cos(a) * 260, Math.sin(a) * 260, 8 + 2 * e.rango, 6, 3); } }
    return [ux * (dist > 260 ? 1 : 0.1) - uy * 0.35, uy * (dist > 260 ? 1 : 0.1) + ux * 0.35];
  }
  return [Math.cos(e.fase += dt * 0.3), Math.sin(e.fase)];   // patrulla; crece con el reloj
}
function nvCapitanSube(e) {
  e.rango++; e.r *= 1.1; e.hpMax *= 1.3; e.hp = Math.min(e.hpMax, e.hp + e.hpMax * 0.25); e.d = Object.assign({}, e.d, { contacto: e.d.contacto + 4 });
}
function nvMuere(S, e) {
  e.muerto = true; S.stats.muertos++; S.kills.push(S.t);
  if (e.d.jefe || e.d.capitan || e.d.nido) nvSnd('nvBoomGrande', S, e.x, e.y); else nvSnd('nvBoom', S, e.x, e.y, Math.min(1.3, 0.7 + e.r / 80));
  if (e.d.capitan) S.capMuertos++;
  // un enemigo con calor acumulado revienta y quema en área en proporción a ese calor (la onda no calienta a los vecinos)
  if (e.calor >= 10 && !e.d.pasivo) { const k = e.calor; e.calor = 0; nvExplosion(S, e.x, e.y, 40 + k * 0.5, k * 1.2, { carga: 'termica', tam: 0 }, e, true); }
  nvChatarra(S, e.x, e.y, e.d.pasivo || e.d.nido || e.d.jefe || e.d.capitan ? e.d.chat : nvValorKill(e.d.chat, e.rango, S.nave.rango));
  S.fx.push({ t: 0.4, x: e.x, y: e.y, r: e.r * 1.6, color: e.d.color, tipo: 'onda' });
  const z = nvZ(S);
  S.fx.push({ t: 0.25, x: e.x, y: e.y, r: e.r * 1.1, color: '#ffe9a8', tipo: 'flash' });
  for (let i = 0; i < 10 + Math.min(14, e.rango); i++) { const a = Math.random() * 6.283, v = (80 + Math.random() * 260) * Math.max(z, e.r / 24); S.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0.5 + Math.random() * 0.4, color: i % 3 ? e.d.color : '#ffd93d', s: Math.max(3 * z, e.r * 0.12) }); }
  if (!e.d.pasivo && nvVisible(S, e.x, e.y, e.r)) nvTrozos(S, e, e.d.capitan || e.d.nido ? 6 : 4);   // revienta en pedazos
  if (e.d.jefe) nvAcaba(S, 'victoria', e.x, e.y, e.r);
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
  if (NVP.inmortal) r = 0;   // ?inmortal=1: escenario de pruebas de rendimiento, no te matan (los enemigos siguen disparando y el daño se cuenta)
  if (r > 0) nvSnd('nvGolpeNave', S);
  n.hp -= r; n.golpeado = 0.15; S.stats.recibido += rd;
  if (S.cap === 'twitchking') S.kills = [];   // el hype se pierde al recibir daño
  if (n.hp <= 0 && S.cap === 'necrolord' && !S.revivido) { S.revivido = true; n.hp = n.hpMax * 0.5; S.aviso = { t: 2.5, txt: tr('¡Renaces!') }; return; }
  if (n.hp <= 0 && S.estado === 'juego') nvAcaba(S, 'derrota');
}
