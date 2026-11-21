// Fans of Beams · Enemigos y jefe: oleadas por patrones, movimiento y disparos de cada tipo, el jefe del sector con sus fases y su rayo.
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
// ---------- enemigos ----------
// Un enemigo grande tiene varias zonas de golpe repartidas por su casco; uno pequeño, un círculo.
function choca(e, x, y, rr, k = 1) {
  if (!e.d.hb) return Math.hypot(x - e.x, y - e.y) < e.r * k + rr;
  for (const h of e.d.hb) if (Math.hypot(x - (e.x + h[0] * e.d.tam), y - (e.y + h[1] * e.d.tam)) < h[2] * e.d.tam * k + rr) return true;
  return false;
}
function tocaBanda(e, tx, ty, w) {   // ¿el rayo (de tx hacia la derecha, w de ancho) toca algún trozo?
  if (!e.d.hb) return e.x + e.r > tx && Math.abs(e.y - ty) < w / 2 + e.r * 0.8;
  for (const h of e.d.hb) { const hx = e.x + h[0] * e.d.tam, hy = e.y + h[1] * e.d.tam, hr = h[2] * e.d.tam; if (hx + hr > tx && Math.abs(hy - ty) < w / 2 + hr * 0.8) return true; }
  return false;
}
function crea(tipo, x, y, extra) {
  const d = TIPOS[tipo], hpk = tipo === 'rock' || tipo === 'boss' ? 1 : 1 + 0.8 * dificultad() + (tipo === 'zip' && dificultad() > 0.55 ? 0.5 : 0), e = Object.assign({ tipo, d, x, y, y0: y, hp: d.hp * hpk, hpMax: d.hp * hpk, r: d.r, t: 0, fase: rnd(0, 6.28), cool: rnd(0.8, 1.6), flash: 0, fac: S.fac }, extra || {});
  if (tipo === 'boss') { e.hp = e.hpMax = d.hp * (1 + 0.4 * S.sector) * S.D.jefe; }
  EN.push(e); return e;
}
// 0 al empezar y 1 en lo más difícil: crece con el tiempo del sector (en ~2,5 minutos) y con el número de sector
// Duración de cada sector (segundos): largos, con minijefes a mitad y el jefe al final. El ritmo sube y baja (ver `oleada`) para que no canse.
const SECTOR_T = [250, 280, 310];
const tSector = () => S.t - (S.t0s || 0), duracion = () => SECTOR_T[Math.min(2, S.sector)];
function dificultad() { return clamp(clamp(tSector() / duracion(), 0, 1) * 0.5 + [0, 0.28, 0.55][Math.min(2, S.sector)], 0, 1); }
// Cada oleada es un patrón distinto (no se repite el anterior) elegido con pesos: los más difíciles solo salen cuando la dificultad ya ha subido.
const PATRONES = [['linea', 1.0, 0], ['gun', 0.9, 0], ['zigzag', 0.6, 0.15], ['columna', 0.8, 0.2], ['lluvia', 0.5, 0.3], ['pinza', 0.8, 0.3], ['sep', 0.6, 0.3], ['dobleGun', 0.8, 0.3], ['nido', 0.5, 0.45]];
function oleada() {
  const prog = S.puntos - S.ini, dif = dificultad(); S.oleada++;
  const fT = tSector() / duracion();
  if (fT >= 0.64 && !S.acor) { S.acor = true; crea('acor', W + 380, H / 2); mensaje('¡Un acorazado enorme! Rómpele la armadura y capturalo (X)'); S.sp = 7; return; }
  if (fT >= 0.34 && !S.capitan) { S.capitan = true; crea('cap', W + 240, H / 2); mensaje('¡Capitán! Rómpele la armadura y capturalo (X)'); S.sp = 5; return; }
  if (fT >= 0.2 && !S.campo) { S.campo = true; S.lluvia = 11; S.lluviaT = 1.5; mensaje('¡Campo de asteroides!'); sonido('aviso'); suelta(W + 40, H / 2, 'escudo'); S.sp = 11; return; }
  const lista = PATRONES.filter(q => dif >= q[2] && q[0] !== S.ultimo), tot = lista.reduce((a, q) => a + q[1], 0); let r = Math.random() * tot, t = lista[0][0];
  for (const q of lista) { r -= q[1]; if (r <= 0) { t = q[0]; break; } }
  S.ultimo = t; const ola = 1 + 0.5 * Math.sin(S.t / 6.5), ritmo = (2.4 - dif * 1.2) * S.D.esp * ola;   // olas de tensión y respiro (cada ~40 s): ni un ritmo plano ni agobio constante   // segundos hasta la siguiente oleada: de 2,7 a 1,3 (más o menos según la dificultad)
  const yy = () => rnd(90, H - 90), lin = (y0, amp, inv, cant, sep = 62) => { for (let i = 0; i < cant; i++) crea('zip', W + 40 + i * sep, y0, { amp, inv, fase: i * 0.45 }); };
  if (t === 'linea') { lin(yy(), rnd(30, 90), Math.random() < 0.5 ? 1 : -1, 4 + Math.floor(dif * 5)); S.sp = ritmo; }
  else if (t === 'zigzag') { lin(yy(), rnd(110, 150), Math.random() < 0.5 ? 1 : -1, 6, 50); S.sp = ritmo + 0.4; }
  else if (t === 'columna') {   // una pared de zips rectos con un hueco por el que pasar (o que abrir a tiros)
    const hueco = Math.floor(rnd(1, 7)), ancho = 2 + (dif < 0.5 ? 1 : 0);
    for (let i = 0; i < 9; i++) if (i < hueco || i >= hueco + ancho) crea('zip', W + 40, 52 + i * ((H - 104) / 8), { amp: 0, inv: 1, fase: 0 });
    S.sp = ritmo + 0.8;
  } else if (t === 'pinza') { lin(80, 45, 1, 5 + Math.floor(dif * 2)); lin(H - 80, 45, -1, 5 + Math.floor(dif * 2)); S.sp = ritmo + 1.0; }
  else if (t === 'gun') { crea('gun', W + 60, yy()); S.sp = ritmo + 0.5; }
  else if (t === 'dobleGun') { crea('gun', W + 60, rnd(110, 240)); crea('gun', W + 150, rnd(300, H - 110)); lin(yy(), 40, 1, 3); S.sp = ritmo + 1.0; }
  else if (t === 'sep') { crea('sep', W + 140, rnd(150, H - 150)); S.sp = ritmo + 1.2; }
  else if (t === 'nido') { crea('nido', W + 180, rnd(170, H - 170)); S.sp = ritmo + 1.8; }
  else if (t === 'lluvia') { S.lluvia = 6; S.lluviaT = 1.2; mensaje('¡Lluvia de meteoritos!'); sonido('aviso'); S.sp = 7; }
  if (dif > 0.3 && t !== 'lluvia' && Math.random() < 0.2 + dif * 0.25) crea('gun', W + 120, yy());   // a más dificultad, a veces viene acompañada
}
function mueveEnemigo(e, dt) {
  e.t += dt; if (e.flash > 0) e.flash -= dt;
  if (e.tipo === 'zip') { e.x -= e.d.vel * dt; e.y = e.y0 + Math.sin(e.t * 3 + e.fase) * e.amp * e.inv; }
  else if (e.tipo === 'rock') { e.x += e.vx * dt; e.y += e.vy * dt; e.rot += e.vr * dt; if (e.fuego && Math.random() < 0.9) chispa(e.x + e.r * 0.6, e.y + rnd(-e.r, e.r) * 0.5, -e.vx * 0.15, rnd(-40, 40), pick(['#ffb347', '#ff6a2a']), rnd(0.15, 0.35), 2.5); }
  else if (e.tipo === 'gun') {
    if (e.x > W - 230 + (e.fase * 8) && e.t < 8) e.x -= e.d.vel * 1.5 * dt;
    else if (e.t < 11) { e.y += clamp(P.y - e.y, -1, 1) * 50 * dt; e.x += Math.sin(e.t) * 14 * dt; }
    else e.x -= e.d.vel * 2 * dt;
    e.cool -= dt; if (e.cool <= 0) { e.cool = 1.8 - 0.8 * dificultad(); disparaE(e, ang(e, P), 230); if (Math.random() < 0.3 + 0.5 * dificultad()) { disparaE(e, ang(e, P) + 0.22, 230); disparaE(e, ang(e, P) - 0.22, 230); } }
  } else if (e.tipo === 'sep') {
    if (e.x > W - 250) e.x -= e.d.vel * 1.6 * dt; else { e.y += clamp(P.y - e.y, -1, 1) * 35 * dt; e.x += Math.sin(e.t * 0.9) * 18 * dt; }
    e.cool -= dt; if (e.cool <= 0) { e.cool = 1.7; const a0 = ang(e, P); for (let i = 0; i < 12; i++) disparaE(e, a0 + i * 0.5236, 150, '#ffb347', 6); disparaE(e, a0, 270, '#ff6bd0'); }
    if (e.t > 14) e.x -= 110 * dt;
  } else if (e.tipo === 'nido') {
    if (e.x > W - 170) e.x -= e.d.vel * 2 * dt; else e.x -= e.d.vel * 0.4 * dt; e.y = clamp(e.y0, 140, H - 140) + Math.sin(e.t * 0.7) * 40;
    e.cool -= dt; if (e.cool <= 0) { e.cool = 2.8; for (let i = -1; i <= 1; i += 2) crea('zip', e.x - 40, e.y + i * 30, { amp: 35, inv: i, fase: 0 }); onda(e.x, e.y, '#ff8a3c', 70, 0.4, 3); }
  } else if (e.tipo === 'acor') {
    if (e.x > W - 270) e.x -= e.d.vel * 1.6 * dt; else { e.y = H / 2 + Math.sin(e.t * 0.5) * 70; e.x = W - 270 + Math.sin(e.t * 0.4) * 14; }
    e.cool -= dt; if (e.cool <= 0) { e.cool = 1.4; const a0 = ang(e, P); for (let i = -3; i <= 3; i++) disparaE(e, a0 + i * 0.12, 230, '#ffb347', 6); if (e.hp < e.hpMax * 0.5) for (let i = 0; i < 12; i++) disparaE(e, e.t * 2 + i * 0.5236, 150, '#ff6bd0', 6); }
    if (e.t > 45) e.x -= 120 * dt;
  } else if (e.tipo === 'cap') {
    if (e.x > W - 210) e.x -= e.d.vel * 2 * dt; else { e.y = H / 2 + Math.sin(e.t * 0.8) * (H / 2 - 170); e.x = W - 210 + Math.sin(e.t * 0.5) * 20; }
    e.cool -= dt; if (e.cool <= 0) { e.cool = 1.7; const a0 = ang(e, P); for (let i = -2; i <= 2; i++) disparaE(e, a0 + i * 0.16, 210); if (e.hp < e.hpMax * 0.5) for (let i = 0; i < 10; i++) disparaE(e, e.t + i * 0.628, 150); }
    if (e.t > 40) e.x -= 120 * dt;
  }
}
function disparaE(e, a, v, col, r) { v *= S.D.balaV * (0.9 + 0.42 * dificultad()); const big = e.d.tam > 300, ox = big ? e.x - e.d.tam * 0.3 : e.x - 20, oy = big ? e.y + rnd(-0.14, 0.14) * e.d.tam : e.y; EB.push({ x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: r || 5, col: col || '#ff6bd0', px: ox, py: oy }); }
function creaRoca(rapida) {
  const r = rapida ? rnd(15, 28) : 24 + Math.random() * 36;
  const e = crea('rock', W + 80, rnd(30, H - 30), { r, tam: r * 2.7, vx: rapida ? -rnd(240, 360) : -rnd(90, 170), vy: rapida ? rnd(-40, 90) : rnd(-25, 25), rot: rnd(0, 6.28), vr: rnd(-3, 3), fuego: !!rapida, sp: 'asteroide' + (Math.random() < 0.85 ? '-' + (2 + Math.floor(Math.random() * 6)) : '') });
  e.hp = e.hpMax = 3 + r / 7; e.fac = 'nomuertos';
}

// ---------- jefe: el jefe del sector y su rayo gigante frontal ----------
function creaJefe() {
  const b = crea('boss', W + 520, H / 2); b.estado = 'entra'; b.cool = 1.5; b.rayoT = 6; b.rayo = null; b.espiral = 0; S.jefe = b;
  sonido('aviso'); musicSet('nvJefe');
}
function mueveJefe(b, dt) {
  b.t += dt; if (b.flash > 0) b.flash -= dt;
  if (b.estado === 'entra') { b.x -= 150 * dt; if (b.x <= W - 200) { b.x = W - 200; b.estado = 'lucha'; S.shake = 1; sonido('lejos'); } return; }
  if (b.rayo) {   // el rayo: primero un aviso fino que sigue tu altura, después se fija y dispara
    const r = b.rayo; r.t += dt;
    if (r.t < 1.0) r.y += clamp(P.y - r.y, -1, 1) * 260 * dt;
    else if (r.t >= 1.7 && r.t < 3.0) { if (!r.on) { r.on = true; sonido('rayoJefe'); S.shake = Math.max(S.shake, 0.6); S.flash = Math.max(S.flash, 0.35); } }
    else if (r.t >= 3.0) { b.rayo = null; b.rayoT = rnd(7, 9) - (b.nivel || 0) * 0.5; }
    b.y += (clamp(b.rayo ? b.rayo.y : H / 2, 190, H - 190) - b.y) * 1.5 * dt; return;
  }
  b.y = H / 2 + Math.sin(b.t * 0.6) * 80;
  b.cool -= dt; b.rayoT -= dt;
  const f = b.hp / b.hpMax, nivel = (f > 0.66 ? 0 : f > 0.33 ? 1 : 2) + S.sector;   // 0 a 4: el jefe se pone peor con su vida y con el sector
  if (nivel !== b.nivel) { b.nivel = nivel; if (nivel > 0 && b.estado === 'lucha') { cartel('¡FASE ' + (nivel + 1) + '!', b.x - 200, b.y - 120, '#ff8a8a'); S.shake = Math.max(S.shake, 0.5); } }
  if (b.cool <= 0) {
    b.cool = Math.max(0.65, 1.4 - nivel * 0.15); const a0 = ang(b, P), n = 2 + (nivel >= 2 ? 1 : 0) + (nivel >= 4 ? 1 : 0);
    for (let i = -n; i <= n; i++) disparaE(b, a0 + i * 0.14, 220, '#ff8a3c', 6);
    if (nivel >= 2) { b.espiral += 0.5; for (let i = 0; i < 5 + nivel; i++) disparaE(b, b.espiral + i * (6.283 / (5 + nivel)), 135, '#ffd23c', 5); }
    if (nivel >= 3) for (let i = 0; i < 10; i++) disparaE(b, -b.espiral + i * 0.628, 170, '#46d2ff', 5);
  }
  if (b.rayoT <= 0) { b.rayo = { t: 0, y: P.y, on: false }; sonido('carga'); }
}
