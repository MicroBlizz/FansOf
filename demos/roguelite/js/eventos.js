// Fans of Roguelite · Los días sin combate y los premios: la tienda de Lola, el cofre, la ruleta, el gashapón, la hoguera de
// la huelga, el Pase Premium, los encuentros con elección y las monedas por el camino. También subir de nivel (elegir 1 de 3
// habilidades), los objetos (equipar o vender) y cómo se enseña en la escena lo que ha cambiado.
'use strict';

const precioMundo = n => Math.round(n * (1 + VIAJE.mundo * 0.6));
const signo = n => (n > 0 ? '+' : '') + n;
const foto = () => ({ atq: H.atq, vidaMax: H.vidaMax, vida: H.vida, monedas: H.monedas, crit: H.crit, def: H.def });

// enseña lo que ha cambiado: ataque, vida máxima, vida, crítico, defensa y monedas
function muestraCambios(antes) {
  const [cx, cy] = centro(CONEJO);
  let y = SUELO - 40;
  const pon = (txt, col) => { rotulo(cx + 24, y, txt, col, 1.4); y -= 10; };
  if (H.atq !== antes.atq) pon(signo(H.atq - antes.atq) + ' ' + tr('ATQ'), H.atq > antes.atq ? '#ff8a1f' : '#ff5a6a');
  if (H.vidaMax !== antes.vidaMax) pon(signo(H.vidaMax - antes.vidaMax) + ' ' + tr('VIDA MÁX'), H.vidaMax > antes.vidaMax ? '#7be04a' : '#ff5a6a');
  if (Math.round(H.crit * 100) !== Math.round(antes.crit * 100)) pon(signo(Math.round((H.crit - antes.crit) * 100)) + '% ' + tr('CRÍT'), '#ffcb3d');
  if (H.def !== antes.def) pon(signo(H.def - antes.def) + ' ' + tr('DEF'), '#5aaeff');
  const dv = H.vida - antes.vida;
  if (dv > 0) { numero(cx - 10, cy - 10, '+' + dv, 'cura'); curita(cx, cy, 5); sonido('cura'); }
  if (dv < 0) { numero(cx - 10, cy - 10, -dv, 'herida'); CONEJO.blanco = 0.1; sonido('herida'); }
  const dm = H.monedas - antes.monedas;
  if (dm > 0) lluviaMonedas(cx + 18, cy - 6, dm, 12);
  if (dm < 0) { rotulo(MONEDERO[0], ESC.Y + 12, signo(dm), '#ff5a6a', 1.4); sonido('compra'); }
}

/* ---------- habilidades y niveles ---------- */
async function aprende(id) {
  const hab = HABILIDADES[id], antes = foto(), nuevo = !nivelHab(H, id);
  aplicaHabilidad(H, id); marcaVisto('h', id);
  const nv = nivelHab(H, id), [cx, cy] = centro(CONEJO), col = RAREZA[hab.rar][1];
  sonido('nivel');
  rotulo(cx, SUELO - 66, tr(hab.n), col, 1.4);
  if (nv > 1) rotulo(cx, SUELO - 56, formatea(tr('Nv {n}'), { n: nv }), '#ffcb3d', 1.4);
  chispas(cx, cy, 14, col, 100); anillo(cx, cy, 26, col, 0.35);
  muestraCambios(antes);
  log(nuevo ? 'Aprendes {h}.' : '{h} sube a nivel {n}.', { h: tr(hab.n), n: nv });
  if (id === 'ardilla' && nuevo) await llegaArdilla();
  await espera(0.6);
}
// ofrece 3 habilidades y aprende la elegida. min: rareza mínima (premios); cofre: las del cofre
async function premioHabilidad(min, cofre) {
  let ofs = min ? ofertasMin(H, min) : ofertas(H, cofre);
  if (!ofs.length) { const antes = foto(); extra(H, 'atq', 3); muestraCambios(antes); log('Ya lo sabes todo: +3 de ataque.'); return; }
  const leg = ofs.find(id => HABILIDADES[id].rar === 'legendary');
  if (leg) chatEv('legendaria', tr(HABILIDADES[leg].n), 1, 0);
  else chatEv('consejoHab', tr(HABILIDADES[ofs[Math.floor(Math.random() * ofs.length)]].n), 0.8, 0);
  const i = await panelHabilidad(ofs, cofre || !!min);
  chatEv('elige', tr(HABILIDADES[ofs[i]].n), 0.5, 0);
  await aprende(ofs[i]);
}
function ofertasMin(h, min) {
  const out = [];
  for (let k = 0; k < 20 && out.length < 3; k++) { const id = habilidadAzar(h, min); if (id && !out.includes(id)) out.push(id); }
  return out;
}
async function subeYElige() {
  ponAnim(CONEJO, 'gana'); if (ARDILLA.activa) ponAnim(ARDILLA, 'quieto');
  const c = subeNivel(H), [cx, cy] = centro(CONEJO);
  sonido('nivel');
  anillo(cx, cy, 34, '#ffcb3d', 0.45); chispas(cx, cy, 16, '#ffcb3d', 110); chispas(cx, cy, 8, '#fff6ea', 80);
  rotulo(cx, SUELO - 66, formatea(tr('¡NIVEL {n}!'), { n: H.nivel }), '#ffcb3d', 1.3);
  if (c) numero(cx - 10, cy - 10, '+' + c, 'cura');
  log('¡Subes a nivel {n}! Más vida y más ataque.', { n: H.nivel });
  await espera(0.9);
  consejo('nivel');
  await premioHabilidad();
}
async function llegaArdilla() {
  ARDILLA.activa = true; ARDILLA.x = -20; ARDILLA.z = 0; ponAnim(ARDILLA, 'andar');
  const xd = POS.conejo() - 26;
  await anima(0.7, k => { ARDILLA.x = Math.round(-20 + (xd + 20) * sale(k)); });
  ponAnim(ARDILLA, 'quieto'); bocadillo(ARDILLA, '¡Bellotaaas!', 1.2); sonido('voz'); chatEv('ardilla', null, 1, 0);
}

/* ---------- objetos ---------- */
async function premioObjeto(min, id) {
  id = id || objetoAzar(H, min);
  const o = OBJETOS[id], col = RAREZA[o.rar][1], [cx] = centro(CONEJO);
  marcaVisto('o', id);
  sonido('cofre');
  fx('spr', { spr: SPR.icono[id], x: cx, y: SUELO - 60, vy: -8, vida: 1.4 });
  chispas(cx, SUELO - 64, 14, col, 100); anillo(cx, SUELO - 64, 20, col, 0.4);
  log('¡Encuentras {o}!', { o: tr(o.n) });
  consejo('objeto'); chatEv('objeto', tr(o.n), 0.8, 0);
  const i = await panelObjeto(id);
  if (i === 0) {
    const antes = foto(), viejo = equipa(H, id);
    sonido('nivel'); muestraCambios(antes);
    log('Te equipas {o}.', { o: tr(o.n) });
    if (viejo) { const v = ganaMonedas(H, precioVenta(viejo)); lluviaMonedas(cx + 16, SUELO - 40, v, 8, true); log('Vendes {o} por {n} monedas.', { o: tr(OBJETOS[viejo].n), n: v }); }
  } else {
    const v = ganaMonedas(H, precioVenta(id));
    lluviaMonedas(cx + 16, SUELO - 40, v, 8, true); log('Vendes {o} por {n} monedas.', { o: tr(o.n), n: v });
  }
  await espera(0.5);
}

/* ---------- los días sin combate ---------- */
// camina hasta que lo del camino llega delante y se para
async function paraEnProp(tipo) {
  await anda(0.6);
  PROP = nuevoProp(tipo);
  if (PROP) while (PROP.wx - VIAJE.mx > POS.rival() + 4) await siguiente();
  else await anda(0.6);
  VIAJE.andando = false; ponAnim(CONEJO, 'quieto'); if (ARDILLA.activa) ponAnim(ARDILLA, 'quieto');
}
// el que habla: lo del camino si tiene cara, si no, el conejo
const quienHabla = () => (PROP && !['cofre', 'gashapon', 'ruleta', 'hoguera', 'tumba', 'maquina', 'caja', 'starbotRoto'].includes(PROP.tipo) ? PROP : CONEJO);

// un encuentro con dos opciones (también la hoguera y el Pase Premium)
async function eleccion(enc) {
  sonido('alerta'); rotulo(CONEJO.x, SUELO - 62, '?', '#5aaeff', 0.7);
  await espera(0.4);
  const i = await panelOpciones(enc.quien, enc.texto, enc.opciones);
  const o = enc.opciones[i], antes = foto();
  const res = o.efecto(H) || {};
  muestraCambios(antes);
  const dice = res.dice || o.dice;
  if (res.sube) { const hab = HABILIDADES[res.sube]; rotulo(CONEJO.x, SUELO - 66, tr(hab.n), RAREZA[hab.rar][1], 1.4); rotulo(CONEJO.x, SUELO - 56, formatea(tr('Nv {n}'), { n: nivelHab(H, res.sube) }), '#ffcb3d', 1.4); sonido('nivel'); log('{h} sube a nivel {n}.', { h: tr(hab.n), n: nivelHab(H, res.sube) }); }
  ponAnim(CONEJO, H.atq > antes.atq || H.vida > antes.vida ? 'gana' : 'quieto');
  if (dice) { bocadillo(quienHabla(), dice, 2.4); sonido('voz'); log('{q}: {d}', { q: tr(enc.quien), d: tr(dice) }); }
  await espera(dice ? 2.2 : 0.8);
  if (res.premio === 'objeto') await premioObjeto(res.min);
  if (res.premio === 'habilidad') await premioHabilidad(res.min);
}

async function diaEncuentro() {
  let lista = encuentrosDe(VIAJE.mundo).filter(e => !VIAJE.usados.includes(e.id));
  if (!lista.length) { VIAJE.usados = []; lista = encuentrosDe(VIAJE.mundo); }
  const enc = lista[Math.floor(Math.random() * lista.length)];
  VIAJE.usados.push(enc.id);
  await paraEnProp(enc.prop);
  chatEv('encuentro', null, 0.6, 0);
  await eleccion(enc);
}
async function diaHoguera() { await paraEnProp('hoguera'); sonido('fuego'); consejo('hoguera'); chatEv('hoguera', null, 0.8, 0); await eleccion(HOGUERA); }
async function diaPase() { await paraEnProp(PASE.prop); bocadillo(PROP, '¡Oferta exclusiva!', 1.4); sonido('voz'); await espera(0.6); consejo('pase'); chatRafaga('pase', 2); await eleccion(PASE); }

// la tienda de Lola: compras lo que quieras mientras te lleguen las monedas
async function diaTienda() {
  await paraEnProp('puesto');
  bocadillo(PROP, '¡Pasa, pasa! Hoy todo a mitad de precio. Del doble.', 2.2); sonido('voz');
  await espera(0.8);
  consejo('tienda'); chatEv('tienda', null, 0.9, 0);
  const lista = [
    { n: 'Bocadillo de Lola', d: 'Te curas el 40 % de tu vida.', precio: precioMundo(25), hace: async () => { const a = foto(); cura(H, H.vidaMax * 0.4); muestraCambios(a); } },
    { n: 'Habilidad de la trastienda', d: 'Eliges 1 de 3 habilidades (rara o mejor).', precio: precioMundo(70), hace: () => premioHabilidad('rare') },
    { n: 'Objeto de segunda mano', d: 'Un objeto al azar (poco común o mejor).', precio: precioMundo(55), hace: () => premioObjeto('common') },
  ];
  while (lista.length) {
    const ops = lista.map(o => ({ n: o.n, d: o.d, precio: o.precio, no: H.monedas < o.precio }));
    ops.push({ n: 'Seguir el camino', d: 'Guardas tus monedas para La Madriguera.' });
    const i = await panelOpciones('La tienda de Lola', 'Lola vende lo que encuentra por el camino. «Precios de despedida».', ops);
    if (i >= lista.length) break;
    const o = lista.splice(i, 1)[0];
    H.monedas -= o.precio; sonido('compra');
    rotulo(MONEDERO[0], ESC.Y + 12, '-' + o.precio, '#ff5a6a', 1.4);
    log('Compras: {o}.', { o: tr(o.n) });
    await o.hace();
  }
  bocadillo(PROP, '¡Gracias por apoyar al pequeño comercio!', 1.8); sonido('voz');
  await espera(1.0);
}

// el cofre: se sacude, se abre, suelta monedas y eliges una habilidad buena
async function diaCofre() {
  await paraEnProp('cofre');
  log('Un cofre de Microblizz, abandonado en mitad del camino.');
  await espera(0.3);
  PROP.sacude = 1; sonido('rasca'); await espera(0.6); PROP.sacude = 0;
  PROP.abierto = true; sonido('cofre'); destella('#fff3a0', 0.06); tiembla(2); chatEv('cofre', null, 0.9, 0);
  const x = PROP.x, y = SUELO - 14;
  chispas(x, y, 22, '#ffcb3d', 130); chispas(x, y, 10, '#fff6ea', 90); anillo(x, y, 32, '#fff3a0', 0.4);
  lluviaMonedas(x, y, ganaMonedas(H, precioMundo(12 + VIAJE.dia)), 12);
  await espera(0.9);
  await premioHabilidad(null, true);
}

// la ruleta de Microblizz (el puntero está arriba; SEGMENTOS_RULETA dice los colores)
const RULETA = [
  { p: 18, txt: '¡Monedas!', hace: () => lluviaMonedas(PROP.x, SUELO - 32, ganaMonedas(H, precioMundo(30)), 12) },
  { p: 12, txt: '¡Una habilidad!', hace: () => premioHabilidad() },
  { p: 16, txt: '¡Te curas!', hace: () => { const a = foto(); cura(H, H.vidaMax * 0.5); muestraCambios(a); } },
  { p: 12, txt: '¡Un objeto!', hace: () => premioObjeto('basic') },
  { p: 14, txt: '¡Más ataque!', hace: () => { const a = foto(); extra(H, 'atq', 3 + VIAJE.mundo * 2); muestraCambios(a); } },
  { p: 14, txt: '¡Más vida!', hace: () => { const a = foto(); extra(H, 'vida', 20); muestraCambios(a); } },
  { p: 4, txt: '¡PREMIO GORDO!', hace: () => lluviaMonedas(PROP.x, SUELO - 32, ganaMonedas(H, precioMundo(100)), 30) },
  { p: 10, txt: 'Cuota de Microblizz', hace: () => { const a = foto(); H.monedas -= Math.floor(H.monedas * 0.25); muestraCambios(a); log('La ruleta se queda el 25 % de tus monedas. «Gastos de gestión».'); } },
];
async function diaRuleta() {
  await paraEnProp('ruleta');
  consejo('ruleta');
  await panelOpciones('La ruleta', 'Una ruleta de premios de Microblizz. «Gratis» (de momento).', [{ n: 'Girar', d: 'Monedas, curas, habilidades… o la cuota de Microblizz.' }]);
  const s = sorteo([0, 1, 2, 3, 4, 5, 6, 7], i => RULETA[i].p), q = Math.PI / 4;
  const fin = -Math.PI / 2 - (s + 0.5 + rnd(-0.3, 0.3)) * q - 4 * Math.PI * 2;
  let ultimo = 0;
  sonido('elige'); chatEv('ruleta', null, 1, 0);
  await anima(2.6, k => { PROP.ang = fin * (1 - Math.pow(1 - k, 3)); const seg = Math.floor(PROP.ang / q); if (seg !== ultimo) { ultimo = seg; sonido('tic'); } });
  const pr = RULETA[s], [rx, ry] = [PROP.x, SUELO - 32];
  chispas(rx, ry - 14, 12, SEGMENTOS_RULETA[s] === '#3a4258' ? '#8a8aa0' : SEGMENTOS_RULETA[s], 100);
  rotulo(rx, ry - 26, tr(pr.txt), s === 7 ? '#ff5a6a' : '#ffcb3d', 1.6);
  sonido(s === 7 ? 'derrota' : 'victoria');
  log('La ruleta: {p}', { p: tr(pr.txt) });
  if (s === 7) chatRafaga('cuotaRuleta', 2); else if (s === 6) chatRafaga('gordo', 3);
  await espera(1.0);
  await pr.hace();
  await espera(0.6);
}

// el gashapón: gratis da un objeto cualquiera; pagando, uno raro o mejor
async function diaGashapon() {
  await paraEnProp('gashapon');
  consejo('gashapon'); chatEv('gashapon', null, 0.8, 0);
  const precio = precioMundo(60);
  const i = await panelOpciones('El gashapón', 'Un gashapón de Microblizz. Dentro hay objetos… y mucho plástico.', [
    { n: 'Girar gratis', d: 'Un objeto al azar.' },
    { n: 'Girar a lo grande', d: 'Un objeto raro o mejor.', precio, no: H.monedas < precio },
  ]);
  if (i === 1) { H.monedas -= precio; sonido('compra'); rotulo(MONEDERO[0], ESC.Y + 12, '-' + precio, '#ff5a6a', 1.4); }
  PROP.sacude = 1; sonido('gashapon'); await espera(0.9); PROP.sacude = 0;
  const x0 = PROP.x + 5, y0 = SUELO - 10, x1 = CONEJO.x + 12, y1 = SUELO - 34, cap = fx('spr', { spr: SPR.capsulas[Math.floor(Math.random() * 5)], x: x0, y: y0, vida: 9 });
  sonido('salto');
  await anima(0.5, k => { cap.x = x0 + (x1 - x0) * k; cap.y = y0 + (y1 - y0) * k - salto(k) * 24; });
  cap.t = cap.vida; chispas(x1, y1, 16, '#fff3a0', 110); anillo(x1, y1, 22, '#fff6ea', 0.3); trozos(x1, y1, 6, ['#ff7aa8', '#fff6ea']);
  await premioObjeto(i === 1 ? 'rare' : 'basic');
}

// monedas por el camino: el conejo las recoge al pasar, sin pararse
async function diaMonedas() {
  log('¡A un camión de Microblizz se le han caído monedas!'); chatEv('monedas', null, 0.9, 0);
  const n = 12, v = Math.max(1, Math.round((2 + VIAJE.dia * 0.12) * (1 + VIAJE.mundo * 0.6)));
  for (let i = 0; i < n; i++) VIAJE.sueltas.push({ wx: VIAJE.mx + PAN.W + 10 + i * 11 + (i % 3) * 2, v });
  VIAJE.vel = 70; VIAJE.andando = true; ponAnim(CONEJO, 'andar'); if (ARDILLA.activa) ponAnim(ARDILLA, 'andar');
  while (VIAJE.sueltas.length) await siguiente();
  VIAJE.vel = 40;
  await anda(0.4);
}
// recoge las monedas sueltas que ya ha alcanzado (cada fotograma)
function recogeSueltas() {
  for (let i = VIAJE.sueltas.length - 1; i >= 0; i--) {
    const m = VIAJE.sueltas[i], x = m.wx - VIAJE.mx;
    if (x > CONEJO.x + 4) continue;
    VIAJE.sueltas.splice(i, 1);
    const g = ganaMonedas(H, m.v); H.monedas -= g;
    moneda(x, SUELO - 6, () => { H.monedas += g; sonido('moneda'); });
    chispas(x, SUELO - 6, 3, '#fff3a0', 50);
  }
}

// lo que se gana al vencer: experiencia (y niveles), y el objeto de los de élite y de los mini jefes
async function recompensas(e, tipo) {
  if (e.xp) { const [cx, cy] = centro(CONEJO); rotulo(cx, cy - 34, '+' + e.xp + ' XP', '#5aaeff', 1); }
  const n = ganaXp(H, e.xp);
  for (let i = 0; i < n; i++) await subeYElige();
  if (tipo === 'elite') await premioObjeto('common');
  if (tipo === 'mini') { await premioObjeto('rare'); await premioHabilidad(null, true); }
}
// raid: otro canal manda a sus espectadores y llueven regalos (sin pararse)
async function diaRaid() {
  const u = CHAT_USUARIOS[Math.floor(Math.random() * CHAT_USUARIOS.length)][0], n = Math.round((200 + Math.random() * 300) * (1 + VIAJE.mundo));
  VIAJE.esp += n; sonido('sirena');
  rotulo(PAN.W / 2, ESC.Y + 50, tr('¡RAID!'), '#e91e3c', 1.6, 3);
  log('¡{u} hace una raid con {n} espectadores! Llueven regalos.', { u, n: miles(n) });
  chatRafaga('raid', 4);
  for (let i = 0; i < 4; i++) { await espera(0.45); lluviaMonedas(rnd(30, PAN.W - 30), ESC.Y + 40, ganaMonedas(H, precioMundo(6)), 8, i > 0); }
  await anda(1.2);
}
// el comerciante misterioso: FallenHero vende lo que le queda de cuando era protagonista
async function diaMisterioso() {
  await paraEnProp('fallen');
  bocadillo(PROP, 'Psst… ¿quieres algo de cuando era famoso?', 2); sonido('voz');
  consejo('misterioso'); chatEv('misterioso', null, 1, 0);
  await espera(0.8);
  const po = precioMundo(90), ph = precioMundo(110);
  const i = await panelOpciones('Un comerciante misterioso', 'FallenHero vende su equipo de cuando era protagonista. «Solo lo usé en una secuela».', [
    { n: 'Su equipo', d: 'Un objeto épico o legendario.', precio: po, no: H.monedas < po },
    { n: 'Su secreto', d: 'Eliges 1 de 3 habilidades épicas o legendarias.', precio: ph, no: H.monedas < ph },
    { n: 'No, gracias', d: 'FallenHero suspira. Otra vez.' },
  ]);
  if (i < 2) {
    const p = i === 0 ? po : ph; H.monedas -= p; sonido('compra'); rotulo(MONEDERO[0], ESC.Y + 12, '-' + p, '#ff5a6a', 1.4);
    bocadillo(PROP, '¡Gracias! Por fin pago el alquiler.', 1.6);
    if (i === 0) await premioObjeto('epic'); else await premioHabilidad('epic');
  } else { bocadillo(PROP, 'Volveré… en el DLC.', 1.6); await espera(1); }
}
// el bug de Microblizz: la pantalla se rompe y pasa algo raro (casi siempre bueno)
async function diaBug() {
  await anda(0.8);
  VIAJE.andando = false; ponAnim(CONEJO, 'quieto');
  VIAJE.glitch = RELOJ.t + 1.4; sonido('rayo'); tiembla(3);
  chatRafaga('bug', 3);
  await espera(1.5);
  const r = Math.random(), antes = foto();
  if (r < 0.4) {
    const n = Math.min(H.monedas, precioMundo(80));
    log('¡El bug duplica tus monedas! (Microblizz lo arreglará en el próximo parche).');
    rotulo(PAN.W / 2, ESC.Y + 60, tr('¡MONEDAS x2!'), COL.oro, 1.6);
    lluviaMonedas(CONEJO.x + 20, SUELO - 40, Math.max(5, n), 20, true);
  } else if (r < 0.75) {
    const res = afilar(H);
    log('El bug sube de nivel algo tuyo sin querer.');
    if (res.sube) { const hab = HABILIDADES[res.sube]; rotulo(CONEJO.x, SUELO - 66, tr(hab.n), RAREZA[hab.rar][1], 1.4); rotulo(CONEJO.x, SUELO - 56, formatea(tr('Nv {n}'), { n: nivelHab(H, res.sube) }), '#ffcb3d', 1.4); sonido('nivel'); }
    muestraCambios(antes);
  } else {
    dana(H, H.vidaMax * 0.15); muestraCambios(antes);
    log('Error 404: parte de tu vida no encontrada.');
    rotulo(PAN.W / 2, ESC.Y + 60, 'ERROR 404', '#33e0ff', 1.6);
  }
  await espera(1.2);
  await anda(0.3);
}
const EVENTO_DIA = { raid: diaRaid, misterioso: diaMisterioso, bug: diaBug, encuentro: diaEncuentro, tienda: diaTienda, cofre: diaCofre, ruleta: diaRuleta, gashapon: diaGashapon, hoguera: diaHoguera, monedas: diaMonedas, pase: diaPase };
