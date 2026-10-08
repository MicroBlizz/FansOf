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
  /* ---------- misiones diarias: cada día salen 5 al azar de esta lista + la fija de abajo (v0.9.67) ---------- */
  diariasN: 6,
  // la fija va siempre primero y da más. alCobrar: al cobrarla, cuenta como evento para las semanales
  fijas: [{ id: 'dmeta5', txt: 'Completa 5 misiones diarias', goal: 5, ev: 'dailydone', r: [150, 25, 40], alCobrar: 'meta5' }],
  diarias: [
  { id: 'win2', txt: 'Gana 2 partidas', goal: 2, ev: 'win' },
  { id: 'cards20', txt: 'Juega 20 cartas', goal: 20, ev: 'card' },
  { id: 'kills40', txt: 'Derrota a 40 enemigos', goal: 40, ev: 'kill' },
  { id: 'towers3', txt: 'Derriba 3 torres', goal: 3, ev: 'tower' },
  { id: 'stars3', txt: 'Consigue 3 estrellas en la campaña', goal: 3, ev: 'star' },
  { id: 'boss1', txt: 'Juega una partida del Modo Jefe', goal: 1, ev: 'boss' },
  { id: 'pull1', txt: 'Gira una vez el gashapón', goal: 1, ev: 'pull' },
  { id: 'lvl1', txt: 'Sube de nivel una unidad', goal: 1, ev: 'lvlup' },
  { id: 'play3', txt: 'Juega 3 partidas', goal: 3, ev: 'play' },
  { id: 'leader5', txt: 'Saca a tu líder 5 veces', goal: 5, ev: 'leader' },
  { id: 'flawless', txt: 'Gana sin perder ninguna torre', goal: 1, ev: 'flawless' },
  { id: 'camp2', txt: 'Juega 2 partidas de la campaña', goal: 2, ev: 'camp' },
  { id: 'quick2', txt: 'Juega 2 partidas rápidas', goal: 2, ev: 'quick' },
  { id: 'caos120', txt: 'Gasta 120 de CAOS', goal: 120, ev: 'caos' },
  { id: 'base1', txt: 'Tira una base enemiga', goal: 1, ev: 'base' },
  { id: 'facwin', txt: 'Gana una partida con {F}', goal: 1, ev: 'facwin' },
  { id: 'gift', txt: 'Recoge el regalo diario de la tienda', goal: 1, ev: 'gift' },
  { id: 'arena2', txt: 'Juega 2 partidas en la Arena', goal: 2, ev: 'arena' },
  { id: 'arenawin1', txt: 'Gana 1 partida en la Arena', goal: 1, ev: 'arenawin', r: [120, 15, 30] },
  { id: 'camp5', txt: 'Juega 5 partidas de la campaña', goal: 5, ev: 'camp' },
  { id: 'kills100', txt: 'Derrota a 100 enemigos', goal: 100, ev: 'kill' },
  { id: 'cards40', txt: 'Juega 40 cartas', goal: 40, ev: 'card' },
  { id: 'facwin2', txt: 'Gana 2 partidas con {F}', goal: 2, ev: 'facwin' },
  { id: 'caos200', txt: 'Gasta 200 de CAOS', goal: 200, ev: 'caos' },
  { id: 'quick3', txt: 'Juega 3 partidas rápidas', goal: 3, ev: 'quick' },
  ],
  /* ---------- misiones semanales: se renuevan cada lunes ---------- */
  semanales: [
  { id: 'wwin', txt: 'Gana 15 partidas', goal: 15, ev: 'win' },
  { id: 'wkill', txt: 'Derrota a 400 enemigos', goal: 400, ev: 'kill' },
  { id: 'wtower', txt: 'Derriba 20 torres', goal: 20, ev: 'tower' },
  { id: 'wstar', txt: 'Consigue 12 estrellas en la campaña', goal: 12, ev: 'star' },
  { id: 'wcard', txt: 'Juega 200 cartas', goal: 200, ev: 'card' },
  { id: 'wboss', txt: 'Juega 3 partidas del Modo Jefe', goal: 3, ev: 'boss' },
  { id: 'wlvl', txt: 'Sube 5 niveles de unidades', goal: 5, ev: 'lvlup' },
  { id: 'wpull', txt: 'Gira 5 veces el gashapón', goal: 5, ev: 'pull' },
  { id: 'wdaily', txt: 'Completa 12 misiones diarias', goal: 12, ev: 'dailydone' },
  { id: 'wflaw', txt: 'Gana 5 partidas sin perder torres', goal: 5, ev: 'flawless' },
  { id: 'wmeta7', txt: 'Completa 7 veces «Completa 5 misiones diarias»', goal: 7, ev: 'meta5' },
  { id: 'warena', txt: 'Gana 10 partidas en la Arena', goal: 10, ev: 'arenawin' },
  ],
  noCuenta: () => G.mode === 'sandbox' && G.state !== 'title',          // la sala de pruebas no cuenta para logros ni misiones
  antesDeRevisar() { if (SAVE.achV !== 2) achInit(); },                 // las partidas guardadas de la 0.9.13 pasan al formato nuevo (js/11-logros.js)
  trasMisiones: L => adMissionOffer(L),                                 // cambiar una misión con anuncio
  trasNombre() { if (SAVE.tut.done) titlePopups(); else tutTick(); },   // la primera vez, después del nombre viene la partida guiada
};
