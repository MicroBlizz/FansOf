// Fans of Rouflage · LOS DATOS DE LAS MISIONES DIARIAS Y LOS LOGROS (misiones.js las cuenta, misiones-pantalla.js las enseña).
// Cada día salen 3 misiones, las mismas para todos: una FÁCIL, una MEDIA y una DIFÍCIL, sorteadas con la fecha de Madrid (misionesDeHoy).
// OJO: la lista, el orden, los premios y el sorteo están copiados en el servidor (servidor/58-rouflage-misiones.sql, rf_mision): si se cambia algo aquí,
// se cambia allí igual, o el servidor no dejará cobrar. Los logros son para siempre: dan Gotas una sola vez en la vida (con cuenta, también rf_mision 'logro:id').
'use strict';

// n: lo que hay que llegar; g: las Gotas; ico: el dibujo (misiones-pantalla.js)
const MISIONES = [
  [      // fáciles
    { id: 'jugar3', t: 'Juega 3 partidas', n: 3, g: 15, ico: 'partida' },
    { id: 'silbar3', t: 'Silba 3 veces por gusto', n: 3, g: 15, ico: 'silbido' },
    { id: 'granada', t: 'Usa la granada de humo', n: 1, g: 15, ico: 'humo' },
    { id: 'compartir', t: 'Comparte tu escondite', n: 1, g: 20, ico: 'foto' },
    { id: 'despide1', t: 'Despide a un colado', n: 1, g: 15, ico: 'sello' },
  ],
  [      // medias
    { id: 'ganar2', t: 'Gana 2 partidas', n: 2, g: 25, ico: 'copa' },
    { id: 'papeles', t: 'Juega una partida de colado y otra de becario', n: 2, g: 20, ico: 'papeles' },
    { id: 'despide3', t: 'Despide a 3 colados', n: 3, g: 20, ico: 'sello' },
    { id: 'linea', t: 'Juega 1 partida en línea', n: 1, g: 25, ico: 'red' },
    { id: 'backrooms', t: 'Juega una partida en las Backrooms', n: 1, g: 20, ico: 'mapa' },
    { id: 'poder', t: 'Usa el poder del fantasma', n: 1, g: 20, ico: 'fantasma' },
    { id: 'narices', t: 'Pasa 20 s delante de las narices de un becario', n: 20, g: 25, ico: 'ojo' },
  ],
  [      // difíciles
    { id: 'intacto', t: 'Acaba una partida de colado sin que te despidan', n: 1, g: 30, ico: 'escudo' },
    { id: 'camo80', t: 'Acaba una partida de colado con más del 80 % de camuflaje', n: 1, g: 25, ico: 'pincel' },
    { id: 'ultimos30', t: 'Despide a alguien en los últimos 30 s', n: 1, g: 30, ico: 'reloj' },
    { id: 'limpio', t: 'Gana de becario sin ningún despido improcedente', n: 1, g: 30, ico: 'copa' },
  ],
];

// c: el contador de SAVE.logros.c que mira; n: hasta dónde; g: las Gotas (una vez en la vida)
const LOGROS = [
  { id: 'partidas10', t: 'Becario en prácticas', d: 'Juega 10 partidas', c: 'partidas', n: 10, g: 25, ico: 'partida' },
  { id: 'partidas50', t: 'Fijo discontinuo', d: 'Juega 50 partidas', c: 'partidas', n: 50, g: 50, ico: 'partida' },
  { id: 'partidas200', t: 'Empleado del mes', d: 'Juega 200 partidas', c: 'partidas', n: 200, g: 100, ico: 'partida' },
  { id: 'victorias10', t: 'Racha buena', d: 'Gana 10 partidas', c: 'victorias', n: 10, g: 30, ico: 'copa' },
  { id: 'victorias50', t: 'Ascenso sin sueldo', d: 'Gana 50 partidas', c: 'victorias', n: 50, g: 75, ico: 'copa' },
  { id: 'despidos10', t: 'Recursos Humanos', d: 'Despide a 10 colados', c: 'despidos', n: 10, g: 25, ico: 'sello' },
  { id: 'despidos50', t: 'Sello de oro', d: 'Despide a 50 colados', c: 'despidos', n: 50, g: 50, ico: 'sello' },
  { id: 'despidos200', t: 'Terror de la plantilla', d: 'Despide a 200 colados', c: 'despidos', n: 200, g: 100, ico: 'sello' },
  { id: 'colado10', t: 'Nadie me ha visto', d: 'Gana 10 partidas de colado', c: 'ganaColado', n: 10, g: 40, ico: 'papeles' },
  { id: 'becario10', t: 'Linterna de plata', d: 'Gana 10 partidas de becario', c: 'ganaBecario', n: 10, g: 40, ico: 'papeles' },
  { id: 'camo90', t: 'Parte del mobiliario', d: 'Acaba una partida con un 90 % de camuflaje o más', c: 'camo90', n: 1, g: 40, ico: 'pincel' },
  { id: 'camo90x10', t: 'Invisible de verdad', d: 'Acaba 10 partidas con un 90 % de camuflaje o más', c: 'camo90', n: 10, g: 75, ico: 'pincel' },
  { id: 'intacto10', t: 'Ni un rasguño', d: 'Acaba 10 partidas de colado sin que te despidan', c: 'intactas', n: 10, g: 50, ico: 'escudo' },
  { id: 'linea1', t: 'Hola, internet', d: 'Juega 1 partida en línea', c: 'linea', n: 1, g: 25, ico: 'red' },
  { id: 'linea25', t: 'Habitual del turno de noche', d: 'Juega 25 partidas en línea', c: 'linea', n: 25, g: 75, ico: 'red' },
  { id: 'mapas4', t: 'Turista', d: 'Juega en 4 mapas distintos', c: 'mapas', n: 4, g: 30, ico: 'mapa' },
  { id: 'mapasTodos', t: 'Me lo conozco todo', d: 'Juega en los 7 mapas', c: 'mapas', n: 7, g: 60, ico: 'mapa' },
  { id: 'sustos10', t: 'Fantasma con oficio', d: 'Usa el poder del fantasma 10 veces', c: 'poderes', n: 10, g: 30, ico: 'fantasma' },
  { id: 'silbidos50', t: 'Pito de oro', d: 'Silba 50 veces por gusto', c: 'silbidos', n: 50, g: 30, ico: 'silbido' },
  { id: 'granadas20', t: 'Humo para todos', d: 'Usa la granada de humo 20 veces', c: 'granadas', n: 20, g: 30, ico: 'humo' },
  { id: 'compartir1', t: 'Estrella de las redes', d: 'Comparte tu escondite', c: 'compartidas', n: 1, g: 20, ico: 'foto' },
];

// el sorteo del día (igual que en el servidor, con los mismos números): la fecha AAAAMMDD y, en cada paso, s = s·48271 mod P y luego s = s² + 11 mod P
// (P = 2³¹ − 1). Con BigInt para que las cuentas sean exactas, como los bigint de la base de datos. Tres pasos de calentamiento y uno por lista.
function misionesSorteo(fecha) {
  const P = 2147483647n;
  let s = BigInt(+String(fecha).replace(/-/g, '') || 0) % P || 1n;
  const sig = () => { s = (s * 48271n) % P; s = (s * s + 11n) % P; return s; };
  sig(); sig(); sig();
  return MISIONES.map(lista => lista[Number(sig() % BigInt(lista.length))]);
}
const misionDia = () => gachaMadrid().fecha;      // el día de Madrid, para todos (con cuenta o sin ella)
const misionesDeHoy = () => misionesSorteo(misionDia());
const misionPorId = id => MISIONES.flat().find(m => m.id === id);
const logroPorId = id => LOGROS.find(l => l.id === id);
