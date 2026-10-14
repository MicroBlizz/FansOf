// Fans of Crush · NIVELES: la Escalera Corporativa. Cada nivel es un dibujo del tablero, los movimientos, los colores, los objetivos,
// las estrellas (puntos para 1, 2 y 3) y el memorándum satírico de Microblizz que sale antes de jugar.
// Dibujo: '.' casilla · '#' hueco · 't' cinta de CANCELADO · 'i'/'I' StarBot congelado (1/2 capas) · 'k' CajaBotín · 'e' becario
// '1'-'6': una ficha fija de ese animal (el nivel 1 viene entero dibujado para el tutorial)
// Objetivos: { t: 'color', c, n } juntar caras · 'puntos' · 'cinta' · 'hielo' · 'caja' · 'becario' (n) · 'jefe'
'use strict';
const CR_LISO = ['........', '........', '........', '........', '........', '........', '........', '........'];
const CR_PLANTAS = [
  { n: 'PLANTA 1', nombre: 'Cubículos de becarios', desde: 1, hasta: 15 },
  { n: 'PLANTA 2', nombre: 'Contabilidad creativa', desde: 16, hasta: 30, obras: true },
];
const CR_NIVELES = [
  { id: 1, nombre: 'Onboarding', movs: 18, colores: 5, mapa: ['31322323', '13325113', '24215441', '25511442', '35131123', '14432232', '52121221', '11422335'], obj: [{ t: 'color', c: 0, n: 20 }], est: [7500, 11000, 13500], musica: 'animales',
    memo: 'Bienvenido a Microblizz. Tu primera tarea: juntar CrazyBunnies hasta que Recursos Humanos te pierda la pista.',
    lola: 'Arrastra una ficha para juntar 3 caras iguales en línea. Las que se mueven son una buena jugada.' },
  { id: 2, nombre: 'Reunión que pudo ser un email', movs: 18, colores: 5, mapa: CR_LISO, obj: [{ t: 'color', c: 2, n: 22 }, { t: 'color', c: 1, n: 22 }], est: [7000, 11500, 14000], musica: 'streamers',
    memo: 'La reunión dura tres horas y no tiene orden del día. Junta SlyFoxes y MeerCats para escaparte antes del turno de preguntas.',
    lola: 'Junta 4 en línea y sale un cohete Chaos Jump: barre una fila entera. Recursos Humanos odia los cohetes.' },
  { id: 3, nombre: 'Café de máquina', movs: 14, colores: 5, mapa: ['........', '........', '..tttt..', '..tttt..', '..tttt..', '..tttt..', '........', '........'], obj: [{ t: 'cinta' }], est: [7000, 10500, 13000], musica: 'memes',
    memo: 'La máquina del café está precintada con cinta de CANCELADO. Quita toda la cinta: sin café no hay productividad.',
    lola: 'La cinta se quita juntando caras encima de ella. Los especiales también la arrancan.' },
  { id: 4, nombre: 'Team building obligatorio', movs: 18, colores: 5, mapa: ['........', '........', '........', '........', '.i.ii.i.', '........', 'I.i..i.I', '........'], obj: [{ t: 'hielo' }], est: [8500, 13500, 17000], musica: 'animales',
    memo: 'Los StarBots se han quedado congelados en la actividad de confianza. Rompe el hielo (literalmente).',
    lola: 'Un StarBot congelado se rompe juntando caras justo a su lado. Los especiales le dan de lleno.' },
  { id: 5, nombre: 'Evaluación de desempeño', movs: 20, colores: 5, mapa: CR_LISO, obj: [{ t: 'puntos', n: 9000 }], est: [9000, 14500, 16500], musica: 'heroes',
    memo: 'Tu evaluación depende de una cifra que nadie entiende. Consigue los puntos y sonríe a la cámara.',
    lola: 'Junta en forma de L o de T y sale la dinamita de BoomBeaver: explota todo lo que tiene alrededor.' },
  { id: 6, nombre: 'Becarios en la fotocopiadora', movs: 22, colores: 5, mapa: ['..e..e..', '........', '........', '........', '........', '........', '........', '........'], salidas: [0, 1, 2, 3, 4, 5, 6, 7], obj: [{ t: 'becario', n: 2 }], est: [9500, 14500, 17500], musica: 'streamers',
    memo: 'Dos becarios llevan desde marzo atascados en la fotocopiadora. Bájalos hasta la SALIDA antes de que les pidan otro café.',
    lola: 'Los becarios no se juntan con nadie: despide lo que tienen debajo para que bajen hasta la SALIDA.' },
  { id: 7, nombre: 'Reorganización', movs: 15, colores: 5, mapa: ['##....##', '#......#', '..tttt..', '.tt..tt.', '.tt..tt.', '..tttt..', '#......#', '##....##'], obj: [{ t: 'cinta' }], est: [5500, 10000, 12000], musica: 'ciber',
    memo: 'La empresa se reorganiza por quinta vez este mes. El organigrama tiene forma de rombo y cinta por todas partes.' },
  { id: 8, nombre: 'Viernes de despidos', movs: 21, colores: 6, mapa: ['........', '........', '........', '.I....I.', '...II...', '.I....I.', '........', '........'], obj: [{ t: 'color', c: 3, n: 20 }, { t: 'hielo' }], est: [6500, 9500, 11500], musica: 'nomuertos',
    memo: 'Viernes, 17:59. Los StarBots de seguridad están helados y los MadSquirrels, muy nerviosos.',
    lola: 'Estos StarBots llevan doble capa de hielo: hay que darles dos veces.' },
  { id: 9, nombre: 'KPI imposible', movs: 25, colores: 6, mapa: CR_LISO, obj: [{ t: 'puntos', n: 8000 }, { t: 'color', c: 5, n: 20 }], est: [8000, 12000, 13500], musica: 'memes',
    memo: 'El nuevo KPI es «más». Más puntos y más MechaVacas. Nadie sabe cuántos, pero todos.',
    lola: 'Junta 5 en línea y sale la lápida del Láser IP Burial: cámbiala con una cara y entierra a todas las iguales.' },
  { id: 10, nombre: 'Cajas de botín', movs: 16, colores: 5, mapa: ['........', '........', '........', 'k..kk..k', '........', '.k....k.', '........', '........'], obj: [{ t: 'caja' }], est: [6500, 11500, 14000], musica: 'heroes',
    memo: 'Microblizz mete los finiquitos en cajas de botín. Ábrelas a golpes: dentro puede haber cualquier cosa (sobre todo nada).',
    lola: 'Las CajaBotín aguantan tres golpes. El número dice cuántos le quedan.' },
  { id: 11, nombre: 'Reunión de sinergias', movs: 26, colores: 5, mapa: ['...e....', 'e.......', '........', 'tt....tt', 'tt....tt', '..t..t..', '..t..t..', '........'], salidas: [0, 1, 2, 3, 4, 5, 6, 7], becarios: 1, obj: [{ t: 'becario', n: 3 }, { t: 'cinta' }], est: [14000, 21000, 24500], musica: 'streamers',
    memo: 'Tres becarios han entrado en una reunión de sinergias y no encuentran la salida. En realidad, nadie la encuentra.' },
  { id: 12, nombre: 'Auditoría sorpresa', movs: 19, colores: 6, mapa: ['........', '........', '.i....i.', '..I..I..', '...ii...', '..I..I..', '.i....i.', '........'], obj: [{ t: 'hielo' }, { t: 'color', c: 4, n: 20 }], est: [5500, 10000, 11500], musica: 'ciber',
    memo: 'Llegan los auditores. Esconde las pruebas: rompe los StarBots y junta JunkCoons con cara de inocente.' },
  { id: 13, nombre: 'Recorte de presupuesto', movs: 19, colores: 5, mapa: ['..t..t..', '.tt..tt.', '#tt..tt#', '##t..t##', '##t..t##', '#tt..tt#', '.tt..tt.', '..t..t..'], obj: [{ t: 'cinta' }], est: [8000, 11500, 14500], musica: 'nomuertos',
    memo: 'Han recortado el presupuesto y, de paso, la mesa. Quita la cinta de CANCELADO de lo que queda.' },
  { id: 14, nombre: 'Cierre trimestral', movs: 23, colores: 5, mapa: ['..e..e..', '........', 'k......k', '..I..I..', '........', '..I..I..', 'k......k', '........'], salidas: [0, 1, 2, 3, 4, 5, 6, 7], obj: [{ t: 'becario', n: 2 }, { t: 'caja' }, { t: 'hielo' }], est: [13500, 18500, 21500], musica: 'heroes',
    memo: 'Cierre del trimestre: becarios, cajas y StarBots a la vez. Si sobrevives, te regalan una taza con el logo.' },
  { id: 15, nombre: 'Jefe de RRHH: SurvivalBot', movs: 24, colores: 5, mapa: ['........', '........', '........', '..i..i..', '........', '........', '........', '........'], obj: [{ t: 'jefe' }], est: [18500, 24000, 27000], musica: 'boss0', jefe: { vida: 420, cada: 3 },
    memo: 'SurvivalBot, el nuevo jefe de Recursos Humanos, ha sido programado para congelar sueldos. Desconéctalo antes de que se le acabe la batería a tu paciencia.',
    lola: 'Cada cara que despides le quita vida al jefe. Cada pocos movimientos congela fichas: rómpelas o te quedas sin sitio.' },
];
const crNivel = id => CR_NIVELES.find(n => n.id === id);
// nombres de los objetivos (para el memorándum y la ventana de derrota)
function crTextoObjetivo(o) {
  if (o.t === 'color') return tr(`Junta ${o.n} ${tr(CR_FICHAS[o.c].np)}`);
  if (o.t === 'puntos') return tr(`Consigue ${fmt(o.n)} puntos`);
  if (o.t === 'cinta') return tr('Quita toda la cinta de CANCELADO');
  if (o.t === 'hielo') return tr('Rompe todos los StarBots congelados');
  if (o.t === 'caja') return tr('Abre todas las CajaBotín');
  if (o.t === 'becario') return tr(`Rescata ${o.n} becarios`);
  if (o.t === 'jefe') return tr('Despide a SurvivalBot');
  return '';
}
