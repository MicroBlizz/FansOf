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
  caos: { max: 100, porTiro: 12, porDano: 0.05 },   // el medidor de CAOS: sube con cada tiro propio y con el daño recibido; lleno, se puede lanzar el Tiro Especial (SS)
  // Los móviles: cada uno con su vida, velocidad y tres tiros (Tiro 1, Tiro 2 y SS). Un tiro tiene radio y daño del agujero, retraso extra y,
  // si quiere, ignoraViento (no le afecta), viento (cuánto le afecta: 2 = el doble), gravedad (1 = normal) o multi: { n, abanico } (n proyectiles abiertos en abanico de ese número de grados).
  moviles: [
    { id: 'mechavaca', nombre: 'MechaVaca', nota: 'Tanque pesado: aguanta y pega fuerte.', vida: 1120, velocidad: 60, acento: '#f4f4f4',
      tiros: [{ nombre: 'Tiro 1', radio: 46, dano: 250, retraso: 70 }, { nombre: 'Tiro 2', radio: 70, dano: 350, retraso: 150 }, { nombre: 'Leche Fría', radio: 115, dano: 430, retraso: 260 }] },
    { id: 'skeletoncrew', nombre: 'SkeletonCrew', nota: 'Cava: sus agujeros son enormes, el daño es justo.', vida: 1000, velocidad: 78, acento: '#e8e0c8',
      tiros: [{ nombre: 'Tiro 1', radio: 52, dano: 175, retraso: 60 }, { nombre: 'Tiro 2', radio: 74, dano: 210, retraso: 130 }, { nombre: 'Fosa Común', radio: 70, dano: 190, retraso: 240, multi: { n: 3, abanico: 9 } }] },
    { id: 'neonsniper', nombre: 'NeonSniper', nota: 'Frágil, pero el viento no le afecta.', vida: 930, velocidad: 82, acento: '#7cf0ff',
      tiros: [{ nombre: 'Tiro 1', radio: 32, dano: 340, retraso: 70, ignoraViento: true }, { nombre: 'Tiro 2', radio: 42, dano: 430, retraso: 170, ignoraViento: true }, { nombre: 'Láser', radio: 56, dano: 560, retraso: 260, ignoraViento: true }] },
    { id: 'chonkcat', nombre: 'ChonkCat', nota: 'Su segundo tiro lanza tres a la vez.', vida: 1050, velocidad: 72, acento: '#ffd24a',
      tiros: [{ nombre: 'Tiro 1', radio: 48, dano: 280, retraso: 60 }, { nombre: 'Tiro 2', radio: 40, dano: 190, retraso: 140, multi: { n: 3, abanico: 6 } }, { nombre: 'Lluvia de bolas', radio: 38, dano: 150, retraso: 250, multi: { n: 5, abanico: 6 } }] },
    { id: 'junkcoon', nombre: 'JunkCoon', nota: 'Vive del viento: le afecta el doble, para bien o para mal.', vida: 1000, velocidad: 80, acento: '#9aa0a8',
      tiros: [{ nombre: 'Tiro 1', radio: 46, dano: 270, retraso: 60, viento: 2 }, { nombre: 'Tiro 2', radio: 60, dano: 360, retraso: 140, viento: 2.4 }, { nombre: 'Bumerán de chatarra', radio: 50, dano: 220, retraso: 240, viento: 2, multi: { n: 3, abanico: 4 } }] },
    { id: 'boombeaver', nombre: 'BoomBeaver', nota: 'Misiles que caen menos: tiros rectos y largos.', vida: 920, velocidad: 76, acento: '#c87a3a',
      tiros: [{ nombre: 'Tiro 1', radio: 40, dano: 190, retraso: 60, gravedad: 0.85 }, { nombre: 'Tiro 2', radio: 50, dano: 270, retraso: 140, gravedad: 0.75 }, { nombre: 'Presa reventada', radio: 100, dano: 400, retraso: 260, gravedad: 0.75 }] },
  ],
  // Eventos de mapa: uno cada 3-5 turnos, dura `duracion` turnos y se ve antes de tirar. Cambian la física del proyectil o el daño.
  eventos: { cada: [3, 5], duracion: 2, lista: [
    { id: 'confusion', nombre: 'Confusión', nota: 'El tiro se va de lado a lado.', onda: 150 },
    { id: 'hype', nombre: 'Tren del Hype', nota: 'Empuja los tiros hacia arriba.', ay: -300 },
    { id: 'donaciones', nombre: 'Lluvia de donaciones', nota: 'Empuja los tiros de lado.', ax: 170 },
    { id: 'review', nombre: 'Review bombing', nota: 'Todo el daño vale más.', danoMult: 1.3 },
    { id: 'actualizacion', nombre: 'Actualización obligatoria', nota: 'Durante dos turnos no hay viento.', sinViento: true },
  ] },
  // Objetos: gratis, uno de cada por partida y móvil. Se usan antes de tirar (menos Doble, que cuenta en el siguiente tiro) y cuestan retraso.
  objetos: { inicial: ['doble', 'botiquin', 'teletransporte', 'bungee'], lista: {
    doble: { nombre: 'Doble', nota: 'Tu próximo tiro sale dos veces.', retraso: 40 },
    botiquin: { nombre: 'Botiquín', nota: 'Recuperas vida.', cura: 300, retraso: 60 },
    teletransporte: { nombre: 'Teletransporte', nota: 'Saltas a otro punto cercano del suelo.', alcance: 650, retraso: 110 },
    bungee: { nombre: 'Bungee', nota: 'Te salva una vez de caer al vacío.', retraso: 30 },
  } },
  // Rangos: puntos desde 1.000 (Pollito). Solo en partidas con rango (una persona contra una IA, 1 contra 1): la IA se ajusta al rango del jugador.
  rangos: { inicial: 1000, gana: 30, pierde: 20, dificultad: [0.7, 1, 1.4],   // puntos por ganar/perder, multiplicados por la dificultad de la IA (fácil, normal, difícil)
    lista: [['Pollito', 0], ['Becario', 1100], ['Becario con contrato', 1250], ['Junior', 1450], ['Senior', 1700], ['Lead', 2000], ['Director', 2400], ['Vicepresidente', 2900], ['CEO', 3500]],
    nivelIA: [[0, 0], [3, 1], [6, 2]] },   // desde qué posición de rango la IA sube de nivel
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
