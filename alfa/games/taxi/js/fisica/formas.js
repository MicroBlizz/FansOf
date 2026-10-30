// Fans Of Taxi · FÍSICA / formas: lo sólido de un trozo del mundo (256 m) como datos simples, para el motor de física.
//
// Es dominio: solo números, sin Rapier ni three.js (el adaptador js/adaptadores/fisica-rapier.js los convierte en colisionadores).
// Lo que se pisa son mallas de triángulos: el terreno (la misma rejilla que se dibuja, con el hueco de las trincheras) y las cintas
// de las carreteras (calzada, muros, túneles, rampas de salto). Lo demás son cajas (edificios, quitamiedos, pretiles, portales de
// los túneles) y cilindros (árboles y rocas). Así el coche choca con lo mismo que se ve.
'use strict';
const FORMAS = (() => {
  // el terreno del trozo: la misma rejilla que se dibuja (js/rejilla.js), sin los triángulos que caen en una trinchera
  function terreno(t) {
    const r = REJILLA.deTrozo(t), fila = r.divisiones + 1, posiciones = [];
    const punto = k => [t.x0 + (k % fila) * r.lado, r.alto[k], t.z0 + Math.floor(k / fila) * r.lado];
    REJILLA.triangulos(t, (a, b, c) => posiciones.push(...punto(a), ...punto(b), ...punto(c)));
    return posiciones;
  }

  // la altura del suelo en la esquina más baja de un edificio (igual que al dibujarlo)
  function basePlanta(e) {
    let y = Infinity;
    for (const sx of [-0.5, 0.5]) for (const sz of [-0.5, 0.5]) y = Math.min(y, CIUDAD.alturaSuelo(e.x + sx * e.w, e.z + sz * e.d));
    return y;
  }
  // una caja: centro, medio lado en cada eje y giro alrededor del eje vertical (y opcionalmente inclinación a lo largo)
  const caja = (x, y, z, mx, my, mz, ang = 0, incl = 0) => ({ x, y, z, mx, my, mz, ang, incl });

  function cajas(t) {
    const lista = [];
    for (const e of [...t.celdas.flatMap(m => m.edificios), ...t.edificios]) {
      const y0 = basePlanta(e) - 1, y1 = CIUDAD.alturaSuelo(e.x, e.z) + e.h;
      lista.push(caja(e.x, (y0 + y1) / 2, e.z, e.w / 2, (y1 - y0) / 2, e.d / 2));
    }
    for (const q of t.quitamiedos) {
      const dx = q.bx - q.ax, dz = q.bz - q.az, L = Math.hypot(dx, dz); if (L < 1) continue;
      lista.push(caja((q.ax + q.bx) / 2, (q.ya + q.yb) / 2 + 0.55, (q.az + q.bz) / 2, 0.12, 0.55, L / 2, Math.atan2(dx, dz), Math.atan2(q.yb - q.ya, L)));
    }
    for (const p of t.puentes) {
      const s = Math.sin(p.ang), co = Math.cos(p.ang);
      lista.push(caja(p.x, p.y - 0.6, p.z, p.ancho / 2 + 0.5, 0.6, p.largo / 2, p.ang));
      for (const lado of [-1, 1]) lista.push(caja(p.x + co * lado * (p.ancho / 2 + 0.5), p.y + 0.6, p.z - s * lado * (p.ancho / 2 + 0.5), 0.3, 0.6, p.largo / 2, p.ang));
    }
    return lista;
  }

  function cilindros(t) {
    const lista = [];
    for (const m of t.celdas) for (const a of m.arboles) { const y = CIUDAD.alturaSuelo(a.x, a.z); lista.push({ x: a.x, y: y + a.alto / 2, z: a.z, radio: a.radio * 0.6, medio: a.alto / 2 + 1 }); }
    for (const o of t.campo) { const y = CIUDAD.alturaSuelo(o.x, o.z); lista.push({ x: o.x, y: y + o.alto / 2, z: o.z, radio: o.tipo === 'roca' ? o.radio * 0.9 : o.radio * 0.5, medio: o.alto / 2 + 1 }); }
    return lista;
  }

  // todo lo sólido del trozo: { mallas: [lista de x, y, z de tres en tres vértices], cajas, cilindros }
  function deTrozo(t) {
    const cintas = CINTAS.trozo.construir(t);
    const mallas = [terreno(t), cintas.calzada.posiciones, cintas.muros.posiciones, cintas.tunel.posiciones].filter(p => p.length);
    return { mallas, cajas: cajas(t), cilindros: cilindros(t) };
  }

  return { deTrozo };
})();
