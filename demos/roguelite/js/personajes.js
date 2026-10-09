// Fans of Roguelite (prototipo) · Los que salen en la escena (el conejo, la ardilla, el rival y lo que hay en el camino):
// dónde están, qué animación hacen y cómo se dibujan, con su sombra y el destello blanco al recibir un golpe.
'use strict';

const CONEJO = { x: 58, y: SUELO, z: 0, alto: 50, anim: 'andar', t0: 0, blanco: 0 };
const ARDILLA = { x: 30, y: SUELO, z: 0, alto: 20, anim: 'andar', t0: 0, blanco: 0, activa: false };
let RIVAL = null;   // { def, e, x, y, z, alto, anim, ... }
let PROP = null;    // el puesto de Lola o el abogado: { tipo, wx (sitio en el mundo) }
let H = null;       // las cifras del conejo (reglas.js)

function ponAnim(ent, a) { if (ent.anim !== a) { ent.anim = a; ent.t0 = RELOJ.t; } }
// qué fotograma toca y cuánto se levanta del suelo (los saltitos al andar)
function fotoDe(ent) {
  const t = RELOJ.t - ent.t0, f = n => Math.floor(t * n);
  if (ent === CONEJO) {
    const S = SPR.heroe;
    if (ent.anim === 'andar') { const i = f(13) % 8; return [S.andar[i], S.hop[i]]; }
    if (ent.anim === 'guardia') return [S.guardia[f(5) % 4], 0];
    if (ent.anim === 'quieto') return [S.quieto[f(4) % 4], 0];
    if (ent.anim === 'gana') return [S.gana[f(5) % 2], 0];
    return [S[ent.anim] || S.quieto[0], 0];
  }
  if (ent === ARDILLA) {
    const S = SPR.ardilla;
    if (ent.anim === 'andar') { const i = f(14) % 6; return [S.andar[i], S.hop[i]]; }
    if (ent.anim === 'golpe') return [S.golpe, 0];
    return [S.quieto[f(3) % 2], 0];
  }
  if (ent.tipo === 'abogado') return [SPR.abogado.quieto[f(3) % 2], 0];
  const S = SPR[ent.def.spr], a = ent.anim;
  if (ent.def.spr === 'starbot') { if (a === 'andar' || a === 'quieto') return [S.vuela[f(10) % 4], 0]; return [S[a], 0]; }
  if (ent.def.spr === 'caja' && a === 'andar') { const i = f(9) % 4; return [S.salta[i], S.hop[i]]; }
  if (ent.def.spr === 'jefe' && (a === 'andar' || a === 'quieto')) return [S.quieto[f(5) % 4], 0];
  if (ent.def.spr === 'jefe' && a === 'especial') return [S.especial[f(8) % 2], 0];
  if (a === 'andar') return [S.andar[f(8) % 4], 0];
  if (a === 'quieto') return [S.quieto[f(3) % 2], 0];
  return [S[a] || S.quieto[0], 0];
}

function sombra(ctx, x, ancho, z) {
  const r = Math.max(3, Math.round(ancho - z * 0.12));
  ovaloPx(ctx, x, SUELO + 1, r, 1, FONDO.ti('#b47a48'));
  if (z < 20) ovaloPx(ctx, x, SUELO + 1, Math.max(2, r - 3), 0, FONDO.ti('#9a6438'));
}

function pintaEnt(ctx, ent, ancho) {
  const [spr, dz] = fotoDe(ent);
  let z = ent.z + dz;
  if (ent.def && ent.def.vuela && ent.anim !== 'muere') z += Math.round(Math.sin(RELOJ.t * 3) * 2);
  sombra(ctx, ent.x, ancho, z);
  if (ent.parpadeo && Math.floor(RELOJ.t * 20) % 2) return;
  pintaSpr(ctx, spr, ent.x, ent.y - z, ent.blanco > 0);
}

// el puesto de Lola (con su vapor) o el abogado
function pintaProp(ctx, mx) {
  if (!PROP) return;
  const x = Math.round(PROP.wx - mx);
  if (x < -60 || x > PAN.W + 60) return;
  if (PROP.tipo === 'puesto') {
    sombra(ctx, x, 20, 0);
    pintaSpr(ctx, SPR.puesto, x, SUELO);
    for (let k = 0; k < 5; k++) { const ph = (RELOJ.t * 0.8 + k * 0.2) % 1, vx = x - 8 + Math.round(Math.sin(ph * 6 + k) * 1.5), vy = SUELO - 34 - Math.round(ph * 14); ctx.fillStyle = ph < 0.6 ? '#ffffff' : '#d8d8f0'; ctx.fillRect(vx, vy, 1, 1); }
  } else {
    PROP.x = x; PROP.y = SUELO; PROP.z = 0; PROP.alto = 32;
    pintaEnt(ctx, PROP, 9);
  }
}

// barra de vida pequeña sobre el rival, con su nombre
function barraRival(ctx) {
  if (!RIVAL || RIVAL.anim === 'muere') return;
  const w = RIVAL.def.jefe ? 56 : 34, x = Math.round(RIVAL.x - w / 2), y = Math.round(RIVAL.y - RIVAL.z - RIVAL.alto - 14 - (RIVAL.def.vuela || 0) * 0);
  const k = Math.max(0, RIVAL.vidaVista / RIVAL.e.vidaMax), kr = Math.max(0, RIVAL.e.vida / RIVAL.e.vidaMax);
  escribe(ctx, tr(RIVAL.def.n), RIVAL.x, y - 10, { alin: 'centro', c: RIVAL.def.jefe ? '#ffb0b8' : '#fff6ea' });
  ctx.fillStyle = OL; ctx.fillRect(x - 1, y - 1, w + 2, 5);
  ctx.fillStyle = '#4a1a2a'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, Math.round(w * k), 3);
  ctx.fillStyle = '#ff3348'; ctx.fillRect(x, y, Math.round(w * kr), 3);
  ctx.fillStyle = '#ff8a94'; ctx.fillRect(x, y, Math.round(w * kr), 1);
}

function pintaPersonajes(ctx, mx) {
  pintaProp(ctx, mx);
  if (RIVAL) { const ancho = RIVAL.def.jefe ? 18 : RIVAL.def.spr === 'caja' ? 12 : 9; pintaEnt(ctx, RIVAL, ancho); }
  if (ARDILLA.activa) pintaEnt(ctx, ARDILLA, 5);
  pintaEnt(ctx, CONEJO, 10);
}

function avanzaPersonajes(dt, real) {
  for (const e of [CONEJO, ARDILLA, RIVAL, PROP]) if (e && e.blanco > 0) e.blanco -= real;
  if (RIVAL) RIVAL.vidaVista += (RIVAL.e.vida - RIVAL.vidaVista) * Math.min(1, dt * 4);
}
