// Fans of Asalto · AJUSTES: el nombre de la demo para core, la clave de su partida y TODA la calibración: héroes (con su precio),
// las 7 clases y sus habilidades por nivel, enemigos, la tienda, las reliquias por clase, el equipo, los logros y las zonas de la
// mazmorra (una tira de niveles con el jefe al final). Se carga antes de lo común. Copiado de cerca del juego de referencia:
// ver docs/demos/asalto/COMPARACION.md.
'use strict';
const AJUSTES = {
  id: 'asalto',                // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-asalto',   // la clave de la partida en este navegador
};

// Las 7 clases. umbral = cuántos héroes DISTINTOS de esa clase hacen falta para cada nivel de su habilidad; v = el número de cada nivel.
const AS_CLASES = {
  tanque:   { nombre: 'Tanque',   col: '#4f8ae8', umbral: [2, 3, 4, 5], v: [10, 12, 14, 16], txt: 'Los tanques se ponen un escudo del {v} % de su vida cada 6 s' },
  luchador: { nombre: 'Luchador', col: '#e8572c', umbral: [2, 3, 4, 5], v: [10, 15, 20, 25], txt: 'Los luchadores pegan un {v} % más fuerte' },
  asesino:  { nombre: 'Asesino',  col: '#9b4fd8', umbral: [2, 3, 4, 5], v: [1, 1.5, 2, 2.5], txt: 'Los asesinos lanzan un dardo venenoso cada 12 s: {v} % de la vida del enemigo por segundo' },
  tirador:  { nombre: 'Tirador',  col: '#5fb83a', umbral: [2, 3, 4, 5], v: [20, 30, 40, 50], txt: 'Los tiradores disparan un {v} % más rápido' },
  mago:     { nombre: 'Mago',     col: '#f0a92a', umbral: [2, 3, 4, 5], v: [50, 60, 70, 80], txt: 'Los magos lanzan una cadena de rayos cada 6 s: {v} % de su daño a 3 enemigos' },
  sanador:  { nombre: 'Sanador',  col: '#f06aa0', umbral: [1, 2, 3, 4], v: [3, 4, 5, 6], txt: 'Los sanadores curan un {v} % de la vida a un aliado cada 3 s' },
  brujo:    { nombre: 'Brujo',    col: '#b84fd8', umbral: [2, 3, 4, 5], v: [4, 5, 6, 7], txt: 'Los brujos lanzan {v} misiles de sombra cada 6 s' },
};

// Los héroes: los Animales Locos en versión medieval. precio en oro (de 5 a 29 según lo bueno que sea), dos clases cada uno.
// ataque: 'cuerpo' (cuerpo a cuerpo), 'flecha', 'magia' (bola que vuela), 'bomba' (cae en un área), 'cura' (cura al más herido).
// salto: el asesino corre a la retaguardia al empezar.
const AS_HEROES = {
  'heroe-huron':     { nombre: 'HurónNinja', corto: 'Hurón', clases: ['asesino', 'luchador'], precio: 5, vida: 85, dano: 15, cada: 0.8, alcance: 24, vel: 60, ataque: 'cuerpo', salto: true },
  'heroe-bunny':     { nombre: 'CrazyBunny', corto: 'Bunny', clases: ['luchador', 'tanque'], precio: 7, vida: 120, dano: 14, cada: 1.0, alcance: 26, vel: 46, ataque: 'cuerpo' },
  'heroe-ardilla':   { nombre: 'MadSquirrel', corto: 'Ardilla', clases: ['tirador', 'asesino'], precio: 8, vida: 70, dano: 12, cada: 0.9, alcance: 170, vel: 40, ataque: 'flecha' },
  'heroe-zorro':     { nombre: 'SlyFox', corto: 'Zorro', clases: ['asesino', 'brujo'], precio: 11, vida: 90, dano: 22, cada: 0.9, alcance: 24, vel: 62, ataque: 'cuerpo', salto: true },
  'heroe-castor':    { nombre: 'BoomBeaver', corto: 'Castor', clases: ['tirador', 'mago'], precio: 12, vida: 80, dano: 18, cada: 1.6, alcance: 150, vel: 38, ataque: 'bomba', area: 40 },
  'heroe-mechavaca': { nombre: 'MechaVaca', corto: 'Vaca', clases: ['tanque', 'luchador'], precio: 13, vida: 260, dano: 11, cada: 1.3, alcance: 26, vel: 34, ataque: 'cuerpo' },
  'heroe-suricata':  { nombre: 'MeerCat', corto: 'Suricata', clases: ['sanador', 'brujo'], precio: 15, vida: 90, dano: 16, cada: 1.2, alcance: 150, vel: 36, ataque: 'cura' },
  'heroe-mapache':   { nombre: 'JunkCoon', corto: 'Mapache', clases: ['mago', 'brujo'], precio: 18, vida: 85, dano: 26, cada: 1.4, alcance: 160, vel: 36, ataque: 'magia', area: 0 },
};

// Los enemigos: los de Microblizz. jefe: sale solo, más grande.
const AS_ENEMIGOS = {
  'enemigo-becario':    { nombre: 'Becario', vida: 60, dano: 8, cada: 1.0, alcance: 24, vel: 44, ataque: 'cuerpo' },
  'enemigo-starbot':    { nombre: 'StarBot', vida: 50, dano: 9, cada: 1.1, alcance: 150, vel: 40, ataque: 'magia' },
  'enemigo-soportebot': { nombre: 'SoporteBot', vida: 110, dano: 9, cada: 1.2, alcance: 26, vel: 36, ataque: 'cuerpo' },
  'enemigo-parche':     { nombre: 'Parche Día 1', vida: 80, dano: 13, cada: 1.0, alcance: 24, vel: 50, ataque: 'cuerpo' },
  'enemigo-fallen':     { nombre: 'FallenHero', vida: 150, dano: 15, cada: 1.2, alcance: 26, vel: 38, ataque: 'cuerpo' },
  'enemigo-cajabotin':  { nombre: 'Caja Botín', vida: 130, dano: 12, cada: 1.0, alcance: 24, vel: 46, ataque: 'cuerpo' },
  'jefe-ceo':           { nombre: 'El CEO', vida: 1400, dano: 30, cada: 1.5, alcance: 34, vel: 30, ataque: 'cuerpo', jefe: true, area: 46 },
};

// La tienda: 5 huecos; prob = con qué probabilidad sale cada héroe según su precio y el nivel de la tienda (más nivel, más caros);
// mejorar cuesta 5, 10, 15, 20 y 30 (hasta el nivel 6); refrescar cuesta 2 de oro (en el juego de referencia parece que va con anuncio).
const AS_TIENDA = {
  huecos: 5,
  mejorar: [5, 10, 15, 20, 30],
  refrescar: 2,
  nivelMax: 6,
  // peso de un héroe de precio p con la tienda a nivel n: los baratos pesan más al principio y los caros al final
  peso: (p, n) => Math.max(0.15, 1 - Math.abs(p - (4 + n * 3)) / 14),
};

// La partida: oro al empezar y lo que da cada cosa.
const AS_CFG = {
  oro: 25,
  oroPorMuerte: 1,                               // cada enemigo derrotado suelta 1 de oro (el contador de la batalla)
  oroVictoria: n => 6 + Math.floor(n / 4) * 2,   // n = nivel (sala) de la mazmorra
  oroCofre: [2, 7], plumasCofre: [13, 39],
  oroJefe: 25, plumasJefe: 50,
  velocidad: [1, 2],
  limiteCombate: 90,
};
const AS_COLS = 4, AS_FILAS = 8;   // la cuadrícula de los héroes (32 sitios)

// Las reliquias: muchas son de una clase (como en el juego de referencia) y otras para todo el grupo. Valen hasta el final de la partida.
const AS_RELIQUIAS = {
  espinas:   { nombre: 'Aura de espinas', clase: 'tanque', txt: 'Los tanques devuelven el 20 % del daño que reciben', col: '#4f8ae8' },
  perforar:  { nombre: 'Perforar', clase: 'tirador', txt: 'Las flechas de los tiradores atraviesan y dan a un segundo enemigo', col: '#5fb83a' },
  esprint:   { nombre: 'Esprint', clase: 'asesino', txt: 'Los asesinos corren y atacan un 30 % más rápido', col: '#9b4fd8' },
  tenacidad: { nombre: 'Tenacidad', clase: 'luchador', txt: 'Los luchadores tienen un 25 % más de vida', col: '#e8572c' },
  escondite: { nombre: 'Escondite', clase: 'sanador', txt: 'Los sanadores esquivan el 30 % de los golpes', col: '#f06aa0' },
  helado:    { nombre: 'Toque helado', clase: 'mago', txt: 'Los golpes de los magos pueden frenar al enemigo', col: '#f0a92a' },
  sombra:    { nombre: 'Sombra larga', clase: 'brujo', txt: 'Los misiles de los brujos hacen un 50 % más de daño', col: '#b84fd8' },
  zelote:    { nombre: 'Zelote', txt: 'Todos pegan un 10 % más fuerte', col: '#ffcf3a' , icono: 'reliquia-colmillo' },
  reflejo:   { nombre: 'Espejo roto', txt: 'Todos devuelven el 10 % del daño recibido', col: '#c9d6ff' , icono: 'reliquia-espejo' },
  mortal:    { nombre: 'Golpe mortal', txt: '15 % de golpes críticos (x2)', col: '#ff6a5a' , icono: 'reliquia-dado' },
  furia:     { nombre: 'Furia', txt: 'Con menos del 30 % de vida, +30 % de daño', col: '#ff8a2a' , icono: 'reliquia-reloj' },
  carton:    { nombre: 'Escudo de cartón', txt: 'Todos empiezan cada combate con un escudo del 20 %', col: '#c9a26a' , icono: 'reliquia-escudo' },
  hucha:     { nombre: 'Hucha rota', txt: '+3 de oro en cada victoria', col: '#ffd76a' },
  tirita:    { nombre: 'Tirita mágica', txt: 'Todos recuperan un 2 % de vida por segundo', col: '#ff9ec7' },
  botas:     { nombre: 'Botas de prisa', txt: '+35 % de velocidad al andar', col: '#a5e05a' },
  coraza:    { nombre: 'Coraza de zanahoria', txt: '+25 % de vida para todos', col: '#ff8a2a' },
};

// El equipo (fuera de la partida): 6 huecos, cada objeto sube una estadística en % para TODOS los héroes.
const AS_EQUIPO = {
  huecos: ['casco', 'arma', 'armadura', 'guantes', 'pantalon', 'botas'],
  nombres: { casco: 'Casco', arma: 'Arma', armadura: 'Armadura', guantes: 'Guantes', pantalon: 'Pantalón', botas: 'Botas' },
  stats: { vida: 'Vida', ataque: 'Ataque', defensa: 'Defensa', velAtaque: 'Velocidad de ataque', velMov: 'Velocidad', critico: 'Prob. de crítico', danoCrit: 'Daño crítico', reflejo: 'Reflejo' },
  porHueco: { casco: ['vida', 'defensa'], arma: ['ataque', 'critico', 'danoCrit'], armadura: ['vida', 'defensa', 'reflejo'], guantes: ['velAtaque', 'critico'], pantalon: ['vida', 'defensa'], botas: ['velMov', 'velAtaque'] },
  rarezas: [{ nombre: 'Normal', col: '#c9d0ff', valor: [1, 2] }, { nombre: 'Raro', col: '#5fb0ff', valor: [2, 4] }, { nombre: 'Épico', col: '#c46bff', valor: [4, 7] }],
  mochila: 12,
  desencantar: r => [8, 20, 50][r],          // plumas que da deshacer un objeto
  herreria: niv => 15 * (niv + 1),           // plumas que cuesta subir un objeto un nivel (+1 % cada vez)
  cofreTienda: 60,                           // plumas que cuesta un cofre de equipo en la Tienda
};

// Los logros: premio en plumas. cond recibe SAVE.stats.
const AS_LOGROS = [
  { id: 'oro100', txt: 'Junta 100 de oro en total', premio: 20, cond: s => s.oroTotal >= 100 },
  { id: 'oro1000', txt: 'Junta 1.000 de oro en total', premio: 60, cond: s => s.oroTotal >= 1000 },
  { id: 'enem50', txt: 'Derrota a 50 enemigos', premio: 20, cond: s => s.enemigos >= 50 },
  { id: 'enem200', txt: 'Derrota a 200 enemigos', premio: 50, cond: s => s.enemigos >= 200 },
  { id: 'enem1000', txt: 'Derrota a 1.000 enemigos', premio: 120, cond: s => s.enemigos >= 1000 },
  { id: 'brujos2', txt: 'Lucha con 2 brujos', premio: 25, cond: s => (s.maxClase.brujo || 0) >= 2 },
  { id: 'tiradores3', txt: 'Lucha con 3 tiradores', premio: 25, cond: s => (s.maxClase.tirador || 0) >= 3 },
  { id: 'tanques3', txt: 'Lucha con 3 tanques', premio: 25, cond: s => (s.maxClase.tanque || 0) >= 3 },
  { id: 'equipo10', txt: 'Lucha con 10 héroes a la vez', premio: 30, cond: s => s.maxEquipo >= 10 },
  { id: 'equipo20', txt: 'Lucha con 20 héroes a la vez', premio: 80, cond: s => s.maxEquipo >= 20 },
  { id: 'zona1', txt: 'Termina los Sótanos de Microblizz', premio: 100, cond: s => s.zonas.includes(0) },
  { id: 'zona2', txt: 'Termina las Oficinas del CEO', premio: 150, cond: s => s.zonas.includes(1) },
  { id: 'jefes5', txt: 'Derrota a 5 jefes', premio: 60, cond: s => s.jefes >= 5 },
];

// Las zonas: cada una es una tira de niveles (salas) con el jefe al final. Se abre la siguiente al terminar una.
// enemigos: los que salen; fuerza: multiplica vida y daño con el nivel; arena: el dibujo del suelo (img/<arena>.png).
const AS_ZONAS = [
  { nombre: 'Sótanos de Microblizz', niveles: 18, arena: 'arena2', enemigos: ['enemigo-becario', 'enemigo-starbot', 'enemigo-parche', 'enemigo-soportebot'],
    jefe: { tipo: 'enemigo-fallen', fuerza: 6, escala: 1.6 }, fuerza: n => 1 + n * 0.11, cuantos: n => Math.min(15, 3 + Math.floor(n * 0.55)), rareza: [0, 0, 1] },
  { nombre: 'Oficinas del CEO', niveles: 24, arena: 'arena2-arboles', enemigos: ['enemigo-becario', 'enemigo-soportebot', 'enemigo-parche', 'enemigo-fallen', 'enemigo-cajabotin'],
    jefe: { tipo: 'enemigo-cajabotin', fuerza: 9, escala: 1.7 }, fuerza: n => 2.2 + n * 0.2, cuantos: n => Math.min(15, 4 + Math.floor(n * 0.6)), rareza: [0, 1, 1] },
  { nombre: 'La nube de servidores', niveles: 30, arena: 'arena2-jefe', enemigos: ['enemigo-starbot', 'enemigo-soportebot', 'enemigo-parche', 'enemigo-fallen', 'enemigo-cajabotin'],
    jefe: { tipo: 'jefe-ceo', fuerza: 3, escala: 1 }, fuerza: n => 4 + n * 0.28, cuantos: n => Math.min(15, 5 + Math.floor(n * 0.6)), rareza: [1, 1, 2] },
];
// Qué salas salen (aparte del jefe al final): de 1 a 3 por nivel y el jugador elige con las flechas.
const AS_SALAS = { combate: 0.6, cofre: 0.15, altar: 0.15, vacia: 0.1 };
