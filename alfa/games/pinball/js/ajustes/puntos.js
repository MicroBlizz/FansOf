// Fans of Pinball · AJUSTES · PUNTOS: vida, puntos, fichas y barra de CAOS de cada cosa (tabla de PROTOTIPO.md), el daño de la bola,
// el combo y el modo CAOS. Las cosas que no están en la tabla (cajas del jefe, cubitos, cafés, máquinas, rebotadores y fotocopiadora) son de partida.
'use strict';
AJUSTES.puntos = PB.congela({
  cosas: {
    vasija: { vida: 10, puntos: 50, fichas: 1, caos: 4 },          // (espec.)
    cofre: { vida: 30, puntos: 300, fichas: 8, caos: 12 },         // (espec.)
    seta: { puntos: 10, fichas: 0, caos: 1 },                      // (espec.) las setas de la especificación son ahora las dianas
    maquina: { puntos: 25, fichas: 0.25, caos: 3 },                 // (partida) máquina de café: rebota fuerte, suelta fichas y llena el CAOS
    rebotador: { puntos: 10, fichas: 0, caos: 1 },                 // (partida) la patada del rebotador
    fotocopia: { puntos: 150, fichas: 2, caos: 6 },                // (partida) el pequeño premio de pasar por la fotocopiadora (rampa)
    becario: { vida: 30, puntos: 150, fichas: 2, caos: 8 },        // (espec.)
    cafetero: { vida: 40, puntos: 250, fichas: 3, caos: 8 },       // (espec.)
    fichador: { vida: 30, puntos: 250, fichas: 3, caos: 8 },       // (espec.)
    casco: { vida: 30, casco: 30, puntos: 400, fichas: 4, caos: 10 },   // (espec.: vida 60 = 30 + 30 de casco, que el golpe fuerte quita de una vez)
    caja: { vida: 30, puntos: 100, fichas: 1, caos: 4 },           // (espec. la vida; partida el resto) cajas de botín del jefe
    cubito: { puntos: 100, fichas: 0, caos: 2 },                   // (partida) romper el cubito del jefe en el aire
    cafe: { puntos: 25, fichas: 0, caos: 1 },                      // (partida) romper el café en el aire
    jefe: { vida: 600, puntos: 5000, fichas: 60, caos: 0 },        // (espec.) SurvivalBot
    escalera: { puntos: 500, fichas: 5 },                          // (espec.) los puntos van × planta
  },
  dano: 10,                     // (espec.) daño de la bola por golpe (nivel 1)
  fuerte: 2,                    // (espec.) el golpe fuerte hace el doble (20)
  combo: { ventana: 2, divisor: 10, tope: 4 },   // (espec.) golpes dentro de 2 s; multiplicador ×(1 + combo/10), tope ×4
});
AJUSTES.caos = PB.congela({
  barra: 100,                   // (espec.)
  primeraPlanta: 1.5,           // (espec.) en la planta 1 se llena a ×1,5
  subePorCaos: 0.2,             // (espec.) tras cada CAOS, la siguiente de esa sala pide un 20 % más
  segundos: 5,                  // (espec.)
  multiplicador: 2,             // (espec.) puntos y fichas ×2
});
