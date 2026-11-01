// Fans of Chef · AJUSTES: el nombre de la demo para core, la clave de su partida en este navegador y las cifras del juego
// (tiempos de la caza y del servicio, vida, daños, velocidades). Se carga antes de lo común.
'use strict';
const AJUSTES = {
  id: 'chef',                 // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-chef',    // la clave de la partida en este navegador (oro, día y ajustes)
};
const CAS = 24;               // una casilla del sótano, en píxeles del juego
const CIFRAS = {
  cazaSeg: 150,               // lo que dura la caza: «abre la cantina en 2:30»
  servicioSeg: 60,            // lo que dura el servicio en la cantina
  pacienciaSeg: 28,           // lo que aguanta un cliente antes de irse
  cocinarSeg: 1.6,            // lo que tarda un plato en hacerse
  vida: 3,                    // corazones del cocinero
  velocidad: 92,              // píxeles por segundo andando
  velocidadBloqueo: 36,       // andando con la sartén levantada
  cuchilloCada: 0.34,         // segundos entre dos cuchilladas
  cuchilloAlcance: 28,        // hasta dónde llega la cuchillada (desde el centro del cocinero)
  invulnerableSeg: 0.9,       // tras un golpe, un rato sin recibir otro
  perdidaDerrota: 0.5,        // la parte de lo cazado que se pierde al caer en el sótano
  salasPorJornada: [4, 5, 6], // cuántas salas tiene el sótano los días 1, 2 y 3 en adelante
};
