// Fans Of · ECONOMÍA: el único sitio por donde entran y salen el oro, las gemas y las entradas del gashapón.
//
// Ningún código escribe SAVE.gold, SAVE.gems ni SAVE.tickets directamente: pide ECO.ganar o ECO.gastar con el motivo.
// Hoy hay un solo motor (local: apunta en la partida guardada, igual que antes). Cuando haya recursos en la nube
// (PLAN-CUENTAS.md, puntos 14 y 15) se cambia el motor aquí y los juegos no se enteran.
// Ni ganar ni gastar guardan la partida ni repintan la cartera: eso lo sigue haciendo quien llama (saveGame, updateWallets).
'use strict';
const ECO = {
  // motivo: para qué es (ahora solo documenta; el servidor lo apuntará en el libro de movimientos)
  // v: { gold, gems, tickets }, cada uno opcional
  ganar(motivo, v) { ECO.motor.mover(motivo, v, 1); },
  gastar(motivo, v) { ECO.motor.mover(motivo, v, -1); },
  motor: {
    mover(motivo, v, signo) {
      if (v.gold) SAVE.gold += signo * v.gold;
      if (v.gems) SAVE.gems += signo * v.gems;
      if (v.tickets) SAVE.tickets = (SAVE.tickets || 0) + signo * v.tickets;
    },
  },
};
