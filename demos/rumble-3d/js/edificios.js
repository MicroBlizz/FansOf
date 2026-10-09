// Boceto 3D de Fans of Rumble · Las torres, las dos sedes (La Madriguera y la de Microblizz), los escombros cuando
// caen, los puentes y lo que decora el campo (árboles, arbustos, piedras). Todo montado con piezas de código.
'use strict';
import * as THREE from './three.min.js';
import { bola, caja, cajaRedonda, cono, cilindro, aro, piedra, pieza, unir, mallaConBorde, materialToon, materialContorno } from './piezas.js';

const PI = Math.PI;

// un sorteo que siempre da lo mismo (para que los árboles salgan siempre en el mismo sitio)
export function sorteo(semilla) {
  let a = semilla >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function torreAnimales() {
  return [
    cilindro(0x8d939e, [0, 0.45, 0], 2.3, 2.6, 0.9, 0, 14),
    ...[0, 1, 2, 3, 4, 5].map(i => piedra(i % 2 ? 0x9aa0a8 : 0x7d838e, [Math.sin(i * 1.05) * 2.55, 0.35, Math.cos(i * 1.05) * 2.55], 0.45, [i, i * 2, 0])),
    cilindro(0x9a6634, [0, 2.65, 0], 1.5, 1.85, 3.6, 0, 12),
    aro(0x5b3a1c, [0, 1.6, 0], 1.78, 0.13, [PI / 2, 0, 0]),
    aro(0x5b3a1c, [0, 3.45, 0], 1.6, 0.13, [PI / 2, 0, 0]),
    cilindro(0xa0703f, [0, 4.6, 0], 2.45, 2.2, 0.45, 0, 14),
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => caja(0xc79a6b, [Math.sin(i * PI / 5) * 2.25, 5.15, Math.cos(i * PI / 5) * 2.25], [0.22, 0.7, 0.22])),
    cilindro(0xd9b07a, [0, 5.55, 0], 1.2, 1.3, 1.5, 0, 10),
    caja(0x3a1a12, [0, 5.6, 1.23], [0.62, 0.78, 0.12]),
    cono(0xff7a1a, [0, 7.05, 0], 1.95, 1.75, 0, 10),
    cilindro(0x5b3a1c, [0, 8.6, 0], 0.07, 0.07, 1.8, 0, 6),
    caja(0xffcb3d, [0.58, 9.15, 0], [1.05, 0.62, 0.07]),
    bola(0xf7f3ff, [-1.0, 7.0, 0.3], [0.2, 0.55, 0.12], [0, 0, 0.5]),   // orejitas de conejo en el tejado
    bola(0xf7f3ff, [1.0, 7.0, 0.3], [0.2, 0.55, 0.12], [0, 0, -0.5]),
  ];
}

function madriguera() {
  const p = [
    bola(0x67a83f, [0, -0.2, 0], [5.0, 3.5, 4.6]),
    aro(0x5b3a1c, [0, 1.35, 3.95], 1.25, 0.22, [-0.4, 0, 0]),
    cilindro(0x3a1a12, [0, 1.35, 3.9], 1.15, 1.15, 0.2, [PI / 2 - 0.4, 0, 0], 18),
    cilindro(0x8a5a33, [0, 1.35, 4.02], 0.95, 0.95, 0.12, [PI / 2 - 0.4, 0, 0], 18),
    bola(0xffcb3d, [0.5, 1.35, 4.15], 0.12),
    // la zanahoria gigante clavada encima, con su corona
    cono(0xff8a1f, [0, 4.4, 0], 0.85, 3.4, [PI, 0, 0], 12),
    aro(0xc45a12, [0, 4.0, 0], 0.45, 0.06, [PI / 2, 0, 0]),
    aro(0xc45a12, [0, 4.9, 0], 0.66, 0.06, [PI / 2, 0, 0]),
    cono(0x5cc23a, [-0.3, 6.6, 0], 0.32, 1.3, [0, 0, 0.35], 6),
    cono(0x47a82f, [0.3, 6.6, 0], 0.32, 1.3, [0, 0, -0.35], 6),
    cono(0x5cc23a, [0, 6.8, 0.2], 0.3, 1.4, [0.2, 0, 0], 6),
    cilindro(0xffcb3d, [0, 6.25, 0], 0.62, 0.7, 0.5, 0, 10),
  ];
  for (let i = 0; i < 5; i++) p.push(cono(0xffcb3d, [Math.sin(i * 1.26) * 0.62, 6.65, Math.cos(i * 1.26) * 0.62], 0.13, 0.35, 0, 6));
  for (const [x, z] of [[-3.4, 2.6], [3.6, 2.2], [-4.2, -0.5], [4.3, -0.6], [-2.2, 3.7], [2.4, 3.6]]) p.push(cono(0x4f9d3a, [x, 0.6, z], 0.45, 1.3, [z * 0.05, 0, -x * 0.06], 6));
  for (const s of [-1, 1]) {
    p.push(cilindro(0x5b3a1c, [s * 3.8, 2.4, 1.6], 0.08, 0.08, 4.6, 0, 6));
    p.push(caja(0xff7a1a, [s * 3.8 + s * 0.7, 4.3, 1.6], [1.3, 0.8, 0.07]));
  }
  return p;
}

function torreMicroblizz() {
  return [
    cilindro(0x5b6578, [0, 0.45, 0], 2.3, 2.6, 0.9, 0, 14),
    cilindro(0xaab4c4, [0, 3.0, 0], 1.45, 1.8, 4.4, 0, 14),
    cilindro(0x22e3ff, [0, 2.3, 0], 1.66, 1.7, 0.3, 0, 14),
    cilindro(0x22e3ff, [0, 3.7, 0], 1.55, 1.58, 0.3, 0, 14),
    cajaRedonda(0x1b4fc4, [0, 3.0, 1.55], [1.3, 0.85, 0.2], 0.08),
    caja(0x8fd3ff, [0, 3.05, 1.67], [0.8, 0.1, 0.05]),
    cilindro(0x5b6578, [0, 5.45, 0], 2.1, 1.6, 0.6, 0, 14),
    bola(0x2e8bff, [0, 5.9, 0], [1.35, 1.0, 1.35]),
    cilindro(0x3a4252, [0, 7.3, 0], 0.06, 0.06, 1.6, 0, 6),
    bola(0xff4b5c, [0, 8.15, 0], 0.24),
    bola(0xe8f1ff, [1.35, 6.3, 0.4], [0.75, 0.75, 0.22], [0, 0.6, 0.4]),
    cilindro(0x3a4252, [1.6, 6.4, 0.55], 0.04, 0.04, 0.6, [0.9, 0, 0.6], 5),
  ];
}

function sedeMicroblizz(r) {
  const p = [
    cajaRedonda(0x8792a6, [0, 4.2, 0], [8, 8.4, 5.4], 0.5),
    caja(0xffcb3d, [0, 1.1, 2.72], [1.8, 2.0, 0.12]),
    caja(0x5b6578, [0, 2.3, 3.15], [2.8, 0.25, 1.1]),
    caja(0x5b6578, [0, 8.55, 0], [8.4, 0.4, 5.8]),
    cajaRedonda(0xaab4c4, [0, 9.7, -0.6], [4.6, 2.0, 3.4], 0.3),
    cilindro(0x3a4252, [2.8, 10.6, -1.2], 0.08, 0.08, 3.2, 0, 6),
    bola(0xff4b5c, [2.8, 12.3, -1.2], 0.3),
  ];
  for (let fila = 0; fila < 5; fila++) for (let col = 0; col < 6; col++) {
    if (fila === 0 && (col === 2 || col === 3)) continue;
    const luz = r() < 0.62;
    p.push(caja(luz ? 0x9fd8ff : 0x1b4fc4, [-2.95 + col * 1.18, 1.4 + fila * 1.35, 2.73], [0.8, 0.82, 0.1]));
  }
  return p;
}

// los escombros que quedan cuando cae un edificio
function escombros(colores, r, radio) {
  const p = [];
  for (let i = 0; i < 9; i++) {
    const a = r() * PI * 2, d = r() * radio;
    p.push(piedra(colores[i % colores.length], [Math.cos(a) * d, 0.2, Math.sin(a) * d], 0.35 + r() * 0.5, [r() * 3, r() * 3, 0]));
  }
  for (let i = 0; i < 3; i++) p.push(caja(colores[0], [(r() - 0.5) * radio * 1.4, 0.15, (r() - 0.5) * radio * 1.4], [0.3, 0.25, 1.8 + r()], [0, r() * 3, 0]));
  return p;
}

// cartel con letras pintadas en un lienzo
function cartel(texto, ancho, alto) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.round(1024 * alto / ancho);
  const c = cv.getContext('2d');
  c.fillStyle = '#20102c'; c.beginPath(); c.roundRect(6, 6, cv.width - 12, cv.height - 12, 40); c.fill();
  c.fillStyle = '#2e8bff'; c.beginPath(); c.roundRect(22, 22, cv.width - 44, cv.height - 44, 30); c.fill();
  c.font = `${Math.round(cv.height * 0.52)}px "Luckiest Guy", "Arial Black", Impact, sans-serif`;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = 18; c.strokeStyle = '#20102c'; c.strokeText(texto, cv.width / 2, cv.height * 0.56);
  c.fillStyle = '#ffcb3d'; c.fillText(texto, cv.width / 2, cv.height * 0.56);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshBasicMaterial({ map: tex }));
  return m;
}

// los seis edificios del campo, en las mismas posiciones que el juego (01-campo.js), pasadas a 3D (10 px = 1)
export const SITIOS = [
  { lado: 'p', tipo: 'torre', x: -16, z: 15.5, r: 2.5, carril: -1 },
  { lado: 'p', tipo: 'torre', x: 16, z: 15.5, r: 2.5, carril: 1 },
  { lado: 'p', tipo: 'base', x: 0, z: 22.4, r: 4.6, carril: 0 },
  { lado: 'e', tipo: 'torre', x: -16, z: -15.5, r: 2.5, carril: -1 },
  { lado: 'e', tipo: 'torre', x: 16, z: -15.5, r: 2.5, carril: 1 },
  { lado: 'e', tipo: 'base', x: 0, z: -22.4, r: 4.6, carril: 0 },
];

export function crearEdificios(escena) {
  const r = sorteo(7), lista = [];
  for (const s of SITIOS) {
    const animales = s.lado === 'p';
    const piezas = s.tipo === 'torre' ? (animales ? torreAnimales() : torreMicroblizz()) : (animales ? madriguera() : sedeMicroblizz(r));
    const colores = animales ? [0x9a6634, 0x8d939e, 0xff7a1a, 0xa0703f] : [0xaab4c4, 0x5b6578, 0x2e8bff, 0x22e3ff];
    const entero = mallaConBorde(unir(piezas), 0.09);
    const roto = mallaConBorde(unir(escombros(colores, r, s.r)), 0.07);
    roto.visible = false;
    const grupo = new THREE.Group(); grupo.position.set(s.x, 0, s.z);
    grupo.add(entero, roto);
    if (!animales && s.tipo === 'base') { const c = cartel('MICROBLIZZ', 7.2, 1.6); c.position.set(0, 11.4, 0.6); entero.add(c); }
    escena.add(grupo);
    lista.push({ ...s, grupo, entero, roto, colores, alto: s.tipo === 'base' ? (animales ? 8.2 : 13.2) : (animales ? 10 : 9) });
  }
  return lista;
}

// los puentes de madera (en x = ±16, como en el juego: 110 y 430 px)
export function crearPuentes(escena) {
  const p = [];
  for (const bx of [-16, 16]) {
    for (let i = 0; i < 9; i++) p.push(caja(i % 2 ? 0xa0703f : 0x8a5a33, [bx, 0.13, -3.4 + i * 0.85], [5.4, 0.26, 0.78], [0, (i % 3 - 1) * 0.02, 0]));
    for (const s of [-1, 1]) {
      p.push(caja(0x6b4426, [bx + s * 2.45, 0.05, 0], [0.4, 0.4, 7.8]));
      for (const z of [-3.6, -1.2, 1.2, 3.6]) p.push(cilindro(0x6b4426, [bx + s * 2.75, 0.75, z], 0.16, 0.19, 1.3, 0, 7));
      p.push(cajaRedonda(0x8a5a33, [bx + s * 2.75, 1.35, 0], [0.28, 0.28, 7.6], 0.1));
    }
  }
  escena.add(mallaConBorde(unir(p), 0.06));
}

// árboles, arbustos y piedras alrededor del campo (sin pisar caminos, río ni edificios)
export function crearDecorado(escena, libre) {
  const r = sorteo(42);
  const arbol = unir([
    cilindro(0x7a4a26, [0, 0.75, 0], 0.22, 0.34, 1.5, 0, 7),
    pieza(new THREE.IcosahedronGeometry(1.35, 1), 0x4f9d3a, { p: [0, 2.35, 0] }),
    pieza(new THREE.IcosahedronGeometry(0.85, 1), 0x63b84a, { p: [0.55, 3.0, 0.35] }),
    pieza(new THREE.IcosahedronGeometry(0.7, 1), 0x45903a, { p: [-0.6, 2.9, -0.2] }),
  ]);
  const arbusto = unir([bola(0x4f9d3a, [0, 0.4, 0], [0.8, 0.6, 0.75]), bola(0x63b84a, [0.5, 0.55, 0.2], [0.5, 0.45, 0.5]), bola(0xff9bb0, [-0.2, 0.9, 0.45], 0.12), bola(0xffe066, [0.4, 0.95, 0.3], 0.1)]);
  const roca = unir([piedra(0x9aa0a8, [0, 0.3, 0], 0.7), piedra(0x7d838e, [0.6, 0.2, 0.3], 0.4)]);
  const sitios = { arbol: [], arbusto: [], roca: [] };
  // dentro del campo: pocos, en los huecos
  for (let i = 0; i < 400 && sitios.arbol.length + sitios.arbusto.length + sitios.roca.length < 34; i++) {
    const x = (r() - 0.5) * 50, z = (r() - 0.5) * 66;
    if (!libre(x, z, 3.2)) continue;
    const q = r(); (q < 0.35 ? sitios.arbol : q < 0.75 ? sitios.arbusto : sitios.roca).push([x, z, 0.7 + r() * 0.5, r() * 6]);
  }
  // fuera del campo: un bosque a cada lado
  for (let i = 0; i < 70; i++) {
    const s = i % 2 ? 1 : -1, x = s * (27 + r() * 9), z = -40 + r() * 82;
    if (Math.abs(z) < 3) continue;
    sitios.arbol.push([x, z, 0.9 + r() * 0.6, r() * 6]);
  }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), eje = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3(), s = new THREE.Vector3();
  const toon = materialToon(), borde = materialContorno(0.08);
  for (const [nombre, geo] of [['arbol', arbol], ['arbusto', arbusto], ['roca', roca]]) {
    const lista = sitios[nombre];
    const malla = new THREE.InstancedMesh(geo, toon, lista.length), linea = new THREE.InstancedMesh(geo, borde, lista.length);
    lista.forEach(([x, z, e, g], i) => malla.setMatrixAt(i, m.compose(v.set(x, 0, z), q.setFromAxisAngle(eje, g), s.set(e, e, e))));
    linea.instanceMatrix = malla.instanceMatrix;
    escena.add(malla, linea);
  }
  return sitios;
}
