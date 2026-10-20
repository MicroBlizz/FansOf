// Fans of Beams · Bucle de la partida: actualiza todo cada cuadro, pasa de sector, daño a los enemigos, récords y bonus.
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
// ---------- bucle ----------
function actualiza(rdt) {
  const lento = S.freeze > 0 && !OPC.pant.suave ? 0 : S.slow > 0 ? 0.3 : 1, dt = rdt * lento;
  if (S.freeze > 0) S.freeze -= rdt; if (S.slow > 0) S.slow -= rdt; S.t += rdt;
  if (S.shake > 0) S.shake -= rdt; if (S.flash > 0) S.flash -= rdt * 1.4; if (S.zoom > 0) S.zoom -= rdt * 0.2;
  for (const e of EST) { e.x -= (30 + e.z * 160) * dt * (S.estado === 'titulo' ? 0.6 : 1); if (e.x < 0) { e.x = W; e.y = rnd(0, H); } }
  for (const n of NEBU) { n.x -= n.z * 120 * dt; if (n.x < -n.r) n.x = W + n.r; }
  for (const r of ROCAS_FONDO) {
    r.x += (-r.z * 160 + r.kx) * dt; r.y += r.ky * dt; r.rot += r.vr * dt; r.kx *= Math.pow(0.35, dt); r.ky *= Math.pow(0.35, dt); r.vr *= Math.pow(0.5, dt); if (r.luz > 0) r.luz -= dt * 1.5;
    if (r.x < -r.tam || r.x > W + 500 || r.y < -400 || r.y > H + 400) { r.x = W + r.tam + rnd(0, 200); r.y = rnd(0, H); r.kx = r.ky = 0; }
  }
  for (let i = 0; i < ROCAS_FONDO.length; i++) for (let j = i + 1; j < ROCAS_FONDO.length; j++) {   // choques entre asteroides
    const a = ROCAS_FONDO[i], b = ROCAS_FONDO[j]; if (a.x < -20 || b.x < -20 || a.x > W + 20 || b.x > W + 20) continue;
    const ra = a.tam * 0.4, rb = b.tam * 0.4, dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy); if (d > ra + rb || d < 1) continue;
    const vr = Math.hypot(a.kx - b.kx, a.ky - b.ky); if (vr < 90) continue;   // solo cuando alguno va lanzado
    const mx = a.x + dx / d * ra, my = a.y + dy / d * ra, ka = rb / (ra + rb);
    [a.kx, b.kx] = [b.kx * 0.7 + a.kx * 0.2, a.kx * 0.7 + b.kx * 0.2]; [a.ky, b.ky] = [b.ky * 0.7 + a.ky * 0.2, a.ky * 0.7 + b.ky * 0.2];
    a.x -= dx / d * 6; b.x += dx / d * 6; a.luz = b.luz = 1;
    for (let k = 0; k < 12; k++) { const an = rnd(0, 6.283), v = rnd(80, 360); chispa(mx, my, Math.cos(an) * v, Math.sin(an) * v, pick(['#fff6c0', '#ffc04a', '#ff6a2a']), rnd(0.25, 0.7), 2.5); }
    bola(mx, my, 26 + vr * 0.08, 0.3); luz(mx, my, 150, '#ffb347', 0.6, 0.25); sonido('lejos');
    if (vr > 260) for (const q of [Math.random() < 0.5 ? a : b]) {   // un choque fuerte parte el asteroide en trozos
      explota(q.x, q.y, q.tam * 0.3, { col: '#ffb347', im: img('enemigos/asteroide' + (q.n > 1 ? '-' + q.n : '') + '.png'), tam: q.tam });
      q.x = W + q.tam + rnd(300, 900); q.y = rnd(0, H); q.kx = q.ky = 0;
    }
  }
  for (const p of PLANETAS) { p.x -= p.z * 120 * dt; if (p.x < -p.anc) p.x = W + p.anc + rnd(1200, 2400); }
  mueveGigantes(dt);
  if (S.estado !== 'titulo' && !S.jefe && S.banner <= 2.6) { S.gigT -= dt; if (S.gigT <= 0 && GIG.length < 2) { creaGigante(S.fac); S.gigT = rnd(14, 24); } }
  for (const f of FX) {
    f.vida -= dt;
    if (f.t === 's' || f.t === 'e' || f.t === 'f' || f.t === 'h' || f.t === 'd') { f.x += (f.vx || 0) * dt; f.y += (f.vy || 0) * dt; const fr = f.t === 's' ? 0.965 : f.t === 'd' ? 0.985 : 0.95; f.vx *= fr; f.vy *= fr; if (f.t === 'd') f.rot += f.vr * dt; }
    if (f.t === 'd' && Math.random() < 0.25 * dt * 60) FX.push({ t: 'e', x: f.x, y: f.y, vx: 0, vy: 0, col: '#ff8a3c', vida: 0.3, v0: 0.3, r: 5 });
  }
  FX = FX.filter(f => f.vida > 0);
  for (const l of S.luces) l.vida -= dt; S.luces = S.luces.filter(l => l.vida > 0);
  for (const t of TX) { t.vida -= rdt; t.y -= 26 * rdt; } TX = TX.filter(t => t.vida > 0);
  if (FIJA.m) { mudo = !mudo; if (AC) applyVolume(); }
  if (S.estado === 'titulo') {
    if (PU.der) cambiaFac(1); if (PU.izq) cambiaFac(-1); if (PU.arr) cambiaClase(1); if (PU.abj) cambiaClase(-1); if (FIJA.f) cambiaDif(1);
    if (FIJA.Enter || PU.disp) empieza(); else if (FIJA.o) abreOpciones('titulo'); return;
  }
  if (S.estado === 'opciones') { if (!ESPERA) { navUI(); if (FIJA.Escape || PU.pausa) cierraOpciones(); } return; }
  if (S.estado === 'editaT') { if (FIJA.Escape || PU.pausa) { guardaOpc(); S.estado = 'opciones'; } return; }
  if (S.estado === 'tuto') { if (FIJA.Enter || PU.disp) tutoSig(); else if (FIJA.Escape || PU.pausa) tutoFin(); return; }
  if (S.estado === 'pausa') { navUI(); if (PU.pausa || FIJA.Escape) S.estado = 'jugando'; return; }
  if (S.estado === 'fin' || S.estado === 'victoria') { S.fin += rdt; if ((FIJA.r || FIJA.Enter || PU.disp) && S.fin > 0.8) volverMenu(); return; }
  if (PU.pausa || FIJA.Escape) { S.estado = 'pausa'; UI.foco = 0; return; }
  if (S.msgT > 0) S.msgT -= rdt; if (S.banner > 0) S.banner -= rdt;
  // jugador
  let mx = ((KH.der || TH.der) ? 1 : 0) - ((KH.izq || TH.izq) ? 1 : 0) + PAD.mx + TV.x, my = ((KH.abj || TH.abj) ? 1 : 0) - ((KH.arr || TH.arr) ? 1 : 0) + PAD.my + TV.y; const mm = Math.hypot(mx, my); if (mm > 1) { mx /= mm; my /= mm; }
  // inercia: acelera y frena con holgura (más rápido al frenar que al arrancar, para que siga siendo preciso); muelle de inclinación que oscila al parar
  const ka = 1 - Math.exp(-(mx || my ? 9 : 6.5) * dt); P.vx += (mx * P.vel - P.vx) * ka; P.vy += (my * P.vel - P.vy) * ka;
  P.ang = P.ang || 0; P.angv = P.angv || 0; P.empuje = P.empuje || 0;
  P.angv += ((P.vy / P.vel) * 0.2 - P.ang) * 80 * dt - P.angv * 11 * dt; P.ang += P.angv * dt;
  P.empuje += (Math.max(0, P.vx / P.vel) - P.empuje) * (1 - Math.exp(-8 * dt));
  P.x = clamp(P.x + P.vx * dt, 50, W - 60); P.y = clamp(P.y + P.vy * dt, 30, H - 30);
  if (P.inv > 0) P.inv -= dt;
  if (S.rayo) P.inv = Math.max(P.inv, 0.1);
  P.cool -= dt; if ((act('disp') || autoFuego()) && P.cool <= 0 && !S.rayo && S.estado === 'jugando') { P.cool = 0.1; disparaJugador(); }
  if (PU.capt) lanzaBola();
  if (PU.rayo) lanzaRayo();
  S.bolaT += dt; if (S.bolas < MAX_BOLAS && S.bolaT > S.D.regen) { S.bolas++; S.bolaT = 0; }
  if (S.bolas >= MAX_BOLAS) S.bolaT = 0;
  // llama del motor
  if (Math.random() < 0.9) { const nv = S.navePrev || nave(S.nave, S.k), w = nv ? nv.lw : 80; chispa(P.x - w / 2 + 6, P.y + rnd(-4, 4), -rnd(120, 260), rnd(-30, 30), pick(['#ffd27a', '#ff8a3c', '#fff0b0']), rnd(0.12, 0.28), 2); }
  // núcleos de evolución: aparecen de vez en cuando y los minijefes destruidos sueltan uno
  S.itemT -= dt; if (S.itemT <= 0 && !S.jefe && S.banner <= 0) { S.itemT = rnd(85, 115) / S.D.nucleo; suelta(W + 30, rnd(100, H - 100)); }
  for (const it of ITEMS) { it.t += dt; it.x += it.vx * dt; it.y += Math.sin(it.t * 2 + it.fase) * 28 * dt; if (Math.hypot(it.x - P.x, it.y - P.y) < 38) { it.dead = true; if (it.tipo === 'escudo') { S.escudo = Math.min(2, S.escudo + 1); onda(P.x, P.y, '#6fc8ff', 110, 0.45, 5); cartel('ESCUDO +1', P.x, P.y - 52, '#bfe9ff'); sonido('escudo'); } else evoluciona(); } }
  S.escT -= dt; if (S.escT <= 0 && !S.jefe && S.banner <= 0) { S.escT = rnd(85, 115) / S.D.nucleo; suelta(W + 30, rnd(100, H - 100), 'escudo'); }
  ITEMS = ITEMS.filter(it => !it.dead && it.x > -50);
  S.preT -= dt; if (S.preT <= 0) { S.preT = 1; if (S.k < 5) nave(S.nave, S.k + 1); }
  // aparición de enemigos
  const prog = S.puntos - S.ini;
  if (!S.jefe && S.banner <= 0) {
    if (tSector() >= duracion() && S.aviso === 0) { S.aviso = 3.2; sonido('aviso'); }
    if (S.aviso > 0) { S.aviso -= dt; if (S.aviso <= 0) { S.aviso = -1; creaJefe(); } }
    else if (S.aviso === 0) {
      S.sp -= dt; if (S.sp <= 0) oleada();
      S.rocaT -= dt; if (S.rocaT <= 0) { S.rocaT = rnd(4, 8); creaRoca(false); }
      if (S.lluvia > 0) { S.lluvia -= dt; S.lluviaT -= dt; if (S.lluviaT <= 0) { S.lluviaT = 0.3; creaRoca(true); } }
    }
  } else if (S.jefe && S.jefe.hp > 0) { S.sp -= dt; if (S.sp <= 0) { S.sp = 4; crea('zip', W + 40, rnd(90, H - 90), { amp: 40, inv: 1 }); } }
  // enemigos
  for (const e of EN) { if (e.tipo === 'boss') { if (e.hp > 0) mueveJefe(e, dt); } else mueveEnemigo(e, dt); }
  if (S.comboT > 0) { S.comboT -= dt; if (S.comboT <= 0) S.combo = 0; }
  mueveRestos(dt);
  for (const e of EN) if (e.heat > 0) e.heat -= dt;
  EN = EN.filter(e => (e.hp > 0 || e.tipo === 'boss') && e.x > -e.d.tam);
  // disparos propios
  for (const b of PB) {
    b.px = b.x; b.py = b.y;
    if (b.hom) {   // misil teledirigido: gira hacia el enemigo más cercano
      const m = enemigoCercano({ x: b.x - 80, y: b.y }); b.hom -= dt; if (b.hom < 0) b.dead = true;
      if (m) { const t = ang(b, m), a0 = Math.atan2(b.vy, b.vx), d = Math.atan2(Math.sin(t - a0), Math.cos(t - a0)), a1 = a0 + clamp(d, -7 * dt, 7 * dt), v = Math.min(620, Math.hypot(b.vx, b.vy) + 900 * dt); b.vx = Math.cos(a1) * v; b.vy = Math.sin(a1) * v; }
      if (Math.random() < 0.8) chispa(b.x, b.y, -b.vx * 0.2, -b.vy * 0.2, '#ffb347', 0.25, 2.5);
    }
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (!b.aliado && !b.hom && Math.random() < 0.3) chispa(b.x - 12, b.y + rnd(-3, 3), -rnd(40, 160), rnd(-50, 50), b.col, rnd(0.12, 0.3), 1.6);
  }
  for (const b of PB) for (const e of EN) {
    if (b.dead || e.hp <= 0) continue;
    if (choca(e, b.x, b.y, b.r)) { b.dead = true; daño(e, b.dmg); chispas(b.x, b.y, b.col, 5, 180); bola(b.x, b.y, 20, 0.12); onda(b.x, b.y, b.col, 30, 0.18, 2); }
  }
  PB = PB.filter(b => !b.dead && b.x < W + 30 && b.x > -30 && b.y > -30 && b.y < H + 30);
  // bolas de captura
  for (const b of BOLAS) {
    b.t += dt; b.x += b.vx * dt;
    if (Math.random() < 0.9) { const a = rnd(0, 6.283); chispa(b.x, b.y, Math.cos(a) * 90 - 120, Math.sin(a) * 90, '#7fe8ff', 0.4, 2); }
    for (const e of EN) {
      if (b.dead || e.hp <= 0) continue;
      if (!choca(e, b.x, b.y, b.r)) continue;
      b.dead = true;
      if ((e.d.cap === true || (e.d.cap === 'mitad' && e.hp <= e.hpMax * 0.5)) && captura(e)) { /* capturado */ }
      else if (e.d.cap === true || e.d.cap === 'mitad' && e.hp <= e.hpMax * 0.5) { sonido('rebote'); cartel('ESCOLTA LLENA', e.x - 30, e.y - 40, '#ffd03c'); }
      else { sonido('rebote'); chispas(b.x, b.y, '#ffd03c', 12, 220); onda(b.x, b.y, '#ffd03c', 50, 0.3, 3); cartel(e.d.cap === 'mitad' ? 'ARMADURA' : 'NO SE PUEDE', e.x - 30, e.y - e.r - 10, '#ffd03c'); }
    }
    if (b.x > W + 30) { b.dead = true; S.bolas = Math.min(MAX_BOLAS, S.bolas + 1); }   // si falla, la bola vuelve a la nave
  }
  BOLAS = BOLAS.filter(b => !b.dead);
  // aliados
  ALI.forEach((a, i) => mueveAliado(a, i, dt));
  // disparos enemigos
  for (const b of EB) { b.px = b.x; b.py = b.y; b.x += b.vx * dt; b.y += b.vy * dt; }
  for (const b of EB) {
    if (b.dead) continue;
    for (let i = 0; i < ALI.length; i++) { const a = ALI[i]; if (Math.hypot(b.x - a.x, b.y - a.y) < a.r + b.r) { b.dead = true; a.hp--; a.flash = 0.12; chispas(b.x, b.y, '#7fe8ff', 6, 160); if (a.hp <= 0) muereAliado(i, false); break; } }
    if (b.dead) continue;
    if (Math.hypot(b.x - P.x, b.y - P.y) < P.r + b.r) { if (golpeJugador()) b.dead = true; }
  }
  EB = EB.filter(b => !b.dead && b.x > -30 && b.x < W + 30 && b.y > -30 && b.y < H + 30);
  // choque nave-enemigo (y aliado-enemigo)
  for (const e of EN) {
    if (e.hp <= 0 || e.tipo === 'boss' && e.estado === 'entra') continue;
    const frag = !e.d.hb || e.tipo === 'zip';
    if (choca(e, P.x, P.y, P.r, 0.8)) { if (golpeJugador() && frag) daño(e, 99); }
    for (let i = 0; i < ALI.length; i++) { const a = ALI[i]; if (e.hp > 0 && choca(e, a.x, a.y, a.r * 0.6, 0.8)) { a.hp -= 2; a.flash = 0.12; if (frag) daño(e, 99); if (a.hp <= 0) { muereAliado(i, false); break; } } }
  }
  // rayo del jugador
  if (S.rayo) {
    const r = S.rayo; r.t += dt; const tx = P.x + 40, ty = P.y;
    if (r.t < r.carga) {
      r.ax += (tx - r.ax) * (1 - Math.exp(-14 * dt)); r.ay += (ty - r.ay) * (1 - Math.exp(-14 * dt));
      if (Math.random() < 0.8) { const a = rnd(0, 6.283), d = rnd(60, 120); chispa(tx + Math.cos(a) * d, ty + Math.sin(a) * d, -Math.cos(a) * 380, -Math.sin(a) * 380, '#fff', 0.25, 2); }
    } else {
      if (!r.en) { r.en = true; vib(120); sonido('rayo'); S.shake = 2; S.flash = 0.3; luz(tx, ty, 380, '#bfefff', 0.7, 0.4); onda(tx, ty, '#fff', 200, 0.4, 8); if (r.tipo === 'sep') { EB.length = 0; onda(tx, ty, '#ffb347', 700, 0.8, 10); } if (r.tipo === 'cap') for (let i = 0; i < 10; i++) PB.push({ x: tx, y: ty, vx: 200 + i * 20, vy: (i - 4.5) * 90, dmg: 2.5, r: 5, col: '#ffd03c', aliado: true, hom: 3, px: tx, py: ty }); for (let i = 0; i < 40; i++) chispa(tx, ty, rnd(100, 900), rnd(-260, 260), '#fff', rnd(0.3, 0.8), 2.5); }
      S.shake = Math.max(S.shake, 0.35);
      for (let i = 0; i < 4; i++) chispa(rnd(tx, W), ty + rnd(-r.w / 2, r.w / 2), rnd(-60, 60), rnd(-260, 260), pick(['#ffffff', '#bfefff', '#7fe8ff']), rnd(0.2, 0.5), 2);
      if (Math.random() < 0.6) chispa(tx + rnd(0, 120), ty + rnd(-r.w / 2, r.w / 2), rnd(300, 900), rnd(-80, 80), '#fff', 0.35, 3);
      r.arcT = (r.arcT || 0) - dt;
      for (const e of EN) if (e.hp > 0 && tocaBanda(e, tx, ty, r.w)) {
        daño(e, r.dps * dt, true); e.heat = 0.3; e.heatCol = r.col; e.hitT = (e.hitT || 0) - dt;
        const grande = !!e.d.hb, ix = Math.max(tx + 30, e.x - (grande ? e.d.tam * 0.36 : e.r * 0.8)), iy = clamp(ty + rnd(-r.w / 2, r.w / 2) * 0.7, e.y - e.r, e.y + e.r);
        for (let i = 0; i < (grande ? 4 : 2); i++) chispa(ix, iy, -rnd(150, 800), rnd(-340, 340), pick([r.col, '#ffffff', '#ffd9a0']), rnd(0.15, 0.5), 2.6);
        if (Math.random() < 0.7) ascua(ix, iy, -rnd(20, 200), rnd(-80, 140), pick(['#ffb347', '#ff6a2a', r.col]), rnd(0.4, 0.9), rnd(6, 12));
        if (e.hitT <= 0) { e.hitT = 0.09; onda(ix, iy, r.col, grande ? 70 : 44, 0.22, 3); bola(ix, iy, grande ? 38 : 24, 0.16); luz(ix, iy, 120, r.col, 0.5, 0.15); if (grande) { fragmenta(e, ix, iy, 2); if (Math.random() < 0.45) explota(ix + rnd(-26, 26), iy + rnd(-26, 26), rnd(14, 26), { col: r.col, mini: true }); } else fragmenta(e, ix, iy, 1); }
      }
      if (r.arcT <= 0) {   // relámpagos que saltan del rayo a los enemigos de al lado
        r.arcT = 0.11; const cand = EN.filter(e => e.hp > 0 && !tocaBanda(e, tx, ty, r.w) && e.x > tx && Math.abs(e.y - ty) < r.w / 2 + 280);
        if (cand.length) { const e = pick(cand), px = clamp(e.x, tx + 60, W), py = ty + rnd(-r.w / 3, r.w / 3); arco(px, py, e.x, e.y, r.col, 0.22); daño(e, 5, true); e.heat = 0.2; e.heatCol = r.col; chispas(e.x, e.y, r.col, 5, 260); }
      }
      for (const b of EB) if (b.x > tx && Math.abs(b.y - ty) < r.w / 2 + 4) { b.dead = true; chispas(b.x, b.y, '#fff', 3, 160); }
      if (r.t >= r.carga + r.dur) { S.rayo = null; P.inv = Math.max(P.inv, 0.8); onda(tx, ty, '#bfefff', 120, 0.4, 5); }
    }
  }
  // el rayo gigante del jefe hace daño (y se lleva por delante al aliado que te cubra)
  if (S.jefe && S.jefe.hp > 0 && S.jefe.rayo && S.jefe.rayo.on) { const r = S.jefe.rayo, x1 = S.jefe.x - S.jefe.d.tam * 0.4; if (Math.abs(P.y - r.y) < 65 + P.r && P.x < x1 && golpeJugador()) P.inv = Math.max(P.inv, 3.0 - r.t + 0.25); }   // un rayo, un solo golpe
  // final del jefe: explosiones en cadena a cámara lenta y luego el siguiente sector
  if (S.jefe && S.jefe.hp <= 0 && S.estado === 'jugando') {
    const j = S.jefe; j.muerto = (j.muerto || 0) + rdt; S.slow = Math.max(S.slow, 0.1);
    if (Math.random() < 0.6) explota(j.x + rnd(-150, 150), j.y + rnd(-120, 120), rnd(26, 70), { col: FACS[j.fac].col });
    EB.length = 0;
    if (j.muerto > 2.4 && !j.fin) {
      j.fin = true; explota(j.x, j.y, 260, { col: FACS[j.fac].col, im: spriteE(j.fac, 'jefe'), tam: j.d.tam, vuelta: true }); S.flash = 1; S.shake = 2.5; S.slow = 1.2;
      EN = EN.filter(e => e !== j); S.jefe = null;
      const sin = bonusSector();
      if (S.sector + 1 >= SECTORES) { S.estado = 'victoria'; S.fin = 0; terminar(); musicSet('nvVictoria'); }
      else { siguienteSector(); mensaje('SECTOR SUPERADO' + (sin ? ' · ¡SIN DAÑO!' : '') + ' · ¡Sigue!'); }
    }
  }
}
function siguienteSector() {
  if (S.vidas < S.D.vidas) { S.vidas++; cartel('+1 VIDA', P.x, P.y - 60, '#8dff9a'); }   // un respiro: te devuelve una vida si has perdido alguna
  S.campo = false;
  S.sector++; S.t0s = S.t; S.fac = S.orden[S.sector % S.orden.length]; precarga(S.orden[(S.sector + 1) % S.orden.length]); S.ini = S.puntos; S.capitan = false; S.acor = false; S.aviso = 0; S.sp = 2; S.oleada = 0; S.banner = 3.4; S.gigT = 1;
  S.bolas = MAX_BOLAS; EN = EN.filter(e => e.tipo === 'boss'); sonido('sector'); musicSet('nvMision');
}
let REC = { score: 0, sector: 0, tiempo: 0 };
try { const g = JSON.parse(localStorage.getItem('fobeams-records') || 'null'); if (g) REC = Object.assign(REC, g); } catch (e) { /* sin almacenamiento */ }
function bonusSector() {   // al derrotar a un jefe: bonus fijo y otro más grande si no te han tocado en todo el sector
  const sin = S.golpesSector === 0, b = 3000 + (sin ? 5000 : 0); S.score += b; S.bonus += b; S.golpesSector = 0;
  cartel('+' + b + (sin ? ' · SIN DAÑO' : ''), W / 2, H / 2 - 120, sin ? '#8dff9a' : '#ffe9a3'); return sin;
}
function terminar() {   // fin de la partida: récord guardado y datos para el resumen
  S.nuevoRecord = S.score > REC.score; if (S.nuevoRecord) { REC.score = Math.floor(S.score); }
  if (S.sector + 1 > REC.sector) REC.sector = S.sector + 1; if (S.estado === 'victoria' && (!REC.tiempo || S.t < REC.tiempo)) REC.tiempo = Math.floor(S.t);
  try { localStorage.setItem('fobeams-records', JSON.stringify(REC)); } catch (e) { /* vale hasta cerrar */ }
}
function guardaEleccion() { try { localStorage.setItem('fobeams-nave', JSON.stringify(ELEG)); } catch (e) { /* sin almacenamiento */ } }
function daño(e, d, rayo) {
  if (e.hp <= 0) return; if (e.tipo === 'boss' && e.estado === 'entra') return;
  e.hp -= d; e.flash = 0.06;
  if (e.hp <= 0) {
    suma(e.d.pts, e.x, e.y, true); e.hp = e.tipo === 'boss' ? 0 : -1; if (e.tipo === 'gun' && Math.random() < 0.14) suelta(e.x, e.y, 'escudo'); if (e.tipo === 'sep' && Math.random() < 0.5) suelta(e.x, e.y, 'escudo'); if (e.tipo === 'cap' || e.tipo === 'acor') suelta(e.x, e.y); if (rayo && S.rayo) cadena(e, S.rayo.col);
    if (e.tipo !== 'boss') { const im = e.tipo === 'rock' ? img('enemigos/' + e.sp + '.png') : spriteE(e.fac, e.d.spr); if (e.tipo === 'rock') explota(e.x, e.y, e.r * 1.25, { col: '#ffb347', im, tam: e.d.tam, vuelta: false }); else muere(e, rayo); }
    else cartel('+6000', e.x, e.y - 150, '#ffe9a3');
  } else if ((e.tipo === 'cap' || e.tipo === 'sep' || e.tipo === 'acor') && !e.roto && e.hp <= e.hpMax * 0.5) { e.roto = true; cartel('¡ARMADURA ROTA! CAPTÚRALO', e.x - 40, e.y - e.r - 20, '#ffd03c'); mensaje('Armadura rota: ahora sí se puede capturar (X)'); onda(e.x, e.y, '#ffd03c', 160, 0.5, 5); luz(e.x, e.y, 260, '#ffd03c', 0.8, 0.4); chispas(e.x, e.y, '#ffd03c', 30, 360); }
}
