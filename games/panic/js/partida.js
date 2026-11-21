// Fans of Panic · Partida: el estado del juego (JUEGO), empezar un nivel, el avance de cada fotograma, qué pasa al cerrar un
// corte (porcentaje, combo, corte grande, ATRAPADO), morir, ganar y seguir tras perder. Las pantallas están en sus archivos.
'use strict';

const JUEGO = {
  modo: 'menu', t: 0, mundo: 'playa', n: 1, nivel: null,
  tiempo: 0, pct: 0, puntos: 0, combo: 0, comboT: 0, mejorCombo: 0,
  vidasNivel: 3, escudo: false, rapidoT: 0, fantasmaT: 0, dobleT: 0, lolaT: 0, mechaT: 0, mecha: null, peligro: false, objT: 0, locT: 0,
  seguidos: 0, tFin: 0, fin: null, tInicio: 0, tapadas0: 1, muerteT: 0, cortes: 0,
};

const enPartida = () => ['juego', 'pausa', 'fin'].includes(JUEGO.modo);

function empiezaNivel(mundo, n) {
  const J = JUEGO, M = MUNDOS[mundo], nv = M.niveles[n - 1];
  J.mundo = mundo; J.n = n; J.nivel = nv; J.modo = 'juego'; J.t = 0;
  J.tiempo = nv.tiempo; J.pct = 0; J.puntos = 0; J.combo = 0; J.comboT = 0; J.mejorCombo = 0; J.cortes = 0;
  J.vidasNivel = 3; J.escudo = false; J.rapidoT = 0; J.fantasmaT = 0; J.dobleT = 0; J.lolaT = 0; J.mechaT = 0; J.mecha = null; J.seguidos = 0; J.tInicio = 1.2; J.muerteT = 0;
  nuevoTablero(); preparaIlustracion(mundo, n, TAB.w, TAB.h); limpiaLocuras(); precargaSprites();
  colocaCursor(); nuevoJefe(nv, M); nuevosBecarios(nv.becarios, 9 + n * 1.5); nuevosObjetos();
  J.tapadas0 = tapadasTotal();
  FX.parts.length = 0; FX.textos.length = 0; OPC.abierto = false;
  SAVE.partidas++; guarda();
}

function avanzaJuego(dt0) {
  const J = JUEGO;
  if (FX.paron > 0) { FX.paron -= dt0; return; }
  const dt = FX.lento > 0 ? (FX.lento -= dt0, dt0 * 0.3) : dt0;
  J.t += dt; avanzaEfectos(dt);
  if (J.modo === 'fin') { J.tFin += dt; return; }
  if (J.modo !== 'juego' || OPC.abierto) return;
  if (J.tInicio > 0) { J.tInicio -= dt; return; }
  if (J.muerteT > 0) { J.muerteT -= dt; if (J.muerteT <= 0) reanuda(); return; }
  if (!avanzaReloj(dt)) return;
  avanzaCursor(dt); if (J.modo !== 'juego') return;
  avanzaJefe(dt); avanzaBecarios(dt); avanzaObjetos(dt); avanzaLocuras(dt);
  J.peligro = CUR.trazando && Math.hypot(JEFE.x - CUR.x - 0.5, JEFE.y - CUR.y - 0.5) < JEFE.r + 6;
  if (jefeToca()) muere('jefe');
  else if (becarioPilla()) muere('becario');
}

// el tiempo del nivel y los contadores que se agotan (Tijera, combo); false si se acabó el turno
function avanzaReloj(dt) {
  const J = JUEGO;
  J.tiempo -= dt;
  if (J.tiempo <= 0) { J.tiempo = 0; muere('tiempo'); return false; }
  if (J.tiempo < 10 && Math.floor(J.tiempo) !== Math.floor(J.tiempo + dt)) SONIDO.tic();
  for (const k of ['rapidoT', 'fantasmaT', 'dobleT', 'lolaT']) if (J[k] > 0) J[k] -= dt;
  if (J.comboT > 0) { J.comboT -= dt; if (J.comboT <= 0) J.combo = 0; }
  return true;
}

// al cerrar un trazo: destapar, contar, combo, premios
function cierraCorte() {
  const J = JUEGO, jx = Math.floor(JEFE.x), jy = Math.floor(JEFE.y);
  const corte = cierraTrazo(jx, jy); let { n, sil } = corte;
  if (J.dobleT > 0 && n > 0) { const s2 = reflejaDestapado(corte.nuevo); sil += s2; n += s2; }
  CUR.trail = []; J.mechaT = 0; J.mecha = null; J.cortes++;
  recolocaJefe(); recolocaHijos(); recogeObjetos(); limpiaAnuncios();
  const parte = sil / TAB.total, antes = J.pct; J.pct = porcentaje();
  J.combo = J.comboT > 0 ? J.combo + 1 : 1; J.comboT = AJUSTES.combo; J.mejorCombo = Math.max(J.mejorCombo, J.combo);
  const pts = Math.round(sil * 10 * Math.max(1, J.combo));
  J.puntos += pts;
  const px = TAB.x0 + (CUR.x + 0.5) * TAB.c, py = TAB.y0 + (CUR.y + 0.5) * TAB.c;
  if (sil > 0) textoSube(`+${pts}`, px, py - 10, COL.blanco, 16);
  if (J.combo > 1) { textoSube(tr('COMBO'), px, py - 30, COL.oro, 20, 'combo'); textoSube(`x${J.combo}`, px, py - 50, COL.oro, 18); SONIDO.combo(J.combo); }
  SONIDO.corte(Math.round(parte * 20)); vibra(parte > AJUSTES.corteGrande ? [30, 30, 60] : 20);
  confeti(px, py, Math.min(60, 6 + n / 10), MUNDOS[J.mundo].claro);
  temblor(Math.min(1, parte * 4));
  if (parte >= AJUSTES.corteGrande) { camaraLenta(0.3); SONIDO.grande(); textoSube(tr('¡CORTE GRANDE!'), TAB.x0 + TAB.w / 2, TAB.y0 + TAB.h / 2, COL.rosa, 26, 'corte'); temblor(1); }
  if (antes < 0.5 && J.pct >= 0.5) textoSube(tr('¡Mitad!'), TAB.x0 + TAB.w / 2, TAB.y0 + 40, COL.cian, 18);
  if (libresDelJefe(jx, jy) < J.tapadas0 * AJUSTES.atrapado) { atrapado(); return; }
  if (J.pct >= AJUSTES.objetivo) gana();
}

// lo que destapa un poder (Bomba, Lola): puntos, porcentaje y fin del nivel si toca
function sumaDestapado(sil, motivo) {
  const J = JUEGO, jx = Math.floor(JEFE.x), jy = Math.floor(JEFE.y);
  J.puntos += sil * 10; J.pct = porcentaje(); limpiaAnuncios();
  barrido(TAB.x0, TAB.y0, TAB.w, TAB.h);
  if (libresDelJefe(jx, jy) < J.tapadas0 * AJUSTES.atrapado) { atrapado(); return; }
  if (J.pct >= AJUSTES.objetivo) gana();
}

// el jefe acorralado: se destapa todo
function atrapado() {
  for (let i = 0; i < TAB.cel.length; i++) TAB.cel[i] = DESTAPADA;
  JUEGO.pct = 1; JUEGO.puntos += 500;
  SONIDO.atrapado(); temblor(1.5); vibra([50, 40, 50, 40, 120]);
  textoSube(tr('¡ATRAPADO!'), TAB.x0 + TAB.w / 2, TAB.y0 + TAB.h / 2, COL.oro, 30, 'atrapado');
  gana();
}

function muere(motivo) {
  const J = JUEGO;
  if (J.escudo && motivo !== 'tiempo') { J.escudo = false; SONIDO.escudo(); textoSube(tr('¡Escudo roto!'), TAB.x0 + TAB.w / 2, TAB.y0 + 60, COL.verde, 18); empujaJefe(); return; }
  SONIDO.muere(); temblor(1.5); vibra(150); paron(0.08);
  borraTrazo(); CUR.trazando = false; CUR.trail = []; J.mechaT = 0; J.mecha = null; paraCursor();
  J.combo = 0; J.comboT = 0;
  const px = TAB.x0 + (CUR.x + 0.5) * TAB.c, py = TAB.y0 + (CUR.y + 0.5) * TAB.c;
  confeti(px, py, 30, '#ff3b3b');
  if (motivo === 'tiempo') { pierde('tiempo'); return; }
  J.vidasNivel--;
  textoSube(motivo === 'mecha' ? tr('¡La mecha!') : motivo === 'becario' ? tr('¡Un becario!') : tr('¡El Inspector!'), px, py - 20, '#ff6b6b', 18);
  if (J.vidasNivel <= 0) { pierde(motivo); return; }
  J.muerteT = 0.8;
}

// al romper el escudo, el jefe sale rebotado para que no te mate en el mismo sitio
function empujaJefe() { JEFE.vx = -JEFE.vx; JEFE.vy = -JEFE.vy; JEFE.congelaT = 0.6; }

// tras morir: el cúter vuelve al borde de abajo
function reanuda() { colocaCursor(); JUEGO.tInicio = 0.5; }

function estrellasPor(pct) { return AJUSTES.estrellas.filter(e => pct >= e - 1e-6).length; }

function gana() {
  const J = JUEGO, id = idNivel(J.mundo, J.n), est = estrellasPor(J.pct), antes = SAVE.estrellas[id] || 0;
  const bonus = Math.round(J.tiempo * 5); J.puntos += bonus;
  const fichas = antes >= est ? 1 : AJUSTES.fichasEstrella[est - 1] + (antes ? -AJUSTES.fichasEstrella[antes - 1] : 0);
  SAVE.fichas += fichas; SAVE.estrellas[id] = Math.max(antes, est);
  SAVE.galeria[id] = Math.max(SAVE.galeria[id] || 0, est >= 3 ? 2 : 1);
  SAVE.record = Math.max(SAVE.record, J.puntos); SAVE.tutorial = 1; guarda();
  J.fin = { gana: true, est, fichas, bonus, nuevo: !antes }; J.modo = 'fin'; J.tFin = 0;
  SONIDO.gana(); confeti(TAB.x0 + TAB.w / 2, TAB.y0 + TAB.h / 2, 80, COL.oro);
}

function pierde(motivo) {
  JUEGO.fin = { gana: false, motivo }; JUEGO.modo = 'fin'; JUEGO.tFin = 0;
}

// seguir tras perder: +15 s, escudo y una vida más (cuesta fichas o un anuncio; la primera vez de cada nivel sale el anuncio)
const puedeSeguir = () => JUEGO.seguidos < 2;
function sigue() {
  const J = JUEGO;
  J.seguidos++; J.modo = 'juego'; J.tiempo = Math.max(J.tiempo, 0) + 15; J.escudo = true; J.vidasNivel = Math.max(1, J.vidasNivel); J.tInicio = 0.8;
  colocaCursor(); JEFE.congelaT = 1.5;
}

function alMenu(modo) { JUEGO.modo = modo; OPC.abierto = false; }
