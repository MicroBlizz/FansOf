// Fans of Pinball · AJUSTES · FÍSICA: gravedad, tope de velocidad, subpasos, rebotes, golpe fuerte y empujones a la bola parada.
// Unidades del mundo (la mesa mide 180 de ancho), segundos y radianes. La física nunca se acelera con las plantas (PROTOTIPO.md, curva).
'use strict';
AJUSTES.fisica = PB.congela({
  gravedad: 380,                // (partida) unidades/s² hacia abajo (y crece hacia abajo); un nivel se cae en algo más de 1 s
  velocidadMaxima: 700,         // (partida, MOVIL pide tope) también en el CAOS y con varias bolas
  radioBola: 12,                // (partida) radio de choque de la bola sin mejoras: la cápsula mide 32 y su círculo 28 (ARTE.md)
  avanceSubpaso: 0.5,           // (MOVIL) la bola no recorre en un subpaso más de esta parte de su radio
  giroSubpaso: 0.052,           // (MOVIL) unos 3 grados: lo más que gira una pala en un subpaso
  maxSubpasos: 16,              // (partida) tope de subpasos por paso (con el tope de velocidad bastan 2)
  rebote: {                     // (partida) parte de la velocidad que se conserva al chocar, por tipo de cosa
    pared: 0.55, pala: 0.3, rompible: 0.45, enemigo: 0.45, seta: 0.7, jefe: 0.5, maquina: 0.8, rebotador: 0.6,
  },
  impulsoSeta: 120,             // (partida) empujón extra de la diana que rebota, hacia fuera
  impulsoMaquina: 260,          // (partida) las máquinas de café rebotan con fuerza
  impulsoRebotador: { minimo: 60, fuerza: 280 },   // (partida) el rebotador solo da patada si la bola llega con algo de fuerza
  esperaGolpeFijo: 0.12,        // (partida) segundos entre dos golpes que cuentan de la misma máquina o rebotador (no premia al apoyarse)
  impactoMinimo: 40,            // (partida) por debajo de esta velocidad contra algo, es apoyarse y no golpear (no hace daño)
  golpeFuerte: 340,             // (espec.: umbral de partida) por encima de esta velocidad el golpe hace el doble
  topeBolas: 6,                 // (MOVIL) bolas a la vez como mucho (CAOS con Cuarta bola son 4)
  quieta: { velocidad: 12, segundos: 3, empujon: 260 },     // (espec. 3 s; partida el resto) la bola quieta recibe un empujón suave
  sinTocar: { segundos: 10, empujon: 430 },                 // (encargo n2) 10 s sin tocar nada: empujón hacia arriba
});
