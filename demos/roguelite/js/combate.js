// Fans of Roguelite · El combate automático, contado como una coreografía: llega el rival (el jefe cae del cielo), el conejo y
// sus habilidades pegan (combate-conejo.js) y luego le toca al rival: carrerilla y golpe, láser, bola de hielo o de sombra,
// rayo, mordisco o el ataque especial de los jefes, que hace llover sobres, lápidas, billetes, tazas o disquetes.
'use strict';

const POS = { conejo: () => Math.round(PAN.W * 0.3), rival: () => Math.round(PAN.W * 0.72) };
const centro = e => [e.x, e.y - e.z - e.alto * 0.5];
const siguiente = () => espera(0.0001);
const COMBATE = { c: null };   // lo del combate en curso (escudo, huelga…)
// los trocitos que saltan al morir, con los colores de cada uno
const TROZOS = {
  becario: ['#aab4c4', '#1b4fc4', '#ff4b5c', '#fff6ea'], starbot: ['#34466e', '#33e0ff', '#ffcb3d', '#4d6496'], caja: ['#2e5bb8', '#ffcb3d', '#3a7de0', '#ffffff'],
  becarioMes: ['#aab4c4', '#e0a020', '#ff4b5c', '#fff6ea'], jefe: ['#9aa5ba', '#2e5bb8', '#ff3348', '#ffe08a'],
  esqueleto: ['#efeadf', '#c8c0b0', '#3a2a4a', '#ffcb3d'], zombi: ['#8fbf6a', '#5a8a4a', '#2e5bb8', '#ff4b5c'], fantasma: ['#c8f0ff', '#5ef2d0', '#8a2bff', '#fff6ea'],
  cosido: ['#8fbf6a', '#c8874a', '#5a3a2a', '#ff4b5c'], necrolord: ['#3a2a5a', '#8a2bff', '#5ef2d0', '#ffcb3d'],
  abogado: ['#3a3a4a', '#fff6ea', '#e63946', '#aab4c4'], fallen: ['#aab4c4', '#e63946', '#ffcb3d', '#6a6a80'], soporte: ['#5aaeff', '#ffcb3d', '#34466e', '#fff6ea'],
  parche: ['#c8c8d8', '#ffcb3d', '#ff4b5c', '#5aaeff'], ceo: ['#6a6a80', '#e63946', '#7be04a', '#ffcb3d'],
};
// lo que llueve en el ataque especial de cada jefe y mini jefe
const LLUVIA = { jefe: 'sobre', becariomes: 'taza', cosido: 'toxico', necrolord: 'lapida', parche: 'disquete', ceo: 'billete' };

// un combate entero; devuelve el enemigo vencido o null si pierdes
async function combate(id, elite) {
  const def = ENEMIGOS[id], e = nuevoEnemigo(id, VIAJE.mundo, VIAJE.dia, elite);
  marcaVisto('e', id);
  RIVAL = { def, e, x: PAN.W + 40, y: SUELO, z: def.vuela || 0, alto: def.alto, anim: 'andar', t0: RELOJ.t, blanco: 0, elite: !!elite };
  RIVAL.vidaVista = e.vida;
  log(def.llega);
  if (elite) { log('¡Enemigo de élite! Más fuerte, pero suelta un objeto.'); chatEv('elite', null, 0.9, 0); }
  if (def.mini) chatEv('mini', tr(def.n), 1, 0);
  if (def.jefe) {
    const raid = Math.round((150 + Math.random() * 120) * (1 + VIAJE.mundo));
    VIAJE.esp += raid; chatRafaga('jefe', 3, tr(def.n));
    log('¡{u} llega con una raid de {n} espectadores para ver al jefe!', { u: CHAT_USUARIOS[Math.floor(Math.random() * CHAT_USUARIOS.length)][0], n: miles(raid) });
  }
  if (def.jefe) await llegaJefe(); else await llegaRival();
  bocadillo(RIVAL, def.frases[Math.floor(Math.random() * def.frases.length)], 2.2); sonido('voz');
  await espera(1.0);
  const c = COMBATE.c = {};
  for (const a of empiezaCombate(H, c)) { await accionHeroe(a); if (RIVAL.e.vida <= 0) break; }
  let nh = 0, ne = 0;
  while (RIVAL.e.vida > 0) {
    nh++;
    for (const a of turnoHeroe(H, nh, c)) { await accionHeroe(a); if (RIVAL.e.vida <= 0) break; }
    if (RIVAL.e.vida <= 0) break;
    await espera(0.22);
    ne++;
    await accionRival(turnoEnemigo(H, RIVAL.e, ne, c));
    if (H.vida <= 0 && !await levanta()) { COMBATE.c = null; return null; }
    if (RIVAL.e.vida <= 0) break;
    await espera(0.28);
  }
  COMBATE.c = null;
  await muereRival();
  return e;
}

// el rival entra andando mientras el conejo sigue avanzando; al encontrarse, todo se para
async function llegaRival() {
  const x0 = RIVAL.x, xd = POS.rival(), d = RIVAL.def;
  if (d.mini) { musica('jefe'); sonido('sirena'); rotulo(PAN.W / 2, ESC.Y + 40, tr('¡MINI JEFE!'), '#ffcb3d', 1.4, 2); }
  await anima(d.mini ? 1.8 : 1.5, k => {
    RIVAL.x = Math.round(x0 + (xd - x0) * sale(k));
    if (d.mini && Math.floor(k * 6) !== Math.floor((k - 0.02) * 6)) { tiembla(2); polvo(RIVAL.x + 6, SUELO, 2, 1); }
  });
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
  const [s1, s2] = FONDO.estilo.sombra;
  trozos(RIVAL.x, SUELO, 10, [FONDO.ti(s1), FONDO.ti(s2), FONDO.ti('#5cc23a')]);
  rotulo(PAN.W / 2, ESC.Y + 40, tr('¡JEFE!'), '#ff5a6a', 1.6, 3);
  ponAnim(CONEJO, 'dano'); await espera(0.35); ponAnim(CONEJO, 'guardia');
}

/* ---------- lo que hace el rival ---------- */
async function accionRival(r) {
  const def = RIVAL.def, x0 = RIVAL.x, at = def.ataque;
  if (r.tipo === 'pulgas') {
    rotulo(RIVAL.x, SUELO - RIVAL.alto - 30, tr('¡SE RASCA!'), '#e8b07a', 1); log('Pulgas: se rasca y pierde el turno.');
    for (let i = 0; i < 4; i++) { ponAnim(RIVAL, i % 2 ? 'dano' : 'quieto'); RIVAL.x = x0 + (i % 2 ? 2 : -2); chispas(RIVAL.x, centro(RIVAL)[1], 2, '#8b5530', 40); sonido('rasca'); await espera(0.12); }
    RIVAL.x = x0; ponAnim(RIVAL, 'quieto');
    return;
  }
  if (r.tipo === 'especial') return ataqueEspecial(r);
  ponAnim(RIVAL, 'carga');
  sonido(at === 'laser' || at === 'rayo' ? 'cargaLaser' : at === 'hielo' || at === 'sombra' ? 'cargaMagia' : 'carga');
  await espera(at === 'cuerpo' || at === 'salto' ? 0.18 : 0.3);
  if (at === 'laser') {
    ponAnim(RIVAL, 'golpe');
    const y = Math.round(RIVAL.y - RIVAL.z - 12);
    laser(RIVAL.x - 18, y, CONEJO.x + 4); sonido('laser');
    RIVAL.x = x0 + 4;
    pegaConejo(r);
    await espera(0.2);
  } else if (at === 'rayo') {
    ponAnim(RIVAL, 'golpe');
    rayo(RIVAL.x - 14, Math.round(RIVAL.y - RIVAL.z - 16), CONEJO.x + 4, SUELO - 26); sonido('rayo');
    pegaConejo(r);
    await espera(0.22);
  } else if (at === 'hielo' || at === 'sombra') {
    ponAnim(RIVAL, 'golpe');
    const col = at === 'hielo' ? '#7cf0ff' : '#b06aff', x1 = RIVAL.x - 14, y1 = Math.round(RIVAL.y - RIVAL.z - RIVAL.alto * 0.6), [x2, y2] = centro(CONEJO), b = bola(x1, y1, col, at === 'sombra' ? 4 : 3);
    sonido(at);
    await anima(0.3, k => { b.x = x1 + (x2 - x1) * k; b.y = y1 + (y2 - y1) * k - Math.sin(k * Math.PI) * 8; if (Math.random() < 0.7) fx('chispa', { x: b.x, y: b.y, vx: rnd(-12, 12), vy: rnd(-12, 12), vida: 0.25, col }); });
    b.t = b.vida; chispas(x2, y2, 10, col, 90);
    pegaConejo(r);
    await espera(0.2);
  } else if (at === 'salto') {
    const xd = CONEJO.x + 24;
    await anima(0.26, k => { RIVAL.x = Math.round(x0 + (xd - x0) * k); RIVAL.z = Math.round(salto(k) * 18); });
    RIVAL.z = 0; ponAnim(RIVAL, 'golpe'); sonido('mordisco');
    pegaConejo(r);
    await espera(0.18);
    ponAnim(RIVAL, 'andar');
    await anima(0.3, k => { RIVAL.x = Math.round(xd + (x0 - xd) * k); RIVAL.z = Math.round(salto(k) * 10); });
    RIVAL.z = 0;
  } else {
    const grande = def.jefe || def.mini, xd = CONEJO.x + (grande ? 38 : 24);
    ponAnim(RIVAL, 'golpe');
    await anima(0.11, k => { RIVAL.x = Math.round(x0 + (xd - x0) * sale(k)); });
    if (def.gotas) gotas(CONEJO.x + 6, SUELO - 26, 8, def.gotas);
    pegaConejo(r, grande);
    await espera(0.16);
    ponAnim(RIVAL, SPR[def.spr].andar ? 'andar' : 'quieto');
    await anima(0.24, k => { RIVAL.x = Math.round(xd + (x0 - xd) * suave(k)); });
  }
  RIVAL.x = x0; ponAnim(RIVAL, 'quieto');
}

// el ataque especial de los jefes: levantan los brazos, llueven cosas y golpe gordo
async function ataqueEspecial(r) {
  const def = RIVAL.def, cosa = SPR.lluvia[LLUVIA[RIVAL.e.id] || 'sobre'];
  ponAnim(RIVAL, 'especial'); bocadillo(RIVAL, def.especial, 1.4); sonido('sirena'); log(def.especial);
  destella(def.jefe ? '#ff3348' : '#ff8a1f', 0.08);
  await espera(0.6);
  await Promise.all([0, 1, 2, 3, 4, 5].map(async i => {
    await espera(i * 0.08);
    const tx = CONEJO.x + Math.round(rnd(-14, 14)), s = fx('spr', { spr: cosa, x: tx, y: ESC.Y - 6, vida: 9 });
    await anima(0.34, k => { s.y = ESC.Y - 6 + (SUELO - 26 - ESC.Y + 6) * entra(k); s.x = tx + Math.round(Math.sin(k * 9 + i) * 3); });
    s.t = s.vida; chispas(s.x, s.y, 3, '#fff6ea', 60); sonido('golpe');
  }));
  pegaConejo(r, true);
  await espera(0.3);
  ponAnim(RIVAL, 'quieto');
}

// el conejo recibe (o no: huelga, esquiva, escudo) y, con Pelo de erizo, devuelve parte
function pegaConejo(r, gordo) {
  const [cx, cy] = centro(CONEJO);
  if (r.bloqueo === 'huelga') {
    anillo(cx, cy, 30, '#7be04a', 0.4); rotulo(cx, cy - 30, tr('¡HUELGA!'), '#7be04a', 1); sonido('bloqueo');
    log('¡Huelga general! Ese golpe no cuenta.'); chatEv('huelga', null, 0.5, 15);
    return;
  }
  if (r.bloqueo === 'esquiva') {
    rotulo(cx, cy - 30, tr('¡ESQUIVA!'), '#5aaeff', 0.9); sonido('esquiva'); rayas(cx + 8, cy, -1); chatEv('esquiva', null, 0.5, 10);
    const x0 = CONEJO.x;
    anima(0.26, k => { CONEJO.x = Math.round(x0 - salto(k) * 10); CONEJO.z = Math.round(salto(k) * 12); }).then(() => { CONEJO.x = x0; CONEJO.z = 0; }).catch(() => {});
    return;
  }
  if (r.escudo) { numero(cx - 14, cy - 18, r.escudo, 'escudo'); anillo(cx, cy, 26, '#5aaeff', 0.3); sonido('escudo'); }
  if (r.dano > 0) {
    H.vida = Math.max(0, H.vida - r.dano);
    CONEJO.blanco = 0.1; ponAnim(CONEJO, 'dano');
    estallido(cx + 6, cy, gordo); chispas(cx + 4, cy, gordo ? 10 : 5, '#ff8a94', 100);
    numero(cx, cy - 14, r.dano, 'herida');
    tiembla(gordo ? 7 : 3); congela(gordo ? 140 : 70); sonido('herida');
    if (H.vida > 0 && H.vida < H.vidaMax * 0.3) chatEv('pocaVida', null, 0.8, 14);
    const x0 = CONEJO.x;
    CONEJO.x -= gordo ? 6 : 3;
    espera(0.16).then(() => { CONEJO.x = x0; if (H.vida > 0 && CONEJO.anim === 'dano') ponAnim(CONEJO, 'guardia'); }).catch(() => {});
  }
  if (r.espinas && RIVAL && RIVAL.e.vida > 0) espera(0.12).then(() => {
    if (!RIVAL || RIVAL.e.vida <= 0) return;
    const [rx, ry] = centro(RIVAL);
    for (let i = 0; i < 5; i++) fx('raya', { x: cx + 6, y: cy - 6 + i * 3, vx: 260, vida: (rx - cx) / 260, l: 4 });
    espera(0.1).then(() => { if (RIVAL && RIVAL.e.vida > 0) pegaRival(r.espinas, 'poco', true); chispas(rx, ry, 5, '#c8874a', 70); }).catch(() => {});
  }).catch(() => {});
}

// si el conejo cae: la MechaVaca o el Contrato indefinido le levantan (una vez cada uno)
async function levanta() {
  const quien = salvacion(H);
  if (!quien) return false;
  const [cx, cy] = centro(CONEJO);
  ponAnim(CONEJO, 'dano'); CONEJO.parpadeo = true;
  await espera(0.6);
  CONEJO.parpadeo = false;
  destella('#fff6ea', 0.12); sonido('revive'); tiembla(4);
  anillo(cx, cy, 50, '#ffcb3d', 0.5); anillo(cx, cy, 30, '#fff6ea', 0.35); chispas(cx, cy, 20, '#ffcb3d', 130); curita(cx, cy, 8);
  rotulo(cx, SUELO - 66, tr(quien === 'mechavaca' ? '¡MECHAVACA!' : '¡CONTRATO INDEFINIDO!'), '#ffcb3d', 1.4);
  log(quien === 'mechavaca' ? 'La MechaVaca aterriza y te pone en pie. ¡Muuu!' : 'Tu Contrato indefinido te devuelve al trabajo. Con la mitad de vida.');
  numero(cx, cy - 10, '+' + H.vida, 'cura');
  chatRafaga('revive', 2);
  ponAnim(CONEJO, 'gana'); await espera(0.5); ponAnim(CONEJO, 'guardia');
  await espera(0.3);
  return true;
}

async function muereRival() {
  const def = RIVAL.def, e = RIVAL.e, grande = def.jefe || def.mini;
  ponAnim(RIVAL, 'dano');
  bocadillo(RIVAL, def.muere, 1.4);
  RIVAL.parpadeo = true; sonido('caida');
  await espera(0.9);
  const [cx, cy] = centro(RIVAL);
  RIVAL.anim = 'muere';
  estallido(cx, cy, true); anillo(cx, cy, 36, '#fff3a0', 0.35); anillo(cx, cy, 56, '#ff8a1f', 0.5); humo(cx, cy, 12);
  chispas(cx, cy, 18, '#fff3a0', 150); chispas(cx, cy, 12, '#ff7aa8', 120); chispas(cx, cy, 12, '#5aaeff', 120);
  trozos(cx, cy, def.jefe ? 40 : def.mini ? 30 : 22, TROZOS[def.spr] || TROZOS.becario);
  tiembla(grande ? 10 : 5); congela(grande ? 220 : 90); sonido('boom'); destella('#ffffff', grande ? 0.12 : 0.05);
  if (grande) for (let i = 1; i <= (def.jefe ? 4 : 2); i++) espera(i * 0.22).then(() => { estallido(cx + rnd(-20, 20), cy + rnd(-30, 10), true); chispas(cx, cy, 10, '#ffcb3d', 120); sonido('boom'); tiembla(6); }).catch(() => {});
  if (RIVAL.elite) { chispas(cx, cy, 16, '#ffcb3d', 140); anillo(cx, cy, 44, '#ffcb3d', 0.45); }
  if (grande) chatRafaga('ganaJefe', 3); else chatEv('gana', null, 0.35, 6);
  lluviaMonedas(cx, cy, ganaMonedas(H, e.monedas), def.jefe ? 34 : def.mini ? 26 : 18);
  H.derrotados++;
  RIVAL = null;
  if (def.mini) musica(MUNDOS[VIAJE.mundo].musica);
  await espera(grande ? 1.6 : 1.1);
}
// muchas monedas que saltan y vuelan al marcador; el total llega justo (se reparte según van llegando)
function lluviaMonedas(x, y, total, max = 16, callado) {
  if (total <= 0) return;
  H.monedas -= total;   // se suman según llegan
  const n = Math.max(1, Math.min(total, max));
  let dadas = 0, llegan = 0;
  for (let i = 0; i < n; i++) moneda(x + rnd(-6, 6), y + rnd(-6, 6), () => { llegan++; const v = Math.round(total * llegan / n) - dadas; dadas += v; H.monedas += v; sonido('moneda'); });
  if (!callado) log('+{n} monedas.', { n: total });
}
