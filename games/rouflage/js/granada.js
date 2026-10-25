// Fans of Rouflage (prototipo) · LA GRANADA CEGADORA: una vez por partida, un colado a punto de ser pillado la lanza y desaparece 7 s para los becarios (los suyos lo ven como un
// fantasma) y deja a ciegas un rato a los que tiene cerca. Mientras dura no se le puede despedir. En el PvP, quien la lanza manda `iv` (los segundos que le quedan) en su estado y
// un aviso `gr` con el sitio para que cada navegador deje ciegos a SUS becarios cercanos (los de la máquina, el anfitrión).
'use strict';

const GRANADA = { dura: 7, radio: 230, ciego: 4.5 };
const invisible = e => e.invis > 0;      // no lo ven los becarios ni pueden despedirlo

function lanzaGranada(e) {
  if (!e || e.fuera || !(e.granada > 0) || (J.fase !== 'caza' && J.fase !== 'sala')) return false;      // (sala: la sala viva con amigos)
  e.granada = 0; e.invis = GRANADA.dura; e.trasHumo = !e.bot; e.salioDelHumo = false;      // al volver a pararse se camufla solo (ver autoCamuflaje)
  granadaEstalla(e.x, e.y, e);
  if (J.pvp) rfpManda({ t: 'gr', x: Math.round(e.x), y: Math.round(e.y) });
  misionEvento('granada', e);      // misiones y logros (misiones.js)
  return true;
}
// el fogonazo: a todos los becarios cercanos que lleva este navegador los deja a medio ver unos segundos
function granadaEstalla(x, y, e, colores = e && e.ropa && e.ropa.humo) {      // (colores: los del humo de su armario)
  fxGranada(x, y, GRANADA.dura, colores); fxTexto(x, y - 80, tr('¡FLASH!'), '#fff6ea', 22); play('humo');
  for (const h of J.cazadores) {
    if (h.fuera || lejos(h.x, h.y, x, y) > GRANADA.radio) continue;
    if (!J.pvp || h.jugador || (h.bot && RFP.soyHost)) h.ciego = Math.max(h.ciego, GRANADA.ciego);
  }
  if (e && e.jugador) avisa(tr('Granada cegadora: los becarios no te ven {n} s', { n: GRANADA.dura }), 'bueno');
}
function accionGranada() { const yo = J.yo; if ((J.fase === 'caza' || J.fase === 'sala') && jugando() && yo.clase === 'camaleon' && !TALLER.abierto) { if (!lanzaGranada(yo)) play('deny'); } }

// tras la bomba de humo, el colado que sale corriendo y vuelve a pararse no puede pintarse desde cero: el juego lo camufla al instante (REGLAS.humoMeta; de ahí, a afinar)
function autoCamuflaje(e) {
  e.trasHumo = false; pintaBot(e, 0.95); for (let n = 0; n < 3 && e.camo < REGLAS.humoMeta - 4; n++) afinaBot(e);
  for (let m = 0.8; m > 0.1 && e.camo > REGLAS.humoMeta; m -= 0.15) pintaBot(e, m);      // sin pasarse: si le sale demasiado bien, con la mano más suelta
  tapaHasta(e, REGLAS.humoMeta);
  e.pintado = true; avisa(tr('Te camuflas rápido: un {n} %', { n: e.camo }), 'aviso'); play('pop');
}

// red de seguridad: pase lo que pase al pararte (también en el PvP, donde el hielo puede llegar por otro camino), si saliste corriendo tras el humo y vuelves a estar quieto, te camufla
function humoPaso(e) {
  if (!e || !e.jugador || !e.trasHumo || e.fuera) return;
  if (!e.congelado) { e.salioDelHumo = true; return; }
  if (!e.salioDelHumo) return;
  e.salioDelHumo = false; autoCamuflaje(e); if (J.pvp) rfpMandaPiel(e);
}
