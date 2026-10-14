// Fans of Ratkov · PIEZAS DEL MAPA (2): lo pequeño y lo mediano. Coches y un trolebús sepultados, el tanque quemado, erizos antitanque,
// sacos terreros, postes, árboles pelados, contenedores de barco, quioscos, garajes, la policlínica, el Despacho del Director y las
// salidas (metro, puente y alcantarilla). Las piezas con botín apuntan su contenedor (contenedor() en js/mapa-piezas.js).
'use strict';
const NIEVE_M = 0xdfe6ee;
// para las piezas altas: se dibujan en su propia obra y se vuelven transparentes si te tapan
function obraQueTapa(dibuja, x0, x1, z0, z1, h) { const ob = new Obra(); dibuja(ob); const g = ob.hecha(); MOTOR.escena.add(g); apuntaTapa(g, x0, x1, z0, z1, h); }
function coche(o, x, z, color, giro, conBotin = true) {
  const c = Math.cos(giro), s = Math.sin(giro), P = (dx, dz) => [x + dx * c + dz * s, z - dx * s + dz * c];
  const pz = (w, h, d, col, dx, y, dz) => { const [px, pz2] = P(dx, dz); o.caja(w, h, d, col, px, y, pz2, giro); };
  pz(3.4, 0.8, 1.6, color, 0, 0.6, 0); pz(1.9, 0.6, 1.4, 0x1a1c20, -0.2, 1.3, 0); pz(1.9, 0.12, 1.4, NIEVE_M, -0.2, 1.66, 0); pz(1.4, 0.1, 1.6, NIEVE_M, 1.1, 1.05, 0);
  for (const [a, b] of [[-1.1, 0.8], [1.1, 0.8], [-1.1, -0.8], [1.1, -0.8]]) { const [px, pz2] = P(a, b); o.cil(0.3, 0.3, 0.2, 8, 0x111111, px, 0.3, pz2, Math.PI / 2, giro); }
  solidoGirado(x, z, 3.4, 1.6, giro, 1.1, 'bajo');
  if (conBotin) { const [bx, bz] = P(-2.1, 0); contenedor('coche', bx, bz); }
}
function trolebus(o, x, z, giro) {
  o.caja(9, 2.4, 2.4, 0x7a5a30, x, 1.4, z, giro); o.caja(9.02, 0.6, 2.42, 0x2a2420, x, 2.0, z, giro); o.caja(9.1, 0.2, 2.5, NIEVE_M, x, 2.7, z, giro);
  o.cil(0.03, 0.03, 3, 3, 0x333333, x + 2, 3.9, z, 0, giro, 0.9);
  solidoGirado(x, z, 9, 2.4, giro, 2.6, 'bajo');
}
function tanque(o, x, z, giro) {
  const ch = 0x3c4038;
  o.caja(5, 1.2, 3, ch, x, 0.9, z, giro); o.caja(5.4, 0.7, 3.6, 0x24262a, x, 0.45, z, giro);
  o.caja(2.6, 0.9, 2.2, ch, x - 0.3 * Math.cos(giro), 1.95, z + 0.3 * Math.sin(giro), giro + 0.4);
  o.cil(0.14, 0.14, 3.6, 6, ch, x + 1.6 * Math.cos(giro + 0.4), 2.0, z - 1.6 * Math.sin(giro + 0.4), 0, giro + 0.4, Math.PI / 2 - 0.25);
  o.caja(5, 0.15, 3, NIEVE_M, x, 1.58, z, giro); o.caja(2.6, 0.15, 2.2, NIEVE_M, x - 0.3 * Math.cos(giro), 2.45, z + 0.3 * Math.sin(giro), giro + 0.4);
  solidoGirado(x, z, 5.4, 3.6, giro, 2.4, 'bajo');
}
function erizo(o, x, z, giro) {
  for (const [a, b, c] of [[0, 0.7, 0.8], [0.7, 0, 0.8], [0, -0.7, -0.8]]) o.caja(0.2, 2.0, 0.2, 0x3a3632, x, 0.6, z, giro + b, a, c);
  solido(x - 0.6, z - 0.6, x + 0.6, z + 0.6, 1.2, 'bajo');
}
function sacos(o, x, z, n, giro) {
  const c = Math.cos(giro), s = Math.sin(giro);
  for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) { const dx = i * 0.85 - n * 0.42 + (j % 2) * 0.4; o.caja(0.9, 0.4, 0.5, 0x8a7a5a, x + dx * c, 0.2 + j * 0.38, z - dx * s, giro); }
  o.caja(n * 0.85, 0.1, 0.55, NIEVE_M, x, 0.82, z, giro);
  solidoGirado(x, z, n * 0.85 + 0.4, 0.6, giro, 0.9, 'bajo');
}
function poste(o, x, z, inclina) { o.cil(0.1, 0.12, 7, 5, 0x5a4a3a, x, 3.4, z, 0, 0, inclina); o.caja(1.6, 0.1, 0.1, 0x5a4a3a, x - Math.sin(inclina) * 3, 6.6, z, 0, 0, inclina); solido(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 6, 'poste'); }
function arbolPelado(o, x, z, s, azar) {
  o.cil(0.08 * s, 0.14 * s, 3 * s, 4, 0x3a3430, x, 1.5 * s, z);
  for (let i = 0; i < 4; i++) o.cil(0.03 * s, 0.05 * s, 1.4 * s, 3, 0x3a3430, x, (1.8 + i * 0.35) * s, z, azar() - 0.5, 0, (i % 2 ? 1 : -1) * (0.6 + azar() * 0.4));
  solido(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 3, 'poste');
}
function escombro(o, x, z, s, azar) { o.caja(s, s * 0.5, s, azar() < 0.5 ? 0x8a847a : 0x6e6a64, x, s * 0.25, z, azar() * 3); if (s > 0.9) solido(x - s / 2.4, z - s / 2.4, x + s / 2.4, z + s / 2.4, s * 0.5, 'bajo'); }
function maritimo(o0, x, z, color, giro, alto = 0, conBotin = false) {
  const y = alto * 2.6;
  obraQueTapa(o => {
    o.caja(6, 2.6, 2.4, color, x, y + 1.3, z, giro); o.caja(6.04, 0.12, 2.44, NIEVE_M, x, y + 2.66, z, giro);
    for (let k = -2.7; k <= 2.7; k += 0.6) o.caja(0.1, 2.4, 2.46, color - 0x101010 > 0 ? color - 0x101010 : color, x + k * Math.cos(giro), y + 1.3, z - k * Math.sin(giro), giro);
  }, x - 3.1, x + 3.1, z - 1.3, z + 1.3, y + 2.6);
  if (!alto) solidoGirado(x, z, 6, 2.4, giro, 2.6, 'edificio');
  if (conBotin) contenedor('caja', x + 1.6 * Math.sin(giro), z + 1.6 * Math.cos(giro));
}
function cajasCarton(o, x, z, azar) {
  for (let i = 0; i < 3; i++) { const s = 0.6 + azar() * 0.4; o.caja(s, s * 0.8, s, 0xa8865a, x + (i - 1) * 0.55, s * 0.4 + (i === 1 ? 0.5 : 0), z + azar() * 0.3, azar()); }
  solido(x - 0.9, z - 0.4, x + 0.9, z + 0.5, 1.2, 'bajo'); contenedor('caja', x, z + 1.0);
}
function cajaMilitar(o, x, z, giro = 0) {
  o.caja(1.4, 0.7, 0.8, 0x4a5a3a, x, 0.35, z, giro); o.caja(1.42, 0.08, 0.82, 0x3a4a2a, x, 0.72, z, giro); o.caja(0.5, 0.05, 0.4, 0xd8c040, x, 0.75, z, giro); o.caja(1.4, 0.06, 0.8, NIEVE_M, x, 0.78, z, giro);
  solidoGirado(x, z, 1.4, 0.8, giro, 0.8, 'bajo'); contenedor('militar', x, z + 0.9);
}
function archivador(o, x, z) { o.caja(0.9, 1.6, 0.7, 0x6a7078, x, 0.8, z); for (let k = 0; k < 3; k++) o.caja(0.7, 0.04, 0.02, 0xb8c0cc, x, 0.4 + k * 0.5, z + 0.36); solido(x - 0.45, z - 0.35, x + 0.45, z + 0.35, 1.6, 'bajo'); contenedor('archivador', x, z + 0.95); }
function maquinaCafe(o, x, z) { o.caja(1.0, 2.0, 0.8, 0xc84a3a, x, 1.0, z); o.caja(0.6, 0.7, 0.05, 0x1a1c22, x - 0.1, 1.3, z + 0.41); o.caja(0.2, 0.2, 0.05, 0xf9c531, x + 0.3, 1.5, z + 0.41); o.caja(1.0, 0.08, 0.8, NIEVE_M, x, 2.04, z); solido(x - 0.5, z - 0.4, x + 0.5, z + 0.4, 2, 'bajo'); contenedor('maquina', x, z + 1.0); }
function botiquinPared(o, x, z) { o.caja(0.8, 0.7, 0.2, 0xf0f0f0, x, 1.6, z); o.caja(0.14, 0.44, 0.02, 0xe0303a, x, 1.6, z + 0.11); o.caja(0.44, 0.14, 0.02, 0xe0303a, x, 1.6, z + 0.11); contenedor('medico', x, z + 0.8); }
function kiosco(o, x, z, color, azar) {
  obraQueTapa(o => { o.caja(3, 2.4, 2.6, color, x, 1.2, z); o.caja(3.4, 0.2, 3.0, 0x3a3e46, x, 2.5, z); o.caja(3.4, 0.2, 3.0, NIEVE_M, x, 2.7, z);
    o.caja(2.2, 0.9, 0.05, 0x20262e, x, 1.5, z + 1.31); o.caja(2.4, 0.1, 0.5, 0x8a8478, x, 1.0, z + 1.5); }, x - 1.7, x + 1.7, z - 1.5, z + 1.5, 2.8);
  solido(x - 1.5, z - 1.3, x + 1.5, z + 1.3, 2.6, 'edificio');
  contenedor(azar() < 0.5 ? 'caja' : 'maquina', x, z + 2.2);
}
function garaje(o, x, z, azar) {
  const abierto = azar() < 0.5;
  obraQueTapa(o => { o.caja(4, 2.6, 5, 0x8a8478, x, 1.3, z); o.caja(4.2, 0.2, 5.2, NIEVE_M, x, 2.7, z); o.caja(3.2, 2.0, 0.05, abierto ? 0x1a1c20 : 0x6a7a6a, x, 1.0, z + 2.51); }, x - 2.1, x + 2.1, z - 2.6, z + 2.6, 2.8);
  solido(x - 2, z - 2.5, x + 2, z + 2.5, 2.6, 'edificio');
  contenedor(abierto ? 'coche' : 'caja', x, z + 3.3);
}
function farola(o, x, z) { o.cil(0.08, 0.1, 4, 5, 0x2e3236, x, 2, z); o.caja(0.9, 0.12, 0.3, 0x2e3236, x + 0.35, 4, z); solido(x - 0.15, z - 0.15, x + 0.15, z + 0.15, 4, 'poste'); }
function banco(o, x, z, giro) { o.caja(2, 0.12, 0.6, 0x5a4030, x, 0.5, z, giro); o.caja(2, 0.5, 0.1, 0x5a4030, x, 0.8, z - 0.3, giro); o.caja(2, 0.08, 0.6, NIEVE_M, x, 0.6, z, giro); solidoGirado(x, z, 2, 0.6, giro, 0.8, 'bajo'); }
function muroBajo(o, x0, z0, x1, z1, h = 2.4, color = 0x7e7a72) {
  const w = Math.abs(x1 - x0) || 0.5, d = Math.abs(z1 - z0) || 0.5;
  o.caja(w, h, d, color, (x0 + x1) / 2, h / 2, (z0 + z1) / 2); o.caja(w + 0.05, 0.12, d + 0.05, NIEVE_M, (x0 + x1) / 2, h + 0.06, (z0 + z1) / 2);
  return solido(Math.min(x0, x1) - (x0 === x1 ? 0.25 : 0), Math.min(z0, z1) - (z0 === z1 ? 0.25 : 0), Math.max(x0, x1) + (x0 === x1 ? 0.25 : 0), Math.max(z0, z1) + (z0 === z1 ? 0.25 : 0), h, 'edificio');
}
function policlinica(o, x, z) {
  const w = 14, d = 7, h = 5;
  obraQueTapa(o => { o.caja(w, h, d, 0xc8c0b0, x, h / 2, z); o.plano(w, h, TX_PANEL, 7, 3, x, h / 2, z + d / 2 + 0.01); o.caja(w + 0.2, 0.25, d + 0.2, NIEVE_M, x, h + 0.12, z);
    o.caja(1.2, 3, 0.1, 0xe0303a, x, h + 1.4, z); o.caja(3, 1.2, 0.1, 0xe0303a, x, h + 1.4, z); }, x - w / 2, x + w / 2, z - d / 2, z + d / 2, h + 2);
  solido(x - w / 2, z - d / 2, x + w / 2, z + d / 2, h, 'edificio');
  for (const dx of [-4, 0, 4]) botiquinPared(o, x + dx, z + d / 2 + 0.1);
}

/* ---------- el Despacho del Director: un patio con muros y una verja que abre la tarjeta roja ---------- */
function despacho(o, x0, z0, x1, z1) {
  const gx = (x0 + x1) / 2;
  muroBajo(o, x0, z0, x1, z0, 2.6, 0x5a5e66); muroBajo(o, x0, z0, x0, z1, 2.6, 0x5a5e66); muroBajo(o, x1, z0, x1, z1, 2.6, 0x5a5e66);
  muroBajo(o, x0, z1, gx - 1.6, z1, 2.6, 0x5a5e66); muroBajo(o, gx + 1.6, z1, x1, z1, 2.6, 0x5a5e66);
  // la verja (se quita al abrirla)
  const v = new Obra(); for (let k = -1.4; k <= 1.4; k += 0.35) v.caja(0.08, 2.4, 0.08, 0xc8202c, gx + k, 1.2, z1); v.caja(3.2, 0.12, 0.12, 0xc8202c, gx, 2.3, z1); v.caja(0.4, 0.3, 0.12, 0xf9c531, gx, 1.2, z1 + 0.08);
  const verja = v.hecha(); MOTOR.escena.add(verja);
  const sol = solido(gx - 1.6, z1 - 0.25, gx + 1.6, z1 + 0.25, 2.4, 'verja');
  const puerta = contenedor('verja', gx, z1 + 1.0, { verja, sol, cerrado: true });
  // dentro: alfombra, mesa del director, cajas fuertes y archivadores
  o.caja(x1 - x0 - 2, 0.04, z1 - z0 - 2, 0x6a1a24, gx, 0.02, (z0 + z1) / 2);
  o.caja(3, 0.9, 1.4, 0x4a2a1a, gx, 0.45, z0 + 3); solido(gx - 1.5, z0 + 2.3, gx + 1.5, z0 + 3.7, 0.9, 'bajo');
  for (const dx of [-4, 4]) { o.caja(1.2, 1.4, 1.0, 0x2a2e36, gx + dx, 0.7, z0 + 1.6); o.cil(0.2, 0.2, 0.1, 8, 0xb8c0cc, gx + dx, 0.8, z0 + 2.12, Math.PI / 2); solido(gx + dx - 0.6, z0 + 1.1, gx + dx + 0.6, z0 + 2.1, 1.4, 'bajo'); contenedor('caja_fuerte', gx + dx, z0 + 3.0, { dentro: true }); }
  archivador(o, x0 + 1.4, z1 - 3); archivador(o, x1 - 1.4, z1 - 3);
  return puerta;
}

/* ---------- las salidas ---------- */
function bocaMetro(o, x, z) {
  o.caja(4, 0.3, 3, 0x5a5652, x, 0.15, z); o.caja(3, 0.2, 2, 0x10141a, x, 0.32, z + 0.2);
  for (const s of [-1, 1]) o.caja(0.2, 2.4, 0.2, 0x8a2a2a, x + s * 1.8, 1.2, z - 1.3); o.caja(4, 0.7, 0.2, 0x8a2a2a, x, 2.5, z - 1.3); o.caja(1.2, 0.6, 0.05, 0xffffff, x, 2.5, z - 1.18);
  for (const s of [-1, 1]) o.caja(0.2, 0.9, 3, 0x6a6660, x + s * 1.9, 0.45, z);
}
function puenteRoto(o, x, z) {
  o.caja(10, 0.6, 7, 0x6a6660, x, 0.3, z); o.caja(10, 0.1, 7, NIEVE_M, x, 0.62, z);
  for (const s of [-1, 1]) { o.caja(10, 0.9, 0.3, 0x5a5652, x, 1.1, z + s * 3.4); }
  for (let i = 0; i < 4; i++) o.caja(0.6, 1.6, 0.6, 0x3a3632, x - 4 + i * 2.6, 0.8, z + 3.8);
}
function alcantarilla(o, x, z) { o.cil(0.9, 0.9, 0.12, 10, 0x2a2c30, x, 0.06, z); o.cil(0.7, 0.7, 0.14, 10, 0x4a4e54, x, 0.08, z); for (let k = -2; k <= 2; k++) o.caja(1.2, 0.02, 0.06, 0x2a2c30, x, 0.16, z + k * 0.25); }
