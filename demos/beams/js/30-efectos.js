// Fans of Beams · Efectos: luces, explosiones, chispas, humo, restos, arcos eléctricos, muertes de los enemigos y las naves gigantes del fondo.
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
// =====================================================================================================================================
// EFECTOS: luces, explosiones, chispas, humo, restos y ondas de choque. Todo lo que brilla se pinta con 'lighter' y luego se le da bloom.
// =====================================================================================================================================
const FUEGO = ['#fff0b8', '#ffc24a', '#ff6a2a', '#a02a10'];
function luz(x, y, r, col, a, dur) { if (S.luces.length < Q.luces * 2) S.luces.push({ x, y, r, col, a, vida: dur, v0: dur }); }
function chispa(x, y, vx, vy, col, vida, w = 2) { if (FX.length < Q.fx) FX.push({ t: 's', x, y, vx, vy, col, vida, v0: vida, w }); }
function ascua(x, y, vx, vy, col, vida, r = 8) { if (FX.length < Q.fx) FX.push({ t: 'e', x, y, vx, vy, col, vida, v0: vida, r }); }
function bola(x, y, r, vida, vx = 0, vy = 0) { if (FX.length < Q.fx) FX.push({ t: 'f', x, y, r, vida, v0: vida, vx, vy }); }
function humo(x, y, r, vida, vx, vy) { if (Q.humo && FX.length < Q.fx) FX.push({ t: 'h', x, y, r, vida, v0: vida, vx, vy }); }
function onda(x, y, col, r1, dur, w = 5) { FX.push({ t: 'o', x, y, col, r1, vida: dur, v0: dur, w }); }
function chispas(x, y, col, n, v = 220) { for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), s = rnd(0.2, 1) * v; chispa(x, y, Math.cos(a) * s, Math.sin(a) * s, col, rnd(0.2, 0.6), rnd(1.5, 3)); } }
// Explosión grande de verdad: destello blanco, bolas de fuego, chispas largas, ascuas, humo, ondas, luz en el fondo y restos del propio sprite.
function explota(x, y, tam, o = {}) {
  const n = tam / 24, col = o.col || '#ff9a3c', vt = Math.min(tam, 110);   // las bolas de fuego no crecen sin límite: si no, las muertes grandes se queman a blanco
  luz(x, y, vt * 6, '#ffb347', Math.min(0.55, 0.3 + n * 0.07), 0.35 + n * 0.04);
  bola(x, y, vt * 1.4, 0.18); bola(x, y, vt * 0.8, 0.1);
  for (let i = 0; i < 3 + Math.min(n, 5); i++) bola(x + rnd(-vt, vt) * 0.5, y + rnd(-vt, vt) * 0.5, vt * rnd(0.6, 1.2), rnd(0.45, 0.95), rnd(-40, 40), rnd(-40, 40));
  const cols = ['#fff6c0', '#ffc04a', '#ff6a2a', col];
  for (let i = 0; i < 12 + vt * 0.9; i++) { const a = rnd(0, 6.283), s = rnd(0.25, 1) * (200 + vt * 7); chispa(x, y, Math.cos(a) * s, Math.sin(a) * s, pick(cols), rnd(0.3, 1.1), rnd(1.5, 3.5)); }
  for (let i = 0; i < 6 + vt * 0.5; i++) { const a = rnd(0, 6.283), s = rnd(0.1, 1) * (80 + vt * 3); ascua(x, y, Math.cos(a) * s, Math.sin(a) * s, pick(cols), rnd(0.6, 1.6), rnd(6, 12)); }
  for (let i = 0; i < 4 + Math.min(n, 6) * 2; i++) humo(x + rnd(-vt, vt) * 0.4, y + rnd(-vt, vt) * 0.4, vt * rnd(0.8, 1.4), rnd(0.9, 1.7), rnd(-30, 30) - 25, rnd(-30, 30));
  onda(x, y, '#fff6d0', tam * 3.6, 0.45, 6); onda(x, y, col, tam * 2.2, 0.7, 4);
  if (o.im && listo(o.im) && Q.deb) {   // el sprite se rompe en trozos que salen volando
    const g = tam > 70 ? 4 : 3, w = o.im.naturalWidth / g, ts = o.tam / g;
    for (let i = 0; i < g; i++) for (let j = 0; j < g; j++) {
      const px = x + ((i + 0.5) / g - 0.5) * o.tam, py = y + ((j + 0.5) / g - 0.5) * o.tam, a = Math.atan2(py - y, px - x) + rnd(-0.5, 0.5), s = rnd(90, 320) * (0.7 + n * 0.12);
      FX.push({ t: 'd', im: o.im, sx: (o.vuelta ? g - 1 - i : i) * w, sy: j * w, sw: w, x: px, y: py, vx: Math.cos(a) * s, vy: Math.sin(a) * s, rot: rnd(0, 6.28), vr: rnd(-8, 8), tam: ts * 1.05, vuelta: o.vuelta, vida: rnd(0.7, 1.5), v0: 1.5, col });
    }
  }
  if (tam >= 50 && !o.mini) empujaRocas(x, y, tam);
  if (o.mini) return;   // impacto pequeño: sin sacudida ni sonido propios
  S.shake = Math.max(S.shake, Math.min(1.6, tam / 55)); if (tam > 55) { S.flash = Math.max(S.flash, Math.min(0.32, tam / 380)); S.freeze = Math.max(S.freeze, 0.05); S.zoom = Math.max(S.zoom, Math.min(0.05, tam / 3000)); }
  sonido(tam > 110 ? 'enorme' : tam > 45 ? 'grande' : 'estalla');
}
function empujaRocas(x, y, tam) {   // una explosión fuerte empuja los asteroides del fondo: salen rodando y chocan entre ellos
  const alcance = tam * 9;
  for (const r of ROCAS_FONDO) {
    const dx = r.x - x, dy = r.y - y, d = Math.max(30, Math.hypot(dx, dy)); if (d > alcance) continue;
    const f = (1 - d / alcance) * tam * 7; r.kx += dx / d * f; r.ky += dy / d * f; r.vr += rnd(-4, 4); r.luz = 1;
  }
}
function suma(pts, x, y, kill) {   // puntos de avance (sin multiplicar) y puntuación con combo
  S.puntos += pts; const m = multi(); S.score += pts * m;
  if (kill) { S.kills++; S.combo++; S.comboT = 2.4; if (S.combo > S.comboMax) S.comboMax = S.combo; const m2 = multi(); if (m2 > m) { cartel('COMBO x' + m2, P.x + 40, P.y - 70, '#ffd03c'); sonido('combo'); } }
  if (S.score >= S.vida1) { S.vida1 += 40000; S.vidas++; cartel('¡VIDA EXTRA!', P.x, P.y - 80, '#8dff9a'); mensaje('¡Vida extra por tu puntuación!'); sonido('evo'); }
}
const multi = () => clamp(1 + Math.floor(S.combo / 4), 1, 10);
function suelta(x, y, tipo = 'evo') { ITEMS.push({ x, y, tipo, vx: -45, t: 0, fase: rnd(0, 6) }); onda(x, y, '#ffd03c', 90, 0.6, 4); luz(x, y, 160, '#ffd03c', 0.7, 0.4); }
function evoluciona() {   // coger un núcleo: la nave sube de clase (con el arte de Nova de esa clase)
  if (S.k >= 5) { suma(1000); S.bolas = Math.min(MAX_BOLAS, S.bolas + 1); cartel('NÚCLEO · +1000', P.x, P.y - 50, '#ffd03c'); sonido('captura'); return; }
  vib([40, 40, 90]); S.k++; P.inv = Math.max(P.inv, 1.6); EB.length = 0;
  onda(P.x, P.y, '#ffffff', 220, 0.6, 8); onda(P.x, P.y, '#ffd03c', 340, 0.9, 5); luz(P.x, P.y, 420, '#ffe9a3', 1, 0.6); bola(P.x, P.y, 120, 0.3);
  for (let i = 0; i < 44; i++) { const a = i / 44 * 6.283; chispa(P.x, P.y, Math.cos(a) * 520, Math.sin(a) * 520, i % 2 ? '#ffe9a3' : '#fff', 0.6, 3); }
  S.flash = Math.max(S.flash, 0.7); S.shake = Math.max(S.shake, 0.6); sonido('evo');
  cartel('¡EVOLUCIÓN!', P.x, P.y - 56, '#ffe9a3'); mensaje('Tu nave evoluciona: ' + NOMBRE_CLASE[S.k].toUpperCase() + (S.k === 3 ? ' · ¡tercera plaza de escolta!' : ''));
}
function arco(x, y, x2, y2, col, dur = 0.28) { if (FX.length < Q.fx) FX.push({ t: 'z', x, y, x2, y2, col, vida: dur, v0: dur }); }
function fragmenta(e, x, y, n) {   // trozos del casco que salen despedidos por donde pega el rayo
  const im = e.tipo === 'rock' ? img('enemigos/' + e.sp + '.png') : spriteE(e.fac, e.d.spr); if (!Q.deb || !listo(im)) return;
  for (let i = 0; i < n; i++) { const w = im.naturalWidth * 0.22; FX.push({ t: 'd', im, sx: rnd(0, im.naturalWidth - w), sy: rnd(0, im.naturalHeight - w), sw: w, x, y, vx: -rnd(120, 520), vy: rnd(-260, 260), rot: rnd(0, 6.28), vr: rnd(-12, 12), tam: Math.max(14, e.d.tam * 0.14), vuelta: e.tipo !== 'rock', vida: rnd(0.5, 1.1), v0: 1.1, col: '#ff8a3c' }); }
}
function cadena(e, col) {   // un enemigo que muere por un rayo descarga arcos eléctricos sobre los que tiene cerca
  let n = 0; for (const o of EN) { if (o === e || o.hp <= 0 || n >= 4) continue; if (Math.hypot(o.x - e.x, o.y - e.y) < 300) { n++; arco(e.x, e.y, o.x, o.y, col, 0.35); daño(o, o.d.hb ? 8 : 3, true); chispas(o.x, o.y, col, 8, 320); onda(o.x, o.y, col, 40, 0.25, 3); } }
  for (let i = 0; i < 5; i++) { const a = rnd(0, 6.283), d = rnd(60, 150); arco(e.x, e.y, e.x + Math.cos(a) * d, e.y + Math.sin(a) * d, col, 0.3); }
  onda(e.x, e.y, '#ffffff', 170, 0.4, 5);
}
// Muerte de un enemigo: no desaparece. Primero un golpe de luz y una explosión; después el casco, ya negro y ardiendo, sigue girando y soltando fuego,
// humo y chispas mientras revienta por dentro en explosiones en cadena, y al final estalla del todo (con trozos de su propio sprite).
function muere(e, rayo) {
  const d = e.d, col = rayo && S.rayo ? S.rayo.col : FACS[e.fac].col, grande = !!d.hb, dur = { zip: 0.32, gun: 0.6, sep: 1.0, cap: 1.7, acor: 2.4, nido: 1.2 }[e.tipo] || 0.4;
  const w = { im: spriteE(e.fac, d.spr), tam: d.tam, r: e.r, x: e.x, y: e.y, vx: -(d.vel || 60) * 0.35 + rnd(-30, 30), vy: rnd(-50, 30), rot: 0, vr: rnd(-1, 1) * (grande ? 0.9 : 7), t: 0, dur, nt: 0, col, grande, rayo };
  WRECKS.push(w);
  explota(e.x, e.y, e.r * (grande ? 0.9 : 0.8), { col });   // el golpe inicial
  if (e.d.pts >= 300) cartel('+' + e.d.pts, e.x, e.y - e.r - 10, '#ffe9a3');
}
function puntoCasco(w) { const a = rnd(0, 6.283), rr = Math.sqrt(Math.random()) * w.tam * (w.grande ? 0.34 : 0.28); return { x: w.x + Math.cos(a) * rr, y: w.y + Math.sin(a) * rr * 0.7 }; }
function mueveRestos(dt) {
  for (const w of WRECKS) {
    w.t += dt; w.x += w.vx * dt; w.y += w.vy * dt; w.vy += 45 * dt; w.vx *= Math.pow(0.7, dt); w.rot += w.vr * dt;
    const p = puntoCasco(w);
    if (Math.random() < 0.9) { bola(p.x, p.y, w.tam * 0.12, 0.3); chispa(p.x, p.y, rnd(-140, 140) + w.vx * 0.3, rnd(-200, 40), pick(['#ffb347', '#ff6a2a', '#fff0c0', w.col]), rnd(0.25, 0.6), 2.2); }
    if (Q.humo && Math.random() < 0.5) humo(p.x, p.y, w.tam * 0.13, 0.9, w.vx * 0.3, -25);
    w.nt -= dt; if (w.nt <= 0) {   // explosiones en cadena por el casco
      w.nt = 0.06 + Math.random() * (w.grande ? 0.1 : 0.14); const q = puntoCasco(w);
      explota(q.x, q.y, w.tam * rnd(0.07, w.grande ? 0.15 : 0.18), { col: w.col, mini: true }); if (w.grande) { onda(q.x, q.y, '#ffd9a0', w.tam * 0.25, 0.3, 3); if (Math.random() < 0.3) sonido('estalla'); }
    }
    if (w.t >= w.dur) {   // la explosión final
      w.fin = true; const big = w.r * (w.rayo ? 1.7 : 1.4);
      explota(w.x, w.y, big, { col: w.col, im: w.im, tam: w.tam, vuelta: true });
      for (let i = 1; i <= 3; i++) onda(w.x, w.y, i === 2 ? w.col : '#fff6d0', big * (2 + i * 1.3), 0.35 + i * 0.18, 5 - i);
      if (w.grande) { luz(w.x, w.y, w.tam * 2.2, '#ffd9a0', 1, 0.6); FX.push({ t: 'fl', x: w.x, y: w.y, ww: w.tam * 0.22, col: w.col, vida: 0.55, v0: 0.55 }); for (let i = 0; i < 18; i++) { const a = rnd(0, 6.283); ascua(w.x, w.y, Math.cos(a) * rnd(60, 280), Math.sin(a) * rnd(60, 280) - 80, pick(['#ffb347', '#ff6a2a', w.col]), rnd(1, 2.2), rnd(8, 16)); } }
    }
  }
  WRECKS = WRECKS.filter(w => !w.fin);
}
function cartel(s, x, y, col = '#fff') { TX.push({ s, x, y, col, vida: 1.3 }); }
function mensaje(s) { S.msg = s; S.msgT = 2.4; }

// ---------- naves gigantes del fondo (como las flotas enormes de la serie Darius): cruzan despacio, con motores encendidos y fuego en el casco ----------
function creaGigante(fac) {
  const spr = pick(['jefe', 'jefe', 'nido', 'capitan']), tam = rnd(1000, 1500);
  GIG.push({ fac, spr, tam, x: W + tam * 0.45, y: rnd(H * 0.3, H * 0.7), vx: -rnd(16, 26), t: 0, fase: rnd(0, 6), fl: [] });
}
function mueveGigantes(dt) {
  for (const g of GIG) {
    g.t += dt; g.x += g.vx * dt;
    if (!g.fl) g.fl = [];
    if (Math.random() < dt * 2.2) { const a = { x: g.x + rnd(-0.35, 0.3) * g.tam, y: g.y + rnd(-0.28, 0.28) * g.tam, vida: rnd(0.25, 0.6), r: rnd(30, 70), v0: 0.6 }; a.v0 = a.vida; g.fl.push(a); if (Math.random() < 0.25) sonido('lejos'); }
    for (const f of g.fl) f.vida -= dt; g.fl = g.fl.filter(f => f.vida > 0);
  }
  GIG = GIG.filter(g => g.fijo || g.x > -g.tam * 0.7);
}
function dibujaGigantes() {
  for (const g of GIG) {
    const im = oscuro(spriteE(g.fac, g.spr), 0.55); if (!im) continue;
    c.save(); c.globalAlpha = g.fijo ? 0.55 : 0.9; c.translate(g.x, g.y); c.scale(-1, 1); c.drawImage(im, -g.tam / 2, -g.tam / 2, g.tam, g.tam); c.restore();
    c.save(); c.globalCompositeOperation = 'lighter';
    const col = FACS[g.fac].col, cola = g.x + g.tam * 0.42;   // los motores, en la popa (a la derecha: mira hacia la izquierda)
    for (let i = -2; i <= 2; i++) { brillo(cola, g.y + i * g.tam * 0.07, g.tam * 0.09 * (0.8 + 0.2 * Math.sin(S.t * 9 + i)), '#ff9a4a', 0.55); }
    brillo(cola, g.y, g.tam * 0.3, col, 0.18);
    for (const f of g.fl || []) { const k = f.vida / f.v0; brillo(f.x, f.y, f.r * (1.4 - k * 0.4), '#ffc060', k * 0.8); brillo(f.x, f.y, f.r * 0.4, '#ffffff', k); }
    c.restore();
  }
}
