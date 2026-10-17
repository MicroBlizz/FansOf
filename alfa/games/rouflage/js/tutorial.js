// Fans of Rouflage · EL TUTORIAL: jugando sin conexión (contra bots) salen, una sola vez cada uno, mensajes que enseñan las mecánicas en el momento en que
// sirven, y al acabar se recomienda ganar con los dos bandos antes de entrar al PvP. Lo visto y las victorias se guardan en la partida (SAVE.tuto, SAVE.gana).
'use strict';

const TUTO_TEXTOS = {
  'cam-prep': ['Camaleón: toca PINTAR y copia los colores de lo que tienes detrás (o RÁPIDA, que te pinta como un bot y luego retocas). Cuanto más cerca del 100 %, menos te ven. Luego CONGÉLATE.', 9],
  'cam-senuelo': ['SEÑUELO: pinta garabatos en el suelo, lejos de ti, para que los becarios pierdan el tiempo mirándolos. Gasta tinta.', 8],
  'cam-caza': ['Quieto y callado. Cada cierto tiempo silbas sin querer. Si te ven, corre (el aguante dura unos segundos: parado se recupera) o lanza la granada de humo (una sola vez).', 10],
  'cam-grieta': ['La pintura se seca y se estropea: tu camuflaje baja poco a poco. Si te vas quedando corto, muévete y retoca (con cuidado).', 8],
  'caz-prep': ['Cazador: solo ves lo que alumbra tu linterna. Practica con los camaleones de prácticas antes de que empiece la caza.', 9],
  'caz-caza': ['Toca donde creas que hay un colado: acertar te devuelve la carta, fallar la gasta. Fíjate en las ondas de los silbidos.', 9],
};

function tutoDi(clave) {
  if (J.pvp || !TUTO_TEXTOS[clave]) return;
  SAVE.tuto = SAVE.tuto || {}; if (SAVE.tuto[clave]) return;
  SAVE.tuto[clave] = 1; guardaPartida();
  const [texto, seg] = TUTO_TEXTOS[clave]; pista(tr(texto), seg);
}
// al cambiar de fase (la llama cambiaFase)
function tutoFase(f) {
  if (J.pvp || !J.yo) return;
  if (f === 'prep') bocadilloEmpieza();      // la primera vez con cada papel, los bocadillos (bocadillos.js) enseñan los botones uno a uno
}
const tutoFaltan = () => ['camaleon', 'cazador'].filter(m => !(SAVE.gana && SAVE.gana[m]));
const tutoRol = m => m === 'camaleon' ? tr('camaleón') : tr('cazador');
// al acabar una partida sin conexión: apunta la victoria y devuelve la frase de consejo (o '')
function tutoFin(victoria) {
  if (J.pvp) return '';
  if (victoria) { SAVE.gana = SAVE.gana || {}; SAVE.gana[J.modo] = 1; guardaPartida(); }
  const f = tutoFaltan();
  return !f.length ? (victoria ? tr('Ya has ganado con los dos bandos: estás listo para el PvP.') : '') : victoria ? tr('Ahora gana también como {rol} antes de entrar al PvP.', { rol: tutoRol(f[0]) }) : tr('Gana contra los bots con los dos bandos antes de entrar al PvP.');
}
// el consejo del menú del PvP
function tutoConsejoPvp() {
  const p = E('pvp-consejo'), f = tutoFaltan(); if (!p) return;
  p.hidden = !f.length;
  if (f.length) p.textContent = tr('Antes del PvP, gana una partida contra bots como {roles}.', { roles: f.map(tutoRol).join(' ' + tr('y') + ' ') });
}
