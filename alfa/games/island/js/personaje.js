// Fans of Island · PERSONAJE: lo que hace cualquiera de los dos (CrazyBunny o su aliado) con lo que le llega de entrada.js:
// correr, saltar (salto variable, coyote y pulsación adelantada), flotar con las orejas, coger al compañero, llevarlo y lanzarlo.
// Las cifras están en cifras.js; el dibujo, en arte-personajes.js.
'use strict';
function isPersonaje(def, x, y) {
  return { def, x, y, w: IS_C.personaje.w, h: IS_C.personaje.h, vx: 0, vy: 0, mira: 1, suelo: false, plataforma: null,
    coyote: 0, bufer: 0, saltando: false, flotando: false, flotarResto: 0, lanzado: false,
    lleva: null, llevadoPor: null, estado: 'normal', burbujaT: 0, poder: null, brote: null, companero: null, invulnerable: 0, anim: { t: 0, squash: 0, orejas: 0, iman: 0, agua: 0 } };
}
function isPersonajeActualiza(p, inp, dt, mundo, companero) {
  p.anim.t += dt;
  if (p.llevadoPor) { isEncima(p, p.llevadoPor); return; }
  if (p.estado === 'burbuja') { isBurbujaActualiza(p, dt, companero); return; }
  const C = IS_C, cargando = !!p.lleva;
  p.coyote = p.suelo ? C.coyote : p.coyote - dt;
  p.bufer = inp.saltoPulsa ? C.bufer : p.bufer - dt;
  // correr
  const quiere = (inp.der - inp.izq) * C.correr * (cargando ? C.cargar.correr : 1);
  const acel = p.suelo ? (quiere ? C.acelSuelo : C.frenoSuelo) : C.acelAire;
  if (!p.lanzado) p.vx = p.vx < quiere ? Math.min(quiere, p.vx + acel * dt) : Math.max(quiere, p.vx - acel * dt);
  else if (p.suelo) p.lanzado = false;
  if (quiere) p.mira = quiere > 0 ? 1 : -1;
  // saltar y flotar
  if (p.bufer > 0 && p.coyote > 0) {
    p.vy = -C.salto * (cargando ? C.cargar.salto : 1); p.suelo = false; p.plataforma = null; p.coyote = p.bufer = 0;
    p.saltando = true; p.flotarResto = C.flotar.tiempo; p.anim.squash = -0.25; play('jump');
  }
  if (p.saltando && !inp.salto && p.vy < 0) { p.vy *= C.saltoCorte; p.saltando = false; }
  if (p.vy >= 0) p.saltando = false;
  const flotaba = p.flotando;
  p.flotando = !p.suelo && p.vy > 0 && inp.salto && p.flotarResto > 0 && !p.lanzado;
  if (p.flotando && !flotaba) p.vy = Math.min(p.vy, C.flotar.aleteo);   // el primer aleteo frena la caída de golpe
  if (p.flotando) { p.flotarResto -= dt; p.vy = Math.min(p.vy + C.flotar.gravedad * dt, C.flotar.caida); }
  else p.vy = Math.min(p.vy + C.gravedad * dt, C.caida);
  if (p.suelo) p.flotarResto = C.flotar.tiempo;
  // poderes (pueden gastar la pulsación de acción), y después coger, llevar y lanzar
  isPoderActualiza(p, inp, dt, mundo);
  if (inp.accionPulsa) {
    if (p.lleva) isLanza(p);
    else if (companero && isPuedeCoger(p, companero)) isCoge(p, companero);
  }
  if (isMueve(p, mundo.plataformas, dt)) { p.anim.squash = 0.3; play('land', 0.5); }
  p.anim.squash *= Math.max(0, 1 - dt * 9);
  p.anim.iman *= Math.max(0, 1 - dt * 6); p.anim.agua *= Math.max(0, 1 - dt * 8);
  p.anim.orejas = p.flotando ? Math.sin(p.anim.t * 26) : p.anim.orejas * Math.max(0, 1 - dt * 10);
}
const isCentro = p => ({ x: p.x + p.w / 2, y: p.y + p.h / 2 });
function isPuedeCoger(p, c) { return c.estado === 'normal' && !c.lleva && !c.llevadoPor && Math.abs(isCentro(p).x - isCentro(c).x) < IS_C.coger.dx && Math.abs(p.y - c.y) < IS_C.coger.dy; }
function isCoge(p, c) { p.lleva = c; c.llevadoPor = p; c.vx = c.vy = 0; c.lanzado = false; c.flotando = false; isEncima(c, p); play('pop'); }
function isLanza(p) {
  const c = p.lleva; p.lleva = null; c.llevadoPor = null; c.lanzado = true; c.suelo = false; c.plataforma = null; c.mira = p.mira;
  c.vx = p.mira * IS_C.lanzar.vx + p.vx * 0.5; c.vy = -IS_C.lanzar.vy; c.flotarResto = IS_C.flotar.tiempo * 0.5; play('deploy', 0.6);
}
function isEncima(c, p) { c.x = p.x + (p.w - c.w) / 2; c.y = p.y - c.h + 4; c.mira = p.mira; }
function isSuelta(p) { if (p.lleva) { p.lleva.llevadoPor = null; p.lleva.lanzado = false; p.lleva = null; } if (p.llevadoPor) { p.llevadoPor.lleva = null; p.llevadoPor = null; } }
// la burbuja de hilo: quien se cae reaparece dentro de una, junto al compañero, y sube despacio hasta que la tocan
function isABurbuja(p, junto) { isSuelta(p); if (p.poder) isPoderFin(p); p.estado = 'burbuja'; p.burbujaT = 0; p.vx = p.vy = 0; p.lanzado = p.flotando = false; p.x = junto.x - junto.mira * 44; p.y = junto.y - 90; play('pop'); }
function isBurbujaActualiza(p, dt, junto) {   // sube despacio, se queda a la vista y va flotando hacia el compañero para que pueda tocarla
  p.burbujaT += dt; p.y -= IS_C.burbuja.subida * dt;
  if (junto) { p.x += (junto.x - junto.mira * 32 - p.x) * Math.min(1, dt * 1.5) + Math.sin(p.anim.t * 2) * 5 * dt; p.y = Math.max(p.y, junto.y - 60); }
}
function isRevienta(p, junto) { p.estado = 'normal'; p.vy = 0; p.vx = 0; p.suelo = false; p.y = Math.min(p.y, junto.y - 12); p.flotarResto = IS_C.flotar.tiempo; play('pop'); }
