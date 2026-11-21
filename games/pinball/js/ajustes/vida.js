// Fans of Pinball · AJUSTES · VIDA FUERA DE LA PARTIDA: lo que hace volver (PROTOTIPO.md, «Motivos para volver», «Récord y clasificación»
// y «Pantalla de fin»): las misiones del día, la racha de días, la primera partida del día, la ayuda que se adapta y el guardado.
'use strict';
AJUSTES.vida = PB.congela({
  version: 1,                   // versión del formato de la partida guardada (aplicacion/guardado.js)
  misionesPorDia: 3,            // (espec.)
  // (espec. «50 a 100 fichas») cada una: id, texto, cuántas, el aviso que la cuenta (ev) y el premio en fichas (r). Las cuenta RETOSL de core
  misiones: [
    { id: 'vasijas40', txt: 'Rompe 40 vasijas', goal: 40, ev: 'vasija', r: 60 },
    { id: 'planta6', txt: 'Llega a la planta 6', goal: 1, ev: 'planta6', r: 80 },
    { id: 'caos3', txt: 'Activa el CAOS 3 veces', goal: 3, ev: 'caos', r: 60 },
    { id: 'becarios15', txt: 'Vence a 15 becarios', goal: 15, ev: 'enemigo', r: 70 },
    { id: 'cofres6', txt: 'Abre 6 cofres', goal: 6, ev: 'cofre', r: 60 },
    { id: 'escaleras8', txt: 'Sube 8 veces en ascensor', goal: 8, ev: 'escalera', r: 80 },
    { id: 'partidas3', txt: 'Juega 3 partidas', goal: 3, ev: 'partida', r: 50 },
    { id: 'puntos20k', txt: 'Haz 20.000 puntos en una partida', goal: 1, ev: 'puntos20k', r: 100 },
  ],
  racha: [50, 75, 100, 125, 150, 200, 400],   // (espec.) fichas del día 1 al 7 (el 7, el cofre grande); después vuelve a empezar
  primeraDelDia: 2,             // (espec.) la primera partida del día da fichas ×2
  plantaCorta: 6,               // (espec.) acabar antes de esta planta cuenta como partida corta
  cortasParaAyuda: 2,           // (espec.) tras 2 cortas seguidas, la siguiente lleva menos enemigos
  puntosMision: 20000,          // el umbral de la misión de puntos
});
