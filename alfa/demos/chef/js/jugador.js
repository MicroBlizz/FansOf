// Fans of Chef · JUGADOR: el cocinero en el sótano. Anda (choca con muros y estorbos), da cuchilladas hacia donde mira (una caja de golpe
// delante), levanta la sartén (anda despacio; lo que le llega de frente rebota y aturde al bicho) y recoge lo que hay por el suelo.
// Su vida y su despensa de la jornada están en J; lo que gana lo apunta JORNADA.
'use strict';

const J = {};   // el jugador (se rellena en jugadorNuevo)
const J_ANCHO = 16, J_ALTO = 10;   // la caja de los pies, para chocar

function jugadorNuevo(x, y) {
  Object.assign(J, { x, y, dir: 'abajo', mx: 0, my: 1, vida: CIFRAS.vida, invul: 0, cuchilloT: 0, golpe: null, paso: 0, andando: false, bloqueando: false, herido: 0 });
}
const vivo = () => J.vida > 0;

function avanzaJugador(dt) {
  if (!vivo()) return;
  J.invul = Math.max(0, J.invul - dt); J.cuchilloT = Math.max(0, J.cuchilloT - dt); J.herido = Math.max(0, J.herido - dt);
  if (J.golpe) { J.golpe.t -= dt; if (J.golpe.t <= 0) J.golpe = null; }
  J.bloqueando = !!ENTRADA.bloqueo && !J.golpe;
  const d = ENTRADA.dir, vel = J.bloqueando ? CIFRAS.velocidadBloqueo : CIFRAS.velocidad;
  J.andando = Math.abs(d.x) + Math.abs(d.y) > 0.05;
  if (J.andando) {
    if (!J.bloqueando) {   // con la sartén levantada se sigue mirando al mismo sitio (se recula)
      if (Math.abs(d.x) > Math.abs(d.y)) { J.dir = d.x > 0 ? 'der' : 'izq'; J.mx = Math.sign(d.x); J.my = 0; }
      else { J.dir = d.y > 0 ? 'abajo' : 'arriba'; J.mx = 0; J.my = Math.sign(d.y); }
    }
    mueve(J, d.x * vel * dt, d.y * vel * dt, J_ANCHO, J_ALTO);
    J.paso += dt * (J.bloqueando ? 4 : 9);
  }
  if (ENTRADA.ataquePulsa && !J.bloqueando && J.cuchilloT <= 0) cuchillada();
  recoge(); compruebaSalidas();
  const m = MAPA.montacargas;
  JORNADA.enMontacargas = !!m && Math.abs(J.x - m.x) < 26 && J.y < m.y + 44 && J.y >= m.y - 2;
  const co = MAPA.cofre;
  if (co && !co.abierto && Math.abs(J.x - co.x) < 24 && Math.abs(J.y - co.y) < 20) abreCofre();
}
// mueve una caja (los pies de `e`) por el mapa, eje a eje, para deslizarse por los muros
function mueve(e, dx, dy, w, h) {
  const hw = w / 2;
  if (dx && !chocaCaja(e.x - hw + dx, e.y - h, w, h)) e.x += dx;
  if (dy && !chocaCaja(e.x - hw, e.y - h + dy, w, h)) e.y += dy;
}

function cuchillada() {
  J.cuchilloT = CIFRAS.cuchilloCada;
  const a = CIFRAS.cuchilloAlcance;
  // la caja del golpe: delante del cocinero, más ancha que alta cuando mira a los lados
  const cx = J.x + J.mx * (a * 0.6), cy = J.y - 16 + J.my * (a * 0.6);
  J.golpe = { x: cx, y: cy, w: J.mx ? a : 30, h: J.my ? a : 28, t: 0.12, dio: new Set() };
  SONIDO.cuchillo();
  for (const e of ENEMIGOS) {
    if (e.muerto) continue;
    if (Math.abs(e.x - cx) < J.golpe.w / 2 + e.def.ancho / 2 && Math.abs(e.y - e.def.alto / 2 - cy) < J.golpe.h / 2 + e.def.alto / 2) {
      hiereEnemigo(e, 1, J.mx, J.my); J.golpe.dio.add(e);
    }
  }
}
function hiereJugador(n, dx, dy) {
  if (J.invul > 0 || !vivo()) return false;
  // con la sartén levantada, lo que viene de frente rebota
  if (J.bloqueando && (dx * J.mx + dy * J.my) < -0.3) { SONIDO.sarten(); chispas(J.x + J.mx * 10, J.y - 12 + J.my * 10, PALETA.Y, 8, 50); return 'bloqueado'; }
  J.vida -= n; J.invul = CIFRAS.invulnerableSeg; J.herido = 0.3; tiembla(0.8); SONIDO.herido();
  mueve(J, dx * 10, dy * 10, J_ANCHO, J_ALTO);
  if (J.vida <= 0) JORNADA.derrota();
  return true;
}
function recoge() {
  for (const b of BOTIN) {
    if (b.t < 0.25) continue;   // acaba de caer: que se vea
    if (Math.hypot(b.x - J.x, b.y - (J.y - 6)) < 18) {
      b.cogido = true; JORNADA.coge(b.que); SONIDO.coge();
      numero(J.x, J.y - 56, '+1', INGREDIENTES[b.que].luz);
    }
  }
  for (let i = BOTIN.length - 1; i >= 0; i--) if (BOTIN[i].cogido) BOTIN.splice(i, 1);
}
function abreCofre() {
  MAPA.cofre.abierto = true; SONIDO.cofre(); aviso(tr('¡Un cofre con provisiones!'), 1.6);
  const tipos = Object.keys(INGREDIENTES);
  for (let i = 0; i < 3; i++) sueltaBotin(MAPA.cofre.x, MAPA.cofre.y, pick(tipos));
}

function pintaJugador(ctx, cam) {
  const x = J.x - cam.x, y = J.y - cam.y;
  if (J.invul > 0 && Math.floor(J.invul * 12) % 2) return;   // parpadea mientras es invulnerable
  const bote = J.andando ? Math.abs(Math.sin(J.paso)) * 2 : 0;
  ctx.globalAlpha = 0.3; circulo(ctx, x, y, 10, PALETA.K); ctx.globalAlpha = 1;
  const nombre = J.dir === 'arriba' ? (IMG.chef_arriba ? 'chef_arriba' : 'chef_abajo') : J.dir === 'abajo' ? 'chef_abajo' : (IMG.chef_lado ? 'chef_lado' : 'chef_abajo');
  pintaSpr(ctx, nombre, x, y - bote, { espejo: J.dir === 'izq' && !!IMG.chef_lado });
  if (J.herido > 0) { ctx.globalAlpha = 0.5; caja(ctx, x - 14, y - 58, 28, 58, PALETA.R); ctx.globalAlpha = 1; }
  // la sartén levantada: un arco de luz delante; la cuchillada: un tajo blanco
  if (J.bloqueando) { ctx.globalAlpha = 0.7; const bx = x + J.mx * 20, by = y - 20 + J.my * 16; circulo(ctx, bx, by, 9, PALETA.K); circulo(ctx, bx, by, 8, PALETA.N); circulo(ctx, bx, by, 4, PALETA.n); ctx.globalAlpha = 1; }
  if (J.golpe) { const g = J.golpe; ctx.globalAlpha = Math.min(1, g.t * 10); cajaMarco(ctx, g.x - g.w / 2 - cam.x, g.y - g.h / 2 - cam.y, g.w, g.h, 'rgba(255,255,255,0.55)', PALETA.w); ctx.globalAlpha = 1; }
}
