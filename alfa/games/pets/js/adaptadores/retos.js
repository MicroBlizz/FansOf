// Fans Of Pets · adaptador · RETOS: los logros con el sistema común de retos ligeros de core (RETOSL, core/js/sistema/retos-ligero.js) y los
// datos de PT.LOGROS. Guarda lo suyo en el extra 'retos' del almacén (sobrevive a otro huevo y a reiniciar), mira el día en el reloj del juego
// y paga los premios por los casos de uso (la cartera). Hacia dentro da el puerto que esperan los casos de uso: { evento, maximo, conseguido };
// hacia la pantalla, la lista de logros y cobrar. Sin misiones diarias ni semanales (de momento solo logros).
'use strict';
PT.creaRetos = (almacen, reloj, ingresa) => {
  const sobre = { retos: almacen.leeExtra('retos') || undefined };
  const RL = RETOSL.crear({
    save: () => sobre,
    guardar: () => almacen.escribeExtra('retos', sobre.retos),
    pagar: r => ingresa(r),
    diarias: [], semanales: [], logros: PT.LOGROS, nDiarias: 0, nSemanales: 0,
    hoy: () => new Date(reloj.ahora()),
  });
  return {
    evento: (ev, n) => RL.evento(ev, n),
    maximo: (ev, n) => RL.maximo(ev, n),
    conseguido: id => RL.lista('l').some(l => l.id === id && l.listo),
    // para la pantalla: cada logro con su progreso ([{ id, txt, goal, prog, r, listo, cobrada }]), cuántos esperan cobro, y cobrar uno
    lista: () => RL.lista('l'),
    listos: () => RL.listos('l'),
    cobrar: id => RL.cobrar('l', id),
  };
};
