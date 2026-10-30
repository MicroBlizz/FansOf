// Fans of Rouflage · EL TUTORIAL: jugando sin conexión (contra bots) salen, una sola vez cada uno, mensajes que enseñan las mecánicas en el momento en que
// sirven (también en el PvP, la primera vez), y al acabar se recomienda ganar con los dos bandos antes de entrar al PvP. Lo visto y las victorias se guardan en la partida (SAVE.tuto, SAVE.gana).
'use strict';

const TUTO_TEXTOS = {
  'cam-prep': ['Camaleón: toca PINTAR y copia los colores de lo que tienes detrás (o RÁPIDA, que te pinta como un bot y luego retocas). Cuanto más cerca del 100 %, menos te ven. Luego CONGÉLATE.', 9],
  'cam-senuelo': ['SEÑUELO: pinta garabatos en el suelo, lejos de ti, para que los becarios pierdan el tiempo mirándolos. Gasta tinta.', 8],
  'cam-caza': ['Quieto y callado. Cada cierto tiempo silbas sin querer. Si te ven, corre (el aguante dura unos segundos: parado se recupera) o lanza la granada de humo (una sola vez).', 10],
  'cam-grieta': ['La pintura se seca y se estropea: tu camuflaje baja poco a poco. Si te vas quedando corto, muévete y retoca (con cuidado).', 8],
  'mapa-turbo': ['El coche del jefe sopla aire cada rato: cuando le parpadeen los faros, apártate de los escapes y de las rejillas de los lados. Si estás congelado, no te mueve.', 9],
  'caz-prep': ['Cazador: solo ves lo que alumbra tu linterna. Practica con los camaleones de prácticas antes de que empiece la caza.', 9],
  'fantasma-col': ['Eres un fantasma: no te ven, pero puedes ayudar a los tuyos con el botón de abajo a la derecha. Cada vez que lo usas, cambia a otro poder.', 10],
  'fantasma-bec': ['Eres un fantasma: ayuda a tus compañeros becarios con el botón de abajo a la derecha. Cada vez que lo usas, cambia a otro poder.', 10],
  'caz-caza': ['Toca donde creas que hay un colado: acertar te devuelve la carta, fallar la gasta. Fíjate en las ondas de los silbidos.', 9],
};

function tutoDi(clave) {
  if (!TUTO_TEXTOS[clave]) return;      // también en el PvP: quien entra directo sin jugar contra bots aprende igual
  SAVE.tuto = SAVE.tuto || {}; if (SAVE.tuto[clave]) return;
  SAVE.tuto[clave] = 1; guardaPartida();
  const [texto, seg] = TUTO_TEXTOS[clave]; pista(tr(texto), seg);
}
// al cambiar de fase (la llama cambiaFase)
function tutoFase(f) {
  if (J.pvp || !J.yo) return;
  if (f === 'prep') bocadilloEmpieza();      // la primera vez con cada papel, los bocadillos (bocadillos.js) enseñan los botones uno a uno
}
// el PvP con desconocidos (BUSCAR PARTIDA) se desbloquea al JUGAR una partida contra bots con cada bando: no hace falta ganarla. Cuenta también
// quien ya ganó alguna o acabó los bocadillos de ese papel (los que jugaban antes de este cambio). Las salas con amigos y contra bots, siempre abiertas
const tutoJugado = m => !!((SAVE.jugado && SAVE.jugado[m]) || (SAVE.gana && SAVE.gana[m]) || (SAVE.tuto && SAVE.tuto[m === 'cazador' ? 'bcaz' : 'bcam']));
const tutoFaltan = () => ['camaleon', 'cazador'].filter(m => !tutoJugado(m));
const tutoRol = m => m === 'camaleon' ? tr('camaleón') : tr('cazador');
const tutoBoton = m => m === 'camaleon' ? tr('CAMALEÓN') : tr('CAZADOR');      // como se llaman los botones grandes de la pantalla de inicio
// al acabar una partida sin conexión: apunta que has jugado ese papel (y si ganaste) y devuelve la frase de consejo (o '')
function tutoFin(victoria) {
  if (J.pvp) return '';
  const antes = tutoFaltan().length;
  SAVE.jugado = SAVE.jugado || {}; SAVE.jugado[J.modo] = 1;
  if (victoria) { SAVE.gana = SAVE.gana || {}; SAVE.gana[J.modo] = 1; }
  guardaPartida();
  const f = tutoFaltan();
  return f.length ? tr('Juega también una partida de {rol} para desbloquear BUSCAR PARTIDA en el PvP.', { rol: tutoBoton(f[0]) }) : antes ? tr('¡PvP desbloqueado! Ya puedes BUSCAR PARTIDA.') : '';
}
// el consejo del menú del PvP
function tutoConsejoPvp() {
  const p = E('pvp-consejo'), f = tutoFaltan(); if (!p) return;
  p.hidden = !f.length;
  const b = E('b-pvp-buscar'), cerrado = f.length > 0 && !rfpSalaGuardada();      // si te dejaste una partida a medias, volver a ella siempre se puede
  if (b) { b.disabled = cerrado; b.classList.toggle('bloqueado', cerrado); }
  if (f.length) p.textContent = tr('Para desbloquear BUSCAR PARTIDA, juega en la pantalla de inicio una partida de {roles}.', { roles: f.map(tutoBoton).join(' ' + tr('y otra de') + ' ') });      // las del botón JUGAR CONTRA BOTS de aquí no cuentan: son salas en línea
}
