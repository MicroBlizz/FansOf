// Fans of Roguelite · Lo que hace el conejo en el combate: carrerilla y zanahorazo (con crítico, Rabia y SlyFox), el Chaos
// Jump, la ardilla que muerde, la lluvia de bellotas, la bolsa de JunkCoon, el castor BoomBeaver, la taza de Cafeína y la
// MeerCat que cura. Al pegar: destello, estrella, chispas, número, temblor y congelado.
'use strict';

async function accionHeroe(a) {
  if (a.tipo === 'golpe' || a.tipo === 'rabia') return golpeConejo(a);
  if (a.tipo === 'chaos') return chaosJump(a);
  if (a.tipo === 'ardilla') return mordisco(a);
  if (a.tipo === 'bellotas') return lluviaBellotas(a);
  if (a.tipo === 'basura') return bolsaBasura(a);
  if (a.tipo === 'castor') return castorBoom(a);
  if (a.tipo === 'cafeina') return tazaCafe(a);
  if (a.tipo === 'meercat') return curaMeercat(a);
}

async function golpeConejo(a) {
  const x0 = POS.conejo(), xd = RIVAL.x - (RIVAL.def.jefe ? 30 : RIVAL.def.mini ? 26 : 22);
  if (a.tipo === 'rabia') { rotulo(CONEJO.x, SUELO - 60, tr('¡RABIA!'), '#ff8a1f', 0.8); log('¡Rabia! Otro golpe.'); }
  if (a.zorro) { rotulo(CONEJO.x, SUELO - 64, tr('¡SLYFOX!'), '#ff8a1f', 0.9); log('SlyFox te enseña el golpe a traición: daño x{n}.', { n: valorHab(H, 'zorro') }); }
  ponAnim(CONEJO, 'carga'); sonido('carga');
  await espera(a.tipo === 'rabia' ? 0.06 : a.zorro ? 0.3 : 0.14);
  ponAnim(CONEJO, 'golpe'); sonido('zas'); polvo(CONEJO.x - 6, SUELO, 3, -1);
  await anima(0.1, k => { CONEJO.x = Math.round(x0 + (xd - x0) * sale(k)); if (k > 0.3 && k < 0.6) rayas(CONEJO.x - 10, SUELO - 20, 1); });
  pegaRival(a.dano, a.crit ? 'critico' : a.zorro ? 'zorro' : 'golpe');
  if (a.crit && nivelHab(H, 'vampira')) { const n = cura(H, valorHab(H, 'vampira')); if (n) { numero(CONEJO.x - 8, SUELO - 54, '+' + n, 'cura'); chispas(CONEJO.x, SUELO - 30, 5, '#ff3348', 50); } }
  ponAnim(CONEJO, 'remate');
  await espera(0.14);
  ponAnim(CONEJO, 'andar');
  await anima(0.24, k => { CONEJO.x = Math.round(xd + (x0 - xd) * suave(k)); CONEJO.z = Math.round(salto(k) * 7); });
  CONEJO.z = 0; ponAnim(CONEJO, 'guardia'); polvo(CONEJO.x, SUELO, 2);
}

async function chaosJump(a) {
  const x0 = POS.conejo(), xd = RIVAL.x - 2;
  bocadillo(CONEJO, '¡CAOS!', 0.9); log('¡Chaos Jump!');
  ponAnim(CONEJO, 'carga'); sonido('carga'); await espera(0.22);
  ponAnim(CONEJO, 'sube'); sonido('salto'); polvo(CONEJO.x, SUELO, 5); anillo(CONEJO.x, SUELO - 1, 14, '#fff6ea', 0.25);
  await anima(0.3, k => { CONEJO.x = Math.round(x0 + (xd - x0) * k); CONEJO.z = Math.round(sale(k) * 150); });
  await espera(0.18);
  ponAnim(CONEJO, 'cae'); sonido('cae');
  await anima(0.13, k => { CONEJO.z = Math.round(150 * (1 - entra(k))); if (k > 0.4) rayas(CONEJO.x - 4, SUELO - 40 - CONEJO.z, 0); });
  CONEJO.z = 0;
  pegaRival(a.dano, 'chaos'); chatEv('chaos', null, 0.6, 10);
  anillo(xd, SUELO - 2, 44, '#fff3a0', 0.4); polvo(xd - 12, SUELO, 6, -1); polvo(xd + 12, SUELO, 6, 1);
  const [s1, s2] = FONDO.estilo.sombra;
  trozos(xd, SUELO, 12, [FONDO.ti(s1), FONDO.ti(s2), FONDO.ti('#a8ec5c')]);
  destella('#fff6ea', 0.06);
  ponAnim(CONEJO, 'remate'); await espera(0.22);
  ponAnim(CONEJO, 'andar');
  await anima(0.32, k => { CONEJO.x = Math.round(xd + (x0 - xd) * suave(k)); CONEJO.z = Math.round(salto(k) * 16); });
  CONEJO.z = 0; ponAnim(CONEJO, 'guardia');
}

async function mordisco(a) {
  if (!ARDILLA.activa) return;
  const x0 = ARDILLA.x, xd = RIVAL.x - 16;
  ponAnim(ARDILLA, 'golpe'); sonido('zas');
  await anima(0.12, k => { ARDILLA.x = Math.round(x0 + (xd - x0) * sale(k)); ARDILLA.z = Math.round(salto(k) * 10); });
  ARDILLA.z = 0;
  pegaRival(a.dano, 'poco');
  sonido('mordisco');
  await espera(0.08);
  ponAnim(ARDILLA, 'andar');
  await anima(0.22, k => { ARDILLA.x = Math.round(xd + (x0 - xd) * suave(k)); ARDILLA.z = Math.round(salto(k) * 8); });
  ARDILLA.z = 0; ponAnim(ARDILLA, 'quieto');
}

async function lluviaBellotas(a) {
  rotulo(PAN.W / 2, ESC.Y + 40, tr('¡LLUVIA DE BELLOTAS!'), '#ffcb3d', 1); log('¡Lluvia de bellotas!');
  sonido('silbido');
  await Promise.all(a.danos.map(async (d, i) => {
    await espera(i * 0.13);
    const tx = RIVAL.x + Math.round(rnd(-8, 8)), [, cy] = centro(RIVAL), b = fx('spr', { spr: SPR.bellota, x: tx - 6, y: ESC.Y - 8, vida: 9 });
    await anima(0.28, k => { b.y = ESC.Y - 8 + (cy - ESC.Y + 8) * entra(k); b.x = tx - 6 + k * 6; });
    b.t = b.vida;
    if (RIVAL && RIVAL.e.vida > 0) pegaRival(d, 'poco', true);
  }));
  await espera(0.15);
}

// JunkCoon lanza su bolsa de basura desde fuera de la pantalla
async function bolsaBasura(a) {
  rotulo(PAN.W / 2, ESC.Y + 40, tr('¡JUNKCOON!'), '#7be04a', 1); log('JunkCoon lanza una bolsa de basura.');
  sonido('silbido');
  const [cx, cy] = centro(RIVAL), x0 = -10, y0 = ESC.Y + 34, s = fx('spr', { spr: SPR.bolsa, x: x0, y: y0, vida: 9 });
  await anima(0.55, k => { s.x = x0 + (cx - x0) * k; s.y = y0 + (cy - y0) * k - salto(k) * 30; });
  s.t = s.vida;
  trozos(cx, cy, 12, ['#2a2a3a', '#7be04a', '#c8874a', '#fff6ea']); humo(cx, cy, 5); gotas(cx, cy, 6, '#7be04a');
  if (RIVAL && RIVAL.e.vida > 0) pegaRival(a.dano, 'chaos');
  await espera(0.2);
}

// BoomBeaver: el castor corre con la dinamita encendida y explota junto al rival
async function castorBoom(a) {
  rotulo(PAN.W / 2, ESC.Y + 40, tr('¡BOOMBEAVER!'), '#ff8a1f', 1); log('¡BoomBeaver corre con la dinamita encendida!');
  sonido('mecha');
  const xd = RIVAL.x - 12, s = fx('spr', { spr: SPR.castor[0], x: -20, y: SUELO, vida: 9 });
  await anima(0.75, k => {
    s.x = Math.round(-20 + (xd + 20) * k); s.spr = SPR.castor[Math.floor(RELOJ.t * 12) % 2];
    if (Math.random() < 0.5) fx('chispa', { x: s.x, y: SUELO - 22, vx: rnd(-20, 20), vy: rnd(-40, -10), g: 80, vida: 0.25, col: '#ffcb3d' });
    if (Math.random() < 0.2) polvo(s.x - 4, SUELO, 1, -1);
  });
  s.t = s.vida;
  humo(xd, SUELO - 10, 12); anillo(xd, SUELO - 12, 44, '#ff8a1f', 0.45); anillo(xd, SUELO - 12, 26, '#fff3a0', 0.3);
  trozos(xd, SUELO - 6, 10, ['#8a5a33', '#e63946', '#ffcb3d', '#5e3a1e']);
  sonido('boom'); destella('#ffcb3d', 0.06); chatEv('castor', null, 0.6, 12);
  if (RIVAL && RIVAL.e.vida > 0) pegaRival(a.dano, 'chaos');
  await espera(0.3);
}

// Cafeína: el conejo lanza una taza de café ardiendo antes de empezar
async function tazaCafe(a) {
  rotulo(CONEJO.x, SUELO - 62, tr('¡CAFEÍNA!'), '#e8b07a', 0.8);
  ponAnim(CONEJO, 'carga'); await espera(0.15); ponAnim(CONEJO, 'golpe'); sonido('zas');
  const [cx, cy] = centro(RIVAL), x0 = CONEJO.x + 8, y0 = SUELO - 30, s = fx('spr', { spr: SPR.lluvia.taza, x: x0, y: y0, vida: 9 });
  await anima(0.32, k => { s.x = x0 + (cx - x0) * k; s.y = y0 + (cy - y0) * k - salto(k) * 26; });
  s.t = s.vida; gotas(cx, cy, 10, '#6b3a1c');
  if (RIVAL && RIVAL.e.vida > 0) pegaRival(a.dano, 'golpe');
  ponAnim(CONEJO, 'guardia');
  await espera(0.15);
}

// MeerCat enfermera: cura un poco cada turno
async function curaMeercat(a) {
  if (H.vida >= H.vidaMax) return;
  const n = cura(H, a.cura), [cx, cy] = centro(CONEJO);
  numero(cx - 8, cy - 14, '+' + n, 'cura'); curita(cx, cy, 4); sonido('cura');
  await espera(0.12);
}

// el rival recibe: destello blanco, estrella, chispas, número, temblor y congelado
function pegaRival(dano, tipo, suave_) {
  if (!RIVAL) return;
  const [cx, cy] = centro(RIVAL), grande = tipo === 'critico' || tipo === 'chaos' || tipo === 'zorro';
  RIVAL.e.vida = Math.max(0, RIVAL.e.vida - dano);
  RIVAL.blanco = grande ? 0.12 : 0.08;
  ponAnim(RIVAL, 'dano');
  estallido(cx - 4, cy, grande); chispas(cx, cy, grande ? 16 : 8, grande ? '#ffcb3d' : '#fff3a0', grande ? 140 : 95);
  if (grande) { chispas(cx, cy, 8, '#ff8a1f', 110); trozos(cx, cy, 4, ['#fff3a0', '#ffcb3d']); }
  numero(cx, cy - 12, dano, grande ? 'critico' : tipo);
  tiembla(grande ? 6 : suave_ ? 1.5 : 2.5); congela(grande ? 130 : suave_ ? 30 : 60);
  sonido(grande ? 'critico' : 'golpe');
  if (tipo === 'critico') { rotulo(cx, cy - 34, tr('¡CRÍTICO!'), '#ffcb3d', 0.9); log('¡Golpe crítico!'); chatEv('critico', null, 0.45, 8); }
  const x0 = RIVAL.x, r = RIVAL;
  RIVAL.x += grande ? 6 : 3;
  espera(0.12).then(() => { if (RIVAL === r) { RIVAL.x = x0; if (RIVAL.e.vida > 0 && RIVAL.anim === 'dano') ponAnim(RIVAL, 'quieto'); } }).catch(() => {});
  const c = curaBotiquin(H, dano);
  if (c && H.vida < H.vidaMax) { const n = cura(H, c); numero(CONEJO.x - 10, SUELO - 50, '+' + n, 'cura'); }
}
