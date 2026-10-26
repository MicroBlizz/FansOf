// Fans Of Taxi · COCHE: la física arcade de cualquier coche (el tuyo, los del tráfico, la policía): velocidad hacia delante, deslizamiento
// lateral, giro que depende de la velocidad, derrape, nitro, saltos en las rampas y choques contra los muros de la ciudad y los árboles.
// Las cuestas tiran (la gravedad por la pendiente), cada suelo frena distinto (hierba, tierra, nieve) y caer al agua te devuelve a la
// carretera. Paso fijo y sin azar: misma entrada, mismo resultado (fantasmas y repeticiones gratis). Sin DOM ni three.
'use strict';
const COCHE = (() => {
  const K = TAXI.coche;
  function nuevo(x, z, ang, extra = {}) {
    return { x, z, y: 0, vy: 0, ang, v: 0, vl: 0, derrapando: false, aire: false, nitro: 0, usandoNitro: false, giro: 0, golpe: 0, radio: K.radio, pendiente: 0, suelo: 'asfalto', ...extra };
  }
  const adelante = c => ({ x: Math.sin(c.ang), z: Math.cos(c.ang) });
  const derecha = c => ({ x: Math.cos(c.ang), z: -Math.sin(c.ang) });

  // entrada: { giro: -1..1, gas: 0..1, freno: 0..1, nitro: bool }. Devuelve los sucesos del paso (choque, derrape, salto) para el que llama.
  function paso(c, e, dt, mundo, lim = K) {
    const sucesos = [];
    const S = K.suelos[c.suelo] || K.suelos.asfalto;
    const vmax = ((c.usandoNitro ? lim.vmaxNitro : lim.vmax) || K.vmax) * S[0];
    // acelerar y frenar; sin gas, el motor retiene; cada suelo frena lo suyo; la cuesta tira hacia abajo
    c.usandoNitro = !!(e.nitro && c.nitro > 0 && c.v > 1);
    if (c.usandoNitro) { c.nitro = Math.max(0, c.nitro - K.nitroGasto * dt); c.v += K.nitroAcel * dt; }
    if (e.gas > 0) c.v += (lim.acel || K.acel) * e.gas * dt;
    else if (!c.aire && Math.abs(c.v) > 0.2) c.v -= Math.sign(c.v) * Math.min(Math.abs(c.v), K.retencion * dt);
    if (e.freno > 0) {
      if (c.v > 0.5) c.v -= K.freno * e.freno * dt;
      else if (!e.gas) c.v = Math.max(-K.marchaAtras, c.v - K.acel * 0.6 * e.freno * dt);   // marcha atrás
    }
    c.v -= c.v * (K.rozamiento + S[1]) * dt;
    if (!c.aire) c.v -= K.gravedad * K.pendiente * Math.sin(Math.atan(c.pendiente)) * dt;
    if (c.v > vmax) c.v -= (c.v - vmax) * 2 * dt;
    // girar: poco parado, pleno a partir de giroVel; derrapando gira más y agarra menos
    const quiereDerrape = e.freno > 0 && Math.abs(e.giro) > 0.3 && c.v > K.derrapeMin;
    if (quiereDerrape && !c.derrapando) sucesos.push('derrape-empieza');
    c.derrapando = quiereDerrape || (c.derrapando && Math.abs(c.vl) > 4 && c.v > K.derrapeMin * 0.7);
    const factor = clamp(Math.abs(c.v) / K.giroVel, 0, 1) * Math.sign(c.v || 1) / (1 + K.giroRapido * Math.min(1, Math.abs(c.v) / K.vmax));
    const giroObjetivo = e.giro * K.giro * factor * (c.derrapando ? K.derrapeGiro : 1) * (c.aire ? 0.35 : 1);
    c.giro = lerp(c.giro, giroObjetivo, Math.min(1, 14 * dt));
    const angAntes = c.ang;
    c.ang += c.giro * dt; if (c.ang > Math.PI) c.ang -= 2 * Math.PI; else if (c.ang < -Math.PI) c.ang += 2 * Math.PI;
    // al girar, parte de la velocidad se queda «de lado»; el agarre se la come
    const cambio = c.ang - angAntes;
    c.vl += -cambio * c.v * (c.derrapando ? K.deslizaDerrape : K.desliza);
    const agarre = (c.aire ? 0.4 : c.derrapando ? K.agarreDerrape : K.agarre) * (S[2] === undefined ? 1 : S[2]);   // cada suelo agarra lo suyo
    c.vl -= c.vl * Math.min(1, agarre * dt);
    if (c.derrapando) { c.nitro = Math.min(1, c.nitro + K.nitroCarga.derrape * dt); c.derrapeT = (c.derrapeT || 0) + dt; } else c.derrapeT = 0;
    // moverse
    const f = adelante(c), d = derecha(c), xAntes = c.x, zAntes = c.z;
    c.x += (f.x * c.v + d.x * c.vl) * dt;
    c.z += (f.z * c.v + d.z * c.vl) * dt;
    // el suelo: su altura (las carreteras, los túneles si vas dentro), su pendiente a lo largo del coche y qué es
    let hSuelo = mundo && mundo.altura ? mundo.altura(c.x, c.z, c.y) : 0;
    if (mundo && mundo.altura && !c.aire && hSuelo - c.y > K.escalon) {   // el suelo sube de golpe (un talud, el lado de una trinchera): es un muro
      c.x = xAntes; c.z = zAntes; hSuelo = c.y; const antes = Math.abs(c.v); c.v *= -0.15; c.vl = 0;
      if (antes > K.choqueFuerte && (c.choqueT || 0) <= 0) { c.choqueT = 0.8; sucesos.push('choque'); } else sucesos.push('roce-muro');
    }
    if (mundo && mundo.altura && !c.aire) {
      const atrasH = mundo.altura(c.x - f.x * 2, c.z - f.z * 2, c.y), delanteH = mundo.altura(c.x + f.x * 2, c.z + f.z * 2, c.y);
      c.pendiente = (delanteH - atrasH) / 4;
      c.suelo = mundo.suelo ? mundo.suelo(c.x, c.z, c.y) : 'asfalto';
      if (c.suelo === 'agua') sucesos.push('agua');
    }
    // saltos: por rampa o porque el suelo cae de golpe bajo el coche
    if (c.aire) {
      c.vy -= K.gravedad * dt; c.y += c.vy * dt;
      if (c.y <= hSuelo) { c.y = hSuelo; c.vy = 0; c.aire = false; c.pendiente = 0; sucesos.push('aterriza'); }
    } else {
      let salta = false;
      if (mundo && mundo.rampas) for (const rp of mundo.rampas) if (enRampa(c, rp) && c.v > 8) { c.vy = c.v * K.salto; c.nitro = Math.min(1, c.nitro + K.nitroCarga.salto); sucesos.push('salta'); salta = true; break; }
      if (!salta && c.y - hSuelo > 0.9) { c.vy = Math.abs(c.v) > 10 ? Math.abs(c.v) * Math.max(0, c.pendiente) * 0.5 : 0; salta = true; }   // se acaba el suelo: vuela (o cae)
      if (salta) c.aire = true; else c.y = hSuelo;
    }
    // choques con los edificios, los árboles, las rocas y los pretiles (los que tienen altura, solo si estás a esa altura)
    if (mundo && mundo.cerca) {
      const antes = Math.hypot(c.v, c.vl);
      let choca = false;
      for (const o of mundo.cerca(c.x, c.z)) {
        if (o.y0 !== undefined && (c.y < o.y0 || c.y > o.y1)) continue;
        choca = (o.ax !== undefined ? resuelveTramo(c, o) : o.radio !== undefined ? resuelveCirculo(c, o.x, o.z, o.radio) : resuelveCaja(c, o)) || choca;
      }
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
  // contra un tramo (segmento con grosor): como un círculo en el punto más cercano del segmento
  function resuelveTramo(c, o) {
    const dx = o.bx - o.ax, dz = o.bz - o.az, L2 = dx * dx + dz * dz || 1, t = clamp(((c.x - o.ax) * dx + (c.z - o.az) * dz) / L2, 0, 1);
    return resuelveCirculo(c, o.ax + dx * t, o.az + dz * t, o.radio);
  }
  function resuelveCirculo(c, x, z, radio) {
    let dx = c.x - x, dz = c.z - z; const d = Math.hypot(dx, dz), min = c.radio + radio;
    if (d >= min || d < 1e-6) return false;
    return empuja(c, dx / d, dz / d, min - d);
  }
  // sacar un coche del agua: al cruce más cercano, parado
  function rescata(c, mundo) {
    const n = mundo.nodoCercano(c.x, c.z, undefined);
    c.x = n.x; c.z = n.z; c.y = n.y; c.v = 0; c.vl = 0; c.vy = 0; c.aire = false; c.suelo = 'asfalto';
    const v = n.vecinos.length ? mundo.nodos[n.vecinos[0]] : null; if (v) c.ang = Math.atan2(v.x - n.x, v.z - n.z);
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
  return { nuevo, paso, chocan, rescata, adelante, derecha, velocidad, ponVelocidad, rapidez };
})();
