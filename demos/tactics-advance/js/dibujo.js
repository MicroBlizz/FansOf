// Fans of Tactics Advance (prototipo) · DIBUJO: pinta la batalla en una pantalla de 240 × 160 (cielo, mapa de atrás hacia
// delante con sus casillas marcadas, decorados, personajes con su pose, efectos y ventanas). Lo que pinta sale del estado J.
'use strict';

const LW = 240, LH = 160;
const lo = lienzoNuevo(LW, LH), lc = lo.getContext('2d');

/* ---------- sprites guardados por pose (y su versión gris, para los que ya han actuado) ---------- */
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
function gris(s) {
  if (!s.gris) {
    const c = lienzoNuevo(s.c.width, s.c.height), g = c.getContext('2d');
    g.drawImage(s.c, 0, 0);
    const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const y = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; d[i] = y * 0.7 + 18; d[i + 1] = y * 0.7 + 14; d[i + 2] = y * 0.7 + 34; }
    g.putImageData(im, 0, 0);
    s.gris = { c, b: s.b, ox: s.ox, oy: s.oy };
  }
  return s.gris;
}

/* ---------- el escenario ---------- */
let ESC = null, NOMBRE_ESC = 'cementerio', CASILLAS = [], FONDO = null, NUBES = null, RETRATO_B = null;
function preparaEscena(nombre) {
  NOMBRE_ESC = nombre; ESC = ESCENAS[nombre];
  CASILLAS = [];
  for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) CASILLAS[gy * N + gx] = hazCasilla(ESC, gx, gy);
  FONDO = nombre === 'cementerio' ? fondoAtardecer() : fondoNoche();
  NUBES = nombre === 'cementerio' ? nubesSueltas() : null;
  if (!RETRATO_B) { const p = new Pincel(44, 40, 22, 40); retratoConejo(p); RETRATO_B = p.lienzo().c; }
}
const suave = k => k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);
// punto del mundo donde caen los pies sobre la casilla (gx, gy) a la altura h
const pieMundo = (gx, gy, h) => [(gx - gy) * 16 + 16, (gx + gy) * 8 - h * HU + 8];
const pantalla = (gx, gy, h) => { const [x, y] = pieMundo(gx, gy, h); return [Math.round(CAM.x + x), Math.round(CAM.y + y)]; };
const CAM = { x: 0, y: 0 };

/* ---------- personajes ---------- */
function spriteDe(u, t) {
  const fase = (Math.floor(t * 2.4) + (u.gx + u.gy) % 2) % 2, esp = u.giro < 0, gira = Math.floor(t * 7) % 2;
  let s;
  if (u.tipo === 'conejo') {
    const E = { espejo: esp };
    switch (u.pose) {
      case 'aire': s = spr('conejo', { ondea: -1, oreja: -1, espiral: gira }, { ...E, sy: 1.06, sx: 0.96 }); break;
      case 'aterriza': s = spr('conejo', { ondea: 1, oreja: 1 }, { ...E, sy: 0.9, sx: 1.08 }); break;
      case 'agacha': s = spr('conejo', { ondea: 1, oreja: 1, za: -2.0, zx: 8.5, zy: -22, hy: 1, espiral: gira }, { ...E, sy: 0.86, sx: 1.1 }); break;
      case 'vuela': s = spr('conejo', { ondea: -1, oreja: -1, za: -2.0, zx: 8.5, zy: -24, boca: 'grito', espiral: gira }, { ...E, sy: 1.08 }); break;
      case 'golpe': s = spr('conejo', { ondea: 1, oreja: 1, za: 0.35, zx: 10.5, zy: -15, boca: 'grito', espiral: gira }, { ...E, sy: 0.94, sx: 1.05 }); break;
      case 'pisa': s = spr('conejo', { ondea: 1, oreja: 1, za: 0.5, zx: 10, zy: -12, boca: 'grito', espiral: gira, hy: 1 }, { ...E, sy: 0.84, sx: 1.12 }); break;
      case 'ay': s = spr('conejo', { ojo: 'cerrado', boca: 'grito', oreja: -1 }, { ...E, sy: 0.95 }); break;
      default: s = spr('conejo', fase ? { oreja: 1, ondea: 1 } : {}, fase ? { ...E, sy: 0.97 } : E);
    }
  } else if (u.tipo === 'campeon') {
    if (u.pose === 'golpe') s = spr('campeon', { sa: -0.35, ex: 10, ey: -12, ondea: 1 }, { espejo: esp, sx: 1.04 });
    else s = spr('campeon', { ondea: fase }, fase ? { espejo: esp, sy: 0.97 } : { espejo: esp });
  } else {
    const o = u.tipo === 'becario' ? { vapor: fase, hy: fase, ojos: u.pose === 'ay' ? 'susto' : 'sueno' } : u.tipo === 'starbot' ? { hy: fase, disparo: u.pose === 'golpe' } : { hy: fase, ba: u.pose === 'golpe' ? -0.2 : -1.1 };
    s = spr(u.tipo, o, u.pose === 'ay' ? { espejo: esp, sy: 0.84, sx: 1.12 } : { espejo: esp });
  }
  return u.hecho && J.fase === 'jugador' && u.eq === 'a' ? gris(s) : s;
}
function sombraUnidad(x, y, ancho = 12) {
  lc.globalAlpha = 0.34; lc.fillStyle = '#1c1028';
  lc.fillRect(x - ancho / 2, y - 1, ancho, 3); lc.fillRect(x - ancho / 2 + 2, y - 2, ancho - 4, 5);
  lc.globalAlpha = 1;
}
function pintaUnidad(u, t) {
  const [x, y] = pantalla(u.fx + u.dx, u.fy + u.dy, u.fh);
  if (u.alfa <= 0) return;
  if (u.muere && Math.floor(t * 14) % 2) return;
  sombraUnidad(x, y, u.arco > 12 ? 8 : 12);
  pintaSpr(lc, spriteDe(u, t), x, y - Math.round(u.arco), u.flash > 0 && Math.floor(u.flash * 20) % 2 === 0);
}

/* ---------- efectos (en coordenadas del mundo) ---------- */
const EFECTOS = [];
const efecto = (tipo, x, y, extra = {}) => EFECTOS.push({ tipo, x, y, t: 0, ...extra });
const DURA = { polvo: 0.4, onda: 0.5, chispas: 0.9, numero: 1.5, laser: 0.3, tajo: 0.35 };
function avanzaEfectos(dt) { for (let i = EFECTOS.length - 1; i >= 0; i--) { EFECTOS[i].t += dt; if (EFECTOS[i].t > DURA[EFECTOS[i].tipo]) EFECTOS.splice(i, 1); } }
const ESPIRAL_PEQ = hazSello(['.ppp.', 'p...p', 'p.p.p', 'p.pp.', '.p...'], { p: '#c46cff' });
function pintaEfectos() {
  for (const e of EFECTOS) {
    const x = Math.round(CAM.x + e.x), y = Math.round(CAM.y + e.y), k = e.t;
    if (e.tipo === 'polvo') {
      lc.globalAlpha = 1 - k / 0.4;
      for (const [dx, v] of [[-6, -1], [-3, -0.5], [3, 0.5], [6, 1]]) { const px = Math.round(x + dx + v * k * 20), py = Math.round(y - 1 - k * 8); lc.fillStyle = '#f4ece0'; lc.fillRect(px, py, 2, 2); lc.fillStyle = '#c8b8a8'; lc.fillRect(px + 1, py + 1, 1, 1); }
    } else if (e.tipo === 'onda') {
      const r = 4 + k * 46; lc.globalAlpha = 1 - k / 0.5;
      for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2; lc.fillStyle = i % 2 ? (e.color || '#e8b8ff') : '#ffffff'; lc.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.5), 1, 1); }
    } else if (e.tipo === 'chispas') {
      const C = e.colores || ['#ffffff', '#ff8ad8', '#c46cff', '#fff27a'];
      for (let i = 0; i < 14; i++) {
        if (k > 0.5 + hash(i, 4) * 0.4) continue;
        const a = -Math.PI * (0.1 + 0.8 * hash(i, 1)), v = 40 + hash(i, 2) * 50;
        lc.fillStyle = C[i % C.length];
        lc.fillRect(Math.round(x + Math.cos(a) * v * k * (hash(i, 3) < 0.5 ? -1 : 1)), Math.round(y + Math.sin(a) * v * k + 90 * k * k), i % 3 ? 1 : 2, i % 3 ? 1 : 2);
      }
      if (e.espirales && k < 0.7) { lc.globalAlpha = 1 - k / 0.7; for (let i = 0; i < 3; i++) lc.drawImage(ESPIRAL_PEQ, Math.round(x - 2 + (i - 1) * 26 * k), Math.round(y - 8 - 22 * k - (i === 1 ? 8 * k : 0))); }
    } else if (e.tipo === 'tajo') {
      lc.globalAlpha = 1 - k / 0.35;
      for (let i = 0; i < 14; i++) { const a = -2.4 + i * 0.16 + k * 1.2; lc.fillStyle = i % 3 ? '#fff6c0' : '#ffffff'; lc.fillRect(Math.round(x + Math.cos(a) * 11), Math.round(y + Math.sin(a) * 9), 2, 1); }
    } else if (e.tipo === 'laser') {
      const fx = Math.round(CAM.x + e.ax), fy = Math.round(CAM.y + e.ay), n = 24, hasta = Math.min(1, k / 0.15);
      for (let i = 0; i <= n * hasta; i++) { const px = Math.round(fx + (x - fx) * i / n), py = Math.round(fy + (y - fy) * i / n); lc.fillStyle = '#5ee0f0'; lc.fillRect(px - 1, py, 3, 1); lc.fillStyle = '#ffffff'; lc.fillRect(px, py, 1, 1); }
    } else if (e.tipo === 'numero') {
      const salto = k < 0.45 ? -Math.sin(k / 0.45 * Math.PI) * 12 : k < 0.7 ? -Math.sin((k - 0.45) / 0.25 * Math.PI) * 3 : 0;
      if (k > 1.2 && Math.floor(k * 20) % 2) continue;
      if (e.fallo) escribe(lc, e.texto, x, Math.round(y + salto), '#c8d4ff', '#101438', 'centro');
      else escribeGordo(lc, e.texto, x, Math.round(y + salto));
    }
    lc.globalAlpha = 1;
  }
}
function brilloFarol(x, y, t) {
  const p = 0.16 + Math.sin(t * 9) * 0.03 + Math.sin(t * 23) * 0.02;
  lc.globalAlpha = p; lc.fillStyle = '#ffd86a';
  for (let r = 9; r > 0; r -= 3) for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(r * r - dy * dy)); lc.fillRect(Math.round(x - dx), Math.round(y + dy), dx * 2 + 1, 1); }
  lc.globalAlpha = 1;
}

/* ---------- un fotograma ---------- */
function pinta(t) {
  const CX = CAM.x, CY = CAM.y;
  lc.drawImage(FONDO, Math.round(-60 + (CX - 118) * 0.18), Math.round(-40 + (CY - 20) * 0.12));
  if (NUBES) { const dx = Math.round(-((t * 4) % FW)) + Math.round((CX - 118) * 0.25), y = HORIZONTE - 52 + Math.round((CY - 20) * 0.12); lc.drawImage(NUBES, dx, y); lc.drawImage(NUBES, dx + FW * 2, y); }
  if (ESC.enemigo === 'becario') pintaLetrero(lc, t, Math.round(-60 + (CX - 118) * 0.18) + 268, Math.round(-40 + (CY - 20) * 0.12) + 44);
  const porProf = new Map();
  for (const u of J.unidades) {
    if (!u.vivo && !u.muere) continue;
    const d = u.encima ? u.encima.gx + u.encima.gy : Math.round(u.fx + u.dx + u.fy + u.dy);
    if (!porProf.has(d)) porProf.set(d, []);
    porProf.get(d).push(u);
  }
  for (let d = 0; d <= 2 * (N - 1); d++) {
    for (let gx = 0; gx < N; gx++) {
      const gy = d - gx; if (gy < 0 || gy >= N) continue;
      const T = CASILLAS[gy * N + gx], X = Math.round(CX + wx(gx, gy)), Y = Math.round(CY + wy(gx, gy, T.h));
      if (X > LW + 2 || X < -34 || Y > LH + 4 || Y + T.c.height < -2) continue;
      lc.drawImage(T.c, X, Y);
      if (T.agua) pintaAgua(lc, ESC, gx, gy, X, Y, t);
      const k = gx + ',' + gy;
      if (J.marcas.azul && J.marcas.azul.has(k)) marca(lc, X, Y, 'azul', t);
      if (J.marcas.rojo && J.marcas.rojo.has(k)) marca(lc, X, Y, J.previa && J.previa.o.gx === gx && J.previa.o.gy === gy ? 'rojo' : 'rosa', t);
      if (J.cursor && J.cursor[0] === gx && J.cursor[1] === gy && J.fase === 'jugador') cursor(lc, X, Y, t);
    }
    for (let gx = 0; gx < N; gx++) {
      const gy = d - gx; if (gy < 0 || gy >= N) continue;
      const pr = ESC.props.find(q => q[0] === gx && q[1] === gy);
      if (!pr) continue;
      const [px, py] = pantalla(gx, gy, altura(gx, gy));
      pintaSpr(lc, spr(pr[2]), px, py);
      if (pr[2] === 'farol') brilloFarol(px, py - 21, t);
    }
    for (const u of (porProf.get(d) || []).sort((a, b) => a.fx - b.fx)) pintaUnidad(u, t);
  }
  if (ESC.luciernagas) pintaLuciernagas(lc, t, Math.round((CX - 118) * 0.6), Math.round(CY * 0.3) - 10);
  pintaEfectos();
  if (J.sel && J.fase === 'jugador' && !J.ocupado) { const [x, y] = pantalla(J.sel.fx, J.sel.fy, J.sel.fh); lc.drawImage(FLECHA, x - 4, y - (J.sel.tipo === 'conejo' ? 54 : 46) + (Math.floor(t * 3) % 2)); }
  pintaUI(t);
  if (J.destello > 0) { lc.globalAlpha = 0.3 * J.destello / 0.08; lc.fillStyle = '#ffffff'; lc.fillRect(0, 0, LW, LH); lc.globalAlpha = 1; }
}
