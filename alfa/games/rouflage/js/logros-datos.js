// Fans of Rouflage · LOS LOGROS (para siempre: dan Gotas una sola vez en la vida; con cuenta, rf_mision 'logro:id' del servidor) y los LOGROS SECRETOS.
// Cada logro mira un contador de SAVE.logros.c (c; si es una lista, cuenta cuántos distintos) o una cifra del juego (v: función; se guarda la mejor,
// para que no baje nunca). Los SECRETOS (secreto: true) no dicen qué piden hasta conseguirlos: solo se ve su título y la pista (p); al destaparse
// salen lo que pedían (d) y la broma de Microblizz (b). Los cuenta misiones.js (misionEvento) y los enseña misiones-pantalla.js.
'use strict';

// c: el contador; n: hasta dónde; g: las Gotas; ico: el dibujo (misiones-iconos.js)
const LOGROS = [
  // los de siempre
  { id: 'partidas10', t: 'Becario en prácticas', d: 'Juega 10 partidas', c: 'partidas', n: 10, g: 25, ico: 'partida' },
  { id: 'partidas50', t: 'Fijo discontinuo', d: 'Juega 50 partidas', c: 'partidas', n: 50, g: 50, ico: 'partida' },
  { id: 'partidas200', t: 'Empleado del mes', d: 'Juega 200 partidas', c: 'partidas', n: 200, g: 100, ico: 'partida' },
  { id: 'partidas500', t: 'Jornada intensiva', d: 'Juega 500 partidas', c: 'partidas', n: 500, g: 150, ico: 'partida' },
  { id: 'partidas1000', t: 'Contrato indefinido', d: 'Juega 1.000 partidas', c: 'partidas', n: 1000, g: 150, ico: 'partida' },
  { id: 'victorias10', t: 'Racha buena', d: 'Gana 10 partidas', c: 'victorias', n: 10, g: 30, ico: 'copa' },
  { id: 'victorias50', t: 'Ascenso sin sueldo', d: 'Gana 50 partidas', c: 'victorias', n: 50, g: 75, ico: 'copa' },
  { id: 'victorias100', t: 'Director de planta', d: 'Gana 100 partidas', c: 'victorias', n: 100, g: 100, ico: 'copa' },
  { id: 'victorias200', t: 'Dueño de la empresa', d: 'Gana 200 partidas', c: 'victorias', n: 200, g: 150, ico: 'copa' },
  { id: 'despidos10', t: 'Recursos Humanos', d: 'Despide a 10 colados', c: 'despidos', n: 10, g: 25, ico: 'sello' },
  { id: 'despidos50', t: 'Sello de oro', d: 'Despide a 50 colados', c: 'despidos', n: 50, g: 50, ico: 'sello' },
  { id: 'despidos200', t: 'Terror de la plantilla', d: 'Despide a 200 colados', c: 'despidos', n: 200, g: 100, ico: 'sello' },
  { id: 'despidos500', t: 'Inspector de trabajo', d: 'Despide a 500 colados', c: 'despidos', n: 500, g: 150, ico: 'sello' },
  { id: 'colado10', t: 'Nadie me ha visto', d: 'Gana 10 partidas de colado', c: 'ganaColado', n: 10, g: 40, ico: 'papeles' },
  { id: 'becario10', t: 'Linterna de plata', d: 'Gana 10 partidas de becario', c: 'ganaBecario', n: 10, g: 40, ico: 'linterna' },
  { id: 'intacto10', t: 'Ni un rasguño', d: 'Acaba 10 partidas de colado sin que te despidan', c: 'intactas', n: 10, g: 50, ico: 'escudo' },
  { id: 'intacto25', t: 'Hoja limpia', d: 'Acaba 25 partidas de colado sin que te despidan', c: 'intactas', n: 25, g: 100, ico: 'escudo' },
  // en línea y modos
  { id: 'linea1', t: 'Hola, internet', d: 'Juega 1 partida en línea', c: 'linea', n: 1, g: 25, ico: 'red' },
  { id: 'linea25', t: 'Habitual del turno de noche', d: 'Juega 25 partidas en línea', c: 'linea', n: 25, g: 75, ico: 'red' },
  { id: 'linea100', t: 'Trabajo remoto', d: 'Juega 100 partidas en línea', c: 'linea', n: 100, g: 150, ico: 'red' },
  { id: 'contagio10', t: 'Contagio controlado', d: 'Gana 10 partidas de Contagio', c: 'ganaContagio', n: 10, g: 50, ico: 'sello' },
  { id: 'ida10', t: 'Viaje de empresa', d: 'Gana 10 partidas de Ida y vuelta', c: 'ganaIda', n: 10, g: 50, ico: 'papeles' },
  { id: 'retrato10', t: 'Cara conocida', d: 'Gana 10 partidas de Retrato robot', c: 'ganaRetrato', n: 10, g: 50, ico: 'ojo' },
  { id: 'primero10', t: 'Cabeza de cartel', d: 'Queda el primero del ranking en 10 partidas en línea', c: 'primeros', n: 10, g: 75, ico: 'copa' },
  // camuflaje y posturas
  { id: 'camo90', t: 'Parte del mobiliario', d: 'Acaba una partida con un 90 % de camuflaje o más', c: 'camo90', n: 1, g: 40, ico: 'pincel' },
  { id: 'camo90x10', t: 'Invisible de verdad', d: 'Acaba 10 partidas con un 90 % de camuflaje o más', c: 'camo90', n: 10, g: 75, ico: 'pincel' },
  { id: 'camo100', t: 'Pintor invisible', d: 'Acaba una partida con un 100 % de camuflaje', c: 'camo100', n: 1, g: 75, ico: 'pincel' },
  { id: 'mapas90', t: 'Empleado tapizado', d: 'Acaba con un 90 % de camuflaje o más en los 7 mapas', c: 'mapas90', n: 7, g: 100, ico: 'pincel' },
  { id: 'posturas4', t: 'Las cuatro poses', d: 'Congélate en las 4 posturas', c: 'posturas', n: 4, g: 30, ico: 'postura' },
  { id: 'mapas4', t: 'Turista', d: 'Juega en 4 mapas distintos', c: 'mapas', n: 4, g: 30, ico: 'mapa' },
  { id: 'mapasTodos', t: 'Me lo conozco todo', d: 'Juega en los 7 mapas', c: 'mapas', n: 7, g: 60, ico: 'mapa' },
  { id: 'sustos10', t: 'Fantasma con oficio', d: 'Usa el poder del fantasma 10 veces', c: 'poderes', n: 10, g: 30, ico: 'fantasma' },
  { id: 'silbidos50', t: 'Pito de oro', d: 'Silba 50 veces por gusto', c: 'silbidos', n: 50, g: 30, ico: 'silbido' },
  { id: 'granadas20', t: 'Humo para todos', d: 'Usa la granada de humo 20 veces', c: 'granadas', n: 20, g: 30, ico: 'humo' },
  // social y rachas
  { id: 'compartir1', t: 'Estrella de las redes', d: 'Comparte tu escondite', c: 'compartidas', n: 1, g: 20, ico: 'foto' },
  { id: 'compartir10', t: 'Influencer de oficina', d: 'Comparte 10 escondites', c: 'compartidas', n: 10, g: 50, ico: 'foto' },
  { id: 'amigos5', t: 'Plantilla propia', d: 'Ten 5 amigos', v: () => (typeof AMG !== 'undefined' ? AMG.lista.length : 0), n: 5, g: 40, ico: 'amigos' },
  { id: 'referidos3', t: 'Recursos Humanos recomienda', d: 'Trae a 3 amigos con tu código', v: () => (typeof REF !== 'undefined' && REF.datos ? REF.datos.cuentan || 0 : 0), n: 3, g: 75, ico: 'amigos' },
  { id: 'pegatinas100', t: 'Pegatina de oro', d: 'Manda 100 pegatinas', c: 'pegatinas', n: 100, g: 40, ico: 'pegatina' },
  { id: 'racha7', t: 'Siete días sin faltar', d: 'Haz una racha de 7 días', v: () => (typeof diarioEstado === 'function' ? diarioEstado().racha || 0 : 0), n: 7, g: 50, ico: 'calendario' },
  { id: 'racha30', t: 'Un mes sin baja', d: 'Haz una racha de 30 días', v: () => (typeof diarioEstado === 'function' ? diarioEstado().racha || 0 : 0), n: 30, g: 150, ico: 'calendario' },
  // armario, pase y misiones
  { id: 'conjunto1', t: 'Uniforme completo', d: 'Consigue un conjunto del Rumble entero', v: () => logroTengo(k => k.startsWith('conjuntos:')), n: 1, g: 50, ico: 'percha' },
  { id: 'piezas25', t: 'Ropero lleno', d: 'Ten 25 piezas en el armario', v: () => logroTengo(() => true), n: 25, g: 75, ico: 'percha' },
  { id: 'pase40', t: 'Pase cerrado', d: 'Llega al nivel 40 del pase', v: () => (typeof paseNivel === 'function' ? paseNivel() : 0), n: 40, g: 100, ico: 'pase' },
  { id: 'misiones100', t: 'Adicto a las tareas', d: 'Cobra 100 misiones diarias', c: 'misionesHechas', n: 100, g: 100, ico: 'calendario' },

  // SECRETOS: título y pista; lo que piden y la broma, al conseguirlos
  { id: 'sNoche', secreto: true, t: 'Turno de noche', d: 'Juega una partida entre las 0:00 y las 5:00', p: 'Hay horas en las que hasta el becario de guardia duerme.', b: 'Microblizz no paga la nocturnidad.', c: 'sNoche', n: 1, g: 40, ico: 'luna' },
  { id: 'sEstatua', secreto: true, t: 'Estatua de sal', d: 'Pasa toda la caza congelado sin que te despidan', p: 'La mejor forma de no ser visto es ser un mueble.', b: 'Recursos Humanos te ha confundido con una planta.', c: 'sEstatua', n: 1, g: 50, ico: 'postura' },
  { id: 'sTopo', secreto: true, t: 'El topo', d: 'Gana de colado a menos de dos pasos de un becario', p: 'A veces el mejor escondite es el más descarado.', b: 'Estaba ahí. Todo el rato.', c: 'sTopo', n: 1, g: 50, ico: 'ojo' },
  { id: 'sImprocedente', secreto: true, t: 'Despido improcedente', d: 'Haz 3 despidos improcedentes en una misma partida', p: 'Recursos Humanos quiere hablar contigo.', b: 'El comité de empresa ya tiene tu foto.', c: 'sImprocedente', n: 1, g: 20, ico: 'sello' },
  { id: 'sSinPintar', secreto: true, t: 'Ni una gota', d: 'Gana de colado sin pintarte nada', p: '¿Para qué pintarse?', b: 'Lo llamamos minimalismo corporativo.', c: 'sSinPintar', n: 1, g: 60, ico: 'pincel' },
  { id: 'sVago', secreto: true, t: 'Becario despistado', d: 'Acaba una partida de becario sin despedir a nadie', p: 'A veces lo mejor es no hacer nada.', b: 'Lo has apuntado como teletrabajo.', c: 'sVago', n: 1, g: 20, ico: 'linterna' },
  { id: 'sSilbato', secreto: true, t: 'Silbato de oro', d: 'Silba 10 veces por gusto en una partida y que no te despidan', p: 'El que avisa no es traidor.', b: 'Te han regalado un silbato nuevo. Por algo será.', c: 'sSilbato', n: 1, g: 40, ico: 'silbido' },
  { id: 'sUltimo', secreto: true, t: 'El último de la fila', d: 'Sé el último colado en pie en una partida de Contagio', p: 'Cuando todos tus compañeros llevan camisa.', b: 'Te ofrecieron un ascenso a becario. Dijiste que no.', c: 'sUltimo', n: 1, g: 50, ico: 'escudo' },
  { id: 'sVenganza', secreto: true, t: 'Fantasma pesado', d: 'Usa el poder del fantasma en los últimos 10 s y que gane tu bando', p: 'La venganza llega tarde, pero llega.', b: 'Ni despedido dejas de trabajar.', c: 'sVenganza', n: 1, g: 40, ico: 'fantasma' },
  { id: 'sAyuda', secreto: true, t: 'Leer las instrucciones', d: 'Abre «Cómo se juega»', p: 'Nadie lo hace. Tú sí.', b: 'Eres el primero en leerlo. Incluido quien lo escribió.', c: 'sAyuda', n: 1, g: 20, ico: 'papeles' },
  { id: 'sTaller', secreto: true, t: 'Al taller', d: 'Pasa 5 minutos seguidos en Mi escenario', p: 'Hay quien juega sin jugar.', b: 'Microblizz te cobrará el alquiler.', c: 'sTaller', n: 1, g: 20, ico: 'percha' },
  { id: 'sMalaSuerte', secreto: true, t: 'Me pasé de bueno', d: 'Que te despidan con un 100 % de camuflaje', p: 'El camuflaje perfecto no sirve contra la mala suerte.', b: 'El becario dice que fue sin querer.', c: 'sMalaSuerte', n: 1, g: 40, ico: 'pincel' },
  { id: 'sCoche', secreto: true, t: 'El coche del jefe vuela', d: 'Mira saltar el coche del jefe en el parking', p: 'En el sótano -2 pasan cosas que nadie cree.', b: 'El seguro no cubre «el coche se fue volando».', c: 'sCoche', n: 1, g: 60, ico: 'coche' },
];
// cuántas piezas del armario tienes de verdad (lo comprado o ganado; el DESBLOQUEAR TODO de las pruebas no cuenta)
function logroTengo(filtro) { const a = typeof armarioEstado === 'function' ? armarioEstado() : null; return a ? a.tengo.filter(filtro).length : 0; }
const logroPorId = id => LOGROS.find(l => l.id === id);
