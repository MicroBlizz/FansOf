// Fans of Ratkov · LA INCURSIÓN: entrar por un sitio al azar, registrar contenedores (se mantiene el botón y lo de dentro aparece poco a poco),
// la ventisca que llega (el reloj: cuando llega, el frío te mata en segundos), las salidas (el metro siempre; el puente, según el día;
// la alcantarilla, con palanca) y el final: si sales, te lo quedas todo; si caes, pierdes lo que llevabas menos la riñonera.
'use strict';
const RAID = { activa: false, t: 0, dur: 540, ventisca: 0, eq: null, mochila: [], bolsillos: [], rinonera: [], cuentas: {}, salidas: {}, dano: 0, deDonde: null, cerca: null, registro: null, salida: null, hayAuditor: false, hayLag: false, aviso2: false, aviso1: false, abierto: null };
const VALOR_ENTRADA = () => valorLista(RAID.mochila) + valorLista(RAID.bolsillos);

function sorteaBotin(tabla) {
  if (!tabla) return [];
  const sale = [], lista = tabla.sale.map(s => [s, s[1]]);
  for (const [id, n] of tabla.fijo || []) sale.push(nuevoObj(id, n));
  const veces = entero(tabla.veces[0], tabla.veces[1]);
  for (let k = 0; k < veces; k++) {
    const [id, , a, b] = sorteo(lista); const o = nuevoObj(id, entero(a, b));
    if (ARMAS[id]) o.bal = entero(0, ARMAS[id].carg);
    if (o.dur != null) o.dur = Math.round(o.dur * entre(0.35, 1));
    const igual = sale.find(s => s.id === id && apilable(s)); if (igual) igual.n += o.n; else sale.push(o);
  }
  return sale;
}

function empiezaIncursion() {
  RAID.tuto = false; document.body.classList.remove('en-tuto'); el('h-tuto').hidden = true; if (TUTO.marca) TUTO.marca.visible = false;
  // lo que llevas sale del refugio (si caes, se pierde)
  RAID.avisoSoborno = false; RAID.soborno = null; preparaTren(); preparaMinisMapa(); copiaAntesDeEntrar();
  RAID.seguro = !!SAVE.seguro; SAVE.seguro = false; RAID.phony = null;
  ajustaMochilas(); RAID.eq = copia(SAVE.equipo); RAID.mochila = copia(SAVE.mochila); RAID.bolsillos = copia(SAVE.bolsillos); RAID.rinonera = copia(SAVE.rinonera);
  RAID.dur = dif().dur; RAID.t = 0; RAID.ventisca = 0; RAID.dano = 0; RAID.deDonde = null; RAID.registro = null; RAID.salida = null; RAID.abierto = null; RAID.aviso2 = false; RAID.aviso1 = false;
  RAID.cuentas = { bajas: 0, carroneros: 0, auditor: 0, lag: 0 }; RAID.hayAuditor = false; RAID.hayLag = false; RAID.valorEntrada = VALOR_ENTRADA();
  // el mapa como nuevo: contenedores cerrados, cuerpos fuera, la verja del despacho cerrada
  MAPA.contenedores = MAPA.contenedores.filter(c => c.tipo !== 'cadaver');
  // algunas cosas vienen con cerradura: las cajas fuertes siempre; archivadores y cajas militares, a veces
  for (const c of MAPA.contenedores) { c.abierto = false; c.cosas = null; c.dim = null; c.cerradura = !c.tuto && (c.tipo === 'caja_fuerte' || (c.tipo === 'archivador' && azar(0.4)) || (c.tipo === 'militar' && azar(0.3))); if (c.tipo === 'verja') { c.cerrado = true; c.sol.abierto = false; c.verja.visible = true; } }
  limpiaEnemigos(); limpiaBalas(); quitaJugador();
  RAID.salidas = {}; for (const s of SALIDAS) RAID.salidas[s.id] = s.siempre || s.pide ? true : azar(s.prob);
  const ent = ENTRADAS[entero(0, ENTRADAS.length - 1)];
  creaJugador(ent.x, ent.z, ent.a);
  pueblaMapa();
  // no puede haber nadie encima de donde entras
  for (const e of ENEMIGOS) if (lejos(e.x, e.z, JUG.x, JUG.z) < 22) { e.casa = libreCerca(e.casa.x + (e.x - JUG.x) * 0.8, e.casa.z + (e.z - JUG.z) * 0.8, e.radio); e.x = e.casa.x; e.z = e.casa.z; }
  el('titulo').hidden = true; el('refugio').hidden = true;
  RAID.activa = true; MOTOR.escena.fog.near = 50; MOTOR.escena.fog.far = 95;
  muestraHud(true); musica('ciber');
  avisa(tr('Has entrado en el Distrito Microblizz. Encuentra botín y sal antes de la ventisca.'), 'info');
  const abiertas = SALIDAS.filter(s => RAID.salidas[s.id]).map(s => tr(s.n) + (s.pide ? ' (' + tr('con palanca') + ')' : s.cond === 'horario' ? ' (' + tr('a ratos') + ')' : s.cond === 'sinMochila' ? ' (' + tr('sin mochila') + ')' : '')).join(', ');
  setTimeout(() => avisa(trf('Salidas de hoy: %1.', abiertas), 'info'), 1500);
  if (!RAID.salidas.puente) setTimeout(() => avisa(tr('El puente del este está cerrado hoy, pero su guardia acepta sobornos.'), 'info'), 3200);
}

function avanzaIncursion(dt) {
  if (!RAID.activa) return;
  RAID.t += dt;
  avanzaTren(dt);
  // la ventisca: los últimos 90 segundos sube; al final, ruge
  const queda = RAID.dur - RAID.t;
  RAID.ventisca = queda > 90 ? 0 : queda > 0 ? 0.35 * (1 - queda / 90) : Math.min(1, 0.35 + (-queda) / 20);
  if (queda < 120 && !RAID.aviso2) { RAID.aviso2 = true; avisa(tr('La ventisca llega en 2 minutos. Busca una salida.'), 'malo'); play('alarma'); }
  if (queda < 45 && !RAID.aviso1) { RAID.aviso1 = true; avisa(tr('¡La ventisca está aquí! Sal ya o te congelarás.'), 'malo'); play('alarma'); }
  const f = MOTOR.escena.fog; f.near = 50 - RAID.ventisca * 44; f.far = 95 - RAID.ventisca * 72;
  MOTOR.hemi.intensity = 0.68 - RAID.ventisca * 0.2;
  vientoSuena(0.15 + RAID.ventisca * 0.85);
  if (RAID.tuto) avanzaTutorial(dt);
  avanzaMini(dt); avanzaCura(dt); avanzaMinisMapa(dt);
  avanzaJugador(dt); avanzaEnemigos(dt); avanzaBalas(dt); avanzaGranadas(dt); avanzaParticulas(dt);
  if (!JUG || !JUG.vivo) return;
  // registrar: lo más cercano que se pueda abrir
  RAID.cerca = null; let dMin = 1.9;
  for (const c of MAPA.contenedores) { const d = lejos(JUG.x, JUG.z, c.x, c.z); if (d < dMin) { dMin = d; RAID.cerca = c; } }
  const c = RAID.cerca;
  avanzaSoborno(); avanzaTrampaCerca();   // junto al puente cerrado, el toque de REGISTRAR soborna (antes de que lo gaste frotarse las manos)
  // en el móvil basta un toque: registra solo mientras sigas al lado (moverte lejos o disparar lo corta)
  // junto a un bidón con fuego (y sin nada que registrar al lado): cada toque frota las manos y calienta mucho, más si vas rápido
  const alFuego = !c && fuegoCerca(JUG.x, JUG.z) < RADIO_CALOR;
  RAID.alFuego = alFuego && JUG.frio > 1;
  const frota = pulsado('frota') | (!c && pulsado('registrar'));
  if (frota && alFuego) frotaManos();
  if (pulsado('registrar') && c) RAID.tapReg = c;
  if (RAID.tapReg && RAID.tapReg !== c) RAID.tapReg = null;
  const quiere = ENT.accion || (!!RAID.tapReg && RAID.tapReg === c);
  if (c && quiere && !JUG.uso && JUG.recarga <= 0) {
    if (c.tipo === 'verja' && c.cerrado) {
      if (cuantos(RAID.mochila, 'tarjeta') + cuantos(RAID.bolsillos, 'tarjeta') + cuantos(RAID.rinonera, 'tarjeta') <= 0) { if (!RAID.registro) avisa(tr('Cerrado. Hace falta la tarjeta roja de directivo.'), 'malo'); RAID.registro = { c, t: 0, max: 99 }; }
      else { if (!RAID.registro || RAID.registro.c !== c) RAID.registro = { c, t: 0, max: 2.2 }; RAID.registro.t += dt; if (RAID.registro.t >= 2.2) abreVerja(c); }
    } else if (c.abierto && c.tipo !== 'verja') { if (!RAID.registro) { abreBotin(c); RAID.registro = { c, t: 99, max: 99 }; } }
    else if (c.hackeo && !c.abierto) { if (!MINI.tipo && !RAID.registro) abreTerminal(c); RAID.registro = { c, t: 99, max: 99 }; }
    else if (c.cerradura) { if (!MINI.tipo && !RAID.registro) abreCerradura(c); RAID.registro = { c, t: 99, max: 99 }; }
    else if (c.tipo !== 'verja') {
      const base = c.t || (TABLAS[c.tipo] ? TABLAS[c.tipo].t : 1.5), max = base * (SAVE.animal === 'junkcoon' ? 0.5 : 1);
      if (!RAID.registro || RAID.registro.c !== c) { RAID.registro = { c, t: 0, max }; play('registra'); }
      RAID.registro.t += dt; if (Math.random() < dt * 3) play('registra');
      if (RAID.registro.t >= max) { c.abierto = true; if (!c.cosas) c.cosas = c.fijo ? c.fijo.map(([id, n]) => nuevoObj(id, n)) : sorteaBotin(TABLAS[c.tipo]); abreBotin(c, true); RAID.registro.t = 99; }
    }
  } else if (!quiere) RAID.registro = null;
  if (RAID.registro && RAID.registro.t >= 50) RAID.tapReg = null;
  if (RAID.abierto && lejos(JUG.x, JUG.z, RAID.abierto.x, RAID.abierto.z) > 2.6) cierraVentana('v-botin');
  // las salidas
  let enSalida = null;
  for (const s of RAID.tuto ? [TUTO_SALIDA] : SALIDAS) {
    if (!RAID.salidas[s.id] || (s.cond === 'horario' && !(RAID.tren && RAID.tren.esta))) continue;   // el tren, solo mientras está parado
    if (s.dentro ? s.dentro(JUG) : lejos(JUG.x, JUG.z, s.x, s.z) < s.r) enSalida = s;
  }
  if (enSalida) {
    if (enSalida.cond === 'sinMochila' && RAID.eq.mochila) { if (!RAID.salida || RAID.salida.s !== enSalida) { avisa(tr('La rejilla es muy estrecha: con la mochila puesta no pasas. Suéltala en MOCHILA.'), 'malo'); RAID.salida = { s: enSalida, t: 99, bloqueada: true }; } }
    else if (enSalida.pide && cuantos(RAID.mochila, enSalida.pide) + cuantos(RAID.bolsillos, enSalida.pide) + cuantos(RAID.rinonera, enSalida.pide) <= 0) { if (!RAID.salida || RAID.salida.s !== enSalida) { avisa(tr('La tapa no se mueve. Te hace falta una palanca.'), 'malo'); RAID.salida = { s: enSalida, t: 99, bloqueada: true }; } }
    else { if (!RAID.salida || RAID.salida.s !== enSalida) { RAID.salida = { s: enSalida, t: 6 }; play('select'); } RAID.salida.t -= dt; if (RAID.salida.t <= 0) { play('salida'); if (RAID.tuto) terminaTutorial(); else terminaIncursion(true, enSalida); } }
  } else RAID.salida = null;
  RAID.dano = Math.max(0, RAID.dano - dt * 1.5); if (RAID.deDonde) { RAID.deDonde.t -= dt; if (RAID.deDonde.t <= 0) RAID.deDonde = null; }
}
function frotaManos() {
  const ahora = performance.now() / 1000, rapido = ahora - (RAID.frotaT || -9) < 0.4;
  RAID.frotaT = ahora; RAID.frotaRacha = rapido ? Math.min(10, (RAID.frotaRacha || 0) + 1) : 1;
  JUG.frio = Math.max(0, JUG.frio - (5 + RAID.frotaRacha * 0.8));
  RAID.frotaVis = 0.7; RAID.frotaLado = -(RAID.frotaLado || 1);
  play('registra');
}
function abreVerja(c) {
  let q = quitar(RAID.mochila, 'tarjeta', 1); if (!q) q = quitar(RAID.bolsillos, 'tarjeta', 1); if (!q) quitar(RAID.rinonera, 'tarjeta', 1);
  compacta(RAID.mochila); c.cerrado = false; c.sol.abierto = true; c.verja.visible = false; c.abierto = true; c.cosas = [];
  play('puerta'); avisa(tr('El Despacho del Director está abierto. Huele a puro y a despidos.'), 'bien'); RAID.registro = { c, t: 99, max: 99 };
  oyeRuido(c.x, c.z, 20);
}

// el final: sales o caes
function terminaIncursion(vivo, salida) {
  if (!RAID.activa) return;
  RAID.activa = false; cierraTodas(); vientoCalla();
  const cu = SAVE.cuentas; cu.incursiones++; cu.bajas += RAID.cuentas.bajas; cu.carroneros += RAID.cuentas.carroneros; cu.auditor += RAID.cuentas.auditor; cu.lag += RAID.cuentas.lag;
  const valor = valorLista(RAID.mochila) + valorLista(RAID.bolsillos) + valorLista(RAID.rinonera);
  const ganado = Math.max(0, valor - RAID.valorEntrada);
  let perdido = [];
  if (vivo) {
    cu.salidas++; if (salida && salida.id === 'alcantarilla') cu.alcantarilla++;
    cu.mejor = Math.max(cu.mejor, ganado);
    SAVE.equipo = RAID.eq; SAVE.mochila = compacta(RAID.mochila); SAVE.bolsillos = RAID.bolsillos; SAVE.rinonera = RAID.rinonera;
    musica('win');
  } else {
    cu.caidas++;
    perdido = [...['arma1', 'arma2', 'chaleco', 'casco', 'mochila'].map(k => RAID.eq[k]), ...RAID.mochila, ...RAID.bolsillos].filter(Boolean);
    // el seguro de Phony: cada cosa puesta vuelve al alijo… si no pierde el papeleo (3 de cada 10)
    if (RAID.seguro) { RAID.phony = { vuelve: [], perdido: [] }; for (const k of PUESTO) { const o = RAID.eq[k]; if (!o) continue; if (azar(0.7)) { meterAlijo(sinSitio(copia(o))); RAID.phony.vuelve.push(o); } else RAID.phony.perdido.push(o); } }
    SAVE.equipo = { arma1: null, arma2: null, chaleco: null, casco: null, mochila: null }; SAVE.mochila = []; SAVE.bolsillos = [null, null, null]; SAVE.rinonera = RAID.rinonera;
    musica('lose');
  }
  revisaEncargos(); guardaPartida();
  setTimeout(() => muestraFin(vivo, salida, ganado, perdido), vivo ? 400 : 1600);
}
