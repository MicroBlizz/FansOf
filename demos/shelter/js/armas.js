// Fans of Shelter · ARMAS DE LA NOCHE: todo ataca solo, como en Vampire Survivors. Las zanahorias giran alrededor de CrazyBunny,
// la zanahoria de fuego lanza bolas al enemigo más cercano, los orbes giran al revés y más lejos, las trampas pinchan a quien las pisa
// y las torretas disparan piedras. Aquí también los proyectiles y quién hace daño a quién.
'use strict';

const PROY = [];          // bolas de fuego y piedras: { x, y, vx, vy, t, dano, tipo }
const ARMAS = { ang: 0, tFuego: 0 };

const danoZanahoria = () => 1 + J.arma.nivel + J.arma.dano;
const radioZanahoria = () => 32 + J.arma.nivel * 4;

function avanzaArmas(dt) {
  ARMAS.ang += dt * (2.6 + J.arma.giro * 0.6);
  // las zanahorias que giran
  const n = J.arma.zanahorias, r = radioZanahoria(), dz = danoZanahoria();
  for (let k = 0; k < n; k++) {
    const a = ARMAS.ang + k * Math.PI * 2 / n, zx = J.x + Math.cos(a) * r, zy = J.y - 18 + Math.sin(a) * r * 0.75;
    golpeaEnemigosCerca(zx, zy, 17, dz, 'zana', 0.35);
  }
  // los orbes, al revés
  for (let k = 0; k < J.arma.orbes; k++) {
    const a = -ARMAS.ang * 1.4 + k * Math.PI * 2 / J.arma.orbes, ox = J.x + Math.cos(a) * 60, oy = J.y - 18 + Math.sin(a) * 60 * 0.75;
    golpeaEnemigosCerca(ox, oy, 12, 1 + Math.floor(J.arma.dano / 2), 'orbe', 0.3);
  }
  // la zanahoria de fuego: una bola cada cierto tiempo al enemigo más cercano
  if (J.arma.fuego > 0) {
    ARMAS.tFuego -= dt;
    if (ARMAS.tFuego <= 0) {
      const e = enemigoMasCerca(J.x, J.y, 280);
      if (e) { dispara(J.x, J.y - 20, e.x, e.y - 14, 190, 2 + J.arma.fuego + J.arma.dano, 'fuego'); ARMAS.tFuego = 1.3 / (J.arma.fuego * 0.6 + 0.4) / J.arma.cadencia; SONIDO.fuego(); }
      else ARMAS.tFuego = 0.2;
    }
  }
  // las torretas y las trampas
  for (const o of MAPA.construido) {
    o.t -= dt;
    const cx = (o.i + 0.5) * CAS, cy = (o.j + 0.5) * CAS;
    if (o.tipo === 'torreta' && o.t <= 0) {
      const e = enemigoMasCerca(cx, cy, 180);
      if (e) { dispara(cx, cy - 14, e.x, e.y - 14, 220, 1, 'piedra'); o.t = 1.1; SONIDO.torreta(); } else o.t = 0.3;
    }
    if (o.tipo === 'trampa' && o.t <= 0) {
      let pinchado = false;
      for (const e of ENEMIGOS) if (!e.vuela && Math.abs(e.x - cx) < 17 && Math.abs(e.y - 4 - cy) < 17) { hiereEnemigo(e, 2, 0, 0); pinchado = true; }
      if (pinchado) { o.t = 0.6; o.vida--; chispas(cx, cy, PALETA.t, 3, 20); }
    }
  }
  MAPA.construido = MAPA.construido.filter(o => o.vida > 0);
  // los proyectiles
  for (const p of PROY) {
    p.x += p.vx * dt; p.y += p.vy * dt; p.t -= dt;
    if (p.tipo === 'fuego' && Math.random() < 0.5) FX.part.push({ x: p.x, y: p.y, vx: rand(-10, 10), vy: rand(-20, -5), t: 0.25, color: Math.random() < 0.5 ? PALETA.F : PALETA.f });
    const e = enemigoMasCerca(p.x, p.y, 16);
    if (e) { hiereEnemigo(e, p.dano, p.vx, p.vy); if (p.tipo === 'fuego') { chispas(p.x, p.y, PALETA.F, 6, 40); for (const e2 of ENEMIGOS) if (e2 !== e && Math.hypot(e2.x - p.x, e2.y - p.y) < 28) hiereEnemigo(e2, Math.ceil(p.dano / 2), 0, 0); } p.t = 0; }
    else if (p.tipo === 'piedra' && choca(p.x - 1, p.y - 1, 2, 2)) p.t = 0;
  }
  for (let k = PROY.length - 1; k >= 0; k--) if (PROY[k].t <= 0) PROY.splice(k, 1);
}
function dispara(x, y, ax, ay, vel, dano, tipo) {
  const dx = ax - x, dy = ay - y, d = Math.hypot(dx, dy) || 1;
  PROY.push({ x, y, vx: dx / d * vel, vy: dy / d * vel, t: 1.6, dano, tipo });
}
// daña a todos los enemigos a menos de r de (x, y). cd: cada enemigo solo recibe un golpe de esa arma cada cd segundos
function golpeaEnemigosCerca(x, y, r, dano, arma, cd) {
  for (const e of ENEMIGOS) {
    if (Math.abs(e.x - x) > r + e.r || Math.abs(e.y - 9 - y) > r + e.r) continue;
    if ((e.cd[arma] || 0) > 0) continue;
    e.cd[arma] = cd;
    hiereEnemigo(e, dano, e.x - J.x, e.y - J.y);
  }
}

function pintaArmas(ctx, cam) {
  if (NOCHE.fase !== 'noche') return;
  const n = J.arma.zanahorias, r = radioZanahoria(), s = J.arma.fuego ? 'zanahoria_fuego' : 'zanahoria';
  for (let k = 0; k < n; k++) {
    const a = ARMAS.ang + k * Math.PI * 2 / n, zx = J.x + Math.cos(a) * r - cam.x, zy = J.y - 18 + Math.sin(a) * r * 0.75 - cam.y;
    ctx.save(); ctx.translate(Math.round(zx), Math.round(zy)); ctx.rotate(a + Math.PI / 2);
    const esc = 1 + J.arma.nivel * 0.12; ctx.scale(esc, esc);
    const z = spr(s); ctx.drawImage(z, -Math.round(z.width / 2), -Math.round(z.height / 2));
    ctx.restore();
  }
  for (let k = 0; k < J.arma.orbes; k++) {
    const a = -ARMAS.ang * 1.4 + k * Math.PI * 2 / J.arma.orbes;
    pintaSpr(ctx, 'orbe', J.x + Math.cos(a) * 60 - cam.x, J.y - 18 + Math.sin(a) * 60 * 0.75 - cam.y, { ancla: 'centro' });
  }
}
function pintaProyectiles(ctx, cam) {
  for (const p of PROY) {
    if (p.tipo === 'fuego') pintaSpr(ctx, 'fuego_bola', p.x - cam.x, p.y - cam.y, { ancla: 'centro' });
    else { caja(ctx, p.x - cam.x - 2, p.y - cam.y - 2, 4, 4, PALETA.K); caja(ctx, p.x - cam.x - 1, p.y - cam.y - 1, 2, 2, PALETA.t); }
  }
}
