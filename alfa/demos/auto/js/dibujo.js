// Fans of Auto · EL DIBUJO del barrio: la cámara sigue al jugador desde arriba y se aleja cuanto más corre (como el GTA de
// la primera PlayStation), el suelo se pega por trozos, los coches y la gente se giran con el píxel gordo y los edificios
// tienen falso 3D: el tejado se desplaza hacia fuera según lo lejos que esté del centro de la pantalla y lo alto que sea,
// y se ven las paredes que miran al centro. Se dibuja de lejos a cerca para que lo cercano tape a lo lejano.
'use strict';

const J = { W: 320, H: 240, estado: 'carga', cam: { x: 0, y: 0, z: 1 }, ctx: null };
const PERSPECTIVA = 0.11;   // cuánto se inclina cada planta

function pasoCamara() {
  const j = S.jugadores[0], c = j.coche !== null ? S.coches.find(c => c.id === j.coche) : null;
  const vx = c ? c.vx : 0, vy = c ? c.vy : 0, v = Math.hypot(vx, vy);
  const tx = (c ? c.x : j.x) + vx * 14, ty = (c ? c.y : j.y) + vy * 14;
  const tz = 1 - Math.min(0.38, v / 4.2 * 0.38);
  const k = J.cam.inicio ? 1 : 0.1;
  J.cam.x += (tx - J.cam.x) * k; J.cam.y += (ty - J.cam.y) * k; J.cam.z += (tz - J.cam.z) * 0.035;
  J.cam.inicio = false;
}
const sx = wx => (wx - J.cam.x) * J.cam.z + J.W / 2;
const sy = wy => (wy - J.cam.y) * J.cam.z + J.H / 2;

// un sprite girado en (x, y) del mundo; con sombra (desplazada) si se pide
function pintaSprite(g, spr, x, y, ang, sombra) {
  const z = J.cam.z;
  if (sombra && AJUSTES.detalle !== 'bajo') {
    g.globalAlpha = 0.3; g.setTransform(z, 0, 0, z, sx(x) + 2 * z, sy(y) + 2 * z); g.rotate(ang);
    g.fillStyle = '#000'; g.fillRect(-spr.width / 2 + 1, -spr.height / 2 + 1, spr.width - 2, spr.height - 2); g.globalAlpha = 1;
  }
  g.setTransform(z, 0, 0, z, sx(x), sy(y)); g.rotate(ang);
  g.drawImage(spr, -spr.width >> 1, -spr.height >> 1);
  g.setTransform(1, 0, 0, 1, 0, 0);
}
// alrededor del barrio hay agua (como en los clásicos: la ciudad era una isla)
let AGUA = null;
function pintaAgua(g) {
  if (!AGUA) {
    const [c, q] = lienzoNuevo(32, 32), az = Azar(5);
    rect(q, 0, 0, 32, 32, '#2a4a66'); motas(q, 0, 0, 32, 32, '#2f5370', 40, az);
    for (let i = 0; i < 5; i++) rect(q, az.entero(0, 26), az.entero(0, 31), az.entero(3, 6), 1, '#4b7a9c');
    AGUA = g.createPattern(c, 'repeat');
  }
  const z = J.cam.z;
  g.save(); g.translate(sx(0), sy(0)); g.scale(z, z); g.fillStyle = AGUA; g.fillRect(-sx(0) / z, -sy(0) / z, J.W / z + 1, J.H / z + 1); g.restore();
  // el muelle: una franja oscura en el borde del barrio
  g.fillStyle = '#1e2a38';
  const x0 = Math.round(sx(0)), y0 = Math.round(sy(0)), x1 = Math.round(sx(MAPA.W * T)), y1 = Math.round(sy(MAPA.H * T)), m = Math.max(2, Math.round(3 * z));
  g.fillRect(x0 - m, y0 - m, x1 - x0 + 2 * m, m); g.fillRect(x0 - m, y1, x1 - x0 + 2 * m, m); g.fillRect(x0 - m, y0, m, y1 - y0); g.fillRect(x1, y0, m, y1 - y0);
}
function pintaSuelo(g) {
  const z = J.cam.z, tam = TROZO * T;
  const x0 = Math.max(0, Math.floor((J.cam.x - J.W / 2 / z) / tam)), x1 = Math.min(SUELO.nx - 1, Math.floor((J.cam.x + J.W / 2 / z) / tam));
  const y0 = Math.max(0, Math.floor((J.cam.y - J.H / 2 / z) / tam)), y1 = Math.min(SUELO.ny - 1, Math.floor((J.cam.y + J.H / 2 / z) / tam));
  for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) {
    const X = Math.round(sx(i * tam)), Y = Math.round(sy(j * tam)), X2 = Math.round(sx((i + 1) * tam)), Y2 = Math.round(sy((j + 1) * tam));
    g.drawImage(SUELO.trozos[j * SUELO.nx + i], X, Y, X2 - X, Y2 - Y);
  }
  g.fillStyle = 'rgba(214,226,245,0.14)'; g.fillRect(0, 0, J.W, J.H);   // el velo frío de la nieve
}
function enVista(x, y, m = 40) { const z = J.cam.z; return Math.abs(x - J.cam.x) < J.W / 2 / z + m && Math.abs(y - J.cam.y) < J.H / 2 / z + m; }

function pintaCosas(g) {
  const j = S.jugadores[0], z = J.cam.z;
  // objetos y teléfonos
  for (const t of S.telefonos) if (enVista(t.x, t.y)) pintaSprite(g, ARTE.cabina[t.suena && (S.tick >> 3) & 1 ? 1 : 0], t.x, t.y, 0, false);
  for (const o of S.objetos) if (enVista(o.x, o.y)) { const spr = ARTE.objetos[o.tipo]; if (spr) pintaSprite(g, spr, o.x, o.y - ((o.t >> 4) & 1), 0, false); }
  // los muertos en el suelo (aplastados), luego los coches, la gente, el jugador
  for (const p of S.peatones) if (p.muerto && enVista(p.x, p.y)) { g.setTransform(z, 0, 0, z, sx(p.x), sy(p.y)); g.rotate(p.ang); g.globalAlpha = 0.9; g.drawImage(fotoPeaton(p.estilo)[0], -5, -3, 11, 6); g.globalAlpha = 1; g.setTransform(1, 0, 0, 1, 0, 0); }
  for (const c of S.coches) if (c.chatarra && enVista(c.x, c.y)) pintaSprite(g, fotoChatarra(c.tipo), c.x, c.y, c.ang, true);
  for (const c of S.coches) if (!c.chatarra && enVista(c.x, c.y)) pintaSprite(g, fotoCoche(c.tipo, c.color), c.x, c.y, c.ang, true);
  for (const p of S.peatones) if (!p.muerto && enVista(p.x, p.y)) pintaSprite(g, fotoPeaton(p.estilo)[p.cuadro], p.x, p.y, p.ang, true);
  if (j.coche === null && !j.muerto && !j.baneado) pintaSprite(g, ARTE.conejo[j.cuadro], j.x, j.y, j.ang, true);
  // las luces de los Moderadores
  pintaSirenas(g);
  pintaManguera(g);
  // balas y efectos
  g.fillStyle = '#fff4b8';
  for (const b of S.balas) g.fillRect(Math.round(sx(b.x)) - 1, Math.round(sy(b.y)) - 1, 2, 2);
  for (const f of S.fx) {
    if (!enVista(f.x, f.y)) continue;
    if (f.tipo === 'humo') { const k = f.t > 25 ? 0 : f.t > 12 ? 1 : 2; g.globalAlpha = 0.6; pintaSprite(g, ARTE.humo[2 - k], f.x, f.y, 0, false); g.globalAlpha = 1; }
    else if (f.tipo === 'fuego') pintaSprite(g, ARTE.fuego[f.t > 14 ? 2 : f.t > 7 ? 1 : 0], f.x, f.y, 0, false);
    else if (f.tipo === 'nieve') { g.fillStyle = 'rgba(240,246,255,' + Math.min(1, f.t / 12).toFixed(2) + ')'; g.fillRect(Math.round(sx(f.x)), Math.round(sy(f.y)), Math.max(1, Math.round(z)), Math.max(1, Math.round(z))); }
    else if (f.tipo === 'dinero') escribe(g, f.texto, sx(f.x), sy(f.y), { fuente: 'mini', c: '#ffd23c', borde: TINTA, alin: 'centro' });
    else if (f.tipo === 'frase') escribe(g, f.texto, sx(f.x), sy(f.y), { fuente: 'mini', c: '#ffffff', borde: TINTA, alin: 'centro' });
  }
  // sin misión, una flecha verde hacia la cabina que suena más cerca
  if (!S.mision && !j.muerto) {
    let mejor = null, md = 1e9;
    for (const t of S.telefonos) if (t.suena) { const d = dist(j, t); if (d < md) { md = d; mejor = t; } }
    if (mejor && md > 30) {
      const pj = j.coche !== null ? S.coches.find(c => c.id === j.coche) || j : j, a = anguloHacia(pj, mejor);
      const X = sx(pj.x) + Math.cos(a) * 22 * z, Y = sy(pj.y) + Math.sin(a) * 22 * z;
      g.setTransform(1, 0, 0, 1, X, Y); g.rotate(a);
      g.fillStyle = '#141418'; g.beginPath(); g.moveTo(7, 0); g.lineTo(-5, -6); g.lineTo(-2, 0); g.lineTo(-5, 6); g.closePath(); g.fill();
      g.fillStyle = ZONA_COLOR[mejor.banda]; g.beginPath(); g.moveTo(5, 0); g.lineTo(-3, -4); g.lineTo(-1, 0); g.lineTo(-3, 4); g.closePath(); g.fill();
      g.setTransform(1, 0, 0, 1, 0, 0);
    }
  }
  // la flecha hacia el objetivo de la misión (como la flecha amarilla de los clásicos)
  if (S.mision) {
    const p = S.mision.datos.pasos[S.mision.paso], L = p.tipo === 'coche' ? S.coches.find(c => c.id === S.mision.cocheId) : p.tipo === 'coger' ? S.objetos.find(o => o.id === S.mision.objetoId) : MAPA.lugares[p.donde];
    if (L) {
      const pj = j.coche !== null ? S.coches.find(c => c.id === j.coche) || j : j, a = anguloHacia(pj, L);
      const X = sx(pj.x) + Math.cos(a) * 22 * z, Y = sy(pj.y) + Math.sin(a) * 22 * z;
      g.setTransform(1, 0, 0, 1, X, Y); g.rotate(a);
      g.fillStyle = '#141418'; g.beginPath(); g.moveTo(7, 0); g.lineTo(-5, -6); g.lineTo(-2, 0); g.lineTo(-5, 6); g.closePath(); g.fill();
      g.fillStyle = (S.tick >> 4) & 1 ? '#ffd23c' : '#fff4b8'; g.beginPath(); g.moveTo(5, 0); g.lineTo(-3, -4); g.lineTo(-1, 0); g.lineTo(-3, 4); g.closePath(); g.fill();
      g.setTransform(1, 0, 0, 1, 0, 0);
      if (enVista(L.x, L.y) && dist(pj, L) > 20) { g.globalAlpha = 0.35 + 0.25 * Math.sin(S.tick * 0.15); g.fillStyle = '#ffd23c'; g.beginPath(); g.arc(sx(L.x), sy(L.y), (L.r || 14) * z, 0, 7); g.fill(); g.globalAlpha = 1; }
    }
  }
}

// los árboles: copa con un poco de altura y sombra
function pintaArboles(g) {
  const z = J.cam.z;
  for (const a of MAPA.arboles) {
    if (!enVista(a.x, a.y, 24)) continue;
    const X = sx(a.x), Y = sy(a.y), f = 0.6 * PERSPECTIVA, rx = X + (X - J.W / 2) * f, ry = Y + (Y - J.H / 2) * f;
    if (AJUSTES.detalle !== 'bajo') { g.globalAlpha = 0.3; g.fillStyle = '#000'; g.beginPath(); g.arc(X + 3 * z, Y + 3 * z, 7 * z, 0, 7); g.fill(); g.globalAlpha = 1; }
    g.fillStyle = '#4a3520'; g.fillRect(Math.round(X - z), Math.round(Y - z), Math.ceil(2 * z), Math.ceil(2 * z));
    g.drawImage(ARTE.arbol, Math.round(rx - 8 * z), Math.round(ry - 8 * z), Math.ceil(16 * z), Math.ceil(16 * z));
  }
}

// los edificios con falso 3D
function pintaEdificios(g) {
  const z = J.cam.z, cx = J.W / 2, cy = J.H / 2, lista = [];
  for (const e of MAPA.edificios) {
    const x0 = sx(e.x * T), y0 = sy(e.y * T), x1 = sx((e.x + e.w) * T), y1 = sy((e.y + e.h) * T), f = 1 + e.alt * PERSPECTIVA;
    const rx0 = cx + (x0 - cx) * f, ry0 = cy + (y0 - cy) * f, rx1 = cx + (x1 - cx) * f, ry1 = cy + (y1 - cy) * f;
    if (Math.max(x1, rx1) < -4 || Math.min(x0, rx0) > J.W + 4 || Math.max(y1, ry1) < -4 || Math.min(y0, ry0) > J.H + 4) continue;
    const mx = (x0 + x1) / 2 - cx, my = (y0 + y1) / 2 - cy;
    lista.push({ e, x0, y0, x1, y1, rx0, ry0, rx1, ry1, d: mx * mx + my * my });
  }
  lista.sort((a, b) => b.d - a.d);
  for (const B of lista) {
    const E = ESTILOS[B.e.estilo], pared = B.e.tejado === 'comisaria' ? '#d8d6d0' : E.pared;
    // cada pared que mira al centro: un polígono entre el borde de la base y el del tejado
    const paredes = [];
    if (B.x0 > cx) paredes.push({ p: [[B.x0, B.y0], [B.x0, B.y1], [B.rx0, B.ry1], [B.rx0, B.ry0]], c: oscuro(pared, 0.28), v: true });
    if (B.x1 < cx) paredes.push({ p: [[B.x1, B.y0], [B.x1, B.y1], [B.rx1, B.ry1], [B.rx1, B.ry0]], c: oscuro(pared, 0.2), v: true });
    if (B.y0 > cy) paredes.push({ p: [[B.x0, B.y0], [B.x1, B.y0], [B.rx1, B.ry0], [B.rx0, B.ry0]], c: oscuro(pared, 0.1), v: false });
    if (B.y1 < cy) paredes.push({ p: [[B.x0, B.y1], [B.x1, B.y1], [B.rx1, B.ry1], [B.rx0, B.ry1]], c: oscuro(pared, 0.4), v: false });
    for (const P of paredes) {
      g.fillStyle = P.c; g.beginPath(); g.moveTo(P.p[0][0], P.p[0][1]); for (let i = 1; i < 4; i++) g.lineTo(P.p[i][0], P.p[i][1]); g.closePath(); g.fill();
      // las ventanas: una fila por planta, a lo largo de la pared (no en los edificios bajos vistos de lejos)
      if (AJUSTES.detalle === 'bajo' && z < 0.8) continue;
      const [a, b, c2, d] = P.p, largo = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.floor(largo / (7 * z))), alt = B.e.alt;
      g.fillStyle = E.ventana;
      for (let k = 0; k < alt; k++) {
        const t = (k + 0.55) / alt;
        for (let i = 0; i < n; i++) {
          const u = (i + 0.5) / n;
          const bx = a[0] + (b[0] - a[0]) * u, by = a[1] + (b[1] - a[1]) * u, tx = d[0] + (c2[0] - d[0]) * u, ty = d[1] + (c2[1] - d[1]) * u;
          const wx = bx + (tx - bx) * t, wy = by + (ty - by) * t, s = Math.max(1, Math.round(2.4 * z));
          g.fillRect(Math.round(wx - s / 2), Math.round(wy - s / 2), s, s);
        }
      }
    }
    // el tejado
    const tej = fotoTejado(B.e);
    g.drawImage(tej, Math.round(B.rx0), Math.round(B.ry0), Math.round(B.rx1) - Math.round(B.rx0), Math.round(B.ry1) - Math.round(B.ry0));
  }
}

function pintaMundo(g) {
  g.imageSmoothingEnabled = false;
  pintaAgua(g);
  // el temblor de los choques
  const sac = J.sacude || 0;
  if (sac > 0.3) { g.save(); g.translate(Math.round((Math.random() - 0.5) * sac * 2), Math.round((Math.random() - 0.5) * sac * 2)); J.sacude = sac * 0.85; }
  pintaSuelo(g);
  pintaMarcas(g);
  pintaSemaforos(g);
  pintaCosas(g);
  pintaFarolas(g);
  pintaArboles(g);
  pintaEdificios(g);
  pintaNoche(g);
  pintaNieve(g);
  if (sac > 0.3) g.restore();
}

/* ---------- las marcas de rueda: una capa del tamaño del barrio que se va ensuciando ---------- */
let RODADAS = null, RODADAS_G = null;
function pintaMarcas(g) {
  if (!RODADAS) { [RODADAS, RODADAS_G] = lienzoNuevo(MAPA.W * T, MAPA.H * T); }
  for (const m of S.marcas) { RODADAS_G.globalAlpha = 0.18 + 0.3 * m.f; RODADAS_G.fillStyle = '#15171c'; RODADAS_G.fillRect(Math.round(m.x) - 1, Math.round(m.y) - 1, 2, 2); }
  S.marcas.length = 0;
  const z = J.cam.z;
  g.drawImage(RODADAS, Math.round(sx(0)), Math.round(sy(0)), Math.round(MAPA.W * T * z), Math.round(MAPA.H * T * z));
}

/* ---------- las farolas: en las esquinas de cada manzana ---------- */
let FAROLAS = null;
function farolas() {
  if (FAROLAS) return FAROLAS;
  FAROLAS = [];
  for (let by = 0; by < 4; by++) for (let bx = 0; bx < 5; bx++) for (const [i, j] of [[2, 2], [9, 2], [2, 9], [9, 9]]) {
    const tx = COLS[bx] + i, ty = FILAS[by] + j;
    if (tipoEn(tx, ty) === TIPO.ACERA || tipoEn(tx, ty) === TIPO.HIERBA) FAROLAS.push({ x: tx * T + T / 2, y: ty * T + T / 2 });
  }
  return FAROLAS;
}
function pintaFarolas(g) {
  const z = J.cam.z, f = 0.5 * PERSPECTIVA, noche = oscuridad() > 0.3;
  for (const F of farolas()) {
    if (!enVista(F.x, F.y, 20)) continue;
    const X = sx(F.x), Y = sy(F.y), tx = X + (X - J.W / 2) * f, ty = Y + (Y - J.H / 2) * f;
    g.strokeStyle = '#2a2c33'; g.lineWidth = Math.max(1, 1.5 * z); g.beginPath(); g.moveTo(X, Y); g.lineTo(tx, ty); g.stroke();
    g.fillStyle = noche ? '#ffe39a' : '#9a9a9e'; g.fillRect(Math.round(tx - z), Math.round(ty - z), Math.max(1, Math.round(2 * z)), Math.max(1, Math.round(2 * z)));
  }
}

/* ---------- la noche: una capa oscura con agujeros para las farolas y los faros ---------- */
function pintaNoche(g) {
  const o = oscuridad();
  if (o <= 0.02) return;
  const z = J.cam.z, bajo = AJUSTES.detalle === 'bajo';
  if (!J.luz || J.luz.width !== J.W || J.luz.height !== J.H) { const [c, q] = lienzoNuevo(J.W, J.H); J.luz = c; J.luzG = q; }
  const L = J.luzG;
  L.globalCompositeOperation = 'source-over'; L.globalAlpha = 1;
  L.clearRect(0, 0, J.W, J.H); L.fillStyle = 'rgba(8,12,34,' + (0.78 * o).toFixed(3) + ')'; L.fillRect(0, 0, J.W, J.H);
  L.globalCompositeOperation = 'destination-out';
  for (const F of farolas()) if (enVista(F.x, F.y, 50)) agujero(L, sx(F.x), sy(F.y), 46 * z, 0.85, bajo);
  const j = S.jugadores[0];
  for (const c of S.coches) if (!c.chatarra && enVista(c.x, c.y, 90) && (c.conductor !== null || c.policia)) faros(L, c, z, c.conductor === j.id ? 1 : 0.7, bajo);
  if (j.coche === null && !j.muerto) agujero(L, sx(j.x), sy(j.y), 22 * z, 0.5, bajo);
  L.globalCompositeOperation = 'source-over';
  g.drawImage(J.luz, 0, 0);
  // el brillo cálido de las farolas
  if (!bajo) { g.globalAlpha = 0.16 * o; g.fillStyle = '#ffd27a'; for (const F of farolas()) if (enVista(F.x, F.y, 50)) { g.beginPath(); g.arc(sx(F.x), sy(F.y), 30 * z, 0, 7); g.fill(); } g.globalAlpha = 1; }
}
function agujero(L, X, Y, R, fuerza, bajo) {
  if (bajo) { L.fillStyle = 'rgba(0,0,0,' + (fuerza * 0.7).toFixed(2) + ')'; L.beginPath(); L.arc(X, Y, R * 0.8, 0, 7); L.fill(); return; }
  const gr = L.createRadialGradient(X, Y, 1, X, Y, R); gr.addColorStop(0, 'rgba(0,0,0,' + fuerza + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  L.fillStyle = gr; L.fillRect(X - R, Y - R, 2 * R, 2 * R);
}
function faros(L, c, z, k, bajo) {
  const D = COCHES[c.tipo], a = c.ang, cs = Math.cos(a), sn = Math.sin(a);
  const X = sx(c.x + cs * (D.l / 2 - 1)), Y = sy(c.y + sn * (D.l / 2 - 1)), len = 72 * z * k, ancho = 0.4;
  L.save(); L.beginPath(); L.moveTo(X, Y); L.lineTo(X + Math.cos(a - ancho) * len, Y + Math.sin(a - ancho) * len); L.lineTo(X + Math.cos(a + ancho) * len, Y + Math.sin(a + ancho) * len); L.closePath(); L.clip();
  agujero(L, X, Y, len, 0.9, bajo);
  L.restore();
}

/* ---------- la nieve: copos en pantalla y un velo frío sobre el barrio ---------- */
function pintaNieve(g) {
  const n = AJUSTES.detalle === 'bajo' ? 30 : 80;
  if (!J.copos || J.copos.length !== n) J.copos = Array.from({ length: n }, () => ({ x: Math.random() * J.W, y: Math.random() * J.H, v: 0.4 + Math.random() * 0.7, f: Math.random() * 6.28, g: Math.random() < 0.3 ? 2 : 1 }));
  g.fillStyle = 'rgba(235,242,255,0.85)';
  for (const c of J.copos) {
    c.y += c.v; c.f += 0.03; c.x += Math.sin(c.f) * 0.3 - 0.15;
    if (c.y > J.H) { c.y = -2; c.x = Math.random() * J.W; } if (c.x < 0) c.x = J.W;
    g.fillRect(Math.round(c.x), Math.round(c.y), c.g, c.g);
  }
}
