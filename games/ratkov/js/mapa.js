// Fans of Ratkov · EL MAPA: el Distrito Microblizz, una ciudad nevada en ruinas de 160 x 120. Al norte, los bloques de viviendas, la torre
// de Microblizz con su explanada y el Despacho del Director; en el centro, la estatua derribada; al este, el control militar con el tanque;
// al oeste, el mercadillo; al sur, la carretera, los garajes, la policlínica, el parque y la playa de vías con contenedores de barco.
// Aquí se construye todo y están las preguntas de choque: ¿cabe aquí?, ¿hay algo entre estos dos puntos?
'use strict';
const SALIDAS = [
  { id: 'metro', n: 'Metro', x: 0, z: 52, r: 2.4, siempre: true },
  { id: 'puente', n: 'Puente del este', x: 76, z: 8, r: 3.2, prob: 0.6 },
  { id: 'alcantarilla', n: 'Alcantarilla', x: -64, z: -32, r: 1.8, pide: 'palanca' },
  // las dos de js/tren.js: el tren pasa una vez a una hora al azar; por la rejilla solo se cabe sin mochila
  { id: 'tren', n: 'Tren de mercancías', x: 48, z: 42, r: 3.4, siempre: true, cond: 'horario', dentro: J => juntoAlTren(J) },
  { id: 'rejilla', n: 'Rejilla del colector', x: 66, z: -46, r: 1.6, siempre: true, cond: 'sinMochila' },
];
const ENTRADAS = [{ x: -74, z: 8, a: Math.PI / 2 }, { x: 62, z: 52, a: Math.PI }, { x: -52, z: 52, a: Math.PI }, { x: 74, z: -26, a: -Math.PI / 2 }];

function construyeMapa() {
  texturasMapa();
  const az = semilla(20261014), o = new Obra(), e = MOTOR.escena;
  MAPA.solidos = []; MAPA.rejilla = new Map(); MAPA.contenedores = []; MAPA.fuegos = [];
  // ---- el suelo: nieve, carretera, explanadas pisadas ----
  const nieveTx = textura(32, 32, g => { g.fillStyle = '#cdd6e0'; g.fillRect(0, 0, 32, 32); const r = semilla(5); for (let i = 0; i < 120; i++) { g.fillStyle = ['#bcc6d2', '#dde4ec', '#b0bac6', '#a4aeb8'][i % 4]; g.fillRect(r() * 32 | 0, r() * 32 | 0, 1 + (r() * 2 | 0), 1); } });
  nieveTx.repeat.set(85, 45);
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(340, 180), new THREE.MeshLambertMaterial({ map: nieveTx })); suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; e.add(suelo);
  const barroTx = textura(32, 16, g => { g.fillStyle = '#6a6460'; g.fillRect(0, 0, 32, 16); const r = semilla(9); for (let i = 0; i < 70; i++) { g.fillStyle = ['#57524f', '#7c7672', '#8e8a88', '#c8ccd2'][i % 4]; g.fillRect(r() * 32 | 0, r() * 16 | 0, 2, 1); } g.fillStyle = '#4a4542'; g.fillRect(0, 4, 32, 1); g.fillRect(0, 11, 32, 1); });
  const sucioTx = textura(32, 32, g => { g.fillStyle = '#9a968e'; g.fillRect(0, 0, 32, 32); const r = semilla(13); for (let i = 0; i < 110; i++) { g.fillStyle = ['#8a867e', '#b4b4b0', '#c8ced6', '#7a766e'][i % 4]; g.fillRect(r() * 32 | 0, r() * 32 | 0, 2, 1); } g.fillStyle = '#7e7a72'; g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32); });
  const suelos = new Obra();
  suelos.plano(170, 8, barroTx, 34, 1, 0, 0.02, 8, 0, true);                         // la carretera
  suelos.plano(8, 44, barroTx, 1, 9, -30, 0.021, -22, 0, true);                      // la avenida del oeste
  suelos.plano(30, 26, sucioTx, 8, 7, 0, 0.022, -38, 0, true);                       // la explanada de la torre
  suelos.plano(36, 26, sucioTx, 9, 7, 0, 0.022, -14, 0, true);                       // la plaza de la estatua
  suelos.plano(26, 18, sucioTx, 7, 5, -45, 0.022, -21, 0, true);                     // el mercadillo
  suelos.plano(28, 24, sucioTx, 7, 6, 48, 0.022, -19, 0, true);                      // el control militar
  suelos.plano(44, 30, sucioTx, 11, 8, 50, 0.022, 37, 0, true);                      // la playa de vías
  suelos.plano(8, 40, barroTx, 1, 8, 0, 0.021, 32, 0, true);                         // el camino del metro
  e.add(suelos.hecha(false));
  // vías del tren
  for (let i = 0; i < 2; i++) { const z = 30 + i * 12; o.caja(44, 0.12, 0.15, 0x5a4a3a, 50, 0.06, z - 0.7); o.caja(44, 0.12, 0.15, 0x5a4a3a, 50, 0.06, z + 0.7); for (let x = 29; x < 72; x += 1.2) o.caja(0.3, 0.06, 2, 0x4a3a2a, x, 0.03, z); }
  // bordillos y marcas
  o.caja(170, 0.3, 0.4, 0x8a8c90, 0, 0.15, 3.8); o.caja(170, 0.3, 0.4, 0x8a8c90, 0, 0.15, 12.2);
  for (let x = -80; x < 80; x += 5) o.caja(2.2, 0.03, 0.18, 0x8a8250, x, 0.03, 8);

  // ---- el borde del mapa: montañas de nieve y escombros (no se pasa) ----
  // montones de nieve bajos y redondeados, con trozos de muro y vallas caídas asomando
  const monton = (x, z) => { const s = 3 + az() * 3, r = (az() - 0.5) * 0.5; o.caja(s * 1.5, 1.0 + az() * 0.6, s * 1.2, 0xd6dee8, x, 0.5, z, r); o.caja(s * 0.9, 0.8, s * 0.7, 0xe6ecf2, x + (az() - 0.5), 1.3, z + (az() - 0.5), r);
    if (az() < 0.25) o.caja(0.4, 1.4 + az(), 2 + az() * 2, 0x7a766e, x + (az() - 0.5) * 2, 0.9, z, az() * 3); };
  for (let x = -84; x <= 84; x += 3.5) for (const z of [-62.5, 62.5]) monton(x, z + (az() - 0.5) * 2);
  for (let z = -60; z <= 60; z += 3.5) for (const x of [-82.5, 82.5]) { if (x > 0 && Math.abs(z - 8) < 6) continue; monton(x + (az() - 0.5) * 2, z); }
  solido(-90, -70, 90, -60.5, 4, 'muro'); solido(-90, 60.5, 90, 70, 4, 'muro'); solido(-90, -70, -80.5, 70, 4, 'muro'); solido(80.5, -70, 90, 70, 4, 'muro');
  for (let i = 0; i < 26; i++) arbolPelado(o, -78 + az() * 156, (az() < 0.5 ? -57 : 57) + (az() - 0.5) * 3, 1 + az() * 0.4, az);

  // ---- el norte: bloques, la torre, el despacho ----
  bloque(-76, -54, [8, 8, 7, 3, 0, 5, 8, 8, 6], 6, 0xb4ada2, az);
  torreMicroblizz(0, -53);
  bloque(36, -54, [9, 9, 9, 6, 2, 9, 9], 6, 0xa8a49c, az);
  bloque(60, -54, [4, 0, 5, 5, 3, 5], 6, 0xb0aaa0, az);
  const verja = despacho(o, 14, -46, 30, -34);
  // la explanada de la torre: sacos, una barricada de Seguridad y un fuego
  sacos(o, -8, -32, 5, 0.1); sacos(o, 8, -32, 5, -0.1); bidonFuego(o, 0, -30);
  cajaMilitar(o, -11, -42, 0.2); maquinaCafe(o, 11, -44); archivador(o, -6, -45.5);
  coche(o, -18, -40, 0x2a2a30, 0.4, true);

  // ---- el centro: la estatua y su plaza ----
  const grieta = estatua(o, -1, -20);
  contenedor('grieta', grieta.x + 1.6, grieta.z + 0.6, { brilla: true });
  for (const [x, z] of [[-13, -8], [13, -8], [-13, -22], [13, -22]]) farola(o, x, z);
  banco(o, -9, -4, 0); banco(o, 9, -4, 0); bidonFuego(o, -14, -14); bidonFuego(o, 14, -16);
  for (let i = 0; i < 26; i++) escombro(o, -16 + az() * 32, -26 + az() * 22, 0.3 + az() * 0.8, az);
  for (const [x, z] of [[-6, -4.5], [6, -5.5], [-20, -10], [20, -6]]) erizo(o, x, z, az() * 3);

  // ---- el oeste: el mercadillo y los bloques de la avenida ----
  bloqueGirado(-72, -46, [6, 6, 0, 5, 6, 6, 4], 6, 0xb8b0a6, az, 1);
  bloqueGirado(-72, -14, [5, 2, 5, 5], 6, 0xaca69c, az, 1);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) kiosco(o, -54 + i * 6, -28 + j * 9, [0x6a8a5a, 0x8a5a4a, 0x4a6a8a, 0x8a7a4a][(i + j) % 4], az);
  bidonFuego(o, -45, -21); cajasCarton(o, -38, -16, az); cajasCarton(o, -56, -14, az);
  alcantarilla(o, -64, -32); coche(o, -60, -24, 0x5a3a30, 1.4, true);
  for (const [x, z] of [[-34, -40], [-34, -30], [-34, -8]]) poste(o, x, z, (az() - 0.5) * 0.4);

  // ---- el este: el control militar ----
  tanque(o, 48, -18, -0.5);
  sacos(o, 38, -12, 6, 0); sacos(o, 58, -12, 5, 0.2); sacos(o, 38, -26, 4, 0.3); sacos(o, 60, -26, 5, -0.2);
  cajaMilitar(o, 44, -24, 0); cajaMilitar(o, 54, -22, 0.4); cajaMilitar(o, 50, -10, -0.2); bidonFuego(o, 44, -14);
  for (const [x, z] of [[34, -18], [36, -20], [62, -18], [64, -16]]) erizo(o, x, z, az() * 3);
  maritimo(o, 66, -36, 0x8a3a2a, 0.1, 0, true); maritimo(o, 66, -36, 0x2a5a7a, 0.15, 1); maritimo(o, 72, -30, 0x3a6a3a, 1.5, 0, true);
  bloqueGirado(78, -46, [3, 4, 0, 4], 5, 0xb0aaa0, az, -1);

  // ---- la carretera: coches, el trolebús y postes ----
  coche(o, -48, 9.4, 0x5a3a30, 0.2); coche(o, -40, 6.4, 0x3a3a3a, 2.6); coche(o, -18, 9.8, 0x6a6a5a, 0.05);
  coche(o, 22, 10, 0x4a5a4a, -0.35); coche(o, 34, 6.2, 0x6a2a2a, 2.9); coche(o, 58, 9.6, 0x3a4a6a, 0.3); coche(o, -64, 6.4, 0x7a7a6a, 3.0);
  trolebus(o, 6, 9.6, 0.12);
  for (let x = -70; x <= 70; x += 16) poste(o, x, 3, (az() - 0.5) * 0.5);

  // ---- el sur ----
  for (let i = 0; i < 6; i++) garaje(o, -74 + i * 5, 22, az);                        // garajes
  bidonFuego(o, -58, 30); cajasCarton(o, -66, 32, az); coche(o, -48, 34, 0x4a4a52, 1.2, true);
  policlinica(o, -24, 22);
  bidonFuego(o, -24, 30);
  for (let i = 0; i < 14; i++) arbolPelado(o, -10 + az() * 20, 20 + az() * 22, 1 + az() * 0.4, az);   // el parque
  banco(o, -6, 34, 0.2); banco(o, 6, 30, -0.3); bidonFuego(o, 5, 38);
  bocaMetro(o, 0, 53);
  // la playa de vías: contenedores de barco, cajas, un vagón
  const colores = [0x8a3a2a, 0x2a5a7a, 0x3a6a3a, 0xb07a20, 0x5a5a62, 0x6a2a5a];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { const x = 32 + i * 8, z = 24 + j * 12 + (az() - 0.5) * 2, c = colores[(i * 2 + j) % colores.length]; maritimo(o, x, z, c, (az() - 0.5) * 0.1, 0, (i + j) % 2 === 0); if (az() < 0.4) maritimo(o, x, z, colores[(i + j + 3) % colores.length], 0.05, 1); }
  cajaMilitar(o, 70, 44, 0.3); cajasCarton(o, 40, 48, az); cajasCarton(o, 60, 50, az); bidonFuego(o, 52, 48);
  maquinaCafe(o, 30, 50);
  puenteRoto(o, 76, 8);
  // escombros sueltos por todas partes (no encima de los caminos)
  for (let i = 0; i < 70; i++) { const x = -76 + az() * 152, z = -56 + az() * 112; if (Math.abs(z - 8) < 5 || (Math.abs(x) < 20 && z > -30 && z < 0)) continue; escombro(o, x, z, 0.3 + az() * 1.0, az); }

  MAPA.grupo = o.hecha(); e.add(MAPA.grupo);
  construyeTutorial();
  construyeTren();
  construyeTerminales();
  creaFuegos();
  MAPA.verja = verja;
}

/* ---------- preguntas de choque ---------- */
function solidosCerca(x, z) { const C = MAPA.CEL; return MAPA.rejilla.get(Math.floor(x / C) + ',' + Math.floor(z / C)) || []; }
// ¿choca un círculo de radio r en (x, z) con algo sólido?
function choca(x, z, r) {
  const C = MAPA.CEL, vistos = new Set();
  for (let i = Math.floor((x - r) / C); i <= Math.floor((x + r) / C); i++) for (let j = Math.floor((z - r) / C); j <= Math.floor((z + r) / C); j++) {
    for (const s of MAPA.rejilla.get(i + ',' + j) || []) {
      if (vistos.has(s) || s.abierto) continue; vistos.add(s);
      const cx = Math.max(s.x0, Math.min(x, s.x1)), cz = Math.max(s.z0, Math.min(z, s.z1));
      if ((x - cx) ** 2 + (z - cz) ** 2 < r * r) return s;
    }
  }
  return null;
}
// mueve un círculo por (dx, dz) resbalando por las paredes. Devuelve si ha chocado
function mueve(e, dx, dz, r) {
  let golpe = false;
  if (!choca(e.x + dx, e.z, r)) e.x += dx; else golpe = true;
  if (!choca(e.x, e.z + dz, r)) e.z += dz; else golpe = true;
  return golpe;
}
// el primer sólido que corta el segmento de (x0, z0) a (x1, z1): { t (0 a 1), s, nx, nz } o null. bajo = false: los sacos y coches no cuentan
function corta(x0, z0, x1, z1, bajo = true) {
  const dx = x1 - x0, dz = z1 - z0, largo = Math.hypot(dx, dz) || 0.0001, pasos = Math.ceil(largo / 2) + 1, vistos = new Set();
  let mejor = null;
  for (let k = 0; k <= pasos; k++) {
    const x = x0 + dx * k / pasos, z = z0 + dz * k / pasos;
    for (const s of solidosCerca(x, z)) {
      if (vistos.has(s) || s.abierto || (!bajo && s.h < 1.3) || s.tipo === 'poste' && !bajo) continue; vistos.add(s);
      // corte del segmento con la caja (método de las placas)
      let t0 = 0, t1 = 1, nx = 0, nz = 0;
      const ejes = [[dx, x0, s.x0, s.x1, 'x'], [dz, z0, s.z0, s.z1, 'z']];
      let fuera = false;
      for (const [d, p, a, b, eje] of ejes) {
        if (Math.abs(d) < 1e-9) { if (p < a || p > b) { fuera = true; break; } continue; }
        let ta = (a - p) / d, tb = (b - p) / d, n = -1; if (ta > tb) { [ta, tb] = [tb, ta]; n = 1; }
        if (ta > t0) { t0 = ta; nx = eje === 'x' ? n : 0; nz = eje === 'z' ? n : 0; }
        t1 = Math.min(t1, tb); if (t0 > t1) { fuera = true; break; }
      }
      if (!fuera && (!mejor || t0 < mejor.t)) mejor = { t: t0, s, nx, nz };
    }
    if (mejor && mejor.t <= (k + 1) / pasos) break;
  }
  return mejor;
}
// ¿se ve el punto B desde A? (los sacos y los coches no tapan la vista)
const seVe = (x0, z0, x1, z1) => !corta(x0, z0, x1, z1, false);
// un sitio libre cerca de (x, z)
function libreCerca(x, z, r = 0.6) {
  for (let k = 0; k < 40; k++) { const a = k * 2.4, d = k * 0.35, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (!choca(px, pz, r)) return { x: px, z: pz }; }
  return { x, z };
}
// lo cerca que está el fuego más cercano
function fuegoCerca(x, z) { let d = 99; for (const f of MAPA.fuegos) d = Math.min(d, lejos(x, z, f.x, f.z)); return d; }
