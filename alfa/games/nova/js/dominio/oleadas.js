// Fans Of Nova · NV.Oleadas: cuándo salen enemigos y cuándo llega el jefe. Sin azar ni pantalla: dice QUÉ oleadas tocan; dónde y cómo
// entran (el salto hiperespacial) lo hace nvSpawn (enemigos.js).
'use strict';
NV.Oleadas = (() => {
  // Lo lleno que está tu zona (1200 alrededor): cada enemigo cuenta 1, y 2 si te saca más de un rango. Rocas y nidos no cuentan.
  function carga(enem, n) {
    let c = 0;
    for (const e of enem) if (!e.muerto && !e.d.pasivo && !e.d.nido && Math.hypot(e.x - n.x, e.y - n.y) < 1200) c += e.rango > n.rango + 1 ? 2 : 1;
    return c;
  }
  // Las oleadas que tocan en este paso (en su orden): cada una cuenta su tiempo en `cuentas` y sale al llegar a `cada`.
  // Con la zona llena (carga 12) no sale ninguna más. Apunta el tiempo también en la oleada (o.tiempo), como siempre.
  function tocan(oleadas, cuentas, t, dt, cargaZona) {
    const out = [];
    for (const o of oleadas) {
      if (cargaZona >= 12) break;
      if (t < o.desde) continue;
      const k = o.tipo + o.desde;
      o.tiempo = (cuentas[k] = (cuentas[k] || 0) + dt);
      if (o.tiempo < o.cada) continue;
      cuentas[k] = 0;
      out.push(o);
    }
    return out;
  }
  // El jefe llega al matar 3 capitanes o al cumplirse su tiempo
  function llegaJefe(capMuertos, t, tiempoJefe) { return capMuertos >= 3 || t >= tiempoJefe; }
  return { carga, tocan, llegaJefe };
})();
