// Fans of Pinball · AJUSTES · RELOJ: el reloj único de la partida, lo que suma y lo que quita, la protección de las primeras plantas,
// el salvabolas y la entrada justa en la escalera (PROTOTIPO.md, «El reloj» y «La escalera»). Segundos.
'use strict';
AJUSTES.reloj = PB.congela({
  inicial: 60,                  // (espec.)
  escalera: 20,                 // (espec.) entrar en la escalera
  enemigo: 2,                   // (espec.) cada enemigo vencido
  cofre: 3,                     // (espec.) cada cofre
  expres: { segundos: 5, antesDe: 25 },   // (espec.) escalera en menos de 25 s desde que empezó la sala: +5 s «¡Exprés!»
  perderBola: 8,                // (espec., decidido) perder la bola quita tiempo, no la partida
  plantasProtegidas: 3,         // (espec., decidido) en las plantas 1 a 3 no se pierde
  minimoProtegido: 10,          // (espec.) en esas plantas el reloj no baja de 10 s
  salvabolas: 5,                // (espec., partida) los primeros segundos de cada sala, la bola que se cuela vuelve sin coste
  porLosPelos: { quedan: 5, marco: 1, camaraLenta: 0.6, factor: 0.3 },   // (espec.) 5 s o menos, o tocó el marco (en el último 1 s, partida)
  cayendo: 1.2,                 // (partida) segundos de la animación de bajar de planta antes de elegir mejora
  jefeMinimo: 60,               // (espec.) al entrar en la sala del jefe, el reloj sube a 60 s si tenías menos
  fichador: { cada: 4, quita: 1 },        // (espec.) el becario fichador quita 1 s cada 4 s mientras vive
});
