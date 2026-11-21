// Fans of Pinball · adaptador · RELOJ: la hora de verdad (para el día de la racha, las misiones y la semana de la clasificación) y una
// semilla nueva para cada partida. Es la de core (HORA.ahora) más lo que se adelante con DEV. La mesa NO usa este reloj: cuenta pasos.
'use strict';
PB.creaReloj = (hora = () => (typeof HORA !== 'undefined' ? HORA.ahora() : Date.now()), azar = Math.random) => {
  let desfase = 0;
  return {
    ahora: () => hora() + desfase,
    adelantaDias(dias) { desfase += dias * 86400000; },   // DEV
    semilla: () => Math.floor(azar() * 4294967296),
  };
};
