// Fans of Island · EL DIBUJO de cada fotograma: la cámara que sigue a CrazyBunny, el fondo vivo (sol, nubes, barco, pájaros, islas
// lejanas, un pez que salta y la MechaVaca de vez en cuando), el terreno en lonchas, todo lo que se mueve y el agua de delante con su oleaje.
'use strict';
const VISTA = { cx: 0, cz: 0 };
const FONDO = { humo: [], mv: { x: -999, t: 0, espera: 4 }, saltarin: null, tSalto: 2 };
const sy = (y, z) => BASE + Math.round(y * K) - Math.round(z) + VISTA.cz;
const cerca = (x, margen) => Math.abs(x - VISTA.cx - VW / 2) < VW / 2 + margen;
function pajaros(hy) {
  ctx.fillStyle = '#2f5f80';
  for (let i = 0; i < 5; i++) {
    const per = VW + 200, x = Math.round((((i * 37 + 400 - reloj * 14 - VISTA.cx * 0.06) % per) + per) % per - 40), y = hy - 96 + (i % 3) * 6 + Math.round(Math.sin(reloj + i) * 3);
    const ala = Math.floor(reloj * 6 + i) % 2;
    ctx.fillRect(x, y, 1, 1); ctx.fillRect(x - 2, y - ala, 2, 1); ctx.fillRect(x + 1, y - ala, 2, 1);
  }
}
function mechavacaFondo(hy) {   // vuela al fondo de vez en cuando, echando humo
  const mv = FONDO.mv;
  if (mv.x < -900) { mv.espera -= 1 / 60; if (mv.espera <= 0) { mv.x = -60; mv.t = 0; } }
  else {
    mv.t += 1 / 60; mv.x += 34 / 60;
    const s = girada(PILAS_MV[Math.floor(reloj * 14) % 2], -Math.PI / 2 + 0.45 + Math.sin(mv.t * 0.9) * 0.55), alto = hy - 30 + Math.sin(mv.t * 1.7) * 8;
    ctx.drawImage(s.c, Math.round(mv.x) - (s.c.width >> 1), Math.round(alto) - s.suelo);
    if (Math.floor(reloj * 20) % 3 === 0) FONDO.humo.push({ x: mv.x - 12, y: alto + 2, t: 0.8 });
    if (mv.x > VW + 80) { mv.x = -999; mv.espera = 14 + Math.random() * 8; }
  }
  ctx.fillStyle = '#ffffff';
  FONDO.humo = FONDO.humo.filter(h => {
    h.t -= 1 / 60; h.x -= 0.2; h.y -= 0.15;
    if (h.t > 0.3 || (Math.floor(h.t * 20) & 1)) ctx.fillRect(Math.round(h.x), Math.round(h.y), h.t > 0.5 ? 2 : 1, h.t > 0.5 ? 2 : 1);
    return h.t > 0;
  });
}
function pezSaltarin(hy) {
  FONDO.tSalto -= 1 / 60;
  if (!FONDO.saltarin && FONDO.tSalto <= 0) FONDO.saltarin = { x: 20 + Math.random() * (VW - 40), y: hy + 10 + Math.random() * 26, t: 0 };
  const f = FONDO.saltarin; if (!f) return;
  f.t += 1 / 60;
  const k = f.t / 0.9, alto = Math.sin(Math.PI * k) * 16;
  if (k < 1) { ctx.save(); ctx.translate(Math.round(f.x + k * 24), Math.round(f.y - alto)); ctx.scale(1, k < 0.5 ? 1 : -1); ctx.drawImage(PECECITO, -4, -2); ctx.restore(); }
  ctx.fillStyle = '#ffffff';
  if (k < 0.15) ctx.fillRect(Math.round(f.x) - 2, Math.round(f.y), 5, 1);
  if (k > 0.85 && k < 1.2) ctx.fillRect(Math.round(f.x + 24) - 3, Math.round(f.y), 7, 1);
  if (k > 1.3) { FONDO.saltarin = null; FONDO.tSalto = 2 + Math.random() * 3; }
}
const vuelta = (v, per, resta) => (((v % per) + per) % per) - resta;
function fondo() {
  const hy = BASE - 78 + Math.round(VISTA.cz * 0.3), cx = VISTA.cx;
  if (hy > 0) { ctx.fillStyle = cielo(hy); ctx.fillRect(0, 0, VW, hy); }
  ctx.drawImage(SOL, VW - 70, Math.max(4, hy - 120));
  pajaros(hy);
  for (let i = 0; i < 6; i++) ctx.drawImage(NUBE, Math.round(vuelta(i * 211 - cx * 0.12 - reloj * 4, VW + 120, 60)), hy - 46 - (i % 3) * 20 - Math.round(VISTA.cz * 0.1));
  ctx.fillStyle = '#2f8fd0'; ctx.fillRect(0, hy, VW, VH - hy);
  ctx.fillStyle = '#57aee0'; ctx.fillRect(0, hy, VW, 3);
  for (let i = 0; i < 4; i++) ctx.drawImage(LEJOS, Math.round(vuelta(i * 300 + 40 - cx * 0.3, 600, 160)), hy - LEJOS.height + 3);
  ctx.drawImage(BARCO, Math.round(vuelta(900 - cx * 0.18 + reloj * 3, VW + 400, 60)), hy - 18 + Math.round(Math.sin(reloj * 1.6)));   // el barco, por delante de las islas lejanas
  mechavacaFondo(hy);
  pezSaltarin(hy);
  ctx.fillStyle = '#7cc6ee';
  for (let i = 0; i < 40; i++) {
    const x = vuelta(i * 53 - cx * 0.45 + Math.floor(reloj * 5) * (i % 2 ? 1 : -1), VW + 20, 10);
    ctx.fillRect(Math.round(x), hy + 6 + ((i * 37) % Math.max(8, VH - hy - 6)), 3 + (i % 3) * 2, 1);
  }
}
function pieza(q, x, y0, zb) { ctx.drawImage(q.c, Math.round(x) - q.m, sy(y0, zb) - (q.al - 1) - q.m); }   // un bloque de lonchas con su fondo y0 y su base zb
function sombraPix(x, y, rx) {
  const ry = Math.max(1, Math.round(rx * K));
  ctx.fillStyle = 'rgba(42,24,48,0.30)';
  for (let r = -ry; r <= ry; r++) {
    const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (r / (ry + 0.5)) ** 2)));
    if (w > 0) ctx.fillRect(x - w, y + r, 2 * w, 1);
  }
}
function ente(p, giro, x, y, z, sombra) {   // una pila girada en su sitio, con su sombra en el suelo si se pide
  const s = girada(p, giro), sx = Math.round(x - VISTA.cx);
  if (sombra) { const g = sueloDe({ x, z: z + 0.5 }, 4); if (g > -Infinity && z - g < 160) sombraPix(sx, sy(y, g), Math.round(sombra * Math.max(0.45, 1 - (z - g) / 140))); }
  ctx.drawImage(s.c, sx - (s.c.width >> 1), sy(y, z) - s.suelo);
}
function pintaPez(f) {   // recortado en la línea del agua, con su espuma
  if (f.estado === 'oculto') return;
  const wl = sy(f.y, MAR), sx = Math.round(f.x - VISTA.cx);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, wl); ctx.clip();
  ente(PILAS_PEZ[posePez(f)], f.giro, f.x, f.y, f.z, 0);
  ctx.restore();
  ctx.fillStyle = '#bfeaff';
  const w = 13 + Math.round(Math.sin(reloj * 5 + f.x) * 2);
  ctx.fillRect(sx - w, wl, 2 * w, 1); ctx.fillRect(sx - w - 4, wl + 1, 5, 1); ctx.fillRect(sx + w - 1, wl + 1, 5, 1);
}
function pintaRocaMar(r) {   // hundida: se corta en su línea del agua (como los peces) y lleva espuma alrededor
  const wl = sy(r.y, MAR), sx = Math.round(r.x - VISTA.cx), w = 14 + Math.round(Math.sin(reloj * 3 + r.x) * 2);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, wl); ctx.clip();
  ente(PIEZA.rocaMar, 0.3, r.x, r.y, MAR - 12, 0);
  ctx.restore();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - w, wl, 2 * w, 1);
  ctx.fillStyle = '#bfeaff'; ctx.fillRect(sx - w - 4, wl + 1, 5, 1); ctx.fillRect(sx + w - 1, wl + 1, 5, 1);
}
function columna(c) {
  const n = NIV[c]; if (n.s < 0) return;
  const x = c * T - VISTA.cx, top = n.s * T;
  pieza(PIEZA.base, x, 0, -2 * T);
  for (let L = 0; L <= n.s; L++) pieza(L === n.s ? PIEZA.hierba[n.v] : PIEZA.arena[n.v], x, 0, (L - 1) * T);
  // raya de contorno: borde de atrás y laterales donde la columna de al lado es más baja
  ctx.fillStyle = BORDE; ctx.fillRect(x, sy(0, top) - 1, T, 1);
  for (const [lado, xb] of [[-1, x], [1, x + T - 1]]) {
    const tv = arribaSuelo(c + lado);
    if (tv < top) { const y1 = sy(0, top) - 1, y2 = tv === -Infinity ? VH : sy(D, tv); ctx.fillRect(xb, y1, 1, y2 - y1); }
  }
  n.pila.forEach((t, k) => pieza(PIEZA[t], x, 0, (n.s + k) * T));
}
function terreno() {
  const c0 = Math.max(0, Math.floor(VISTA.cx / T) - 1), c1 = Math.min(COLS - 1, Math.floor((VISTA.cx + VW) / T) + 1);
  for (let c = c0; c <= c1; c++) columna(c);
}
function mueveCamara() {
  cam.x += (J.x + J.mira * 36 - VW * 0.45 - cam.x) * 0.1;
  cam.x = Math.max(0, Math.min(COLS * T - VW, cam.x));
  cam.z += (Math.max(0, J.z - VH * 0.3) - cam.z) * 0.08;
  VISTA.cx = Math.round(cam.x); VISTA.cz = Math.round(cam.z);
}
function pintaAtras() {   // palmeras, hibiscos, puentes, islas flotantes y los peces del carril
  for (const a of ATRAS) if (NIV[a.c].s >= 0 && cerca((a.c + 0.5) * T, 70)) ente(PIEZA.palmeras[a.tipo], a.giro, (a.c + 0.5) * T, a.y, arribaSuelo(a.c), 0);
  for (const d of DECO) if (d.t === 'flor' && cerca(d.x, 20)) ente(PIEZA.flor, d.giro, d.x, d.y, arribaSuelo(Math.floor(d.x / T)), 0);
  for (const p of PLAT) {
    if (p.tipo === 'tabla') pieza(p.q, p.a * T - VISTA.cx, CARRIL - 12, p.z - 6);
    else pieza(p.q, p.a * T - VISTA.cx, CARRIL - 18, p.z - 22);
  }
  for (const f of peces) if (f.y <= CARRIL) pintaPez(f);
}
const ALETEO = ['abajo', 'medio', 'arriba', 'medio'];
function pintaCarril() {   // todo lo que va por el carril de CrazyBunny
  for (const g of gaviotas) {
    ente(PILAS_GAV[ALETEO[Math.floor(g.t * 9) % 4]], g.giro, g.x, CARRIL - 4, g.z, 0);
    if (g.coco) ente(PILA_COCO, 0, g.x + g.mira * 3, CARRIL - 3, g.z - 8, 0);
  }
  for (const c of cocos) ente(PILA_COCO, c.giro, c.x, c.y, c.z, 7);
  for (const z of zanas) if (!z.cogida) ente(PILA_ZANA, reloj * 2, z.x, CARRIL, z.z + Math.round(Math.sin(reloj * 3 + z.x) * 3), 5);
  ente(PILA_BANDERA, 0, meta.x - 4, CARRIL - 4, meta.z, 5);
  for (const k of cangrejos) if (!(k.muerto > 0.3)) ente(PILAS_CANG[k.muerto ? 'paso2' : (Math.floor(k.t / 0.12) % 2 ? 'paso1' : 'paso2')], Math.sin(k.t * 9) * 0.12, k.x, CARRIL, k.z, 13);
  for (const e of enemigos) if (!(e.muerto > 0.35)) ente(PILAS_B[poseEnemigo(e)], e.giro, e.x, CARRIL, e.z, 13);
  if (!(J.inv > 0 && Math.floor(J.inv * 12) % 2)) ente(PILAS_C[poseJugador()], J.giro, J.x, CARRIL, J.z, 12);
}
function pintaDelante() {   // detalles del suelo, peces de delante, gotas, salpicaduras, arbustos, rocas y el agua
  for (const d of DECO) if (d.t !== 'flor' && cerca(d.x, 20)) ente(PIEZA[d.t], d.giro, d.x, d.y, arribaSuelo(Math.floor(d.x / T)), 0);
  for (const f of peces) if (f.y > CARRIL) pintaPez(f);
  for (const g of gotas) ente(PILA_GOTA, 0, g.x, g.y, g.z, 4);
  for (const p of parts) { ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x - VISTA.cx), sy(p.y, p.z), 2, 2); }
  for (const a of DELANTE) if (NIV[a.c].s >= 0) ente(PIEZA.arbusto, a.giro, (a.c + 0.5) * T, D - 7, arribaSuelo(a.c), 0);
  for (const r of ROCAS_MAR) if (cerca(r.x, 30)) pintaRocaMar(r);
  const wy = sy(D, MAR);
  if (wy >= VH) return;
  ctx.fillStyle = 'rgba(47,143,208,0.92)'; ctx.fillRect(0, wy, VW, VH - wy);
  olas(wy);
}
// el oleaje de delante: dos filas de olas en lonchas (PILAS_OLA, arte-isla.js) que suben, bajan y van y vienen, y espuma en la orilla
const FILAS_OLA = [{ y: D + 1, sep: 62, vel: 7, sube: 3, lado: 1 }, { y: D + 9, sep: 78, vel: 10, sube: 4, lado: -1 }];
function filaOlas(f, n) {
  for (let i = 0; i < Math.ceil(VW / f.sep) + 2; i++) {
    const q = PILAS_OLA[(i + n) % PILAS_OLA.length], fase = reloj * 1.8 + i * 1.7 + n;
    const x = vuelta(i * f.sep - VISTA.cx + Math.floor(reloj * f.vel) * f.lado * 0.3 + n * 31, VW + f.sep * 2, f.sep);
    const z = MAR - q.al + 3 + Math.round((Math.sin(fase) * 0.5 + 0.5) * f.sube);
    ctx.drawImage(q.c, Math.round(x) - q.m, sy(f.y, z) - (q.al - 1) - q.m);
  }
}
function olas(wy) {
  if (PILAS_OLA.length) FILAS_OLA.forEach(filaOlas);
  ctx.fillStyle = '#ffffff';
  for (let x = 0; x < VW; x += 2) if (Math.sin((x + VISTA.cx) * 0.11 + reloj * 2.5) > 0.1) ctx.fillRect(x, wy, 2, 1);
}
function dibuja() {
  mueveCamara(); fondo(); terreno(); pintaAtras(); pintaCarril(); pintaDelante();
}
