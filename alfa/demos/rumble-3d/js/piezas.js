// Boceto 3D de Fans of Rumble · Las piezas con las que se montan los muñecos y los edificios: bolas, cajas, conos…
// Igual que el juego dibuja con código («círculo aquí, rectángulo allá»), aquí se modela con código: nada de archivos 3D.
// Cada pieza lleva su color pegado, y luego se juntan todas las de un trozo (cabeza, brazo…) en una sola: así el móvil
// dibuja un trozo de golpe para todos los muñecos iguales, en vez de pieza a pieza.
'use strict';
import * as THREE from './three.min.js';

export const CONTORNO = 0x20102c;   // el mismo color de borde que el juego (--outline)

// el «estilo dibujo animado»: solo tres tonos de luz (claro, medio y sombra), sin degradados
let gradiente = null;
export function gradienteToon() {
  if (!gradiente) {
    gradiente = new THREE.DataTexture(new Uint8Array([105, 182, 255]), 3, 1, THREE.RedFormat);
    gradiente.minFilter = gradiente.magFilter = THREE.NearestFilter;
    gradiente.needsUpdate = true;
  }
  return gradiente;
}
export function materialToon(extra = {}) {
  return new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: gradienteToon(), ...extra });
}
// el borde negro: la misma forma, un poco más gorda, pintada por dentro y en oscuro
export function materialContorno(grosor = 0.07) {
  const m = new THREE.MeshBasicMaterial({ color: CONTORNO, side: THREE.BackSide });
  m.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n\ttransformed += normal * ${grosor.toFixed(3)};`);
  };
  m.customProgramCacheKey = () => 'contorno-' + grosor;
  return m;
}

const _v = new THREE.Vector3();
function matriz({ p, r, s } = {}) {
  const lista = (x, d) => (Array.isArray(x) ? x : d);   // un 0 o nada = sin giro / sin moverlo
  return new THREE.Matrix4().compose(new THREE.Vector3(...lista(p, [0, 0, 0])), new THREE.Quaternion().setFromEuler(new THREE.Euler(...lista(r, [0, 0, 0]))), new THREE.Vector3(...lista(s, [1, 1, 1])));
}

// una pieza = forma + color + dónde va (p: posición, r: giro, s: tamaño)
export function pieza(geo, color, donde) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  g.applyMatrix4(matriz(donde));
  const c = new THREE.Color(color), n = g.attributes.position.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'color') g.deleteAttribute(k);
  return g;
}
// mueve un grupo de piezas ya hechas (por ejemplo, una corona entera inclinada)
export function mover(piezas, donde) { const m = matriz(donde); for (const g of piezas) g.applyMatrix4(m); return piezas; }

// junta muchas piezas en una sola forma
export function unir(piezas) {
  let total = 0;
  for (const g of piezas) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
  let o = 0;
  for (const g of piezas) {
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); col.set(g.attributes.color.array, o * 3);
    o += g.attributes.position.count;
  }
  const r = new THREE.BufferGeometry();
  r.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  r.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  r.setAttribute('color', new THREE.BufferAttribute(col, 3));
  r.computeBoundingSphere();
  return r;
}

/* ---------- formas ---------- */
// bolas con más o menos detalle según su tamaño: con 60 muñecos en pantalla, cada triángulo cuenta
const ESFERAS = [[0.9, new THREE.SphereGeometry(1, 14, 10)], [0.45, new THREE.SphereGeometry(1, 11, 8)], [0.2, new THREE.SphereGeometry(1, 8, 6)], [0, new THREE.SphereGeometry(1, 6, 4)]];
const cacheCajas = new Map();

export function bola(color, p, radio, r) {
  const [a, b = a, c = a] = [].concat(radio);
  const tam = Math.max(a, b, c);
  return pieza(ESFERAS.find(([m]) => tam >= m)[1], color, { p, r, s: [a, b, c] });
}
export function caja(color, p, [w, h, d], r) { return pieza(new THREE.BoxGeometry(w, h, d), color, { p, r }); }
export function cono(color, p, radio, alto, r, lados = 10) { return pieza(new THREE.ConeGeometry(radio, alto, lados), color, { p, r }); }
export function cilindro(color, p, arriba, abajo, alto, r, lados = 14) { return pieza(new THREE.CylinderGeometry(arriba, abajo, alto, lados), color, { p, r }); }
export function aro(color, p, radio, tubo, r) { return pieza(new THREE.TorusGeometry(radio, tubo, 8, 22), color, { p, r }); }
export function piedra(color, p, radio, r) { return pieza(new THREE.DodecahedronGeometry(radio, 0), color, { p, r }); }

// caja con las esquinas redondeadas (con normales suaves, para que el borde negro no se rompa en las aristas)
export function cajaRedonda(color, p, [w, h, d], radio, r) {
  const clave = [w, h, d, radio].join();
  if (!cacheCajas.has(clave)) cacheCajas.set(clave, geoCajaRedonda(w, h, d, radio, Math.max(w, h, d) < 1.2 ? 4 : 8));
  return pieza(cacheCajas.get(clave), color, { p, r });
}
function geoCajaRedonda(w, h, d, radio, trozos) {
  const g = new THREE.BoxGeometry(w, h, d, trozos, trozos, trozos);
  const pos = g.attributes.position, nor = g.attributes.normal, dentro = new THREE.Vector3();
  const mitad = [w / 2, h / 2, d / 2], interior = mitad.map(m => Math.max(0, m - radio));
  // reparte los vértices: pocos para la parte plana y la mayoría para la curva
  const reparte = (c, m, i) => { const u = c / m, a = Math.abs(u); return Math.sign(u) * (a <= 0.3 ? (a / 0.3) * i : i + ((a - 0.3) / 0.7) * radio); };
  for (let k = 0; k < pos.count; k++) {
    _v.set(reparte(pos.getX(k), mitad[0], interior[0]), reparte(pos.getY(k), mitad[1], interior[1]), reparte(pos.getZ(k), mitad[2], interior[2]));
    dentro.set(THREE.MathUtils.clamp(_v.x, -interior[0], interior[0]), THREE.MathUtils.clamp(_v.y, -interior[1], interior[1]), THREE.MathUtils.clamp(_v.z, -interior[2], interior[2]));
    const dir = _v.clone().sub(dentro);
    if (dir.lengthSq() < 1e-10) dir.set(nor.getX(k), nor.getY(k), nor.getZ(k));
    dir.normalize();
    pos.setXYZ(k, dentro.x + dir.x * radio, dentro.y + dir.y * radio, dentro.z + dir.z * radio);
    nor.setXYZ(k, dir.x, dir.y, dir.z);
  }
  return g;
}

// una malla quieta (edificios, árboles…) con su borde negro
export function mallaConBorde(geo, grosor = 0.08) {
  const grupo = new THREE.Group();
  grupo.add(new THREE.Mesh(geo, materialToon()));
  grupo.add(new THREE.Mesh(geo, materialContorno(grosor)));
  return grupo;
}
