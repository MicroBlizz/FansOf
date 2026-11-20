// Fans of Pop · COMPAÑEROS PARA COLECCIONAR (datos; tarea #142, ADR 157): las páginas del álbum, la ficha de cada compañero (rareza,
// modo en el que ayuda, habilidad y cómo se consigue), las 28 habilidades y los precios. Los 13 de siempre siguen en PP_SLIMES
// (js/ajustes.js) con su dibujo y su fx de hoy; los 20 Animales nuevos van en PP_COMP.NUEVOS para que, con el flag `companeros`
// cerrado, nada cambie (ni el rescate ni los dibujos que se cargan). Las reglas están en js/coleccion.js.
'use strict';
const PP_COMP = (() => {
  const f = o => Object.freeze(o);
  // modo: N = Niveles, P = Pesadilla, D = Duelos contra la máquina. Las 11 primeras son las de hoy.
  const HAB = f({
    saltito: f({ modo: 'N', nombre: 'Saltito', texto: 'Cada pocos pops salta al tablero y hace pop gratis en una de la solución.' }),
    lluvia: f({ modo: 'N', nombre: 'Lluvia', texto: 'Cada muchos pops hace pop gratis en varias de la solución.' }),
    hielo: f({ modo: 'N', nombre: 'Rompehielos', texto: 'Salta antes a las burbujas de hielo.' }),
    concha: f({ modo: 'N', nombre: 'Abreconchas', texto: 'Salta antes a las conchas.' }),
    cohete: f({ modo: 'N', nombre: 'Mecha corta', texto: 'Salta antes a los cohetes y los hace estallar.' }),
    burbuja: f({ modo: 'N', nombre: 'Ola', texto: 'Salta antes a las burbujeantes.' }),
    horas: f({ modo: 'N', nombre: 'Horas extra', texto: 'Con un COMBO x3, el siguiente toque no cuenta.' }),
    chivato: f({ modo: 'N', nombre: 'Chivatazo', texto: 'Con un COMBO x2 te marca una de la solución.' }),
    gordo: f({ modo: 'N', nombre: 'Premio doble', texto: 'Con 4 pops en un toque, +1 toque. Con 5, +1 corazón.' }),
    cielo: f({ modo: 'N', nombre: 'Cielo despejado', texto: '+1 toque extra al empezar el nivel.' }),
    fortuna: f({ modo: 'N', nombre: 'Fortuna', texto: 'Al ganar un nivel nuevo, la mitad de monedas más.' }),
    estrella: f({ modo: 'N', nombre: 'Imán de estrellas', texto: 'La 3.ª estrella pide un toque menos.' }),
    ticket: f({ modo: 'N', nombre: 'Feriante', texto: 'Con 3 estrellas, +1 ticket de la Feria del finde.' }),
    primero: f({ modo: 'N', nombre: 'Buen comienzo', texto: 'Con el primer toque de cada nivel salta y hace pop gratis en una de la solución.' }),
    rescate: f({ modo: 'N', nombre: 'Al rescate', texto: 'Una vez por nivel, al quedarte sin toques te da 2 más.' }),
    racha: f({ modo: 'N', nombre: 'Victorias a salvo', texto: 'Una vez al día, perder no corta tus victorias seguidas.' }),
    limpia: f({ modo: 'N', nombre: 'Limpieza', texto: 'Al ganar, +5 monedas por cada toque extra.' }),
    linterna: f({ modo: 'P', nombre: 'Linterna', texto: 'Te marca una burbuja de la solución.' }),
    rebobina: f({ modo: 'P', nombre: 'Marcha atrás', texto: 'Deshace tu último toque.' }),
    fantasma: f({ modo: 'P', nombre: 'Toque fantasma', texto: 'Tu primer toque no cuenta.' }),
    calma: f({ modo: 'P', nombre: 'Calma', texto: '+1 toque extra al empezar.' }),
    volteo: f({ modo: 'P', nombre: 'Volteo', texto: 'Da la vuelta a una sola burbuja, sin tocar sus vecinas.' }),
    lupa: f({ modo: 'D', nombre: 'Lupa', texto: 'Una pista gratis por duelo (marca la jugada que gana).' }),
    deshaz: f({ modo: 'D', nombre: 'Otra vez', texto: 'Un deshacer gratis por duelo.' }),
    despiste: f({ modo: 'D', nombre: 'Despiste', texto: 'El rival se equivoca un poco más.' }),
    salida: f({ modo: 'D', nombre: 'Saque', texto: 'Eliges quién empieza el duelo.' }),
    quita: f({ modo: 'D', nombre: 'Pellizco', texto: 'Antes de empezar quitas una burbuja del tablero.' }),
    bolsa: f({ modo: 'D', nombre: 'Hucha', texto: 'Ganar un duelo da 5 monedas más.' }),
  });
  // los 20 Animales: dibujo por código (color, color2 y pinta, como PP_SLIMES) hasta que los pinte Yoshi, y su fx
  const a = (nombre, color, color2, pinta, fx) => f({ nombre, color, color2, pinta, fx: f(fx) });
  const DIBUJOS = f({
    ardilla: a('Ardillita', '#e8a060', '#b8662c', 'orejas', { primero: 1 }),
    castor: a('Castorcito', '#c08a5a', '#8a5a30', 'dientes', { limpia: 5 }),
    capibara: a('Capibara', '#d8a878', '#a87848', '', { pCalma: 1 }),
    pinguino: a('Pingüinito', '#9fc8f0', '#2f5a8a', '', { salta: 11, golpes: 1, prefiere: 1 }),
    pato: a('Patito', '#ffe680', '#e0b020', '', { dMonedas: 5 }),
    cangrejo: a('Cangrejito', '#ff9a80', '#d8583c', 'antena', { salta: 13, golpes: 1, prefiere: 2 }),
    osito: a('Osito', '#d8b090', '#a87a58', 'orejas', { pGratis: 1 }),
    mariquita: a('Mariquita', '#ff8080', '#d83a3a', 'antena', { ticket: 1 }),
    zorro: a('Zorrito', '#ffa860', '#e06a20', 'orejas', { dFallo: 0.1 }),
    suricata: a('Suricata', '#f0d0a0', '#c0a070', '', { pPista: 1 }),
    mapache: a('Mapachito', '#b0b8c8', '#5a6070', 'orejas', { pDeshaz: 1 }),
    pulpito: a('Pulpito', '#ff9ad0', '#d85aa0', '', { salta: 12, golpes: 1, prefiere: 4 }),
    mariposa: a('Mariposa', '#ffc0e8', '#ff7ab8', 'antena', { estrella: 1 }),
    luciernaga: a('Luciérnaga', '#e8ff90', '#a8c830', 'antena', { dPista: 1 }),
    erizo: a('Erizo', '#d0a080', '#7a5038', '', { dDeshaz: 1 }),
    huron: a('Hurón Ninja', '#a08060', '#3a2a20', 'orejas', { dQuita: 1 }),
    pezglobo: a('Pez globo', '#ffe0a0', '#e0a040', 'dientes', { pVolteo: 1 }),
    caballito: a('Caballito de mar', '#a0f0e0', '#40b8a0', '', { rescate: 2 }),
    panda: a('Panda', '#ffffff', '#3a3a3a', 'orejas', { racha: 1 }),
    mechavaca: a('MechaVaca', '#ffb0d0', '#b84f86', 'antena', { dSaque: 1 }),
  });
  // la ficha de cada uno: rareza (c, r, e, l), página, habilidad y cómo se consigue (`via`)
  const i = (rar, pag, hab, via) => f({ rar, pag, hab, via: f(via) });
  const RESC = { t: 'rescate' };
  const INFO = f({
    lola: i('c', 'siempre', 'chivato', { t: 'serie' }),
    becario: i('c', 'siempre', 'horas', RESC),
    bunny: i('r', 'siempre', 'saltito', RESC),
    cofre: i('r', 'siempre', 'gordo', RESC),
    ceo: i('e', 'siempre', 'lluvia', RESC),
    copito: i('c', 'siempre', 'hielo', RESC),
    medusa: i('c', 'siempre', 'concha', RESC),
    algodon: i('e', 'siempre', 'lluvia', RESC),
    nubecita: i('r', 'siempre', 'cielo', RESC),
    hada: i('r', 'siempre', 'cohete', RESC),
    sirena: i('r', 'siempre', 'burbuja', RESC),
    maneki: i('e', 'siempre', 'fortuna', RESC),
    astro: i('l', 'siempre', 'lluvia', RESC),
    ardilla: i('c', 'animales', 'primero', { t: 'cofre' }),
    castor: i('c', 'animales', 'limpia', { t: 'cofre' }),
    capibara: i('c', 'animales', 'calma', { t: 'cofre' }),
    pinguino: i('c', 'animales', 'hielo', RESC),
    pato: i('c', 'animales', 'bolsa', { t: 'duelos', n: 10 }),
    cangrejo: i('c', 'animales', 'concha', RESC),
    osito: i('c', 'animales', 'fantasma', { t: 'cofre' }),
    mariquita: i('c', 'animales', 'ticket', { t: 'feria' }),
    zorro: i('r', 'animales', 'despiste', { t: 'duelos', n: 25 }),
    suricata: i('r', 'animales', 'linterna', { t: 'pase' }),
    mapache: i('r', 'animales', 'rebobina', RESC),
    pulpito: i('r', 'animales', 'burbuja', { t: 'tienda', perlas: 40 }),
    mariposa: i('r', 'animales', 'estrella', { t: 'feria' }),
    luciernaga: i('r', 'animales', 'lupa', { t: 'paseP' }),
    erizo: i('r', 'animales', 'deshaz', { t: 'cofre' }),
    huron: i('e', 'animales', 'quita', { t: 'jefes', n: 3 }),
    pezglobo: i('e', 'animales', 'volteo', { t: 'tienda', perlas: 60 }),
    caballito: i('e', 'animales', 'rescate', { t: 'paseP' }),
    panda: i('l', 'animales', 'racha', { t: 'pagina' }),
    mechavaca: i('l', 'animales', 'salida', { t: 'jefe' }),
  });
  // los nuevos con el nombre y el texto de su habilidad, como los de PP_SLIMES (pasiva y texto), para las fichas de siempre
  const NUEVOS = f(Object.fromEntries(Object.entries(DIBUJOS).map(([id, d]) => [id, f({ ...d, pasiva: HAB[INFO[id].hab].nombre, texto: HAB[INFO[id].hab].texto })])));
  // el álbum: solo las páginas que ya han salido (la siguiente facción, otra tanda)
  const PAGINAS = f([
    f({ id: 'siempre', nombre: 'Los de siempre', premio: f({ marco: 'gelatina', monedas: 300, perlas: 1 }) }),
    f({ id: 'animales', nombre: 'Animales', premio: f({ marco: 'huellas', monedas: 300, perlas: 1, companero: 'panda' }) }),
  ]);
  const RAREZAS = f({ c: 'Común', r: 'Raro', e: 'Épico', l: 'Legendario' });
  // Pepins, 19-11-2026: casillas de cada equipo (de serie, tope y lo que cuesta cada una de las siguientes), estrellas y repetidos
  const PRECIOS = f({
    casillas: f({
      N: f({ serie: 3, tope: 5, monedas: f([200, 400]), perlas: f([20, 40]) }),
      P: f({ serie: 1, tope: 3, monedas: f([300, 600]), perlas: null }),
      D: f({ serie: 1, tope: 3, monedas: f([300, 600]), perlas: null }),
    }),
    estrellas: f([100, 250, 500, 1000]),   // monedas para pasar de 1 a 2, de 2 a 3, de 3 a 4 y de 4 a 5 (más 1 repetido cada vez)
    sobra: 25,                             // monedas por un repetido que ya no hace falta (compañero a 5 estrellas)
  });
  // qué escalón del pase (de 30) y qué tramo de la Feria del finde (desde 0) dan un compañero, además de su premio de siempre
  const VIAS = f({
    pase: f({ gratis: f({ 15: 'suricata' }), premium: f({ 15: 'luciernaga', 30: 'caballito' }) }),
    feria: f({ 4: 'mariquita', 9: 'mariposa' }),
  });
  return f({ HAB, NUEVOS, INFO, PAGINAS, RAREZAS, PRECIOS, VIAS, IDS: f(Object.keys(INFO)) });
})();
