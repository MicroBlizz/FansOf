// Fans Of Karts · dominio · FÍSICA (primera tanda, ADR 048 opción B): acelerar y frenar, el volante y el bote, el derrape con su miniturbo y el salto.
// Cambian el kart en su sitio (sin crear objetos por paso) y lo que no es suyo les llega por `puertos`: aj (las cifras de ajustes.js), suena(k, nombre, n),
// malTerreno(sup) y gravedad (el multiplicador de la pista). Sin azar, reloj, pista ni pantalla. kart.js (mueveKart) les da los puertos reales.
'use strict';
KD.fisica = Object.freeze({
  // v se acerca a `meta` en pasos de `paso` sin pasarse
  acerca(v, meta, paso) { return v < meta ? Math.min(meta, v + paso) : Math.max(meta, v - paso); },
  // acelerar y frenar según el estado del kart y los mandos c; vmax ya viene con suelo, turbo y golpes
  acelera(k, c, vmax, turbo, enSuelo, sup, dt, puertos) {
    const aj = puertos.aj, acerca = KD.fisica.acerca;
    if (k.estado === 'parado') k.v = acerca(k.v, 0, 320 * dt);
    else if (k.estado === 'trompo') k.v = Math.max(Math.min(k.v, 14), k.v - 150 * dt);
    else if (c.freno && enSuelo) k.v = k.v > 0 ? Math.max(0, k.v - aj.freno * dt) : Math.max(-aj.atras, k.v - 70 * dt);
    else if (c.gas) { if (k.v < vmax) k.v = Math.min(vmax, k.v + (turbo ? aj.turboAcel : k.acel * (1.08 - 0.8 * Math.max(0, k.v) / vmax)) * dt); }
    else k.v = acerca(k.v, 0, aj.roce * dt);
    if (k.v > vmax && enSuelo) k.v = Math.max(vmax, k.v - (puertos.malTerreno(sup) ? 200 : 60) * dt);      // en el aire no se frena: el salto llega siempre
  },
  // el volante y el bote; devuelve cuánto gira (w)
  gira(k, c, enSuelo, puede, dt, puertos) {
    k.giro = KD.fisica.acerca(k.giro, puede ? c.giro : 0, dt * 6.5);
    let w = k.giroMax * (1 - 0.3 * Math.min(1, Math.abs(k.v) / k.vmax)) * Math.min(1, Math.abs(k.v) / 20);
    if (!enSuelo) w *= 0.55;
    if (puede && c.salta && enSuelo) { k.vz = puertos.aj.bote; k.z = 0.01; k.botado = true; puertos.suena(k, 'bote'); }
    return w;
  },
  // el nivel del miniturbo según lo cargado: 0, 1 o 2
  nivelDeMiniturbo(carga, umbrales) { return carga > umbrales[1] ? 2 : carga > umbrales[0] ? 1 : 0; },
  // derrapando gira solo hacia ese lado; el volante cierra o abre la curva. Cuanto más se cierra, antes carga el miniturbo. T = { vmax, agarre }
  derrapa(k, c, w, T, puede, dt, puertos) {
    const s = k.derrape, mando = k.giro * s;
    k.ang += s * w * (0.72 + 0.6 * mando) * dt;
    T.agarre = Math.min(T.agarre, 2.7);
    k.tDerrape += dt * (0.6 + 0.7 * Math.max(0, mando));
    const nv = KD.fisica.nivelDeMiniturbo(k.tDerrape, puertos.aj.miniturbo);
    if (nv > k.nivel) { k.nivel = nv; puertos.suena(k, 'chispa', nv); }
    if (!c.derrapa || k.v < 36 || !puede) {
      if (!c.derrapa && k.nivel > 0 && puede) puertos.miniturbo(k, k.nivel === 2 ? 1.05 : 0.6);
      k.derrape = 0; k.nivel = 0;
    }
  },
  // el bote, el salto de las rampas y la caída; gravedadPista = el multiplicador de la pista (bajo el agua se cae más despacio)
  vertical(k, c, puede, dt, puertos) {
    if (k.z <= 0) return;
    k.vz -= puertos.aj.gravedad * (k.botado ? 1 : puertos.gravedadPista()) * dt; k.z += k.vz * dt;
    if (k.z > 0) return;
    k.z = 0; k.vz = 0;
    if (!k.botado) { puertos.suena(k, 'aterriza'); return; }
    k.botado = false;      // al caer de un bote con el botón apretado y el volante girado, empieza el derrape
    if (puede && c.derrapa && Math.abs(c.giro) > 0.25 && k.v > 42 && !k.derrape) { k.derrape = c.giro > 0 ? 1 : -1; k.tDerrape = 0; k.nivel = 0; }
  },
});
