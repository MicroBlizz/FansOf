// Fans of Shelter · ENEMIGOS: goblins y esqueletos van a pie (chocan con el bosque), los murciélagos vuelan por encima de todo.
// Todos van a por CrazyBunny; al morir sueltan un cristal de experiencia que el conejo atrae de cerca. El jefe es un murciélago
// gigante que sale al final de cada noche.
'use strict';

const ENEMIGOS = [];   // { tipo, x, y, vida, vidaMax, vel, r, vuela, cd: {}, blanco, t, zig }
const CRISTALES = [];  // { x, y, xp }
const TIPO_ENEMIGO = {
  goblin:    { vida: 3, vel: 60, dano: 1, r: 11, vuela: false, xp: 1, spr: 'goblin_' },
  esqueleto: { vida: 6, vel: 44, dano: 1, r: 11, vuela: false, xp: 2, spr: 'esqueleto_' },
  murci:     { vida: 2, vel: 88, dano: 1, r: 11, vuela: true, xp: 1, spr: 'murci_' },
  jefe:      { vida: 70, vel: 48, dano: 2, r: 26, vuela: true, xp: 12, spr: 'jefe_' },
};

function creaEnemigo(tipo, x, y, extra = 1) {
  const d = TIPO_ENEMIGO[tipo];
  const e = { tipo, x, y, vida: Math.ceil(d.vida * extra), vidaMax: Math.ceil(d.vida * extra), vel: d.vel * (0.9 + Math.random() * 0.2), dano: d.dano, r: d.r, vuela: d.vuela, xp: d.xp, cd: {}, blanco: 0, t: Math.random() * 10, zig: Math.random() * 6.28, spr: d.spr, paso: 0 };
  ENEMIGOS.push(e);
  return e;
}
function enemigoMasCerca(x, y, max) {
  let mejor = null, md = max;
  for (const e of ENEMIGOS) { const d = Math.hypot(e.x - x, e.y - 14 - y); if (d < md) { md = d; mejor = e; } }
  return mejor;
}
function hiereEnemigo(e, n, dx, dy) {
  e.vida -= n; e.blanco = 0.08; e.t = 0;
  numero(e.x, e.y - 34, String(n), e.tipo === 'jefe' ? PALETA.Y : PALETA.W);
  chispas(e.x, e.y - 14, e.tipo === 'esqueleto' ? PALETA.w : e.tipo === 'goblin' ? PALETA.E : PALETA.M, 3, 30);
  const d = Math.hypot(dx, dy); if (d && !e.vuela) { e.x += dx / d * 4; e.y += dy / d * 4; }
  SONIDO.golpeEnemigo();
  if (e.vida <= 0) mueraEnemigo(e);
}
function mueraEnemigo(e) {
  const k = ENEMIGOS.indexOf(e); if (k < 0) return;
  ENEMIGOS.splice(k, 1); J.bajas++;
  chispas(e.x, e.y - 14, e.tipo === 'jefe' ? PALETA.Y : PALETA.Q, e.tipo === 'jefe' ? 30 : 6, 45);
  CRISTALES.push({ x: e.x + rand(-4, 4), y: e.y + rand(-4, 4), xp: e.xp });
  if (e.tipo === 'jefe') { NOCHE.jefeVencido = true; J.inv.cristal += 2; aviso(tr('¡Jefe derrotado!'), 2.5, PALETA.Y); tiembla(1.5); SONIDO.jefeMuere(); }
  else SONIDO.muere();
}

function avanzaEnemigos(dt) {
  const px = J.x, py = J.y - 8;
  for (const e of ENEMIGOS) {
    for (const k in e.cd) if (e.cd[k] > 0) e.cd[k] -= dt;
    if (e.blanco > 0) e.blanco -= dt;
    e.t += dt; e.paso += dt * 6;
    let dx = px - e.x, dy = py - (e.y - 8), d = Math.hypot(dx, dy) || 1;
    dx /= d; dy /= d;
    if (e.vuela) { e.zig += dt * 5; dx += Math.cos(e.zig) * 0.5; dy += Math.sin(e.zig * 0.7) * 0.5; }
    // no se amontonan: cada uno se separa un poco del más cercano
    for (const o of ENEMIGOS) {
      if (o === e || o.vuela !== e.vuela) continue;
      const ox = e.x - o.x, oy = e.y - o.y, od = Math.hypot(ox, oy);
      if (od > 0 && od < e.r + o.r + 2) { dx += ox / od * 0.6; dy += oy / od * 0.6; }
    }
    const v = e.vel * dt;
    if (e.vuela) { e.x += dx * v; e.y += dy * v; e.x = clamp(e.x, CAS, (MAPA.w - 1) * CAS); e.y = clamp(e.y, CAS, (MAPA.h - 1) * CAS); }
    else {
      const w = e.r * 2 - 6, h = 10, [nx, ny] = mueveChocando(e.x - w / 2, e.y - h, w, h, dx * v, dy * v);
      // si se queda atascado, rodea: prueba solo un eje
      if (Math.abs(nx + w / 2 - e.x) < 0.01 && Math.abs(ny + h - e.y) < 0.01) {
        const [ax, ay] = mueveChocando(e.x - w / 2, e.y - h, w, h, Math.abs(dx) > Math.abs(dy) ? 0 : Math.sign(dx || 1) * v, Math.abs(dx) > Math.abs(dy) ? Math.sign(dy || 1) * v : 0);
        e.x = ax + w / 2; e.y = ay + h;
      } else { e.x = nx + w / 2; e.y = ny + h; }
    }
    // muerde a CrazyBunny
    if (Math.abs(e.x - J.x) < e.r + 8 && Math.abs(e.y - J.y) < e.r + 8) hiereJugador(e.dano, J.x - e.x, J.y - e.y);
  }
  // los cristales van hacia el conejo cuando está cerca
  const iman = 48 + J.arma.iman * 24;
  for (let k = CRISTALES.length - 1; k >= 0; k--) {
    const c = CRISTALES[k], dx = J.x - c.x, dy = J.y - 14 - c.y, d = Math.hypot(dx, dy);
    if (d < iman) { c.x += dx / d * 180 * dt; c.y += dy / d * 180 * dt; }
    if (d < 9) { CRISTALES.splice(k, 1); ganaXp(c.xp); SONIDO.cristal(); }
  }
}

function pintaEnemigo(ctx, cam, e) {
  const f = Math.floor(e.paso) % 2, x = e.x - cam.x, y = e.y - cam.y, s = e.spr + f;
  const flota = e.vuela ? Math.round(Math.sin(e.t * 6) * 4) - 14 : 0;
  ctx.globalAlpha = 0.25; caja(ctx, x - e.r + 3, y - 3, e.r * 2 - 6, 4, PALETA.K); ctx.globalAlpha = 1;
  const bote = hayImagen(s) && f === 1 && !e.vuela ? -1 : 0;
  pintaSpr(ctx, s, x, y + flota + bote, { ancla: 'pies', espejo: e.x > J.x, blanco: e.blanco > 0 });
  if (e.tipo === 'jefe') { caja(ctx, x - 28, y - 92, 56, 5, PALETA.K); caja(ctx, x - 27, y - 91, Math.round(54 * e.vida / e.vidaMax), 3, PALETA.R); }
}
function pintaCristales(ctx, cam) { for (const c of CRISTALES) pintaSpr(ctx, 'cristal', c.x - cam.x, c.y - cam.y, { ancla: 'centro' }); }
