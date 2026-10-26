// Fans Of Taxi · COCHE: la física arcade de cualquier coche (el tuyo, los del tráfico, la policía): velocidad hacia delante, deslizamiento
// lateral, giro que depende de la velocidad, derrape, nitro, saltos en las rampas y choques contra los muros de la ciudad y los árboles.
// Paso fijo y sin azar: misma entrada, mismo resultado (fantasmas y repeticiones gratis). Sin DOM ni three.
'use strict';
const COCHE = (() => {
  const K = TAXI.coche;
  function nuevo(x, z, ang, extra = {}) {
    return { x, z, y: 0, vy: 0, ang, v: 0, vl: 0, derrapando: false, aire: false, nitro: 0, usandoNitro: false, giro: 0, golpe: 0, radio: K.radio, ...extra };
  }
  const adelante = c => ({ x: Math.sin(c.ang), z: Math.cos(c.ang) });
  const derecha = c => ({ x: Math.cos(c.ang), z: -Math.sin(c.ang) });

  // entrada: { giro: -1..1, gas: 0..1, freno: 0..1, nitro: bool }. Devuelve los sucesos del paso (choque, derrape, salto) para el que llama.
  function paso(c, e, dt, mundo, lim = K) {
    const sucesos = [];
    const vmax = (c.usandoNitro ? lim.vmaxNitro : lim.vmax) || K.vmax;
    // acelerar y frenar
    c.usandoNitro = !!(e.nitro && c.nitro > 0 && c.v > 1);
    if (c.usandoNitro) { c.nitro = Math.max(0, c.nitro - K.nitroGasto * dt); c.v += K.nitroAcel * dt; }
    if (e.gas > 0) c.v += (lim.acel || K.acel) * e.gas * dt;
    if (e.freno > 0) {
      if (c.v > 0.5) c.v -= K.freno * e.freno * dt;
      else if (!e.gas) c.v = Math.max(-K.marchaAtras, c.v - K.acel * 0.6 * e.freno * dt);   // marcha atrás
    }
    c.v -= c.v * K.rozamiento * dt;
    if (c.v > vmax) c.v -= (c.v - vmax) * 2 * dt;
    // girar: poco parado, pleno a partir de giroVel; derrapando gira más y agarra menos
    const quiereDerrape = e.freno > 0 && Math.abs(e.giro) > 0.3 && c.v > K.derrapeMin;
    if (quiereDerrape && !c.derrapando) sucesos.push('derrape-empieza');
    c.derrapando = quiereDerrape || (c.derrapando && Math.abs(c.vl) > 4 && c.v > K.derrapeMin * 0.7);
    const factor = clamp(Math.abs(c.v) / K.giroVel, 0, 1) * Math.sign(c.v || 1);
    const giroObjetivo = e.giro * K.giro * factor * (c.derrapando ? K.derrapeGiro : 1) * (c.aire ? 0.35 : 1);
    c.giro = lerp(c.giro, giroObjetivo, Math.min(1, 10 * dt));
    const angAntes = c.ang;
    c.ang += c.giro * dt;
    // al girar, parte de la velocidad se queda «de lado»; el agarre se la come
    const cambio = c.ang - angAntes;
    c.vl += -cambio * c.v * (c.derrapando ? 1.3 : 0.9);
    const agarre = c.aire ? 0.4 : c.derrapando ? K.agarreDerrape : K.agarre;
    c.vl -= c.vl * Math.min(1, agarre * dt);
    if (c.derrapando) { c.nitro = Math.min(1, c.nitro + K.nitroCarga.derrape * dt); c.derrapeT = (c.derrapeT || 0) + dt; } else c.derrapeT = 0;
    // moverse
    const f = adelante(c), d = derecha(c);
    c.x += (f.x * c.v + d.x * c.vl) * dt;
    c.z += (f.z * c.v + d.z * c.vl) * dt;
    // saltos
    if (c.aire) {
      c.vy -= K.gravedad * dt; c.y += c.vy * dt;
      if (c.y <= 0) { c.y = 0; c.vy = 0; c.aire = false; sucesos.push('aterriza'); }
    } else if (mundo && mundo.rampas) {
      for (const rp of mundo.rampas) if (enRampa(c, rp) && c.v > 8) { c.aire = true; c.vy = c.v * K.salto; c.nitro = Math.min(1, c.nitro + K.nitroCarga.salto); sucesos.push('salta'); break; }
    }
    // choques con los muros y los árboles
    if (mundo) {
      const antes = Math.hypot(c.v, c.vl);
      let choca = false;
      for (const m of mundo.muros) choca = resuelveCaja(c, m) || choca;
      for (const a of mundo.arboles) choca = resuelveCirculo(c, a.x, a.z, a.radio * 0.6) || choca;
      if (c.x < c.radio) { c.x = c.radio; c.vl = 0; choca = true; } if (c.z < c.radio) { c.z = c.radio; c.vl = 0; choca = true; }
      if (c.x > mundo.ancho - c.radio) { c.x = mundo.ancho - c.radio; c.vl = 0; choca = true; } if (c.z > mundo.largo - c.radio) { c.z = mundo.largo - c.radio; c.vl = 0; choca = true; }
      c.choqueT = Math.max(0, (c.choqueT || 0) - dt);   // un choque fuerte no se repite mientras sigas pegado al muro
      if (choca) { c.golpe = antes; if (antes > K.choqueFuerte && c.choqueT <= 0) { c.choqueT = 0.8; sucesos.push('choque'); } else sucesos.push('roce-muro'); } else c.golpe = 0;
    }
    if (c.derrapando && !quiereDerrape && Math.abs(c.vl) < 4) c.derrapando = false;
    return sucesos;
  }
  function enRampa(c, rp) {
    const dx = c.x - rp.x, dz = c.z - rp.z, s = Math.sin(rp.ang), co = Math.cos(rp.ang);
    const a = dx * s + dz * co, l = dx * co - dz * s;   // a lo largo y a lo ancho de la rampa
    if (Math.abs(l) > rp.ancho / 2 || a < rp.largo * 0.3 || a > rp.largo * 0.55) return false;
    const f = adelante(c); return f.x * s + f.z * co > 0.5;   // solo en el sentido de subida
  }
  // el coche es un círculo; contra una caja: se saca por el lado más corto y pierde velocidad
  function resuelveCaja(c, m) {
    const px = clamp(c.x, m.x0, m.x1), pz = clamp(c.z, m.z0, m.z1);
    let dx = c.x - px, dz = c.z - pz, d = Math.hypot(dx, dz);
    if (d >= c.radio) return false;
    if (d < 1e-6) {   // dentro: sacar por el borde más cercano
      const l = c.x - m.x0, r = m.x1 - c.x, t = c.z - m.z0, b = m.z1 - c.z, mn = Math.min(l, r, t, b);
      if (mn === l) { dx = -1; dz = 0; } else if (mn === r) { dx = 1; dz = 0; } else if (mn === t) { dx = 0; dz = -1; } else { dx = 0; dz = 1; }
      d = 0;
    } else { dx /= d; dz /= d; }
    return empuja(c, dx, dz, c.radio - d);
  }
  function resuelveCirculo(c, x, z, radio) {
    let dx = c.x - x, dz = c.z - z; const d = Math.hypot(dx, dz), min = c.radio + radio;
    if (d >= min || d < 1e-6) return false;
    return empuja(c, dx / d, dz / d, min - d);
  }
  // nx, nz: la normal del muro (hacia el coche). Se quita la velocidad que iba hacia dentro y se frena el resto
  function empuja(c, nx, nz, cuanto) {
    c.x += nx * cuanto; c.z += nz * cuanto;
    const f = adelante(c), d = derecha(c);
    const vx = f.x * c.v + d.x * c.vl, vz = f.z * c.v + d.z * c.vl;
    const hacia = vx * nx + vz * nz; if (hacia >= 0) return true;
    const rx = vx - hacia * nx * 1.3, rz = vz - hacia * nz * 1.3;   // rebote pequeño
    const resto = 1 - K.choqueFrena * Math.min(1, -hacia / 15);
    c.v = (rx * f.x + rz * f.z) * resto; c.vl = (rx * d.x + rz * d.z) * resto;
    return true;
  }
  // choque entre dos coches (círculos): se separan y se intercambia algo de velocidad. Devuelve la fuerza del golpe
  function chocan(a, b) {
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), min = a.radio + b.radio;
    if (d >= min || d < 1e-6 || Math.abs(a.y - b.y) > 2) return 0;
    const nx = dx / d, nz = dz / d, s = (min - d) / 2;
    const ma = a.masa || 1, mb = b.masa || 1, tot = ma + mb;
    a.x -= nx * s * 2 * mb / tot; a.z -= nz * s * 2 * mb / tot; b.x += nx * s * 2 * ma / tot; b.z += nz * s * 2 * ma / tot;
    const va = velocidad(a), vb = velocidad(b);
    const rel = (va.x - vb.x) * nx + (va.z - vb.z) * nz; if (rel <= 0) return 0;
    const j = rel * 0.8;
    ponVelocidad(a, va.x - j * nx * mb / tot, va.z - j * nz * mb / tot);
    ponVelocidad(b, vb.x + j * nx * ma / tot, vb.z + j * nz * ma / tot);
    return rel;
  }
  function velocidad(c) { const f = adelante(c), d = derecha(c); return { x: f.x * c.v + d.x * c.vl, z: f.z * c.v + d.z * c.vl }; }
  function ponVelocidad(c, vx, vz) { const f = adelante(c), d = derecha(c); c.v = vx * f.x + vz * f.z; c.vl = vx * d.x + vz * d.z; }
  const rapidez = c => Math.hypot(c.v, c.vl);
  return { nuevo, paso, chocan, adelante, derecha, velocidad, ponVelocidad, rapidez };
})();
