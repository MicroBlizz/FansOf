// Fans of Snakes · Modos de juego: Infinito (el de siempre), Mundos (fases con objetivo, js/mundos.js), Reto diario (el mismo
// tablero y la misma suerte para todos hoy, js/reto.js) y VS contra un rival (js/vs.js). Aquí se empieza cada partida, se mira
// si se ha cumplido el objetivo de la fase y se reparte lo ganado al acabar. Revivir (una vez por partida) también está aquí.
'use strict';

const PARTIDA = { tipo: 'infinito', mundo: 0, fase: 0, revivido: false };
const COSTE_REVIVIR = 50;

function empieza(tipo, m = 0, f = 0) {
  Object.assign(PARTIDA, { tipo, mundo: m, fase: f, revivido: false });
  siembra(tipo === 'reto' ? 'fans-of-snakes-' + hoy() : null);
  TEMA = tipo === 'mundo' ? MUNDOS[m].tema : TEMA_BASE;
  nuevaPartida();
  const J = JUEGO;
  if (tipo === 'mundo') ponDibujo(MUNDOS[m].fases[f].muros);
  if (tipo === 'reto') { ESTIRA = true; murosAlAzar(5 + azarEntero(4)); ESTIRA = false; }
  J.manzanas = []; const p = casillaLibre(); if (p) J.manzanas.push(p);   // con los muros ya puestos
  if (tipo === 'vs') empiezaVS();
  if (tipo === 'reto') mision('reto', 1);
  empiezaTutorial();
}
const otraVez = () => empieza(PARTIDA.tipo, PARTIDA.mundo, PARTIDA.fase);
function alMenu(pantalla = 'menu') { siembra(null); TEMA = TEMA_BASE; JUEGO.modo = pantalla; JUEGO.muros = new Set(); LOCURA.t = 0; LOCURA.tipo = null; }

// cada paso: ¿se ha cumplido el objetivo de la fase?
function compruebaObjetivo() {
  if (PARTIDA.tipo !== 'mundo' || JUEGO.modo !== 'juego') return;
  const F = MUNDOS[PARTIDA.mundo].fases[PARTIDA.fase], O = OBJETIVOS[F.obj[0]];
  if (O.valor(JUEGO) >= F.obj[1]) acaba(true);
}
const progresoObjetivo = () => { const F = MUNDOS[PARTIDA.mundo].fases[PARTIDA.fase]; return Math.min(1, OBJETIVOS[F.obj[0]].valor(JUEGO) / F.obj[1]); };

// el final de una partida: gana = fase superada o VS ganado; motivo = 'pared' | 'cola' | 'muro' | 'vs' si se pierde
function acaba(gana, motivo = '') {
  const J = JUEGO; J.modo = 'fin'; J.tFin = 0; J.frenesiT = 0; J.mult = 1;
  const record = PARTIDA.tipo === 'infinito' && J.puntos > SAVE.record;
  J.fin = { gana, motivo, record, estrellas: 0, premio: 0, nueva: false };
  if (record) { SAVE.record = J.puntos; subeMarca(J.puntos, J.comidas, J.tVivo); }
  // las monedas cortadas se cobran (si revive, solo las nuevas)
  SAVE.monedas += J.monedasPartida - (J.monedasCobradas || 0); J.monedasCobradas = J.monedasPartida;
  if (!PARTIDA.revivido) SAVE.partidas++;
  if (PARTIDA.tipo === 'mundo' && gana) {
    const F = MUNDOS[PARTIDA.mundo].fases[PARTIDA.fase], id = idFase(PARTIDA.mundo, PARTIDA.fase), antes = SAVE.fases[id] || 0;
    J.fin.estrellas = J.tVivo <= F.t3 ? 3 : J.tVivo <= F.t2 ? 2 : 1;
    if (!antes) { J.fin.premio = F.premio; SAVE.monedas += F.premio; mision('fase', 1); }
    J.fin.nueva = J.fin.estrellas > antes;
    SAVE.fases[id] = Math.max(antes, J.fin.estrellas);
  }
  if (PARTIDA.tipo === 'reto') guardaReto(J.puntos, J.comidas, J.tVivo);
  if (PARTIDA.tipo === 'vs') acabaVS(gana);
  terminaTutorial();
  guarda();
  const h = J.serp[0];
  if (gana) { chispa(cx(h[0]), cy(h[1]), '#ffd54a', 30, 120); SONIDO.elige(); }
  else { chispa(cx(h[0]), cy(h[1]), '#ff4d4d', 18, 90); tiembla(4, 0.4); SONIDO.muere(); }
}

// revivir: una vez por partida (no en el Reto ni en el VS), con un anuncio (solo en la alfa y en desarrollo) o con monedas.
// La serpiente sigue donde estaba (el choque no llegó a moverla), mirando hacia un lado libre, y con un Escudo de regalo.
const puedeRevivir = () => !PARTIDA.revivido && (PARTIDA.tipo === 'infinito' || PARTIDA.tipo === 'mundo') && !JUEGO.fin.gana;
function revive(conMonedas) {
  if (!puedeRevivir()) return;
  if (conMonedas) { if (SAVE.monedas < COSTE_REVIVIR) return; SAVE.monedas -= COSTE_REVIVIR; guarda(); }
  const J = JUEGO, h = J.serp[0];
  PARTIDA.revivido = true;
  const libre = n => n[0] >= 0 && n[0] < COLS && n[1] >= 0 && n[1] < ROWS && !esMuro(n) && !J.serp.some(s => mismaCasilla(s, n));
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(d => libre([h[0] + d[0], h[1] + d[1]]));
  if (dirs.length) J.dir = dirs[0];
  J.cartas.escudo = nivel('escudo') + 1;
  J.modo = 'juego'; J.pend = []; J.acum = -1.2;   // un segundo para situarse
  chispa(cx(h[0]), cy(h[1]), '#3ddc84', 24, 100); numero(cx(h[0]), cy(h[1]) - 10, tr('¡SIGUES!'), '#3ddc84', 12);
  SONIDO.escudo();
}
