// Tiny Fans · dominio · MAPA: el suelo de la parada. Con los datos de reglas.mapa dice en qué anillo cae un punto, si está en el nido,
// en el río (que frena) o en una tela, si choca con un mueble o con el borde y dónde queda tras moverse. El choque es genérico
// (desliza con una lista de muebles y unos límites) y lo usa también el asalto. Puro. Dueño: N3 (dominio de la expedición).
'use strict';
TN.mapa = {
  // 0 (cerca), 1 (en medio) o 2 (lejos)
  anillo(reglas, x, z) {
    const m = reglas.mapa, d = Math.hypot(x - m.nido.x, z - m.nido.z);
    return d < m.anillos[0] ? 0 : d < m.anillos[1] ? 1 : 2;
  },
  enNido(reglas, x, z) {
    const n = reglas.mapa.nido;
    return Math.hypot(x - n.x, z - n.z) <= n.radio;
  },
  // dentro del río y fuera de los puentes
  enRio(reglas, x, z) {
    const { rio, puentes } = reglas.mapa;
    if (puentes.some(p => Math.hypot(x - p.x, z - p.z) <= p.radio)) return false;
    for (let i = 1; i < rio.puntos.length; i++) {
      if (TN.mapa.aSegmento(x, z, rio.puntos[i - 1], rio.puntos[i]) <= rio.ancho / 2) return true;
    }
    return false;
  },
  // cuánto se anda en ese punto (1 normal; menos en el río)
  freno(reglas, x, z) { return TN.mapa.enRio(reglas, x, z) ? reglas.mapa.rio.freno : 1; },
  // distancia de un punto a un segmento [[x, z], [x, z]]
  aSegmento(x, z, a, b) {
    const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
    const k = l2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)) : 0;
    return Math.hypot(x - a[0] - k * dx, z - a[1] - k * dz);
  },
  // ¿algo de ese radio en (x, z) pisa un mueble o se sale del borde?
  choca(reglas, x, z, radio) {
    const lim = reglas.mapa.limite - radio;
    if (Math.abs(x) > lim || Math.abs(z) > lim) return true;
    return reglas.mapa.muebles.some(m => TN.mapa.empujeDe(m, x, z, radio) !== null);
  },
  // dónde queda algo de ese radio que quiere ir de (x, z) a (ax, az) sin atravesar muebles ni salirse: { x, z }
  mueve(reglas, x, z, ax, az, radio) {
    const l = reglas.mapa.limite;
    return TN.mapa.desliza(x, z, ax, az, radio, reglas.mapa.muebles, { x0: -l, x1: l, z0: -l, z1: l });
  },
  // lo mismo con cualquier lista de muebles y límites { x0, x1, z0, z1 }: va a trocitos para no atravesar lo fino
  desliza(x, z, ax, az, radio, muebles, lim) {
    const trozos = Math.max(1, Math.ceil(Math.hypot(ax - x, az - z) / (radio * 0.8)));
    let p = { x, z };
    for (let i = 1; i <= trozos; i++) {
      p = TN.mapa.sinChoque({ x: p.x + (ax - x) / trozos, z: p.z + (az - z) / trozos }, radio, muebles, lim);
    }
    return p;
  },
};
// saca el punto de los muebles que pisa y lo deja dentro de los límites
TN.mapa.sinChoque = (p, radio, muebles, lim) => {
  let { x, z } = p;
  for (let vuelta = 0; vuelta < 2; vuelta++) {
    for (const m of muebles) {
      const e = TN.mapa.empujeDe(m, x, z, radio);
      if (e) { x += e.x; z += e.z; }
    }
  }
  return { x: Math.max(lim.x0 + radio, Math.min(lim.x1 - radio, x)), z: Math.max(lim.z0 + radio, Math.min(lim.z1 - radio, z)) };
};
// cuánto hay que empujar algo de ese radio para sacarlo del mueble, o null si no lo toca
TN.mapa.empujeDe = (m, x, z, radio) => (m.forma === 'circulo' ? TN.mapa.empujeCirculo(m, x, z, radio) : TN.mapa.empujeCaja(m, x, z, radio));
TN.mapa.empujeCirculo = (m, x, z, radio) => {
  const dx = x - m.x, dz = z - m.z, d = Math.hypot(dx, dz), falta = m.radio + radio - d;
  if (falta <= 0) return null;
  return d > 1e-9 ? { x: dx / d * falta, z: dz / d * falta } : { x: falta, z: 0 };
};
TN.mapa.empujeCaja = (m, x, z, radio) => {
  const g = m.giro || 0, c = Math.cos(g), s = Math.sin(g);
  const lx = (x - m.x) * c + (z - m.z) * s, lz = -(x - m.x) * s + (z - m.z) * c;   // al marco del mueble
  const e = TN.mapa.empujeCajaLocal(m.ancho / 2, m.fondo / 2, lx, lz, radio);
  return e && { x: e.x * c - e.z * s, z: e.x * s + e.z * c };
};
TN.mapa.empujeCajaLocal = (hx, hz, lx, lz, radio) => {
  const cx = Math.max(-hx, Math.min(hx, lx)), cz = Math.max(-hz, Math.min(hz, lz));
  const dx = lx - cx, dz = lz - cz, d = Math.hypot(dx, dz);
  if (d >= radio) return null;
  if (d > 1e-9) return { x: dx / d * (radio - d), z: dz / d * (radio - d) };
  // el centro está dentro: sale por el lado más cercano
  const px = hx - Math.abs(lx) + radio, pz = hz - Math.abs(lz) + radio;
  return px < pz ? { x: Math.sign(lx || 1) * px, z: 0 } : { x: 0, z: Math.sign(lz || 1) * pz };
};
