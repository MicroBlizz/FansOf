// Fans of Island · dominio/gaviotas: cada tanto sale una gaviota por un lado de la pantalla, cruza y suelta un coco cuando pasa junto
// al jugador; el coco cae, bota una vez y se rompe, o se apaga en el mar. Las reglas devuelven eventos (salpica, suena, cocoGolpea).
// Puro: el azar entra por m.azar.
'use strict';
{
  const { T, CARRIL } = IS.MEDIDAS;
  const { G, MAR } = IS.FISICA;
  const { evSalpica, evSuena } = IS;
  function nuevaGaviota(m) {
    const lado = m.J.mira || 1;
    m.gaviotas.push({ x: m.J.x + lado * (m.vw * 0.6 + 40), z: Math.max(m.J.z, 0) + 100, vx: -lado * 82, mira: -lado,
      giro: -lado > 0 ? -Math.PI / 2 + 0.85 : Math.PI / 2 - 0.85, t: 0, coco: true });
    m.tGav = 5 + m.azar() * 3;
  }
  function gaviotaViva(m, g, dt) {
    const J = m.J;
    g.x += g.vx * dt; g.t += dt;
    if (g.coco && Math.abs(g.x - (J.x + J.vx * 0.45)) < 10) { m.cocos.push({ x: g.x, y: CARRIL, z: g.z - 7, vx: g.vx * 0.4, vz: 0, bote: 0, giro: 0 }); g.coco = false; }
    return Math.abs(g.x - J.x) < m.vw + 160;
  }
  function cocoVivo(m, c, dt, ev) {
    const J = m.J;
    c.vz -= G * 0.8 * dt; c.x += c.vx * dt; c.z += c.vz * dt; c.giro += c.vx * dt * 0.08;
    if (c.z < MAR) { ev.push(evSalpica(c.x, c.y, MAR, 8, 'agua')); return false; }
    if (c.vz < 0 && c.bote === 0 && Math.abs(J.x - c.x) < 14 && c.z - J.z > 0 && c.z - J.z < m.cH * 0.9) {
      ev.push({ tipo: 'cocoGolpea' }, evSalpica(c.x, c.y, c.z, 8, 'astillas')); return false;
    }
    const s = m.fis.sueloDe(c, 6);
    if (c.vz >= 0 || c.z > s) return true;
    if (c.bote === 0) { c.z = s; c.vz = 150; c.vx *= 0.6; c.bote = 1; return true; }
    ev.push(evSalpica(c.x, c.y, s, 9, 'astillas'), evSuena('clank')); return false;
  }
  const quedaSitio = m => m.gaviotas.length < 2 && m.J.x > 9 * T && m.J.x < 69 * T;
  IS.pasoGaviotas = (m, dt) => {
    const ev = [];
    m.tGav -= dt;
    if (m.tGav <= 0 && quedaSitio(m)) nuevaGaviota(m);
    IS.quitaSi(m.gaviotas, g => gaviotaViva(m, g, dt));
    IS.quitaSi(m.cocos, c => cocoVivo(m, c, dt, ev));
    return ev;
  };
}
