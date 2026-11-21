// Fans of Pop · INVITAR A CREAR CUENTA en el juego (composición; tarea #155): junta las reglas (js/cuenta-invitacion.js) con la partida, Lola y la
// ventana de cuenta de core (window.pedirCuenta). Todo va tras el flag 'cuenta-en-pop' (abierto solo en la alfa).
// · ppCuentaAlEstrenar(): al llegar al camino tras un estreno de Lola, espera a que Lola acabe y, si toca, enseña la invitación.
// · ppCuentaAlLlegar(): al llegar al camino sin estreno, enseña la invitación si toca.
// · hook 'compra-exige-cuenta' (core, MONEDAS.compraReal): un invitado no compra hasta tener cuenta. Al volver de Google o del email se retoma.
'use strict';
const ppCuentaActiva = () => NUCLEO.flag('cuenta-en-pop', 'Pop: invitar a crear cuenta en el nivel 5 y pedirla para comprar (tarea #155)', false);
// la situación para las reglas
function ppCuenta() {
  const hay = typeof CUENTA !== 'undefined';
  return { activo: ppCuentaActiva() && hay && !!CUENTA.activa, invitado: hay && !!CUENTA.invitado, nivel: ppPrimeros().nivel, visto: SAVE.cuentaInv || 0 };
}
const PP_CUENTA_TEXTO = {
  primera: '¡Ya llevas 5 niveles! Guarda tu progreso con una cuenta y no perderás nada si cambias de móvil.',
  recuerdo: '¡Ya vas por el nivel 10! Con una cuenta, todo lo que has ganado está a salvo. ¿La creamos?',
};
// guardar el progreso: la ventana de cuenta de core (Google o email); al volver con la cuenta lista, un aviso
function ppCuentaGuardar() {
  ppCierra();
  if (typeof window.pedirCuenta === 'function') window.pedirCuenta('Con una cuenta guardas tu progreso y juegas en otros aparatos.', 'pop-cuenta', { titulo: 'GUARDA TU PROGRESO', cancelar: 'MÁS TARDE' });
}
// la invitación: Lola con su globo y dos botones. Se enseña una sola vez cada una (se apunta al abrirla)
function ppCuentaVentana(motivo) {
  SAVE.cuentaInv = PP_CUENTA.trasVer(motivo); ppGuarda();
  const t = ppAbre(`<h2>${tr('¡Guarda tu progreso!')}</h2>`);
  const cara = document.createElement('div'); cara.style.cssText = 'display:flex;justify-content:center'; cara.appendChild(ppMiniatura('sl-lola', 92)); t.appendChild(cara);
  const p = document.createElement('p'); p.textContent = tr(PP_CUENTA_TEXTO[motivo]); t.appendChild(p);
  t.appendChild(ppBoton(tr('GUARDAR MI PROGRESO'), 'pp-btn', ppCuentaGuardar));
  t.appendChild(ppBoton(tr('MÁS TARDE'), 'pp-btn2', ppCierra));
}
// al llegar al camino: si toca, la invitación. Devuelve true si ha salido (y no debe salir otra ventana)
function ppCuentaAlLlegar() {
  const motivo = PP_CUENTA.invita(PP_CFG.cuenta, ppCuenta());
  if (!motivo || PP_PANT.actual !== 'mapa' || !$pp('#pp-modal').hidden || PP_LOLA.actual) return false;
  ppCuentaVentana(motivo);
  return true;
}
// tras un estreno de Lola (que se lleva la llegada al camino): espera a que Lola acabe y a que el regalito llegue, y entonces la invitación
let ppCuentaMirando = false;   // un solo vigilante a la vez
function ppCuentaAlEstrenar() {
  if (ppCuentaMirando || !PP_CUENTA.invita(PP_CFG.cuenta, ppCuenta())) return;
  ppCuentaMirando = true;
  const mira = setInterval(() => {
    if (PP_PANT.actual !== 'mapa') { clearInterval(mira); ppCuentaMirando = false; return; }   // se fue del camino: saldrá la próxima vez
    if (PP_LOLA.actual || PP_LOLA.cola.length) return;
    clearInterval(mira); ppCuentaMirando = false;
    setTimeout(() => ppCuentaAlLlegar(), 1800);
  }, 300);
}
// comprar con dinero real sin cuenta: core pide cuenta antes de nada (devuelve el motivo; vacío = no exige)
hook('compra-exige-cuenta', () => (PP_CUENTA.exigeParaComprar(ppCuenta()) ? 'Para comprar necesitas una cuenta. Así lo que compres es tuyo para siempre, aunque cambies de móvil. Tardas un minuto y no pierdes tu partida.' : ''));
// al volver con la cuenta lista (el enlace del email o Google recargan la página)
hook('cuenta-vuelta', d => {
  if (d === 'pop-cuenta') toast(tr('¡Cuenta lista! Tu progreso está a salvo.'), true);
  if (d === 'compra') setTimeout(() => { toast(tr('¡Cuenta lista! Ya puedes comprar.'), true); if (typeof ppTienda === 'function') ppTienda(null, 'perlas'); }, 1500);   /* con Pop ya pintado */
});
