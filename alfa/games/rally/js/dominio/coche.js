// Fans of Rally · dominio · COCHE: la física arcade de un coche. El morro apunta a `ang`; la marcha (vx, vy) sigue al morro más o menos
// deprisa según el agarre del suelo, y esa diferencia es el derrape. Recibe los mandos (giro -1..1, gas 0..1, freno 0..1), el suelo
// que pisa y el tiempo, y devuelve el coche nuevo: nunca cambia el que le dan. Pura: sin pantalla ni reloj.
'use strict';
RA.Coche = (() => {
  // las cifras de un coche con su piloto: las de AJUSTES.coche multiplicadas por las del piloto (los rivales van con 1)
  function ficha(reglas, piloto = {}) {
    return RA.congela({
      ...reglas,
      velocidadMax: reglas.velocidadMax * (piloto.velocidad || 1),
      agarre: reglas.agarre * (piloto.agarre || 1),
      aceleracion: reglas.aceleracion * (piloto.aceleracion || 1),
    });
  }
  const nuevo = (x, y, ang) => RA.congela({ x, y, ang, vel: 0, vx: 0, vy: 0, derrape: 0 });

  function velocidadNueva(c, m, f, s, dt) {
    const punta = f.velocidadMax * s.punta;
    let vel = c.vel;
    if (m.freno > 0 && vel > 0) vel -= f.frenada * m.freno * dt;
    else if (m.freno > 0) vel -= f.aceleracion * 0.5 * m.freno * dt;
    vel += f.aceleracion * m.gas * dt * (vel > punta ? 0 : 1);
    vel -= vel * (f.rozamiento * (1 - m.gas) + s.arrastre) * dt;
    if (vel > punta) vel += (punta - vel) * Math.min(1, 2.5 * dt);   // al salir a la arena frena, pero no en seco
    return RA.limita(vel, -f.marchaAtras, f.velocidadMax * 1.2);
  }
  function paso(c, m, f, s, dt) {
    const vel = velocidadNueva(c, m, f, s, dt);
    const fuerzaGiro = Math.min(1, Math.abs(vel) / f.velocidadGiroPleno) * Math.sign(vel || 1);
    const ang = c.ang + m.giro * f.giro * fuerzaGiro * dt * (0.85 + 0.15 * (1 - s.agarre));
    const fx = Math.cos(ang) * vel, fy = Math.sin(ang) * vel;
    const sigue = Math.min(1, f.agarre * s.agarre * dt);
    const vx = c.vx + (fx - c.vx) * sigue, vy = c.vy + (fy - c.vy) * sigue;
    const derrape = Math.abs(RA.difAngulo(Math.atan2(vy, vx), ang)) * (Math.hypot(vx, vy) > 40 ? 1 : 0);
    return RA.congela({ x: c.x + vx * dt, y: c.y + vy * dt, ang, vel, vx, vy, derrape: Math.min(derrape, Math.PI / 2) });
  }
  // dos coches que se tocan se separan, se empujan y se reparten el golpe (devuelve los dos nuevos, o los mismos si no se tocan)
  function choque(a, b, radio) {
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), minimo = radio * 2;
    if (d >= minimo || d === 0) return [a, b];
    const nx = dx / d, ny = dy / d, empuje = (minimo - d) / 2;
    const golpe = (c, s) => RA.congela({ ...c, x: c.x - nx * empuje * s, y: c.y - ny * empuje * s, vel: c.vel * 0.93, vx: c.vx * 0.93 - nx * 20 * s, vy: c.vy * 0.93 - ny * 20 * s });
    return [golpe(a, 1), golpe(b, -1)];
  }
  // contra algo fijo (árbol, roca…): se le saca fuera y rebota perdiendo casi toda la velocidad (devuelve el mismo si no lo toca)
  function choqueFijo(c, o, radio) {
    const dx = c.x - o.x, dy = c.y - o.y, d = Math.hypot(dx, dy), minimo = radio + o.r;
    if (d >= minimo || d === 0) return c;
    const nx = dx / d, ny = dy / d, contra = c.vx * nx + c.vy * ny;
    const vx = (c.vx - 1.5 * Math.min(0, contra) * nx) * 0.45, vy = (c.vy - 1.5 * Math.min(0, contra) * ny) * 0.45;
    return RA.congela({ ...c, x: o.x + nx * minimo, y: o.y + ny * minimo, vx, vy, vel: c.vel * 0.35 });
  }
  const kmh = (c, f) => Math.round(Math.abs(Math.hypot(c.vx, c.vy)) * f.kmh);
  return { ficha, nuevo, paso, choque, choqueFijo, kmh };
})();
