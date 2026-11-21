// Fans of Island · dominio/cangrejos: los cangrejos andan de lado por su plataforma y se dan la vuelta en el borde. Puro: el azar
// entra por m.azar.
'use strict';
{
  const { T } = IS.MEDIDAS;
  IS.creaCangrejos = m => m.nivel.CANG0.map(c => ({ x: (c + 0.5) * T, z: m.fis.arribaCol(c), dir: c % 2 ? 1 : -1, t: m.azar(), muerto: 0 }));
  IS.pasoCangrejo = (m, k, dt) => {
    if (k.muerto) { k.muerto += dt; return; }
    k.t += dt; k.x += k.dir * 38 * dt;
    if (Math.abs(m.fis.sueloDe({ x: k.x + k.dir * 16, z: k.z }, 2) - k.z) > 1) k.dir = -k.dir;
  };
}
