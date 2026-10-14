// Fans of Crush · PINTAR: la vista (medidas de todo según la pantalla), el fondo de la oficina de Microblizz y el tablero con sus fichas,
// trabas y cinta. El marcador, Lola y los potenciadores están en js/marcador.js; las partículas, en js/efectos.js.
'use strict';
// W y H lógicos (540 de ancho; el alto crece en los móviles alargados) · sc: píxeles CSS por unidad · k: escala para pintar lienzos ya hechos
const CR_V = { W: 540, H: 960, sc: 1, dpr: 1, k: 1, top: 0, hudY: 10, hudH: 166, abajoY: 728, bx: 30, by: 190, cel: 60, px: 60 };
function crMide() {
  const V = CR_V, jefe = !!(CR_P.jefe), salidas = CR_T.salida && CR_T.salida.some(Boolean);
  const extra = V.H - 960;
  V.top = Math.round(extra * 0.32);
  V.hudY = V.top + 10; V.hudH = jefe ? 214 : 166;
  V.abajoY = V.H - 232 - Math.round(extra * 0.1);
  const arriba = V.hudY + V.hudH + 10, abajo = V.abajoY - 14 - (salidas ? 30 : 0), w = CR_T.w || 8, h = CR_T.h || 8;
  V.cel = Math.max(36, Math.min(64, Math.floor(504 / w), Math.floor((abajo - arriba - 16) / h)));
  V.bx = Math.round((540 - V.cel * w) / 2); V.by = Math.round(arriba + (abajo - arriba - V.cel * h) / 2);
  const px = Math.round(V.cel * V.sc * V.dpr);
  if (px !== V.px) { V.px = px; crOlvidaSprites(); }
  V.k = 1 / (V.sc * V.dpr);
}
const crCx = x => CR_V.bx + (x + 0.5) * CR_V.cel;
const crCy = y => CR_V.by + (y + 0.5) * CR_V.cel;
function crCasillaEn(lx, ly) { const x = Math.floor((lx - CR_V.bx) / CR_V.cel), y = Math.floor((ly - CR_V.by) / CR_V.cel); return crDentro(x, y) ? [x, y] : null; }

/* ---------- el fondo: la planta de oficinas de noche (se pinta una vez por tamaño) ---------- */
const CR_FONDO = { cv: null, clave: '' }, CR_FONDO_PORTADA = { cv: null, clave: '' };
function crFondo(c, F = CR_FONDO, semilla = 7, ventanal = 0.22) {
  const V = CR_V, clave = [V.H, V.sc, V.dpr].join(':');
  if (F.clave !== clave) {
    const cv = F.cv || document.createElement('canvas'); F.cv = cv; F.clave = clave;
    cv.width = Math.round(540 * V.sc * V.dpr); cv.height = Math.round(V.H * V.sc * V.dpr);
    const f = cv.getContext('2d'); f.setTransform(V.sc * V.dpr, 0, 0, V.sc * V.dpr, 0, 0); crPintaOficina(f, V.H, semilla, ventanal);
  }
  c.drawImage(F.cv, 0, 0, 540, V.H);
}
function crRand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function crPintaOficina(c, H, semilla, ventanal = 0.22) {
  const R = crRand(semilla), alto = Math.round(H * ventanal);
  // el ventanal: cielo de tarde suave, nubes y la ciudad en lavanda
  const cielo = c.createLinearGradient(0, 0, 0, alto); cielo.addColorStop(0, '#bfe6ff'); cielo.addColorStop(0.7, '#e3dcff'); cielo.addColorStop(1, '#ffdbe8');
  c.fillStyle = cielo; c.fillRect(0, 0, 540, alto);
  c.beginPath(); c.arc(440, alto * 0.32, 22, 0, CR_TAU); c.fillStyle = '#fff3c4'; c.fill();
  for (let i = 0; i < 5; i++) { const nx = R() * 540, ny = 14 + R() * alto * 0.35, nr = 12 + R() * 10; c.fillStyle = 'rgba(255,255,255,.85)'; for (const [dx, dy, k] of [[0, 0, 1], [nr, 4, 0.8], [-nr, 5, 0.75], [nr * 0.4, -nr * 0.4, 0.8]]) { c.beginPath(); c.arc(nx + dx, ny + dy, nr * k, 0, CR_TAU); c.fill(); } }
  for (let capa = 0; capa < 2; capa++) {
    let x = -20;
    while (x < 560) {
      const w = 34 + R() * 50, h = (capa ? 0.36 : 0.28) * alto + R() * (capa ? 0.4 : 0.32) * alto, y = alto - h;
      c.fillStyle = capa ? '#b9a6ec' : '#d3c6f5'; crRR(c, x, y, w, h + 10, 6); c.fill();
      if (capa) for (let wy = y + 9; wy < alto - 6; wy += 12) for (let wx = x + 6; wx < x + w - 7; wx += 10) if (R() < 0.45) { c.fillStyle = R() < 0.7 ? 'rgba(255,255,255,.75)' : 'rgba(255,211,107,.8)'; c.fillRect(wx, wy, 4, 5); }
      x += w + 4;
    }
  }
  c.fillStyle = '#fff8f0'; c.fillRect(0, alto - 5, 540, 10);
  for (let x = 0; x <= 540; x += 135) c.fillRect(x - 4, 0, 8, alto);
  c.fillStyle = 'rgba(74,45,107,.25)'; c.fillRect(0, alto + 5, 540, 3);
  // la pared lavanda con rayas suaves
  const pared = c.createLinearGradient(0, alto, 0, H * 0.76); pared.addColorStop(0, '#e9e0ff'); pared.addColorStop(1, '#d9ccff'); c.fillStyle = pared; c.fillRect(0, alto + 8, 540, H * 0.76 - alto - 8);
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let x = 12; x < 540; x += 48) c.fillRect(x, alto + 8, 14, H * 0.76 - alto - 8);
  // plantas a los lados
  for (const [px, s] of [[24, 1], [516, -1]]) {
    const py = H * 0.76;
    for (let i = 0; i < 6; i++) { c.save(); c.translate(px, py - 26); c.rotate(s * (-0.9 + i * 0.32)); c.beginPath(); c.ellipse(0, -22, 8, 22, 0, 0, CR_TAU); c.fillStyle = i % 2 ? '#7ad9b0' : '#5cc89c'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#2f8a6a'; c.stroke(); c.restore(); }
    crRR(c, px - 16, py - 30, 32, 30, 7); c.fillStyle = '#ff9fb4'; c.fill(); c.lineWidth = 3; c.strokeStyle = CR_COL.tinta; c.stroke();
  }
  // la moqueta lila con lunares
  const m = c.createLinearGradient(0, H * 0.76, 0, H); m.addColorStop(0, '#efe8ff'); m.addColorStop(1, '#e2d6ff'); c.fillStyle = m; c.fillRect(0, H * 0.76, 540, H * 0.24);
  c.fillStyle = 'rgba(74,45,107,.12)'; c.fillRect(0, H * 0.76, 540, 4);
  c.fillStyle = 'rgba(255,255,255,.8)'; for (let y = Math.round(H * 0.76) + 14; y < H; y += 22) for (let x = (y / 22) % 2 ? 6 : 17; x < 540; x += 22) { c.beginPath(); c.arc(x, y, 2.6, 0, CR_TAU); c.fill(); }
}

/* ---------- el tablero ---------- */
// el marco del tablero (con sus huecos) se pinta una vez por nivel y tamaño y después solo se copia
const CR_MARCO = { cv: null, clave: '' };
function crPintaMarcoTablero(c) {
  const T = CR_T, V = CR_V, s = V.cel, m = 14, clave = [CR_P.N && CR_P.N.id, V.cel, V.bx, V.by, V.sc, V.dpr, T.w, T.h].join(':');
  if (CR_MARCO.clave !== clave) {
    const cv = CR_MARCO.cv || document.createElement('canvas'); CR_MARCO.cv = cv; CR_MARCO.clave = clave;
    const k = V.sc * V.dpr; cv.width = Math.ceil((T.w * s + m * 2) * k); cv.height = Math.ceil((T.h * s + m * 2) * k);
    const f = cv.getContext('2d'); f.setTransform(k, 0, 0, k, 0, 0); f.translate(m, m);
    const todas = fn => { for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) if (T.ok[y][x]) fn(x, y); };
    todas((x, y) => { crRR(f, x * s - 11, y * s - 7, s + 22, s + 22, 18); f.fillStyle = 'rgba(74,45,107,.22)'; f.fill(); });
    todas((x, y) => { crRR(f, x * s - 11, y * s - 11, s + 22, s + 22, 18); f.fillStyle = CR_COL.tinta; f.fill(); });
    todas((x, y) => { crRR(f, x * s - 7, y * s - 7, s + 14, s + 14, 15); f.fillStyle = '#fff8f0'; f.fill(); });
    todas((x, y) => { f.fillStyle = '#e4d9ff'; f.fillRect(x * s - 1, y * s - 1, s + 2, s + 2); });
    todas((x, y) => { crRR(f, x * s + 2, y * s + 2, s - 4, s - 4, s * 0.18); f.fillStyle = (x + y) % 2 ? '#efe8ff' : '#f8f4ff'; f.fill(); });
  }
  c.drawImage(CR_MARCO.cv, V.bx - m, V.by - m, T.w * s + m * 2, T.h * s + m * 2);
}
function crPintaSalidas(c, t) {
  const T = CR_T, V = CR_V, s = V.cel;
  if (!T.salida.some(Boolean)) return;
  for (let x = 0; x < T.w; x++) {
    if (!T.salida[x] || T.fondo[x] < 0) continue;
    const cx = V.bx + (x + 0.5) * s, y = V.by + (T.fondo[x] + 1) * s + 16 + Math.sin(t * 5 + x) * 2;
    c.beginPath(); c.moveTo(cx - 9, y - 6); c.lineTo(cx + 9, y - 6); c.lineTo(cx, y + 6); c.closePath(); c.fillStyle = '#4fd6a8'; c.fill(); c.lineWidth = 3; c.strokeStyle = CR_COL.tinta; c.lineJoin = 'round'; c.stroke();
  }
  const ys = V.by + T.h * s + 34;
  crRR(c, 270 - 48, ys - 4, 96, 22, 8); c.fillStyle = '#4fd6a8'; c.fill(); c.lineWidth = 3; c.strokeStyle = CR_COL.tinta; c.stroke();
  crLetras(c, 'SALIDA', 270, ys + 8, 15, '#fff6ea', 0.26);
}
function crPintaCintas(c) {
  const T = CR_T, V = CR_V, sp = crSprite('cinta', 0, V.px);
  for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) if (T.cinta[y][x]) crPonSprite(c, sp, crCx(x), crCy(y), V.k, V.k, 0.92);
}
function crPintaTrabas(c, t) {
  const T = CR_T, V = CR_V;
  for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) {
    const tb = T.traba[y][x]; if (!tb) continue;
    const sp = crSprite((tb.t === 'caja' ? 'caja' : 'hielo') + Math.max(1, tb.vida), 0, V.px);
    let s = 1; if (tb.sacude) { tb.sacude = Math.max(0, tb.sacude - 0.05); s = 1 + Math.sin(tb.sacude * 30) * 0.06 * tb.sacude * 4; }
    if (tb.nace !== undefined && tb.nace < 1) { tb.nace = Math.min(1, tb.nace + 0.05); s *= crRebote(tb.nace); }
    crPonSprite(c, sp, crCx(x), crCy(y), V.k * s);
  }
}
const crRebote = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function crPintaFichas(c, t, dt) {
  const T = CR_T, V = CR_V;
  c.save(); c.beginPath();
  for (let x = 0; x < T.w; x++) if (T.boca[x] >= 0) c.rect(V.bx + x * V.cel - 30, V.by + T.boca[x] * V.cel - 30, V.cel + 60, (T.fondo[x] - T.boca[x] + 1) * V.cel + 60);
  c.clip();
  const pista = CR_P.pista, sel = CR_IN.sel;
  for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) {
    const p = T.p[y][x]; if (!p) continue;
    if (p.mt < 1) p.mt = Math.min(1, p.mt + dt / (p.dur || CR_TCAE));
    if (p.bote > 0) p.bote = Math.max(0, p.bote - dt * 4.5);
    if (p.nace > 0) p.nace = Math.max(0, p.nace - dt * 3.2);
    if (p.muere) p.muere = Math.min(1.5, p.muere + dt / CR_TPOP);
    if (p.oculta && p.muere) continue;
    const vx = crVisX(p), vy = crVisY(p);
    if (vy < T.boca[x] - 1.05) continue;
    let px = V.bx + (vx + 0.5) * V.cel, py = V.by + (vy + 0.5) * V.cel, sx = 1, sy = 1, a = 1, rot = 0;
    if (p.bote) { sx = 1 + 0.1 * p.bote; sy = 1 - 0.13 * p.bote; py += V.cel * 0.06 * p.bote; }
    if (p.nace) { const e = crRebote(1 - p.nace); sx *= e; sy *= e; }
    if (p.muere) { const k = Math.min(1, p.muere); const e = k < 0.35 ? 1 + (k / 0.35) * 0.28 : 1.28 * (1 - (k - 0.35) / 0.65); sx *= e; sy *= e; a = k > 0.5 ? 1 - (k - 0.5) / 0.5 : 1; }
    else {
      const resp = 1 + 0.018 * Math.sin(t * 2.2 + p.id * 1.7); sx *= resp; sy *= resp;
      if (sel && sel[0] === x && sel[1] === y) { sx *= 1.13; sy *= 1.13; rot = Math.sin(t * 9) * 0.08; }
      else if (pista && ((pista.a[0] === x && pista.a[1] === y) || (pista.b[0] === x && pista.b[1] === y))) { const w = Math.sin(t * 13) * 0.12 * (0.5 + 0.5 * Math.sin(t * 2.5)); rot = w; sx *= 1.05; sy *= 1.05; }
    }
    if (p.t === 'l') { c.save(); c.globalAlpha = a; c.translate(px, py); c.scale(sx, sy); c.rotate(rot + Math.sin(t * 3 + p.id) * 0.05); crLapida(c, V.cel * 0.43, t * 2.4); c.restore(); }
    else {
      const sp = crSprite(p.t === 'e' ? 'e' : p.t, Math.max(0, p.c), V.px);
      crPonSprite(c, sp, px, py, sx * V.k, sy * V.k, a, rot);
      if (p.t === 'b' && !p.muere) crChispa(c, px + V.cel * 0.43 * 0.8, py - V.cel * 0.43 * 1.12, V.cel * 0.43, t);
      if (p.muere && p.muere < 0.4) { c.save(); c.globalAlpha = (0.4 - p.muere) * 1.6; c.beginPath(); c.arc(px, py, V.cel * 0.45 * sx, 0, CR_TAU); c.fillStyle = '#ffffff'; c.fill(); c.restore(); }
    }
  }
  c.restore();
}
// la escena de la partida entera (el marcador va encima, sin temblar)
function crPintaPartida(c, t, dt) {
  crFondo(c);
  c.save(); c.translate(CR_FX.tx, CR_FX.ty);
  crPintaMarcoTablero(c);
  crPintaCintas(c);
  crPintaSalidas(c, t);
  crPintaTrabas(c, t);
  crPintaFichas(c, t, dt);
  if (CR_IN.martillo) crPintaMira(c, t);
  crFxPinta(c, t);
  c.restore();
  crPintaMarcador(c, t, dt);
  if (CR_FX.flash) { c.save(); c.globalAlpha = Math.max(0, CR_FX.flash.a); c.fillStyle = CR_FX.flash.col; c.fillRect(0, 0, 540, CR_V.H); c.restore(); }
}
// con el martillo elegido, el tablero se oscurece un poco y las casillas que se pueden despedir brillan
function crPintaMira(c, t) {
  const T = CR_T, V = CR_V, a = 0.35 + 0.2 * Math.sin(t * 6);
  for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) {
    const p = T.p[y][x]; if (!T.traba[y][x] && (!p || p.t === 'e')) continue;
    crRR(c, V.bx + x * V.cel + 3, V.by + y * V.cel + 3, V.cel - 6, V.cel - 6, 10); c.lineWidth = 3.5; c.strokeStyle = `rgba(255,122,150,${a + 0.3})`; c.stroke();
  }
}
