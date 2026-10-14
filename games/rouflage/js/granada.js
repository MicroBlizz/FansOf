// Fans of Rouflage (prototipo) · LA GRANADA CEGADORA: una vez por partida, un colado a punto de ser pillado la lanza y desaparece 15 s para los becarios (los suyos lo ven como un
// fantasma) y deja a ciegas un rato a los que tiene cerca. Mientras dura no se le puede despedir. En el PvP, quien la lanza manda `iv` (los segundos que le quedan) en su estado y
// un aviso `gr` con el sitio para que cada navegador deje ciegos a SUS becarios cercanos (los de la máquina, el anfitrión).
'use strict';

const GRANADA = { dura: 15, radio: 230, ciego: 4.5 };
const invisible = e => e.invis > 0;      // no lo ven los becarios ni pueden despedirlo

function lanzaGranada(e) {
  if (!e || e.fuera || !(e.granada > 0) || J.fase !== 'caza') return false;
  e.granada = 0; e.invis = GRANADA.dura;
  granadaEstalla(e.x, e.y, e);
  if (J.pvp) rfpManda({ t: 'gr', x: Math.round(e.x), y: Math.round(e.y) });
  return true;
}
// el fogonazo: a todos los becarios cercanos que lleva este navegador los deja a medio ver unos segundos
function granadaEstalla(x, y, e) {
  fxGranada(x, y, GRANADA.dura); fxTexto(x, y - 80, tr('¡FLASH!'), '#fff6ea', 22); play('luces'); play('disparo', 0.8);
  for (const h of J.cazadores) {
    if (h.fuera || lejos(h.x, h.y, x, y) > GRANADA.radio) continue;
    if (!J.pvp || h.jugador || (h.bot && RFP.soyHost)) h.ciego = Math.max(h.ciego, GRANADA.ciego);
  }
  if (e && e.jugador) avisa(tr('Granada cegadora: los becarios no te ven {n} s', { n: GRANADA.dura }), 'bueno');
}
function accionGranada() { const yo = J.yo; if (J.fase === 'caza' && jugando() && yo.clase === 'camaleon' && !TALLER.abierto) { if (!lanzaGranada(yo)) play('deny'); } }
