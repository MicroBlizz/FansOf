// Fans of Roguelite (prototipo) · El combate automático, contado como una coreografía: el conejo coge carrerilla, pega,
// el golpe congela la imagen un instante, salen la estrella, las chispas y el número, y vuelve a su sitio dando saltitos.
// Luego le toca al rival (café, láser, mordisco o el despido fulminante del jefe).
'use strict';

const POS = { conejo: () => Math.round(PAN.W * 0.3), rival: () => Math.round(PAN.W * 0.72) };
const centro = e => [e.x, e.y - e.z - e.alto * 0.5];
const siguiente = () => espera(0.0001);

async function combate(dia) {
  const def = ENEMIGOS[dia.enemigo];
  RIVAL = { def, e: nuevoEnemigo(dia.enemigo), x: PAN.W + 40, y: SUELO, z: def.vuela || 0, alto: def.alto, anim: 'andar', t0: RELOJ.t, blanco: 0 };
  RIVAL.vidaVista = RIVAL.e.vida;
  log(def.llega);
  if (def.jefe) await llegaJefe(); else await llegaRival();
  bocadillo(RIVAL, def.frase, 2.2); sonido('voz');
  await espera(1.1);
  let nh = 0, ne = 0;
  const c = {};
  while (true) {
    nh++;
    for (const a of turnoHeroe(H, nh)) {
      await accionHeroe(a);
      if (RIVAL.e.vida <= 0) break;
    }
    if (RIVAL.e.vida <= 0) break;
    await espera(0.22);
    ne++;
    await accionRival(turnoEnemigo(H, RIVAL.e, ne, c));
    if (H.vida <= 0) return false;
    await espera(0.28);
  }
  await muereRival();
  return true;
}

// el rival entra andando mientras el conejo sigue avanzando; al encontrarse, todo se para
async function llegaRival() {
  const x0 = RIVAL.x, xd = POS.rival();
  await anima(1.5, k => { RIVAL.x = Math.round(x0 + (xd - x0) * sale(k)); });
  VIAJE.andando = false;
  ponAnim(RIVAL, 'quieto'); ponAnim(CONEJO, 'guardia'); if (ARDILLA.activa) ponAnim(ARDILLA, 'quieto');
  rotulo(CONEJO.x, SUELO - 62, '!', '#ffcb3d', 0.6); sonido('alerta');
}
// el jefe cae del cielo y hace temblar todo
async function llegaJefe() {
  await anima(1.0, () => {});
  VIAJE.andando = false;
  ponAnim(CONEJO, 'guardia'); if (ARDILLA.activa) ponAnim(ARDILLA, 'quieto');
  musica('jefe'); sonido('sirena');
  RIVAL.x = POS.rival() + 6; RIVAL.z = 180; ponAnim(RIVAL, 'especial');
  await espera(0.5);
  await anima(0.32, k => { RIVAL.z = Math.round(180 * (1 - entra(k))); });
  RIVAL.z = 0; ponAnim(RIVAL, 'quieto');
  tiembla(9); congela(140); sonido('boom'); destella('#fff6ea', 0.07);
  polvo(RIVAL.x - 14, SUELO, 6, -1); polvo(RIVAL.x + 14, SUELO, 6, 1); anillo(RIVAL.x, SUELO - 2, 40, '#fff6ea', 0.4);
  trozos(RIVAL.x, SUELO, 10, [FONDO.ti('#e0b07a'), FONDO.ti('#c08a50'), FONDO.ti('#5cc23a')]);
  rotulo(PAN.W / 2, ESC.Y + 40, tr('¡JEFE!'), '#ff5a6a', 1.6, 3);
  ponAnim(CONEJO, 'dano'); await espera(0.35); ponAnim(CONEJO, 'guardia');
}

/* ---------- lo que hace el conejo ---------- */
async function accionHeroe(a) {
  if (a.tipo === 'golpe' || a.tipo === 'rabia') return golpeConejo(a);
  if (a.tipo === 'chaos') return chaosJump(a);
  if (a.tipo === 'ardilla') return mordisco(a);
  if (a.tipo === 'bellotas') return lluviaBellotas(a);
}

async function golpeConejo(a) {
  const x0 = POS.conejo(), xd = RIVAL.x - (RIVAL.def.jefe ? 30 : 22);
  if (a.tipo === 'rabia') { rotulo(CONEJO.x, SUELO - 60, tr('¡RABIA!'), '#ff8a1f', 0.8); log('¡Rabia! Otro golpe.'); }
  ponAnim(CONEJO, 'carga'); sonido('carga');
  await espera(a.tipo === 'rabia' ? 0.06 : 0.14);
  ponAnim(CONEJO, 'golpe'); sonido('zas'); polvo(CONEJO.x - 6, SUELO, 3, -1);
  await anima(0.1, k => { CONEJO.x = Math.round(x0 + (xd - x0) * sale(k)); if (k > 0.3 && k < 0.6) rayas(CONEJO.x - 10, SUELO - 20, 1); });
  pegaRival(a.dano, a.crit ? 'critico' : 'golpe');
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
  pegaRival(a.dano, 'chaos');
  anillo(xd, SUELO - 2, 44, '#fff3a0', 0.4); polvo(xd - 12, SUELO, 6, -1); polvo(xd + 12, SUELO, 6, 1);
  trozos(xd, SUELO, 12, [FONDO.ti('#e0b07a'), FONDO.ti('#c08a50'), FONDO.ti('#a8ec5c')]);
  destella('#fff6ea', 0.06);
  ponAnim(CONEJO, 'remate'); await espera(0.22);
  ponAnim(CONEJO, 'andar');
  await anima(0.32, k => { CONEJO.x = Math.round(xd + (x0 - xd) * suave(k)); CONEJO.z = Math.round(salto(k) * 16); });
  CONEJO.z = 0; ponAnim(CONEJO, 'guardia');
}

async function mordisco(a) {
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
    if (RIVAL.e.vida > 0) pegaRival(d, 'poco', true);
  }));
  await espera(0.15);
}

// el rival recibe: destello blanco, estrella, chispas, número, temblor y congelado
function pegaRival(dano, tipo, suave_) {
  const [cx, cy] = centro(RIVAL), grande = tipo === 'critico' || tipo === 'chaos';
  RIVAL.e.vida = Math.max(0, RIVAL.e.vida - dano);
  RIVAL.blanco = grande ? 0.12 : 0.08;
  ponAnim(RIVAL, 'dano');
  estallido(cx - 4, cy, grande); chispas(cx, cy, grande ? 16 : 8, grande ? '#ffcb3d' : '#fff3a0', grande ? 140 : 95);
  if (grande) { chispas(cx, cy, 8, '#ff8a1f', 110); trozos(cx, cy, 4, ['#fff3a0', '#ffcb3d']); }
  numero(cx, cy - 12, dano, tipo === 'chaos' ? 'critico' : tipo);
  tiembla(grande ? 6 : suave_ ? 1.5 : 2.5); congela(grande ? 130 : suave_ ? 30 : 60);
  sonido(grande ? 'critico' : 'golpe');
  if (tipo === 'critico') { rotulo(cx, cy - 34, tr('¡CRÍTICO!'), '#ffcb3d', 0.9); log('¡Golpe crítico!'); }
  const x0 = RIVAL.x;
  RIVAL.x += grande ? 6 : 3;
  espera(0.12).then(() => { if (RIVAL) { RIVAL.x = x0; if (RIVAL.e.vida > 0 && RIVAL.anim === 'dano') ponAnim(RIVAL, 'quieto'); } }).catch(() => {});
  const cura = curaBotiquin(H, dano);
  if (cura && H.vida < H.vidaMax) { H.vida = Math.min(H.vidaMax, H.vida + cura); numero(CONEJO.x - 10, SUELO - 50, '+' + cura, 'cura'); }
}

/* ---------- lo que hace el rival ---------- */
async function accionRival(r) {
  const id = RIVAL.def.spr, x0 = RIVAL.x;
  if (r.tipo === 'pulgas') {
    rotulo(RIVAL.x, SUELO - RIVAL.alto - 30, tr('¡SE RASCA!'), '#e8b07a', 1); log('Pulgas: se rasca y pierde el turno.');
    for (let i = 0; i < 4; i++) { ponAnim(RIVAL, i % 2 ? 'dano' : 'quieto'); RIVAL.x = x0 + (i % 2 ? 2 : -2); chispas(RIVAL.x, centro(RIVAL)[1], 2, '#8b5530', 40); sonido('rasca'); await espera(0.12); }
    RIVAL.x = x0; ponAnim(RIVAL, 'quieto');
    return;
  }
  if (r.tipo === 'especial') return despidoFulminante(r);
  ponAnim(RIVAL, 'carga'); sonido(id === 'starbot' ? 'cargaLaser' : 'carga');
  await espera(id === 'starbot' ? 0.3 : 0.18);
  if (id === 'starbot') {
    ponAnim(RIVAL, 'golpe');
    const y = Math.round(RIVAL.y - RIVAL.z - 12);
    laser(RIVAL.x - 18, y, CONEJO.x + 4); sonido('laser');
    RIVAL.x = x0 + 4;
    pegaConejo(r);
    await espera(0.2);
  } else if (id === 'caja') {
    const xd = CONEJO.x + 24;
    await anima(0.26, k => { RIVAL.x = Math.round(x0 + (xd - x0) * k); RIVAL.z = Math.round(salto(k) * 18); });
    RIVAL.z = 0; ponAnim(RIVAL, 'golpe'); sonido('mordisco');
    pegaConejo(r);
    await espera(0.18);
    ponAnim(RIVAL, 'andar');
    await anima(0.3, k => { RIVAL.x = Math.round(xd + (x0 - xd) * k); RIVAL.z = Math.round(salto(k) * 10); });
    RIVAL.z = 0;
  } else {
    const xd = CONEJO.x + (id === 'jefe' ? 40 : 24);
    ponAnim(RIVAL, 'golpe');
    await anima(0.11, k => { RIVAL.x = Math.round(x0 + (xd - x0) * sale(k)); });
    if (id === 'becario') gotas(CONEJO.x + 6, SUELO - 26, 8, '#6b3a1c');
    pegaConejo(r);
    await espera(0.16);
    ponAnim(RIVAL, id === 'jefe' ? 'quieto' : 'andar');
    await anima(0.24, k => { RIVAL.x = Math.round(xd + (x0 - xd) * suave(k)); });
  }
  RIVAL.x = x0; ponAnim(RIVAL, 'quieto');
}

// el ataque del jefe: levanta los brazos, llueven cartas de despido y golpe gordo
async function despidoFulminante(r) {
  ponAnim(RIVAL, 'especial'); bocadillo(RIVAL, RIVAL.def.especial, 1.4); sonido('sirena'); log('¡Despido fulminante!');
  destella('#ff3348', 0.08);
  await espera(0.6);
  await Promise.all([0, 1, 2, 3, 4].map(async i => {
    await espera(i * 0.09);
    const tx = CONEJO.x + Math.round(rnd(-12, 12)), s = fx('spr', { spr: SPR.sobre, x: tx, y: ESC.Y - 6, vida: 9 });
    await anima(0.34, k => { s.y = ESC.Y - 6 + (SUELO - 26 - ESC.Y + 6) * entra(k); s.x = tx + Math.round(Math.sin(k * 9 + i) * 3); });
    s.t = s.vida; chispas(s.x, s.y, 3, '#fff6ea', 60); sonido('golpe');
  }));
  pegaConejo(r, true);
  await espera(0.3);
  ponAnim(RIVAL, 'quieto');
}

function pegaConejo(r, gordo) {
  const [cx, cy] = centro(CONEJO);
  if (r.huelga) {
    anillo(cx, cy, 30, '#7be04a', 0.4); rotulo(cx, cy - 30, tr('¡HUELGA!'), '#7be04a', 1); sonido('bloqueo');
    log('¡Huelga general! Ese golpe no cuenta.');
    return;
  }
  H.vida = Math.max(0, H.vida - r.dano);
  CONEJO.blanco = 0.1; ponAnim(CONEJO, 'dano');
  estallido(cx + 6, cy, gordo); chispas(cx + 4, cy, gordo ? 10 : 5, '#ff8a94', 100);
  numero(cx, cy - 14, r.dano, 'herida');
  tiembla(gordo ? 7 : 3); congela(gordo ? 140 : 70); sonido('herida');
  const x0 = CONEJO.x;
  CONEJO.x -= gordo ? 6 : 3;
  espera(0.16).then(() => { CONEJO.x = x0; if (H.vida > 0 && CONEJO.anim === 'dano') ponAnim(CONEJO, 'guardia'); }).catch(() => {});
}

async function muereRival() {
  const def = RIVAL.def;
  ponAnim(RIVAL, 'dano');
  bocadillo(RIVAL, def.muere, 1.4);
  RIVAL.parpadeo = true; sonido('caida');
  await espera(0.9);
  const [cx, cy] = centro(RIVAL);
  RIVAL.anim = 'muere';
  estallido(cx, cy, true); anillo(cx, cy, 36, '#fff3a0', 0.35); anillo(cx, cy, 56, '#ff8a1f', 0.5); humo(cx, cy, 12);
  chispas(cx, cy, 18, '#fff3a0', 150); chispas(cx, cy, 12, '#ff7aa8', 120); chispas(cx, cy, 12, '#5aaeff', 120);
  const cols = { becario: ['#aab4c4', '#1b4fc4', '#ff4b5c', '#fff6ea'], starbot: ['#34466e', '#33e0ff', '#ffcb3d', '#4d6496'], caja: ['#2e5bb8', '#ffcb3d', '#3a7de0', '#ffffff'], jefe: ['#9aa5ba', '#2e5bb8', '#ff3348', '#ffe08a'] }[def.spr];
  trozos(cx, cy, def.jefe ? 40 : 22, cols);
  tiembla(def.jefe ? 10 : 5); congela(def.jefe ? 220 : 90); sonido('boom'); destella('#ffffff', def.jefe ? 0.12 : 0.05);
  if (def.jefe) { for (let i = 1; i <= 3; i++) espera(i * 0.22).then(() => { estallido(cx + rnd(-20, 20), cy + rnd(-30, 10), true); sonido('boom'); tiembla(6); }).catch(() => {}); }
  const n = Math.min(def.monedas, def.jefe ? 30 : 16), cada = def.monedas / n;
  let dadas = 0, llegan = 0;
  for (let i = 0; i < n; i++) moneda(cx, cy, () => { llegan++; const v = Math.round(cada * llegan) - dadas; dadas += v; H.monedas += v; sonido('moneda'); });
  log('+{n} monedas.', { n: def.monedas });
  RIVAL = null;
  await espera(def.jefe ? 1.6 : 1.1);
}
