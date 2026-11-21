// Fans of Island · dominio/brotitos: los Brotitos brincan hacia el jugador (o a un lado al azar si está lejos) con su ciclo
// quieto, agachado, aire y aterriza, y se caen al mar. Puro: el azar entra por m.azar.
'use strict';
{
  const { T, CARRIL } = IS.MEDIDAS;
  const { R_E, MAR } = IS.FISICA;
  IS.creaBrotitos = m => m.nivel.ENEM0.map(c => ({ x: (c + 0.5) * T, y: CARRIL, z: m.fis.arribaCol(c), vx: 0, vz: 0, mira: -1, giro: m.giroIzq,
    t: m.azar(), estado: 'quieto', muerto: 0 }));
  const ladoInicial = (m, e) => {
    const dx = m.J.x - e.x;
    return Math.abs(dx) < 150 ? (Math.sign(dx) || 1) : (m.azar() < 0.5 ? -1 : 1);
  };
  function brinca(m, e) {   // salta hacia un lado si hay suelo a su altura; si no prueba el otro, y si no, se queda quieto
    let lado = ladoInicial(m, e);
    for (let i = 0; i < 2; i++) {
      if (m.fis.sueloDe({ x: e.x + lado * 30, z: e.z }, R_E) === e.z) { e.vx = lado * 75; e.vz = 270; e.mira = lado; e.estado = 'aire'; e.t = 0; return; }
      lado = -lado;
    }
    e.estado = 'quieto'; e.t = 0.3;
  }
  const SIGUE_BROTO = { aterriza: [0.14, 'quieto'], quieto: [0.9, 'agachado'] };
  function cuerpoBrotito(m, e, dt) {   // la caída y el choque con paredes; devuelve 'aire', 'aterriza' o 'suelo'
    const r = m.fis.cae(e, dt, 1, R_E);
    if (r === 'aire' && m.fis.mueveX(e, e.vx * dt, R_E)) e.vx = 0;
    if (r === 'aterriza') { e.estado = 'aterriza'; e.t = 0; e.vx = 0; }
    return r;
  }
  function cicloBrotito(m, e) {   // en el suelo: cambia de estado cuando se cumple su tiempo y, agachado, brinca
    const sigue = SIGUE_BROTO[e.estado];
    if (sigue && e.t > sigue[0]) { e.estado = sigue[1]; e.t = 0; }
    else if (e.estado === 'agachado' && e.t > 0.16) brinca(m, e);
  }
  IS.pasoBrotito = (m, e, dt) => {
    if (e.muerto) { e.muerto += dt; return; }
    e.t += dt;
    const r = cuerpoBrotito(m, e, dt);
    IS.giraBicho(m, e, dt);
    if (e.z < MAR - 50) { e.muerto = 0.01; return; }
    if (r === 'suelo') cicloBrotito(m, e);
  };
  IS.poseBrotito = e => {
    if (e.muerto) return 'aterriza';
    if (e.estado === 'agachado' || e.estado === 'aterriza') return e.estado;
    if (e.vz > 64) return 'despegue';
    if (e.vz > -64 && e.vz !== 0) return 'arriba';
    if (e.vz < 0) return 'cayendo';
    return 'reposo';
  };
}
