// Boceto 3D de Fans of Rumble · Cómo se mueven y se pintan los muñecos.
// - Especie: todos los muñecos iguales (todos los becarios, por ejemplo) se pintan de una vez por cada trozo. Es el truco
//   que hace que 30 o 60 muñecos no cuesten mucho más que uno («instancias»).
// - animar(): las animaciones hechas con código: andar, respirar, atacar, saludar, saltar, aplastarse al caer…
// - Sombras y Barras: la sombra redonda bajo cada muñeco y la barra de vida que siempre mira a la cámara.
'use strict';
import * as THREE from './three.min.js';
import { materialToon, materialContorno, unir } from './piezas.js';

const _base = new THREE.Matrix4(), _a = new THREE.Matrix4(), _r = new THREE.Matrix4(), _b = new THREE.Matrix4();
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();

export class Especie {
  constructor(escena, def, max = 90) {
    this.def = def; this.max = max; this.huesos = [];
    const toon = materialToon(), borde = materialContorno(def.contorno ?? 0.075);
    for (const [nombre, h] of Object.entries(def.huesos)) {
      const geo = unir(h.piezas);
      const malla = new THREE.InstancedMesh(geo, toon, max);
      malla.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for (let i = 0; i < max; i++) malla.setColorAt(i, _c.setRGB(1, 1, 1));
      const contorno = new THREE.InstancedMesh(geo, borde, max);
      contorno.instanceMatrix = malla.instanceMatrix;   // los dos comparten dónde está cada muñeco
      for (const m of [malla, contorno]) { m.count = 0; m.frustumCulled = false; escena.add(m); }
      const indice = this.huesos.length;
      this.huesos.push({ nombre, padre: h.padre ? this.huesos.findIndex(x => x.nombre === h.padre) : -1, pivote: new THREE.Vector3(...h.pivote), malla, contorno, mundo: new THREE.Matrix4(), indice });
    }
  }

  // coloca todos los muñecos de la lista para este fotograma
  pintar(lista) {
    const n = Math.min(lista.length, this.max), esc = this.def.escala;
    for (let i = 0; i < n; i++) {
      const u = lista[i], P = u.pose, R = P.raiz;
      const adelante = R.adelante * esc;
      _p.set(u.x + Math.sin(u.yaw) * adelante, u.y, u.z + Math.cos(u.yaw) * adelante);
      _q.setFromEuler(_e.set(R.rx, u.yaw + R.ry, R.rz, 'YXZ'));
      _s.set(esc * R.sx, esc * R.sy, esc * R.sz);
      _base.compose(_p, _q, _s);
      const brillo = 1 + u.destello * 2.2;
      for (const h of this.huesos) {
        const o = P[h.nombre];
        _a.makeTranslation(h.pivote.x + o.x, h.pivote.y + o.y, h.pivote.z + o.z);
        _r.makeRotationFromEuler(_e.set(o.rx, o.ry, o.rz, 'XYZ'));
        _b.makeTranslation(-h.pivote.x, -h.pivote.y, -h.pivote.z);
        h.mundo.copy(h.padre >= 0 ? this.huesos[h.padre].mundo : _base).multiply(_a).multiply(_r).multiply(_b);
        h.malla.setMatrixAt(i, h.mundo);
        h.malla.setColorAt(i, _c.setRGB(brillo, brillo, brillo));
      }
    }
    for (const h of this.huesos) {
      h.malla.count = h.contorno.count = n;
      h.malla.instanceMatrix.needsUpdate = true;
      if (h.malla.instanceColor) h.malla.instanceColor.needsUpdate = true;
    }
  }
}

export function nuevaPose(def) {
  const p = { raiz: { rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1, adelante: 0 } };
  for (const k of Object.keys(def.huesos)) p[k] = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
  return p;
}

const suave = x => x * x * (3 - 2 * x);

// pone la postura de un muñeco según lo que esté haciendo (u.estado, u.mueve, u.ataque…)
export function animar(u, t) {
  const P = u.pose, R = P.raiz;
  for (const k in P) { const o = P[k]; if (k === 'raiz') { o.rx = o.ry = o.rz = o.adelante = 0; o.sx = o.sy = o.sz = 1; } else o.x = o.y = o.z = o.rx = o.ry = o.rz = 0; }
  const m = u.mueve, s = Math.sin(u.paso), fase = t * 1.0 + u.id * 1.7;

  // quieto: respira; andando: bota, balancea brazos y piernas
  const respira = Math.sin(fase * 3) * 0.035 * (1 - m);
  R.sy = 1 + respira; R.sx = R.sz = 1 - respira * 0.6;
  P.cuerpo.y = Math.abs(s) * 0.32 * m;
  P.cuerpo.rx = 0.14 * m; P.cuerpo.rz = s * 0.07 * m;
  P.cabeza.rx = -0.08 * m + Math.sin(u.paso * 2 + 0.7) * 0.06 * m;
  P.cabeza.rz = -s * 0.06 * m + Math.sin(fase * 1.3) * 0.04 * (1 - m);
  P.piernaI.rx = s * 0.9 * m; P.piernaD.rx = -s * 0.9 * m;
  P.brazoI.rx = -s * 0.75 * m + Math.sin(fase * 2.2) * 0.06; P.brazoD.rx = s * 0.75 * m - Math.sin(fase * 2.2) * 0.06;
  if (P.cola) { P.cola.rx = Math.sin(fase * 5) * 0.12 + s * 0.22 * m; P.cola.rz = Math.sin(fase * 3.4) * 0.14; }

  // atacar: coger impulso, pegar y volver (u.ataque va de 0 a 1)
  if (u.ataque >= 0) {
    const a = u.ataque;
    let brazo, inclina, avanza;
    if (a < 0.42) { const e = suave(a / 0.42); brazo = 2.5 * e; inclina = -0.2 * e; avanza = -0.15 * e; }
    else if (a < 0.6) { const e = (a - 0.42) / 0.18; brazo = 2.5 - 3.9 * e; inclina = -0.2 + 0.62 * e; avanza = -0.15 + 0.75 * e; }
    else { const e = suave((a - 0.6) / 0.4); brazo = -1.4 * (1 - e); inclina = 0.42 * (1 - e); avanza = 0.6 * (1 - e); }
    P.brazoD.rx = brazo; P.cuerpo.rx = inclina; R.adelante = avanza; P.cabeza.rx = inclina * 0.5;
    if (u.tipo !== 'bunny') P.brazoI.rx = brazo * (u.tipo === 'squirrel' ? 0.9 : 0.3);
  }

  // recién llegado: saluda a la cámara
  if (u.estado === 'pose') {
    const w = Math.sin(t * 15 + u.id);
    P.brazoD.rz = 2.5 + w * 0.35; P.brazoI.rz = -0.5 - Math.abs(w) * 0.2;
    P.cuerpo.y = Math.abs(Math.sin(t * 7 + u.id)) * 0.3;
  }
  // bajando del cielo: estirado y con los brazos arriba
  if (u.estado === 'cae') { R.sy = 1.22; R.sx = R.sz = 0.84; P.brazoI.rz = -2.6; P.brazoD.rz = 2.6; P.piernaI.rx = 0.3; P.piernaD.rx = -0.3; }
  // el salto de CrazyBunny: hecho una bola, con la zanahoria por encima de la cabeza y dando una vuelta
  if (u.estado === 'salto') {
    const k = u.estadoT / u.saltoDura;
    R.sy = 1.12; R.sx = R.sz = 0.92; R.ry = suave(Math.min(1, k * 1.15)) * Math.PI * 2;
    P.piernaI.rx = P.piernaD.rx = -1.0; P.brazoI.rz = -2.4; P.brazoD.rx = 2.6 - 4 * Math.max(0, k - 0.75);
  }
  // celebrando que ha ganado
  if (u.estado === 'fiesta') {
    P.brazoI.rz = -2.7; P.brazoD.rz = 2.7 + Math.sin(t * 12) * 0.3;
    P.cuerpo.y = Math.abs(Math.sin(t * 6 + u.id)) * 0.6;
  }
  // aplastado al tocar el suelo y al recibir un golpe
  if (u.aplasta > 0) { const k = Math.sin((u.aplasta / 0.3) * Math.PI); R.sy *= 1 - 0.32 * k; R.sx *= 1 + 0.26 * k; R.sz *= 1 + 0.26 * k; }
  if (u.golpe > 0) { const k = u.golpe / 0.22; R.sy *= 1 - 0.14 * k; R.sx *= 1 + 0.12 * k; R.sz *= 1 + 0.12 * k; P.cuerpo.rx -= 0.3 * k; }
  // hablando: mueve la cabeza al ritmo de las sílabas
  if (u.habla > 0) { P.cabeza.rx += Math.sin(t * 26) * 0.08 + u.silaba * 0.12; P.cabeza.y += u.silaba * 0.1; }
  // se va: se encoge y se aplasta antes del «¡puf!»
  if (u.estado === 'muere') { const k = Math.min(1, u.estadoT / 0.22); R.sy *= 1 - 0.85 * k; R.sx *= 1 + 0.5 * k; R.sz *= 1 + 0.5 * k; }
}

/* ---------- sombras redondas ---------- */
export class Sombras {
  constructor(escena, max = 300) {
    const geo = new THREE.CircleGeometry(1, 22); geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x10061a, transparent: true, opacity: 0.3, depthWrite: false });
    this.m = new THREE.InstancedMesh(geo, mat, max); this.max = max;
    this.m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.m.frustumCulled = false; this.m.renderOrder = 1;
    this.m.count = 0; this.n = 0; escena.add(this.m);
  }
  empezar() { this.n = 0; }
  poner(x, z, r) {
    if (this.n >= this.max) return;
    _base.compose(_p.set(x, 0.05, z), _q.identity(), _s.set(r, 1, r * 0.85));
    this.m.setMatrixAt(this.n++, _base);
  }
  terminar() { this.m.count = this.n; this.m.instanceMatrix.needsUpdate = true; }
}

/* ---------- barras de vida ---------- */
export class Barras {
  constructor(escena, max = 160) {
    const geo = new THREE.PlaneGeometry(1, 1);
    const relleno = new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0);
    const mat = o => new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, depthWrite: false, transparent: true, ...o });
    this.fondo = new THREE.InstancedMesh(geo, mat({ color: 0x20102c, opacity: 0.85 }), max);
    this.lleno = new THREE.InstancedMesh(relleno, mat({}), max);
    for (const m of [this.fondo, this.lleno]) { m.frustumCulled = false; m.count = 0; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); escena.add(m); }
    this.fondo.renderOrder = 20; this.lleno.renderOrder = 21;
    for (let i = 0; i < max; i++) this.lleno.setColorAt(i, _c.set(0xffffff));
    this.max = max; this.n = 0; this.derecha = new THREE.Vector3(); this.q = new THREE.Quaternion();
  }
  empezar(camara) { this.n = 0; this.q.copy(camara.quaternion); this.derecha.set(1, 0, 0).applyQuaternion(this.q); this.ojo = camara.position; }
  poner(x, y, z, ancho, fraccion, color) {
    if (this.n >= this.max) return;
    if (Math.hypot(x - this.ojo.x, y - this.ojo.y, z - this.ojo.z) < ancho * 4.5) return;   // pegada a la cámara taparía media pantalla
    const i = this.n++, alto = ancho * 0.16;
    _base.compose(_p.set(x, y, z), this.q, _s.set(ancho + 0.2, alto + 0.2, 1));
    this.fondo.setMatrixAt(i, _base);
    _p.set(x, y, z).addScaledVector(this.derecha, -ancho / 2);
    _base.compose(_p, this.q, _s.set(Math.max(0.001, ancho * fraccion), alto, 1));
    this.lleno.setMatrixAt(i, _base);
    this.lleno.setColorAt(i, _c.set(color));
  }
  terminar() {
    this.fondo.count = this.lleno.count = this.n;
    this.fondo.instanceMatrix.needsUpdate = this.lleno.instanceMatrix.needsUpdate = true;
    this.lleno.instanceColor.needsUpdate = true;
  }
}
