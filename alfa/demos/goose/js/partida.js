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
    modo: 'juego', t: 0, cuadro: 0, armas: {}, pasivas: {}, dado: nuevoDado(), avisos: [], aviso2: null,
    nivel: 1, xp: 0, xpNecesita: xpPara(1), pendientes: 0, cartas: null, tiradas: 1 + nivelMejora('retiro'),
    casilla: 1, mejorCasilla: 1, mejorY: -40, sinAvanzar: 0, impaciente: false, yD: 40,
    invul: 0, salto: 0, saltoT: 0, caida: 0, caidaAbismo: false, pozoT: 0, posadaT: 0,
    bajas: 0, combo: 0, comboT: 0, mejorCombo: 0, hito: 0, danoTotal: 0, monedasPartida: 0,
    impulso: 0, bioma: undefined, tOla: 0, tGorda: 50, tBandada: 30, jefe: null, victoria: false, tVictoria: 0, muerto: 0, fin: null, cofre: null,
    camY: -40 - PAN.H * 0.62,
  });
  J.yo.x = CFG.W / 2; J.yo.y = -40; J.yo.miraX = 0; J.yo.miraY = -1;
  calculaStats(); J.vida = J.st.vidaMax;
  aplicaCarta(cartaArma('latigo'));
  preparaEspeciales();
  SAVE.partidas++; guarda();
  aviso(tr('¡LLEGA A LA CASILLA 63!'), '#ffd34d', 2.2); aviso2(tr('El tablero se derrumba detrás de ti'));
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
  J.cuadro++;
  if (FX.pausa > 0) { FX.pausa -= dt; avanzaEfectos(dt * 0.2); return; }
  if (FX.lento > 0) { FX.lento -= dt; dt *= 0.35; }
  J.t += dt;
  for (const a of J.avisos) a.t += dt;
  if (J.avisos.length && J.avisos[0].t > J.avisos[0].dur) { J.avisos.length = 0; J.aviso2 = null; }

  if (J.muerto > 0) { J.muerto -= dt; avanzaEfectos(dt); avanzaCamara(dt); if (J.muerto <= 0) terminaPartida(false); return; }
  if (J.victoria) { J.tVictoria -= dt; avanzaPlumas(dt, true); avanzaEfectos(dt); if (J.tVictoria <= 0) terminaPartida(true); return; }

  avanzaJugador(dt);
  avanzaSalto(dt);
  avanzaDerrumbe(dt);
  avanzaEspeciales(dt);
  vigilaBioma();
  avanzaDado(dt);
  avanzaOleadas(dt);
  avanzaEnemigos(dt);
  avanzaArmas(dt);
  avanzaPlumas(dt, false);
  avanzaEfectos(dt);
  avanzaCamara(dt);
  if (J.comboT > 0) { J.comboT -= dt; if (J.comboT <= 0) { J.mejorCombo = Math.max(J.mejorCombo, J.combo); J.combo = 0; J.hito = 0; } }
  if (J.posadaT > 0) J.posadaT -= dt;
  // el jardín: aparece la Oca Madre
  if (!J.jefe && !J.victoria && J.casilla >= CFG.jardin && J.yo.y < yCentro(CFG.jardin) + TH) apareceJefe();
  // subir de nivel: las cartas salen cuando no estás en el aire
  if (J.pendientes > 0 && J.salto <= 0 && J.caida <= 0 && J.modo === 'juego') abreCartas();
}

function avanzaCamara(dt) {
  const J = JUEGO, quiero = J.yo.y - PAN.H * 0.6;
  J.camY += (quiero - J.camY) * Math.min(1, dt * (J.salto > 0 ? 10 : 6));
  if (J.jefe || J.casilla >= CFG.jardin - 1) J.camY = Math.max(J.camY, yTecho() - 10);
}

function avanzaJugador(dt) {
  const J = JUEGO, yo = J.yo;
  if (J.invul > 0) J.invul -= dt;
  J.vida = Math.min(J.st.vidaMax, J.vida + J.st.regen * dt);
  if (J.caida > 0) {   // cayendo al vacío
    J.caida -= dt;
    if (J.caida <= 0) {
      if (J.caidaAbismo) { matarJugador(); return; }
      J.vida -= J.st.vidaMax * CFG.jugador.caida; J.invul = 1.5;
      yo.x = centroX(J.casilla); yo.y = Math.min(yo.y, J.yD - 30);
      anillo(yo.x, yo.y, 30, '#fff', 0.4, 3); SONIDO.vuelve();
      if (J.vida <= 0) matarJugador();
    }
    return;
  }
  if (J.salto > 0) return;
  let mx = ENTRADA.mx, my = ENTRADA.my;
  if (invertido()) { mx = -mx; my = -my; }
  const m = Math.hypot(mx, my);
  yo.moviendo = m > 0.12 && J.pozoT <= 0;
  if (J.pozoT > 0) { J.pozoT -= dt; if (J.pozoT <= 0) { anillo(yo.x, yo.y, 90, '#7dff6b', 0.5, 6); estallidoPozo(); } }
  if (yo.moviendo) {
    const v = J.st.vel * multiVel() * Math.min(1, m);
    yo.x += mx / Math.max(1, m) * v * dt; yo.y += my / Math.max(1, m) * v * dt;
    yo.miraX = mx / m; yo.miraY = my / m; yo.anda += dt * 10;
  }
  yo.x = clamp(yo.x, 4, CFG.W - 4);
  if (yo.y < yTecho() + 8) yo.y = yTecho() + 8;
  J.casilla = Math.max(1, casillaDe(yo.y));
  if (J.casilla > J.mejorCasilla) { J.mejorCasilla = J.casilla; if (J.casilla % 10 === 0) { texto(yo.x, yo.y - 16, tr('¡CASILLA {n}!', { n: J.casilla }), '#ffd34d', 9, 1); SONIDO.casilla(); } }
  // ¿se sale del tablero?
  if (!hayCamino(yo.x, yo.y)) {
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
  if (J.posadaT > 0 && enCasilla(yo.y, CFG.posada)) return;
  J.vida -= dano; J.invul = CFG.jugador.invulnerable;
  const d = Math.hypot(yo.x - ox, yo.y - oy) || 1; yo.x += (yo.x - ox) / d * 6; yo.y += (yo.y - oy) / d * 6;   // las hordas te empujan
  texto(yo.x, yo.y - 12, '-' + Math.round(dano), '#ff4d4d', 8, 0.6);
  destella('#ff0000', 0.22); tiembla(2.5); SONIDO.herido(); vibra(25);
  if (J.vida <= 0) matarJugador();
}
function matarJugador() {
  const J = JUEGO; if (J.muerto > 0 || J.fin) return;
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
    J.xp += p.valor; J.impulso = Math.min(CFG.impulso.lleno, J.impulso + p.valor);
    const ahora = J.t; cadena = ahora - cadenaT < 0.35 ? Math.min(cadena + 1, 24) : 0; cadenaT = ahora;
    SONIDO.pluma(cadena);
    while (J.xp >= J.xpNecesita) { J.xp -= J.xpNecesita; J.nivel++; J.xpNecesita = xpPara(J.nivel); J.pendientes++; }
    if (J.impulso >= CFG.impulso.lleno && !J.avisoImpulso) { J.avisoImpulso = true; texto(J.yo.x, J.yo.y - 20, tr('¡IMPULSO LISTO!'), '#ffd34d', 8, 1.2); SONIDO.impulsoListo(); }
  } else if (p.tipo === 'moneda') { J.monedasPartida++; SONIDO.moneda(); texto(p.x, p.y - 6, '+1', '#ffcf33', 6, 0.5); }
  else if (p.tipo === 'pollo') { J.vida = Math.min(J.st.vidaMax, J.vida + 40); texto(p.x, p.y - 6, '+40', '#7dff6b', 8, 0.8); SONIDO.cura(); }
  else if (p.tipo === 'iman') { for (let i = 0; i < PLUMAS.n; i++) if (PLUMAS.lista[i].tipo === 'xp') PLUMAS.lista[i].atraida = true; aviso(tr('¡IMÁN!'), '#6bf2ff', 1); SONIDO.iman(); }
  else if (p.tipo === 'cofre') abreCofre();
}

// --- el Impulso: dos toques con la barra llena te lanzan hacia delante (en el jardín, una onda que castiga a la Oca Madre) ---
function usaImpulso() {
  const J = JUEGO;
  if (J.modo !== 'juego' || J.impulso < CFG.impulso.lleno || J.salto > 0 || J.caida > 0 || J.muerto > 0 || J.pozoT > 0) return false;
  J.impulso = 0; J.avisoImpulso = false;
  if (J.jefe || J.casilla >= CFG.jardin - 1) {
    const yo = J.yo; anillo(yo.x, yo.y, 140, '#ffd34d', 0.6, 7); destella('#ffd34d', 0.5); tiembla(6); SONIDO.oca();
    for (let i = 0; i < ENE.n; i++) { const e = ENE.lista[i]; if (e.hp > 0) danar(e, e.tipo === 'jefe' ? e.hpMax * 0.07 : 9999, 0, -1, 200, false, true); }
    BALAS.vacia(); return true;
  }
  const destino = Math.min(CFG.jardin - 1, J.casilla + CFG.impulso.casillas);
  J.salto = 0.85; J.saltoT = 0; J.saltoDe = { x: J.yo.x, y: J.yo.y }; J.saltoA = { x: centroX(destino), y: yCentro(destino) };
  aviso(tr('¡IMPULSO!'), '#ffd34d', 1.1); destella('#ffd34d', 0.45); tiembla(4); SONIDO.oca(); vibra(50);
  return true;
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
  const J = JUEGO, r = Math.random(), n = r < 0.07 ? 5 : r < 0.32 ? 3 : 1;
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
  const monedas = Math.round(base * J.st.monedas);
  const record = J.mejorCasilla > SAVE.mejorCasilla;
  SAVE.monedas += monedas; SAVE.mejorCasilla = Math.max(SAVE.mejorCasilla, gana ? CFG.jardin : J.mejorCasilla); SAVE.mejorBajas = Math.max(SAVE.mejorBajas, J.bajas);
  if (gana) SAVE.victorias++;
  guarda();
  J.fin = { gana, monedas, record, t: 0 };
  J.modo = 'fin';
  if (typeof RENDIMIENTO !== 'undefined') try { RENDIMIENTO.parar(); } catch (e) { /* sin contador */ }
}
