// Fans of Cooking · NIVELES: la campaña «De becario a CEO» de la cafetería de Microblizz. Cada rango es una cocina con su idea y sus niveles;
// cuanto más alto el rango de quien come, más exige (menos tiempo por pedido, más recetas). Los mapas son texto, casilla a casilla.
// Leyenda: . suelo · # pared · = encimera · T tabla · F fogón · O horno · L olla · S fregadero · P platos · W ventanilla · X basura · E extintor
//          > < ^ v cinta · 1 2 dónde empiezan los cocineros · (espacio) vacío
//          ingredientes: p pan · q queso · j jamón · t tomate · l lechuga · k patata · c carne · m masa · n nata · z cerezas · h hueso · o ojo · f café · d fideos
'use strict';
const LETRA_ING = { p: 'pan', q: 'queso', j: 'jamon', t: 'tomate', l: 'lechuga', k: 'patata', c: 'carne', m: 'masa', n: 'nata', z: 'cereza', h: 'hueso', o: 'ojo', f: 'cafe', d: 'fideos' };
const RANGOS = [
  { id: 'becarios', nombre: 'Becarios', cocina: 'Cafetería de los becarios', fac: 'microblizz', color: '#7fd64a', jefe: 'becario',
    historia: 'Microblizz ha montado una cafetería y, como siempre, la lleva gente sin contrato. Empiezas dando de comer a los becarios: comen cualquier cosa, pero rápido.',
    niveles: [
      { nombre: 'Primer día', tiempo: 120, recetas: ['tostada'], cadencia: 13, dura: 55, estrellas: [60, 110, 160],
        mapa: ['#############', '#p..........#', '#T.1.....2..#', '#q..........#', '#=..........W', '#P..........X', '#############'] },
      { nombre: 'Menú del becario', tiempo: 150, recetas: ['tostada', 'ensalada'], cadencia: 12, dura: 52, estrellas: [100, 190, 280],
        mapa: ['#p#q#t#l#####', '#...........#', '#T.1.....2.T#', '#...........#', '#=.........=W', '#P.........SX', '#############'] },
      { nombre: 'Hora punta', tiempo: 170, recetas: ['tostada', 'ensalada', 'bocadillo'], cadencia: 11, dura: 50, estrellas: [140, 260, 380],
        mapa: ['#p#q#j#t#l###', '#...........#', '#T.1.....2.T#', '#...=====...#', '#=.........=W', '#P.........SX', '#############'] },
    ] },
  { id: 'juniors', nombre: 'Juniors', cocina: 'La plancha de los juniors', fac: 'ciber', color: '#33e0ff', jefe: 'starbot',
    historia: 'Ascenso. Ahora cocinas para los juniors, que quieren cosas calientes. La sartén no espera: lo que se queda de más se quema, y lo quemado arde.',
    niveles: [
      { nombre: 'A la plancha', tiempo: 150, recetas: ['patatas', 'hamburguesa'], cadencia: 13, dura: 55, estrellas: [100, 190, 280],
        mapa: ['#p#k#c#######', '#...........#', '#T.1.....2.F#', '#..........F#', '#=.........=W', '#P.E.......SX', '#############'] },
      { nombre: 'Con todo', tiempo: 170, recetas: ['hamburguesa', 'completa', 'patatas'], cadencia: 12, dura: 52, estrellas: [140, 260, 380],
        mapa: ['#p#k#c#l#t###', '#...........#', '#T.1.....2.F#', '#T..=====..F#', '#=.........=W', '#P.E.......SX', '#############'] },
      { nombre: 'Humo en la cocina', tiempo: 180, recetas: ['hamburguesa', 'completa', 'combo'], cadencia: 11, dura: 50, estrellas: [170, 320, 470],
        mapa: ['#p#k#c#l#t###', '#...........#', '#T.1..=..2.F#', '#T....=....F#', '#=....=....FW', '#P.E..=....SX', '#############'] },
    ] },
  { id: 'seniors', nombre: 'Seniors', cocina: 'La sala de los seniors', fac: 'nomuertos', color: '#5ef2a0', jefe: 'skullknight',
    historia: 'Los seniors llevan tantas horas extra que ya solo toman café y sopa. La cocina tiene una cinta que lleva las cosas de un lado al otro: úsala o te tocará dar la vuelta.',
    niveles: [
      { nombre: 'Café para todos', tiempo: 150, recetas: ['cafe', 'sopa'], cadencia: 13, dura: 56, estrellas: [100, 190, 280],
        mapa: ['#f#t#k#######', '#...........#', '#T.1.....2.L#', '#..........L#', '#=.........=W', '#P.........SX', '#############'] },
      { nombre: 'La cinta', tiempo: 170, recetas: ['cafe', 'sopa', 'formol'], cadencia: 12, dura: 52, estrellas: [140, 260, 380],
        mapa: ['#f#t#k#o#h###', '#.....#.....#', '#T.1..>..2.L#', '#T....#....L#', '#=....<....=W', '#P....#....SX', '#############'] },
      { nombre: 'Ramen de madrugada', tiempo: 180, recetas: ['sopa', 'formol', 'ramen'], cadencia: 11, dura: 50, estrellas: [170, 320, 470],
        mapa: ['#d#t#k#o#h#l#', '#.....#.....#', '#T.1..>..2.L#', '#T....#....L#', '#=....<....LW', '#P....#....SX', '#############'] },
    ] },
  { id: 'leads', nombre: 'Leads', cocina: 'El horno de los leads', fac: 'memes', color: '#ffcb3d', jefe: 'memelord',
    historia: 'Los leads piden pizza en cada reunión. Se monta en la encimera (masa, tomate, queso) y el montón entero va al horno. Si se te olvida dentro, ya sabes.',
    niveles: [
      { nombre: 'Masa madre', tiempo: 150, recetas: ['pizza'], cadencia: 14, dura: 58, estrellas: [90, 170, 250],
        mapa: ['#m#t#q#######', '#...........#', '#T.1.....2.O#', '#T.........O#', '#=.........=W', '#P.E.......SX', '#############'] },
      { nombre: 'Reunión con tarta', tiempo: 170, recetas: ['pizza', 'tarta'], cadencia: 12, dura: 54, estrellas: [130, 250, 370],
        mapa: ['#m#t#q#n#z###', '#...........#', '#T.1.=====2.#', '#T...=...=.O#', '#=...=...=.OW', '#P.E.......SX', '#############'] },
      { nombre: 'Pizza para el foro', tiempo: 180, recetas: ['pizza', 'tarta', 'pizzaxl', 'ambrosia'], cadencia: 11, dura: 50, estrellas: [160, 300, 450],
        mapa: ['#m#t#q#n#z#j#', '#...........#', '#T.1..>..2.O#', '#T....#....O#', '#=....<....=W', '#P.E..#....SX', '#############'] },
    ] },
  { id: 'directores', nombre: 'Directores', cocina: 'El comedor de dirección', fac: 'phony', color: '#b032e0', jefe: 'presi', apagones: true,
    historia: 'Los directores comen de todo y lo quieren ya. Además IAhorro apaga los fogones «para ahorrar luz»: si ves uno apagado, dale a USAR para encenderlo.',
    niveles: [
      { nombre: 'Carta completa', tiempo: 170, recetas: ['bocadillo', 'hamburguesa', 'cafe'], cadencia: 12, dura: 52, estrellas: [140, 260, 380],
        mapa: ['#p#q#j#c#f###', '#...........#', '#T.1.....2.F#', '#T..=====..L#', '#=.........=W', '#P.E.......SX', '#############'] },
      { nombre: 'Partidos en dos', tiempo: 180, recetas: ['completa', 'sopa', 'pizza'], cadencia: 11, dura: 50, estrellas: [160, 300, 450],
        mapa: ['#p#t#q#l#m#c#', '#...........#', '#T.1..#..2.F#', '#T....#....L#', '#k....#....OW', '#P.E..#....SX', '#############'] },
      { nombre: 'Apagón general', tiempo: 190, recetas: ['combo', 'ramen', 'pizzaxl'], cadencia: 10, dura: 48, estrellas: [180, 340, 520],
        mapa: ['#p#k#c#d#h#l#', '#...........#', '#T.1..>..2.F#', '#T....#....L#', '#m....<..q.OW', '#P.E..#j.t.SX', '#############'] },
    ] },
  { id: 'ceo', nombre: 'El CEO', cocina: 'El despacho del CEO', fac: 'microblizz', color: '#ff7a1a', jefe: 'ceo', apagones: true,
    historia: 'Último piso. El CEO de Microblizz come solo, pide de todo y nunca espera. Si le das de comer, igual hasta te hace un contrato. Igual.',
    niveles: [
      { nombre: 'La cena del CEO', tiempo: 200, recetas: ['merienda', 'completa', 'formol', 'tarta'], cadencia: 10, dura: 48, estrellas: [200, 380, 580],
        mapa: ['#p#j#q#t#l#c#', '#...........#', '#T.1..=..2.F#', '#T....=....L#', '#o....=....OW', '#P.E..=.h..SX', '####m#n#z####'] },
      { nombre: 'Contrato indefinido', tiempo: 220, recetas: ['merienda', 'combo', 'ramen', 'pizzaxl', 'ambrosia'], cadencia: 9, dura: 46, estrellas: [240, 450, 680],
        mapa: ['#p#j#q#t#l#c#', '#.....#.....#', '#T.1..>..2.F#', '#T....#....L#', '#d....<....OW', '#P.E..#.h..SX', '####m#n#k####'] },
    ] },
];
RANGOS.forEach((r, ri) => r.niveles.forEach((n, ni) => { n.id = `${ri + 1}-${ni + 1}`; n.ri = ri; n.ni = ni; }));
const NIVEL = id => { for (const r of RANGOS) for (const n of r.niveles) if (n.id === id) return n; return null; };
