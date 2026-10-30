// Fans of Goose · La partida: el estado (JUEGO), el jugador (moverse, caerse al vacío, recibir golpes), las plumas (experiencia,
// Impulso y monedas), subir de nivel, los cofres, el combo y el final (llegar al Jardín y vencer a la Oca Madre, o caer).
'use strict';

const JUEGO = { modo: 'portada', t: 0, cuadro: 0, yo: { x: 100, y: -40, miraX: 0, miraY: -1, moviendo: false, anda: 0 }, armas: {}, pasivas: {}, st: {}, dado: null, avisos: [] };
const enPartida = () => ['juego', 'cartas', 'cofre', 'pausa'].includes(JUEGO.modo);

function nuevaPartida() {
  const J = JUEGO;
  for (const R of [ENE, BALAS, PROY, CHARCOS, PLUMAS, PART, TXT]) R.vacia();
  LATIGAZOS.length = 0; FX.anillos.length = 0;
  Object.assign(J, {
    modo: 'juego', t: 0, cuadro: 0, armas: {}, pasivas: {}, restosParca: null, dado: nuevoDado(), avisos: [], aviso2: null,
    nivel: 1, xp: 0, xpNecesita: xpPara(1), pendientes: 0, cartas: null, tiradas: 1 + nivelMejora('retiro'),
    casilla: 1, mejorCasilla: 1, mejorY: -40, sinAvanzar: 0, impaciente: false, yD: 40,
    invul: 0, salto: 0, saltoT: 0, caida: 0, caidaAbismo: false, fase: 'parado', escena: null, destino: 1, quieto: 0, tramoT: 0, suerteT: 0, golpeT: 0, latigoT: 0, minijefe: null, trato: null, parcaHecha: false, saltoParca: 0, fuegos: [], puertas: new Set(), maldicion: null, casillas: null,
    bajas: 0, combo: 0, comboT: 0, mejorCombo: 0, hito: 0, danoTotal: 0, monedasPartida: 0,
    impulso: 0, bioma: undefined, tOla: 0, tGorda: 50, tBandada: 30, jefe: null, victoria: false, tVictoria: 0, muerto: 0, fin: null, cofre: null, carrera: null,
    camY: -40 - PAN.H * 0.62,
    noche: 1, mod: null, ruta: {}, extra: {}, mjHechos: 0, compro: false, frenado: 0, tRoca: 2, rnd: null, rndDado: null, diario: false, eleccion: null,
  });
  // la noche, el azar y el modo (js/noches.js, js/desafios.js): Tablero del día, con amigos (misma semilla para todos) o normal
  if (J.diarioPedido) { J.diarioPedido = false; J.diario = true; preparaDiario(); }
  else if (J.semillaSala) { J.rnd = semillaAzar(J.semillaSala); J.semillaSala = 0; }
  else J.noche = Math.max(1, Math.min(SAVE.noche || 1, SAVE.nocheMax || 1));
  J.mod = modNoche(); PELIGROS.length = 0; vaciaArmasNuevas(); vaciaArmasMas();
  J.yo.x = CFG.W / 2; J.yo.y = -40; J.yo.miraX = 0; J.yo.miraY = -1;
  J.pers = J.diario ? personajeDelDia() : personaje(); J.yo.dir = 1;
  sorteaTierras(); J.maldicion = eligeMaldicion(); barajaCasillas();
  calculaStats(); J.vida = J.st.vidaMax;
  aplicaCarta(cartaArma(J.pers.arma));
  if (J.pers.id === 'blanco') J.tiradas++;
  // la tienda: Pluma de fénix, Arsenal y Dado de la suerte
  J.fenix = nivelMejora('fenix'); J.habT = 0; J.torbellino = 0; J.bendicion = 0; J.rafaga = null; J.escudoListo = 0;
  if (nivelMejora('arsenal')) { const otras = Object.keys(ARMAS).filter(id => id !== J.pers.arma && armaAbierta(id)); aplicaCarta(cartaArma(otras[(Math.random() * otras.length) | 0])); }
  if (nivelMejora('suerte')) J.dado.bendito = true;
  preparaEspeciales();
  SAVE.partidas++; guarda();
  if (J.maldicion.id === 'ninguna') { aviso(tr('¡LLEGA A LA CASILLA 63!'), '#ffd34d', 2.2); aviso2(tr('El tablero se derrumba detrás de ti')); }
  else { aviso(tr('MALDICIÓN: {n}', { n: tr(J.maldicion.nombre) }), '#c9a0ff', 2.6); aviso2(tr(J.maldicion.desc)); }
  SONIDO.empieza();
  if (typeof RENDIMIENTO !== 'undefined') try { RENDIMIENTO.activar({ mostrar: !!(window.NUCLEO && NUCLEO.desarrollo) }); } catch (e) { /* sin contador */ }
}
const xpPara = n => 3 + n * 3 + Math.floor(n * n * 0.3);

// --- avisos grandes en el centro ---
function aviso(txt, color, dur = 1.3) { JUEGO.avisos = [{ txt, color, t: 0, dur }]; JUEGO.aviso2 = null; }
function aviso2(txt) { JUEGO.aviso2 = txt; }

// --- el bucle de la partida ---
function avanzaPartida(dt) {
  const J = JUEGO;
  if (J.eleccion) { J.modo = 'eleccion'; return; }   // una elección pendiente (js/caminos.js)
  J.cuadro++;
  if (FX.pausa > 0) { FX.pausa -= dt; avanzaEfectos(dt * 0.2); return; }
  if (FX.lento > 0) { FX.lento -= dt; dt *= 0.35; }
  J.t += dt;
  for (const a of J.avisos) a.t += dt;
  if (J.avisos.length && J.avisos[0].t > J.avisos[0].dur) { J.avisos.length = 0; J.aviso2 = null; }

  // la Carrera: la cuenta atrás de la salida
  if (J.carrera && J.carrera.cuenta > 0) { const antes = Math.ceil(J.carrera.cuenta); J.carrera.cuenta -= dt; if (Math.ceil(J.carrera.cuenta) !== antes) SONIDO.dadoTic(); if (J.carrera.cuenta <= 0) { aviso(tr('¡YA!'), '#ffd34d', 1); SONIDO.empieza(); } avanzaCamara(dt); return; }
  if (J.victoria) { J.muerto = 0; J.tVictoria -= dt; avanzaPlumas(dt, true); avanzaEfectos(dt); if (J.tVictoria <= 0) { if (esCoop()) terminaCoop(true); else terminaPartida(true); } return; }
  if (J.muerto > 0) {
    J.muerto -= dt; avanzaEfectos(dt); avanzaCamara(dt);
    if (J.muerto <= 0) {
      if (esCoop()) { if (!J.carrera.caido) caidoCoop(); J.muerto = 0.001; }
      else if (J.carrera) { if (!J.carrera.caido) { J.carrera.caido = true; mandaCarrera({ t: 'm', c: J.mejorCasilla }); aviso(tr('Has caído: mira cómo acaba la carrera'), '#ff4d4d', 2.5); } J.muerto = 0.001; }
      else terminaPartida(false);
    }
    if (J.carrera) avanzaCarrera(dt);
    return;
  }

  avanzaJugador(dt);
  avanzaHabilidad(dt);   // la habilidad del personaje (js/habilidades.js)
  avanzaSalto(dt);
  avanzaDerrumbe(dt);
  avanzaTierras(dt); avanzaTierras2(dt); avanzaCaminos(); charcosMalos(dt);
  if (J.saltoParca > 0) J.saltoParca -= dt;
  vigilaBioma();
  avanzaDado(dt);
  avanzaOleadas(dt);
  avanzaEnemigos(dt);
  avanzaArmas(dt);
  avanzaPlumas(dt, false);
  avanzaEfectos(dt);
  avanzaCamara(dt);
  if (J.comboT > 0) { J.comboT -= dt; if (J.comboT <= 0) { J.mejorCombo = Math.max(J.mejorCombo, J.combo); J.combo = 0; J.hito = 0; } }
  // el jardín: aparece la Oca Madre
  if (J.carrera) avanzaCarrera(dt);
  if ((!J.carrera || esCoop()) && !J.jefe && !J.victoria && J.casilla >= CFG.jardin && J.yo.y < yCentro(CFG.jardin) + TH) apareceJefe();
  // subir de nivel: las cartas salen cuando no estás en el aire
  if (J.pendientes > 0 && J.salto <= 0 && J.caida <= 0 && J.fase !== 'tramo' && J.modo === 'juego') abreCartas();
}

function avanzaCamara(dt) {
  const J = JUEGO;
  let ref = J.yo.y;
  if (J.muerto > 0 && J.carrera) {   // caído: miras al compañero que va delante
    let mejor = null; for (const r of J.carrera.rivales.values()) if (!r.muerto && r.llega === null && (mejor === null || r.y < mejor)) mejor = r.y;
    if (mejor !== null) ref = mejor;
  }
  const quiero = ref - PAN.H * 0.6;
  J.camY += (quiero - J.camY) * Math.min(1, dt * (J.salto > 0 ? 10 : 6));
  if (J.jefe || J.casilla >= CFG.jardin - 1) J.camY = Math.max(J.camY, yTecho() - 10);
}

function avanzaJugador(dt) {
  const J = JUEGO, yo = J.yo;
  if (J.invul > 0) J.invul -= dt;
  if (J.golpeT > 0) J.golpeT -= dt; if (J.latigoT > 0) J.latigoT -= dt;
  J.vida = Math.min(J.st.vidaMax, J.vida + J.st.regen * dt);
  if (J.caida > 0) {   // cayendo al vacío
    J.caida -= dt;
    if (J.caida <= 0) {
      if (J.caidaAbismo) { matarJugador(); return; }
      J.vida -= J.st.vidaMax * CFG.jugador.caida; J.invul = 1.5;
      const E = J.escena; if (E && E.tipo === 'puente') yo.y -= 20;   // en el Puente, un empujón hacia delante (el derrumbe viene justo detrás)
      yo.x = E && E.tipo === 'puente' ? xPuente(yo.y) : E && E.cx !== undefined ? E.cx : centroX(J.casilla); yo.y = Math.min(yo.y, J.yD - 30);
      anillo(yo.x, yo.y, 30, '#fff', 0.4, 3); SONIDO.vuelve();
      if (J.vida <= 0) matarJugador();
    }
    return;
  }
  if (J.salto > 0) return;
  // el ritmo de la Oca: parado en la casilla, en el tramo o en una escena (js/escenas.js)
  if (J.fase === 'tramo') avanzaTramo(dt);
  else if (J.fase === 'escena' && J.escena && J.escena.tipo === 'puente') avanzaPuente(dt);
  else avanzaParado(dt);
  yo.x = clamp(yo.x, 4, CFG.W - 4);
  if (yo.y < yTecho() + 8) yo.y = yTecho() + 8;
  // ¿se sale del tablero? (solo corriendo: parado no te caes)
  const encerrado = J.escena && (J.escena.tipo === 'pozo' || J.escena.tipo === 'carcel');
  if (!encerrado && !hayCamino(yo.x, yo.y)) {
    J.caida = 0.55; J.caidaAbismo = yo.y > J.yD - 1;
    aviso(J.caidaAbismo ? tr('¡EL ABISMO!') : tr('¡AL VACÍO!'), '#ff4d4d', 1); SONIDO.cae(); vibra(120);
  }
}
function estallidoPozo() {   // al salir del Pozo, una onda que barre todo lo cercano
  const yo = JUEGO.yo, n = enemigosCerca(yo.x, yo.y, 70);
  for (let i = 0; i < n; i++) { const e = ENE.lista[CERCA[i]]; if (e.hp > 0) { const d = Math.hypot(e.x - yo.x, e.y - yo.y) || 1; if (d < 70) danar(e, 60 * JUEGO.st.dano, (e.x - yo.x) / d, (e.y - yo.y) / d, 260); } }
  tiembla(5); SONIDO.explota();
}

function heridaJugador(dano, ox, oy) {
  const J = JUEGO, yo = J.yo;
  if (J.escena && J.escena.tipo === 'posada') return;
  if (escudoPara()) return;   // Escudo de plumas (js/armas3.js)
  J.vida -= dano; J.invul = CFG.jugador.invulnerable; J.golpeT = 0.25;
  const d = Math.hypot(yo.x - ox, yo.y - oy) || 1; yo.x += (yo.x - ox) / d * 6; yo.y += (yo.y - oy) / d * 6;   // las hordas te empujan
  texto(yo.x, yo.y - 12, '-' + Math.round(dano), '#ff4d4d', 8, 0.6);
  destella('#ff0000', 0.22); tiembla(2.5); SONIDO.herido(); vibra(25);
  if (J.vida <= 0) matarJugador();
}
function matarJugador() {
  const J = JUEGO; if (J.muerto > 0 || J.fin) return;
  if (J.fenix > 0) { J.fenix--; J.vida = J.st.vidaMax * 0.5; J.invul = 2.5; J.caida = 0; J.caidaAbismo = false; J.fase = 'parado'; J.escena = null; J.yo.x = centroX(J.casilla); J.yo.y = yCentro(J.casilla); J.yD = Math.max(J.yD, J.yo.y + 90); aviso(tr('¡PLUMA DE FÉNIX!'), '#ff9b4d', 1.6); anillo(J.yo.x, J.yo.y, 90, '#ff9b4d', 0.8, 5); destella('#ff9b4d', 0.6); SONIDO.evolucion(); return; }   // la de la tienda: una vida más
  J.vida = 0; J.muerto = 1.4;
  estallido(J.yo.x, J.yo.y, 30, '#8a1e22', 120, 1, 3, 1, 40);
  tiembla(7); destella('#ff0000', 0.6); SONIDO.muereYo(); vibra(300);
}

// --- plumas, monedas y cosas del suelo ---
function avanzaPlumas(dt, todas) {
  const J = JUEGO, yo = J.yo, l = PLUMAS.lista, iman = J.st.iman, i2 = iman * iman;
  for (let i = PLUMAS.n - 1; i >= 0; i--) {
    const p = l[i]; p.t += dt;
    const dx = yo.x - p.x, dy = yo.y - p.y, d2 = dx * dx + dy * dy;
    if (todas) p.atraida = true;
    if (!p.atraida && (d2 < i2 || (p.tipo !== 'xp' && d2 < 14 * 14) || p.y > yo.y + 70 || p.y > J.yD - 30)) p.atraida = true;   // las que se quedan atrás vienen solas: el abismo no se las come
    if (p.atraida) {
      const d = Math.sqrt(d2) || 1, v = 90 + p.t * 140;
      p.vx = dx / d * v; p.vy = dy / d * v;
    } else { p.vx *= 1 - 4 * dt; p.vy *= 1 - 4 * dt; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (d2 < 64) { recoge(p); PLUMAS.quita(i); }
  }
}
let cadenaT = 0, cadena = 0;
function recoge(p) {
  const J = JUEGO;
  if (p.tipo === 'xp') {
    const val = p.valor * (maldita('avaro') ? 2 : 1); J.xp += val; J.impulso = Math.min(plumasDado(), J.impulso + val);
    const ahora = J.t; cadena = ahora - cadenaT < 0.35 ? Math.min(cadena + 1, 24) : 0; cadenaT = ahora;
    SONIDO.pluma(cadena);
    while (J.xp >= J.xpNecesita) { J.xp -= J.xpNecesita; J.nivel++; J.xpNecesita = xpPara(J.nivel); J.pendientes++; }
    if (J.impulso >= plumasDado() && !J.avisoImpulso) { J.avisoImpulso = true; J.dado.bendito = true; texto(J.yo.x, J.yo.y - 20, tr('¡DADO BENDITO!'), '#ffd34d', 8, 1.2); SONIDO.impulsoListo(); }
  } else if (p.tipo === 'robada') { /* el cuervo se la llevó */ }
  else if (p.tipo === 'moneda') { J.monedasPartida += maldita('avaro') && Math.random() < 0.5 ? 0 : 1; SONIDO.moneda(); texto(p.x, p.y - 6, '+1', '#ffcf33', 6, 0.5); }
  else if (p.tipo === 'pollo') { J.vida = Math.min(J.st.vidaMax, J.vida + 40 * J.mod.cura); texto(p.x, p.y - 6, '+' + Math.round(40 * J.mod.cura), '#7dff6b', 8, 0.8); SONIDO.cura(); }
  else if (p.tipo === 'iman') { for (let i = 0; i < PLUMAS.n; i++) if (PLUMAS.lista[i].tipo === 'xp') PLUMAS.lista[i].atraida = true; aviso(tr('¡IMÁN!'), '#6bf2ff', 1); SONIDO.iman(); }
  else if (p.tipo === 'cofre') abreCofre();
}

// --- combo ---
const HITOS = [25, 50, 100, 150, 200, 300, 400, 500, 750, 1000];
function hitosCombo() {
  const J = JUEGO;
  if (J.hito < HITOS.length && J.combo >= HITOS[J.hito]) {
    const n = HITOS[J.hito]; J.hito++;
    const frases = ['¡MATANZA!', '¡MASACRE!', '¡FESTÍN!', '¡PLUMAGEDÓN!', '¡LEYENDA DE LA OCA!'];
    texto(CFG.W / 2, J.camY + PAN.H * 0.32, tr(frases[Math.min(frases.length - 1, J.hito - 1)]) + ' x' + n, '#ffd34d', 11, 1.3, -14);
    SONIDO.hito(J.hito); tiembla(2);
    if (enCarrera()) { mandaCarrera({ t: 'a' }); texto(J.yo.x, J.yo.y - 22, tr('¡Bandada enviada a tus rivales!'), '#9fe0ff', 7, 1.3); }
  }
}

// --- subir de nivel ---
function abreCartas() {
  const J = JUEGO;
  J.pendientes--; J.modo = 'cartas'; J.cartas = reparteCartas(); J.cartasT = 0; J.cartaElegida = -1;
  anillo(J.yo.x, J.yo.y, 80, '#ffd34d', 0.5, 4); SONIDO.nivel();
}
function eligeCarta(i) {
  const J = JUEGO; if (J.cartaElegida >= 0 || !J.cartas[i]) return;
  J.cartaElegida = i; J.cartasT = 0;
  aplicaCarta(J.cartas[i]); SONIDO.elige(J.cartas[i].clase === 'evo');
  setTimeout(() => { if (J.modo === 'cartas') { J.modo = 'juego'; J.invul = Math.max(J.invul, 0.6); } }, 380);
}
function vuelveATirar() {
  const J = JUEGO; if (J.tiradas <= 0 || J.cartaElegida >= 0) return;
  J.tiradas--; J.cartas = reparteCartas(); J.cartasT = 0; SONIDO.dadoRueda();
}

// --- cofres: el dado decide si traen 1, 3 o 5 mejoras ---
function abreCofre() {
  const J = JUEGO, r = Math.random() - (J.st.llave || 0), n = r < 0.07 ? 5 : r < 0.32 ? 3 : 1;   // la Llave del cofre los mejora
  const premios = [];
  for (let i = 0; i < n; i++) {
    const evo = evolucionesListas(), todas = evo.length ? evo : cartasPosibles().filter(c => !c.nueva);
    const distintas = todas.filter(c => !premios.some(p => p.id === c.id)), pos = distintas.length ? distintas : todas;   // a ser posible, cosas distintas
    const c = pos.length ? pick(pos) : { clase: 'monedas', id: 'monedas', nombre: 'Bolsa de monedas', desc: '+25 monedas.', icono: 'moneda', color: '#ffcf33' };
    aplicaCarta(c); premios.push(c);
  }
  const monedas = 10 + Math.floor(Math.random() * 15) + (n - 1) * 10; J.monedasPartida += monedas;
  J.cofre = { n, premios, monedas, t: 0 }; J.modo = 'cofre';
  SONIDO.cofre();
}
function cierraCofre() { const J = JUEGO; if (!J.cofre || J.cofre.t < 1.4) return; J.cofre = null; J.modo = 'juego'; J.invul = 0.8; }

// --- final ---
function terminaPartida(gana) {
  const J = JUEGO;
  J.mejorCombo = Math.max(J.mejorCombo, J.combo);
  const base = J.monedasPartida + J.mejorCasilla + Math.floor(J.bajas / 20) + (gana ? 100 : 0);
  const diario = J.diario ? terminaDiario(gana) : null;
  const monedas = Math.round(base * J.st.monedas * J.mod.monedas * (diario && diario.primera ? 2 : 1));
  const record = J.mejorCasilla > SAVE.mejorCasilla;
  const noche = gana && !J.diario ? ganaNoche() : 0, desafios = repasaDesafios(gana);
  SAVE.monedas += monedas; SAVE.mejorCasilla = Math.max(SAVE.mejorCasilla, gana ? CFG.jardin : J.mejorCasilla); SAVE.mejorBajas = Math.max(SAVE.mejorBajas, J.bajas);
  if (gana) SAVE.victorias++;
  guarda();
  J.fin = { gana, monedas, record, t: 0, noche, desafios, diario };
  J.modo = 'fin';
  if (typeof RENDIMIENTO !== 'undefined') try { RENDIMIENTO.parar(); } catch (e) { /* sin contador */ }
}
