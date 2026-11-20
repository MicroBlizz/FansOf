// Fans of Rally · AJUSTES: lo que core necesita saber del juego (nombre y clave de los récords) y todas las cifras de las reglas.
// Valores del primer prototipo (tarea #278): se ajustan jugando. El dominio nunca lee AJUSTES por su cuenta: lo recibe como `reglas`.
// Unidades: el mundo va en píxeles de juego (un coche mide 46 de largo) y el tiempo en segundos.
'use strict';
const AJUSTES = {
  id: '',                       // sin id a propósito (como Toys): la cuenta de core queda apagada y los récords viven en este móvil
  nombre: 'Fans of Rally',
  guardado: 'for-rally-v1',     // la clave de los récords en este navegador
  sinFeedback: true,            // la pestaña de feedback de core necesita cuenta: en el prototipo no sale
};
AJUSTES.coche = RA.congela({
  aceleracion: 150,             // cuánto gana por segundo con el gas a fondo
  velocidadMax: 235,            // en asfalto, con un piloto de velocidad 1
  marchaAtras: 45,
  frenada: 330,
  rozamiento: 0.35,             // lo que pierde solo, sin gas
  giro: 2.5,                    // radianes por segundo a fondo
  velocidadGiroPleno: 70,       // por debajo de esto gira menos (parado no gira)
  agarre: 7,                    // lo rápido que la marcha sigue al morro: menos = más derrape
  radio: 12,                    // para los toques entre coches
  kmh: 0.82,                    // de píxeles por segundo a lo que enseña el marcador
});
// cada suelo cambia el agarre, la punta y lo que frena (el «fuera» es arena, hierba o nieve honda según el tramo)
AJUSTES.suelos = RA.congela({
  asfalto: { agarre: 1, punta: 1, arrastre: 0 },
  tierra: { agarre: 0.55, punta: 0.94, arrastre: 0.05 },
  barro: { agarre: 0.4, punta: 0.84, arrastre: 0.25 },
  nieve: { agarre: 0.32, punta: 0.88, arrastre: 0.1 },
  fuera: { agarre: 0.5, punta: 0.45, arrastre: 0.9 },
});
AJUSTES.carrera = RA.congela({
  vueltasCampeonato: 2,
  vueltasContrarreloj: 3,
  cuentaAtras: 3,
  rivales: 5,                   // los coches de Microblizz; sales el último, como en el original
  controles: [0.34, 0.67],      // dónde están los controles de tiempo dentro de la vuelta (además de la meta)
  puntos: [10, 8, 6, 5, 4, 3],  // del 1.º al 6.º en cada tramo del campeonato
  muestraFantasma: 0.05,        // cada cuánto se apunta la posición del fantasma
});
// la IA de los rivales: cuánto aprietan y cuánto se esperan si te quedas atrás
AJUSTES.ia = RA.congela({
  mira: 70,                     // píxeles por delante a los que apunta, más lo que dé la velocidad
  miraPorVelocidad: 0.35,
  curvaLateral: 210,            // aceleración de lado que se atreven a llevar en curva
  pericia: [0.84, 0.87, 0.9, 0.92, 0.95],
  goma: 0.08,                   // lo que aflojan o aprietan según lo lejos que vayas
});
