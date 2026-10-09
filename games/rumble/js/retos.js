// Fans of Rumble · RETOS de este juego: sus misiones, sus logros y lo que enseña su perfil.
// El sistema (cómo se cuentan, se cobran y se pintan misiones, logros, pase de batalla, premio diario y perfil) es común
// y está en core/js/retos.js. Aquí solo van los datos. Para añadir una misión o un logro basta con escribirlo aquí.
'use strict';
const facLvl = f => [FACTIONS[f].leader, ...FACTIONS[f].units].reduce((a, k) => a + uSave(k).lvl, 0);
function gearN(f) { const k = FACTIONS[f].leader, E = SAVE.equip[f] || {}; let n = invGet(SAVE.abEquip[k]) ? 1 : 0; for (const sl in SLOTS) { const it = invGet(E[sl]); if (it && it.k === 'eq') n++; } return n; }
const worldStars = (wi, d) => WORLDS[wi].levels.reduce((a, l) => a + starsD(l.id, d), 0);
const allStars = d => WORLDS.reduce((a, w, wi) => a + worldStars(wi, d), 0);
const ownCount = k => new Set(SAVE.inv.filter(it => it.k === k).map(it => it.id)).size;
function campStars() {
  let got = 0, max = 0;
  for (const w of WORLDS) for (const l of w.levels) { max += 3; got += starsD(l.id, 'n'); }
  return [got, max];
}

const RETOS = {
  /* ---------- misiones diarias: cada día, la fija y 5 al azar de esta lista (v0.9.67) ----------
     tit: el título gracioso · txt: lo que hay que hacer · r: premio propio [oro, gemas, pase] */
  diariasN: 6,
  fijas: [{ id: 'dmeta5', tit: 'Empleado del día', txt: 'Completa 5 misiones diarias.', goal: 5, ev: 'dailydone', r: [150, 25, 40], alCobrar: 'meta5' }],
  diarias: [
  { id: 'win2', tit: 'Doble despido', txt: 'Gana 2 partidas.', goal: 2, ev: 'win' },
  { id: 'cards20', tit: 'Reparto de tareas', txt: 'Juega 20 cartas.', goal: 20, ev: 'card' },
  { id: 'kills40', tit: 'Recorte de plantilla', txt: 'Derrota a 40 enemigos.', goal: 40, ev: 'kill' },
  { id: 'towers3', tit: 'Reforma de oficinas', txt: 'Derriba 3 torres.', goal: 3, ev: 'tower' },
  { id: 'stars3', tit: 'Valoración positiva', txt: 'Consigue 3 estrellas en la campaña.', goal: 3, ev: 'star' },
  { id: 'boss1', tit: 'Reunión con el jefe', txt: 'Juega una partida del Modo Jefe.', goal: 1, ev: 'boss' },
  { id: 'pull1', tit: 'Una cápsula y lo dejo', txt: 'Gira una vez el gashapón.', goal: 1, ev: 'pull' },
  { id: 'lvl1', tit: 'Ascenso exprés', txt: 'Sube de nivel una unidad.', goal: 1, ev: 'lvlup' },
  { id: 'play3', tit: 'Jornada completa', txt: 'Juega 3 partidas.', goal: 3, ev: 'play' },
  { id: 'leader5', tit: 'El jefe baja al campo', txt: 'Saca a tu líder 5 veces.', goal: 5, ev: 'leader' },
  { id: 'flawless', tit: 'Ni un rasguño', txt: 'Gana sin perder ninguna torre.', goal: 1, ev: 'flawless' },
  { id: 'camp2', tit: 'Modo historia', txt: 'Juega 2 partidas de la campaña.', goal: 2, ev: 'camp' },
  { id: 'quick2', tit: 'Pausa para el café', txt: 'Juega 2 partidas rápidas.', goal: 2, ev: 'quick' },
  { id: 'caos120', tit: 'Presupuesto ejecutado', txt: 'Gasta 120 de CAOS.', goal: 120, ev: 'caos' },
  { id: 'base1', tit: 'Cierre de sede', txt: 'Tira una base enemiga.', goal: 1, ev: 'base' },
  { id: 'facwin', tit: 'Orgullo de facción', txt: 'Gana una partida con {F}.', goal: 1, ev: 'facwin' },
  { id: 'gift', tit: 'Lo único gratis', txt: 'Recoge el regalo diario de la tienda.', goal: 1, ev: 'gift' },
  { id: 'arena2', tit: 'Afterwork en la Arena', txt: 'Juega 2 partidas en la Arena.', goal: 2, ev: 'arena' },
  { id: 'arenawin1', tit: 'Clasificación trimestral', txt: 'Gana 1 partida en la Arena.', goal: 1, ev: 'arenawin', r: [120, 15, 30] },
  { id: 'camp5', tit: 'Maratón de historia', txt: 'Juega 5 partidas de la campaña.', goal: 5, ev: 'camp' },
  { id: 'kills100', tit: 'ERE masivo', txt: 'Derrota a 100 enemigos.', goal: 100, ev: 'kill' },
  { id: 'cards40', tit: 'Productividad de récord', txt: 'Juega 40 cartas.', goal: 40, ev: 'card' },
  { id: 'facwin2', tit: 'Doble orgullo', txt: 'Gana 2 partidas con {F}.', goal: 2, ev: 'facwin' },
  { id: 'caos200', tit: 'Barra libre de CAOS', txt: 'Gasta 200 de CAOS.', goal: 200, ev: 'caos' },
  { id: 'quick3', tit: 'Tres cafés', txt: 'Juega 3 partidas rápidas.', goal: 3, ev: 'quick' },
  ],
  /* ---------- misiones semanales: cada lunes, la fija y 5 al azar (v0.9.71). Pensadas para unos 5 días jugando bastante (~10 partidas al día) ---------- */
  semanalesN: 6,
  fijasSemana: [{ id: 'wmeta7', tit: 'Empleado del mes (en una semana)', txt: 'Sé Empleado del día 7 veces esta semana.', goal: 7, ev: 'meta5', r: [600, 80, 400] }],
  semanales: [
  { id: 'wwin', tit: 'Semana de resultados', txt: 'Gana 30 partidas.', goal: 30, ev: 'win' },
  { id: 'wkill', tit: 'Reestructuración total', txt: 'Derrota a 2.500 enemigos.', goal: 2500, ev: 'kill' },
  { id: 'wtower', tit: 'Demolición controlada', txt: 'Derriba 75 torres.', goal: 75, ev: 'tower' },
  { id: 'wstar', tit: 'Reseñas de cinco estrellas', txt: 'Consigue 40 estrellas en la campaña.', goal: 40, ev: 'star' },
  { id: 'wcard', tit: 'Montaña de papeleo', txt: 'Juega 1.300 cartas.', goal: 1300, ev: 'card' },
  { id: 'wboss', tit: 'Comité de dirección', txt: 'Juega 8 partidas del Modo Jefe.', goal: 8, ev: 'boss' },
  { id: 'wlvl', tit: 'Plan de carrera', txt: 'Sube 12 niveles de unidades.', goal: 12, ev: 'lvlup' },
  { id: 'wpull', tit: 'Adicción patrocinada', txt: 'Gira 30 veces el gashapón.', goal: 30, ev: 'pull' },
  { id: 'wdaily', tit: 'Trabajador incansable', txt: 'Completa 25 misiones diarias.', goal: 25, ev: 'dailydone' },
  { id: 'wflaw', tit: 'Auditoría limpia', txt: 'Gana 15 partidas sin perder torres.', goal: 15, ev: 'flawless' },
  { id: 'warena', tit: 'Liga de empresa', txt: 'Gana 12 partidas en la Arena.', goal: 12, ev: 'arenawin' },
  { id: 'wplay', tit: 'Fichaje completo', txt: 'Juega 50 partidas.', goal: 50, ev: 'play' },
  { id: 'wcaos', tit: 'Presupuesto anual', txt: 'Gasta 4.000 de CAOS.', goal: 4000, ev: 'caos' },
  { id: 'wbase', tit: 'Cierre de sedes', txt: 'Tira 20 bases enemigas.', goal: 20, ev: 'base' },
  { id: 'wleader', tit: 'El jefe no descansa', txt: 'Saca a tu líder 25 veces.', goal: 25, ev: 'leader' },
  { id: 'wcamp', tit: 'Temporada de historia', txt: 'Juega 25 partidas de la campaña.', goal: 25, ev: 'camp' },
  { id: 'wquick', tit: 'Pausas para el café', txt: 'Juega 20 partidas rápidas.', goal: 20, ev: 'quick' },
  { id: 'warena2', tit: 'Temporada de la Arena', txt: 'Juega 20 partidas en la Arena.', goal: 20, ev: 'arena' },
  ],
  noCuenta: () => G.mode === 'sandbox' && G.state !== 'title',          // la sala de pruebas no cuenta para logros ni misiones
  antesDeRevisar() { if (SAVE.achV !== 2) achInit(); },                 // las partidas guardadas de la 0.9.13 pasan al formato nuevo (js/11-logros.js)
  trasMisiones: L => adMissionOffer(L),                                 // cambiar una misión con anuncio
  trasSemanales: L => adMissionOffer(L, true),                          // también las semanales (menos la fija)
  trasNombre() { if (SAVE.tut.done) titlePopups(); else tutTick(); },   // la primera vez, después del nombre viene la partida guiada
};
