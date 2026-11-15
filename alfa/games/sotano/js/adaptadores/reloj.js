// Fans Of Sótano · adaptador · RELOJ: la hora del juego es la de core (HORA.ahora: la del aparato, o la puesta a mano en desarrollo, ADR 047).
// Solo sirve para las horas extra (cuánto tiempo se estuvo fuera); el motor avanza con el tiempo entre fotogramas.
'use strict';
SO.creaReloj = (hora = () => (typeof HORA !== 'undefined' ? HORA.ahora() : Date.now())) => ({ ahora: () => hora() });
