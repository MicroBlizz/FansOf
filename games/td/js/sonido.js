// Fans of TD · Sonido de este juego: sus efectos, el silencio, los volúmenes y qué canción toca en cada momento.
// El altavoz, los efectos de los menús y el motor de música son comunes: core/js/sistema/sonido.js.
'use strict';
const sonidoApagado = () => !!SAVE.muted;
const volGeneral = () => (SAVE.muted ? 0 : SAVE.vol == null ? 1 : SAVE.vol);
const volMusica = () => 0.3 * (SAVE.mus == null ? 1 : SAVE.mus);
M.shepard = true;   // aquí las partidas son largas: la canción no vuelve a empezar, sigue subiendo de tono

// efectos de la partida: [nota inicial, nota final, duración, forma de onda, volumen]
const SFX_TD = { shot: [880, 660, 0.05, 'square', 0.03], hit: [300, 160, 0.07, 'square', 0.05], crit: [520, 900, 0.12, 'sawtooth', 0.06], lob: [300, 520, 0.12, 'triangle', 0.05], boom: [140, 40, 0.3, 'sawtooth', 0.09],
  stomp: [90, 40, 0.22, 'square', 0.08], pop: [600, 900, 0.06, 'triangle', 0.04], coin: [990, 1320, 0.12, 'square', 0.05], place: [220, 440, 0.12, 'triangle', 0.08], up: [440, 880, 0.25, 'triangle', 0.08],
  leak: [220, 110, 0.35, 'sawtooth', 0.09], horn: [196, 262, 0.45, 'sawtooth', 0.07], jump: [300, 1000, 0.3, 'triangle', 0.07], zap: [1200, 300, 0.12, 'sawtooth', 0.05], womp: [200, 80, 0.4, 'square', 0.08], boss: [110, 70, 0.8, 'sawtooth', 0.1], win: [523, 1046, 0.6, 'triangle', 0.1] };
function sfx(k) {
  if (!AC || sonidoApagado() || sfxSilent()) return;   // sfxSilent: en VS solo suena el campo que estás mirando
  const s = SFX_TD[k]; if (s) tone(s[0], s[1], s[2], s[3], s[4]);
}

// decide qué suena según lo que pasa en el juego
function musicUpdate() {
  if (!AC || !M.bus) return;
  const s = G.screen, L = G.level, lastWave = s === 'play' && !G.vs && L && G.wave >= G.waves && G.inWave;
  let want = SAVE.menuMus && TRACKS[SAVE.menuMus] ? SAVE.menuMus : 'menu';   // la del menú la eliges en Opciones
  if (s === 'play') want = G.over ? M.want : lastWave && L.boss ? (TRACKS['boss' + L.wi] ? 'boss' + L.wi : 'boss') : TRACKS[G.fac] ? G.fac : 'menu';   // tu raza; el jefe del mundo cuando sale
  else if (s === 'result') want = document.querySelector('#end-title').classList.contains('win') ? 'win' : 'lose';
  if (want !== M.want) { M.want = want; musicSet(want); }
  M.tmT = lastWave ? 1.18 : 1;                                // la última oleada va más rápida
  const duck = s === 'play' && G.paused;                      // en pausa suena apagada
  if (duck !== M.duck) { M.duck = duck; M.lp.frequency.setTargetAtTime(duck ? 600 : 18000, AC.currentTime, 0.08); }
}
setInterval(() => { try { musicUpdate(); } catch (e) { /* la música nunca debe parar el juego */ } }, 40);
