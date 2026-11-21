// Fans of Island · dominio/peces: los peces se asoman del mar (oculto, sube, asoma, escupe, baja), escupen una gota que apunta al
// jugador y la gota cae hasta tocarlo o apagarse en el suelo o el agua. Las reglas devuelven eventos (salpica, suena, gotaGolpea).
// Puro: el azar entra por m.azar y el reloj por m.reloj.
'use strict';
{
  const { T } = IS.MEDIDAS;
  const { MAR, Z_OCULTO, Z_ASOMA } = IS.FISICA;
  const { evSalpica, evSuena } = IS;
  IS.creaPeces = m => m.nivel.PECES0.map((p, i) => ({ x: p.c * T, y: p.y, z: Z_OCULTO, estado: 'oculto', t: 0.4 + i * 0.5, mira: -1, giro: m.giroIzq }));
  function escupe(m, f, ev) {   // la gota sale apuntada a donde estará el jugador en 0,8 s
    const J = m.J, sx = f.x + f.mira * 15, sz = f.z + 13, t = 0.8, g = 760;
    const vx = Math.max(-230, Math.min(230, (J.x + J.vx * 0.3 - sx) / t));
    const vz = (J.z + 28 - sz + 0.5 * g * t * t) / t;
    m.gotas.push({ x: sx, y: f.y, z: sz, vx, vz, g });
    ev.push(evSuena('blip'), evSalpica(sx, f.y, sz, 3, 'agua'));
  }
  const PEZ_PASO = {
    oculto(m, f, dx, dt, ev) { f.z = Z_OCULTO; if (f.t <= 0 && Math.abs(dx) < 240) { f.estado = 'sube'; ev.push(evSalpica(f.x, f.y, MAR, 6, 'agua')); } },
    sube(m, f, dx, dt) { f.z += 130 * dt; if (f.z >= Z_ASOMA) { f.z = Z_ASOMA; f.estado = 'asoma'; f.t = 0.6; } },
    asoma(m, f, dx, dt, ev) { f.z = Z_ASOMA + Math.sin(m.reloj * 6) * 1.5; if (f.t <= 0) { escupe(m, f, ev); f.estado = 'escupe'; f.t = 0.55; } },
    escupe(m, f) { if (f.t <= 0) f.estado = 'baja'; },
    baja(m, f, dx, dt, ev) {                // también tras un pisotón (golpe), más deprisa
      f.z -= (f.estado === 'golpe' ? 170 : 90) * dt;
      if (f.z <= Z_OCULTO) { f.estado = 'oculto'; f.t = 1.4 + m.azar() * 1.3; ev.push(evSalpica(f.x, f.y, MAR, 4, 'agua')); }
    },
  };
  PEZ_PASO.golpe = PEZ_PASO.baja;
  IS.pasoPez = (m, f, dt) => {
    const ev = [], dx = m.J.x - f.x;
    f.t -= dt;
    if (f.estado !== 'golpe') { f.mira = Math.sign(dx) || f.mira; IS.giraBicho(m, f, dt); }
    PEZ_PASO[f.estado](m, f, dx, dt, ev);
    return ev;
  };
  IS.posePez = f => {
    if (f.estado === 'golpe') return 'golpe';
    if ((f.estado === 'asoma' && f.t < 0.3) || (f.estado === 'escupe' && f.t > 0.35)) return 'abierta';
    return 'cerrada';
  };
  function gotaViva(m, g, dt, ev) {
    const J = m.J;
    g.vz -= g.g * dt; g.x += g.vx * dt; g.z += g.vz * dt;
    if (Math.abs(J.x - g.x) < 12 && g.z - J.z > -4 && g.z - J.z < m.cH * 0.75) {
      ev.push({ tipo: 'gotaGolpea', dir: Math.sign(g.vx || 1) }, evSalpica(g.x, g.y, g.z, 8, 'agua')); return false;
    }
    if (g.vz < 0 && (g.z < MAR || g.z <= m.fis.sueloDe(g, 3))) { ev.push(evSalpica(g.x, g.y, Math.max(g.z, MAR), 6, 'agua')); return false; }
    return true;
  }
  IS.pasoGotas = (m, dt) => {
    const ev = [];
    IS.quitaSi(m.gotas, g => gotaViva(m, g, dt, ev));
    return ev;
  };
}
