// Fans of Roguelite (prototipo) · El viaje: los 6 días uno detrás de otro. Cada día empieza con su cartel, el conejo camina solo
// y se encuentra un combate o una elección; al ganar sube de nivel y eliges 1 de 3 habilidades. Al final, el jefe.
'use strict';

const VIAJE = { modo: 'titulo', andando: true, mx: 0, vel: 40, dia: 0, fundido: 0, cartel: null, fin: null };

async function partida() {
  cancelaTodo();
  H = nuevoHeroe(); H.vidaVista = H.vida;
  FX.length = 0; RIVAL = null; PROP = null; ARDILLA.activa = false;
  CONEJO.x = POS.conejo(); CONEJO.z = 0; CONEJO.parpadeo = false;
  VIAJE.modo = 'juego'; VIAJE.fin = null; LOG.length = 0; PANEL.modo = 'log';
  musica('viaje');
  try {
    for (let d = 0; d < DIAS.length; d++) {
      const dia = DIAS[d];
      await empiezaDia(d);
      if (dia.tipo === 'combate') {
        await anda(dia.enemigo === 'jefe' ? 0.8 : 1.4);
        if (!await combate(dia)) return await derrota();
        if (d < DIAS.length - 1) await subeYElige(dia);
      } else await eleccion(dia);
    }
    await victoria();
  } catch (e) { if (e !== CANCELADO) throw e; }
}

async function empiezaDia(d) {
  const dia = DIAS[d];
  if (d > 0) await anima(0.4, k => { VIAJE.fundido = k; });
  VIAJE.dia = d; preparaFondo(d); FONDO.sigProp = VIAJE.mx + 30;
  VIAJE.andando = true; ponAnim(CONEJO, 'andar'); if (ARDILLA.activa) ponAnim(ARDILLA, 'andar');
  VIAJE.cartel = { n: d + 1, titulo: dia.titulo, t0: RELOJ.t };
  sonido('dia');
  log('Día {n}: {t}.', { n: d + 1, t: tr(dia.titulo) });
  if (dia.intro) log(dia.intro);
  if (d > 0) await anima(0.4, k => { VIAJE.fundido = 1 - k; });
  VIAJE.fundido = 0;
  await espera(0.6);
}
async function anda(s) { VIAJE.andando = true; ponAnim(CONEJO, 'andar'); if (ARDILLA.activa) ponAnim(ARDILLA, 'andar'); await espera(s); }

// subir de nivel y elegir habilidad
async function subeYElige(dia) {
  ponAnim(CONEJO, 'gana'); if (ARDILLA.activa) ponAnim(ARDILLA, 'quieto');
  const cura = subeNivel(H);
  sonido('nivel');
  const [cx, cy] = centro(CONEJO);
  anillo(cx, cy, 34, '#ffcb3d', 0.45); chispas(cx, cy, 14, '#ffcb3d', 110);
  rotulo(cx, SUELO - 64, tr('¡NIVEL {n}!').replace('{n}', H.nivel), '#ffcb3d', 1.3);
  numero(cx - 10, cy - 10, '+' + cura, 'cura');
  log('¡Subes a nivel {n}! Más vida y más ataque.', { n: H.nivel });
  await espera(1.0);
  if (dia.cofre) log('La CajaBotín ha soltado algo bueno: ¡habilidades raras!');
  const ofs = ofertas(H, dia.cofre);
  const i = await panelHabilidad(ofs, dia.cofre);
  const id = ofs[i], hab = HABILIDADES[id], antes = { atq: H.atq, vidaMax: H.vidaMax };
  aplicaHabilidad(H, id);
  sonido('nivel');
  rotulo(cx, SUELO - 64, tr(hab.n), RAREZA[hab.rar][1], 1.4); chispas(cx, cy, 12, RAREZA[hab.rar][1], 100);
  cambiosEn(antes);
  log('Aprendes {h}.', { h: tr(hab.n) });
  if (id === 'ardilla') await llegaArdilla();
  await espera(0.7);
}
// enseña lo que ha cambiado (ataque y vida máxima)
function cambiosEn(antes) {
  const [cx] = centro(CONEJO);
  if (H.atq !== antes.atq) rotulo(cx + 22, SUELO - 40, (H.atq > antes.atq ? '+' : '') + (H.atq - antes.atq) + ' ' + tr('ATQ'), '#ff8a1f', 1.3);
  if (H.vidaMax !== antes.vidaMax) rotulo(cx - 20, SUELO - 30, (H.vidaMax > antes.vidaMax ? '+' : '') + (H.vidaMax - antes.vidaMax) + ' ' + tr('VIDA MÁX'), H.vidaMax > antes.vidaMax ? '#7be04a' : '#ff5a6a', 1.3);
}
async function llegaArdilla() {
  ARDILLA.activa = true; ARDILLA.x = -20; ARDILLA.z = 0; ponAnim(ARDILLA, 'andar');
  const xd = POS.conejo() - 26;
  await anima(0.7, k => { ARDILLA.x = Math.round(-20 + (xd + 20) * sale(k)); });
  ponAnim(ARDILLA, 'quieto'); bocadillo(ARDILLA, '¡Bellotaaas!', 1.2); sonido('voz');
}

// los días de elegir: el puesto de Lola y el abogado
async function eleccion(dia) {
  await anda(1.0);
  PROP = { tipo: dia.prop, wx: VIAJE.mx + PAN.W + 30, t0: RELOJ.t, anim: 'quieto', x: PAN.W + 30, y: SUELO, z: 0, alto: dia.prop === 'puesto' ? 44 : 32 };
  while (PROP.wx - VIAJE.mx > POS.rival() + 4) await siguiente();
  VIAJE.andando = false; ponAnim(CONEJO, 'quieto'); if (ARDILLA.activa) ponAnim(ARDILLA, 'quieto');
  sonido('alerta'); rotulo(CONEJO.x, SUELO - 62, '?', '#5aaeff', 0.7);
  if (dia.prop === 'abogado') { bocadillo(PROP, '¿Firmamos?', 1.6); sonido('voz'); }
  else { bocadillo(PROP, '¡Café gratis!', 1.6); sonido('voz'); }
  await espera(0.5);
  const i = await panelOpciones(dia.titulo, dia.texto, dia.opciones);
  const o = dia.opciones[i], antes = { atq: H.atq, vidaMax: H.vidaMax, vida: H.vida };
  o.efecto(H);
  const [cx, cy] = centro(CONEJO);
  sonido(H.vida >= antes.vida ? 'nivel' : 'herida');
  if (H.vida > antes.vida) { numero(cx, cy - 10, '+' + (H.vida - antes.vida), 'cura'); chispas(cx, cy, 8, '#7be04a', 80); }
  if (H.vida < antes.vida) { numero(cx, cy - 10, antes.vida - H.vida, 'herida'); CONEJO.blanco = 0.1; }
  cambiosEn(antes);
  ponAnim(CONEJO, H.atq > antes.atq ? 'gana' : 'quieto');
  bocadillo(PROP, o.dice, 2.4); sonido('voz');
  log('{q}: {d}{n}', { q: tr(dia.quien), d: tr(o.dice), n: o.nota ? ' ' + tr(o.nota) : '' });
  await espera(2.4);
  await anda(0.1);
}

async function derrota() {
  VIAJE.andando = false; musica(null); sonido('derrota');
  ponAnim(CONEJO, 'dano'); CONEJO.parpadeo = true;
  await anima(0.5, k => { CONEJO.z = Math.round(salto(k) * 14); });
  CONEJO.z = 0; CONEJO.parpadeo = false;
  log('Te han despedido. Microblizz te agradece los servicios prestados.');
  await espera(1.0);
  VIAJE.fin = { gana: false, t0: RELOJ.t }; VIAJE.modo = 'fin'; PANEL.modo = 'fin';
}
async function victoria() {
  ponAnim(CONEJO, 'gana'); if (ARDILLA.activa) ponAnim(ARDILLA, 'quieto');
  musica(null); sonido('victoria');
  for (let i = 0; i < 4; i++) espera(i * 0.25).then(() => chispas(rnd(20, PAN.W - 20), ESC.Y + rnd(20, 70), 14, ['#ffcb3d', '#ff7aa8', '#5aaeff', '#7be04a'][i], 120)).catch(() => {});
  log('¡SurvivalBot despedido! Las oficinas de Microblizz están a la vista… en el próximo prototipo.');
  VIAJE.fin = { gana: true, t0: RELOJ.t }; VIAJE.modo = 'fin'; PANEL.modo = 'fin';
  await espera(2.2);
  await anda(0.1);
}

// lo que se mueve cada fotograma mientras se camina
function avanzaViaje(dt) {
  if (VIAJE.andando) {
    const antes = Math.floor((RELOJ.t - dt - CONEJO.t0) * 13) % 8, ahora = Math.floor((RELOJ.t - CONEJO.t0) * 13) % 8;
    VIAJE.mx += VIAJE.vel * dt;
    if (CONEJO.anim === 'andar' && ahora === 0 && antes !== 0) { polvo(CONEJO.x - 8, SUELO, 2, -1); sonido('paso'); }
  }
  avanzaProps(VIAJE.mx, PAN.W);
  if (PROP && PROP.wx - VIAJE.mx < -80) PROP = null;
  if (ARDILLA.activa && VIAJE.andando && ARDILLA.anim === 'andar') ARDILLA.x = CONEJO.x - 26;
  if (H) H.vidaVista += (H.vida - H.vidaVista) * Math.min(1, dt * 5);
}
