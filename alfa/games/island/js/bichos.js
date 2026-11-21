// Fans of Island · bichos (ADAPTADOR): une las reglas puras de los bichos (dominio/: brotitos, peces, gaviotas, cangrejos, choques) con
// el juego. Arma el «mundo» con las globales de partida y el azar de verdad (Math.random), llama a las reglas y APLICA los eventos que
// devuelven (salpicaduras de adorno, sonidos, daño, rebote, zanahorias, meta). Las partículas de adorno (salpica, pasoParts) viven aquí.
'use strict';
const COLORES_SALPICA = { agua: ['#ffffff', '#bfeaff', '#7cc6ee'], astillas: ['#6b4428', '#b77c45', '#fff6e0'], cangrejo: ['#ff5a4a', '#ff8a6a', '#ffffff'] };
function salpica(x, y, z, n, cols) {
  for (let i = 0; i < n; i++) parts.push({ x, y, z, vx: (Math.random() - 0.5) * 120, vz: 90 + Math.random() * 140, t: 0.35 + Math.random() * 0.3, c: cols[i % cols.length] });
}
const pasoParts = dt => { parts = parts.filter(p => { p.vz -= 700 * dt; p.x += p.vx * dt; p.z += p.vz * dt; p.t -= dt; return p.t > 0; }); };
const mundo = () => ({ J, fis: IS.fisica, nivel: IS.nivel, azar: Math.random, reloj, vw: VW, cH: C_H, bH: B_H, giroDer: GIRO_DER, giroIzq: GIRO_IZQ,
  enemigos, peces, cangrejos, gotas, gaviotas, cocos, zanas, meta, tGav });
function pisaPez(e) {   // un pez pisado: el jugador queda encima y rebota
  J.z = e.arriba; J.vz = ent.salto ? 500 : 400; J.flota = 0; J.cortado = !ent.salto; play('pop');
}
function golpeaGota(e) {
  if (daño()) { J.vx = e.dir * 150; J.vz = Math.max(J.vz, 170); J.empuje = 0.2; J.cortado = true; }
}
const EVENTOS = {
  salpica: e => salpica(e.x, e.y, e.z, e.n, COLORES_SALPICA[e.col]),
  suena: e => play(e.nombre),
  pisa: e => (e.clase === 'pez' ? pisaPez(e) : rebota()),
  golpe: e => golpeado(e.dx),
  gotaGolpea: golpeaGota,
  cocoGolpea: () => daño(),
  cogeZana: () => { actualizaHud(); play('carrot'); },
  meta: () => acaba(true),
};
const aplica = eventos => { for (const e of eventos) EVENTOS[e.tipo](e); };
const poseEnemigo = IS.poseBrotito, posePez = IS.posePez;
const pasoEnemigo = (e, dt) => IS.pasoBrotito(mundo(), e, dt);
const pasoPez = (f, dt) => aplica(IS.pasoPez(mundo(), f, dt));
const pasoCangrejo = (k, dt) => IS.pasoCangrejo(mundo(), k, dt);
const pasoGotas = dt => aplica(IS.pasoGotas(mundo(), dt));
function pasoGaviotas(dt) {
  const m = mundo();
  aplica(IS.pasoGaviotas(m, dt));
  tGav = m.tGav;
}
const choques = () => aplica(IS.choques(mundo()));
