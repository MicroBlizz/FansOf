// Fans Of Paperwork · AJUSTES: todas las cifras del juego en un sitio (economía, curvas, tiempos). Las fija la simulación de ritmo
// (tests/paperwork/integracion/ritmo.test.mjs): si cambias una, vuelve a pasarla. Qué es cada cosa: docs/paperwork/PLAN.md.
'use strict';
// lo que core pide a todo juego (core/js/sistema/ligero.js): sin `id` a propósito, así la cuenta de core queda apagada y la partida del
// prototipo vive solo en este navegador
const AJUSTES = { id: '', nombre: 'Fans Of Paperwork', guardado: 'for-paperwork-v1', sinFeedback: true };
PW.AJ = {
  version: '0.4.1',
  // bajar: las veces que el modo auto puede pedir limpiar una planta antes de bajar (0 = quedarse en ella)
  planta: { bajar: [0, 1, 3, 5, 10], columnas: 6, filas: 4, limpia: 0.7, plantasPorPar: 4, plantasPorZona: 16, extraSinFin: 1.15 },
  documento: { vida0: 10, vidaBase: 2.5, valor0: 1, valorBase: 2.4, receta0: 2 },
  lider: { vistazosSeg: 1.2, toqueMulti: 1 },
  // los útiles del líder, pagados con oro: coste = base · factor^nivel. Los guantes multiplican la dureza por paso^nivel
  utiles: {
    gafas: { base: 4, factor: 1.13, max: 400 },
    cafe: { base: 60, factor: 1.55, max: 15, paso: 0.08 },
    carrito: { base: 150, factor: 1.7, max: 10, paso: 0.06 },
    guantes: { base: 30, factor: 1.35, max: 60, paso: 0.85 },
    fundas: { base: 4000, factor: 3, max: 5, paso: 0.1 },
  },
  // la dureza del papel: lo que cada tipo de documento resta a cada vistazo. Los `desde` primeros no tienen; desde ahí, base0 · base^n
  // (y sigue creciendo en las plantas sin fin). Un vistazo nunca baja de `minimo` de su lectura
  dureza: { desde: 2, base0: 20, base: 2, minimo: 0.1 },
  // la herramienta de cada zona: quita dureza a los documentos de su zona (paso^nivel); su coste se multiplica por porZona en cada zona
  herramienta: { base: 40, factor: 2, max: 6, paso: 0.75, porZona: 30 },
  // los sellos que puede traer un archivador al vaciarlo (probabilidades base y lo que dan)
  sellos: { confidencial: 0.05, confidencialMulti: 3, secretoMulti: 3, urgente: 0.05, urgenteMulti: 3, urgenteDura: 60, urgentesMax: 3, caducado: 0.08 },
  // el papel mojado: los expedientes de la última zona se venden a `parte` de su precio; cada nivel de fundas de plástico suma utiles.fundas.paso
  mojado: { parte: 0.5 },
  // la carta de recomendación que se elige tras un Despido (dominio/cartas.js): cuántas se ofrecen y lo que da cada una (termo: segundos de café doble;
  // guantes: niveles que suma; planta: plantas que baja; oro: por cada nivel de la Trituradora más uno; lacre: parte de sello confidencial)
  cartas: { ofrece: 3, termo: 600, guantes: 5, planta: 10, oro: 300, lacre: 0.1 },
  // los pedidos del CEO (un correo puede traer uno): vaciar `minimo` archivadores o más (lo que el equipo vacía en `plazo` segundos, por
  // `apuro`) antes de que acabe el plazo. Cumplirlo paga premioSegundos de oro y un cofre; fallarlo quita `sancion` de la próxima Indemnización
  pedido: { prob: 0.3, plazo: 45, minimo: 6, apuro: 1.2, premioSegundos: 60, sancion: 0.1, sancionMax: 0.3 },
  // la auditoría de IAhorro: cada `cada` plantas precinta `precintos` archivadores durante `plazo` segundos; vaciados a tiempo dan `multi`
  // veces sus documentos, y los que queden se los lleva
  auditoria: { cada: 8, precintos: 4, plazo: 45, multi: 3 },
  // la fotocopiadora (nodo del plan): el tipo de documento elegido sale `multi` veces
  fotocopia: { multi: 2 },
  // la mejora de cada documento, pagada con expedientes de ese documento
  mejoraDocumento: { base: 4, factor: 1.18, max: 25 },
  xp: { base: 10, factor: 1.16, topeBase: 30, topePorNivelTrituradora: 5 },
  estanteria: { recarga: 60, multi: 8 },
  especiales: { jefe: 0.04, jefeMulti: 3, ceo: 0, ceoMulti: 10, repleto: 0.04, repletoMulti: 3 },
  clasificado: { x2: 0.05, x3: 0 },
  // la Trituradora: lo que le cabe (capacidad) y lo que traga sin enterarse (tragaderas); en un intento come bocadosSeg documentos por segundo:
  // sin munición el atasco vale sinMunicion, con caducados 1 y con expedientes del documento i, 1 + porDocumento · (i + 1)
  trituradora: { niveles: 10, capacidad0: 80000, capacidadBase: 3.2, tragaderas0: 2, tragaderasBase: 2.6, intento: 30, espera: 1200, premioOro: 200,
    bocadosSeg: 2, sinMunicion: 0.25, caducado: 1, porDocumento: 0.25 },
  despido: { base: 12, factor: 1.084, desde: 10 },
  recuerdo: { base: 8, factor: 1.6, max: 20 },
  especialidad: { umbrales: [40, 400, 4000], vida: [1, 0.9, 0.8, 0.65], premio: [1, 1.1, 1.2, 1.35] },
  trabajador: { parteDelLider: 0.3, vistazosSeg: 0.8 },
  // las manías de los trabajadores (dominio/equipo.js): StreamKing lee `directo` veces si has tocado en los últimos directoSeg; NecroLord
  // dobla lo que saca con probabilidad `renacer`; EpicChampion gana `heroe` veces la experiencia; MemeLord lee de 0 a rngMax veces; ProGamer
  // va `apm` veces más rápido; el Vikingo lee `nostalgia` veces en la última zona; el Becario va a becarioVel y suma becarioSello de confidencial
  manias: { directoSeg: 5, directo: 2, renacer: 0.2, heroe: 3, rngMax: 3, apm: 1.5, nostalgia: 2, becarioVel: 0.5, becarioSello: 0.15 },
  cofre: { medidor: 120, guardaMax: 10, duracion: 60 },
  correo: { cadaMin: 35, cadaExtra: 30, vuelo: 7, premioSegundos: 25, cofre: 0.2 },
  sindicato: { cada: 600, guardaMax: 3, premioSegundos: 90 },
  horasExtra: { parte: 0.25, topeHoras: 12 },
  carreraPuntos: { porNivelTrituradora: 1, cadaNiveles: 10 },
};
// Un idle no tiene «fuera de partida»: para core (la etiqueta «Prototipo» del borde, el sitio de los avisos) se está jugando siempre menos
// con las opciones abiertas, que es donde se ve la etiqueta sin tapar los botones.
function enPartida() { return !!PW.ui && PW.ui.pestana !== 'opciones'; }
