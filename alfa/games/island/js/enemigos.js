// Fans of Island · ENEMIGOS: los becarios de Microblizz (robots de caja con su café), que patrullan su plataforma de borde a borde. Tocarlos de lado da un
// golpe (empujón, se pierde el poder y un segundo de invulnerabilidad); caerles encima los despide. El escudo de la zanahoria dorada
// aguanta un golpe. Las cifras están aquí, en IS_ENEMIGO_C.
'use strict';
const IS_ENEMIGO_C = { w: 22, h: 30, correr: 45, empujon: { vx: 190, vy: 240 }, invulnerable: 1.2, pisoton: 270, reaparece: 25 };
function isCargaEnemigos(N) { return (N.enemigos || []).map((e, i) => ({ ...e, id: i, w: IS_ENEMIGO_C.w, h: IS_ENEMIGO_C.h, x0: e.x, vx: IS_ENEMIGO_C.correr * (e.dir || 1), vy: 0, mira: e.dir || 1, suelo: false, plataforma: null, vivo: true, reaparece: 0, anim: 0, squash: 0 })); }
function isEnemigosActualiza(m, jugadores, dt) {
  for (const e of m.enemigos) {
    if (!e.vivo) { e.reaparece -= dt; if (e.reaparece <= 0) { e.vivo = true; e.x = e.x0; e.vy = 0; } continue; }
    e.anim += dt; e.squash *= Math.max(0, 1 - dt * 9);
    e.vy = Math.min(e.vy + IS_C.gravedad * dt, IS_C.caida);
    const xAntes = e.x; isMueve(e, m.plataformas, dt);
    // da la vuelta en un muro o en el borde de su plataforma (no se tira)
    const pies = e.y + e.h, delante = e.x + e.w / 2 + e.mira * (e.w / 2 + 3);
    if (e.suelo && (e.x === xAntes || !isSueloBajo(delante, pies, m.plataformas, 5))) { e.mira = -e.mira; e.vx = IS_ENEMIGO_C.correr * e.mira; }
    for (const p of jugadores) isEnemigoToca(e, p, m);
  }
  for (const p of jugadores) if (p.invulnerable > 0) p.invulnerable -= dt;
}
function isEnemigoToca(e, p, m) {
  if (!e.vivo || p.estado !== 'normal' || p.llevadoPor || !isSolapa(e, p)) return;
  if (p.vy > 0 && p.y + p.h - p.vy / 60 <= e.y + 7) {   // cae desde arriba: pisotón
    e.vivo = false; e.reaparece = IS_ENEMIGO_C.reaparece; p.vy = -IS_ENEMIGO_C.pisoton; p.anim.squash = -0.3; play('despido');
    if (typeof toast === 'function') toast(tr('¡Becario despedido!'));
    return;
  }
  if (p.invulnerable > 0) return;
  p.invulnerable = IS_ENEMIGO_C.invulnerable; p.suelo = false; p.plataforma = null; p.lanzado = true;
  p.vx = (isCentro(p).x < isCentro(e).x ? -1 : 1) * IS_ENEMIGO_C.empujon.vx; p.vy = -IS_ENEMIGO_C.empujon.vy; p.anim.squash = 0.4;
  if (p.lleva) isSuelta(p);
  if (p.poder && p.poder.tipo === 'escudo') { isPoderFin(p); play('clank'); return; }   // el escudo se lleva el golpe
  if (p.poder) isPoderFin(p); play('hit');
}
