// Fans of Panic · AJUSTES: el nombre de la demo para core, la clave de su partida en este navegador y las cifras del juego.
// Se carga antes de lo común. Las cifras de aquí son las que se tocan para calibrar (tiempo, velocidades, precios).
'use strict';
const AJUSTES = {
  id: 'panic',                 // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-panic',    // la clave de la partida en este navegador (fichas, estrellas, galería y ajustes)
  objetivo: 0.8,               // parte de la ilustración que hay que destapar para ganar
  estrellas: [0.8, 0.9, 1],    // 1, 2 y 3 estrellas
  tiempo: 75,                  // segundos por nivel
  velCursor: 26,               // casillas por segundo del cúter
  velCursorRapido: 40,         // con el potenciador Tijera
  mecha: 0.8,                  // segundos quieto trazando antes de que arda la mecha
  velMecha: 22,                // casillas por segundo que recorre la mecha
  combo: 2,                    // segundos entre dos cortes para que cuenten como combo
  corteGrande: 0.15,           // parte de la silueta de un solo corte: cámara lenta y fiesta
  atrapado: 0.1,               // si al jefe le queda menos de esto libre, está ATRAPADO: 100 % automático
  vidas: 5, vidaCada: 30 * 60, // corazones y segundos para recuperar uno
  seguirFichas: 20,            // fichas por seguir tras perder (+15 s y escudo)
  llaveFichas: 60,             // fichas por la llave de un mundo (o las estrellas de abajo)
  llaveEstrellas: 10,          // estrellas del mundo anterior para abrir el siguiente gratis
  fichasEstrella: [1, 2, 5],   // fichas que da un nivel la primera vez, según sus estrellas
  gracia: 0.1,                 // segundos de perdón en el primer toque de un becario
};
