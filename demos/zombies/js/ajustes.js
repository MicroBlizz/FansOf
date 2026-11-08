// Fans of Zombies · AJUSTES (dominio): todas las cifras del juego en un sitio. El reloj (1 segundo real = 2 minutos del juego), las
// necesidades, los ruidos, las armas, los animales, los fans zombificados, los parches de Microblizz y las dificultades. Las heridas y
// construir están en js/ajustes-casa.js (se carga antes y se mezcla aquí).
// Nada de pantalla aquí: lo leen las reglas (js/partida.js y compañía) y los tests.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
ZOM.AJ = Object.freeze({
  ...ZOM.AJ_CASA,                                          // las heridas, construir y la casa (js/ajustes-casa.js)
  version: '0.14.1',
  reloj: { minPorSeg: 2, minDormido: 40, empieza: 8 * 60, amanece: 7 * 60, anochece: 20 * 60 },
  // cuánto baja cada necesidad por hora del juego (sobre 100), lo que quita la vida si llega a 0 y los avisos
  necesidades: { hambre: 2.6, sed: 4.0, sueno: 3.2, recuperaSueno: 14, vidaSiVacia: 6, aviso: 35, infeccion: 3, curaSola: 0.6 },
  jugador: { vida: 100, radio: 0.5, vel: 4.2, corre: 6.6, agacha: 2.2, pasoHuella: 0.9, huellas: 60, vidaHuella: 240 },
  // radio del ruido (en metros) de cada cosa que haces
  ruido: { andar: 4, correr: 10, abrirLata: 5, registrar: 4, golpe: 3, escopeta: 30, pistola: 18, grito: 18, alarma: 34, puerta: 2, martillo: 12, dura: 1.2, duraAlarma: 25 },
  // puertas y ventanas: su vida, el ruido al romperse; las barricadas (hasta 3 tablas, cada una con su vida, 2 clavos y 2 s);
  // busca = metros a los que un fan que choca encuentra un hueco; alcance y cadencia de sus golpes al hueco
  huecos: { puerta: { vida: 120, ruidoRotura: 14 }, ventana: { vida: 12, ruidoRotura: 16 }, barricada: { max: 3, vidaTabla: 60, clavos: 2, tiempo: 2 }, busca: 7, alcance: 1.5, cadencia: 1.0 },
  // aguante (sobre 100): lo que cuesta cada cosa y lo que se recupera por segundo; a 0 estás agotado hasta llegar a «salir»
  aguante: { max: 100, correr: 16, recupera: 8, salir: 30, agotado: { dano: 0.6, cadencia: 1.6 } },
  // retroceso = metros que sale despedido el zombi; aturde = segundos sin moverse ni morder
  // dur = cuántos golpes (o disparos) aguanta antes de romperse; uno = solo da al más cercano; espalda = por la espalda de un fan que
  // no te ha visto, lo tumba de un golpe. El orden es el de las teclas 1 a 6
  armas: {
    escopeta: { n: 'ESCOPETA', alcance: 10, cono: 0.5, dano: 70, cadencia: 0.95, ruido: 'escopeta', municion: 'cartuchos', aguante: 0, retroceso: 1.4, aturde: 0.5, dur: 60 },
    pistola: { n: 'PISTOLA', alcance: 12, cono: 0.35, dano: 45, cadencia: 0.4, ruido: 'pistola', municion: 'balas', aguante: 0, retroceso: 0.6, aturde: 0.3, dur: 80, uno: true },
    palanca: { n: 'PALANCA', alcance: 1.9, cono: 1.2, dano: 34, cadencia: 0.55, ruido: 'golpe', municion: null, aguante: 10, retroceso: 0.8, aturde: 0.6, dur: 80 },
    bate: { n: 'BATE', alcance: 2.1, cono: 1.2, dano: 30, cadencia: 0.6, ruido: 'golpe', municion: null, aguante: 9, retroceso: 1.3, aturde: 0.9, dur: 40 },
    hacha: { n: 'HACHA', alcance: 1.9, cono: 0.9, dano: 58, cadencia: 0.85, ruido: 'golpe', municion: null, aguante: 15, retroceso: 0.5, aturde: 0.4, dur: 30 },
    cuchillo: { n: 'CUCHILLO', alcance: 1.3, cono: 0.8, dano: 22, cadencia: 0.35, ruido: 'golpe', municion: null, aguante: 5, retroceso: 0.2, aturde: 0.2, dur: 50, uno: true, espalda: true },
  },
  // el empujón (botón derecho o R): no hace daño ni ruido, aparta y tumba un rato a los que tienes delante
  empujon: { alcance: 1.7, cono: 1.1, retroceso: 1.8, derriba: 1.6, cadencia: 0.6, aguante: 14, ruido: 1.5 },
  // las cosas: su nombre, su forma en la mochila Tetris (X = casilla), cuántas se apilan (max) y lo que hacen al usarlas (usa)
  objetos: {
    verdura: { n: 'VERDURA', forma: ['X'], usa: { hambre: 18, sed: 4 } },
    gasolina: { n: 'BIDÓN DE GASOLINA', forma: ['XX', 'XX'] },
    escopeta: { n: 'ESCOPETA', forma: ['XXXX', '.X..'], arma: true },
    palanca: { n: 'PALANCA', forma: ['XXX'], arma: true },
    pistola: { n: 'PISTOLA', forma: ['XX', 'X.'], arma: true },
    bate: { n: 'BATE', forma: ['XXX'], arma: true },
    hacha: { n: 'HACHA', forma: ['XX', '.X', '.X'], arma: true },
    cuchillo: { n: 'CUCHILLO', forma: ['XX'], arma: true },
    balas: { n: 'BALAS', forma: ['X'], max: 30 },
    judias: { n: 'JUDÍAS', forma: ['X'], usa: { hambre: 35, ruido: 'abrirLata' } },
    chocolatina: { n: 'CHOCOLATINA', forma: ['X'], max: 2, usa: { hambre: 15 } },
    agua: { n: 'AGUA', forma: ['X', 'X'], usa: { sed: 45 }, deja: 'botella' },
    botella: { n: 'BOTELLA VACÍA', forma: ['X', 'X'] },
    refresco: { n: 'REFRESCO', forma: ['X'], usa: { sed: 20, sueno: 10 } },
    venda: { n: 'VENDA', forma: ['X'], max: 3, cura: 'vendar' },   // las curas (cura) se ponen en una herida: js/heridas.js
    desinfectante: { n: 'DESINFECTANTE', forma: ['X', 'X'], max: 3, cura: 'desinfectar' },
    aguja: { n: 'AGUJA E HILO', forma: ['X'], max: 4, cura: 'puntos' },
    tablilla: { n: 'TABLILLA', forma: ['X', 'X', 'X'], cura: 'tablilla' },
    analgesico: { n: 'ANALGÉSICOS', forma: ['X'], max: 6, usa: { analgesico: true } },
    antibiotico: { n: 'ANTIBIÓTICOS', forma: ['X'], max: 3, usa: { infeccion: -40 } },
    // las piezas de coche (pieza = tienen estado, en «dur»; js/coches-piezas.js)
    llaveInglesa: { n: 'LLAVE INGLESA', forma: ['X', 'X'] },
    rueda: { n: 'RUEDA', forma: ['XX', 'XX'], pieza: true },
    bateria: { n: 'BATERÍA', forma: ['XX'], pieza: true },
    frenos: { n: 'PASTILLAS DE FRENO', forma: ['X'], pieza: true },
    parabrisas: { n: 'PARABRISAS', forma: ['XXX', 'XXX'], pieza: true },
    piezasMotor: { n: 'PIEZAS DE MOTOR', forma: ['X'], max: 4 },
    cartuchos: { n: 'CARTUCHOS', forma: ['X'], max: 12 },
    tablas: { n: 'TABLAS', forma: ['XXX'], max: 3 },
    clavos: { n: 'CLAVOS', forma: ['X'], max: 20 },
    martillo: { n: 'MARTILLO', forma: ['XX', 'X.'] },
    lampara: { n: 'LÁMPARA', forma: ['X', 'X'] },          // se pone con CONSTRUIR (js/construir.js)
    tela: { n: 'TELA', forma: ['X'], max: 4 },
    carne: { n: 'CARNE CRUDA', forma: ['X'], usa: { hambre: 20, vida: -10, sed: -15, mal: true } },
    podrida: { n: 'CARNE PODRIDA', forma: ['X'], usa: { hambre: 5, vida: -25, mal: true } },
    filete: { n: 'FILETE', forma: ['X'], usa: { hambre: 50 }, cocinado: true },
    guiso: { n: 'GUISO', forma: ['X'], usa: { hambre: 45, sed: 20 }, cocinado: true },
    // la ropa (AJ.ropa dice qué hace cada prenda) y las mochilas (AJ.mochilas): se ponen con clic derecho
    gorro: { n: 'GORRO DE LANA', forma: ['X'] },
    casco: { n: 'CASCO DE MOTO', forma: ['XX', 'XX'] },
    abrigo: { n: 'ABRIGO', forma: ['XX', 'XX'] },
    cuero: { n: 'CHAQUETA DE CUERO', forma: ['XX', 'XX'] },
    chubasquero: { n: 'CHUBASQUERO', forma: ['XX', 'X.'] },
    vaqueros: { n: 'VAQUEROS', forma: ['X', 'X'] },
    chandal: { n: 'PANTALÓN DE CHÁNDAL', forma: ['X', 'X'] },
    botasNieve: { n: 'BOTAS DE NIEVE', forma: ['XX'] },
    zapatillas: { n: 'ZAPATILLAS', forma: ['XX'] },
    botasGoma: { n: 'BOTAS DE GOMA', forma: ['XX'] },
    mochilaP: { n: 'MOCHILA PEQUEÑA', forma: ['XX', 'XX'] },
    mochilaM: { n: 'MOCHILA DE EXCURSIÓN', forma: ['XX', 'XX', 'XX'] },
    mochilaG: { n: 'MOCHILA DE MUDANZA', forma: ['XXX', 'XXX', 'XXX'] },
  },
  // la ropa (ADR 079): en qué hueco va, cuánto aguanta (cada mordisco le quita «gastaMordisco» a todo lo que llevas puesto) y lo que hace.
  // frio = parte del hambre extra del invierno que te quita (sumado, hasta 1); calor = sed extra en verano; dano = menos daño de los
  // mordiscos en la parte que tapa; para = probabilidad de que un mordisco ahí no deje herida; infeccion = menos riesgo de infección ahí; lluvia = tus ruidos se oyen menos cuando llueve; huellas = menos huellas;
  // pasos = pasos más silenciosos; correr = correr gasta menos aguante; barro = en primavera correr no cansa más
  ropa: {
    gorro: { hueco: 'cabeza', dur: 60, frio: 0.4, para: 0.1, color: 0xc8282e },
    casco: { hueco: 'cabeza', dur: 90, dano: 0.15, para: 0.5, color: 0x2a2e36 },
    abrigo: { hueco: 'cuerpo', dur: 70, frio: 0.7, calor: 0.25, para: 0.3, color: 0x6a5a3a },
    cuero: { hueco: 'cuerpo', dur: 90, infeccion: 0.4, dano: 0.1, para: 0.5, color: 0x3a2418 },
    chubasquero: { hueco: 'cuerpo', dur: 50, lluvia: 0.2, para: 0.1, color: 0xe8c020 },
    vaqueros: { hueco: 'piernas', dur: 70, dano: 0.1, para: 0.3, color: 0x2a4a7a },
    chandal: { hueco: 'piernas', dur: 50, correr: 0.25, para: 0.1, color: 0x3a3e48 },
    botasNieve: { hueco: 'pies', dur: 70, huellas: 0.5, color: 0x5a3a24 },
    zapatillas: { hueco: 'pies', dur: 50, pasos: 0.25, color: 0xe8e8e8 },
    botasGoma: { hueco: 'pies', dur: 80, barro: true, color: 0x2a6a3a },
  },
  vestir: { huecos: ['cabeza', 'cuerpo', 'piernas', 'pies'], gastaMordisco: 6, coser: 30, danoMax: 0.6 },
  // las mochilas (como en Ratkov): su rejilla y si pesa (vel multiplica lo que andas). Además siempre llevas la riñonera (2 x 2) y
  // tres bolsillos (cada uno, una cosa de una casilla). JunkCoon lleva una fila más en la mochila
  mochilas: { mochilaP: { w: 4, h: 4 }, mochilaM: { w: 5, h: 5 }, mochilaG: { w: 6, h: 7, vel: 0.9 } },
  mochilaInicio: 'mochilaP', rinonera: { w: 2, h: 2 }, bolsillos: { w: 3, h: 1 },
  // las estaciones (ADR 076): días que dura cada una, el orden (empieza en invierno) y lo que cambia en cada una: amanecer y anochecer
  // (minutos), hambre y sed (multiplican), huellas en la nieve, ruido (lo tapa la lluvia), pasos (las hojas crujen), lo que ven y corren
  // los fans, la probabilidad de que la carne salga podrida y el barro (correr cansa más sin botas de goma)
  estaciones: { dias: 7, orden: ['invierno', 'primavera', 'verano', 'otono'],
    invierno: { n: 'INVIERNO', amanece: 7 * 60 + 30, anochece: 18 * 60 + 30, hambre: 1.25, sed: 1, huellas: true, ruido: 1, pasos: 1, vistaFans: 1, velFans: 0.9, pudre: 0 },
    primavera: { n: 'PRIMAVERA', amanece: 7 * 60, anochece: 20 * 60, hambre: 1, sed: 1, huellas: false, ruido: 0.75, pasos: 1, vistaFans: 0.9, velFans: 1, pudre: 0.1, barro: 1.15 },
    verano: { n: 'VERANO', amanece: 6 * 60, anochece: 21 * 60 + 30, hambre: 0.9, sed: 1.5, huellas: false, ruido: 1, pasos: 1, vistaFans: 1.1, velFans: 1.15, pudre: 0.4 },
    otono: { n: 'OTOÑO', amanece: 7 * 60 + 30, anochece: 19 * 60, hambre: 1, sed: 1, huellas: false, ruido: 1, pasos: 1.3, vistaFans: 0.7, velFans: 1, pudre: 0.1 } },
  // los coches (ADR 075): velocidades en m/s (máxima ~65 km/h), giro en rad/s, gasolina de 0 a 1 (consumo por metro), daño de 0 a 100,
  // atropello = daño por m/s, la llave (en la guantera o en una casa cercana) y el ruido del motor
  coches: { radio: 1.2, alcance: 3, acelera: 9, frena: 14, roce: 0.5, maxima: 18, atras: 5, giro: 2.2, consumo: 0.0006, bidon: 0.5,
    gasInicial: 0.35, danoChoque: 1.6, atropellaDesde: 3, atropello: 9, ruido: 18, ruidoVel: 1.2,
    llaveGuantera: 0.45, llaveEnCasa: { armario: 0.15, cocina: 0.15, nevera: 0.05, taquilla: 0.3 }, llaveRadio: 90, maletero: 24,
    // las piezas (ADR 083): cuánto salen gastadas, lo que corre con el motor a 0 (motorMin) y con una rueda pinchada, lo que frena con
    // los frenos a 0, lo que gasta arrancar, por debajo de qué motor falla al arrancar (y cuánto), con qué cristales te muerden, a qué
    // velocidad (m/s) se va «despacio», la batería que carga conducir y gastan los faros (por hora), lo que se gasta una pieza al
    // quitarla, cada cuánto motor sale una pieza de motor, lo que arregla una, y el alcance y el ángulo de los faros
    piezas: { desgasteInicial: 60, pinchada: 0.6, motorMin: 0.4, frenosMin: 0.3, arranque: 3, motorFalla: 30, fallaArranque: 0.5, cristalRoto: 30, frenosAviso: 30, despacio: 3, carga: 20, farosGasta: 28,
      gastaQuitar: 15, porPieza: 25, repara: 20, farosAlcance: 22, farosCono: 0.5 } },
  // los supervivientes (ADR 074): la probabilidad de que un trozo tenga a alguien atrapado, los fans de guardia, su oficio por animal y lo
  // de cada oficio (daño y curas por segundo; la cocina, a partir de qué hora y qué deja; el vigía, a qué distancia y cada cuántos minutos)
  rescates: { prob: 0.08, guardia: 4, vida: 100, alcance: 2.2, danoFans: 6,
    oficios: { bunny: 'vigia', fox: 'vigia', squirrel: 'carpintera', junkcoon: 'cocinera', meercat: 'medica' },
    vigia: { radio: 20, cada: 90, dano: 30 }, cocina: { hora: 8 * 60, deja: [['guiso', 1], ['agua', 1]], tope: 4 }, medica: { vida: 1.5, infeccion: 0.6 } },
  // el mundo por trozos (ADR 073): alrededor del distrito hecho a mano (centro) se generan trozos de 64 m. ox/oz alinean las calles de
  // los trozos con la carretera de Ratkov (z = 8) y la calle del barrio (x = -146). tipos: lo que sale (por bloques de 2 x 2 trozos);
  // fans: los que hay en cada trozo la primera vez; carga: cuántos trozos alrededor de ti se dibujan (1 = 3 x 3)
  trozos: { lado: 64, ox: -178, oz: -24, centro: { x0: -208, x1: 82, z0: -62, z1: 188 }, carga: 1, descarga: 2, lejosDeTi: 18,
    tipos: { barrio: 4, bosque: 3, granja: 2, poligono: 2, comercial: 1.5 },
    fans: { barrio: 9, comercial: 8, poligono: 6, granja: 4, bosque: 3 },
    reparto: { poligono: { fan: 6, bot: 5, troll: 1, ballena: 0.5 }, bosque: { fan: 6, speedrunner: 4, streamer: 1 }, granja: { fan: 8, speedrunner: 2, ballena: 1 } } },
  // las habilidades: los umbrales de experiencia de cada nivel (0 a 10), lo que da cada acción y lo que mejora cada nivel
  habilidades: {
    niveles: [0, 10, 25, 45, 70, 100, 140, 190, 250, 320, 400],
    xp: { golpe: 1, disparo: 1, paso: 0.25, despide: 4, tabla: 4, desmonta: 3, fuego: 5, pieza: 3, repara: 4, obra: 6 },
    efecto: { pelea: { dano: 0.05, aguante: 0.04 }, disparo: { dano: 0.05 }, sigilo: { ruido: 0.05, vista: 0.04 }, carpinteria: { tiempo: 0.06 }, cocina: { nutre: 0.08 }, mecanica: { cuida: 0.08, arregla: 0.1 } },
  },
  // lo que sale al registrar (peso de cada cosa), cuántas cosas como mucho y cuántos cartuchos trae cada hallazgo.
  // porTipo: lo que hay en cada clase de sitio (lo demás usa «cosas»). En la nevera, tras el corte de luz, la carne sale podrida
  botin: { cosas: { desinfectante: 0.3, analgesico: 0.4, gorro: 0.3, zapatillas: 0.2, vaqueros: 0.2, botasNieve: 0.2, mochilaM: 0.1, judias: 4, chocolatina: 3, agua: 3, refresco: 2, venda: 2, cartuchos: 3, tablas: 3, clavos: 3, martillo: 0.5, tela: 2, botella: 1, balas: 1.2, pistola: 0.3, bate: 0.6, hacha: 0.3, cuchillo: 0.5, nada: 3 }, maximo: 3, cartuchos: 4, clavos: 4, balas: 8, tiempo: 1.4,
    porTipo: {
      nevera: { carne: 5, agua: 3, refresco: 2, judias: 1, nada: 2 },
      armario: { lampara: 0.3, aguja: 0.5, gorro: 0.6, abrigo: 0.5, vaqueros: 0.6, chandal: 0.5, zapatillas: 0.4, chubasquero: 0.3, cuero: 0.15, mochilaM: 0.15, tela: 5, venda: 1, clavos: 2, tablas: 1, cartuchos: 1, bate: 0.6, balas: 0.5, nada: 2 },
      cocina: { judias: 4, chocolatina: 2, botella: 3, agua: 1, cuchillo: 1.2, nada: 2 },
      basura: { tela: 1, botella: 3, chocolatina: 1, nada: 5 },
      fuego: {},
      estanteria: { piezasMotor: 0.6, bateria: 0.3, mochilaG: 0.2, botasGoma: 0.2, gasolina: 0.6, tablas: 3, clavos: 3, martillo: 1, palanca: 0.6, hacha: 0.5, tela: 1, nada: 2 },
      super: { lampara: 0.5, analgesico: 1, desinfectante: 1, gorro: 0.4, zapatillas: 0.3, judias: 5, chocolatina: 4, agua: 4, refresco: 3, botella: 1, nada: 2 },
      gasolinera: { chubasquero: 0.3, chocolatina: 4, refresco: 4, agua: 2, gasolina: 3, nada: 2 },
      ferreteria: { lampara: 0.6, llaveInglesa: 1.5, frenos: 0.6, piezasMotor: 0.5, botasGoma: 0.6, chubasquero: 0.5, gasolina: 1, tablas: 4, clavos: 4, martillo: 1.5, hacha: 1, palanca: 0.8, cuchillo: 0.5, nada: 1 },
      farmacia: { desinfectante: 3, aguja: 2, analgesico: 3, antibiotico: 0.6, venda: 6, tela: 2, nada: 2 },
      armeria: { balas: 4, cartuchos: 3, pistola: 1.2, escopeta: 0.4, nada: 1 },
      taquilla: { llaveInglesa: 0.2, analgesico: 0.5, chandal: 0.6, zapatillas: 0.6, mochilaM: 0.3, casco: 0.2, balas: 2, venda: 1, chocolatina: 1, cuchillo: 0.5, nada: 3 },
      pupitre: { mochilaP: 0.4, mochilaM: 0.2, gorro: 0.3, chocolatina: 3, refresco: 2, tela: 1, nada: 4 },
      escritorio: { analgesico: 0.5, chocolatina: 2, refresco: 2, balas: 0.6, cuchillo: 0.3, tela: 1, venda: 0.5, nada: 3 },
      cajaFuerte: { antibiotico: 1, mochilaG: 0.4, balas: 4, cartuchos: 4, pistola: 1, venda: 3, escopeta: 0.5, hacha: 0.5, nada: 0.5 },
      maletin: { antibiotico: 1, cuero: 0.5, balas: 3, cartuchos: 3, escopeta: 1, pistola: 1, hacha: 1, venda: 2, chocolatina: 1 },
      maquina: { chocolatina: 3, refresco: 3, nada: 2 },
      maletero: { gasolina: 1.5, rueda: 0.6, llaveInglesa: 0.5, bateria: 0.2, tablas: 1, tela: 1, agua: 1, cartuchos: 0.5, nada: 2 },
      coche: { llaveInglesa: 0.3, casco: 0.2, cuero: 0.15, mochilaM: 0.2, gasolina: 1, chocolatina: 1, refresco: 1, agua: 1, cartuchos: 0.5, nada: 2 },
      huerto_invierno: { nada: 1 }, huerto_primavera: { verdura: 4, nada: 2 }, huerto_verano: { verdura: 5, agua: 1, nada: 1 }, huerto_otono: { verdura: 2, carne: 1.5, nada: 3 },
      granero: { botasGoma: 0.6, botasNieve: 0.4, mochilaG: 0.3, gasolina: 1, tela: 2, hacha: 0.8, tablas: 2, clavos: 2, judias: 2, nada: 2 },
    } },
  // fabricar: con qué y dónde (null = en cualquier sitio; 'fuego' = junto a un bidón con fuego o en la cocina de una casa con luz)
  recetas: [
    { id: 'venda', sale: ['venda', 1], con: [['tela', 2]], donde: null },
    { id: 'gorro', sale: ['gorro', 1], con: [['tela', 2]], donde: null },
    { id: 'tablilla', sale: ['tablilla', 1], con: [['tablas', 2], ['tela', 1]], donde: null },
    { id: 'filete', sale: ['filete', 1], con: [['carne', 1]], donde: 'fuego' },
    { id: 'guiso', sale: ['guiso', 1], con: [['judias', 1], ['agua', 1]], donde: 'fuego', deja: ['botella', 1] },
  ],
  // desmontar muebles con palanca o martillo: tarda, suena y deja tablas y clavos en el sitio
  desmontar: { tipos: { armario: [2, 4], archivador: [1, 6], caja: [1, 2], militar: [1, 2], maquina: [0, 6], estanteria: [2, 4], pupitre: [1, 2], escritorio: [1, 3] }, tiempo: 3, ruido: 10 },
  grifo: { sed: 40 },
  // lo que ya has visto, para el mapa (M): casillas de 8 m sobre todo el distrito; ves lo que hay a «vista» metros
  explorado: { celda: 8, vista: 18 },
  mochilaInicial: [['escopeta', 1], ['palanca', 1], ['judias', 1], ['agua', 1], ['venda', 1], ['cartuchos', 6], ['martillo', 1], ['tablas', 2], ['clavos', 6]],
  // la ventaja de cada animal (ver docs/guia/juegos/zombies/README.md)
  animales: {
    bunny: { n: 'CrazyBunny', ventaja: 'Orejas de radar', vida: 120, oye: 22 },
    squirrel: { n: 'MadSquirrel', ventaja: 'Pies ligeros', vel: 1.15, huellas: 0.5 },
    fox: { n: 'SlyFox', ventaja: 'Sombra', ruido: 0.5 },
    junkcoon: { n: 'JunkCoon', ventaja: 'Saqueador', registra: 0.4, botinExtra: 1, mochilaExtra: 1 },
    meercat: { n: 'MeerCat', ventaja: 'Enfermera', infeccion: 0.5, venda: 1.5 },
  },
  // los fans zombificados: vida, velocidad, cuánto oyen (multiplica el radio del ruido), cuánto ven, el mordisco y lo suyo
  zombis: {
    fan: { vida: 60, vel: 1.3, persigue: 2.6, oido: 1, vista: 9, dano: 12, radio: 0.45 },
    streamer: { vida: 55, vel: 1.2, persigue: 2.4, oido: 1, vista: 11, dano: 10, radio: 0.45, grita: true },
    speedrunner: { vida: 45, vel: 1.6, persigue: 5.4, oido: 1.2, vista: 10, dano: 10, radio: 0.4, sprint: 3.5, descanso: 2.5 },
    ballena: { vida: 260, vel: 0.8, persigue: 1.6, oido: 0.8, vista: 8, dano: 22, radio: 0.85, botin: 3, pesado: true, fractura: true },   // fractura = puede romperte un brazo o una pierna
    bot: { vida: 60, vel: 1.3, persigue: 2.4, oido: 0.7, vista: 8, dano: 12, radio: 0.45, ruta: true },
    troll: { vida: 120, vel: 1.1, persigue: 2.2, oido: 1, vista: 9, dano: 20, radio: 0.6, rompe: 3 },
  // cómo de a menudo sale cada tipo al poblar el distrito (pesos)
  // EL CEO: el jefe de lo alto de la Torre de Microblizz. Llama a sus bots al bajar de vida y embiste de vez en cuando
    ceo: { vida: 1500, vel: 1.2, persigue: 2.3, oido: 1.5, vista: 16, dano: 28, radio: 1.0, pesado: true, jefe: true, rompe: 4 },
  },
  reparto: { fan: 10, streamer: 2, speedrunner: 2, ballena: 1, bot: 2, troll: 1 },
  // la Torre de Microblizz: 10 plantas de oficinas y la azotea (la 11) con el CEO. En cada planta, más fans (base + n * crece) y,
  // cuanto más arriba, más trolls, bots y ballenas (los ejecutivos). El jefe llama a «refuerzos» bots al bajar de cada umbral de vida
  // y embiste cada «cadaEmbiste» segundos durante «dura» a «vel» m/s
  torre: { plantas: 10, base: 4, crece: 1, reparto: { fan: 6, bot: 3, streamer: 1, speedrunner: 1, troll: 1, ballena: 0.6 }, arriba: { troll: 0.4, ballena: 0.25, bot: 0.3 },
    jefe: { escolta: 4, refuerzos: 6, umbrales: [0.7, 0.4, 0.15], cadaEmbiste: 6, dura: 0.7, vel: 9 } },
  ia: { mordisco: 1.1, alcanceMordisco: 1.05, olvida: 8, deambula: 6, duerme: 55, separa: 0.9, huella: 1.6, celda: 4 },
  mundo: { zombis: 120, oleada: 22, maxZombis: 320, poda: 180, podaDesde: 0.7, alarmaPorHora: 0.35, corte: [3, 6], corteAgua: [2, 5], vistaNoche: 0.6, despierta: 12 },
  // los parches de Microblizz: uno nuevo cada mañana desde el día 2
  parches: [
    { id: 'corren', n: 'Esta noche los fans corren.', velNoche: 1.6 },
    { id: 'oido', n: 'Mejora de audio: los fans oyen el doble.', oido: 2 },
    { id: 'hambre', n: 'Nuevo sistema de hambre: el doble de realista.', hambre: 2 },
    { id: 'mas', n: 'Evento de fin de semana: el doble de fans.', oleada: 2 },
    { id: 'lag', n: 'Hemos añadido lag para que sea más justo.', lag: true },
    { id: 'ninguno', n: 'Correcciones menores. No hemos corregido nada.' },
  ],
  dificultades: {
    turista: { n: 'TURISTA', zombis: 0.6, dano: 0.5, necesidades: 0.6 },
    superviviente: { n: 'SUPERVIVIENTE', zombis: 1, dano: 1, necesidades: 1 },
    caiste: { n: 'ASÍ ES COMO CAÍSTE', zombis: 1.4, dano: 1.4, necesidades: 1.25 },
  },
});
