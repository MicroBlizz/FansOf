// Fans of Jump · La ayuda invisible: si caes pronto (antes de AYUDA_CORTA m) varias partidas seguidas, el principio de la
// siguiente es un poco más amable (troncos algo más grandes y juntos, y el borde perdona más). Se va quitando cuando vuelves
// a llegar lejos. Solo afecta a los primeros AYUDA_HASTA (wy) y nunca al reto del día (el mismo río para todos).
// Va tras el interruptor 'jump-ayuda' (apagado en la web hasta que Daniel diga sí).
'use strict';

const AYUDA_CORTA = 150, AYUDA_LEJOS = 250, AYUDA_HASTA = 5000, AYUDA_MAX = 0.35;
const ayudaActiva = () => typeof NUCLEO !== 'undefined' && NUCLEO.flag('jump-ayuda', 'Fans of Jump: ayuda invisible (si caes pronto varias veces seguidas, el principio de la siguiente partida es más fácil)', false);
// cuánto ayuda a esa altura: 0 (nada) … AYUDA_MAX, y se apaga poco a poco hasta AYUDA_HASTA
function ayudaEn(wy) {
  if (!GUARDA.ayuda || wy >= AYUDA_HASTA || (typeof RETO !== 'undefined' && RETO.activo) || !ayudaActiva()) return 0;
  return GUARDA.ayuda * AYUDA_MAX * (1 - wy / AYUDA_HASTA);
}
// al acabar una partida (partida.js): sube si caíste pronto, baja si llegaste lejos
function apuntaAyuda(metros) {
  if (typeof RETO !== 'undefined' && RETO.activo) return;
  const a = GUARDA.ayuda || 0;
  if (metros < AYUDA_CORTA) GUARDA.ayuda = Math.min(1, a + 0.34);
  else if (metros >= AYUDA_LEJOS) GUARDA.ayuda = Math.max(0, a - 0.5);
}
