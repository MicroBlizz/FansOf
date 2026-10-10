// Fans of Tactics Advance (prototipo) · LA DEMO: un turno completo de CrazyBunny que se repite (elegir, moverse, Salto caótico, golpe,
// queja del enemigo y fin del turno). Todo depende del tiempo t, así que se puede pausar y mover con la barra.
'use strict';

const LW = 240, LH = 160, BUCLE = 13.6;
const lo = lienzoNuevo(LW, LH), lc = lo.getContext('2d');

/* ---------- sprites guardados por pose ---------- */
const CAJAS = { conejo: [36, 48, 16, 46], campeon: [34, 42, 15, 40], esqueleto: [30, 36, 14, 34], becario: [30, 36, 14, 34], starbot: [34, 34, 14, 32] };
const SPRS = new Map();
function spr(nombre, o = {}, t = {}) {
  const k = nombre + JSON.stringify(o) + JSON.stringify(t);
  let s = SPRS.get(k);
  if (!s) {
    const [w, h, ox, oy] = CAJAS[nombre] || [44, 50, 22, 40];
    const p = new Pincel(w, h, t.espejo ? w - ox : ox, oy, t);
    window[nombre](p, o);
    s = p.lienzo(); SPRS.set(k, s);
  }
  return s;
}

/* ---------- el escenario elegido ---------- */
let ESC = null, CASILLAS = [], FONDO = null, NUBES = null, RETRATO_B = null;
function preparaEscena(nombre) {
  ESC = ESCENAS[nombre];
  CASILLAS = [];
  for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) CASILLAS[gy * N + gx] = hazCasilla(ESC, gx, gy);
  FONDO = nombre === 'cementerio' ? fondoAtardecer() : fondoNoche();
  NUBES = nombre === 'cementerio' ? nubesSueltas() : null;
  if (!RETRATO_B) { const p = new Pincel(44, 40, 22, 40); retratoConejo(p); RETRATO_B = p.lienzo().c; }
}
const UNIDADES = [
  { id: 'bunny', gx: 3, gy: 3 },
  { id: 'champ', gx: 2, gy: 5 },
  { id: 'e1', gx: 5, gy: 4 },
  { id: 'e2', gx: 7, gy: 5 },
  { id: 'e3', gx: 6, gy: 2 },
];
const CAMINO = [[3, 3], [4, 3], [4, 4]];
const OBJETIVO = [5, 4];
const ocupada = (gx, gy) => esAgua(gx, gy) || ESC.props.some(q => q[0] === gx && q[1] === gy) || UNIDADES.some(u => u.gx === gx && u.gy === gy);
function alcanceMover(ox, oy, pasos) {
  const dist = new Map([[ox + ',' + oy, 0]]), cola = [[ox, oy]];
  while (cola.length) {
    const [x, y] = cola.shift(), d = dist.get(x + ',' + y);
    if (d >= pasos) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N || dist.has(k) || ocupada(nx, ny)) continue;
      if (Math.abs(altura(nx, ny) - altura(x, y)) > 2) continue;
      dist.set(k, d + 1); cola.push([nx, ny]);
    }
  }
  dist.delete(ox + ',' + oy);
  return dist;
}

/* ---------- ayudas de tiempo ---------- */
const suave = k => k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);
const tramo = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const entre = (t, a, b) => t >= a && t < b;
// punto del mundo: pies sobre la casilla (gx, gy) a su altura
function pie(gx, gy, h = altura(gx, gy)) { return [wx(gx, gy) + 16, wy(gx, gy, h) + 8]; }

/* ---------- dónde está cada cosa en el instante t ---------- */
function estado(t) {
  const e = { t };
  // CrazyBunny: quieto, salta de casilla en casilla, se agacha, salta sobre el enemigo y vuelve
  const B = { gx: 3, gy: 3, h: altura(3, 3), arco: 0, pose: 'quieto', dx: 0 };
  const PASO = 0.42, T_ANDA = 4.6;
  if (t >= T_ANDA) {
    const k = Math.min(CAMINO.length - 1, (t - T_ANDA) / PASO), i = Math.min(CAMINO.length - 2, Math.floor(k)), f = Math.min(1, k - i);
    const [ax, ay] = CAMINO[i], [bx, by] = CAMINO[i + 1];
    B.gx = ax + (bx - ax) * f; B.gy = ay + (by - ay) * f;
    B.h = altura(ax, ay) + (altura(bx, by) - altura(ax, ay)) * f;
    if (k < CAMINO.length - 1) { B.arco = Math.sin(Math.PI * f) * 6; B.pose = f < 0.15 || f > 0.85 ? 'aterriza' : 'aire'; }
  }
  const T_AGACHA = 7.75, T_SALTA = 8.05, T_GOLPE = 8.6, T_VUELVE = 8.74, T_LLEGA = 9.12;
  if (entre(t, T_AGACHA, T_SALTA)) B.pose = 'agacha';
  if (entre(t, T_SALTA, T_GOLPE)) { const k = tramo(t, T_SALTA, T_GOLPE); B.dx = suave(k) * 0.8; B.arco = Math.sin(Math.PI * k) * 32 + k * 21; B.pose = k < 0.7 ? 'vuela' : 'machaca'; B.encima = k > 0.5; }
  if (entre(t, T_GOLPE, T_VUELVE)) { B.dx = 0.8; B.arco = 19; B.pose = 'pisa'; B.encima = true; }
  if (entre(t, T_VUELVE, T_LLEGA)) { const k = tramo(t, T_VUELVE, T_LLEGA); B.dx = 0.8 * (1 - suave(k)); B.arco = 19 * (1 - k) + Math.sin(Math.PI * k) * 14; B.pose = 'aire'; B.encima = k < 0.35; }
  if (entre(t, T_LLEGA, T_LLEGA + 0.12)) B.pose = 'aterriza';
  e.B = B;
  e.golpe = t - T_GOLPE;                        // tiempo desde el impacto (negativo = todavía no)
  // polvo al aterrizar en cada casilla
  e.polvo = [];
  for (let i = 1; i < CAMINO.length; i++) { const tl = T_ANDA + PASO * i, k = t - tl; if (k >= 0 && k < 0.4) e.polvo.push([...pie(...CAMINO[i]), k]); }
  if (t - T_LLEGA >= 0 && t - T_LLEGA < 0.4) e.polvo.push([...pie(4, 4), t - T_LLEGA]);
  // cámara: vista general, el conejo, el cursor, el golpe
  const P0 = [wx(4.5, 4.5) + 16, wy(4.5, 4.5, 1.6) + 8], PB = pie(3, 3), PD = pie(4, 4), PE = pie(...OBJETIVO);
  const mitad = [(PD[0] + PE[0]) / 2, (PD[1] + PE[1]) / 2 - 6];
  const claves = [[0, P0], [0.7, P0], [1.5, PB], [3.4, PB], [4.4, PD], [6.6, PD], [7.2, mitad], [12.4, mitad], [13.2, P0], [BUCLE, P0]];
  let foco = P0;
  for (let i = 0; i < claves.length - 1; i++) if (t >= claves[i][0] && t < claves[i + 1][0]) {
    const k = suave(tramo(t, claves[i][0], claves[i + 1][0])), a = claves[i][1], b = claves[i + 1][1];
    foco = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }
  const izq = suave(tramo(t, 1.6, 1.95)) * (1 - suave(tramo(t, 9.3, 9.8)));
  e.cam = [118 - 24 * izq - foco[0], 86 - foco[1]];
  if (e.golpe >= 0 && e.golpe < 0.35) { const s = (1 - e.golpe / 0.35) * 3; e.cam[0] += Math.round(Math.sin(e.golpe * 90) * s); e.cam[1] += Math.round(Math.cos(e.golpe * 70) * s * 0.6); }
  // cursor y flecha
  e.cursor = null;
  if (entre(t, 1.1, 3.4)) e.cursor = [3, 3];
  if (entre(t, 3.4, 4.5)) { const k = Math.min(2, Math.floor((t - 3.4) / 0.3)); e.cursor = CAMINO[k]; }
  if (entre(t, 6.7, 7.7)) e.cursor = OBJETIVO;
  e.flecha = entre(t, 1.1, 3.4);
  // casillas marcadas
  e.azul = entre(t, 3.0, 4.5) ? { desde: 3.0, mapa: alcanceMover(3, 3, 4) } : null;
  e.rojo = entre(t, 6.6, 7.7);
  // ventanas
  e.banner = entre(t, 0.25, 1.55) ? tramo(t, 0.25, 1.55) : null;
  e.bannerE = entre(t, 11.9, 13.2) ? tramo(t, 11.9, 13.2) : null;
  e.ficha = t < 1.6 ? null : t < 11.7 ? suave(tramo(t, 1.6, 1.85)) : 1 - suave(tramo(t, 11.7, 11.95));
  if (entre(t, 1.8, 3.0)) e.menu = { activo: 0, pulsa: entre(t, 2.75, 2.95) };
  if (entre(t, 5.5, 7.7)) e.menu = { activo: 1, apagado: t >= 5.95 };
  if (entre(t, 5.95, 7.7)) e.sub = { activo: t < 6.3 ? 0 : 1 };
  e.objetivo = entre(t, 6.8, 9.5) ? suave(tramo(t, 6.8, 7.05)) * (1 - suave(tramo(t, 9.2, 9.5))) : null;
  e.pct = entre(t, 7.0, 7.7);
  e.vidaE = Math.round(210 - 128 * suave(tramo(t, T_GOLPE + 0.1, T_GOLPE + 0.7)));
  e.caos = t >= T_SALTA ? 12 : 24;
  e.bocadillo = entre(t, 9.6, 11.6);
  e.fundido = t > BUCLE - 0.3 ? tramo(t, BUCLE - 0.3, BUCLE) : t < 0.25 ? 1 - tramo(t, 0, 0.25) : 0;
  return e;
}

/* ---------- pintar un fotograma ---------- */
function poseConejo(e, t) {
  const B = e.B, gira = Math.floor(t * 7) % 2;
  const quieto = Math.floor(t * 2.4) % 2;
  switch (B.pose) {
    case 'aire': return spr('conejo', { ondea: -1, oreja: -1, espiral: gira }, { sy: 1.06, sx: 0.96 });
    case 'aterriza': return spr('conejo', { ondea: 1, oreja: 1 }, { sy: 0.9, sx: 1.08 });
    case 'agacha': return spr('conejo', { ondea: 1, oreja: 1, za: -2.0, zx: 8.5, zy: -22, hy: 1, espiral: gira }, { sy: 0.86, sx: 1.1 });
    case 'vuela': return spr('conejo', { ondea: -1, oreja: -1, za: -2.0, zx: 8.5, zy: -24, boca: 'grito', espiral: gira }, { sy: 1.08 });
    case 'machaca': return spr('conejo', { ondea: 1, oreja: 1, za: 0.35, zx: 10.5, zy: -15, boca: 'grito', espiral: gira }, { sy: 0.94, sx: 1.05 });
    case 'pisa': return spr('conejo', { ondea: 1, oreja: 1, za: 0.5, zx: 10, zy: -12, boca: 'grito', espiral: gira, hy: 1 }, { sy: 0.84, sx: 1.12 });
    default: return spr('conejo', quieto ? { oreja: 1, ondea: 1 } : {}, quieto ? { sy: 0.97 } : {});
  }
}
function spriteUnidad(u, e, t) {
  const fase = (Math.floor(t * 2.4) + (u.id === 'e2' ? 1 : 0)) % 2;
  if (u.id === 'champ') return spr('campeon', { ondea: fase }, fase ? { sy: 0.97 } : {});
  const tipo = ESC.enemigo === 'becario' && u.id === 'e2' ? 'starbot' : ESC.enemigo;
  const o = tipo === 'becario' ? { vapor: fase, hy: fase } : tipo === 'esqueleto' ? { hy: fase } : { hy: fase };
  if (u.id === 'e1' && e.golpe >= 0 && e.golpe < 0.5 && tipo === 'becario') o.ojos = 'susto';
  if (u.id === 'e1' && e.golpe >= 0 && e.golpe < 0.18) return spr(tipo, o, { espejo: true, sy: 0.82, sx: 1.14 });
  return spr(tipo, o, { espejo: true });
}
function sombraUnidad(x, y, ancho = 12) {
  lc.globalAlpha = 0.34; lc.fillStyle = '#1c1028';
  lc.fillRect(x - ancho / 2, y - 1, ancho, 3); lc.fillRect(x - ancho / 2 + 2, y - 2, ancho - 4, 5);
  lc.globalAlpha = 1;
}

function pinta(t) {
  const e = estado(t), [CX, CY] = e.cam;
  // fondo con un poco de paralaje
  lc.drawImage(FONDO, Math.round(-60 + (CX - 118) * 0.18), Math.round(-40 + (CY - 20) * 0.12));
  if (NUBES) { const dx = Math.round(-((t * 4) % FW)); lc.drawImage(NUBES, dx + Math.round((CX - 118) * 0.25), HORIZONTE - 52 + Math.round((CY - 20) * 0.12)); lc.drawImage(NUBES, dx + FW * 2 + Math.round((CX - 118) * 0.25), HORIZONTE - 52 + Math.round((CY - 20) * 0.12)); }
  if (ESC.enemigo === 'becario') pintaLetrero(lc, t, Math.round(-60 + (CX - 118) * 0.18) + 268, Math.round(-40 + (CY - 20) * 0.12) + 44);
  // el mapa, de atrás hacia delante
  const bunnyD = e.B.encima ? OBJETIVO[0] + OBJETIVO[1] : Math.round(e.B.gx + e.B.dx + e.B.gy);
  for (let d = 0; d <= 2 * (N - 1); d++) {
    for (let gx = 0; gx < N; gx++) {
      const gy = d - gx; if (gy < 0 || gy >= N) continue;
      const T = CASILLAS[gy * N + gx], X = Math.round(CX + wx(gx, gy)), Y = Math.round(CY + wy(gx, gy, T.h));
      if (X > LW + 2 || X < -34 || Y > LH + 4 || Y + T.c.height < -2) continue;
      lc.drawImage(T.c, X, Y);
      if (T.agua) pintaAgua(lc, ESC, gx, gy, X, Y, t);
      const k = gx + ',' + gy;
      if (e.azul && e.azul.mapa.has(k) && t > e.azul.desde + e.azul.mapa.get(k) * 0.08) marca(lc, X, Y, 'azul', t);
      if (e.rojo && Math.abs(gx - 4) + Math.abs(gy - 4) === 1 && !esAgua(gx, gy)) marca(lc, X, Y, gx === OBJETIVO[0] && gy === OBJETIVO[1] ? 'rojo' : 'rosa', t);
      if (e.cursor && e.cursor[0] === gx && e.cursor[1] === gy) cursor(lc, X, Y, t);
      // onda del golpe sobre la casilla del enemigo
      if (gx === OBJETIVO[0] && gy === OBJETIVO[1] && e.golpe >= 0 && e.golpe < 0.5) onda(X + 16, Y + 8, e.golpe);
    }
    for (let gx = 0; gx < N; gx++) {
      const gy = d - gx; if (gy < 0 || gy >= N) continue;
      const pr = ESC.props.find(q => q[0] === gx && q[1] === gy);
      const [px, py] = pie(gx, gy);
      if (pr) pintaSpr(lc, spr(pr[2]), CX + px, CY + py);
      if (pr && pr[2] === 'farol') brilloFarol(CX + px, CY + py - 21, t);
      for (const u of UNIDADES) {
        if (u.id === 'bunny' || u.gx !== gx || u.gy !== gy) continue;
        const golpeado = u.id === 'e1' && e.golpe >= 0;
        const sacude = golpeado && e.golpe < 0.4 ? Math.round(Math.sin(e.golpe * 70) * 2) : 0;
        sombraUnidad(CX + px, CY + py);
        pintaSpr(lc, spriteUnidad(u, e, t), CX + px + sacude, CY + py, golpeado && e.golpe < 0.3 && Math.floor(e.golpe * 20) % 2 === 0);
      }
    }
    if (d === Math.min(2 * (N - 1), bunnyD)) {
      const B = e.B, bx = B.gx + B.dx, X = CX + (bx - B.gy) * 16 + 16, Y = CY + (bx + B.gy) * 8 - B.h * HU + 8;
      sombraUnidad(Math.round(X), Math.round(Y), B.arco > 12 ? 8 : 12);
      pintaSpr(lc, poseConejo(e, t), Math.round(X), Math.round(Y - B.arco));
      e.conejoPx = [Math.round(X), Math.round(Y - B.arco)];
    }
  }
  if (ESC.luciernagas) pintaLuciernagas(lc, t, Math.round((CX - 118) * 0.6), Math.round(CY * 0.3) - 10);
  // efectos
  for (const [x, y, k] of e.polvo) polvo(CX + x, CY + y, k);
  if (e.golpe >= 0 && e.golpe < 0.9) chispas(CX + pie(...OBJETIVO)[0] - 2, CY + pie(...OBJETIVO)[1] - 24, e.golpe);
  // flecha sobre quien tiene el turno
  if (e.flecha && e.conejoPx) lc.drawImage(FLECHA, e.conejoPx[0] - 4, e.conejoPx[1] - 54 + (Math.floor(t * 3) % 2));
  pintaVentanas(e, t, CX, CY);
  if (e.golpe >= 0 && e.golpe < 0.08) { lc.globalAlpha = 0.3 * (1 - e.golpe / 0.08); lc.fillStyle = '#ffffff'; lc.fillRect(0, 0, LW, LH); lc.globalAlpha = 1; }
  if (e.fundido > 0) { lc.globalAlpha = e.fundido; lc.fillStyle = '#0c0a18'; lc.fillRect(0, 0, LW, LH); lc.globalAlpha = 1; }
}

/* ---------- efectos ---------- */
function polvo(x, y, k) {
  const a = 1 - k / 0.4;
  for (const [dx, v] of [[-6, -1], [-3, -0.5], [3, 0.5], [6, 1]]) {
    const px = Math.round(x + dx + v * k * 20), py = Math.round(y - 1 - k * 8);
    lc.globalAlpha = a; lc.fillStyle = '#f4ece0'; lc.fillRect(px, py, 2, 2); lc.fillStyle = '#c8b8a8'; lc.fillRect(px + 1, py + 1, 1, 1);
  }
  lc.globalAlpha = 1;
}
function onda(x, y, k) {
  const r = 4 + k * 46, a = 1 - k / 0.5;
  lc.globalAlpha = a;
  for (let i = 0; i < 64; i++) {
    const ang = (i / 64) * Math.PI * 2, px = Math.round(x + Math.cos(ang) * r), py = Math.round(y + Math.sin(ang) * r * 0.5);
    lc.fillStyle = i % 2 ? '#e8b8ff' : '#ffffff'; lc.fillRect(px, py, 1, 1);
  }
  lc.globalAlpha = 1;
}
const ESPIRAL_PEQ = hazSello(['.ppp.', 'p...p', 'p.p.p', 'p.pp.', '.p...'], { p: '#c46cff' });
function chispas(x, y, k) {
  for (let i = 0; i < 14; i++) {
    const ang = -Math.PI * (0.1 + 0.8 * hash(i, 1)), v = 40 + hash(i, 2) * 50;
    const px = Math.round(x + Math.cos(ang) * v * k * (hash(i, 3) < 0.5 ? -1 : 1)), py = Math.round(y + Math.sin(ang) * v * k + 90 * k * k);
    if (k > 0.5 + hash(i, 4) * 0.4) continue;
    lc.fillStyle = ['#ffffff', '#ff8ad8', '#c46cff', '#fff27a'][i % 4];
    lc.fillRect(px, py, i % 3 ? 1 : 2, i % 3 ? 1 : 2);
  }
  for (let i = 0; i < 3; i++) {
    if (k > 0.7) break;
    lc.globalAlpha = 1 - k / 0.7;
    lc.drawImage(ESPIRAL_PEQ, Math.round(x - 2 + (i - 1) * 16 * k * 1.6), Math.round(y - 8 - 22 * k + (i === 1 ? -8 * k : 0)));
  }
  lc.globalAlpha = 1;
}
function brilloFarol(x, y, t) {
  const p = 0.16 + Math.sin(t * 9) * 0.03 + Math.sin(t * 23) * 0.02;
  lc.globalAlpha = p; lc.fillStyle = '#ffd86a';
  for (let r = 9; r > 0; r -= 3) { for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(r * r - dy * dy)); lc.fillRect(Math.round(x - dx), Math.round(y + dy), dx * 2 + 1, 1); } }
  lc.globalAlpha = 1;
}

/* ---------- ventanas de la demo ---------- */
function pintaVentanas(e, t, CX, CY) {
  norma(lc, 2, 2, tr(ESC.norma));
  ventana(lc, 196, 2, 42, 15);
  escribeMini(lc, tr('TURNO {n}').replace('{n}', 3), 217, 7, '#ffffff', '#101438', 'centro');
  if (e.ficha) ficha(lc, Math.round(-122 + 124 * e.ficha), 108, { retrato: RETRATO_B, nombre: 'CrazyBunny', clase: tr('ANIMALES LOCOS'), nivel: 12, vida: 182, vidaMax: 182, caos: e.caos, caosMax: 40 });
  if (e.objetivo) {
    const tipo = ESC.enemigo;
    fichaObjetivo(lc, Math.round(238 + 150 * (1 - e.objetivo)), 21, { retrato: spr(tipo, {}, { espejo: true }), nombre: tr(ESC.nombreE), clase: tr(ESC.claseE), vida: e.vidaE, vidaMax: 210 });
  }
  if (e.menu) {
    const items = ['Mover', 'Actuar', 'Esperar', 'Estado'].map(tr);
    menu(lc, 238, 104, items, e.menu.pulsa && Math.floor(t * 16) % 2 ? -1 : e.menu.activo, t, e.menu.apagado);
  }
  if (e.sub) submenu(lc, 238, 62, [[tr('Golpe'), ''], [tr('Salto caótico'), tr('{n} CAOS').replace('{n}', 12)]], e.sub.activo, t);
  const [ex, ey] = pie(...OBJETIVO);
  if (e.pct) { const x = Math.round(CX + ex), y = Math.round(CY + ey - 46); ventana(lc, x - 15, y, 30, 15); escribe(lc, '85%', x, y + 4, '#ffe27a', '#101438', 'centro'); }
  if (e.golpe >= 0.45 && e.golpe < 2.3) {
    const k = e.golpe - 0.45, salto = k < 0.45 ? -Math.sin(k / 0.45 * Math.PI) * 12 : k < 0.7 ? -Math.sin((k - 0.45) / 0.25 * Math.PI) * 3 : 0;
    if (k < 1.5 || Math.floor(k * 20) % 2) escribeGordo(lc, "128", Math.round(CX + ex + 6), Math.round(CY + ey - 40 + salto));
  }
  if (e.bocadillo) {
    const lineas = ESC.queja.map(tr), w = 12 + Math.max(...lineas.map(l => anchoTexto(l)));
    const x = Math.round(CX + ex), y = Math.round(CY + ey - 56);
    bocadillo(lc, Math.max(4, Math.min(LW - w - 4, x - 30)), y, lineas, x - 2, y + 30);
  }
  if (e.banner != null) bannerTurno(e.banner, 'CrazyBunny', 'azul');
  if (e.bannerE != null) bannerTurno(e.bannerE, tr(ESC.nombreE), 'rojo');
}
function bannerTurno(k, quien, tono) {
  const entra = suave(Math.min(1, k / 0.25)), sale = suave(Math.max(0, (k - 0.8) / 0.2));
  // «Turno de {q}»: el nombre va en amarillo, esté donde esté en la frase de cada idioma
  const [antes, despues] = tr('Turno de {q}').split('{q}');
  const w = 18 + anchoTexto(antes + quien + despues), x = Math.round((LW - w) / 2 + (1 - entra) * -160 + sale * 160), y = 116;
  ventana(lc, x, y, w, 19, tono);
  let cx = x + 9;
  if (antes) { escribe(lc, antes, cx, y + 6, '#ffffff'); cx += anchoTexto(antes) + 1; }
  escribe(lc, quien, cx, y + 6, '#ffe27a'); cx += anchoTexto(quien) + 1;
  if (despues) escribe(lc, despues, cx, y + 6, '#ffffff');
}
