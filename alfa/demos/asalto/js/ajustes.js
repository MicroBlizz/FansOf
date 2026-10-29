// Fans of Asalto · AJUSTES: el nombre de la demo para core, la clave de su partida y TODA la calibración: héroes, clases,
// enemigos, la tienda, las reliquias y cómo es cada piso de la mazmorra. Se carga antes de lo común.
'use strict';
const AJUSTES = {
  id: 'asalto',                // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-asalto',   // la clave de la partida en este navegador
};

// Las clases. umbral = cuántos héroes DISTINTOS de esa clase hacen falta para cada nivel de su habilidad.
const AS_CLASES = {
  luchador: { nombre: 'Luchador', col: '#e8572c', umbral: [2], txt: ['+30 % de daño a los luchadores'] },
  tanque:   { nombre: 'Tanque',   col: '#4f8ae8', umbral: [2], txt: ['Escudo para los tanques cada 6 s'] },
  asesino:  { nombre: 'Asesino',  col: '#9b4fd8', umbral: [2], txt: ['Sus golpes envenenan'] },
  tirador:  { nombre: 'Tirador',  col: '#5fb83a', umbral: [2], txt: ['+40 % de velocidad de ataque a los tiradores'] },
  mago:     { nombre: 'Mago',     col: '#f0a92a', umbral: [2, 3], txt: ['Los magos dañan en área', 'Área más grande y +30 % de daño mágico'] },
  sanador:  { nombre: 'Sanador',  col: '#f06aa0', umbral: [2], txt: ['Curan el doble'] },
};

// Los héroes: los Animales Locos en versión medieval. tier = coste en la tienda y lo raros que son.
// tipo de ataque: 'cuerpo' (cuerpo a cuerpo), 'flecha', 'magia' (bola que vuela), 'bomba' (cae en un área), 'cura' (cura al más herido).
// salto: el asesino salta a la retaguardia al empezar.
const AS_HEROES = {
  'heroe-bunny':     { nombre: 'CrazyBunny', clases: ['luchador', 'tanque'], tier: 1, vida: 120, dano: 14, cada: 1.0, alcance: 26, vel: 46, ataque: 'cuerpo' },
  'heroe-ardilla':   { nombre: 'MadSquirrel', clases: ['tirador'], tier: 1, vida: 70, dano: 11, cada: 0.9, alcance: 170, vel: 40, ataque: 'flecha' },
  'heroe-huron':     { nombre: 'HurónNinja', clases: ['asesino', 'luchador'], tier: 1, vida: 85, dano: 15, cada: 0.8, alcance: 24, vel: 60, ataque: 'cuerpo', salto: true },
  'heroe-mechavaca': { nombre: 'MechaVaca', clases: ['tanque'], tier: 2, vida: 260, dano: 10, cada: 1.3, alcance: 26, vel: 34, ataque: 'cuerpo' },
  'heroe-zorro':     { nombre: 'SlyFox', clases: ['asesino'], tier: 2, vida: 90, dano: 22, cada: 0.9, alcance: 24, vel: 62, ataque: 'cuerpo', salto: true },
  'heroe-castor':    { nombre: 'BoomBeaver', clases: ['tirador', 'mago'], tier: 2, vida: 80, dano: 18, cada: 1.6, alcance: 150, vel: 38, ataque: 'bomba', area: 40 },
  'heroe-mapache':   { nombre: 'JunkCoon', clases: ['mago', 'sanador'], tier: 3, vida: 85, dano: 26, cada: 1.4, alcance: 160, vel: 36, ataque: 'magia', area: 0 },
  'heroe-suricata':  { nombre: 'MeerCat', clases: ['sanador', 'mago'], tier: 3, vida: 90, dano: 16, cada: 1.2, alcance: 150, vel: 36, ataque: 'cura' },
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

// La tienda: probabilidad de cada tier según su nivel, lo que cuesta subirla y refrescarla, y cuántos héroes caben.
const AS_TIENDA = {
  huecos: 5,
  prob: { 1: [1, 0, 0], 2: [0.65, 0.35, 0], 3: [0.45, 0.4, 0.15], 4: [0.3, 0.42, 0.28], 5: [0.2, 0.4, 0.4] },
  mejorar: [0, 4, 7, 10, 14],   // coste para pasar del nivel i+1 al i+2
  refrescar: 1,
  equipo: n => 2 + n,           // cuántos héroes distintos caben con la tienda en el nivel n
  nivelMax: 3,                  // nivel máximo de un héroe (cada copia comprada sube uno)
  porNivel: 0.75,               // cada nivel del héroe: +75 % de vida y daño
};

// La partida: oro y corazones al empezar, y lo que da cada cosa.
const AS_CFG = {
  oro: 6, corazones: 3,
  oroVictoria: s => 3 + Math.floor(s / 3),   // s = número de combate de la partida
  oroCofre: [5, 9],
  gemasJefe: 5,
  velocidad: [1, 2],                         // velocidades de la batalla
};

// Las reliquias: valen para todo el grupo hasta el final de la partida.
const AS_RELIQUIAS = {
  colmillo:  { nombre: 'Colmillo de oro', txt: '+20 % de daño', col: '#ffcf3a' },
  coraza:    { nombre: 'Coraza de zanahoria', txt: '+25 % de vida', col: '#ff8a2a' },
  reloj:     { nombre: 'Reloj sin pilas', txt: '+20 % de velocidad de ataque', col: '#7fd0ff' },
  espejo:    { nombre: 'Espejo roto', txt: 'Devuelve el 20 % del daño recibido', col: '#c9d6ff' },
  botas:     { nombre: 'Botas de prisa', txt: '+35 % de velocidad al andar', col: '#a5e05a' },
  tirita:    { nombre: 'Tirita mágica', txt: 'Recuperan vida poco a poco en el combate', col: '#ff9ec7' },
  hucha:     { nombre: 'Hucha rota', txt: '+3 de oro en cada victoria', col: '#ffd76a' },
  dado:      { nombre: 'Dado trucado', txt: '15 % de golpes críticos (x2)', col: '#ff6a5a' },
  escudo:    { nombre: 'Escudo de cartón', txt: 'Todos empiezan con un escudo', col: '#c9a26a' },
};

// La mazmorra por zonas. Cada piso: sus salas en columnas (el jugador elige por dónde seguir) y quién sale.
// enemigos: los que pueden salir; n: cuántos en el primer combate y cuántos más por cada combate; fuerza: multiplica vida y daño.
const AS_ZONAS = [
  { nombre: 'Sótanos de Microblizz', pisos: [
    { enemigos: ['enemigo-becario', 'enemigo-starbot', 'enemigo-parche'], n: [2, 0.8], fuerza: 1, jefe: { tipo: 'enemigo-fallen', fuerza: 4, escala: 1.5 } },
    { enemigos: ['enemigo-becario', 'enemigo-starbot', 'enemigo-soportebot', 'enemigo-parche'], n: [3, 0.8], fuerza: 1.9, jefe: { tipo: 'enemigo-cajabotin', fuerza: 4.5, escala: 1.6 } },
    { enemigos: ['enemigo-soportebot', 'enemigo-parche', 'enemigo-fallen', 'enemigo-cajabotin'], n: [4, 0.9], fuerza: 2.9, jefe: { tipo: 'jefe-ceo', fuerza: 1.5, escala: 1 } },
  ] },
  { nombre: 'Oficinas del CEO', bloqueada: true, pisos: [] },
  { nombre: 'La nube de servidores', bloqueada: true, pisos: [] },
];
// El mapa de cada piso: 5 columnas de salas; la primera es la entrada y la última, el jefe.
const AS_MAPA = { columnas: 5, filas: 3, tipos: { combate: 0.6, cofre: 0.2, reliquia: 0.2 } };
