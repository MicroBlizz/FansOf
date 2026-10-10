// Fans of Rouflage (prototipo) · LA PARTIDA: quién sale en cada papel, las fases (pintarse, cuenta atrás, caza y final), los silbidos
// obligatorios, la recta final, cuándo se gana o se pierde y los puntos. Las cifras están en AJUSTES (entes.js).
'use strict';

function limpiaPartida() {
  J.entes.length = 0; J.camaleones.length = 0; J.cazadores.length = 0; J.yo = null; J.resultado = null;
  J.cuenta = { narices: 0, silbidos: 0, aciertos: 0, fallos: 0, senuelos: 0, aguante: 0 };
  J.oscuro = 0; J.pings = 0; J.avisado = false; J.recta = false; J.peligro = 0; J.pausa = false; J.finMostrado = false;
  PUERTA.cerrada = true; PUERTA.abierta = 0;
  if (TALLER.abierto) cierraTaller();
  TALLER.color = BLANCO_PIEL; TALLER.recientes = [BLANCO_PIEL]; TALLER.calco = true; TALLER.radio = RADIOS[1];
  limpiaFx(); limpiaAvisos();
  M.tmT = 1;
}

// la pantalla de título: el mapa de fondo con cinco alubias de paseo por la cafetería
function escenaTitulo() {
  limpiaPartida(); J.fase = 'titulo'; J.modo = 'camaleon'; J.t = 0;
  Object.keys(NOMBRES).forEach((tipo, i) => {
    const e = nuevoEnte('camaleon', tipo, NOMBRES[tipo], ...SALIDA_CAMALEONES[i]);
    e.bot = { estado: 'pasea', t: 0, camino: null, i: 0, atasco: 0, ax: e.x, ay: e.y, espera: rand(0, 1.5) };
  });
  musica('menu'); avanzaCamara(0, true);
}

function empiezaPartida(modo) {
  limpiaPartida(); J.modo = modo; J.t = 0;
  if (modo === 'camaleon') {
    // tú eres CrazyBunny; tres compañeros se esconden por su cuenta y dos becarios esperan encerrados en Recursos Humanos
    const yo = nuevoEnte('camaleon', 'bunny', NOMBRES.bunny, ...SALIDA_CAMALEONES[0]); yo.jugador = true; J.yo = yo;
    const ocupados = [];
    [['squirrel', 0.2], ['fox', 0.86], ['meercat', 0.55]].forEach(([tipo, mana], i) => {
      const e = nuevoEnte('camaleon', tipo, NOMBRES[tipo], ...SALIDA_CAMALEONES[i + 1]);
      cerebroCamaleon(e, mana); e.sitio = eligeSitio(e, ocupados); ocupados.push(e.sitio);
    });
    SALIDA_CAZADORES.forEach(([x, y], i) => { const h = nuevoEnte('cazador', 'becario', tr('Becario {n}').replace('{n}', [7, 12][i]), x, y); cerebroCazador(h); h.dir = -Math.PI / 2 + (i ? 0.5 : -0.5); h.mira = i ? -1 : 1; });
    cambiaFase('prep');
  } else {
    // tú eres el becario; cinco colados ya están escondidos y pintados, cada uno con su maña
    const yo = nuevoEnte('cazador', 'becario', tr('Tú'), ...SALIDA_CAZADORES[1]); yo.jugador = true; J.yo = yo; yo.dir = 0;
    const ocupados = [];
    baraja([['bunny', 0.5], ['squirrel', 0.2], ['fox', 0.88], ['meercat', 0.64], ['coon', 0.36]]).forEach(([tipo, mana]) => {
      const e = nuevoEnte('camaleon', tipo, NOMBRES[tipo], 0, 0);
      cerebroCamaleon(e, mana); e.sitio = eligeSitio(e, ocupados); ocupados.push(e.sitio); escondeYa(e);
    });
    cambiaFase('cuenta');
  }
  avanzaCamara(0, true);
  refrescaHud(true);
}

function cambiaFase(f) {
  J.fase = f; J.tFase = 0;
  if (f === 'prep') {
    J.reloj = AJUSTES.prep; musica('menu');
    cartel(tr('¡PÍNTATE!'), tr('Busca un sitio, cópiale los colores y congélate'));
  } else if (f === 'cuenta') {
    J.reloj = AJUSTES.cuenta; J.digito = 0;
    if (TALLER.abierto) cierraTaller();
    for (const e of J.camaleones) if (e.bot && e.bot.estado !== 'quieto') escondeYa(e);
    // si se te acaba el tiempo sin congelarte, te quedas congelado donde estés (luego puedes moverte, bajo tu cuenta y riesgo)
    if (J.modo === 'camaleon' && J.yo && !J.yo.congelado) { congela(J.yo); play('congela'); }
  } else if (f === 'caza') {
    J.reloj = J.modo === 'camaleon' ? AJUSTES.caza : AJUSTES.cazaCazador; J.silbido = AJUSTES.primerSilbido; J.avisado = false;
    PUERTA.cerrada = false;
    for (const h of J.cazadores) if (h.bot) ronda(h);
    musica('boss0'); play('go'); play('luces');
    cartel(J.modo === 'camaleon' ? tr('¡QUE VIENEN!') : tr('¡A BUSCAR!'), J.modo === 'camaleon' ? tr('Microblizz apaga las luces para ahorrar') : tr('Hay {n} colados. Toca donde creas que hay uno.').replace('{n}', escondidos().length));
  }
  refrescaHud(true);
}

// el silbido obligatorio: todos los escondidos silban, cada uno con un poco de retraso
function silbidoGeneral() {
  for (const k of escondidos()) k.silbaEn = rand(0.05, 1.3);
  J.silbido = AJUSTES.silbido; J.avisado = false;
}
// en la recta final los cazadores reciben pistas: un chivatazo a los bots, o una onda en pantalla si el cazador eres tú
function chivatazo() {
  const quedan = escondidos(); if (!quedan.length) return;
  if (J.modo === 'cazador') { for (const k of quedan) { const a = rand(0, TAU), d = rand(8, 30); ondaSilbido(k.x + Math.cos(a) * d, k.y - 22 + Math.sin(a) * d, k); } return; }
  for (const h of J.cazadores) {
    if (!h.bot || h.fuera || h.balas <= 0) continue;
    let cerca = null, md = 1e9; for (const k of quedan) { const d = lejos(h.x, h.y, k.x, k.y); if (d < md) { md = d; cerca = k; } }
    if (cerca) { const a = rand(0, TAU), d = rand(30, 70); const antes = AJUSTES.oido; AJUSTES.oido = 1e9; oyeSilbido(h, cerca.x + Math.cos(a) * d, cerca.y + Math.sin(a) * d); AJUSTES.oido = antes; }
  }
}

function avanzaPartida(dt) {
  J.t += dt; J.tFase += dt;
  for (const k of J.camaleones) k.enVista = false;
  controlaJugador(dt);
  for (const e of J.entes) {
    if (e.bot && J.fase !== 'fin') (e.clase === 'cazador' ? piensaCazador : piensaCamaleon)(e, dt);
    else if (e.bot) e.vx = e.vy = 0;
    avanzaEnte(e, dt);
    if (e.silbaEn > 0) { e.silbaEn -= dt; if (e.silbaEn <= 0 && J.fase === 'caza') silba(e, true); }
  }
  miraLosOjos();
  PUERTA.abierta = limita(PUERTA.abierta + (PUERTA.cerrada ? -dt : dt) * 1.5, 0, 1);
  J.oscuro += ((J.fase === 'caza' || (J.fase === 'fin' && J.tFase < 1.2) ? 1 : 0) - J.oscuro) * Math.min(1, dt * 2.2);
  const yo = J.yo;

  if (J.fase === 'prep') {
    J.reloj -= dt;
    if (J.reloj <= 0) cambiaFase('cuenta');
  } else if (J.fase === 'cuenta') {
    J.reloj -= dt;
    const d = Math.ceil(J.reloj - 0.4);
    if (d !== J.digito && d >= 1 && d <= 3) { J.digito = d; cartel(String(d), J.modo === 'camaleon' ? tr('Los becarios salen de Recursos Humanos') : tr('Los colados ya están escondidos'), true); play('tick'); }
    if (J.reloj <= 0) cambiaFase('caza');
  } else if (J.fase === 'caza') {
    J.reloj -= dt; J.cuenta.aguante += dt;
    J.silbido -= dt;
    if (J.silbido <= 5 && !J.avisado) { J.avisado = true; if (J.modo === 'camaleon') { avisa(tr('Silbido obligatorio en 5 segundos'), 'aviso'); play('tick'); } }
    if (J.silbido <= 0) silbidoGeneral();
    if (J.reloj <= AJUSTES.rectaFinal && !J.recta) { J.recta = true; M.tmT = 1.2; cartel(tr('¡RECTA FINAL!'), J.modo === 'camaleon' ? tr('Los becarios reciben un chivatazo') : tr('Los colados silban más a menudo'), true); play('horn'); J.pings = 0; }
    if (J.recta) { J.pings -= dt; if (J.pings <= 0) { J.pings = J.modo === 'cazador' ? 6 : 10; chivatazo(); } }
    if (yo.clase === 'camaleon') {
      if (yo.congelado && yo.enVista) J.cuenta.narices += dt;   // delante de sus narices: en la luz de un becario sin que te vea
      // el peligro: la mayor sospecha que algún becario tiene de ti, y lo cerca que anda el más próximo
      let p = 0; for (const h of J.cazadores) if (h.bot && !h.fuera && h.balas > 0) p = Math.max(p, (h.bot.sosp.get(yo) || 0), 0.45 * limita(1 - lejos(h.x, h.y, yo.x, yo.y) / 230, 0, 1), h.bot.objetivo === yo ? 0.7 : 0);
      J.peligro += (limita(p, 0, 1) - J.peligro) * Math.min(1, dt * 6);
    }
    // ¿se acaba?
    if (J.modo === 'camaleon') {
      if (yo.fuera) termina(false, 'despedido');
      else if (J.reloj <= 0) termina(true, 'tiempo');
      else if (!cazadoresVivos().length) termina(true, 'cartas');
    } else if (!escondidos().length) termina(true, 'todos');
    else if (yo.balas <= 0) termina(false, 'cartas');
    else if (J.reloj <= 0) termina(false, 'tiempo');
  } else if (J.fase === 'fin') {
    J.peligro *= 0.9;
    if (J.tFase > 2.6 && !J.finMostrado) { J.finMostrado = true; muestraFin(); }
  }
}
// los ojos de cada alubia miran al cazador más cercano; si lo tienen encima, cara de susto
function miraLosOjos() {
  for (const e of J.camaleones) {
    if (e.fuera || e.hielo > 0.9) continue;
    let cerca = null, md = 330; for (const h of J.cazadores) if (!h.fuera) { const d = lejos(e.x, e.y, h.x, h.y); if (d < md) { md = d; cerca = h; } }
    if (cerca && J.fase !== 'prep') { e.ojoX = ((cerca.x - e.x) / md) * 1.7 * e.mira; e.ojoY = ((cerca.y - e.y) / md) * 1.2; e.susto = md < 150; }
    else { e.ojoX = e.moviendo ? 1 : 0; e.ojoY = 0; e.susto = false; }
  }
}

const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function termina(victoria, motivo) {
  if (J.fase === 'fin') return;
  J.fase = 'fin'; J.tFase = 0; M.tmT = 1;
  if (TALLER.abierto) cierraTaller();
  const yo = J.yo, k = J.cuenta, quedan = escondidos();
  for (const e of quedan) { descongela(e); if (e !== yo) fxTexto(e.x, e.y - 74, e.nombre, '#fff6ea', 12); }   // al acabar, todos los escondidos se dejan ver
  let titulo, sub, filas, puntos, estrellas;
  if (J.modo === 'camaleon') {
    const vivos = J.camaleones.filter(e => !e.jugador && !e.fuera).length, total = J.camaleones.length - 1;
    puntos = Math.round(yo.camo * 3 + k.narices * 12 + k.silbidos * 25 + k.aguante * 2 + (victoria ? 300 : 0));
    estrellas = victoria ? 1 + (puntos >= 700 ? 1 : 0) + (puntos >= 880 ? 1 : 0) : 0;
    titulo = victoria ? (motivo === 'cartas' ? tr('¡SIN CARTAS!') : tr('¡TE HAS LIBRADO!')) : tr('¡DESPEDIDO!');
    sub = victoria ? (motivo === 'cartas' ? tr('Los becarios se han quedado sin cartas de despido.') : tr('Se acaba el turno de noche y nadie te ha visto.')) : tr('Y eso que ni siquiera trabajabas aquí.');
    filas = [[tr('Camuflaje'), yo.camo + ' %'], [tr('Has aguantado'), mmss(k.aguante)], [tr('Delante de sus narices'), Math.round(k.narices) + ' s'], [tr('Silbidos por gusto'), String(k.silbidos)], [tr('Compañeros en pie'), vivos + ' / ' + total]];
  } else {
    const total = J.camaleones.length, hechos = total - quedan.length;
    puntos = Math.max(0, Math.round(hechos * 150 - k.fallos * 30 + (victoria ? J.reloj * 4 + yo.balas * 40 : 0)));
    estrellas = victoria ? 1 + (k.fallos <= 2 ? 1 : 0) + (k.fallos === 0 || J.reloj >= 45 ? 1 : 0) : 0;
    titulo = victoria ? tr('¡TODOS DESPEDIDOS!') : motivo === 'cartas' ? tr('¡SIN CARTAS!') : tr('SE TE HAN ESCAPADO');
    sub = victoria ? tr('Microblizz te felicita. El sueldo no te lo sube, claro.') : motivo === 'cartas' ? tr('Demasiados despidos improcedentes. Recursos Humanos quiere verte.') : tr('Se acabó tu turno y aún quedaban {n} colados.').replace('{n}', quedan.length);
    filas = [[tr('Despedidos'), hechos + ' / ' + total], [tr('Despidos improcedentes'), String(k.fallos)], [tr('Cartas que te quedan'), String(Math.max(0, yo.balas))], [tr('Tiempo de sobra'), victoria ? mmss(J.reloj) : '0:00']];
  }
  J.resultado = { victoria, motivo, titulo, sub, filas, puntos, estrellas };
  musica(victoria ? 'win' : 'lose'); play(victoria ? 'crown' : 'sad');
  refrescaHud(true);
}

/* ---------- lo que hacen los botones (y sus teclas) ---------- */
function accionPintar() { if (TALLER.abierto) { cierraTaller(); play('select'); } else if (jugando() && J.yo.clase === 'camaleon') abreTaller(); }
function accionCongelar() {
  const yo = J.yo; if (!jugando() || yo.clase !== 'camaleon') return;
  if (TALLER.abierto) cierraTaller();
  if (yo.congelado) { descongela(yo); play('pop'); }
  else {
    congela(yo); play('congela');
    fxTexto(yo.x, yo.y - 66, yo.camo + ' %', colorCamo(yo.camo), 19);
    pista(yo.pintado ? veredicto(yo.camo) : tr('Sin pintar se te ve mucho: toca PINTAR'), 3.2);
  }
  refrescaHud(true);
}
function accionSilbar() { const yo = J.yo; if (J.fase === 'caza' && jugando() && yo.clase === 'camaleon' && !TALLER.abierto) silba(yo, false); }
// «¡Listo!»: si ya estás congelado, no hace falta esperar a que acabe el tiempo de pintarse
function accionListo() { if (J.fase === 'prep' && jugando() && !TALLER.abierto && J.yo.congelado) { play('select'); cambiaFase('cuenta'); } }
function accionPausa() {
  if (J.fase !== 'prep' && J.fase !== 'caza' && J.fase !== 'cuenta') return;
  J.pausa = !J.pausa; if (J.pausa && TALLER.abierto) cierraTaller();
  muestraPausa(J.pausa); play('select');
}
