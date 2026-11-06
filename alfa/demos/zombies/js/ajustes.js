// Fans of Zombies · AJUSTES (dominio): todas las cifras del juego en un sitio. El reloj (1 segundo real = 2 minutos del juego), las
// necesidades, los ruidos, las armas, los animales, los fans zombificados, los parches de Microblizz y las dificultades.
// Nada de pantalla aquí: lo leen las reglas (js/partida.js y compañía) y los tests.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
ZOM.AJ = Object.freeze({
  version: '0.7.0',
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
    venda: { n: 'VENDA', forma: ['X'], max: 3, usa: { vida: 25, infeccion: -10 } },
    cartuchos: { n: 'CARTUCHOS', forma: ['X'], max: 12 },
    tablas: { n: 'TABLAS', forma: ['XXX'], max: 3 },
    clavos: { n: 'CLAVOS', forma: ['X'], max: 20 },
    martillo: { n: 'MARTILLO', forma: ['XX', 'X.'] },
    tela: { n: 'TELA', forma: ['X'], max: 4 },
    carne: { n: 'CARNE CRUDA', forma: ['X'], usa: { hambre: 20, vida: -10, sed: -15, mal: true } },
    podrida: { n: 'CARNE PODRIDA', forma: ['X'], usa: { hambre: 5, vida: -25, mal: true } },
    filete: { n: 'FILETE', forma: ['X'], usa: { hambre: 50 }, cocinado: true },
    guiso: { n: 'GUISO', forma: ['X'], usa: { hambre: 45, sed: 20 }, cocinado: true },
  },
  // las habilidades: los umbrales de experiencia de cada nivel (0 a 10), lo que da cada acción y lo que mejora cada nivel
  habilidades: {
    niveles: [0, 10, 25, 45, 70, 100, 140, 190, 250, 320, 400],
    xp: { golpe: 1, disparo: 1, paso: 0.25, despide: 4, tabla: 4, desmonta: 3, fuego: 5 },
    efecto: { pelea: { dano: 0.05, aguante: 0.04 }, disparo: { dano: 0.05 }, sigilo: { ruido: 0.05, vista: 0.04 }, carpinteria: { tiempo: 0.06 }, cocina: { nutre: 0.08 } },
  },
  // lo que sale al registrar (peso de cada cosa), cuántas cosas como mucho y cuántos cartuchos trae cada hallazgo.
  // porTipo: lo que hay en cada clase de sitio (lo demás usa «cosas»). En la nevera, tras el corte de luz, la carne sale podrida
  botin: { cosas: { judias: 4, chocolatina: 3, agua: 3, refresco: 2, venda: 2, cartuchos: 3, tablas: 3, clavos: 3, martillo: 0.5, tela: 2, botella: 1, balas: 1.2, pistola: 0.3, bate: 0.6, hacha: 0.3, cuchillo: 0.5, nada: 3 }, maximo: 3, cartuchos: 4, clavos: 4, balas: 8, tiempo: 1.4,
    porTipo: {
      nevera: { carne: 5, agua: 3, refresco: 2, judias: 1, nada: 2 },
      armario: { tela: 5, venda: 1, clavos: 2, tablas: 1, cartuchos: 1, bate: 0.6, balas: 0.5, nada: 2 },
      cocina: { judias: 4, chocolatina: 2, botella: 3, agua: 1, cuchillo: 1.2, nada: 2 },
      basura: { tela: 1, botella: 3, chocolatina: 1, nada: 5 },
      fuego: {},
      estanteria: { tablas: 3, clavos: 3, martillo: 1, palanca: 0.6, hacha: 0.5, tela: 1, nada: 2 },
      super: { judias: 5, chocolatina: 4, agua: 4, refresco: 3, botella: 1, nada: 2 },
      gasolinera: { chocolatina: 4, refresco: 4, agua: 2, nada: 2 },
      ferreteria: { tablas: 4, clavos: 4, martillo: 1.5, hacha: 1, palanca: 0.8, cuchillo: 0.5, nada: 1 },
      farmacia: { venda: 6, tela: 2, nada: 2 },
      armeria: { balas: 4, cartuchos: 3, pistola: 1.2, escopeta: 0.4, nada: 1 },
      taquilla: { balas: 2, venda: 1, chocolatina: 1, cuchillo: 0.5, nada: 3 },
      pupitre: { chocolatina: 3, refresco: 2, tela: 1, nada: 4 },
      escritorio: { chocolatina: 2, refresco: 2, balas: 0.6, cuchillo: 0.3, tela: 1, venda: 0.5, nada: 3 },
      cajaFuerte: { balas: 4, cartuchos: 4, pistola: 1, venda: 3, escopeta: 0.5, hacha: 0.5, nada: 0.5 },
      maletin: { balas: 3, cartuchos: 3, escopeta: 1, pistola: 1, hacha: 1, venda: 2, chocolatina: 1 },
      maquina: { chocolatina: 3, refresco: 3, nada: 2 },
      granero: { tela: 2, hacha: 0.8, tablas: 2, clavos: 2, judias: 2, nada: 2 },
    } },
  // fabricar: con qué y dónde (null = en cualquier sitio; 'fuego' = junto a un bidón con fuego o en la cocina de una casa con luz)
  recetas: [
    { id: 'venda', sale: ['venda', 1], con: [['tela', 2]], donde: null },
    { id: 'filete', sale: ['filete', 1], con: [['carne', 1]], donde: 'fuego' },
    { id: 'guiso', sale: ['guiso', 1], con: [['judias', 1], ['agua', 1]], donde: 'fuego', deja: ['botella', 1] },
  ],
  // desmontar muebles con palanca o martillo: tarda, suena y deja tablas y clavos en el sitio
  desmontar: { tipos: { armario: [2, 4], archivador: [1, 6], caja: [1, 2], militar: [1, 2], maquina: [0, 6], estanteria: [2, 4], pupitre: [1, 2], escritorio: [1, 3] }, tiempo: 3, ruido: 10 },
  grifo: { sed: 40 },
  // lo que ya has visto, para el mapa (M): casillas de 8 m sobre todo el distrito; ves lo que hay a «vista» metros
  explorado: { x0: -214, z0: -66, celda: 8, w: 39, h: 33, vista: 18 },
  mochila: { w: 6, h: 5 },
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
    ballena: { vida: 260, vel: 0.8, persigue: 1.6, oido: 0.8, vista: 8, dano: 22, radio: 0.85, botin: 3, pesado: true },
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
  ia: { mordisco: 1.1, alcanceMordisco: 1.05, olvida: 8, deambula: 6, duerme: 55, separa: 0.9, huella: 1.6, celda: 4, infeccion: 0.25 },
  mundo: { zombis: 120, oleada: 22, maxZombis: 220, alarmaPorHora: 0.35, corte: [3, 6], corteAgua: [2, 5], vistaNoche: 0.6, despierta: 12 },
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
