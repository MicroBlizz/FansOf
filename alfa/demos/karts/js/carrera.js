// Fans of Karts (prototipo) · LA CARRERA: la parrilla (Microblizz sale delante, que para eso ha comprado la carrera, y tú el último),
// la cuenta atrás con su salida turbo (o su Error 37 si aprietas demasiado pronto), las vueltas, los puestos, lo que se recoge,
// la goma elástica de los rivales y el final. Va a pasos fijos de 1/60 de segundo, así corre igual en todas las pantallas.
'use strict';

const CARRERA = { estado: 'nada', reloj: 0, tCuenta: 0, luz: 4, karts: [], jugador: null, sueltos: [], orden: [], vueltas: 3, llegados: 0, tMeta: 0, tCierre: -1,
  sal: { desde: 9, antes: false }, tFrase: 8, puestoAntes: 8, resultado: null, def: null };
// frases del comentarista cuando no pasa nada (el resto salen con lo que ocurre en la carrera)
const FRASES_CARRERA = [
  'Microblizz recuerda: correr es gratis. Frenar, 4,99 €.',
  'Esta carrera podría cerrarse en cualquier momento.',
  'El CEO ha comprado la curva siguiente.',
  'Recursos Humanos está viendo la carrera. Sonríe.',
  'Próximamente: carril derecho de pago.',
  'Los rivales no hacen trampas. Es una «función».',
  'El circuito se cierra por mantenimiento todos los martes.',
  'Phony ya prepara el remaster de esta vuelta, a 70 €.',
  'Lola vende café en la meta. Es lo único que funciona aquí.',
];

function nuevaCarrera(def, idPiloto) {
  const C = CARRERA;
  // la pista se construye una vez; si se repite la misma, solo se reponen las monedas y los regalos
  if (!PISTA || PISTA.def !== def || PISTA.idioma !== IDIOMA_K || PISTA.dif !== nivelDif()) { PISTA = creaPista(def); PISTA.idioma = IDIOMA_K; PISTA.dif = nivelDif(); preparaIA(PISTA); }
  else { for (const m of PISTA.monedas) m.t = 0; for (const c of PISTA.regalos) c.t = 0; }
  const P = PISTA, N = P.N, pvp = typeof KPVP !== 'undefined' && KPVP.activo;    // en PvP corren los humanos (los mueve la red), tú y la máquina en los huecos hasta 8
  const otros = PILOTOS.filter(p => p.id !== idPiloto && p.id !== 'ceo' && p.id !== 'survivalbot').sort(() => Math.random() - 0.5);
  const crono = !pvp && !COPA.activa && def.mundo !== 0 && PANT.modo === 'crono';     // contrarreloj: tú solo (crono.js)
  const parrilla = pvp ? pvpParrilla(idPiloto) : crono ? [PILOTO[idPiloto]] : [PILOTO.ceo, PILOTO.survivalbot, ...otros, PILOTO[idPiloto]], ult = parrilla.length - 1;
  const niveles = [0.965, 0.95, 0.935, 0.92, 0.905].sort(() => Math.random() - 0.5);
  C.karts = parrilla.map((p, i) => {
    const k = creaKart(p, i === ult, P.parrilla[pvp ? pvpCasilla(i) : i]);
    if (i < ult && (!pvp || pvpEsIA(i))) creaIA(k, IA.nivel[p.id] || niveles.pop() || 0.92, i);
    k.idx = avanceEn(P, k.x, k.y); k.avance = k.idx - N; k.puesto = i + 1;
    return k;
  });
  if (PANT.auto) creaIA(C.karts[ult], 0.97, 7);       // ?auto=1: el kart del jugador conduce solo (para probar)
  C.def = def; C.jugador = C.karts[ult]; C.sueltos.length = 0; C.orden = C.karts.slice(); C.pvp = pvp;
  C.estado = 'cuenta'; C.reloj = 0; C.tCuenta = 3.7; C.luz = 4; C.llegados = 0; C.tMeta = 0; C.tCierre = -1; C.vueltas = 3; C.tFrase = 9; C.puestoAntes = C.karts.length; C.resultado = null;
  C.sal.desde = 9; C.sal.antes = false; C.regaloVisto = false;
  if (pvp) pvpPreparaKarts(C);
  modoDeCarrera(C, def, pvp);      // contrarreloj y espejo (crono.js)
  tutoPrepara(C, def);      // en La Madriguera: el tutorial (tutorial.js)
  borraChispas(); VISTA.listo = false; AVISO.t = 0; TICKER.t = 0;
  M.tmT = 1;
  sigueCamara(C.jugador, 1);
  if (def.borde === 'vacio' && dificultad().barandilla) comenta('Nivel becario: Microblizz ha puesto barandillas. Te las descontará del sueldo.');
}

function pasoCarrera(dt) {
  const C = CARRERA, P = PISTA, N = P.N, yo = C.jugador;
  if (P.moviles) for (const c of P.moviles) mueveMovil(c, C.reloj);      // lo que cruza la pista (vagonetas, cangrejos, bichos…)
  if (P.caidas) for (const c of P.caidas) mueveCaida(c, C);              // lo que cae del cielo (rocas, témpanos, balones…)
  if (TUTO.activo) tutoMira(C, dt);
  // ---------- la cuenta atrás ----------
  if (C.estado === 'cuenta') {
    if (C.pvp && !pvpEsperaSalida(C, dt)) return;      // en PvP la cuenta no empieza hasta que los dos han cargado
    C.tCuenta -= dt;
    const luz = Math.ceil(C.tCuenta);
    if (luz !== C.luz && luz <= 3) { C.luz = luz; if (luz > 0) play('tick'); }
    const pulsa = ENT.salida;
    if (pulsa && !C.sal.antes) C.sal.desde = C.tCuenta;      // cuándo empezó a apretar
    C.sal.antes = pulsa;
    if (C.tCuenta <= 0) {
      C.estado = 'corre'; play('go');
      if (pulsa && C.sal.desde <= 0.6) { daTurbo(yo, 1, 1.36, true); aviso('¡SALIDA TURBO!', '', '#ffcb3d'); }
      else if (pulsa && C.sal.desde > 1.7) { yo.estado = 'parado'; yo.tEstado = 0.9; aviso('ERROR 37', 'Los servidores están ocupados.', '#ff3348'); play('deny'); comenta('Demasiados jugadores intentando salir a la vez.'); }
      for (const k of C.karts) if (k.ia && Math.random() < 0.2) { k.ia.tSalida = 0; daTurbo(k, 0.8, 1.3, true); }
    }
  } else C.reloj += dt;
  // ---------- los karts ----------
  if (C.pvp) pvpActualizaAnfitrion(C);      // quién mueve la máquina en el PvP
  for (const k of C.karts) {
    if (k.remoto) { if (C.estado !== 'cuenta') pvpPasoRemoto(k, dt, C); continue; }     // el rival del PvP: lo mueve lo que llega por la red
    if (k.ia) piensa(k, dt, C); else leeMandos(k);
    if (C.estado === 'cuenta') continue;
    giraRuleta(k, dt);
    if (k.c.usa) usaObjeto(k, C);
    mueveKart(k, dt);
    if (k.ia) {
      // la goma elástica: algo más rápidos si el jugador se escapa, algo más lentos si se queda atrás
      const gap = (k.avance - yo.avance) * PASO_VIA;
      k.ia.factor = k.ia.nivel * (yo.fin ? 1 : gomaDe(gap));
      // si se queda atascado, el dron lo devuelve a la pista
      if (k.estado === 'normal' && Math.abs(k.v) < 7 && k.ia.tSalida <= 0) { k.tAtasco += dt; if (k.tAtasco > 2.2) rescata(k); } else k.tAtasco = 0;
    }
    // el jugador que lleva 7 s sin avanzar (encajado contra un muro, dando vueltas…) también recibe al dron
    else if (k === yo && C.estado === 'corre' && !k.fin && !C.pvp && k.estado === 'normal') {
      k.tQuieto = (k.tQuieto || 0) + dt;
      if (k.tQuieto > 7) { if (k.avance - (k.avQuieto || 0) < 4) { rescata(k); comenta('Dron de rescate de Microblizz: primer viaje gratis. Los siguientes, ya veremos.'); } k.tQuieto = 0; k.avQuieto = k.avance; }
    }
  }
  if (C.pvp) pvpEnvia(C, dt, C.estado === 'cuenta');
  if (C.estado === 'cuenta') return;
  for (let i = 0; i < C.karts.length; i++) for (let j = i + 1; j < C.karts.length; j++) chocanKarts(C.karts[i], C.karts[j]);
  // ---------- monedas y regalos ----------
  for (const m of P.monedas) {
    if (m.t > 0) { m.t -= dt; continue; }
    for (const k of C.karts) {
      const dx = k.x - m.x, dy = k.y - m.y;
      if (dx * dx + dy * dy < 62 && k.z < 6 && k.estado !== 'cae') { m.t = 9; if (k.monedas < AJ.maxMonedas) k.monedas++; suena(k, 'moneda'); break; }
    }
  }
  for (const c of P.regalos) {
    if (c.t > 0) { c.t -= dt; continue; }
    for (const k of C.karts) {
      const dx = k.x - c.x, dy = k.y - c.y;
      if (dx * dx + dy * dy < 70 && k.z < 6 && k.estado !== 'cae') { c.t = 2.4; cogeRegalo(k); for (let i = 0; i < 6; i++) chispa(c.x, c.y, 4, azar(-30, 30), azar(-30, 30), azar(30, 80), 0.4, i % 2 ? '#ffffff' : '#ffb3cf', 2); break; }
    }
  }
  mueveSueltos(C, dt);
  pasoObjetos2(C, dt);      // escudos, bots, lag, tren, imán (objetos-2.js)
  mueveChispas(dt);
  // ---------- puestos y vueltas ----------
  C.orden.sort((a, b) => (a.puestoFinal || 99) - (b.puestoFinal || 99) || b.avance - a.avance);
  C.orden.forEach((k, i) => { k.puesto = i + 1; });
  for (const k of C.karts) {
    if (k.fin || k.remoto) continue;      // la llegada del rival del PvP la dice él
    const v = Math.floor(k.avance / N) + 1;
    if (v <= k.vuelta) continue;
    if (k.vuelta >= 1) { const t = C.reloj - k.tVuelta; if (!k.mejorVuelta || t < k.mejorVuelta) k.mejorVuelta = t; }
    k.vuelta = v; k.tVuelta = C.reloj;
    if (v > C.vueltas) {
      k.fin = C.reloj; k.puestoFinal = ++C.llegados; k.derrape = 0;
      if (k === yo) llegaJugador();
    } else if (k === yo && v > 1) {
      if (v === C.vueltas) { aviso('¡ÚLTIMA VUELTA!', 'DLC no incluido.', '#ffcb3d'); play('hype'); M.tmT = 1.12; }
      else aviso(trf('VUELTA %1/%2', v, C.vueltas), '', '#ffffff');
    }
  }
  if (C.crono) grabaFantasma(C);
  // el jugador: sentido contrario, cambios de puesto y frases sueltas
  const via = P.via[Math.floor(yo.idx) % N];
  yo.tContra = !yo.fin && Math.cos(yo.ang - via.ang) < -0.35 && Math.abs(yo.v) > 10 ? yo.tContra + dt : 0;
  if (C.estado === 'corre') {
    if (yo.puesto !== C.puestoAntes) {
      if (yo.puesto === 1) comenta('¡Vas en cabeza! Microblizz ya prepara un nerf.');
      else if (yo.puesto === C.karts.length && C.reloj > 6 && !C.pvp) comenta('Hemos escuchado tu feedback. No vamos a cambiar nada.');
      else if (yo.puesto < C.puestoAntes && C.orden[yo.puesto]) comenta(trf('Adelantas a %1.', tr(C.orden[yo.puesto].piloto.nombre)));
      C.puestoAntes = yo.puesto;
    }
    C.tFrase -= dt;
    if (C.tFrase <= 0) { C.tFrase = 13 + Math.random() * 6; if (TICKER.t <= 0) comenta(elige(FRASES_CARRERA)); }
    // si ya han llegado todos los demás, Microblizz cierra los servidores en 20 segundos
    if (C.llegados + (C.pvp ? pvpIdos() : 0) >= C.karts.length - 1 && C.tCierre < 0 && !C.crono) { C.tCierre = 20; comenta('Microblizz cierra los servidores de esta carrera en 20 segundos.'); }
    if (C.tCierre >= 0) { C.tCierre -= dt; if (C.tCierre <= 0) { yo.fin = C.reloj; yo.puestoFinal = ++C.llegados; yo.cerrado = true; llegaJugador(); } }
  } else if (C.estado === 'meta') {
    C.tMeta += dt;
    if (C.tMeta > 3.4) terminaCarrera();
  }
}
function llegaJugador() {
  const C = CARRERA, yo = C.jugador;
  C.estado = 'meta'; C.tMeta = 0; M.tmT = 1;
  if (C.pvp) pvpLlegada(C);
  creaIA(yo, 0.86, 0); yo.ia.tSalida = 0;      // desde la meta conduce solo
  musica(yo.puestoFinal <= 3 ? 'win' : 'lose');
  aviso(yo.cerrado ? 'SERVIDORES CERRADOS' : '¡META!', C.crono ? tiempoTxt(yo.fin) : trf('Has quedado %1', puestoTxt(yo.puestoFinal)), yo.puestoFinal <= 3 ? '#ffcb3d' : '#ffffff');
}
// la clasificación final: los que han llegado, por orden de llegada; el resto, según iban
function terminaCarrera() {
  const C = CARRERA;
  C.orden.sort((a, b) => (a.puestoFinal || 99) - (b.puestoFinal || 99) || (a.ido ? 1 : 0) - (b.ido ? 1 : 0) || b.avance - a.avance);
  C.resultado = C.orden.map((k, i) => ({ piloto: k.piloto, nombre: k.nombre, ido: !!k.ido, puesto: i + 1, tiempo: k.fin || 0, jugador: k.esJugador, monedas: k.monedas, mejor: k.mejorVuelta }));
  C.estado = 'resultado';
  if (C.pvp) pvpTermina();
  abreResultados();
}
// 1º, 2º… (en inglés: 1st, 2nd…)
function puestoTxt(n) { return IDIOMA_K === 'es' ? n + 'º' : n + (['th', 'st', 'nd', 'rd'][n] || 'th'); }
// 83.456 → 1:23.45
function tiempoTxt(t) { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); }
