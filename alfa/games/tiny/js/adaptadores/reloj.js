// Tiny Fans · adaptador · RELOJ: la hora de verdad, en milisegundos, para lo que dura horas (la mochila caída). Es la de core (HORA.ahora:
// la del aparato, o la puesta a mano en desarrollo) más lo que se adelante con DEV, que no se guarda. La simulación NO usa este reloj:
// cuenta sus pasos. El azar de verdad también sale de aquí: una semilla nueva para cada expedición. Dueño: N1 (arquitectura).
'use strict';
TN.creaReloj = (hora = () => HORA.ahora(), azar = Math.random) => {
  let desfase = 0;
  return {
    ahora: () => hora() + desfase,
    adelanta(horas) { desfase += horas * 3600000; },   // DEV
    semilla: () => Math.floor(azar() * 4294967296),    // un entero de 32 bits para TN.azar
  };
};
