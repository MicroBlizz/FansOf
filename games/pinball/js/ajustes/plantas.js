// Fans of Pinball · AJUSTES · PLANTAS: la curva de dificultad (tabla de PROTOTIPO.md), la regla para seguir del sin fin, la ayuda que se
// adapta, los modos (historia y sin fin) y las 6 plantillas de sala de Oficinas (dónde van las dianas y el cofre de la rampa).
'use strict';
AJUSTES.plantas = PB.congela({
  // (espec.) plantas 1 a 9: vasijas + cofres, enemigos, tipo nuevo que aparece y % de la barra de sala que abre la escalera
  // (espec., rebajada el 20-11-2026 con la mesa de decorado grande: la bola mide el doble y el centro libre es más pequeño) plantas 1 a 9:
  // vasijas + cofres, enemigos, tipo nuevo que aparece y % de la barra de sala que abre el ascensor (la columna se sigue llamando escalera)
  tabla: [
    { vasijas: 4, cofres: 1, enemigos: 1, nuevo: 'becario', escalera: 50 },
    { vasijas: 5, cofres: 1, enemigos: 1, nuevo: null, escalera: 55 },
    { vasijas: 5, cofres: 1, enemigos: 2, nuevo: 'cafetero', escalera: 60 },
    { vasijas: 5, cofres: 1, enemigos: 2, nuevo: 'fichador', escalera: 60 },
    { vasijas: 3, cofres: 3, enemigos: 1, nuevo: null, escalera: 40, tesoro: true },
    { vasijas: 5, cofres: 1, enemigos: 2, nuevo: null, escalera: 65 },
    { vasijas: 6, cofres: 1, enemigos: 3, nuevo: 'casco', escalera: 65 },
    { vasijas: 6, cofres: 1, enemigos: 3, nuevo: null, escalera: 70 },
    { vasijas: 5, cofres: 2, enemigos: 3, nuevo: null, escalera: 70 },
  ],
  tipos: ['becario', 'cafetero', 'fichador', 'casco'],   // en el orden en que aparecen
  jefeCada: 10,                 // (espec.) planta 10 de la historia y cada 10 del sin fin
  tesoroCada: 5,                // (espec.) sin fin: cada 5 plantas, sala tesoro (como la fila 5)
  // (espec.) regla para seguir, a partir de la planta 10: +1 enemigo cada 2 plantas (tope 4 con la mesa nueva; antes 10), vida +8 % por planta,
  // la escalera da 1 s menos cada 2 plantas (mínimo 12 s) y cada SurvivalBot tiene +40 % de vida
  seguir: { enemigosCada: 2, enemigosTope: 4, vidaPorPlanta: 0.08, escaleraBajaCada: 2, escaleraMinimo: 12, jefeVidaSube: 0.4 },
  ayuda: 0.2,                   // (espec.) tras 2 partidas cortas, la siguiente lleva un 20 % menos de enemigos (lo decide quien crea la partida)
  historia: { plantas: 10 },    // (espec.) capítulo Oficinas: 10 plantas con el jefe en la 10
  // (partida) las 6 plantillas de Oficinas: dianas de cada nivel (en el centro libre) y el cofre «en el camino de la rampa». En la
  // historia van en orden, en el sin fin se sortean con la semilla. Lo demás lo coloca el generador al azar, siempre sin solaparse.
  plantillas: [
    { abajo: [[66, 368]], arriba: [[60, 215]], cofreRampa: [135, 375] },
    { abajo: [[90, 365]], arriba: [[95, 205]], cofreRampa: [135, 420] },
    { abajo: [[60, 420]], arriba: [[45, 212]], cofreRampa: [130, 375] },
    { abajo: [[45, 370]], arriba: [[85, 230]], cofreRampa: [135, 425] },
    { abajo: [[90, 430]], arriba: [[100, 215]], cofreRampa: [135, 375] },
    { abajo: [[110, 360]], arriba: [[70, 212]], cofreRampa: [130, 425] },
  ],
  radioSeta: 7,                 // (partida) las dianas (diana.png de 16)
  radioVasija: 8,               // (partida) maceta y caja de unos 20
  radioCofre: 10,               // (partida) cofre de unos 28 el primer cofre va al camino de la rampa; el resto, arriba (espec.: «la mayoría de cofres»)
});
