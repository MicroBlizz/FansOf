// Fans of Zombies · AJUSTES (dominio): todas las cifras del juego en un sitio. El reloj (1 segundo real = 2 minutos del juego), las
// necesidades, los ruidos, las armas, los animales, los fans zombificados, los parches de Microblizz y las dificultades.
// Nada de pantalla aquí: lo leen las reglas (js/partida.js y compañía) y los tests.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
ZOM.AJ = Object.freeze({
  version: '0.4.0',
  reloj: { minPorSeg: 2, minDormido: 40, empieza: 8 * 60, amanece: 7 * 60, anochece: 20 * 60 },
  // cuánto baja cada necesidad por hora del juego (sobre 100), lo que quita la vida si llega a 0 y los avisos
  necesidades: { hambre: 2.6, sed: 4.0, sueno: 3.2, recuperaSueno: 14, vidaSiVacia: 6, aviso: 35, infeccion: 3, curaSola: 0.6 },
  jugador: { vida: 100, radio: 0.5, vel: 4.2, corre: 6.6, agacha: 2.2, pasoHuella: 0.9, huellas: 60, vidaHuella: 240 },
  // radio del ruido (en metros) de cada cosa que haces
  ruido: { andar: 4, correr: 10, abrirLata: 5, registrar: 4, golpe: 3, escopeta: 30, grito: 18, alarma: 34, puerta: 2, martillo: 12, dura: 1.2, duraAlarma: 25 },
  // puertas y ventanas: su vida, el ruido al romperse; las barricadas (hasta 3 tablas, cada una con su vida, 2 clavos y 2 s);
  // busca = metros a los que un fan que choca encuentra un hueco; alcance y cadencia de sus golpes al hueco
  huecos: { puerta: { vida: 120, ruidoRotura: 14 }, ventana: { vida: 12, ruidoRotura: 16 }, barricada: { max: 3, vidaTabla: 60, clavos: 2, tiempo: 2 }, busca: 7, alcance: 1.5, cadencia: 1.0 },
  // aguante (sobre 100): lo que cuesta cada cosa y lo que se recupera por segundo; a 0 estás agotado hasta llegar a «salir»
  aguante: { max: 100, correr: 16, recupera: 8, salir: 30, agotado: { dano: 0.6, cadencia: 1.6 } },
  // retroceso = metros que sale despedido el zombi; aturde = segundos sin moverse ni morder
  armas: {
    palanca: { n: 'PALANCA', alcance: 1.9, cono: 1.2, dano: 34, cadencia: 0.55, ruido: 'golpe', municion: null, aguante: 10, retroceso: 0.8, aturde: 0.6 },
    escopeta: { n: 'ESCOPETA', alcance: 10, cono: 0.5, dano: 70, cadencia: 0.95, ruido: 'escopeta', municion: 'cartuchos', aguante: 0, retroceso: 1.4, aturde: 0.5 },
  },
  // el empujón (botón derecho o R): no hace daño ni ruido, aparta y tumba un rato a los que tienes delante
  empujon: { alcance: 1.7, cono: 1.1, retroceso: 1.8, derriba: 1.6, cadencia: 0.6, aguante: 14, ruido: 1.5 },
  // las cosas: su nombre, su forma en la mochila Tetris (X = casilla), cuántas se apilan (max) y lo que hacen al usarlas (usa)
  objetos: {
    escopeta: { n: 'ESCOPETA', forma: ['XXXX', '.X..'], arma: true },
    palanca: { n: 'PALANCA', forma: ['XXX'], arma: true },
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
    filete: { n: 'FILETE', forma: ['X'], usa: { hambre: 50 } },
    guiso: { n: 'GUISO', forma: ['X'], usa: { hambre: 45, sed: 20 } },
  },
  // lo que sale al registrar (peso de cada cosa), cuántas cosas como mucho y cuántos cartuchos trae cada hallazgo.
  // porTipo: lo que hay en cada clase de sitio (lo demás usa «cosas»). En la nevera, tras el corte de luz, la carne sale podrida
  botin: { cosas: { judias: 4, chocolatina: 3, agua: 3, refresco: 2, venda: 2, cartuchos: 3, tablas: 3, clavos: 3, martillo: 0.5, tela: 2, botella: 1, nada: 3 }, maximo: 3, cartuchos: 4, clavos: 4, tiempo: 1.4,
    porTipo: {
      nevera: { carne: 5, agua: 3, refresco: 2, judias: 1, nada: 2 },
      armario: { tela: 5, venda: 1, clavos: 2, tablas: 1, cartuchos: 1, nada: 2 },
      cocina: { judias: 4, chocolatina: 2, botella: 3, agua: 1, nada: 2 },
      basura: { tela: 1, botella: 3, chocolatina: 1, nada: 5 },
      fuego: {},
    } },
  // fabricar: con qué y dónde (null = en cualquier sitio; 'fuego' = junto a un bidón con fuego o en la cocina de una casa con luz)
  recetas: [
    { id: 'venda', sale: ['venda', 1], con: [['tela', 2]], donde: null },
    { id: 'filete', sale: ['filete', 1], con: [['carne', 1]], donde: 'fuego' },
    { id: 'guiso', sale: ['guiso', 1], con: [['judias', 1], ['agua', 1]], donde: 'fuego', deja: ['botella', 1] },
  ],
  // desmontar muebles con palanca o martillo: tarda, suena y deja tablas y clavos en el sitio
  desmontar: { tipos: { armario: [2, 4], cama: [2, 2], archivador: [1, 6], caja: [1, 2], militar: [1, 2], maquina: [0, 6] }, tiempo: 3, ruido: 10 },
  grifo: { sed: 40 },
  mochila: { w: 6, h: 4 },
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
  },
  // cómo de a menudo sale cada tipo al poblar el distrito (pesos)
  reparto: { fan: 10, streamer: 2, speedrunner: 2, ballena: 1, bot: 2, troll: 1 },
  ia: { mordisco: 1.1, alcanceMordisco: 1.05, olvida: 8, deambula: 6, duerme: 55, separa: 0.9, huella: 1.6, celda: 4, infeccion: 0.25 },
  mundo: { zombis: 70, oleada: 14, maxZombis: 140, alarmaPorHora: 0.35, corte: [3, 6], corteAgua: [2, 5], vistaNoche: 0.6, despierta: 12 },
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
