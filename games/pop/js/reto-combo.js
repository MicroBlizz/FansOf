// Fans of Pop · el COMBO y las FASES del reto del día en la partida (tarea 395, ADR 231; reglas en js/reto-combo-reglas.js). Todo en PP_RETO_COMBO:
// · nuevo(): lo de una partida del reto (va en M.reto): el combo (x1), si ya dudaste en esta ronda y cuántas rondas se han contado.
// · duda(M): cada fotograma de tu turno (js/memoria.js): si te paras más de la cuenta, el combo vuelve a x1 al momento.
// · cuenta(M, rondas): al superar una ronda, sus monedas con el combo que llevas y el combo de la siguiente; avisa al empezar una fase.
//   Cuenta cada ronda una sola vez (al fallar, js/reto-dia.js vuelve a mirar la última).
// · pinta(c, M): arriba, la chapa del combo (x1 a x3) y la barrita que se vacía mientras dudas, con la fase en la que estás (a la derecha del título).
'use strict';
const PP_RETO_COMBO = (() => {
  const C = () => PP_CFG.reto;
  const COLOR = ['#ffb43a', '#ff8a1f', '#ff4d2e'];   // la chapa: naranja claro (x1), naranja (x2) y rojo fuego (x3)
  const nuevo = () => ({ combo: 1, dudo: false, hechas: 0, puntos: 0 });

  function duda(M) {
    const R = M.reto;
    if (R.dudo || !PP_COMBO_R.dudo(M.espera, C())) return;
    R.dudo = true;
    if (R.combo > 1) { R.combo = 1; ppFlota(tr('Combo perdido'), 270, ppGeom(M.T.n).y - 30, '#ffb43a'); }
  }
  function cuenta(M, rondas) {
    const R = M.reto;
    if (rondas <= R.hechas) return;
    R.puntos += PP_COMBO_R.paga(R.combo, C());
    R.combo = PP_COMBO_R.sigue(R.combo, C(), R.dudo);
    R.dudo = false; R.hechas = rondas;
    // en el centro del tablero: arriba de él ya sale «¡El tablero crece!», que suele tocar en la misma ronda (con su sonido)
    if (PP_COMBO_R.empiezaFase(rondas, C())) { const g = ppGeom(M.T.n); ppFlota(tr('¡Fase {n}!', { n: PP_COMBO_R.fase(rondas, C()) }), 270, g.y + g.lado / 2, '#ffd64a'); }
  }
  // la barrita: llena fuera de tu turno; en tu turno se vacía mientras dudas (vacía si ya dudaste en esta ronda)
  const llena = M => (M.fase !== 'toca' ? 1 : M.reto.dudo ? 0 : PP_COMBO_R.barra(M.espera, C()));
  function pinta(c, M) {
    const R = M.reto, k = PP_COMBO_R.normal(R.combo, C()) - 1, b = llena(M);
    c.save();
    // todo dentro del panel de arriba (hasta y 188): el tablero empieza justo debajo en las pantallas bajas
    c.fillStyle = COLOR[Math.min(k, COLOR.length - 1)]; c.beginPath(); c.roundRect(238, 140, 64, 30, 15); c.fill();
    c.lineWidth = 3; c.strokeStyle = '#7a2a00'; c.stroke();
    ppTexto(c, 'x' + (k + 1), 270, 155, 24, '#fff', 'center', '#7a2a00');
    c.fillStyle = 'rgba(40,20,60,0.45)'; c.beginPath(); c.roundRect(214, 174, 112, 10, 5); c.fill();
    if (b > 0) { c.fillStyle = '#ffd64a'; c.beginPath(); c.roundRect(214, 174, Math.max(10, 112 * b), 10, 5); c.fill(); }
    ppTexto(c, tr('Fase {n}', { n: PP_COMBO_R.fase(R.hechas, C()) }), 462, 118, 22, '#ffd64a', 'center', '#c43a84');
    c.restore();
  }
  return Object.freeze({ nuevo, duda, cuenta, pinta });
})();
