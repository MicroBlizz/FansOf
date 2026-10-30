// Fans of Rouflage · LAS PRÁCTICAS DE LOS CAZADORES: mientras los colados se pintan, en Recursos Humanos (la sala de espera de los
// becarios) aparecen camaleones de prácticas. Corren un momento, se esconden pintados a medias (se ven bien) y hay que dispararles
// con el mismo toque que en la caza. Al despedir a uno sale otro escondido en otro sitio. Fallar no gasta cartas. Cada
// PRACTICA_POR_CARTA aciertos dan una carta de despido extra, hasta REGLAS.balasExtra. No tiran granadas. Al acabar la preparación
// desaparecen todos. Son solo tuyos: no cuentan como colados y en el PvP los demás no los ven (al anfitrión solo se le avisa de
// cuántas extra has ganado, mensaje 'cg').
'use strict';

const PRACTICA_POR_CARTA = 3, PRACTICA_A_LA_VEZ = 2;
const PRACTICA = { activa: false, munecos: [], aciertos: 0, extra: 0, sig: 0 };

// un camaleón de prácticas: un colado de verdad, pero fuera de las listas de la partida
function practicaNuevo() {
  const z = salaEspera(), yo = J.yo; if (!z || !yo) return;
  const lejosDe = [[yo.x, yo.y], ...PRACTICA.munecos.filter(m => !m.fuera).map(m => [m.x, m.y])];
  const sitio = sitioLibre({ sala: z, lejosDe, min: 90, intentos: 300 }) || sitioLibre({ sala: z, intentos: 300 }); if (!sitio) return;
  const salida = sitioLibre({ sala: z, lejosDe: [[yo.x, yo.y]], min: 60, intentos: 200 }) || sitio;
  const e = nuevoEnte('camaleon', pick(Object.keys(NOMBRES)), tr('Camaleón de prácticas'), salida[0], salida[1]);
  J.entes.splice(J.entes.indexOf(e), 1); J.camaleones.splice(J.camaleones.indexOf(e), 1);
  cambiaPostura(e, posturaBot()); e.sitio = sitio; e.prisa = 1.15; e.tCorre = 0;
  PRACTICA.munecos.push(e);
}
// llega a su sitio (o se cansa de intentarlo) y se esconde pintado con poca maña: así se le encuentra
function practicaEsconde(e) {
  e.vx = e.vy = 0; pintaBot(e, 0.2); e.pintado = true;
  e.congelado = true; e.x = Math.round(e.x); e.y = Math.round(e.y); play('congela');      // sin congela(): no hay que avisar a nadie por internet
}

function practicaEmpieza() {
  practicaCierra();
  if (!J.yo || J.yo.clase !== 'cazador') return;
  Object.assign(PRACTICA, { activa: true, aciertos: 0, extra: 0, sig: 0.8 });
}
// se acabó el tiempo: desaparecen todos con una nubecita
function practicaCierra() {
  if (PRACTICA.activa) for (const e of PRACTICA.munecos) if (!e.fuera) fxSalpica(e.x, e.y - 24, '#fff6ea', 8);
  if (PRACTICA.activa) FX.suelo = FX.suelo.filter(f => !f.practica);      // los sellos y manchas de las prácticas también se van
  if (PRACTICA.activa && J.pvp && PRACTICA.extra > 0 && J.yo) rfpManda({ t: 'cg', n: PRACTICA.extra });      // al acabar las prácticas se repite lo ganado, por si el aviso se perdió
  PRACTICA.activa = false; PRACTICA.munecos.length = 0;
}

function practicaAvanza(dt) {
  if (!PRACTICA.activa) return;
  for (const e of PRACTICA.munecos) {
    if (!e.fuera && !e.congelado) {
      e.tCorre += dt;
      const dx = e.sitio[0] - e.x, dy = e.sitio[1] - e.y, d = Math.hypot(dx, dy);
      if (d < 6 || e.tCorre > 1.6) { if (d < 30 && cabe(e.sitio[0], e.sitio[1])) { e.x = e.sitio[0]; e.y = e.sitio[1]; } practicaEsconde(e); }
      else { e.vx = dx / d; e.vy = dy / d; }
    }
    avanzaEnte(e, dt);
  }
  PRACTICA.munecos = PRACTICA.munecos.filter(e => !e.fuera || e.tFuera < 3);
  PRACTICA.sig -= dt;
  if (PRACTICA.sig <= 0 && PRACTICA.munecos.filter(e => !e.fuera).length < PRACTICA_A_LA_VEZ) { practicaNuevo(); PRACTICA.sig = rand(0.3, 0.7); }
}

const marcaPractica = () => { const f = FX.suelo[FX.suelo.length - 1]; if (f) f.practica = true; };
// el cazador dispara en la sala de espera: a un camaleón de prácticas o al suelo (fallar no cuesta nada)
function practicaDispara(x, y, margen) {
  const yo = J.yo; if (!PRACTICA.activa || !yo || yo.clase !== 'cazador') return;
  if (yo.enfria > 0) return;
  const ox = yo.x, oy = yo.y - 6;
  if (lejos(ox, oy, x, y) > REGLAS.alcance) { pista(tr('Demasiado lejos: acércate más'), 1.6); play('deny'); return; }
  yo.dir = Math.atan2(y - oy, x - ox); yo.mira = Math.cos(yo.dir) >= 0 ? 1 : -1; yo.tApunta = 0.7;
  fxDisparo(yo, x, y); yo.enfria = 0.3;
  const k = PRACTICA.munecos.find(k => !k.fuera && dentroDeAlubia(k, x, y, margen + 4));
  if (!k) { fxMancha(x, y); marcaPractica(); play('salpica'); return; }
  k.fuera = true; k.tFuera = 2.2; k.congelado = false; k.hielo = 0;
  fxSello(k.x, k.y - 6); marcaPractica(); fxSalpica(k.x, k.y - 24, '#fff6ea', 10); play('diana');
  PRACTICA.aciertos++; PRACTICA.sig = Math.min(PRACTICA.sig, 0.25);      // frenético: enseguida sale otro
  if (PRACTICA.extra >= REGLAS.balasExtra) return;
  const falta = PRACTICA_POR_CARTA - PRACTICA.aciertos % PRACTICA_POR_CARTA;
  if (falta === PRACTICA_POR_CARTA) {
    PRACTICA.extra++; play('select');
    yo.balas = Math.min(REGLAS.balas, REGLAS.balasIni + PRACTICA.extra);
    if (J.pvp) rfpManda({ t: 'cg', n: PRACTICA.extra });
    if (PRACTICA.extra >= REGLAS.balasExtra) {
      // los bots se disfrazan enseguida: con las cartas al máximo no hay que esperar más (en el PvP, solo si todos los demás son bots)
      const solo = !J.pvp || (rfpSoyAnfitrion() && RFP.slots.filter(sl => sl.humano).length <= 1);
      if (solo && J.fase === 'prep') cambiaFase('cuenta'); else avisa(tr('¡Cartas al máximo! Sigue practicando hasta la caza'), 'bueno');
    } else avisa(tr('¡Carta de despido extra!'), 'bueno');
    refrescaHud(true);
  } else fxTexto(k.x, k.y - 70, `${PRACTICA_POR_CARTA - falta}/${PRACTICA_POR_CARTA}`, '#ffd34d');
}
