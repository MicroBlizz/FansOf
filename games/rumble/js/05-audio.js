// Fans of Rumble · Sonido de este juego: el silencio, los volúmenes y qué canción toca en cada momento.
// El altavoz, los efectos y el motor de música son comunes: core/js/sistema/sonido.js.
'use strict';
let muted = false;
try { muted = localStorage.getItem('for-muted') === '1'; } catch (e) { /* storage blocked */ }
const musVol = () => (SAVE.mus == null ? 70 : SAVE.mus) / 100;
const sonidoApagado = () => muted;
const volGeneral = () => (muted ? 0 : 0.55 * ((SAVE.vol == null ? 100 : SAVE.vol) / 100));
const volMusica = () => 0.7 * musVol();
// decide qué suena según lo que pasa en el juego (se llama en cada frame; es barato)
function musicUpdate() {
  if (!AC || !M.bus) return;
  const st = G.state, boss = G.mode === 'boss' || (G.mode === 'camp' && G.level && G.level.boss);
  let want;
  if (st === 'title') want = SAVE.menuMus && TRACKS[SAVE.menuMus] ? SAVE.menuMus : 'menu';   // v0.9.22: la elige el jugador en Opciones
  else if (st === 'play' || st === 'paused') { want = !boss ? G.faction : G.mode === 'boss' ? 'boss' + (G.bossWi == null ? CEO_WI : G.bossWi) : 'boss' + G.level.wi; if (!TRACKS[want]) want = boss ? 'boss' : 'menu'; }
  else if (st === 'end') want = G.winner === 'p' ? 'win' : G.winner === 'e' ? 'lose' : 'menu';
  else want = null;                                  // cuenta atrás y final de la partida: silencio
  if (want !== M.want) { M.want = want; musicSet(want); }
  M.tmT = st === 'play' && (G.double || (boss && S.e.phase2)) ? 1.18 : 1;   // último minuto o fase 2 del jefe: más rápido
  const duck = st === 'paused';
  if (duck !== M.duck) { M.duck = duck; M.lp.frequency.setTargetAtTime(duck ? 600 : 18000, AC.currentTime, 0.08); }
}

