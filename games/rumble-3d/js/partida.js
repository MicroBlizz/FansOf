// Boceto 3D de Fans of Rumble · Una partida de mentira para ver el 3D en movimiento (NO son las reglas del juego):
// las unidades bajan del cielo, saludan, van por su carril, pelean con lo que encuentran, las torres disparan,
// los edificios caen (y se reconstruyen) y Microblizz manda becarios sin parar. En la misión (mision.js) quien manda
// las oleadas y decide el final es la misión: aquí solo se avisa de lo que pasa con evento().
'use strict';
import * as THREE from './three.min.js';
import { MODELOS } from './modelos.js';
import { Especie, nuevaPose, animar, Sombras, Barras } from './munecos.js';
import { CAMPO } from './escena.js';
import { crearEdificios } from './edificios.js';
import { bola, unir, materialToon, materialContorno } from './piezas.js';
import { blanco, probarSalto, saltar, curandera, expulsarVaca, jefe, golpeJefe } from './habilidades.js';
import { SFX, hablar } from './voces.js';
import { tr, FRASES } from './textos.js';

const DATOS = {
  bunny:    { vida: 700, dano: 45, cada: 1.3, vel: 2.7, alcance: 1.5, vista: 9 },
  squirrel: { vida: 120, dano: 16, cada: 0.65, vel: 4.3, alcance: 1.0, vista: 8 },
  becario:  { vida: 150, dano: 14, cada: 1.0, vel: 2.9, alcance: 1.0, vista: 8 },
  meercat:  { vida: 220, dano: 8, cada: 1.0, vel: 2.7, alcance: 1.0, vista: 6, cura: 45, curaCada: 1.1, curaAlcance: 6 },
  mechavaca: { vida: 1100, dano: 42, cada: 1.4, vel: 2.0, alcance: 1.5, vista: 8 },
  vaca:     { vida: 280, dano: 22, cada: 0.9, vel: 3.3, alcance: 1.0, vista: 8 },
  survivalbot: { vida: 3200, dano: 70, cada: 1.7, vel: 1.7, alcance: 2.0, vista: 13 },
};
export const EDIF = { torre: { vida: 1000, dano: 38, cada: 1.0, alcance: 13 }, base: { vida: 1800, dano: 48, cada: 1.25, alcance: 11 } };
const COLOR = { p: 0xff7a1a, e: 0x2e8bff };
const ANCHO_BARRA = { bunny: 2.2, mechavaca: 2.8, survivalbot: 4.5 };
const azar = (a, b) => a + Math.random() * (b - a);
const elige = lista => lista[(Math.random() * lista.length) | 0];
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();

export class Partida {
  constructor(escena, efectos) {
    this.fx = efectos;
    this.especies = {};
    for (const k of Object.keys(MODELOS)) this.especies[k] = new Especie(escena, MODELOS[k], k === 'survivalbot' ? 3 : 90);
    this.sombras = new Sombras(escena); this.barras = new Barras(escena);
    this.edificios = crearEdificios(escena).map(e => ({ ...e, ...EDIF[e.tipo], max: EDIF[e.tipo].vida, cd: azar(0, 1), estado: 'ok', t: 0, golpe: 0 }));
    // los proyectiles de las torres: bellotas (las tuyas) y bolas de energía (las de Microblizz)
    const bellota = unir([bola(0x9a6a33, [0, 0, 0], [0.35, 0.42, 0.35]), bola(0x5b3a1c, [0, 0.3, 0], [0.4, 0.18, 0.4])]);
    this.mallaBellota = this.pool(escena, bellota, materialToon());
    this.mallaOrbe = this.pool(escena, new THREE.IcosahedronGeometry(0.42, 1), new THREE.MeshBasicMaterial({ color: 0x7df3ff }));
    this.unidades = []; this.proyectiles = [];
    this.id = 1; this.t = 0; this.iaT = 1.5; this.autoT = 2.5; this.ultimoToque = -99; this.charla = { p: 0, e: 0 };
    this.fin = null; this.finT = 0; this.alFin = null;
    this.listas = {}; for (const k of Object.keys(MODELOS)) this.listas[k] = [];
    this.modo = 'libre'; this.alEvento = null;
  }
  pool(escena, geo, mat) {
    const m = new THREE.InstancedMesh(geo, mat, 80);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; m.count = 0; escena.add(m);
    if (mat.isMeshToonMaterial) { const b = new THREE.InstancedMesh(geo, materialContorno(0.06), 80); b.instanceMatrix = m.instanceMatrix; b.frustumCulled = false; b.count = 0; escena.add(b); m.userData.borde = b; }
    return m;
  }

  /* ---------- soltar unidades ---------- */
  evento(tipo, datos) { if (this.alEvento) this.alEvento(tipo, datos); }
  soltar(tipo, x, z, lado, alto = 16, siempreHabla = false, op = {}) {
    if (this.unidades.reduce((n, v) => n + (v.tipo === tipo), 0) >= this.especies[tipo].max - 2) return null;
    const def = MODELOS[tipo], d = DATOS[tipo];
    const u = {
      id: this.id++, tipo, def, d, lado, x, z, y: alto, vy: 0, yaw: lado === 'p' ? 0 : 0,
      vida: d.vida, max: d.vida, estado: 'cae', estadoT: 0, mueve: 0, paso: Math.random() * 6, ataque: -1, cd: 0.3,
      golpe: 0, destello: 0, aplasta: 0, habla: 0, silaba: 0, objetivo: null, buscaT: 0, saltoCd: 3, radio: def.radio * 0.8,
      pose: nuevaPose(def), quitado: false, siempreHabla, callado: !!op.callado, congelado: 0, curaCd: 0, congelaCd: 5,
    };
    this.unidades.push(u);
    if (!op.sinAnillo) this.fx.anilloSuelo(x, z, 1.6, lado === 'p' ? 0xffb347 : 0x7da8ff, Math.sqrt((2 * alto) / 60) + 0.1);
    SFX.cae();
    return u;
  }
  // lo que pide el jugador al tocar su lado del campo
  pedir(carta, x, z) {
    this.ultimoToque = this.t;
    if (carta === 'squirrel') { const a = this.soltar('squirrel', x - 0.9, z, 'p', 16, true); this.soltar('squirrel', x + 0.9, z + 0.4, 'p', 17.5); return a; }
    return this.soltar(carta, x, z, 'p', 16, true);
  }
  // +30: lluvia de muñecos para ver si el móvil aguanta
  avalancha() {
    for (let i = 0; i < 15; i++) {
      this.soltar(['bunny', 'squirrel', 'squirrel', 'meercat', 'mechavaca'][i % 5], azar(-22, 22), azar(5, 28), 'p', azar(14, 34));
      this.soltar('becario', azar(-22, 22), azar(-28, -5), 'e', azar(14, 34));
    }
  }

  hablar(u, frase, aunque = false) {
    if (!aunque && (this.t < this.charla[u.lado] || u.callado)) return;
    this.charla[u.lado] = this.t + 2.8;
    const dur = hablar(frase, u.tipo, () => { u.silaba = 1; });
    u.habla = dur;
    const v = new THREE.Vector3();
    this.fx.bocadillo(() => (u.quitado ? null : v.set(u.x, u.y + u.def.alto + 0.7, u.z)), tr(frase), dur, u.lado);
  }

  /* ---------- cada fotograma ---------- */
  actualizar(dt) {
    this.t += dt;
    if (this.modo === 'libre') { this.iaRival(dt); this.iaJugador(dt); }
    for (const u of this.unidades) this.mover(u, dt);
    this.separar();
    for (const e of this.edificios) this.edificio(e, dt);
    this.volar(dt);
    for (let i = this.unidades.length - 1; i >= 0; i--) if (this.unidades[i].quitado) this.unidades.splice(i, 1);
    if (this.fin && this.modo === 'libre') { this.finT -= dt; if (this.finT <= 0) this.reiniciar(); }
  }

  iaRival(dt) {
    this.iaT -= dt;
    if (this.iaT > 0 || this.fin) return;
    this.iaT = azar(3.4, 5.2);
    if (this.unidades.filter(u => u.lado === 'e').length > 40) return;
    const carril = Math.random() < 0.5 ? -1 : 1, n = Math.random() < 0.4 ? 3 : 2;
    for (let i = 0; i < n; i++) this.soltar('becario', carril * 16 + azar(-3, 3), azar(-14, -9), 'e', 16 + i * 2);
  }
  // si no tocas nada en un rato, el boceto juega solo por ti
  iaJugador(dt) {
    if (!this.auto || this.fin || this.t - this.ultimoToque < 7) return;
    this.autoT -= dt;
    if (this.autoT > 0) return;
    this.autoT = azar(4.2, 6);
    if (this.unidades.filter(u => u.lado === 'p').length > 40) return;
    const x = elige([-1, 1]) * azar(10, 18), z = azar(8, 13);
    if (Math.random() < 0.45 && this.unidades.filter(u => u.tipo === 'bunny').length < 3) this.soltar('bunny', x, z, 'p');
    else { this.soltar('squirrel', x - 0.9, z, 'p'); this.soltar('squirrel', x + 0.9, z + 0.4, 'p', 17.5); }
  }

  suelo(x, z) {
    if (Math.abs(z) > CAMPO.rio + 1.6) return 0;
    return CAMPO.puentes.some(b => Math.abs(x - b) < CAMPO.puenteMedio + 0.2) ? 0.26 : 0;
  }

  mover(u, dt) {
    u.estadoT += dt; u.cd -= dt; u.saltoCd -= dt;
    u.golpe = Math.max(0, u.golpe - dt); u.destello = Math.max(0, u.destello - dt * 6); u.aplasta = Math.max(0, u.aplasta - dt);
    u.habla = Math.max(0, u.habla - dt); u.silaba = Math.max(0, u.silaba - dt * 7);
    if (u.estado === 'cae') {
      u.vy -= 60 * dt; u.y += u.vy * dt;
      const piso = this.suelo(u.x, u.z);
      if (u.y <= piso) {
        u.y = piso; u.vy = 0; u.estado = 'pose'; u.estadoT = 0; u.aplasta = 0.3;
        const grande = u.tipo === 'bunny' || u.tipo === 'mechavaca' || u.tipo === 'survivalbot';
        this.fx.polvo(u.x, u.z, grande ? 10 : 5, 0xe6d6b0, grande ? 1.5 : 1);
        this.fx.anilloSuelo(u.x, u.z, grande ? 4.5 : 2.6, 0xffffff, 0.35);
        if (grande) this.fx.temblor(u.tipo === 'survivalbot' ? 0.6 : 0.22);
        SFX.aterriza(grande);
        if (FRASES[u.tipo]?.sale) this.hablar(u, elige(FRASES[u.tipo].sale), u.siempreHabla);
        this.evento('llega', u);
      }
      return;
    }
    if (u.estado === 'pose') {
      u.yaw = girar(u.yaw, 0, dt * 8);   // se vuelve hacia la cámara para saludar
      if (u.estadoT > (u.lado === 'p' ? 1.05 : 0.55) && !u.quieto) { u.estado = 'anda'; u.estadoT = 0; }   // quieto: en las escenas de la misión
      return;
    }
    if (u.estado === 'muere') {
      if (u.estadoT > 0.22) {
        u.quitado = true;
        this.fx.puf(u.x, u.y + 0.6, u.z, COLOR[u.lado]);
        this.evento('cae', u);
        if (u.tipo === 'mechavaca') expulsarVaca(this, u);
        if (u.tipo === 'becario') { this.fx.salpica(u.x, u.y + 1.2, u.z, 0x6b3f22, 7); if (Math.random() < 0.25) this.hablar(u, elige(FRASES.becario.cae)); }
        SFX.puf();
      }
      return;
    }
    if (u.estado === 'fiesta') { u.mueve = Math.max(0, u.mueve - dt * 4); u.yaw = girar(u.yaw, 0, dt * 5); return; }
    if (u.estado === 'salto') { saltar(this, u); return; }
    if (u.congelado > 0) { u.congelado -= dt; u.mueve = 0; return; }
    if (u.tipo === 'survivalbot') jefe(this, u, dt);

    // buscar a quién pegar: primero unidades cerca, si no, la torre de su carril (y si cayó, la sede)
    u.buscaT -= dt;
    if (u.buscaT <= 0 || !vivo(u.objetivo)) { u.objetivo = this.buscar(u); u.buscaT = 0.3; }
    if (u.tipo === 'bunny' && u.saltoCd <= 0 && probarSalto(this, u)) return;
    let o = u.objetivo;
    let tx, tz, alcance;
    const sigue = u.tipo === 'meercat' ? curandera(this, u, dt) : null;
    if (sigue && !(o && o.def && Math.hypot(o.x - u.x, o.z - u.z) < 2.5)) { o = null; tx = sigue[0]; tz = sigue[1]; alcance = 0.6; }
    else if (o) { tx = o.x; tz = o.z; alcance = (o.def ? o.radio : o.r) + u.radio + u.d.alcance; }
    else { tx = u.x; tz = u.z; alcance = 99; }
    const dx = tx - u.x, dz = tz - u.z, dist = Math.hypot(dx, dz);
    if (sigue && !o) {   // la curandera va detrás de los suyos
      if (dist > alcance) this.andar(u, tx, tz, dt); else { u.mueve = Math.max(0, u.mueve - dt * 6); u.yaw = girar(u.yaw, u.lado === 'p' ? Math.PI : 0, dt * 6); }
    } else if (o && dist <= alcance) {
      u.mueve = Math.max(0, u.mueve - dt * 6);
      u.yaw = girar(u.yaw, Math.atan2(dx, dz), dt * 10);
      if (u.ataque < 0 && u.cd <= 0) { u.ataque = 0; u.cd = u.d.cada; }
    } else if (o) this.andar(u, tx, tz, dt);
    else u.mueve = Math.max(0, u.mueve - dt * 5);
    if (u.ataque >= 0) {
      const antes = u.ataque;
      u.ataque += dt / (u.tipo === 'bunny' || u.tipo === 'survivalbot' || u.tipo === 'mechavaca' ? 0.6 : 0.45);
      if (antes < 0.5 && u.ataque >= 0.5) { SFX.zas(); if (o && vivo(o) && dist <= alcance + 0.8) this.impacto(u, o); }
      if (u.ataque >= 1) u.ataque = -1;
    }
    u.y += (this.suelo(u.x, u.z) - u.y) * Math.min(1, dt * 12);
  }

  andar(u, tx, tz, dt) {
    const [wx, wz] = this.paso(u, tx, tz);
    const mx = wx - u.x, mz = wz - u.z, l = Math.hypot(mx, mz) || 1;
    const v = u.d.vel * (u.ataque >= 0 ? 0.3 : 1);
    u.x += (mx / l) * v * dt; u.z += (mz / l) * v * dt;
    u.mueve = Math.min(1, u.mueve + dt * 5);
    u.yaw = girar(u.yaw, Math.atan2(mx, mz), dt * 9);
    const antes = Math.floor(u.paso / Math.PI);
    u.paso += dt * v * 2.4;
    if (Math.floor(u.paso / Math.PI) !== antes && Math.random() < 0.6) this.fx.polvo(u.x, u.z, 1, 0xdcc9a0, u.tipo === 'survivalbot' || u.tipo === 'mechavaca' ? 1.2 : 0.6);
  }

  // por dónde ir: si el objetivo está al otro lado del río, primero al puente
  paso(u, tx, tz) {
    const R = CAMPO.rio + 0.4;
    const ladoU = u.z > R ? 1 : u.z < -R ? -1 : 0, ladoT = tz > R ? 1 : tz < -R ? -1 : 0;
    if (ladoU === ladoT || (ladoU === 0 && ladoT === 0)) return [tx, tz];
    const b = CAMPO.puentes.reduce((m, p) => (Math.abs(u.x - p) + Math.abs(tx - p) < Math.abs(u.x - m) + Math.abs(tx - m) ? p : m));
    if (ladoU === 0) return [b, (ladoT || -Math.sign(u.z)) * (R + 1.5)];
    if (Math.abs(u.x - b) > 1.0) return [b, ladoU * (R + 1.2)];
    return [b, -ladoU * (R + 1.5)];
  }

  alcanzable(u, v) {
    const R = CAMPO.rio + 0.4, l = z => (z > R ? 1 : z < -R ? -1 : 0);
    const a = l(u.z), b = l(v.z);
    if (a === b || a === 0 || b === 0) return true;
    return CAMPO.puentes.some(p => Math.abs(u.x - p) < 4 && Math.abs(v.x - p) < 4) && Math.abs(u.z - v.z) < 9;
  }

  buscar(u) {
    let mejor = null, md = u.d.vista;
    for (const v of this.unidades) {
      if (v.lado === u.lado || !blanco(v) || !this.alcanzable(u, v)) continue;
      const d = Math.hypot(v.x - u.x, v.z - u.z);
      if (d < md) { md = d; mejor = v; }
    }
    if (mejor) return mejor;
    const rival = u.lado === 'p' ? 'e' : 'p', carril = u.x < 0 ? -1 : 1;
    return this.edificios.find(e => e.lado === rival && e.tipo === 'torre' && e.carril === carril && e.estado === 'ok')
      || this.edificios.find(e => e.lado === rival && e.tipo === 'base' && e.estado === 'ok') || null;
  }

  impacto(u, o) {
    const fuerte = u.tipo === 'bunny' || u.tipo === 'mechavaca' || u.tipo === 'survivalbot';
    const hx = (u.x + o.x) / 2, hz = (u.z + o.z) / 2, hy = o.def ? o.y + o.def.alto * 0.45 : 2.5;
    this.fx.chispas(hx, hy, hz, fuerte ? 7 : 4, fuerte ? 0xffcb3d : 0xffffff);
    if (u.tipo === 'becario') this.fx.salpica(hx, hy, hz, 0x6b3f22, 4);   // le tira el café
    SFX.golpe(fuerte);
    if (fuerte) this.fx.temblor(0.06);
    if (u.tipo === 'survivalbot') golpeJefe(this, u, o);
    if (o.def) this.herir(o, u.d.dano, u); else this.danarEdificio(o, u.d.dano);
  }

  herir(v, dano, de) {
    if (v.estado === 'muere' || v.quitado) return;
    v.vida -= dano; v.golpe = 0.22; v.destello = 1;
    if (de) { const dx = v.x - de.x, dz = v.z - de.z, l = Math.hypot(dx, dz) || 1; v.x += (dx / l) * 0.25; v.z += (dz / l) * 0.25; }
    this.fx.numero(v.x, v.y + v.def.alto * 0.9, v.z, Math.round(dano), dano >= 40);
    if (v.vida <= 0) { v.estado = 'muere'; v.estadoT = 0; v.ataque = -1; v.congelado = 0; }
  }

  separar() {
    const L = this.unidades, n = L.length;
    for (let i = 0; i < n; i++) {
      const a = L[i]; if (a.estado === 'cae' || a.estado === 'salto') continue;
      for (let j = i + 1; j < n; j++) {
        const b = L[j]; if (b.estado === 'cae' || b.estado === 'salto') continue;
        const dx = b.x - a.x, dz = b.z - a.z, min = a.radio + b.radio, d2 = dx * dx + dz * dz;
        if (d2 >= min * min || d2 < 1e-6) continue;
        const d = Math.sqrt(d2), emp = (min - d) * 0.5, ux = dx / d, uz = dz / d;
        a.x -= ux * emp; a.z -= uz * emp; b.x += ux * emp; b.z += uz * emp;
      }
      // que no se metan en el agua ni dentro de los edificios, ni se salgan del campo
      if (Math.abs(a.z) < CAMPO.rio + 0.3) {
        const b = CAMPO.puentes.find(p => Math.abs(a.x - p) < CAMPO.puenteMedio + 0.6);
        if (b === undefined) a.z = (a.z >= 0 ? 1 : -1) * (CAMPO.rio + 0.3);
        else a.x = Math.max(b - CAMPO.puenteMedio + 0.6, Math.min(b + CAMPO.puenteMedio - 0.6, a.x));
      }
      for (const e of this.edificios) {
        if (e.estado === 'roto') continue;
        const dx = a.x - e.x, dz = a.z - e.z, min = e.r + a.radio * 0.6, d = Math.hypot(dx, dz);
        if (d < min && d > 1e-4) { a.x = e.x + (dx / d) * min; a.z = e.z + (dz / d) * min; }
      }
      a.x = Math.max(CAMPO.x0 + 0.5, Math.min(CAMPO.x1 - 0.5, a.x)); a.z = Math.max(CAMPO.z0, Math.min(CAMPO.z1, a.z));
    }
  }

  /* ---------- edificios ---------- */
  edificio(e, dt) {
    e.t += dt; e.golpe = Math.max(0, e.golpe - dt);
    const g = e.entero;
    if (e.estado === 'ok') {
      const k = e.golpe / 0.15;
      g.scale.set(1 + k * 0.04, 1 - k * 0.05, 1 + k * 0.04);
      e.cd -= dt;
      if (e.cd <= 0 && !this.fin) {
        let mejor = null, md = e.alcance;
        for (const v of this.unidades) {
          if (v.lado === e.lado || !blanco(v)) continue;
          const d = Math.hypot(v.x - e.x, v.z - e.z);
          if (d < md) { md = d; mejor = v; }
        }
        if (mejor) { e.cd = e.cada; this.disparar(e, mejor); } else e.cd = 0.2;
      }
    } else if (e.estado === 'cae') {
      const k = Math.min(1, e.t / 0.6);
      g.position.y = -k * k * 4; g.scale.set(1 + k * 0.2, 1 - k * 0.55, 1 + k * 0.2); g.rotation.z = k * 0.25;
      if (k >= 1) { e.estado = 'roto'; e.t = 0; g.visible = false; e.roto.visible = true; }
    } else if (e.estado === 'roto') {
      if (e.t > 12 && !this.fin && this.modo === 'libre') { e.estado = 'sube'; e.t = 0; g.visible = true; e.roto.visible = false; e.vida = e.max; this.fx.polvo(e.x, e.z, 12, 0xe6d6b0, 1.6); }
    } else if (e.estado === 'sube') {
      const k = Math.min(1, e.t / 0.8), rebote = 1 + Math.sin(k * Math.PI) * 0.12;
      g.position.y = -(1 - k) * 6; g.scale.set(1, rebote, 1); g.rotation.z = 0;
      if (k >= 1) { e.estado = 'ok'; g.position.y = 0; g.scale.set(1, 1, 1); }
    }
  }
  danarEdificio(e, dano) {
    if (e.estado !== 'ok') return;
    e.vida -= dano; e.golpe = 0.15;
    this.fx.numero(e.x + azar(-1, 1), e.alto * 0.6, e.z, Math.round(dano), false);
    if (e.vida > 0) return;
    e.estado = 'cae'; e.t = 0;
    this.fx.explosion(e.x, 2, e.z, true); this.fx.trozos(e.x, 3, e.z, e.colores, 18);
    this.fx.temblor(e.tipo === 'base' ? 1 : 0.7); SFX.explosion(true);
    const frase = e.lado === 'e' ? 'Microblizz: «esa torre nos sobraba»' : '¡Nuestra torre!';
    if (e.tipo === 'torre') { const dur = hablar(frase, e.lado === 'e' ? 'becario' : 'bunny'); const v = new THREE.Vector3(e.x, e.alto * 0.7, e.z); this.fx.bocadillo(() => v, tr(frase), dur, e.lado); }
    this.evento('edificio', e);
    if (e.tipo === 'base') {
      this.fin = e.lado === 'e' ? 'p' : 'e'; this.finT = 4.5;
      for (const u of this.unidades) if (u.lado === this.fin && blanco(u)) { u.estado = 'fiesta'; u.ataque = -1; }
      this.fx.confeti(e.x, 6, e.z);
      if (this.alFin) this.alFin(this.fin);
    }
  }
  disparar(e, v) {
    const oy = e.alto - (e.tipo === 'base' ? 3 : 2.2), d = Math.hypot(v.x - e.x, v.z - e.z);
    this.proyectiles.push({ enemigo: e.lado === 'e', ox: e.x, oy, oz: e.z, x: e.x, y: oy, z: e.z, v, t: 0, dura: d / 20 + 0.3, dano: e.dano });
    SFX.disparo(e.lado === 'e');
  }
  volar(dt) {
    for (let i = this.proyectiles.length - 1; i >= 0; i--) {
      const p = this.proyectiles[i], v = p.v;
      p.t += dt; const k = Math.min(1, p.t / p.dura);
      const tx = v.x, ty = v.y + v.def.alto * 0.5, tz = v.z;
      p.x = p.ox + (tx - p.ox) * k; p.z = p.oz + (tz - p.oz) * k; p.y = p.oy + (ty - p.oy) * k + Math.sin(k * Math.PI) * 3;
      if (Math.random() < 0.5) this.fx.nube.nueva({ x: p.x, y: p.y, z: p.z, vida: 0.3, t0: 0.22, c0: p.enemigo ? 0x9fe9ff : 0xe6d6b0 });
      if (k < 1) continue;
      this.proyectiles.splice(i, 1);
      if (!blanco(v)) continue;
      this.fx.chispas(p.x, p.y, p.z, 5, p.enemigo ? 0x7df3ff : 0xffcb3d);
      SFX.golpe(false);
      this.herir(v, p.dano, null);
    }
  }

  reiniciar() {
    for (const u of this.unidades) u.quitado = true;
    this.unidades.length = 0; this.proyectiles.length = 0;
    for (const e of this.edificios) { e.vida = e.max; e.estado = 'ok'; e.t = 0; e.entero.visible = true; e.roto.visible = false; e.entero.position.y = 0; e.entero.scale.set(1, 1, 1); e.entero.rotation.z = 0; }
    this.fin = null; this.iaT = 1.5; this.autoT = 1; this.t = 0; this.ultimoToque = -99;
    if (this.alFin) this.alFin(null);
  }

  /* ---------- pintar ---------- */
  pintar(camara) {
    for (const k in this.listas) this.listas[k].length = 0;
    this.sombras.empezar(); this.barras.empezar(camara);
    for (const u of this.unidades) {
      animar(u, this.t);
      this.listas[u.tipo].push(u);
      const r = u.def.radio * 0.95 / (1 + u.y * 0.07);
      this.sombras.poner(u.x, u.z, r);
      if (u.vida < u.max && u.estado !== 'muere') this.barras.poner(u.x, u.y + u.def.alto + 0.35, u.z, ANCHO_BARRA[u.tipo] || 1.5, Math.max(0, u.vida / u.max), COLOR[u.lado]);
    }
    for (const k in this.especies) this.especies[k].pintar(this.listas[k]);
    if (!this.sinBarras) for (const e of this.edificios) if (e.estado === 'ok') this.barras.poner(e.x, e.alto + 0.6, e.z, e.tipo === 'base' ? 6 : 4.2, Math.max(0, e.vida / e.max), COLOR[e.lado]);
    let nb = 0, no = 0;
    for (const p of this.proyectiles) {
      const malla = p.enemigo ? this.mallaOrbe : this.mallaBellota;
      _m.compose(_p.set(p.x, p.y, p.z), _q.setFromAxisAngle(_s.set(1, 0, 0), p.t * 14), _s.set(1, 1, 1));
      malla.setMatrixAt(p.enemigo ? no++ : nb++, _m);
      this.sombras.poner(p.x, p.z, 0.35);
    }
    for (const [m, n] of [[this.mallaBellota, nb], [this.mallaOrbe, no]]) { m.count = n; m.instanceMatrix.needsUpdate = true; if (m.userData.borde) m.userData.borde.count = n; }
    this.sombras.terminar(); this.barras.terminar();
  }
  cuantos() { return this.unidades.length; }
  protagonista() {
    let m = null;
    for (const u of this.unidades) if (u.lado === 'p' && !u.quitado && u.estado !== 'muere' && (!m || u.id > m.id)) m = u;
    return m;
  }
}

function vivo(o) { return o && (o.def ? !o.quitado && o.estado !== 'muere' : o.estado === 'ok'); }
function girar(a, b, k) {
  let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + d * Math.min(1, k);
}
