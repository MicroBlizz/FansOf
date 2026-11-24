// Fans of Pop · MODO NUEVO (reporte 47, tarea #350, Pepins 24-11-2026: «algo que te recuerde que has desbloqueado el modo difícil»).
// Al ganar al jefe se abre el Difícil de ese mundo (y al acabar el Difícil, su Pesadilla), pero ¡VAMOS! lleva al mundo siguiente y allí
// el selector ni sale: era fácil olvidarlo. Ahora, al volver al camino, Lola lo avisa una vez con un botón para ir, y el modo lleva la
// marca NUEVO en el selector (y un «!» en la flecha hacia ese mundo) hasta que lo abres. Un modo ya jugado cuenta como visto.
'use strict';
// dominio: el primer modo (k: 1 difícil, 2 pesadilla) abierto y sin ver, mundo a mundo; `abierto` y `visto` llegan de fuera
const PP_MODO_NUEVO = Object.freeze({
  clave: (m, k) => `${k}-${m}`,
  pendiente(mundos, abierto, visto) {
    for (let m = 0; m < mundos; m++) for (const k of [1, 2]) if (abierto(m, k) && !visto(m, k)) return { m, k };
    return null;
  },
});
const ppModoAbierto = (m, k) => (k === 2 ? ppPesAbierta(m) : ppDifAbierto(m));
const ppModoVisto = (m, k) => !!(SAVE.modosVistos || {})[PP_MODO_NUEVO.clave(m, k)] || ppVaPor(m, k) > 0;
const ppModoNuevo = (m, k) => ppModoAbierto(m, k) && !ppModoVisto(m, k);
// al ver un mundo en ese modo (ppMapaVer) deja de ser nuevo
function ppModoMarcaVisto(m, k) {
  if (!k || ppModoVisto(m, k)) return;
  SAVE.modosVistos = SAVE.modosVistos || {};
  SAVE.modosVistos[PP_MODO_NUEVO.clave(m, k)] = 1;
  ppGuarda();
}
// al llegar al camino: Lola avisa una sola vez de cada modo nuevo. Devuelve true si ha salido la ventana
function ppModoNuevoAlLlegar() {
  const avisados = SAVE.modosAvisados || {};
  const p = PP_MODO_NUEVO.pendiente(PP_MUNDOS.length, ppModoAbierto, (m, k) => ppModoVisto(m, k) || !!avisados[PP_MODO_NUEVO.clave(m, k)]);
  if (!p) return false;
  SAVE.modosAvisados = { ...avisados, [PP_MODO_NUEVO.clave(p.m, p.k)]: 1 };
  ppGuarda();
  ppVentanaModoNuevo(p);
  return true;
}
function ppVentanaModoNuevo({ m, k }) {
  const t = ppAbre(`<h2>${k === 2 ? tr('¡Pesadilla abierta!') : tr('¡Difícil abierto!')}</h2>`);
  t.appendChild(ppCompMini('lola', 110));
  const p = document.createElement('p');
  p.className = 'pp-sub';
  p.textContent = k === 2   // «de la Feria» / «del Jardín» (ppConArt, js/saltar-jefe-juego.js)
    ? ppConArt(m, 'Has abierto la Pesadilla de la {mundo}: el modo más duro, con fondo rojo.', 'Has abierto la Pesadilla del {mundo}: el modo más duro, con fondo rojo.')
    : ppConArt(m, 'Has abierto el modo difícil de la {mundo}: niveles de noche con el doble de monedas.', 'Has abierto el modo difícil del {mundo}: niveles de noche con el doble de monedas.');
  t.appendChild(p);
  t.appendChild(ppBoton(tr('¡A JUGAR!'), 'pp-btn', () => { ppCierra(); ppMapaVer(m, k); }));
  t.appendChild(ppBoton(tr('AHORA NO'), 'pp-btn2 pp-azul', ppCierra));
}
// ¿hay un modo nuevo en algún mundo antes (lado < 0) o después (lado > 0) de m? Para el «!» de las flechas del mapa
function ppModoNuevoHacia(m, lado) {
  for (let x = 0; x < PP_MUNDOS.length; x++) if ((lado < 0 ? x < m : x > m) && (ppModoNuevo(x, 1) || ppModoNuevo(x, 2))) return true;
  return false;
}
