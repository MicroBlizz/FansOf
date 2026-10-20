// Fans of Beams · Aliados capturados (sus habilidades), el jugador (golpes, disparo, bola de captura, super rayo) y los objetos de evolución y escudo.
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
// ---------- aliados capturados ----------
function captura(e) {
  if (ALI.length >= maxAli()) {   // escolta llena: un minijefe echa al aliado más flojo (un ZIP o un FUSILERO); el resto, no
    const i = ALI.findIndex(a => !a.d.hb);
    if (i < 0 || !e.d.hb) return false;
    const v = ALI[i]; ALI.splice(i, 1); chispas(v.x, v.y, '#7fe8ff', 14, 200); onda(v.x, v.y, '#7fe8ff', 60, 0.3, 3);
  }
  const d = e.d; ALI.push({ tipo: e.tipo, d, fac: e.fac, x: e.x, y: e.y, hp: d.escudo, hpMax: d.escudo, cool: 0.2, t: 0, flash: 0, r: Math.min(d.r, 48), tam: Math.min(d.tam * 0.8, 130) });
  EN.splice(EN.indexOf(e), 1); suma(50 + (d.hb ? 450 : 100)); S.capturas++;
  luz(e.x, e.y, 260, '#7fe8ff', 0.9, 0.5); onda(e.x, e.y, '#7fe8ff', 130, 0.6, 5); onda(e.x, e.y, '#fff', 80, 0.4, 3); bola(e.x, e.y, 90, 0.25);
  for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283; chispa(e.x, e.y, Math.cos(a) * 320, Math.sin(a) * 320, '#7fe8ff', 0.5, 2.5); }
  vib(35); cartel(d.hab ? '¡CAPTURADO! +' + d.hab : '¡CAPTURADO!', e.x, e.y - 50, '#7fe8ff'); sonido('captura'); S.shake = Math.max(S.shake, d.hb ? 0.8 : 0.3);
  if (d.hb) { S.flash = Math.max(S.flash, 0.3); mensaje('Tu ' + d.nombre.toLowerCase() + ' capturado te ayuda con ' + d.hab + '. [C] = su rayo gigante'); }
  return true;
}
const SLOTS = [{ x: 62, y: -48 }, { x: 62, y: 48 }, { x: -58, y: 0 }];
function mueveAliado(a, i, dt) {
  a.t += dt; if (a.flash > 0) a.flash -= dt;
  const s = SLOTS[i], tx = P.x + s.x + Math.sin(a.t * 2 + i) * 4, ty = P.y + s.y + Math.cos(a.t * 1.7 + i) * 5, k = 1 - Math.exp(-9 * dt);
  a.x += (tx - a.x) * k; a.y += (ty - a.y) * k;
  a.hT = (a.hT == null ? 1.5 : a.hT) - dt;
  if (a.tipo === 'cap' && a.hT <= 0) { a.hT = 1.6; for (let i = 0; i < 4; i++) PB.push({ x: a.x + 10, y: a.y, vx: 240, vy: (i - 1.5) * 150, dmg: 2.2, r: 5, col: '#ffd03c', aliado: true, hom: 2.5, px: a.x, py: a.y }); sonido('disparoA'); onda(a.x, a.y, '#ffd03c', 40, 0.25, 3); }
  if (a.tipo === 'sep' && a.hT <= 0) { a.hT = 3.5; onda(a.x, a.y, '#ffb347', 190, 0.5, 6); luz(a.x, a.y, 200, '#ffb347', 0.6, 0.3); sonido('escudo'); for (const b of EB) if (Math.hypot(b.x - a.x, b.y - a.y) < 190) { b.dead = true; chispas(b.x, b.y, '#ffb347', 3, 160); } for (const e of EN) if (e.hp > 0 && choca(e, a.x, a.y, 190)) daño(e, 2.5); }
  if (a.tipo === 'acor') { if (a.hT <= 0 && !a.rayOn) { a.hT = 4; a.rayOn = 1; sonido('carga'); } if (a.rayOn) { a.rayOn -= dt * 1.1; if (a.rayOn <= 0) a.rayOn = 0; else { const ax = a.x + a.tam / 2; for (const e of EN) if (e.hp > 0 && tocaBanda(e, ax, a.y, 62)) daño(e, 38 * dt); for (const b of EB) if (b.x > ax && Math.abs(b.y - a.y) < 34) b.dead = true; if (Math.random() < 0.6) chispa(rnd(ax, W), a.y + rnd(-30, 30), rnd(-60, 60), rnd(-200, 200), '#ffd9a0', 0.3, 2); } } }
  a.cool -= dt; if (a.cool > 0 || S.rayo) return;
  const col = '#9ff3ff', v = (vx, vy, dmg, r) => PB.push({ x: a.x + 20, y: a.y, vx, vy, dmg, r: r || 4, col, aliado: true, px: a.x, py: a.y });
  if (a.tipo === 'zip') { a.cool = 0.13; v(820, 0, 0.7); sonido('disparoA'); }
  else if (a.tipo === 'gun') { a.cool = 0.5; v(640, -110, 1); v(660, 0, 1); v(640, 110, 1); sonido('disparoA'); }
  else if (a.tipo === 'sep') { a.cool = 0.55; for (let k2 = -2; k2 <= 2; k2++) v(Math.cos(k2 * 0.3) * 600, Math.sin(k2 * 0.3) * 600, 1, 5); sonido('disparoA'); }
  else {
    a.cool = 0.38; const m = enemigoCercano(a), an = m ? ang(a, m) : 0;
    v(Math.cos(an) * 700, Math.sin(an) * 700, 1.6, 6); v(Math.cos(an + 0.2) * 640, Math.sin(an + 0.2) * 640, 1.2, 5); v(Math.cos(an - 0.2) * 640, Math.sin(an - 0.2) * 640, 1.2, 5); sonido('disparoA');
  }
}
function enemigoCercano(a) { let m = null, dm = 1e9; for (const e of EN) { if (e.x < a.x || e.hp <= 0) continue; const d = Math.hypot(e.x - a.x, e.y - a.y); if (d < dm) { dm = d; m = e; } } return m; }
function muereAliado(i, escudo) {
  const a = ALI[i]; ALI.splice(i, 1);
  if (escudo) { onda(P.x, P.y, '#7fe8ff', 110, 0.5, 6); luz(P.x, P.y, 220, '#7fe8ff', 0.8, 0.4); cartel('¡ESCUDO!', a.x, a.y - 36, '#7fe8ff'); sonido('escudo'); }
  explota(a.x, a.y, a.r * 1.3, { col: '#7fe8ff', im: spriteE(a.fac, a.d.spr), tam: a.tam });
}

// ---------- el jugador ----------
function golpeJugador() {   // true si algo ha recibido el golpe
  if (P.inv > 0 || S.rayo) return false;
  S.combo = 0; S.comboT = 0; S.golpesSector++;
  if (S.escudo > 0) {   // la burbuja de escudo se lleva el golpe
    S.escudo--; P.inv = 1.1; onda(P.x, P.y, '#6fc8ff', 120, 0.45, 6); luz(P.x, P.y, 200, '#6fc8ff', 0.8, 0.35); chispas(P.x, P.y, '#bfe9ff', 16, 280); cartel('ESCUDO', P.x, P.y - 52, '#bfe9ff'); sonido('escudo'); vib(30); return true;
  }
  if (ALI.length) { muereAliado(0, true); P.inv = 1.3; return true; }   // el aliado se destruye en tu lugar
  if (S.k > S.k0) {   // sin escudo: pierdes una clase de evolución en vez de una vida
    S.k--; P.inv = 2; explota(P.x, P.y, 46, { col: '#ffd03c' }); onda(P.x, P.y, '#ffd03c', 140, 0.5, 6); sonido('golpe'); cartel('EVOLUCIÓN PERDIDA', P.x, P.y - 50, '#ffd03c'); mensaje('Has bajado a ' + NOMBRE_CLASE[S.k] + '. ¡Busca otro núcleo!'); return true;
  }
  vib(80); S.vidas--; explota(P.x, P.y, 52, { col: '#ff9a3c' }); sonido('golpe'); P.inv = 3.2; P.x = 120; P.y = H / 2; EB.length = 0;
  if (S.vidas <= 0) { S.estado = 'fin'; S.fin = 0; terminar(); musicSet('nvDerrota'); explota(P.x, P.y, 100, { col: '#ff6a2a' }); }
  return true;
}
function disparaJugador() {
  const nv = armaNivel(), x = P.x + 36, d = 1;
  const b = (y, vy, r) => PB.push({ x, y, vx: 760, vy, dmg: d, r: r || 3.5, col: '#8ff0ff', px: x, py: y });
  if (nv === 1) b(P.y, 0); else if (nv === 2) { b(P.y - 8, 0); b(P.y + 8, 0); } else if (nv === 3) { b(P.y - 9, 0); b(P.y + 9, 0); b(P.y, -90); b(P.y, 90); }
  else { b(P.y - 12, 0); b(P.y + 12, 0); b(P.y, 0, 4.5); b(P.y - 4, -70); b(P.y + 4, 70); if (nv >= 5) { b(P.y, -150); b(P.y, 150); } }
  luz(x, P.y, 46, '#8ff0ff', 0.55, 0.06); bola(x + 4, P.y, 15, 0.07); S.disp = (S.disp || 0) + 1; if (S.disp % 3 === 0) sonido('disparo');
}
const armaNivel = () => Math.min(5, (S.puntos >= 5000 ? 3 : S.puntos >= 1500 ? 2 : 1) + Math.ceil(Math.max(0, S.k - S.k0) / 2));
function lanzaBola() {
  if (S.bolas <= 0 || BOLAS.length >= 2) { if (S.bolas <= 0) cartel('SIN BOLAS', P.x, P.y - 40, '#ff9a9a'); return; }
  if (ALI.length >= maxAli() && ALI.every(a => a.d.hb)) { cartel('ESCOLTA LLENA', P.x, P.y - 40, '#ffd03c'); return; }
  S.bolas--; BOLAS.push({ x: P.x + 40, y: P.y, vx: 560, r: 12, t: 0 }); sonido('bola'); onda(P.x + 40, P.y, '#7fe8ff', 40, 0.25, 3);
}
function lanzaRayo() {   // el aliado se sacrifica: se funde con la nave y sale un rayo gigante durante 2 segundos
  if (!ALI.length || S.rayo) return;
  const a = ALI.shift();
  S.rayo = { t: 0, carga: 0.5, col: RAYOCOL[a.fac] || '#1aa8ff', dur: a.tipo === 'acor' ? 3 : 2, dps: a.tipo === 'acor' ? 75 : 46, tipo: a.tipo, w: a.d.rayo, ax: a.x, ay: a.y, en: false, im: spriteE(a.fac, a.d.spr), tam: a.tam };
  onda(a.x, a.y, '#fff', 130, 0.5, 5); luz(a.x, a.y, 240, '#bfefff', 0.9, 0.5); sonido('carga'); cartel('SUPER RAYO', P.x, P.y - 52, '#ffffff');
}
