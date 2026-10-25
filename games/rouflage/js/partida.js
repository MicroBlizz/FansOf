// Fans of Rouflage (prototipo) · LA PARTIDA: quién sale en cada papel, las fases (pintarse, cuenta atrás, caza y final), los silbidos
// obligatorios, la recta final, cuándo se gana o se pierde y los puntos. Las cifras están en REGLAS (entes.js).
'use strict';

function limpiaPartida() {
  E('esquina').hidden = false;
  if (J.pvp) rfpTermina();      // si era una partida por internet, se cierra el canal
  J.entes.length = 0; J.camaleones.length = 0; J.cazadores.length = 0; J.yo = null; J.resultado = null;
  J.cuenta = { narices: 0, silbidos: 0, aciertos: 0, fallos: 0, senuelos: 0, aguante: 0 };
  practicaCierra(); talentosLimpia(); modoPon(null); modoLimpia(); fpZonasLimpia(); J.fantasma = null; FOTO.cv = null; J.oscuro = 0; J.pings = 0; J.recta = false; J.peligro = 0; J.pausa = false; J.finMostrado = false; J.pvp = false;
  PUERTA.cerrada = true; PUERTA.abierta = 0;
  if (TALLER.abierto) cierraTaller();
  TALLER.herr = 'pincel'; TALLER.color = BLANCO_PIEL; TALLER.recientes = [BLANCO_PIEL]; TALLER.calco = true; TALLER.radio = RADIOS[2];
  limpiaFx(); limpiaAvisos();
  M.tmT = 1;
}

// la pantalla de título: el mapa de fondo con cinco alubias de paseo por la cafetería
function escenaTitulo() {
  if (MAPA.id !== mapaElegido()) cargaMapa(mapaElegido());
  limpiaPartida(); J.fase = 'titulo'; J.modo = 'camaleon'; J.t = 0;
  Object.keys(NOMBRES).forEach((tipo, i) => {
    const e = nuevoEnte('camaleon', tipo, NOMBRES[tipo], ...SALIDA_CAMALEONES[i]);
    e.bot = { estado: 'pasea', t: 0, camino: null, i: 0, atasco: 0, ax: e.x, ay: e.y, espera: rand(0, 1.5) };
  });
  musica('rfTitulo'); avanzaCamara(0, true);
}

// la postura de un colado bot: casi siempre firmes; a veces otra, para que no todos tengan la misma silueta
const posturaBot = () => pick(['firmes', 'firmes', 'firmes', 'bolita', 'estrella', 'saludo']);
function empiezaPartida(modo) {
  limpiaPartida(); modoDesdeUrl(); if (modoEs('ida')) modo = 'camaleon'; J.modo = modo; J.t = 0; eventosPrepara();      // en solitario el modo sale de la URL (modos.js); en Ida y vuelta todos empiezan de colado
  if (modo === 'camaleon') {
    // tú eres CrazyBunny; tres compañeros se esconden por su cuenta y dos becarios esperan encerrados en Recursos Humanos
    const yo = nuevoEnte('camaleon', 'bunny', NOMBRES.bunny, ...SALIDA_CAMALEONES[0]); yo.jugador = true; J.yo = yo; J.cuenta = yo.pts; vistePartida(yo, ropaPartida());      // lo del armario (armario.js)
    const ocupados = [];
    [['squirrel', 0.2], ['fox', 0.86], ['meercat', 0.55]].forEach(([tipo, mana], i) => {
      const e = nuevoEnte('camaleon', tipo, NOMBRES[tipo], ...SALIDA_CAMALEONES[i + 1]);
      cambiaPostura(e, posturaBot()); cerebroCamaleon(e, mana); e.sitio = eligeSitio(e, ocupados); ocupados.push(e.sitio);
    });
    if (modoEs('ida')) { const e = nuevoEnte('camaleon', 'coon', NOMBRES.coon, ...SALIDA_CAMALEONES[4 % SALIDA_CAMALEONES.length]); cambiaPostura(e, posturaBot()); cerebroCamaleon(e, 0.4); e.sitio = eligeSitio(e, ocupados); ocupados.push(e.sitio); }
    else SALIDA_CAZADORES.slice(0, 2).forEach(([x, y], i) => { const h = nuevoEnte('cazador', 'becario', tr('Becario {n}').replace('{n}', [7, 12][i]), x, y);      // contra bots, siempre dos becarios (un escenario propio puede traer más salidas)
      cerebroCazador(h); h.dir = -Math.PI / 2 + (i ? 0.5 : -0.5); h.mira = i ? -1 : 1; });
    cambiaFase('prep');
  } else {
    // tú eres el becario; cinco colados ya están escondidos y pintados, cada uno con su maña
    const yo = nuevoEnte('cazador', 'becario', tr('Tú'), ...SALIDA_CAZADORES[1]); yo.jugador = true; J.yo = yo; J.cuenta = yo.pts; yo.dir = 0; vistePartida(yo, ropaPartida());
    const ocupados = [];
    baraja([['bunny', 0.5], ['squirrel', 0.2], ['fox', 0.88], ['meercat', 0.64], ['coon', 0.36]]).forEach(([tipo, mana]) => {
      const e = nuevoEnte('camaleon', tipo, NOMBRES[tipo], 0, 0);
      cambiaPostura(e, posturaBot());
      cerebroCamaleon(e, mana); e.sitio = eligeSitio(e, ocupados); ocupados.push(e.sitio); escondeYa(e);
    });
    cambiaFase('prep');      // en solitario la preparación son solo las prácticas en la sala de espera (REGLAS.prepCazador)
  }
  for (const e of J.entes) if (!e.sitio && !cabe(e.x, e.y)) [e.x, e.y] = sitioLibreCerca(e.x, e.y);      // nadie empieza encima de un mueble (se quedaría atascado)
  avanzaCamara(0, true);
  refrescaHud(true);
}

function cambiaFase(f) {
  J.fase = f; J.tFase = 0;
  if (f !== 'prep') practicaCierra();
  if (f === 'prep') talentosReparte();      // las habilidades de cada uno (talentos-partida.js)
  tutoFase(f);
  if (f === 'prep') {
    J.reloj = J.modo === 'cazador' && !J.pvp ? REGLAS.prepCazador : REGLAS.prep; musica(temaDe('taller'));
    if (J.modo === 'cazador') { cartel(J.pvp ? tr('¡ERES CAZADOR!') : tr('¡CALENTAMIENTO!'), tr('Dispara a los camaleones de prácticas de la sala y gana cartas de despido')); practicaEmpieza(); }
    else cartel(tr('¡PÍNTATE!'), tr('Busca un sitio, cópiale los colores y congélate'));
  } else if (f === 'cuenta') {
    for (const h of J.cazadores) if (h.bot) h.balas = Math.min(REGLAS.balas, REGLAS.balasIni + Math.floor(rand(1, REGLAS.balasExtra + 1)));   // los becarios bot también hacen las prácticas (en el PvP manda lo que sincroniza el anfitrión)
    J.reloj = modoEs('retrato') ? RETRATO.cuenta : REGLAS.cuenta; J.digito = 0;
    if (modoEs('retrato')) { retratoPinta(true); if (J.modo === 'cazador') cartel(tr('SE BUSCAN'), tr('Memoriza sus fichas: ahí abajo tienes su pintura y su postura'), true); }   // el taller no se cierra: quien está pintando sigue (solo se le avisa)
    for (const e of J.camaleones) if (e.bot && e.bot.estado !== 'quieto') escondeYa(e);
    // si se te acaba el tiempo sin congelarte, te quedas congelado donde estés (luego puedes moverte, bajo tu cuenta y riesgo)
    if (J.modo === 'camaleon' && J.yo && !J.yo.congelado) { congela(J.yo); play('congela'); }
  } else if (f === 'caza') {
    J.reloj = J.pvp ? REGLAS.cazaPvp : J.modo === 'camaleon' ? REGLAS.caza : REGLAS.cazaCazador;
    J.coladosIni = J.camaleones.length;      // para «más de la mitad» (cazaHecha, modos.js)
    if (J.modo === 'camaleon') fotoHaz(J.yo);      // la foto de tu escondite, para compartirla al acabar (foto.js)
    for (const e of J.camaleones) { e.silbido = REGLAS.primerSilbido + (e.jugador ? 0 : rand(0.05, 1.3)); e.avisado = false; }
    PUERTA.cerrada = false;
    for (const h of J.cazadores) if (h.bot) ronda(h);
    modoEmpiezaCaza(); botePrepara(); talentosCaza(); misionEvento('caza');      // los papeles secretos, el silbato (modos-extra.js) y el cubo (modos-bote.js)
    musica(temaDe('caza')); play('comienzaCaza');
    if (!modoEs('ida')) cartel(J.modo === 'camaleon' ? tr('¡QUE VIENEN!') : tr('¡A BUSCAR!'), modoNormal() ? (J.modo === 'camaleon' ? (TALLER.abierto ? tr('Los cazadores están sueltos: puedes seguir pintando') : tr('Microblizz apaga las luces para ahorrar')) : tr('Hay {n} colados. Toca donde creas que hay uno.').replace('{n}', escondidos().length)) : tr('Modo {m}', { m: modoTexto() }));
    if (J.pvp && !modoEs('ida') && ajusteSala(MODO.a, 'g') === 1 && J.coladosIni > 1) pista(tr('Los becarios ganan si despiden a más de la mitad: {n} de {t}', { n: Math.floor(J.coladosIni / 2) + 1, t: J.coladosIni }));
  }
  refrescaHud(true);
  if (J.pvp) rfpFase(f);      // PvP: el anfitrión se lo cuenta a los demás
}

// el silbido obligatorio: cada colado tiene su propio reloj y, si silba por gusto, su reloj vuelve a empezar (como en el juego
// original). Los bots con maña también silban por gusto cuando no hay ningún becario cerca, para elegir ellos el momento.
function avanzaSilbidos(dt) {
  for (const e of J.camaleones) {
    if (e.fuera) continue;
    e.pts.aguante += dt;
    if (e.congelado && e.enVista) e.pts.narices += dt * modoNarices(e);   // delante de sus narices: en la luz de un becario sin que te vea
    if (e.remoto) continue;      // PvP: el silbido de cada uno lo cuenta su dueño (o el anfitrión, si es de la máquina) y avisa a los demás
    e.silbido -= dt;
    if ((e.jugador || e.mio) && e.silbido <= 5 && !e.avisado) { e.avisado = true; avisa(tr('Silbido obligatorio en 5 segundos'), 'aviso'); play('tick'); }
    if (e.silbido <= 0) silba(e, true);
    else if (e.bot && e.congelado && e.bot.mana >= 0.5 && e.silbido > 1 && e.silbido < 9 && Math.random() < dt * 0.5
      && J.cazadores.every(h => h.fuera || lejos(h.x, h.y, e.x, e.y) > 380)) silba(e, false);
  }
}
// en la recta final los cazadores reciben pistas: un chivatazo a los bots, o una onda en pantalla si el cazador eres tú
function chivatazo() {
  const quedan = escondidos(); if (!quedan.length) return;
  if (J.modo === 'cazador') { for (const k of quedan) { const a = rand(0, TAU), d = rand(8, 30); ondaSilbido(k.x + Math.cos(a) * d, k.y - 22 + Math.sin(a) * d, k); } if (!J.pvp) return; }
  for (const h of J.cazadores) {
    if (!h.bot || h.fuera || h.balas <= 0) continue;
    let cerca = null, md = 1e9; for (const k of quedan) { const d = lejos(h.x, h.y, k.x, k.y); if (d < md) { md = d; cerca = k; } }
    if (cerca) { const a = rand(0, TAU), d = rand(30, 70); const antes = REGLAS.oido; REGLAS.oido = 1e9; oyeSilbido(h, cerca.x + Math.cos(a) * d, cerca.y + Math.sin(a) * d); REGLAS.oido = antes; }
  }
}

function avanzaPartida(dt) {
  J.t += dt; J.tFase += dt;
  for (const k of J.camaleones) k.enVista = false;
  senueloPaso(dt);
  humoPaso(J.yo);
  if (!J.pvp && typeof VISITA !== 'undefined' && VISITA.activa) visitaAvanza(dt);      // de visita en un escenario (visita.js)
  if (J.pvp) rfpPaso(dt);      // PvP: recibe lo de los demás, manda lo tuyo y, si eres el anfitrión, lleva a la máquina
  controlaJugador(dt); talentosAvanza(dt); poderAvanza(dt); fpZonasAvanza(dt); fantasmasAvanza(dt); balizaAvanza(dt); modoAvanza(dt); eventosAvanza(dt); cuarteoAvanza(dt);
  for (const e of J.entes) {
    if (e.bot && J.fase !== 'fin') (e.clase === 'cazador' ? piensaCazador : piensaCamaleon)(e, dt);
    else if (e.bot) e.vx = e.vy = 0;
    avanzaEnte(e, dt);
  }
  mascotasAvanza(dt);      // las mascotas del armario (mascotas.js)
  miraLosOjos();
  PUERTA.abierta = limita(PUERTA.abierta + (PUERTA.cerrada ? -dt : dt) * 1.5, 0, 1);
  J.oscuro += ((J.fase === 'caza' || (J.fase === 'fin' && J.tFase < 1.2)) && !extraOn('dia') ? 1 - J.oscuro : -J.oscuro) * Math.min(1, dt * 2.2);      // Jugar de día: las luces no se apagan
  const yo = J.yo, manda = !J.pvp || rfpSoyAnfitrion();   // en el PvP, las fases las cambia el anfitrión (y avisa a los demás)

  if (J.fase === 'prep') {
    J.reloj -= dt;
    practicaAvanza(dt);
    if (manda && (J.reloj <= 0 || (J.pvp && rfpTodosListos()))) cambiaFase('cuenta');
  } else if (J.fase === 'cuenta') {
    J.reloj -= dt;
    const d = Math.ceil(J.reloj - 0.4);
    if (d !== J.digito && d >= 1 && d <= 3) { J.digito = d; cartel(String(d), J.modo === 'camaleon' ? tr('Los becarios salen de Recursos Humanos') : tr('Los colados ya están escondidos'), true); play('cuenta', d); }
    if (manda && J.reloj <= 0) cambiaFase('caza');
  } else if (J.fase === 'caza') {
    J.reloj -= dt;
    avanzaSilbidos(dt);
    if (J.reloj <= REGLAS.rectaFinal && !J.recta) { J.recta = true; M.tmT = 1; musica(temaDe('recta')); cartel(tr('¡RECTA FINAL!'), J.modo === 'camaleon' ? tr('Los becarios reciben un chivatazo') : tr('Los colados silban más a menudo'), true); play('recta'); J.pings = 0; }
    if (J.recta) { J.pings -= dt; if (J.pings <= 0) { J.pings = J.modo === 'cazador' ? 6 : 10; chivatazo(); } }
    if (yo.clase === 'camaleon') {
      // el peligro: la mayor sospecha que algún becario tiene de ti, y lo cerca que anda el más próximo
      let p = 0; for (const h of J.cazadores) if (!h.fuera && h.balas > 0) p = Math.max(p, 0.45 * limita(1 - lejos(h.x, h.y, yo.x, yo.y) / 230, 0, 1), h.bot ? Math.max(h.bot.sosp.get(yo) || 0, h.bot.objetivo === yo ? 0.7 : 0) : 0);
      const antes = J.peligro; J.peligro += (limita(p, 0, 1) - J.peligro) * Math.min(1, dt * 6);
      if (J.peligro >= 0.8 && antes < 0.8 && !yo.fuera) play('visto');      // un becario casi te tiene: el susto
    }
    // ¿se acaba? (en el PvP lo decide el anfitrión: rfpComprueba, y los demás lo reciben)
    if (J.pvp) { if (manda) rfpComprueba(); else rfpSinAnfitrion(); }
    else if (modoEs('ida')) { if (idaAcaba()) termina(true, 'ida'); }
    else if (J.modo === 'camaleon') {
      if (yo.fuera && !escondidos().length) termina(false, 'despedido');      // despedido, pero sigue de espectador mientras algún compañero aguante
      else if (J.reloj <= 0) termina(true, 'tiempo');
      else if (!cazadoresVivos().length) termina(true, 'cartas');
      else if (boteLleno()) termina(true, 'bote');
    } else if (!escondidos().length) termina(true, 'todos');
    else if (!cazadoresVivos().length) termina(false, 'cartas');
    else if (boteLleno()) termina(false, 'bote');      // sin cartas sigues de espectador mientras otro cazador aguante
    else if (J.reloj <= 0) termina(false, 'tiempo');
  } else if (J.fase === 'fin') {
    J.peligro *= 0.9; galeriaAvanza(dt);
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

// los puntos de cada uno, con la misma cuenta para personas y bots (para la clasificación del final)
//   colado: camuflaje × 3 + segundos delante de sus narices × 12 + silbidos por gusto × 25 + segundos aguantados × 2 + 300 si no le pillan
//   becario: despidos × 150 − despidos improcedentes × 30 + (si no queda nadie) segundos de sobra × 4 y cartas que le quedan × 40
function marcadorDe(e) {
  if (J.pvp && e.puntosRed != null) return e.puntosRed + (e.galeria || 0) + (e.bonus || 0);      // PvP: los puntos los cuenta el anfitrión (y la galería suma aparte)
  const k = e.pts;
  if (e.clase === 'camaleon') return Math.round(e.camo * 3 + k.narices * (extraOn('halcon') ? HALCON.peso : HALCON.pesoNormal) + k.silbidos * 25 + k.aguante * 2 + (e.fuera ? 0 : 300)) + (e.galeria || 0) + (e.bonus || 0);
  const colado = e.cuerpo ? marcadorDe(e.cuerpo) : e.contagiado ? e.camo * 3 + k.narices * 12 + k.silbidos * 25 + k.aguante * 2 : 0;      // Contagio: lo ganado de colado se queda
  return Math.max(0, Math.round(colado + k.aciertos * 150 - k.fallos * 30 + (escondidos().length ? 0 : Math.max(0, J.reloj) * 4 + Math.max(0, e.balas) * 40))) + (e.bonus || 0);
}
function clasificacion() {
  return J.entes.filter(e => !e.dueno).map(e => ({
    nombre: e.jugador ? tr('Tú') : e.nombre, clase: e.clase, tipo: e.tipo, jugador: e.jugador, fuera: e.fuera, puntos: marcadorDe(e),
    marco: e.ropa && e.ropa.marco, titulo: e.ropa && e.ropa.titulo,      // del armario (armario-partida.js)
    detalle: e.clase === 'camaleon' ? (e.fuera ? tr('Despedido') : e.camo + ' %') : (e.pts.aciertos === 1 ? tr('1 despido') : tr('{n} despidos').replace('{n}', e.pts.aciertos)),
  })).sort((a, b) => b.puntos - a.puntos || (a.jugador ? -1 : 1));
}
const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
// `fin` solo en el PvP: lo que cuenta el anfitrión (los puntos y las cifras de cada uno), que es lo que vale
function termina(victoria, motivo, fin) {
  if (J.fase === 'fin') return;
  if (fin) rfpAplicaFin(fin);
  J.fase = 'fin'; J.tFase = 0; M.tmT = 1;
  if (TALLER.abierto) cierraTaller();
  const yo = J.yo, k = J.cuenta, quedan = escondidos();
  if (J.modo === 'camaleon' && yo && !yo.fuera) fotoHaz(yo);      // si sigues escondido, la foto de cómo acabaste (antes de que se vea a todos)
  for (const e of quedan) { descongela(e); if (e !== yo) fxTexto(e.x, e.y - 74, e.nombre, '#fff6ea', 12); }   // al acabar, todos los escondidos se dejan ver
  let titulo, sub, filas, puntos, estrellas, bando = false;      // bando: tu bando gana aunque tú no (solo fuera del PvP)
  if (J.modo === 'camaleon') {
    const vivos = J.camaleones.filter(e => !e.jugador && !e.fuera).length, total = J.camaleones.length - 1;
    puntos = marcadorDe(yo);
    estrellas = victoria ? 1 + (puntos >= 700 ? 1 : 0) + (puntos >= 880 ? 1 : 0) : 0;
    titulo = victoria ? (motivo === 'cartas' ? tr('¡SIN CARTAS!') : motivo === 'bote' ? tr('¡CUBO LLENO!') : tr('¡TE HAS LIBRADO!')) : tr('¡DESPEDIDO!');
    sub = victoria ? (motivo === 'cartas' ? tr('Los becarios se han quedado sin cartas de despido.') : motivo === 'bote' ? tr('Los colados han llenado el cubo de pintura antes de tiempo.') : tr('Se acaba el turno de noche y nadie te ha visto.')) : tr('Y eso que ni siquiera trabajabas aquí.');
    if (victoria && yo.fuera) {      // gana el bando, pero a ti te han despedido: sin estrellas, y fuera del PvP no cuenta como victoria tuya
      titulo = tr('¡DESPEDIDO, PERO GANÁIS!'); sub = tr('Tus compañeros han aguantado hasta el final.'); estrellas = 0;
      if (!J.pvp) { victoria = false; bando = true; }      // premio de derrota (sin el extra de ganar), sin misiones ni logros de victoria, y el servidor recibe que no ganaste
    } else if (J.pvp) {      // en el PvP gana o pierde todo el bando
      if (!victoria && motivo === 'mitad') { titulo = tr('¡HAN DESPEDIDO A MÁS DE LA MITAD!'); sub = tr('Microblizz da la noche por buena: con la mitad ya le cuadra el informe.'); }
      else if (!victoria) { titulo = tr('¡OS HAN DESPEDIDO A TODOS!'); sub = tr('Microblizz deja la estación limpia de colados.'); }
    }
    filas = [[tr('Camuflaje'), yo.camo + ' %'], [tr('Has aguantado'), mmss(k.aguante)], [tr('Delante de sus narices'), Math.round(k.narices) + ' s'], [tr('Silbidos por gusto'), String(k.silbidos)], [tr('Compañeros en pie'), vivos + ' / ' + total]];
  } else {
    const total = J.camaleones.length, hechos = total - quedan.length;
    puntos = marcadorDe(yo);
    estrellas = victoria ? 1 + (k.fallos <= 2 ? 1 : 0) + (k.fallos === 0 || J.reloj >= 45 ? 1 : 0) : 0;
    titulo = victoria ? (motivo === 'mitad' ? tr('¡MÁS DE LA MITAD!') : tr('¡TODOS DESPEDIDOS!')) : motivo === 'cartas' ? tr('¡SIN CARTAS!') : motivo === 'bote' ? tr('¡CUBO LLENO!') : tr('SE TE HAN ESCAPADO');
    sub = victoria ? tr('Microblizz te felicita. El sueldo no te lo sube, claro.') : motivo === 'cartas' ? tr('Demasiados despidos improcedentes. Recursos Humanos quiere verte.') : motivo === 'bote' ? tr('Los colados han llenado el cubo de pintura delante de tus narices.') : tr('Se acabó tu turno y aún quedaban {n} colados.').replace('{n}', quedan.length);
    filas = [[tr('Despedidos'), (J.pvp ? k.aciertos : hechos) + ' / ' + total], [tr('Despidos improcedentes'), String(k.fallos)], [tr('Cartas que te quedan'), String(Math.max(0, yo.balas))], [tr('Tiempo de sobra'), victoria ? mmss(J.reloj) : '0:00']];
  }
  const enTutorial = tutoFaltan().length > 0;      // la victoria que acaba el tutorial aún no abre mapa
  if (!J.pvp) { const consejo = tutoFin(victoria); if (consejo) sub += ' ' + consejo; }      // sin conexión: se apunta la victoria y se aconseja probar los dos bandos antes del PvP
  galeriaPrepara();      // la galería de disfraces, si está puesta (galeria.js)
  J.resultado = { victoria, bando, motivo, titulo, sub, filas, puntos, estrellas, ranking: clasificacion() };
  modoResultado(J.resultado, victoria); victoria = J.resultado.victoria;      // el bufón, el ojo de halcón y el retrato robot cambian el resultado
  { const nuevo = mapasFin(victoria && !enTutorial); if (nuevo) J.resultado.sub += ' ' + nuevo; }      // cada victoria (también en línea) abre el mapa siguiente (elige-mapa.js)
  economiaPartida(J.resultado);      // Gotas y experiencia del pase (economia.js; solo en la alfa)
  talentosFin(J.resultado);      // la experiencia de becario o de colado (talentos-fin.js)
  misionEvento('fin', J.resultado);      // misiones del día y logros (misiones.js)
  const alegre = victoria || J.resultado.bando; musica(alegre ? 'rfWin' : 'rfLose'); play(alegre ? 'crown' : 'sad');
  refrescaHud(true);
  if (J.pvp) rfpCierra(victoria);      // PvP: se apunta el resultado en el servidor
}

/* ---------- lo que hacen los botones (y sus teclas) ---------- */
function accionPintar() { if (TALLER.abierto) { cierraTaller(); play('select'); } else if (jugando() && J.yo.clase === 'camaleon') abreTaller(); }
function accionCongelar() {
  const yo = J.yo; if (!jugando() || yo.clase !== 'camaleon') return;
  if (TALLER.abierto) cierraTaller();
  if (yo.congelado) { descongela(yo); play('descongela'); }
  else if (boteLleva(yo)) { play('deny'); pista(tr('Con la gota no puedes congelarte: llévala al cubo'), 2); }
  else {
    congela(yo); play('congela');
    fxTexto(yo.x, yo.y - 66, yo.camo + ' %', colorCamo(yo.camo), 19);
    pista(yo.pintado ? veredicto(yo.camo) : tr('Sin pintar se te ve mucho: toca PINTAR'), 3.2);
  }
  refrescaHud(true);
}
function accionSilbar() { const yo = J.yo; if (J.fase === 'caza' && jugando() && yo.clase === 'camaleon' && !TALLER.abierto) silba(yo, false); }
// «¡Listo!»: si ya estás congelado, no hace falta esperar a que acabe el tiempo de pintarse
function accionListo() { if (J.fase === 'prep' && jugando() && !TALLER.abierto && J.yo.congelado) { play('select'); if (J.pvp) rfpListo(); else cambiaFase('cuenta'); } }
function accionPausa() {
  if (J.fase !== 'prep' && J.fase !== 'caza' && J.fase !== 'cuenta') return;
  if (J.pvp) { const abierta = !E('p-pausa').hidden; if (!abierta && TALLER.abierto) cierraTaller(); muestraPausa(!abierta); return; }      // por internet la partida no se para: solo se enseña el menú
  J.pausa = !J.pausa; if (J.pausa && TALLER.abierto) cierraTaller();
  muestraPausa(J.pausa); play('select');
}
