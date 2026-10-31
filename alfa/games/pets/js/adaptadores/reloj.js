// Fans Of Pets · adaptador · RELOJ: la hora del juego es la del aparato más lo que se haya adelantado con DEV (el desfase se guarda con la
// partida). El minuto del día sale de la hora local del aparato: el horario de vida es «su» mañana y «su» noche. El plan pide la hora del
// servidor; llegará con el progreso en la nube.
'use strict';
PT.creaReloj = almacen => ({
  ahora: () => Date.now() + (almacen.leeExtra('desfase') || 0),
  minutoDelDia(t) {
    const d = new Date(t);
    return d.getHours() * 60 + d.getMinutes();
  },
  // DEV: adelanta el reloj del juego
  adelanta(horas) { almacen.escribeExtra('desfase', (almacen.leeExtra('desfase') || 0) + horas * 60 * PT_MINUTO); },
});
// el reloj en texto: «9:05»
PT.hora = m => Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
// una duración en texto: «1 h 20 min»
PT.duracion = min => {
  min = Math.max(0, Math.ceil(min));
  const h = Math.floor(min / 60), m = min % 60;
  if (!h) return tr('{m} min', { m });
  return m ? tr('{h} h {m} min', { h, m }) : tr('{h} h', { h });
};
