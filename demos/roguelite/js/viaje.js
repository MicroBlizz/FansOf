// Fans of Roguelite · El viaje: los 40 días de un mundo uno detrás de otro. Cada día empieza con su cartel, el conejo camina
// solo y se encuentra un combate o un evento; el paisaje cambia de la mañana a la noche del jefe. La partida se guarda al
// empezar cada día (para «Continuar») y, al acabar, las monedas van a La Madriguera.
'use strict';

const VIAJE = { modo: 'menu', andando: false, mx: 0, vel: 40, mundo: 0, dia: 1, plan: null, fundido: 0, cartel: null, fin: null, usados: [], sueltas: [], esp: 0, espVista: 0, glitch: 0 };

// empieza un mundo (o sigue la partida guardada si «seguir»)
async function partida(mundo, seguir) {
  cancelaTodo();
  FX.length = 0; RIVAL = null; PROP = null; COMBATE.c = null; VIAJE.sueltas = [];
  CONEJO.z = 0; CONEJO.parpadeo = false; CONEJO.blanco = 0;
  LOG.length = 0; PANEL.modo = 'log'; VIAJE.modo = 'juego'; VIAJE.fin = null; VIAJE.vel = 40; VIAJE.cartel = null;
  let d0 = 1;
  const r = GUARDA.run;
  if (seguir && r) {
    Object.assign(VIAJE, { mundo: r.mundo, plan: r.plan, usados: r.usados || [] });
    H = r.h; recalcula(H); d0 = r.dia;
  } else {
    Object.assign(VIAJE, { mundo, plan: planMundo(mundo), usados: [] });
    H = nuevoHeroe(); GUARDA.partidas++;
  }
  H.vidaVista = H.vida;
  ARDILLA.activa = nivelHab(H, 'ardilla') > 0; ARDILLA.x = POS.conejo() - 26; ARDILLA.z = 0;
  CONEJO.x = POS.conejo();
  const M = MUNDOS[VIAJE.mundo];
  VIAJE.fase = -1; VIAJE.fundido = 1;
  musica(M.musica);
  nuevoDirecto();
  try {
    if (d0 === 1) log(M.intro); else log('Sigues donde lo dejaste: {m}, día {n}.', { m: tr(M.n), n: d0 });
    chatRafaga('inicio', 3);
    for (let d = d0; d <= M.dias; d++) {
      await empiezaDia(d);
      if (d === 1 && d0 === 1) consejo('inicio');
      if (!await juegaDia(VIAJE.plan[d - 1])) return await derrota();
      PROP = null;
      if (d % DIAS_CAPITULO === 0 && d < M.dias) await finCapitulo(d);
    }
    await victoria();
  } catch (e) { if (e !== CANCELADO) throw e; }
}

async function juegaDia(tipo) {
  const M = MUNDOS[VIAJE.mundo];
  if (tipo === 'combate' || tipo === 'elite' || tipo === 'mini' || tipo === 'jefe') {
    const id = tipo === 'mini' ? M.mini : tipo === 'jefe' ? M.jefe : M.enemigos[Math.floor(Math.random() * M.enemigos.length)];
    await anda(tipo === 'jefe' ? 0.8 : 1.2);
    if (tipo === 'elite') consejo('elite');
    const e = await combate(id, tipo === 'elite');
    if (!e) return false;
    if (tipo !== 'jefe') await recompensas(e, tipo);
    return true;
  }
  await EVENTO_DIA[tipo]();
  return true;
}

const faseDe = (d, dias) => Math.min(5, Math.floor((d - 1) / dias * 6));
async function empiezaDia(d) {
  const M = MUNDOS[VIAJE.mundo], tipo = VIAJE.plan[d - 1], fase = faseDe(d, M.dias);
  VIAJE.dia = d;
  if (d > 1) VIAJE.esp += Math.round((2 + Math.random() * 6) * (1 + VIAJE.mundo));
  // se guarda al empezar el día: si sales, «Continuar» vuelve aquí
  guardaRun(d);
  if (fase !== VIAJE.fase) {
    if (VIAJE.fundido < 1) await anima(0.45, k => { VIAJE.fundido = k; });
    VIAJE.fase = fase; preparaFondo(VIAJE.mundo, fase); FONDO.sigProp = VIAJE.mx + 30;
    FONDO.cosas = []; avanzaProps(VIAJE.mx, PAN.W);
  }
  VIAJE.andando = true; ponAnim(CONEJO, 'andar'); if (ARDILLA.activa) ponAnim(ARDILLA, 'andar');
  const cap = (d - 1) % DIAS_CAPITULO === 0 ? Math.floor((d - 1) / DIAS_CAPITULO) : -1;
  VIAJE.cartel = { n: d, titulo: TITULO_DIA[tipo], t0: RELOJ.t, jefe: tipo === 'jefe' || tipo === 'mini', cap: cap >= 0 ? { n: cap + 1, nombre: M.capitulos[cap] } : null };
  if (cap >= 0) log('Capítulo {n}: {c}.', { n: cap + 1, c: tr(M.capitulos[cap]) });
  sonido('dia');
  log('Día {n}: {t}.', { n: d, t: tr(TITULO_DIA[tipo]) });
  if (VIAJE.fundido > 0) await anima(0.45, k => { VIAJE.fundido = 1 - k; });
  VIAJE.fundido = 0;
  // la cuota del Pase Premium: cada día, un poco menos de vida máxima
  if (H.cuota > 0 && d > 1) {
    const antes = foto(); extra(H, 'vida', -H.cuota); muestraCambios(antes);
    log('Cuota del Pase Premium: -{n} de vida máxima.', { n: H.cuota });
    chatEv('cuota', null, 0.5, 20);
  }
  await espera(0.6);
}
function guardaRun(d) {
  GUARDA.run = { mundo: VIAJE.mundo, dia: d, plan: VIAJE.plan, usados: VIAJE.usados, h: JSON.parse(JSON.stringify(H)) };
  guarda();
}
// fin de capítulo: fiesta, premio (monedas y cura) y elegir entre seguir o descansar en La Madriguera
async function finCapitulo(d) {
  const M = MUNDOS[VIAJE.mundo], n = d / DIAS_CAPITULO;
  VIAJE.andando = false; ponAnim(CONEJO, 'gana'); if (ARDILLA.activa) ponAnim(ARDILLA, 'quieto');
  sonido('victoria'); destella('#fff3a0', 0.06);
  rotulo(PAN.W / 2, ESC.Y + 50, formatea(tr('¡CAPÍTULO {n} SUPERADO!'), { n }), COL.oro, 2.2, 1);
  for (let i = 0; i < 6; i++) espera(i * 0.2).then(() => { chispas(rnd(20, PAN.W - 20), ESC.Y + rnd(40, 90), 14, ['#ffcb3d', '#ff7aa8', '#5aaeff', '#7be04a'][i % 4], 120); sonido('moneda'); }).catch(() => {});
  chatRafaga('capitulo', 3);
  log('¡Capítulo {n} superado! Premio: monedas y un descanso.', { n });
  await espera(0.8);
  const antes = foto(); cura(H, H.vidaMax * 0.25); muestraCambios(antes);
  lluviaMonedas(PAN.W / 2, ESC.Y + 70, ganaMonedas(H, precioMundo(15 + n * 10)), 18);
  await espera(1.4);
  guardaRun(d + 1);
  consejo('capitulo');
  const sig = formatea(tr('Capítulo {n}: {c}'), { n: n + 1, c: tr(M.capitulos[n]) });
  const i = await panelOpciones(formatea(tr('Capítulo {n} superado'), { n }), formatea(tr('Lo siguiente: {s}. Tu partida está guardada.'), { s: sig }), [
    { n: 'Seguir', d: formatea(tr('Empieza el {s}.'), { s: sig }) },
    { n: 'Descansar en La Madriguera', d: 'Sigues después desde aquí con «Continuar».' },
  ]);
  if (i === 1) { volverMadriguera(); throw CANCELADO; }
  ponAnim(CONEJO, 'andar');
}
async function anda(s) { VIAJE.andando = true; ponAnim(CONEJO, 'andar'); if (ARDILLA.activa) ponAnim(ARDILLA, 'andar'); await espera(s); }

async function derrota() {
  VIAJE.andando = false; musica(null); sonido('derrota');
  ponAnim(CONEJO, 'dano'); CONEJO.parpadeo = true;
  await anima(0.5, k => { CONEJO.z = Math.round(salto(k) * 14); });
  CONEJO.z = 0; CONEJO.parpadeo = false;
  log('Te han despedido. Microblizz te agradece los servicios prestados.');
  chatRafaga('derrota', 4);
  await espera(1.0);
  finPartida(false);
}
async function victoria() {
  ponAnim(CONEJO, 'gana'); if (ARDILLA.activa) ponAnim(ARDILLA, 'quieto');
  musica(null); sonido('victoria');
  for (let i = 0; i < 8; i++) espera(i * 0.22).then(() => { chispas(rnd(20, PAN.W - 20), ESC.Y + rnd(20, 80), 16, ['#ffcb3d', '#ff7aa8', '#5aaeff', '#7be04a'][i % 4], 130); sonido('moneda'); }).catch(() => {});
  log(['¡SurvivalBot despedido! Las oficinas de Microblizz ya no dan miedo.', '¡NecroLord enterrado! El cementerio descansa en paz.', '¡El CEO, despedido! Microblizz es ahora una cooperativa.'][VIAJE.mundo]);
  chatRafaga('victoria', 5);
  await espera(1.6);
  finPartida(true);
  await espera(0.6);
}
// fin de la partida: monedas a La Madriguera, récord y, si ganas, el mundo siguiente
function finPartida(gana) {
  const m = VIAJE.mundo, dia = gana ? MUNDOS[m].dias : VIAJE.dia;
  const record = dia > (GUARDA.record[m] || 0) || (gana && !GUARDA.victorias[m]);
  GUARDA.record[m] = Math.max(GUARDA.record[m] || 0, dia);
  let abre = false;
  if (gana) { GUARDA.victorias[m] = (GUARDA.victorias[m] || 0) + 1; if (m === GUARDA.abierto && m < MUNDOS.length - 1) { GUARDA.abierto = m + 1; abre = true; } }
  GUARDA.monedas += H.monedas; GUARDA.run = null;
  guarda();
  VIAJE.fin = { gana, t0: RELOJ.t, record, abre, monedas: H.monedas, dia };
  VIAJE.modo = 'fin'; PANEL.modo = 'fin';
}

// lo que se mueve cada fotograma mientras se camina
function avanzaViaje(dt) {
  if (VIAJE.andando) {
    const antes = Math.floor((RELOJ.t - dt - CONEJO.t0) * 13) % 8, ahora = Math.floor((RELOJ.t - CONEJO.t0) * 13) % 8;
    VIAJE.mx += VIAJE.vel * dt;
    if (CONEJO.anim === 'andar' && ahora === 0 && antes !== 0) { polvo(CONEJO.x - 8, SUELO, 2, -1); sonido('paso'); }
  }
  if (FONDO.estilo) avanzaProps(VIAJE.mx, PAN.W);
  if (VIAJE.sueltas.length && H) recogeSueltas();
  if (PROP && PROP.wx - VIAJE.mx < -80) PROP = null;
  if (ARDILLA.activa && VIAJE.andando && ARDILLA.anim === 'andar') ARDILLA.x = CONEJO.x - 26;
  if (H) H.vidaVista += (H.vida - H.vidaVista) * Math.min(1, dt * 5);
  avanzaChat(dt);
}
