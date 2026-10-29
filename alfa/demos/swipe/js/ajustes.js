// Fans of Swipe · AJUSTES: el nombre de la demo para core, la clave de su partida y TODA la calibración del juego:
// el héroe, las cartas de acción (cada una con su lado izquierdo y su lado derecho), los enemigos y sus intenciones,
// las reliquias, los eventos, la tienda y cómo se reparten los pisos de la Torre de Microblizz. Se carga antes de lo común.
'use strict';
const AJUSTES = {
  id: 'swipe',                 // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-swipe',    // la clave de la partida en este navegador
};

const SW_CFG = {
  vida: 50, caosMax: 3, caosInicio: 1, caosPorTurno: 1, oroInicio: 20,
  pisos: 15, tesoro: 8, descanso: 14,               // el 15 es el jefe
  mazoInicio: ['garrote', 'garrote', 'escudo', 'escudo', 'mordisco', 'salto'],
  curaDescanso: 0.3,                                // dormir cura este trozo de la vida máxima
  subePiso: 0.04,                                   // los enemigos tienen un 4 % más de vida por cada piso
  mejora: 1.4,                                      // una carta mejorada multiplica sus números
  precioCarta: [38, 58], precioReliquia: [110, 150], precioQuitar: 45,
  // qué sale en cada cruce (pisos sin fijar): pesos
  nodos: { combate: 46, evento: 24, tienda: 10, descanso: 8, elite: 12 },
  eliteDesde: 6,
  curaBotin: 8,                                     // tras ganar un combate puedes curarte esto (a cambio de la mitad del oro)
  // el ritmo: cada carta de combate tiene una mecha; si se acaba, el enemigo ataca gratis. Deslizar rápido hace racha.
  mecha: 8, mechaJefe: 6.5, rapido: 2.2,   // segundos de mecha; la mecha arranca cuando la carta ya ha caído y arrastrando va a la mitad
  frenesi: 4, frenesiDano: 1.5, frenesiOro: 1.5,
  esperaEnemigo: 0.42,
  // la estrategia: el escudo que te sobra se guarda a medias para el turno siguiente (guardia) y cada carta sale con sus
  // lados en un orden al azar, así que no siempre es «izquierda = atacar»; además ves la siguiente carta del mazo
  guardia: 0.5, giro: 0.5,
};

// Efectos (los usan las cartas, los eventos y la tienda). t = tipo:
// dano n (golpes k), escudo n, cura n, caos n, veneno n, congela, debil n (turnos), fuerza n, oro n, danoEscudo,
// herida n (te quita vida), vidaMax n, reliquia, carta, mejora, quita, fuerzaBase n, azar {p, si: [...], no: [...]}.
// coste = caos que gasta el lado; pago = oro que cuesta (si no llegas, ese lado no se puede elegir).
const SW_CARTAS = {
  garrote:  { nombre: 'Garrote', arte: ['a-golpe', 'a-escudo'], rareza: 0,
    izq: { nombre: 'Garrotazo', ef: [{ t: 'dano', n: 7 }] },
    der: { nombre: 'Golpe cubierto', ef: [{ t: 'dano', n: 3 }, { t: 'escudo', n: 4 }] } },
  escudo:   { nombre: 'Escudo zanahoria', arte: ['a-escudo', 'a-escudo'], rareza: 0,
    izq: { nombre: 'Cubrirse', ef: [{ t: 'escudo', n: 7 }] },
    der: { nombre: 'Parada', ef: [{ t: 'escudo', n: 5 }, { t: 'devuelve' }] } },
  mordisco: { nombre: 'Zanahoria', arte: ['a-golpe', 'a-cura'], rareza: 0,
    izq: { nombre: 'Zanahoriazo', ef: [{ t: 'dano', n: 4 }, { t: 'caos', n: 1 }] },
    der: { nombre: 'Merendar', ef: [{ t: 'cura', n: 3 }, { t: 'escudo', n: 4 }] } },
  salto:    { nombre: 'Salto del caos', arte: ['a-salto', 'a-caos'], rareza: 0,
    izq: { nombre: 'Salto del caos', coste: 2, ef: [{ t: 'dano', n: 14 }] },
    der: { nombre: 'Coger carrerilla', ef: [{ t: 'caos', n: 1 }, { t: 'escudo', n: 3 }] } },
  antorcha: { nombre: 'Antorcha verde', arte: ['a-fuego', 'a-cura'], rareza: 1,
    izq: { nombre: 'Fuego verde', ef: [{ t: 'dano', n: 3 }, { t: 'veneno', n: 4 }] },
    der: { nombre: 'Calentarse', ef: [{ t: 'cura', n: 3 }, { t: 'escudo', n: 3 }] } },
  hielo:    { nombre: 'Carámbano', arte: ['a-hielo', 'a-escudo'], rareza: 2,
    izq: { nombre: 'Carámbano', coste: 1, ef: [{ t: 'dano', n: 5 }, { t: 'congela' }] },
    der: { nombre: 'Muro de hielo', ef: [{ t: 'escudo', n: 9 }] } },
  furia:    { nombre: 'Rabia de fan', arte: ['a-golpe', 'a-caos'], rareza: 1,
    izq: { nombre: 'Doble garrotazo', ef: [{ t: 'dano', n: 4, k: 2 }] },
    der: { nombre: 'A lo loco', ef: [{ t: 'dano', n: 13 }, { t: 'herida', n: 3 }] } },
  muro:     { nombre: 'Placaje', arte: ['a-escudo', 'a-escudo'], rareza: 1,
    izq: { nombre: 'Placaje', ef: [{ t: 'danoEscudo' }] },
    der: { nombre: 'Atrincherarse', ef: [{ t: 'escudo', n: 9 }] } },
  robo:     { nombre: 'Mangar', arte: ['a-golpe', 'a-escudo'], rareza: 1,
    izq: { nombre: 'Mangar', ef: [{ t: 'dano', n: 3 }, { t: 'oro', n: 6 }] },
    der: { nombre: 'Esquivar', ef: [{ t: 'escudo', n: 6 }, { t: 'devuelve' }] } },
  rayo:     { nombre: 'Rayo del caos', arte: ['a-caos', 'a-caos'], rareza: 2,
    izq: { nombre: 'Rayo del caos', coste: 3, ef: [{ t: 'dano', n: 24 }] },
    der: { nombre: 'Cargar caos', ef: [{ t: 'caos', n: 2 }] } },
  cafe:     { nombre: 'Café robado', arte: ['a-caos', 'a-cura'], rareza: 1,
    izq: { nombre: 'Chute de café', ef: [{ t: 'caos', n: 1 }, { t: 'dano', n: 3 }] },
    der: { nombre: 'Siesta', ef: [{ t: 'cura', n: 6 }, { t: 'caos', n: -1 }] } },
  patada:   { nombre: 'Patada de conejo', arte: ['a-salto', 'a-escudo'], rareza: 1,
    izq: { nombre: 'Doble patada', ef: [{ t: 'dano', n: 5, k: 2 }] },
    der: { nombre: 'Voltereta', ef: [{ t: 'escudo', n: 4 }, { t: 'caos', n: 1 }] } },
  grito:    { nombre: 'Grito de fan', arte: ['a-caos', 'a-escudo'], rareza: 2,
    izq: { nombre: 'Abucheo', ef: [{ t: 'dano', n: 3 }, { t: 'debil', n: 2 }] },
    der: { nombre: 'Venirse arriba', ef: [{ t: 'fuerza', n: 2 }] } },
  veneno:   { nombre: 'Café de máquina', arte: ['a-veneno', 'a-escudo'], rareza: 2,
    izq: { nombre: 'Café de máquina', coste: 1, ef: [{ t: 'veneno', n: 8 }] },
    der: { nombre: 'Taza escudo', ef: [{ t: 'escudo', n: 5 }, { t: 'veneno', n: 2 }] } },
};
const SW_RAREZAS = [{ nombre: 'Básica', col: '#9aa3ad' }, { nombre: 'Poco común', col: '#4fc25a' }, { nombre: 'Rara', col: '#3f8cff' }];

// Enemigos. vida base y lo que hacen, por turnos y en bucle (cada intención: atq n [k golpes], def n, cura n, caos (te quita caos), fuerza n, roba n oro).
const SW_ENEMIGOS = {
  becario:    { nombre: 'Becario', tipo: 'normal', vida: 17, oro: [11, 16], int: [{ atq: 5 }, { atq: 4, def: 3 }, { def: 6, txt: 'Café' }] },
  starbot:    { nombre: 'StarBot', tipo: 'normal', vida: 20, oro: [12, 18], int: [{ atq: 3, k: 2 }, { fuerza: 1, def: 3, txt: 'Recargar' }, { atq: 4, k: 2 }] },
  soportebot: { nombre: 'SoporteBot', tipo: 'normal', vida: 23, oro: [13, 18], int: [{ def: 7 }, { atq: 6 }, { cura: 7, txt: 'Ticket resuelto' }] },
  cajabotin:  { nombre: 'CajaBotín', tipo: 'normal', vida: 26, oro: [20, 28], int: [{ atq: 7 }, { atq: 4, roba: 10, txt: 'Microtransacción' }, { def: 8 }] },
  fallen:     { nombre: 'FallenHero', tipo: 'elite', vida: 38, oro: [34, 44], int: [{ atq: 8 }, { carga: 10, txt: 'Desenvaina' }, { atq: 18, cargado: true, txt: 'Tajo legendario' }, { def: 8, fuerza: 1, txt: 'Viejas glorias' }, { atq: 5, k: 2 }] },
  parchebot:  { nombre: 'Parche Día 1', tipo: 'elite', vida: 44, oro: [36, 46], int: [{ atq: 7 }, { cura: 6, def: 6, txt: 'Parche' }, { carga: 11, txt: 'Compilando' }, { atq: 20, cargado: true, txt: 'Parche gigante' }] },
  survivalbot:{ nombre: 'SurvivalBot', tipo: 'elite', vida: 42, oro: [36, 48], int: [{ atq: 5, caos: 1, txt: 'Congelación' }, { atq: 8 }, { carga: 10, txt: 'Imprimiendo cartas' }, { atq: 6, k: 3, cargado: true, txt: 'Cartas de despido' }] },
  ceo:        { nombre: 'El CEO', tipo: 'jefe', vida: 90, oro: [0, 0],
    int: [{ atq: 7 }, { def: 10, fuerza: 1, txt: 'Diapositiva' }, { carga: 14, txt: 'Junta de accionistas' }, { atq: 24, cargado: true, txt: 'Despido del año' }, { atq: 9, roba: 15, txt: 'Subida de precios' }, { cura: 8, txt: 'Recompra de acciones' }] },
};
const SW_NORMALES_1 = ['becario', 'starbot', 'becario', 'soportebot'];     // pisos 1 a 6
const SW_NORMALES_2 = ['starbot', 'soportebot', 'cajabotin', 'cajabotin'];  // pisos 7 en adelante
const SW_ELITES = ['fallen', 'parchebot', 'survivalbot'];

// Reliquias: pasivas para toda la partida. El código de cada una está en js/combate.js (por su id).
const SW_RELIQUIAS = {
  'r-hielo':      { nombre: 'Cubito con pez', texto: '3 a la izquierda seguidas: congelas al enemigo.' },
  'r-post':       { nombre: 'Pósits', texto: '3 a la derecha seguidas: +1 caos y te curas 2.' },
  'r-silla':      { nombre: 'Silla giratoria', texto: 'Si alternas izquierda y derecha 3 veces: +4 escudo.' },
  'r-mando':      { nombre: 'Mando retro', texto: 'Combo izquierda, izquierda, derecha: 8 de daño extra.' },
  'r-pila':       { nombre: 'Pila cargada', texto: 'Empiezas cada combate con 1 caos más.' },
  'r-taza':       { nombre: 'Taza del jefe', texto: 'Cada 3 turnos ganas 1 caos.' },
  'r-grapadora':  { nombre: 'Grapadora roja', texto: 'Cada golpe hace 1 de daño más.' },
  'r-corbata':    { nombre: 'Corbata dorada', texto: 'Ganas un 30 % más de oro.' },
  'r-zanahoria':  { nombre: 'Zanahoria dorada', texto: '+8 de vida máxima.' },
  'r-tarjeta':    { nombre: 'Tarjeta de empleado', texto: 'En la tienda todo cuesta un 25 % menos.' },
  'r-auriculares':{ nombre: 'Auriculares gatunos', texto: 'Al ganar un combate te curas 4.' },
  'r-dado':       { nombre: 'Dado de veinte', texto: 'Cada golpe tiene un 15 % de hacer el doble.' },
  'r-pata':       { nombre: 'Pata de la suerte', texto: 'La primera vez que caerías, te quedas con 1 de vida.' },
  'r-calcetin':   { nombre: 'Calcetín apestoso', texto: 'Los enemigos empiezan con 3 de veneno.' },
  'r-trofeo':     { nombre: 'Trofeo zanahoria', texto: 'Las élites dan el doble de oro.' },
  'r-reloj':      { nombre: 'Reloj con orejas', texto: 'En el primer turno de cada combate el enemigo no hace nada.' },
  'r-iman':       { nombre: 'Imán de monedas', texto: 'Cada combate ganado da 6 de oro más.' },
  'r-capa':       { nombre: 'Capa de héroe', texto: '+1 de fuerza en todos los combates.' },
};

// Eventos: una carta con su dibujo, lo que pasa y dos salidas. pago = oro que cuesta ese lado.
const SW_EVENTOS = [
  { id: 'cafe', arte: 'ev-cafe', titulo: 'Máquina averiada', texto: 'La máquina del café de la planta lleva tres años «en mantenimiento».',
    izq: { nombre: 'Darle un golpe', ef: [{ t: 'azar', p: 0.5, si: [{ t: 'oro', n: 18 }], no: [{ t: 'herida', n: 5 }] }] },
    der: { nombre: 'Arreglarla', pago: 10, ef: [{ t: 'cura', n: 12 }] } },
  { id: 'cofre', arte: 'ev-cofre', titulo: 'Caja de botín', texto: 'Una caja misteriosa. «¡Contenido legendario garantizado al 0,1 %!»',
    izq: { nombre: 'Pasar de largo', ef: [{ t: 'cura', n: 2 }] },
    der: { nombre: 'Comprarla', pago: 35, ef: [{ t: 'azar', p: 0.4, si: [{ t: 'reliquia' }], no: [{ t: 'oro', n: 5 }] }] } },
  { id: 'impresora', arte: 'ev-impresora', titulo: 'La impresora', texto: 'La impresora te mira. Ha olido que tienes prisa.',
    izq: { nombre: 'Desenchufarla', ef: [{ t: 'herida', n: 4 }, { t: 'carta' }] },
    der: { nombre: 'Imprimir el currículum', ef: [{ t: 'oro', n: 12 }] } },
  { id: 'ascensor', arte: 'ev-ascensor', titulo: 'El ascensor', texto: 'Un botón rojo dice «NO PULSAR (SOLO DIRECTIVOS)».',
    izq: { nombre: 'Pulsarlo', ef: [{ t: 'azar', p: 0.5, si: [{ t: 'cura', n: 99 }], no: [{ t: 'herida', n: 8 }] }] },
    der: { nombre: 'Ir por la escalera', ef: [{ t: 'herida', n: 3 }, { t: 'fuerzaBase', n: 1 }] } },
  { id: 'reunion', arte: 'ev-reunion', titulo: 'Reunión eterna', texto: 'Una reunión que podría haber sido un correo. Te han invitado.',
    izq: { nombre: 'Echar una cabezada', ef: [{ t: 'cura', n: 9 }] },
    der: { nombre: 'Proponer ideas', ef: [{ t: 'mejora' }] } },
  { id: 'lola', arte: 'ev-lola', titulo: 'Lola', texto: 'Lola sale con su caja: la acaban de despedir. «Sé dónde guardan las cosas buenas».',
    izq: { nombre: 'Darle 20 de oro', pago: 20, ef: [{ t: 'reliquia' }] },
    der: { nombre: 'Pedirle un truco', ef: [{ t: 'mejora' }] } },
  { id: 'taquilla', arte: 'ev-taquilla', titulo: 'La taquilla', texto: 'Una taquilla entreabierta brilla con luz dorada.',
    izq: { nombre: 'Forzarla', ef: [{ t: 'herida', n: 5 }, { t: 'vidaMax', n: 6 }] },
    der: { nombre: 'Chivarse a seguridad', ef: [{ t: 'oro', n: 14 }] } },
  { id: 'fuente', arte: 'ev-fuente', titulo: 'Agua sospechosa', texto: 'El dispensador burbujea en verde. La etiqueta dice «Hidratación premium».',
    izq: { nombre: 'Beber', ef: [{ t: 'cura', n: 12 }] },
    der: { nombre: 'Llenar la cantimplora', ef: [{ t: 'vidaMax', n: 4 }] } },
  { id: 'encuesta', arte: 'ev-encuesta', titulo: 'Encuesta de satisfacción', texto: '«¿Cómo de feliz eres trabajando para Microblizz?» Del 1 al 5.',
    izq: { nombre: 'Poner un 1', ef: [{ t: 'fuerzaBase', n: 1 }] },
    der: { nombre: 'Poner un 5', ef: [{ t: 'oro', n: 22 }] } },
  { id: 'gato', arte: 'ev-gato', titulo: 'El gato de la oficina', texto: 'Duerme encima de los contratos. Nadie se atreve a moverlo.',
    izq: { nombre: 'Acariciarlo', ef: [{ t: 'azar', p: 0.7, si: [{ t: 'cura', n: 7 }], no: [{ t: 'herida', n: 4 }] }] },
    der: { nombre: 'Coger los contratos', ef: [{ t: 'herida', n: 3 }, { t: 'oro', n: 26 }] } },
  { id: 'vending', arte: 'ev-vending', titulo: 'Máquina de aperitivos', texto: 'Pociones a 15 de oro. Patatas a 15 de oro. Aire a 15 de oro.',
    izq: { nombre: 'Comprar poción', pago: 15, ef: [{ t: 'cura', n: 16 }] },
    der: { nombre: 'Sacudirla', ef: [{ t: 'azar', p: 0.5, si: [{ t: 'oro', n: 20 }], no: [{ t: 'herida', n: 6 }] }] } },
  { id: 'buzon', arte: 'ev-buzon', titulo: 'Buzón de sugerencias', texto: 'Está lleno. Debajo pone: «Se vacía en la trituradora».',
    izq: { nombre: 'Tirar una carta vieja', ef: [{ t: 'quita' }] },
    der: { nombre: 'Llevarte una sugerencia', ef: [{ t: 'carta' }] } },
];

// Los dibujos de cada tipo de piso (para el mapa y la carta del cruce)
const SW_NODOS = {
  combate: { nombre: 'Combate', icono: 'n-combate' }, elite: { nombre: 'Élite', icono: 'n-elite' }, evento: { nombre: 'Evento', icono: 'n-evento' },
  tienda: { nombre: 'Tienda', icono: 'n-tienda' }, descanso: { nombre: 'Descanso', icono: 'n-descanso' }, tesoro: { nombre: 'Tesoro', icono: 'n-tesoro' },
  jefe: { nombre: 'El CEO', icono: 'n-jefe' },
};
// zona (fondo) de cada piso
function swZona(piso) { return piso >= 15 ? 'fondo-azotea' : piso >= 11 ? 'fondo-servidores' : piso >= 6 ? 'fondo-oficinas' : 'fondo-vestibulo'; }
