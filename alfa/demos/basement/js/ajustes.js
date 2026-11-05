// Fans of Basement · Ajustes: todas las cifras del juego (el pozo del ascensor, el jugador, el café, la caja del despedido, el arma,
// los enemigos de cada planta, el botín, las zonas de la oficina de Microblizz, los jefes, los becarios atrapados, los paquetes,
// el equipo con rareza, las mascotas de oficina y los cursos de la formación de tu mesa).
'use strict';
const AJUSTES = {
  id: 'basement',                 // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-basement',    // la clave de la partida en este navegador
};
var BAS = globalThis.BAS || (globalThis.BAS = {});
BAS.AJ = Object.freeze({
  // El pozo: 360 de ancho (el ancho de la pantalla), paredes a los lados y una planta cada `altoPlanta` unidades hacia abajo.
  ancho: 360, pared: 18, altoPlanta: 380, inicio: 60,
  // El jugador: vel = velocidad con el dedo; deriva = lo que baja solo sin tocar; invul = segundos sin recibir daño tras un golpe.
  jugador: { radio: 13, vel: 125, deriva: 22, invul: 0.8 },
  // El café es el oxígeno: base + lo que den la formación y el equipo. Se gasta cada segundo (más cuanto más abajo) y los golpes lo quitan.
  cafe: { base: 60, gasto: 1, gastoPorPlanta: 0.05, crunch: 1.3, taza: 14 },
  // La caja del despedido: cuánto peso de botín cabe (base + formación y equipo).
  caja: { base: 15 },
  // El arma dispara sola al enemigo más cercano dentro del alcance (base: la formación y el equipo lo mejoran).
  arma: { dano: 10, cadencia: 0.3, alcance: 150, velBala: 560, vidaBala: 0.45, radioBala: 3 },
  // Llamar al ascensor de emergencia: tarda `espera` segundos en llegar y te sube con lo que lleves.
  ascensor: { espera: 3 },
  // Enemigos: desde = primera planta en la que salen; peso = lo a menudo que salen; botin = qué sueltan.
  enemigos: {
    bug: { vida: 20, radio: 12, vel: 40, persigue: 95, golpe: 4, desde: 0, peso: 10, botin: 'codigo', puntos: 1 },
    correo: { vida: 26, radio: 14, vel: 30, persigue: 210, golpe: 3, desde: 2, peso: 6, botin: 'postit', divide: 'miniCorreo', puntos: 2 },
    miniCorreo: { vida: 9, radio: 9, vel: 55, persigue: 210, golpe: 2, desde: 99, peso: 0, botin: null, puntos: 1 },
    reunion: { vida: 70, radio: 24, vel: 18, persigue: 0, golpe: 2, desde: 4, peso: 3, botin: 'taza', frena: 0.45, frenaT: 1.6, puntos: 4 },
  },
  vidaPorPlanta: 0.12,              // cada planta los enemigos tienen un 12 % más de vida
  generar: { tramo: 40, delante: 620, detras: 560, base: 0.3, porPlanta: 0.02, max: 0.9, maxActivos: 45, zonaSegura: 180 },
  // El botín: valor en monedas (sube un 12 % por planta) y peso en la caja. La taza de café no ocupa sitio: rellena el café.
  objetos: {
    codigo: { valor: 3, peso: 1 },
    postit: { valor: 4, peso: 1 },
    taza: { valor: 10, peso: 3 },
    cafe: { valor: 0, peso: 0 },
    paquete: { valor: 0, peso: 0 },        // paquete de mensajería: no ocupa sitio, pero solo cuenta si subes a salvo
    paqueteJefe: { valor: 0, peso: 0 },
  },
  valorPorPlanta: 0.12, probCafe: 0.07, iman: 50, recoge: 18, avisoLlena: 1.5,
  // Las zonas de la oficina, de arriba abajo. crunch = el café se gasta más deprisa.
  zonas: [
    { desde: 0, id: 'marketing', nombre: 'Marketing', fondo: '#f2c46b', pared: '#c98f3d', crunch: false },
    { desde: 5, id: 'soporte', nombre: 'Soporte', fondo: '#7fc4d8', pared: '#3f7f99', crunch: false },
    { desde: 10, id: 'qa', nombre: 'QA', fondo: '#e88a6a', pared: '#a64b35', crunch: true },
    { desde: 15, id: 'servidores', nombre: 'Sala de Servidores', fondo: '#4f6f8f', pared: '#26384c', crunch: true },
  ],
  // Jefes: uno en la última planta de cada zona (4, 9, 14 y 19) y luego cada 5 plantas, en este orden. Mientras vive, una cinta
  // de PRECAUCIÓN cierra el paso a la planta de abajo. cada = segundos entre ataques; escudo = segundos de escudo cada `escudoCada`.
  jefes: {
    orden: ['producto', 'rrhh', 'lanzamiento', 'accionistas'], primera: 4, cada: 5, vidaPorPlanta: 0, vidaPorVuelta: 0.8,
    producto: { nombre: 'Jefe de Producto', vida: 260, radio: 30, vel: 55, golpe: 5, cada: 1.8, bala: { vel: 140, dano: 4, radio: 7 }, escudoCada: 5, escudo: 1.2 },
    rrhh: { nombre: 'Recursos Humanos', vida: 420, radio: 30, vel: 50, golpe: 6, cada: 2.2, bala: { vel: 130, dano: 5, radio: 8 }, abanico: 3 },
    lanzamiento: { nombre: 'El Bug de Lanzamiento', vida: 560, radio: 36, vel: 40, golpe: 7, cada: 3.0, invoca: 2 },
    accionistas: { nombre: 'Consejo de Accionistas', vida: 750, radio: 34, vel: 45, golpe: 6, cada: 2.6, bala: { vel: 110, dano: 5, radio: 7 }, anillo: 8 },
    premio: { tazas: 3 },
  },
  // Becarios atrapados: en cada planta (desde la 1) puede haber uno; al tocarlo te sigue y dispara solo durante la bajada.
  // Si subes a salvo, cada uno te da una propina (sube un 12 % por planta).
  becarios: { prob: 0.4, desde: 1, max: 3, radio: 16, dano: 0.5, cadencia: 0.8, alcance: 130, propina: 8 },
  // Paquetes de mensajería que sueltan las reuniones (a veces) y los jefes (siempre). Solo cuentan si subes a salvo.
  probPaquete: 0.06,
  // Las rarezas, de peor a mejor, con su color.
  rarezas: ['comun', 'raro', 'epico', 'legendario'],
  colorRareza: { comun: '#5fe05f', raro: '#3b8de0', epico: '#ff8a2a', legendario: '#ffe14a' },
  // Los paquetes: probabilidades (en %) de cada rareza y de que salga mascota en vez de equipo. Se enseñan siempre al comprar.
  paquetes: {
    normal: { nombre: 'Paquete de mensajería', coste: 120, rarezas: { comun: 60, raro: 28, epico: 10, legendario: 2 }, mascota: 25 },
    jefe: { nombre: 'Paquete del jefe', coste: null, rarezas: { comun: 0, raro: 50, epico: 38, legendario: 12 }, mascota: 35 },
  },
  repetido: { comun: 10, raro: 25, epico: 60, legendario: 150 },   // monedas por una pieza de equipo repetida
  // El equipo: tres huecos y cuatro piezas por hueco, una por rareza. Los efectos se suman a los de la formación.
  equipo: {
    teclado: {
      comun: { nombre: 'Teclado de membrana', ef: { dano: 0.1 } }, raro: { nombre: 'Teclado mecánico', ef: { dano: 0.2 } },
      epico: { nombre: 'Teclado RGB', ef: { dano: 0.35, cadencia: 0.1 } }, legendario: { nombre: 'Teclado del CEO', ef: { dano: 0.6, cadencia: 0.2 } } },
    auriculares: {
      comun: { nombre: 'Auriculares con cable', ef: { cafe: 10 } }, raro: { nombre: 'Auriculares inalámbricos', ef: { cafe: 20 } },
      epico: { nombre: 'Cancelación de ruido', ef: { cafe: 35, freno: 0.5 } }, legendario: { nombre: 'Auriculares de oro', ef: { cafe: 60, freno: 1 } } },
    silla: {
      comun: { nombre: 'Silla de plástico', ef: { vel: 0.05, caja: 2 } }, raro: { nombre: 'Silla con ruedas', ef: { vel: 0.1, caja: 4 } },
      epico: { nombre: 'Silla ergonómica', ef: { vel: 0.17, caja: 7 } }, legendario: { nombre: 'Trono gamer', ef: { vel: 0.3, caja: 12 } } },
  },
  // Las mascotas de oficina: una por rareza. Te acompañan y disparan solas; repetida, sube de nivel (+20 % de daño por nivel).
  mascotas: {
    pato: { nombre: 'Pato de goma', rareza: 'comun', dano: 5, cadencia: 1.1, alcance: 140 },
    gato: { nombre: 'Gato del servidor', rareza: 'raro', dano: 8, cadencia: 0.9, alcance: 150 },
    roomba: { nombre: 'Roomba con láser', rareza: 'epico', dano: 14, cadencia: 0.8, alcance: 170 },
    dron: { nombre: 'Dron de pizza', rareza: 'legendario', dano: 18, cadencia: 0.7, alcance: 190, cafeCada: 20 },
  },
  nivelMascota: { max: 5, dano: 0.2 },
  // La formación (tablero Kanban): tres columnas de cursos que se compran en orden, de arriba abajo.
  // Efectos: cafe/caja/alcance/iman/taza = se suman; dano/vel/valor = % más; cadencia/gasto/crunch = % menos; espera = segundos menos;
  // multi = una grapa más por disparo; freno = cuánto menos te frenan las reuniones (1 = nada).
  columnas: ['bienestar', 'logistica', 'productividad'],
  nombreColumna: { bienestar: 'BIENESTAR', logistica: 'LOGÍSTICA', productividad: 'PRODUCTIVIDAD' },
  formacion: [
    { id: 'mindfulness', col: 'bienestar', nombre: 'Mindfulness en el baño', coste: 20, ef: { cafe: 15 } },
    { id: 'barista', col: 'bienestar', nombre: 'Curso de barista', coste: 50, ef: { cafe: 15, taza: 6 } },
    { id: 'siesta', col: 'bienestar', nombre: 'Siesta estratégica', coste: 120, ef: { cafe: 20 } },
    { id: 'pulmones', col: 'bienestar', nombre: 'Pulmones de becario', coste: 260, ef: { gasto: 0.1 } },
    { id: 'cafetera', col: 'bienestar', nombre: 'Cafetera industrial', coste: 500, ef: { cafe: 30 } },
    { id: 'inmune', col: 'bienestar', nombre: 'Inmune al crunch', coste: 900, ef: { crunch: 0.5 } },
    { id: 'intravenoso', col: 'bienestar', nombre: 'Café intravenoso', coste: 1500, ef: { cafe: 40 } },
    { id: 'tetris', col: 'logistica', nombre: 'Tetris de mudanzas', coste: 20, ef: { caja: 6 } },
    { id: 'doblefondo', col: 'logistica', nombre: 'Caja de doble fondo', coste: 50, ef: { caja: 6 } },
    { id: 'iman', col: 'logistica', nombre: 'Imán de nevera', coste: 120, ef: { iman: 25 } },
    { id: 'carro', col: 'logistica', nombre: 'Carro de la compra', coste: 260, ef: { caja: 10 } },
    { id: 'expres', col: 'logistica', nombre: 'Ascensor exprés', coste: 500, ef: { espera: 1 } },
    { id: 'contenedor', col: 'logistica', nombre: 'Contenedor de obra', coste: 900, ef: { caja: 15 } },
    { id: 'tasador', col: 'logistica', nombre: 'Tasador experto', coste: 1500, ef: { valor: 0.25 } },
    { id: 'excel', col: 'productividad', nombre: 'Excel avanzado', coste: 25, ef: { dano: 0.2 } },
    { id: 'titanio', col: 'productividad', nombre: 'Grapas de titanio', coste: 55, ef: { dano: 0.2 } },
    { id: 'atajos', col: 'productividad', nombre: 'Atajos de teclado', coste: 125, ef: { cadencia: 0.15 } },
    { id: 'punteria', col: 'productividad', nombre: 'Puntería de becario', coste: 265, ef: { alcance: 30 } },
    { id: 'doble', col: 'productividad', nombre: 'Grapadora doble', coste: 505, ef: { multi: 1 } },
    { id: 'horasextra', col: 'productividad', nombre: 'Horas extra', coste: 905, ef: { dano: 0.3 } },
    { id: 'industrial', col: 'productividad', nombre: 'Grapadora industrial', coste: 1505, ef: { dano: 0.4 } },
  ],
});
