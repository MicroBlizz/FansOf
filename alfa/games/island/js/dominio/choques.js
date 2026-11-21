// Fans of Island · dominio/choques: quién pisa a quién. IS.choques(m) es un generador de EVENTOS con nombre, en orden: pisa (clase
// 'pez', 'cangrejo' o 'brotito'), golpe (un bicho toca al jugador de lado), salpica, cogeZana y meta. Quien llama aplica cada evento
// antes de pedir el siguiente (el jugador cambia con cada uno y los choques siguientes lo ven). Un bicho muerto no choca; pisar mata
// al Brotito y al cangrejo y manda al pez abajo. Puro.
'use strict';
{
  const { CARRIL } = IS.MEDIDAS;
  const { evSalpica } = IS;
  const PEZ_FUERA = { sube: 1, asoma: 1, escupe: 1 };
  const pisa = (J, dx, dz, ancho, zMin, zMax) => Math.abs(dx) < ancho && J.vz < 0 && dz > zMin && dz < zMax;
  const golpea = (J, dx, dz, ancho, zMin, zMax) => Math.abs(dx) < ancho && dz > zMin && dz <= zMax && J.inv <= 0;
  const pisaEncima = (J, f, arriba) => Math.abs(J.x - f.x) < 20 && J.z <= arriba + 6 && J.z >= arriba - 14;
  function* pisaPeces(m) {
    const J = m.J;
    if (J.vz >= 0) return;
    for (const f of m.peces) {
      if (f.y !== CARRIL || !PEZ_FUERA[f.estado]) continue;
      const arriba = f.z + 26;
      if (!pisaEncima(J, f, arriba)) continue;
      f.estado = 'golpe';
      yield { tipo: 'pisa', clase: 'pez', bicho: f, arriba };
      yield evSalpica(f.x, f.y, arriba, 8, 'agua');
    }
  }
  function* choqueCon(m, lista, cfg) {   // cfg: clase, medidas de pisotón y de golpe, y extra(b) opcional (un evento más al pisar)
    const J = m.J;
    for (const b of lista) {
      if (b.muerto) continue;
      const dx = J.x - b.x, dz = J.z - b.z;
      if (pisa(J, dx, dz, ...cfg.pisa)) {
        b.muerto = 0.01;
        yield { tipo: 'pisa', clase: cfg.clase, bicho: b };
        if (cfg.extra) yield cfg.extra(b);
      } else if (golpea(J, dx, dz, ...cfg.golpe)) yield { tipo: 'golpe', dx, bicho: b };
    }
  }
  const cangrejo = { clase: 'cangrejo', pisa: [21, 8, 30], golpe: [19, -14, 8], extra: k => evSalpica(k.x, CARRIL, k.z + 8, 10, 'cangrejo') };
  const brotito = m => ({ clase: 'brotito', pisa: [22, m.bH * 0.4, m.bH * 1.4], golpe: [20, -m.bH * 0.6, m.bH * 0.4] });
  function* cogeZanas(m) {
    const J = m.J;
    for (const z of m.zanas) {
      if (z.cogida || Math.abs(J.x - z.x) >= 18 || z.z - J.z <= -24 || z.z - J.z >= m.cH * 0.8) continue;
      z.cogida = true;
      yield { tipo: 'cogeZana', zana: z };
    }
  }
  IS.choques = function* (m) {
    yield* pisaPeces(m);
    yield* choqueCon(m, m.cangrejos, cangrejo);
    yield* choqueCon(m, m.enemigos, brotito(m));
    yield* cogeZanas(m);
    if (Math.abs(m.J.x - m.meta.x) < 16 && Math.abs(m.J.z - m.meta.z) < 8) yield { tipo: 'meta' };
  };
}
