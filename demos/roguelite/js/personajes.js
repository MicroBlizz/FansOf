// Fans of Roguelite · Los que salen en la escena (el conejo, la ardilla, el rival y lo que hay en el camino: el puesto de
// Lola, el cofre, la ruleta, la hoguera…): dónde están, qué animación hacen y cómo se dibujan, con su sombra, el destello
// blanco al recibir un golpe y el aura dorada de los enemigos de élite.
'use strict';

const CONEJO = { x: 58, y: SUELO, z: 0, alto: 50, anim: 'andar', t0: 0, blanco: 0 };
const ARDILLA = { x: 30, y: SUELO, z: 0, alto: 20, anim: 'andar', t0: 0, blanco: 0, activa: false };
let RIVAL = null;   // { def, e, x, y, z, alto, anim, elite, ... }
let PROP = null;    // lo que hay en el camino un día sin combate: { tipo, wx (sitio en el mundo), ... }
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
  const S = SPR[ent.spr || ent.def.spr], a = ent.anim;
  if (S.vuela && (a === 'andar' || a === 'quieto')) return [S.vuela[f(10) % S.vuela.length], 0];
  if (S.salta && a === 'andar') { const i = f(9) % 4; return [S.salta[i], S.hop[i]]; }
  if (a === 'andar') return S.andar ? [S.andar[f(8) % S.andar.length], 0] : [S.quieto[f(5) % S.quieto.length], 0];
  if (a === 'quieto') return [S.quieto[f(S.quieto.length > 2 ? 5 : 3) % S.quieto.length], 0];
  if (a === 'especial') return [S.especial ? S.especial[f(8) % S.especial.length] : S.carga, 0];
  return [S[a] || S.quieto[0], 0];
}

// la sombra en el suelo (del color del camino de cada mundo)
function sombra(ctx, x, ancho, z) {
  const r = Math.max(3, Math.round(ancho - z * 0.12)), [c1, c2] = FONDO.estilo.sombra || ['#b47a48', '#9a6438'];
  ovaloPx(ctx, x, SUELO + 1, r, 1, FONDO.ti(c1));
  if (z < 20) ovaloPx(ctx, x, SUELO + 1, Math.max(2, r - 3), 0, FONDO.ti(c2));
}
// la silueta de un dibujo en un color (para el aura de los de élite), guardada para no rehacerla
function silueta(s, col) {
  const k = 'sil' + col;
  if (!s[k]) { const c = lienzoNuevo(s.w, s.h), g = c.getContext('2d'); g.drawImage(s.b, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, s.w, s.h); s[k] = c; }
  return s[k];
}

function pintaEnt(ctx, ent, ancho) {
  const [spr, dz] = fotoDe(ent);
  let z = ent.z + dz;
  if (ent.def && ent.def.vuela && ent.anim !== 'muere') z += Math.round(Math.sin(RELOJ.t * 3) * 2);
  sombra(ctx, ent.x, ancho, z);
  if (ent.parpadeo && Math.floor(RELOJ.t * 20) % 2) return;
  const x = Math.round(ent.x) - spr.ox, y = Math.round(ent.y - z) - spr.oy;
  if (ent.elite && ent.anim !== 'muere') {
    const sil = silueta(spr, Math.sin(RELOJ.t * 8) > 0 ? '#ffcb3d' : '#ff8a1f');
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.drawImage(sil, x + dx, y + dy);
    if (Math.random() < 0.15) fx('chispa', { x: ent.x + rnd(-10, 10), y: ent.y - z - rnd(ent.alto), vx: 0, vy: -20, vida: 0.4, col: '#ffcb3d' });
  }
  pintaSpr(ctx, spr, ent.x, ent.y - z, ent.blanco > 0);
}

/* ---------- lo que hay en el camino ---------- */
const PROP_ALTO = { fallen: 38, puesto: 44, abogado: 32, becario: 32, zombi: 34, soporte: 34, starbotRoto: 26, maquina: 44, caja: 26, tumba: 30, hoguera: 30, cofre: 24, gashapon: 40, ruleta: 48 };
function nuevoProp(tipo) { return tipo ? { tipo, wx: VIAJE.mx + PAN.W + 40, x: PAN.W + 40, y: SUELO, z: tipo === 'soporte' ? 14 : 0, alto: PROP_ALTO[tipo] || 30, t0: RELOJ.t, anim: 'quieto', ang: 0, abierto: false, sacude: 0 } : null; }
function pintaProp(ctx, mx) {
  if (!PROP) return;
  const x = Math.round(PROP.wx - mx), t = RELOJ.t, P = PROP;
  P.x = x;
  if (x < -70 || x > PAN.W + 70) return;
  const quieto = (S, n) => S.quieto[Math.floor((t - P.t0) * n) % S.quieto.length];
  switch (P.tipo) {
    case 'puesto':
      sombra(ctx, x, 20, 0); pintaSpr(ctx, SPR.puesto, x, SUELO);
      for (let k = 0; k < 5; k++) { const ph = (t * 0.8 + k * 0.2) % 1, vx = x - 8 + Math.round(Math.sin(ph * 6 + k) * 1.5), vy = SUELO - 34 - Math.round(ph * 14); ctx.fillStyle = ph < 0.6 ? '#ffffff' : '#d8d8f0'; ctx.fillRect(vx, vy, 1, 1); }
      break;
    case 'abogado': case 'becario': case 'zombi': case 'fallen': P.spr = P.tipo; pintaEnt(ctx, P, 9); break;
    case 'soporte': P.spr = 'soporte'; P.def = { vuela: 14 }; pintaEnt(ctx, P, 8); break;
    case 'starbotRoto':
      sombra(ctx, x, 10, 0); pintaSpr(ctx, SPR.starbot.dano, x, SUELO + 2);
      if (Math.sin(t * 5) > 0.7) { ctx.fillStyle = '#ff3348'; ctx.fillRect(x - 1, SUELO - 24, 2, 2); }
      if (Math.random() < 0.05) chispas(x + rnd(-6, 6), SUELO - 14, 2, '#5aaeff', 40);
      break;
    case 'maquina': sombra(ctx, x, 12, 0); pintaSpr(ctx, SPR.maquina, x, SUELO); if (Math.sin(t * 3) > 0.5) { ctx.fillStyle = '#7be04a'; ctx.fillRect(x + 5, SUELO - 30, 2, 1); } break;
    case 'caja': sombra(ctx, x, 12, 0); pintaSpr(ctx, quieto(SPR.caja, 3), x, SUELO); break;
    case 'tumba': sombra(ctx, x, 12, 0); pintaSpr(ctx, SPR.tumba, x, SUELO); break;
    case 'hoguera':
      sombra(ctx, x, 14, 0); pintaSpr(ctx, SPR.hoguera, x, SUELO);
      if (FONDO.L.noche) for (let r = 18; r >= 6; r -= 6) { ctx.save(); ctx.beginPath(); ctx.rect(x - r, SUELO - 8 - r, r * 2, r * 2); ctx.clip(); rellenaTrama(ctx, x - r, SUELO - 8 - r, r * 2, r * 2, r > 12 ? 2 : 4, '#ff8a1f'); ctx.restore(); }
      pintaLlamas(ctx, x, SUELO - 3, t);
      break;
    case 'cofre':
      sombra(ctx, x, 12, 0);
      pintaSpr(ctx, SPR.cofre[P.abierto ? 1 : 0], x + (P.sacude ? Math.round(Math.sin(t * 60)) : 0), SUELO);
      if (P.abierto) for (let k = 0; k < 4; k++) { const ph = (t * 1.2 + k * 0.25) % 1; ctx.fillStyle = ph < 0.5 ? '#fff3a0' : '#ffcb3d'; ctx.fillRect(x - 8 + k * 5, SUELO - 16 - Math.round(ph * 18), 1, 2); }
      break;
    case 'gashapon': sombra(ctx, x, 12, 0); pintaSpr(ctx, SPR.gashapon[P.sacude ? 1 + (Math.floor(t * 20) % 2) : 0], x, SUELO); break;
    case 'madriguera': pintaMadriguera(ctx, x); break;
    case 'ruleta': sombra(ctx, x, 12, 0); pintaSpr(ctx, SPR.ruletaPie, x, SUELO); pintaRuleta(ctx, x, SUELO - 32, 14, P.ang); break;
  }
}
// las monedas sueltas por el camino (los días de monedas)
function pintaSueltas(ctx, mx) {
  for (const m of VIAJE.sueltas) { const x = Math.round(m.wx - mx); if (x > -10 && x < PAN.W + 10) pintaSpr(ctx, SPR.moneda[Math.floor(RELOJ.t * 10 + m.wx) % 4], x, SUELO - 5 - Math.round(Math.abs(Math.sin(RELOJ.t * 4 + m.wx)) * 2)); }
}

// barra de vida pequeña sobre el rival, con su nombre (★ si es de élite)
function barraRival(ctx) {
  if (!RIVAL || RIVAL.anim === 'muere') return;
  const grande = RIVAL.def.jefe || RIVAL.def.mini, w = grande ? 56 : 34, x = Math.round(RIVAL.x - w / 2);
  const y = Math.max(ESC.Y + 38, Math.round(RIVAL.y - RIVAL.z - RIVAL.alto - 14));
  const k = Math.max(0, RIVAL.vidaVista / RIVAL.e.vidaMax), kr = Math.max(0, RIVAL.e.vida / RIVAL.e.vidaMax);
  const nombre = (RIVAL.elite ? '★ ' : '') + tr(RIVAL.def.n), nx = Math.max(4 + anchoTexto(nombre) / 2, Math.min(PAN.W - 4 - anchoTexto(nombre) / 2, RIVAL.x));
  escribe(ctx, nombre, nx, y - 10, { alin: 'centro', c: RIVAL.def.jefe ? '#ffb0b8' : RIVAL.elite || RIVAL.def.mini ? '#ffcb3d' : '#fff6ea' });
  ctx.fillStyle = OL; ctx.fillRect(x - 1, y - 1, w + 2, 5);
  ctx.fillStyle = '#4a1a2a'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, Math.round(w * k), 3);
  ctx.fillStyle = '#ff3348'; ctx.fillRect(x, y, Math.round(w * kr), 3);
  ctx.fillStyle = '#ff8a94'; ctx.fillRect(x, y, Math.round(w * kr), 1);
}

function pintaPersonajes(ctx, mx) {
  pintaProp(ctx, mx);
  pintaSueltas(ctx, mx);
  if (RIVAL) { const d = RIVAL.def, ancho = d.jefe ? 18 : d.mini ? 15 : d.spr === 'caja' ? 12 : 9; pintaEnt(ctx, RIVAL, ancho); }
  if (VIAJE.modo === 'menu' && MENU.ent) pintaEnt(ctx, MENU.ent, MENU.ent.def.jefe ? 18 : 10);
  if (ARDILLA.activa) pintaEnt(ctx, ARDILLA, 5);
  pintaEnt(ctx, CONEJO, 10);
}

function avanzaPersonajes(dt, real) {
  for (const e of [CONEJO, ARDILLA, RIVAL, PROP]) if (e && e.blanco > 0) e.blanco -= real;
  if (RIVAL) RIVAL.vidaVista += (RIVAL.e.vida - RIVAL.vidaVista) * Math.min(1, dt * 4);
}
