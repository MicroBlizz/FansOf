// Fans of Pinball · AJUSTES · JUGO: que golpear dé gusto (PROTOTIPO.md, «Jugo»; ★ = imprescindible) y la cámara, la vibración, el sonido
// y las partículas de la pantalla (MOVIL.md, apartados 3 a 5). Milisegundos, píxeles lógicos y segundos.
'use strict';
AJUSTES.jugo = PB.congela({
  paron: { rompe: 40, vence: 80, fuerte: 150, jefe: 150 },        // (espec. ★1) ms de física parada
  temblor: { rompe: 2, fuerte: 6, explosion: 6, segundos: 0.2 },  // (espec. ★5) px y nunca más de 0,2 s
    destello: 0.12,               // (partida) segundos del destello blanco del enemigo golpeado y de la seta encendida
  combo: { semitonoTope: 12, letreros: [10, 20, 30] },             // (espec. ★3 y 10)
  cifras: { segundos: 0.8, base: 16, porCombo: 0.6, tope: 34, cuantas: 24 },   // (espec. ★2) tamaño en px CSS; grupo fijo de 24
  fichasVuelan: { segundos: 0.55, cuantas: 12 },                  // (espec. ★4)
  particulas: { tope: 200, gravedad: 260, vida: 0.6, piezas: 6, chispas: 10, papeles: 8 },   // (MOVIL) grupo fijo
  camara: { suave: 7, adelanto: 0.12, adelantoMax: 60, margenPalas: 24, margenBola: 40 },   // (espec.) suave, con adelanto y sin saltos
  vibra: { pala: 10, vence: 25, fuerte: 18, pierde: [20, 40, 20], caos: 30, minimo: 60 },  // (espec. ★6 y MOVIL) ms; una cada 60 ms como mucho
  caos: { borde: 6 },           // (espec. 9) px del borde naranja
});
// lo que dice Lola antes de que se mueva la bola (8 palabras como mucho, espec.) y en qué plantas de la historia
AJUSTES.guia = PB.congela({
  frases: {
    1: 'Toca a cada lado para golpear',
    2: 'Con fichas, te vendo mejoras en mi tienda',
    3: 'Perder la bola te quita tiempo',
    4: 'Desde aquí, si se acaba el reloj, pierdes',
    10: 'Rompe sus cajas y dale en el núcleo',
  },
  partidas: 3,                  // (partida) Lola deja de hablar tras esta cantidad de partidas de historia
});
AJUSTES.sonido = PB.congela({
  volumen: 0.8,
  musica: 0.3,                  // (partida) la música, respecto a los efectos
  canciones: { menu: 'menu', mesa: 'gamer', jefe: 'boss' },   // canciones de la serie (core/js/serie/canciones.js)
  prisaCaos: 1.25,              // (partida) la música va más deprisa durante el CAOS
  freno: { golpe: 35, pala: 50, seta: 45, rompe: 40, empujon: 200 },   // (MOVIL) ms mínimos entre dos iguales
});
