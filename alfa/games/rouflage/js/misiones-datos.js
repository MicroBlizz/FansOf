// Fans of Rouflage · LOS DATOS DE LAS MISIONES DIARIAS Y SEMANALES (misiones.js las cuenta, misiones-pantalla.js las enseña; los logros en logros-datos.js).
// Cada día salen 6 misiones, las mismas para todos: la FIJA (Empleado del día: cobra 3 de las otras) y 5 sorteadas con la fecha de Madrid
// (misionesDeHoy): 2 FÁCILES, 2 MEDIAS y 1 DIFÍCIL, y como mucho UNA de las que piden jugar en línea (red: true), para que nadie se quede sin poder.
// Cada lunes salen las SEMANALES: la fija (Empleado del mes: sé Empleado del día 5 días) y 4 sorteadas con la fecha del lunes.
// El servidor (servidor/88-rouflage-misiones-semana.sql, rf_mision) hace el MISMO sorteo con las listas que le llegan en sus datos
// (herramientas/rouflage/rouflage_datos.js las saca de aquí: MIS_DATOS_SERVIDOR). Si se cambia el sorteo aquí, se cambia allí igual.
'use strict';

// n: lo que hay que llegar; g: las Gotas; ico: el dibujo (misiones-iconos.js); red: pide jugar en línea
const MISIONES = [
  [      // fáciles
    { id: 'jugar3', t: 'Juega 3 partidas', n: 3, g: 15, ico: 'partida' },
    { id: 'silbar3', t: 'Silba 3 veces por gusto', n: 3, g: 15, ico: 'silbido' },
    { id: 'granada', t: 'Usa la granada de humo', n: 1, g: 15, ico: 'humo' },
    { id: 'compartir', t: 'Comparte tu escondite', n: 1, g: 20, ico: 'foto' },
    { id: 'despide1', t: 'Despide a un colado', n: 1, g: 15, ico: 'sello' },
    { id: 'posturas2', t: 'Congélate en 2 posturas distintas', n: 2, g: 15, ico: 'postura' },
    { id: 'diario', t: 'Recoge el premio diario', n: 1, g: 15, ico: 'regalo' },
    { id: 'colado2', t: 'Juega 2 partidas de colado', n: 2, g: 15, ico: 'pincel' },
    { id: 'becario2', t: 'Juega 2 partidas de becario', n: 2, g: 15, ico: 'linterna' },
  ],
  [      // medias
    { id: 'ganar2', t: 'Gana 2 partidas', n: 2, g: 25, ico: 'copa' },
    { id: 'papeles', t: 'Juega una partida de colado y otra de becario', n: 2, g: 20, ico: 'papeles' },
    { id: 'despide3', t: 'Despide a 3 colados', n: 3, g: 20, ico: 'sello' },
    { id: 'linea', t: 'Juega 1 partida en línea', n: 1, g: 25, ico: 'red', red: true },
    { id: 'backrooms', t: 'Juega una partida en las Backrooms', n: 1, g: 20, ico: 'mapa' },
    { id: 'poder', t: 'Usa el poder del fantasma', n: 1, g: 20, ico: 'fantasma' },
    { id: 'narices', t: 'Pasa 20 s delante de las narices de un becario', n: 20, g: 25, ico: 'ojo' },
    { id: 'mapas3', t: 'Juega en 3 mapas distintos', n: 3, g: 25, ico: 'mapa' },
    { id: 'contagio', t: 'Juega una partida de Contagio', n: 1, g: 20, ico: 'sello', red: true },
    { id: 'ida', t: 'Juega una partida de Ida y vuelta', n: 1, g: 20, ico: 'papeles', red: true },
    { id: 'retrato', t: 'Juega una partida de Retrato robot', n: 1, g: 20, ico: 'ojo', red: true },
    { id: 'talento', t: 'Usa 3 veces la habilidad de tu talento', n: 3, g: 20, ico: 'rayo' },
  ],
  [      // difíciles
    { id: 'intacto', t: 'Acaba una partida de colado sin que te despidan', n: 1, g: 30, ico: 'escudo' },
    { id: 'camo80', t: 'Acaba una partida de colado con más del 80 % de camuflaje', n: 1, g: 25, ico: 'pincel' },
    { id: 'ultimos30', t: 'Despide a alguien en los últimos 30 s', n: 1, g: 30, ico: 'reloj' },
    { id: 'limpio', t: 'Gana de becario sin ningún despido improcedente', n: 1, g: 30, ico: 'copa' },
    { id: 'linea2', t: 'Gana 2 partidas en línea', n: 2, g: 35, ico: 'red', red: true },
    { id: 'camo95', t: 'Acaba una partida de colado con un 95 % de camuflaje o más', n: 1, g: 35, ico: 'pincel' },
    { id: 'seguidas2', t: 'Acaba 2 partidas seguidas de colado sin que te despidan', n: 2, g: 30, ico: 'escudo' },
    { id: 'primero', t: 'Queda el primero del ranking en una partida en línea', n: 1, g: 40, ico: 'copa', red: true },
  ],
];
// la fija de cada día: cuenta las otras misiones de hoy que ya has cobrado (el servidor lo comprueba)
const MISION_FIJA = { id: 'dmeta3', t: 'Empleado del día: cobra 3 misiones de hoy', n: 3, g: 50, ico: 'estrella', fija: true };
const MIS_ORDEN = [0, 0, 1, 1, 2];      // de qué lista sale cada una de las 5 sorteadas

const SEMANALES = [
  { id: 'wjugar', t: 'Juega 30 partidas', n: 30, g: 100, ico: 'partida' },
  { id: 'wganar', t: 'Gana 15 partidas', n: 15, g: 120, ico: 'copa' },
  { id: 'wdespide', t: 'Despide a 50 colados', n: 50, g: 120, ico: 'sello' },
  { id: 'wlinea', t: 'Juega 20 partidas en línea', n: 20, g: 150, ico: 'red' },
  { id: 'wmapas', t: 'Juega en los 7 mapas', n: 7, g: 100, ico: 'mapa' },
  { id: 'wintacto', t: 'Acaba 8 partidas de colado sin que te despidan', n: 8, g: 150, ico: 'escudo' },
  { id: 'wcamo', t: 'Acaba 10 partidas de colado con más del 80 % de camuflaje', n: 10, g: 130, ico: 'pincel' },
  { id: 'wpoder', t: 'Usa el poder del fantasma 10 veces', n: 10, g: 100, ico: 'fantasma' },
  { id: 'wmodos', t: 'Gana una partida de cada modo: Normal, Contagio, Ida y vuelta y Retrato robot', n: 4, g: 150, ico: 'copa' },
  { id: 'wamigos', t: 'Juega 10 partidas con amigos', n: 10, g: 120, ico: 'amigos' },
  { id: 'wdiarias', t: 'Cobra 20 misiones diarias', n: 20, g: 120, ico: 'calendario' },
  { id: 'wpegatinas', t: 'Manda 15 pegatinas', n: 15, g: 100, ico: 'pegatina' },
];
const SEMANA_FIJA = { id: 'wmeta5', t: 'Empleado del mes: sé Empleado del día 5 días esta semana', n: 5, g: 250, ico: 'estrella', fija: true };
const SEMANA_CUANTAS = 4;

// el sorteo (igual que en el servidor, con los mismos números): la semilla AAAAMMDD y, en cada paso, s = s·48271 mod P y luego s = s² + 11 mod P
// (P = 2³¹ − 1). Con BigInt para que las cuentas sean exactas, como los bigint de la base de datos. `calienta` pasos al principio y uno por misión:
// de la lista que toque, quitando las ya elegidas y, si ya salió una en línea, las demás en línea; se coge la de la posición s mod (cuántas quedan).
function misionSorteoLista(fecha, calienta, listas, orden, reds) {
  const P = 2147483647n;
  let s = BigInt(+String(fecha).replace(/-/g, '') || 0) % P || 1n;
  const sig = () => { s = (s * 48271n) % P; s = (s * s + 11n) % P; return s; };
  for (let i = 0; i < calienta; i++) sig();
  const sale = []; let red = false;
  for (const k of orden) {
    const quedan = listas[k].filter(id => !sale.includes(id) && !(red && reds.includes(id)));
    if (!quedan.length) continue;
    const id = quedan[Number(sig() % BigInt(quedan.length))];
    sale.push(id); if (reds.includes(id)) red = true;
  }
  return sale;
}
const MIS_IDS = MISIONES.map(l => l.map(m => m.id)), MIS_RED = MISIONES.flat().filter(m => m.red).map(m => m.id);
const misionPorId = id => (id === MISION_FIJA.id ? MISION_FIJA : MISIONES.flat().find(m => m.id === id));
const semanalPorId = id => (id === SEMANA_FIJA.id ? SEMANA_FIJA : SEMANALES.find(m => m.id === id));
const misionDia = () => gachaMadrid().fecha;      // el día de Madrid, para todos (con cuenta o sin ella)
// el lunes de esta semana en Madrid (AAAA-MM-DD): las semanales cambian el lunes a las 0:00
function misionLunes() {
  const m = gachaMadrid(), d = new Date(m.fecha + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - (m.dow + 6) % 7);
  return d.toISOString().slice(0, 10);
}
const misionesSorteo = fecha => misionSorteoLista(fecha, 3, MIS_IDS, MIS_ORDEN, MIS_RED).map(misionPorId);
const semanalesSorteo = lunes => misionSorteoLista(lunes, 5, [SEMANALES.map(m => m.id)], Array(SEMANA_CUANTAS).fill(0), []).map(semanalPorId);
const misionesDeHoy = () => [MISION_FIJA, ...misionesSorteo(misionDia())];
const semanalesDeEsta = () => [SEMANA_FIJA, ...semanalesSorteo(misionLunes())];
// lo que necesita el servidor (rouflage_datos.js lo copia en tablas_juego.datos.misiones)
function MIS_DATOS_SERVIDOR() {
  const premios = {}; for (const m of [MISION_FIJA, ...MISIONES.flat()]) premios[m.id] = m.g;
  const semana = {}; for (const m of [SEMANA_FIJA, ...SEMANALES]) semana[m.id] = m.g;
  const logros = {}; for (const l of LOGROS) logros[l.id] = l.g;
  return { listas: MIS_IDS, orden: MIS_ORDEN, red: MIS_RED, premios, fija: { id: MISION_FIJA.id, n: MISION_FIJA.n },
    semana: { lista: SEMANALES.map(m => m.id), n: SEMANA_CUANTAS, premios: semana, fija: { id: SEMANA_FIJA.id, n: SEMANA_FIJA.n }, diarias: { id: 'wdiarias', n: semanalPorId('wdiarias').n } }, logros };
}
