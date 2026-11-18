// Fans of Zombies · LAS PLANTAS DE LA TORRE (pantalla y mapa): la Torre de Microblizz por dentro. Cada planta es una zona aparte del
// mundo, lejísimos al norte (z = -20.000, cada 80 m, para que el ruido de una no llegue a otra): un pasillo de punta a punta con la escalera de bajada a
// un lado y la de subida al otro, despachos a los dos lados con su puerta (se pueden atrancar), escritorios y archivadores que se
// registran, la máquina de café, una caja fuerte en el despacho del jefe de planta y, en la planta 5, la armería de Seguridad. La 11
// es la azotea: helipuerto, antenas y el CEO. En la calle, la puerta de la torre (bajo los soportales) lleva a la planta 1.
'use strict';
const TORRE = { sitios: [], plantas: {}, puerta: { x: 1.1, z: -46.8 }, calle: { x: 1.1, z: -44.5 } };
const TORRE_W = 40, TORRE_D = 28;
const origenPlanta = (n) => ({ x: n * 80, z: -20000 });   // muy lejos al norte: el mundo por trozos no llega ahí (ADR 073)
// dónde apareces al llegar a la planta n: desde abajo, junto a su escalera de bajada; desde arriba, junto a la de subida
function llegadaPlanta(n, desdeArriba) {
  if (n === 0) return { ...TORRE.calle };
  const O = origenPlanta(n);
  return desdeArriba ? { x: O.x + TORRE_W / 2 - 4, z: O.z } : { x: O.x - TORRE_W / 2 + 4, z: O.z };
}
function sitioTorre(id, tipo, x, z, extra) { const s = Object.assign({ id, tipo, x, z }, extra); TORRE.sitios.push(s); return s; }

function construyeTorre() {
  const azotea = ZOM.AJ.torre.plantas + 1;
  sitioTorre('torre-puerta', 'torre', TORRE.puerta.x, TORRE.puerta.z, { a: 1 });
  for (let n = 1; n <= azotea; n++) {
    const o = new Obra();
    if (n === azotea) construyeAzotea(o, n); else construyePlanta(o, n);
    MOTOR.escena.add(o.hecha());
  }
}
// las cuatro paredes exteriores (con cristaleras pintadas) y el suelo
function cascaron(o, n, suelo) {
  const O = origenPlanta(n), x0 = O.x - TORRE_W / 2, x1 = O.x + TORRE_W / 2, z0 = O.z - TORRE_D / 2, z1 = O.z + TORRE_D / 2;
  o.caja(TORRE_W, 0.12, TORRE_D, suelo, O.x, 0.06, O.z);
  for (const [a, b, z] of [[x0, x1, z0], [x0, x1, z1]]) { o.caja(b - a, ALTO_CASA, GROSOR, 0x2e3a46, (a + b) / 2, ALTO_CASA / 2, z); solido(a, z - 0.3, b, z + 0.3, 3, 'muro'); for (let x = a + 2; x < b - 1; x += 4) o.caja(2.6, 1.2, GROSOR + 0.04, 0x6a8aa8, x, 1.5, z); }
  for (const x of [x0, x1]) { o.caja(GROSOR, ALTO_CASA, TORRE_D, 0x2e3a46, x, ALTO_CASA / 2, O.z); solido(x - 0.3, z0, x + 0.3, z1, 3, 'muro'); }
  return { O, x0, x1, z0, z1 };
}
function escalera(o, n, x, z, a) {
  for (let k = 0; k < 5; k++) o.caja(2.2, 0.18 * (k + 1), 0.45, 0x8a8e96, x, 0.09 * (k + 1), z - 1 + k * 0.45);
  o.caja(0.1, 1.1, 2.4, 0xc8b040, x - 1.15, 0.55, z); o.caja(0.1, 1.1, 2.4, 0xc8b040, x + 1.15, 0.55, z);
  sitioTorre('esc-' + n + '-' + a, 'escalera', x, z + 1.6, { a, desdeArriba: a < n });
}
function construyePlanta(o, n) {
  const { O, x0, x1, z0, z1 } = cascaron(o, n, n % 2 ? 0x4a5468 : 0x54606a), id = 'torre' + n, color = 0xc8ccd4;
  escalera(o, n, x0 + 2.5, O.z - 0.2, n - 1); escalera(o, n, x1 - 2.5, O.z - 0.2, n + 1);
  // el pasillo: dos paredes a lo largo con una puerta por despacho
  const despachos = [-14, -6, 2, 10];
  for (const s of [-1, 1]) pared(o, 'x', O.z + s * 2, x0 + 5, x1 - 3, color, despachos.map((dx) => ({ en: O.x + dx + 2, ancho: 1.3, tipo: 'puerta' })), id);
  for (const s of [-1, 1]) for (const dx of [-15, -7, 1, 9, 17]) pared(o, 'z', O.x + dx, s < 0 ? z0 : O.z + 2, s < 0 ? O.z - 2 : z1, color, [], id);
  for (const s of [-1, 1]) for (const dx of despachos) {
    const cx = O.x + dx + 2, cz = O.z + s * 8;
    o.caja(1.6, 0.75, 0.8, 0x6a4a2e, cx, 0.4, cz); solido(cx - 0.8, cz - 0.4, cx + 0.8, cz + 0.4, 0.8, 'bajo'); contenedor('escritorio', cx, cz - s * 0.9);
    o.caja(0.5, 0.45, 0.5, 0x2a2e36, cx, 0.25, cz + s * 0.9);
    if ((dx + n * 8) % 16 === 0) archivador(o, cx + 2.6, cz + s * 3.6);
  }
  // el despacho del jefe de planta (la caja fuerte) y, en la 5, la armería de Seguridad
  const jx = O.x + 15, jz = O.z - 9;
  o.caja(0.9, 1.0, 0.8, 0x3a3e46, jx, 0.5, jz); solido(jx - 0.45, jz - 0.4, jx + 0.45, jz + 0.4, 1.0, 'bajo'); contenedor('cajaFuerte', jx, jz + 0.95);
  if (n === 5) { for (const dx of [-12, -4]) { o.caja(1.8, 1.7, 0.6, 0x3a3e46, O.x + dx, 0.85, O.z + 13); solido(O.x + dx - 0.9, O.z + 12.7, O.x + dx + 0.9, O.z + 13.3, 1.7, 'bajo'); contenedor('armeria', O.x + dx, O.z + 12.1); } }
  maquinaCafe(o, O.x - 2, O.z - 1.4);
  // el letrero de la planta en el suelo del pasillo
  o.caja(1.2, 0.02, 1.2, 0x58c8ff, x0 + 6, 0.13, O.z);
  TORRE.plantas[n] = { x0: x0 + 1, x1: x1 - 1, z0: z0 + 1, z1: z1 - 1 };
}
function construyeAzotea(o, n) {
  const O = origenPlanta(n), x0 = O.x - TORRE_W / 2, x1 = O.x + TORRE_W / 2, z0 = O.z - TORRE_D / 2, z1 = O.z + TORRE_D / 2;
  o.caja(TORRE_W, 0.12, TORRE_D, 0x7a7e86, O.x, 0.06, O.z);
  for (const [a, b, z] of [[x0, x1, z0], [x0, x1, z1]]) { o.caja(b - a, 1.0, 0.4, 0x5a5e66, (a + b) / 2, 0.5, z); solido(a, z - 0.3, b, z + 0.3, 1.0, 'bajo'); }
  for (const x of [x0, x1]) { o.caja(0.4, 1.0, TORRE_D, 0x5a5e66, x, 0.5, O.z); solido(x - 0.3, z0, x + 0.3, z1, 1.0, 'bajo'); }
  o.cil(5, 5, 0.05, 24, 0xc8b040, O.x + 4, 0.14, O.z); o.caja(1, 0.06, 5, 0xeef2f6, O.x + 2.5, 0.18, O.z); o.caja(1, 0.06, 5, 0xeef2f6, O.x + 5.5, 0.18, O.z); o.caja(3, 0.06, 1, 0xeef2f6, O.x + 4, 0.18, O.z);
  for (const [dx, dz] of [[-12, -9], [-12, 9], [14, -10]]) { o.caja(2.2, 1.4, 1.6, 0x8a8e96, O.x + dx, 0.7, O.z + dz); solido(O.x + dx - 1.1, O.z + dz - 0.8, O.x + dx + 1.1, O.z + dz + 0.8, 1.4, 'bajo'); }
  for (const dz of [-6, 6]) { o.cil(0.12, 0.12, 6, 5, 0x3a3e46, O.x - 16, 3, O.z + dz); o.caja(0.6, 0.6, 0.6, 0xff4b5c, O.x - 16, 6.1, O.z + dz); }
  escalera(o, n, x0 + 2.5, O.z - 0.2, n - 1);
  contenedor('cajaFuerte', O.x + 16, O.z + 11);
  TORRE.plantas[n] = { x0: x0 + 2, x1: x1 - 2, z0: z0 + 2, z1: z1 - 2 };
}
// un sitio libre de la planta n para un fan (lejos de las escaleras)
function puntoEnPlanta(n, azar) {
  const P = TORRE.plantas[n];
  for (let k = 0; k < 30; k++) {
    const x = P.x0 + 6 + azar() * (P.x1 - P.x0 - 12), z = P.z0 + azar() * (P.z1 - P.z0);
    if (!choca(x, z, 0.6)) return { x, z };
  }
  return libreCerca((P.x0 + P.x1) / 2, (P.z0 + P.z1) / 2, 0.6);
}
