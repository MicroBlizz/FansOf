// Fans of Island · LOS BICHOS y los choques: Brotitos que brincan hacia ti, peces que se asoman y escupen agua, gaviotas que tiran
// cocos (su sombra avisa), cangrejos que andan de lado, las salpicaduras, y quién pisa a quién (choques).
'use strict';
const AGUA = ['#ffffff', '#bfeaff', '#7cc6ee'], ASTILLAS = ['#6b4428', '#b77c45', '#fff6e0'];
function salpica(x, y, z, n, cols) {
  for (let i = 0; i < n; i++) parts.push({ x, y, z, vx: (Math.random() - 0.5) * 120, vz: 90 + Math.random() * 140, t: 0.35 + Math.random() * 0.3, c: cols[i % cols.length] });
}
// ---- Brotitos ----
function brinca(e) {
  const dx = J.x - e.x;
  let lado = Math.abs(dx) < 150 ? (Math.sign(dx) || 1) : (Math.random() < 0.5 ? -1 : 1);
  for (let i = 0; i < 2; i++) {
    if (sueloDe({ x: e.x + lado * 30, z: e.z }, R_E) === e.z) { e.vx = lado * 75; e.vz = 270; e.mira = lado; e.estado = 'aire'; e.t = 0; return; }
    lado = -lado;
  }
  e.estado = 'quieto'; e.t = 0.3;
}
const SIGUE_BROTO = { aterriza: [0.14, 'quieto'], quieto: [0.9, 'agachado'] };
function pasoEnemigo(e, dt) {
  if (e.muerto) { e.muerto += dt; return; }
  e.t += dt;
  const r = cae(e, dt, 1, R_E);
  if (r === 'aire' && mueveX(e, e.vx * dt, R_E)) e.vx = 0;
  if (r === 'aterriza') { e.estado = 'aterriza'; e.t = 0; e.vx = 0; }
  giraHacia(e, dt);
  if (e.z < MAR - 50) { e.muerto = 0.01; return; }
  if (r !== 'suelo') return;
  const sigue = SIGUE_BROTO[e.estado];
  if (sigue && e.t > sigue[0]) { e.estado = sigue[1]; e.t = 0; }
  else if (e.estado === 'agachado' && e.t > 0.16) brinca(e);
}
function poseEnemigo(e) {
  if (e.muerto) return 'aterriza';
  if (e.estado === 'agachado' || e.estado === 'aterriza') return e.estado;
  if (e.vz > 64) return 'despegue';
  if (e.vz > -64 && e.vz !== 0) return 'arriba';
  if (e.vz < 0) return 'cayendo';
  return 'reposo';
}
// ---- peces y gotas ----
function escupe(f) {
  const sx = f.x + f.mira * 15, sz = f.z + 13, t = 0.8, g = 760;
  const vx = Math.max(-230, Math.min(230, (J.x + J.vx * 0.3 - sx) / t));
  const vz = (J.z + 28 - sz + 0.5 * g * t * t) / t;
  gotas.push({ x: sx, y: f.y, z: sz, vx, vz, g }); play('blip');
  salpica(sx, f.y, sz, 3, AGUA);
}
const PEZ_PASO = {
  oculto(f, dx) { f.z = Z_OCULTO; if (f.t <= 0 && Math.abs(dx) < 240) { f.estado = 'sube'; salpica(f.x, f.y, MAR, 6, AGUA); } },
  sube(f, dx, dt) { f.z += 130 * dt; if (f.z >= Z_ASOMA) { f.z = Z_ASOMA; f.estado = 'asoma'; f.t = 0.6; } },
  asoma(f) { f.z = Z_ASOMA + Math.sin(reloj * 6) * 1.5; if (f.t <= 0) { escupe(f); f.estado = 'escupe'; f.t = 0.55; } },
  escupe(f) { if (f.t <= 0) f.estado = 'baja'; },
  baja(f, dx, dt) {                       // también tras un pisotón (golpe), más deprisa
    f.z -= (f.estado === 'golpe' ? 170 : 90) * dt;
    if (f.z <= Z_OCULTO) { f.estado = 'oculto'; f.t = 1.4 + Math.random() * 1.3; salpica(f.x, f.y, MAR, 4, AGUA); }
  },
};
PEZ_PASO.golpe = PEZ_PASO.baja;
function pasoPez(f, dt) {
  f.t -= dt;
  const dx = J.x - f.x;
  if (f.estado !== 'golpe') { f.mira = Math.sign(dx) || f.mira; giraHacia(f, dt); }
  PEZ_PASO[f.estado](f, dx, dt);
}
function posePez(f) {
  if (f.estado === 'golpe') return 'golpe';
  if ((f.estado === 'asoma' && f.t < 0.3) || (f.estado === 'escupe' && f.t > 0.35)) return 'abierta';
  return 'cerrada';
}
function gotaViva(g, dt) {
  g.vz -= g.g * dt; g.x += g.vx * dt; g.z += g.vz * dt;
  if (Math.abs(J.x - g.x) < 12 && g.z - J.z > -4 && g.z - J.z < C_H * 0.75) {
    if (daño()) { J.vx = Math.sign(g.vx || 1) * 150; J.vz = Math.max(J.vz, 170); J.empuje = 0.2; J.cortado = true; }
    salpica(g.x, g.y, g.z, 8, AGUA); return false;
  }
  if (g.vz < 0 && (g.z < MAR || g.z <= sueloDe(g, 3))) { salpica(g.x, g.y, Math.max(g.z, MAR), 6, AGUA); return false; }
  return true;
}
const pasoGotas = dt => { gotas = gotas.filter(g => gotaViva(g, dt)); };
// ---- gaviotas y cocos ----
function nuevaGaviota() {
  const lado = J.mira || 1;
  gaviotas.push({ x: J.x + lado * (VW * 0.6 + 40), z: Math.max(J.z, 0) + 100, vx: -lado * 82, mira: -lado, giro: -lado > 0 ? -Math.PI / 2 + 0.85 : Math.PI / 2 - 0.85, t: 0, coco: true });
  tGav = 5 + Math.random() * 3;
}
function gaviotaViva(g, dt) {
  g.x += g.vx * dt; g.t += dt;
  if (g.coco && Math.abs(g.x - (J.x + J.vx * 0.45)) < 10) { cocos.push({ x: g.x, y: CARRIL, z: g.z - 7, vx: g.vx * 0.4, vz: 0, bote: 0, giro: 0 }); g.coco = false; }
  return Math.abs(g.x - J.x) < VW + 160;
}
function cocoVivo(c, dt) {
  c.vz -= G * 0.8 * dt; c.x += c.vx * dt; c.z += c.vz * dt; c.giro += c.vx * dt * 0.08;
  if (c.z < MAR) { salpica(c.x, c.y, MAR, 8, AGUA); return false; }
  if (c.vz < 0 && c.bote === 0 && Math.abs(J.x - c.x) < 14 && c.z - J.z > 0 && c.z - J.z < C_H * 0.9) { daño(); salpica(c.x, c.y, c.z, 8, ASTILLAS); return false; }
  const s = sueloDe(c, 6);
  if (c.vz >= 0 || c.z > s) return true;
  if (c.bote === 0) { c.z = s; c.vz = 150; c.vx *= 0.6; c.bote = 1; return true; }
  salpica(c.x, c.y, s, 9, ASTILLAS); play('clank'); return false;
}
function pasoGaviotas(dt) {
  tGav -= dt;
  if (tGav <= 0 && gaviotas.length < 2 && J.x > 9 * T && J.x < 69 * T) nuevaGaviota();
  gaviotas = gaviotas.filter(g => gaviotaViva(g, dt));
  cocos = cocos.filter(c => cocoVivo(c, dt));
}
const pasoParts = dt => { parts = parts.filter(p => { p.vz -= 700 * dt; p.x += p.vx * dt; p.z += p.vz * dt; p.t -= dt; return p.t > 0; }); };
function pasoCangrejo(k, dt) {
  if (k.muerto) { k.muerto += dt; return; }
  k.t += dt; k.x += k.dir * 38 * dt;
  if (Math.abs(sueloDe({ x: k.x + k.dir * 16, z: k.z }, 2) - k.z) > 1) k.dir = -k.dir;
}
// ---- choques ----
const PEZ_FUERA = { sube: 1, asoma: 1, escupe: 1 };
function pisaPeces() {
  if (J.vz >= 0) return;
  for (const f of peces) {
    if (f.y !== CARRIL || !PEZ_FUERA[f.estado]) continue;
    const arriba = f.z + 26;
    if (Math.abs(J.x - f.x) < 20 && J.z <= arriba + 6 && J.z >= arriba - 14) {
      f.estado = 'golpe'; play('pop'); J.z = arriba; J.vz = ent.salto ? 500 : 400; J.flota = 0; J.cortado = !ent.salto;
      salpica(f.x, f.y, arriba, 8, AGUA);
    }
  }
}
function chocaCangrejos() {
  for (const k of cangrejos) {
    if (k.muerto) continue;
    const dx = J.x - k.x, dz = J.z - k.z;
    if (Math.abs(dx) < 21 && J.vz < 0 && dz > 8 && dz < 30) { k.muerto = 0.01; rebota(); salpica(k.x, CARRIL, k.z + 8, 10, ['#ff5a4a', '#ff8a6a', '#ffffff']); continue; }
    if (Math.abs(dx) < 19 && dz > -14 && dz <= 8 && J.inv <= 0) golpeado(dx);
  }
}
function chocaBrotitos() {
  for (const e of enemigos) {
    if (e.muerto) continue;
    const dx = J.x - e.x, dz = J.z - e.z;
    if (Math.abs(dx) < 22 && J.vz < 0 && dz > B_H * 0.4 && dz < B_H * 1.4) { e.muerto = 0.01; rebota(); continue; }   // pisotón
    if (Math.abs(dx) < 20 && dz > -B_H * 0.6 && dz <= B_H * 0.4 && J.inv <= 0) golpeado(dx);
  }
}
function choques() {
  pisaPeces(); chocaCangrejos(); chocaBrotitos();
  for (const z of zanas) {
    if (!z.cogida && Math.abs(J.x - z.x) < 18 && z.z - J.z > -24 && z.z - J.z < C_H * 0.8) { z.cogida = true; actualizaHud(); play('carrot'); }
  }
  if (Math.abs(J.x - meta.x) < 16 && Math.abs(J.z - meta.z) < 8) acaba(true);
}
