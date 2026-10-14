// Fans of Dark · el motor retro: la mazmorra vista desde los ojos del animal, como los shooters de los 90 (un rayo por columna de pantalla,
// píxel gordo, paredes de una pieza y personajes planos que siempre te miran). Luz: la antorcha del héroe se pierde en la oscuridad,
// las antorchas de las paredes dejan charcos de luz y la niebla lo tiñe todo de morado. Pinta lo que hay en G (juego.js): aquí no hay reglas.
// Expone DK3D con las mismas funciones que tenía la versión 3D (iniciar, construir, pintar, limpiar, pintarMenu), así interfaz.js no cambia.
'use strict';
const RT_ALTO_PARED = 1.6, RT_OJOS = 0.75, RT_LEJOS = 14;   // en casillas: las paredes son más altas que anchas; los ojos del animal, a tres cuartos; más allá de 14 todo es negro
const RT_ESTILOS = {   // [pared, suelo] de cada facción (pixel.js)
  nomuertos: ['piedra', 'losas'], streamers: ['paneles', 'moqueta'], heroes: ['bloques', 'baldosas'], ciber: ['paneles', 'rejilla'], memes: ['madera', 'tablas'],
  gamer: ['paneles', 'moqueta'], olvidados: ['madera', 'tablas'], pop: ['bloques', 'baldosas'], microblizz: ['paneles', 'moqueta'], phony: ['paneles', 'baldosas'],
};
const RT = { cv: null, ctx: null, W: 0, H: 0, buf: null, B: null, zb: null, plano: 0.58, focal: 1, horiz: 0, mundo: null, t: 0, fx: [], flash: null, sacudida: 0,
  arma: { t: 0, bob: 0 }, L: [1, 0, false], TL: [1, 1, 1], cerca: [], alcance: 7, nieblaOn: false, N: null };

/* ---------- arranque y tamaño ---------- */
function rtIniciar(canvas) {
  RT.cv = canvas; RT.ctx = canvas.getContext('2d', { alpha: false });
  rtAjustar(); addEventListener('resize', rtAjustar);
}
function rtAjustar() {
  if (!RT.cv) return;
  const vertical = innerHeight > innerWidth, escala = Math.max(1, Math.min(innerWidth, innerHeight) / (vertical ? 185 : 400));
  RT.W = Math.max(96, Math.min(800, Math.round(innerWidth / escala))); RT.H = Math.max(96, Math.min(800, Math.round(innerHeight / escala)));
  RT.cv.width = RT.W; RT.cv.height = RT.H; RT.ctx.imageSmoothingEnabled = false;
  RT.plano = vertical ? 0.58 : 0.77; RT.focal = (RT.W / 2) / RT.plano; RT.horiz = Math.round(RT.H * (vertical ? 0.45 : 0.5));
  RT.buf = RT.ctx.createImageData(RT.W, RT.H); RT.B = RT.buf.data; RT.zb = new Float32Array(RT.W);
}

/* ---------- construir la mazmorra de una partida ---------- */
function rtConstruir(G) {
  rtLimpiar();
  const D = DK_MAZMORRAS[G.fac], [ep, es] = RT_ESTILOS[G.fac] || ['piedra', 'losas'], m = G.m;
  const M = { fac: G.fac, D, luz: pxHex(D.luz), pared: [pxPared(ep, D.pared, D.luz, 7), pxPared(ep, D.pared, D.luz, 19)], suelo: pxSuelo(es, D.suelo, D.luz), techo: pxTecho(D.techo, D.luz),
    puerta: pxPuerta(D.pared), luces: [], antorchas: [], props: [], tiposProp: (DK_FORMAS[G.fac] || {}).props || ['pilar'] };
  M.secreto = pxSecreto(M.pared[0]);
  // antorchas: una en medio de la pared de arriba de cada sala (y otra abajo si la sala es grande), pegadas a la pared y mirando a la sala
  for (const s of m.salas) {
    const lados = s.w * s.h > 48 ? [[s.cx + 0.5, s.y + 0.12], [s.cx + 0.5, s.y + s.h - 0.12]] : [[s.cx + 0.5, s.y + 0.12]];
    for (const [x, y] of lados) { if (!dkSuelo(m, Math.floor(x), Math.floor(y))) continue; M.antorchas.push({ x, y, fase: Math.floor(Math.random() * 3), t: Math.random() * 3 }); M.luces.push({ x, y, r: 3.4, r2: 3.4 * 3.4, i: 0.75 }); }
  }
  for (const o of m.props) M.props.push({ x: o.x, y: o.y, s: pxProp(M.tiposProp[o.n % M.tiposProp.length], D.luz) });
  RT.TL = [M.luz[0] / 255 * 1.15, M.luz[1] / 255 * 1.15, M.luz[2] / 255 * 1.15];
  RT.mundo = M; RT.fx = []; RT.flash = null; RT.sacudida = 0; RT.arma = { t: 0, bob: 0, k: G.heroe, c: pxArma(G.heroe) };
}
function rtLimpiar() { RT.mundo = null; RT.fx = []; RT.flash = null; }
function rtPintarMenu() { if (RT.ctx) { RT.ctx.fillStyle = '#0b0812'; RT.ctx.fillRect(0, 0, RT.W, RT.H); } }

/* ---------- la luz en un punto del mundo: la del héroe (se apaga con la distancia), las antorchas y la niebla ---------- */
function rtLuz(wx, wy, P) {
  const L = RT.L, dx = wx - P.x, dy = wy - P.y, d = Math.sqrt(dx * dx + dy * dy);
  let lp = 1 - d / RT.alcance; lp = lp <= 0 ? 0 : lp * Math.sqrt(lp) * 1.15 + 0.03;
  let lt = 0;
  for (const o of RT.cerca) { const ox = wx - o.x, oy = wy - o.y, dd = ox * ox + oy * oy; if (dd < o.r2) { const f = 1 - Math.sqrt(dd) / o.r; lt += f * f * o.i; } }
  let niebla = false;
  if (RT.nieblaOn) { const nx = wx - RT.N.cx, ny = wy - RT.N.cy; if (nx * nx + ny * ny > RT.N.r * RT.N.r) { niebla = true; lp *= 0.45; lt *= 0.3; } }
  L[0] = lp; L[1] = lt; L[2] = niebla;
}
// pinta un píxel (i = índice del byte) con la luz que haya en RT.L
function rtPon(i, r, g, b) {
  const L = RT.L, B = RT.B, lp = L[0], lt = L[1], TL = RT.TL;
  let R = r * lp + r * lt * TL[0], Gc = g * lp + g * lt * TL[1], Bc = b * lp + b * lt * TL[2];
  if (L[2]) { R = R * 0.5 + 8; Gc = Gc * 0.3; Bc = Bc * 0.6 + 16; }
  B[i] = R > 255 ? 255 : R; B[i + 1] = Gc > 255 ? 255 : Gc; B[i + 2] = Bc > 255 ? 255 : Bc; B[i + 3] = 255;
}

/* ---------- un fotograma ---------- */
function rtPintar(G) {
  const M = RT.mundo; if (!M || !RT.ctx) return;
  const P = G.p, m = G.m, W = RT.W, H = RT.H, B = RT.B, zb = RT.zb, focal = RT.focal, horiz = RT.horiz;
  const ahora = performance.now() / 1000, dt = Math.min(0.1, ahora - (RT.t || ahora)); RT.t = ahora;
  RT.alcance = 9 + Math.sin(ahora * 9) * 0.12 + Math.sin(ahora * 23) * 0.06;   // la antorcha del héroe tiembla un poco
  RT.nieblaOn = G.t > DK_NIEBLA.espera; RT.N = G.niebla;
  RT.cerca = M.luces.filter(o => Math.abs(o.x - P.x) < RT_LEJOS + o.r && Math.abs(o.y - P.y) < RT_LEJOS + o.r);
  const dirX = Math.cos(P.ang), dirY = Math.sin(P.ang), plX = -dirY * RT.plano, plY = dirX * RT.plano;
  const TS = M.suelo.data, TT = M.techo.data;

  // suelo y techo: fila a fila; la luz se calcula cada 4 columnas (píxel gordo también en la luz)
  for (let y = 0; y < H; y++) {
    const p = y - horiz; if (p === 0) continue;
    const abajo = p > 0, rowDist = (abajo ? RT_OJOS : RT_ALTO_PARED - RT_OJOS) * focal / Math.abs(p);
    if (rowDist > RT_LEJOS) { for (let x = 0, i = y * W * 4; x < W; x++, i += 4) { B[i] = 0; B[i + 1] = 0; B[i + 2] = 0; B[i + 3] = 255; } continue; }
    const stepX = rowDist * 2 * plX / W, stepY = rowDist * 2 * plY / W, T = abajo ? TS : TT;
    let fx = P.x + rowDist * (dirX - plX), fy = P.y + rowDist * (dirY - plY);
    for (let x = 0, i = y * W * 4; x < W; x++, i += 4) {
      if ((x & 3) === 0) rtLuz(fx, fy, P);
      const k = (((fy * 64) & 63) * 64 + ((fx * 64) & 63)) * 4;
      rtPon(i, T[k], T[k + 1], T[k + 2]);
      fx += stepX; fy += stepY;
    }
  }
  // paredes: un rayo por columna
  for (let x = 0; x < W; x++) {
    const cam = 2 * x / W - 1, rdx = dirX + plX * cam, rdy = dirY + plY * cam;
    let mx = Math.floor(P.x), my = Math.floor(P.y), sx, sy, sdx, sdy, lado = 0, tipo = 0;
    const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy);
    if (rdx < 0) { sx = -1; sdx = (P.x - mx) * ddx; } else { sx = 1; sdx = (mx + 1 - P.x) * ddx; }
    if (rdy < 0) { sy = -1; sdy = (P.y - my) * ddy; } else { sy = 1; sdy = (my + 1 - P.y) * ddy; }
    for (let n = 0; n < 60; n++) { if (sdx < sdy) { sdx += ddx; mx += sx; lado = 0; } else { sdy += ddy; my += sy; lado = 1; } tipo = rtTipo(m, mx, my); if (tipo) break; }
    const dist = Math.max(0.02, lado === 0 ? sdx - ddx : sdy - ddy); zb[x] = dist;
    if (dist > RT_LEJOS) { for (let y = Math.max(0, horiz - RT_ALTO_PARED * focal / dist | 0), i = (y * W + x) * 4; y < Math.min(H, horiz + RT_OJOS * focal / dist | 0); y++, i += W * 4) { B[i] = 0; B[i + 1] = 0; B[i + 2] = 0; B[i + 3] = 255; } continue; }
    const hx = P.x + dist * rdx, hy = P.y + dist * rdy;   // el punto de la pared
    let wallX = lado === 0 ? hy : hx; wallX -= Math.floor(wallX);
    let tx = Math.floor(wallX * 64); if ((lado === 0 && rdx > 0) || (lado === 1 && rdy < 0)) tx = 63 - tx;
    const T = (tipo === 2 ? M.puerta : tipo === 4 ? M.secreto : M.pared[((mx * 7 + my * 13) % 5) === 0 ? 1 : 0]).data;
    rtLuz(hx, hy, P); if (lado === 1) { RT.L[0] *= 0.78; RT.L[1] *= 0.78; }
    const yTop = horiz - (RT_ALTO_PARED - RT_OJOS) * focal / dist, yBot = horiz + RT_OJOS * focal / dist, alto = yBot - yTop;
    const y0 = Math.max(0, Math.ceil(yTop)), y1 = Math.min(H - 1, Math.floor(yBot));
    for (let y = y0, i = (y0 * W + x) * 4; y <= y1; y++, i += W * 4) {
      const ty = ((y - yTop) / alto * 64) | 0, k = ((ty > 63 ? 63 : ty) * 64 + tx) * 4;
      rtPon(i, T[k], T[k + 1], T[k + 2]);
    }
  }

  // sprites: todo lo que está de pie en la mazmorra, de lejos a cerca, tapado por las paredes que tenga delante
  const lista = [];
  const mete = (x, y, s, alto, z, extra) => { const rx = x - P.x, ry = y - P.y; lista.push(Object.assign({ x, y, s, alto, z: z || 0, d: rx * rx + ry * ry }, extra)); };
  const escalaAlto = RT_ALTO_PARED / 2.6;   // las alturas de datos.js están en las unidades de la versión 3D (pared de 2,6)
  for (const o of M.antorchas) { o.t += dt; if (o.t > 0.12) { o.t = 0; o.fase = (o.fase + 1) % 3; } mete(o.x, o.y, pxAntorcha(o.fase, M.D.luz), 0.42, 0.78, { brilla: true }); }
  for (const o of M.props) mete(o.x, o.y, o.s, o.s.alto * RT_ALTO_PARED, 0);
  for (const c of G.cofres) mete(c.x, c.y, pxCofre(c.abierto), 0.36, 0);
  for (const b of G.botines) mete(b.x, b.y, pxBotin(b.o.tipo, b.o.rareza), 0.26, 0.04 + 0.04 * Math.sin(ahora * 4 + b.x * 3), { brilla: true });
  for (const o of G.portales) mete(o.x, o.y, o.abierto ? pxPortal(Math.floor(ahora * 6) % 4) : pxPortalCerrado(), o.abierto ? 1.25 : 1, 0.02, { brilla: o.abierto });
  for (const q of G.proy) mete(q.x, q.y, pxProyectil(q.color || '#ffb04f', !!q.area), q.area ? 0.3 : 0.2, RT_OJOS - 0.12, { brilla: true });
  for (const e of G.mons) {
    if (!e.viva) continue;
    const s = pxPersonaje(e.k, 64); if (!s) continue;
    const alto = e.alto * escalaAlto, lunge = e.ataqueT > 0 ? 1.12 : 1, paso = e.estado === 'caza' && e.avisoT <= 0 ? Math.abs(Math.sin(ahora * 9 + e.x)) * 0.03 : 0;
    mete(e.x, e.y, s, alto * lunge, paso, { e, flash: e.golpeT > 0 });
  }
  for (const f of RT.fx) if (f.s) mete(f.x, f.y, f.s, f.alto, f.z, { brilla: true, escY: f.escY });
  lista.sort((a, b) => b.d - a.d);
  const encimas = [];
  const invDet = 1 / (plX * dirY - dirX * plY);
  for (const o of lista) {
    const rx = o.x - P.x, ry = o.y - P.y, tX = invDet * (dirY * rx - dirX * ry), tY = invDet * (-plY * rx + plX * ry);
    if (tY <= 0.15) continue;
    const s = o.s, scx = (W / 2) * (1 + tX / tY), hPx = o.alto * focal / tY * (o.escY || 1), wPx = hPx * s.w / s.h / (o.escY || 1);
    if (scx + wPx / 2 < 0 || scx - wPx / 2 >= W || hPx < 1) continue;
    const yBot = horiz + (RT_OJOS - o.z) * focal / tY + hPx * (1 - s.pie), yTop = yBot - hPx;
    if (o.brilla) { RT.L[0] = 1; RT.L[1] = 0; RT.L[2] = false; if (RT.nieblaOn) { const nx = o.x - RT.N.cx, ny = o.y - RT.N.cy; if (nx * nx + ny * ny > RT.N.r * RT.N.r) RT.L[0] = 0.6; } }
    else { rtLuz(o.x, o.y, P); if (RT.L[0] + RT.L[1] < 0.03) continue; }
    const D = (o.flash ? s.flash : s.img).data, x0 = Math.max(0, Math.ceil(scx - wPx / 2)), x1 = Math.min(W - 1, Math.floor(scx + wPx / 2)), y0 = Math.max(0, Math.ceil(yTop)), y1 = Math.min(H - 1, Math.floor(yBot));
    for (let x = x0; x <= x1; x++) {
      if (tY >= zb[x]) continue;
      const sx = ((x - (scx - wPx / 2)) / wPx * s.w) | 0; if (sx < 0 || sx >= s.w) continue;
      for (let y = y0, i = (y0 * W + x) * 4; y <= y1; y++, i += W * 4) {
        const sy = ((y - yTop) / hPx * s.h) | 0, k = ((sy >= s.h ? s.h - 1 : sy) * s.w + sx) * 4; if (D[k + 3] < 128) continue;
        rtPon(i, D[k], D[k + 1], D[k + 2]);
      }
    }
    if (o.e) encimas.push([o.e, scx, yTop, tY]);
  }
  RT.ctx.putImageData(RT.buf, RT.sacudida > 0 ? (Math.random() * 6 - 3) | 0 : 0, RT.sacudida > 0 ? (Math.random() * 6 - 3) | 0 : 0);
  for (const [e, scx, yTop, tY] of encimas) rtEncima(e, scx, yTop, tY, W, H);
  RT.sacudida = Math.max(0, RT.sacudida - dt);
  rtEfectos(G, dt); rtArma(G, dt, W, H); rtMira(W, horiz);
}
// lo que va sobre la cabeza de un monstruo: el aviso de golpe (!) y las estrellitas del aturdimiento
function rtEncima(e, scx, yTop, tY, W, H) {
  let s = null;
  if (e.avisoT > 0) s = pxTexto('!', 16, '#ff5b5b'); else if (e.aturdido > 0) s = pxTexto('*', 12, '#ffd34d');
  if (!s) return;
  const esc = Math.max(1, Math.min(3, 2.2 / tY)), w = s.w * esc, h = s.h * esc, x0 = Math.round(scx - w / 2), y0 = Math.round(yTop - h - 2);
  if (y0 + h < 0 || y0 > H || x0 + w < 0 || x0 > W) return;
  const c = RT.ctx; c.save(); c.imageSmoothingEnabled = false; const cv = rtLienzoDe(s); c.drawImage(cv, x0, y0, w, h); c.restore();
}
const RT_LIENZOS = new Map();
function rtLienzoDe(s) { let c = RT_LIENZOS.get(s); if (!c) { c = document.createElement('canvas'); c.width = s.w; c.height = s.h; c.getContext('2d').putImageData(s.img, 0, 0); RT_LIENZOS.set(s, c); } return c; }
// ¿qué hay en una casilla? 0 suelo, 1 pared, 2 puerta cerrada, 4 pared secreta (dkSuelo decide por dónde se anda; aquí solo se pinta)
function rtTipo(m, x, y) { if (x < 0 || y < 0 || x >= m.w || y >= m.h) return 1; const t = m.t[y * m.w + x]; return t === 1 ? 0 : t === 0 ? 1 : t; }

/* ---------- efectos: lo que el juego apunta en G.fx se convierte aquí en luces, números y sacudidas ---------- */
function rtEfectos(G, dt) {
  const P = G.p, c = RT.ctx, W = RT.W, H = RT.H;
  for (const f of G.fx) {
    if (f.tipo === 'explota') RT.fx.push({ tipo: 'boom', x: f.x, y: f.y, color: f.color || '#ffb04f', r: f.r || 1, t: 0, dur: 0.45, alto: (f.r || 1) * 0.9, z: 0.2 });
    else if (f.tipo === 'dano') RT.fx.push({ tipo: 'num', x: f.x, y: f.y, s: pxTexto(String(f.n), f.crit ? 12 : 8, f.crit ? '#ff8a1f' : '#ffe14d'), t: 0, dur: 0.8, alto: f.crit ? 0.3 : 0.2, z: (f.alto || 1) * RT_ALTO_PARED / 2.6 + 0.1, sube: 0.5 });
    else if (f.tipo === 'coge') RT.fx.push({ tipo: 'num', x: f.x, y: f.y, s: pxTexto('+', 10, f.color || '#fff'), t: 0, dur: 0.6, alto: 0.22, z: 0.3, sube: 0.6 });
    else if (f.tipo === 'texto') RT.fx.push({ tipo: 'pantalla', txt: f.txt, color: f.color, t: 0, dur: 1 });
    else if (f.tipo === 'cura') { RT.flash = { c: [111, 220, 114], a: 0.35, t: 0.4 }; RT.fx.push({ tipo: 'pantalla', txt: '+' + Math.round(P.hpMax * 0.4), color: '#6fdc72', t: 0, dur: 0.8 }); }
    else if (f.tipo === 'herido') { RT.flash = { c: [255, 60, 60], a: 0.45, t: 0.35 }; RT.sacudida = 0.15; }
    else if (f.tipo === 'bloqueo') RT.flash = { c: [74, 168, 255], a: 0.3, t: 0.25 };
    else if (f.tipo === 'parry') { RT.flash = { c: [255, 211, 77], a: 0.5, t: 0.3 }; RT.sacudida = 0.1; }
    else if (f.tipo === 'esquiva') RT.flash = { c: [154, 215, 255], a: 0.18, t: 0.3 };
    else if (f.tipo === 'salto') { RT.flash = { c: [255, 255, 255], a: 0.6, t: 0.35 }; RT.sacudida = 0.3; }
    else if (f.tipo === 'golpe') RT.arma.t = 0.26;
    else if (f.tipo === 'muere') { const s = pxPersonaje(f.k, 64); if (s) RT.fx.push({ tipo: 'cadaver', x: f.x, y: f.y, s, t: 0, dur: 0.4, alto: 0.6, z: 0, escY: 1 }); RT.fx.push({ tipo: 'boom', x: f.x, y: f.y, color: '#c9c3e6', r: 0.5, t: 0, dur: 0.4, alto: 0.5, z: 0.3 }); }
  }
  G.fx.length = 0;
  for (const f of RT.fx) {
    f.t += dt;
    if (f.tipo === 'boom') f.s = pxEstallido(f.color, f.t / f.dur);
    else if (f.tipo === 'num') f.z += f.sube * dt;
    else if (f.tipo === 'cadaver') f.escY = Math.max(0.06, 1 - f.t / f.dur);
  }
  RT.fx = RT.fx.filter(f => f.t < f.dur);
  // los flashes de pantalla (herido, bloqueo, parry, cura, salto)
  if (RT.flash) { const F = RT.flash; c.fillStyle = `rgba(${F.c[0]},${F.c[1]},${F.c[2]},${(F.a * F.t / (F.t0 || (F.t0 = F.t))).toFixed(3)})`; c.fillRect(0, 0, W, H); F.t -= dt; if (F.t <= 0) RT.flash = null; }
  // los textos que van en medio de la pantalla (ESQUIVA, ¡PARRY!, GUARDIA ROTA, la cura)
  let n = 0;
  for (const f of RT.fx) if (f.tipo === 'pantalla') { const s = pxTexto(f.txt, 8, f.color || '#fff'), cv = rtLienzoDe(s), esc = 2; c.globalAlpha = Math.min(1, (f.dur - f.t) * 2); c.drawImage(cv, Math.round(W / 2 - s.w), Math.round(RT.horiz + 18 - f.t * 14 + n * 20), s.w * esc, s.h * esc); c.globalAlpha = 1; n++; }
}
// el arma, abajo: baila al andar y da el golpe cuando el juego apunta 'golpe'
function rtArma(G, dt, W, H) {
  const A = RT.arma; if (!A.c) return;
  const P = G.p, andando = typeof ENTRADA !== 'undefined' && !!(ENTRADA.mx || ENTRADA.my);
  A.bob += dt * (andando ? 9 : 2);
  const esc = Math.max(1, Math.round((W * 0.62 / 72) * 2) / 2), w = 72 * esc, h = 56 * esc;
  let dx = Math.sin(A.bob) * 3 * esc, dy = Math.abs(Math.cos(A.bob)) * 2 * esc + 6;
  if (A.t > 0) { A.t -= dt; const f = Math.sin(Math.min(1, A.t / 0.26) * Math.PI); dx -= f * 22 * esc; dy -= f * 16 * esc; }
  if (P.bloquea) { dx += 10 * esc; dy -= 14 * esc; }
  if (P.golpeT > 0) dy += 5 * esc;
  const c = RT.ctx; c.imageSmoothingEnabled = false;
  if (P.efecto === 'invisible') c.globalAlpha = 0.45;
  c.drawImage(A.c, Math.round(W * 0.5 - w * 0.38 + dx), Math.round(H * 0.78 - h + dy), w, h);
  c.globalAlpha = 1;
}
function rtMira(W, horiz) {
  const c = RT.ctx, x = W >> 1, y = horiz;
  c.fillStyle = '#120a1a'; c.fillRect(x - 4, y - 1, 9, 3); c.fillRect(x - 1, y - 4, 3, 9);
  c.fillStyle = '#fff'; c.fillRect(x - 3, y, 7, 1); c.fillRect(x, y - 3, 1, 7);
}
window.DK3D = { iniciar: rtIniciar, construir: rtConstruir, pintar: rtPintar, limpiar: rtLimpiar, pintarMenu: rtPintarMenu, anguloCamara: () => (G ? G.p.ang : 0) };
