// Fans of Island · CIFRAS: todo lo que se calibra del movimiento y la cooperación, en un solo sitio. Las unidades son píxeles de la lona
// (270 de alto, píxel gordo: principal.js) y segundos. CrazyBunny mide 34 de alto (su caja; las orejas asoman por encima).
'use strict';
const IS_C = {
  gravedad: 1150, caida: 500,                                  // gravedad y velocidad máxima de caída
  correr: 150, acelSuelo: 1600, frenoSuelo: 2100, acelAire: 900,
  salto: 415, saltoCorte: 0.45, coyote: 0.1, bufer: 0.12,      // salto variable (al soltar se corta): sube unos 75 px, dos conejos y pico. Coyote y pulsación adelantada
  flotar: { gravedad: 230, caida: 55, tiempo: 1.2, aleteo: 18 },   // flotar con las orejas: el primer aleteo frena la caída y después gravedad suave mientras se mantiene el salto, con un tiempo por salto
  cargar: { correr: 0.8, salto: 0.85 },                        // con el compañero a cuestas se corre y se salta un poco menos
  lanzar: { vx: 110, vy: 540 },                                // velocidad al lanzar al compañero (sube unos 125 px: más que un salto, para repisas que solo se alcanzan así)
  burbuja: { subida: 16, tiempo: 7 },                          // la burbuja de hilo sube despacio y se revienta al tocarla (o sola, pasado el tiempo)
  cuerda: 280,                                                 // separación máxima entre los dos antes del tirón del hilo
  abismo: 360,                                                 // por debajo de esta altura se ha caído
  iman: { alcance: 300, vx: 260, vy: 4 },                       // poder imán: hasta dónde tira del compañero y con qué fuerza
  coger: { dx: 40, dy: 26 },                                   // a qué distancia se puede coger al compañero
  personaje: { w: 22, h: 34 },
  fps: 10,                                                     // fotogramas por segundo de las animaciones: a tirones, como la plastelina animada a mano
};
