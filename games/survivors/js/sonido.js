// Fans of Survivors · Sonido de este juego: el silencio, los volúmenes y qué canción toca en cada momento.
// El altavoz, los efectos y el motor de música son comunes: core/js/sistema/sonido.js. Las canciones, core/js/serie/canciones.js.
'use strict';
const sonidoApagado = () => !!SAVE.muted;
const volGeneral = () => (SAVE.muted ? 0 : SAVE.vol == null ? 1 : SAVE.vol);
const volMusica = () => 0.3 * (SAVE.mus == null ? 1 : SAVE.mus);
// en el menú, la que elijas en Opciones; jugando, la de Animales Locos (más rápida en el último minuto); con el jefe, la suya
function musicUpdate() {
  if (!AC || !M.bus) return;
  let want = SAVE.menuMus && TRACKS[SAVE.menuMus] ? SAVE.menuMus : 'menu';
  if (P && P.estado === 'fin') want = M.want;   // suenan la de ganar o perder
  else if (P && enPartida()) want = P.jefe ? 'boss0' : 'animales';
  if (want !== M.want) { M.want = want; musicSet(want); }
  M.tmT = P && P.cofreTempo ? P.cofreTempo : P && enPartida() && !P.jefe && P.t > SV.duracion - 60 ? 1.12 : 1;   // en el cofre la música se acelera con el suspense
  const duck = !!(P && enPartida() && P.estado !== 'jugando' && P.estado !== 'fin' && P.estado !== 'cofre');   // en pausa y al subir de nivel suena apagada (con el cofre, no)
  if (duck !== M.duck) { M.duck = duck; M.lp.frequency.setTargetAtTime(duck ? 700 : 18000, AC.currentTime, 0.08); }
}
setInterval(() => { try { musicUpdate(); } catch (e) { /* la música nunca debe parar el juego */ } }, 40);
