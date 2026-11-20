// Fans of Pinball · dominio · PALAS: cada pala es una cápsula (segmento con grosor) que gira alrededor de su pivote con velocidad angular.
// Con el dedo apoyado sube hasta arriba y se queda (así se atrapa la bola); al soltar baja. Congelada (cubito del jefe) se queda abajo y
// hace de pared; lenta (café) gira a menos velocidad. Al golpear transmite su velocidad a la bola: la del punto de contacto, w × r.
'use strict';
PB.palas = (() => {
  const crea = def => ({ ...def, ang: def.reposo, w: 0, pulsada: false, congelada: 0, lenta: 0 });
  // la punta de la pala (deja x, y en `fuera`)
  function punta(p, fuera) {
    fuera.x = p.x + Math.cos(p.ang) * p.largo; fuera.y = p.y + Math.sin(p.ang) * p.largo;
    return fuera;
  }
  const PUNTA = { x: 0, y: 0 };
  const objetivo = p => (p.pulsada && p.congelada <= 0 ? p.arriba : p.reposo);
  const seMueve = p => p.ang !== objetivo(p);
  // gira la pala h segundos hacia donde le toca; deja en p.w la velocidad angular de este subpaso
  function mueve(p, h, mesa, factorLenta) {
    const meta = objetivo(p), falta = meta - p.ang;
    if (falta === 0) { p.w = 0; return; }
    let vel = meta === p.arriba ? mesa.velocidadSube : mesa.velocidadBaja;
    if (p.lenta > 0) vel *= factorLenta;
    const paso = vel * h;
    if (Math.abs(falta) <= paso) { p.w = falta / h; p.ang = meta; return; }
    p.w = Math.sign(falta) * vel;
    p.ang += p.w * h;
  }
  // choca la bola con la pala; `fuerza` multiplica la velocidad que transmite (Pala de acero). Devuelve la velocidad con que se
  // acercaban (≥ 0) o -1 si no se tocan
  function choca(b, p, fuerza, rebote) {
    punta(p, PUNTA);
    const d2 = PB.geo.dist2Segmento(b.x, b.y, p.x, p.y, PUNTA.x, PUNTA.y), lim = b.r + p.grosor;
    if (d2 >= lim * lim) return -1;
    const cx = PB.geo.P.x, cy = PB.geo.P.y, w = p.w * fuerza;
    return PB.geo.rebota(b, cx, cy, p.grosor, -w * (cy - p.y), w * (cx - p.x), rebote);
  }
  // el punto medio de la pala en reposo (a donde apuntan el láser y el cubito del jefe)
  function medio(p, fuera) {
    fuera.x = p.x + Math.cos(p.reposo) * p.largo * 0.5; fuera.y = p.y + Math.sin(p.reposo) * p.largo * 0.5;
    return fuera;
  }
  return { crea, punta, objetivo, seMueve, mueve, choca, medio };
})();
