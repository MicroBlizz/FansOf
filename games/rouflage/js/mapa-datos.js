// Fans of Rouflage (prototipo) · EL MAPA EN DATOS: la estación de Microblizz en una cuadrícula de casillas de 20. Aquí están las
// salas, los pasos entre ellas, los muebles y los carteles; de esto salen la rejilla (dónde se pisa) y las paredes que se ven de frente.
// Para cambiar el mapa basta con tocar estas listas: todo lo demás se calcula solo.
'use strict';

const CEL = 20, MW = 84, MH = 60, ANCHO = MW * CEL, ALTO = MH * CEL;
const VACIO = 0, SUELO = 1, CARA = 2;   // lo que hay en cada casilla: muro visto desde arriba, suelo o pared vista de frente
const ALTO_CARA = 3;                    // casillas de alto de la pared de frente (60: cabe una alubia entera delante)

// salas: x, y, w, h en casillas; `suelo` y `pared` dicen con qué dibujo se pintan (suelos.js y paredes.js)
const SALAS = [
  { id: 'oficinas', nombre: 'Oficinas', x: 2, y: 5, w: 24, h: 22, suelo: 'moqueta', pared: 'rayas' },
  { id: 'cafeteria', nombre: 'Cafetería', x: 29, y: 5, w: 26, h: 24, suelo: 'damero', pared: 'azulejo' },
  { id: 'nube', nombre: 'La Nube', x: 58, y: 5, w: 24, h: 20, suelo: 'placas', pared: 'racks' },
  { id: 'pasillo', nombre: 'Pasillo', x: 20, y: 35, w: 44, h: 6, suelo: 'flechas', pared: 'ventanas' },
  { id: 'rrhh', nombre: 'Recursos Humanos', x: 2, y: 35, w: 14, h: 22, suelo: 'rombos', pared: 'madera' },
  { id: 'almacen', nombre: 'Almacén', x: 67, y: 31, w: 15, h: 26, suelo: 'hormigon', pared: 'chapa' },
  { id: 'archivo', nombre: 'Juegos cerrados', x: 20, y: 46, w: 44, h: 11, suelo: 'hexagonos', pared: 'piedra' },
];
// pasos entre salas (también en casillas)
const PASOS = [
  { id: 'p-of-caf', x: 26, y: 13, w: 3, h: 4 },
  { id: 'p-caf-nube', x: 55, y: 12, w: 3, h: 4 },
  { id: 'p-of-pas', x: 21, y: 27, w: 4, h: 8 },
  { id: 'p-caf-pas', x: 40, y: 29, w: 4, h: 6 },
  { id: 'p-rrhh', x: 16, y: 35, w: 4, h: 4 },
  { id: 'p-pas-alm', x: 64, y: 35, w: 3, h: 4 },
  { id: 'p-nube-alm', x: 72, y: 25, w: 4, h: 6 },
  { id: 'p-pas-arch1', x: 30, y: 41, w: 4, h: 5 },
  { id: 'p-pas-arch2', x: 50, y: 41, w: 4, h: 5 },
];
for (const p of PASOS) { p.suelo = 'umbral'; p.pared = 'marco'; p.paso = true; }
const ZONAS = [...SALAS, ...PASOS];
for (const z of ZONAS) { z.px = z.x * CEL; z.py = z.y * CEL; z.pw = z.w * CEL; z.ph = z.h * CEL; }
const zona = id => ZONAS.find(z => z.id === id);

// la rejilla: qué hay en cada casilla y de qué zona es
const GRID = new Uint8Array(MW * MH), ZONA_DE = new Int8Array(MW * MH).fill(-1);
ZONAS.forEach((z, i) => { for (let y = z.y; y < z.y + z.h; y++) for (let x = z.x; x < z.x + z.w; x++) { GRID[y * MW + x] = SUELO; ZONA_DE[y * MW + x] = i; } });
// encima de cada suelo que acaba por arriba, la pared de frente (hasta 3 casillas de muro)
for (let y = 1; y < MH; y++) for (let x = 0; x < MW; x++) {
  if (GRID[y * MW + x] !== SUELO || GRID[(y - 1) * MW + x] === SUELO) continue;
  for (let k = 1; k <= ALTO_CARA && y - k >= 0; k++) { const j = (y - k) * MW + x; if (GRID[j] !== VACIO) break; GRID[j] = CARA; ZONA_DE[j] = ZONA_DE[y * MW + x]; }
}
// las paredes de frente, agrupadas en tramos seguidos de la misma zona y altura: { zona, x0, x1, y0, y1 } en píxeles
const CARAS = [];
{
  let tramo = null;
  for (let y = 1; y < MH; y++) {
    for (let x = 0; x <= MW; x++) {
      const base = x < MW && GRID[y * MW + x] === SUELO && GRID[(y - 1) * MW + x] === CARA;
      let alto = 0; if (base) while (alto < ALTO_CARA && GRID[(y - 1 - alto) * MW + x] === CARA) alto++;
      const z = base ? ZONA_DE[y * MW + x] : -1;
      if (tramo && (!base || tramo.zi !== z || tramo.alto !== alto)) { tramo.x1 = x * CEL; CARAS.push(tramo); tramo = null; }
      if (base && !tramo) tramo = { zi: z, zona: ZONAS[z], alto, x0: x * CEL, y0: (y - alto) * CEL, y1: y * CEL };
    }
  }
}

// la puerta de Recursos Humanos: cerrada mientras los camaleones se pintan; `abierta` va de 0 a 1 cuando se levanta
const PUERTA = { x: 320, y: 700, w: 80, h: 80, cerrada: true, abierta: 0 };

// de un punto del mundo, qué hay en su casilla
const celdaEn = (x, y) => (x < 0 || y < 0 || x >= ANCHO || y >= ALTO ? VACIO : GRID[((y / CEL) | 0) * MW + ((x / CEL) | 0)]);
const zonaEn = (x, y) => (x < 0 || y < 0 || x >= ANCHO || y >= ALTO ? null : ZONAS[ZONA_DE[((y / CEL) | 0) * MW + ((x / CEL) | 0)]] || null);

/* ---------- muebles: tipo, x (centro) e y (la base, lo más cercano a la cámara), en píxeles. Los dibujos y las medidas, en muebles.js ---------- */
const MUEBLES = [];
const pon = (t, x, y, extra) => MUEBLES.push({ t, x, y, ...extra });
// Cafetería (580..1100 × 100..580): máquinas y la barra de Lola pegadas a la pared de arriba, mesas alrededor del emblema
pon('expendedora', 628, 122, { v: 0 }); pon('expendedora', 676, 122, { v: 1 }); pon('barra', 900, 128); pon('fuente', 1066, 116);
pon('mesa', 690, 250); pon('mesa', 980, 236); pon('mesa', 680, 436); pon('mesa', 1000, 430); pon('mesa', 840, 204);
pon('planta', 600, 568); pon('planta', 1080, 568); pon('papelera', 1010, 114); pon('extintor', 760, 108);
// Oficinas (40..520 × 100..540): dos filas de mesas con su silla, archivadores, fotocopiadora y el cartón del Empleado del Mes
pon('archivador', 64, 120); pon('archivador', 102, 120); pon('maniqui', 196, 108); pon('fuente', 300, 116); pon('fotocopiadora', 462, 130);
for (const [x, y] of [[120, 236], [246, 236], [372, 236], [120, 396], [246, 396], [372, 396]]) { pon('escritorio', x, y, { v: (x + y) % 3 }); pon('silla', x + 4, y + 28); }
pon('planta', 58, 528); pon('papelera', 440, 250); pon('banco', 250, 524); pon('planta', 500, 420);
// La Nube (1160..1640 × 100..500): torres de servidores en la pared y bloques bajos en dos filas
for (const x of [1206, 1250, 1294, 1500, 1544, 1588]) pon('rack', x, 122, { v: x % 3 });
for (const [x, y] of [[1262, 268], [1344, 268], [1462, 268], [1544, 268], [1262, 404], [1344, 404], [1560, 404]]) pon('servidor', x, y, { v: (x >> 3) % 3 });
pon('bidon', 1612, 486, { v: 1 }); pon('bidon', 1186, 474, { v: 1 }); pon('cono', 1404, 336); pon('extintor', 1340, 108); pon('bidon', 1472, 118, { v: 1 });
// Pasillo (400..1280 × 700..820)
pon('banco', 664, 720); pon('planta', 774, 716); pon('extintor', 900, 708); pon('papelera', 1044, 712); pon('expendedora', 1172, 722, { v: 2 }); pon('maniqui', 1236, 708);
pon('planta', 452, 816); pon('cono', 852, 812); pon('bidon', 1250, 814, { v: 0 });
// Recursos Humanos (40..320 × 700..1140)
pon('archivador', 64, 720); pon('archivador', 102, 720); pon('mesajefe', 170, 880); pon('silla', 170, 836);
pon('banco', 96, 1128); pon('banco', 250, 1128); pon('planta', 300, 1010); pon('planta', 60, 1010); pon('papelera', 250, 884);
// Almacén (1340..1640 × 620..1140): estanterías, cajas de juegos cancelados, bidones y la carretilla
pon('estanteria', 1388, 642); pon('caja', 1612, 652, { v: 1 }); pon('bidon', 1564, 640, { v: 2 });
pon('caja', 1404, 868, { v: 0 }); pon('caja', 1452, 874, { v: 1 }); pon('caja', 1602, 770, { v: 2 }); pon('caja', 1606, 812, { v: 0 }); pon('caja', 1380, 1000, { v: 1 });
pon('caja', 1430, 1030, { v: 2 }); pon('caja', 1596, 1010, { v: 0 }); pon('caja', 1560, 1108, { v: 1 }); pon('carretilla', 1500, 940);
pon('bidon', 1618, 900, { v: 0 }); pon('bidon', 1362, 1124, { v: 0 }); pon('bidon', 1392, 1130, { v: 2 }); pon('cono', 1470, 720); pon('cono', 1530, 1050);
// Juegos cerrados (400..1280 × 920..1140): vitrinas con cartuchos y lápidas de los juegos que cerró Microblizz
for (const x of [470, 770, 850, 930, 1210]) pon('vitrina', x, 1004, { v: (x >> 4) % 4 });
[[452, 1104], [530, 1118], [748, 1110], [900, 1122], [1140, 1108], [1226, 1122]].forEach(([x, y], i) => pon('lapida', x, y, { v: i }));
pon('banco', 630, 1128); pon('planta', 420, 942); pon('planta', 1262, 942); pon('extintor', 560, 928);

/* ---------- carteles en las paredes de frente: tipo, x (centro) e y (centro), en píxeles ---------- */
const CARTELES = [
  // Oficinas (pared 40..100)
  { t: 'poster', x: 256, y: 68, color: '#ffcb3d', l1: 'EMPLEADO DEL MES', l2: 'NADIE' },
  { t: 'reloj', x: 150, y: 64 },
  { t: 'poster', x: 404, y: 68, color: '#7cf0ff', l1: 'TRABAJA MÁS', l2: 'COBRA MENOS' },
  // Cafetería
  { t: 'rotulo', x: 906, y: 56, w: 124, color: '#ff7a1a', l1: 'CAFÉ LOLA' },
  { t: 'poster', x: 760, y: 66, color: '#ff7ad8', l1: 'HOY NO HAY', l2: 'DESCANSO' },
  { t: 'poster', x: 1010, y: 66, color: '#7ee04a', l1: 'SONRÍE', l2: 'TE GRABAMOS' },
  // La Nube
  { t: 'rotulo', x: 1398, y: 62, w: 124, color: '#39d5e8', l1: 'LA NUBE', nube: true },
  // Pasillo (pared 640..700): señales y ventanas al espacio
  { t: 'flecha', x: 554, y: 666, color: '#ff4b5c', l1: 'RR. HH.', izq: true },
  { t: 'ventana', x: 664, y: 668, v: 1 }, { t: 'ventana', x: 980, y: 668, v: 2 },
  { t: 'flecha', x: 1092, y: 666, color: '#f2c230', l1: 'ALMACÉN' },
  // Recursos Humanos
  { t: 'rotulo', x: 218, y: 664, w: 186, color: '#ff4b5c', l1: 'RECURSOS HUMANOS' },
  // Almacén (pared 560..620)
  { t: 'poster', x: 1566, y: 586, color: '#f2c230', l1: 'JUEGOS', l2: 'CANCELADOS' },
  // Juegos cerrados (pared 860..920)
  { t: 'placa', x: 840, y: 886, w: 250, l1: 'AQUÍ YACEN TUS JUEGOS FAVORITOS' },
  { t: 'poster', x: 486, y: 888, color: '#cdb9ea', l1: 'SERVIDORES', l2: 'APAGADOS' },
  { t: 'poster', x: 1190, y: 888, color: '#cdb9ea', l1: 'EL DLC', l2: 'NUNCA LLEGÓ' },
];
// lo que pone en las lápidas de los juegos cerrados (dos líneas)
const EPITAFIOS = [['AQUÍ YACE', 'UN MMO'], ['CERRADO', 'POR RECORTES'], ['R.I.P.', 'VERSIÓN 1.0'], ['DESCANSE', 'EN PARCHE'], ['FALTABA', 'UN PASE'], ['R.I.P.', 'MODO HISTORIA']];

// dónde sale cada uno al empezar
const SALIDA_CAMALEONES = [[840, 348], [786, 372], [896, 372], [812, 316], [868, 316], [840, 400]];
const SALIDA_CAZADORES = [[130, 960], [220, 960]];
