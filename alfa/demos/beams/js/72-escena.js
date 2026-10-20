// Fans of Beams · Dibujo de la escena: composición final con brillo (bloom), enemigos, aliados, rayos, disparos, efectos y la nave del jugador.
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
function dibuja() {
  UI.prev = UI.hits; UI.hits = [];
  c = escC; c.setTransform(Q.esc, 0, 0, Q.esc, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  c.save();
  if (S.zoom > 0 && !OPC.pant.suave) { c.translate(W / 2, H / 2); c.scale(1 + S.zoom, 1 + S.zoom); c.translate(-W / 2, -H / 2); }
  if (S.shake > 0 && OPC.pant.sacudida) c.translate(rnd(-1, 1) * Math.min(S.shake, 1.2) * 9, rnd(-1, 1) * Math.min(S.shake, 1.2) * 9);
  dibujaFondo();
  const base = (S.estado === 'opciones' || S.estado === 'editaT') ? S.opc.volver : S.estado;
  if (base === 'titulo') dibujaTitulo(); else dibujaEscena();
  c.restore();
  // composición final: la escena + bloom (copias pequeñas desenfocadas sumadas encima) + viñeta + destello
  const m = cv.getContext('2d'); m.setTransform(Rk, 0, 0, Rk, 0, 0); m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1; m.imageSmoothingEnabled = true; m.imageSmoothingQuality = 'high'; m.drawImage(esc, 0, 0, W, H);
  if (Q.bloom > 0) { const g1 = b1.getContext('2d'); g1.clearRect(0, 0, b1.width, b1.height); g1.drawImage(esc, 0, 0, b1.width, b1.height); const g2 = b2.getContext('2d'); g2.clearRect(0, 0, b2.width, b2.height); g2.drawImage(b1, 0, 0, b2.width, b2.height); }
  if (Q.bloom > 0) { const bk = S.rayo && S.rayo.en ? 0.45 : 1; m.globalCompositeOperation = 'lighter'; if (Q.bloom > 1) { m.globalAlpha = 0.2 * bk; m.drawImage(b1, 0, 0, W, H); } m.globalAlpha = 0.27 * bk; m.drawImage(b2, 0, 0, W, H); if (Q.bloom > 1) { m.globalAlpha = 0.14 * bk; m.drawImage(b2, -30, -17, W + 60, H + 34); } }
  m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1; m.drawImage(VIGNETA, 0, 0, W, H);
  if (S.flash > 0) { m.globalCompositeOperation = 'lighter'; m.globalAlpha = Math.min(0.45, S.flash * 0.6) * (OPC.pant.suave ? 0.3 : 1); m.fillStyle = '#fff'; m.fillRect(0, 0, W, H); m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1; }
  for (const q of TQ) { m.globalAlpha = q[7]; pintaTxt(m, q[0], q[1], q[2], q[3], q[4], q[5], q[6]); } TQ.length = 0; m.globalAlpha = 1;   // el texto de la escena, nítido y encima del brillo
  c = m; if (base !== 'titulo') { dibujaHud(); dibujaTactil(false); }
  if (S.estado === 'tuto') dibujaTuto();
  if (S.estado === 'opciones') dibujaOpciones(); else if (S.estado === 'editaT') dibujaEditaT();
  if (OPC.pant.fps) txt('FPS ' + Math.round(fpsEma) + ' · ' + Q.n, 10, H - 14, 13, '#9cffb0', 'left', { f: 'mini' });
  if (innerHeight > innerWidth * 1.1) { c.fillStyle = 'rgba(4,7,18,0.94)'; c.fillRect(0, 0, W, H); txt('GIRA EL MÓVIL', W / 2, H / 2 - 20, 56, '#7fe8ff', 'center', { f: 'logo' }); txt('Fans of Beams se juega en horizontal', W / 2, H / 2 + 40, 22, '#ffffff'); }
  c = escC;
}
function dibujaEscena() {
  const jugando = S.estado !== 'fin';
  // humo (se pinta normal, debajo de lo que brilla)
  for (const f of FX) if (f.t === 'h') { const k = f.vida / f.v0, r = f.r * (1.4 - k * 0.4); c.globalAlpha = 0.55 * k; c.drawImage(HUMO, f.x - r, f.y - r, r * 2, r * 2); }
  c.globalAlpha = 1;
  // rayo del jefe (debajo de todo)
  const bj = S.jefe;
  if (bj && bj.rayo && bj.hp > 0) {
    const r = bj.rayo, x1 = bj.x - bj.d.tam * 0.4;
    if (r.t < 1.7) { c.save(); c.strokeStyle = r.t < 1.0 ? 'rgba(255,80,80,0.55)' : 'rgba(255,255,255,' + (0.5 + 0.5 * Math.sin(S.t * 40)) + ')'; c.lineWidth = r.t < 1.0 ? 2 : 4; c.setLineDash([14, 10]); c.beginPath(); c.moveTo(x1, r.y); c.lineTo(0, r.y); c.stroke(); c.setLineDash([]); c.globalCompositeOperation = 'lighter'; brillo(x1, r.y, 50 + r.t * 40, '#ff3b3b', 0.4 + r.t * 0.3); c.restore(); }
    else if (r.on) rayoGrande(x1, 0, r.y, 130, '#ff3b3b', 0.95, Math.min(1, (r.t - 1.7) * 6, (3 - r.t) * 6));
  }
  // enemigos
  for (const e of EN) {
    if (e.hp <= 0 && e.tipo !== 'boss') continue;
    if (e.tipo === 'rock') {
      const im = img('enemigos/' + e.sp + '.png'); dibujaSpr(im, e.x, e.y, e.r * 2.7, false, e.flash, e.rot);
      if (e.fuego) { c.save(); c.globalCompositeOperation = 'lighter'; brillo(e.x + e.r * 0.5, e.y, e.r * 2.4, '#ff7a2a', 0.22); c.restore(); }
      continue;
    }
    const im = spriteE(e.fac, e.d.spr), ent = e.tipo === 'boss' && e.estado === 'entra' ? 1 + Math.max(0, e.x - (W - 200)) / 700 : 1;
    if (e.tipo === 'boss' && e.hp <= 0) { dibujaSpr(im, e.x + rnd(-3, 3), e.y + rnd(-3, 3), e.d.tam, true, 0.1); continue; }
    const jx = e.heat > 0 ? rnd(-3, 3) : 0, jy = e.heat > 0 ? rnd(-3, 3) : 0;
    dibujaSpr(im, e.x + jx, e.y + jy, e.d.tam * ent, true, e.heat > 0 ? Math.max(e.flash, 0.05) : e.flash);
    if (e.heat > 0) { c.save(); c.globalCompositeOperation = 'lighter'; brillo(e.x, e.y, e.d.tam * 0.5, e.heatCol, Math.min(0.32, e.heat * 1.4)); brillo(e.x - e.r * 0.4, e.y, e.r * 1.3, '#ffffff', Math.min(0.18, e.heat * 0.8)); c.restore(); }
    c.save(); c.globalCompositeOperation = 'lighter'; brillo(e.x - e.r * 0.3, e.y, e.r * 1.6, FACS[e.fac].col, 0.045 + 0.015 * Math.sin(S.t * 5 + e.fase)); if (e.tipo === 'boss') brillo(e.x + e.d.tam * 0.38, e.y, e.d.tam * 0.25, '#ff9a4a', 0.16 + 0.04 * Math.sin(S.t * 9)); c.restore();
    if (e.d.cap === 'mitad' && !e.roto) { c.save(); c.strokeStyle = 'rgba(255,208,60,0.6)'; c.lineWidth = 3; c.setLineDash([8, 6]); c.lineDashOffset = -S.t * 20; c.beginPath(); c.arc(e.x, e.y, e.r + 8, 0, 6.28); c.stroke(); c.restore(); }
    if (e.tipo === 'cap' || e.tipo === 'sep' || e.tipo === 'nido' || e.tipo === 'acor') barra(e.x - 50, e.y + e.d.tam * 0.36, 100, e.hp / e.hpMax, e.roto ? '#7fe8ff' : '#ffd03c');
  }
  for (const w of WRECKS) {   // el casco destruido: ennegrecido, girando y al rojo vivo
    const k = Math.min(1, w.t / w.dur), im = oscuro(w.im, k < 0.34 ? 0.25 : k < 0.67 ? 0.45 : 0.65);
    c.save(); c.translate(w.x + rnd(-1.5, 1.5), w.y + rnd(-1.5, 1.5)); c.rotate(w.rot); c.scale(-1, 1); if (im) c.drawImage(im, -w.tam / 2, -w.tam / 2, w.tam, w.tam); c.restore();
    c.save(); c.globalCompositeOperation = 'lighter'; brillo(w.x, w.y, w.tam * (0.42 + 0.08 * Math.sin(w.t * 40)), '#ff7a2a', 0.14 + 0.3 * k); if (Math.random() < 0.4) brillo(w.x + rnd(-w.tam * 0.25, w.tam * 0.25), w.y + rnd(-w.tam * 0.2, w.tam * 0.2), w.tam * 0.1, '#ffd9a0', 0.55); c.restore();
  }
  // aliados
  ALI.forEach((a, i) => {
    c.save();
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = '#7fe8ff'; c.globalAlpha = 0.28 + 0.12 * Math.sin(S.t * 8 + i); c.lineWidth = 2; c.beginPath(); c.moveTo(P.x, P.y); c.lineTo(a.x, a.y); c.stroke();   // el enlace con tu nave
    brillo(a.x, a.y, a.r * 2.4, '#7fe8ff', 0.4 + 0.15 * Math.sin(S.t * 6 + i)); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    dibujaSpr(spriteE(a.fac, a.d.spr), a.x, a.y, a.tam, false, a.flash);
    c.strokeStyle = 'rgba(127,232,255,' + (0.55 + 0.3 * Math.sin(S.t * 6 + i)) + ')'; c.lineWidth = 2.5; c.beginPath(); c.arc(a.x, a.y, a.r + 6, 0, 6.28); c.stroke();
    for (let k = 0; k < a.hpMax; k++) { c.fillStyle = k < a.hp ? '#7fe8ff' : '#26405a'; c.fillRect(a.x - a.hpMax * 3.5 + k * 7, a.y + a.r + 12, 5, 4); }
    c.restore();
  });
  for (const a of ALI) if (a.rayOn > 0) rayoGrande(a.x + a.tam / 2, W + 20, a.y, 62, '#ffb347', 0.9, Math.min(1, a.rayOn * 6, (1 - a.rayOn) * 8 + 0.3));
  // rayo del jugador
  if (S.rayo) {
    const r = S.rayo, tx = P.x + 40;
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.035 * (r.t > r.carga ? 1 : 0); c.fillStyle = '#bfefff'; c.fillRect(0, 0, W, H); c.restore();   // el rayo ilumina toda la pantalla
    if (r.t < r.carga) {
      const k = r.t / r.carga; dibujaSpr(r.im, r.ax, r.ay, r.tam * (1 - k * 0.5), false, 0.1);
      c.save(); c.globalCompositeOperation = 'lighter'; brillo(r.ax, r.ay, 40 + k * 80, '#bfefff', 0.6 + k * 0.4); brillo(tx, P.y, 40 + k * 100, '#ffffff', 0.4 + k * 0.5); c.restore();
    } else rayoGrande(tx, W + 20, P.y, r.w, r.col, 0.95, Math.min(1, (r.t - r.carga) * 8, (r.carga + r.dur - r.t) * 4));
  }
  // bolas de captura
  for (const b of BOLAS) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 1; i < 7; i++) { c.globalAlpha = 0.5 - i * 0.06; c.fillStyle = '#7fe8ff'; c.beginPath(); c.arc(b.x - i * 13, b.y + Math.sin(b.t * 18 + i) * 4, b.r * (1 - i * 0.1), 0, 6.28); c.fill(); }
    brillo(b.x, b.y, b.r * 3.4, '#7fe8ff', 0.8); brillo(b.x, b.y, b.r * 1.6, '#ffffff', 1);
    c.globalAlpha = 1; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(b.x, b.y, b.r + Math.sin(b.t * 20) * 2, 0, 6.28); c.stroke();
    for (let k = 0; k < 3; k++) { const a = b.t * 9 + k * 2.09; c.fillStyle = '#fff'; c.beginPath(); c.arc(b.x + Math.cos(a) * (b.r + 8), b.y + Math.sin(a) * (b.r + 8), 2.5, 0, 6.28); c.fill(); }
    c.restore();
  }
  for (const it of ITEMS) {
    const esc = it.tipo === 'escudo', col = esc ? '#6fc8ff' : '#ffd03c';
    c.save(); c.globalCompositeOperation = 'lighter'; brillo(it.x, it.y, 60 + 8 * Math.sin(it.t * 6), col, 0.55); brillo(it.x, it.y, 26, '#ffffff', 0.7);
    c.strokeStyle = esc ? '#bfe9ff' : '#ffe9a3'; c.lineWidth = 3; c.globalAlpha = 0.95; c.beginPath(); for (let k = 0; k < 6; k++) { const a = it.t * 2 + k * 1.047, r = 24; c[k ? 'lineTo' : 'moveTo'](it.x + Math.cos(a) * r, it.y + Math.sin(a) * r); } c.closePath(); c.stroke();
    c.globalAlpha = 1; c.restore(); icono(esc ? 'mod-escudo' : 'sis-casco', it.x - 14, it.y - 14, 28); txt(esc ? 'ESCUDO' : 'EVO', it.x, it.y - 40, 16, esc ? '#bfe9ff' : '#ffe9a3');
  }
  if (jugando) dibujaJugador();
  // disparos: cápsulas de plasma con halo largo, núcleo blanco, destello y chispas
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  for (const b of PB) {
    const v = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / v, uy = b.vy / v, L = b.aliado ? 18 : 28 + b.r * 3, x0 = b.x - ux * L, y0 = b.y - uy * L;
    c.strokeStyle = b.col; c.globalAlpha = 0.1; c.lineWidth = b.r * 3.6; c.beginPath(); c.moveTo(x0 - ux * 22, y0 - uy * 22); c.lineTo(b.x, b.y); c.stroke();
    c.globalAlpha = 0.55; c.lineWidth = b.r * 1.7; c.beginPath(); c.moveTo(x0, y0); c.lineTo(b.x, b.y); c.stroke();
    c.globalAlpha = 0.8; c.strokeStyle = '#fff'; c.lineWidth = b.r * 0.6; c.beginPath(); c.moveTo(x0 + ux * L * 0.3, y0 + uy * L * 0.3); c.lineTo(b.x + ux * 4, b.y + uy * 4); c.stroke();
    brillo(b.x, b.y, b.r * 4.5, b.col, 0.2); brillo(b.x + ux * 3, b.y + uy * 3, b.r * 2, '#ffffff', 0.3);
  }
  for (const b of EB) {
    const pul = 1 + 0.18 * Math.sin(S.t * 14 + b.x * 0.05);
    c.strokeStyle = b.col; c.globalAlpha = 0.5; c.lineWidth = b.r * 0.6; c.beginPath(); c.moveTo(b.x - b.vx * 0.07, b.y - b.vy * 0.07); c.lineTo(b.x, b.y); c.stroke();
    brillo(b.x, b.y, b.r * 4.2 * pul, b.col, 0.75); c.globalAlpha = 0.9; c.lineWidth = 1.6; c.beginPath(); c.arc(b.x, b.y, b.r * 1.9 * pul, 0, 6.28); c.stroke();
    c.globalAlpha = 1; c.fillStyle = '#fff'; c.beginPath(); c.arc(b.x, b.y, b.r * 0.72, 0, 6.28); c.fill();
  }
  c.restore();
  // efectos que brillan
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  for (const f of FX) {
    const k = f.vida / f.v0;
    if (f.t === 's') { c.globalAlpha = Math.max(0, k); c.strokeStyle = f.col; c.lineWidth = f.w * (0.4 + k * 0.6); c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(f.x - f.vx * 0.045, f.y - f.vy * 0.045); c.stroke(); }
    else if (f.t === 'e') brillo(f.x, f.y, f.r * (0.5 + k * 0.7), f.col, k);
    else if (f.t === 'f') { const u = 1 - k, col = FUEGO[Math.min(3, Math.floor(u * 4))], r = f.r * (0.55 + u * 0.8); brillo(f.x, f.y, r * 1.25, col, Math.min(0.42, k * 0.8)); brillo(f.x, f.y, r * 0.5, u < 0.5 ? '#fff0c0' : col, Math.min(0.32, k * 0.6)); }
    else if (f.t === 'fl') { destello(f.x, f.y, f.ww * (0.7 + (1 - k) * 0.9), f.col, k, 1); }
    else if (f.t === 'z') {   // arco eléctrico: línea quebrada que cambia cada cuadro
      const dx = f.x2 - f.x, dy = f.y2 - f.y, L = Math.hypot(dx, dy), n = Math.max(3, Math.floor(L / 24)), nx = -dy / (L || 1), ny = dx / (L || 1);
      for (let pass = 0; pass < 3; pass++) { c.strokeStyle = pass === 2 ? '#ffffff' : f.col; c.lineWidth = pass === 0 ? 7 : pass === 1 ? 3 : 1.4; c.globalAlpha = Math.max(0, k) * (pass === 0 ? 0.3 : pass === 1 ? 0.7 : 1); c.beginPath(); c.moveTo(f.x, f.y);
        for (let i = 1; i < n; i++) { const t2 = i / n, j = rnd(-1, 1) * 16; c.lineTo(f.x + dx * t2 + nx * j, f.y + dy * t2 + ny * j); } c.lineTo(f.x2, f.y2); c.stroke(); }
    }
    else if (f.t === 'o') { c.globalAlpha = Math.max(0, k); c.strokeStyle = f.col; c.lineWidth = f.w * k + 1; c.beginPath(); c.arc(f.x, f.y, f.r1 * (1 - k * k), 0, 6.28); c.stroke(); }
  }
  c.restore();
  for (const f of FX) if (f.t === 'd') { const k = Math.min(1, f.vida / (f.v0 * 0.5)); c.save(); c.translate(f.x, f.y); c.rotate(f.rot); if (f.vuelta) c.scale(-1, 1); c.globalAlpha = k; c.drawImage(f.im, f.sx, f.sy, f.sw, f.sw, -f.tam / 2, -f.tam / 2, f.tam, f.tam); c.globalCompositeOperation = 'lighter'; brillo(0, 0, f.tam * 0.8, '#ff8a3c', k * 0.5); c.restore(); }
  c.globalAlpha = 1;
  // luces del fondo: cada explosión ilumina todo
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < S.luces.length && i < Q.luces; i++) { const l = S.luces[i], k = l.vida / l.v0; c.globalAlpha = Math.min(0.8, l.a * k * 0.45); c.drawImage(suave(l.col), l.x - l.r, l.y - l.r, l.r * 2, l.r * 2); } c.restore();
  for (const t of TX) { c.globalAlpha = Math.min(1, t.vida * 2); txt(t.s, t.x, t.y, 20, t.col); c.globalAlpha = 1; }
}
function dibujaJugador() {
  let nv = nave(S.nave, S.k); if (nv) S.navePrev = nv; else nv = S.navePrev; if (!nv) return;
  if (P.inv > 0 && Math.floor(S.t * 18) % 2 === 0 && !S.rayo) return;   // parpadea al estar a salvo
  const f = (0.7 + 0.3 * Math.sin(S.t * 40)) * (0.8 + 0.7 * (P.empuje || 0)), tx = P.x - nv.lw / 2 + 8, col = FACS[S.nave].col;
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(tx, 0, tx - 46 * f, 0); g.addColorStop(0, 'rgba(255,230,160,0.95)'); g.addColorStop(0.4, 'rgba(255,140,40,0.7)'); g.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(tx, P.y - 7); c.lineTo(tx - 46 * f, P.y); c.lineTo(tx, P.y + 7); c.fill();
  brillo(tx - 6, P.y, 34, '#ffa040', 0.65 * f); brillo(P.x, P.y, nv.lw * 0.9, col, 0.14); c.restore();
  c.imageSmoothingQuality = 'high';
  const fl = Math.sin(S.t * 2.3) * 0.5, ang = P.ang || 0, est = 1 + Math.abs(P.vx || 0) / P.vel * 0.012 - Math.abs(P.vy || 0) / P.vel * 0.008;   // flota, se inclina y se estira con la velocidad
  c.save(); c.translate(P.x, P.y + fl); c.rotate(ang); c.scale(est, 1 / est); c.drawImage(nv, -nv.lw / 2, -nv.lh / 2, nv.lw, nv.lh); c.restore();
  if (S.escudo > 0) burbuja(P.x, P.y, nv.lw * 0.62, S.escudo > 1);
  if (S.rayo && S.rayo.t < S.rayo.carga) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = '#fff'; c.globalAlpha = 0.7; c.lineWidth = 3; c.beginPath(); c.arc(P.x + 14, P.y, 40 + (1 - S.rayo.t / S.rayo.carga) * 40, 0, 6.28); c.stroke(); c.restore(); }
  if (ALI.length) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(127,232,255,0.3)'; c.lineWidth = 2; c.beginPath(); c.arc(P.x, P.y, 36 + Math.sin(S.t * 5) * 2, 0, 6.28); c.stroke(); c.restore(); }
}

function burbuja(x, y, r, doble) {   // escudo: burbuja transparente con aro, reflejo fijo y un destello que la cruza de vez en cuando
  const t = S.t, resp = 1 + Math.sin(t * 2.4) * 0.012, R = r * resp, ph = (t % 3.6) / 0.7, gl = ph < 1 ? Math.sin(ph * Math.PI) : 0;
  c.save(); c.translate(x, y);
  const g = c.createRadialGradient(-R * 0.25, -R * 0.3, R * 0.1, 0, 0, R); g.addColorStop(0, 'rgba(150,215,255,0.04)'); g.addColorStop(0.7, 'rgba(110,190,255,0.10)'); g.addColorStop(1, 'rgba(140,215,255,' + (0.30 + gl * 0.2) + ')');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, R, 0, 6.283); c.fill();
  c.lineWidth = 2; c.strokeStyle = 'rgba(190,236,255,' + (0.5 + gl * 0.4) + ')'; c.stroke();
  if (doble) { c.lineWidth = 1.5; c.strokeStyle = 'rgba(150,215,255,0.4)'; c.beginPath(); c.arc(0, 0, R * 1.13, 0, 6.283); c.stroke(); }
  c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, R * 0.82, Math.PI * 1.08, Math.PI * 1.34); c.stroke();   // reflejo
  c.lineWidth = 2; c.beginPath(); c.arc(0, 0, R * 0.82, Math.PI * 1.42, Math.PI * 1.48); c.stroke();
  if (gl > 0) { c.beginPath(); c.arc(0, 0, R, 0, 6.283); c.clip(); c.globalCompositeOperation = 'lighter'; c.rotate(0.6); const bx = -R * 1.6 + ph * R * 3.2, gr = c.createLinearGradient(bx - 16, 0, bx + 16, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,' + (0.45 * gl) + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(bx - 16, -R * 1.2, 32, R * 2.4); }
  c.restore();
}
