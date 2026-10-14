// Fans of Rumble · Partida rápida «CEO» (v0.9.71): la tercera dificultad de la partida rápida.
// · La CPU juega 2 niveles por encima de tu nivel medio (hasta 12), piensa más rápido, gana más CAOS y saca a su mata-sanadores.
// · Antes de CADA partida gira la ruleta de Microblizz: un castigo para ti y una ventaja para la CPU (las listas de la Mítica, en 10b-ruleta.js).
// · Premio si ganas: ECON.quick.ceo de oro y ECON.quickCeoGems gemas (ajustes.js).
'use strict';
const CEO_Q = { lvlAdd: 2, maxLvl: 12 };
let ceoListo = false;   // true justo después de girar la ruleta: la partida que empieza ya tiene su castigo y su ventaja

// la ruleta de esta partida: castigo y ventaja al azar, y se enseña girando (mismas pantallas que la de la Mítica)
function ceoRuleta(alAcabar) {
  G.ceoMods = { deb: pick(MYTH_DEB), buf: pick(MYTH_BUF) };
  RL.d = 'q'; RL.wk = G.ceoMods; RL.phase = 'p'; RL.ang = 0; RL.spin = null; RL.alAcabar = alAcabar;
  rlPhaseUi(false); $('#scr-roulette').hidden = false; drawRoulette();
}

// la llama setupMatch en la partida rápida CEO: nivel, IA y lo que ha salido en la ruleta (los mismos efectos que la Mítica)
function setupCeoQuick() {
  G.elvl = Math.min(CEO_Q.maxLvl, avgLevel(G.faction) + CEO_Q.lvlAdd);
  G.diffCfg = Object.assign({}, CFG.diff.ceo, { despido: 24 + G.elvl * 3 });
  const M = G.mod = G.ceoMods || { deb: pick(MYTH_DEB), buf: pick(MYTH_BUF) };
  if (M.deb.id === 'recorte') G.pInc = 0.7;
  if (M.deb.id === 'carga') G.pDeployAdd = 1.5;
  if (M.deb.id === 'vacaciones') G.pRespawnM = 2;
  if (M.buf.id === 'inversion') G.diffCfg.aiIncome *= 1.3;
  if (M.buf.id === 'despidos') G.eKillChaos = 1;
}

// el texto de la partida rápida (cambia con la dificultad elegida)
function quickInfo() {
  const Q = ECON.quick, ceo = G.diff === 'ceo';
  $('#prep-info').innerHTML = `Contra Microblizz. Tus cartas juegan con su nivel y Microblizz se pone a tu nivel medio.<br><span class="rw">Recompensa: ${Q.easy} de oro en Becario, ${Q.normal} en Ejecutivo o ${Q.ceo} de oro y ${ECON.quickCeoGems} gemas en CEO si ganas (${Q.lose} si pierdes), y experiencia para tus cartas.</span>`
    + (ceo ? `<div class="ceo-box"><b class="ol">MODO CEO</b><span>La CPU juega ${CEO_Q.lvlAdd} niveles por encima de tu media y antes de cada partida gira la ruleta de Microblizz: un castigo para ti y una ventaja para la CPU.</span></div>` : '');
}
