// Fans of Ratkov · PIEZAS DEL MAPA (1): el registro del mapa (lo sólido, los contenedores, los fuegos, las salidas) y las piezas grandes:
// bloques de viviendas de paneles medio derrumbados, la torre de Microblizz partida y la estatua derribada del Director General.
// Cada pieza se dibuja en una OBRA (js/motor.js) y apunta sus rectángulos sólidos para chocar y para que las balas se paren.
'use strict';
const MAPA = { x0: -80, x1: 80, z0: -60, z1: 60, solidos: [], rejilla: new Map(), CEL: 4, contenedores: [], fuegos: [], salidas: [], obra: null, grupo: null };
// un rectángulo sólido: de (x0, z0) a (x1, z1), con su altura (bajo = sacos o coches: tapan menos la vista)
function solido(x0, z0, x1, z1, h = 3, tipo = 'muro') {
  const s = { x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), h, tipo };
  MAPA.solidos.push(s);
  const C = MAPA.CEL;
  for (let i = Math.floor(s.x0 / C); i <= Math.floor(s.x1 / C); i++) for (let j = Math.floor(s.z0 / C); j <= Math.floor(s.z1 / C); j++) {
    const k = i + ',' + j; if (!MAPA.rejilla.has(k)) MAPA.rejilla.set(k, []); MAPA.rejilla.get(k).push(s);
  }
  return s;
}
// un rectángulo sólido girado (se aproxima con el rectángulo que lo envuelve, un poco encogido)
function solidoGirado(x, z, w, d, giro, h, tipo) {
  const c = Math.abs(Math.cos(giro)), s = Math.abs(Math.sin(giro)), ww = (w * c + d * s) * 0.92, dd = (w * s + d * c) * 0.92;
  return solido(x - ww / 2, z - dd / 2, x + ww / 2, z + dd / 2, h, tipo);
}
// un contenedor que se puede registrar
function contenedor(tipo, x, z, extra = {}) { const c = Object.assign({ tipo, x, z, abierto: false, cosas: null, cerrado: false }, extra); MAPA.contenedores.push(c); return c; }
// un bidón con fuego: calienta a su alrededor
function bidonFuego(o, x, z) {
  o.cil(0.45, 0.45, 1.1, 8, 0x3a2c24, x, 0.55, z); o.cil(0.47, 0.47, 0.08, 8, 0x5a4434, x, 0.95, z);
  MAPA.fuegos.push({ x, z }); solido(x - 0.45, z - 0.45, x + 0.45, z + 0.45, 1.1, 'bajo');
}

/* ---------- los fuegos: llamas que se mueven, el círculo de calor en el suelo y luz en los dos más cercanos ---------- */
const RADIO_CALOR = 4.2;
const FUEGOS_V = { llamas: [], luces: [] };
function creaFuegos() {
  const e = MOTOR.escena, calor = new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0.2, depthWrite: false }), borde = new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.55, depthWrite: false });
  const geo = new THREE.BoxGeometry(0.42, 0.42, 0.42), mats = [0xffd27a, 0xff9a3a, 0xff6a1a].map(c => new THREE.MeshBasicMaterial({ color: c }));
  for (const f of MAPA.fuegos) {
    const suelo = new THREE.Mesh(new THREE.CircleGeometry(RADIO_CALOR, 24), calor); suelo.rotation.x = -Math.PI / 2; suelo.position.set(f.x, 0.04, f.z); e.add(suelo);
    const aro = new THREE.Mesh(new THREE.RingGeometry(RADIO_CALOR - 0.25, RADIO_CALOR, 32), borde); aro.rotation.x = -Math.PI / 2; aro.position.set(f.x, 0.05, f.z); e.add(aro);
    for (let k = 0; k < 5; k++) { const m = new THREE.Mesh(geo, mats[k % 3]); m.position.set(f.x + (k % 2 ? 0.12 : -0.12), 1.2 + k * 0.12, f.z + (k % 3 - 1) * 0.12); e.add(m); FUEGOS_V.llamas.push({ m, f, k }); }
  }
  for (let i = 0; i < 2; i++) { const l = new THREE.PointLight(0xff8a3a, 0, 7, 2); e.add(l); FUEGOS_V.luces.push(l); }
}
function animaFuegos(t, cx, cz) {
  for (const L of FUEGOS_V.llamas) { const s = 0.6 + 0.5 * Math.abs(Math.sin(t * 9 + L.k * 1.7 + L.f.x)); L.m.scale.setScalar(s); L.m.position.y = 1.2 + ((t * 1.4 + L.k * 0.2) % 0.9); L.m.rotation.y = t * 3 + L.k; }
  const cerca = MAPA.fuegos.slice().sort((a, b) => lejos(cx, cz, a.x, a.z) - lejos(cx, cz, b.x, b.z)).slice(0, 2);
  FUEGOS_V.luces.forEach((l, i) => { const f = cerca[i]; if (!f) { l.intensity = 0; return; } l.position.set(f.x, 1.8, f.z); l.intensity = 2.6 + Math.sin(t * 13 + i) * 0.5; });
}

/* ---------- texturas de fachada ---------- */
let TX_PANEL = null, TX_CRISTAL = null, TX_LETRERO = null;
function texturasMapa() {
  const az = semilla(77);
  TX_PANEL = textura(16, 16, g => {
    g.fillStyle = '#9c968c'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#857f75'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16);
    for (const x of [2, 9]) { g.fillStyle = '#262c34'; g.fillRect(x, 4, 5, 7); g.fillStyle = '#3a424c'; g.fillRect(x, 4, 5, 1); g.fillStyle = '#e8eef4'; g.fillRect(x - 1, 11, 7, 1); }
    for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(40,36,30,.25)'; g.fillRect(az() * 16 | 0, az() * 16 | 0, 1, 2 + (az() * 4 | 0)); }
  });
  TX_CRISTAL = textura(16, 16, g => { g.fillStyle = '#3a4a5a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#50667a'; for (const [x, y] of [[1, 1], [9, 1], [1, 9], [9, 9]]) g.fillRect(x, y, 6, 6); g.fillStyle = '#0d1014'; g.fillRect(9, 9, 6, 6); g.fillRect(1, 1, 3, 3); });
  TX_LETRERO = textura(64, 12, g => { g.fillStyle = '#10141a'; g.fillRect(0, 0, 64, 12); g.fillStyle = '#58c8ff'; g.font = 'bold 10px monospace'; g.fillText('MICROBLIZZ', 3, 10); g.fillStyle = '#10141a'; g.fillRect(16, 2, 6, 9); g.fillRect(45, 2, 5, 9); });
  TX_LETRERO.wrapS = TX_LETRERO.wrapT = THREE.ClampToEdgeWrapping;
}

/* ---------- bloque de viviendas de paneles ---------- */
// x0: esquina oeste; z: centro de su fondo; tramos: alturas en pisos de cada tramo de 3 de ancho (0 = derrumbado, solo escombros)
// gira = true: el bloque va de norte a sur (fachada mirando al este)
const PISO = 1.5;
function bloque(x0, z, tramos, d, color, azar) {
  const ob = new Obra(), w = tramos.length * 3, pmax = Math.max(...tramos);
  tramos.forEach((p, i) => {
    const x = x0 + i * 3 + 1.5, h = p * PISO;
    if (p <= 0) {
      for (let k = 0; k < 7; k++) { const s = 0.5 + azar() * 1.1; ob.caja(s, s * 0.5, s, azar() < 0.5 ? 0x8a847a : 0x6e6a64, x - 1.2 + azar() * 2.4, s * 0.25, z - d / 2 + azar() * d, azar() * 3); }
      ob.caja(2.8, 0.5, d * 0.85, 0x7e7a72, x, 0.25, z); ob.caja(2.7, 0.1, d * 0.8, 0xc4ccd6, x, 0.52, z);
      solido(x - 1.5, z - d / 2, x + 1.5, z + d / 2, 0.8, 'bajo');
      return;
    }
    ob.caja(3, h, d, color, x, h / 2, z);
    ob.plano(3, h, TX_PANEL, 1.5, p, x, h / 2, z + d / 2 + 0.01);
    ob.caja(3.1, 0.25, d + 0.1, NIEVE_C, x, h + 0.12, z);
    if (p < pmax) {
      for (let k = 1; k <= pmax - p; k++) if (azar() < 0.5) { const fw = 1.2 + azar(), rz = (azar() - 0.5) * 0.4, xx = x + (i % 2 ? 1 : -1) * 0.6, y = h + k * PISO; ob.caja(fw, 0.15, d * 0.6, 0x7a766e, xx, y, z, 0, 0, rz); ob.caja(fw, 0.08, d * 0.6, NIEVE_C, xx, y + 0.1, z, 0, 0, rz); }
      for (let k = 0; k < 3; k++) ob.cil(0.03, 0.03, 1.2, 3, 0x5a3a2a, x - 1 + k, h + 0.5, z + d / 2 - 0.2, 0, 0, (azar() - 0.5) * 0.8);
    }
    for (let f = 1; f < p; f += 2) if (azar() < 0.45) { const xx = x - 0.6 + (f % 3) * 0.6; ob.caja(1.1, 0.12, 0.5, 0x8a847a, xx, f * PISO + 0.1, z + d / 2 + 0.25); ob.caja(1.1, 0.06, 0.5, NIEVE_C, xx, f * PISO + 0.19, z + d / 2 + 0.25); }
    solido(x - 1.5, z - d / 2, x + 1.5, z + d / 2, h, 'edificio');
  });
  const g = ob.hecha(); MOTOR.escena.add(g);
  apuntaTapa(g, x0, x0 + w, z - d / 2, z + d / 2, pmax * PISO);
  return { x0, x1: x0 + w, z0: z - d / 2, z1: z + d / 2 };
}
// el mismo bloque, de norte a sur, con la fachada mirando al este (+x) o al oeste (-x)
function bloqueGirado(x, z0, tramos, d, color, azar, mira = 1) {
  const ob = new Obra(), pmax = Math.max(...tramos);
  tramos.forEach((p, i) => {
    const z = z0 + i * 3 + 1.5, h = p * PISO;
    if (p <= 0) { for (let k = 0; k < 6; k++) { const s = 0.5 + azar(); ob.caja(s, s * 0.5, s, 0x7a766e, x - d / 2 + azar() * d, s * 0.25, z - 1.2 + azar() * 2.4, azar() * 3); } solido(x - d / 2, z - 1.5, x + d / 2, z + 1.5, 0.8, 'bajo'); return; }
    ob.caja(d, h, 3, color, x, h / 2, z); ob.caja(d + 0.1, 0.25, 3.1, NIEVE_C, x, h + 0.12, z);
    ob.plano(3, h, TX_PANEL, 1.5, p, x + mira * (d / 2 + 0.01), h / 2, z, mira * Math.PI / 2);
    ob.plano(3, h, TX_PANEL, 1.5, p, x, h / 2, z + 1.51, 0);
    solido(x - d / 2, z - 1.5, x + d / 2, z + 1.5, h, 'edificio');
  });
  const g = ob.hecha(); MOTOR.escena.add(g);
  apuntaTapa(g, x - d / 2, x + d / 2, z0, z0 + tramos.length * 3, pmax * PISO);
}

/* ---------- la sede de Microblizz: una torre partida con el letrero sin letras ---------- */
function torreMicroblizz(x, z) {
  const ob = new Obra(), w = 10, d = 7, h = 18;
  ob.caja(w, h, d, 0x2e3a46, x, h / 2, z); ob.plano(w, h, TX_CRISTAL, 4, 9, x, h / 2, z + d / 2 + 0.01);
  ob.caja(w + 0.2, 0.3, d + 0.2, NIEVE_C, x, h + 0.15, z);
  ob.caja(7, 6, 6.4, 0x34404c, x - 3, h + 2.6, z + 0.4, 0, 0, 0.5); ob.caja(7.1, 0.25, 6.5, NIEVE_C, x - 1.6, h + 5.4, z + 0.4, 0, 0, 0.5);
  ob.plano(9, 1.7, TX_LETRERO, 1, 1, x, h - 3, z + d / 2 + 0.06);
  // soportales con columnas
  for (let i = -2; i <= 2; i++) ob.cil(0.35, 0.35, 4, 8, 0x7a7f86, x + i * 2.2, 2, z + d / 2 + 1.6);
  ob.caja(w + 1, 0.5, 2.4, 0x3a3f46, x, 4.2, z + d / 2 + 1.4); ob.caja(w + 1, 0.12, 2.4, NIEVE_C, x, 4.5, z + d / 2 + 1.4);
  const g = ob.hecha(); MOTOR.escena.add(g); apuntaTapa(g, x - w / 2, x + w / 2, z - d / 2, z + d / 2, h);
  solido(x - w / 2, z - d / 2, x + w / 2, z + d / 2, h, 'edificio');
  for (let i = -2; i <= 2; i++) solido(x + i * 2.2 - 0.35, z + d / 2 + 1.25, x + i * 2.2 + 0.35, z + d / 2 + 1.95, 4, 'muro');
  destelloFijo(0x58c8ff, 3, 12, x, h - 2, z + d / 2 + 3);
}
// una luz que no se apaga (el letrero, la salida)
function destelloFijo(color, f, alc, x, y, z) { const l = new THREE.PointLight(color, f, alc, 2); l.position.set(x, y, z); MOTOR.escena.add(l); return l; }

/* ---------- el monumento derribado al Director General ---------- */
function estatua(o, x, z) {
  const br = 0x5f7a6a, brO = 0x4a5e52, bug = 0x8a2bff, cian = 0x39d5e8;
  o.caja(4.4, 2.6, 3, 0x7a7670, x, 1.3, z - 3); o.caja(4.6, 0.2, 3.2, 0xc4ccd6, x, 2.7, z - 3);
  o.caja(1.1, 1.2, 1.4, brO, x - 0.8, 3.4, z - 3); o.caja(1.1, 0.9, 1.4, brO, x + 0.8, 3.25, z - 3);
  solido(x - 2.2, z - 4.5, x + 2.2, z - 1.5, 3, 'muro');
  // tumbada en la nieve: piernas, cuerpo, brazo con maletín; la cabeza rodó más allá
  o.caja(1.6, 1.0, 4.0, brO, x - 0.6, 0.5, z + 1.4); o.caja(1.6, 1.0, 4.0, brO, x + 1.2, 0.5, z + 1.6);
  o.caja(3.6, 1.4, 4.4, br, x + 0.4, 0.7, z + 5.4); o.caja(0.5, 0.05, 2.6, 0x8a2a2a, x + 0.4, 1.42, z + 5.6);
  o.caja(1.0, 1.0, 3.6, br, x + 2.8, 0.5, z + 5.0, 0.5); o.caja(1.8, 1.2, 0.6, 0x3a2a20, x + 4.0, 0.6, z + 3.4);
  o.caja(1.0, 1.0, 3.2, br, x - 2.0, 0.5, z + 6.4, -0.7);
  o.caja(2.0, 2.0, 2.2, br, x - 3.6, 1.0, z + 9.0, 0.6, 0.2, 0.3);
  o.caja(1.6, 0.12, 1.4, 0xdfe6ee, x - 0.2, 1.46, z + 4.4); o.caja(1.0, 0.1, 1.2, 0xdfe6ee, x - 0.6, 1.05, z + 0.6);
  solido(x - 1.4, z - 0.6, x + 2.0, z + 3.6, 1, 'bajo'); solido(x - 1.4, z + 3.2, x + 2.2, z + 7.6, 1.4, 'bajo'); solido(x - 4.6, z + 8, x - 2.6, z + 10, 2, 'bajo');
  solido(x + 3.1, z + 3.1, x + 4.9, z + 3.7, 1.2, 'bajo');
  // del cuello sale la grieta bugueada
  [[0.4, 1.6, 7.8, 0.7], [1.0, 2.2, 8.2, 0.5], [-0.2, 1.9, 8.4, 0.45], [0.6, 2.8, 8.0, 0.35], [-0.6, 1.4, 7.9, 0.4]].forEach(([dx, y, dz, s], i) => o.caja(s, s, s, i % 3 === 2 ? cian : bug, x + dx, y, z + dz, i * 0.7, i, i * 0.3));
  destelloFijo(0xa050ff, 2.2, 6, x + 0.4, 2.4, z + 8.6);
  return { x: x + 0.4, z: z + 8.4 };
}
