// Fans of Cooking · NIVELES: tres campañas, cada una un edificio de oficinas que se sube planta a planta: la Torre Microblizz, la oficina de Phony
// y el centro de datos de IAhorro. Cada planta (rango) es una cocina con su idea y sus niveles; al final de cada planta se sube en el ASCENSOR,
// un nivel de jefe en una cocina diminuta donde el jefe de la planta come mientras subes. Cuanto más alto el rango, más exige. Los mapas son texto.
// Leyenda: . suelo · # pared · = encimera · T tabla · F fogón · O horno · L olla · S fregadero · P platos · W ventanilla · X basura · E extintor
//          > < ^ v cinta · 1 2 dónde empiezan los cocineros · (espacio) vacío
//          ingredientes: p pan · q queso · j jamón · t tomate · l lechuga · k patata · c carne · m masa · n nata · z cerezas · h hueso · o ojo · f café · d fideos
'use strict';
const LETRA_ING = { p: 'pan', q: 'queso', j: 'jamon', t: 'tomate', l: 'lechuga', k: 'patata', c: 'carne', m: 'masa', n: 'nata', z: 'cereza', h: 'hueso', o: 'ojo', f: 'cafe', d: 'fideos' };
const CAMPANAS = [
  { id: 'microblizz', nombre: 'Torre Microblizz', fac: 'microblizz', color: '#ff7a1a', historia: 'La torre de Microblizz tiene cafetería en cada planta y la lleva gente sin contrato. Empiezas abajo, con los becarios, y cada ascensor te sube un rango.' },
  { id: 'phony', nombre: 'Oficina de Phony', fac: 'streamers', color: '#ff4bd1', historia: 'Phony ha comprado el edificio de al lado y quiere su propia cafetería. Cobra la entrada, cobra la salida y cobra por mirar la carta.' },
  { id: 'iahorro', nombre: 'Centro de datos de IAhorro', fac: 'ciber', color: '#7fd0ff', historia: 'IAhorro no come, pero sus servidores sí: en su edificio todo se apaga «para ahorrar luz» y el jefe de arriba es la propia IA.' },
];
const RANGOS = [
  { id: 'becarios', campana: 'microblizz', nombre: 'Becarios', cocina: 'Cafetería de los becarios', fac: 'microblizz', color: '#7fd64a', jefe: 'becario',
    historia: 'Microblizz ha montado una cafetería y, como siempre, la lleva gente sin contrato. Empiezas dando de comer a los becarios: comen cualquier cosa, pero rápido.',
    niveles: [
      { nombre: 'Primer día', tiempo: 120, recetas: ['tostada'], cadencia: 13, dura: 55, estrellas: [60, 110, 160],
        mapa: ['#############', '#p..........=', '#T.1.....2..=', '#q..........#', '#=..........W', '#P..........X', '#############'] },
      { nombre: 'Menú del becario', tiempo: 150, recetas: ['tostada', 'ensalada'], cadencia: 12, dura: 52, estrellas: [100, 190, 280],
        mapa: ['#p#q#t#l#####', '#...........=', '#T.1.....2.T#', '#...........=', '#=..........W', '#P..........X', '##########S##'] },
      { nombre: 'Hora punta', tiempo: 170, recetas: ['tostada', 'ensalada', 'bocadillo'], cadencia: 11, dura: 50, estrellas: [140, 260, 380],
        mapa: ['#p#q#j#t#l###', '#...........#', '#T.1.....2.T#', '#...=====...#', '#=..........W', '#P..........X', '##########S##'] },
    ] },
  { id: 'juniors', campana: 'microblizz', nombre: 'Juniors', cocina: 'La plancha de los juniors', fac: 'ciber', color: '#33e0ff', jefe: 'starbot',
    historia: 'Ascenso. Ahora cocinas para los juniors, que quieren cosas calientes. La sartén no espera: lo que se queda de más se quema, y lo quemado arde.',
    niveles: [
      { nombre: 'A la plancha', tiempo: 150, recetas: ['patatas', 'hamburguesa'], cadencia: 13, dura: 55, estrellas: [100, 190, 280],
        mapa: ['#p#k#c#######', '#...........=', '#T.1.....2.F#', '#..........F#', '#=..........W', '#P.E........X', '##########S##'] },
      { nombre: 'Con todo', tiempo: 170, recetas: ['hamburguesa', 'completa', 'patatas'], cadencia: 12, dura: 52, estrellas: [140, 260, 380],
        mapa: ['#p#k#c#l#t###', '#...........#', '#T.1.....2.F#', '#T..=====..F#', '#=..........W', '#P.E........X', '##########S##'] },
      { nombre: 'Humo en la cocina', tiempo: 180, recetas: ['hamburguesa', 'completa', 'combo'], cadencia: 11, dura: 50, estrellas: [170, 320, 470],
        mapa: ['#p#k#c#l#t###', '#..........F#', '#T.1..=..2.F#', '#T....=....F#', '#=....=.....W', '#P.E..=.....X', '##########S##'] },
    ] },
  { id: 'seniors', campana: 'microblizz', nombre: 'Seniors', cocina: 'La sala de los seniors', fac: 'nomuertos', color: '#5ef2a0', jefe: 'skullknight',
    historia: 'Los seniors llevan tantas horas extra que ya solo toman café y sopa. La cocina tiene una cinta que lleva las cosas de un lado al otro: úsala o te tocará dar la vuelta.',
    niveles: [
      { nombre: 'Café para todos', tiempo: 150, recetas: ['cafe', 'sopa'], cadencia: 13, dura: 56, estrellas: [100, 190, 280],
        mapa: ['#f#t#k#######', '#...........=', '#T.1.....2.L#', '#..........L#', '#=..........W', '#P..........X', '##########S##'] },
      { nombre: 'La cinta', tiempo: 170, recetas: ['cafe', 'sopa', 'formol'], cadencia: 12, dura: 52, estrellas: [140, 260, 380],
        mapa: ['#f#t#k#o#h###', '#.....#.....=', '#T.1..>..2.L#', '#T....#....L#', '#=....<.....W', '#P....#.....X', '##########S##'] },
      { nombre: 'Ramen de madrugada', tiempo: 180, recetas: ['sopa', 'formol', 'ramen'], cadencia: 11, dura: 50, estrellas: [170, 320, 470],
        mapa: ['#d#t#k#o#h#l#', '#.....#.....=', '#T.1..>..2.L#', '#T....#....L#', '#=....<.....W', '#P....#.....X', '##########S##'] },
    ] },
  { id: 'leads', campana: 'phony', nombre: 'Leads', cocina: 'El horno de los leads', fac: 'memes', color: '#ffcb3d', jefe: 'memelord',
    historia: 'Los leads piden pizza en cada reunión. Se monta en la encimera (masa, tomate, queso) y el montón entero va al horno. Si se te olvida dentro, ya sabes.',
    niveles: [
      { nombre: 'Masa madre', tiempo: 150, recetas: ['pizza'], cadencia: 14, dura: 58, estrellas: [90, 170, 250],
        mapa: ['#m#t#q#######', '#...........=', '#T.1.....2.O#', '#T.........O#', '#=..........W', '#P.E........X', '##########S##'] },
      { nombre: 'Reunión con tarta', tiempo: 170, recetas: ['pizza', 'tarta'], cadencia: 12, dura: 54, estrellas: [130, 250, 370],
        mapa: ['#m#t#q#n#z###', '#..........O#', '#T.1.=====2.#', '#T...=...=.O#', '#=...=...=..W', '#P.E........X', '##########S##'] },
      { nombre: 'Pizza para el foro', tiempo: 180, recetas: ['pizza', 'tarta', 'pizzaxl', 'ambrosia'], cadencia: 11, dura: 50, estrellas: [160, 300, 450],
        mapa: ['#m#t#q#n#z#j#', '#...........=', '#T.1..>..2.O#', '#T....#....O#', '#=....<.....W', '#P.E..#.....X', '##########S##'] },
    ] },
  { id: 'directores', campana: 'phony', nombre: 'Directores', cocina: 'El comedor de dirección', fac: 'phony', color: '#b032e0', jefe: 'presi', apagones: true,
    historia: 'Los directores comen de todo y lo quieren ya. Además IAhorro apaga los fogones «para ahorrar luz»: si ves uno apagado, dale a USAR para encenderlo.',
    niveles: [
      { nombre: 'Carta completa', tiempo: 170, recetas: ['bocadillo', 'hamburguesa', 'cafe'], cadencia: 12, dura: 52, estrellas: [140, 260, 380],
        mapa: ['#p#q#j#c#f###', '#...........#', '#T.1.....2.F#', '#T..=====..L#', '#=..........W', '#P.E........X', '##########S##'] },
      { nombre: 'Partidos en dos', tiempo: 180, recetas: ['completa', 'sopa', 'pizza'], cadencia: 11, dura: 50, estrellas: [160, 300, 450],
        mapa: ['#p#t#q#l#m#c#', '#...........=', '#T.1..O..2.F#', '#T....#....L#', '#k....#.....W', '#P.E..#.....X', '##########S##'] },
      { nombre: 'Apagón general', tiempo: 190, recetas: ['combo', 'ramen', 'pizzaxl'], cadencia: 10, dura: 48, estrellas: [180, 340, 520],
        mapa: ['#p#k#c#d#h#l#', '#.....O.....=', '#T.1..>..2.F#', '#T....#....L#', '#m....<..q..W', '#P.E..#j.t..X', '##########S##'] },
    ] },
  { id: 'ceo', campana: 'iahorro', nombre: 'El CEO', cocina: 'La sala de servidores', fac: 'ciber', color: '#7fd0ff', jefe: 'ceo', apagones: true,
    historia: 'El edificio de IAhorro: frío, oscuro y con la luz cortada a ratos. Arriba espera el CEO que firmó el contrato con la IA. Pide de todo y nunca espera.',
    niveles: [
      { nombre: 'La cena del CEO', tiempo: 200, recetas: ['merienda', 'completa', 'formol', 'tarta'], cadencia: 10, dura: 48, estrellas: [200, 380, 580],
        mapa: ['#p#j#q#t#l#c#', '#.....h.....#', '#T.1..=..2.O#', '#T....=....F#', '#o....=...L.W', '#P.E........X', '####m#n#z#S##'] },
      { nombre: 'Contrato indefinido', tiempo: 220, recetas: ['merienda', 'combo', 'ramen', 'pizzaxl', 'ambrosia'], cadencia: 9, dura: 46, estrellas: [240, 450, 680],
        mapa: ['#p#j#q#t#l#c#', '#.....h.....=', '#T.1..>..2.O#', '#T....#....F#', '#d....<...L.W', '#P.E........X', '####m#n#k#S##'] },
    ] },
];
// El ASCENSOR: el nivel de jefe que cierra cada planta. Una cocina diminuta (la cabina) con cuatro cajones (a b c d), dos estaciones (A B) que cambian
// según la planta, y el jefe comiendo al otro lado de la ventanilla mientras subes. Menos tiempo por pedido que en la planta.
const CABINA = ['   #a#b#c#   ', '   d.....#   ', '   T.1.2.A   ', '   =.....W   ', '   P.....B   ', '   E.....X   ', '   ####S##   '];
const ASCENSORES = {
  becarios: { nombre: 'Ascensor con el becario jefe', recetas: ['tostada', 'bocadillo'], ings: 'pqj', est: '==' },
  juniors: { nombre: 'Ascensor con StarBot', recetas: ['patatas', 'hamburguesa'], ings: 'kpc', est: 'FF' },
  seniors: { nombre: 'Ascensor con el caballero', recetas: ['cafe', 'sopa'], ings: 'ftk', est: 'LL' },
  leads: { nombre: 'Ascensor con el MemeLord', recetas: ['pizza'], ings: 'mtq', est: 'OO' },
  directores: { nombre: 'Ascensor con el Presi', recetas: ['hamburguesa', 'cafe'], ings: 'pcf', est: 'FL' },
  ceo: { nombre: 'Ascensor con el CEO', recetas: ['combo', 'cafe'], ings: 'pckf', est: 'FL' },
};
for (const r of RANGOS) {
  const a = ASCENSORES[r.id]; if (!a) continue;
  const letras = { a: a.ings[0], b: a.ings[1], c: a.ings[2], d: a.ings[3] || '#', A: a.est[0], B: a.est[1] };
  const mapa = CABINA.map(f => f.replace(/[abcdAB]/g, ch => letras[ch]));
  r.niveles.push({ nombre: a.nombre, ascensor: true, tiempo: 140, recetas: a.recetas, cadencia: 7, dura: 36, estrellas: [0, 0, 0], mapa });
}
// las estrellas salen del ritmo de pedidos: lo que da de sí el nivel si se sirve casi todo, al 30 %, 50 % y 70 %
for (const r of RANGOS) for (const n of r.niveles) { const tope = (n.tiempo / n.cadencia) * 28; n.estrellas = [0.3, 0.5, 0.7].map(k => Math.round(tope * k / 10) * 10); }
RANGOS.forEach((r, ri) => r.niveles.forEach((n, ni) => { n.id = `${ri + 1}-${ni + 1}`; n.ri = ri; n.ni = ni; }));
const CAMPANA = id => CAMPANAS.find(c => c.id === id);
const plantasDe = cid => RANGOS.filter(r => r.campana === cid);
const NIVEL = id => { for (const r of RANGOS) for (const n of r.niveles) if (n.id === id) return n; return null; };
