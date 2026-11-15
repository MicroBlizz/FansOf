// Fans Of Paperwork · adaptador · RETOS: los logros con el sistema común de retos ligeros de core (RETOSL, core/js/sistema/retos-ligero.js) y las
// misiones y logros de js/retos.js. Guarda lo suyo en el extra 'retos' del almacén (sobrevive al Despido y a borrar la partida) y paga por los
// casos de uso, en Indemnización. Hacia dentro da el puerto que esperan los casos de uso: { evento, maximo }; hacia la pantalla, la lista y cobrar.
'use strict';
PW.creaRetos = (almacen, reloj, ingresa) => {
  const sobre = { retos: almacen.leeExtra('retos') || undefined };
  const RL = RETOSL.crear({
    save: () => sobre,
    guardar: () => almacen.apuntaExtra('retos', sobre.retos),   // viaja en el siguiente guardado de la partida (cada pocos segundos y en cada orden)
    pagar: r => ingresa(r),
    diarias: PW.DIARIAS, semanales: PW.SEMANALES, logros: PW.LOGROS, nDiarias: 3, nSemanales: 2,
    hoy: () => new Date(reloj.ahora()),
  });
  return {
    evento: (ev, n) => RL.evento(ev, n),
    maximo: (ev, n) => RL.maximo(ev, n),
    // para la pantalla, por lista: 'd' (diarias), 's' (semanales) o 'l' (logros)
    lista: p => RL.lista(p),
    listos: () => RL.listosTodos(),
    cobrar: (p, id) => RL.cobrar(p, id),
  };
};
