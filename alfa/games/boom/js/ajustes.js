// Fans of Boom · AJUSTES: el nombre del juego para core y TODAS las cifras del juego (física, viento, móviles, tiros, turnos, bonos, mapas).
// Se carga antes de lo común. Cambiar el equilibrio del juego es tocar solo este archivo.
'use strict';
const AJUSTES = {
  id: 'boom',                // para core: la partida en la nube lleva este nombre (de momento Boom no sube nada: fase 0, sin cuenta)
  guardado: 'for-boom-v1',   // la clave de la partida en este navegador (sonido, tipo de control, última partida preparada)
};
const BOOM = {
  paso: 1 / 60,              // segundos de cada paso de la simulación: fijo, para que el mismo tiro dé siempre el mismo resultado
  mundo: { ancho: 2880, alto: 900 },   // el mapa mide tres pantallas de ancho; por debajo del alto no hay nada (vacío)
  gravedad: 900,             // píxeles por segundo al cuadrado
  viento: { max: 24, aceleracion: 4.2, cambio: 9 },   // fuerza 0-24 (negativo = hacia la izquierda), píxeles/s² por punto, y cuánto cambia como mucho cada turno
  velocidadMax: 1340,        // píxeles por segundo a potencia 100
  turno: { segundos: 20, penalizacion: 80 },   // tiempo para tirar y retraso extra si se acaba sin tirar
  altura: { alto: 70, cielo: 1.5, cieloTxt: 'DESDE EL CIELO', altoMult: 1.25, altoTxt: 'TIRO ALTO' },   // bonos: ángulo ≥ alto → x1,25; el tiro sale por arriba del mapa y acierta → x1,5
  fuegoAmigo: 0.5,           // el daño a los de tu equipo (y a ti) vale la mitad
  caida: { libre: 60, dano: 0.9, vacio: 60 },   // píxeles de caída que no duelen, daño por píxel de más, y a qué profundidad bajo el mapa se pierde la vida
  movil: {
    vida: 1000, radio: 22, centro: 14,    // el cuerpo es un círculo de ese radio, con su centro 14 píxeles sobre los pies
    velocidad: 78, energia: 230,          // píxeles por segundo y píxeles de camino por turno
    trepa: 1.8, boca: 30,                 // pendiente máxima que sube (alto/ancho) y distancia del cañón al centro
    retraso: 100,                         // retraso base que suma cada turno, más el del tiro y el tiempo que tardas
    segundoDeRetraso: 2,                  // retraso por cada segundo gastado antes de tirar
  },
  tiros: [   // Tiro 1 y Tiro 2 (el Tiro Especial llega con los móviles propios, en la fase 2)
    { id: 1, nombre: 'Tiro 1', radio: 44, dano: 240, retraso: 60 },
    { id: 2, nombre: 'Tiro 2', radio: 66, dano: 330, retraso: 140 },
  ],
  salida: [0, 25, 50, 75],   // retraso con el que sale cada jugador: abre el 1, luego el 2, el 3 y el 4
  equipos: [{ nombre: 'NARANJA', color: '#ff7a1a', claro: '#ffb347' }, { nombre: 'AZUL', color: '#2e8bff', claro: '#7cb8ff' }],
  modos: { '1v1': { equipos: [0, 1], x: [[0.14], [0.86]] }, '2v2': { equipos: [0, 1, 0, 1], x: [[0.09, 0.22], [0.91, 0.78]] } },   // de quién es cada plaza y dónde sale cada equipo (fracción del ancho)
  ia: { candidatos: 70, error: [26, 14, 6], pausa: 0.9 },   // tiros que simula, error en píxeles según el nivel (0 fácil, 1 normal, 2 difícil) y pausa de pensar
  nombresIA: ['Phony', 'IAhorro', 'Lola', 'Microblizz'],
  mapas: [
    { id: 'oficina', nombre: 'La Oficina de Microblizz', cielo: ['#7ad8ff', '#d8f4ff'], roca: ['#8a5a3c', '#4a2d24'], hierba: '#6fd04a', borde: '#2a1a14', base: 0.6,
      olas: [[150, 2.1], [90, 5.3], [45, 11.7]], huecos: [], cuevas: 0 },
    { id: 'madriguera', nombre: 'La Madriguera', cielo: ['#ffb36b', '#ffe9c6'], roca: ['#b0763f', '#5e3a22'], hierba: '#c9d84a', borde: '#3a2010', base: 0.66,
      olas: [[190, 1.6], [110, 4.1], [60, 9.3]], huecos: [[0.5, 110]], cuevas: 7 },
  ],
  frases: {
    alto: ['Eso ha subido más que las acciones de Phony.', 'Microblizz ha medido el ángulo con el dedo.', 'Ese tiro ha visto la nube de verdad.'],
    cielo: ['Ha salido de la pantalla y ha vuelto con recibo.', 'Phony pregunta si eso cuenta como hora extra.'],
    caida: ['Cavar también es una forma de trabajar.', 'El suelo ha pedido el finiquito.'],
  },
};
