// Fans of Pinball · AJUSTES · ENEMIGOS y JEFE: los becarios de Microblizz (cómo se mueven, el café, el fichador) y SurvivalBot, el jefe
// de la planta 10 (PROTOTIPO.md, «Enemigos» y «Planta 10»). Unidades del mundo y segundos.
'use strict';
AJUSTES.enemigos = PB.congela({
  radio: 12,                    // (partida) los becarios de Swipe reducidos a la mitad miden unos 28
  hueco: 6,                     // (partida) hueco mínimo al ponerlos (menos que el de la mesa: se mueven y en las plantas altas hay muchos)
  velocidad: 18,                // (partida) andan de lado a lado
  bajada: 3,                    // (partida) y bajan poco a poco hacia la parte baja de su nivel (espec.)
  zonas: {                      // (partida) por dónde andan, sin acercarse a las palas, a las salidas ni al ascensor
    arriba: { x0: 32, x1: 120, y0: 184, y1: 236 },   // bajo las máquinas de café
    abajo: { x0: 22, x1: 140, y0: 344, y1: 470 },
  },
  cafe: { cada: 5, velocidad: 100, radio: 5, lenta: 2, factor: 0.5 },   // (espec. 5 s y 2 s; partida el resto) la pala va a la mitad
});
AJUSTES.jefe = PB.congela({
  x: 72, y: 120, radio: 20,     // (partida) en el sitio de las máquinas de café (que se retiran en su planta)
  cajas: [[-34, 12], [34, 12], [0, 40]],   // (espec. 3 cajas; partida dónde) desplazamiento de cada caja desde el jefe
  radioCaja: 11,                // (partida)
  nucleo: 6,                    // (espec.) segundos que se abre el núcleo al romper las 3 cajas
  frio: { cada: 10, cadaRabia: 7, aviso: 1.5, velocidad: 110, radio: 7, congela: 3 },   // (espec. 10, 7, 1,5 y 3 s; partida el resto)
  rabia: 0.5,                   // (espec.) al 50 % llama a becarios y dispara más a menudo
  llama: 2,                     // (espec.) becarios que llama
  movil: 0.25,                  // (espec.) al 25 % el núcleo se queda abierto y se mueve de lado a lado
  velocidad: 30, xMin: 36, xMax: 108,      // (partida)
  ultimoGolpe: { camaraLenta: 1, factor: 0.3 },   // (espec.) cámara lenta 1 s
  premio: { fichas: 200, criatura: 'junkcoon' },  // (espec.) lo que da vencerle en la historia (lo guarda quien guarda la partida)
});
