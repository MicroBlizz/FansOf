// Boceto 3D de Fans of Rumble · Los efectos: polvo al andar, nubes al desaparecer, chispas de los golpes, explosiones,
// anillos en el suelo, trozos de torre volando, los números de daño, los bocadillos de las voces y el temblor de cámara.
// Cada tipo de partícula se pinta de una vez (como los muñecos), aunque haya cientos.
'use strict';
import * as THREE from './three.min.js';
import { gradienteToon } from './piezas.js';

const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _s = new THREE.Vector3();
const _z = new THREE.Vector3(0, 0, 1), _c = new THREE.Color(), _v = new THREE.Vector3(), _q3 = new THREE.Quaternion(), _eje = new THREE.Vector3(0.3, 1, 0.2).normalize();
const azar = (a, b) => a + Math.random() * (b - a);
// un hueco libre de la lista o, si están todos ocupados, el que antes se iba a acabar
const libre = lista => lista.find(o => o.t >= o.vida) || lista.reduce((a, b) => (b.vida - b.t < a.vida - a.t ? b : a));

function estrella() {
  const f = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r = i % 2 ? 0.42 : 1; i ? f.lineTo(Math.sin(a) * r, Math.cos(a) * r) : f.moveTo(0, r); }
  return new THREE.ShapeGeometry(f);
}

class Pool {
  constructor(escena, geo, mat, max, orden = 2) {
    this.malla = new THREE.InstancedMesh(geo, mat, max);
    this.malla.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.malla.frustumCulled = false; this.malla.renderOrder = orden;
    for (let i = 0; i < max; i++) this.malla.setColorAt(i, _c.set(0xffffff));
    this.malla.count = 0; escena.add(this.malla);
    this.max = max; this.vivas = [];
  }
  nueva(o) {
    if (this.vivas.length >= this.max) this.vivas.shift();
    const p = Object.assign({ vx: 0, vy: 0, vz: 0, g: 0, roce: 0, t: 0, vida: 1, t0: 1, t1: 0, crece: 0.15, giro: Math.random() * 6, vgiro: 0, rebota: false, c1: null }, o);
    p.c0 = new THREE.Color(o.c0 ?? 0xffffff); if (o.c1 != null) p.c1 = new THREE.Color(o.c1);
    this.vivas.push(p); return p;
  }
}

export class Efectos {
  constructor(escena, camara, capa) {
    this.camara = camara; this.capa = capa; this.ancho = 1; this.alto = 1; this.trauma = 0; this.tiempo = 0;
    const toon = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: gradienteToon() });
    const plano = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.nube = new Pool(escena, new THREE.IcosahedronGeometry(1, 1), toon, 420);
    this.fuego = new Pool(escena, new THREE.IcosahedronGeometry(1, 1), plano, 220, 3);
    this.chispa = new Pool(escena, estrella(), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, depthTest: false, transparent: true }), 160, 15);
    const aro = new THREE.RingGeometry(0.86, 1, 40); aro.rotateX(-Math.PI / 2);
    this.anillo = new Pool(escena, aro, new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }), 40, 1);
    this.trozo = new Pool(escena, new THREE.BoxGeometry(1, 1, 1), toon, 160);
    this.pools = [this.nube, this.fuego, this.chispa, this.anillo, this.trozo];
    // números de daño y bocadillos: son texto normal de la página, encima del 3D
    this.numeros = Array.from({ length: 30 }, () => { const el = document.createElement('div'); el.className = 'num'; el.hidden = true; capa.appendChild(el); return { el, t: 0, vida: 0 }; });
    this.bocadillos = Array.from({ length: 4 }, () => { const el = document.createElement('div'); el.className = 'bocadillo'; el.hidden = true; capa.appendChild(el); return { el, t: 0, vida: 0, seguir: null, ultimo: new THREE.Vector3() }; });
  }

  tam(ancho, alto) { this.ancho = ancho; this.alto = alto; }

  /* ---------- lo que piden la partida y los muñecos ---------- */
  polvo(x, z, n = 3, color = 0xdcc9a0, fuerza = 1) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = azar(0.6, 2.2) * fuerza;
      this.nube.nueva({ x: x + Math.cos(a) * 0.4, y: 0.25, z: z + Math.sin(a) * 0.4, vx: Math.cos(a) * v, vy: azar(0.6, 1.6) * fuerza, vz: Math.sin(a) * v, roce: 3, vida: azar(0.4, 0.7), t0: azar(0.28, 0.5) * fuerza, c0: color });
    }
  }
  puf(x, y, z, color = 0xffffff, n = 10) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, e = azar(-0.3, 1), v = azar(2, 4.5);
      this.nube.nueva({ x, y: y + azar(0, 1), z, vx: Math.cos(a) * v, vy: e * v * 0.6 + 1, vz: Math.sin(a) * v, roce: 4, vida: azar(0.45, 0.8), t0: azar(0.5, 0.85), c0: 0xffffff });
    }
    this.chispas(x, y + 1, z, 6, color);
  }
  chispas(x, y, z, n = 5, color = 0xffe066) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = azar(4, 9);
      this.chispa.nueva({ x, y, z, vx: Math.cos(a) * v, vy: azar(2, 8), vz: Math.sin(a) * v, g: -22, roce: 2, vida: azar(0.25, 0.45), t0: azar(0.35, 0.6), crece: 0.05, vgiro: azar(-12, 12), c0: color, c1: 0xffffff });
    }
  }
  salpica(x, y, z, color, n = 8) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = azar(2, 5);
      this.fuego.nueva({ x, y, z, vx: Math.cos(a) * v, vy: azar(3, 7), vz: Math.sin(a) * v, g: -26, vida: azar(0.35, 0.6), t0: azar(0.14, 0.26), t1: 0.05, crece: 0.02, c0: color });
    }
  }
  anilloSuelo(x, z, radio = 3, color = 0xffffff, vida = 0.45) {
    this.anillo.nueva({ x, y: 0.12, z, vida, t0: radio * 0.15, t1: radio, crece: 1, c0: color, c1: 0x000000 });
  }
  explosion(x, y, z, grande = false) {
    const k = grande ? 1.9 : 1;
    for (let i = 0; i < 16 * k; i++) {
      const a = Math.random() * Math.PI * 2, e = Math.random(), v = azar(2, 7) * k;
      this.fuego.nueva({ x, y: y + azar(0, 1.5) * k, z, vx: Math.cos(a) * v * (1 - e * 0.5), vy: e * v + 2, vz: Math.sin(a) * v * (1 - e * 0.5), roce: 3.5, vida: azar(0.35, 0.7), t0: azar(0.9, 1.6) * k, crece: 0.12, c0: 0xffe14d, c1: 0xff4a1a });
    }
    for (let i = 0; i < 12 * k; i++) {
      const a = Math.random() * Math.PI * 2, v = azar(1, 4) * k;
      this.nube.nueva({ x, y: y + azar(0.5, 2) * k, z, vx: Math.cos(a) * v, vy: azar(1.5, 4), vz: Math.sin(a) * v, roce: 2, vida: azar(0.8, 1.4), t0: azar(0.9, 1.5) * k, crece: 0.25, c0: 0x6d6478, c1: 0x3a3346 });
    }
    this.chispas(x, y + 1, z, 10 * k, 0xffcb3d);
    this.anilloSuelo(x, z, 6 * k, 0xffb347, 0.5);
  }
  trozos(x, y, z, colores, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = azar(3, 8);
      this.trozo.nueva({ x, y: y + azar(0, 3), z, vx: Math.cos(a) * v, vy: azar(5, 12), vz: Math.sin(a) * v, g: -30, vida: azar(1.2, 1.8), t0: azar(0.35, 0.8), t1: 0.35, crece: 0.02, vgiro: azar(-10, 10), rebota: true, c0: colores[i % colores.length] });
    }
  }
  confeti(x, y, z) {
    const colores = [0xff7a1a, 0xffcb3d, 0x5cc23a, 0x2e8bff, 0xd43cff, 0xff4b5c];
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2, v = azar(2, 7);
      this.trozo.nueva({ x, y, z, vx: Math.cos(a) * v, vy: azar(8, 15), vz: Math.sin(a) * v, g: -14, roce: 1.2, vida: azar(1.6, 2.4), t0: 0.28, t1: 0.2, vgiro: azar(-14, 14), c0: colores[i % colores.length], plano: true });
    }
  }
  temblor(f) { this.trauma = Math.min(1, this.trauma + f); }
  sacudida(destino) {
    const k = this.trauma * this.trauma, t = this.tiempo * 38;
    return destino.set(Math.sin(t * 1.3) * k * 1.2, Math.sin(t * 1.7 + 1) * k * 0.9, Math.sin(t * 1.1 + 2) * k * 1.2);
  }
  numero(x, y, z, valor, fuerte = false) {
    const n = libre(this.numeros);
    n.x = x + azar(-0.9, 0.9); n.y = y + azar(-0.3, 0.5); n.z = z + azar(-0.5, 0.5); n.t = 0; n.vida = fuerte ? 1.0 : 0.75;
    n.el.textContent = valor; n.el.className = fuerte ? 'num fuerte' : 'num'; n.el.hidden = false;
  }
  // un bocadillo que sigue a quien habla (seguir() devuelve dónde está su cabeza, o null si ya no está)
  bocadillo(seguir, texto, vida, lado = 'p') {
    const b = libre(this.bocadillos);
    b.seguir = seguir; b.t = 0; b.vida = vida; b.el.textContent = texto;
    b.el.className = 'bocadillo ' + (lado === 'e' ? 'rival' : 'mio'); b.el.hidden = false;
    b.medio = b.el.offsetWidth / 2; b.alto = b.el.offsetHeight;   // para que no se salga de la pantalla ni pise a otro
    return b;
  }

  /* ---------- cada fotograma ---------- */
  actualizar(dt) {
    this.tiempo += dt; this.trauma = Math.max(0, this.trauma - dt * 1.6);
    _q.copy(this.camara.quaternion);
    for (const pool of this.pools) {
      const lista = pool.vivas; let n = 0;
      for (let i = lista.length - 1; i >= 0; i--) { const p = lista[i]; p.t += dt; if (p.t >= p.vida) lista.splice(i, 1); }
      for (const p of lista) {
        const fr = Math.exp(-p.roce * dt);
        p.vx *= fr; p.vy = p.vy * fr + p.g * dt; p.vz *= fr;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        if (p.rebota && p.y < 0.15) { p.y = 0.15; p.vy *= -0.35; p.vx *= 0.6; p.vz *= 0.6; p.vgiro *= 0.6; }
        p.giro += p.vgiro * dt;
        const k = p.t / p.vida;
        const tam = k < p.crece ? p.t0 * (0.35 + 0.65 * (k / p.crece)) : p.t0 + (p.t1 - p.t0) * ((k - p.crece) / (1 - p.crece));
        if (pool === this.anillo) _q2.identity();
        else if (pool === this.chispa) _q2.copy(_q).multiply(_q3.setFromAxisAngle(_z, p.giro));
        else _q2.setFromAxisAngle(_eje, p.giro);
        const sy = p.plano ? 0.06 : 1;
        _m.compose(_p.set(p.x, p.y, p.z), _q2, _s.set(Math.max(0.001, tam), Math.max(0.001, tam * sy), Math.max(0.001, tam)));
        pool.malla.setMatrixAt(n, _m);
        if (p.c1) pool.malla.setColorAt(n, _c.copy(p.c0).lerp(p.c1, k)); else pool.malla.setColorAt(n, p.c0);
        n++;
      }
      pool.malla.count = n;
      pool.malla.instanceMatrix.needsUpdate = true;
      pool.malla.instanceColor.needsUpdate = true;
    }
    // números y bocadillos: se colocan sobre la pantalla donde está su punto del mundo
    for (const n of this.numeros) {
      if (n.t >= n.vida) { if (!n.el.hidden) n.el.hidden = true; continue; }
      n.t += dt; const k = n.t / n.vida;
      const pos = this.aPantalla(_v.set(n.x, n.y + k * 1.6, n.z));
      if (!pos) { n.el.hidden = true; continue; }
      const esc = k < 0.15 ? 0.6 + (k / 0.15) * 0.7 : 1.3 - Math.min(0.3, (k - 0.15));
      n.el.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) scale(${esc.toFixed(2)})`;
      n.el.style.opacity = k > 0.7 ? ((1 - k) / 0.3).toFixed(2) : '1';
    }
    const puestos = [];
    for (const b of this.bocadillos) {
      if (b.t >= b.vida) { if (!b.el.hidden) b.el.hidden = true; continue; }
      b.t += dt;
      const donde = b.seguir && b.seguir();
      if (donde) b.ultimo.copy(donde); else b.vida = Math.min(b.vida, b.t + 0.25);
      const pos = this.aPantalla(_v.copy(b.ultimo));
      if (!pos || pos.x < -30 || pos.x > this.ancho + 30) { b.el.hidden = true; continue; }   // quien habla está fuera de la pantalla
      if (b.el.hidden) b.el.hidden = false;
      const k = b.t / b.vida, entra = Math.min(1, b.t / 0.12);
      const x = Math.max(b.medio + 6, Math.min(this.ancho - b.medio - 6, pos.x));
      for (let i = 0; i < puestos.length; i++) {   // si pisa a otro bocadillo, sube por encima
        const o = puestos[i];
        if (Math.abs(x - o.x) < b.medio + o.medio + 4 && pos.y > o.y - o.alto - 2 && pos.y - b.alto < o.y + 2) { pos.y = o.y - o.alto - 6; i = -1; }
      }
      puestos.push({ x, y: pos.y, medio: b.medio, alto: b.alto });
      b.el.style.setProperty('--cola', `${Math.max(-b.medio + 14, Math.min(b.medio - 14, pos.x - x)).toFixed(0)}px`);
      b.el.style.transform = `translate(${x}px, ${pos.y}px) translate(-50%, -100%) scale(${(0.7 + 0.3 * entra).toFixed(2)})`;
      b.el.style.opacity = k > 0.85 ? ((1 - k) / 0.15).toFixed(2) : '1';
    }
  }
  aPantalla(v) {
    v.project(this.camara);
    if (v.z > 1) return null;
    return { x: (v.x + 1) / 2 * this.ancho, y: (1 - v.y) / 2 * this.alto };
  }
}
