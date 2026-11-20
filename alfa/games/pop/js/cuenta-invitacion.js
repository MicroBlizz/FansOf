// Fans of Pop · INVITAR A CREAR CUENTA (dominio; tarea #155): Pop se juega sin cuenta. Al ganar el nivel 5 Lola invita, con cariño, a guardar el
// progreso; si el jugador dice «más tarde» vuelve a invitar una sola vez en el nivel 10. La cuenta solo es obligatoria para comprar con dinero real.
// Funciones puras y datos congelados: sin reloj, azar, SAVE, red ni dibujo. La tabla está en PP_CFG.cuenta (js/ajustes.js).
// `e` es la situación: { activo: si el flag está abierto y la cuenta funciona, invitado: sin email ni Google, nivel: niveles ganados,
// visto: 0 aún no se invitó, 1 se invitó una vez, 2 ya se recordó }.
'use strict';
const PP_CUENTA = Object.freeze((() => {
  const natural = n => Number.isInteger(n) && n >= 0;
  const nivel = e => (natural(e && e.nivel) ? e.nivel : 0);
  const visto = e => (natural(e && e.visto) ? e.visto : 0);
  const sinCuenta = e => !!(e && e.activo && e.invitado);
  // qué invitación toca ahora: 'primera', 'recuerdo' o null (nada). Nunca a quien ya tiene cuenta
  function invita(cfg, e) {
    if (!sinCuenta(e)) return null;
    if (visto(e) === 0 && nivel(e) >= cfg.primera) return 'primera';
    if (visto(e) === 1 && nivel(e) >= cfg.recuerdo) return 'recuerdo';
    return null;
  }
  // cómo queda `visto` tras enseñar la invitación `motivo`: se enseña una sola vez cada una, diga lo que diga el jugador
  const trasVer = motivo => (motivo === 'primera' ? 1 : 2);
  // comprar con dinero real exige cuenta: a un invitado se le pide antes de nada
  const exigeParaComprar = sinCuenta;
  return { invita, trasVer, exigeParaComprar };
})());
if (typeof module !== 'undefined') module.exports = PP_CUENTA;
