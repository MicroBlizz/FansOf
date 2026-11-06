// Fans of Zombies · EL BARRIO RESIDENCIAL (pantalla y mapa): al oeste de la ciudad de Ratkov, calles con aceras, farolas, vallas,
// buzones, cubos de basura, árboles, coches aparcados y unas 25 casas en las que se entra. Cada casa tiene paredes de verdad (sólidos),
// un tabique, muebles que se registran (nevera, armario, cubo) y huecos: una puerta y ventanas. El tejado va aparte para quitarlo
// cuando estás dentro. Los huecos se apuntan en BARRIO.huecos (id, tipo, x, z, su sólido y sus piezas para pintarlos) y las reglas
// llevan su estado en e.huecos (js/casas.js). Aquí no hay reglas: solo se construye y se pinta.
'use strict';
const BARRIO = { casas: [], huecos: [], porId: {}, x0: -204, x1: -86, inicio: null };
const ALTO_CASA = 2.6, GROSOR = 0.3;
const COLORES_CASA = [[0xb8a888, 0x8a3a2a], [0x9ab0a0, 0x3a4a6a], [0xc8b0a0, 0x5a3a2a], [0xa8b8c8, 0x6a2a2a], [0xd0c4a0, 0x4a5a3a], [0xb0a0b8, 0x3a3a4a]];

function construyeBarrio(o, az) {
  calles(o);
  const columnas = [-192, -177, -162, -129, -114, -99], filas = [[-42, 1], [-16, -1], [-4, 1], [20, -1], [32, 1]];
  let n = 0;
  for (const [cz, frente] of filas) for (const cx of columnas) {
    const inicio = cx === -99 && cz === -4;
    if (!inicio && az() < 0.15) { parque(o, cx, cz, az); continue; }
    const w = 8 + Math.round(az() * 2), d = 7 + Math.round(az()), col = COLORES_CASA[Math.floor(az() * COLORES_CASA.length)];
    const c = casa(o, 'k' + (n++), cx, cz, w, d, frente, col, az);
    if (inicio) BARRIO.inicio = { x: cx - w * 0.25, z: cz, casa: c };
  }
}
// las calles: la carretera de Ratkov sigue hacia el oeste, dos calles más y una que las cruza
function calles(o) {
  const asfalto = 0x3c4048, acera = 0x8a8e96, raya = 0xd8d0a0;
  const calle = (x0, x1, z, ancho) => {
    o.caja(x1 - x0, 0.06, ancho, asfalto, (x0 + x1) / 2, 0.03, z);
    for (const s of [-1, 1]) o.caja(x1 - x0, 0.14, 1.4, acera, (x0 + x1) / 2, 0.07, z + s * (ancho / 2 + 0.7));
    for (let x = x0 + 2; x < x1 - 1; x += 5) o.caja(2.2, 0.07, 0.22, raya, x, 0.04, z);
    for (let x = x0 + 6; x < x1; x += 18) for (const s of [-1, 1]) farolaBarrio(o, x, z + s * (ancho / 2 + 1.2));
  };
  calle(-204, -84, 8, 8); calle(-204, -90, -28, 7); calle(-204, -90, 44, 7);
  o.caja(7, 0.06, 112, asfalto, -146, 0.03, 4); for (const s of [-1, 1]) o.caja(1.4, 0.14, 112, acera, -146 + s * 4.2, 0.07, 4);
}
function farolaBarrio(o, x, z) { o.caja(0.16, 4, 0.16, 0x2a2e36, x, 2, z); o.caja(0.9, 0.12, 0.25, 0x2a2e36, x, 3.95, z); solido(x - 0.15, z - 0.15, x + 0.15, z + 0.15, 3, 'poste'); }
function parque(o, cx, cz, az) {
  for (let i = 0; i < 5; i++) arbolPelado(o, cx - 5 + az() * 10, cz - 3 + az() * 6, 1 + az() * 0.4, az);
  banco(o, cx, cz + 2, 0);
}

// una pared recta de (a) a (b) en el eje 'x' (a lo largo de x, en z fijo) o 'z', con huecos [{ en, ancho, tipo }]
function pared(o, eje, fijo, a, b, color, huecos, casaId) {
  const cortes = huecos.slice().sort((p, q) => p.en - q.en);
  let desde = a;
  const tramo = (p, q) => {
    if (q - p < 0.05) return;
    const m = (p + q) / 2, L = q - p;
    if (eje === 'x') { o.caja(L, ALTO_CASA, GROSOR, color, m, ALTO_CASA / 2, fijo); solido(p, fijo - GROSOR / 2, q, fijo + GROSOR / 2, 3, 'muro'); }
    else { o.caja(GROSOR, ALTO_CASA, L, color, fijo, ALTO_CASA / 2, m); solido(fijo - GROSOR / 2, p, fijo + GROSOR / 2, q, 3, 'muro'); }
  };
  for (const h of cortes) {
    tramo(desde, h.en - h.ancho / 2); desde = h.en + h.ancho / 2;
    // lo de encima del hueco (y lo de debajo, si es ventana)
    const L = h.ancho, arriba = h.tipo === 'puerta' ? 2.2 : 1.9;
    const caja = (y0, y1) => (eje === 'x' ? o.caja(L, y1 - y0, GROSOR, color, h.en, (y0 + y1) / 2, fijo) : o.caja(GROSOR, y1 - y0, L, color, fijo, (y0 + y1) / 2, h.en));
    caja(arriba, ALTO_CASA); if (h.tipo === 'ventana') caja(0, 0.9);
    if (h.tipo) hueco(casaId, h.tipo, eje, fijo, h.en, L);
  }
  tramo(desde, b);
}
// un hueco: su sólido (que se abre al poder pasar) y sus piezas (puerta, cristal y hasta 3 tablas)
function hueco(casaId, tipo, eje, fijo, en, ancho) {
  const id = casaId + '-' + tipo[0] + BARRIO.huecos.filter((h) => h.casa === casaId).length;
  const x = eje === 'x' ? en : fijo, z = eje === 'x' ? fijo : en, hx = eje === 'x' ? ancho / 2 : GROSOR / 2, hz = eje === 'x' ? GROSOR / 2 : ancho / 2;
  const sol = solido(x - hx, z - hz, x + hx, z + hz, tipo === 'puerta' ? 2.4 : 1.0, tipo === 'puerta' ? 'muro' : 'bajo');
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = eje === 'x' ? 0 : Math.PI / 2; MOTOR.escena.add(g);
  const pieza = (w, h, d, color, px, py, pz, transparente) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), transparente ? new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.55 }) : matColor(color)); m.position.set(px, py, pz); g.add(m); return m; };
  let puerta = null, cristal = null;
  if (tipo === 'puerta') { puerta = new THREE.Group(); puerta.position.set(-ancho / 2, 0, 0); g.add(puerta); const p = pieza(ancho, 2.15, 0.12, 0x6a4a2e, ancho / 2, 1.08, 0); g.remove(p); puerta.add(p); const pomo = pieza(0.1, 0.1, 0.2, 0xd8b040, ancho - 0.2, 1.05, 0); g.remove(pomo); puerta.add(pomo); }
  else cristal = pieza(ancho, 1.0, 0.08, 0x9ad0f0, 0, 1.4, 0, true);
  const tablas = [0, 1, 2].map((k) => { const t = pieza(ancho + 0.3, 0.2, 0.1, 0x9a6a3a, 0, (tipo === 'puerta' ? 0.6 : 1.05) + k * (tipo === 'puerta' ? 0.55 : 0.32), 0.22); t.rotation.z = (k - 1) * 0.12; t.visible = false; return t; });
  const H = { id, tipo, casa: casaId, x, z, sol, g, puerta, cristal, tablas, eje };
  BARRIO.huecos.push(H); BARRIO.porId[id] = H;
  return H;
}

// una casa: suelo, paredes con su puerta y ventanas, tabique, muebles, valla con buzón y el tejado aparte
function casa(o, id, cx, cz, w, d, frente, [color, tejado], az) {
  const x0 = cx - w / 2, x1 = cx + w / 2, zf = cz + frente * d / 2, zb = cz - frente * d / 2;
  o.caja(w, 0.12, d, 0x8a6a48, cx, 0.06, cz);
  for (let i = 1; i < w; i++) o.caja(0.04, 0.13, d, 0x6a5038, x0 + i, 0.07, cz);
  pared(o, 'x', zf, x0, x1, color, [{ en: cx, ancho: 1.3, tipo: 'puerta' }, { en: cx - w * 0.3, ancho: 1.3, tipo: 'ventana' }, { en: cx + w * 0.3, ancho: 1.3, tipo: 'ventana' }], id);
  pared(o, 'x', zb, x0, x1, color, [{ en: cx + w * 0.25, ancho: 1.3, tipo: 'ventana' }], id);
  const z0 = Math.min(zf, zb), z1 = Math.max(zf, zb);
  pared(o, 'z', x0, z0 + GROSOR / 2, z1 - GROSOR / 2, color, [{ en: cz, ancho: 1.3, tipo: 'ventana' }], id);
  pared(o, 'z', x1, z0 + GROSOR / 2, z1 - GROSOR / 2, color, [{ en: cz, ancho: 1.3, tipo: 'ventana' }], id);
  pared(o, 'z', cx + w * 0.1, z0 + GROSOR / 2, z1 - GROSOR / 2, color, [{ en: cz, ancho: 1.3, tipo: null }], id);   // el tabique, con paso
  muebles(o, cx, cz, w, d, frente, az);
  // el jardín: valla con hueco delante de la puerta, buzón y cubo de basura
  const zv = zf + frente * 2.6;
  for (let x = x0 - 1; x <= x1 + 1; x += 1) if (Math.abs(x - cx) > 1.2) o.caja(0.12, 0.9, 0.12, 0x7a5a3a, x, 0.45, zv);
  for (const s of [-1, 1]) { const a = s < 0 ? x0 - 1 : cx + 1.2, b = s < 0 ? cx - 1.2 : x1 + 1; o.caja(b - a, 0.1, 0.06, 0x7a5a3a, (a + b) / 2, 0.72, zv); solido(a, zv - 0.08, b, zv + 0.08, 0.9, 'bajo'); }
  o.caja(0.12, 1.1, 0.12, 0x3a3e46, cx + 1.8, 0.55, zv + frente * 0.3); o.caja(0.45, 0.35, 0.32, 0x2a5aa8, cx + 1.8, 1.2, zv + frente * 0.3);
  o.cil(0.3, 0.27, 0.9, 8, 0x3a5a3a, x1 + 0.4, 0.45, zv - frente * 0.6); solido(x1 + 0.1, zv - frente * 0.6 - 0.3, x1 + 0.7, zv - frente * 0.6 + 0.3, 0.9, 'bajo');
  contenedor('basura', x1 + 0.4, zv - frente * 1.3);
  if (az() < 0.35) coche(o, cx + (az() - 0.5) * 6, zv + frente * 4.2, [0x2a6ab8, 0xb8282e, 0x3a3a3e, 0xd8d8d0][Math.floor(az() * 4)], Math.PI / 2 + (az() - 0.5) * 0.2, true);
  // el tejado (a dos aguas, con nieve), aparte para quitarlo cuando estás dentro
  const r = new Obra();
  for (const s of [-1, 1]) {
    const zc = cz + s * d / 4;
    r.caja(w + 0.6, 0.3, d / 2 + 0.7, tejado, cx, ALTO_CASA + 0.55, zc, 0, s * 0.32);
    r.caja(w + 0.65, 0.12, d / 2 + 0.75, 0xeef2f6, cx, ALTO_CASA + 0.76, zc, 0, s * 0.32);
  }
  const techo = r.hecha(); MOTOR.escena.add(techo);
  const C = { id, x0, x1, z0, z1, techo };
  BARRIO.casas.push(C);
  return C;
}
// los muebles: cama y mesa (no se registran), y nevera y armario (sí)
function muebles(o, cx, cz, w, d, frente, az) {
  const izq = cx - w / 2 + 0.4, der = cx + w / 2 - 0.4, fondo = cz - frente * (d / 2 - 0.5);
  o.caja(1.2, 0.45, 2.0, 0xe8e0d0, izq + 0.6, 0.35, fondo + frente * 1.0); o.caja(1.2, 0.2, 0.6, 0x5a7ab8, izq + 0.6, 0.65, fondo + frente * 0.3);
  solido(izq, fondo - 0.05, izq + 1.2, fondo + frente * 2.0, 0.6, 'bajo');
  o.caja(0.8, 1.8, 0.7, 0xf0f0f0, der - 0.1, 0.95, fondo); solido(der - 0.5, fondo - 0.35, der + 0.3, fondo + 0.35, 1.8, 'bajo');
  contenedor('nevera', der - 0.1, fondo + frente * 0.9);
  o.caja(1.4, 0.75, 0.9, 0x7a5a3a, der - 1.6, 0.45, cz + frente * 0.6); solido(der - 2.3, cz + frente * 0.6 - 0.45, der - 0.9, cz + frente * 0.6 + 0.45, 0.8, 'bajo');
  o.caja(0.5, 1.6, 1.4, 0x5a4030, izq + 0.05, 0.85, cz + frente * 1.6); solido(izq - 0.2, cz + frente * 1.6 - 0.7, izq + 0.3, cz + frente * 1.6 + 0.7, 1.6, 'bajo');
  contenedor('armario', izq + 0.8, cz + frente * 1.6);
  if (az() < 0.5) o.caja(2.0, 0.6, 0.8, 0x6a3a4a, cx - w * 0.2, 0.4, cz + frente * (d / 2 - 0.9));
}

// cada fotograma: los huecos según su estado (sólido abierto o cerrado, puerta girada, cristal roto, tablas) y el tejado de la casa
// en la que estás, quitado
function pintaBarrio(e) {
  for (const H of BARRIO.huecos) {
    const h = e.huecos[H.id]; if (!h) continue;
    H.sol.abierto = ZOM.pasable(h);
    if (H.puerta) H.puerta.rotation.y = h.roto ? -1.4 : h.abierta ? -1.5 : 0;
    if (H.puerta) H.puerta.visible = !h.roto;
    if (H.cristal) H.cristal.visible = !h.roto;
    H.tablas.forEach((t, k) => (t.visible = k < h.tablas));
  }
  const J = e.jugador;
  for (const C of BARRIO.casas) C.techo.visible = !(J.x > C.x0 && J.x < C.x1 && J.z > C.z0 && J.z < C.z1);
}
function tejadosFuera() { for (const C of BARRIO.casas) C.techo.visible = true; }
// el hueco más cercano a (x, z) dentro de r (para los fans y para ti)
function huecoCercaDe(x, z, r) {
  let mejor = null, dMin = r;
  for (const H of BARRIO.huecos) { const d = Math.hypot(H.x - x, H.z - z); if (d < dMin) { dMin = d; mejor = H; } }
  return mejor;
}
