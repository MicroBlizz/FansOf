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
  jugador: { radio: 15, vel: 125, deriva: 22, invul: 0.8 },
  // El café es el oxígeno: base + lo que den la formación y el equipo. Se gasta cada segundo (más cuanto más abajo) y los golpes lo quitan.
  cafe: { base: 60, gasto: 1, crunch: 1.3, taza: 14 },
  // La caja del despedido: cuánto peso de botín cabe (base + formación y equipo).
  caja: { base: 15 },
  // El arma dispara sola al enemigo más cercano dentro del alcance (base: la formación y el equipo lo mejoran).
  arma: { dano: 10, cadencia: 0.3, alcance: 150, velBala: 560, vidaBala: 0.45, radioBala: 3 },
  // Llamar al ascensor de emergencia: tarda `espera` segundos en llegar y te sube con lo que lleves.
  ascensor: { espera: 3 },
  // Enemigos: desde = primera planta en la que salen; peso = lo a menudo que salen; botin = qué sueltan.
  enemigos: {
    bug: { vida: 20, radio: 17, vel: 40, persigue: 95, golpe: 4, desde: 0, peso: 10, botin: 'codigo', puntos: 1 },
    correo: { vida: 26, radio: 17, vel: 30, persigue: 210, golpe: 3, desde: 2, peso: 6, botin: 'postit', divide: 'miniCorreo', puntos: 2 },
    miniCorreo: { vida: 9, radio: 11, vel: 55, persigue: 210, golpe: 2, desde: 99, peso: 0, botin: null, puntos: 1 },
    reunion: { vida: 70, radio: 26, vel: 18, persigue: 0, golpe: 2, desde: 4, peso: 3, botin: 'taza', frena: 0.45, frenaT: 1.6, puntos: 4 },
    // los raros (catálogo): salen poco; raro = probabilidad por tramo; solo = la única zona donde salen
    dorado: { vida: 30, radio: 17, vel: 75, persigue: 0, huye: 170, golpe: 0, desde: 3, peso: 0, raro: 0.012, botin: 'codigo', botinX: 10, puntos: 10 },
    spam: { vida: 22, radio: 17, vel: 95, persigue: 260, golpe: 3, desde: 5, peso: 0, raro: 0.035, solo: 'soporte', botin: 'paquete', puntos: 5 },
    critico: { vida: 220, radio: 28, vel: 30, persigue: 120, golpe: 8, desde: 10, peso: 0, raro: 0.035, solo: 'qa', botin: 'taza', botinX: 3, puntos: 8 },
  },
  // el catálogo de bichos: monedas la primera vez que tumbas cada uno; completo, 3 paquetes del jefe
  catalogo: { premio: { normal: 20, raro: 150, jefe: 100 }, completo: 3 },
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
  probCafe: 0.07, iman: 50, recoge: 22, avisoLlena: 1.5,
  // La campaña: cinco departamentos de cinco plantas y, al vencer al CEO, el Código Legacy de 2004, que no tiene fondo.
  // dif = lo duros que son los enemigos y los jefes (vida), lo que quitan sus golpes, lo que se gasta el café y lo que vale el botín (pared suave: cada
  // departamento se puede pasar con lo que da el anterior); dentro de la zona sube un poco por planta (porPlanta) y en el Legacy
  // sigue subiendo sin parar (sinFin). crunch = el café se gasta más deprisa. truco = lo que hace distinta a la zona (campana.js).
  zonas: [
    { desde: 0, id: 'marketing', nombre: 'Marketing', img: 'fondo-estudios', pared: '#c98f3d', crunch: false, truco: null, dif: { vida: 1, gasto: 1, valor: 1, golpe: 1 } },
    { desde: 5, id: 'soporte', nombre: 'Soporte', img: 'fondo-oficinas', pared: '#3f7f99', crunch: false, truco: 'tickets', dif: { vida: 1.7, gasto: 1.15, valor: 1.6, golpe: 1.3 } },
    { desde: 10, id: 'qa', nombre: 'QA', img: 'fondo-lan', pared: '#a64b35', crunch: true, truco: 'bugs', dif: { vida: 2.8, gasto: 1.25, valor: 2.5, golpe: 1.6 } },
    { desde: 15, id: 'servidores', nombre: 'Sala de Servidores', img: 'fondo-servidores', pared: '#26384c', crunch: true, truco: 'apagon', dif: { vida: 4.4, gasto: 1.35, valor: 3.8, golpe: 2 } },
    { desde: 20, id: 'direccion', nombre: 'Dirección', img: 'fondo-sede', pared: '#8a6a1a', crunch: true, truco: 'urgente', dif: { vida: 6.5, gasto: 1.45, valor: 5.5, golpe: 2.4 } },
    { desde: 25, id: 'legacy', nombre: 'Código Legacy de 2004', img: 'fondo-servidores', filtro: 'sepia(0.9) hue-rotate(60deg)', pared: '#3a4a2a', crunch: true, truco: 'todo',
      dif: { vida: 9, gasto: 1.55, valor: 8, golpe: 2.8 }, sinFin: { vida: 0.08, gasto: 0.012, valor: 0.1, golpe: 0.02 } },
  ],
  difPorPlanta: { vida: 0.05, gasto: 0.02, valor: 0.05, golpe: 0.02 },
  final: 24,                        // la planta del CEO: al vencerlo, el servidor queda arreglado
  // Los trucos de cada zona. tickets: los correos que caes a veces se reabren; bugs: los bugs a veces se duplican al caer;
  // apagon: cada `cada` segundos se va la luz `dura` segundos (solo ves alrededor tuyo); urgente: todos los bichos van más rápido.
  trucos: { tickets: { prob: 0.35 }, bugs: { prob: 0.35 }, apagon: { cada: 11, dura: 3.5, radio: 95 }, urgente: { vel: 1.3 } },
  // Eventos de planta: al entrar en una planta (desde la 2, nunca en la de un jefe) a veces pasa algo. apagon: se va la luz en esa
  // planta; cafe: una máquina de café con varias tazas; auditoria: el botín de esa planta vale el doble pero el ascensor no llega
  // mientras estés en ella; paquete: un paquete de mensajería guardado por reuniones.
  eventosPlanta: { prob: 0.3, desde: 2, tipos: { apagon: 3, cafe: 3, auditoria: 2, paquete: 2 }, tazas: 3, valorAuditoria: 2, guardias: 3 },
  // Jefes: uno en la última planta de cada zona (4, 9, 14 y 19) y luego cada 5 plantas, en este orden. Mientras vive, una cinta
  // de PRECAUCIÓN cierra el paso a la planta de abajo. cada = segundos entre ataques; escudo = segundos de escudo cada `escudoCada`.
  jefes: {
    orden: ['producto', 'rrhh', 'lanzamiento', 'accionistas', 'ceo'], primera: 4, cada: 5, vidaPorVuelta: 0.8, vidaPorRango: 0.6,
    producto: { nombre: 'La Directora de Producto', vida: 260, radio: 44, vel: 55, golpe: 5, cada: 1.8, bala: { vel: 140, dano: 4, radio: 7 }, escudoCada: 5, escudo: 1.2 },
    rrhh: { nombre: 'SurvivalBot de Recursos Humanos', vida: 420, radio: 46, vel: 50, golpe: 6, cada: 2.2, bala: { vel: 130, dano: 5, radio: 8 }, abanico: 3 },
    lanzamiento: { nombre: 'ServidorBot del Lanzamiento', vida: 560, radio: 46, vel: 40, golpe: 7, cada: 3.0, invoca: 2 },
    accionistas: { nombre: 'El Presidente del Consejo', vida: 750, radio: 50, vel: 45, golpe: 6, cada: 2.6, bala: { vel: 110, dano: 5, radio: 7 }, anillo: 8 },
    ceo: { nombre: 'El CEO', vida: 1100, radio: 50, vel: 50, golpe: 8, cada: 2.0, bala: { vel: 135, dano: 6, radio: 8 }, abanico: 5, invoca: 2 },
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
  // Los paquetes: probabilidades (en %) de cada rareza y de que salga mascota o arma en vez de equipo. Se enseñan siempre al comprar.
  paquetes: {
    normal: { nombre: 'Paquete de mensajería', coste: 120, rarezas: { comun: 60, raro: 28, epico: 10, legendario: 2 }, mascota: 20, arma: 15 },
    jefe: { nombre: 'Paquete del jefe', coste: null, rarezas: { comun: 0, raro: 50, epico: 38, legendario: 12 }, mascota: 30, arma: 25 },
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
  // Las armas: la grapadora la tienes siempre; las otras salen de los paquetes (una por rareza) y repetidas suben de nivel.
  // dano y cadencia multiplican los de la grapadora; balas/abanico = varias a la vez; atraviesa = a cuántos pasa; area = explota;
  // rebotes = salta a otro bicho cercano; alcance = multiplica el alcance (dispara solo si está así de cerca); lento = frena al
  // bicho tocado (factor y segundos); rafaga = balas una detrás de otra (cada `entre` s); circulo = en todas direcciones;
  // directo = el golpe cae en el sitio del blanco al momento; cafe = café que te devuelve cada bicho que tumba.
  // Del paquete sale una al azar entre las de la rareza que toca.
  armas: {
    grapadora: { nombre: 'Grapadora', rareza: null, dano: 1, cadencia: 1 },
    clips: { nombre: 'Lanzaclips', rareza: 'comun', dano: 0.55, cadencia: 1, balas: 3, abanico: 0.28 },
    cinta: { nombre: 'Cinta adhesiva', rareza: 'comun', dano: 0.7, cadencia: 1.1, lento: [0.45, 1.8] },
    perforadora: { nombre: 'Perforadora', rareza: 'comun', dano: 0.35, cadencia: 1.1, balas: 5, abanico: 0.75, vel: 0.85 },
    abrecartas: { nombre: 'Abrecartas', rareza: 'comun', dano: 0.8, cadencia: 1.15, vel: 1.4, atraviesa: 4 },
    boli: { nombre: 'Bolígrafo de clic', rareza: 'comun', dano: 0.36, cadencia: 0.38 },
    taladro: { nombre: 'Taladro', rareza: 'raro', dano: 1.2, cadencia: 1.35, atraviesa: 3 },
    impresora: { nombre: 'Impresora', rareza: 'raro', dano: 0.6, cadencia: 1.5, rafaga: 4, entre: 0.07 },
    trituradora: { nombre: 'Trituradora', rareza: 'raro', dano: 0.75, cadencia: 1.4, balas: 6, abanico: 1.1, alcance: 0.6, vel: 0.8 },
    router: { nombre: 'Router wifi', rareza: 'raro', dano: 0.55, cadencia: 1.3, balas: 8, circulo: true, vel: 0.7 },
    extintor: { nombre: 'Extintor', rareza: 'epico', dano: 1.4, cadencia: 1.6, vel: 0.55, area: 55 },
    laser: { nombre: 'Puntero láser', rareza: 'epico', dano: 0.42, cadencia: 0.3, vel: 2.6, atraviesa: 2 },
    sello: { nombre: 'Sello de APROBADO', rareza: 'epico', dano: 3.2, cadencia: 3, directo: true, area: 70 },
    proyector: { nombre: 'Proyector', rareza: 'epico', dano: 0.6, cadencia: 1.2, balas: 3, abanico: 0.5, lento: [0.5, 1.2], alcance: 0.85 },
    raton: { nombre: 'Ratón inalámbrico', rareza: 'legendario', dano: 1, cadencia: 0.9, rebotes: 3 },
    taza: { nombre: 'Taza lanzacafé', rareza: 'legendario', dano: 1.1, cadencia: 0.8, atraviesa: 2, cafe: 1.5 },
    industrial: { nombre: 'Grapadora industrial', rareza: 'legendario', dano: 1.7, cadencia: 1.15, atraviesa: 2, rebotes: 2 },
  },
  nivelArma: { max: 5, dano: 0.15 },
  // Las ventajas que se eligen (1 de 3) al entrar en cada zona: solo valen para esa bajada.
  ventajas: [
    { id: 'cafeinado', nombre: 'Cafeinado', ef: { cafe: 25 } },
    { id: 'furia', nombre: 'Furia de lunes', ef: { dano: 0.25 } },
    { id: 'turbo', nombre: 'Dedos rápidos', ef: { cadencia: 0.2 } },
    { id: 'iman', nombre: 'Imán de bolsillo', ef: { iman: 40 } },
    { id: 'mochila', nombre: 'Bolsa extra', ef: { caja: 8 } },
    { id: 'blindaje', nombre: 'Chaleco de RR. HH.', ef: { blindaje: 0.3 } },
    { id: 'avaricia', nombre: 'Avaricia', ef: { valor: 0.25 } },
    { id: 'termo', nombre: 'Termo', ef: { gasto: 0.2 } },
    { id: 'rebote', nombre: 'Grapas saltarinas', ef: { rebote: 1 } },
    { id: 'llamada', nombre: 'Enchufe en mantenimiento', ef: { espera: 1 } },
  ],
  // El ascenso: al arreglar el servidor (vencer al CEO) puedes ascender. Empiezas otra vez la campaña (los jefes vuelven a dar
  // su paquete) con lo que tenías y un cargo más: más daño y botín para siempre, pero bichos y jefes más duros.
  rangos: ['Becario', 'Junior', 'Senior', 'Jefe de equipo', 'Director', 'Vicepresidente', 'CEO'],
  porRango: { dano: 0.1, valor: 0.15, vida: 0.4 },
  // El aspecto del becario: con cuántos cursos hechos de una columna se nota (primer y segundo dibujo).
  aspecto: { formacion: [4, 7] },
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
