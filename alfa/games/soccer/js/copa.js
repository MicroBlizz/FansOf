// Fans of Soccer · La Copa Microblizz: la escalera de rivales (cada uno en su campo y cada vez mejor) y cómo se avanza.
// Solo reglas: el progreso lo guarda principal.js en este navegador.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  S.copa = {
    // Los cuatro rivales de un equipo, por orden: los de la lista de la Copa menos él mismo.
    rivales(equipo) { return S.AJ.copa.filter(([id]) => id !== equipo).slice(0, 4).map(([id, campo]) => ({ equipo: id, campo })); },
    // Resultado de un partido de Copa: si se gana se pasa al siguiente; el empate o la derrota obligan a repetir.
    avanzar(progreso, equipo, marcador) {
      const total = S.copa.rivales(equipo).length, gana = marcador[0] > marcador[1];
      const nuevo = gana ? Math.min(total, progreso + 1) : progreso;
      return { progreso: nuevo, gana, campeon: gana && nuevo === total };
    },
  };
})(SOCCER);
