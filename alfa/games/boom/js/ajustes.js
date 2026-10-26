// Fans of Boom · AJUSTES: el nombre del juego para core y TODAS las cifras del juego (física, viento, móviles, tiros, turnos, bonos, mapas).
// Se carga antes de lo común. Cambiar el equilibrio del juego es tocar solo este archivo.
'use strict';
const AJUSTES = {
  id: 'boom',                // para core: la partida en la nube lleva este nombre 
  guardado: 'for-boom-v1',   // la clave de la partida en este navegador (sonido, tipo de control, última partida preparada)
};
const BOOM = {
  paso: 1 / 60,              // segundos de cada paso de la simulación: fijo, para que el mismo tiro dé siempre el mismo resultado
  mundo: { ancho: 2880, alto: 900 },   // el mapa mide tres pantallas de ancho; por debajo del alto no hay nada (vacío)
  gravedad: 900,             // píxeles por segundo al cuadrado
  viento: { max: 24, aceleracion: 4.2, cambio: 9 },   // fuerza 0-24 (negativo = hacia la izquierda), píxeles/s² por punto, y cuánto cambia como mucho cada turno
  velocidadMax: 2000,        // píxeles por segundo a potencia 100: a tope y con el viento máximo EN CONTRA, el tiro cruza el mapa de punta a punta (~3.900 px a 42°; ~2.000 a 70°)
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
  // Los móviles: uno por facción, con su piloto, su vida, su velocidad, sus colores (cuerpo, segundo, brillo) y tres tiros (Tiro 1, Tiro 2 y SS).
  // Regla de la casa: LO QUE MÁS PEGA, MENOS AGUJERO HACE, y cuanto más le afecta el viento, más pega. Cada tiro lleva:
  //   forma (cómo se ve, proyectiles.js), radio (alcance del daño), crater (el agujero), dano, retraso, y si quiere viento (1 = normal, 2 = el doble),
  //   gravedad (1 = normal), multi: { n, abanico } (n a la vez abiertos en abanico de esos grados), carga (cuánto carga el satélite) y efecto:
  //   racimo { n, abre }       se abre en n trozos al llegar a lo más alto (abre = px/s de separación entre el primero y el último)
  //   rebota { veces }         explota y rebota esas veces antes de acabar
  //   fantasma { flota, freno } y taladro { flota, freno }   entran en el suelo y siguen por dentro: allí flotan (flota = empuje hacia arriba,
  //                            en gravedades) y se frenan (freno = cuánta velocidad pierden por segundo), así que hacen una curva y explotan
  //                            al volver a salir del terreno, por donde sea. Cuanto más rápido entran, más hondo bajan y más lejos salen.
  //   combo { veces }          explota varias veces seguidas mientras avanza
  //   parte { n, trozo }       en vuelo, al volver a pulsar, se parte en n que caen (trozo = radio, crater y daño de cada uno)
  //   glitch { salto }         en lo más alto se teletransporta esos píxeles hacia delante
  //   vuelve {}                al primer golpe rebota hacia quien lo tiró y vuelve a explotar
  //   cielo { estilo, x, dano, porCarga, radio, crater }   donde cae, golpes desde el cielo (uno por cada x, relativo); porCarga gasta el satélite
  //   tren { velocidad, alcance }   sale un tren que rueda por el suelo hacia el rival más cercano y explota al llegar
  //   minas { anda }           se queda en el suelo; al empezar tu siguiente turno anda hacia el rival más cercano y explota
  //   barrido { largo, vel, cada, dano, porCarga, radio, crater }   el rayo baja donde cae y arrastra por el suelo hacia delante (gasta el satélite)
  //   pega { dano, radio, crater }   se pega a lo que toca (también a un rival) y explota al empezar tu siguiente turno
  //   muro { ancho, alto }     al caer deja un muro nuevo de terreno (medio ancho y medio alto, en píxeles)
  //   raid { n, ancho, dano, radio, crater }   bomba de humo que marca; al empezar tu siguiente turno pasa un avión y suelta n bombas a lo ancho
  //   cadena { dano, saltos, alcance, baja, radio, crater }   un trueno donde cae y salta al rival más cercano (cada salto pega `baja` veces menos)
  //   empuje { fuerza, alcance }   la explosión empuja lejos a todos los que pille (píxeles, a menos cuanto más lejos)
  //   artilleria { n, ancho, cada, dano, radio, crater }   llamada de artillería: n obuses caen a lo ancho, uno tras otro, desde detrás
  //   zona = alcance que la IA tiene en cuenta para apuntar (si el efecto cubre más que el radio)
  satelite: { max: 3 },      // el satélite de la Antena orbital: UNO por partida para todos los que la lleven (de los dos equipos); cada dardo lo carga y el rayo lo gasta
  moviles: [
    { id: 'tapacubos', nombre: 'Tapacubos', piloto: 'JunkCoon', faccion: 'Animales Locos', nota: 'Tapacubos-bumerán: el viento lo lleva muchísimo, pero pega muchísimo.', vida: 1000, velocidad: 80, colores: ['#8f6a4a', '#9aa0a8', '#ff9a2a'],
      tiros: [{ nombre: 'Tapacubos', forma: 'tapacubos', radio: 34, crater: 26, dano: 400, retraso: 85, viento: 2.6 },
        { nombre: 'Lluvia de chatarra', forma: 'chatarra', radio: 40, crater: 50, dano: 105, retraso: 130, efecto: { tipo: 'racimo', n: 4, abre: 240 } },
        { nombre: 'Tapacubos gigante', forma: 'tapacubos', grande: true, radio: 50, crater: 40, dano: 380, retraso: 250, viento: 2.2, efecto: { tipo: 'vuelve' } }] },
    { id: 'ataud', nombre: 'Ataúd con ruedas', piloto: 'SkullKnight', faccion: 'No-Muertos', nota: 'Calaveras pesadas y huesos que rebotan.', vida: 1080, velocidad: 70, colores: ['#4a3a5a', '#e8e0c8', '#7dff8a'],
      tiros: [{ nombre: 'Calavera pesada', forma: 'calavera', radio: 40, crater: 34, dano: 340, retraso: 75, viento: 1.2 },
        { nombre: 'Huesos saltarines', forma: 'hueso', radio: 42, crater: 44, dano: 105, retraso: 130, multi: { n: 3, abanico: 5 }, efecto: { tipo: 'rebota', veces: 2 } },
        { nombre: 'Calavera fantasma', forma: 'fantasma', radio: 62, crater: 60, dano: 400, retraso: 250, efecto: { tipo: 'fantasma', flota: 2.4, freno: 2.5 } }] },
    { id: 'antena', nombre: 'Antena orbital', piloto: 'TechDroid', faccion: 'Ciberpunks', nota: 'Dardo láser casi sin viento. Cada dardo carga el satélite; el rayo lo gasta.', vida: 1000, velocidad: 82, colores: ['#2a3550', '#7cf0ff', '#ff4bd8'],
      tiros: [{ nombre: 'Dardo láser', forma: 'dardo', radio: 30, crater: 18, dano: 240, retraso: 48, viento: 0.2, carga: 1 },
        { nombre: 'Rayo del satélite', forma: 'dardo', radio: 24, crater: 12, dano: 40, retraso: 140, viento: 0.2, efecto: { tipo: 'cielo', estilo: 'rayo', x: [0], dano: 120, porCarga: 130, radio: 44, crater: 26 } },
        { nombre: 'Barrido orbital', forma: 'dardo', radio: 24, crater: 12, dano: 40, retraso: 250, viento: 0.2, efecto: { tipo: 'barrido', largo: 480, vel: 480, cada: 48, dano: 85, porCarga: 25, radio: 40, crater: 24, zona: 240 } }] },
    { id: 'gatotanque', nombre: 'Gato-tanque', piloto: 'ChonkCat', faccion: 'Memes', nota: 'Bolas de pelo que caen como piedras, un gatito que se pega y un gato gordo que se queda de muro.', vida: 1080, velocidad: 66, colores: ['#ffd24a', '#ff8fb8', '#5b3d8a'],
      tiros: [{ nombre: 'Bola de pelo', forma: 'pelo', radio: 40, crater: 30, dano: 295, retraso: 70, viento: 1.3, gravedad: 1.2 },
        { nombre: 'Gatito pegajoso', forma: 'gatito', radio: 20, crater: 6, dano: 30, retraso: 130, efecto: { tipo: 'pega', dano: 320, radio: 52, crater: 40 } },
        { nombre: 'Gato gordo', forma: 'gatogordo', radio: 70, crater: 14, dano: 380, retraso: 250, viento: 1.1, gravedad: 1.2, efecto: { tipo: 'muro', ancho: 78, alto: 52 } }] },
    { id: 'carroza', nombre: 'Carroza de directo', piloto: 'HypeBeast', faccion: 'Streamers', nota: 'Micros de oro, una raid que llega al turno siguiente y el Hype Train.', vida: 1000, velocidad: 80, colores: ['#7a3ad8', '#ff4bd8', '#ffcb3d'],
      tiros: [{ nombre: 'Micro de oro', forma: 'micro', radio: 42, crater: 34, dano: 290, retraso: 62, viento: 1.1 },
        { nombre: 'Raid', forma: 'humo', radio: 26, crater: 8, dano: 20, retraso: 130, viento: 1, efecto: { tipo: 'raid', n: 6, ancho: 340, dano: 100, radio: 42, crater: 36, zona: 170 } },
        { nombre: 'Hype Train', forma: 'micro', radio: 54, crater: 50, dano: 360, retraso: 250, viento: 1.1, efecto: { tipo: 'tren', velocidad: 330, alcance: 950 } }] },
    { id: 'carro', nombre: 'Carro de guerra', piloto: 'ThunderGod', faccion: 'Héroes', nota: 'Martillo, un rayo que salta de rival en rival y un martillazo que lo empuja todo.', vida: 1020, velocidad: 76, colores: ['#c9a43a', '#3a6ad8', '#fff3b0'],
      tiros: [{ nombre: 'Martillo', forma: 'martillo', radio: 44, crater: 40, dano: 280, retraso: 60, viento: 0.8 },
        { nombre: 'Rayo en cadena', forma: 'runa', radio: 28, crater: 18, dano: 50, retraso: 140, viento: 0.8, efecto: { tipo: 'cadena', dano: 170, saltos: 2, alcance: 520, baja: 0.65, radio: 40, crater: 22, zona: 260 } },
        { nombre: 'Martillazo', forma: 'martillo', grande: true, radio: 56, crater: 30, dano: 280, retraso: 250, viento: 0.8, efecto: { tipo: 'empuje', fuerza: 300, alcance: 190 } }] },
    { id: 'silla', nombre: 'Silla gamer', piloto: 'RageQuitter', faccion: 'Comunidad Gamer', nota: 'Teclas rotas, combos y un mando que se parte en el aire.', vida: 1000, velocidad: 80, colores: ['#2a2a3a', '#ff3a5a', '#3aff9a'],
      tiros: [{ nombre: 'Tecla rota', forma: 'tecla', radio: 42, crater: 34, dano: 300, retraso: 65 },
        { nombre: 'Combo', forma: 'tecla', radio: 36, crater: 32, dano: 120, retraso: 135, viento: 0.9, efecto: { tipo: 'combo', veces: 3 } },
        { nombre: 'Rage quit', forma: 'mando', radio: 50, crater: 44, dano: 340, retraso: 250, efecto: { tipo: 'parte', n: 5, trozo: { forma: 'tecla', radio: 40, crater: 34, dano: 150 } } }] },
    { id: 'drakkar', nombre: 'Drakkar beta', piloto: 'VikingoPerdido', faccion: 'Olvidados', nota: 'Hachas que el viento lleva y un taladro que abre el suelo.', vida: 1000, velocidad: 76, colores: ['#8a5a3c', '#d84a3a', '#e8e0c8'],
      tiros: [{ nombre: 'Hacha', forma: 'hacha', radio: 36, crater: 28, dano: 360, retraso: 80, viento: 1.6 },
        { nombre: 'Taladro', forma: 'taladro', radio: 70, crater: 90, dano: 150, retraso: 140, viento: 0.8, efecto: { tipo: 'taladro', flota: 3, freno: 4 } },
        { nombre: 'Glitch', forma: 'hacha', radio: 56, crater: 48, dano: 400, retraso: 250, viento: 1.2, efecto: { tipo: 'glitch', salto: 380 } }] },
    { id: 'grua', nombre: 'Grúa de rodaje', piloto: 'LaDirectora', faccion: 'Cultura Pop', nota: 'Claquetas, extras que andan hacia el rival y una llamada de artillería: ¡Acción!', vida: 1000, velocidad: 74, colores: ['#3a3a44', '#ffcb3d', '#ff4b5c'],
      tiros: [{ nombre: 'Claqueta', forma: 'claqueta', radio: 42, crater: 34, dano: 275, retraso: 58 },
        { nombre: 'Extras', forma: 'extra', radio: 40, crater: 34, dano: 105, retraso: 135, multi: { n: 3, abanico: 7 }, efecto: { tipo: 'minas', anda: 260 } },
        { nombre: '¡Acción!', forma: 'claqueta', radio: 24, crater: 12, dano: 30, retraso: 250, efecto: { tipo: 'artilleria', n: 7, ancho: 440, cada: 0.22, dano: 115, radio: 44, crater: 34, zona: 220 } }] },
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
  ia: { candidatos: 70, error: [44, 26, 12], pausa: 0.9 },   // tiros que simula, error en píxeles según el nivel (0 fácil, 1 normal, 2 difícil) y pausa de pensar
  nombresIA: ['Phony', 'IAhorro', 'Lola', 'Microblizz'],
  // Los mapas: uno por cada mundo de las campañas de Rumble. Aquí, lo que cambia la partida (forma del suelo, huecos, cuevas) y sus colores;
  // su fondo, la textura del suelo, los objetos y el ambiente se dibujan en escenarios-*.js con el mismo id.
  mapas: [
    { id: 'oficina', nombre: 'Oficinas de Microblizz', nota: 'Moqueta, mesas y una fuente de agua que nadie cambia desde 2009.', cielo: ['#9fdcff', '#e6f6ff'], roca: ['#cdb89a', '#5e4a66'], hierba: '#5a6fa8', borde: '#2a1a30', base: 0.6,
      olas: [[150, 2.1], [90, 5.3], [45, 11.7]], huecos: [], cuevas: 0 },
    { id: 'madriguera', nombre: 'La Madriguera', nota: 'Donde los Animales Locos guardan todo lo que encuentran. Todo.', cielo: ['#ff8f5a', '#ffe2b0'], roca: ['#b0763f', '#4e2e1c'], hierba: '#a8c83a', borde: '#3a2010', base: 0.66,
      olas: [[190, 1.6], [110, 4.1], [60, 9.3]], huecos: [[0.5, 110]], cuevas: 7 },
    { id: 'cementerio', nombre: 'Cementerio de juegos', nota: 'Aquí descansan los juegos cancelados. No del todo.', cielo: ['#1a1038', '#3e6a78'], roca: ['#544258', '#1c1222'], hierba: '#5a8a3e', borde: '#120a18', base: 0.62,
      olas: [[170, 1.8], [80, 4.7], [40, 12.3]], huecos: [[0.36, 70]], cuevas: 4 },
    { id: 'plato', nombre: 'Plató abandonado', nota: 'El plató de una serie que no vio nadie. Los focos siguen encendidos.', cielo: ['#1e1426', '#4e3036'], roca: ['#8e8078', '#2e2430'], hierba: '#c47c3e', borde: '#1a1016', base: 0.62,
      olas: [[70, 1.3], [60, 3.2], [22, 8.1]], huecos: [[0.62, 90]], cuevas: 3 },
    { id: 'olimpo', nombre: 'Olimpo abandonado', nota: 'Los dioses se fueron de vacaciones y dejaron las columnas sin barrer.', cielo: ['#4fb2ff', '#fff0bc'], roca: ['#f4eee2', '#a49686'], hierba: '#7ac24a', borde: '#3a2e3a', base: 0.64,
      olas: [[220, 1.4], [90, 3.9], [30, 10.1]], huecos: [[0.3, 90], [0.7, 90]], cuevas: 2 },
    { id: 'neon', nombre: 'Sector Neón', nota: 'Lluvia, carteles que parpadean y una máquina que solo vende cables.', cielo: ['#0c0826', '#4a1858'], roca: ['#3e4460', '#131424'], hierba: '#5a6074', borde: '#0a0814', base: 0.6,
      olas: [[120, 2.6], [70, 6.1], [25, 14]], huecos: [[0.5, 80]], cuevas: 3 },
    { id: 'lan', nombre: 'La LAN Party', nota: 'Cables, pizza fría y cuatrocientos ordenadores con lucecitas.', cielo: ['#100a1e', '#2e1846'], roca: ['#b07a44', '#4a2e22'], hierba: '#2c2c3a', borde: '#140c18', base: 0.63,
      olas: [[140, 2.2], [80, 4.4], [40, 10.6]], huecos: [], cuevas: 5 },
    { id: 'sotano', nombre: 'El Sótano de Microblizz', nota: 'Las cajas de lo que Microblizz no quiere que veas. Y una rata.', cielo: ['#241c24', '#4e3a30'], roca: ['#8e6c5a', '#36261f'], hierba: '#8c8a88', borde: '#1a1012', base: 0.58,
      olas: [[160, 1.9], [100, 4.8], [50, 9.9]], huecos: [[0.44, 80]], cuevas: 6 },
  ],
  frases: {
    alto: ['Eso ha subido más que las acciones de Phony.', 'Microblizz ha medido el ángulo con el dedo.', 'Ese tiro ha visto la nube de verdad.'],
    cielo: ['Ha salido de la pantalla y ha vuelto con recibo.', 'Phony pregunta si eso cuenta como hora extra.'],
    caida: ['Cavar también es una forma de trabajar.', 'El suelo ha pedido el finiquito.'],
  },
};
