// Fans of Rouflage · DOMINIO: LOS PUNTOS de cada uno al acabar la partida. Reglas puras: reciben las cifras de quien puntúa y lo que pasa
// en la partida (no miran J, el reloj ni el PvP) y devuelven un número. Las cifras salen de AJUSTES.puntos.
//   colado: camuflaje × 3 + segundos delante de sus narices × peso + silbidos por gusto × 25 + segundos aguantados × 2 + 300 si no le pillan
//   becario: despidos × 150 − despidos improcedentes × 30 + (si no queda nadie) segundos de sobra × 4 y cartas que le quedan × 40
'use strict';

RF.Puntos = (() => {
  const P = AJUSTES.puntos;
  const extra = e => (e.galeria || 0) + (e.bonus || 0);      // la galería de disfraces y el bonus del modo suman aparte
  // lo ganado como colado, sin redondear (el Contagio lo suma a lo ganado como becario). `pesoNarices` lo da el modo (Ojo de halcón)
  const coladoCrudo = (camo, pts, pesoNarices) => camo * P.camo + pts.narices * pesoNarices + pts.silbidos * P.silbido + pts.aguante * P.aguante;
  return {
    // un colado: `fuera` si lo han despedido
    colado: (e, pesoNarices) => Math.round(coladoCrudo(e.camo, e.pts, pesoNarices) + (e.fuera ? 0 : P.sinPillar)) + extra(e),
    // lo que un becario se lleva de lo que fue de colado (Contagio) para sumarlo a sus despidos
    coladoContagiado: (e, pesoNarices) => coladoCrudo(e.camo, e.pts, pesoNarices),
    // un becario: `coladoPrevio` lo que ganó antes de colado (0 si siempre fue becario), `quedanEscondidos` cuántos colados siguen en juego
    becario: (e, coladoPrevio, quedanEscondidos, reloj) => {
      const fin = quedanEscondidos ? 0 : Math.max(0, reloj) * P.segundoSobra + Math.max(0, e.balas) * P.carta;
      return Math.max(0, Math.round(coladoPrevio + e.pts.aciertos * P.despido - e.pts.fallos * P.fallo + fin)) + (e.bonus || 0);
    },
    // en el PvP los puntos los cuenta el anfitrión
    deRed: e => e.puntosRed + extra(e),
  };
})();
