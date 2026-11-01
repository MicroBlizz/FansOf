// Fans of Chef · ENEMIGOS: la comida viva del sótano y el botín que suelta. Tres bichos: el TOMATE se acerca y, a tu lado, enciende la
// mecha y explota (si lo cortas antes, suelta el doble); el CEBOLLÓN es lento pero, cuando te tiene alineado, embiste; la GELATINA
// salta hacia ti a brincos. Los bichos de una sala despiertan al entrar en ella. hiereEnemigo lo llama el cuchillo del jugador.
'use strict';

const ENEMIGOS = [];
const BOTIN = [];   // lo que hay por el suelo: { x, y, que, t }

function enemigoNuevo(tipo, x, y) {
  const def = BICHOS[tipo];
  ENEMIGOS.push({ tipo, def, x, y, vida: def.vida, muerto: false, despierto: false, t: rand(0, 6), aturdido: 0, herido: 0, mecha: -1, embiste: null, salto: null, espera: rand(0.4, 1.2), vx: 0, vy: 0 });
}
function sueltaBotin(x, y, que) {
  const a = rand(0, 6.283), v = rand(20, 50);
  BOTIN.push({ x, y, que, t: 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, z: 0, vz: rand(50, 90) });
}
// la sala que pisa el cocinero despierta a sus bichos
function despiertaSala() {
  const s = salaEn(J.x, J.y - 4);
  if (!s || s.visitada) return;
  s.visitada = true;
  for (const e of ENEMIGOS) if (!e.muerto && salaEn(e.x, e.y - 4) === s) e.despierto = true;
  if (s.nacen.length) aviso(tr('¡Comida viva!'), 1.2, PALETA.O);
}
function hiereEnemigo(e, n, dx, dy) {
  e.vida -= n; e.herido = 0.15; e.aturdido = Math.max(e.aturdido, 0.25); e.despierto = true;
  chispas(e.x, e.y - e.def.alto / 2, INGREDIENTES[e.def.suelta].color, 6, 50); SONIDO.golpeEnemigo();
  mueve(e, dx * 8, dy * 8, e.def.ancho * 0.6, 8);
  if (e.vida <= 0) muereEnemigo(e, e.tipo === 'tomate' && e.mecha < 0 ? 2 : 1);
}
function muereEnemigo(e, veces) {
  e.muerto = true; SONIDO.muere(); chispas(e.x, e.y - e.def.alto / 2, INGREDIENTES[e.def.suelta].luz, 12, 70);
  const [a, b] = e.def.cuantos;
  for (let v = 0; v < veces; v++) { const n = a + Math.floor(Math.random() * (b - a + 1)); for (let i = 0; i < n; i++) sueltaBotin(e.x, e.y, e.def.suelta); }
  JORNADA.bajas++;
}
function explota(e) {
  e.muerto = true; SONIDO.explota(); tiembla(1); chispas(e.x, e.y - 10, PALETA.O, 18, 110); chispas(e.x, e.y - 10, PALETA.R, 10, 70);
  if (Math.hypot(J.x - e.x, J.y - e.y) < e.def.radio) hiereJugador(e.def.dano, Math.sign(J.x - e.x) || 0, Math.sign(J.y - e.y) || 1);
  for (const o of ENEMIGOS) if (o !== e && !o.muerto && Math.hypot(o.x - e.x, o.y - e.y) < e.def.radio) hiereEnemigo(o, 1, Math.sign(o.x - e.x), Math.sign(o.y - e.y));
  sueltaBotin(e.x, e.y, 'tomate');   // explotado deja solo uno (cortarlo a tiempo da el doble)
  JORNADA.bajas++;
}
function tocaJugador(e) {
  const r = hiereJugador(e.def.dano, Math.sign(J.x - e.x) || 0, Math.sign(J.y - e.y) || 1);
  if (r === 'bloqueado') { e.aturdido = 1.1; e.embiste = null; e.salto = null; mueve(e, Math.sign(e.x - J.x) * 18, Math.sign(e.y - J.y) * 18, e.def.ancho * 0.6, 8); }
  else if (r) e.aturdido = 0.6;
}

function avanzaEnemigos(dt) {
  despiertaSala();
  for (const e of ENEMIGOS) {
    if (e.muerto) continue;
    e.t += dt; e.herido = Math.max(0, e.herido - dt);
    if (e.aturdido > 0) { e.aturdido -= dt; continue; }
    if (!e.despierto) continue;
    const dx = J.x - e.x, dy = (J.y - 4) - e.y, d = Math.hypot(dx, dy) || 1;
    const toca = Math.abs(dx) < (e.def.ancho + J_ANCHO) / 2 - 2 && Math.abs(dy) < 10;
    if (e.tipo === 'tomate') {
      if (e.mecha >= 0) { e.mecha -= dt; if (e.mecha <= 0) explota(e); continue; }
      if (d < 34) { e.mecha = e.def.mecha; SONIDO.mecha(); continue; }
      mueve(e, dx / d * e.def.vel * dt, dy / d * e.def.vel * dt, e.def.ancho * 0.6, 8);
    } else if (e.tipo === 'cebollon') {
      if (e.embiste) {   // la embestida: recto hasta chocar con algo o agotarse
        const ex = e.x, ey = e.y;
        mueve(e, e.embiste.x * e.def.embiste * dt, e.embiste.y * e.def.embiste * dt, e.def.ancho * 0.6, 8);
        e.embiste.t -= dt;
        if (toca) { tocaJugador(e); e.embiste = null; }
        else if (e.embiste.t <= 0 || (Math.abs(e.x - ex) < 0.01 && Math.abs(e.y - ey) < 0.01)) { e.embiste = null; e.aturdido = 0.7; chispas(e.x, e.y - 10, PALETA.S, 5, 40); }
        continue;
      }
      e.espera -= dt;
      const alineado = (Math.abs(dx) < 14 && Math.abs(dy) < 140) || (Math.abs(dy) < 14 && Math.abs(dx) < 140);
      if (alineado && e.espera <= 0 && d > 30) { e.embiste = { x: Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0, y: Math.abs(dx) > Math.abs(dy) ? 0 : Math.sign(dy), t: 0.9 }; e.espera = rand(1.5, 2.5); SONIDO.embiste(); continue; }
      mueve(e, dx / d * e.def.vel * dt, dy / d * e.def.vel * dt, e.def.ancho * 0.6, 8);
      if (toca) tocaJugador(e);
    } else if (e.tipo === 'gelatina') {
      if (e.salto) {
        mueve(e, e.salto.x * e.def.salto * dt, e.salto.y * e.def.salto * dt, e.def.ancho * 0.6, 8);
        e.salto.t -= dt; e.salto.z = Math.sin((1 - e.salto.t / 0.45) * Math.PI) * 10;
        if (e.salto.t <= 0) { e.salto = null; e.espera = rand(0.6, 1.1); if (d < 28) tocaJugador(e); }
        continue;
      }
      e.espera -= dt;
      if (e.espera <= 0 && d < 190) { e.salto = { x: dx / d, y: dy / d, t: 0.45, z: 0 }; SONIDO.salta(); }
      else if (toca) tocaJugador(e);
    }
  }
  // el botín cae, bota y se queda en el suelo
  for (const b of BOTIN) {
    b.t += dt;
    if (b.t < 0.6) { b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.vz -= 300 * dt; if (b.z < 0) { b.z = 0; b.vz *= -0.4; b.vx *= 0.5; b.vy *= 0.5; } if (chocaCaja(b.x - 2, b.y - 2, 4, 4)) { b.vx = -b.vx; b.vy = -b.vy; } }
    else b.z = Math.abs(Math.sin(b.t * 4)) * 2;
  }
  for (let i = ENEMIGOS.length - 1; i >= 0; i--) if (ENEMIGOS[i].muerto) ENEMIGOS.splice(i, 1);
}

function pintaEnemigo(ctx, cam, e) {
  const x = e.x - cam.x, y = e.y - cam.y, z = e.salto ? e.salto.z : 0;
  ctx.globalAlpha = 0.3; circulo(ctx, x, y, Math.round(e.def.ancho * 0.35), PALETA.K); ctx.globalAlpha = 1;
  if (e.herido > 0 && Math.floor(e.herido * 30) % 2) { ctx.globalAlpha = 0.6; }
  pintaSpr(ctx, e.tipo, x, y - z, { t: e.t, mecha: e.mecha >= 0, espejo: J.x < e.x });
  ctx.globalAlpha = 1;
  if (e.mecha >= 0 && Math.floor(e.mecha * 10) % 2) { ctx.globalAlpha = 0.35; circulo(ctx, x, y - 8, e.def.radio, PALETA.O); ctx.globalAlpha = 1; }
  if (e.aturdido > 0.3) letra(ctx, '*', x, y - e.def.alto - 4, PALETA.Y, 'center', 8);
  if (!e.despierto) return;
  // la barra de vida solo si está tocado
  if (e.vida < e.def.vida) { caja(ctx, x - 10, y - e.def.alto - 5, 20, 3, PALETA.K); caja(ctx, x - 9, y - e.def.alto - 4, Math.round(18 * e.vida / e.def.vida), 1, PALETA.R); }
}
function pintaBotin(ctx, cam) {
  for (const b of BOTIN) { ctx.globalAlpha = 0.25; circulo(ctx, b.x - cam.x, b.y - cam.y, 3, PALETA.K); ctx.globalAlpha = 1; pintaSpr(ctx, 'ing_' + b.que, b.x - cam.x, b.y - cam.y - b.z); }
}
